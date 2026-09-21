import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PopUpContextProvider } from './contexts/PopUpContextProvider';
import { Protected, LoadingSpinner } from './components';
import { AuthProvider } from './contexts/AuthContext.jsx';

const Home = lazy(() => import('./pages/Home'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Auctions = lazy(() => import('./pages/Auctions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PaymentRefundPolicy = lazy(() => import('./pages/PaymentRefundPolicy'));
const SellerAgreement = lazy(() => import('./pages/SellerAgreement'));
const BuyerAgreement = lazy(() => import('./pages/BuyerAgreement'));
const SingleAuction = lazy(() => import('./pages/SingleAuction'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Liquidate = lazy(() => import('./pages/Liquidate'));
const SellWithUs = lazy(() => import('./pages/SellWithUs'));
const Events = lazy(() => import('./pages/Events'));
const SingleEvent = lazy(() => import('./pages/SingleEvent'));

{/* Seller Pages */ }
const SellerLayout = lazy(() => import('./pages/seller/Layout'));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const CreateAuctionSeller = lazy(() => import('./pages/seller/CreateAuction'));
const EditAuctionSeller = lazy(() => import('./pages/seller/EditAuction'));
const SellerAllAuctions = lazy(() => import('./pages/seller/AllAuctions'));
const SellerAllOffers = lazy(() => import('./pages/seller/AllOffers'));
const SoldAuctionsSeller = lazy(() => import('./pages/seller/SoldAuctions'));
const BidHistorySeller = lazy(() => import('./pages/seller/BidHistory'));
const SellerProfile = lazy(() => import('./pages/seller/Profile'));
const SellerBilling = lazy(() => import('./pages/seller/Billing'));
const SellerCommunication = lazy(() => import('./pages/seller/Communication'));
const SellerPayoutMethods = lazy(() => import('./pages/seller/PayoutMethods'));
const SellerPayouts = lazy(() => import('./pages/seller/Payouts'));
const CreateEventSeller = lazy(() => import('./pages/seller/CreateEvent'));
const EditEventSeller = lazy(() => import('./pages/seller/EditEvent'));
const SellerAllEvents = lazy(() => import('./pages/seller/AllEvents'));

{/* Broker Pages */ }
const BrokerLayout = lazy(() => import('./pages/broker/Layout'));
const BrokerDashboard = lazy(() => import('./pages/broker/Dashboard'));
const CreateAuctionBroker = lazy(() => import('./pages/broker/CreateAuction'));
const EditAuctionBroker = lazy(() => import('./pages/broker/EditAuction'));
const BrokerAllAuctions = lazy(() => import('./pages/broker/AllAuctions'));
const BrokerAllOffers = lazy(() => import('./pages/broker/AllOffers'));
const SoldAuctionsBroker = lazy(() => import('./pages/broker/SoldAuctions'));
const BidHistoryBroker = lazy(() => import('./pages/broker/BidHistory'));
const BrokerProfile = lazy(() => import('./pages/broker/Profile'));
const BrokerBilling = lazy(() => import('./pages/broker/Billing'));

{/* Bidder Pages */ }
const BidderLayout = lazy(() => import('./pages/bidder/Layout'));
const BidderDashboard = lazy(() => import('./pages/bidder/Dashboard'));
const Watchlist = lazy(() => import('./pages/bidder/Watchlist'));
const ActiveAuctions = lazy(() => import('./pages/bidder/ActiveAuctions'));
const MyBids = lazy(() => import('./pages/bidder/MyBids'));
const MyOffers = lazy(() => import('./pages/bidder/MyOffers'));
const WonAuctions = lazy(() => import('./pages/bidder/WonAuctions'));
const BidderProfile = lazy(() => import('./pages/bidder/Profile'));
const BidderBilling = lazy(() => import('./pages/bidder/Billing'));
const BidderCommunication = lazy(() => import('./pages/bidder/Communication'));
const BidderPayments = lazy(() => import('./pages/bidder/Payments'));
const ActiveEvents = lazy(() => import('./pages/bidder/ActiveEvents'));

{/* Staff Pages */ }
const StaffLayout = lazy(() => import('./pages/staff/Layout'));
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffAllUsers = lazy(() => import('./pages/staff/AllUsers'));
const StaffAllAuctions = lazy(() => import('./pages/staff/AllAuctions'));
const StaffCreateAuction = lazy(() => import('./pages/staff/CreateAuction'));
const StaffEditAuction = lazy(() => import('./pages/staff/EditAuction'));
const StaffUserQueries = lazy(() => import('./pages/staff/UserQueries'));
const StaffProfile = lazy(() => import('./pages/staff/Profile'));
const StaffComments = lazy(() => import('./pages/staff/Comments'));
const StaffCommissions = lazy(() => import('./pages/staff/Commissions'));
const StaffBidHistory = lazy(() => import('./pages/staff/BidHistory'));
const StaffAllOffers = lazy(() => import('./pages/staff/AllOffers'));
const StaffTransactions = lazy(() => import('./pages/staff/Transactions'));
const StaffCategories = lazy(() => import('./pages/staff/Categories'));
const StaffLiquidationRequests = lazy(() => import('./pages/staff/LiquidationRequests'));
const StaffSellRequests = lazy(() => import('./pages/staff/SellRequests'));
const StaffPayouts = lazy(() => import('./pages/staff/Payouts'));
// const StaffPayoutMethods = lazy(() => import('./pages/staff/PayoutMethods'));
const StaffAddStaff = lazy(() => import('./pages/staff/AddStaff'));
const StaffAllStaff = lazy(() => import('./pages/staff/AllStaff'));
const StaffEditStaff = lazy(() => import('./pages/staff/EditStaff'));
const StaffAllCommunications = lazy(() => import('./pages/staff/AllCommunications'));
const StaffCommunication = lazy(() => import('./pages/staff/Communication'));
const StaffAllEvents = lazy(() => import('./pages/staff/AllEvents'));
const StaffCreateEvent = lazy(() => import('./pages/staff/CreateEvent'));
const StaffEditEvent = lazy(() => import('./pages/staff/EditEvent'));
const StaffTaxSettings = lazy(() => import('./pages/staff/TaxSettings'));

{/* Admin Pages */ }
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AllUsers = lazy(() => import('./pages/admin/AllUsers'));
const AddStaff = lazy(() => import('./pages/admin/AddStaff'));
const AllStaff = lazy(() => import('./pages/admin/AllStaff'));
const EditStaff = lazy(() => import('./pages/admin/EditStaff'));
const AdminAllAuctions = lazy(() => import('./pages/admin/AllAuctions'));
const AdminCreateAuction = lazy(() => import('./pages/admin/CreateAuction'));
const AdminEditAuction = lazy(() => import('./pages/admin/EditAuction'));
const UserQueries = lazy(() => import('./pages/admin/UserQueries'));
const LiquidationRequests = lazy(() => import('./pages/admin/LiquidationRequests'));
const SellRequests = lazy(() => import('./pages/admin/SellRequests'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminComments = lazy(() => import('./pages/admin/Comments'));
const Commissions = lazy(() => import('./pages/admin/Commissions'));
const AdminBidHistory = lazy(() => import('./pages/admin/BidHistory'));
const AdminAllOffers = lazy(() => import('./pages/admin/AllOffers'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const AllCommunications = lazy(() => import('./pages/admin/AllCommunications'));
const AdminCommunication = lazy(() => import('./pages/admin/Communication'));
const AdminPayouts = lazy(() => import('./pages/admin/Payouts'));
const AdminPayoutMethods = lazy(() => import('./pages/admin/PayoutMethods'));
const AdminAllEvents = lazy(() => import('./pages/admin/AllEvents'));
const AdminCreateEvent = lazy(() => import('./pages/admin/CreateEvent'));
const AdminEditEvent = lazy(() => import('./pages/admin/EditEvent'));
const AdminTaxSettings = lazy(() => import('./pages/admin/TaxSettings'));

createRoot(document.getElementById('root')).render(
    //<StrictMode>
    <AuthProvider>
        <PopUpContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<App />}>
                        <Route path='' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Home /></Suspense>} />

                        <Route path='/contact' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Contact /></Suspense>} />

                        <Route path='/about' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><About /></Suspense>} />

                        <Route path='/faqs' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><FAQs /></Suspense>} />

                        <Route path='/liquidate' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Liquidate /></Suspense>} />

                        <Route path='/sell-with-us' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SellWithUs /></Suspense>} />

                        <Route path='/login' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Login /></Suspense>} />

                        <Route path='/register' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Register /></Suspense>} />

                        <Route path='/auctions' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Auctions /></Suspense>} />

                        <Route path='/auction/:id' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SingleAuction /></Suspense>} />

                        <Route path='/privacy-policy' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PrivacyPolicy /></Suspense>} />

                        <Route path='/terms-of-use' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><TermsOfUse /></Suspense>} />

                        <Route path='/payment-refund-policy' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PaymentRefundPolicy /></Suspense>} />

                        <Route path='/seller-agreement' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SellerAgreement /></Suspense>} />

                        <Route path='/buyer-agreement' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><BuyerAgreement /></Suspense>} />

                        <Route path='/reset-password' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><ResetPassword /></Suspense>} />

                        <Route path='/events' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Events /></Suspense>} />

                        <Route path='/event/:id' element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SingleEvent /></Suspense>} />

                    </Route>

                    {/* Seller Layout */}
                    <Route path='/seller' element={<Protected authetication={true} userType='seller'><SellerLayout /></Protected>}>
                        {/* Seller Dashboard */}
                        <Route
                            path='/seller/dashboard'
                            index={true}
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerDashboard />
                                </Suspense>
                            }
                        />
                        {/* Seller Create Auction */}
                        <Route
                            path='/seller/auctions/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <CreateAuctionSeller />
                                </Suspense>
                            }
                        />
                        {/* Seller Edit Auction */}
                        <Route
                            path='/seller/auctions/edit/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <EditAuctionSeller />
                                </Suspense>
                            }
                        />
                        {/* Seller Live Auctions */}
                        <Route
                            path='/seller/auctions/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerAllAuctions />
                                </Suspense>
                            }
                        />
                        {/* Seller All Offers */}
                        <Route
                            path='/seller/offers/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerAllOffers />
                                </Suspense>
                            }
                        />
                        {/* Seller Won Auctions */}
                        <Route
                            path='/seller/auctions/sold'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SoldAuctionsSeller />
                                </Suspense>
                            }
                        />
                        {/* Seller Auctions Bid History */}
                        <Route
                            path='/seller/bids/history'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BidHistorySeller />
                                </Suspense>
                            }
                        />
                        {/* Seller Profile */}
                        <Route
                            path='/seller/profile'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerProfile />
                                </Suspense>
                            }
                        />
                        {/* Seller Communication */}
                        <Route
                            path='/seller/communication/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerCommunication />
                                </Suspense>
                            }
                        />
                        {/* Seller Payout methods */}
                        <Route
                            path='/seller/payout-methods'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerPayoutMethods />
                                </Suspense>
                            }
                        />

                        {/* Seller Payouts */}
                        <Route
                            path='/seller/payouts'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerPayouts />
                                </Suspense>
                            }
                        />

                        {/* Seller Billing */}
                        {/* <Route
                                path='/seller/billing'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerBilling />
                                    </Suspense>
                                }
                            /> */}

                        {/* Seller Create Event */}
                        <Route
                            path='/seller/events/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <CreateEventSeller />
                                </Suspense>
                            }
                        />
                        {/* Seller Edit Event */}
                        <Route
                            path='/seller/events/edit/:eventId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <EditEventSeller />
                                </Suspense>
                            }
                        />
                        {/* Seller Live Events */}
                        <Route
                            path='/seller/events/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellerAllEvents />
                                </Suspense>
                            }
                        />
                    </Route>

                    {/* Broker Layout */}
                    <Route path='/broker' element={<Protected authetication={true} userType='broker'><BrokerLayout /></Protected>}>
                        {/* Broker Dashboard */}
                        <Route
                            path='/broker/dashboard'
                            index={true}
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BrokerDashboard />
                                </Suspense>
                            }
                        />
                        {/* Broker Create Auction */}
                        <Route
                            path='/broker/auctions/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <CreateAuctionBroker />
                                </Suspense>
                            }
                        />
                        {/* Broker Edit Auction */}
                        <Route
                            path='/broker/auctions/edit/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <EditAuctionBroker />
                                </Suspense>
                            }
                        />
                        {/* Broker Live Auctions */}
                        <Route
                            path='/broker/auctions/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BrokerAllAuctions />
                                </Suspense>
                            }
                        />
                        {/* Broker All Offers */}
                        {/* <Route
                            path='/broker/offers/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BrokerAllOffers />
                                </Suspense>
                            }
                        /> */}
                        {/* Broker Won Auctions */}
                        <Route
                            path='/broker/auctions/sold'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SoldAuctionsBroker />
                                </Suspense>
                            }
                        />
                        {/* Broker Auctions Bid History */}
                        <Route
                            path='/broker/bids/history'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BidHistoryBroker />
                                </Suspense>
                            }
                        />
                        {/* Broker Profile */}
                        <Route
                            path='/broker/profile'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BrokerProfile />
                                </Suspense>
                            }
                        />

                        {/* Broker Billing */}
                        {/* <Route
                                path='/broker/billing'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BrokerBilling />
                                    </Suspense>
                                }
                            /> */}
                    </Route>

                    {/* Bidder Layout */}
                    <Route path='/bidder' element={<Protected authetication={true} userType='bidder'><BidderLayout /></Protected>}>
                        {/* Bidder Dashboard */}
                        <Route
                            path='/bidder/dashboard'
                            index={true}
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BidderDashboard />
                                </Suspense>
                            }
                        />

                        {/* Bidder Watchlist */}
                        <Route
                            path='/bidder/watchlist'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <Watchlist />
                                </Suspense>
                            }
                        />

                        {/* Bidder Watchlist */}
                        <Route
                            path='/bidder/auctions/active'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <ActiveAuctions />
                                </Suspense>
                            }
                        />

                        {/* Bidder My Bids */}
                        <Route
                            path='/bidder/bids'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <MyBids />
                                </Suspense>
                            }
                        />

                        {/* Bidder My Offers */}
                        <Route
                            path='/bidder/offers'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <MyOffers />
                                </Suspense>
                            }
                        />

                        {/* Bidder My Bids */}
                        <Route
                            path='/bidder/auctions/won'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <WonAuctions />
                                </Suspense>
                            }
                        />
                        {/* Bidder Profile */}
                        <Route
                            path='/bidder/profile'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BidderProfile />
                                </Suspense>
                            }
                        />
                        {/* Bidder Communication */}
                        <Route
                            path='/bidder/communication/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BidderCommunication />
                                </Suspense>
                            }
                        />
                        {/* Bidder Communication */}
                        <Route
                            path='/bidder/payments'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <BidderPayments />
                                </Suspense>
                            }
                        />

                        {/* Bidder Billing */}
                        {/* <Route
                                path='/bidder/billing'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderBilling />
                                    </Suspense>
                                }
                            /> */}

                        {/* Bidder Watchlist */}
                        <Route
                            path='/bidder/events/active'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <ActiveEvents />
                                </Suspense>
                            }
                        />
                    </Route>

                    {/* Staff Layout */}
                    <Route path='/staff' element={<Protected authetication={true} userType='staff'><StaffLayout /></Protected>} >
                        {/* Staff Dashboard */}
                        <Route
                            path='/staff/dashboard'
                            index={true}
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffDashboard />
                                </Suspense>
                            }
                        />

                        {/* Staff All Users */}
                        <Route
                            path='/staff/users'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAllUsers />
                                </Suspense>
                            }
                        />

                        {/* Staff All Staff */}
                        <Route
                            path='/staff/staff'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAllStaff />
                                </Suspense>
                            }
                        />

                        {/* Staff Add Staff */}
                        <Route
                            path='/staff/staff/add'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAddStaff />
                                </Suspense>
                            }
                        />

                        {/* Staff Edit Staff */}
                        <Route
                            path='/staff/staff/edit/:id'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffEditStaff />
                                </Suspense>
                            }
                        />

                        {/* Staff All Auctions */}
                        <Route
                            path='/staff/auctions/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAllAuctions />
                                </Suspense>
                            }
                        />

                        {/* Staff Create Auction */}
                        <Route
                            path='/staff/auctions/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffCreateAuction />
                                </Suspense>
                            }
                        />

                        {/* Staff Edit Auction */}
                        <Route
                            path='/staff/auctions/edit/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffEditAuction />
                                </Suspense>
                            }
                        />

                        {/* Staff Categories */}
                        <Route
                            path='/staff/categories'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffCategories />
                                </Suspense>
                            }
                        />

                        {/* Staff Liquidation Requests */}
                        <Route
                            path='/staff/liquidation-requests'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffLiquidationRequests />
                                </Suspense>
                            }
                        />

                        {/* Staff Liquidation Requests */}
                        <Route
                            path='/staff/sell-requests'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffSellRequests />
                                </Suspense>
                            }
                        />

                        {/* Staff Support */}
                        <Route
                            path='/staff/support/inquiries'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffUserQueries />
                                </Suspense>
                            }
                        />

                        {/* Staff Profile */}
                        <Route
                            path='/staff/profile'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffProfile />
                                </Suspense>
                            }
                        />

                        {/* Staff Comments */}
                        <Route
                            path='/staff/comments'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffComments />
                                </Suspense>
                            }
                        />

                        {/* Staff Commissions */}
                        <Route
                            path='/staff/commissions'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffCommissions />
                                </Suspense>
                            }
                        />

                        {/* Staff Bids */}
                        <Route
                            path='/staff/bids'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffBidHistory />
                                </Suspense>
                            }
                        />

                        {/* Staff Offers */}
                        <Route
                            path='/staff/offers'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAllOffers />
                                </Suspense>
                            }
                        />

                        {/* Staff Transactions */}
                        <Route
                            path='/staff/transactions'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffTransactions />
                                </Suspense>
                            }
                        />

                        {/* Staff Payouts */}
                        <Route
                                path='/staff/payouts'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffPayouts />
                                    </Suspense>
                                }
                            />

                        {/* Staff Payout Methods */}
                        {/* <Route
                                path='/staff/payout-methods'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <StaffPayoutMethods />
                                    </Suspense>
                                }
                            /> */}

                            {/* Staff Communications */}
                        <Route
                            path='/staff/communications/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAllCommunications />
                                </Suspense>
                            }
                        />

                        {/* Staff Communication Details */}
                        <Route
                            path='/staff/communication/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffCommunication />
                                </Suspense>
                            }
                        />

                        {/* Admin Transactions */}
                        <Route
                            path='/staff/transactions'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffTransactions />
                                </Suspense>
                            }
                        />

                        {/* Staff All Events */}
                        <Route
                            path='/staff/events/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffAllEvents />
                                </Suspense>
                            }
                        />

                        {/* Staff All Events */}
                        <Route
                            path='/staff/events/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffCreateEvent />
                                </Suspense>
                            }
                        />

                        {/* Staff Edit Event */}
                        <Route
                            path='/staff/events/edit/:eventId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffEditEvent />
                                </Suspense>
                            }
                        />

                        {/* Staff Tax Settings */}
                        <Route
                            path='/staff/tax-settings'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <StaffTaxSettings />
                                </Suspense>
                            }
                        />
                    </Route>

                    {/* Admin Layout */}
                    <Route path='/admin' element={<Protected authetication={true} userType='admin'><AdminLayout /></Protected>} >
                        {/* Admin Dashboard */}
                        <Route
                            path='/admin/dashboard'
                            index={true}
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminDashboard />
                                </Suspense>
                            }
                        />

                        {/* Admin All Users */}
                        <Route
                            path='/admin/users'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AllUsers />
                                </Suspense>
                            }
                        />

                        {/* Admin All Staff */}
                            <Route
                                path='/admin/staff'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AllStaff />
                                    </Suspense>
                                }
                            />

                            {/* Admin Add Staff */}
                            <Route
                                path='/admin/staff/add'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AddStaff />
                                    </Suspense>
                                }
                            />

                            {/* Admin Edit Staff */}
                            <Route
                                path='/admin/staff/edit/:id'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <EditStaff />
                                    </Suspense>
                                }
                            />

                        {/* Admin All Auctions */}
                        <Route
                            path='/admin/auctions/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminAllAuctions />
                                </Suspense>
                            }
                        />

                        {/* Admin All Auctions */}
                        <Route
                            path='/admin/auctions/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminCreateAuction />
                                </Suspense>
                            }
                        />

                        {/* Admin Edit Auction */}
                        <Route
                            path='/admin/auctions/edit/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminEditAuction />
                                </Suspense>
                            }
                        />

                        {/* Admin Categories */}
                        <Route
                            path='/admin/categories'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <Categories />
                                </Suspense>
                            }
                        />

                        {/* Admin Support */}
                        <Route
                            path='/admin/support/inquiries'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <UserQueries />
                                </Suspense>
                            }
                        />

                        {/* Admin Liquidation Requests */}
                        <Route
                            path='/admin/liquidation-requests'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <LiquidationRequests />
                                </Suspense>
                            }
                        />

                        {/* Admin Liquidation Requests */}
                        <Route
                            path='/admin/sell-requests'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <SellRequests />
                                </Suspense>
                            }
                        />

                        {/* Admin Profile */}
                        <Route
                            path='/admin/profile'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminProfile />
                                </Suspense>
                            }
                        />

                        {/* Admin Comments */}
                        <Route
                            path='/admin/comments'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminComments />
                                </Suspense>
                            }
                        />

                        {/* Admin Commissions */}
                        <Route
                            path='/admin/commissions'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <Commissions />
                                </Suspense>
                            }
                        />

                        {/* Admin Bids */}
                        <Route
                            path='/admin/bids'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminBidHistory />
                                </Suspense>
                            }
                        />

                        {/* Admin Offers */}
                        <Route
                            path='/admin/offers'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminAllOffers />
                                </Suspense>
                            }
                        />

                        {/* Admin Communications */}
                        <Route
                            path='/admin/communications/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AllCommunications />
                                </Suspense>
                            }
                        />

                        {/* Admin Communication Details */}
                        <Route
                            path='/admin/communication/:auctionId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminCommunication />
                                </Suspense>
                            }
                        />

                        {/* Admin Payouts */}
                        <Route
                            path='/admin/payouts'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminPayouts />
                                </Suspense>
                            }
                        />

                        {/* Admin Payout Methods */}
                        <Route
                            path='/admin/payout-methods'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminPayoutMethods />
                                </Suspense>
                            }
                        />

                        {/* Admin Transactions */}
                        <Route
                            path='/admin/transactions'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <Transactions />
                                </Suspense>
                            }
                        />

                        {/* Admin All Events */}
                        <Route
                            path='/admin/events/all'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminAllEvents />
                                </Suspense>
                            }
                        />

                        {/* Admin All Events */}
                        <Route
                            path='/admin/events/create'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminCreateEvent />
                                </Suspense>
                            }
                        />

                        {/* Admin Edit Event */}
                        <Route
                            path='/admin/events/edit/:eventId'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminEditEvent />
                                </Suspense>
                            }
                        />

                        {/* Admin Tax Settings */}
                        <Route
                            path='/admin/tax-settings'
                            element={
                                <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                    <AdminTaxSettings />
                                </Suspense>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </PopUpContextProvider>
    </AuthProvider>
    //</StrictMode>,
)
