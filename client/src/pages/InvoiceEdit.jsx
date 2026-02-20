import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TopBar from '../components/ui/TopBar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Skeleton from '../components/ui/Skeleton';
import { invoiceApi } from '../services/api';
import useInvoiceCalculations from '../hooks/useInvoiceCalculations';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import './InvoiceCreate.css'; // Reuse create styles

// ── Steps config (same as InvoiceCreate) ──
const STEPS = [
    { label: 'invoice.step1' },
    { label: 'invoice.step2' },
    { label: 'invoice.step3' },
    { label: 'invoice.step4' },
];

const InvoiceEdit = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [docType, setDocType] = useState('invoice');

    // ── Form setup ──
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        trigger,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            document_type: 'invoice',
            customer_name: '',
            customer_phone: '',
            customer_address: '',
            customer_email: '',
            services: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
            subtotal: 0,
            tax_enabled: true,
            tax_percentage: 18,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: 0,
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: '',
            notes: '',
        },
        mode: 'onBlur',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'services',
    });

    const { subtotal, taxAmount, total, updateLineAmount, syncToForm } =
        useInvoiceCalculations(watch, setValue);

    // ── Fetch existing invoice and pre-fill ──
    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setFetchLoading(true);
                setFetchError(null);
                const response = await invoiceApi.getById(id);
                const inv = response.data.data;

                setDocType(inv.document_type || 'invoice');

                // Parse services — Supabase may return JSONB as a string
                let rawServices = inv.services || [];
                if (typeof rawServices === 'string') {
                    try { rawServices = JSON.parse(rawServices); } catch { rawServices = []; }
                }
                if (!Array.isArray(rawServices)) rawServices = [];

                // Pre-fill all form fields
                reset({
                    document_type: inv.document_type || 'invoice',
                    customer_name: inv.customer_name || '',
                    customer_phone: inv.customer_phone || '',
                    customer_address: inv.customer_address || '',
                    customer_email: inv.customer_email || '',
                    services: rawServices.length > 0
                        ? rawServices.map((s) => ({
                            description: s.description || '',
                            quantity: s.quantity || 1,
                            rate: s.rate || 0,
                            amount: s.amount || 0,
                        }))
                        : [{ description: '', quantity: 1, rate: 0, amount: 0 }],
                    subtotal: inv.subtotal || 0,
                    tax_enabled: inv.tax_percentage > 0,
                    tax_percentage: inv.tax_percentage || 18,
                    tax_amount: inv.tax_amount || 0,
                    discount_amount: inv.discount_amount || 0,
                    total_amount: inv.total_amount || 0,
                    invoice_date: inv.invoice_date
                        ? inv.invoice_date.split('T')[0]
                        : new Date().toISOString().split('T')[0],
                    due_date: inv.due_date ? inv.due_date.split('T')[0] : '',
                    notes: inv.notes || '',
                });
            } catch (err) {
                console.error('Fetch invoice for edit error:', err);
                setFetchError('Could not load invoice. Please go back and try again.');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchInvoice();
    }, [id, reset]);

    // ── Step navigation ──
    const validateStep = async () => {
        let fieldsToValidate = [];
        switch (step) {
            case 0:
                fieldsToValidate = ['customer_name', 'customer_phone'];
                break;
            case 1:
                fieldsToValidate = fields.flatMap((_, i) => [
                    `services.${i}.description`,
                    `services.${i}.quantity`,
                    `services.${i}.rate`,
                ]);
                break;
            case 2:
                fieldsToValidate = ['invoice_date'];
                break;
            default:
                return true;
        }
        return await trigger(fieldsToValidate);
    };

    const [direction, setDirection] = useState(1);

    const goNext = async () => {
        const valid = await validateStep();
        if (valid) {
            if (step === 1) syncToForm();
            setDirection(1);
            setStep((s) => Math.min(s + 1, STEPS.length - 1));
        }
    };

    const goPrev = () => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 0));
    };

    // ── Submit (update) ──
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        syncToForm();

        const payload = {
            ...data,
            subtotal,
            tax_amount: taxAmount,
            total_amount: total,
            services: data.services.map((s) => ({
                ...s,
                quantity: Number(s.quantity),
                rate: Number(s.rate),
                amount: Number(s.quantity) * Number(s.rate),
            })),
            discount_amount: Number(data.discount_amount) || 0,
            due_date: data.due_date || null,
            notes: data.notes || null,
            customer_address: data.customer_address || null,
            customer_email: data.customer_email || null,
        };

        try {
            await invoiceApi.update(id, payload);
            toast.success(
                docType === 'estimate'
                    ? 'Estimate updated!'
                    : t('success.invoiceCreated').replace('Created', 'Updated')
            );
            navigate(`/invoice/${id}`, { replace: true });
        } catch (err) {
            console.error('Update invoice error:', err);
            const serverMsg = err.response?.data?.error || t('errors.serverError');
            toast.error(serverMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Slide animation ──
    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
    };

    // ── Loading skeleton ──
    if (fetchLoading) {
        return (
            <>
                <TopBar
                    title={t('invoice.edit')}
                    titleTamil="விலைப்பட்டியல் திருத்து"
                    showBack
                    onBack={() => navigate(-1)}
                />
                <div className="page">
                    <Skeleton width="100%" height="44px" style={{ marginBottom: 'var(--space-5)' }} />
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="text" width="100%" style={{ marginBottom: 'var(--space-3)' }} />
                    ))}
                </div>
            </>
        );
    }

    // ── Fetch error ──
    if (fetchError) {
        return (
            <>
                <TopBar
                    title={t('invoice.edit')}
                    titleTamil="விலைப்பட்டியல் திருத்து"
                    showBack
                    onBack={() => navigate(-1)}
                />
                <div className="page">
                    <Card>
                        <p style={{ color: 'var(--color-error)', textAlign: 'center', padding: 'var(--space-6)' }}>
                            ⚠️ {fetchError}
                        </p>
                        <Button variant="ghost" fullWidth onClick={() => navigate(-1)}>
                            ← Go Back
                        </Button>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <TopBar
                title={
                    docType === 'estimate'
                        ? 'Edit Estimate'
                        : t('invoice.edit')
                }
                titleTamil="விலைப்பட்டியல் திருத்து"
                showBack
                onBack={() => navigate(-1)}
            />

            <div className="page">
                <ProgressIndicator steps={STEPS} currentStep={step} />

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* ────────── STEP 1: Customer Details ────────── */}
                            {step === 0 && (
                                <div className="invoice-step">
                                    <h3 className="invoice-step__title">{t('invoice.step1')}</h3>
                                    <p className="invoice-step__desc">Edit customer information</p>

                                    <div className="invoice-step__fields">
                                        <Input
                                            label={t('invoice.customerName')}
                                            labelTamil="வாடிக்கையாளர் பெயர்"
                                            placeholder="e.g. Rajesh Kumar"
                                            required
                                            id="edit-customer-name"
                                            error={errors.customer_name?.message}
                                            {...register('customer_name', {
                                                required: t('errors.required'),
                                                minLength: { value: 2, message: 'Min 2 characters' },
                                            })}
                                        />
                                        <Input
                                            label={t('invoice.phone')}
                                            labelTamil="தொலைபேசி எண்"
                                            type="tel"
                                            inputMode="tel"
                                            placeholder="9876543210"
                                            required
                                            id="edit-customer-phone"
                                            error={errors.customer_phone?.message}
                                            {...register('customer_phone', {
                                                required: t('errors.required'),
                                                pattern: {
                                                    value: /^[+]?[0-9]{10,13}$/,
                                                    message: t('errors.invalidPhone'),
                                                },
                                            })}
                                        />
                                        <Input
                                            label={t('invoice.address')}
                                            labelTamil="முகவரி"
                                            placeholder="123, Anna Nagar, Chennai"
                                            id="edit-customer-address"
                                            {...register('customer_address')}
                                        />
                                        <Input
                                            label={t('invoice.email')}
                                            labelTamil="மின்னஞ்சல் (விரும்பினால்)"
                                            type="email"
                                            inputMode="email"
                                            placeholder="customer@email.com"
                                            id="edit-customer-email"
                                            error={errors.customer_email?.message}
                                            {...register('customer_email', {
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: t('errors.invalidEmail'),
                                                },
                                            })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ────────── STEP 2: Services + Amounts ────────── */}
                            {step === 1 && (
                                <div className="invoice-step">
                                    <h3 className="invoice-step__title">{t('invoice.step2')}</h3>
                                    <p className="invoice-step__desc">Edit services and amounts</p>

                                    <div className="invoice-services">
                                        {fields.map((field, index) => (
                                            <Card key={field.id} variant="outlined" className="invoice-service-card">
                                                <div className="invoice-service-card__header">
                                                    <span className="invoice-service-card__num">#{index + 1}</span>
                                                    {fields.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="invoice-service-card__remove"
                                                            onClick={() => remove(index)}
                                                            aria-label="Remove service"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                                <Input
                                                    label={t('invoice.serviceDescription')}
                                                    labelTamil="சேவை விவரம்"
                                                    placeholder="e.g. Modular Kitchen Setup"
                                                    required
                                                    id={`edit-service-desc-${index}`}
                                                    error={errors.services?.[index]?.description?.message}
                                                    {...register(`services.${index}.description`, {
                                                        required: t('errors.required'),
                                                        minLength: { value: 2, message: 'Min 2 characters' },
                                                    })}
                                                />

                                                <div className="invoice-service-card__row">
                                                    <Input
                                                        label={t('invoice.quantity')}
                                                        type="number"
                                                        inputMode="numeric"
                                                        placeholder="1"
                                                        required
                                                        id={`edit-service-qty-${index}`}
                                                        error={errors.services?.[index]?.quantity?.message}
                                                        {...register(`services.${index}.quantity`, {
                                                            required: t('errors.required'),
                                                            min: { value: 1, message: 'Min 1' },
                                                            onChange: () => updateLineAmount(index),
                                                        })}
                                                    />
                                                    <Input
                                                        label={t('invoice.rate')}
                                                        type="number"
                                                        inputMode="decimal"
                                                        placeholder="0"
                                                        required
                                                        id={`edit-service-rate-${index}`}
                                                        error={errors.services?.[index]?.rate?.message}
                                                        {...register(`services.${index}.rate`, {
                                                            required: t('errors.required'),
                                                            min: { value: 0, message: 'Min 0' },
                                                            onChange: () => updateLineAmount(index),
                                                        })}
                                                    />
                                                    <div className="invoice-service-card__amount">
                                                        <span className="invoice-service-card__amount-label">
                                                            {t('invoice.amount')}
                                                        </span>
                                                        <span className="invoice-service-card__amount-value">
                                                            {formatCurrency(
                                                                Number(watch(`services.${index}.quantity`) || 0) *
                                                                Number(watch(`services.${index}.rate`) || 0),
                                                                false
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            fullWidth
                                            onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
                                            icon={
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            }
                                        >
                                            {t('invoice.addService')}
                                        </Button>
                                    </div>

                                    {/* Summary */}
                                    <div className="invoice-summary">
                                        <div className="invoice-summary__row">
                                            <span>{t('invoice.subtotal')}</span>
                                            <span className="invoice-summary__value">{formatCurrency(subtotal, false)}</span>
                                        </div>

                                        <div className="invoice-summary__row invoice-summary__row--tax">
                                            <label className="invoice-summary__tax-toggle">
                                                <input type="checkbox" {...register('tax_enabled')} />
                                                <span>{t('invoice.tax')}</span>
                                                {watch('tax_enabled') && (
                                                    <input
                                                        type="number"
                                                        className="invoice-summary__tax-input"
                                                        inputMode="decimal"
                                                        {...register('tax_percentage')}
                                                    />
                                                )}
                                                {watch('tax_enabled') && <span>%</span>}
                                            </label>
                                            <span className="invoice-summary__value">{formatCurrency(taxAmount, false)}</span>
                                        </div>

                                        <div className="invoice-summary__row">
                                            <label className="invoice-summary__discount">
                                                <span>{t('invoice.discount')}</span>
                                                <span className="invoice-summary__discount-prefix">₹</span>
                                                <input
                                                    type="number"
                                                    className="invoice-summary__discount-input"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    {...register('discount_amount')}
                                                />
                                            </label>
                                            <span className="invoice-summary__value invoice-summary__value--discount">
                                                -{formatCurrency(watch('discount_amount') || 0, false)}
                                            </span>
                                        </div>

                                        <div className="invoice-summary__divider" />

                                        <div className="invoice-summary__row invoice-summary__row--total">
                                            <span>{t('invoice.total')}</span>
                                            <span className="invoice-summary__total">{formatCurrency(total, false)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ────────── STEP 3: Additional Details ────────── */}
                            {step === 2 && (
                                <div className="invoice-step">
                                    <h3 className="invoice-step__title">{t('invoice.step3')}</h3>
                                    <p className="invoice-step__desc">Update dates and notes</p>

                                    <div className="invoice-step__fields">
                                        <Input
                                            label={t('invoice.date')}
                                            labelTamil="தேதி"
                                            type="date"
                                            required
                                            id="edit-invoice-date"
                                            error={errors.invoice_date?.message}
                                            {...register('invoice_date', {
                                                required: t('errors.required'),
                                            })}
                                        />
                                        <Input
                                            label={t('invoice.dueDate')}
                                            labelTamil="செலுத்த வேண்டிய தேதி"
                                            type="date"
                                            id="edit-due-date"
                                            {...register('due_date')}
                                        />
                                        <TextArea
                                            label={t('invoice.notes')}
                                            labelTamil="குறிப்புகள் / விதிமுறைகள்"
                                            placeholder="e.g. 50% advance payment required."
                                            rows={4}
                                            maxLength={1000}
                                            id="edit-invoice-notes"
                                            {...register('notes')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ────────── STEP 4: Preview ────────── */}
                            {step === 3 && (
                                <div className="invoice-step">
                                    <h3 className="invoice-step__title">{t('invoice.step4')}</h3>
                                    <p className="invoice-step__desc">Review your changes</p>

                                    <Card variant="elevated" className="invoice-preview">
                                        <div className="invoice-preview__header">
                                            <div>
                                                <h4 className="invoice-preview__brand">Crown Interiors</h4>
                                                <p className="invoice-preview__type">
                                                    {docType === 'estimate' ? t('invoice.estimate') : t('invoice.title')}
                                                </p>
                                            </div>
                                            <p className="invoice-preview__date">
                                                {formatDate(watch('invoice_date'))}
                                            </p>
                                        </div>

                                        <div className="invoice-preview__divider" />

                                        <div className="invoice-preview__section">
                                            <p className="invoice-preview__label">Customer</p>
                                            <p className="invoice-preview__value">{watch('customer_name')}</p>
                                            <p className="invoice-preview__sub">{watch('customer_phone')}</p>
                                            {watch('customer_address') && <p className="invoice-preview__sub">{watch('customer_address')}</p>}
                                            {watch('customer_email') && <p className="invoice-preview__sub">{watch('customer_email')}</p>}
                                        </div>

                                        <div className="invoice-preview__divider" />

                                        <div className="invoice-preview__section">
                                            <p className="invoice-preview__label">Services</p>
                                            <div className="invoice-preview__table">
                                                <div className="invoice-preview__thead">
                                                    <span>Item</span>
                                                    <span>Qty</span>
                                                    <span>Rate</span>
                                                    <span>Amt</span>
                                                </div>
                                                {watch('services')?.map((s, i) => (
                                                    <div key={i} className="invoice-preview__trow">
                                                        <span className="invoice-preview__item-desc">{s.description || '—'}</span>
                                                        <span>{s.quantity}</span>
                                                        <span>{formatCurrency(s.rate, false)}</span>
                                                        <span>{formatCurrency(Number(s.quantity) * Number(s.rate), false)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="invoice-preview__divider" />

                                        <div className="invoice-preview__totals">
                                            <div className="invoice-preview__totals-row">
                                                <span>Subtotal</span>
                                                <span>{formatCurrency(subtotal, false)}</span>
                                            </div>
                                            {watch('tax_enabled') && (
                                                <div className="invoice-preview__totals-row">
                                                    <span>GST ({watch('tax_percentage')}%)</span>
                                                    <span>{formatCurrency(taxAmount, false)}</span>
                                                </div>
                                            )}
                                            {Number(watch('discount_amount')) > 0 && (
                                                <div className="invoice-preview__totals-row invoice-preview__totals-row--discount">
                                                    <span>Discount</span>
                                                    <span>-{formatCurrency(watch('discount_amount'), false)}</span>
                                                </div>
                                            )}
                                            <div className="invoice-preview__totals-divider" />
                                            <div className="invoice-preview__totals-row invoice-preview__totals-row--total">
                                                <span>Total</span>
                                                <span>{formatCurrency(total)}</span>
                                            </div>
                                        </div>

                                        {watch('notes') && (
                                            <>
                                                <div className="invoice-preview__divider" />
                                                <div className="invoice-preview__section">
                                                    <p className="invoice-preview__label">Notes</p>
                                                    <p className="invoice-preview__notes">{watch('notes')}</p>
                                                </div>
                                            </>
                                        )}
                                        {watch('due_date') && (
                                            <div className="invoice-preview__section">
                                                <p className="invoice-preview__label">Due Date</p>
                                                <p className="invoice-preview__value">{formatDate(watch('due_date'))}</p>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Navigation Buttons ── */}
                    <div className="invoice-nav">
                        {step > 0 && (
                            <Button type="button" variant="ghost" size="lg" onClick={goPrev}>
                                {t('invoice.previous')}
                            </Button>
                        )}
                        <div className="invoice-nav__spacer" />
                        {step < STEPS.length - 1 ? (
                            <Button type="button" variant="primary" size="lg" onClick={goNext}>
                                {t('invoice.next')}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                }
                                id="btn-save-invoice"
                            >
                                Save Changes
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default InvoiceEdit;
