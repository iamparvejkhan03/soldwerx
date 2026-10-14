import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripeService {
    static async createCustomer(email, name, metadata = {}) {
        try {
            return await stripe.customers.create({
                email,
                name,
                description: 'SoldWerX customer',
                metadata,
            });
        } catch (error) {
            throw new Error(`Stripe customer creation failed: ${error.message}`);
        }
    }

    /**
     * Create an UNCONFIRMED SetupIntent so the client can confirm it (handles 3DS).
     * Returns the client_secret that the frontend passes to stripe.confirmCardSetup.
     */
    static async createSetupIntent(customerId, paymentMethodId, metadata = {}) {
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method: paymentMethodId,
                payment_method_types: ['card'],
                usage: 'off_session', // KEY: for future off-session charges
                metadata,
            });
            return setupIntent;
        } catch (error) {
            throw new Error(`SetupIntent creation failed: ${error.message}`);
        }
    }

    static async retrieveSetupIntent(setupIntentId) {
        return await stripe.setupIntents.retrieve(setupIntentId);
    }

    static async attachPaymentMethod(customerId, paymentMethodId) {
        return await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
    }

    static async setDefaultPaymentMethod(customerId, paymentMethodId) {
        return await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
    }

    static async getCustomerPaymentMethods(customerId) {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });
            return paymentMethods.data;
        } catch (error) {
            throw new Error(`Failed to get payment methods: ${error.message}`);
        }
    }

    /**
     * Charge an off-session payment (e.g., 5% deposit when user wins).
     * Uses the saved default payment method.
     */
    static async chargeOffSession(customerId, paymentMethodId, amount, description, metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // dollars → cents
                currency: 'usd',
                customer: customerId,
                payment_method: paymentMethodId,
                description,
                confirm: true,
                off_session: true,
                capture_method: 'automatic',
                metadata,
            });
            return paymentIntent;
        } catch (error) {
            throw new Error(`Off-session charge failed: ${error.message}`);
        }
    }

    static async createPaymentIntent(params) {
        try {
            const paymentIntent = await stripe.paymentIntents.create(params);
            return paymentIntent;
        } catch (error) {
            throw new Error(`Payment intent creation failed: ${error.message}`);
        }
    }

    /**
     * Authorize-only (place a hold) — useful if you want to hold 5% and capture later.
     */
    static async createBidAuthorizationIntent(customerId, paymentMethodId, amountInCents, description, metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                customer: customerId,
                payment_method: paymentMethodId,
                description,
                capture_method: 'manual',
                confirm: true,
                off_session: true,
                metadata,
            });
            return paymentIntent;
        } catch (error) {
            throw new Error(`Bid authorization failed: ${error.message}`);
        }
    }

    static async capturePaymentIntent(paymentIntentId) {
        try {
            return await stripe.paymentIntents.capture(paymentIntentId);
        } catch (error) {
            throw new Error(`Payment capture failed: ${error.message}`);
        }
    }

    static async cancelPaymentIntent(paymentIntentId) {
        try {
            return await stripe.paymentIntents.cancel(paymentIntentId);
        } catch (error) {
            throw new Error(`Payment intent cancellation failed: ${error.message}`);
        }
    }

    static async refundPayment(paymentIntentId) {
        try {
            return await stripe.refunds.create({ payment_intent: paymentIntentId });
        } catch (error) {
            throw new Error(`Refund failed: ${error.message}`);
        }
    }
}

export { stripe };