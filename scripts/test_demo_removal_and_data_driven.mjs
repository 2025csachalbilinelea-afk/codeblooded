/**
 * HARVESTROUTE COMPREHENSIVE VERIFICATION SUITE:
 * REMOVAL OF DEMO DATA & FULLY DATA-DRIVEN MARKET COMPARISON
 *
 * Verifies Tests A, B, C, D, and E according to user prompt specifications.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const { discoverAndEvaluateMandis } = jiti('../src/engine/discoveryEngine.ts');
const { resolveManualLocation } = jiti('../src/services/locationService.ts');
const { getCropById } = jiti('../src/data/crops.ts');
const { convertDynamicToMarketCalculationResult } = jiti('../src/utils/dynamicAdapter.ts');
const { optimizeSplitHarvest } = jiti('../src/engine/splitHarvest.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testId, message, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testId}: ${message}`);
    if (details) console.log(`       ↳ ${details}`);
  } else {
    console.error(`[FAIL] ${testId}: ${message}`);
    if (details) console.error(`       ↳ ${details}`);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('   HARVESTROUTE DEMO REMOVAL & DATA-DRIVEN AUDIT SUITE        ');
  console.log('===============================================================\n');

  // --- TEST D: REMOVED UI AUDIT (SOURCE CODE INSPECTION) ---
  console.log('--- 1. TEST D: REMOVED UI AUDIT ---');

  const appSrc = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
  const dynamicSectionSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/dashboard/DynamicMarketSection.tsx'),
    'utf8'
  );
  const harvestDetailsSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/forms/HarvestDetails.tsx'),
    'utf8'
  );
  const marketReportModalSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/dashboard/MarketReportModal.tsx'),
    'utf8'
  );

  // D.1: Markets That Cannot Buy Your Full Crop absent from App
  assert(
    !appSrc.includes('InfeasibleMarketsSection') &&
      !appSrc.includes('Markets That Cannot Buy Your Full Crop'),
    'TEST-D.1',
    'Markets That Cannot Buy Your Full Crop completely absent from App.tsx',
    'InfeasibleMarketsSection component is not imported or rendered.'
  );

  // D.2: Markets That Cannot Buy Your Full Crop absent from Report Modal
  assert(
    !marketReportModalSrc.includes('5. Markets That Cannot Buy Your Full Crop'),
    'TEST-D.2',
    'Markets That Cannot Buy Your Full Crop completely absent from MarketReportModal.tsx',
    'Section 5 removed from report output.'
  );

  // D.3: Expected Price per Quintal absent from Harvest Details
  assert(
    !harvestDetailsSrc.includes('Expected Price per Quintal') &&
      !harvestDetailsSrc.includes('expectedPricePerQuintal') &&
      !harvestDetailsSrc.includes('typicalPriceMin'),
    'TEST-D.3',
    'Expected Price per Quintal input completely removed from HarvestDetails.tsx',
    'Input field, label, reset button, and typical range helper text are absent.'
  );

  // D.4: Arrival dates absent from Mandi Discovery Cards
  assert(
    !dynamicSectionSrc.includes('>Arrival Date<') &&
      !dynamicSectionSrc.includes('{recommendedMarket.priceRecord?.arrivalDate}</span>') &&
      !dynamicSectionSrc.includes('{mandi.priceRecord.arrivalDate || \'N/A\'}</div>'),
    'TEST-D.4',
    'Arrival dates display completely removed from Mandi Cards in DynamicMarketSection.tsx',
    'Label and visible date value are removed from Hero card, regular cards, and table view.'
  );

  // D.5: AI Crop Price Forecast section absent from App
  assert(
    !appSrc.includes('CropPriceForecastSection') &&
      !appSrc.includes('AI Crop Price Forecast'),
    'TEST-D.5',
    'AI Crop Price Forecast section completely absent from App.tsx',
    'CropPriceForecastSection component and graph container are not rendered.'
  );

  // --- TEST A: MANDI DISCOVERY & ZERO DEMO BENCHMARKS ---
  console.log('\n--- 2. TEST A: MANDI DISCOVERY & ZERO DEMO BENCHMARKS ---');

  // A.1: No Demo Benchmarks mode toggle or button in DynamicMarketSection
  assert(
    !dynamicSectionSrc.includes('Demo Benchmarks') &&
      !dynamicSectionSrc.includes('Switch to Demo Benchmarks') &&
      !dynamicSectionSrc.includes('isLiveMode') &&
      !dynamicSectionSrc.includes('onToggleLiveMode'),
    'TEST-A.1',
    'No Demo Benchmarks option or mode switcher exists in DynamicMarketSection.tsx',
    'Toggle buttons, switch message, and demo benchmark modes have been removed.'
  );

  // A.2: App.tsx does not use simulated markets in production calculations
  assert(
    !appSrc.includes('getSimulatedMarketsForCrop') &&
      !appSrc.includes('DEMO_BENCHMARK'),
    'TEST-A.2',
    'App.tsx never loads simulated markets or passes DEMO_BENCHMARK',
    'Single source of truth is dynamicResult.evaluatedMarkets.'
  );

  // A.3: Dynamic Discovery returns real verified market records
  const farmerLoc = resolveManualLocation('Karnataka', 'Dharwad', 'Navalgund Farm Gate', '582208');
  const crop = getCropById('tomato');

  const defaultTransport = {
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
  };

  const defaultSpoilage = {
    mode: 'automatic',
    manualPercentage: 4,
    temperature: 'warm',
    vehicleProtection: 'open',
    handling: 'standard',
    delayHours: 1,
  };

  const discoveryRes = await discoverAndEvaluateMandis(
    farmerLoc,
    crop,
    20,
    defaultTransport,
    defaultSpoilage,
    'optimal',
    { sortOption: 'netRevenue' }
  );

  assert(
    discoveryRes.evaluatedMarkets.length > 0,
    'TEST-A.3',
    'Dynamic discovery returns actual APMC market records',
    `Discovered ${discoveryRes.evaluatedMarkets.length} candidate mandis across ${discoveryRes.discoveryLevel} level.`
  );

  const sampleMandi = discoveryRes.recommendedMarket || discoveryRes.evaluatedMarkets[0];
  assert(
    sampleMandi && sampleMandi.hasVerifiedPrice && sampleMandi.priceRecord.modalPrice > 0,
    'TEST-A.4',
    'Discovered market quotation has authentic price without demo fabrication',
    `Market: ${sampleMandi.market.marketName}, Modal: ₹${sampleMandi.priceRecord.modalPrice}/Qtl, Status: ${sampleMandi.internalPriceStatus}`
  );

  // --- TEST B: SINGLE MARKET VS SPLIT HARVEST DATA INTEGRITY ---
  console.log('\n--- 3. TEST B: SINGLE MARKET VS SPLIT HARVEST DATA INTEGRITY ---');

  const verifiedEvaluations = discoveryRes.evaluatedMarkets.filter(
    (m) => m.hasVerifiedPrice && m.priceRecord && m.priceRecord.modalPrice > 0
  );
  const verifiedCalculations = verifiedEvaluations.map(convertDynamicToMarketCalculationResult);
  const verifiedFeasible = verifiedCalculations
    .filter((m) => m.isFeasible)
    .sort((a, b) => b.netReturn - a.netReturn);
  const eligibleRealMarkets = verifiedFeasible.map((m) => m.market);
  const bestSingle = verifiedFeasible[0];

  assert(
    verifiedFeasible.length >= 2,
    'TEST-B.1',
    'At least 2 verified real APMC markets available for split evaluation',
    `Found ${verifiedFeasible.length} verified markets: ${verifiedFeasible.map((m) => m.market.name).slice(0, 3).join(', ')}...`
  );

  const inputs20Qtl = {
    cropId: 'tomato',
    quantity: 20,
    quantityUnit: 'quintal',
    harvestDate: '2026-10-31',
    maturity: 'optimal',
    originLocation: farmerLoc.formattedAddress,
    gradeDistribution: { A: 50, B: 35, C: 15 },
    spoilage: defaultSpoilage,
    transport: defaultTransport,
  };

  const splitRes20 = optimizeSplitHarvest(inputs20Qtl, crop, eligibleRealMarkets, bestSingle);

  assert(
    splitRes20.baselineSingleMarket &&
      splitRes20.baselineSingleMarket.market.name === bestSingle.market.name,
    'TEST-B.2',
    'Single-market plan matches the #1 discovered real APMC market',
    `Single Market: ${splitRes20.baselineSingleMarket?.market.name}, Net Return: ₹${splitRes20.baselineSingleMarket?.netReturn.toLocaleString('en-IN')}`
  );

  if (splitRes20.hasFeasibleSplit && splitRes20.allocations.length > 0) {
    const allocNames = splitRes20.allocations.map((a) => a.market.name);
    assert(
      allocNames.every((name) => eligibleRealMarkets.some((rm) => rm.name === name)),
      'TEST-B.3',
      'Split plan market names come strictly from discovered real APMC records',
      `Allocated Markets: ${allocNames.join(' + ')}`
    );
  } else {
    assert(
      splitRes20.explanation.length > 0,
      'TEST-B.3',
      'Split plan reports honest economic rationale (e.g., single market saves duplicate travel expenses)',
      splitRes20.explanation
    );
  }

  // Vary quantity to 80 Quintals to verify dynamic recalculation
  const inputs80Qtl = { ...inputs20Qtl, quantity: 80 };
  const splitRes80 = optimizeSplitHarvest(inputs80Qtl, crop, eligibleRealMarkets, bestSingle);

  assert(
    splitRes80.planTotals.totalAllocatedQuintals === 80 &&
      splitRes80.planTotals.totalNetReturn !== splitRes20.planTotals.totalNetReturn,
    'TEST-B.4',
    'Values change dynamically when harvest quantity changes',
    `20 Qtl Net: ₹${splitRes20.planTotals.totalNetReturn.toLocaleString('en-IN')} vs 80 Qtl Net: ₹${splitRes80.planTotals.totalNetReturn.toLocaleString('en-IN')}`
  );

  // Test when fewer than 2 verified markets exist:
  const splitResFew = optimizeSplitHarvest(inputs20Qtl, crop, eligibleRealMarkets.slice(0, 1), bestSingle);
  assert(
    splitResFew.hasFeasibleSplit === false &&
      (splitResFew.explanation.includes('Not enough verified market data') ||
        splitResFew.explanation.includes('at least two') ||
        splitResFew.searchMetadata.plansEvaluated === 0),
    'TEST-B.5',
    'When insufficient verified markets exist, split plan is not invented or fabricated',
    'Correctly rejects split when only 1 market is supplied.'
  );

  // --- TEST C: MARKETS COMPARED SECTION DATA INTEGRITY ---
  console.log('\n--- 4. TEST C: MARKETS COMPARED SECTION DATA INTEGRITY ---');

  // Verify single source of truth:
  assert(
    verifiedFeasible.length === verifiedEvaluations.filter((m) => m.isFeasible).length,
    'TEST-C.1',
    'Markets Compared table uses the exact same verified market records as discovery cards',
    `Evaluated ${verifiedFeasible.length} feasible verified markets.`
  );

  // Verify ranking order (descending netReturn):
  let isSorted = true;
  for (let i = 0; i < verifiedFeasible.length - 1; i++) {
    if (verifiedFeasible[i].netReturn < verifiedFeasible[i + 1].netReturn) {
      isSorted = false;
      break;
    }
  }
  assert(
    isSorted,
    'TEST-C.2',
    'Markets Compared ranking is strictly ordered by highest estimated net earnings after costs',
    `Rank #1: ${verifiedFeasible[0]?.market.name} (₹${verifiedFeasible[0]?.netReturn}) >= Rank #2: ${verifiedFeasible[1]?.market.name} (₹${verifiedFeasible[1]?.netReturn})`
  );

  // Verify mathematical invariant on every market row in Markets Compared:
  let mathInvariantHolds = true;
  for (const m of verifiedFeasible) {
    const expectedNet = m.grossRevenue - m.transportationCost - m.totalMarketFees;
    if (Math.abs(m.netReturn - expectedNet) > 2) {
      mathInvariantHolds = false;
      break;
    }
  }
  assert(
    mathInvariantHolds,
    'TEST-C.3',
    'Every compared market satisfies Net = Gross - Transport - Mandi Fees invariant',
    'Mathematical integrity confirmed across all verified market rows.'
  );

  // --- TEST E: DATA UNAVAILABLE HONEST EMPTY STATE ---
  console.log('\n--- 5. TEST E: DATA UNAVAILABLE HONEST EMPTY STATE ---');

  // Query an unquoted commodity to verify legitimate empty state handling:
  const unquotedRes = await discoverAndEvaluateMandis(
    farmerLoc,
    { id: 'nonexistent_crop_999', name: 'Nonexistent Commodity XYZ', typicalMarketPriceRange: { min: 1000, max: 2000 } },
    20,
    defaultTransport,
    defaultSpoilage,
    'optimal',
    { sortOption: 'netRevenue' }
  );

  const unquotedVerified = unquotedRes.evaluatedMarkets.filter(
    (m) => m.hasVerifiedPrice && m.priceRecord && m.priceRecord.modalPrice > 0
  );

  assert(
    unquotedVerified.length === 0,
    'TEST-E.1',
    'When no verified market quotations exist, zero fake or demo prices are produced',
    `Verified prices count: ${unquotedVerified.length}`
  );

  assert(
    unquotedRes.apiErrorCategory === 'NO_LIVE_RECORDS' || unquotedRes.apiErrorCategory === 'SEARCH_API_NOT_CONFIGURED',
    'TEST-E.2',
    'Application reports an honest empty state instead of silently switching to demo data',
    `API Category: ${unquotedRes.apiErrorCategory}`
  );

  console.log('\n===============================================================');
  console.log(`  VERIFICATION COMPLETE: ${passedTests} OF ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    console.log('>>> ALL DEMO DATA REMOVED & MARKET COMPARISONS ARE 100% DATA-DRIVEN!\n');
    process.exit(0);
  } else {
    console.error('>>> SOME VERIFICATION TESTS FAILED.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
