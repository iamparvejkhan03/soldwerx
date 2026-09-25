import { useState, useEffect, useCallback } from "react";
import { Filter, ChevronDown, Search, SlidersHorizontal, X, Loader, Grid, List, Calendar, MapPin, Clock, Users, Gavel } from "lucide-react";
import { Container } from "../components";
import EventCard from "../components/EventCard";
import { useLocation, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

// FiltersSection Component for Events
const FiltersSection = ({
    uiFilters,
    setUiFilters,
    handleFilterChange,
    resetFilters,
    setShowMobileFilters,
    loadingCategories,
}) => {
    const statusOptions = [
        { value: "", label: "All Status" },
        { value: "upcoming", label: "Upcoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "past", label: "Past" },
    ];

    return (
        <div className="bg-white px-4 py-6 rounded-lg shadow-md h-fit">
            <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search events by title or location..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={uiFilters.search}
                            onChange={handleFilterChange}
                            name="search"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        name="status"
                        value={uiFilters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                        type="text"
                        placeholder="City, State or Country"
                        name="location"
                        value={uiFilters.location}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const EventSkeleton = () => (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
        <div className="aspect-video bg-gray-200"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="flex items-center gap-4 mb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
    </div>
);

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalEvents: 0,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [uiFilters, setUiFilters] = useState({
        status: "",
        search: "",
        location: "",
        sortBy: "eventDate",
        sortOrder: "asc",
    });
    const location = useLocation();
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

    // Read URL parameters on page load
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const statusParam = searchParams.get('status');
        const searchParam = searchParams.get('search');
        const locationParam = searchParams.get('location');
        const sortByParam = searchParams.get('sortBy');
        const sortOrderParam = searchParams.get('sortOrder');

        const newFilters = { ...uiFilters };

        if (statusParam) newFilters.status = statusParam;
        if (searchParam) newFilters.search = searchParam;
        if (locationParam) newFilters.location = locationParam;
        if (sortByParam) newFilters.sortBy = sortByParam;
        if (sortOrderParam) newFilters.sortOrder = sortOrderParam;

        setUiFilters(newFilters);

        // Fetch events with the initial filters
        fetchEvents(1, newFilters);
    }, [location.search]);

    // Fetch events with filters
    const fetchEvents = async (page = 1, filters = uiFilters) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...filters
            });

            // Remove empty values
            Object.keys(params).forEach(key => {
                if (!params.get(key)) {
                    params.delete(key);
                }
            });

            const { data } = await axiosInstance.get(`/api/v1/events?${params}`);

            if (data.success) {
                if (page === 1) {
                    setEvents(data.data.events);
                } else {
                    setEvents(prev => [...prev, ...data.data.events]);
                }
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('Fetch events error:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreEvents = () => {
        if (pagination.currentPage < pagination.totalPages && !loadingMore) {
            fetchEvents(pagination.currentPage + 1);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = {
            ...uiFilters,
            [name]: value
        };

        setUiFilters(newFilters);

        // Update URL with the new filter
        const searchParams = new URLSearchParams(location.search);
        if (value) {
            searchParams.set(name, value);
        } else {
            searchParams.delete(name);
        }
        const newUrl = `${location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Use debounce for text inputs
        if (['search', 'location'].includes(name)) {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const timer = setTimeout(() => {
                fetchEvents(1, newFilters);
            }, 500);
            setDebounceTimer(timer);
        } else {
            fetchEvents(1, newFilters);
        }
    };

    const resetFilters = () => {
        const resetFilters = {
            status: "",
            search: "",
            location: "",
            sortBy: "eventDate",
            sortOrder: "asc",
        };
        setUiFilters(resetFilters);
        fetchEvents(1, resetFilters);
        setShowMobileFilters(false);
        // Reset URL
        window.history.replaceState(null, '', location.pathname);
    };

    return (
        <Container>
            <div className="min-h-screen pt-28 md:pt-32 pb-16 bg-gray-50">
                {/* Header */}
                <div className="">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-black tracking-[-0.04em] text-gray-950 md:text-5xl">
                            All
                            <span className="ml-2 font-medium italic text-gray-400">
                                Events.
                            </span>
                        </h2>
                        <p className="text-gray-600 mt-2">Discover upcoming auctions and events from our community.</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <FiltersSection
                                uiFilters={uiFilters}
                                setUiFilters={setUiFilters}
                                handleFilterChange={handleFilterChange}
                                resetFilters={resetFilters}
                                setShowMobileFilters={setShowMobileFilters}
                                loadingCategories={false}
                            />
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Mobile Filter Toggle */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8 lg:hidden">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={uiFilters.search}
                                        onChange={handleFilterChange}
                                        name="search"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto font-medium"
                                >
                                    <SlidersHorizontal size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {/* Results Count and Sort */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                                <p className="text-gray-600">
                                    {loading ? "Loading events..." : `Showing ${events.length} of ${pagination?.totalEvents || 0} events`}
                                </p>

                                <div className="flex items-center gap-3">
                                    {/* View Mode Toggle */}
                                    {/* <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                            title="Grid View"
                                        >
                                            <Grid size={18} className={viewMode === "grid" ? "text-orange-500" : "text-gray-500"} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                            title="List View"
                                        >
                                            <List size={18} className={viewMode === "list" ? "text-orange-500" : "text-gray-500"} />
                                        </button>
                                    </div> */}

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 text-sm">Sort by:</span>
                                        <select
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                            value={uiFilters.sortBy}
                                            onChange={(e) => {
                                                const newFilters = { ...uiFilters, sortBy: e.target.value };
                                                setUiFilters(newFilters);
                                                fetchEvents(1, newFilters);
                                            }}
                                        >
                                            <option value="ending_soon">Ending Soonest</option>
                                            <option value="newest">Newest Created</option>
                                            <option value="oldest">Oldest Created</option>
                                            <option value="title_asc">Title (A-Z)</option>
                                            <option value="title_desc">Title (Z-A)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Events Grid */}
                            {loading && events.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <EventSkeleton key={i} />
                                    ))}
                                </div>
                            ) : events.length > 0 ? (
                                <>
                                    <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"} gap-6`}>
                                        {events.map(event => (
                                            viewMode === "grid" ? (
                                                <EventCard key={event._id} event={event} />
                                            ) : (
                                                // List View - Simple horizontal card
                                                <Link to={`/event/${event._id}`} key={event._id} className="block group">
                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                                        <div className="flex flex-col md:flex-row">
                                                            <div className="md:w-1/3 lg:w-1/4">
                                                                <img
                                                                    src={event.photos?.[0]?.url || ''}
                                                                    alt={event.title}
                                                                    className="w-full h-48 md:h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 p-4">
                                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                                    {event.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                    {event.description?.replace(/<[^>]*>/g, '').substring(0, 150)}
                                                                    {event.description?.replace(/<[^>]*>/g, '').length > 150 ? '...' : ''}
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar size={14} />
                                                                        <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}</span>
                                                                    </div>
                                                                    {event.location && (
                                                                        <div className="flex items-center gap-1">
                                                                            <MapPin size={14} />
                                                                            <span>{event.location}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1">
                                                                        <Gavel size={14} />
                                                                        <span>{event.auctions?.length || 0} auctions</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                                                                        event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                                'bg-blue-100 text-blue-800'}`}>
                                                                        {event.status}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {event.views || 0} views
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        ))}
                                    </div>

                                    {/* Load More Button */}
                                    {pagination?.currentPage < pagination?.totalPages && (
                                        <div className="flex justify-center mt-12">
                                            <button
                                                onClick={loadMoreEvents}
                                                disabled={loadingMore}
                                                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        Load More Events
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                                            {pagination.totalEvents - events.length} more
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* End of Events Message */}
                                    {pagination?.currentPage >= pagination?.totalPages && events.length > 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>You've seen all {pagination.totalEvents} events</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
                                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 text-primary hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
                        <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto p-6">
                            <FiltersSection
                                uiFilters={uiFilters}
                                setUiFilters={setUiFilters}
                                handleFilterChange={handleFilterChange}
                                resetFilters={resetFilters}
                                setShowMobileFilters={setShowMobileFilters}
                                loadingCategories={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default Events;