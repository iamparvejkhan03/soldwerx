import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowRight,
    ArrowUpRight,
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    FileText,
    Image,
    Upload,
    X,
    Check,
    Gavel,
    ShoppingCart,
    HelpCircle,
    ShieldCheck,
    Clock,
    Award,
    TrendingUp,
    Users,
    DollarSign
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { Container } from "../components";
import { heroImg, liquidate } from "../assets";

// Image Upload Component
const ImageUpload = ({ onImagesChange, maxFiles = 5 }) => {
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = maxFiles - images.length;
        const newFiles = files.slice(0, remainingSlots);

        if (newFiles.length === 0) return;

        const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024);
        if (validFiles.length !== newFiles.length) {
            toast.error("Some files exceed 5MB limit and were skipped");
        }

        const updatedImages = [...images, ...validFiles];
        setImages(updatedImages);
        onImagesChange(updatedImages);

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        const updatedImages = images.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setImages(updatedImages);
        setPreviews(updatedPreviews);
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={images.length >= maxFiles}
                />
                <div className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${images.length >= maxFiles
                    ? "border-gray-200 bg-gray-50"
                    : "border-[#F5B51B]/30 hover:border-[#F5B51B] hover:bg-[#F5B51B]/5"
                    }`}>
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-2 rounded-full bg-[#F5B51B]/10 p-2.5 text-[#F5B51B]">
                            <Upload size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                            {images.length >= maxFiles
                                ? "Maximum photos uploaded"
                                : "Upload photos of your items"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {images.length >= maxFiles
                                ? `(${maxFiles}/${maxFiles})`
                                : `JPG, PNG, WebP (max ${maxFiles} files, 5MB each)`}
                        </p>
                    </div>
                </div>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                                src={preview}
                                alt={`Upload ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            >
                                <X size={16} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                                <p className="text-xs text-white truncate">
                                    {images[index]?.name || `Image ${index + 1}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function SellWithUs() {
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
            location: "",
            itemType: "",
            description: "",
            preferredMethod: "not-sure",
            photos: []
        },
    });

    const [sending, setSending] = useState(false);
    const [photos, setPhotos] = useState([]);
    const preferredMethod = watch("preferredMethod");
    const [uploadKey, setUploadKey] = useState(0);

    const submitHandler = async (formData) => {
        try {
            setSending(true);

            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("email", formData.email);
            formDataToSend.append("phone", formData.phone || "");
            formDataToSend.append("location", formData.location || "");
            formDataToSend.append("itemType", formData.itemType || "");
            formDataToSend.append("description", formData.description);
            formDataToSend.append("preferredMethod", formData.preferredMethod || "not-sure");

            if (photos && photos.length > 0) {
                photos.forEach((photo) => {
                    formDataToSend.append("photos", photo);
                });
            }

            const { data } = await axiosInstance.post(
                "/api/v1/sell/submit",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (data?.success) {
                toast.success(data.message || "Your selling request has been submitted successfully!");
                reset();
                setPhotos([]);
                setUploadKey((k) => k + 1);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            } else {
                toast.error(
                    data.message || "Failed to submit your request"
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to submit your request. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="overflow-hidden bg-white text-gray-900">
            {/* Hero Section */}
            <section className="relative min-h-[450px] overflow-hidden bg-[#080A0D]">
                <div
                    className="absolute inset-0 bg-cover opacity-70 bg-[position:80%_20%]"
                    style={{
                        backgroundImage: `url(${liquidate})`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#080A0D]/90 to-[#080A0D]/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/60 via-transparent to-[#050608]/20" />

                <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#F5B51B]/10 blur-[120px]" />
                <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#F5B51B]/10 blur-[110px]" />

                <Container>
                    <div className="relative z-10 flex min-h-[450px] items-center pb-14 md:pb-16 pt-28 md:pt-32 lg:pt-36">
                        <div className="max-w-2xl">
                            <div className="mb-5 flex items-center gap-3 animate-[fadeUp_.7s_ease-out_both]">
                                <span className="h-px w-10 bg-[#F5B51B]" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5B51B]">
                                    Sell With SoldWerX
                                </span>
                            </div>

                            <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[64px] animate-[fadeUp_.75s_.08s_ease-out_both]">
                                Turn Your Items
                                <span className="block text-[#F5B51B]">
                                    Into Cash
                                </span>
                            </h1>

                            <p className="mt-6 max-w-xl text-base leading-7 text-white/75 md:text-lg animate-[fadeUp_.75s_.16s_ease-out_both]">
                                List your items with us and reach thousands of qualified buyers.
                                Get competitive bids, fair prices, and a seamless selling experience.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-4 animate-[fadeUp_.75s_.24s_ease-out_both]">
                                <div className="flex items-center gap-2 text-sm text-white/85">
                                    <Check size={16} className="text-[#F5B51B]" />
                                    <span>Reach thousands of buyers</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/85">
                                    <Check size={16} className="text-[#F5B51B]" />
                                    <span>Competitive bidding</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/85">
                                    <Check size={16} className="text-[#F5B51B]" />
                                    <span>Professional photography</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Form Section */}
            <section className="py-14 md:py-14 bg-[#FBFAF7]">
                <Container>
                    <div className="relative overflow-hidden rounded-[28px] bg-white p-6 md:p-10 lg:p-14 shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
                        <div className="pointer-events-none absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[#F5B51B]/5 blur-[100px]" />
                        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#F5B51B]/5 blur-[80px]" />

                        <div className="relative z-10">
                            <div className="mb-10 text-center">
                                <div className="mb-4 inline-flex items-center gap-3">
                                    <span className="h-px w-8 bg-[#F5B51B]" />
                                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5B51B]">
                                        Start Selling Today
                                    </span>
                                    <span className="h-px w-8 bg-[#F5B51B]" />
                                </div>

                                <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] text-gray-950 md:text-4xl lg:text-5xl">
                                    Tell Us What You're
                                    <span className="block font-medium italic text-gray-400">
                                        Selling.
                                    </span>
                                </h2>

                                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                                    Fill out the form below and our team will reach out within 24 hours
                                    to discuss the best way to sell your items.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit(submitHandler)}
                                className="mx-auto max-w-3xl space-y-6"
                            >
                                {/* Name & Email */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                            Full Name
                                            <span className="ml-1 text-[#F5B51B]">*</span>
                                        </label>
                                        <div className="relative">
                                            <User
                                                size={16}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                            />
                                            <input
                                                {...register("name", { required: true })}
                                                placeholder="John Doe"
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F5B51B] focus:ring-4 focus:ring-[#F5B51B]/10 ${errors.name
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

                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                            Email Address
                                            <span className="ml-1 text-[#F5B51B]">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                size={16}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                            />
                                            <input
                                                type="email"
                                                {...register("email", { required: true })}
                                                placeholder="john@example.com"
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F5B51B] focus:ring-4 focus:ring-[#F5B51B]/10 ${errors.email
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

                                {/* Phone & Location */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                size={16}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                            />
                                            <input
                                                {...register("phone")}
                                                placeholder="+1 (555) 000-0000"
                                                className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F5B51B] focus:ring-4 focus:ring-[#F5B51B]/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin
                                                size={16}
                                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                            />
                                            <input
                                                {...register("location")}
                                                placeholder="City, State"
                                                className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F5B51B] focus:ring-4 focus:ring-[#F5B51B]/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* What are you selling? */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                        What are you selling?
                                        <span className="ml-1 text-[#F5B51B]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Package
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-4 text-gray-300"
                                        />
                                        <input
                                            {...register("itemType", { required: true })}
                                            placeholder="e.g., trucks, trailers, etc."
                                            className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F5B51B] focus:ring-4 focus:ring-[#F5B51B]/10 ${errors.itemType
                                                ? "border-red-300"
                                                : "border-gray-200"
                                                }`}
                                        />
                                    </div>
                                    {errors.itemType && (
                                        <p className="mt-1.5 text-[11px] text-red-500">
                                            Please tell us what you're selling
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                        Short Description
                                        <span className="ml-1 text-[#F5B51B]">*</span>
                                    </label>
                                    <div className="relative">
                                        <FileText
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-4 text-gray-300"
                                        />
                                        <textarea
                                            {...register("description", { required: true })}
                                            placeholder="Describe your item(s) - condition, age, brand, any notable features..."
                                            className={`min-h-[120px] w-full resize-none rounded-xl border bg-white pl-11 pr-4 py-3.5 text-sm leading-6 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#F5B51B] focus:ring-4 focus:ring-[#F5B51B]/10 ${errors.description
                                                ? "border-red-300"
                                                : "border-gray-200"
                                                }`}
                                        />
                                    </div>
                                    {errors.description && (
                                        <p className="mt-1.5 text-[11px] text-red-500">
                                            Description is required
                                        </p>
                                    )}
                                </div>

                                {/* Preferred Method */}
                                <div>
                                    <label className="mb-3 block text-xs font-bold text-gray-700 md:text-sm">
                                        Preferred Selling Method (if known)
                                    </label>

                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { value: "auction", icon: Gavel, label: "Auction" },
                                            { value: "buy-it-now", icon: ShoppingCart, label: "Buy It Now" },
                                            { value: "not-sure", icon: HelpCircle, label: "Not Sure" }
                                        ].map((method) => {
                                            const active = preferredMethod === method.value;
                                            const Icon = method.icon;

                                            return (
                                                <label
                                                    key={method.value}
                                                    className={`cursor-pointer rounded-full border px-5 py-2.5 text-xs font-semibold capitalize transition-all duration-200 flex items-center gap-2 ${active
                                                        ? "border-[#F5B51B] bg-[#F5B51B] text-[#111]"
                                                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800"
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={method.value}
                                                        {...register("preferredMethod")}
                                                        className="sr-only"
                                                    />
                                                    <Icon size={16} />
                                                    {method.label}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Photos Upload */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-gray-700 md:text-sm">
                                        Photos (Optional)
                                    </label>
                                    <ImageUpload
                                        key={uploadKey}
                                        onImagesChange={setPhotos}
                                        maxFiles={5}
                                    />
                                </div>

                                {/* Submit */}
                                <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2 text-[12px] leading-4 text-gray-400">
                                        <ShieldCheck size={14} className="shrink-0 text-[#F5B51B]" />
                                        <span>Your information is handled securely.</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F5B51B] px-7 text-sm font-bold text-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC83D] hover:shadow-[0_12px_35px_rgba(245,181,27,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sending ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111]/25 border-t-[#111]" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Request
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

            {/* Why Sell With Us */}
            <section className="py-14 md:py-14">
                <Container>
                    <div className="text-center mb-12">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                            Why Choose Us
                        </p>
                        <h2 className="text-4xl font-black leading-tight tracking-[-0.04em] text-gray-950 md:text-5xl">
                            We Make Selling
                            <span className="ml-2 font-medium italic text-gray-400">
                                Easy.
                            </span>
                        </h2>
                        <p className="mt-4 text-sm md:text-base leading-7 text-gray-500 max-w-2xl mx-auto">
                            From listing to payment, we handle everything so you can focus on what matters most.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Users,
                                title: "Large Audience",
                                desc: "Access thousands of active buyers looking for items like yours."
                            },
                            {
                                icon: Award,
                                title: "Fair Prices",
                                desc: "Competitive bidding ensures you get the best possible price."
                            },
                            {
                                icon: TrendingUp,
                                title: "Marketing Support",
                                desc: "Professional photography and promotional materials included."
                            },
                            {
                                icon: DollarSign,
                                title: "Fast Payment",
                                desc: "Get paid quickly once your item sells. No hidden fees."
                            }
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                                >
                                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#F5B51B]/[0.04] transition-all duration-700 group-hover:scale-150 group-hover:bg-[#F5B51B]/[0.08]" />
                                    <div className="relative z-10">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5B51B]/10 text-[#F5B51B] transition-all duration-300 group-hover:bg-[#F5B51B] group-hover:text-black group-hover:shadow-[0_8px_24px_rgba(245,181,27,0.25)]">
                                            <Icon size={28} strokeWidth={1.7} />
                                        </div>
                                        <h3 className="text-base font-bold tracking-tight text-gray-950 transition-colors duration-300 group-hover:text-[#F5B51B]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            <style>{`
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    [style*="animation:"] {
                        animation: none !important;
                    }
                }
            `}</style>
        </main>
    );
}

export default SellWithUs;