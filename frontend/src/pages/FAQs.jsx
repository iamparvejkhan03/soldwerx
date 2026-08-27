import { Container } from "../components";
import {
    MessageCircleQuestion,
    Search,
    Mail,
    CreditCard,
    Truck,
    Store,
    Clock,
    Gavel,
    ArrowRight,
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
                question: "Who can bid on La-Bóveda?",
                answer: "La-Bóveda is open to both collectors and private buyers across Venezuela. Whether you're a serious collector or just starting your journey, anyone can register and participate."
            },
            {
                question: "Are there any fees for buyers?",
                answer: "Yes. A 5% buyer's fee is applied to the final sale price of every successful purchase. The fee is clearly displayed before you bid, so there are no surprises."
            },
            {
                question: "Can I inspect items before bidding?",
                answer: "Inspection is not available before bidding. However, each listing includes detailed photos and descriptions to help you make an informed decision. If you have questions about a listing, you can ask the seller directly through our secure communication window."
            },
            {
                question: "Are items sold with a warranty?",
                answer: "No. All collectibles are sold on an 'as-is' basis without warranty. La-Bóveda is a marketplace that connects buyers and sellers — we verify listings but do not guarantee condition beyond what is described."
            },
            {
                question: "Can I return an item after purchase?",
                answer: "All sales are final. If you have concerns after winning, please contact us directly and we'll review your situation and advise accordingly."
            },
            {
                question: "How does bidding work?",
                answer: "Place your bid before the auction ends. The highest bid at the closing time wins the item. All bids are legally binding — bid retractions are not permitted."
            },
            {
                question: "Are bids binding?",
                answer: "Yes. All bids are legally binding contracts. Once you win an auction, you are obligated to complete payment within the specified timeframe."
            }
        ]
    },
    {
        category: "Payments",
        icon: <CreditCard size={20} />,
        questions: [
            {
                question: "What payment methods do you accept?",
                answer: "Bank transfer in USD is our primary and only payment method. All payments must be made to the La-Bóveda collection account."
            },
            {
                question: "How long do I have to make payment?",
                answer: "Payment must be completed within 48 hours of winning an auction or confirming a direct purchase. Please check the specific listing for your payment deadline."
            },
            {
                question: "What happens after I make payment?",
                answer: "Once we receive and verify your payment, we release the funds to the seller. The seller is then notified to arrange delivery with you directly. Ownership transfers only after full payment is confirmed."
            },
            {
                question: "Is off-platform communication or payment allowed?",
                answer: "No. All communication, offers, and payments must go through La-Bóveda. Off-platform activity — including sharing personal contact information — is strictly prohibited and may result in account suspension."
            }
        ]
    },
    {
        category: "Collection & Delivery",
        icon: <Truck size={20} />,
        questions: [
            {
                question: "Who arranges delivery?",
                answer: "Both buyer and seller are responsible for arranging and managing delivery between themselves. Once payment is confirmed, the seller will coordinate shipping or collection details with the buyer."
            },
            {
                question: "Can I collect the item myself?",
                answer: "Yes. Collection can be arranged directly with the seller after payment is confirmed. We recommend agreeing on a safe and convenient pickup location."
            },
            {
                question: "When does ownership transfer to me?",
                answer: "Ownership transfers to the buyer once full payment is received and confirmed by La-Bóveda. Risk transfers once the item is collected or delivered, whichever occurs first."
            },
            {
                question: "Can you share tracking or shipping labels?",
                answer: "Yes. Once the item is shipped, sellers can upload the tracking or shipping label through our secure communication window. Personal contact information must not be shared at any point."
            }
        ]
    },
    {
        category: "Sellers",
        icon: <Store size={20} />,
        questions: [
            {
                question: "I have collectibles to sell — how does it work?",
                answer: "Simply create an account, verify your identity, and list your items for auction. Choose your starting price, add photos and descriptions, and let buyers bid. Once sold, we handle payment collection and release funds to you."
            },
            {
                question: "What are your seller fees?",
                answer: "We charge a 5% commission on the final sale price. There are no listing fees, photography fees, or hidden charges. What you see is what you pay."
            },
            {
                question: "Do you provide photography or listing services?",
                answer: "Sellers are responsible for creating their own listings, including photos and descriptions. We recommend providing clear, detailed, and accurate information to attract serious buyers."
            },
            {
                question: "How and when do I get paid?",
                answer: "Once the buyer sends payment to the La-Bóveda collection account and we verify the funds, we release the payment to you — minus our 5% commission. You'll receive your funds via USD bank transfer."
            }
        ]
    },
    {
        category: "General",
        icon: <Clock size={20} />,
        questions: [
            {
                question: "What are your support hours?",
                answer: "Our support team is available Monday through Friday, 9:00 AM to 6:00 PM (Venezuela time). We strive to respond to all inquiries within 24 hours."
            },
            {
                question: "What languages do you support?",
                answer: "Our platform and support team operate in English. We're here to help you in English for all your questions and concerns."
            },
            {
                question: "What is La-Bóveda?",
                answer: "La-Bóveda is a digital auction and marketplace platform for sports and non-sports collectibles — including cards, signed jerseys, game-used balls, and other valuable memorabilia. We connect buyers and sellers across Venezuela in a secure, transparent environment."
            },
            {
                question: "How do I create an account?",
                answer: "Click 'Sign Up' and provide your email address, phone number, address, etc. Once verified, you can start bidding, buying, or selling immediately."
            },
            {
                question: "How can I contact La-Bóveda?",
                answer: `La-Bóveda | Phone: +11234567890 | Email: admin@la-boveda.com`
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
            faq.question
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            faq.answer
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
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
                        faq.question
                            .toLowerCase()
                            .includes(value.toLowerCase()) ||
                        faq.answer
                            .toLowerCase()
                            .includes(value.toLowerCase())
                )
            );

            if (firstMatchingCategory) {
                setActiveCategory(
                    firstMatchingCategory.category
                );
            }
        }
    };

    return (
        <main className="overflow-hidden bg-white text-gray-900">

            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="relative overflow-hidden bg-[#080A0D] text-white">

                {/* Gold glow */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#C59D55]/10 blur-[130px]" />

                <div className="pointer-events-none absolute -right-40 top-10 h-[400px] w-[400px] rounded-full bg-[#C59D55]/[0.06] blur-[110px]" />

                {/* Subtle grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
                        `,
                        backgroundSize: "80px 80px",
                    }}
                />

                <Container>
                    <div className="relative pt-28 md:pt-28 lg:pt-36 pb-12 md:pb-16 lg:pb-20">

                        {/* Eyebrow */}
                        <div className="flex items-center gap-3">
                            <span className="h-px w-10 bg-[#C59D55]" />

                            <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#D8B96F]">
                                Help Center
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">

                            <div>
                                <h1 className="max-w-4xl text-3xl font-black leading-[0.94] tracking-[-0.055em] sm:text-4xl md:text-5xl lg:text-[60px]">
                                    Answers before
                                    <span className="block bg-gradient-to-r from-[#F1D38D] via-[#C59D55] to-[#92702F] bg-clip-text text-transparent">
                                        you bid.
                                    </span>
                                </h1>
                            </div>

                        </div>

                        {/* Search */}
                        <div className="relative mt-12 max-w-3xl">

                            <Search
                                size={19}
                                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/30"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    handleSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search for an answer..."
                                className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.07] pl-14 pr-5 text-sm text-white outline-none backdrop-blur-md transition-all placeholder:text-white/25 focus:border-[#C59D55]/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-[#C59D55]/10"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleSearch("")
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold text-white/40 transition hover:bg-white/10 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}

                        </div>

                        {/* Hero metadata */}
                        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">

                            <span>
                                {totalQuestions} answers
                            </span>

                            <span className="h-3 w-px bg-white/10" />

                            <span>
                                {faqs.length} categories
                            </span>

                            <span className="h-3 w-px bg-white/10" />

                            <span className="flex items-center gap-2">
                                <Clock
                                    size={13}
                                    className="text-[#C59D55]"
                                />
                                Support available
                            </span>

                        </div>

                    </div>
                </Container>
            </section>


            {/* =====================================================
                FAQ WORKSPACE
            ====================================================== */}

            <section className="py-14">

                <Container>

                    <div className="grid gap-10 lg:grid-cols-[250px_1fr]">

                        {/* =================================================
                            CATEGORY NAVIGATION
                        ================================================== */}

                        <aside className="lg:sticky lg:top-24 lg:self-start">

                            <div className="mb-4 flex items-center justify-between lg:block">

                                <div>
                                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#A17B35]">
                                        Browse by topic
                                    </p>

                                    <p className="mt-1 text-sm text-gray-400">
                                        Choose a category
                                    </p>
                                </div>

                            </div>


                            {/* Desktop categories */}
                            <div className="hidden space-y-1 lg:block">

                                {faqs.map((category, index) => {
                                    const Icon = category.icon.type;

                                    const active =
                                        activeCategory ===
                                        category.category;

                                    return (
                                        <button
                                            key={
                                                category.category
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleCategoryChange(
                                                    category.category
                                                )
                                            }
                                            className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${active
                                                ? "bg-[#FBFAF7] text-gray-950"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                                }`}
                                        >

                                            {active && (
                                                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#C59D55]" />
                                            )}

                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${active
                                                    ? "bg-[#C59D55]/10 text-[#A17B35]"
                                                    : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
                                                    }`}
                                            >
                                                <Icon
                                                    size={17}
                                                />
                                            </span>

                                            <span className="flex-1">

                                                <span className="block text-sm font-bold">
                                                    {category.category}
                                                </span>

                                                <span className="mt-0.5 block text-[12px] text-gray-400">
                                                    {
                                                        category
                                                            .questions
                                                            .length
                                                    }{" "}
                                                    questions
                                                </span>

                                            </span>

                                            <span className="text-[10px] font-bold text-gray-300">
                                                {String(
                                                    index + 1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </span>

                                        </button>
                                    );
                                })}

                            </div>


                            {/* Mobile category scroll */}
                            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                                {faqs.map((category) => {
                                    const active =
                                        activeCategory ===
                                        category.category;

                                    return (
                                        <button
                                            key={
                                                category.category
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleCategoryChange(
                                                    category.category
                                                )
                                            }
                                            className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all ${active
                                                ? "border-[#C59D55] bg-[#C59D55] text-[#111]"
                                                : "border-gray-200 bg-white text-gray-500"
                                                }`}
                                        >
                                            {category.category}
                                        </button>
                                    );
                                })}

                            </div>


                            {/* Desktop contact box */}
                            <div className="mt-8 hidden rounded-2xl border border-gray-100 bg-[#FBFAF7] p-5 lg:block">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#A17B35] shadow-sm">
                                    <MessageCircleQuestion
                                        size={17}
                                    />
                                </div>

                                <p className="mt-4 text-base font-bold text-gray-800">
                                    Still need help?
                                </p>

                                <p className="mt-1 text-sm leading-5 text-gray-400">
                                    Our team can help with questions
                                    that aren't covered here.
                                </p>

                                <Link
                                    to="/contact"
                                    className="group mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#A17B35]"
                                >
                                    Contact us

                                    <ArrowRight
                                        size={13}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </Link>

                            </div>

                        </aside>


                        {/* =================================================
                            QUESTIONS
                        ================================================== */}

                        <div className="min-w-0">

                            {/* Section heading */}
                            <div className="mb-7 flex flex-col gap-3 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">

                                <div>

                                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                        Frequently asked
                                    </p>

                                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-gray-950 md:text-3xl">
                                        {searchTerm
                                            ? "Search results"
                                            : activeCategory}
                                    </h2>

                                </div>

                                <p className="text-sm text-gray-400">
                                    {filteredQuestions.length}{" "}
                                    {filteredQuestions.length ===
                                        1
                                        ? "question"
                                        : "questions"}
                                </p>

                            </div>


                            {/* No results */}
                            {filteredQuestions.length === 0 && (
                                <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#FBFAF7] px-6 py-16 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-300 shadow-sm">
                                        <Search size={20} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-gray-800">
                                        No answers found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
                                        Try a different search term or
                                        browse another category.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSearch("")
                                        }
                                        className="mt-5 text-xs font-bold text-[#A17B35] hover:underline"
                                    >
                                        Clear search
                                    </button>

                                </div>
                            )}


                            {/* FAQ list */}
                            <div className="divide-y divide-gray-100 border-y border-gray-100">

                                {filteredQuestions.map(
                                    (faq, index) => {
                                        const isOpen =
                                            openIndex ===
                                            index;

                                        return (
                                            <div
                                                key={`${activeCategory}-${index}`}
                                                className={`transition-colors duration-300 ${isOpen
                                                    ? "bg-[#FBFAF7]"
                                                    : "bg-white"
                                                    }`}
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenIndex(
                                                            isOpen
                                                                ? null
                                                                : index
                                                        )
                                                    }
                                                    className="group flex w-full items-start gap-5 py-6 text-left md:py-7"
                                                >

                                                    {/* Number */}
                                                    <span
                                                        className={`hidden pt-0.5 text-[10px] font-bold tracking-wider transition-colors sm:block ${isOpen
                                                            ? "text-[#A17B35]"
                                                            : "text-gray-300"
                                                            }`}
                                                    >
                                                        {String(
                                                            index +
                                                            1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>


                                                    {/* Question */}
                                                    <span className="flex-1">

                                                        <span
                                                            className={`block text-sm font-bold leading-6 transition-colors md:text-base ${isOpen
                                                                ? "text-gray-950"
                                                                : "text-gray-700 group-hover:text-gray-950"
                                                                }`}
                                                        >
                                                            {
                                                                faq.question
                                                            }
                                                        </span>

                                                        {isOpen && (
                                                            <span className="mt-4 block max-w-3xl text-sm leading-7 text-gray-500">
                                                                {
                                                                    faq.answer
                                                                }
                                                            </span>
                                                        )}

                                                    </span>


                                                    {/* Toggle */}
                                                    <span
                                                        className={`relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen
                                                            ? "border-[#C59D55] bg-[#C59D55] text-[#111]"
                                                            : "border-gray-200 text-gray-400 group-hover:border-gray-300 group-hover:text-gray-700"
                                                            }`}
                                                    >

                                                        <span
                                                            className={`absolute h-px w-3 bg-current transition-transform duration-300 ${isOpen
                                                                ? "rotate-0"
                                                                : "rotate-0"
                                                                }`}
                                                        />

                                                        <span
                                                            className={`absolute h-px w-3 bg-current transition-transform duration-300 ${isOpen
                                                                ? "rotate-0"
                                                                : "rotate-90"
                                                                }`}
                                                        />

                                                    </span>

                                                </button>

                                            </div>
                                        );
                                    }
                                )}

                            </div>


                            {/* =================================================
                                BOTTOM CONTACT CTA
                            ================================================== */}

                            <div className="relative mt-10 overflow-hidden rounded-[24px] bg-[#080A0D] p-7 md:p-9">

                                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#C59D55]/10 blur-[80px]" />

                                <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59D55]">
                                            Can't find what you need?
                                        </p>

                                        <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                                            Talk to our team.
                                        </h3>

                                        <p className="mt-2 max-w-lg text-sm leading-6 text-white/40">
                                            Send us your question and we'll
                                            help you find the right answer.
                                        </p>

                                    </div>

                                    <Link
                                        to="/contact"
                                        className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C59D55] px-6 py-3.5 text-sm font-bold text-[#111] transition-all duration-300 hover:bg-[#D8B96F]"
                                    >
                                        Contact La-Boveda

                                        <ArrowRight
                                            size={16}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
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