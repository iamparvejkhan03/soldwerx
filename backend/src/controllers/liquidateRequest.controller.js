import LiquidateRequest from '../models/liquidateRequest.model.js';
import { liquidateConfirmationEmail, liquidateAdminEmail } from '../utils/nodemailer.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';

// Helper: Upload photos to Cloudinary using your existing upload function
const uploadPhotosToCloudinary = async (files) => {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
        try {
            // Use your existing uploadToCloudinary function
            const result = await uploadToCloudinary(
                file.buffer,
                file.originalname,
                'liquidate_requests' // folder name
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

// Submit liquidate request
export const submitLiquidateRequest = async (req, res) => {
    try {
        const { name, email, phone, location, description, itemCount, timeline } = req.body;

        // Validate required fields
        if (!name || !email || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and description are required'
            });
        }

        // Upload photos to Cloudinary using your existing function
        let photoUrls = [];
        if (req.files && req.files.length > 0) {
            photoUrls = await uploadPhotosToCloudinary(req.files);
        }

        // Create liquidate request
        const liquidateRequest = await LiquidateRequest.create({
            name,
            email,
            phone: phone || '',
            location: location || '',
            description,
            itemCount: itemCount || '',
            timeline: timeline || '',
            photos: photoUrls,
        });

        await liquidateRequest.populate('assignedTo', 'username firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Your liquidation request has been submitted successfully. We will contact you within 24 hours.',
            data: {
                requestId: liquidateRequest.requestId,
                request: liquidateRequest
            }
        });

        // Send emails asynchronously
        if (liquidateRequest) {
            liquidateConfirmationEmail(name, email).catch(err =>
                console.error('Liquidate confirmation email error:', err)
            );
            liquidateAdminEmail(name, email, phone, location, description, itemCount, timeline, photoUrls).catch(err =>
                console.error('Liquidate admin email error:', err)
            );
        }

    } catch (error) {
        console.error('Submit liquidate request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while submitting your request'
        });
    }
};

// Get all liquidate requests for admin
export const getLiquidateRequests = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            status,
            search,
            priority,
            sortBy = 'recent',
            dateRange
        } = req.query;

        // Build filter object
        const filter = {};

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Priority filter
        if (priority && priority !== 'all') {
            filter.priority = priority;
        }

        // Date range filter
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

        // Search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { requestId: { $regex: search, $options: 'i' } }
            ];
        }

        // Find requests with populated data
        const requests = await LiquidateRequest.find(filter)
            .populate('assignedTo', 'username firstName lastName email')
            .sort({ createdAt: -1 });

        // Transform data for frontend
        const transformedRequests = requests.map(request => ({
            id: request._id.toString(),
            requestId: request.requestId,
            name: request.name,
            email: request.email,
            phone: request.phone,
            location: request.location,
            description: request.description,
            itemCount: request.itemCount,
            timeline: request.timeline,
            photos: request.photos,
            status: request.status,
            priority: request.priority,
            notes: request.notes,
            response: request.response,
            estimatedValue: request.estimatedValue,
            assignedTo: request.assignedTo ? {
                id: request.assignedTo._id.toString(),
                name: `${request.assignedTo.firstName} ${request.assignedTo.lastName}`.trim() || request.assignedTo.username,
                email: request.assignedTo.email
            } : null,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            respondedAt: request.respondedAt,
        }));

        // Apply additional sorting
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

        // Calculate statistics
        const totalRequests = await LiquidateRequest.countDocuments(filter);

        const statusStats = await LiquidateRequest.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await LiquidateRequest.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentStats = await LiquidateRequest.aggregate([
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
            inProgressRequests: statusStats.find(stat => stat._id === 'in-progress')?.count || 0,
            evaluatingRequests: statusStats.find(stat => stat._id === 'evaluating')?.count || 0,
            completedRequests: statusStats.find(stat => stat._id === 'completed')?.count || 0,
            recentRequests: recentStats[0]?.count || 0,
            priorityBreakdown: priorityStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };

        // Filter options
        const filterOptions = {
            statuses: [
                { value: 'all', label: 'All Status' },
                { value: 'new', label: 'New' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'evaluating', label: 'Evaluating' },
                { value: 'approved', label: 'Approved' },
                { value: 'completed', label: 'Completed' },
                { value: 'closed', label: 'Closed' }
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
        console.error('Get liquidate requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching liquidate requests'
        });
    }
};

// Update liquidate request
export const updateLiquidateRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, notes, response, priority, assignedTo, estimatedValue } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (response !== undefined) updateData.response = response;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;

        // If marking as completed or closed, set respondedAt
        if (status === 'completed' || status === 'closed') {
            updateData.respondedAt = new Date();
        }

        const request = await LiquidateRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'username firstName lastName email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Liquidate request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: { request }
        });

    } catch (error) {
        console.error('Update liquidate request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating request'
        });
    }
};

// Delete liquidate request
export const deleteLiquidateRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await LiquidateRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Liquidate request not found'
            });
        }

        // Delete photos from Cloudinary using your existing function
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

        // Delete from database
        await LiquidateRequest.findByIdAndDelete(requestId);

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            data: { deletedRequestId: requestId }
        });

    } catch (error) {
        console.error('Delete liquidate request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting request'
        });
    }
};

// Get request statistics for dashboard
export const getLiquidateStats = async (req, res) => {
    try {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Overall statistics
        const overallStats = await LiquidateRequest.aggregate([
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    avgResponseTime: { $avg: { $subtract: ['$respondedAt', '$createdAt'] } }
                }
            }
        ]);

        // Recent activity (last 7 days)
        const recentActivity = await LiquidateRequest.aggregate([
            { $match: { createdAt: { $gte: lastWeek } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    requestCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Requests by priority
        const requestsByPriority = await LiquidateRequest.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Response rate
        const responseStats = await LiquidateRequest.aggregate([
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    respondedRequests: {
                        $sum: { $cond: [{ $ne: ['$respondedAt', null] }, 1, 0] }
                    }
                }
            }
        ]);

        const responseRate = responseStats[0] ?
            (responseStats[0].respondedRequests / responseStats[0].totalRequests) * 100 : 0;

        // Total estimated value
        const valueStats = await LiquidateRequest.aggregate([
            {
                $group: {
                    _id: null,
                    totalEstimatedValue: { $sum: '$estimatedValue' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRequests: overallStats[0]?.totalRequests || 0,
                averageResponseTime: overallStats[0]?.avgResponseTime || 0,
                responseRate: Math.round(responseRate),
                totalEstimatedValue: valueStats[0]?.totalEstimatedValue || 0,
                recentActivity,
                requestsByPriority,
                todayRequests: await LiquidateRequest.countDocuments({
                    createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
                })
            }
        });

    } catch (error) {
        console.error('Get liquidate stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching statistics'
        });
    }
};