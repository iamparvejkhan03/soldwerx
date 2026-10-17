import { Check, Trash2, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { NotificationIcon, priorityBadgeClass } from './NotificationIcon';

const NotificationItem = ({
    notification,
    onMarkRead,
    onMarkUnread,
    onDelete,
    selectable = false,
    selected = false,
    onToggleSelect,
    compact = false,
}) => {
    const navigate = useNavigate();
    const isUnread = !notification.isRead;

    const handleClick = (e) => {
        // Don't navigate if user clicked checkbox or action buttons
        if (e.target.closest('[data-no-nav]')) return;
        if (isUnread) onMarkRead?.(notification._id);
        if (notification.actionUrl) navigate(notification.actionUrl);
    };

    const stop = (e, fn) => {
        e.stopPropagation();
        e.preventDefault();
        fn?.(notification._id);
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative flex gap-3 p-3 rounded-lg transition-colors cursor-pointer ${isUnread
                    ? 'bg-[#F5B51B]/[0.06] hover:bg-[#F5B51B]/10'
                    : 'hover:bg-gray-50'
                } ${selected ? 'ring-2 ring-[#F5B51B] ring-inset bg-[#F5B51B]/10' : ''}`}
        >
            {isUnread && !selectable && (
                <span className="absolute top-4 left-1 w-1.5 h-1.5 rounded-full bg-[#F5B51B]" />
            )}

            {selectable && (
                <div className="flex items-center pt-1" data-no-nav>
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect?.(notification._id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F5B51B] focus:ring-[#F5B51B] cursor-pointer"
                    />
                </div>
            )}

            <NotificationIcon notification={notification} size={compact ? 'sm' : 'md'} />

            <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                    <p className={`text-sm flex-1 ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        } ${compact ? 'line-clamp-1' : ''}`}>
                        {notification.title}
                    </p>
                    {notification.priority === 'urgent' && (
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${priorityBadgeClass('urgent')
                            }`}>
                            Urgent
                        </span>
                    )}
                </div>
                {notification.message && (
                    <p className={`text-xs text-gray-500 mt-0.5 ${compact ? 'line-clamp-2' : 'line-clamp-3'
                        }`}>
                        {notification.message}
                    </p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                    {notification.createdAt &&
                        formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>

            <div
                data-no-nav
                className={`flex items-start gap-1 transition-opacity ${compact ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
            >
                <button
                    onClick={(e) => stop(e, isUnread ? onMarkRead : onMarkUnread)}
                    title={isUnread ? 'Mark as read' : 'Mark as unread'}
                    className="p-1.5 rounded hover:bg-white text-gray-400 hover:text-[#C59D55] transition-colors"
                >
                    {isUnread ? <Check size={14} /> : <Undo2 size={14} />}
                </button>
                <button
                    onClick={(e) => stop(e, onDelete)}
                    title="Delete"
                    className="p-1.5 rounded hover:bg-white text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

export default NotificationItem;