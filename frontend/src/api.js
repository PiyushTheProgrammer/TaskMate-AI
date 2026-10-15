const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('taskmate_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const err = await res.json();
      errMessage = err.detail || err.message || JSON.stringify(err);
    } catch (e) {
      errMessage = res.statusText;
    }
    throw new Error(errMessage);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return res;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('taskmate_token', data.access_token);
    localStorage.setItem('taskmate_user', JSON.stringify(data.user));
    return data;
  },
  register: async (payload) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('taskmate_token', data.access_token);
    localStorage.setItem('taskmate_user', JSON.stringify(data.user));
    return data;
  },
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  logout: () => {
    localStorage.removeItem('taskmate_token');
    localStorage.removeItem('taskmate_user');
  },

  // Clients
  listClients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/clients${query ? '?' + query : ''}`);
  },
  createClient: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
  getClientSuggestions: (id) => request(`/clients/${id}/ai-suggestions`),

  // Requirements Analyzer
  analyzeText: (data) => request('/analyzer/analyze-text', { method: 'POST', body: JSON.stringify(data) }),
  uploadDoc: (formData) => request('/analyzer/upload-doc', { method: 'POST', body: formData }),
  saveRequirement: (data) => request('/analyzer/save', { method: 'POST', body: JSON.stringify(data) }),
  getRequirementHistory: (clientId) => {
    const q = clientId ? `?client_id=${clientId}` : '';
    return request(`/analyzer/history${q}`);
  },

  // Proposals & Quotes
  listProposals: (clientId) => {
    const q = clientId ? `?client_id=${clientId}` : '';
    return request(`/proposals${q}`);
  },
  generateProposal: (data) => request('/proposals/generate', { method: 'POST', body: JSON.stringify(data) }),
  updateProposal: (id, data) => request(`/proposals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProposal: (id) => request(`/proposals/${id}`, { method: 'DELETE' }),
  getProposalPdfUrl: (id) => `/api/proposals/${id}/pdf`,

  // Invoices
  listInvoices: () => request('/proposals/invoices/all'),
  createInvoice: (data) => request('/proposals/invoices/create', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoiceStatus: (id, status) => request(`/proposals/invoices/${id}/status?status=${status}`, { method: 'PUT' }),
  getInvoicePdfUrl: (id) => `/api/proposals/invoices/${id}/pdf`,

  // Outreach
  generateOutreachMessage: (data) => request('/outreach/generate', { method: 'POST', body: JSON.stringify(data) }),
  sendOutreachMessage: (data) => request('/outreach/send', { method: 'POST', body: JSON.stringify(data) }),
  getOutreachHistory: (clientId) => {
    const q = clientId ? `?client_id=${clientId}` : '';
    return request(`/outreach/history${q}`);
  },
  cancelOutreachMessage: (id) => request(`/outreach/${id}`, { method: 'DELETE' }),

  // Scheduler
  listEvents: () => request('/schedule'),
  createEvent: (data) => request('/schedule', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/schedule/${id}`, { method: 'DELETE' }),
  syncGoogle: () => request('/schedule/sync-google', { method: 'POST' }),

  // Multi-Agent Task Orchestrator
  listTasks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/tasks${q ? '?' + q : ''}`);
  },
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  processTask: (id) => request(`/tasks/${id}/process`, { method: 'POST' }),
  reviewTask: (id, data) => request(`/tasks/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Business Analytics
  getDashboardSummary: () => request('/analytics/dashboard'),
  getFinances: () => request('/analytics/finances'),
  logFinance: (data) => request('/analytics/finances', { method: 'POST', body: JSON.stringify(data) }),

  // Administrator Functions
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (userId, role) => request(`/admin/users/${userId}/role?role=${role}`, { method: 'PUT' }),
  getAdminConfig: () => request('/admin/config'),
  updateAdminConfig: (data) => request('/admin/config', { method: 'POST', body: JSON.stringify(data) }),
  getAuditLogs: () => request('/admin/audit-logs'),
  getHealthMetrics: () => request('/admin/health-metrics'),
};
