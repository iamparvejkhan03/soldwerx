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

const liquidateRouter = Router();

// Public route - submit liquidate request
liquidateRouter.post(
    '/submit',
    upload.array('photos', 5),
    submitLiquidateRequest
);

// Admin routes
liquidateRouter.get('/admin/requests', auth, authAdmin, getLiquidateRequests);
liquidateRouter.put('/admin/requests/:requestId', auth, authAdmin, updateLiquidateRequest);
liquidateRouter.delete('/admin/requests/:requestId', auth, authAdmin, deleteLiquidateRequest);
liquidateRouter.get('/admin/requests/stats', auth, authAdmin, getLiquidateStats);

export default liquidateRouter;