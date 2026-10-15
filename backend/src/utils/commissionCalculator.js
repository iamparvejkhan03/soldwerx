import Commission from '../models/commission.model.js';
import CommissionStructure from '../models/commissionStructure.model.js';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const MAX_TIERS = 20;
const MAX_AMOUNT = 1e12;

const isNum = (v) =>
  v !== null && v !== undefined && v !== '' && typeof v !== 'boolean' && Number.isFinite(Number(v));

// All money math is done in integer cents to avoid floating point errors.
const toCents = (n) => Math.round(Number(n) * 100);

export const makeNameKey = (name) => String(name || '').trim().toLowerCase();

/* -------------------------------------------------------------------------- */
/*  Validation (pure, shared by structures now and per-auction commission later) */
/* -------------------------------------------------------------------------- */

/**
 * Validates and normalises the rules of a structure.
 * Input:  { type: 'flat', flat: { mode, value } }
 *      or { type: 'tiered', tiers: [{ upTo, rate }, ...] }
 * Returns { error } or { data } where data only contains the fields relevant to the type.
 */
export const validateStructureRules = (input = {}) => {
  const { type } = input;

  if (!['flat', 'tiered'].includes(type)) {
    return { error: 'Type must be "flat" or "tiered".' };
  }

  if (type === 'flat') {
    const mode = input.flat?.mode;
    const rawValue = input.flat?.value;

    if (!['percentage', 'fixed'].includes(mode)) {
      return { error: 'Flat commission must be either "percentage" or "fixed".' };
    }
    if (!isNum(rawValue) || Number(rawValue) < 0) {
      return { error: 'Flat commission value must be a number greater than or equal to 0.' };
    }
    const value = Number(rawValue);
    if (mode === 'percentage' && value > 100) {
      return { error: 'Flat percentage cannot be more than 100.' };
    }
    if (value > MAX_AMOUNT) {
      return { error: 'Flat commission value is too large.' };
    }

    return { data: { type, flat: { mode, value }, tiers: [] } };
  }

  // Tiered
  const tiers = input.tiers;
  if (!Array.isArray(tiers) || tiers.length < 2) {
    return { error: 'A tiered commission needs at least 2 tiers. Use a flat commission for a single rate.' };
  }
  if (tiers.length > MAX_TIERS) {
    return { error: `A tiered commission can have at most ${MAX_TIERS} tiers.` };
  }

  const cleaned = [];
  let previousLimit = 0;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i] || {};
    const isLast = i === tiers.length - 1;
    const label = `Tier ${i + 1}`;

    if (!isNum(tier.rate)) {
      return { error: `${label}: rate is required.` };
    }
    const rate = Number(tier.rate);
    if (rate < 0 || rate > 100) {
      return { error: `${label}: rate must be between 0 and 100.` };
    }

    if (isLast) {
      if (tier.upTo !== null && tier.upTo !== undefined && tier.upTo !== '') {
        return { error: 'The last tier must have no upper limit (it applies to everything above the previous tier).' };
      }
      cleaned.push({ upTo: null, rate });
    } else {
      if (!isNum(tier.upTo)) {
        return { error: `${label}: the "up to" amount is required.` };
      }
      const upTo = Math.round(Number(tier.upTo) * 100) / 100;
      if (upTo <= previousLimit) {
        return { error: `${label}: the "up to" amount must be greater than ${previousLimit}. Tiers must be in ascending order.` };
      }
      if (upTo > MAX_AMOUNT) {
        return { error: `${label}: the "up to" amount is too large.` };
      }
      cleaned.push({ upTo, rate });
      previousLimit = upTo;
    }
  }

  return { data: { type, flat: undefined, tiers: cleaned } };
};

/* -------------------------------------------------------------------------- */
/*  Fee calculation (pure)                                                    */
/* -------------------------------------------------------------------------- */

const EMPTY_SIDE = Object.freeze({
  amount: 0,
  type: null,
  value: 0,
  breakdown: [],
  structureName: null,
});

/**
 * Calculates the fee of ONE structure for a given amount.
 * Tiers are progressive: each tier's rate applies only to the part of the
 * amount that falls inside that tier.
 *
 * Returns { amount, type: 'percentage'|'fixed'|'tiered', value, breakdown }
 *  - value is the percentage/fixed value for flat structures, 0 for tiered.
 *  - breakdown is filled for tiered structures only:
 *      [{ from, to, rate, amount (part of the price in this tier), fee }]
 */
export const calculateStructureFee = (structure, amount) => {
  if (!structure) return { ...EMPTY_SIDE };

  const amountCents = Math.max(0, toCents(amount || 0));

  if (structure.type === 'flat') {
    const mode = structure.flat?.mode;
    const value = Number(structure.flat?.value || 0);
    const feeCents =
      mode === 'fixed' ? toCents(value) : Math.round((amountCents * value) / 100);

    return { amount: feeCents / 100, type: mode, value, breakdown: [] };
  }

  if (structure.type === 'tiered') {
    let lower = 0;
    let totalCents = 0;
    const breakdown = [];

    for (const tier of structure.tiers || []) {
      const hasLimit = tier.upTo !== null && tier.upTo !== undefined;
      const upper = hasLimit ? toCents(tier.upTo) : Infinity;
      const portion = Math.min(amountCents, upper) - lower;

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
      if (amountCents <= upper) break;
    }

    return { amount: totalCents / 100, type: 'tiered', value: 0, breakdown };
  }

  return { ...EMPTY_SIDE };
};

/* -------------------------------------------------------------------------- */
/*  Global settings                                                           */
/* -------------------------------------------------------------------------- */

const DEFAULT_STRUCTURE = {
  name: 'Standard 5% Flat',
  type: 'flat',
  flat: { mode: 'percentage', value: 5 },
};

const populateGlobal = () =>
  Commission.findOne().populate('buyerStructure').populate('sellerStructure').lean();

/**
 * Makes sure the global settings document exists and both sides point to a structure.
 * - Creates a default "Standard 5% Flat" structure if needed.
 * - Removes the legacy fields (buyerType, buyerValue, sellerType, sellerValue).
 * Safe to call many times; it only writes when something is missing.
 */
const seedGlobalCommission = async (existing) => {
  const defaultStructure = await CommissionStructure.findOneAndUpdate(
    { nameKey: makeNameKey(DEFAULT_STRUCTURE.name) },
    {
      $setOnInsert: {
        name: DEFAULT_STRUCTURE.name,
        nameKey: makeNameKey(DEFAULT_STRUCTURE.name),
        description: 'Default commission created automatically.',
        type: DEFAULT_STRUCTURE.type,
        flat: DEFAULT_STRUCTURE.flat,
        tiers: [],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const set = {};
  if (!existing?.buyerStructure) set.buyerStructure = defaultStructure._id;
  if (!existing?.sellerStructure) set.sellerStructure = defaultStructure._id;

  const update = { $setOnInsert: { buyerEnabled: true, sellerEnabled: true } };
  if (Object.keys(set).length) update.$set = set;

  const settings = await Commission.findOneAndUpdate({}, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  // Clean legacy fields from the stored document (they are no longer in the schema)
  await Commission.collection.updateOne(
    { _id: settings._id },
    { $unset: { buyerType: '', buyerValue: '', sellerType: '', sellerValue: '' } }
  );

  return settings;
};

/**
 * Returns the global settings as a plain object with both structures populated:
 * { _id, buyerEnabled, buyerStructure: {...}, sellerEnabled, sellerStructure: {...}, ... }
 */
export const getGlobalCommissionSettings = async () => {
  let settings = await populateGlobal();

  if (!settings || !settings.buyerStructure || !settings.sellerStructure) {
    await seedGlobalCommission(settings);
    settings = await populateGlobal();
  }

  return settings;
};

/* -------------------------------------------------------------------------- */
/*  Main calculation                                                          */
/* -------------------------------------------------------------------------- */

const computeSide = (finalPrice, rule) => {
  if (!rule || rule.enabled === false || !rule.structure) return { ...EMPTY_SIDE };

  const result = calculateStructureFee(rule.structure, finalPrice);
  return { ...result, structureName: rule.structure.name || null };
};

/**
 * Calculates buyer and seller commission for a final price.
 *
 * @param {number} finalPrice
 * @param {object|null} auctionCommission  Optional per-auction commission (used in Phase 2):
 *   { buyer?: { enabled, structure }, seller?: { enabled, structure } }
 *   where `structure` has the same shape as a CommissionStructure
 *   ({ name, type, flat, tiers }). A side that is not provided uses the global setting.
 */
export const calculateCommissions = async (finalPrice, auctionCommission = null) => {
  const override =
    auctionCommission && typeof auctionCommission === 'object' ? auctionCommission : null;

  // Presence of a side counts as an override — even { enabled: false }
  // (which means "no commission for this side on this auction").
  const hasBuyerOverride = Boolean(override?.buyer);
  const hasSellerOverride = Boolean(override?.seller);

  const global =
    hasBuyerOverride && hasSellerOverride ? null : await getGlobalCommissionSettings();

  const buyerRule = hasBuyerOverride
    ? override.buyer
    : { enabled: global.buyerEnabled, structure: global.buyerStructure };

  const sellerRule = hasSellerOverride
    ? override.seller
    : { enabled: global.sellerEnabled, structure: global.sellerStructure };

  const buyer = computeSide(finalPrice, buyerRule);
  const seller = computeSide(finalPrice, sellerRule);

  return {
    buyerFeeAmount: buyer.amount,
    sellerFeeAmount: seller.amount,
    buyerFeeType: buyer.type,
    buyerFeeValue: buyer.value,
    sellerFeeType: seller.type,
    sellerFeeValue: seller.value,
    buyerFeeBreakdown: buyer.breakdown,
    sellerFeeBreakdown: seller.breakdown,
    buyerFeeStructureName: buyer.structureName,
    sellerFeeStructureName: seller.structureName,
  };
};

/**
 * Calculates the commission for an auction's finalPrice and writes every
 * fee field onto the auction document (it does NOT save it).
 * Replaces the copy-pasted blocks that used to live in auction.model.js.
 */
export const applyCommissionToAuction = async (auction) => {
  const fees = await calculateCommissions(auction.finalPrice, auction.commission);

  auction.buyerFeeAmount = fees.buyerFeeAmount;
  auction.sellerFeeAmount = fees.sellerFeeAmount;
  auction.buyerFeeType = fees.buyerFeeType;
  auction.buyerFeeValue = fees.buyerFeeValue;
  auction.sellerFeeType = fees.sellerFeeType;
  auction.sellerFeeValue = fees.sellerFeeValue;
  auction.buyerFeeBreakdown = fees.buyerFeeBreakdown;
  auction.sellerFeeBreakdown = fees.sellerFeeBreakdown;
  auction.buyerFeeStructureName = fees.buyerFeeStructureName;
  auction.sellerFeeStructureName = fees.sellerFeeStructureName;

  return fees;
};