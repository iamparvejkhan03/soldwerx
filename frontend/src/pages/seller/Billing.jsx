import { useEffect, useRef, useState } from "react";
import {
    LoadingSpinner,
    SellerContainer,
    SellerHeader,
    SellerSidebar,
} from "../../components";
import {
    CreditCard, Shield, CheckCircle, AlertCircle, RefreshCw,
} from "lucide-react";
import {
    useStripe, useElements, CardElement, Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

// -------------------------------------------------
// Card form: card element + consent checkbox + submit
// -------------------------------------------------
const CardSection = ({ isUpdating, consent, setConsent, consentError }) => (
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                New Credit Card Information
            </label>
            <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#424770",
                                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                "::placeholder": { color: "#aab7c4" },
                            },
                            invalid: { color: "#fa755a", iconColor: "#fa755a" },
                        },
                        hidePostalCode: true,
                    }}
                />
            </div>
        </div>

        {/* Consent checkbox — legally required for off-session charges */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1"
                />
                <p className="text-sm text-gray-700">
                    I authorize SoldWerX to save this card with Stripe and to
                    automatically charge it a <strong>5% deposit</strong> (capped at{" "}
                    <strong>$5,000</strong>) <em>off-session</em> if I win an auction.
                    The deposit will be credited toward my final balance.
                </p>
            </label>
            {consentError && (
                <p className="text-red-500 text-sm mt-2">{consentError}</p>
            )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <Shield size={18} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment Information</p>
                    <p>
                        Your card details are encrypted and processed securely by
                        Stripe. We never store your full card information on our
                        servers.
                    </p>
                </div>
            </div>
        </div>

        <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
        >
            {isUpdating ? (
                <>
                    <RefreshCw size={18} className="animate-spin" />
                    Updating Card...
                </>
            ) : (
                <>
                    <CreditCard size={18} />
                    Update Payment Method
                </>
            )}
        </button>
    </div>
);

// -------------------------------------------------
// Main Billing component
// -------------------------------------------------
const Billing = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [cardDetails, setCardDetails] = useState(null);
    const [consent, setConsent] = useState(false);
    const [consentError, setConsentError] = useState("");

    const hasHandledReturn = useRef(false);

    const fetchCardDetails = async () => {
        try {
            const { data } = await axiosInstance.get("/api/v1/users/billing");
            if (data.success) setCardDetails(data.data);
        } catch (err) {
            console.error("Fetch card details error:", err);
            toast.error("Failed to load card details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardDetails();
    }, []);

    // -------------------------------------------------
    // 3DS return handler — runs when the user comes back
    // from a bank redirect with ?setup_intent=...
    // -------------------------------------------------
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const setupIntentId = params.get("setup_intent");
        const setupIntentClientSecret = params.get(
            "setup_intent_client_secret"
        );
        const redirectStatus = params.get("redirect_status");

        if (!setupIntentId || !stripe || hasHandledReturn.current) return;

        hasHandledReturn.current = true;
        setUpdating(true);

        // Clean URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        if (redirectStatus !== "succeeded") {
            toast.error("Card verification failed. Please try another card.");
            setUpdating(false);
            return;
        }

        (async () => {
            try {
                // Double-check the SetupIntent status on Stripe's side
                const { setupIntent, error } = await stripe.retrieveSetupIntent(
                    setupIntentClientSecret
                );
                if (error) throw new Error(error.message);
                if (setupIntent.status !== "succeeded") {
                    throw new Error(`Card verification status: ${setupIntent.status}`);
                }

                const { data } = await axiosInstance.post(
                    "/api/v1/users/billing/complete-card-update",
                    { setupIntentId: setupIntent.id }
                );

                if (data.success) {
                    toast.success(data.message || "Card updated successfully!");
                    setConsent(false);
                    elements?.getElement(CardElement)?.clear();
                    await fetchCardDetails();
                }
            } catch (err) {
                toast.error(
                    err?.response?.data?.message ||
                    err.message ||
                    "Failed to complete card update"
                );
            } finally {
                setUpdating(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stripe]);

    // -------------------------------------------------
    // Submit — create PM, send consent, confirm setup
    // -------------------------------------------------
    const handleUpdateCard = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            toast.error("Stripe not initialized");
            return;
        }

        if (!consent) {
            setConsentError(
                "You must consent to card storage and off-session deposit charges."
            );
            return;
        }
        setConsentError("");
        setUpdating(true);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                toast.error("Please enter your card details");
                setUpdating(false);
                return;
            }

            // 1. Create PM client-side
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
                billing_details: {
                    name: `${cardDetails?.firstName || ""} ${cardDetails?.lastName || ""
                        }`.trim() || undefined,
                    email: cardDetails?.email || undefined,
                },
            });

            if (error) {
                toast.error(`Card error: ${error.message}`);
                setUpdating(false);
                return;
            }

            // 2. Ask backend to attach + create SetupIntent
            const { data } = await axiosInstance.put(
                "/api/v1/users/billing/update-card",
                {
                    paymentMethodId: paymentMethod.id,
                    cardSaveConsent: true,
                }
            );

            if (!data.success) {
                toast.error(data.message || "Failed to start card update");
                setUpdating(false);
                return;
            }

            // 3. Confirm the SetupIntent — handles 3DS
            const { error: confirmError, setupIntent } =
                await stripe.confirmCardSetup(data.clientSecret, {
                    payment_method: paymentMethod.id,
                });

            if (confirmError) {
                toast.error(confirmError.message);
                setUpdating(false);
                return;
            }

            // 4a. 3DS redirect required
            if (
                setupIntent?.status === "requires_action" &&
                setupIntent?.next_action?.redirect_to_url?.url
            ) {
                window.location.href = setupIntent.next_action.redirect_to_url.url;
                return; // browser navigates away
            }

            // 4b. Already succeeded (no 3DS) — finalize now
            if (setupIntent?.status === "succeeded") {
                const { data: complete } = await axiosInstance.post(
                    "/api/v1/users/billing/complete-card-update",
                    { setupIntentId: setupIntent.id }
                );

                if (complete.success) {
                    toast.success(
                        complete.message || "Card updated successfully!"
                    );
                    setConsent(false);
                    cardElement.clear();
                    await fetchCardDetails();
                } else {
                    toast.error(complete.message || "Failed to finalize card update");
                }
                return;
            }

            toast.error("Card verification failed. Please try again.");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed to update card"
            );
            console.error("Update card error:", error);
        } finally {
            setUpdating(false);
        }
    };

    const getCardBrandIcon = (brand) => {
        const icons = {
            visa: "💳", mastercard: "💳", amex: "💳",
            discover: "💳", jcb: "💳", diners: "💳", unionpay: "💳",
        };
        return icons[brand?.toLowerCase()] || "💳";
    };

    const formatExpiryDate = (month, year) =>
        `${month.toString().padStart(2, "0")}/${year
            .toString()
            .slice(-2)}`;

    // -------------------------------------------------
    // Render
    // -------------------------------------------------
    return (
        <section className="flex min-h-[70vh]">
            <SellerSidebar />

            <div className="w-full relative">
                <SellerHeader />

                <SellerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">
                            Billing & Payment Methods
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="max-w-2xl">
                            {/* Current Card */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <CreditCard size={20} />
                                        Current Payment Method
                                    </h3>
                                    {cardDetails?.isPaymentVerified && (
                                        <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                            <CheckCircle size={14} />
                                            Verified
                                        </span>
                                    )}
                                </div>

                                {cardDetails?.card ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">
                                                    {getCardBrandIcon(cardDetails.card.brand)}
                                                </span>
                                                <div>
                                                    <p className="font-medium">
                                                        {cardDetails.card.brand
                                                            ?.charAt(0)
                                                            .toUpperCase() +
                                                            cardDetails.card.brand?.slice(1)}{" "}
                                                        •••• {cardDetails.card.last4}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Expires{" "}
                                                        {formatExpiryDate(
                                                            cardDetails.card.expMonth,
                                                            cardDetails.card.expYear
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Default</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Shield size={16} />
                                            <span>
                                                Your card details are securely stored with Stripe
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <AlertCircle
                                            size={32}
                                            className="mx-auto text-gray-400 mb-2"
                                        />
                                        <p className="text-gray-600">No payment method found</p>
                                    </div>
                                )}
                            </div>

                            {/* Update Card */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <CreditCard size={20} />
                                    Update Payment Method
                                </h3>

                                <form onSubmit={handleUpdateCard}>
                                    <CardSection
                                        isUpdating={updating}
                                        consent={consent}
                                        setConsent={setConsent}
                                        consentError={consentError}
                                    />
                                </form>
                            </div>

                            {/* Billing Info */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Billing Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Stripe Customer ID</p>
                                        <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                                            {cardDetails?.stripeCustomerId || "Not available"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Account Type</p>
                                        <p className="font-medium capitalize">
                                            {cardDetails?.userType || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Status</p>
                                        <p
                                            className={`font-medium ${cardDetails?.isPaymentVerified
                                                    ? "text-green-600"
                                                    : "text-yellow-600"
                                                }`}
                                        >
                                            {cardDetails?.isPaymentVerified
                                                ? "Verified"
                                                : "Not Verified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SellerContainer>
            </div>
        </section>
    );
};

const BillingWithStripe = () => (
    <Elements stripe={stripePromise}>
        <Billing />
    </Elements>
);

export default BillingWithStripe;