import React from 'react';
import {
  SpoilageInputs,
  CropProfile,
  TemperatureScenario,
  VehicleProtection,
  HandlingQuality,
} from '../../types/agriculture';
import { Thermometer, Truck, Wind, Clock, Hourglass } from 'lucide-react';

interface SpoilageConfigProps {
  spoilage: SpoilageInputs;
  crop: CropProfile;
  onChange: (updates: Partial<SpoilageInputs>) => void;
  error?: string;
}

export const SpoilageConfigForm: React.FC<SpoilageConfigProps> = ({
  spoilage,
  crop,
  onChange,
  error,
}) => {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-stone-100 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Thermometer className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            5. Crop Lost on the Way (Spoilage)
          </h2>
        </div>

        {/* Mode Selector Toggle */}
        <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChange({ mode: 'automatic' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              spoilage.mode === 'automatic'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Automatic Estimate
          </button>
          <button
            type="button"
            onClick={() => onChange({ mode: 'manual' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              spoilage.mode === 'manual'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Enter My Own %
          </button>
        </div>
      </div>

      {spoilage.mode === 'manual' ? (
        <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fixed Expected Physical Loss / Spoilage
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={spoilage.manualPercentage}
                onChange={(e) =>
                  onChange({ manualPercentage: parseFloat(e.target.value) || 0 })
                }
                className="w-32 text-sm bg-white border border-stone-300 rounded px-3 py-1.5 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-sm font-semibold text-stone-700">% of Harvest</span>
            </div>
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
            <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
              Your entered value is applied as the expected physical-loss fraction across destinations without adding automatic estimates on top.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Ambient Temperature */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
                <Thermometer className="w-3 h-3 text-amber-600" />
                <span>Ambient Weather</span>
              </label>
              <select
                value={spoilage.temperature}
                onChange={(e) => onChange({ temperature: e.target.value as TemperatureScenario })}
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-600"
              >
                <option value="mild">Mild Climate (&lt;24°C)</option>
                <option value="warm">Warm Seasonal (25°C–34°C)</option>
                <option value="hot">Hot Afternoon / Summer (&gt;35°C)</option>
              </select>
            </div>

            {/* Vehicle Protection */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
                <Truck className="w-3 h-3 text-emerald-600" />
                <span>Transit Protection</span>
              </label>
              <select
                value={spoilage.vehicleProtection}
                onChange={(e) => onChange({ vehicleProtection: e.target.value as VehicleProtection })}
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-600"
              >
                <option value="open">Open Vehicle / Sun & Wind</option>
                <option value="covered">Covered / Tarpaulin Shielded</option>
                <option value="refrigerated">Refrigerated Reefer (&lt;10°C)</option>
              </select>
            </div>

            {/* Handling Quality */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
                <Wind className="w-3 h-3 text-stone-600" />
                <span>Crate & Handling</span>
              </label>
              <select
                value={spoilage.handling}
                onChange={(e) => onChange({ handling: e.target.value as HandlingQuality })}
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-600"
              >
                <option value="gentle">Cushioned Plastic Crates</option>
                <option value="standard">Standard Gunny Sacks</option>
                <option value="rough">Rough Stacking / Unpaved</option>
              </select>
            </div>

            {/* Farm-Gate Holding Delay */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
                <Hourglass className="w-3 h-3 text-stone-500" />
                <span>Farm-Gate Delay (Hours)</span>
              </label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={spoilage.delayHours || 0}
                onChange={(e) => onChange({ delayHours: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 font-semibold focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 rounded-lg px-3 py-2 border border-stone-200/70 text-xs text-stone-600 gap-1">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Base Deterioration Rate:</span>
              <strong className="text-stone-800 font-semibold">
                {crop.baseDeteriorationRatePerHour}% / hr
              </strong>
              <span className="text-stone-400">•</span>
              <span>Calculated destination-specifically from travel duration, mandi wait time, and environmental factors.</span>
            </span>
            <span className="text-[10px] text-stone-400 shrink-0 italic">
              Simulation estimates only
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
