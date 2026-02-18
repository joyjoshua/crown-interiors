/**
 * Invoice Number Generator
 *
 * Generates sequential invoice numbers in the format: CI-001, CI-002, CI-003, ...
 *   - Prefix: "CI" (Crown Interiors)
 *   - Number: Zero-padded to 3 digits minimum, auto-increments per user
 *   - Each user has their own independent sequence
 *
 * Strategy: Fetch the latest invoice number for the user, extract the
 * numeric part, increment, and return the next number.
 */

const { supabaseAdmin } = require('../config/supabase');

/** Prefix used for all invoice numbers */
const INVOICE_PREFIX = 'CI';

/** Minimum number of digits in the numeric portion */
const MIN_DIGITS = 3;

/**
 * Generates the next invoice number for a given user.
 * @param {string} userId - The authenticated user's UUID
 * @returns {Promise<string>} The next invoice number (e.g., "CI-042")
 * @throws {Error} If the database query fails
 */
async function generateInvoiceNumber(userId) {
  // Fetch the most recent invoice number for this user
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNumber = 1;

  if (data && data.length > 0) {
    const lastNumber = data[0].invoice_number;

    // Extract the numeric part after "CI-"
    const match = lastNumber.match(new RegExp(`${INVOICE_PREFIX}-(\\d+)`));
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Pad with leading zeros (e.g., 1 → "001", 42 → "042", 1000 → "1000")
  const paddedNumber = String(nextNumber).padStart(MIN_DIGITS, '0');
  return `${INVOICE_PREFIX}-${paddedNumber}`;
}

module.exports = { generateInvoiceNumber };
