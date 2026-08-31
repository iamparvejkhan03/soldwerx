import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    ArrowRight,
    ArrowUpRight,
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Clock,
    Image,
    Upload,
    Check,
    X,
    FileText,
    Calendar
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

// Separate image upload component
const ImageUpload = ({ onImagesChange, maxFiles = 5 }) => {
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = maxFiles - images.length;
        const newFiles = files.slice(0, remainingSlots);

        if (newFiles.length === 0) return;

        // Check file sizes (max 5MB each)
        const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024);
        if (validFiles.length !== newFiles.length) {
            toast.error("Some files exceed 5MB limit and were skipped");
        }

        const updatedImages = [...images, ...validFiles];
        setImages(updatedImages);
        onImagesChange(updatedImages);

        // Create previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);

        setImages(updatedImages);
        setPreviews(updatedPreviews);
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-3">
            {/* Upload area */}
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
                        : "border-[#C59D55]/30 hover:border-[#C59D55] hover:bg-[#C59D55]/5"
                    }`}>
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-2 rounded-full bg-[#C59D55]/10 p-2.5 text-[#A17B35]">
                            <Upload size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                            {images.length >= maxFiles
                                ? "Maximum photos uploaded"
                                : "Upload photos of the items"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {images.length >= maxFiles
                                ? `(${maxFiles}/${maxFiles})`
                                : `JPG, PNG, WebP (max ${maxFiles} files, 5MB each)`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Image previews */}
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

function LiquidateForm() {
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
            description: "",
            itemCount: "",
            timeline: "",
            photos: []
        },
    });

    const [sending, setSending] = useState(false);
    const [photos, setPhotos] = useState([]);

    const submitHandler = async (formData) => {
        try {
            setSending(true);

            // Prepare FormData for multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("email", formData.email);
            formDataToSend.append("phone", formData.phone || "");
            formDataToSend.append("location", formData.location || "");
            formDataToSend.append("description", formData.description);
            formDataToSend.append("itemCount", formData.itemCount || "");
            formDataToSend.append("timeline", formData.timeline || "");

            // Append photos
            if (photos && photos.length > 0) {
                photos.forEach((photo) => {
                    formDataToSend.append("photos", photo);
                });
            }

            const { data } = await axiosInstance.post(
                "/api/v1/liquidate/submit",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (data?.success) {
                toast.success(data.message || "Your liquidation request has been submitted successfully!");
                reset();
                setPhotos([]);

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
        <section className="py-14 md:py-20 bg-[#080A0D]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[28px] bg-[#0D0F13] p-6 md:p-10 lg:p-14">
                    {/* Decorative elements */}
                    <div className="pointer-events-none absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[#C59D55]/10 blur-[100px]" />
                    <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#C59D55]/5 blur-[80px]" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="mb-10 text-center">
                            <div className="mb-4 inline-flex items-center gap-3">
                                <span className="h-px w-8 bg-[#C59D55]" />
                                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C59D55]">
                                    No Obligation
                                </span>
                                <span className="h-px w-8 bg-[#C59D55]" />
                            </div>

                            <h2 className="text-3xl font-black leading-tight tracking-[-0.035em] text-white md:text-4xl lg:text-5xl">
                                Tell Us About Your
                                <span className="block font-medium italic text-white/55">
                                    Assets & Timeline
                                </span>
                            </h2>

                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                                Complete the form below and our team will reach out within 24 hours
                                with a customized liquidation plan. There's never any obligation.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit(submitHandler)}
                            className="mx-auto max-w-3xl space-y-6"
                        >
                            {/* Name & Email */}
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                        Full Name
                                        <span className="ml-1 text-[#C59D55]">*</span>
                                    </label>
                                    <div className="relative">
                                        <User
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            {...register("name", { required: true })}
                                            placeholder="John Doe"
                                            className={`h-12 w-full rounded-xl border bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10 ${errors.name
                                                    ? "border-red-400/50"
                                                    : "border-white/10"
                                                }`}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1.5 text-[11px] text-red-400">
                                            Name is required
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                        Email Address
                                        <span className="ml-1 text-[#C59D55]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            type="email"
                                            {...register("email", { required: true })}
                                            placeholder="john@example.com"
                                            className={`h-12 w-full rounded-xl border bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10 ${errors.email
                                                    ? "border-red-400/50"
                                                    : "border-white/10"
                                                }`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-[11px] text-red-400">
                                            Email is required
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone & Location */}
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            {...register("phone")}
                                            placeholder="+1 (555) 000-0000"
                                            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                        Location / Address
                                    </label>
                                    <div className="relative">
                                        <MapPin
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            {...register("location")}
                                            placeholder="City, State, or full address"
                                            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                    What do you need liquidated?
                                    <span className="ml-1 text-[#C59D55]">*</span>
                                </label>
                                <div className="relative">
                                    <FileText
                                        size={16}
                                        className="pointer-events-none absolute left-4 top-4 text-white/30"
                                    />
                                    <textarea
                                        {...register("description", { required: true })}
                                        placeholder="Describe the items, assets, or inventory you want to liquidate. Be as detailed as possible..."
                                        className={`min-h-[120px] w-full resize-none rounded-xl border bg-white/5 pl-11 pr-4 py-3.5 text-sm leading-6 text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10 ${errors.description
                                                ? "border-red-400/50"
                                                : "border-white/10"
                                            }`}
                                    />
                                </div>
                                {errors.description && (
                                    <p className="mt-1.5 text-[11px] text-red-400">
                                        Description is required
                                    </p>
                                )}
                            </div>

                            {/* Item Count & Timeline */}
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                        Approximate Number of Items
                                    </label>
                                    <div className="relative">
                                        <Package
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            {...register("itemCount")}
                                            placeholder="e.g., 50, 100+, etc."
                                            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                        Timeline / Deadline
                                    </label>
                                    <div className="relative">
                                        <Calendar
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            {...register("timeline")}
                                            placeholder="e.g., Within 30 days, ASAP, etc."
                                            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:border-[#C59D55] focus:ring-4 focus:ring-[#C59D55]/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Photos Upload */}
                            <div>
                                <label className="mb-2 block text-xs font-bold text-white/80 md:text-sm">
                                    Photos (Optional)
                                </label>
                                <ImageUpload
                                    onImagesChange={setPhotos}
                                    maxFiles={5}
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex flex-col gap-4 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-[12px] leading-4 text-white/40">
                                    <Check size={14} className="shrink-0 text-[#C59D55]" />
                                    <span>100% free consultation. No obligation.</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#C59D55] px-7 text-sm font-bold text-[#111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D8B96F] hover:shadow-[0_12px_35px_rgba(197,157,85,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
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

                            <p className="mt-3 text-center text-xs text-white/40">
                                We respect your privacy. Your information will only be used to contact you about your liquidation request.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LiquidateForm;