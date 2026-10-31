import React from 'react';
import { MarketCalculationResult, SplitHarvestResult, ComparisonAnalysis } from '../../../types/agriculture';
import { MetricCards } from '../MetricCards';
import { ComparisonCard } from '../ComparisonCard';
import { SplitHarvestSection } from '../SplitHarvestSection';
import { FinancialWaterfallChart } from '../../charts/FinancialWaterfallChart';
import { MarketRankingTable } from '../../markets/MarketRankingTable';
import { formatINR } from '../../../utils/currency';
import {
  Trophy,
  ArrowRight,
  ArrowLeft,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface Step6ProfitDecisionProps {
  bestMarket: MarketCalculationResult | null;
  totalQuintals: number;
  comparison: ComparisonAnalysis | null;
  splitResult: SplitHarvestResult | null;
  feasibleMarkets: MarketCalculationResult[];
  onSelectBreakdown: (market: MarketCalculationResult) => void;
  onPrintReport: () => void;
  onStartNewHarvest: () => void;
  onBack: () => void;
}

export const Step6ProfitDecision: React.FC<Step6ProfitDecisionProps> = ({
  bestMarket,
  totalQuintals,
  comparison,
  splitResult,
  feasibleMarkets,
  onSelectBreakdown,
  onPrintReport,
  onStartNewHarvest,
  onBack,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  Step 6 of 6
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">Financial Decision Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                Where Will You Actually Earn the Most Money?
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                Our profit optimization engine accounts for transport costs, produce spoilage, and mandi fees to maximize your net take-home earnings.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onPrintReport}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <Printer className="w-4 h-4 text-rural-fresh" />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* A. Recommended Market & Hero Result Cards */}
      <MetricCards
        bestMarket={bestMarket}
        totalHarvestQuintals={totalQuintals}
      />

      {/* B. The Highest Price Is Not Always the Best Deal */}
      <ComparisonCard comparison={comparison} />

      {/* C. Single Market vs Split Harvest Optimization */}
      <SplitHarvestSection splitResult={splitResult} />

      {/* D. Financial Waterfall Chart */}
      <FinancialWaterfallChart bestMarket={bestMarket} />

      {/* E. Complete Markets Compared Table */}
      <MarketRankingTable
        feasibleMarkets={feasibleMarkets}
        onSelectMarket={onSelectBreakdown}
      />

      {/* Footer Action Bar */}
      <div className="bg-white rounded-3xl border border-rural-border p-6 shadow-rural-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-cream hover:bg-rural-sage/60 text-rural-charcoal border border-rural-border font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mandi Discovery</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onStartNewHarvest}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-rural-cream text-rural-forest border border-rural-border font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rural-primary" />
            <span>Start Another Harvest</span>
          </button>

          <button
            type="button"
            onClick={onPrintReport}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rural-fresh" />
            <span>View & Print Official Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

