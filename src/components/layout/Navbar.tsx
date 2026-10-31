import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/types';
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
  Globe,
} from 'lucide-react';

export type AppView = 'landing' | 'dashboard' | 'marketplace' | 'reports';

interface NavbarProps {
  currentView: AppView;
  currentStep?: 1 | 2 | 3;
  onNavigateView: (view: AppView, step?: 1 | 2 | 3) => void;
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
  const { language, setLanguage, t } = useLanguage();

  const handleNavClick = (view: AppView, step?: 1 | 2 | 3) => {
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
                  currentView === 'dashboard' && currentStep !== 2
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-rural-mint" />
                <span>{t('nav.dashboard', 'Farmer Dashboard')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('dashboard', 2)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'dashboard' && currentStep === 2
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-rural-fresh" />
                <span>{t('nav.livePrices', 'Live Mandi Prices')}</span>
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
                <span>{t('nav.marketplace', 'Bulk Buyer Marketplace')}</span>
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
                <span>{t('nav.report', 'Print Report')}</span>
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

            {/* Clean & Accessible Language Selector Dropdown */}
            <div className="flex items-center space-x-1.5 bg-rural-deep/90 border border-rural-primary/60 rounded-xl px-2.5 py-1 text-white shadow-sm hover:border-rural-fresh transition-all">
              <Globe className="w-3.5 h-3.5 text-rural-fresh shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                <option value="en" className="bg-rural-deep text-white font-medium">English</option>
                <option value="kn" className="bg-rural-deep text-white font-medium">ಕನ್ನಡ (Kannada)</option>
                <option value="hi" className="bg-rural-deep text-white font-medium">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* Reset */}
            {onResetDefaults && (
              <button
                type="button"
                onClick={onResetDefaults}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rural-deep hover:bg-black/30 text-white/80 border border-white/15 transition-colors cursor-pointer"
                title="Reset all inputs to recommended defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('nav.resetDefaults', 'Reset')}</span>
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
                <span>{t('nav.report', 'Report')}</span>
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
        <div className="xl:hidden bg-rural-deep border-t border-white/10 px-4 pt-3 pb-5 space-y-3 text-white animate-fade-in shadow-xl">
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/15">
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <Globe className="w-4 h-4 text-rural-fresh" />
              <span>{t('nav.selectLanguage', 'Language')}</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-rural-deep text-xs font-bold text-white px-2.5 py-1 rounded-lg border border-rural-primary/60 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

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
                currentView === 'dashboard' && currentStep !== 2
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-rural-mint" />
              <span>{t('nav.dashboard', 'Farmer Dashboard')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('dashboard', 2)}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                currentView === 'dashboard' && currentStep === 2
                  ? 'bg-white/15 font-semibold text-white'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <Store className="w-4 h-4 text-rural-fresh" />
              <span>{t('nav.livePrices', 'Live Mandi Prices')}</span>
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
              <span>{t('nav.marketplace', 'Bulk Buyer Marketplace')}</span>
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
              <span>{t('nav.report', 'Print Report')}</span>
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
                <span>{t('nav.resetDefaults', 'Reset Defaults')}</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onPrint();
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-rural-fresh text-white font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('nav.report', 'Print Report')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
