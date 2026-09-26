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
                    data.message || "Failed to submit your query"
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
        <main className="overflow-hidden bg-white text-[#08090A]">

            {/* =====================================================
                MAIN CONTACT WORKSPACE
            ====================================================== */}

            <section className="relative pt-24 md:pt-28 lg:pt-32">
                <Container>
                    <div className="grid overflow-hidden rounded-2xl border border-gray-200 lg:grid-cols-[0.72fr_1.28fr]">

                        {/* =================================================
                            LEFT — CONTACT DESK
                        ================================================== */}

                        <div className="relative overflow-hidden bg-[#08090A] p-7 md:p-10 lg:p-12">

                            <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#F5B51B]/10 blur-[100px]" />

                            <div className="relative z-10 flex h-full flex-col">

                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#F5B51B]/40 bg-[#F5B51B]/[0.08] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5B51B]">
                                        The Desk
                                    </span>

                                    <h2 className="mt-6 max-w-sm text-3xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-4xl">
                                        Get in touch.
                                        <br />
                                        <span className="text-[#F5B51B]">
                                            We're listening.
                                        </span>
                                    </h2>

                                    <p className="mt-5 max-w-sm text-sm leading-7 text-white/55 md:text-base">
                                        Whether you're buying, selling, or just exploring — reach out and our team will respond within one business day.
                                    </p>
                                </div>

                                {/* Contact information */}
                                <div className="mt-12 space-y-6 border-t border-white/10 pt-8">

                                    {/* Email */}
                                    <Link to={`mailto:${otherData?.email}`} className="group flex items-start gap-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-[#F5B51B] transition-colors group-hover:border-[#F5B51B]/50 group-hover:bg-[#F5B51B]/10">
                                            <Mail size={16} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                                                Email
                                            </p>
                                            <p className="mt-1 break-all text-sm font-medium text-white/85 transition-colors group-hover:text-[#F5B51B]">
                                                {otherData?.email}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Phone */}
                                    <Link to={`tel:${otherData?.phone}`} className="group flex items-start gap-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-[#F5B51B] transition-colors group-hover:border-[#F5B51B]/50 group-hover:bg-[#F5B51B]/10">
                                            <Phone size={16} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                                                Phone
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-white/85 transition-colors group-hover:text-[#F5B51B]">
                                                {otherData?.phone}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Location */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-[#F5B51B]">
                                            <MapPin size={16} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                                                Location
                                            </p>
                                            <p className="mt-1 text-sm font-medium leading-6 text-white/85">
                                                {otherData?.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom message */}
                                <div className="mt-auto hidden pt-16 lg:block">
                                    <div className="border-t border-white/10 pt-5">
                                        <p className="text-xs leading-5 text-white/35">
                                            Prefer to find the answer yourself?
                                        </p>

                                        <Link
                                            to="/faqs"
                                            className="group mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#F5B51B]"
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

                        <div className="bg-white p-7 md:p-10 lg:p-12">

                            {/* Form heading */}
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5B51B]">
                                        Enquiry Form
                                    </span>

                                    <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.04em] text-[#08090A] md:text-4xl">
                                        How can we help?
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        Fill in the details below and our team will get back to you.
                                    </p>
                                </div>

                                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#F5B51B]/30 bg-[#F5B51B]/5 sm:flex">
                                    <Send size={18} className="text-[#F5B51B]" />
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(submitHandler)} className="mt-10 space-y-6">

                                {/* NAME / EMAIL */}
                                <div className="grid gap-5 md:grid-cols-2">

                                    {/* Name */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-gray-700 md:text-sm">
                                            Your name
                                            <span className="ml-1 text-[#F5B51B]">*</span>
                                        </label>

                                        <div className="relative">
                                            <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />

                                            <input
                                                {...register("name", { required: true })}
                                                placeholder="Your name"
                                                className={`h-12 w-full rounded-lg border bg-white pl-11 pr-4 text-sm text-[#08090A] outline-none transition-colors placeholder:text-gray-300 focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 ${errors.name ? "border-red-300" : "border-gray-200"
                                                    }`}
                                            />
                                        </div>

                                        {errors.name && (
                                            <p className="mt-1.5 text-[11px] text-red-500">Name is required</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold text-gray-700 md:text-sm">
                                            Email address
                                            <span className="ml-1 text-[#F5B51B]">*</span>
                                        </label>

                                        <div className="relative">
                                            <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />

                                            <input
                                                type="email"
                                                {...register("email", { required: true })}
                                                placeholder="name@example.com"
                                                className={`h-12 w-full rounded-lg border bg-white pl-11 pr-4 text-sm text-[#08090A] outline-none transition-colors placeholder:text-gray-300 focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 ${errors.email ? "border-red-300" : "border-gray-200"
                                                    }`}
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-1.5 text-[11px] text-red-500">Email is required</p>
                                        )}
                                    </div>
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-gray-700 md:text-sm">
                                        Phone number
                                    </label>

                                    <div className="relative">
                                        <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />

                                        <input
                                            type="tel"
                                            {...register("phone")}
                                            placeholder="+1 xxx xxxxx"
                                            className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-[#08090A] outline-none transition-colors placeholder:text-gray-300 focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20"
                                        />
                                    </div>
                                </div>

                                {/* USER TYPE */}
                                <div>
                                    <label className="mb-3 block text-xs font-semibold text-gray-700 md:text-sm">
                                        I am a
                                    </label>

                                    <div className="flex flex-wrap gap-2">
                                        {["bidder", "seller"].map((type) => {
                                            const active = userType === type;

                                            return (
                                                <label
                                                    key={type}
                                                    className={`cursor-pointer rounded-full border px-5 py-2.5 text-xs font-semibold capitalize transition-colors duration-150 ${active
                                                        ? "border-[#F5B51B] bg-[#F5B51B] text-black"
                                                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={type}
                                                        {...register("userType")}
                                                        className="sr-only"
                                                    />
                                                    {type}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* MESSAGE */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-700 md:text-sm">
                                            Your message
                                            <span className="ml-1 text-[#F5B51B]">*</span>
                                        </label>

                                        <MessageCircleQuestion size={15} className="text-gray-300" />
                                    </div>

                                    <textarea
                                        {...register("message", { required: true })}
                                        placeholder="Tell us what you're looking for, what you're selling, or how we can help…"
                                        className={`min-h-[155px] w-full resize-none rounded-lg border bg-white px-4 py-3.5 text-sm leading-6 text-[#08090A] outline-none transition-colors placeholder:text-gray-300 focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 ${errors.message ? "border-red-300" : "border-gray-200"
                                            }`}
                                    />

                                    {errors.message && (
                                        <p className="mt-1.5 text-[11px] text-red-500">Message is required</p>
                                    )}
                                </div>

                                {/* SUBMIT */}
                                <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2 text-[12px] leading-4 text-gray-400">
                                        <ShieldCheck size={14} className="shrink-0 text-[#F5B51B]" />
                                        <span>Your information is handled securely.</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="group flex h-12 items-center justify-center gap-2 rounded-md bg-[#F5B51B] px-7 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC83D] hover:shadow-[0_15px_35px_rgba(245,181,27,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sending ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                Send message
                                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
                SUPPORT STRIP — the ledger
            ====================================================== */}

            <section className="my-14">
                <Container>
                    <div className="grid border-y border-gray-200 md:grid-cols-3">

                        {/* Hours */}
                        <div className="flex items-center gap-4 py-7 md:border-r md:border-gray-200 md:pr-8">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#F5B51B]/30 bg-[#F5B51B]/5 text-[#F5B51B]">
                                <Clock size={16} />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                    Response Hours
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#08090A]">
                                    Mon–Fri · 9AM–5PM
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-4 border-t border-gray-200 py-7 md:border-r md:border-t-0 md:px-8">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#F5B51B]/30 bg-[#F5B51B]/5 text-[#F5B51B]">
                                <MapPin size={16} />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                    Our Location
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#08090A]">
                                    {otherData?.address}
                                </p>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="flex items-center gap-4 border-t border-gray-200 py-7 md:border-t-0 md:pl-8">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#F5B51B]/30 bg-[#F5B51B]/5 text-[#F5B51B]">
                                <MessageCircleQuestion size={16} />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                    Looking for answers?
                                </p>
                                <Link
                                    to="/faqs"
                                    className="group mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#08090A] transition-colors hover:text-[#F5B51B]"
                                >
                                    Visit our FAQs
                                    <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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