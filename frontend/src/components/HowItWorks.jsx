import {
    ArrowRight,
    Gavel,
    Search,
    UserPlus,
    WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function HowItWorks() {
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

    const steps = [
        {
            number: "01",
            icon: UserPlus,
            title: "Join the Community",
            desc: "Create your account in minutes and unlock access to auctions, exclusive collectibles, private offers, and more.",
            action: "Get started",
        },
        {
            number: "02",
            icon: Search,
            title: "Discover Your Next Piece",
            desc: "Explore sports cards, signed jerseys, game-used equipment, and rare memorabilia from collectors and sellers.",
            action: "Explore collectibles",
        },
        {
            number: "03",
            icon: Gavel,
            title: "Bid, Buy & Collect",
            desc: "Place your bid, buy instantly, or make an offer. Win your item and add something special to your collection.",
            action: "Start bidding",
        },
    ];

    return (
        <section
            ref={ref}
            className="relative overflow-hidden bg-white/10"
        >
            {/* =====================================================
                BACKGROUND DETAILS
            ====================================================== */}

            {/* <div className="pointer-events-none absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-[#C59D55]/[0.035] blur-[100px]" />

            <div className="pointer-events-none absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-gray-100/30 blur-[100px]" /> */}

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div className="relative z-10 mx-auto max-w-full">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div
                    className={`mx-auto max-w-2xl text-center transition-all duration-1000 ${visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                        }`}
                >
                    <div className="mb-5 flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-[#C59D55]" />

                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                            Simple by Design
                        </span>

                        <span className="h-px w-8 bg-[#C59D55]" />
                    </div>

                    <h2 className="text-4xl font-black tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
                        Your Next
                        <span className="mx-2 font-medium italic text-gray-400">
                            Great Find
                        </span>
                        Awaits.
                    </h2>

                    <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                        From discovering a rare collectible to making it yours,
                        we've made the entire experience simple, secure, and
                        exciting.
                    </p>
                </div>

                {/* =================================================
                    STEPS
                ================================================== */}

                <div className="relative mt-10 lg:mt-10">

                    {/* Connecting line */}
                    <div className="absolute left-[16.66%] right-[16.66%] top-[58px] hidden h-px bg-gray-200 lg:block" />

                    {/* Gold animated progress line */}
                    <div
                        className={`absolute left-[16.66%] top-[58px] hidden h-px bg-[#C59D55] transition-all duration-[1800ms] ease-out lg:block ${visible ? "w-[66.66%]" : "w-0"
                            }`}
                    />

                    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                        {steps.map((step, i) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className={`group relative transition-all duration-700 ${visible
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-12 opacity-0"
                                        }`}
                                    style={{
                                        transitionDelay: `${i * 180}ms`,
                                    }}
                                >
                                    {/* Desktop connector point */}
                                    <div className="absolute -top-3 left-1/2 z-20 hidden h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-[#C59D55]/30 bg-white lg:flex">
                                        <div className="h-2 w-2 rounded-full bg-[#C59D55] shadow-[0_0_10px_rgba(197,157,85,0.35)]" />
                                    </div>

                                    {/* CARD */}
                                    <div className="relative h-full overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_8px_35px_rgba(0,0,0,0.045)] transition-all duration-500 hover:-translate-y-2 hover:border-[#C59D55]/25 hover:shadow-[0_25px_60px_rgba(0,0,0,0.09)] sm:p-8">

                                        {/* Large background number */}
                                        <div className="pointer-events-none absolute -right-1 -top-8 select-none text-[130px] font-black leading-none text-gray-50 transition-colors duration-500 group-hover:text-[#C59D55]/[0.06]">
                                            {step.number}
                                        </div>

                                        {/* Top section */}
                                        <div className="relative flex items-start justify-between">

                                            {/* Icon */}
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-2xl bg-[#C59D55]/10 blur-xl transition-all duration-500 group-hover:bg-[#C59D55]/20" />

                                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C59D55]/20 bg-[#C59D55]/[0.07] transition-all duration-500 group-hover:border-[#C59D55]/40 group-hover:bg-[#C59D55]">
                                                    <Icon
                                                        size={27}
                                                        className="text-[#A17B35] transition-colors duration-500 group-hover:text-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Step number */}
                                            <span className="text-xs font-bold tracking-[0.2em] text-gray-300">
                                                STEP {step.number}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="relative mt-9">
                                            <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                                {step.title}
                                            </h3>

                                            <p className="mt-4 text-sm leading-7 text-gray-500">
                                                {step.desc}
                                            </p>
                                        </div>

                                        {/* Bottom action */}
                                        <div className="relative mt-8 flex items-center gap-2 text-xs font-bold text-[#A17B35]">
                                            <span>{step.action}</span>

                                            <ArrowRight
                                                size={14}
                                                className="transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </div>

                                        {/* Bottom accent */}
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C59D55] transition-all duration-500 group-hover:w-full" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* =================================================
                    BOTTOM STATEMENT
                ================================================== */}

                <div
                    className={`mx-auto mt-14 max-w-4xl transition-all delay-500 duration-1000 ${visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                        }`}
                >
                    <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-gray-100 bg-gray-100/60 px-6 py-5 sm:flex-row sm:px-8">

                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C59D55]/10">
                                <WalletCards
                                    size={17}
                                    className="text-[#A17B35]"
                                />
                            </div>

                            <p className="text-xs text-gray-500 sm:text-sm">
                                A simple way to discover something worth
                                keeping.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400">
                            <span>Secure</span>

                            <span className="h-1 w-1 rounded-full bg-[#C59D55]" />

                            <span>Transparent</span>

                            <span className="h-1 w-1 rounded-full bg-[#C59D55]" />

                            <span>Collector-first</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;