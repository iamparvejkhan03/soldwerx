import Tax from '../models/tax.model.js';

/**
 * Calculate tax based on global tax settings.
 * @param {number} finalPrice - The final sale price
 * @returns {Object} taxAmount, taxType, taxValue
 */
export const calculateTax = async (finalPrice) => {
    const taxSettings = await Tax.findOne();
    if (!taxSettings || !taxSettings.enabled) {
        return { taxAmount: 0, taxType: null, taxValue: 0 };
    }

    let taxAmount = 0;
    if (taxSettings.type === 'fixed') {
        taxAmount = taxSettings.value;
    } else {
        taxAmount = (finalPrice * taxSettings.value) / 100;
    }

    return {
        taxAmount: Math.round(taxAmount * 100) / 100,
        taxType: taxSettings.type,
        taxValue: taxSettings.value,
    };
};