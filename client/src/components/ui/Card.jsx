import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
    children,
    onClick,
    hoverable = false,
    padding = 'default',  // 'none' | 'sm' | 'default' | 'lg'
    variant = 'elevated', // 'elevated' | 'outlined' | 'filled'
    className = '',
    animate = true,
    ...props
}) => {
    const classes = [
        'card',
        `card--${variant}`,
        `card--p-${padding}`,
        hoverable && 'card--hoverable',
        onClick && 'card--clickable',
        className,
    ].filter(Boolean).join(' ');

    const Component = animate ? motion.div : 'div';
    const animateProps = animate ? {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] },
        whileTap: onClick ? { scale: 0.98 } : undefined,
    } : {};

    return (
        <Component
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            {...animateProps}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Card;
