import { Hono } from 'hono';
import { cors } from 'hono/cors';
// Note: For Node.js server, we'll handle static files in render-server.js
import { authMiddleware } from './middleware/auth.js';

// Import routes
import auth from './routes/auth.js';
import requests from './routes/requests.js';
import orders from './routes/orders.js';
import files from './routes/files.js';
import invoices from './routes/invoices.js';
import reports from './routes/reports.js';

const app = new Hono();

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev', 'https://*.onrender.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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
    version: '1.0.0',
    platform: 'render'
  });
});

// API info
app.get('/api/v1', (c) => {
  return c.json({
    name: 'Prekių užsakymų valdymo API',
    version: '1.0.0',
    description: 'Procurement Management System API',
    endpoints: {
      auth: '/api/v1/auth',
      requests: '/api/v1/requests', 
      orders: '/api/v1/orders',
      files: '/api/v1/files',
      invoices: '/api/v1/invoices',
      reports: '/api/v1/reports'
    }
  });
});

// Main page with embedded frontend
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
        .sidebar {
            width: 280px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .main-content {
            margin-left: 280px;
        }
        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                position: fixed;
                z-index: 1000;
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }
            .sidebar.open {
                transform: translateX(0);
            }
            .main-content {
                margin-left: 0;
            }
        }
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Mobile menu button -->
        <button id="mobile-menu-btn" class="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg">
            <i class="fas fa-bars text-gray-600"></i>
        </button>

        <!-- Sidebar -->
        <div id="sidebar" class="sidebar h-screen fixed left-0 top-0 text-white p-6 overflow-y-auto">
            <div class="mb-8">
                <h1 class="text-2xl font-bold mb-2">
                    <i class="fas fa-shopping-cart mr-2"></i>
                    PVS
                </h1>
                <p class="text-sm opacity-75">Prekių valdymo sistema</p>
            </div>
            
            <nav id="nav-menu" class="space-y-2">
                <!-- Navigation will be populated by JavaScript -->
            </nav>
            
            <div class="mt-8 pt-6 border-t border-white/20">
                <div id="user-info" class="hidden">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div class="font-medium" id="user-name"></div>
                            <div class="text-xs opacity-75" id="user-role"></div>
                        </div>
                    </div>
                </div>
                <button id="logout-btn" class="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors hidden">
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Atsijungti
                </button>
            </div>
        </div>

        <!-- Main content -->
        <div class="main-content min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b p-6">
                <div class="flex items-center justify-between">
                    <h2 id="page-title" class="text-2xl font-semibold text-gray-800">Prekių užsakymų valdymas</h2>
                    <div id="header-actions" class="flex space-x-3">
                        <!-- Dynamic buttons will be added here -->
                    </div>
                </div>
            </header>

            <!-- Page content -->
            <main class="p-6">
                <div id="app-content">
                    <!-- Content will be loaded here by JavaScript -->
                </div>
            </main>
        </div>

        <!-- Loading overlay -->
        <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Kraunama...</span>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        
        <script>
        // Mobile menu toggle
        document.getElementById('mobile-menu-btn').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const menuBtn = document.getElementById('mobile-menu-btn');
            
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
        </script>
    </body>
    </html>
  `);
});

export default app;