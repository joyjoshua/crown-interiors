/**
 * Miscellaneous Helper Utilities
 *
 * Shared utility functions used across the application
 * for formatting, parsing, and common operations.
 */

/**
 * Formats a numeric amount in Indian currency style (e.g., 1,25,000.00).
 * Uses the 'en-IN' locale for proper Indian grouping separators.
 * @param {number} amount - The numeric amount to format
 * @returns {string} Formatted currency string without the ₹ symbol
 */
function formatCurrencyINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats an ISO date string into a human-readable Indian date format.
 * Example: "2026-02-12" → "12 Feb 2026"
 * @param {string} dateStr - ISO date string (YYYY-MM-DD or full ISO)
 * @returns {string} Formatted date string
 */
function formatDateIN(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Safely parses a query parameter as a positive integer.
 * Returns the fallback value if the input is invalid or non-positive.
 * @param {string|undefined} value - The raw query parameter value
 * @param {number} fallback - Default value if parsing fails
 * @returns {number} Parsed integer or fallback
 */
function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  formatCurrencyINR,
  formatDateIN,
  parsePositiveInt,
};
