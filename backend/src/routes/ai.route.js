import { Router } from 'express';
import { analyzeAuctionImages } from '../controllers/ai.controller.js';
import { authSeller, authAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const aiRouter = Router();

// AI analysis endpoint - accessible by sellers, staff, and admins
aiRouter.post(
    '/analyze-auction',
    authSeller,
    upload.fields([{ name: 'photos', maxCount: 20 }]),
    analyzeAuctionImages
);

export default aiRouter;