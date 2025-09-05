import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth';
import { ReportsService } from '../utils/reports';
import type { Bindings } from '../types';

const reports = new Hono<{ Bindings: Bindings }>();

// Get available report types
reports.get('/', authMiddleware, requireRole(['manager', 'supervisor', 'accounting', 'admin']), async (c) => {
  const user = c.get('user');
  
  const availableReports = [
    {
      id: 'requests',
      name: 'Prašymų ataskaita',
      description: 'Visų prašymų sąrašas su detalėmis',
      roles: ['manager', 'supervisor', 'accounting', 'admin']
    },
    {
      id: 'orders', 
      name: 'Užsakymų ataskaita',
      description: 'Visų užsakymų sąrašas su būsenomis',
      roles: ['manager', 'supervisor', 'accounting', 'admin']
    },
    {
      id: 'invoices',
      name: 'Sąskaitų ataskaita', 
      description: 'Sąskaitų faktūrų ir mokėjimų ataskaita',
      roles: ['accounting', 'admin']
    },
    {
      id: 'financial-summary',
      name: 'Finansų suvestinė',
      description: 'Išlaidų suvestinė pagal skyrius ir būsenas', 
      roles: ['supervisor', 'accounting', 'admin']
    },
    {
      id: 'users',
      name: 'Vartotojų aktyvumas',
      description: 'Vartotojų aktyvumo ir prašymų statistikos',
      roles: ['admin']
    }
  ];

  // Filter reports based on user role
  const userReports = availableReports.filter(report => 
    report.roles.includes(user.role)
  );

  return c.json({ reports: userReports });
});

// Generate and download requests report
reports.get('/requests', authMiddleware, requireRole(['manager', 'supervisor', 'accounting', 'admin']), async (c) => {
  try {
    const {
      format = 'csv',
      date_from,
      date_to, 
      status,
      department,
      requester_id
    } = c.req.query();

    const reportsService = new ReportsService(c.env.DB);
    const reportData = await reportsService.generateRequestsReport({
      date_from,
      date_to,
      status,
      department,
      requester_id: requester_id ? parseInt(requester_id) : undefined
    });

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'tsv' || format === 'excel') {
      content = reportsService.generateTSV(reportData);
      contentType = 'text/tab-separated-values';
      filename = reportData.filename.replace('.csv', '.tsv');
    } else {
      content = reportsService.generateCSV(reportData);
      contentType = 'text/csv';
      filename = reportData.filename;
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    });

  } catch (error) {
    console.error('Generate requests report error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to generate requests report'
    }, 500);
  }
});

// Generate and download orders report  
reports.get('/orders', authMiddleware, requireRole(['manager', 'supervisor', 'accounting', 'admin']), async (c) => {
  try {
    const {
      format = 'csv',
      date_from,
      date_to,
      status,
      supplier_id
    } = c.req.query();

    const reportsService = new ReportsService(c.env.DB);
    const reportData = await reportsService.generateOrdersReport({
      date_from,
      date_to,
      status,
      supplier_id: supplier_id ? parseInt(supplier_id) : undefined
    });

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'tsv' || format === 'excel') {
      content = reportsService.generateTSV(reportData);
      contentType = 'text/tab-separated-values';
      filename = reportData.filename.replace('.csv', '.tsv');
    } else {
      content = reportsService.generateCSV(reportData);
      contentType = 'text/csv';
      filename = reportData.filename;
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    });

  } catch (error) {
    console.error('Generate orders report error:', error);
    return c.json({
      error: 'Internal Server Error', 
      message: 'Failed to generate orders report'
    }, 500);
  }
});

// Generate and download invoices report
reports.get('/invoices', authMiddleware, requireRole(['accounting', 'admin']), async (c) => {
  try {
    const {
      format = 'csv',
      date_from,
      date_to,
      type
    } = c.req.query();

    const reportsService = new ReportsService(c.env.DB);
    const reportData = await reportsService.generateInvoicesReport({
      date_from,
      date_to,
      type
    });

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'tsv' || format === 'excel') {
      content = reportsService.generateTSV(reportData);
      contentType = 'text/tab-separated-values';
      filename = reportData.filename.replace('.csv', '.tsv');
    } else {
      content = reportsService.generateCSV(reportData);
      contentType = 'text/csv';
      filename = reportData.filename;
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    });

  } catch (error) {
    console.error('Generate invoices report error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to generate invoices report'
    }, 500);
  }
});

// Generate and download financial summary report
reports.get('/financial-summary', authMiddleware, requireRole(['supervisor', 'accounting', 'admin']), async (c) => {
  try {
    const {
      format = 'csv',
      date_from,
      date_to
    } = c.req.query();

    const reportsService = new ReportsService(c.env.DB);
    const reportData = await reportsService.generateFinancialSummaryReport({
      date_from,
      date_to
    });

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'tsv' || format === 'excel') {
      content = reportsService.generateTSV(reportData);
      contentType = 'text/tab-separated-values';
      filename = reportData.filename.replace('.csv', '.tsv');
    } else {
      content = reportsService.generateCSV(reportData);
      contentType = 'text/csv';
      filename = reportData.filename;
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    });

  } catch (error) {
    console.error('Generate financial summary report error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to generate financial summary report'
    }, 500);
  }
});

// Generate and download users report (admin only)
reports.get('/users', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const {
      format = 'csv', 
      date_from,
      date_to,
      role
    } = c.req.query();

    const reportsService = new ReportsService(c.env.DB);
    const reportData = await reportsService.generateUsersReport({
      date_from,
      date_to,
      role
    });

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'tsv' || format === 'excel') {
      content = reportsService.generateTSV(reportData);
      contentType = 'text/tab-separated-values';
      filename = reportData.filename.replace('.csv', '.tsv');
    } else {
      content = reportsService.generateCSV(reportData);
      contentType = 'text/csv';
      filename = reportData.filename;
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    });

  } catch (error) {
    console.error('Generate users report error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to generate users report'
    }, 500);
  }
});

// Get report preview (first 10 rows as JSON for preview)
reports.get('/:type/preview', authMiddleware, requireRole(['manager', 'supervisor', 'accounting', 'admin']), async (c) => {
  try {
    const user = c.get('user');
    const reportType = c.req.param('type');
    
    const {
      date_from,
      date_to,
      status,
      department,
      requester_id,
      supplier_id,
      type,
      role
    } = c.req.query();

    const reportsService = new ReportsService(c.env.DB);
    let reportData;

    switch (reportType) {
      case 'requests':
        if (!['manager', 'supervisor', 'accounting', 'admin'].includes(user.role)) {
          return c.json({ error: 'Forbidden' }, 403);
        }
        reportData = await reportsService.generateRequestsReport({
          date_from, date_to, status, department,
          requester_id: requester_id ? parseInt(requester_id) : undefined
        });
        break;
        
      case 'orders':
        if (!['manager', 'supervisor', 'accounting', 'admin'].includes(user.role)) {
          return c.json({ error: 'Forbidden' }, 403);
        }
        reportData = await reportsService.generateOrdersReport({
          date_from, date_to, status,
          supplier_id: supplier_id ? parseInt(supplier_id) : undefined
        });
        break;
        
      case 'invoices':
        if (!['accounting', 'admin'].includes(user.role)) {
          return c.json({ error: 'Forbidden' }, 403);
        }
        reportData = await reportsService.generateInvoicesReport({
          date_from, date_to, type
        });
        break;
        
      case 'financial-summary':
        if (!['supervisor', 'accounting', 'admin'].includes(user.role)) {
          return c.json({ error: 'Forbidden' }, 403);
        }
        reportData = await reportsService.generateFinancialSummaryReport({
          date_from, date_to
        });
        break;
        
      case 'users':
        if (user.role !== 'admin') {
          return c.json({ error: 'Forbidden' }, 403);
        }
        reportData = await reportsService.generateUsersReport({
          date_from, date_to, role
        });
        break;
        
      default:
        return c.json({
          error: 'Bad Request',
          message: 'Invalid report type'
        }, 400);
    }

    // Return only first 10 rows for preview
    const previewData = {
      headers: reportData.headers,
      rows: reportData.rows.slice(0, 10),
      total_rows: reportData.rows.length,
      filename: reportData.filename
    };

    return c.json(previewData);

  } catch (error) {
    console.error('Generate report preview error:', error);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to generate report preview'
    }, 500);
  }
});

export default reports;