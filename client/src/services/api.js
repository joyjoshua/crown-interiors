import axios from 'axios';
import { useAuthStore, _refreshSessionOnce } from '../store/authStore';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api',
  timeout: 30000, // 30s — PDF generation can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach a FRESH JWT
api.interceptors.request.use(async (config) => {
  const token = await useAuthStore.getState().getAccessToken();
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
  }
  return config;
});

// Response interceptor — handle auth errors + retry on 429
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // ── 401 Unauthorized — try to refresh the token once before giving up ──
    if (response?.status === 401 && !config.__authRetried) {
      config.__authRetried = true;

      try {
        // Use the shared refresh mutex — prevents concurrent refresh storms
        // when multiple 401s arrive at the same time
        const { data: { session } } = await _refreshSessionOnce();

        if (session?.access_token) {
          // Update in-memory store with the refreshed session
          useAuthStore.setState({
            session,
            user: session.user,
            isAuthenticated: true,
          });

          // Retry the original request with the fresh token
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${session.access_token}`);
          } else {
            config.headers = { ...config.headers, Authorization: `Bearer ${session.access_token}` };
          }
          return api(config);
        }
      } catch {
        // Refresh failed — session is truly expired
      }

      // Refresh failed or no session — log out gracefully via React Router
      // Do NOT use window.location.href — it kills in-flight requests
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // ── 429 Too Many Requests — retry with backoff ──
    if (response?.status === 429) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = 3;

      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;

        // Respect Retry-After header, or use exponential backoff (1s, 2s, 4s)
        const retryAfter = response.headers['retry-after'];
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, config.__retryCount - 1) * 1000;

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

// ===== Invoice API =====

export const invoiceApi = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  delete: (id) => api.delete(`/invoices/${id}`),
  duplicate: (id) => api.post(`/invoices/${id}/duplicate`),
  generatePdf: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  getStats: (config) => api.get('/invoices/stats', config),
};

export default api;
