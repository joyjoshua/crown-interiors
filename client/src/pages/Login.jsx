import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LanguageToggle from '../components/ui/LanguageToggle';
import './Login.css';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Redirect if already authenticated (moved out of render phase)
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setLoginError('');

        try {
            await login(data.email, data.password);
            toast.success(t('dashboard.greeting', { timeOfDay: '', name: '' }).includes('வணக்கம்')
                ? 'வரவேற்கிறோம்! 🎉'
                : 'Welcome back! 🎉'
            );
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(t('login.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            {/* Language toggle - top right */}
            <div className="login__lang-toggle">
                <LanguageToggle />
            </div>

            {/* Logo & Branding */}
            <motion.div
                className="login__brand"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
                <div className="login__logo">
                    <div className="login__logo-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="12" fill="url(#logo-gradient)" />
                            <path d="M14 34V18L24 12L34 18V34" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 34V24H28V34" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 18L24 12L34 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="14" y1="34" x2="34" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FFB300" />
                                    <stop offset="1" stopColor="#FF8F00" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <h1 className="login__title">Crown Interiors</h1>
                <p className="login__subtitle">Quality Carpentry Since 1990</p>
            </motion.div>

            {/* Login Form */}
            <motion.form
                className="login__form"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
                {/* Error Banner */}
                <AnimatePresence>
                    {loginError && (
                        <motion.div
                            className="login__error-banner"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.25 }}
                            role="alert"
                        >
                            <span className="login__error-icon">⚠️</span>
                            <span>{loginError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Input
                    label={t('login.email')}
                    labelTamil="மின்னஞ்சல்"
                    type="email"
                    placeholder="dad@crowninteriors.in"
                    required
                    id="login-email"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M22 7l-10 7L2 7" />
                        </svg>
                    }
                    error={errors.email?.message}
                    {...register('email', {
                        required: t('errors.required'),
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: t('errors.invalidEmail'),
                        },
                    })}
                />

                <Input
                    label={t('login.password')}
                    labelTamil="கடவுச்சொல்"
                    type="password"
                    placeholder="••••••••"
                    required
                    id="login-password"
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    }
                    error={errors.password?.message}
                    {...register('password', {
                        required: t('errors.required'),
                    })}
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                >
                    {t('login.submit')}
                </Button>
            </motion.form>

            {/* Footer */}
            <motion.p
                className="login__footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                Built with ❤️ for Dad
            </motion.p>
        </div>
    );
};

export default Login;
