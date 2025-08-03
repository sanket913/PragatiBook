import { Bill } from "@/types/bill";
import { TemplateSettings } from "@/types/template";

export async function generatePDF(
  bill: Bill,
  returnBlob: boolean = false,
  template?: TemplateSettings,
  taxPercent: number = 0
): Promise<Blob | void> {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const settings = template || {
    companyName: "Your Company",
    companySubtitle: "Professional Services",
    companyAddress: "Address here",
    companyPhone: "1234567890",
    companyEmail: "email@example.com",
    companyWebsite: "",
    primaryColor: "#1d4ed8",
    secondaryColor: "#64748b",
    accentColor: "#059669",
    textColor: "#1f2937",
    backgroundColor: "#ffffff",
    fontSize: "medium",
    spacing: "normal",
    showLogo: false,
    showCompanyAddress: true,
    showDueDate: true,
    showPaymentTerms: true,
    showFooter: true,
    showItemNumbers: true,
    showMeasurements: true,
    invoicePrefix: "INV",
    dueDays: 30,
    footerText: "Thank you for your business!",
    paymentTerms:
      "Payment is due within 30 days of invoice date. Please include the invoice number with your payment.",
  };

  const subtotal = bill.total;
  const taxAmount = (subtotal * taxPercent) / 100;
  const totalWithTax = subtotal + taxAmount;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .invoice-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      padding: 40px;
    }

    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid ${settings.primaryColor};
    }

    .company-section {
      flex: 1;
      max-width: 50%;
    }

    .company-name {
      font-size: 32px;
      font-weight: 700;
      color: ${settings.primaryColor};
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .company-subtitle {
      font-size: 16px;
      color: ${settings.secondaryColor};
      margin-bottom: 16px;
      font-weight: 500;
    }

    .company-details {
      font-size: 14px;
      color: #374151;
      line-height: 1.5;
    }

    .company-details p {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .company-details .icon {
      margin-right: 8px;
      font-size: 14px;
    }

    .invoice-info {
      background: ${settings.primaryColor}08;
      border: 1px solid ${settings.primaryColor}20;
      border-radius: 12px;
      padding: 24px;
      min-width: 280px;
      text-align: left;
    }

    .invoice-title {
      font-size: 24px;
      font-weight: 700;
      color: ${settings.primaryColor};
      margin-bottom: 16px;
      text-align: center;
    }

    .invoice-details p {
      font-size: 14px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .invoice-details strong {
      color: ${settings.primaryColor};
      font-weight: 600;
      min-width: 80px;
    }

    /* Billing Section */
    .billing-section {
      display: flex;
      gap: 32px;
      margin-bottom: 40px;
    }

    .billing-card {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
    }

    .billing-card h3 {
      font-size: 16px;
      font-weight: 600;
      color: ${settings.primaryColor};
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .billing-card .customer-name {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .billing-card p {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    /* Items Section */
    .items-section {
      margin-bottom: 40px;
    }

    .items-title {
      font-size: 20px;
      font-weight: 600;
      color: ${settings.primaryColor};
      margin-bottom: 20px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .items-table thead {
      background: ${settings.primaryColor};
    }

    .items-table th {
      padding: 16px 12px;
      font-size: 14px;
      font-weight: 600;
      text-align: left;
      color: white;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .items-table th:last-child {
      border-right: none;
    }

    .items-table th.text-right {
      text-align: right;
    }

    .items-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
    }

    .items-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .items-table td {
      padding: 16px 12px;
      font-size: 14px;
      color: #374151;
      vertical-align: middle;
    }

    .items-table td.text-right {
      text-align: right;
    }

    .items-table td.item-description {
      font-weight: 500;
      color: #1f2937;
    }

    .items-table td.amount {
      font-weight: 600;
      color: #059669;
    }

    /* Summary Section */
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }

    .summary-box {
      background: #f8fafc;
      border: 2px solid ${settings.primaryColor}20;
      border-radius: 12px;
      padding: 24px;
      min-width: 320px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 16px;
    }

    .summary-row.subtotal {
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 8px;
      padding-bottom: 12px;
    }

    .summary-row.tax {
      color: #6b7280;
      font-size: 14px;
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 20px;
      color: ${settings.accentColor};
      border-top: 2px solid ${settings.primaryColor};
      margin-top: 12px;
      padding-top: 16px;
    }

    /* Payment Terms */
    .payment-terms {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
    }

    .payment-terms h4 {
      font-size: 16px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }

    .payment-terms h4::before {
      content: "💳";
      margin-right: 8px;
    }

    .payment-terms p {
      font-size: 14px;
      color: #78350f;
      line-height: 1.6;
    }

    /* Signatures */
    .signatures {
      display: flex;
      justify-content: space-between;
      gap: 40px;
      margin: 60px 0 40px 0;
    }

    .signature-box {
      flex: 1;
      text-align: center;
      padding-top: 40px;
      border-top: 2px dashed #9ca3af;
      position: relative;
    }

    .signature-box::before {
      content: "";
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: #9ca3af;
    }

    .signature-box p {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
      margin-top: 8px;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding-top: 32px;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
    }

    .footer-text {
      font-size: 18px;
      font-weight: 600;
      color: ${settings.primaryColor};
      margin-bottom: 8px;
    }

    .footer p {
      font-size: 12px;
      color: #9ca3af;
    }

    /* Print Styles */
    @media print {
      body {
        padding: 20px;
      }
      
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
      
      .header {
        margin-bottom: 30px;
        padding-bottom: 20px;
      }
      
      .billing-section {
        margin-bottom: 30px;
      }
      
      .items-section {
        margin-bottom: 30px;
      }
      
      .summary-section {
        margin-bottom: 30px;
      }
      
      .signatures {
        margin: 40px 0 30px 0;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 24px;
      }
      
      .company-section {
        max-width: 100%;
      }
      
      .invoice-info {
        min-width: auto;
        width: 100%;
      }
      
      .billing-section {
        flex-direction: column;
        gap: 20px;
      }
      
      .signatures {
        flex-direction: column;
        gap: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header Section -->
    <div class="header">
      <div class="company-section">
        ${settings.showLogo && settings.logoUrl ? `
          <div style="margin-bottom: 16px;">
            <div style="width: ${settings.logoSize === 'small' ? '48px' : settings.logoSize === 'large' ? '96px' : '72px'}; height: ${settings.logoSize === 'small' ? '48px' : settings.logoSize === 'large' ? '96px' : '72px'}; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280; border: 2px dashed #d1d5db;">LOGO</div>
          </div>
        ` : ''}
        
        <h1 class="company-name">${settings.companyName || 'Your Company'}</h1>
        <p class="company-subtitle">${settings.companySubtitle}</p>
        
        ${settings.showCompanyAddress && settings.companyAddress ? `
          <div class="company-details">
            <p><span class="icon">📍</span>${settings.companyAddress}</p>
            ${settings.companyPhone ? `<p><span class="icon">📞</span>${settings.companyPhone}</p>` : ''}
            ${settings.companyEmail ? `<p><span class="icon">✉️</span>${settings.companyEmail}</p>` : ''}
            ${settings.companyWebsite ? `<p><span class="icon">🌐</span>${settings.companyWebsite}</p>` : ''}
          </div>
        ` : ''}
      </div>

      <div class="invoice-info">
        <h2 class="invoice-title">INVOICE</h2>
        <div class="invoice-details">
          <p><strong>Invoice No:</strong> <span>${settings.invoicePrefix}-${bill.id.toUpperCase()}</span></p>
          <p><strong>Date:</strong> <span>${formatDate(bill.date)}</span></p>
          ${settings.showDueDate ? `
            <p><strong>Due:</strong> <span>${formatDate(
              new Date(
                new Date(bill.date).getTime() + settings.dueDays * 24 * 60 * 60 * 1000
              ).toISOString()
            )}</span></p>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- Billing Section -->
    <div class="billing-section">
      <div class="billing-card">
        <h3>From</h3>
        <div class="customer-name">${settings.companyName || 'Your Company'}</div>
        ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ''}
      </div>
      
      <div class="billing-card">
        <h3>Bill To</h3>
        <div class="customer-name">${bill.customerName}</div>
        ${bill.description ? `<p>${bill.description}</p>` : ''}
      </div>
    </div>

    <!-- Items Section -->
    <div class="items-section">
      <h3 class="items-title">Invoice Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            ${settings.showItemNumbers ? '<th>#</th>' : ''}
            <th>Description</th>
            ${settings.showMeasurements ? '<th class="text-right">Feet</th>' : ''}
            ${settings.showMeasurements ? '<th class="text-right">Inches</th>' : ''}
            <th class="text-right">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items
            .map(
              (item, i) => `
            <tr>
              ${settings.showItemNumbers ? `<td>${i + 1}</td>` : ''}
              <td class="item-description">${item.text || 'Item'}</td>
              ${settings.showMeasurements ? `<td class="text-right">${item.feet || '-'}</td>` : ''}
              ${settings.showMeasurements ? `<td class="text-right">${item.inches || '-'}</td>` : ''}
              <td class="text-right">${item.quantity || '-'}</td>
              <td class="text-right">${formatCurrency(item.defaultValue)}</td>
              <td class="text-right amount">${formatCurrency(item.calculatedValue)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Summary Section -->
    <div class="summary-section">
      <div class="summary-box">
        <div class="summary-row subtotal">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${taxPercent > 0 ? `
          <div class="summary-row tax">
            <span>Tax (${taxPercent}%):</span>
            <span>${formatCurrency(taxAmount)}</span>
          </div>
        ` : ''}
        <div class="summary-row total">
          <span>Total:</span>
          <span>${formatCurrency(totalWithTax)}</span>
        </div>
      </div>
    </div>
    <!-- Signatures - SINGLE SECTION ONLY -->
    <div class="signatures">
      <div class="signature-box">
        <p>Customer Signature</p>
      </div>
      <div class="signature-box">
        <p>Authorized Signatory</p>
      </div>
    </div>

    <!-- Footer -->
    ${settings.showFooter ? `
      <div class="footer">
        <p class="footer-text">${settings.footerText}</p>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
    ` : ''}
  </div>
</body>
</html>
`;

  if (returnBlob) return new Blob([htmlContent], { type: "text/html" });

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  // Create temporary container with exact styling
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "0";
  tempDiv.style.width = "800px";
  tempDiv.style.background = "white";
  tempDiv.style.zIndex = "-1000";
  document.body.appendChild(tempDiv);

  try {
    // Wait for fonts and styles to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied in the cloned document
        const clonedDiv = clonedDoc.querySelector('div');
        if (clonedDiv) {
          clonedDiv.style.width = '800px';
          clonedDiv.style.background = 'white';
        }
      }
    });
    
    document.body.removeChild(tempDiv);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    // Add first page with margins
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20); // Account for top and bottom margins

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10; // 10mm top margin
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    // Save with proper filename
    const filename = `${settings.invoicePrefix}-${bill.customerName.replace(/[^a-zA-Z0-9]/g, '-')}-${bill.id}.pdf`;
    pdf.save(filename);
    
  } catch (error) {
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
