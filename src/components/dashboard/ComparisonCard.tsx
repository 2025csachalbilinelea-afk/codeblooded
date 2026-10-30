import React from 'react';
import { ComparisonAnalysis } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, XCircle, ShieldAlert } from 'lucide-react';

interface ComparisonCardProps {
  comparison: ComparisonAnalysis | null;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ comparison }) => {
  if (!comparison) return null;

  const {
    highestPriceMarket: hp,
    highestNetReturnMarket: hnr,
    isSameMarket,
    hasFeasibleOption,
    netReturnDifferenceTotal,
    dynamicExplanation,
    warningNotice,
  } = comparison;

  // If no feasible market exists
  if (!hasFeasibleOption || !hnr) {
    return (
      <div className="bg-stone-900 text-stone-100 rounded-2xl border border-rose-800/80 shadow-lg p-5 sm:p-6 overflow-hidden relative">
        <div className="flex items-center space-x-2 text-rose-400 font-bold mb-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-sm uppercase tracking-wider">
            Market Capacity Notice
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          No Market Found That Can Buy Your Full Crop
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-stone-800/80 p-4 rounded-xl border border-stone-700">
          {dynamicExplanation}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-2xl border border-stone-700/80 shadow-lg p-5 sm:p-6 overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-2 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Our Core Rule for Farmers
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Highest Advertised Price <span className="text-stone-400 font-light">vs.</span> Actual Money You Keep
          </h2>
        </div>

        {!isSameMarket && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Extra Money You Keep: +{formatINR(netReturnDifferenceTotal)}</span>
          </div>
        )}
      </div>

      {/* Dynamic Plain-Language Explanation Callout */}
      <div className="my-4 p-4 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 text-xs sm:text-sm leading-relaxed relative z-10 shadow-inner">
        {warningNotice && (
          <div className="mb-2 flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{warningNotice}</span>
          </div>
        )}
        <p className="font-normal">{dynamicExplanation}</p>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 relative z-10">
        {/* Left Card: Market with Highest Advertised Price */}
        <div
          className={`rounded-xl border p-4.5 ${
            !hp.isFeasible
              ? 'bg-rose-950/20 border-rose-800/60'
              : isSameMarket
              ? 'bg-emerald-950/20 border-emerald-800/60'
              : 'bg-amber-950/20 border-amber-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
              Highest Advertised Price
            </span>
            <span
              className={`text-xs font-semibold flex items-center space-x-1 ${
                hp.isFeasible ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {hp.isFeasible ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Can Buy All Your Crop</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cannot Buy All Your Crop</span>
                </>
              )}
            </span>
          </div>

          <h3 className="text-base font-bold text-white truncate" title={hp.market.name}>
            {hp.market.name}
          </h3>
          <p className="text-xs text-stone-400 mb-4">
            {hp.market.locationName} ({hp.market.distanceKm} km away)
          </p>

          <div className="space-y-2 text-xs divide-y divide-stone-800">
            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Offered Price:</span>
              <strong className="text-amber-300 text-sm font-bold">
                {formatINR(hp.market.pricesPerQuintal.A)} / Qtl
              </strong>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">How Much This Market Can Buy:</span>
              <strong className={hp.isFeasible ? 'text-stone-200' : 'text-rose-400 font-semibold'}>
                {hp.market.maxCapacityQuintals} Qtl{' '}
                {!hp.isFeasible && `(Your Harvest: ${hp.initialQuantityQuintals} Qtl)`}
              </strong>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Crop Lost on the Way:</span>
              <span className="text-stone-200 font-medium">
                {hp.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(hp.estimatedLossPercent)})
              </span>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Transport Cost:</span>
              <span className="text-stone-200 font-medium">{formatINR(hp.transportationCost)}</span>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Market Charges:</span>
              <span className="text-stone-200 font-medium">{formatINR(hp.totalMarketFees)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5 bg-stone-900/60 -mx-2 px-2 rounded-lg">
              <span className="text-stone-300 font-medium">Estimated Money You Keep:</span>
              <strong
                className={`text-base font-bold ${
                  hp.netReturn >= 0 ? 'text-stone-200' : 'text-rose-400'
                }`}
              >
                {formatINR(hp.netReturn)}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Card: Best Choice for Highest Earnings (Winner) */}
        <div className="rounded-xl border border-emerald-600/60 bg-emerald-950/30 p-4.5 relative shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-800 text-emerald-200 border border-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Best Choice for Highest Earnings</span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Can Buy All Your Crop</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-white truncate" title={hnr.market.name}>
            {hnr.market.name}
          </h3>
          <p className="text-xs text-stone-400 mb-4">
            {hnr.market.locationName} ({hnr.market.distanceKm} km away)
          </p>

          <div className="space-y-2 text-xs divide-y divide-emerald-900/60">
            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Offered Price:</span>
              <strong className="text-stone-200 font-semibold text-sm">
                {formatINR(hnr.market.pricesPerQuintal.A)} / Qtl
              </strong>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">How Much This Market Can Buy:</span>
              <strong className="text-emerald-300 font-semibold">
                {hnr.market.maxCapacityQuintals} Qtl (Full Harvest Accepted)
              </strong>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Crop Lost on the Way:</span>
              <span className="text-emerald-300 font-medium">
                {hnr.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(hnr.estimatedLossPercent)})
              </span>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Transport Cost:</span>
              <span className="text-emerald-300 font-medium">{formatINR(hnr.transportationCost)}</span>
            </div>

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-stone-400">Market Charges:</span>
              <span className="text-emerald-300 font-medium">{formatINR(hnr.totalMarketFees)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5 bg-emerald-900/60 -mx-2 px-2 rounded-lg border border-emerald-600/50">
              <span className="text-white font-semibold">Money You Keep:</span>
              <strong className="text-lg font-bold text-emerald-300">
                {formatINR(hnr.netReturn)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
