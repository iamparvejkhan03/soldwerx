import { Router } from "express";
import express from "express";
import {
    createBankTransferPayment,
    fetchBankDetails,
    getAuctionPaymentStatus,
    getBidderPayments,
} from "../controllers/payment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// Protected routes
paymentRouter.use(auth);
paymentRouter.get("/auction/:auctionId/status", getAuctionPaymentStatus);

// Add these new routes
paymentRouter.post("/create-bank-transfer-payment", createBankTransferPayment);
paymentRouter.get("/bank-details", fetchBankDetails);

paymentRouter.get('/bidder', getBidderPayments);

export default paymentRouter;