import Auction from "../models/auction.model.js";
import { placeBidDirect } from "../controllers/auction.controller.js";
import { sendOutbidNotifications } from "../utils/nodemailer.js";

/**
 * Process all active proxy bids for an auction.
 *
 * Called after every bid (manual or proxy) so all proxies get re-evaluated.
 * Also fires outbid emails to users whose top-bidder status is taken by a
 * proxy-driven bid — which is the path the manual `placeBid` controller
 * does NOT cover.
 */
export const processProxyBids = async (auctionId) => {
    // Shared across all recursive passes so we never email the same user twice.
    const notifiedUsers = new Set();
    await runProxyBidPass(auctionId, notifiedUsers);
};

const runProxyBidPass = async (auctionId, notifiedUsers) => {
    try {
        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status !== "active") return;

        const activeProxyBids = auction.proxyBids
            .filter((pb) => pb.isActive)
            .sort((a, b) => b.maxAmount - a.maxAmount);

        if (activeProxyBids.length === 0) return;

        let highestBidder = auction.currentBidder
            ? auction.currentBidder.toString()
            : null;
        let highestBid = auction.currentPrice;
        let placedAny = false;

        for (const proxyBid of activeProxyBids) {
            const bidderId = proxyBid.bidder.toString();

            // Skip if this bidder is already on top
            if (highestBidder && highestBidder === bidderId) continue;

            const nextBid = highestBid + auction.bidIncrement;
            if (proxyBid.maxAmount < nextBid) continue;

            // Who is about to lose the top spot?
            const outbidUserId = highestBidder;

            await placeBidDirect(
                auctionId,
                proxyBid.bidder,
                proxyBid.bidderUsername,
                nextBid,
                proxyBid._id
            );

            // Notify the user who was just outbid — once per cascade.
            if (
                outbidUserId &&
                outbidUserId !== bidderId &&
                !notifiedUsers.has(outbidUserId)
            ) {
                notifiedUsers.add(outbidUserId);
                // Fire-and-forget so we don't block the bid loop on SMTP.
                notifyOutbid(
                    auctionId,
                    outbidUserId,
                    bidderId,
                    nextBid
                ).catch((err) =>
                    console.error("Outbid notification failed:", err)
                );
            }

            highestBidder = bidderId;
            highestBid = nextBid;
            placedAny = true;
        }

        // Cascade: a new top bidder might now be beatable by other proxies.
        if (placedAny) {
            await runProxyBidPass(auctionId, notifiedUsers);
        }
    } catch (error) {
        console.error("Process proxy bids error:", error);
        throw error;
    }
};

/**
 * Send an outbid notification to a single user.
 * Reuses the existing `sendOutbidNotifications` helper — we just pass a
 * one-user list so only that person gets the email.
 */
const notifyOutbid = async (auctionId, outbidUserId, newBidderId, newAmount) => {
    try {
        const auction = await Auction.findById(auctionId).populate(
            "seller",
            "username firstName lastName"
        );
        if (!auction) return;

        await sendOutbidNotifications(
            auction,
            outbidUserId,
            [outbidUserId],           // notify only this user
            newBidderId.toString(),   // excluded from notification (they're the winner)
            newAmount
        );
    } catch (err) {
        console.error("notifyOutbid failed:", err);
    }
};