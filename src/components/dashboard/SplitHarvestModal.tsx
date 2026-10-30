import React from 'react';
import { SplitHarvestResult } from '../../types/agriculture';
import { formatINR } from '../../utils/currency';
import { Split, X, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

interface SplitHarvestModalProps {
  splitResult: SplitHarvestResult | null;
  onClose: () => void;
}

export const SplitHarvestModal: React.FC<SplitHarvestModalProps> = ({ splitResult, onClose }) => {
  if (!splitResult) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Split className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Selling at Two Markets
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Plan for Selling at Two Markets</h2>
            <p className="text-xs text-stone-400">
              Dividing your harvest to get higher prices while respecting market purchase limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Verdict Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start space-x-2.5 ${
              splitResult.isSplitAdvantageous
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {splitResult.isSplitAdvantageous ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-sm font-bold block">
                {splitResult.isSplitAdvantageous
                  ? `Splitting Yields +${formatINR(splitResult.netGainFromSplitting)} Extra Profit!`
                  : 'Single-Market Sale Remains Preferred'}
              </strong>
              <p className="text-xs mt-1 leading-relaxed">{splitResult.explanation}</p>
            </div>
          </div>

          {/* Allocation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {splitResult.allocations.map((alloc, idx) => (
              <div key={alloc.market.id} className="bg-stone-50 rounded-xl p-3.5 border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                    Route #{idx + 1} Allocation
                  </span>
                  <span className="font-bold text-emerald-800 text-xs">
                    {alloc.allocatedQuintals} Qtl
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-sm truncate">{alloc.market.name}</h4>
                <p className="text-[11px] text-stone-500 mb-2.5">
                  {alloc.market.locationName} ({alloc.market.distanceKm} km)
                </p>

                <div className="space-y-1 divide-y divide-stone-200 text-stone-600 text-[11px]">
                  <div className="flex justify-between pt-1">
                    <span>Grade A Rate:</span>
                    <strong>{formatINR(alloc.market.pricesPerQuintal.A)}/Qtl</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Gross Proceeds:</span>
                    <span>{formatINR(alloc.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Transport Deducted:</span>
                    <span className="text-rose-600">-{formatINR(alloc.transportCost)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Market Deductions:</span>
                    <span className="text-rose-600">-{formatINR(alloc.marketFees)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 font-bold text-stone-900">
                    <span>Route Net Contribution:</span>
                    <span className="text-emerald-800">{formatINR(alloc.netReturn)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Summary */}
          <div className="bg-stone-100 rounded-xl p-3.5 border border-stone-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-stone-500 block">Single-Market Best Return:</span>
              <span className="font-bold text-stone-800 text-sm">
                {formatINR(splitResult.singleBestNetReturn)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
            <div className="text-right">
              <span className="text-stone-500 block">Split-Strategy Combined Return:</span>
              <span className="font-bold text-emerald-800 text-sm">
                {formatINR(splitResult.totalNetReturn)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-3 px-5 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

