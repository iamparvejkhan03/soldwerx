import { Quote, Star, BadgeCheck } from "lucide-react";
import { dummyUserImg } from "../assets";

function TestimonialCard({ name, position, review, image, date }) {
    return (
        <div className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white via-white to-gray-50/50 p-8 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#F5B51B]/40 hover:shadow-xl hover:shadow-[#F5B51B]/5">

            {/* Background Subtle Luxury Glow on Hover */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#F5B51B]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[#F5B51B]/20" />

            {/* TOP SECTION: User Info & Verified Badge */}
            <div>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        {/* Avatar Container */}
                        <div className="relative shrink-0">
                            <img
                                src={image || dummyUserImg}
                                alt={name}
                                className="h-12 w-12 object-cover rounded-full ring-2 ring-[#F5B51B]/20 transition-all duration-300 group-hover:ring-[#F5B51B]/60"
                            />
                            <div
                                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5B51B] text-black shadow-sm ring-2 ring-white"
                                title="Verified Collector"
                            >
                                <BadgeCheck size={12} />
                            </div>
                        </div>

                        {/* Author Details */}
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-bold tracking-tight text-gray-900 group-hover:text-[#F5B51B] transition-colors duration-300">
                                {name}
                            </h3>
                            <p className="truncate text-xs font-medium text-gray-500">
                                {position}
                            </p>
                        </div>
                    </div>

                    {/* Large Stylized Accent Quote Icon */}
                    <div className="rounded-xl bg-gray-100/80 p-2.5 text-gray-400 transition-colors duration-300 group-hover:bg-[#F5B51B]/10 group-hover:text-[#F5B51B]">
                        <Quote size={18} className="rotate-180 fill-current" />
                    </div>
                </div>

                {/* Rating & Date Row */}
                <div className="mt-6 flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-1">
                        {Array(5)
                            .fill(0)
                            .map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill="currentColor"
                                    className="text-[#F5B51B]"
                                />
                            ))}
                        <span className="ml-1.5 text-xs font-semibold text-gray-700">5.0</span>
                    </div>

                    <span className="text-[11px] font-medium tracking-wider text-gray-400 uppercase">
                        {date || "Jun 10, 2026"}
                    </span>
                </div>

                {/* REVIEW TEXT */}
                <p className="mt-4 text-[14.5px] leading-relaxed text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                    "{review}"
                </p>
            </div>

            {/* BOTTOM ACCENT BAR */}
            <div className="mt-6 flex items-center justify-between pt-2">
                <span className="inline-flex items-center text-[11px] font-semibold tracking-wider text-[#F5B51B] uppercase opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                    Verified Purchase &rarr;
                </span>
                <div className="h-1 w-12 rounded-full bg-gray-200 transition-all duration-500 group-hover:w-20 group-hover:bg-[#F5B51B]" />
            </div>
        </div>
    );
}

export default TestimonialCard;