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
  FileText,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Truck,
  Info,
  Coins,
  Award,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const { language, t, getCropName } = useLanguage();

  const currentDate = new Date().toLocaleString(
    language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );

  const bestSingle = ranking.bestMarket;
  // Strictly take only the top 3 recommended mandis (never 18 or low-ranked markets)
  const top3Markets: MarketCalculationResult[] = ranking.feasibleMarkets.slice(0, 3);
  const secondMarket = top3Markets.length > 1 ? top3Markets[1] : null;

  const handlePrint = () => {
    window.print();
  };

  const cropDisplayName = getCropName(crop.id);

  const gradeDisplay = (() => {
    if (inputs.gradePricingMode === 'grades' && inputs.gradeDistribution) {
      const { A, B, C } = inputs.gradeDistribution;
      return `Grade A: ${A}% • Grade B: ${B}% • Grade C: ${C}%`;
    }
    return language === 'kn'
      ? 'ಸ್ಟ್ಯಾಂಡರ್ಡ್ ಎಪಿಎಂಸಿ ಸರಾಸರಿ ಗುಣಮಟ್ಟ (FAQ)'
      : language === 'hi'
      ? 'मानक एपीएमसी औसत गुणवत्ता (FAQ)'
      : 'Standard APMC Benchmark (Fair Average Quality)';
  })();

  const transportDisplay = (() => {
    if (inputs.transport.type === 'own') {
      const own = inputs.transport.ownVehicle;
      return language === 'kn'
        ? `ಸ್ವಂತ ವಾಹನ (${own.capacityQuintals} ಕ್ವಿಂ ಸಾಮರ್ಥ್ಯ, ${own.mileageKmPerLitre} ಕಿಮೀ/ಲೀ)`
        : language === 'hi'
        ? `अपना वाहन (${own.capacityQuintals} क्विंटल क्षमता, ${own.mileageKmPerLitre} किमी/ली)`
        : `Own Vehicle (${own.capacityQuintals} Qtl capacity, ${own.mileageKmPerLitre} km/L)`;
    }
    const rent = inputs.transport.rentedVehicle;
    return language === 'kn'
      ? `ಬಾಡಿಗೆ ವಾಹನ (${rent.capacityQuintals} ಕ್ವಿಂ ಸಾಮರ್ಥ್ಯ, ₹${rent.rentalRatePerKm || 35}/ಕಿಮೀ)`
      : language === 'hi'
      ? `किराये का वाहन (${rent.capacityQuintals} क्विंटल क्षमता, ₹${rent.rentalRatePerKm || 35}/किमी)`
      : `Rented Vehicle (${rent.capacityQuintals} Qtl capacity, ₹${rent.rentalRatePerKm || 35}/km)`;
  })();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-rural-deep/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-4xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none">
        
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="bg-rural-forest text-white p-4 sm:px-6 flex items-center justify-between no-print border-b border-rural-mint/20">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white leading-tight">
                {t('report.documentTitle')}
              </h2>
              <p className="text-xs text-rural-mint/80">
                {t('report.documentSubtitle')}
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
              <span>
                {language === 'kn' ? 'ಪ್ರಿಂಟ್ / PDF ಉಳಿಸಿ' : language === 'hi' ? 'प्रिंट / PDF सहेजें' : 'Print / Save PDF'}
              </span>
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
        <div className="p-6 sm:p-8 space-y-8 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 text-rural-charcoal text-xs font-sans">
          
          {/* ======================================================== */}
          {/* PAGE 1: FARMER & HARVEST SUMMARY + YOUR BEST SELLING OPTION */}
          {/* ======================================================== */}
          <section className="page-break space-y-6">
            {/* Page Header */}
            <div className="border-b-2 border-rural-forest pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <BrandLogo variant="dark" size="lg" showTagline={true} />

                <div className="text-left sm:text-right text-[11px] text-rural-muted">
                  <div>
                    {t('report.reportGenerated')}:{' '}
                    <strong className="text-rural-forest font-semibold">{currentDate}</strong>
                  </div>
                  <div>
                    {t('report.farmOrigin')}:{' '}
                    <strong className="text-rural-forest font-semibold">{inputs.originLocation}</strong>
                  </div>
                  <div className="text-[10px] text-rural-muted font-mono mt-0.5">
                    {t('report.refId')}: HR-{inputs.cropId.toUpperCase()}-{Date.now().toString().slice(-6)}
                  </div>
                </div>
              </div>

              {/* Verified Official Data Notice */}
              <div className="mt-3.5 p-2.5 bg-rural-sage/60 border border-rural-border rounded-xl text-[10px] text-rural-charcoal flex items-center space-x-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-rural-primary shrink-0" />
                <span>{t('report.verifiedDataNotice')}</span>
              </div>
            </div>

            {/* Section 1: Farmer & Harvest Summary */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-rural-border pb-1.5">
                <h3 className="font-serif font-bold text-rural-forest text-sm flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-rural-primary" />
                  <span>{t('report.farmerSummaryTitle')}</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-rural-muted tracking-wider">
                  {t('report.page1Title')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-rural-cream p-4 rounded-2xl border border-rural-border">
                <div>
                  <span className="text-[10px] text-rural-muted block">{t('report.cropSelected')}</span>
                  <strong className="text-rural-forest text-sm font-serif">{cropDisplayName}</strong>
                  <span className="text-[10px] text-rural-muted block capitalize">{crop.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rural-muted block">{t('report.totalQuantity')}</span>
                  <strong className="text-rural-forest text-sm">{totalQuintals.toFixed(1)} Quintals</strong>
                  <span className="text-[10px] text-rural-muted block">
                    {(totalQuintals * 100).toLocaleString('en-IN')} kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rural-muted block">{t('report.gradeChoice')}</span>
                  <strong className="text-rural-forest text-xs font-semibold block">{gradeDisplay}</strong>
                  <span className="text-[10px] text-rural-muted block">
                    {inputs.gradePricingMode === 'grades' ? 'Quality Distribution' : 'Fair Average Quality'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rural-muted block">{t('report.transportMode')}</span>
                  <strong className="text-rural-forest text-xs font-semibold block">{transportDisplay}</strong>
                  <span className="text-[10px] text-rural-muted block">
                    {inputs.spoilage.mode === 'automatic'
                      ? 'Automated Spoilage Model'
                      : `Manual Loss (${inputs.spoilage.manualPercentage}%)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Prominent "YOUR BEST SELLING OPTION" Hero Section */}
            {bestSingle ? (
              <div className="bg-rural-forest text-white rounded-2xl p-5 sm:p-6 border-2 border-rural-forest shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/20 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-rural-mint text-rural-forest font-bold text-[10px] uppercase px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{t('report.bestOptionTitle')}</span>
                    </span>
                    <span className="text-xs text-rural-mint font-semibold">
                      #{1} {t('report.recommendedMandi')}
                    </span>
                  </div>
                  <div className="text-xs text-rural-mint/90 font-medium">
                    {bestSingle.market.locationName}
                  </div>
                </div>

                <div className="py-4">
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
                    {bestSingle.market.name}
                  </h2>
                  <p className="text-xs text-rural-mint/80 mt-1">
                    {bestSingle.market.locationName} • {bestSingle.market.distanceKm} km {t('report.distanceFromFarm')} • ~{bestSingle.market.estimatedTravelTimeHours}h {t('report.estimatedTravelTime')}
                  </p>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 p-3.5 rounded-xl border border-white/10 text-white text-[11px]">
                  <div>
                    <span className="text-[10px] text-white/70 block">{t('report.expectedSellingPrice')}</span>
                    <strong className="text-sm font-bold text-white">
                      {formatINR(bestSingle.averagePricePerQuintalSold)} / Qtl
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">{t('report.quantityAvailableSale')}</span>
                    <strong className="text-sm font-bold text-white">
                      {bestSingle.saleableQuantityQuintals.toFixed(1)} Qtl
                    </strong>
                    <span className="text-[9px] text-white/60 block">
                      (-{bestSingle.physicalLossQuintals.toFixed(1)} Qtl {formatPercent(bestSingle.estimatedLossPercent)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">{t('report.estimatedTransportExpenses')}</span>
                    <strong className="text-sm font-bold text-rose-200">
                      -{formatINR(bestSingle.transportationCost)}
                    </strong>
                    <span className="text-[9px] text-white/60 block">
                      {bestSingle.transportTrips} {bestSingle.transportTrips === 1 ? 'Trip' : 'Trips'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">{t('report.estimatedMandiCharges')}</span>
                    <strong className="text-sm font-bold text-rose-200">
                      -{formatINR(bestSingle.totalMarketFees)}
                    </strong>
                    <span className="text-[9px] text-white/60 block">APMC statutory</span>
                  </div>
                </div>

                {/* Final Estimated Money You Keep Hero Banner */}
                <div className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-rural-mint font-bold uppercase tracking-wider block">
                      {t('report.finalNetMoneyKept')}
                    </span>
                    <span className="text-[10px] text-white/80 max-w-md block">
                      {t('report.finalNetMoneyKeptDesc')}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl sm:text-4xl font-serif font-black text-rural-mint tracking-tight">
                      {formatINR(bestSingle.netReturn)}
                    </span>
                    <span className="text-xs text-white/80 block font-medium">
                      ({formatINR(bestSingle.netReturnPerQuintal)} / Qtl net)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
                <p className="font-semibold text-xs">
                  {language === 'kn'
                    ? 'ಯಾವುದೇ ಮಂಡಿ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಕಟಾವನ್ನು ಖರೀದಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
                    : language === 'hi'
                    ? 'कोई भी मंडी आपकी पूरी फसल खरीदने में सक्षम नहीं पाई गई।'
                    : 'No single market was found that can purchase your full harvest.'}
                </p>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* PAGE 2: TOP 3 RECOMMENDED MANDIS (ONLY 3, NEVER 18)       */}
          {/* ======================================================== */}
          <section className="page-break space-y-6 pt-4 print:pt-0">
            <div className="flex items-center justify-between border-b border-rural-border pb-1.5">
              <div>
                <h3 className="font-serif font-bold text-rural-forest text-sm flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-rural-primary" />
                  <span>{t('report.top3Title')}</span>
                </h3>
                <p className="text-[11px] text-rural-muted mt-0.5">
                  {t('report.top3Subtitle')}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold text-rural-muted tracking-wider">
                {t('report.page2Title')}
              </span>
            </div>

            {top3Markets.length > 0 ? (
              <div className="space-y-4">
                {/* Table representation */}
                <div className="rounded-2xl border border-rural-border overflow-hidden shadow-sm">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-rural-sage/70 border-b border-rural-border font-bold text-rural-forest">
                      <tr>
                        <th className="p-3">{t('report.marketCol')}</th>
                        <th className="p-3">{t('report.priceCol')}</th>
                        <th className="p-3">{t('report.distanceCol')}</th>
                        <th className="p-3">{t('report.lossCol')}</th>
                        <th className="p-3">{t('report.transportCol')}</th>
                        <th className="p-3">{t('report.feesCol')}</th>
                        <th className="p-3 text-right">{t('report.netEarningsCol')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rural-border font-medium">
                      {top3Markets.map((res: MarketCalculationResult, idx: number) => {
                        const isTop = idx === 0;
                        return (
                          <tr
                            key={res.market.id}
                            className={isTop ? 'bg-rural-mint/30 font-semibold' : 'bg-white hover:bg-rural-cream/50'}
                          >
                            <td className="p-3">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    isTop
                                      ? 'bg-rural-forest text-white'
                                      : 'bg-rural-sage text-rural-forest'
                                  }`}
                                >
                                  #{idx + 1}
                                </span>
                                <strong className="text-rural-forest font-serif text-xs">
                                  {res.market.name}
                                </strong>
                              </div>
                              <div className="text-[10px] text-rural-muted mt-0.5 ml-6">
                                {res.market.locationName}
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-rural-forest">
                              {formatINR(res.averagePricePerQuintalSold)}
                            </td>
                            <td className="p-3 text-rural-charcoal">
                              {res.market.distanceKm} km
                              <span className="block text-[10px] text-rural-muted">
                                ~{res.market.estimatedTravelTimeHours}h
                              </span>
                            </td>
                            <td className="p-3 text-amber-800">
                              -{res.physicalLossQuintals.toFixed(1)} Qtl
                              <span className="block text-[10px] text-amber-700">
                                ({formatPercent(res.estimatedLossPercent)})
                              </span>
                            </td>
                            <td className="p-3 text-rose-700 font-medium">
                              -{formatINR(res.transportationCost)}
                            </td>
                            <td className="p-3 text-rose-700 font-medium">
                              -{formatINR(res.totalMarketFees)}
                            </td>
                            <td className="p-3 text-right">
                              <strong
                                className={`text-xs ${
                                  isTop ? 'text-rural-forest font-black text-sm' : 'text-rural-charcoal'
                                }`}
                              >
                                {formatINR(res.netReturn)}
                              </strong>
                              <span className="block text-[10px] font-normal text-rural-muted">
                                ({formatINR(res.netReturnPerQuintal)}/Qtl)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Explanatory callout for Rank #1 */}
                <div className="p-3 bg-rural-mint/20 border border-rural-fresh/30 rounded-xl text-[11px] text-rural-forest flex items-start space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
                  <span>{t('report.recommendedChoiceNote')}</span>
                </div>
              </div>
            ) : (
              <p className="text-rose-800 bg-rose-50 p-4 rounded-xl border border-rose-200">
                {language === 'kn'
                  ? 'ಯಾವುದೇ ಪರಿಶೀಲಿಸಿದ ಮಂಡಿಗಳು ಲಭ್ಯವಿಲ್ಲ.'
                  : language === 'hi'
                  ? 'कोई सत्यापित मंडी उपलब्ध नहीं है।'
                  : 'No verified APMC markets available for this crop at this time.'}
              </p>
            )}
          </section>

          {/* ======================================================== */}
          {/* PAGE 3: SIMPLE EARNINGS BREAKDOWN & PLAIN-LANGUAGE SUMMARY */}
          {/* ======================================================== */}
          <section className="page-break space-y-6 pt-4 print:pt-0">
            <div className="flex items-center justify-between border-b border-rural-border pb-1.5">
              <div>
                <h3 className="font-serif font-bold text-rural-forest text-sm flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-rural-primary" />
                  <span>{t('report.simpleBreakdownTitle')}</span>
                </h3>
                <p className="text-[11px] text-rural-muted mt-0.5">
                  {bestSingle ? `${bestSingle.market.name} (${bestSingle.market.locationName})` : ''}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold text-rural-muted tracking-wider">
                {t('report.page3Title')}
              </span>
            </div>

            {bestSingle && (
              <div className="space-y-4">
                {/* Visual Arithmetic Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="bg-rural-sage/40 p-4 rounded-2xl border border-rural-border">
                    <span className="text-[10px] text-rural-muted block font-semibold uppercase">
                      1. {t('report.expectedCropSales')}
                    </span>
                    <strong className="text-rural-forest text-lg font-serif block mt-1">
                      {formatINR(bestSingle.grossRevenue)}
                    </strong>
                    <span className="text-[10px] text-rural-muted block mt-0.5">
                      {bestSingle.saleableQuantityQuintals.toFixed(1)} Qtl × {formatINR(bestSingle.averagePricePerQuintalSold)}
                    </span>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                    <span className="text-[10px] text-rose-700 block font-semibold uppercase">
                      2. {t('report.minusTransport')}
                    </span>
                    <strong className="text-rose-700 text-lg font-serif block mt-1">
                      -{formatINR(bestSingle.transportationCost)}
                    </strong>
                    <span className="text-[10px] text-rose-600 block mt-0.5">
                      {bestSingle.market.distanceKm * 2} km round-trip
                    </span>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                    <span className="text-[10px] text-rose-700 block font-semibold uppercase">
                      3. {t('report.minusMandiFees')}
                    </span>
                    <strong className="text-rose-700 text-lg font-serif block mt-1">
                      -{formatINR(bestSingle.totalMarketFees)}
                    </strong>
                    <span className="text-[10px] text-rose-600 block mt-0.5">
                      APMC cess & user fees
                    </span>
                  </div>

                  <div className="bg-rural-mint/40 p-4 rounded-2xl border-2 border-rural-forest">
                    <span className="text-[10px] text-rural-forest block font-bold uppercase">
                      4. {t('report.estimatedMoneyYouKeep')}
                    </span>
                    <strong className="text-rural-forest text-xl font-serif font-black block mt-1">
                      {formatINR(bestSingle.netReturn)}
                    </strong>
                    <span className="text-[10px] text-rural-forest/80 font-medium block mt-0.5">
                      {formatINR(bestSingle.netReturnPerQuintal)} / Qtl net
                    </span>
                  </div>
                </div>

                {/* Natural, Plain-Language Summary Box */}
                <div className="p-4 bg-rural-cream rounded-2xl border border-rural-border space-y-3">
                  <div className="text-xs text-rural-forest leading-relaxed font-medium">
                    <p className="text-sm font-serif font-bold text-rural-forest mb-1">
                      {t('report.naturalSummaryTemplate')}{' '}
                      <span className="text-rural-forest text-base font-black underline decoration-rural-fresh">
                        {formatINR(bestSingle.netReturn)}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-rural-charcoal pt-2 border-t border-rural-border/60">
                    <div className="space-y-1">
                      <strong className="text-rural-forest block font-semibold">
                        {language === 'kn' ? 'ಸಾಗಾಣಿಕೆ ನಷ್ಟ ಲೆಕ್ಕಾಚಾರ' : language === 'hi' ? 'परिवहन नुकसान की गणना' : 'Produce Transit Spoilage'}:
                      </strong>
                      <p className="text-rural-muted leading-relaxed">
                        {t('report.spoilageExplanation')}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-rural-forest block font-semibold">
                        {language === 'kn' ? 'ಗುಣಮಟ್ಟ ಗ್ರೇಡ್ ಮೌಲ್ಯ' : language === 'hi' ? 'गुणवत्ता ग्रेड मूल्य' : 'Quality Grade Valuations'}:
                      </strong>
                      <p className="text-rural-muted leading-relaxed">
                        {t('report.gradeExplanation')}
                      </p>
                    </div>
                  </div>

                  {/* Why this Mandi is better than other options */}
                  {secondMarket && (
                    <div className="pt-2 border-t border-rural-border/60 text-[11px]">
                      <strong className="text-rural-forest block font-semibold mb-0.5">
                        {t('report.whyThisMandiBetter')}
                      </strong>
                      <p className="text-rural-muted leading-relaxed">
                        {language === 'kn'
                          ? `ಎರಡನೇ ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆಯಾದ ${secondMarket.market.name} ಕ್ಕೆ ಹೋಲಿಸಿದರೆ, ${bestSingle.market.name} ನಲ್ಲಿ ಮಾರಾಟ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಕೈಯಲ್ಲಿ ₹${(bestSingle.netReturn - secondMarket.netReturn).toLocaleString('en-IN')} ಹೆಚ್ಚುವರಿ ಹಣ ಉಳಿಯುತ್ತದೆ.`
                          : language === 'hi'
                          ? `दूसरे सर्वश्रेष्ठ विकल्प (${secondMarket.market.name}) की तुलना में, ${bestSingle.market.name} में बिक्री करने से आपके पास ₹${(bestSingle.netReturn - secondMarket.netReturn).toLocaleString('en-IN')} अतिरिक्त शुद्ध राशि बचेगी।`
                          : `Compared to the second best alternative (${secondMarket.market.name}), dispatching to ${bestSingle.market.name} yields an extra ${formatINR(bestSingle.netReturn - secondMarket.netReturn)} in your pocket after deducting distance and fuel expenses.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* PAGE 4: IMPORTANT ADVISORY INFORMATION & DATA SOURCES     */}
          {/* ======================================================== */}
          <section className="space-y-6 pt-4 print:pt-0">
            <div className="flex items-center justify-between border-b border-rural-border pb-1.5">
              <div>
                <h3 className="font-serif font-bold text-rural-forest text-sm flex items-center space-x-2">
                  <Info className="w-4 h-4 text-rural-primary" />
                  <span>{t('report.importantInfoTitle')}</span>
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-rural-muted tracking-wider">
                {t('report.page4Title')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-rural-sage/30 p-3.5 rounded-2xl border border-rural-border space-y-1.5">
                <div className="flex items-center space-x-1.5 text-rural-forest font-serif font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-rural-primary" />
                  <span>{t('report.dataSourceHeading')}</span>
                </div>
                <p className="text-[10px] text-rural-muted leading-relaxed">
                  {t('report.dataSourceBody')}
                </p>
              </div>

              <div className="bg-rural-sage/30 p-3.5 rounded-2xl border border-rural-border space-y-1.5">
                <div className="flex items-center space-x-1.5 text-rural-forest font-serif font-bold text-xs">
                  <Truck className="w-3.5 h-3.5 text-rural-primary" />
                  <span>{t('report.roadTransportHeading')}</span>
                </div>
                <p className="text-[10px] text-rural-muted leading-relaxed">
                  {t('report.roadTransportBody')}
                </p>
              </div>

              <div className="bg-rural-sage/30 p-3.5 rounded-2xl border border-rural-border space-y-1.5">
                <div className="flex items-center space-x-1.5 text-rural-forest font-serif font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-rural-primary" />
                  <span>{t('report.disclaimerHeading')}</span>
                </div>
                <p className="text-[10px] text-rural-muted leading-relaxed">
                  {t('report.disclaimerBody')}
                </p>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-rural-border flex flex-col sm:flex-row items-center justify-between text-[10px] text-rural-muted gap-2">
              <div className="font-medium text-rural-forest">
                {t('report.footerText')}
              </div>
              <div className="font-mono text-[9px] text-rural-muted">
                Advisory Ref: HR-PUB-{Date.now().toString().slice(-8)}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
