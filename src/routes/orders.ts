import { Hono } from 'hono';
import { authMiddleware, managerPlus } from '../middleware/auth';
import { getOrderWithDetails, logAudit, createNotification } from '../utils/db';
import type { Bindings, PaginationResult, OrderWithDetails } from '../types';

const orders = new Hono<{ Bindings: Bindings }>();

// Get orders list
orders.get('/', authMiddleware, managerPlus, async (c) => {
  try {
    const { 
      status, 
      supplier_id,
      date_from,
      date_to,
      page = '1', 
      limit = '20',
      sort = 'created_at',
      order = 'desc'
    } = c.req.query();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    let params: any[] = [];

    if (status) {
      whereConditions.push('o.status = ?');
      params.push(status);
    }

    if (supplier_id) {
      whereConditions.push('o.supplier_id = ?');
      params.push(parseInt(supplier_id));
    }

    if (date_from) {
      whereConditions.push('DATE(o.order_date) >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('DATE(o.order_date) <= ?');
      params.push(date_to);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `;
    
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ total: number }>();
    
    const total = countResult?.total || 0;

    // Get paginated results
    const dataQuery = `
      SELECT 
        o.*,
        r.total_amount,
        r.requester_id,
        u.name as requester_name,
        s.name as supplier_name
      FROM orders o
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      ${whereClause}
      ORDER BY o.${sort} ${order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const dataResult = await c.env.DB.prepare(dataQuery)
      .bind(...params, parseInt(limit), offset)
      .all();

    const response: PaginationResult<any> = {
      data: dataResult.results.map(ord => ({
        ...ord,
        request: {
          id: ord.request_id,
          total_amount: ord.total_amount,
          requester: {
            id: ord.requester_id,
            name: ord.requester_name
          }
        },
        supplier: ord.supplier_name ? {
          id: ord.supplier_id,
          name: ord.supplier_name
        } : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit)),
        has_next: offset + parseInt(limit) < total,
        has_prev: parseInt(page) > 1
      }
    };

    return c.json(response);

  } catch (error) {
    console.error('Get orders error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch orders'
    }, 500);
  }
});

// Get specific order
orders.get('/:id', authMiddleware, managerPlus, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid order ID'
      }, 400);
    }

    const order = await getOrderWithDetails(c.env.DB, id);
    if (!order) {
      return c.json({
        error: 'Not Found',
        message: 'Order not found'
      }, 404);
    }

    return c.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch order'
    }, 500);
  }
});

// Update order
orders.put('/:id', authMiddleware, managerPlus, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid order ID'
      }, 400);
    }

    // Get current order
    const currentOrder = await getOrderWithDetails(c.env.DB, id);
    if (!currentOrder) {
      return c.json({
        error: 'Not Found',
        message: 'Order not found'
      }, 404);
    }

    // Build update query
    const updates = [];
    const params = [];

    if (body.supplier_id !== undefined) {
      updates.push('supplier_id = ?');
      params.push(body.supplier_id);
    }

    if (body.expected_delivery !== undefined) {
      updates.push('expected_delivery = ?');
      params.push(body.expected_delivery);
    }

    if (body.status !== undefined) {
      if (!['pending', 'sent', 'confirmed', 'delivered', 'completed'].includes(body.status)) {
        return c.json({
          error: 'Validation Error',
          message: 'Invalid status'
        }, 400);
      }
      updates.push('status = ?');
      params.push(body.status);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      params.push(body.notes);
    }

    if (updates.length === 0) {
      return c.json({
        error: 'Bad Request',
        message: 'No valid fields to update'
      }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();

    // If status changed to delivered, update request status
    if (body.status === 'delivered') {
      await c.env.DB.prepare('UPDATE requests SET status = ? WHERE id = ?')
        .bind('delivered', currentOrder.request_id)
        .run();
    }

    if (body.status === 'completed') {
      await c.env.DB.prepare('UPDATE requests SET status = ? WHERE id = ?')
        .bind('completed', currentOrder.request_id)
        .run();
    }

    // Log audit
    await logAudit(
      c.env.DB,
      'order',
      id,
      'updated',
      user.userId,
      { 
        supplier_id: currentOrder.supplier_id,
        status: currentOrder.status,
        expected_delivery: currentOrder.expected_delivery
      },
      body
    );

    // If order was sent to supplier, notify requester
    if (body.status === 'sent') {
      await createNotification(
        c.env.DB,
        currentOrder.request?.requester_id!,
        'order_sent',
        'Užsakymas išsiųstas tiekėjui',
        `Jūsų prašymo užsakymas ${currentOrder.po_number} buvo išsiųstas tiekėjui`,
        'order',
        id
      );
    }

    const updatedOrder = await getOrderWithDetails(c.env.DB, id);
    return c.json(updatedOrder);

  } catch (error) {
    console.error('Update order error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to update order'
    }, 500);
  }
});

export default orders;