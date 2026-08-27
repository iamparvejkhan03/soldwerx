import { Container } from "../components";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useState } from "react";

import {
    ArrowRight,
    ArrowUpRight,
    Clock,
    Mail,
    MapPin,
    MessageCircleQuestion,
    Phone,
    Send,
    ShieldCheck,
    User,
} from "lucide-react";

import { otherData } from "../assets";
import axiosInstance from "../utils/axiosInstance";

function Contact() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            userType: "bidder",
            message: "",
        },
    });

    const userType = watch("userType");
    const [sending, setSending] = useState(false);

    // ============================================================
    // SUBMIT — KEEPING YOUR EXISTING LOGIC
    // ============================================================

    const submitHandler = async (contactData) => {
        try {
            setSending(true);

            const { data } = await axiosInstance.post(
                "/api/v1/contact/submit",
                contactData
            );

            if (data?.success) {
                toast.success(data.message);
                reset();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            } else {
                toast.error(
                    data.message ||
                    "Failed to submit your query"
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to submit your query. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="overflow-hidden bg-white">

            


            {/* =====================================================
                MAIN CONTACT WORKSPACE
            ====================================================== */}

            <section className="relative pt-24 md:pt-28 lg:pt-32">

                <Container>

                    <div className="grid overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.08)] lg:grid-cols-[0.72fr_1.28fr]">

                        {/* =================================================
                            LEFT — CONTACT DESK
                        ================================================== */}

                        <div className="relative overflow-hidden bg-[#F7F5F0] p-7 md:p-10 lg:p-12">

                            {/* Decorative circle */}
                            <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-[#C59D55]/10" />

                            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full border border-[#C59D55]/10" />

                            <div className="relative z-10 flex h-full flex-col">

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A17B35]">
                                        The contact desk
                                    </p>

                                    <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight tracking-[-0.035em] text-gray-950 md:text-4xl">
                                        Start with a
                                        <span className="block font-medium italic text-gray-400">
                                            conversation.
                                        </span>
                                    </h2>

                                    <p className="mt-5 max-w-sm text-sm md:text-base leading-7 text-gray-500">
                                        You don't need to know exactly
                                        who to talk to. Send us the
                                        details and we'll connect you
                                        with the right team.
                                    </p>

                                </div>


                                {/* Contact information */}
                                <div className="mt-12 space-y-7">

                                    {/* Email */}
                                    <Link
                                        to={`mailto:${otherData?.email}`}
                                        className="group block"
                                    >
                                        <div className="flex items-start gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                                <Mail size={17} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                                    Email
                                                </p>

                                                <p className="mt-1 break-all text-sm font-semibold text-gray-800 transition-colors group-hover:text-[#A17B35]">
                                                    {otherData?.email}
                                                </p>
                                            </div>

                                        </div>
                                    </Link>


                                    {/* Phone */}
                                    <Link
                                        to={`tel:${otherData?.phone}`}
                                        className="group block"
                                    >
                                        <div className="flex items-start gap-4">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                                <Phone size={17} />
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                                    Phone
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-800 transition-colors group-hover:text-[#A17B35]">
                                                    {otherData?.phone}
                                                </p>
                                            </div>

                                        </div>
                                    </Link>


                                    {/* Location */}
                                    <div className="flex items-start gap-4">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                            <MapPin size={17} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                                Location
                                            </p>

                                            <p className="mt-1 text-sm font-semibold leading-6 text-gray-800">
                                                {otherData?.address}
                                            </p>
                                        </div>

                                    </div>

                                </div>


                                {/* Bottom message */}
                                <div className="mt-auto hidden pt-16 lg:block">

                                    <div className="border-t border-gray-200 pt-5">

                                        <p className="text-xs leading-5 text-gray-400">
                                            Prefer to find the answer
                                            yourself?
                                        </p>

                                        <Link
                                            to="/faqs"
                                            className="group mt-2 inline-flex items-center gap-2 text-sm font-bold text-gray-800"
                                        >
                                            Browse frequently asked questions

                                            <ArrowUpRight
                                                size={14}
                                                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                            />
                                        </Link>

                                    </div>

                                </div>

                            </div>
                        </div>


                        {/* =================================================
                            RIGHT — FORM
                        ================================================== */}

                        <div className="p-7 md:p-10 lg:p-12">

                            {/* Form heading */}
                            <div className="flex items-start justify-between gap-6">

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A17B35]">
                                        Send an enquiry
                                    </p>

                                    <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-950 md:text-4xl">
                                        How can we help?
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        Fill in the details below and
                                        our team will get back to you.
                                    </p>
                                </div>

                                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C59D55]/10 sm:flex">
                                    <Send
                                        size={19}
                                        className="text-[#A17B35]"
                                    />
                                </div>

                            </div>


                            {/* Form */}
                            <form
                                onSubmit={handleSubmit(
                                    submitHandler
                                )}
                                className="mt-10 space-y-6"
                            >

                                {/* =================================================
                                    NAME / EMAIL
                                ================================================== */}

                                <div className="grid gap-5 md:grid-cols-2">

                                    {/* Name */}
                                    <div>
                                        <label className="mb-2 block text-xs md:text-sm font-bold text-gray-700">
                                            Your name
                                            <span className="ml-1 text-[#A17B35]">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">

                                            <User
                                                size={16}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                            />

                                            <input
                                                {...register(
                                                    "name",
                                                    {
                                                        required: true,
                                                    }
                                                )}
                                                placeholder="Your name"
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10 ${errors.name
                                                        ? "border-red-300"
                                                        : "border-gray-200"
                                                    }`}
                                            />

                                        </div>

                                        {errors.name && (
                                            <p className="mt-1.5 text-[11px] text-red-500">
                                                Name is required
                                            </p>
                                        )}
                                    </div>


                                    {/* Email */}
                                    <div>
                                        <label className="mb-2 block text-xs md:text-sm font-bold text-gray-700">
                                            Email address
                                            <span className="ml-1 text-[#A17B35]">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">

                                            <Mail
                                                size={16}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                            />

                                            <input
                                                type="email"
                                                {...register(
                                                    "email",
                                                    {
                                                        required: true,
                                                    }
                                                )}
                                                placeholder="name@example.com"
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10 ${errors.email
                                                        ? "border-red-300"
                                                        : "border-gray-200"
                                                    }`}
                                            />

                                        </div>

                                        {errors.email && (
                                            <p className="mt-1.5 text-[11px] text-red-500">
                                                Email is required
                                            </p>
                                        )}
                                    </div>

                                </div>


                                {/* =================================================
                                    PHONE
                                ================================================== */}

                                <div>

                                    <label className="mb-2 block text-xs md:text-sm font-bold text-gray-700">
                                        Phone number
                                    </label>

                                    <div className="relative">

                                        <Phone
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                        />

                                        <input
                                            type="tel"
                                            {...register("phone")}
                                            placeholder="+58 xxx xxxxx"
                                            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10"
                                        />

                                    </div>

                                </div>


                                {/* =================================================
                                    USER TYPE
                                ================================================== */}

                                <div>

                                    <label className="mb-3 block text-xs md:text-sm font-bold text-gray-700">
                                        I am a
                                    </label>

                                    <div className="flex flex-wrap gap-2">

                                        {[
                                            "bidder",
                                            "seller",
                                        ].map((type) => {
                                            const active =
                                                userType ===
                                                type;

                                            return (
                                                <label
                                                    key={type}
                                                    className={`cursor-pointer rounded-full border px-5 py-2.5 text-xs font-semibold capitalize transition-all duration-200 ${active
                                                            ? "border-[#C59D55] bg-[#C59D55] text-[#111]"
                                                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={type}
                                                        {...register(
                                                            "userType"
                                                        )}
                                                        className="sr-only"
                                                    />

                                                    {type}
                                                </label>
                                            );
                                        })}

                                    </div>

                                </div>


                                {/* =================================================
                                    MESSAGE
                                ================================================== */}

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <label className="text-xs md:text-sm font-bold text-gray-700">
                                            Your message
                                            <span className="ml-1 text-[#A17B35]">
                                                *
                                            </span>
                                        </label>

                                        <MessageCircleQuestion
                                            size={15}
                                            className="text-gray-300"
                                        />

                                    </div>

                                    <textarea
                                        {...register(
                                            "message",
                                            {
                                                required: true,
                                            }
                                        )}
                                        placeholder="Tell us what you're looking for, what you're selling, or how we can help..."
                                        className={`min-h-[155px] w-full resize-none rounded-xl border bg-white px-4 py-3.5 text-sm leading-6 text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10 ${errors.message
                                                ? "border-red-300"
                                                : "border-gray-200"
                                            }`}
                                    />

                                    {errors.message && (
                                        <p className="mt-1.5 text-[11px] text-red-500">
                                            Message is required
                                        </p>
                                    )}

                                </div>


                                {/* =================================================
                                    SUBMIT
                                ================================================== */}

                                <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-2 text-[12px] leading-4 text-gray-400">

                                        <ShieldCheck
                                            size={14}
                                            className="shrink-0 text-[#A17B35]"
                                        />

                                        <span>
                                            Your information is
                                            handled securely.
                                        </span>

                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#C59D55] px-7 text-sm font-bold text-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D8B96F] hover:shadow-[0_12px_35px_rgba(197,157,85,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sending ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111]/25 border-t-[#111]" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send message

                                                <ArrowRight
                                                    size={16}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>
                        </div>

                    </div>

                </Container>
            </section>


            {/* =====================================================
                SUPPORT STRIP
            ====================================================== */}

            <section className="border-t border-gray-100 bg-[#FBFAF7] my-14">

                <Container>

                    <div className="grid md:grid-cols-3">

                        {/* Hours */}
                        <div className="flex items-center gap-4 py-7 md:border-r md:border-gray-200 md:pr-8">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                <Clock size={17} />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    Response hours
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    Mon–Fri · 9AM–5PM
                                </p>
                            </div>

                        </div>


                        {/* Address */}
                        <div className="flex items-center gap-4 border-t border-gray-200 py-7 md:border-r md:border-t-0 md:px-8">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                <MapPin size={17} />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    Our location
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {otherData?.address}
                                </p>
                            </div>

                        </div>


                        {/* FAQ */}
                        <div className="flex items-center gap-4 border-t border-gray-200 py-7 md:border-t-0 md:pl-8">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                <MessageCircleQuestion size={17} />
                            </div>

                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    Looking for answers?
                                </p>

                                <Link
                                    to="/faqs"
                                    className="group mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 transition-colors hover:text-[#A17B35]"
                                >
                                    Visit our FAQs

                                    <ArrowUpRight
                                        size={13}
                                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
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

export default Contact;