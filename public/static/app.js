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
                                <input type="text" id="department" value="${this.currentUser.department || ''}" 
                                       class="w-full border border-gray-300 rounded-md px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Prioritetas</label>
                                <select id="priority" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                    <option value="low">Žemas</option>
                                    <option value="normal" selected>Normalus</option>
                                    <option value="high">Aukštas</option>
                                    <option value="urgent">Skubus</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Reikia iki</label>
                                <input type="date" id="needed_by_date" 
                                       class="w-full border border-gray-300 rounded-md px-3 py-2">
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Pagrindimas</label>
                            <textarea id="justification" rows="3" 
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
                    <button type="button" onclick="this.parentElement.parentElement.remove()" 
                            class="text-red-600 hover:text-red-800 text-sm">
                        Šalinti
                    </button>
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
                needed_by_date: formData.get('needed_by_date'),
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
}

// Initialize app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.app = new OrderApp();
});