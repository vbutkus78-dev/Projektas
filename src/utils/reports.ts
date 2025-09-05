// Reports and export utilities
// Generates Excel and CSV exports for various data types

interface ReportData {
  headers: string[];
  rows: any[][];
  filename: string;
}

interface ReportFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
  department?: string;
  requester_id?: number;
  supplier_id?: number;
  type?: string;
  role?: string;
}

export class ReportsService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // Generate requests report
  async generateRequestsReport(filters: ReportFilters = {}): Promise<ReportData> {
    let whereConditions = ['1=1']; // Always true condition
    let params: any[] = [];

    // Build where conditions
    if (filters.date_from) {
      whereConditions.push('DATE(r.created_at) >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereConditions.push('DATE(r.created_at) <= ?');
      params.push(filters.date_to);
    }

    if (filters.status) {
      whereConditions.push('r.status = ?');
      params.push(filters.status);
    }

    if (filters.department) {
      whereConditions.push('r.department = ?');
      params.push(filters.department);
    }

    if (filters.requester_id) {
      whereConditions.push('r.requester_id = ?');
      params.push(filters.requester_id);
    }

    const query = `
      SELECT 
        r.id,
        r.created_at,
        r.status,
        r.department,
        r.priority,
        r.justification,
        r.needed_by_date,
        r.total_amount,
        u.name as requester_name,
        u.email as requester_email,
        (SELECT COUNT(*) FROM request_lines rl WHERE rl.request_id = r.id) as items_count
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY r.created_at DESC
    `;

    const result = await this.db.prepare(query).bind(...params).all();

    const headers = [
      'ID',
      'Sukurta',
      'Būsena',
      'Skyrius',
      'Prioritetas',
      'Pagrindimas',
      'Reikia iki',
      'Suma (€)',
      'Prašytojas',
      'El. paštas',
      'Prekių skaičius'
    ];

    const rows = result.results.map(row => [
      row.id,
      new Date(row.created_at as string).toLocaleDateString('lt-LT'),
      this.getStatusLabel(row.status as string),
      row.department,
      this.getPriorityLabel(row.priority as string),
      row.justification,
      row.needed_by_date ? new Date(row.needed_by_date as string).toLocaleDateString('lt-LT') : '',
      parseFloat(row.total_amount as string || '0').toFixed(2),
      row.requester_name,
      row.requester_email,
      row.items_count
    ]);

    const filename = `prasymai_${filters.date_from || 'visi'}_${filters.date_to || new Date().toISOString().split('T')[0]}.csv`;

    return { headers, rows, filename };
  }

  // Generate orders report
  async generateOrdersReport(filters: ReportFilters = {}): Promise<ReportData> {
    let whereConditions = ['1=1'];
    let params: any[] = [];

    if (filters.date_from) {
      whereConditions.push('DATE(o.created_at) >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereConditions.push('DATE(o.created_at) <= ?');
      params.push(filters.date_to);
    }

    if (filters.status) {
      whereConditions.push('o.status = ?');
      params.push(filters.status);
    }

    if (filters.supplier_id) {
      whereConditions.push('o.supplier_id = ?');
      params.push(filters.supplier_id);
    }

    const query = `
      SELECT 
        o.id,
        o.po_number,
        o.order_date,
        o.status,
        o.expected_delivery,
        o.notes,
        s.name as supplier_name,
        r.department,
        r.total_amount,
        u.name as requester_name
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY o.created_at DESC
    `;

    const result = await this.db.prepare(query).bind(...params).all();

    const headers = [
      'ID',
      'Užsakymo Nr.',
      'Užsakymo data',
      'Būsena', 
      'Tikėtinas pristatymas',
      'Tiekėjas',
      'Skyrius',
      'Suma (€)',
      'Prašytojas',
      'Pastabos'
    ];

    const rows = result.results.map(row => [
      row.id,
      row.po_number,
      new Date(row.order_date as string).toLocaleDateString('lt-LT'),
      this.getOrderStatusLabel(row.status as string),
      row.expected_delivery ? new Date(row.expected_delivery as string).toLocaleDateString('lt-LT') : '',
      row.supplier_name,
      row.department,
      parseFloat(row.total_amount as string || '0').toFixed(2),
      row.requester_name,
      row.notes || ''
    ]);

    const filename = `uzsakymai_${filters.date_from || 'visi'}_${filters.date_to || new Date().toISOString().split('T')[0]}.csv`;

    return { headers, rows, filename };
  }

  // Generate invoices report
  async generateInvoicesReport(filters: ReportFilters = {}): Promise<ReportData> {
    let whereConditions = ['1=1'];
    let params: any[] = [];

    if (filters.date_from) {
      whereConditions.push('DATE(i.created_at) >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereConditions.push('DATE(i.created_at) <= ?');
      params.push(filters.date_to);
    }

    if (filters.type) {
      whereConditions.push('i.type = ?');
      params.push(filters.type);
    }

    const query = `
      SELECT 
        i.id,
        i.invoice_number,
        i.type,
        i.amount,
        i.due_date,
        i.paid,
        i.paid_date,
        i.created_at,
        o.po_number,
        s.name as supplier_name,
        r.department,
        u.name as requester_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN requests r ON o.request_id = r.id
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY i.created_at DESC
    `;

    const result = await this.db.prepare(query).bind(...params).all();

    const headers = [
      'ID',
      'Sąskaitos Nr.',
      'Tipas',
      'Suma (€)',
      'Terminas',
      'Apmokėta',
      'Mokėjimo data',
      'Sukurta',
      'Užsakymas',
      'Tiekėjas',
      'Skyrius',
      'Prašytojas'
    ];

    const rows = result.results.map(row => [
      row.id,
      row.invoice_number,
      this.getInvoiceTypeLabel(row.type as string),
      parseFloat(row.amount as string).toFixed(2),
      row.due_date ? new Date(row.due_date as string).toLocaleDateString('lt-LT') : '',
      row.paid ? 'Taip' : 'Ne',
      row.paid_date ? new Date(row.paid_date as string).toLocaleDateString('lt-LT') : '',
      new Date(row.created_at as string).toLocaleDateString('lt-LT'),
      row.po_number,
      row.supplier_name,
      row.department,
      row.requester_name
    ]);

    const filename = `saskaitos_${filters.date_from || 'visos'}_${filters.date_to || new Date().toISOString().split('T')[0]}.csv`;

    return { headers, rows, filename };
  }

  // Generate financial summary report
  async generateFinancialSummaryReport(filters: ReportFilters = {}): Promise<ReportData> {
    let whereConditions = ['1=1'];
    let params: any[] = [];

    if (filters.date_from) {
      whereConditions.push('DATE(r.created_at) >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereConditions.push('DATE(r.created_at) <= ?');
      params.push(filters.date_to);
    }

    const query = `
      SELECT 
        r.department,
        r.status,
        COUNT(*) as count,
        SUM(r.total_amount) as total_amount,
        AVG(r.total_amount) as avg_amount
      FROM requests r
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY r.department, r.status
      ORDER BY r.department, r.status
    `;

    const result = await this.db.prepare(query).bind(...params).all();

    const headers = [
      'Skyrius',
      'Būsena',
      'Prašymų skaičius',
      'Bendra suma (€)',
      'Vidutinė suma (€)'
    ];

    const rows = result.results.map(row => [
      row.department,
      this.getStatusLabel(row.status as string),
      row.count,
      parseFloat(row.total_amount as string || '0').toFixed(2),
      parseFloat(row.avg_amount as string || '0').toFixed(2)
    ]);

    const filename = `finansu_suvestine_${filters.date_from || 'visi'}_${filters.date_to || new Date().toISOString().split('T')[0]}.csv`;

    return { headers, rows, filename };
  }

  // Generate users activity report  
  async generateUsersReport(filters: ReportFilters = {}): Promise<ReportData> {
    let whereConditions = ['u.active = 1'];
    let params: any[] = [];

    if (filters.role) {
      whereConditions.push('u.role = ?');
      params.push(filters.role);
    }

    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT r.id) as requests_count,
        COALESCE(SUM(r.total_amount), 0) as total_requested_amount
      FROM users u
      LEFT JOIN requests r ON u.id = r.requester_id 
        ${filters.date_from ? 'AND DATE(r.created_at) >= ?' : ''}
        ${filters.date_to ? 'AND DATE(r.created_at) <= ?' : ''}
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY u.id, u.name, u.email, u.role, u.department, u.created_at, u.last_login
      ORDER BY u.name
    `;

    if (filters.date_from) params.push(filters.date_from);
    if (filters.date_to) params.push(filters.date_to);

    const result = await this.db.prepare(query).bind(...params).all();

    const headers = [
      'ID',
      'Vardas', 
      'El. paštas',
      'Rolė',
      'Skyrius',
      'Sukurta',
      'Paskutinis prisijungimas',
      'Prašymų skaičius',
      'Bendrai prašyta (€)'
    ];

    const rows = result.results.map(row => [
      row.id,
      row.name,
      row.email,
      this.getRoleLabel(row.role as string),
      row.department,
      new Date(row.created_at as string).toLocaleDateString('lt-LT'),
      row.last_login ? new Date(row.last_login as string).toLocaleDateString('lt-LT') : 'Niekada',
      row.requests_count,
      parseFloat(row.total_requested_amount as string).toFixed(2)
    ]);

    const filename = `vartotojai_${filters.date_from || 'visi'}_${filters.date_to || new Date().toISOString().split('T')[0]}.csv`;

    return { headers, rows, filename };
  }

  // Convert report data to CSV format
  generateCSV(data: ReportData): string {
    const { headers, rows } = data;
    
    const csvHeaders = headers.join(',');
    const csvRows = rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape commas and quotes in CSV
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    return csvHeaders + '\n' + csvRows;
  }

  // Generate Excel-style TSV (Tab Separated Values) for better Excel compatibility
  generateTSV(data: ReportData): string {
    const { headers, rows } = data;
    
    const tsvHeaders = headers.join('\t');
    const tsvRows = rows.map(row => 
      row.map(cell => String(cell || '')).join('\t')
    ).join('\n');

    return tsvHeaders + '\n' + tsvRows;
  }

  // Helper methods for label translations
  private getStatusLabel(status: string): string {
    const labels = {
      'draft': 'Juodraštis',
      'submitted': 'Pateiktas',
      'under_review': 'Peržiūrimas',
      'pending_approval': 'Laukia patvirtinimo',
      'approved': 'Patvirtintas',
      'rejected': 'Atmestas',
      'ordered': 'Užsakytas',
      'delivered': 'Pristatytas',
      'completed': 'Užbaigtas',
      'archived': 'Archyvuotas'
    };
    return labels[status as keyof typeof labels] || status;
  }

  private getOrderStatusLabel(status: string): string {
    const labels = {
      'pending': 'Laukia apdorojimo',
      'sent': 'Išsiųstas',
      'confirmed': 'Patvirtintas',
      'delivered': 'Pristatytas',
      'completed': 'Užbaigtas'
    };
    return labels[status as keyof typeof labels] || status;
  }

  private getInvoiceTypeLabel(type: string): string {
    const labels = {
      'proforma': 'Proforma',
      'final': 'Galutinė',
      'vat': 'PVM'
    };
    return labels[type as keyof typeof labels] || type;
  }

  private getPriorityLabel(priority: string): string {
    const labels = {
      'low': 'Žemas',
      'normal': 'Normalus', 
      'high': 'Aukštas',
      'urgent': 'Skubus'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  private getRoleLabel(role: string): string {
    const labels = {
      'employee': 'Darbuotojas',
      'manager': 'Vadybininkas',
      'supervisor': 'Vadovas',
      'accounting': 'Buhalterė',
      'admin': 'Administratorius'
    };
    return labels[role as keyof typeof labels] || role;
  }
}