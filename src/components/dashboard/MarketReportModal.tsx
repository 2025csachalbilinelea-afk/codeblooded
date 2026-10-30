import React from 'react';
import {
  FarmerInputs,
  CropProfile,
  MarketCalculationResult,
  SplitHarvestResult,
  ComparisonAnalysis,
} from '../../types/agriculture';
import { MarketRankingResult } from '../../engine/ranking';
import { formatINR, formatPercent } from '../../utils/currency';
import {
  Printer,
  X,
  Route,
  Building2,
  Scale,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface MarketReportModalProps {
  inputs: FarmerInputs;
  crop: CropProfile;
  totalQuintals: number;
  ranking: MarketRankingResult;
  splitResult: SplitHarvestResult | null;
  comparison: ComparisonAnalysis | null;
  onClose: () => void;
}

export const MarketReportModal: React.FC<MarketReportModalProps> = ({
  inputs,
  crop,
  totalQuintals,
  ranking,
  splitResult,
  comparison,
  onClose,
}) => {
  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const bestSingle = ranking.bestMarket;
  const isSplitRecommended = splitResult?.recommendedStrategy === 'split';

  const expectedPrice =
    inputs.expectedPricePerQuintal ||
    Math.round(
      (crop.typicalMarketPriceRange.min + crop.typicalMarketPriceRange.max) / 2
    );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none">
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="bg-stone-900 text-stone-100 p-4 sm:px-6 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Market Selling Plan
              </h2>
              <p className="text-xs text-stone-400">
                Printed summary of where your crop earns the most money after travel and market costs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 text-stone-800 text-xs font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-stone-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white print:border print:border-stone-800">
                  <Route className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-stone-900 font-sans">
                    HARVESTROUTE
                  </h1>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Smart Agricultural Market Selection & Net Return Optimizer
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-[11px] text-stone-500">
                <div>
                  Report Generated: <strong className="text-stone-800">{currentDate}</strong>
                </div>
                <div>
                  Farm Location: <strong className="text-stone-800">{inputs.originLocation}</strong>
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  Doc ID: HR-{inputs.cropId.toUpperCase()}-{Date.now().toString().slice(-6)}
                </div>
              </div>
            </div>

            {/* Simulated Data Notice */}
            <div className="mt-3 p-2 bg-amber-50 border border-amber-300 rounded-lg text-[10px] text-amber-900 flex items-center space-x-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                <strong>Sample Prices — Check Before Selling:</strong> All regional market prices, fees, and quota limits presented in this report are demonstration sample data to help compare market options.
              </span>
            </div>
          </div>

          {/* Section 1: Your Crop & Transport Details */}
          <div>
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-1 mb-2.5 flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>1. Your Crop & Transport Details</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>
                <span className="text-[10px] text-stone-500 block">Crop Selected</span>
                <strong className="text-stone-900 text-sm">{crop.name}</strong>
                <span className="text-[10px] text-stone-500 block capitalize">{crop.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Total Harvest Quantity</span>
                <strong className="text-stone-900 text-sm">{totalQuintals.toFixed(1)} Quintals</strong>
                <span className="text-[10px] text-stone-500 block">{(totalQuintals * 100).toLocaleString('en-IN')} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Expected Selling Price</span>
                <strong className="text-stone-900 text-sm">
                  {formatINR(expectedPrice)} / Qtl
                </strong>
                <span className="text-[10px] text-stone-500 block">
                  Typical: {formatINR(crop.typicalMarketPriceRange.min)} - {formatINR(crop.typicalMarketPriceRange.max)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Transport Option</span>
                <strong className="text-stone-900 text-sm">
                  {inputs.transport.type === 'own' ? 'My Own Vehicle' : 'Rented Vehicle'}
                </strong>
                <span className="text-[10px] text-stone-500 block">
                  Capacity:{' '}
                  {inputs.transport.type === 'own'
                    ? inputs.transport.ownVehicle.capacityQuintals
                    : inputs.transport.rentedVehicle.capacityQuintals}{' '}
                  Qtl
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-stone-600 bg-warmbg-50 p-2.5 rounded-lg border border-stone-200/80 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong>Transport Details:</strong>{' '}
                {inputs.transport.type === 'own'
                  ? `Own vehicle, mileage ${inputs.transport.ownVehicle.mileageKmPerLitre} km/L, fuel ₹${inputs.transport.ownVehicle.fuelPricePerLitre}/L, driver ₹${inputs.transport.ownVehicle.driverCostPerTrip}/trip`
                  : `Rented vehicle at ₹${inputs.transport.rentedVehicle.rentalRatePerKm || 35}/km (all-inclusive round-trip rate)`}
              </span>
              <span>
                <strong>Crop Lost on Way:</strong>{' '}
                {inputs.spoilage.mode === 'automatic'
                  ? 'Automatic Environmental Model'
                  : `Manual (${inputs.spoilage.manualPercentage}%)`}
              </span>
            </div>
          </div>

          {/* Section 2: Best Selling Plan */}
          <div>
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-1 mb-2.5 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>2. Best Selling Plan</span>
            </h3>

            <div className={`p-3.5 rounded-xl border ${
              isSplitRecommended
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : bestSingle
                ? 'bg-blue-50 border-blue-300 text-blue-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">
                  Recommended Selling Choice:{' '}
                  {isSplitRecommended
                    ? 'SPLIT HARVEST (Divide harvest between two markets)'
                    : bestSingle
                    ? `SELL ALL AT SINGLE MARKET (${bestSingle.market.name})`
                    : 'NO MARKET FOUND THAT CAN BUY YOUR FULL CROP'}
                </span>
                {splitResult && splitResult.isSplitAdvantageous && (
                  <span className="font-bold text-xs bg-emerald-700 text-white px-2 py-0.5 rounded">
                    +₹{splitResult.netGainFromSplitting.toLocaleString('en-IN')} Extra Profit
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {splitResult ? splitResult.explanation : comparison?.dynamicExplanation}
              </p>
            </div>
          </div>

          {/* Section 3: Plan for Selling at More Than One Market (If Split is Feasible) */}
          {splitResult && splitResult.hasFeasibleSplit && splitResult.allocations.length > 0 && (
            <div>
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-1 mb-2.5 flex items-center space-x-1.5">
                <Route className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Plan for Selling at More Than One Market</span>
              </h3>

              <div className="rounded-lg border border-stone-300 overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-stone-100 border-b border-stone-300 font-bold text-stone-700">
                    <tr>
                      <th className="p-2">Market</th>
                      <th className="p-2">Amount Sent</th>
                      <th className="p-2">Crop Lost on Way</th>
                      <th className="p-2">Crop Left to Sell</th>
                      <th className="p-2">Total Selling Money</th>
                      <th className="p-2">Transport Cost</th>
                      <th className="p-2">Market Charges</th>
                      <th className="p-2 text-right">Money You Keep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-medium">
                    {splitResult.allocations.map((alloc, idx) => (
                      <tr key={alloc.market.id}>
                        <td className="p-2">
                          <strong className="text-stone-900">
                            Market #{idx + 1}: {alloc.market.name}
                          </strong>
                          <div className="text-[10px] text-stone-500">
                            {alloc.market.locationName} ({alloc.market.distanceKm} km away)
                          </div>
                        </td>
                        <td className="p-2 font-bold">{alloc.allocatedQuintals.toFixed(1)} Qtl</td>
                        <td className="p-2 text-amber-800">
                          -{alloc.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(alloc.lossPercent)})
                        </td>
                        <td className="p-2 text-emerald-800 font-semibold">{alloc.saleableQuintals.toFixed(1)} Qtl</td>
                        <td className="p-2">{formatINR(alloc.grossRevenue)}</td>
                        <td className="p-2 text-rose-700">
                          -{formatINR(alloc.transportCost)} ({alloc.transportTrips} trips)
                        </td>
                        <td className="p-2 text-rose-700">-{formatINR(alloc.marketFees)}</td>
                        <td className="p-2 text-right font-bold text-emerald-900">
                          {formatINR(alloc.netReturn)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-stone-100 font-bold border-t-2 border-stone-400 text-stone-900">
                      <td className="p-2 uppercase text-[10px]">TOTAL FOR BOTH MARKETS</td>
                      <td className="p-2">{splitResult.planTotals.totalAllocatedQuintals.toFixed(1)} Qtl</td>
                      <td className="p-2 text-amber-800">-{splitResult.planTotals.totalLossQuintals.toFixed(1)} Qtl</td>
                      <td className="p-2 text-emerald-900">{splitResult.planTotals.totalSaleableQuintals.toFixed(1)} Qtl</td>
                      <td className="p-2">{formatINR(splitResult.planTotals.totalGrossRevenue)}</td>
                      <td className="p-2 text-rose-700">-{formatINR(splitResult.planTotals.totalTransportCost)}</td>
                      <td className="p-2 text-rose-700">-{formatINR(splitResult.planTotals.totalMarketFees)}</td>
                      <td className="p-2 text-right text-emerald-900 text-xs">
                        {formatINR(splitResult.planTotals.totalNetReturn)}
                        <span className="block text-[10px] font-normal text-stone-600">
                          ({formatINR(splitResult.planTotals.netReturnPerQuintal)}/Qtl)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Markets That Can Buy Your Full Crop */}
          <div>
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-1 mb-2.5 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>4. Markets That Can Buy Your Full Crop</span>
            </h3>

            {ranking.feasibleMarkets.length > 0 ? (
              <div className="rounded-lg border border-stone-300 overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-stone-100 border-b border-stone-300 font-bold text-stone-700">
                    <tr>
                      <th className="p-2">Rank & Market</th>
                      <th className="p-2">Distance</th>
                      <th className="p-2">Offered Price</th>
                      <th className="p-2">Crop Left to Sell</th>
                      <th className="p-2">Total Selling Money</th>
                      <th className="p-2">Transport Cost</th>
                      <th className="p-2">Market Charges</th>
                      <th className="p-2 text-right">Money You Keep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {ranking.feasibleMarkets.map((res: MarketCalculationResult, i: number) => (
                      <tr key={res.market.id} className={i === 0 ? 'bg-emerald-50/40 font-semibold' : ''}>
                        <td className="p-2">
                          #{i + 1} {res.market.name} {i === 0 && <span className="text-[9px] bg-emerald-700 text-white px-1 py-0.2 rounded uppercase">Best</span>}
                        </td>
                        <td className="p-2">{res.market.distanceKm} km ({res.market.estimatedTravelTimeHours}h)</td>
                        <td className="p-2">{formatINR(res.market.pricesPerQuintal.A)}/Qtl</td>
                        <td className="p-2">{res.saleableQuantityQuintals.toFixed(1)} Qtl</td>
                        <td className="p-2">{formatINR(res.grossRevenue)}</td>
                        <td className="p-2 text-rose-700">-{formatINR(res.transportationCost)}</td>
                        <td className="p-2 text-rose-700">-{formatINR(res.totalMarketFees)}</td>
                        <td className="p-2 text-right font-bold text-emerald-900">
                          {formatINR(res.netReturn)}
                          <span className="block text-[10px] font-normal text-stone-500">
                            {formatINR(res.netReturnPerQuintal)}/Qtl
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-rose-700 bg-rose-50 p-2.5 rounded border border-rose-200">
                No single market can buy your complete harvest of {totalQuintals.toFixed(1)} Quintals due to market buying limits.
              </p>
            )}
          </div>

          {/* Section 5: Markets That Cannot Buy Your Full Crop */}
          {ranking.infeasibleMarkets.length > 0 && (
            <div>
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs border-b border-stone-200 pb-1 mb-2 flex items-center space-x-1.5 text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>5. Markets That Cannot Buy Your Full Crop</span>
              </h3>
              <div className="space-y-1.5">
                {ranking.infeasibleMarkets.map((inf: MarketCalculationResult) => (
                  <div key={inf.market.id} className="p-2 rounded bg-stone-50 border border-stone-200 flex justify-between items-center text-[11px]">
                    <div>
                      <strong className="text-stone-900">{inf.market.name}</strong> ({inf.market.distanceKm} km)
                      <span className="text-rose-700 ml-2 font-medium">↳ {inf.feasibilityReasons.join('; ')}</span>
                    </div>
                    <span className="text-stone-500 text-[10px]">Maximum Limit: {inf.market.maxCapacityQuintals} Qtl</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Notes */}
          <div className="pt-3 border-t border-stone-300 text-[10px] text-stone-500 space-y-1 leading-relaxed">
            <div>
              <strong>Note on Multiple Markets:</strong> We only recommend splitting between two markets if it gives you at least ₹250 more in your pocket, to make the extra travel effort worthwhile.
            </div>
            <div className="pt-1 text-stone-400 italic">
              HarvestRoute • Smart Agricultural Market Selection & Net Return Optimizer • Helping farmers keep more money.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
