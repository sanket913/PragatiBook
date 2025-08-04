import { Bill } from '@/types/bill';
import { TemplateSettings } from '@/types/template';

export async function generatePDF(bill: Bill, returnBlob: boolean = false, template?: TemplateSettings): Promise<Blob | void> {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Use template settings or defaults
  const settings = template || {
    companyName: '',
    companySubtitle: 'Professional Services',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#059669',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    headerStyle: 'modern',
    fontSize: 'medium',
    spacing: 'normal',
    showLogo: false,
    showCompanyAddress: true,
    showDueDate: true,
    showPaymentTerms: true,
    showFooter: true,
    showItemNumbers: true,
    showMeasurements: true,
    customFields: [],
    paymentTerms: 'Payment is due within 30 days of invoice date. Please include the invoice number with your payment.',
    footerText: 'Thank you for your business!',
    invoicePrefix: 'INV',
    dueDays: 30
  };

  const getFontSize = () => {
    switch (settings.fontSize) {
      case 'small': return '12px';
      case 'large': return '16px';
      default: return '14px';
    }
  };

  const getLineHeight = () => {
    switch (settings.spacing) {
      case 'compact': return '1.3';
      case 'spacious': return '1.7';
      default: return '1.5';
    }
  };

  // Create HTML content for the bill with proper professional layout
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${bill.id.toUpperCase()}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: ${getLineHeight()};
          color: ${settings.textColor};
          background: white;
          font-size: ${getFontSize()};
          margin: 0;
          padding: 0;
        }
        
        .invoice-container {
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
          position: relative;
        }
        
        /* Page break utilities */
        .page-break-before {
          page-break-before: always;
          break-before: page;
        }
        
        .page-break-after {
          page-break-after: always;
          break-after: page;
        }
        
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Header section */
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
          page-break-inside: avoid;
        }
        
        .company-info h1 {
          font-size: 32px;
          font-weight: bold;
          color: ${settings.primaryColor};
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .company-logo {
          margin-bottom: 15px;
        }
        
        .company-logo img {
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .company-info .subtitle {
          color: ${settings.secondaryColor};
          font-size: 16px;
          font-weight: 400;
        }
        
        .invoice-title-section {
          text-align: right;
          min-width: 200px;
        }
        
        .invoice-title {
          font-size: 36px;
          font-weight: bold;
          color: ${settings.textColor};
          margin-bottom: 15px;
          letter-spacing: -1px;
        }
        
        .invoice-details-box {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .invoice-details-box p {
          margin: 6px 0;
          font-size: 14px;
          color: ${settings.textColor};
        }
        
        .invoice-details-box strong {
          color: ${settings.textColor};
          font-weight: 600;
        }
        
        .invoice-number {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-weight: bold;
          color: ${settings.primaryColor};
        }
        
        /* Two column layout for addresses */
        .address-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 40px;
          page-break-inside: avoid;
        }
        
        .address-column {
          flex: 1;
        }
        
        .address-column h3 {
          font-size: 16px;
          font-weight: 600;
          color: ${settings.textColor};
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .address-column p {
          margin: 4px 0;
          color: ${settings.textColor};
          font-size: 14px;
          line-height: 1.4;
        }
        
        .customer-name {
          font-weight: 600;
          font-size: 16px;
          color: ${settings.textColor};
        }
        
        /* Custom fields */
        .custom-fields {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .custom-fields h3 {
          font-size: 16px;
          font-weight: 600;
          color: ${settings.textColor};
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .custom-fields p {
          margin: 6px 0;
          font-size: 14px;
          color: ${settings.textColor};
        }
        
        /* Items table */
        .items-section {
          margin-bottom: 30px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: white;
          border: 1px solid #d1d5db;
        }
        
        .items-table thead {
          background: ${settings.primaryColor};
          color: white;
        }
        
        .items-table thead th {
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        
        .items-table thead th:last-child {
          border-right: none;
          text-align: right;
        }
        
        .items-table thead th.text-right {
          text-align: right;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          page-break-inside: avoid;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .items-table tbody tr:hover {
          background: #f3f4f6;
        }
        
        .items-table tbody td {
          padding: 12px;
          font-size: 14px;
          color: ${settings.textColor};
          vertical-align: top;
          border-right: 1px solid #f1f5f9;
        }
        
        .items-table tbody td:last-child {
          border-right: none;
          text-align: right;
          font-weight: 600;
        }
        
        .items-table tbody td.text-right {
          text-align: right;
        }
        
        .item-description {
          font-weight: 500;
          color: ${settings.textColor};
          margin-bottom: 4px;
        }
        
        .item-measurements {
          font-size: 12px;
          color: ${settings.secondaryColor};
          font-style: italic;
        }
        
        .item-number {
          font-weight: 600;
          color: ${settings.secondaryColor};
          text-align: center;
        }
        
        /* Table totals section */
        .table-totals {
          page-break-inside: avoid;
        }
        
        .subtotal-row {
          background: #f8fafc;
          border-top: 2px solid ${settings.primaryColor};
        }
        
        .subtotal-row td {
          padding: 15px 12px;
          font-weight: 600;
          font-size: 15px;
        }
        
        .total-row {
          background: ${settings.primaryColor};
          color: white;
        }
        
        .total-row td {
          padding: 18px 12px;
          font-weight: bold;
          font-size: 18px;
        }
        
        .total-amount {
          color: white;
          font-size: 20px;
        }
        
        /* Summary box */
        .summary-box {
          background: #f0f9ff;
          border: 2px solid ${settings.primaryColor};
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
          page-break-inside: avoid;
        }
        
        .summary-box .total-label {
          font-size: 18px;
          font-weight: 600;
          color: ${settings.textColor};
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .summary-box .total-amount {
          font-size: 32px;
          font-weight: bold;
          color: ${settings.primaryColor};
          font-family: 'Arial', sans-serif;
        }
        
        /* Payment terms */
        .payment-terms {
          background: #fffbeb;
          border: 1px solid #f59e0b;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          page-break-inside: avoid;
        }
        
        .payment-terms h4 {
          color: #92400e;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .payment-terms p {
          color: #78350f;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        /* Footer */
        .footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          page-break-inside: avoid;
        }
        
        .footer h4 {
          color: ${settings.primaryColor};
          margin-bottom: 15px;
          font-size: 20px;
          font-weight: 600;
        }
        
        .footer p {
          color: ${settings.secondaryColor};
          margin: 8px 0;
          font-size: 13px;
        }
        
        .footer .invoice-ref {
          background: #f1f5f9;
          padding: 10px;
          border-radius: 6px;
          margin-top: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: ${settings.textColor};
        }
        
        /* Print styles */
        @media print {
          .invoice-container {
            margin: 0;
            padding: 15mm;
            box-shadow: none;
          }
          
          .page-break-before {
            page-break-before: always;
          }
          
          .page-break-after {
            page-break-after: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
        
        /* Mobile responsive adjustments for consistent rendering */
        @media screen and (max-width: 768px) {
          .invoice-container {
            padding: 15px;
            max-width: 100%;
          }
          
          .invoice-header {
            flex-direction: column;
            gap: 20px;
          }
          
          .invoice-title-section {
            text-align: left;
          }
          
          .address-section {
            flex-direction: column;
            gap: 25px;
          }
          
          .items-table {
            font-size: 12px;
          }
          
          .items-table thead th,
          .items-table tbody td {
            padding: 8px 6px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Section -->
        <div class="invoice-header no-break">
          <div class="company-info">
            ${settings.showLogo && settings.logoUrl ? `
              <div class="company-logo" style="margin-bottom: 15px;">
                <img 
                  src="${settings.logoUrl}" 
                  alt="Company Logo" 
                  style="
                    width: ${settings.logoSize === 'small' ? '60px' : settings.logoSize === 'large' ? '120px' : '90px'};
                    height: ${settings.logoSize === 'small' ? '60px' : settings.logoSize === 'large' ? '120px' : '90px'};
                    object-fit: contain;
                    display: block;
                    ${settings.logoPosition === 'center' ? 'margin: 0 auto;' : settings.logoPosition === 'right' ? 'margin-left: auto;' : ''}
                  "
                />
              </div>
            ` : ''}
            <h1>${settings.companyName || 'Your Company'}</h1>
            <div class="subtitle">${settings.companySubtitle}</div>
          </div>
          <div class="invoice-title-section">
            <div class="invoice-title">Invoice</div>
            <div class="invoice-details-box">
              <p><strong>Invoice #:</strong> <span class="invoice-number">${settings.invoicePrefix}-${bill.id.toUpperCase()}</span></p>
              <p><strong>Date:</strong> ${formatDate(bill.date)}</p>
              ${settings.showDueDate ? `<p><strong>Due Date:</strong> ${formatDate(new Date(new Date(bill.date).getTime() + settings.dueDays * 24 * 60 * 60 * 1000).toISOString())}</p>` : ''}
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="address-section no-break">
          <div class="address-column">
            <h3>From:</h3>
            ${settings.showCompanyAddress && settings.companyAddress ? `
              <p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>
              ${settings.companyPhone ? `<p>Phone: ${settings.companyPhone}</p>` : ''}
              ${settings.companyEmail ? `<p>Email: ${settings.companyEmail}</p>` : ''}
              ${settings.companyWebsite ? `<p>Website: ${settings.companyWebsite}</p>` : ''}
            ` : `
              <p>${settings.companyName || 'Your Company Name'}</p>
              <p>${settings.companySubtitle}</p>
            `}
          </div>
          
          <div class="address-column">
            <h3>Bill To:</h3>
            <p class="customer-name">${bill.customerName}</p>
            ${bill.description ? `<p>${bill.description}</p>` : ''}
            
            <div style="margin-top: 20px;">
              <h3>Invoice Summary:</h3>
              <p><strong>Total Items:</strong> ${bill.items.length}</p>
              <p><strong>Created:</strong> ${formatDate(bill.createdAt)}</p>
              <p><strong>Updated:</strong> ${formatDate(bill.updatedAt)}</p>
            </div>
          </div>
        </div>

        ${settings.customFields.filter(cf => cf.position === 'header').length > 0 ? `
        <!-- Custom Header Fields -->
        <div class="custom-fields no-break">
          <h3>Additional Information</h3>
          ${settings.customFields.filter(cf => cf.position === 'header').map(field => `
            <p><strong>${field.label}:</strong> ${field.value}</p>
          `).join('')}
        </div>
        ` : ''}

        <!-- Items Table -->
        <div class="items-section">
          <table class="items-table">
            <thead class="no-break">
              <tr>
                ${settings.showItemNumbers ? '<th style="width: 6%;">#</th>' : ''}
                <th style="width: 40%;">DESCRIPTION</th>
                ${settings.showMeasurements ? '<th class="text-right" style="width: 10%;">FEET</th><th class="text-right" style="width: 10%;">INCHES</th>' : ''}
                <th class="text-right" style="width: 8%;">QTY</th>
                <th class="text-right" style="width: 13%;">RATE</th>
                <th class="text-right" style="width: 13%;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map((item, index) => `
                <tr class="no-break">
                  ${settings.showItemNumbers ? `<td class="item-number">${index + 1}</td>` : ''}
                  <td>
                    <div class="item-description">${item.text || `Item ${index + 1}`}</div>
                    ${settings.showMeasurements && (item.feet > 0 || item.inches > 0) ? `
                      <div class="item-measurements">
                        Measurements: ${item.feet}' ${item.inches}"${item.quantity ? ` × ${item.quantity}` : ''}
                      </div>
                    ` : ''}
                  </td>
                  ${settings.showMeasurements ? `
                    <td class="text-right">${item.feet || '0'}</td>
                    <td class="text-right">${item.inches || '0'}</td>
                  ` : ''}
                  <td class="text-right">${item.quantity || '1'}</td>
                  <td class="text-right">${formatCurrency(item.defaultValue)}</td>
                  <td class="text-right">${formatCurrency(item.calculatedValue)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot class="table-totals no-break">
              <tr class="subtotal-row">
                <td colspan="${(settings.showItemNumbers ? 1 : 0) + (settings.showMeasurements ? 2 : 0) + 3}" style="text-align: right; border-right: 1px solid #d1d5db;">
                  TOTAL AMOUNT:
                </td>
                <td style="text-align: right;">
                  ${formatCurrency(bill.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${settings.customFields.filter(cf => cf.position === 'footer').length > 0 ? `
        <!-- Custom Footer Fields -->
        <div class="custom-fields no-break">
          <h3>Additional Notes</h3>
          ${settings.customFields.filter(cf => cf.position === 'footer').map(field => `
            <p><strong>${field.label}:</strong> ${field.value}</p>
          `).join('')}
        </div>
        ` : ''}

        ${settings.showFooter ? `
        <!-- Footer -->
        <div class="footer no-break">
          <h4>${settings.footerText}</h4>
          <p>This invoice was generated on ${formatDate(new Date().toISOString())}</p>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Create a temporary div to render the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent.replace('<!DOCTYPE html>', '').replace(/<html[^>]*>/, '').replace('</html>', '').replace(/<head>[\s\S]*?<\/head>/, '').replace(/<body[^>]*>/, '').replace('</body>', '');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempDiv.style.background = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Add the styles directly to the div
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .invoice-container {
          max-width: 794px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          font-family: 'Arial', sans-serif;
          line-height: ${getLineHeight()};
          color: ${settings.textColor};
          font-size: ${getFontSize()};
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .company-info h1 {
          font-size: 32px;
          font-weight: bold;
          color: ${settings.primaryColor};
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .company-logo {
          margin-bottom: 15px;
        }
        
        .company-logo img {
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .company-info .subtitle {
          color: ${settings.secondaryColor};
          font-size: 16px;
          font-weight: 400;
        }
        
        .invoice-title-section {
          text-align: right;
          min-width: 200px;
        }
        
        .invoice-title {
          font-size: 36px;
          font-weight: bold;
          color: ${settings.textColor};
          margin-bottom: 15px;
          letter-spacing: -1px;
        }
        
        .invoice-details-box {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .invoice-details-box p {
          margin: 6px 0;
          font-size: 14px;
          color: ${settings.textColor};
        }
        
        .invoice-details-box strong {
          color: ${settings.textColor};
          font-weight: 600;
        }
        
        .invoice-number {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-weight: bold;
          color: ${settings.primaryColor};
        }
        
        .address-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 40px;
        }
        
        .address-column {
          flex: 1;
        }
        
        .address-column h3 {
          font-size: 16px;
          font-weight: 600;
          color: ${settings.textColor};
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .address-column p {
          margin: 4px 0;
          color: ${settings.textColor};
          font-size: 14px;
          line-height: 1.4;
        }
        
        .customer-name {
          font-weight: 600;
          font-size: 16px;
          color: ${settings.textColor};
        }
        
        .custom-fields {
          margin-bottom: 30px;
        }
        
        .custom-fields h3 {
          font-size: 16px;
          font-weight: 600;
          color: ${settings.textColor};
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .custom-fields p {
          margin: 6px 0;
          font-size: 14px;
          color: ${settings.textColor};
        }
        
        .items-section {
          margin-bottom: 30px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: white;
          border: 1px solid #d1d5db;
        }
        
        .items-table thead {
          background: ${settings.primaryColor};
          color: white;
        }
        
        .items-table thead th {
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        
        .items-table thead th:last-child {
          border-right: none;
          text-align: right;
        }
        
        .items-table thead th.text-right {
          text-align: right;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .items-table tbody td {
          padding: 12px;
          font-size: 14px;
          color: ${settings.textColor};
          vertical-align: top;
          border-right: 1px solid #f1f5f9;
        }
        
        .items-table tbody td:last-child {
          border-right: none;
          text-align: right;
          font-weight: 600;
        }
        
        .items-table tbody td.text-right {
          text-align: right;
        }
        
        .item-description {
          font-weight: 500;
          color: ${settings.textColor};
          margin-bottom: 4px;
        }
        
        .item-measurements {
          font-size: 12px;
          color: ${settings.secondaryColor};
          font-style: italic;
        }
        
        .item-number {
          font-weight: 600;
          color: ${settings.secondaryColor};
          text-align: center;
        }
        
        .subtotal-row {
          background: #f8fafc;
          border-top: 2px solid ${settings.primaryColor};
        }
        
        .subtotal-row td {
          padding: 15px 12px;
          font-weight: 600;
          font-size: 15px;
        }
        
        .total-row {
          background: ${settings.primaryColor};
          color: white;
        }
        
        .total-row td {
          padding: 18px 12px;
          font-weight: bold;
          font-size: 18px;
        }
        
        .total-amount {
          color: white;
          font-size: 20px;
        }
        
        .summary-box {
          background: #f0f9ff;
          border: 2px solid ${settings.primaryColor};
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
        }
        
        .summary-box .total-label {
          font-size: 18px;
          font-weight: 600;
          color: ${settings.textColor};
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .summary-box .total-amount {
          font-size: 32px;
          font-weight: bold;
          color: ${settings.primaryColor};
          font-family: 'Arial', sans-serif;
        }
        
        .payment-terms {
          background: #fffbeb;
          border: 1px solid #f59e0b;
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .payment-terms h4 {
          color: #92400e;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 600;
        }
        
        .payment-terms p {
          color: #78350f;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
        }
        
        .footer h4 {
          color: ${settings.primaryColor};
          margin-bottom: 15px;
          font-size: 20px;
          font-weight: 600;
        }
        
        .footer p {
          color: ${settings.secondaryColor};
          margin: 8px 0;
          font-size: 13px;
        }
        
        .footer .invoice-ref {
          background: #f1f5f9;
          padding: 10px;
          border-radius: 6px;
          margin-top: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: ${settings.textColor};
        }
    `;
    
    document.head.appendChild(styleElement);
    document.body.appendChild(tempDiv);

    // Wait for fonts and styles to load
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Convert HTML to canvas with optimized settings for mobile
      const canvas = await html2canvas(tempDiv, {
        scale: window.devicePixelRatio || 2, // Use device pixel ratio for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: Math.max(tempDiv.scrollHeight, 1123), // Minimum A4 height
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        foreignObjectRendering: false // Disable for better compatibility
      });

      // Remove the temporary div
      document.head.removeChild(styleElement);
      document.body.removeChild(tempDiv);

      // Create PDF with A4 dimensions
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Calculate pages needed
      const totalPages = Math.ceil(imgHeight / pdfHeight);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const yOffset = -(i * pdfHeight);
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight, undefined, 'FAST');
      }

      if (returnBlob) {
        // Return PDF as blob for sharing
        return pdf.output('blob');
      } else {
        // Download the PDF
        const fileName = `${settings.invoicePrefix || 'INV'}-${bill.customerName.replace(/\s+/g, '-')}-${bill.id}.pdf`;
        pdf.save(fileName);
      }

    } catch (canvasError) {
      // Remove temp div if it still exists
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
      throw canvasError;
    }

  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    let message = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error) {
      message = (error as { message: string }).message;
    } else if (typeof error === 'string') {
      message = error;
    }
    throw new Error('PDF generation failed: ' + message);
  }
}
