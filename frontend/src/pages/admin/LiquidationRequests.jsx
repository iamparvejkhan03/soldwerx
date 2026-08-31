// pages/admin/LiquidationRequests.jsx
import { useState, useEffect, useMemo } from "react";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import {
    Search,
    User,
    Clock,
    MessageSquare,
    Copy,
    CheckCircle,
    Trash2,
    Eye,
    AlertCircle,
    CheckCircle2,
    XCircle,
    X,
    Package,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Image,
    FileText
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

function LiquidationRequests() {
    const [allRequests, setAllRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [filterOptions, setFilterOptions] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        status: "all",
        priority: "all",
        dateRange: "all",
        search: "",
        sortBy: "recent"
    });

    // Fetch all data
    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [requestsResponse, statsResponse] = await Promise.all([
                axiosInstance.get(`/api/v1/liquidate/admin/requests`),
                axiosInstance.get('/api/v1/liquidate/admin/requests/stats')
            ]);

            if (requestsResponse.data.success) {
                setAllRequests(requestsResponse.data.data.requests);
                setFilteredRequests(requestsResponse.data.data.requests);
                setFilterOptions(requestsResponse.data.data.filterOptions);
                if (requestsResponse.data.data.requests.length > 0) {
                    setSelectedRequest(requestsResponse.data.data.requests[0]);
                }
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

        } catch (error) {
            console.error('Fetch liquidation requests error:', error);
            toast.error('Failed to load liquidation requests');
        } finally {
            setLoading(false);
        }
    };

    // Apply filters locally
    const applyFilters = useMemo(() => {
        return () => {
            let filtered = [...allRequests];

            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filtered = filtered.filter(request =>
                    request.name.toLowerCase().includes(searchTerm) ||
                    request.email.toLowerCase().includes(searchTerm) ||
                    request.requestId.toLowerCase().includes(searchTerm) ||
                    request.description.toLowerCase().includes(searchTerm)
                );
            }

            // Status filter
            if (filters.status !== "all") {
                filtered = filtered.filter(request => request.status === filters.status);
            }

            // Priority filter
            if (filters.priority !== "all") {
                filtered = filtered.filter(request => request.priority === filters.priority);
            }

            // Date range filter
            if (filters.dateRange !== "all") {
                const now = new Date();
                let startDate;

                switch (filters.dateRange) {
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
                    filtered = filtered.filter(request =>
                        new Date(request.createdAt) >= startDate
                    );
                }
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case "recent":
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case "oldest":
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    case "priority":
                        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    case "name":
                        return a.name.localeCompare(b.name);
                    default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });

            return filtered;
        };
    }, [allRequests, filters]);

    // Update filtered requests when filters change
    useEffect(() => {
        if (allRequests.length > 0) {
            const filtered = applyFilters();
            setFilteredRequests(filtered);

            if (selectedRequest && !filtered.find(r => r.id === selectedRequest.id)) {
                setSelectedRequest(filtered.length > 0 ? filtered[0] : null);
            }
        }
    }, [applyFilters, allRequests.length, selectedRequest]);

    // Initial fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "all",
            priority: "all",
            dateRange: "all",
            search: "",
            sortBy: "recent"
        });
    };

    const openRequestModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeRequestModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    // Update request status
    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            const { data } = await axiosInstance.put(`/api/v1/liquidate/admin/requests/${requestId}`, {
                status: newStatus
            });

            if (data.success) {
                setAllRequests(prev => prev.map(request =>
                    request.id === requestId ? { ...request, status: newStatus } : request
                ));

                if (selectedRequest && selectedRequest.id === requestId) {
                    setSelectedRequest(prev => ({ ...prev, status: newStatus }));
                }

                toast.success('Request status updated successfully');
            }
        } catch (error) {
            console.error('Update request status error:', error);
            toast.error('Failed to update request status');
        }
    };

    // Delete request
    const deleteRequest = async (requestId) => {
        if (!window.confirm("Are you sure you want to delete this liquidation request? This action cannot be undone.")) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/liquidate/admin/requests/${requestId}`);

            if (data.success) {
                setAllRequests(prev => prev.filter(request =>
                    request._id !== requestId && request.id !== requestId
                ));
                setFilteredRequests(prev => prev.filter(request =>
                    request._id !== requestId && request.id !== requestId
                ));

                if (selectedRequest &&
                    (selectedRequest._id === requestId || selectedRequest.id === requestId)) {
                    setSelectedRequest(null);
                }

                toast.success('Request deleted successfully');
            }
        } catch (error) {
            console.error('Delete request error:', error);
            toast.error('Failed to delete request');
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getStatusBadge = (status) => {
        const config = {
            new: { color: "bg-blue-100 text-blue-800", icon: Clock, text: "New" },
            "in-progress": { color: "bg-amber-100 text-amber-800", icon: AlertCircle, text: "In Progress" },
            "evaluating": { color: "bg-purple-100 text-purple-800", icon: AlertCircle, text: "Evaluating" },
            "approved": { color: "bg-green-100 text-green-800", icon: CheckCircle2, text: "Approved" },
            "completed": { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, text: "Completed" },
            "closed": { color: "bg-gray-100 text-gray-800", icon: XCircle, text: "Closed" }
        };
        const { color, icon: Icon, text } = config[status] || config.new;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}>
                <Icon size={12} />
                {text}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const config = {
            urgent: { color: "bg-red-100 text-red-800", text: "Urgent" },
            high: { color: "bg-orange-100 text-orange-800", text: "High" },
            medium: { color: "bg-amber-100 text-amber-800", text: "Medium" },
            low: { color: "bg-gray-100 text-gray-800", text: "Low" }
        };
        const { color, text } = config[priority] || config.medium;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate stats from filtered requests
    const requestStats = {
        total: filteredRequests.length,
        new: filteredRequests.filter(r => r.status === 'new').length,
        inProgress: filteredRequests.filter(r => r.status === 'in-progress' || r.status === 'evaluating').length,
        completed: filteredRequests.filter(r => r.status === 'completed' || r.status === 'approved').length
    };

    // Stats cards configuration
    const statCards = [
        {
            title: "Total Requests",
            value: requestStats.total.toLocaleString('en-US'),
            change: "Showing",
            icon: Package,
            color: "blue"
        },
        {
            title: "New Requests",
            value: requestStats.new.toLocaleString('en-US'),
            change: "Require Attention",
            icon: AlertCircle,
            color: "orange"
        },
        {
            title: "In Progress",
            value: requestStats.inProgress.toLocaleString('en-US'),
            change: "Being Handled",
            icon: Clock,
            color: "amber"
        },
        {
            title: "Completed",
            value: requestStats.completed.toLocaleString('en-US'),
            change: "Finished",
            icon: CheckCircle2,
            color: "green"
        }
    ];

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="max-w-full pt-16 pb-7 md:pt-0">
                            <h2 className="text-3xl md:text-4xl font-bold my-5">Liquidation Requests</h2>
                            <p className="text-gray-600">Loading liquidation requests...</p>
                        </div>
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    {/* Header Section */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Liquidation Requests</h2>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {filteredRequests.length} requests found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`text-2xl font-bold text-${stat.color}-600`}>
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-500">{stat.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or description..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    {filterOptions.statuses?.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority Filter */}
                            {/* <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                >
                                    {filterOptions.priorities?.map(priority => (
                                        <option key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </option>
                                    ))}
                                </select>
                            </div> */}

                            {/* Sort By */}
                            {/* <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="priority">Priority</option>
                                    <option value="name">Name</option>
                                </select>
                            </div> */}
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredRequests.length} of {allRequests.length} requests
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">Liquidation Requests ({filteredRequests.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th> */}
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <User size={18} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{request.name}</div>
                                                        <div className="text-sm text-gray-500">{request.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-medium text-gray-900 truncate max-w-[200px]">
                                                        {request.itemCount || 'Not specified'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Items</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            {/* <td className="py-4 px-6">
                                                {getPriorityBadge(request.priority)}
                                            </td> */}
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {formatDate(request.createdAt)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openRequestModal(request)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <a
                                                        href={`mailto:${request.email}`}
                                                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                                        title="Send Email"
                                                    >
                                                        <Mail size={16} />
                                                    </a>

                                                    {request.phone && (
                                                        <a
                                                            href={`tel:${request.phone.replace(/\D/g, '')}`}
                                                            className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                                                            title="Call User"
                                                        >
                                                            <Phone size={16} />
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => deleteRequest(request.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                        title="Delete Request"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredRequests.length === 0 && (
                                <div className="text-center py-12">
                                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No liquidation requests found matching your criteria</p>
                                    <button
                                        onClick={clearFilters}
                                        className="text-blue-600 hover:text-blue-800 mt-2"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Request Detail Modal */}
                    {isModalOpen && selectedRequest && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                    <h3 className="text-lg font-semibold">Liquidation Request - {selectedRequest.requestId}</h3>
                                    <button
                                        onClick={closeRequestModal}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Header Section */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User size={24} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h4 className="text-xl font-bold text-gray-900">{selectedRequest.name}</h4>
                                                {getPriorityBadge(selectedRequest.priority)}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {getStatusBadge(selectedRequest.status)}
                                            </div>
                                            <p className="text-gray-600">Submitted: {formatDate(selectedRequest.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Contact Information</h5>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Email</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{selectedRequest.email}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(selectedRequest.email, 'modal-email')}
                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                        >
                                                            {copiedField === 'modal-email' ? (
                                                                <CheckCircle size={14} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                {selectedRequest.phone && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">Phone</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{selectedRequest.phone}</span>
                                                            <button
                                                                onClick={() => copyToClipboard(selectedRequest.phone, 'modal-phone')}
                                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                            >
                                                                {copiedField === 'modal-phone' ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <Copy size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedRequest.location && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">Location</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{selectedRequest.location}</span>
                                                            <button
                                                                onClick={() => copyToClipboard(selectedRequest.location, 'modal-location')}
                                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                            >
                                                                {copiedField === 'modal-location' ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <Copy size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-semibold text-gray-900">Request Details</h5>
                                            <div className="space-y-3">
                                                {selectedRequest.itemCount && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Items</span>
                                                        <span className="font-medium">{selectedRequest.itemCount}</span>
                                                    </div>
                                                )}
                                                {selectedRequest.timeline && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Timeline</span>
                                                        <span className="font-medium">{selectedRequest.timeline}</span>
                                                    </div>
                                                )}
                                                {selectedRequest.estimatedValue && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Est. Value</span>
                                                        <span className="font-medium">${selectedRequest.estimatedValue.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FileText size={16} />
                                            Description
                                        </h5>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.description}</p>
                                        </div>
                                    </div>

                                    {/* Photos */}
                                    {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                                        <div className="mb-6">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <Image size={16} />
                                                Photos ({selectedRequest.photos.length})
                                            </h5>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {selectedRequest.photos.map((photo, index) => (
                                                    <a
                                                        key={index}
                                                        href={photo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                                                    >
                                                        <img
                                                            src={photo.url}
                                                            alt={`Item photo ${index + 1}`}
                                                            className="w-full h-32 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                            <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <a
                                            href={`mailto:${selectedRequest.email}?subject=Re: Liquidation Request (${selectedRequest.requestId})&body=Dear ${selectedRequest.name},%0D%0A%0D%0AThank you for your liquidation request.%0D%0A%0D%0A`}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                                        >
                                            Send Email
                                        </a>
                                        {selectedRequest.phone && (
                                            <a
                                                href={`tel:${selectedRequest.phone.replace(/\D/g, '')}`}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                                            >
                                                Call User
                                            </a>
                                        )}
                                    </div>

                                    {/* Status Actions */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {selectedRequest.status === "new" && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        updateRequestStatus(selectedRequest.id, "in-progress");
                                                        closeRequestModal();
                                                    }}
                                                    className="flex-1 bg-amber-100 text-amber-800 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors"
                                                >
                                                    Start Processing
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        updateRequestStatus(selectedRequest.id, "evaluating");
                                                        closeRequestModal();
                                                    }}
                                                    className="flex-1 bg-purple-100 text-purple-800 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors"
                                                >
                                                    Start Evaluation
                                                </button>
                                            </>
                                        )}
                                        {selectedRequest.status === "in-progress" && (
                                            <button
                                                onClick={() => {
                                                    updateRequestStatus(selectedRequest.id, "evaluating");
                                                    closeRequestModal();
                                                }}
                                                className="flex-1 bg-purple-100 text-purple-800 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors"
                                            >
                                                Move to Evaluation
                                            </button>
                                        )}
                                        {selectedRequest.status === "evaluating" && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        updateRequestStatus(selectedRequest.id, "approved");
                                                        closeRequestModal();
                                                    }}
                                                    className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        updateRequestStatus(selectedRequest.id, "completed");
                                                        closeRequestModal();
                                                    }}
                                                    className="flex-1 bg-emerald-100 text-emerald-800 py-2 px-4 rounded-lg hover:bg-emerald-200 transition-colors"
                                                >
                                                    Mark Complete
                                                </button>
                                            </>
                                        )}
                                        {selectedRequest.status === "approved" && (
                                            <button
                                                onClick={() => {
                                                    updateRequestStatus(selectedRequest.id, "completed");
                                                    closeRequestModal();
                                                }}
                                                className="flex-1 bg-emerald-100 text-emerald-800 py-2 px-4 rounded-lg hover:bg-emerald-200 transition-colors"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                updateRequestStatus(selectedRequest.id, "closed");
                                                closeRequestModal();
                                            }}
                                            className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Close Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default LiquidationRequests;