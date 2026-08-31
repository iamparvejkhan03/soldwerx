import { Router } from "express";
import {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    getEventWithAuctions,
    getUserEvents,
} from "../controllers/event.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { auth, authSeller } from "../middlewares/auth.middleware.js";

const eventRouter = Router();

// Public routes
eventRouter.get("/", getEvents);
eventRouter.get("/:id", getEvent);
eventRouter.get("/:id/auctions", getEventWithAuctions);

// Protected routes - Seller/Admin
eventRouter.post(
    "/create",
    auth,
    upload.fields([
        { name: "photos" },
        { name: "documents" },
    ]),
    createEvent
);

eventRouter.put(
    "/update/:id",
    auth,
    upload.fields([
        { name: "photos" },
        { name: "documents" },
    ]),
    updateEvent
);

eventRouter.delete("/delete/:id", auth, deleteEvent);
eventRouter.patch("/publish/:id", auth, publishEvent);
eventRouter.get("/user/my-events", auth, getUserEvents);

export default eventRouter;