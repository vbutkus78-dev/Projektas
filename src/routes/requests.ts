import { Hono } from 'hono';
import { authMiddleware, managerPlus } from '../middleware/auth';
import { getRequestWithDetails, logAudit, createNotification, updateRequestTotal } from '../utils/db';
import { canAccessRequest } from '../utils/auth';
import { createEmailService } from '../utils/email';
import type { 
  Bindings, 
  CreateRequestRequest, 
  ApprovalRequest,
  PaginationResult,
  RequestWithDetails
} from '../types';

const requests = new Hono<{ Bindings: Bindings }>();

// Get requests list with filters and pagination
requests.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { 
      status, 
      department, 
      requester_id,
      date_from,
      date_to,
      page = '1', 
      limit = '20',
      sort = 'created_at',
      order = 'desc'
    } = c.req.query();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause based on user role and filters
    let whereConditions = [];
    let params: any[] = [];

    // Role-based filtering
    if (user.role === 'employee') {
      whereConditions.push('r.requester_id = ?');
      params.push(user.userId);
    }

    // Status filter
    if (status) {
      whereConditions.push('r.status = ?');
      params.push(status);
    }

    // Department filter
    if (department) {
      whereConditions.push('r.department = ?');
      params.push(department);
    }

    // Requester filter (for managers/admins)
    if (requester_id && user.role !== 'employee') {
      whereConditions.push('r.requester_id = ?');
      params.push(parseInt(requester_id));
    }

    // Date filters
    if (date_from) {
      whereConditions.push('DATE(r.created_at) >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('DATE(r.created_at) <= ?');
      params.push(date_to);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM requests r
      ${whereClause}
    `;
    
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ total: number }>();
    
    const total = countResult?.total || 0;

    // Get paginated results
    const dataQuery = `
      SELECT r.*, u.name as requester_name, u.department as requester_department
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      ${whereClause}
      ORDER BY r.${sort} ${order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const dataResult = await c.env.DB.prepare(dataQuery)
      .bind(...params, parseInt(limit), offset)
      .all();

    const response: PaginationResult<any> = {
      data: dataResult.results.map(req => ({
        ...req,
        requester: {
          id: req.requester_id,
          name: req.requester_name,
          department: req.requester_department
        }
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
    console.error('Get requests error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch requests'
    }, 500);
  }
});

// Get specific request
requests.get('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid request ID'
      }, 400);
    }

    const request = await getRequestWithDetails(c.env.DB, id);
    if (!request) {
      return c.json({
        error: 'Not Found',
        message: 'Request not found'
      }, 404);
    }

    // Check permissions
    if (!canAccessRequest(user.role, user.userId, request.requester_id)) {
      return c.json({
        error: 'Forbidden',
        message: 'You do not have permission to view this request'
      }, 403);
    }

    return c.json(request);

  } catch (error) {
    console.error('Get request error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch request'
    }, 500);
  }
});

// Create new request
requests.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json<CreateRequestRequest>();

    // Validate request data
    if (!body.department || !body.lines || body.lines.length === 0) {
      return c.json({
        error: 'Validation Error',
        message: 'Department and at least one line item are required'
      }, 400);
    }

    // Validate line items
    for (const line of body.lines) {
      if (!line.item_name || line.quantity <= 0) {
        return c.json({
          error: 'Validation Error',
          message: 'All line items must have a name and positive quantity'
        }, 400);
      }
    }

    // Create request
    const requestResult = await c.env.DB.prepare(`
      INSERT INTO requests (requester_id, department, priority, justification, needed_by_date)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.userId,
      body.department,
      body.priority || 'normal',
      body.justification || null,
      body.needed_by_date || null
    ).run();

    const requestId = requestResult.meta.last_row_id as number;

    // Create request lines
    for (const line of body.lines) {
      const totalPrice = line.unit_price ? line.quantity * line.unit_price : null;
      
      await c.env.DB.prepare(`
        INSERT INTO request_lines (request_id, item_name, category_id, quantity, unit, unit_price, total_price, supplier_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        requestId,
        line.item_name,
        line.category_id || null,
        line.quantity,
        line.unit || 'vnt.',
        line.unit_price || null,
        totalPrice,
        line.supplier_id || null,
        line.notes || null
      ).run();
    }

    // Update total amount
    await updateRequestTotal(c.env.DB, requestId);

    // Log audit
    await logAudit(
      c.env.DB,
      'request',
      requestId,
      'created',
      user.userId,
      null,
      { department: body.department, priority: body.priority },
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    // Get the created request with details
    const createdRequest = await getRequestWithDetails(c.env.DB, requestId);
    
    return c.json(createdRequest, 201);

  } catch (error) {
    console.error('Create request error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to create request'
    }, 500);
  }
});

// Submit request for review
requests.post('/:id/submit', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid request ID'
      }, 400);
    }

    const request = await getRequestWithDetails(c.env.DB, id);
    if (!request) {
      return c.json({
        error: 'Not Found',
        message: 'Request not found'
      }, 404);
    }

    // Check permissions (only requester can submit)
    if (request.requester_id !== user.userId) {
      return c.json({
        error: 'Forbidden',
        message: 'Only the requester can submit this request'
      }, 403);
    }

    // Check current status
    if (request.status !== 'draft') {
      return c.json({
        error: 'Bad Request',
        message: 'Only draft requests can be submitted'
      }, 400);
    }

    // Update status
    await c.env.DB.prepare('UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind('submitted', id)
      .run();

    // Log audit
    await logAudit(
      c.env.DB,
      'request',
      id,
      'submitted',
      user.userId,
      { status: 'draft' },
      { status: 'submitted' }
    );

    // Create notifications for managers
    const managers = await c.env.DB.prepare("SELECT id, email, name FROM users WHERE role = 'manager' AND active = 1").all();
    
    for (const manager of managers.results) {
      await createNotification(
        c.env.DB,
        manager.id as number,
        'request_submitted',
        'Naujas prašymas peržiūrai',
        `${user.email} pateikė naują prašymą #${id}`,
        'request',
        id
      );
    }
    
    // Send email notifications to managers
    const emailService = createEmailService(c.env);
    if (emailService) {
      const appUrl = c.env.APP_URL || 'https://your-app.pages.dev';
      for (const manager of managers.results) {
        try {
          await emailService.sendRequestStatusNotification(
            manager.email as string,
            manager.name as string,
            id,
            'submitted',
            `Darbuotojas ${user.name} pateikė naują prašymą peržiūrai.`,
            appUrl
          );
        } catch (error) {
          console.error('Failed to send email to manager:', error);
        }
      }
    }

    const updatedRequest = await getRequestWithDetails(c.env.DB, id);
    return c.json(updatedRequest);

  } catch (error) {
    console.error('Submit request error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to submit request'
    }, 500);
  }
});

// Approve or reject request (manager/supervisor)
requests.post('/:id/approve', authMiddleware, managerPlus, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json<ApprovalRequest>();

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid request ID'
      }, 400);
    }

    if (!body.decision || !['approved', 'rejected', 'needs_info'].includes(body.decision)) {
      return c.json({
        error: 'Validation Error',
        message: 'Valid decision is required (approved, rejected, needs_info)'
      }, 400);
    }

    const request = await getRequestWithDetails(c.env.DB, id);
    if (!request) {
      return c.json({
        error: 'Not Found',
        message: 'Request not found'
      }, 404);
    }

    // Determine stage and new status based on user role and current status
    let stage: 'manager_review' | 'supervisor_approval';
    let newStatus: string;

    if (request.status === 'submitted' && user.role === 'manager') {
      stage = 'manager_review';
      if (body.decision === 'approved') {
        newStatus = 'pending_approval';
      } else if (body.decision === 'rejected') {
        newStatus = 'rejected';
      } else {
        newStatus = 'draft'; // needs_info goes back to draft
      }
    } else if (request.status === 'pending_approval' && (user.role === 'supervisor' || user.role === 'admin')) {
      stage = 'supervisor_approval';
      if (body.decision === 'approved') {
        newStatus = 'approved';
      } else if (body.decision === 'rejected') {
        newStatus = 'rejected';
      } else {
        newStatus = 'under_review'; // needs_info goes back to review
      }
    } else {
      return c.json({
        error: 'Bad Request',
        message: 'Request is not in a state that allows this approval action'
      }, 400);
    }

    // Create approval record
    await c.env.DB.prepare(`
      INSERT INTO approvals (request_id, approver_id, stage, decision, comment, decided_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, user.userId, stage, body.decision, body.comment || null).run();

    // Update request status
    await c.env.DB.prepare('UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newStatus, id)
      .run();

    // If approved by supervisor, create order
    if (body.decision === 'approved' && stage === 'supervisor_approval') {
      const orderResult = await c.env.DB.prepare(`
        INSERT INTO orders (request_id, order_date, status)
        VALUES (?, DATE('now'), 'pending')
      `).bind(id).run();

      const orderId = orderResult.meta.last_row_id as number;

      // Generate PO number
      const poNumber = `PO-${new Date().getFullYear()}-${orderId.toString().padStart(4, '0')}`;
      await c.env.DB.prepare('UPDATE orders SET po_number = ? WHERE id = ?')
        .bind(poNumber, orderId)
        .run();

      // Update request status to ordered
      await c.env.DB.prepare('UPDATE requests SET status = ? WHERE id = ?')
        .bind('ordered', id)
        .run();
    }

    // Log audit
    await logAudit(
      c.env.DB,
      'request',
      id,
      `${stage}_${body.decision}`,
      user.userId,
      { status: request.status },
      { status: newStatus, decision: body.decision, comment: body.comment }
    );

    // Create notifications
    if (body.decision === 'approved' && stage === 'manager_review') {
      // Notify supervisors
      const supervisors = await c.env.DB.prepare("SELECT id, email, name FROM users WHERE role IN ('supervisor', 'admin') AND active = 1").all();
      for (const supervisor of supervisors.results) {
        await createNotification(
          c.env.DB,
          supervisor.id as number,
          'request_approval_needed',
          'Prašymas laukia patvirtinimo',
          `${user.email} rekomendavo patvirtinti prašymą #${id}`,
          'request',
          id
        );
      }
      
      // Send email notifications to supervisors
      const emailService = createEmailService(c.env);
      if (emailService) {
        const appUrl = c.env.APP_URL || 'https://your-app.pages.dev';
        for (const supervisor of supervisors.results) {
          try {
            await emailService.sendRequestStatusNotification(
              supervisor.email as string,
              supervisor.name as string,
              id,
              'pending_approval',
              `Vadybininkas ${user.name} rekomendavo patvirtinti šį prašymą.`,
              appUrl
            );
          } catch (error) {
            console.error('Failed to send email to supervisor:', error);
          }
        }
      }
    } else {
      // Notify requester
      await createNotification(
        c.env.DB,
        request.requester_id,
        'request_decision',
        `Prašymas ${body.decision === 'approved' ? 'patvirtintas' : body.decision === 'rejected' ? 'atmesta' : 'grąžintas patikslinti'}`,
        body.comment || `Jūsų prašymas #${id} buvo ${body.decision}`,
        'request',
        id
      );
      
      // Send email notification to requester
      const emailService = createEmailService(c.env);
      if (emailService) {
        const appUrl = c.env.APP_URL || 'https://your-app.pages.dev';
        try {
          await emailService.sendRequestStatusNotification(
            request.requester_email,
            request.requester_name,
            id,
            newStatus,
            body.comment,
            appUrl
          );
        } catch (error) {
          console.error('Failed to send email to requester:', error);
        }
      }
    }

    const updatedRequest = await getRequestWithDetails(c.env.DB, id);
    return c.json(updatedRequest);

  } catch (error) {
    console.error('Approve request error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to process approval'
    }, 500);
  }
});

export default requests;