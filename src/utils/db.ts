import type { Bindings, RequestWithDetails, OrderWithDetails, User } from '../types';

// User queries
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE email = ? AND active = 1')
    .bind(email)
    .first<User>();
  
  return result || null;
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE id = ? AND active = 1')
    .bind(id)
    .first<User>();
  
  return result || null;
}

// Request queries
export async function getRequestWithDetails(db: D1Database, id: number): Promise<RequestWithDetails | null> {
  // Get main request
  const request = await db.prepare('SELECT * FROM requests WHERE id = ?')
    .bind(id)
    .first<RequestWithDetails>();
    
  if (!request) return null;

  // Get requester
  const requester = await db.prepare('SELECT id, email, name, role, department FROM users WHERE id = ?')
    .bind(request.requester_id)
    .first<User>();
  
  if (requester) {
    request.requester = requester;
  }

  // Get request lines with suppliers and categories
  const lines = await db.prepare(`
    SELECT rl.*, s.name as supplier_name, c.name as category_name
    FROM request_lines rl
    LEFT JOIN suppliers s ON rl.supplier_id = s.id
    LEFT JOIN categories c ON rl.category_id = c.id
    WHERE rl.request_id = ?
    ORDER BY rl.id
  `).bind(id).all();
  
  request.lines = lines.results.map(line => ({
    ...line,
    supplier: line.supplier_name ? { id: line.supplier_id, name: line.supplier_name } : undefined,
    category: line.category_name ? { id: line.category_id, name: line.category_name } : undefined
  }));

  // Get approvals with approvers
  const approvals = await db.prepare(`
    SELECT a.*, u.name as approver_name, u.role as approver_role
    FROM approvals a
    LEFT JOIN users u ON a.approver_id = u.id
    WHERE a.request_id = ?
    ORDER BY a.created_at
  `).bind(id).all();
  
  request.approvals = approvals.results.map(approval => ({
    ...approval,
    approver: { id: approval.approver_id, name: approval.approver_name, role: approval.approver_role }
  }));

  // Get attachments
  const attachments = await db.prepare(
    'SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ? ORDER BY created_at'
  ).bind('request', id).all();
  
  request.attachments = attachments.results;

  return request;
}

// Order queries
export async function getOrderWithDetails(db: D1Database, id: number): Promise<OrderWithDetails | null> {
  const order = await db.prepare('SELECT * FROM orders WHERE id = ?')
    .bind(id)
    .first<OrderWithDetails>();
    
  if (!order) return null;

  // Get supplier
  if (order.supplier_id) {
    const supplier = await db.prepare('SELECT * FROM suppliers WHERE id = ?')
      .bind(order.supplier_id)
      .first();
    
    if (supplier) {
      order.supplier = supplier;
    }
  }

  // Get request details
  const request = await getRequestWithDetails(db, order.request_id);
  if (request) {
    order.request = request;
  }

  // Get invoices
  const invoices = await db.prepare('SELECT * FROM invoices WHERE order_id = ? ORDER BY created_at')
    .bind(id)
    .all();
  
  order.invoices = invoices.results;

  return order;
}

// Audit logging
export async function logAudit(
  db: D1Database, 
  entity: string, 
  entityId: number, 
  action: string, 
  actorId: number | null,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await db.prepare(`
    INSERT INTO audit_log (entity, entity_id, action, actor_id, old_values, new_values, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    entity,
    entityId,
    action,
    actorId,
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null,
    ipAddress,
    userAgent
  ).run();
}

// Notification helper
export async function createNotification(
  db: D1Database,
  userId: number,
  type: string,
  title: string,
  message?: string,
  entityType?: string,
  entityId?: number
): Promise<void> {
  await db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(userId, type, title, message, entityType, entityId).run();
}

// Calculate request total amount
export async function updateRequestTotal(db: D1Database, requestId: number): Promise<void> {
  const result = await db.prepare(`
    SELECT SUM(COALESCE(total_price, quantity * COALESCE(unit_price, 0))) as total
    FROM request_lines 
    WHERE request_id = ?
  `).bind(requestId).first<{ total: number }>();
  
  const total = result?.total || 0;
  
  await db.prepare('UPDATE requests SET total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(total, requestId)
    .run();
}