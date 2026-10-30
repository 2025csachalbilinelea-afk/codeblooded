// Comprehensive verification & agricultural scenario audit for HarvestRoute
// Runs the actual production TypeScript calculation engine via jiti.
// Verifies all 12 Phase 2 core audit requirements + multi-crop domain scenarios.

import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const { calculateMarketNetReturn } = jiti('../src/engine/netReturn.ts');
const { rankMarketsByNetReturn } = jiti('../src/engine/ranking.ts');
const { calculateTransportationCost } = jiti('../src/engine/transport.ts');
const { calculateSpoilagePercentage } = jiti('../src/engine/spoilage.ts');
const { calculateMarketFees } = jiti('../src/engine/marketFees.ts');
const { analyzeHighestPriceVsNetReturn, calculateBreakEven } = jiti('../src/engine/recommendations.ts');
const { optimizeSplitHarvest } = jiti('../src/engine/splitHarvest.ts');
const { validateFarmerInputs } = jiti('../src/utils/validation.ts');
const { getCropById } = jiti('../src/data/crops.ts');
const { getSimulatedMarketsForCrop } = jiti('../src/data/markets.ts');
const { runEngineVerification } = jiti('../src/engine/verification.ts');

console.log('====================================================');
console.log('   HARVESTROUTE ENGINE & SCENARIO AUDIT SUITE       ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       ↳ ${details}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       ↳ ${details}`);
  }
}

// --- PART 1: 12 CORE PHASE 2 AUDIT SCENARIOS ---
console.log('--- PART 1: 12 CORE AUDIT SCENARIOS (DIRECT ENGINE EXECUTION) ---\n');

const engineVerificationResults = runEngineVerification();
for (const res of engineVerificationResults) {
  assert(res.passed, res.test, res.details);
}

// --- PART 2: REALISTIC AGRICULTURAL SCENARIOS AUDIT ---
console.log('\n--- PART 2: REALISTIC AGRICULTURAL SCENARIOS ---\n');

// Realistic Scenario 1: Tomato 20 Quintals (Navalgund to Kisan Gramin vs Metro Wholesale)
{
  const tomato = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomato);
  const inputs = {
    cropId: 'tomato',
    quantity: 20,
    quantityUnit: 'quintal',
    harvestDate: '2026-10-30',
    maturity: 'optimal',
    originLocation: 'Navalgund Cluster',
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

  const kisan = markets.find((m) => m.id === 'kisan-gramin');
  const metro = markets.find((m) => m.id === 'metro-wholesale');
  const resKisan = calculateMarketNetReturn(inputs, tomato, kisan);
  const resMetro = calculateMarketNetReturn(inputs, tomato, metro);

  console.log(`Scenario 1: Tomato 20 Quintals`);
  console.log(`  Kisan Gramin (${kisan.distanceKm} km): Advertised Grade A: ₹${kisan.pricesPerQuintal.A} | Spoilage: ${resKisan.estimatedLossPercent}% | Transport: ₹${resKisan.transportationCost} | Net Return: ₹${resKisan.netReturn}`);
  console.log(`  Metro Wholesale (${metro.distanceKm} km): Advertised Grade A: ₹${metro.pricesPerQuintal.A} | Spoilage: ${resMetro.estimatedLossPercent}% | Transport: ₹${resMetro.transportationCost} | Net Return: ₹${resMetro.netReturn}`);
  console.log(`  Quality Downgrade at Metro: ${resMetro.downgradedQuintalsAtoB} Qtl bruised A→B, ${resMetro.downgradedQuintalsBtoC} Qtl B→C`);

  // Mass conservation check
  const massConserved =
    Math.abs(resMetro.gradeSaleableQuantities.A + resMetro.gradeSaleableQuantities.B + resMetro.gradeSaleableQuantities.C - resMetro.saleableQuantityQuintals) < 0.05;
  assert(massConserved, 'Scenario 1 Mass Conservation: Sum of grade saleable quantities matches total saleable quantity',
    `Sum: ${(resMetro.gradeSaleableQuantities.A + resMetro.gradeSaleableQuantities.B + resMetro.gradeSaleableQuantities.C).toFixed(2)} vs Total: ${resMetro.saleableQuantityQuintals} Qtl`);
}

// Realistic Scenario 2: Leafy Spinach in Hot Afternoon Heat
{
  const spinach = getCropById('spinach');
  const markets = getSimulatedMarketsForCrop(spinach);
  const inputs = {
    cropId: 'spinach',
    quantity: 15,
    quantityUnit: 'quintal',
    harvestDate: '2026-10-30',
    maturity: 'optimal',
    originLocation: 'Navalgund Cluster',
    gradeDistribution: { A: 60, B: 30, C: 10 },
    spoilage: {
      mode: 'automatic',
      manualPercentage: 4,
      temperature: 'hot',
      vehicleProtection: 'open',
      handling: 'rough',
      delayHours: 2,
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

  const kisan = markets.find((m) => m.id === 'kisan-gramin');
  const metro = markets.find((m) => m.id === 'metro-wholesale');
  const resKisan = calculateMarketNetReturn(inputs, spinach, kisan);
  const resMetro = calculateMarketNetReturn(inputs, spinach, metro);

  console.log(`\nScenario 2: Leafy Spinach in Hot Afternoon Heat`);
  console.log(`  Kisan Gramin (${kisan.distanceKm} km): Spoilage: ${resKisan.estimatedLossPercent}% | Transport: ₹${resKisan.transportationCost} | Net Return: ₹${resKisan.netReturn}`);
  console.log(`  Metro Wholesale (${metro.distanceKm} km): Spoilage: ${resMetro.estimatedLossPercent}% | Transport: ₹${resMetro.transportationCost} | Net Return: ₹${resMetro.netReturn}`);

  assert(
    resKisan.netReturn > resMetro.netReturn,
    'Scenario 2 Check: Fragile leafy spinach nets higher in nearby mandi due to severe transit wilting',
    `Kisan Net: ₹${resKisan.netReturn} > Metro Net: ₹${resMetro.netReturn} (Diff: +₹${resKisan.netReturn - resMetro.netReturn})`
  );
}

// Realistic Scenario 3: Break-Even Calculation Integrity
{
  const tomato = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomato);
  const inputs = {
    cropId: 'tomato',
    quantity: 20,
    quantityUnit: 'quintal',
    harvestDate: '2026-10-30',
    maturity: 'optimal',
    originLocation: 'Navalgund Cluster',
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

  const ranking = rankMarketsByNetReturn(inputs, tomato, markets);
  const best = ranking.bestMarket;
  const runnerUp = ranking.feasibleMarkets[1];

  const breakEven = calculateBreakEven(best, runnerUp);
  const isBreakEvenValid =
    breakEven !== null &&
    breakEven.currentNetReturnGap > 0 &&
    breakEven.requiredPriceIncreasePerQuintal > 0 &&
    breakEven.targetMarketName === runnerUp.market.name;

  assert(
    isBreakEvenValid,
    'Scenario 3 Check: Break-even analysis accurately calculates price surge needed for competitor',
    `Gap: ₹${breakEven?.currentNetReturnGap}, Required Price Surge: +₹${breakEven?.requiredPriceIncreasePerQuintal}/Qtl (+${breakEven?.requiredPricePercentageIncrease}%)`
  );
}

console.log('\n====================================================');
console.log(`AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS & SCENARIOS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
