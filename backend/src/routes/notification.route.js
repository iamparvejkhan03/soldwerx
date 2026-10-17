import { Router } from 'express';
import {
    getNotifications,
    getUnreadCount,
    getRecentNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    bulkDelete,
    clearRead,
    getPreferences,
    updatePreferences,
} from '../controllers/notification.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const notificationRouter = Router();

// All routes require authentication
notificationRouter.use(auth);

// Preferences
notificationRouter.get('/preferences', getPreferences);
notificationRouter.put('/preferences', updatePreferences);

// List / counts
notificationRouter.get('/', getNotifications);
notificationRouter.get('/recent', getRecentNotifications);
notificationRouter.get('/unread-count', getUnreadCount);

// Bulk actions (must come BEFORE /:id routes)
notificationRouter.patch('/mark-all-read', markAllAsRead);
notificationRouter.delete('/bulk', bulkDelete);
notificationRouter.delete('/clear-read', clearRead);

// Single-item actions
notificationRouter.patch('/:id/read', markAsRead);
notificationRouter.patch('/:id/unread', markAsUnread);
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;