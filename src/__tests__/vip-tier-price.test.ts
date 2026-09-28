import { describe, it, expect } from 'vitest';
import { tierFromBackend } from '@/lib/vip/server';

// C13 — the backend served STANDARD at 50π and earned tiers at 30–1000π. The mapper
// keeps a price only for a SUBSCRIPTION tier, so even an older backend row cannot put
// a π/month on a tier that is earned or verified.
describe('tierFromBackend — price', () => {
  it('keeps the price of the sold tier', () => {
    expect(tierFromBackend({ tier: 'STANDARD', source: 'SUBSCRIPTION', price: 5 }).price).toBe(5);
  });

  it('drops the price of earned / verified tiers, whatever the row says', () => {
    expect(tierFromBackend({ tier: 'ELITE', source: 'ELITE_EARNED', price: 30 }).price).toBeNull();
    expect(tierFromBackend({ tier: 'MERCHANT', source: 'VERIFIED_ROLE', price: 100 }).price).toBeNull();
    expect(tierFromBackend({ tier: 'ELITE', source: 'ELITE_EARNED', price: null }).price).toBeNull();
  });

  it('a sold tier with no usable price shows none rather than π 0', () => {
    expect(tierFromBackend({ tier: 'STANDARD', source: 'SUBSCRIPTION', price: 0 }).price).toBeNull();
  });
});
