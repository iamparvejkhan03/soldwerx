import { Router } from 'express';
import {
    getCommissions,
    updateCommission,
    listStructures,
    getStructure,
    createStructure,
    updateStructure,
    deleteStructure,
} from '../controllers/commission.controller.js';
import { authAdmin } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const commissionRouter = Router();

// Global settings
commissionRouter.get('/', getCommissions); // public
commissionRouter.put('/', authAdmin, requirePermission("manage_commissions"), updateCommission);

// Commission structures (admin / staff with manage_commissions)
commissionRouter.get('/structures', authAdmin, requirePermission("manage_commissions"), listStructures);
commissionRouter.post('/structures', authAdmin, requirePermission("manage_commissions"), createStructure);
commissionRouter.get('/structures/:id', authAdmin, requirePermission("manage_commissions"), getStructure);
commissionRouter.put('/structures/:id', authAdmin, requirePermission("manage_commissions"), updateStructure);
commissionRouter.delete('/structures/:id', authAdmin, requirePermission("manage_commissions"), deleteStructure);

export default commissionRouter;