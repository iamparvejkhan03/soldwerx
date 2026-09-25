import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    ArrowUpRight,
    ChartColumnIncreasing,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";
import { about, heroImg } from "../assets";
import { Container } from "../components";
import { Link } from "react-router-dom";

function About() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    /* ============================================================
       INTERSECTION OBSERVER
    ============================================================ */

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry.isIntersecting);
            },
            {
                threshold: 0.15,
            }
        );

        const currentRef = ref.current;

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);


    const benefits = [
        {
            number: "01",
            icon: ShieldCheck,
            title: "Trust comes first",
            text: "A straightforward marketplace built to give buyers and sellers confidence.",
        },
        {
            number: "02",
            icon: ChartColumnIncreasing,
            title: "More eyes on your asset",
            text: "Connect your listings with people actively looking for what you have.",
        },
        {
            number: "03",
            icon: Users,
            title: "Built around people",
            text: "Simple tools that make buying and selling feel less complicated.",
        },
    ];


    return (
        <section
            ref={ref}
            className="
                relative
                my-8
                md:my-14
                overflow-hidden
                bg-[#F8F7F4]
                py-14
            "
        >

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-48
                    top-20
                    h-[550px]
                    w-[550px]
                    rounded-full
                    bg-[#F5B51B]/[0.055]
                    blur-[120px]
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -left-48
                    bottom-0
                    h-[450px]
                    w-[450px]
                    rounded-full
                    bg-gray-200/50
                    blur-[100px]
                "
            />


            <Container>

                <div className="relative z-10">


                    {/* =================================================
                        MAIN INTRO
                    ================================================== */}

                    <div
                        className={`
                            grid
                            gap-12
                            lg:grid-cols-[0.85fr_1.15fr]
                            lg:items-center
                            lg:gap-20
                            transition-all
                            duration-1000
                            ease-out
                            ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                            }
                        `}
                    >
                        
                        {/* =================================================
                            RIGHT VISUAL
                        ================================================== */}

                        <div
                            className={`
                                relative
                                transition-all
                                delay-200
                                duration-[1200ms]
                                ease-out
                                ${visible
                                    ? "translate-x-0 opacity-100"
                                    : "translate-x-12 opacity-0"
                                }
                            `}
                        >

                            {/* Main image */}

                            <div
                                className="
                                    relative
                                    ml-auto
                                    h-[350px]
                                    w-full
                                    overflow-hidden
                                    rounded-[30px]
                                    sm:h-[420px]
                                    lg:h-[500px]
                                "
                            >

                                <img
                                    src={heroImg}
                                    alt="SoldWerx marketplace"
                                    className="
                                        h-full
                                        w-full
                                        object-cover
                                        object-[80%_20%] 
                                        md:object-[70%_30%]
                                        transition-transform
                                        duration-[1400ms]
                                        ease-out
                                        hover:scale-[1.035]
                                        brightness-75
                                    "
                                />

                                {/* image gradient */}

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        bg-gradient-to-t
                                        from-black/65
                                        via-transparent
                                        to-black/5
                                    "
                                />


                                {/* image label */}

                                <div
                                    className="
                                        absolute
                                        left-5
                                        top-5
                                        flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        border-white/20
                                        bg-black/20
                                        px-4
                                        py-2
                                        backdrop-blur-md
                                        sm:left-7
                                        sm:top-7
                                    "
                                >

                                    <Sparkles
                                        size={13}
                                        className="text-[#F5B51B]"
                                    />

                                    <span
                                        className="
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            text-white
                                        "
                                    >
                                        Built for real assets
                                    </span>

                                </div>


                                {/* image bottom statement */}

                                <div
                                    className="
                                        absolute
                                        bottom-7
                                        left-6
                                        right-6
                                        sm:bottom-9
                                        sm:left-9
                                        sm:right-9
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                            text-[#F5B51B]
                                        "
                                    >
                                        Buy · Sell · Move
                                    </p>

                                    <h3
                                        className="
                                            mt-3
                                            max-w-lg
                                            text-3xl
                                            font-black
                                            leading-[1]
                                            tracking-[-0.04em]
                                            text-white
                                            sm:text-4xl
                                        "
                                    >
                                        Buy, sell, or liquidate —
                                        <span className="text-white/70">
                                            {" "}all in one place.
                                        </span>
                                    </h3>

                                </div>

                            </div>


                            {/* =================================================
                                FLOATING SECONDARY CARD
                            ================================================== */}

                            {/* <div
                                className={`
                                    absolute
                                    -top-7
                                    -right-3
                                    w-[190px]
                                    overflow-hidden
                                    rounded-[22px]
                                    border-4
                                    border-[#F8F7F4]
                                    bg-white
                                    shadow-[0_20px_50px_rgba(17,19,21,0.14)]
                                    transition-all
                                    delay-500
                                    duration-1000
                                    ease-out
                                    sm:-left-7
                                    sm:w-[230px]
                                    ${visible
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-10 opacity-0"
                                    }
                                `}
                            >

                                <img
                                    src={about}
                                    alt="SoldWerx assets"
                                    className="
                                        h-28
                                        w-full
                                        object-cover
                                        transition-transform
                                        duration-700
                                        group-hover:scale-105
                                        sm:h-32
                                    "
                                />

                                <div className="flex items-center justify-between px-4 py-3">

                                    <div>

                                        <p
                                            className="
                                                text-[8px]
                                                font-bold
                                                uppercase
                                                tracking-[0.15em]
                                                text-gray-400
                                            "
                                        >
                                            One platform
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-sm
                                                font-bold
                                                text-[#111315]
                                            "
                                        >
                                            Every asset
                                        </p>

                                    </div>

                                    <ArrowUpRight
                                        size={16}
                                        className="text-[#F5B51B]"
                                    />

                                </div>

                            </div> */}

                        </div>

                        {/* =================================================
                            LEFT CONTENT
                        ================================================== */}

                        <div className="max-w-xl">

                            {/* Eyebrow */}

                            <div className="flex items-center gap-3">

                                <span className="h-px w-9 bg-[#F5B51B]" />

                                <span
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.22em]
                                        text-[#F5B51B]
                                    "
                                >
                                    About SoldWerx
                                </span>

                            </div>


                            {/* Heading */}

                            <h2
                                className={`
                                    mt-7
                                    text-4xl
                                    font-black
                                    leading-[0.96]
                                    tracking-[-0.05em]
                                    text-[#111315]
                                    transition-all
                                    delay-100
                                    duration-1000
                                    ease-out
                                    sm:text-5xl
                                    lg:text-[60px]
                                    ${visible
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-8 opacity-0"
                                    }
                                `}
                            >
                                More than a
                                <br />

                                <span
                                    className="
                                        font-medium
                                        italic
                                        text-gray-400
                                    "
                                >
                                    marketplace.
                                </span>

                                <br />

                                A better way to
                                <br />

                                <span className="text-[#F5B51B]">
                                    move assets.
                                </span>
                            </h2>


                            {/* Description */}

                            <p
                                className={`
                                    mt-7
                                    max-w-lg
                                    text-sm
                                    leading-7
                                    text-gray-500
                                    transition-all
                                    delay-200
                                    duration-1000
                                    ease-out
                                    sm:text-base
                                    ${visible
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-6 opacity-0"
                                    }
                                `}
                            >
                                SoldWerx connects people with the assets
                                that matter — from equipment and machinery
                                to vehicles, business assets, estates and
                                everything in between.
                            </p>


                            {/* Link */}

                            <Link
                                to="/auctions"
                                className={`
                                    group
                                    mt-8
                                    inline-flex
                                    items-center
                                    gap-3
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.08em]
                                    text-[#111315]
                                    transition-all
                                    delay-300
                                    duration-1000
                                    ease-out
                                    ${visible
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-5 opacity-0"
                                    }
                                `}
                            >

                                <span className="border-b border-[#F5B51B] pb-1">
                                    Explore the marketplace
                                </span>

                                <span
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#F5B51B]
                                        text-black
                                        transition-all
                                        duration-300
                                        group-hover:translate-x-1
                                    "
                                >
                                    <ArrowRight size={14} />
                                </span>

                            </Link>

                        </div>

                    </div>


                    {/* =================================================
                        BENEFITS
                    ================================================== */}

                    <div
                        className={`
                            mt-14
                            border-y
                            border-gray-200
                            transition-all
                            delay-300
                            duration-1000
                            ease-out
                            ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-8 opacity-0"
                            }
                        `}
                    >

                        <div className="grid sm:grid-cols-3">

                            {benefits.map((item, index) => {

                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.number}
                                        className={`
                                            group
                                            relative
                                            border-b
                                            border-gray-200
                                            px-5
                                            py-7
                                            transition-all
                                            duration-700
                                            last:border-b-0
                                            sm:border-b-0
                                            sm:border-r
                                            sm:px-7
                                            sm:py-8
                                            sm:last:border-r-0
                                            lg:px-9
                                            ${visible
                                                ? "translate-y-0 opacity-100"
                                                : "translate-y-8 opacity-0"
                                            }
                                        `}
                                        style={{
                                            transitionDelay: visible
                                                ? `${450 + index * 120}ms`
                                                : "0ms",
                                        }}
                                    >

                                        <div className="flex items-center justify-between">

                                            <span
                                                className="
                                                    text-[11px]
                                                    font-bold
                                                    tracking-[0.16em]
                                                    text-gray-300
                                                    transition-colors
                                                    duration-300
                                                    group-hover:text-[#F5B51B]
                                                "
                                            >
                                                {item.number}
                                            </span>


                                            <div
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-[#F5B51B]/[0.08]
                                                    transition-all
                                                    duration-300
                                                    group-hover:bg-[#F5B51B]
                                                "
                                            >
                                                <Icon
                                                    size={17}
                                                    className="
                                                        text-[#F5B51B]
                                                        transition-colors
                                                        duration-300
                                                        group-hover:text-black
                                                    "
                                                />
                                            </div>

                                        </div>


                                        <h4
                                            className="
                                                mt-7
                                                text-base
                                                font-bold
                                                tracking-tight
                                                text-[#111315]
                                                sm:text-lg
                                            "
                                        >
                                            {item.title}
                                        </h4>


                                        <p
                                            className="
                                                mt-2
                                                max-w-sm
                                                text-sm
                                                leading-6
                                                text-gray-500
                                            "
                                        >
                                            {item.text}
                                        </p>


                                        <div
                                            className="
                                                absolute
                                                bottom-0
                                                left-0
                                                h-[2px]
                                                w-0
                                                bg-[#F5B51B]
                                                transition-all
                                                duration-500
                                                group-hover:w-full
                                            "
                                        />

                                    </div>
                                );

                            })}

                        </div>

                    </div>


                    {/* =================================================
                        BOTTOM STATEMENT
                    ================================================== */}

                    <div
                        className={`
                            mt-8
                            flex
                            flex-col
                            gap-3
                            transition-all
                            delay-[850ms]
                            duration-1000
                            ease-out
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-6 opacity-0"
                            }
                        `}
                    >

                        <p
                            className="
                                text-sm
                                text-gray-400
                            "
                        >
                            Built for equipment, vehicles, machinery,
                            business assets and more.
                        </p>


                        <div className="flex items-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-[#F5B51B]" />

                            <span
                                className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-gray-400
                                "
                            >
                                Buy · Sell · Liquidate
                            </span>

                        </div>

                    </div>

                </div>

            </Container>

        </section>
    );
}

export default About;