import Auction from "../models/auction.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { paymentInitiatedAdminEmail } from "../utils/nodemailer.js";
import BidPayment from '../models/bidPayment.model.js';

export const createBankTransferPayment = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.user.id;

        // Find the auction and verify winner
        const auction = await Auction.findById(auctionId);
        const buyer = await User.findById(userId).select("firstName lastName username email phone");

        if (!auction) {
            return res
                .status(404)
                .json({ success: false, message: "Auction not found" });
        }

        if (auction.winner?._id.toString() !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }

        if (
            auction.paymentStatus === "completed" ||
            auction.paymentStatus === "processing"
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Payment already processed" });
        }

        // Calculate total
        const bidAmount = auction.finalPrice || auction.currentPrice;
        const commissionAmount = auction.buyerFeeAmount || 0;
        const taxAmount = auction.taxAmount || 0;
        const totalAmount = bidAmount + commissionAmount + taxAmount;

        // Update auction status to processing (bank transfer)
        auction.paymentStatus = "processing";
        auction.paymentMethod = "bank_transfer";
        await auction.save();

        // Check if payment already exists
        let payment = await Payment.findOne({ auction: auctionId });

        if (!payment) {
            // Create new payment record
            payment = await Payment.create({
                auction: auctionId,
                bidder: userId,
                bidAmount: bidAmount,
                commissionAmount: commissionAmount,
                totalAmount: totalAmount,
                status: 'processing',
                type: 'bank_transfer_payment',
                paymentMethod: 'bank_transfer',
            });
        } else {
            // Update existing payment
            payment.bidAmount = bidAmount;
            payment.commissionAmount = commissionAmount;
            payment.totalAmount = totalAmount;
            payment.status = 'processing'; // Reset to processing if it was cancelled or failed
            payment.type = 'bank_transfer_payment';
            payment.paymentMethod = 'bank_transfer';
            // Optionally update other fields if needed (e.g., notes)
            await payment.save();
        }

        // ✅ Fetch admin's bank details from database
        const adminUsers = await User.find({ userType: "admin" }).select(
            "payoutMethods firstName lastName email",
        );

        if (adminUsers.length === 0) {
            console.log('⚠️ No admin users found with userType: "admin"');
        } else {
            for (const admin of adminUsers) {
                await paymentInitiatedAdminEmail(
                    admin?.email,
                    payment,
                    buyer,
                    auction
                ).catch((error) =>
                    console.error(
                        `Failed to send admin email to ${admin.email}:`,
                        error,
                    ),
                );
            }
            console.log(
                `✅ Sent admin notifications to ${adminUsers.length} admin(s)`,
            );
        }

        return res.status(200).json({
            success: true,
            message: "Bank transfer initiated. Please complete the transfer.",
            data: {
                auction: {
                    id: auction._id,
                    totalAmount: totalAmount,
                    title: auction.title,
                },
                payment: payment, // optional
            },
        });

    } catch (error) {
        console.error("Bank transfer error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process bank transfer",
        });
    }
};

export const fetchBankDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // ✅ Fetch admin's bank details from database
        const adminUser = await User.findOne({ userType: "admin" }).select(
            "payoutMethods firstName lastName email",
        );

        // Prepare admin bank details
        let bankDetails = null;
        if (adminUser?.payoutMethods?.bankTransfer) {
            bankDetails = {
                accountHolderName:
                    adminUser.payoutMethods.bankTransfer.accountHolderName,
                bankName: adminUser.payoutMethods.bankTransfer.bankName,
                accountNumber: adminUser.payoutMethods.bankTransfer.accountNumber,
                routingNumber: adminUser.payoutMethods.bankTransfer.routingNumber,
                iban: adminUser.payoutMethods.bankTransfer.iban,
                swiftCode: adminUser.payoutMethods.bankTransfer.swiftCode,
                bankAddress: adminUser.payoutMethods.bankTransfer.bankAddress,
                currency: adminUser.payoutMethods.bankTransfer.currency || "USD",
            };
        }

        // If no bank details found, return a generic message
        if (!bankDetails) {
            return res.status(400).json({
                success: false,
                message: "Admin bank details not configured. Please contact support.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bank details fetched. Please complete the transfer.",
            data: {
                accountHolderName:
                    adminUser.payoutMethods.bankTransfer.accountHolderName,
                bankName: adminUser.payoutMethods.bankTransfer.bankName,
                accountNumber: adminUser.payoutMethods.bankTransfer.accountNumber,
                routingNumber: adminUser.payoutMethods.bankTransfer.routingNumber,
                iban: adminUser.payoutMethods.bankTransfer.iban,
                swiftCode: adminUser.payoutMethods.bankTransfer.swiftCode,
                bankAddress: adminUser.payoutMethods.bankTransfer.bankAddress,
                currency: adminUser.payoutMethods.bankTransfer.currency || "USD",
            },
        });
    } catch (error) {
        console.error("Bank transfer error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process bank transfer",
        });
    }
};

// Get payment status for an auction
export const getAuctionPaymentStatus = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const auction = await Auction.findById(auctionId).select(
            "paymentStatus paymentMethod paymentDate transactionId finalPrice buyerFeeAmount sellerFeeAmount",
        );

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: "Auction not found",
            });
        }

        const Payment = await Payment.findOne({
            auction: auctionId,
            bidder: userId,
        }).select("status paymentMethod createdAt");

        return res.status(200).json({
            success: true,
            data: {
                auction: {
                    paymentStatus: auction.paymentStatus,
                    paymentMethod: auction.paymentMethod,
                    paymentDate: auction.paymentDate,
                    transactionId: auction.transactionId,
                    finalPrice: auction.finalPrice,
                    buyerFeeAmount: auction.buyerFeeAmount,
                    sellerFeeAmount: auction.sellerFeeAmount,
                    totalAmount:
                        (auction.finalPrice || 0) + (auction.buyerFeeAmount || 0),
                },
                Payment: Payment,
            },
        });
    } catch (error) {
        console.error("Get payment status error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get all payments for the authenticated bidder
// export const getBidderPayments = async (req, res) => {
//     try {
//         const userId = req.user._id;

//         // Only bidders can access
//         // if (req.user.userType !== 'bidder') {
//         //     return res.status(403).json({ success: false, message: "Only bidders can view their payments" });
//         // }

//         // Fetch all payments for this bidder, populate auction details
//         const payments = await Payment.find({ bidder: userId })
//             .populate('auction', 'title finalPrice currentPrice endDate status')
//             .sort({ createdAt: -1 });

//         // Calculate statistics
//         const totalCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalAmount, 0);
//         const totalPending = payments.filter(p => p.status === 'processing' || p.status === 'pending').reduce((sum, p) => sum + p.totalAmount, 0);
//         const totalAll = payments.reduce((sum, p) => sum + p.totalAmount, 0);
//         const countCompleted = payments.filter(p => p.status === 'completed').length;
//         const countPending = payments.filter(p => p.status === 'processing' || p.status === 'pending').length;
//         const countFailed = payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length;

//         // Format amounts for display (using helper or directly in frontend)
//         const statistics = {
//             totalPaid: totalCompleted,
//             totalPending: totalPending,
//             totalAll: totalAll,
//             countCompleted,
//             countPending,
//             countFailed,
//             formattedTotalPaid: formatCurrency(totalCompleted), // use a helper in frontend instead
//             formattedTotalPending: formatCurrency(totalPending),
//             formattedTotalAll: formatCurrency(totalAll),
//         };

//         res.status(200).json({
//             success: true,
//             data: {
//                 payments,
//                 statistics,
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching bidder payments:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

const normalizeBidPaymentStatus = (status) => {
    switch (status) {
        case 'succeeded': return 'completed';
        case 'processing': return 'processing';
        case 'requires_capture': return 'processing';
        case 'canceled': return 'cancelled';
        case 'processing_failed': return 'failed';
        case 'created':
        case 'requires_payment_method':
        case 'requires_action':
        default: return 'pending';
    }
};

export const getBidderPayments = async (req, res) => {
    try {
        const userId = req.user._id;

        const [bankPayments, cardPayments] = await Promise.all([
            Payment.find({ bidder: userId })
                .populate('auction', 'title finalPrice currentPrice endDate status')
                .sort({ createdAt: -1 })
                .lean(),
            BidPayment.find({
                bidder: userId,
                // Only real charges — skip per-bid authorization holds
                type: { $in: ['winner_payment', 'final_commission'] }
            })
                .populate('auction', 'title finalPrice currentPrice endDate status')
                .sort({ createdAt: -1 })
                .lean()
        ]);

        const normalizedBank = bankPayments.map((p) => ({
            ...p,
            source: 'bank_transfer',
            paymentMethod: p.paymentMethod || 'bank_transfer',
        }));

        const normalizedCard = cardPayments.map((p) => ({
            _id: p._id,
            auction: p.auction,
            bidder: p.bidder,
            bidAmount: p.bidAmount || 0,
            commissionAmount: p.commissionAmount || 0,
            taxAmount: p.taxAmount || 0,
            totalAmount: p.totalAmount || 0,
            status: normalizeBidPaymentStatus(p.status),
            type: p.type,
            source: 'stripe',
            paymentMethod: 'credit_card',
            transactionReference: p.paymentIntentId,
            paymentIntentId: p.paymentIntentId,
            completedAt: p.status === 'succeeded' ? p.updatedAt : null,
            notes:
                p.chargeAttempted && p.chargeSucceeded === false
                    ? 'Card charge failed'
                    : null,
            proofOfPayment: [],
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));

        const payments = [...normalizedBank, ...normalizedCard].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Hide pending transactions from the bidder view
        const VISIBLE_STATUSES = ['completed', 'processing', 'failed', 'cancelled'];
        const visiblePayments = payments.filter((p) => VISIBLE_STATUSES.includes(p.status));

        const completed = visiblePayments.filter((p) => p.status === 'completed');
        const pending = []; // no pending rows visible anymore
        const failed = visiblePayments.filter(
            (p) => p.status === 'failed' || p.status === 'cancelled'
        );

        const totalCompleted = completed.reduce((s, p) => s + p.totalAmount, 0);
        const totalPending = 0;
        const totalAll = visiblePayments.reduce((s, p) => s + p.totalAmount, 0);

        const statistics = {
            totalPaid: totalCompleted,
            totalPending: totalPending,
            totalAll: totalAll,
            countCompleted: completed.length,
            countPending: pending.length,
            countFailed: failed.length,
            formattedTotalPaid: formatCurrency(totalCompleted),
            formattedTotalPending: formatCurrency(totalPending),
            formattedTotalAll: formatCurrency(totalAll),
        };

        res.status(200).json({
            success: true,
            data: { payments: visiblePayments, statistics },
        });
    } catch (error) {
        console.error('Error fetching bidder payments:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper (if not imported) – we can format on frontend
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
    }).format(amount);
};