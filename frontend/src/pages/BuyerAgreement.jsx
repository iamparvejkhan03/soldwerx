import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const BuyerAgreement = () => {
    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Buyer Agreement</h1>
                    <p className="text-gray-600 mb-6">La-Bóveda | Last Updated: August 9, 2026</p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">IMPORTANT – PLEASE READ CAREFULLY</p>
                        <p className="text-blue-700 text-sm">
                            This Buyer Agreement governs all purchases made through La-Bóveda.
                            By placing a bid or confirming a direct purchase, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>La-Bóveda</strong> ("we", "our", "us") and you, the buyer ("Buyer"),
                                enter into this Buyer Agreement governing all purchases made through our collectibles marketplace platform.
                            </p>
                            <p className="text-gray-700">
                                By placing a bid or confirming a direct purchase, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        {/* Section 1 - Eligibility */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>La-Bóveda is open to both collectors and private buyers</li>
                                <li>All buyers must register and maintain accurate account information</li>
                                <li>We reserve the right to verify identity and eligibility</li>
                                <li>Buyers must be at least 18 years of age</li>
                            </ul>
                        </div>

                        {/* Section 2 - Binding Contract */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Binding Contract</h2>
                            <p className="text-gray-700 mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>You win an auction (highest bid at closing)</li>
                                <li>You confirm a direct purchase at the listed price</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-red-600 font-semibold text-sm">
                                    All bids and direct purchases are legally binding. Bid retractions are not permitted.
                                </p>
                            </div>
                        </div>

                        {/* Section 3 - Buyer Fees */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Buyer Fees</h2>
                            <p className="text-gray-700">
                                A 5% buyer's fee applies to all successful purchases. The fee is clearly displayed
                                before you bid or confirm a direct purchase. All fees are in USD and are non-refundable.
                            </p>
                        </div>

                        {/* Section 4 - Item Condition */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Item Condition</h2>
                            <p className="text-gray-700 mb-3">All collectibles are sold:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>As-is / "en el estado en que se encuentran"</li>
                                <li>Without any warranty, express or implied</li>
                                <li>Without consumer protection rights</li>
                            </ul>
                            <p className="text-gray-600 text-sm">
                                Descriptions, photographs, and specifications are provided for guidance only and do not
                                form part of any contractual warranty. La-Bóveda is a marketplace and does not guarantee
                                condition beyond what is described by the seller.
                            </p>
                        </div>

                        {/* Section 5 - Inspections */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Inspections</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>On-site inspections are not available before bidding or purchasing</li>
                                <li>If you have questions about a listing, please ask the seller through our secure communication window</li>
                                <li>We recommend asking questions before placing a bid or confirming a purchase</li>
                                <li>Failure to ask questions before purchasing is at the buyer's sole risk</li>
                            </ul>
                        </div>

                        {/* Section 6 - Concerns After Purchase */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Concerns After Purchase</h2>
                            <p className="text-gray-700 mb-3">
                                If you have concerns after winning an auction or completing a purchase:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Contact us immediately at {email}</li>
                                <li>We will review your concerns on a case-by-case basis</li>
                                <li>All sales are final. Returns are not accepted unless otherwise agreed</li>
                                <li>All decisions are made in good faith and are final</li>
                            </ul>
                        </div>

                        {/* Section 7 - Payment */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bank transfer in USD is the only accepted payment method</li>
                                <li>Payment must be completed within 48 hours of winning an auction or confirming a direct purchase</li>
                                <li>All payments must be made to the La-Bóveda collection account</li>
                                <li>Items will not be released until full payment clears</li>
                                <li>Title and ownership pass only after full payment is received and confirmed</li>
                                <li>Once payment is verified, we release funds to the seller</li>
                            </ul>
                        </div>

                        {/* Section 8 - Collection & Delivery */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Collection & Delivery</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Buyer and seller are responsible for arranging and managing delivery between themselves</li>
                                <li>Collection can be arranged directly with the seller after payment is confirmed</li>
                                <li>Risk of loss or damage transfers to the buyer upon collection or delivery</li>
                                <li>Buyers are responsible for insurance from the moment of collection or delivery</li>
                                <li>Tracking or shipping labels can be shared through our secure communication window</li>
                            </ul>
                        </div>

                        {/* Section 9 - Communication Rules */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Communication Rules</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>All communication between buyers and sellers must go through the La-Bóveda platform</li>
                                <li>Sharing personal contact information (phone numbers, email addresses, physical addresses, etc.) is strictly prohibited</li>
                                <li>Only tracking or shipping labels may be shared through the secure communication window</li>
                                <li>Off-platform communication may result in account suspension</li>
                            </ul>
                        </div>

                        {/* Section 10 - Default & Enforcement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Default & Enforcement</h2>
                            <p className="text-gray-700 mb-2">If payment is not completed within the required timeframe, we may:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Cancel the sale and relist the item</li>
                                <li>Seek recovery of any losses or costs incurred</li>
                                <li>Suspend or permanently terminate the buyer's account</li>
                                <li>Report to relevant authorities if fraud is suspected</li>
                            </ul>
                        </div>

                        {/* Section 11 - Limitation of Liability */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by law, La-Bóveda's total liability is limited to the
                                purchase price of the collectible in question. We are not liable for indirect or consequential
                                losses including but not limited to lost profits or business interruption.
                                This does not limit liability for fraud, death, or personal injury caused by negligence.
                            </p>
                        </div>

                        {/* Section 12 - Governing Law */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of Venezuela</li>
                                <li>Any disputes shall be resolved by the courts of Venezuela</li>
                            </ul>
                        </div>

                        {/* Section 13 - Entire Agreement */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Entire Agreement</h2>
                            <p className="text-gray-700">
                                This Buyer Agreement, together with our Terms of Use and Privacy Policy, constitutes the
                                entire agreement between you and La-Bóveda regarding your purchases on our platform.
                            </p>
                        </div>

                        {/* Acceptance & Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance & Contact</h2>
                            <p className="text-gray-700 mb-4">
                                By using La-Bóveda, you acknowledge that you have read, understood, and agree to this Buyer Agreement.
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
                                This Buyer Agreement was last updated on August 9, 2026. It forms an integral part of
                                the contract for every collectible purchase made through La-Bóveda.
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
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default BuyerAgreement;