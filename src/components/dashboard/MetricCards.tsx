import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { Trophy, TrendingUp, PackageCheck, AlertCircle, Fuel, Building2 } from 'lucide-react';

interface MetricCardsProps {
  bestMarket: MarketCalculationResult | null;
  totalHarvestQuintals: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ bestMarket, totalHarvestQuintals }) => {
  if (!bestMarket) {
    return (
      <div className="bg-rose-50 border border-rose-300 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-rose-900">No Market Found That Can Buy Your Full Crop</h3>
        <p className="text-xs text-rose-700 max-w-lg mx-auto mt-1">
          None of the nearby markets can buy your full harvest of {totalHarvestQuintals.toFixed(1)} Quintals
          in a single trip due to market buying limits or vehicle space. Try reducing quantity or check the Split Harvest option below.
        </p>
      </div>
    );
  }

  const isNetPositive = bestMarket.netReturn >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Best Market Choice */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-80" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>Best Market Choice</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Best Option
            </span>
          </div>
          <h3 className="text-base font-bold text-stone-900 leading-tight truncate" title={bestMarket.market.name}>
            {bestMarket.market.name}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5 flex items-center space-x-1">
            <Building2 className="w-3 h-3 text-stone-400" />
            <span className="truncate">{bestMarket.market.locationName}</span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Distance: <strong>{bestMarket.market.distanceKm} km</strong></span>
            <span>Travel Time: <strong>{bestMarket.market.estimatedTravelTimeHours} hrs</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Estimated Money You Will Earn */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 ${isNetPositive ? 'bg-emerald-50' : 'bg-rose-50'} rounded-bl-full -z-0 opacity-80`} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <TrendingUp className={`w-3.5 h-3.5 ${isNetPositive ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span>Estimated Money You Will Earn</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isNetPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isNetPositive ? 'Profit' : 'Loss'}
            </span>
          </div>
          <h3 className={`text-2xl font-bold tracking-tight ${isNetPositive ? 'text-emerald-900' : 'text-rose-700'}`}>
            {formatINR(bestMarket.netReturn)}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Money You Keep per Quintal:{' '}
            <strong className={isNetPositive ? 'text-emerald-700' : 'text-rose-700'}>
              {formatINR(bestMarket.netReturnPerQuintal)} / Qtl
            </strong>
          </p>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Total Selling Money: {formatINR(bestMarket.grossRevenue)}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">After All Expenses</span>
          </div>
        </div>
      </div>

      {/* 3. Crop Available to Sell */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-stone-50 rounded-bl-full -z-0 opacity-80" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <PackageCheck className="w-3.5 h-3.5 text-stone-600" />
              <span>Crop Available to Sell</span>
            </span>
            <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-full">
              {bestMarket.capacityUtilizationPercent}% Capacity
            </span>
          </div>
          <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
            {bestMarket.saleableQuantityQuintals.toFixed(1)}{' '}
            <span className="text-sm font-semibold text-stone-500">Quintals</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Crop Lost on the Way:{' '}
            <strong className="text-amber-700">
              {bestMarket.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(bestMarket.estimatedLossPercent)})
            </strong>
          </p>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Harvest: {totalHarvestQuintals.toFixed(1)} Qtl</span>
            <span className="text-stone-400">•</span>
            <span>Left to Sell: {formatPercent(100 - bestMarket.estimatedLossPercent)}</span>
          </div>
        </div>
      </div>

      {/* 4. Transport and Market Charges */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-80" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <Fuel className="w-3.5 h-3.5 text-amber-600" />
              <span>Transport and Market Charges</span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {bestMarket.transportTrips} {bestMarket.transportTrips === 1 ? 'Trip' : 'Trips'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
            {formatINR(bestMarket.totalExpenses)}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Transport: <strong className="text-stone-700">{formatINR(bestMarket.transportationCost)}</strong> + Market Charges:{' '}
            <strong className="text-stone-700">{formatINR(bestMarket.totalMarketFees)}</strong>
          </p>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Cost per Quintal:</span>
            <strong className="text-stone-800">
              {formatINR(Math.round(bestMarket.totalExpenses / Math.max(0.1, bestMarket.initialQuantityQuintals)))} / Qtl
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
