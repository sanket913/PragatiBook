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
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      color: ${settings.textColor};
      background: ${settings.backgroundColor};
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      font-size: 13px;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .company-info {
      max-width: 55%;
    }
    .company-info h1 {
      margin-bottom: 4px;
      color: ${settings.primaryColor};
    }
    .invoice-box {
      border: 1px solid #ddd;
      padding: 10px 14px;
      border-radius: 6px;
      background: #f9fafb;
      text-align: left;
    }
    .invoice-box p { margin: 4px 0; }

    /* FROM & BILL TO */
    .section-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 25px;
    }
    .card {
      flex: 1;
      border: 1px solid #ddd;
      padding: 12px;
      border-radius: 6px;
      background: #fff;
    }
    .card h3 {
      font-size: 14px;
      margin-bottom: 8px;
      border-bottom: 1px solid #eee;
      padding-bottom: 4px;
    }

    /* TABLE */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    thead {
      background: ${settings.primaryColor};
      color: white;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      font-size: 12px;
    }
    tbody tr:nth-child(even) { background: #f9f9f9; }
    td:last-child, th:last-child { text-align: right; }

    /* SUMMARY BOX */
    .summary-box {
      width: 300px;
      margin-left: auto;
      margin-top: 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 12px;
      background: #f9fafb;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .summary-row.total {
      font-weight: bold;
      font-size: 15px;
      border-top: 2px solid ${settings.primaryColor};
      margin-top: 6px;
      padding-top: 6px;
      color: ${settings.accentColor};
    }

    /* SIGNATURES */
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
    }
    .sign-box {
      width: 45%;
      text-align: center;
      border-top: 1px dashed #888;
      padding-top: 5px;
      font-size: 12px;
    }

    /* FOOTER */
    .footer {
      margin-top: 60px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: ${settings.secondaryColor};
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="company-info">
      <h1>${settings.companyName}</h1>
      <p>${settings.companySubtitle}</p>
      ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ""}
      ${settings.companyPhone ? `<p>📞 ${settings.companyPhone}</p>` : ""}
      ${settings.companyEmail ? `<p>✉️ ${settings.companyEmail}</p>` : ""}
    </div>

    <div class="invoice-box">
      <p><b>Invoice No:</b> ${settings.invoicePrefix}-${bill.id.toUpperCase()}</p>
      <p><b>Date:</b> ${formatDate(bill.date)}</p>
      ${
        settings.showDueDate
          ? `<p><b>Due:</b> ${formatDate(
              new Date(
                new Date(bill.date).getTime() +
                  settings.dueDays * 24 * 60 * 60 * 1000
              ).toISOString()
            )}</p>`
          : ""
      }
    </div>
  </div>

  <!-- FROM & BILL TO -->
  <div class="section-row">
    <div class="card">
      <h3>From</h3>
      <p>${settings.companyName}</p>
      ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ""}
    </div>
    <div class="card">
      <h3>Bill To</h3>
      <p><b>${bill.customerName}</b></p>
      ${bill.description ? `<p>${bill.description}</p>` : ""}
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Feet</th>
        <th>Inches</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${bill.items
        .map(
          (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.text || "Item"}</td>
          <td>${item.feet || "-"}</td>
          <td>${item.inches || "-"}</td>
          <td>${item.quantity || "-"}</td>
          <td>${formatCurrency(item.defaultValue)}</td>
          <td>${formatCurrency(item.calculatedValue)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <!-- SUMMARY -->
  <div class="summary-box">
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>${formatCurrency(subtotal)}</span>
    </div>
    ${
      taxPercent > 0
        ? `<div class="summary-row">
            <span>Tax (${taxPercent}%):</span>
            <span>${formatCurrency(taxAmount)}</span>
          </div>`
        : ""
    }
    <div class="summary-row total">
      <span>Total:</span>
      <span>${formatCurrency(totalWithTax)}</span>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signatures">
    <div class="sign-box">Customer Signature</div>
    <div class="sign-box">Authorized Signatory</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>${settings.paymentTerms}</p>
    <p><b>${settings.footerText}</b></p>
  </div>

</body>
</html>
`;

  if (returnBlob) return new Blob([htmlContent], { type: "text/html" });

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.width = "800px";
  document.body.appendChild(tempDiv);

  const canvas = await html2canvas(tempDiv, { scale: 2 });
  document.body.removeChild(tempDiv);

  const pdf = new jsPDF("p", "mm", "a4");
  const imgData = canvas.toDataURL("image/png");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }

  pdf.save(
    `${settings.invoicePrefix}-${bill.customerName.replace(/\s+/g, "-")}-${
      bill.id
    }.pdf`
  );
}
