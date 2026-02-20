import './EmptyState.css';

const EmptyState = ({
    icon = '📋',
    title = 'Nothing here yet',
    subtitle = '',
    action,      // { label: string, onClick: fn }
}) => (
    <div className="empty-state">
        <span className="empty-state__icon" role="img" aria-label={title}>
            {icon}
        </span>
        <h3 className="empty-state__title">{title}</h3>
        {subtitle && (
            <p className="empty-state__subtitle">{subtitle}</p>
        )}
        {action && (
            <button
                type="button"
                className="empty-state__action"
                onClick={action.onClick}
            >
                {action.label}
            </button>
        )}
    </div>
);

export default EmptyState;
