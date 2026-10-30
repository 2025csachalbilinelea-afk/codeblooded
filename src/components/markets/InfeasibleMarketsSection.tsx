import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR } from '../../utils/currency';
import { AlertCircle, Ban, ArrowRight, Eye, ShieldAlert } from 'lucide-react';

interface InfeasibleMarketsSectionProps {
  infeasibleMarkets: MarketCalculationResult[];
  onSelectMarket: (market: MarketCalculationResult) => void;
}

export const InfeasibleMarketsSection: React.FC<InfeasibleMarketsSectionProps> = ({
  infeasibleMarkets,
  onSelectMarket,
}) => {
  if (infeasibleMarkets.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-sm p-5 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-stone-100 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Ban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Infeasible Single-Market Options ({infeasibleMarkets.length})
            </h3>
            <p className="text-xs text-stone-500">
              These destinations cannot purchase your complete consignment in a single transaction due to capacity, quota, or vehicle limitations.
            </p>
          </div>
        </div>
        <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 self-start sm:self-auto">
          Excluded from Single-Sale Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {infeasibleMarkets.map((res) => (
          <div
            key={res.market.id}
            className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{res.market.name}</h4>
                <p className="text-xs text-stone-500">
                  {res.market.locationName} • {res.market.distanceKm} km
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Advertised Price</span>
                <span className="text-xs font-bold text-stone-800">
                  {formatINR(res.market.pricesPerQuintal.A)} / Qtl
                </span>
              </div>
            </div>

            {/* Infeasibility Reason Badge */}
            <div className="mt-3 bg-amber-50 rounded-lg p-2.5 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">Disqualification Reason:</span>
                <p className="leading-relaxed mt-0.5 text-amber-800">
                  {res.feasibilityReasons.join(' ')}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
              <span>
                Market Max Capacity: <strong>{res.market.maxCapacityQuintals} Qtl</strong>
              </span>
              <button
                type="button"
                onClick={() => onSelectMarket(res)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1"
              >
                <span>Inspect Calculation</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

