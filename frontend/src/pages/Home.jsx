import { lazy, Suspense } from "react";
import { Hero, Container, LoadingSpinner, HowItWorks } from "../components";

// Direct (non-lazy) — these return null when empty, so importing them
// directly avoids any Suspense fallback flash that would take up space.
import FeaturedAuctionsSection from "../components/FeaturedAuctionsSection";
import FeaturedEventsSection from "../components/FeaturedEventsSection";

const CTA = lazy(() => import('../components/CTA'));
const CategoryIconsSection = lazy(() => import('../components/CategoryIconsSection'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection'));
const About = lazy(() => import('../components/About'));
const HomeAuctionsSection = lazy(() => import("../components/HomeAuctionsSection"));
const HomeEventsSection = lazy(() => import("../components/HomeEventsSection"));

const trustedBrands = [];

function Home() {

    return (
        <>
            <Hero />

            {/* Category section */}
            <Suspense fallback={<LoadingSpinner />}>
                <CategoryIconsSection />
            </Suspense>

            {/* Featured Auctions — renders nothing if none featured */}
            <FeaturedAuctionsSection />

            {/* Featured Events — renders nothing if none featured */}
            <FeaturedEventsSection />

            {/* Auctions section */}
            <Suspense fallback={<LoadingSpinner />}>
                <HomeAuctionsSection />
            </Suspense>

            {/* Events section */}
            <Suspense fallback={<LoadingSpinner />}>
                <HomeEventsSection />
            </Suspense>

            {/* Who we are section */}
            <Suspense fallback={<LoadingSpinner />}>
                <About />
            </Suspense>

            <Container className="">
                <HowItWorks />
            </Container>

            <CTA />
        </>
    )
}

export default Home;