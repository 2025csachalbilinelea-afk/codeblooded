/**
 * Formats monetary amounts in Indian Rupees (INR) with appropriate negative sign handling
 */
export function formatINR(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  });

  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatPercent(value: number, precision = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(precision)}%`;
}

