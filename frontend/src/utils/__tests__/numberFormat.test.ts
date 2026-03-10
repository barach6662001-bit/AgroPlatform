import { describe, it, expect } from 'vitest';
import { formatUA } from '../numberFormat';

describe('formatUA', () => {
  it('formats values below 1 000 as plain decimals', () => {
    expect(formatUA(0)).toBe('0.00');
    expect(formatUA(500)).toBe('500.00');
    expect(formatUA(999.9)).toBe('999.90');
  });

  it('formats values in thousands with "тис." suffix', () => {
    expect(formatUA(1_000)).toBe('1.00 тис.');
    expect(formatUA(12_500)).toBe('12.50 тис.');
    expect(formatUA(999_999)).toBe('1000.00 тис.');
  });

  it('formats values in millions with "млн" suffix', () => {
    expect(formatUA(1_000_000)).toBe('1.00 млн');
    expect(formatUA(2_500_000)).toBe('2.50 млн');
    expect(formatUA(123_456_789)).toBe('123.46 млн');
  });

  it('handles negative values correctly', () => {
    expect(formatUA(-500)).toBe('-500.00');
    expect(formatUA(-5_000)).toBe('-5.00 тис.');
    expect(formatUA(-3_000_000)).toBe('-3.00 млн');
  });
});
