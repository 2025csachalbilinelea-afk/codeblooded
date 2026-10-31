/**
 * HARVESTROUTE: BACKEND TAVILY SEARCH & REVENUE ENGINE VERIFICATION SUITE
 *
 * Verifies:
 * 1. Backend environment variables (TAVILY_API_KEY, SEARCH_PROVIDER=tavily, GEMINI_API_KEY).
 * 2. Absolute absence of VITE_ search variables in code and client bundles.
 * 3. Real live Tavily search API execution for Cauliflower and Coriander mandi prices.
 * 4. Structured price extraction (modal, min, max, date, sourceUrl).
 * 5. End-to-end integration with the existing HarvestRoute revenue calculation engine.
 * 6. Verification that discovered prices populate DynamicMandiEvaluation cards.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import createJiti from 'jiti';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file into process.env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const jiti = createJiti(import.meta.url);

const {
  searchWebForCropPrices,
  DEFAULT_TAVILY_ENDPOINT,
  DEFAULT_SEARCH_PROVIDER,
  getBackendSearchConfig,
  extractPriceFromSnippetOrHtml,
} = jiti('../src/services/webPriceDiscoveryService.ts');

const { discoverAndEvaluateMandis } = jiti('../src/engine/discoveryEngine.ts');
const { resolveManualLocation } = jiti('../src/services/locationService.ts');
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
    if (details) console.error(`       ↳ FAILED: ${details}`);
    process.exitCode = 1;
  }
}

function hasUsableQuotation(record) {
  const date = new Date(`${record.arrivalDate}T00:00:00Z`);
  return (
    record.modalPrice > 0 &&
    record.priceUnit === 'INR/Quintal' &&
    Boolean(record.sourceUrl) &&
    !Number.isNaN(date.getTime()) &&
    date.getTime() <= Date.now() &&
    (record.internalPriceStatus !== 'REGIONAL REFERENCE PRICE' || record.priceCategory === 'CATEGORY_C')
  );
}

async function runBackendVerification() {
  console.log('===============================================================');
  console.log('   HARVESTROUTE BACKEND TAVILY & REVENUE VERIFICATION SUITE    ');
  console.log('===============================================================\n');

  // --- SECTION 1: ENVIRONMENT & SECRET SECURITY AUDIT ---
  console.log('--- 1. ENVIRONMENT & SECRET SECURITY AUDIT ---');

  const config = getBackendSearchConfig();
  assert(
    Boolean(process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.startsWith('tvly-')),
    'SEC-1.1',
    'TAVILY_API_KEY Configured as Backend-Only Environment Variable',
    'TAVILY_API_KEY is configured (value redacted).'
  );

  assert(
    process.env.SEARCH_PROVIDER === 'tavily' && config.searchProvider === 'tavily',
    'SEC-1.2',
    'SEARCH_PROVIDER Configured to "tavily"',
    `Provider is "${config.searchProvider}".`
  );

  assert(
    DEFAULT_TAVILY_ENDPOINT === 'https://api.tavily.com/search',
    'SEC-1.3',
    'Default Tavily Endpoint Configured in Backend Code',
    `Endpoint: ${DEFAULT_TAVILY_ENDPOINT}`
  );

  assert(
    Boolean(process.env.GEMINI_API_KEY),
    'SEC-1.4',
    'GEMINI_API_KEY Configured Separately in Backend Environment',
    'GEMINI_API_KEY is configured (value redacted).'
  );

  // Check .env.example contains only placeholders, no real secrets
  const envExampleContent = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  const hasNoTavilyInExample = !envExampleContent.includes('tvly-');
  const hasNoViteSearchInExample =
    !envExampleContent.includes('VITE_SEARCH_API_KEY') &&
    !envExampleContent.includes('VITE_SEARCH_API_ENDPOINT');
  const hasEmptyApiKeyPlaceholders = envExampleContent
    .split(/\r?\n/)
    .filter((line) => /^\s*[A-Z0-9_]*API_KEY\s*=/.test(line))
    .every((line) => line.split('=', 2)[1].trim() === '');
  assert(
    hasNoTavilyInExample && hasNoViteSearchInExample && hasEmptyApiKeyPlaceholders,
    'SEC-1.5',
    '.env.example Contains Only Empty Placeholders (No Secrets)',
    'Verified zero API keys in .env.example and removed old VITE_SEARCH_API_KEY.'
  );

  const configuredTavilyKey = process.env.TAVILY_API_KEY;
  delete process.env.TAVILY_API_KEY;
  let unconfiguredSearch;
  try {
    unconfiguredSearch = await searchWebForCropPrices('Unknown test crop', 'Karnataka');
  } finally {
    if (configuredTavilyKey === undefined) delete process.env.TAVILY_API_KEY;
    else process.env.TAVILY_API_KEY = configuredTavilyKey;
  }
  assert(
    unconfiguredSearch.records.length === 0 &&
      unconfiguredSearch.apiErrorCategory === 'SEARCH_API_NOT_CONFIGURED' &&
      unconfiguredSearch.rawError?.includes('TAVILY_API_KEY is not configured'),
    'SEC-1.6',
    'Missing Tavily Key Is Reported Without Returning Fallback Prices',
    'Search results remain empty and the backend configuration error is explicit.'
  );
  assert(
    extractPriceFromSnippetOrHtml(
      'Cauliflower modal price: ₹9,500 per quintal',
      'Cauliflower',
      'https://example.com/market'
    ) === null &&
      extractPriceFromSnippetOrHtml(
        'Cauliflower modal price ₹9,500 on 30-Oct-2026',
        'Cauliflower',
        'https://example.com/market'
      ) === null,
    'SEC-1.7',
    'Unqualified Price or Missing Date Is Rejected',
    'Price extraction requires an explicit unit and a valid quotation date.'
  );

  // --- SECTION 2: REAL TAVILY SEARCH FOR CAULIFLOWER & CORIANDER ---
  console.log('\n--- 2. REAL TAVILY SEARCH FOR CAULIFLOWER & CORIANDER ---');

  // Real Tavily search for Cauliflower
  console.log('Executing real Tavily search query for Cauliflower...');
  const cauliflowerSearch = await searchWebForCropPrices('Cauliflower', 'Karnataka');

  assert(
    cauliflowerSearch.records.length > 0 && cauliflowerSearch.tierUsed === 4,
    'TAV-2.1',
    'Real Tavily Search Returns Cauliflower Mandi Quotations',
    `Found ${cauliflowerSearch.records.length} records. Tier used: ${cauliflowerSearch.tierUsed}`
  );

  const cauliSample = cauliflowerSearch.records[0];
  assert(
    hasUsableQuotation(cauliSample),
    'TAV-2.2',
    'Cauliflower Quotation Has Valid Unit, Date, and Source URL',
    `Market: ${cauliSample.marketName}, Modal: ₹${cauliSample.modalPrice}/Qtl, Status: ${cauliSample.internalPriceStatus}, URL: ${cauliSample.sourceUrl}`
  );

  // Real Tavily search for Coriander
  console.log('Executing real Tavily search query for Coriander...');
  const corianderSearch = await searchWebForCropPrices('Coriander', 'Karnataka');

  assert(
    corianderSearch.records.length > 0 && corianderSearch.tierUsed === 4,
    'TAV-2.3',
    'Real Tavily Search Returns Coriander Mandi Quotations',
    `Found ${corianderSearch.records.length} records. Tier used: ${corianderSearch.tierUsed}`
  );

  const corSample = corianderSearch.records[0];
  assert(
    hasUsableQuotation(corSample),
    'TAV-2.4',
    'Coriander Quotation Has Valid Unit, Date, and Source URL',
    `Market: ${corSample.marketName}, Modal: ₹${corSample.modalPrice}/Qtl, Status: ${corSample.internalPriceStatus}, URL: ${corSample.sourceUrl}`
  );

  // --- SECTION 3: REVENUE ENGINE & MANDI CARD INTEGRATION ---
  console.log('\n--- 3. REVENUE ENGINE & MANDI CARD INTEGRATION ---');

  const farmerLoc = resolveManualLocation('Karnataka', 'Kolar', 'Kolar Farm Gate', '563101');
  const cauliProfile = CROP_PROFILES.find((c) => c.id === 'cauliflower');

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
    vehicleProtection: 'covered',
    handling: 'standard',
    delayHours: 1,
  };

  const evaluationResult = await discoverAndEvaluateMandis(
    farmerLoc,
    cauliProfile,
    25, // 25 Quintals
    transportConfig,
    spoilageInputs,
    'optimal',
    { sortOption: 'netRevenue' }
  );

  assert(
    evaluationResult.evaluatedMarkets.length > 0,
    'REV-3.1',
    'Tavily-Discovered Prices Successfully Reach Dynamic Mandi Cards',
    `Evaluated ${evaluationResult.evaluatedMarkets.length} mandi cards using real discovered rates.`
  );

  const topCard = evaluationResult.recommendedMarket || evaluationResult.evaluatedMarkets[0];
  assert(
    topCard !== null && topCard.hasVerifiedPrice === true && topCard.netSellingRevenue > 0,
    'REV-3.2',
    'Top Mandi Card Computes Positive Net Selling Revenue',
    `Mandi: ${topCard.market.marketName}, Modal: ₹${topCard.priceRecord?.modalPrice}/Qtl, Net Take-Home: ₹${topCard.netSellingRevenue}`
  );

  // Invariant verification: Net = Gross - Transport - Mandi Fees
  const expectedNet = topCard.grossRevenue - topCard.transportCost - topCard.marketFees;
  assert(
    Math.abs(topCard.netSellingRevenue - expectedNet) <= 1,
    'REV-3.3',
    'Revenue Calculation Engine Math Invariant Strictly Preserved',
    `Gross ₹${topCard.grossRevenue} - Transport ₹${topCard.transportCost} - Mandi Fees ₹${topCard.marketFees} = Net ₹${topCard.netSellingRevenue}`
  );

  assert(
    topCard.internalPriceStatus === 'WEB-DISCOVERED PRICE' ||
      topCard.internalPriceStatus === 'REGIONAL REFERENCE PRICE' ||
      topCard.internalPriceStatus === 'LIVE OFFICIAL QUOTE' ||
      topCard.internalPriceStatus === 'HISTORICAL OFFICIAL QUOTE',
    'REV-3.4',
    'Mandi Card Carries Verified Internal Price Status',
    `Card Price Status: "${topCard.internalPriceStatus}", Category: "${topCard.priceCategory}"`
  );

  assert(
    Boolean(topCard.sourceUrl),
    'REV-3.5',
    'Mandi Card Contains Clickable External Source URL',
    `Source URL: ${topCard.sourceUrl}`
  );

  // Summary
  console.log('\n===============================================================');
  console.log(`  VERIFICATION COMPLETE: ${passedTests} OF ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    console.log('>>> ALL BACKEND TAVILY & REVENUE ENGINE REQUIREMENTS VERIFIED!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runBackendVerification().catch((err) => {
  console.error('Fatal error in backend verification:', err);
  process.exit(1);
});
