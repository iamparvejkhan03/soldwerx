import { useState, useRef, useEffect } from 'react';
import { Bell, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import NotificationItem from './NotificationItem';

const NotificationBell = ({ variant = 'light' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { user } = useAuth();
    const {
        recent, unreadCount, loading, refresh,
        markAsRead, markAsUnread, markAllAsRead, deleteNotification,
    } = useNotifications();

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    // Refresh when opened
    useEffect(() => {
        if (open) refresh();
    }, [open, refresh]);

    const buttonStyles = variant === 'dark'
        ? 'text-white hover:bg-white/10'
        : 'text-gray-600 hover:bg-gray-100';

    const badge = unreadCount > 99 ? '99+' : unreadCount;
    const notifPath = user?.userType
        ? `/${user.userType}/notifications`
        : '/notifications';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className={`relative p-2 rounded-full transition-colors ${buttonStyles}`}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-[#F5B51B] text-black border-2 border-white">
                        {badge}
                    </span>
                )}
            </button>

            {open && (
                <div className="
                    fixed md:absolute
                    inset-x-3 md:inset-x-auto
                    top-16 md:top-auto
                    md:right-0 md:mt-2
                    md:w-[360px]
                    max-w-[calc(100vw-1.5rem)]
                    bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden
                    max-h-[calc(100dvh-5rem)] md:max-h-[420px]
                    flex flex-col
                ">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-[#C59D55] hover:text-[#F5B51B] font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {loading && recent.length === 0 ? (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <Loader size={20} className="animate-spin" />
                            </div>
                        ) : recent.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No notifications yet</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    You're all caught up.
                                </p>
                            </div>
                        ) : (
                            <div className="p-1">
                                {recent.map((n) => (
                                    <NotificationItem
                                        key={n._id}
                                        notification={n}
                                        compact
                                        onMarkRead={markAsRead}
                                        onMarkUnread={markAsUnread}
                                        onDelete={deleteNotification}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 p-2">
                        <Link
                            to={notifPath}
                            onClick={() => setOpen(false)}
                            className="block text-center py-2 text-sm font-medium text-[#C59D55] hover:bg-[#F5B51B]/10 rounded-lg transition-colors"
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;