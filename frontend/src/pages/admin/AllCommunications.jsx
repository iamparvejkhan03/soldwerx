import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminSidebar, AdminHeader, AdminContainer, LoadingSpinner } from "../../components";
import axiosInstance from "../../utils/axiosInstance";
import { Search, MessageCircle, Eye, User, Truck, Calendar } from "lucide-react";
import { format } from "date-fns";

const AdminCommunications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [communications, setCommunications] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCommunications();
    }, []);

    const fetchCommunications = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get("/api/v1/communication/admin/all");
            if (data.success) {
                setCommunications(data.data);
            } else {
                setError("Failed to load communications");
            }
        } catch (err) {
            console.error(err);
            setError("Error loading communications");
        } finally {
            setLoading(false);
        }
    };

    const filtered = communications.filter((comm) => {
        const title = comm.auction?.title?.toLowerCase() || "";
        const seller = comm.seller?.username?.toLowerCase() || "";
        const bidder = comm.winningBidder?.username?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return title.includes(term) || seller.includes(term) || bidder.includes(term);
    });

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="pt-16 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">All Communications</h2>
                            <div className="relative mt-2 md:mt-0">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by title, seller, or bidder..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C59D55] focus:border-transparent w-full md:w-80"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 mb-4">
                                {error} <button onClick={fetchCommunications} className="underline ml-2">Retry</button>
                            </div>
                        )}

                        {filtered.length === 0 ? (
                            <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
                                <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700">No communications yet</h3>
                                <p className="text-gray-500">Sold auctions will appear here once communication starts.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filtered.map((comm) => (
                                                <tr key={comm._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{comm.auction?.title || "N/A"}</div>
                                                        <div className="text-xs text-gray-500">{comm?.auction?.category || ""}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <User size={14} className="text-gray-400 mr-1" />
                                                            <span className="text-sm">{comm?.seller?.username || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <User size={14} className="text-gray-400 mr-1" />
                                                            <span className="text-sm">{comm?.winningBidder?.username || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            ${comm?.auction?.finalPrice?.toLocaleString() || "0"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Calendar size={14} className="mr-1" />
                                                            {format(new Date(comm?.lastMessageAt), "MMM d, h:mm a")}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            to={`/admin/communication/${comm?.auction?._id}`}
                                                            className="inline-flex items-center px-3 py-1 bg-[#C59D55] text-white rounded-lg hover:bg-[#C59D55]/90 transition"
                                                        >
                                                            <Eye size={16} className="mr-1" />
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default AdminCommunications;