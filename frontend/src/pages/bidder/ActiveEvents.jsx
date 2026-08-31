import { useState, useEffect } from "react";
import {
    BidderContainer,
    BidderHeader,
    BidderSidebar,
    AccountInactiveBanner,
    LoadingSpinner
} from "../../components";
import EventCard from "../../components/EventCard";
import {
    Clock,
    Gavel,
    Award,
    BarChart3,
    Search,
    Filter,
    SortAsc,
    Users,
    Loader,
    Grid,
    List,
    Calendar,
    MapPin
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useStats } from "../../hooks/useStats";

function ActiveEvents() {
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
    const [filter, setFilter] = useState("ongoing");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("ending_soon");
    const [viewMode, setViewMode] = useState("grid");
    const { stats } = useStats();

    // Fetch events
    const fetchEvents = async (page = 1, loadMore = false) => {
        try {
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                status: filter !== 'all' ? filter : '',
                search: searchTerm,
                sortBy: sortBy
            });

            const { data } = await axiosInstance.get(`/api/v1/events?${params}`);

            if (data.success) {
                if (loadMore) {
                    setEvents(prev => [...prev, ...data.data.events]);
                } else {
                    setEvents(data.data.events);
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

    // Load more events
    const handleLoadMore = () => {
        if (pagination.currentPage < pagination.totalPages && !loadingMore) {
            fetchEvents(pagination.currentPage + 1, true);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchEvents();
    }, []);

    // Refetch on filter/sort/search change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filter, searchTerm, sortBy]);

    // Stats for events
    const eventStats = [
        {
            title: "Active Events",
            value: pagination.totalEvents?.toLocaleString('en-US') || '0',
            change: "All Time",
            icon: <Calendar size={24} />,
            trend: "up"
        },
        {
            title: "Ending Soon",
            value: events.filter(e => {
                const now = new Date();
                const end = e.endDate ? new Date(e.endDate) : new Date(e.eventDate);
                const diffHours = (end - now) / (1000 * 60 * 60);
                return diffHours > 0 && diffHours < 24;
            }).length,
            change: "In Next 24 Hours",
            icon: <Clock size={24} />,
            trend: "down",
            highlight: true
        },
        {
            title: "Total Auctions",
            value: events.reduce((acc, e) => acc + (e.auctions?.length || 0), 0),
            change: "Across All Events",
            icon: <Gavel size={24} />,
            trend: "up"
        },
    ];

    // Loading skeleton
    const renderSkeletons = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                        <div className="aspect-video bg-gray-200"></div>
                        <div className="p-4">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="flex items-center gap-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="flex min-h-screen">
            <BidderSidebar />

            <div className="w-full relative">
                <BidderHeader />

                <BidderContainer>
                    <AccountInactiveBanner />

                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">Active Events</h2>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {pagination.totalEvents || 0} events found
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {eventStats.map(stat => (
                            <div key={stat.title} className={`bg-white rounded-xl p-5 shadow-sm border ${stat.highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {stat.value}
                                        </h3>
                                        <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.highlight ? 'bg-amber-100 text-amber-600' : stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> */}

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search events by title, location, or description..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-center gap-2">
                                    <SortAsc size={18} className="text-gray-500" />
                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="ending_soon">Ending Soon</option>
                                        <option value="newest">Newest Created</option>
                                        <option value="oldest">Oldest Created</option>
                                        <option value="title_asc">Title (A-Z)</option>
                                        <option value="title_desc">Title (Z-A)</option>
                                    </select>
                                </div>

                                {/* View Mode Toggle */}
                                {/* <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                        title="Grid View"
                                    >
                                        <Grid size={18} className={viewMode === "grid" ? "text-blue-600" : "text-gray-500"} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                        title="List View"
                                    >
                                        <List size={18} className={viewMode === "list" ? "text-blue-600" : "text-gray-500"} />
                                    </button>
                                </div> */}
                            </div>
                        </div>

                        {/* Quick Filters */}
                        {/* <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("ongoing")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "ongoing" ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Ongoing
                            </button>
                            <button
                                onClick={() => setFilter("upcoming")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "upcoming" ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setFilter("past")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "past" ? "bg-gray-100 text-gray-800 border border-gray-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                Past
                            </button>
                        </div> */}
                    </div>

                    {/* Events Grid/List */}
                    {loading ? (
                        renderSkeletons()
                    ) : events.length > 0 ? (
                        <>
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                                    {events.map((event) => (
                                        <EventCard key={event._id} event={event} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4 mb-16">
                                    {events.map((event) => (
                                        <div key={event._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="md:w-1/4 lg:w-1/5">
                                                    <img
                                                        src={event.photos?.[0]?.url || ''}
                                                        alt={event.title}
                                                        className="w-full h-48 md:h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 p-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
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
                                                                        'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {event.status}
                                                        </span>
                                                        <Link to={`/events/${event._id}`} className="text-sm text-primary hover:underline">
                                                            View Event →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Load More */}
                            {pagination?.currentPage < pagination?.totalPages && (
                                <div className="flex justify-center mt-12">
                                    <button
                                        onClick={handleLoadMore}
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

                            {/* End of events */}
                            {pagination?.currentPage >= pagination?.totalPages && events.length > 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>You've seen all {pagination.totalEvents} events</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No events found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
                            <button
                                onClick={() => {
                                    setFilter("all");
                                    setSearchTerm("");
                                    setSortBy("ending_soon");
                                }}
                                className="bg-[#C59D55] text-white hover:bg-[#C59D55]/90 px-6 py-2 rounded-lg transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default ActiveEvents;