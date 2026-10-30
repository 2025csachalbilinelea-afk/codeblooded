export type CropCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'pulses'
  | 'spices'
  | 'other';

export type PerishabilityClass = 1 | 2 | 3 | 4;

export type QuantityUnit = 'kg' | 'quintal' | 'tonne';

export type Grade = 'A' | 'B' | 'C';

export interface GradeDistribution {
  A: number; // percentage 0-100
  B: number;
  C: number;
}

export type MaturityFreshness =
  | 'early'
  | 'optimal'
  | 'ripe'
  | 'overripe'
  | 'dry_stored';

export interface CropProfile {
  id: string;
  name: string;
  category: CropCategory;
  perishabilityClass: PerishabilityClass;
  supportedGrades: Grade[];
  defaultGradeDistribution: GradeDistribution;
  baseDeteriorationRatePerHour: number; // % loss per hour under normal conditions
  defaultFreshness: MaturityFreshness;
  standardUnit: QuantityUnit;
  typicalMarketPriceRange: {
    min: number;
    max: number;
  };
  description: string;
  storageNotes: string;
}

export type SpoilageMode = 'manual' | 'automatic';

export type TemperatureScenario = 'mild' | 'warm' | 'hot';

export type VehicleProtection = 'open' | 'covered' | 'refrigerated';

export type HandlingQuality = 'gentle' | 'standard' | 'rough';

export interface SpoilageInputs {
  mode: SpoilageMode;
  manualPercentage: number;
  temperature: TemperatureScenario;
  vehicleProtection: VehicleProtection;
  handling: HandlingQuality;
  delayHours: number; // Waiting time at farm / transit
}

export type TransportType = 'own' | 'rented';

export interface OwnVehicleConfig {
  capacityQuintals: number;
  mileageKmPerLitre: number;
  fuelPricePerLitre: number;
  maintenancePerKm: number;
  driverCostPerTrip: number;
  tollAndOtherExpenses: number;
  returnTripRequired: boolean;
}

export interface RentedVehicleConfig {
  rentalQuotationPerTrip: number;
  capacityQuintals: number;
  additionalChargesPerTrip: number; // loading, unloading, permits
  rentalModel?: 'distance_scaled' | 'flat'; // default distance_scaled
}

export interface TransportConfig {
  type: TransportType;
  ownVehicle: OwnVehicleConfig;
  rentedVehicle: RentedVehicleConfig;
}

export interface SimulatedMarket {
  id: string;
  name: string;
  locationName: string;
  distanceKm: number;
  estimatedTravelTimeHours: number;
  avgRoadSpeedKmh: number;
  maxCapacityQuintals: number;
  minPurchaseQuintals?: number;
  pricesPerQuintal: Record<Grade, number>;
  commissionFeePercent: number; // e.g. 2% of gross sales
  marketCessPercent: number; // e.g. 1%
  handlingChargePerQuintal: number; // in INR
  fixedEntryFee: number; // in INR
  typicalWaitTimeHours: number;
  description: string;
  specialtyTag?: string;
  simulatedFlag: true;
}

export interface FarmerInputs {
  cropId: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  harvestDate: string;
  maturity: MaturityFreshness;
  originLocation: string;
  gradeDistribution: GradeDistribution;
  spoilage: SpoilageInputs;
  transport: TransportConfig;
}

export interface MarketCalculationResult {
  market: SimulatedMarket;
  initialQuantityQuintals: number;
  gradeQuantities: Record<Grade, number>;
  estimatedLossPercent: number;
  physicalLossQuintals: number;
  saleableQuantityQuintals: number;
  gradeSaleableQuantities: Record<Grade, number>;
  downgradedQuintalsAtoB: number;
  downgradedQuintalsBtoC: number;
  grossRevenue: number;
  gradeRevenue: Record<Grade, number>;
  transportationCost: number;
  transportTrips: number;
  marketCommissionFee: number;
  marketCessFee: number;
  marketHandlingFee: number;
  marketFixedFee: number;
  totalMarketFees: number;
  otherSellingExpenses: number;
  totalExpenses: number;
  netReturn: number;
  netReturnPerQuintal: number;
  isFeasible: boolean;
  feasibilityReasons: string[];
  capacityUtilizationPercent: number;
  averagePricePerQuintalSold: number;
}

export interface ComparisonAnalysis {
  highestPriceMarket: MarketCalculationResult;
  highestNetReturnMarket: MarketCalculationResult | null;
  highestFeasiblePriceMarket?: MarketCalculationResult | null;
  isSameMarket: boolean;
  hasFeasibleOption: boolean;
  priceAdvantagePerQuintal: number;
  netReturnDifferenceTotal: number;
  dynamicExplanation: string;
  warningNotice?: string;
}

export interface BreakEvenAnalysis {
  targetMarketName: string;
  bestMarketName: string;
  currentNetReturnGap: number;
  requiredPriceIncreasePerQuintal: number;
  requiredPricePercentageIncrease: number;
  isAchievableScenario: boolean;
}

export interface SplitHarvestAllocation {
  market: SimulatedMarket;
  allocatedQuintals: number;
  saleableQuintals: number;
  grossRevenue: number;
  transportCost: number;
  marketFees: number;
  netReturn: number;
}

export interface SplitHarvestResult {
  allocations: SplitHarvestAllocation[];
  totalAllocatedQuintals: number;
  totalSaleableQuintals: number;
  totalNetReturn: number;
  singleBestNetReturn: number;
  netGainFromSplitting: number;
  isSplitAdvantageous: boolean;
  explanation: string;
}
