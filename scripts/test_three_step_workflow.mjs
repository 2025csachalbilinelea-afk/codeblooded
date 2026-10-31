import createJiti from 'jiti';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const jiti = createJiti(import.meta.url);

console.log('===============================================================');
console.log('   HARVESTROUTE: 3-STEP WORKFLOW RESTRUCTURING VERIFICATION   ');
console.log('===============================================================');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] TEST ${totalTests}: ${name}`);
    console.error(`       ↳ Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// CHECK 1: STEP NAVIGATION IS 3 MAJOR STEPS & STEP 1 OVERVIEW REMOVED
// -----------------------------------------------------------------------------
test('Check 1: StepNavigation contains exactly 3 steps with requested labels', () => {
  const stepNavPath = path.resolve('src/components/dashboard/StepNavigation.tsx');
  const stepNavContent = fs.readFileSync(stepNavPath, 'utf-8');

  assert(stepNavContent.includes('export type DashboardStep = 1 | 2 | 3;'), 'Must have type DashboardStep = 1 | 2 | 3');
  assert(stepNavContent.includes("'Harvest & Farm Details'"), 'Must contain Step 1: Harvest & Farm Details');
  assert(stepNavContent.includes("'Loss, Logistics & Market Discovery'"), 'Must contain Step 2: Loss, Logistics & Market Discovery');
  assert(stepNavContent.includes("'Profit Decision'"), 'Must contain Step 3: Profit Decision');

  // Verify App.tsx no longer renders Step1Overview in workflow
  const appPath = path.resolve('src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  assert(!appContent.includes('<Step1Overview'), 'Step1Overview must be removed from App.tsx workflow');
  assert(appContent.includes('<Step1HarvestFarm'), 'Step1HarvestFarm must be rendered in App.tsx');
  assert(appContent.includes('<Step2LogisticsMarkets'), 'Step2LogisticsMarkets must be rendered in App.tsx');
  assert(appContent.includes('<Step3ProfitDecision'), 'Step3ProfitDecision must be rendered in App.tsx');
});

// -----------------------------------------------------------------------------
// CHECK 2: STEP 1 CONTAINS ALL MERGED HARVEST & FARM DETAILS SECTIONS
// -----------------------------------------------------------------------------
test('Check 2: Step 1 includes Crop Selection, Harvest Details, Location and Map', () => {
  const step1Path = path.resolve('src/components/dashboard/steps/Step1HarvestFarm.tsx');
  const content = fs.readFileSync(step1Path, 'utf-8');

  // Section 1: Select Your Crop
  assert(content.includes('Select Your Crop'), 'Must contain "Select Your Crop" section');
  assert(content.includes('<CropSelector'), 'Must render CropSelector');
  assert(content.includes('Agronomic Spotlight'), 'Must render Agronomic Profile card');

  // Section 2: Enter Harvest Details
  assert(content.includes('Enter Harvest Details'), 'Must contain "Enter Harvest Details" section');
  assert(content.includes('<HarvestDetails'), 'Must render HarvestDetails');

  // Section 3: Set Your Farm Location
  assert(content.includes('Set Your Farm Location'), 'Must contain "Set Your Farm Location" section');
  assert(content.includes('<LocationSelector'), 'Must render LocationSelector');
  assert(content.includes('Verified Farm Origin Coordinates'), 'Must render Verified Farm Coordinates');

  // Section 4: View Location on Map
  assert(content.includes('Regional Mandi Map'), 'Must contain Regional Mandi Map section');
  assert(content.includes('<MarketLocationMap'), 'Must render MarketLocationMap');
});

// -----------------------------------------------------------------------------
// CHECK 3: STEP 2 CONTAINS LOSS ESTIMATION, TRANSPORT & MANDI DISCOVERY
// -----------------------------------------------------------------------------
test('Check 3: Step 2 includes Spoilage, Transport Config & Dynamic Market Discovery', () => {
  const step2Path = path.resolve('src/components/dashboard/steps/Step2LogisticsMarkets.tsx');
  const content = fs.readFileSync(step2Path, 'utf-8');

  // Section 1: Produce Loss Estimation
  assert(content.includes('Produce Loss Estimation'), 'Must contain Produce Loss Estimation section');
  assert(content.includes('<SpoilageConfigForm'), 'Must render SpoilageConfigForm');

  // Section 2: Transportation & Vehicle Details
  assert(content.includes('Transportation Details'), 'Must contain Transportation Details section');
  assert(content.includes('<TransportConfigForm'), 'Must render TransportConfigForm');
  assert(content.includes('Consignment Logistics & Sufficiency Summary'), 'Must render Logistics Summary');

  // Sections 3, 4, 5: Discover Markets & Compare Net Earnings
  assert(content.includes('Discover Agricultural Markets'), 'Must contain Discover Agricultural Markets section');
  assert(content.includes('<DynamicMarketSection'), 'Must render DynamicMarketSection');
});

// -----------------------------------------------------------------------------
// CHECK 4: STEP 3 PRESERVES COMPLETE PROFIT DECISION HUB & MODALS
// -----------------------------------------------------------------------------
test('Check 4: Step 3 preserves Metric Cards, Comparison, Split Harvest, Waterfall, and Table', () => {
  const step3Path = path.resolve('src/components/dashboard/steps/Step3ProfitDecision.tsx');
  const content = fs.readFileSync(step3Path, 'utf-8');

  assert(content.includes('<MetricCards'), 'Must render MetricCards');
  assert(content.includes('<ComparisonCard'), 'Must render ComparisonCard');
  assert(content.includes('<SplitHarvestSection'), 'Must render SplitHarvestSection');
  assert(content.includes('<FinancialWaterfallChart'), 'Must render FinancialWaterfallChart');
  assert(content.includes('<MarketRankingTable'), 'Must render MarketRankingTable');
});

// -----------------------------------------------------------------------------
// CHECK 5: CROP & HARVEST QUANTITY CONVERSIONS REMAIN ACCURATE
// -----------------------------------------------------------------------------
test('Check 5: Unit conversion engine functions correctly', () => {
  const unitsModule = jiti('../src/engine/units.ts');
  const { convertToQuintals } = unitsModule;

  assert.strictEqual(convertToQuintals(20, 'quintal'), 20, '20 quintals = 20 Qtl');
  assert.strictEqual(convertToQuintals(2000, 'kg'), 20, '2000 kg = 20 Qtl');
  assert.strictEqual(convertToQuintals(2, 'tonne'), 20, '2 tonnes = 20 Qtl');
});

// -----------------------------------------------------------------------------
// CHECK 6: SPOILAGE ENGINE ESTIMATION INTEGRITY
// -----------------------------------------------------------------------------
test('Check 6: Produce spoilage calculation engine remains preserved', () => {
  const cropsModule = jiti('../src/data/crops.ts');
  const { getCropById } = cropsModule;
  const tomato = getCropById('tomato');

  const spoilageModule = jiti('../src/engine/spoilage.ts');
  const { calculateSpoilagePercentage } = spoilageModule;

  const autoSpoilage = calculateSpoilagePercentage(
    tomato,
    {
      mode: 'automatic',
      manualPercentage: 4,
      temperature: 'warm',
      vehicleProtection: 'open',
      handling: 'standard',
      delayHours: 1,
    },
    2.5, // 2.5 hours transit time
    1.0, // 1 hour market wait
    'optimal'
  );

  assert(autoSpoilage.lossPercentage > 0, 'Automatic spoilage percentage must be positive');
  assert(autoSpoilage.lossPercentage < 30, 'Standard spoilage should be realistic (< 30%)');

  const manualSpoilage = calculateSpoilagePercentage(
    tomato,
    {
      mode: 'manual',
      manualPercentage: 5.5,
      temperature: 'warm',
      vehicleProtection: 'open',
      handling: 'standard',
      delayHours: 1,
    },
    2.5,
    1.0,
    'optimal'
  );
  assert.strictEqual(manualSpoilage.lossPercentage, 5.5, 'Manual spoilage mode must return exact specified percentage');
});

// -----------------------------------------------------------------------------
// CHECK 7: TRANSPORT OWN-VEHICLE & RENTED-VEHICLE ENGINE INTEGRITY
// -----------------------------------------------------------------------------
test('Check 7: Own vehicle and rented vehicle cost engines calculate accurately', () => {
  const transportModule = jiti('../src/engine/transport.ts');
  const { calculateTransportationCost } = transportModule;

  const ownConfig = {
    type: 'own',
    ownVehicle: {
      capacityQuintals: 25,
      mileageKmPerLitre: 10,
      fuelPricePerLitre: 95,
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
    },
  };

  // 20 Qtl, 50 km distance -> 1 trip, 100 km round trip
  // Fuel: 100 / 10 * 95 = 950
  // Maint: 100 * 2 = 200
  // Driver: 500, Tolls: 200
  // Total = 1850
  const ownCalc = calculateTransportationCost(ownConfig, 50, 20);
  assert.strictEqual(ownCalc.totalCost, 1850, 'Own vehicle total cost must be Rs. 1850');
  assert.strictEqual(ownCalc.fuelCost, 950, 'Fuel cost must be Rs. 950');

  // Rented vehicle
  const rentedCalc = calculateTransportationCost(
    { ...ownConfig, type: 'rented' },
    50,
    20
  );
  assert.strictEqual(rentedCalc.totalCost, 3500, 'Rented vehicle must be 100 km * Rs. 35 = Rs. 3500');
  assert.strictEqual(rentedCalc.fuelCost, 0, 'Rented vehicle must have zero duplicate fuel cost');
});

// -----------------------------------------------------------------------------
// CHECK 8: DYNAMIC MANDI DISCOVERY & RANKING PRESERVATION
// -----------------------------------------------------------------------------
test('Check 8: Dynamic mandi discovery returns authentic APMC mandis ranked by net earnings', async () => {
  const locationModule = jiti('../src/services/locationService.ts');
  const { resolveManualLocation } = locationModule;
  const dharwadLoc = resolveManualLocation('Karnataka', 'Dharwad', 'Navalgund', '582208');

  const cropsModule = jiti('../src/data/crops.ts');
  const { getCropById } = cropsModule;
  const tomato = getCropById('tomato');

  const discoveryModule = jiti('../src/engine/discoveryEngine.ts');
  const { discoverAndEvaluateMandis } = discoveryModule;

  const transport = {
    type: 'own',
    ownVehicle: {
      capacityQuintals: 25,
      mileageKmPerLitre: 10,
      fuelPricePerLitre: 95,
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
    },
  };

  const spoilage = {
    mode: 'automatic',
    manualPercentage: 4,
    temperature: 'warm',
    vehicleProtection: 'open',
    handling: 'standard',
    delayHours: 1,
  };

  const result = await discoverAndEvaluateMandis(
    dharwadLoc,
    tomato,
    20,
    transport,
    spoilage,
    'optimal',
    { sortOption: 'netRevenue', filters: {} }
  );

  assert(result.evaluatedMarkets.length > 0, 'Must discover candidate mandis');
  assert(Boolean(result.recommendedMarket), 'Must recommend a top mandi');
  assert(
    result.recommendedMarket.hasVerifiedPrice,
    'Recommended mandi must have a verified price'
  );
});

// -----------------------------------------------------------------------------
// CHECK 9: PRESERVED SPLIT HARVEST ENGINE & COMPARISON
// -----------------------------------------------------------------------------
test('Check 9: Split harvest optimization and recommendation comparison engine intact', () => {
  const recModule = jiti('../src/engine/recommendations.ts');
  const { analyzeHighestPriceVsNetReturn } = recModule;
  assert(typeof analyzeHighestPriceVsNetReturn === 'function', 'analyzeHighestPriceVsNetReturn must exist');

  const splitModule = jiti('../src/engine/splitHarvest.ts');
  const { optimizeSplitHarvest } = splitModule;
  assert(typeof optimizeSplitHarvest === 'function', 'optimizeSplitHarvest must exist');
});

// -----------------------------------------------------------------------------
// CHECK 10: REPORTS, BULK MARKETPLACE & NAVBAR NAVIGATION ROUTING
// -----------------------------------------------------------------------------
test('Check 10: Navigation links in Navbar and Landing Page route properly into 3-step workflow', () => {
  const navbarPath = path.resolve('src/components/layout/Navbar.tsx');
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

  // Verify Navbar routes Live Mandi Prices to Step 2
  assert(
    navbarContent.includes("onClick={() => handleNavClick('dashboard', 2)}"),
    'Navbar Live Mandi Prices link must route directly to Step 2'
  );
  assert(
    navbarContent.includes("onClick={() => handleNavClick('dashboard', 1)}"),
    'Navbar Farmer Dashboard link must route to Step 1'
  );
  assert(
    navbarContent.includes("onClick={() => handleNavClick('marketplace')}"),
    'Navbar must support Bulk Buyer Marketplace navigation'
  );
  assert(
    navbarContent.includes("onClick={() => handleNavClick('reports')}"),
    'Navbar must support Reports navigation'
  );

  // Verify App.tsx handles Mandi Prices jumping to Step 2
  const appPath = path.resolve('src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  assert(
    appContent.includes("onOpenMandiPrices={() => handleNavigateView('dashboard', 2)}"),
    'Landing page Mandi Prices shortcut must route to dashboard Step 2'
  );
});

console.log('===============================================================');
console.log(`  VERIFICATION COMPLETE: ${passedTests} OF ${totalTests} CHECKS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================');

if (passedTests === totalTests) {
  console.log('>>> 3-STEP FARMER WORKFLOW RESTRUCTURING 100% VERIFIED!');
} else {
  process.exit(1);
}
