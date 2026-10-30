import React from 'react';
import { FarmerInputs, QuantityUnit, MaturityFreshness } from '../../types/agriculture';
import { convertToQuintals } from '../../engine/units';
import { Scale, MapPin, Calendar, Tag } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface HarvestDetailsProps {
  inputs: FarmerInputs;
  onChange: (updates: Partial<FarmerInputs>) => void;
  error?: string;
  typicalPriceMin?: number;
  typicalPriceMax?: number;
}

export const HarvestDetails: React.FC<HarvestDetailsProps> = ({
  inputs,
  onChange,
  error,
  typicalPriceMin = 1400,
  typicalPriceMax = 3200,
}) => {
  const quintals = convertToQuintals(inputs.quantity, inputs.quantityUnit);
  const inKg = quintals * 100;
  const inTonnes = quintals / 10;

  const currentPrice = inputs.expectedPricePerQuintal ?? Math.round((typicalPriceMin + typicalPriceMax) / 2);

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 border-b border-rural-border/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Scale className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-serif font-bold text-rural-forest">
            2. Harvest Details
          </h2>
        </div>
        <div className="text-xs font-semibold text-rural-forest bg-rural-mint/80 px-3 py-0.5 rounded-full border border-rural-fresh/30">
          Total: {quintals.toFixed(1)} Quintals
        </div>
      </div>

      <div className="space-y-4">
        {/* Quantity & Expected Price in 2 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quantity and Unit */}
          <div>
            <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
              Total Harvest Quantity
            </label>
            <div className="flex rounded-xl shadow-sm overflow-hidden border border-rural-border bg-rural-cream focus-within:ring-2 focus-within:ring-rural-fresh">
              <input
                type="number"
                min="0.1"
                step="any"
                value={inputs.quantity || ''}
                onChange={(e) => onChange({ quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
                placeholder="e.g. 20"
                className={`w-full text-sm bg-transparent px-3.5 py-2.5 text-rural-charcoal focus:outline-none font-semibold ${
                  error ? 'text-rose-700' : ''
                }`}
              />
              <select
                value={inputs.quantityUnit}
                onChange={(e) => onChange({ quantityUnit: e.target.value as QuantityUnit })}
                className="bg-rural-sage border-l border-rural-border px-3 py-2.5 text-xs font-semibold text-rural-forest focus:outline-none"
              >
                <option value="quintal">Quintals (100 kg)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="tonne">Metric Tonnes</option>
              </select>
            </div>
            {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
            <div className="mt-1.5 flex items-center space-x-2 text-[11px] text-rural-muted font-medium">
              <span>{inKg.toLocaleString('en-IN')} kg</span>
              <span>•</span>
              <span>{inTonnes.toFixed(2)} Tonnes</span>
            </div>
          </div>

          {/* Expected Selling Price per Quintal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-rural-charcoal">
                Expected Price per Quintal
              </label>
              <button
                type="button"
                onClick={() => onChange({ expectedPricePerQuintal: Math.round((typicalPriceMin + typicalPriceMax) / 2) })}
                className="text-[10px] text-rural-primary hover:underline font-medium"
              >
                Reset (₹{Math.round((typicalPriceMin + typicalPriceMax) / 2)})
              </button>
            </div>
            <div className="relative rounded-xl shadow-sm border border-rural-border bg-rural-cream focus-within:ring-2 focus-within:ring-rural-fresh">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rural-muted font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                min="1"
                step="50"
                value={currentPrice || ''}
                onChange={(e) => onChange({ expectedPricePerQuintal: Math.max(0, parseFloat(e.target.value) || 0) })}
                placeholder="e.g. 2400"
                className="w-full text-sm bg-transparent pl-8 pr-3.5 py-2.5 text-rural-charcoal focus:outline-none font-bold"
              />
            </div>
            <div className="mt-1.5 text-[11px] text-rural-muted">
              Typical: {formatINR(typicalPriceMin)} – {formatINR(typicalPriceMax)} / Qtl
            </div>
          </div>
        </div>

        {/* Origin Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-rural-charcoal mb-1.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rural-primary" />
              <span>Farm Gate / Village Location</span>
            </label>
            <input
              type="text"
              value={inputs.originLocation}
              onChange={(e) => onChange({ originLocation: e.target.value })}
              placeholder="e.g. Navalgund Farm Gate, Dharwad Hub"
              className="w-full text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rural-charcoal mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-rural-primary" />
              <span>Harvest Date</span>
            </label>
            <input
              type="date"
              value={inputs.harvestDate}
              onChange={(e) => onChange({ harvestDate: e.target.value })}
              className="w-full text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-medium"
            />
          </div>
        </div>

        {/* Freshness / Maturity Level */}
        <div>
          <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
            Produce Freshness at Dispatch
          </label>
          <select
            value={inputs.maturity}
            onChange={(e) => onChange({ maturity: e.target.value as MaturityFreshness })}
            className="w-full text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-medium"
          >
            <option value="early">Early / Semi-Ripe (Firm skin, handles long transit well)</option>
            <option value="optimal">Optimal / Peak Freshness (Best market realization)</option>
            <option value="ripe">Fully Ripe / Immediate Sale (More sensitive to transit delay)</option>
            <option value="overripe">Overripe / Distress Sale (Immediate local mandi advised)</option>
            <option value="dry_stored">Cured / Dry Stored (Non-perishable grain)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
