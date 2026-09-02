import Commission from "../models/commission.model.js";

export const getCommissions = async (req, res) => {
    try {
        let commission = await Commission.findOne();
        if (!commission) {
            commission = await Commission.create({
                buyerEnabled: true,
                buyerType: 'percentage',
                buyerValue: 5,
                sellerEnabled: true,
                sellerType: 'percentage',
                sellerValue: 5,
            });
        }
        res.status(200).json({ success: true, data: { commission } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateCommission = async (req, res) => {
    try {
        const { buyerEnabled, buyerType, buyerValue, sellerEnabled, sellerType, sellerValue } = req.body;

        // Validation
        if (buyerType && !['fixed', 'percentage'].includes(buyerType)) {
            return res.status(400).json({ success: false, message: 'Invalid buyer type' });
        }
        if (sellerType && !['fixed', 'percentage'].includes(sellerType)) {
            return res.status(400).json({ success: false, message: 'Invalid seller type' });
        }
        if (buyerValue !== undefined && buyerValue < 0) {
            return res.status(400).json({ success: false, message: 'Buyer value must be >= 0' });
        }
        if (sellerValue !== undefined && sellerValue < 0) {
            return res.status(400).json({ success: false, message: 'Seller value must be >= 0' });
        }

        let commission = await Commission.findOne();
        if (!commission) {
            commission = new Commission();
        }

        if (buyerEnabled !== undefined) commission.buyerEnabled = buyerEnabled;
        if (buyerType) commission.buyerType = buyerType;
        if (buyerValue !== undefined) commission.buyerValue = buyerValue;
        if (sellerEnabled !== undefined) commission.sellerEnabled = sellerEnabled;
        if (sellerType) commission.sellerType = sellerType;
        if (sellerValue !== undefined) commission.sellerValue = sellerValue;

        commission.updatedBy = req.user._id;
        await commission.save();

        res.status(200).json({
            success: true,
            message: 'Commission settings updated',
            data: { commission },
        });
    } catch (error) {
        console.error('Update commission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};