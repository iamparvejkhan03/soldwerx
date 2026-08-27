import {
    ArrowUpRight,
    ChartColumnIncreasing,
    Gavel,
    ShieldCheck,
    Sparkles,
    Trophy,
} from "lucide-react";
import { whoWeAre, about, heroImg } from "../assets";
import { useEffect, useRef, useState } from "react";

function About() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.2 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: Gavel,
            number: "01",
            title: "Built for Collectors",
            description:
                "A marketplace designed around the way serious collectors discover, evaluate, and acquire remarkable pieces.",
        },
        {
            icon: ShieldCheck,
            number: "02",
            title: "Trust at Every Bid",
            description:
                "A secure and transparent experience that gives buyers and sellers confidence throughout every transaction.",
        },
        {
            icon: ChartColumnIncreasing,
            number: "03",
            title: "A Better Way to Bid",
            description:
                "Powerful technology, seamless bidding, and a carefully curated marketplace built to make every deal effortless.",
        },
    ];

    return (
        <section
            ref={ref}
            className="relative overflow-hidden py-14"
        >
            {/* BACKGROUND DETAILS */}
            <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" />

            <div className="pointer-events-none absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-gray-100/70 blur-[100px]" />

            <div className="mx-auto max-w-full">
                <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">

                    {/* =====================================================
                        LEFT — VISUAL STORY
                    ====================================================== */}

                    <div
                        className={`relative transition-all duration-1000 ease-out ${visible
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-10 opacity-0"
                            }`}
                    >
                        {/* Main image */}
                        <div className="relative overflow-hidden rounded-[32px]">
                            <img
                                src={heroImg}
                                alt="Collectors marketplace"
                                className="h-[540px] w-full object-cover transition-transform duration-1000 hover:scale-[1.025]"
                            />

                            {/* Image overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />

                            {/* Top label */}
                            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                                <Sparkles
                                    size={13}
                                    className="text-[#D8B96F]"
                                />
                                Built for Collectors
                            </div>

                            {/* Bottom quote */}
                            <div className="absolute lg:hidden bottom-7 left-7 right-7">
                                <p className="max-w-sm text-xl font-medium leading-relaxed text-white">
                                    "The best collections begin with one
                                    remarkable find."
                                </p>
                            </div>
                        </div>

                        {/* =================================================
                            FLOATING STAT
                        ================================================== */}

                        <div className="absolute -right-5 top-10 rounded-2xl border border-white bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:-right-8 sm:p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C59D55]/10">
                                    <Trophy
                                        size={21}
                                        className="text-[#A17B35]"
                                    />
                                </div>

                                <div>
                                    <div className="text-xl font-black text-gray-900">
                                        600+
                                    </div>

                                    <div className="text-[10px] uppercase tracking-wider text-gray-400">
                                        Active Bidders
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            SECOND IMAGE CARD
                        ================================================== */}

                        <div
                            className={`absolute hidden lg:block -bottom-12 -right-3 w-52 transition-all delay-300 duration-1000 sm:-right-10 sm:w-64 ${visible
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                                }`}
                        >
                            <div className="overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                                <img
                                    src={about}
                                    alt="Collectible marketplace"
                                    className="h-40 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-40"
                                />
                            </div>

                            {/* Mini label */}
                            <div className="absolute -left-4 -top-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#C59D55] shadow-lg">
                                <ArrowUpRight
                                    size={19}
                                    className="text-[#111]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        RIGHT — CONTENT
                    ====================================================== */}

                    <div
                        className={`transition-all delay-150 duration-1000 ease-out ${visible
                                ? "translate-x-0 opacity-100"
                                : "translate-x-10 opacity-0"
                            }`}
                    >
                        {/* Eyebrow */}
                        <div className="mb-5 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#C59D55]" />

                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                                Who We Are
                            </span>
                        </div>

                        {/* Heading */}
                        <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
                            A Vault of 
                            <span className="ml-2 font-medium italic text-gray-400">
                                Legends.
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="mt-7 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
                            We created a sanctuary where rare collectibles meet passionate collectors. From iconic sports cards and signed jerseys to game-used memorabilia and pop culture rarities — every piece inside La-Bóveda has a story, a legacy, and a rightful owner waiting to claim it.
                        </p>

                        {/* Feature list */}
                        <div className="mt-8 divide-y divide-gray-100 border-y border-gray-100">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.number}
                                        className="group flex gap-5 py-6"
                                    >
                                        {/* Number */}
                                        <div className="pt-1 text-xs font-bold tracking-wider text-gray-300">
                                            {feature.number}
                                        </div>

                                        {/* Icon */}
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C59D55]/15 bg-[#C59D55]/[0.06] transition-all duration-300 group-hover:bg-[#C59D55]">
                                            <Icon
                                                size={20}
                                                className="text-[#A17B35] transition-colors duration-300 group-hover:text-[#111]"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="max-w-lg">
                                            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                                {feature.title}
                                            </h3>

                                            <p className="mt-1.5 text-sm leading-6 text-gray-500">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom statement */}
                        <div className="mt-8 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200" />
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-300" />
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-[#C59D55]" />
                            </div>

                            <p className="text-xs text-gray-400">
                                Trusted by collectors who know what matters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;