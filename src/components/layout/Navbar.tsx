import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MqiLogo from "../branding/MqiLogo";

const navLinks = [
  { to: "/", label: "Ana səhifə" },
  { to: "/haqqimizda", label: "Haqqımızda" },
  { to: "/mehsullar", label: "Məhsullar" },
  { to: "/xidmetler", label: "Xidmətlər" },
  { to: "/tedbirler", label: "Tədbirlər" },
  { to: "/elaqe", label: "Əlaqə" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Only the home page puts a dark hero behind the transparent navbar. Other
  // pages show light background there, so they keep the dark link colour.
  const overDarkHero = location.pathname === "/" && !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E4E9F4]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <MqiLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? "text-[#3B6FE0] bg-[#EEF3FD]"
                    : overDarkHero
                    ? "text-white/90 hover:text-white hover:bg-white/15"
                    : scrolled
                    ? "text-[#1A2540] hover:text-[#3B6FE0] hover:bg-[#EEF3FD]"
                    : "text-[#1A2540] hover:text-[#3B6FE0] hover:bg-white/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/elaqe"
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
              Əlaqə
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                overDarkHero ? "text-white hover:bg-white/15" : "text-[#1A2540] hover:bg-[#EEF3FD]"
              }`}
              aria-label="Menu"
            >
              {open ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-[#E4E9F4] shadow-lg transition-all duration-300 overflow-hidden ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-[#3B6FE0] bg-[#EEF3FD]"
                  : "text-[#1A2540] hover:bg-[#F0F4FE]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/elaqe"
            className="mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white text-sm font-semibold text-center"
          >
            Əlaqə saxlayın
          </Link>
        </div>
      </div>
    </nav>
  );
}
