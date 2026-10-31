import React from 'react';
import { CropProfile, FarmerInputs, SpoilageInputs, TransportConfig } from '../../../types/agriculture';
import { SpoilageConfigForm } from '../../forms/SpoilageConfig';
import { TransportConfigForm } from '../../forms/TransportConfig';
import { Truck, ArrowRight, ArrowLeft, Thermometer, ShieldCheck, Info } from 'lucide-react';
import { formatINR } from '../../../utils/currency';

interface Step4LogisticsProps {
  currentCrop: CropProfile;
  totalQuintals: number;
  inputs: FarmerInputs;
  onUpdateSpoilage: (updates: Partial<SpoilageInputs>) => void;
  onUpdateTransport: (updates: Partial<TransportConfig>) => void;
  validationErrors?: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Logistics: React.FC<Step4LogisticsProps> = ({
  currentCrop,
  totalQuintals,
  inputs,
  onUpdateSpoilage,
  onUpdateTransport,
  validationErrors = {},
  onNext,
  onBack,
}) => {
  const isOwn = inputs.transport.type === 'own';
  const vehicleCap = isOwn
    ? inputs.transport.ownVehicle.capacityQuintals
    : inputs.transport.rentedVehicle.capacityQuintals;
  const tripsNeeded = Math.max(1, Math.ceil(totalQuintals / Math.max(0.1, vehicleCap)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm shrink-0">
              <Truck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  Step 4 of 6
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">Logistics & Transit Economics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                Harvest Loss & Transportation Logistics
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                Configure your transport vehicle and transit conditions so the engine can accurately predict real expenses.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>Next: Live Mandi Intelligence</span>
              <ArrowRight className="w-4 h-4 text-rural-fresh" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Loss Settings & Transport Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Spoilage & Produce Loss Configuration */}
        <div className="lg:col-span-6 space-y-6">
          <SpoilageConfigForm
            spoilage={inputs.spoilage}
            crop={currentCrop}
            onChange={onUpdateSpoilage}
            error={validationErrors.spoilage}
          />
        </div>

        {/* Right Column: Vehicle & Transport Configuration */}
        <div className="lg:col-span-6 space-y-6">
          <TransportConfigForm
            transport={inputs.transport}
            totalQuintals={totalQuintals}
            onChange={onUpdateTransport}
            errors={validationErrors}
          />
        </div>
      </div>

      {/* Logistics & Capacity Summary Card */}
      <div className="bg-white rounded-3xl border border-rural-border p-6 shadow-rural-soft space-y-4 font-sans">
        <h3 className="font-serif font-bold text-lg text-rural-forest flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-rural-primary" />
          <span>Consignment Logistics Summary</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rural-cream border border-rural-border">
            <span className="text-[10px] uppercase font-bold text-rural-muted block">Harvest Consignment</span>
            <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">
              {totalQuintals.toFixed(1)} Quintals
            </span>
            <span className="text-[11px] text-rural-muted block mt-0.5">
              {(totalQuintals * 100).toLocaleString('en-IN')} kg of {currentCrop.name}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rural-cream border border-rural-border">
            <span className="text-[10px] uppercase font-bold text-rural-muted block">Selected Vehicle Mode</span>
            <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">
              {isOwn ? 'My Own Vehicle' : 'Rented Vehicle'}
            </span>
            <span className="text-[11px] text-rural-muted block mt-0.5">
              Capacity: {vehicleCap} Qtl per delivery trip
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rural-sage/60 border border-rural-border">
            <span className="text-[10px] uppercase font-bold text-rural-muted block">Vehicle Trip Sufficiency</span>
            <span className="font-serif font-bold text-base text-rural-forest block mt-0.5">
              {tripsNeeded} {tripsNeeded === 1 ? 'Trip Required' : 'Separate Trips Required'}
            </span>
            <span className="text-[11px] text-rural-muted block mt-0.5">
              {tripsNeeded === 1 ? 'Entire harvest fits in one journey' : 'Multi-trip fuel & driver wages accounted'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rural-mint/30 border border-rural-fresh/30 text-rural-forest text-xs flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed font-normal">
            <strong>How your costs are calculated:</strong> Transport expenses include actual two-way road fuel consumption, driver trip wages, toll charges, and vehicle wear based on genuine OSRM driving mileage. Produce loss is calculated according to your dispatch freshness, crate handling, and hours spent on the road.
          </p>
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
          <span>Back to Farm Location</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span>Continue to Live Mandi Intelligence</span>
          <ArrowRight className="w-4 h-4 text-rural-fresh" />
        </button>
      </div>
    </div>
  );
};

