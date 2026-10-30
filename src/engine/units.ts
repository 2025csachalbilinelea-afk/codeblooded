import { QuantityUnit } from '../types/agriculture';

/**
 * Standardizes any quantity unit to Quintals (1 Quintal = 100 kg, 1 Tonne = 1,000 kg = 10 Quintals)
 */
export function convertToQuintals(quantity: number, unit: QuantityUnit): number {
  if (quantity < 0 || isNaN(quantity) || !isFinite(quantity)) {
    return 0;
  }
  switch (unit) {
    case 'kg':
      return quantity / 100;
    case 'tonne':
      return quantity * 10;
    case 'quintal':
    default:
      return quantity;
  }
}

/**
 * Converts quintals back into the requested display unit
 */
export function convertFromQuintals(quintals: number, unit: QuantityUnit): number {
  if (quintals < 0 || isNaN(quintals) || !isFinite(quintals)) {
    return 0;
  }
  switch (unit) {
    case 'kg':
      return quintals * 100;
    case 'tonne':
      return quintals / 10;
    case 'quintal':
    default:
      return quintals;
  }
}

/**
 * Returns formatted string with unit symbol
 */
export function formatQuantityWithUnit(quantity: number, unit: QuantityUnit, precision = 1): string {
  const formatted = quantity.toLocaleString('en-IN', {
    maximumFractionDigits: precision,
    minimumFractionDigits: 0,
  });
  switch (unit) {
    case 'kg':
      return `${formatted} kg`;
    case 'tonne':
      return `${formatted} Tonnes`;
    case 'quintal':
    default:
      return `${formatted} Quintals`;
  }
}

