/**
 * HARVESTROUTE PHASE 5: DYNAMIC MANDI DISCOVERY & PROFIT OPTIMIZATION ENGINE
 * Integrates real road distance (OSRM), AGMARKNET wholesale prices, vehicle economics,
 * and physical spoilage to rank agricultural mandis across India by estimated net selling revenue.
 */

import {
  CropProfile,
  MaturityFreshness,
  SpoilageInputs,
  TransportConfig,
  GradeDistribution,
  GradePricingMode,
} from '../types/agriculture';
import {
  DynamicMandiEvaluation,
  FarmerLocation,
  MandiFilterOptions,
  MandiSortOption,
  NationalMarket,
  RoadRouteResult,
  PriceSourceType,
  PriceCategory,
  DiscoveryLevel,
  ApiErrorCategory,
  MarketPriceRecord,
} from '../types/marketDiscovery';
import {
  discoverNearbyNationalMandis,
  getNationalMarketById,
  VERIFIED_NATIONAL_MANDIS,
} from '../data/nationalMandis';
import {
  getMarketPriceForCommodity,
  getAgmarknetApiStatus,
  discoverNationalCommodityPrices,
} from '../services/agmarknetService';
import {
  resolveValidatedPriceStatus,
  auditAndEnforceConsistency,
  isMarketIdentityMatch,
} from '../services/priceValidationService';
import { calculateRoadRoute } from '../services/routingService';
import { calculateTransportationCost } from './transport';
import { calculateSpoilagePercentage } from './spoilage';
import { generateCropPriceForecast } from './forecastEngine';

export interface DiscoveryEngineResult {
  evaluatedMarkets: DynamicMandiEvaluation[];
  feasibleMarkets: DynamicMandiEvaluation[];
  infeasibleMarkets: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  closestFeasibleMarket: DynamicMandiEvaluation | null;
  totalCandidatesFound: number;
  discoveryLevel?: DiscoveryLevel;
  apiErrorCategory?: ApiErrorCategory;
  apiStatus?: { isAvailable: boolean; lastError?: string; lastSyncTime?: string };
  searchSummary: {
    originAddress: string;
    cropName: string;
    consignmentQuintals: number;
    searchRadiusKm: number;
    timestamp: string;
  };
}

/**
 * Evaluates an individual national mandi candidate against farmer logistics and pricing.
 */
export function evaluateMarketCandidate(
  market: NationalMarket,
  route: RoadRouteResult,
  priceRecord: ReturnType<typeof Object> | null,
  crop: CropProfile,
  quantityQuintals: number,
  spoilage: SpoilageInputs,
  maturity: MaturityFreshness,
  transport: TransportConfig,
  gradePricingMode?: GradePricingMode,
  gradeDistribution?: GradeDistribution
): DynamicMandiEvaluation {
  const infeasibilityReasons: string[] = [];

  // Feasibility Check 1: Quantity limits
  if (quantityQuintals > market.maxDailyCapacityQuintals) {
    infeasibilityReasons.push(
      `Harvest volume (${quantityQuintals} Qtl) exceeds market daily auction quota (${market.maxDailyCapacityQuintals} Qtl).`
    );
  }
  if (quantityQuintals < market.minPurchaseQuintals) {
    infeasibilityReasons.push(
      `Consignment quantity (${quantityQuintals} Qtl) is below minimum lot size (${market.minPurchaseQuintals} Qtl).`
    );
  }

  // Feasibility Check 2: Centralized price availability verification
  const priceStatus = resolveValidatedPriceStatus({
    record: priceRecord as any,
    requestedCommodity: crop.name,
    targetMarketId: market.marketId,
    targetMarketName: market.marketName,
    targetDistrict: market.district,
    targetState: market.state,
  });

  const hasVerifiedPrice = priceStatus.hasVerifiedPrice;
  const modalPrice = priceStatus.modalPrice;
  const priceSourceType: PriceSourceType = priceStatus.priceSourceType;
  const priceCategory: PriceCategory = priceStatus.priceCategory;
  const sanitizedPriceRecord = priceStatus.sanitizedRecord;
  const isDistanceVerified = Boolean(route.isDistanceVerified ?? (route.routingStatus === 'ROUTED'));

  if (!hasVerifiedPrice) {
    infeasibilityReasons.push(
      'Daily wholesale price currently unavailable for this crop at this mandi.'
    );
  }

  if (!isDistanceVerified || route.routingStatus === 'UNAVAILABLE') {
    infeasibilityReasons.push(
      'Road distance currently unavailable from your farm origin to this market.'
    );
  }

  // Calculate Spoilage
  const spoilageCalc = calculateSpoilagePercentage(
    crop,
    spoilage,
    route.estimatedTravelTimeHours || 1,
    market.typicalWaitHours,
    maturity
  );
  const spoilagePercent = spoilageCalc.lossPercentage;
  const spoilageLossQuintals = Math.round(((quantityQuintals * spoilagePercent) / 100) * 100) / 100;
  const saleableQuintals = Math.max(0, Math.round((quantityQuintals - spoilageLossQuintals) * 100) / 100);

  // Calculate Gross Revenue - ONLY when verified price is available!
  const gradeAPrice = modalPrice;
  const gradeBPrice = Math.round(modalPrice * 0.90);
  const gradeCPrice = Math.round(modalPrice * 0.75);

  let effectivePrice = modalPrice;
  if (hasVerifiedPrice) {
    if (gradePricingMode === 'bulk') {
      effectivePrice = gradeBPrice;
    } else if (gradeDistribution) {
      const rawA = gradeDistribution.A ?? 0;
      const rawB = gradeDistribution.B ?? 0;
      const rawC = gradeDistribution.C ?? 0;
      const sum = rawA + rawB + rawC;
      if (Math.abs(sum - 100) <= 0.5) {
        effectivePrice = Math.round(
          (gradeAPrice * (rawA / 100)) +
          (gradeBPrice * (rawB / 100)) +
          (gradeCPrice * (rawC / 100))
        );
      } else {
        effectivePrice = gradeBPrice;
      }
    } else {
      effectivePrice = gradeBPrice;
    }
  }

  const grossRevenue = hasVerifiedPrice ? Math.round(saleableQuintals * effectivePrice) : 0;

  // Calculate Transport Costs using authentic road distance
  const transportCalc = calculateTransportationCost(transport, route.roadDistanceKm, quantityQuintals);
  const transportCost = isDistanceVerified ? transportCalc.totalCost : 0;
  const transportTrips = transportCalc.tripsCount;

  if (isDistanceVerified && !transportCalc.isFeasible && transportCalc.feasibilityReason) {
    infeasibilityReasons.push(transportCalc.feasibilityReason);
  }

  // Calculate Mandi Fees & Charges
  const commissionFee = hasVerifiedPrice ? Math.round((market.commissionPercent / 100) * grossRevenue) : 0;
  const cessFee = hasVerifiedPrice ? Math.round((market.cessPercent / 100) * grossRevenue) : 0;
  const handlingFee = Math.round(market.handlingChargePerQuintal * saleableQuintals);
  const totalMarketFees = commissionFee + cessFee + handlingFee + market.fixedEntryFee;

  // Calculate Total Selling Costs and Net Revenue
  // Crucial Rule: Do not assign misleading profits when price or distance information is unavailable!
  const totalSellingCosts = transportCost + totalMarketFees;
  const canCalculateNetRevenue = hasVerifiedPrice && isDistanceVerified;
  const netSellingRevenue = canCalculateNetRevenue ? grossRevenue - totalSellingCosts : 0;
  const netRevenuePerQuintal = canCalculateNetRevenue && quantityQuintals > 0 ? Math.round(netSellingRevenue / quantityQuintals) : 0;

  const isFeasible = infeasibilityReasons.length === 0;

  return {
    market,
    priceRecord: sanitizedPriceRecord,
    route,
    consignmentQuintals: quantityQuintals,
    saleableQuintals,
    spoilagePercent,
    spoilageLossQuintals,
    grossRevenue,
    transportCost,
    transportTrips,
    marketFees: totalMarketFees,
    handlingCharges: handlingFee,
    totalSellingCosts,
    netSellingRevenue,
    netRevenuePerQuintal,
    additionalEarnings: 0, // Populated after comparative analysis
    isFeasible,
    infeasibilityReasons,
    rank: 0,
    isRecommended: false,
    recommendationReasons: [],
    hasVerifiedPrice,
    priceSourceType,
    priceCategory,
    internalPriceStatus: priceStatus.internalPriceStatus,
    sourceUrl: priceStatus.sourceUrl || sanitizedPriceRecord?.sourceUrl,
    isDistanceVerified,
    confidenceIndicator: priceStatus.confidenceIndicator,
    attributedMarketName: priceStatus.attributedMarketName,
    attributedDistanceKm: priceStatus.attributedDistanceKm,
    fallbackTier: priceStatus.fallbackTier,
    forecast:
      hasVerifiedPrice
        ? generateCropPriceForecast({
            commodity: crop.name,
            variety: sanitizedPriceRecord?.variety || 'Standard FAQ',
            marketId: market.marketId,
            marketName: market.marketName,
            latestActualPrice: modalPrice,
            latestArrivalDate: sanitizedPriceRecord?.arrivalDate,
            freshnessStatus: sanitizedPriceRecord?.freshnessStatus || 'CURRENT',
          })
        : null,
  };
}

/**
 * End-to-end Mandi Discovery and Profit Optimization.
 */
export async function discoverAndEvaluateMandis(
  farmerLocation: FarmerLocation,
  crop: CropProfile,
  quantityQuintals: number,
  transport: TransportConfig,
  spoilage: SpoilageInputs,
  maturity: MaturityFreshness = 'optimal',
  options?: {
    sortOption?: MandiSortOption;
    filters?: MandiFilterOptions;
    apiKey?: string;
    gradePricingMode?: GradePricingMode;
    gradeDistribution?: GradeDistribution;
  }
): Promise<DiscoveryEngineResult> {
  const sortOption = options?.sortOption || 'netRevenue';
  const filters = options?.filters || {};

  // 1. PHASE 3: Search actual commodity-price records first across India with 3-level expansion
  const nationalDiscovery = await discoverNationalCommodityPrices(
    crop.name,
    farmerLocation.state,
    {
      apiKey: options?.apiKey,
      maxLookbackDays: 30,
    }
  );

  // Map of marketId -> discovered MarketPriceRecord
  const priceRecordMap = new Map<string, MarketPriceRecord>();
  for (const pr of nationalDiscovery.records) {
    priceRecordMap.set(pr.marketId, pr);
  }

  // Derive candidate markets from discovered price records
  const candidatesFromPrices: NationalMarket[] = [];
  for (const pr of nationalDiscovery.records) {
    let mDef = getNationalMarketById(pr.marketId);
    if (!mDef) {
      mDef = VERIFIED_NATIONAL_MANDIS.find((vm) =>
        isMarketIdentityMatch('', pr.marketName, pr.district, pr.state, vm.marketId, vm.marketName, vm.district, vm.state)
      );
    }
    if (mDef) {
      candidatesFromPrices.push(mDef);
    } else {
      candidatesFromPrices.push({
        marketId: pr.marketId,
        marketName: pr.marketName,
        state: pr.state,
        district: pr.district,
        latitude: farmerLocation.latitude,
        longitude: farmerLocation.longitude,
        source: pr.source,
        sourceMarketIdentifier: pr.marketId,
        lastVerifiedAt: pr.arrivalDate,
        supportedCommodities: [crop.id, 'vegetables', 'pulses', 'grains'],
        maxDailyCapacityQuintals: 500,
        minPurchaseQuintals: 2,
        commissionPercent: 1.5,
        cessPercent: 0.8,
        handlingChargePerQuintal: 20,
        fixedEntryFee: 80,
        typicalWaitHours: 2.0,
      });
    }
  }

  // Also include proximate local mandis near farmer for baseline comparison
  const nearbyMandis = discoverNearbyNationalMandis(
    farmerLocation.latitude,
    farmerLocation.longitude,
    crop.id,
    { targetCount: 8, maxRadiusKm: filters.maxDistanceKm || 1200 }
  );

  // Combine and deduplicate candidates
  const uniqueCandidateMap = new Map<string, NationalMarket>();
  for (const m of candidatesFromPrices) {
    uniqueCandidateMap.set(m.marketId.trim().toLowerCase(), m);
  }
  for (const { market } of nearbyMandis) {
    const key = market.marketId.trim().toLowerCase();
    if (!uniqueCandidateMap.has(key)) {
      uniqueCandidateMap.set(key, market);
    }
  }

  const uniqueCandidates = Array.from(uniqueCandidateMap.values());

  // 2. Fetch routes and market prices in parallel with market identity tracking
  const evaluationPromises = uniqueCandidates.map(async (market) => {
    // Route calculation (OSRM with collision-free caching and marketId)
    const route = await calculateRoadRoute(
      farmerLocation.latitude,
      farmerLocation.longitude,
      market.latitude,
      market.longitude,
      { marketId: market.marketId }
    );

    // AGMARKNET Price calculation: use discovered record if available, else resolve
    let priceRecord = priceRecordMap.get(market.marketId) || null;
    if (!priceRecord) {
      priceRecord = await getMarketPriceForCommodity(
        market.marketId,
        market.marketName,
        market.state,
        market.district,
        crop.name,
        options?.apiKey
      );
    }

    return evaluateMarketCandidate(
      market,
      route,
      priceRecord,
      crop,
      quantityQuintals,
      spoilage,
      maturity,
      transport,
      options?.gradePricingMode,
      options?.gradeDistribution
    );
  });

  const rawEvaluations = await Promise.all(evaluationPromises);

  // 3. Identify Reference Baseline (closest feasible market with Category A or B verified price by road distance)
  const feasibleWithVerifiedQuote = rawEvaluations.filter(
    (m) =>
      m.isFeasible &&
      m.hasVerifiedPrice &&
      (m.priceCategory === 'CATEGORY_A' || m.priceCategory === 'CATEGORY_B')
  );

  const closestFeasible =
    feasibleWithVerifiedQuote.length > 0
      ? [...feasibleWithVerifiedQuote].sort((a, b) => a.route.roadDistanceKm - b.route.roadDistanceKm)[0]
      : null;

  // 4. Calculate additional earnings over closest local reference
  const evaluatedWithEarnings = rawEvaluations.map((evalItem) => {
    const baselineNet = closestFeasible ? closestFeasible.netSellingRevenue : 0;
    const additional =
      evalItem.isFeasible &&
      evalItem.hasVerifiedPrice &&
      (evalItem.priceCategory === 'CATEGORY_A' || evalItem.priceCategory === 'CATEGORY_B')
        ? evalItem.netSellingRevenue - baselineNet
        : 0;
    return {
      ...evalItem,
      additionalEarnings: additional,
    };
  });

  // 5. Apply User Filters
  let filtered = evaluatedWithEarnings.filter((item) => {
    if (filters.state && filters.state !== 'ALL' && item.market.state !== filters.state) {
      return false;
    }
    if (filters.district && filters.district !== 'ALL' && item.market.district !== filters.district) {
      return false;
    }
    if (filters.maxDistanceKm && item.route.roadDistanceKm > filters.maxDistanceKm) {
      return false;
    }
    if (filters.onlyFeasible && !item.isFeasible) {
      return false;
    }
    const freshnessMode = filters.minFreshness || 'ALL';
    if (freshnessMode === 'CURRENT') {
      if (!item.hasVerifiedPrice || item.priceRecord?.freshnessStatus !== 'CURRENT') return false;
    } else if (freshnessMode === 'RECENT') {
      const status = item.priceRecord?.freshnessStatus;
      if (!item.hasVerifiedPrice || (status !== 'CURRENT' && status !== 'RECENT')) return false;
    } else if (freshnessMode === 'ALL') {
      if (!item.hasVerifiedPrice) return false;
    }
    return true;
  });

  // 6. Sort Candidates: Feasible with verified quotes (Cat A & B) first, then Cat C, then by selected option
  filtered.sort((a, b) => {
    if (a.isFeasible !== b.isFeasible) {
      return a.isFeasible ? -1 : 1;
    }

    const catScore = (item: DynamicMandiEvaluation) => {
      if (!item.hasVerifiedPrice) return 0;
      if (item.priceCategory === 'CATEGORY_A') return 3;
      if (item.priceCategory === 'CATEGORY_B') return 2;
      if (item.priceCategory === 'CATEGORY_C') return 1;
      return 1;
    };
    const diffCat = catScore(b) - catScore(a);
    if (diffCat !== 0) return diffCat;

    switch (sortOption) {
      case 'cropPrice': {
        const pA = a.priceRecord?.modalPrice || 0;
        const pB = b.priceRecord?.modalPrice || 0;
        return pB - pA;
      }
      case 'roadDistance':
        return a.route.roadDistanceKm - b.route.roadDistanceKm;
      case 'transportCost':
        return a.transportCost - b.transportCost;
      case 'netRevenue':
      default:
        return b.netSellingRevenue - a.netSellingRevenue;
    }
  });

  // 7. Assign Ranks and determine Top Recommendation
  // CRUCIAL RULE (PHASE 6): Only Categories A and B may be used for market-specific revenue ranking!
  // Category C is for indicative reference only and NEVER recommended.
  const eligibleForRecommendation = filtered.filter(
    (m) =>
      m.isFeasible &&
      m.hasVerifiedPrice &&
      (m.priceCategory === 'CATEGORY_A' || m.priceCategory === 'CATEGORY_B')
  );

  let recommendedMarket: DynamicMandiEvaluation | null = null;

  if (eligibleForRecommendation.length > 0) {
    const highestNet = [...eligibleForRecommendation].sort((a, b) => b.netSellingRevenue - a.netSellingRevenue)[0];
    recommendedMarket = highestNet;

    // Generate clear farmer recommendation rationale
    const reasons: string[] = [
      `Highest estimated net take-home revenue of ₹${highestNet.netSellingRevenue.toLocaleString(
        'en-IN'
      )} (₹${highestNet.netRevenuePerQuintal}/Qtl) after transport & market deductions.`,
    ];

    if (closestFeasible && highestNet.market.marketId !== closestFeasible.market.marketId) {
      const diff = highestNet.netSellingRevenue - closestFeasible.netSellingRevenue;
      if (diff > 0) {
        reasons.push(
          `Earns an additional +₹${diff.toLocaleString(
            'en-IN'
          )} compared to your closest mandi (${closestFeasible.market.marketName}), more than offsetting the ₹${(
            highestNet.transportCost - closestFeasible.transportCost
          ).toLocaleString('en-IN')} extra transport cost.`
        );
      }
    } else if (closestFeasible && highestNet.market.marketId === closestFeasible.market.marketId) {
      reasons.push(
        `Nearby destination minimizes road haulage (${highestNet.route.roadDistanceKm} km) and saves produce from transit spoilage.`
      );
    }

    if (highestNet.route.roadDistanceKm > 500) {
      reasons.push(
        `Inter-state transit notice (${highestNet.route.roadDistanceKm} km): High market rates offset travel expenses; coordinate dispatch or cold transport to minimize transit spoilage.`
      );
    }

    if (highestNet.priceRecord) {
      const catLabel = highestNet.priceCategory === 'CATEGORY_A' ? 'Verified quotation' : 'Historical quotation';
      reasons.push(
        `${catLabel}: Modal rate of ₹${highestNet.priceRecord.modalPrice}/Qtl reported on ${highestNet.priceRecord.arrivalDate} (${highestNet.priceRecord.source}).`
      );
    }

    reasons.push(
      `Full lot volume (${quantityQuintals} Qtl) is comfortably within daily yard capacity (${highestNet.market.maxDailyCapacityQuintals} Qtl).`
    );

    highestNet.isRecommended = true;
    highestNet.recommendationReasons = reasons;
  }

  // Assign ranks: sequential numbering
  const rankedEvaluations = filtered.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isRecommended: recommendedMarket?.market.marketId === item.market.marketId,
  }));

  // Enforce pre-render consistency
  auditAndEnforceConsistency(rankedEvaluations);

  return {
    evaluatedMarkets: rankedEvaluations,
    feasibleMarkets: rankedEvaluations.filter((m) => m.isFeasible),
    infeasibleMarkets: rankedEvaluations.filter((m) => !m.isFeasible),
    recommendedMarket,
    closestFeasibleMarket: closestFeasible,
    totalCandidatesFound: uniqueCandidates.length,
    discoveryLevel: nationalDiscovery.discoveryLevel,
    apiErrorCategory: nationalDiscovery.apiErrorCategory,
    apiStatus: getAgmarknetApiStatus(),
    searchSummary: {
      originAddress: farmerLocation.formattedAddress,
      cropName: crop.name,
      consignmentQuintals: quantityQuintals,
      searchRadiusKm: filters.maxDistanceKm || 600,
      timestamp: new Date().toISOString(),
    },
  };
}
