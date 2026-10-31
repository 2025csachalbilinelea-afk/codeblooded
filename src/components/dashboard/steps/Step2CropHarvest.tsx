import React from 'react';
import { CropProfile, FarmerInputs } from '../../../types/agriculture';
import { CropSelector } from '../../forms/CropSelector';
import { HarvestDetails } from '../../forms/HarvestDetails';
import { Sprout, ArrowRight, ArrowLeft, Info, Calendar, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../../utils/currency';

interface Step2CropHarvestProps {
  currentCrop: CropProfile;
  inputs: FarmerInputs;
  onCropChange: (crop: CropProfile) => void;
  onInputsChange: (updates: Partial<FarmerInputs>) => void;
  quantityError?: string;
  onNext: () => void;
  onBack: () => void;
}

export const Step2CropHarvest: React.FC<Step2CropHarvestProps> = ({
  currentCrop,
  inputs,
  onCropChange,
  onInputsChange,
  quantityError,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm shrink-0">
              <Sprout className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  Step 2 of 6
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">Produce Identification</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                Crop & Harvest Details
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                Specify what you have harvested, how much volume you wish to sell, and the freshness at dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>Next: Farm Location</span>
              <ArrowRight className="w-4 h-4 text-rural-fresh" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Forms and Context Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Crop Selector Component */}
          <CropSelector
            selectedCrop={currentCrop}
            onCropChange={onCropChange}
          />

          {/* Harvest Details (Volume, Unit, Village, Date, Freshness) */}
          <HarvestDetails
            inputs={inputs}
            onChange={(updates) => onInputsChange(updates)}
            error={quantityError}
          />
        </div>

        {/* Right Column: Agronomic & Perishability Spotlight Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-rural-border p-6 shadow-rural-soft">
            <h3 className="font-serif font-bold text-lg text-rural-forest mb-4 flex items-center space-x-2">
              <Info className="w-5 h-5 text-rural-primary" />
              <span>Agronomic Profile</span>
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-rural-sage/60 border border-rural-border/80">
                <span className="text-[10px] uppercase font-bold text-rural-muted block">Selected Commodity</span>
                <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">{currentCrop.name}</span>
                <span className="text-rural-muted block capitalize mt-0.5">Category: {currentCrop.category}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rural-cream border border-rural-border">
                <span className="text-[10px] uppercase font-bold text-rural-muted block">Standard Historical Price Range</span>
                <div className="text-sm font-bold text-emerald-800 mt-0.5">
                  {formatINR(currentCrop.typicalMarketPriceRange.min)} – {formatINR(currentCrop.typicalMarketPriceRange.max)} / Qtl
                </div>
                <span className="text-[11px] text-rural-muted mt-0.5 block leading-relaxed">
                  Daily market rates will be queried live from AGMARKNET mandis.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rural-cream border border-rural-border">
                <span className="text-[10px] uppercase font-bold text-rural-muted block">Post-Harvest Handling & Notes</span>
                <p className="text-rural-charcoal mt-1 text-[11px] leading-relaxed">
                  {currentCrop.storageNotes || currentCrop.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rural-mint/30 border border-rural-fresh/30 text-rural-forest flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed font-medium">
                  Produce loss in transit is automatically computed based on this crop's perishability class and road duration.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-rural-border/70">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-rural-cream text-rural-charcoal border border-rural-border font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span>Continue to Farm Location & Mandi Discovery</span>
          <ArrowRight className="w-4 h-4 text-rural-fresh" />
        </button>
      </div>
    </div>
  );
};

