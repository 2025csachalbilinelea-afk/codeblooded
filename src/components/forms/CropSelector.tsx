import React from 'react';
import { CropCategory, CropProfile } from '../../types/agriculture';
import { CROP_CATEGORIES, CROP_PROFILES, getCropsByCategory } from '../../data/crops';
import { Sprout, Info } from 'lucide-react';

interface CropSelectorProps {
  selectedCrop: CropProfile;
  onCropChange: (crop: CropProfile) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({ selectedCrop, onCropChange }) => {
  const currentCategory = selectedCrop.category;
  const cropsInCurrentCategory = getCropsByCategory(currentCategory);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as CropCategory;
    const categoryCrops = getCropsByCategory(newCategory);
    if (categoryCrops.length > 0) {
      onCropChange(categoryCrops[0]);
    }
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = CROP_PROFILES.find((c) => c.id === e.target.value);
    if (found) {
      onCropChange(found);
    }
  };

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
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 border-b border-rural-border/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Sprout className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-serif font-bold text-rural-forest">
            1. Your Crop
          </h2>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}
        >
          {badgeInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Dropdown */}
        <div>
          <label htmlFor="crop-category" className="block text-xs font-semibold text-rural-charcoal mb-1.5">
            Produce Category
          </label>
          <select
            id="crop-category"
            value={currentCategory}
            onChange={handleCategoryChange}
            className="w-full text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh focus:border-rural-fresh font-medium transition-all"
          >
            {CROP_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({cat.icon})
              </option>
            ))}
          </select>
        </div>

        {/* Crop Selection */}
        <div>
          <label htmlFor="crop-select" className="block text-xs font-semibold text-rural-charcoal mb-1.5">
            Select Crop / Produce
          </label>
          <select
            id="crop-select"
            value={selectedCrop.id}
            onChange={handleCropChange}
            className="w-full text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh focus:border-rural-fresh font-medium transition-all"
          >
            {cropsInCurrentCategory.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name} — Typical ₹{crop.typicalMarketPriceRange.min.toLocaleString('en-IN')} to ₹{crop.typicalMarketPriceRange.max.toLocaleString('en-IN')}/Qtl
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description & Agronomic Parameters Banner */}
      <div className="mt-4 p-3 rounded-xl bg-rural-sage/60 border border-rural-border/70 text-xs text-rural-charcoal flex items-start space-x-2">
        <Info className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-rural-forest">
            {selectedCrop.name}: {selectedCrop.description}
          </p>
          <p className="text-[11px] text-rural-muted mt-0.5">
            {badgeInfo.desc}
          </p>
        </div>
      </div>
    </div>
  );
};
