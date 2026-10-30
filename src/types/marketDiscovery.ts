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

export type PriceFreshnessStatus = 'CURRENT' | 'RECENT' | 'STALE' | 'UNAVAILABLE';

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
  retrievedAt: string; // ISO timestamp
  freshnessStatus: PriceFreshnessStatus;
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

export type RoutingStatus = 'ROUTED' | 'FALLBACK_UNAVAILABLE';

export interface RoadRouteResult {
  roadDistanceKm: number;
  estimatedTravelTimeHours: number;
  routingStatus: RoutingStatus;
  routeSource: 'OSRM' | 'FALLBACK_UNAVAILABLE';
  straightLineDistanceKm: number;
  cached?: boolean;
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

