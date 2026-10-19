import User from "../models/user.model.js";
import {
    verifyUnsubscribeToken,
    applyUnsubscribe,
    applyPreferencesBulk,
    getPreferencesForUI,
    isEmailEnabled,
} from "../services/emailPreferenceService.js";
import {
    EMAIL_CATEGORIES,
    EMAIL_REGISTRY,
    getEmailConfig,
    getEmailKeysInCategory,
} from "../constants/emailRegistry.js";

// ─────────────────────────────────────────────
// Protected — profile page
// ─────────────────────────────────────────────

/**
 * GET /api/v1/users/email-preferences
 * Returns the full UI shape: categories → emails with { enabled, locked, critical }.
 */
export const getEmailPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("emailPreferences userType");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const categories = getPreferencesForUI(user);

        res.status(200).json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        console.error("Get email preferences error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch email preferences",
        });
    }
};

/**
 * PUT /api/v1/users/email-preferences
 * Body: { preferences: { "auction.outbid": false, "account.welcome": true } }
 * Unknown/locked/non-boolean keys are silently ignored.
 */
export const updateEmailPreferences = async (req, res) => {
    try {
        const { preferences } = req.body || {};
        if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
            return res.status(400).json({
                success: false,
                message: "`preferences` object is required",
            });
        }

        const { updated } = await applyPreferencesBulk(req.user._id, preferences);

        res.status(200).json({
            success: true,
            message: "Email preferences updated",
            data: { updated },
        });
    } catch (error) {
        console.error("Update email preferences error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update email preferences",
        });
    }
};

// ─────────────────────────────────────────────
// Public — unsubscribe
// ─────────────────────────────────────────────

/**
 * GET /api/v1/users/unsubscribe/:token
 * Preview only — does NOT unsubscribe. Frontend then calls POST /unsubscribe.
 */
export const previewUnsubscribe = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const decoded = verifyUnsubscribeToken(token);
        if (!decoded) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired unsubscribe link",
            });
        }

        const config = getEmailConfig(decoded.emailKey);
        if (!config || config.locked) {
            return res.status(400).json({
                success: false,
                message: "This email cannot be unsubscribed",
            });
        }

        const user = await User.findById(decoded.userId).select("emailPreferences");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const category = EMAIL_CATEGORIES[config.category];

        const categoryEmails = getEmailKeysInCategory(config.category)
            .filter((k) => !getEmailConfig(k)?.locked)
            .map((k) => {
                const c = getEmailConfig(k);
                return { key: k, label: c.label, enabled: isEmailEnabled(user, k) };
            });

        const allNonLockedEnabledCount = Object.values(EMAIL_REGISTRY)
            .filter((c) => !c.locked && isEmailEnabled(user, c.key)).length;

        res.status(200).json({
            success: true,
            data: {
                emailKey: config.key,
                emailLabel: config.label,
                emailEnabled: isEmailEnabled(user, config.key),
                categoryKey: config.category,
                categoryLabel: category.label,
                categoryEmails,
                allNonLockedEnabledCount,
            },
        });
    } catch (error) {
        console.error("Preview unsubscribe error:", error);
        res.status(500).json({ success: false, message: "Failed to load unsubscribe page" });
    }
};

/**
 * POST /api/v1/users/unsubscribe
 * Body: { token, scope: "email" | "category" | "all" }
 */
export const unsubscribe = async (req, res) => {
    try {
        const { token, scope = "email" } = req.body || {};
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }
        if (!["email", "category", "all"].includes(scope)) {
            return res.status(400).json({ success: false, message: "Invalid scope" });
        }

        const decoded = verifyUnsubscribeToken(token);
        if (!decoded) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired unsubscribe link",
            });
        }

        const { updatedKeys } = await applyUnsubscribe(decoded.userId, scope, decoded.emailKey);

        const message =
            scope === "email"
                ? "You've been unsubscribed from this email."
                : scope === "category"
                    ? "You've been unsubscribed from this category."
                    : "You've been unsubscribed from all non-essential emails.";

        res.status(200).json({
            success: true,
            message,
            data: { updatedKeys },
        });
    } catch (error) {
        console.error("Unsubscribe error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to unsubscribe",
        });
    }
};

/**
 * POST /api/v1/users/unsubscribe/one-click?token=...
 * Gmail/Yahoo one-click endpoint (via List-Unsubscribe-Post header).
 * Always unsubscribes the single email the token was minted for.
 * Plain-text response so mail clients don't choke on JSON.
 */
export const unsubscribeOneClick = async (req, res) => {
    try {
        const token = req.query.token || req.body?.token;
        if (!token) return res.status(400).send("Token required");

        const decoded = verifyUnsubscribeToken(token);
        if (!decoded) return res.status(400).send("Invalid or expired token");

        await applyUnsubscribe(decoded.userId, "email", decoded.emailKey);

        res.status(200).send("OK");
    } catch (error) {
        console.error("One-click unsubscribe error:", error);
        res.status(500).send("Error");
    }
};