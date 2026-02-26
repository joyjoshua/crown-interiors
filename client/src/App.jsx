import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';

// Layouts (keep eagerly loaded — small, needed immediately)
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Lazy-loaded pages — only fetched when the route is navigated to
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InvoiceCreate = lazy(() => import('./pages/InvoiceCreate'));
const InvoiceEdit = lazy(() => import('./pages/InvoiceEdit'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));
const InvoiceHistory = lazy(() => import('./pages/InvoiceHistory'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Store
import { useAuthStore } from './store/authStore';

// Route-level loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60dvh',
    opacity: 0.5,
  }}>
    <div style={{
      width: 32,
      height: 32,
      border: '3px solid var(--border-light)',
      borderTopColor: 'var(--color-primary-600)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  </div>
);

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoice/new" element={<InvoiceCreate />} />
              <Route path="/invoice/:id/edit" element={<InvoiceEdit />} />
              <Route path="/invoice/:id" element={<InvoiceDetail />} />
              <Route path="/history" element={<InvoiceHistory />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 20px',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: '#34C759',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF3B30',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
