/**
 * PDF Service — Invoice PDF Generation with pdfmake
 *
 * Generates professional A4 invoice/estimate PDFs using pdfmake's
 * JSON-based document definitions. No HTML templates, no browser
 * dependency — pure JavaScript PDF generation.
 *
 * Design features:
 *   - Crown Interiors branded header
 *   - Color-coded document type (Invoice vs Estimate)
 *   - Itemized services table with Indian currency formatting
 *   - CGST/SGST tax breakdown
 *   - Amount in words (Indian numbering system)
 *   - Authorized signature block
 *   - Professional footer
 *
 * Responsibilities:
 *   - Building pdfmake document definitions from invoice data
 *   - Generating PDF buffers for download
 *   - Uploading PDFs to Supabase Storage (optional persistence)
 */

const pdfmake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');
const { supabaseAdmin } = require('../config/supabase');
const { amountToWords } = require('../utils/amountToWords');

// Register the built-in virtual file system fonts (Roboto family)
pdfmake.vfs = vfsFonts.pdfMake ? vfsFonts.pdfMake.vfs : vfsFonts.vfs;

class PdfService {
  /**
   * Generates a PDF buffer from invoice data.
   *
   * @param {object} invoice - Full invoice record from the database
   * @returns {Promise<Buffer>} PDF file as a Node.js Buffer
   */
  async generatePdf(invoice) {
    const docDefinition = this.buildDocDefinition(invoice);

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfmake.createPdf(docDefinition);
        pdfDoc.getBuffer((buffer) => {
          resolve(Buffer.from(buffer));
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Builds the pdfmake document definition (JSON layout) for an invoice.
   * This is the "template" — modify this method to change the PDF design.
   *
   * @param {object} invoice - Full invoice record from the database
   * @returns {object} pdfmake document definition
   */
  buildDocDefinition(invoice) {
    const isEstimate = invoice.document_type === 'estimate';
    const halfTax = invoice.tax_amount / 2;
    const halfPercent = invoice.tax_percentage / 2;

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],

      // ── Default & Named Styles ──
      defaultStyle: {
        fontSize: 10,
        lineHeight: 1.3,
      },
      styles: {
        brandName: { fontSize: 20, bold: true, color: '#1a1a2e' },
        brandTagline: { fontSize: 9, color: '#666', italics: true },
        docType: {
          fontSize: 14,
          bold: true,
          color: isEstimate ? '#e67e22' : '#2c3e50',
        },
        invoiceNumber: { fontSize: 12, bold: true },
        sectionTitle: {
          fontSize: 11,
          bold: true,
          color: '#333',
          margin: [0, 15, 0, 5],
        },
        customerName: { fontSize: 11, bold: true },
        tableHeader: {
          bold: true,
          fontSize: 9,
          color: '#fff',
          fillColor: '#1a1a2e',
        },
        tableCell: { fontSize: 9, margin: [0, 4, 0, 4] },
        grandTotal: { fontSize: 13, bold: true, color: '#1a1a2e' },
        amountWords: {
          fontSize: 9,
          italics: true,
          color: '#555',
          margin: [0, 10, 0, 0],
        },
        notes: { fontSize: 9, color: '#666', margin: [0, 5, 0, 0] },
        footer: { fontSize: 9, color: '#999', alignment: 'center' },
      },

      // ── Page Content ──
      content: [
        // ── Header: Brand + Document Info ──
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'CROWN INTERIORS', style: 'brandName' },
                {
                  text: 'Quality Carpentry & Interior Works',
                  style: 'brandTagline',
                },
              ],
            },
            {
              width: 'auto',
              alignment: 'right',
              stack: [
                {
                  text: invoice.document_type.toUpperCase(),
                  style: 'docType',
                },
                {
                  text: invoice.invoice_number,
                  style: 'invoiceNumber',
                  margin: [0, 5, 0, 0],
                },
                {
                  text: `Date: ${this.formatDate(invoice.invoice_date)}`,
                  fontSize: 9,
                },
                {
                  text: `Due: ${invoice.due_date ? this.formatDate(invoice.due_date) : 'N/A'}`,
                  fontSize: 9,
                },
              ],
            },
          ],
        },

        // ── Divider Line ──
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 10,
              x2: 515,
              y2: 10,
              lineWidth: 1,
              lineColor: '#e0e0e0',
            },
          ],
        },

        // ── Bill To Section ──
        { text: 'Bill To:', style: 'sectionTitle' },
        { text: invoice.customer_name, style: 'customerName' },
        ...(invoice.customer_address
          ? [{ text: invoice.customer_address, fontSize: 9 }]
          : []),
        { text: `Phone: ${invoice.customer_phone}`, fontSize: 9 },
        ...(invoice.customer_email
          ? [{ text: invoice.customer_email, fontSize: 9 }]
          : []),

        // ── Services Table ──
        { text: '', margin: [0, 10, 0, 0] },
        {
          table: {
            headerRows: 1,
            widths: [25, '*', 40, 80, 80],
            body: [
              // Header row
              [
                { text: '#', style: 'tableHeader', alignment: 'center' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                { text: 'Rate', style: 'tableHeader', alignment: 'right' },
                { text: 'Amount', style: 'tableHeader', alignment: 'right' },
              ],
              // Data rows — one per service line item
              ...invoice.services.map((service, i) => [
                {
                  text: i + 1,
                  style: 'tableCell',
                  alignment: 'center',
                },
                { text: service.description, style: 'tableCell' },
                {
                  text: service.quantity,
                  style: 'tableCell',
                  alignment: 'center',
                },
                {
                  text: `₹${this.formatCurrency(service.rate)}`,
                  style: 'tableCell',
                  alignment: 'right',
                },
                {
                  text: `₹${this.formatCurrency(service.amount)}`,
                  style: 'tableCell',
                  alignment: 'right',
                },
              ]),
            ],
          },
          layout: {
            hLineWidth: (i, node) =>
              i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: (i) =>
              i === 0 || i === 1 ? '#1a1a2e' : '#e0e0e0',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
        },

        // ── Totals Section ──
        { text: '', margin: [0, 10, 0, 0] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 220,
              table: {
                widths: ['*', 'auto'],
                body: [
                  // Subtotal
                  [
                    { text: 'Subtotal', fontSize: 9 },
                    {
                      text: `₹${this.formatCurrency(invoice.subtotal)}`,
                      fontSize: 9,
                      alignment: 'right',
                    },
                  ],
                  // Discount (conditional)
                  ...(invoice.discount_amount > 0
                    ? [
                        [
                          { text: 'Discount', fontSize: 9 },
                          {
                            text: `- ₹${this.formatCurrency(invoice.discount_amount)}`,
                            fontSize: 9,
                            alignment: 'right',
                            color: '#e74c3c',
                          },
                        ],
                      ]
                    : []),
                  // CGST & SGST (conditional — only if tax is enabled)
                  ...(invoice.tax_enabled
                    ? [
                        [
                          { text: `CGST (${halfPercent}%)`, fontSize: 9 },
                          {
                            text: `₹${this.formatCurrency(halfTax)}`,
                            fontSize: 9,
                            alignment: 'right',
                          },
                        ],
                        [
                          { text: `SGST (${halfPercent}%)`, fontSize: 9 },
                          {
                            text: `₹${this.formatCurrency(halfTax)}`,
                            fontSize: 9,
                            alignment: 'right',
                          },
                        ],
                      ]
                    : []),
                  // Grand Total
                  [
                    { text: 'TOTAL', style: 'grandTotal' },
                    {
                      text: `₹${this.formatCurrency(invoice.total_amount)}`,
                      style: 'grandTotal',
                      alignment: 'right',
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: (i, node) =>
                  i === node.table.body.length - 1 ? 2 : 0.5,
                vLineWidth: () => 0,
                hLineColor: (i, node) =>
                  i === node.table.body.length - 1 ? '#1a1a2e' : '#eee',
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            },
          ],
        },

        // ── Amount in Words ──
        {
          text: `Amount in words: ${amountToWords(invoice.total_amount)} Only`,
          style: 'amountWords',
        },

        // ── Notes / Terms (conditional) ──
        ...(invoice.notes
          ? [
              { text: 'Notes / Terms:', style: 'sectionTitle' },
              { text: invoice.notes, style: 'notes' },
            ]
          : []),

        // ── Signature Block ──
        { text: '', margin: [0, 30, 0, 0] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              alignment: 'center',
              stack: [
                {
                  text: 'For Crown Interiors',
                  fontSize: 9,
                  bold: true,
                },
                { text: '', margin: [0, 25, 0, 0] },
                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: 120,
                      y2: 0,
                      lineWidth: 0.5,
                    },
                  ],
                },
                {
                  text: 'Authorized Signature',
                  fontSize: 8,
                  color: '#999',
                  margin: [0, 3, 0, 0],
                },
              ],
            },
          ],
        },
      ],

      // ── Page Footer ──
      footer: {
        text: 'Thank you for your business! 🙏',
        style: 'footer',
        margin: [0, 20, 0, 0],
      },
    };
  }

  /**
   * Uploads a generated PDF to Supabase Storage and updates the invoice
   * record with the resulting public URL.
   *
   * @param {string} invoiceId - Invoice UUID
   * @param {Buffer} pdfBuffer - The generated PDF buffer
   * @param {string} filename - Filename for storage (e.g., "CI-042-invoice.pdf")
   * @returns {Promise<string>} Public URL of the uploaded PDF
   */
  async uploadPdf(invoiceId, pdfBuffer, filename) {
    const { data, error } = await supabaseAdmin.storage
      .from('invoices')
      .upload(`pdfs/${filename}`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true, // Overwrite if filename already exists
      });

    if (error) throw error;

    // Retrieve the public URL for the uploaded PDF
    const { data: urlData } = supabaseAdmin.storage
      .from('invoices')
      .getPublicUrl(`pdfs/${filename}`);

    // Persist the PDF URL on the invoice record
    await supabaseAdmin
      .from('invoices')
      .update({ pdf_url: urlData.publicUrl })
      .eq('id', invoiceId);

    return urlData.publicUrl;
  }

  /**
   * Formats a number in Indian currency style (e.g., 1,25,000).
   * @param {number} amount - Numeric amount
   * @returns {string} Formatted string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Formats an ISO date string into "DD Mon YYYY" (e.g., "12 Feb 2026").
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}

module.exports = new PdfService();
