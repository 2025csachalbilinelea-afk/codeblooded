import { FarmerInputs } from '../types/agriculture';

/**
 * Explicit documented tolerance for grade distribution percentages.
 * Allows minor rounding differences (e.g. 33.33 + 33.33 + 33.34 = 100).
 */
export const GRADE_DISTRIBUTION_TOLERANCE = 0.5;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateFarmerInputs(inputs: FarmerInputs): ValidationResult {
  const errors: Record<string, string> = {};

  if (!inputs.cropId) {
    errors.crop = 'Please select a crop.';
  }

  if (inputs.quantity <= 0 || isNaN(inputs.quantity) || !isFinite(inputs.quantity)) {
    errors.quantity = 'Harvest quantity must be greater than zero.';
  } else if (inputs.quantity > 50000) {
    errors.quantity = 'Harvest quantity exceeds the demonstration system limit (50,000 units).';
  }

  // Validate grade distribution if provided
  if (inputs.gradeDistribution) {
    const { A = 0, B = 0, C = 0 } = inputs.gradeDistribution;
    if (isNaN(A) || isNaN(B) || isNaN(C) || A < 0 || B < 0 || C < 0) {
      errors.grades = 'Grade percentages cannot be negative or invalid.';
    } else {
      const gradeSum = A + B + C;
      if (Math.abs(gradeSum - 100) > GRADE_DISTRIBUTION_TOLERANCE) {
        errors.grades = `Grade percentages must total exactly 100% (currently ${gradeSum}%).`;
      }
    }
  }

  if (inputs.spoilage.mode === 'manual') {
    const manualVal = Number(inputs.spoilage.manualPercentage);
    if (isNaN(manualVal) || manualVal < 0 || manualVal > 100) {
      errors.spoilage = 'Manual spoilage percentage must be between 0% and 100%.';
    }
  } else {
    const delay = Number(inputs.spoilage.delayHours);
    if (isNaN(delay) || delay < 0) {
      errors.spoilage = 'Delay hours cannot be negative.';
    }
  }

  if (inputs.transport.type === 'own') {
    const own = inputs.transport.ownVehicle;
    if (isNaN(own.capacityQuintals) || own.capacityQuintals <= 0) {
      errors.vehicleCapacity = 'Vehicle capacity must be greater than zero.';
    }
    if (isNaN(own.mileageKmPerLitre) || own.mileageKmPerLitre <= 0) {
      errors.mileage = 'Vehicle mileage must be greater than 0 km/L.';
    }
    if (isNaN(own.fuelPricePerLitre) || own.fuelPricePerLitre < 0) {
      errors.fuelPrice = 'Fuel price cannot be negative.';
    }
    if (isNaN(own.maintenancePerKm) || own.maintenancePerKm < 0) {
      errors.maintenance = 'Maintenance cost cannot be negative.';
    }
    if (isNaN(own.driverCostPerTrip) || own.driverCostPerTrip < 0) {
      errors.driverCost = 'Driver cost cannot be negative.';
    }
    if (isNaN(own.tollAndOtherExpenses) || own.tollAndOtherExpenses < 0) {
      errors.tollExpenses = 'Toll expenses cannot be negative.';
    }
  } else {
    const rented = inputs.transport.rentedVehicle;
    if (isNaN(rented.capacityQuintals) || rented.capacityQuintals <= 0) {
      errors.vehicleCapacity = 'Rented vehicle capacity must be greater than zero.';
    }
    if (rented.rentalRatePerKm !== undefined) {
      if (isNaN(rented.rentalRatePerKm) || rented.rentalRatePerKm <= 0) {
        errors.rentalRate = 'Rental cost per kilometre must be greater than zero.';
      }
    } else {
      if (isNaN(rented.rentalQuotationPerTrip) || rented.rentalQuotationPerTrip < 0) {
        errors.rentalQuote = 'Rental quotation cannot be negative.';
      }
      if (isNaN(rented.additionalChargesPerTrip) || rented.additionalChargesPerTrip < 0) {
        errors.additionalCharges = 'Additional charges cannot be negative.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
