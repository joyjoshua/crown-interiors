/**
 * Invoice Controller — HTTP Request Handlers
 *
 * Thin controller layer that handles HTTP concerns (request parsing,
 * response formatting, status codes) and delegates business logic
 * to the InvoiceService.
 *
 * Each method follows the pattern:
 *   1. Extract data from req (params, query, body, userId)
 *   2. Call the appropriate service method
 *   3. Return a structured JSON response
 *   4. Pass errors to the global error handler via next()
 */

const invoiceService = require('../services/invoiceService');
const { parsePositiveInt } = require('../utils/helpers');

/**
 * GET /api/invoices
 * Lists all invoices for the authenticated user with optional filters.
 */
const getAllInvoices = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      search: req.query.search,
      sort: req.query.sort,
      page: parsePositiveInt(req.query.page, 1),
      limit: parsePositiveInt(req.query.limit, 20),
    };

    const result = await invoiceService.getAll(req.userId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/invoices/stats
 * Returns dashboard statistics for the authenticated user.
 */
const getInvoiceStats = async (req, res, next) => {
  try {
    const stats = await invoiceService.getStats(req.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/invoices/:id
 * Retrieves a single invoice by its UUID.
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getById(req.userId, req.params.id);

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/invoices
 * Creates a new invoice (body is pre-validated by the validate middleware).
 */
const createInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.create(req.userId, req.body);

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/invoices/:id
 * Updates an existing invoice (body is pre-validated by the validate middleware).
 */
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.update(
      req.userId,
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/invoices/:id
 * Permanently deletes an invoice.
 */
const deleteInvoice = async (req, res, next) => {
  try {
    await invoiceService.delete(req.userId, req.params.id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/invoices/:id/duplicate
 * Creates a copy of an existing invoice with a new number and today's date.
 */
const duplicateInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.duplicate(req.userId, req.params.id);

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice duplicated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/invoices/:id/status
 * Updates only the status field of an invoice (body: { status }).
 */
const updateInvoiceStatus = async (req, res, next) => {
  try {
    const invoice = await invoiceService.update(req.userId, req.params.id, {
      status: req.body.status,
    });

    res.json({
      success: true,
      data: invoice,
      message: `Invoice status updated to "${req.body.status}"`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  updateInvoiceStatus,
};
