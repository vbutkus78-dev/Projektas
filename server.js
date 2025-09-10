// Ultra-simple server for Render.com
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Simple in-memory data storage
let users = [
  { id: 1, email: 'admin@company.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: 2, email: 'manager@company.com', password: 'manager123', name: 'Manager', role: 'manager' },
  { id: 3, email: 'employee@company.com', password: 'employee123', name: 'Employee', role: 'employee' }
];

let requests = [];
let requestId = 1;

// Helper functions
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendHTML(res, html) {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(html);
}

// Main HTML page
const mainPage = `<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prekių užsakymų valdymas</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <!-- Login Form -->
            <div id="login-section">
                <div class="text-center mb-6">
                    <i class="fas fa-shopping-cart text-4xl text-blue-600 mb-4"></i>
                    <h1 class="text-2xl font-bold text-gray-800">Prekių užsakymų valdymas</h1>
                    <p class="text-gray-600">Prisijunkite prie sistemos</p>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">El. paštas</label>
                        <input id="email" type="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                               placeholder="admin@company.com" value="admin@company.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Slaptažodis</label>
                        <input id="password" type="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                               placeholder="admin123" value="admin123">
                    </div>
                    <button onclick="login()" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                        <i class="fas fa-sign-in-alt mr-2"></i>Prisijungti
                    </button>
                </div>
                
                <div class="mt-6 p-4 bg-gray-50 rounded-md">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Demo vartotojai:</h4>
                    <div class="space-y-1 text-xs text-gray-600">
                        <div>Admin: admin@company.com / admin123</div>
                        <div>Manager: manager@company.com / manager123</div>
                        <div>Employee: employee@company.com / employee123</div>
                    </div>
                </div>
            </div>

            <!-- Dashboard -->
            <div id="dashboard-section" class="hidden">
                <div class="text-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800">Dashboard</h2>
                    <div id="user-info" class="text-sm text-gray-600"></div>
                </div>
                
                <div class="space-y-3">
                    <button onclick="showRequests()" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                        <i class="fas fa-list mr-2"></i>Peržiūrėti užklausas (<span id="request-count">0</span>)
                    </button>
                    <button onclick="showCreateForm()" class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                        <i class="fas fa-plus mr-2"></i>Kurti naują užklausą
                    </button>
                    <button onclick="logout()" class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                        <i class="fas fa-sign-out-alt mr-2"></i>Atsijungti
                    </button>
                </div>
                
                <div id="content-area" class="mt-6"></div>
            </div>
        </div>
    </div>

    <script>
    let currentUser = null;
    let token = null;

    async function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                currentUser = result.user;
                token = result.token;
                showDashboard();
                loadRequests();
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Prisijungimo klaida: ' + error.message);
        }
    }

    function showDashboard() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('user-info').innerHTML = \`
            <strong>\${currentUser.name}</strong> - \${currentUser.role}<br>
            \${currentUser.email}
        \`;
    }

    async function loadRequests() {
        try {
            const response = await fetch('/api/requests', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const result = await response.json();
            document.getElementById('request-count').textContent = result.data.length;
        } catch (error) {
            console.error('Klaida gaunant užklausas:', error);
        }
    }

    async function showRequests() {
        try {
            const response = await fetch('/api/requests', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const result = await response.json();
            
            const html = \`
                <div class="bg-gray-50 p-4 rounded-md">
                    <h3 class="font-medium mb-3">Užklausos (\${result.data.length})</h3>
                    \${result.data.length === 0 ? 
                        '<p class="text-gray-600">Užklausų nėra</p>' :
                        result.data.map(req => \`
                            <div class="bg-white p-3 rounded border mb-2">
                                <h4 class="font-medium">\${req.title}</h4>
                                <p class="text-sm text-gray-600">\${req.description}</p>
                                <div class="text-xs text-gray-500 mt-1">
                                    Sukurta: \${new Date(req.created_at).toLocaleDateString()}
                                    | Statusas: \${req.status}
                                </div>
                            </div>
                        \`).join('')
                    }
                </div>
            \`;
            document.getElementById('content-area').innerHTML = html;
        } catch (error) {
            alert('Klaida gaunant užklausas: ' + error.message);
        }
    }

    function showCreateForm() {
        const html = \`
            <div class="bg-gray-50 p-4 rounded-md">
                <h3 class="font-medium mb-3">Nauja užklausa</h3>
                <div class="space-y-3">
                    <input id="req-title" type="text" placeholder="Užklausos pavadinimas" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <textarea id="req-desc" placeholder="Aprašymas" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    <button onclick="createRequest()" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                        <i class="fas fa-save mr-2"></i>Išsaugoti
                    </button>
                </div>
            </div>
        \`;
        document.getElementById('content-area').innerHTML = html;
    }

    async function createRequest() {
        const title = document.getElementById('req-title').value;
        const description = document.getElementById('req-desc').value;
        
        if (!title) {
            alert('Įveskite pavadinimą');
            return;
        }
        
        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ title, description })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Užklausa sukurta!');
                showRequests();
                loadRequests();
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Klaida kuriant užklausą: ' + error.message);
        }
    }

    function logout() {
        currentUser = null;
        token = null;
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('content-area').innerHTML = '';
    }

    // Enter key support
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !document.getElementById('login-section').classList.contains('hidden')) {
            login();
        }
    });
    </script>
</body>
</html>`;

// Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Routes
  if (pathname === '/' && method === 'GET') {
    sendHTML(res, mainPage);
    
  } else if (pathname === '/api/health' && method === 'GET') {
    sendJSON(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      users: users.length,
      requests: requests.length
    });
    
  } else if (pathname === '/api/login' && method === 'POST') {
    const body = await parseBody(req);
    const user = users.find(u => u.email === body.email && u.password === body.password);
    
    if (user) {
      const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
      sendJSON(res, {
        success: true,
        token: token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    } else {
      sendJSON(res, { success: false, message: 'Neteisingi duomenys' }, 401);
    }
    
  } else if (pathname === '/api/requests' && method === 'GET') {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      sendJSON(res, { success: false, message: 'Neautorizuotas' }, 401);
      return;
    }
    
    try {
      const token = auth.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        sendJSON(res, { success: false, message: 'Nerastas vartotojas' }, 401);
        return;
      }
      
      let userRequests = requests;
      if (user.role === 'employee') {
        userRequests = requests.filter(r => r.user_id === user.id);
      }
      
      sendJSON(res, { success: true, data: userRequests });
    } catch (error) {
      sendJSON(res, { success: false, message: 'Neteisingas token' }, 401);
    }
    
  } else if (pathname === '/api/requests' && method === 'POST') {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      sendJSON(res, { success: false, message: 'Neautorizuotas' }, 401);
      return;
    }
    
    try {
      const token = auth.substring(7);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        sendJSON(res, { success: false, message: 'Nerastas vartotojas' }, 401);
        return;
      }
      
      const body = await parseBody(req);
      const newRequest = {
        id: requestId++,
        title: body.title,
        description: body.description || '',
        status: 'draft',
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      requests.push(newRequest);
      sendJSON(res, { success: true, data: newRequest });
      
    } catch (error) {
      sendJSON(res, { success: false, message: 'Neteisingas token' }, 401);
    }
    
  } else {
    sendJSON(res, { success: false, message: 'Endpoint not found' }, 404);
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(\`🚀 Server running on port \${port}\`);
  console.log(\`📱 Demo: admin@company.com/admin123\`);
});`