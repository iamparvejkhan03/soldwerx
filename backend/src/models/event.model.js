import { model, Schema } from "mongoose";

const eventSchema = new Schema(
    {
        // Basic Event Info
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            trim: true,
        },
        eventDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },

        // Media
        photos: [
            {
                url: String,
                publicId: String,
                filename: String,
                order: { type: Number, default: 0 },
                caption: { type: String, default: "" },
            },
        ],
        documents: [
            {
                url: String,
                publicId: String,
                filename: String,
                originalName: String,
                caption: { type: String, default: "" },
            },
        ],

        // Creator
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdByUsername: {
            type: String,
            required: true,
        },
        createdByUserType: {
            type: String,
            enum: ["seller", "admin"],
            required: true,
        },

        // Assigned Auctions
        auctions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Auction",
            },
        ],

        // Status
        status: {
            type: String,
            enum: ["draft", "published", "cancelled", "completed"],
            default: "draft",
        },

        // Metadata
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better performance
eventSchema.index({ createdBy: 1, createdAt: -1 });
eventSchema.index({ status: 1, eventDate: 1 });
eventSchema.index({ "createdByUserType": 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual("isUpcoming").get(function () {
    return this.eventDate > new Date();
});

// Virtual for checking if event is ongoing
eventSchema.virtual("isOngoing").get(function () {
    const now = new Date();
    return this.eventDate <= now && (!this.endDate || this.endDate >= now);
});

// Virtual for checking if event is past
eventSchema.virtual("isPast").get(function () {
    return this.endDate ? this.endDate < new Date() : this.eventDate < new Date();
});

// Method to assign auctions to event
eventSchema.methods.assignAuctions = async function (auctionIds) {
    // Validate auction IDs exist and belong to the same seller/admin
    const Auction = model("Auction");
    const auctions = await Auction.find({
        _id: { $in: auctionIds },
        seller: this.createdBy,
    });

    if (auctions.length !== auctionIds.length) {
        throw new Error("Some auctions not found or do not belong to you");
    }

    // Add unique auctions
    const currentAuctionIds = this.auctions.map(id => id.toString());
    const newAuctionIds = auctionIds.filter(id => !currentAuctionIds.includes(id.toString()));

    this.auctions.push(...newAuctionIds);
    return this.save();
};

// Method to remove auctions from event
eventSchema.methods.removeAuctions = async function (auctionIds) {
    this.auctions = this.auctions.filter(
        id => !auctionIds.includes(id.toString())
    );
    return this.save();
};

const Event = model("Event", eventSchema);
export default Event;