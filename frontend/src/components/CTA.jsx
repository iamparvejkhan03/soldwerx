import { useNavigate } from "react-router";
import {
    ArrowRight,
    ArrowUpRight,
    Check,
    Sparkles,
} from "lucide-react";
import Container from "./Container";

function CTA() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden bg-[#111315] py-14">

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-[650px]
                    w-[650px]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-[#F5B51B]/[0.08]
                    blur-[140px]
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-32
                    -top-32
                    h-[420px]
                    w-[420px]
                    rounded-full
                    bg-[#F5B51B]/[0.045]
                    blur-[100px]
                "
            />

            {/* subtle diagonal detail */}

            <div
                className="
                    pointer-events-none
                    absolute
                    right-[-120px]
                    top-1/2
                    h-[500px]
                    w-[500px]
                    -translate-y-1/2
                    rotate-45
                    border
                    border-white/[0.045]
                "
            />

            <Container>

                <div className="relative z-10">

                    {/* =================================================
                        MAIN CTA PANEL
                    ================================================== */}

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-[32px]
                            border
                            border-white/[0.08]
                            bg-white/[0.025]
                            px-6
                            py-10
                            sm:px-10
                            sm:py-12
                            lg:px-14
                            lg:py-14
                        "
                    >

                        {/* Decorative gold line */}

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                h-[3px]
                                w-32
                                bg-gradient-to-r
                                from-[#FFC83D]
                                to-transparent
                            "
                        />


                        {/* =================================================
                            TOP LABEL
                        ================================================== */}

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#F5B51B]/10
                                    text-[#F5B51B]
                                "
                            >
                                <Sparkles size={14} />
                            </div>

                            <span
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.2em]
                                    text-[#F5B51B]
                                "
                            >
                                Ready when you are
                            </span>

                        </div>


                        {/* =================================================
                            CONTENT
                        ================================================== */}

                        <div
                            className="
                                mt-8
                                grid
                                gap-10
                                lg:grid-cols-[1fr_auto]
                                lg:items-end
                            "
                        >

                            {/* LEFT */}

                            <div className="max-w-3xl">

                                <h2
                                    className="
                                        text-4xl
                                        font-black
                                        leading-[0.98]
                                        tracking-[-0.05em]
                                        text-white
                                        sm:text-5xl
                                        lg:text-[62px]
                                    "
                                >
                                    Have something
                                    <br />

                                    <span
                                        className="
                                            bg-gradient-to-r
                                            from-[#FFC83D]
                                            via-[#F5B51B]
                                            to-[#E0A413]
                                            bg-clip-text
                                            text-transparent
                                        "
                                    >
                                        worth moving?
                                    </span>
                                </h2>


                                <p
                                    className="
                                        mt-6
                                        max-w-2xl
                                        text-sm
                                        leading-7
                                        text-white/45
                                        sm:text-base
                                    "
                                >
                                    Whether you're buying your next machine,
                                    selling surplus equipment, clearing
                                    business assets or liquidating an estate,
                                    SoldWerx helps you move it forward.
                                </p>

                            </div>


                            {/* RIGHT — ACTIONS */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    sm:flex-row
                                    lg:flex-col
                                "
                            >

                                <button
                                    onClick={() => navigate("/register")}
                                    className="
                                        group
                                        flex
                                        h-12
                                        min-w-[190px]
                                        items-center
                                        justify-center
                                        gap-3
                                        rounded-xl
                                        bg-[#F5B51B]
                                        px-6
                                        text-sm
                                        font-bold
                                        text-[#111315]
                                        transition-all
                                        duration-300
                                        hover:-translate-y-1
                                        hover:bg-[#FFC83D]
                                        hover:shadow-[0_15px_40px_rgba(245,181,27,0.22)]
                                    "
                                >
                                    Get started

                                    <ArrowRight
                                        size={17}
                                        className="
                                            transition-transform
                                            duration-300
                                            group-hover:translate-x-1
                                        "
                                    />
                                </button>


                                <button
                                    onClick={() => navigate("/auctions")}
                                    className="
                                        group
                                        flex
                                        h-12
                                        min-w-[190px]
                                        items-center
                                        justify-center
                                        gap-3
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.04]
                                        px-6
                                        text-sm
                                        font-semibold
                                        text-white/70
                                        transition-all
                                        duration-300
                                        hover:border-white/20
                                        hover:bg-white/[0.08]
                                        hover:text-white
                                    "
                                >
                                    Explore listings

                                    <ArrowUpRight
                                        size={16}
                                        className="
                                            transition-transform
                                            duration-300
                                            group-hover:translate-x-0.5
                                            group-hover:-translate-y-0.5
                                        "
                                    />
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            BOTTOM TRUST STRIP
                        ================================================== */}

                        <div
                            className="
                                mt-10
                                flex
                                flex-wrap
                                gap-x-7
                                gap-y-3
                                border-t
                                border-white/[0.07]
                                pt-6
                            "
                        >

                            <div className="flex items-center gap-2">

                                <div
                                    className="
                                        flex
                                        h-5
                                        w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#F5B51B]/10
                                    "
                                >
                                    <Check
                                        size={11}
                                        className="text-[#F5B51B]"
                                    />
                                </div>

                                <span
                                    className="
                                        text-xs
                                        text-white/40
                                    "
                                >
                                    Simple listings
                                </span>

                            </div>


                            <div className="flex items-center gap-2">

                                <div
                                    className="
                                        flex
                                        h-5
                                        w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#F5B51B]/10
                                    "
                                >
                                    <Check
                                        size={11}
                                        className="text-[#F5B51B]"
                                    />
                                </div>

                                <span
                                    className="
                                        text-xs
                                        text-white/40
                                    "
                                >
                                    Serious buyers
                                </span>

                            </div>


                            <div className="flex items-center gap-2">

                                <div
                                    className="
                                        flex
                                        h-5
                                        w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#F5B51B]/10
                                    "
                                >
                                    <Check
                                        size={11}
                                        className="text-[#F5B51B]"
                                    />
                                </div>

                                <span
                                    className="
                                        text-xs
                                        text-white/40
                                    "
                                >
                                    Built for real assets
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            DECORATIVE NUMBER
                        ================================================== */}

                        <div
                            className="
                                pointer-events-none
                                absolute
                                -bottom-12
                                right-5
                                select-none
                                text-[150px]
                                font-black
                                leading-none
                                tracking-[-0.08em]
                                text-white/[0.025]
                                sm:right-8
                                sm:text-[190px]
                            "
                        >
                            SW
                        </div>

                    </div>

                </div>

            </Container>

        </section>
    );
}

export default CTA;