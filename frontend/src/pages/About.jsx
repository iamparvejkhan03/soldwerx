import {
    Gavel,
    Handshake,
    BadgeDollarSign,
    HandHelping,
    ShieldCheck,
    Wallet,
    Globe,
    BarChart3,
    Smile,
    PackageCheck,
    UserCheck,
    ArrowRight,
    ArrowUpRight,
    Check,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
    CaseIH,
    Claas,
    Cummins,
    Fendt,
    Freightliner,
    Hitachi,
    JCB,
    JohnDeere,
    Komatsu,
    Kubota,
    Liebherr,
    MasseyFerguson,
    Mercedes,
    NewHolland,
    NokianTyres,
    Peterbilt,
    Scag,
    Skania,
    Stiga,
    Timberjack,
    Toro,
    Toyota,
    Volvo,
} from "../assets";

import { Container } from "../components";

// ============================================================
// EXISTING DATA — UNCHANGED
// ============================================================

const highlights = [
    {
        icon: Handshake,
        title: "Unbeatable Selection",
        desc: "Thousands of collectibles from legendary athletes, teams, and pop culture icons. Find exactly what you're looking for.",
    },
    {
        icon: Gavel,
        title: "Trade Your Way",
        desc: "Choose how you buy and sell — timed auctions, instant direct purchases, or make an offer. The flexibility is yours.",
    },
    {
        icon: BadgeDollarSign,
        title: "Zero Hidden Fees",
        desc: "Just 5% commission on final sale value. No listing fees, no surprise charges. What you see is what you pay.",
    },
    {
        icon: HandHelping,
        title: "Expert Support",
        desc: "From your first question to final delivery — our team is here to guide you through every transaction with clarity and care.",
    },
];

const stats = [
    {
        icon: Smile,
        value: "500+",
        label: "Customer",
        sub: "Total Customer",
    },
    {
        icon: PackageCheck,
        value: "450",
        label: "Auctions",
        sub: "Total Product",
    },
    {
        icon: UserCheck,
        value: "600+",
        label: "Bidder",
        sub: "Number Of Total Bidder",
    },
    {
        icon: UserCheck,
        value: "1.2k",
        label: "Accounts",
        sub: "User Helped",
    },
];

const features = [
    {
        number: "01",
        icon: ShieldCheck,
        title: "Verified Listings",
        desc: "Every collectible is verified to ensure authenticity and transparency for buyers and sellers across Venezuela.",
    },
    {
        number: "02",
        icon: Gavel,
        title: "Real-Time Bidding",
        desc: "Experience live auctions with instant updates — just as if you were in the room.",
    },
    {
        number: "03",
        icon: Wallet,
        title: "Secure Payments",
        desc: "Bank-level protection and trusted USD bank transfers safeguard every transaction.",
    },
    {
        number: "04",
        icon: Globe,
        title: "Global Marketplace",
        desc: "Connect with collectors and sellers from Caracas to Maracaibo — seamless trading made simple.",
    },
    {
        number: "05",
        icon: BarChart3,
        title: "Market Insights",
        desc: "Smart pricing data helps buyers and sellers make informed decisions based on real market trends.",
    },
    {
        number: "06",
        icon: Smile,
        title: "Customer Satisfaction",
        desc: "Our team ensures a smooth experience from listing to collecting — because your satisfaction matters.",
    },
];

// ============================================================
// BRANDS
// ============================================================

const brands = [
    { name: "Case IH", image: CaseIH },
    { name: "Claas", image: Claas },
    { name: "Cummins", image: Cummins },
    { name: "Fendt", image: Fendt },
    { name: "Freightliner", image: Freightliner },
    { name: "Hitachi", image: Hitachi },
    { name: "JCB", image: JCB },
    { name: "John Deere", image: JohnDeere },
    { name: "Komatsu", image: Komatsu },
    { name: "Kubota", image: Kubota },
    { name: "Liebherr", image: Liebherr },
    { name: "Mercedes", image: Mercedes },
    { name: "New Holland", image: NewHolland },
    { name: "Scag", image: Scag },
    { name: "Scania", image: Skania },
    { name: "Nokian Tyres", image: NokianTyres },
    { name: "Massey Ferguson", image: MasseyFerguson },
    { name: "Peterbilt", image: Peterbilt },
    { name: "Toyota", image: Toyota },
    { name: "Stiga", image: Stiga },
    { name: "Timberjack", image: Timberjack },
    { name: "Toro", image: Toro },
    { name: "Volvo", image: Volvo },
];

// ============================================================
// ABOUT PAGE
// ============================================================

function About() {
    return (
        <main className="overflow-hidden bg-white text-gray-900">

            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="relative overflow-hidden border-b border-gray-100">

                {/* Soft gold atmosphere */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#C59D55]/[0.06] blur-[120px]" />

                <div className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-[#C59D55]/[0.045] blur-[110px]" />

                <Container>
                    <div className="relative pt-24 md:pt-28 lg:pt-36">

                        {/* Eyebrow */}
                        <div className="mb-7 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#C59D55]" />

                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A17B35]">
                                About La-Bóveda
                            </span>
                        </div>

                        {/* Main heading */}
                        <div className="max-w-5xl">
                            <h1 className="text-4xl font-black leading-[1.02] tracking-[-0.05em] text-gray-950 sm:text-5xl lg:text-[60px]">
                                Built on Trust.
                                <br />

                                <span className="font-medium italic text-gray-400">
                                    Designed for Collectors.
                                </span>
                            </h1>
                        </div>

                        {/* Description + actions */}
                        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

                            <p className="max-w-2xl text-base leading-8 text-gray-500 md:text-lg">
                                La-Bóveda brings together buyers and sellers from across Venezuela in a marketplace built on confidence. With transparency, verified authenticity, and secure transactions at our core, we help collectors trade smarter and acquire the pieces they truly value.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/auctions"
                                    className="group flex items-center gap-2 rounded-xl bg-[#C59D55] px-6 py-3.5 text-sm font-bold text-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D8B96F] hover:shadow-[0_12px_30px_rgba(197,157,85,0.18)]"
                                >
                                    Explore Auctions

                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                                >
                                    Contact Us

                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </div>

                        {/* =================================================
                            STATS
                        ================================================== */}

                        <div className="mt-8 md:mt-12 grid grid-cols-2 border-y border-gray-100 md:grid-cols-4">

                            {stats.map((stat, index) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={index}
                                        className={`relative py-8 md:px-7 ${index !== 0
                                            ? "border-l border-gray-100"
                                            : ""
                                            } ${index === 2
                                                ? "max-md:border-t"
                                                : ""
                                            } ${index === 3
                                                ? "max-md:border-t"
                                                : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C59D55]/10">
                                                <Icon
                                                    size={18}
                                                    className="text-[#A17B35]"
                                                    strokeWidth={1.7}
                                                />
                                            </div>

                                            <div>
                                                <div className="text-2xl font-black tracking-tight text-gray-950">
                                                    {stat.value}
                                                </div>

                                                <div className="mt-0.5 text-xs font-medium text-gray-400">
                                                    {stat.sub}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </Container>
            </section>

            {/* =====================================================
                BRANDS
            ====================================================== */}

            {/* <section className="py-20 md:py-24">

                <Container>

                    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">

                        <div>
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                                Trusted names
                            </p>

                            <h2 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
                                Brands We Work With
                            </h2>
                        </div>

                        <p className="max-w-xl text-sm leading-6 text-gray-500">
                            From excavators and tractors to cranes and
                            forklifts — we handle heavy equipment across
                            leading manufacturers.
                        </p>

                    </div>

                    <div className="grid grid-cols-2 border-l border-t border-gray-100 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

                        {brands.map((brand) => (
                            <Link
                                key={brand.name}
                                to="#"
                                className="group relative flex h-28 items-center justify-center border-b border-r border-gray-100 bg-white px-5 transition-all duration-300 hover:bg-[#FBFAF7]"
                            >
                                <img
                                    src={brand.image}
                                    alt={brand.name}
                                    className="max-h-10 w-auto max-w-[120px] object-contain opacity-50 grayscale transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                                />

                                <span className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-semibold uppercase tracking-wider text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    {brand.name}
                                </span>
                            </Link>
                        ))}

                    </div>

                </Container>
            </section> */}

            {/* =====================================================
    BUILT FOR BUYERS & SELLERS
===================================================== */}

            <section className="py-14">
                <Container>

                    {/* Header */}
                    <div className="max-w-full mb-8">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                            One Marketplace. Two Perspectives.
                        </p>

                        <h2 className="text-4xl md:text-5xl lg:text-[48px] font-black tracking-[-0.04em] text-gray-950 leading-tight">
                            Built for collectors and sellers
                            <span className="ml-2 font-medium italic text-gray-400">
                                across Venezuela.
                            </span>
                        </h2>

                        <p className="mt-5 text-sm md:text-base leading-7 text-gray-500 max-w-full">
                            Whether you're searching for iconic memorabilia or looking to sell from your collection, La-Bóveda gives both sides the tools, flexibility, and confidence to trade smarter.
                        </p>
                    </div>

                    {/* Buyer / Seller Cards */}
                    <div className="grid lg:grid-cols-2 gap-5">

                        {/* BUYERS */}
                        <div className="group relative overflow-hidden rounded-[28px] bg-[#080A0D] p-8 md:p-10">

                            {/* Background glow */}
                            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#C59D55]/10 blur-[80px]" />

                            <div className="relative z-10">

                                {/* Icon */}
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C59D55]/10 text-[#C59D55]">
                                    <Gavel size={22} strokeWidth={1.7} />
                                </div>

                                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59D55]">
                                    For Buyers
                                </p>

                                <h3 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-white">
                                    Find the right piece.
                                </h3>

                                <p className="mt-4 max-w-md text-sm leading-7 text-white/40">
                                    Discover authentic collectibles, compare opportunities, and participate in transparent auctions from wherever you are.
                                </p>

                                {/* Benefits */}
                                <div className="mt-8 space-y-3">

                                    {[
                                        "Browse verified listings",
                                        "Bid in real time",
                                        "Buy at a fixed price",
                                        "Make informed decisions",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 text-sm text-white/65"
                                        >
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C59D55]/10">
                                                <Check
                                                    size={12}
                                                    className="text-[#C59D55]"
                                                />
                                            </div>

                                            {item}
                                        </div>
                                    ))}

                                </div>

                                {/* Link */}
                                <Link
                                    to="/auctions"
                                    className="group/link mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#D8B96F]"
                                >
                                    Explore listings

                                    <ArrowRight
                                        size={15}
                                        className="transition-transform duration-300 group-hover/link:translate-x-1"
                                    />
                                </Link>

                            </div>
                        </div>


                        {/* SELLERS */}
                        <div className="group relative overflow-hidden rounded-[28px] border border-gray-100 bg-[#FBFAF7] p-8 md:p-10">

                            {/* Background glow */}
                            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#C59D55]/[0.07] blur-[80px]" />

                            <div className="relative z-10">

                                {/* Icon */}
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C59D55]/10 text-[#A17B35]">
                                    <Handshake size={22} strokeWidth={1.7} />
                                </div>

                                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                                    For Sellers
                                </p>

                                <h3 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-gray-950">
                                    Reach serious collectors.
                                </h3>

                                <p className="mt-4 max-w-md text-sm leading-7 text-gray-500">
                                    Put your memorabilia in front of an active marketplace and choose the selling method that works best for you.
                                </p>

                                {/* Benefits */}
                                <div className="mt-8 space-y-3">

                                    {[
                                        "Reach qualified buyers",
                                        "Create flexible listings",
                                        "Choose how you sell",
                                        "Manage your sales with confidence",
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 text-sm text-gray-600"
                                        >
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C59D55]/10">
                                                <Check
                                                    size={12}
                                                    className="text-[#A17B35]"
                                                />
                                            </div>

                                            {item}
                                        </div>
                                    ))}

                                </div>

                                {/* Link */}
                                <Link
                                    to="/contact"
                                    className="group/link mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#A17B35]"
                                >
                                    Start selling

                                    <ArrowRight
                                        size={15}
                                        className="transition-transform duration-300 group-hover/link:translate-x-1"
                                    />
                                </Link>

                            </div>
                        </div>

                    </div>

                    {/* Bottom statement */}
                    <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-y border-gray-100 py-6">

                        <p className="text-sm text-gray-500">
                            Different goals. One trusted marketplace.
                        </p>

                        <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                            <span>Transparent</span>
                            <span className="h-1 w-1 rounded-full bg-[#C59D55]" />
                            <span>Flexible</span>
                            <span className="h-1 w-1 rounded-full bg-[#C59D55]" />
                            <span>Secure</span>
                        </div>

                    </div>

                </Container>
            </section>

            {/* =====================================================
                WHY CHOOSE US
            ====================================================== */}

            <section className="border-y border-gray-100 bg-[#FBFAF7] py-14">

                <Container>

                    <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[0.8fr_1.7fr]">

                        {/* Heading */}
                        <div className="lg:sticky lg:top-24 lg:self-start">

                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                                Why Choose La-Bóveda
                            </p>

                            <h2 className="text-4xl font-black leading-tight tracking-[-0.035em] text-gray-950 md:text-5xl">
                                Built for trust,
                                <span className="block font-medium italic text-gray-400">
                                    Authenticity & Results.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-sm text-sm md:text-base leading-7 text-gray-500">
                                Every part of La-Bóveda is designed to make buying and selling collectibles clearer, faster, and more dependable.
                            </p>

                        </div>

                        {/* Features */}
                        <div className="grid gap-px overflow-hidden rounded-[24px] border border-gray-200 bg-gray-200 sm:grid-cols-2">

                            {features.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.number}
                                        className="group relative bg-white p-7 transition-all duration-300 hover:bg-[#FFFDF8] md:p-8"
                                    >

                                        {/* Number */}
                                        <div className="flex items-start justify-between">

                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C59D55]/10 text-[#A17B35] transition-all duration-300 group-hover:bg-[#C59D55] group-hover:text-[#111]">
                                                <Icon size={20} />
                                            </div>

                                            <span className="text-4xl font-black tracking-tight text-gray-100 transition-colors duration-300 group-hover:text-[#E9DEC8]">
                                                {item.number}
                                            </span>

                                        </div>

                                        <h3 className="mt-7 text-lg font-bold text-gray-950">
                                            {item.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-gray-500">
                                            {item.desc}
                                        </p>

                                        {/* Bottom accent */}
                                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C59D55] transition-all duration-500 group-hover:w-full" />

                                    </div>
                                );
                            })}

                        </div>
                    </div>

                </Container>
            </section>

            {/* =====================================================
                HIGHLIGHTS
            ====================================================== */}

            <section className="py-14">

                <Container>

                    <div className="flex flex-col gap-5">

                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C59D55]/20 bg-[#C59D55]/[0.06] px-3.5 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#C59D55]" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A17B35]">
                                    The La-Bóveda Advantage
                                </span>
                            </div>

                            <h2 className="text-4xl font-black tracking-[-0.04em] text-gray-950 md:text-5xl">
                                What makes us
                                <span className="ml-2 font-medium italic text-gray-400">
                                    different.
                                </span>
                            </h2>
                        </div>

                        <p className="max-w-full text-sm md:text-base leading-6 text-gray-500">
                            A marketplace should do more than connect people. It should make every transaction feel simpler and more confident — and every collectible feel like it belongs exactly where it's meant to be.
                        </p>

                    </div>

                    {/* Highlight cards */}
                    <div className="mt-8 grid border-y border-gray-100 md:grid-cols-4">

                        {highlights.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className={`group relative py-10 md:px-7 ${index !== 0
                                        ? "border-t border-gray-100 md:border-l md:border-t-0"
                                        : ""
                                        }`}
                                >

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-700 transition-all duration-300 group-hover:bg-[#C59D55]/10 group-hover:text-[#A17B35]">
                                        <Icon
                                            size={22}
                                            strokeWidth={1.6}
                                        />
                                    </div>

                                    <h3 className="mt-6 text-lg font-bold text-gray-950">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        {item.desc}
                                    </p>

                                    <div className="mt-7 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#A17B35] opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        <Check size={13} />
                                        La-Bóveda Advantage
                                    </div>

                                </div>
                            );
                        })}

                    </div>

                    {/* =================================================
                        FINAL STATEMENT
                    ================================================== */}

                    <div className="mt-14 overflow-hidden rounded-[28px] bg-[#080A0D]">

                        <div className="relative px-7 py-12 md:px-12 md:py-16 lg:px-16">

                            {/* Glow */}
                            <div className="pointer-events-none absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[#C59D55]/10 blur-[100px]" />

                            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                                <div className="max-w-2xl">

                                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59D55]">
                                        Built to move markets
                                    </p>

                                    <h3 className="text-3xl font-black leading-tight tracking-[-0.035em] text-white md:text-4xl">
                                        Better collectibles.
                                        <span className="block font-medium italic text-white/55">
                                            Better transactions.
                                        </span>
                                    </h3>

                                    <p className="mt-4 text-sm leading-6 text-white/65">
                                        Whether you're buying your next treasure or selling your collection, La-Bóveda is built to make the process straightforward.
                                    </p>

                                </div>

                                <Link
                                    to="/auctions"
                                    className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C59D55] px-6 py-3.5 text-sm font-bold text-[#111] transition-all duration-300 hover:bg-[#D8B96F]"
                                >
                                    Explore Marketplace

                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </Link>

                            </div>
                        </div>
                    </div>

                </Container>
            </section>

        </main>
    );
}

export default About;