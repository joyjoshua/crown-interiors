/**
 * Amount to Words Converter (Indian Numbering System)
 *
 * Converts a numeric INR amount into English words using the
 * Indian numbering system (Lakhs, Crores instead of Millions, Billions).
 *
 * Examples:
 *   53100   → "Fifty Three Thousand One Hundred Rupees"
 *   47200.5 → "Forty Seven Thousand Two Hundred Rupees and Fifty Paise"
 *   0       → "Zero Rupees"
 */

/** Words for numbers 0–19 */
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

/** Words for tens multiples (20, 30, ..., 90) */
const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/**
 * Recursively converts a non-negative integer into English words
 * using the Indian numbering system (Crore → Lakh → Thousand → Hundred).
 * @param {number} num - Non-negative integer to convert
 * @returns {string} English word representation
 */
function convertToWords(num) {
  if (num === 0) return 'Zero';

  let words = '';

  // Crore (10,000,000)
  if (Math.floor(num / 10000000) > 0) {
    words += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }

  // Lakh (100,000)
  if (Math.floor(num / 100000) > 0) {
    words += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }

  // Thousand (1,000)
  if (Math.floor(num / 1000) > 0) {
    words += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  // Hundred (100)
  if (Math.floor(num / 100) > 0) {
    words += convertToWords(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }

  // Remaining (0–99)
  if (num > 0) {
    if (num < 20) {
      words += ones[num];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10];
      }
    }
  }

  return words.trim();
}

/**
 * Converts an INR amount (with optional paise) into English words.
 * @param {number} amount - The amount in rupees (e.g., 47200 or 47200.50)
 * @returns {string} Human-readable amount (e.g., "Forty Seven Thousand Two Hundred Rupees")
 */
function amountToWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = convertToWords(rupees) + ' Rupees';

  if (paise > 0) {
    result += ' and ' + convertToWords(paise) + ' Paise';
  }

  return result;
}

module.exports = { amountToWords };
