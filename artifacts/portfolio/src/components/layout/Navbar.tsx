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

  // CATALYST: set showCatalyst to true to make Catalyst visible in the nav
  const showCatalyst = false;
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/architects", label: "Architects" },
    { href: "/studio", label: "Studio" },
    { href: "/founders", label: "Leadership" },
    ...(showCatalyst ? [{ href: "/catalyst", label: "Catalyst" }] : []),
    ...(isAdmin ? [{ href: "/upload", label: "Upload" }] : []),
  ];

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass py-4 border-b border-white/5 shadow-2xl" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group relative z-50" data-testid="link-nav-home">
          <img
            src="/logo-icon-transparent.png"
            alt="MMW"
            className="h-8 w-8 object-contain"
            style={{ filter: "brightness(0) saturate(100%) invert(45%) sepia(90%) saturate(700%) hue-rotate(345deg) brightness(105%)" }}
          />
          <span className="text-xl md:text-2xl font-bold tracking-tighter text-white">
            MONKMONKEYWORKS
          </span>
          <div className="h-1 w-1 rounded-full group-hover:scale-[3] transition-transform duration-300 bg-primary" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
              className={`text-[10px] md:text-xs uppercase tracking-widest font-bold transition-colors duration-300 relative group py-2 ${
                location === link.href ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 bg-primary ${
                  location === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50 relative p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav */}
        <div
          className={`fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center transition-all duration-500 ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
          data-testid="mobile-menu-drawer"
        >
          <nav className="flex flex-col items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
                className={`text-2xl md:text-3xl uppercase tracking-widest font-display font-bold transition-colors ${
                  location === link.href ? "text-primary" : "text-white hover:text-primary"
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
