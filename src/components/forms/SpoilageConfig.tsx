import React from 'react';
import {
  SpoilageInputs,
  CropProfile,
  TemperatureScenario,
  VehicleProtection,
  HandlingQuality,
} from '../../types/agriculture';
import { calculateSpoilagePercentage } from '../../engine/spoilage';
import { Thermometer, Truck, Wind, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

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
  // Real-time estimated baseline spoilage for the selected conditions (e.g., typical 2.5h regional haul)
  const currentSpoilageCalc = calculateSpoilagePercentage(
    crop,
    spoilage,
    2.5,
    spoilage.delayHours,
    'optimal'
  );

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6 h-full flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-rural-border/70 pb-3 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
              <Thermometer className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-rural-forest">
                1. Expected Produce Loss
              </h2>
              <p className="text-xs text-rural-muted">
                Deterioration factors during transit for {crop.name}
              </p>
            </div>
          </div>

          {/* Mode Selector Toggle */}
          <div className="inline-flex rounded-full border border-rural-border p-1 bg-rural-cream self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => onChange({ mode: 'automatic' })}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                spoilage.mode === 'automatic'
                  ? 'bg-rural-forest text-white shadow-sm'
                  : 'text-rural-muted hover:text-rural-forest'
              }`}
            >
              Automatic Model
            </button>
            <button
              type="button"
              onClick={() => onChange({ mode: 'manual' })}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                spoilage.mode === 'manual'
                  ? 'bg-rural-forest text-white shadow-sm'
                  : 'text-rural-muted hover:text-rural-forest'
              }`}
            >
              Enter My Own %
            </button>
          </div>
        </div>

        {/* Form Body */}
        {spoilage.mode === 'manual' ? (
          <div className="bg-rural-cream rounded-2xl p-4.5 border border-rural-border space-y-3">
            <label className="block text-xs font-semibold text-rural-charcoal">
              Fixed Expected Produce Loss Percentage
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
            <p className="text-xs text-rural-muted leading-relaxed">
              This exact loss fraction is deducted across destinations without adding weather or delay multipliers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balanced 2x2 Factor Grid on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Factor 1: Ambient Weather */}
              <div className="bg-rural-cream/60 p-3 rounded-2xl border border-rural-border/70 space-y-1">
                <label className="block text-xs font-semibold text-rural-charcoal flex items-center space-x-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-700" />
                  <span>Weather Temperature</span>
                </label>
                <select
                  value={spoilage.temperature}
                  onChange={(e) => onChange({ temperature: e.target.value as TemperatureScenario })}
                  className="w-full text-xs bg-white border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh cursor-pointer"
                >
                  <option value="mild">Mild Climate (&lt;24°C)</option>
                  <option value="warm">Warm Seasonal (25°C–34°C)</option>
                  <option value="hot">Hot Afternoon / Summer (&gt;35°C)</option>
                </select>
                <p className="text-[10px] text-rural-muted">
                  Warm air accelerates respiration & weight reduction.
                </p>
              </div>

              {/* Factor 2: Vehicle Protection */}
              <div className="bg-rural-cream/60 p-3 rounded-2xl border border-rural-border/70 space-y-1">
                <label className="block text-xs font-semibold text-rural-charcoal flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-rural-primary" />
                  <span>Vehicle Covering</span>
                </label>
                <select
                  value={spoilage.vehicleProtection}
                  onChange={(e) => onChange({ vehicleProtection: e.target.value as VehicleProtection })}
                  className="w-full text-xs bg-white border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh cursor-pointer"
                >
                  <option value="open">Open Vehicle / Sun & Wind</option>
                  <option value="tarp_covered">Tarpaulin Shade Cover</option>
                  <option value="ventilated_crate">Crated with Airflow</option>
                  <option value="reefer_insulated">Insulated / Cool Van</option>
                </select>
                <p className="text-[10px] text-rural-muted">
                  Tarpaulin shields direct solar heat & wind burn.
                </p>
              </div>

              {/* Factor 3: Handling & Packaging */}
              <div className="bg-rural-cream/60 p-3 rounded-2xl border border-rural-border/70 space-y-1">
                <label className="block text-xs font-semibold text-rural-charcoal flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-rural-primary" />
                  <span>Packaging & Handling</span>
                </label>
                <select
                  value={spoilage.handling}
                  onChange={(e) => onChange({ handling: e.target.value as HandlingQuality })}
                  className="w-full text-xs bg-white border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh cursor-pointer"
                >
                  <option value="gentle">Plastic Crates / Gentle Cushion</option>
                  <option value="standard">Standard Gunny Bags / Crates</option>
                  <option value="rough">Bulk Loose Loaded / Rough</option>
                </select>
                <p className="text-[10px] text-rural-muted">
                  Rigid crates prevent compression crushing in transit.
                </p>
              </div>

              {/* Factor 4: Market Wait Time */}
              <div className="bg-rural-cream/60 p-3 rounded-2xl border border-rural-border/70 space-y-1">
                <label className="block text-xs font-semibold text-rural-charcoal flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-rural-primary" />
                  <span>Yard Entry & Wait Time</span>
                </label>
                <select
                  value={spoilage.delayHours}
                  onChange={(e) => onChange({ delayHours: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-xs bg-white border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-medium focus:ring-2 focus:ring-rural-fresh cursor-pointer"
                >
                  <option value="0">Immediate Auction Entry</option>
                  <option value="1">1 Hour Gate Queue</option>
                  <option value="2">2 Hours Peak Mandi Queue</option>
                  <option value="4">4+ Hours Long Yard Stoppage</option>
                </select>
                <p className="text-[10px] text-rural-muted">
                  Extended waiting in unshaded yards increases wilting.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transit Preservation & Spoilage Impact Panel (Balances height with TransportConfigForm) */}
      <div className="pt-3 border-t border-rural-border/70 space-y-2.5">
        <div className="bg-rural-sage/60 rounded-2xl p-3.5 border border-rural-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rural-forest block">
                Estimated Transit Loss Rate for {crop.name}
              </span>
              <span className="text-[10px] text-rural-muted">
                Perishability Class {crop.perishabilityClass} • Base deterioration {crop.baseDeteriorationRatePerHour}% / hr
              </span>
            </div>
          </div>

          <div className="text-right self-start sm:self-auto">
            <span className="text-sm font-bold text-emerald-900 font-mono">
              ~{currentSpoilageCalc.lossPercentage.toFixed(1)}% Estimated Loss
            </span>
            <span className="text-[10px] text-emerald-800 block">
              Deducted dynamically per mandi
            </span>
          </div>
        </div>

        <div className="p-3 bg-rural-cream rounded-xl border border-rural-border/70 text-[11px] text-rural-muted flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-rural-forest font-semibold">Preservation Rule: </strong>
            Loss percentage is computed turn-by-turn based on exact OSRM driving hours to each market. Shorter distances preserve more saleable quintals.
          </p>
        </div>
      </div>
    </div>
  );
};
