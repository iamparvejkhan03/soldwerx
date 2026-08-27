import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const TermsOfUse = () => {
    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Use</h1>
                    <p className="text-gray-600 mb-6">La-Bóveda | Last Updated: August 9, 2026</p>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-800 font-semibold mb-2">IMPORTANT – PLEASE READ</p>
                        <p className="text-red-700 text-sm">
                            These Terms govern your use of La-Bóveda. By registering or using our platform,
                            you confirm your agreement to these Terms. All collectibles are sold on an "as-is"
                            basis without warranty unless otherwise stated.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>La-Bóveda</strong> ("we", "our", "us") operates an online marketplace for sports
                                and non-sports collectibles, including cards, signed jerseys, game-used balls, and other
                                valuable memorabilia. These Terms of Use ("Terms") govern your access to and use
                                of our website, platform, and services.
                            </p>
                            <p className="text-gray-700">
                                By registering for, accessing, or using the Platform, you agree to be bound by these Terms.
                            </p>
                        </div>

                        {/* Section 1 - Platform Access */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Platform Access</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>La-Bóveda is open to both collectors and private buyers</li>
                                <li>All users must register and maintain accurate account information</li>
                                <li>We reserve the right to refuse or terminate access at our discretion</li>
                                <li>Users must comply with all applicable laws</li>
                            </ul>
                        </div>

                        {/* Section 2 - Account Registration */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Account Registration</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Registration is free</li>
                                <li>You must provide accurate and complete information, including your email address, phone number, address, ID number, and a photo of yourself and your ID</li>
                                <li>You are responsible for maintaining account security</li>
                                <li>We may suspend or terminate accounts for misuse or violation of these Terms</li>
                                <li>Account sharing or transferring is prohibited without consent</li>
                            </ul>
                        </div>

                        {/* Section 3 - Our Role */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Our Role</h2>
                            <p className="text-gray-700 mb-3">La-Bóveda acts as:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li><strong>Intermediary:</strong> Facilitating sales between third-party sellers and buyers</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold">
                                    In all cases, La-Bóveda manages the transaction, collects payment, and releases funds to the seller.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 - Transactions */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Auctions & Direct Purchases</h2>
                            <div className="bg-red-50 p-4 rounded mb-3">
                                <p className="text-red-700 font-semibold mb-2">LEGALLY BINDING COMMITMENTS</p>
                                <ul className="text-red-700 space-y-1 list-disc pl-5">
                                    <li>All bids are legally binding contracts</li>
                                    <li>Bid retractions are not permitted</li>
                                    <li>Direct purchases are binding upon confirmation</li>
                                    <li>Failure to complete payment constitutes a breach of contract</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 - Buyer Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Buyer Fees</h2>
                            <p className="text-gray-700">
                                A 5% buyer's fee applies to all successful purchases. The fee is clearly displayed
                                before you bid or complete a purchase. All fees are in USD unless otherwise stated.
                            </p>
                        </div>

                        {/* Section 6 - Seller Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seller Fees</h2>
                            <p className="text-gray-700">
                                Sellers are charged a 5% commission on the final sale price. There are no listing fees,
                                photography fees, or hidden charges. Sellers are responsible for creating their own listings,
                                including descriptions and images.
                            </p>
                        </div>

                        {/* Section 7 - Payments */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payments</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bank transfer in USD is the only accepted payment method</li>
                                <li>Payment must be completed within 48 hours of winning an auction or confirming a direct purchase</li>
                                <li>All payments must be made to the La-Bóveda collection account</li>
                                <li>Items will not be released until payment clears in full</li>
                                <li>Once payment is verified, we release funds to the seller</li>
                            </ul>
                        </div>

                        {/* Section 8 - Collection & Delivery */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Collection & Delivery</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Buyer and seller are responsible for arranging and managing delivery between themselves</li>
                                <li>Collection can be arranged directly with the seller after payment is confirmed</li>
                                <li>Risk transfers to the buyer upon collection or delivery, whichever occurs first</li>
                                <li>Tracking or shipping labels can be uploaded through our secure communication window</li>
                            </ul>
                        </div>

                        {/* Section 9 - Sold As Seen */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Sold As Seen – No Warranty</h2>
                            <div className="bg-yellow-50 p-4 rounded mb-3">
                                <p className="text-red-600 font-bold text-center mb-2">ALL COLLECTIBLES ARE SOLD:</p>
                                <div className="text-center space-y-1">
                                    <p className="text-red-600">As-is / "en el estado en que se encuentran"</p>
                                    <p className="text-red-600">Without any warranty</p>
                                    <p className="text-red-600">Without consumer rights protections</p>
                                </div>
                            </div>
                            <p className="text-gray-700">
                                Item descriptions and photographs are provided for guidance only. Buyers are encouraged to ask questions
                                before bidding or purchasing through our secure communication window. La-Bóveda is a marketplace and
                                does not guarantee condition beyond what is described.
                            </p>
                        </div>

                        {/* Section 10 - Inspections & Returns */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Inspections & Returns</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>On-site inspections are not available before bidding</li>
                                <li>All sales are final</li>
                                <li>If you have concerns after winning, please contact us directly and we'll review your situation</li>
                            </ul>
                        </div>

                        {/* Section 11 - Communication Rules */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Communication Rules</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>All communication between buyers and sellers must go through the La-Bóveda platform</li>
                                <li>Sharing personal contact information (phone numbers, email addresses, physical addresses, etc.) is strictly prohibited</li>
                                <li>Only tracking or shipping labels may be shared through the secure communication window</li>
                                <li>Off-platform communication may result in account suspension</li>
                            </ul>
                        </div>

                        {/* Section 12 - Title & Risk */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Title & Risk</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Legal title and ownership pass only when full payment is received and confirmed</li>
                                <li>Risk of loss or damage transfers to the buyer upon collection or delivery</li>
                                <li>Buyers are responsible for insurance from the moment of collection or delivery</li>
                            </ul>
                        </div>

                        {/* Section 13 - Default & Enforcement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Default & Enforcement</h2>
                            <p className="text-gray-700 mb-2">If payment is not completed, we may:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Cancel the sale and relist the item</li>
                                <li>Seek recovery of any losses or costs incurred</li>
                                <li>Suspend or permanently terminate the user's account</li>
                                <li>Report to relevant authorities if fraud is suspected</li>
                            </ul>
                        </div>

                        {/* Section 14 - Limitation of Liability */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by law, La-Bóveda's total liability is limited to the
                                purchase price of the collectible in question. We are not liable for indirect or consequential
                                losses. This does not limit liability for fraud, death, or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 15 - Governing Law */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>These Terms are governed by the laws of Venezuela</li>
                                <li>Disputes shall be resolved by the courts of Venezuela</li>
                            </ul>
                        </div>

                        {/* Section 16 - Changes to Terms */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Changes to These Terms</h2>
                            <p className="text-gray-700">
                                We may update these Terms from time to time. The "Last Updated" date indicates the most
                                recent version. Material changes will be communicated via email or platform notice.
                                Continued use after changes constitutes acceptance.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">La-Bóveda</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Phone: <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                These Terms were last updated on August 9, 2026. If you have questions about these Terms,
                                please contact us at {email}.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/privacy-policy"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/buyer-agreement"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Buyer Agreement
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TermsOfUse;