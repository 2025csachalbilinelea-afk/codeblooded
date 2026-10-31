/**
 * HARVESTROUTE PHASE 5: DYNAMIC MARKET DISCOVERY & PRICE INTEGRATION TYPES
 * Domain models for GPS/manual geocoding, AGMARKNET daily arrivals,
 * OSRM road routing, and dynamic profit optimization across Indian Mandis.
 */

export type LocationMethod = 'gps' | 'manual' | 'preset';

export interface FarmerLocation {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  villageOrTown: string;
  pincode?: string;
  formattedAddress: string;
  method: LocationMethod;
  accuracyMeters?: number;
  timestamp: string;
}

export type DiscoveryLevel = 'NEARBY' | 'REGIONAL' | 'NATIONAL';
export type ApiErrorCategory =
  | 'AUTH_FAILURE'
  | 'RATE_LIMITED'
  | 'TAVILY_AUTH_FAILURE'
  | 'TAVILY_RATE_LIMITED'
  | 'TAVILY_API_ERROR'
  | 'NETWORK_UNREACHABLE'
  | 'TIMEOUT'
  | 'NO_LIVE_RECORDS'
  | 'SEARCH_API_NOT_CONFIGURED';

export type PriceCategory = 'CATEGORY_A' | 'CATEGORY_B' | 'CATEGORY_C' | 'UNAVAILABLE';

export type InternalPriceStatus =
  | 'LIVE OFFICIAL QUOTE'
  | 'HISTORICAL OFFICIAL QUOTE'
  | 'WEB-DISCOVERED PRICE'
  | 'REGIONAL REFERENCE PRICE'
  | 'PRICE UNAVAILABLE';

export type PriceFreshnessStatus = 'CURRENT' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
export type PriceSourceType =
  | 'LIVE'
  | 'HISTORICAL'
  | 'NEARBY_REFERENCE'
  | 'REGIONAL_BENCHMARK'
  | 'FARMER_EXPECTED'
  | 'CACHED'
  | 'SAMPLE'
  | 'UNAVAILABLE'
  | 'WEB_DISCOVERED';

export type ConfidenceIndicator = 'HIGH' | 'MEDIUM' | 'LOW' | 'ESTIMATE';

export interface MarketPriceRecord {
  marketId: string;
  marketName: string;
  state: string;
  district: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string; // ISO date string (YYYY-MM-DD)
  minPrice: number;    // INR per Quintal
  maxPrice: number;    // INR per Quintal
  modalPrice: number;  // INR per Quintal (modal wholesale price)
  priceUnit: 'INR/Quintal';
  source: string;      // e.g. "Data.gov.in (AGMARKNET)", "e-NAM", "APMC Bulletin"
  sourceUrl?: string;  // Web discovery source link / API resource URL
  retrievedAt: string; // ISO timestamp
  freshnessStatus: PriceFreshnessStatus;
  priceSourceType?: PriceSourceType;
  priceCategory?: PriceCategory;
  internalPriceStatus?: InternalPriceStatus;
  confidenceIndicator?: ConfidenceIndicator;
  attributedMarketName?: string;
  attributedDistanceKm?: number;
  fallbackTier?: 1 | 2 | 3 | 4 | 5;
  isSampleData?: boolean;
}

export interface NationalMarket {
  marketId: string;
  marketName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  source: string;
  sourceMarketIdentifier: string; // APMC yard registration code
  lastVerifiedAt: string;
  supportedCommodities: string[];
  maxDailyCapacityQuintals: number;
  minPurchaseQuintals: number;
  commissionPercent: number;      // Mandi commission (e.g. 1.5 - 2.5%)
  cessPercent: number;            // APMC market cess (e.g. 0.5 - 1.5%)
  handlingChargePerQuintal: number; // Hamali / labor charge (₹/Qtl)
  fixedEntryFee: number;          // Gate entry/toll (₹)
  typicalWaitHours: number;       // Average auction queue time
}

export type RoutingStatus = 'ROUTED' | 'UNAVAILABLE' | 'FALLBACK_UNAVAILABLE';

export interface RoadRouteResult {
  roadDistanceKm: number;
  estimatedTravelTimeHours: number;
  routingStatus: RoutingStatus;
  routeSource: 'OSRM' | 'VERIFIED_NETWORK' | 'CACHED' | 'FALLBACK_UNAVAILABLE' | 'UNAVAILABLE';
  straightLineDistanceKm: number;
  cached?: boolean;
  isDistanceVerified?: boolean;
}

export interface DynamicMandiEvaluation {
  market: NationalMarket;
  priceRecord: MarketPriceRecord | null;
  route: RoadRouteResult;
  consignmentQuintals: number;
  saleableQuintals: number;
  spoilagePercent: number;
  spoilageLossQuintals: number;
  grossRevenue: number;
  transportCost: number;
  transportTrips: number;
  marketFees: number;
  handlingCharges: number;
  totalSellingCosts: number;
  netSellingRevenue: number;
  netRevenuePerQuintal: number;
  additionalEarnings: number; // Differential gain vs closest mandi
  isFeasible: boolean;
  infeasibilityReasons: string[];
  rank: number;
  isRecommended: boolean;
  recommendationReasons: string[];
  hasVerifiedPrice: boolean;
  priceSourceType: PriceSourceType;
  priceCategory?: PriceCategory;
  internalPriceStatus?: InternalPriceStatus;
  sourceUrl?: string;
  confidenceIndicator?: ConfidenceIndicator;
  attributedMarketName?: string;
  attributedDistanceKm?: number;
  fallbackTier?: 1 | 2 | 3 | 4 | 5;
  isDistanceVerified: boolean;
  forecast?: CropPriceForecastResult | null;
}

export interface PriceSyncLog {
  id: string;
  timestamp: string;
  endpoint: string;
  recordsCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errorMessage?: string;
  lastSuccessfulSync?: string;
}

export type MandiSortOption =
  | 'netRevenue'      // Highest estimated net revenue (default)
  | 'cropPrice'       // Highest reported crop price
  | 'roadDistance'    // Shortest road distance
  | 'transportCost';  // Lowest transportation expense

export interface MandiFilterOptions {
  state?: string;
  district?: string;
  maxDistanceKm?: number;
  minFreshness?: PriceFreshnessStatus | 'ALL';
  onlyFeasible?: boolean;
}

// ============================================================================
// PHASE 5B: AGRICULTURAL ML PRICE FORECASTING & DECISION MODELS
// ============================================================================

export interface HistoricalPriceRecord {
  date: string; // YYYY-MM-DD
  crop: string;
  variety: string;
  marketId: string;
  marketName: string;
  district: string;
  state: string;
  modalPrice: number; // INR/Quintal
  minPrice: number;   // INR/Quintal
  maxPrice: number;   // INR/Quintal
  arrivalQuantityQuintals?: number;
  source: string;
}

export interface WeatherObservation {
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  temperatureMaxC: number;
  temperatureMinC: number;
  temperatureMeanC: number;
  precipitationMm: number;
  relativeHumidityPercent?: number;
}

export type ForecastTrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING';

export interface HorizonForecast {
  horizonDays: 3 | 7 | 14;
  targetDate: string; // YYYY-MM-DD
  predictedPrice: number; // Modal price prediction INR/Quintal
  minConfidencePrice: number; // 80% CI Lower bound INR/Quintal
  maxConfidencePrice: number; // 80% CI Upper bound INR/Quintal
  confidenceIntervalPercent: number; // e.g. 80%
  trendDirection: ForecastTrendDirection;
  priceDeltaVsCurrent: number; // predicted - latestActual
  percentageDeltaVsCurrent: number; // % change
}

export interface CropPriceForecastResult {
  available: boolean;
  unavailabilityReason?: string;
  marketId: string;
  marketName: string;
  commodity: string;
  variety: string;
  latestActualPrice: number;
  latestArrivalDate: string;
  forecasts: {
    d3: HorizonForecast;
    d7: HorizonForecast;
    d14: HorizonForecast;
  };
  historicalPoints?: Array<{
    date: string;
    modalPrice: number;
    arrivalQuantity?: number;
  }>;
  modelVersion: string;
  modelAlgorithm: 'XGBoostRegressor' | 'BaselineMovingAverage' | 'BaselineLastObserved';
  evaluationMetrics?: {
    horizon3dMae: number;
    horizon7dMae: number;
    horizon14dMae: number;
    sMapePercent: number;
  };
  generatedAt: string;
  freshnessStatus: PriceFreshnessStatus;
  isExperimental?: boolean;
}

export type SellDecision = 'OPTIMAL' | 'ACCEPTABLE' | 'RISKY' | 'NOT_RECOMMENDED';

export interface SellNowVsLaterOption {
  horizonDays: 0 | 3 | 7 | 14;
  title: string;
  targetDate: string;
  pricePerQuintal: number;
  priceRange: [number, number]; // [minConfidence, maxConfidence]
  saleableQuintals: number;
  spoilageLossQuintals: number;
  spoilagePercent: number;
  grossRevenue: number;
  transportCost: number;
  storageCost: number; // ₹
  handlingCost: number; // ₹
  mandiFees: number;    // ₹
  totalDeductions: number;
  netRevenue: number; // Expected Net Take-Home ₹
  netRevenueRange: [number, number]; // [worstCaseNet, bestCaseNet]
  netGainVsSellNow: number; // Delta vs day 0 Net Take-Home (₹)
  netGainPercent: number;
  decision: SellDecision;
  riskFactors: string[];
}

export interface SellNowVsLaterComparison {
  cropId: string;
  cropName: string;
  harvestQuantityQuintals: number;
  marketId: string;
  marketName: string;
  perishabilityClass: number;
  perishabilityWarning?: string;
  options: SellNowVsLaterOption[];
  recommendedWindowDays: number;
  summaryGuidance: string;
  storageAssumptions: {
    dailyStorageRatePerQuintal: number;
    storageType: string;
    dailyDeteriorationRatePercent: number;
  };
}

export interface MLModelEvaluationReport {
  crop: string;
  marketId: string;
  testSamples: number;
  horizon3d: { mae: number; rmse: number; smape: number; baselineMae: number; errorReductionPercent: number };
  horizon7d: { mae: number; rmse: number; smape: number; baselineMae: number; errorReductionPercent: number };
  horizon14d: { mae: number; rmse: number; smape: number; baselineMae: number; errorReductionPercent: number };
}
