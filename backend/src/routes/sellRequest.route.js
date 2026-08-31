import { Router } from 'express';
import multer from 'multer';
import {
    submitSellRequest,
    getSellRequests,
    updateSellRequest,
    deleteSellRequest,
    getSellStats
} from '../controllers/sellRequest.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';

const sellRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    }
});

// Public route - submit sell request
sellRouter.post(
    '/submit',
    upload.array('photos', 5),
    submitSellRequest
);

// Admin routes
sellRouter.get('/admin/requests', auth, authAdmin, getSellRequests);
sellRouter.put('/admin/requests/:requestId', auth, authAdmin, updateSellRequest);
sellRouter.delete('/admin/requests/:requestId', auth, authAdmin, deleteSellRequest);
sellRouter.get('/admin/requests/stats', auth, authAdmin, getSellStats);

export default sellRouter;