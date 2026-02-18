/**
 * PDF Controller — PDF Generation & Download Handler
 *
 * Handles the HTTP layer for PDF generation. Fetches the invoice,
 * generates a PDF via PdfService, and streams it back as a download
 * with the correct Content-Type and Content-Disposition headers.
 */

const invoiceService = require('../services/invoiceService');
const pdfService = require('../services/pdfService');

/**
 * GET /api/invoices/:id/pdf
 * Generates a PDF for the given invoice and returns it as a downloadable file.
 *
 * Response headers:
 *   Content-Type: application/pdf
 *   Content-Disposition: attachment; filename="CI-042-invoice.pdf"
 */
const generatePdf = async (req, res, next) => {
  try {
    // Fetch the full invoice data (scoped to the authenticated user)
    const invoice = await invoiceService.getById(req.userId, req.params.id);

    // Generate the PDF buffer from the invoice data
    const pdfBuffer = await pdfService.generatePdf(invoice);

    // Build the download filename (e.g., "CI-042-invoice.pdf")
    const filename = `${invoice.invoice_number}-${invoice.document_type}.pdf`;

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/invoices/:id/pdf/upload
 * Generates a PDF and uploads it to Supabase Storage.
 * Returns the public URL of the uploaded PDF.
 *
 * This is an optional endpoint — use when you want to persist the PDF
 * for sharing via WhatsApp or other channels.
 */
const generateAndUploadPdf = async (req, res, next) => {
  try {
    // Fetch the invoice data
    const invoice = await invoiceService.getById(req.userId, req.params.id);

    // Generate the PDF buffer
    const pdfBuffer = await pdfService.generatePdf(invoice);

    // Build the storage filename
    const filename = `${invoice.invoice_number}-${invoice.document_type}.pdf`;

    // Upload to Supabase Storage and get the public URL
    const publicUrl = await pdfService.uploadPdf(
      invoice.id,
      pdfBuffer,
      filename
    );

    res.json({
      success: true,
      data: { pdf_url: publicUrl },
      message: 'PDF generated and uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePdf,
  generateAndUploadPdf,
};
