import { useState, useEffect } from "react";
import {
    BidderContainer,
    BidderHeader,
    BidderSidebar,
    LoadingSpinner,
    AccountInactiveBanner,
} from "../../components";
import {
    CheckCircle,
    Clock,
    XCircle,
    Banknote,
    FileText,
    Eye,
    Calendar,
    CreditCard,
    ChevronRight,
    Loader,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

function BidderPayments() {
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/v1/payments/bidder");
            if (response.data.success) {
                setPayments(response.data.data.payments);
                setStats(response.data.data.statistics);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentDetails = async (paymentId) => {
        // We can either fetch a single payment if needed, or just use the already loaded data
        // For simplicity, we'll just find the payment in the list
        const payment = payments.find(p => p._id === paymentId);
        if (payment) {
            setSelectedPayment(payment);
            setShowDetailsModal(true);
        } else {
            toast.error("Payment not found");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 6,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { class: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending" },
            processing: { class: "bg-blue-100 text-blue-800", icon: Clock, text: "Processing" },
            completed: { class: "bg-green-100 text-green-800", icon: CheckCircle, text: "Completed" },
            failed: { class: "bg-red-100 text-red-800", icon: XCircle, text: "Failed" },
            cancelled: { class: "bg-gray-100 text-gray-800", icon: XCircle, text: "Cancelled" },
        };
        const { class: className, icon: Icon, text } = config[status] || config.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${className}`}>
                <Icon size={12} />
                {text}
            </span>
        );
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <BidderSidebar />
            <div className="w-full relative">
                <BidderHeader />
                <BidderContainer>
                    <AccountInactiveBanner />
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">My Payments</h2>
                        <p className="text-secondary text-lg">Track your payment history and status</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Paid</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {stats.formattedTotalPaid || "$0"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.countCompleted || 0} completed payments
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Payments</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                        {stats.formattedTotalPending || "$0"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.countPending || 0} pending payments
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock size={24} className="text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Spend</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {stats.formattedTotalAll || "$0"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        All payments
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Banknote size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payments List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Payment History</h3>
                        </div>

                        {payments.length === 0 ? (
                            <div className="p-12 text-center">
                                <Banknote size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No payments yet</h3>
                                <p className="text-gray-500">Your payment history will appear here once you make a purchase</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {payments.map(payment => (
                                    <div key={payment._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900 text-lg">
                                                        {payment.auction?.title || "Unknown Auction"}
                                                    </h4>
                                                    {getStatusBadge(payment.status)}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(payment.createdAt)}
                                                    </span>
                                                    {payment.transactionReference && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText size={14} />
                                                            Ref: {payment.transactionReference}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard size={14} />
                                                        {payment.paymentMethod || "Bank Transfer"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary">
                                                        {formatCurrency(payment.totalAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Bid: {formatCurrency(payment.bidAmount)}
                                                        {payment.commissionAmount > 0 && ` + fee`}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => fetchPaymentDetails(payment._id)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {payment.status === 'failed' && payment.notes && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs text-red-600">
                                                    <span className="font-semibold">Note:</span> {payment.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Details Modal */}
                    {showDetailsModal && selectedPayment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedPayment.auction?.title}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <XCircle size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Status Banner */}
                                    <div className={`p-4 rounded-lg ${selectedPayment.status === 'completed' ? 'bg-green-50 border border-green-200' :
                                            selectedPayment.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                                                selectedPayment.status === 'failed' ? 'bg-red-50 border border-red-200' :
                                                    'bg-blue-50 border border-blue-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            {selectedPayment.status === 'completed' && <CheckCircle className="text-green-600" size={24} />}
                                            {selectedPayment.status === 'pending' && <Clock className="text-yellow-600" size={24} />}
                                            {selectedPayment.status === 'failed' && <XCircle className="text-red-600" size={24} />}
                                            {selectedPayment.status === 'processing' && <Clock className="text-blue-600" size={24} />}
                                            <div>
                                                <p className="font-semibold capitalize">{selectedPayment.status} Payment</p>
                                                <p className="text-sm">
                                                    {selectedPayment.status === 'completed' && `Paid on ${formatDate(selectedPayment.completedAt)}`}
                                                    {selectedPayment.status === 'pending' && 'Awaiting confirmation by admin'}
                                                    {selectedPayment.status === 'failed' && selectedPayment.notes}
                                                    {selectedPayment.status === 'processing' && 'Your payment is being verified'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auction Details */}
                                    <div className="bg-gray-50 rounded-lg p-5">
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard size={18} className="text-primary" />
                                            Auction Information
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Auction Title</p>
                                                <p className="font-medium">{selectedPayment.auction?.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">End Date</p>
                                                <p className="font-medium">{formatDate(selectedPayment.auction?.endDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Final Price</p>
                                                <p className="font-medium text-green-600">
                                                    {formatCurrency(selectedPayment.auction?.finalPrice || selectedPayment.auction?.currentPrice)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Link
                                                to={`/auction/${selectedPayment.auction?._id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                                            >
                                                View Auction <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Financial Breakdown */}
                                    <div className="bg-gray-50 rounded-lg p-5">
                                        <h4 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h4>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-gray-600">Bid Amount:</span>
                                                <span className="font-medium">{formatCurrency(selectedPayment.bidAmount)}</span>
                                            </div>
                                            {selectedPayment.commissionAmount > 0 && (
                                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                    <span className="text-gray-600">Platform Fee:</span>
                                                    <span className="font-medium text-blue-600">{formatCurrency(selectedPayment.commissionAmount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center py-2 text-lg">
                                                <span className="font-semibold">Total Amount Paid:</span>
                                                <span className="font-bold text-primary">{formatCurrency(selectedPayment.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Reference & Proof */}
                                    {selectedPayment.transactionReference && (
                                        <div className="bg-gray-50 rounded-lg p-5">
                                            <h4 className="font-semibold text-gray-900 mb-4">Transaction Details</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Reference:</span>
                                                    <span className="font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">
                                                        {selectedPayment.transactionReference}
                                                    </span>
                                                </div>
                                                {selectedPayment.completedAt && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Payment Date:</span>
                                                        <span className="font-medium">{formatDateTime(selectedPayment.completedAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Proof of Payment Uploads */}
                                    {selectedPayment.proofOfPayment && selectedPayment.proofOfPayment.length > 0 && (
                                        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                <FileText size={18} />
                                                Proof of Payment
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedPayment.proofOfPayment.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                                                        <span className="text-sm text-blue-800">{file.originalName}</span>
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-blue-700 hover:underline text-sm"
                                                        >
                                                            View
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Notes (if any) */}
                                    {selectedPayment.notes && (
                                        <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                                            <h4 className="font-semibold text-yellow-900 mb-2">Admin Note</h4>
                                            <p className="text-yellow-800">{selectedPayment.notes}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Close
                                        </button>

                                        {selectedPayment.status === 'pending' && (
                                            <Link
                                                to={`/auction/${selectedPayment.auction?._id}`}
                                                className="flex-1 text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                View Auction
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default BidderPayments;