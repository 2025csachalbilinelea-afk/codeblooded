import React from 'react';
import { ComparisonAnalysis } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { Sparkles, AlertCircle, CheckCircle2, TrendingUp, XCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ComparisonCardProps {
  comparison: ComparisonAnalysis | null;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ comparison }) => {
  const { language, t } = useLanguage();
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

  if (!hasFeasibleOption || !hnr) {
    return (
      <div className="bg-rural-sage rounded-3xl border border-rural-border p-6 shadow-rural-soft">
        <div className="flex items-center space-x-2 text-rose-800 font-semibold mb-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs uppercase tracking-wider">
            Market Capacity Limitation
          </span>
        </div>
        <h3 className="text-xl font-serif font-bold text-rural-forest mb-2">
          No Market Found That Can Buy Your Full Crop
        </h3>
        <p className="text-sm text-rural-muted leading-relaxed bg-white p-4 rounded-2xl border border-rural-border">
          {dynamicExplanation}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-rural-border p-6 sm:p-7 shadow-rural-card relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-rural-border/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-rural-mint text-rural-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-rural-primary">
              {language === 'kn' ? 'ರೈತರಿಗಾಗಿ ನಮ್ಮ ಮುಖ್ಯ ನಿಯಮ' : language === 'hi' ? 'किसानों के लिए हमारा मुख्य नियम' : 'Our Core Rule for Farmers'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-rural-forest mt-1">
            {t('step3.comparisonTitle')}
          </h2>
        </div>

        {!isSameMarket && (
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-rural-mint border border-rural-fresh/40 text-rural-forest text-xs font-bold self-start sm:self-auto shadow-sm">
            <TrendingUp className="w-4 h-4 text-rural-fresh" />
            <span>
              {language === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಉಳಿಯುವ ಹಣ: +' : language === 'hi' ? 'अतिरिक्त बचने वाली रकम: +' : 'Extra Money You Keep: +'}
              {formatINR(netReturnDifferenceTotal)}
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Plain-Language Explanation Callout */}
      <div className="my-5 p-4 rounded-2xl bg-rural-sage/70 border border-rural-border text-rural-charcoal text-xs sm:text-sm leading-relaxed">
        {warningNotice && (
          <div className="mb-2 flex items-center space-x-1.5 text-amber-800 font-semibold text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{warningNotice}</span>
          </div>
        )}
        <p className="font-normal">{dynamicExplanation}</p>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Market with Highest Advertised Selling Price */}
        <div
          className={`rounded-2xl border p-5 ${
            !hp.isFeasible
              ? 'bg-rose-50/50 border-rose-200'
              : isSameMarket
              ? 'bg-rural-sage/60 border-rural-border'
              : 'bg-warmbg-50 border-rural-border'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-rural-muted border border-rural-border">
              Highest Selling Price
            </span>
            <span
              className={`text-xs font-semibold flex items-center space-x-1 ${
                hp.isFeasible ? 'text-rural-primary' : 'text-rose-700'
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

          <h3 className="text-base sm:text-lg font-serif font-bold text-rural-forest truncate" title={hp.market.name}>
            {hp.market.name}
          </h3>
          <p className="text-xs text-rural-muted mb-4 font-sans">
            {hp.market.locationName} • {hp.market.distanceKm} km away
          </p>

          <div className="space-y-2 text-xs divide-y divide-rural-border/60">
            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Offered Price:</span>
              <strong className="text-amber-900 text-sm font-bold font-sans">
                {formatINR(hp.market.pricesPerQuintal.A)} / Qtl
              </strong>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Maximum Quantity Accepted:</span>
              <strong className={hp.isFeasible ? 'text-rural-charcoal' : 'text-rose-700 font-semibold'}>
                {hp.market.maxCapacityQuintals} Qtl{' '}
                {!hp.isFeasible && `(Your harvest: ${hp.initialQuantityQuintals} Qtl)`}
              </strong>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Expected Produce Loss:</span>
              <span className="text-rural-charcoal font-medium">
                {hp.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(hp.estimatedLossPercent)})
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Transport Cost:</span>
              <span className="text-rural-charcoal font-medium">{formatINR(hp.transportationCost)}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Market Fees:</span>
              <span className="text-rural-charcoal font-medium">{formatINR(hp.totalMarketFees)}</span>
            </div>

            <div className="flex justify-between items-center pt-3 bg-white/70 -mx-2 px-2.5 rounded-xl border border-rural-border/50">
              <span className="text-rural-forest font-semibold">Estimated Money You Keep:</span>
              <strong
                className={`text-base font-bold font-sans ${
                  hp.netReturn >= 0 ? 'text-rural-forest' : 'text-rose-700'
                }`}
              >
                {formatINR(hp.netReturn)}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Card: Best Estimated Earnings (Winner) */}
        <div className="rounded-2xl border-2 border-rural-fresh/80 bg-rural-sage/50 p-5 relative shadow-rural-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rural-forest text-rural-mint flex items-center space-x-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-rural-fresh" />
              <span>Best Estimated Earnings</span>
            </span>
            <span className="text-xs font-semibold text-rural-primary flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-rural-fresh" />
              <span>Can Buy All Your Crop</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-rural-forest truncate" title={hnr.market.name}>
            {hnr.market.name}
          </h3>
          <p className="text-xs text-rural-muted mb-4 font-sans">
            {hnr.market.locationName} • {hnr.market.distanceKm} km away
          </p>

          <div className="space-y-2 text-xs divide-y divide-rural-border/60">
            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Offered Price:</span>
              <strong className="text-rural-forest font-semibold text-sm font-sans">
                {formatINR(hnr.market.pricesPerQuintal.A)} / Qtl
              </strong>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Maximum Quantity Accepted:</span>
              <strong className="text-rural-primary font-semibold">
                {hnr.market.maxCapacityQuintals} Qtl (Full Consignment Accepted)
              </strong>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Expected Produce Loss:</span>
              <span className="text-rural-primary font-medium">
                {hnr.physicalLossQuintals.toFixed(1)} Qtl ({formatPercent(hnr.estimatedLossPercent)})
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Transport Cost:</span>
              <span className="text-rural-primary font-medium">{formatINR(hnr.transportationCost)}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-rural-muted">Market Fees:</span>
              <span className="text-rural-primary font-medium">{formatINR(hnr.totalMarketFees)}</span>
            </div>

            <div className="flex justify-between items-center pt-3 bg-rural-mint/80 -mx-2 px-2.5 rounded-xl border border-rural-fresh/40">
              <span className="text-rural-deep font-bold">Estimated Money You Keep:</span>
              <strong className="text-lg font-black text-rural-forest font-sans">
                {formatINR(hnr.netReturn)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
