import {
  FarmerInputs,
  SimulatedMarket,
  CropProfile,
  MarketCalculationResult,
  Grade,
} from '../types/agriculture';
import { convertToQuintals } from './units';
import { calculateSpoilagePercentage } from './spoilage';
import { calculateTransportationCost } from './transport';
import { calculateMarketFees } from './marketFees';
import { GRADE_DISTRIBUTION_TOLERANCE } from '../utils/validation';

/**
 * Calculates the complete financial and logistics outcome for selling a farmer's harvest
 * at a specific market destination.
 *
 * Implements full pipeline:
 * 1. Standardization to quintals
 * 2. Input validation & grade conservation
 * 3. Physical loss calculation: Saleable quantity = harvest quantity − physical spoilage quantity
 * 4. Modeled quality downgrading (strictly conserving total saleable mass)
 * 5. Grade-specific revenue
 * 6. Transportation cost & trip feasibility (one-way vs round-trip)
 * 7. Regulated market fees & statutory deductions (deducted exactly once)
 * 8. Net in-pocket return = gross sales − transport cost − market fees (supporting legitimate deficits)
 * 9. Feasibility constraints (purchase ceilings, minimum orders, vehicle constraints, active quotations)
 */
export function calculateMarketNetReturn(
  inputs: FarmerInputs,
  crop: CropProfile,
  market: SimulatedMarket
): MarketCalculationResult {
  const totalQuintals = convertToQuintals(inputs.quantity, inputs.quantityUnit);
  const feasibilityReasons: string[] = [];

  // Zero or negative harvest volume check
  if (totalQuintals <= 0) {
    feasibilityReasons.push('Harvest quantity must be greater than zero.');
  }

  // Grade distribution validation
  const rawA = inputs.gradeDistribution?.A ?? 0;
  const rawB = inputs.gradeDistribution?.B ?? 0;
  const rawC = inputs.gradeDistribution?.C ?? 0;
  const hasNegativeGrade = rawA < 0 || rawB < 0 || rawC < 0 || isNaN(rawA) || isNaN(rawB) || isNaN(rawC);
  const totalGradePct = rawA + rawB + rawC;
  const isGradeDistributionValid = !hasNegativeGrade && Math.abs(totalGradePct - 100) <= GRADE_DISTRIBUTION_TOLERANCE;

  if (!isGradeDistributionValid) {
    feasibilityReasons.push(
      `Grade percentages must total exactly 100% (currently ${totalGradePct}%).`
    );
  }

  // Use normalized factors only when within acceptable tolerance (to absorb floating-point imprecision)
  const factor = isGradeDistributionValid && totalGradePct > 0 ? 100 / totalGradePct : 1;
  const normA = (rawA || 0) * factor;
  const normB = (rawB || 0) * factor;

  const initialGradeA = Number(((totalQuintals * normA) / 100).toFixed(2));
  const initialGradeB = Number(((totalQuintals * normB) / 100).toFixed(2));
  const initialGradeC = Number(Math.max(0, totalQuintals - initialGradeA - initialGradeB).toFixed(2));

  const initialGradeQuantities: Record<Grade, number> = {
    A: initialGradeA,
    B: initialGradeB,
    C: initialGradeC,
  };

  // 1. Spoilage & Physical Loss: Saleable quantity = harvest quantity − physical spoilage quantity
  const spoilageBreakdown = calculateSpoilagePercentage(
    crop,
    inputs.spoilage,
    market.estimatedTravelTimeHours,
    market.typicalWaitTimeHours,
    inputs.maturity
  );

  const lossFraction = spoilageBreakdown.lossPercentage / 100;
  const physicalLossQuintals = Number(Math.min(totalQuintals, totalQuintals * lossFraction).toFixed(2));
  const saleableQuantityQuintals = Math.max(
    0,
    Math.min(totalQuintals, Number((totalQuintals - physicalLossQuintals).toFixed(2)))
  );

  // Pre-downgrade saleable quantities
  const preSaleA = Number((initialGradeQuantities.A * (1 - lossFraction)).toFixed(2));
  const preSaleB = Number((initialGradeQuantities.B * (1 - lossFraction)).toFixed(2));
  const preSaleC = Math.max(0, Number((saleableQuantityQuintals - preSaleA - preSaleB).toFixed(2)));

  const preGradeSaleable: Record<Grade, number> = {
    A: preSaleA,
    B: preSaleB,
    C: preSaleC,
  };

  // 2. Modeled Quality Downgrading (Transferring between grades while strictly conserving saleable mass)
  let downgradeRate = 0;
  if (crop.perishabilityClass <= 2) {
    const roughFactor =
      inputs.spoilage.handling === 'rough' ? 1.5 : inputs.spoilage.handling === 'standard' ? 1.0 : 0.5;
    const transitFactor = Math.min(2.0, Math.max(0, market.estimatedTravelTimeHours || 0) / 4.0);
    downgradeRate = Math.min(0.12, 0.02 * transitFactor * roughFactor);
  }

  const downgradedQuintalsAtoB = Math.min(preGradeSaleable.A, Number((preGradeSaleable.A * downgradeRate).toFixed(2)));
  const downgradedQuintalsBtoC = Math.min(preGradeSaleable.B, Number((preGradeSaleable.B * downgradeRate).toFixed(2)));

  // Post-downgrade grade quantities: Mass is strictly conserved: A + B + C === saleableQuantityQuintals
  const postSaleA = Number(Math.max(0, preGradeSaleable.A - downgradedQuintalsAtoB).toFixed(2));
  const postSaleB = Number(Math.max(0, preGradeSaleable.B + downgradedQuintalsAtoB - downgradedQuintalsBtoC).toFixed(2));
  const postSaleC = Number(Math.max(0, saleableQuantityQuintals - postSaleA - postSaleB).toFixed(2));

  const gradeSaleableQuantities: Record<Grade, number> = {
    A: postSaleA,
    B: postSaleB,
    C: postSaleC,
  };

  // 3. Gross Revenue by Grade
  const priceA = market.pricesPerQuintal?.A ?? 0;
  const priceB = market.pricesPerQuintal?.B ?? 0;
  const priceC = market.pricesPerQuintal?.C ?? 0;

  const gradeRevenue: Record<Grade, number> = {
    A: Math.round(gradeSaleableQuantities.A * priceA),
    B: Math.round(gradeSaleableQuantities.B * priceB),
    C: Math.round(gradeSaleableQuantities.C * priceC),
  };

  const grossRevenue = gradeRevenue.A + gradeRevenue.B + gradeRevenue.C;
  const averagePricePerQuintalSold =
    saleableQuantityQuintals > 0 ? Math.round(grossRevenue / saleableQuantityQuintals) : 0;

  // 4. Transportation Cost & Trip Feasibility
  const transport = calculateTransportationCost(inputs.transport, market.distanceKm, totalQuintals);
  if (!transport.isFeasible && transport.feasibilityReason) {
    feasibilityReasons.push(transport.feasibilityReason);
  }

  // 5. Market Deductions & Statutory Fees
  const fees = calculateMarketFees(
    market,
    grossRevenue,
    saleableQuantityQuintals,
    transport.tripsCount
  );

  // 6. Total Expenses & Net Return (Costs deducted exactly once; supports legitimate deficits)
  const totalExpenses = transport.totalCost + fees.totalMarketFees;
  const netReturn = grossRevenue - totalExpenses;
  const netReturnPerQuintal = totalQuintals > 0 ? Math.round(netReturn / totalQuintals) : 0;

  // 7. Mandatory Feasibility Validation (Purchase ceilings, minimum consignments, active quotes)
  if (market.maxCapacityQuintals <= 0 || totalQuintals > market.maxCapacityQuintals) {
    feasibilityReasons.push(
      `Market capacity is only ${market.maxCapacityQuintals} Qtl, but your harvest is ${totalQuintals.toFixed(1)} Qtl. It is not feasible for a single-market sale.`
    );
  }

  if (market.minPurchaseQuintals && totalQuintals < market.minPurchaseQuintals) {
    feasibilityReasons.push(
      `Market requires a minimum consignment of ${market.minPurchaseQuintals} Qtl; your harvest is ${totalQuintals.toFixed(1)} Qtl.`
    );
  }

  const hasValidQuote =
    market.pricesPerQuintal &&
    market.pricesPerQuintal.A > 0 &&
    (normB <= 0 || (market.pricesPerQuintal.B && market.pricesPerQuintal.B > 0)) &&
    (normA + normB >= 100 || (market.pricesPerQuintal.C && market.pricesPerQuintal.C > 0));

  if (!hasValidQuote) {
    feasibilityReasons.push('No active quotation available for this crop at this market.');
  }

  const isFeasible = feasibilityReasons.length === 0;
  const capacityUtilizationPercent =
    totalQuintals > 0 && market.maxCapacityQuintals > 0
      ? Math.min(100, Math.round((totalQuintals / market.maxCapacityQuintals) * 100))
      : 0;

  return {
    market,
    initialQuantityQuintals: totalQuintals,
    gradeQuantities: initialGradeQuantities,
    estimatedLossPercent: spoilageBreakdown.lossPercentage,
    physicalLossQuintals,
    saleableQuantityQuintals,
    gradeSaleableQuantities,
    downgradedQuintalsAtoB,
    downgradedQuintalsBtoC,
    grossRevenue,
    gradeRevenue,
    transportationCost: transport.totalCost,
    transportTrips: transport.tripsCount,
    marketCommissionFee: fees.commissionFee,
    marketCessFee: fees.marketCessFee,
    marketHandlingFee: fees.handlingFee,
    marketFixedFee: fees.fixedEntryFee,
    totalMarketFees: fees.totalMarketFees,
    otherSellingExpenses: 0,
    totalExpenses,
    netReturn,
    netReturnPerQuintal,
    isFeasible,
    feasibilityReasons,
    capacityUtilizationPercent,
    averagePricePerQuintalSold,
  };
}
