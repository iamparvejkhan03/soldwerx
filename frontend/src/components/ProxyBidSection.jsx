import { useState, useEffect } from "react";
import { Loader, Target, X } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const ProxyBidSection = ({ auction, onAuctionUpdate }) => {
    const [maxAmount, setMaxAmount] = useState("");
    const [newMaxAmount, setNewMaxAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [proxyBidStatus, setProxyBidStatus] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user && auction?._id) {
            fetchProxyBidStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auction?._id, user]);

    const fetchProxyBidStatus = async () => {
        try {
            const { data } = await axiosInstance.get(
                `/api/v1/auctions/${auction._id}/proxy-bid/status`
            );
            if (data.success) {
                setProxyBidStatus(data.data);
                // Pre-fill the update input with current max if exists
                if (data.data.hasProxyBid && data.data.maxAmount) {
                    setNewMaxAmount(data.data.maxAmount.toString());
                } else {
                    setNewMaxAmount("");
                }
            }
        } catch (error) {
            console.error("Error fetching proxy bid status:", error);
        }
    };

    // --- Place New Proxy Bid ---
    const handlePlaceProxyBid = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("You must login to place a proxy bid.");
            return;
        }

        if (user._id?.toString() === auction?.seller?._id?.toString()) {
            toast.error("You can't place a proxy bid on your own auction.");
            return;
        }

        const bidAmount = parseFloat(maxAmount);
        const minBid =
            auction.bidCount === 0
                ? auction.startPrice
                : auction.currentPrice + auction.bidIncrement;

        if (!maxAmount || bidAmount < minBid) {
            toast.error(`Maximum bid must be at least $${minBid.toFixed(2)}`);
            return;
        }

        try {
            setIsLoading(true);
            const { data } = await axiosInstance.post(
                `/api/v1/auctions/${auction._id}/proxy-bid`,
                {
                    maxAmount: bidAmount,
                }
            );

            if (data.success) {
                toast.success("Proxy bid placed successfully!");
                setMaxAmount("");
                setProxyBidStatus(data.data.proxyBid);
                setNewMaxAmount(bidAmount.toString());
                if (onAuctionUpdate) onAuctionUpdate(data.data.auction);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to place proxy bid");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProxyBid = async () => {
        if (!user) {
            toast.error("You must login to update your proxy bid.");
            return;
        }

        const newMax = parseFloat(newMaxAmount);
        const minBid =
            auction.bidCount === 0
                ? auction.startPrice
                : auction.currentPrice + auction.bidIncrement;

        if (!newMaxAmount || newMax < minBid) {
            toast.error(`Maximum bid must be at least $${minBid.toFixed(2)}`);
            return;
        }

        if (newMax <= proxyBidStatus.currentBid && newMax <= auction.currentPrice) {
            toast.error(`New maximum must be higher than your current proxy bid ($${proxyBidStatus.currentBid.toFixed(2)})`);
            return;
        }

        try {
            setIsUpdating(true);
            const { data } = await axiosInstance.put(
                `/api/v1/auctions/${auction._id}/proxy-bid`,
                {
                    maxAmount: newMax,
                }
            );

            if (data.success) {
                toast.success("Proxy bid updated successfully!");
                // Re-fetch status to get latest data from server
                await fetchProxyBidStatus();
                if (onAuctionUpdate) onAuctionUpdate(data.data.auction);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update proxy bid");
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Cancel Proxy Bid ---
    const handleCancelProxyBid = async () => {
        try {
            setIsLoading(true);
            const { data } = await axiosInstance.delete(
                `/api/v1/auctions/${auction._id}/proxy-bid`
            );

            if (data.success) {
                toast.success("Proxy bid cancelled successfully");
                setProxyBidStatus(null);
                setNewMaxAmount("");
                if (onAuctionUpdate) onAuctionUpdate(data.data.auction);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to cancel proxy bid");
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render if auction not active or not applicable
    if (auction?.status !== "active") return null;
    if (auction?.auctionType === "buy_now" || auction?.auctionType === "giveaway")
        return null;
    if (!auction.allowProxyBidding) return null;

    const minBid =
        auction.bidCount === 0
            ? auction.startPrice
            : auction.currentPrice + auction.bidIncrement;

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Proxy Bidding
                <span className="text-xs text-gray-500 font-normal">
                    (Automatic bidding up to your maximum)
                </span>
            </h3>

            {proxyBidStatus?.hasProxyBid && proxyBidStatus.isActive ? (
                // --- Active Proxy Bid ---
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your Maximum Bid:</span>
                        <span className="font-medium">
                            ${proxyBidStatus.maxAmount.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Bid:</span>
                        <span className="font-medium">
                            ${proxyBidStatus.currentBid.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span
                            className={`font-medium ${proxyBidStatus.isActive ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {proxyBidStatus.isActive ? "Active" : "Cancelled"}
                        </span>
                    </div>

                    {/* Update Section */}
                    <div className="pt-2 border-t border-gray-200">
                        <label className="text-xs text-gray-500">Update Maximum Bid</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="number"
                                step="any"
                                value={newMaxAmount}
                                onChange={(e) => setNewMaxAmount(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="New max amount"
                                min={minBid}
                            />
                            <button
                                onClick={handleUpdateProxyBid}
                                disabled={isUpdating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
                            >
                                {isUpdating ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Update"
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Minimum ${minBid.toFixed(2)}
                        </p>
                    </div>

                    {/* Cancel Button */}
                    <button
                        onClick={handleCancelProxyBid}
                        disabled={isLoading}
                        className="mt-1 text-sm text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                        Cancel Proxy Bid
                    </button>
                </div>
            ) : (
                // --- Place New Proxy Bid ---
                <form onSubmit={handlePlaceProxyBid} className="space-y-3">
                    <div>
                        <label className="text-sm text-gray-600">
                            Enter your maximum bid (${minBid.toFixed(2)} minimum)
                        </label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                                $
                            </span>
                            <input
                                type="number"
                                step="any"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter max bid"
                                min={minBid}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                            "Place Proxy Bid"
                        )}
                    </button>
                    <p className="text-xs text-gray-500">
                        💡 The system will automatically bid on your behalf up to your
                        maximum amount.
                    </p>
                </form>
            )}
        </div>
    );
};

export default ProxyBidSection;