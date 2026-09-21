import {
    Gavel,
    Heart,
    MapPin,
    Eye,
    Shield,
    Clock,
    ShoppingCart,
    HandHelping,
    HandGrab,
    ArrowUpRight,
} from "lucide-react";

import { heroImg } from "../assets";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import { useWatchlist } from "../hooks/useWatchlist";

const TILT_THRESHOLD = 2.5;

// ============================================================
// HELPERS
// ============================================================

const pad = (n, len = 2) => String(n ?? 0).padStart(len, "0");

function AuctionCard({ auction }) {
    const navigate = useNavigate();

    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const prefersReducedMotion = useMemo(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        []
    );

    const handleMove = (e) => {
        if (prefersReducedMotion) return;

        const { left, top, width, height } =
            e.currentTarget.getBoundingClientRect();

        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        setTilt({
            x: y * -TILT_THRESHOLD,
            y: x * TILT_THRESHOLD,
        });
    };

    const resetTilt = () => setTilt({ x: 0, y: 0 });

    const auctionTime = useAuctionCountdown(auction);

    const { isWatchlisted, toggleWatchlist } = useWatchlist(auction._id);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWatchlist();
    };

    // ============================================================
    // AUCTION STATE
    // ============================================================

    const isReserveMet = auction?.currentPrice >= auction?.reservePrice;

    const isAuctionActive =
        auction?.status === "active" && !auctionTime?.completed;

    const isEndingSoon = useMemo(() => {
        if (!auctionTime || auctionTime.completed) return false;

        const totalSeconds =
            (auctionTime.days || 0) * 86400 +
            (auctionTime.hours || 0) * 3600 +
            (auctionTime.minutes || 0) * 60 +
            (auctionTime.seconds || 0);

        return totalSeconds > 0 && totalSeconds <= 3600;
    }, [auctionTime]);

    // ============================================================
    // STATUS BADGES
    // ============================================================

    const statusBadges = useMemo(() => {
        const badges = [];

        if (auction?.auctionType === "reserve" && isReserveMet) {
            badges.push({
                label: "Reserve Met",
                icon: Shield,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        } else if (auction?.auctionType === "reserve") {
            badges.push({
                label: "Reserve",
                icon: Shield,
                color: "bg-orange-100 text-orange-500 border-orange-300",
            });
        }

        if (auction?.auctionType === "standard") {
            badges.push({
                label: "No Reserve",
                icon: Shield,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        }

        if (auction?.auctionType === "buy_now") {
            badges.push({
                label: "Buy Now",
                icon: ShoppingCart,
                color: "bg-blue-50 text-blue-700 border-blue-200",
            });
        }

        if (auction?.auctionType === "giveaway") {
            badges.push({
                label: "Giveaway",
                icon: HandHelping,
                color: "bg-purple-50 text-purple-700 border-purple-200",
            });
        }

        if (auction?.status === "active") {
            badges.push({
                label: "Live",
                pulse: true,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        }

        if (auction?.status === "approved") {
            badges.push({
                label: "Starting Soon",
                icon: Clock,
                color: "bg-amber-50 text-amber-700 border-amber-200",
            });
        }

        if (auction?.status === "ended") {
            badges.push({
                label: "Ended",
                icon: Clock,
                color: "bg-red-50 text-red-700 border-red-200",
            });
        }

        if (auction?.status === "sold") {
            badges.push({
                label: "Sold",
                icon: Clock,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        }

        return badges;
    }, [auction, isReserveMet]);

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (!auctionTime) {
        return (
            <div className="h-full overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.05)]">
                <div className="aspect-[4/3] animate-pulse rounded-[18px] bg-gray-100" />

                <div className="space-y-3 p-2 pt-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                    </div>

                    <div className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
            </div>
        );
    }

    const displayPrice = auction.currentPrice || auction.startPrice;

    const isSold = auction.status === "sold";
    const isActiveWithBids = auction.status === "active" && auction.bidCount > 0;

    const priceLabel = isSold
        ? "Final Bid"
        : isActiveWithBids
            ? "Current Bid"
            : "Starting Bid";

    const ctaLabel = !isAuctionActive
        ? "View Auction"
        : auction.auctionType === "buy_now"
            ? "Buy Now"
            : auction.auctionType === "giveaway"
                ? "Claim Now"
                : "Place Bid";

    const CtaIcon =
        auction.auctionType === "buy_now"
            ? ShoppingCart
            : auction.auctionType === "giveaway"
                ? HandGrab
                : Gavel;

    // ============================================================
    // CARD
    // ============================================================

    return (
        <div
            className="group h-full cursor-pointer"
            onMouseMove={handleMove}
            onMouseLeave={resetTilt}
            style={{
                transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 200ms ease-out",
                willChange:
                    tilt.x || tilt.y ? "transform" : "auto",
            }}
            onClick={() => navigate(`/auction/${auction._id}`)}
        >
            <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#C59D55]/30 group-hover:shadow-[0_28px_65px_-20px_rgba(197,157,85,0.35)] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">

                {/* =================================================
                    IMAGE
                ================================================== */}

                <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-gray-100">

                    <img
                        src={auction.photos?.[0]?.url || heroImg}
                        alt={auction.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />

                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10 transition-opacity duration-500 group-hover:opacity-90" />

                    {/* Warm gold wash */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C59D55]/0 via-transparent to-[#C59D55]/15 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />

                    {/* =================================================
                        TOP LEFT BADGES
                    ================================================== */}

                    <div className="absolute left-3 top-3 flex max-w-[75%] flex-wrap gap-1.5">
                        {statusBadges.map((badge) => {
                            const IconComponent = badge.icon;

                            return (
                                <span
                                    key={badge.label}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${badge.color}`}
                                >
                                    {badge.pulse ? (
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                                        </span>
                                    ) : (
                                        IconComponent && <IconComponent size={11} />
                                    )}

                                    {badge.label}
                                </span>
                            );
                        })}
                    </div>

                    {/* =================================================
                        VIEW COUNT
                    ================================================== */}

                    <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
                        <Eye size={12} />
                        {auction.views?.toLocaleString() || 0}
                    </div>

                    {/* =================================================
                        COUNTDOWN
                    ================================================== */}

                    {auction.auctionType !== "buy_now" &&
                        auction.auctionType !== "giveaway" && (
                            <div className="absolute bottom-3 left-6">
                                {!auctionTime.completed ? (
                                    <div
                                        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md tabular-nums ${
                                            isEndingSoon
                                                ? "border-red-400/40 bg-red-500/80"
                                                : "border-white/15 bg-black/55"
                                        }`}
                                    >
                                        <Clock
                                            size={12}
                                            className={
                                                isEndingSoon
                                                    ? "text-white"
                                                    : "text-[#F5B51B]"
                                            }
                                        />

                                        <span>{pad(auctionTime.days)}d</span>
                                        <span className="text-white/30">:</span>
                                        <span>{pad(auctionTime.hours)}h</span>
                                        <span className="text-white/30">:</span>
                                        <span>{pad(auctionTime.minutes)}m</span>
                                        <span className="text-white/30">:</span>
                                        <span>{pad(auctionTime.seconds)}s</span>
                                    </div>
                                ) : (
                                    <div className="rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white">
                                        Auction Ended
                                    </div>
                                )}
                            </div>
                        )}
                </div>

                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="flex flex-1 flex-col px-1 pt-5">

                    {/* Title */}
                    <Link
                        to={`/auction/${auction._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="line-clamp-2 text-[17px] font-bold leading-6 tracking-tight text-gray-900 transition-colors hover:text-[#A17B35] focus:outline-none focus-visible:underline"
                    >
                        {auction.title}
                    </Link>

                    {/* Location */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{auction.location}</span>
                    </div>

                    {/* =================================================
                        PRICE / BIDS
                    ================================================== */}

                    <div className="mt-4 grid grid-cols-2 gap-2.5">

                        {/* Price */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                {priceLabel}
                            </div>

                            <div className="mt-1 flex items-baseline gap-0.5 text-xl font-black tracking-tight text-gray-900 tabular-nums">
                                <span className="text-sm font-semibold text-gray-400">
                                    $
                                </span>
                                {displayPrice?.toLocaleString()}
                            </div>
                        </div>

                        {/* Bid / Buy Now */}
                        {auction.auctionType !== "buy_now" ? (
                            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                    Bids
                                </div>

                                <div className="mt-1 flex items-center gap-1.5 text-xl font-black tracking-tight text-gray-900 tabular-nums">
                                    <Gavel size={16} className="text-gray-400" />
                                    {auction.bidCount || 0}
                                </div>
                            </div>
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                    Buy Now
                                </div>

                                <div className="mt-1 flex items-baseline gap-0.5 text-xl font-black tracking-tight text-[#A17B35] tabular-nums">
                                    <span className="text-sm font-semibold text-gray-400">
                                        $
                                    </span>
                                    {auction?.buyNowPrice?.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        META
                    ================================================== */}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                        <span>
                            Bid increment:{" "}
                            <span className="font-semibold text-gray-500 tabular-nums">
                                ${auction.bidIncrement?.toLocaleString()}
                            </span>
                        </span>

                        <span className="flex items-center gap-1">
                            <Heart
                                size={11}
                                className={
                                    isWatchlisted
                                        ? "fill-red-500 text-red-500"
                                        : ""
                                }
                            />
                            {auction.watchlistCount || 0} watching
                        </span>
                    </div>

                    {/* =================================================
                        ACTION
                    ================================================== */}

                    <div className="mt-auto flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/auction/${auction._id}`);
                            }}
                            className="group/button flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F5B51B] px-4 text-sm font-bold text-black shadow-[0_10px_25px_-12px_rgba(197,157,85,0.7)] transition-all duration-300 hover:bg-[#e4a000] hover:shadow-[0_14px_32px_-12px_rgba(197,157,85,0.85)] active:scale-[0.98] motion-reduce:transition-none"
                        >
                            <CtaIcon size={17} />
                            <span>{ctaLabel}</span>
                            <ArrowUpRight
                                size={15}
                                className="transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 motion-reduce:transition-none"
                            />
                        </button>

                        <button
                            type="button"
                            onClick={handleWatchlist}
                            aria-label={
                                isWatchlisted
                                    ? "Remove from watchlist"
                                    : "Add to watchlist"
                            }
                            aria-pressed={isWatchlisted}
                            title={
                                isWatchlisted
                                    ? "Remove from watchlist"
                                    : "Add to watchlist"
                            }
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 ${
                                isWatchlisted
                                    ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                                    : "border-gray-200 bg-white text-gray-500 hover:border-[#C59D55]/40 hover:bg-[#C59D55]/5 hover:text-[#A17B35]"
                            }`}
                        >
                            <Heart
                                size={17}
                                fill={isWatchlisted ? "currentColor" : "none"}
                            />
                        </button>
                    </div>
                </div>

                {/* =================================================
                    BOTTOM GOLD ACCENT
                ================================================== */}

                <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#F5B51B] to-[#e8a200] transition-all duration-500 group-hover:w-full motion-reduce:transition-none" />
            </div>
        </div>
    );
}

export default AuctionCard;