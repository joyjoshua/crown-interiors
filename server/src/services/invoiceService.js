/**
 * Invoice Service — Core Business Logic
 *
 * Encapsulates all invoice-related database operations and business rules.
 * This layer sits between the controller and the Supabase client,
 * ensuring controllers remain thin and focused on HTTP concerns.
 *
 * Responsibilities:
 *   - CRUD operations on the invoices table
 *   - Invoice duplication with new number + date
 *   - Dashboard statistics aggregation
 *   - Filtering, sorting, and pagination
 */

const { supabaseAdmin } = require('../config/supabase');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');

class InvoiceService {
  /**
   * Creates a new invoice for the given user.
   * Automatically generates the next sequential invoice number
   * and sets the initial status to 'draft'.
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {object} invoiceData - Validated invoice payload
   * @returns {Promise<object>} The newly created invoice record
   */
  async create(userId, invoiceData) {
    // Generate the next sequential invoice number (e.g., CI-043)
    const invoiceNumber = await generateInvoiceNumber(userId);

    const invoice = {
      user_id: userId,
      invoice_number: invoiceNumber,
      document_type: invoiceData.document_type,
      status: 'draft',

      // Customer details
      customer_name: invoiceData.customer_name,
      customer_phone: invoiceData.customer_phone,
      customer_address: invoiceData.customer_address || null,
      customer_email: invoiceData.customer_email || null,

      // Services (stored as JSONB array in PostgreSQL)
      services: invoiceData.services,

      // Financial breakdown
      subtotal: invoiceData.subtotal,
      tax_enabled: invoiceData.tax_enabled,
      tax_percentage: invoiceData.tax_percentage,
      tax_amount: invoiceData.tax_amount,
      discount_amount: invoiceData.discount_amount || 0,
      total_amount: invoiceData.total_amount,

      // Dates
      invoice_date: invoiceData.invoice_date,
      due_date: invoiceData.due_date || null,

      // Additional info
      notes: invoiceData.notes || null,
    };

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves all invoices for a user with filtering, sorting, and pagination.
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {object} filters - Query filters
   * @param {string} [filters.type]   - Document type filter: 'all', 'invoice', 'estimate'
   * @param {string} [filters.status] - Status filter: 'all', 'draft', 'sent', 'paid'
   * @param {string} [filters.search] - Search term for customer name or invoice number
   * @param {string} [filters.sort]   - Sort order: 'newest', 'oldest', 'amount_high', 'amount_low'
   * @param {number} [filters.page]   - Page number (1-indexed)
   * @param {number} [filters.limit]  - Items per page
   * @returns {Promise<{invoices: object[], pagination: object}>}
   */
  async getAll(userId, filters = {}) {
    let query = supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // ── Apply Filters ──
    if (filters.type && filters.type !== 'all') {
      query = query.eq('document_type', filters.type);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(
        `customer_name.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`
      );
    }

    // ── Apply Sorting ──
    switch (filters.sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'amount_high':
        query = query.order('total_amount', { ascending: false });
        break;
      case 'amount_low':
        query = query.order('total_amount', { ascending: true });
        break;
      default: // 'newest' (default)
        query = query.order('created_at', { ascending: false });
    }

    // ── Apply Pagination ──
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      invoices: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Retrieves a single invoice by ID, scoped to the authenticated user.
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {string} invoiceId - Invoice UUID
   * @returns {Promise<object>} The invoice record
   * @throws {Error} "Invoice not found" if no matching record exists
   */
  async getById(userId, invoiceId) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = "JSON object requested, multiple (or no) rows returned"
      if (error.code === 'PGRST116') {
        throw new Error('Invoice not found');
      }
      throw error;
    }

    return data;
  }

  /**
   * Updates an existing invoice with partial data.
   * Automatically sets the `updated_at` timestamp.
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {string} invoiceId - Invoice UUID to update
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>} The updated invoice record
   */
  async update(userId, invoiceId, updateData) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Permanently deletes an invoice, scoped to the authenticated user.
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {string} invoiceId - Invoice UUID to delete
   * @returns {Promise<boolean>} true on success
   */
  async delete(userId, invoiceId) {
    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  /**
   * Duplicates an existing invoice with a new invoice number and today's date.
   * The new invoice starts in 'draft' status. Due date is cleared.
   *
   * @param {string} userId - Authenticated user's UUID
   * @param {string} invoiceId - Invoice UUID to duplicate
   * @returns {Promise<object>} The newly created duplicate invoice
   */
  async duplicate(userId, invoiceId) {
    // Fetch the original invoice to copy its data
    const original = await this.getById(userId, invoiceId);

    // Build the duplicate data (new number, today's date, draft status)
    const duplicatedData = {
      document_type: original.document_type,
      customer_name: original.customer_name,
      customer_phone: original.customer_phone,
      customer_address: original.customer_address,
      customer_email: original.customer_email,
      services: original.services,
      subtotal: original.subtotal,
      tax_enabled: original.tax_enabled,
      tax_percentage: original.tax_percentage,
      tax_amount: original.tax_amount,
      discount_amount: original.discount_amount,
      total_amount: original.total_amount,
      invoice_date: new Date().toISOString().split('T')[0], // Today's date
      due_date: null, // Reset due date on duplicate
      notes: original.notes,
    };

    return this.create(userId, duplicatedData);
  }

  /**
   * Aggregates dashboard statistics for the authenticated user.
   *
   * Returns:
   *   - invoices_this_month: count of invoices created this month
   *   - revenue_this_month: sum of total_amount for this month's invoices
   *   - total_invoices: lifetime count of invoices
   *   - pending_amount: sum of total_amount for 'draft' and 'sent' invoices
   *   - recent_invoices: the 5 most recently created invoices
   *
   * @param {string} userId - Authenticated user's UUID
   * @returns {Promise<object>} Dashboard statistics
   */
  async getStats(userId) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString();

    // ── Invoices created this month ──
    const { data: monthlyInvoices, error: err1 } = await supabaseAdmin
      .from('invoices')
      .select('total_amount')
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth);

    if (err1) throw err1;

    // ── Total lifetime invoices ──
    const { count: totalInvoices, error: err2 } = await supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (err2) throw err2;

    // ── Pending (unpaid) amount ──
    const { data: pendingInvoices, error: err3 } = await supabaseAdmin
      .from('invoices')
      .select('total_amount')
      .eq('user_id', userId)
      .in('status', ['draft', 'sent']);

    if (err3) throw err3;

    // ── 5 most recent invoices (summary fields only) ──
    const { data: recentInvoices, error: err4 } = await supabaseAdmin
      .from('invoices')
      .select(
        'id, invoice_number, document_type, status, customer_name, total_amount, invoice_date, created_at'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (err4) throw err4;

    return {
      invoices_this_month: monthlyInvoices.length,
      revenue_this_month: monthlyInvoices.reduce(
        (sum, inv) => sum + Number(inv.total_amount),
        0
      ),
      total_invoices: totalInvoices,
      pending_amount: pendingInvoices.reduce(
        (sum, inv) => sum + Number(inv.total_amount),
        0
      ),
      recent_invoices: recentInvoices,
    };
  }
}

module.exports = new InvoiceService();
