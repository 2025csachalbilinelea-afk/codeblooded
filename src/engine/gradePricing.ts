/**
 * HARVESTROUTE: PRODUCE GRADE-BASED REVENUE CALCULATION ENGINE
 * Dynamically computes grade pricing (A, B, C), weighted averages, bulk selling,
 * and net estimated take-home revenue after deducting spoilage and transportation expenses.
 */

import { CropProfile, GradeDistribution, GradePricingMode } from '../types/agriculture';
import { DynamicMandiEvaluation } from '../types/marketDiscovery';
import { VERIFIED_AGMARKNET_PRICES } from '../data/agmarknetBenchmarks';
import { normalizeCommodityForAgmarknet, isCommodityMatch } from '../services/priceValidationService';

export interface MarketPriceReferenceInfo {
  price: number;
  isLive: boolean;
  isCached: boolean;
  source: string;
  arrivalDate?: string;
  marketName?: string;
}

/**
 * Resolves the official reference market price for a given crop using
 * real-time discovered mandi evaluations or authentic cached AGMARKNET benchmarks.
 */
export function resolveCropMarketReferencePrice(
  crop: CropProfile,
  evaluations?: DynamicMandiEvaluation[],
  recommendedMarket?: DynamicMandiEvaluation | null
): MarketPriceReferenceInfo {
  // Priority 1: Check recommended market evaluation if available and has verified price
  if (recommendedMarket?.hasVerifiedPrice && recommendedMarket.priceRecord && recommendedMarket.priceRecord.modalPrice > 0) {
    const isCached =
      recommendedMarket.priceRecord.priceSourceType === 'CACHED' ||
      recommendedMarket.priceRecord.freshnessStatus !== 'CURRENT';
    return {
      price: recommendedMarket.priceRecord.modalPrice,
      isLive: !isCached,
      isCached,
      source: recommendedMarket.priceRecord.source || 'AGMARKNET Daily Bulletin',
      arrivalDate: recommendedMarket.priceRecord.arrivalDate,
      marketName: recommendedMarket.market.marketName,
    };
  }

  // Priority 2: Check any verified evaluation in the current discovered list
  if (evaluations && evaluations.length > 0) {
    const verified = evaluations.find(
      (e) => e.hasVerifiedPrice && e.priceRecord && e.priceRecord.modalPrice > 0
    );
    if (verified && verified.priceRecord) {
      const isCached =
        verified.priceRecord.priceSourceType === 'CACHED' ||
        verified.priceRecord.freshnessStatus !== 'CURRENT';
      return {
        price: verified.priceRecord.modalPrice,
        isLive: !isCached,
        isCached,
        source: verified.priceRecord.source || 'AGMARKNET Daily Bulletin',
        arrivalDate: verified.priceRecord.arrivalDate,
        marketName: verified.market.marketName,
      };
    }
  }

  // Priority 3: Check verified AGMARKNET arrival benchmark records for this commodity
  const normCrop = normalizeCommodityForAgmarknet(crop.name).toLowerCase();
  const benchmark = VERIFIED_AGMARKNET_PRICES.find((b) => {
    if (isCommodityMatch(b.commodity, crop.name)) return true;
    const bNorm = b.commodity.toLowerCase();
    return bNorm.includes(normCrop) || normCrop.includes(bNorm);
  });

  if (benchmark && benchmark.modalPrice > 0) {
    return {
      price: benchmark.modalPrice,
      isLive: false,
      isCached: true,
      source: benchmark.source || 'AGMARKNET (Data.gov.in Official Arrival Bulletin)',
      arrivalDate: benchmark.arrivalDate,
      marketName: benchmark.marketName,
    };
  }

  // Priority 4: Default to mid-range of typical market rate
  const fallback = Math.round((crop.typicalMarketPriceRange.min + crop.typicalMarketPriceRange.max) / 2);
  return {
    price: fallback,
    isLive: false,
    isCached: true,
    source: 'Regional APMC Benchmark Range',
    arrivalDate: '2026-10-30',
    marketName: 'Regional APMC Reference',
  };
}

/**
 * Grade-based pricing logic:
 * Grade A Price = Current Market Price
 * Grade B Price = Grade A Price × 0.90 (exactly 10% below Grade A)
 * Grade C Price = Grade A Price × 0.75 (exactly 25% below Grade A)
 */
export function calculateGradePrices(marketReferencePrice: number) {
  const gradeAPrice = marketReferencePrice;
  const gradeBPrice = Math.round(marketReferencePrice * 0.90);
  const gradeCPrice = Math.round(marketReferencePrice * 0.75);

  return {
    gradeAPrice,
    gradeBPrice,
    gradeCPrice,
  };
}

export interface GradeValidationResult {
  isValid: boolean;
  totalPercent: number;
  remainingPercent: number;
  message?: string;
}

/**
 * Validates farmer-entered grade percentages:
 * - Each percentage must be between 0 and 100.
 * - The total of Grade A + Grade B + Grade C must equal exactly 100%.
 */
export function validateGradePercentages(distribution?: GradeDistribution): GradeValidationResult {
  if (!distribution) {
    return {
      isValid: false,
      totalPercent: 0,
      remainingPercent: 100,
      message: 'Please enter grade percentages for Grade A, B, and C.',
    };
  }

  const rawA = typeof distribution.A === 'number' && !isNaN(distribution.A) ? distribution.A : 0;
  const rawB = typeof distribution.B === 'number' && !isNaN(distribution.B) ? distribution.B : 0;
  const rawC = typeof distribution.C === 'number' && !isNaN(distribution.C) ? distribution.C : 0;

  if (rawA < 0 || rawB < 0 || rawC < 0) {
    return {
      isValid: false,
      totalPercent: rawA + rawB + rawC,
      remainingPercent: 100 - (rawA + rawB + rawC),
      message: 'Grade percentages cannot be negative.',
    };
  }

  if (rawA > 100 || rawB > 100 || rawC > 100) {
    return {
      isValid: false,
      totalPercent: rawA + rawB + rawC,
      remainingPercent: 100 - (rawA + rawB + rawC),
      message: 'Individual grade percentages cannot exceed 100%.',
    };
  }

  const totalPercent = Math.round((rawA + rawB + rawC) * 10) / 10;
  const remainingPercent = Math.round((100 - totalPercent) * 10) / 10;
  const isValid = Math.abs(totalPercent - 100) <= 0.05;

  let message: string | undefined;
  if (!isValid) {
    if (totalPercent < 100) {
      message = `Percentages must total exactly 100%. Currently ${totalPercent}% (${remainingPercent}% remaining).`;
    } else {
      message = `Percentages must total exactly 100%. Currently ${totalPercent}% (${Math.abs(remainingPercent)}% over limit).`;
    }
  }

  return {
    isValid,
    totalPercent,
    remainingPercent,
    message,
  };
}

export interface ProduceGradeRevenueBreakdown {
  mode: GradePricingMode;
  marketReferencePrice: number;
  isLive: boolean;
  isCached: boolean;
  source: string;
  arrivalDate?: string;
  marketName?: string;

  // Grade pricing per quintal
  gradeAPrice: number;
  gradeBPrice: number;
  gradeCPrice: number;

  // Grade percentages & validation
  gradeAPercent: number;
  gradeBPercent: number;
  gradeCPercent: number;
  totalPercent: number;
  remainingPercent: number;
  isValidGradeDistribution: boolean;
  validationMessage?: string;

  // Consignment mass
  harvestQuantityQuintals: number;
  spoilageLossPercentage: number;
  spoilageLossQuintals: number;
  eligibleSellingQuantityQuintals: number;

  // Grade-wise saleable breakdown
  gradeAQuantityQuintals: number;
  gradeBQuantityQuintals: number;
  gradeCQuantityQuintals: number;
  gradeAValue: number;
  gradeBValue: number;
  gradeCValue: number;

  // Effective selling price (Weighted Average for Option A, Grade B price for Option B)
  effectiveSellingPricePerQuintal: number;

  // 5 Comparison metrics:
  // 1. Current market reference price
  // 2. Grade-adjusted selling price
  // 3. Estimated gross selling value
  // 4. Estimated transportation expenses
  // 5. Final estimated net revenue
  estimatedGrossSellingValue: number;
  estimatedTransportationExpenses: number;
  estimatedNetRevenue: number;
}

/**
 * Calculates complete grade pricing and net revenue based on the farmer's selection:
 * - Option A: Weighted average selling price using user-entered grade percentages.
 * - Option B: Bulk selling estimate using Grade B equivalent pricing (90% of market reference).
 */
export function calculateProduceGradeRevenue(params: {
  mode: GradePricingMode;
  distribution?: GradeDistribution;
  harvestQuantityQuintals: number;
  spoilageLossPercentage: number;
  marketReference: MarketPriceReferenceInfo;
  estimatedTransportationExpenses: number;
}): ProduceGradeRevenueBreakdown {
  const {
    mode,
    distribution,
    harvestQuantityQuintals,
    spoilageLossPercentage,
    marketReference,
    estimatedTransportationExpenses,
  } = params;

  const { gradeAPrice, gradeBPrice, gradeCPrice } = calculateGradePrices(marketReference.price);

  // Spoilage deduction (consistent with existing loss estimation engine)
  const lossFraction = Math.max(0, Math.min(1, (spoilageLossPercentage || 0) / 100));
  const spoilageLossQuintals = Number((harvestQuantityQuintals * lossFraction).toFixed(2));
  const eligibleSellingQuantityQuintals = Math.max(
    0,
    Number((harvestQuantityQuintals - spoilageLossQuintals).toFixed(2))
  );

  if (mode === 'bulk') {
    // OPTION B: SELL IN BULK
    // Entire harvest considered Grade B for pricing: Grade B = Market Reference × 0.90
    const effectiveSellingPricePerQuintal = gradeBPrice;
    const estimatedGrossSellingValue = Math.round(
      eligibleSellingQuantityQuintals * effectiveSellingPricePerQuintal
    );
    const estimatedNetRevenue = Math.round(
      estimatedGrossSellingValue - (estimatedTransportationExpenses || 0)
    );

    return {
      mode: 'bulk',
      marketReferencePrice: marketReference.price,
      isLive: marketReference.isLive,
      isCached: marketReference.isCached,
      source: marketReference.source,
      arrivalDate: marketReference.arrivalDate,
      marketName: marketReference.marketName,

      gradeAPrice,
      gradeBPrice,
      gradeCPrice,

      gradeAPercent: 0,
      gradeBPercent: 100,
      gradeCPercent: 0,
      totalPercent: 100,
      remainingPercent: 0,
      isValidGradeDistribution: true,

      harvestQuantityQuintals,
      spoilageLossPercentage,
      spoilageLossQuintals,
      eligibleSellingQuantityQuintals,

      gradeAQuantityQuintals: 0,
      gradeBQuantityQuintals: eligibleSellingQuantityQuintals,
      gradeCQuantityQuintals: 0,
      gradeAValue: 0,
      gradeBValue: estimatedGrossSellingValue,
      gradeCValue: 0,

      effectiveSellingPricePerQuintal,
      estimatedGrossSellingValue,
      estimatedTransportationExpenses,
      estimatedNetRevenue,
    };
  }

  // OPTION A: I KNOW MY PRODUCE GRADES
  const validation = validateGradePercentages(distribution);
  const rawA = distribution?.A ?? 0;
  const rawB = distribution?.B ?? 0;
  const rawC = distribution?.C ?? 0;

  if (!validation.isValid) {
    // Do not calculate final grade-based revenue until valid percentages are entered
    return {
      mode: 'grades',
      marketReferencePrice: marketReference.price,
      isLive: marketReference.isLive,
      isCached: marketReference.isCached,
      source: marketReference.source,
      arrivalDate: marketReference.arrivalDate,
      marketName: marketReference.marketName,

      gradeAPrice,
      gradeBPrice,
      gradeCPrice,

      gradeAPercent: rawA,
      gradeBPercent: rawB,
      gradeCPercent: rawC,
      totalPercent: validation.totalPercent,
      remainingPercent: validation.remainingPercent,
      isValidGradeDistribution: false,
      validationMessage: validation.message,

      harvestQuantityQuintals,
      spoilageLossPercentage,
      spoilageLossQuintals,
      eligibleSellingQuantityQuintals,

      gradeAQuantityQuintals: 0,
      gradeBQuantityQuintals: 0,
      gradeCQuantityQuintals: 0,
      gradeAValue: 0,
      gradeBValue: 0,
      gradeCValue: 0,

      effectiveSellingPricePerQuintal: 0,
      estimatedGrossSellingValue: 0,
      estimatedTransportationExpenses,
      estimatedNetRevenue: 0,
    };
  }

  // Valid Option A calculations
  // Weighted Average Price = (Grade A Price × A% / 100) + (Grade B Price × B% / 100) + (Grade C Price × C% / 100)
  const weightedAveragePrice = Math.round(
    (gradeAPrice * (rawA / 100)) +
    (gradeBPrice * (rawB / 100)) +
    (gradeCPrice * (rawC / 100))
  );

  const gradeAQuantity = Number(((eligibleSellingQuantityQuintals * rawA) / 100).toFixed(2));
  const gradeBQuantity = Number(((eligibleSellingQuantityQuintals * rawB) / 100).toFixed(2));
  const gradeCQuantity = Math.max(
    0,
    Number((eligibleSellingQuantityQuintals - gradeAQuantity - gradeBQuantity).toFixed(2))
  );

  const gradeAValue = Math.round(gradeAQuantity * gradeAPrice);
  const gradeBValue = Math.round(gradeBQuantity * gradeBPrice);
  const gradeCValue = Math.round(gradeCQuantity * gradeCPrice);

  const estimatedGrossSellingValue = Math.round(
    eligibleSellingQuantityQuintals * weightedAveragePrice
  );
  const estimatedNetRevenue = Math.round(
    estimatedGrossSellingValue - (estimatedTransportationExpenses || 0)
  );

  return {
    mode: 'grades',
    marketReferencePrice: marketReference.price,
    isLive: marketReference.isLive,
    isCached: marketReference.isCached,
    source: marketReference.source,
    arrivalDate: marketReference.arrivalDate,
    marketName: marketReference.marketName,

    gradeAPrice,
    gradeBPrice,
    gradeCPrice,

    gradeAPercent: rawA,
    gradeBPercent: rawB,
    gradeCPercent: rawC,
    totalPercent: validation.totalPercent,
    remainingPercent: validation.remainingPercent,
    isValidGradeDistribution: true,

    harvestQuantityQuintals,
    spoilageLossPercentage,
    spoilageLossQuintals,
    eligibleSellingQuantityQuintals,

    gradeAQuantityQuintals: gradeAQuantity,
    gradeBQuantityQuintals: gradeBQuantity,
    gradeCQuantityQuintals: gradeCQuantity,
    gradeAValue,
    gradeBValue,
    gradeCValue,

    effectiveSellingPricePerQuintal: weightedAveragePrice,
    estimatedGrossSellingValue,
    estimatedTransportationExpenses,
    estimatedNetRevenue,
  };
}
