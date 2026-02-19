import TopBar from '../components/ui/TopBar';
import { useTranslation } from 'react-i18next';

const InvoiceHistory = () => {
    const { t } = useTranslation();

    return (
        <>
            <TopBar title={t('history.title')} titleTamil="விலைப்பட்டியல் வரலாறு" />
            <div className="page">
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    Invoice history coming in Phase 5...
                </p>
            </div>
        </>
    );
};

export default InvoiceHistory;
