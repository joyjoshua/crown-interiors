/**
 * Format a number as Indian Rupees with the ₹ symbol.
 * Uses Indian number grouping: ₹1,25,000.00
 *
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = true) => {
  if (amount == null || isNaN(amount)) return '₹0';

  const options = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  };

  return new Intl.NumberFormat('en-IN', options).format(amount);
};

/**
 * Format amount in short form for dashboard stats.
 * ₹1,25,000 → ₹1.25L
 * ₹45,000 → ₹45K
 *
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrencyShort = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
};
