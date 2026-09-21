import { Router } from 'express';
import {
    submitLiquidateRequest,
    getLiquidateRequests,
    updateLiquidateRequest,
    deleteLiquidateRequest,
    getLiquidateStats
} from '../controllers/liquidateRequest.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const liquidateRouter = Router();

// Public route - submit liquidate request
liquidateRouter.post(
    '/submit',
    upload.array('photos', 5),
    submitLiquidateRequest
);

// Admin routes
liquidateRouter.get('/admin/requests', auth, authAdmin, requirePermission("manage_liquidations"), getLiquidateRequests);
liquidateRouter.put('/admin/requests/:requestId', auth, authAdmin, requirePermission("manage_liquidations"), updateLiquidateRequest);
liquidateRouter.delete('/admin/requests/:requestId', auth, authAdmin, requirePermission("manage_liquidations"), deleteLiquidateRequest);
liquidateRouter.get('/admin/requests/stats', auth, authAdmin, requirePermission("manage_liquidations"), getLiquidateStats);

export default liquidateRouter;