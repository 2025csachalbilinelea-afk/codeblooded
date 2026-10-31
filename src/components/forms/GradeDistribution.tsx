import React from 'react';
import { CropProfile, GradeDistribution, GradePricingMode } from '../../types/agriculture';
import {
  calculateProduceGradeRevenue,
  MarketPriceReferenceInfo,
} from '../../engine/gradePricing';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatINR } from '../../utils/currency';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react';

interface GradeDistributionProps {
  crop: CropProfile;
  totalQuintals: number;
  gradePricingMode: GradePricingMode;
  gradeDistribution: GradeDistribution;
  marketReference: MarketPriceReferenceInfo;
  spoilagePercentage: number;
  estimatedTransportExpenses: number;
  onModeChange: (mode: GradePricingMode) => void;
  onDistributionChange: (dist: GradeDistribution) => void;
  error?: string;
}

export const GradeDistributionForm: React.FC<GradeDistributionProps> = ({
  crop,
  totalQuintals,
  gradePricingMode,
  gradeDistribution,
  marketReference,
  spoilagePercentage,
  estimatedTransportExpenses,
  onModeChange,
  onDistributionChange,
  error,
}) => {
  const { t, getCropName } = useLanguage();

  const breakdown = calculateProduceGradeRevenue({
    mode: gradePricingMode,
    distribution: gradeDistribution,
    harvestQuantityQuintals: totalQuintals,
    spoilageLossPercentage: spoilagePercentage,
    marketReference,
    estimatedTransportationExpenses: estimatedTransportExpenses,
  });

  const handleGradeChange = (grade: 'A' | 'B' | 'C', val: number) => {
    onDistributionChange({
      ...gradeDistribution,
      [grade]: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
    });
  };

  const applyPreset = (A: number, B: number, C: number) => {
    onDistributionChange({ A, B, C });
  };

  const sum = (gradeDistribution.A || 0) + (gradeDistribution.B || 0) + (gradeDistribution.C || 0);
  const isValid = Math.abs(sum - 100) <= 0.05;
  const remaining = Math.round((100 - sum) * 10) / 10;
  const localizedCropName = getCropName(crop.id, crop.name);

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rural-border/70 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Award className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-rural-forest">
              {t('step1.gradeSectionTitle', 'Produce Quality & Grade Distribution')}
            </h2>
            <p className="text-xs text-rural-muted">
              {t('step1.gradeSectionSubtitle', 'Distribute your produce by commercial quality grades or sell the entire harvest in bulk.')} ({localizedCropName})
            </p>
          </div>
        </div>

        {/* Live Reference Price Badge */}
        <div className="flex items-center space-x-2 bg-rural-cream px-3 py-1.5 rounded-2xl border border-rural-border self-start sm:self-auto">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span className="text-xs text-rural-muted font-medium">
            {t('step1.metric1Ref', 'Ref Price (Grade A)')}:
          </span>
          <span className="text-xs font-bold text-emerald-900">
            {formatINR(marketReference.price)} {t('common.perQuintal', '/Qtl')}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
              marketReference.isCached
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {marketReference.isCached ? t('common.cached', 'CACHED') : t('common.live', 'LIVE')}
          </span>
        </div>
      </div>

      {/* Two Choices: Option A vs Option B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* OPTION A: I KNOW MY PRODUCE GRADES */}
        <button
          type="button"
          onClick={() => onModeChange('grades')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
            gradePricingMode === 'grades'
              ? 'border-rural-fresh bg-rural-sage/80 ring-2 ring-rural-fresh/40 shadow-sm'
              : 'border-rural-border bg-rural-cream hover:bg-rural-sage/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-rural-primary" />
              <span className="font-serif font-bold text-sm sm:text-base text-rural-forest">
                {t('step1.optionATitle', 'OPTION A: I Know My Produce Grades')}
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                gradePricingMode === 'grades'
                  ? 'bg-rural-primary text-white'
                  : 'border border-rural-border bg-white'
              }`}
            >
              {gradePricingMode === 'grades' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>
          <p className="text-xs text-rural-muted leading-relaxed">
            {t('step1.optionADesc', 'Specify the percentage split of your harvest across Grade A, Grade B, and Grade C to compute your weighted average selling price.')}
          </p>
        </button>

        {/* OPTION B: SELL IN BULK */}
        <button
          type="button"
          onClick={() => onModeChange('bulk')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
            gradePricingMode === 'bulk'
              ? 'border-rural-fresh bg-rural-sage/80 ring-2 ring-rural-fresh/40 shadow-sm'
              : 'border-rural-border bg-rural-cream hover:bg-rural-sage/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-amber-700" />
              <span className="font-serif font-bold text-sm sm:text-base text-rural-forest">
                {t('step1.optionBTitle', 'OPTION B: Sell the Entire Harvest in Bulk')}
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                gradePricingMode === 'bulk'
                  ? 'bg-rural-primary text-white'
                  : 'border border-rural-border bg-white'
              }`}
            >
              {gradePricingMode === 'bulk' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
          </div>
          <p className="text-xs text-rural-muted leading-relaxed">
            {t('step1.optionBDesc', "I'm not sure about grades — sell everything in bulk using standard Grade B market benchmark pricing (10% below Grade A).")}
          </p>
        </button>
      </div>

      {/* Grade Pricing Formula Reference Strip */}
      <div className="p-3 bg-rural-cream rounded-2xl border border-rural-border text-xs text-rural-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Scale className="w-4 h-4 text-rural-primary shrink-0" />
          <span className="font-semibold text-rural-forest">
            {t('step1.gradeRatios', 'Grade Price Ratios: Grade A = 100% (Market Price) • Grade B = 90% (–10%) • Grade C = 75% (–25%)')}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-semibold">
          <span className="text-emerald-800">A: {formatINR(breakdown.gradeAPrice)}</span>
          <span className="text-amber-800">B: {formatINR(breakdown.gradeBPrice)}</span>
          <span className="text-stone-700">C: {formatINR(breakdown.gradeCPrice)}</span>
        </div>
      </div>

      {/* CONDITIONAL CONTROLS */}
      {gradePricingMode === 'grades' ? (
        /* OPTION A: INPUT FIELDS & BREAKDOWN */
        <div className="space-y-4">
          {/* Presets and Validation Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-rural-muted mr-1 flex items-center">
                <Layers className="w-3 h-3 mr-1" /> {t('step1.presetsLabel', 'Quick Presets:')}
              </span>
              <button
                type="button"
                onClick={() => applyPreset(40, 40, 20)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-rural-sage text-rural-forest border border-rural-border transition-colors font-medium cursor-pointer"
              >
                {t('step1.presetStandard', 'Standard (40/40/20)')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset(50, 35, 15)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-rural-sage text-rural-forest border border-rural-border transition-colors font-medium cursor-pointer"
              >
                {t('step1.presetBalanced', 'Balanced (50/35/15)')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset(70, 20, 10)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-rural-sage text-rural-forest border border-rural-border transition-colors font-medium cursor-pointer"
              >
                {t('step1.presetPrime', 'Prime Lot (70/20/10)')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset(100, 0, 0)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-rural-sage text-rural-forest border border-rural-border transition-colors font-medium cursor-pointer"
              >
                {t('step1.presetAllA', '100% Grade A')}
              </button>
            </div>

            {/* Total Percentage and Remaining Indicator */}
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center space-x-1.5 ${
                  isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {isValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('step1.totalValid', 'Total: 100% (Valid)')}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      {t('step1.totalInvalid', 'Total')}: {sum}% ({remaining > 0 ? `${remaining}% ${t('step1.remaining', 'remaining')}` : `${Math.abs(remaining)}% over`})
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Validation Alert message if total != 100 */}
          {!isValid && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t('step1.gradeValidationAlert', 'Grade percentages must total exactly 100%. Please adjust values to calculate grade-based revenue.')}</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Currently entered total is {sum}%. {remaining > 0 ? `Please assign the remaining ${remaining}% across your grades.` : `Please reduce values by ${Math.abs(remaining)}% to equal 100%.`}
                </p>
              </div>
            </div>
          )}

          {/* Three Numerical Grade Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Grade A */}
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-emerald-950 text-sm flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span>{t('step1.gradeAPremium', 'Grade A (Premium)')}</span>
                </span>
                <span className="text-xs font-bold text-emerald-900 font-mono">
                  {formatINR(breakdown.gradeAPrice)}/Qtl
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeDistribution.A}
                  onChange={(e) => handleGradeChange('A', parseFloat(e.target.value))}
                  placeholder="40"
                  className="w-full text-base bg-white border border-emerald-300 rounded-xl px-3 py-2 text-rural-forest font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-xs font-bold text-emerald-900">%</span>
              </div>
              <p className="text-[10px] text-emerald-800/80 leading-tight">
                {t('step1.gradeADesc', 'Top export & supermarket quality; uniform color, unblemished produce.')}
              </p>
            </div>

            {/* Grade B */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-950 text-sm flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>{t('step1.gradeBFair', 'Grade B (Fair Avg)')}</span>
                </span>
                <span className="text-xs font-bold text-amber-900 font-mono">
                  {formatINR(breakdown.gradeBPrice)}/Qtl
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeDistribution.B}
                  onChange={(e) => handleGradeChange('B', parseFloat(e.target.value))}
                  placeholder="40"
                  className="w-full text-base bg-white border border-amber-300 rounded-xl px-3 py-2 text-rural-forest font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-900">%</span>
              </div>
              <p className="text-[10px] text-amber-800/80 leading-tight">
                {t('step1.gradeBDesc', 'Standard mandi market produce; minor cosmetic marks, good freshness.')}
              </p>
            </div>

            {/* Grade C */}
            <div className="bg-stone-100/70 rounded-2xl p-4 border border-stone-300/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-stone-900 text-sm flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-500 inline-block" />
                  <span>{t('step1.gradeCProcessing', 'Grade C (Processing)')}</span>
                </span>
                <span className="text-xs font-bold text-stone-800 font-mono">
                  {formatINR(breakdown.gradeCPrice)}/Qtl
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeDistribution.C}
                  onChange={(e) => handleGradeChange('C', parseFloat(e.target.value))}
                  placeholder="20"
                  className="w-full text-base bg-white border border-stone-300 rounded-xl px-3 py-2 text-rural-forest font-bold focus:outline-none focus:ring-2 focus:ring-stone-600"
                />
                <span className="text-xs font-bold text-stone-800">%</span>
              </div>
              <p className="text-[10px] text-stone-600 leading-tight">
                {t('step1.gradeCDesc', 'Smaller size, slight spotting or ripeness; factory pulp and bulk processing.')}
              </p>
            </div>
          </div>

          {/* Option A Detailed Breakdown (when valid) */}
          {isValid && (
            <div className="bg-rural-cream rounded-2xl p-4.5 border border-rural-border space-y-3">
              <span className="text-xs font-semibold text-rural-forest block">
                {t('step1.gradeBreakdownTitle', 'Grade-Wise Saleable Quantity & Value Breakdown:')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-xl border border-rural-border">
                  <span className="text-rural-muted text-[10px] block">Grade A Volume</span>
                  <span className="font-bold text-emerald-800 block text-sm">
                    {breakdown.gradeAQuantityQuintals.toFixed(1)} {t('common.quintal', 'Qtl')}
                  </span>
                  <span className="text-[10px] text-rural-muted block mt-0.5">
                    @ {formatINR(breakdown.gradeAPrice)} = {formatINR(breakdown.gradeAValue)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rural-border">
                  <span className="text-rural-muted text-[10px] block">Grade B Volume</span>
                  <span className="font-bold text-amber-800 block text-sm">
                    {breakdown.gradeBQuantityQuintals.toFixed(1)} {t('common.quintal', 'Qtl')}
                  </span>
                  <span className="text-[10px] text-rural-muted block mt-0.5">
                    @ {formatINR(breakdown.gradeBPrice)} = {formatINR(breakdown.gradeBValue)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rural-border">
                  <span className="text-rural-muted text-[10px] block">Grade C Volume</span>
                  <span className="font-bold text-stone-700 block text-sm">
                    {breakdown.gradeCQuantityQuintals.toFixed(1)} {t('common.quintal', 'Qtl')}
                  </span>
                  <span className="text-[10px] text-rural-muted block mt-0.5">
                    @ {formatINR(breakdown.gradeCPrice)} = {formatINR(breakdown.gradeCValue)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rural-border">
                  <span className="text-rural-muted text-[10px] block">{t('step1.weightedAvgPrice', 'Weighted Avg Price')}</span>
                  <span className="font-bold text-rural-forest block text-sm">
                    {formatINR(breakdown.effectiveSellingPricePerQuintal)}{t('common.perQuintal', '/Qtl')}
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5 font-semibold">
                    {t('step1.metric3Gross', 'Gross')}: {formatINR(breakdown.estimatedGrossSellingValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* OPTION B: BULK SELLING DETAILS */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-semibold text-sm">
              <Boxes className="w-4 h-4 text-amber-700" />
              <span>{t('step1.bulkBadge', 'Bulk selling estimate – Grade B equivalent pricing.')}</span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {t('step1.bulkDesc', 'When selling in bulk without pre-sorting, mandis value the entire lot at standard Grade B wholesale rate (10% below Grade A market benchmark).')}
            </p>
          </div>

          <div className="bg-rural-cream rounded-2xl p-4.5 border border-rural-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-xl border border-rural-border">
                <span className="text-rural-muted text-[10px] block">{t('step1.metric1Ref', 'Market Reference')}</span>
                <span className="font-bold text-rural-forest block text-sm">
                  {formatINR(breakdown.marketReferencePrice)}{t('common.perQuintal', '/Qtl')}
                </span>
                <span className="text-[10px] text-rural-muted block mt-0.5">Grade A</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rural-border">
                <span className="text-rural-muted text-[10px] block">{t('step1.bulkRate', 'Bulk Selling Rate (Grade B)')}</span>
                <span className="font-bold text-amber-800 block text-sm">
                  {formatINR(breakdown.gradeBPrice)}{t('common.perQuintal', '/Qtl')}
                </span>
                <span className="text-[10px] text-rural-muted block mt-0.5">90% of reference</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rural-border">
                <span className="text-rural-muted text-[10px] block">{t('step1.eligibleHarvest', 'Eligible Harvest')}</span>
                <span className="font-bold text-rural-forest block text-sm">
                  {breakdown.eligibleSellingQuantityQuintals.toFixed(1)} {t('common.quintal', 'Qtl')}
                </span>
                <span className="text-[10px] text-rural-muted block mt-0.5">After transit loss</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rural-border">
                <span className="text-rural-muted text-[10px] block">{t('step1.metric3Gross', 'Estimated Gross Value')}</span>
                <span className="font-bold text-emerald-800 block text-sm">
                  {formatINR(breakdown.estimatedGrossSellingValue)}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-semibold">
                  Before expenses
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-METRIC COMPARISON PANEL (Integrated Net Revenue Calculation) */}
      <div className="bg-white rounded-2xl border-2 border-rural-primary/30 p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rural-border pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-rural-primary" />
            <h3 className="font-serif font-bold text-base text-rural-forest">
              {t('step1.estimatedRevenueTitle', 'Estimated Revenue & Net In-Pocket Take-Home')}
            </h3>
          </div>
          <span className="text-xs text-rural-muted">
            {gradePricingMode === 'grades' ? t('step1.optionATitle', 'Option A: Grade-Weighted Pricing') : t('step1.optionBTitle', 'Option B: Bulk Grade B Pricing')}
          </span>
        </div>

        {isValid ? (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {/* Metric 1 */}
            <div className="p-3 rounded-xl bg-rural-cream border border-rural-border">
              <span className="text-[10px] font-bold uppercase text-rural-muted block">
                {t('step1.metric1Ref', '1. Market Reference')}
              </span>
              <span className="font-bold text-rural-forest text-sm block mt-1">
                {formatINR(breakdown.marketReferencePrice)} / Qtl
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                {marketReference.isCached ? t('common.cached', 'Cached APMC Quote') : t('common.live', 'Live AGMARKNET Quote')}
              </span>
            </div>

            {/* Metric 2 */}
            <div className="p-3 rounded-xl bg-rural-cream border border-rural-border">
              <span className="text-[10px] font-bold uppercase text-rural-muted block">
                {t('step1.metric2Adjusted', '2. Grade-Adjusted Rate')}
              </span>
              <span className="font-bold text-rural-forest text-sm block mt-1">
                {formatINR(breakdown.effectiveSellingPricePerQuintal)} / Qtl
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                {gradePricingMode === 'grades' ? t('step1.weightedAvgPrice', 'Weighted across grades') : t('step1.bulkRate', 'Grade B bulk rate (90%)')}
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-3 rounded-xl bg-rural-cream border border-rural-border">
              <span className="text-[10px] font-bold uppercase text-rural-muted block">
                {t('step1.metric3Gross', '3. Gross Selling Value')}
              </span>
              <span className="font-bold text-rural-forest text-sm block mt-1">
                {formatINR(breakdown.estimatedGrossSellingValue)}
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                {breakdown.eligibleSellingQuantityQuintals.toFixed(1)} {t('common.quintal', 'Qtl')} {t('step1.eligibleHarvest', 'eligible')}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="p-3 rounded-xl bg-rural-cream border border-rural-border">
              <span className="text-[10px] font-bold uppercase text-rural-muted block">
                {t('step1.metric4Transport', '4. Transport Expenses')}
              </span>
              <span className="font-bold text-rose-700 text-sm block mt-1">
                – {formatINR(breakdown.estimatedTransportationExpenses)}
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                Road haulage
              </span>
            </div>

            {/* Metric 5 */}
            <div className="p-3 rounded-xl bg-rural-sage border border-rural-fresh/50 ring-1 ring-rural-fresh/40">
              <span className="text-[10px] font-bold uppercase text-rural-primary block">
                {t('step1.metric5Net', '5. Final Net Revenue')}
              </span>
              <span className="font-serif font-bold text-emerald-900 text-base sm:text-lg block mt-0.5">
                {formatINR(breakdown.estimatedNetRevenue)}
              </span>
              <span className="text-[10px] text-emerald-800 font-medium block mt-0.5">
                {t('step1.takeHomeEarnings', 'Take-home earnings')}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-rural-muted bg-rural-cream rounded-xl border border-rural-border">
            {t('step1.gradeValidationAlert', 'Please adjust Grade A, B, and C percentages to total exactly 100% to calculate your final estimated net revenue.')}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 mt-2 font-medium">{error}</p>}
    </div>
  );
};
