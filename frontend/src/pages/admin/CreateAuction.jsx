import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import parse from 'html-react-parser';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    FileText,
    DollarSign,
    Settings,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    X,
    Image,
    File,
    Clock,
    MapPin,
    Gavel,
    Youtube,
    Car,
    Cog,
    Trophy,
    Move,
    Fuel,
    Gauge,
    Calendar,
    User,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    Banknote,
    Zap
} from "lucide-react";
import { RTE, AdminContainer, AdminHeader, AdminSidebar, AiAuctionInputStep } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import { useAiListingAssistant } from '../../hooks/useAiListingAssistant.jsx';

// Drag and Drop item types
const ItemTypes = {
    PHOTO: 'photo',
};

// Draggable Photo Component
const DraggablePhoto = ({ photo, index, movePhoto, removePhoto }) => {
    const [, ref] = useDrag({
        type: ItemTypes.PHOTO,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ItemTypes.PHOTO,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                movePhoto(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <div ref={(node) => ref(drop(node))} className="relative group">
            <img
                src={URL.createObjectURL(photo)}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-move"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <Move size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
            </div>
            <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
};

// Photo Gallery Component
const PhotoGallery = ({ photos, movePhoto, removePhoto }) => {
    return (
        <div className="mt-4">
            <p className="text-sm text-secondary mb-3">
                Drag and drop to reorder photos. The first image will be the main thumbnail.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                    <DraggablePhoto
                        key={`photo-${index}`}
                        photo={photo}
                        index={index}
                        movePhoto={movePhoto}
                        removePhoto={removePhoto}
                    />
                ))}
            </div>
        </div>
    );
};

// UploadProgressModal Component
const UploadProgressModal = ({ isOpen, fileCount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <div className="flex items-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                    <h3 className="text-lg font-semibold">Creating Your Auction</h3>
                </div>

                <div className="space-y-3">
                    <p className="text-gray-600">
                        We're uploading {fileCount} file(s) to our secure cloud storage.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ⏳ <strong>Please be patient:</strong> Large files may take several minutes to upload depending on your internet speed.
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Do not close this window until the process is complete.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Dynamic Field Renderer Component
const DynamicField = ({ field, register, errors, watch, setValue }) => {
    const fieldName = `specifications.${field.name}`;
    const error = errors.specifications?.[field.name];

    const fieldLabel = field.label || field.name || 'Field';
    const fieldPlaceholder = field.placeholder || `Enter ${fieldLabel.toLowerCase()}`;
    const inputClasses = `w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent`;
    const unitText = field.unit ? ` (${field.unit})` : '';

    const InheritanceBadge = field.source === 'inherited' ? (
        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Inherited from {field.sourceCategory?.name}
        </span>
    ) : null;

    switch (field.fieldType) {
        case 'textarea':
            return (
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                            {unitText}
                        </label>
                        {InheritanceBadge}
                    </div>
                    <textarea
                        {...register(fieldName, {
                            required: field.required ? `${fieldLabel} is required` : false,
                            minLength: field.validation?.minLength ? {
                                value: field.validation.minLength,
                                message: `Minimum ${field.validation.minLength} characters`
                            } : undefined,
                            maxLength: field.validation?.maxLength ? {
                                value: field.validation.maxLength,
                                message: `Maximum ${field.validation.maxLength} characters`
                            } : undefined,
                            pattern: field.validation?.pattern ? {
                                value: new RegExp(field.validation.pattern),
                                message: field.validation.message || `Invalid format for ${fieldLabel}`
                            } : undefined
                        })}
                        id={field.name}
                        rows={3}
                        placeholder={fieldPlaceholder}
                        className={inputClasses}
                    />
                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </div>
            );

        case 'select':
            return (
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                            {unitText}
                        </label>
                        {InheritanceBadge}
                    </div>
                    <select
                        {...register(fieldName, {
                            required: field.required ? `${fieldLabel} is required` : false
                        })}
                        id={field.name}
                        className={inputClasses}
                    >
                        <option value="">Select {fieldLabel}</option>
                        {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </div>
            );

        case 'number':
            return (
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                            {unitText}
                        </label>
                        {InheritanceBadge}
                    </div>
                    <input
                        {...register(fieldName, {
                            required: field.required ? `${fieldLabel} is required` : false,
                            min: field.validation?.min ? {
                                value: parseFloat(field.validation.min),
                                message: `Minimum value is ${field.validation.min}${field.unit ? ` ${field.unit}` : ''}`
                            } : undefined,
                            max: field.validation?.max ? {
                                value: parseFloat(field.validation.max),
                                message: `Maximum value is ${field.validation.max}${field.unit ? ` ${field.unit}` : ''}`
                            } : undefined
                        })}
                        id={field.name}
                        type="number"
                        step="any"
                        placeholder={fieldPlaceholder}
                        className={inputClasses}
                    />
                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </div>
            );

        case 'date':
            return (
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {InheritanceBadge}
                    </div>
                    <input
                        {...register(fieldName, {
                            required: field.required ? `${fieldLabel} is required` : false
                        })}
                        id={field.name}
                        type="date"
                        className={inputClasses}
                    />
                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </div>
            );

        case 'boolean':
            return (
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input
                            {...register(fieldName)}
                            id={field.name}
                            type="checkbox"
                            className="h-4 w-4 text-black rounded focus:ring-black border-gray-300"
                        />
                        <label htmlFor={field.name} className="ml-2 block text-sm text-gray-700">
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {InheritanceBadge}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </div>
            );

        default:
            return (
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                            {unitText}
                        </label>
                        {InheritanceBadge}
                    </div>
                    <input
                        {...register(fieldName, {
                            required: field.required ? `${fieldLabel} is required` : false,
                            minLength: field.validation?.minLength ? {
                                value: field.validation.minLength,
                                message: `Minimum ${field.validation.minLength} characters`
                            } : undefined,
                            maxLength: field.validation?.maxLength ? {
                                value: field.validation.maxLength,
                                message: `Maximum ${field.validation.maxLength} characters`
                            } : undefined,
                            pattern: field.validation?.pattern ? {
                                value: new RegExp(field.validation.pattern),
                                message: field.validation.message || `Invalid format for ${fieldLabel}`
                            } : undefined
                        })}
                        id={field.name}
                        type={field.fieldType === 'text' ? 'text' : field.fieldType}
                        placeholder={fieldPlaceholder}
                        className={inputClasses}
                    />
                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </div>
            );
    }
};

const ConfidenceBadge = ({ score }) => {
    if (score === undefined || score === null) return null;

    if (score > 80) {
        return (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                AI {score}%
            </span>
        );
    }
    if (score >= 50) {
        return (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                AI {score}% — verify
            </span>
        );
    }
    return null;
};

const CreateAuction = () => {
    const [step, setStep] = useState(0);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [uploadedServiceRecords, setUploadedServiceRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Category state
    const [parentCategories, setParentCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [categoryFields, setCategoryFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // AI state
    const [aiStepCompleted, setAiStepCompleted] = useState(false);
    const { isAnalyzing, aiResult, analyzeImages, clearResult } = useAiListingAssistant();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        getValues,
        reset,
        control,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            auctionType: 'standard',
            categories: []
        }
    });

    const auctionType = watch('auctionType');
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const selectedCategory = watch('category');
    const selectedParentSlug = watch('parentCategory');

    // Fetch parent categories on mount
    useEffect(() => {
        fetchParentCategories();
    }, []);

    // Fetch subcategories when parent is selected
    useEffect(() => {
        if (selectedParentSlug) {
            fetchSubCategories(selectedParentSlug);
            setValue('category', '');
            setCategoryFields([]);
        }
    }, [selectedParentSlug]);

    // Fetch fields when subcategory is selected
    useEffect(() => {
        if (selectedCategory) {
            fetchCategoryFields(selectedCategory);
        } else {
            setCategoryFields([]);
        }
    }, [selectedCategory]);

    const handleAiAnalyze = async (files, parentCat, subCat, prompt) => {
        const result = await analyzeImages(files, parentCat, subCat, prompt);
        if (result) {
            setUploadedPhotos(files);
            setValue('parentCategory', parentCat);

            await fetchSubCategories(parentCat);
            setValue('category', subCat);

            await fetchCategoryFields(subCat);

            setValue('title', result.title, { shouldValidate: true });
            setValue('description', result.description, { shouldValidate: true });
            if (result.location) setValue('location', result.location);

            setTimeout(() => {
                Object.entries(result.specifications).forEach(([key, value]) => {
                    setValue(`specifications.${key}`, value, { shouldValidate: true });
                });
            }, 200);

            setAiStepCompleted(true);
            setStep(1);
            toast.success('AI has populated the form. Please review all fields.');
        }
    };

    const fetchParentCategories = async () => {
        try {
            setLoadingCategories(true);
            const { data } = await axiosInstance.get('/api/v1/categories/public/parents');
            if (data.success) {
                setParentCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching parent categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSubCategories = async (parentSlug) => {
        try {
            setLoadingCategories(true);
            const { data } = await axiosInstance.get(`/api/v1/categories/public/${parentSlug}/children`);
            if (data.success) {
                setSubCategories(data.data.subcategories);
                setSelectedParent(data.data.parent);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            toast.error('Failed to load subcategories');
            setSubCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchCategoryFields = async (slug) => {
        try {
            setLoadingFields(true);
            const { data } = await axiosInstance.get(`/api/v1/categories/public/by-slug/${slug}/fields`);
            if (data.success) {
                setCategoryFields(data.data.fields || []);
            }
        } catch (error) {
            console.error('Error fetching category fields:', error);
            toast.error('Failed to load category fields');
            setCategoryFields([]);
        } finally {
            setLoadingFields(false);
        }
    };

    const movePhoto = (fromIndex, toIndex) => {
        const updatedPhotos = [...uploadedPhotos];
        const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
        updatedPhotos.splice(toIndex, 0, movedPhoto);
        setUploadedPhotos(updatedPhotos);
    };

    const moveServiceRecord = (fromIndex, toIndex) => {
        const updatedRecords = [...uploadedServiceRecords];
        const [movedRecord] = updatedRecords.splice(fromIndex, 1);
        updatedRecords.splice(toIndex, 0, movedRecord);
        setUploadedServiceRecords(updatedRecords);
    };

    const groupedFields = categoryFields.reduce((acc, field) => {
        const group = field.group || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(field);
        return acc;
    }, {});

    const renderCategoryFields = () => {
        if (loadingFields) {
            return (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    <span className="ml-3 text-gray-600">Loading fields...</span>
                </div>
            );
        }

        if (categoryFields.length === 0) {
            return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <AlertCircle size={40} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Custom Fields</h3>
                    <p className="text-gray-500">
                        This category doesn't have any specific fields configured.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {Object.entries(groupedFields).map(([groupName, fields]) => (
                    <div key={groupName} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="font-medium text-gray-700">{groupName}</h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fields
                                    .sort((a, b) => a.order - b.order)
                                    .map((field) => {
                                        const uniqueKey = `${field.source || 'own'}-${field._id || field.name}-${selectedCategory}`;
                                        return (
                                            <DynamicField
                                                key={uniqueKey}
                                                field={field}
                                                register={register}
                                                errors={errors}
                                                watch={watch}
                                                setValue={setValue}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const nextStep = async () => {
        let isValid = true;
        scrollTo({ top: 0, behavior: 'smooth' });

        // Step 0: AI Assist — no validation, just advance
        if (step === 0) {
            setStep(1);
            scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Step 1: Item Info + Category + Specs + Description + Photos
        if (step === 1) {
            const fieldsToValidate = [
                'title',
                'description',
                'parentCategory',
                'category'
            ];

            categoryFields.forEach(field => {
                if (field.required) {
                    fieldsToValidate.push(`specifications.${field.name}`);
                }
            });

            const overallValidationPassed = await trigger(fieldsToValidate);

            if (!overallValidationPassed) {
                isValid = false;
            }

            if (uploadedPhotos.length === 0) {
                setError('photos', {
                    type: 'manual',
                    message: 'At least one photo is required'
                });
                isValid = false;
            } else {
                clearErrors('photos');
            }
        }

        // Step 2: Auction Type + Pricing + Dates + Location + Video
        if (step === 2) {
            const fieldsToValidate = ['auctionType', 'startDate', 'endDate'];

            if (auctionType === 'standard' || auctionType === 'reserve') {
                fieldsToValidate.push('startPrice', 'bidIncrement');
            }

            if (auctionType === 'reserve') {
                fieldsToValidate.push('reservePrice');
            }

            if (auctionType === 'buy_now') {
                fieldsToValidate.push('buyNowPrice', 'startPrice');
            }

            const overallValidationPassed = await trigger(fieldsToValidate);

            if (!overallValidationPassed) {
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
        scrollTo({ top: 0, behavior: 'smooth' });
        setAiStepCompleted(false);
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedPhotos([...files, ...uploadedPhotos]);
        clearErrors('photos');
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedDocuments([...uploadedDocuments, ...files]);
    };

    const handleServiceRecordUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedServiceRecords([...uploadedServiceRecords, ...files]);
    };

    const removeServiceRecord = (index) => {
        setUploadedServiceRecords(uploadedServiceRecords.filter((_, i) => i !== index));
    };

    const removePhoto = (index) => {
        const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
        setUploadedPhotos(newPhotos);

        if (newPhotos.length === 0) {
            setError('photos', {
                type: 'manual',
                message: 'At least one photo is required'
            });
        } else {
            clearErrors('photos');
        }
    };

    const removeDocument = (index) => {
        setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
    };

    const createAuctionHandler = async (auctionData) => {
        try {
            setIsLoading(true);

            const formData = new FormData();

            formData.append('title', auctionData.title);
            formData.append('description', auctionData.description);
            formData.append('location', auctionData.location || '');
            formData.append('videoLink', auctionData.video || '');

            const categoriesToStore = [];
            if (auctionData.parentCategory) categoriesToStore.push(auctionData.parentCategory);
            if (auctionData.category) categoriesToStore.push(auctionData.category);
            formData.append('categories', JSON.stringify(categoriesToStore));

            formData.append('auctionType', auctionData.auctionType);
            formData.append('allowOffers', auctionData.allowOffers || false);
            formData.append('features', auctionData.features || '');
            formData.append('startDate', new Date(auctionData.startDate).toISOString());
            formData.append('endDate', new Date(auctionData.endDate).toISOString());

            if (auctionData.specifications) {
                formData.append('specifications', JSON.stringify(auctionData.specifications));
            }

            if (auctionData.auctionType === 'giveaway' || auctionData.auctionType === 'buy_now') {
                formData.append('startPrice', 0);
                if (auctionData.auctionType === 'buy_now' && auctionData.buyNowPrice) {
                    formData.append('buyNowPrice', auctionData.buyNowPrice);
                }
                if (auctionData.auctionType === 'buy_now' && auctionData.bidIncrement) {
                    formData.append('bidIncrement', auctionData.bidIncrement);
                }
            } else {
                if (auctionData.startPrice) formData.append('startPrice', auctionData.startPrice);
                if (auctionData.auctionType === 'standard' || auctionData.auctionType === 'reserve') {
                    formData.append('bidIncrement', auctionData.bidIncrement);
                }
                if (auctionData.auctionType === 'reserve' && auctionData.reservePrice) {
                    formData.append('reservePrice', auctionData.reservePrice);
                }
            }

            uploadedPhotos.forEach((photo) => formData.append('photos', photo));
            uploadedDocuments.forEach((doc) => formData.append('documents', doc));
            uploadedServiceRecords.forEach((record) => formData.append('serviceRecords', record));

            const { data } = await axiosInstance.post(
                '/api/v1/auctions/create',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (data && data.success) {
                toast.success(data.message);
                setStep(0);
                setAiStepCompleted(false);
                setUploadedPhotos([]);
                setUploadedDocuments([]);
                setUploadedServiceRecords([]);
                setCategoryFields([]);
                setSubCategories([]);
                setSelectedParent(null);
                reset();
                navigate('/admin/auctions/all');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to create auction';
            toast.error(errorMessage);
            console.log('Create auction error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <section className="flex min-h-[70vh]">
                <AdminSidebar />
                <UploadProgressModal
                    isOpen={isLoading}
                    fileCount={uploadedPhotos.length + uploadedDocuments.length + uploadedServiceRecords.length}
                />

                <div className="w-full relative">
                    <AdminHeader />

                    <AdminContainer>
                        <div className="pt-16 md:py-7">
                            <h1 className="text-3xl md:text-4xl font-bold mb-5">Create Auction</h1>

                            {/* Progress Steps */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    {['AI Assist', 'Item Info', 'Auction Details', 'Review & Submit'].map((label, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > index ? 'bg-green-500 text-white' :
                                                step === index ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {step > index ? <CheckCircle size={20} /> : index + 1}
                                            </div>
                                            <span className="text-sm mt-2 hidden md:block">{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full bg-gray-200 h-3 rounded-full">
                                    <div
                                        className="bg-black h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${(step / 3) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(createAuctionHandler)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                                {/* ==================== STEP 0: AI ASSIST ==================== */}
                                {step === 0 && !aiStepCompleted && (
                                    <AiAuctionInputStep
                                        parentCategories={parentCategories}
                                        subCategories={subCategories}
                                        selectedParent={selectedParentSlug}
                                        selectedCategory={selectedCategory}
                                        onParentChange={(slug) => setValue('parentCategory', slug)}
                                        onSubcategoryChange={(slug) => setValue('category', slug)}
                                        onFetchSubcategories={fetchSubCategories}
                                        loadingCategories={loadingCategories}
                                        onAnalyze={handleAiAnalyze}
                                        isAnalyzing={isAnalyzing}
                                        onSkip={() => {
                                            setAiStepCompleted(true);
                                            setStep(1);
                                            scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    />
                                )}

                                {/* ==================== STEP 1: ITEM INFO ==================== */}
                                {step === 1 && (
                                    <div>
                                        {/* Category correction warning */}
                                        {aiResult?.categorySuggestion && aiResult.categorySuggestion.confidence > 70 && (
                                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-amber-800 font-medium">
                                                        These images look more like a "{aiResult.categorySuggestion.subcategorySlug}".
                                                    </p>
                                                    <p className="text-amber-700 text-sm mt-1">
                                                        {aiResult.categorySuggestion.reason}
                                                    </p>
                                                    <div className="flex gap-3 mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setValue('parentCategory', aiResult.categorySuggestion.parentSlug);
                                                                fetchSubCategories(aiResult.categorySuggestion.parentSlug);
                                                                setValue('category', aiResult.categorySuggestion.subcategorySlug);
                                                                fetchCategoryFields(aiResult.categorySuggestion.subcategorySlug);
                                                                clearResult();
                                                            }}
                                                            className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                                        >
                                                            Switch Category
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={clearResult}
                                                            className="text-sm px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100"
                                                        >
                                                            Keep Current
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            Item Details
                                        </h2>

                                        {/* Title */}
                                        <div className="grid grid-cols-1 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-secondary mb-1">
                                                    Item Name *
                                                </label>
                                                <input
                                                    {...register('title', { required: 'Item name is required' })}
                                                    id="title"
                                                    type="text"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="e.g., 1985 Star Co. Michael Jordan #117 BGS Gem Mint 9.5"
                                                />
                                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                            </div>
                                        </div>

                                        {/* Category + Subcategory */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="parentCategory" className="block text-sm font-medium text-secondary mb-1">
                                                    Category *
                                                </label>
                                                <select
                                                    {...register('parentCategory', {
                                                        required: 'Please select a category'
                                                    })}
                                                    id="parentCategory"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    disabled={loadingCategories}
                                                >
                                                    <option value="">Select a category</option>
                                                    {parentCategories.map(cat => (
                                                        <option key={cat._id} value={cat.slug}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.parentCategory && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.parentCategory.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="category" className="block text-sm font-medium text-secondary mb-1">
                                                    Subcategory *
                                                </label>
                                                <select
                                                    {...register('category', {
                                                        required: 'Please select a subcategory'
                                                    })}
                                                    id="category"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    disabled={!selectedParentSlug || loadingCategories}
                                                >
                                                    <option value="">Select a subcategory</option>
                                                    {subCategories.map(sub => (
                                                        <option key={sub._id} value={sub.slug}>
                                                            {sub.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.category && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dynamic Fields */}
                                        {selectedCategory && (
                                            <div className="mb-6">
                                                <div className="mb-4 pb-2 border-b border-gray-200">
                                                    <h3 className="text-lg font-medium text-gray-800">
                                                        {selectedParent?.name} - {subCategories.find(s => s.slug === selectedCategory)?.name || 'Category'} Specifications
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Please provide the following details about your item
                                                    </p>
                                                </div>
                                                {renderCategoryFields()}
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div className="mb-6">
                                            <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">
                                                Description *
                                            </label>
                                            <RTE
                                                name="description"
                                                control={control}
                                                label="Description:"
                                                defaultValue={getValues('description') || ''}
                                                placeholder="Describe the item's history, condition, and any notable details..."
                                            />
                                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                        </div>

                                        {/* Photos */}
                                        <div className="mb-6">
                                            <label htmlFor="photo-upload" className="block text-sm font-medium text-secondary mb-1">
                                                Attach Photos *
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    className="hidden"
                                                    id="photo-upload"
                                                />
                                                <label htmlFor="photo-upload" className="cursor-pointer">
                                                    <Image size={40} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-600">Browse photo(s) to upload</p>
                                                </label>
                                            </div>
                                            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos.message}</p>}

                                            {uploadedPhotos.length > 0 && (
                                                <PhotoGallery
                                                    photos={uploadedPhotos}
                                                    movePhoto={movePhoto}
                                                    removePhoto={removePhoto}
                                                />
                                            )}
                                        </div>

                                        {/* Documents */}
                                        <div className="mb-6">
                                            <label htmlFor="document-upload" className="block text-sm font-medium text-secondary mb-1">
                                                Attach Documents
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleDocumentUpload}
                                                    className="hidden"
                                                    id="document-upload"
                                                />
                                                <label htmlFor="document-upload" className="cursor-pointer">
                                                    <File size={40} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-600">Browse document(s) to upload</p>
                                                    <p className="text-sm text-secondary">Attach documents if you have any.</p>
                                                </label>
                                            </div>

                                            {uploadedDocuments.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {uploadedDocuments.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <span className="text-sm truncate">{doc.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index)}
                                                                className="text-red-500"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ==================== STEP 2: AUCTION DETAILS ==================== */}
                                {step === 2 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <Banknote size={20} className="mr-2" />
                                            Auction Details
                                        </h2>

                                        {/* Location & Video */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="location" className="block text-sm font-medium text-secondary mb-1">
                                                    Location
                                                </label>
                                                <div className="relative">
                                                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('location')}
                                                        id="location"
                                                        type="text"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="e.g., Altamira, Caracas, Venezuela"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="video" className="block text-sm font-medium text-secondary mb-1">
                                                    Video Link
                                                </label>
                                                <div className="relative">
                                                    <Youtube size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('video', {
                                                            pattern: {
                                                                value: /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
                                                                message: 'Please enter a valid YouTube URL'
                                                            }
                                                        })}
                                                        id="video"
                                                        type="url"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="YouTube video URL"
                                                    />
                                                </div>
                                                {errors.video && <p className="text-red-500 text-sm mt-1">{errors.video.message}</p>}
                                            </div>
                                        </div>

                                        <hr className="my-6" />

                                        {/* Auction Type */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-secondary mb-1">Auction Type *</label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { value: 'standard', label: 'Standard Auction' },
                                                    { value: 'reserve', label: 'Reserve Price Auction' },
                                                    { value: 'buy_now', label: 'Buy Now Auction' },
                                                ].map((type) => (
                                                    <label key={type.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            {...register('auctionType', { required: 'Auction type is required' })}
                                                            value={type.value}
                                                            className="mr-3"
                                                        />
                                                        <span>{type.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.auctionType && <p className="text-red-500 text-sm mt-1">{errors.auctionType.message}</p>}
                                        </div>

                                        {/* Show immediate start message for buy_now and giveaway */}
                                        {(watch('auctionType') === 'buy_now' || watch('auctionType') === 'giveaway') && (
                                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-green-700 flex items-center gap-2">
                                                    <Zap size={18} />
                                                    <span>This auction will start immediately upon creation.</span>
                                                </p>
                                            </div>
                                        )}

                                        {/* Allow Offers Toggle */}
                                        <div className="mb-6">
                                            <label className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        {...register('allowOffers')}
                                                        id="allowOffers"
                                                        className="sr-only"
                                                    />
                                                    <div className={`block w-14 h-8 rounded-full ${watch('allowOffers') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${watch('allowOffers') ? 'transform translate-x-6' : ''}`}></div>
                                                </div>
                                                <div className="ml-3">
                                                    <span className="font-medium text-primary">Allow Offers</span>
                                                    <p className="text-sm text-primary mt-1">
                                                        Enable buyers to make purchase offers during the auction
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        <hr className="my-6" />

                                        {/* Pricing */}
                                        {watch('auctionType') !== 'giveaway' && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    {(watch('auctionType') === 'standard' || watch('auctionType') === 'reserve') && (
                                                        <div>
                                                            <label htmlFor="startPrice" className="block text-sm font-medium text-secondary mb-1">Start Price *</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                                <input
                                                                    {...register('startPrice', {
                                                                        required: watch('auctionType') !== 'giveaway' ? 'Start price is required' : false,
                                                                        min: { value: 0, message: 'Price must be positive' }
                                                                    })}
                                                                    id="startPrice"
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                            {errors.startPrice && <p className="text-red-500 text-sm mt-1">{errors.startPrice.message}</p>}
                                                        </div>
                                                    )}

                                                    {(watch('auctionType') === 'standard' || watch('auctionType') === 'reserve') && (
                                                        <div>
                                                            <label htmlFor="bidIncrement" className="block text-sm font-medium text-secondary mb-1">Bid Increment *</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                                <input
                                                                    {...register('bidIncrement', {
                                                                        required: (watch('auctionType') === 'standard' || watch('auctionType') === 'reserve') ? 'Bid increment is required' : false,
                                                                        min: { value: 0, message: 'Increment must be positive' }
                                                                    })}
                                                                    id="bidIncrement"
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                            {errors.bidIncrement && <p className="text-red-500 text-sm mt-1">{errors.bidIncrement.message}</p>}
                                                        </div>
                                                    )}
                                                </div>

                                                {watch('auctionType') === 'reserve' && (
                                                    <div className="mb-6">
                                                        <label htmlFor="reservePrice" className="block text-sm font-medium text-secondary mb-1">Reserve Price *</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                            <input
                                                                {...register('reservePrice', {
                                                                    required: watch('auctionType') === 'reserve' ? 'Reserve price is required' : false,
                                                                    min: { value: 0, message: 'Price must be positive' },
                                                                    validate: value => {
                                                                        const startPrice = parseFloat(watch('startPrice') || 0);
                                                                        const reservePrice = parseFloat(value);
                                                                        return reservePrice >= startPrice || 'Reserve price must be greater than or equal to start price';
                                                                    }
                                                                })}
                                                                id="reservePrice"
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        {errors.reservePrice && <p className="text-red-500 text-sm mt-1">{errors.reservePrice.message}</p>}
                                                        <p className="text-sm text-secondary mt-1">Item will not sell if bids don't reach this price</p>
                                                    </div>
                                                )}

                                                {watch('auctionType') === 'buy_now' && (
                                                    <div className="mb-4">
                                                        <label htmlFor="buyNowPrice" className="block text-sm font-medium text-secondary mb-1">
                                                            Buy Now Price *
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                            <input
                                                                {...register('buyNowPrice', {
                                                                    required: watch('auctionType') === 'buy_now' ? 'Buy Now price is required' : false,
                                                                    min: { value: 0, message: 'Price must be positive' },
                                                                    validate: value => {
                                                                        const startPrice = parseFloat(watch('startPrice') || 0);
                                                                        const buyNowPrice = parseFloat(value);
                                                                        return buyNowPrice >= startPrice || 'Buy Now price must be greater than or equal to start price';
                                                                    }
                                                                })}
                                                                id="buyNowPrice"
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        {errors.buyNowPrice && <p className="text-red-500 text-sm mt-1">{errors.buyNowPrice.message}</p>}
                                                        <p className="text-sm text-secondary mt-1">
                                                            Buyers can purchase immediately at this price, ending the auction
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <hr className="my-6" />

                                        {/* Start Date & End Date */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="startDate" className="block text-sm font-medium text-secondary mb-1">
                                                    Start Date & Time *
                                                </label>
                                                <div className="relative">
                                                    <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('startDate', { required: 'Start date is required' })}
                                                        id="startDate"
                                                        type="datetime-local"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="endDate" className="block text-sm font-medium text-secondary mb-1">
                                                    End Date & Time *
                                                </label>
                                                <div className="relative">
                                                    <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('endDate', {
                                                            required: 'End date is required',
                                                            validate: {
                                                                afterStartDate: value => {
                                                                    const start = new Date(watch('startDate'));
                                                                    const end = new Date(value);
                                                                    return end > start || 'End date must be after start date';
                                                                }
                                                            }
                                                        })}
                                                        id="endDate"
                                                        type="datetime-local"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== STEP 3: REVIEW & SUBMIT ==================== */}
                                {step === 3 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <Settings size={20} className="mr-2" />
                                            Review & Submit
                                        </h2>

                                        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                                            <h3 className="font-medium text-lg mb-4 border-b pb-2">Auction Summary</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Item Details */}
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Item Details</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Item Name</p>
                                                                <p className="font-medium">{watch('title') || 'Not provided'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Category</p>
                                                                <p className="font-medium">
                                                                    {selectedParent?.name}
                                                                    {selectedCategory && ` / ${subCategories.find(s => s.slug === selectedCategory)?.name || selectedCategory}`}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Location</p>
                                                                <p className="font-medium">{watch('location') || 'Not specified'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {categoryFields.length > 0 && (
                                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                                            <h4 className="font-medium mb-3">Specifications</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {categoryFields.map((field) => {
                                                                    const value = watch(`specifications.${field.name}`);
                                                                    if (!value && value !== 0 && value !== false) return null;

                                                                    let displayValue = value;
                                                                    if (field.fieldType === 'boolean') {
                                                                        displayValue = value ? 'Yes' : 'No';
                                                                    } else if (field.fieldType === 'select' && field.options) {
                                                                        const option = field.options.find(opt => opt.value === value);
                                                                        displayValue = option?.label || value;
                                                                    }

                                                                    return (
                                                                        <div key={field.name}>
                                                                            <p className="text-xs text-secondary">{field.label}</p>
                                                                            <p className="font-medium">
                                                                                {displayValue}
                                                                                {field.unit && value && ` ${field.unit}`}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Auction Details */}
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Auction Details</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Auction Type</p>
                                                                <p className="font-medium">
                                                                    {watch('auctionType') === 'standard' && 'Standard Auction'}
                                                                    {watch('auctionType') === 'reserve' && 'Reserve Auction'}
                                                                    {watch('auctionType') === 'buy_now' && 'Buy Now Auction'}
                                                                    {watch('auctionType') === 'giveaway' && 'Free Giveaway'}
                                                                </p>
                                                            </div>
                                                            {watch('allowOffers') && (
                                                                <div>
                                                                    <p className="text-xs text-primary">Allow Offers</p>
                                                                    <p className="font-medium text-green-600">Yes</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs text-secondary">Start Date</p>
                                                                <p className="font-medium">
                                                                    {watch('startDate') ? new Date(watch('startDate')).toLocaleString() : 'Not provided'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">End Date</p>
                                                                <p className="font-medium">
                                                                    {watch('endDate') ? new Date(watch('endDate')).toLocaleString() : 'Not provided'}
                                                                </p>
                                                            </div>
                                                            {watch('video') && (
                                                                <div>
                                                                    <p className="text-xs text-secondary">Video</p>
                                                                    <p className="font-medium truncate">{watch('video')}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Media */}
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Media & Documents</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Photos</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {uploadedPhotos.length} uploaded
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Documents</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {uploadedDocuments.length} uploaded
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pricing */}
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Pricing</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Start Price</p>
                                                                <p className="font-medium">${watch('startPrice') || '0.00'}</p>
                                                            </div>

                                                            {watch('auctionType') === 'buy_now' && (
                                                                <div>
                                                                    <p className="text-xs text-secondary">Buy Now Price</p>
                                                                    <p className="font-medium text-blue-600">${watch('buyNowPrice') || '0.00'}</p>
                                                                </div>
                                                            )}

                                                            {watch('auctionType') === 'reserve' && (
                                                                <div>
                                                                    <p className="text-xs text-secondary">Reserve Price</p>
                                                                    <p className="font-medium text-orange-600">${watch('reservePrice') || '0.00'}</p>
                                                                </div>
                                                            )}

                                                            {watch('bidIncrement') > 0 && (
                                                                <div>
                                                                    <p className="text-xs text-secondary">Bid Increment</p>
                                                                    <p className="font-medium">${watch('bidIncrement')}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description Preview */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                                                <h4 className="font-medium text-black mb-3">Description Preview</h4>
                                                <div className="prose prose-lg max-w-none border rounded-lg p-4 bg-gray-50">
                                                    {watch('description') ? (
                                                        parse(watch('description'))
                                                    ) : (
                                                        <p className="text-gray-500 italic">No description provided</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="termsAgreed" className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    {...register('termsAgreed', { required: 'You must agree to the terms' })}
                                                    id="termsAgreed"
                                                    className="mt-1 mr-2"
                                                />
                                                <span className="text-sm font-medium text-secondary">
                                                    I agree to the terms and conditions and confirm that I have the right to sell this item
                                                </span>
                                            </label>
                                            {errors.termsAgreed && <p className="text-red-500 text-sm mt-1">{errors.termsAgreed.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8">
                                    {step > 0 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <ArrowLeft size={18} className="mr-2" />
                                            Previous
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                nextStep();
                                            }}
                                            className="flex items-center px-6 py-2 bg-black text-white hover:bg-black/80 rounded-lg transition-colors"
                                        >
                                            Next
                                            <ArrowRight size={18} className="ml-2" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="flex items-center px-6 py-2 bg-black text-white hover:bg-black/80 rounded-lg transition-colors"
                                        >
                                            <Gavel size={18} className="mr-2" />
                                            {isLoading ? 'Creating Auction...' : 'Create Auction'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </AdminContainer>
                </div>
            </section>
        </DndProvider>
    );
};

export default CreateAuction;