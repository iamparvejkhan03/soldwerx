import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
    EMAIL_REGISTRY,
    getEmailConfig,
    getCategoriesForAudience,
} from "../constants/emailRegistry.js";

// Use a dedicated secret if provided; fall back to ACCESS_TOKEN_SECRET so no env change is required to get started.
const UNSUBSCRIBE_SECRET =
    process.env.EMAIL_PREF_SECRET || process.env.ACCESS_TOKEN_SECRET;
const UNSUBSCRIBE_TOKEN_TTL = "180d";
const TOKEN_TYPE = "unsubscribe";

// MongoDB/Mongoose disallows dots in Map keys → use `__` for storage only.
const toStorageKey = (emailKey) => emailKey.replace(/\./g, "__");

// ─────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────

const getStoredValue = (user, emailKey) => {
    const prefs = user?.emailPreferences;
    if (!prefs) return undefined;
    const storageKey = toStorageKey(emailKey);
    if (typeof prefs.get === "function") return prefs.get(storageKey);
    return prefs[storageKey];
};

// ─────────────────────────────────────────────────────────────
// Core gate — used by emailSender.service.js on every send
// ─────────────────────────────────────────────────────────────

/**
 * Returns true if `emailKey` should be sent to `user`.
 *   - Unknown key → send (fail-open, but warn so typos are visible in logs)
 *   - Locked      → always send (password_reset)
 *   - Otherwise   → stored preference, falling back to registry default
 */
export const isEmailEnabled = (user, emailKey) => {
    const config = getEmailConfig(emailKey);
    if (!config) {
        console.warn(`[emailPrefs] Unknown email key: ${emailKey}`);
        return true;
    }
    if (config.locked) return true;

    const stored = getStoredValue(user, emailKey);
    if (stored === false) return false;
    if (stored === true) return true;
    return config.default !== false;
};

// ─────────────────────────────────────────────────────────────
// Unsubscribe tokens
// ─────────────────────────────────────────────────────────────

export const generateUnsubscribeToken = (userId, emailKey) =>
    jwt.sign(
        { userId: userId.toString(), emailKey, typ: TOKEN_TYPE },
        UNSUBSCRIBE_SECRET,
        { expiresIn: UNSUBSCRIBE_TOKEN_TTL }
    );

export const verifyUnsubscribeToken = (token) => {
    try {
        const decoded = jwt.verify(token, UNSUBSCRIBE_SECRET);
        if (decoded?.typ !== TOKEN_TYPE) return null;
        if (!decoded?.userId || !decoded?.emailKey) return null;
        return { userId: decoded.userId, emailKey: decoded.emailKey };
    } catch {
        return null;
    }
};

export const buildUnsubscribeUrl = (token) => {
    const base = process.env.FRONTEND_URL || "";
    return `${base}/unsubscribe?token=${encodeURIComponent(token)}`;
};

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Apply an unsubscribe action from the public /unsubscribe flow.
 * @param {string} userId
 * @param {"email" | "category" | "all"} scope
 * @param {string} emailKey  — key the token was minted for
 * @returns {{ updatedKeys: string[] }}
 */
export const applyUnsubscribe = async (userId, scope, emailKey) => {
    const user = await User.findById(userId).select("_id emailPreferences");
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    const config = getEmailConfig(emailKey);
    if (!config) {
        const err = new Error("Unknown email");
        err.statusCode = 400;
        throw err;
    }
    if (config.locked) {
        const err = new Error("This email cannot be unsubscribed");
        err.statusCode = 400;
        throw err;
    }

    let keysToDisable = [];
    if (scope === "email") {
        keysToDisable = [emailKey];
    } else if (scope === "category") {
        keysToDisable = Object.values(EMAIL_REGISTRY)
            .filter((c) => c.category === config.category && !c.locked)
            .map((c) => c.key);
    } else if (scope === "all") {
        keysToDisable = Object.values(EMAIL_REGISTRY)
            .filter((c) => !c.locked)
            .map((c) => c.key);
    } else {
        const err = new Error("Invalid scope");
        err.statusCode = 400;
        throw err;
    }

    if (!user.emailPreferences) user.emailPreferences = new Map();
    for (const key of keysToDisable) {
        user.emailPreferences.set(toStorageKey(key), false);
    }
    await user.save();

    return { updatedKeys: keysToDisable };
};

/**
 * Bulk update from the profile page.
 * Unknown keys, locked keys, and non-boolean values are silently skipped.
 */
export const applyPreferencesBulk = async (userId, prefsObj) => {
    const user = await User.findById(userId).select("_id emailPreferences");
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    if (!user.emailPreferences) user.emailPreferences = new Map();

    const updated = {};
    for (const [key, value] of Object.entries(prefsObj || {})) {
        const config = getEmailConfig(key);
        if (!config) continue;         // unknown key
        if (config.locked) continue;   // cannot toggle locked emails
        if (typeof value !== "boolean") continue;

        user.emailPreferences.set(toStorageKey(key), value);
        updated[key] = value;
    }
    await user.save();
    return { updated };
};

// ─────────────────────────────────────────────────────────────
// Read for UI
// ─────────────────────────────────────────────────────────────

/**
 * Full UI shape for the profile page — categories + emails with current `enabled` state.
 * The admin category is only returned for admins/staff.
 */
export const getPreferencesForUI = (user) => {
    const categories = getCategoriesForAudience(user.userType);
    return categories.map((cat) => ({
        key: cat.key,
        label: cat.label,
        description: cat.description,
        audience: cat.audience,
        emails: Object.values(cat.emails).map((cfg) => ({
            key: cfg.key,
            label: cfg.label,
            description: cfg.description,
            locked: !!cfg.locked,
            critical: !!cfg.critical,
            enabled: isEmailEnabled(user, cfg.key),
        })),
    }));
};