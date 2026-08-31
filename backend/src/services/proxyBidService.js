import Auction from "../models/auction.model.js";
import { placeBidDirect } from "../controllers/auction.controller.js";

/**
 * Process all active proxy bids for an auction.
 * This should be called after every bid (manual or proxy) to ensure all proxy bids are evaluated.
 */
export const processProxyBids = async (auctionId) => {
    try {
        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status !== "active") {
            return;
        }

        // Get all active proxy bids sorted by maxAmount descending
        const activeProxyBids = auction.proxyBids
            .filter(pb => pb.isActive)
            .sort((a, b) => b.maxAmount - a.maxAmount);

        if (activeProxyBids.length === 0) {
            return;
        }

        let highestBidder = auction.currentBidder ? auction.currentBidder.toString() : null;
        let highestBid = auction.currentPrice;

        // If no current bids, the starting price is the baseline
        if (auction.bidCount === 0) {
            // The first bid will be at startPrice, but we need to know who should get it.
            // The highest maxAmount will place the first bid.
        }

        // We'll iterate through proxy bids and place bids when possible.
        // To avoid infinite loops, we'll only place one bid per proxy per cycle.
        let placedAny = false;

        for (const proxyBid of activeProxyBids) {
            const bidderId = proxyBid.bidder.toString();

            // Skip if this bidder is already the highest bidder
            if (highestBidder && highestBidder === bidderId) {
                continue;
            }

            // Calculate the next bid required to outbid the current highest
            const nextBid = highestBid + auction.bidIncrement;

            // Check if this proxy bid can afford the next bid
            if (proxyBid.maxAmount >= nextBid) {
                // Place the bid
                await placeBidDirect(
                    auctionId,
                    proxyBid.bidder,
                    proxyBid.bidderUsername,
                    nextBid,
                    proxyBid._id
                );

                // Update highestBidder and highestBid for subsequent iterations
                highestBidder = bidderId;
                highestBid = nextBid;
                placedAny = true;
            }
        }

        // If we placed any bids, we need to re-run the processing to handle cascading
        // (e.g., if a new highest bidder is set, other proxy bids might now be outbid)
        if (placedAny) {
            // Recursively process again to catch any further bids
            await processProxyBids(auctionId);
        }

    } catch (error) {
        console.error("Process proxy bids error:", error);
        throw error;
    }
};