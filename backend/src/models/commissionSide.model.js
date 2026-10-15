import { Schema } from 'mongoose';

/**
 * Commission rule stored INSIDE an auction (one for the buyer, one for the seller).
 *
 * `structure` is a COPY (snapshot) of a commission structure, not a reference.
 * That is why changing or deleting a global structure later never changes an
 * auction that already has its own commission.
 *
 * Shape is the same as a CommissionStructure, so utils/commissionCalculator.js
 * can calculate from it directly.
 *
 *  - { enabled: false }                      -> no commission on this side for this auction
 *  - { enabled: true, structure: {...} }     -> charge using the copied structure
 *  - side missing on the auction             -> follow the live global default
 */
const tierSchema = new Schema(
    {
        upTo: { type: Number, default: null, min: 0 },
        rate: { type: Number, required: true, min: 0, max: 100 },
    },
    { _id: false }
);

const structureSnapshotSchema = new Schema(
    {
        name: { type: String, default: 'Custom' },
        // The saved structure this was copied from (null for custom). For display only.
        source: { type: Schema.Types.ObjectId, ref: 'CommissionStructure', default: null },
        type: { type: String, enum: ['flat', 'tiered'], required: true },
        flat: {
            mode: { type: String, enum: ['percentage', 'fixed'] },
            value: { type: Number, min: 0 },
        },
        tiers: { type: [tierSchema], default: [] },
    },
    { _id: false }
);

export const commissionSideSchema = new Schema(
    {
        enabled: { type: Boolean, default: true },
        structure: { type: structureSnapshotSchema, default: undefined },
    },
    { _id: false }
);