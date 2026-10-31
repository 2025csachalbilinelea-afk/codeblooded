import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { Menu, X, ArrowRight, Store, Building2 } from 'lucide-react';

interface LandingNavbarProps {
  onOpenDashboard: () => void;
  onOpenMandiPrices?: () => void;
  onOpenMarketplace?: () => void;
  onOpenReports?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenDashboard,
  onOpenMandiPrices,
  onOpenMarketplace,
  onOpenReports,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-rural-forest/95 backdrop-blur-md shadow-md py-3.5 border-b border-rural-deep'
          : 'bg-gradient-to-b from-rural-deep/90 via-rural-deep/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="text-left focus:outline-none cursor-pointer"
          >
            <BrandLogo variant="light" size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-white/90">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="hover:text-rural-mint transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-rural-mint transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits')}
              className="hover:text-rural-mint transition-colors cursor-pointer"
            >
              Benefits
            </button>
            {onOpenMandiPrices && (
              <button
                type="button"
                onClick={onOpenMandiPrices}
                className="hover:text-rural-fresh transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-rural-fresh" />
                <span>Mandi Prices</span>
              </button>
            )}
            {onOpenMarketplace && (
              <button
                type="button"
                onClick={onOpenMarketplace}
                className="hover:text-amber-300 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Bulk Marketplace</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="hover:text-rural-mint transition-colors cursor-pointer"
            >
              About Us
            </button>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-rural-fresh text-white font-medium text-sm hover:bg-rural-fresh/90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-rural-deep/80 text-white hover:bg-rural-forest transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-rural-forest border-b border-rural-deep px-4 pt-4 pb-6 space-y-3 text-white">
          <nav className="flex flex-col space-y-3 font-medium text-base">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="text-left py-1 hover:text-rural-mint cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-1 hover:text-rural-mint cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits')}
              className="text-left py-1 hover:text-rural-mint cursor-pointer"
            >
              Benefits
            </button>
            {onOpenMandiPrices && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMandiPrices();
                }}
                className="text-left py-1 hover:text-rural-fresh flex items-center space-x-2 cursor-pointer"
              >
                <Store className="w-4 h-4 text-rural-fresh" />
                <span>Live Mandi Prices</span>
              </button>
            )}
            {onOpenMarketplace && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMarketplace();
                }}
                className="text-left py-1 hover:text-amber-300 flex items-center space-x-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span>Bulk Buyer Marketplace</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="text-left py-1 hover:text-rural-mint cursor-pointer"
            >
              About Us
            </button>
          </nav>

          <div className="pt-3 border-t border-rural-deep/80 space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDashboard();
              }}
              className="w-full py-3 rounded-xl bg-rural-fresh text-white font-semibold text-center flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Open Farmer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
