import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import {
  AlertCircle,
  RotateCcw,
  Printer,
  ShieldCheck,
  Home,
  LayoutDashboard,
  Store,
  Building2,
  FileText,
  Menu,
  X,
} from 'lucide-react';

export type AppView = 'landing' | 'dashboard' | 'marketplace' | 'reports';

interface NavbarProps {
  currentView: AppView;
  currentStep?: 1 | 2 | 3 | 4 | 5 | 6;
  onNavigateView: (view: AppView, step?: 1 | 2 | 3 | 4 | 5 | 6) => void;
  onResetDefaults?: () => void;
  onPrint?: () => void;
  onToggleVerification?: () => void;
  priceStatus?: 'LIVE' | 'CACHED' | 'SAMPLE' | 'UNAVAILABLE';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentStep = 1,
  onNavigateView,
  onResetDefaults,
  onPrint,
  onToggleVerification,
  priceStatus = 'CACHED',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView, step?: 1 | 2 | 3 | 4 | 5 | 6) => {
    setIsMobileMenuOpen(false);
    onNavigateView(view, step);
  };

  return (
    <header className="sticky top-0 z-40 bg-rural-forest border-b border-rural-deep text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className="text-left focus:outline-none flex items-center group cursor-pointer"
              title="Return to HarvestRoute Home"
            >
              <BrandLogo variant="light" size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1 border-l border-white/15 pl-6">
              <button
                type="button"
                onClick={() => handleNavClick('landing')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'landing'
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-rural-mint" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('dashboard', 1)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'dashboard' && currentStep !== 5
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-rural-mint" />
                <span>Farmer Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('dashboard', 5)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'dashboard' && currentStep === 5
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-rural-fresh" />
                <span>Live Mandi Prices</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('marketplace')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'marketplace'
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Bulk Buyer Marketplace</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('reports')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'reports'
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rural-mint" />
                <span>Reports</span>
              </button>
            </nav>
          </div>

          {/* Quick Actions & Live AGMARKNET Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dynamic Agricultural Price Source Status */}
            {priceStatus === 'LIVE' ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden lg:inline">Live AGMARKNET Feed — Verified Arrivals</span>
                <span className="lg:hidden hidden sm:inline">Live AGMARKNET</span>
              </div>
            ) : priceStatus === 'CACHED' ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-950/70 border border-sky-500/40 text-sky-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="hidden lg:inline">Cached AGMARKNET Data — Check Before Selling</span>
                <span className="lg:hidden hidden sm:inline">Cached AGMARKNET</span>
              </div>
            ) : priceStatus === 'UNAVAILABLE' ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden lg:inline">Prices Unavailable — Check Mandi Directly</span>
                <span className="lg:hidden hidden sm:inline">Prices Unavailable</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden lg:inline">Market Rate Feed Active</span>
                <span className="lg:hidden hidden sm:inline">Market Feed</span>
              </div>
            )}

            {/* Test Runner / Calculator Status */}
            {onToggleVerification && (
              <button
                type="button"
                onClick={onToggleVerification}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rural-deep hover:bg-black/30 text-rural-mint border border-rural-primary/40 transition-colors cursor-pointer"
                title="Verify calculation engine status"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rural-fresh" />
                <span>Calculator Ready</span>
              </button>
            )}

            {/* Reset */}
            {onResetDefaults && (
              <button
                type="button"
                onClick={onResetDefaults}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rural-deep hover:bg-black/30 text-white/80 border border-white/15 transition-colors cursor-pointer"
                title="Reset all inputs to recommended defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Print Report */}
            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rural-fresh hover:bg-rural-fresh/90 text-white shadow-sm transition-all cursor-pointer"
                title="Print or export market evaluation dossier"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Button */}
            <div className="xl:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white focus:outline-none transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-rural-deep border-t border-white/10 px-4 pt-3 pb-5 space-y-2 text-white animate-fade-in shadow-xl">
          <div className="flex flex-col space-y-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                currentView === 'landing' ? 'bg-white/15 font-semibold text-white' : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <Home className="w-4 h-4 text-rural-mint" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('dashboard', 1)}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                currentView === 'dashboard' && currentStep !== 5
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-rural-mint" />
              <span>Farmer Dashboard (6-Step Workflow)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('dashboard', 5)}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                currentView === 'dashboard' && currentStep === 5
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <Store className="w-4 h-4 text-rural-fresh" />
              <span>Live Mandi Prices</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('marketplace')}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                currentView === 'marketplace'
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Bulk Buyer Marketplace (B2B Procurement)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('reports')}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                currentView === 'reports'
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <FileText className="w-4 h-4 text-rural-mint" />
              <span>Reports & Dossier</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            {onResetDefaults && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onResetDefaults();
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            )}

            {onToggleVerification && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onToggleVerification();
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rural-forest text-rural-mint hover:bg-black/30"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rural-fresh" />
                <span>Calculator Status</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
