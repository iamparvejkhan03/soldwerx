import { useEffect, useRef, useState } from "react";
import { ArrowRight, Gavel, Star } from "lucide-react";
import { Container, EventCard } from "./index";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function FeaturedEventsSection() {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    const sectionRef = useRef(null);
    const navigate = useNavigate();
    
        const handleViewAll = () => {
            navigate("/events?featured=true");
        };

    // ============================================================
    // FETCH FEATURED EVENTS
    // ============================================================
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { data } = await axiosInstance.get(
                    "/api/v1/events/featured?limit=4"
                );
                if (!cancelled && data.success) {
                    setFeaturedEvents(data.data.events || []);
                }
            } catch (err) {
                console.error("Fetch featured events error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // ============================================================
    // INTERSECTION OBSERVER
    // ============================================================
    useEffect(() => {
        if (loading) return;
        if (featuredEvents.length === 0) return;

        const element = sectionRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        observer.observe(element);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    // Zero space when nothing is featured
    if (loading || featuredEvents.length === 0) return null;

    return (
        <section ref={sectionRef} className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" />

            <Container className="my-14">
                {/* Header */}
                <div
                    className={`transition-all duration-1000 ease-out ${visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                        }`}
                >
                    <div className="flex items-center justify-between flex-wrap gap-y-3">
                        <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
                            Featured
                            <span className="ml-2 font-medium italic text-gray-400">
                                Events
                            </span>
                        </h2>

                        <div className="flex items-center gap-2 rounded-full bg-[#F5B51B]/15 px-4 py-2 text-sm font-medium text-[#8a5a00]">
                            <Star size={16} fill="currentColor" />
                            Hand-picked by our team
                        </div>
                    </div>

                    <p
                        className={`mt-3 max-w-2xl text-sm leading-7 text-gray-500 transition-all delay-150 duration-1000 ease-out md:text-base ${visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-5 opacity-0"
                            }`}
                    >
                        Highlighted events picked by our team — don't miss
                        what's coming up next.
                    </p>
                </div>

                {/* Grid */}
                <section className="mt-10 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {featuredEvents.map((event, index) => (
                        <div
                            key={event._id}
                            className={`transition-all duration-1000 ease-out ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                                }`}
                            style={{
                                transitionDelay: `${300 + index * 150}ms`,
                            }}
                        >
                            <EventCard event={event} />
                        </div>
                    ))}
                </section>
                {/* Load More / View All buttons */}
                <div
                    className={`flex justify-center gap-4 mt-10 transition-all delay-[900ms] duration-1000 ease-out ${visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                        }`}
                >
                    <button
                        onClick={handleViewAll}
                        className="group flex items-center gap-2 bg-[#F5B51B] text-black font-medium rounded-lg hover:bg-gradient-to-r hover:from-[#D19F3E]/90 hover:to-[#E8B86B]/90 px-8 py-3 transition-all duration-300 hover:bg-[#e4a000] focus:outline-none focus:ring-2 focus:ring-[#F5B51B] focus:ring-offset-2"
                    >
                        <Gavel size={17} />
                        <span>View More</span>
                        <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </button>
                </div>
            </Container>
        </section>
    );
}

export default FeaturedEventsSection;