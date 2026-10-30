import { SimulatedMarket, CropProfile } from '../types/agriculture';

export interface BaseMarketTemplate {
  id: string;
  name: string;
  locationName: string;
  distanceKm: number;
  avgRoadSpeedKmh: number;
  maxCapacityQuintals: number;
  minPurchaseQuintals?: number;
  commissionFeePercent: number; // APMC or broker commission %
  marketCessPercent: number; // state agricultural cess %
  handlingChargePerQuintal: number; // labor / unloading charge per quintal (₹)
  fixedEntryFee: number; // gate entry / weighbridge fee (₹)
  typicalWaitTimeHours: number; // unloading and auction wait time
  description: string;
  specialtyTag?: string;
  priceMultipliers: {
    A: number;
    B: number;
    C: number;
  };
}

export const BASE_MARKETS: BaseMarketTemplate[] = [
  {
    id: 'kisan-gramin',
    name: 'Kisan Gramin Sub-Mandi',
    locationName: 'Navalgund Rural Gate (Nearby)',
    distanceKm: 18,
    avgRoadSpeedKmh: 35,
    maxCapacityQuintals: 100,
    minPurchaseQuintals: 1,
    commissionFeePercent: 1.0, // Low local commission
    marketCessPercent: 0.5,
    handlingChargePerQuintal: 15,
    fixedEntryFee: 50,
    typicalWaitTimeHours: 1.0,
    description: 'Local rural assembly mandi with swift transactions, low handling overhead, and immediate payment.',
    specialtyTag: 'Nearby & Low Cost',
    priceMultipliers: { A: 0.92, B: 0.90, C: 0.88 },
  },
  {
    id: 'metro-wholesale',
    name: 'Metro Grand Terminal Wholesale',
    locationName: 'Bengaluru Agro-Logistics Yard (Metro)',
    distanceKm: 165,
    avgRoadSpeedKmh: 48,
    maxCapacityQuintals: 300,
    minPurchaseQuintals: 5,
    commissionFeePercent: 2.5,
    marketCessPercent: 1.5,
    handlingChargePerQuintal: 35,
    fixedEntryFee: 250,
    typicalWaitTimeHours: 4.5,
    description: 'Tier-1 metropolitan wholesale hub. Advertises top sticker prices but entails higher transit, fuel, tolls, and wait times.',
    specialtyTag: 'High Advertised Price',
    priceMultipliers: { A: 1.22, B: 1.08, C: 0.90 },
  },
  {
    id: 'sahyadri-boutique',
    name: 'Sahyadri Agro-Export Hub',
    locationName: 'Western Ghats Export Zone',
    distanceKm: 85,
    avgRoadSpeedKmh: 42,
    maxCapacityQuintals: 12, // Small capacity! Ideal for capacity limit testing
    minPurchaseQuintals: 2,
    commissionFeePercent: 3.0,
    marketCessPercent: 1.0,
    handlingChargePerQuintal: 40,
    fixedEntryFee: 150,
    typicalWaitTimeHours: 2.0,
    description: 'Boutique aggregator paying premium prices for highest quality, but operates with strict micro-quotas (Max 12 Quintals).',
    specialtyTag: 'Premium Price / Strict Quota',
    priceMultipliers: { A: 1.35, B: 0.95, C: 0.65 },
  },
  {
    id: 'central-apmc',
    name: 'Central Agri-Terminal APMC',
    locationName: 'District Headquarters APMC Yard',
    distanceKm: 72,
    avgRoadSpeedKmh: 45,
    maxCapacityQuintals: 500,
    minPurchaseQuintals: 2,
    commissionFeePercent: 2.0,
    marketCessPercent: 1.0,
    handlingChargePerQuintal: 25,
    fixedEntryFee: 120,
    typicalWaitTimeHours: 3.0,
    description: 'Large state-regulated APMC with massive daily absorptive capacity, dependable liquidity, and standardized electronic weighbridges.',
    specialtyTag: 'High Volume Liquid Hub',
    priceMultipliers: { A: 1.06, B: 1.00, C: 0.92 },
  },
  {
    id: 'sunrise-super',
    name: 'Sunrise Super-Grade Mandi',
    locationName: 'Valley Highway Corridor',
    distanceKm: 58,
    avgRoadSpeedKmh: 42,
    maxCapacityQuintals: 160,
    minPurchaseQuintals: 3,
    commissionFeePercent: 1.8,
    marketCessPercent: 0.8,
    handlingChargePerQuintal: 28,
    fixedEntryFee: 100,
    typicalWaitTimeHours: 2.5,
    description: 'Wholesale mandi serving premium retail and modern trade chains; heavy price premium on pristine Grade A produce.',
    specialtyTag: 'Grade A Premium',
    priceMultipliers: { A: 1.18, B: 0.92, C: 0.72 },
  },
  {
    id: 'deccan-processing',
    name: 'Deccan Food Processing Cluster',
    locationName: 'Industrial Growth Centre Sector 4',
    distanceKm: 46,
    avgRoadSpeedKmh: 40,
    maxCapacityQuintals: 180,
    minPurchaseQuintals: 5,
    commissionFeePercent: 1.2,
    marketCessPercent: 0.5,
    handlingChargePerQuintal: 20,
    fixedEntryFee: 80,
    typicalWaitTimeHours: 1.8,
    description: 'Industrial food canning and processing hub. Values uniform dry matter or bulk over cosmetic perfection; pays top rates for Grade B & C.',
    specialtyTag: 'Best for Grade B/C',
    priceMultipliers: { A: 1.00, B: 1.04, C: 1.06 },
  },
  {
    id: 'taluka-coop',
    name: 'Taluka Farmers Sahakari Bazaar',
    locationName: 'Sub-Divisional Cooperative Mandi',
    distanceKm: 34,
    avgRoadSpeedKmh: 38,
    maxCapacityQuintals: 90,
    minPurchaseQuintals: 1,
    commissionFeePercent: 0.5, // Ultra low coop fee
    marketCessPercent: 0.5,
    handlingChargePerQuintal: 18,
    fixedEntryFee: 40,
    typicalWaitTimeHours: 1.2,
    description: 'Farmer-owned cooperative marketplace with subsidized handling charges and minimum statutory commission deductions.',
    specialtyTag: 'Low Deductions & Fast Turnaround',
    priceMultipliers: { A: 0.96, B: 0.95, C: 0.91 },
  },
  {
    id: 'national-logistics',
    name: 'National Multimodal Grain & Produce Terminal',
    locationName: 'Interstate Freight Junction',
    distanceKm: 135,
    avgRoadSpeedKmh: 52,
    maxCapacityQuintals: 650,
    minPurchaseQuintals: 25, // High minimum purchase limit!
    commissionFeePercent: 1.5,
    marketCessPercent: 1.0,
    handlingChargePerQuintal: 22,
    fixedEntryFee: 200,
    typicalWaitTimeHours: 3.5,
    description: 'Large-scale multimodal rail and road terminal. Designed for large consignments (Min 25 Quintals), offering strong wholesale economies.',
    specialtyTag: 'Bulk Consignment Hub (Min 25 Qtl)',
    priceMultipliers: { A: 1.10, B: 1.02, C: 0.88 },
  },
];

/**
 * Generates realistic simulated market records tailored to the specific crop.
 * Computes prices for Grade A, B, and C based on the crop's typical price range
 * and the market's specific economic profile.
 */
export function getSimulatedMarketsForCrop(crop: CropProfile): SimulatedMarket[] {
  const baseMidPrice = (crop.typicalMarketPriceRange.min + crop.typicalMarketPriceRange.max) / 2;

  return BASE_MARKETS.map((m) => {
    const travelTime = Number((m.distanceKm / m.avgRoadSpeedKmh).toFixed(1));

    // Base price per quintal for each grade
    // Grade A is baseline * 1.05
    // Grade B is baseline * 0.88
    // Grade C is baseline * 0.72
    const gradeABase = Math.round(baseMidPrice * 1.05);
    const gradeBBase = Math.round(baseMidPrice * 0.88);
    const gradeCBase = Math.round(baseMidPrice * 0.72);

    const priceA = Math.round(gradeABase * m.priceMultipliers.A);
    const priceB = Math.round(gradeBBase * m.priceMultipliers.B);
    const priceC = Math.round(gradeCBase * m.priceMultipliers.C);

    return {
      id: m.id,
      name: m.name,
      locationName: m.locationName,
      distanceKm: m.distanceKm,
      estimatedTravelTimeHours: travelTime,
      avgRoadSpeedKmh: m.avgRoadSpeedKmh,
      maxCapacityQuintals: m.maxCapacityQuintals,
      minPurchaseQuintals: m.minPurchaseQuintals,
      pricesPerQuintal: {
        A: priceA,
        B: priceB,
        C: priceC,
      },
      commissionFeePercent: m.commissionFeePercent,
      marketCessPercent: m.marketCessPercent,
      handlingChargePerQuintal: m.handlingChargePerQuintal,
      fixedEntryFee: m.fixedEntryFee,
      typicalWaitTimeHours: m.typicalWaitTimeHours,
      description: m.description,
      specialtyTag: m.specialtyTag,
      simulatedFlag: true,
    };
  });
}

