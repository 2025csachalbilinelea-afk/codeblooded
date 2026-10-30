import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { X, Building2, AlertCircle } from 'lucide-react';

interface FinancialBreakdownModalProps {
  result: MarketCalculationResult | null;
  onClose: () => void;
}

export const FinancialBreakdownModal: React.FC<FinancialBreakdownModalProps> = ({
  result,
  onClose,
}) => {
  if (!result) return null;

  const { market } = result;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-rural-deep/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="bg-rural-forest text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-rural-fresh" />
              <span className="text-xs font-semibold uppercase tracking-wider text-rural-mint">
                Market Cost & Earnings Breakdown
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  result.isFeasible
                    ? 'bg-rural-deep text-rural-mint border border-rural-fresh/40'
                    : 'bg-rose-900/80 text-rose-300 border border-rose-600'
                }`}
              >
                {result.isFeasible ? 'Can Buy All Your Crop' : 'Cannot Buy All Your Crop'}
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-white mt-1">{market.name}</h2>
            <p className="text-xs text-rural-mint/80">
              {market.locationName} • {market.distanceKm} km away • {market.typicalWaitTimeHours} hrs wait
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

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {/* Infeasibility notice if any */}
          {!result.isFeasible && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Why This Market Cannot Buy:</strong>
                <p className="mt-0.5 text-xs leading-relaxed">
                  {result.feasibilityReasons.join(' ')}
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Physical Volume & Loss on the Way */}
          <div className="bg-rural-cream rounded-2xl p-4 border border-rural-border">
            <h3 className="font-serif font-bold text-rural-forest text-xs uppercase tracking-wider mb-2.5">
              1. Crop Quantity & Loss on the Way
            </h3>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-rural-border">
                <span className="text-[10px] text-rural-muted block">Total Harvested</span>
                <span className="font-bold text-rural-forest text-sm">
                  {result.initialQuantityQuintals.toFixed(1)} Qtl
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rural-border">
                <span className="text-[10px] text-rural-muted block">
                  Lost on Way ({formatPercent(result.estimatedLossPercent)})
                </span>
                <span className="font-bold text-amber-800 text-sm">
                  -{result.physicalLossQuintals.toFixed(1)} Qtl
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rural-border">
                <span className="text-[10px] text-rural-muted block">Available to Sell</span>
                <span className="font-bold text-rural-primary text-sm">
                  {result.saleableQuantityQuintals.toFixed(1)} Qtl
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Selling Proceeds */}
          <div className="bg-rural-cream rounded-2xl p-4 border border-rural-border">
            <h3 className="font-serif font-bold text-rural-forest text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>2. Total Selling Money</span>
              <span className="text-rural-forest font-bold">
                {formatINR(result.grossRevenue)}
              </span>
            </h3>
            <div className="space-y-1.5 divide-y divide-rural-border/60 text-rural-charcoal">
              <div className="flex justify-between items-center pt-1.5">
                <span>Crop Sold at Market</span>
                <strong className="text-rural-forest font-bold">
                  {result.saleableQuantityQuintals.toFixed(1)} Quintals
                </strong>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span>Effective Selling Price</span>
                <strong className="text-rural-forest font-bold">
                  {formatINR(Math.round(result.grossRevenue / Math.max(0.1, result.saleableQuantityQuintals)))} / Qtl
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Transport Costs */}
          <div className="bg-rural-cream rounded-2xl p-4 border border-rural-border">
            <h3 className="font-serif font-bold text-rural-forest text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>3. Transport Cost</span>
              <span className="text-rose-700 font-bold">
                -{formatINR(result.transportationCost)}
              </span>
            </h3>
            <p className="text-[11px] text-rural-muted">
              Vehicle trips needed: {result.transportTrips} {result.transportTrips === 1 ? 'trip' : 'trips'} across {market.distanceKm} km.
            </p>
          </div>

          {/* Section 4: Market Charges */}
          <div className="bg-rural-cream rounded-2xl p-4 border border-rural-border">
            <h3 className="font-serif font-bold text-rural-forest text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>4. Market Charges & Fees</span>
              <span className="text-rose-700 font-bold">
                -{formatINR(result.totalMarketFees)}
              </span>
            </h3>
            <div className="space-y-1.5 divide-y divide-rural-border/60 text-rural-charcoal">
              <div className="flex justify-between items-center pt-1.5">
                <span>Market Commission ({market.commissionFeePercent}%)</span>
                <span>{formatINR(result.marketCommissionFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span>Market Cess ({market.marketCessPercent}%)</span>
                <span>{formatINR(result.marketCessFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span>Hamali & Unloading (₹{market.handlingChargePerQuintal} / Qtl)</span>
                <span>{formatINR(result.marketHandlingFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span>Entry & Weighbridge Fee</span>
                <span>{formatINR(result.marketFixedFee)}</span>
              </div>
            </div>
          </div>

          {/* Final Net Return Result */}
          <div className="bg-rural-forest text-white rounded-2xl p-4 flex items-center justify-between shadow-rural-soft">
            <div>
              <span className="text-[10px] uppercase font-bold text-rural-mint block">
                Actual Money You Keep
              </span>
              <span className="text-2xl font-black tracking-tight font-sans">
                {formatINR(result.netReturn)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-rural-mint/80 block">Money Kept per Quintal</span>
              <span className="text-base font-bold text-white font-sans">
                {formatINR(result.netReturnPerQuintal)} / Qtl
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
