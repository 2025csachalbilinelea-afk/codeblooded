import React, { useState } from 'react';
import { SplitHarvestResult, MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import {
  Split,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Building2,
  Truck,
  Ban,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SplitHarvestSectionProps {
  splitResult: SplitHarvestResult | null;
  onInspectMarket?: (marketResult: MarketCalculationResult) => void;
}

export const SplitHarvestSection: React.FC<SplitHarvestSectionProps> = ({
  splitResult,
}) => {
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showRejected, setShowRejected] = useState(false);

  if (!splitResult) return null;

  const {
    recommendedStrategy,
    baselineSingleMarket,
    allocations,
    planTotals,
    baselineTotals,
    netGainFromSplitting,
    netGainPerQuintal,
    isSplitAdvantageous,
    hasFeasibleSplit,
    explanation,
    strategyRationale,
    rejectedPlans,
    searchMetadata,
  } = splitResult;

  const isSplitRecommended = recommendedStrategy === 'split';
  const isSingleRecommended = recommendedStrategy === 'single';
  const isNoneFeasible = recommendedStrategy === 'none';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 mt-6 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isSplitRecommended
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Compare Selling at One or More Markets
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Split Option
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              See if dividing your harvest between two markets earns more money than selling everything at one market.
            </p>
          </div>
        </div>

        {/* Recommended Strategy Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {isSplitRecommended ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>We Recommend: Split Harvest</span>
            </span>
          ) : isSingleRecommended ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-800 text-white shadow-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>We Recommend: Single Market</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-800 text-white shadow-sm">
              <Ban className="w-4 h-4" />
              <span>No Feasible Selling Plan</span>
            </span>
          )}
        </div>
      </div>

      {/* Strategy Comparison Summary Banner */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Best Single Market */}
        <div className={`p-4 rounded-xl border ${
          isSingleRecommended
            ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Best Single Market</span>
            </span>
            {isSingleRecommended && (
              <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.2 rounded">
                Recommended
              </span>
            )}
          </div>
          <div className="text-base font-bold text-stone-900 truncate">
            {baselineSingleMarket ? baselineSingleMarket.market.name : 'No Market Can Buy All'}
          </div>
          <div className="text-xl font-bold text-stone-900 mt-1">
            {baselineTotals ? formatINR(baselineTotals.totalNetReturn) : '—'}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {baselineTotals ? `${formatINR(baselineTotals.netReturnPerQuintal)} / Qtl money kept` : 'Exceeds market buying limit'}
          </p>
        </div>

        {/* Card 2: Best Split Harvest Plan */}
        <div className={`p-4 rounded-xl border ${
          isSplitRecommended
            ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1">
              <Split className="w-3.5 h-3.5 text-emerald-700" />
              <span>Best Split Plan</span>
            </span>
            {isSplitRecommended && (
              <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.2 rounded">
                Recommended (+Extra Money)
              </span>
            )}
          </div>
          <div className="text-base font-bold text-stone-900 truncate">
            {hasFeasibleSplit
              ? `${allocations.length} Markets (${allocations.map((a) => a.market.name.split(' ')[0]).join(' + ')})`
              : 'No Feasible Split Plan'}
          </div>
          <div className={`text-xl font-bold mt-1 ${isSplitRecommended ? 'text-emerald-900' : 'text-stone-900'}`}>
            {hasFeasibleSplit ? formatINR(planTotals.totalNetReturn) : '—'}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {hasFeasibleSplit ? `${formatINR(planTotals.netReturnPerQuintal)} / Qtl money kept` : 'Cannot meet market requirements'}
          </p>
        </div>

        {/* Card 3: Incremental Difference & Decision */}
        <div className={`p-4 rounded-xl border ${
          isSplitAdvantageous
            ? 'bg-emerald-900 text-white border-emerald-800'
            : isSingleRecommended
            ? 'bg-stone-800 text-stone-100 border-stone-700'
            : 'bg-rose-900 text-white border-rose-800'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center space-x-1">
              {isSplitAdvantageous ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Extra Money from Splitting</span>
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {isNoneFeasible
              ? 'Not Possible'
              : !baselineSingleMarket && hasFeasibleSplit
              ? 'Only Working Option'
              : netGainFromSplitting >= 0
              ? `+${formatINR(netGainFromSplitting)}`
              : `-${formatINR(Math.abs(netGainFromSplitting))}`}
          </div>
          <p className="text-xs text-stone-300 mt-0.5">
            {isSplitAdvantageous
              ? `+${formatINR(netGainPerQuintal)}/Qtl extra money by splitting`
              : isSingleRecommended
              ? `Selling at one market saves ${formatINR(Math.abs(netGainFromSplitting))} in extra travel costs`
              : 'No valid plan found'}
          </p>
        </div>
      </div>

      {/* Why We Recommend This Market */}
      <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed mb-4 ${
        isSplitRecommended
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : isSingleRecommended
          ? 'bg-stone-50 border-stone-200 text-stone-800'
          : 'bg-rose-50 border-rose-200 text-rose-950'
      }`}>
        <div className="font-semibold text-xs uppercase tracking-wider mb-1 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Why We Recommend This Market</span>
        </div>
        <p className="font-normal">{explanation}</p>
        <p className="text-xs text-stone-500 mt-1.5 font-medium">{strategyRationale}</p>
      </div>

      {/* Allocation Table (when a feasible split plan exists) */}
      {hasFeasibleSplit && allocations.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 mb-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Market</th>
                <th className="py-2.5 px-3">Amount Sent</th>
                <th className="py-2.5 px-3">Crop Lost on Way</th>
                <th className="py-2.5 px-3">Crop Available to Sell</th>
                <th className="py-2.5 px-3">Total Selling Money</th>
                <th className="py-2.5 px-3">Transport Cost</th>
                <th className="py-2.5 px-3">Market Charges</th>
                <th className="py-2.5 px-4 text-right">Money You Keep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {allocations.map((alloc, idx) => (
                <tr key={alloc.market.id} className="hover:bg-warmbg-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900">
                      Market #{idx + 1}: {alloc.market.name}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {alloc.market.locationName} • {alloc.market.distanceKm} km away
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-stone-800 whitespace-nowrap">
                    {alloc.allocatedQuintals.toFixed(1)} Qtl
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-amber-800 font-semibold">
                      -{alloc.physicalLossQuintals.toFixed(1)} Qtl
                    </span>{' '}
                    <span className="text-[10px] text-stone-400">({formatPercent(alloc.lossPercent)})</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-800 whitespace-nowrap">
                    {alloc.saleableQuintals.toFixed(1)} Qtl
                  </td>
                  <td className="py-3 px-3 text-stone-800 whitespace-nowrap">
                    {formatINR(alloc.grossRevenue)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-rose-700 font-semibold">
                      -{formatINR(alloc.transportCost)}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {alloc.transportTrips} {alloc.transportTrips === 1 ? 'Trip' : 'Trips'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-rose-700 whitespace-nowrap">
                    -{formatINR(alloc.marketFees)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <strong className="text-sm font-bold text-emerald-900">
                      {formatINR(alloc.netReturn)}
                    </strong>
                    <span className="text-[10px] text-stone-500 block">
                      {formatINR(alloc.netReturnPerQuintal)} / Qtl
                    </span>
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-stone-100/80 font-bold border-t-2 border-stone-300 text-stone-900">
                <td className="py-3 px-3 uppercase text-[11px] tracking-wider text-stone-700">
                  Total for Both Markets
                </td>
                <td className="py-3 px-3 text-emerald-900">
                  {planTotals.totalAllocatedQuintals.toFixed(1)} Qtl
                </td>
                <td className="py-3 px-3 text-amber-800">
                  -{planTotals.totalLossQuintals.toFixed(1)} Qtl
                </td>
                <td className="py-3 px-3 text-emerald-900">
                  {planTotals.totalSaleableQuintals.toFixed(1)} Qtl
                </td>
                <td className="py-3 px-3">
                  {formatINR(planTotals.totalGrossRevenue)}
                </td>
                <td className="py-3 px-3 text-rose-700">
                  -{formatINR(planTotals.totalTransportCost)}
                </td>
                <td className="py-3 px-3 text-rose-700">
                  -{formatINR(planTotals.totalMarketFees)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-base font-bold text-emerald-900">
                    {formatINR(planTotals.totalNetReturn)}
                  </span>
                  <span className="text-[10px] text-stone-600 block font-normal">
                    {formatINR(planTotals.netReturnPerQuintal)} / Qtl Money Kept
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Accordions for Assumptions & Infeasible Alternatives */}
      <div className="space-y-2 text-xs">
        {/* Toggle 1: Transport & Cost Assumptions */}
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-stone-700 font-semibold transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-stone-500" />
              <span>How We Calculate Travel Costs for Multiple Routes</span>
            </span>
            {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAssumptions && (
            <div className="p-3.5 bg-white space-y-1.5 text-stone-600 border-t border-stone-200 text-[11px] leading-relaxed">
              <ul className="list-disc list-inside space-y-1">
                {searchMetadata.assumptions.map((asm, i) => (
                  <li key={i}>{asm}</li>
                ))}
              </ul>
              {searchMetadata.searchLimitationNotice && (
                <p className="mt-2 text-stone-500 italic pt-2 border-t border-stone-100">
                  {searchMetadata.searchLimitationNotice}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Toggle 2: Rejected Infeasible Splits */}
        {rejectedPlans.length > 0 && (
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRejected(!showRejected)}
              className="w-full px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-stone-700 font-semibold transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Other Selling Options That Will Not Work ({rejectedPlans.length})</span>
              </span>
              {showRejected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRejected && (
              <div className="p-3.5 bg-white space-y-2 text-stone-600 border-t border-stone-200 text-[11px]">
                {rejectedPlans.map((rej, i) => (
                  <div key={i} className="p-2 rounded bg-stone-50 border border-stone-200">
                    <div className="font-semibold text-stone-800">
                      Route Tried: {rej.marketNames.join(' + ')}
                    </div>
                    <div className="text-stone-500 text-[10px] mt-0.5">
                      Amounts Sent: {rej.proposedAllocations.map((q) => `${q.toFixed(1)} Qtl`).join(' / ')}
                    </div>
                    <div className="text-rose-700 mt-1 font-medium">
                      Why It Will Not Work: {rej.rejectionReason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
