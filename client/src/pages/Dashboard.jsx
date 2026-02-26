import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useAuthStore } from '../store/authStore';
import { invoiceApi } from '../services/api';
import { formatCurrency, formatCurrencyShort } from '../utils/formatCurrency';
import { formatDate, formatRelativeDate, getTimeOfDay } from '../utils/formatDate';
import './Dashboard.css';

// Status → Badge variant mapping
const statusVariant = {
    paid: 'success',
    sent: 'info',
    draft: 'default',
};

// Status → Display label mapping
const statusLabel = {
    paid: 'Paid',
    sent: 'Pending',
    draft: 'Draft',
};

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard stats on mount
    useEffect(() => {
        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await invoiceApi.getStats({ signal: controller.signal });
                if (!controller.signal.aborted) {
                    setStats(response.data.data);
                }
            } catch (err) {
                if (err.name === 'CanceledError' || err.name === 'AbortError') return;
                console.error('Dashboard fetch error:', err);
                setError(t('errors.loadDashboard'));
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchStats();

        return () => controller.abort();
    }, [t]);

    const handleRetry = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await invoiceApi.getStats();
            setStats(response.data.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success(t('dashboard.loggedOut'));
        navigate('/', { replace: true });
    };

    // Extract first name for greeting
    const userName = user?.user_metadata?.full_name
        || user?.email?.split('@')[0]
        || 'Dad';

    const timeOfDay = getTimeOfDay();

    return (
        <>
            <TopBar
                title="Crown Interiors"
                titleTamil="கிரவுன் இன்டீரியர்ஸ்"
                actions={
                    <button
                        className="dashboard__logout-btn"
                        onClick={handleLogout}
                        aria-label={t('actions.logout')}
                        title={t('actions.logout')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                }
            />

            <div className="page">
                {/* ── Welcome ── */}
                <motion.div
                    className="dashboard__welcome"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="dashboard__greeting">
                        👋 {t(`dashboard.greeting`, { timeOfDay, name: userName })}
                    </h2>
                </motion.div>

                {/* ── Stats Grid ── */}
                <section className="dashboard__section">
                    <h3 className="dashboard__section-title">
                        {t('dashboard.quickStats')}
                    </h3>

                    {isLoading ? (
                        <div className="dashboard__stats-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <Skeleton variant="text" width="80%" />
                                    <Skeleton variant="text" width="50%" height="28px" />
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <Card>
                            <div className="dashboard__error">
                                <p>⚠️ {error}</p>
                                <Button variant="ghost" size="sm" onClick={handleRetry}>
                                    Retry
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="dashboard__stats-grid">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                            >
                                <Card variant="elevated">
                                    <p className="dashboard__stat-label">
                                        {t('dashboard.invoicesThisMonth')}
                                    </p>
                                    <p className="dashboard__stat-value">
                                        {stats?.invoices_this_month ?? 0}
                                    </p>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card variant="elevated">
                                    <p className="dashboard__stat-label">
                                        {t('dashboard.revenueThisMonth')}
                                    </p>
                                    <p className="dashboard__stat-value dashboard__stat-value--currency">
                                        {formatCurrencyShort(stats?.revenue_this_month ?? 0)}
                                    </p>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <Card variant="elevated">
                                    <p className="dashboard__stat-label">{t('dashboard.totalInvoices')}</p>
                                    <p className="dashboard__stat-value">
                                        {stats?.total_invoices ?? 0}
                                    </p>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card variant="elevated">
                                    <p className="dashboard__stat-label">{t('dashboard.pendingAmount')}</p>
                                    <p className="dashboard__stat-value dashboard__stat-value--pending">
                                        {formatCurrencyShort(stats?.pending_amount ?? 0)}
                                    </p>
                                </Card>
                            </motion.div>
                        </div>
                    )}
                </section>

                {/* ── Quick Actions ── */}
                <section className="dashboard__section">
                    <div className="dashboard__actions">
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate('/invoice/new')}
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            }
                        >
                            {t('dashboard.createInvoice')}
                        </Button>
                        <Button
                            variant="secondary"
                            size="default"
                            fullWidth
                            onClick={() => navigate('/invoice/new?type=estimate')}
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            }
                        >
                            {t('dashboard.createEstimate')}
                        </Button>
                    </div>
                </section>

                {/* ── Recent Invoices ── */}
                <section className="dashboard__section">
                    <div className="dashboard__section-header">
                        <h3 className="dashboard__section-title">
                            {t('dashboard.recentInvoices')}
                        </h3>
                        <Link to="/history" className="dashboard__view-all">
                            {t('dashboard.viewAll')}
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="dashboard__invoices-list">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <Skeleton variant="text" width="60%" />
                                            <Skeleton variant="text" width="40%" />
                                        </div>
                                        <Skeleton variant="text" width="60px" height="22px" />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
                                        <Skeleton variant="text" width="80px" height="24px" />
                                        <Skeleton variant="text" width="100px" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : stats?.recent_invoices?.length === 0 ? (
                        <Card>
                            <div className="dashboard__empty">
                                <span className="dashboard__empty-icon">📋</span>
                                <p className="dashboard__empty-title">{t('history.noInvoices')}</p>
                                <p className="dashboard__empty-subtitle">{t('history.noInvoicesSubtext')}</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="dashboard__invoices-list">
                            {stats?.recent_invoices?.map((invoice, index) => (
                                <motion.div
                                    key={invoice.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                >
                                    <Card
                                        hoverable
                                        onClick={() => navigate(`/invoice/${invoice.id}`)}
                                    >
                                        <div className="dashboard__invoice-row">
                                            <div className="dashboard__invoice-info">
                                                <p className="dashboard__invoice-name">
                                                    {invoice.customer_name}
                                                </p>
                                                <p className="dashboard__invoice-number">
                                                    {invoice.invoice_number}
                                                    {invoice.document_type === 'estimate' && (
                                                        <span className="dashboard__invoice-type"> · Estimate</span>
                                                    )}
                                                </p>
                                            </div>
                                            <Badge variant={statusVariant[invoice.status] || 'default'}>
                                                {statusLabel[invoice.status] || invoice.status}
                                            </Badge>
                                        </div>
                                        <div className="dashboard__invoice-footer">
                                            <span className="dashboard__invoice-amount">
                                                {formatCurrency(invoice.total_amount, false)}
                                            </span>
                                            <span className="dashboard__invoice-date">
                                                {formatDate(invoice.invoice_date || invoice.created_at)}
                                            </span>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default Dashboard;
