import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { authMiddleware } from './middleware/auth';

// Import routes
import auth from './routes/auth';
import requests from './routes/requests';
import orders from './routes/orders';
import files from './routes/files';
import invoices from './routes/invoices';
import reports from './routes/reports';

import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// API routes
app.route('/api/v1/auth', auth);
app.route('/api/v1/requests', requests);
app.route('/api/v1/orders', orders);
app.route('/api/v1/files', files);
app.route('/api/v1/invoices', invoices);
app.route('/api/v1/reports', reports);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info
app.get('/api/v1', (c) => {
  return c.json({
    name: 'Prekių užsakymų valdymo API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      requests: '/api/v1/requests',
      orders: '/api/v1/orders',
      invoices: '/api/v1/invoices',
      files: '/api/v1/files',
      reports: '/api/v1/reports',
      health: '/api/health'
    }
  });
});

// Basic suppliers endpoint (simplified)
app.get('/api/v1/suppliers', authMiddleware, async (c) => {
  try {
    const { active = 'true', search } = c.req.query();
    
    let query = 'SELECT * FROM suppliers';
    const params = [];
    
    if (active === 'true') {
      query += ' WHERE active = 1';
    }
    
    if (search) {
      query += active === 'true' ? ' AND' : ' WHERE';
      query += ' name LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch suppliers' }, 500);
  }
});

// Basic categories endpoint
app.get('/api/v1/categories', authMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM categories 
      WHERE active = 1 
      ORDER BY parent_id, name
    `).all();
    
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// User notifications endpoint
app.get('/api/v1/notifications', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { read } = c.req.query();
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [user.userId];
    
    if (read !== undefined) {
      query += ' AND read = ?';
      params.push(read === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.patch('/api/v1/notifications/:id/read', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = parseInt(c.req.param('id'));
    
    await c.env.DB.prepare(`
      UPDATE notifications 
      SET read = 1 
      WHERE id = ? AND user_id = ?
    `).bind(id, user.userId).run();
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update notification' }, 500);
  }
});

// Dashboard stats endpoint
app.get('/api/v1/dashboard/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Role-based queries
    let requestsWhere = '';
    let params = [];
    
    if (user.role === 'employee') {
      requestsWhere = 'WHERE requester_id = ?';
      params = [user.userId];
    }

    // Get counts by status
    const statusCounts = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM requests
      ${requestsWhere}
      GROUP BY status
    `).bind(...params).all();

    // Get total amount this month
    const monthlyTotal = await c.env.DB.prepare(`
      SELECT SUM(total_amount) as total
      FROM requests
      ${requestsWhere ? requestsWhere + ' AND' : 'WHERE'} 
      DATE(created_at) >= DATE('now', 'start of month')
    `).bind(...params).first<{ total: number }>();

    // Recent requests
    const recentRequests = await c.env.DB.prepare(`
      SELECT r.*, u.name as requester_name
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      ${requestsWhere}
      ORDER BY r.created_at DESC
      LIMIT 10
    `).bind(...params).all();

    return c.json({
      status_counts: statusCounts.results,
      monthly_total: monthlyTotal?.total || 0,
      recent_requests: recentRequests.results
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

// Main route - serve the web application
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prekių užsakymų valdymo sistema</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .loading {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 8px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app">
        <!-- Loading state -->
        <div id="loading" class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <div class="loading mx-auto mb-4"></div>
                <p class="text-gray-600">Kraunama...</p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `);
});

// 404 handler
app.notFound((c) => {
  if (c.req.url.includes('/api/')) {
    return c.json({ error: 'Not Found', message: 'API endpoint not found' }, 404);
  }
  
  // For non-API routes, serve the main app (SPA routing)
  return app.fetch(new Request(c.req.url.replace(c.req.path, '/')));
});

// Error handler
app.onError((err, c) => {
  console.error('App error:', err);
  
  if (c.req.url.includes('/api/')) {
    return c.json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }, 500);
  }
  
  return c.html(`
    <html>
      <body>
        <h1>Klaida</h1>
        <p>Įvyko nenumatyta klaida. Bandykite atnaujinti puslapį.</p>
      </body>
    </html>
  `, 500);
});

export default app;