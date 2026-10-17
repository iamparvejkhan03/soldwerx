import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Bell, Search, CheckCheck, Trash2, Loader, Volume2, VolumeX,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from '../../components/NotificationItem';
import {
    AdminSidebar, AdminHeader, AdminContainer,
    StaffSidebar, StaffHeader, StaffContainer,
    SellerSidebar, SellerHeader, SellerContainer,
    BidderSidebar, BidderHeader, BidderContainer,
} from '../../components';
import { socket } from '../../utils/socket.js';

const CATEGORIES = [
    { value: 'all', label: 'All' },
    { value: 'auction', label: 'Auctions' },
    { value: 'offer', label: 'Offers' },
    { value: 'payment', label: 'Payments' },
    { value: 'payout', label: 'Payouts' },
    { value: 'communication', label: 'Messages' },
    { value: 'account', label: 'Account' },
    { value: 'moderation', label: 'Moderation' },
];

const LAYOUTS = {
    admin: { Sidebar: AdminSidebar, Header: AdminHeader, Container: AdminContainer },
    staff: { Sidebar: StaffSidebar, Header: StaffHeader, Container: StaffContainer },
    seller: { Sidebar: SellerSidebar, Header: SellerHeader, Container: SellerContainer },
    bidder: { Sidebar: BidderSidebar, Header: BidderHeader, Container: BidderContainer },
};

const PAGE_LIMIT = 20;

const Notifications = () => {
    const { user } = useAuth();
    const { soundEnabled, setSoundEnabled } = useNotifications();
    const [searchParams, setSearchParams] = useSearchParams();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalNotifications: 0 });
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [selectedIds, setSelectedIds] = useState(new Set());

    const Layout = LAYOUTS[user?.userType] || LAYOUTS.bidder;

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: PAGE_LIMIT,
                filter,
                category,
            });
            if (search) params.set('search', search);

            const { data } = await axiosInstance.get(`/api/v1/notifications?${params.toString()}`);
            if (data.success) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
                setPagination(data.data.pagination);
                setSelectedIds(new Set());
            }
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [filter, category, search]);

    useEffect(() => { fetchNotifications(1); }, [fetchNotifications]);

    // ─── Live updates via socket ────────────────────────────
    useEffect(() => {
        const matchesCurrentView = (n) => {
            // Filter check
            if (filter === 'read' && !n.isRead) return false;
            if (filter === 'unread' && n.isRead) return false;
            // (filter === 'all' always passes)

            // Category check
            if (category !== 'all' && n.category !== category) return false;

            // Search check (client-side, same as server-side)
            if (search) {
                const q = search.toLowerCase();
                const inTitle = n.title?.toLowerCase().includes(q);
                const inMessage = n.message?.toLowerCase().includes(q);
                if (!inTitle && !inMessage) return false;
            }

            return true;
        };

        const onNew = ({ notification, unreadCount: n }) => {
            setUnreadCount(n);
            if (!matchesCurrentView(notification)) return;

            setNotifications((prev) => {
                // Avoid duplicates (server may re-emit on reconnect)
                if (prev.some((x) => x._id === notification._id)) return prev;
                // Prepend, cap at page size
                const next = [notification, ...prev];
                return next.slice(0, PAGE_LIMIT);
            });
            setPagination((p) => ({
                ...p,
                totalNotifications: p.totalNotifications + 1,
            }));
        };

        const onCount = ({ unreadCount: n }) => setUnreadCount(n);

        const onRead = ({ notificationId, unreadCount: n }) => {
            setUnreadCount(n);
            setNotifications((prev) => {
                // If viewing unread only, drop the item
                if (filter === 'unread') return prev.filter((x) => x._id !== notificationId);
                return prev.map((x) =>
                    x._id === notificationId ? { ...x, isRead: true } : x
                );
            });
        };

        const onUnread = ({ notificationId, unreadCount: n }) => {
            setUnreadCount(n);
            setNotifications((prev) => {
                if (filter === 'read') return prev.filter((x) => x._id !== notificationId);
                return prev.map((x) =>
                    x._id === notificationId ? { ...x, isRead: false } : x
                );
            });
        };

        const onAllRead = ({ unreadCount: n }) => {
            setUnreadCount(n);
            setNotifications((prev) => {
                if (filter === 'unread') return [];
                return prev.map((x) => ({ ...x, isRead: true }));
            });
        };

        const onDeleted = ({ notificationId, unreadCount: n }) => {
            setUnreadCount(n);
            setNotifications((prev) => prev.filter((x) => x._id !== notificationId));
            setSelectedIds((prev) => {
                if (!prev.has(notificationId)) return prev;
                const next = new Set(prev);
                next.delete(notificationId);
                return next;
            });
        };

        const onBulkDeleted = ({ ids, unreadCount: n }) => {
            setUnreadCount(n);
            const s = new Set(ids);
            setNotifications((prev) => prev.filter((x) => !s.has(x._id)));
            setSelectedIds((prev) => {
                const next = new Set([...prev].filter((id) => !s.has(id)));
                return next;
            });
        };

        const onClearRead = ({ unreadCount: n }) => {
            setUnreadCount(n);
            setNotifications((prev) => prev.filter((x) => !x.isRead));
        };

        socket.on('notification:new', onNew);
        socket.on('notification:count', onCount);
        socket.on('notification:read', onRead);
        socket.on('notification:unread', onUnread);
        socket.on('notification:all-read', onAllRead);
        socket.on('notification:deleted', onDeleted);
        socket.on('notification:bulk-deleted', onBulkDeleted);
        socket.on('notification:clear-read', onClearRead);

        return () => {
            socket.off('notification:new', onNew);
            socket.off('notification:count', onCount);
            socket.off('notification:read', onRead);
            socket.off('notification:unread', onUnread);
            socket.off('notification:all-read', onAllRead);
            socket.off('notification:deleted', onDeleted);
            socket.off('notification:bulk-deleted', onBulkDeleted);
            socket.off('notification:clear-read', onClearRead);
        };
    }, [filter, category, search]);

    // Sync URL params
    useEffect(() => {
        const p = new URLSearchParams();
        if (filter !== 'all') p.set('filter', filter);
        if (category !== 'all') p.set('category', category);
        setSearchParams(p, { replace: true });
    }, [filter, category, setSearchParams]);

    // ── Actions ──
    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === notifications.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(notifications.map((n) => n._id)));
    };

    const handleMarkAllRead = async () => {
        try {
            await axiosInstance.patch('/api/v1/notifications/mark-all-read');
            toast.success('All marked as read');
            fetchNotifications(pagination.currentPage);
        } catch (_) { toast.error('Failed'); }
    };

    const handleClearRead = async () => {
        if (!window.confirm('Delete all read notifications? This cannot be undone.')) return;
        try {
            await axiosInstance.delete('/api/v1/notifications/clear-read');
            toast.success('Read notifications cleared');
            fetchNotifications(1);
        } catch (_) { toast.error('Failed'); }
    };

    const handleBulkDelete = async () => {
        const ids = [...selectedIds];
        if (!ids.length) return;
        if (!window.confirm(`Delete ${ids.length} notification(s)?`)) return;
        try {
            await axiosInstance.delete('/api/v1/notifications/bulk', { data: { ids } });
            toast.success(`Deleted ${ids.length}`);
            fetchNotifications(pagination.currentPage);
        } catch (_) { toast.error('Failed'); }
    };

    const handleBulkMarkRead = async () => {
        const ids = [...selectedIds];
        await Promise.all(ids.map((id) => axiosInstance.patch(`/api/v1/notifications/${id}/read`)));
        toast.success('Marked as read');
        fetchNotifications(pagination.currentPage);
    };

    const handleItemMarkRead = async (id) => {
        await axiosInstance.patch(`/api/v1/notifications/${id}/read`);
        setNotifications((p) => p.map((x) => x._id === id ? { ...x, isRead: true } : x));
        setUnreadCount((c) => Math.max(0, c - 1));
    };
    const handleItemMarkUnread = async (id) => {
        await axiosInstance.patch(`/api/v1/notifications/${id}/unread`);
        setNotifications((p) => p.map((x) => x._id === id ? { ...x, isRead: false } : x));
        setUnreadCount((c) => c + 1);
    };
    const handleItemDelete = async (id) => {
        await axiosInstance.delete(`/api/v1/notifications/${id}`);
        setNotifications((p) => p.filter((x) => x._id !== id));
    };

    const tabs = useMemo(() => ([
        { value: 'all', label: 'All' },
        { value: 'unread', label: `Unread${unreadCount ? ` (${unreadCount})` : ''}` },
        { value: 'read', label: 'Read' },
    ]), [unreadCount]);

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <Layout.Sidebar />
            <div className="w-full relative">
                <Layout.Header />
                <Layout.Container>

                    <div className="pt-16 md:pt-0 max-w-5xl mx-auto pb-16">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    Notifications
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {unreadCount > 0
                                        ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                                        : "You're all caught up"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                                    className="p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                                >
                                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={unreadCount === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCheck size={16} />
                                    Mark all read
                                </button>
                                <button
                                    onClick={handleClearRead}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
                                >
                                    <Trash2 size={16} />
                                    Clear read
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-gray-200">
                            {tabs.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setFilter(t.value)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${filter === t.value
                                        ? 'border-[#F5B51B] text-[#C59D55]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Category chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setCategory(c.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c.value
                                        ? 'bg-[#F5B51B] text-black'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#F5B51B] hover:text-[#C59D55]'
                                        }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#F5B51B] focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Bulk action bar */}
                        {selectedIds.size > 0 && (
                            <div className="sticky top-2 z-10 mb-3 flex items-center justify-between gap-3 p-3 bg-[#080A0D] text-white rounded-lg shadow-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === notifications.length && notifications.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[#F5B51B]"
                                    />
                                    <span>{selectedIds.size} selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleBulkMarkRead}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium"
                                    >
                                        <CheckCheck size={14} /> Mark read
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded text-xs font-medium"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                    <button
                                        onClick={() => setSelectedIds(new Set())}
                                        className="text-xs text-white/70 hover:text-white px-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Select-all row */}
                            {notifications.length > 0 && selectedIds.size === 0 && (
                                <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[#F5B51B]"
                                    />
                                    <span className="text-xs text-gray-500">Select all on this page</span>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader size={28} className="animate-spin text-[#F5B51B]" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        No notifications
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {search
                                            ? 'No results match your search.'
                                            : 'Nothing here yet.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((n) => (
                                        <NotificationItem
                                            key={n._id}
                                            notification={n}
                                            selectable
                                            selected={selectedIds.has(n._id)}
                                            onToggleSelect={toggleSelect}
                                            onMarkRead={handleItemMarkRead}
                                            onMarkUnread={handleItemMarkUnread}
                                            onDelete={handleItemDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-gray-500">
                                    Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalNotifications} total
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchNotifications(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>
                                    <button
                                        onClick={() => fetchNotifications(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </Layout.Container>
            </div>
        </section>
    );
};

export default Notifications;