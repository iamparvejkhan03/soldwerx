import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import {
    ChevronLeft,
    ChevronRight,
    Package,
    ArrowUpRight,
    Shirt,
    Trophy,
    CircleDot,
    Sparkles,
    Car,
    Building,
    Truck,
} from "lucide-react";
import "keen-slider/keen-slider.min.css";

// ============================================================
// CATEGORY ICON FALLBACK
// ============================================================

const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";

    if (name.includes("car") || name.includes("van") || name.includes("vehicle")) {
        return Car;
    }
    if (name.includes("estate") || name.includes("liquidate") || name.includes("liquidation")) {
        return Building;
    }
    if (name.includes("machinery") || name.includes("truck") || name.includes("dumper")) {
        return Truck;
    }
    if (name.includes("memorabilia") || name.includes("collectible")) {
        return Sparkles;
    }
    return Package;
};

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&auto=format&fit=crop";

function CategoryCarousel({ categories = [], onCategoryClick }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [sliderRef, instanceRef] = useKeenSlider({
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
        slides: {
            perView: 1.15,
            spacing: 14,
        },
        breakpoints: {
            "(min-width: 640px)": { slides: { perView: 2, spacing: 16 } },
            "(min-width: 768px)": { slides: { perView: 3, spacing: 18 } },
            "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } },
            "(min-width: 1280px)": { slides: { perView: 5, spacing: 20 } },
        },
        loop: categories.length > 5,
    });

    // ============================================================
    // AUTOPLAY
    // ============================================================

    useEffect(() => {
        if (!instanceRef.current || categories.length <= 5) return;

        const interval = setInterval(() => {
            instanceRef.current?.next();
        }, 5000);

        return () => clearInterval(interval);
    }, [instanceRef, categories.length]);

    const showControls = loaded && instanceRef.current && categories.length > 5;

    // ============================================================
    // EMPTY STATE
    // ============================================================

    if (!categories || categories.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#08090A] py-16 text-center">
                <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#F5B51B]/15 blur-3xl" />

                <div className="relative">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                        <Package size={26} strokeWidth={1.75} className="text-[#F5B51B]" />
                    </div>

                    <h3 className="mt-5 text-base font-black uppercase tracking-[-0.01em] text-white">
                        No categories available
                    </h3>

                    <p className="mt-2 text-sm text-white/45">
                        Check back soon for new collections.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // MAIN
    // ============================================================

    return (
        <div className="relative">
            {/* =====================================================
                NAVIGATION ARROWS
            ====================================================== */}

            {showControls && (
                <>
                    <button
                        type="button"
                        onClick={() => instanceRef.current?.prev()}
                        aria-label="Previous categories"
                        className="group absolute -left-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#F5B51B] hover:bg-black/80 hover:text-[#F5B51B] hover:shadow-[0_10px_35px_rgba(245,181,27,0.22)] active:scale-95 sm:flex"
                    >
                        <ChevronLeft
                            size={20}
                            className="transition-transform duration-300 group-hover:-translate-x-0.5"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() => instanceRef.current?.next()}
                        aria-label="Next categories"
                        className="group absolute -right-5 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#F5B51B] hover:bg-black/80 hover:text-[#F5B51B] hover:shadow-[0_10px_35px_rgba(245,181,27,0.22)] active:scale-95 sm:flex"
                    >
                        <ChevronRight
                            size={20}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </button>
                </>
            )}

            {/* =====================================================
                SLIDER
            ====================================================== */}

            <div ref={sliderRef} className="keen-slider !py-2">
                {categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const hasIcon = Boolean(category.icon);

                    const imageUrl = category.image || FALLBACK_IMAGE;

                    return (
                        <div
                            key={category.slug || category._id}
                            className="keen-slider__slide"
                        >
                            <button
                                type="button"
                                onClick={() => onCategoryClick?.(category.slug)}
                                aria-label={`Browse ${category.name}`}
                                className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B51B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A] rounded-[24px]"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-black ring-1 ring-white/10 transition-all duration-500 group-hover:ring-[#F5B51B]/50 group-hover:shadow-[0_30px_70px_-30px_rgba(245,181,27,0.45)]">

                                    {/* =================================================
                                        IMAGE
                                    ================================================== */}

                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                        style={{ backgroundImage: `url(${imageUrl})` }}
                                    />

                                    {/* Base gradient for legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-black/40 to-black/10" />

                                    {/* Vignette on hover for depth */}
                                    <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_45%,rgba(0,0,0,0.6)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                    {/* Warm gold wash */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#F5B51B]/0 via-transparent to-[#F5B51B]/25 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />

                                    {/* Shine sweep */}
                                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-full motion-reduce:hidden" />

                                    {/* =================================================
                                        TOP ROW
                                    ================================================== */}

                                    <div className="absolute inset-x-5 top-5 flex items-start justify-between">
                                        {/* Category icon badge */}
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:border-[#F5B51B] group-hover:bg-[#F5B51B] group-hover:text-black">
                                            {hasIcon ? (
                                                <img
                                                    src={category.icon}
                                                    alt=""
                                                    className="h-7 w-7 object-contain brightness-0 invert transition-all duration-500 group-hover:invert-0"
                                                />
                                            ) : (
                                                <Icon size={18} strokeWidth={1.75} />
                                            )}
                                        </div>

                                        {/* Floating arrow (reveals on hover) */}
                                        <div className="flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:border-[#F5B51B]/60 group-hover:opacity-100 group-hover:text-[#F5B51B]">
                                            <ArrowUpRight size={16} />
                                        </div>
                                    </div>

                                    {/* =================================================
                                        CONTENT
                                    ================================================== */}

                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <div className="flex items-end justify-between gap-3">
                                            <div className="min-w-0">
                                                {category.auctionCount > 0 && (
                                                    <span className="inline-flex items-center rounded-full border border-[#F5B51B]/30 bg-[#F5B51B]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F5B51B] backdrop-blur-md">
                                                        {category.auctionCount.toLocaleString()} auctions
                                                    </span>
                                                )}

                                                <h3 className="mt-2 truncate text-lg font-black uppercase tracking-[-0.02em] text-white">
                                                    {category.name}
                                                </h3>
                                            </div>

                                            {/* Small CTA circle */}
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:scale-105 group-hover:bg-[#F5B51B] group-hover:text-black">
                                                <ArrowUpRight size={16} />
                                            </div>
                                        </div>

                                        {/* Gold progress track */}
                                        <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-white/15">
                                            <div className="h-full w-0 rounded-full bg-gradient-to-r from-[#F5B51B] to-[#FFC83D] transition-all duration-700 ease-out group-hover:w-full motion-reduce:transition-none" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* =====================================================
                DOT NAVIGATION
            ====================================================== */}

            {showControls && (
                <div className="mt-8 flex justify-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md">
                        {Array.from(
                            { length: instanceRef.current.track.details.slides.length },
                            (_, idx) => idx
                        ).map((idx) => {
                            const isActive = currentSlide === idx;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                                    aria-label={`Go to category slide ${idx + 1}`}
                                    aria-current={isActive ? "true" : undefined}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isActive
                                            ? "w-8 bg-[#F5B51B]"
                                            : "w-1.5 bg-white/25 hover:bg-white/45"
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryCarousel;