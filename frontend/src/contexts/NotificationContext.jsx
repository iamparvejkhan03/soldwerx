import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../utils/socket';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const SOUND_ENABLED_KEY = 'soldwerx:notif-sound';
const POPUP_LIMIT = 3;
const POPUP_DISMISS_MS = 6000;
const POPUP_DISMISS_URGENT_MS = 10000;

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();

    const [recent, setRecent] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [popups, setPopups] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const v = localStorage.getItem(SOUND_ENABLED_KEY);
        return v !== 'false';
    });

    const audioCtxRef = useRef(null);

    // ─── Sound ─────────────────────────────────────────────
    const playChime = useCallback((priority) => {
        if (!soundEnabled) return;
        if (priority !== 'urgent' && priority !== 'high') return;
        try {
            if (!audioCtxRef.current) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                audioCtxRef.current = new AC();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(ctx.destination);

            const freqs = priority === 'urgent' ? [880, 1320] : [660];
            freqs.forEach((f, i) => {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                g.gain.setValueAtTime(0.0001, now);
                g.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + i * 0.12);
                osc.connect(g).connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.65 + i * 0.12);
            });
        } catch (_) { /* silent */ }
    }, [soundEnabled]);

    // ─── Popups ────────────────────────────────────────────
    const dismissPopup = useCallback((id) => {
        setPopups((prev) => prev.filter((p) => p._id !== id));
    }, []);

    const pushPopup = useCallback((notification) => {
        setPopups((prev) => {
            const exists = prev.some((p) => p._id === notification._id);
            if (exists) return prev;
            return [notification, ...prev].slice(0, POPUP_LIMIT);
        });
        const delay = notification.priority === 'urgent'
            ? POPUP_DISMISS_URGENT_MS
            : POPUP_DISMISS_MS;
        setTimeout(() => dismissPopup(notification._id), delay);
    }, [dismissPopup]);

    // ─── Initial fetch ─────────────────────────────────────
    const fetchRecent = useCallback(async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/notifications/recent?limit=10');
            if (data.success) {
                setRecent(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (_) { /* silent */ }
        finally { setLoading(false); }
    }, [user?._id]);

    useEffect(() => {
        if (user?._id) fetchRecent();
        else { setRecent([]); setUnreadCount(0); setPopups([]); }
    }, [user?._id, fetchRecent]);

    // ─── Socket listeners ──────────────────────────────────
    useEffect(() => {
        if (!user?._id) return;

        const onNew = ({ notification, unreadCount: n }) => {
            setRecent((prev) => {
                const exists = prev.some((x) => x._id === notification._id);
                if (exists) return prev.map((x) => x._id === notification._id ? notification : x);
                return [notification, ...prev].slice(0, 10);
            });
            setUnreadCount(n);
            playChime(notification.priority);
            pushPopup(notification);
        };
        const onCount = ({ unreadCount: n }) => setUnreadCount(n);
        const onRead = ({ notificationId, unreadCount: n }) => {
            setRecent((p) => p.map((x) => x._id === notificationId ? { ...x, isRead: true } : x));
            setUnreadCount(n);
        };
        const onUnread = ({ notificationId, unreadCount: n }) => {
            setRecent((p) => p.map((x) => x._id === notificationId ? { ...x, isRead: false } : x));
            setUnreadCount(n);
        };
        const onAllRead = ({ unreadCount: n }) => {
            setRecent((p) => p.map((x) => ({ ...x, isRead: true })));
            setUnreadCount(n);
        };
        const onDeleted = ({ notificationId, unreadCount: n }) => {
            setRecent((p) => p.filter((x) => x._id !== notificationId));
            setUnreadCount(n);
        };
        const onBulkDeleted = ({ ids, unreadCount: n }) => {
            const s = new Set(ids);
            setRecent((p) => p.filter((x) => !s.has(x._id)));
            setUnreadCount(n);
        };
        const onClearRead = ({ unreadCount: n }) => {
            setRecent((p) => p.filter((x) => !x.isRead));
            setUnreadCount(n);
        };

        socket.on('notification:new', onNew);
        socket.on('notification:count', onCount);
        socket.on('notification:read', onRead);
        socket.on('notification:unread', onUnread);
        socket.on('notification:all-read', onAllRead);
        socket.on('notification:deleted', onDeleted);
        socket.on('notification:bulk-deleted', onBulkDeleted);
        socket.on('notification:clear-read', onClearRead);

        const onConnect = () => socket.emit('notification:request-count');
        socket.on('connect', onConnect);
        if (socket.connected) onConnect();

        return () => {
            socket.off('notification:new', onNew);
            socket.off('notification:count', onCount);
            socket.off('notification:read', onRead);
            socket.off('notification:unread', onUnread);
            socket.off('notification:all-read', onAllRead);
            socket.off('notification:deleted', onDeleted);
            socket.off('notification:bulk-deleted', onBulkDeleted);
            socket.off('notification:clear-read', onClearRead);
            socket.off('connect', onConnect);
        };
    }, [user?._id, playChime, pushPopup]);

    useEffect(() => {
        localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));
    }, [soundEnabled]);

    // ─── Actions ───────────────────────────────────────────
    const markAsRead = useCallback(async (id) => {
        try { await axiosInstance.patch(`/api/v1/notifications/${id}/read`); } catch (_) { }
    }, []);
    const markAsUnread = useCallback(async (id) => {
        try { await axiosInstance.patch(`/api/v1/notifications/${id}/unread`); } catch (_) { }
    }, []);
    const markAllAsRead = useCallback(async () => {
        try { await axiosInstance.patch('/api/v1/notifications/mark-all-read'); } catch (_) { }
    }, []);
    const deleteNotification = useCallback(async (id) => {
        try { await axiosInstance.delete(`/api/v1/notifications/${id}`); } catch (_) { }
    }, []);
    const bulkDelete = useCallback(async (ids) => {
        try { await axiosInstance.delete('/api/v1/notifications/bulk', { data: { ids } }); } catch (_) { }
    }, []);
    const clearRead = useCallback(async () => {
        try { await axiosInstance.delete('/api/v1/notifications/clear-read'); } catch (_) { }
    }, []);

    const value = {
        recent, unreadCount, loading, popups,
        soundEnabled, setSoundEnabled,
        refresh: fetchRecent,
        markAsRead, markAsUnread, markAllAsRead,
        deleteNotification, bulkDelete, clearRead,
        dismissPopup,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
    return ctx;
};