import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email } = otherData;

const SellerAgreement = () => {
    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Seller Agreement</h1>
                    <p className="text-gray-600 mb-6">SoldWerX | Last Updated: October 29, 2026</p>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <p className="text-green-800 font-semibold mb-2">IMPORTANT – PLEASE READ CAREFULLY</p>
                        <p className="text-green-700 text-sm">
                            This Seller Agreement governs all listings and sales made through SoldWerX.
                            By listing assets on our platform, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>SoldWerX</strong> ("we", "our", "us") and you, the seller ("Seller"),
                                enter into this Seller Agreement governing all listings and sales of heavy equipment,
                                trucks, trailers, vehicles, business assets, estates, and similar assets made through
                                our platform.
                            </p>
                            <p className="text-gray-700">
                                By creating a listing, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SoldWerX is open to both trade sellers and private individuals</li>
                                <li>Trade sellers include dealers, fleet operators, equipment resellers, and estate representatives</li>
                                <li>Sellers must be at least 18 years of age and legally capable of entering into a binding contract</li>
                                <li>All sellers must register and maintain accurate account information</li>
                                <li>We may verify identity, business details, or eligibility where required by law</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Seller Fees</h2>
                            <p className="text-gray-700 mb-3">
                                SoldWerX applies a default seller commission of 15% on the first $50,000 of the
                                final sale price, 10% on the portion from $50,000 to $100,000, and 5% on any portion
                                above $100,000 — each rate applying only to the slice of the sale price within its band.
                                No listing fees are charged, and no featured-placement upsells apply.
                            </p>
                            <p className="text-gray-700 mb-3">
                                An individual auction may carry a different commission structure set by an administrator.
                                Where it does, that structure is clearly disclosed before you list, and it supersedes the
                                default for that auction.
                            </p>
                            <p className="text-gray-700 mb-2">Important notes:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>The applicable commission is clearly displayed before you list</li>
                                <li>Commission is deducted from sale proceeds</li>
                                <li>All fees are in USD</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Seller Responsibilities</h2>
                            <p className="text-gray-700 mb-2">Sellers are solely responsible for:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Creating accurate and complete listings for equipment, vehicles, and other assets</li>
                                <li>Uploading clear, honest photographs, including of any defects or damage</li>
                                <li>Ensuring all descriptions are truthful and not misleading</li>
                                <li>Disclosing accurate hours, mileage, year, make, model, VIN/serial number, and any known mechanical issues</li>
                                <li>Entering accurate inspection availability, scheduling instructions, and location details at the time of listing creation</li>
                                <li>Keeping delivery partner details, tracking identifiers, and estimated delivery dates current through the platform</li>
                                <li>Responding to buyer questions through our secure communication window</li>
                                <li>Cooperating with buyer inspection requests where the listing offers inspections</li>
                                <li>Complying with all applicable laws, including any licensing or title transfer requirements</li>
                                <li>Arranging pickup, freight, or delivery with the buyer after payment is confirmed</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                SoldWerX provides an AI assistant to help with listing creation. Sellers upload their
                                own photographs and remain solely responsible for the accuracy of their listings. Our
                                team may assist where offered, but does not guarantee listing content.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Listing Accuracy</h2>
                            <p className="text-gray-700 mb-2">Sellers must ensure:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>Descriptions accurately reflect the asset's condition, age, hours, mileage, and specifications</li>
                                <li>Photos show the actual asset for sale, including any defects or wear</li>
                                <li>All material facts that could affect a buyer's decision are disclosed</li>
                                <li>Service records, inspection reports, or maintenance history are mentioned if applicable</li>
                                <li>Ownership status, lien information, and title documentation are accurately represented</li>
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

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Listing Withdrawal</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers may withdraw listings before completion of the auction when permitted by applicable law and the auction terms</li>
                                <li><strong>Withdrawal is not permitted during an active auction</strong> once bids have been placed, except as required by applicable law</li>
                                <li>For direct purchase listings, withdrawal is not permitted once a purchase is confirmed</li>
                                <li>Unauthorized withdrawal during active bidding may result in account suspension</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contract Formation</h2>
                            <p className="text-gray-700 mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>A buyer wins an auction (highest bid at final close, provided the reserve, if any, has been met)</li>
                                <li>A buyer confirms a direct purchase at the listed price</li>
                            </ul>
                            <p className="text-gray-700 mb-3">
                                Auctions use a soft-close rule. If a bid is placed close to the scheduled closing time,
                                the auction is extended to allow other bidders to respond. The highest bid at the
                                <strong> final </strong> close wins, provided the reserve, if any, has been met. If the
                                reserve is not met, no contract is formed and the asset is not sold.
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold mb-2">Seller's Obligation:</p>
                                <p className="text-gray-700">
                                    Once a contract is formed, sellers are obligated to complete the sale
                                    and cooperate with the buyer to arrange pickup, freight, or delivery.
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment to Sellers</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SoldWerX collects full payment from buyers in USD to the SoldWerX collection account via wire transfer, ACH or another approved electronic method, other methods specifically approved by SoldWerX, or cash where expressly authorized</li>
                                <li>Cash is accepted only through the payment instructions provided on the platform — never off-platform</li>
                                <li>The applicable seller commission is deducted from the sale proceeds</li>
                                <li>Payment to sellers is processed after:</li>
                                <ul className="pl-5 mt-1 space-y-1">
                                    <li>• Buyer's payment has fully cleared into the SoldWerX collection account</li>
                                    <li>• The asset has been collected or delivered</li>
                                    <li>• All transaction conditions are satisfied</li>
                                    <li>• No disputes or concerns are pending</li>
                                </ul>
                                <li>Payments are made via USD bank transfer to the seller's registered account</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Transfer of Assets</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sellers must make assets available for pickup, freight, or delivery promptly after payment is confirmed</li>
                                <li>Sellers must cooperate with buyers to arrange pickup, freight, or delivery through the platform's communication window</li>
                                <li>Pickup logistics — including pickup address, scheduling, and site-access instructions — are exchanged with the buyer through the platform's communication window</li>
                                <li>Sellers enter delivery partner details, tracking identifiers, and estimated delivery dates on the platform for the buyer to access</li>
                                <li>Title and ownership transfer only after full payment is received and confirmed by SoldWerX</li>
                                <li>Risk transfers to buyer upon collection or delivery, whichever occurs first</li>
                                <li>Sellers must provide any applicable title documents, bills of sale, or release of lien as required by law</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Seller Default</h2>
                            <p className="text-gray-700 mb-2">If a seller fails to transfer assets after a sale:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>SoldWerX will attempt to mediate and resolve the issue</li>
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

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Asset Not as Described</h2>
                            <p className="text-gray-700 mb-2">
                                If a buyer claims an asset is significantly not as described:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SoldWerX will investigate the claim</li>
                                <li>We may request evidence from both parties, including inspection reports or photos</li>
                                <li>If the listing was misleading, seller may be liable for:</li>
                                <ul className="pl-5 mt-1 space-y-1">
                                    <li>• Partial or full refund to buyer</li>
                                    <li>• Return freight or transport costs</li>
                                    <li>• Account suspension or ban</li>
                                </ul>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Communication Rules</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>All communication between buyers and sellers must go through the SoldWerX platform</li>
                                <li>Sharing personal contact information (phone numbers, email addresses, physical addresses, etc.) for the purpose of communicating or transacting outside the platform is prohibited</li>
                                <li>After payment is confirmed, buyers and sellers may exchange the pickup and delivery logistics necessary to complete collection — including pickup address, scheduling, and site-access instructions — through the platform's communication window</li>
                                <li>Delivery partner details, tracking identifiers, and estimated delivery dates are entered by the seller and visible to the buyer on the platform</li>
                                <li>Off-platform communication may result in account suspension</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Prohibited Conduct</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Misleading or fraudulent listings</li>
                                <li>Shill bidding (bidding on your own listings)</li>
                                <li>Off-platform transactions to avoid fees</li>
                                <li>Accepting cash or any payment off-platform</li>
                                <li>Failing to complete sales without valid reason</li>
                                <li>Abusive communication with buyers</li>
                                <li>Listing illegal, stolen, or counterfeit assets</li>
                                <li>Listing assets that are subject to undisclosed liens, encumbrances, or ownership disputes</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of the State of Michigan</li>
                                <li>Any disputes shall be resolved by the courts of the State of Michigan</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Changes to This Agreement</h2>
                            <p className="text-gray-700">
                                We may update this Agreement from time to time. The "Last Updated" date indicates the most
                                recent version. Material changes will be communicated via email or platform notice.
                                Continued selling after changes constitutes acceptance.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Entire Agreement</h2>
                            <p className="text-gray-700">
                                This Seller Agreement, together with our Terms of Use and Privacy Policy, constitutes the
                                entire agreement between you and SoldWerX regarding your listings and sales on our platform.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance & Contact</h2>
                            <p className="text-gray-700 mb-4">
                                By listing assets on SoldWerX, you acknowledge that you have read, understood, and agree
                                to this Seller Agreement.
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">SoldWerX</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">{email}</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Phone: <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Seller Agreement was last updated on October 29, 2026. It forms an integral part of
                                the contract for every asset listing made through SoldWerX.
                            </p>
                        </div>
                    </div>

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