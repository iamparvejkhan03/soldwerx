import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationIcon } from './NotificationIcon';

const NotificationPopup = () => {
    const { popups, dismissPopup, markAsRead } = useNotifications();
    const navigate = useNavigate();

    if (!popups.length) return null;

    const handleOpen = (n) => {
        if (!n.isRead) markAsRead(n._id);
        if (n.actionUrl) navigate(n.actionUrl);
        dismissPopup(n._id);
    };

    const borderClass = (priority) => ({
        urgent: 'border-l-red-500',
        high: 'border-l-amber-500',
        medium: 'border-l-blue-500',
        low: 'border-l-gray-300',
    }[priority] || 'border-l-gray-300');

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {popups.map((n) => (
                <div
                    key={n._id}
                    className={`pointer-events-auto bg-white shadow-2xl rounded-xl border-l-4 w-[340px] max-w-[calc(100vw-2rem)] p-3 flex gap-3 animate-in slide-in-from-right duration-200 ${borderClass(n.priority)}`}
                >
                    <NotificationIcon notification={n} />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {n.title}
                        </p>
                        {n.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {n.message}
                            </p>
                        )}
                        <button
                            onClick={() => handleOpen(n)}
                            className="mt-2 text-xs font-medium text-[#C59D55] hover:text-[#F5B51B] inline-flex items-center gap-1"
                        >
                            {n.actionLabel || 'View'} <ArrowRight size={12} />
                        </button>
                    </div>
                    <button
                        onClick={() => dismissPopup(n._id)}
                        className="text-gray-400 hover:text-gray-600 self-start"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationPopup;