import React from 'react';
import { FarmerInputs, QuantityUnit, MaturityFreshness } from '../../types/agriculture';
import { convertToQuintals } from '../../engine/units';
import { Scale, MapPin, Calendar, Clock } from 'lucide-react';

interface HarvestDetailsProps {
  inputs: FarmerInputs;
  onChange: (updates: Partial<FarmerInputs>) => void;
  error?: string;
}

export const HarvestDetails: React.FC<HarvestDetailsProps> = ({ inputs, onChange, error }) => {
  const quintals = convertToQuintals(inputs.quantity, inputs.quantityUnit);
  const inKg = quintals * 100;
  const inTonnes = quintals / 10;

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            2. Harvest Details
          </h2>
        </div>
        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
          Standardized: {quintals.toFixed(1)} Quintals
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Quantity and Unit in linked group */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Total Harvested Quantity
          </label>
          <div className="flex rounded-lg shadow-sm">
            <input
              type="number"
              min="0.1"
              step="any"
              value={inputs.quantity || ''}
              onChange={(e) => onChange({ quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
              placeholder="e.g. 20"
              className={`w-full text-sm bg-warmbg-50 border ${
                error ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-emerald-600'
              } rounded-l-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 font-medium`}
            />
            <select
              value={inputs.quantityUnit}
              onChange={(e) => onChange({ quantityUnit: e.target.value as QuantityUnit })}
              className="bg-stone-100 border border-l-0 border-stone-300 rounded-r-lg px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="quintal">Quintals (100 kg)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="tonne">Metric Tonnes (1,000 kg)</option>
            </select>
          </div>
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          <div className="mt-1 flex items-center space-x-2 text-[11px] text-stone-500">
            <span>Equivalent:</span>
            <span className="font-medium text-stone-700">{inKg.toLocaleString('en-IN')} kg</span>
            <span>•</span>
            <span className="font-medium text-stone-700">{inTonnes.toFixed(2)} Tonnes</span>
          </div>
        </div>

        {/* Maturity / Freshness Level */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Harvest Freshness / Maturity
          </label>
          <select
            value={inputs.maturity}
            onChange={(e) => onChange({ maturity: e.target.value as MaturityFreshness })}
            className="w-full text-sm bg-warmbg-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          >
            <option value="early">Early / Semi-Ripe (Firm)</option>
            <option value="optimal">Optimal / Peak Freshness</option>
            <option value="ripe">Fully Ripe / Immediate Sale</option>
            <option value="overripe">Overripe / Distress Sale</option>
            <option value="dry_stored">Cured / Dry Stored (Grains)</option>
          </select>
          <p className="text-[10px] text-stone-500 mt-1">
            Affects sensitivity to vibration and temperature during road transit.
          </p>
        </div>

        {/* Origin Location */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span>Farm Gate Origin / Village Location</span>
          </label>
          <input
            type="text"
            value={inputs.originLocation}
            onChange={(e) => onChange({ originLocation: e.target.value })}
            placeholder="e.g. Navalgund Farm Gate, Hubli Cluster"
            className="w-full text-sm bg-warmbg-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>

        {/* Harvest Date */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Dispatch / Harvest Date</span>
          </label>
          <input
            type="date"
            value={inputs.harvestDate}
            onChange={(e) => onChange({ harvestDate: e.target.value })}
            className="w-full text-sm bg-warmbg-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>
      </div>
    </div>
  );
};

