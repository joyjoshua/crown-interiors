import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './BottomNav.css';

const navItems = [
    {
        path: '/dashboard',
        labelKey: 'nav.home',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                {!active && <polyline points="9 22 9 12 15 12 15 22" />}
            </svg>
        ),
    },
    {
        path: '/invoice/new',
        labelKey: 'nav.newInvoice',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
        isCenter: true,
    },
    {
        path: '/history',
        labelKey: 'nav.history',
        icon: (active) => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                {!active && (
                    <>
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </>
                )}
            </svg>
        ),
    },
];

const BottomNav = () => {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <nav className="bottom-nav" id="bottom-nav" aria-label="Main navigation">
            <div className="bottom-nav__inner">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path === '/dashboard' && location.pathname === '/');

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''} ${item.isCenter ? 'bottom-nav__item--center' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {item.isCenter ? (
                                <motion.div
                                    className="bottom-nav__center-btn"
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    {item.icon(isActive)}
                                </motion.div>
                            ) : (
                                <>
                                    <span className="bottom-nav__icon">
                                        {item.icon(isActive)}
                                    </span>
                                    <span className="bottom-nav__label">{t(item.labelKey)}</span>
                                    {isActive && (
                                        <motion.div
                                            className="bottom-nav__indicator"
                                            layoutId="nav-indicator"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
