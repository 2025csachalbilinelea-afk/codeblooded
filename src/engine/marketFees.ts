import { SimulatedMarket } from '../types/agriculture';

export interface MarketFeesCalculation {
  commissionFee: number;
  marketCessFee: number;
  handlingFee: number;
  fixedEntryFee: number;
  totalMarketFees: number;
  feePerQuintal: number;
}

/**
 * Calculates market deductions and statutory fees.
 * Commission and Cess are percentage-based on gross selling proceeds.
 * Handling is charged per saleable quintal delivered.
 * Fixed gate/weighbridge entry fee is charged per transport trip.
 */
export function calculateMarketFees(
  market: SimulatedMarket,
  grossRevenue: number,
  saleableQuintals: number,
  tripsCount: number
): MarketFeesCalculation {
  const commissionFee = Math.round(grossRevenue * (market.commissionFeePercent / 100));
  const marketCessFee = Math.round(grossRevenue * (market.marketCessPercent / 100));
  const handlingFee = Math.round(saleableQuintals * market.handlingChargePerQuintal);
  const fixedEntryFee = Math.round(market.fixedEntryFee * Math.max(1, tripsCount));

  const totalMarketFees = commissionFee + marketCessFee + handlingFee + fixedEntryFee;
  const feePerQuintal = saleableQuintals > 0 ? Number((totalMarketFees / saleableQuintals).toFixed(2)) : 0;

  return {
    commissionFee,
    marketCessFee,
    handlingFee,
    fixedEntryFee,
    totalMarketFees,
    feePerQuintal,
  };
}

