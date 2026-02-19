import './Skeleton.css';

const Skeleton = ({
    width,
    height = '16px',
    variant = 'text',   // 'text' | 'circular' | 'rectangular' | 'card'
    lines = 1,
    className = '',
}) => {
    if (variant === 'card') {
        return (
            <div className={`skeleton skeleton--card ${className}`} style={{ height }}>
                <div className="skeleton skeleton--rectangular" style={{ height: '60%' }} />
                <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div className="skeleton skeleton--text" style={{ width: '70%' }} />
                    <div className="skeleton skeleton--text" style={{ width: '50%' }} />
                </div>
            </div>
        );
    }

    if (lines > 1) {
        return (
            <div className={`skeleton-group ${className}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`skeleton skeleton--${variant}`}
                        style={{
                            width: i === lines - 1 ? '70%' : width || '100%',
                            height,
                        }}
                    />
                ))}
            </div>
        );
    }

    const styles = {
        width: variant === 'circular' ? height : width || '100%',
        height,
    };

    return (
        <div
            className={`skeleton skeleton--${variant} ${className}`}
            style={styles}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
