import React, { useState } from 'react';
import { MarketCalculationResult, BreakEvenAnalysis } from '../../types/agriculture';
import { calculateBreakEven } from '../../engine/recommendations';
import { formatINR, formatPercent } from '../../utils/currency';
import { Sliders, Target, Fuel, Info } from 'lucide-react';

interface SensitivityAnalysisProps {
  bestMarket: MarketCalculationResult | null;
  feasibleMarkets: MarketCalculationResult[];
  currentFuelPrice: number;
  onFuelPriceChange: (newPrice: number) => void;
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  bestMarket,
  feasibleMarkets,
  currentFuelPrice,
  onFuelPriceChange,
}) => {
  const otherMarkets = feasibleMarkets.filter(
    (m) => bestMarket && m.market.id !== bestMarket.market.id
  );

  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(
    otherMarkets.length > 0 ? otherMarkets[0].market.id : ''
  );

  const selectedCompetitor =
    otherMarkets.find((m) => m.market.id === selectedCompetitorId) || otherMarkets[0];

  const breakEven: BreakEvenAnalysis | null =
    bestMarket && selectedCompetitor ? calculateBreakEven(bestMarket, selectedCompetitor) : null;

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-sm p-5 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-stone-100 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Sensitivity & Break-Even Decision Matrix
            </h3>
            <p className="text-xs text-stone-500">
              Determine competitor price thresholds and fuel-price sensitivity before making dispatch commitments.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          Interactive Scenario Simulator
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module A: Break-even price calculation */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-emerald-700" />
              <span>Competitor Break-Even Price</span>
            </span>
          </div>

          {!bestMarket ? (
            <p className="text-xs text-stone-500 py-4">
              No feasible recommended market available to calculate break-even comparisons.
            </p>
          ) : otherMarkets.length === 0 ? (
            <div className="bg-white rounded-lg p-3 border border-stone-200 text-xs text-stone-600">
              <strong>{bestMarket.market.name}</strong> is currently the only market capable of accepting your full consignment. No competing feasible destination exists for break-even testing.
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Select Competing Market to Test:
                </label>
                <select
                  value={selectedCompetitor.market.id}
                  onChange={(e) => setSelectedCompetitorId(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-600"
                >
                  {otherMarkets.map((m) => (
                    <option key={m.market.id} value={m.market.id}>
                      {m.market.name} ({m.market.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              {breakEven ? (
                <div className="bg-white rounded-lg p-3 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Current Net Return Deficit:</span>
                    <strong className="text-rose-600 font-bold">
                      -{formatINR(breakEven.currentNetReturnGap)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Required Additional Price:</span>
                    <strong className="text-emerald-700 font-bold text-sm">
                      +{formatINR(breakEven.requiredPriceIncreasePerQuintal)} / Qtl
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Required Percentage Surge:</span>
                    <strong className="text-stone-800 font-bold">
                      +{formatPercent(breakEven.requiredPricePercentageIncrease)}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
                    For <strong>{breakEven.targetMarketName}</strong> to beat{' '}
                    <strong>{breakEven.bestMarketName}</strong>, its buyers would need to pay at least{' '}
                    <strong className="text-stone-800">
                      {formatINR(
                        selectedCompetitor.market.pricesPerQuintal.A +
                          breakEven.requiredPriceIncreasePerQuintal
                      )} / Qtl
                    </strong>{' '}
                    for Grade A produce.
                    <p className="mt-1 text-[10px] text-stone-400 italic">
                      * Estimated break-even price threshold for planning; not a guaranteed or confirmed market quote.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">
                  No break-even gap; competitor already equals or surpasses this return.
                </p>
              )}
            </>
          )}
        </div>

        {/* Module B: Diesel Fuel Price Stress Test */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1">
              <Fuel className="w-3.5 h-3.5 text-amber-700" />
              <span>Diesel Fuel Price Stress Test</span>
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-stone-200">
              ₹{currentFuelPrice} / Litre
            </span>
          </div>

          <p className="text-xs text-stone-500 mb-3">
            Test how diesel price swings impact distant metro wholesale routes vs local rural assembly mandis.
          </p>

          <div className="space-y-3">
            <input
              type="range"
              min="80"
              max="140"
              step="1"
              value={currentFuelPrice}
              onChange={(e) => onFuelPriceChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
              <span>₹80/L (Subsidized)</span>
              <span>₹96/L (Standard)</span>
              <span>₹120/L (Inflation)</span>
              <span>₹140/L (Extreme)</span>
            </div>

            <div className="bg-white rounded-lg p-2.5 border border-stone-200 text-xs text-stone-600 flex items-center space-x-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Higher diesel prices penalize distant wholesale hubs like{' '}
                <strong>Metro Grand Terminal (165 km)</strong> while elevating nearby mandis.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
