// Database bindings for Cloudflare Workers
export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
}

// User roles
export type UserRole = 'employee' | 'manager' | 'supervisor' | 'accounting' | 'admin';

// Request status
export type RequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'ordered' 
  | 'delivered' 
  | 'completed' 
  | 'archived';

// Priority levels
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

// Order status
export type OrderStatus = 'pending' | 'sent' | 'confirmed' | 'delivered' | 'completed';

// Invoice types
export type InvoiceType = 'proforma' | 'final' | 'vat';

// Approval stages
export type ApprovalStage = 'manager_review' | 'supervisor_approval';

// Approval decisions
export type ApprovalDecision = 'approved' | 'rejected' | 'needs_info';

// Entity types for attachments and audit log
export type EntityType = 'request' | 'order' | 'invoice';

// Database models
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  department: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  company_code: string | null;
  vat_code: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  contacts: string | null; // JSON
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  active: boolean;
  created_at: string;
}

export interface Request {
  id: number;
  requester_id: number;
  department: string;
  priority: Priority;
  justification: string | null;
  status: RequestStatus;
  total_amount: number;
  currency: string;
  needed_by_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestLine {
  id: number;
  request_id: number;
  item_name: string;
  category_id: number | null;
  quantity: number;
  unit: string;
  unit_price: number | null;
  total_price: number | null;
  supplier_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface Approval {
  id: number;
  request_id: number;
  approver_id: number;
  stage: ApprovalStage;
  decision: ApprovalDecision | null;
  comment: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  request_id: number;
  po_number: string | null;
  supplier_id: number | null;
  order_date: string;
  expected_delivery: string | null;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  order_id: number;
  type: InvoiceType;
  file_url: string | null;
  invoice_number: string | null;
  amount: number | null;
  currency: string;
  issue_date: string | null;
  due_date: string | null;
  paid: boolean;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: number;
  entity_type: EntityType;
  entity_id: number;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: number | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  entity: string;
  entity_id: number;
  action: string;
  actor_id: number | null;
  old_values: string | null; // JSON
  new_values: string | null; // JSON
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string | null;
  entity_type: string | null;
  entity_id: number | null;
  read: boolean;
  created_at: string;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}

export interface CreateRequestRequest {
  department: string;
  priority: Priority;
  justification?: string;
  needed_by_date?: string;
  lines: CreateRequestLineRequest[];
}

export interface CreateRequestLineRequest {
  item_name: string;
  category_id?: number;
  quantity: number;
  unit?: string;
  unit_price?: number;
  supplier_id?: number;
  notes?: string;
}

export interface ApprovalRequest {
  decision: ApprovalDecision;
  comment?: string;
}

// Extended types with relations
export interface RequestWithDetails extends Request {
  requester?: User;
  lines?: (RequestLine & {
    category?: Category;
    supplier?: Supplier;
  })[];
  approvals?: (Approval & {
    approver?: User;
  })[];
  attachments?: Attachment[];
}

export interface OrderWithDetails extends Order {
  request?: RequestWithDetails;
  supplier?: Supplier;
  invoices?: Invoice[];
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// JWT payload
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}