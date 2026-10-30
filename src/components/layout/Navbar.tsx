import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { AlertCircle, RotateCcw, Printer, ShieldCheck, Home } from 'lucide-react';

interface NavbarProps {
  onGoHome: () => void;
  onResetDefaults: () => void;
  onPrint: () => void;
  onToggleVerification?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onResetDefaults,
  onPrint,
  onToggleVerification,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-rural-forest border-b border-rural-deep text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onGoHome}
              className="text-left focus:outline-none flex items-center group cursor-pointer"
              title="Return to HarvestRoute Home"
            >
              <BrandLogo variant="light" size="md" />
            </button>
            <div className="hidden lg:block pl-4 border-l border-white/15">
              <p className="text-xs text-rural-mint/90 font-medium">
                Know your best market before your produce leaves the farm
              </p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Home Link */}
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              title="Return to public landing page"
            >
              <Home className="w-3.5 h-3.5 text-rural-mint" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Demonstration Sample Data Notice */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Sample Prices — Check Before Selling</span>
              <span className="md:hidden">Sample Prices</span>
            </div>

            {/* Test Runner */}
            {onToggleVerification && (
              <button
                type="button"
                onClick={onToggleVerification}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rural-deep hover:bg-black/30 text-rural-mint border border-rural-primary/40 transition-colors"
                title="Verify calculation engine status"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rural-fresh" />
                <span>Calculator Is Ready</span>
              </button>
            )}

            {/* Reset */}
            <button
              type="button"
              onClick={onResetDefaults}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rural-deep hover:bg-black/30 text-white/80 border border-white/15 transition-colors"
              title="Reset all inputs to recommended defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Print Report */}
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rural-fresh hover:bg-rural-fresh/90 text-white shadow-sm transition-all"
              title="Print or export market evaluation dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
