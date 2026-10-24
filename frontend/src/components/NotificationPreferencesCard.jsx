import { useEffect, useState } from 'react';
import { Bell, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';

// Categories visible to bidder/seller
const USER_CATEGORIES = [
    { key: 'auction', label: 'Auctions', desc: 'Bids, outbids, auction results' },
    { key: 'offer', label: 'Offers', desc: 'Offer submitted, accepted, countered' },
    { key: 'payment', label: 'Payments', desc: 'Payment confirmations, deposits' },
    { key: 'payout', label: 'Payouts', desc: 'Payout progress and status' },
    { key: 'communication', label: 'Messages', desc: 'Chat and shipping updates' },
    { key: 'account', label: 'Account', desc: 'User regsiteration' },
];

// Extra categories only admin/staff see
const ADMIN_CATEGORIES = [
    { key: 'moderation', label: 'Moderation', desc: 'Flags, queues, approvals, reports' },
    { key: 'system', label: 'System', desc: 'Platform-level notifications' },
];

const CATEGORIES_BY_ROLE = {
    bidder: [
        { key: 'auction', label: 'Auctions', desc: 'Bids, outbids, auction results' },
        { key: 'offer', label: 'Offers', desc: 'Offers you made, responses, counters' },
        { key: 'payment', label: 'Payments', desc: 'Payment confirmations and deposits' },
        { key: 'communication', label: 'Messages', desc: 'Chat with sellers, shipping, comments' },
        { key: 'account', label: 'Account', desc: 'Account updates' },
    ],
    seller: [
        { key: 'auction', label: 'Auctions', desc: 'Bids on your items, listings, results' },
        { key: 'offer', label: 'Offers', desc: 'Offers on your items, counter-acceptance' },
        { key: 'payment', label: 'Payments', desc: 'Buyer payment confirmations' },
        { key: 'payout', label: 'Payouts', desc: 'Payout progress and status' },
        { key: 'communication', label: 'Messages', desc: 'Chat with buyers, comments' },
        { key: 'account', label: 'Account', desc: 'Account updates' },
    ],
    admin: [
        { key: 'auction', label: 'Auctions', desc: 'Auction results' },
        { key: 'payment', label: 'Payments', desc: 'Payment confirmations and deposits' },
        { key: 'communication', label: 'Messages', desc: 'Chat with sellers, bidder, shipping, comments' },
        { key: 'account', label: 'Account', desc: 'Registration and account updates' },
        { key: 'moderation', label: 'Moderation Queue', desc: 'Flags, approvals, reports, payments to review' },
    ],
    staff: [
        { key: 'auction', label: 'Auctions', desc: 'Auction results' },
        { key: 'payment', label: 'Payments', desc: 'Payment confirmations and deposits' },
        { key: 'communication', label: 'Messages', desc: 'Chat with sellers, bidder, shipping, comments' },
        { key: 'account', label: 'Account', desc: 'Registration and account updates' },
        { key: 'moderation', label: 'Moderation Queue', desc: 'Flags, approvals, reports, payments to review' },
    ],
};

const NotificationPreferencesCard = () => {
    const { user } = useAuth();
    const { soundEnabled, setSoundEnabled } = useNotifications();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [inApp, setInApp] = useState({});

    const isAdminOrStaff =
        user?.userType === 'admin' || user?.userType === 'staff';

    const role = user?.userType === 'broker' ? 'seller' : user?.userType;
    const categories = CATEGORIES_BY_ROLE[role] || CATEGORIES_BY_ROLE.bidder;

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosInstance.get('/api/v1/notifications/preferences');
                if (data.success) setInApp(data.data.inApp);
            } catch (_) {
                toast.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggle = async (key) => {
        const next = { ...inApp, [key]: !inApp[key] };
        setInApp(next);
        setSaving(true);
        try {
            await axiosInstance.put('/api/v1/notifications/preferences', { inApp: next });
        } catch (_) {
            setInApp(inApp);
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader size={24} className="animate-spin text-[#F5B51B]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Info banner — matches your existing info-banner style */}
            <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-secondary">
                    Choose which in-app notifications you want to receive. Turning a category off stops it
                    from appearing in your bell menu and the notifications page. Emails are managed separately.
                </p>
            </div>

            {/* Category toggles */}
            <div className="space-y-3">
                <h4 className="font-semibold text-lg">In-App Notifications</h4>
                {categories.map((c) => {
                    const enabled = inApp[c.key] !== false;
                    return (
                        <div
                            key={c.key}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-[#C59D55]" />
                                <div>
                                    <p className="font-medium">{c.label}</p>
                                    <p className="text-sm text-gray-500">{c.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggle(c.key)}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[#F5B51B]' : 'bg-gray-200'
                                    } disabled:opacity-50`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Sound toggle */}
            <div className="space-y-3">
                <h4 className="font-semibold text-lg">Sound</h4>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Bell size={20} className="text-[#C59D55]" />
                        <div>
                            <p className="font-medium">Notification sound</p>
                            <p className="text-sm text-gray-500">
                                Play a chime for high and urgent notifications
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-[#F5B51B]' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferencesCard;