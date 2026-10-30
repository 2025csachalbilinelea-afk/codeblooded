import { FarmerInputs } from '../types/agriculture';

export interface DemoScenario {
  id: string;
  badge: string;
  title: string;
  summary: string;
  keyInsight: string;
  expectedOutcome: string;
  inputs: FarmerInputs;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-a',
    badge: 'Scenario A',
    title: 'High-Price Trap (Quota Exceeded)',
    summary:
      'Distant boutique hub advertises top Grade A rate (₹3,260/Qtl) but is strictly capped at 12 Qtl for a 25 Qtl harvest.',
    keyInsight:
      'Sahyadri Agro-Export Hub advertises highest rate but is disqualified for single-market sale due to quota. Central APMC is the optimal feasible single pick.',
    expectedOutcome: 'Best Feasible Single Market: Central APMC (Sahyadri marked Infeasible Single Sale).',
    inputs: {
      cropId: 'tomato',
      quantity: 25,
      quantityUnit: 'quintal',
      harvestDate: new Date().toISOString().split('T')[0],
      maturity: 'optimal',
      originLocation: 'Navalgund Farm Gate, Dharwad Hub',
      gradeDistribution: { A: 50, B: 35, C: 15 },
      spoilage: {
        mode: 'automatic',
        manualPercentage: 4,
        temperature: 'warm',
        vehicleProtection: 'open',
        handling: 'standard',
        delayHours: 1,
      },
      transport: {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 8,
          fuelPricePerLitre: 96,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: true,
        },
        rentedVehicle: {
          rentalQuotationPerTrip: 3500,
          capacityQuintals: 30,
          additionalChargesPerTrip: 400,
          rentalModel: 'distance_scaled',
        },
      },
    },
  },
  {
    id: 'scenario-b',
    badge: 'Scenario B',
    title: 'Split-Harvest Advantage',
    summary:
      'Consignment of 25 Qtl with 80% Grade A. Dividing volume between a high-price quota hub and a regional mandi maximizes net profits.',
    keyInsight:
      'Allocating 12 Qtl to Sahyadri (capturing ₹3,260/Qtl quota) + 13 Qtl to Central APMC yields +₹2,125 more net in-pocket profit than any single mandi.',
    expectedOutcome: 'Recommended Strategy: Split Harvest (+₹2,125 net profit gain over Central APMC).',
    inputs: {
      cropId: 'tomato',
      quantity: 25,
      quantityUnit: 'quintal',
      harvestDate: new Date().toISOString().split('T')[0],
      maturity: 'optimal',
      originLocation: 'Navalgund Farm Gate, Dharwad Hub',
      gradeDistribution: { A: 80, B: 15, C: 5 },
      spoilage: {
        mode: 'automatic',
        manualPercentage: 4,
        temperature: 'warm',
        vehicleProtection: 'open',
        handling: 'standard',
        delayHours: 1,
      },
      transport: {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 8,
          fuelPricePerLitre: 96,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: true,
        },
        rentedVehicle: {
          rentalQuotationPerTrip: 3500,
          capacityQuintals: 30,
          additionalChargesPerTrip: 400,
          rentalModel: 'distance_scaled',
        },
      },
    },
  },
  {
    id: 'scenario-c',
    badge: 'Scenario C',
    title: 'Local Perishable Produce (Heat Wilting)',
    summary:
      'Leafy green spinach in hot weather (>35°C). Long haul to distant metro causes severe transit wilting and bruising.',
    keyInsight:
      'Metro Terminal (165 km) advertises higher rates, but 24% spoilage in hot open transport erodes value. Local Kisan Gramin (18 km) delivers ₹9,208 MORE in net profit.',
    expectedOutcome: 'Nearby Mandi Wins: Kisan Gramin beats Metro Terminal by +₹9,208 due to freshness preservation.',
    inputs: {
      cropId: 'spinach',
      quantity: 15,
      quantityUnit: 'quintal',
      harvestDate: new Date().toISOString().split('T')[0],
      maturity: 'optimal',
      originLocation: 'Navalgund Farm Gate, Dharwad Hub',
      gradeDistribution: { A: 60, B: 30, C: 10 },
      spoilage: {
        mode: 'automatic',
        manualPercentage: 4,
        temperature: 'hot',
        vehicleProtection: 'open',
        handling: 'rough',
        delayHours: 2,
      },
      transport: {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 8,
          fuelPricePerLitre: 96,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: true,
        },
        rentedVehicle: {
          rentalQuotationPerTrip: 3500,
          capacityQuintals: 30,
          additionalChargesPerTrip: 400,
          rentalModel: 'distance_scaled',
        },
      },
    },
  },
  {
    id: 'scenario-d',
    badge: 'Scenario D',
    title: 'Single-Market Preference (Low Overhead)',
    summary:
      'Modest 10 Qtl harvest. Duplicate vehicle transit legs, driver wages, and double mandi entry fees make splitting counterproductive.',
    keyInsight:
      'Consolidating at local Kisan Gramin Sub-Mandi (18 km) avoids ₹3,000+ in unnecessary duplicate logistics. Split is rejected as unprofitable.',
    expectedOutcome: 'Recommended Strategy: Single Market (Consolidation at Kisan Gramin Sub-Mandi).',
    inputs: {
      cropId: 'tomato',
      quantity: 10,
      quantityUnit: 'quintal',
      harvestDate: new Date().toISOString().split('T')[0],
      maturity: 'optimal',
      originLocation: 'Navalgund Farm Gate, Dharwad Hub',
      gradeDistribution: { A: 40, B: 40, C: 20 },
      spoilage: {
        mode: 'automatic',
        manualPercentage: 4,
        temperature: 'warm',
        vehicleProtection: 'open',
        handling: 'standard',
        delayHours: 1,
      },
      transport: {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 8,
          fuelPricePerLitre: 96,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: true,
        },
        rentedVehicle: {
          rentalQuotationPerTrip: 3500,
          capacityQuintals: 30,
          additionalChargesPerTrip: 400,
          rentalModel: 'distance_scaled',
        },
      },
    },
  },
  {
    id: 'scenario-e',
    badge: 'Scenario E',
    title: 'No Feasible Destination (Capacity Ceiling)',
    summary:
      'Commercial volume of 1,000 Quintals exceeds the purchase capacities of all regional spot mandis (largest is 650 Qtl).',
    keyInsight:
      'Neither single-market sale nor multi-mandi split can accommodate 1,000 Qtl. The engine alerts the farmer to seek institutional contract procurement.',
    expectedOutcome: 'Feasibility Alert: 0 Feasible Markets Found; guidance provided to downscale or contract.',
    inputs: {
      cropId: 'tomato',
      quantity: 1000,
      quantityUnit: 'quintal',
      harvestDate: new Date().toISOString().split('T')[0],
      maturity: 'optimal',
      originLocation: 'Navalgund Farm Gate, Dharwad Hub',
      gradeDistribution: { A: 50, B: 35, C: 15 },
      spoilage: {
        mode: 'automatic',
        manualPercentage: 4,
        temperature: 'warm',
        vehicleProtection: 'open',
        handling: 'standard',
        delayHours: 1,
      },
      transport: {
        type: 'own',
        ownVehicle: {
          capacityQuintals: 25,
          mileageKmPerLitre: 8,
          fuelPricePerLitre: 96,
          maintenancePerKm: 2,
          driverCostPerTrip: 500,
          tollAndOtherExpenses: 200,
          returnTripRequired: true,
        },
        rentedVehicle: {
          rentalQuotationPerTrip: 3500,
          capacityQuintals: 30,
          additionalChargesPerTrip: 400,
          rentalModel: 'distance_scaled',
        },
      },
    },
  },
];

