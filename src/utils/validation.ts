import { FarmerInputs } from '../types/agriculture';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateFarmerInputs(inputs: FarmerInputs): ValidationResult {
  const errors: Record<string, string> = {};

  if (!inputs.cropId) {
    errors.crop = 'Please select a crop.';
  }

  if (inputs.quantity <= 0 || isNaN(inputs.quantity)) {
    errors.quantity = 'Harvest quantity must be greater than zero.';
  } else if (inputs.quantity > 50000) {
    errors.quantity = 'Harvest quantity exceeds the demonstration system limit (50,000 units).';
  }

  const gradeSum = (inputs.gradeDistribution.A || 0) + (inputs.gradeDistribution.B || 0) + (inputs.gradeDistribution.C || 0);
  if (Math.abs(gradeSum - 100) > 1.0) {
    errors.grades = `Grade percentages must total exactly 100% (currently ${gradeSum}%).`;
  }

  if (inputs.spoilage.mode === 'manual') {
    if (inputs.spoilage.manualPercentage < 0 || inputs.spoilage.manualPercentage > 100 || isNaN(inputs.spoilage.manualPercentage)) {
      errors.spoilage = 'Manual spoilage percentage must be between 0% and 100%.';
    }
  }

  if (inputs.transport.type === 'own') {
    if (inputs.transport.ownVehicle.capacityQuintals <= 0 || isNaN(inputs.transport.ownVehicle.capacityQuintals)) {
      errors.vehicleCapacity = 'Vehicle capacity must be greater than zero.';
    }
    if (inputs.transport.ownVehicle.mileageKmPerLitre <= 0 || isNaN(inputs.transport.ownVehicle.mileageKmPerLitre)) {
      errors.mileage = 'Vehicle mileage must be greater than 0 km/L.';
    }
    if (inputs.transport.ownVehicle.fuelPricePerLitre < 0 || isNaN(inputs.transport.ownVehicle.fuelPricePerLitre)) {
      errors.fuelPrice = 'Fuel price cannot be negative.';
    }
  } else {
    if (inputs.transport.rentedVehicle.capacityQuintals <= 0 || isNaN(inputs.transport.rentedVehicle.capacityQuintals)) {
      errors.vehicleCapacity = 'Rented vehicle capacity must be greater than zero.';
    }
    if (inputs.transport.rentedVehicle.rentalQuotationPerTrip < 0 || isNaN(inputs.transport.rentedVehicle.rentalQuotationPerTrip)) {
      errors.rentalQuote = 'Rental quotation cannot be negative.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

