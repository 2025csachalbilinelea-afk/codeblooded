import React from 'react';
import { TransportConfig } from '../../types/agriculture';
import { calculateTransportationCost } from '../../engine/transport';
import { formatINR } from '../../utils/currency';
import { Truck, CheckCircle2, Info } from 'lucide-react';

interface TransportConfigProps {
  transport: TransportConfig;
  totalQuintals: number;
  sampleDistanceKm?: number;
  onChange: (updates: Partial<TransportConfig>) => void;
  errors?: Record<string, string>;
}

export const TransportConfigForm: React.FC<TransportConfigProps> = ({
  transport,
  totalQuintals,
  sampleDistanceKm = 50,
  onChange,
  errors = {},
}) => {
  const isOwn = transport.type === 'own';
  const rentalRatePerKm = transport.rentedVehicle.rentalRatePerKm ?? 35;

  // Calculate live estimate for a representative 50 km delivery journey
  const sampleCalc = calculateTransportationCost(transport, sampleDistanceKm, totalQuintals);
  const tripsCount = sampleCalc.tripsCount || Math.max(1, Math.ceil(totalQuintals / 25));
  const totalChargedDistanceKm = tripsCount * sampleDistanceKm * 2;

  const handleSelectType = (type: 'own' | 'rented') => {
    onChange({ type });
  };

  const handleRentalRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange({
      rentedVehicle: {
        ...transport.rentedVehicle,
        rentalRatePerKm: isNaN(val) ? 0 : Math.max(0, val),
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
            4. How Will You Transport Your Crop?
          </h2>
        </div>
        <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
          {tripsCount} {tripsCount === 1 ? 'Trip' : 'Trips'} Needed
        </span>
      </div>

      <p className="text-xs text-stone-500 mb-3.5">
        Choose whether you are using your own vehicle or hiring a rental truck.
      </p>

      {/* Two Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Option A: My Own Vehicle */}
        <button
          type="button"
          onClick={() => handleSelectType('own')}
          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
            isOwn
              ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
              : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-sm text-stone-900 flex items-center space-x-1.5">
              <span>My Own Vehicle</span>
            </span>
            {isOwn && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Use your farm pickup, tractor-trolley, or truck. We estimate fuel, maintenance, and driver expenses automatically.
          </p>
        </button>

        {/* Option B: Rent a Vehicle */}
        <button
          type="button"
          onClick={() => handleSelectType('rented')}
          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
            !isOwn
              ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
              : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-sm text-stone-900 flex items-center space-x-1.5">
              <span>Rent a Vehicle</span>
            </span>
            {!isOwn && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Hire a local commercial vehicle on a simple per-kilometre rate that covers fuel and driver.
          </p>
        </button>
      </div>

      {/* Rental Rate Input (Shown only when Rent a Vehicle is selected) */}
      {!isOwn && (
        <div className="mb-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in duration-150">
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Rental cost per kilometre (₹/km)
          </label>
          <div className="flex items-center space-x-3 max-w-xs">
            <div className="relative rounded-lg shadow-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500 font-bold">
                ₹
              </div>
              <input
                type="number"
                min="5"
                step="1"
                value={rentalRatePerKm || ''}
                onChange={handleRentalRateChange}
                placeholder="35"
                className="w-full text-sm bg-white border border-stone-300 rounded-lg pl-8 pr-16 py-1.5 text-stone-900 font-bold focus:ring-2 focus:ring-emerald-600"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-stone-500 font-medium">
                / km
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  rentedVehicle: {
                    ...transport.rentedVehicle,
                    rentalRatePerKm: 35,
                  },
                })
              }
              className="text-[11px] text-stone-600 hover:text-stone-900 underline whitespace-nowrap"
            >
              Default (₹35)
            </button>
          </div>
          {errors.rentalRate && <p className="text-xs text-rose-600 mt-1">{errors.rentalRate}</p>}
          <p className="text-[11px] text-stone-500 mt-1.5">
            This rental rate covers the hired vehicle, fuel, and driver for both ways.
          </p>
        </div>
      )}

      {/* Your Transport Estimate Summary Card */}
      <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 mb-2">
          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Your Transport Estimate
          </span>
          <span className="text-xs font-bold text-emerald-800">
            {isOwn ? 'My Own Vehicle' : `Rented @ ₹${rentalRatePerKm}/km`}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-stone-700">
          <div className="flex justify-between">
            <span>Example market distance:</span>
            <strong>{sampleDistanceKm} km each way ({sampleDistanceKm * 2} km round trip)</strong>
          </div>
          <div className="flex justify-between">
            <span>Estimated trips needed:</span>
            <strong>
              {tripsCount} {tripsCount === 1 ? 'trip' : 'trips'} (for {totalQuintals.toFixed(1)} quintals)
            </strong>
          </div>
          {!isOwn && (
            <div className="flex justify-between">
              <span>Total distance charged:</span>
              <strong>{totalChargedDistanceKm} km</strong>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-stone-200 text-stone-900 font-bold">
            <span>Estimated transport cost:</span>
            <span className="text-sm text-emerald-800">{formatINR(sampleCalc.totalCost)}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span>
            {isOwn
              ? 'Based on round-trip fuel used, basic vehicle wear, driver batta, and toll charges. Actual transport costs will adjust automatically for each market destination.'
              : 'Based on total distance charged (round-trip) times the rental rate per kilometre. Actual cost will calculate per market distance.'}
          </span>
        </div>
      </div>
    </div>
  );
};
