import {
  FarmerInputs,
  CropProfile,
  SimulatedMarket,
  MarketCalculationResult,
} from '../types/agriculture';
import { calculateMarketNetReturn } from './netReturn';

export interface MarketRankingResult {
  allResults: MarketCalculationResult[];
  feasibleMarkets: MarketCalculationResult[];
  infeasibleMarkets: MarketCalculationResult[];
  bestMarket: MarketCalculationResult | null;
  hasFeasibleMarkets: boolean;
}

/**
 * Evaluates all candidate markets, partitions them into feasible and infeasible groups,
 * and ranks feasible markets strictly by estimated net return (highest profit first).
 */
export function rankMarketsByNetReturn(
  inputs: FarmerInputs,
  crop: CropProfile,
  markets: SimulatedMarket[]
): MarketRankingResult {
  const allResults = markets.map((m) => calculateMarketNetReturn(inputs, crop, m));

  const feasibleMarkets = allResults
    .filter((r) => r.isFeasible)
    .sort((a, b) => b.netReturn - a.netReturn);

  const infeasibleMarkets = allResults
    .filter((r) => !r.isFeasible)
    .sort((a, b) => b.netReturn - a.netReturn);

  const bestMarket = feasibleMarkets.length > 0 ? feasibleMarkets[0] : null;

  return {
    allResults,
    feasibleMarkets,
    infeasibleMarkets,
    bestMarket,
    hasFeasibleMarkets: feasibleMarkets.length > 0,
  };
}

