import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatRelativeDate, getTimeOfDay } from '../formatDate';

describe('formatDate', () => {
  it('formats an ISO date string with default format', () => {
    const result = formatDate('2025-12-25T10:00:00.000Z');
    expect(result).toBe('25 Dec 2025');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2025, 0, 15)); // Jan 15, 2025
    expect(result).toBe('15 Jan 2025');
  });

  it('supports custom format strings', () => {
    const result = formatDate('2025-06-15T00:00:00.000Z', 'yyyy-MM-dd');
    expect(result).toBe('2025-06-15');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatRelativeDate', () => {
  it('returns empty string for null', () => {
    expect(formatRelativeDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatRelativeDate(undefined)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(formatRelativeDate('garbage')).toBe('');
  });

  it('returns a relative time string with "ago" suffix', () => {
    // 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = formatRelativeDate(oneHourAgo);
    expect(result).toContain('ago');
  });
});

describe('getTimeOfDay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "morning" before 12pm', () => {
    vi.setSystemTime(new Date(2025, 5, 15, 9, 0, 0));
    expect(getTimeOfDay()).toBe('morning');
  });

  it('returns "afternoon" between 12pm and 5pm', () => {
    vi.setSystemTime(new Date(2025, 5, 15, 14, 0, 0));
    expect(getTimeOfDay()).toBe('afternoon');
  });

  it('returns "evening" after 5pm', () => {
    vi.setSystemTime(new Date(2025, 5, 15, 19, 0, 0));
    expect(getTimeOfDay()).toBe('evening');
  });

  it('returns "morning" at midnight', () => {
    vi.setSystemTime(new Date(2025, 5, 15, 0, 0, 0));
    expect(getTimeOfDay()).toBe('morning');
  });

  it('returns "afternoon" at exactly 12pm', () => {
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    expect(getTimeOfDay()).toBe('afternoon');
  });

  it('returns "evening" at exactly 5pm', () => {
    vi.setSystemTime(new Date(2025, 5, 15, 17, 0, 0));
    expect(getTimeOfDay()).toBe('evening');
  });
});
