import React, { useState, useMemo, useEffect } from 'react';
import {
  FarmerInputs,
  CropProfile,
  MarketCalculationResult,
  SplitHarvestResult,
} from './types/agriculture';
import {
  FarmerLocation,
  MandiFilterOptions,
  MandiSortOption,
  DynamicMandiEvaluation,
} from './types/marketDiscovery';
import { getCropById } from './data/crops';
import { MarketRankingResult } from './engine/ranking';
import { analyzeHighestPriceVsNetReturn } from './engine/recommendations';
import { optimizeSplitHarvest } from './engine/splitHarvest';
import { convertToQuintals } from './engine/units';
import { validateFarmerInputs } from './utils/validation';
import { resolveManualLocation } from './services/locationService';
import { discoverAndEvaluateMandis, DiscoveryEngineResult } from './engine/discoveryEngine';
import { convertDynamicToMarketCalculationResult } from './utils/dynamicAdapter';

import { LandingPage } from './components/landing/LandingPage';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CropSelector } from './components/forms/CropSelector';
import { LocationSelector } from './components/forms/LocationSelector';
import { HarvestDetails } from './components/forms/HarvestDetails';
import { SpoilageConfigForm } from './components/forms/SpoilageConfig';
import { TransportConfigForm } from './components/forms/TransportConfig';

import { MetricCards } from './components/dashboard/MetricCards';
import { ComparisonCard } from './components/dashboard/ComparisonCard';
import { DynamicMarketSection } from './components/dashboard/DynamicMarketSection';
import { MarketRankingTable } from './components/markets/MarketRankingTable';
import { SplitHarvestSection } from './components/dashboard/SplitHarvestSection';
import { FinancialBreakdownModal } from './components/dashboard/FinancialBreakdownModal';
import { SplitHarvestModal } from './components/dashboard/SplitHarvestModal';
import { FinancialWaterfallChart } from './components/charts/FinancialWaterfallChart';
import { VerificationModal } from './components/dashboard/VerificationModal';
import { MarketReportModal } from './components/dashboard/MarketReportModal';

import { Split, ShieldCheck, AlertCircle, Sprout, Loader2 } from 'lucide-react';

const INITIAL_LOCATION: FarmerLocation = resolveManualLocation(
  'Karnataka',
  'Dharwad',
  'Navalgund Farm Gate',
  '582208'
);

const INITIAL_INPUTS: FarmerInputs = {
  cropId: 'tomato',
  quantity: 20,
  quantityUnit: 'quintal',
  harvestDate: new Date().toISOString().split('T')[0],
  maturity: 'optimal',
  originLocation: INITIAL_LOCATION.formattedAddress,
  gradeDistribution: { A: 50, B: 35, C: 15 },
  spoilage: {
    mode: 'automatic',
    manualPercentage: 4,
    temperature: 'warm',
    vehicleProtection: 'open',
    handling: 'standard',
    delayHours: 1,
  },
  transport: {
    type: 'own',
    ownVehicle: {
      capacityQuintals: 25,
      mileageKmPerLitre: 8,
      fuelPricePerLitre: 96,
      maintenancePerKm: 2,
      driverCostPerTrip: 500,
      tollAndOtherExpenses: 200,
      returnTripRequired: true,
    },
    rentedVehicle: {
      rentalQuotationPerTrip: 3500,
      rentalRatePerKm: 35,
      capacityQuintals: 30,
      additionalChargesPerTrip: 0,
      rentalModel: 'distance_scaled',
    },
  },
};

export const App: React.FC = () => {
  // View Router State: Default to 'landing' as specified in product requirements
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
      return 'dashboard';
    }
    return 'landing';
  });

  // Handle browser back/forward history navigation cleanly
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState({}, '', '/dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Farmer Inputs & Location State
  const [inputs, setInputs] = useState<FarmerInputs>(INITIAL_INPUTS);
  const [farmerLocation, setFarmerLocation] = useState<FarmerLocation>(INITIAL_LOCATION);

  // Phase 5 Discovery State
  const [sortOption, setSortOption] = useState<MandiSortOption>('netRevenue');
  const [filters, setFilters] = useState<MandiFilterOptions>({});
  const [dynamicResult, setDynamicResult] = useState<DiscoveryEngineResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);

  // Modals
  const [selectedBreakdownMarket, setSelectedBreakdownMarket] =
    useState<MarketCalculationResult | null>(null);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Selected crop profile
  const currentCrop = useMemo(() => getCropById(inputs.cropId), [inputs.cropId]);

  // Standardized harvest volume in Quintals
  const totalQuintals = useMemo(
    () => convertToQuintals(inputs.quantity, inputs.quantityUnit),
    [inputs.quantity, inputs.quantityUnit]
  );

  // Phase 5: Execute Dynamic National Mandi Discovery & Profit Engine (Always Real / Discovered Data)
  useEffect(() => {
    let isMounted = true;
    setIsDiscovering(true);

    discoverAndEvaluateMandis(
      farmerLocation,
      currentCrop,
      totalQuintals,
      inputs.transport,
      inputs.spoilage,
      inputs.maturity,
      {
        sortOption,
        filters,
      }
    )
      .then((res) => {
        if (isMounted) {
          setDynamicResult(res);
          setIsDiscovering(false);
        }
      })
      .catch((err) => {
        console.error('Error in dynamic mandi discovery:', err);
        if (isMounted) setIsDiscovering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    farmerLocation,
    currentCrop,
    totalQuintals,
    inputs.transport,
    inputs.spoilage,
    inputs.maturity,
    sortOption,
    filters,
  ]);

  // Verified market calculations derived exclusively from dynamic mandi discovery
  const verifiedEvaluations = useMemo(() => {
    if (!dynamicResult) return [];
    return dynamicResult.evaluatedMarkets.filter(
      (m) => m.hasVerifiedPrice && m.priceRecord && m.priceRecord.modalPrice > 0
    );
  }, [dynamicResult]);

  const verifiedMarketCalculations = useMemo(() => {
    return verifiedEvaluations.map(convertDynamicToMarketCalculationResult);
  }, [verifiedEvaluations]);

  const verifiedFeasibleMarkets = useMemo(() => {
    return verifiedMarketCalculations
      .filter((m) => m.isFeasible)
      .sort((a, b) => b.netReturn - a.netReturn);
  }, [verifiedMarketCalculations]);

  const bestSingleMarket = useMemo(() => {
    if (dynamicResult?.recommendedMarket && dynamicResult.recommendedMarket.hasVerifiedPrice) {
      return convertDynamicToMarketCalculationResult(dynamicResult.recommendedMarket);
    }
    return verifiedFeasibleMarkets.length > 0 ? verifiedFeasibleMarkets[0] : null;
  }, [dynamicResult, verifiedFeasibleMarkets]);

  const eligibleRealMarkets = useMemo(() => {
    return verifiedFeasibleMarkets.map((m) => m.market);
  }, [verifiedFeasibleMarkets]);

  // Highest Price vs Highest Net Return comparison (using actual verified markets)
  const comparison = useMemo(() => {
    if (verifiedFeasibleMarkets.length === 0) return null;
    return analyzeHighestPriceVsNetReturn(
      verifiedMarketCalculations,
      verifiedFeasibleMarkets,
      inputs.gradeDistribution
    );
  }, [verifiedMarketCalculations, verifiedFeasibleMarkets, inputs.gradeDistribution]);

  // Split-Harvest optimization (using actual verified markets)
  const splitResult = useMemo(() => {
    if (eligibleRealMarkets.length < 2 || !bestSingleMarket) {
      return {
        recommendedStrategy: bestSingleMarket ? 'single' : 'none',
        baselineSingleMarket: bestSingleMarket,
        allocations: [],
        planTotals: bestSingleMarket
          ? {
              totalAllocatedQuintals: bestSingleMarket.initialQuantityQuintals,
              totalLossQuintals: bestSingleMarket.physicalLossQuintals,
              totalSaleableQuintals: bestSingleMarket.saleableQuantityQuintals,
              totalGrossRevenue: bestSingleMarket.grossRevenue,
              totalTransportCost: bestSingleMarket.transportationCost,
              totalMarketFees: bestSingleMarket.totalMarketFees,
              totalNetReturn: bestSingleMarket.netReturn,
              netReturnPerQuintal: bestSingleMarket.netReturnPerQuintal,
            }
          : {
              totalAllocatedQuintals: 0,
              totalLossQuintals: 0,
              totalSaleableQuintals: 0,
              totalGrossRevenue: 0,
              totalTransportCost: 0,
              totalMarketFees: 0,
              totalNetReturn: 0,
              netReturnPerQuintal: 0,
            },
        baselineTotals: bestSingleMarket
          ? {
              totalAllocatedQuintals: bestSingleMarket.initialQuantityQuintals,
              totalLossQuintals: bestSingleMarket.physicalLossQuintals,
              totalSaleableQuintals: bestSingleMarket.saleableQuantityQuintals,
              totalGrossRevenue: bestSingleMarket.grossRevenue,
              totalTransportCost: bestSingleMarket.transportationCost,
              totalMarketFees: bestSingleMarket.totalMarketFees,
              totalNetReturn: bestSingleMarket.netReturn,
              netReturnPerQuintal: bestSingleMarket.netReturnPerQuintal,
            }
          : null,
        totalNetReturn: bestSingleMarket ? bestSingleMarket.netReturn : 0,
        singleBestNetReturn: bestSingleMarket ? bestSingleMarket.netReturn : 0,
        totalAllocatedQuintals: bestSingleMarket ? bestSingleMarket.initialQuantityQuintals : 0,
        totalSaleableQuintals: bestSingleMarket ? bestSingleMarket.saleableQuantityQuintals : 0,
        netGainFromSplitting: 0,
        netGainPerQuintal: 0,
        isSplitAdvantageous: false,
        hasFeasibleSplit: false,
        explanation:
          eligibleRealMarkets.length < 2
            ? 'Not enough verified market data to calculate a split-harvest plan.'
            : 'No single market or split plan meets all feasibility criteria.',
        strategyRationale:
          eligibleRealMarkets.length < 2
            ? 'At least two verified APMC markets are required to evaluate a split-harvest allocation.'
            : 'Feasibility constraints unmet.',
        rejectedPlans: [],
        searchMetadata: {
          plansEvaluated: 0,
          feasiblePlansCount: 0,
          discretizationStepQuintals: 1,
          assumptions: [],
        },
      } as SplitHarvestResult;
    }

    return optimizeSplitHarvest(
      inputs,
      currentCrop,
      eligibleRealMarkets,
      bestSingleMarket
    );
  }, [inputs, currentCrop, eligibleRealMarkets, bestSingleMarket]);

  // Verified ranking result for reports and modals
  const verifiedRanking: MarketRankingResult = useMemo(
    () => ({
      bestMarket: bestSingleMarket,
      feasibleMarkets: verifiedFeasibleMarkets,
      infeasibleMarkets: [],
      allResults: verifiedMarketCalculations,
      totalMarketsEvaluated: verifiedMarketCalculations.length,
      feasibleMarketsCount: verifiedFeasibleMarkets.length,
      infeasibleMarketsCount: 0,
      hasFeasibleMarkets: verifiedFeasibleMarkets.length > 0,
    }),
    [bestSingleMarket, verifiedFeasibleMarkets, verifiedMarketCalculations]
  );

  // Validation
  const validation = useMemo(() => validateFarmerInputs(inputs), [inputs]);

  // Determine overall agricultural price data source status
  const overallPriceStatus = useMemo<'LIVE' | 'CACHED' | 'SAMPLE' | 'UNAVAILABLE'>(() => {
    if (!dynamicResult || dynamicResult.evaluatedMarkets.length === 0) {
      return 'UNAVAILABLE';
    }
    const verifiedPrices = dynamicResult.evaluatedMarkets.filter((m) => m.hasVerifiedPrice);
    if (verifiedPrices.length === 0) return 'UNAVAILABLE';
    const sourceTypes = verifiedPrices.map((m) => m.priceSourceType);
    if (sourceTypes.includes('LIVE')) return 'LIVE';
    if (sourceTypes.includes('CACHED') || sourceTypes.includes('WEB_DISCOVERED') || sourceTypes.includes('HISTORICAL')) {
      return 'CACHED';
    }
    return 'UNAVAILABLE';
  }, [dynamicResult]);

  // Handlers
  const handleCropChange = (crop: CropProfile) => {
    setInputs((prev) => ({
      ...prev,
      cropId: crop.id,
      maturity: crop.defaultFreshness,
    }));
  };

  const handleLocationChange = (newLoc: FarmerLocation) => {
    setFarmerLocation(newLoc);
    setInputs((prev) => ({
      ...prev,
      originLocation: newLoc.formattedAddress,
    }));
  };

  const handleResetDefaults = () => {
    setInputs(INITIAL_INPUTS);
    setFarmerLocation(INITIAL_LOCATION);
    setSortOption('netRevenue');
    setFilters({});
  };

  const handlePrint = () => {
    setIsReportModalOpen(true);
  };

  const updateInputs = (updater: (prev: FarmerInputs) => FarmerInputs) => {
    setInputs(updater);
  };

  const handleSelectDynamicBreakdown = (mandi: DynamicMandiEvaluation) => {
    const converted = convertDynamicToMarketCalculationResult(mandi);
    setSelectedBreakdownMarket(converted);
  };

  // If in Landing Page view, render the comprehensive Rural Roots landing page
  if (currentView === 'landing') {
    return <LandingPage onOpenDashboard={navigateToDashboard} />;
  }

  // If in Dashboard view, render the full functional HarvestRoute dashboard
  return (
    <div className="min-h-screen flex flex-col bg-rural-cream text-rural-charcoal font-sans">
      {/* Top Navigation */}
      <Navbar
        onGoHome={navigateToLanding}
        onResetDefaults={handleResetDefaults}
        onPrint={handlePrint}
        onToggleVerification={() => setIsVerificationModalOpen(true)}
        priceStatus={overallPriceStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Context Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-rural-border gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rural-forest bg-rural-mint px-3 py-1 rounded-full border border-rural-fresh/30">
                Phase 5 Real-Time Mandi Intelligence
              </span>
              <span className="text-xs text-rural-muted">•</span>
              <span className="text-xs text-rural-charcoal font-semibold">
                {currentCrop.name} ({totalQuintals.toFixed(1)} Qtl) • {farmerLocation.district}, {farmerLocation.state}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-rural-forest tracking-tight mt-1.5">
              Find the Best Market for Your Harvest
            </h1>
            <p className="text-sm sm:text-base text-rural-muted mt-1.5 max-w-3xl font-sans font-light">
              Compare real road distances, live daily wholesale prices from AGMARKNET, and net take-home earnings across India.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center space-x-3 self-start md:self-auto no-print">
            {splitResult && splitResult.isSplitAdvantageous && (
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rural-forest text-white hover:bg-rural-deep shadow-sm transition-all cursor-pointer"
              >
                <Split className="w-4 h-4 text-rural-fresh" />
                <span>
                  Split Harvest (+
                  {splitResult.netGainFromSplitting > 0
                    ? `₹${splitResult.netGainFromSplitting.toLocaleString('en-IN')}`
                    : ''}
                  )
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-rural-forest border border-rural-border hover:bg-rural-sage/60 transition-colors shadow-rural-soft cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-rural-primary" />
              <span>Calculator Is Ready</span>
            </button>
          </div>
        </div>

        {/* Validation Errors Notice if any */}
        {!validation.isValid && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-sm block">Please Adjust Input Values:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-800">
                {Object.values(validation.errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="space-y-8">
          {/* Section: Top Hero Metric Cards */}
          <MetricCards
            bestMarket={bestSingleMarket}
            totalHarvestQuintals={totalQuintals}
          />

          {/* Section: Signature Comparison - The Highest Price Is Not Always the Best Deal */}
          <ComparisonCard comparison={comparison} />

          {/* Two-Column Responsive Layout: Farmer Inputs on Left, Results on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Farmer Input Forms */}
            <div className="lg:col-span-5 space-y-5 no-print">
              <div className="bg-rural-forest text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-rural-soft">
                <div className="flex items-center space-x-2">
                  <Sprout className="w-4 h-4 text-rural-fresh" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-rural-mint">
                    Your Harvest & Logistics Details
                  </span>
                </div>
                <span className="text-[11px] text-rural-mint/80">
                  Calculates automatically
                </span>
              </div>

              {/* 1. Crop Selector */}
              <CropSelector
                selectedCrop={currentCrop}
                onCropChange={handleCropChange}
              />

              {/* 2. Farm Location & Dynamic Mandi Discovery (Phase 5) */}
              <LocationSelector
                currentLocation={farmerLocation}
                onLocationChange={handleLocationChange}
              />

              {/* 3. Harvest Details */}
              <HarvestDetails
                inputs={inputs}
                onChange={(updates) => updateInputs((prev) => ({ ...prev, ...updates }))}
                error={validation.errors.quantity}
              />

              {/* 4. Expected Produce Loss */}
              <SpoilageConfigForm
                spoilage={inputs.spoilage}
                crop={currentCrop}
                onChange={(updates) =>
                  updateInputs((prev) => ({
                    ...prev,
                    spoilage: { ...prev.spoilage, ...updates },
                  }))
                }
                error={validation.errors.spoilage}
              />

              {/* 5. Transport Details */}
              <TransportConfigForm
                transport={inputs.transport}
                totalQuintals={totalQuintals}
                onChange={(updates) =>
                  updateInputs((prev) => ({
                    ...prev,
                    transport: { ...prev.transport, ...updates },
                  }))
                }
                errors={validation.errors}
              />
            </div>

            {/* Right Column: Ranked Markets, Split Harvest, Waterfall Chart, Markets Compared */}
            <div className="lg:col-span-7 space-y-8">
              {/* Phase 5: Dynamic National Mandi Discovery & Live AGMARKNET Prices */}
              {isDiscovering && !dynamicResult ? (
                <div className="bg-white rounded-3xl border border-rural-border p-12 text-center shadow-rural-soft">
                  <Loader2 className="w-8 h-8 animate-spin text-rural-primary mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-lg text-rural-forest">
                    Discovering Agricultural Mandis & Routing...
                  </h3>
                  <p className="text-xs text-rural-muted mt-1 max-w-md mx-auto">
                    Computing real OSRM road mileage and querying daily modal rates from AGMARKNET for {farmerLocation.district}.
                  </p>
                </div>
              ) : dynamicResult ? (
                <DynamicMarketSection
                  farmerLocation={farmerLocation}
                  evaluations={dynamicResult.evaluatedMarkets}
                  recommendedMarket={dynamicResult.recommendedMarket}
                  closestFeasibleMarket={dynamicResult.closestFeasibleMarket}
                  totalCandidatesFound={dynamicResult.totalCandidatesFound}
                  sortOption={sortOption}
                  filters={filters}
                  onSortChange={setSortOption}
                  onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
                  onSelectBreakdown={handleSelectDynamicBreakdown}
                  apiStatus={dynamicResult.apiStatus}
                  cropName={currentCrop.name}
                  discoveryLevel={dynamicResult.discoveryLevel}
                  apiErrorCategory={dynamicResult.apiErrorCategory}
                />
              ) : null}

              {/* Split-Harvest Optimization Section ("Should You Sell at One Market or More Than One?") */}
              <SplitHarvestSection splitResult={splitResult} />

              {/* Financial Waterfall Chart ("Where Your Money Goes") */}
              <FinancialWaterfallChart bestMarket={bestSingleMarket} />

              {/* Verified Feasible Single-Market Ranking Table ("Markets Compared") */}
              <MarketRankingTable
                feasibleMarkets={verifiedFeasibleMarkets}
                onSelectMarket={(m) => setSelectedBreakdownMarket(m)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Dialogs */}
      {selectedBreakdownMarket && (
        <FinancialBreakdownModal
          result={selectedBreakdownMarket}
          onClose={() => setSelectedBreakdownMarket(null)}
        />
      )}

      {isSplitModalOpen && splitResult && (
        <SplitHarvestModal
          splitResult={splitResult}
          onClose={() => setIsSplitModalOpen(false)}
        />
      )}

      {isVerificationModalOpen && (
        <VerificationModal onClose={() => setIsVerificationModalOpen(false)} />
      )}

      {isReportModalOpen && (
        <MarketReportModal
          inputs={inputs}
          crop={currentCrop}
          totalQuintals={totalQuintals}
          ranking={verifiedRanking}
          splitResult={splitResult}
          comparison={comparison}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
