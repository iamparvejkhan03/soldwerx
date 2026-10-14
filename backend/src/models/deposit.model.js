import { Schema, model } from 'mongoose';

const depositSchema = new Schema(
    {
        auction: {
            type: Schema.Types.ObjectId,
            ref: 'Auction',
            required: true,
        },
        bidder: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentIntentId: {
            type: String,
            required: true,
        },
        clientSecret: {
            type: String,
        },
        status: {
            type: String,
            enum: [
                'created',
                'succeeded',
                'processing_failed',
                'canceled',
                'refunded',
            ],
            default: 'created',
        },
        chargeAttempted: {
            type: Boolean,
            default: false,
        },
        chargeSucceeded: {
            type: Boolean,
            default: false,
        },
        failureReason: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

depositSchema.index({ auction: 1 });
depositSchema.index({ bidder: 1 });
depositSchema.index({ paymentIntentId: 1 });
depositSchema.index({ status: 1 });

const Deposit = model('Deposit', depositSchema);

export default Deposit;