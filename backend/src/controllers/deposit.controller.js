import Deposit from '../models/deposit.model.js';
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import { StripeService } from '../services/stripeService.js';

// ============================================================
// Charge 5% winning deposit off-session (max $5,000)
// Called by the "generate invoice and email" agenda job BEFORE
// the invoice is generated.
// ============================================================
export async function chargeWinnerDeposit(auctionId) {
    try {
        const auction = await Auction.findById(auctionId).populate('winner');
        if (!auction || !auction.winner) {
            return { status: 'skipped', reason: 'no_winner' };
        }

        if (!['sold', 'sold_buy_now'].includes(auction.status)) {
            return { status: 'skipped', reason: 'not_sold' };
        }

        const finalPrice = auction.finalPrice || auction.currentPrice || 0;
        if (auction.auctionType === 'giveaway' || finalPrice <= 0) {
            return { status: 'skipped', reason: 'no_price' };
        }

        // Idempotency — already charged?
        const existing = await Deposit.findOne({
            auction: auctionId,
            status: 'succeeded',
        });
        if (existing) {
            return {
                status: 'charged',
                amount: existing.amount,
                payment: existing,
                alreadyCharged: true,
            };
        }

        const depositAmount = Math.min(finalPrice * 0.05, 5000);
        const depositCents = Math.round(depositAmount * 100);
        if (depositCents <= 0) {
            return { status: 'skipped', reason: 'zero_deposit' };
        }

        const winner = await User.findById(auction.winner._id || auction.winner);
        if (!winner) {
            return { status: 'skipped', reason: 'winner_not_found' };
        }

        // Winner has no saved card → record failure, continue
        if (!winner.stripeCustomerId || !winner.paymentMethodId) {
            const failed = await Deposit.create({
                auction: auctionId,
                bidder: winner._id,
                amount: depositAmount,
                paymentIntentId: `failed_no_pm_${Date.now()}`,
                clientSecret: 'n/a',
                status: 'processing_failed',
                chargeAttempted: true,
                chargeSucceeded: false,
                failureReason: 'Winner has no saved payment method',
            });

            auction.depositAmount = depositAmount;
            auction.depositPaymentId = failed._id;
            auction.depositStatus = 'failed';
            auction.depositFailureReason = 'Winner has no saved payment method';
            await auction.save();

            return {
                status: 'failed',
                reason: 'no_payment_method',
                amount: depositAmount,
                payment: failed,
            };
        }

        // ---- Attempt off-session charge ----
        try {
            const paymentIntent = await StripeService.createPaymentIntent({
                amount: depositCents,
                currency: 'usd',
                customer: winner.stripeCustomerId,
                payment_method: winner.paymentMethodId,
                description: `5% winning deposit for auction: ${auction.title}`,
                confirm: true,
                off_session: true,
                capture_method: 'automatic',
                metadata: {
                    auctionId: auctionId.toString(),
                    type: 'bid_deposit',
                    userId: winner._id.toString(),
                },
            });

            const succeeded = paymentIntent.status === 'succeeded';

            const deposit = await Deposit.create({
                auction: auctionId,
                bidder: winner._id,
                amount: depositAmount,
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                status: succeeded ? 'succeeded' : 'processing_failed',
                chargeAttempted: true,
                chargeSucceeded: succeeded,
                failureReason: succeeded
                    ? undefined
                    : `Stripe status: ${paymentIntent.status}`,
            });

            auction.depositAmount = depositAmount;
            auction.depositPaymentId = deposit._id;
            auction.depositStatus = succeeded ? 'charged' : 'failed';
            auction.depositChargedAt = new Date();
            if (!succeeded) {
                auction.depositFailureReason = `Stripe status: ${paymentIntent.status}`;
            }
            await auction.save();

            console.log(
                `💳 Deposit ${succeeded ? 'charged' : 'failed'} for auction ${auctionId}: $${depositAmount}`
            );

            return {
                status: succeeded ? 'charged' : 'failed',
                amount: depositAmount,
                payment: deposit,
            };
        } catch (stripeError) {
            const failed = await Deposit.create({
                auction: auctionId,
                bidder: winner._id,
                amount: depositAmount,
                paymentIntentId: `failed_${Date.now()}`,
                clientSecret: 'n/a',
                status: 'processing_failed',
                chargeAttempted: true,
                chargeSucceeded: false,
                failureReason: stripeError.message || 'Card charge failed',
            });

            auction.depositAmount = depositAmount;
            auction.depositPaymentId = failed._id;
            auction.depositStatus = 'failed';
            auction.depositFailureReason =
                stripeError.message || 'Card charge failed';
            await auction.save();

            console.error(
                `❌ Deposit charge failed for auction ${auctionId}:`,
                stripeError.message
            );

            return {
                status: 'failed',
                reason: stripeError.message,
                amount: depositAmount,
                payment: failed,
            };
        }
    } catch (error) {
        console.error('chargeWinnerDeposit unexpected error:', error);
        return { status: 'error', reason: error.message };
    }
}