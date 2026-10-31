import React from 'react';
import { FarmerLocation, DynamicMandiEvaluation } from '../../../types/marketDiscovery';
import { LocationSelector } from '../../forms/LocationSelector';
import { MarketLocationMap } from '../../markets/MarketLocationMap';
import { MapPin, ArrowRight, ArrowLeft, Compass, Info, ShieldCheck } from 'lucide-react';

interface Step3LocationProps {
  farmerLocation: FarmerLocation;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  onLocationChange: (loc: FarmerLocation) => void;
  onSelectBreakdown?: (mandi: DynamicMandiEvaluation) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Location: React.FC<Step3LocationProps> = ({
  farmerLocation,
  evaluations,
  recommendedMarket,
  onLocationChange,
  onSelectBreakdown,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  Step 3 of 6
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">Geospatial Routing Origin</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                Farm Location & Regional Mandi Map
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                Pinpoint your farm gate origin using device GPS or state/district selection to compute real driving mileage.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>Next: Loss & Logistics</span>
              <ArrowRight className="w-4 h-4 text-rural-fresh" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Location Selection Form */}
        <div className="lg:col-span-5 space-y-6">
          <LocationSelector
            currentLocation={farmerLocation}
            onLocationChange={onLocationChange}
          />

          {/* Location Verification Summary Card */}
          <div className="bg-white rounded-3xl border border-rural-border p-6 shadow-rural-soft space-y-3">
            <div className="flex items-center space-x-2 text-rural-forest font-serif font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-rural-primary" />
              <span>Verified Farm Coordinates</span>
            </div>
            <div className="space-y-2 text-xs font-sans text-rural-charcoal">
              <div className="p-3 rounded-2xl bg-rural-cream border border-rural-border flex justify-between items-center">
                <span className="text-rural-muted">Origin Address:</span>
                <span className="font-semibold text-rural-forest text-right truncate max-w-[60%]">
                  {farmerLocation.formattedAddress}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rural-cream border border-rural-border flex justify-between items-center">
                <span className="text-rural-muted">GPS Latitude & Longitude:</span>
                <span className="font-mono text-rural-forest font-medium">
                  {farmerLocation.latitude.toFixed(4)}° N, {farmerLocation.longitude.toFixed(4)}° E
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rural-sage/60 border border-rural-border text-rural-forest flex items-start space-x-2">
                <Compass className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  OSRM routing calculates genuine road turn-by-turn driving distances from this point to each APMC mandi yard.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Regional Mandi Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-rural-border p-5 sm:p-6 shadow-rural-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rural-border/70 gap-2 mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-rural-forest">
                  Discovered APMC Mandi Network
                </h3>
                <p className="text-xs text-rural-muted font-sans mt-0.5">
                  Click any market pin to inspect road corridor and distance.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-medium">
                <span className="inline-flex items-center space-x-1 text-rural-forest bg-rural-mint px-2.5 py-0.5 rounded-full border border-rural-fresh/30">
                  <span className="w-2 h-2 rounded-full bg-rural-fresh" />
                  <span>Farm Origin</span>
                </span>
                <span className="inline-flex items-center space-x-1 text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>APMC Yard</span>
                </span>
              </div>
            </div>

            {/* SVG Interactive Map */}
            <MarketLocationMap
              farmerLocation={farmerLocation}
              evaluations={evaluations}
              recommendedMarket={recommendedMarket}
              onSelectMarket={onSelectBreakdown}
            />
          </div>
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
          <span>Back to Crop Details</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span>Continue to Harvest Loss & Logistics</span>
          <ArrowRight className="w-4 h-4 text-rural-fresh" />
        </button>
      </div>
    </div>
  );
};

