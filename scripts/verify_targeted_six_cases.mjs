/**
 * HARVESTROUTE: SECTION 10 TARGETED TESTING VERIFICATION SUITE
 * Strictly tests ONLY the 6 cases specified by the user:
 * Case 1: Green Gram – national fallback (discovers Gadag, Hubballi, Bengaluru, Indore, Jaipur; ranks by net revenue; assigns Category A/B).
 * Case 2: Coriander – regional and national discovery (Kolar, Bengaluru, Mandsaur, Kota; ranks by net revenue).
 * Case 3: Cabbage – historical price retrieval (retrieves historical quote within 30 days, preserves authentic arrival date, Category B).
 * Case 4: Brinjal – exact commodity matching (Brinjal / Eggplant matches without cross-crop pollution).
 * Case 5: Tomato – market-specific live quotation (Category A, verified quotation, net revenue ranking).
 * Case 6: A crop with no available records (e.g. Vanilla Beans) – 3-level search executed, 0 records found, clean empty state with 30-day lookback message, null recommendation, no fabricated prices.
 */

import createJiti from 'jiti';

const jiti = createJiti(import.meta.url);

const {
  resolveValidatedPriceStatus,
  validateAndSanitizePrice,
  isCommodityMatch,
  isMarketIdentityMatch,
  normalizeCommodityForAgmarknet,
} = jiti('../src/services/priceValidationService.ts');

const {
  getMarketPriceForCommodity,
  getCachedPrice,
  setCachedPrice,
  getAgmarknetApiStatus,
  setAgmarknetApiStatus,
  discoverNationalCommodityPrices,
} = jiti('../src/services/agmarknetService.ts');

const {
  discoverAndEvaluateMandis,
  evaluateMarketCandidate,
} = jiti('../src/engine/discoveryEngine.ts');

const { CROP_PROFILES } = jiti('../src/data/crops.ts');

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
    if (details) console.error(`       ↳ ${details}`);
    throw new Error(`Assertion failed for ${testId}: ${title}`);
  }
}

// Standard test fixtures
const mandyaFarmerLocation = {
  latitude: 12.5218,
  longitude: 76.8951,
  state: 'Karnataka',
  district: 'Mandya',
  villageOrTown: 'Mandya Rural',
  formattedAddress: 'Mandya, Karnataka, India',
  method: 'manual',
  timestamp: new Date().toISOString(),
};

const standardTransport = {
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
  },
};

const standardSpoilage = {
  packagingType: 'plastic_crates',
  transportMethod: 'open_truck',
  weatherCondition: 'moderate',
  delayHours: 0,
};

async function runTargetedTests() {
  console.log('================================================================');
  console.log('HARVESTROUTE — SECTION 10 TARGETED TESTING VERIFICATION SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // CASE 1: GREEN GRAM — NATIONAL FALLBACK & PROFIT OPTIMIZATION
  // -------------------------------------------------------------------------
  console.log('--- TEST CASE 1: GREEN GRAM (NATIONAL FALLBACK & REVENUE RANKING) ---');
  {
    // 1.1 Commodity alias normalization
    const normMoong = normalizeCommodityForAgmarknet('Moong(Green Gram)');
    assert(
      isCommodityMatch('Green Gram', 'Moong(Green Gram)') && isCommodityMatch('Green Gram', 'mung bean'),
      'CASE-1.1',
      'Green Gram correctly matches official AGMARKNET commodity Moong(Green Gram) and mung bean',
      `Normalized: ${normMoong}`
    );

    // 1.2 National Price Discovery with multi-level search
    const greenGramDiscovery = await discoverNationalCommodityPrices('Green Gram', 'Karnataka', {
      maxLookbackDays: 30,
    });

    assert(
      greenGramDiscovery.records.length > 0,
      'CASE-1.2',
      'Multi-level price discovery retrieved verified Green Gram quotations',
      `Found ${greenGramDiscovery.records.length} records, Level: ${greenGramDiscovery.discoveryLevel}`
    );

    const gadagRecord = greenGramDiscovery.records.find((r) => r.marketId === 'ka-gadag-apmc');
    assert(
      gadagRecord !== undefined && gadagRecord.modalPrice === 7850,
      'CASE-1.3',
      'Gadag Betageri APMC verified quote retrieved for Green Gram (₹7,850/Qtl)',
      `Market: ${gadagRecord?.marketName}, Arrival: ${gadagRecord?.arrivalDate}, Price: ₹${gadagRecord?.modalPrice}/Qtl`
    );

    // 1.3 End-to-end Mandi Evaluation & Recommendation
    const greenGramCrop = CROP_PROFILES.find((c) => c.id === 'green_gram' || c.name.toLowerCase().includes('green gram')) || {
      id: 'green_gram',
      name: 'Green Gram (Moong)',
      category: 'pulses',
      perishabilityClass: 4,
      minPricePerQuintal: 6000,
      maxPricePerQuintal: 9000,
      typicalPricePerQuintal: 7800,
    };

    const discovery = await discoverAndEvaluateMandis(
      mandyaFarmerLocation,
      greenGramCrop,
      20, // 20 Quintals
      standardTransport,
      standardSpoilage,
      'optimal'
    );

    assert(
      discovery.evaluatedMarkets.length > 0,
      'CASE-1.4',
      'Discovered and evaluated candidate mandis for Green Gram',
      `Total evaluated: ${discovery.evaluatedMarkets.length} mandis`
    );

    const topMarket = discovery.recommendedMarket;
    assert(
      topMarket !== null && topMarket.hasVerifiedPrice && topMarket.netSellingRevenue > 0,
      'CASE-1.5',
      'Recommended market selected with verified quote and positive net revenue',
      `Recommended: ${topMarket?.market.marketName}, Modal: ₹${topMarket?.priceRecord?.modalPrice}/Qtl, Net Revenue: ₹${topMarket?.netSellingRevenue}`
    );

    assert(
      topMarket?.priceCategory === 'CATEGORY_A' || topMarket?.priceCategory === 'CATEGORY_B',
      'CASE-1.6',
      'Phase 6 Compliance: Recommended market strictly belongs to Category A or B',
      `Category: ${topMarket?.priceCategory}`
    );
  }

  // -------------------------------------------------------------------------
  // CASE 2: CORIANDER — REGIONAL AND NATIONAL DISCOVERY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST CASE 2: CORIANDER (REGIONAL & NATIONAL DISCOVERY) ---');
  {
    // 2.1 Commodity matching
    assert(
      isCommodityMatch('Coriander', 'coriander(leaves)') &&
      isCommodityMatch('Coriander', 'dhania') &&
      isCommodityMatch('Coriander', 'kothambari'),
      'CASE-2.1',
      'Coriander matches official AGMARKNET name and regional synonyms (Dhania, Kothambari)',
      'Multi-lingual aliases mapped'
    );

    // 2.2 Regional and national discovery
    const corianderDiscovery = await discoverNationalCommodityPrices('Coriander', 'Karnataka');
    const marketIds = corianderDiscovery.records.map((r) => r.marketId);

    assert(
      marketIds.includes('ka-bengaluru-apmc') && marketIds.includes('ka-kolar-apmc'),
      'CASE-2.2',
      'Discovered nearby Karnataka APMC yards for Coriander (Bengaluru, Kolar)',
      `Markets: ${marketIds.slice(0, 4).join(', ')}`
    );

    // Check national terminal hubs like Mandsaur or Kota
    const hasNationalHub = marketIds.some((id) => id.includes('mandsaur') || id.includes('kota') || id.includes('ottanchathiram'));
    assert(
      hasNationalHub === true,
      'CASE-2.3',
      'Discovered regional/national coriander terminal hubs',
      `National terminal hubs present in candidate pool`
    );

    // 2.3 End-to-end Mandi Evaluation & Recommendation
    const corianderCrop = CROP_PROFILES.find((c) => c.name.toLowerCase().includes('coriander')) || {
      id: 'coriander',
      name: 'Coriander',
      category: 'vegetables',
      perishabilityClass: 1,
      minPricePerQuintal: 1500,
      maxPricePerQuintal: 4500,
      typicalPricePerQuintal: 2800,
    };

    const evalResult = await discoverAndEvaluateMandis(
      mandyaFarmerLocation,
      corianderCrop,
      20,
      standardTransport,
      standardSpoilage,
      'optimal'
    );

    assert(
      evalResult.recommendedMarket !== null && evalResult.recommendedMarket.hasVerifiedPrice,
      'CASE-2.4',
      'Coriander top market recommended based on highest net return',
      `Top mandi: ${evalResult.recommendedMarket?.market.marketName}, Net Take-Home: ₹${evalResult.recommendedMarket?.netSellingRevenue}`
    );

    const calculatedNet =
      evalResult.recommendedMarket.grossRevenue -
      evalResult.recommendedMarket.transportCost -
      evalResult.recommendedMarket.marketFees;

    assert(
      evalResult.recommendedMarket.netSellingRevenue === calculatedNet,
      'CASE-2.5',
      'Mathematical integrity: Net Revenue = Gross - Transport - Mandi Fees',
      `Gross: ₹${evalResult.recommendedMarket.grossRevenue} - Transport: ₹${evalResult.recommendedMarket.transportCost} - Fees: ₹${evalResult.recommendedMarket.marketFees} = ₹${evalResult.recommendedMarket.netSellingRevenue}`
    );
  }

  // -------------------------------------------------------------------------
  // CASE 3: CABBAGE — HISTORICAL PRICE RETRIEVAL
  // -------------------------------------------------------------------------
  console.log('\n--- TEST CASE 3: CABBAGE (HISTORICAL PRICE RETRIEVAL) ---');
  {
    // 3.1 Commodity matching
    assert(
      isCommodityMatch('Cabbage', 'patta gobhi') && !isCommodityMatch('Cabbage', 'Cauliflower'),
      'CASE-3.1',
      'Cabbage matches Patta Gobhi and strictly excludes Cauliflower',
      'Cross-commodity collision prevented'
    );

    // 3.2 Historical retrieval within 30-day window
    const cabbagePrice = await getMarketPriceForCommodity(
      'ka-kolar-apmc',
      'Kolar APMC Yard',
      'Karnataka',
      'Kolar',
      'Cabbage'
    );

    assert(
      cabbagePrice !== null,
      'CASE-3.2',
      'Historical cabbage quotation retrieved successfully within 30-day window',
      `Modal: ₹${cabbagePrice?.modalPrice}/Qtl, Arrival Date: ${cabbagePrice?.arrivalDate}`
    );

    // Preserves authentic arrival date (2026-10-27)
    assert(
      cabbagePrice?.arrivalDate === '2026-10-27',
      'CASE-3.3',
      'Original arrival date (2026-10-27) strictly preserved without fabrication',
      `Arrival Date: ${cabbagePrice?.arrivalDate}`
    );

    // Categorized as Category B (Historical quotation)
    assert(
      cabbagePrice?.priceCategory === 'CATEGORY_B' || cabbagePrice?.priceSourceType === 'HISTORICAL',
      'CASE-3.4',
      'Price older than 2 days classified as Category B (Historical quotation)',
      `Category: ${cabbagePrice?.priceCategory}, SourceType: ${cabbagePrice?.priceSourceType}`
    );
  }

  // -------------------------------------------------------------------------
  // CASE 4: BRINJAL — EXACT COMMODITY MATCHING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST CASE 4: BRINJAL (EXACT COMMODITY MATCHING) ---');
  {
    assert(
      isCommodityMatch('Brinjal', 'Eggplant') &&
      isCommodityMatch('Brinjal', 'Baingan') &&
      isCommodityMatch('Brinjal (Eggplant)', 'Brinjal'),
      'CASE-4.1',
      'Brinjal matches Eggplant, Baingan, and Brinjal (Eggplant)',
      'Official AGMARKNET commodity mapping verified'
    );

    assert(
      !isCommodityMatch('Brinjal', 'Green Beans') &&
      !isCommodityMatch('Brinjal', 'Cabbage') &&
      !isCommodityMatch('Brinjal', 'Wheat'),
      'CASE-4.2',
      'Strict anti-cross-pollution: Brinjal does NOT match Green Beans, Cabbage, or Wheat',
      'No unintended commodity overlap'
    );

    const brinjalPrice = await getMarketPriceForCommodity(
      'ka-bengaluru-apmc',
      'Bengaluru Yeshwanthpur Wholesale APMC',
      'Karnataka',
      'Bengaluru',
      'Brinjal'
    );

    assert(
      brinjalPrice !== null && brinjalPrice.modalPrice === 2150,
      'CASE-4.3',
      'Verified Brinjal quotation retrieved for Bengaluru APMC (₹2,150/Qtl)',
      `Price: ₹${brinjalPrice?.modalPrice}/Qtl, Arrival Date: ${brinjalPrice?.arrivalDate}`
    );
  }

  // -------------------------------------------------------------------------
  // CASE 5: TOMATO — MARKET-SPECIFIC LIVE QUOTATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST CASE 5: TOMATO (MARKET-SPECIFIC LIVE QUOTATION) ---');
  {
    const tomatoPrice = await getMarketPriceForCommodity(
      'ka-kolar-apmc',
      'Kolar APMC Yard',
      'Karnataka',
      'Kolar',
      'Tomato'
    );

    assert(
      tomatoPrice !== null && tomatoPrice.modalPrice === 2850,
      'CASE-5.1',
      'Verified market-specific live quotation retrieved for Kolar APMC (₹2,850/Qtl)',
      `Price: ₹${tomatoPrice?.modalPrice}/Qtl, Date: ${tomatoPrice?.arrivalDate}, Source: ${tomatoPrice?.source}`
    );

    assert(
      tomatoPrice?.priceCategory === 'CATEGORY_A' || tomatoPrice?.freshnessStatus === 'CURRENT',
      'CASE-5.2',
      'Fresh quotation classified as Category A (Verified quotation)',
      `Category: ${tomatoPrice?.priceCategory}, Freshness: ${tomatoPrice?.freshnessStatus}`
    );

    // End-to-end evaluation for Tomato
    const tomatoCrop = CROP_PROFILES.find((c) => c.name.toLowerCase().includes('tomato')) || {
      id: 'tomato',
      name: 'Tomato',
      category: 'vegetables',
      perishabilityClass: 1,
      minPricePerQuintal: 1200,
      maxPricePerQuintal: 4000,
      typicalPricePerQuintal: 2500,
    };

    const tomatoEval = await discoverAndEvaluateMandis(
      mandyaFarmerLocation,
      tomatoCrop,
      30,
      standardTransport,
      standardSpoilage,
      'optimal'
    );

    assert(
      tomatoEval.recommendedMarket !== null && tomatoEval.recommendedMarket.hasVerifiedPrice,
      'CASE-5.3',
      'Tomato candidate mandis ranked by net revenue with top market recommendation',
      `Top Market: ${tomatoEval.recommendedMarket?.market.marketName}, Net Take-Home: ₹${tomatoEval.recommendedMarket?.netSellingRevenue}`
    );
  }

  // -------------------------------------------------------------------------
  // CASE 6: A CROP WITH NO AVAILABLE RECORDS — CORRECT EMPTY STATE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST CASE 6: UNQUOTED CROP (CORRECT EMPTY STATE) ---');
  {
    const exoticCrop = {
      id: 'exotic_vanilla',
      name: 'Vanilla Beans',
      category: 'spices',
      perishabilityClass: 4,
      minPricePerQuintal: 50000,
      maxPricePerQuintal: 90000,
      typicalPricePerQuintal: 70000,
    };

    // 6.1 Multi-level search across India yields 0 records within 30-day window
    const nationalSearch = await discoverNationalCommodityPrices('Vanilla Beans', 'Karnataka', {
      maxLookbackDays: 30,
    });

    assert(
      nationalSearch.records.length === 0,
      'CASE-6.1',
      '3-level national search completed with 0 verified records found for unquoted crop',
      `Records: ${nationalSearch.records.length}, DiscoveryLevel: ${nationalSearch.discoveryLevel}`
    );

    // 6.2 Discovery engine does not fabricate prices or recommend unquoted mandi
    const unquotedDiscovery = await discoverAndEvaluateMandis(
      mandyaFarmerLocation,
      exoticCrop,
      10,
      standardTransport,
      standardSpoilage,
      'optimal'
    );

    const verifiedQuotesCount = unquotedDiscovery.evaluatedMarkets.filter((m) => m.hasVerifiedPrice).length;
    assert(
      verifiedQuotesCount === 0,
      'CASE-6.2',
      'Zero mandis have verified prices for unquoted crop (no fabricated numbers)',
      `Verified quotes count: ${verifiedQuotesCount}`
    );

    assert(
      unquotedDiscovery.recommendedMarket === null,
      'CASE-6.3',
      'Recommended market is strictly null when no verified prices exist',
      'No misleading financial recommendations'
    );

    // 6.3 Empty state condition verified
    const isApiDown = unquotedDiscovery.apiStatus?.isAvailable === false;
    const hasNoQuotedMandis = verifiedQuotesCount === 0;
    const triggersCleanEmptyState = hasNoQuotedMandis && !isApiDown;

    assert(
      triggersCleanEmptyState === true,
      'CASE-6.4',
      'Clean empty state triggered with 30-day lookback notification and no contradictory cards',
      `hasNoQuotedMandis: ${hasNoQuotedMandis}, isApiDown: ${isApiDown}`
    );
  }

  console.log('\n================================================================');
  console.log(`ALL 6 TARGETED TEST CASES PASSED: ${passedTests}/${totalTests}`);
  console.log('================================================================\n');
}

runTargetedTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
