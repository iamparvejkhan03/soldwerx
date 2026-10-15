import mongoose from 'mongoose';
import Commission from '../models/commission.model.js';
import CommissionStructure from '../models/commissionStructure.model.js';
import {
    getGlobalCommissionSettings,
    validateStructureRules,
    makeNameKey,
} from '../utils/commissionCalculator.js';

/* -------------------------------------------------------------------------- */
/*  Global commission settings                                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/commissions   (public)
 * Returns the global settings with both structures populated.
 */
export const getCommissions = async (req, res) => {
    try {
        const commission = await getGlobalCommissionSettings();
        res.status(200).json({ success: true, data: { commission } });
    } catch (error) {
        console.error('Get commission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * PUT /api/v1/commissions   (admin + manage_commissions)
 * Body: { buyerEnabled, buyerStructure: <id>, sellerEnabled, sellerStructure: <id> }
 * Every field is optional; only the ones sent are changed.
 */
export const updateCommission = async (req, res) => {
    try {
        const { buyerEnabled, buyerStructure, sellerEnabled, sellerStructure } = req.body;

        if (buyerEnabled !== undefined && typeof buyerEnabled !== 'boolean') {
            return res.status(400).json({ success: false, message: 'buyerEnabled must be true or false' });
        }
        if (sellerEnabled !== undefined && typeof sellerEnabled !== 'boolean') {
            return res.status(400).json({ success: false, message: 'sellerEnabled must be true or false' });
        }

        // Validate the chosen structures exist
        for (const [label, id] of [['Buyer', buyerStructure], ['Seller', sellerStructure]]) {
            if (id === undefined) continue;
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ success: false, message: `${label} structure is invalid` });
            }
            const exists = await CommissionStructure.exists({ _id: id });
            if (!exists) {
                return res.status(404).json({ success: false, message: `${label} structure not found` });
            }
        }

        // Make sure the settings document exists (and is seeded) before editing it
        await getGlobalCommissionSettings();
        const commission = await Commission.findOne();

        if (buyerEnabled !== undefined) commission.buyerEnabled = buyerEnabled;
        if (buyerStructure !== undefined) commission.buyerStructure = buyerStructure;
        if (sellerEnabled !== undefined) commission.sellerEnabled = sellerEnabled;
        if (sellerStructure !== undefined) commission.sellerStructure = sellerStructure;

        commission.updatedBy = req.user._id;
        await commission.save();

        res.status(200).json({
            success: true,
            message: 'Commission settings updated',
            data: { commission: await getGlobalCommissionSettings() },
        });
    } catch (error) {
        console.error('Update commission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* -------------------------------------------------------------------------- */
/*  Commission structures                                                     */
/* -------------------------------------------------------------------------- */

const validateStructureBody = (body) => {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return { error: 'Name is required.' };
    if (name.length > 80) return { error: 'Name must be 80 characters or less.' };

    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (description.length > 300) return { error: 'Description must be 300 characters or less.' };

    const { error, data } = validateStructureRules(body);
    if (error) return { error };

    return { data: { name, description, ...data } };
};

/** GET /api/v1/commissions/structures */
export const listStructures = async (req, res) => {
    try {
        const structures = await CommissionStructure.find().sort({ createdAt: 1 }).lean();
        res.status(200).json({ success: true, data: { structures } });
    } catch (error) {
        console.error('List structures error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/** GET /api/v1/commissions/structures/:id */
export const getStructure = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid structure id' });
        }
        const structure = await CommissionStructure.findById(id).lean();
        if (!structure) {
            return res.status(404).json({ success: false, message: 'Commission structure not found' });
        }
        res.status(200).json({ success: true, data: { structure } });
    } catch (error) {
        console.error('Get structure error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/** POST /api/v1/commissions/structures */
export const createStructure = async (req, res) => {
    try {
        const { error, data } = validateStructureBody(req.body);
        if (error) return res.status(400).json({ success: false, message: error });

        const structure = await CommissionStructure.create({
            ...data,
            nameKey: makeNameKey(data.name),
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Commission structure created',
            data: { structure },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A structure with this name already exists.' });
        }
        console.error('Create structure error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/** PUT /api/v1/commissions/structures/:id */
export const updateStructure = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid structure id' });
        }

        const { error, data } = validateStructureBody(req.body);
        if (error) return res.status(400).json({ success: false, message: error });

        const structure = await CommissionStructure.findById(id);
        if (!structure) {
            return res.status(404).json({ success: false, message: 'Commission structure not found' });
        }

        structure.name = data.name;
        structure.nameKey = makeNameKey(data.name);
        structure.description = data.description;
        structure.type = data.type;
        structure.flat = data.type === 'flat' ? data.flat : undefined;
        structure.tiers = data.tiers;
        structure.updatedBy = req.user._id;

        await structure.save();

        res.status(200).json({
            success: true,
            message: 'Commission structure updated',
            data: { structure },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A structure with this name already exists.' });
        }
        console.error('Update structure error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/** DELETE /api/v1/commissions/structures/:id */
export const deleteStructure = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid structure id' });
        }

        const structure = await CommissionStructure.findById(id);
        if (!structure) {
            return res.status(404).json({ success: false, message: 'Commission structure not found' });
        }

        // A structure that is the global default cannot be deleted
        const inUse = await Commission.findOne({
            $or: [{ buyerStructure: id }, { sellerStructure: id }],
        }).lean();

        if (inUse) {
            const sides = [];
            if (String(inUse.buyerStructure) === id) sides.push('buyer');
            if (String(inUse.sellerStructure) === id) sides.push('seller');
            return res.status(409).json({
                success: false,
                message: `This structure is the global ${sides.join(' and ')} commission. Select a different structure in the global settings first.`,
            });
        }

        await structure.deleteOne();

        res.status(200).json({ success: true, message: 'Commission structure deleted' });
    } catch (error) {
        console.error('Delete structure error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};