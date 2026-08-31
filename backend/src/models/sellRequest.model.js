import { Schema, model } from 'mongoose';

const sellRequestSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    itemType: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    preferredMethod: {
        type: String,
        enum: ['auction', 'buy-it-now', 'not-sure'],
        default: 'not-sure'
    },
    photos: [{
        url: String,
        publicId: String
    }],
    status: {
        type: String,
        enum: ['new', 'in-review', 'contacted', 'approved', 'listed', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    estimatedValue: {
        type: Number,
        min: 0
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
sellRequestSchema.index({ status: 1, createdAt: -1 });
sellRequestSchema.index({ email: 1, createdAt: -1 });
sellRequestSchema.index({ preferredMethod: 1 });

// Virtual for request ID
sellRequestSchema.virtual('requestId').get(function () {
    return `SRQ${this._id.toString().slice(-6).toUpperCase()}`;
});

const SellRequest = model('SellRequest', sellRequestSchema);

export default SellRequest;