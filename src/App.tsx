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

// Landing & Layout Components
import { LandingPage } from './components/landing/LandingPage';
import { Navbar, AppView } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Guided Workflow Dashboard Steps
import { StepNavigation, DashboardStep } from './components/dashboard/StepNavigation';
import { Step1Overview } from './components/dashboard/steps/Step1Overview';
import { Step2CropHarvest } from './components/dashboard/steps/Step2CropHarvest';
import { Step3Location } from './components/dashboard/steps/Step3Location';
import { Step4Logistics } from './components/dashboard/steps/Step4Logistics';
import { Step5MandiDiscovery } from './components/dashboard/steps/Step5MandiDiscovery';
import { Step6ProfitDecision } from './components/dashboard/steps/Step6ProfitDecision';

// B2B Institutional Marketplace
import { BulkBuyerMarketplace } from './components/marketplace/BulkBuyerMarketplace';

// Modals
import { FinancialBreakdownModal } from './components/dashboard/FinancialBreakdownModal';
import { SplitHarvestModal } from './components/dashboard/SplitHarvestModal';
import { VerificationModal } from './components/dashboard/VerificationModal';
import { MarketReportModal } from './components/dashboard/MarketReportModal';

import { Split, ShieldCheck, AlertCircle, Printer, FileText } from 'lucide-react';

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
  // Main Application View Router
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/dashboard') {
      return 'dashboard';
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/marketplace') {
      return 'marketplace';
    }
    return 'landing';
  });

  // Guided Multi-Step Workflow Step (1..6)
  const [currentStep, setCurrentStep] = useState<DashboardStep>(1);

  // Synchronize browser history and URL paths
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/marketplace') {
        setCurrentView('marketplace');
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateView = (view: AppView, step?: DashboardStep) => {
    if (view === 'reports') {
      setIsReportModalOpen(true);
      return;
    }
    setCurrentView(view);
    if (step) {
      setCurrentStep(step);
    }
    const path = view === 'landing' ? '/' : `/${view}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Farmer Inputs & Origin Location
  const [inputs, setInputs] = useState<FarmerInputs>(INITIAL_INPUTS);
  const [farmerLocation, setFarmerLocation] = useState<FarmerLocation>(INITIAL_LOCATION);

  // Real Dynamic APMC Mandi Discovery State (Level 1, 2, 3 + Tavily Search Fallback)
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

  // Dynamic National Mandi Discovery & Profit Engine (Always Real / Discovered Data)
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

  // Verified market calculations derived exclusively from real dynamic mandi discovery
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

  // Dynamic AGMARKNET Price Feed Status
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
    setCurrentStep(1);
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

  // Completed steps calculation for progress indicators
  const completedSteps = useMemo<DashboardStep[]>(() => {
    const list: DashboardStep[] = [];
    if (currentStep > 1) list.push(1);
    if (currentStep > 2 && validation.isValid) list.push(2);
    if (currentStep > 3) list.push(3);
    if (currentStep > 4) list.push(4);
    if (currentStep > 5 && verifiedMarketCalculations.length > 0) list.push(5);
    return list;
  }, [currentStep, validation.isValid, verifiedMarketCalculations.length]);

  // VIEW 1: LANDING PAGE
  if (currentView === 'landing') {
    return (
      <LandingPage
        onOpenDashboard={() => handleNavigateView('dashboard', 1)}
        onOpenMandiPrices={() => handleNavigateView('dashboard', 5)}
        onOpenMarketplace={() => handleNavigateView('marketplace')}
        onOpenReports={handlePrint}
      />
    );
  }

  // VIEW 2: B2B BULK BUYER MARKETPLACE
  if (currentView === 'marketplace') {
    return (
      <div className="min-h-screen flex flex-col bg-rural-cream text-rural-charcoal font-sans selection:bg-rural-mint selection:text-rural-deep">
        <Navbar
          currentView="marketplace"
          onNavigateView={handleNavigateView}
          onResetDefaults={handleResetDefaults}
          onPrint={handlePrint}
          onToggleVerification={() => setIsVerificationModalOpen(true)}
          priceStatus={overallPriceStatus}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BulkBuyerMarketplace
            currentCrop={currentCrop}
            onGoToDashboard={() => handleNavigateView('dashboard', 1)}
          />
        </main>

        <Footer />

        {isVerificationModalOpen && (
          <VerificationModal onClose={() => setIsVerificationModalOpen(false)} />
        )}
      </div>
    );
  }

  // VIEW 3: GUIDED 6-STEP FARMER DASHBOARD
  return (
    <div className="min-h-screen flex flex-col bg-rural-cream text-rural-charcoal font-sans selection:bg-rural-mint selection:text-rural-deep">
      {/* Top Application Navigation */}
      <Navbar
        currentView="dashboard"
        currentStep={currentStep}
        onNavigateView={handleNavigateView}
        onResetDefaults={handleResetDefaults}
        onPrint={handlePrint}
        onToggleVerification={() => setIsVerificationModalOpen(true)}
        priceStatus={overallPriceStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Context Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-rural-border gap-4 no-print">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-forest bg-rural-mint px-2.5 py-0.5 rounded-full border border-rural-fresh/30">
                Phase 5 Real-Time Mandi Intelligence
              </span>
              <span className="text-xs text-rural-muted">•</span>
              <span className="text-xs text-rural-charcoal font-semibold">
                {currentCrop.name} ({totalQuintals.toFixed(1)} Qtl) • {farmerLocation.district}, {farmerLocation.state}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rural-forest tracking-tight mt-1">
              Find the Best Market for Your Harvest
            </h1>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center space-x-3 self-start md:self-auto no-print">
            {splitResult && splitResult.isSplitAdvantageous && (
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rural-forest text-white hover:bg-rural-deep shadow-sm transition-all cursor-pointer"
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
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium bg-white text-rural-forest border border-rural-border hover:bg-rural-sage/60 transition-colors shadow-rural-soft cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-rural-primary" />
              <span>Calculator Ready</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rural-fresh text-white hover:bg-rural-fresh/90 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Validation Errors Notice */}
        {!validation.isValid && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start space-x-3 shadow-sm no-print">
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

        {/* Sticky Guided 6-Step Workflow Stepper */}
        <StepNavigation
          currentStep={currentStep}
          onStepChange={(s) => {
            setCurrentStep(s);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          completedSteps={completedSteps}
        />

        {/* Active Step Content */}
        <div className="transition-all duration-200">
          {currentStep === 1 && (
            <Step1Overview
              currentCrop={currentCrop}
              farmerLocation={farmerLocation}
              totalQuintals={totalQuintals}
              recommendedMarket={dynamicResult?.recommendedMarket || null}
              onStartHarvest={() => setCurrentStep(2)}
              onGoToMandiDiscovery={() => setCurrentStep(5)}
              onGoToMarketplace={() => handleNavigateView('marketplace')}
              onGoToReports={handlePrint}
              onGoToStep={(s) => setCurrentStep(s)}
            />
          )}

          {currentStep === 2 && (
            <Step2CropHarvest
              currentCrop={currentCrop}
              inputs={inputs}
              onCropChange={handleCropChange}
              onInputsChange={(updates) => updateInputs((prev) => ({ ...prev, ...updates }))}
              quantityError={validation.errors.quantity}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3Location
              farmerLocation={farmerLocation}
              evaluations={dynamicResult?.evaluatedMarkets || []}
              recommendedMarket={dynamicResult?.recommendedMarket || null}
              onLocationChange={handleLocationChange}
              onSelectBreakdown={handleSelectDynamicBreakdown}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Logistics
              currentCrop={currentCrop}
              totalQuintals={totalQuintals}
              inputs={inputs}
              onUpdateSpoilage={(updates) =>
                updateInputs((prev) => ({
                  ...prev,
                  spoilage: { ...prev.spoilage, ...updates },
                }))
              }
              onUpdateTransport={(updates) =>
                updateInputs((prev) => ({
                  ...prev,
                  transport: { ...prev.transport, ...updates },
                }))
              }
              validationErrors={validation.errors}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5MandiDiscovery
              farmerLocation={farmerLocation}
              evaluations={dynamicResult?.evaluatedMarkets || []}
              recommendedMarket={dynamicResult?.recommendedMarket || null}
              closestFeasibleMarket={dynamicResult?.closestFeasibleMarket || null}
              totalCandidatesFound={dynamicResult?.totalCandidatesFound || 0}
              sortOption={sortOption}
              filters={filters}
              onSortChange={setSortOption}
              onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
              onSelectBreakdown={handleSelectDynamicBreakdown}
              apiStatus={dynamicResult?.apiStatus}
              cropName={currentCrop.name}
              discoveryLevel={dynamicResult?.discoveryLevel}
              apiErrorCategory={dynamicResult?.apiErrorCategory}
              isDiscovering={isDiscovering}
              onNext={() => setCurrentStep(6)}
              onBack={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6ProfitDecision
              bestMarket={bestSingleMarket}
              totalQuintals={totalQuintals}
              comparison={comparison}
              splitResult={splitResult}
              feasibleMarkets={verifiedFeasibleMarkets}
              onSelectBreakdown={(m) => setSelectedBreakdownMarket(m)}
              onPrintReport={handlePrint}
              onStartNewHarvest={() => setCurrentStep(1)}
              onBack={() => setCurrentStep(5)}
            />
          )}
        </div>
      </main>

      {/* Global Modals & Dialogs */}
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
