import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TestimonialCard from "./Testimonial";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const testimonials = [
  {
    name: "Carlos Mendoza",
    position: "Collector & Sports Enthusiast",
    review:
      "La-Bóveda has completely changed how I buy and sell memorabilia. The auctions are smooth, the verification gives me peace of mind, and I've found pieces I never thought I'd own. Highly recommended.",
    image: "/avatars/1.jpg",
    date: "January 12, 2026",
  },
  {
    name: "Alejandra Rojas",
    position: "Memorabilia Dealer",
    review:
      "I've sold over 200 items through La-Bóveda. The platform is professional, the buyers are serious, and the 5% commission is more than fair. Payment via bank transfer in USD is seamless. I'll definitely be back.",
    image: "/avatars/2.jpg",
    date: "February 8, 2026",
  },
  {
    name: "Miguel Torres",
    position: "Sports Card Collector",
    review:
      "The selection of rare cards on La-Bóveda is unmatched. I recently bought a signed rookie card and the entire process — from bidding to delivery — was simple and transparent. Trustworthy and reliable.",
    image: "/avatars/3.jpg",
    date: "March 15, 2026",
  },
  {
    name: "Daniela Suárez",
    position: "Auction House Owner",
    review:
      "Finally a platform that understands the Venezuelan collector. Great support, transparent bidding, secure communications, and fast payouts. La-Bóveda is the gold standard for memorabilia in our region.",
    image: "/avatars/4.jpg",
    date: "April 5, 2026",
  },
  {
    name: "Roberto Fernández",
    position: "Collectibles Dealer",
    review:
      "We use La-Bóveda for all our high-end inventory. The platform is intuitive, buyers are verified, and the direct purchase option has boosted our sales significantly. Couldn't ask for more.",
    image: "/avatars/5.jpg",
    date: "May 20, 2026",
  },
  {
    name: "Mariana Castillo",
    position: "Collector & Business Owner",
    review:
      "As someone who collects both sports and non-sports memorabilia, La-Bóveda is my go-to platform. Secure transactions, clear communication, and a community that truly values authenticity. Outstanding results every time.",
    image: "/avatars/6.jpg",
    date: "June 10, 2026",
  },
];

export default function TestimonialSection() {
  const sectionRef = useRef(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  /*
   * ============================================================
   * INTERSECTION OBSERVER
   * ============================================================
   */

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /*
   * ============================================================
   * KEEN SLIDER
   * ============================================================
   */

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,

    slides: {
      perView: 3,
      spacing: 24,
    },

    breakpoints: {
      "(max-width: 1024px)": {
        slides: {
          perView: 2,
          spacing: 20,
        },
      },

      "(max-width: 640px)": {
        slides: {
          perView: 1,
          spacing: 16,
        },
      },
    },

    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },

    created() {
      setLoaded(true);
    },
  });

  return (
    <section
      ref={sectionRef}
      className="relative my-14 overflow-hidden bg-gray-50"
    >
      <div className="w-full max-w-full mx-auto">

        {/* =====================================================
                    HEADER
                ====================================================== */}

        <div
          className={`text-left transition-all duration-1000 ease-out ${visible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
            }`}
        >
          <div className="flex items-center justify-between">

            {/* Heading */}

            <h2 className="text-4xl font-black tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
              What Our
              <span className="ml-2 font-medium italic text-gray-400">
                Clients Say.
              </span>
            </h2>

            {/* =================================================
                            NAVIGATION ARROWS
                        ================================================== */}

            {loaded && instanceRef.current && (
              <div
                className={`hidden gap-2 md:flex md:justify-end transition-all duration-700 delay-300 ${visible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                  }`}
              >
                <button
                  onClick={() =>
                    instanceRef.current?.prev()
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#A17B35]/40 bg-[#C59D55]/10 text-[#A17B35] transition-all duration-300 hover:bg-[#A17B35]/20 hover:-translate-x-0.5"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() =>
                    instanceRef.current?.next()
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#A17B35]/40 bg-[#C59D55]/10 text-[#A17B35] transition-all duration-300 hover:bg-[#A17B35]/20 hover:translate-x-0.5"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}

          <p
            className={`mt-3 mb-5 text-sm text-gray-500 transition-all duration-1000 delay-150 ease-out md:text-base ${visible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
              }`}
          >
            Join collectors across Venezuela who trust La-Bóveda
            for their sports memorabilia, rare cards, and
            one-of-a-kind collectibles.
          </p>
        </div>

        {/* =====================================================
                    SLIDER
                ====================================================== */}

        <div
          className={`mt-12 transition-all duration-1000 delay-300 ease-out md:mt-6 ${visible
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
            }`}
        >
          <div ref={sliderRef} className="keen-slider">

            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`keen-slider__slide transition-all duration-700 ease-out ${visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                  }`}
                style={{
                  transitionDelay: visible
                    ? `${350 + i * 120}ms`
                    : "0ms",
                }}
              >
                <TestimonialCard {...t} />
              </div>
            ))}

          </div>
        </div>

        {/* =====================================================
                    MOBILE DOTS
                ====================================================== */}

        <div
          className={`flex items-center justify-center space-x-2 mt-5 transition-all duration-700 delay-500 md:hidden ${visible
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
            }`}
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() =>
                instanceRef.current?.moveToIdx(index)
              }
              aria-label={`Go to testimonial ${index + 1}`}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "bg-neutral-800 scale-110"
                  : "bg-neutral-300 hover:bg-neutral-400"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}