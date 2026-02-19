import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Input.css';

const Input = forwardRef(({
    label,
    labelTamil,
    error,
    type = 'text',
    inputMode,
    icon,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    id,
    ...props
}, ref) => {
    const { i18n } = useTranslation();
    const [focused, setFocused] = useState(false);
    const isTamil = i18n.language === 'ta';

    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    const wrapperClasses = [
        'input-wrapper',
        focused && 'input-wrapper--focused',
        error && 'input-wrapper--error',
        disabled && 'input-wrapper--disabled',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    <span className="input-label__text">
                        {isTamil && labelTamil ? labelTamil : label}
                        {required && <span className="input-label__required" aria-hidden="true"> *</span>}
                    </span>
                    {!isTamil && labelTamil && (
                        <span className="input-label__tamil">{labelTamil}</span>
                    )}
                </label>
            )}
            <div className="input-field">
                {icon && <span className="input-field__icon">{icon}</span>}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    inputMode={inputMode}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className="input-field__input"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
            </div>
            {error && (
                <p id={`${inputId}-error`} className="input-error" role="alert">
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
