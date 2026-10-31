import React from 'react';
import { CropProfile } from '../../types/agriculture';
import { CORE_CROPS } from '../../data/crops';
import { resolveCropMarketReferencePrice } from '../../engine/gradePricing';
import { Sprout, Info, TrendingUp, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface CropSelectorProps {
  selectedCrop: CropProfile;
  onCropChange: (crop: CropProfile) => void;
  referencePrice?: number;
  isCached?: boolean;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onCropChange,
  referencePrice,
  isCached,
}) => {
  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = CORE_CROPS.find((c) => c.id === e.target.value);
    if (found) {
      onCropChange(found);
    }
  };

  const currentPriceInfo = resolveCropMarketReferencePrice(selectedCrop);
  const displayPrice = referencePrice ?? currentPriceInfo.price;
  const displayCached = isCached ?? currentPriceInfo.isCached;

  const getPerishabilityBadge = (pClass: number) => {
    switch (pClass) {
      case 1:
        return {
          label: 'Class 1: Highly Perishable',
          badgeClass: 'bg-rose-100/80 text-rose-800 border-rose-300',
          desc: 'High sensitivity to transit heat, delay, and road bumps.',
        };
      case 2:
        return {
          label: 'Class 2: Moderately Perishable',
          badgeClass: 'bg-amber-100/80 text-amber-800 border-amber-300',
          desc: 'Deterioration depends on maturity, temperature, and journey hours.',
        };
      case 3:
        return {
          label: 'Class 3: Semi-Perishable',
          badgeClass: 'bg-rural-mint text-rural-forest border-rural-fresh/40',
          desc: 'Durable skin/rind. Tolerates moderate transit if aerated.',
        };
      case 4:
      default:
        return {
          label: 'Class 4: Non-Perishable / Dry Produce',
          badgeClass: 'bg-blue-100/80 text-blue-800 border-blue-300',
          desc: 'Dry staple. Negligible transit loss when protected from moisture.',
        };
    }
  };

  const badgeInfo = getPerishabilityBadge(selectedCrop.perishabilityClass);

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rural-border/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Sprout className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-rural-forest">
              1. Select Your Crop
            </h2>
            <p className="text-xs text-rural-muted">
              Choose from the 10 supported national agricultural commodities
            </p>
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}
        >
          {badgeInfo.label}
        </span>
      </div>

      {/* Single Crop Selection Dropdown (Zero Category Dependency) */}
      <div className="space-y-3">
        <div>
          <label
            htmlFor="crop-select"
            className="block text-xs font-semibold text-rural-charcoal mb-1.5"
          >
            Select Your Crop
          </label>
          <select
            id="crop-select"
            value={selectedCrop.id}
            onChange={handleCropChange}
            className="w-full text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-forest focus:outline-none focus:ring-2 focus:ring-rural-fresh focus:border-rural-fresh font-semibold transition-all cursor-pointer"
          >
            {CORE_CROPS.map((crop) => {
              const cropPrice = resolveCropMarketReferencePrice(crop);
              return (
                <option key={crop.id} value={crop.id}>
                  {crop.name} — Current Reference: ₹{cropPrice.price.toLocaleString('en-IN')}/Qtl (Typical ₹{crop.typicalMarketPriceRange.min.toLocaleString('en-IN')} – ₹{crop.typicalMarketPriceRange.max.toLocaleString('en-IN')})
                </option>
              );
            })}
          </select>
        </div>

        {/* Current Live/Cached Market Reference Rate Banner */}
        <div className="p-3.5 rounded-2xl bg-rural-sage/50 border border-rural-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-rural-forest block">
                Current Market Reference Price for {selectedCrop.name}
              </span>
              <span className="text-[10px] text-rural-muted">
                {currentPriceInfo.source}
                {currentPriceInfo.arrivalDate ? ` • ${currentPriceInfo.arrivalDate}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-base font-bold text-emerald-900 font-serif">
              {formatINR(displayPrice)} / Qtl
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                displayCached
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {displayCached ? 'CACHED APMC' : 'LIVE AGMARKNET'}
            </span>
          </div>
        </div>
      </div>

      {/* Description & Agronomic Parameters Banner */}
      <div className="p-3 rounded-xl bg-rural-cream border border-rural-border/70 text-xs text-rural-charcoal flex items-start space-x-2">
        <Info className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-rural-forest">
            {selectedCrop.name}: {selectedCrop.description}
          </p>
          <p className="text-[11px] text-rural-muted mt-0.5">
            {badgeInfo.desc} Storage: {selectedCrop.storageNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
