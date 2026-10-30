import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { Trophy, TrendingUp, PackageCheck, AlertCircle, Fuel, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

interface MetricCardsProps {
  bestMarket: MarketCalculationResult | null;
  totalHarvestQuintals: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ bestMarket, totalHarvestQuintals }) => {
  if (!bestMarket) {
    return (
      <div className="bg-rose-50 border border-rose-300 rounded-3xl p-6 sm:p-8 text-center shadow-rural-soft">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-serif font-bold text-rose-950">
          No Market Found That Can Buy Your Full Crop
        </h3>
        <p className="text-sm text-rose-800 max-w-xl mx-auto mt-2 leading-relaxed">
          None of the nearby markets can purchase your complete harvest of{' '}
          <strong>{totalHarvestQuintals.toFixed(1)} Quintals</strong> in a single transaction due to market buying limits or vehicle constraints. Consider lowering your volume or check the multi-market Split Harvest option below.
        </p>
      </div>
    );
  }

  const isNetPositive = bestMarket.netReturn >= 0;

  return (
    <div className="space-y-4">
      {/* 1. HERO RESULT CARD: "OUR RECOMMENDED MARKET" */}
      <div className="bg-gradient-to-br from-rural-forest via-rural-deep to-rural-forest text-white rounded-3xl p-6 sm:p-8 shadow-rural-card border border-rural-deep relative overflow-hidden">
        {/* Ambient botanical glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rural-fresh/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rural-fresh/20 border border-rural-fresh/40 text-rural-mint text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-rural-fresh" />
              <span>Our Recommended Market</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              {bestMarket.market.name}
            </h2>
            <p className="text-sm text-rural-mint/80 mt-1 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-rural-fresh" />
              <span>{bestMarket.market.locationName}</span>
              <span>•</span>
              <span>{bestMarket.market.distanceKm} km away</span>
              <span>•</span>
              <span>Approx. {bestMarket.market.estimatedTravelTimeHours} hrs travel</span>
            </p>
          </div>

          {/* Large In-Pocket Earnings Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 min-w-[260px] text-left lg:text-right">
            <span className="text-xs uppercase font-semibold text-rural-mint/90 tracking-wider block">
              Estimated Money You Keep
            </span>
            <div className="text-3xl sm:text-4xl font-sans font-black text-white mt-0.5 tracking-tight">
              {formatINR(bestMarket.netReturn)}
            </div>
            <div className="text-xs sm:text-sm text-rural-mint font-medium mt-1">
              Estimated earnings per quintal:{' '}
              <strong className="text-white font-bold">
                {formatINR(bestMarket.netReturnPerQuintal)} / Qtl
              </strong>
            </div>
          </div>
        </div>

        {/* Breakdown Row & Why We Recommend This Market */}
        <div className="relative z-10 pt-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/80">
            <div>
              <span className="text-rural-mint/70">Expected Sales:</span>{' '}
              <strong className="text-white font-semibold">
                {formatINR(bestMarket.grossRevenue)}
              </strong>
            </div>
            <span className="text-white/30 hidden sm:inline">•</span>
            <div>
              <span className="text-rural-mint/70">Transport & Market Expenses:</span>{' '}
              <strong className="text-amber-300 font-semibold">
                -{formatINR(bestMarket.totalExpenses)}
              </strong>
            </div>
            <span className="text-white/30 hidden sm:inline">•</span>
            <div>
              <span className="text-rural-mint/70">Available to Sell:</span>{' '}
              <strong className="text-white font-semibold">
                {bestMarket.saleableQuantityQuintals.toFixed(1)} Qtl
              </strong>
            </div>
          </div>

          <div className="md:col-span-4 lg:text-right">
            <div className="inline-flex items-center space-x-1.5 text-xs text-rural-mint font-medium bg-white/5 px-3 py-1 rounded-lg border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-rural-fresh" />
              <span>100% Full Consignment Accepted</span>
            </div>
          </div>
        </div>

        {/* Dynamic Explanation Rationale */}
        <div className="relative z-10 mt-4 p-3.5 rounded-xl bg-rural-deep/70 border border-white/10 text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
          <strong className="font-semibold text-rural-mint">Why we recommend this market: </strong>
          {bestMarket.netReturn >= 0
            ? `This market leaves you with the highest take-home earnings of ${formatINR(bestMarket.netReturn)} after accounting for ${formatINR(bestMarket.transportationCost)} in delivery costs, ${formatINR(bestMarket.totalMarketFees)} in market charges, and ${bestMarket.physicalLossQuintals.toFixed(1)} Qtl estimated loss on the way.`
            : `Even though selling prices are tight, this destination minimizes your total delivery expenses and loss.`}
        </div>
      </div>

      {/* 2. THREE SUPPORTING SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card A: Expected Sales */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rural-border shadow-rural-soft">
          <div className="flex items-center justify-between text-xs text-rural-muted mb-1.5 font-medium">
            <span className="uppercase tracking-wider">Expected Sales</span>
            <TrendingUp className="w-4 h-4 text-rural-primary" />
          </div>
          <div className="text-2xl font-bold text-rural-forest font-sans">
            {formatINR(bestMarket.grossRevenue)}
          </div>
          <p className="text-xs text-rural-muted mt-1">
            Sold at {formatINR(Math.round(bestMarket.grossRevenue / Math.max(0.1, bestMarket.saleableQuantityQuintals)))} / Qtl effective rate
          </p>
        </div>

        {/* Card B: Produce Available to Sell */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rural-border shadow-rural-soft">
          <div className="flex items-center justify-between text-xs text-rural-muted mb-1.5 font-medium">
            <span className="uppercase tracking-wider">Available to Sell</span>
            <PackageCheck className="w-4 h-4 text-rural-primary" />
          </div>
          <div className="text-2xl font-bold text-rural-forest font-sans">
            {bestMarket.saleableQuantityQuintals.toFixed(1)}{' '}
            <span className="text-sm font-semibold text-rural-muted">Qtl</span>
          </div>
          <p className="text-xs text-amber-800 font-medium mt-1">
            Crop lost on way: {bestMarket.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(bestMarket.estimatedLossPercent)})
          </p>
        </div>

        {/* Card C: Transport & Market Fees */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rural-border shadow-rural-soft">
          <div className="flex items-center justify-between text-xs text-rural-muted mb-1.5 font-medium">
            <span className="uppercase tracking-wider">Transport & Market Fees</span>
            <Fuel className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-rural-forest font-sans">
            {formatINR(bestMarket.totalExpenses)}
          </div>
          <p className="text-xs text-rural-muted mt-1">
            Transport: {formatINR(bestMarket.transportationCost)} • Fees: {formatINR(bestMarket.totalMarketFees)}
          </p>
        </div>
      </div>
    </div>
  );
};
