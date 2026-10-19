import { transporter } from "../utils/nodemailer.js";
import {
    isEmailEnabled,
    generateUnsubscribeToken,
    buildUnsubscribeUrl,
} from "./emailPreferenceService.js";
import { getEmailConfig } from "../constants/emailRegistry.js";

/**
 * @param {Object} opts
 * @param {Object} [opts.user]         — full User doc (_id, email, emailPreferences, userType)
 * @param {string} [opts.to]           — fallback recipient when no user doc exists
 * @param {string} opts.emailKey       — registry key
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {Object} [opts.extra]        — passed through to transporter.sendMail
 * @param {boolean} [opts.bypassPrefs] — force-send (env-addressed emails, locked emails)
 */
export const sendCategorizedEmail = async ({
    user,
    to,
    emailKey,
    subject,
    html,
    extra = {},
    bypassPrefs = false,
}) => {
    const config = getEmailConfig(emailKey);
    if (!config) {
        console.error(`[emailSender] Unknown email key: ${emailKey}`);
        return null;
    }

    const recipientEmail = user?.email || to;
    if (!recipientEmail) {
        console.warn(`[emailSender] No recipient for key: ${emailKey}`);
        return null;
    }

    // ── Preference gate ──
    if (!bypassPrefs && user && !isEmailEnabled(user, emailKey)) {
        console.log(`[emailSender] Skipped (opted out): ${emailKey} → ${recipientEmail}`);
        return null;
    }

    let finalHtml = html;
    const extraHeaders = { ...(extra.headers || {}) };

    // ── Unsubscribe footer + one-click headers ──
    // Only when: not locked, real user doc (need _id), not bypassed
    if (!config.locked && user?._id && !bypassPrefs) {
        try {
            const token = generateUnsubscribeToken(user._id, emailKey);
            const frontendUrl = buildUnsubscribeUrl(token);
            const apiBase = process.env.BACKEND_URL || "";
            const oneClickUrl = `${apiBase}/api/v1/users/unsubscribe/one-click?token=${encodeURIComponent(token)}`;

            finalHtml = injectUnsubscribeFooter(html, frontendUrl);
            extraHeaders["List-Unsubscribe"] = `<${oneClickUrl}>, <${frontendUrl}>`;
            extraHeaders["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        } catch (err) {
            console.error("[emailSender] Could not build unsubscribe headers:", err);
        }
    }

    try {
        return await transporter.sendMail({
            from: `"SoldWerX" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject,
            html: finalHtml,
            ...extra,
            headers: { ...extraHeaders, ...(extra.headers || {}) },
        });
    } catch (err) {
        console.error(`[emailSender] sendMail failed (${emailKey}):`, err);
        throw err;
    }
};

const injectUnsubscribeFooter = (html, unsubscribeUrl) => {
    if (!html || typeof html !== "string") return html;
    const footer = `
        <div style="text-align:center;padding:16px 24px 24px;font-size:11px;color:#6b7280;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <p style="margin:0 0 6px 0;">You're receiving this email because you have a SoldWerX account.</p>
            <p style="margin:0;">
                <a href="${unsubscribeUrl}" style="color:#D19F3E;text-decoration:underline;">Unsubscribe from this email</a>
                &nbsp;·&nbsp;
                <a href="${unsubscribeUrl}" style="color:#D19F3E;text-decoration:underline;">Manage email preferences</a>
            </p>
        </div>`;
    return html.replace(/<\/body>/i, `${footer}</body>`);
};