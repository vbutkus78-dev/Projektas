import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth';
import { getOrderWithDetails, logAudit, createNotification } from '../utils/db';
import type { Bindings, InvoiceType } from '../types';

const invoices = new Hono<{ Bindings: Bindings }>();

// Get invoices list
invoices.get('/', authMiddleware, requireRole(['manager', 'supervisor', 'accounting', 'admin']), async (c) => {
  try {
    const { 
      order_id,
      type,
      paid,
      page = '1', 
      limit = '20',
      sort = 'created_at',
      order = 'desc'
    } = c.req.query();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    let params: any[] = [];

    if (order_id) {
      whereConditions.push('i.order_id = ?');
      params.push(parseInt(order_id));
    }

    if (type) {
      whereConditions.push('i.type = ?');
      params.push(type);
    }

    if (paid !== undefined) {
      whereConditions.push('i.paid = ?');
      params.push(paid === 'true' ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      ${whereClause}
    `;
    
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first<{ total: number }>();
    
    const total = countResult?.total || 0;

    // Get paginated results
    const dataQuery = `
      SELECT 
        i.*,
        o.po_number,
        r.requester_id,
        u.name as requester_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      ${whereClause}
      ORDER BY i.${sort} ${order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const dataResult = await c.env.DB.prepare(dataQuery)
      .bind(...params, parseInt(limit), offset)
      .all();

    const response = {
      data: dataResult.results.map(inv => ({
        ...inv,
        order: {
          id: inv.order_id,
          po_number: inv.po_number,
          requester: {
            id: inv.requester_id,
            name: inv.requester_name
          }
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
    console.error('Get invoices error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch invoices'
    }, 500);
  }
});

// Create/attach invoice
invoices.post('/', authMiddleware, requireRole(['manager', 'accounting', 'admin']), async (c) => {
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    
    const orderId = parseInt(formData.get('order_id') as string);
    const type = formData.get('type') as InvoiceType;
    const invoiceNumber = formData.get('invoice_number') as string;
    const amount = parseFloat(formData.get('amount') as string || '0');
    const currency = formData.get('currency') as string || 'EUR';
    const issueDate = formData.get('issue_date') as string;
    const dueDate = formData.get('due_date') as string;
    const file = formData.get('file') as File;

    if (!orderId || !type) {
      return c.json({
        error: 'Validation Error',
        message: 'Order ID and type are required'
      }, 400);
    }

    if (!['proforma', 'final', 'vat'].includes(type)) {
      return c.json({
        error: 'Validation Error',
        message: 'Invalid invoice type'
      }, 400);
    }

    // Verify order exists
    const order = await getOrderWithDetails(c.env.DB, orderId);
    if (!order) {
      return c.json({
        error: 'Not Found',
        message: 'Order not found'
      }, 404);
    }

    let fileUrl: string | null = null;

    // Handle file upload if provided
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        return c.json({
          error: 'Validation Error',
          message: 'Only PDF, JPEG, and PNG files are allowed'
        }, 400);
      }

      if (file.size > maxSize) {
        return c.json({
          error: 'Validation Error',
          message: 'File size must be less than 10MB'
        }, 400);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop();
      const fileName = `invoices/${orderId}/${type}/${timestamp}-${randomString}.${extension}`;

      // Upload to R2
      const arrayBuffer = await file.arrayBuffer();
      await c.env.BUCKET.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          originalName: file.name,
          uploadedBy: user.userId.toString(),
          orderId: orderId.toString(),
          invoiceType: type
        }
      });

      fileUrl = fileName;
    }

    // Create invoice record
    const result = await c.env.DB.prepare(`
      INSERT INTO invoices (order_id, type, file_url, invoice_number, amount, currency, issue_date, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      type,
      fileUrl,
      invoiceNumber || null,
      amount || null,
      currency,
      issueDate || null,
      dueDate || null
    ).run();

    const invoiceId = result.meta.last_row_id as number;

    // Update order and request status based on invoice type
    if (type === 'proforma') {
      await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
        .bind('confirmed', orderId)
        .run();
    } else if (type === 'final') {
      await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
        .bind('delivered', orderId)
        .run();
      
      await c.env.DB.prepare('UPDATE requests SET status = ? WHERE id = ?')
        .bind('delivered', order.request_id)
        .run();
    }

    // Log audit
    await logAudit(
      c.env.DB,
      'invoice',
      invoiceId,
      'created',
      user.userId,
      null,
      { 
        orderId, 
        type, 
        amount, 
        invoiceNumber,
        hasFile: !!fileUrl 
      },
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    // Create notifications
    if (type === 'proforma') {
      // Notify requester about proforma invoice
      await createNotification(
        c.env.DB,
        order.request?.requester_id!,
        'invoice_proforma',
        'Gauta išankstinė sąskaita',
        `Jūsų užsakymo ${order.po_number} išankstinė sąskaita yra paruošta`,
        'order',
        orderId
      );
    } else if (type === 'final') {
      // Notify requester about delivery
      await createNotification(
        c.env.DB,
        order.request?.requester_id!,
        'order_delivered',
        'Užsakymas pristatytas',
        `Jūsų užsakymas ${order.po_number} buvo pristatytas`,
        'order',
        orderId
      );

      // Notify accounting about payment needed
      const accountants = await c.env.DB.prepare("SELECT id FROM users WHERE role = 'accounting' AND active = 1").all();
      for (const accountant of accountants.results) {
        await createNotification(
          c.env.DB,
          accountant.id as number,
          'invoice_payment_needed',
          'Reikalingas mokėjimas',
          `Užsakymas ${order.po_number} laukia apmokėjimo`,
          'order',
          orderId
        );
      }
    }

    // Get the created invoice
    const createdInvoice = await c.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).bind(invoiceId).first();

    return c.json(createdInvoice, 201);

  } catch (error) {
    console.error('Create invoice error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to create invoice'
    }, 500);
  }
});

// Get specific invoice
invoices.get('/:id', authMiddleware, requireRole(['manager', 'supervisor', 'accounting', 'admin']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid invoice ID'
      }, 400);
    }

    const invoice = await c.env.DB.prepare(`
      SELECT 
        i.*,
        o.po_number,
        o.order_date,
        r.requester_id,
        u.name as requester_name,
        s.name as supplier_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      WHERE i.id = ?
    `).bind(id).first();

    if (!invoice) {
      return c.json({
        error: 'Not Found',
        message: 'Invoice not found'
      }, 404);
    }

    return c.json({
      ...invoice,
      order: {
        id: invoice.order_id,
        po_number: invoice.po_number,
        order_date: invoice.order_date,
        requester: {
          id: invoice.requester_id,
          name: invoice.requester_name
        },
        supplier: {
          name: invoice.supplier_name
        }
      }
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to fetch invoice'
    }, 500);
  }
});

// Update invoice (mark as paid, update details)
invoices.patch('/:id', authMiddleware, requireRole(['accounting', 'admin']), async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid invoice ID'
      }, 400);
    }

    // Get current invoice
    const currentInvoice = await c.env.DB.prepare(`
      SELECT i.*, o.request_id, o.po_number
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      WHERE i.id = ?
    `).bind(id).first();

    if (!currentInvoice) {
      return c.json({
        error: 'Not Found',
        message: 'Invoice not found'
      }, 404);
    }

    // Build update query
    const updates = [];
    const params = [];

    if (body.paid !== undefined) {
      updates.push('paid = ?');
      params.push(body.paid ? 1 : 0);
    }

    if (body.paid_date !== undefined) {
      updates.push('paid_date = ?');
      params.push(body.paid_date);
    }

    if (body.amount !== undefined) {
      updates.push('amount = ?');
      params.push(body.amount);
    }

    if (body.invoice_number !== undefined) {
      updates.push('invoice_number = ?');
      params.push(body.invoice_number);
    }

    if (body.due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(body.due_date);
    }

    if (updates.length === 0) {
      return c.json({
        error: 'Bad Request',
        message: 'No valid fields to update'
      }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();

    // If marking as paid and it's a final invoice, complete the order
    if (body.paid === true && currentInvoice.type === 'final') {
      await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
        .bind('completed', currentInvoice.order_id)
        .run();

      await c.env.DB.prepare('UPDATE requests SET status = ? WHERE id = ?')
        .bind('completed', currentInvoice.request_id)
        .run();

      // Notify requester about completion
      const request = await c.env.DB.prepare(`
        SELECT requester_id FROM requests WHERE id = ?
      `).bind(currentInvoice.request_id).first();

      if (request) {
        await createNotification(
          c.env.DB,
          request.requester_id as number,
          'order_completed',
          'Užsakymas užbaigtas',
          `Jūsų užsakymas ${currentInvoice.po_number} buvo sėkmingai užbaigtas`,
          'order',
          currentInvoice.order_id
        );
      }
    }

    // Log audit
    await logAudit(
      c.env.DB,
      'invoice',
      id,
      'updated',
      user.userId,
      { 
        paid: currentInvoice.paid,
        paid_date: currentInvoice.paid_date,
        amount: currentInvoice.amount
      },
      body,
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    // Get updated invoice
    const updatedInvoice = await c.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).bind(id).first();

    return c.json(updatedInvoice);

  } catch (error) {
    console.error('Update invoice error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to update invoice'
    }, 500);
  }
});

// Get invoice file
invoices.get('/:id/file', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid invoice ID'
      }, 400);
    }

    // Get invoice with access check
    const invoice = await c.env.DB.prepare(`
      SELECT 
        i.*,
        r.requester_id
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN requests r ON o.request_id = r.id
      WHERE i.id = ?
    `).bind(id).first();

    if (!invoice) {
      return c.json({
        error: 'Not Found',
        message: 'Invoice not found'
      }, 404);
    }

    if (!invoice.file_url) {
      return c.json({
        error: 'Not Found',
        message: 'No file attached to this invoice'
      }, 404);
    }

    // Check permissions
    const canAccess = user.role === 'admin' || 
                     user.role === 'supervisor' ||
                     user.role === 'manager' ||
                     user.role === 'accounting' ||
                     user.userId === invoice.requester_id;

    if (!canAccess) {
      return c.json({
        error: 'Forbidden',
        message: 'You do not have permission to access this file'
      }, 403);
    }

    // Get file from R2
    const object = await c.env.BUCKET.get(invoice.file_url);
    
    if (!object) {
      return c.json({
        error: 'Not Found',
        message: 'File not found in storage'
      }, 404);
    }

    // Return file with appropriate headers
    const filename = `invoice-${invoice.type}-${invoice.id}.pdf`;
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Get invoice file error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve invoice file'
    }, 500);
  }
});

// Delete invoice (admin only)
invoices.delete('/:id', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({
        error: 'Bad Request',
        message: 'Invalid invoice ID'
      }, 400);
    }

    // Get invoice info
    const invoice = await c.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ?
    `).bind(id).first();

    if (!invoice) {
      return c.json({
        error: 'Not Found',
        message: 'Invoice not found'
      }, 404);
    }

    // Delete file from R2 if exists
    if (invoice.file_url) {
      await c.env.BUCKET.delete(invoice.file_url);
    }

    // Delete from database
    await c.env.DB.prepare(`
      DELETE FROM invoices WHERE id = ?
    `).bind(id).run();

    // Log audit
    await logAudit(
      c.env.DB,
      'invoice',
      id,
      'deleted',
      user.userId,
      { 
        type: invoice.type,
        amount: invoice.amount,
        invoiceNumber: invoice.invoice_number
      },
      null,
      c.req.header('CF-Connecting-IP'),
      c.req.header('User-Agent')
    );

    return c.json({ success: true }, 204);

  } catch (error) {
    console.error('Delete invoice error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to delete invoice'
    }, 500);
  }
});

export default invoices;