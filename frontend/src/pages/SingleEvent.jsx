import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Gavel,
    Eye,
    ArrowLeft,
    Share2,
    Heart,
    MessageSquare,
    File,
    Download,
    Image as ImageIcon,
    User,
    CalendarDays,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader,
    ChevronRight
} from "lucide-react";
import { Container, LoadingSpinner, AuctionCard } from "../components";
import { about } from "../assets";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

// Lazy load components
const ImageLightBox = lazy(() => import('../components/ImageLightBox'));
const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));

function SingleEvent() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [auctions, setAuctions] = useState([]);
    const [loadingAuctions, setLoadingAuctions] = useState(false);
    const [activeTab, setActiveTab] = useState('auctions');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const hasFetchedRef = useRef(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch event data
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/events/${id}`);

                if (data.success) {
                    setEvent(data.data.event);
                    // Set auctions from the event data
                    setAuctions(data.data.event.auctions || []);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to fetch event');
                console.error('Fetch event error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchEvent();
        }
    }, [id]);

    // Handle document download
    const handleDocumentDownload = (documentUrl, filename) => {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = filename;
        link.target = '_blank';
        link.click();
    };

    // Get status badge
    const getStatusBadge = (status, eventDate, endDate) => {
        const now = new Date();
        const eventStart = new Date(eventDate);
        const eventEnd = endDate ? new Date(endDate) : null;

        if (status === 'draft') {
            return {
                class: "bg-gray-100 text-gray-800",
                text: "Draft",
                icon: <AlertCircle size={16} />
            };
        }
        if (status === 'cancelled') {
            return {
                class: "bg-red-100 text-red-800",
                text: "Cancelled",
                icon: <XCircle size={16} />
            };
        }
        if (status === 'completed') {
            return {
                class: "bg-blue-100 text-blue-800",
                text: "Completed",
                icon: <CheckCircle size={16} />
            };
        }
        if (status === 'published') {
            if (eventEnd && now > eventEnd) {
                return {
                    class: "bg-gray-100 text-gray-800",
                    text: "Past",
                    icon: <Clock size={16} />
                };
            }
            if (now > eventStart) {
                return {
                    class: "bg-green-100 text-green-800",
                    text: "Ongoing",
                    icon: <CheckCircle size={16} />
                };
            }
            return {
                class: "bg-purple-100 text-purple-800",
                text: "Upcoming",
                icon: <Calendar size={16} />
            };
        }
        return {
            class: "bg-gray-100 text-gray-800",
            text: status,
            icon: <AlertCircle size={16} />
        };
    };

    const statusConfig = event ? getStatusBadge(event.status, event.eventDate, event.endDate) : null;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeRemaining = (eventDate, endDate) => {
        const now = new Date();
        const target = endDate ? new Date(endDate) : new Date(eventDate);
        const diffMs = target - now;

        if (diffMs <= 0) return 'Event has ended';

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays}d ${diffHours}h`;
        } else if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        } else {
            return `${diffMinutes}m`;
        }
    };

    // Share event
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: event?.title,
                text: event?.description?.replace(/<[^>]*>/g, '').substring(0, 100),
                url: window.location.href,
            }).catch(() => { });
        } else {
            // Copy to clipboard fallback
            navigator.clipboard.writeText(window.location.href)
                .then(() => toast.success('Link copied to clipboard!'))
                .catch(() => toast.error('Failed to copy link'));
        }
    };

    if (loading) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (!event) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600">Event not found</h2>
                    <Link to="/events" className="text-[#C59D55] hover:underline mt-4 inline-block">
                        Back to Events
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="pt-32 pb-16 min-h-[70vh]">
            {/* Back Button */}
            <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                <span>Back to Events</span>
            </button>

            {/* Event Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Event Banner/Image */}
                <div className="relative aspect-[21/9] md:aspect-[21/7] bg-gray-100">
                    {event.photos?.[0]?.url ? (
                        <img
                            src={event.photos[0].url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                            <Calendar size={64} className="text-gray-400" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg ${statusConfig.class}`}>
                            {statusConfig.icon}
                            {statusConfig.text}
                        </span>
                    </div>

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-lg"
                        title="Share Event"
                    >
                        <Share2 size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* Event Info */}
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {event.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <User size={16} />
                                    <span>Organized by {event.createdBy?.username || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Eye size={16} />
                                    <span>{event.views || 0} views</span>
                                </div>
                                {event.auctions?.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <Gavel size={16} />
                                        <span>{event.auctions.length} Auction{event.auctions.length !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                {/* Share & Save */}
                    <div className="">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                            >
                                <Share2 size={18} />
                                <span className="text-sm">Share</span>
                            </button>
                            <button
                                onClick={() => {
                                    // Add to calendar functionality
                                    const eventDate = new Date(event.eventDate);
                                    const endDate = event.endDate ? new Date(event.endDate) : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
                                    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}/${endDate.toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent(event.description?.replace(/<[^>]*>/g, '') || '')}&location=${encodeURIComponent(event.location || '')}`;
                                    window.open(calendarUrl, '_blank');
                                }}
                                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                            >
                                <CalendarDays size={18} />
                                <span className="text-sm">Add to Calendar</span>
                            </button>
                        </div>
                    </div>
                            </div>
                        </div>

                        {event.status === 'published' && (
                            <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                <div className="text-center">
                                    <p className="text-xs text-green-600">Time Remaining</p>
                                    <p className="font-semibold text-green-700">
                                        {formatTimeRemaining(event.eventDate, event.endDate)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Event Date</p>
                                <p className="font-medium text-gray-900">{formatDateTime(event.eventDate)}</p>
                            </div>
                        </div>

                        {event.endDate && (
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">End Date</p>
                                    <p className="font-medium text-gray-900">{formatDateTime(event.endDate)}</p>
                                </div>
                            </div>
                        )}

                        {event.location && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="font-medium text-gray-900">{event.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Event Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
                        <div className="prose prose-lg max-w-none">
                            {event.description ? (
                                <div dangerouslySetInnerHTML={{ __html: event.description }} />
                            ) : (
                                <p className="text-gray-500">No description provided.</p>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    {event.documents && event.documents.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Documents</h2>
                            <div className="flex flex-wrap gap-3">
                                {event.documents.map((doc, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleDocumentDownload(doc.url, doc.originalName || doc.filename)}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-2 px-4 rounded-lg text-gray-700 group hover:text-primary transition-colors"
                                    >
                                        <File size={18} className="flex-shrink-0" />
                                        <span className="group-hover:underline max-w-[150px] truncate">
                                            {doc.originalName || doc.filename}
                                        </span>
                                        <Download size={16} className="flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                            {event.documents.some(doc => doc.caption) && (
                                <div className="mt-3 space-y-1">
                                    {event.documents.map((doc, index) => (
                                        doc.caption && (
                                            <p key={index} className="text-xs text-gray-500">
                                                {doc.caption}
                                            </p>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Photo Gallery */}
                    {event.photos && event.photos.length > 1 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Gallery</h2>
                            <Suspense fallback={<LoadingSpinner />}>
                                <ImageLightBox
                                    images={event.photos}
                                    type="event-gallery"
                                    captions={event.photos.map(photo => photo.caption || '')}
                                />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Auctions Section */}
            {event.auctions && event.auctions.length > 0 && (
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Auctions in This Event
                        </h2>
                        {/* <Link
                            to={`/auctions?event=${event._id}`}
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                            View All
                            <ChevronRight size={16} />
                        </Link> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {event.auctions.map((auction) => (
                            <AuctionCard
                                key={auction._id}
                                auction={auction}
                            />
                        ))}
                    </div>

                    {/* {event.auctions.length > 6 && (
                        <div className="text-center mt-8">
                            <Link
                                to={`/auctions?event=${event._id}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                            >
                                <span>View All {event.auctions.length} Auctions</span>
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    )} */}
                </div>
            )}

            {/* No Auctions Message */}
            {event.auctions && event.auctions.length === 0 && (
                <div className="mt-12 bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Auctions Assigned</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This event doesn't have any auctions assigned yet. Check back later for updates.
                    </p>
                </div>
            )}
        </Container>
    );
}

export default SingleEvent;