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
} from "lucide-react";
import "keen-slider/keen-slider.min.css";

// ============================================================
// CATEGORY ICON FALLBACK
// ============================================================

const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";

    if (
        name.includes("sports") ||
        name.includes("sport") ||
        name.includes("card")
    ) {
        return Trophy;
    }

    if (
        name.includes("jersey") ||
        name.includes("shirt") ||
        name.includes("apparel")
    ) {
        return Shirt;
    }

    if (
        name.includes("ball") ||
        name.includes("game")
    ) {
        return CircleDot;
    }

    if (
        name.includes("memorabilia") ||
        name.includes("collectible")
    ) {
        return Sparkles;
    }

    return Package;
};

function CategoryCarousel({
    categories = [],
    onCategoryClick,
}) {
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
            "(min-width: 640px)": {
                slides: {
                    perView: 2,
                    spacing: 16,
                },
            },

            "(min-width: 768px)": {
                slides: {
                    perView: 3,
                    spacing: 18,
                },
            },

            "(min-width: 1024px)": {
                slides: {
                    perView: 4,
                    spacing: 20,
                },
            },

            "(min-width: 1280px)": {
                slides: {
                    perView: 5,
                    spacing: 20,
                },
            },
        },

        loop: categories.length > 5,
    });

    // ============================================================
    // AUTOPLAY
    // ============================================================

    useEffect(() => {
        if (!instanceRef.current || categories.length <= 5) {
            return;
        }

        const interval = setInterval(() => {
            instanceRef.current?.next();
        }, 5000);

        return () => clearInterval(interval);
    }, [instanceRef, categories.length]);

    // ============================================================
    // EMPTY STATE
    // ============================================================

    if (!categories || categories.length === 0) {
        return (
            <div className="rounded-3xl border border-gray-100 bg-gray-50 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Package
                        size={25}
                        className="text-gray-300"
                    />
                </div>

                <h3 className="mt-5 text-base font-semibold text-gray-700">
                    No categories available
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                    Check back soon for new collections.
                </p>
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

            {loaded &&
                instanceRef.current &&
                categories.length > 5 && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                instanceRef.current?.prev()
                            }
                            className="group absolute -left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-x-1 hover:border-[#C59D55]/30 hover:text-[#A17B35] sm:flex"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft
                                size={19}
                                className="transition-transform group-hover:-translate-x-0.5"
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                instanceRef.current?.next()
                            }
                            className="group absolute -right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:translate-x-1 hover:border-[#C59D55]/30 hover:text-[#A17B35] sm:flex"
                            aria-label="Next categories"
                        >
                            <ChevronRight
                                size={19}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </button>
                    </>
                )}

            {/* =====================================================
                SLIDER
            ====================================================== */}

            <div
                ref={sliderRef}
                className="keen-slider"
            >
                {categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);

                    const imageUrl =
                        category.image ||
                        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&auto=format&fit=crop";

                    const iconUrl =
                        category.icon ||
                        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&auto=format&fit=crop";

                    return (
                        <div
                            key={category.slug || category._id}
                            className="keen-slider__slide"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    onCategoryClick(category.slug)
                                }
                                className="group block w-full text-left focus:outline-none"
                            >
                                <div className="relative h-[290px] overflow-hidden rounded-[22px] bg-gray-100">

                                    {/* =================================================
                                        IMAGE
                                    ================================================== */}

                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                                        style={{
                                            backgroundImage: `url(${imageUrl})`,
                                        }}
                                    />

                                    {/* Image contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5 transition-all duration-500 group-hover:from-black/85" />

                                    {/* Subtle gold glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C59D55]/0 via-transparent to-[#C59D55]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                    {/* =================================================
                                        TOP CATEGORY ICON
                                    ================================================== */}

                                    <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/25 text-white/80 backdrop-blur-md transition-all duration-500 group-hover:border-[#C59D55]/40 group-hover:bg-[#C59D55] group-hover:text-[#111]">
                                        {iconUrl ? (
                                            <img
                                                src={iconUrl}
                                                alt={category.name}
                                                className="h-7 w-7 invert object-cover"
                                            />
                                        ) : (
                                            <Icon size={18} />
                                        )}
                                    </div>

                                    {/* =================================================
                                        ARROW
                                    ================================================== */}

                                    <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/70 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                                        <ArrowUpRight size={16} />
                                    </div>

                                    {/* =================================================
                                        CONTENT
                                    ================================================== */}

                                    <div className="absolute bottom-0 left-0 right-0 p-5">

                                        <div className="flex items-end justify-between gap-3">

                                            <div>
                                                <h3 className="text-lg font-bold tracking-tight text-white">
                                                    {category.name}
                                                </h3>

                                                {category.auctionCount > 0 && (
                                                    <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 backdrop-blur-md">
                                                        <span className="text-[10px] font-medium text-white/75">
                                                            {category.auctionCount.toLocaleString()}{" "}
                                                            auctions
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Small arrow */}
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:bg-[#C59D55]">
                                                <ArrowUpRight size={16} />
                                            </div>
                                        </div>

                                        {/* Gold underline */}
                                        <div className="mt-4 h-[2px] w-0 bg-[#C59D55] transition-all duration-500 group-hover:w-full" />
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

            {loaded &&
                instanceRef.current &&
                categories.length > 5 && (
                    <div className="mt-7 flex items-center justify-center gap-1.5">
                        {Array.from(
                            {
                                length:
                                    instanceRef.current.track.details.slides
                                        .length,
                            },
                            (_, idx) => idx
                        ).map((idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                    instanceRef.current?.moveToIdx(
                                        idx
                                    )
                                }
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx
                                    ? "w-7 bg-[#C59D55]"
                                    : "w-1.5 bg-gray-200 hover:bg-gray-300"
                                    }`}
                                aria-label={`Go to category slide ${idx + 1
                                    }`}
                            />
                        ))}
                    </div>
                )}
        </div>
    );
}

export default CategoryCarousel;