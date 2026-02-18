/**
 * Invoice Validation Schemas (Joi)
 *
 * Defines strict validation rules for invoice-related request payloads.
 * Used by the `validate` middleware to sanitize and validate incoming data
 * before it reaches the controller/service layer.
 *
 * Schemas:
 *   - createInvoiceSchema  → POST /api/invoices
 *   - updateInvoiceSchema  → PUT  /api/invoices/:id (all fields optional)
 *   - updateStatusSchema   → PUT  /api/invoices/:id/status
 */

const Joi = require('joi');

// ── Service Line Item Schema ──
const serviceSchema = Joi.object({
  description: Joi.string().required().min(2).max(200)
    .messages({ 'string.min': 'Service description must be at least 2 characters' }),
  quantity: Joi.number().required().min(1).max(9999)
    .messages({ 'number.min': 'Quantity must be at least 1' }),
  rate: Joi.number().required().min(0).max(99999999)
    .messages({ 'number.max': 'Rate exceeds maximum allowed value' }),
  amount: Joi.number().required().min(0),
});

// ── Create Invoice Schema ──
const createInvoiceSchema = Joi.object({
  // Document type
  document_type: Joi.string().valid('invoice', 'estimate').required()
    .messages({ 'any.only': 'Document type must be either "invoice" or "estimate"' }),

  // Customer details
  customer_name: Joi.string().required().min(2).max(100)
    .messages({ 'string.min': 'Customer name must be at least 2 characters' }),
  customer_phone: Joi.string().required().pattern(/^[+]?[0-9]{10,13}$/)
    .messages({ 'string.pattern.base': 'Phone number must be 10–13 digits, optionally starting with +' }),
  customer_address: Joi.string().allow('', null).max(300),
  customer_email: Joi.string().email().allow('', null)
    .messages({ 'string.email': 'Please provide a valid email address' }),

  // Services (at least one line item required)
  services: Joi.array().items(serviceSchema).min(1).required()
    .messages({ 'array.min': 'At least one service line item is required' }),

  // Financials
  subtotal: Joi.number().required().min(0),
  tax_enabled: Joi.boolean().required(),
  tax_percentage: Joi.number().min(0).max(100).when('tax_enabled', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  tax_amount: Joi.number().required().min(0),
  discount_amount: Joi.number().min(0).default(0),
  total_amount: Joi.number().required().min(0),

  // Dates
  invoice_date: Joi.date().iso().required()
    .messages({ 'date.format': 'Invoice date must be in ISO format (YYYY-MM-DD)' }),
  due_date: Joi.date().iso().allow(null).optional(),

  // Additional
  notes: Joi.string().allow('', null).max(1000),
});

// ── Update Invoice Schema ──
// Same structure as create, but all required fields become optional
const updateInvoiceSchema = createInvoiceSchema.fork(
  [
    'document_type',
    'customer_name',
    'customer_phone',
    'services',
    'subtotal',
    'tax_enabled',
    'tax_amount',
    'total_amount',
    'invoice_date',
  ],
  (schema) => schema.optional()
);

// ── Update Status Schema ──
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'sent', 'paid').required()
    .messages({ 'any.only': 'Status must be one of: draft, sent, paid' }),
});

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateStatusSchema,
};
