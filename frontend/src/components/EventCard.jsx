import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Gavel, Users } from "lucide-react";

const EventCard = ({ event }) => {
    const getStatusBadge = (status, eventDate, endDate) => {
        const now = new Date();
        const eventStart = new Date(eventDate);
        const eventEnd = endDate ? new Date(endDate) : null;

        if (status === 'draft') {
            return { class: "bg-gray-100 text-gray-800", text: "Draft" };
        }
        if (status === 'cancelled') {
            return { class: "bg-red-100 text-red-800", text: "Cancelled" };
        }
        if (status === 'completed') {
            return { class: "bg-blue-100 text-blue-800", text: "Completed" };
        }
        if (status === 'published') {
            if (eventEnd && now > eventEnd) {
                return { class: "bg-gray-100 text-gray-800", text: "Past" };
            }
            if (now > eventStart) {
                return { class: "bg-green-100 text-green-800", text: "Ongoing" };
            }
            return { class: "bg-purple-100 text-purple-800", text: "Upcoming" };
        }
        return { class: "bg-gray-100 text-gray-800", text: status };
    };

    const statusConfig = getStatusBadge(event.status, event.eventDate, event.endDate);

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
        <Link to={`/event/${event._id}`} className="block group">
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {event.photos?.[0]?.url ? (
                        <img
                            src={event.photos[0].url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Calendar size={48} className="text-gray-400" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${statusConfig.class}`}>
                            {statusConfig.text}
                        </span>
                    </div>

                    {/* Auction Count Badge */}
                    {event.auctions?.length > 0 && (
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                            <Gavel size={12} />
                            <span>{event.auctions.length} Auction{event.auctions.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                    </h3>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {event.description?.replace(/<[^>]*>/g, '').substring(0, 100)}
                        {event.description?.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{formatDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{formatTime(event.eventDate)}</span>
                        </div>
                    </div>

                    {event.location && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users size={14} />
                            <span>{event.views || 0} views</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            by {event.createdBy?.username || 'Unknown'}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;