/**
 * HARVESTROUTE PHASE 5: CENTRALIZED PRICE VALIDATION & STATUS RESOLUTION SERVICE
 * Single source of truth for agricultural market price validation, status badge resolution,
 * freshness classification, commodity alias normalization, and invariant enforcement.
 *
 * ABSOLUTE INVARIANTS:
 * 1. A numerical price (e.g. ₹2,950/Qtl) must NEVER be displayed alongside an UNAVAILABLE badge.
 * 2. An UNAVAILABLE badge must NEVER appear when a valid, verified price exists.
 * 3. When price is unavailable, modalPrice is strictly 0 and display is 'Price Unavailable'.
 * 4. Feasibility and net revenue calculations are permitted ONLY when a verified price is present.
 * 5. Historical prices must be clearly identified with HISTORICAL status, not current prices.
 */

import {
  ConfidenceIndicator,
  MarketPriceRecord,
  PriceCategory,
  InternalPriceStatus,
  PriceFreshnessStatus,
  PriceSourceType,
} from '../types/marketDiscovery';

// ============================================================================
// 1. COMMODITY NOMENCLATURE & MULTI-LINGUAL ALIAS NORMALIZATION
// ============================================================================

export const COMMODITY_ALIASES: Record<string, string[]> = {
  Tomato: ['tomato', 'tamatar', 'tomatoes', 'solanum lycopersicum'],
  Onion: ['onion', 'pyaz', 'pyaj', 'kanda', 'onions', 'allium cepa'],
  Potato: ['potato', 'aloo', 'alu', 'batata', 'potatoes', 'solanum tuberosum'],
  Brinjal: ['brinjal', 'eggplant', 'baingan', 'aubergine', 'vangi', 'solanum melongena', 'brinjal (eggplant)'],
  Coriander: ['coriander', 'coriander(leaves)', 'coriander leaves', 'dhania', 'dhaniya', 'kothmir', 'kothambari', 'cilantro'],
  Cabbage: ['cabbage', 'patta gobhi', 'bandha gobhi', 'gobhi patta', 'band gobhi', 'cabbages'],
  Cauliflower: ['cauliflower', 'phool gobhi', 'flower cauliflower', 'gobhi phool', 'phool gobi', 'gobi', 'cauliflowers'],
  Spinach: ['spinach', 'palak', 'spinach (palak)', 'spinacia oleracea'],
  'Green Beans': ['green beans', 'beans', 'french beans', 'cluster beans', 'haricot beans'],
  Carrot: ['carrot', 'gajar', 'carrots'],
  Cucumber: ['cucumber', 'kheera', 'kakdi', 'cucumbers'],
  Pumpkin: ['pumpkin', 'kaddu', 'pumpkins'],
  Mango: ['mango', 'aam', 'alphonso', 'kesar', 'mango (alphonso / kesar)'],
  Banana: ['banana', 'kela', 'robusta', 'banana (g9 / robusta)'],
  Apple: ['apple', 'seb', 'apples'],
  Orange: ['orange', 'orange / citrus', 'mosambi', 'santre', 'citrus', 'sweet orange'],
  Grapes: ['grapes', 'angoor', 'grapes (table varieties)'],
  Guava: ['guava', 'amrood', 'guavas'],
  Papaya: ['papaya', 'papita', 'papayas'],
  Watermelon: ['watermelon', 'water melon', 'tarbooj', 'kalingad'],
  Pomegranate: ['pomegranate', 'anar', 'dalimb', 'bhagwa', 'pomegranate (bhagwa)'],
  'Paddy(Dhan)': ['paddy', 'dhan', 'paddy(dhan)', 'unhusked rice', 'oryza sativa'],
  Rice: ['rice', 'chawal', 'milled rice', 'basmati rice', 'rice (paddy / milled)'],
  Wheat: ['wheat', 'gehun', 'gehu', 'wheat (sharbati / lokwan)', 'sharbati', 'lokwan'],
  Maize: ['maize', 'corn', 'makka', 'makai', 'maize (corn)'],
  Chickpea: ['chickpea', 'chana', 'bengal gram', 'gram raw', 'chhana', 'chickpea (chana / bengal gram)', 'gram raw(chhana)'],
  'Pigeon Pea': ['pigeon pea', 'tur', 'arhar', 'red gram', 'toor', 'pigeon pea (tur / arhar)', 'arhar (tur/red gram)(whole)'],
  'Moong(Green Gram)': ['green gram', 'moong', 'mung', 'mung bean', 'green gram (moong)', 'vigna radiata'],
  'Dry Beans': ['dry beans', 'rajma', 'cowpea', 'lobia', 'dry beans (rajma / cowpea)'],
  'Chilli Red': ['chilli', 'chilly', 'pepper', 'mirchi', 'red chilli', 'dry chilli', 'chilli (dry red chilli)'],
  Turmeric: ['turmeric', 'haldi', 'turmeric (dry rhizome)'],
  Ginger: ['ginger', 'adrak', 'fresh ginger', 'ginger (fresh rhizome)'],
  Cotton: ['cotton', 'kapas', 'raw cotton', 'gossypium'],
  Soyabean: ['soyabean', 'soybean', 'soya', 'glycine max'],
  Mustard: ['mustard', 'sarson', 'rai', 'brassica'],
  Garlic: ['garlic', 'lahsun', 'lasun', 'allium sativum'],
};

/**
 * Standardizes any crop name or dialect string into official AGMARKNET nomenclature.
 */
export function normalizeCommodityForAgmarknet(cropInput: string): string {
  if (!cropInput) return '';
  const clean = cropInput.toLowerCase().trim().replace(/[-_]/g, ' ');

  for (const [canonical, aliases] of Object.entries(COMMODITY_ALIASES)) {
    for (const alias of aliases) {
      if (clean === alias || clean.startsWith(alias) || clean.includes(alias)) {
        return canonical;
      }
    }
  }

  // Fallback: capitalize words
  return cropInput.charAt(0).toUpperCase() + cropInput.slice(1);
}

/**
 * Verifies whether two commodity strings refer to the same agricultural produce.
 * Strictly prevents cross-crop pollution (e.g. Beans matching Soyabean or Wheat matching Coriander).
 */
export function isCommodityMatch(cropA: string, cropB: string): boolean {
  if (!cropA || !cropB) return false;
  const normA = normalizeCommodityForAgmarknet(cropA).toLowerCase();
  const normB = normalizeCommodityForAgmarknet(cropB).toLowerCase();

  if (normA === normB) return true;

  // Cross-match for Paddy / Rice queries
  const isRiceA = normA.includes('rice') || normA.includes('paddy') || normA.includes('dhan');
  const isRiceB = normB.includes('rice') || normB.includes('paddy') || normB.includes('dhan');
  if (isRiceA && isRiceB) return true;

  // Cross-match for Chilli Red
  if (normA.includes('chilli') && normB.includes('chilli')) return true;

  // Cross-match for Coriander
  if (normA.includes('coriander') && normB.includes('coriander')) return true;

  // Cross-match for Cabbage
  if (normA.includes('cabbage') && normB.includes('cabbage')) return true;

  // Cross-match for Cauliflower
  if (
    (normA.includes('cauliflower') || normA.includes('phool gobhi') || normA.includes('flower cauliflower')) &&
    (normB.includes('cauliflower') || normB.includes('phool gobhi') || normB.includes('flower cauliflower'))
  ) {
    return true;
  }

  // Cross-match for Brinjal
  if (
    (normA.includes('brinjal') || normA.includes('eggplant') || normA.includes('baingan')) &&
    (normB.includes('brinjal') || normB.includes('eggplant') || normB.includes('baingan'))
  ) {
    return true;
  }

  // Cross-match for Chickpea / Gram / Chana
  const isGramA = normA.includes('gram') || normA.includes('chana') || normA.includes('chickpea');
  const isGramB = normB.includes('gram') || normB.includes('chana') || normB.includes('chickpea');
  if (isGramA && isGramB && !normA.includes('green gram') && !normB.includes('green gram')) return true;

  // Cross-match for Moong / Green Gram
  const isMoongA = normA.includes('moong') || normA.includes('green gram');
  const isMoongB = normB.includes('moong') || normB.includes('green gram');
  if (isMoongA && isMoongB) return true;

  // Cross-match for Pigeon Pea / Tur / Arhar
  const isTurA = normA.includes('tur') || normA.includes('arhar') || normA.includes('pigeon pea');
  const isTurB = normB.includes('tur') || normB.includes('arhar') || normB.includes('pigeon pea');
  if (isTurA && isTurB) return true;

  return false;
}

// ============================================================================
// 2. APMC IDENTITY MATCHING (ANTI-CROSS POLLUTION)
// ============================================================================

export function isMarketIdentityMatch(
  recordMarketId: string,
  recordMarketName: string,
  recordDistrict: string,
  recordState: string,
  targetMarketId: string,
  targetMarketName: string,
  targetDistrict: string,
  targetState: string
): boolean {
  // Primary check: Direct canonical ID match
  if (recordMarketId && targetMarketId) {
    if (recordMarketId.trim().toLowerCase() === targetMarketId.trim().toLowerCase()) {
      return true;
    }
  }

  // State verification: Reject cross-state matches
  if (recordState && targetState) {
    if (recordState.trim().toLowerCase() !== targetState.trim().toLowerCase()) {
      return false;
    }
  }

  // District verification
  const isSameDistrict = Boolean(
    recordDistrict &&
      targetDistrict &&
      recordDistrict.trim().toLowerCase() === targetDistrict.trim().toLowerCase()
  );

  // Normalized name string comparison
  const cleanRecord = recordMarketName
    .toLowerCase()
    .replace(/apmc|yard|market|terminal|wholesale|\(.*\)/g, '')
    .trim();
  const cleanTarget = targetMarketName
    .toLowerCase()
    .replace(/apmc|yard|market|terminal|wholesale|\(.*\)/g, '')
    .trim();

  if (cleanRecord.length >= 3 && cleanTarget.length >= 3) {
    if (cleanRecord === cleanTarget) return true;
    if (cleanRecord.includes(cleanTarget) || cleanTarget.includes(cleanRecord)) return true;
    if (isSameDistrict) {
      const recordFirst = cleanRecord.split(' ')[0];
      const targetFirst = cleanTarget.split(' ')[0];
      if (recordFirst.length >= 3 && recordFirst === targetFirst) return true;
    }
  }

  return false;
}

// ============================================================================
// 3. PRICE RANGE SANITY & DATA CLEANSING
// ============================================================================

export interface PriceSanityResult {
  isValid: boolean;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  error?: string;
}

export function validateAndSanitizePrice(rawRecord: {
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  modalPrice?: number | string | null;
}): PriceSanityResult {
  let min = typeof rawRecord.minPrice === 'string' ? parseFloat(rawRecord.minPrice) : (rawRecord.minPrice ?? 0);
  let max = typeof rawRecord.maxPrice === 'string' ? parseFloat(rawRecord.maxPrice) : (rawRecord.maxPrice ?? 0);
  let modal = typeof rawRecord.modalPrice === 'string' ? parseFloat(rawRecord.modalPrice) : (rawRecord.modalPrice ?? 0);

  min = isNaN(min) ? 0 : Math.round(min);
  max = isNaN(max) ? 0 : Math.round(max);
  modal = isNaN(modal) ? 0 : Math.round(modal);

  // Swap if inverted
  if (min > 0 && max > 0 && min > max) {
    const temp = min;
    min = max;
    max = temp;
  }

  // Derive modal price if missing but range exists
  if (modal <= 0 && min > 0 && max > 0) {
    modal = Math.round((min + max) / 2);
  }

  // Sanity lower bound: must be positive
  if (modal <= 0) {
    return {
      isValid: false,
      modalPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      error: 'Quoted modal price is zero or negative.',
    };
  }

  // Sanity upper bound: reject extreme outliers > ₹100,000 / Quintal
  if (modal > 100000) {
    return {
      isValid: false,
      modalPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      error: `Quoted modal price (₹${modal}/Qtl) exceeds upper sanity threshold of ₹100,000/Qtl.`,
    };
  }

  // Populate missing bounds proportionally
  if (min <= 0) min = Math.round(modal * 0.9);
  if (max <= 0) max = Math.round(modal * 1.1);

  // Clamp boundaries to enforce minPrice <= modalPrice <= maxPrice
  if (modal < min) min = modal;
  if (modal > max) max = modal;

  return {
    isValid: true,
    modalPrice: modal,
    minPrice: min,
    maxPrice: max,
  };
}

// ============================================================================
// 4. PRICE FRESHNESS CLASSIFICATION
// ============================================================================

export function evaluatePriceFreshness(
  arrivalDateStr?: string,
  referenceDate: Date = new Date()
): PriceFreshnessStatus {
  if (!arrivalDateStr || arrivalDateStr === 'N/A') return 'UNAVAILABLE';

  let arrivalDate: Date;
  if (arrivalDateStr.includes('/')) {
    const parts = arrivalDateStr.split('/');
    if (parts.length === 3) {
      arrivalDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      arrivalDate = new Date(arrivalDateStr);
    }
  } else {
    arrivalDate = new Date(arrivalDateStr);
  }

  if (isNaN(arrivalDate.getTime())) return 'UNAVAILABLE';

  const diffMs = referenceDate.getTime() - arrivalDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) return 'CURRENT';
  if (diffDays <= 7) return 'RECENT';
  return 'STALE';
}

// ============================================================================
// 5. CENTRALIZED SINGLE SOURCE OF TRUTH: RESOLVE VALIDATED PRICE STATUS
// ============================================================================

export interface PriceValidationInput {
  record?: Partial<MarketPriceRecord> | null;
  requestedCommodity?: string;
  targetMarketId?: string;
  targetMarketName?: string;
  targetDistrict?: string;
  targetState?: string;
  isLiveApiResult?: boolean;
  isDemoBenchmark?: boolean;
}

export interface ValidatedPriceStatus {
  isValid: boolean;
  hasVerifiedPrice: boolean;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  priceSourceType: PriceSourceType;
  priceCategory: PriceCategory;
  internalPriceStatus: InternalPriceStatus;
  freshnessStatus: PriceFreshnessStatus;
  arrivalDate: string;
  displayPriceText: string;
  source: string;
  sourceUrl?: string;
  confidenceIndicator: ConfidenceIndicator;
  attributedMarketName?: string;
  attributedDistanceKm?: number;
  fallbackTier?: 1 | 2 | 3 | 4 | 5;
  rejectionReason?: string;
  sanitizedRecord: MarketPriceRecord | null;
}

/**
 * Centralized Single Source of Truth for agricultural price validation & status resolution.
 * Guarantees mathematical consistency:
 * - Valid price (> 0) NEVER has status 'UNAVAILABLE'.
 * - Missing/invalid price ALWAYS has status 'UNAVAILABLE' and display 'Price Unavailable'.
 * - Historical prices (older than 2 days) are explicitly identified as HISTORICAL QUOTE.
 */
export function resolveValidatedPriceStatus(input: PriceValidationInput): ValidatedPriceStatus {
  const {
    record,
    requestedCommodity,
    targetMarketId,
    targetMarketName,
    targetDistrict,
    targetState,
    isLiveApiResult = false,
    isDemoBenchmark = false,
  } = input;

  // Case 1: Null or undefined record
  if (!record) {
    return {
      isValid: false,
      hasVerifiedPrice: false,
      modalPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceSourceType: 'UNAVAILABLE',
      priceCategory: 'UNAVAILABLE',
      internalPriceStatus: 'PRICE UNAVAILABLE',
      freshnessStatus: 'UNAVAILABLE',
      arrivalDate: 'N/A',
      displayPriceText: 'Price Unavailable',
      source: 'Unquoted',
      confidenceIndicator: 'LOW',
      rejectionReason: 'No market price record provided.',
      sanitizedRecord: null,
    };
  }

  // Case 2: Commodity mismatch check (anti-contamination)
  if (requestedCommodity && record.commodity) {
    if (!isCommodityMatch(record.commodity, requestedCommodity)) {
      return {
        isValid: false,
        hasVerifiedPrice: false,
        modalPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceSourceType: 'UNAVAILABLE',
        priceCategory: 'UNAVAILABLE',
        internalPriceStatus: 'PRICE UNAVAILABLE',
        freshnessStatus: 'UNAVAILABLE',
        arrivalDate: 'N/A',
        displayPriceText: 'Price Unavailable',
        source: 'Rejected due to crop mismatch',
        confidenceIndicator: 'LOW',
        rejectionReason: `Commodity mismatch: record is for "${record.commodity}" but requested "${requestedCommodity}".`,
        sanitizedRecord: null,
      };
    }
  }

  // Case 3: Market cross-contamination check (for direct records)
  const isExplicitNearbyFallback = record.fallbackTier === 3 || Boolean(record.attributedMarketName);
  if (!isExplicitNearbyFallback && targetMarketId && record.marketId) {
    const isMatch = isMarketIdentityMatch(
      record.marketId,
      record.marketName || '',
      record.district || '',
      record.state || '',
      targetMarketId,
      targetMarketName || '',
      targetDistrict || '',
      targetState || ''
    );
    if (!isMatch) {
      return {
        isValid: false,
        hasVerifiedPrice: false,
        modalPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceSourceType: 'UNAVAILABLE',
        priceCategory: 'UNAVAILABLE',
        internalPriceStatus: 'PRICE UNAVAILABLE',
        freshnessStatus: 'UNAVAILABLE',
        arrivalDate: 'N/A',
        displayPriceText: 'Price Unavailable',
        source: 'Rejected due to market mismatch',
        confidenceIndicator: 'LOW',
        rejectionReason: `Market mismatch: record belongs to "${record.marketName}" (${record.marketId}) instead of target "${targetMarketName}".`,
        sanitizedRecord: null,
      };
    }
  }

  // Case 4: Price sanity check
  const sanity = validateAndSanitizePrice(record);
  if (!sanity.isValid) {
    return {
      isValid: false,
      hasVerifiedPrice: false,
      modalPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceSourceType: 'UNAVAILABLE',
      priceCategory: 'UNAVAILABLE',
      internalPriceStatus: 'PRICE UNAVAILABLE',
      freshnessStatus: 'UNAVAILABLE',
      arrivalDate: 'N/A',
      displayPriceText: 'Price Unavailable',
      source: 'Rejected invalid rate',
      confidenceIndicator: 'LOW',
      rejectionReason: sanity.error,
      sanitizedRecord: null,
    };
  }

  // Case 5: Valid price verified! Derive status
  const arrivalDate = record.arrivalDate && record.arrivalDate !== 'N/A'
    ? record.arrivalDate
    : (isLiveApiResult ? new Date().toISOString().split('T')[0] : 'N/A');

  const freshnessStatus = record.freshnessStatus && record.freshnessStatus !== 'UNAVAILABLE'
    ? record.freshnessStatus
    : evaluatePriceFreshness(arrivalDate);

  // Status resolution rules:
  // - If demo benchmark -> SAMPLE
  // - If nearby reference -> NEARBY_REFERENCE (Tier 3)
  // - If regional benchmark -> REGIONAL_BENCHMARK (Tier 4)
  // - If farmer expected -> FARMER_EXPECTED (Tier 5)
  // - If live API result and freshnessStatus === 'CURRENT' -> LIVE
  // - If past historical arrival (> 2 days old) -> HISTORICAL (Historical Quote)
  // - Otherwise -> CACHED
  let resolvedSourceType: PriceSourceType = 'CACHED';

  if (isDemoBenchmark || record.priceSourceType === 'SAMPLE') {
    resolvedSourceType = 'SAMPLE';
  } else if (record.priceSourceType === 'WEB_DISCOVERED') {
    resolvedSourceType = 'WEB_DISCOVERED';
  } else if (record.fallbackTier === 3 || record.priceSourceType === 'NEARBY_REFERENCE') {
    resolvedSourceType = 'NEARBY_REFERENCE';
  } else if (record.fallbackTier === 4 || record.priceSourceType === 'REGIONAL_BENCHMARK') {
    resolvedSourceType = 'REGIONAL_BENCHMARK';
  } else if (record.fallbackTier === 5 || record.priceSourceType === 'FARMER_EXPECTED') {
    resolvedSourceType = 'FARMER_EXPECTED';
  } else if (isLiveApiResult) {
    if (freshnessStatus === 'CURRENT') {
      resolvedSourceType = 'LIVE';
    } else {
      resolvedSourceType = 'HISTORICAL';
    }
  } else if (record.priceSourceType === 'HISTORICAL' || freshnessStatus === 'RECENT' || freshnessStatus === 'STALE') {
    resolvedSourceType = 'HISTORICAL';
  } else {
    resolvedSourceType = 'CACHED';
  }

  let internalPriceStatus: InternalPriceStatus = 'HISTORICAL OFFICIAL QUOTE';
  if (resolvedSourceType === 'LIVE') {
    internalPriceStatus = 'LIVE OFFICIAL QUOTE';
  } else if (resolvedSourceType === 'WEB_DISCOVERED') {
    internalPriceStatus = 'WEB-DISCOVERED PRICE';
  } else if (
    resolvedSourceType === 'NEARBY_REFERENCE' ||
    resolvedSourceType === 'REGIONAL_BENCHMARK' ||
    resolvedSourceType === 'FARMER_EXPECTED'
  ) {
    internalPriceStatus = 'REGIONAL REFERENCE PRICE';
  } else if (
    resolvedSourceType === 'HISTORICAL' ||
    resolvedSourceType === 'CACHED' ||
    resolvedSourceType === 'SAMPLE'
  ) {
    internalPriceStatus = 'HISTORICAL OFFICIAL QUOTE';
  }

  let priceCategory: PriceCategory = 'CATEGORY_B';
  if (resolvedSourceType === 'LIVE' || (resolvedSourceType === 'CACHED' && freshnessStatus === 'CURRENT')) {
    priceCategory = 'CATEGORY_A';
  } else if (resolvedSourceType === 'HISTORICAL' || resolvedSourceType === 'CACHED' || resolvedSourceType === 'WEB_DISCOVERED') {
    priceCategory = 'CATEGORY_B';
  } else if (resolvedSourceType === 'NEARBY_REFERENCE' || resolvedSourceType === 'REGIONAL_BENCHMARK') {
    priceCategory = 'CATEGORY_C';
  } else {
    priceCategory = 'CATEGORY_C';
  }

  const confidenceIndicator: ConfidenceIndicator =
    record.confidenceIndicator ||
    (resolvedSourceType === 'LIVE' || resolvedSourceType === 'CACHED' || resolvedSourceType === 'HISTORICAL'
      ? 'HIGH'
      : resolvedSourceType === 'NEARBY_REFERENCE'
      ? 'MEDIUM'
      : resolvedSourceType === 'REGIONAL_BENCHMARK'
      ? 'LOW'
      : resolvedSourceType === 'FARMER_EXPECTED'
      ? 'ESTIMATE'
      : 'HIGH');

  const displayPriceText = `₹${sanity.modalPrice.toLocaleString('en-IN')}/Qtl`;

  const sanitizedRecord: MarketPriceRecord = {
    marketId: record.marketId || targetMarketId || '',
    marketName: record.marketName || targetMarketName || '',
    state: record.state || targetState || '',
    district: record.district || targetDistrict || '',
    commodity: record.commodity || requestedCommodity || '',
    variety: record.variety || 'FAQ / Standard',
    grade: record.grade || 'FAQ',
    arrivalDate,
    minPrice: sanity.minPrice,
    maxPrice: sanity.maxPrice,
    modalPrice: sanity.modalPrice,
    priceUnit: 'INR/Quintal',
    source: record.source || (resolvedSourceType === 'LIVE' ? 'Data.gov.in AGMARKNET' : 'Verified APMC Bulletin'),
    retrievedAt: record.retrievedAt || new Date().toISOString(),
    freshnessStatus,
    priceSourceType: resolvedSourceType,
    priceCategory,
    internalPriceStatus,
    sourceUrl: record.sourceUrl,
    confidenceIndicator,
    attributedMarketName: record.attributedMarketName,
    attributedDistanceKm: record.attributedDistanceKm,
    fallbackTier: record.fallbackTier || (resolvedSourceType === 'LIVE' ? 1 : resolvedSourceType === 'WEB_DISCOVERED' ? 2 : 2),
  };

  return {
    isValid: true,
    hasVerifiedPrice: true,
    modalPrice: sanity.modalPrice,
    minPrice: sanity.minPrice,
    maxPrice: sanity.maxPrice,
    priceSourceType: resolvedSourceType,
    priceCategory,
    internalPriceStatus,
    freshnessStatus,
    arrivalDate,
    displayPriceText,
    source: sanitizedRecord.source,
    sourceUrl: record.sourceUrl,
    confidenceIndicator,
    attributedMarketName: record.attributedMarketName,
    attributedDistanceKm: record.attributedDistanceKm,
    fallbackTier: sanitizedRecord.fallbackTier,
    sanitizedRecord,
  };
}

// ============================================================================
// 6. PRE-RENDER CONSISTENCY AUDITOR & AUTO-HEALING
// ============================================================================

export interface ConsistencyAuditResult {
  hasViolations: boolean;
  violationsCount: number;
  violationDetails: string[];
}

export function auditAndEnforceConsistency(
  evaluations: Array<{
    market: { marketId: string; marketName: string };
    priceRecord: MarketPriceRecord | null;
    hasVerifiedPrice: boolean;
    priceSourceType: PriceSourceType;
  }>
): ConsistencyAuditResult {
  const violationDetails: string[] = [];

  for (const mandi of evaluations) {
    const hasNumericPrice = Boolean(mandi.priceRecord && mandi.priceRecord.modalPrice > 0);
    const isMarkedUnavailable = mandi.priceSourceType === 'UNAVAILABLE';

    if (hasNumericPrice && isMarkedUnavailable) {
      const msg = `[CRITICAL INCONSISTENCY] Mandi "${mandi.market.marketName}" (${mandi.market.marketId}) has price ₹${mandi.priceRecord?.modalPrice}/Qtl but status is UNAVAILABLE. Auto-healing to CACHED.`;
      violationDetails.push(msg);
      mandi.priceSourceType = 'CACHED';
      mandi.hasVerifiedPrice = true;
    }

    if (!hasNumericPrice && !isMarkedUnavailable) {
      const msg = `[CRITICAL INCONSISTENCY] Mandi "${mandi.market.marketName}" (${mandi.market.marketId}) has no price but status is ${mandi.priceSourceType}. Auto-healing to UNAVAILABLE.`;
      violationDetails.push(msg);
      mandi.priceSourceType = 'UNAVAILABLE';
      mandi.hasVerifiedPrice = false;
      mandi.priceRecord = null;
    }
  }

  return {
    hasViolations: violationDetails.length > 0,
    violationsCount: violationDetails.length,
    violationDetails,
  };
}
