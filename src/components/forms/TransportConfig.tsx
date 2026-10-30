import React from 'react';
import { TransportConfig } from '../../types/agriculture';
import { Truck, Fuel, Wrench, UserCheck } from 'lucide-react';

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
  errors = {},
}) => {
  const isOwn = transport.type === 'own';
  const capacity = isOwn ? transport.ownVehicle.capacityQuintals : transport.rentedVehicle.capacityQuintals;
  const estimatedTrips = capacity > 0 && totalQuintals > 0 ? Math.ceil(totalQuintals / capacity) : 1;

  const handleOwnUpdate = (field: string, val: number | boolean) => {
    onChange({
      ownVehicle: {
        ...transport.ownVehicle,
        [field]: val,
      },
    });
  };

  const handleRentedUpdate = (field: string, val: number | string) => {
    onChange({
      rentedVehicle: {
        ...transport.rentedVehicle,
        [field]: val,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-stone-100 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            5. Logistics & Vehicle Economics
          </h2>
        </div>

        {/* Transport Type Toggle */}
        <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChange({ type: 'own' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              isOwn
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Farmer Owned Vehicle
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: 'rented' })}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !isOwn
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Commercial Hired / Rental
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2 border border-stone-200/70 mb-3.5 text-xs text-stone-600">
        <span>
          Logistics for <strong className="text-stone-800 font-semibold">{totalQuintals.toFixed(1)} Quintals</strong> harvest:
        </span>
        <span className="font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-stone-200">
          {estimatedTrips} {estimatedTrips === 1 ? 'Trip' : 'Trips'} Required (Vehicle Capacity: {capacity} Qtl)
        </span>
      </div>

      {isOwn ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Capacity */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Vehicle Capacity (Qtl)
            </label>
            <input
              type="number"
              min="1"
              value={transport.ownVehicle.capacityQuintals}
              onChange={(e) => handleOwnUpdate('capacityQuintals', parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
            />
            {errors.vehicleCapacity && <p className="text-[10px] text-rose-600">{errors.vehicleCapacity}</p>}
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
              <Fuel className="w-3 h-3 text-stone-500" />
              <span>Mileage (km/L)</span>
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={transport.ownVehicle.mileageKmPerLitre}
              onChange={(e) => handleOwnUpdate('mileageKmPerLitre', parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
            />
            {errors.mileage && <p className="text-[10px] text-rose-600">{errors.mileage}</p>}
          </div>

          {/* Fuel Price */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Diesel Price (₹/L)
            </label>
            <input
              type="number"
              min="0"
              value={transport.ownVehicle.fuelPricePerLitre}
              onChange={(e) => handleOwnUpdate('fuelPricePerLitre', parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Maintenance per km */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
              <Wrench className="w-3 h-3 text-stone-500" />
              <span>Maintenance (₹/km)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={transport.ownVehicle.maintenancePerKm}
              onChange={(e) => handleOwnUpdate('maintenancePerKm', parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Driver Cost */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center space-x-1">
              <UserCheck className="w-3 h-3 text-stone-500" />
              <span>Driver/Batta (₹/trip)</span>
            </label>
            <input
              type="number"
              min="0"
              value={transport.ownVehicle.driverCostPerTrip}
              onChange={(e) => handleOwnUpdate('driverCostPerTrip', parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Tolls & Other */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Tolls & Misc (₹/trip)
            </label>
            <input
              type="number"
              min="0"
              value={transport.ownVehicle.tollAndOtherExpenses}
              onChange={(e) => handleOwnUpdate('tollAndOtherExpenses', parseFloat(e.target.value) || 0)}
              className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="col-span-2 sm:col-span-3 lg:col-span-6 mt-1 flex items-center">
            <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transport.ownVehicle.returnTripRequired}
                onChange={(e) => handleOwnUpdate('returnTripRequired', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              <span className="font-medium">
                Include return trip distance (Round Trip = 2 × Distance)
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Rental Quote */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Rental Quotation (₹ / Trip)
              </label>
              <input
                type="number"
                min="0"
                value={transport.rentedVehicle.rentalQuotationPerTrip}
                onChange={(e) =>
                  handleRentedUpdate('rentalQuotationPerTrip', parseFloat(e.target.value) || 0)
                }
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
              />
              {errors.rentalQuote && <p className="text-[10px] text-rose-600">{errors.rentalQuote}</p>}
            </div>

            {/* Hired Vehicle Capacity */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Vehicle Capacity (Qtl)
              </label>
              <input
                type="number"
                min="1"
                value={transport.rentedVehicle.capacityQuintals}
                onChange={(e) =>
                  handleRentedUpdate('capacityQuintals', parseFloat(e.target.value) || 0)
                }
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
              />
              {errors.vehicleCapacity && <p className="text-[10px] text-rose-600">{errors.vehicleCapacity}</p>}
            </div>

            {/* Loading / Handling Surcharge */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hamali / Loading (₹ / Trip)
              </label>
              <input
                type="number"
                min="0"
                value={transport.rentedVehicle.additionalChargesPerTrip}
                onChange={(e) =>
                  handleRentedUpdate('additionalChargesPerTrip', parseFloat(e.target.value) || 0)
                }
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Rental Pricing Model */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Rental Cost Model
              </label>
              <select
                value={transport.rentedVehicle.rentalModel || 'distance_scaled'}
                onChange={(e) => handleRentedUpdate('rentalModel', e.target.value)}
                className="w-full text-xs bg-warmbg-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-600"
              >
                <option value="distance_scaled">Distance-Scaled (Standard 50km Haul)</option>
                <option value="flat">Fixed Flat Quote for All Markets</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 italic">
            Fuel and driver wages are included in commercial rental quotes and are not charged separately.
          </p>
        </div>
      )}
    </div>
  );
};
