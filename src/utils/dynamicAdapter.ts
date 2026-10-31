import { MarketCalculationResult } from '../types/agriculture';
import { DynamicMandiEvaluation } from '../types/marketDiscovery';

/**
 * Adapts a Phase 5 DynamicMandiEvaluation into a Phase 1-4 MarketCalculationResult
 * so that existing modals, waterfall charts, and reports can seamlessly inspect it.
 */
export function convertDynamicToMarketCalculationResult(
  evalItem: DynamicMandiEvaluation
): MarketCalculationResult {
  const price = evalItem.priceRecord?.modalPrice || 0;
  const gradeAPrice = price;
  const gradeBPrice = Math.round(price * 0.88);
  const gradeCPrice = Math.round(price * 0.72);

  return {
    market: {
      id: evalItem.market.marketId,
      name: evalItem.market.marketName,
      locationName: `${evalItem.market.district}, ${evalItem.market.state}`,
      distanceKm: evalItem.route.roadDistanceKm,
      estimatedTravelTimeHours: evalItem.route.estimatedTravelTimeHours,
      avgRoadSpeedKmh: 45,
      maxCapacityQuintals: evalItem.market.maxDailyCapacityQuintals,
      minPurchaseQuintals: evalItem.market.minPurchaseQuintals,
      pricesPerQuintal: { A: gradeAPrice, B: gradeBPrice, C: gradeCPrice },
      commissionFeePercent: evalItem.market.commissionPercent,
      marketCessPercent: evalItem.market.cessPercent,
      handlingChargePerQuintal: evalItem.market.handlingChargePerQuintal,
      fixedEntryFee: evalItem.market.fixedEntryFee,
      typicalWaitTimeHours: evalItem.market.typicalWaitHours,
      description: `Regulated APMC wholesale yard in ${evalItem.market.district}. Data source: ${
        evalItem.priceRecord?.source || 'APMC Daily Arrivals'
      }${evalItem.priceRecord?.arrivalDate ? ` (Arrival: ${evalItem.priceRecord.arrivalDate})` : ''}${
        evalItem.priceRecord?.sourceUrl ? ` • URL: ${evalItem.priceRecord.sourceUrl}` : ''
      } • Status: ${evalItem.internalPriceStatus || 'VERIFIED QUOTE'}`,
      simulatedFlag: true,
    },
    initialQuantityQuintals: evalItem.consignmentQuintals,
    gradeQuantities: {
      A: evalItem.consignmentQuintals * 0.5,
      B: evalItem.consignmentQuintals * 0.35,
      C: evalItem.consignmentQuintals * 0.15,
    },
    estimatedLossPercent: evalItem.spoilagePercent,
    physicalLossQuintals: evalItem.spoilageLossQuintals,
    saleableQuantityQuintals: evalItem.saleableQuintals,
    gradeSaleableQuantities: {
      A: evalItem.saleableQuintals * 0.5,
      B: evalItem.saleableQuintals * 0.35,
      C: evalItem.saleableQuintals * 0.15,
    },
    downgradedQuintalsAtoB: 0,
    downgradedQuintalsBtoC: 0,
    grossRevenue: evalItem.grossRevenue,
    gradeRevenue: {
      A: Math.round(evalItem.grossRevenue * 0.5),
      B: Math.round(evalItem.grossRevenue * 0.35),
      C: Math.round(evalItem.grossRevenue * 0.15),
    },
    transportationCost: evalItem.transportCost,
    transportTrips: evalItem.transportTrips,
    marketCommissionFee: Math.round(
      (evalItem.market.commissionPercent / 100) * evalItem.grossRevenue
    ),
    marketCessFee: Math.round((evalItem.market.cessPercent / 100) * evalItem.grossRevenue),
    marketHandlingFee: evalItem.handlingCharges,
    marketFixedFee: evalItem.market.fixedEntryFee,
    totalMarketFees: evalItem.marketFees,
    otherSellingExpenses: 0,
    totalExpenses: evalItem.totalSellingCosts,
    netReturn: evalItem.netSellingRevenue,
    netReturnPerQuintal: evalItem.netRevenuePerQuintal,
    isFeasible: evalItem.isFeasible,
    feasibilityReasons: evalItem.infeasibilityReasons,
    capacityUtilizationPercent:
      evalItem.market.maxDailyCapacityQuintals > 0
        ? Math.round(
            (evalItem.consignmentQuintals / evalItem.market.maxDailyCapacityQuintals) * 100
          )
        : 100,
    averagePricePerQuintalSold: price,
  };
}
