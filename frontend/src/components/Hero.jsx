import { Link } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    ShieldCheck,
    TrendingUp,
    Handshake,
    Truck,
    Building2,
    MapPin,
    PackageCheck,
    ChevronRight,
} from "lucide-react";

import { Container } from "../components";
import { heroImg } from "../assets";

function Hero() {
    const highlights = [
        {
            icon: ShieldCheck,
            title: "TRUSTED",
            description: "Verified listings. Secure transactions.",
        },
        {
            icon: TrendingUp,
            title: "MAXIMUM EXPOSURE",
            description: "Put your assets in front of serious buyers.",
        },
        {
            icon: Handshake,
            title: "SIMPLE PROCESS",
            description: "Buy, sell and manage everything in one place.",
        },
        {
            icon: PackageCheck,
            title: "WE HANDLE THE DETAILS",
            description: "From listing to closing, made simple.",
        },
        // {
        //     icon: Truck,
        //     title: "MULTIPLE ASSET TYPES",
        //     description: "Equipment, trucks, trailers and more.",
        // },
        // {
        //     icon: MapPin,
        //     title: "BUILT FOR THE MARKET",
        //     description: "Local assets. Serious buyers.",
        // },
    ];

    return (
        <section className="relative overflow-hidden bg-[#08090A] text-white">
            {/* =====================================================
                HERO BACKGROUND
            ====================================================== */}

            <div className="absolute inset-0">
                <img
                    src={heroImg}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[80%_20%] md:object-[75%_30%]"
                />

                {/* Strong left-to-right overlay */}
                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-black/[0.92]
                        via-black/[0.62]
                        to-black/[0.32]
                    "
                />

                {/* Bottom darkening */}
                <div
                    className="
                        absolute
                        inset-x-0
                        bottom-0
                        h-[45%]
                        bg-gradient-to-t
                        from-black/[0.95]
                        via-black/[0.45]
                        to-transparent
                    "
                />

                {/* Slight overall dark layer */}
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <Container>
                <div
                    className="
                        relative
                        z-10
                        flex
                        min-h-[680px]
                        flex-col
                        justify-center
                        pt-32
                        pb-20
                        sm:min-h-[720px]
                        lg:min-h-screen
                        lg:py-32
                    "
                >
                    {/* =================================================
                        SMALL EYEBROW
                    ================================================== */}

                    <div
                        className="
                            mb-6
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <div className="h-[2px] w-5 sm:w-10 bg-[#F5B51B]" />

                        <span
                            className="
                                text-[10px]
                                font-bold
                                tracking-[0.22em]
                                text-[#F5B51B]
                                sm:text-xs
                                uppercase
                            "
                        >
                            Consign It. Auction It. Liquidate It.
                        </span>
                    </div>

                    {/* =================================================
                        HEADING
                    ================================================== */}

                    <h1
                        className="
                            max-w-[850px]
                            text-4xl
                            font-black
                            uppercase
                            leading-[0.88]
                            tracking-[-0.045em]
                            sm:text-5xl
                            md:text-5xl
                            lg:text-6xl
                            xl:text-7xl
                        "
                    >
                        Got Assets?
                        <br />

                        <span className="text-white">
                            Get Them
                        </span>{" "}

                        <span className="text-[#F5B51B]">
                            Sold.
                        </span>
                    </h1>

                    {/* =================================================
                        DESCRIPTION
                    ================================================== */}

                    <p
                        className="
                            mt-7
                            max-w-[650px]
                            text-sm
                            font-medium
                            leading-6
                            text-white/75
                            sm:text-base
                            sm:leading-7
                            lg:text-lg
                        "
                    >
                        Equipment. Trucks. Trailers. Business assets.
                        Estates. Buy what you need or turn unused
                        assets into cash through a marketplace built
                        to make selling simple.
                    </p>

                    {/* =================================================
                        GOLD UNDERLINE
                    ================================================== */}

                    <div className="mt-6 h-[3px] w-16 bg-[#F5B51B]" />

                    {/* =================================================
                        CTA BUTTONS
                    ================================================== */}

                    <div
                        className="
        mt-8
        flex
        flex-col
        gap-2.5
        sm:flex-row
        sm:flex-wrap
    "
                    >
                        {/* =====================================================
        BROWSE LISTINGS
    ====================================================== */}

                        <Link
                            to="/auctions"
                            className="
            group
            inline-flex
            h-14
            items-center
            justify-between
            gap-6
            bg-[#F5B51B]
            px-5
            text-xs
            font-black
            uppercase
            tracking-[0.06em]
            text-black
            transition-all
            duration-300
            hover:bg-[#FFC83D]
            hover:shadow-[0_10px_35px_rgba(245,181,27,0.22)]
            sm:min-w-[175px]
            sm:px-6
        "
                        >
                            <span className="flex items-center gap-3">
                                <PackageCheck
                                    size={20}
                                    strokeWidth={2}
                                />

                                <span>
                                    Browse Listings
                                    <span className="block text-[9px] font-bold tracking-[0.08em] opacity-60">
                                        EXPLORE ASSETS
                                    </span>
                                </span>
                            </span>

                            <ChevronRight
                                size={18}
                                strokeWidth={2.5}
                                className="
                transition-transform
                duration-300
                group-hover:translate-x-1
            "
                            />
                        </Link>


                        {/* =====================================================
        SELL AN ASSET
    ====================================================== */}

                        <Link
                            to="/sell-with-us"
                            className="
            group
            inline-flex
            h-14
            items-center
            justify-between
            gap-6
            border
            border-white/25
            bg-black/35
            px-5
            text-xs
            font-black
            uppercase
            tracking-[0.06em]
            text-white
            backdrop-blur-sm
            transition-all
            duration-300
            hover:border-[#F5B51B]
            hover:bg-black/50
            sm:min-w-[175px]
            sm:px-6
        "
                        >
                            <span className="flex items-center gap-3">
                                <TrendingUp
                                    size={20}
                                    strokeWidth={2}
                                    className="
                    text-[#F5B51B]
                    transition-transform
                    duration-300
                    group-hover:-translate-y-0.5
                "
                                />

                                <span>
                                    Sell an Asset
                                    <span className="block text-[9px] font-bold tracking-[0.08em] text-white/40">
                                        GET STARTED
                                    </span>
                                </span>
                            </span>

                            <ChevronRight
                                size={18}
                                strokeWidth={2.5}
                                className="
                text-white/50
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:text-[#F5B51B]
            "
                            />
                        </Link>


                        {/* =====================================================
        LIQUIDATE
    ====================================================== */}

                        <Link
                            to="/liquidate"
                            className="
            group
            inline-flex
            h-14
            items-center
            justify-between
            gap-6
            border
            border-white/25
            bg-black/35
            px-5
            text-xs
            font-black
            uppercase
            tracking-[0.06em]
            text-white
            backdrop-blur-sm
            transition-all
            duration-300
            hover:border-[#F5B51B]
            hover:bg-black/50
            sm:min-w-[190px]
            sm:px-6
        "
                        >
                            <span className="flex items-center gap-3">
                                <Building2
                                    size={20}
                                    strokeWidth={2}
                                    className="
                    text-[#F5B51B]
                    transition-transform
                    duration-300
                    group-hover:scale-105
                "
                                />

                                <span>
                                    Liquidate
                                    <span className="block text-[9px] font-bold tracking-[0.08em] text-white/40">
                                        GET A SOLUTION
                                    </span>
                                </span>
                            </span>

                            <ChevronRight
                                size={18}
                                strokeWidth={2.5}
                                className="
                text-white/50
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:text-[#F5B51B]
            "
                            />
                        </Link>
                    </div>

                    {/* =================================================
                        QUICK CATEGORY LINKS
                    ================================================== */}

                    <div
                        className="
                            mt-8
                            flex
                            flex-wrap
                            items-center
                            gap-x-5
                            gap-y-2
                        "
                    >
                        <span
                            className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.16em]
                                text-white/35
                            "
                        >
                            Explore
                        </span>

                        {[
                            {title:"Heavy Equipment", slug: 'heavy-equipment'},
                            {title: "Trailers", slug: 'trailers'},
                            {title: "Business Assets", slug: 'business-assets'},
                            {title: "Vehicles", slug: 'vehicles'},
                        ].map((item, index) => (
                            <Link
                                key={item.title}
                                to={`/auctions?category=${encodeURIComponent(
                                    item.slug
                                )}`}
                                className="
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.08em]
                                    text-white/65
                                    transition-colors
                                    hover:text-[#F5B51B]
                                "
                            >
                                {item.title}

                                {index !== 3 && (
                                    <span className="ml-5 text-white/20">
                                        /
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* =================================================
                        BOTTOM VALUE STRIP
                    ================================================== */}

                    <div
                        className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            border-t
                            border-white/10
                            backdrop-blur-md
                        "
                    >
                        <div
                            className="
                                hidden
                                lg:grid
                                grid-cols-2
                                divide-x
                                divide-y
                                divide-white/10
                                sm:grid-cols-3
                                lg:grid-cols-4
                                lg:divide-y-0
                            "
                        >
                            {highlights.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className="
                                            flex
                                            min-h-[82px]
                                            items-center
                                            gap-3
                                            px-4
                                            py-4
                                            sm:px-5
                                            lg:min-h-[76px]
                                            lg:px-4
                                            xl:px-5
                                        "
                                    >
                                        <Icon
                                            size={24}
                                            strokeWidth={1.7}
                                            className="
                                                shrink-0
                                                text-[#F5B51B]
                                            "
                                        />

                                        <div className="min-w-0">
                                            <div
                                                className="
                                                    text-xs
                                                    font-medium
                                                    uppercase
                                                    tracking-[0.08em]
                                                    text-white
                                                "
                                            >
                                                {item.title}
                                            </div>

                                            <div
                                                className="
                                                    mt-1
                                                    line-clamp-2
                                                    text-[11px]
                                                    leading-3
                                                    text-white/60
                                                "
                                            >
                                                {item.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}

export default Hero;