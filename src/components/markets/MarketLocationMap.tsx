import React, { useState, useMemo } from 'react';
import { DynamicMandiEvaluation, FarmerLocation } from '../../types/marketDiscovery';
import { MapPin, Award, Navigation, Info, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface MarketLocationMapProps {
  farmerLocation: FarmerLocation;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  onSelectMarket?: (market: DynamicMandiEvaluation) => void;
}

export const MarketLocationMap: React.FC<MarketLocationMapProps> = ({
  farmerLocation,
  evaluations,
  recommendedMarket,
  onSelectMarket,
}) => {
  const [selectedPin, setSelectedPin] = useState<DynamicMandiEvaluation | null>(
    recommendedMarket || (evaluations.length > 0 ? evaluations[0] : null)
  );

  // Geographic bounds calculation for dynamic SVG projection
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    let minLt = farmerLocation.latitude;
    let maxLt = farmerLocation.latitude;
    let minLg = farmerLocation.longitude;
    let maxLg = farmerLocation.longitude;

    evaluations.forEach((e) => {
      if (e.market.latitude < minLt) minLt = e.market.latitude;
      if (e.market.latitude > maxLt) maxLt = e.market.latitude;
      if (e.market.longitude < minLg) minLg = e.market.longitude;
      if (e.market.longitude > maxLg) maxLg = e.market.longitude;
    });

    // Add padding around coordinates (at least 1.5 degrees margin)
    const latPadding = Math.max(1.5, (maxLt - minLt) * 0.15);
    const lngPadding = Math.max(1.5, (maxLg - minLg) * 0.15);

    return {
      minLat: minLt - latPadding,
      maxLat: maxLt + latPadding,
      minLng: minLg - lngPadding,
      maxLng: maxLg + lngPadding,
    };
  }, [farmerLocation, evaluations]);

  // Project lat/lng to SVG viewBox (width 800, height 500)
  const projectCoords = (lat: number, lng: number) => {
    const width = 800;
    const height = 480;
    const padding = 40;

    const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    // Invert latitude for SVG y-axis
    const y = height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

    return { x: Math.max(20, Math.min(width - 20, x)), y: Math.max(20, Math.min(height - 20, y)) };
  };

  const farmerPos = projectCoords(farmerLocation.latitude, farmerLocation.longitude);

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-rural-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rural-cream/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <Navigation className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-rural-forest">
              Agricultural Mandi Geographic Radar
            </h3>
            <p className="text-[11px] text-rural-muted">
              Spatial map showing road haulage routes from your farm gate to regional APMC mandis
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-rural-charcoal font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200"></span>
            <span>Farm Gate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span>Recommended Mandi</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Feasible Mandi</span>
          </div>
        </div>
      </div>

      {/* SVG Radar Canvas */}
      <div className="relative bg-slate-900 overflow-hidden select-none" style={{ minHeight: '380px' }}>
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg viewBox="0 0 800 480" className="w-full h-auto max-h-[460px] relative z-10">
          <defs>
            <radialGradient id="farmerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="recGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Transit Route Lines from Farmer to Mandis */}
          {evaluations.map((evalItem) => {
            const mandiPos = projectCoords(evalItem.market.latitude, evalItem.market.longitude);
            const isRec = recommendedMarket?.market.marketId === evalItem.market.marketId;
            const isSelected = selectedPin?.market.marketId === evalItem.market.marketId;

            return (
              <g key={`route-${evalItem.market.marketId}`}>
                <line
                  x1={farmerPos.x}
                  y1={farmerPos.y}
                  x2={mandiPos.x}
                  y2={mandiPos.y}
                  stroke={
                    isRec
                      ? '#f59e0b'
                      : isSelected
                      ? '#38bdf8'
                      : evalItem.isFeasible
                      ? '#64748b'
                      : '#475569'
                  }
                  strokeWidth={isRec ? 2.5 : isSelected ? 2 : 1}
                  strokeDasharray={isRec ? 'none' : '4,4'}
                  opacity={isRec ? 0.9 : isSelected ? 0.8 : 0.4}
                />
              </g>
            );
          })}

          {/* Farmer Farm Gate Pin */}
          <g transform={`translate(${farmerPos.x}, ${farmerPos.y})`}>
            <circle r="22" fill="url(#farmerGlow)" className="animate-pulse" />
            <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
            <text
              y="-14"
              textAnchor="middle"
              className="fill-emerald-300 font-bold text-[10px]"
            >
              📍 Your Farm Gate
            </text>
          </g>

          {/* Discovered Mandi Pins */}
          {evaluations.map((evalItem) => {
            const pos = projectCoords(evalItem.market.latitude, evalItem.market.longitude);
            const isRec = recommendedMarket?.market.marketId === evalItem.market.marketId;
            const isSelected = selectedPin?.market.marketId === evalItem.market.marketId;

            return (
              <g
                key={`pin-${evalItem.market.marketId}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => {
                  setSelectedPin(evalItem);
                  if (onSelectMarket) onSelectMarket(evalItem);
                }}
                className="cursor-pointer group"
              >
                {/* Glow if recommended */}
                {isRec && <circle r="24" fill="url(#recGlow)" className="animate-pulse" />}

                {/* Marker circle */}
                <circle
                  r={isRec ? 12 : isSelected ? 10 : 7}
                  fill={
                    isRec
                      ? '#f59e0b'
                      : evalItem.isFeasible
                      ? '#3b82f6'
                      : '#64748b'
                  }
                  stroke="#ffffff"
                  strokeWidth={isRec || isSelected ? 2.5 : 1.5}
                />

                {isRec && (
                  <text
                    y="4"
                    textAnchor="middle"
                    className="fill-slate-900 font-bold text-[9px] pointer-events-none"
                  >
                    ★
                  </text>
                )}

                {/* Mandi Name Label */}
                <text
                  y={isRec ? 22 : 18}
                  textAnchor="middle"
                  className={`text-[9px] font-semibold pointer-events-none ${
                    isRec
                      ? 'fill-amber-300 font-bold text-[10px]'
                      : isSelected
                      ? 'fill-sky-300 font-bold'
                      : 'fill-slate-300'
                  }`}
                >
                  {evalItem.market.district} ({evalItem.route.roadDistanceKm}km)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Mandi Floating Overlay Card */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 text-white shadow-2xl z-20 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  {selectedPin.isRecommended ? (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>Top Net Return Choice</span>
                    </span>
                  ) : selectedPin.isFeasible ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      Feasible APMC Mandi
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>Capacity Limit Exceeded</span>
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  {selectedPin.market.marketName}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {selectedPin.market.district}, {selectedPin.market.state} • {selectedPin.route.roadDistanceKm} km road drive (~{selectedPin.route.estimatedTravelTimeHours} hrs)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Reported Modal Price</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {selectedPin.priceRecord
                    ? `₹${selectedPin.priceRecord.modalPrice}/Qtl`
                    : 'Unavailable'}
                </span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Est. Net Revenue</span>
                <span className="font-bold text-amber-300 text-sm">
                  {formatINR(selectedPin.netSellingRevenue)}
                </span>
              </div>
            </div>

            <div className="mt-2.5 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Transport: {formatINR(selectedPin.transportCost)}</span>
              <span>Hamali & Fees: {formatINR(selectedPin.marketFees)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

