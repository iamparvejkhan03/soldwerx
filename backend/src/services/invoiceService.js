import Auction from '../models/auction.model.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { uploadDocumentToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

/**
 * Build invoice data object from auction and options
 */
export const buildInvoiceData = (auction, options = {}) => {
    const hammerPrice = auction.finalPrice || 0;
    const buyerPremium = auction.buyerFeeAmount || 0;
    const taxAmount = auction.taxAmount || 0;
    const total = hammerPrice + buyerPremium + taxAmount;
    const paymentStatus = auction.paymentStatus || 'pending';
    const paymentMethod = auction.paymentMethod || 'N/A';

    return {
        invoiceNumber: `INV-${auction._id.toString().toUpperCase()}`,
        date: new Date(),
        hammerPrice,
        buyerPremium,
        taxAmount,
        total,
        paymentStatus,
        paymentMethod,
        buyerName: auction.winner?.firstName
            ? `${auction.winner.firstName} ${auction.winner.lastName || ''}`.trim()
            : auction.winner?.username || 'Buyer',
        sellerName: auction.seller?.firstName
            ? `${auction.seller.firstName} ${auction.seller.lastName || ''}`.trim()
            : auction.seller?.username || 'Seller',
        itemTitle: auction.title,
        itemDescription: auction.subTitle || auction.description?.slice(0, 100) || '',
    };
};

/**
 * Generate PDF invoice and upload to Cloudinary, then update auction.invoice
 * @param {string} auctionId
 * @param {Object} options { updated: boolean, oldPublicId: string, updatedBy: userId }
 * @returns {Promise<Object>} Updated auction invoice field
 */
export const generateAndAttachInvoice = async (auctionId, options = {}) => {
    try {
        const auction = await Auction.findById(auctionId)
            .populate('winner', 'firstName lastName username email')
            .populate('seller', 'firstName lastName username email');

        if (!auction) {
            throw new Error('Auction not found');
        }

        // If auction is not sold or giveaways with zero total, skip invoice
        if (!['sold', 'sold_buy_now'].includes(auction.status) && auction.auctionType !== 'giveaway') {
            console.log(`⚠️ Invoice not generated for auction ${auctionId} – status not sold`);
            return null;
        }

        // Build invoice data
        const invoiceData = buildInvoiceData(auction, options);

        // Generate PDF buffer
        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Prepare filename
        const timestamp = Date.now();
        const filename = `invoice-${auction._id}-${timestamp}.pdf`;

        // Upload to Cloudinary
        const uploadResult = await uploadDocumentToCloudinary(
            pdfBuffer,
            filename,
            'invoices'
        );

        // If we are updating (replacing), delete old invoice from Cloudinary
        if (options.oldPublicId) {
            await deleteFromCloudinary(options.oldPublicId);
        }

        // Update auction invoice field
        auction.invoice = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            filename: filename,
            uploadedAt: new Date(),
            uploadedBy: options.updatedBy || null,
        };

        await auction.save();

        console.log(`✅ Invoice uploaded for auction ${auctionId}`);
        return auction.invoice;
    } catch (error) {
        console.error(`❌ Failed to generate invoice for auction ${auctionId}:`, error);
        // Do not throw; we don't want to break the main flow
        return null;
    }
};