import { requirePermission } from './permission.middleware.js';

/**
 * Put this AFTER the multer upload middleware (it needs the parsed form body).
 *
 * - No `commission` field in the request -> nothing to check.
 * - Request from a normal user (seller/bidder) -> the field is silently dropped,
 *   so sellers can never set their own commission.
 * - Request from admin/staff -> requires the "manage_commissions" permission.
 */
export const guardCommissionInput = (req, res, next) => {
    if (req.body?.commission === undefined) return next();

    const userType = req.user?.userType;
    if (userType !== 'admin' && userType !== 'staff') {
        delete req.body.commission;
        return next();
    }

    return requirePermission('manage_commissions')(req, res, next);
};