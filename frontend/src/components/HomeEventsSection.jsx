import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CalendarX } from "lucide-react";
import { Container, EventCard } from "./index";
import axiosInstance from "../utils/axiosInstance";

function HomeEventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("ongoing");

    const sectionRef = useRef(null);
    const navigate = useNavigate();

    // ============================================================
    // TAB CONFIG
    // ============================================================

    // These map directly to the `status` values the events API
    // understands: "upcoming" | "ongoing" | "past"
    const tabTitles = {
        upcoming: "Upcoming",
        ongoing: "Live",
        past: "Past",
    };

    const tabLabels = {
        upcoming: "Upcoming",
        ongoing: "Live",
        past: "Past",
    };

    // Sensible default sort per tab
    const tabSortMap = {
        upcoming: "ending_soon",
        ongoing: "ending_soon",
        past: "newest",
    };

    const tabDescriptions = {
        upcoming:
            "On the calendar and getting closer. See what's coming, set your budget, and be ready when the gavel drops.",
        ongoing:
            "Happening right now. These events are already underway — drop in before they close.",
        past:
            "Already wrapped. Browse past events to see what was on the block and how it all went.",
    };

    // ============================================================
    // FETCH EVENTS
    // ============================================================

    const fetchEvents = async (tab = activeTab) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("status", tab);
            params.append("page", "1");
            params.append("limit", "4");
            params.append("sortBy", tabSortMap[tab] || "newest");

            const { data } = await axiosInstance.get(
                `/api/v1/events?${params.toString()}`
            );

            if (data.success) {
                setEvents(data.data.events || []);
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.error("Fetch events error:", err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents("upcoming");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        fetchEvents(tab);
    };

    const handleViewMore = () => {
        const params = new URLSearchParams();
        params.append("status", activeTab);
        navigate(`/events?${params.toString()}`);
    };

    // ============================================================
    // INTERSECTION OBSERVER
    // Only start observing AFTER loading has finished.
    // ============================================================

    useEffect(() => {
        if (loading) return;

        const element = sectionRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [loading]);

    // ============================================================
    // LOADING SKELETON
    // ============================================================

    if (loading && events.length === 0) {
        return (
            <Container className="my-14">
                <div className="mb-8">
                    <div className="h-10 w-72 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-96 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-3 rounded-[24px] border border-gray-100 bg-white p-3 shadow-sm"
                        >
                            <div className="h-64 animate-pulse rounded-[18px] bg-gray-100" />
                            <div className="space-y-3 p-2 pt-5">
                                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                    <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    // ============================================================
    // MAIN SECTION
    // ============================================================

    return (
        <section ref={sectionRef} className="relative overflow-hidden">
            {/* Background accent */}
            <div className="pointer-events-none absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" />

            <Container className="mt-14">
                {/* =================================================
                    HEADER
                ================================================== */}

                <div
                    className={`transition-all duration-1000 ease-out ${visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                        }`}
                >
                    <div className="flex items-center justify-between flex-wrap gap-y-3">
                        <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
                            {tabTitles[activeTab]}
                            <span className="ml-2 font-medium italic text-gray-400">
                                Events
                            </span>
                        </h2>

                        {/* Tab Switcher */}
                        <div className="flex space-x-2 bg-white p-1 border border-gray-500/50 rounded-md text-sm">
                            {["ongoing", "upcoming"].map((tab) => (
                                <div className="flex items-center" key={tab}>
                                    <input
                                        type="radio"
                                        name="home-event-tabs"
                                        id={`home-event-tab-${tab}`}
                                        className="hidden peer"
                                        checked={activeTab === tab}
                                        onChange={() => handleTabChange(tab)}
                                    />
                                    <label
                                        htmlFor={`home-event-tab-${tab}`}
                                        className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-[#F5B51B] peer-checked:text-black"
                                    >
                                        {tabLabels[tab]}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <p
                        className={`mt-3 max-w-2xl text-sm leading-7 text-gray-500 transition-all delay-150 duration-1000 ease-out md:text-base ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-5 opacity-0"
                            }`}
                    >
                        {tabDescriptions[activeTab]}
                    </p>
                </div>

                {/* =================================================
                    EVENT GRID
                ================================================== */}

                {events.length > 0 ? (
                    <>
                        <section
                            className={`mt-10 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"
                                }`}
                        >
                            {events.map((event, index) => (
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

                        {/* =================================================
                            VIEW MORE
                        ================================================== */}

                        <div
                            className={`mt-12 flex justify-center transition-all delay-[900ms] duration-1000 ease-out ${visible
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-6 opacity-0"
                                }`}
                        >
                            <button
                                onClick={handleViewMore}
                                className="group flex items-center gap-2 rounded-lg bg-[#F5B51B] px-8 py-3 font-medium text-black transition-all duration-300 hover:bg-[#e4a000] hover:shadow-[0_0_35px_rgba(197,157,85,0.25)] focus:outline-none focus:ring-2 focus:ring-[#F5B51B] focus:ring-offset-2"
                            >
                                <CalendarDays size={17} />
                                <span>View More</span>
                                <ArrowRight
                                    size={18}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        className={`mt-10 text-center py-16 text-gray-500 transition-all duration-1000 ease-out ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-8 opacity-0"
                            }`}
                    >
                        <CalendarX
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                        />
                        <p className="text-lg font-medium">
                            No {tabLabels[activeTab].toLowerCase()} events
                        </p>
                        <p className="text-sm">
                            Check back soon — new events are added regularly
                        </p>
                    </div>
                )}
            </Container>
        </section>
    );
}

export default HomeEventsSection;