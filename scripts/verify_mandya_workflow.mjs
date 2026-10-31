/**
 * QA AUDIT: VERIFY COMPLETE FARMER WORKFLOW FOR MANDYA, KARNATAKA
 * Inputs:
 * - Location: Mandya, Karnataka
 * - Crop: Tomato
 * - Quantity: 50 Quintals
 * - Vehicle: Mini Truck (Capacity 25 Qtl)
 */

import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const { resolveManualLocation } = jiti('../src/services/locationService.ts');
const { getCropById } = jiti('../src/data/crops.ts');
const { discoverAndEvaluateMandis } = jiti('../src/engine/discoveryEngine.ts');
const { evaluateSellNowVsLater } = jiti('../src/engine/sellNowVsLater.ts');

console.log('=================================================================');
console.log('QA AUDIT: COMPLETE FARMER WORKFLOW (MANDYA, KARNATAKA)');
console.log('=================================================================\n');

// 1. Resolve Farmer Location
const farmerLocation = resolveManualLocation('Karnataka', 'Mandya', 'Mandya Farm Gate', '571401');
console.log('1. RESOLVED FARMER LOCATION:');
console.log(`   Address    : ${farmerLocation.formattedAddress}`);
console.log(`   Coordinates: Lat ${farmerLocation.latitude}°, Lng ${farmerLocation.longitude}°`);
console.log(`   Method     : ${farmerLocation.method}\n`);

// 2. Setup Harvest & Transport
const crop = getCropById('tomato');
const quantityQuintals = 50;

// Mini Truck Transport Configuration (25 Quintals Capacity -> Consignment requires 2 trips!)
const transportConfig = {
  type: 'own',
  ownVehicle: {
    capacityQuintals: 25,
    mileageKmPerLitre: 8,
    fuelPricePerLitre: 96,
    maintenancePerKm: 2,
    driverCostPerTrip: 500,
    tollAndOtherExpenses: 150,
    returnTripRequired: true,
  },
  rentedVehicle: {
    rentalQuotationPerTrip: 2500,
    rentalRatePerKm: 30,
    capacityQuintals: 25,
    additionalChargesPerTrip: 0,
    rentalModel: 'distance_scaled',
  },
};

const spoilageInputs = {
  mode: 'automatic',
  manualPercentage: 4,
  temperature: 'warm',
  vehicleProtection: 'covered',
  handling: 'standard',
  delayHours: 1.5,
};

// 3. Execute Discovery Engine
console.log('2. DISCOVERING RELEVANT MARKETS...');
const discoveryResult = await discoverAndEvaluateMandis(
  farmerLocation,
  crop,
  quantityQuintals,
  transportConfig,
  spoilageInputs,
  'optimal',
  { sortOption: 'netRevenue' }
);

console.log(`   Discovered ${discoveryResult.totalCandidatesFound} Mandis.`);
console.log(`   Feasible Markets: ${discoveryResult.feasibleMarkets.length}`);
console.log(`   Infeasible Markets: ${discoveryResult.infeasibleMarkets.length}\n`);

// 4. Inspect Evaluated Candidate Mandis
console.log('3. DISCOVERED MANDI COMPARISON TABLE:');
console.log('-------------------------------------------------------------------------------------------------------------');
console.log('Rank | Mandi Name                          | Road Dist | Modal Price | Trips | Transport | Fees   | Net Take-Home');
console.log('-------------------------------------------------------------------------------------------------------------');

discoveryResult.evaluatedMarkets.slice(0, 5).forEach((m, idx) => {
  const name = m.market.marketName.padEnd(35).slice(0, 35);
  const dist = `${m.route.roadDistanceKm} km`.padEnd(9);
  const price = `₹${m.priceRecord?.modalPrice || 0}/Qtl`.padEnd(11);
  const trips = `${m.transportTrips} trips`.padEnd(6);
  const transport = `₹${m.transportCost}`.padEnd(10);
  const fees = `₹${m.marketFees}`.padEnd(7);
  const net = `₹${m.netSellingRevenue.toLocaleString('en-IN')}`;
  console.log(`  ${idx + 1}  | ${name} | ${dist} | ${price} | ${trips} | ${transport} | ${fees} | ${net}`);
});
console.log('-------------------------------------------------------------------------------------------------------------\n');

// 5. Inspect 🏆 Recommended Mandi
const rec = discoveryResult.recommendedMarket;
if (rec) {
  console.log('4. 🏆 RECOMMENDED MANDI DETAILS:');
  console.log(`   Name        : ${rec.market.marketName} (${rec.market.district}, ${rec.market.state})`);
  console.log(`   Road Distance: ${rec.route.roadDistanceKm} km (${rec.route.estimatedTravelTimeHours} hrs driving)`);
  console.log(`   Modal Price : ₹${rec.priceRecord?.modalPrice}/Qtl (Source: ${rec.priceRecord?.source}, Date: ${rec.priceRecord?.arrivalDate})`);
  console.log(`   Total Volume: 50 Quintals dispatched -> Required Vehicle Trips: ${rec.transportTrips} (Mini Truck @ 25 Qtl/trip)`);
  console.log(`   Gross Sales : ₹${rec.grossRevenue.toLocaleString('en-IN')}`);
  console.log(`   Deductions  : Transport ₹${rec.transportCost.toLocaleString('en-IN')} + Mandi Fees ₹${rec.marketFees.toLocaleString('en-IN')} + Spoilage ${rec.spoilagePercent}%`);
  console.log(`   Net Take-Home: ₹${rec.netSellingRevenue.toLocaleString('en-IN')} (₹${rec.netRevenuePerQuintal}/Qtl)`);
  console.log(`   Key Rationale: ${rec.recommendationReasons.join(' | ')}\n`);

  // 6. Inspect ML Predictions for Recommended Mandi
  console.log('5. 🤖 MACHINE LEARNING CROP PRICE FORECAST (XGBoost Regressor):');
  const forecast = rec.forecast;
  if (forecast && forecast.available) {
    const f3 = forecast.forecasts.d3;
    const f7 = forecast.forecasts.d7;
    const f14 = forecast.forecasts.d14;
    console.log(`   Current Actual Price (T=0)  : ₹${forecast.latestActualPrice}/Qtl (${forecast.latestArrivalDate})`);
    console.log(`   3-Day Forecast  (${f3.targetDate}) : ₹${f3.predictedPrice}/Qtl (80% CI: ₹${f3.minConfidencePrice} - ₹${f3.maxConfidencePrice}) | Trend: ${f3.trendDirection} (${f3.priceDeltaVsCurrent >= 0 ? '+' : ''}${f3.priceDeltaVsCurrent}₹)`);
    console.log(`   7-Day Forecast  (${f7.targetDate}) : ₹${f7.predictedPrice}/Qtl (80% CI: ₹${f7.minConfidencePrice} - ₹${f7.maxConfidencePrice}) | Trend: ${f7.trendDirection} (${f7.priceDeltaVsCurrent >= 0 ? '+' : ''}${f7.priceDeltaVsCurrent}₹)`);
    console.log(`   14-Day Forecast (${f14.targetDate}): ₹${f14.predictedPrice}/Qtl (80% CI: ₹${f14.minConfidencePrice} - ₹${f14.maxConfidencePrice}) | Trend: ${f14.trendDirection} (${f14.priceDeltaVsCurrent >= 0 ? '+' : ''}${f14.priceDeltaVsCurrent}₹)\n`);
  } else {
    console.log(`   ML Forecast: ${forecast?.unavailabilityReason || 'Unavailable'}\n`);
  }

  // 7. Sell Now vs Sell Later Comparison
  console.log('6. ⚖️ SELL NOW VS SELL LATER DECISION COMPARISON:');
  const comparison = evaluateSellNowVsLater(
    crop,
    quantityQuintals,
    rec.priceRecord?.modalPrice || 2380,
    forecast,
    rec.transportCost,
    rec.market.commissionPercent,
    rec.market.cessPercent,
    rec.market.handlingChargePerQuintal,
    { dailyRatePerQuintal: 2.5, storageType: 'ambient' }
  );

  comparison.options.forEach((opt) => {
    const title = opt.title.padEnd(32);
    const price = `₹${opt.pricePerQuintal}/Qtl`.padEnd(11);
    const saleable = `${opt.saleableQuintals} Qtl`.padEnd(10);
    const loss = `Loss: ${opt.spoilagePercent}%`.padEnd(12);
    const storage = `Storage: ₹${opt.storageCost}`.padEnd(15);
    const net = `Net: ₹${opt.netRevenue.toLocaleString('en-IN')}`.padEnd(16);
    const delta = `Delta: ${opt.netGainVsSellNow >= 0 ? '+' : ''}₹${opt.netGainVsSellNow.toLocaleString('en-IN')}`.padEnd(16);
    const decision = `[${opt.decision}]`;
    console.log(`   ${title} | ${price} | ${saleable} | ${loss} | ${storage} | ${net} | ${delta} | ${decision}`);
  });

  console.log(`\n   Recommendation Summary: ${comparison.summaryGuidance}`);
  if (comparison.perishabilityWarning) {
    console.log(`   ⚠️ Advisory: ${comparison.perishabilityWarning}`);
  }
}
