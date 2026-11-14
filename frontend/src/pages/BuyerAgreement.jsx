import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const { phone, email } = otherData;

const BuyerAgreement = () => {
    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Buyer Agreement</h1>
                    <p className="text-gray-600 mb-6">SoldWerX | Last Updated: October 29, 2026</p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">IMPORTANT – PLEASE READ CAREFULLY</p>
                        <p className="text-blue-700 text-sm">
                            This Buyer Agreement governs all purchases made through SoldWerX.
                            By placing a bid or confirming a direct purchase, you agree to be bound by this Agreement.
                        </p>
                    </div>
                </div>

                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>SoldWerX</strong> ("we", "our", "us") and you, the buyer ("Buyer"),
                                enter into this Buyer Agreement governing all purchases made through our marketplace
                                platform for heavy equipment, trucks, trailers, vehicles, business assets, estates,
                                and similar assets.
                            </p>
                            <p className="text-gray-700">
                                By placing a bid or confirming a direct purchase, you agree to be bound by this Agreement.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Eligibility</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SoldWerX is open to both businesses and private buyers</li>
                                <li>Buyers must be at least 18 years of age and legally capable of entering into a binding contract</li>
                                <li>All buyers must register and maintain accurate account information</li>
                                <li>We reserve the right to verify identity, business details, and eligibility</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Binding Contract</h2>
                            <p className="text-gray-700 mb-3">A legally binding contract is formed when:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>You win an auction (highest bid at final close, provided the reserve, if any, has been met)</li>
                                <li>You confirm a direct purchase at the listed price</li>
                                <li>Your offer is accepted by the seller</li>
                            </ul>
                            <p className="text-gray-700 mb-3">
                                Auctions use a soft-close rule. If a bid is placed close to the scheduled closing time,
                                the auction is extended to allow other bidders to respond. The highest bid at the
                                <strong> final </strong> close wins, provided the reserve, if any, has been met. If the
                                reserve is not met, no sale occurs and no deposit is charged.
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-red-600 font-semibold text-sm">
                                    All bids and direct purchases are legally binding. Bid retractions are not permitted, except where expressly allowed by applicable law prior to the completion of the auction.
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Buyer Fees</h2>
                            <p className="text-gray-700">
                                A buyer's premium applies to all successful purchases. The premium is not fixed —
                                it may follow SoldWerX's global tiered schedule or be set per auction, and is disclosed
                                at the time you bid or make an offer, and is clearly displayed before you commit.
                                All fees are in USD and are non-refundable.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Asset Condition</h2>
                            <p className="text-gray-700 mb-3">All assets are sold:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>As-is, where-is, with all faults</li>
                                <li>Without any warranty, express or implied</li>
                            </ul>
                            <p className="text-gray-600 text-sm">
                                Descriptions, photographs, specifications, hours, mileage, and inspection reports are
                                provided for guidance only and do not form part of any contractual warranty. SoldWerX
                                is a marketplace and does not guarantee the condition, performance, or fitness of any
                                asset beyond what is described by the seller.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Inspections</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Inspections are allowed by appointment where available — especially for trucks and equipment</li>
                                <li>Inspection availability, scheduling instructions, and location are posted by the seller on the auction page</li>
                                <li>If you have questions about a listing, please ask the seller through our secure communication window</li>
                                <li>We strongly recommend inspecting and/or asking questions before placing a bid or confirming a purchase</li>
                                <li>Failure to inspect or ask questions before purchasing is at the buyer's sole risk</li>
                            </ul>
                        </div>

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

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Payment</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Remaining purchase balances are generally payable by wire transfer, ACH or another approved electronic payment method when offered, or other payment methods specifically approved by SoldWerX</li>
                                <li>Credit or debit cards may be accepted for additional amounts when specifically permitted by SoldWerX and its payment processor</li>
                                <li>Cash is accepted only when expressly authorized by SoldWerX, and only through the payment instructions provided on the platform — never off-platform</li>
                                <li>Personal checks are not accepted unless expressly approved in writing</li>
                                <li>All payments must be made in USD and to the SoldWerX collection account</li>
                                <li><strong>Winning Bidder Deposit:</strong> A 5% non-refundable Winning Bidder Deposit (maximum $5,000) is automatically charged to your registered payment method when you win — that is, when the auction closes with you as the highest bidder and the reserve, if any, has been met. This deposit is credited toward your total balance.</li>
                                <li><strong>Payment Deadline:</strong> Full payment of the remaining balance is due within <strong>24 hours</strong> of auction completion, unless otherwise stated in the auction-specific terms. Failure to pay may result in forfeiture of your deposit.</li>
                                <li>Assets will not be released until full payment clears</li>
                                <li>Title and ownership pass only after full payment is received and confirmed</li>
                                <li>Funds are released to the seller only after payment has fully cleared, the asset has been collected or delivered, all transaction conditions are satisfied, and no disputes or concerns are pending</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Collection & Delivery</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Buyer and seller are responsible for arranging and managing pickup, freight, or delivery between themselves</li>
                                <li>Collection and pickup logistics — including pickup address, scheduling, and site-access instructions — are arranged with the seller through the platform's communication window after payment is confirmed</li>
                                <li>Delivery partner details, tracking identifiers, and estimated delivery dates are entered by the seller and visible to the buyer on the platform</li>
                                <li>Risk of loss or damage transfers to the buyer upon collection or delivery</li>
                                <li>Buyers are responsible for insurance and any applicable transport permits from the moment of collection or delivery</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Communication Rules</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>All communication between buyers and sellers must go through the SoldWerX platform</li>
                                <li>Sharing personal contact information (phone numbers, email addresses, physical addresses, etc.) for the purpose of communicating or transacting outside the platform is prohibited</li>
                                <li>After payment is confirmed, buyers and sellers may exchange the pickup and delivery logistics necessary to complete collection — including pickup address, scheduling, and site-access instructions — through the platform's communication window</li>
                                <li>Delivery partner details, tracking identifiers, and estimated delivery dates are entered by the seller and visible to the buyer on the platform</li>
                                <li>Off-platform communication may result in account suspension</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Default & Enforcement</h2>
                            <p className="text-gray-700 mb-2">If payment is not completed as required, we may:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Forfeit your deposit</li>
                                <li>Cancel the sale and relist the asset</li>
                                <li>Seek recovery of any losses or costs incurred</li>
                                <li>Suspend or permanently terminate the buyer's account</li>
                                <li>Report to relevant authorities if fraud is suspected</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
                            <p className="text-gray-700">
                                To the extent permitted by law, SoldWerX's total liability is limited to the
                                purchase price of the asset in question. We are not liable for indirect or consequential
                                losses including but not limited to lost profits or business interruption.
                                This does not limit liability for fraud, death, or personal injury caused by negligence.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law & Disputes</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>This Agreement is governed by the laws of the State of Michigan</li>
                                <li>Any disputes shall be resolved by the courts of the State of Michigan</li>
                            </ul>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Entire Agreement</h2>
                            <p className="text-gray-700">
                                This Buyer Agreement, together with our Terms of Use and Privacy Policy, constitutes the
                                entire agreement between you and SoldWerX regarding your purchases on our platform.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance & Contact</h2>
                            <p className="text-gray-700 mb-4">
                                By using SoldWerX, you acknowledge that you have read, understood, and agree to this Buyer Agreement.
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
                                This Buyer Agreement was last updated on October 29, 2026. It forms an integral part of
                                the contract for every asset purchase made through SoldWerX.
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
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default BuyerAgreement;