import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const LOCKED_STATUSES = ['sold', 'sold_buy_now'];
export const isCommissionLockedStatus = (status) => LOCKED_STATUSES.includes(status);

const money = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n) || 0);

const isNum = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

// One readable line per rule of a structure
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

// Same progressive calculation as the server (integer cents), for the live preview
const previewFee = (rules, amount) => {
    const cents = Math.max(0, Math.round((Number(amount) || 0) * 100));
    if (rules.type === 'flat') {
        const v = Number(rules.flat.value);
        const fee = rules.flat.mode === 'fixed' ? Math.round(v * 100) : Math.round((cents * v) / 100);
        return { total: fee / 100, lines: [] };
    }
    let lower = 0;
    let total = 0;
    const lines = [];
    for (const t of rules.tiers) {
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

// Same rules as the server, so the admin gets feedback before saving
const checkRules = (r) => {
    if (r.type === 'flat') {
        if (!isNum(r.flat.value) || Number(r.flat.value) < 0) return 'Enter a flat value of 0 or more.';
        if (r.flat.mode === 'percentage' && Number(r.flat.value) > 100) return 'A percentage cannot be more than 100.';
        return null;
    }
    let prev = 0;
    for (let i = 0; i < r.tiers.length; i++) {
        const t = r.tiers[i];
        const last = i === r.tiers.length - 1;
        if (!isNum(t.rate) || Number(t.rate) < 0 || Number(t.rate) > 100) return `Tier ${i + 1}: enter a rate between 0 and 100.`;
        if (!last) {
            if (!isNum(t.upTo)) return `Tier ${i + 1}: enter the amount this tier goes up to.`;
            if (Number(t.upTo) <= prev) return `Tier ${i + 1}: the limit must be higher than ${money(prev)}.`;
            prev = Number(t.upTo);
        }
    }
    return null;
};

const emptyCustom = () => ({
    type: 'flat',
    flatMode: 'percentage',
    flatValue: '',
    tiers: [
        { upTo: '', rate: '' },
        { upTo: null, rate: '' },
    ],
});

const rulesFromCustom = (f) =>
    f.type === 'flat'
        ? { type: 'flat', flat: { mode: f.flatMode, value: f.flatValue === '' ? '' : Number(f.flatValue) } }
        : {
            type: 'tiered',
            tiers: f.tiers.map((t, i, arr) => ({
                upTo: i === arr.length - 1 ? null : t.upTo === '' ? '' : Number(t.upTo),
                rate: t.rate === '' ? '' : Number(t.rate),
            })),
        };

/* -------------------------------------------------------------------------- */
/*  State helpers used by the Create / Edit pages                             */
/* -------------------------------------------------------------------------- */

const initialSide = (mode) => ({
    // create: start from the global default; edit: leave the auction's commission as it is
    choice: mode === 'edit' ? 'keep' : 'global',
    structureId: '',
    custom: emptyCustom(),
});

export const initialCommissionState = (mode = 'create') => ({
    buyer: initialSide(mode),
    seller: initialSide(mode),
});

/** Returns an error message, or null when the picker state can be submitted. */
export const validateCommissionState = (state) => {
    for (const [side, label] of [['buyer', 'Buyer'], ['seller', 'Seller']]) {
        const s = state[side];
        if (s.choice === 'saved' && !s.structureId) return `${label} commission: choose a saved structure.`;
        if (s.choice === 'custom') {
            const problem = checkRules(rulesFromCustom(s.custom));
            if (problem) return `${label} commission: ${problem}`;
        }
    }
    return null;
};

/**
 * Builds the value for the `commission` form field, or null when there is nothing to send.
 * create: "global" is the default, so nothing is sent for it (the server copies the global default).
 * edit:   "keep" sends nothing; "global" asks the server to remove the auction's own rule.
 */
export const buildCommissionPayload = (state, mode = 'create') => {
    const sidePayload = (s) => {
        switch (s.choice) {
            case 'global':
                return mode === 'edit' ? { mode: 'global' } : undefined;
            case 'none':
                return { mode: 'none' };
            case 'saved':
                return { mode: 'saved', structureId: s.structureId };
            case 'custom':
                return { mode: 'custom', structure: rulesFromCustom(s.custom) };
            default:
                return undefined; // keep
        }
    };
    const buyer = sidePayload(state.buyer);
    const seller = sidePayload(state.seller);
    if (!buyer && !seller) return null;
    return JSON.stringify({ buyer, seller });
};

/* -------------------------------------------------------------------------- */
/*  Custom structure editor                                                   */
/* -------------------------------------------------------------------------- */

const inputClass = 'w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent';

function CustomEditor({ side, value, onChange }) {
    const [sample, setSample] = useState('100000');
    const set = (patch) => onChange({ ...value, ...patch });
    const setTier = (i, patch) => onChange({ ...value, tiers: value.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
    const addTier = () => {
        const tiers = [...value.tiers];
        tiers.splice(tiers.length - 1, 0, { upTo: '', rate: '' });
        onChange({ ...value, tiers });
    };
    const removeTier = (i) => onChange({ ...value, tiers: value.tiers.filter((_, idx) => idx !== i) });

    const rules = useMemo(() => rulesFromCustom(value), [value]);
    const problem = checkRules(rules);
    const preview = !problem ? previewFee(rules, sample) : null;

    const tierLabel = (i) => {
        const last = i === value.tiers.length - 1;
        const prev = i === 0 ? 0 : value.tiers[i - 1].upTo;
        if (last) return `Above ${isNum(prev) ? money(prev) : '…'}`;
        if (i === 0) return `First ${isNum(value.tiers[i].upTo) ? money(value.tiers[i].upTo) : '…'}`;
        return `${isNum(prev) ? money(prev) : '…'} to ${isNum(value.tiers[i].upTo) ? money(value.tiers[i].upTo) : '…'}`;
    };

    return (
        <div className="mt-3 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name={`${side}-custom-type`} checked={value.type === 'flat'} onChange={() => set({ type: 'flat' })} /> Flat
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name={`${side}-custom-type`} checked={value.type === 'tiered'} onChange={() => set({ type: 'tiered' })} /> Tiered
                </label>
            </div>

            {value.type === 'flat' ? (
                <div className="space-y-3">
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`${side}-custom-mode`} checked={value.flatMode === 'percentage'} onChange={() => set({ flatMode: 'percentage' })} /> Percentage
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name={`${side}-custom-mode`} checked={value.flatMode === 'fixed'} onChange={() => set({ flatMode: 'fixed' })} /> Fixed amount
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 w-4">{value.flatMode === 'fixed' ? '$' : '%'}</span>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            aria-label={`${side} custom flat value`}
                            className={`${inputClass} max-w-[10rem]`}
                            value={value.flatValue}
                            onChange={(e) => set({ flatValue: e.target.value })}
                        />
                        <span className="text-sm text-gray-500">{value.flatMode === 'fixed' ? 'charged once per sale' : 'of the final price'}</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Each rate applies only to the part of the price inside its tier. The last tier has no limit.</p>
                    <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1fr_2rem] gap-3 text-sm text-gray-500">
                        <span>Applies to</span>
                        <span>Up to ($)</span>
                        <span>Rate (%)</span>
                        <span />
                    </div>
                    {value.tiers.map((tier, i) => {
                        const last = i === value.tiers.length - 1;
                        return (
                            <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.2fr_1fr_1fr_2rem] gap-3 items-center">
                                <span className="text-sm col-span-2 sm:col-span-1">{tierLabel(i)}</span>
                                {last ? (
                                    <span className="text-sm text-gray-500 px-1">No limit</span>
                                ) : (
                                    <input type="number" min="0" step="any" aria-label={`${side} tier ${i + 1} limit`} className={inputClass} value={tier.upTo ?? ''} onChange={(e) => setTier(i, { upTo: e.target.value })} />
                                )}
                                <input type="number" min="0" max="100" step="any" aria-label={`${side} tier ${i + 1} rate`} className={inputClass} value={tier.rate} onChange={(e) => setTier(i, { rate: e.target.value })} />
                                <button
                                    type="button"
                                    onClick={() => removeTier(i)}
                                    disabled={value.tiers.length <= 2}
                                    aria-label={`Remove ${side} tier ${i + 1}`}
                                    className="text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                    <button type="button" onClick={addTier} className="flex items-center gap-1 text-sm text-gray-700 hover:underline">
                        <Plus size={16} /> Add tier
                    </button>
                </div>
            )}

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor={`${side}-sample`}>Try it with a final price of $</label>
                    <input id={`${side}-sample`} type="number" min="0" step="any" className={`${inputClass} w-32`} value={sample} onChange={(e) => setSample(e.target.value)} />
                </div>
                <div className="mt-2" aria-live="polite">
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
    );
}

/* -------------------------------------------------------------------------- */
/*  One side (buyer or seller)                                                */
/* -------------------------------------------------------------------------- */

const RuleSummary = ({ heading, note, lines }) => (
    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
        <p className="font-medium">{heading}</p>
        {note && <p className="text-gray-500">{note}</p>}
        {lines?.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-gray-600">
                {lines.map((l, i) => (
                    <li key={i}>{l}</li>
                ))}
            </ul>
        )}
    </div>
);

function SideEditor({ side, title, hint, state, onChange, mode, locked, canManage, storedSide, globalRule, structures }) {
    // What this side effectively uses right now
    const current = (() => {
        if (storedSide?.enabled === false) return { heading: 'No commission on this auction' };
        if (storedSide?.structure) {
            return { heading: storedSide.structure.name, note: 'Set on this auction', lines: describeStructure(storedSide.structure) };
        }
        if (!globalRule?.enabled) return { heading: 'Global default: turned off', note: 'Nothing is charged right now.' };
        return {
            heading: `Global default: ${globalRule.structure?.name}`,
            note: 'Follows the global setting',
            lines: describeStructure(globalRule.structure),
        };
    })();

    const options =
        mode === 'edit'
            ? [
                { value: 'keep', label: 'Keep current' },
                { value: 'global', label: 'Use the global default', desc: 'Removes this auction’s own commission. It follows the global setting.' },
                { value: 'saved', label: 'Saved structure' },
                { value: 'custom', label: 'Custom for this auction' },
                { value: 'none', label: 'No commission' },
            ]
            : [
                { value: 'global', label: 'Global default', desc: 'Copies the current global setting.' },
                { value: 'saved', label: 'Saved structure' },
                { value: 'custom', label: 'Custom for this auction' },
                { value: 'none', label: 'No commission' },
            ];

    const set = (patch) => onChange({ ...state, ...patch });
    const selectedStructure = structures.find((s) => s._id === state.structureId);

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-gray-500 mb-3">{hint}</p>

            {locked || !canManage ? (
                <RuleSummary {...(mode === 'edit' ? current : { heading: `Global default: ${globalRule?.structure?.name || ''}`, lines: describeStructure(globalRule?.structure) })} />
            ) : (
                <>
                    <fieldset className="space-y-2">
                        <legend className="sr-only">{title} option</legend>
                        {options.map((o) => (
                            <label key={o.value} className="flex items-start gap-2 text-sm">
                                <input type="radio" className="mt-1" name={`${side}-choice`} checked={state.choice === o.value} onChange={() => set({ choice: o.value })} />
                                <span>
                                    {o.label}
                                    {o.desc && state.choice === o.value && <span className="block text-gray-500">{o.desc}</span>}
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    <div className="mt-3">
                        {state.choice === 'keep' && <RuleSummary {...current} />}

                        {state.choice === 'global' && (
                            <RuleSummary
                                heading={globalRule?.enabled ? `Global default: ${globalRule.structure?.name}` : 'Global default: turned off'}
                                note={globalRule?.enabled ? undefined : 'Nothing is charged for this side right now.'}
                                lines={globalRule?.enabled ? describeStructure(globalRule.structure) : []}
                            />
                        )}

                        {state.choice === 'none' && <p className="text-sm text-gray-600">Nothing is charged to the {side} on this auction.</p>}

                        {state.choice === 'saved' && (
                            <div className="space-y-2">
                                <select aria-label={`${title} structure`} className={inputClass} value={state.structureId} onChange={(e) => set({ structureId: e.target.value })}>
                                    <option value="">Choose a structure</option>
                                    {structures.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} ({s.type === 'tiered' ? 'tiered' : 'flat'})
                                        </option>
                                    ))}
                                </select>
                                {selectedStructure && (
                                    <>
                                        <RuleSummary heading={selectedStructure.name} lines={describeStructure(selectedStructure)} />
                                        <p className="text-xs text-gray-500">This auction keeps its own copy. Later changes to the structure won’t affect it.</p>
                                    </>
                                )}
                            </div>
                        )}

                        {state.choice === 'custom' && <CustomEditor side={side} value={state.custom} onChange={(custom) => set({ custom })} />}
                    </div>
                </>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Picker                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Props:
 *  - value / onChange : the state from initialCommissionState()
 *  - mode             : 'create' | 'edit'
 *  - status           : (edit) the auction's current status, used to lock sold auctions
 *  - stored           : (edit) the auction's saved `commission` object, if any
 */
export default function AuctionCommissionPicker({ value, onChange, mode = 'create', status = null, stored = null }) {
    const [globalSettings, setGlobalSettings] = useState(null);
    const [structures, setStructures] = useState([]);
    const [canManage, setCanManage] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await axiosInstance.get('/api/v1/commissions');
                if (!cancelled && data.success) setGlobalSettings(data.data.commission);
            } catch {
                if (!cancelled) setLoadFailed(true);
            }
            try {
                const { data } = await axiosInstance.get('/api/v1/commissions/structures');
                if (!cancelled && data.success) setStructures(data.data.structures);
            } catch {
                // Staff without the "manage commissions" permission can see commission but not change it
                if (!cancelled) setCanManage(false);
            }
            if (!cancelled) setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const locked = mode === 'edit' && isCommissionLockedStatus(status);

    return (
        <div className="mt-8 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg">Commission</h3>
            <p className="text-sm text-gray-600 mb-4">
                {mode === 'edit'
                    ? 'Changes here apply to this auction only. The global default is not affected.'
                    : 'New auctions start with a copy of the global default. Change it here for this auction only.'}
            </p>

            {loading ? (
                <p className="text-sm text-gray-500">Loading commission settings…</p>
            ) : loadFailed ? (
                <p className="text-sm text-red-600">Could not load commission settings. The global default will apply.</p>
            ) : (
                <>
                    {locked && (
                        <p className="mb-4 text-sm text-gray-700">
                            This auction is sold, so its commission can’t be changed. Saving other changes relists the auction; you can then change its commission.
                        </p>
                    )}
                    {!canManage && !locked && <p className="mb-4 text-sm text-gray-700">You don’t have permission to change commission.</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SideEditor
                            side="buyer"
                            title="Buyer commission"
                            hint="Added on top of the winning bid and paid by the buyer."
                            state={value.buyer}
                            onChange={(buyer) => onChange({ ...value, buyer })}
                            mode={mode}
                            locked={locked}
                            canManage={canManage}
                            storedSide={stored?.buyer}
                            globalRule={{ enabled: globalSettings?.buyerEnabled, structure: globalSettings?.buyerStructure }}
                            structures={structures}
                        />
                        <SideEditor
                            side="seller"
                            title="Seller commission"
                            hint="Deducted from the seller’s payout."
                            state={value.seller}
                            onChange={(seller) => onChange({ ...value, seller })}
                            mode={mode}
                            locked={locked}
                            canManage={canManage}
                            storedSide={stored?.seller}
                            globalRule={{ enabled: globalSettings?.sellerEnabled, structure: globalSettings?.sellerStructure }}
                            structures={structures}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
