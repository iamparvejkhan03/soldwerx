import Notification from '../models/notification.model.js';
import { emitCountUpdate } from '../services/notificationService.js';
import { getIO } from '../utils/socket.js';

const PAGE_LIMIT_DEFAULT = 20;
const PAGE_LIMIT_MAX = 100;

// ─────────────────────────────────────────────────────────────
// GET /api/v1/notifications
// ─────────────────────────────────────────────────────────────
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            limit = PAGE_LIMIT_DEFAULT,
            filter = 'all',       // 'all' | 'unread' | 'read'
            category,             // 'auction' | 'offer' | ...
            priority,             // 'urgent' | 'high' | ...
            type,                 // specific type key
            search,
        } = req.query;

        const query = {
            recipient: userId,
            isDeleted: false,
        };

        if (filter === 'unread') query.isRead = false;
        if (filter === 'read') query.isRead = true;
        if (category && category !== 'all') query.category = category;
        if (priority && priority !== 'all') query.priority = priority;
        if (type && type !== 'all') query.type = type;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        const pageNum = Math.max(1, parseInt(page));
        const perPage = Math.min(PAGE_LIMIT_MAX, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * perPage;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .lean(),
            Notification.countDocuments(query),
            Notification.getUnreadCount(userId),
        ]);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / perPage),
                    totalNotifications: total,
                    perPage,
                    hasNextPage: skip + notifications.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/notifications/unread-count
// ─────────────────────────────────────────────────────────────
export const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.getUnreadCount(req.user._id);
        res.status(200).json({ success: true, data: { unreadCount } });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/notifications/recent  (for bell dropdown — top N)
// ─────────────────────────────────────────────────────────────
export const getRecentNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 8));

        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ recipient: userId, isDeleted: false })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            Notification.getUnreadCount(userId),
        ]);

        res.status(200).json({
            success: true,
            data: { notifications, unreadCount },
        });
    } catch (error) {
        console.error('getRecentNotifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recent notifications' });
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/notifications/:id/read
// ─────────────────────────────────────────────────────────────
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: id,
            recipient: userId,
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
        }

        // Broadcast count update to all tabs of this user
        const unreadCount = await Notification.getUnreadCount(userId);
        const io = getIO();
        if (io) {
            io.to(`user:${userId.toString()}`).emit('notification:read', {
                notificationId: id,
                unreadCount,
                serverTime: Date.now(),
            });
        }

        res.status(200).json({
            success: true,
            data: { notification, unreadCount },
        });
    } catch (error) {
        console.error('markAsRead error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/notifications/:id/unread
// ─────────────────────────────────────────────────────────────
export const markAsUnread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: id,
            recipient: userId,
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.isRead) {
            notification.isRead = false;
            notification.readAt = null;
            await notification.save();
        }

        const unreadCount = await Notification.getUnreadCount(userId);
        const io = getIO();
        if (io) {
            io.to(`user:${userId.toString()}`).emit('notification:unread', {
                notificationId: id,
                unreadCount,
                serverTime: Date.now(),
            });
        }

        res.status(200).json({
            success: true,
            data: { notification, unreadCount },
        });
    } catch (error) {
        console.error('markAsUnread error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as unread' });
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/notifications/mark-all-read
// ─────────────────────────────────────────────────────────────
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const result = await Notification.updateMany(
            { recipient: userId, isRead: false, isDeleted: false },
            { $set: { isRead: true, readAt: now } }
        );

        const io = getIO();
        if (io) {
            io.to(`user:${userId.toString()}`).emit('notification:all-read', {
                unreadCount: 0,
                modifiedCount: result.modifiedCount,
                serverTime: Date.now(),
            });
        }

        res.status(200).json({
            success: true,
            data: { modifiedCount: result.modifiedCount, unreadCount: 0 },
        });
    } catch (error) {
        console.error('markAllAsRead error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/notifications/:id  (soft delete)
// ─────────────────────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: id,
            recipient: userId,
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.isDeleted = true;
        notification.deletedAt = new Date();
        await notification.save();

        const unreadCount = await Notification.getUnreadCount(userId);
        const io = getIO();
        if (io) {
            io.to(`user:${userId.toString()}`).emit('notification:deleted', {
                notificationId: id,
                unreadCount,
                serverTime: Date.now(),
            });
        }

        res.status(200).json({
            success: true,
            data: { notificationId: id, unreadCount },
        });
    } catch (error) {
        console.error('deleteNotification error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/notifications/bulk
// body: { ids: [] }
// ─────────────────────────────────────────────────────────────
export const bulkDelete = async (req, res) => {
    try {
        const userId = req.user._id;
        const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(Boolean) : [];

        if (ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No IDs provided' });
        }

        const now = new Date();
        const result = await Notification.updateMany(
            { _id: { $in: ids }, recipient: userId, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: now } }
        );

        const unreadCount = await Notification.getUnreadCount(userId);
        const io = getIO();
        if (io) {
            io.to(`user:${userId.toString()}`).emit('notification:bulk-deleted', {
                ids,
                unreadCount,
                serverTime: Date.now(),
            });
        }

        res.status(200).json({
            success: true,
            data: { deletedCount: result.modifiedCount, unreadCount },
        });
    } catch (error) {
        console.error('bulkDelete error:', error);
        res.status(500).json({ success: false, message: 'Failed to bulk delete' });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/notifications/clear-read
// ─────────────────────────────────────────────────────────────
export const clearRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const result = await Notification.updateMany(
            { recipient: userId, isRead: true, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: now } }
        );

        const unreadCount = await Notification.getUnreadCount(userId);
        const io = getIO();
        if (io) {
            io.to(`user:${userId.toString()}`).emit('notification:clear-read', {
                unreadCount,
                serverTime: Date.now(),
            });
        }

        res.status(200).json({
            success: true,
            data: { deletedCount: result.modifiedCount, unreadCount },
        });
    } catch (error) {
        console.error('clearRead error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear read notifications' });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/v1/notifications/preferences
// PUT /api/v1/notifications/preferences
// ─────────────────────────────────────────────────────────────
export const getPreferences = async (req, res) => {
    try {
        const user = req.user;
        const defaults = {
            inApp: {
                auction: true,
                offer: true,
                payment: true,
                payout: true,
                communication: true,
                account: true,
                moderation: true,
                system: true,
            },
            sound: true,
        };
        const prefs = user.notificationPreferences || {};
        res.status(200).json({
            success: true,
            data: {
                inApp: { ...defaults.inApp, ...(prefs.inApp || {}) },
                sound: prefs.sound !== false,
            },
        });
    } catch (error) {
        console.error('getPreferences error:', error);
        res.status(500).json({ success: false, message: 'Failed to get preferences' });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        const { inApp, sound } = req.body;

        const updates = {};
        if (inApp && typeof inApp === 'object') {
            for (const [k, v] of Object.entries(inApp)) {
                if (typeof v === 'boolean') updates[`notificationPreferences.inApp.${k}`] = v;
            }
        }
        if (typeof sound === 'boolean') {
            updates['notificationPreferences.sound'] = sound;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }

        await User.updateOne({ _id: userId }, { $set: updates });
        res.status(200).json({ success: true, message: 'Preferences updated' });
    } catch (error) {
        console.error('updatePreferences error:', error);
        res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }
};

// Importing here to avoid circular deps at top
import User from '../models/user.model.js';