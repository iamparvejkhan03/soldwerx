import { useEffect } from "react";

import {
    ClipboardList,
    Phone,
    Search,
    Megaphone,
    Gavel,
    Truck,
    Timer,
    ShoppingCart,
    Tag,
    Banknote,
    Check,
    Headphones,
    ArrowRight,
    ArrowUpRight,
} from "lucide-react";

import { Container, LiquidateForm } from "../components";
import { Link } from "react-router-dom";
import { about, heroImg } from "../assets";

// ============================================================
// LIQUIDATE PAGE DATA
// ============================================================

const processSteps = [
    {
        number: "1",
        icon: ClipboardList,
        title: "SUBMIT REQUEST",
        desc: "Fill out our simple form with details about your assets and timeline.",
    },
    {
        number: "2",
        icon: Phone,
        title: "WE CONTACT YOU",
        desc: "We reach out within 24 hours to learn more and schedule a call or visit.",
    },
    {
        number: "3",
        icon: Search,
        title: "EVALUATION",
        desc: "We evaluate your assets and recommend the best selling strategy.",
    },
    {
        number: "4",
        icon: Megaphone,
        title: "MARKETING PLAN",
        desc: "We create a customized marketing plan to reach thousands of qualified buyers.",
    },
    {
        number: "5",
        icon: Gavel,
        title: "WE SELL & MANAGE",
        desc: "We handle the auction or sale, payments, coordination and communications.",
    },
    {
        number: "6",
        icon: Truck,
        title: "PICKUP & CLEANOUT",
        desc: "We coordinate pickup and removal. Property can be left broom clean if needed.",
    },
];

const recommendations = [
    {
        icon: Timer,
        title: "TIMED ONLINE AUCTIONS",
        desc: "Drive competitive bidding and top value.",
    },
    {
        icon: ShoppingCart,
        title: "BUY NOW / MAKE OFFER",
        desc: "Quick sales for high-demand items.",
    },
    {
        icon: Tag,
        title: "CONSIGNMENT",
        desc: "We sell your items one by one.",
    },
    {
        icon: Banknote,
        title: "DIRECT PURCHASE / BUYOUT",
        desc: "Fast cash for entire inventory.",
    },
    {
        icon: Truck,
        title: "REMOVAL & CLEANOUT",
        desc: "We coordinate everything so you don't lift a finger.",
    },
];

// ============================================================
// LIQUIDATE PAGE
// ============================================================

function Liquidate() {
    useEffect(() => {
        const sections = document.querySelectorAll("[data-reveal-section]");

        if (!sections.length) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reducedMotion) {
            sections.forEach((section) => section.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                    } else {
                        entry.target.classList.remove("is-visible");
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: "0px 0px -8% 0px",
            }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <main className="overflow-hidden bg-white text-gray-900">
            {/* =====================================================
                HERO - REDESIGNED TO MATCH ABOUT PAGE
            ====================================================== */}

            <section className="relative min-h-[520px] overflow-hidden bg-[#080A0D]">
                {/* Hero image
                    Replace this path with your actual liquidate hero image.
                */
                }
                <div
                    className="absolute inset-0 bg-cover bg-[position:60%_20%] opacity-90"
                    style={{ backgroundImage: `url(${about})` }}
                />

                {/* Dark overlay keeps the typography readable */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#080A0D]/90 to-[#080A0D]/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/60 via-transparent to-[#050608]/20" />

                {/* Gold atmosphere */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#F5B51B]/10 blur-[120px]" />
                <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#F5B51B]/10 blur-[110px]" />

                <Container>
                    <div className="relative z-10 flex min-h-[520px] items-center pb-14 md:pb-16 pt-28 md:pt-32 lg:pt-36">
                        <div className="grid w-full gap-10 lg:grid-cols-[1fr_330px] lg:items-center">
                            {/* Hero content */}
                            <div className="max-w-2xl">
                                <div className="mb-5 flex items-center gap-3 animate-[fadeUp_.7s_ease-out_both]">
                                    <span className="h-px w-10 bg-[#F5B51B]" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5B51B]">
                                        Sell With SoldWerX
                                    </span>
                                </div>

                                <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[64px] animate-[fadeUp_.75s_.08s_ease-out_both]">
                                    LIQUIDATE A
                                    <span className="block text-[#F5B51B]">
                                        BUSINESS OR ESTATE
                                    </span>
                                </h1>

                                <p className="mt-6 max-w-xl text-base leading-7 text-white/75 md:text-lg animate-[fadeUp_.75s_.16s_ease-out_both]">
                                    We handle the entire process from start to finish so
                                    you don't have to.
                                </p>

                                <div className="mt-5 space-y-2.5 animate-[fadeUp_.75s_.24s_ease-out_both]">
                                    {[
                                        "Comprehensive asset evaluation",
                                        "Strategic marketing & maximum exposure",
                                        "Auctions, Buy Now, or Make Offer options",
                                        "Coordinated pickup and removal",
                                        "Property cleanup available",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 text-sm text-white/85 md:text-base"
                                        >
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5B51B]">
                                                <Check
                                                    size={13}
                                                    strokeWidth={3}
                                                    className="text-[#111]"
                                                />
                                            </span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Consultation card */}
                            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#111318]/95 p-7 shadow-2xl backdrop-blur-sm animate-[fadeUp_.8s_.18s_ease-out_both]">
                                <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#F5B51B]/10 blur-[70px]" />

                                <div className="relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5B51B]/10 text-[#F5B51B]">
                                            <Headphones size={24} strokeWidth={1.8} />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-black text-white">
                                                NO OBLIGATION CONSULTATION
                                            </h2>
                                            <p className="mt-2 text-sm leading-6 text-white/60">
                                                There is never any obligation and our
                                                consultation is 100% free.
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href="#consultation"
                                        className="group mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5B51B] px-5 py-3.5 text-sm font-black text-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC83D] hover:shadow-[0_12px_30px_rgba(245,181,27,0.22)]"
                                    >
                                        GET STARTED
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* =====================================================
                HOW IT WORKS - TWO ROWS WITH CLEAR VISUAL CHANGE
            ====================================================== */}

            <section data-reveal-section className="py-14 md:py-14">
                <Container>
                    {/* Header - NOW MATCHES ABOUT PAGE STYLE */}
                    <div data-reveal-item className="max-w-full mb-12">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                            Simple Process
                        </p>

                        <h2 className="text-4xl font-black leading-tight tracking-[-0.04em] text-gray-950 md:text-5xl lg:text-[48px]">
                            How Consultation
                            <span className="ml-2 font-medium italic text-gray-400">
                                Works.
                            </span>
                        </h2>

                        <p className="mt-5 text-sm md:text-base leading-7 text-gray-500 max-w-full">
                            Our streamlined process makes liquidation effortless.
                            Here's how we guide you from start to finish.
                        </p>
                    </div>

                    {/* TWO ROWS - THIS IS THE BIG VISUAL CHANGE */}
                    <div className="space-y-4">
                        {/* Row 1: Steps 1-3 */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {processSteps.slice(0, 3).map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={step.number}
                                        className="reveal-card group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                                        style={{
                                            animation: `fadeUp 0.6s ease-out ${index * 0.1}s both`,
                                        }}
                                    >
                                        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#F5B51B]/[0.04] transition-all duration-700 group-hover:scale-150 group-hover:bg-[#F5B51B]/[0.08]" />

                                        <div className="relative z-10">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5B51B]/10 text-[#F5B51B] transition-all duration-300 group-hover:bg-[#F5B51B] group-hover:text-black group-hover:shadow-[0_8px_24px_rgba(245,181,27,0.25)]">
                                                    <Icon size={28} strokeWidth={1.7} />
                                                </div>
                                                <span className="text-5xl font-black text-gray-100 transition-colors duration-300 group-hover:text-[#F5B51B]/30">
                                                    {step.number}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold tracking-tight text-gray-950 transition-colors duration-300 group-hover:text-[#F5B51B]">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                                {step.desc}
                                            </p>

                                            <div className="mt-5 h-0.5 w-0 rounded-full bg-[#F5B51B] transition-all duration-500 group-hover:w-12" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CONNECTOR ARROW BETWEEN ROWS */}
                        <div className="flex justify-center py-2">
                            <div className="flex items-center gap-2">
                                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#F5B51B]/30" />
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5B51B]/10 text-[#F5B51B] transition-all duration-300 hover:scale-110 hover:bg-[#F5B51B]/20">
                                    {/* <ArrowRight size={14}  /> */}
                                    <a
                                        href="#consultation"
                                    >
                                        <ArrowRight
                                            size={14} strokeWidth={2}
                                        />
                                    </a>
                                </div>
                                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#F5B51B]/30" />
                            </div>
                        </div>

                        {/* Row 2: Steps 4-6 */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {processSteps.slice(3, 6).map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={step.number}
                                        className="reveal-card group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                                        style={{
                                            animation: `fadeUp 0.6s ease-out ${(index + 3) * 0.1}s both`,
                                        }}
                                    >
                                        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#F5B51B]/[0.04] transition-all duration-700 group-hover:scale-150 group-hover:bg-[#F5B51B]/[0.08]" />

                                        <div className="relative z-10">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5B51B]/10 text-[#F5B51B] transition-all duration-300 group-hover:bg-[#F5B51B] group-hover:text-black group-hover:shadow-[0_8px_24px_rgba(245,181,27,0.25)]">
                                                    <Icon size={28} strokeWidth={1.7} />
                                                </div>
                                                <span className="text-5xl font-black text-gray-100 transition-colors duration-300 group-hover:text-[#F5B51B]/30">
                                                    {step.number}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold tracking-tight text-gray-950 transition-colors duration-300 group-hover:text-[#F5B51B]">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                                {step.desc}
                                            </p>

                                            <div className="mt-5 h-0.5 w-0 rounded-full bg-[#F5B51B] transition-all duration-500 group-hover:w-12" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* PROGRESS DOTS - NEW VISUAL ELEMENT */}
                    <div className="mt-10 flex justify-center gap-2">
                        <div className="flex items-center justify-center">
                            <a
                                href="#consultation"
                                className="group flex items-center justify-center gap-2 rounded-xl bg-[#F5B51B] px-7 py-3.5 text-sm font-black text-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC83D] hover:shadow-[0_12px_30px_rgba(245,181,27,0.22)]"
                            >
                                GET STARTED
                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div data-reveal-item className="mt-12 overflow-hidden rounded-[24px] border border-gray-200 bg-[#FBFAF7]">
                        <div className="border-b border-gray-200 bg-white px-6 py-4">
                            <h3 className="text-sm font-bold tracking-tight text-gray-950">
                                What We May Recommend
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-5">
                            {recommendations.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className={`reveal-card group relative px-5 py-7 text-center transition-all duration-500 hover:bg-white ${index !== 0
                                            ? "border-t border-gray-200 md:border-l md:border-t-0"
                                            : ""
                                            }`}
                                    >
                                        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                            <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#F5B51B]/[0.05] blur-[60px]" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5B51B]/10 text-[#F5B51B] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#F5B51B] group-hover:text-black group-hover:shadow-[0_8px_24px_rgba(245,181,27,0.25)]">
                                                <Icon size={24} strokeWidth={1.7} />
                                            </div>

                                            <h4 className="mt-4 text-xs font-bold text-gray-950 transition-colors duration-300 group-hover:text-[#F5B51B]">
                                                {item.title}
                                            </h4>

                                            <p className="mt-1.5 text-xs leading-5 text-gray-500">
                                                {item.desc}
                                            </p>

                                            <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-[#F5B51B] transition-all duration-500 group-hover:w-14" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Container>
            </section>

            {/* =====================================================
                CONSULTATION CTA
            ====================================================== */}

            <div data-reveal-section id='consultation'>
                <div data-reveal-item className="w-full">
                    <LiquidateForm />
                </div>
            </div>

            {/* <section
                id="consultation"
                className="py-14 md:py-20 bg-[#080A0D]"
            >
                <Container>
                    <div className="relative overflow-hidden rounded-[28px] bg-[#0D0F13] p-8 md:p-12 lg:p-16">
                        <div className="pointer-events-none absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[#F5B51B]/10 blur-[100px]" />

                        <div className="relative z-10">
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-2xl">
                                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                        No Obligation
                                    </p>

                                    <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] text-white md:text-4xl">
                                        Ready to Get Started?
                                        <span className="block font-medium italic text-white/55">
                                            Tell us about your assets.
                                        </span>
                                    </h2>

                                    <p className="mt-4 text-sm leading-6 text-white/65">
                                        We'll create the best plan for you. There's
                                        never any obligation and our consultation is
                                        100% free.
                                    </p>
                                </div>

                                <LiquidateForm />
                            </div>
                        </div>
                    </div>
                </Container>
            </section> */}

            <style>{`
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Scroll reveal: sections animate in, then reset when they leave
                   the viewport so they can animate again when revisited. */
                [data-reveal-section] [data-reveal-item],
                [data-reveal-section] .reveal-card {
                    opacity: 0;
                    transform: translateY(28px);
                    transition:
                        opacity 700ms cubic-bezier(.22, 1, .36, 1),
                        transform 700ms cubic-bezier(.22, 1, .36, 1);
                }

                [data-reveal-section].is-visible [data-reveal-item],
                [data-reveal-section].is-visible .reveal-card {
                    opacity: 1;
                    transform: translateY(0);
                }

                [data-reveal-section].is-visible .reveal-card:nth-child(1) {
                    transition-delay: 80ms;
                }

                [data-reveal-section].is-visible .reveal-card:nth-child(2) {
                    transition-delay: 160ms;
                }

                [data-reveal-section].is-visible .reveal-card:nth-child(3) {
                    transition-delay: 240ms;
                }

                [data-reveal-section].is-visible .reveal-card:nth-child(4) {
                    transition-delay: 320ms;
                }

                [data-reveal-section].is-visible .reveal-card:nth-child(5) {
                    transition-delay: 400ms;
                }

                [data-reveal-section].is-visible .reveal-card:nth-child(6) {
                    transition-delay: 480ms;
                }

                @media (max-width: 767px) {
                    [data-reveal-section] [data-reveal-item],
                    [data-reveal-section] .reveal-card {
                        transform: translateY(20px);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    [data-reveal-section] [data-reveal-item],
                    [data-reveal-section] .reveal-card,
                    [style*="animation:"] {
                        opacity: 1 !important;
                        transform: none !important;
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </main>
    );
}

export default Liquidate;