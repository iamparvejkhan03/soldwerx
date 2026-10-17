import { Schema, model } from 'mongoose';
import {
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_PRIORITIES,
    READ_NOTIFICATION_TTL_DAYS,
} from '../constants/notificationTypes.js';

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // e.g. 'OUTBID', 'NEW_BID', 'ADMIN_FLAGGED_COMMENT'
        type: {
            type: String,
            required: true,
            index: true,
        },

        category: {
            type: String,
            enum: NOTIFICATION_CATEGORIES,
            required: true,
            index: true,
        },

        priority: {
            type: String,
            enum: NOTIFICATION_PRIORITIES,
            default: 'medium',
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            default: '',
            trim: true,
        },

        // Deep-link target — frontend navigates here on click
        actionUrl: {
            type: String,
            default: null,
        },
        actionLabel: {
            type: String,
            default: 'View',
        },

        // What this is about — useful for future grouping / lookups
        relatedEntity: {
            type: {
                type: String,
                default: null, // 'Auction' | 'Offer' | 'Payment' | 'Payout' | 'Comment' | 'User' ...
            },
            id: {
                type: Schema.Types.ObjectId,
                default: null,
            },
        },

        // Free-form context (bid amount, offer amount, seller name, etc.)
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
            default: null,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },

        // Used to collapse repetitive events (e.g. bid outbid cascade) into one
        dedupKey: {
            type: String,
            default: null,
            index: true,
        },
    },
    { timestamps: true }
);

// Primary query patterns
notificationSchema.index({ recipient: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, isDeleted: 1 });
notificationSchema.index({ recipient: 1, dedupKey: 1, isRead: 1, isDeleted: 1 });

// Auto-delete READ notifications after N days. Unread persist indefinitely.
notificationSchema.index(
    { readAt: 1 },
    {
        expireAfterSeconds: READ_NOTIFICATION_TTL_DAYS * 24 * 60 * 60,
        partialFilterExpression: { isRead: true, isDeleted: false },
    }
);

// ─── Statics ────────────────────────────────────────────────────

notificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({
        recipient: userId,
        isRead: false,
        isDeleted: false,
    });
};

const Notification = model('Notification', notificationSchema);
export default Notification;