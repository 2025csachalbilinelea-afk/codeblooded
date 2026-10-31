import React from 'react';
import { ShieldCheck, Info, Scale, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-rural-deep border-t border-rural-deep text-white/70 py-12 mt-20 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-white font-serif font-bold mb-2">
              <Scale className="w-4 h-4 text-rural-fresh" />
              <span>The HarvestRoute Principle</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Distant agricultural markets often advertise higher prices, but longer trips can eat up profits through fuel expenses, road damage, and buyer purchase quotas. HarvestRoute helps you compare what you actually keep in your pocket.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-serif font-bold mb-2">
              <Info className="w-4 h-4 text-rural-fresh" />
              <span>Transparent Calculations</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Every travel expense, market commission, and produce loss estimate is calculated openly. Market prices and arrival volumes are retrieved dynamically from official AGMARKNET and data.gov.in agricultural feeds.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-serif font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-rural-fresh" />
              <span>Reliable Decision Support</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Powered by modular calculation engines that respect vehicle capacities, round-trip travel costs, and single-market vs. multi-market split-harvest optimization.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div className="flex items-center space-x-2">
            <BrandLogo variant="light" size="sm" />
            <span>— Precision Decision Support for Farmers</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-300/80 text-center sm:text-right">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Real-time APMC mandi intelligence. Spot modal prices updated daily from official AGMARKNET feeds.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
