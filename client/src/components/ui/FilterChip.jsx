import './FilterChip.css';

const FilterChip = ({ label, active = false, onClick, count }) => (
    <button
        type="button"
        className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
        onClick={onClick}
        aria-pressed={active}
    >
        <span className="filter-chip__label">{label}</span>
        {count != null && (
            <span className="filter-chip__count">{count}</span>
        )}
    </button>
);

export default FilterChip;
