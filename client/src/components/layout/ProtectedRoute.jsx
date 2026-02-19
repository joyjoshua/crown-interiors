import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Skeleton from '../ui/Skeleton';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100dvh',
                padding: 'var(--space-8)',
                gap: 'var(--space-4)',
            }}>
                <Skeleton variant="circular" height="48px" />
                <Skeleton variant="text" width="200px" />
                <Skeleton variant="text" width="160px" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
