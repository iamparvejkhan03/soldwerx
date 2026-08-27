import { Link, NavLink } from "react-router-dom";
import { Container } from "../components";
import { logo, otherData } from "../assets";
import {
    ArrowUpRight,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    ShieldCheck,
    Sparkles,
    Twitter,
    Youtube,
} from "lucide-react";

function Footer() {
    const quickLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "FAQs", href: "/faqs" },
    ];

    const auctionLinks = [
        {
            name: "Live Auctions",
            href: "/auctions?status=active",
        },
        {
            name: "Upcoming Auctions",
            href: "/auctions?status=approved",
        },
        {
            name: "Sold Collectibles",
            href: "/auctions?status=sold",
        },
        {
            name: "Explore All",
            href: "/auctions",
        },
    ];

    const legalPolicies = [
        {
            name: "Privacy Policy",
            href: "/privacy-policy",
        },
        {
            name: "Terms of Use",
            href: "/terms-of-use",
        },
        {
            name: "Buyer Agreement",
            href: "/buyer-agreement",
        },
        {
            name: "Seller Agreement",
            href: "/seller-agreement",
        },
    ];

    const socialLinks = [
        {
            icon: Instagram,
            href: "#",
            label: "Instagram",
        },
        {
            icon: Facebook,
            href: "#",
            label: "Facebook",
        },
        {
            icon: Linkedin,
            href: "#",
            label: "LinkedIn",
        },
        {
            icon: Youtube,
            href: "#",
            label: "YouTube",
        },
    ];

    return (
        <footer className="relative overflow-hidden bg-[#080A0D] text-white">

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            {/* Gold glow */}
            <div className="pointer-events-none absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[120px]" />

            <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#C59D55]/[0.035] blur-[130px]" />

            {/* Subtle grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.018]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
                    `,
                    backgroundSize: "70px 70px",
                }}
            />

            <Container className="relative z-10">

                {/* =================================================
                    BRAND STATEMENT
                ================================================== */}

                {/* <div className="border-b border-white/[0.08] py-16 lg:py-20">

                    <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-2xl">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C59D55]/20 bg-[#C59D55]/[0.06] px-4 py-2">
                                <Sparkles
                                    size={13}
                                    className="text-[#C59D55]"
                                />

                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B96F]">
                                    Built for Collectors
                                </span>
                            </div>

                            <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                                Find something
                                <span className="ml-2 font-medium italic text-white/60">
                                    worth keeping.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-white/40">
                                Discover rare sports cards, signed jerseys,
                                game-used memorabilia, and remarkable
                                collectibles from passionate sellers and
                                collectors.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C59D55]/10">
                                <ShieldCheck
                                    size={20}
                                    className="text-[#C59D55]"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Collect with confidence
                                </p>

                                <p className="mt-0.5 text-xs text-white/30">
                                    Secure & transparent marketplace
                                </p>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* =================================================
                    MAIN FOOTER
                ================================================== */}

                <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.25fr] lg:gap-10">

                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <div className="max-w-xs">

                        <Link
                            to="/"
                            className="inline-flex items-center"
                        >
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-10 w-auto object-contain sm:h-11"
                            />
                        </Link>

                        <p className="mt-5 text-base leading-6 text-white/60 font-light">
                            A collector-first marketplace for discovering,
                            buying, and bidding on exceptional sports and
                            non-sports memorabilia.
                        </p>

                        {/* Socials */}
                        <div className="mt-6 flex items-center gap-2.5">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;

                                return (
                                    <Link
                                        key={social.label}
                                        to={social.href}
                                        target="_blank"
                                        aria-label={social.label}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/40 transition-all duration-300 hover:-translate-y-1 hover:border-[#C59D55]/30 hover:bg-[#C59D55]/10 hover:text-[#C59D55]"
                                    >
                                        <Icon size={15} strokeWidth={2} />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* =================================================
                        QUICK LINKS
                    ================================================== */}

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                            Explore
                        </h3>

                        <ul className="mt-5 space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <NavLink
                                        to={link.href}
                                        className={({ isActive }) =>
                                            `group font-light flex items-center gap-1.5 text-base transition-colors ${isActive
                                                ? "text-[#C59D55]"
                                                : "text-white/60 hover:text-white"
                                            }`
                                        }
                                    >
                                        {link.name}

                                        <ArrowUpRight
                                            size={12}
                                            className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                        />
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* =================================================
                        AUCTIONS
                    ================================================== */}

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                            Auctions
                        </h3>

                        <ul className="mt-5 space-y-3">
                            {auctionLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="group flex items-center gap-1.5 text-base text-white/60 transition-colors hover:text-white font-light"
                                    >
                                        {link.name}

                                        <ArrowUpRight
                                            size={12}
                                            className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* =================================================
                        LEGAL
                    ================================================== */}

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                            Legal
                        </h3>

                        <ul className="mt-5 space-y-3">
                            {legalPolicies.map((policy) => (
                                <li key={policy.name}>
                                    <Link
                                        to={policy.href}
                                        className="text-base text-white/60 font-light transition-colors hover:text-[#C59D55]"
                                    >
                                        {policy.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* =================================================
                        CONTACT
                    ================================================== */}

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                            Reach Out
                        </h3>

                        <div className="mt-5 space-y-4">

                            {/* Phone */}
                            <Link
                                to={`tel:${otherData.phone}`}
                                className="group flex items-start gap-3"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/40 transition-colors group-hover:bg-[#C59D55]/10 group-hover:text-[#C59D55]">
                                    <Phone size={15} />
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-white/55">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-base text-white/60 transition-colors group-hover:text-white font-light">
                                        {otherData.phone}
                                    </p>
                                </div>
                            </Link>

                            {/* Email */}
                            <Link
                                to={`mailto:${otherData.email}`}
                                className="group flex items-start gap-3"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/40 transition-colors group-hover:bg-[#C59D55]/10 group-hover:text-[#C59D55]">
                                    <Mail size={15} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-white/55">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-base text-white/60 transition-colors group-hover:text-white font-light">
                                        {otherData.email}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    BOTTOM
                ================================================== */}

                <div className="border-t border-white/[0.08] py-6">

                    <div className="flex flex-col gap-4 text-xs text-white/45 md:flex-row md:items-center md:justify-between">

                        {/* Copyright */}
                        <p>
                            © {new Date().getFullYear()}{" "}
                            <Link
                                to="/"
                                className="font-medium text-white/55 transition-colors hover:text-[#C59D55]"
                            >
                                La-Bóveda
                            </Link>
                            . All rights reserved.
                        </p>

                        {/* Bottom links */}
                        <div className="flex flex-wrap items-center gap-5">
                            <Link
                                to="/terms-of-use"
                                className="transition-colors hover:text-white"
                            >
                                Terms of Use
                            </Link>

                            <span className="h-1 w-1 rounded-full bg-white/15" />

                            <Link
                                to="/privacy-policy"
                                className="transition-colors hover:text-white"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;