import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderRole: {
            type: String,
            enum: ["seller", "bidder", "admin"],
            required: true,
        },
        content: {
            type: String,
            trim: true,
            default: "",
        },
        attachments: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                filename: { type: String, required: true },
                originalName: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const communicationSchema = new mongoose.Schema(
    {
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auction",
            required: true,
            unique: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        winningBidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        messages: [messageSchema],
        shippingInfo: {
            company: { type: String, trim: true },
            trackingNumber: { type: String, trim: true },
            estimatedDelivery: { type: Date },
            notes: { type: String, trim: true },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            updatedAt: { type: Date },
        },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// communicationSchema.index({ auction: 1 });
communicationSchema.index({ lastMessageAt: -1 });

const Communication = mongoose.model("Communication", communicationSchema);
export default Communication;