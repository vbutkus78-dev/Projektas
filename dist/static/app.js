// Simple vanilla JavaScript SPA for Order Management System

class OrderApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'login';
        this.token = localStorage.getItem('auth_token');
        
        this.init();
    }

    async init() {
        // Setup axios defaults
        axios.defaults.baseURL = window.location.origin + '/api/v1';
        
        if (this.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            try {
                await this.getCurrentUser();
                this.showDashboard();
            } catch (error) {
                this.logout();
            }
        } else {
            this.showLogin();
        }
    }

    async getCurrentUser() {
        const response = await axios.get('/auth/me');
        this.currentUser = response.data;
    }

    showLogin() {
        this.currentView = 'login';
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <div>
                        <div class="mx-auto h-12 w-12 text-4xl text-center">📋</div>
                        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Prekių užsakymų sistema
                        </h2>
                        <p class="mt-2 text-center text-sm text-gray-600">
                            Prisijunkite prie savo paskyros
                        </p>
                    </div>
                    <form id="loginForm" class="mt-8 space-y-6">
                        <div class="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label for="email" class="sr-only">El. paštas</label>
                                <input id="email" name="email" type="email" required 
                                       class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                       placeholder="El. paštas">
                            </div>
                            <div>
                                <label for="password" class="sr-only">Slaptažodis</label>
                                <input id="password" name="password" type="password" required
                                       class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                       placeholder="Slaptažodis">
                            </div>
                        </div>

                        <div>
                            <button type="submit" 
                                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span id="loginSpinner" class="loading hidden"></span>
                                Prisijungti
                            </button>
                        </div>

                        <div id="loginError" class="hidden text-red-600 text-sm text-center"></div>
                        
                        <div class="text-xs text-gray-500 text-center">
                            <p>Testas vartotojai:</p>
                            <p><strong>Darbuotojas:</strong> jonas.petraitis@company.com</p>
                            <p><strong>Vadybininkas:</strong> ana.kazlauskiene@company.com</p>
                            <p><strong>Vadovas:</strong> petras.jonaitis@company.com</p>
                            <p><strong>Buhalterė:</strong> rasa.petraitiene@company.com</p>
                            <p><strong>Admin:</strong> admin@company.com</p>
                            <p>Slaptažodis visiems: <strong>password123</strong></p>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        const spinner = document.getElementById('loginSpinner');

        spinner.classList.remove('hidden');
        errorDiv.classList.add('hidden');

        try {
            const response = await axios.post('/auth/login', { email, password });
            
            this.token = response.data.token;
            this.currentUser = response.data.user;
            
            localStorage.setItem('auth_token', this.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            
            this.showDashboard();
        } catch (error) {
            errorDiv.textContent = error.response?.data?.message || 'Prisijungimo klaida';
            errorDiv.classList.remove('hidden');
        } finally {
            spinner.classList.add('hidden');
        }
    }

    logout() {
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        this.token = null;
        this.currentUser = null;
        this.showLogin();
    }

    showDashboard() {
        this.currentView = 'dashboard';
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Navigation -->
                <nav class="bg-white shadow">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex">
                                <div class="flex-shrink-0 flex items-center">
                                    <span class="text-2xl">📋</span>
                                    <span class="ml-2 text-xl font-bold text-gray-900">Užsakymai</span>
                                </div>
                                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <button onclick="app.showDashboard()" class="nav-link border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        📊 Dashboard
                                    </button>
                                    <button onclick="app.showRequests()" class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        📝 Prašymai
                                    </button>
                                    ${this.currentUser.role !== 'employee' ? `
                                    <button onclick="app.showOrders()" class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        📦 Užsakymai
                                    </button>
                                    ` : ''}
                                    ${(this.currentUser.role === 'accounting' || this.currentUser.role === 'manager') ? `
                                    <button onclick="app.showInvoices()" class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        🧾 Sąskaitos
                                    </button>
                                    ` : ''}
                                    ${(this.currentUser.role === 'manager' || this.currentUser.role === 'supervisor' || this.currentUser.role === 'accounting' || this.currentUser.role === 'admin') ? `
                                    <button onclick="app.showReports()" class="nav-link border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        📊 Ataskaitos
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="hidden sm:ml-6 sm:flex sm:items-center">
                                <button id="notificationsBtn" class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <span class="sr-only">Pranešimai</span>
                                    🔔
                                    <span id="notificationBadge" class="hidden absolute -mt-2 -mr-1 px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"></span>
                                </button>
                                <div class="ml-3 relative">
                                    <div class="flex items-center text-sm">
                                        <span class="text-gray-700 mr-2">👤 ${this.currentUser.name}</span>
                                        <span class="text-xs text-gray-500">(${this.getRoleLabel(this.currentUser.role)})</span>
                                        <button onclick="app.logout()" class="ml-3 text-gray-400 hover:text-gray-500">
                                            <i class="fas fa-sign-out-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Main Content -->
                <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div id="mainContent">
                        <!-- Dashboard content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.loadDashboardContent();
        this.loadNotifications();
    }

    async loadDashboardContent() {
        document.getElementById('mainContent').innerHTML = `
            <div class="fade-in">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p class="text-gray-600">Sveiki, ${this.currentUser.name}!</p>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div id="statsCards">
                        <div class="loading mx-auto"></div>
                    </div>
                </div>

                <!-- Recent Requests -->
                <div class="bg-white shadow rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-lg font-medium text-gray-900">Paskutiniai prašymai</h2>
                            <button onclick="app.showRequests()" class="text-blue-600 hover:text-blue-800 text-sm">
                                Žiūrėti visus →
                            </button>
                        </div>
                    </div>
                    <div id="recentRequests" class="p-6">
                        <div class="loading mx-auto"></div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="mt-8">
                    <div class="bg-white shadow rounded-lg p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Greiti veiksmai</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onclick="app.showNewRequestForm()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center">
                                <i class="fas fa-plus mr-2"></i>
                                Naujas prašymas
                            </button>
                            <button onclick="app.showRequests('submitted')" 
                                    class="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center justify-center">
                                <i class="fas fa-eye mr-2"></i>
                                Peržiūros laukia
                            </button>
                            <button onclick="app.showRequests('pending_approval')" 
                                    class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center">
                                <i class="fas fa-check mr-2"></i>
                                Laukia patvirtinimo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadDashboardStats();
    }

    async loadDashboardStats() {
        try {
            const response = await axios.get('/dashboard/stats');
            const { status_counts, monthly_total, recent_requests } = response.data;

            // Status cards
            const statusLabels = {
                draft: { label: 'Juodraščiai', icon: '📝', color: 'gray' },
                submitted: { label: 'Pateikti', icon: '📤', color: 'blue' },
                under_review: { label: 'Peržiūrimi', icon: '👁️', color: 'yellow' },
                pending_approval: { label: 'Laukia patvirtinimo', icon: '⏳', color: 'orange' },
                approved: { label: 'Patvirtinti', icon: '✅', color: 'green' },
                rejected: { label: 'Atmesti', icon: '❌', color: 'red' }
            };

            const statsHtml = `
                ${status_counts.map(stat => {
                    const config = statusLabels[stat.status] || { label: stat.status, icon: '📋', color: 'gray' };
                    return `
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <span class="text-2xl">${config.icon}</span>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">
                                                ${config.label}
                                            </dt>
                                            <dd class="text-lg font-medium text-gray-900">
                                                ${stat.count}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <span class="text-2xl">💰</span>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Šio mėnesio suma
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        €${monthly_total.toFixed(2)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('statsCards').innerHTML = statsHtml;

            // Recent requests
            if (recent_requests.length > 0) {
                const requestsHtml = `
                    <div class="overflow-hidden">
                        <ul class="divide-y divide-gray-200">
                            ${recent_requests.map(req => `
                                <li class="py-4">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex-shrink-0">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(req.status)}">
                                                ${this.getStatusLabel(req.status)}
                                            </span>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium text-gray-900 truncate">
                                                Prašymas #${req.id}
                                            </p>
                                            <p class="text-sm text-gray-500 truncate">
                                                ${req.requester_name} • ${req.department} • €${req.total_amount}
                                            </p>
                                        </div>
                                        <div class="flex-shrink-0">
                                            <button onclick="app.showRequestDetails(${req.id})" 
                                                    class="text-blue-600 hover:text-blue-800 text-sm">
                                                Žiūrėti
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
                document.getElementById('recentRequests').innerHTML = requestsHtml;
            } else {
                document.getElementById('recentRequests').innerHTML = `
                    <p class="text-gray-500 text-center py-4">Prašymų kol kas nėra</p>
                `;
            }

        } catch (error) {
            console.error('Dashboard stats error:', error);
            document.getElementById('statsCards').innerHTML = '<p class="text-red-500">Nepavyko užkrauti statistikos</p>';
        }
    }

    async loadNotifications() {
        try {
            const response = await axios.get('/notifications?read=false');
            const unreadCount = response.data.length;

            const badge = document.getElementById('notificationBadge');
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (error) {
            console.error('Notifications error:', error);
        }
    }

    showRequests(status = null) {
        this.currentView = 'requests';
        
        // Update nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('border-blue-500', 'text-gray-900');
            link.classList.add('border-transparent', 'text-gray-500');
        });

        document.getElementById('mainContent').innerHTML = `
            <div class="fade-in">
                <div class="mb-6 flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Prašymai</h1>
                        <p class="text-gray-600">Valdykite prekių ir paslaugų prašymus</p>
                    </div>
                    <button onclick="app.showNewRequestForm()" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <i class="fas fa-plus mr-2"></i>
                        Naujas prašymas
                    </button>
                </div>

                <!-- Filters -->
                <div class="bg-white p-4 rounded-lg shadow mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select id="statusFilter" class="border border-gray-300 rounded-md px-3 py-2">
                            <option value="">Visos būsenos</option>
                            <option value="draft">Juodraščiai</option>
                            <option value="submitted">Pateikti</option>
                            <option value="under_review">Peržiūrimi</option>
                            <option value="pending_approval">Laukia patvirtinimo</option>
                            <option value="approved">Patvirtinti</option>
                            <option value="rejected">Atmesti</option>
                            <option value="ordered">Užsakyti</option>
                            <option value="delivered">Pristatyti</option>
                            <option value="completed">Užbaigti</option>
                        </select>
                        
                        <input type="date" id="dateFromFilter" placeholder="Data nuo" 
                               class="border border-gray-300 rounded-md px-3 py-2">
                        
                        <input type="date" id="dateToFilter" placeholder="Data iki" 
                               class="border border-gray-300 rounded-md px-3 py-2">
                        
                        <button onclick="app.applyFilters()" 
                                class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                            Filtruoti
                        </button>
                    </div>
                </div>

                <!-- Requests List -->
                <div class="bg-white shadow rounded-lg">
                    <div id="requestsList">
                        <div class="p-6 text-center">
                            <div class="loading mx-auto"></div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div id="pagination" class="mt-6"></div>
            </div>
        `;

        if (status) {
            document.getElementById('statusFilter').value = status;
        }

        this.loadRequests();
    }

    async loadRequests(page = 1) {
        try {
            const statusFilter = document.getElementById('statusFilter')?.value || '';
            const dateFromFilter = document.getElementById('dateFromFilter')?.value || '';
            const dateToFilter = document.getElementById('dateToFilter')?.value || '';

            const params = new URLSearchParams({ page: page.toString() });
            if (statusFilter) params.append('status', statusFilter);
            if (dateFromFilter) params.append('date_from', dateFromFilter);
            if (dateToFilter) params.append('date_to', dateToFilter);

            const response = await axios.get(`/requests?${params}`);
            const { data: requests, pagination } = response.data;

            if (requests.length > 0) {
                const requestsHtml = `
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prašymas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prašytojas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Suma
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Būsena
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Veiksmai
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${requests.map(req => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">#${req.id}</div>
                                            <div class="text-sm text-gray-500">${req.department}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${req.requester?.name || 'N/A'}</div>
                                            <div class="text-sm text-gray-500">${req.requester?.department || ''}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            €${parseFloat(req.total_amount || 0).toFixed(2)}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusBadgeClass(req.status)}">
                                                ${this.getStatusLabel(req.status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${new Date(req.created_at).toLocaleDateString('lt-LT')}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onclick="app.showRequestDetails(${req.id})" 
                                                    class="text-blue-600 hover:text-blue-900">
                                                Žiūrėti
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                
                document.getElementById('requestsList').innerHTML = requestsHtml;

                // Pagination
                this.renderPagination(pagination, 'loadRequests');
                
            } else {
                document.getElementById('requestsList').innerHTML = `
                    <div class="p-6 text-center text-gray-500">
                        Prašymų nerasta
                    </div>
                `;
                document.getElementById('pagination').innerHTML = '';
            }

        } catch (error) {
            console.error('Load requests error:', error);
            document.getElementById('requestsList').innerHTML = `
                <div class="p-6 text-center text-red-500">
                    Klaida kraunant prašymus
                </div>
            `;
        }
    }

    applyFilters() {
        this.loadRequests(1);
    }

    async showRequestDetails(id) {
        try {
            const response = await axios.get(`/requests/${id}`);
            const request = response.data;

            document.getElementById('mainContent').innerHTML = `
                <div class="fade-in">
                    <div class="mb-6">
                        <button onclick="app.showRequests()" class="text-blue-600 hover:text-blue-800 mb-4">
                            ← Grįžti į prašymus
                        </button>
                        <div class="flex justify-between items-start">
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">Prašymas #${request.id}</h1>
                                <p class="text-gray-600">${request.department} skyrius</p>
                            </div>
                            <div class="flex space-x-2">
                                <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full ${this.getStatusBadgeClass(request.status)}">
                                    ${this.getStatusLabel(request.status)}
                                </span>
                                ${this.getRequestActions(request)}
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Main Info -->
                        <div class="lg:col-span-2">
                            <!-- Basic Info -->
                            <div class="bg-white shadow rounded-lg p-6 mb-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Pagrindinė informacija</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Prašytojas</label>
                                        <p class="text-sm text-gray-900">${request.requester?.name}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Skyrius</label>
                                        <p class="text-sm text-gray-900">${request.department}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Prioritetas</label>
                                        <p class="text-sm text-gray-900">${this.getPriorityLabel(request.priority)}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Reikia iki</label>
                                        <p class="text-sm text-gray-900">${request.needed_by_date ? new Date(request.needed_by_date).toLocaleDateString('lt-LT') : 'Nenurodyta'}</p>
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium text-gray-700">Pagrindimas</label>
                                        <p class="text-sm text-gray-900">${request.justification || 'Nenurodyta'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Request Lines -->
                            <div class="bg-white shadow rounded-lg p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Prekių sąrašas</h3>
                                ${request.lines && request.lines.length > 0 ? `
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full">
                                            <thead>
                                                <tr class="border-b">
                                                    <th class="text-left py-2">Prekė</th>
                                                    <th class="text-left py-2">Kiekis</th>
                                                    <th class="text-left py-2">Kaina</th>
                                                    <th class="text-right py-2">Suma</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${request.lines.map(line => `
                                                    <tr class="border-b">
                                                        <td class="py-2">
                                                            <div class="font-medium">${line.item_name}</div>
                                                            ${line.notes ? `<div class="text-sm text-gray-500">${line.notes}</div>` : ''}
                                                        </td>
                                                        <td class="py-2">${line.quantity} ${line.unit}</td>
                                                        <td class="py-2">€${(line.unit_price || 0).toFixed(2)}</td>
                                                        <td class="py-2 text-right">€${(line.total_price || 0).toFixed(2)}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="3" class="py-2 font-medium text-right">Iš viso:</td>
                                                    <td class="py-2 text-right font-bold">€${(request.total_amount || 0).toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ` : '<p class="text-gray-500">Prekių sąrašas tuščias</p>'}
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div>
                            <!-- Approval Timeline -->
                            ${request.approvals && request.approvals.length > 0 ? `
                                <div class="bg-white shadow rounded-lg p-6 mb-6">
                                    <h3 class="text-lg font-medium text-gray-900 mb-4">Patvirtinimo eiga</h3>
                                    <div class="flow-root">
                                        <ul class="-mb-8">
                                            ${request.approvals.map((approval, index) => `
                                                <li>
                                                    <div class="relative pb-8">
                                                        ${index !== request.approvals.length - 1 ? '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>' : ''}
                                                        <div class="relative flex space-x-3">
                                                            <div>
                                                                <span class="h-8 w-8 rounded-full ${approval.decision === 'approved' ? 'bg-green-500' : approval.decision === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'} flex items-center justify-center ring-8 ring-white">
                                                                    ${approval.decision === 'approved' ? '✓' : approval.decision === 'rejected' ? '✗' : '?'}
                                                                </span>
                                                            </div>
                                                            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                <div>
                                                                    <p class="text-sm text-gray-500">${approval.approver?.name} - ${this.getStageLabel(approval.stage)}</p>
                                                                    ${approval.comment ? `<p class="text-sm text-gray-900">${approval.comment}</p>` : ''}
                                                                </div>
                                                                <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                                                    ${approval.decided_at ? new Date(approval.decided_at).toLocaleDateString('lt-LT') : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Action Panel for managers/supervisors -->
                            ${this.getApprovalPanel(request)}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Request details error:', error);
            this.showRequests();
        }
    }

    getRequestActions(request) {
        const actions = [];
        
        // If user is requester and request is draft, allow submit
        if (this.currentUser.id === request.requester_id && request.status === 'draft') {
            actions.push(`
                <button onclick="app.submitRequest(${request.id})" 
                        class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Pateikti
                </button>
            `);
        }

        return actions.join(' ');
    }

    getApprovalPanel(request) {
        // Manager review
        if (request.status === 'submitted' && (this.currentUser.role === 'manager' || this.currentUser.role === 'admin')) {
            return `
                <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Vadybininko vertinimas</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Komentaras</label>
                            <textarea id="approvalComment" rows="3" 
                                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                                      placeholder="Jūsų komentaras..."></textarea>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="app.approveRequest(${request.id}, 'approved')" 
                                    class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                Patvirtinti
                            </button>
                            <button onclick="app.approveRequest(${request.id}, 'rejected')" 
                                    class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                Atmesti
                            </button>
                        </div>
                        <button onclick="app.approveRequest(${request.id}, 'needs_info')" 
                                class="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                            Grąžinti patikslinti
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Supervisor approval
        if (request.status === 'pending_approval' && (this.currentUser.role === 'supervisor' || this.currentUser.role === 'admin')) {
            return `
                <div class="bg-white shadow rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Vadovo patvirtinimas</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Komentaras</label>
                            <textarea id="approvalComment" rows="3" 
                                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                                      placeholder="Jūsų komentaras..."></textarea>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="app.approveRequest(${request.id}, 'approved')" 
                                    class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                PATVIRTINTI
                            </button>
                            <button onclick="app.approveRequest(${request.id}, 'rejected')" 
                                    class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                ATMESTI
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return '';
    }

    async submitRequest(id) {
        try {
            const response = await axios.post(`/requests/${id}/submit`);
            this.showRequestDetails(id);
        } catch (error) {
            alert('Klaida pateikiant prašymą: ' + (error.response?.data?.message || error.message));
        }
    }

    async approveRequest(id, decision) {
        try {
            const comment = document.getElementById('approvalComment')?.value || '';
            
            const response = await axios.post(`/requests/${id}/approve`, {
                decision,
                comment
            });
            
            this.showRequestDetails(id);
        } catch (error) {
            alert('Klaida tvirtinant prašymą: ' + (error.response?.data?.message || error.message));
        }
    }

    showNewRequestForm() {
        document.getElementById('mainContent').innerHTML = `
            <div class="fade-in max-w-4xl mx-auto">
                <div class="mb-6">
                    <button onclick="app.showRequests()" class="text-blue-600 hover:text-blue-800 mb-4">
                        ← Grįžti į prašymus
                    </button>
                    <h1 class="text-2xl font-bold text-gray-900">Naujas prašymas</h1>
                    <p class="text-gray-600">Sukurkite naują prekių ar paslaugų prašymą</p>
                </div>

                <form id="newRequestForm" class="space-y-6">
                    <!-- Basic Info -->
                    <div class="bg-white shadow rounded-lg p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Pagrindinė informacija</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Skyrius</label>
                                <input type="text" name="department" id="department" value="${this.currentUser.department || ''}" 
                                       class="w-full border border-gray-300 rounded-md px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prioritetas</label>
                                <select name="priority" id="priority" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                    <option value="low">Žemas</option>
                                    <option value="normal" selected>Normalus</option>
                                    <option value="high">Aukštas</option>
                                    <option value="urgent">Skubus</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Reikia iki</label>
                                <input type="date" name="needed_by" id="needed_by" 
                                       class="w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Pagrindimas</label>
                            <textarea name="justification" id="justification" rows="3" 
                                      class="w-full border border-gray-300 rounded-md px-3 py-2"
                                      placeholder="Kodėl reikalingos šios prekės ar paslaugos?"></textarea>
                        </div>
                    </div>

                    <!-- Request Lines -->
                    <div class="bg-white shadow rounded-lg p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-medium text-gray-900">Prekių sąrašas</h3>
                            <button type="button" onclick="app.addRequestLine()" 
                                    class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                + Pridėti prekę
                            </button>
                        </div>
                        <div id="requestLines">
                            <!-- Lines will be added here -->
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-4">
                        <button type="button" onclick="app.showRequests()" 
                                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Atšaukti
                        </button>
                        <button type="button" onclick="app.saveRequestAsDraft()" 
                                class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            Išsaugoti kaip juodraštį
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Pateikti tvirtinimui
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Add initial line
        this.addRequestLine();

        // Form submit handler
        document.getElementById('newRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitNewRequest();
        });
    }

    addRequestLine() {
        const linesContainer = document.getElementById('requestLines');
        const lineIndex = linesContainer.children.length;

        const lineHtml = `
            <div class="border border-gray-200 rounded-md p-4 mb-4" id="line-${lineIndex}">
                <div class="flex justify-between items-start mb-4">
                    <h4 class="text-sm font-medium text-gray-900">Prekė #${lineIndex + 1}</h4>
                    ${lineIndex > 0 ? `
                    <button type="button" onclick="app.removeRequestLine(this)" 
                            class="text-red-600 hover:text-red-800 text-sm">
                        <i class="fas fa-trash mr-1"></i>Šalinti
                    </button>
                    ` : ''}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Prekės pavadinimas</label>
                        <input type="text" name="item_name" required 
                               class="w-full border border-gray-300 rounded-md px-3 py-2"
                               placeholder="Įveskite prekės pavadinimą">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kiekis</label>
                        <input type="number" name="quantity" min="1" step="0.001" required 
                               class="w-full border border-gray-300 rounded-md px-3 py-2"
                               placeholder="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Vienetas</label>
                        <input type="text" name="unit" value="vnt." 
                               class="w-full border border-gray-300 rounded-md px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kaina (€)</label>
                        <input type="number" name="unit_price" min="0" step="0.01" 
                               class="w-full border border-gray-300 rounded-md px-3 py-2"
                               placeholder="0.00">
                    </div>
                    <div class="lg:col-span-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pastabos</label>
                        <input type="text" name="notes" 
                               class="w-full border border-gray-300 rounded-md px-3 py-2"
                               placeholder="Papildoma informacija...">
                    </div>
                </div>
            </div>
        `;

        linesContainer.insertAdjacentHTML('beforeend', lineHtml);
        this.updateLineNumbers();
    }

    removeRequestLine(button) {
        const lineDiv = button.closest('.border');
        if (lineDiv) {
            lineDiv.remove();
            this.updateLineNumbers();
        }
    }

    updateLineNumbers() {
        const lines = document.querySelectorAll('#requestLines > div');
        lines.forEach((line, index) => {
            const title = line.querySelector('h4');
            if (title) {
                title.textContent = `Prekė #${index + 1}`;
            }
        });
    }

    async submitNewRequest(asDraft = false) {
        try {
            const form = document.getElementById('newRequestForm');
            const formData = new FormData(form);

            // Collect basic info
            const requestData = {
                department: formData.get('department'),
                priority: formData.get('priority'),
                justification: formData.get('justification'),
                needed_by: formData.get('needed_by'),
                lines: []
            };

            // Collect lines
            const lines = document.querySelectorAll('#requestLines > div');
            lines.forEach(lineDiv => {
                const inputs = lineDiv.querySelectorAll('input');
                const line = {};
                inputs.forEach(input => {
                    if (input.value) {
                        line[input.name] = input.name === 'quantity' || input.name === 'unit_price' 
                            ? parseFloat(input.value) 
                            : input.value;
                    }
                });
                if (line.item_name && line.quantity) {
                    requestData.lines.push(line);
                }
            });

            if (requestData.lines.length === 0) {
                alert('Pridėkite bent vieną prekę');
                return;
            }

            // Create request
            const response = await axios.post('/requests', requestData);
            const createdRequest = response.data;

            // If not draft, submit immediately
            if (!asDraft) {
                await axios.post(`/requests/${createdRequest.id}/submit`);
            }

            this.showRequestDetails(createdRequest.id);

        } catch (error) {
            console.error('Create request error:', error);
            alert('Klaida kuriant prašymą: ' + (error.response?.data?.message || error.message));
        }
    }

    saveRequestAsDraft() {
        this.submitNewRequest(true);
    }

    showOrders() {
        if (this.currentUser.role === 'employee') {
            alert('Neturite teisių peržiūrėti užsakymus');
            return;
        }

        this.currentView = 'orders';
        
        document.getElementById('mainContent').innerHTML = `
            <div class="fade-in">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Užsakymai</h1>
                    <p class="text-gray-600">Valdykite užsakymus ir jų būsenas</p>
                </div>

                <!-- Orders List -->
                <div class="bg-white shadow rounded-lg">
                    <div id="ordersList">
                        <div class="p-6 text-center">
                            <div class="loading mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadOrders();
    }

    async loadOrders() {
        try {
            const response = await axios.get('/orders');
            const { data: orders } = response.data;

            if (orders.length > 0) {
                const ordersHtml = `
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Užsakymas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Prašymas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tiekėjas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Suma
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Būsena
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${orders.map(order => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">${order.po_number || `#${order.id}`}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">#${order.request_id}</div>
                                            <div class="text-sm text-gray-500">${order.request?.requester?.name || 'N/A'}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${order.supplier?.name || 'Nepaskirtas'}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            €${parseFloat(order.request?.total_amount || 0).toFixed(2)}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getOrderStatusBadgeClass(order.status)}">
                                                ${this.getOrderStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${new Date(order.order_date).toLocaleDateString('lt-LT')}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                
                document.getElementById('ordersList').innerHTML = ordersHtml;
                
            } else {
                document.getElementById('ordersList').innerHTML = `
                    <div class="p-6 text-center text-gray-500">
                        Užsakymų nerasta
                    </div>
                `;
            }

        } catch (error) {
            console.error('Load orders error:', error);
            document.getElementById('ordersList').innerHTML = `
                <div class="p-6 text-center text-red-500">
                    Klaida kraunant užsakymus
                </div>
            `;
        }
    }

    // Helper methods for status styling and labels
    getStatusBadgeClass(status) {
        const classes = {
            'draft': 'bg-gray-100 text-gray-800',
            'submitted': 'bg-blue-100 text-blue-800',
            'under_review': 'bg-yellow-100 text-yellow-800',
            'pending_approval': 'bg-orange-100 text-orange-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'ordered': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-indigo-100 text-indigo-800',
            'completed': 'bg-green-100 text-green-800',
            'archived': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusLabel(status) {
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
        return labels[status] || status;
    }

    getOrderStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-gray-100 text-gray-800',
            'sent': 'bg-blue-100 text-blue-800',
            'confirmed': 'bg-yellow-100 text-yellow-800',
            'delivered': 'bg-green-100 text-green-800',
            'completed': 'bg-green-100 text-green-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getOrderStatusLabel(status) {
        const labels = {
            'pending': 'Laukiantis',
            'sent': 'Išsiųstas',
            'confirmed': 'Patvirtintas',
            'delivered': 'Pristatytas',
            'completed': 'Užbaigtas'
        };
        return labels[status] || status;
    }

    getRoleLabel(role) {
        const labels = {
            'employee': 'Darbuotojas',
            'manager': 'Vadybininkas',
            'supervisor': 'Vadovas',
            'accounting': 'Buhalterė',
            'admin': 'Administratorius'
        };
        return labels[role] || role;
    }

    getPriorityLabel(priority) {
        const labels = {
            'low': 'Žemas',
            'normal': 'Normalus',
            'high': 'Aukštas',
            'urgent': 'Skubus'
        };
        return labels[priority] || priority;
    }

    getStageLabel(stage) {
        const labels = {
            'manager_review': 'Vadybininko peržiūra',
            'supervisor_approval': 'Vadovo patvirtinimas'
        };
        return labels[stage] || stage;
    }

    renderPagination(pagination, loadFunction) {
        if (pagination.total_pages <= 1) {
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        const { page, total_pages, has_prev, has_next } = pagination;
        
        let paginationHtml = '<div class="flex justify-center space-x-2">';
        
        // Previous button
        if (has_prev) {
            paginationHtml += `<button onclick="app.${loadFunction}(${page - 1})" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">‹ Ankstesnis</button>`;
        }
        
        // Page numbers (show max 5 pages around current)
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(total_pages, page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const isCurrentPage = i === page;
            paginationHtml += `
                <button onclick="app.${loadFunction}(${i})" 
                        class="px-3 py-2 rounded ${isCurrentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (has_next) {
            paginationHtml += `<button onclick="app.${loadFunction}(${page + 1})" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Kitas ›</button>`;
        }
        
        paginationHtml += '</div>';
        
        document.getElementById('pagination').innerHTML = paginationHtml;
    }

    showInvoices() {
        if (this.currentUser.role !== 'accounting' && this.currentUser.role !== 'manager') {
            alert('Neturite teisių peržiūrėti sąskaitų');
            return;
        }

        this.currentView = 'invoices';
        
        document.getElementById('mainContent').innerHTML = `
            <div class="fade-in">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Sąskaitos faktūros</h1>
                    <p class="text-gray-600">Valdykite sąskaitas faktūras ir mokėjimus</p>
                </div>

                <!-- Filter tabs -->
                <div class="mb-6">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex space-x-8">
                            <button onclick="app.loadInvoices('all')" id="filter-all" class="invoice-filter-tab border-b-2 border-blue-500 text-blue-600 py-2 px-1 text-sm font-medium">
                                Visos sąskaitos
                            </button>
                            <button onclick="app.loadInvoices('proforma')" id="filter-proforma" class="invoice-filter-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                                Proforma
                            </button>
                            <button onclick="app.loadInvoices('final')" id="filter-final" class="invoice-filter-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                                Galutinės
                            </button>
                            <button onclick="app.loadInvoices('vat')" id="filter-vat" class="invoice-filter-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                                PVM
                            </button>
                            <button onclick="app.loadInvoices('pending')" id="filter-pending" class="invoice-filter-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                                Neapmokėtos
                            </button>
                            <button onclick="app.loadInvoices('paid')" id="filter-paid" class="invoice-filter-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                                Apmokėtos
                            </button>
                        </nav>
                    </div>
                </div>

                <!-- Add Invoice Button -->
                <div class="mb-4">
                    <button onclick="app.showCreateInvoice()" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>
                        Nauja sąskaita
                    </button>
                </div>

                <!-- Invoices List -->
                <div class="bg-white shadow rounded-lg">
                    <div id="invoicesList">
                        <div class="p-6 text-center">
                            <div class="loading mx-auto"></div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div id="pagination" class="mt-4"></div>
            </div>
        `;

        this.loadInvoices();
    }

    async loadInvoices(type = 'all', page = 1) {
        try {
            const params = new URLSearchParams({ page: page.toString(), per_page: '10' });
            if (type && type !== 'all') {
                if (type === 'pending') {
                    params.set('payment_status', 'pending');
                } else if (type === 'paid') {
                    params.set('payment_status', 'paid');
                } else {
                    params.set('type', type);
                }
            }

            const response = await axios.get(`/invoices?${params}`);
            const { data: invoices, pagination } = response.data;

            // Update active filter tab
            document.querySelectorAll('.invoice-filter-tab').forEach(tab => {
                tab.classList.remove('border-blue-500', 'text-blue-600');
                tab.classList.add('border-transparent', 'text-gray-500');
            });
            document.getElementById(`filter-${type}`).classList.remove('border-transparent', 'text-gray-500');
            document.getElementById(`filter-${type}`).classList.add('border-blue-500', 'text-blue-600');

            if (invoices.length > 0) {
                const invoicesHtml = `
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Sąskaita Nr.
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Užsakymas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tipas
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Suma
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Būsena
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Sukurta
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Veiksmai
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${invoices.map(invoice => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${invoice.invoice_number}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #${invoice.order_id}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getInvoiceTypeBadgeClass(invoice.type)}">
                                                ${this.getInvoiceTypeLabel(invoice.type)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            €${parseFloat(invoice.amount).toFixed(2)}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getPaymentStatusBadgeClass(invoice.payment_status)}">
                                                ${this.getPaymentStatusLabel(invoice.payment_status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${new Date(invoice.created_at).toLocaleDateString('lt-LT')}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button onclick="app.viewInvoice(${invoice.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            ${invoice.payment_status === 'pending' ? `
                                            <button onclick="app.markInvoicePaid(${invoice.id})" class="text-green-600 hover:text-green-800 mr-3" title="Pažymėti kaip apmokėtą">
                                                <i class="fas fa-check-circle"></i>
                                            </button>
                                            ` : ''}
                                            <button onclick="app.editInvoice(${invoice.id})" class="text-yellow-600 hover:text-yellow-800 mr-3">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="app.deleteInvoice(${invoice.id})" class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;

                document.getElementById('invoicesList').innerHTML = invoicesHtml;
                
                // Update pagination if needed
                if (pagination.total_pages > 1) {
                    this.updatePagination(pagination, 'loadInvoices');
                } else {
                    document.getElementById('pagination').innerHTML = '';
                }
            } else {
                document.getElementById('invoicesList').innerHTML = `
                    <div class="p-6 text-center text-gray-500">
                        <i class="fas fa-receipt text-4xl mb-4"></i>
                        <p>Sąskaitų nėra</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            document.getElementById('invoicesList').innerHTML = `
                <div class="p-6 text-center text-red-600">
                    <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                    Klaida kraunant sąskaitas
                </div>
            `;
        }
    }

    getInvoiceTypeBadgeClass(type) {
        const classes = {
            'proforma': 'bg-blue-100 text-blue-800',
            'final': 'bg-green-100 text-green-800',
            'vat': 'bg-purple-100 text-purple-800'
        };
        return classes[type] || 'bg-gray-100 text-gray-800';
    }

    getInvoiceTypeLabel(type) {
        const labels = {
            'proforma': 'Proforma',
            'final': 'Galutinė',
            'vat': 'PVM'
        };
        return labels[type] || type;
    }

    getPaymentStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'overdue': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getPaymentStatusLabel(status) {
        const labels = {
            'pending': 'Neapmokėta',
            'paid': 'Apmokėta',
            'overdue': 'Просрочена'
        };
        return labels[status] || status;
    }

    async viewInvoice(invoiceId) {
        // This will be implemented to show invoice details
        alert('Sąskaitos peržiūra - bus įgyvendinta');
    }

    async markInvoicePaid(invoiceId) {
        if (!confirm('Ar tikrai norite pažymėti šią sąskaitą kaip apmokėtą?')) {
            return;
        }

        try {
            await axios.patch(`/invoices/${invoiceId}`, {
                payment_status: 'paid',
                payment_date: new Date().toISOString()
            });

            // Reload invoices to reflect the change
            this.loadInvoices();
            
            alert('Sąskaita pažymėta kaip apmokėta');
        } catch (error) {
            alert('Klaida atnaujinant sąskaitos būseną: ' + (error.response?.data?.message || error.message));
        }
    }

    async editInvoice(invoiceId) {
        // This will be implemented to edit invoice details
        alert('Sąskaitos redagavimas - bus įgyvendinta');
    }

    async deleteInvoice(invoiceId) {
        if (!confirm('Ar tikrai norite ištrinti šią sąskaitą? Šis veiksmas negrįžtamas.')) {
            return;
        }

        try {
            await axios.delete(`/invoices/${invoiceId}`);
            this.loadInvoices(); // Reload the list
            alert('Sąskaita ištrinta sėkmingai');
        } catch (error) {
            alert('Klaida trinant sąskaitą: ' + (error.response?.data?.message || error.message));
        }
    }

    async showCreateInvoice() {
        // This will be implemented to show create invoice form
        alert('Sąskaitos sukūrimas - bus įgyvendinta');
    }

    showReports() {
        if (!['manager', 'supervisor', 'accounting', 'admin'].includes(this.currentUser.role)) {
            alert('Neturite teisių peržiūrėti ataskaitas');
            return;
        }

        this.currentView = 'reports';
        
        document.getElementById('mainContent').innerHTML = `
            <div class="fade-in">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Ataskaitos</h1>
                    <p class="text-gray-600">Generuokite ir eksportuokite duomenų ataskaitas</p>
                </div>

                <!-- Report Types -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Requests Report -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-file-alt text-2xl text-blue-600 mr-3"></i>
                            <div>
                                <h3 class="text-lg font-semibold">Prašymų ataskaita</h3>
                                <p class="text-sm text-gray-600">Visų prašymų sąrašas su detalėmis</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="app.generateReport('requests', 'csv')" class="btn-secondary">
                                <i class="fas fa-file-csv mr-2"></i>CSV
                            </button>
                            <button onclick="app.generateReport('requests', 'excel')" class="btn-secondary">
                                <i class="fas fa-file-excel mr-2"></i>Excel
                            </button>
                        </div>
                        <button onclick="app.showReportFilters('requests')" class="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-filter mr-1"></i>Filtrai ir peržiūra
                        </button>
                    </div>

                    <!-- Orders Report -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-box text-2xl text-green-600 mr-3"></i>
                            <div>
                                <h3 class="text-lg font-semibold">Užsakymų ataskaita</h3>
                                <p class="text-sm text-gray-600">Visų užsakymų sąrašas su būsenomis</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="app.generateReport('orders', 'csv')" class="btn-secondary">
                                <i class="fas fa-file-csv mr-2"></i>CSV
                            </button>
                            <button onclick="app.generateReport('orders', 'excel')" class="btn-secondary">
                                <i class="fas fa-file-excel mr-2"></i>Excel
                            </button>
                        </div>
                        <button onclick="app.showReportFilters('orders')" class="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-filter mr-1"></i>Filtrai ir peržiūra
                        </button>
                    </div>

                    <!-- Invoices Report (Accounting only) -->
                    ${(this.currentUser.role === 'accounting' || this.currentUser.role === 'admin') ? `
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-receipt text-2xl text-purple-600 mr-3"></i>
                            <div>
                                <h3 class="text-lg font-semibold">Sąskaitų ataskaita</h3>
                                <p class="text-sm text-gray-600">Sąskaitų faktūrų ir mokėjimų ataskaita</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="app.generateReport('invoices', 'csv')" class="btn-secondary">
                                <i class="fas fa-file-csv mr-2"></i>CSV
                            </button>
                            <button onclick="app.generateReport('invoices', 'excel')" class="btn-secondary">
                                <i class="fas fa-file-excel mr-2"></i>Excel
                            </button>
                        </div>
                        <button onclick="app.showReportFilters('invoices')" class="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-filter mr-1"></i>Filtrai ir peržiūra
                        </button>
                    </div>
                    ` : ''}

                    <!-- Financial Summary -->
                    ${(this.currentUser.role === 'supervisor' || this.currentUser.role === 'accounting' || this.currentUser.role === 'admin') ? `
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-chart-pie text-2xl text-yellow-600 mr-3"></i>
                            <div>
                                <h3 class="text-lg font-semibold">Finansų suvestinė</h3>
                                <p class="text-sm text-gray-600">Išlaidų suvestinė pagal skyrius</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="app.generateReport('financial-summary', 'csv')" class="btn-secondary">
                                <i class="fas fa-file-csv mr-2"></i>CSV
                            </button>
                            <button onclick="app.generateReport('financial-summary', 'excel')" class="btn-secondary">
                                <i class="fas fa-file-excel mr-2"></i>Excel
                            </button>
                        </div>
                        <button onclick="app.showReportFilters('financial-summary')" class="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-filter mr-1"></i>Filtrai ir peržiūra
                        </button>
                    </div>
                    ` : ''}

                    <!-- Users Report (Admin only) -->
                    ${this.currentUser.role === 'admin' ? `
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-users text-2xl text-red-600 mr-3"></i>
                            <div>
                                <h3 class="text-lg font-semibold">Vartotojų aktyvumas</h3>
                                <p class="text-sm text-gray-600">Vartotojų aktyvumo statistikos</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="app.generateReport('users', 'csv')" class="btn-secondary">
                                <i class="fas fa-file-csv mr-2"></i>CSV
                            </button>
                            <button onclick="app.generateReport('users', 'excel')" class="btn-secondary">
                                <i class="fas fa-file-excel mr-2"></i>Excel
                            </button>
                        </div>
                        <button onclick="app.showReportFilters('users')" class="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-filter mr-1"></i>Filtrai ir peržiūra
                        </button>
                    </div>
                    ` : ''}
                </div>

                <!-- Recent Reports Activity -->
                <div class="bg-white rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900">Greitas eksportavimas</h3>
                        <p class="text-sm text-gray-600">Dažniausiai naudojamos ataskaitos</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button onclick="app.generateReport('requests', 'excel', {status: 'pending_approval'})" class="quick-report-btn">
                                <i class="fas fa-clock text-orange-500 mr-2"></i>
                                Laukiantys patvirtinimo
                            </button>
                            <button onclick="app.generateReport('orders', 'excel', {status: 'delivered'})" class="quick-report-btn">
                                <i class="fas fa-truck text-green-500 mr-2"></i>
                                Pristatyti užsakymai
                            </button>
                            ${(this.currentUser.role === 'accounting' || this.currentUser.role === 'admin') ? `
                            <button onclick="app.generateReport('invoices', 'excel', {paid: 'false'})" class="quick-report-btn">
                                <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                                Neapmokėtos sąskaitos
                            </button>
                            ` : ''}
                            <button onclick="app.generateReport('financial-summary', 'excel', {date_from: app.getFirstDayOfMonth()})" class="quick-report-btn">
                                <i class="fas fa-calendar text-blue-500 mr-2"></i>
                                Šio mėnesio išlaidos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS styles for report buttons
        const style = document.createElement('style');
        style.textContent = `
            .btn-secondary {
                padding: 8px 16px;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                transition: all 0.2s;
            }
            .btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
            }
            .quick-report-btn {
                padding: 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                text-align: left;
                font-size: 14px;
                color: #374151;
                transition: all 0.2s;
            }
            .quick-report-btn:hover {
                background: #f3f4f6;
                border-color: #d1d5db;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    async generateReport(type, format, filters = {}) {
        try {
            // Show loading
            const loadingEl = document.createElement('div');
            loadingEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loadingEl.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <div class="loading mx-auto mb-4"></div>
                    <p class="text-center">Generuojama ataskaita...</p>
                </div>
            `;
            document.body.appendChild(loadingEl);

            // Build query parameters
            const params = new URLSearchParams({ format, ...filters });
            
            const response = await fetch(`/api/v1/reports/${type}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            // Get filename from response headers
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `ataskaita_${type}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'tsv' : 'csv'}`;
            
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) {
                    filename = match[1];
                }
            }

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Remove loading
            document.body.removeChild(loadingEl);

        } catch (error) {
            console.error('Generate report error:', error);
            alert('Klaida generuojant ataskaitą: ' + error.message);
            
            // Remove loading if exists
            const loadingEl = document.querySelector('.fixed.inset-0');
            if (loadingEl) {
                document.body.removeChild(loadingEl);
            }
        }
    }

    async showReportFilters(type) {
        // This will show a modal with filters and preview
        alert('Filtrų ir peržiūros funkcionalumas - bus įgyvendinta');
    }

    getFirstDayOfMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
}

// Initialize app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.app = new OrderApp();
});