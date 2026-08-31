import SellRequest from '../models/sellRequest.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { sellConfirmationEmail, sellAdminEmail } from '../utils/nodemailer.js';

// Helper: Upload photos to Cloudinary
const uploadPhotosToCloudinary = async (files) => {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
        try {
            const result = await uploadToCloudinary(
                file.buffer,
                file.originalname,
                'sell_requests'
            );

            return {
                url: result.secure_url,
                publicId: result.public_id
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return null;
        }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(result => result !== null);
};

// Submit sell request
export const submitSellRequest = async (req, res) => {
    try {
        const { name, email, phone, location, itemType, description, preferredMethod } = req.body;

        // Validate required fields
        if (!name || !email || !itemType || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, item type, and description are required'
            });
        }

        // Upload photos to Cloudinary
        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            photoUrls = await uploadPhotosToCloudinary(req.files);
        }

        // Create sell request
        const sellRequest = await SellRequest.create({
            name,
            email,
            phone: phone || '',
            location: location || '',
            itemType,
            description,
            preferredMethod: preferredMethod || 'not-sure',
            photos: photoUrls
        });

        res.status(201).json({
            success: true,
            message: 'Your selling request has been submitted successfully. We will contact you within 24 hours.',
            data: {
                requestId: sellRequest.requestId,
                request: sellRequest
            }
        });

        // Send emails asynchronously
        if (sellRequest) {
            sellConfirmationEmail(name, email).catch(err =>
                console.error('Sell confirmation email error:', err)
            );
            sellAdminEmail(name, email, phone, location, itemType, description, preferredMethod, photoUrls).catch(err =>
                console.error('Sell admin email error:', err)
            );
        }

    } catch (error) {
        console.error('Submit sell request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while submitting your request'
        });
    }
};

// Get all sell requests for admin
export const getSellRequests = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            status,
            search,
            preferredMethod,
            priority,
            sortBy = 'recent',
            dateRange
        } = req.query;

        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (preferredMethod && preferredMethod !== 'all') {
            filter.preferredMethod = preferredMethod;
        }

        if (priority && priority !== 'all') {
            filter.priority = priority;
        }

        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }

            if (startDate) {
                filter.createdAt = { $gte: startDate };
            }
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { itemType: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { requestId: { $regex: search, $options: 'i' } }
            ];
        }

        const requests = await SellRequest.find(filter)
            .sort({ createdAt: -1 });

        const transformedRequests = requests.map(request => ({
            id: request._id.toString(),
            requestId: request.requestId,
            name: request.name,
            email: request.email,
            phone: request.phone,
            location: request.location,
            itemType: request.itemType,
            description: request.description,
            preferredMethod: request.preferredMethod,
            photos: request.photos,
            status: request.status,
            priority: request.priority,
            notes: request.notes,
            estimatedValue: request.estimatedValue,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            respondedAt: request.respondedAt
        }));

        transformedRequests.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority':
                    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        const totalRequests = await SellRequest.countDocuments(filter);

        const statusStats = await SellRequest.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const methodStats = await SellRequest.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$preferredMethod',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentStats = await SellRequest.aggregate([
            {
                $match: {
                    ...filter,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            },
            { $count: 'count' }
        ]);

        const statistics = {
            totalRequests,
            newRequests: statusStats.find(stat => stat._id === 'new')?.count || 0,
            inReviewRequests: statusStats.find(stat => stat._id === 'in-review')?.count || 0,
            contactedRequests: statusStats.find(stat => stat._id === 'contacted')?.count || 0,
            listedRequests: statusStats.find(stat => stat._id === 'listed')?.count || 0,
            recentRequests: recentStats[0]?.count || 0,
            methodBreakdown: methodStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };

        const filterOptions = {
            statuses: [
                { value: 'all', label: 'All Status' },
                { value: 'new', label: 'New' },
                { value: 'in-review', label: 'In Review' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'closed', label: 'Closed' }
            ],
            methods: [
                { value: 'all', label: 'All Methods' },
                { value: 'auction', label: 'Auction' },
                { value: 'buy-it-now', label: 'Buy It Now' },
                { value: 'not-sure', label: 'Not Sure' }
            ],
            priorities: [
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
            ],
            dateRanges: [
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'year', label: 'Last Year' }
            ]
        };

        res.status(200).json({
            success: true,
            data: {
                requests: transformedRequests,
                statistics,
                filterOptions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalRequests / limit),
                    totalRequests: totalRequests
                }
            }
        });

    } catch (error) {
        console.error('Get sell requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching sell requests'
        });
    }
};

// Update sell request
export const updateSellRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, notes, priority, estimatedValue } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (priority) updateData.priority = priority;
        if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;

        if (status === 'contacted' || status === 'listed' || status === 'closed') {
            updateData.respondedAt = new Date();
        }

        const request = await SellRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Sell request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: { request }
        });

    } catch (error) {
        console.error('Update sell request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating request'
        });
    }
};

// Delete sell request
export const deleteSellRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await SellRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Sell request not found'
            });
        }

        if (request.photos && request.photos.length > 0) {
            const deletePromises = request.photos.map(async (photo) => {
                try {
                    if (photo.publicId) {
                        await deleteFromCloudinary(photo.publicId, 'image');
                    }
                } catch (error) {
                    console.error('Error deleting photo from Cloudinary:', error);
                }
            });
            await Promise.all(deletePromises);
        }

        await SellRequest.findByIdAndDelete(requestId);

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: { deletedRequestId: requestId }
        });

    } catch (error) {
        console.error('Delete sell request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting request'
        });
    }
};

// Get sell stats for dashboard
export const getSellStats = async (req, res) => {
    try {
        const today = new Date();

        const overallStats = await SellRequest.aggregate([
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    avgResponseTime: { $avg: { $subtract: ['$respondedAt', '$createdAt'] } }
                }
            }
        ]);

        const requestsByStatus = await SellRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const requestsByMethod = await SellRequest.aggregate([
            {
                $group: {
                    _id: '$preferredMethod',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRequests: overallStats[0]?.totalRequests || 0,
                averageResponseTime: overallStats[0]?.avgResponseTime || 0,
                requestsByStatus,
                requestsByMethod,
                todayRequests: await SellRequest.countDocuments({
                    createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
                })
            }
        });

    } catch (error) {
        console.error('Get sell stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching statistics'
        });
    }
};