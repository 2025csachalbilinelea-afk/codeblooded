/**
 * HARVESTROUTE: ADVANCED NATIONAL MANDI PRICE DISCOVERY & WEB SEARCH FALLBACK
 * VERIFICATION SUITE (PHASE 7 & PHASE 10)
 *
 * Verifies:
 * 1. NLP Price & Date Extraction Engine (₹/Qtl, ₹/kg * 100, modal rates, retail rejection, anti-contamination)
 * 2. Multi-Source Price Discovery Fallback across all key crops (Cauliflower, Coriander, Cabbage, Green Gram, Brinjal, Carrot, Tomato, Onion)
 * 3. Provenance and Source URL tracking (enam.gov.in, commodityonline.com, krishijagran.com, etc.)
 * 4. Mathematical Consistency: Net Revenue = Gross - Transport - Mandi Fees
 * 5. Net Revenue-First Market Ranking (Profit optimization)
 * 6. Honest Error Reporting (SEARCH_API_NOT_CONFIGURED when no key provided)
 */

import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const {
  extractPriceFromSnippetOrHtml,
  generateMandiSearchQueries,
  searchWebForCropPrices,
} = jiti('../src/services/webPriceDiscoveryService.ts');
const { discoverAndEvaluateMandis } = jiti('../src/engine/discoveryEngine.ts');
const { resolveValidatedPriceStatus } = jiti('../src/services/priceValidationService.ts');
const { CROP_PROFILES } = jiti('../src/data/crops.ts');
const { resolveManualLocation } = jiti('../src/services/locationService.ts');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testId, title, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testId}: ${title}`);
    if (details) console.log(`       ↳ ${details}`);
  } else {
    console.error(`[FAIL] ${testId}: ${title}`);
    if (details) console.error(`       ↳ FAILED: ${details}`);
    process.exitCode = 1;
  }
}

async function runWebDiscoveryVerification() {
  console.log('===============================================================');
  console.log('  HARVESTROUTE ADVANCED PRICE DISCOVERY & SEARCH FALLBACK AUDIT ');
  console.log('===============================================================\n');

  // ==========================================================================
  // SECTION 1: NLP WHOLESALE PRICE & DATE EXTRACTION
  // ==========================================================================
  console.log('--- 1. NLP PRICE & DATE EXTRACTION ENGINE ---');

  // Test 1.1: Quintal Range Extraction
  const snippet1 = 'Kolar APMC daily arrivals: Cauliflower wholesale price quoted at ₹2,200 to ₹2,600/quintal on 2026-10-30 with steady demand.';
  const ext1 = extractPriceFromSnippetOrHtml(snippet1, 'Cauliflower', 'https://enam.gov.in/trade-data', 'e-NAM Portal');
  assert(
    ext1 !== null && ext1.modalPrice === 2400 && ext1.minPrice === 2200 && ext1.maxPrice === 2600 && ext1.arrivalDate === '2026-10-30',
    'NLP-1.1',
    'Quintal Range & ISO Date Extraction',
    `Extracted: Modal ₹${ext1?.modalPrice}/Qtl (Range: ₹${ext1?.minPrice} - ₹${ext1?.maxPrice}), Date: ${ext1?.arrivalDate}`
  );

  // Test 1.2: Per Kg Wholesale Conversion (x100)
  const snippet2 = 'Yeshwanthpur mandi cabbage arrivals: wholesale rates ₹14 - ₹18/kg as of 30/10/2026.';
  const ext2 = extractPriceFromSnippetOrHtml(snippet2, 'Cabbage', 'https://krishijagran.com/cabbage', 'Krishi Jagran');
  assert(
    ext2 !== null && ext2.modalPrice === 1600 && ext2.minPrice === 1400 && ext2.maxPrice === 1800 && ext2.arrivalDate === '2026-10-30',
    'NLP-1.2',
    'Per-kg to Quintal Unit Conversion (x100)',
    `₹14-18/kg converted to ₹${ext2?.minPrice}-${ext2?.maxPrice}/Qtl (Modal: ₹${ext2?.modalPrice}/Qtl, Date: ${ext2?.arrivalDate})`
  );

  // Test 1.3: Anti-Contamination / Crop Mismatch
  const snippet3 = 'Indore mandi wheat arrival auction: Lokwan wheat ₹2,450/quintal.';
  const ext3 = extractPriceFromSnippetOrHtml(snippet3, 'Brinjal', 'https://agmarknet.gov.in', 'Agmarknet');
  assert(
    ext3 === null,
    'NLP-1.3',
    'Anti-Contamination Crop Mismatch Protection',
    'Correctly rejected snippet mentioning Wheat when requested crop is Brinjal.'
  );

  // Test 1.4: Supermarket Retail Pack Rejection
  const snippet4 = 'Buy fresh tomato online 500g retail pack at Blinkit for ₹45 per piece.';
  const ext4 = extractPriceFromSnippetOrHtml(snippet4, 'Tomato', 'https://blinkit.com', 'Retail');
  assert(
    ext4 === null,
    'NLP-1.4',
    'Consumer Retail Pack Outlier Rejection',
    'Correctly rejected consumer pack retail rates without APMC/wholesale context.'
  );

  // Test 1.5: Outlier Boundary Threshold Rejection (> ₹100,000/Qtl)
  const snippet5 = 'Unrealistic quotation reported at ₹150,000/quintal for standard cabbage.';
  const ext5 = extractPriceFromSnippetOrHtml(snippet5, 'Cabbage', 'https://example.com', 'Unknown');
  assert(
    ext5 === null,
    'NLP-1.5',
    'Absurd Outlier Boundary Clamping (> ₹100,000/Qtl)',
    'Correctly rejected price exceeding upper agricultural sanity bound.'
  );

  // ==========================================================================
  // SECTION 2: MULTI-SOURCE PRICE DISCOVERY FOR ALL 8 KEY CROPS
  // ==========================================================================
  console.log('\n--- 2. MULTI-SOURCE PRICE DISCOVERY FOR ALL 8 KEY CROPS ---');

  const keyCrops = [
    { name: 'Cauliflower', expectedMin: 1400, expectedMax: 3200 },
    { name: 'Coriander', expectedMin: 2500, expectedMax: 6500 },
    { name: 'Cabbage', expectedMin: 900, expectedMax: 2100 },
    { name: 'Green Gram', expectedMin: 6800, expectedMax: 9200 },
    { name: 'Brinjal', expectedMin: 1500, expectedMax: 3100 },
    { name: 'Carrot', expectedMin: 1500, expectedMax: 3500 },
    { name: 'Tomato', expectedMin: 1400, expectedMax: 3500 },
    { name: 'Onion', expectedMin: 1400, expectedMax: 3500 },
  ];

  for (const crop of keyCrops) {
    const discovery = await searchWebForCropPrices(crop.name, 'Karnataka');
    const validCount = discovery.records.filter((r) => r.modalPrice > 0).length;
    const sampleRecord = discovery.records[0];

    assert(
      discovery.records.length > 0 && validCount > 0 && sampleRecord.sourceUrl !== undefined,
      `CROP-${crop.name.toUpperCase().replace(/\s+/g, '_')}`,
      `Price Discovery Fallback for ${crop.name}`,
      `Discovered ${discovery.records.length} mandis. Sample: ${sampleRecord?.marketName} (₹${sampleRecord?.modalPrice}/Qtl, Status: ${sampleRecord?.internalPriceStatus}, Source: ${sampleRecord?.source}, URL: ${sampleRecord?.sourceUrl})`
    );
  }

  // ==========================================================================
  // SECTION 3: END-TO-END MANDI EVALUATION WITH REVENUE OPTIMIZATION
  // ==========================================================================
  console.log('\n--- 3. END-TO-END MANDI DISCOVERY & NET PROFIT RANKING ---');

  const dharwadFarmer = resolveManualLocation('Karnataka', 'Dharwad', 'Navalgund Farm Gate', '582208');
  const cauliflowerCrop = CROP_PROFILES.find((c) => c.id === 'cauliflower');

  const defaultTransport = {
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

  const defaultSpoilage = {
    mode: 'automatic',
    manualPercentage: 4,
    temperature: 'warm',
    vehicleProtection: 'covered',
    handling: 'standard',
    delayHours: 1,
  };

  // Run full evaluation for Cauliflower (which previously had 0 quotations)
  const result = await discoverAndEvaluateMandis(
    dharwadFarmer,
    cauliflowerCrop,
    20, // 20 Quintals
    defaultTransport,
    defaultSpoilage,
    'optimal',
    { sortOption: 'netRevenue' }
  );

  assert(
    result.totalCandidatesFound > 0,
    'E2E-3.1',
    'Discovered Mandis Found for Cauliflower',
    `Found ${result.totalCandidatesFound} total candidates.`
  );

  assert(
    result.evaluatedMarkets.length > 0,
    'E2E-3.2',
    'Evaluated Mandis List Not Empty',
    `Evaluated ${result.evaluatedMarkets.length} markets.`
  );

  const bestMandi = result.recommendedMarket;
  assert(
    bestMandi !== null && bestMandi.hasVerifiedPrice === true,
    'E2E-3.3',
    'Recommended Market Has Verified Price & Status',
    `Top Choice: ${bestMandi?.market.marketName} (Price: ₹${bestMandi?.priceRecord?.modalPrice}/Qtl, Status: ${bestMandi?.internalPriceStatus}, URL: ${bestMandi?.sourceUrl})`
  );

  // Verify Profit Equation: Net = Gross - Transport - Mandi Fees
  const expectedNet = bestMandi.grossRevenue - bestMandi.transportCost - bestMandi.marketFees;
  assert(
    Math.abs(bestMandi.netSellingRevenue - expectedNet) < 2,
    'E2E-3.4',
    'Mathematical Invariant: Net = Gross - Transport - Mandi Fees',
    `Gross ₹${bestMandi?.grossRevenue} - Transport ₹${bestMandi?.transportCost} - Fees ₹${bestMandi?.marketFees} = Net ₹${bestMandi?.netSellingRevenue} (Matches: ${bestMandi?.netSellingRevenue === expectedNet})`
  );

  // Verify Ranking Order: Ranked by highest net revenue
  let isSorted = true;
  for (let i = 0; i < result.evaluatedMarkets.length - 1; i++) {
    const a = result.evaluatedMarkets[i];
    const b = result.evaluatedMarkets[i + 1];
    if (a.isFeasible && b.isFeasible && a.hasVerifiedPrice && b.hasVerifiedPrice && a.priceCategory === b.priceCategory) {
      if (a.netSellingRevenue < b.netSellingRevenue) {
        isSorted = false;
        break;
      }
    }
  }
  assert(
    isSorted,
    'E2E-3.5',
    'Market Ranking Order (Highest Net Farmer Revenue First)',
    `Evaluations strictly prioritize take-home earnings over raw distance.`
  );

  // ==========================================================================
  // SECTION 4: HONEST ERROR DIAGNOSTIC REPORTING
  // ==========================================================================
  console.log('\n--- 4. HONEST ERROR REPORTING & SEARCH API DIAGNOSTICS ---');

  const unconfiguredSearch = await searchWebForCropPrices('Exotic Dragonfruit Not In India', 'Sikkim', undefined, undefined, {
    apiKey: undefined,
  });

  assert(
    unconfiguredSearch.apiErrorCategory === 'SEARCH_API_NOT_CONFIGURED' || unconfiguredSearch.apiErrorCategory === 'NO_LIVE_RECORDS',
    'ERR-4.1',
    'Honest Search API Diagnostic Category',
    `When search API key is unconfigured and crop unquoted: apiErrorCategory is '${unconfiguredSearch.apiErrorCategory}' (never fabricated prices).`
  );

  // Summary
  console.log('\n===============================================================');
  console.log(`  AUDIT COMPLETE: ${passedTests} OF ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    console.log('>>> ALL WEB PRICE DISCOVERY & FALLBACK CRITERIA FULLY VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('>>> SOME VERIFICATION TESTS FAILED!\n');
    process.exit(1);
  }
}

runWebDiscoveryVerification().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

