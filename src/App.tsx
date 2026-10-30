import React, { useState, useMemo } from 'react';
import {
  FarmerInputs,
  CropProfile,
  MarketCalculationResult,
} from './types/agriculture';
import { getCropById } from './data/crops';
import { getSimulatedMarketsForCrop } from './data/markets';
import { rankMarketsByNetReturn } from './engine/ranking';
import { analyzeHighestPriceVsNetReturn } from './engine/recommendations';
import { optimizeSplitHarvest } from './engine/splitHarvest';
import { convertToQuintals } from './engine/units';
import { validateFarmerInputs } from './utils/validation';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CropSelector } from './components/forms/CropSelector';
import { HarvestDetails } from './components/forms/HarvestDetails';
import { GradeDistributionForm } from './components/forms/GradeDistribution';
import { SpoilageConfigForm } from './components/forms/SpoilageConfig';
import { TransportConfigForm } from './components/forms/TransportConfig';

import { MetricCards } from './components/dashboard/MetricCards';
import { ComparisonCard } from './components/dashboard/ComparisonCard';
import { MarketRankingTable } from './components/markets/MarketRankingTable';
import { InfeasibleMarketsSection } from './components/markets/InfeasibleMarketsSection';
import { FinancialBreakdownModal } from './components/dashboard/FinancialBreakdownModal';
import { SensitivityAnalysis } from './components/dashboard/SensitivityAnalysis';
import { SplitHarvestModal } from './components/dashboard/SplitHarvestModal';
import { FinancialWaterfallChart } from './components/charts/FinancialWaterfallChart';
import { VerificationModal } from './components/dashboard/VerificationModal';

import { Split, ShieldCheck, AlertTriangle } from 'lucide-react';

const INITIAL_INPUTS: FarmerInputs = {
  cropId: 'tomato',
  quantity: 20,
  quantityUnit: 'quintal',
  harvestDate: new Date().toISOString().split('T')[0],
  maturity: 'optimal',
  originLocation: 'Navalgund Farm Gate, Dharwad Hub',
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
      capacityQuintals: 30,
      additionalChargesPerTrip: 400,
      rentalModel: 'distance_scaled',
    },
  },
};

export const App: React.FC = () => {
  const [inputs, setInputs] = useState<FarmerInputs>(INITIAL_INPUTS);
  const [selectedBreakdownMarket, setSelectedBreakdownMarket] =
    useState<MarketCalculationResult | null>(null);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  // Selected crop profile
  const currentCrop = useMemo(() => getCropById(inputs.cropId), [inputs.cropId]);

  // Standardized harvest volume in Quintals
  const totalQuintals = useMemo(
    () => convertToQuintals(inputs.quantity, inputs.quantityUnit),
    [inputs.quantity, inputs.quantityUnit]
  );

  // Simulated markets tailored specifically to current crop's economics
  const markets = useMemo(() => getSimulatedMarketsForCrop(currentCrop), [currentCrop]);

  // Execute Calculation Engine
  const ranking = useMemo(
    () => rankMarketsByNetReturn(inputs, currentCrop, markets),
    [inputs, currentCrop, markets]
  );

  // Highest Price vs Highest Net Return comparison (weighted by farmer's grade distribution)
  const comparison = useMemo(
    () =>
      analyzeHighestPriceVsNetReturn(
        ranking.allResults,
        ranking.feasibleMarkets,
        inputs.gradeDistribution
      ),
    [ranking, inputs.gradeDistribution]
  );

  // Optional Split-Harvest optimization
  const splitResult = useMemo(
    () =>
      optimizeSplitHarvest(
        inputs,
        currentCrop,
        markets,
        ranking.bestMarket?.netReturn || 0
      ),
    [inputs, currentCrop, markets, ranking.bestMarket]
  );

  // Validation
  const validation = useMemo(() => validateFarmerInputs(inputs), [inputs]);

  // Handlers
  const handleCropChange = (crop: CropProfile) => {
    setInputs((prev) => ({
      ...prev,
      cropId: crop.id,
      gradeDistribution: { ...crop.defaultGradeDistribution },
      maturity: crop.defaultFreshness,
    }));
  };

  const handleResetDefaults = () => {
    setInputs(INITIAL_INPUTS);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFuelPriceChange = (newPrice: number) => {
    setInputs((prev) => ({
      ...prev,
      transport: {
        ...prev.transport,
        ownVehicle: {
          ...prev.transport.ownVehicle,
          fuelPricePerLitre: newPrice,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-warmbg-50">
      {/* Top Navigation */}
      <Navbar
        onResetDefaults={handleResetDefaults}
        onPrint={handlePrint}
        onToggleVerification={() => setIsVerificationModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title & Context Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Decision Support Engine
              </span>
              <span className="text-xs text-stone-500">•</span>
              <span className="text-xs text-stone-600 font-medium">
                {currentCrop.name} ({totalQuintals.toFixed(1)} Quintals)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
              Market Selection & Net Return Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
              Calculate true in-pocket earnings across regional markets by factoring in transit
              spoilage, fuel, vehicle capacity limits, handling, and regulated mandi fees.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center space-x-2 self-start md:self-auto no-print">
            {splitResult && splitResult.isSplitAdvantageous && (
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                <Split className="w-3.5 h-3.5" />
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Engine Status: Active</span>
            </button>
          </div>
        </div>

        {/* Validation Errors Notice if any */}
        {!validation.isValid && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start space-x-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
        <div className="space-y-6">
          {/* Section: Top Financial Metric Cards */}
          <MetricCards
            bestMarket={ranking.bestMarket}
            totalHarvestQuintals={totalQuintals}
          />

          {/* Section: Signature Twist - Highest Price vs Highest Net Return */}
          <ComparisonCard comparison={comparison} />

          {/* Two-Column Responsive Layout: Farmer Inputs on Left, Results on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Comprehensive Farmer Input Forms */}
            <div className="lg:col-span-5 space-y-4 no-print">
              <div className="bg-stone-900 text-stone-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Farmer Dispatch Parameters
                </span>
                <span className="text-[11px] text-stone-400">
                  Live recalculation on change
                </span>
              </div>

              {/* 1. Crop Selector */}
              <CropSelector
                selectedCrop={currentCrop}
                onCropChange={handleCropChange}
              />

              {/* 2. Harvest Details */}
              <HarvestDetails
                inputs={inputs}
                onChange={(updates) => setInputs((prev) => ({ ...prev, ...updates }))}
                error={validation.errors.quantity}
              />

              {/* 3. Grade Distribution */}
              <GradeDistributionForm
                gradeDistribution={inputs.gradeDistribution}
                totalQuintals={totalQuintals}
                onChange={(dist) => setInputs((prev) => ({ ...prev, gradeDistribution: dist }))}
                error={validation.errors.grades}
              />

              {/* 4. Spoilage Model */}
              <SpoilageConfigForm
                spoilage={inputs.spoilage}
                crop={currentCrop}
                onChange={(updates) =>
                  setInputs((prev) => ({
                    ...prev,
                    spoilage: { ...prev.spoilage, ...updates },
                  }))
                }
                error={validation.errors.spoilage}
              />

              {/* 5. Transportation Economics */}
              <TransportConfigForm
                transport={inputs.transport}
                totalQuintals={totalQuintals}
                onChange={(updates) =>
                  setInputs((prev) => ({
                    ...prev,
                    transport: { ...prev.transport, ...updates },
                  }))
                }
                errors={validation.errors}
              />
            </div>

            {/* Right Column: Ranked Markets, Waterfall Chart & Analysis */}
            <div className="lg:col-span-7 space-y-6">
              {/* Feasible Single-Market Ranking Table */}
              <MarketRankingTable
                feasibleMarkets={ranking.feasibleMarkets}
                onSelectMarket={(m) => setSelectedBreakdownMarket(m)}
              />

              {/* Financial Waterfall Chart */}
              <FinancialWaterfallChart bestMarket={ranking.bestMarket} />

              {/* Infeasible Markets Section */}
              <InfeasibleMarketsSection
                infeasibleMarkets={ranking.infeasibleMarkets}
                onSelectMarket={(m) => setSelectedBreakdownMarket(m)}
              />

              {/* Sensitivity & Break-Even Decision Matrix */}
              <SensitivityAnalysis
                bestMarket={ranking.bestMarket}
                feasibleMarkets={ranking.feasibleMarkets}
                currentFuelPrice={inputs.transport.ownVehicle.fuelPricePerLitre}
                onFuelPriceChange={handleFuelPriceChange}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
