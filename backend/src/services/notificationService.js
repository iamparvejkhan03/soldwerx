import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { getIO } from '../utils/socket.js';
import {
    NOTIFICATION_TYPES,
    DEDUP_WINDOW_MS,
} from '../constants/notificationTypes.js';

// ─────────────────────────────────────────────────────────────
// Socket helpers
// ─────────────────────────────────────────────────────────────

const emitToUser = (userId, event, payload) => {
    const io = getIO();
    if (!io || !userId) return;
    io.to(`user:${userId.toString()}`).emit(event, payload);
};

/**
 * Push a "count-only" ping. Cheap way for a client to update its badge
 * without shipping the full notification payload (used on mark-read
 * from other tabs, bulk operations, etc.).
 */
const emitCountUpdate = async (userId) => {
    try {
        const unreadCount = await Notification.getUnreadCount(userId);
        emitToUser(userId, 'notification:count', {
            unreadCount,
            serverTime: Date.now(),
        });
    } catch (err) {
        console.error('emitCountUpdate error:', err);
    }
};

// ─────────────────────────────────────────────────────────────
// Preference check
// ─────────────────────────────────────────────────────────────

const isCategoryEnabled = (user, category) => {
    // If the user hasn't set preferences yet, everything is enabled by default.
    const pref = user?.notificationPreferences?.inApp?.[category];
    return pref !== false;
};

// ─────────────────────────────────────────────────────────────
// Core: notify a single user
// ─────────────────────────────────────────────────────────────

/**
 * @param {ObjectId|string} userId
 * @param {string} type  — key of NOTIFICATION_TYPES
 * @param {Object} payload
 *   title, message, actionUrl, actionLabel,
 *   relatedEntity ({ type, id }), metadata, dedupKey
 * @returns {Promise<Notification|null>}
 */
export const notifyUser = async (userId, type, payload = {}) => {
    try {
        const config = NOTIFICATION_TYPES[type];
        if (!config) {
            console.warn(`[notificationService] Unknown type: ${type}`);
            return null;
        }
        if (!userId) return null;

        // Respect in-app preferences
        const user = await User.findById(userId)
            .select('isActive notificationPreferences')
            .lean();
        if (!user || !user.isActive) return null;
        if (!isCategoryEnabled(user, config.category)) return null;

        let notification = null;

        // ── Dedup: same type + same dedupKey, unread, within window ──
        if (payload.dedupKey) {
            const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS);
            notification = await Notification.findOne({
                recipient: userId,
                type,
                dedupKey: payload.dedupKey,
                isRead: false,
                isDeleted: false,
                createdAt: { $gte: cutoff },
            });

            if (notification) {
                // Update in place — refresh title/message/metadata
                notification.title = payload.title ?? notification.title;
                notification.message = payload.message ?? notification.message;
                notification.actionUrl = payload.actionUrl ?? notification.actionUrl;
                notification.metadata = {
                    ...(notification.metadata || {}),
                    ...(payload.metadata || {}),
                };
                await notification.save();
            }
        }

        // ── Fresh insert ──
        if (!notification) {
            notification = await Notification.create({
                recipient: userId,
                type,
                category: config.category,
                priority: config.priority,
                title: payload.title || 'Notification',
                message: payload.message || '',
                actionUrl: payload.actionUrl || null,
                actionLabel: payload.actionLabel || 'View',
                relatedEntity: payload.relatedEntity || { type: null, id: null },
                metadata: payload.metadata || {},
                dedupKey: payload.dedupKey || null,
            });
        }

        // ── Emit to this user's personal room ──
        const unreadCount = await Notification.getUnreadCount(userId);
        emitToUser(userId, 'notification:new', {
            notification: notification.toObject(),
            unreadCount,
            serverTime: Date.now(),
        });

        return notification;
    } catch (err) {
        console.error('[notifyUser] error:', err);
        return null;
    }
};

// ─────────────────────────────────────────────────────────────
// Bulk: same notification to many users (one insertMany)
// ─────────────────────────────────────────────────────────────

/**
 * Creates one Notification doc per recipient in a single DB round-trip,
 * then emits a socket push for each.
 *
 * Note: dedupKey is intentionally NOT used here — bulk notifications
 * are one-off system announcements, not repeatable events.
 */
export const createBulkNotifications = async (recipientIds, type, payload = {}) => {
    try {
        const config = NOTIFICATION_TYPES[type];
        if (!config) {
            console.warn(`[notificationService] Unknown type: ${type}`);
            return [];
        }
        const ids = (recipientIds || []).filter(Boolean);
        if (ids.length === 0) return [];

        // Filter by in-app preference
        const users = await User.find({ _id: { $in: ids }, isActive: true })
            .select('_id notificationPreferences')
            .lean();

        const eligible = users.filter((u) => isCategoryEnabled(u, config.category));
        if (eligible.length === 0) return [];

        const docs = eligible.map((u) => ({
            recipient: u._id,
            type,
            category: config.category,
            priority: config.priority,
            title: payload.title || 'Notification',
            message: payload.message || '',
            actionUrl: payload.actionUrl || null,
            actionLabel: payload.actionLabel || 'View',
            relatedEntity: payload.relatedEntity || { type: null, id: null },
            metadata: payload.metadata || {},
        }));

        const created = await Notification.insertMany(docs);

        // Emit per recipient — each gets their own unread count
        await Promise.all(
            created.map(async (n) => {
                const unreadCount = await Notification.getUnreadCount(n.recipient);
                emitToUser(n.recipient, 'notification:new', {
                    notification: n.toObject(),
                    unreadCount,
                    serverTime: Date.now(),
                });
            })
        );

        return created;
    } catch (err) {
        console.error('[createBulkNotifications] error:', err);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────
// Audience helpers
// ─────────────────────────────────────────────────────────────

/** Notify every active admin */
export const notifyAdmins = async (type, payload = {}) => {
    try {
        const admins = await User.find({ userType: 'admin', isActive: true })
            .select('_id')
            .lean();
        return createBulkNotifications(admins.map((a) => a._id), type, payload);
    } catch (err) {
        console.error('[notifyAdmins] error:', err);
        return [];
    }
};

/**
 * Notify every admin + every staff member who has the required permission.
 * The permission is read from NOTIFICATION_TYPES[type].permission.
 */
export const notifyAdminsAndStaffWithPermission = async (type, payload = {}) => {
    try {
        const config = NOTIFICATION_TYPES[type];
        if (!config) {
            console.warn(`[notificationService] Unknown type: ${type}`);
            return [];
        }

        const filter = {
            isActive: true,
            $or: [{ userType: 'admin' }],
        };

        // If this notification is gated by a permission, include staff with it
        if (config.permission) {
            filter.$or.push({
                userType: 'staff',
                permissions: config.permission,
            });
        }

        const recipients = await User.find(filter).select('_id').lean();
        return createBulkNotifications(
            recipients.map((r) => r._id),
            type,
            payload
        );
    } catch (err) {
        console.error('[notifyAdminsAndStaffWithPermission] error:', err);
        return [];
    }
};

/**
 * Notify a set of auction participants (e.g. bidders who engaged with an auction).
 * Mostly useful for "auction ending soon" style notifications.
 *
 * `excludeUserId` avoids notifying the actor themselves.
 */
export const notifyAuctionParticipants = async (auction, type, payload = {}, { excludeUserId } = {}) => {
    try {
        if (!auction) return [];

        const ids = new Set();

        // Seller
        const sellerId = auction.seller?._id || auction.seller;
        if (sellerId) ids.add(sellerId.toString());

        // Bidders
        for (const bid of auction.bids || []) {
            const bidderId = bid.bidder?._id || bid.bidder;
            if (bidderId) ids.add(bidderId.toString());
        }

        // Offerers
        for (const offer of auction.offers || []) {
            const buyerId = offer.buyer?._id || offer.buyer;
            if (buyerId) ids.add(buyerId.toString());
        }

        if (excludeUserId) ids.delete(excludeUserId.toString());

        return createBulkNotifications([...ids], type, payload);
    } catch (err) {
        console.error('[notifyAuctionParticipants] error:', err);
        return [];
    }
};

export { emitCountUpdate };