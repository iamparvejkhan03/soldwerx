import {
    Gavel,
    Heart,
    MapPin,
    Eye,
    Users,
    Shield,
    Clock,
    ShoppingCart,
    HandHelping,
    HandGrab,
    ArrowUpRight,
} from "lucide-react";

import { heroImg } from "../assets";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuctionCountdown from "../hooks/useAuctionCountDown";
import { useWatchlist } from "../hooks/useWatchlist";

function AuctionCard({ auction }) {
    const navigate = useNavigate();

    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const threshold = 3;

    const handleMove = (e) => {
        const {
            left,
            top,
            width,
            height,
        } = e.currentTarget.getBoundingClientRect();

        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        setTilt({
            x: y * -threshold,
            y: x * threshold,
        });
    };

    const auctionTime = useAuctionCountdown(auction);

    const {
        isWatchlisted,
        toggleWatchlist,
    } = useWatchlist(auction._id);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        await toggleWatchlist();
    };

    // ============================================================
    // AUCTION STATE
    // ============================================================

    const isReserveMet =
        auction.currentPrice >= auction.reservePrice;

    const isAuctionActive =
        auction.status === "active" &&
        !auctionTime?.completed;

    // ============================================================
    // STATUS BADGES
    // ============================================================

    const getStatusBadges = () => {
        const badges = [];

        if (
            auction.auctionType === "reserve" &&
            isReserveMet
        ) {
            badges.push({
                label: "Reserve Met",
                icon: Shield,
                color:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        } else if (auction.auctionType === "reserve") {
            badges.push({
                label: "Reserve",
                icon: Shield,
                color:
                    "bg-orange-100 text-orange-500 border-orange-300",
            });
        }

        if (auction.auctionType === "standard") {
            badges.push({
                label: "No Reserve",
                icon: Shield,
                color:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        }

        if (auction.auctionType === "buy_now") {
            badges.push({
                label: "Buy Now",
                icon: ShoppingCart,
                color:
                    "bg-blue-50 text-blue-700 border-blue-200",
            });
        }

        if (auction.auctionType === "giveaway") {
            badges.push({
                label: "Giveaway",
                icon: HandHelping,
                color:
                    "bg-purple-50 text-purple-700 border-purple-200",
            });
        }

        if (auction.status === "active") {
            badges.push({
                label: "Live",
                icon: Clock,
                color:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        }

        if (auction.status === "approved") {
            badges.push({
                label: "Starting Soon",
                icon: Clock,
                color:
                    "bg-amber-50 text-amber-700 border-amber-200",
            });
        }

        if (auction.status === "ended") {
            badges.push({
                label: "Ended",
                icon: Clock,
                color:
                    "bg-red-50 text-red-700 border-red-200",
            });
        }

        if (auction.status === "sold") {
            badges.push({
                label: "Sold",
                icon: Clock,
                color:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
            });
        }

        return badges;
    };

    const statusBadges = getStatusBadges();

    // ============================================================
    // LOADING STATE
    // ============================================================

    if (!auctionTime) {
        return (
            <div className="h-full overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.05)]">
                <div className="h-64 animate-pulse rounded-[18px] bg-gray-100" />

                <div className="space-y-3 p-2 pt-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />

                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // CARD
    // ============================================================

    return (
        <div
            className="group h-full cursor-pointer"
            onMouseMove={handleMove}
            onMouseLeave={() =>
                setTilt({ x: 0, y: 0 })
            }
            style={{
                transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition:
                    "transform 180ms ease-out",
            }}
            onClick={() =>
                navigate(`/auction/${auction._id}`)
            }
        >
            <div className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 shadow-[0_8px_35px_rgba(0,0,0,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#C59D55]/25 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.11)]">

                {/* =================================================
                    IMAGE
                ================================================== */}

                <div className="relative h-64 overflow-hidden rounded-[18px] bg-gray-100">

                    <img
                        src={
                            auction.photos?.[0]?.url ||
                            heroImg
                        }
                        alt={auction.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                    />

                    {/* Image gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

                    {/* =================================================
                        TOP LEFT BADGES
                    ================================================== */}

                    <div className="absolute left-3 top-3 flex max-w-[75%] flex-wrap gap-1.5">
                        {statusBadges.map(
                            (badge, index) => {
                                const IconComponent =
                                    badge.icon;

                                return (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${badge.color}`}
                                    >
                                        <IconComponent
                                            size={11}
                                        />

                                        {badge.label}
                                    </span>
                                );
                            }
                        )}
                    </div>

                    {/* =================================================
                        VIEW COUNT
                    ================================================== */}

                    <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
                        <Eye size={12} />

                        {auction.views?.toLocaleString() ||
                            0}
                    </div>

                    {/* =================================================
                        WATCHLIST
                    ================================================== */}

                    

                    {/* =================================================
                        COUNTDOWN
                    ================================================== */}

                    {auction.auctionType !==
                        "buy_now" &&
                        auction.auctionType !==
                        "giveaway" && (
                            <div className="absolute bottom-3 left-3">
                                {!auctionTime.completed ? (
                                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-5 py-2 text-[11px] font-semibold text-white backdrop-blur-md">
                                        <Clock
                                            size={13}
                                            className="text-[#D8B96F]"
                                        />

                                        <span>
                                            {
                                                auctionTime.days
                                            }
                                            D
                                        </span>

                                        <span className="text-white/30">
                                            :
                                        </span>

                                        <span>
                                            {
                                                auctionTime.hours
                                            }
                                            H
                                        </span>

                                        <span className="text-white/30">
                                            :
                                        </span>

                                        <span>
                                            {
                                                auctionTime.minutes
                                            }
                                            M
                                        </span>

                                        <span className="text-white/30">
                                            :
                                        </span>

                                        <span>
                                            {
                                                auctionTime.seconds
                                            }
                                            S
                                        </span>
                                    </div>
                                ) : (
                                    <div className="rounded-full bg-red-500 px-3 py-2 text-[11px] font-semibold text-white">
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
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="line-clamp-2 text-[17px] font-bold leading-6 tracking-tight text-gray-900 transition-colors hover:text-[#A17B35]"
                    >
                        {auction.title}
                    </Link>

                    {/* Location */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin
                            size={13}
                            className="shrink-0"
                        />

                        <span className="truncate">
                            {auction.location}
                        </span>
                    </div>

                    {/* =================================================
                        PRICE / BIDS
                    ================================================== */}

                    <div className="mt-5 grid grid-cols-2 gap-2.5">

                        {/* Price */}
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                {auction.status ===
                                    "sold"
                                    ? "Final Bid"
                                    : (auction?.status === 'active' && auction?.bidCount > 0)
                                    ? 'Current Bid'
                                    : "Starting Bid"}
                            </div>

                            <div className="mt-1 text-lg font-black tracking-tight text-gray-900">
                                <span className="text-lg font-semibold text-gray-900">
                                    $
                                </span>
                                {(
                                    auction.currentPrice ||
                                    auction.startPrice
                                ).toLocaleString()}
                            </div>
                        </div>

                        {/* Bid / Buy Now */}
                        {auction.auctionType !==
                            "buy_now" ? (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                    Bids
                                </div>

                                <div className="mt-1 flex items-center gap-1.5 text-lg font-black tracking-tight text-gray-900">
                                    <Users
                                        size={16}
                                        className="text-[#A17B35]"
                                    />

                                    {auction.bidCount ||
                                        0}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
                                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                    Buy Now
                                </div>

                                <div className="mt-1 text-lg font-black tracking-tight text-[#A17B35]">
                                    <span className="text-xs font-semibold text-gray-400">
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
                            ${auction.bidIncrement?.toLocaleString()}
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

                            {auction.watchlistCount ||
                                0}{" "}
                            watching
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

                                navigate(
                                    `/auction/${auction._id}`
                                );
                            }}
                            className="group/button flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#C59D55] px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#D8B96F] hover:shadow-[0_10px_30px_rgba(197,157,85,0.2)]"
                        >
                            {auction.auctionType ===
                                "buy_now" ? (
                                <ShoppingCart
                                    size={17}
                                />
                            ) : auction.auctionType ===
                                "giveaway" ? (
                                <HandGrab
                                    size={17}
                                />
                            ) : (
                                <Gavel size={17} />
                            )}

                            <span>
                                {!isAuctionActive
                                    ? "View Auction"
                                    : auction?.auctionType ===
                                        "buy_now"
                                        ? "Buy Now"
                                        : auction?.auctionType ===
                                            "giveaway"
                                            ? "Claim Now"
                                            : "Place Bid"}
                            </span>

                            <ArrowUpRight
                                size={15}
                                className="transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
                            />
                        </button>

                        <button
                        type="button"
                        onClick={handleWatchlist}
                        className={`flex p-3 items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 ${isWatchlisted
                                ? "border-red-200 bg-red-50 text-red-500"
                                : "border-white/20 bg-black/35 text-white hover:border-white/40 hover:bg-white hover:text-gray-900"
                            }`}
                        title={
                            isWatchlisted
                                ? "Remove from watchlist"
                                : "Add to watchlist"
                        }
                    >
                        <Heart
                            size={17}
                            fill={
                                isWatchlisted
                                    ? "currentColor"
                                    : "none"
                            }
                        />
                    </button>
                    </div>
                </div>

                {/* =================================================
                    BOTTOM GOLD ACCENT
                ================================================== */}

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C59D55] transition-all duration-500 group-hover:w-full" />
            </div>
        </div>
    );
}

export default AuctionCard;