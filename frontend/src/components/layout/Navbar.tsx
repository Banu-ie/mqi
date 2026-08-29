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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-b from-pink-500/80 via-purple-500/30 to-transparent backdrop-blur-xs border-white/10 shadow-[0_10px_30px_rgba(168,85,247,0.12)]'
          : 'bg-gradient-to-b from-pink-500/50 via-purple-500/20 to-transparent  border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <MqiLogo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur-md shadow-[0_10px_30px_rgba(6,18,22,0.18)]">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? "bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                    : "text-[#ece3ee]  hover:text-[#a2378d] hover:bg-white/10"
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
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-[#ffffff] text-sm font-semibold  shadow-[0_12px_28px_rgba(95,208,182,0.28)] hover:brightness-110 transition-all duration-200"
            >
              Əlaqə
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
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
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#0d292e]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
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
                  ? "text-white bg-white/10"
                  : "text-white/80 hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/elaqe"
            className="mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#5fd0b6] to-[#d9b06a] text-[#0b1f22] text-sm font-semibold text-center"
          >
            Əlaqə saxlayın
          </Link>
        </div>
      </div>
    </nav>
  );
}
