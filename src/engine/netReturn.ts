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

/**
 * Calculates the complete financial and logistics outcome for selling a farmer's harvest
 * at a specific market destination.
 * Implements full pipeline:
 * 1. Standardization to quintals
 * 2. Initial grade quantities
 * 3. Physical loss calculation
 * 4. Modeled quality downgrading (conserving total saleable mass)
 * 5. Grade-specific revenue
 * 6. Transportation cost & trips feasibility
 * 7. Regulated market fees & statutory deductions
 * 8. Net in-pocket return (supporting legitimate deficits)
 * 9. Feasibility constraints (purchase ceilings, minimum orders, logistics)
 */
export function calculateMarketNetReturn(
  inputs: FarmerInputs,
  crop: CropProfile,
  market: SimulatedMarket
): MarketCalculationResult {
  const totalQuintals = convertToQuintals(inputs.quantity, inputs.quantityUnit);
  const feasibilityReasons: string[] = [];

  // Normalize grade distribution
  const totalGradePct = (inputs.gradeDistribution.A || 0) + (inputs.gradeDistribution.B || 0) + (inputs.gradeDistribution.C || 0);
  const factor = totalGradePct > 0 ? 100 / totalGradePct : 1;
  const normA = (inputs.gradeDistribution.A || 0) * factor;
  const normB = (inputs.gradeDistribution.B || 0) * factor;
  const normC = (inputs.gradeDistribution.C || 0) * factor;

  const initialGradeQuantities: Record<Grade, number> = {
    A: Number(((totalQuintals * normA) / 100).toFixed(2)),
    B: Number(((totalQuintals * normB) / 100).toFixed(2)),
    C: Number(((totalQuintals * normC) / 100).toFixed(2)),
  };

  // 1. Spoilage & Physical Loss (Separated from quality downgrading)
  const spoilageBreakdown = calculateSpoilagePercentage(
    crop,
    inputs.spoilage,
    market.estimatedTravelTimeHours,
    market.typicalWaitTimeHours,
    inputs.maturity
  );

  const lossFraction = spoilageBreakdown.lossPercentage / 100;
  const physicalLossQuintals = Number((totalQuintals * lossFraction).toFixed(2));
  const saleableQuantityQuintals = Math.max(0, Number((totalQuintals - physicalLossQuintals).toFixed(2)));

  // Pre-downgrade saleable quantities
  const preGradeSaleable: Record<Grade, number> = {
    A: Number((initialGradeQuantities.A * (1 - lossFraction)).toFixed(2)),
    B: Number((initialGradeQuantities.B * (1 - lossFraction)).toFixed(2)),
    C: Number((initialGradeQuantities.C * (1 - lossFraction)).toFixed(2)),
  };

  // 2. Modeled Quality Downgrading (Transferring between grades without double-counting)
  // Perishable produce (Classes 1 & 2) in hot or rough transit experiences surface bruising / softness
  let downgradeRate = 0;
  if (crop.perishabilityClass <= 2) {
    const roughFactor =
      inputs.spoilage.handling === 'rough' ? 1.5 : inputs.spoilage.handling === 'standard' ? 1.0 : 0.5;
    const transitFactor = Math.min(2.0, market.estimatedTravelTimeHours / 4.0);
    downgradeRate = Math.min(0.12, 0.02 * transitFactor * roughFactor);
  }

  const downgradedQuintalsAtoB = Number((preGradeSaleable.A * downgradeRate).toFixed(2));
  const downgradedQuintalsBtoC = Number((preGradeSaleable.B * downgradeRate).toFixed(2));

  // Post-downgrade grade quantities (Mass is strictly conserved)
  const gradeSaleableQuantities: Record<Grade, number> = {
    A: Number(Math.max(0, preGradeSaleable.A - downgradedQuintalsAtoB).toFixed(2)),
    B: Number(Math.max(0, preGradeSaleable.B + downgradedQuintalsAtoB - downgradedQuintalsBtoC).toFixed(2)),
    C: Number(Math.max(0, preGradeSaleable.C + downgradedQuintalsBtoC).toFixed(2)),
  };

  // 3. Gross Revenue by Grade
  const gradeRevenue: Record<Grade, number> = {
    A: Math.round(gradeSaleableQuantities.A * (market.pricesPerQuintal.A || 0)),
    B: Math.round(gradeSaleableQuantities.B * (market.pricesPerQuintal.B || 0)),
    C: Math.round(gradeSaleableQuantities.C * (market.pricesPerQuintal.C || 0)),
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

  // 6. Total Expenses & Net Return (Legitimate negative results preserved)
  const totalExpenses = transport.totalCost + fees.totalMarketFees;
  const netReturn = grossRevenue - totalExpenses;
  const netReturnPerQuintal = totalQuintals > 0 ? Math.round(netReturn / totalQuintals) : 0;

  // 7. Mandatory Feasibility Validation (Purchase ceilings & minimum orders)
  if (totalQuintals > market.maxCapacityQuintals) {
    feasibilityReasons.push(
      `Market capacity is only ${market.maxCapacityQuintals} Qtl, but your harvest is ${totalQuintals.toFixed(1)} Qtl. It is not feasible for a single-market sale.`
    );
  }

  if (market.minPurchaseQuintals && totalQuintals < market.minPurchaseQuintals) {
    feasibilityReasons.push(
      `Market requires a minimum consignment of ${market.minPurchaseQuintals} Qtl; your harvest is ${totalQuintals.toFixed(1)} Qtl.`
    );
  }

  if (!market.pricesPerQuintal.A || market.pricesPerQuintal.A <= 0) {
    feasibilityReasons.push('No active quotation available for this crop at this market.');
  }

  const isFeasible = feasibilityReasons.length === 0;
  const capacityUtilizationPercent =
    market.maxCapacityQuintals > 0
      ? Math.min(100, Math.round((totalQuintals / market.maxCapacityQuintals) * 100))
      : 100;

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
