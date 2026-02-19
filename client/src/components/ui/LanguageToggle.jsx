import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './LanguageToggle.css';

const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const toggleLanguage = () => {
        const newLang = isEnglish ? 'ta' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <button
            className="lang-toggle"
            onClick={toggleLanguage}
            aria-label={`Switch to ${isEnglish ? 'Tamil' : 'English'}`}
            id="language-toggle"
        >
            <div className="lang-toggle__track">
                <motion.div
                    className="lang-toggle__thumb"
                    animate={{ x: isEnglish ? 0 : 32 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
                <span className={`lang-toggle__option ${isEnglish ? 'lang-toggle__option--active' : ''}`}>
                    EN
                </span>
                <span className={`lang-toggle__option ${!isEnglish ? 'lang-toggle__option--active' : ''}`}>
                    தமி
                </span>
            </div>
        </button>
    );
};

export default LanguageToggle;
