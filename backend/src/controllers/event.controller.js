import Event from "../models/event.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import {
    uploadImageToCloudinary,
    uploadDocumentToCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

// ============= CREATE EVENT =============
export const createEvent = async (req, res) => {
    try {
        const user = req.user;
        const {
            title,
            description,
            location,
            eventDate,
            endDate,
            auctionIds,
        } = req.body;

        // Validation
        if (!title || !description || !eventDate) {
            return res.status(400).json({
                success: false,
                message: "Title, description, and event date are required",
            });
        }

        // Validate event date is in future
        // if (new Date(eventDate) < new Date()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Event date must be in the future",
        //     });
        // }

        // ========== FIX: Parse auctionIds ==========
        let parsedAuctionIds = [];
        if (auctionIds) {
            try {
                // If it's a string, parse it as JSON
                if (typeof auctionIds === 'string') {
                    parsedAuctionIds = JSON.parse(auctionIds);
                } else if (Array.isArray(auctionIds)) {
                    parsedAuctionIds = auctionIds;
                }
            } catch (error) {
                console.error('Error parsing auctionIds:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid auctionIds format',
                });
            }
        }

        // Validate auctions exist and belong to this user (for sellers)
        // Admin can assign any auction
        if (parsedAuctionIds.length > 0) {
            const query = { _id: { $in: parsedAuctionIds } };

            // If user is not admin, check ownership
            if (user.userType !== 'admin') {
                query.seller = user._id;
            }

            const auctions = await Auction.find(query);

            if (auctions.length !== parsedAuctionIds.length) {
                const foundIds = auctions.map(a => a._id.toString());
                const notFound = parsedAuctionIds.filter(id => !foundIds.includes(id.toString()));
                return res.status(400).json({
                    success: false,
                    message: `Some auctions not found: ${notFound.join(', ')}`,
                });
            }
        }

        // Handle photo uploads
        let uploadedPhotos = [];
        if (req.files && req.files.photos) {
            const photos = Array.isArray(req.files.photos)
                ? req.files.photos
                : [req.files.photos];

            const photoCaptions = Array.isArray(req.body.photoCaptions)
                ? req.body.photoCaptions
                : [];

            for (const [index, photo] of photos.entries()) {
                try {
                    const result = await uploadImageToCloudinary(
                        photo.buffer,
                        "event-photos"
                    );
                    uploadedPhotos.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: photo.originalname,
                        order: index,
                        caption: photoCaptions[index] || "",
                    });
                } catch (uploadError) {
                    console.error("Photo upload error:", uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload photo: ${photo.originalname}`,
                    });
                }
            }
        }

        // Handle document uploads
        let uploadedDocuments = [];
        if (req.files && req.files.documents) {
            const documents = Array.isArray(req.files.documents)
                ? req.files.documents
                : [req.files.documents];

            const documentCaptions = Array.isArray(req.body.documentCaptions)
                ? req.body.documentCaptions
                : [];

            for (const [index, doc] of documents.entries()) {
                try {
                    const result = await uploadDocumentToCloudinary(
                        doc.buffer,
                        doc.originalname,
                        "event-documents"
                    );
                    uploadedDocuments.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: doc.originalname,
                        originalName: doc.originalname,
                        caption: documentCaptions[index] || "",
                    });
                } catch (uploadError) {
                    console.error("Document upload error:", uploadError);
                }
            }
        }

        // Create event
        const eventData = {
            title,
            description,
            location: location || "",
            eventDate: new Date(eventDate),
            endDate: endDate ? new Date(endDate) : null,
            createdBy: user._id,
            createdByUsername: user.username,
            createdByUserType: user.userType,
            photos: uploadedPhotos,
            documents: uploadedDocuments,
            auctions: parsedAuctionIds, // Use parsed array
            status: "draft",
        };

        const event = await Event.create(eventData);

        // Populate for response
        await event.populate("createdBy", "username firstName lastName");
        await event.populate("auctions", "title currentPrice photos status");

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: { event },
        });
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while creating event",
        });
    }
};

// ============= GET ALL EVENTS =============
export const getEvents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            status,
            search,
            sortBy = "eventDate",
            sortOrder = "asc",
        } = req.query;

        // Build filter
        const filter = {};

        // Status filter - handle special cases
        if (status && status !== "all") {
            const now = new Date();

            if (status === "ongoing") {
                // Events that are published, started, and not ended
                filter.status = "published";
                filter.eventDate = { $lte: now };
                filter.$or = [
                    { endDate: { $gte: now } },
                    { endDate: { $exists: false } }
                ];
            } else if (status === "past") {
                // Events that are published and ended
                filter.status = "published";
                filter.$or = [
                    { endDate: { $lt: now } },
                    {
                        endDate: { $exists: false },
                        eventDate: { $lt: now }
                    }
                ];
            } else if (status === "upcoming") {
                // Events that are published and not started yet
                filter.status = "published";
                filter.eventDate = { $gt: now };
            } else {
                // Direct status match for draft, published, cancelled, completed
                filter.status = status;
            }
        }

        // Search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { createdByUsername: { $regex: search, $options: "i" } },
            ];
        }

        // Location filter
        if (req.query.location) {
            filter.location = { $regex: req.query.location, $options: 'i' };
        }

        // Filter by user type (show appropriate events)
        if (req.user) {
            if (req.user.userType === "seller") {
                filter.createdBy = req.user._id;
            }
            // Admin sees all
        }

        // Sort options - simplified
        const sortOptions = {};

        // Map frontend sort values to actual fields
        switch (sortBy) {
            case 'ending_soon':
                // Events ending soonest (earliest end date first)
                sortOptions.endDate = 1;
                sortOptions.eventDate = 1;
                break;
            case 'newest':
                // Newest created first
                sortOptions.createdAt = -1;
                break;
            case 'oldest':
                // Oldest created first
                sortOptions.createdAt = 1;
                break;
            case 'title_asc':
                // Title A-Z
                sortOptions.title = 1;
                break;
            case 'title_desc':
                // Title Z-A
                sortOptions.title = -1;
                break;
            default:
                // Default: earliest event date first
                sortOptions.eventDate = 1;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await Event.find(filter)
            .populate("createdBy", "username firstName lastName")
            .populate("auctions", "title currentPrice photos status bidCount")
            .sort(sortOptions)
            .skip(skip)

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalEvents: total,
                    hasNextPage: skip + events.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching events",
        });
    }
};

// ============= GET SINGLE EVENT =============
export const getEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id)
            .populate("createdBy", "username firstName lastName")
            .populate({
                path: "auctions",
                populate: {
                    path: "seller",
                    select: "username firstName lastName",
                },
            });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Increment views
        event.views += 1;
        await event.save();

        res.status(200).json({
            success: true,
            data: { event },
        });
    } catch (error) {
        console.error("Get event error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching event",
        });
    }
};

// ============= UPDATE EVENT =============
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Check authorization
        if (
            event.createdBy.toString() !== user._id.toString() &&
            user.userType !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own events",
            });
        }

        const {
            title,
            description,
            location,
            eventDate,
            endDate,
            auctionIds,
            removedPhotos,
            removedDocuments,
            photoOrder,
        } = req.body;

        // Validation
        if (!title || !description || !eventDate) {
            return res.status(400).json({
                success: false,
                message: "Title, description, and event date are required",
            });
        }

        // Validate event date
        // if (new Date(eventDate) < new Date()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Event date must be in the future",
        //     });
        // }

        // ========== FIX: Parse auctionIds ==========
        let parsedAuctionIds = [];
        if (auctionIds) {
            try {
                // If it's a string, parse it as JSON
                if (typeof auctionIds === 'string') {
                    parsedAuctionIds = JSON.parse(auctionIds);
                } else if (Array.isArray(auctionIds)) {
                    parsedAuctionIds = auctionIds;
                }
            } catch (error) {
                console.error('Error parsing auctionIds:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid auctionIds format',
                });
            }
        }

        // Validate auctions exist and belong to this user (for sellers)
        // Admin can assign any auction
        if (parsedAuctionIds.length > 0) {
            const query = { _id: { $in: parsedAuctionIds } };

            // If user is not admin, check ownership
            if (user.userType !== 'admin') {
                query.seller = user._id;
            }

            const auctions = await Auction.find(query);

            if (auctions.length !== parsedAuctionIds.length) {
                const foundIds = auctions.map(a => a._id.toString());
                const notFound = parsedAuctionIds.filter(id => !foundIds.includes(id.toString()));
                return res.status(400).json({
                    success: false,
                    message: `Some auctions not found: ${notFound.join(', ')}`,
                });
            }
        }

        // Handle removed photos
        let finalPhotos = [...event.photos];
        if (removedPhotos) {
            try {
                const removedPhotoIds =
                    typeof removedPhotos === "string"
                        ? JSON.parse(removedPhotos)
                        : removedPhotos;

                if (Array.isArray(removedPhotoIds)) {
                    for (const photoId of removedPhotoIds) {
                        const photoIndex = finalPhotos.findIndex(
                            (photo) =>
                                photo.publicId === photoId || photo._id?.toString() === photoId
                        );
                        if (photoIndex > -1) {
                            const removedPhoto = finalPhotos[photoIndex];
                            if (removedPhoto.publicId) {
                                await deleteFromCloudinary(removedPhoto.publicId);
                            }
                            finalPhotos.splice(photoIndex, 1);
                        }
                    }
                }
            } catch (error) {
                console.error("Error processing removed photos:", error);
            }
        }

        // Handle new photos
        const photoCaptionsArray = Array.isArray(req.body.photoCaptions)
            ? req.body.photoCaptions
            : [];

        const newPhotos = [];
        if (req.files && req.files.photos) {
            const photos = Array.isArray(req.files.photos)
                ? req.files.photos
                : [req.files.photos];

            for (const [index, photo] of photos.entries()) {
                try {
                    const result = await uploadImageToCloudinary(
                        photo.buffer,
                        "event-photos"
                    );
                    newPhotos.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: photo.originalname,
                        order: finalPhotos.length + newPhotos.length,
                        caption: photoCaptionsArray[index] || "",
                    });
                } catch (uploadError) {
                    console.error("Photo upload error:", uploadError);
                    return res.status(400).json({
                        success: false,
                        message: `Failed to upload photo: ${photo.originalname}`,
                    });
                }
            }
        }

        // Handle photo ordering
        if (photoOrder) {
            try {
                const parsedPhotoOrder =
                    typeof photoOrder === "string" ? JSON.parse(photoOrder) : photoOrder;

                if (Array.isArray(parsedPhotoOrder)) {
                    const existingPhotosMap = new Map();
                    finalPhotos.forEach((photo) => {
                        const photoId = photo.publicId || photo._id?.toString();
                        if (photoId) {
                            existingPhotosMap.set(photoId, photo);
                        }
                    });

                    const usedNewPhotos = new Set();
                    const reorderedPhotos = [];

                    for (const orderItem of parsedPhotoOrder) {
                        if (orderItem.isExisting) {
                            const existingPhoto = existingPhotosMap.get(orderItem.id);
                            if (existingPhoto) {
                                reorderedPhotos.push(existingPhoto);
                                existingPhotosMap.delete(orderItem.id);
                            }
                        } else {
                            let foundNewPhoto = null;
                            for (let i = 0; i < newPhotos.length; i++) {
                                if (!usedNewPhotos.has(i)) {
                                    foundNewPhoto = newPhotos[i];
                                    usedNewPhotos.add(i);
                                    break;
                                }
                            }
                            if (foundNewPhoto) {
                                reorderedPhotos.push(foundNewPhoto);
                            }
                        }
                    }

                    existingPhotosMap.forEach((photo) => reorderedPhotos.push(photo));
                    newPhotos.forEach((photo, index) => {
                        if (!usedNewPhotos.has(index)) {
                            reorderedPhotos.push(photo);
                        }
                    });

                    finalPhotos = reorderedPhotos;
                }
            } catch (error) {
                console.error("Error processing photo order:", error);
                finalPhotos = [...finalPhotos, ...newPhotos];
            }
        } else {
            finalPhotos = [...finalPhotos, ...newPhotos];
        }

        // Handle removed documents
        let finalDocuments = [...event.documents];
        if (removedDocuments) {
            try {
                const removedDocIds =
                    typeof removedDocuments === "string"
                        ? JSON.parse(removedDocuments)
                        : removedDocuments;

                if (Array.isArray(removedDocIds)) {
                    for (const docId of removedDocIds) {
                        const docIndex = finalDocuments.findIndex(
                            (doc) => doc.publicId === docId || doc._id?.toString() === docId
                        );
                        if (docIndex > -1) {
                            const removedDoc = finalDocuments[docIndex];
                            if (removedDoc.publicId) {
                                await deleteFromCloudinary(removedDoc.publicId);
                            }
                            finalDocuments.splice(docIndex, 1);
                        }
                    }
                }
            } catch (error) {
                console.error("Error processing removed documents:", error);
            }
        }

        // Handle new documents
        const documentCaptionsArray = Array.isArray(req.body.documentCaptions)
            ? req.body.documentCaptions
            : [];

        if (req.files && req.files.documents) {
            const documents = Array.isArray(req.files.documents)
                ? req.files.documents
                : [req.files.documents];

            for (const [index, doc] of documents.entries()) {
                try {
                    const result = await uploadDocumentToCloudinary(
                        doc.buffer,
                        doc.originalname,
                        "event-documents"
                    );
                    finalDocuments.push({
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: doc.originalname,
                        originalName: doc.originalname,
                        caption: documentCaptionsArray[index] || "",
                    });
                } catch (uploadError) {
                    console.error("Document upload error:", uploadError);
                }
            }
        }

        // Update event
        const updateData = {
            title,
            description,
            location: location || "",
            eventDate: new Date(eventDate),
            endDate: endDate ? new Date(endDate) : null,
            photos: finalPhotos,
            documents: finalDocuments,
            auctions: parsedAuctionIds, // Use parsed array
        };

        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("createdBy", "username firstName lastName")
            .populate("auctions", "title currentPrice photos status bidCount");

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: { event: updatedEvent },
        });
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating event",
        });
    }
};

// ============= DELETE EVENT =============
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Check authorization
        if (
            event.createdBy.toString() !== user._id.toString() &&
            user.userType !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own events",
            });
        }

        // Only allow deletion of draft or cancelled events
        // if (!["draft", "cancelled"].includes(event.status)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Only draft or cancelled events can be deleted",
        //     });
        // }

        // Delete uploaded files from cloudinary
        for (const photo of event.photos) {
            if (photo.publicId) {
                await deleteFromCloudinary(photo.publicId);
            }
        }

        for (const doc of event.documents) {
            if (doc.publicId) {
                await deleteFromCloudinary(doc.publicId);
            }
        }

        await Event.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while deleting event",
        });
    }
};

// ============= PUBLISH EVENT =============
export const publishEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Check authorization
        if (
            event.createdBy.toString() !== user._id.toString() &&
            user.userType !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only publish your own events",
            });
        }

        if (event.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: "Only draft events can be published",
            });
        }

        event.status = "published";
        await event.save();

        res.status(200).json({
            success: true,
            message: "Event published successfully",
            data: { event },
        });
    } catch (error) {
        console.error("Publish event error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while publishing event",
        });
    }
};

// ============= GET EVENTS WITH AUCTIONS =============
export const getEventWithAuctions = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id)
            .populate("createdBy", "username firstName lastName")
            .populate({
                path: "auctions",
                populate: {
                    path: "seller",
                    select: "username firstName lastName",
                },
            });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Increment views
        event.views += 1;
        await event.save();

        res.status(200).json({
            success: true,
            data: { event },
        });
    } catch (error) {
        console.error("Get event with auctions error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching event",
        });
    }
};

// ============= GET EVENTS FOR USER (Seller/Admin) =============
export const getUserEvents = async (req, res) => {
    try {
        const user = req.user;
        const { 
            status, 
            search, 
            page = 1, 
            limit = 10,
            sortBy = "eventDate",
            sortOrder = "asc"
        } = req.query;

        // Build filter
        const filter = { createdBy: user._id };

        // Status filter - handle special cases
        if (status && status !== "all") {
            const now = new Date();

            if (status === "ongoing") {
                // Events that are published, started, and not ended
                filter.status = "published";
                filter.eventDate = { $lte: now };
                filter.$or = [
                    { endDate: { $gte: now } },
                    { endDate: { $exists: false } }
                ];
            } else if (status === "past") {
                // Events that are published and ended
                filter.status = "published";
                filter.$or = [
                    { endDate: { $lt: now } },
                    {
                        endDate: { $exists: false },
                        eventDate: { $lt: now }
                    }
                ];
            } else if (status === "upcoming") {
                // Events that are published and not started yet
                filter.status = "published";
                filter.eventDate = { $gt: now };
            } else {
                // Direct status match for draft, published, cancelled, completed
                filter.status = status;
            }
        }

        // Search filter - search in title, description, location, and username
        if (search) {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { location: { $regex: search, $options: "i" } },
                    { createdByUsername: { $regex: search, $options: "i" } },
                ]
            });
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await Event.find(filter)
            .populate("createdBy", "username firstName lastName")
            .populate("auctions", "title currentPrice photos status bidCount")
            .skip(skip);

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalEvents: total,
                    hasNextPage: skip + events.length < total,
                    hasPrevPage: skip > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get user events error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching user events",
        });
    }
};