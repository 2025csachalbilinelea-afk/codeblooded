import React from 'react';
import { CropCategory, CropProfile } from '../../types/agriculture';
import { CROP_CATEGORIES, CROP_PROFILES, getCropsByCategory } from '../../data/crops';
import { Sprout, AlertCircle, Info, ShieldAlert, Sparkles } from 'lucide-react';

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
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          desc: 'High sensitivity to transit heat, delay, and mechanical impact.',
        };
      case 2:
        return {
          label: 'Class 2: Moderately Perishable',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          desc: 'Deterioration depends on maturity, temperature, and journey hours.',
        };
      case 3:
        return {
          label: 'Class 3: Semi-Perishable',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          desc: 'Durable skin/rind. Tolerates moderate transit if aerated and unbruised.',
        };
      case 4:
      default:
        return {
          label: 'Class 4: Non-Perishable / Dry Produce',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
          desc: 'Dry staple. Negligible transit spoilage when protected from moisture.',
        };
    }
  };

  const badgeInfo = getPerishabilityBadge(selectedCrop.perishabilityClass);

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            1. Crop Selection & Profile
          </h2>
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}
        >
          {badgeInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Category Dropdown */}
        <div>
          <label htmlFor="crop-category" className="block text-xs font-semibold text-stone-700 mb-1">
            Produce Category
          </label>
          <select
            id="crop-category"
            value={currentCategory}
            onChange={handleCategoryChange}
            className="w-full text-sm bg-warmbg-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-medium"
          >
            {CROP_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Crop Name */}
        <div>
          <label htmlFor="crop-name" className="block text-xs font-semibold text-stone-700 mb-1">
            Crop Variety / Name
          </label>
          <select
            id="crop-name"
            value={selectedCrop.id}
            onChange={handleCropChange}
            className="w-full text-sm bg-warmbg-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-medium"
          >
            {cropsInCurrentCategory.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Crop Profile Card */}
      <div className="mt-3.5 bg-stone-50 rounded-lg p-3 border border-stone-200/70 text-xs text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="font-semibold text-stone-800 flex items-center space-x-1.5">
            <span>{selectedCrop.name}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 font-normal">{selectedCrop.description}</span>
          </div>
          <p className="text-[11px] text-stone-500">
            <strong className="text-stone-700 font-medium">Logistics Advisory:</strong>{' '}
            {selectedCrop.storageNotes}
          </p>
        </div>
        <div className="shrink-0 text-right bg-white px-2.5 py-1 rounded border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Baseline Benchmark</span>
          <span className="font-semibold text-emerald-800 text-xs">
            ₹{selectedCrop.typicalMarketPriceRange.min.toLocaleString('en-IN')} – ₹
            {selectedCrop.typicalMarketPriceRange.max.toLocaleString('en-IN')}{' '}
            <span className="text-[10px] text-stone-500 font-normal">/ Qtl</span>
          </span>
        </div>
      </div>
    </div>
  );
};

