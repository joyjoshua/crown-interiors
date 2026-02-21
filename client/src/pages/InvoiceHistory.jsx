import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import SearchBar from '../components/ui/SearchBar';
import FilterChip from '../components/ui/FilterChip';
import EmptyState from '../components/ui/EmptyState';
import { invoiceApi } from '../services/api';
import { useInvoiceStore } from '../store/invoiceStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeDate } from '../utils/formatDate';
import './InvoiceHistory.css';

// ── Status config ──
const STATUS_BADGE = {
    paid: { variant: 'success', label: 'Paid' },
    sent: { variant: 'info', label: 'Sent' },
    pending: { variant: 'warning', label: 'Pending' },
    draft: { variant: 'default', label: 'Draft' },
    overdue: { variant: 'error', label: 'Overdue' },
    cancelled: { variant: 'error', label: 'Cancelled' },
};

const getStatusBadge = (status) => {
    const cfg = STATUS_BADGE[status] || STATUS_BADGE.draft;
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

// ── Sort options ──
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'amount_high', label: 'Amount ↑' },
    { value: 'amount_low', label: 'Amount ↓' },
];

// ── Type filter chips ──
const TYPE_CHIPS = [
    { value: 'all', label: 'All' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'estimate', label: 'Estimates' },
];

// ── Status filter chips ──
const STATUS_CHIPS = [
    { value: 'all', label: 'Any status' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
];

// ── Card animation ──
const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.04, duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    }),
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const InvoiceHistory = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // ── Store ──
    const {
        invoices,
        setInvoices,
        filters,
        setFilters,
        resetFilters,
        getFilteredInvoices,
    } = useInvoiceStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef(null);

    // ── Fetch all invoices on mount ──
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await invoiceApi.getAll();
                const raw = response.data.data;
                // getAll returns { invoices: [], pagination: {} }
                const list = Array.isArray(raw)
                    ? raw                          // future-proof: if API ever returns flat array
                    : Array.isArray(raw?.invoices)
                        ? raw.invoices             // current shape: { invoices: [], pagination: {} }
                        : [];
                setInvoices(list);
            } catch (err) {
                console.error('History fetch error:', err);
                setError('Failed to load invoices.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        // Reset filters when page opens
        resetFilters();
    }, []);

    // ── Debounced search ──
    const searchTimer = useRef(null);
    const handleSearchChange = (e) => {
        const val = e.target.value;
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setFilters({ search: val });
        }, 300);
    };

    const handleSearchClear = useCallback(() => {
        setFilters({ search: '' });
    }, [setFilters]);

    // ── Close sort dropdown on outside click ──
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setShowSort(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentSortLabel =
        SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || 'Newest';

    // ── Skeleton loader ──
    if (loading) {
        return (
            <>
                <TopBar
                    title={t('history.title')}
                    titleTamil="விலைப்பட்டியல் வரலாறு"
                    showBack
                />
                <div className="page">
                    <div className="history-search-row">
                        <Skeleton width="100%" height="48px" />
                    </div>
                    <div className="history-chips">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} width="70px" height="34px" />
                        ))}
                    </div>
                    <div className="history-list">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <Skeleton variant="text" width="55%" />
                                        <Skeleton variant="text" width="35%" />
                                    </div>
                                    <Skeleton width="52px" height="22px" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
                                    <Skeleton width="80px" height="22px" />
                                    <Skeleton width="90px" height="14px" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    // ── Error state ──
    if (error) {
        return (
            <>
                <TopBar title={t('history.title')} titleTamil="விலைப்பட்டியல் வரலாறு" showBack />
                <div className="page">
                    <EmptyState
                        icon="⚠️"
                        title="Could not load invoices"
                        subtitle={error}
                        action={{
                            label: 'Try Again',
                            onClick: () => window.location.reload(),
                        }}
                    />
                </div>
            </>
        );
    }

    // ── Derived filtered list (after early returns so only runs with data) ──
    const filtered = getFilteredInvoices();

    return (
        <>
            <TopBar
                title={t('history.title')}
                titleTamil="விலைப்பட்டியல் வரலாறு"
                showBack
            />

            <div className="page">
                {/* ── Search ── */}
                <div className="history-search-row">
                    <SearchBar
                        placeholder={t('history.search')}
                        onChange={handleSearchChange}
                        onClear={handleSearchClear}
                        id="history-search"
                    />
                </div>

                {/* ── Type filters ── */}
                <div className="history-chips" role="group" aria-label="Filter by type">
                    {TYPE_CHIPS.map((chip) => (
                        <FilterChip
                            key={chip.value}
                            label={chip.label}
                            active={filters.type === chip.value}
                            onClick={() => setFilters({ type: chip.value })}
                        />
                    ))}
                </div>

                {/* ── Status + Sort row ── */}
                <div className="history-toolbar">
                    <div className="history-status-chips" role="group" aria-label="Filter by status">
                        {STATUS_CHIPS.map((chip) => (
                            <FilterChip
                                key={chip.value}
                                label={chip.label}
                                active={filters.status === chip.value}
                                onClick={() => setFilters({ status: chip.value })}
                            />
                        ))}
                    </div>

                    {/* Sort dropdown */}
                    <div className="history-sort" ref={sortRef}>
                        <button
                            type="button"
                            className="history-sort__btn"
                            onClick={() => setShowSort((v) => !v)}
                            aria-label="Sort invoices"
                            id="btn-sort-invoices"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="6" y1="12" x2="18" y2="12" />
                                <line x1="9" y1="18" x2="15" y2="18" />
                            </svg>
                            <span>{currentSortLabel}</span>
                        </button>

                        <AnimatePresence>
                            {showSort && (
                                <motion.div
                                    className="history-sort__menu"
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`history-sort__option ${filters.sortBy === opt.value ? 'history-sort__option--active' : ''}`}
                                            onClick={() => {
                                                setFilters({ sortBy: opt.value });
                                                setShowSort(false);
                                            }}
                                        >
                                            {filters.sortBy === opt.value && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                            {opt.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Results count ── */}
                {!loading && invoices.length > 0 && (
                    <p className="history-count">
                        {filtered.length === invoices.length
                            ? `${invoices.length} ${invoices.length === 1 ? 'invoice' : 'invoices'}`
                            : `${filtered.length} of ${invoices.length}`}
                    </p>
                )}

                {/* ── Invoice List ── */}
                {filtered.length === 0 ? (
                    <EmptyState
                        icon={invoices.length === 0 ? '📋' : '🔍'}
                        title={
                            invoices.length === 0
                                ? t('history.noInvoices')
                                : 'No results found'
                        }
                        subtitle={
                            invoices.length === 0
                                ? t('history.noInvoicesSubtext')
                                : 'Try adjusting your search or filters'
                        }
                        action={
                            invoices.length === 0
                                ? { label: 'Create Invoice', onClick: () => navigate('/invoice/new') }
                                : { label: 'Clear filters', onClick: () => { resetFilters(); handleSearchClear(); } }
                        }
                    />
                ) : (
                    <div className="history-list">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((invoice, index) => (
                                <motion.div
                                    key={invoice.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    custom={index}
                                    layout
                                >
                                    <Card
                                        hoverable
                                        onClick={() => navigate(`/invoice/${invoice.id}`)}
                                    >
                                        {/* ── Top row ── */}
                                        <div className="history-card__top">
                                            <div className="history-card__info">
                                                <p className="history-card__name">
                                                    {invoice.customer_name}
                                                </p>
                                                <p className="history-card__meta">
                                                    <span className="history-card__number">
                                                        {invoice.invoice_number}
                                                    </span>
                                                    {invoice.document_type === 'estimate' && (
                                                        <span className="history-card__type">
                                                            · Estimate
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {getStatusBadge(invoice.status)}
                                        </div>

                                        {/* ── Bottom row ── */}
                                        <div className="history-card__bottom">
                                            <span className="history-card__amount">
                                                {formatCurrency(invoice.total_amount, false)}
                                            </span>
                                            <span className="history-card__date">
                                                {formatRelativeDate(invoice.created_at)}
                                            </span>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </>
    );
};

export default InvoiceHistory;
