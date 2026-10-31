/**
 * HARVESTROUTE PHASE 5B: SELL NOW VS SELL LATER COMPARISON ENGINE
 * Computes comparative economics of immediate vs future market dispatch.
 * Accounts for:
 * - Crop perishability classes & daily storage weight loss
 * - Commercial storage expenses (ambient / ventilated / cold)
 * - Handling, APMC commission, and transportation deductions
 * - 80% prediction confidence intervals for risk-aware financial bounds
 */

import { CropProfile } from '../types/agriculture';
import {
  CropPriceForecastResult,
  HorizonForecast,
  SellDecision,
  SellNowVsLaterComparison,
  SellNowVsLaterOption,
} from '../types/marketDiscovery';

export interface StorageParameters {
  dailyRatePerQuintal?: number; // ₹ per Quintal per day (default ₹2.5)
  storageType?: 'ambient' | 'ventilated' | 'cold_storage';
}

/**
 * Calculates daily deterioration rate percentage based on crop perishability class and storage type.
 */
export function getDailySpoilageRatePercent(
  perishabilityClass: number,
  storageType: 'ambient' | 'ventilated' | 'cold_storage' = 'ambient'
): number {
  if (storageType === 'cold_storage') {
    // Cold storage dramatically reduces deterioration
    if (perishabilityClass === 1) return 1.8;
    if (perishabilityClass === 2) return 0.35;
    return 0.08;
  }

  // Standard farm ambient / ventilated storage
  switch (perishabilityClass) {
    case 1:
      // Highly perishable leafy greens (Spinach, Coriander)
      return 6.5; // ~6.5% daily weight/quality loss
    case 2:
      // Moderately perishable (Tomato, Brinjal, Cabbage)
      return 1.4; // ~1.4% daily loss
    case 3:
    default:
      // Semi-perishable / durable (Onion, Potato, Grains, Pulses)
      return 0.25; // ~0.25% daily loss
  }
}

/**
 * Evaluates the financial comparison between Selling Now (Day 0) and Selling Later (Days 3, 7, 14).
 */
export function evaluateSellNowVsLater(
  crop: CropProfile,
  consignmentQuintals: number,
  currentPricePerQuintal: number,
  forecast: CropPriceForecastResult | null,
  transportCost: number,
  mandiCommissionPercent: number = 1.5,
  mandiCessPercent: number = 0.5,
  handlingChargePerQuintal: number = 18,
  storageParams: StorageParameters = {}
): SellNowVsLaterComparison {
  const dailyStorageRate = storageParams.dailyRatePerQuintal ?? (
    storageParams.storageType === 'cold_storage' ? 6.0 : 2.5
  );
  const storageType = storageParams.storageType ?? 'ambient';
  const dailySpoilageRate = getDailySpoilageRatePercent(crop.perishabilityClass, storageType);

  const feeRate = (mandiCommissionPercent + mandiCessPercent) / 100;

  // --- DAY 0: SELL NOW (IMMEDIATE) ---
  const saleable0 = consignmentQuintals;
  const gross0 = Math.round(saleable0 * currentPricePerQuintal);
  const fees0 = Math.round(gross0 * feeRate);
  const handling0 = Math.round(saleable0 * handlingChargePerQuintal);
  const storage0 = 0;
  const net0 = Math.round(gross0 - transportCost - fees0 - handling0 - storage0);

  const day0Option: SellNowVsLaterOption = {
    horizonDays: 0,
    title: 'Sell Today (Immediate Dispatch)',
    targetDate: new Date().toISOString().split('T')[0],
    pricePerQuintal: currentPricePerQuintal,
    priceRange: [currentPricePerQuintal, currentPricePerQuintal],
    saleableQuintals: saleable0,
    spoilageLossQuintals: 0,
    spoilagePercent: 0,
    grossRevenue: gross0,
    transportCost,
    storageCost: 0,
    handlingCost: handling0,
    mandiFees: fees0,
    totalDeductions: transportCost + fees0 + handling0,
    netRevenue: net0,
    netRevenueRange: [net0, net0],
    netGainVsSellNow: 0,
    netGainPercent: 0,
    decision: 'ACCEPTABLE',
    riskFactors: ['Zero storage risk', 'Immediate liquidity', 'Current reported spot rate'],
  };

  const options: SellNowVsLaterOption[] = [day0Option];

  // Horizons to evaluate
  const horizonConfigs: Array<{ days: 3 | 7 | 14; key: 'd3' | 'd7' | 'd14'; label: string }> = [
    { days: 3, key: 'd3', label: 'Hold & Sell in 3 Days' },
    { days: 7, key: 'd7', label: 'Hold & Sell in 7 Days' },
    { days: 14, key: 'd14', label: 'Hold & Sell in 14 Days' },
  ];

  let bestWindowDays = 0;
  let maxNetRevenue = net0;

  for (const h of horizonConfigs) {
    const horizonForecast: HorizonForecast | undefined = forecast?.forecasts?.[h.key];

    // Expected predicted price and interval
    const predPrice = horizonForecast?.predictedPrice ?? currentPricePerQuintal;
    const minPrice = horizonForecast?.minConfidencePrice ?? Math.round(predPrice * 0.9);
    const maxPrice = horizonForecast?.maxConfidencePrice ?? Math.round(predPrice * 1.1);
    const targetDate = horizonForecast?.targetDate ?? new Date(Date.now() + h.days * 86400000).toISOString().split('T')[0];

    // Cumulative spoilage and weight shrinkage
    const cumulativeSpoilagePct = Math.min(100, Math.round(dailySpoilageRate * h.days * 10) / 10);
    const spoilageLossQtl = Math.round((consignmentQuintals * cumulativeSpoilagePct / 100) * 100) / 100;
    const saleableQtl = Math.max(0, Math.round((consignmentQuintals - spoilageLossQtl) * 100) / 100);

    // Storage and handling expenses
    const storageCost = Math.round(consignmentQuintals * dailyStorageRate * h.days);
    const handlingCost = Math.round(saleableQtl * handlingChargePerQuintal);

    // Gross and Net Revenues
    const grossRev = Math.round(saleableQtl * predPrice);
    const fees = Math.round(grossRev * feeRate);
    const netRev = Math.round(grossRev - transportCost - fees - handlingCost - storageCost);

    // Range bounds based on 80% confidence interval
    const worstGross = Math.round(saleableQtl * minPrice);
    const worstFees = Math.round(worstGross * feeRate);
    const worstNet = Math.round(worstGross - transportCost - worstFees - handlingCost - storageCost);

    const bestGross = Math.round(saleableQtl * maxPrice);
    const bestFees = Math.round(bestGross * feeRate);
    const bestNet = Math.round(bestGross - transportCost - bestFees - handlingCost - storageCost);

    const netGain = netRev - net0;
    const netGainPct = net0 > 0 ? Math.round((netGain / net0) * 1000) / 10 : 0;

    const riskFactors: string[] = [];

    // Perishability Risk Check
    if (crop.perishabilityClass === 1 && storageType !== 'cold_storage') {
      riskFactors.push(`High Perishability: ${cumulativeSpoilagePct}% estimated decay in leafy greens without cold storage.`);
    }

    if (storageCost > Math.abs(netGain) && netGain > 0) {
      riskFactors.push(`Storage cost (₹${storageCost}) erodes a major portion of expected price gain.`);
    }

    if (netGain < 0) {
      riskFactors.push(`Financial deficit: Holding loses ₹${Math.abs(netGain)} compared to selling today.`);
    }

    if (horizonForecast && horizonForecast.trendDirection === 'DECREASING') {
      riskFactors.push(`Downside Price Momentum: Model forecasts price decline of ₹${Math.abs(horizonForecast.priceDeltaVsCurrent)}/Qtl.`);
    }

    // Determine Decision Status
    let decision: SellDecision = 'ACCEPTABLE';

    if (crop.perishabilityClass === 1 && storageType !== 'cold_storage') {
      decision = 'NOT_RECOMMENDED';
    } else if (netGain > 300 && cumulativeSpoilagePct < 10) {
      decision = 'OPTIMAL';
    } else if (netGain >= 0 && cumulativeSpoilagePct < 15) {
      decision = 'ACCEPTABLE';
    } else if (netGain < 0 && netGain > -500) {
      decision = 'RISKY';
    } else {
      decision = 'NOT_RECOMMENDED';
    }

    if (netRev > maxNetRevenue && decision !== 'NOT_RECOMMENDED') {
      maxNetRevenue = netRev;
      bestWindowDays = h.days;
    }

    options.push({
      horizonDays: h.days,
      title: h.label,
      targetDate,
      pricePerQuintal: predPrice,
      priceRange: [minPrice, maxPrice],
      saleableQuintals: saleableQtl,
      spoilageLossQuintals: spoilageLossQtl,
      spoilagePercent: cumulativeSpoilagePct,
      grossRevenue: grossRev,
      transportCost,
      storageCost,
      handlingCost,
      mandiFees: fees,
      totalDeductions: transportCost + fees + handlingCost + storageCost,
      netRevenue: netRev,
      netRevenueRange: [worstNet, bestNet],
      netGainVsSellNow: netGain,
      netGainPercent: netGainPct,
      decision,
      riskFactors,
    });
  }

  // Set Day 0 as OPTIMAL if holding gives no net advantage
  if (bestWindowDays === 0) {
    options[0].decision = 'OPTIMAL';
  }

  // Summary guidance and perishability warnings
  let perishabilityWarning: string | undefined;
  if (crop.perishabilityClass === 1) {
    perishabilityWarning =
      'CRITICAL: Highly perishable crop. Holding without specialized refrigerated cold chain leads to rapid biological decay and severe monetary loss. Immediate dispatch today is strongly advised.';
  } else if (crop.perishabilityClass === 2 && storageType === 'ambient') {
    perishabilityWarning =
      'Advisory: Moderately perishable produce requires shaded, ventilated storage to avoid moisture condensation and skin softening.';
  }

  let summaryGuidance = '';
  if (bestWindowDays === 0) {
    summaryGuidance = `Optimal strategy is to SELL TODAY. Holding for ${crop.name} introduces storage costs (₹${dailyStorageRate}/Qtl/day) and physical weight loss that outweigh future price forecasts.`;
  } else {
    const bestOpt = options.find((o) => o.horizonDays === bestWindowDays);
    summaryGuidance = `Model indicates a potential net advantage of +₹${bestOpt?.netGainVsSellNow.toLocaleString('en-IN')} by holding for ${bestWindowDays} days, provided appropriate ${storageType} storage conditions are maintained.`;
  }

  return {
    cropId: crop.id,
    cropName: crop.name,
    harvestQuantityQuintals: consignmentQuintals,
    marketId: forecast?.marketId ?? 'selected-mandi',
    marketName: forecast?.marketName ?? 'Selected Mandi',
    perishabilityClass: crop.perishabilityClass,
    perishabilityWarning,
    options,
    recommendedWindowDays: bestWindowDays,
    summaryGuidance,
    storageAssumptions: {
      dailyStorageRatePerQuintal: dailyStorageRate,
      storageType,
      dailyDeteriorationRatePercent: dailySpoilageRate,
    },
  };
}

