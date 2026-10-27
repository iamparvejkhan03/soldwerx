import BidPayment from '../models/bidPayment.model.js';
import Payment from '../models/payment.model.js';
import Commission from '../models/commission.model.js';
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import Deposit from '../models/deposit.model.js';

const normalizeBidStatus = (status) => status; // already Stripe-style

const normalizeBankStatus = (status) => {
    switch (status) {
        case 'pending': return 'created';
        case 'processing': return 'processing';
        case 'completed': return 'succeeded';
        case 'failed': return 'processing_failed';
        case 'cancelled': return 'canceled';
        case 'refunded': return 'refunded';
        default: return status;
    }
};

// Map normalized status back to bank status (for server-side filter)
const reverseBankStatus = (status) => {
    switch (status) {
        case 'created': return 'pending';
        case 'processing': return 'processing';
        case 'succeeded': return 'completed';
        case 'processing_failed': return 'failed';
        case 'canceled': return 'cancelled';
        case 'refunded': return 'refunded';
        default: return status;
    }
};

const buildBidderName = (bidder) =>
    bidder?.firstName && bidder?.lastName
        ? `${bidder.firstName} ${bidder.lastName}`.trim()
        : bidder?.username || 'Unknown User';

const buildAuction = (auction, fallbackDate) => ({
    id: auction?._id ? auction._id.toString() : 'N/A',
    title: auction?.title || 'Auction Not Found',
    category: auction?.category || 'N/A',
    status: auction?.status || 'unknown',
    startPrice: auction?.startPrice || 0,
    currentPrice: auction?.currentPrice || 0,
    startDate: auction?.startDate || fallbackDate,
    endDate: auction?.endDate || 'N/A'
});

const buildBidder = (bidder) => ({
    id: bidder?._id ? bidder._id.toString() : 'N/A',
    name: buildBidderName(bidder),
    username: bidder?.username || 'N/A',
    email: bidder?.email || 'N/A',
    company: bidder?.company || 'N/A',
    stripeCustomerId: bidder?.stripeCustomerId || 'N/A'
});

// ---------- Admin: list all transactions ----------

export const getAdminTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 1200,
            status = 'all',
            search,
            type,
            dateRange,
            sortBy = 'recent'
        } = req.query;

        const bidFilter = {};
        const bankFilter = {};

        // Date range (safe to apply server-side — real field)
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate;
            switch (dateRange) {
                case 'today': startDate = new Date(now.setHours(0, 0, 0, 0)); break;
                case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
                case 'month': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
                case 'year': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
            }
            if (startDate) {
                bidFilter.createdAt = { $gte: startDate };
                bankFilter.createdAt = { $gte: startDate };
            }
        }

        // Fetch both in parallel (search/status/type are applied in JS after populate,
        // because they touch populated fields)
        const [bidPayments, bankPayments, depositPayments] = await Promise.all([
            BidPayment.find(bidFilter)
                .populate('auction', 'title category startPrice currentPrice buyerFeeAmount sellerFeeAmount taxAmount status winner startDate endDate')
                .populate('bidder', 'username firstName lastName email company stripeCustomerId')
                .sort({ createdAt: -1 })
                .lean(),
            Payment.find(bankFilter)
                .populate('auction', 'title category startPrice currentPrice buyerFeeAmount sellerFeeAmount taxAmount status winner startDate endDate')
                .populate('bidder', 'username firstName lastName email company stripeCustomerId')
                .sort({ createdAt: -1 })
                .lean(),
            Deposit.find(bankFilter)
                .populate('auction', 'title category startPrice currentPrice buyerFeeAmount sellerFeeAmount taxAmount status winner startDate endDate')
                .populate('bidder', 'username firstName lastName email company stripeCustomerId')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        // Normalize Stripe (BidPayment)
        const normalizedBid = bidPayments.map((t) => ({
            id: t._id.toString(),
            transactionId: `TX${t._id.toString().slice(-8).toUpperCase()}`,
            paymentIntentId: t.paymentIntentId || null,
            source: 'stripe',
            type: t.type || 'bid_authorization',
            status: normalizeBidStatus(t.status),
            amount: t.totalAmount || 0,
            commissionAmount: t.commissionAmount || 0,
            taxAmount: t?.taxAmount ?? t.auction?.taxAmount ?? 0,
            buyerFeeAmount: t.auction?.buyerFeeAmount,
            sellerFeeAmount: t.auction?.sellerFeeAmount,
            bidAmount: t.bidAmount || 0,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            auction: buildAuction(t.auction, t.createdAt),
            bidder: buildBidder(t.bidder),
            chargeAttempted: !!t.chargeAttempted,
            chargeSucceeded: !!t.chargeSucceeded
        }));

        // Normalize Bank Transfer AND Cash (both come from the Payment collection)
        const normalizedBank = bankPayments.map((p) => {
            // Trust what's actually stored — don't assume bank_transfer
            const method = p.paymentMethod || 'bank_transfer';
            const isCash = method === 'cash';

            return {
                id: p._id.toString(),
                transactionId:
                    p.transactionReference ||
                    `${isCash ? 'CSH' : 'BT'}${p._id.toString().slice(-8).toUpperCase()}`,
                paymentIntentId: null,
                source: isCash ? 'cash' : 'bank_transfer',
                type: isCash ? 'cash_payment' : (p.type || 'bank_transfer_payment'),
                status: normalizeBankStatus(p.status),
                amount: p.totalAmount || 0,
                commissionAmount: p.commissionAmount || 0,
                taxAmount: p?.taxAmount ?? p.auction?.taxAmount ?? 0,
                buyerFeeAmount: p.auction?.buyerFeeAmount,
                sellerFeeAmount: p.auction?.sellerFeeAmount,
                bidAmount: p.bidAmount || 0,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                auction: buildAuction(p.auction, p.createdAt),
                bidder: buildBidder(p.bidder),
                chargeAttempted: p.status === 'processing' || p.status === 'completed',
                chargeSucceeded: p.status === 'completed',
            };
        });

        const normalizedDeposits = depositPayments
        .filter((d) => d.status === 'succeeded')
        .map((d) => ({
            id: d._id.toString(),
            transactionId: `DEP${d._id.toString().slice(-8).toUpperCase()}`,
            paymentIntentId: d.paymentIntentId || null,
            source: 'deposit',
            type: 'bid_deposit',
            status: d.status,             // already: created | succeeded | processing_failed | canceled | refunded
            amount: d.amount || 0,
            commissionAmount: 0,
            taxAmount: 0,
            buyerFeeAmount: 0,
            sellerFeeAmount: 0,
            bidAmount: 0,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            auction: buildAuction(d.auction, d.createdAt),
            bidder: buildBidder(d.bidder),
            chargeAttempted: !!d.chargeAttempted,
            chargeSucceeded: !!d.chargeSucceeded,
        }));

        let merged = [...normalizedBid, ...normalizedBank, ...normalizedDeposits];

        // Hide pending transactions (Stripe 'created' + bank 'pending' both normalize to 'created')
        const VISIBLE_STATUSES = ['succeeded', 'requires_capture', 'canceled', 'processing_failed', 'refunded'];
        merged = merged.filter((t) => VISIBLE_STATUSES.includes(t.status));

        // ---- Filters in JS (on populated / normalized data) ----

        if (status && status !== 'all') {
            merged = merged.filter((t) => t.status === status);
        }

        if (type && type !== 'all') {
            merged = merged.filter((t) => t.type === type);
        }

        if (search) {
            const term = String(search).toLowerCase();
            merged = merged.filter((t) =>
                t.transactionId.toLowerCase().includes(term) ||
                (t.paymentIntentId || '').toLowerCase().includes(term) ||
                t.auction.title.toLowerCase().includes(term) ||
                t.bidder.name.toLowerCase().includes(term) ||
                t.bidder.username.toLowerCase().includes(term) ||
                t.bidder.email.toLowerCase().includes(term)
            );
        }

        // ---- Sort ----
        merged.sort((a, b) => {
            switch (sortBy) {
                case 'recent': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'amount_high': return b.amount - a.amount;
                case 'amount_low': return a.amount - b.amount;
                case 'bidder_name': return a.bidder.name.localeCompare(b.bidder.name);
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // ---- Stats (computed on the full filtered set, before pagination) ----
        const totalTransactions = merged.length;
        const succeeded = merged.filter((t) => t.status === 'succeeded');
        const totalRevenue = succeeded.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalCommission = succeeded.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);

        const totalTaxAgg = await Auction.aggregate([
            { $match: { status: 'sold' } },
            { $group: { _id: null, totalTax: { $sum: '$taxAmount' } } }
        ]);

        const statusBreakdown = merged.reduce((acc, t) => {
            if (!acc[t.status]) acc[t.status] = { count: 0, amount: 0 };
            acc[t.status].count += 1;
            acc[t.status].amount += t.amount || 0;
            return acc;
        }, {});

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentList = merged.filter((t) => new Date(t.createdAt) >= oneDayAgo);
        const recentRevenue = recentList
            .filter((t) => t.status === 'succeeded')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const statistics = {
            totalTransactions,
            totalRevenue,
            totalCommission,
            totalTax: totalTaxAgg[0]?.totalTax || 0,
            completedTransactions: succeeded.length,
            recentTransactions: recentList.length,
            recentRevenue,
            statusBreakdown
        };

        // ---- Paginate ----
        const limitNum = parseInt(limit, 10) || 1200;
        const pageNum = parseInt(page, 10) || 1;
        const startIdx = (pageNum - 1) * limitNum;
        const paginated = merged.slice(startIdx, startIdx + limitNum);

        const filterOptions = {
            statuses: [
                { value: 'all', label: 'All Status' },
                { value: 'succeeded', label: 'Completed' },
                { value: 'created', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'requires_capture', label: 'Awaiting Capture' },
                { value: 'canceled', label: 'Canceled' },
                { value: 'processing_failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' }
            ],
            types: [
                { value: 'all', label: 'All Types' },
                { value: 'bid_authorization', label: 'Bid Authorizations' },
                { value: 'final_commission', label: 'Final Commissions' },
                { value: 'winner_payment', label: 'Winner Payments' },
                { value: 'bank_transfer_payment', label: 'Bank Transfers' },
                { value: 'cash_payment', label: 'Cash Payments' },
                { value: 'bid_deposit', label: 'Winning Deposits' },
            ],
            dateRanges: [
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'year', label: 'Last Year' }
            ]
        };

        res.status(200).json({
            success: true,
            data: {
                transactions: paginated,
                statistics,
                filterOptions,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalTransactions / limitNum),
                    totalTransactions
                }
            }
        });
    } catch (error) {
        console.error('Admin transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching transactions'
        });
    }
};

// ---------- Admin: transaction stats (stat cards) ----------

export const getTransactionStats = async (req, res) => {
    try {
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Stripe totals
        const [bidOverall] = await BidPayment.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalTransactions: { $sum: 1 },
                    averageTransaction: { $avg: '$totalAmount' }
                }
            }
        ]);

        // Bank transfer totals
        const [bankOverall] = await Payment.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalTransactions: { $sum: 1 },
                    averageTransaction: { $avg: '$totalAmount' }
                }
            }
        ]);

        const [depositOverall] = await Deposit.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalTransactions: { $sum: 1 },
                    averageTransaction: { $avg: '$amount' },
                },
            },
        ]);

        const combinedRevenue =
            (bidOverall?.totalRevenue || 0) +
            (bankOverall?.totalRevenue || 0) +
            (depositOverall?.totalRevenue || 0);

        const combinedCount =
            (bidOverall?.totalTransactions || 0) +
            (bankOverall?.totalTransactions || 0) +
            (depositOverall?.totalTransactions || 0);

        const combinedAvg = combinedCount > 0 ? combinedRevenue / combinedCount : 0;

        // Recent activity (last 7 days) — merged
        const [bidRecent, bankRecent, depositRecent] = await Promise.all([
            BidPayment.aggregate([
                { $match: { createdAt: { $gte: lastWeek }, status: 'succeeded' } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        dailyRevenue: { $sum: '$totalAmount' },
                        transactionCount: { $sum: 1 }
                    }
                }
            ]),
            Payment.aggregate([
                { $match: { createdAt: { $gte: lastWeek }, status: 'completed' } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        dailyRevenue: { $sum: '$totalAmount' },
                        transactionCount: { $sum: 1 }
                    }
                }
            ]),
            Deposit.aggregate([
                { $match: { createdAt: { $gte: lastWeek }, status: 'succeeded' } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        dailyRevenue: { $sum: '$amount' },
                        transactionCount: { $sum: 1 },
                    },
                },
            ])
        ]);

        const recentMap = {};
        [...bidRecent, ...bankRecent, ...depositRecent].forEach((d) => {
            if (!recentMap[d._id]) recentMap[d._id] = { dailyRevenue: 0, transactionCount: 0 };
            recentMap[d._id].dailyRevenue += d.dailyRevenue;
            recentMap[d._id].transactionCount += d.transactionCount;
        });
        const recentActivity = Object.entries(recentMap)
            .map(([date, v]) => ({ _id: date, ...v }))
            .sort((a, b) => a._id.localeCompare(b._id));

        // Status distribution (raw, per collection)
        const [bidStatusDist, bankStatusDist, depositStatusDist] = await Promise.all([
            BidPayment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
            ]),
            Payment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
            ]),
            Deposit.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
            ])
        ]);

        const statusDistribution = [...bidStatusDist, ...bankStatusDist, ...depositStatusDist];

        // Top bidders (merged) — matches by bidder id
        const [bidTop, bankTop, depositTop] = await Promise.all([
            BidPayment.aggregate([
                { $match: { status: 'succeeded' } },
                {
                    $group: {
                        _id: '$bidder',
                        totalSpent: { $sum: '$totalAmount' },
                        transactionCount: { $sum: 1 }
                    }
                }
            ]),
            Payment.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: '$bidder',
                        totalSpent: { $sum: '$totalAmount' },
                        transactionCount: { $sum: 1 }
                    }
                }
            ]),
            Deposit.aggregate([
                { $match: { status: 'succeeded' } },
                {
                    $group: {
                        _id: '$bidder',
                        totalSpent: { $sum: '$amount' },
                        transactionCount: { $sum: 1 },
                    },
                },
            ])
        ]);

        const bidderMap = {};
        [...bidTop, ...bankTop, ...depositTop].forEach((b) => {
            const key = b._id.toString();
            if (!bidderMap[key]) bidderMap[key] = { totalSpent: 0, transactionCount: 0 };
            bidderMap[key].totalSpent += b.totalSpent;
            bidderMap[key].transactionCount += b.transactionCount;
        });

        const bidderIds = Object.keys(bidderMap);
        const users = await User.find({ _id: { $in: bidderIds } })
            .select('username email')
            .lean();

        const topBidders = bidderIds
            .map((id) => {
                const user = users.find((u) => u._id.toString() === id) || {};
                return {
                    _id: id,
                    totalSpent: bidderMap[id].totalSpent,
                    transactionCount: bidderMap[id].transactionCount,
                    bidderName: user.username || 'Unknown',
                    bidderEmail: user.email || 'N/A'
                };
            })
            .sort((a, b) => b.totalSpent - a.totalSpent);

        res.status(200).json({
            success: true,
            data: {
                overall: {
                    totalRevenue: combinedRevenue,
                    totalTransactions: combinedCount,
                    averageTransaction: combinedAvg
                },
                deposit: {
                    totalRevenue: depositOverall?.totalRevenue,
                    totalTransactions: depositOverall?.totalTransactions,
                    averageTransaction: depositOverall?.averageTransaction
                },
                recentActivity,
                statusDistribution,
                topBidders
            }
        });
    } catch (error) {
        console.error('Transaction stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching transaction statistics'
        });
    }
};