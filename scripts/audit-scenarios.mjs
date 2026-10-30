import { getCropById } from '../src/data/crops.ts';
import { getSimulatedMarketsForCrop } from '../src/data/markets.ts';
import { calculateMarketNetReturn } from '../src/engine/netReturn.ts';
import { rankMarketsByNetReturn } from '../src/engine/ranking.ts';
import { analyzeHighestPriceVsNetReturn } from '../src/engine/recommendations.ts';
import { optimizeSplitHarvest } from '../src/engine/splitHarvest.ts';

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

  const ranking = rankMarketsByNetReturn(inputs, spinach, markets);
  const distant = ranking.allResults.find(r => r.market.id === 'metro-wholesale');
  const nearby = ranking.allResults.find(r => r.market.id === 'kisan-gramin');
  console.log(`Nearby Spoilage: ${nearby?.estimatedLossPercent}% | Net Return: ₹${nearby?.netReturn}`);
  console.log(`Distant Spoilage: ${distant?.estimatedLossPercent}% | Net Return: ₹${distant?.netReturn}`);
  console.log(`Does nearby beat distant for fragile spinach under heat? ${nearby.netReturn > distant.netReturn}\n`);
}

// SCENARIO 3: Quota Constrained Harvest (25 Qtl) and Split Harvest Optimization
{
  console.log('--- SCENARIO 3: Quota Constrained Harvest (25 Qtl) ---');
  const tomato = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomato);
  const inputs = {
    cropId: 'tomato',
    quantity: 25,
    quantityUnit: 'quintal',
    harvestDate: '2026-10-30',
    maturity: 'optimal',
    originLocation: 'Navalgund Cluster',
    gradeDistribution: { A: 70, B: 20, C: 10 },
    spoilage: {
      mode: 'automatic',
      manualPercentage: 4,
      temperature: 'warm',
      vehicleProtection: 'covered',
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
  const sahyadri = ranking.allResults.find(r => r.market.id === 'sahyadri-boutique');
  console.log(`Sahyadri (Max 12 Qtl) feasible for 25 Qtl? ${sahyadri?.isFeasible}`);
  console.log(`Sahyadri reason: ${sahyadri?.feasibilityReasons[0]}`);

  const split = optimizeSplitHarvest(inputs, tomato, markets, ranking.bestMarket?.netReturn || 0);
  console.log(`Split Advantageous? ${split?.isSplitAdvantageous}`);
  console.log(`Split net gain: ₹${split?.netGainFromSplitting}`);
  console.log(`Split explanation: ${split?.explanation}\n`);
}

// SCENARIO 4: Impossible Consignment (1,000 Qtl) - Zero Feasible Markets
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
      mode: 'manual',
      manualPercentage: 5,
      temperature: 'mild',
      vehicleProtection: 'covered',
      handling: 'standard',
      delayHours: 0,
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
  const comparison = analyzeHighestPriceVsNetReturn(ranking.allResults, ranking.feasibleMarkets, inputs.gradeDistribution);
  console.log(`Feasible markets count: ${ranking.feasibleMarkets.length}`);
  console.log(`Best market: ${ranking.bestMarket}`);
  console.log(`Comparison hasFeasibleOption: ${comparison?.hasFeasibleOption}`);
  console.log(`Comparison highestNetReturnMarket: ${comparison?.highestNetReturnMarket}`);
  console.log(`Alert dynamicExplanation: ${comparison?.dynamicExplanation.slice(0, 100)}...`);
}

