import { Schema, model } from 'mongoose';

/**
 * GLOBAL commission settings (a single document).
 * For each side (buyer / seller) the admin picks one CommissionStructure
 * and can enable or disable the commission for that side.
 *
 * The old fields (buyerType, buyerValue, sellerType, sellerValue) have been removed.
 * They are cleaned out of the existing document automatically the first time
 * getGlobalCommissionSettings() runs (see utils/commissionCalculator.js).
 */
const commissionSchema = new Schema(
    {
        // Buyer (bidder) commission
        buyerEnabled: {
            type: Boolean,
            default: true,
        },
        buyerStructure: {
            type: Schema.Types.ObjectId,
            ref: 'CommissionStructure',
        },

        // Seller commission
        sellerEnabled: {
            type: Boolean,
            default: true,
        },
        sellerStructure: {
            type: Schema.Types.ObjectId,
            ref: 'CommissionStructure',
        },

        // Metadata
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// Ensure only one document exists
commissionSchema.pre('save', async function (next) {
    const count = await this.constructor.countDocuments();
    if (count > 0 && this.isNew) {
        return next(new Error('Only one commission document is allowed.'));
    }
    next();
});

const Commission = model('Commission', commissionSchema);
export default Commission;