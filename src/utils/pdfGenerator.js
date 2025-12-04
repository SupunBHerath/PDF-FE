import html2pdf from 'html2pdf.js';

export const generatePDFTemplate = (quotation, company) => {
    return `
<style>
body {
    font-family: Arial, sans-serif;
    font-size: 13px;
    color: #222;
    padding: 0;
    margin: 0;
}

.pdf-wrapper {
    width: 100%;
    padding: 20px 25px 140px 25px;
    box-sizing: border-box;
    position: relative;
    min-height: 285mm;
}

.header-top {
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 15px;
}

.company-name {
    font-size: 20px;
    font-weight: bold;
}

.company-details {
    font-size: 11px;
    margin-top: 5px;
}

.quotation-title {
    font-size: 22px;
    font-weight: bold;
    text-align: right;
}

.header-info {
    text-align: right;
    font-size: 12px;
}

.section {
    margin-top: 10px;
}

.section strong {
    font-size: 13px;
}

.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

.table th {
    background: #f2f2f2;
    padding: 8px;
    font-size: 12px;
    border: 1px solid #ccc;
    text-align: center;
}

.table td {
    padding: 8px;
    border: 1px solid #ccc;
    font-size: 12px;
}

.picture-box {
    width: 40px;
    height: 40px;
    background: #d9d9d9;
    border-radius: 50%;
    margin: auto;
}

.total-wrapper {
    margin-top: 15px;
    margin-bottom: 20px;
    text-align: right;
    font-size: 15px;
    font-weight: bold;
}

.footer {
    position: absolute;
    bottom: 55px;
    left: 25px;
    right: 25px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
}

.notes {
    width: 60%;
}

.signature {
    width: 40%;
    text-align: right;
    font-size: 11px;
}
</style>

<div class="pdf-wrapper">

    <!-- HEADER -->
    <div class="header-top">
        <div>
            <div class="company-name">${company?.name || 'Company Name'}</div>
            <div class="company-details">
                ${company?.address || ''}<br>
                ${company?.contact || ''}<br>
                ${company?.email || ''}
            </div>
        </div>

        <div>
            <div class="quotation-title">Quotation</div>
            <div class="header-info">
                Date: ${quotation?.created_at ? new Date(quotation.created_at).toLocaleDateString('en-GB') : 'N/A'}<br>
                Quotation #: ${quotation?.quotation_number || 'N/A'}
            </div>
        </div>
    </div>

    <!-- RECIPIENT -->
    <div class="section">
        <strong>To:</strong> ${company?.name || 'N/A'}<br>
        <strong>Subject:</strong> ${quotation?.subject || 'QUOTATION FOR THE SUPPLY OF PERSONAL PROTECTIVE EQUIPMENT'}
    </div>

    <div class="section">
        Further to your inquiry, we are pleased to quote the following items.
    </div>

    <!-- TABLE -->
    <table class="table">
        <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Units</th>
            <th>Unit Price LKR</th>
            <th>Qty</th>
            <th>Total Price LKR</th>
            <th>Picture</th>
        </tr>

        ${(Array.isArray(quotation.items) ? quotation.items : JSON.parse(quotation.items || "[]"))
  .map((item, index) => `
        <tr>
            <td style="text-align:center;">${String(index + 1).padStart(2, "0")}</td>
            <td>${item.name || item.description || 'N/A'}</td>
            <td style="text-align:center;">${item.unit_type || item.unit || 'N/A'}</td>
            <td style="text-align:right;">${Number(item.price || item.unit_price || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
            <td style="text-align:center;">${item.quantity || item.qty || 0}</td>
            <td style="text-align:right;">${Number((item.price || item.unit_price || 0) * (item.quantity || item.qty || 0)).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
            <td>${item.picture ? `<img src="${item.picture}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" />` : '<div class="picture-box"></div>'}</td>
        </tr>
    `)
  .join("")}

    </table>

    <!-- TOTAL -->
    <div class="total-wrapper">
        Grand Total LKR: ${Number(quotation?.total || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <div class="notes">
            <strong>Additional Notes:</strong><br>
            ${quotation?.notes ? quotation.notes.replace(/\n/g, '<br>') + '<br>' : ''}
            ${quotation?.terms ? quotation.terms.replace(/\n/g, '<br>') + '<br>' : ''}
            ${quotation?.tax_rate > 0 ? `• ${quotation.tax_rate}% Tax will be applied.<br>` : ''}
            ${quotation?.discount > 0 ? `• Discount of LKR ${Number(quotation.discount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} has been applied.<br>` : ''}
            <br>
            Thank you.
        </div>

        <div class="signature">
            Yours faithfully,<br><br><br>
            <strong>${quotation?.signatory_name || 'N/A'}</strong><br>
            ${quotation?.signatory_phone || ''}
        </div>
    </div>
</div>
`;
};


/* -----------------------------------------------------
 *  PDF GENERATION (downloads a real .pdf)
 * ----------------------------------------------------*/
export const generateQuotationPDF = (quotation, company) => {
    const html = generatePDFTemplate(quotation, company);

    const options = {
        margin: [5, 5, 5, 5],
        filename: `Quotation-${quotation.quotation_number}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
        },
        pagebreak: { mode: 'avoid-all' }
    };

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    html2pdf()
        .set(options)
        .from(wrapper)
        .save()
        .then(() => wrapper.remove());
};
