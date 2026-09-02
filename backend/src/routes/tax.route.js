import { Router } from 'express';
import { getTaxSettings, updateTaxSettings } from '../controllers/tax.controller.js';
import { authAdmin } from '../middlewares/auth.middleware.js';

const taxRouter = Router();

taxRouter.get('/', getTaxSettings);
taxRouter.put('/', authAdmin, updateTaxSettings);

export default taxRouter;