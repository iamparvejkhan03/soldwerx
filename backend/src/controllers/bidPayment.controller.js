import BidPayment from '../models/bidPayment.model.js';
import Commission from '../models/commission.model.js';
import Auction from '../models/auction.model.js';
import User from '../models/user.model.js';
import { StripeService } from '../services/stripeService.js';
import { calculateCommissions } from '../utils/commissionCalculator.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createBidPaymentIntent = async (req, res) => {
    try {
        const { auctionId, bidAmount } = req.body;
        const userId = req.user._id;

        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

        // Get global commission settings and compute buyer fee
        const { buyerFeeAmount, buyerFeeType, buyerFeeValue } = await calculateCommissions(
            parseFloat(bidAmount),
            true // forAuthorization
        );

        if (buyerFeeAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Buyer commission is disabled or zero. No authorization needed.',
            });
        }

        const authorizationAmount = Math.round(buyerFeeAmount * 100); // cents

        // Get user's Stripe customer and payment method
        const user = await User.findById(userId);
        if (!user?.stripeCustomerId || !user?.paymentMethodId) {
            return res.status(400).json({ success: false, message: 'User payment method not set up.' });
        }

        // Create authorization intent
        const paymentIntent = await StripeService.createBidAuthorizationIntent(
            user.stripeCustomerId,
            user.paymentMethodId,
            authorizationAmount,
            `Bid authorization for auction: ${auction.title}`
        );

        // Save bid payment record
        const bidPayment = await BidPayment.create({
            auction: auctionId,
            bidder: userId,
            bidAmount: parseFloat(bidAmount),
            commissionAmount: buyerFeeAmount,
            totalAmount: buyerFeeAmount,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
            type: 'bid_authorization',
            commissionRate: buyerFeeType === 'percentage' ? buyerFeeValue / 100 : null,
            commissionType: buyerFeeType === 'percentage' ? `${buyerFeeValue}%` : 'fixed',
        });

        res.status(200).json({
            success: true,
            message: 'Payment authorization created',
            data: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                requiresAction: paymentIntent.status === 'requires_action',
                bidPaymentId: bidPayment._id,
            },
        });
    } catch (error) {
        console.error('Create bid payment intent error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Confirm payment intent (when user completes payment)
export const confirmBidPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const userId = req.user._id;

        // Find the bid payment
        const bidPayment = await BidPayment.findOne({
            paymentIntentId: paymentIntentId,
            bidder: userId
        }).populate('auction');

        if (!bidPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment intent not found'
            });
        }

        // Update payment status to succeeded
        bidPayment.status = 'succeeded';
        await bidPayment.save();

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                bidPaymentId: bidPayment._id,
                auctionId: bidPayment.auction._id
            }
        });

    } catch (error) {
        console.error('Confirm bid payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while confirming payment'
        });
    }
};

// Charge winner when auction ends
export const chargeWinningBidder = async (req, res) => {
    try {
        const { auctionId } = req.body;

        const auction = await Auction.findById(auctionId)
            .populate('winner')
            .populate('seller');

        if (!auction || !auction.winner) {
            return res.status(404).json({
                success: false,
                message: 'Auction or winner not found'
            });
        }

        // Get commission amount
        const commission = await Commission.findOne({ category: auction.category });
        if (!commission) {
            return res.status(400).json({
                success: false,
                message: 'Commission not set for this category'
            });
        }

        const commissionAmount = commission.commissionAmount;
        const finalAmount = commissionAmount;

        // Find the winning bid payment
        const winningBidPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: auction.winner._id,
            status: 'succeeded'
        });

        if (!winningBidPayment) {
            return res.status(400).json({
                success: false,
                message: 'No valid payment found for winner'
            });
        }

        // Charge the customer automatically
        const chargeResult = await StripeService.chargeCustomer(
            auction.winner.stripeCustomerId,
            finalAmount,
            `Winning bid commission for: ${auction.title}`
        );

        if (chargeResult.success) {
            // Update bid payment record
            winningBidPayment.chargeAttempted = true;
            winningBidPayment.chargeSucceeded = true;
            winningBidPayment.status = 'succeeded';
            await winningBidPayment.save();

            // Update auction with commission info
            auction.commissionAmount = commissionAmount;
            auction.paymentStatus = 'paid';
            await auction.save();

            return res.status(200).json({
                success: true,
                message: 'Winner charged successfully',
                data: {
                    paymentIntentId: chargeResult.paymentIntent.id,
                    amount: finalAmount,
                    auctionId: auction._id
                }
            });
        }

    } catch (error) {
        console.error('Charge winning bidder error:', error);
        res.status(400).json({
            success: false,
            message: `Payment failed: ${error.message}`
        });
    }
};

// Get user's bid payments for an auction
export const getUserBidPayments = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const bidPayments = await BidPayment.find({
            auction: auctionId,
            bidder: userId
        }).populate('auction');

        res.status(200).json({
            success: true,
            data: { bidPayments }
        });

    } catch (error) {
        console.error('Get user bid payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bid payments'
        });
    }
};

export async function chargeWinningBidderDirect(auctionId) {
    try {
        const auction = await Auction.findById(auctionId).populate('winner');
        if (!auction || !auction.winner) return;

        const buyerFee = auction.buyerFeeAmount || 0;
        if (buyerFee <= 0) {
            // No buyer fee – cancel any authorizations
            await cancelAllBidderAuthorizations(auctionId);
            return;
        }

        // Find the authorization payment for the winner
        const authorizationPayment = await BidPayment.findOne({
            auction: auctionId,
            bidder: auction.winner._id,
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] },
        });

        if (!authorizationPayment) {
            console.log(`No authorization found for auction ${auctionId}. Attempting direct charge.`);
            // Optionally create a new charge if no authorization (should not happen)
            const winner = await User.findById(auction.winner._id);
            if (!winner?.stripeCustomerId || !winner?.paymentMethodId) return;
            // Create a new payment intent and capture immediately
            const paymentIntent = await StripeService.createPaymentIntent({
                amount: Math.round(buyerFee * 100),
                currency: 'usd',
                customer: winner.stripeCustomerId,
                payment_method: winner.paymentMethodId,
                confirm: true,
                off_session: true,
                metadata: { auctionId: auctionId.toString(), type: 'buyer_commission' },
            });
            if (paymentIntent.status === 'succeeded') {
                // Save as final payment
                await BidPayment.create({
                    auction: auctionId,
                    bidder: auction.winner._id,
                    bidAmount: auction.finalPrice,
                    commissionAmount: buyerFee,
                    totalAmount: buyerFee,
                    paymentIntentId: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    status: 'succeeded',
                    chargeAttempted: true,
                    chargeSucceeded: true,
                    type: 'final_commission',
                });
                auction.paymentStatus = 'paid';
                await auction.save();
            }
            return;
        }

        // Capture the existing authorization (amount should match buyerFee)
        // Ensure the authorization amount matches buyerFee (in cents)
        const capturedIntent = await StripeService.capturePaymentIntent(
            authorizationPayment.paymentIntentId
        );

        if (capturedIntent.status === 'succeeded') {
            // Update the authorization record to succeeded
            authorizationPayment.status = 'succeeded';
            authorizationPayment.chargeAttempted = true;
            authorizationPayment.chargeSucceeded = true;
            await authorizationPayment.save();

            auction.paymentStatus = 'paid';
            await auction.save();
            console.log(`✅ Captured buyer fee $${buyerFee} for auction ${auctionId}`);
        } else {
            console.error(`Failed to capture buyer fee for auction ${auctionId}`);
        }
    } catch (error) {
        console.error(`❌ Failed to charge buyer for auction ${auctionId}:`, error.message);
    }
}

// Add this function to your bidPayment.controller.js
export async function cancelLosingBidderAuthorizations(auctionId, winnerId) {
    try {
        // Find all authorization payments EXCEPT the winner's
        const losingBidPayments = await BidPayment.find({
            auction: auctionId,
            bidder: { $ne: winnerId }, // Exclude winner
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] }
        }).populate('bidder');

        console.log(`Cancelling ${losingBidPayments.length} losing bidder authorizations`);

        let cancelledCount = 0;
        for (const payment of losingBidPayments) {
            try {
                await StripeService.cancelPaymentIntent(payment.paymentIntentId);
                payment.status = 'canceled';
                await payment.save();
                cancelledCount++;
                console.log(`✅ Cancelled authorization for losing bidder: ${payment.bidder._id}`);
            } catch (error) {
                console.error(`❌ Failed to cancel authorization for bidder ${payment.bidder._id}:`, error.message);
            }
        }

        console.log(`✅ Successfully cancelled ${cancelledCount} losing bidder authorizations`);
        return cancelledCount;

    } catch (error) {
        console.error('Error cancelling losing bidder authorizations:', error.message);
        return 0;
    }
}

// Add this function to your bidPayment.controller.js
export async function cancelAllBidderAuthorizations(auctionId) {
    try {
        console.log(`Cancelling all bidder authorizations for auction: ${auctionId}`);

        // Find ALL authorization payments for this auction
        const allAuthorizationPayments = await BidPayment.find({
            auction: auctionId,
            type: 'bid_authorization',
            status: { $in: ['requires_capture', 'succeeded'] }
        }).populate('bidder');

        console.log(`Found ${allAuthorizationPayments.length} authorization payments to cancel`);

        let cancelledCount = 0;
        for (const payment of allAuthorizationPayments) {
            try {
                await StripeService.cancelPaymentIntent(payment.paymentIntentId);
                payment.status = 'canceled';
                await payment.save();
                cancelledCount++;
                console.log(`✅ Cancelled authorization for bidder: ${payment.bidder._id}`);
            } catch (error) {
                console.error(`❌ Failed to cancel authorization for bidder ${payment.bidder._id}:`, error.message);
            }
        }

        console.log(`✅ Successfully cancelled ${cancelledCount} authorization payments for auction ${auctionId}`);
        return cancelledCount;

    } catch (error) {
        console.error('Error cancelling all bidder authorizations:', error.message);
        return 0;
    }
}

// It charges the entire payment whereas the above controllers are for bid authorization hold and payments
export const createWinnerPaymentIntent = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const userId = req.user._id;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Ensure the logged-in user is the winner
    if (!auction.winner || auction.winner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the winner of this auction' });
    }

    // Check if already paid (via card or bank)
    if (auction.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This auction has already been paid for' });
    }

    // Check if there's already a successful winner_payment for this auction
    const existingPayment = await BidPayment.findOne({
      auction: auctionId,
      bidder: userId,
      type: 'winner_payment',
      status: 'succeeded'
    });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'You have already paid for this auction' });
    }

    // Calculate total amount (finalPrice + buyer fee)
    const total = (auction.finalPrice || 0) + (auction.buyerFeeAmount || 0) + (auction.taxAmount || 0);

    if (total <= 0) {
      return res.status(400).json({ success: false, message: 'Total amount is zero – no payment required' });
    }

    // Get or create Stripe customer
    const user = await User.findById(userId);
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await StripeService.createCustomer(user.email, user.firstName + ' ' + user.lastName);
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create PaymentIntent
    const paymentIntent = await StripeService.createPaymentIntent({
      amount: Math.round(total * 100), // cents
      currency: 'usd',
      customer: customerId,
      payment_method_types: ['card'],
      capture_method: 'automatic',
      confirm: false, // we confirm on client side
      metadata: {
        auctionId: auctionId.toString(),
        type: 'winner_payment',
        userId: userId.toString()
      },
      description: `Payment for auction: ${auction.title}`,
    });

    // Save BidPayment record
    const bidPayment = await BidPayment.create({
      auction: auctionId,
      bidder: userId,
      bidAmount: auction.finalPrice || 0,
      commissionAmount: auction.buyerFeeAmount || 0,
      taxAmount: auction.taxAmount || 0,
      totalAmount: total,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status, // 'created' or 'requires_action'
      type: 'winner_payment',
      chargeAttempted: false,
      chargeSucceeded: false
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        bidPaymentId: bidPayment._id,
        amount: total
      }
    });
  } catch (error) {
    console.error('Create winner payment intent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// Confirm winner payment after Stripe success on client
export const confirmWinnerPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user._id;

    // Find the bid payment record
    const bidPayment = await BidPayment.findOne({
      paymentIntentId,
      bidder: userId,
      type: 'winner_payment'
    }).populate('auction');

    if (!bidPayment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Retrieve payment intent from Stripe to confirm status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      // Update BidPayment
      bidPayment.status = 'succeeded';
      bidPayment.chargeAttempted = true;
      bidPayment.chargeSucceeded = true;
      await bidPayment.save();

      // Update auction
      const auction = bidPayment.auction;
      auction.paymentStatus = 'completed';
      auction.paymentMethod = 'credit_card';
      auction.transactionId = paymentIntentId;
      auction.paymentDate = new Date();
      await auction.save();

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: { auctionId: auction._id }
      });
    } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'canceled') {
      // Payment failed or was canceled
      bidPayment.status = 'canceled';
      await bidPayment.save();
      return res.status(400).json({
        success: false,
        message: 'Payment was not completed. Please try again.'
      });
    } else {
      // Still pending – wait or redirect
      return res.status(202).json({
        success: false,
        message: 'Payment is still being processed. Please check later.'
      });
    }
  } catch (error) {
    console.error('Confirm winner payment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};