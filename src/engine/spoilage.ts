import {
  CropProfile,
  MaturityFreshness,
  SpoilageInputs,
  TemperatureScenario,
  VehicleProtection,
  HandlingQuality,
} from '../types/agriculture';

export interface SpoilageEstimationBreakdown {
  lossPercentage: number;
  totalExposureHours: number;
  baseRatePerHour: number;
  temperatureMultiplier: number;
  vehicleMultiplier: number;
  handlingMultiplier: number;
  maturityMultiplier: number;
  isSimulatedEstimate: true;
}

const TEMPERATURE_MULTIPLIERS: Record<TemperatureScenario, number> = {
  mild: 0.8,
  warm: 1.25,
  hot: 1.8,
};

const VEHICLE_MULTIPLIERS: Record<VehicleProtection, number> = {
  refrigerated: 0.22,
  covered: 1.0,
  open: 1.45,
};

const HANDLING_MULTIPLIERS: Record<HandlingQuality, number> = {
  gentle: 0.8,
  standard: 1.0,
  rough: 1.4,
};

const MATURITY_MULTIPLIERS: Record<MaturityFreshness, number> = {
  early: 0.85,
  optimal: 1.0,
  ripe: 1.35,
  overripe: 2.1,
  dry_stored: 0.85,
};

// Maximum physical loss cap per perishability class in simulation
const CLASS_LOSS_CAPS: Record<number, { min: number; max: number }> = {
  1: { min: 1.0, max: 48.0 }, // Highly perishable (Spinach, Coriander, Ripe Tomato)
  2: { min: 0.5, max: 28.0 }, // Moderately perishable (Brinjal, Banana, Mango)
  3: { min: 0.2, max: 14.0 }, // Semi-perishable (Onion, Potato, Carrot)
  4: { min: 0.05, max: 3.5 }, // Non-perishable / Dry produce (Grains, Pulses)
};

/**
 * Calculates estimated physical loss percentage for a crop and journey.
 * In manual mode, strictly returns the user's manual percentage without extra additions.
 * In automatic mode, computes a transparent rule-based estimate based on environmental and transit conditions.
 */
export function calculateSpoilagePercentage(
  crop: CropProfile,
  spoilage: SpoilageInputs,
  transitHours: number,
  marketWaitHours: number,
  maturity: MaturityFreshness = 'optimal'
): SpoilageEstimationBreakdown {
  if (spoilage.mode === 'manual') {
    const clampedManual = Math.max(0, Math.min(100, Number(spoilage.manualPercentage) || 0));
    return {
      lossPercentage: Number(clampedManual.toFixed(2)),
      totalExposureHours: Number((transitHours + marketWaitHours).toFixed(1)),
      baseRatePerHour: crop.baseDeteriorationRatePerHour,
      temperatureMultiplier: 1.0,
      vehicleMultiplier: 1.0,
      handlingMultiplier: 1.0,
      maturityMultiplier: 1.0,
      isSimulatedEstimate: true,
    };
  }

  // Automatic estimation mode
  const totalExposureHours = Math.max(0.5, transitHours + marketWaitHours + (Number(spoilage.delayHours) || 0));
  const tempMultiplier = TEMPERATURE_MULTIPLIERS[spoilage.temperature] || 1.0;
  const vehicleMultiplier = VEHICLE_MULTIPLIERS[spoilage.vehicleProtection] || 1.0;
  const handlingMultiplier = HANDLING_MULTIPLIERS[spoilage.handling] || 1.0;
  const maturityMultiplier = MATURITY_MULTIPLIERS[maturity] || 1.0;

  // Uncapped loss calculation
  const rawLoss =
    crop.baseDeteriorationRatePerHour *
    totalExposureHours *
    tempMultiplier *
    vehicleMultiplier *
    handlingMultiplier *
    maturityMultiplier;

  // Enforce perishability class bounding
  const bounds = CLASS_LOSS_CAPS[crop.perishabilityClass] || { min: 0.1, max: 30.0 };
  const boundedLoss = Math.max(bounds.min, Math.min(bounds.max, rawLoss));

  return {
    lossPercentage: Number(boundedLoss.toFixed(2)),
    totalExposureHours: Number(totalExposureHours.toFixed(1)),
    baseRatePerHour: crop.baseDeteriorationRatePerHour,
    temperatureMultiplier: tempMultiplier,
    vehicleMultiplier: vehicleMultiplier,
    handlingMultiplier: handlingMultiplier,
    maturityMultiplier: maturityMultiplier,
    isSimulatedEstimate: true,
  };
}

