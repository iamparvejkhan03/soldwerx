import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from '../../components';
import { Save, Settings, ToggleLeft, ToggleRight, Plus, Pencil, Trash2, X } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const money = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n) || 0);

const isNum = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

// Short, readable description of a structure, one line per rule
const describeStructure = (s) => {
    if (!s) return [];
    if (s.type === 'flat') {
        return [s.flat?.mode === 'fixed' ? `${money(s.flat.value)} fixed fee` : `${s.flat?.value}% of the final price`];
    }
    const tiers = s.tiers || [];
    return tiers.map((t, i) => {
        const prev = i === 0 ? 0 : tiers[i - 1].upTo;
        if (t.upTo === null || t.upTo === undefined) return `${t.rate}% above ${money(prev)}`;
        if (i === 0) return `${t.rate}% on the first ${money(t.upTo)}`;
        return `${t.rate}% from ${money(prev)} to ${money(t.upTo)}`;
    });
};

// Mirrors the server calculation (progressive tiers, integer cents) for the live preview
const previewFee = (payload, amount) => {
    const cents = Math.max(0, Math.round((Number(amount) || 0) * 100));
    if (payload.type === 'flat') {
        const v = Number(payload.flat.value);
        const fee = payload.flat.mode === 'fixed' ? Math.round(v * 100) : Math.round((cents * v) / 100);
        return { total: fee / 100, lines: [] };
    }
    let lower = 0;
    let total = 0;
    const lines = [];
    for (const t of payload.tiers) {
        const upper = t.upTo === null ? Infinity : Math.round(Number(t.upTo) * 100);
        const portion = Math.min(cents, upper) - lower;
        if (portion > 0) {
            const fee = Math.round((portion * Number(t.rate)) / 100);
            total += fee;
            lines.push({ portion: portion / 100, rate: Number(t.rate), fee: fee / 100 });
        }
        lower = upper;
        if (cents <= upper) break;
    }
    return { total: total / 100, lines };
};

// Same rules as the server, so staff get instant feedback
const checkPayload = (p) => {
    if (!p.name) return 'Enter a name for this structure.';
    if (p.type === 'flat') {
        if (!isNum(p.flat.value) || Number(p.flat.value) < 0) return 'Enter a flat value of 0 or more.';
        if (p.flat.mode === 'percentage' && Number(p.flat.value) > 100) return 'A percentage cannot be more than 100.';
        return null;
    }
    let prev = 0;
    for (let i = 0; i < p.tiers.length; i++) {
        const t = p.tiers[i];
        const last = i === p.tiers.length - 1;
        if (!isNum(t.rate) || Number(t.rate) < 0 || Number(t.rate) > 100) return `Tier ${i + 1}: enter a rate between 0 and 100.`;
        if (!last) {
            if (!isNum(t.upTo)) return `Tier ${i + 1}: enter the amount this tier goes up to.`;
            if (Number(t.upTo) <= prev) return `Tier ${i + 1}: the limit must be higher than ${money(prev)}.`;
            prev = Number(t.upTo);
        }
    }
    return null;
};

const emptyForm = () => ({
    name: '',
    description: '',
    type: 'flat',
    flatMode: 'percentage',
    flatValue: '',
    tiers: [
        { upTo: '', rate: '' },
        { upTo: null, rate: '' },
    ],
});

const formFromStructure = (s) => ({
    name: s.name,
    description: s.description || '',
    type: s.type,
    flatMode: s.flat?.mode || 'percentage',
    flatValue: s.flat?.value !== undefined ? String(s.flat.value) : '',
    tiers:
        s.type === 'tiered' && s.tiers?.length >= 2
            ? s.tiers.map((t) => ({ upTo: t.upTo === null ? null : String(t.upTo), rate: String(t.rate) }))
            : emptyForm().tiers,
});

const payloadFromForm = (f) => {
    const base = { name: f.name.trim(), description: f.description.trim(), type: f.type };
    if (f.type === 'flat') {
        return { ...base, flat: { mode: f.flatMode, value: f.flatValue === '' ? '' : Number(f.flatValue) } };
    }
    return {
        ...base,
        tiers: f.tiers.map((t, i, arr) => ({
            upTo: i === arr.length - 1 ? null : t.upTo === '' ? '' : Number(t.upTo),
            rate: t.rate === '' ? '' : Number(t.rate),
        })),
    };
};

const inputClass = 'px-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary/40';

/* -------------------------------------------------------------------------- */
/*  Structure form (modal)                                                    */
/* -------------------------------------------------------------------------- */

function StructureModal({ structure, onClose, onSaved }) {
    const [form, setForm] = useState(structure ? formFromStructure(structure) : emptyForm());
    const [sample, setSample] = useState('120000');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));
    const setTier = (index, patch) =>
        setForm((prev) => ({ ...prev, tiers: prev.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)) }));
    const addTier = () =>
        setForm((prev) => {
            const tiers = [...prev.tiers];
            tiers.splice(tiers.length - 1, 0, { upTo: '', rate: '' });
            return { ...prev, tiers };
        });
    const removeTier = (index) =>
        setForm((prev) => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }));

    const payload = useMemo(() => payloadFromForm(form), [form]);
    const problem = checkPayload(payload);
    const preview = !problem ? previewFee(payload, sample) : null;

    const tierLabel = (i) => {
        const tiers = form.tiers;
        const last = i === tiers.length - 1;
        const prev = i === 0 ? 0 : tiers[i - 1].upTo;
        if (last) return `Above ${isNum(prev) ? money(prev) : '…'}`;
        if (i === 0) return `First ${isNum(tiers[i].upTo) ? money(tiers[i].upTo) : '…'}`;
        return `${isNum(prev) ? money(prev) : '…'} to ${isNum(tiers[i].upTo) ? money(tiers[i].upTo) : '…'}`;
    };

    const handleSave = async () => {
        if (problem) {
            toast.error(problem);
            return;
        }
        setSaving(true);
        try {
            const { data } = structure
                ? await axiosInstance.put(`/api/v1/commissions/structures/${structure._id}`, payload)
                : await axiosInstance.post('/api/v1/commissions/structures', payload);
            if (data.success) {
                toast.success(structure ? 'Structure updated' : 'Structure created');
                onSaved();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save the structure');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div role="dialog" aria-modal="true" aria-labelledby="structure-title" className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 id="structure-title" className="text-xl font-semibold">
                        {structure ? 'Edit commission structure' : 'New commission structure'}
                    </h3>
                    <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label htmlFor="cs-name" className="block text-sm font-medium mb-1">Name</label>
                        <input id="cs-name" className={inputClass} value={form.name} maxLength={80} placeholder="e.g. Premium tiers" onChange={(e) => set({ name: e.target.value })} />
                    </div>

                    <div>
                        <label htmlFor="cs-desc" className="block text-sm font-medium mb-1">Description (optional)</label>
                        <input id="cs-desc" className={inputClass} value={form.description} maxLength={300} onChange={(e) => set({ description: e.target.value })} />
                    </div>

                    <fieldset>
                        <legend className="block text-sm font-medium mb-2">Type</legend>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input type="radio" name="cs-type" checked={form.type === 'flat'} onChange={() => set({ type: 'flat' })} /> Flat
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" name="cs-type" checked={form.type === 'tiered'} onChange={() => set({ type: 'tiered' })} /> Tiered
                            </label>
                        </div>
                    </fieldset>

                    {form.type === 'flat' ? (
                        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="cs-mode" checked={form.flatMode === 'percentage'} onChange={() => set({ flatMode: 'percentage' })} /> Percentage
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="cs-mode" checked={form.flatMode === 'fixed'} onChange={() => set({ flatMode: 'fixed' })} /> Fixed amount
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-600 w-4">{form.flatMode === 'fixed' ? '$' : '%'}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    aria-label="Flat commission value"
                                    className={`${inputClass} max-w-[10rem]`}
                                    value={form.flatValue}
                                    onChange={(e) => set({ flatValue: e.target.value })}
                                />
                                <span className="text-sm text-gray-500">
                                    {form.flatMode === 'fixed' ? 'charged once per sale' : 'of the final price'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                            <p className="text-sm text-gray-600">
                                Each rate applies only to the part of the price inside its tier. The last tier has no limit.
                            </p>
                            <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1fr_2rem] gap-3 text-sm text-gray-500">
                                <span>Applies to</span>
                                <span>Up to ($)</span>
                                <span>Rate (%)</span>
                                <span />
                            </div>
                            {form.tiers.map((tier, i) => {
                                const last = i === form.tiers.length - 1;
                                return (
                                    <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.2fr_1fr_1fr_2rem] gap-3 items-center">
                                        <span className="text-sm col-span-2 sm:col-span-1">{tierLabel(i)}</span>
                                        {last ? (
                                            <span className="text-sm text-gray-500 px-1">No limit</span>
                                        ) : (
                                            <input type="number" min="0" step="any" aria-label={`Tier ${i + 1} limit`} className={inputClass} value={tier.upTo ?? ''} onChange={(e) => setTier(i, { upTo: e.target.value })} />
                                        )}
                                        <input type="number" min="0" max="100" step="any" aria-label={`Tier ${i + 1} rate`} className={inputClass} value={tier.rate} onChange={(e) => setTier(i, { rate: e.target.value })} />
                                        <button
                                            type="button"
                                            onClick={() => removeTier(i)}
                                            disabled={form.tiers.length <= 2}
                                            aria-label={`Remove tier ${i + 1}`}
                                            className="text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                            <button type="button" onClick={addTier} className="flex items-center gap-1 text-sm text-primary hover:underline">
                                <Plus size={16} /> Add tier
                            </button>
                        </div>
                    )}

                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <label htmlFor="cs-sample" className="text-sm font-medium">Try it with a final price of</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">$</span>
                                <input id="cs-sample" type="number" min="0" step="any" className={`${inputClass} w-36`} value={sample} onChange={(e) => setSample(e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-3 text-sm" aria-live="polite">
                            {problem ? (
                                <p className="text-gray-500">{problem}</p>
                            ) : (
                                <>
                                    <p className="font-semibold">Commission: {money(preview.total)}</p>
                                    {preview.lines.map((l, i) => (
                                        <p key={i} className="text-gray-600">
                                            {l.rate}% of {money(l.portion)} = {money(l.fee)}
                                        </p>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
                        {saving ? 'Saving...' : structure ? 'Save changes' : 'Create structure'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Global side card (buyer / seller)                                         */
/* -------------------------------------------------------------------------- */

function SideCard({ title, hint, enabled, structureId, structures, onToggle, onSelect }) {
    const selected = structures.find((s) => s._id === structureId);
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onToggle} aria-pressed={enabled} aria-label={`${enabled ? 'Turn off' : 'Turn on'} ${title.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">
                    {enabled ? <ToggleRight className="text-green-600" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{hint}</p>

            {enabled ? (
                <>
                    <label htmlFor={`select-${title}`} className="block text-sm font-medium mb-1">Structure</label>
                    <select id={`select-${title}`} className={inputClass} value={structureId || ''} onChange={(e) => onSelect(e.target.value)}>
                        {structures.map((s) => (
                            <option key={s._id} value={s._id}>
                                {s.name} ({s.type === 'tiered' ? 'tiered' : 'flat'})
                            </option>
                        ))}
                    </select>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                        {describeStructure(selected).map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="text-gray-500 text-sm">Turned off. Nothing is charged.</p>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

// Defined at module level so React does not remount the page on every render
function Shell({ children }) {
    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>{children}</AdminContainer>
            </div>
        </section>
    );
}

const toGlobalState = (c) => ({
    buyerEnabled: c.buyerEnabled,
    buyerStructure: c.buyerStructure?._id || '',
    sellerEnabled: c.sellerEnabled,
    sellerStructure: c.sellerStructure?._id || '',
});

function Commissions() {
    const [globalSettings, setGlobalSettings] = useState(null);
    const [savedGlobal, setSavedGlobal] = useState(null);
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null); // null | { structure: object | null }

    const fetchAll = async () => {
        try {
            const [globalRes, listRes] = await Promise.all([
                axiosInstance.get('/api/v1/commissions'),
                axiosInstance.get('/api/v1/commissions/structures'),
            ]);
            if (globalRes.data.success) {
                const state = toGlobalState(globalRes.data.data.commission);
                setGlobalSettings(state);
                setSavedGlobal(state);
            }
            if (listRes.data.success) setStructures(listRes.data.data.structures);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load commission settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const dirty = useMemo(
        () => globalSettings && savedGlobal && JSON.stringify(globalSettings) !== JSON.stringify(savedGlobal),
        [globalSettings, savedGlobal]
    );

    const handleSaveGlobal = async () => {
        setSaving(true);
        try {
            const { data } = await axiosInstance.put('/api/v1/commissions', globalSettings);
            if (data.success) {
                toast.success('Global commission updated');
                const state = toGlobalState(data.data.commission);
                setGlobalSettings(state);
                setSavedGlobal(state);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (structure) => {
        if (!window.confirm(`Delete "${structure.name}"? This cannot be undone.`)) return;
        try {
            const { data } = await axiosInstance.delete(`/api/v1/commissions/structures/${structure._id}`);
            if (data.success) {
                toast.success('Structure deleted');
                fetchAll();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not delete the structure');
        }
    };

    const handleSaved = () => {
        setModal(null);
        fetchAll();
    };

    if (loading) {
        return (
            <Shell>
                <div className="flex justify-center items-center min-h-96">
                    <LoadingSpinner />
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <div className="max-w-full pt-16 pb-7 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                    <Settings size={32} className="text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold">Commission settings</h2>
                </div>
                <p className="text-gray-600">Create commission structures, then choose which one applies to buyers and sellers across all auctions.</p>
            </div>

            {/* Global selection */}
            <h3 className="text-xl font-semibold mb-3">Global commission</h3>
            {globalSettings && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SideCard
                            title="Buyer commission"
                            hint="Added on top of the winning bid and paid by the buyer."
                            enabled={globalSettings.buyerEnabled}
                            structureId={globalSettings.buyerStructure}
                            structures={structures}
                            onToggle={() => setGlobalSettings((p) => ({ ...p, buyerEnabled: !p.buyerEnabled }))}
                            onSelect={(id) => setGlobalSettings((p) => ({ ...p, buyerStructure: id }))}
                        />
                        <SideCard
                            title="Seller commission"
                            hint="Deducted from the seller's payout."
                            enabled={globalSettings.sellerEnabled}
                            structureId={globalSettings.sellerStructure}
                            structures={structures}
                            onToggle={() => setGlobalSettings((p) => ({ ...p, sellerEnabled: !p.sellerEnabled }))}
                            onSelect={(id) => setGlobalSettings((p) => ({ ...p, sellerStructure: id }))}
                        />
                    </div>

                    <button
                        onClick={handleSaveGlobal}
                        disabled={saving || !dirty}
                        className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save global commission'}
                    </button>
                    <p className="mt-2 text-sm text-gray-500">Applies to auctions without their own commission. Auctions that are already sold keep the commission they were charged.</p>
                </>
            )}

            {/* Structures */}
            <div className="flex items-center justify-between mt-12 mb-3">
                <h3 className="text-xl font-semibold">Commission structures</h3>
                <button onClick={() => setModal({ structure: null })} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                    <Plus size={18} /> New structure
                </button>
            </div>

            {structures.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No structures yet. Create one to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    {structures.map((s) => {
                        const isBuyer = savedGlobal?.buyerStructure === s._id;
                        const isSeller = savedGlobal?.sellerStructure === s._id;
                        const locked = isBuyer || isSeller;
                        return (
                            <div key={s._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-lg">{s.name}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{s.type === 'tiered' ? 'Tiered' : 'Flat'}</span>
                                            {isBuyer && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Global buyer</span>}
                                            {isSeller && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Global seller</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setModal({ structure: s })} aria-label={`Edit ${s.name}`} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s)}
                                            disabled={locked}
                                            title={locked ? 'Select a different global structure before deleting this one' : undefined}
                                            aria-label={`Delete ${s.name}`}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {s.description && <p className="text-sm text-gray-500 mt-3">{s.description}</p>}
                                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                    {describeStructure(s).map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}

            {modal && <StructureModal structure={modal.structure} onClose={() => setModal(null)} onSaved={handleSaved} />}
        </Shell>
    );
}

export default Commissions;