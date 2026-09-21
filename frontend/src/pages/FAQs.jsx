import { Container } from "../components";
import {
    MessageCircleQuestion,
    Search,
    CreditCard,
    Truck,
    Store,
    Clock,
    Gavel,
    ArrowRight,
    Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { otherData } from "../assets";

const { phone, email, address } = otherData;

const faqs = [
    {
        category: "Buyer",
        icon: <Gavel size={20} />,
        questions: [
            {
                question: "Who can bid on SoldWerX?",
                answer: "Anyone. SoldWerX is open to individuals and businesses — whether you're sourcing equipment for a job, adding to a fleet, or buying your first asset at auction."
            },
            {
                question: "Are there any fees for buyers?",
                answer: "Yes. A 5% buyer's fee is applied to the final sale price of every successful purchase. It's shown clearly before you bid, and there are no other fees on top of it."
            },
            {
                question: "Can I inspect an item before bidding?",
                answer: "Yes. If you'd like to inspect an item, message the seller through the listing and arrange a time directly. We recommend inspecting anything mechanical or high-value before you commit."
            },
            {
                question: "What is a reserve auction?",
                answer: "A reserve auction has a minimum price the seller will accept. You'll see whether the reserve has been met, but not the reserve amount itself. If bidding closes without meeting the reserve, the item doesn't sell."
            },
            {
                question: "How does bidding work?",
                answer: "Place your bid before the auction closes. The highest bid at closing wins. Depending on the listing, you may also be able to make an offer while the auction is live, or skip bidding entirely with Buy Now."
            },
            {
                question: "Are bids binding?",
                answer: "Yes. Every bid is a legally binding commitment. Once you win, you're obligated to complete payment and the sale."
            },
            {
                question: "Are items sold with a warranty?",
                answer: "No. All assets are sold as-is, without warranty. SoldWerX reviews listings and connects you with sellers we've checked, but we don't guarantee condition beyond what's described in the listing."
            },
            {
                question: "Can I return an item after purchase?",
                answer: "All sales are final. If something isn't right, contact us — we'll review the situation and advise you on next steps."
            }
        ]
    },
    {
        category: "Payments",
        icon: <CreditCard size={20} />,
        questions: [
            {
                question: "What payment methods do you accept?",
                answer: "We accept card payments, bank transfers, and other common payment methods. Available options are shown at checkout."
            },
            {
                question: "How long do I have to make payment?",
                answer: "There's no fixed deadline — we ask that payment be made as soon as possible once you've won. Sellers are waiting on it, so please don't delay."
            },
            {
                question: "What happens after I make payment?",
                answer: "Once your payment clears, we release the funds to the seller. The seller is then notified to arrange pickup or delivery with you directly."
            },
            {
                question: "Is sales tax charged?",
                answer: "Depending on where you and the seller are located and what you're buying, sales tax may apply. Rates vary, so any applicable tax is confirmed as part of the sale rather than set at a flat rate."
            },
            {
                question: "Is off-platform communication or payment allowed?",
                answer: "No. All communication, offers, and payments must go through SoldWerX. Taking a deal off-platform — including sharing personal contact details — is prohibited and can result in account suspension."
            }
        ]
    },
    {
        category: "Collection & Delivery",
        icon: <Truck size={20} />,
        questions: [
            {
                question: "Who arranges shipping or transport?",
                answer: "The buyer and seller arrange it between themselves. For heavy equipment and vehicles, buyers typically arrange their own freight, but the two of you can agree on whatever works."
            },
            {
                question: "Can I collect the item myself?",
                answer: "Yes. Self-pickup is common, especially for equipment and trailers. Once payment clears, arrange a time and location directly with the seller."
            },
            {
                question: "Do you handle title transfer for vehicles?",
                answer: "No. Title transfer is handled between the buyer and the seller directly. We recommend confirming title status and any liens with the seller before bidding."
            },
            {
                question: "When does ownership transfer to me?",
                answer: "Ownership and risk transfer when you and the seller finalize the handoff — whether that's pickup or delivery. We recommend putting the details in writing through the platform so both sides have a record."
            },
            {
                question: "Can you share tracking or shipping labels?",
                answer: "Yes. Sellers can upload tracking details or shipping documents through the platform once the item is on its way. Personal contact information should never be shared outside SoldWerX."
            }
        ]
    },
    {
        category: "Sellers",
        icon: <Store size={20} />,
        questions: [
            {
                question: "I have assets to sell — how does it work?",
                answer: "Create an account, then list your asset directly or let our team list it on your behalf. You choose the format — standard auction, reserve auction, make offer, or Buy Now — and buyers bid. We collect payment and release funds to you once the sale completes."
            },
            {
                question: "What are your seller fees?",
                answer: "A flat 5% commission on the final sale price. No listing fees, no photography fees, no hidden charges."
            },
            {
                question: "Do you help with listings?",
                answer: "Yes. Our AI assistant builds out your listing from your photos and basic details — title, description, make, model, year, and other key fields. If you'd rather hand it off, our team can list on your behalf and advise on pricing and strategy. You can also list everything yourself if you prefer."
            },
            {
                question: "How and when do I get paid?",
                answer: "Once the buyer's payment clears and the item has been picked up or delivered, we release your funds — minus the 5% commission. Payouts go out by bank transfer."
            },
            {
                question: "Do I need to verify my identity to sell?",
                answer: "There are no verification requirements to start selling right now. That may change as the marketplace grows, and we'll give you plenty of notice if it does."
            }
        ]
    },
    {
        category: "General",
        icon: <Clock size={20} />,
        questions: [
            {
                question: "What is SoldWerX?",
                answer: "SoldWerX is a US-based auction and marketplace platform for equipment, machinery, trucks, trailers, vehicles, business assets, and estates. We connect buyers and sellers in a secure, transparent environment — and make it simple to consign, auction, or liquidate."
            },
            {
                question: "How do I create an account?",
                answer: "Click 'Sign Up' and enter your email address, phone number, and location. Once your account is confirmed, you can start bidding, buying, or listing right away."
            },
            {
                question: "What are your support hours?",
                answer: "Our team is available Monday through Friday, 8:00 AM to 6:00 PM Central Time. We aim to respond to every inquiry within 24 hours."
            },
            {
                question: "What languages do you support?",
                answer: "English and Spanish — both on the platform and with our support team."
            },
            {
                question: "How can I contact SoldWerX?",
                answer: `SoldWerX | Phone: ${otherData.phone} | Email: admin@soldwerx.com`
            }
        ]
    }
];

function FAQsPage() {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Buyer");

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
                            Help Desk
                        </span>

                        <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[58px]">
                            Answers, filed
                            <br />
                            <span className="text-[#F5B51B]">
                                before you need them.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
                            Search the record below, or browse by topic — bidding, payments, delivery, and selling all get their own section.
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
                                placeholder="Search a question…"
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

                        <aside className="lg:sticky lg:top-24 lg:self-start">

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
                            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                                    Our team can look into anything not covered here.
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
                                        Try a different search term or browse another category.
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

                            <div className="relative mt-10 overflow-hidden rounded-2xl bg-[#08090A] p-7 md:p-9">
                                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#F5B51B]/10 blur-[80px]" />

                                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                                            Can't find it here
                                        </p>

                                        <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
                                            Talk to our team.
                                        </h3>

                                        <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">
                                            Send us your question and we'll help you find the right answer.
                                        </p>
                                    </div>

                                    <Link
                                        to="/contact"
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#F5B51B] px-6 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC83D] hover:shadow-[0_15px_35px_rgba(245,181,27,0.25)]"
                                    >
                                        Contact SoldWerX
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}

export default FAQsPage;