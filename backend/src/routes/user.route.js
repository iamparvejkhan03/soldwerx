import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import {
    completeCardUpdate,
    completeRegistration,
    deleteIdentification,
    forgotPassword,
    getBillingInfo,
    getVerificationStatus,
    loginUser,
    refreshAccessToken,
    registerUser,
    resetPassword,
    updatePaymentMethod,
    uploadIdentification,
} from "../controllers/user.controller.js";

import {
    getProfile,
    updateProfile,
    changePassword,
    getUserStats,
} from "../controllers/profile.controller.js";

import {
    getEmailPreferences,
    updateEmailPreferences,
    previewUnsubscribe,
    unsubscribe,
    unsubscribeOneClick,
} from "../controllers/emailPreference.controller.js";

import { auth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Public routes
userRouter.post('/register', upload.single('identificationDocument'), registerUser);
userRouter.post('/complete-registration', completeRegistration);
userRouter.post('/login', loginUser);
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);

// Protected routes
userRouter.get('/profile', auth, getProfile);
userRouter.put('/profile', auth, upload.single('image'), updateProfile);
userRouter.put('/change-password', auth, changePassword);
userRouter.get('/stats/:userType', auth, getUserStats);
userRouter.get('/billing', auth, getBillingInfo);
userRouter.put('/billing/update-card', auth, updatePaymentMethod);
userRouter.post('/billing/complete-card-update', auth, completeCardUpdate);

// ID Verification routes (Protected)
userRouter.post('/upload-identification',
    auth,
    upload.single('identificationDocument'),
    uploadIdentification
);
userRouter.get('/verification-status', auth, getVerificationStatus);
userRouter.delete('/identification', auth, deleteIdentification);

// Email preferences (protected)
userRouter.get('/email-preferences', auth, getEmailPreferences);
userRouter.put('/email-preferences', auth, updateEmailPreferences);

// Unsubscribe (public — no auth; links come from emails)
userRouter.post('/unsubscribe/one-click', unsubscribeOneClick);
userRouter.post('/unsubscribe', unsubscribe);
userRouter.get('/unsubscribe/:token', previewUnsubscribe);

export default userRouter;