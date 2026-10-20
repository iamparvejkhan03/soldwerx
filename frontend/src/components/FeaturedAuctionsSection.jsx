import { useEffect, useRef, useState } from "react";
import { ArrowRight, Gavel, Star } from "lucide-react";
import { Container, AuctionCard } from "./index";
import axiosInstance from "../utils/axiosInstance";
import { useLiveAuctionTicks } from "../hooks/useLiveAuctionTicks";
import { useNavigate } from "react-router-dom";

function FeaturedAuctionsSection() {
    const [featuredAuctions, setFeaturedAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    const sectionRef = useRef(null);
    const navigate = useNavigate();

    const handleViewAll = () => {
        navigate("/auctions?featured=true");
    };

    // Same live-tick hook — currentPrice / bidCount / endDate / status update in real time
    useLiveAuctionTicks(setFeaturedAuctions);

    // ============================================================
    // FETCH FEATURED AUCTIONS
    // ============================================================
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { data } = await axiosInstance.get(
                    "/api/v1/auctions/featured?limit=4"
                );
                if (!cancelled && data.success) {
                    setFeaturedAuctions(data.data.auctions || []);
                }
            } catch (err) {
                console.error("Fetch featured auctions error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Drop anything that ended or got sold while the user is on the page,
    // so it disappears live from the featured row (no refresh needed).
    const visibleFeatured = featuredAuctions.filter(
        (a) => a.status === "active" && new Date(a.endDate) > new Date()
    );

    // ============================================================
    // INTERSECTION OBSERVER (same animation pattern as main sections)
    // ============================================================
    useEffect(() => {
        if (loading) return;
        if (visibleFeatured.length === 0) return;

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

    // Take zero space while loading or when nothing is featured.
    if (loading || visibleFeatured.length === 0) return null;

    return (
        <section ref={sectionRef} className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" />

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
                                Auctions
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
                        A curated selection of standout auctions — chosen by our
                        team for quality, rarity, and seller reputation.
                    </p>
                </div>

                {/* Grid */}
                <section className="mt-10 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visibleFeatured.map((auction, index) => (
                        <div
                            key={auction._id}
                            className={`transition-all duration-1000 ease-out ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                                }`}
                            style={{
                                transitionDelay: `${300 + index * 150}ms`,
                            }}
                        >
                            <AuctionCard auction={auction} />
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

export default FeaturedAuctionsSection;