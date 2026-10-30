import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR } from '../../utils/currency';
import { AlertCircle, Ban, ArrowRight, Building2 } from 'lucide-react';

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
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 border-b border-rural-border/70 pb-4 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
            <Ban className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-rural-forest">
              Markets That Cannot Buy Your Full Crop ({infeasibleMarkets.length})
            </h3>
            <p className="text-xs sm:text-sm text-rural-muted font-sans">
              These markets cannot accept your entire harvest in one go because of buying limits, minimum orders, or vehicle rules.
            </p>
          </div>
        </div>
        <span className="text-xs text-amber-900 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto font-sans">
          Excluded from Single-Market Option
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infeasibleMarkets.map((res) => (
          <div
            key={res.market.id}
            className="rounded-2xl border border-rural-border bg-rural-cream/60 p-5 hover:border-rural-fresh/50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif font-bold text-rural-forest text-base">
                    {res.market.name}
                  </h4>
                  <p className="text-xs text-rural-muted font-sans mt-0.5">
                    {res.market.locationName} • {res.market.distanceKm} km away
                  </p>
                </div>
                <div className="text-right font-sans">
                  <span className="text-[10px] uppercase font-bold text-rural-muted block">
                    Offered Price
                  </span>
                  <span className="text-xs font-bold text-rural-forest">
                    {formatINR(res.market.pricesPerQuintal.A)} / Qtl
                  </span>
                </div>
              </div>

              {/* Infeasibility Reason Badge */}
              <div className="mt-3.5 bg-amber-50/80 rounded-xl p-3 border border-amber-200/80 text-xs text-amber-950 flex items-start space-x-2 font-sans">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950 block">Why this market cannot buy:</span>
                  <p className="leading-relaxed mt-0.5 text-amber-900">
                    {res.feasibilityReasons.join(' ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rural-border/70 flex items-center justify-between text-xs text-rural-muted font-sans">
              <span>
                Maximum Market Limit: <strong className="text-rural-forest">{res.market.maxCapacityQuintals} Qtl</strong>
              </span>
              <button
                type="button"
                onClick={() => onSelectMarket(res)}
                className="text-xs font-semibold text-rural-primary hover:text-rural-forest flex items-center space-x-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
