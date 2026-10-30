import React from 'react';
import { ShieldCheck, Info, Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 py-10 mt-16 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-stone-200 font-semibold mb-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>The HarvestRoute Principle</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Distant agricultural markets frequently advertise inflated sticker prices to attract consignments.
              HarvestRoute protects farmer livelihood by deducting the hidden realities: multi-trip diesel costs,
              transit vibration losses, market cess, unloading charges, and strict buyer purchase ceilings.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-stone-200 font-semibold mb-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Transparent Simulation Model</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              All prices, distances, and capacities shown in this demonstration platform are generated using
              configurable econometric models calibrated for 28+ crops across 4 perishability classes.
              No fictional quotes are ever represented as live government APMC data.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-stone-200 font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Architectural Integrity</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Built with modular TypeScript calculation engines decoupled from presentation state. Supports
              positive and negative net margins, manual vs. multi-factor environmental spoilage models,
              and capacity-constrained single and split harvest optimization.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© 2026 HarvestRoute - Smart Agricultural Market Selection Platform.</p>
          <p className="mt-2 sm:mt-0 font-medium text-stone-400">
            Precision Agritech Decision Support System
          </p>
        </div>
      </div>
    </footer>
  );
};

