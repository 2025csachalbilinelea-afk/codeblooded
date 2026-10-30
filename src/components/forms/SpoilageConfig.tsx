import React from 'react';
import {
  SpoilageInputs,
  CropProfile,
  TemperatureScenario,
  VehicleProtection,
  HandlingQuality,
} from '../../types/agriculture';
import { Thermometer, Truck, Wind, Clock, ShieldAlert } from 'lucide-react';

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
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-rural-border/70 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Thermometer className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-rural-forest">
              3. Expected Produce Loss
            </h2>
            <p className="text-xs text-rural-muted">
              Some produce may soften, bruise, or wilt during road transit
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="inline-flex rounded-full border border-rural-border p-1 bg-rural-cream self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => onChange({ mode: 'automatic' })}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
              spoilage.mode === 'automatic'
                ? 'bg-rural-forest text-white shadow-sm'
                : 'text-rural-muted hover:text-rural-forest'
            }`}
          >
            Automatic Estimate
          </button>
          <button
            type="button"
            onClick={() => onChange({ mode: 'manual' })}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
              spoilage.mode === 'manual'
                ? 'bg-rural-forest text-white shadow-sm'
                : 'text-rural-muted hover:text-rural-forest'
            }`}
          >
            Enter My Own %
          </button>
        </div>
      </div>

      {spoilage.mode === 'manual' ? (
        <div className="bg-rural-cream rounded-2xl p-4 border border-rural-border">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
              Fixed Expected Produce Loss
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
                className="w-32 text-sm bg-white border border-rural-border rounded-xl px-3.5 py-2 text-rural-forest font-bold focus:outline-none focus:ring-2 focus:ring-rural-fresh"
              />
              <span className="text-sm font-semibold text-rural-charcoal">% of harvest</span>
            </div>
            {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
            <p className="text-xs text-rural-muted mt-2 leading-relaxed">
              This exact loss fraction is deducted across destinations without adding extra weather estimates.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Ambient Temperature */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1 flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-700" />
                <span>Weather</span>
              </label>
              <select
                value={spoilage.temperature}
                onChange={(e) => onChange({ temperature: e.target.value as TemperatureScenario })}
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="mild">Mild Climate (&lt;24°C)</option>
                <option value="warm">Warm Seasonal (25°C–34°C)</option>
                <option value="hot">Hot Afternoon / Summer (&gt;35°C)</option>
              </select>
            </div>

            {/* Vehicle Protection */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-rural-primary" />
                <span>Vehicle Covering</span>
              </label>
              <select
                value={spoilage.vehicleProtection}
                onChange={(e) => onChange({ vehicleProtection: e.target.value as VehicleProtection })}
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="open">Open Vehicle / Sun & Wind</option>
                <option value="tarp_covered">Tarpaulin Shade Cover</option>
                <option value="ventilated_crate">Crated with Airflow</option>
                <option value="reefer_insulated">Insulated / Cool Van</option>
              </select>
            </div>

            {/* Handling Quality */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1 flex items-center space-x-1">
                <Wind className="w-3.5 h-3.5 text-rural-primary" />
                <span>Handling / Crates</span>
              </label>
              <select
                value={spoilage.handling}
                onChange={(e) => onChange({ handling: e.target.value as HandlingQuality })}
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="gentle">Plastic Crates / Gentle Cushion</option>
                <option value="standard">Standard Gunny Bags / Crates</option>
                <option value="rough">Bulk Loose Loaded / Rough</option>
              </select>
            </div>

            {/* Market Gate Delay */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-rural-primary" />
                <span>Market Wait Time</span>
              </label>
              <select
                value={spoilage.delayHours}
                onChange={(e) => onChange({ delayHours: parseInt(e.target.value, 10) || 0 })}
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="0">Immediate Auction Entry</option>
                <option value="1">1 Hour Gate Queue</option>
                <option value="2">2 Hours Peak Mandi Queue</option>
                <option value="4">4+ Hours Long Yard Stoppage</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-rural-sage/60 rounded-xl border border-rural-border text-[11px] text-rural-muted flex items-center space-x-2">
            <span className="font-semibold text-rural-forest">How it calculates:</span>
            <span>
              Longer transit distances and higher heat increase expected produce loss naturally.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
