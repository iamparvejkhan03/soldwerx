import React, { useEffect, useState } from "react";

const languages = [
    { code: "en", name: "English", flag: "https://flagcdn.com/us.svg" },
    { code: "es", name: "Spanish", flag: "https://flagcdn.com/es.svg" },
];

export default function LanguageSwitcher({ isScrolled }) {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(languages[0]);

    // Check for existing translation on mount
    useEffect(() => {
        // Check if there's a language cookie
        const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
        if (match) {
            const lang = languages.find(l => l.code === match[1]);
            if (lang) setCurrent(lang);
        }

        // Remove Google Translate banner
        const removeBanner = () => {
            document.querySelectorAll(".goog-te-banner-frame").forEach(el => {
                el.style.display = "none";
            });
            document.body.style.top = "0px";
        };

        removeBanner();
        const interval = setInterval(removeBanner, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const langContainer = document.querySelector('.lang-container');
            if (langContainer && !langContainer.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    function changeLanguage(lang) {
        setCurrent(lang);
        setOpen(false);

        // For English - reset translation
        if (lang.code === "en") {
            resetTranslation();
            return;
        }

        // For other languages - trigger translation
        triggerTranslation(lang.code);
    }

    function resetTranslation() {
        // Clear the googtrans cookie
        const domain = window.location.hostname;
        const paths = ['/', '/en/', '/us/', '/home/'];
        
        paths.forEach(path => {
            // Clear for main domain
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
            
            // Clear for root domain
            const rootDomain = domain.split('.').slice(-2).join('.');
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${rootDomain}`;
            
            // Without domain
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        });

        // Reload the page without translations
        setTimeout(() => {
            window.location.reload();
        }, 200);
    }

    function triggerTranslation(targetLang) {
        // Wait for Google Translate to be ready
        const attemptTranslation = (retries = 10) => {
            const select = document.querySelector(".goog-te-combo");
            
            if (!select) {
                if (retries > 0) {
                    console.log("Waiting for Google Translate...", retries);
                    setTimeout(() => attemptTranslation(retries - 1), 500);
                } else {
                    console.error("Google Translate not loaded");
                    // Force reload and try again
                    window.location.reload();
                }
                return;
            }

            // Set the language
            select.value = targetLang;
            
            // Trigger change event
            const event = new Event("change", { bubbles: true });
            select.dispatchEvent(event);

            // Also try to trigger via Google's internal methods
            if (window.google && window.google.translate) {
                try {
                    // This sometimes works better than the combo box
                    const translateElement = document.querySelector('.goog-te-gadget-simple');
                    if (translateElement) {
                        // Force a re-render
                        translateElement.style.display = 'none';
                        setTimeout(() => {
                            translateElement.style.display = '';
                        }, 50);
                    }
                } catch (e) {
                    console.log("Alternative translation method failed", e);
                }
            }
        };

        // Start the translation attempt
        attemptTranslation();
    }

    return (
        <div className="lang-container relative">
            <button
                className="lang-button flex items-center gap-1 px-2 py-1 md:py-1.5 md:px-3 border rounded-md bg-gray-100"
                onClick={() => setOpen(!open)}
            >
                <img
                    src={current.flag}
                    alt={current.name}
                    className="w-7 h-5 object-cover rounded-sm brightness-[85%]"
                />
                <span className={`hidden sm:inline ${isScrolled ? 'text-black' : 'text-black'}`}>
                    {current.name}
                </span>
                <span className={`text-sm ${isScrolled ? 'text-black' : 'text-black'}`}>▾</span>
            </button>

            {open && (
                <div className="lang-dropdown absolute top-full right-0 mt-1 bg-white w-32 border rounded-md shadow-lg z-50">
                    {languages.map((lang) => (
                        <div
                            key={lang.code}
                            className="lang-option flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                            onClick={() => changeLanguage(lang)}
                        >
                            <img
                                src={lang.flag}
                                alt={lang.name}
                                className="w-7 h-5 object-cover rounded-sm border"
                                loading="lazy"
                            />
                            <span>{lang.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}