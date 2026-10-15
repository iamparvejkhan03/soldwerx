/**
 * Client-side commission helpers shared by every bidding/buying modal.
 *
 * The rules of the game:
 *   - If auction.commission.buyer exists  -> use it (snapshot on the auction).
 *       - { enabled: false }              -> no buyer fee at all.
 *       - { enabled: true, structure }    -> apply that structure.
 *   - Otherwise fall back to global commission settings (buyerEnabled + buyerStructure).
 *
 * The math mirrors utils/commissionCalculator.js on the server exactly
 * (integer cents, progressive tiers) so previews match the invoice.
 */

/* -------------------------------------------------------------------------- */
/*  Resolve which buyer rule applies                                          */
/* -------------------------------------------------------------------------- */

export const resolveBuyerRule = (auction, globalCommission) => {
    const side = auction?.commission?.buyer;

    // The auction carries its own buyer rule — this always wins.
    if (side) {
        if (side.enabled === false || !side.structure) {
            return { enabled: false, structure: null, source: 'auction' };
        }
        return { enabled: true, structure: side.structure, source: 'auction' };
    }

    // No auction override — fall back to the global default.
    if (!globalCommission) {
        return { enabled: false, structure: null, source: 'none' };
    }

    return {
        enabled: globalCommission.buyerEnabled !== false,
        structure: globalCommission.buyerStructure || null,
        source: 'global',
    };
};

/* -------------------------------------------------------------------------- */
/*  Calculate the buyer fee for an amount                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns { amount, type, value, breakdown }.
 *   - amount is the fee to add on top of the price.
 *   - type   is 'percentage' | 'fixed' | 'tiered' | null
 *   - value  is the raw % or $ value (0 for tiered).
 *   - breakdown is filled for tiered rules.
 */
export const calculateBuyerFee = (structure, amount) => {
    if (!structure) return { amount: 0, type: null, value: 0, breakdown: [] };

    const cents = Math.max(0, Math.round((Number(amount) || 0) * 100));

    if (structure.type === 'flat') {
        const mode = structure.flat?.mode;
        const value = Number(structure.flat?.value || 0);
        const feeCents =
            mode === 'fixed' ? Math.round(value * 100) : Math.round((cents * value) / 100);
        return { amount: feeCents / 100, type: mode, value, breakdown: [] };
    }

    if (structure.type === 'tiered') {
        let lower = 0;
        let totalCents = 0;
        const breakdown = [];

        for (const tier of structure.tiers || []) {
            const hasLimit = tier.upTo !== null && tier.upTo !== undefined;
            const upper = hasLimit ? Math.round(Number(tier.upTo) * 100) : Infinity;
            const portion = Math.min(cents, upper) - lower;

            if (portion > 0) {
                const feeCents = Math.round((portion * Number(tier.rate)) / 100);
                totalCents += feeCents;
                breakdown.push({
                    from: lower / 100,
                    to: hasLimit ? Number(tier.upTo) : null,
                    rate: Number(tier.rate),
                    amount: portion / 100,
                    fee: feeCents / 100,
                });
            }

            lower = upper;
            if (cents <= upper) break;
        }

        return { amount: totalCents / 100, type: 'tiered', value: 0, breakdown };
    }

    return { amount: 0, type: null, value: 0, breakdown: [] };
};

/* -------------------------------------------------------------------------- */
/*  Short label for the buyer premium line                                    */
/* -------------------------------------------------------------------------- */

export const formatCommissionLabel = (structure) => {
    if (!structure) return '0%';
    if (structure.type === 'flat') {
        return structure.flat?.mode === 'fixed'
            ? `$${structure.flat.value}`
            : `${structure.flat.value}%`;
    }
    if (structure.type === 'tiered') return 'Tiered';
    return '0%';
};

/* -------------------------------------------------------------------------- */
/*  One-shot fetch: returns the resolved buyer rule for an auction            */
/*  (only calls the global endpoint when the auction doesn't have its own)    */
/* -------------------------------------------------------------------------- */

export const fetchBuyerRule = async (auction, axiosInstance) => {
    // The auction already tells us everything we need — no network call.
    if (auction?.commission?.buyer) {
        return resolveBuyerRule(auction, null);
    }

    const { data } = await axiosInstance.get('/api/v1/commissions');
    const globalCommission = data?.data?.commission || null;
    return resolveBuyerRule(auction, globalCommission);
};