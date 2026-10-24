import Agenda from "agenda";
import Auction from "../models/auction.model.js";
import backendAxios from "../utils/backendAxios.js";
import {
  cancelAllBidderAuthorizations,
  cancelLosingBidderAuthorizations,
  chargeWinningBidder,
  chargeWinningBidderDirect,
} from "../controllers/bidPayment.controller.js";
import { chargeWinnerDeposit } from "../controllers/deposit.controller.js";
import {
  auctionEndedAdminEmail,
  auctionEndingSoonEmail,
  auctionListedEmail,
  auctionWonAdminEmail,
  paymentCompletedEmail,
  paymentCompletedSellerEmail,
  paymentSuccessEmail,
  sendAuctionEndedSellerEmail,
  sendAuctionWonEmail,
  sendBulkAuctionNotifications,
  depositChargedWinnerEmail,
  depositFailedWinnerEmail,
  depositFailedAdminEmail,
  depositChargedAdminEmail,
} from "../utils/nodemailer.js";
import User from "../models/user.model.js";
import { processProxyBids } from "./proxyBidService.js";
import { generateAndAttachInvoice } from "./invoiceService.js";
import { broadcastAuctionChange } from "./realtimeService.js";
import {
  notifyUser,
  createBulkNotifications,
  notifyAdminsAndStaffWithPermission,
} from './notificationService.js';
import Watchlist from "../models/watchlist.model.js";

class AgendaService {
  constructor() {
    this.agenda = new Agenda({
      db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
      processEvery: "30 seconds", // Check for due jobs every 30 seconds
    });

    this.defineJobs();
  }

  defineJobs() {
    // Job to activate an auction at its start time
    this.agenda.define("activate auction", async (job) => {
      const { auctionId } = job.attrs.data;

      try {
        const auction = await Auction.findById(auctionId);
        if (auction && auction.status === "approved") {
          auction.status = "active";
          await auction.save();
          await auction.populate("seller", "email username firstName userType emailPreferences");
          broadcastAuctionChange(auction._id);

          // Send email to seller
          auctionListedEmail(auction, auction.seller).catch(err => console.error(`Failed to send auction listed email to seller: `, err));

          // Send bulk notifications to all users (except admin, bidder, and auction seller)
          const allUsers = await User.find({
            _id: { $ne: auction.seller._id },       // Exclude auction owner
            userType: { $nin: ["admin", "seller", "staff", "broker"] }, // Exclude admin and bidder users
            isActive: true,                          // Only active users
          }).select("email username firstName userType emailPreferences");

          // In-app: notify seller + broadcast to interested bidders
          notifyUser(auction.seller._id || auction.seller, 'AUCTION_LISTED', {
            title: `Your listing is live — "${auction.title}"`,
            message: `Bidding is now open.`,
            actionUrl: `/auction/${auction._id}`,
            relatedEntity: { type: 'Auction', id: auction._id },
          }).catch((err) => console.error('notify AUCTION_LISTED (agenda):', err));

          // Send bulk notifications
          sendBulkAuctionNotifications(allUsers, auction, auction.seller)
            .catch((err) => console.error('sendBulkAuctionNotifications error:', err));

          // console.log(`✅ Agenda: Activated auction ${auctionId}`);
        }
      } catch (error) {
        console.error("Agenda job error (activate auction):", error);
        // Job will retry based on Agenda's retry logic
      }
    });

    this.agenda.define("end auction", async (job) => {
      const { auctionId } = job.attrs.data;

      try {
        let auction = await Auction.findById(auctionId).populate(
          "seller",
          "email phone username firstName userType emailPreferences",
        );
        // Don't populate winner initially since it might be null

        if (!auction) {
          console.log(`❌ Agenda: Auction ${auctionId} not found`);
          return;
        }

        // NEW: Skip ending for giveaways - they should only end when claimed
        // Skip ending for always-available auctions (buy_now and giveaway)
        if (
          auction.auctionType === "buy_now" ||
          auction.auctionType === "giveaway"
        ) {
          console.log(
            `🛒 Auction ${auctionId} is ${auction.auctionType} - skipping auto-end (waiting for purchase)`,
          );
          return;
        }

        // Only process if auction is still active and end date has passed
        if (auction.status === "active" && new Date() >= auction.endDate) {
          // CRITICAL CHECK: Skip if auction already has a winner (means offer was accepted or buy now used)
          if (auction.winner) {
            console.log(
              `ℹ️ Agenda: Auction ${auctionId} already has a winner, skipping automated ending`,
            );
            return;
          }

          // CRITICAL CHECK: Skip if auction status is already sold
          const soldStatuses = ["sold", "sold_buy_now"];
          if (soldStatuses.includes(auction.status)) {
            console.log(
              `ℹ️ Agenda: Auction ${auctionId} is already in sold status (${auction.status}), skipping`,
            );
            return;
          }

          // Check if any offer is accepted
          const hasAcceptedOffer =
            auction.offers &&
            auction.offers.some(
              (offer) =>
                offer.status === "accepted" || offer.status === "completed",
            );

          if (hasAcceptedOffer) {
            console.log(
              `ℹ️ Agenda: Auction ${auctionId} has accepted offer, skipping automated ending`,
            );
            return;
          }

          console.log(`✅ Agenda: Ending auction ${auctionId}`);

          await processProxyBids(auctionId);

          // Use the model's endAuction method to handle the business logic
          const result = await auction.endAuction();

          broadcastAuctionChange(auctionId);

          // Re-fetch the auction with populated winner if it was sold
          if (result.wasSold) {
            auction = await Auction.findById(auctionId)
              .populate("seller", "email phone username firstName userType emailPreferences")
              .populate("winner", "email phone username firstName address userType emailPreferences");
          }

          // Send appropriate emails based on the result
          if (result.wasSold) {
            console.log(
              `✅ Agenda: Auction ${auctionId} was SOLD to ${auction.winner ? auction.winner.username : "unknown"
              }`,
            );

            // Send auction won email to buyer
            // await sendAuctionWonEmail(auction);

            // Send admin email for sold auction
            const adminUsers = await User.find({ userType: "admin" });
            for (const admin of adminUsers) {
              auctionWonAdminEmail(admin, auction, auction.winner).catch((err) =>
                console.error(`Failed to send auction won email to ${admin?.email}: `, err)
              );
            }

            // Send seller email (auction ended without sale)
            sendAuctionEndedSellerEmail(auction).catch((err) =>
              console.error(`Failed to send auction ended email to seller: `, err)
            );

            // ─── In-app notifications ────────────────────────
            if (auction.winner) {
              notifyUser(auction.winner._id, 'AUCTION_WON', {
                title: 'You won the auction!',
                message: `"${auction.title}" is yours for $${(auction.finalPrice || 0).toLocaleString()}.`,
                actionUrl: `/bidder/auctions/won`,
                relatedEntity: { type: 'Auction', id: auction._id },
                metadata: { finalPrice: auction.finalPrice },
              }).catch((err) => console.error('notify AUCTION_WON (agenda):', err));
            }

            notifyUser(auction.seller._id, 'AUCTION_ENDED_SOLD', {
              title: `Your item sold — "${auction.title}"`,
              message: `Final price: $${(auction.finalPrice || 0).toLocaleString()}`,
              actionUrl: `/seller/auctions/sold`,
              relatedEntity: { type: 'Auction', id: auction._id },
            }).catch((err) => console.error('notify AUCTION_ENDED_SOLD (agenda):', err));

            notifyAdminsAndStaffWithPermission('ADMIN_AUCTION_WON', {
              title: `Auction sold — "${auction.title}"`,
              message: `$${(auction.finalPrice || 0).toLocaleString()}`,
              actionUrl: `/admin/transactions`,
              relatedEntity: { type: 'Auction', id: auction._id },
            }).catch((err) => console.error('notify ADMIN_AUCTION_WON (agenda):', err));

            console.log(`✅ Agenda: Sent SOLD emails for auction ${auctionId}`);
          } else {
            console.log(
              `✅ Agenda: Auction ${auctionId} ended without sale (status: ${result.newStatus})`,
            );

            // Send seller email (auction ended without sale)
            sendAuctionEndedSellerEmail(auction).catch((err) =>
              console.error(`Failed to send auction ended email to seller: `, err)
            );

            // Send admin email for ended auction
            const adminUsers = await User.find({ userType: "admin" });
            for (const admin of adminUsers) {
              auctionEndedAdminEmail(admin, auction).catch((err) =>
                console.error(`Failed to send auction ended admin email to ${admin?.email}: `, err)
              );
            }

            notifyUser(auction.seller._id, 'AUCTION_ENDED_NO_SALE', {
              title: `Auction ended — "${auction.title}"`,
              message: auction.status === 'reserve_not_met'
                ? 'Reserve price was not met.'
                : 'Auction ended without a sale.',
              actionUrl: `/seller/auctions/all`,
              relatedEntity: { type: 'Auction', id: auction._id },
              metadata: { status: result.newStatus },
            }).catch((err) => console.error('notify AUCTION_ENDED_NO_SALE:', err));

            notifyAdminsAndStaffWithPermission('ADMIN_AUCTION_ENDED_NO_SALE', {
              title: `Auction ended without sale — "${auction.title}"`,
              message: result.newStatus === 'reserve_not_met'
                ? `Reserve price was not met. No buyer.`
                : `No bids received. Auction ended.`,
              actionUrl: `/admin/auctions/all?filter=ended`,
              relatedEntity: { type: 'Auction', id: auction._id },
              metadata: {
                status: result.newStatus,
                finalPrice: auction.finalPrice || 0,
                bidCount: auction.bidCount || 0,
              },
            }).catch((err) => console.error('notify ADMIN_AUCTION_ENDED_NO_SALE (agenda):', err));

            console.log(
              `✅ Agenda: Sent ENDED emails for auction ${auctionId}`,
            );
          }
        } else if (
          auction.status === "active" &&
          new Date() < auction.endDate
        ) {
          // Auction was extended, reschedule the job
          await this.scheduleAuctionEnd(auctionId, auction.endDate);
          broadcastAuctionChange(auctionId);
          console.log(
            `🔄 Agenda: Rescheduled auction ${auctionId} to ${auction.endDate}`,
          );
        } else {
          console.log(
            `ℹ️ Agenda: Auction ${auctionId} status is ${auction.status}, skipping`,
          );
        }
      } catch (error) {
        console.error("Agenda job error (end auction):", error);
      }
    });

    // Job to send a 30-second "auction ending" warning to engaged users
    this.agenda.define("auction 30s left", async (job) => {
      const { auctionId } = job.attrs.data;

      try {
        const auction = await Auction.findById(auctionId)
          .populate("seller", "_id username firstName lastName")
          .lean();

        if (!auction) return;

        // ── Skip conditions ────────────────────────────────
        if (auction.status !== "active") return;

        const now = Date.now();
        const endMs = new Date(auction.endDate).getTime();

        // Auction already ended
        if (endMs <= now) return;

        // Extended past the warning window — the auction was rescheduled
        // and a fresh job has been scheduled for the new end time.
        if (endMs - now > 60_000) return;

        // Already sent (safety net)
        if (auction.notifications?.ending30sec) return;

        // No bids = nothing exciting to warn about
        if (!auction.bidCount || auction.bidCount === 0) return;

        // ── Build recipient list: bidders + watchers ───────
        const bidderIds = [
          ...new Set(
            (auction.bids || [])
              .map((b) => b.bidder?.toString())
              .filter(Boolean)
          ),
        ];

        const watcherDocs = await Watchlist.find({ auction: auctionId })
          .select("user")
          .lean();
        const watcherIds = watcherDocs
          .map((w) => w.user?.toString())
          .filter(Boolean);

        // Merge, dedupe, exclude the seller
        const sellerId = auction.seller?._id?.toString();
        const recipientSet = new Set([...bidderIds, ...watcherIds]);
        if (sellerId) recipientSet.delete(sellerId);

        if (recipientSet.size === 0) {
          // Nothing to do, but mark so we don't retry
          await Auction.updateOne(
            { _id: auctionId },
            {
              $set: {
                "notifications.ending30sec": true,
                "notifications.ending30secSentAt": new Date(),
              },
            }
          );
          return;
        }

        // ── Fire in-app notifications ──────────────────────
        await createBulkNotifications([...recipientSet], "AUCTION_30S_LEFT", {
          title: `⏰ 30 seconds left — "${auction.title}"`,
          message: `Current bid: $${(auction.currentPrice || 0).toLocaleString()} — place your bid now!`,
          actionUrl: `/auction/${auction._id}`,
          relatedEntity: { type: "Auction", id: auction._id },
          metadata: {
            auctionId: auction._id,
            currentPrice: auction.currentPrice,
            bidCount: auction.bidCount,
          },
        });

        // ── Mark as sent ───────────────────────────────────
        await Auction.updateOne(
          { _id: auctionId },
          {
            $set: {
              "notifications.ending30sec": true,
              "notifications.ending30secSentAt": new Date(),
            },
          }
        );

        console.log(
          `⏰ Sent 30s warnings for "${auction.title}" to ${recipientSet.size} users`
        );
      } catch (err) {
        console.error("Agenda job error (auction 30s left):", err);
      }
    });

    // Job to send notifications for auctions ending soon
    this.agenda.define("send ending soon notifications", async (job) => {
      try {
        const now = new Date();

        // Define multiple time thresholds
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const twentyFourHoursFromNow = new Date(
          now.getTime() + 24 * 60 * 60 * 1000,
        );

        // Find auctions ending within our thresholds that haven't had notifications sent yet
        const endingSoonAuctions = await Auction.find({
          status: "active",
          $or: [
            {
              // Ending in exactly 30 minutes (±15 minutes window)
              endDate: {
                $lte: thirtyMinutesFromNow,
                $gte: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes from now
              },
              "notifications.ending30min": { $ne: true }, // Not sent yet
            },
            {
              // Ending in exactly 2 hours (±15 minutes window)
              endDate: {
                $lte: twoHoursFromNow,
                $gte: new Date(now.getTime() + 105 * 60 * 1000), // 1 hour 45 minutes from now
              },
              "notifications.ending2hour": { $ne: true }, // Not sent yet
            },
            {
              // Ending in exactly 24 hours (±15 minutes window)
              endDate: {
                $lte: twentyFourHoursFromNow,
                $gte: new Date(now.getTime() + 1425 * 60 * 1000), // 23 hours 45 minutes from now
              },
              "notifications.ending24hour": { $ne: true }, // Not sent yet
            },
          ],
        }).populate("seller", "email username userType emailPreferences"); // Populate seller to exclude them

        for (const auction of endingSoonAuctions) {
          // Calculate exact time remaining for this auction
          const timeRemaining = auction.endDate - now;
          const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));

          // Determine which notification threshold this auction falls into
          let notificationType, timeLabel;

          if (minutesRemaining <= 45 && minutesRemaining >= 15) {
            // 30-minute notification window (30 minutes ±15 minutes)
            notificationType = "ending30min";
            timeLabel = "30 minutes";
          } else if (minutesRemaining <= 135 && minutesRemaining >= 105) {
            // 2-hour notification window (2 hours ±15 minutes)
            notificationType = "ending2hour";
            timeLabel = "2 hours";
          } else if (minutesRemaining <= 1455 && minutesRemaining >= 1425) {
            // 24-hour notification window (24 hours ±15 minutes)
            notificationType = "ending24hour";
            timeLabel = "24 hours";
          } else {
            // Skip if not in any precise notification window
            continue;
          }

          // Find ALL users who should receive notifications (excluding auction seller, admins, and opted-out users)
          const allUsers = await User.find({
            _id: { $ne: auction.seller._id }, // Exclude auction owner
            userType: { $nin: ["admin", "seller", "broker"] }, // Exclude admin, seller, and broker users
            isActive: true, // Only active users
          }).select("email username userType emailPreferences");

          // Send to each user
          for (const user of allUsers) {
            try {
              auctionEndingSoonEmail(
                user,
                auction,
                timeLabel,
              ).catch((err) =>
                console.error(`Failed to auction ending soon email to ${user?.email}: `, err)
              );

              // In-app: only notify users who've actually engaged with this auction
              const hasBid = (auction.bids || []).some(
                (b) => b.bidder?.toString() === user._id.toString()
              );
              if (hasBid) {
                notifyUser(user._id, 'AUCTION_ENDING_SOON', {
                  title: `"${auction.title}" ends in ${timeLabel}`,
                  message: `Current price: $${auction.currentPrice.toLocaleString()}`,
                  actionUrl: `/auction/${auction._id}`,
                  relatedEntity: { type: 'Auction', id: auction._id },
                  dedupKey: `ending-soon:${auction._id}:${notificationType}`,
                }).catch((err) => console.error('notify AUCTION_ENDING_SOON:', err));
              }
              console.log(
                `✅ Sent ${timeLabel} notification to ${user.email} (${user.userType}) for auction ${auction.title}`,
              );
            } catch (error) {
              console.error(
                `Failed to send ending soon email to ${user.email}:`,
                error,
              );
            }
          }

          // Mark this notification as sent in the auction document
          await Auction.findByIdAndUpdate(auction._id, {
            $set: {
              [`notifications.${notificationType}`]: true,
              [`notifications.${notificationType}SentAt`]: new Date(),
            },
          });

          console.log(
            `📧 Sent ${timeLabel} notifications for auction "${auction.title}" to ${allUsers.length} users`,
          );
        }

        console.log(
          `📧 Completed ending soon notifications for ${endingSoonAuctions.length} auctions`,
        );
      } catch (error) {
        console.error("Agenda job error (ending soon notifications):", error);
      }
    });

    this.agenda.define("generate invoice and email", async (job) => {
      const { auctionId } = job.attrs.data;

      try {
        // ---- 1. Charge the 5% winning deposit BEFORE the invoice ----
        const depositResult = await chargeWinnerDeposit(auctionId);
        console.log(
          `🎯 Deposit job for auction ${auctionId}: ${depositResult.status}` +
          (depositResult.amount ? ` ($${depositResult.amount})` : "")
        );

        // ---- 2. Reload auction (deposit fields now populated) ----
        let auction = await Auction.findById(auctionId)
          .populate("seller")
          .populate("winner");

        // ---- 3. Generate the invoice PDF (includes deposit credit if charged) ----
        await generateAndAttachInvoice(auctionId);

        // ---- 4. Reload again to pick up invoice URL ----
        auction = await Auction.findById(auctionId)
          .populate("seller")
          .populate("winner");

        // ---- 5. Send the winner their "You Won" email (invoice attached) ----
        sendAuctionWonEmail(auction).catch(err => console.error(`Failed to send auction won winner email: `, err));

        // ---- 6. Deposit-specific notifications ----
        if (depositResult.status === "charged") {
          depositChargedWinnerEmail(
            auction.winner,
            auction,
            depositResult.amount
          ).catch(err => console.error(`Failed to send deposit charge winner email: `, err));

          notifyUser(auction.winner._id, 'DEPOSIT_CHARGED', {
            title: 'Winning deposit received',
            message: `$${depositResult.amount.toLocaleString()} charged — credited to your final balance.`,
            actionUrl: `/bidder/payments`,
            relatedEntity: { type: 'Auction', id: auction._id },
            metadata: { amount: depositResult.amount },
          }).catch((err) => console.error('notify DEPOSIT_CHARGED:', err));

          notifyAdminsAndStaffWithPermission('ADMIN_DEPOSIT_CHARGED', {
            title: `Deposit charged — "${auction.title}"`,
            message: `$${depositResult.amount.toLocaleString()} from ${auction.winner?.username}`,
            actionUrl: `/admin/transactions`,
            relatedEntity: { type: 'Auction', id: auction._id },
          }).catch((err) => console.error('notify ADMIN_DEPOSIT_CHARGED:', err));

          const adminUsers = await User.find({ userType: "admin" });
          for (const admin of adminUsers) {
            depositChargedAdminEmail(
              admin,
              auction,
              depositResult.amount
            ).catch(err => console.error(`Failed to send deposit charged admin email`, err));
          }
        } else if (depositResult.status === "failed") {
          // Notify winner
          depositFailedWinnerEmail(
            auction.winner,
            auction,
            depositResult.reason
          ).catch(err => console.error(`Failed to send deposit failed winner email: `, err));

          notifyUser(auction.winner._id, 'DEPOSIT_FAILED', {
            title: 'Deposit charge failed',
            message: `Reason: ${depositResult.reason}. Please update your payment method.`,
            actionUrl: `/bidder/billing`,
            relatedEntity: { type: 'Auction', id: auction._id },
            metadata: { reason: depositResult.reason },
          }).catch((err) => console.error('notify DEPOSIT_FAILED:', err));

          notifyAdminsAndStaffWithPermission('ADMIN_DEPOSIT_FAILED', {
            title: `Deposit failed — "${auction.title}"`,
            message: `Reason: ${depositResult.reason}`,
            actionUrl: `/admin/transactions`,
            relatedEntity: { type: 'Auction', id: auction._id },
          }).catch((err) => console.error('notify ADMIN_DEPOSIT_FAILED:', err));

          // Notify all admins
          const adminUsers = await User.find({ userType: "admin" });
          for (const admin of adminUsers) {
            depositFailedAdminEmail(
              admin,
              auction,
              depositResult.reason
            ).catch(err => console.error(`Failed to send deposit failed winner email: `, err));
          }
        }
      } catch (error) {
        console.error("generate invoice and email job error: ", error);
      }
    });

    // In defineJobs()
    this.agenda.define("update invoice on payment complete", async (job) => {
      const { auctionId, updatedBy } = job.attrs.data;

      const auction = await Auction.findById(auctionId)
        .populate('seller')
        .populate('winner');

      if (!auction) return;

      // Generate updated invoice (replaces old one)
      await generateAndAttachInvoice(auctionId, {
        updated: true,
        oldPublicId: auction.invoice?.publicId,
        updatedBy,
      });

      // Re-fetch auction to get updated invoice URL
      const updatedAuction = await Auction.findById(auctionId)
        .populate('seller')
        .populate('winner');

      // Send emails with the updated invoice
      paymentCompletedEmail(updatedAuction.winner, updatedAuction).catch(err => console.error(`Failed to send payment completed email to winner: `, err));
      paymentCompletedSellerEmail(updatedAuction.seller, updatedAuction, updatedAuction.winner).catch(err => console.error(`Failed to send payment completed email to seller: `, err));

      // ─── In-app notifications ────────────────────────
      if (updatedAuction.winner?._id) {
        notifyUser(updatedAuction.winner._id, 'PAYMENT_CONFIRMED', {
          title: 'Payment confirmed',
          message: `Your payment for "${updatedAuction.title}" is confirmed.`,
          actionUrl: `/bidder/payments`,
          relatedEntity: { type: 'Auction', id: updatedAuction._id },
        }).catch((err) => console.error('notify PAYMENT_CONFIRMED (invoice):', err));
      }
      if (updatedAuction.seller?._id) {
        notifyUser(updatedAuction.seller._id, 'BUYER_PAID', {
          title: `Buyer paid — "${updatedAuction.title}"`,
          message: 'Funds are ready for payout.',
          actionUrl: `/seller/payouts`,
          relatedEntity: { type: 'Auction', id: updatedAuction._id },
        }).catch((err) => console.error('notify BUYER_PAID (invoice):', err));
      }

    });
  }

  // Schedule auction activation job
  async scheduleAuctionActivation(auctionId, startDate) {
    await this.agenda.schedule(startDate, "activate auction", { auctionId });
    // console.log(`📅 Scheduled activation for auction ${auctionId} at ${startDate}`);
  }

  // Schedule auction ending job
  async scheduleAuctionEnd(auctionId, endDate) {
    await this.agenda.schedule(endDate, "end auction", { auctionId });
    // console.log(`📅 Scheduled ending for auction ${auctionId} at ${endDate}`);

    // Also schedule the 30-second warning job (if the auction ends far
    // enough in the future that the warning moment is still ahead of us).
    const endMs = new Date(endDate).getTime();
    const warnAt = new Date(endMs - 30 * 1000);

    // Only schedule if the warning time is >5s from now. Anything closer
    // means the auction is ending immediately — no useful warning window.
    if (warnAt.getTime() > Date.now() + 5000) {
      await this.agenda.schedule(warnAt, "auction 30s left", { auctionId });
    }
  }

  // Cancel jobs if auction is deleted or modified
  async cancelAuctionJobs(auctionId) {
    await this.agenda.cancel({
      "data.auctionId": auctionId,
    });
    console.log(`🗑️ Cancelled jobs for auction ${auctionId}`);
  }

  async scheduleInvoiceGeneration(auctionId) {
    await this.agenda.now("generate invoice and email", { auctionId });
  }

  async scheduleInvoiceUpdate(auctionId, updatedBy) {
    await this.agenda.now("update invoice on payment complete", { auctionId, updatedBy });
  }

  // Start Agenda
  async start() {
    await this.agenda.start();
    console.log("🕒 Agenda service started");
    await this.agenda.every("15 minutes", "send ending soon notifications");
  }

  // Graceful shutdown
  async stop() {
    await this.agenda.stop();
    console.log("🛑 Agenda service stopped");
  }
}

export default new AgendaService();
