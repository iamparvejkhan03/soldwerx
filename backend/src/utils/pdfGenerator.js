import pdfmake from "pdfmake";

// pdfmake 0.3.x supports the standard PDF 14 fonts.
// No .ttf font files are required.
pdfmake.addFonts({
    Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
    },
});

/**
 * Generate a PDF invoice buffer from invoice data
 *
 * @param {Object} invoiceData - The invoice data object
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateInvoicePDF = async (invoiceData) => {
    const {
        invoiceNumber,
        date,
        hammerPrice = 0,
        buyerPremium = 0,
        taxAmount = 0,
        total = 0,
        paymentStatus = "pending",
        paymentMethod = "N/A",
        buyerName = "",
        sellerName = "",
        itemTitle = "",
    } = invoiceData;

    // Make sure all numeric values are actually numbers.
    const safeHammerPrice = Number(hammerPrice) || 0;
    const safeBuyerPremium = Number(buyerPremium) || 0;
    const safeTaxAmount = Number(taxAmount) || 0;
    const safeTotal = Number(total) || 0;

    const formattedDate = date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    const formattedPaymentMethod =
        paymentMethod && paymentMethod !== "N/A"
            ? paymentMethod.replace(/_/g, " ").toUpperCase()
            : null;

    const normalizedPaymentStatus = String(paymentStatus).toLowerCase();

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],

        // Use standard PDF font.
        defaultStyle: {
            font: "Helvetica",
            fontSize: 10,
        },

        content: [
            // Header
            {
                columns: [
                    {
                        text: "INVOICE",
                        style: "header",
                        alignment: "left",
                    },
                    {
                        text: `# ${invoiceNumber || ""}`,
                        style: "subheader",
                        alignment: "right",
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // Invoice date
            {
                text: `Date: ${formattedDate}`,
                alignment: "right",
                margin: [0, 0, 0, 20],
                color: "#666666",
            },

            // Buyer & Seller information
            {
                columns: [
                    {
                        stack: [
                            {
                                text: "Bill To:",
                                bold: true,
                                margin: [0, 0, 0, 3],
                            },
                            {
                                text: buyerName || "N/A",
                            },
                        ],
                        margin: [0, 0, 0, 10],
                    },
                    {
                        stack: [
                            {
                                text: "Seller:",
                                bold: true,
                                margin: [0, 0, 0, 3],
                            },
                            {
                                text: sellerName || "N/A",
                            },
                        ],
                        alignment: "right",
                    },
                ],
                margin: [0, 0, 0, 15],
            },

            // Item title
            {
                text: itemTitle || "Auction Item",
                style: "itemTitle",
                margin: [0, 10, 0, 5],
            },

            // Invoice table
            {
                table: {
                    widths: ["*", "auto"],
                    headerRows: 1,
                    body: [
                        [
                            {
                                text: "Description",
                                style: "tableHeader",
                            },
                            {
                                text: "Total",
                                style: "tableHeader",
                                alignment: "right",
                            },
                        ],

                        [
                            {
                                text: "Hammer Price",
                            },
                            {
                                text: `$${safeHammerPrice.toFixed(2)}`,
                                alignment: "right",
                            },
                        ],

                        ...(safeBuyerPremium > 0
                            ? [
                                [
                                    {
                                        text: "Buyer Premium",
                                    },
                                    {
                                        text: `$${safeBuyerPremium.toFixed(2)}`,
                                        alignment: "right",
                                    },
                                ],
                            ]
                            : []),

                        ...(safeTaxAmount > 0
                            ? [
                                [
                                    {
                                        text: "Tax",
                                    },
                                    {
                                        text: `$${safeTaxAmount.toFixed(2)}`,
                                        alignment: "right",
                                    },
                                ],
                            ]
                            : []),

                        [
                            {
                                text: "Total",
                                style: "totalLabel",
                            },
                            {
                                text: `$${safeTotal.toFixed(2)}`,
                                style: "totalAmount",
                                alignment: "right",
                            },
                        ],
                    ],
                },

                layout: {
                    fillColor: (rowIndex) => {
                        if (rowIndex === 0) {
                            return "#1a1a1a";
                        }

                        return rowIndex % 2 === 0 ? "#F5F5F5" : null;
                    },

                    paddingLeft: () => 8,
                    paddingRight: () => 8,
                    paddingTop: () => 7,
                    paddingBottom: () => 7,

                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => "#DDDDDD",
                    vLineColor: () => "#DDDDDD",
                },

                margin: [0, 20, 0, 20],
            },

            // Payment status
            {
                text: `Payment Status: ${normalizedPaymentStatus.toUpperCase()}`,
                color:
                    normalizedPaymentStatus === "completed"
                        ? "#22c55e"
                        : "#eab308",
                bold: true,
                margin: [0, 10, 0, 0],
            },

            // Payment method
            ...(formattedPaymentMethod
                ? [
                    {
                        text: `Payment Method: ${formattedPaymentMethod}`,
                        color: "#555555",
                        margin: [0, 5, 0, 0],
                    },
                ]
                : []),

            // Footer
            {
                text: "Thank you for your business!",
                alignment: "center",
                margin: [0, 40, 0, 0],
                color: "#888888",
                fontSize: 10,
            },
        ],

        styles: {
            header: {
                fontSize: 24,
                bold: true,
                color: "#1a1a1a",
            },

            subheader: {
                fontSize: 14,
                bold: true,
                color: "#666666",
            },

            tableHeader: {
                bold: true,
                color: "#FFFFFF",
                alignment: "center",
            },

            totalLabel: {
                bold: true,
                fontSize: 14,
            },

            totalAmount: {
                bold: true,
                fontSize: 16,
                color: "#22c55e",
            },

            itemTitle: {
                fontSize: 16,
                bold: true,
                color: "#1a1a1a",
            },
        },
    };

    try {
        const pdf = pdfmake.createPdf(docDefinition);

        // pdfmake 0.3.x provides promise-based output methods.
        const buffer = await pdf.getBuffer();

        return buffer;
    } catch (error) {
        console.error("Invoice PDF generation error:", error);
        throw error;
    }
};