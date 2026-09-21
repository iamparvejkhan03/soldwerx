import {
    Gavel,
    Handshake,
    ShieldCheck,
    Wallet,
    Globe,
    BarChart3,
    Smile,
    ScrollText,
    Fingerprint,
    CircleDollarSign,
    ArrowRight,
    Check,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Container } from "../components";

// ============================================================
// FONTS — move this block into your global stylesheet / index.html
// once you're happy with it; kept inline here so the page renders
// correctly on its own.
// ============================================================

// const FontImports = () => (
//     <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

//         .font-display { font-family: 'Fraunces', serif; }
//         .font-body { font-family: 'Inter', sans-serif; }
//         .font-ledger { font-family: 'IBM Plex Mono', monospace; }

//         @media (prefers-reduced-motion: reduce) {
//             .seal-spin { animation: none !important; }
//         }
//     `}</style>
// );

// ============================================================
// DATA
// ============================================================

const ledger = [
    { value: "500+", label: "sellers served" },
    { value: "450", label: "auctions closed" },
    { value: "600+", label: "active bidders" },
    { value: "1,200", label: "verified accounts" },
];

const catalog = [
    {
        lot: "01",
        icon: ScrollText,
        title: "Verified listings",
        desc: "Every listing is reviewed before it goes live — real photos, accurate details, and a seller we've already checked.",
    },
    {
        lot: "02",
        icon: Gavel,
        title: "Real-time bidding",
        desc: "Bids update the instant they land, so you're never working off a stale number — on site or on your phone.",
    },
    {
        lot: "03",
        icon: Wallet,
        title: "Secure payments",
        desc: "Funds move through bank-verified transfers, held until both sides confirm the asset is as described.",
    },
    {
        lot: "04",
        icon: Globe,
        title: "Nationwide reach",
        desc: "One marketplace connecting buyers and sellers across the country, instead of a scattered patchwork of listings.",
    },
    {
        lot: "05",
        icon: BarChart3,
        title: "Market insights",
        desc: "Closed-sale pricing history helps you set a fair ask or know when a bid is genuinely worth chasing.",
    },
    {
        lot: "06",
        icon: Smile,
        title: "Dedicated support",
        desc: "A real team answers when a listing looks off or a pickup runs late — before it becomes a dispute.",
    },
];

const standard = [
    {
        icon: Handshake,
        title: "Deep selection",
        desc: "Equipment, trucks, trailers, business assets, and estates — sourced from working businesses and real owners, not resellers.",
    },
    {
        icon: Gavel,
        title: "Trade on your terms",
        desc: "Run a standard or reserve auction, take offers while it's live, or list it as Buy Now. The format follows the asset.",
    },
    {
        icon: CircleDollarSign,
        title: "One flat fee",
        desc: "5% on the final sale, period. No listing fees, no featured-placement upsells, no charges you find out about later.",
    },
    {
        icon: Fingerprint,
        title: "A team that answers",
        desc: "From your first question about a listing to the moment it leaves your lot — someone's actually reachable.",
    },
];

// ============================================================
// AUTHENTICATION SEAL — the page's signature visual device
// ============================================================

function AuthSeal({ size = 240, className = "" }) {
    return (
        <svg
            viewBox="0 0 220 220"
            className={className}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            <defs>
                <path id="sealRing" d="M 110,110 m -90,0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0" />
            </defs>

            <circle cx="110" cy="110" r="104" fill="none" stroke="#F5B51B" strokeWidth="1" opacity="0.35" />
            <circle cx="110" cy="110" r="62" fill="none" stroke="#F5B51B" strokeWidth="1" opacity="0.45" />

            <g className="seal-spin" style={{ transformOrigin: "110px 110px", animation: "spin 60s linear infinite" }}>
                <circle cx="110" cy="110" r="90" fill="none" stroke="#F5B51B" strokeWidth="1.5" />
                <text fontSize="10.5" letterSpacing="3.5" fill="#F5B51B" className="font-ledger">
                    <textPath href="#sealRing" startOffset="2%">
                        CONSIGN · AUCTION · LIQUIDATE ·
                    </textPath>
                </text>
            </g>

            <text x="110" y="104" textAnchor="middle" fill="#F5B51B" fontSize="34" className="font-display" fontWeight="600">
                SW
            </text>
            <text x="110" y="128" textAnchor="middle" fill="#F5B51B" fontSize="7.5" letterSpacing="2.5" className="font-ledger">
                EST. MARKETPLACE
            </text>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </svg>
    );
}

// Torn ticket-stub perforation, used between the buyer / seller panels
function Perforation() {
    return (
        <div className="relative hidden w-px shrink-0 self-stretch lg:block">
            <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-[#D4D4D4]" />
            <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-white" />
            <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-white" />
        </div>
    );
}

function LotTag({ number, children }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#F5B51B]/35 bg-[#F5B51B]/[0.06] px-3.5 py-1.5 text-[12px] font-body text-[#8A6A00]">
            {/* <span className="font-ledger text-[11px] text-[#F5B51B]">No. {number}</span> */}
            {/* <span className="h-1 w-1 rounded-full bg-[#F5B51B]" /> */}
            {children}
        </span>
    );
}

// ============================================================
// ABOUT PAGE
// ============================================================

function About() {
    return (
        <main className="overflow-hidden bg-white font-body text-[#08090A]">
            {/* <FontImports /> */}

            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="relative border-b border-[#E7E5DF] bg-[#F8F7F4]">
                <Container>
                    <div className="grid gap-12 pb-16 pt-24 md:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-20 lg:pt-32">

                        <div>
                            <LotTag number="01">What SoldWerX Is</LotTag>

                            <h1 className="font-display mt-7 text-5xl font-semibold leading-[1.04] tracking-tight text-[#08090A] sm:text-6xl lg:text-[64px]">
                                Verified.
                                Sold.
                            </h1>

                            <p className="font-display mt-3 max-w-lg text-xl leading-snug text-[#8A6A00]">
                                Every asset on SoldWerX comes from a seller we've checked.
                            </p>

                            <p className="mt-7 max-w-xl text-base leading-7 text-[#4B4B4B]">
                                SoldWerX connects buyers and sellers across the United States — a marketplace where every listing is reviewed, every bid is real, and every sale runs on one flat 5% fee. No surprises, just a straight path from listed to sold.
                            </p>

                            <div className="mt-9 flex flex-wrap gap-3">
                                <Link
                                    to="/auctions"
                                    className="inline-flex items-center gap-2 rounded-md bg-[#08090A] px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B51B]"
                                >
                                    Browse auctions
                                    <ArrowRight size={15} />
                                </Link>

                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 rounded-md border border-[#08090A]/20 px-6 py-3.5 text-sm font-semibold text-[#08090A] transition-colors duration-200 hover:border-[#08090A]/40 hover:bg-[#08090A]/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B51B]"
                                >
                                    List an asset
                                </Link>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <AuthSeal size={260} />
                        </div>
                    </div>

                    {/* LEDGER */}
                    <div className="border-t border-[#E7E5DF] py-8">
                        <p className="font-ledger mb-4 text-[11px] tracking-wide text-[#F5B51B]">By the numbers</p>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                            {ledger.map((row, i) => (
                                <div
                                    key={row.label}
                                    className={i !== 0 ? "border-l border-[#E7E5DF] pl-6" : ""}
                                >
                                    <div className="font-ledger text-3xl font-medium text-[#08090A] sm:text-4xl">
                                        {row.value}
                                    </div>
                                    <div className="mt-1.5 text-sm text-[#8A6A00]">{row.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* =====================================================
                BUYERS & SELLERS
            ====================================================== */}

            <section className="py-14">
                <Container>
                    <div className="mb-10 max-w-7xl">
                        <LotTag number="03">For buyers and sellers</LotTag>

                        <h2 className="font-display mt-5 text-4xl font-semibold tracking-tight text-[#08090A] md:text-5xl">
                            Built for both ends of the transaction
                        </h2>

                        <p className="mt-4 text-base leading-7 text-[#8A6A00]">
                            Whether you're sourcing equipment for the job or clearing out what you no longer use, the same marketplace works both directions.
                        </p>
                    </div>

                    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E7E5DF] lg:flex-row lg:items-stretch">

                        {/* BUYERS */}
                        <div className="flex-1 bg-[#08090A] p-8 md:p-12">
                            <p className="font-ledger text-[11px] tracking-wide text-[#F5B51B]">For buyers</p>

                            <h3 className="font-display mt-3 text-3xl font-semibold text-white">
                                Get the right asset.
                            </h3>

                            <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
                                Search verified listings, bid in real time, and skip the wait entirely with Buy Now when you already know it's the one.
                            </p>

                            <div className="mt-8 space-y-3">
                                {["Browse verified listings", "Bid in real time", "Skip the wait with Buy Now", "Check pricing history before you commit"].map((item) => (
                                    <div key={item} className="flex items-start gap-3 text-sm text-white/75">
                                        <Check size={15} className="mt-0.5 shrink-0 text-[#F5B51B]" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/auctions"
                                className="mt-9 inline-flex items-center gap-2 border-b border-[#F5B51B] pb-0.5 text-sm font-semibold text-[#F5B51B] transition-colors hover:text-[#FFC83D]"
                            >
                                Browse auctions
                            </Link>
                        </div>

                        <Perforation />

                        {/* SELLERS */}
                        <div className="flex-1 bg-[#F8F7F4] p-8 md:p-12">
                            <p className="font-ledger text-[11px] tracking-wide text-[#F5B51B]">For sellers</p>

                            <h3 className="font-display mt-3 text-3xl font-semibold text-[#08090A]">
                                Sell to buyers who are ready to bid.
                            </h3>

                            <p className="mt-4 max-w-sm text-sm leading-7 text-[#8A6A00]">
                                List to an audience that's already looking, and pick the format that fits the asset instead of forcing it into one.
                            </p>

                            <div className="mt-8 space-y-3">
                                {["Reach buyers who are ready to bid", "Run a standard or reserve auction, take offers, or list Buy Now", "One flat 5% fee, nothing hidden", "Track every sale from your account"].map((item) => (
                                    <div key={item} className="flex items-start gap-3 text-sm text-[#4B4B4B]">
                                        <Check size={15} className="mt-0.5 shrink-0 text-[#F5B51B]" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/register"
                                className="mt-9 inline-flex items-center gap-2 border-b border-[#F5B51B] pb-0.5 text-sm font-semibold text-[#B38C00] transition-colors hover:text-[#8A6A00]"
                            >
                                Start selling
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* =====================================================
                THE CATALOG (formerly "why choose us")
            ====================================================== */}

            <section className="border-y border-[#E7E5DF] bg-[#F8F7F4] pt-14 pb-5">
                <Container>
                    <div className="mb-12 max-w-7xl">
                        <LotTag number="04">The checklist</LotTag>

                        <h2 className="font-display mt-5 text-4xl font-semibold tracking-tight text-[#08090A] md:text-5xl">
                            Six things every listing runs through
                        </h2>
                    </div>

                    <div className="divide-y divide-[#E7E5DF] border-t border-[#E7E5DF]">
                        {catalog.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.lot} className="grid gap-4 py-7 sm:grid-cols-[80px_40px_1fr] sm:items-start md:py-8">
                                    <span className="font-ledger text-sm text-[#F5B51B]">{item.lot}</span>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#F5B51B]/30 text-[#F5B51B]">
                                        <Icon size={17} strokeWidth={1.7} />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-[#08090A]">{item.title}</h3>
                                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#8A6A00]">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* =====================================================
                THE STANDARD (formerly "highlights")
            ====================================================== */}

            <section className="py-14">
                <Container>
                    <div className="mb-12 max-w-7xl">
                        <LotTag number="05">What we stand on</LotTag>

                        <h2 className="font-display mt-5 text-4xl font-semibold tracking-tight text-[#08090A] md:text-5xl">
                            What holds the whole thing together
                        </h2>
                    </div>

                    <div className="grid gap-px overflow-hidden rounded-2xl border border-[#E7E5DF] bg-[#E7E5DF] sm:grid-cols-2 lg:grid-cols-4">
                        {standard.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="bg-white p-7">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5B51B]/10 text-[#F5B51B]">
                                        <Icon size={19} strokeWidth={1.7} />
                                    </div>

                                    <h3 className="mt-6 text-base font-semibold text-[#08090A]">{item.title}</h3>
                                    <p className="mt-2.5 text-sm leading-6 text-[#8A6A00]">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* =================================================
                        CLOSING
                    ================================================== */}

                    <div className="mt-8 overflow-hidden rounded-2xl bg-[#08090A]">
                        <div className="relative flex flex-col gap-8 px-7 py-14 md:flex-row md:items-center md:justify-between md:px-12 md:py-16 lg:px-16">

                            <div className="max-w-xl">
                                <p className="font-ledger text-[11px] tracking-wide text-[#F5B51B]">Ready when you are</p>

                                <h3 className="font-display mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                                    Bring what you have. Find what you're missing.
                                </h3>

                                <p className="mt-4 text-sm leading-7 text-white/60">
                                    SoldWerX is where the transaction starts on the right foot — verified, straightforward, and built to be trusted.
                                </p>
                            </div>

                            <Link
                                to="/auctions"
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#F5B51B] px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#FFC83D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Start bidding
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}

export default About;