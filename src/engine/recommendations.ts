import {
  MarketCalculationResult,
  ComparisonAnalysis,
  BreakEvenAnalysis,
  GradeDistribution,
} from '../types/agriculture';

function getEffectiveAdvertisedPrice(
  result: MarketCalculationResult,
  grades?: GradeDistribution
): number {
  if (!grades) return result.market.pricesPerQuintal.A;
  const sum = (grades.A || 0) + (grades.B || 0) + (grades.C || 0);
  if (sum === 0) return result.market.pricesPerQuintal.A;
  return Math.round(
    ((grades.A || 0) * result.market.pricesPerQuintal.A +
      (grades.B || 0) * result.market.pricesPerQuintal.B +
      (grades.C || 0) * result.market.pricesPerQuintal.C) /
      sum
  );
}

/**
 * Analyzes the signature dichotomy: Highest Advertised Price vs. Highest Net Return.
 * Produces a transparent, dynamically worded explanation rooted directly in calculated numbers.
 * Strictly guarantees that an infeasible market is NEVER recommended for single-market sale.
 */
export function analyzeHighestPriceVsNetReturn(
  allResults: MarketCalculationResult[],
  feasibleMarkets: MarketCalculationResult[],
  grades?: GradeDistribution
): ComparisonAnalysis | null {
  if (allResults.length === 0) return null;

  // 1. Highest advertised price across all markets (regardless of capacity)
  const highestPriceMarket = [...allResults].sort((a, b) => {
    const priceA = getEffectiveAdvertisedPrice(b, grades);
    const priceB = getEffectiveAdvertisedPrice(a, grades);
    return priceA - priceB;
  })[0];

  // 2. Highest advertised price among FEASIBLE markets
  const highestFeasiblePriceMarket =
    feasibleMarkets.length > 0
      ? [...feasibleMarkets].sort((a, b) => {
          const priceA = getEffectiveAdvertisedPrice(b, grades);
          const priceB = getEffectiveAdvertisedPrice(a, grades);
          return priceA - priceB;
        })[0]
      : null;

  // 3. Highest net return market (ONLY from feasible destinations)
  const hasFeasibleOption = feasibleMarkets.length > 0;
  const highestNetReturnMarket = hasFeasibleOption ? feasibleMarkets[0] : null;

  const totalHarvestQtl = highestPriceMarket.initialQuantityQuintals;
  const hpPrice = getEffectiveAdvertisedPrice(highestPriceMarket, grades);

  // Scenario A: NO feasible market exists
  if (!highestNetReturnMarket) {
    return {
      highestPriceMarket,
      highestNetReturnMarket: null,
      highestFeasiblePriceMarket: null,
      isSameMarket: false,
      hasFeasibleOption: false,
      priceAdvantagePerQuintal: 0,
      netReturnDifferenceTotal: 0,
      warningNotice: `No Single Feasible Market: Complete consignment of ${totalHarvestQtl.toFixed(1)} Qtl cannot be sold in any candidate market.`,
      dynamicExplanation: `None of the candidate markets can purchase your entire harvest of ${totalHarvestQtl.toFixed(1)} Quintals in a single transaction. Even ${highestPriceMarket.market.name} (advertised rate: ₹${hpPrice.toLocaleString('en-IN')}/Qtl) is limited to ${highestPriceMarket.market.maxCapacityQuintals} Quintals. Please reduce consignment volume or activate the Split-Harvest Multi-Route Strategy.`,
    };
  }

  const hnrPrice = getEffectiveAdvertisedPrice(highestNetReturnMarket, grades);
  const isSameMarket = highestPriceMarket.market.id === highestNetReturnMarket.market.id;
  const priceAdvantagePerQuintal = hpPrice - hnrPrice;
  const netReturnDifferenceTotal =
    highestNetReturnMarket.netReturn - highestPriceMarket.netReturn;

  let dynamicExplanation = '';
  let warningNotice: string | undefined;

  // Scenario B: Highest price market is the SAME as the highest net return market
  if (isSameMarket) {
    dynamicExplanation = `Remarkably, ${highestPriceMarket.market.name} offers both the highest advertised produce price (₹${hpPrice.toLocaleString('en-IN')}/Qtl) and yields the highest estimated net return (₹${highestNetReturnMarket.netReturn.toLocaleString('en-IN')}). Its price premium comfortably outweighs transportation expenses and mandi charges.`;
  }
  // Scenario C: Highest price market is INFEASIBLE (e.g. exceeds quota or fails minimum consignment)
  else if (!highestPriceMarket.isFeasible) {
    warningNotice = `Market Purchase Limit: ${highestPriceMarket.market.name} cannot accept your complete consignment!`;
    dynamicExplanation = `${highestPriceMarket.market.name} advertises the highest sticker price of ₹${hpPrice.toLocaleString('en-IN')}/Qtl (₹${Math.abs(priceAdvantagePerQuintal).toLocaleString('en-IN')}/Qtl higher than ${highestNetReturnMarket.market.name}). However, this market accepts only ${highestPriceMarket.market.maxCapacityQuintals} of your ${totalHarvestQtl.toFixed(1)} Quintals. It is not feasible for a single-market sale. In contrast, ${highestNetReturnMarket.market.name} accepts your full harvest and is the most financially beneficial feasible option, delivering ₹${highestNetReturnMarket.netReturn.toLocaleString('en-IN')} in net earnings.`;
  }
  // Scenario D: Both are feasible, but the lower-price market yields higher net in-pocket return!
  else {
    const extraTransport =
      highestPriceMarket.transportationCost - highestNetReturnMarket.transportationCost;
    const extraFees = highestPriceMarket.totalMarketFees - highestNetReturnMarket.totalMarketFees;

    dynamicExplanation = `${highestPriceMarket.market.name} advertises a higher rate of ₹${hpPrice.toLocaleString('en-IN')}/Qtl (versus ₹${hnrPrice.toLocaleString('en-IN')}/Qtl at ${highestNetReturnMarket.market.name}). However, after deducting ₹${highestPriceMarket.transportationCost.toLocaleString('en-IN')} in transport expenses (${highestPriceMarket.market.distanceKm} km haul), ₹${highestPriceMarket.totalMarketFees.toLocaleString('en-IN')} in mandi deductions, and ${highestPriceMarket.estimatedLossPercent}% transit spoilage, ${highestNetReturnMarket.market.name} actually deposits ₹${Math.abs(netReturnDifferenceTotal).toLocaleString('en-IN')} MORE into your pocket (₹${highestNetReturnMarket.netReturn.toLocaleString('en-IN')} vs. ₹${highestPriceMarket.netReturn.toLocaleString('en-IN')}).`;
  }

  return {
    highestPriceMarket,
    highestNetReturnMarket,
    highestFeasiblePriceMarket,
    isSameMarket,
    hasFeasibleOption: true,
    priceAdvantagePerQuintal,
    netReturnDifferenceTotal,
    dynamicExplanation,
    warningNotice,
  };
}

/**
 * Calculates how much a competing market would need to increase its prices
 * to match or surpass the recommended best market.
 */
export function calculateBreakEven(
  bestMarket: MarketCalculationResult,
  competitor: MarketCalculationResult
): BreakEvenAnalysis | null {
  if (bestMarket.market.id === competitor.market.id) return null;
  if (competitor.saleableQuantityQuintals <= 0) return null;

  const currentNetReturnGap = bestMarket.netReturn - competitor.netReturn;
  if (currentNetReturnGap <= 0) return null;

  // Additional revenue needed at competitor market
  const feeRate =
    (competitor.market.commissionFeePercent + competitor.market.marketCessPercent) / 100;
  const effectiveRetainedRatio = Math.max(0.5, 1 - feeRate);

  const requiredPriceIncreasePerQuintal = Math.round(
    currentNetReturnGap / (competitor.saleableQuantityQuintals * effectiveRetainedRatio)
  );

  const basePrice = competitor.averagePricePerQuintalSold || competitor.market.pricesPerQuintal.A;
  const requiredPricePercentageIncrease = Number(
    ((requiredPriceIncreasePerQuintal / basePrice) * 100).toFixed(1)
  );

  return {
    targetMarketName: competitor.market.name,
    bestMarketName: bestMarket.market.name,
    currentNetReturnGap,
    requiredPriceIncreasePerQuintal,
    requiredPricePercentageIncrease,
    isAchievableScenario: requiredPricePercentageIncrease <= 25,
  };
}
