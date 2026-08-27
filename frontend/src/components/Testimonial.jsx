import {
    Quote,
    Star,
    BadgeCheck,
} from "lucide-react";
import { dummyUserImg } from "../assets";

function TestimonialCard({
    name,
    position,
    review,
    image,
    date,
}) {
    return (
        <div className="group relative flex h-full min-h-[330px] flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:border-[#C59D55]/25 sm:p-8">

            {/* =====================================================
                TOP — RATING + DATE
            ====================================================== */}

            <div className="flex items-center justify-between">
                {/* Rating */}
                <div className="flex items-center gap-1">
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <Star
                                key={i}
                                size={15}
                                fill="currentColor"
                                className="text-[#C59D55]"
                            />
                        ))}
                </div>

                {/* Date */}
                <span className="text-[11px] font-medium text-gray-400">
                    {date || "Jun 10, 2026"}
                </span>
            </div>

            {/* =====================================================
                QUOTE ICON
            ====================================================== */}

            <div className="mt-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C59D55]/[0.08]">
                    <Quote
                        size={21}
                        className="text-[#A17B35]"
                    />
                </div>
            </div>

            {/* =====================================================
                REVIEW
            ====================================================== */}

            <p className="mt-6 flex-1 text-[15px] leading-7 text-gray-600">
                {review}
            </p>

            {/* =====================================================
                DIVIDER
            ====================================================== */}

            <div className="my-4 h-px bg-gray-200" />

            {/* =====================================================
                USER
            ====================================================== */}

            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3.5">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <img
                            src={dummyUserImg}
                            alt={name}
                            className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100"
                        />

                        {/* Verified badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#C59D55]">
                            <BadgeCheck
                                size={10}
                                className="text-white"
                            />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            {name}
                        </p>

                        <p className="mt-0.5 truncate text-xs font-medium text-gray-400">
                            {position}
                        </p>
                    </div>
                </div>

                {/* Decorative quote */}
                <Quote
                    size={42}
                    strokeWidth={1.5}
                    className="shrink-0 text-[#C59D55]/15 transition-all duration-500 group-hover:text-[#C59D55]/30"
                />
            </div>

            {/* =====================================================
                BOTTOM HOVER ACCENT
            ====================================================== */}

            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C59D55] transition-all duration-500 group-hover:w-full" />
        </div>
    );
}

export default TestimonialCard;