import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const { getCropById } = jiti('../src/data/crops.ts');
const { getSimulatedMarketsForCrop } = jiti('../src/data/markets.ts');
const { calculateMarketNetReturn } = jiti('../src/engine/netReturn.ts');
const { rankMarketsByNetReturn } = jiti('../src/engine/ranking.ts');
const { analyzeHighestPriceVsNetReturn } = jiti('../src/engine/recommendations.ts');
const { optimizeSplitHarvest } = jiti('../src/engine/splitHarvest.ts');

console.log('=== REALISTIC AGRICULTURAL SCENARIO AUDIT ===\n');

// SCENARIO 1: Tomato 20 Quintals (Standard Harvest)
{
  console.log('--- SCENARIO 1: Tomato 20 Quintals Harvest ---');
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
  console.log(`Feasible markets count: ${ranking.feasibleMarkets.length}`);
  console.log(`Infeasible markets count: ${ranking.infeasibleMarkets.length}`);
  console.log(`Top recommended market: ${ranking.bestMarket?.market.name} (Net: ₹${ranking.bestMarket?.netReturn})`);

  const comparison = analyzeHighestPriceVsNetReturn(ranking.allResults, ranking.feasibleMarkets, inputs.gradeDistribution);
  console.log(`Highest price market: ${comparison?.highestPriceMarket.market.name} (Grade A: ₹${comparison?.highestPriceMarket.market.pricesPerQuintal.A})`);
  console.log(`Highest net return market: ${comparison?.highestNetReturnMarket?.market.name} (Net: ₹${comparison?.highestNetReturnMarket?.netReturn})`);
  console.log(`Dynamic explanation: ${comparison?.dynamicExplanation.slice(0, 120)}...\n`);
}

// SCENARIO 2: Spinach (Class 1 Highly Perishable) in Hot Transit
{
  console.log('--- SCENARIO 2: Spinach in Hot Transit ---');
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

  console.log(`Nearby Spoilage: ${resKisan.estimatedLossPercent}% | Net Return: ₹${resKisan.netReturn}`);
  console.log(`Distant Spoilage: ${resMetro.estimatedLossPercent}% | Net Return: ₹${resMetro.netReturn}`);
  console.log(`Does nearby beat distant for fragile spinach under heat? ${resKisan.netReturn > resMetro.netReturn}\n`);
}

// SCENARIO 3: Quota Constrained Boutique Market with Split Harvest
{
  console.log('--- SCENARIO 3: Quota Constrained Harvest (25 Qtl) ---');
  const tomato = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomato);
  const inputs = {
    cropId: 'tomato',
    quantity: 25, // 25 quintals exceeds Sahyadri capacity (12 Qtl)
    quantityUnit: 'quintal',
    harvestDate: '2026-10-30',
    maturity: 'optimal',
    originLocation: 'Navalgund Cluster',
    gradeDistribution: { A: 80, B: 15, C: 5 },
    spoilage: {
      mode: 'automatic',
      manualPercentage: 3,
      temperature: 'mild',
      vehicleProtection: 'covered',
      handling: 'gentle',
      delayHours: 0,
    },
    transport: {
      type: 'own',
      ownVehicle: {
        capacityQuintals: 30,
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

  const sahyadri = markets.find((m) => m.id === 'sahyadri-boutique');
  const resSahyadri = calculateMarketNetReturn(inputs, tomato, sahyadri);
  console.log(`Sahyadri (Max 12 Qtl) feasible for 25 Qtl? ${resSahyadri.isFeasible}`);
  console.log(`Sahyadri reason: ${resSahyadri.feasibilityReasons[0]}`);

  const ranking = rankMarketsByNetReturn(inputs, tomato, markets);
  const split = optimizeSplitHarvest(inputs, tomato, markets, ranking.bestMarket?.netReturn || 0);
  console.log(`Split Advantageous? ${split?.isSplitAdvantageous}`);
  console.log(`Split net gain: ₹${split?.netGainFromSplitting}`);
  console.log(`Split explanation: ${split?.explanation}\n`);
}

// SCENARIO 4: Extreme Consignment Volume (1,000 Qtl) Exceeding ALL Markets
{
  console.log('--- SCENARIO 4: Impossible Consignment (1,000 Qtl) ---');
  const tomato = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomato);
  const inputs = {
    cropId: 'tomato',
    quantity: 1000,
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
  console.log(`Feasible markets count: ${ranking.feasibleMarkets.length}`);
  console.log(`Best market: ${ranking.bestMarket}`);

  const comparison = analyzeHighestPriceVsNetReturn(ranking.allResults, ranking.feasibleMarkets, inputs.gradeDistribution);
  console.log(`Comparison hasFeasibleOption: ${comparison?.hasFeasibleOption}`);
  console.log(`Comparison highestNetReturnMarket: ${comparison?.highestNetReturnMarket}`);
  console.log(`Alert dynamicExplanation: ${comparison?.dynamicExplanation.slice(0, 100)}...`);
}
