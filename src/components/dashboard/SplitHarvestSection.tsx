import React, { useState } from 'react';
import { SplitHarvestResult, MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import {
  Split,
  Trophy,
  CheckCircle2,
  AlertCircle,
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

  if (!splitResult) {
    return (
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7 overflow-hidden">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rural-sage text-rural-forest flex items-center justify-center shadow-sm">
            <Split className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-rural-forest">
              Should You Sell at One Market or More Than One?
            </h2>
            <p className="text-xs sm:text-sm text-rural-muted mt-0.5 font-sans">
              Compare selling all produce at a single destination versus dividing your harvest between two markets.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Not enough verified market data to calculate a split-harvest plan.</span>
        </div>
      </div>
    );
  }

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
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-rural-border/70 gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
              isSplitRecommended
                ? 'bg-rural-mint text-rural-primary'
                : 'bg-rural-sage text-rural-forest'
            }`}
          >
            <Split className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-rural-forest">
                Should You Sell at One Market or More Than One?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-rural-muted mt-0.5 font-sans">
              Compare selling all produce at a single destination versus dividing your harvest between two markets.
            </p>
          </div>
        </div>

        {/* Recommended Strategy Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
          {isSplitRecommended ? (
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rural-forest text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-rural-fresh" />
              <span>Recommended: Split Harvest</span>
            </span>
          ) : isSingleRecommended ? (
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rural-sage text-rural-forest border border-rural-border shadow-sm">
              <Trophy className="w-4 h-4 text-rural-primary" />
              <span>Recommended: Single Market</span>
            </span>
          ) : explanation.includes('Not enough verified market data') ? (
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-sm">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>Not Enough Verified Market Data</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">
              <Ban className="w-4 h-4" />
              <span>No Feasible Plan Available</span>
            </span>
          )}
        </div>
      </div>

      {/* 3 Strategy Comparison Cards */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Best Single Market */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isSingleRecommended
              ? 'bg-rural-sage/80 border-rural-fresh/60 ring-1 ring-rural-fresh/40'
              : 'bg-rural-cream/60 border-rural-border'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rural-muted flex items-center space-x-1 font-sans">
              <Building2 className="w-3.5 h-3.5 text-rural-primary" />
              <span>Single-Market Plan</span>
            </span>
            {isSingleRecommended && (
              <span className="text-[10px] bg-rural-forest text-white font-bold px-2 py-0.5 rounded-full">
                Optimal
              </span>
            )}
          </div>
          <div className="text-base font-serif font-bold text-rural-forest truncate">
            {baselineSingleMarket ? baselineSingleMarket.market.name : 'No Single Market Feasible'}
          </div>
          <div className="text-2xl font-black text-rural-forest mt-1 font-sans">
            {baselineTotals ? formatINR(baselineTotals.totalNetReturn) : '—'}
          </div>
          <p className="text-xs text-rural-muted mt-1 font-sans">
            {baselineTotals ? `${formatINR(baselineTotals.netReturnPerQuintal)} / Qtl money kept` : 'Exceeds market purchase limit'}
          </p>
        </div>

        {/* Card 2: Split Harvest Plan */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isSplitRecommended
              ? 'bg-rural-sage/80 border-rural-fresh/60 ring-1 ring-rural-fresh/40'
              : 'bg-rural-cream/60 border-rural-border'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rural-muted flex items-center space-x-1 font-sans">
              <Split className="w-3.5 h-3.5 text-rural-primary" />
              <span>Split-Harvest Plan</span>
            </span>
            {isSplitRecommended && (
              <span className="text-[10px] bg-rural-forest text-white font-bold px-2 py-0.5 rounded-full">
                Optimal (+Profit)
              </span>
            )}
          </div>
          <div className="text-base font-serif font-bold text-rural-forest truncate">
            {hasFeasibleSplit
              ? `${allocations.length} Markets (${allocations.map((a) => a.market.name.split(' ')[0]).join(' + ')})`
              : explanation.includes('Not enough verified market data')
              ? 'Not Enough Verified Market Data'
              : 'No Feasible Split Plan'}
          </div>
          <div className={`text-2xl font-black mt-1 font-sans ${isSplitRecommended ? 'text-rural-forest' : 'text-rural-charcoal'}`}>
            {hasFeasibleSplit ? formatINR(planTotals.totalNetReturn) : '—'}
          </div>
          <p className="text-xs text-rural-muted mt-1 font-sans">
            {hasFeasibleSplit
              ? `${formatINR(planTotals.netReturnPerQuintal)} / Qtl money kept`
              : explanation.includes('Not enough verified market data')
              ? 'Requires at least 2 verified markets'
              : 'Capacity constraints unmet'}
          </p>
        </div>

        {/* Card 3: Difference / Extra Profit */}
        <div
          className={`p-5 rounded-2xl border ${
            isSplitAdvantageous
              ? 'bg-rural-forest text-white border-rural-deep shadow-rural-soft'
              : isSingleRecommended
              ? 'bg-rural-cream border-rural-border text-rural-charcoal'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1 font-sans ${
              isSplitAdvantageous ? 'text-rural-mint' : 'text-rural-muted'
            }`}>
              {isSplitAdvantageous ? (
                <TrendingUp className="w-3.5 h-3.5 text-rural-fresh" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span>Difference in Earnings</span>
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight font-sans">
            {isNoneFeasible
              ? 'Not Possible'
              : explanation.includes('Not enough verified market data')
              ? '—'
              : !baselineSingleMarket && hasFeasibleSplit
              ? 'Only Working Option'
              : netGainFromSplitting >= 0
              ? `+${formatINR(netGainFromSplitting)}`
              : `-${formatINR(Math.abs(netGainFromSplitting))}`}
          </div>
          <p className={`text-xs mt-1 font-sans ${isSplitAdvantageous ? 'text-rural-mint/80' : 'text-rural-muted'}`}>
            {isSplitAdvantageous
              ? `+${formatINR(netGainPerQuintal)}/Qtl gained by dividing harvest`
              : explanation.includes('Not enough verified market data')
              ? 'Not enough verified market data to calculate a split-harvest plan.'
              : isSingleRecommended
              ? `Single market saves ${formatINR(Math.abs(netGainFromSplitting))} in duplicate travel expenses`
              : 'No allocation possible'}
          </p>
        </div>
      </div>

      {/* Dynamic Recommendation Rationale */}
      <div className="p-4 rounded-2xl bg-rural-sage/60 border border-rural-border text-xs sm:text-sm text-rural-charcoal leading-relaxed mb-5 font-sans">
        <div className="font-semibold text-xs uppercase tracking-wider text-rural-forest mb-1.5 flex items-center space-x-1.5">
          <Info className="w-4 h-4 text-rural-primary" />
          <span>Why We Recommend This Option</span>
        </div>
        <p className="font-normal">{explanation}</p>
        <p className="text-xs text-rural-muted mt-1 font-medium">{strategyRationale}</p>
      </div>

      {/* Allocation Table (when split is feasible) */}
      {hasFeasibleSplit && allocations.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-rural-border mb-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-rural-sage/70 border-b border-rural-border text-rural-forest font-semibold uppercase tracking-wider text-[11px] font-sans">
                <th className="py-3 px-3.5">Market Destination</th>
                <th className="py-3 px-3">Quantity Sent</th>
                <th className="py-3 px-3">Produce Loss</th>
                <th className="py-3 px-3">Quantity to Sell</th>
                <th className="py-3 px-3">Expected Sales</th>
                <th className="py-3 px-3">Transport Cost</th>
                <th className="py-3 px-3">Market Fees</th>
                <th className="py-3 px-4 text-right">Money You Keep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rural-border/50 font-medium font-sans">
              {allocations.map((alloc, idx) => (
                <tr key={alloc.market.id} className="hover:bg-rural-cream/60 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-serif font-bold text-rural-forest text-sm">
                      Market #{idx + 1}: {alloc.market.name}
                    </div>
                    <div className="text-[11px] text-rural-muted">
                      {alloc.market.locationName} • {alloc.market.distanceKm} km away
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-rural-forest whitespace-nowrap">
                    {alloc.allocatedQuintals.toFixed(1)} Qtl
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-amber-800 font-semibold">
                      -{alloc.physicalLossQuintals.toFixed(1)} Qtl
                    </span>{' '}
                    <span className="text-[10px] text-rural-muted">({formatPercent(alloc.lossPercent)})</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-rural-primary whitespace-nowrap">
                    {alloc.saleableQuintals.toFixed(1)} Qtl
                  </td>
                  <td className="py-3 px-3 text-rural-charcoal whitespace-nowrap">
                    {formatINR(alloc.grossRevenue)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-rose-700 font-semibold">
                      -{formatINR(alloc.transportCost)}
                    </span>
                    <span className="text-[10px] text-rural-muted block">
                      {alloc.transportTrips} {alloc.transportTrips === 1 ? 'Trip' : 'Trips'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-rose-700 whitespace-nowrap">
                    -{formatINR(alloc.marketFees)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <strong className="text-sm font-bold text-rural-forest">
                      {formatINR(alloc.netReturn)}
                    </strong>
                    <span className="text-[10px] text-rural-muted block">
                      {formatINR(alloc.netReturnPerQuintal)} / Qtl
                    </span>
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-rural-sage/50 font-bold border-t-2 border-rural-border text-rural-forest">
                <td className="py-3 px-3.5 uppercase text-[11px] tracking-wider text-rural-forest">
                  Total for Both Markets
                </td>
                <td className="py-3 px-3 text-rural-forest">
                  {planTotals.totalAllocatedQuintals.toFixed(1)} Qtl
                </td>
                <td className="py-3 px-3 text-amber-800">
                  -{planTotals.totalLossQuintals.toFixed(1)} Qtl
                </td>
                <td className="py-3 px-3 text-rural-forest">
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
                  <span className="text-base font-black text-rural-forest">
                    {formatINR(planTotals.totalNetReturn)}
                  </span>
                  <span className="text-[10px] text-rural-muted block font-normal">
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
        <div className="border border-rural-border rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full px-4 py-3 bg-rural-cream hover:bg-rural-sage/60 flex items-center justify-between text-rural-forest font-semibold transition-colors cursor-pointer"
          >
            <span className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-rural-primary" />
              <span>How We Calculate Travel Costs for Multiple Routes</span>
            </span>
            {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAssumptions && (
            <div className="p-4 bg-white space-y-2 text-rural-charcoal border-t border-rural-border text-[11px] leading-relaxed font-sans">
              <ul className="list-disc list-inside space-y-1">
                {searchMetadata.assumptions.map((asm, i) => (
                  <li key={i}>{asm}</li>
                ))}
              </ul>
              {searchMetadata.searchLimitationNotice && (
                <p className="mt-2 text-rural-muted italic pt-2 border-t border-rural-border/50">
                  {searchMetadata.searchLimitationNotice}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Toggle 2: Rejected Infeasible Splits */}
        {rejectedPlans.length > 0 && (
          <div className="border border-rural-border rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRejected(!showRejected)}
              className="w-full px-4 py-3 bg-rural-cream hover:bg-rural-sage/60 flex items-center justify-between text-rural-forest font-semibold transition-colors cursor-pointer"
            >
              <span className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Other Selling Options That Will Not Work ({rejectedPlans.length})</span>
              </span>
              {showRejected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRejected && (
              <div className="p-4 bg-white space-y-2 text-rural-charcoal border-t border-rural-border text-[11px] font-sans">
                {rejectedPlans.map((rej, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-rural-cream border border-rural-border">
                    <div className="font-semibold text-rural-forest">
                      Route Tried: {rej.marketNames.join(' + ')}
                    </div>
                    <div className="text-rural-muted text-[10px] mt-0.5">
                      Quantities Sent: {rej.proposedAllocations.map((q) => `${q.toFixed(1)} Qtl`).join(' / ')}
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
