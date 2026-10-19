import Auction from "../models/auction.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { paymentInitiatedAdminEmail } from "../utils/nodemailer.js";
import BidPayment from '../models/bidPayment.model.js';
import Deposit from "../models/deposit.model.js";
import { notifyAdminsAndStaffWithPermission } from '../services/notificationService.js';

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

        // Calculate total amount, crediting any 5% deposit already charged
        const depositCredit =
            auction.depositStatus === "charged" && auction.depositAmount > 0
                ? auction.depositAmount
                : 0;

        // Calculate total
        const bidAmount = auction.finalPrice || auction.currentPrice;
        const commissionAmount = auction.buyerFeeAmount || 0;
        const taxAmount = auction.taxAmount || 0;
        // const totalAmount = bidAmount + commissionAmount + taxAmount;

        const totalAmount = Math.max(
            (bidAmount || 0) +
            (commissionAmount || 0) +
            (taxAmount || 0) -
            depositCredit,
            0
        );

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
                taxAmount: taxAmount,
                totalAmount: totalAmount,
                status: 'processing',
                type: 'bank_transfer_payment',
                paymentMethod: 'bank_transfer',
            });
        } else {
            // Update existing payment
            payment.bidAmount = bidAmount;
            payment.commissionAmount = commissionAmount;
            payment.taxAmount = taxAmount,
                payment.totalAmount = totalAmount;
            payment.status = 'processing'; // Reset to processing if it was cancelled or failed
            payment.type = 'bank_transfer_payment';
            payment.paymentMethod = 'bank_transfer';
            // Optionally update other fields if needed (e.g., notes)
            await payment.save();
        }

        // ✅ Fetch admin's bank details from database
        const adminUsers = await User.find({ userType: "admin" }).select(
            "payoutMethods firstName lastName email phone userType emailPreferences",
        );

        if (adminUsers.length === 0) {
            console.log('⚠️ No admin users found with userType: "admin"');
        } else {
            for (const admin of adminUsers) {
                paymentInitiatedAdminEmail(
                    admin,
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

        // ─── In-app admin notification ───────────────────────────
        notifyAdminsAndStaffWithPermission('ADMIN_BANK_TRANSFER_INITIATED', {
            title: `Bank transfer initiated — "${auction.title}"`,
            message: `$${totalAmount.toLocaleString()} from ${buyer?.username || 'buyer'}`,
            actionUrl: `/admin/transactions`,
            relatedEntity: { type: 'Auction', id: auction._id },
            metadata: { amount: totalAmount, buyerId: userId, auctionTitle: auction.title },
        }).catch((err) => console.error('notify ADMIN_BANK_TRANSFER_INITIATED:', err));

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
            "paymentStatus paymentMethod paymentDate transactionId finalPrice buyerFeeAmount sellerFeeAmount taxAmount depositAmount depositStatus",
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
                    depositAmount: auction.depositAmount || 0,
                    depositStatus: auction.depositStatus || "none",
                    totalAmount:
                        (auction.finalPrice || 0) +
                        (auction.buyerFeeAmount || 0) +
                        (auction.taxAmount || 0) -
                        (auction.depositStatus === "charged" ? auction.depositAmount || 0 : 0),
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

        const [bankPayments, cardPayments, deposits] = await Promise.all([
            Payment.find({ bidder: userId })
                .populate('auction', 'title finalPrice currentPrice endDate status')
                .sort({ createdAt: -1 })
                .lean(),
            BidPayment.find({
                bidder: userId,
                type: { $in: ['winner_payment', 'final_commission'] }
            })
                .populate('auction', 'title finalPrice currentPrice endDate status')
                .sort({ createdAt: -1 })
                .lean(),
            Deposit.find({ bidder: userId })
                .populate('auction', 'title finalPrice currentPrice endDate status')
                .sort({ createdAt: -1 })
                .lean(),
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

        const normalizedDeposits = deposits.map((d) => ({
            _id: d._id,
            auction: d.auction,
            bidder: d.bidder,
            bidAmount: 0,
            commissionAmount: 0,
            taxAmount: 0,
            totalAmount: d.amount || 0,
            status: normalizeBidPaymentStatus(d.status),
            type: 'bid_deposit',
            source: 'deposit',
            paymentMethod: 'credit_card',
            transactionReference: d.paymentIntentId,
            paymentIntentId: d.paymentIntentId,
            completedAt: d.status === 'succeeded' ? d.updatedAt : null,
            notes:
                d.status === 'succeeded'
                    ? '5% winning deposit credited toward final payment'
                    : d.failureReason || 'Deposit charge failed',
            proofOfPayment: [],
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));

        const payments = [
            ...normalizedBank,
            ...normalizedCard,
            ...normalizedDeposits,
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Hide pending transactions from the bidder view
        const VISIBLE_STATUSES = ['completed', 'processing', 'failed', 'cancelled'];
        const visiblePayments = payments.filter((p) =>
            VISIBLE_STATUSES.includes(p.status)
        );

        const completed = visiblePayments.filter((p) => p.status === 'completed');
        const pending = [];
        const failed = visiblePayments.filter(
            (p) => p.status === 'failed' || p.status === 'cancelled'
        );

        const totalCompleted = completed.reduce((s, p) => s + p.totalAmount, 0);
        const totalPending = 0;
        const totalAll = visiblePayments.reduce((s, p) => s + p.totalAmount, 0);

        const statistics = {
            totalPaid: totalCompleted,
            totalPending,
            totalAll,
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

export const createCashPayment = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const userId = req.user.id;

        const auction = await Auction.findById(auctionId);
        const buyer = await User.findById(userId).select(
            "firstName lastName username email phone"
        );

        if (!auction) {
            return res.status(404).json({ success: false, message: "Auction not found" });
        }

        if (auction.winner?._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (auction.paymentStatus === "completed") {
            return res.status(400).json({ success: false, message: "Payment already completed" });
        }

        // Calculate total amount, crediting any 5% deposit already charged
        const depositCredit =
            auction.depositStatus === "charged" && auction.depositAmount > 0
                ? auction.depositAmount
                : 0;

        // Totals
        const bidAmount = auction.finalPrice || auction.currentPrice;
        const commissionAmount = auction.buyerFeeAmount || 0;
        const taxAmount = auction.taxAmount || 0;
        // const totalAmount = bidAmount + commissionAmount + taxAmount;

        const totalAmount = Math.max(
            (bidAmount || 0) +
            (commissionAmount || 0) +
            (taxAmount || 0) -
            depositCredit,
            0
        );

        // Mark auction as awaiting cash confirmation
        auction.paymentStatus = "processing";
        auction.paymentMethod = "cash";
        await auction.save();

        // Upsert Payment record (avoid duplicate rows if bidder re-clicks)
        let payment = await Payment.findOne({ auction: auctionId });

        if (!payment) {
            payment = await Payment.create({
                auction: auctionId,
                bidder: userId,
                bidAmount,
                commissionAmount,
                taxAmount,
                totalAmount,
                status: "processing",
                type: "cash_payment",
                paymentMethod: "cash",
            });
        } else {
            payment.bidAmount = bidAmount;
            payment.commissionAmount = commissionAmount;
            payment.taxAmount = taxAmount;
            payment.totalAmount = totalAmount;
            payment.status = "processing";
            payment.type = "cash_payment";
            payment.paymentMethod = "cash";
            await payment.save();
        }

        // Notify admins
        const adminUsers = await User.find({ userType: "admin" }).select(
            "payoutMethods firstName lastName email phone userType emailPreferences"
        );
        for (const admin of adminUsers) {
            paymentInitiatedAdminEmail(admin, payment, buyer, auction).catch(
                (err) => console.error(`Admin email failed:`, err)
            );
        }

        // ─── In-app admin notification ───────────────────────────
        notifyAdminsAndStaffWithPermission('ADMIN_CASH_PAYMENT_INITIATED', {
            title: `Cash payment selected — "${auction.title}"`,
            message: `$${totalAmount.toLocaleString()} from ${buyer?.username || 'buyer'}`,
            actionUrl: `/admin/transactions`,
            relatedEntity: { type: 'Auction', id: auction._id },
            metadata: { amount: totalAmount, buyerId: userId, auctionTitle: auction.title },
        }).catch((err) => console.error('notify ADMIN_CASH_PAYMENT_INITIATED:', err));

        return res.status(200).json({
            success: true,
            message: "Cash payment selected. Please arrange cash payment with the admin.",
            data: {
                auction: {
                    id: auction._id,
                    totalAmount,
                    title: auction.title,
                },
                payment,
            },
        });
    } catch (error) {
        console.error("Cash payment error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to process cash payment",
        });
    }
};