import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import parse from 'html-react-parser';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    FileText,
    Settings,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    X,
    Image,
    File,
    Clock,
    MapPin,
    Calendar,
    AlertCircle,
    Banknote,
    Gavel,
    Move,
    Users,
    User,
    Trash2,
    Loader
} from "lucide-react";
import { RTE, AdminContainer, AdminHeader, AdminSidebar } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance.js';
import { useNavigate, useParams } from 'react-router-dom';

// Drag and Drop item types
const ItemTypes = {
    PHOTO: 'photo',
};

// Draggable Photo Component
const DraggablePhoto = ({ photo, index, movePhoto, removePhoto, caption, onCaptionChange }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.PHOTO,
        item: { type: ItemTypes.PHOTO, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.PHOTO,
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            movePhoto(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    return (
        <div className="space-y-2">
            <div
                ref={ref}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    cursor: isDragging ? 'grabbing' : 'grab',
                }}
                className="relative group transition-all duration-200"
            >
                <img
                    src={photo.isExisting ? photo.url : URL.createObjectURL(photo.file)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-transparent hover:border-blue-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <Move size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                </div>
                <div className="absolute top-2 right-2 bg-blue-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                    {photo.isExisting ? 'Existing' : 'New'}
                </div>
                <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                >
                    <X size={14} />
                </button>
            </div>
            {/* <input
                type="text"
                placeholder="Add caption..."
                value={caption || ''}
                onChange={(e) => onCaptionChange(index, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-black"
            /> */}
        </div>
    );
};

// Photo Gallery Component
const PhotoGallery = ({ photos, movePhoto, removePhoto, captions, onCaptionChange }) => {
    return (
        <div className="mt-4">
            <p className="text-sm text-secondary mb-3">
                Drag and drop to reorder photos. The first image will be the main thumbnail.
                <span className="block text-xs text-gray-500 mt-1">
                    Blue badge indicates existing photos
                </span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                    <DraggablePhoto
                        key={photo.id}
                        photo={photo}
                        index={index}
                        movePhoto={movePhoto}
                        removePhoto={removePhoto}
                        caption={captions[index] || ''}
                        onCaptionChange={onCaptionChange}
                    />
                ))}
            </div>
        </div>
    );
};

// Available Auctions Component - Admin sees ALL auctions
const AvailableAuctions = ({ auctions, selectedAuctions, onToggleAuction, loading, sellers }) => {
    const [selectedSeller, setSelectedSeller] = useState('');
    const [filteredAuctions, setFilteredAuctions] = useState(auctions);

    // Filter auctions by seller
    useEffect(() => {
        if (selectedSeller) {
            setFilteredAuctions(auctions.filter(a => a.seller?._id === selectedSeller || a.seller === selectedSeller));
        } else {
            setFilteredAuctions(auctions);
        }
    }, [selectedSeller, auctions]);

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading auctions...</div>;
    }

    if (auctions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No auctions found in the system.</p>
                <p className="text-sm mt-2">Sellers need to create auctions first before they can be assigned to events.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Seller Filter for Admin */}
            <div className="mb-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Filter by Seller:</label>
                </div>
                <select
                    value={selectedSeller}
                    onChange={(e) => setSelectedSeller(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                    <option value="">All Sellers</option>
                    {sellers.map(seller => (
                        <option key={seller._id} value={seller._id}>
                            {seller.username} ({seller.firstName} {seller.lastName})
                        </option>
                    ))}
                </select>
                {selectedSeller && (
                    <button
                        onClick={() => setSelectedSeller('')}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        Clear Filter
                    </button>
                )}
                <span className="text-sm text-gray-500 ml-auto">
                    {selectedAuctions.length} auction(s) selected
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAuctions.map((auction) => {
                    const isSelected = selectedAuctions.some(id => id === auction._id);
                    return (
                        <div
                            key={auction._id}
                            onClick={() => onToggleAuction(auction._id)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <img
                                        src={auction.photos?.[0]?.url || ''}
                                        alt={auction.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{auction.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 flex-wrap">
                                        <span>${auction.currentPrice?.toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{auction.bidCount || 0} bids</span>
                                        <span>•</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${auction.status === 'active' ? 'bg-green-100 text-green-800' :
                                                auction.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {auction.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Seller: {auction.seller?.username || auction.sellerUsername || 'Unknown'}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {isSelected ? (
                                        <CheckCircle className="text-green-500" size={24} />
                                    ) : (
                                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredAuctions.length === 0 && selectedSeller && (
                <div className="text-center py-8 text-gray-500">
                    <p>No auctions found for this seller.</p>
                </div>
            )}
        </div>
    );
};

// UploadProgressModal Component
const UploadProgressModal = ({ isOpen, fileCount, isEdit = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <div className="flex items-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                    <h3 className="text-lg font-semibold">
                        {isEdit ? 'Updating Event' : 'Creating Event'}
                    </h3>
                </div>

                <div className="space-y-3">
                    <p className="text-gray-600">
                        {fileCount > 0
                            ? `We're uploading ${fileCount} file(s) to our secure cloud storage.`
                            : 'We\'re updating your event details.'
                        }
                    </p>

                    {fileCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                ⏳ <strong>Please be patient:</strong> Large files may take several minutes to upload depending on your internet speed.
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 text-center">
                        Do not close this window until the process is complete.
                    </p>
                </div>
            </div>
        </div>
    );
};

function EditEvent() {
    const [step, setStep] = useState(1);
    const [allPhotos, setAllPhotos] = useState([]);
    const [photoCaptions, setPhotoCaptions] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [documentCaptions, setDocumentCaptions] = useState([]);
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [removedPhotos, setRemovedPhotos] = useState([]);
    const [removedDocuments, setRemovedDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableAuctions, setAvailableAuctions] = useState([]);
    const [selectedAuctions, setSelectedAuctions] = useState([]);
    const [loadingAuctions, setLoadingAuctions] = useState(false);
    const [sellers, setSellers] = useState([]);
    const [loadingSellers, setLoadingSellers] = useState(false);
    const [event, setEvent] = useState(null);
    const { eventId } = useParams();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        getValues,
        control,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            title: '',
            description: '',
            location: '',
            eventDate: '',
            endDate: '',
        }
    });

    // Calculate if there are new files to upload
    const newPhotos = allPhotos.filter(photo => !photo.isExisting);
    const hasNewUploads = newPhotos.length > 0 || uploadedDocuments.length > 0;
    const totalNewFiles = newPhotos.length + uploadedDocuments.length;

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    };

    // Fetch event data
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/events/${eventId}`);

                if (data.success) {
                    const eventData = data.data.event;
                    setEvent(eventData);

                    // Set form values
                    const formData = {
                        title: eventData.title,
                        description: eventData.description,
                        location: eventData.location || '',
                        eventDate: formatDateForInput(eventData.eventDate),
                        endDate: eventData.endDate ? formatDateForInput(eventData.endDate) : '',
                    };

                    reset(formData);

                    // Initialize photos
                    const existingPhotosWithFlag = (eventData.photos || []).map(photo => ({
                        ...photo,
                        isExisting: true,
                        id: photo.publicId || photo._id,
                        url: photo.url
                    }));
                    setAllPhotos(existingPhotosWithFlag);

                    // Initialize captions for existing photos
                    const initialPhotoCaptions = (eventData.photos || []).map(photo => photo.caption || '');
                    setPhotoCaptions(initialPhotoCaptions);

                    // Initialize documents
                    setExistingDocuments(eventData.documents || []);
                    const initialDocCaptions = (eventData.documents || []).map(doc => doc.caption || '');
                    setDocumentCaptions(initialDocCaptions);

                    // Initialize selected auctions
                    setSelectedAuctions(eventData.auctions.map(a => a._id));

                    toast.success('Event data loaded successfully');
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Failed to load event data');
                navigate('/admin/events/all');
            } finally {
                setIsLoading(false);
            }
        };

        if (eventId) fetchEventData();
    }, [eventId, reset, navigate]);

    // Fetch all auctions and sellers
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingAuctions(true);
                setLoadingSellers(true);

                // Fetch all auctions
                const { data: auctionsData } = await axiosInstance.get('/api/v1/admin/auctions', {
                    params: { limit: 100 }
                });
                if (auctionsData.success) {
                    setAvailableAuctions(auctionsData.data.auctions);
                }

                // Fetch all sellers
                const { data: sellersData } = await axiosInstance.get('/api/v1/admin/users', {
                    params: { role: 'seller', limit: 100 }
                });
                if (sellersData.success) {
                    setSellers(sellersData.data.users);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoadingAuctions(false);
                setLoadingSellers(false);
            }
        };

        fetchData();
    }, []);

    const movePhoto = useCallback((dragIndex, hoverIndex) => {
        setAllPhotos(prevPhotos => {
            const updatedPhotos = [...prevPhotos];
            const [movedPhoto] = updatedPhotos.splice(dragIndex, 1);
            updatedPhotos.splice(hoverIndex, 0, movedPhoto);
            return updatedPhotos;
        });

        setPhotoCaptions(prevCaptions => {
            const updatedCaptions = [...prevCaptions];
            const [movedCaption] = updatedCaptions.splice(dragIndex, 1);
            updatedCaptions.splice(hoverIndex, 0, movedCaption);
            return updatedCaptions;
        });
    }, []);

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newPhotos = files.map(file => ({
            file,
            isExisting: false,
            id: `new-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
            _fileSignature: `${file.name}-${file.size}-${file.lastModified}`
        }));

        const existingSignatures = new Set(
            allPhotos.filter(p => !p.isExisting).map(p => p._fileSignature)
        );

        const uniqueNewPhotos = newPhotos.filter(photo =>
            !existingSignatures.has(photo._fileSignature)
        );

        if (uniqueNewPhotos.length === 0) {
            toast.error('Some photos are already added');
            return;
        }

        setAllPhotos(prev => [...uniqueNewPhotos, ...prev]);
        const newCaptions = [...photoCaptions];
        files.forEach(() => newCaptions.unshift(''));
        setPhotoCaptions(newCaptions);
        clearErrors('photos');
        e.target.value = '';
    };

    const removePhoto = (index) => {
        const photoToRemove = allPhotos[index];

        if (photoToRemove.isExisting) {
            setRemovedPhotos(prev => [...prev, photoToRemove.id]);
        }

        setAllPhotos(prev => prev.filter((_, i) => i !== index));
        const newCaptions = [...photoCaptions];
        newCaptions.splice(index, 1);
        setPhotoCaptions(newCaptions);

        if (allPhotos.length === 1) {
            setError('photos', {
                type: 'manual',
                message: 'At least one photo is required'
            });
        }
    };

    const handlePhotoCaptionChange = (index, value) => {
        const newCaptions = [...photoCaptions];
        newCaptions[index] = value;
        setPhotoCaptions(newCaptions);
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedDocuments([...uploadedDocuments, ...files]);
        const newCaptions = [...documentCaptions];
        files.forEach(() => newCaptions.push(''));
        setDocumentCaptions(newCaptions);
        e.target.value = '';
    };

    const removeDocument = (index, isExisting = false) => {
        if (isExisting) {
            const removedDoc = existingDocuments[index];
            setRemovedDocuments(prev => [...prev, removedDoc.publicId || removedDoc._id]);
            setExistingDocuments(existingDocuments.filter((_, i) => i !== index));

            const newCaptions = [...documentCaptions];
            newCaptions.splice(index, 1);
            setDocumentCaptions(newCaptions);
        } else {
            setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
            const newCaptions = [...documentCaptions];
            newCaptions.splice(existingDocuments.length + index, 1);
            setDocumentCaptions(newCaptions);
        }
    };

    const handleDocumentCaptionChange = (type, index, value) => {
        const newCaptions = [...documentCaptions];
        if (type === 'existing') {
            newCaptions[index] = value;
        } else {
            newCaptions[existingDocuments.length + index] = value;
        }
        setDocumentCaptions(newCaptions);
    };

    const toggleAuction = (auctionId) => {
        setSelectedAuctions(prev => {
            if (prev.includes(auctionId)) {
                return prev.filter(id => id !== auctionId);
            } else {
                return [...prev, auctionId];
            }
        });
    };

    const nextStep = async () => {
        let isValid = true;
        scrollTo({ top: 0, behavior: 'smooth' });

        if (step === 1) {
            const fieldsToValidate = ['title', 'description', 'eventDate'];
            const overallValidationPassed = await trigger(fieldsToValidate);

            if (!overallValidationPassed) {
                isValid = false;
            }

            if (allPhotos.length === 0) {
                setError('photos', {
                    type: 'manual',
                    message: 'At least one photo is required'
                });
                isValid = false;
            } else {
                clearErrors('photos');
            }
        }

        if (!isValid) return;
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
        scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateEventHandler = async (eventData) => {
        try {
            setIsSubmitting(true);

            const formData = new FormData();

            // Basic Info
            formData.append('title', eventData.title);
            formData.append('description', eventData.description);
            formData.append('location', eventData.location || '');
            formData.append('eventDate', new Date(eventData.eventDate).toISOString());
            if (eventData.endDate) {
                formData.append('endDate', new Date(eventData.endDate).toISOString());
            }

            // Selected auctions
            formData.append('auctionIds', JSON.stringify(selectedAuctions));

            // Removed photos and documents
            if (removedPhotos.length > 0) {
                formData.append('removedPhotos', JSON.stringify(removedPhotos));
            }

            if (removedDocuments.length > 0) {
                formData.append('removedDocuments', JSON.stringify(removedDocuments));
            }

            // Photo order
            const photoOrder = allPhotos.map(photo => ({
                id: photo.id,
                isExisting: photo.isExisting
            }));
            formData.append('photoOrder', JSON.stringify(photoOrder));

            // Photos with captions
            allPhotos.forEach((photo, index) => {
                formData.append('photoCaptions', photoCaptions[index] || '');
                if (!photo.isExisting && photo.file) {
                    formData.append('photos', photo.file);
                }
            });

            // Documents with captions
            // Existing documents - send their captions
            existingDocuments.forEach((doc, index) => {
                // The backend will handle updating captions for existing docs
                // We send existing document captions as a separate array
                formData.append('existingDocumentCaptions', documentCaptions[index] || '');
            });

            // New documents
            uploadedDocuments.forEach((doc, index) => {
                formData.append('documents', doc);
                formData.append('newDocumentCaptions', documentCaptions[existingDocuments.length + index] || '');
            });

            const { data } = await axiosInstance.put(
                `/api/v1/events/update/${eventId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (data.success) {
                toast.success('Event updated successfully!');
                navigate('/admin/events/all');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update event';
            toast.error(errorMessage);
            console.error('Update event error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            allPhotos.forEach(photo => {
                if (!photo.isExisting && photo.url && photo.url.startsWith('blob:')) {
                    URL.revokeObjectURL(photo.url);
                }
            });
        };
    }, []);

    if (isLoading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="pt-16 md:py-7 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />

                <UploadProgressModal
                    isOpen={isSubmitting && hasNewUploads}
                    fileCount={totalNewFiles}
                    isEdit={true}
                />

                <div className="w-full relative">
                    <AdminHeader />

                    <AdminContainer>
                        <div className="pt-16 md:py-7">
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => navigate('/admin/events/all')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className="text-3xl md:text-4xl font-bold">Edit Event (Admin)</h1>
                            </div>
                            <p className="text-gray-600 mb-8">Update event details and manage assigned auctions</p>

                            {/* Progress Steps */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    {['Event Info', 'Assign Auctions', 'Review & Submit'].map((label, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > index + 1 ? 'bg-green-500 text-white' :
                                                    step === index + 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {step > index + 1 ? <CheckCircle size={20} /> : index + 1}
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

                            <form onSubmit={handleSubmit(updateEventHandler)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                                {/* Step 1: Event Information */}
                                {step === 1 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <Calendar size={20} className="mr-2" />
                                            Event Details
                                        </h2>

                                        <div className="grid grid-cols-1 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-secondary mb-1">
                                                    Event Title *
                                                </label>
                                                <input
                                                    {...register('title', { required: 'Event title is required' })}
                                                    id="title"
                                                    type="text"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="e.g., Summer Classic Car Auction 2025"
                                                />
                                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">
                                                Description *
                                            </label>
                                            <RTE
                                                name="description"
                                                control={control}
                                                label="Description:"
                                                defaultValue={getValues('description') || ''}
                                                onBlur={(value) => {
                                                    setValue('description', value, { shouldValidate: true });
                                                }}
                                            />
                                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                        </div>

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
                                                        placeholder="e.g., Online, New York, USA"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="eventDate" className="block text-sm font-medium text-secondary mb-1">
                                                    Event Date & Time *
                                                </label>
                                                <div className="relative">
                                                    <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('eventDate', { required: 'Event date is required' })}
                                                        id="eventDate"
                                                        type="datetime-local"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="endDate" className="block text-sm font-medium text-secondary mb-1">
                                                End Date & Time (Optional)
                                            </label>
                                            <div className="relative">
                                                <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register('endDate')}
                                                    id="endDate"
                                                    type="datetime-local"
                                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                />
                                            </div>
                                            <p className="text-sm text-secondary mt-1">If not provided, event ends on the event date</p>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="photo-upload" className="block text-sm font-medium text-secondary mb-1">
                                                Event Photos *
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
                                                    <p className="text-sm text-secondary">Upload images for your event banner</p>
                                                </label>
                                            </div>
                                            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos.message}</p>}

                                            {allPhotos.length > 0 && (
                                                <PhotoGallery
                                                    photos={allPhotos}
                                                    movePhoto={movePhoto}
                                                    removePhoto={removePhoto}
                                                    captions={photoCaptions}
                                                    onCaptionChange={handlePhotoCaptionChange}
                                                />
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="document-upload" className="block text-sm font-medium text-secondary mb-1">
                                                Attach Documents (Optional)
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
                                                    <p className="text-sm text-secondary">Attach event brochures, schedules, etc.</p>
                                                </label>
                                            </div>

                                            {/* Existing Documents */}
                                            {existingDocuments.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-secondary mb-2">Existing Documents:</p>
                                                    <div className="space-y-2">
                                                        {existingDocuments.map((doc, index) => (
                                                            <div key={`existing-doc-${index}`} className="bg-gray-50 p-3 rounded-lg">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium truncate">{doc.filename || doc.originalName}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeDocument(index, true)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                                {/* <input
                                                                    type="text"
                                                                    placeholder="Add document caption..."
                                                                    value={documentCaptions[index] || ''}
                                                                    onChange={(e) => handleDocumentCaptionChange('existing', index, e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                /> */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Documents */}
                                            {uploadedDocuments.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-secondary mb-2">New Documents:</p>
                                                    <div className="space-y-2">
                                                        {uploadedDocuments.map((doc, index) => (
                                                            <div key={`new-doc-${index}`} className="bg-gray-50 p-3 rounded-lg">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium truncate">{doc.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeDocument(index, false)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                                {/* <input
                                                                    type="text"
                                                                    placeholder="Add document caption..."
                                                                    value={documentCaptions[existingDocuments.length + index] || ''}
                                                                    onChange={(e) => handleDocumentCaptionChange('new', index, e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                /> */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Assign Auctions */}
                                {step === 2 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <Gavel size={20} className="mr-2" />
                                            Assign Auctions to Event
                                        </h2>

                                        <div className="mb-4">
                                            <p className="text-gray-600">
                                                Select the auctions you want to include in this event.
                                                As an admin, you can see and assign auctions from all sellers.
                                            </p>
                                            <p className="text-sm text-secondary mt-2">
                                                {selectedAuctions.length} auction(s) selected
                                            </p>
                                        </div>

                                        <AvailableAuctions
                                            auctions={availableAuctions}
                                            selectedAuctions={selectedAuctions}
                                            onToggleAuction={toggleAuction}
                                            loading={loadingAuctions}
                                            sellers={sellers}
                                        />
                                    </div>
                                )}

                                {/* Step 3: Review & Submit */}
                                {step === 3 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <Settings size={20} className="mr-2" />
                                            Review & Submit
                                        </h2>

                                        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                                            <h3 className="font-medium text-lg mb-4 border-b pb-2">Event Summary</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Event Details</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Title</p>
                                                                <p className="font-medium">{watch('title') || 'Not provided'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Location</p>
                                                                <p className="font-medium">{watch('location') || 'Not specified'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Event Date</p>
                                                                <p className="font-medium">
                                                                    {watch('eventDate') ? new Date(watch('eventDate')).toLocaleString() : 'Not provided'}
                                                                </p>
                                                            </div>
                                                            {watch('endDate') && (
                                                                <div>
                                                                    <p className="text-xs text-secondary">End Date</p>
                                                                    <p className="font-medium">
                                                                        {new Date(watch('endDate')).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Media & Documents</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Total Photos</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {allPhotos.length} photos
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Existing Photos</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {allPhotos.filter(p => p.isExisting).length} photos
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">New Photos</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {allPhotos.filter(p => !p.isExisting).length} uploaded
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Documents</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {existingDocuments.length + uploadedDocuments.length} total
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Assigned Auctions</h4>
                                                        {selectedAuctions.length > 0 ? (
                                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                                {availableAuctions
                                                                    .filter(a => selectedAuctions.includes(a._id))
                                                                    .map(auction => (
                                                                        <div key={auction._id} className="flex items-center justify-between border-b pb-2">
                                                                            <div className="flex-1 min-w-0">
                                                                                <span className="text-sm truncate block">{auction.title}</span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    Seller: {auction.seller?.username || auction.sellerUsername || 'Unknown'}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-sm text-green-600 font-medium ml-2">
                                                                                ${auction.currentPrice?.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-sm">No auctions assigned to this event</p>
                                                        )}
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Description Preview</h4>
                                                        <div className="prose prose-lg max-w-none border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                                                            {watch('description') ? (
                                                                parse(watch('description'))
                                                            ) : (
                                                                <p className="text-gray-500 italic">No description provided</p>
                                                            )}
                                                        </div>
                                                    </div>
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
                                                    I confirm that the information provided is accurate and I have the right to update this event
                                                </span>
                                            </label>
                                            {errors.termsAgreed && <p className="text-red-500 text-sm mt-1">{errors.termsAgreed.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8">
                                    {step > 1 ? (
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
                                            className="flex items-center px-6 py-2 bg-[#C59D55] text-white hover:bg-[#C59D55]/90 rounded-lg transition-colors"
                                        >
                                            Next
                                            <ArrowRight size={18} className="ml-2" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center px-6 py-2 bg-[#C59D55] text-white hover:bg-[#C59D55]/90 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Calendar size={18} className="mr-2" />
                                            {isSubmitting ? 'Updating Event...' : 'Update Event'}
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
}

export default EditEvent;