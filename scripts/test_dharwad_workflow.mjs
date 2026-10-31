import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const { resolveManualLocation } = jiti('../src/services/locationService.ts');
const { getCropById } = jiti('../src/data/crops.ts');
const { discoverAndEvaluateMandis } = jiti('../src/engine/discoveryEngine.ts');

console.log('=================================================================');
console.log('QA AUDIT: DEFAULT FARMER WORKFLOW (DHARWAD / NAVALGUND, KARNATAKA)');
console.log('=================================================================\n');

// 1. Resolve Farmer Location (Dharwad)
const farmerLocation = resolveManualLocation('Karnataka', 'Dharwad', 'Navalgund Farm Gate', '582208');
console.log('1. RESOLVED FARMER LOCATION:');
console.log(`   Address    : ${farmerLocation.formattedAddress}`);
console.log(`   Coordinates: Lat ${farmerLocation.latitude}°, Lng ${farmerLocation.longitude}°\n`);

const crop = getCropById('tomato');
const quantityQuintals = 20;

const transportConfig = {
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

const spoilageInputs = {
  mode: 'automatic',
  manualPercentage: 4,
  temperature: 'warm',
  vehicleProtection: 'open',
  handling: 'standard',
  delayHours: 1,
};

const discoveryResult = await discoverAndEvaluateMandis(
  farmerLocation,
  crop,
  quantityQuintals,
  transportConfig,
  spoilageInputs,
  'optimal',
  { sortOption: 'netRevenue' }
);

console.log(`Discovered ${discoveryResult.totalCandidatesFound} unique mandis.`);
console.log(`Feasible: ${discoveryResult.feasibleMarkets.length}, Infeasible: ${discoveryResult.infeasibleMarkets.length}\n`);

console.log('Top Evaluated Mandis from Dharwad:');
console.log('-------------------------------------------------------------------------------------------------------------');
console.log('Rank | Mandi Name                          | Road Dist | Modal Price | Trips | Transport | Fees   | Net Take-Home');
console.log('-------------------------------------------------------------------------------------------------------------');

discoveryResult.evaluatedMarkets.slice(0, 8).forEach((m, idx) => {
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

// Verify that Mandya APMC appears at its true distance from Dharwad
const mandyaMandi = discoveryResult.evaluatedMarkets.find((m) => m.market.marketId === 'ka-mandya-apmc');
if (mandyaMandi) {
  console.log(`Mandya APMC from Dharwad: Road Distance = ${mandyaMandi.route.roadDistanceKm} km (Verified corridor)`);
  console.log(`Duplicate count of Mandya APMC: ${discoveryResult.evaluatedMarkets.filter((m) => m.market.marketId === 'ka-mandya-apmc').length}`);
}

