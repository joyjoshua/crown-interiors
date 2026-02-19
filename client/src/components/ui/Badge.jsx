import './Badge.css';

const Badge = ({
    variant = 'default', // 'default' | 'success' | 'warning' | 'error' | 'info'
    children,
    size = 'default',    // 'sm' | 'default'
    className = '',
}) => {
    const classes = [
        'badge',
        `badge--${variant}`,
        `badge--${size}`,
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {children}
        </span>
    );
};

export default Badge;
