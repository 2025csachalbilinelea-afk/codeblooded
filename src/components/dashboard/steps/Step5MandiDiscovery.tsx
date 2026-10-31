import React from 'react';
import { FarmerLocation, DynamicMandiEvaluation, MandiSortOption, MandiFilterOptions, DiscoveryLevel, ApiErrorCategory } from '../../../types/marketDiscovery';
import { DynamicMarketSection } from '../DynamicMarketSection';
import { Store, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface Step5MandiDiscoveryProps {
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
  apiStatus?: { isAvailable: boolean; lastError?: string; lastSyncTime?: string };
  cropName?: string;
  discoveryLevel?: DiscoveryLevel;
  apiErrorCategory?: ApiErrorCategory;
  isDiscovering: boolean;
  onNext: () => void;
  onBack: () => void;
}

export const Step5MandiDiscovery: React.FC<Step5MandiDiscoveryProps> = ({
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
  apiStatus,
  cropName,
  discoveryLevel,
  apiErrorCategory,
  isDiscovering,
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
              <Store className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-sage px-2.5 py-0.5 rounded-full border border-rural-border">
                  Step 5 of 6
                </span>
                <span className="text-xs text-rural-muted">•</span>
                <span className="text-xs font-semibold text-rural-forest">Market Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest mt-1">
                Discover the Best Markets for Your Harvest
              </h2>
              <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
                Compare actual market prices, road distances, available capacity and estimated take-home earnings.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>Next: Profit Decision</span>
              <ArrowRight className="w-4 h-4 text-rural-fresh" />
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Content Area */}
      {isDiscovering && evaluations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rural-border p-12 text-center shadow-rural-soft">
          <Loader2 className="w-9 h-9 animate-spin text-rural-primary mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Querying Agricultural Mandis & Road Routes...
          </h3>
          <p className="text-xs text-rural-muted mt-1 max-w-md mx-auto font-sans">
            Calculating real OSRM driving distances and retrieving daily modal rates from AGMARKNET for {cropName || 'your crop'}.
          </p>
        </div>
      ) : (
        <DynamicMarketSection
          farmerLocation={farmerLocation}
          evaluations={evaluations}
          recommendedMarket={recommendedMarket}
          closestFeasibleMarket={closestFeasibleMarket}
          totalCandidatesFound={totalCandidatesFound}
          sortOption={sortOption}
          filters={filters}
          onSortChange={onSortChange}
          onFilterChange={onFilterChange}
          onSelectBreakdown={onSelectBreakdown}
          apiStatus={apiStatus}
          cropName={cropName}
          discoveryLevel={discoveryLevel}
          apiErrorCategory={apiErrorCategory}
        />
      )}

      {/* Navigation Buttons Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-rural-border/70">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-rural-cream text-rural-charcoal border border-rural-border font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Logistics</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span>View Profit Optimization & Decision Dashboard</span>
          <ArrowRight className="w-4 h-4 text-rural-fresh" />
        </button>
      </div>
    </div>
  );
};

