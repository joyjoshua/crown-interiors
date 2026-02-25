import { describe, it, expect } from 'vitest';
import { validators, validateServices } from '../validators';

describe('validators.required', () => {
  it('returns true for non-empty string', () => {
    expect(validators.required('hello')).toBe(true);
  });

  it('returns error for empty string', () => {
    expect(validators.required('')).toBe('This field is required');
  });

  it('returns error for whitespace-only string', () => {
    expect(validators.required('   ')).toBe('This field is required');
  });

  it('returns error for null', () => {
    expect(validators.required(null)).toBe('This field is required');
  });

  it('returns error for undefined', () => {
    expect(validators.required(undefined)).toBe('This field is required');
  });

  it('returns true for a number', () => {
    expect(validators.required(42)).toBe(true);
  });
});

describe('validators.email', () => {
  it('returns true for valid email', () => {
    expect(validators.email('test@example.com')).toBe(true);
  });

  it('returns true for empty value (optional)', () => {
    expect(validators.email('')).toBe(true);
  });

  it('returns error for invalid email', () => {
    expect(validators.email('not-an-email')).toBe('Invalid email address');
  });

  it('returns error for email without domain', () => {
    expect(validators.email('test@')).toBe('Invalid email address');
  });
});

describe('validators.phone', () => {
  it('returns true for valid 10-digit number', () => {
    expect(validators.phone('9876543210')).toBe(true);
  });

  it('returns true for +91 prefixed number', () => {
    expect(validators.phone('+91 9876543210')).toBe(true);
  });

  it('returns true for empty value (optional)', () => {
    expect(validators.phone('')).toBe(true);
  });

  it('returns error for invalid phone', () => {
    expect(validators.phone('12345')).toBe('Invalid phone number');
  });
});

describe('validators.positiveNumber', () => {
  it('returns true for positive number', () => {
    expect(validators.positiveNumber(10)).toBe(true);
  });

  it('returns true for positive string number', () => {
    expect(validators.positiveNumber('25.5')).toBe(true);
  });

  it('returns error for zero', () => {
    expect(validators.positiveNumber(0)).toBe('Must be a positive number');
  });

  it('returns error for negative number', () => {
    expect(validators.positiveNumber(-5)).toBe('Must be a positive number');
  });

  it('returns error for non-numeric string', () => {
    expect(validators.positiveNumber('abc')).toBe('Must be a positive number');
  });
});

describe('validators.minLength', () => {
  const min3 = validators.minLength(3);

  it('returns true for string meeting minimum length', () => {
    expect(min3('abc')).toBe(true);
  });

  it('returns error for string below minimum length', () => {
    expect(min3('ab')).toBe('Must be at least 3 characters');
  });
});

describe('validators.maxLength', () => {
  const max5 = validators.maxLength(5);

  it('returns true for string within max length', () => {
    expect(max5('abc')).toBe(true);
  });

  it('returns true for empty/null value', () => {
    expect(max5('')).toBe(true);
  });

  it('returns error for string exceeding max length', () => {
    expect(max5('abcdef')).toBe('Must be less than 5 characters');
  });
});

describe('validateServices', () => {
  it('returns error for null', () => {
    expect(validateServices(null)).toBe('Add at least one service');
  });

  it('returns error for empty array', () => {
    expect(validateServices([])).toBe('Add at least one service');
  });

  it('returns error when no service has valid description and rate', () => {
    const services = [
      { description: '', rate: 0 },
      { description: '  ', rate: 0 },
    ];
    expect(validateServices(services)).toBe('Add at least one service with a description and rate');
  });

  it('returns true when at least one service has description and positive rate', () => {
    const services = [
      { description: 'Carpentry work', rate: 500 },
    ];
    expect(validateServices(services)).toBe(true);
  });

  it('returns true even if some services are empty, as long as one is valid', () => {
    const services = [
      { description: '', rate: 0 },
      { description: 'Painting', rate: 1200 },
    ];
    expect(validateServices(services)).toBe(true);
  });
});
