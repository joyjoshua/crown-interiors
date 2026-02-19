import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import './TopBar.css';

const TopBar = ({
    title,
    titleTamil,
    showBack = false,
    actions,
}) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isTamil = i18n.language === 'ta';

    return (
        <header className="top-bar" id="top-bar">
            <div className="top-bar__inner">
                <div className="top-bar__left">
                    {showBack && (
                        <button
                            className="top-bar__back"
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="top-bar__center">
                    <h1 className="top-bar__title">
                        {isTamil && titleTamil ? titleTamil : title}
                    </h1>
                </div>

                <div className="top-bar__right">
                    {actions || <LanguageToggle />}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
