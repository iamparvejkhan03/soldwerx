import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
    {
        // Reference to the auction being paid for
        auction: {
            type: Schema.Types.ObjectId,
            ref: 'Auction',
            required: true,
        },
        // Bidder who is making the payment
        bidder: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Original bid amount (winning bid or agreed price)
        bidAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        // Commission amount (if any)
        commissionAmount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        // Total amount = bidAmount + commissionAmount
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        // Payment status
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
            default: 'pending',
        },
        // Payment type – always bank_transfer for this model
        type: {
            type: String,
            enum: ['bank_transfer_payment'],
            default: 'bank_transfer_payment',
        },
        // Payment method – could be extended later
        paymentMethod: {
            type: String,
            enum: ['bank_transfer'],
            default: 'bank_transfer',
        },
        // Bank transfer specific fields
        transactionReference: {
            type: String,
            trim: true,
        },
        // Proof of payment – uploaded file(s)
        proofOfPayment: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                filename: { type: String, required: true },
                originalName: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        // Notes from admin or seller about the payment
        notes: {
            type: String,
            trim: true,
        },
        // Who processed/completed the payment (admin)
        processedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        // Date when payment was completed
        completedAt: {
            type: Date,
        },
        // Optional: invoice reference
        invoiceReference: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
// paymentSchema.index({ auction: 1 });
paymentSchema.index({ bidder: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = model('Payment', paymentSchema);

export default Payment;