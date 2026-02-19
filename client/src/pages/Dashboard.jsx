import { useTranslation } from 'react-i18next';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatCurrencyShort } from '../utils/formatCurrency';

const Dashboard = () => {
    const { t } = useTranslation();

    return (
        <>
            <TopBar title="Crown Interiors" titleTamil="கிரவுன் இன்டீரியர்ஸ்" />
            <div className="page">
                {/* Welcome */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
                        👋 {t('dashboard.greeting', { timeOfDay: 'evening', name: 'Dad' })}
                    </h2>
                </div>

                {/* Quick Stats */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                        {t('dashboard.quickStats')}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <Card>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                {t('dashboard.invoicesThisMonth')}
                            </p>
                            <p className="amount" style={{ marginTop: 'var(--space-1)' }}>0</p>
                        </Card>
                        <Card>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                {t('dashboard.revenueThisMonth')}
                            </p>
                            <p className="amount" style={{ marginTop: 'var(--space-1)' }}>{formatCurrencyShort(0)}</p>
                        </Card>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    <Button variant="primary" size="lg" fullWidth icon="➕">
                        {t('dashboard.createInvoice')}
                    </Button>
                    <Button variant="secondary" size="default" fullWidth icon="📝">
                        {t('dashboard.createEstimate')}
                    </Button>
                </div>

                {/* Recent Invoices */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
                            {t('dashboard.recentInvoices')}
                        </h3>
                        <a href="/history" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                            {t('dashboard.viewAll')}
                        </a>
                    </div>
                    {/* Placeholder invoices — will be populated in Phase 3+ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <Card hoverable>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)' }}>Rajesh Kumar</p>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '2px' }}>Kitchen Cabinet Installation</p>
                                </div>
                                <Badge variant="success">Paid</Badge>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
                                <span className="amount" style={{ fontSize: 'var(--text-lg)' }}>₹45,000</span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>CI-042 · 12 Feb</span>
                            </div>
                        </Card>
                        <Card hoverable>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)' }}>Priya Sharma</p>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '2px' }}>Wardrobe Design</p>
                                </div>
                                <Badge variant="warning">Pending</Badge>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
                                <span className="amount" style={{ fontSize: 'var(--text-lg)' }}>₹28,500</span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>CI-041 · 10 Feb</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
