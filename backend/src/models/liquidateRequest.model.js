import { Schema, model } from 'mongoose';

const liquidateRequestSchema = new Schema({
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
    description: {
        type: String,
        required: true,
        trim: true
    },
    itemCount: {
        type: String,
        trim: true
    },
    timeline: {
        type: String,
        trim: true
    },
    photos: [{
        url: String,
        publicId: String
    }],
    status: {
        type: String,
        enum: ['new', 'in-progress', 'evaluating', 'approved', 'completed', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    response: {
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
liquidateRequestSchema.index({ status: 1, createdAt: -1 });
liquidateRequestSchema.index({ email: 1, createdAt: -1 });
liquidateRequestSchema.index({ priority: 1 });

// Virtual for request ID
liquidateRequestSchema.virtual('requestId').get(function () {
    return `LRQ${this._id.toString().slice(-6).toUpperCase()}`;
});

const LiquidateRequest = model('LiquidateRequest', liquidateRequestSchema);

export default LiquidateRequest;