import {
  FarmerInputs,
  CropProfile,
  SimulatedMarket,
  SplitHarvestResult,
  SplitHarvestAllocation,
  SplitPlanTotals,
  RejectedSplitPlan,
  MarketCalculationResult,
} from '../types/agriculture';
import { convertToQuintals } from './units';
import { calculateMarketNetReturn } from './netReturn';

interface InternalCandidatePlan {
  allocations: SplitHarvestAllocation[];
  planTotals: SplitPlanTotals;
  isFeasible: boolean;
  rejectionReason?: string;
}

/**
 * Calculates adaptive discretization step based on consignment volume.
 * Guarantees high precision for small/medium harvests while ensuring
 * deterministic sub-millisecond execution for large commercial harvests.
 */
function getAdaptiveStepSize(totalQuintals: number): number {
  if (totalQuintals <= 15) return 0.5;
  if (totalQuintals <= 35) return 1.0;
  if (totalQuintals <= 80) return 2.0;
  if (totalQuintals <= 200) return 5.0;
  return 10.0;
}

/**
 * Advanced Split-Harvest Optimization Engine
 *
 * Evaluates whether dividing a farmer's consignment across multiple distinct markets
 * produces a higher total net return than the best feasible single-market option.
 *
 * Enforces all real-world agricultural constraints:
 * - Mass conservation: Sum of allocated dispatch quantities strictly equals original harvest.
 * - Non-negative allocations.
 * - Market purchase ceilings (maximum accepted quintals).
 * - Market minimum consignment thresholds.
 * - Multi-trip vehicle logistics and separate road transit costing for each destination.
 * - Destination-specific travel time, ambient conditions, and spoilage losses.
 * - Statutory APMC commissions, agricultural cess, and handling charges per market.
 * - Quality downgrading in transit where applicable.
 */
export function optimizeSplitHarvest(
  inputs: FarmerInputs,
  crop: CropProfile,
  markets: SimulatedMarket[],
  baselineSingleMarket: MarketCalculationResult | null
): SplitHarvestResult {
  const totalHarvestQuintals = convertToQuintals(inputs.quantity, inputs.quantityUnit);

  // Assumptions documentation
  const assumptions: string[] = [
    'Each split destination requires independent vehicle delivery trips from the farm gate origin.',
    'Fuel, vehicle maintenance, driver wages, and tolls are calculated separately per market corridor.',
    'Transit spoilage and unloading waiting times are computed independently for each market journey.',
    'Statutory market fees (APMC commission %, cess %, hamali per quintal, gate fee) apply per receiving mandi.',
    'Total dispatched volume strictly equals the harvested quantity before destination physical losses.',
  ];

  // Baseline single-market metrics
  const isBaselineFeasible = !!(baselineSingleMarket && baselineSingleMarket.isFeasible);
  const baselineNetReturn = isBaselineFeasible ? baselineSingleMarket.netReturn : -Infinity;
  const baselineTotals: SplitPlanTotals | null = isBaselineFeasible
    ? {
        totalAllocatedQuintals: baselineSingleMarket.initialQuantityQuintals,
        totalLossQuintals: baselineSingleMarket.physicalLossQuintals,
        totalSaleableQuintals: baselineSingleMarket.saleableQuantityQuintals,
        totalGrossRevenue: baselineSingleMarket.grossRevenue,
        totalTransportCost: baselineSingleMarket.transportationCost,
        totalMarketFees: baselineSingleMarket.totalMarketFees,
        totalNetReturn: baselineSingleMarket.netReturn,
        netReturnPerQuintal: baselineSingleMarket.netReturnPerQuintal,
      }
    : null;

  // Handle non-positive or invalid quantity
  if (totalHarvestQuintals <= 0 || isNaN(totalHarvestQuintals) || !isFinite(totalHarvestQuintals)) {
    return {
      recommendedStrategy: 'none',
      baselineSingleMarket: null,
      allocations: [],
      planTotals: {
        totalAllocatedQuintals: 0,
        totalLossQuintals: 0,
        totalSaleableQuintals: 0,
        totalGrossRevenue: 0,
        totalTransportCost: 0,
        totalMarketFees: 0,
        totalNetReturn: 0,
        netReturnPerQuintal: 0,
      },
      baselineTotals: null,
      totalNetReturn: 0,
      singleBestNetReturn: 0,
      totalAllocatedQuintals: 0,
      totalSaleableQuintals: 0,
      netGainFromSplitting: 0,
      netGainPerQuintal: 0,
      isSplitAdvantageous: false,
      hasFeasibleSplit: false,
      explanation: 'Please enter a positive harvest quantity to calculate market allocations.',
      strategyRationale: 'No consignment quantity entered.',
      rejectedPlans: [],
      searchMetadata: {
        plansEvaluated: 0,
        feasiblePlansCount: 0,
        discretizationStepQuintals: 0,
        assumptions,
      },
    };
  }

  // Handle very small harvests where splitting is economically impractical
  if (totalHarvestQuintals < 3) {
    const singleReturn = baselineTotals?.totalNetReturn || 0;
    return {
      recommendedStrategy: isBaselineFeasible ? 'single' : 'none',
      baselineSingleMarket,
      allocations: [],
      planTotals: {
        totalAllocatedQuintals: totalHarvestQuintals,
        totalLossQuintals: baselineTotals?.totalLossQuintals || 0,
        totalSaleableQuintals: baselineTotals?.totalSaleableQuintals || 0,
        totalGrossRevenue: baselineTotals?.totalGrossRevenue || 0,
        totalTransportCost: baselineTotals?.totalTransportCost || 0,
        totalMarketFees: baselineTotals?.totalMarketFees || 0,
        totalNetReturn: singleReturn,
        netReturnPerQuintal: baselineTotals?.netReturnPerQuintal || 0,
      },
      baselineTotals,
      totalNetReturn: singleReturn,
      singleBestNetReturn: singleReturn,
      totalAllocatedQuintals: totalHarvestQuintals,
      totalSaleableQuintals: baselineTotals?.totalSaleableQuintals || 0,
      netGainFromSplitting: 0,
      netGainPerQuintal: 0,
      isSplitAdvantageous: false,
      hasFeasibleSplit: false,
      explanation:
        'Harvest volume is under 3 Quintals. Splitting small consignments across multiple markets generates duplicate transport trips that heavily exceed any price advantage.',
      strategyRationale:
        isBaselineFeasible
          ? `Consignment of ${totalHarvestQuintals.toFixed(1)} Qtl is best sold entirely at ${baselineSingleMarket.market.name}.`
          : 'Consignment is too small to split and no single market can accept it.',
      rejectedPlans: [],
      searchMetadata: {
        plansEvaluated: 1,
        feasiblePlansCount: isBaselineFeasible ? 1 : 0,
        discretizationStepQuintals: 1,
        assumptions,
      },
    };
  }

  const stepSize = getAdaptiveStepSize(totalHarvestQuintals);
  let plansEvaluated = 0;
  let feasiblePlansCount = 0;
  const rejectedPlans: RejectedSplitPlan[] = [];

  let bestSplitPlan: InternalCandidatePlan | null = null;
  let highestSplitNetReturn = -Infinity;

  // Helper to safely evaluate a candidate allocation list
  const evaluateAllocationCandidate = (
    marketList: SimulatedMarket[],
    quantities: number[]
  ): InternalCandidatePlan => {
    plansEvaluated++;

    // Strict validation: sum of quantities must equal total harvest
    const sumQuantities = quantities.reduce((acc, q) => acc + q, 0);
    if (Math.abs(sumQuantities - totalHarvestQuintals) > 0.01) {
      return {
        allocations: [],
        planTotals: {
          totalAllocatedQuintals: sumQuantities,
          totalLossQuintals: 0,
          totalSaleableQuintals: 0,
          totalGrossRevenue: 0,
          totalTransportCost: 0,
          totalMarketFees: 0,
          totalNetReturn: 0,
          netReturnPerQuintal: 0,
        },
        isFeasible: false,
        rejectionReason: `Allocated sum (${sumQuantities.toFixed(1)} Qtl) does not equal harvest (${totalHarvestQuintals.toFixed(1)} Qtl).`,
      };
    }

    const allocations: SplitHarvestAllocation[] = [];
    let isFeasible = true;
    const legRejectionReasons: string[] = [];

    let totalAlloc = 0;
    let totalLoss = 0;
    let totalSale = 0;
    let totalGross = 0;
    let totalTransport = 0;
    let totalFees = 0;
    let totalNet = 0;

    for (let i = 0; i < marketList.length; i++) {
      const m = marketList[i];
      const q = quantities[i];

      if (q <= 0) {
        isFeasible = false;
        legRejectionReasons.push(`Zero or negative allocation for ${m.name}`);
        continue;
      }

      // Check market maximum capacity constraint
      if (q > m.maxCapacityQuintals) {
        isFeasible = false;
        legRejectionReasons.push(
          `${m.name} capacity is ${m.maxCapacityQuintals} Qtl (proposed: ${q.toFixed(1)} Qtl)`
        );
      }

      // Check market minimum purchase constraint
      if (m.minPurchaseQuintals && q < m.minPurchaseQuintals) {
        isFeasible = false;
        legRejectionReasons.push(
          `${m.name} requires minimum ${m.minPurchaseQuintals} Qtl (proposed: ${q.toFixed(1)} Qtl)`
        );
      }

      // Execute full financial & logistics calculation for this specific leg
      const legInput: FarmerInputs = {
        ...inputs,
        quantity: q,
        quantityUnit: 'quintal',
      };
      const legResult = calculateMarketNetReturn(legInput, crop, m);

      if (!legResult.isFeasible) {
        isFeasible = false;
        legRejectionReasons.push(`${m.name}: ${legResult.feasibilityReasons.join('; ')}`);
      }

      allocations.push({
        market: m,
        allocatedQuintals: q,
        saleableQuintals: legResult.saleableQuantityQuintals,
        physicalLossQuintals: legResult.physicalLossQuintals,
        lossPercent: legResult.estimatedLossPercent,
        grossRevenue: legResult.grossRevenue,
        transportCost: legResult.transportationCost,
        transportTrips: legResult.transportTrips,
        marketFees: legResult.totalMarketFees,
        netReturn: legResult.netReturn,
        netReturnPerQuintal: legResult.netReturnPerQuintal,
      });

      totalAlloc += q;
      totalLoss += legResult.physicalLossQuintals;
      totalSale += legResult.saleableQuantityQuintals;
      totalGross += legResult.grossRevenue;
      totalTransport += legResult.transportationCost;
      totalFees += legResult.totalMarketFees;
      totalNet += legResult.netReturn;
    }

    const planTotals: SplitPlanTotals = {
      totalAllocatedQuintals: Number(totalAlloc.toFixed(2)),
      totalLossQuintals: Number(totalLoss.toFixed(2)),
      totalSaleableQuintals: Number(totalSale.toFixed(2)),
      totalGrossRevenue: Math.round(totalGross),
      totalTransportCost: Math.round(totalTransport),
      totalMarketFees: Math.round(totalFees),
      totalNetReturn: Math.round(totalNet),
      netReturnPerQuintal: totalAlloc > 0 ? Math.round(totalNet / totalAlloc) : 0,
    };

    if (!isFeasible) {
      return {
        allocations,
        planTotals,
        isFeasible: false,
        rejectionReason: legRejectionReasons.join(' | '),
      };
    }

    feasiblePlansCount++;
    return {
      allocations,
      planTotals,
      isFeasible: true,
    };
  };

  // -------------------------------------------------------------
  // PHASE A: Bounded 2-Market Split Search
  // -------------------------------------------------------------
  const vehicleCap =
    inputs.transport.type === 'own'
      ? inputs.transport.ownVehicle.capacityQuintals
      : inputs.transport.rentedVehicle.capacityQuintals;

  for (let i = 0; i < markets.length; i++) {
    for (let j = i + 1; j < markets.length; j++) {
      const m1 = markets[i];
      const m2 = markets[j];

      const min1 = m1.minPurchaseQuintals || 1;
      const min2 = m2.minPurchaseQuintals || 1;
      const cap1 = m1.maxCapacityQuintals;
      const cap2 = m2.maxCapacityQuintals;

      // Reject if combined capacities cannot absorb total harvest
      if (cap1 + cap2 < totalHarvestQuintals) {
        if (rejectedPlans.length < 12) {
          rejectedPlans.push({
            marketNames: [m1.name, m2.name],
            proposedAllocations: [cap1, cap2],
            rejectionReason: `Combined capacity (${cap1 + cap2} Qtl) is less than harvest (${totalHarvestQuintals.toFixed(1)} Qtl).`,
          });
        }
        continue;
      }

      // Reject if minimum order requirements exceed total harvest
      if (min1 + min2 > totalHarvestQuintals) {
        if (rejectedPlans.length < 12) {
          rejectedPlans.push({
            marketNames: [m1.name, m2.name],
            proposedAllocations: [min1, min2],
            rejectionReason: `Combined minimum consignment (${min1 + min2} Qtl) exceeds harvest (${totalHarvestQuintals.toFixed(1)} Qtl).`,
          });
        }
        continue;
      }

      // Range for q1
      const q1Min = Math.max(min1, Number((totalHarvestQuintals - cap2).toFixed(2)));
      const q1Max = Math.min(cap1, Number((totalHarvestQuintals - min2).toFixed(2)));

      if (q1Min > q1Max) {
        if (rejectedPlans.length < 12) {
          rejectedPlans.push({
            marketNames: [m1.name, m2.name],
            proposedAllocations: [q1Min, totalHarvestQuintals - q1Min],
            rejectionReason: `No feasible allocation interval between ${m1.name} (cap ${cap1}) and ${m2.name} (cap ${cap2}).`,
          });
        }
        continue;
      }

      // Candidate points to test:
      // 1. Boundary 1: max out market 1
      // 2. Boundary 2: max out market 2
      // 3. Vehicle capacity boundary (sweet spot to prevent unnecessary extra trips)
      // 4. Equal split
      // 5. Grid discretization points
      const candidateQ1s = new Set<number>();
      candidateQ1s.add(q1Min);
      candidateQ1s.add(q1Max);

      if (vehicleCap > 0 && vehicleCap >= q1Min && vehicleCap <= q1Max) {
        candidateQ1s.add(vehicleCap);
      }
      const half = Number((totalHarvestQuintals / 2).toFixed(1));
      if (half >= q1Min && half <= q1Max) {
        candidateQ1s.add(half);
      }

      // Discretized intermediate steps
      for (let q = q1Min; q <= q1Max; q += stepSize) {
        candidateQ1s.add(Number(q.toFixed(2)));
      }

      for (const q1 of candidateQ1s) {
        const q2 = Number((totalHarvestQuintals - q1).toFixed(2));
        if (q2 < min2 || q2 > cap2) continue;

        const candidate = evaluateAllocationCandidate([m1, m2], [q1, q2]);
        if (candidate.isFeasible) {
          if (candidate.planTotals.totalNetReturn > highestSplitNetReturn) {
            highestSplitNetReturn = candidate.planTotals.totalNetReturn;
            bestSplitPlan = candidate;
          }
        } else if (rejectedPlans.length < 12 && candidate.rejectionReason) {
          rejectedPlans.push({
            marketNames: [m1.name, m2.name],
            proposedAllocations: [q1, q2],
            rejectionReason: candidate.rejectionReason,
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // PHASE B: Bounded 3-Market Split Search
  // Evaluated when harvest is substantial (>= 25 Qtl) and specialized
  // boutique markets (e.g. Sahyadri's 12 Qtl quota) exist.
  // -------------------------------------------------------------
  if (totalHarvestQuintals >= 25) {
    const quotaConstrainedMarkets = markets.filter(
      (m) => m.maxCapacityQuintals < totalHarvestQuintals && m.maxCapacityQuintals >= 5
    );

    for (const m1 of quotaConstrainedMarkets) {
      const q1 = m1.maxCapacityQuintals; // Fill boutique quota 100%
      const remainingFor2And3 = Number((totalHarvestQuintals - q1).toFixed(2));

      // Candidate secondary pairs
      const otherMarkets = markets.filter((m) => m.id !== m1.id);
      for (let j = 0; j < otherMarkets.length; j++) {
        for (let k = j + 1; k < otherMarkets.length; k++) {
          const m2 = otherMarkets[j];
          const m3 = otherMarkets[k];

          const cap2 = m2.maxCapacityQuintals;
          const cap3 = m3.maxCapacityQuintals;
          const min2 = m2.minPurchaseQuintals || 1;
          const min3 = m3.minPurchaseQuintals || 1;

          if (cap2 + cap3 < remainingFor2And3 || min2 + min3 > remainingFor2And3) continue;

          const q2Min = Math.max(min2, Number((remainingFor2And3 - cap3).toFixed(2)));
          const q2Max = Math.min(cap2, Number((remainingFor2And3 - min3).toFixed(2)));

          if (q2Min > q2Max) continue;

          const candidateQ2s = [
            q2Min,
            q2Max,
            Number((remainingFor2And3 / 2).toFixed(1)),
          ];

          for (const q2 of candidateQ2s) {
            const q3 = Number((remainingFor2And3 - q2).toFixed(2));
            if (q3 < min3 || q3 > cap3) continue;

            const candidate = evaluateAllocationCandidate([m1, m2, m3], [q1, q2, q3]);
            if (candidate.isFeasible) {
              if (candidate.planTotals.totalNetReturn > highestSplitNetReturn) {
                highestSplitNetReturn = candidate.planTotals.totalNetReturn;
                bestSplitPlan = candidate;
              }
            }
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // PHASE C: Recommendation Decision & Rationale
  // -------------------------------------------------------------
  const hasFeasibleSplit = bestSplitPlan !== null && bestSplitPlan.isFeasible;
  const netGainFromSplitting =
    hasFeasibleSplit && bestSplitPlan
      ? isBaselineFeasible
        ? bestSplitPlan.planTotals.totalNetReturn - baselineNetReturn
        : 0
      : 0;

  const netGainPerQuintal =
    totalHarvestQuintals > 0
      ? Number((netGainFromSplitting / totalHarvestQuintals).toFixed(2))
      : 0;

  // Minimum economic threshold to justify multi-market operational complexity
  const ADVANTAGE_THRESHOLD = 250; // In INR

  let recommendedStrategy: 'single' | 'split' | 'none' = 'none';
  let isSplitAdvantageous = false;
  let explanation = '';
  let strategyRationale = '';

  if (hasFeasibleSplit && bestSplitPlan) {
    if (isBaselineFeasible) {
      if (netGainFromSplitting >= ADVANTAGE_THRESHOLD) {
        recommendedStrategy = 'split';
        isSplitAdvantageous = true;
        const marketNames = bestSplitPlan.allocations.map((a) => a.market.name).join(' and ');
        explanation = `Splitting your ${totalHarvestQuintals.toFixed(1)} Quintal consignment across ${marketNames} yields ₹${netGainFromSplitting.toLocaleString('en-IN')} (+₹${netGainPerQuintal}/Qtl) MORE in net in-pocket profit than selling entirely at ${baselineSingleMarket.market.name}.`;
        strategyRationale = `Split-Harvest is recommended because the premium prices secured at high-value markets comfortably surpass the additional multi-trip logistics expenses (-₹${(bestSplitPlan.planTotals.totalTransportCost - baselineTotals!.totalTransportCost).toLocaleString('en-IN')}).`;
      } else {
        recommendedStrategy = 'single';
        isSplitAdvantageous = false;
        explanation = `Selling your entire harvest at ${baselineSingleMarket.market.name} is recommended. Splitting across multiple destinations produces duplicate vehicle transit costs and extra fixed mandi charges that outweigh the slight gross price difference by ₹${Math.abs(netGainFromSplitting).toLocaleString('en-IN')}.`;
        strategyRationale = `Single-Market consolidation at ${baselineSingleMarket.market.name} delivers higher net earnings (₹${baselineTotals!.totalNetReturn.toLocaleString('en-IN')}) with minimal logistics friction.`;
      }
    } else {
      // Split is feasible, but NO single market can take the harvest!
      recommendedStrategy = 'split';
      isSplitAdvantageous = true;
      const marketNames = bestSplitPlan.allocations.map((a) => a.market.name).join(' and ');
      explanation = `Split-Harvest is the ONLY feasible strategy to sell your complete consignment of ${totalHarvestQuintals.toFixed(1)} Quintals. No single candidate market has the purchase capacity to accept it in one sale.`;
      strategyRationale = `Allocating across ${marketNames} fulfills your complete harvest while respecting individual market quotas.`;
    }
  } else {
    // No feasible split plan found
    if (isBaselineFeasible) {
      recommendedStrategy = 'single';
      isSplitAdvantageous = false;
      explanation = `Consolidating your harvest at ${baselineSingleMarket.market.name} is the optimal feasible option. No multi-market split satisfies capacity and minimum order requirements simultaneously.`;
      strategyRationale = `Single-market sale at ${baselineSingleMarket.market.name} remains feasible and profitable.`;
    } else {
      recommendedStrategy = 'none';
      isSplitAdvantageous = false;
      explanation = `No feasible single-market or split-harvest plan exists for ${totalHarvestQuintals.toFixed(1)} Quintals. Every market combination exceeds purchase ceilings or fails minimum consignment requirements.`;
      strategyRationale = 'Please downscale harvest consignment volume or explore commercial contract sales.';
    }
  }

  // Bounded search limitation disclosure
  const searchLimitationNotice =
    plansEvaluated > 150
      ? `Evaluated ${plansEvaluated} candidate route permutations with a deterministic ${stepSize} Qtl discretization step. Result represents the highest net return plan identified within search boundaries.`
      : undefined;

  const totalSplitNet = bestSplitPlan?.planTotals.totalNetReturn || 0;
  const singleBestNet = baselineTotals?.totalNetReturn || 0;

  return {
    recommendedStrategy,
    baselineSingleMarket,
    allocations: bestSplitPlan?.allocations || [],
    planTotals: bestSplitPlan?.planTotals || {
      totalAllocatedQuintals: totalHarvestQuintals,
      totalLossQuintals: 0,
      totalSaleableQuintals: 0,
      totalGrossRevenue: 0,
      totalTransportCost: 0,
      totalMarketFees: 0,
      totalNetReturn: 0,
      netReturnPerQuintal: 0,
    },
    baselineTotals,
    totalNetReturn: totalSplitNet,
    singleBestNetReturn: singleBestNet,
    totalAllocatedQuintals: bestSplitPlan?.planTotals.totalAllocatedQuintals || totalHarvestQuintals,
    totalSaleableQuintals: bestSplitPlan?.planTotals.totalSaleableQuintals || 0,
    netGainFromSplitting: Math.round(netGainFromSplitting),
    netGainPerQuintal,
    isSplitAdvantageous,
    hasFeasibleSplit,
    explanation,
    strategyRationale,
    rejectedPlans: rejectedPlans.slice(0, 5),
    searchMetadata: {
      plansEvaluated,
      feasiblePlansCount,
      discretizationStepQuintals: stepSize,
      assumptions,
      searchLimitationNotice,
    },
  };
}
