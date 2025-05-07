// src/utils/formatters.js
// Helper functions for formatting data

export const formatCurrency = (amount) => {
  // Ensure amount is a number, default to 0 if not or if NaN
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    // console.warn(`formatCurrency received non-numeric value: ${amount}. Defaulting to 0.`);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(0);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numericAmount);
};
