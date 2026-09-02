import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from '../../components';
import { Save, Settings, ToggleLeft, ToggleRight, DollarSign, Percent } from 'lucide-react';

function TaxSettings() {
    const [settings, setSettings] = useState({
        enabled: false,
        type: 'percentage',
        value: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/tax');
            if (data.success) setSettings(data.data.tax);
        } catch (error) {
            toast.error('Failed to load tax settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axiosInstance.put('/api/v1/tax', settings);
            if (data.success) {
                toast.success('Tax settings updated');
                setSettings(data.data.tax);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign size={32} className="text-amber-600" />
                            <h2 className="text-3xl md:text-4xl font-bold">Tax Settings</h2>
                        </div>
                        <p className="text-gray-600">Configure tax rate applied to the buyer's total.</p>
                    </div>

                    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">Tax Enabled</h3>
                                <p className="text-sm text-gray-500">Tax will be charged to the buyer</p>
                            </div>
                            <button
                                onClick={() => updateField('enabled', !settings.enabled)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {settings.enabled ? <ToggleRight className="text-green-600" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                            </button>
                        </div>

                        {settings.enabled && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type</label>
                                    <div className="flex gap-4">
                                        {/* <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="taxType"
                                                value="fixed"
                                                checked={settings.type === 'fixed'}
                                                onChange={() => updateField('type', 'fixed')}
                                            /> Fixed ($)
                                        </label> */}
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="taxType"
                                                value="percentage"
                                                checked={settings.type === 'percentage'}
                                                onChange={() => updateField('type', 'percentage')}
                                            /> Percentage (%)
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-gray-600">{settings.type === 'fixed' ? '$' : '%'}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step={settings.type === 'percentage' ? '0.1' : '1'}
                                        value={settings.value}
                                        onChange={(e) => updateField('value', parseFloat(e.target.value) || 0)}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                    <span className="text-sm text-gray-500">
                                        {settings.type === 'fixed' ? 'per transaction' : 'of final sale price'}
                                    </span>
                                </div>
                            </>
                        )}

                        {!settings.enabled && (
                            <p className="text-gray-500 text-sm mt-2">Tax is currently disabled</p>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                            >
                                <Save size={20} />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default TaxSettings;