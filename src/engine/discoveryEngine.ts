/**
 * HARVESTROUTE PHASE 5: DYNAMIC MANDI DISCOVERY & PROFIT OPTIMIZATION ENGINE
 * Integrates real road distance (OSRM), AGMARKNET wholesale prices, vehicle economics,
 * and physical spoilage to rank agricultural mandis across India by estimated net selling revenue.
 */

import { CropProfile, MaturityFreshness, SpoilageInputs, TransportConfig } from '../types/agriculture';
import {
  DynamicMandiEvaluation,
  FarmerLocation,
  MandiFilterOptions,
  MandiSortOption,
  NationalMarket,
  RoadRouteResult,
} from '../types/marketDiscovery';
import { discoverNearbyNationalMandis } from '../data/nationalMandis';
import { getMarketPriceForCommodity } from '../services/agmarknetService';
import { calculateRoadRoute } from '../services/routingService';
import { calculateTransportationCost } from './transport';
import { calculateSpoilagePercentage } from './spoilage';

export interface DiscoveryEngineResult {
  evaluatedMarkets: DynamicMandiEvaluation[];
  feasibleMarkets: DynamicMandiEvaluation[];
  infeasibleMarkets: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  closestFeasibleMarket: DynamicMandiEvaluation | null;
  totalCandidatesFound: number;
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
  transport: TransportConfig
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

  // Feasibility Check 2: Price availability
  const modalPrice = (priceRecord as any)?.modalPrice ?? 0;
  if (!priceRecord || modalPrice <= 0) {
    infeasibilityReasons.push(
      'Daily wholesale price currently unavailable for this crop at this mandi.'
    );
  }

  // Calculate Spoilage
  const spoilageCalc = calculateSpoilagePercentage(
    crop,
    spoilage,
    route.estimatedTravelTimeHours,
    market.typicalWaitHours,
    maturity
  );
  const spoilagePercent = spoilageCalc.lossPercentage;
  const spoilageLossQuintals = Math.round(((quantityQuintals * spoilagePercent) / 100) * 100) / 100;
  const saleableQuintals = Math.max(0, Math.round((quantityQuintals - spoilageLossQuintals) * 100) / 100);

  // Calculate Gross Revenue
  const grossRevenue = Math.round(saleableQuintals * modalPrice);

  // Calculate Transport Costs using authentic road distance
  const transportCalc = calculateTransportationCost(transport, route.roadDistanceKm, quantityQuintals);
  const transportCost = transportCalc.totalCost;
  const transportTrips = transportCalc.tripsCount;

  if (!transportCalc.isFeasible && transportCalc.feasibilityReason) {
    infeasibilityReasons.push(transportCalc.feasibilityReason);
  }

  // Calculate Mandi Fees & Charges
  const commissionFee = Math.round((market.commissionPercent / 100) * grossRevenue);
  const cessFee = Math.round((market.cessPercent / 100) * grossRevenue);
  const handlingFee = Math.round(market.handlingChargePerQuintal * saleableQuintals);
  const totalMarketFees = commissionFee + cessFee + handlingFee + market.fixedEntryFee;

  // Calculate Total Selling Costs and Net Revenue
  const totalSellingCosts = transportCost + totalMarketFees;
  const netSellingRevenue = grossRevenue - totalSellingCosts;
  const netRevenuePerQuintal = quantityQuintals > 0 ? Math.round(netSellingRevenue / quantityQuintals) : 0;

  const isFeasible = infeasibilityReasons.length === 0;

  return {
    market,
    priceRecord: priceRecord as any,
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
  }
): Promise<DiscoveryEngineResult> {
  const sortOption = options?.sortOption || 'netRevenue';
  const filters = options?.filters || {};

  // 1. Discover Candidate Mandis near farmer
  const candidateMandis = discoverNearbyNationalMandis(
    farmerLocation.latitude,
    farmerLocation.longitude,
    crop.id,
    { targetCount: 12, maxRadiusKm: filters.maxDistanceKm || 1200 }
  );

  // 2. Fetch routes and market prices in parallel
  const evaluationPromises = candidateMandis.map(async ({ market }) => {
    // Route calculation (OSRM with caching)
    const route = await calculateRoadRoute(
      farmerLocation.latitude,
      farmerLocation.longitude,
      market.latitude,
      market.longitude
    );

    // AGMARKNET Price calculation (Live + Cached + Verified Benchmarks)
    const priceRecord = await getMarketPriceForCommodity(
      market.marketId,
      market.marketName,
      market.state,
      market.district,
      crop.name,
      options?.apiKey
    );

    return evaluateMarketCandidate(
      market,
      route,
      priceRecord,
      crop,
      quantityQuintals,
      spoilage,
      maturity,
      transport
    );
  });

  const rawEvaluations = await Promise.all(evaluationPromises);

  // 3. Identify Reference Baseline (closest feasible market by road distance)
  const feasibleOnly = rawEvaluations.filter((m) => m.isFeasible);
  const closestFeasible =
    feasibleOnly.length > 0
      ? [...feasibleOnly].sort((a, b) => a.route.roadDistanceKm - b.route.roadDistanceKm)[0]
      : null;

  // 4. Calculate additional earnings over closest local reference
  const evaluatedWithEarnings = rawEvaluations.map((evalItem) => {
    const baselineNet = closestFeasible ? closestFeasible.netSellingRevenue : 0;
    const additional = evalItem.isFeasible ? evalItem.netSellingRevenue - baselineNet : 0;
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
    if (filters.minFreshness && filters.minFreshness !== 'ALL') {
      const status = item.priceRecord?.freshnessStatus;
      if (filters.minFreshness === 'CURRENT' && status !== 'CURRENT') return false;
      if (filters.minFreshness === 'RECENT' && status !== 'CURRENT' && status !== 'RECENT') return false;
    }
    return true;
  });

  // 6. Sort Candidates
  filtered.sort((a, b) => {
    // Keep feasible ahead of infeasible
    if (a.isFeasible !== b.isFeasible) {
      return a.isFeasible ? -1 : 1;
    }

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
  const feasibleList = filtered.filter((m) => m.isFeasible);
  const infeasibleList = filtered.filter((m) => !m.isFeasible);

  let recommendedMarket: DynamicMandiEvaluation | null = null;

  // The recommended market is the feasible market with the highest net selling revenue
  if (feasibleList.length > 0) {
    const highestNet = [...feasibleList].sort((a, b) => b.netSellingRevenue - a.netSellingRevenue)[0];
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

    if (highestNet.priceRecord) {
      reasons.push(
        `Verified modal rate of ₹${highestNet.priceRecord.modalPrice}/Qtl reported on ${highestNet.priceRecord.arrivalDate} (${highestNet.priceRecord.source}).`
      );
    }

    reasons.push(
      `Full lot volume (${quantityQuintals} Qtl) is comfortably within daily yard capacity (${highestNet.market.maxDailyCapacityQuintals} Qtl).`
    );

    highestNet.isRecommended = true;
    highestNet.recommendationReasons = reasons;
  }

  // Assign ranks
  const rankedEvaluations = filtered.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isRecommended: recommendedMarket?.market.marketId === item.market.marketId,
  }));

  return {
    evaluatedMarkets: rankedEvaluations,
    feasibleMarkets: rankedEvaluations.filter((m) => m.isFeasible),
    infeasibleMarkets: rankedEvaluations.filter((m) => !m.isFeasible),
    recommendedMarket,
    closestFeasibleMarket: closestFeasible,
    totalCandidatesFound: candidateMandis.length,
    searchSummary: {
      originAddress: farmerLocation.formattedAddress,
      cropName: crop.name,
      consignmentQuintals: quantityQuintals,
      searchRadiusKm: filters.maxDistanceKm || 600,
      timestamp: new Date().toISOString(),
    },
  };
}

