import Communication from "../models/communication.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import { uploadDocumentToCloudinary } from "../utils/cloudinary.js";
import { newMessageNotificationEmail, shippingUpdatedEmail } from "../utils/nodemailer.js";

// ----- Helper -----
const getOrCreateCommunication = async (auctionId, userId) => {
    const auction = await Auction.findById(auctionId)
        .populate("seller", "_id")
        .populate("winner", "_id");
    if (!auction) throw new Error("Auction not found");

    // Only allow for sold auctions
    if (auction.status !== "sold" && auction.status !== "sold_buy_now") {
        throw new Error("Communication is only available for sold auctions");
    }

    // Authorization
    const isSeller = auction.seller._id.toString() === userId.toString();
    const isBidder = auction.winner && auction.winner._id.toString() === userId.toString();
    const user = await User.findById(userId);
    const isAdmin = user?.userType === "admin";
    if (!isSeller && !isBidder && !isAdmin) {
        throw new Error("You do not have access to this communication");
    }

    if (!auction.winner) {
        throw new Error("Auction has no winner yet");
    }

    let comm = await Communication.findOne({ auction: auctionId });
    if (!comm) {
        comm = new Communication({
            auction: auctionId,
            seller: auction.seller._id,
            winningBidder: auction.winner._id,
            messages: [],
            shippingInfo: {},
            lastMessageAt: new Date(),
        });
        await comm.save();
    }
    return comm;
};

// ----- GET communication -----
export const getCommunication = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const comm = await getOrCreateCommunication(auctionId, userId);

        // Populate all needed fields
        await comm.populate("messages.sender", "username firstName lastName userType");
        await comm.populate("shippingInfo.updatedBy", "username firstName lastName");
        await comm.populate("seller", "username firstName lastName email");
        await comm.populate("winningBidder", "username firstName lastName email");
        await comm.populate("auction", "title category finalPrice status");

        res.status(200).json({
            success: true,
            data: comm,
        });
    } catch (error) {
        console.error("Get communication error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ----- POST send message (with file attachments) -----
export const sendMessage = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        // Get auction for validation
        const auction = await Auction.findById(auctionId)
            .populate("seller", "_id")
            .populate("winner", "_id");
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
        if (!auction.winner) return res.status(400).json({ success: false, message: "Auction has no winner" });
        if (auction.status !== "sold" && auction.status !== "sold_buy_now") {
            return res.status(400).json({ success: false, message: "Communication only for sold auctions" });
        }

        const isSeller = auction.seller._id.toString() === userId.toString();
        const isBidder = auction.winner._id.toString() === userId.toString();
        const user = await User.findById(userId);
        const isAdmin = user?.userType === "admin";
        if (!isSeller && !isBidder && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        let role = "bidder";
        if (isSeller) role = "seller";
        else if (isAdmin) role = "admin";

        // Get or create communication
        let comm = await Communication.findOne({ auction: auctionId });
        if (!comm) {
            comm = new Communication({
                auction: auctionId,
                seller: auction.seller._id,
                winningBidder: auction.winner._id,
                messages: [],
                shippingInfo: {},
                lastMessageAt: new Date(),
            });
        }

        // Upload attachments
        const attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadDocumentToCloudinary(
                        file.buffer,
                        file.originalname,
                        "communication-attachments"
                    );
                    attachments.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: result.originalname || file.originalname,
                        originalName: file.originalname,
                        uploadedAt: new Date(),
                    });
                } catch (uploadError) {
                    console.error("Attachment upload error:", uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload attachment: ${file.originalname}`,
                    });
                }
            }
        }

        // Build message
        const message = {
            sender: userId,
            senderRole: role,
            content: content || "",
            attachments,
            readBy: [userId],
        };

        comm.messages.push(message);
        comm.lastMessageAt = new Date();
        await comm.save();

        // Populate for response
        await comm.populate("messages.sender", "username firstName lastName userType");
        await comm.populate("seller", "username firstName lastName");
        await comm.populate("winningBidder", "username firstName lastName");
        await comm.populate("auction", "title category finalPrice status");

        // ============================================================
        // FIRE-AND-FORGET EMAIL NOTIFICATIONS (background)
        // ============================================================

        // Determine who to notify (the other party)
        // If sender is seller → notify winning bidder
        // If sender is bidder → notify seller
        // If sender is admin → notify BOTH seller AND winning bidder

        const sender = user; // The user who sent the message
        const seller = await User.findById(auction.seller._id).select("email firstName lastName username userType");
        const winningBidder = await User.findById(auction.winner._id).select("email firstName lastName username userType");

        // Function to send email in background (no await)
        const sendNotification = (recipient, senderUser, auctionData, messageContent, commId) => {
            if (recipient && recipient.email && recipient._id.toString() !== senderUser._id.toString()) {
                newMessageNotificationEmail(
                    recipient,
                    senderUser,
                    auctionData,
                    messageContent || 'No text content (attachment(s) sent)',
                    commId
                ).catch(err => console.error("Background email error:", err));
            }
        };

        if (isAdmin) {
            // Admin sent message → notify BOTH seller and winning bidder
            sendNotification(seller, sender, auction, content, comm._id);
            sendNotification(winningBidder, sender, auction, content, comm._id);
        } else if (isSeller) {
            // Seller sent message → notify winning bidder only
            sendNotification(winningBidder, sender, auction, content, comm._id);
        } else if (isBidder) {
            // Bidder sent message → notify seller only
            sendNotification(seller, sender, auction, content, comm._id);
        }

        res.status(201).json({
            success: true,
            message: "Message sent",
            data: comm,
        });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ----- PUT update shipping info (seller or admin only) -----
export const updateShipping = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { company, trackingNumber, estimatedDelivery, notes } = req.body;
        const userId = req.user._id;

        // Fetch auction with full details
        const auction = await Auction.findById(auctionId)
            .populate("seller", "_id")
            .populate("winner", "_id");
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });

        // Authorization: seller or admin
        const isSeller = auction.seller._id.toString() === userId.toString();
        const user = await User.findById(userId);
        const isAdmin = user?.userType === "admin";
        if (!isSeller && !isAdmin) {
            return res.status(403).json({ success: false, message: "Only seller or admin can update shipping" });
        }

        // Get or create communication
        let comm = await Communication.findOne({ auction: auctionId });
        if (!comm) {
            comm = new Communication({
                auction: auctionId,
                seller: auction.seller._id,
                winningBidder: auction.winner._id,
                messages: [],
                shippingInfo: {},
                lastMessageAt: new Date(),
            });
        }

        // Prepare shipping info object
        const shippingInfo = {
            company: company || comm.shippingInfo.company,
            trackingNumber: trackingNumber || comm.shippingInfo.trackingNumber,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : comm.shippingInfo.estimatedDelivery,
            notes: notes || comm.shippingInfo.notes,
            updatedBy: userId,
            updatedAt: new Date(),
        };

        // Update shipping info
        comm.shippingInfo = shippingInfo;

        // Add a system message about shipping update
        const systemMessage = {
            sender: userId,
            senderRole: isAdmin ? "admin" : "seller",
            content: `Shipping information updated${isAdmin ? " by admin" : ""}.`,
            attachments: [],
            readBy: [userId],
        };
        comm.messages.push(systemMessage);
        comm.lastMessageAt = new Date();

        await comm.save();

        // Populate for response
        await comm.populate("messages.sender", "username firstName lastName userType");
        await comm.populate("seller", "username firstName lastName");
        await comm.populate("winningBidder", "username firstName lastName");
        await comm.populate("auction", "title category finalPrice status");

        // --- Fire-and-forget email to winning bidder ---
        const winningBidder = await User.findById(auction.winner._id).select("email firstName lastName username");
        if (winningBidder && winningBidder.email) {
            // Send email in background (no await)
            shippingUpdatedEmail(
                winningBidder,
                auction,
                shippingInfo,
                user, // the updater (admin or seller)
                isAdmin ? "Admin" : "Seller"
            ).catch(err => console.error("Background email error:", err));
        }

        res.status(200).json({
            success: true,
            message: "Shipping info updated",
            data: comm,
        });
    } catch (error) {
        console.error("Update shipping error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ----- POST mark all messages as read -----
export const markRead = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user._id;

        const comm = await Communication.findOne({ auction: auctionId });
        if (!comm) return res.status(404).json({ success: false, message: "Communication not found" });

        let updated = false;
        comm.messages.forEach((msg) => {
            if (!msg.readBy.some(id => id.toString() === userId.toString())) {
                msg.readBy.push(userId);
                updated = true;
            }
        });
        if (updated) await comm.save();

        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET all communications (admin only)
export const getAllCommunications = async (req, res) => {
    try {
        // Only admin can access
        const user = await User.findById(req.user._id);
        if (user.userType !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        const communications = await Communication.find()
            .populate("auction", "title category finalPrice status")
            .populate("seller", "username firstName lastName email")
            .populate("winningBidder", "username firstName lastName email")
            .sort({ lastMessageAt: -1 });

        res.status(200).json({
            success: true,
            data: communications,
        });
    } catch (error) {
        console.error("Get all communications error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};