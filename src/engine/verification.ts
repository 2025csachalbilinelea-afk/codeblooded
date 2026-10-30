import { getCropById } from '../data/crops';
import { getSimulatedMarketsForCrop } from '../data/markets';
import { FarmerInputs } from '../types/agriculture';
import { calculateMarketNetReturn } from './netReturn';
import { rankMarketsByNetReturn } from './ranking';
import { analyzeHighestPriceVsNetReturn } from './recommendations';
import { calculateTransportationCost } from './transport';
import { calculateSpoilagePercentage } from './spoilage';
import { optimizeSplitHarvest } from './splitHarvest';
import { validateFarmerInputs } from '../utils/validation';

export interface VerificationTestResult {
  test: string;
  passed: boolean;
  details: string;
}

/**
 * Executes the complete 17-scenario Phase 2 & 3 verification suite.
 * All tests call the production TypeScript calculation engine directly.
 */
export function runEngineVerification(): VerificationTestResult[] {
  const results: VerificationTestResult[] = [];

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

  const tomato = getCropById('tomato');
  const markets = getSimulatedMarketsForCrop(tomato);

  // Scenario 1: A feasible market with the highest net return
  {
    const ranking = rankMarketsByNetReturn(defaultInputs, tomato, markets);
    const best = ranking.bestMarket;
    const isTopWinner =
      best !== null &&
      best.isFeasible &&
      ranking.feasibleMarkets.every((m) => best.netReturn >= m.netReturn);

    results.push({
      test: '1. Feasible market with highest net return identified',
      passed: isTopWinner,
      details: best
        ? `Top Pick: ${best.market.name} with Net Return ₹${best.netReturn.toLocaleString('en-IN')} (Feasible: ${best.isFeasible})`
        : 'No feasible market found',
    });
  }

  // Scenario 2: High-advertised-price market that fails capacity constraints
  {
    const inputs25: FarmerInputs = { ...defaultInputs, quantity: 25 };
    const ranking25 = rankMarketsByNetReturn(inputs25, tomato, markets);
    const sahyadri = ranking25.allResults.find((r) => r.market.id === 'sahyadri-boutique')!;
    const sahyadriCapacity = sahyadri.market.maxCapacityQuintals; // 12 Qtl
    const isExcluded =
      !sahyadri.isFeasible &&
      ranking25.feasibleMarkets.every((m) => m.market.id !== 'sahyadri-boutique') &&
      ranking25.bestMarket?.market.id !== 'sahyadri-boutique';

    results.push({
      test: '2. High-advertised-price market failing capacity constraints marked infeasible',
      passed: isExcluded,
      details: `Sahyadri (Max ${sahyadriCapacity} Qtl vs Harvest 25 Qtl) -> Feasible: ${sahyadri.isFeasible}. Reason: "${sahyadri.feasibilityReasons[0]}"`,
    });
  }

  // Scenario 3: Market that fails its minimum consignment requirement
  {
    const smallInputs: FarmerInputs = { ...defaultInputs, quantity: 10 };
    const rankingSmall = rankMarketsByNetReturn(smallInputs, tomato, markets);
    const national = rankingSmall.allResults.find((r) => r.market.id === 'national-logistics')!;
    const minConsignment = national.market.minPurchaseQuintals || 25;
    const isExcluded = !national.isFeasible && national.feasibilityReasons.some((r) => r.includes('minimum consignment'));

    results.push({
      test: '3. Market failing minimum consignment requirement marked infeasible',
      passed: isExcluded,
      details: `National Multimodal (Min ${minConsignment} Qtl vs Harvest 10 Qtl) -> Feasible: ${national.isFeasible}. Reason: "${national.feasibilityReasons[0]}"`,
    });
  }

  // Scenario 4: Zero harvest quantity
  {
    const zeroInputs: FarmerInputs = { ...defaultInputs, quantity: 0 };
    const nearbyMarket = markets.find((m) => m.distanceKm <= 25)!;
    const resZero = calculateMarketNetReturn(zeroInputs, tomato, nearbyMarket);
    const rankingZero = rankMarketsByNetReturn(zeroInputs, tomato, markets);

    const isZeroClean =
      resZero.saleableQuantityQuintals === 0 &&
      resZero.physicalLossQuintals === 0 &&
      resZero.grossRevenue === 0 &&
      resZero.transportationCost === 0 &&
      resZero.totalMarketFees === 0 &&
      resZero.netReturn === 0 &&
      !resZero.isFeasible &&
      rankingZero.feasibleMarkets.length === 0 &&
      rankingZero.bestMarket === null;

    results.push({
      test: '4. Zero harvest quantity handled cleanly (zero financials, infeasible single sale)',
      passed: isZeroClean,
      details: `Gross: ₹${resZero.grossRevenue}, Transport: ₹${resZero.transportationCost}, Fees: ₹${resZero.totalMarketFees}, Net: ₹${resZero.netReturn}, Feasible: ${resZero.isFeasible}`,
    });
  }

  // Scenario 5: Invalid grade distribution
  {
    const badGradeInputs: FarmerInputs = {
      ...defaultInputs,
      gradeDistribution: { A: 40, B: 20, C: 10 }, // 70% sum
    };
    const validation = validateFarmerInputs(badGradeInputs);
    const nearbyMarket = markets.find((m) => m.distanceKm <= 25)!;
    const resBad = calculateMarketNetReturn(badGradeInputs, tomato, nearbyMarket);

    const isRejected =
      !validation.isValid &&
      !!validation.errors.grades &&
      !resBad.isFeasible &&
      resBad.feasibilityReasons.some((r) => r.includes('Grade percentages must total exactly 100%'));

    results.push({
      test: '5. Invalid grade distribution rejected without silent concealment',
      passed: isRejected,
      details: `Validation: "${validation.errors.grades}", Engine Feasible: ${resBad.isFeasible}, Reason: "${resBad.feasibilityReasons[0]}"`,
    });
  }

  // Scenario 6: Manual spoilage mode
  {
    const manualInputs: FarmerInputs = {
      ...defaultInputs,
      quantity: 20,
      spoilage: {
        mode: 'manual',
        manualPercentage: 8,
        temperature: 'hot', // changing weather shouldn't affect manual
        vehicleProtection: 'open',
        handling: 'rough',
        delayHours: 3,
      },
    };
    const nearbyMarket = markets.find((m) => m.distanceKm <= 25)!;
    const resManual = calculateMarketNetReturn(manualInputs, tomato, nearbyMarket);

    const isManualExact =
      resManual.estimatedLossPercent === 8 &&
      resManual.physicalLossQuintals === 1.6 &&
      resManual.saleableQuantityQuintals === 18.4;

    results.push({
      test: '6. Manual spoilage mode respects entered percentage without auto additions',
      passed: isManualExact,
      details: `Manual %: ${resManual.estimatedLossPercent}%, Physical Loss: ${resManual.physicalLossQuintals} Qtl, Net Saleable: ${resManual.saleableQuantityQuintals} Qtl`,
    });
  }

  // Scenario 7: Automatic spoilage mode
  {
    const spinach = getCropById('spinach');
    const wheat = getCropById('wheat');
    const autoLowLoss = calculateSpoilagePercentage(
      spinach,
      { mode: 'automatic', manualPercentage: 0, temperature: 'mild', vehicleProtection: 'refrigerated', handling: 'gentle', delayHours: 0 },
      2,
      1,
      'optimal'
    );
    const autoHighLoss = calculateSpoilagePercentage(
      spinach,
      { mode: 'automatic', manualPercentage: 0, temperature: 'hot', vehicleProtection: 'open', handling: 'rough', delayHours: 2 },
      4,
      3,
      'ripe'
    );
    const autoWheatLoss = calculateSpoilagePercentage(
      wheat,
      { mode: 'automatic', manualPercentage: 0, temperature: 'hot', vehicleProtection: 'open', handling: 'rough', delayHours: 2 },
      4,
      3,
      'dry_stored'
    );

    const isAutoValid =
      autoHighLoss.lossPercentage > autoLowLoss.lossPercentage * 2 &&
      autoHighLoss.lossPercentage > autoWheatLoss.lossPercentage * 5;

    results.push({
      test: '7. Automatic spoilage responds dynamically to perishability class and environment',
      passed: isAutoValid,
      details: `Spinach Mild/Chilled: ${autoLowLoss.lossPercentage}% vs Hot/Open/Rough: ${autoHighLoss.lossPercentage}%. Wheat Dry: ${autoWheatLoss.lossPercentage}%`,
    });
  }

  // Scenario 8: Own-vehicle round-trip cost
  {
    const distanceKm = 50;
    const quantityQtl = 20;
    const ownRoundTrip = calculateTransportationCost(
      {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 10,
          fuelPricePerLitre: 100,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: true,
        },
        rentedVehicle: defaultInputs.transport.rentedVehicle,
      },
      distanceKm,
      quantityQtl
    );

    const ownOneWay = calculateTransportationCost(
      {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 10,
          fuelPricePerLitre: 100,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: false,
        },
        rentedVehicle: defaultInputs.transport.rentedVehicle,
      },
      distanceKm,
      quantityQtl
    );

    // Distance per trip should be 100 km (round trip) vs 50 km (one way)
    const isRoundTripExact =
      ownRoundTrip.totalDistanceKm === 100 &&
      ownOneWay.totalDistanceKm === 50 &&
      ownRoundTrip.fuelCost === 1000 &&
      ownOneWay.fuelCost === 500 &&
      ownRoundTrip.maintenanceCost === 200 &&
      ownOneWay.maintenanceCost === 100;

    results.push({
      test: '8. Own-vehicle round-trip distance and fuel cost calculated consistently',
      passed: isRoundTripExact,
      details: `Round-Trip: ${ownRoundTrip.totalDistanceKm} km, Fuel: ₹${ownRoundTrip.fuelCost} vs One-Way: ${ownOneWay.totalDistanceKm} km, Fuel: ₹${ownOneWay.fuelCost}`,
    });
  }

  // Scenario 9: Rented transport without duplicate charges
  {
    const rentedCalc = calculateTransportationCost(
      {
        type: 'rented',
        ownVehicle: defaultInputs.transport.ownVehicle,
        rentedVehicle: {
          capacityQuintals: 25,
          rentalQuotationPerTrip: 3000,
          additionalChargesPerTrip: 500,
          rentalModel: 'flat',
        },
      },
      75,
      20
    );

    const isNoDuplicate =
      rentedCalc.fuelCost === 0 &&
      rentedCalc.driverCost === 0 &&
      rentedCalc.maintenanceCost === 0 &&
      rentedCalc.rentalCharges === 3000 &&
      rentedCalc.tollsAndOtherCost === 500 &&
      rentedCalc.totalCost === 3500;

    results.push({
      test: '9. Rented transport omits separate fuel and driver costs (no double-counting)',
      passed: isNoDuplicate,
      details: `Rental Quote: ₹${rentedCalc.rentalCharges}, Additional: ₹${rentedCalc.tollsAndOtherCost}, Fuel: ₹${rentedCalc.fuelCost}, Driver: ₹${rentedCalc.driverCost}, Total: ₹${rentedCalc.totalCost}`,
    });
  }

  // Scenario 10: Negative net return
  {
    const tinyConsignment: FarmerInputs = {
      ...defaultInputs,
      quantity: 0.5, // 0.5 quintal haul over 165 km
    };
    const distantMarket = markets.find((m) => m.distanceKm >= 140)!;
    const resTiny = calculateMarketNetReturn(tinyConsignment, tomato, distantMarket);

    const isNegativeValid =
      resTiny.netReturn < 0 &&
      !isNaN(resTiny.netReturn) &&
      isFinite(resTiny.netReturn) &&
      resTiny.netReturn === resTiny.grossRevenue - resTiny.totalExpenses;

    results.push({
      test: '10. Legitimate negative net return supported cleanly without clipping to zero',
      passed: isNegativeValid,
      details: `Gross: ₹${resTiny.grossRevenue} - Expenses: ₹${resTiny.totalExpenses} = Net Return: ₹${resTiny.netReturn} (₹${resTiny.netReturnPerQuintal}/Qtl)`,
    });
  }

  // Scenario 11: A fuel-price change that affects transport economics
  {
    const lowFuelInputs: FarmerInputs = {
      ...defaultInputs,
      transport: {
        ...defaultInputs.transport,
        ownVehicle: { ...defaultInputs.transport.ownVehicle, fuelPricePerLitre: 80 },
      },
    };
    const highFuelInputs: FarmerInputs = {
      ...defaultInputs,
      transport: {
        ...defaultInputs.transport,
        ownVehicle: { ...defaultInputs.transport.ownVehicle, fuelPricePerLitre: 140 },
      },
    };
    const distantMarket = markets.find((m) => m.distanceKm >= 140)!;
    const resLow = calculateMarketNetReturn(lowFuelInputs, tomato, distantMarket);
    const resHigh = calculateMarketNetReturn(highFuelInputs, tomato, distantMarket);

    const fuelImpact = resHigh.transportationCost - resLow.transportationCost;
    const isFuelSensitive = fuelImpact > 1000 && resHigh.netReturn < resLow.netReturn;

    results.push({
      test: '11. Diesel fuel price changes update transit costs and profit margins',
      passed: isFuelSensitive,
      details: `Diesel @ ₹80/L: Transport ₹${resLow.transportationCost}, Net ₹${resLow.netReturn} vs @ ₹140/L: Transport ₹${resHigh.transportationCost}, Net ₹${resHigh.netReturn} (Δ ₹${fuelImpact})`,
    });
  }

  // Scenario 12: No feasible market
  {
    const massiveInputs: FarmerInputs = {
      ...defaultInputs,
      quantity: 1000, // 1000 Quintals exceeds all candidate market capacities (highest is 650 Qtl)
    };
    const rankingMassive = rankMarketsByNetReturn(massiveInputs, tomato, markets);
    const comparisonMassive = analyzeHighestPriceVsNetReturn(
      rankingMassive.allResults,
      rankingMassive.feasibleMarkets,
      massiveInputs.gradeDistribution
    );

    const isNoFeasibleValid =
      rankingMassive.feasibleMarkets.length === 0 &&
      rankingMassive.bestMarket === null &&
      comparisonMassive !== null &&
      !comparisonMassive.hasFeasibleOption &&
      comparisonMassive.highestNetReturnMarket === null &&
      comparisonMassive.dynamicExplanation.includes('None of the candidate markets can purchase');

    results.push({
      test: '12. Infeasible consignments correctly result in no recommended destination',
      passed: isNoFeasibleValid,
      details: `Feasible Count: ${rankingMassive.feasibleMarkets.length}, Best Market: ${rankingMassive.bestMarket}, Explanation: "${comparisonMassive?.dynamicExplanation.slice(0, 95)}..."`,
    });
  }

  // Scenario 13: Split-harvest calculation respects conservation of mass (sum of allocations = total harvest)
  {
    const inputs25: FarmerInputs = {
      ...defaultInputs,
      quantity: 25,
      gradeDistribution: { A: 80, B: 15, C: 5 },
    };
    const ranking25 = rankMarketsByNetReturn(inputs25, tomato, markets);
    const splitResult = optimizeSplitHarvest(inputs25, tomato, markets, ranking25.bestMarket);

    const sumAllocated = splitResult.allocations.reduce((sum, a) => sum + a.allocatedQuintals, 0);
    const isMassConserved =
      splitResult.hasFeasibleSplit &&
      Math.abs(sumAllocated - 25) < 0.001 &&
      splitResult.planTotals.totalAllocatedQuintals === 25;

    results.push({
      test: '13. Split-harvest calculation respects conservation of mass (sum of allocations = total harvest)',
      passed: isMassConserved,
      details: `Harvest: 25 Qtl -> Allocations: ${splitResult.allocations.map((a) => `${a.market.name.split(' ')[0]}: ${a.allocatedQuintals} Qtl`).join(' + ')} (Sum: ${sumAllocated} Qtl)`,
    });
  }

  // Scenario 14: Capacity limits enforced on every individual leg of a split harvest
  {
    const inputs25: FarmerInputs = {
      ...defaultInputs,
      quantity: 25,
      gradeDistribution: { A: 80, B: 15, C: 5 },
    };
    const ranking25 = rankMarketsByNetReturn(inputs25, tomato, markets);
    const splitResult = optimizeSplitHarvest(inputs25, tomato, markets, ranking25.bestMarket);

    const allLegsWithinCapacity =
      splitResult.hasFeasibleSplit &&
      splitResult.allocations.length > 0 &&
      splitResult.allocations.every(
        (a) =>
          a.allocatedQuintals <= a.market.maxCapacityQuintals &&
          (!a.market.minPurchaseQuintals || a.allocatedQuintals >= a.market.minPurchaseQuintals)
      );

    const sahyadriLeg = splitResult.allocations.find((a) => a.market.id === 'sahyadri-boutique');
    const respectsSahyadriCap = !sahyadriLeg || sahyadriLeg.allocatedQuintals <= 12;

    results.push({
      test: '14. Capacity limits enforced on every individual leg of a split harvest',
      passed: allLegsWithinCapacity && respectsSahyadriCap,
      details: `Sahyadri Allocation: ${sahyadriLeg ? `${sahyadriLeg.allocatedQuintals} Qtl (Cap: 12 Qtl)` : 'N/A'}. All legs within capacity: ${allLegsWithinCapacity}`,
    });
  }

  // Scenario 15: Multi-trip transport costs calculated independently for each destination
  {
    const splitInputs25: FarmerInputs = {
      ...defaultInputs,
      quantity: 25,
      gradeDistribution: { A: 80, B: 15, C: 5 },
    };
    const splitResult = optimizeSplitHarvest(splitInputs25, tomato, markets, null);

    const sumLegCosts = splitResult.allocations.reduce((sum, a) => sum + a.transportCost, 0);
    const isIndependentCosting =
      splitResult.hasFeasibleSplit &&
      splitResult.allocations.length >= 2 &&
      splitResult.planTotals.totalTransportCost === sumLegCosts &&
      splitResult.allocations.every((a) => a.transportTrips >= 1 && a.transportCost > 0);

    results.push({
      test: '15. Multi-trip transport costs calculated independently for each destination',
      passed: isIndependentCosting,
      details: `Independent Transport Costs: ${splitResult.allocations.map((a) => `${a.market.name.split(' ')[0]}: ₹${a.transportCost} (${a.transportTrips} trip)`).join(' + ')} = Total ₹${splitResult.planTotals.totalTransportCost}`,
    });
  }

  // Scenario 16: Higher net return with split harvest
  {
    const inputs25: FarmerInputs = {
      ...defaultInputs,
      quantity: 25,
      gradeDistribution: { A: 80, B: 15, C: 5 },
    };
    const ranking25 = rankMarketsByNetReturn(inputs25, tomato, markets);
    const splitResult = optimizeSplitHarvest(inputs25, tomato, markets, ranking25.bestMarket);

    const isSplitSuperior =
      splitResult.recommendedStrategy === 'split' &&
      splitResult.isSplitAdvantageous &&
      splitResult.hasFeasibleSplit &&
      ranking25.bestMarket !== null &&
      splitResult.planTotals.totalNetReturn > ranking25.bestMarket.netReturn;

    const gain = splitResult.netGainFromSplitting;

    results.push({
      test: '16. Higher net return with split harvest: Engine correctly identifies when dividing harvest produces more profit',
      passed: isSplitSuperior,
      details: `Strategy: "${splitResult.recommendedStrategy}" | Split Net: ₹${splitResult.planTotals.totalNetReturn.toLocaleString('en-IN')} vs Single Best (${ranking25.bestMarket?.market.name}): ₹${ranking25.bestMarket?.netReturn.toLocaleString('en-IN')} (Gain: +₹${gain.toLocaleString('en-IN')})`,
    });
  }

  // Scenario 17: Single-market preference when split transport costs outweigh price advantage
  {
    const inputs10: FarmerInputs = {
      ...defaultInputs,
      quantity: 10,
      gradeDistribution: { A: 40, B: 40, C: 20 },
    };
    const ranking10 = rankMarketsByNetReturn(inputs10, tomato, markets);
    const splitResult = optimizeSplitHarvest(inputs10, tomato, markets, ranking10.bestMarket);

    const prefersSingle =
      splitResult.recommendedStrategy === 'single' &&
      !splitResult.isSplitAdvantageous &&
      ranking10.bestMarket !== null;

    results.push({
      test: '17. Single-market preference: Engine correctly prefers a single market when split transport costs outweigh price advantage',
      passed: prefersSingle,
      details: `Strategy: "${splitResult.recommendedStrategy}" | Split Advantageous: ${splitResult.isSplitAdvantageous} | Single Best: ${ranking10.bestMarket?.market.name} (Net: ₹${ranking10.bestMarket?.netReturn.toLocaleString('en-IN')})`,
    });
  }

  // Scenario 18: Simplified Expected Selling Price
  {
    const inputsWithExpectedPrice: FarmerInputs = {
      ...defaultInputs,
      expectedPricePerQuintal: 2500,
      gradeDistribution: undefined,
    };
    const rankingExpected = rankMarketsByNetReturn(inputsWithExpectedPrice, tomato, markets);
    const hasValidResults =
      rankingExpected.feasibleMarkets.length > 0 &&
      rankingExpected.feasibleMarkets.every((m) => m.grossRevenue > 0 && m.netReturn !== 0);

    results.push({
      test: '18. Expected selling price model: Correctly scales expected price without requiring grade distribution',
      passed: hasValidResults,
      details: `Feasible destinations evaluated: ${rankingExpected.feasibleMarkets.length} | Winner: ${rankingExpected.bestMarket?.market.name} (Gross: ₹${rankingExpected.bestMarket?.grossRevenue.toLocaleString('en-IN')}, Net: ₹${rankingExpected.bestMarket?.netReturn.toLocaleString('en-IN')})`,
    });
  }

  // Scenario 19: Simplified Rented Transport Economics
  {
    const inputsRentedKm: FarmerInputs = {
      ...defaultInputs,
      transport: {
        type: 'rented',
        ownVehicle: defaultInputs.transport.ownVehicle,
        rentedVehicle: {
          rentalQuotationPerTrip: 0,
          rentalRatePerKm: 35,
          capacityQuintals: 30,
          additionalChargesPerTrip: 0,
          rentalModel: 'distance_scaled',
        },
      },
    };
    const kisan = markets.find((m) => m.id === 'kisan-gramin') || markets[0];
    const calc = calculateMarketNetReturn(inputsRentedKm, tomato, kisan);
    const expectedCost = 1 * (kisan.distanceKm * 2) * 35;
    const isCostExact = calc.transportationCost === expectedCost;

    results.push({
      test: '19. Simplified rented transport model: Accurately computes round-trip distance * per-km rate without duplicate charges',
      passed: isCostExact,
      details: `Trips: ${calc.transportTrips} | Distance: ${kisan.distanceKm} km | Rate: ₹35/km | Calculated Cost: ₹${calc.transportationCost.toLocaleString('en-IN')} (Expected: ₹${expectedCost.toLocaleString('en-IN')})`,
    });
  }

  return results;
}
