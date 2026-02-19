import TopBar from '../components/ui/TopBar';
import { useTranslation } from 'react-i18next';

const InvoiceCreate = () => {
    const { t } = useTranslation();

    return (
        <>
            <TopBar
                title={t('invoice.new')}
                titleTamil="புதிய விலைப்பட்டியல்"
                showBack
            />
            <div className="page">
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    Invoice creation form coming in Phase 3...
                </p>
            </div>
        </>
    );
};

export default InvoiceCreate;
