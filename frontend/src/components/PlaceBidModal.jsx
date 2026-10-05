import { useEffect, useState } from "react";
import { X, Gavel, Banknote } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { createPortal } from "react-dom";

const PlaceBidModal = ({
    isOpen,
    onClose,
    onConfirm,
    auction,
    bidAmount,
    loading = false,
}) => {
    const [amount, setAmount] = useState("");
    const [commissionType, setCommissionType] = useState("percentage");
    const [commissionValue, setCommissionValue] = useState(0);
    const [serviceFee, setServiceFee] = useState(0);

    // Seed input when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount(bidAmount != null && bidAmount !== "" ? String(bidAmount) : "");
        }
    }, [isOpen, bidAmount]);

    // Fetch commission settings once per open
    useEffect(() => {
        if (!isOpen) return;

        const fetchCommission = async () => {
            try {
                const { data } = await axiosInstance.get("/api/v1/commissions");
                const commission = data?.data?.commission;
                if (!commission) return;

                setCommissionType(commission.buyerType || commission.commissionType || "percentage");
                setCommissionValue(commission.buyerValue ?? commission.commissionValue ?? 0);
            } catch (error) {
                console.error("Failed to fetch commission:", error);
            }
        };

        fetchCommission();
    }, [isOpen]);

    // Recalculate fee client-side as user types
    useEffect(() => {
        const price = Number(amount) || 0;
        if (commissionType === "fixed") {
            setServiceFee(Number(commissionValue));
        } else {
            setServiceFee((price * Number(commissionValue)) / 100);
        }
    }, [amount, commissionType, commissionValue]);

    if (!isOpen) return null;

    const formatUSD = (value) => {
        if (!value && value !== 0) return "$0";
        return `$${Number(value).toLocaleString("en-US")}`;
    };

    const minBid =
        auction?.bidCount > 0
            ? auction?.currentPrice + auction?.bidIncrement
            : auction?.startPrice;

    const total = Number(amount || 0) + Number(serviceFee);

    const isInvalidBid =
        !amount || isNaN(parseFloat(amount)) || parseFloat(amount) < minBid;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isInvalidBid) return;
        onConfirm?.(amount);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center py-4 px-6 md:pt-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Place your bid
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                        disabled={loading}
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 pt-1">

                    {/* Bid Amount Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Bid Amount
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Banknote className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`Bid $${minBid?.toLocaleString()} or higher`}
                                min={minBid}
                                step="any"
                                autoFocus
                                required
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                            Minimum bid: {formatUSD(minBid)}
                        </p>
                    </div>

                    {/* Fee Breakdown */}
                    {amount && !isInvalidBid && (
                        <div className="bg-gray-50 rounded-lg mb-6 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span className="text-sm">Bid Amount</span>
                                <span>{formatUSD(amount)}</span>
                            </div>

                            <div className="flex justify-between text-gray-700">
                                <span className="text-sm">
                                    Buyer's Premium (
                                    {commissionType === "percentage"
                                        ? `${commissionValue}%`
                                        : formatUSD(commissionValue)}
                                    )
                                </span>
                                <span>{formatUSD(serviceFee)}</span>
                            </div>

                            <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                                <span className="text-sm">Total Payable</span>
                                <span>{formatUSD(total)}</span>
                            </div>

                            <p className="text-xs text-gray-500 text-center pt-1">
                                Note: buyer's premium is applied on the winning bid amount.
                            </p>
                        </div>
                    )}

                    {/* Info text */}
                    {/* <p className="text-sm text-gray-600 mb-6">
                        For more info,{" "}
                        <a href="/faqs" className="text-blue-600 hover:text-blue-800 underline">
                            read about FAQs
                        </a>{" "}
                        or{" "}
                        <a href="/contact" className="text-blue-600 hover:text-blue-800 underline">
                            contact us
                        </a>{" "}
                        with any questions.
                    </p> */}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 order-2 md:order-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || isInvalidBid}
                            className="flex-1 order-1 md:order-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                "Placing..."
                            ) : (
                                <>
                                    <Gavel size={16} />
                                    <span>Place Bid</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PlaceBidModal;