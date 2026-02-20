import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './TextArea.css';

const TextArea = forwardRef(({
    label,
    labelTamil,
    error,
    placeholder,
    rows = 4,
    maxLength,
    required = false,
    disabled = false,
    className = '',
    id,
    ...props
}, ref) => {
    const { i18n } = useTranslation();
    const [focused, setFocused] = useState(false);
    const isTamil = i18n.language === 'ta';

    const inputId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    const wrapperClasses = [
        'textarea-wrapper',
        focused && 'textarea-wrapper--focused',
        error && 'textarea-wrapper--error',
        disabled && 'textarea-wrapper--disabled',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label htmlFor={inputId} className="textarea-label">
                    <span className="textarea-label__text">
                        {isTamil && labelTamil ? labelTamil : label}
                        {required && <span className="textarea-label__required" aria-hidden="true"> *</span>}
                    </span>
                    {!isTamil && labelTamil && (
                        <span className="textarea-label__tamil">{labelTamil}</span>
                    )}
                </label>
            )}
            <textarea
                ref={ref}
                id={inputId}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                maxLength={maxLength}
                className="textarea-field"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...props}
            />
            {error && (
                <p id={`${inputId}-error`} className="textarea-error" role="alert">
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;
