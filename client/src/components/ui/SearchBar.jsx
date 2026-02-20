import { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({
    value: controlledValue,
    onChange,
    onClear,
    placeholder = 'Search...',
    id = 'search-bar',
}) => {
    // Support uncontrolled mode (no value prop passed)
    const isControlled = controlledValue !== undefined;
    const [localValue, setLocalValue] = useState('');
    const displayValue = isControlled ? controlledValue : localValue;

    const handleChange = (e) => {
        if (!isControlled) setLocalValue(e.target.value);
        onChange?.(e);
    };

    const handleClear = () => {
        if (!isControlled) setLocalValue('');
        if (onClear) onClear();
        else onChange?.({ target: { value: '' } });
    };

    return (
        <div className="search-bar">
            <span className="search-bar__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </span>
            <input
                id={id}
                type="search"
                className="search-bar__input"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
            />
            {displayValue && (
                <button
                    type="button"
                    className="search-bar__clear"
                    onClick={handleClear}
                    aria-label="Clear search"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;
