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
 */
export function calculateTransportationCost(
  config: TransportConfig,
  distanceKm: number,
  quantityQuintals: number
): TransportCostCalculation {
  if (quantityQuintals <= 0) {
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
      isFeasible: true,
    };
  }

  if (config.type === 'own') {
    const own = config.ownVehicle;
    if (own.capacityQuintals <= 0) {
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

    const tripsCount = Math.max(1, Math.ceil(quantityQuintals / own.capacityQuintals));
    const distancePerTrip = own.returnTripRequired ? distanceKm * 2 : distanceKm;
    const totalDistanceKm = tripsCount * distancePerTrip;

    // Feasibility check: Making excessive trips (>5 trips) to distant markets (>100 km)
    // is physically infeasible in a single day before harvest deteriorates
    let isFeasible = true;
    let feasibilityReason: string | undefined;
    if (tripsCount > 4 && distanceKm > 80) {
      isFeasible = false;
      feasibilityReason = `Consignment requires ${tripsCount} round-trips over ${distanceKm} km (${totalDistanceKm} km total), which is physically infeasible for a single vehicle before produce spoils.`;
    }

    const mileage = Math.max(0.1, own.mileageKmPerLitre);
    const fuelLitres = totalDistanceKm / mileage;
    const fuelCost = Math.round(fuelLitres * Math.max(0, own.fuelPricePerLitre));

    const maintenanceCost = Math.round(totalDistanceKm * Math.max(0, own.maintenancePerKm));
    const driverCost = Math.round(tripsCount * Math.max(0, own.driverCostPerTrip));
    const tollsAndOtherCost = Math.round(tripsCount * Math.max(0, own.tollAndOtherExpenses));

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
    if (rented.capacityQuintals <= 0) {
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

    const tripsCount = Math.max(1, Math.ceil(quantityQuintals / rented.capacityQuintals));
    const totalDistanceKm = tripsCount * distanceKm * 2;

    let isFeasible = true;
    let feasibilityReason: string | undefined;
    if (tripsCount > 4 && distanceKm > 80) {
      isFeasible = false;
      feasibilityReason = `Consignment requires ${tripsCount} rental trips over ${distanceKm} km, which is practically infeasible for single-day delivery.`;
    }

    // Rental calculation model:
    // When distance_scaled (default), base quotation is calibrated for a standard 50km haul.
    // Beyond that, commercial freight scales proportionally with destination distance.
    const rentalModel = rented.rentalModel || 'distance_scaled';
    let tripRental = rented.rentalQuotationPerTrip;
    if (rentalModel === 'distance_scaled') {
      const distanceRatio = Math.max(0.4, distanceKm / 50);
      tripRental = Math.round(rented.rentalQuotationPerTrip * distanceRatio);
    }

    const totalRental = Math.round(tripsCount * Math.max(0, tripRental));
    const totalAdditional = Math.round(tripsCount * Math.max(0, rented.additionalChargesPerTrip));

    // Note: In rented mode, fuel and driver are included in the quotation as per requirements
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
