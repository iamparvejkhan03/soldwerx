import { Container } from "../components";
import {
    MessageCircleQuestion,
    Search,
    CreditCard,
    Gavel,
    ArrowRight,
    Plus,
    Clock,
    Key,
    Building2,
    FileText,
    Store,
    Home,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { otherData } from "../assets";

const { phone } = otherData;

const faqs = [
    {
        category: "Buyers",
        icon: <Key size={20} />,
        questions: [
            {
                question: "Who can buy property on SoldWerX?",
                answer: "Anyone — individual buyers, investors, developers, and businesses. You'll need a verified SoldWerX account to bid, and you must be legally able to enter into a property contract in the jurisdiction where the property is located."
            },
            {
                question: "Are there any fees for buyers?",
                answer: "Yes. A buyer's premium is applied to the final sale price and is clearly shown on each listing before you bid. On top of that, standard closing costs (title, escrow, recording) apply and are handled during the closing process."
            },
            {
                question: "Can I inspect a property before bidding?",
                answer: "Yes. Every listing includes open-house windows and/or a way to schedule a private showing through the platform. We strongly recommend inspecting any property — and having it professionally inspected if you're financing — before you commit."
            },
            {
                question: "Are property disclosures provided?",
                answer: "Where required by law and where the seller has them on file, disclosures are attached to the listing. If a required disclosure isn't posted, message the seller through the platform before bidding."
            },
            {
                question: "Can I get financing before bidding?",
                answer: "Yes — and we recommend it. Getting a pre-approval letter from a lender before you bid puts you in a stronger position and helps you know exactly how far you can go. Cash offers are also welcome."
            },
            {
                question: "What happens if I win but can't complete the purchase?",
                answer: "Winning is a binding commitment. If you cannot complete the purchase, your deposit may be forfeited, and repeat offenses can lead to account suspension. Please make sure your financing and funds are in order before bidding."
            },
            {
                question: "Are properties sold with a warranty?",
                answer: "No. All properties are sold as-is unless the seller explicitly states otherwise in the listing. SoldWerX reviews listings and verifies sellers, but we do not guarantee condition beyond what's disclosed."
            }
        ]
    },
    {
        category: "Auctions & Bidding",
        icon: <Gavel size={20} />,
        questions: [
            {
                question: "How do property auctions work on SoldWerX?",
                answer: "Live auctions accept bids until the closing time, and the highest bid wins. Upcoming auctions are visible ahead of time so you can plan inspections and financing. You can browse live and upcoming listings from the Real Estate menu in the header."
            },
            {
                question: "What is the difference between a live and an upcoming listing?",
                answer: "Live listings are currently accepting bids — you can bid now. Upcoming listings have been approved and scheduled but bidding hasn't opened yet. Use the Live and Upcoming links in the Real Estate dropdown to browse each one."
            },
            {
                question: "What is a reserve auction?",
                answer: "A reserve auction has a minimum price the seller will accept. You'll see whether the reserve has been met, but not the reserve amount itself. If bidding closes without meeting the reserve, the property does not sell."
            },
            {
                question: "Can I retract a bid?",
                answer: "Generally, no. Bids are binding once placed. If there's a genuine error, contact us immediately — we'll review it, but retraction is not guaranteed."
            },
            {
                question: "How long does a property auction run?",
                answer: "Auction length varies by listing — some run for a few days, others longer. The exact opening and closing times are always shown on the listing page."
            },
            {
                question: "Can I make an offer outside the auction?",
                answer: "Some listings allow offers, and some are Buy It Now. If the option is available, you'll see it on the listing. All offers must go through SoldWerX — off-platform offers are prohibited."
            }
        ]
    },
    {
        category: "Payments",
        icon: <CreditCard size={20} />,
        questions: [
            {
                question: "What payment methods are accepted for property?",
                answer: "Wire transfers and bank-to-bank payments are the standard for property purchases. Some listings may accept certified checks or other forms — the accepted method is specified on the listing and in the closing documents."
            },
            {
                question: "Is a deposit required?",
                answer: "Most property listings require an earnest money deposit to bind the contract once you've won. The amount and timing are specified in the listing. Deposits are held in escrow until closing."
            },
            {
                question: "How long do I have to complete payment?",
                answer: "Timelines vary by listing and are stated up front. Most property purchases close within 30–45 days from the end of the auction, but cash buyers can often close much faster."
            },
            {
                question: "What happens after I make payment?",
                answer: "Funds move into escrow and the closing process begins. Title is searched and cleared, documents are prepared, and once all conditions are met, the sale is recorded and the property transfers to you."
            },
            {
                question: "Is sales tax or transfer tax charged?",
                answer: "Property sales are typically subject to transfer taxes, recording fees, and prorated property taxes at closing — not the same as retail sales tax. Exact amounts depend on the jurisdiction and are itemized in your closing statement."
            }
        ]
    },
    {
        category: "Closing & Title",
        icon: <FileText size={20} />,
        questions: [
            {
                question: "Who handles the title transfer?",
                answer: "Closing is handled by a licensed title company or attorney in the jurisdiction where the property is located. SoldWerX coordinates with them so the process runs smoothly, but the actual transfer is executed by that licensed party."
            },
            {
                question: "Do you provide a title search?",
                answer: "Yes — a title search is part of the standard closing process. It confirms the seller's ownership, identifies liens or encumbrances, and determines what must be cleared before the sale can complete."
            },
            {
                question: "Who handles escrow?",
                answer: "Escrow is held by a licensed escrow or title company — never by SoldWerX directly. This protects both buyer and seller throughout the transaction."
            },
            {
                question: "What if there are liens on the property?",
                answer: "Any liens must be satisfied or released before the property can transfer cleanly. This is discovered during the title search and addressed through escrow before closing. If we find a lien issue, your closing coordinator will walk you through it."
            },
            {
                question: "Can I use my own attorney or title company?",
                answer: "In most cases, yes. Let us know during the offer process and we'll coordinate with your preferred professional. Some sellers may have a preferred provider, which will be stated in the listing."
            }
        ]
    },
    {
        category: "Sellers",
        icon: <Building2 size={20} />,
        questions: [
            {
                question: "How do I list a property on SoldWerX?",
                answer: "Click Sell a Property in the Real Estate menu, fill out the listing form with property details and photos, and submit. Our team reviews your submission within 24 hours and then works with you to schedule the auction or listing."
            },
            {
                question: "What are the seller fees?",
                answer: "Seller commission is a flat percentage of the final sale price, disclosed up front. No listing fees, no photography fees, no hidden charges beyond standard closing costs."
            },
            {
                question: "Do you help with listing photos and marketing?",
                answer: "Yes. Professional photography and marketing support are included for approved listings. Our team also advises on pricing, timing, and strategy to help you get the best outcome."
            },
            {
                question: "Can I set a reserve price?",
                answer: "Yes. You can list with a reserve that protects your minimum acceptable price. If the reserve isn't met, the property doesn't sell and you keep ownership."
            },
            {
                question: "How and when do I get paid?",
                answer: "Once the sale closes and the title is transferred, your funds are released from escrow — minus the seller commission and any agreed closing costs. Payout is by bank transfer."
            },
            {
                question: "Do I need to verify my identity to sell?",
                answer: "Yes. Property sales require identity verification and ownership verification for anti-fraud and legal compliance reasons. Your closing coordinator will guide you through this during onboarding."
            },
            {
                question: "Can I cancel a listing after it's live?",
                answer: "Once bidding has begun, cancellation isn't allowed — it would break buyer trust and could expose you to legal liability. You can adjust or withdraw a listing only in the window before it goes live."
            }
        ]
    },
    {
        category: "General",
        icon: <Clock size={20} />,
        questions: [
            {
                question: "What is SoldWerX Real Estate?",
                answer: "SoldWerX Real Estate is the property vertical of SoldWerX — an auction and marketplace for houses, apartments, condos, townhouses, land, and commercial properties. It runs on the same trusted infrastructure as our equipment and business-asset auctions."
            },
            {
                question: "Where do you operate?",
                answer: "Currently we operate across the United States. Listings indicate the state and jurisdiction so you know exactly where the property and its closing process are located."
            },
            {
                question: "How do I create an account?",
                answer: "Click Sign Up and enter your email, phone number, and location. Once your account is confirmed, you can start browsing, bidding, or listing immediately."
            },
            {
                question: "What are your support hours?",
                answer: "Monday through Friday, 8:00 AM to 6:00 PM Central Time. We aim to respond to every inquiry within 24 hours."
            },
            {
                question: "How can I contact the real estate team?",
                answer: `SoldWerX Real Estate | Phone: ${phone} | Email: admin@soldwerx.com`
            }
        ]
    }
];

function RealEstateFAQs() {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Buyers");

    const activeFaqCategory = faqs.find(
        (category) => category.category === activeCategory
    );

    const filteredQuestions = activeFaqCategory?.questions.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalQuestions = faqs.reduce(
        (total, category) => total + category.questions.length,
        0
    );

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setOpenIndex(null);
        setSearchTerm("");
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setOpenIndex(null);

        if (value.trim()) {
            const firstMatchingCategory = faqs.find((category) =>
                category.questions.some(
                    (faq) =>
                        faq.question.toLowerCase().includes(value.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(value.toLowerCase())
                )
            );

            if (firstMatchingCategory) {
                setActiveCategory(firstMatchingCategory.category);
            }
        }
    };

    return (
        <main className="overflow-hidden bg-white text-[#08090A]">

            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="relative overflow-hidden bg-[#08090A] text-white">

                <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#F5B51B]/10 blur-[130px]" />

                <Container>
                    <div className="relative pt-24 pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20">

                        <span className="inline-flex items-center gap-2 rounded-full border border-[#F5B51B]/40 bg-[#F5B51B]/[0.08] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#F5B51B]">
                            Real Estate Help Desk
                        </span>

                        <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[58px]">
                            Property answers,
                            <br />
                            <span className="text-[#F5B51B]">
                                filed before you bid.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
                            Search the property record below, or browse by topic — buying, bidding, closing, and selling each have their own section.
                        </p>

                        {/* Search */}
                        <div className="relative mt-10 max-w-2xl">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/35"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search a property question…"
                                className="h-14 w-full rounded-lg border border-white/15 bg-white/[0.05] pl-13 pr-5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#F5B51B] focus:bg-white/[0.07]"
                                style={{ paddingLeft: "3.25rem" }}
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => handleSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-xs font-semibold text-white/45 transition hover:bg-white/10 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Ledger metadata row */}
                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-white/40">
                            <span>{totalQuestions} entries</span>
                            <span className="h-3 w-px bg-white/15" />
                            <span>{faqs.length} sections</span>
                            <span className="h-3 w-px bg-white/15" />
                            <span className="flex items-center gap-1.5">
                                <Clock size={12} className="text-[#F5B51B]" />
                                Mon–Fri, 9–6 CST
                            </span>
                        </div>
                    </div>
                </Container>
            </section>

            {/* =====================================================
                FAQ WORKSPACE
            ====================================================== */}

            <section className="py-14 md:py-16">
                <Container>
                    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">

                        {/* =================================================
                            CATEGORY NAVIGATION
                        ================================================== */}

                        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">

                            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                Browse by section
                            </p>

                            {/* Desktop categories */}
                            <div className="hidden divide-y divide-gray-200 border-y border-gray-200 lg:block">
                                {faqs.map((category, index) => {
                                    const Icon = category.icon.type;
                                    const active = activeCategory === category.category;

                                    return (
                                        <button
                                            key={category.category}
                                            type="button"
                                            onClick={() => handleCategoryChange(category.category)}
                                            className={`group relative flex w-full items-center gap-3 py-3.5 pl-3 pr-2 text-left transition-colors duration-150 ${active ? "bg-[#F5B51B]/5" : "hover:bg-[#F8F7F4]"
                                                }`}
                                        >
                                            {active && (
                                                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F5B51B]" />
                                            )}

                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${active ? "text-[#F5B51B]" : "text-gray-400 group-hover:text-gray-700"
                                                    }`}
                                            >
                                                <Icon size={17} />
                                            </span>

                                            <span className="flex-1">
                                                <span className={`block text-sm font-semibold ${active ? "text-[#08090A]" : "text-gray-700"}`}>
                                                    {category.category}
                                                </span>
                                                <span className="mt-0.5 block text-[12px] text-gray-400">
                                                    {category.questions.length} questions
                                                </span>
                                            </span>

                                            <span className="text-[10px] font-bold text-gray-300">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile category scroll */}
                            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {faqs.map((category) => {
                                    const active = activeCategory === category.category;
                                    return (
                                        <button
                                            key={category.category}
                                            type="button"
                                            onClick={() => handleCategoryChange(category.category)}
                                            className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${active
                                                ? "border-[#F5B51B] bg-[#F5B51B] text-black"
                                                : "border-gray-200 bg-white text-gray-500"
                                                }`}
                                        >
                                            {category.category}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Desktop contact box */}
                            <div className="mt-8 hidden rounded-xl border border-gray-200 bg-[#F8F7F4] p-5 lg:block">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#F5B51B]/30 bg-[#F5B51B]/5 text-[#F5B51B]">
                                    <MessageCircleQuestion size={17} />
                                </div>

                                <p className="mt-4 text-base font-semibold text-[#08090A]">
                                    Still need help?
                                </p>

                                <p className="mt-1 text-sm leading-5 text-gray-500">
                                    Our real estate team can look into anything not covered here.
                                </p>

                                <Link
                                    to="/contact"
                                    className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5B51B] hover:text-[#FFC83D]"
                                >
                                    Contact us
                                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </aside>

                        {/* =================================================
                            QUESTIONS
                        ================================================== */}

                        <div className="min-w-0">

                            {/* Section heading */}
                            <div className="mb-7 flex flex-col gap-2 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                        {searchTerm ? "Search" : `Section ${faqs.findIndex(c => c.category === activeCategory) + 1} of ${faqs.length}`}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#08090A] md:text-3xl">
                                        {searchTerm ? "Search results" : activeCategory}
                                    </h2>
                                </div>

                                <p className="text-sm text-gray-400">
                                    {filteredQuestions.length} {filteredQuestions.length === 1 ? "question" : "questions"}
                                </p>
                            </div>

                            {/* No results */}
                            {filteredQuestions.length === 0 && (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-[#F8F7F4] px-6 py-16 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-300">
                                        <Search size={20} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-[#08090A]">
                                        No answers found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
                                        Try a different search term or browse another section.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => handleSearch("")}
                                        className="mt-5 text-xs font-semibold text-[#F5B51B] hover:underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}

                            {/* FAQ list */}
                            <div className="divide-y divide-gray-200 border-t border-gray-200">
                                {filteredQuestions.map((faq, index) => {
                                    const isOpen = openIndex === index;

                                    return (
                                        <div
                                            key={`${activeCategory}-${index}`}
                                            className={isOpen ? "bg-[#F8F7F4]" : "bg-white"}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                                aria-expanded={isOpen}
                                                className="group flex w-full items-start gap-4 py-6 text-left focus-visible:outline-none"
                                            >
                                                <span
                                                    className={`hidden pt-0.5 text-xs font-bold sm:block ${isOpen ? "text-[#F5B51B]" : "text-gray-300"
                                                        }`}
                                                >
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <span className="flex-1">
                                                    <span
                                                        className={`block text-sm font-semibold leading-6 transition-colors md:text-base ${isOpen ? "text-[#08090A]" : "text-gray-700 group-hover:text-[#08090A]"
                                                            }`}
                                                    >
                                                        {faq.question}
                                                    </span>

                                                    {isOpen && (
                                                        <span className="mt-3 block max-w-3xl text-sm leading-7 text-gray-500">
                                                            {faq.answer}
                                                        </span>
                                                    )}
                                                </span>

                                                <span
                                                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${isOpen
                                                        ? "border-[#F5B51B] bg-[#F5B51B] text-black"
                                                        : "border-gray-200 text-gray-400 group-hover:border-gray-300"
                                                        }`}
                                                >
                                                    <Plus
                                                        size={14}
                                                        className={`transition-transform duration-200 ${isOpen ? "rotate-45" : "rotate-0"}`}
                                                    />
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* =================================================
                                BOTTOM CONTACT CTA
                            ================================================== */}

                            <div className="relative mt-10 w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-[#08090A] p-5 sm:p-7 md:p-9">
                                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#F5B51B]/10 blur-[80px]" />

                                <div className="relative z-10 flex min-w-0 max-w-full flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0 max-w-full">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                            Can't find it here
                                        </p>

                                        <h3 className="mt-3 break-words text-xl font-black tracking-[-0.03em] text-white sm:text-2xl">
                                            Talk to our property team.
                                        </h3>

                                        <p className="mt-2 max-w-lg break-words text-sm leading-6 text-white/55">
                                            Send us your question and we'll help you find the right answer — before you bid, close, or list.
                                        </p>
                                    </div>

                                    <div className="flex w-full max-w-full shrink-0 flex-col gap-3 sm:flex-row md:w-auto">
                                        <Link
                                            to="/contact"
                                            className="flex items-center justify-center gap-2 rounded-md bg-[#F5B51B] px-5 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC83D] hover:shadow-[0_15px_35px_rgba(245,181,27,0.25)] md:px-6"
                                        >
                                            <span className="whitespace-nowrap">
                                                Contact SoldWerX
                                            </span>
                                            <ArrowRight size={16} className="shrink-0" />
                                        </Link>

                                        <Link
                                            to="/sell-property"
                                            className="flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.04] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08] md:px-6"
                                        >
                                            <Home size={16} className="shrink-0 text-[#F5B51B]" />
                                            <span className="whitespace-nowrap">
                                                Sell a Property
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}

export default RealEstateFAQs;