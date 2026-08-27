import { useNavigate } from "react-router";
import {
    ArrowRight,
    Gavel,
    ShieldCheck,
    Sparkles,
    Trophy,
} from "lucide-react";
import Container from "./Container";

function CTA() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-[#080A0D] py-16">

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            {/* Main gold glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C59D55]/[0.08] blur-[130px]" />

            {/* Secondary glows */}
            <div className="pointer-events-none absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-[#C59D55]/[0.04] blur-[100px]" />

            <div className="pointer-events-none absolute -right-40 top-0 h-[350px] w-[350px] rounded-full bg-[#C59D55]/[0.04] blur-[100px]" />

            {/* Subtle grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
                    `,
                    backgroundSize: "70px 70px",
                }}
            />

            {/* Radial lines */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C59D55]/[0.07]" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C59D55]/[0.06]" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C59D55]/[0.05]" />

            <Container>
                <div className="relative z-10 mx-auto max-w-4xl text-center">

                    {/* =================================================
                        BADGE
                    ================================================== */}

                    <div className="mb-7 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#C59D55]/20 bg-[#C59D55]/[0.07] px-4 py-2 backdrop-blur-md">
                            <Sparkles
                                size={14}
                                className="text-[#D8B96F]"
                            />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B96F]">
                                Your Collection Awaits
                            </span>
                        </div>
                    </div>

                    {/* =================================================
                        HEADING
                    ================================================== */}

                    <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-[56px]">
                        Your Next Great
                        <span className="block bg-gradient-to-r from-[#F1D38D] via-[#C59D55] to-[#92702F] bg-clip-text text-transparent">
                            Find Is Waiting.
                        </span>
                    </h2>

                    {/* =================================================
                        DESCRIPTION
                    ================================================== */}

                    <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                        Discover rare sports cards, signed jerseys, game-used
                        memorabilia, and remarkable collectibles. Find
                        something worth bidding on — and make it yours.
                    </p>

                    {/* =================================================
                        CTA BUTTON
                    ================================================= */}

                    <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">

                        <button
                            onClick={() => navigate("/register")}
                            className="group relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#C59D55] px-8 text-sm font-bold text-[#0B0C0E] shadow-[0_10px_40px_rgba(197,157,85,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D8B96F] hover:shadow-[0_15px_50px_rgba(197,157,85,0.28)]"
                        >
                            <span className="relative z-10">
                                Start Collecting
                            </span>

                            <ArrowRight
                                size={18}
                                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </button>

                        <button
                            onClick={() => navigate("/auctions")}
                            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-7 text-sm font-semibold text-white/75 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                        >
                            Explore Auctions
                        </button>
                    </div>

                    {/* =================================================
                        TRUST LINE
                    ================================================== */}

                    <div className="mx-auto mt-12 flex max-w-xl flex-col items-center justify-center gap-4 border-t border-white/[0.07] pt-7 sm:flex-row sm:gap-8">

                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <ShieldCheck
                                size={16}
                                className="text-[#C59D55]"
                            />

                            <span>Secure transactions</span>
                        </div>

                        <div className="hidden h-4 w-px bg-white/10 sm:block" />

                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Gavel
                                size={16}
                                className="text-[#C59D55]"
                            />

                            <span>Live bidding</span>
                        </div>

                        <div className="hidden h-4 w-px bg-white/10 sm:block" />

                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Trophy
                                size={16}
                                className="text-[#C59D55]"
                            />

                            <span>Curated collectibles</span>
                        </div>
                    </div>

                    {/* =================================================
                        STATS
                    ================================================== */}

                    <div className="mt-12 grid grid-cols-3 border-t border-white/[0.06] pt-8">

                        <div className="border-r border-white/[0.06]">
                            <div className="text-xl font-bold text-white sm:text-2xl">
                                12K+
                            </div>

                            <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/25">
                                Collectibles
                            </div>
                        </div>

                        <div className="border-r border-white/[0.06]">
                            <div className="text-xl font-bold text-white sm:text-2xl">
                                600+
                            </div>

                            <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/25">
                                Collectors
                            </div>
                        </div>

                        <div>
                            <div className="text-xl font-bold text-white sm:text-2xl">
                                24/7
                            </div>

                            <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/25">
                                Live Auctions
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Bottom fade */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
        </section>
    );
}

export default CTA;