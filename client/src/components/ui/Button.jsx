import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = forwardRef(({
    children,
    variant = 'primary',    // 'primary' | 'secondary' | 'destructive' | 'ghost'
    size = 'default',        // 'sm' | 'default' | 'lg'
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    type = 'button',
    className = '',
    onClick,
    ...props
}, ref) => {
    const classes = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && 'btn--full',
        loading && 'btn--loading',
        disabled && 'btn--disabled',
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            ref={ref}
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
            transition={{ duration: 0.1 }}
            {...props}
        >
            {loading && (
                <span className="btn__spinner" aria-hidden="true">
                    <svg className="btn__spinner-icon" viewBox="0 0 24 24" fill="none">
                        <circle
                            cx="12" cy="12" r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="60"
                            strokeDashoffset="20"
                        />
                    </svg>
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="btn__icon btn__icon--left">{icon}</span>
            )}
            <span className="btn__label">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <span className="btn__icon btn__icon--right">{icon}</span>
            )}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
