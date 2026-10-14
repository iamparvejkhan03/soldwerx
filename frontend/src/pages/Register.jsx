import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff, User, Phone, ChevronDown, Gavel, Store,
} from 'lucide-react';
import { darkLogo } from '../assets';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import useCountryStates from '../hooks/useCountryStates';
import { loadStripe } from '@stripe/stripe-js';
import {
    useStripe, useElements, CardElement, Elements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ---- Card Section ----
const CardSection = () => (
    <div className="space-y-4 border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800">
            Payment Information <span className="text-red-600">*</span>
        </h3>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Card Information
            </label>
            <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#1f2937',
                                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: { color: '#fa755a', iconColor: '#fa755a' },
                        },
                        hidePostalCode: true,
                    }}
                />
            </div>
        </div>
    </div>
);

// ---- Main Register ----
const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [userType, setUserType] = useState('bidder');
    const navigate = useNavigate();
    const { setUser, user } = useAuth();
    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);

    const stripe = useStripe();
    const elements = useElements();
    const hasCompleted = useRef(false);

    const {
        register, handleSubmit, watch,
        formState: { errors }, setValue,
    } = useForm({
        defaultValues: {
            email: '', phone: '', password: '', confirmPassword: '',
            username: '', firstName: '', lastName: '', country: '',
            userType: 'bidder', cardSaveConsent: false, termsConditions: false,
        },
    });

    const password = watch('password');

    // Fetch countries
    useEffect(() => {
        (async () => setCountries(await countriesAPI()))();
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate(`/${user.userType}/profile`);
    }, [user, navigate]);

    // ---- Handle 3DS return ----
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const setupIntentId = params.get('setup_intent');
        const setupIntentClientSecret = params.get('setup_intent_client_secret');
        const redirectStatus = params.get('redirect_status');

        if (!setupIntentId || !stripe || hasCompleted.current) return;

        hasCompleted.current = true;
        setIsCompleting(true);

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        const registrationToken = sessionStorage.getItem('registrationToken');
        if (!registrationToken) {
            toast.error('Registration session expired. Please try again.');
            setIsCompleting(false);
            return;
        }

        if (redirectStatus !== 'succeeded') {
            toast.error('Card verification failed. Please try a different card.');
            sessionStorage.removeItem('registrationToken');
            setIsCompleting(false);
            return;
        }

        (async () => {
            try {
                const { setupIntent, error } = await stripe.retrieveSetupIntent(
                    setupIntentClientSecret
                );
                if (error) throw new Error(error.message);
                if (setupIntent.status !== 'succeeded') {
                    throw new Error(`Card verification status: ${setupIntent.status}`);
                }
                const ok = await finishRegistration(registrationToken, setupIntent.id);
                if (!ok) setIsCompleting(false);
            } catch (err) {
                toast.error(err.message || 'Failed to complete registration');
                setIsCompleting(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stripe]);

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setValue('userType', type);
    };

    // ---- Finalize: exchange registrationToken for real auth tokens ----
    const finishRegistration = async (registrationToken, setupIntentId) => {
        const toastId = toast.loading('Completing your registration…');

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/complete-registration`,
                { registrationToken, setupIntentId },
                { withCredentials: true }
            );

            const data = res.data;
            sessionStorage.removeItem('registrationToken');

            const { accessToken, refreshToken, user: userData } = data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success(data.message || 'Registration successful!', { id: toastId });

            const path =
                userData.userType === 'seller'
                    ? '/seller/dashboard'
                    : '/bidder/dashboard';
            navigate(path);
            return true;
        } catch (err) {
            toast.error(
                err?.response?.data?.message || 'Failed to complete registration',
                { id: toastId }
            );
            return false;
        }
    };

    // ---- Submit ----
    const onSubmit = async (data) => {
        setIsLoading(true);

        const toastId = toast.loading(
            'Registering your account… this may take a few seconds.'
        );

        try {
            let paymentMethodId = null;

            // Bidder: create payment method client-side
            if (data.userType === 'bidder') {
                if (!stripe || !elements) {
                    toast.error('Payment form not ready. Please wait a moment.', { id: toastId });
                    setIsLoading(false);
                    return;
                }
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    toast.error('Card element not found', { id: toastId });
                    setIsLoading(false);
                    return;
                }

                const { error, paymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: {
                        name: `${data.firstName} ${data.lastName}`,
                        email: data.email,
                    },
                });

                if (error) {
                    toast.error(error.message, { id: toastId });
                    setIsLoading(false);
                    return;
                }
                paymentMethodId = paymentMethod.id;
            }

            // Build FormData
            const fd = new FormData();
            fd.append('firstName', data.firstName);
            fd.append('lastName', data.lastName);
            fd.append('email', data.email);
            fd.append('phone', data.phone);
            fd.append('password', data.password);
            fd.append('username', data.username);
            fd.append('countryCode', data.country);
            fd.append(
                'countryName',
                countries.find((c) => c.code === data.country)?.name || data.country
            );
            fd.append('userType', data.userType);
            fd.append('country', data.country);

            if (paymentMethodId) {
                fd.append('paymentMethodId', paymentMethodId);
                fd.append('cardSaveConsent', 'true');
            }

            // POST /register
            const response = await axios.post(
                `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/register`,
                fd,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            const resData = response.data;

            // ---- 3DS path ----
            if (resData.requiresAction) {
                sessionStorage.setItem('registrationToken', resData.registrationToken);

                const { error: confirmError, setupIntent } =
                    await stripe.confirmCardSetup(resData.clientSecret, {
                        payment_method: paymentMethodId,
                    });

                if (confirmError) {
                    toast.error(confirmError.message, { id: toastId });
                    setIsLoading(false);
                    return;
                }

                // 3DS redirect
                if (
                    setupIntent?.status === 'requires_action' &&
                    setupIntent?.next_action?.redirect_to_url?.url
                ) {
                    toast.dismiss(toastId);
                    window.location.href =
                        setupIntent.next_action.redirect_to_url.url;
                    return; // browser navigates away
                }

                // No redirect, already succeeded
                if (setupIntent?.status === 'succeeded') {
                    toast.dismiss(toastId);
                    const ok = await finishRegistration(resData.registrationToken, setupIntent.id);
                    if (!ok) setIsLoading(false);
                    return;
                }

                toast.error('Card verification failed. Please try again.', { id: toastId });
                setIsLoading(false);
                return;
            }

            // ---- Non-3DS path (sellers or cards not requiring 3DS) ----
            const { accessToken, refreshToken, user: userData } = resData.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            const path =
                userData.userType === 'seller'
                    ? '/seller/dashboard'
                    : '/bidder/dashboard';

            toast.success(resData.message || 'Registration successful!', { id: toastId });

            navigate(path);
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Registration failed',
                { id: toastId }
            );
            console.error('Registration error:', error);
            setIsLoading(false);
        }
    };

    // ---- Render ----
    return (
        <>
            {isCompleting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5B51B] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Verifying your card
                        </h3>
                        <p className="text-gray-600">
                            Please wait while we complete your registration...
                        </p>
                    </div>
                </div>
            )}

            <div className="min-h-screen pt-32 pb-16 bg-[#F5B51B]/10 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
                    <div className="pt-8 text-center flex flex-col items-center gap-3">
                        <img src={darkLogo} alt="logo" className="h-12" />
                        <p className="text-black text-lg">Create your account</p>
                    </div>

                    <div className="p-5 sm:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Account Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Account Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                size={20}
                                                className="absolute left-3 top-3.5 text-gray-400"
                                            />
                                            <input
                                                type="email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address',
                                                    },
                                                })}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 outline-none"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone *
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                size={20}
                                                className="absolute left-3 top-3.5 text-gray-400"
                                            />
                                            <input
                                                type="tel"
                                                {...register('phone', {
                                                    required: 'Phone is required',
                                                    pattern: {
                                                        value: /^[\d+\s()-]{10,15}$/,
                                                        message: 'Enter a valid phone number',
                                                    },
                                                })}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 outline-none"
                                                placeholder="+11234567890"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={20}
                                                className="absolute left-3 top-3.5 text-gray-400"
                                            />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                {...register('password', {
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Min 6 characters',
                                                    },
                                                })}
                                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 outline-none"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-3 top-3.5 text-gray-400"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password *
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={20}
                                                className="absolute left-3 top-3.5 text-gray-400"
                                            />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                {...register('confirmPassword', {
                                                    required: 'Please confirm your password',
                                                    validate: (v) =>
                                                        v === password || 'Passwords do not match',
                                                })}
                                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] focus:ring-2 focus:ring-[#F5B51B]/20 outline-none"
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute right-3 top-3.5 text-gray-400"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={20} />
                                                ) : (
                                                    <Eye size={20} />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('firstName', {
                                                required: 'First name is required',
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] outline-none"
                                        />
                                        {errors.firstName && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.firstName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('lastName', {
                                                required: 'Last name is required',
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] outline-none"
                                        />
                                        {errors.lastName && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.lastName.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Username *
                                        </label>
                                        <div className="relative">
                                            <User
                                                size={20}
                                                className="absolute left-3 top-3.5 text-gray-400"
                                            />
                                            <input
                                                type="text"
                                                {...register('username', {
                                                    required: 'Username is required',
                                                    minLength: { value: 3, message: 'Min 3 characters' },
                                                    pattern: {
                                                        value: /^[a-zA-Z0-9_]+$/,
                                                        message: 'Letters, numbers, underscore only',
                                                    },
                                                })}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] outline-none"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country of residence *
                                        </label>
                                        <div className="relative">
                                            <select
                                                {...register('country', {
                                                    required: 'Country is required',
                                                })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#F5B51B] outline-none appearance-none"
                                            >
                                                <option value="">Select country</option>
                                                {countries.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={20}
                                                className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                                            />
                                        </div>
                                        {errors.country && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.country.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User Type */}
                            <div className="border-t pt-6">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                                    <User size={20} /> <span>User Type</span>
                                </label>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <label
                                        className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer ${userType === 'bidder'
                                            ? 'border-[#F5B51B] bg-[#F5B51B]/5'
                                            : 'border-gray-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value="bidder"
                                            {...register('userType', { required: true })}
                                            className="hidden"
                                            onChange={() => handleUserTypeChange('bidder')}
                                        />
                                        <Gavel
                                            size={40}
                                            className={`p-2 rounded ${userType === 'bidder'
                                                ? 'bg-[#F5B51B] text-black'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}
                                        />
                                        <div>
                                            <p className="text-sm font-semibold">I'm a bidder</p>
                                            <p className="text-sm text-gray-600">
                                                I want to bid on listings.
                                            </p>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer ${userType === 'seller'
                                            ? 'border-[#F5B51B] bg-[#F5B51B]/5'
                                            : 'border-gray-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value="seller"
                                            {...register('userType', { required: true })}
                                            className="hidden"
                                            onChange={() => handleUserTypeChange('seller')}
                                        />
                                        <Store
                                            size={40}
                                            className={`p-2 rounded ${userType === 'seller'
                                                ? 'bg-[#F5B51B] text-black'
                                                : 'bg-gray-200 text-gray-600'
                                                }`}
                                        />
                                        <div>
                                            <p className="text-sm font-semibold">I'm a seller</p>
                                            <p className="text-sm text-gray-600">
                                                I want to list items on the platform.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Card + Consent for bidders */}
                            {userType === 'bidder' && (
                                <>
                                    <CardSection />

                                    <div className="">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                {...register('cardSaveConsent', {
                                                    required:
                                                        'You must consent to card storage and off-session charges to register as a bidder.',
                                                })}
                                                className="mt-1"
                                            />
                                            <p className="text-sm text-gray-600">
                                                I authorize SoldWerX to save this card with Stripe and
                                                to automatically charge it a <strong>5% deposit</strong>{' '}
                                                (capped at <strong>$5,000</strong>) <em>off-session</em>{' '}
                                                if I win an auction. The deposit will be credited
                                                toward my final balance.
                                            </p>
                                        </label>
                                        {errors.cardSaveConsent && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.cardSaveConsent.message}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Terms */}
                            <div className="border-t pt-4">
                                <label className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        {...register('termsConditions', {
                                            required:
                                                'Accepting terms of use is required for registration.',
                                        })}
                                        className="mt-1"
                                    />
                                    <p className="text-sm text-gray-600">
                                        By registering, I agree to SoldWerX's{' '}
                                        <Link
                                            to="/terms-of-use"
                                            className="text-[#F5B51B] underline"
                                        >
                                            Terms of Use
                                        </Link>{' '}
                                        and{' '}
                                        <Link
                                            to="/privacy-policy"
                                            className="text-[#F5B51B] underline"
                                        >
                                            Privacy Policy
                                        </Link>
                                        .
                                    </p>
                                </label>
                                {errors.termsConditions && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.termsConditions.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#F5B51B] hover:bg-[#e7a500] text-black py-3 px-4 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <p className="text-gray-600 text-sm">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-[#F5B51B] hover:text-[#e7a500] font-semibold underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white px-4 pb-4 text-center">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} SoldWerX. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

const RegisterWithStripe = () => (
    <Elements stripe={stripePromise}>
        <Register />
    </Elements>
);

export default RegisterWithStripe;