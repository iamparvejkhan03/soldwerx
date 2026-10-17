// Single source of truth for notification types.
// Frontend can mirror this exact structure for icon mapping.

export const NOTIFICATION_CATEGORIES = [
    'auction',
    'offer',
    'payment',
    'payout',
    'communication',
    'account',
    'moderation', // admin/staff moderation queue
    'system',
];

export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

/**
 * Each entry:
 *   category   — grouping chip on the notifications page
 *   priority   — controls styling + sound + auto-dismiss duration
 *   permission — if set, only staff with this permission (and admins) get notified
 *   audience   — 'user' | 'admin' | 'staff_with_permission'  (documentation only)
 */
export const NOTIFICATION_TYPES = {
    // ─── Bidder ──────────────────────────────────────────────
    BID_CONFIRMED: { category: 'auction', priority: 'low', permission: null, audience: 'user' },
    OUTBID: { category: 'auction', priority: 'urgent', permission: null, audience: 'user' },
    PROXY_BID_OUTBID: { category: 'auction', priority: 'high', permission: null, audience: 'user' },
    PROXY_BID_PLACED: { category: 'auction', priority: 'low', permission: null, audience: 'user' },
    AUCTION_WON: { category: 'auction', priority: 'urgent', permission: null, audience: 'user' },
    AUCTION_ENDING_SOON: { category: 'auction', priority: 'high', permission: null, audience: 'user' },
    GIVEAWAY_WON: { category: 'auction', priority: 'high', permission: null, audience: 'user' },

    // ─── Offers (buyer side) ─────────────────────────────────
    OFFER_CONFIRMATION: { category: 'offer', priority: 'low', permission: null, audience: 'user' },
    OFFER_ACCEPTED: { category: 'offer', priority: 'urgent', permission: null, audience: 'user' },
    OFFER_REJECTED: { category: 'offer', priority: 'medium', permission: null, audience: 'user' },
    OFFER_CANCELED: { category: 'offer', priority: 'medium', permission: null, audience: 'user' },

    // ─── Offers (seller side) ────────────────────────────────
    NEW_OFFER: { category: 'offer', priority: 'high', permission: null, audience: 'user' },
    OFFER_COUNTERED: { category: 'offer', priority: 'urgent', permission: null, audience: 'user' },

    // ─── Seller: auction events ──────────────────────────────
    NEW_BID: { category: 'auction', priority: 'high', permission: null, audience: 'user' },
    AUCTION_APPROVED: { category: 'auction', priority: 'high', permission: null, audience: 'user' },
    AUCTION_LISTED: { category: 'auction', priority: 'medium', permission: null, audience: 'user' },
    AUCTION_ENDED_SOLD: { category: 'auction', priority: 'high', permission: null, audience: 'user' },
    AUCTION_ENDED_NO_SALE: { category: 'auction', priority: 'medium', permission: null, audience: 'user' },

    // ─── Payments (buyer) ────────────────────────────────────
    PAYMENT_CONFIRMED: { category: 'payment', priority: 'high', permission: null, audience: 'user' },
    DEPOSIT_CHARGED: { category: 'payment', priority: 'high', permission: null, audience: 'user' },
    DEPOSIT_FAILED: { category: 'payment', priority: 'urgent', permission: null, audience: 'user' },
    BUYER_PAID: { category: 'payment', priority: 'urgent', permission: null, audience: 'user' }, // seller side

    // ─── Payouts (seller) ────────────────────────────────────
    PAYOUT_INITIATED: { category: 'payout', priority: 'medium', permission: null, audience: 'user' },
    PAYOUT_COMPLETED: { category: 'payout', priority: 'high', permission: null, audience: 'user' },
    PAYOUT_FAILED: { category: 'payout', priority: 'urgent', permission: null, audience: 'user' },

    // ─── Communication ───────────────────────────────────────
    NEW_MESSAGE: { category: 'communication', priority: 'high', permission: null, audience: 'user' },
    SHIPPING_UPDATED: { category: 'communication', priority: 'medium', permission: null, audience: 'user' },
    NEW_COMMENT: { category: 'communication', priority: 'medium', permission: null, audience: 'user' },

    // ─── Account ─────────────────────────────────────────────
    ACCOUNT_APPROVED: { category: 'account', priority: 'high', permission: null, audience: 'user' },
    IDENTITY_REJECTED: { category: 'account', priority: 'urgent', permission: null, audience: 'user' },

    // ─── Admin / Staff moderation queue ──────────────────────
    ADMIN_NEW_USER_REGISTERED: { category: 'moderation', priority: 'medium', permission: 'manage_users', audience: 'admin' },
    ADMIN_AUCTION_PENDING_APPROVAL: { category: 'moderation', priority: 'high', permission: 'manage_auctions', audience: 'admin' },
    ADMIN_AUCTION_WON: { category: 'moderation', priority: 'high', permission: 'manage_transactions', audience: 'admin' },
    ADMIN_AUCTION_ENDED_NO_SALE: { category: 'moderation', priority: 'medium', permission: 'manage_auctions', audience: 'admin' },
    ADMIN_CARD_PAYMENT_COMPLETED: { category: 'moderation', priority: 'high', permission: 'manage_transactions', audience: 'admin' },
    ADMIN_BANK_TRANSFER_INITIATED: { category: 'moderation', priority: 'medium', permission: 'manage_transactions', audience: 'admin' },
    ADMIN_CASH_PAYMENT_INITIATED: { category: 'moderation', priority: 'medium', permission: 'manage_transactions', audience: 'admin' },
    ADMIN_DEPOSIT_CHARGED: { category: 'moderation', priority: 'medium', permission: 'manage_transactions', audience: 'admin' },
    ADMIN_DEPOSIT_FAILED: { category: 'moderation', priority: 'high', permission: 'manage_transactions', audience: 'admin' },
    ADMIN_FLAGGED_COMMENT: { category: 'moderation', priority: 'urgent', permission: 'manage_comments', audience: 'admin' },
    ADMIN_NEW_CONTACT_QUERY: { category: 'moderation', priority: 'medium', permission: 'manage_inquiries', audience: 'admin' },
    ADMIN_NEW_LIQUIDATION_REQUEST: { category: 'moderation', priority: 'medium', permission: 'manage_liquidations', audience: 'admin' },
    ADMIN_NEW_SELL_REQUEST: { category: 'moderation', priority: 'medium', permission: 'manage_sell_requests', audience: 'admin' },
    ADMIN_OFFER_RESPONDED: { category: 'moderation', priority: 'medium', permission: 'manage_offers', audience: 'admin' },
    ADMIN_NEW_MESSAGE: { category: 'moderation', priority: 'medium', permission: 'manage_communications', audience: 'admin' },
};

// Read TTL — how long after being read a notification lives before auto-deletion
export const READ_NOTIFICATION_TTL_DAYS = 90;

// Dedup — same type + same dedupKey within this window updates the existing unread
export const DEDUP_WINDOW_MS = 30 * 1000;