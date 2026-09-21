import { useState, useEffect, useRef } from "react";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import {
    Search, Filter, Calendar, Eye, Edit, MoreVertical, Trash2,
    AlertTriangle, CheckCircle, Plus, FileText, Users, MapPin,
    Clock, Gavel, X, Loader
} from "lucide-react";
import { about } from "../../assets";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

function AllEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalEvents: 0,
        hasNext: false,
        hasPrev: false
    });
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Check if click is on a dropdown item
                if (!event.target.closest('.dropdown-item')) {
                    setActiveDropdown(null);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchEvents = async (page = 1, search = searchTerm, statusFilter = filter) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/v1/events`, {
                params: {
                    page,
                    limit: 10,
                    search,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });

            if (data.success) {
                setEvents(data.data.events);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error('Fetch events error:', err);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents(1, searchTerm, filter);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filter]);

    const handleViewEvent = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleEditEvent = (event) => {
        navigate(`/admin/events/edit/${event._id}`);
    };

    const handleDeleteEvent = async (eventId, eventTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(`/api/v1/events/delete/${eventId}`);
            if (data.success) {
                toast.success(data.message);
                fetchEvents();
            }
        } catch (err) {
            console.error('Delete event error:', err);
            toast.error(err.response?.data?.message || "Failed to delete event");
        }
    };

    const handlePublishEvent = async (eventId) => {
        try {
            const response = await toast.promise(
                axiosInstance.patch(`/api/v1/events/publish/${eventId}`),
                {
                    loading: 'Publishing event...',
                    success: 'Event published successfully!',
                    error: 'Failed to publish event'
                }
            );

            if (response.data.success) {
                fetchEvents();
            }
        } catch (err) {
            console.error('Publish event error:', err);
        }
    };

    const getStatusBadge = (status, eventDate, endDate) => {
        const now = new Date();
        const eventStart = new Date(eventDate);
        const eventEnd = endDate ? new Date(endDate) : null;

        const config = {
            draft: { color: "bg-gray-100 text-gray-800", text: "Draft" },
            published: {
                color: eventEnd && now > eventEnd ? "bg-gray-100 text-gray-800" :
                    now > eventStart ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800",
                text: eventEnd && now > eventEnd ? "Past" :
                    now > eventStart ? "Ongoing" : "Upcoming"
            },
            cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
            completed: { color: "bg-blue-100 text-blue-800", text: "Completed" },
        };

        const { color, text } = config[status] || config.draft;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{text}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Event Management</h2>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalEvents} events found
                                </div>
                                <Link
                                    to="/admin/events/create"
                                    className="bg-black text-white hover:bg-black/80 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Plus size={18} />
                                    Create Event
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search events by title, location, or organizer..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter size={18} className="text-gray-500" />
                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="all">All Events</option>
                                        <option value="draft">Draft</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="past">Past</option>
                                        <option value="upcoming">Upcoming</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">All Events</h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Location</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auctions</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {events.map((event) => (
                                            <tr key={event._id} className="hover:bg-gray-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={event.photos?.[0]?.url || about}
                                                            alt={event.title}
                                                            className="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-200"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div
                                                                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate w-48"
                                                                onClick={() => handleViewEvent(event)}
                                                                title={event.title}
                                                            >
                                                                {event.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                by {event.createdBy?.username || 'Unknown'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            <span>{formatDate(event.eventDate)}</span>
                                                            <span className="text-gray-400">at</span>
                                                            <span>{formatTime(event.eventDate)}</span>
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                                <MapPin size={14} className="text-gray-400" />
                                                                <span>{event.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1">
                                                        <Gavel size={14} className="text-gray-400" />
                                                        <span className="font-medium">{event.auctions?.length || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {getStatusBadge(event.status, event.eventDate, event.endDate)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleViewEvent(event)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleEditEvent(event)}
                                                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                                            title="Edit Event"
                                                        >
                                                            <Edit size={16} />
                                                        </button>

                                                        {/* More Actions Dropdown */}
                                                        <div ref={dropdownRef} className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveDropdown(activeDropdown === event._id ? null : event._id);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                                title="More Actions"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>

                                                            {activeDropdown === event._id && (
                                                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-40 py-1 dropdown-item">
                                                                    {event.status === "draft" && (
                                                                        <button
                                                                            onClick={() => {
                                                                                handlePublishEvent(event._id);
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                            <span>Publish Event</span>
                                                                        </button>
                                                                    )}

                                                                    <div className="border-t border-gray-100 my-1 dropdown-item"></div>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
                                                                                handleDeleteEvent(event._id, event.title);
                                                                                setActiveDropdown(null);
                                                                            }
                                                                        }}
                                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        <span>Delete Event</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {events.length === 0 && (
                                    <div className="text-center py-12">
                                        <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No events found matching your criteria</p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setFilter("all");
                                            }}
                                            className="text-blue-600 hover:text-blue-800 mt-2"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Showing page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchEvents(pagination.currentPage - 1)}
                                                disabled={!pagination.hasPrev}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => fetchEvents(pagination.currentPage + 1)}
                                                disabled={!pagination.hasNext}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Event Detail Modal */}
                    {isModalOpen && selectedEvent && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                    <h3 className="text-lg font-semibold">Event Details</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Header Section */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <img
                                            src={selectedEvent.photos?.[0]?.url || about}
                                            alt={selectedEvent.title}
                                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {getStatusBadge(selectedEvent.status, selectedEvent.eventDate, selectedEvent.endDate)}
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {selectedEvent.auctions?.length || 0} Auctions
                                                </span>
                                            </div>
                                            <div className="text-gray-600 prose mt-2 max-h-24 overflow-y-auto">
                                                <div dangerouslySetInnerHTML={{ __html: selectedEvent.description?.substring(0, 200) + (selectedEvent.description?.length > 200 ? '...' : '') }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-3">
                                            <h5 className="font-semibold text-gray-900">Event Details</h5>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Event Date</span>
                                                    <span className="font-medium">{formatDate(selectedEvent.eventDate)} at {formatTime(selectedEvent.eventDate)}</span>
                                                </div>
                                                {selectedEvent.endDate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">End Date</span>
                                                        <span className="font-medium">{formatDate(selectedEvent.endDate)} at {formatTime(selectedEvent.endDate)}</span>
                                                    </div>
                                                )}
                                                {selectedEvent.location && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Location</span>
                                                        <span className="font-medium">{selectedEvent.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Organizer</span>
                                                    <span className="font-medium">{selectedEvent.createdBy?.username}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Views</span>
                                                    <span className="font-medium">{selectedEvent.views}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="font-semibold text-gray-900">Assigned Auctions</h5>
                                            {selectedEvent.auctions && selectedEvent.auctions.length > 0 ? (
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {selectedEvent.auctions.map(auction => (
                                                        <div key={auction._id} className="flex items-center justify-between border-b pb-2">
                                                            <span className="text-sm truncate">{auction.title}</span>
                                                            <span className="text-sm text-green-600 font-medium">
                                                                ${auction.currentPrice?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">No auctions assigned to this event</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => handleEditEvent(selectedEvent)}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit size={18} />
                                            Edit Event
                                        </button>
                                        <Link
                                            to={`/event/${selectedEvent._id}`}
                                            target="_blank"
                                            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                        >
                                            View Event Page
                                        </Link>
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

export default AllEvents;