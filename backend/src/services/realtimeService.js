import { getIO } from "../utils/socket.js";

const TICK_FIELDS = [
    "_id",
    "status",
    "auctionType",
    "currentPrice",
    "bidCount",
    "currentBidder",
    "winner",
    "finalPrice",
    "startDate",
    "endDate",
    "lastBidTime",
    "reservePrice",
    "buyNowPrice",
    "watchlistCount",
    "paymentStatus",
    "updatedAt",
];

const pick = (obj, keys) => {
    const out = {};
    for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
    return out;
};

/**
 * Re-fetches the auction with populated refs, then:
 *   - emits a lightweight "auction:tick" to all clients (home/list pages)
 *   - emits the full auction to the room "auction:<id>" (detail page)
 *
 * Fire-and-forget safe. Call without await.
 */
export const broadcastAuctionChange = async (auctionId) => {
    const io = getIO();
    if (!io || !auctionId) return;

    try {
        const { default: Auction } = await import("../models/auction.model.js");

        const auction = await Auction.findById(auctionId)
            .populate("seller", "username firstName lastName companyName")
            .populate("currentBidder", "username firstName lastName")
            .populate("winner", "username firstName lastName")
            .populate("bids.bidder", "username firstName lastName")
            .populate("offers.buyer", "username firstName lastName")
            .lean();

        if (!auction) return;

        // One stamp for both emits so the two payloads agree.
        const serverTime = Date.now();

        // 1) Lightweight tick for every connected client
        io.to("global").emit("auction:tick", {
            ...pick(auction, TICK_FIELDS),
            serverTime,
        });

        // 2) Full doc for the single-auction page
        io.to(`auction:${auctionId}`).emit("auction:update", {
            serverTime,
            auction,
        });
    } catch (err) {
        console.error("broadcastAuctionChange error:", err);
    }
};

export const broadcastAuctionRemoved = (auctionId) => {
    const io = getIO();
    if (!io || !auctionId) return;

    const payload = { _id: String(auctionId) };
    io.to("global").emit("auction:removed", payload);
    io.to(`auction:${auctionId}`).emit("auction:removed", payload);
};