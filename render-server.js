// Render.com serverio paleidimo failas (CommonJS)
const { serve } = require('@hono/node-server');
const { serveStatic } = require('@hono/node-server/serve-static');

// Simple Hono app for Render
const { Hono } = require('hono');
const app = new Hono();

// Enable CORS
app.use('/api/*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 200 });
  }
  
  await next();
});

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Simple in-memory database
let users = [
  {
    id: 1,
    email: 'admin@company.com',
    name: 'Sistemos administratorius',
    password: 'admin123', // In production, this should be hashed
    role: 'admin',
    department: 'IT',
    status: 'active'
  },
  {
    id: 2,
    email: 'manager@company.com',
    name: 'Vadybininkas',
    password: 'manager123',
    role: 'manager',
    department: 'Pirkimai',
    status: 'active'
  },
  {
    id: 3,
    email: 'employee@company.com',
    name: 'Darbuotojas',
    password: 'employee123',
    role: 'employee',
    department: 'Gamyba',
    status: 'active'
  }
];

let requests = [];
let nextRequestId = 1;
let nextUserId = 4;

// Auth endpoints
app.post('/api/v1/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return c.json({ success: false, message: 'Neteisingas el. paštas arba slaptažodis' }, 401);
    }

    // Simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    return c.json({ success: false, message: 'Serverio klaida' }, 500);
  }
});

app.get('/api/v1/auth/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Neautorizuotas' }, 401);
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return c.json({ success: false, message: 'Vartotojas nerastas' }, 401);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    return c.json({ success: false, message: 'Neteisingas token' }, 401);
  }
});

// Requests endpoints
app.get('/api/v1/requests', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: false, message: 'Neautorizuotas' }, 401);
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);

    let filteredRequests = requests;
    
    // Filter based on user role
    if (user.role === 'employee') {
      filteredRequests = requests.filter(r => r.user_id === user.id);
    }

    return c.json({
      success: true,
      data: filteredRequests.map(r => ({
        ...r,
        user: users.find(u => u.id === r.user_id)
      }))
    });
  } catch (error) {
    return c.json({ success: false, message: 'Serverio klaida' }, 500);
  }
});

app.post('/api/v1/requests', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: false, message: 'Neautorizuotas' }, 401);
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    const data = await c.req.json();
    
    const newRequest = {
      id: nextRequestId++,
      title: data.title,
      description: data.description || '',
      status: 'draft',
      user_id: decoded.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: data.items || []
    };

    requests.push(newRequest);

    return c.json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    return c.json({ success: false, message: 'Serverio klaida' }, 500);
  }
});

app.put('/api/v1/requests/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const data = await c.req.json();
    
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      return c.json({ success: false, message: 'Užklausa nerasta' }, 404);
    }

    requests[requestIndex] = {
      ...requests[requestIndex],
      ...data,
      updated_at: new Date().toISOString()
    };

    return c.json({
      success: true,
      data: requests[requestIndex]
    });
  } catch (error) {
    return c.json({ success: false, message: 'Serverio klaida' }, 500);
  }
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'render',
    users_count: users.length,
    requests_count: requests.length
  });
});

// API info
app.get('/api/v1', (c) => {
  return c.json({
    name: 'Prekių užsakymų valdymo API',
    version: '1.0.0',
    description: 'Procurement Management System API - Render Version',
    platform: 'Render.com',
    status: 'active',
    endpoints: {
      auth: '/api/v1/auth',
      requests: '/api/v1/requests',
      health: '/api/health'
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
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div class="max-w-md w-full space-y-8 p-8">
                <div class="text-center">
                    <div class="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-shopping-cart text-white text-xl"></i>
                    </div>
                    <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                        Prekių užsakymų valdymas
                    </h2>
                    <p class="mt-2 text-sm text-gray-600">
                        Prisijunkite prie sistemos
                    </p>
                </div>

                <div id="login-form" class="mt-8 space-y-6">
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <div class="space-y-4">
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700">El. paštas</label>
                                <input id="email" name="email" type="email" required 
                                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="admin@company.com">
                            </div>
                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700">Slaptažodis</label>
                                <input id="password" name="password" type="password" required 
                                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                       placeholder="admin123">
                            </div>
                            <div>
                                <button type="submit" onclick="login()" 
                                        class="w-full btn-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    <i class="fas fa-sign-in-alt mr-2"></i>
                                    Prisijungti
                                </button>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <h4 class="text-sm font-medium text-gray-700 mb-3">Demo prisijungimo duomenys:</h4>
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Admin:</span>
                                    <code class="bg-gray-100 px-2 py-1 rounded">admin@company.com / admin123</code>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Manager:</span>
                                    <code class="bg-gray-100 px-2 py-1 rounded">manager@company.com / manager123</code>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Employee:</span>
                                    <code class="bg-gray-100 px-2 py-1 rounded">employee@company.com / employee123</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="dashboard" class="hidden">
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Sveiki atvykę!</h3>
                            <div id="user-info" class="mb-4"></div>
                            <div class="space-y-3">
                                <button onclick="showRequests()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                    <i class="fas fa-list mr-2"></i>
                                    Peržiūrėti užklausas
                                </button>
                                <button onclick="createRequest()" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                                    <i class="fas fa-plus mr-2"></i>
                                    Kurti naują užklausą
                                </button>
                                <button onclick="logout()" class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                                    <i class="fas fa-sign-out-alt mr-2"></i>
                                    Atsijungti
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="content" class="mt-6"></div>
                </div>
            </div>
        </div>

        <script>
        let currentUser = null;
        let token = localStorage.getItem('token');

        // Check if already logged in
        if (token) {
            checkAuth();
        }

        async function checkAuth() {
            try {
                const response = await fetch('/api/v1/auth/me', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        currentUser = result.user;
                        showDashboard();
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }

        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Prašome įvesti el. paštą ir slaptažodį');
                return;
            }

            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (result.success) {
                    token = result.token;
                    currentUser = result.user;
                    localStorage.setItem('token', token);
                    showDashboard();
                } else {
                    alert(result.message || 'Prisijungimo klaida');
                }
            } catch (error) {
                alert('Serverio klaida: ' + error.message);
            }
        }

        function showDashboard() {
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            
            document.getElementById('user-info').innerHTML = \`
                <div class="text-sm text-gray-600">
                    <strong>\${currentUser.name}</strong><br>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">\${currentUser.role}</span>
                    <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">\${currentUser.department}</span>
                </div>
            \`;
        }

        async function showRequests() {
            try {
                const response = await fetch('/api/v1/requests', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                const result = await response.json();
                
                if (result.success) {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div class="bg-white p-6 rounded-xl shadow-lg">
                            <h3 class="text-lg font-semibold mb-4">Užklausos (\${result.data.length})</h3>
                            \${result.data.length === 0 
                                ? '<p class="text-gray-600">Užklausų nėra</p>'
                                : result.data.map(req => \`
                                    <div class="border-b pb-3 mb-3 last:border-b-0">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h4 class="font-medium">\${req.title}</h4>
                                                <p class="text-sm text-gray-600">\${req.description}</p>
                                                <p class="text-xs text-gray-500 mt-1">Sukurta: \${new Date(req.created_at).toLocaleDateString('lt-LT')}</p>
                                            </div>
                                            <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">\${req.status}</span>
                                        </div>
                                    </div>
                                \`).join('')
                            }
                        </div>
                    \`;
                }
            } catch (error) {
                alert('Klaida gaunant užklausas: ' + error.message);
            }
        }

        function createRequest() {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-lg font-semibold mb-4">Nauja užklausa</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Pavadinimas</label>
                            <input id="req-title" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Užklausos pavadinimas">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Aprašymas</label>
                            <textarea id="req-description" class="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" placeholder="Detalus aprašymas"></textarea>
                        </div>
                        <button onclick="submitRequest()" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                            <i class="fas fa-save mr-2"></i>
                            Išsaugoti užklausą
                        </button>
                    </div>
                </div>
            \`;
        }

        async function submitRequest() {
            const title = document.getElementById('req-title').value;
            const description = document.getElementById('req-description').value;

            if (!title) {
                alert('Prašome įvesti pavadinimą');
                return;
            }

            try {
                const response = await fetch('/api/v1/requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ title, description })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Užklausa sėkmingai sukurta!');
                    showRequests();
                } else {
                    alert(result.message || 'Klaida kuriant užklausą');
                }
            } catch (error) {
                alert('Serverio klaida: ' + error.message);
            }
        }

        function logout() {
            localStorage.removeItem('token');
            token = null;
            currentUser = null;
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('content').innerHTML = '';
        }

        // Enter key login
        document.getElementById('email').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
        
        document.getElementById('password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
        </script>
    </body>
    </html>
  `);
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, message: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ success: false, message: 'Internal server error' }, 500);
});

const port = process.env.PORT || 3000;

console.log(`🚀 Starting Procurement Management System on port ${port}`);
console.log(`📊 Platform: Render.com`);
console.log(`👥 Demo users: admin@company.com/admin123, manager@company.com/manager123, employee@company.com/employee123`);

serve({
  fetch: app.fetch,
  port: port
});