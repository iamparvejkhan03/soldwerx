import { Schema, model } from 'mongoose';

const commissionSchema = new Schema(
    {
        // Buyer (bidder) commission settings
        buyerEnabled: {
            type: Boolean,
            default: true,
        },
        buyerType: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'percentage',
        },
        buyerValue: {
            type: Number,
            default: 5,
            min: 0,
        },

        // Seller commission settings
        sellerEnabled: {
            type: Boolean,
            default: true,
        },
        sellerType: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'percentage',
        },
        sellerValue: {
            type: Number,
            default: 5,
            min: 0,
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