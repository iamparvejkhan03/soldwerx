import Tax from '../models/tax.model.js';

/**
 * GET /api/v1/tax - Get current tax settings
 */
export const getTaxSettings = async (req, res) => {
    try {
        let tax = await Tax.findOne();
        if (!tax) {
            // Create default (disabled)
            tax = await Tax.create({ enabled: false, type: 'percentage', value: 0 });
        }
        res.status(200).json({ success: true, data: { tax } });
    } catch (error) {
        console.error('Get tax error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * PUT /api/v1/tax - Update tax settings (admin only)
 */
export const updateTaxSettings = async (req, res) => {
    try {
        const { enabled, type, value } = req.body;

        // Validations
        if (enabled !== undefined && typeof enabled !== 'boolean') {
            return res.status(400).json({ success: false, message: 'enabled must be boolean' });
        }
        if (type && !['fixed', 'percentage'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid tax type' });
        }
        if (value !== undefined && (typeof value !== 'number' || value < 0)) {
            return res.status(400).json({ success: false, message: 'Value must be a non-negative number' });
        }

        let tax = await Tax.findOne();
        if (!tax) {
            tax = new Tax();
        }

        if (enabled !== undefined) tax.enabled = enabled;
        if (type) tax.type = type;
        if (value !== undefined) tax.value = value;
        tax.updatedBy = req.user._id;

        await tax.save();

        res.status(200).json({
            success: true,
            message: 'Tax settings updated',
            data: { tax },
        });
    } catch (error) {
        console.error('Update tax error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};