import { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const CardPaymentModal = ({ isOpen, onClose, auction, clientSecret, paymentIntentId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setProcessing(true);
        setError('');

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        if (error) { 
            setError(error.message);
            toast.error(error.message);
            setProcessing(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                await axiosInstance.post('/api/v1/payments/confirm-winner-payment', {
                    paymentIntentId: paymentIntent.id
                });
                toast.success('Payment successful!');
                onSuccess();
                onClose();
            } catch (err) {
                toast.error('Payment succeeded but could not update status. Please contact support.');
                onSuccess();
                onClose();
            }
        } else {
            toast.info('Payment is pending confirmation.');
        }
        setProcessing(false);
    };

    if (!isOpen) return null;

    if (!stripe || !elements) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center">
                    <Loader className="animate-spin h-8 w-8 mx-auto text-primary" />
                    <p className="mt-4 text-gray-600">Loading payment form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard size={20} />
                        Pay with Card
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Amount to pay:</p>
                        <p className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                (auction.finalPrice || auction.finalBid || auction.winningBid || 0) + (auction.buyerFeeAmount || 0) + (auction.taxAmount || 0)
                            )}
                        </p>
                        <p className="text-xs text-gray-500">Includes {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(auction.buyerFeeAmount || 0)} buyer fee and {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(auction.taxAmount || 0)} tax</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="border border-gray-300 rounded-lg p-3">
                            <CardElement options={{ hidePostalCode: true }} />
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={!stripe || processing}
                            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            {processing ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5" />
                                    Processing...
                                </>
                            ) : (
                                'Pay Now'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CardPaymentModal;