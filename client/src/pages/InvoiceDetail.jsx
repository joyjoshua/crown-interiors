import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TopBar from '../components/ui/TopBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { invoiceApi } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import './InvoiceDetail.css';

// ── Icon Components ──

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

const DuplicateIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

// ── Status helpers ──

const getStatusBadge = (status) => {
    const map = {
        draft: { variant: 'default', label: 'Draft' },
        sent: { variant: 'info', label: 'Sent' },
        paid: { variant: 'success', label: 'Paid' },
        pending: { variant: 'warning', label: 'Pending' },
        overdue: { variant: 'error', label: 'Overdue' },
        cancelled: { variant: 'error', label: 'Cancelled' },
    };
    const config = map[status] || map.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

// ── Page animation ──

const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    }),
};

// ════════════════════════════════════════════════════════════════
//  InvoiceDetail Page
// ════════════════════════════════════════════════════════════════

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [duplicateLoading, setDuplicateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ── Fetch invoice data ──
    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await invoiceApi.getById(id);
                setInvoice(response.data.data);
            } catch (err) {
                console.error('Fetch invoice error:', err);
                const msg = err.response?.data?.error || t('errors.serverError');
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id, t]);

    // ── Actions ──

    const handleDownloadPdf = async () => {
        try {
            setPdfLoading(true);
            const response = await invoiceApi.generatePdf(id);

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice.invoice_number}-${invoice.document_type}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t('toast.downloaded'));
        } catch (err) {
            console.error('PDF download error:', err);
            toast.error(t('errors.serverError'));
        } finally {
            setPdfLoading(false);
        }
    };

    const handleShareWhatsApp = async () => {
        if (!invoice) return;

        const plainMessage =
            `Hi ${invoice.customer_name},\n\n` +
            `Please find your ${invoice.document_type} from Crown Interiors.\n\n` +
            `${invoice.document_type.toUpperCase()}: ${invoice.invoice_number}\n` +
            `Amount: ${formatCurrency(invoice.total_amount)}\n` +
            `Date: ${formatDate(invoice.invoice_date)}\n\n` +
            `Thank you for your business! 🙏\n` +
            `Crown Interiors`;

        const phone = (invoice.customer_phone || '').replace(/[^0-9]/g, '');
        const phoneParam = phone.startsWith('91') ? phone : `91${phone}`;

        // ── Try Web Share API with PDF file (works on mobile browsers) ──
        if (navigator.canShare) {
            try {
                setShareLoading(true);
                const response = await invoiceApi.generatePdf(id);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const fileName = `${invoice.invoice_number}-${invoice.document_type}.pdf`;
                const file = new File([blob], fileName, { type: 'application/pdf' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        text: plainMessage,
                    });
                    toast.success(t('toast.shared'));
                    return;
                }
            } catch (err) {
                // User cancelled share or API error — fall through to text link
                if (err.name !== 'AbortError') {
                    console.warn('Web Share with file failed, falling back:', err);
                }
            } finally {
                setShareLoading(false);
            }
        }

        // ── Fallback: text-only WhatsApp deep link ──
        const encodedMessage = encodeURIComponent(plainMessage);
        window.open(`https://wa.me/${phoneParam}?text=${encodedMessage}`, '_blank');
        toast.success(t('toast.shared'));
    };

    const handleDuplicate = async () => {
        try {
            setDuplicateLoading(true);
            const response = await invoiceApi.duplicate(id);
            toast.success(t('toast.duplicated'));
            // Navigate to the newly created duplicate
            navigate(`/invoice/${response.data.data.id}`, { replace: true });
        } catch (err) {
            console.error('Duplicate error:', err);
            toast.error(t('errors.serverError'));
        } finally {
            setDuplicateLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/invoice/${id}/edit`);
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            await invoiceApi.delete(id);
            toast.success(t('toast.deleted'));
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(t('errors.serverError'));
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    // ── Loading state ──
    if (loading) {
        return (
            <>
                <TopBar
                    title={t('invoice.title')}
                    titleTamil="விலைப்பட்டியல்"
                    showBack
                    onBack={() => navigate(-1)}
                />
                <div className="page">
                    <div className="detail-loading">
                        <Skeleton width="60%" height="28px" />
                        <Skeleton width="100%" height="80px" />
                        <Skeleton width="100%" height="300px" />
                    </div>
                </div>
            </>
        );
    }

    // ── Error state ──
    if (error || !invoice) {
        return (
            <>
                <TopBar
                    title={t('invoice.title')}
                    titleTamil="விலைப்பட்டியல்"
                    showBack
                    onBack={() => navigate(-1)}
                />
                <div className="page">
                    <div className="detail-error">
                        <div className="detail-error__icon">📄</div>
                        <h3 className="detail-error__title">Invoice Not Found</h3>
                        <p className="detail-error__message">
                            {error || 'This invoice does not exist or has been deleted.'}
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    // ── Computed values ──
    const isEstimate = invoice.document_type === 'estimate';
    const docLabel = isEstimate ? t('invoice.estimate') : t('invoice.title');
    const services = invoice.services || [];

    return (
        <>
            <TopBar
                title={`${docLabel} ${invoice.invoice_number || ''}`}
                titleTamil={isEstimate ? 'மதிப்பீடு' : 'விலைப்பட்டியல்'}
                showBack
                onBack={() => navigate(-1)}
            />

            <div className="page">
                {/* ── Status Header ── */}
                <motion.div
                    className="detail-status"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                >
                    <div className="detail-status__left">
                        <span className="detail-status__number">
                            {invoice.invoice_number}
                        </span>
                        {getStatusBadge(invoice.status)}
                    </div>
                    <span className="detail-status__date">
                        {formatDate(invoice.invoice_date)}
                    </span>
                </motion.div>

                {/* ── Action Buttons ── */}
                <motion.div
                    className="detail-actions"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                >
                    <button
                        className="detail-action-btn"
                        onClick={handleDownloadPdf}
                        disabled={pdfLoading}
                        id="btn-download-pdf"
                    >
                        <span className="detail-action-btn__icon detail-action-btn__icon--download">
                            <DownloadIcon />
                        </span>
                        <span className="detail-action-btn__label">
                            {pdfLoading ? 'Generating...' : t('actions.download')}
                        </span>
                    </button>

                    <button
                        className="detail-action-btn"
                        onClick={handleShareWhatsApp}
                        disabled={shareLoading}
                        id="btn-share-whatsapp"
                    >
                        <span className="detail-action-btn__icon detail-action-btn__icon--share">
                            <ShareIcon />
                        </span>
                        <span className="detail-action-btn__label">
                            {shareLoading ? 'Sharing...' : t('actions.share')}
                        </span>
                    </button>

                    <button
                        className="detail-action-btn"
                        onClick={handleEdit}
                        id="btn-edit-invoice"
                    >
                        <span className="detail-action-btn__icon detail-action-btn__icon--edit">
                            <EditIcon />
                        </span>
                        <span className="detail-action-btn__label">
                            {t('actions.edit')}
                        </span>
                    </button>

                    <button
                        className="detail-action-btn"
                        onClick={handleDuplicate}
                        disabled={duplicateLoading}
                        id="btn-duplicate-invoice"
                    >
                        <span className="detail-action-btn__icon detail-action-btn__icon--duplicate">
                            <DuplicateIcon />
                        </span>
                        <span className="detail-action-btn__label">
                            {duplicateLoading ? 'Duplicating...' : t('actions.duplicate')}
                        </span>
                    </button>
                </motion.div>

                {/* ── Invoice Preview Card ── */}
                <motion.div
                    className="detail-preview"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                >
                    {/* Header */}
                    <div className="detail-preview__header">
                        <div>
                            <h4 className="detail-preview__brand">Crown Interiors</h4>
                            <p className="detail-preview__type">{docLabel}</p>
                        </div>
                        <div className="detail-preview__date-block">
                            <p className="detail-preview__date-label">Date</p>
                            <p className="detail-preview__date">
                                {formatDate(invoice.invoice_date)}
                            </p>
                            {invoice.due_date && (
                                <>
                                    <p className="detail-preview__date-label" style={{ marginTop: 'var(--space-2)' }}>
                                        Due Date
                                    </p>
                                    <p className="detail-preview__date">
                                        {formatDate(invoice.due_date)}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="detail-preview__divider" />

                    {/* Customer */}
                    <div className="detail-preview__section">
                        <p className="detail-preview__label">Customer</p>
                        <p className="detail-preview__value">{invoice.customer_name}</p>
                        <p className="detail-preview__sub">{invoice.customer_phone}</p>
                        {invoice.customer_address && (
                            <p className="detail-preview__sub">{invoice.customer_address}</p>
                        )}
                        {invoice.customer_email && (
                            <p className="detail-preview__sub">{invoice.customer_email}</p>
                        )}
                    </div>

                    <div className="detail-preview__divider" />

                    {/* Services Table */}
                    <div className="detail-preview__section">
                        <p className="detail-preview__label">Services</p>
                        <div className="detail-preview__table">
                            <div className="detail-preview__thead">
                                <span>Item</span>
                                <span>Qty</span>
                                <span>Rate</span>
                                <span>Amt</span>
                            </div>
                            {services.map((s, i) => (
                                <div key={i} className="detail-preview__trow">
                                    <span className="detail-preview__item-desc">
                                        {s.description || '—'}
                                    </span>
                                    <span>{s.quantity}</span>
                                    <span>{formatCurrency(s.rate, false)}</span>
                                    <span>
                                        {formatCurrency(
                                            Number(s.quantity) * Number(s.rate),
                                            false
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-preview__divider" />

                    {/* Totals */}
                    <div className="detail-preview__totals">
                        <div className="detail-preview__totals-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(invoice.subtotal, false)}</span>
                        </div>
                        {invoice.tax_enabled && (
                            <div className="detail-preview__totals-row">
                                <span>GST ({invoice.tax_percentage}%)</span>
                                <span>{formatCurrency(invoice.tax_amount, false)}</span>
                            </div>
                        )}
                        {Number(invoice.discount_amount) > 0 && (
                            <div className="detail-preview__totals-row detail-preview__totals-row--discount">
                                <span>Discount</span>
                                <span>-{formatCurrency(invoice.discount_amount, false)}</span>
                            </div>
                        )}

                        <div className="detail-preview__totals-divider" />

                        <div className="detail-preview__totals-row detail-preview__totals-row--total">
                            <span>Total</span>
                            <span>{formatCurrency(invoice.total_amount)}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <>
                            <div className="detail-preview__divider" />
                            <div className="detail-preview__section">
                                <p className="detail-preview__label">Notes</p>
                                <p className="detail-preview__notes">{invoice.notes}</p>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* ── Delete Zone ── */}
                <motion.div
                    className="detail-danger"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                >
                    <button
                        className="detail-danger__btn"
                        onClick={() => setShowDeleteConfirm(true)}
                        id="btn-delete-invoice"
                    >
                        <TrashIcon />
                        {t('actions.delete')} {docLabel}
                    </button>
                </motion.div>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title={t('confirm.deleteTitle')}
                message={t('confirm.deleteMessage')}
                confirmLabel={t('actions.delete')}
                cancelLabel={t('actions.cancel')}
                destructive
                loading={deleteLoading}
            />
        </>
    );
};

export default InvoiceDetail;
