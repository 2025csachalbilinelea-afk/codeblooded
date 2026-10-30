import React from 'react';
import { SplitHarvestResult } from '../../types/agriculture';
import { formatINR } from '../../utils/currency';
import { Split, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface SplitHarvestModalProps {
  splitResult: SplitHarvestResult | null;
  onClose: () => void;
}

export const SplitHarvestModal: React.FC<SplitHarvestModalProps> = ({ splitResult, onClose }) => {
  if (!splitResult) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-rural-deep/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="bg-rural-forest text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Split className="w-4 h-4 text-rural-fresh" />
              <span className="text-xs font-semibold uppercase tracking-wider text-rural-mint">
                Selling at Two Markets
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-white mt-1">Plan for Selling at Two Markets</h2>
            <p className="text-xs text-rural-mint/80">
              Dividing your harvest to get higher prices while respecting market purchase limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rural-deep text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3 ${
              splitResult.isSplitAdvantageous
                ? 'bg-rural-sage/80 border-rural-fresh/50 text-rural-forest'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {splitResult.isSplitAdvantageous ? (
              <CheckCircle2 className="w-5 h-5 text-rural-fresh shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-sm font-serif font-bold block">
                {splitResult.isSplitAdvantageous
                  ? `Splitting Yields +${formatINR(splitResult.netGainFromSplitting)} Extra Profit!`
                  : 'Single-Market Sale Remains Preferred'}
              </strong>
              <p className="text-xs mt-1 leading-relaxed font-sans">
                {splitResult.explanation}
              </p>
            </div>
          </div>

          {/* Allocation details */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-rural-forest text-xs uppercase tracking-wider">
              Allocated Destinations
            </h4>
            {splitResult.allocations.map((alloc, idx) => (
              <div
                key={alloc.market.id}
                className="p-3.5 rounded-2xl border border-rural-border bg-rural-cream flex items-center justify-between"
              >
                <div>
                  <strong className="font-serif font-bold text-rural-forest text-sm block">
                    Leg #{idx + 1}: {alloc.market.name}
                  </strong>
                  <span className="text-[11px] text-rural-muted">
                    {alloc.market.locationName} • {alloc.market.distanceKm} km haul
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-rural-forest text-sm font-sans block">
                    {alloc.allocatedQuintals.toFixed(1)} Qtl
                  </span>
                  <span className="text-[11px] text-rural-primary font-semibold">
                    Net: {formatINR(alloc.netReturn)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Financial summary */}
          <div className="bg-rural-forest text-white rounded-2xl p-4 flex items-center justify-between shadow-rural-soft">
            <div>
              <span className="text-[10px] uppercase font-bold text-rural-mint block">
                Total Multi-Market Net Return
              </span>
              <span className="text-2xl font-black tracking-tight font-sans">
                {formatINR(splitResult.planTotals.totalNetReturn)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-rural-mint/80 block">Net Advantage</span>
              <span className="text-base font-bold text-rural-mint font-sans">
                {splitResult.netGainFromSplitting >= 0 ? `+${formatINR(splitResult.netGainFromSplitting)}` : `-${formatINR(Math.abs(splitResult.netGainFromSplitting))}`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-rural-cream p-3 px-5 border-t border-rural-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-rural-forest hover:bg-rural-deep text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
