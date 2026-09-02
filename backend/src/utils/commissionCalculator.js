import Commission from '../models/commission.model.js';

/**
 * Calculate both buyer and seller commissions based on global settings.
 * @param {number} finalPrice - The final sale price (or bid amount for authorization)
 * @param {boolean} forAuthorization - If true, only buyer fee is computed (used for Stripe auth)
 * @returns {Object} buyerFeeAmount, sellerFeeAmount, and the type/value used.
 */
export const calculateCommissions = async (finalPrice, forAuthorization = false) => {
  const settings = await Commission.findOne();
  if (!settings) {
    // Fallback: zero fees
    return {
      buyerFeeAmount: 0,
      sellerFeeAmount: 0,
      buyerFeeType: null,
      buyerFeeValue: 0,
      sellerFeeType: null,
      sellerFeeValue: 0,
    };
  }

  let buyerFee = 0;
  let sellerFee = 0;

  if (settings.buyerEnabled) {
    buyerFee = settings.buyerType === 'fixed'
      ? settings.buyerValue
      : (finalPrice * settings.buyerValue) / 100;
  }

  // Only compute seller fee when not for authorization (i.e., when ending auction)
  if (!forAuthorization && settings.sellerEnabled) {
    sellerFee = settings.sellerType === 'fixed'
      ? settings.sellerValue
      : (finalPrice * settings.sellerValue) / 100;
  }

  return {
    buyerFeeAmount: Math.round(buyerFee * 100) / 100,
    sellerFeeAmount: Math.round(sellerFee * 100) / 100,
    buyerFeeType: settings.buyerType,
    buyerFeeValue: settings.buyerValue,
    sellerFeeType: settings.sellerType,
    sellerFeeValue: settings.sellerValue,
  };
};