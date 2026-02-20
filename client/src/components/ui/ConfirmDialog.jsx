import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmDialog.css';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    loading = false,
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, loading]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="confirm-overlay"
                    role="alertdialog"
                    aria-modal="true"
                    aria-label={title}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="confirm-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={!loading ? onClose : undefined}
                    />

                    {/* Dialog Card */}
                    <motion.div
                        className="confirm-card"
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.175, 0.885, 0.32, 1.275],
                        }}
                    >
                        {/* Header */}
                        <div className="confirm-header">
                            <h3 className="confirm-title">{title}</h3>
                            <button
                                className="confirm-close"
                                onClick={onClose}
                                disabled={loading}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Message */}
                        {message && (
                            <p className="confirm-message">{message}</p>
                        )}

                        {/* Actions */}
                        <div className="confirm-actions">
                            <button
                                className="confirm-btn confirm-btn--cancel"
                                onClick={onClose}
                                disabled={loading}
                                id="btn-confirm-cancel"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                className={`confirm-btn ${destructive
                                        ? 'confirm-btn--destructive'
                                        : 'confirm-btn--primary'
                                    }`}
                                onClick={onConfirm}
                                disabled={loading}
                                id="btn-confirm-action"
                            >
                                {loading && (
                                    <span
                                        className="confirm-spinner"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            width="16"
                                            height="16"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray="60"
                                                strokeDashoffset="20"
                                            />
                                        </svg>
                                    </span>
                                )}
                                {loading ? 'Deleting…' : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
