import { Schema, model } from 'mongoose';

/**
 * A reusable commission structure (a "pricing formula").
 *
 *  - type "flat":   one rule applied to the whole amount.
 *                   flat.mode  = "percentage" (e.g. 10 => 10%) or "fixed" (e.g. 250 => $250)
 *  - type "tiered": progressive percentage tiers. Each tier only stores its upper limit;
 *                   its lower limit is the previous tier's upper limit, so gaps/overlaps
 *                   are impossible. The last tier has upTo = null (open-ended).
 *
 *    Example:  [{ upTo: 50000, rate: 15 }, { upTo: 100000, rate: 10 }, { upTo: null, rate: 6 }]
 *
 * Structures are NOT tied to buyer or seller. The global settings (and later each
 * auction) decide which structure is used for which side.
 */
const tierSchema = new Schema(
    {
        upTo: { type: Number, default: null, min: 0 }, // null = no upper limit
        rate: { type: Number, required: true, min: 0, max: 100 }, // percentage
    },
    { _id: false }
);

const commissionStructureSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80,
        },
        // Lower-cased name, used only to enforce unique names regardless of case
        nameKey: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: '',
        },
        type: {
            type: String,
            enum: ['flat', 'tiered'],
            required: true,
        },
        flat: {
            mode: { type: String, enum: ['percentage', 'fixed'] },
            value: { type: Number, min: 0 },
        },
        tiers: {
            type: [tierSchema],
            default: [],
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const CommissionStructure = model('CommissionStructure', commissionStructureSchema);
export default CommissionStructure;