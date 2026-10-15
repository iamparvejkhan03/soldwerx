import React, { useEffect, useState } from "react";
import { X, Banknote } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { createPortal } from "react-dom";
import {
    fetchBuyerRule,
    calculateBuyerFee,
    formatCommissionLabel,
} from "../utils/buyerCommission";

const MakeOfferModal = ({
    isOpen,
    onClose,
    onSubmit,
    offerAmount,
    setOfferAmount,
    offerMessage,
    setOfferMessage,
    loading,
    auction,
}) => {
    const [rule, setRule] = useState(null);
    const [serviceFee, setServiceFee] = useState(0);

    // Fetch the effective buyer rule for THIS auction
    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        (async () => {
            try {
                const resolved = await fetchBuyerRule(auction, axiosInstance);
                if (!cancelled) setRule(resolved);
            } catch (error) {
                console.error("Failed to resolve buyer commission:", error);
                if (!cancelled) setRule({ enabled: false, structure: null });
            }
        })();

        return () => { cancelled = true; };
    }, [isOpen, auction]);

    // Recalculate the fee as the user types
    useEffect(() => {
        if (!rule?.enabled || !rule.structure || !offerAmount) {
            setServiceFee(0);
            return;
        }
        const price = Number(offerAmount) || 0;
        setServiceFee(calculateBuyerFee(rule.structure, price).amount);
    }, [offerAmount, rule]);

    if (!isOpen) return null;

    const formatUSD = (amount) => {
        if (!amount && amount !== 0) return "$0";
        return `$${Number(amount).toLocaleString("en-US")}`;
    };

    const total = Number(offerAmount || 0) + Number(serviceFee);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const isInvalidOffer =
        !offerAmount || parseFloat(offerAmount) < auction?.startPrice;

    const commissionLabel = formatCommissionLabel(rule?.structure);

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">

                {/* Header */}
                <div className="flex justify-between items-center py-4 px-6 md:pt-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Make an Offer
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 pt-1">

                    {/* Offer Amount */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 justify-start text-sm font-medium text-gray-700 mb-2">
                            Your Offer Amount
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Banknote className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your offer amount"
                                min={auction?.startPrice}
                                step="any"
                                required
                                autoFocus
                            />
                        </div>

                        {auction?.startPrice && auction?.startPrice > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum offer: {formatUSD(auction?.startPrice)}
                            </p>
                        )}
                    </div>

                    {/* Fee Breakdown */}
                    {offerAmount && !isInvalidOffer && rule?.enabled && (
                        <div className="bg-gray-50 rounded-lg mb-6 space-y-2 p-3">
                            <div className="flex justify-between text-gray-700">
                                <span className="text-sm">Offer Amount</span>
                                <span>{formatUSD(offerAmount)}</span>
                            </div>

                            <div className="flex justify-between text-gray-700">
                                <span className="text-sm">
                                    Buyer's Premium ({commissionLabel})
                                </span>
                                <span>{formatUSD(serviceFee)}</span>
                            </div>

                            <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                                <span className="text-sm">Total Payable</span>
                                <span>{formatUSD(total)}</span>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 order-2 md:order-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || isInvalidOffer}
                            className="flex-1 order-1 md:order-2 bg-[#edcd1f] text-black py-3 px-4 rounded-lg hover:bg-[#edcd1f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Submitting..." : "Submit Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default MakeOfferModal;