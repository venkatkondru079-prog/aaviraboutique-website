import { Currency } from '../types';

export const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string; prefix: string }> = {
  INR: { rate: 1, symbol: '₹', prefix: '₹' },
  USD: { rate: 0.012, symbol: '$', prefix: '$' },
  EUR: { rate: 0.011, symbol: '€', prefix: '€' },
  GBP: { rate: 0.0095, symbol: '£', prefix: '£' },
};

export function formatPrice(amountINR: number, currency: Currency): string {
  const config = CURRENCY_RATES[currency];
  const converted = amountINR * config.rate;

  if (currency === 'INR') {
    // Format Indian numbering system: 42,500
    return `${config.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }

  // International standard
  return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}
