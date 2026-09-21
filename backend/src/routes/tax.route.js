import { Router } from 'express';
import { getTaxSettings, updateTaxSettings } from '../controllers/tax.controller.js';
import { authAdmin } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/permission.middleware.js';

const taxRouter = Router();

taxRouter.get('/', getTaxSettings);
taxRouter.put('/', authAdmin, requirePermission("manage_tax"), updateTaxSettings);

export default taxRouter;