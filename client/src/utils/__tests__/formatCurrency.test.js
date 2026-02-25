import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyShort } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats a number as Indian Rupees with decimals', () => {
    expect(formatCurrency(1000)).toBe('₹1,000.00');
  });

  it('formats with Indian grouping (lakhs)', () => {
    expect(formatCurrency(125000)).toBe('₹1,25,000.00');
  });

  it('formats without decimals when showDecimals is false', () => {
    expect(formatCurrency(1000, false)).toBe('₹1,000');
  });

  it('returns ₹0 for null', () => {
    expect(formatCurrency(null)).toBe('₹0');
  });

  it('returns ₹0 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('₹0');
  });

  it('returns ₹0 for NaN', () => {
    expect(formatCurrency(NaN)).toBe('₹0');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });

  it('formats negative numbers', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500.00');
  });

  it('formats decimal amounts correctly', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });
});

describe('formatCurrencyShort', () => {
  it('returns ₹0 for null', () => {
    expect(formatCurrencyShort(null)).toBe('₹0');
  });

  it('returns ₹0 for undefined', () => {
    expect(formatCurrencyShort(undefined)).toBe('₹0');
  });

  it('returns ₹0 for NaN', () => {
    expect(formatCurrencyShort(NaN)).toBe('₹0');
  });

  it('formats amounts under 1000 as-is', () => {
    expect(formatCurrencyShort(500)).toBe('₹500');
  });

  it('formats thousands as K', () => {
    expect(formatCurrencyShort(45000)).toBe('₹45.0K');
  });

  it('formats lakhs as L', () => {
    expect(formatCurrencyShort(125000)).toBe('₹1.3L');
  });

  it('formats crores as Cr', () => {
    expect(formatCurrencyShort(10000000)).toBe('₹1.0Cr');
  });

  it('formats 5 crores correctly', () => {
    expect(formatCurrencyShort(50000000)).toBe('₹5.0Cr');
  });
});
