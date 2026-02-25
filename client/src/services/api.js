import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api',
  timeout: 30000, // 30s — PDF generation can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use(async (config) => {
  const token = await useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors + retry on 429
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401) {
      // Token expired — logout and redirect
      useAuthStore.getState().logout();
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Retry logic for 429 Too Many Requests
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
