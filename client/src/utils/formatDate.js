import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format.
 * @param {string|Date} date
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '';
  return format(parsed, formatStr);
};

/**
 * Format a date as relative time ("2 hours ago", "3 days ago").
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '';
  return formatDistanceToNow(parsed, { addSuffix: true });
};

/**
 * Get the time of day for greeting.
 * @returns {'morning'|'afternoon'|'evening'}
 */
export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};
