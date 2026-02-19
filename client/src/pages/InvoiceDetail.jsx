import TopBar from '../components/ui/TopBar';
import { useTranslation } from 'react-i18next';

const InvoiceDetail = () => {
    const { t } = useTranslation();

    return (
        <>
            <TopBar
                title={t('invoice.title')}
                titleTamil="விலைப்பட்டியல்"
                showBack
            />
            <div className="page">
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    Invoice detail view coming in Phase 5...
                </p>
            </div>
        </>
    );
};

export default InvoiceDetail;
