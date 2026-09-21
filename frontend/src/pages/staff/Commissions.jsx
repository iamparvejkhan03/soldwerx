import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { StaffContainer, StaffHeader, StaffSidebar, LoadingSpinner } from '../../components';
import { Save, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Commissions() {
    const [settings, setSettings] = useState({
        buyerEnabled: true,
        buyerType: 'percentage',
        buyerValue: 5,
        sellerEnabled: true,
        sellerType: 'percentage',
        sellerValue: 5,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axiosInstance.get('/api/v1/commissions');
            if (data.success) setSettings(data.data.commission);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load commission settings');
            navigate('/staff/profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axiosInstance.put('/api/v1/commissions', settings);
            if (data.success) {
                toast.success('Commission settings updated');
                setSettings(data.data.commission);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (section, field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <StaffSidebar />
                <div className="w-full relative">
                    <StaffHeader />
                    <StaffContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </StaffContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <StaffSidebar />
            <div className="w-full relative">
                <StaffHeader />
                <StaffContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings size={32} className="text-primary" />
                            <h2 className="text-3xl md:text-4xl font-bold">Commission Settings</h2>
                        </div>
                        <p className="text-gray-600">Configure buyer and seller commission rates independently.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Buyer Commission */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Buyer Commission</h3>
                                <button
                                    onClick={() => updateField('buyer', 'buyerEnabled', !settings.buyerEnabled)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    {settings.buyerEnabled ? <ToggleRight className="text-green-600" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                                </button>
                            </div>
                            {settings.buyerEnabled && (
                                <>
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="buyerType"
                                                value="fixed"
                                                checked={settings.buyerType === 'fixed'}
                                                onChange={() => updateField('buyer', 'buyerType', 'fixed')}
                                            /> Fixed
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="buyerType"
                                                value="percentage"
                                                checked={settings.buyerType === 'percentage'}
                                                onChange={() => updateField('buyer', 'buyerType', 'percentage')}
                                            /> Percentage
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600">{settings.buyerType === 'fixed' ? '$' : '%'}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step={settings.buyerType === 'percentage' ? '0.1' : '1'}
                                            value={settings.buyerValue}
                                            onChange={(e) => updateField('buyer', 'buyerValue', parseFloat(e.target.value) || 0)}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <span className="text-sm text-gray-500">
                                            {settings.buyerType === 'fixed' ? 'per transaction' : 'of bid amount'}
                                        </span>
                                    </div>
                                </>
                            )}
                            {!settings.buyerEnabled && <p className="text-gray-500 text-sm">Disabled</p>}
                        </div>

                        {/* Seller Commission */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Seller Commission</h3>
                                <button
                                    onClick={() => updateField('seller', 'sellerEnabled', !settings.sellerEnabled)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    {settings.sellerEnabled ? <ToggleRight className="text-green-600" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                                </button>
                            </div>
                            {settings.sellerEnabled && (
                                <>
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sellerType"
                                                value="fixed"
                                                checked={settings.sellerType === 'fixed'}
                                                onChange={() => updateField('seller', 'sellerType', 'fixed')}
                                            /> Fixed
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sellerType"
                                                value="percentage"
                                                checked={settings.sellerType === 'percentage'}
                                                onChange={() => updateField('seller', 'sellerType', 'percentage')}
                                            /> Percentage
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600">{settings.sellerType === 'fixed' ? '$' : '%'}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step={settings.sellerType === 'percentage' ? '0.1' : '1'}
                                            value={settings.sellerValue}
                                            onChange={(e) => updateField('seller', 'sellerValue', parseFloat(e.target.value) || 0)}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <span className="text-sm text-gray-500">
                                            {settings.sellerType === 'fixed' ? 'per transaction' : 'of final price'}
                                        </span>
                                    </div>
                                </>
                            )}
                            {!settings.sellerEnabled && <p className="text-gray-500 text-sm">Disabled</p>}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-8 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </StaffContainer>
            </div>
        </section>
    );
}

export default Commissions;