import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './ProgressIndicator.css';

const ProgressIndicator = ({ steps, currentStep }) => {
    const { t } = useTranslation();

    return (
        <div className="progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length}>
            <div className="progress__bar">
                <motion.div
                    className="progress__fill"
                    initial={false}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                />
            </div>
            <div className="progress__steps">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={[
                            'progress__step',
                            index <= currentStep && 'progress__step--active',
                            index < currentStep && 'progress__step--done',
                        ].filter(Boolean).join(' ')}
                    >
                        <div className="progress__dot">
                            {index < currentStep ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                        <span className="progress__label">{t(step.label)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressIndicator;
