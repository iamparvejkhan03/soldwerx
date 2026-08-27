import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const SellerAgreement = () => {
    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Seller Agreement</h1>
                    <p className="text-gray-600 mb-6">La-Bóveda | Last Updated: August 9, 2026</p>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <p className="text-green-800 font-semibold mb-2">IMPORTANT – PLEASE READ CAREFULLY</p>
                        <p className="text-green-700 text-sm">
                            This Seller Agreement governs all listings and sales made through La-Bóveda.
                            By listing collectibles on our platform, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>La-Bóveda</strong> ("we", "our", "us") and you, the seller ("Seller"),
                                enter into this Seller Agreement governing all collectibles listings and sales made through our platform.
                            </p>
                            <p className="text-gray-700">
                                By creating a listing, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        {/* Section 1 - Eligibility */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>La-Bóveda is open to both trade sellers and private individuals</li>
                                <li>Trade sellers include dealers, collectors, and memorabilia businesses</li>
                                <li>All sellers must register and maintain accurate account information</li>
                                <li>We reserve the right to verify identity and eligibility</li>
                                <li>Sellers must be at least 18 years of age</li>
                            </ul>
                        </div>

                        {/* Section 2 - Seller Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Seller Fees</h2>
                            <p className="text-gray-700 mb-3">La-Bóveda charges a simple fee structure for sellers:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li><strong>Commission-based:</strong> 5% of the final sale price</li>
                            </ul>
                            <p className="text-gray-700 mb-2">Important notes:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>No listing fees – you only pay when your item sells</li>
                                <li>No photography or listing preparation fees</li>
                                <li>The 5% commission is clearly displayed before listing</li>
                                <li>Commission is non-negotiable and deducted from sale proceeds</li>
                                <li>All fees are in USD</li>
                            </ul>
                        </div>

                        {/* Section 3 - Seller Responsibilities */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Seller Responsibilities</h2>
                            <p className="text-gray-700 mb-2">Sellers are solely responsible for:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Creating accurate and complete collectibles listings</li>
                                <li>Providing clear, honest photographs</li>
                                <li>Ensuring all descriptions are truthful and not misleading</li>
                                <li>Responding to buyer questions through our secure communication window</li>
                                <li>Managing their own listings without additional services from La-Bóveda</li>
                                <li>Complying with all applicable laws</li>
                                <li>Arranging delivery or collection with the buyer after payment is confirmed</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                La-Bóveda does not provide photography, inspection, or listing preparation services.
                            </p>
                        </div>

                        {/* Section 4 - Listing Accuracy */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Listing Accuracy</h2>
                            <p className="text-gray-700 mb-2">Sellers must ensure:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>Descriptions accurately reflect the collectible's condition, age, and authenticity</li>
                                <li>Photos show the actual item for sale, including any defects</li>
                                <li>All material facts that could affect a buyer's decision are disclosed</li>
                                <li>Certificates of authenticity or provenance are mentioned if applicable</li>
                            </ul>
                            <div className="bg-yellow-50 p-4 rounded">
                                <p className="text-red-600 font-semibold mb-2">Consequences of Misleading Listings:</p>
                                <ul className="text-red-700 space-y-1 list-disc pl-5">
                                    <li>Auction suspension</li>
                                    <li>Account suspension or permanent ban</li>
                                    <li>Liability for any losses incurred by buyers</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 - Listing Withdrawal */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Listing Withdrawal</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers may withdraw listings at any time before bids are received</li>
                                <li><strong>Withdrawal is not permitted during an active auction</strong> once bids have been placed</li>
                                <li>For direct purchase listings, withdrawal is not permitted once a purchase is confirmed</li>
                                <li>Unauthorized withdrawal during active bidding may result in account suspension</li>
                            </ul>
                        </div>

                        {/* Section 6 - Contract Formation */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contract Formation</h2>
                            <p className="text-gray-700 mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>A buyer wins an auction (highest bid at closing)</li>
                                <li>A buyer confirms a direct purchase at the listed price</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold mb-2">Seller's Obligation:</p>
                                <p className="text-gray-700">
                                    Once a contract is formed, sellers are obligated to complete the sale
                                    and cooperate with the buyer to arrange delivery or collection.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 - Payment to Sellers */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment to Sellers</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>La-Bóveda collects full payment from buyers via USD bank transfer</li>
                                <li>The 5% commission is deducted from the sale proceeds</li>
                                <li>Payment to sellers is processed after:</li>
                                <ul className="pl-5 mt-1 space-y-1">
                                    <li>• Buyer's payment has fully cleared into the La-Bóveda collection account</li>
                                    <li>• All transaction conditions are satisfied</li>
                                    <li>• No disputes or concerns are pending</li>
                                </ul>
                                <li>Payments are made via USD bank transfer to the seller's registered account</li>
                            </ul>
                        </div>

                        {/* Section 8 - Transfer of Collectibles */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Transfer of Collectibles</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers must make collectibles available for collection or delivery promptly after payment is confirmed</li>
                                <li>Sellers must cooperate with buyers to arrange collection or delivery</li>
                                <li>Title and ownership transfer only after full payment is received and confirmed by La-Bóveda</li>
                                <li>Risk transfers to buyer upon collection or delivery, whichever occurs first</li>
                                <li>Tracking or shipping labels can be shared through our secure communication window</li>
                            </ul>
                        </div>

                        {/* Section 9 - Seller Default */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Seller Default</h2>
                            <p className="text-gray-700 mb-2">If a seller fails to transfer collectibles after a sale:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>La-Bóveda will attempt to mediate and resolve the issue</li>
                                <li>We will work with both parties to find a fair solution</li>
                                <li>If resolution is not possible, the sale may be cancelled</li>
                                <li>Buyer will receive a full refund</li>
                            </ul>
                            <p className="text-gray-700 mb-2">Consequences for seller default may include:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Account suspension or permanent ban</li>
                                <li>Liability for any losses incurred</li>
                                <li>Legal action if warranted</li>
                            </ul>
                        </div>

                        {/* Section 10 - Collectible Not as Described */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Collectible Not as Described</h2>
                            <p className="text-gray-700 mb-2">
                                If a buyer claims a collectible is significantly not as described:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>La-Bóveda will investigate the claim</li>
                                <li>We may request evidence from both parties</li>
                                <li>If the listing was misleading, seller may be liable for:</li>
                                <ul className="pl-5 mt-1 space-y-1">
                                    <li>• Partial or full refund to buyer</li>
                                    <li>• Return shipping costs</li>
                                    <li>• Account suspension or ban</li>
                                </ul>
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

                        {/* Section 12 - Prohibited Conduct */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Prohibited Conduct</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Misleading or fraudulent listings</li>
                                <li>Shill bidding (bidding on your own items)</li>
                                <li>Off-platform transactions to avoid fees</li>
                                <li>Failing to complete sales without valid reason</li>
                                <li>Abusive communication with buyers</li>
                                <li>Listing illegal, stolen, or counterfeit collectibles</li>
                            </ul>
                        </div>

                        {/* Section 13 - Limitation of Liability */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by law, La-Bóveda's total liability to sellers is limited to
                                the fees paid for the specific transaction in question. We are not liable for indirect or
                                consequential losses including lost profits. This does not limit liability for fraud, death,
                                or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 14 - Governing Law */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of Venezuela</li>
                                <li>Any disputes shall be resolved by the courts of Venezuela</li>
                            </ul>
                        </div>

                        {/* Section 15 - Changes to Agreement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Changes to This Agreement</h2>
                            <p className="text-gray-700">
                                We may update this Agreement from time to time. The "Last Updated" date indicates the most
                                recent version. Material changes will be communicated via email or platform notice.
                                Continued selling after changes constitutes acceptance.
                            </p>
                        </div>

                        {/* Section 16 - Entire Agreement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Entire Agreement</h2>
                            <p className="text-gray-700">
                                This Seller Agreement, together with our Terms of Use and Privacy Policy, constitutes the
                                entire agreement between you and La-Bóveda regarding your listings and sales on our platform.
                            </p>
                        </div>

                        {/* Acceptance & Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance & Contact</h2>
                            <p className="text-gray-700 mb-4">
                                By listing collectibles on La-Bóveda, you acknowledge that you have read, understood, and agree
                                to this Seller Agreement.
                            </p>
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
                                This Seller Agreement was last updated on August 9, 2026. It forms an integral part of
                                the contract for every collectibles listing made through La-Bóveda.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/terms-of-use"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Terms of Use
                            </Link>
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

export default SellerAgreement;