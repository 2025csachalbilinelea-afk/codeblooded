import React from 'react';
import { CropProfile, FarmerInputs, SpoilageInputs, TransportConfig } from '../../../types/agriculture';
import {
  FarmerLocation,
  DynamicMandiEvaluation,
  MandiSortOption,
  MandiFilterOptions,
  DiscoveryLevel,
  ApiErrorCategory,
} from '../../../types/marketDiscovery';
import { SpoilageConfigForm } from '../../forms/SpoilageConfig';
import { TransportConfigForm } from '../../forms/TransportConfig';
import { DynamicMarketSection } from '../DynamicMarketSection';
import {
  Truck,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

interface Step2LogisticsMarketsProps {
  currentCrop: CropProfile;
  totalQuintals: number;
  inputs: FarmerInputs;
  farmerLocation: FarmerLocation;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  closestFeasibleMarket: DynamicMandiEvaluation | null;
  totalCandidatesFound: number;
  sortOption: MandiSortOption;
  filters: MandiFilterOptions;
  onSortChange: (sort: MandiSortOption) => void;
  onFilterChange: (filters: Partial<MandiFilterOptions>) => void;
  onSelectBreakdown: (mandi: DynamicMandiEvaluation) => void;
  onUpdateSpoilage: (updates: Partial<SpoilageInputs>) => void;
  onUpdateTransport: (updates: Partial<TransportConfig>) => void;
  apiStatus?: { isAvailable: boolean; lastError?: string; lastSyncTime?: string };
  cropName?: string;
  discoveryLevel?: DiscoveryLevel;
  apiErrorCategory?: ApiErrorCategory;
  isDiscovering: boolean;
  validationErrors?: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
}

export const Step2LogisticsMarkets: React.FC<Step2LogisticsMarketsProps> = ({
  currentCrop,
  totalQuintals,
  inputs,
  farmerLocation,
  evaluations,
  recommendedMarket,
  closestFeasibleMarket,
  totalCandidatesFound,
  sortOption,
  filters,
  onSortChange,
  onFilterChange,
  onSelectBreakdown,
  onUpdateSpoilage,
  onUpdateTransport,
  apiStatus,
  cropName,
  discoveryLevel,
  apiErrorCategory,
  isDiscovering,
  validationErrors = {},
  onNext,
  onBack,
}) => {
  const { language, t, getCropName } = useLanguage();
  const isOwn = inputs.transport.type === 'own';
  const vehicleCap = isOwn
    ? inputs.transport.ownVehicle.capacityQuintals
    : inputs.transport.rentedVehicle.capacityQuintals;
  const tripsNeeded = Math.max(1, Math.ceil(totalQuintals / Math.max(0.1, vehicleCap)));

  const localizedCrop = cropName || getCropName(currentCrop.id);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm shrink-0">
              <Truck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  {language === 'kn' ? 'ಹಂತ ೨ (೩ ರಲ್ಲಿ)' : language === 'hi' ? 'चरण २ (३ में)' : 'Step 2 of 3'}
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">{t('common.step2Label')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                {t('step2.title')}
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                {t('step2.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>{t('step2.nextStepButton')}</span>
              <ArrowRight className="w-4 h-4 text-rural-fresh" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: Produce Loss Estimation & SECTION 2: Transportation & Vehicle Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
          <div className="w-6 h-6 rounded-lg bg-rural-mint text-rural-forest flex items-center justify-center text-xs font-bold">
            1 & 2
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            {language === 'kn'
              ? 'ಉತ್ಪನ್ನದ ನಷ್ಟ ಅಂದಾಜು ಮತ್ತು ಸಾರಿಗೆ ವಿವರಗಳು'
              : language === 'hi'
              ? 'फसल नुकसान अनुमान और परिवहन विवरण'
              : 'Produce Loss Estimation & Transportation Details'}
            {/* Produce Loss Estimation & Transportation Details */}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Section 1: Produce Loss Estimation Form */}
          <div className="h-full">
            <SpoilageConfigForm
              spoilage={inputs.spoilage}
              crop={currentCrop}
              onChange={onUpdateSpoilage}
              error={validationErrors.spoilage}
            />
          </div>

          {/* Section 2: Transportation & Vehicle Details Form */}
          <div className="h-full">
            <TransportConfigForm
              transport={inputs.transport}
              totalQuintals={totalQuintals}
              onChange={onUpdateTransport}
              errors={validationErrors}
            />
          </div>
        </div>

        {/* Consignment Logistics Summary Strip */}
        <div className="bg-white rounded-3xl border border-rural-border p-5 sm:p-6 shadow-rural-soft space-y-3 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-rural-border/70 gap-2">
            <h4 className="font-serif font-bold text-base text-rural-forest flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rural-primary" />
              <span>{t('step2.consignmentSummaryTitle', 'Consignment Logistics & Sufficiency Summary')}</span>
              {/* Consignment Logistics & Sufficiency Summary */}
            </h4>
            <span className="text-xs text-rural-muted">
              {t('step2.consignmentSubtitle')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-rural-cream border border-rural-border">
              <span className="text-[10px] uppercase font-bold text-rural-muted block">{t('step2.harvestWeight')}</span>
              <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">
                {totalQuintals.toFixed(1)} Quintals
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                {(totalQuintals * 100).toLocaleString('en-IN')} kg • {localizedCrop}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rural-cream border border-rural-border">
              <span className="text-[10px] uppercase font-bold text-rural-muted block">{t('step2.vehicleModeSpace')}</span>
              <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">
                {isOwn
                  ? language === 'kn' ? 'ಸ್ವಂತ ವಾಹನ' : language === 'hi' ? 'अपना वाहन' : 'My Own Vehicle'
                  : language === 'kn' ? 'ಬಾಡಿಗೆ ವಾಹನ' : language === 'hi' ? 'किराये का वाहन' : 'Rented Commercial Vehicle'}
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                {language === 'kn' ? 'ಸಾಮರ್ಥ್ಯ: ' : language === 'hi' ? 'क्षमता: ' : 'Capacity: '}{vehicleCap} Qtl
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rural-sage/60 border border-rural-border">
              <span className="text-[10px] uppercase font-bold text-rural-muted block">{t('step2.logisticsSufficiency')}</span>
              <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">
                {tripsNeeded === 1 ? `1 ${t('step2.tripSufficient')}` : `${tripsNeeded} ${t('step2.tripsRequired')}`}
              </span>
              <span className="text-[10px] text-rural-muted block mt-0.5">
                {tripsNeeded === 1
                  ? language === 'kn' ? 'ಸಂಪೂರ್ಣ ಕಟಾವು ಒಂದೇ ಪ್ರಯಾಣದಲ್ಲಿ ಸರಿಹೊಂದುತ್ತದೆ' : language === 'hi' ? 'पूरी फसल एक ही फेरे में आ जाएगी' : 'Entire harvest fits in single journey'
                  : language === 'kn' ? 'ಹಲವು ಪ್ರಯಾಣಗಳು ಅಗತ್ಯವಿದೆ' : language === 'hi' ? 'कई फेरों की आवश्यकता होगी' : 'Consignment requires multi-trip shuttle'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTIONS 3, 4, 5: Discover Agricultural Markets, Compare Prices & Net Earnings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
          <div className="w-6 h-6 rounded-lg bg-rural-mint text-rural-forest flex items-center justify-center text-xs font-bold">
            3, 4 & 5
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            {t('step2.discoveryTitle', 'Discover Agricultural Markets, Compare Prices & Net Earnings')}
            {/* Discover Agricultural Markets */}
          </h3>
        </div>

        {/* Dynamic Mandi Discovery Content Area */}
        {isDiscovering && evaluations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-rural-border p-12 text-center shadow-rural-soft">
            <Loader2 className="w-9 h-9 animate-spin text-rural-primary mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-rural-forest">
              {t('step2.queryingMandis')}
            </h3>
            <p className="text-xs text-rural-muted mt-1 max-w-md mx-auto font-sans">
              {language === 'kn'
                ? `ಆಗಮಾರ್ಕ್‌ನೆಟ್ ಮಂಡಿಗಳಿಂದ ದೈನಂದಿನ ದರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ ಮತ್ತು ${localizedCrop} ಗಾಗಿ ನೈಜ ರಸ್ತೆ ದೂರವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ.`
                : language === 'hi'
                ? `एग्मार्कनेट मंडियों से दैनिक भाव प्राप्त किए जा रहे हैं और ${localizedCrop} के लिए सड़क दूरी निकाली जा रही है।`
                : `Retrieving daily modal rates from AGMARKNET and computing real OSRM road mileage for ${localizedCrop}.`}
            </p>
          </div>
        ) : (
          <DynamicMarketSection
            farmerLocation={farmerLocation}
            evaluations={evaluations}
            recommendedMarket={recommendedMarket}
            closestFeasibleMarket={closestFeasibleMarket}
            totalCandidatesFound={totalCandidatesFound}
            sortOption={sortOption}
            filters={filters}
            onSortChange={onSortChange}
            onFilterChange={onFilterChange}
            onSelectBreakdown={onSelectBreakdown}
            apiStatus={apiStatus}
            cropName={localizedCrop}
            discoveryLevel={discoveryLevel}
            apiErrorCategory={apiErrorCategory}
          />
        )}
      </div>

      {/* 4. Navigation Buttons Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-rural-border/70">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-rural-cream text-rural-charcoal border border-rural-border font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('step2.backStepButton')}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-7 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span>{t('step2.nextStepButton')}</span>
          <ArrowRight className="w-4 h-4 text-rural-fresh" />
        </button>
      </div>
    </div>
  );
};
