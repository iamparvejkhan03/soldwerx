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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Auction Terms & Conditions</h1>
                    <p className="text-gray-600 mb-6">SOLDWERX INC. | Revised: October 27, 2026</p>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <p className="text-red-800 font-semibold mb-2">IMPORTANT – PLEASE READ</p>
                        <p className="text-red-700 text-sm">
                            These Terms govern participation in auctions conducted through SOLDWERX INC.
                            By registering for an account, accepting these Terms, placing a bid, or purchasing property,
                            you agree to be legally bound by these Terms. All property is sold AS-IS, WHERE-IS.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">

                        {/* Intro */}
                        <div className="mb-8 text-gray-700">
                            <p className="mb-4">
                                These Auction Terms & Conditions ("Terms") govern participation in auctions conducted through SOLDWERX INC. ("SOLDWERX," "we," "us," or "our").
                            </p>
                            <p className="mb-4">
                                By registering for an account, accepting these Terms, placing a bid, or purchasing property through SOLDWERX, each bidder and Buyer agrees to be legally bound by these Terms together with all auction-specific terms, lot-specific disclosures, payment instructions, removal instructions, and other conditions posted for the applicable auction or lot.
                            </p>
                            <p>
                                Auction-specific terms may supplement these Terms. If an auction-specific term directly conflicts with these general Terms, the auction-specific term will control for that particular auction to the extent permitted by law.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. SOLDWERX ROLE</h2>
                            <p className="text-gray-700 mb-3">
                                SOLDWERX operates an auction and asset-sale platform and may act as auctioneer, broker, marketplace operator, agent for a Seller, or Seller of property, depending upon the particular transaction.
                            </p>
                            <p className="text-gray-700 mb-3">
                                Unless a lot specifically identifies SOLDWERX as the owner or Seller, property is offered on behalf of a third-party owner or consignor ("Seller").
                            </p>
                            <p className="text-gray-700 mb-3">
                                SOLDWERX does not acquire ownership of property merely by listing, advertising, displaying, storing, or facilitating the auction of that property.
                            </p>
                            <p className="text-gray-700">
                                The applicable lot description and auction-specific terms will identify material information concerning the property and transaction when available.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. REGISTRATION & BIDDER VERIFICATION</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>All bidders must register and be approved before bidding.</li>
                                <li>Bidders must be at least 18 years old and legally capable of entering into a binding contract.</li>
                            </ul>
                            <p className="text-gray-700 mb-2">SOLDWERX may require:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Legal name</li>
                                <li>Permanent street address</li>
                                <li>Valid telephone number</li>
                                <li>Valid email address</li>
                                <li>Valid credit or debit card</li>
                                <li>Government-issued identification</li>
                                <li>Business information</li>
                                <li>Tax-exemption documentation</li>
                                <li>Bank or financial information</li>
                                <li>Proof of funds</li>
                                <li>Additional identity or bidder verification</li>
                            </ul>
                            <p className="text-gray-700 mb-3">A valid payment method must be maintained on the bidder's account unless SOLDWERX approves another arrangement.</p>
                            <p className="text-gray-700 mb-3">SOLDWERX may require additional verification for high-value bidding.</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bids of $100,000 or more may be subject to additional bidder verification.</li>
                                <li>Bidding of $250,000 or more may require prior administrative approval, proof of funds, bank verification, or other documentation requested by SOLDWERX.</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. PAYMENT METHOD ON FILE</h2>
                            <p className="text-gray-700 mb-3">
                                By registering a payment method, the bidder authorizes SOLDWERX and/or its payment processor to securely store or tokenize the payment credential for use in accordance with these Terms.
                            </p>
                            <p className="text-gray-700 mb-3">
                                The bidder specifically authorizes SOLDWERX to automatically charge the Winning Bidder Deposit described in Section 8 if the bidder becomes the successful Buyer.
                            </p>
                            <p className="text-gray-700 mb-3">
                                SOLDWERX does not require a large monetary authorization hold merely to participate in ordinary bidding unless an individual auction expressly provides otherwise.
                            </p>
                            <p className="text-gray-700">
                                Unsuccessful bidders are not charged a Winning Bidder Deposit.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. ACCOUNT SECURITY</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bidders are responsible for maintaining the security of their usernames, passwords, authentication methods, devices, and accounts.</li>
                                <li>Unless SOLDWERX determines otherwise because of fraud, unauthorized access, or another legally sufficient reason, bids submitted through a registered account will be attributed to the registered bidder.</li>
                                <li>A bidder who believes an account has been compromised must notify SOLDWERX immediately.</li>
                            </ul>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. BIDS & AUCTION COMPLETION</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>A bid constitutes an offer to purchase the property at the amount bid subject to these Terms.</li>
                                <li>An auction sale becomes complete when the SOLDWERX auction system closes the applicable lot and identifies the successful bidder, or when completion is otherwise announced in accordance with applicable law.</li>
                                <li>After the sale has been completed, the winning bid is binding and the successful bidder becomes the Buyer.</li>
                                <li>Prior to completion of the auction, a bidder may have rights to retract a bid under applicable law.</li>
                                <li>Where applicable law permits a bid retraction before completion, the bidder must promptly communicate the retraction through the available platform procedure or directly to SOLDWERX before the auction is completed.</li>
                                <li>A valid retraction does not revive a previous bid.</li>
                                <li>SOLDWERX may suspend or terminate bidding privileges where retractions or bidding activity reasonably indicate fraud, manipulation, collusion, disruption, or abuse of the auction process. A bidder will not be penalized merely for exercising a right that applicable law expressly provides.</li>
                                <li>SOLDWERX's electronic records regarding bids, bid amounts, timestamps, auction extensions, and closing times will control absent manifest error.</li>
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. EXTENDED BIDDING / SOFT CLOSE</h2>
                            <p className="text-gray-700 mb-3">Unless different terms are posted for a specific auction, SOLDWERX may use an extended-bidding or "soft-close" system.</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>If a qualifying bid is received during the final two minutes of bidding, the closing time for that lot may automatically reset or extend so that approximately two minutes remain.</li>
                                <li>This process may continue until the applicable extension period passes without another qualifying bid.</li>
                                <li>The auction or lot page will display the applicable closing procedure.</li>
                                <li>The purpose of extended bidding is to provide bidders a reasonable opportunity to respond to bids placed near the scheduled closing time.</li>
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. RESERVES & PROHIBITION ON SHILL BIDDING</h2>
                            <p className="text-gray-700 mb-3">Unless specifically identified as Absolute or No Reserve, property may be offered subject to a reserve price.</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-4">
                                <li>A reserve may be enforced through the SOLDWERX auction system without disclosure of the reserve amount unless disclosure is required by law.</li>
                                <li>Property offered with reserve may be withdrawn before completion of the sale to the extent permitted by applicable law.</li>
                            </ul>
                            <p className="font-semibold text-gray-900 mb-2">Seller Bidding / Shill Bidding</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SOLDWERX prohibits false, fictitious, collusive, or shill bidding.</li>
                                <li>A Seller, owner, employee, agent, representative, family member, or other person acting on behalf of a Seller may not place bids for the purpose of artificially increasing the selling price.</li>
                                <li>A Seller may not circumvent a reserve price by bidding against legitimate bidders.</li>
                                <li>Reserve prices are to be administered through the SOLDWERX reserve system or other disclosed auction procedure.</li>
                                <li>SOLDWERX may cancel bids, suspend accounts, terminate listings, or take other appropriate action where manipulation or shill bidding is suspected.</li>
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. NON-REFUNDABLE WINNING BIDDER DEPOSIT</h2>
                            <p className="text-gray-700 mb-3">No Winning Bidder Deposit is charged merely to participate in an auction.</p>
                            <p className="font-bold text-gray-900 mb-3">UNSUCCESSFUL BIDDERS ARE NOT CHARGED.</p>
                            <p className="text-gray-700 mb-2">Upon completion of an auction, the successful Buyer authorizes SOLDWERX to automatically charge a:</p>
                            <div className="bg-yellow-50 p-4 rounded mb-3">
                                <p className="text-red-600 font-bold text-center mb-1">5% NON-REFUNDABLE WINNING BIDDER DEPOSIT</p>
                                <p className="text-red-600 text-center text-sm">(Maximum deposit: $5,000)</p>
                            </div>
                            <p className="text-gray-700 mb-3">Calculated from the winning bid price, subject to a maximum of $5,000.</p>
                            <p className="text-gray-700 mb-3">The deposit is calculated from the winning bid before addition of the Buyer's Premium, sales tax, shipping, storage, or other applicable charges.</p>
                            <p className="text-gray-700 mb-3">The Winning Bidder Deposit is not an additional fee when the Buyer completes the transaction. The deposit will be credited against the total amount owed by the Buyer.</p>
                            <p className="text-gray-700 mb-3">If the Buyer defaults, fails to pay, refuses to complete the purchase, or otherwise breaches the purchase obligation, the Winning Bidder Deposit is non-refundable to the fullest extent permitted by applicable law and may be retained and applied against losses, damages, administrative expenses, resale losses, collection expenses, or other amounts resulting from the default.</p>
                            <p className="text-gray-700 mb-3">Any retained deposit will be credited against damages or other amounts ultimately recovered from the Buyer so that SOLDWERX and/or Seller do not receive a duplicative recovery.</p>
                            <p className="text-gray-700 mb-3">If applicable law requires return of any portion of a deposit exceeding amounts lawfully retainable following a Buyer default, SOLDWERX will comply with that requirement.</p>
                            <p className="text-gray-700">
                                If the transaction cannot be completed because of Seller default, lack of ownership, inability to convey required ownership documentation, or cancellation by SOLDWERX through no fault of the Buyer, amounts collected from the Buyer for the cancelled transaction will be refunded as provided in these Terms and applicable law.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. BUYER'S PREMIUM</h2>
                            <p className="text-gray-700 mb-3">
                                A buyer's premium may apply in addition to the winning bid. The applicable rate or fee will be disclosed on the auction or individual lot listing before bidding.
                            </p>
                            <p className="text-gray-700">
                                Buyer's premiums may vary by auction or lot. By placing a bid, the bidder agrees to the buyer's premium disclosed for that auction or lot.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. SALES TAX</h2>
                            <p className="text-gray-700 mb-3">Applicable sales or use tax will be calculated and collected as required by law.</p>
                            <p className="text-gray-700 mb-2">Tax treatment may depend upon factors including:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Property location</li>
                                <li>Buyer location</li>
                                <li>Pickup location</li>
                                <li>Shipping destination</li>
                                <li>Type of property</li>
                                <li>Vehicle or equipment classification</li>
                                <li>Applicable state and local laws</li>
                                <li>Buyer tax-exemption status</li>
                            </ul>
                            <p className="text-gray-700 mb-3">Where required by law, sales tax may apply to the winning bid, Buyer's Premium, or other taxable charges.</p>
                            <p className="text-gray-700 mb-3">A Buyer claiming exemption is responsible for submitting valid and complete exemption documentation before the applicable payment is processed.</p>
                            <p className="text-gray-700 mb-3">SOLDWERX may use a third-party service or payment provider to calculate and collect taxes.</p>
                            <p className="text-gray-700">
                                SOLDWERX does not guarantee that a particular Buyer or transaction qualifies for tax-exempt treatment.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. PAYMENT METHODS</h2>
                            <p className="text-gray-700 mb-3">The Winning Bidder Deposit may be charged to the successful bidder's registered credit or debit card.</p>
                            <p className="text-gray-700 mb-2">Remaining purchase balances will generally be payable by:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Wire transfer</li>
                                <li>ACH or approved electronic payment method when offered</li>
                                <li>Other payment methods specifically approved by SOLDWERX</li>
                                <li>Cash only when expressly authorized by SOLDWERX</li>
                            </ul>
                            <p className="text-gray-700 mb-3">Credit or debit cards may be accepted for additional amounts when specifically permitted by SOLDWERX and its payment processor.</p>
                            <p className="text-gray-700 mb-3">SOLDWERX may require wire transfer regardless of invoice amount based upon transaction size, asset type, Buyer history, fraud-prevention concerns, title requirements, processor requirements, or other reasonable risk considerations.</p>
                            <p className="text-gray-700">Personal checks are not accepted unless expressly approved in writing.</p>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. PAYMENT DEADLINE</h2>
                            <p className="text-gray-700 mb-3">The Winning Bidder Deposit is due and may be charged immediately following completion of the auction.</p>
                            <p className="text-gray-700 mb-2">Unless different terms are posted for the particular auction:</p>
                            <div className="bg-red-50 p-4 rounded mb-3">
                                <p className="text-red-700 font-bold text-center">FULL PAYMENT IS DUE WITHIN 24 HOURS OF AUCTION COMPLETION.</p>
                            </div>
                            <p className="text-gray-700 mb-3">The Winning Bidder Deposit does not extend the deadline for payment of the remaining balance.</p>
                            <p className="text-gray-700">No property will be released until all required payment has been received and cleared to SOLDWERX's satisfaction.</p>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. FAILED WINNING BIDDER DEPOSIT</h2>
                            <p className="text-gray-700 mb-2">If the automatic Winning Bidder Deposit charge is declined, rejected, reversed, blocked, or otherwise unsuccessful:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>The winning bid remains binding following completion of the auction.</li>
                                <li>A failed deposit charge does not automatically cancel the sale.</li>
                            </ul>
                            <p className="text-gray-700 mb-2">SOLDWERX may immediately:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Notify the Buyer</li>
                                <li>Suspend further bidding privileges</li>
                                <li>Require another payment method</li>
                                <li>Retry the payment where permitted</li>
                                <li>Require immediate payment by wire transfer or another approved method</li>
                                <li>Place the Buyer's account on hold</li>
                                <li>Exercise remedies available for Buyer default</li>
                            </ul>
                            <p className="text-gray-700">The Buyer remains responsible for timely payment of the deposit and the entire purchase price.</p>
                        </div>

                        {/* Section 14 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. CHARGEBACKS & PAYMENT DISPUTES</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>A Buyer agrees not to initiate an improper chargeback or payment reversal relating to a valid auction transaction or properly authorized Winning Bidder Deposit.</li>
                                <li>Nothing in these Terms prevents a Buyer from exercising legitimate rights available under applicable payment card rules or law.</li>
                                <li>A chargeback or payment dispute does not by itself extinguish a Buyer's contractual obligation to pay amounts lawfully due.</li>
                                <li>SOLDWERX reserves all lawful rights relating to unpaid balances, reversed payments, collection expenses, resale losses, storage costs, and other damages caused by Buyer default.</li>
                            </ul>
                        </div>

                        {/* Section 15 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. SELLER AUTHORITY & OWNERSHIP</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Each Seller is required to have legal ownership of the property or lawful authority to sell it.</li>
                                <li>Seller is responsible for providing ownership documentation reasonably required by SOLDWERX.</li>
                                <li>SOLDWERX may refuse, postpone, or cancel the offering of property if satisfactory ownership documentation is not provided.</li>
                                <li>For titled property, applicable title, lien, odometer, disclosure, dealer, auction, and transfer requirements must be satisfied.</li>
                                <li>Where applicable law requires a particular form of title or ownership document for an auction transaction, the required document must be available before completion of the sale.</li>
                            </ul>
                        </div>

                        {/* Section 16 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">16. SELLER FAILURE TO COMPLETE TRANSACTION</h2>
                            <p className="text-gray-700 mb-2">If, after an auction closes, a transaction cannot reasonably be completed because the Seller:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Does not own the property;</li>
                                <li>Does not have legal authority to sell it;</li>
                                <li>Cannot provide ownership documentation represented in the listing;</li>
                                <li>Refuses to complete the transaction;</li>
                                <li>Materially misrepresented ownership or title status; or</li>
                                <li>Otherwise defaults on an obligation necessary to complete the sale,</li>
                            </ul>
                            <p className="text-gray-700 mb-3">SOLDWERX may cancel or unwind the transaction.</p>
                            <p className="text-gray-700 mb-3">If the Buyer is not at fault, SOLDWERX will return amounts collected by SOLDWERX from the Buyer for the cancelled transaction, including the Winning Bidder Deposit and Buyer's Premium, as applicable.</p>
                            <p className="text-gray-700 mb-3">Except for obligations or remedies that cannot lawfully be limited or waived, and except for SOLDWERX's own fraud, willful misconduct, or other independently actionable conduct, refund of amounts collected by SOLDWERX may constitute the Buyer's monetary remedy against SOLDWERX arising solely from the Seller's inability or refusal to complete the transaction.</p>
                            <p className="text-gray-700">Nothing in these Terms eliminates rights the Buyer may have directly against the Seller.</p>
                        </div>

                        {/* Section 17 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">17. ALL PROPERTY SOLD AS-IS, WHERE-IS</h2>
                            <p className="text-gray-700 mb-3">Unless expressly stated otherwise in writing:</p>
                            <div className="bg-yellow-50 p-4 rounded mb-3">
                                <p className="text-red-600 font-bold text-center">ALL PROPERTY IS SOLD AS-IS, WHERE-IS, WITH ALL FAULTS AND WITHOUT WARRANTY.</p>
                            </div>
                            <p className="text-gray-700 mb-3">To the fullest extent permitted by law, SOLDWERX and Seller disclaim implied warranties including merchantability and fitness for a particular purpose.</p>
                            <p className="text-gray-700 mb-2">SOLDWERX and Seller do not warrant:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                                <div>Mechanical condition</div>
                                <div>Electrical condition</div>
                                <div>Structural condition</div>
                                <div>Operating condition</div>
                                <div>Mileage</div>
                                <div>Hours</div>
                                <div>Service history</div>
                                <div>Remaining useful life</div>
                                <div>Completeness</div>
                                <div>Authenticity</div>
                                <div>Model year</div>
                                <div>Manufacturer specifications</div>
                                <div>Serial numbers</div>
                                <div>VIN information</div>
                                <div>Title status except as expressly stated</div>
                                <div>Regulatory compliance</div>
                                <div>Fitness for any particular use</div>
                            </div>
                            <p className="text-gray-700">Nothing in these Terms excludes liability or remedies that cannot legally be excluded or waived.</p>
                        </div>

                        {/* Section 18 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">18. LOT DESCRIPTIONS & PHOTOGRAPHS</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SOLDWERX makes reasonable efforts to provide useful descriptions, photographs, VINs, serial numbers, mileage, hours, specifications, and other identifying information.</li>
                                <li>Information may come from Sellers, owners, manufacturers, titles, equipment plates, public records, third-party databases, visual inspections, service records, or other sources.</li>
                                <li>Descriptions and photographs are provided for identification and informational purposes.</li>
                                <li>Unless SOLDWERX expressly warrants a fact in writing, Buyers should independently verify information material to their purchasing decision.</li>
                                <li>Obvious typographical or clerical errors may be corrected.</li>
                                <li>SOLDWERX will not knowingly use an AS-IS disclaimer to conceal intentional material misrepresentation.</li>
                            </ul>
                        </div>

                        {/* Section 19 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">19. INSPECTION & DUE DILIGENCE</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Prospective Buyers are strongly encouraged to inspect property before bidding.</li>
                                <li>Inspection dates, times, locations, and procedures will be posted when available.</li>
                                <li>Buyer is responsible for independently evaluating property before bidding, including obtaining professional mechanical, technical, title, environmental, or other inspections where appropriate.</li>
                                <li>Failure to inspect property does not, by itself, provide grounds to cancel a completed auction purchase.</li>
                            </ul>
                        </div>

                        {/* Section 20 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">20. NO RETURNS</h2>
                            <p className="text-gray-700 mb-3">Auction sales are final.</p>
                            <div className="bg-red-50 p-4 rounded mb-3">
                                <p className="text-red-700 font-bold text-center">NO RETURNS, REFUNDS, EXCHANGES, OR CANCELLATIONS ARE PERMITTED AFTER A COMPLETED SALE EXCEPT WHERE EXPRESSLY AUTHORIZED BY SOLDWERX OR REQUIRED BY LAW.</p>
                            </div>
                            <p className="text-gray-700">This provision does not eliminate rights that cannot legally be waived.</p>
                        </div>

                        {/* Section 21 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">21. VEHICLES & TITLED PROPERTY</h2>
                            <p className="text-gray-700 mb-3">Titles, registrations, certificates of origin, lien releases, bills of sale, or other ownership documents will be provided as stated in the individual lot description.</p>
                            <p className="text-gray-700 mb-3">Buyer must review title information before bidding.</p>
                            <p className="text-gray-700 mb-2">Property may be offered with documentation including, as applicable:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Clear title</li>
                                <li>Salvage title</li>
                                <li>Rebuilt title</li>
                                <li>Certificate of origin</li>
                                <li>Bill of sale</li>
                                <li>Non-titled ownership documentation</li>
                                <li>Other ownership documentation specifically disclosed</li>
                            </ul>
                            <p className="text-gray-700 mb-3">The lot description controls regarding represented ownership documentation.</p>
                            <p className="text-gray-700">For vehicle auctions, SOLDWERX and Seller will comply with applicable licensing, title, odometer, disclosure, dealer, and transfer requirements.</p>
                        </div>

                        {/* Section 22 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">22. TITLE DELIVERY</h2>
                            <p className="text-gray-700 mb-3">SOLDWERX may withhold titles, registrations, bills of sale, lien releases, and other transfer documents until payment has fully cleared.</p>
                            <p className="text-gray-700 mb-2">Title processing may require additional time because of:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Seller documentation</li>
                                <li>Lien releases</li>
                                <li>Government processing</li>
                                <li>Payment clearance</li>
                                <li>Interstate transfers</li>
                                <li>Dealer requirements</li>
                                <li>Applicable title laws</li>
                            </ul>
                            <p className="text-gray-700">SOLDWERX is not responsible for ordinary processing delays outside its reasonable control.</p>
                        </div>

                        {/* Section 23 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">23. SHIPPING, LOADING & TRANSPORTATION</h2>
                            <p className="text-gray-700 mb-2">Unless specifically stated otherwise, Buyer is responsible for:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                                <div>Packing</div>
                                <div>Loading</div>
                                <div>Rigging</div>
                                <div>Shipping</div>
                                <div>Freight</div>
                                <div>Transportation</div>
                                <div>Insurance</div>
                                <div>Permits</div>
                                <div>Export compliance</div>
                                <div>Removal costs</div>
                            </div>
                            <p className="text-gray-700">SOLDWERX does not guarantee availability of loading equipment, forklifts, cranes, docks, labor, rigging services, or transportation unless specifically stated.</p>
                        </div>

                        {/* Section 24 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">24. RELEASE OF PROPERTY</h2>
                            <p className="text-gray-700 mb-2">Property will not be released until:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Required payment has been received;</li>
                                <li>Funds have cleared when required;</li>
                                <li>Any required documentation has been completed; and</li>
                                <li>SOLDWERX has authorized release.</li>
                            </ul>
                            <p className="text-gray-700 mb-3">Buyer may be required to present identification and a paid invoice or release document.</p>
                            <p className="text-gray-700">Third-party transporters may be required to provide written authorization from Buyer.</p>
                        </div>

                        {/* Section 25 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">25. RISK OF LOSS</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Unless auction-specific terms state otherwise, risk of physical loss or damage remains with the Seller until the property is released to the Buyer, Buyer's authorized representative, or Buyer's carrier.</li>
                                <li>If the Buyer fails to remove property by the stated removal deadline after the property has been paid for and made available for pickup, risk of loss may transfer to Buyer upon expiration of that deadline.</li>
                                <li>This allocation of risk does not determine title ownership where applicable law separately governs passage of title.</li>
                                <li>The Seller consignment agreement and applicable auction-specific terms should be interpreted consistently with this section.</li>
                            </ul>
                        </div>

                        {/* Section 26 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">26. REMOVAL DEADLINE</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Each auction may specify a removal period.</li>
                                <li>Buyer must remove purchased property by the stated deadline unless SOLDWERX approves an extension in writing.</li>
                                <li>Buyer is responsible for arranging timely removal.</li>
                            </ul>
                        </div>

                        {/* Section 27 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">27. STORAGE & UNCLAIMED PROPERTY</h2>
                            <p className="text-gray-700 mb-3">Property not removed by the deadline may be subject to reasonable storage charges.</p>
                            <p className="text-gray-700 mb-2">If property remains unclaimed or unremoved following appropriate notice, SOLDWERX and/or Seller may exercise rights available under applicable law, which may include:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Continued storage</li>
                                <li>Relocation</li>
                                <li>Resale</li>
                                <li>Disposal</li>
                                <li>Recovery of expenses</li>
                            </ul>
                            <p className="text-gray-700">Buyer remains responsible for lawful costs arising from failure to timely remove purchased property.</p>
                        </div>

                        {/* Section 28 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">28. REMOVAL DAMAGE</h2>
                            <p className="text-gray-700 mb-3">Buyer is responsible for damage caused during removal by Buyer or Buyer's employees, contractors, riggers, transporters, agents, or representatives.</p>
                            <p className="text-gray-700">Buyer may be required to repair or reimburse damage to buildings, floors, doors, loading areas, utilities, equipment, grounds, or third-party property.</p>
                        </div>

                        {/* Section 29 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">29. HAZARDOUS MATERIALS & FLUIDS</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Buyer is responsible for complying with applicable requirements concerning fuel, oil, hydraulic fluids, batteries, refrigerants, chemicals, hazardous substances, regulated materials, and other environmental or safety matters after responsibility for the property transfers to Buyer.</li>
                                <li>Buyer must comply with applicable environmental, transportation, workplace, and safety laws.</li>
                            </ul>
                        </div>

                        {/* Section 30 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">30. BUYER DEFAULT</h2>
                            <p className="text-gray-700 mb-2">A Buyer may be considered in default if the Buyer:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Fails to pay the Winning Bidder Deposit;</li>
                                <li>Fails to pay the remaining balance by the deadline;</li>
                                <li>Refuses to complete the purchase;</li>
                                <li>Improperly reverses or disputes a valid payment;</li>
                                <li>Provides materially false registration information;</li>
                                <li>Engages in fraud, bid manipulation, collusion, or shill bidding;</li>
                                <li>Fails to timely remove purchased property;</li>
                                <li>Materially violates these Terms; or</li>
                                <li>Otherwise repudiates a completed sale.</li>
                            </ul>
                            <p className="text-gray-700 mb-2">Upon Buyer default, SOLDWERX and/or Seller may exercise any remedy available under these Terms or applicable law, including:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Cancelling the transaction;</li>
                                <li>Retaining and applying the Winning Bidder Deposit to the extent permitted by law;</li>
                                <li>Reselling the property;</li>
                                <li>Suspending or permanently terminating bidding privileges;</li>
                                <li>Recovering the difference between the original sale price and subsequent resale proceeds where permitted;</li>
                                <li>Recovering reasonable storage, transportation, collection, administrative, legal, or resale expenses where permitted;</li>
                                <li>Recovering other provable damages caused by the default.</li>
                            </ul>
                            <p className="text-gray-700 mb-3">Amounts already retained or recovered will be credited appropriately so that SOLDWERX and/or Seller do not receive duplicative recovery for the same loss.</p>
                            <p className="text-gray-700">SOLDWERX may permanently prohibit a defaulting Buyer from participating in future auctions.</p>
                        </div>

                        {/* Section 31 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">31. RESALE FOLLOWING BUYER DEFAULT</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>If property is resold because of Buyer default, SOLDWERX may conduct the resale publicly or privately where permitted by law.</li>
                                <li>The defaulting Buyer may remain liable for losses resulting from the default, including any lawful deficiency between the original transaction and resale, together with recoverable expenses.</li>
                                <li>Any resale will be conducted in a commercially reasonable manner where required by applicable law.</li>
                            </ul>
                        </div>

                        {/* Section 32 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">32. INTERNET BIDDING & TECHNOLOGY</h2>
                            <p className="text-gray-700 mb-3">SOLDWERX auctions may be conducted entirely or partially online.</p>
                            <p className="text-gray-700 mb-2">Bidder acknowledges that online bidding may occasionally involve:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                                <div>Internet interruptions</div>
                                <div>Browser problems</div>
                                <div>Mobile-device issues</div>
                                <div>Network latency</div>
                                <div>Server interruptions</div>
                                <div>Bid-display delays</div>
                                <div>Connection failures</div>
                                <div>Payment-service interruptions</div>
                                <div>Other technical issues</div>
                            </div>
                        </div>

                        {/* Section 33 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">33. PLATFORM INTERRUPTION</h2>
                            <p className="text-gray-700 mb-2">If a material technical problem affects an auction, SOLDWERX may take reasonable action to protect the integrity of the sale, including:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Pausing bidding;</li>
                                <li>Extending bidding;</li>
                                <li>Reopening bidding;</li>
                                <li>Rescheduling an auction;</li>
                                <li>Cancelling affected bids;</li>
                                <li>Cancelling a lot; or</li>
                                <li>Re-running an affected closing process.</li>
                            </ul>
                            <p className="text-gray-700">Any action will be taken in good faith to preserve a fair auction process.</p>
                        </div>

                        {/* Section 34 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">34. WITHDRAWAL OF PROPERTY</h2>
                            <p className="text-gray-700 mb-3">Property may be withdrawn before completion of the auction when permitted by applicable law and the auction terms.</p>
                            <p className="text-gray-700">Once an auction sale has been completed, withdrawal is subject to the rights and obligations created by the completed transaction.</p>
                        </div>

                        {/* Section 35 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">35. SELLER INFORMATION</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SOLDWERX may reasonably rely upon information supplied by Sellers.</li>
                                <li>Sellers are responsible for the accuracy of information they provide concerning ownership, title, liens, condition, specifications, history, and other material facts.</li>
                                <li>Nothing in this provision authorizes SOLDWERX to knowingly publish materially false information.</li>
                            </ul>
                        </div>

                        {/* Section 36 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">36. MATERIAL CHANGES & CORRECTIONS</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>SOLDWERX may correct typographical, clerical, catalog, photographic, or technical errors before or during an auction.</li>
                                <li>SOLDWERX may update lot information when new information becomes available.</li>
                                <li>If SOLDWERX makes a material correction concerning an item during an active auction, reasonable notice will be provided when practicable.</li>
                                <li>Material economic terms such as the applicable Buyer's Premium, Winning Bidder Deposit formula, or other significant financial obligations will not be materially changed after bidding opens without reasonable notice and any opportunity or remedy required by applicable law.</li>
                            </ul>
                        </div>

                        {/* Section 37 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">37. PERSONAL INJURY & PROPERTY DAMAGE</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Persons entering inspection, auction, warehouse, Seller, pickup, loading, or removal locations do so subject to the risks ordinarily associated with those locations and activities.</li>
                                <li>Buyer is responsible for Buyer's employees, contractors, transporters, riggers, agents, and invitees.</li>
                                <li>Nothing in these Terms excludes liability that cannot lawfully be excluded.</li>
                            </ul>
                        </div>

                        {/* Section 38 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">38. INDEMNIFICATION</h2>
                            <p className="text-gray-700 mb-2">To the extent permitted by law, Buyer agrees to indemnify and hold harmless SOLDWERX INC., its officers, directors, employees, agents, representatives, and affiliated entities from claims, damages, losses, liabilities, and expenses arising from:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Buyer's breach of these Terms;</li>
                                <li>Buyer's removal activities;</li>
                                <li>Buyer's transportation of property;</li>
                                <li>Buyer's use or operation of purchased property;</li>
                                <li>Buyer's violation of law; or</li>
                                <li>Acts or omissions of Buyer's employees, contractors, transporters, riggers, or agents.</li>
                            </ul>
                            <p className="text-gray-700">This provision does not require Buyer to indemnify SOLDWERX for SOLDWERX's own fraud, willful misconduct, or liability that applicable law prohibits SOLDWERX from transferring.</p>
                        </div>

                        {/* Section 39 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">39. LIMITATION OF LIABILITY</h2>
                            <p className="text-gray-700 mb-3">To the fullest extent permitted by applicable law, SOLDWERX will not be liable for indirect, incidental, special, exemplary, punitive, or consequential damages arising solely from use of the auction platform or a transaction conducted through it.</p>
                            <p className="text-gray-700">Nothing in these Terms excludes or limits liability for fraud, willful misconduct, gross negligence where it cannot lawfully be limited, or other liability that applicable law does not permit to be excluded.</p>
                        </div>

                        {/* Section 40 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">40. FORCE MAJEURE</h2>
                            <p className="text-gray-700 mb-3">SOLDWERX will not be responsible for delay or inability to perform caused by events reasonably beyond its control, including natural disasters, severe weather, fire, flood, governmental action, widespread communications outages, cyber incidents, payment-network failures, labor disruptions, transportation interruptions, or other similar events.</p>
                            <p className="text-gray-700">SOLDWERX may reasonably postpone, extend, suspend, or reschedule affected auction activity.</p>
                        </div>

                        {/* Section 41 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">41. AUCTION-SPECIFIC TERMS</h2>
                            <p className="text-gray-700 mb-2">Individual auctions or lots may include additional terms concerning:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                                <div>Inspection</div>
                                <div>Removal</div>
                                <div>Loading</div>
                                <div>Payment</div>
                                <div>Deposits</div>
                                <div>Reserves</div>
                                <div>Shipping</div>
                                <div>Titles</div>
                                <div>Taxes</div>
                                <div>Specialty assets</div>
                                <div>Bidder verification</div>
                                <div>Payment methods</div>
                                <div>Closing procedures</div>
                            </div>
                            <p className="text-gray-700">Those terms are incorporated into this agreement.</p>
                        </div>

                        {/* Section 42 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">42. GOVERNING LAW</h2>
                            <p className="text-gray-700 mb-3">Unless otherwise required by applicable law or specifically stated for an auction, these Terms are governed by the laws of the State of Michigan, without regard to conflict-of-law principles.</p>
                            <p className="text-gray-700">Any dispute concerning a SOLDWERX transaction may be brought in a court of competent jurisdiction as permitted by applicable law.</p>
                        </div>

                        {/* Section 43 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">43. SEVERABILITY</h2>
                            <p className="text-gray-700">If a provision of these Terms is held invalid or unenforceable, that provision will be enforced to the maximum extent permitted by law and the remaining provisions will remain effective.</p>
                        </div>

                        {/* Section 44 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">44. NO WAIVER</h2>
                            <p className="text-gray-700">Failure by SOLDWERX to enforce a provision of these Terms on one occasion does not waive the right to enforce that provision or another provision in the future.</p>
                        </div>

                        {/* Section 45 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">45. ELECTRONIC COMMUNICATIONS & AGREEMENT</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Bidder agrees that SOLDWERX may use electronic records and communications in connection with registration, bidding, invoices, payments, notices, and transactions.</li>
                                <li>Registering an account, clicking an acceptance box, or otherwise electronically accepting these Terms constitutes the bidder's electronic agreement.</li>
                                <li>SOLDWERX may retain electronic records showing the date, time, account, auction, acceptance, and version of Terms agreed to by the bidder.</li>
                                <li>Auction reminders, outbid notices, email, text messages, and other notifications may be provided as a convenience. Failure to receive a courtesy notification does not extend an auction closing time or payment deadline displayed through the platform.</li>
                            </ul>
                        </div>

                        {/* Section 46 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">46. ENTIRE AGREEMENT</h2>
                            <p className="text-gray-700 mb-2">These Terms, together with:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5 mb-3">
                                <li>Auction-specific terms;</li>
                                <li>Lot-specific disclosures;</li>
                                <li>Posted payment instructions;</li>
                                <li>Posted removal instructions;</li>
                                <li>Seller disclosures applicable to the lot; and</li>
                                <li>Other terms expressly incorporated into the applicable auction,</li>
                            </ul>
                            <p className="text-gray-700">constitute the agreement governing participation in the auction.</p>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6 mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">SOLDWERX INC.</p>
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
                                These Terms were last revised on October 27, 2026. If you have questions about these Terms,
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
                            <Link
                                to="/seller-agreement"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Seller Agreement
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TermsOfUse;