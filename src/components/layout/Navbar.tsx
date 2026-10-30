import React from 'react';
import { Route, Sprout, AlertTriangle, Printer, RotateCcw, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onResetDefaults: () => void;
  onPrint: () => void;
  onToggleVerification?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetDefaults, onPrint, onToggleVerification }) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-inner">
              <Route className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Harvest<span className="text-emerald-400">Route</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  Agri-Supply Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Know your best market before your produce leaves the farm
              </p>
            </div>
          </div>

          {/* Simulation Indicator & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Prominent Simulated Data Indicator required by Problem Statement */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Simulated Demonstration Data</span>
              <span className="md:hidden">Simulated</span>
            </div>

            {onToggleVerification && (
              <button
                type="button"
                onClick={onToggleVerification}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-stone-700 transition-colors"
                title="View automated verification tests"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Engine Tests</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetDefaults}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
              title="Reset all inputs to recommended defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors"
              title="Print or export current market evaluation"
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

