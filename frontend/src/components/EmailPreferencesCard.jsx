import { useEffect, useState } from 'react';
import {
    Bell, Loader, Lock, AlertTriangle, Info, ChevronDown, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const EmailPreferencesCard = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosInstance.get('/api/v1/users/email-preferences');
                if (data.success) {
                    console.log(data.data)
                    setCategories(data.data.categories);
                    if (data.data.categories.length > 0) {
                        setExpandedCategory(data.data.categories[0].key);
                    }
                }
            } catch (_) {
                toast.error('Failed to load email preferences');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggle = async (emailKey, currentValue) => {
        const next = !currentValue;
        setSaving(true);

        // Optimistic update
        setCategories(prev =>
            prev.map(cat => ({
                ...cat,
                emails: cat.emails.map(e =>
                    e.key === emailKey ? { ...e, enabled: next } : e
                ),
            }))
        );

        try {
            await axiosInstance.put('/api/v1/users/email-preferences', {
                preferences: { [emailKey]: next },
            });
        } catch (_) {
            setCategories(prev =>
                prev.map(cat => ({
                    ...cat,
                    emails: cat.emails.map(e =>
                        e.key === emailKey ? { ...e, enabled: currentValue } : e
                    ),
                }))
            );
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
            <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-secondary">
                    Choose which emails you receive from us. Transactional emails like
                    password resets and payment confirmations may not be disabled.
                </p>
            </div>

            <div className="space-y-3">
                {categories.map(cat => {
                    const isExpanded = expandedCategory === cat.key;
                    const enabledCount = cat.emails.filter(e => e.enabled).length;
                    const totalCount = cat.emails.length;

                    return (
                        <div key={cat.key} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    {isExpanded
                                        ? <ChevronDown size={18} className="text-gray-500" />
                                        : <ChevronRight size={18} className="text-gray-500" />}
                                    <div>
                                        <p className="font-semibold text-secondary">{cat.label}</p>
                                        <p className="text-sm text-gray-500">{cat.description}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 shrink-0">
                                    {enabledCount}/{totalCount} on
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="divide-y divide-gray-100 bg-white">
                                    {cat.emails.map(email => (
                                        <div key={email.key} className="flex items-center justify-between p-4 gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="shrink-0 mt-0.5">
                                                    {email.locked ? (
                                                        <Lock size={18} className="text-gray-400" />
                                                    ) : email.critical ? (
                                                        <AlertTriangle size={18} className="text-amber-500" />
                                                    ) : (
                                                        <Bell size={18} className="text-[#C59D55]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-medium text-secondary">{email.label}</p>
                                                        {email.locked && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                                Required
                                                            </span>
                                                        )}
                                                        {email.critical && !email.locked && (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                                                Important
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{email.description}</p>
                                                    {email.critical && !email.locked && email.enabled === false && (
                                                        <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                                                            <Info size={12} />
                                                            Turning this off means you won't be notified of important account or payment events.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => !email.locked && toggle(email.key, email.enabled)}
                                                disabled={saving || email.locked}
                                                title={email.locked ? 'This email cannot be disabled' : ''}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${email.enabled ? 'bg-[#F5B51B]' : 'bg-gray-200'
                                                    } ${(saving || email.locked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${email.enabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmailPreferencesCard;