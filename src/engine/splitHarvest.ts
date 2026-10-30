import {
  FarmerInputs,
  CropProfile,
  SimulatedMarket,
  SplitHarvestResult,
  SplitHarvestAllocation,
} from '../types/agriculture';
import { convertToQuintals } from './units';
import { calculateMarketNetReturn } from './netReturn';

/**
 * Evaluates whether splitting the harvest between a high-value quota-limited market
 * and a high-capacity bulk market yields higher total net return after accounting for
 * dual transportation and market charges.
 * Strictly respects market capacities and converts all quantities to standard Quintals.
 */
export function optimizeSplitHarvest(
  inputs: FarmerInputs,
  crop: CropProfile,
  markets: SimulatedMarket[],
  singleBestNetReturn: number
): SplitHarvestResult | null {
  const totalHarvestQuintals = convertToQuintals(inputs.quantity, inputs.quantityUnit);
  if (totalHarvestQuintals <= 5) return null; // Splitting small harvest under 5 quintals rarely viable

  // Find markets with quota limit lower than harvest but higher Grade A prices
  const constrainedHighValueMarkets = markets.filter(
    (m) => m.maxCapacityQuintals < totalHarvestQuintals && m.maxCapacityQuintals >= 5
  );

  if (constrainedHighValueMarkets.length === 0) return null;

  let bestSplit: SplitHarvestResult | null = null;
  let highestSplitNetReturn = -Infinity;

  for (const highMarket of constrainedHighValueMarkets) {
    const allocated1 = highMarket.maxCapacityQuintals; // Strictly capped at capacity
    const remaining = totalHarvestQuintals - allocated1;

    // Secondary markets that can take the remaining produce within their capacity
    const secondaryCandidates = markets.filter(
      (m) => m.id !== highMarket.id && m.maxCapacityQuintals >= remaining
    );

    for (const secMarket of secondaryCandidates) {
      // Calculate split 1 in standardized quintals
      const input1: FarmerInputs = {
        ...inputs,
        quantity: allocated1,
        quantityUnit: 'quintal',
      };
      const res1 = calculateMarketNetReturn(input1, crop, highMarket);

      // Calculate split 2 in standardized quintals
      const input2: FarmerInputs = {
        ...inputs,
        quantity: remaining,
        quantityUnit: 'quintal',
      };
      const res2 = calculateMarketNetReturn(input2, crop, secMarket);

      const totalNetReturn = res1.netReturn + res2.netReturn;
      const totalSaleable = res1.saleableQuantityQuintals + res2.saleableQuantityQuintals;

      if (totalNetReturn > highestSplitNetReturn) {
        highestSplitNetReturn = totalNetReturn;
        const netGain = totalNetReturn - singleBestNetReturn;

        const allocations: SplitHarvestAllocation[] = [
          {
            market: highMarket,
            allocatedQuintals: allocated1,
            saleableQuintals: res1.saleableQuantityQuintals,
            grossRevenue: res1.grossRevenue,
            transportCost: res1.transportationCost,
            marketFees: res1.totalMarketFees,
            netReturn: res1.netReturn,
          },
          {
            market: secMarket,
            allocatedQuintals: remaining,
            saleableQuintals: res2.saleableQuantityQuintals,
            grossRevenue: res2.grossRevenue,
            transportCost: res2.transportationCost,
            marketFees: res2.totalMarketFees,
            netReturn: res2.netReturn,
          },
        ];

        bestSplit = {
          allocations,
          totalAllocatedQuintals: totalHarvestQuintals,
          totalSaleableQuintals: totalSaleable,
          totalNetReturn,
          singleBestNetReturn,
          netGainFromSplitting: netGain,
          isSplitAdvantageous: netGain > 500, // meaningful economic threshold
          explanation:
            netGain > 500
              ? `By routing ${allocated1} Qtl to ${highMarket.name} (up to its maximum quota) and dispatching the remaining ${remaining.toFixed(1)} Qtl to ${secMarket.name}, you earn ₹${netGain.toLocaleString('en-IN')} MORE than any single-market consignment.`
              : `Splitting between ${highMarket.name} and ${secMarket.name} produces ₹${totalNetReturn.toLocaleString('en-IN')}, which does not overcome the duplicate transit trips and extra fixed mandi charges compared to a single-market sale.`,
        };
      }
    }
  }

  return bestSplit;
}
