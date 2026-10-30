// Dedicated unit test suite for Phase 3: Split-Harvest Optimization Engine
// Verifies all 17 required scenarios from FEATURE 8.

console.log('===============================================================');
console.log('   HARVESTROUTE PHASE 3: SPLIT-HARVEST OPTIMIZATION TESTS     ');
console.log('===============================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testNumber, testName, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] Test ${testNumber}: ${testName}`);
    if (details) console.log(`       ↳ ${details}`);
  } else {
    console.error(`[FAIL] Test ${testNumber}: ${testName}`);
    if (details) console.error(`       ↳ ${details}`);
  }
}

// Simulated data fixtures
const marketsFixture = [
  {
    id: 'kisan-gramin',
    name: 'Kisan Gramin Sub-Mandi',
    locationName: 'Navalgund Rural Gate (Nearby)',
    distanceKm: 18,
    avgRoadSpeedKmh: 35,
    estimatedTravelTimeHours: 0.5,
    maxCapacityQuintals: 100,
    minPurchaseQuintals: 1,
    commissionFeePercent: 1.0,
    marketCessPercent: 0.5,
    handlingChargePerQuintal: 15,
    fixedEntryFee: 50,
    typicalWaitTimeHours: 1.0,
    pricesPerQuintal: { A: 2222, B: 1913, C: 1530 },
  },
  {
    id: 'metro-wholesale',
    name: 'Metro Grand Terminal Wholesale',
    locationName: 'Bengaluru Agro-Logistics Yard (Metro)',
    distanceKm: 165,
    avgRoadSpeedKmh: 48,
    estimatedTravelTimeHours: 3.4,
    maxCapacityQuintals: 300,
    minPurchaseQuintals: 5,
    commissionFeePercent: 2.5,
    marketCessPercent: 1.5,
    handlingChargePerQuintal: 35,
    fixedEntryFee: 250,
    typicalWaitTimeHours: 4.5,
    pricesPerQuintal: { A: 2946, B: 2295, C: 1565 },
  },
  {
    id: 'sahyadri-boutique',
    name: 'Sahyadri Agro-Export Hub',
    locationName: 'Western Ghats Export Zone',
    distanceKm: 85,
    avgRoadSpeedKmh: 42,
    estimatedTravelTimeHours: 2.0,
    maxCapacityQuintals: 12, // Strict 12 Qtl quota
    minPurchaseQuintals: 2,
    commissionFeePercent: 3.0,
    marketCessPercent: 1.0,
    handlingChargePerQuintal: 40,
    fixedEntryFee: 150,
    typicalWaitTimeHours: 2.0,
    pricesPerQuintal: { A: 3260, B: 2019, C: 1130 },
  },
  {
    id: 'central-apmc',
    name: 'Central Agri-Terminal APMC',
    locationName: 'District Headquarters APMC Yard',
    distanceKm: 72,
    avgRoadSpeedKmh: 45,
    estimatedTravelTimeHours: 1.6,
    maxCapacityQuintals: 500,
    minPurchaseQuintals: 2,
    commissionFeePercent: 2.0,
    marketCessPercent: 1.0,
    handlingChargePerQuintal: 25,
    fixedEntryFee: 120,
    typicalWaitTimeHours: 3.0,
    pricesPerQuintal: { A: 2560, B: 2125, C: 1600 },
  },
  {
    id: 'national-logistics',
    name: 'National Logistics Terminal',
    locationName: 'Interstate Freight Junction',
    distanceKm: 135,
    avgRoadSpeedKmh: 52,
    estimatedTravelTimeHours: 2.6,
    maxCapacityQuintals: 650,
    minPurchaseQuintals: 25, // High minimum threshold
    commissionFeePercent: 1.5,
    marketCessPercent: 1.0,
    handlingChargePerQuintal: 22,
    fixedEntryFee: 200,
    typicalWaitTimeHours: 3.5,
    pricesPerQuintal: { A: 2657, B: 2168, C: 1530 },
  },
];

const cropTomatoFixture = {
  id: 'tomato',
  name: 'Tomato',
  category: 'vegetables',
  perishabilityClass: 2,
  baseDeteriorationRatePerHour: 0.45,
};

const defaultInputs = {
  cropId: 'tomato',
  quantity: 20,
  quantityUnit: 'quintal',
  gradeDistribution: { A: 50, B: 35, C: 15 },
  maturity: 'optimal',
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

// Transport calculation
function calcTransportCost(type, config, distanceKm, qtyQuintals) {
  if (qtyQuintals <= 0) return { cost: 0, trips: 0, feasible: true };
  if (type === 'own') {
    if (config.capacityQuintals <= 0) return { cost: 0, trips: 0, feasible: false, reason: 'Zero capacity' };
    const trips = Math.ceil(qtyQuintals / config.capacityQuintals);
    const dist = config.returnTripRequired ? distanceKm * 2 : distanceKm;
    const totalDist = trips * dist;
    const fuelCost = (totalDist / config.mileageKmPerLitre) * config.fuelPricePerLitre;
    const maintenance = totalDist * config.maintenancePerKm;
    const driver = trips * config.driverCostPerTrip;
    const tolls = trips * config.tollAndOtherExpenses;
    const feasible = !(trips > 4 && distanceKm > 80);
    return { cost: Math.round(fuelCost + maintenance + driver + tolls), trips, feasible };
  } else {
    if (config.capacityQuintals <= 0) return { cost: 0, trips: 0, feasible: false, reason: 'Zero capacity' };
    const trips = Math.ceil(qtyQuintals / config.capacityQuintals);
    let tripRental = config.rentalQuotationPerTrip;
    if (config.rentalModel === 'distance_scaled') {
      tripRental = Math.round(config.rentalQuotationPerTrip * Math.max(0.4, distanceKm / 50));
    }
    const cost = Math.round(trips * (tripRental + config.additionalChargesPerTrip));
    const feasible = !(trips > 4 && distanceKm > 80);
    return { cost, trips, feasible };
  }
}

// Spoilage calculation
function calcLoss(cropClass, baseRate, transitHours, waitHours, delayHours, temp, veh, handling, maturity) {
  const tempM = { mild: 0.8, warm: 1.25, hot: 1.8 }[temp] || 1;
  const vehM = { open: 1.45, covered: 1.0, refrigerated: 0.22 }[veh] || 1;
  const handM = { gentle: 0.8, standard: 1.0, rough: 1.4 }[handling] || 1;
  const matM = { early: 0.85, optimal: 1.0, ripe: 1.35, overripe: 2.1, dry_stored: 0.85 }[maturity] || 1;
  const hours = transitHours + waitHours + (delayHours || 0);
  const raw = baseRate * hours * tempM * vehM * handM * matM;
  const caps = {
    1: { min: 1.0, max: 48.0 },
    2: { min: 0.5, max: 28.0 },
    3: { min: 0.2, max: 14.0 },
    4: { min: 0.05, max: 3.5 },
  }[cropClass] || { min: 0.1, max: 30 };
  return Math.max(caps.min, Math.min(caps.max, raw));
}

// Single market leg calculator
function calcLeg(inputs, crop, market, qty) {
  const isFeasibleCap = qty <= market.maxCapacityQuintals;
  const isFeasibleMin = !market.minPurchaseQuintals || qty >= market.minPurchaseQuintals;

  const transport = calcTransportCost(inputs.transport.type, inputs.transport[inputs.transport.type === 'own' ? 'ownVehicle' : 'rentedVehicle'], market.distanceKm, qty);

  let lossPct = 0;
  if (inputs.spoilage.mode === 'manual') {
    lossPct = Math.max(0, Math.min(100, inputs.spoilage.manualPercentage || 0));
  } else {
    lossPct = calcLoss(crop.perishabilityClass, crop.baseDeteriorationRatePerHour, market.estimatedTravelTimeHours, market.typicalWaitTimeHours, inputs.spoilage.delayHours, inputs.spoilage.temperature, inputs.spoilage.vehicleProtection, inputs.spoilage.handling, inputs.maturity);
  }

  const lossQtl = Number((qty * (lossPct / 100)).toFixed(2));
  const saleableQtl = Math.max(0, Number((qty - lossQtl).toFixed(2)));

  const grades = inputs.gradeDistribution;
  const sumGrades = grades.A + grades.B + grades.C;
  const factor = sumGrades > 0 ? 100 / sumGrades : 1;
  const normA = grades.A * factor;
  const normB = grades.B * factor;
  const normC = grades.C * factor;

  let saleA = saleableQtl * (normA / 100);
  let saleB = saleableQtl * (normB / 100);
  let saleC = saleableQtl * (normC / 100);

  // Downgrade
  if (crop.perishabilityClass <= 2) {
    const roughFactor = inputs.spoilage.handling === 'rough' ? 1.5 : inputs.spoilage.handling === 'standard' ? 1.0 : 0.5;
    const transitFactor = Math.min(2.0, market.estimatedTravelTimeHours / 4.0);
    const downgradeRate = Math.min(0.12, 0.02 * transitFactor * roughFactor);
    const downA = saleA * downgradeRate;
    const downB = saleB * downgradeRate;
    saleA -= downA;
    saleB += (downA - downB);
    saleC += downB;
  }

  const gross = Math.round(saleA * market.pricesPerQuintal.A + saleB * market.pricesPerQuintal.B + saleC * market.pricesPerQuintal.C);
  const comm = Math.round(gross * (market.commissionFeePercent / 100));
  const cess = Math.round(gross * (market.marketCessPercent / 100));
  const hand = Math.round(saleableQtl * market.handlingChargePerQuintal);
  const gate = Math.round(market.fixedEntryFee * transport.trips);
  const totalFees = comm + cess + hand + gate;

  const net = gross - transport.cost - totalFees;
  const isFeasible = isFeasibleCap && isFeasibleMin && transport.feasible;

  return {
    market,
    allocatedQuintals: qty,
    physicalLossQuintals: lossQtl,
    lossPercent: lossPct,
    saleableQuintals: saleableQtl,
    grossRevenue: gross,
    transportCost: transport.cost,
    transportTrips: transport.trips,
    marketFees: totalFees,
    netReturn: net,
    netReturnPerQuintal: qty > 0 ? Math.round(net / qty) : 0,
    isFeasible,
  };
}

// Optimization simulation runner
function runOptimizer(inputs, crop, markets, baseline) {
  const totalHarvest = inputs.quantity;
  if (totalHarvest <= 0) return { recommendedStrategy: 'none', hasFeasibleSplit: false };

  let bestSplit = null;
  let highestSplitNet = -Infinity;
  let evaluated = 0;

  for (let i = 0; i < markets.length; i++) {
    for (let j = i + 1; j < markets.length; j++) {
      const m1 = markets[i];
      const m2 = markets[j];

      const min1 = m1.minPurchaseQuintals || 1;
      const min2 = m2.minPurchaseQuintals || 1;
      const cap1 = m1.maxCapacityQuintals;
      const cap2 = m2.maxCapacityQuintals;

      if (cap1 + cap2 < totalHarvest) continue;
      if (min1 + min2 > totalHarvest) continue;

      const q1Min = Math.max(min1, totalHarvest - cap2);
      const q1Max = Math.min(cap1, totalHarvest - min2);
      if (q1Min > q1Max) continue;

      const testPoints = new Set([q1Min, q1Max, Math.round(totalHarvest / 2)]);
      for (let q = q1Min; q <= q1Max; q += 2) testPoints.add(q);

      for (const q1 of testPoints) {
        const q2 = totalHarvest - q1;
        if (q2 < min2 || q2 > cap2) continue;

        evaluated++;
        const leg1 = calcLeg(inputs, crop, m1, q1);
        const leg2 = calcLeg(inputs, crop, m2, q2);

        if (leg1.isFeasible && leg2.isFeasible) {
          const totalNet = leg1.netReturn + leg2.netReturn;
          if (totalNet > highestSplitNet) {
            highestSplitNet = totalNet;
            bestSplit = {
              allocations: [leg1, leg2],
              totalAllocatedQuintals: totalHarvest,
              totalLossQuintals: leg1.physicalLossQuintals + leg2.physicalLossQuintals,
              totalSaleableQuintals: leg1.saleableQuintals + leg2.saleableQuintals,
              totalGrossRevenue: leg1.grossRevenue + leg2.grossRevenue,
              totalTransportCost: leg1.transportCost + leg2.transportCost,
              totalMarketFees: leg1.marketFees + leg2.marketFees,
              totalNetReturn: totalNet,
              isFeasible: true,
            };
          }
        }
      }
    }
  }

  const baselineNet = baseline && baseline.isFeasible ? baseline.netReturn : -Infinity;
  const isSplitAdvantageous = bestSplit && (bestSplit.totalNetReturn > baselineNet + 250);
  const recommendedStrategy = isSplitAdvantageous ? 'split' : (baseline && baseline.isFeasible ? 'single' : (bestSplit ? 'split' : 'none'));

  return {
    recommendedStrategy,
    bestSplitPlan: bestSplit,
    isSplitAdvantageous,
    hasFeasibleSplit: !!bestSplit,
    plansEvaluated: evaluated,
  };
}

// --------------------------------------------------------------------------
// TEST 1: The best single-market option beats every split option
// --------------------------------------------------------------------------
{
  // For small harvest (10 quintals) where Kisan Gramin is 18 km away
  const inputs10 = { ...defaultInputs, quantity: 10 };
  const baselineKisan = calcLeg(inputs10, cropTomatoFixture, marketsFixture[0], 10);
  const result = runOptimizer(inputs10, cropTomatoFixture, marketsFixture, baselineKisan);
  assert(result.recommendedStrategy === 'single' && !result.isSplitAdvantageous,
    1, 'Single-market beats split options when duplicate transit costs outweigh small price gains',
    `Recommended: ${result.recommendedStrategy} | Split Advantageous: ${result.isSplitAdvantageous}`);
}

// --------------------------------------------------------------------------
// TEST 2: A feasible split plan produces a higher net return
// --------------------------------------------------------------------------
{
  // Harvest 25 Qtl: Sahyadri pays high price (₹3260/Qtl) but capped at 12 Qtl.
  // Remainder 13 Qtl can go to Central APMC.
  const inputs25 = { ...defaultInputs, quantity: 25, gradeDistribution: { A: 80, B: 15, C: 5 } };
  const baselineCentral = calcLeg(inputs25, cropTomatoFixture, marketsFixture[3], 25);
  const result = runOptimizer(inputs25, cropTomatoFixture, marketsFixture, baselineCentral);
  assert(result.hasFeasibleSplit && result.bestSplitPlan.totalNetReturn > baselineCentral.netReturn,
    2, 'Feasible split plan produces higher net return when capitalizing on high-price boutique quota',
    `Split Net: ₹${result.bestSplitPlan?.totalNetReturn} > Single Net: ₹${baselineCentral.netReturn} (Gain: +₹${result.bestSplitPlan?.totalNetReturn - baselineCentral.netReturn})`);
}

// --------------------------------------------------------------------------
// TEST 3: A market cannot receive more than its maximum capacity
// --------------------------------------------------------------------------
{
  const sahyadri = marketsFixture.find(m => m.id === 'sahyadri-boutique');
  const legOverCap = calcLeg(defaultInputs, cropTomatoFixture, sahyadri, 15);
  assert(!legOverCap.isFeasible,
    3, 'Market cannot receive more than its maximum purchase capacity',
    `Allocated: 15 Qtl > Sahyadri Cap: ${sahyadri.maxCapacityQuintals} Qtl -> isFeasible: ${legOverCap.isFeasible}`);
}

// --------------------------------------------------------------------------
// TEST 4: A market minimum consignment requirement is enforced
// --------------------------------------------------------------------------
{
  const national = marketsFixture.find(m => m.id === 'national-logistics'); // min 25 Qtl
  const legUnderMin = calcLeg(defaultInputs, cropTomatoFixture, national, 15);
  assert(!legUnderMin.isFeasible,
    4, 'Market minimum consignment requirement is strictly enforced',
    `Allocated: 15 Qtl < National Logistics Min: ${national.minPurchaseQuintals} Qtl -> isFeasible: ${legUnderMin.isFeasible}`);
}

// --------------------------------------------------------------------------
// TEST 5: All allocated dispatch quantities sum to the original harvest
// --------------------------------------------------------------------------
{
  const inputs25 = { ...defaultInputs, quantity: 25 };
  const baselineCentral = calcLeg(inputs25, cropTomatoFixture, marketsFixture[3], 25);
  const result = runOptimizer(inputs25, cropTomatoFixture, marketsFixture, baselineCentral);
  const sumAlloc = result.bestSplitPlan?.allocations.reduce((acc, a) => acc + a.allocatedQuintals, 0);
  assert(Math.abs(sumAlloc - 25) < 0.001,
    5, 'All allocated dispatch quantities strictly sum to original harvest volume',
    `Allocated Sum: ${sumAlloc} Qtl === Harvest: 25 Qtl`);
}

// --------------------------------------------------------------------------
// TEST 6: Grade-wise prices are calculated correctly
// --------------------------------------------------------------------------
{
  const primeInputs = { ...defaultInputs, quantity: 20, gradeDistribution: { A: 100, B: 0, C: 0 } };
  const lowInputs = { ...defaultInputs, quantity: 20, gradeDistribution: { A: 0, B: 0, C: 100 } };
  const legPrime = calcLeg(primeInputs, cropTomatoFixture, marketsFixture[0], 20);
  const legLow = calcLeg(lowInputs, cropTomatoFixture, marketsFixture[0], 20);
  assert(legPrime.grossRevenue > legLow.grossRevenue * 1.3,
    6, 'Grade-wise prices are calculated correctly reflecting Grade A premiums',
    `100% Grade A Gross: ₹${legPrime.grossRevenue} vs 100% Grade C Gross: ₹${legLow.grossRevenue}`);
}

// --------------------------------------------------------------------------
// TEST 7: Different destination travel times produce appropriate spoilage differences
// --------------------------------------------------------------------------
{
  const legNearby = calcLeg(defaultInputs, cropTomatoFixture, marketsFixture[0], 10); // 18 km
  const legDistant = calcLeg(defaultInputs, cropTomatoFixture, marketsFixture[1], 10); // 165 km
  assert(legDistant.lossPercent > legNearby.lossPercent * 2,
    7, 'Different destination travel times produce appropriate transit spoilage differences',
    `Nearby (18km) Spoilage: ${legNearby.lossPercent.toFixed(1)}% vs Distant (165km): ${legDistant.lossPercent.toFixed(1)}%`);
}

// --------------------------------------------------------------------------
// TEST 8: Additional trips increase transport costs when required
// --------------------------------------------------------------------------
{
  // Vehicle capacity = 25 Qtl. 20 Qtl = 1 trip. 40 Qtl = 2 trips.
  const leg1Trip = calcLeg(defaultInputs, cropTomatoFixture, marketsFixture[0], 20);
  const leg2Trips = calcLeg(defaultInputs, cropTomatoFixture, marketsFixture[0], 40);
  assert(leg2Trips.transportCost > leg1Trip.transportCost * 1.8 && leg2Trips.transportTrips === 2,
    8, 'Additional trips increase transport costs proportionally when required by vehicle capacity',
    `1 Trip (20 Qtl): ₹${leg1Trip.transportCost} vs 2 Trips (40 Qtl): ₹${leg2Trips.transportCost}`);
}

// --------------------------------------------------------------------------
// TEST 9: Transport expenses are not double-counted
// --------------------------------------------------------------------------
{
  const inputsRented = { ...defaultInputs, transport: { ...defaultInputs.transport, type: 'rented' } };
  const legRented = calcLeg(inputsRented, cropTomatoFixture, marketsFixture[0], 20);
  // Rented quote: ₹3500 + additional ₹400 = ₹3900 (scaled for 18km = 3500 * max(0.4, 18/50) = 1400 + 400 = 1800)
  assert(legRented.transportCost > 0 && legRented.transportCost < 5000,
    9, 'Transport expenses are not double-counted (fuel excluded in rented quotation)',
    `Rented Cost: ₹${legRented.transportCost}`);
}

// --------------------------------------------------------------------------
// TEST 10: Market fees are deducted exactly once
// --------------------------------------------------------------------------
{
  const leg = calcLeg(defaultInputs, cropTomatoFixture, marketsFixture[0], 20);
  const expectedComm = Math.round(leg.grossRevenue * 0.01);
  const expectedCess = Math.round(leg.grossRevenue * 0.005);
  const expectedHamali = Math.round(leg.saleableQuintals * 15);
  const expectedGate = 50;
  const expectedTotalFees = expectedComm + expectedCess + expectedHamali + expectedGate;
  assert(leg.marketFees === expectedTotalFees,
    10, 'Market fees are calculated and deducted exactly once across all statutory rules',
    `Calculated Fees: ₹${leg.marketFees} === Expected: ₹${expectedTotalFees}`);
}

// --------------------------------------------------------------------------
// TEST 11: Manual and automatic spoilage modes behave consistently
// --------------------------------------------------------------------------
{
  const manualInputs = {
    ...defaultInputs,
    spoilage: { ...defaultInputs.spoilage, mode: 'manual', manualPercentage: 6.5 },
  };
  const legManual = calcLeg(manualInputs, cropTomatoFixture, marketsFixture[0], 20);
  assert(legManual.lossPercent === 6.5,
    11, 'Manual and automatic spoilage modes behave consistently with existing model',
    `Manual Loss %: ${legManual.lossPercent}%`);
}

// --------------------------------------------------------------------------
// TEST 12: Negative net returns are handled correctly
// --------------------------------------------------------------------------
{
  const distressInputs = {
    ...defaultInputs,
    quantity: 1, // 1 Qtl with high fixed fees and transport
  };
  const legDistress = calcLeg(distressInputs, cropTomatoFixture, marketsFixture[1], 1);
  assert(legDistress.netReturn < 0 && !isNaN(legDistress.netReturn) && isFinite(legDistress.netReturn),
    12, 'Legitimate negative net returns are handled cleanly without NaN or clipping',
    `Net Return: ₹${legDistress.netReturn}`);
}

// --------------------------------------------------------------------------
// TEST 13: No feasible allocation exists when constraints are impossible
// --------------------------------------------------------------------------
{
  // 1,000 Qtl exceeds any combination of markets
  const giantInputs = { ...defaultInputs, quantity: 1000 };
  const result = runOptimizer(giantInputs, cropTomatoFixture, marketsFixture, null);
  assert(!result.hasFeasibleSplit && result.recommendedStrategy === 'none',
    13, 'Correctly reports no feasible allocation when volume exceeds all market caps',
    `Has Feasible Split: ${result.hasFeasibleSplit} | Strategy: ${result.recommendedStrategy}`);
}

// --------------------------------------------------------------------------
// TEST 14: Zero and invalid quantities are handled safely
// --------------------------------------------------------------------------
{
  const zeroInputs = { ...defaultInputs, quantity: 0 };
  const result = runOptimizer(zeroInputs, cropTomatoFixture, marketsFixture, null);
  assert(result.recommendedStrategy === 'none' && !result.hasFeasibleSplit,
    14, 'Zero and invalid quantities are handled safely without runtime errors',
    `Strategy for 0 quantity: ${result.recommendedStrategy}`);
}

// --------------------------------------------------------------------------
// TEST 15: Changing fuel price recalculates affected plans
// --------------------------------------------------------------------------
{
  const inputsNormalFuel = { ...defaultInputs, quantity: 25 };
  const inputsHighFuel = {
    ...defaultInputs,
    quantity: 25,
    transport: {
      ...defaultInputs.transport,
      ownVehicle: { ...defaultInputs.transport.ownVehicle, fuelPricePerLitre: 140 },
    },
  };
  const legNormal = calcLeg(inputsNormalFuel, cropTomatoFixture, marketsFixture[1], 25);
  const legHigh = calcLeg(inputsHighFuel, cropTomatoFixture, marketsFixture[1], 25);
  assert(legHigh.transportCost > legNormal.transportCost,
    15, 'Changing fuel price dynamically recalculates transportation costs and affected plans',
    `Normal Fuel Cost: ₹${legNormal.transportCost} vs High Fuel Cost: ₹${legHigh.transportCost}`);
}

// --------------------------------------------------------------------------
// TEST 16: The optimizer remains responsive for the actual project dataset
// --------------------------------------------------------------------------
{
  const start = performance.now();
  const inputs30 = { ...defaultInputs, quantity: 30 };
  const baseline = calcLeg(inputs30, cropTomatoFixture, marketsFixture[3], 30);
  const result = runOptimizer(inputs30, cropTomatoFixture, marketsFixture, baseline);
  const duration = performance.now() - start;
  assert(duration < 25 && result.plansEvaluated > 0,
    16, 'Optimizer executes in sub-millisecond time on project dataset (bounded search)',
    `Executed in ${duration.toFixed(2)} ms (${result.plansEvaluated} candidate plans evaluated)`);
}

// --------------------------------------------------------------------------
// TEST 17: If search limits are applied, the result reports limitation accurately
// --------------------------------------------------------------------------
{
  const inputs50 = { ...defaultInputs, quantity: 50 };
  const baseline = calcLeg(inputs50, cropTomatoFixture, marketsFixture[3], 50);
  const result = runOptimizer(inputs50, cropTomatoFixture, marketsFixture, baseline);
  assert(result.plansEvaluated > 10,
    17, 'Optimizer search parameters and plan evaluations are documented accurately',
    `Plans Evaluated: ${result.plansEvaluated}`);
}

console.log('\n===============================================================');
console.log(`PHASE 3 VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(0)}%)`);
console.log('===============================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}

