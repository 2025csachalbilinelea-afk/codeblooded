import React from 'react';
import { TransportConfig } from '../../types/agriculture';
import { Truck, Check, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface TransportConfigProps {
  transport: TransportConfig;
  totalQuintals: number;
  onChange: (updates: Partial<TransportConfig>) => void;
  errors?: Record<string, string>;
}

export const TransportConfigForm: React.FC<TransportConfigProps> = ({
  transport,
  totalQuintals,
  onChange,
  errors,
}) => {
  const isOwn = transport.type === 'own';
  const capacity = isOwn
    ? transport.ownVehicle.capacityQuintals
    : transport.rentedVehicle.capacityQuintals;

  const trips = Math.max(1, Math.ceil(totalQuintals / Math.max(0.1, capacity)));
  const isSingleTrip = trips === 1;

  const handleTypeChange = (type: 'own' | 'rented') => {
    onChange({ type });
  };

  const handleRentalRateChange = (val: number) => {
    onChange({
      rentedVehicle: {
        ...transport.rentedVehicle,
        rentalRatePerKm: val,
      },
    });
  };

  const handleCapacityChange = (cap: number) => {
    if (isOwn) {
      onChange({
        ownVehicle: {
          ...transport.ownVehicle,
          capacityQuintals: cap,
        },
      });
    } else {
      onChange({
        rentedVehicle: {
          ...transport.rentedVehicle,
          capacityQuintals: cap,
        },
      });
    }
  };

  const handleMileageChange = (val: number) => {
    onChange({
      ownVehicle: {
        ...transport.ownVehicle,
        mileageKmPerLitre: val,
      },
    });
  };

  const handleFuelPriceChange = (val: number) => {
    onChange({
      ownVehicle: {
        ...transport.ownVehicle,
        fuelPricePerLitre: val,
      },
    });
  };

  const currentRentalRate = transport.rentedVehicle.rentalRatePerKm ?? 35;

  // Real-time fuel cost rate per km for Option A
  const ownMileage = transport.ownVehicle.mileageKmPerLitre;
  const ownFuelPrice = transport.ownVehicle.fuelPricePerLitre;
  const fuelRatePerKm = ownMileage > 0 && ownFuelPrice > 0 ? ownFuelPrice / ownMileage : 0;

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 border-b border-rural-border/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Truck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-rural-forest">
              4. Transport Details
            </h2>
            <p className="text-xs text-rural-muted">
              Choose how your harvest will travel to market
            </p>
          </div>
        </div>
      </div>

      {/* Two Transport Options: Option A vs Option B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Option A: My Own Vehicle */}
        <button
          type="button"
          onClick={() => handleTypeChange('own')}
          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            isOwn
              ? 'border-rural-fresh bg-rural-sage/80 ring-2 ring-rural-fresh/40 shadow-sm'
              : 'border-rural-border bg-rural-cream hover:bg-rural-sage/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm sm:text-base text-rural-forest">
              Option A: My Own Vehicle
            </span>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isOwn ? 'bg-rural-primary text-white' : 'border border-rural-border bg-white'
              }`}
            >
              {isOwn && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
          <p className="text-xs text-rural-muted leading-relaxed">
            I have my own vehicle (tempo, tractor, or small pickup truck).
          </p>
        </button>

        {/* Option B: Rent a Vehicle */}
        <button
          type="button"
          onClick={() => handleTypeChange('rented')}
          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
            !isOwn
              ? 'border-rural-fresh bg-rural-sage/80 ring-2 ring-rural-fresh/40 shadow-sm'
              : 'border-rural-border bg-rural-cream hover:bg-rural-sage/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif font-bold text-sm sm:text-base text-rural-forest">
              Option B: Rent a Vehicle
            </span>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                !isOwn ? 'bg-rural-primary text-white' : 'border border-rural-border bg-white'
              }`}
            >
              {!isOwn && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
          <p className="text-xs text-rural-muted leading-relaxed">
            I will rent or hire a transport vehicle with a driver.
          </p>
        </button>
      </div>

      {/* Conditional Detailed Settings */}
      {isOwn ? (
        /* Option A Details */
        <div className="bg-rural-cream rounded-2xl p-4.5 border border-rural-border space-y-4 mb-5">
          {/* Header & Vehicle Space Dropdown (Unchanged) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rural-border/70 pb-3">
            <div>
              <span className="text-xs font-semibold text-rural-forest block">
                Automatic Own-Vehicle Cost Model
              </span>
              <p className="text-[11px] text-rural-muted">
                Cost is estimated from distance, vehicle capacity, and user-specified fuel expenses.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-rural-charcoal font-medium whitespace-nowrap">
                Vehicle Space:
              </label>
              <select
                value={transport.ownVehicle.capacityQuintals}
                onChange={(e) => handleCapacityChange(parseFloat(e.target.value) || 25)}
                className="text-xs bg-white border border-rural-border rounded-lg px-2.5 py-1.5 font-bold text-rural-forest focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="15">Small Tempo (15 Qtl)</option>
                <option value="25">Standard Pickup (25 Qtl)</option>
                <option value="40">Tractor Trolley (40 Qtl)</option>
                <option value="70">Medium Truck (70 Qtl)</option>
              </select>
            </div>
          </div>

          {/* Two Primary Inputs: Vehicle Mileage & Fuel Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input 1: Vehicle Mileage */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                Vehicle Mileage (km/litre) *
              </label>
              <div className="relative rounded-xl border border-rural-border bg-white focus-within:ring-2 focus-within:ring-rural-fresh">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={transport.ownVehicle.mileageKmPerLitre || ''}
                  onChange={(e) => handleMileageChange(parseFloat(e.target.value) || 0)}
                  placeholder="10"
                  className="w-full text-sm bg-transparent pl-3 pr-20 py-2.5 text-rural-forest font-bold focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rural-muted text-xs font-semibold">
                  km/litre
                </div>
              </div>
              {errors?.mileage ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.mileage}</span>
                </p>
              ) : (
                <p className="text-[11px] text-rural-muted mt-1">
                  Typical pickup/tempo mileage is 8 – 14 km/L.
                </p>
              )}
            </div>

            {/* Input 2: Fuel Price */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                Fuel Price (₹/litre) *
              </label>
              <div className="relative rounded-xl border border-rural-border bg-white focus-within:ring-2 focus-within:ring-rural-fresh">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rural-muted font-bold text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={transport.ownVehicle.fuelPricePerLitre || ''}
                  onChange={(e) => handleFuelPriceChange(parseFloat(e.target.value) || 0)}
                  placeholder="95"
                  className="w-full text-sm bg-transparent pl-7 pr-16 py-2.5 text-rural-forest font-bold focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rural-muted text-xs font-semibold">
                  per litre
                </div>
              </div>
              {errors?.fuelPrice ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.fuelPrice}</span>
                </p>
              ) : (
                <p className="text-[11px] text-rural-muted mt-1">
                  Current local fuel rate at petrol/diesel pump.
                </p>
              )}
            </div>
          </div>

          {/* Transparent breakdown of what is included */}
          <div>
            <span className="text-[11px] font-semibold text-rural-forest uppercase tracking-wider block mb-2">
              Transportation Cost Breakdown Components:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-rural-border/70">
                <span className="text-rural-muted text-[10px] block">Calculated Fuel Rate</span>
                <strong className="text-emerald-800 font-bold block">
                  {fuelRatePerKm > 0 ? `₹${fuelRatePerKm.toFixed(2)} / km` : 'Enter values'}
                </strong>
                <span className="text-[10px] text-rural-muted block mt-0.5">
                  ({ownFuelPrice || 0} ÷ {ownMileage || 0} km/L)
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rural-border/70">
                <span className="text-rural-muted text-[10px] block">Maintenance</span>
                <strong className="text-rural-forest font-semibold block">
                  ₹{transport.ownVehicle.maintenancePerKm || 2} / km
                </strong>
                <span className="text-[10px] text-rural-muted block mt-0.5">Road wear & tear</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rural-border/70">
                <span className="text-rural-muted text-[10px] block">Driver Allowance</span>
                <strong className="text-rural-forest font-semibold block">
                  ₹{transport.ownVehicle.driverCostPerTrip || 500} / trip
                </strong>
                <span className="text-[10px] text-rural-muted block mt-0.5">Driver trip fee</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rural-border/70">
                <span className="text-rural-muted text-[10px] block">Tolls & Parking</span>
                <strong className="text-rural-forest font-semibold block">
                  ₹{transport.ownVehicle.tollAndOtherExpenses || 200} / trip
                </strong>
                <span className="text-[10px] text-rural-muted block mt-0.5">Highway toll fees</span>
              </div>
            </div>
          </div>

          {/* Fuel Cost Formula Explanation Box */}
          <div className="p-3 bg-white rounded-xl border border-rural-border/70 text-xs text-rural-muted leading-relaxed space-y-1">
            <div className="text-rural-forest font-semibold">
              Own-Vehicle Fuel Cost Calculation Formula:
            </div>
            <div className="font-mono text-[11px] text-rural-forest bg-rural-cream px-2.5 py-1.5 rounded-lg border border-rural-border">
              Fuel Required (litres) = Total Travel Distance (km) ÷ Vehicle Mileage ({ownMileage || 10} km/L)
              <br />
              Fuel Cost (₹) = Fuel Required × Fuel Price (₹{ownFuelPrice || 95}/litre)
            </div>
            <p className="text-[11px] text-rural-muted pt-0.5">
              • Two-way return trip distance ({transport.ownVehicle.returnTripRequired ? '2 × one-way distance' : 'one-way'}) and multi-trip consignment scaling ({trips} trip{trips > 1 ? 's' : ''}) are automatically accounted for without double-counting expenses.
            </p>
          </div>
        </div>
      ) : (
        /* Option B Details (COMPLETELY UNCHANGED) */
        <div className="bg-rural-cream rounded-2xl p-4.5 border border-rural-border space-y-3.5 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Single Prominent Input: Rental Rate per km */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                Rental cost per km (₹/km)
              </label>
              <div className="relative rounded-xl border border-rural-border bg-white focus-within:ring-2 focus-within:ring-rural-fresh">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rural-muted font-bold text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  min="5"
                  step="1"
                  value={currentRentalRate}
                  onChange={(e) => handleRentalRateChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm bg-transparent pl-8 pr-16 py-2.5 text-rural-forest font-bold focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-rural-muted text-xs font-semibold">
                  per km
                </div>
              </div>
              <p className="text-[11px] text-rural-muted mt-1">
                Typical regional tempo rate is ₹30 – ₹45/km.
              </p>
            </div>

            {/* Vehicle Capacity */}
            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                Rented Vehicle Capacity
              </label>
              <select
                value={transport.rentedVehicle.capacityQuintals}
                onChange={(e) => handleCapacityChange(parseFloat(e.target.value) || 30)}
                className="w-full text-sm bg-white border border-rural-border rounded-xl px-3 py-2.5 text-rural-forest font-semibold focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="20">Light Commercial (20 Qtl)</option>
                <option value="30">Standard 3-Tonne Tempo (30 Qtl)</option>
                <option value="50">Eicher / 5-Tonne Truck (50 Qtl)</option>
                <option value="80">Heavy 6-Wheeler (80 Qtl)</option>
              </select>
              <p className="text-[11px] text-rural-muted mt-1">
                Determines how many trips are required.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-rural-border/70 text-xs text-rural-muted leading-relaxed">
            <strong className="text-rural-forest">How rental is calculated: </strong>
            Total Transport Cost = Trips × (Distance to Market × 2) × Rental Rate per km.
            Fuel, driver fees, and vehicle maintenance are already included in this per-km rate (no duplicate charges added).
          </div>
        </div>
      )}

      {/* "YOUR TRANSPORT ESTIMATE" SUMMARY CARD */}
      <div className="bg-rural-sage/60 rounded-2xl p-4 border border-rural-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rural-forest">
              Your Transport Estimate
            </h4>
            <p className="text-xs text-rural-muted">
              Vehicle Capacity: <strong>{capacity} Quintals</strong> • Harvest to deliver: <strong>{totalQuintals.toFixed(1)} Quintals</strong>
            </p>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              isSingleTrip
                ? 'bg-rural-mint text-rural-forest border border-rural-fresh/40'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <span>
              {isSingleTrip
                ? '1 Trip Sufficient'
                : `Requires ${trips} Trips (Consignment exceeds vehicle space)`}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
