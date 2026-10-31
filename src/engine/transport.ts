import { TransportConfig } from '../types/agriculture';

export interface TransportCostCalculation {
  totalCost: number;
  tripsCount: number;
  totalDistanceKm: number;
  fuelCost: number;
  maintenanceCost: number;
  driverCost: number;
  tollsAndOtherCost: number;
  rentalCharges: number;
  costPerQuintal: number;
  isFeasible: boolean;
  feasibilityReason?: string;
}

/**
 * Calculates transportation cost and logistics feasibility for transporting a given harvest
 * to a market at a specified one-way distance.
 *
 * Rules:
 * - Own vehicle: calculates fuel, maintenance, driver batta, and tolls.
 *   Respects returnTripRequired (round-trip = 2 × one-way distance).
 * - Rented vehicle: flat or distance-scaled quotation plus loading/permits.
 *   Commercial quotation includes fuel and driver charges (no double-counting).
 * - All non-positive capacity, non-positive mileage, and negative prices are caught as infeasible.
 * - Non-positive harvest quantity is flagged as infeasible with zero costs.
 */
export function calculateTransportationCost(
  config: TransportConfig,
  distanceKm: number,
  quantityQuintals: number
): TransportCostCalculation {
  if (quantityQuintals <= 0 || isNaN(quantityQuintals) || !isFinite(quantityQuintals)) {
    return {
      totalCost: 0,
      tripsCount: 0,
      totalDistanceKm: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      driverCost: 0,
      tollsAndOtherCost: 0,
      rentalCharges: 0,
      costPerQuintal: 0,
      isFeasible: false,
      feasibilityReason: 'Consignment quantity must be greater than zero.',
    };
  }

  if (distanceKm < 0 || isNaN(distanceKm) || !isFinite(distanceKm)) {
    return {
      totalCost: 0,
      tripsCount: 0,
      totalDistanceKm: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      driverCost: 0,
      tollsAndOtherCost: 0,
      rentalCharges: 0,
      costPerQuintal: 0,
      isFeasible: false,
      feasibilityReason: 'Transit distance cannot be negative or invalid.',
    };
  }

  if (config.type === 'own') {
    const own = config.ownVehicle;
    if (isNaN(own.capacityQuintals) || own.capacityQuintals <= 0) {
      return {
        totalCost: 0,
        tripsCount: 0,
        totalDistanceKm: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        driverCost: 0,
        tollsAndOtherCost: 0,
        rentalCharges: 0,
        costPerQuintal: 0,
        isFeasible: false,
        feasibilityReason: 'Vehicle carrying capacity must be greater than zero.',
      };
    }

    if (isNaN(own.mileageKmPerLitre) || own.mileageKmPerLitre <= 0) {
      return {
        totalCost: 0,
        tripsCount: 0,
        totalDistanceKm: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        driverCost: 0,
        tollsAndOtherCost: 0,
        rentalCharges: 0,
        costPerQuintal: 0,
        isFeasible: false,
        feasibilityReason: 'Vehicle mileage must be greater than zero.',
      };
    }

    if (isNaN(own.fuelPricePerLitre) || own.fuelPricePerLitre <= 0) {
      return {
        totalCost: 0,
        tripsCount: 0,
        totalDistanceKm: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        driverCost: 0,
        tollsAndOtherCost: 0,
        rentalCharges: 0,
        costPerQuintal: 0,
        isFeasible: false,
        feasibilityReason: 'Fuel price must be greater than zero.',
      };
    }

    const tripsCount = Math.max(1, Math.ceil(quantityQuintals / own.capacityQuintals));
    const distancePerTrip = own.returnTripRequired ? distanceKm * 2 : distanceKm;
    const totalDistanceKm = tripsCount * distancePerTrip;

    // Feasibility check: Making excessive trips (>4 trips) to distant markets (>80 km)
    // is physically infeasible in a single day before harvest deteriorates
    let isFeasible = true;
    let feasibilityReason: string | undefined;
    if (tripsCount > 4 && distanceKm > 80) {
      isFeasible = false;
      feasibilityReason = `Consignment requires ${tripsCount} round-trips over ${distanceKm} km (${totalDistanceKm} km total), which is physically infeasible for a single vehicle before produce spoils.`;
    }

    const fuelLitres = totalDistanceKm / own.mileageKmPerLitre;
    const fuelCost = Math.round(fuelLitres * own.fuelPricePerLitre);
    const maintenanceCost = Math.round(totalDistanceKm * Math.max(0, own.maintenancePerKm || 0));
    const driverCost = Math.round(tripsCount * Math.max(0, own.driverCostPerTrip || 0));
    const tollsAndOtherCost = Math.round(tripsCount * Math.max(0, own.tollAndOtherExpenses || 0));

    const totalCost = fuelCost + maintenanceCost + driverCost + tollsAndOtherCost;
    const costPerQuintal = quantityQuintals > 0 ? Number((totalCost / quantityQuintals).toFixed(2)) : 0;

    return {
      totalCost,
      tripsCount,
      totalDistanceKm,
      fuelCost,
      maintenanceCost,
      driverCost,
      tollsAndOtherCost,
      rentalCharges: 0,
      costPerQuintal,
      isFeasible,
      feasibilityReason,
    };
  } else {
    // Rented vehicle
    const rented = config.rentedVehicle;
    if (isNaN(rented.capacityQuintals) || rented.capacityQuintals <= 0) {
      return {
        totalCost: 0,
        tripsCount: 0,
        totalDistanceKm: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        driverCost: 0,
        tollsAndOtherCost: 0,
        rentalCharges: 0,
        costPerQuintal: 0,
        isFeasible: false,
        feasibilityReason: 'Rented vehicle capacity must be greater than zero.',
      };
    }

    if (rented.rentalRatePerKm !== undefined && rented.rentalRatePerKm > 0) {
      if (isNaN(rented.rentalRatePerKm) || rented.rentalRatePerKm < 0) {
        return {
          totalCost: 0,
          tripsCount: 0,
          totalDistanceKm: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          driverCost: 0,
          tollsAndOtherCost: 0,
          rentalCharges: 0,
          costPerQuintal: 0,
          isFeasible: false,
          feasibilityReason: 'Rental rate per kilometre cannot be negative.',
        };
      }

      const tripsCount = Math.max(1, Math.ceil(quantityQuintals / rented.capacityQuintals));
      const totalDistanceKm = tripsCount * distanceKm * 2; // round-trip distance

      let isFeasible = true;
      let feasibilityReason: string | undefined;
      if (tripsCount > 4 && distanceKm > 80) {
        isFeasible = false;
        feasibilityReason = `Consignment requires ${tripsCount} rental trips over ${distanceKm} km, which is practically infeasible for single-day delivery.`;
      }

      const totalRentalCost = Math.round(totalDistanceKm * rented.rentalRatePerKm);
      const costPerQuintal = quantityQuintals > 0 ? Number((totalRentalCost / quantityQuintals).toFixed(2)) : 0;

      return {
        totalCost: totalRentalCost,
        tripsCount,
        totalDistanceKm,
        fuelCost: 0,
        maintenanceCost: 0,
        driverCost: 0,
        tollsAndOtherCost: 0,
        rentalCharges: totalRentalCost,
        costPerQuintal,
        isFeasible,
        feasibilityReason,
      };
    }

    if (isNaN(rented.rentalQuotationPerTrip) || rented.rentalQuotationPerTrip < 0) {
      return {
        totalCost: 0,
        tripsCount: 0,
        totalDistanceKm: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        driverCost: 0,
        tollsAndOtherCost: 0,
        rentalCharges: 0,
        costPerQuintal: 0,
        isFeasible: false,
        feasibilityReason: 'Rental quotation cannot be negative.',
      };
    }

    const tripsCount = Math.max(1, Math.ceil(quantityQuintals / rented.capacityQuintals));
    const totalDistanceKm = tripsCount * distanceKm * 2;

    let isFeasible = true;
    let feasibilityReason: string | undefined;
    if (tripsCount > 4 && distanceKm > 80) {
      isFeasible = false;
      feasibilityReason = `Consignment requires ${tripsCount} rental trips over ${distanceKm} km, which is practically infeasible for single-day delivery.`;
    }

    const rentalModel = rented.rentalModel || 'distance_scaled';
    let tripRental = rented.rentalQuotationPerTrip;
    if (rentalModel === 'distance_scaled') {
      const distanceRatio = Math.max(0.4, distanceKm / 50);
      tripRental = Math.round(rented.rentalQuotationPerTrip * distanceRatio);
    }

    const totalRental = Math.round(tripsCount * tripRental);
    const totalAdditional = Math.round(tripsCount * Math.max(0, rented.additionalChargesPerTrip || 0));

    // In rented mode: fuel, maintenance, driver are included in quotation (no double-counting)
    const totalCost = totalRental + totalAdditional;
    const costPerQuintal = quantityQuintals > 0 ? Number((totalCost / quantityQuintals).toFixed(2)) : 0;

    return {
      totalCost,
      tripsCount,
      totalDistanceKm,
      fuelCost: 0,
      maintenanceCost: 0,
      driverCost: 0,
      tollsAndOtherCost: totalAdditional,
      rentalCharges: totalRental,
      costPerQuintal,
      isFeasible,
      feasibilityReason,
    };
  }
}
