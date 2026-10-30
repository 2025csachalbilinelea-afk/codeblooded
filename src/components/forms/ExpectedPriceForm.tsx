import React from 'react';
import { IndianRupee, Tag, Info } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { CropProfile } from '../../types/agriculture';

interface ExpectedPriceFormProps {
  pricePerQuintal: number;
  crop: CropProfile;
  onChange: (price: number) => void;
  error?: string;
}

export const ExpectedPriceForm: React.FC<ExpectedPriceFormProps> = ({
  pricePerQuintal,
  crop,
  onChange,
  error,
}) => {
  const defaultMidPrice = Math.round(
    (crop.typicalMarketPriceRange.min + crop.typicalMarketPriceRange.max) / 2
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) {
      onChange(0);
    } else {
      onChange(Math.max(0, val));
    }
  };

  const handleResetToDefault = () => {
    onChange(defaultMidPrice);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            3. Expected Selling Price
          </h2>
        </div>
        <button
          type="button"
          onClick={handleResetToDefault}
          className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200 transition-colors"
          title="Reset to usual market price for this crop"
        >
          Usual Price: {formatINR(defaultMidPrice)}
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">
          Price offered per quintal (₹)
        </label>
        <div className="relative rounded-lg shadow-sm max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500 font-bold">
            ₹
          </div>
          <input
            type="number"
            min="1"
            step="10"
            value={pricePerQuintal || ''}
            onChange={handlePriceChange}
            placeholder={`e.g. ${defaultMidPrice}`}
            className={`w-full text-sm bg-warmbg-50 border ${
              error ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-emerald-600'
            } rounded-lg pl-8 pr-24 py-2 text-stone-900 font-bold focus:outline-none focus:ring-2`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-stone-500 font-medium">
            per quintal
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          Enter the price a buyer is offering for one quintal of your crop.
        </p>

        <div className="mt-2.5 bg-stone-50 rounded-lg p-2.5 border border-stone-200/80 flex items-center justify-between text-[11px] text-stone-600">
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Normal market range for {crop.name}:</span>
          </div>
          <span className="font-semibold text-stone-800">
            {formatINR(crop.typicalMarketPriceRange.min)} – {formatINR(crop.typicalMarketPriceRange.max)} / Qtl
          </span>
        </div>
      </div>
    </div>
  );
};

