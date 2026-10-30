import React, { useState } from 'react';
import {
  FarmerLocation,
} from '../../types/marketDiscovery';
import {
  getBrowserLocation,
  reverseGeocodeCoordinates,
  resolveManualLocation,
  INDIAN_AGRI_DISTRICT_PRESETS,
} from '../../services/locationService';
import {
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  Compass,
  CheckCircle2,
  ChevronDown,
  Building2,
} from 'lucide-react';

interface LocationSelectorProps {
  currentLocation: FarmerLocation;
  onLocationChange: (loc: FarmerLocation) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onLocationChange,
}) => {
  const [activeTab, setActiveTab] = useState<'automatic' | 'manual'>('automatic');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Manual inputs state
  const [manualState, setManualState] = useState<string>(currentLocation.state || 'Karnataka');
  const [manualDistrict, setManualDistrict] = useState<string>(currentLocation.district || 'Dharwad');
  const [manualVillage, setManualVillage] = useState<string>(currentLocation.villageOrTown || 'Navalgund Farm Gate');
  const [manualPincode, setManualPincode] = useState<string>(currentLocation.pincode || '582208');

  // Handle Option A: Browser Geolocation API
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    const result = await getBrowserLocation();

    if ('error' in result) {
      setIsLocating(false);
      setLocationError(result.error.message);
      return;
    }

    try {
      const { latitude, longitude, accuracy } = result.coords;
      const geocoded = await reverseGeocodeCoordinates(latitude, longitude);

      const detectedLocation: FarmerLocation = {
        latitude,
        longitude,
        state: geocoded.state,
        district: geocoded.district,
        villageOrTown: geocoded.villageOrTown,
        pincode: geocoded.pincode,
        formattedAddress: geocoded.formattedAddress,
        method: 'gps',
        accuracyMeters: accuracy,
        timestamp: new Date().toISOString(),
      };

      setManualState(geocoded.state);
      setManualDistrict(geocoded.district);
      setManualVillage(geocoded.villageOrTown);
      if (geocoded.pincode) setManualPincode(geocoded.pincode);

      onLocationChange(detectedLocation);
    } catch {
      setLocationError('Could not resolve your street address. Please choose your district manually.');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle Option B: Manual resolution
  const handleApplyManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationError(null);

    const resolved = resolveManualLocation(
      manualState,
      manualDistrict,
      manualVillage,
      manualPincode
    );

    onLocationChange(resolved);
  };

  // Quick Preset select
  const handleSelectPreset = (preset: typeof INDIAN_AGRI_DISTRICT_PRESETS[0]) => {
    setManualState(preset.state);
    setManualDistrict(preset.district);
    setManualVillage(preset.town);
    setManualPincode(preset.pincode);

    const loc: FarmerLocation = {
      latitude: preset.latitude,
      longitude: preset.longitude,
      state: preset.state,
      district: preset.district,
      villageOrTown: preset.town,
      pincode: preset.pincode,
      formattedAddress: `${preset.town}, ${preset.district}, ${preset.state} (${preset.pincode})`,
      method: 'preset',
      timestamp: new Date().toISOString(),
    };
    onLocationChange(loc);
  };

  // Distinct Indian states from presets
  const availableStates = Array.from(new Set(INDIAN_AGRI_DISTRICT_PRESETS.map((p) => p.state))).sort();

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-rural-border/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <MapPin className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-rural-forest">
              Farm Location & Mandi Discovery
            </h2>
            <p className="text-[11px] text-rural-muted">
              Used to find real road distances and nearby APMC mandis across India
            </p>
          </div>
        </div>
        <div className="text-[11px] font-semibold text-rural-forest bg-rural-mint/80 px-2.5 py-1 rounded-full border border-rural-fresh/30">
          {currentLocation.method === 'gps' ? '📍 GPS Fixed' : '🗺️ District Mode'}
        </div>
      </div>

      {/* Current Detected Location Badge */}
      <div className="mb-4 p-3.5 rounded-2xl bg-rural-cream border border-rural-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-rural-forest">
              {currentLocation.formattedAddress}
            </div>
            <div className="text-[11px] text-rural-muted font-mono mt-0.5">
              Coordinates: {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              {currentLocation.accuracyMeters ? ` (±${Math.round(currentLocation.accuracyMeters)}m)` : ''}
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rural-sage text-rural-forest self-start sm:self-center">
          {currentLocation.state}
        </span>
      </div>

      {/* Tab Switcher: Automatic vs Manual */}
      <div className="flex border-b border-rural-border mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('automatic')}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-1.5 transition-all border-b-2 cursor-pointer ${
            activeTab === 'automatic'
              ? 'border-rural-primary text-rural-primary'
              : 'border-transparent text-rural-muted hover:text-rural-charcoal'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Option A: Auto GPS</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-1.5 transition-all border-b-2 cursor-pointer ${
            activeTab === 'manual'
              ? 'border-rural-primary text-rural-primary'
              : 'border-transparent text-rural-muted hover:text-rural-charcoal'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Option B: State / District / PIN</span>
        </button>
      </div>

      {/* Error notification */}
      {locationError && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{locationError}</span>
          </div>
        </div>
      )}

      {/* Option A: Automatic GPS */}
      {activeTab === 'automatic' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rural-sage/40 border border-rural-border/60">
            <p className="text-xs text-rural-charcoal mb-3">
              Detect your farm coordinates automatically via your device&apos;s GPS sensor.
              We calculate actual road mileage to every regional agricultural mandi.
            </p>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rural-forest text-white hover:bg-rural-deep transition-all font-semibold text-xs shadow-rural-soft disabled:opacity-60 cursor-pointer"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rural-mint" />
                  <span>Requesting GPS Coordinates (10s max)...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-rural-fresh" />
                  <span>📍 Use My Current Location</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset selector */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-2">
              Or Choose Major Indian Agricultural Hub:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDIAN_AGRI_DISTRICT_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={`${preset.state}-${preset.district}-${preset.town}`}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left p-2 rounded-xl border border-rural-border bg-rural-cream hover:bg-rural-mint/60 hover:border-rural-primary transition-colors text-xs cursor-pointer"
                >
                  <div className="font-bold text-rural-forest truncate">{preset.town}</div>
                  <div className="text-[10px] text-rural-muted truncate">
                    {preset.district}, {preset.state}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Option B: Manual Selection */
        <form onSubmit={handleApplyManualLocation} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                State
              </label>
              <div className="relative">
                <select
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh appearance-none font-medium"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-rural-muted absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                District
              </label>
              <input
                type="text"
                value={manualDistrict}
                onChange={(e) => setManualDistrict(e.target.value)}
                placeholder="e.g. Dharwad, Nashik, Karnal"
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
                required
              />
            </div>

            {/* Village / Farm Gate */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                Village / Town / Farm Gate
              </label>
              <input
                type="text"
                value={manualVillage}
                onChange={(e) => setManualVillage(e.target.value)}
                placeholder="e.g. Navalgund Farm Gate"
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
                required
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                PIN Code (6 digits)
              </label>
              <input
                type="text"
                maxLength={6}
                value={manualPincode}
                onChange={(e) => setManualPincode(e.target.value)}
                placeholder="e.g. 582208"
                className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-mono font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-rural-primary text-white hover:bg-rural-forest transition-colors font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Update Farm Location Coordinates</span>
          </button>
        </form>
      )}
    </div>
  );
};

