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
  Building2,
  Scale,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Route,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-rural-deep/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-4xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none">
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="bg-rural-forest text-white p-4 sm:px-6 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white leading-tight">
                Market Selling Plan & Dispatch Report
              </h2>
              <p className="text-xs text-rural-mint/80">
                Printable summary of where your crop earns the most money after travel and market costs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rural-fresh hover:bg-rural-fresh/90 text-white shadow transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rural-deep text-white/80 hover:text-white hover:bg-black/30 transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 text-rural-charcoal text-xs font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-rural-forest pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <BrandLogo variant="dark" size="lg" showTagline={true} />

              <div className="text-left sm:text-right text-[11px] text-rural-muted">
                <div>
                  Report Generated: <strong className="text-rural-forest font-semibold">{currentDate}</strong>
                </div>
                <div>
                  Farm Gate Origin: <strong className="text-rural-forest font-semibold">{inputs.originLocation}</strong>
                </div>
                <div className="text-[10px] text-rural-muted font-mono mt-0.5">
                  Ref ID: HR-{inputs.cropId.toUpperCase()}-{Date.now().toString().slice(-6)}
                </div>
              </div>
            </div>

            {/* Verified Data Notice */}
            <div className="mt-3.5 p-2.5 bg-rural-sage/60 border border-rural-border rounded-xl text-[10px] text-rural-charcoal flex items-center space-x-2 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-rural-primary shrink-0" />
              <span>
                <strong>Verified Market Data:</strong> All mandi prices, road routes, and APMC statutory fee rates in this report are retrieved from verified agricultural data sources (AGMARKNET, e-NAM, and official market bulletins).
              </span>
            </div>
          </div>

          {/* Section 1: Your Crop & Transport Details */}
          <div>
            <h3 className="font-serif font-bold text-rural-forest text-sm border-b border-rural-border pb-1.5 mb-3 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-rural-primary" />
              <span>1. Your Crop & Transport Details</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-rural-cream p-4 rounded-2xl border border-rural-border">
              <div>
                <span className="text-[10px] text-rural-muted block">Crop Selected</span>
                <strong className="text-rural-forest text-sm font-serif">{crop.name}</strong>
                <span className="text-[10px] text-rural-muted block capitalize">{crop.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-rural-muted block">Total Harvest Quantity</span>
                <strong className="text-rural-forest text-sm">{totalQuintals.toFixed(1)} Quintals</strong>
                <span className="text-[10px] text-rural-muted block">{(totalQuintals * 100).toLocaleString('en-IN')} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-rural-muted block">Top Mandi Quoted Price</span>
                <strong className="text-rural-forest text-sm">
                  {bestSingle ? `${formatINR(bestSingle.averagePricePerQuintalSold)} / Qtl` : 'Unquoted'}
                </strong>
                <span className="text-[10px] text-rural-muted block">
                  {bestSingle ? bestSingle.market.name : 'No verified quote'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rural-muted block">Transport Option</span>
                <strong className="text-rural-forest text-sm">
                  {inputs.transport.type === 'own' ? 'My Own Vehicle' : 'Rented Vehicle'}
                </strong>
                <span className="text-[10px] text-rural-muted block">
                  Capacity:{' '}
                  {inputs.transport.type === 'own'
                    ? inputs.transport.ownVehicle.capacityQuintals
                    : inputs.transport.rentedVehicle.capacityQuintals}{' '}
                  Qtl
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-rural-muted bg-rural-sage/50 p-2.5 rounded-xl border border-rural-border flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong>Transport Details:</strong>{' '}
                {inputs.transport.type === 'own'
                  ? `Own vehicle, mileage ${inputs.transport.ownVehicle.mileageKmPerLitre} km/L, fuel ₹${inputs.transport.ownVehicle.fuelPricePerLitre}/L, driver ₹${inputs.transport.ownVehicle.driverCostPerTrip}/trip`
                  : `Rented vehicle at ₹${inputs.transport.rentedVehicle.rentalRatePerKm || 35}/km (includes vehicle, driver, fuel, and tolls)`}
              </span>
              <span>
                <strong>Produce Loss Model:</strong>{' '}
                {inputs.spoilage.mode === 'automatic'
                  ? 'Automatic Environmental Loss Model'
                  : `Manual Loss (${inputs.spoilage.manualPercentage}%)`}
              </span>
            </div>
          </div>

          {/* Section 2: Best Selling Plan */}
          <div>
            <h3 className="font-serif font-bold text-rural-forest text-sm border-b border-rural-border pb-1.5 mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rural-primary" />
              <span>2. Best Selling Plan</span>
            </h3>

            <div className={`p-4 rounded-2xl border ${
              isSplitRecommended
                ? 'bg-rural-sage/80 border-rural-fresh/60 text-rural-forest'
                : bestSingle
                ? 'bg-rural-mint/40 border-rural-fresh/40 text-rural-forest'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-sm">
                  Recommended Selling Choice:{' '}
                  {isSplitRecommended
                    ? 'SPLIT HARVEST (Divide harvest between two markets)'
                    : bestSingle
                    ? `SELL ALL AT SINGLE MARKET (${bestSingle.market.name})`
                    : 'NO MARKET FOUND THAT CAN BUY YOUR FULL CROP'}
                </span>
                {splitResult && splitResult.isSplitAdvantageous && (
                  <span className="font-bold text-xs bg-rural-forest text-white px-2.5 py-0.5 rounded-full">
                    +₹{splitResult.netGainFromSplitting.toLocaleString('en-IN')} Extra Profit
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed mt-1">
                {splitResult ? splitResult.explanation : comparison?.dynamicExplanation}
              </p>
            </div>
          </div>

          {/* Section 3: Plan for Selling at More Than One Market (If Split is Feasible) */}
          {splitResult && splitResult.hasFeasibleSplit && splitResult.allocations.length > 0 && (
            <div>
              <h3 className="font-serif font-bold text-rural-forest text-sm border-b border-rural-border pb-1.5 mb-3 flex items-center space-x-2">
                <Route className="w-4 h-4 text-rural-primary" />
                <span>3. Plan for Selling at More Than One Market</span>
              </h3>

              <div className="rounded-2xl border border-rural-border overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-rural-sage/70 border-b border-rural-border font-bold text-rural-forest">
                    <tr>
                      <th className="p-2.5">Market</th>
                      <th className="p-2.5">Quantity Sent</th>
                      <th className="p-2.5">Crop Lost on Way</th>
                      <th className="p-2.5">Available to Sell</th>
                      <th className="p-2.5">Expected Sales</th>
                      <th className="p-2.5">Transport Cost</th>
                      <th className="p-2.5">Market Fees</th>
                      <th className="p-2.5 text-right">Money You Keep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rural-border font-medium">
                    {splitResult.allocations.map((alloc, idx) => (
                      <tr key={alloc.market.id}>
                        <td className="p-2.5">
                          <strong className="text-rural-forest font-serif">
                            Market #{idx + 1}: {alloc.market.name}
                          </strong>
                          <div className="text-[10px] text-rural-muted">
                            {alloc.market.locationName} ({alloc.market.distanceKm} km away)
                          </div>
                        </td>
                        <td className="p-2.5 font-bold text-rural-forest">{alloc.allocatedQuintals.toFixed(1)} Qtl</td>
                        <td className="p-2.5 text-amber-800">
                          -{alloc.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(alloc.lossPercent)})
                        </td>
                        <td className="p-2.5 text-rural-primary font-semibold">{alloc.saleableQuintals.toFixed(1)} Qtl</td>
                        <td className="p-2.5">{formatINR(alloc.grossRevenue)}</td>
                        <td className="p-2.5 text-rose-700">
                          -{formatINR(alloc.transportCost)} ({alloc.transportTrips} trips)
                        </td>
                        <td className="p-2.5 text-rose-700">-{formatINR(alloc.marketFees)}</td>
                        <td className="p-2.5 text-right font-bold text-rural-forest">
                          {formatINR(alloc.netReturn)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-rural-sage/60 font-bold border-t-2 border-rural-border text-rural-forest">
                      <td className="p-2.5 uppercase text-[10px]">TOTAL FOR BOTH MARKETS</td>
                      <td className="p-2.5">{splitResult.planTotals.totalAllocatedQuintals.toFixed(1)} Qtl</td>
                      <td className="p-2.5 text-amber-800">-{splitResult.planTotals.totalLossQuintals.toFixed(1)} Qtl</td>
                      <td className="p-2.5 text-rural-forest">{splitResult.planTotals.totalSaleableQuintals.toFixed(1)} Qtl</td>
                      <td className="p-2.5">{formatINR(splitResult.planTotals.totalGrossRevenue)}</td>
                      <td className="p-2.5 text-rose-700">-{formatINR(splitResult.planTotals.totalTransportCost)}</td>
                      <td className="p-2.5 text-rose-700">-{formatINR(splitResult.planTotals.totalMarketFees)}</td>
                      <td className="p-2.5 text-right text-rural-forest text-xs font-black">
                        {formatINR(splitResult.planTotals.totalNetReturn)}
                        <span className="block text-[10px] font-normal text-rural-muted">
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
            <h3 className="font-serif font-bold text-rural-forest text-sm border-b border-rural-border pb-1.5 mb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-rural-primary" />
              <span>4. Markets That Can Buy Your Full Crop</span>
            </h3>

            {ranking.feasibleMarkets.length > 0 ? (
              <div className="rounded-2xl border border-rural-border overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-rural-sage/70 border-b border-rural-border font-bold text-rural-forest">
                    <tr>
                      <th className="p-2.5">Rank & Market</th>
                      <th className="p-2.5">Distance</th>
                      <th className="p-2.5">Offered Price</th>
                      <th className="p-2.5">Quantity to Sell</th>
                      <th className="p-2.5">Expected Sales</th>
                      <th className="p-2.5">Transport Cost</th>
                      <th className="p-2.5">Market Fees</th>
                      <th className="p-2.5 text-right">Money You Keep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rural-border">
                    {ranking.feasibleMarkets.map((res: MarketCalculationResult, i: number) => (
                      <tr key={res.market.id} className={i === 0 ? 'bg-rural-mint/30 font-semibold' : ''}>
                        <td className="p-2.5">
                          <div className="font-bold text-rural-forest">
                            #{i + 1} {res.market.name} {i === 0 && <span className="text-[9px] bg-rural-primary text-white px-1.5 py-0.5 rounded-full uppercase ml-1 font-sans">Best</span>}
                          </div>
                          {res.market.description && (
                            <div className="text-[9px] text-rural-muted max-w-xs mt-0.5 leading-tight">
                              {res.market.description}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5">{res.market.distanceKm} km ({res.market.estimatedTravelTimeHours}h)</td>
                        <td className="p-2.5">{formatINR(res.market.pricesPerQuintal.A)}/Qtl</td>
                        <td className="p-2.5">{res.saleableQuantityQuintals.toFixed(1)} Qtl</td>
                        <td className="p-2.5">{formatINR(res.grossRevenue)}</td>
                        <td className="p-2.5 text-rose-700">-{formatINR(res.transportationCost)}</td>
                        <td className="p-2.5 text-rose-700">-{formatINR(res.totalMarketFees)}</td>
                        <td className="p-2.5 text-right font-black text-rural-forest">
                          {formatINR(res.netReturn)}
                          <span className="block text-[10px] font-normal text-rural-muted">
                            {formatINR(res.netReturnPerQuintal)}/Qtl
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                No single market can buy your complete harvest of {totalQuintals.toFixed(1)} Quintals due to market purchase limits.
              </p>
            )}
          </div>

          {/* Section 5: Notes */}
          <div className="pt-3 border-t border-rural-border text-[10px] text-rural-muted space-y-1 leading-relaxed">
            <div>
              <strong>Note on Multiple Markets:</strong> We only recommend dividing harvest between two destinations if it yields at least ₹250 more in your pocket to ensure the extra travel effort is worthwhile.
            </div>
            <div className="pt-1 text-rural-muted/80 italic">
              HarvestRoute • Smart Agricultural Market Selection & Net Return Optimizer • Helping farmers keep more money.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
