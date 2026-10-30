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
 * - Commission and Cess are percentage-based on gross selling proceeds.
 * - Handling (hamali/unloading) is charged per saleable quintal delivered.
 * - Fixed gate/weighbridge entry fee is charged strictly per transport trip made.
 *   If 0 trips are made or 0 produce is sold, gate entry fee is zero.
 */
export function calculateMarketFees(
  market: SimulatedMarket,
  grossRevenue: number,
  saleableQuintals: number,
  tripsCount: number
): MarketFeesCalculation {
  const safeGross = Math.max(0, Number(grossRevenue) || 0);
  const safeSaleable = Math.max(0, Number(saleableQuintals) || 0);
  const safeTrips = Math.max(0, Number(tripsCount) || 0);

  if (safeSaleable <= 0 || safeGross <= 0 || safeTrips <= 0) {
    return {
      commissionFee: 0,
      marketCessFee: 0,
      handlingFee: 0,
      fixedEntryFee: 0,
      totalMarketFees: 0,
      feePerQuintal: 0,
    };
  }

  const commissionFee = Math.round(safeGross * (Math.max(0, market.commissionFeePercent || 0) / 100));
  const marketCessFee = Math.round(safeGross * (Math.max(0, market.marketCessPercent || 0) / 100));
  const handlingFee = Math.round(safeSaleable * Math.max(0, market.handlingChargePerQuintal || 0));
  const fixedEntryFee = Math.round(Math.max(0, market.fixedEntryFee || 0) * safeTrips);

  const totalMarketFees = commissionFee + marketCessFee + handlingFee + fixedEntryFee;
  const feePerQuintal = safeSaleable > 0 ? Number((totalMarketFees / safeSaleable).toFixed(2)) : 0;

  return {
    commissionFee,
    marketCessFee,
    handlingFee,
    fixedEntryFee,
    totalMarketFees,
    feePerQuintal,
  };
}
