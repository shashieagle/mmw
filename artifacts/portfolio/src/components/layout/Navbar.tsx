import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAdminMode } from "@/hooks/use-admin-mode";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAdminMode();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/architects", label: "Architects" },
    { href: "/studio", label: "Studio" },
    ...(isAdmin ? [{ href: "/upload", label: "Upload" }] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group relative z-50">
          <img
            src="/logo-icon-transparent.png"
            alt="MMW"
            className="h-8 w-8 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="text-xl md:text-2xl font-bold tracking-tighter text-white">
            MONKMONKEYWORKS
          </span>
          <div className="h-1 w-1 bg-white rounded-full group-hover:scale-[3] transition-transform duration-300" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-widest font-medium transition-colors duration-300 relative group py-2 ${
                location === link.href ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-300 ${
                  location === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50 relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav */}
        <div
          className={`fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center transition-all duration-500 ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <nav className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl uppercase tracking-widest font-bold ${
                  location === link.href ? "text-white" : "text-gray-400"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
