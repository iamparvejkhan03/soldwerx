/**
 * Central registry of every email the platform sends.
 *
 * This is the ONLY place to add/modify/remove an email preference key.
 * It drives:
 *   - The profile "Email Preferences" UI (via getCategoriesForAudience)
 *   - The `isEmailEnabled` gate in emailSender.service.js
 *   - The unsubscribe flow (email vs category vs all)
 *
 * Rules per email:
 *   - default:   true/false — state for a brand-new user
 *   - locked:    true → cannot be unsubscribed (only password_reset)
 *   - critical:  true → UI shows a warning if the user disables it
 */

const RAW_CATEGORIES = {
    account: {
        label: "Account",
        description: "Account activity, verification, and security emails",
        audience: "all",
        emails: {
            welcome: {
                label: "Welcome email",
                description: "Sent when you first create your account",
                default: true,
                critical: true,
                audience: "all"
            },
            approved: {
                label: "Account approved",
                description: "Sent when your account is approved by our team",
                default: true,
                critical: true,
                audience: "all"
            },
            identity_rejected: {
                label: "Identity verification issue",
                description: "Sent if your ID document needs to be re-uploaded",
                default: true,
                critical: true,
                audience: "all"
            },
            password_reset: {
                label: "Password reset",
                description: "Sent when you request a password reset",
                default: true,
                locked: true,
                audience: "all"
            },
        },
    },

    auction: {
        label: "Auctions",
        description: "Auction activity, bids, and outcomes",
        audience: "all",
        emails: {
            ending_soon: {
                label: "Auction ending soon",
                description: "Reminders before auctions you're bidding on close",
                default: true,
                audience: "bidder"
            },
            outbid: {
                label: "You've been outbid",
                description: "When another bidder places a higher bid",
                default: true,
                audience: "bidder"
            },
            new_bid: {
                label: "New bid on your listing",
                description: "When someone bids on an item you're selling",
                default: true,
                audience: "seller"
            },
            ended: {
                label: "Your auction ended",
                description: "Summary when your listing closes",
                default: true,
                audience: "seller"
            },
            bid_confirmation: {
                label: "Bid confirmation",
                description: "Confirmation each time you place a bid",
                default: true,
                critical: true,
                audience: "bidder"
            },
            won: {
                label: "You won an auction",
                description: "Winning notification with invoice details",
                default: true,
                critical: true,
                audience: "bidder"
            },
            proxy_bid_placed: {
                label: "Proxy bid placed",
                description: "Confirmation when you set up a proxy bid",
                default: true,
                critical: true,
                audience: "bidder"
            },
            proxy_bid_outbid: {
                label: "Proxy bid outbid",
                description: "When your proxy bid is raised automatically",
                default: true,
                audience: "bidder"
            },
            listing_approved: {
                label: "Listing approved",
                description: "When your listing passes review",
                default: true,
                audience: "seller"
            },
            listing_live: {
                label: "Listing is live",
                description: "When your listing goes live on the site",
                default: true,
                audience: "seller"
            },
            // giveaway_entered: {
            //     label: "Giveaway entry confirmed",
            //     description: "Confirmation when you enter a giveaway",
            //     default: true,
            //     audience: "bidder"
            // },
            // giveaway_won: {
            //     label: "Giveaway winner",
            //     description: "When you win a giveaway",
            //     default: true,
            //     critical: true,
            //     audience: "bidder"
            // },
        },
    },

    offer: {
        label: "Offers",
        description: "Offer activity between buyers and sellers",
        audience: "all",
        emails: {
            new: {
                label: "New offer received",
                description: "When someone makes an offer on your listing",
                default: true,
                audience: "seller"
            },
            accepted: {
                label: "Offer accepted",
                description: "When a seller accepts your offer",
                default: true,
                critical: true,
                audience: "bidder"
            },
            rejected: {
                label: "Offer rejected",
                description: "When a seller rejects your offer",
                default: true,
                critical: true,
                audience: "bidder"
            },
            canceled: {
                label: "Offer canceled",
                description: "When a seller cancels your offer",
                default: true,
                audience: "bidder"
            },
            submitted: {
                label: "Offer submitted",
                description: "Confirmation when you submit an offer",
                default: true,
                critical: true,
                audience: "bidder"
            },
            counter_accepted_seller: {
                label: "Counter offer accepted",
                description: "When a buyer accepts your counter offer",
                default: true,
                critical: true,
                audience: "seller",
            },
            counter_received: {
                label: "Counter offer received",
                description: "When a seller sends you a counter offer",
                default: true,
                critical: true,
                audience: "bidder",
            },
            counter_from_buyer: {
                label: "Buyer countered your offer",
                description: "When a buyer sends a counter proposal",
                default: true,
                audience: "seller",
            },
            counter_rejected: {
                label: "Counter offer declined",
                description: "When a buyer declines your counter offer",
                default: true,
                audience: "seller",
            },
        },
    },

    payment: {
        label: "Payments",
        description: "Payment and deposit notifications",
        audience: "all",
        emails: {
            completed_buyer: {
                label: "Payment confirmed (buyer)",
                description: "Payment confirmation for your purchases",
                default: true,
                critical: true,
                audience: "bidder"
            },
            completed_seller: {
                label: "Payment received (seller)",
                description: "Notification when a buyer pays for your item",
                default: true,
                critical: true,
                audience: "seller"
            },
            deposit_charged: {
                label: "Winning deposit charged",
                description: "When your 5% winning deposit is charged",
                default: true,
                critical: true,
                audience: "bidder"
            },
            deposit_failed: {
                label: "Winning deposit failed",
                description: "When your deposit charge fails and action is needed",
                default: true,
                critical: true,
                audience: "bidder"
            },
        },
    },

    payout: {
        label: "Payouts",
        description: "Payout progress for your sold items",
        audience: "all",
        emails: {
            initiated: {
                label: "Payout initiated",
                description: "When a payout is started for your sale",
                default: true,
                critical: true,
                audience: "seller"
            },
            completed: {
                label: "Payout completed",
                description: "When funds have been sent to you",
                default: true,
                critical: true,
                audience: "seller"
            },
            failed: {
                label: "Payout issue",
                description: "When a payout fails and action is needed",
                default: true,
                critical: true,
                audience: "seller"
            },
        },
    },

    communication: {
        label: "Communication",
        description: "Messages, comments, and shipping updates",
        audience: "all",
        emails: {
            new_message: {
                label: "New message",
                description: "When someone sends you a message",
                default: true,
                audience: "all"
            },
            new_comment_seller: {
                label: "New comment on your listing",
                description: "When someone comments on your listing",
                default: true,
                audience: "seller"
            },
            new_comment_bidder: {
                label: "New comment on a listing you follow",
                description: "When someone comments on a listing you're engaged with",
                default: true,
                audience: "bidder"
            },
            shipping_updated: {
                label: "Shipping updated",
                description: "When shipping details for your won item change",
                default: true,
                audience: "bidder"
            },
            contact_confirmation: {
                label: "Contact form confirmation",
                description: "Confirmation you submitted the contact form",
                default: true,
                audience: "all",
                hidden: true
            },
            liquidation_confirmation: {
                label: "Liquidation request confirmation",
                description: "Confirmation you submitted a liquidation request",
                default: true,
                audience: "all",
                hidden: true
            },
            sell_confirmation: {
                label: "Sell request confirmation",
                description: "Confirmation you submitted a sell request",
                default: true,
                audience: "all",
                hidden: true
            },
        },
    },

    marketing: {
        label: "Marketing",
        description: "Promotional and broadcast emails",
        audience: "all",
        emails: {
            new_listing: {
                label: "New listing announcements",
                description: "News about newly listed items on the platform",
                default: true,
                audience: "bidder"
            },
        },
    },

    admin: {
        label: "Admin",
        description: "Operational notifications — visible to admins only",
        audience: "admin",
        emails: {
            new_user_registered: {
                label: "New user registered",
                description: "When a new user signs up",
                default: true,
                audience: "admin"
            },
            auction_submitted: {
                label: "Auction submitted for approval",
                description: "When a seller submits a listing for review",
                default: true,
                audience: "admin"
            },
            auction_won: {
                label: "Auction sold",
                description: "When an auction is won by a bidder",
                default: true,
                audience: "admin"
            },
            auction_ended: {
                label: "Auction ended",
                description: "When an auction finishes",
                default: true,
                audience: "admin"
            },
            flagged_comment: {
                label: "Comment flagged",
                description: "When a comment is reported by a user",
                default: true,
                audience: "admin"
            },
            payment_initiated: {
                label: "Bank payment initiated",
                description: "When a buyer starts a bank transfer payment",
                default: true,
                audience: "admin"
            },
            card_payment_completed: {
                label: "Card payment completed",
                description: "When a buyer pays by card",
                default: true,
                audience: "admin"
            },
            deposit_failed: {
                label: "Deposit charge failed",
                description: "When a winning deposit charge fails",
                default: true,
                audience: "admin"
            },
            deposit_charged: {
                label: "Deposit charged",
                description: "When a winning deposit is successfully charged",
                default: true,
                audience: "admin"
            },
            liquidation_request: {
                label: "Liquidation request",
                description: "When someone submits a liquidation request",
                default: true,
                audience: "admin",
                hidden: true
            },
            sell_request: {
                label: "Sell request",
                description: "When someone submits a sell request",
                default: true,
                audience: "admin",
                hidden: true
            },
            contact_form: {
                label: "Contact form submission",
                description: "When someone submits the contact form",
                default: true,
                audience: "admin",
                hidden: true
            },
        },
    },
};

// ─────────────────────────────────────────────────────────────
// Build flat + nested registries at module load (fast lookups)
// ─────────────────────────────────────────────────────────────

export const EMAIL_CATEGORIES = {};
export const EMAIL_REGISTRY = {};

for (const [catKey, cat] of Object.entries(RAW_CATEGORIES)) {
    const emails = {};
    for (const [shortKey, cfg] of Object.entries(cat.emails)) {
        const fullKey = `${catKey}.${shortKey}`;
        const finalCfg = {
            ...cfg,
            key: fullKey,
            category: catKey,
        };
        emails[shortKey] = finalCfg;
        EMAIL_REGISTRY[fullKey] = finalCfg;
    }
    EMAIL_CATEGORIES[catKey] = {
        key: catKey,
        label: cat.label,
        description: cat.description,
        audience: cat.audience || "all",
        emails,
    };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export const getEmailConfig = (key) => EMAIL_REGISTRY[key] || null;

export const isKnownEmailKey = (key) => !!EMAIL_REGISTRY[key];

/** Flat { "auction.outbid": true, ... } of registry defaults — useful for new-user init */
export const getDefaultPreferencesObject = () => {
    const out = {};
    for (const [key, cfg] of Object.entries(EMAIL_REGISTRY)) {
        out[key] = cfg.default !== false;
    }
    return out;
};

/** Filter categories by audience. Admins/staff see the "admin" category too. */
export const getCategoriesForAudience = (userType) => {
    const isAdminOrStaff = userType === "admin" || userType === "staff";
    return Object.values(EMAIL_CATEGORIES).filter(
        (c) => c.audience === "all" || (c.audience === "admin" && isAdminOrStaff)
    );
};

/** All email keys inside a category (including locked ones) */
export const getEmailKeysInCategory = (categoryKey) => {
    const cat = EMAIL_CATEGORIES[categoryKey];
    if (!cat) return [];
    return Object.values(cat.emails).map((e) => e.key);
};