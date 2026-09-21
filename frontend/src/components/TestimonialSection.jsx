import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TestimonialCard from "./Testimonial";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Container from "./Container";

const testimonials = [
  {
    name: "Ryan Kowalski",
    position: "Construction Company Owner",
    review:
      "I've bought three excavators and a skid steer through SoldWerX. The listings are accurate, the bidding is straightforward, and I've never had a surprise on pickup. It's now the first place I check before calling a dealer.",
    date: "January 22, 2026",
  },
  {
    name: "Tanya Brooks",
    position: "Fleet Manager",
    review:
      "We rotate our truck and trailer inventory through SoldWerX every quarter. The AI listing assistant cut our prep time in half, and the buyers who show up are serious — not tire-kickers. Payouts have been on time, every time.",
    date: "February 14, 2026",
  },
  {
    name: "Marcus Whitfield",
    position: "Heavy Equipment Dealer",
    review:
      "I consign with several platforms and SoldWerX is the one I trust with my best inventory. Reserve auctions protect my margins, and the support team actually answers the phone. That's rare in this industry.",
    date: "March 3, 2026",
  },
  {
    name: "Danielle Reyes",
    position: "Estate Liquidation Specialist",
    review:
      "Liquidating an estate is stressful enough without fighting a clunky platform. SoldWerX made it simple — I listed everything in an afternoon, tagged it to a single event, and the whole sale ran itself. My clients were thrilled with the results.",
    date: "April 18, 2026",
  },
  {
    name: "Greg Halvorsen",
    position: "Restaurant Owner",
    review:
      "When we closed our second location, I had a full kitchen of equipment and no idea where to start. SoldWerX walked me through it, and the Buy Now option moved most of it within two weeks. Turned dead weight into working capital.",
    date: "May 27, 2026",
  },
  {
    name: "Priya Raman",
    position: "Logistics Operations Director",
    review:
      "We use SoldWerX for both sides — sourcing trailers when we're expanding and selling off units when we're not. The make offer feature during auctions has saved us more than once. Verified sellers and transparent bidding make it an easy call.",
    date: "June 9, 2026",
  },
];

export default function TestimonialSection() {
  const sectionRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(true);

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
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /*
   * ============================================================
   * KEEN SLIDER (STRICT 3 CARDS AT A TIME)
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
      className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 py-14"
    >

      <div className="mx-auto w-full max-w-full">
        {/* =====================================================
            HEADER WITH STAGGER ANIMATIONS
        ====================================================== */}
        <div
          className={`flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-1000 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <div className="max-w-7xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F5B51B]/30 bg-[#F5B51B]/10 px-3.5 py-1 text-xs font-semibold text-[#F5B51B]">
              <Sparkles size={13} />
              <span>COMMUNITY TRUST</span>
            </div>

            {/* Heading */}
            <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
              What Our
              <span className="mx-2 font-medium italic text-gray-400">
                Clients Say.
              </span>
            </h2>

            {/* Description */}
            {/* className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-500 sm:text-base"> */}
            <p
              className={`mt-6 text-sm leading-7 text-gray-500 sm:text-base transition-all duration-1000 delay-150 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
            >
              Join buyers across the United States who trust SoldWerX for equipment,
              trucks, business assets, and more — all in one marketplace.
            </p>
          </div>

          {/* =================================================
              NAVIGATION BUTTONS
          ================================================== */}
          {loaded && instanceRef.current && (
            <div
              className={`mt-6 flex items-center gap-3 transition-all duration-700 delay-300 md:mt-0 ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                }`}
            >
              <button
                onClick={() => instanceRef.current?.prev()}
                className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:border-[#F5B51B] hover:bg-[#F5B51B] hover:text-black hover:shadow-md"
                aria-label="Previous testimonial"
              >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              </button>

              <button
                onClick={() => instanceRef.current?.next()}
                className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:border-[#F5B51B] hover:bg-[#F5B51B] hover:text-black hover:shadow-md"
                aria-label="Next testimonial"
              >
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
            SLIDER (STRICT CLIPPING FOR 3 CARDS ONLY)
        ====================================================== */}
        <div
          className={`overflow-hidden py-4 transition-all duration-1000 delay-300 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
        >
          <div ref={sliderRef} className="keen-slider">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`keen-slider__slide transition-all pt-5 duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
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
          className={`mt-6 flex items-center justify-center space-x-2 transition-all duration-700 delay-500 md:hidden ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => instanceRef.current?.moveToIdx(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide
                ? "w-7 bg-[#F5B51B]"
                : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}