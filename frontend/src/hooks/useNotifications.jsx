import { useNotificationContext } from '../contexts/NotificationContext';

export const useNotifications = () => {
    const ctx = useNotificationContext();
    return {
        recent: ctx.recent,
        unreadCount: ctx.unreadCount,
        loading: ctx.loading,
        popups: ctx.popups,
        soundEnabled: ctx.soundEnabled,
        setSoundEnabled: ctx.setSoundEnabled,
        refresh: ctx.refresh,
        markAsRead: ctx.markAsRead,
        markAsUnread: ctx.markAsUnread,
        markAllAsRead: ctx.markAllAsRead,
        deleteNotification: ctx.deleteNotification,
        bulkDelete: ctx.bulkDelete,
        clearRead: ctx.clearRead,
        dismissPopup: ctx.dismissPopup,
    };
};