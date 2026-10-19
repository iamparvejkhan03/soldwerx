import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
    CheckCircle, XCircle, Loader, Mail, MailX, Layers, Inbox,
} from "lucide-react";
import { Container } from "../components";
import { useAuth } from "../contexts/AuthContext";

const API = import.meta.env.VITE_DOMAIN_URL;

function Unsubscribe() {
    const { token: pathToken } = useParams();
    const [searchParams] = useSearchParams();
    const token = pathToken || searchParams.get("token");
    const { user } = useAuth();

    const [status, setStatus] = useState("loading");
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid unsubscribe link.");
            return;
        }
        (async () => {
            try {
                const { data } = await axios.get(`${API}/api/v1/users/unsubscribe/${token}`);
                if (data.success) {
                    setPreview(data.data);
                    setStatus("preview");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Failed to load unsubscribe options.");
                }
            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.message || "Invalid or expired unsubscribe link.");
            }
        })();
    }, [token]);

    const handleConfirm = async (scope) => {
        setStatus("submitting");
        try {
            const { data } = await axios.post(`${API}/api/v1/users/unsubscribe`, {
                token,
                scope,
            });
            if (data.success) {
                setResult(data);
                setStatus("success");
            } else {
                setStatus("error");
                setMessage(data.message || "Failed to unsubscribe.");
            }
        } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    const profileLink = user?.userType ? `/${user.userType}/profile` : "/login";

    return (
        <Container className="min-h-screen pt-32 pb-16 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
                {status === "loading" && (
                    <div className="text-center">
                        <Loader size={48} className="animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600">Loading options...</p>
                    </div>
                )}

                {status === "preview" && preview && (
                    <>
                        <div className="text-center mb-6">
                            <MailX size={48} className="text-primary mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Unsubscribe Options
                            </h2>
                            <p className="text-gray-600">
                                Choose how you'd like to unsubscribe from{" "}
                                <strong>{preview.emailLabel}</strong>.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleConfirm("email")}
                                disabled={!preview.emailEnabled}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Mail size={22} className="text-primary shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">Just this email</p>
                                    <p className="text-sm text-gray-500">
                                        {preview.emailEnabled
                                            ? `Stop receiving "${preview.emailLabel}"`
                                            : "Already unsubscribed"}
                                    </p>
                                </div>
                            </button>

                            {preview.categoryEmails.length > 1 && (
                                <button
                                    onClick={() => handleConfirm("category")}
                                    className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
                                >
                                    <Layers size={22} className="text-primary shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">
                                            All {preview.categoryLabel.toLowerCase()} emails
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Unsubscribe from {preview.categoryEmails.length} emails in this category
                                        </p>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => handleConfirm("all")}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-left"
                            >
                                <Inbox size={22} className="text-primary shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">
                                        All non-essential emails
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Keep only critical emails (password reset, payments, payouts)
                                    </p>
                                </div>
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-6">
                            You can change these anytime from your{" "}
                            <Link to={profileLink} className="text-primary hover:underline">
                                account email preferences
                            </Link>.
                        </p>
                    </>
                )}

                {status === "submitting" && (
                    <div className="text-center">
                        <Loader size={48} className="animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600">Updating your preferences...</p>
                    </div>
                )}

                {status === "success" && result && (
                    <div className="text-center">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Unsubscribed Successfully
                        </h2>
                        <p className="text-gray-600 mb-6">{result.message}</p>
                        <Link
                            to="/"
                            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center">
                        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Unsubscribe Failed
                        </h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/"
                            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default Unsubscribe;