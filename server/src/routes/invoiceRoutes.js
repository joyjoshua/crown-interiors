/**
 * Invoice Routes — /api/invoices/*
 *
 * Defines all invoice-related HTTP routes and wires up middleware
 * (authentication, validation) with the appropriate controllers.
 *
 * Route order matters:
 *   - Static routes (e.g., /stats) must come BEFORE dynamic routes (e.g., /:id)
 *     to prevent Express from treating "stats" as an :id parameter.
 */

const express = require('express');
const router = express.Router();

// Controllers
const invoiceController = require('../controllers/invoiceController');
const pdfController = require('../controllers/pdfController');

// Middleware
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Validation schemas
const {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateStatusSchema,
} = require('../validations/invoiceSchema');

// ── All routes require authentication ──
router.use(authenticate);

// ── Static Routes (must come before /:id routes) ──

/**
 * GET /api/invoices/stats
 * Dashboard statistics (invoices this month, revenue, pending, etc.)
 */
router.get('/stats', invoiceController.getInvoiceStats);

// ── Collection Routes ──

/**
 * GET  /api/invoices       — List all invoices (with filters, sorting, pagination)
 * POST /api/invoices       — Create a new invoice
 */
router.get('/', invoiceController.getAllInvoices);
router.post('/', validate(createInvoiceSchema), invoiceController.createInvoice);

// ── Single Invoice Routes ──

/**
 * GET    /api/invoices/:id  — Get a single invoice by ID
 * PUT    /api/invoices/:id  — Update an invoice
 * DELETE /api/invoices/:id  — Delete an invoice
 */
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', validate(updateInvoiceSchema), invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// ── Invoice Action Routes ──

/**
 * POST /api/invoices/:id/duplicate  — Duplicate an invoice
 * PUT  /api/invoices/:id/status     — Update invoice status only
 * GET  /api/invoices/:id/pdf        — Generate & download PDF
 * POST /api/invoices/:id/pdf/upload — Generate, upload to storage, return URL
 */
router.post('/:id/duplicate', invoiceController.duplicateInvoice);
router.put('/:id/status', validate(updateStatusSchema), invoiceController.updateInvoiceStatus);
router.get('/:id/pdf', pdfController.generatePdf);
router.post('/:id/pdf/upload', pdfController.generateAndUploadPdf);

module.exports = router;
