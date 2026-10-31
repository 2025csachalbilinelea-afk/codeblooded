import React, { useMemo, useState } from 'react';
import { CropProfile, FarmerInputs } from '../../../types/agriculture';
import { FarmerLocation, DynamicMandiEvaluation } from '../../../types/marketDiscovery';
import { CropSelector } from '../../forms/CropSelector';
import { HarvestDetails } from '../../forms/HarvestDetails';
import { GradeDistributionForm } from '../../forms/GradeDistribution';
import { LocationSelector } from '../../forms/LocationSelector';
import { MarketLocationMap } from '../../markets/MarketLocationMap';
import { formatINR } from '../../../utils/currency';
import { convertToQuintals } from '../../../engine/units';
import { calculateSpoilagePercentage } from '../../../engine/spoilage';
import { calculateTransportationCost } from '../../../engine/transport';
import {
  resolveCropMarketReferencePrice,
  validateGradePercentages,
} from '../../../engine/gradePricing';
import {
  Sprout,
  MapPin,
  ArrowRight,
  Info,
  Calendar,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface Step1HarvestFarmProps {
  currentCrop: CropProfile;
  inputs: FarmerInputs;
  farmerLocation: FarmerLocation;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  onCropChange: (crop: CropProfile) => void;
  onInputsChange: (updates: Partial<FarmerInputs>) => void;
  onLocationChange: (loc: FarmerLocation) => void;
  onSelectBreakdown?: (mandi: DynamicMandiEvaluation) => void;
  quantityError?: string;
  onNext: () => void;
}

export const Step1HarvestFarm: React.FC<Step1HarvestFarmProps> = ({
  currentCrop,
  inputs,
  farmerLocation,
  evaluations,
  recommendedMarket,
  onCropChange,
  onInputsChange,
  onLocationChange,
  onSelectBreakdown,
  quantityError,
  onNext,
}) => {
  const [localGradeError, setLocalGradeError] = useState<string | null>(null);

  // Convert volume to quintals
  const totalQuintals = useMemo(
    () => convertToQuintals(inputs.quantity, inputs.quantityUnit),
    [inputs.quantity, inputs.quantityUnit]
  );

  // Reference market rate for selected crop
  const marketPriceReference = useMemo(
    () => resolveCropMarketReferencePrice(currentCrop, evaluations, recommendedMarket),
    [currentCrop, evaluations, recommendedMarket]
  );

  // Spoilage percentage estimate
  const estimatedLossPercent = useMemo(() => {
    const calc = calculateSpoilagePercentage(
      currentCrop,
      inputs.spoilage,
      2.5,
      1.0,
      inputs.maturity
    );
    return calc.lossPercentage;
  }, [currentCrop, inputs.spoilage, inputs.maturity]);

  // Transportation cost estimate (using recommended market or regional 50km baseline)
  const estimatedTransportCost = useMemo(() => {
    if (recommendedMarket?.transportCost && recommendedMarket.transportCost > 0) {
      return recommendedMarket.transportCost;
    }
    const feasible = evaluations.find((e) => e.isFeasible && e.transportCost > 0);
    if (feasible) return feasible.transportCost;
    return calculateTransportationCost(inputs.transport, 50, totalQuintals).totalCost;
  }, [recommendedMarket, evaluations, inputs.transport, totalQuintals]);

  const handleNextWithValidation = () => {
    if (inputs.gradePricingMode === 'grades') {
      const validation = validateGradePercentages(inputs.gradeDistribution);
      if (!validation.isValid) {
        setLocalGradeError(validation.message || 'Please ensure Grade A, B, and C total exactly 100%.');
        return;
      }
    }
    setLocalGradeError(null);
    onNext();
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm shrink-0">
              <Sprout className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  Step 1 of 3
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">Harvest & Farm Details</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                Tell Us About Your Harvest & Farm Location
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                Specify your crop, harvest quantity, quality grade distribution, and farm gate origin.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleNextWithValidation}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>Next: Loss, Logistics & Markets</span>
              <ArrowRight className="w-4 h-4 text-rural-fresh" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: Select Your Crop & Agronomic Profile */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
          <div className="w-6 h-6 rounded-lg bg-rural-mint text-rural-forest flex items-center justify-center text-xs font-bold">
            1
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Select Your Crop
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main: Single Crop Selector */}
          <div className="lg:col-span-8 space-y-6">
            <CropSelector
              selectedCrop={currentCrop}
              onCropChange={onCropChange}
              referencePrice={marketPriceReference.price}
              isCached={marketPriceReference.isCached}
            />
          </div>

          {/* Side Spotlight: Agronomic Profile */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-rural-border p-5 sm:p-6 shadow-rural-soft space-y-3.5">
              <h4 className="font-serif font-bold text-base text-rural-forest flex items-center space-x-2">
                <Info className="w-4 h-4 text-rural-primary" />
                <span>Agronomic Spotlight</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-rural-sage/60 border border-rural-border/80">
                  <span className="text-[10px] uppercase font-bold text-rural-muted block">Selected Commodity</span>
                  <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">{currentCrop.name}</span>
                  <span className="text-rural-muted block capitalize mt-0.5">Category: {currentCrop.category}</span>
                </div>

                <div className="p-3 rounded-2xl bg-rural-cream border border-rural-border">
                  <span className="text-[10px] uppercase font-bold text-rural-muted block">Typical Market Rate Range</span>
                  <div className="text-sm font-bold text-emerald-800 mt-0.5">
                    {formatINR(currentCrop.typicalMarketPriceRange.min)} – {formatINR(currentCrop.typicalMarketPriceRange.max)} / Qtl
                  </div>
                  <span className="text-[10px] text-rural-muted mt-0.5 block">
                    Actual rates are queried live from AGMARKNET mandis.
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rural-cream border border-rural-border">
                  <span className="text-[10px] uppercase font-bold text-rural-muted block">Perishability & Storage Notes</span>
                  <p className="text-rural-charcoal mt-1 text-[11px] leading-relaxed">
                    {currentCrop.storageNotes || currentCrop.description}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-rural-mint/30 border border-rural-fresh/30 text-rural-forest flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    Transit spoilage is dynamically computed based on {currentCrop.name}'s perishability profile and transit duration.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2: Enter Harvest Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
          <div className="w-6 h-6 rounded-lg bg-rural-mint text-rural-forest flex items-center justify-center text-xs font-bold">
            2
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Enter Harvest Details
          </h3>
        </div>

        <HarvestDetails
          inputs={inputs}
          onChange={(updates) => onInputsChange(updates)}
          error={quantityError}
        />
      </div>

      {/* 4. SECTION 3: Produce Quality & Grade Distribution */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
          <div className="w-6 h-6 rounded-lg bg-rural-mint text-rural-forest flex items-center justify-center text-xs font-bold">
            3
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Produce Quality & Grade Distribution
          </h3>
        </div>

        <GradeDistributionForm
          crop={currentCrop}
          totalQuintals={totalQuintals}
          gradePricingMode={inputs.gradePricingMode || 'grades'}
          gradeDistribution={inputs.gradeDistribution || { A: 40, B: 40, C: 20 }}
          marketReference={marketPriceReference}
          spoilagePercentage={estimatedLossPercent}
          estimatedTransportExpenses={estimatedTransportCost}
          onModeChange={(mode) => onInputsChange({ gradePricingMode: mode })}
          onDistributionChange={(dist) => {
            setLocalGradeError(null);
            onInputsChange({ gradeDistribution: dist });
          }}
          error={localGradeError || undefined}
        />
      </div>

      {/* 5. SECTION 4: Set Your Farm Location & SECTION 5: View Location on Map */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
          <div className="w-6 h-6 rounded-lg bg-rural-mint text-rural-forest flex items-center justify-center text-xs font-bold">
            4 & 5
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Set Your Farm Location & View on Regional Mandi Map
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Section 4: Location Selection Form */}
          <div className="lg:col-span-5 space-y-5">
            <LocationSelector
              currentLocation={farmerLocation}
              onLocationChange={onLocationChange}
            />

            {/* Coordinates Summary Card */}
            <div className="bg-white rounded-3xl border border-rural-border p-5 sm:p-6 shadow-rural-soft space-y-3">
              <div className="flex items-center space-x-2 text-rural-forest font-serif font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-rural-primary" />
                <span>Verified Farm Origin Coordinates</span>
              </div>
              <div className="space-y-2 text-xs font-sans text-rural-charcoal">
                <div className="p-3 rounded-2xl bg-rural-cream border border-rural-border flex justify-between items-center">
                  <span className="text-rural-muted">Origin Address:</span>
                  <span className="font-semibold text-rural-forest text-right truncate max-w-[60%]">
                    {farmerLocation.formattedAddress}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-rural-cream border border-rural-border flex justify-between items-center">
                  <span className="text-rural-muted">GPS Coordinates:</span>
                  <span className="font-mono text-rural-forest font-medium">
                    {farmerLocation.latitude.toFixed(4)}° N, {farmerLocation.longitude.toFixed(4)}° E
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-rural-sage/60 border border-rural-border text-rural-forest flex items-start space-x-2">
                  <Compass className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    Turn-by-turn road driving distance to each APMC mandi is calculated from this exact farm gate location.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Interactive Regional Mandi Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-rural-border p-5 sm:p-6 shadow-rural-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-rural-border/70 gap-2 mb-4">
                <div>
                  <h4 className="font-serif font-bold text-base text-rural-forest">
                    Regional APMC Mandi Network Map
                  </h4>
                  <p className="text-xs text-rural-muted font-sans mt-0.5">
                    Click any mandi pin on the map to inspect road corridors and distances.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <span className="inline-flex items-center space-x-1 text-rural-forest bg-rural-mint px-2 py-0.5 rounded-full border border-rural-fresh/30">
                    <span className="w-2 h-2 rounded-full bg-rural-fresh" />
                    <span>Farm Gate</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>APMC Mandi</span>
                  </span>
                </div>
              </div>

              <MarketLocationMap
                farmerLocation={farmerLocation}
                evaluations={evaluations}
                recommendedMarket={recommendedMarket}
                onSelectMarket={onSelectBreakdown}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Navigation Buttons Footer */}
      <div className="flex items-center justify-end pt-4 border-t border-rural-border/70">
        <button
          type="button"
          onClick={handleNextWithValidation}
          className="inline-flex items-center space-x-2 px-7 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span>Continue to Step 2: Loss, Logistics & Market Discovery</span>
          <ArrowRight className="w-4 h-4 text-rural-fresh" />
        </button>
      </div>
    </div>
  );
};
