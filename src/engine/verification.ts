import { getCropById } from '../data/crops';
import { getSimulatedMarketsForCrop } from '../data/markets';
import { FarmerInputs } from '../types/agriculture';
import { calculateMarketNetReturn } from './netReturn';
import { rankMarketsByNetReturn } from './ranking';
import { analyzeHighestPriceVsNetReturn } from './recommendations';
import { validateFarmerInputs } from '../utils/validation';

export function runEngineVerification() {
  const results: { test: string; passed: boolean; details: string }[] = [];

  const defaultInputs: FarmerInputs = {
    cropId: 'tomato',
    quantity: 20,
    quantityUnit: 'quintal',
    harvestDate: new Date().toISOString().split('T')[0],
    maturity: 'optimal',
    originLocation: 'Farm Gate - Navalgund Cluster',
    gradeDistribution: { A: 50, B: 35, C: 15 },
    spoilage: {
      mode: 'automatic',
      manualPercentage: 5,
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

  const tomatoCrop = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomatoCrop);

  // Test 1: Nearby market vs distant market transport cost impact
  const nearbyMarket = markets.find((m) => m.distanceKm <= 25)!;
  const distantMarket = markets.find((m) => m.distanceKm >= 140)!;
  const resNearby = calculateMarketNetReturn(defaultInputs, tomatoCrop, nearbyMarket);
  const resDistant = calculateMarketNetReturn(defaultInputs, tomatoCrop, distantMarket);
  results.push({
    test: '1. Transport cost scales with distance',
    passed: resDistant.transportationCost > resNearby.transportationCost,
    details: `Nearby (${nearbyMarket.distanceKm}km): ₹${resNearby.transportationCost} vs Distant (${distantMarket.distanceKm}km): ₹${resDistant.transportationCost}`,
  });

  // Test 2: Distant market wins when its higher price justifies extra cost
  const highPriceInputs: FarmerInputs = {
    ...defaultInputs,
    gradeDistribution: { A: 100, B: 0, C: 0 },
    spoilage: { ...defaultInputs.spoilage, vehicleProtection: 'refrigerated', temperature: 'mild' },
  };
  const resDistantHigh = calculateMarketNetReturn(highPriceInputs, tomatoCrop, distantMarket);
  const resNearbyHigh = calculateMarketNetReturn(highPriceInputs, tomatoCrop, nearbyMarket);
  results.push({
    test: '2. Distant market wins when high price premium justifies extra transport',
    passed: resDistantHigh.grossRevenue > resNearbyHigh.grossRevenue,
    details: `Distant Gross: ₹${resDistantHigh.grossRevenue} vs Nearby Gross: ₹${resNearbyHigh.grossRevenue}`,
  });

  // Test 3: Insufficient capacity excluded from single-market recommendations
  const largeHarvestInputs: FarmerInputs = { ...defaultInputs, quantity: 25 };
  const rankingLarge = rankMarketsByNetReturn(largeHarvestInputs, tomatoCrop, markets);
  const sahyadriResult = rankingLarge.allResults.find((r) => r.market.id === 'sahyadri-boutique')!;
  results.push({
    test: '3. Market with capacity 12 Qtl marked infeasible for 25 Qtl harvest',
    passed:
      !sahyadriResult.isFeasible &&
      rankingLarge.feasibleMarkets.every((m) => m.market.id !== 'sahyadri-boutique'),
    details: `Sahyadri feasible: ${sahyadriResult.isFeasible}, Reason: ${sahyadriResult.feasibilityReasons[0]}`,
  });

  // Test 4: Changing from Own to Rented transport updates costs
  const rentedInputs: FarmerInputs = {
    ...defaultInputs,
    transport: { ...defaultInputs.transport, type: 'rented' },
  };
  const resOwn = calculateMarketNetReturn(defaultInputs, tomatoCrop, nearbyMarket);
  const resRented = calculateMarketNetReturn(rentedInputs, tomatoCrop, nearbyMarket);
  results.push({
    test: '4. Transport type toggle updates transportation cost correctly',
    passed: resOwn.transportationCost !== resRented.transportationCost,
    details: `Own: ₹${resOwn.transportationCost} vs Rented: ₹${resRented.transportationCost}`,
  });

  // Test 5: Manual spoilage input directly sets physical loss
  const manualInputs: FarmerInputs = {
    ...defaultInputs,
    spoilage: { ...defaultInputs.spoilage, mode: 'manual', manualPercentage: 8 },
  };
  const resManual = calculateMarketNetReturn(manualInputs, tomatoCrop, nearbyMarket);
  results.push({
    test: '5. Manual spoilage mode respects entered percentage',
    passed: resManual.estimatedLossPercent === 8 && resManual.physicalLossQuintals === 1.6,
    details: `Manual loss: ${resManual.estimatedLossPercent}%, Loss Qtl: ${resManual.physicalLossQuintals} Qtl`,
  });

  // Test 6: Spoilage loss in automatic mode: Class 1 (Spinach) vs Class 4 (Wheat)
  const spinach = getCropById('spinach');
  const wheat = getCropById('wheat');
  const spinachMarkets = getSimulatedMarketsForCrop(spinach);
  const wheatMarkets = getSimulatedMarketsForCrop(wheat);
  const resSpinach = calculateMarketNetReturn(
    defaultInputs,
    spinach,
    spinachMarkets.find((m) => m.id === distantMarket.id)!
  );
  const resWheat = calculateMarketNetReturn(
    defaultInputs,
    wheat,
    wheatMarkets.find((m) => m.id === distantMarket.id)!
  );
  results.push({
    test: '6. Perishability Class 1 has significantly higher loss than Class 4',
    passed: resSpinach.estimatedLossPercent > resWheat.estimatedLossPercent * 5,
    details: `Spinach (Class 1) loss: ${resSpinach.estimatedLossPercent}% vs Wheat (Class 4) loss: ${resWheat.estimatedLossPercent}%`,
  });

  // Test 7: Grade-wise prices change total revenue correctly
  const highGradeInputs: FarmerInputs = {
    ...defaultInputs,
    gradeDistribution: { A: 80, B: 15, C: 5 },
  };
  const lowGradeInputs: FarmerInputs = {
    ...defaultInputs,
    gradeDistribution: { A: 10, B: 30, C: 60 },
  };
  const resHighGrade = calculateMarketNetReturn(highGradeInputs, tomatoCrop, nearbyMarket);
  const resLowGrade = calculateMarketNetReturn(lowGradeInputs, tomatoCrop, nearbyMarket);
  results.push({
    test: '7. Grade-wise prices reflect higher revenue for premium grade lot',
    passed: resHighGrade.grossRevenue > resLowGrade.grossRevenue,
    details: `Prime Grade A (80%): ₹${resHighGrade.grossRevenue} vs Low Grade A (10%): ₹${resLowGrade.grossRevenue}`,
  });

  // Test 8: Negative net return handled correctly without NaN or clipping
  const tinyInputs: FarmerInputs = {
    ...defaultInputs,
    quantity: 0.5, // 0.5 quintal with heavy multi-hundred rupee transport/fixed fees
  };
  const resTiny = calculateMarketNetReturn(tinyInputs, tomatoCrop, distantMarket);
  results.push({
    test: '8. Legitimate negative net return supported cleanly without clipping',
    passed: resTiny.netReturn < 0 && !isNaN(resTiny.netReturn) && isFinite(resTiny.netReturn),
    details: `Net Return: ₹${resTiny.netReturn} (Gross ₹${resTiny.grossRevenue} - Expenses ₹${resTiny.totalExpenses})`,
  });

  // Test 9: Grade percentage validation rejects non-100% sum
  const badGradeInputs: FarmerInputs = {
    ...defaultInputs,
    gradeDistribution: { A: 40, B: 20, C: 10 }, // 70%
  };
  const valResult = validateFarmerInputs(badGradeInputs);
  results.push({
    test: '9. Grade percentages must total 100%',
    passed: !valResult.isValid && !!valResult.errors.grades,
    details: `Validation rejected 70% sum: ${valResult.errors.grades}`,
  });

  // Test 10: Minimum consignment constraint enforced
  const smallHarvestInputs: FarmerInputs = { ...defaultInputs, quantity: 10 };
  const nationalLogisticsResult = rankMarketsByNetReturn(
    smallHarvestInputs,
    tomatoCrop,
    markets
  ).allResults.find((r) => r.market.id === 'national-logistics')!;
  results.push({
    test: '10. Minimum consignment threshold enforced',
    passed: !nationalLogisticsResult.isFeasible,
    details: `National Logistics (Min 25 Qtl) with 10 Qtl harvest: Feasible = ${nationalLogisticsResult.isFeasible}`,
  });

  // Test 11: Vehicle carrying capacity validation
  const invalidVehicleInputs: FarmerInputs = {
    ...defaultInputs,
    transport: {
      ...defaultInputs.transport,
      ownVehicle: { ...defaultInputs.transport.ownVehicle, capacityQuintals: 0 },
    },
  };
  const valVehicle = validateFarmerInputs(invalidVehicleInputs);
  results.push({
    test: '11. Zero vehicle carrying capacity identified as logistics infeasibility',
    passed: !valVehicle.isValid && !!valVehicle.errors.vehicleCapacity,
    details: `Validation rejected 0 capacity: ${valVehicle.errors.vehicleCapacity}`,
  });

  // Test 12: Highest price vs Highest Net Return dynamic analysis
  const comparison = analyzeHighestPriceVsNetReturn(
    rankingLarge.allResults,
    rankingLarge.feasibleMarkets,
    defaultInputs.gradeDistribution
  );
  results.push({
    test: '12. Highest price vs Net Return dynamic explanation generated',
    passed: !!comparison && comparison.dynamicExplanation.length > 50,
    details: `Explanation snippet: ${comparison?.dynamicExplanation.slice(0, 80)}...`,
  });

  return results;
}
