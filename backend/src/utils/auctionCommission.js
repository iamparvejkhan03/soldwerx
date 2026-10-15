import mongoose from 'mongoose';
import CommissionStructure from '../models/commissionStructure.model.js';
import { getGlobalCommissionSettings, validateStructureRules } from './commissionCalculator.js';

/** Commission can be changed in every status except these. */
export const LOCKED_COMMISSION_STATUSES = ['sold', 'sold_buy_now'];
export const isCommissionLocked = (status) => LOCKED_COMMISSION_STATUSES.includes(status);

const SIDES = ['buyer', 'seller'];

/** Copies a structure (saved or global) into the shape stored on an auction. */
const toSnapshot = (structure, nameOverride) => {
    const snapshot = {
        name: nameOverride ?? structure.name ?? 'Custom',
        source: structure._id || structure.source || null,
        type: structure.type,
        tiers: [],
    };
    if (structure.type === 'flat') {
        snapshot.flat = { mode: structure.flat.mode, value: structure.flat.value };
    } else {
        snapshot.tiers = (structure.tiers || []).map((t) => ({
            upTo: t.upTo ?? null,
            rate: t.rate,
        }));
    }
    return snapshot;
};

/**
 * Builds the commission that every NEW auction starts with:
 * a snapshot of the current global buyer and seller settings.
 */
export const buildGlobalCommission = async () => {
    const global = await getGlobalCommissionSettings();
    return {
        buyer: { enabled: global.buyerEnabled, structure: toSnapshot(global.buyerStructure) },
        seller: { enabled: global.sellerEnabled, structure: toSnapshot(global.sellerStructure) },
    };
};

/**
 * Resolves what the admin sent for ONE side.
 *
 * Input (from the admin pages):
 *   undefined / null                            -> action "keep"   (no change)
 *   { mode: 'global' }                          -> action "global" (follow the global default)
 *   { mode: 'none' }                            -> action "set"    ({ enabled: false })
 *   { mode: 'saved', structureId }              -> action "set"    (copy of that saved structure)
 *   { mode: 'custom', structure: { type, flat | tiers } } -> action "set" (custom copy)
 */
const resolveSide = async (input, label) => {
    if (input === undefined || input === null) return { action: 'keep' };
    if (typeof input !== 'object') return { error: `${label} commission is invalid.` };

    switch (input.mode) {
        case 'global':
            return { action: 'global' };

        case 'none':
            return { action: 'set', value: { enabled: false } };

        case 'saved': {
            if (!mongoose.isValidObjectId(input.structureId)) {
                return { error: `${label} commission: choose a saved structure.` };
            }
            const structure = await CommissionStructure.findById(input.structureId).lean();
            if (!structure) {
                return { error: `${label} commission: the selected structure no longer exists.` };
            }
            return { action: 'set', value: { enabled: true, structure: toSnapshot(structure) } };
        }

        case 'custom': {
            const { error, data } = validateStructureRules(input.structure);
            if (error) return { error: `${label} commission: ${error}` };
            return {
                action: 'set',
                value: { enabled: true, structure: toSnapshot({ ...data }, 'Custom') },
            };
        }

        default:
            return { error: `${label} commission: unknown option.` };
    }
};

/**
 * Parses and validates the `commission` field sent by the admin pages
 * (a JSON string inside multipart FormData, or an object).
 * Returns { error } or { sides: { buyer: {action, value?}, seller: {action, value?} } }.
 */
export const resolveCommissionInput = async (raw) => {
    let input = raw;
    if (typeof raw === 'string') {
        try {
            input = JSON.parse(raw);
        } catch {
            return { error: 'Commission data is not valid.' };
        }
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return { error: 'Commission data is not valid.' };
    }

    const sides = {};
    for (const side of SIDES) {
        const label = side === 'buyer' ? 'Buyer' : 'Seller';
        const result = await resolveSide(input[side], label);
        if (result.error) return { error: result.error };
        sides[side] = result;
    }
    return { sides };
};