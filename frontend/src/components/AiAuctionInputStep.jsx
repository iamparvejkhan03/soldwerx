import { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressAuctionImages } from '../utils/compressImage.js';

const AiAuctionInputStep = ({
    parentCategories,
    subCategories,
    selectedParent,
    selectedCategory,
    onParentChange,
    onSubcategoryChange,
    onFetchSubcategories,
    loadingCategories,
    onAnalyze,
    isAnalyzing,
    onSkip,
}) => {
    const [images, setImages] = useState([]);           // File[] (compressed)
    const [previews, setPreviews] = useState([]);       // string[] (blob URLs, parallel to images)
    const [prompt, setPrompt] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);

    // Keep a ref of previews so we can revoke them on unmount without
    // re-running the cleanup effect on every preview change.
    const previewsRef = useRef(previews);
    useEffect(() => { previewsRef.current = previews; }, [previews]);

    useEffect(() => {
        return () => {
            previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Reset input immediately so the same file can be re-selected later.
        e.target.value = '';

        setIsCompressing(true);
        try {
            const compressed = await compressAuctionImages(files);
            const newPreviews = compressed.map((f) => URL.createObjectURL(f));

            setImages((prev) => [...prev, ...compressed]);
            setPreviews((prev) => [...prev, ...newPreviews]);
        } catch (err) {
            console.error('Image compression failed:', err);
            toast.error('Could not process one or more images');
        } finally {
            setIsCompressing(false);
        }
    };

    const removeImage = (index) => {
        setPreviews((prev) => {
            const next = [...prev];
            if (next[index]) URL.revokeObjectURL(next[index]);
            next.splice(index, 1);
            return next;
        });
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAnalyze = () => {
        if (isCompressing) {
            toast.error('Please wait — images are still being optimised');
            return;
        }
        onAnalyze(images, selectedParent, selectedCategory, prompt);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4">
                    <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Assisted Listing</h2>
                <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                    Upload images, select the category, and let AI extract the details for you.
                </p>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isCompressing}
                    />
                    <label
                        htmlFor="ai-image-upload"
                        className={`cursor-pointer ${isCompressing ? 'opacity-60 pointer-events-none' : ''}`}
                        onClick={() => !isCompressing && fileInputRef.current?.click()}
                    >
                        {isCompressing ? (
                            <>
                                <Loader size={48} className="mx-auto text-purple-500 mb-3 animate-spin" />
                                <p className="text-gray-600 font-medium">Optimising images…</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Compressing on your device before upload
                                </p>
                            </>
                        ) : (
                            <>
                                <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium">Click to upload images</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Front, back, sides, close-ups, data plates, hour meters
                                </p>
                            </>
                        )}
                    </label>
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                        {images.map((file, index) => (
                            <div key={`${file.name}-${file.size}-${index}`} className="relative group">
                                <img
                                    src={previews[index]}
                                    alt={`Upload ${index + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                    {index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        value={selectedParent}
                        onChange={(e) => {
                            onParentChange(e.target.value);
                            onFetchSubcategories(e.target.value);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loadingCategories}
                    >
                        <option value="">Select Category</option>
                        {parentCategories.map((cat) => (
                            <option key={cat._id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory *
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onSubcategoryChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!selectedParent || loadingCategories}
                    >
                        <option value="">Select Subcategory</option>
                        {subCategories.map((sub) => (
                            <option key={sub._id} value={sub.slug}>{sub.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Prompt */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g., Focus on engine specs, mileage, and visible condition..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || isCompressing || images.length === 0 || !selectedCategory}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Analyzing images...
                        </>
                    ) : isCompressing ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Optimising images...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate with AI
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onSkip}
                    disabled={isCompressing}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 underline transition-colors disabled:opacity-50"
                >
                    Skip, I'll fill manually
                </button>
            </div>

            {isAnalyzing && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="text-purple-700 text-sm">
                        ⏳ AI is analyzing your images. This may take 10–20 seconds. Please don't close this page.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AiAuctionInputStep;