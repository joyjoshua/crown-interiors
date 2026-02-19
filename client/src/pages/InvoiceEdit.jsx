import TopBar from '../components/ui/TopBar';
import { useTranslation } from 'react-i18next';

const InvoiceEdit = () => {
    const { t } = useTranslation();

    return (
        <>
            <TopBar
                title={t('invoice.edit')}
                titleTamil="விலைப்பட்டியல் திருத்து"
                showBack
            />
            <div className="page">
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    Invoice editing coming in Phase 3...
                </p>
            </div>
        </>
    );
};

export default InvoiceEdit;
