import React, { useState } from 'react';
import {
  DynamicMandiEvaluation,
  FarmerLocation,
  MandiFilterOptions,
  MandiSortOption,
  PriceFreshnessStatus,
} from '../../types/marketDiscovery';
import { MarketLocationMap } from '../markets/MarketLocationMap';
import { formatINR } from '../../utils/currency';
import {
  Award,
  TrendingUp,
  MapPin,
  Clock,
  Truck,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Map as MapIcon,
  HelpCircle,
  Database,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface DynamicMarketSectionProps {
  farmerLocation: FarmerLocation;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  closestFeasibleMarket: DynamicMandiEvaluation | null;
  totalCandidatesFound: number;
  sortOption: MandiSortOption;
  filters: MandiFilterOptions;
  onSortChange: (sort: MandiSortOption) => void;
  onFilterChange: (filters: Partial<MandiFilterOptions>) => void;
  onSelectBreakdown: (mandi: DynamicMandiEvaluation) => void;
  isLiveMode: boolean;
  onToggleLiveMode: (live: boolean) => void;
}

export const DynamicMarketSection: React.FC<DynamicMarketSectionProps> = ({
  farmerLocation,
  evaluations,
  recommendedMarket,
  closestFeasibleMarket,
  totalCandidatesFound,
  sortOption,
  filters,
  onSortChange,
  onFilterChange,
  onSelectBreakdown,
  isLiveMode,
  onToggleLiveMode,
}) => {
  const [viewTab, setViewTab] = useState<'cards' | 'table' | 'map'>('cards');

  // Available unique states in current evaluated list
  const availableStates = Array.from(new Set(evaluations.map((e) => e.market.state))).sort();

  return (
    <div className="space-y-6">
      {/* Header with Title, Mode Switcher, and View Switcher */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-rural-border/70 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                Phase 5 Dynamic Discovery
              </span>
              <span className="text-xs text-rural-muted">•</span>
              <span className="text-xs text-rural-forest font-semibold">
                {totalCandidatesFound} Agricultural Mandis Discovered
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-rural-forest mt-1">
              National APMC Mandi Discovery & Live Market Prices
            </h2>
            <p className="text-xs sm:text-sm text-rural-muted mt-0.5">
              Real road distances via OSRM and official daily wholesale rates from AGMARKNET / Data.gov.in.
            </p>
          </div>

          {/* Mode Switcher: Live AGMARKNET vs Demo Benchmarks */}
          <div className="flex items-center space-x-3 self-start lg:self-center">
            <div className="flex items-center bg-rural-cream p-1 rounded-2xl border border-rural-border text-xs">
              <button
                type="button"
                onClick={() => onToggleLiveMode(true)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  isLiveMode
                    ? 'bg-rural-forest text-white shadow-sm'
                    : 'text-rural-muted hover:text-rural-charcoal'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-rural-fresh" />
                <span>Live AGMARKNET</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleLiveMode(false)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  !isLiveMode
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-rural-muted hover:text-rural-charcoal'
                }`}
              >
                <span>Demo Benchmarks</span>
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-rural-cream p-1 rounded-2xl border border-rural-border text-xs">
              <button
                type="button"
                onClick={() => setViewTab('cards')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewTab === 'cards' ? 'bg-white shadow-sm text-rural-forest' : 'text-rural-muted'
                }`}
                title="Card View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewTab('table')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewTab === 'table' ? 'bg-white shadow-sm text-rural-forest' : 'text-rural-muted'
                }`}
                title="Table View"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewTab('map')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewTab === 'map' ? 'bg-white shadow-sm text-rural-forest' : 'text-rural-muted'
                }`}
                title="Geographic Radar Map"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <ArrowUpDown className="w-3 h-3 text-rural-primary" />
              <span>Rank Mandis By</span>
            </label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as MandiSortOption)}
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value="netRevenue">Highest Net Revenue (Take-Home)</option>
              <option value="cropPrice">Highest Reported Price (₹/Qtl)</option>
              <option value="roadDistance">Shortest Road Distance (km)</option>
              <option value="transportCost">Lowest Transport Expense (₹)</option>
            </select>
          </div>

          {/* Filter State */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-rural-primary" />
              <span>State Filter</span>
            </label>
            <select
              value={filters.state || 'ALL'}
              onChange={(e) => onFilterChange({ state: e.target.value })}
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value="ALL">All Discovered States</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Max Distance */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Truck className="w-3 h-3 text-rural-primary" />
              <span>Maximum Distance</span>
            </label>
            <select
              value={filters.maxDistanceKm || 0}
              onChange={(e) =>
                onFilterChange({ maxDistanceKm: Number(e.target.value) || undefined })
              }
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value={0}>Any Distance</option>
              <option value={100}>Within 100 km (Local)</option>
              <option value={250}>Within 250 km (Regional)</option>
              <option value={500}>Within 500 km (Inter-District)</option>
              <option value={1000}>Within 1,000 km (Inter-State)</option>
            </select>
          </div>

          {/* Price Freshness */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-rural-primary" />
              <span>Price Freshness</span>
            </label>
            <select
              value={filters.minFreshness || 'ALL'}
              onChange={(e) =>
                onFilterChange({ minFreshness: e.target.value as PriceFreshnessStatus | 'ALL' })
              }
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value="ALL">All Available Quotes</option>
              <option value="CURRENT">Current Only (≤ 2 days)</option>
              <option value="RECENT">Recent or Better (≤ 7 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🏆 HERO CARD: Recommended Mandi */}
      {recommendedMarket ? (
        <div className="bg-gradient-to-br from-rural-forest to-rural-deep text-white rounded-3xl p-6 sm:p-7 shadow-rural-soft border-2 border-rural-fresh/40 relative overflow-hidden">
          {/* Subtle background ornamentation */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-rural-fresh/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center space-x-2 bg-rural-mint text-rural-forest px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Award className="w-4 h-4 text-rural-primary" />
                <span>🏆 Recommended Agricultural Market</span>
              </div>

              {recommendedMarket.additionalEarnings > 0 && (
                <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-amber-400/30">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    +₹{recommendedMarket.additionalEarnings.toLocaleString('en-IN')} Extra Profit vs Closest Mandi
                  </span>
                </div>
              )}
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Info */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {recommendedMarket.market.marketName}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-rural-mint/90 font-medium">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rural-fresh" />
                    <span>
                      {recommendedMarket.market.district}, {recommendedMarket.market.state}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5 text-rural-fresh" />
                    <span>
                      {recommendedMarket.route.roadDistanceKm} km road drive ({recommendedMarket.route.estimatedTravelTimeHours} hrs)
                    </span>
                  </span>
                  <span>•</span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded">
                    Routing: {recommendedMarket.route.routeSource}
                  </span>
                </div>

                {/* Key Rationale */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rural-mint block">
                    Why This Market Is Recommended:
                  </span>
                  <ul className="text-xs space-y-1.5 text-white/95">
                    {recommendedMarket.recommendationReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rural-fresh shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Financial Box */}
              <div className="lg:col-span-5 bg-white text-rural-charcoal rounded-2xl p-5 shadow-lg border border-rural-border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-rural-muted uppercase tracking-wider">
                      Estimated Net Take-Home
                    </span>
                    <div className="text-3xl font-serif font-bold text-rural-forest mt-0.5">
                      {formatINR(recommendedMarket.netSellingRevenue)}
                    </div>
                    <span className="text-xs font-semibold text-rural-primary">
                      ₹{recommendedMarket.netRevenuePerQuintal} per harvested Quintal
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                      Reported Modal Price
                    </span>
                    <span className="text-base font-bold text-emerald-700">
                      ₹{recommendedMarket.priceRecord?.modalPrice || 0}/Qtl
                    </span>
                    <span className="text-[10px] text-rural-muted block">
                      {recommendedMarket.priceRecord?.arrivalDate}
                    </span>
                  </div>
                </div>

                {/* Micro Waterfall Summary */}
                <div className="space-y-1.5 pt-3 border-t border-rural-border/70 text-xs">
                  <div className="flex justify-between text-rural-charcoal font-medium">
                    <span>Gross Produce Sales:</span>
                    <span className="font-bold">{formatINR(recommendedMarket.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Road Transport Expense:</span>
                    <span>- {formatINR(recommendedMarket.transportCost)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Mandi Commission & Hamali:</span>
                    <span>- {formatINR(recommendedMarket.marketFees)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectBreakdown(recommendedMarket)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rural-forest text-white hover:bg-rural-deep transition-all font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <span>View Complete Cost Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-rural-mint/80 flex flex-wrap items-center justify-between gap-2">
              <span>
                Source: {recommendedMarket.priceRecord?.source || 'Verified APMC Yard Bulletin'} (Arrival: {recommendedMarket.priceRecord?.arrivalDate})
              </span>
              <span className="italic">
                * Indicative wholesale price from daily arrivals; not a guaranteed buyer contract.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center text-amber-900">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-bold text-sm">No Feasible Mandis Found Within Filter Criteria</h3>
          <p className="text-xs text-amber-800 mt-1">
            Try expanding your maximum distance filter or adjusting your consignment quantity.
          </p>
        </div>
      )}

      {/* Main Content Area based on View Tab */}
      {viewTab === 'map' ? (
        <MarketLocationMap
          farmerLocation={farmerLocation}
          evaluations={evaluations}
          recommendedMarket={recommendedMarket}
          onSelectMarket={(m) => onSelectBreakdown(m)}
        />
      ) : viewTab === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rural-sage/60 text-rural-forest uppercase font-bold text-[10px] tracking-wider border-b border-rural-border">
                <tr>
                  <th className="py-3 px-4">Rank & Mandi</th>
                  <th className="py-3 px-3">State & District</th>
                  <th className="py-3 px-3">Road Dist.</th>
                  <th className="py-3 px-3">Modal Price</th>
                  <th className="py-3 px-3">Gross Sales</th>
                  <th className="py-3 px-3">Transport</th>
                  <th className="py-3 px-3">Market Fees</th>
                  <th className="py-3 px-4">Est. Net Take-Home</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rural-border/70 font-medium">
                {evaluations.map((mandi) => {
                  const isRec = recommendedMarket?.market.marketId === mandi.market.marketId;
                  return (
                    <tr
                      key={mandi.market.marketId}
                      className={`hover:bg-rural-cream/60 transition-colors ${
                        isRec ? 'bg-amber-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-rural-cream border border-rural-border flex items-center justify-center text-[10px] font-bold text-rural-forest">
                            #{mandi.rank}
                          </span>
                          <div>
                            <div className="font-bold text-rural-charcoal">{mandi.market.marketName}</div>
                            {isRec && (
                              <span className="text-[10px] text-amber-700 font-bold">
                                🏆 Top Choice
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-rural-muted">
                        {mandi.market.district}, {mandi.market.state}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-rural-charcoal">{mandi.route.roadDistanceKm} km</div>
                        <div className="text-[10px] text-rural-muted">~{mandi.route.estimatedTravelTimeHours} hrs</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-emerald-700">
                          {mandi.priceRecord ? `₹${mandi.priceRecord.modalPrice}` : 'Unavailable'}
                        </div>
                        <div className="text-[10px] text-rural-muted">{mandi.priceRecord?.arrivalDate}</div>
                      </td>
                      <td className="py-3 px-3">{formatINR(mandi.grossRevenue)}</td>
                      <td className="py-3 px-3 text-rose-700">- {formatINR(mandi.transportCost)}</td>
                      <td className="py-3 px-3 text-rose-700">- {formatINR(mandi.marketFees)}</td>
                      <td className="py-3 px-4">
                        <div className="font-serif font-bold text-rural-forest text-sm">
                          {formatINR(mandi.netSellingRevenue)}
                        </div>
                        <div className="text-[10px] text-rural-muted">
                          ₹{mandi.netRevenuePerQuintal}/Qtl
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onSelectBreakdown(mandi)}
                          className="px-2.5 py-1 rounded-lg bg-rural-sage text-rural-forest hover:bg-rural-mint text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evaluations.map((mandi) => {
            const isRec = recommendedMarket?.market.marketId === mandi.market.marketId;

            return (
              <div
                key={mandi.market.marketId}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all bg-white ${
                  isRec
                    ? 'border-amber-400 ring-2 ring-amber-200/60 shadow-md'
                    : 'border-rural-border shadow-rural-soft hover:border-rural-primary/40'
                }`}
              >
                <div>
                  {/* Card Top Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-rural-muted bg-rural-cream px-2 py-0.5 rounded-full border border-rural-border">
                      Rank #{mandi.rank}
                    </span>
                    {isRec ? (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Recommended</span>
                      </span>
                    ) : mandi.isFeasible ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Feasible APMC
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                        Quota Exceeded
                      </span>
                    )}
                  </div>

                  {/* Market Title */}
                  <h4 className="text-base font-serif font-bold text-rural-forest leading-snug">
                    {mandi.market.marketName}
                  </h4>
                  <p className="text-xs text-rural-muted mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rural-primary shrink-0" />
                    <span>
                      {mandi.market.district}, {mandi.market.state}
                    </span>
                  </p>

                  {/* Road Distance and Travel Time */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 bg-rural-cream p-2.5 rounded-xl border border-rural-border text-xs">
                    <div>
                      <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                        Road Distance
                      </span>
                      <span className="font-bold text-rural-charcoal">
                        {mandi.route.roadDistanceKm} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                        Est. Travel Time
                      </span>
                      <span className="font-bold text-rural-charcoal">
                        ~{mandi.route.estimatedTravelTimeHours} hrs
                      </span>
                    </div>
                  </div>

                  {/* Reported Price */}
                  <div className="mt-3 flex items-center justify-between py-2 border-b border-rural-border/70 text-xs">
                    <div>
                      <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                        Daily Modal Price
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {mandi.priceRecord
                          ? `₹${mandi.priceRecord.modalPrice}/Qtl`
                          : 'Price Unavailable'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-rural-muted block">Arrival Date</span>
                      <span className="text-[11px] font-semibold text-rural-charcoal">
                        {mandi.priceRecord?.arrivalDate || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-rural-muted">
                      <span>Transport Expense:</span>
                      <span className="font-medium text-rose-700">- {formatINR(mandi.transportCost)}</span>
                    </div>
                    <div className="flex justify-between text-rural-muted">
                      <span>Mandi Hamali & Fees:</span>
                      <span className="font-medium text-rose-700">- {formatINR(mandi.marketFees)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Return Bottom Box */}
                <div className="mt-4 pt-3 border-t border-rural-border">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rural-muted block">
                        Est. Net Take-Home
                      </span>
                      <div className="text-xl font-serif font-bold text-rural-forest">
                        {formatINR(mandi.netSellingRevenue)}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-rural-primary">
                      ₹{mandi.netRevenuePerQuintal}/Qtl
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBreakdown(mandi)}
                    className="w-full py-2 px-3 rounded-xl bg-rural-sage hover:bg-rural-mint text-rural-forest text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>View Financial Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

