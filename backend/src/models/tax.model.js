import { Schema, model } from 'mongoose';

const taxSchema = new Schema(
    {
        enabled: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ['fixed', 'percentage'],
            default: 'percentage',
        },
        value: {
            type: Number,
            default: 0,
            min: 0,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// Ensure only one tax setting document exists
taxSchema.pre('save', async function (next) {
    const count = await this.constructor.countDocuments();
    if (count > 0 && this.isNew) {
        return next(new Error('Only one tax setting document is allowed.'));
    }
    next();
});

const Tax = model('Tax', taxSchema);
export default Tax;