import Auction from "../models/auction.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { paymentInitiatedAdminEmail } from "../utils/nodemailer.js";

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
        const commissionAmount = auction.commissionAmount || 0;
        const totalAmount = bidAmount + commissionAmount;

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
            "paymentStatus paymentMethod paymentDate transactionId finalPrice commissionAmount",
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
                    commissionAmount: auction.commissionAmount,
                    totalAmount:
                        (auction.finalPrice || 0) + (auction.commissionAmount || 0),
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
export const getBidderPayments = async (req, res) => {
    try {
        const userId = req.user._id;

        // Only bidders can access
        // if (req.user.userType !== 'bidder') {
        //     return res.status(403).json({ success: false, message: "Only bidders can view their payments" });
        // }

        // Fetch all payments for this bidder, populate auction details
        const payments = await Payment.find({ bidder: userId })
            .populate('auction', 'title finalPrice currentPrice endDate status')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPending = payments.filter(p => p.status === 'processing' || p.status === 'pending').reduce((sum, p) => sum + p.totalAmount, 0);
        const totalAll = payments.reduce((sum, p) => sum + p.totalAmount, 0);
        const countCompleted = payments.filter(p => p.status === 'completed').length;
        const countPending = payments.filter(p => p.status === 'processing' || p.status === 'pending').length;
        const countFailed = payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length;

        // Format amounts for display (using helper or directly in frontend)
        const statistics = {
            totalPaid: totalCompleted,
            totalPending: totalPending,
            totalAll: totalAll,
            countCompleted,
            countPending,
            countFailed,
            formattedTotalPaid: formatCurrency(totalCompleted), // use a helper in frontend instead
            formattedTotalPending: formatCurrency(totalPending),
            formattedTotalAll: formatCurrency(totalAll),
        };

        res.status(200).json({
            success: true,
            data: {
                payments,
                statistics,
            },
        });
    } catch (error) {
        console.error("Error fetching bidder payments:", error);
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