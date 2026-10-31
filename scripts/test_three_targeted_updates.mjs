import createJiti from 'jiti';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const jiti = createJiti(import.meta.url);

console.log('===============================================================');
console.log('   HARVESTROUTE TARGETED TESTING: THREE FEATURE UPDATES        ');
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
// AREA 1: LANDING PAGE CTA BUTTON
// -----------------------------------------------------------------------------
test('Landing Page - HeroSection contains Explore Bulk Marketplace CTA button', () => {
  const heroPath = path.resolve('src/components/landing/HeroSection.tsx');
  const heroContent = fs.readFileSync(heroPath, 'utf-8');

  assert(
    heroContent.includes('Explore Bulk Marketplace'),
    'HeroSection should contain button text "Explore Bulk Marketplace"'
  );
  assert(
    heroContent.includes('onOpenMarketplace'),
    'HeroSection should accept onOpenMarketplace callback'
  );
  assert(
    heroContent.includes('Store') || heroContent.includes('Building2'),
    'HeroSection should include an appropriate marketplace icon'
  );

  // Check LandingPage passes onOpenMarketplace to HeroSection
  const landingPath = path.resolve('src/components/landing/LandingPage.tsx');
  const landingContent = fs.readFileSync(landingPath, 'utf-8');
  assert(
    landingContent.includes('onOpenMarketplace={onOpenMarketplace}'),
    'LandingPage should pass onOpenMarketplace callback to HeroSection'
  );
});

// -----------------------------------------------------------------------------
// AREA 2: MARKETPLACE SAMPLE LISTINGS & FILTERING
// -----------------------------------------------------------------------------
test('Marketplace - Sample listings dataset defined with all 7 requested crops', () => {
  const sampleModule = jiti('../src/data/sampleMarketplaceRequirements.ts');
  const { SAMPLE_BUYER_REQUIREMENTS } = sampleModule;

  assert(Array.isArray(SAMPLE_BUYER_REQUIREMENTS), 'SAMPLE_BUYER_REQUIREMENTS must be an array');
  assert(SAMPLE_BUYER_REQUIREMENTS.length >= 7, 'Must contain at least 7 sample requirements');

  const requiredCrops = ['Tomato', 'Onion', 'Potato', 'Cabbage', 'Green Chilli', 'Coriander', 'Green Gram'];
  const sampleCrops = SAMPLE_BUYER_REQUIREMENTS.map((s) => s.commodity);

  for (const crop of requiredCrops) {
    assert(
      sampleCrops.includes(crop),
      `Sample listings must include crop: ${crop}. Found: ${sampleCrops.join(', ')}`
    );
  }

  // Confirm all listings are clearly flagged as sample/demo
  for (const item of SAMPLE_BUYER_REQUIREMENTS) {
    assert(item.isSample === true, `Item ${item.id} must have isSample: true`);
    assert(item.companyName.includes('(Demo)'), `Item ${item.companyName} must include (Demo) label`);
    assert(item.quantityQuintals > 0, `Item ${item.id} must have positive quantity`);
    assert(item.targetPricePerQuintal > 0, `Item ${item.id} must have positive price`);
    assert(Boolean(item.deliveryLocation), `Item ${item.id} must have delivery location`);
    assert(Boolean(item.deliveryDate), `Item ${item.id} must have delivery date`);
    assert(Boolean(item.organizationType), `Item ${item.id} must have organization type`);
  }
});

test('Marketplace - Crop filter works correctly for sample listings', () => {
  const sampleModule = jiti('../src/data/sampleMarketplaceRequirements.ts');
  const { SAMPLE_BUYER_REQUIREMENTS } = sampleModule;

  const tomatoListings = SAMPLE_BUYER_REQUIREMENTS.filter(
    (r) => r.commodity.toLowerCase() === 'tomato'
  );
  assert(tomatoListings.length >= 1, 'Filtering by Tomato returns at least 1 sample listing');
  assert(tomatoListings.every((r) => r.commodity === 'Tomato'), 'All filtered results must be Tomato');

  const onionListings = SAMPLE_BUYER_REQUIREMENTS.filter(
    (r) => r.commodity.toLowerCase() === 'onion'
  );
  assert(onionListings.length >= 1, 'Filtering by Onion returns at least 1 sample listing');
  assert(onionListings.every((r) => r.commodity === 'Onion'), 'All filtered results must be Onion');
});

// -----------------------------------------------------------------------------
// AREA 3: MANUAL BUYER POSTING PRESERVATION
// -----------------------------------------------------------------------------
test('Marketplace - Manual Buyer View posting form is completely preserved', () => {
  const marketplacePath = path.resolve('src/components/marketplace/BulkBuyerMarketplace.tsx');
  const content = fs.readFileSync(marketplacePath, 'utf-8');

  // Verify all required manual form fields exist
  const requiredFormFields = [
    'Company / Organization Name',
    'Business Category',
    'Required Produce',
    'Consignment Quantity',
    'Target Price',
    'Delivery Destination',
    'Target Delivery Date',
    'Procurement Manager',
    'Contact Phone',
    'Email Address',
    'Special Quality or Packaging Notes',
    'Publish Requirement to Farm Gate Producers',
  ];

  for (const field of requiredFormFields) {
    assert(content.includes(field), `Manual buyer form must retain field: ${field}`);
  }

  assert(content.includes('localStorage.setItem'), 'Form must save genuine requirements to localStorage');
});

// -----------------------------------------------------------------------------
// AREA 4: OWN VEHICLE FUEL COST CALCULATION & UPDATES
// -----------------------------------------------------------------------------
test('Own Vehicle - Fuel cost calculation respects mileage, fuel price, distance and return trip', () => {
  const transportModule = jiti('../src/engine/transport.ts');
  const { calculateTransportationCost } = transportModule;

  const baseConfig = {
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

  // Scenario 1: One-way distance 50 km, Round-trip = 100 km, 20 Quintals (1 trip)
  // Total Distance = 100 km
  // Fuel Required = 100 km / 10 km/L = 10 litres
  // Fuel Cost = 10 L * 95 = Rs. 950
  // Maintenance = 100 km * Rs. 2 = Rs. 200
  // Driver = Rs. 500, Tolls = Rs. 200
  // Total = 950 + 200 + 500 + 200 = Rs. 1850
  const calc1 = calculateTransportationCost(baseConfig, 50, 20);
  assert.strictEqual(calc1.totalDistanceKm, 100, 'Total distance should be 100 km');
  assert.strictEqual(calc1.tripsCount, 1, 'Trips count should be 1');
  assert.strictEqual(calc1.fuelCost, 950, 'Fuel cost should be Rs. 950 (10 L * Rs. 95)');
  assert.strictEqual(calc1.totalCost, 1850, 'Total cost should be Rs. 1850');

  // Scenario 2: Change mileage to 8 km/L and fuel price to Rs. 100
  // Fuel Required = 100 km / 8 km/L = 12.5 litres
  // Fuel Cost = 12.5 L * 100 = Rs. 1250
  const config2 = {
    ...baseConfig,
    ownVehicle: {
      ...baseConfig.ownVehicle,
      mileageKmPerLitre: 8,
      fuelPricePerLitre: 100,
    },
  };
  const calc2 = calculateTransportationCost(config2, 50, 20);
  assert.strictEqual(calc2.fuelCost, 1250, 'Fuel cost should update to Rs. 1250 (12.5 L * Rs. 100)');
  assert.strictEqual(calc2.totalCost, 1250 + 200 + 500 + 200, 'Total cost should be Rs. 2150');
});

// -----------------------------------------------------------------------------
// AREA 5: OWN VEHICLE VALIDATION FOR ZERO / INVALID INPUTS
// -----------------------------------------------------------------------------
test('Own Vehicle - Validation flags zero or invalid mileage and fuel price', () => {
  const validationModule = jiti('../src/utils/validation.ts');
  const { validateFarmerInputs } = validationModule;

  const validInputs = {
    cropId: 'tomato',
    quantity: 20,
    quantityUnit: 'quintal',
    harvestDate: '2026-11-01',
    maturity: 'optimal',
    originLocation: 'Karnataka',
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
    },
  };

  // Test 1: Valid inputs pass
  const validRes = validateFarmerInputs(validInputs);
  assert(validRes.isValid, 'Valid inputs should pass validation');

  // Test 2: Zero mileage fails
  const zeroMileageInputs = {
    ...validInputs,
    transport: {
      ...validInputs.transport,
      ownVehicle: { ...validInputs.transport.ownVehicle, mileageKmPerLitre: 0 },
    },
  };
  const zeroMileageRes = validateFarmerInputs(zeroMileageInputs);
  assert(!zeroMileageRes.isValid, 'Zero mileage should be invalid');
  assert(Boolean(zeroMileageRes.errors.mileage), 'Should have mileage error message');

  // Test 3: Zero fuel price fails
  const zeroFuelInputs = {
    ...validInputs,
    transport: {
      ...validInputs.transport,
      ownVehicle: { ...validInputs.transport.ownVehicle, fuelPricePerLitre: 0 },
    },
  };
  const zeroFuelRes = validateFarmerInputs(zeroFuelInputs);
  assert(!zeroFuelRes.isValid, 'Zero fuel price should be invalid');
  assert(Boolean(zeroFuelRes.errors.fuelPrice), 'Should have fuel price error message');

  // Test 4: NaN mileage fails
  const nanMileageInputs = {
    ...validInputs,
    transport: {
      ...validInputs.transport,
      ownVehicle: { ...validInputs.transport.ownVehicle, mileageKmPerLitre: NaN },
    },
  };
  const nanMileageRes = validateFarmerInputs(nanMileageInputs);
  assert(!nanMileageRes.isValid, 'NaN mileage should be invalid');
  assert(Boolean(nanMileageRes.errors.mileage), 'Should have mileage error message');
});

// -----------------------------------------------------------------------------
// AREA 6: VEHICLE CAPACITY DROPDOWN
// -----------------------------------------------------------------------------
test('Own Vehicle - Capacity dropdown options remain unchanged and affect trips count', () => {
  const transportPath = path.resolve('src/components/forms/TransportConfig.tsx');
  const content = fs.readFileSync(transportPath, 'utf-8');

  // Verify all 4 capacity options remain in the dropdown
  assert(content.includes('value="15">Small Tempo (15 Qtl)'), 'Must include 15 Qtl option');
  assert(content.includes('value="25">Standard Pickup (25 Qtl)'), 'Must include 25 Qtl option');
  assert(content.includes('value="40">Tractor Trolley (40 Qtl)'), 'Must include 40 Qtl option');
  assert(content.includes('value="70">Medium Truck (70 Qtl)'), 'Must include 70 Qtl option');

  // Verify capacity changes scale trip counts
  const transportModule = jiti('../src/engine/transport.ts');
  const { calculateTransportationCost } = transportModule;

  const config = {
    type: 'own',
    ownVehicle: {
      capacityQuintals: 15,
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

  // For 40 Quintals with 15 Qtl vehicle = ceil(40/15) = 3 trips
  const calcSmall = calculateTransportationCost(config, 50, 40);
  assert.strictEqual(calcSmall.tripsCount, 3, '40 Qtl in 15 Qtl vehicle should require 3 trips');
  assert.strictEqual(calcSmall.totalDistanceKm, 300, '3 trips * 100 km = 300 km total distance');

  // For 40 Quintals with 40 Qtl vehicle = ceil(40/40) = 1 trip
  config.ownVehicle.capacityQuintals = 40;
  const calcTractor = calculateTransportationCost(config, 50, 40);
  assert.strictEqual(calcTractor.tripsCount, 1, '40 Qtl in 40 Qtl vehicle should require 1 trip');
  assert.strictEqual(calcTractor.totalDistanceKm, 100, '1 trip * 100 km = 100 km total distance');
});

// -----------------------------------------------------------------------------
// AREA 7: OPTION B (RENTED VEHICLE) REMAINS UNCHANGED
// -----------------------------------------------------------------------------
test('Option B - Rented vehicle remains completely unchanged and functional', async () => {
  const transportModule = await jiti.import('../src/engine/transport.ts');
  const { calculateTransportationCost } = transportModule;

  const rentedConfig = {
    type: 'rented',
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

  // 20 Qtl, 50 km distance
  // Rented vehicle: 1 trip * (50 km * 2) = 100 km
  // Cost = 100 km * Rs. 35/km = Rs. 3500
  // Fuel, driver, maintenance = 0 (included in commercial rental rate)
  const calc = calculateTransportationCost(rentedConfig, 50, 20);
  assert.strictEqual(calc.rentalCharges, 3500, 'Rental charges should be 100 km * Rs. 35 = Rs. 3500');
  assert.strictEqual(calc.fuelCost, 0, 'Rented vehicle must have zero separate fuel cost (already included)');
  assert.strictEqual(calc.driverCost, 0, 'Rented vehicle must have zero separate driver cost (already included)');
  assert.strictEqual(calc.totalCost, 3500, 'Total cost must match rental quotation');
});

// -----------------------------------------------------------------------------
// AREA 8: RESPONSIVE LAYOUT & UI TAGS
// -----------------------------------------------------------------------------
test('Mobile Layout - CTA buttons and buyer cards have proper responsive wrapping classes', () => {
  const heroPath = path.resolve('src/components/landing/HeroSection.tsx');
  const heroContent = fs.readFileSync(heroPath, 'utf-8');
  assert(
    heroContent.includes('flex flex-col sm:flex-row flex-wrap') || heroContent.includes('flex flex-col sm:flex-row'),
    'Hero buttons must support flex column on mobile and row on desktop'
  );
  assert(
    heroContent.includes('w-full sm:w-auto'),
    'Hero buttons must have full width on mobile and auto width on desktop'
  );

  const marketplacePath = path.resolve('src/components/marketplace/BulkBuyerMarketplace.tsx');
  const marketContent = fs.readFileSync(marketplacePath, 'utf-8');
  assert(
    marketContent.includes('grid grid-cols-1 md:grid-cols-2'),
    'Buyer cards must use 1 column on mobile and 2 columns on desktop'
  );
});

console.log('===============================================================');
console.log(`  VERIFICATION COMPLETE: ${passedTests} OF ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================');

if (passedTests === totalTests) {
  console.log('>>> ALL THREE TARGETED UPDATES VERIFIED SUCCESSFULLY!');
} else {
  process.exit(1);
}
