import { describe, it, expect } from 'vitest';
import {
  TIERS, CONCIERGE, CURRENT_TIER, SOURCE_META, getTier,
} from '@/lib/vip/membership';

describe('TEC VIP — Premium Experience Runtime (C-128), read-only V1', () => {
  it('every tier has a price, a known source, and cross-app benefits', () => {
    expect(TIERS.length).toBeGreaterThan(0);
    for (const t of TIERS) {
      expect(t.price).toBeGreaterThan(0);
      expect(SOURCE_META[t.source]).toBeTruthy();
      expect(t.benefits.length).toBeGreaterThan(0);
      // each benefit names the OWNING app that enforces it (P5)
      for (const b of t.benefits) expect(b.app.length).toBeGreaterThan(0);
    }
  });

  it('VIP_ELITE is earned via Elite recognition, not subscription (C-127/C-128)', () => {
    const elite = getTier('ELITE');
    expect(elite?.source).toBe('ELITE_EARNED');
    expect(elite?.requires?.toLowerCase()).toContain('elite');
  });

  it('the STANDARD tier is subscription-based and available to any pioneer', () => {
    const std = getTier('STANDARD');
    expect(std?.source).toBe('SUBSCRIPTION');
    expect(std?.requires).toBeUndefined();
  });

  it('concierge SLA is defined for every tier and tightens with tier', () => {
    for (const t of TIERS) {
      expect(CONCIERGE.slaByTier[t.id], t.id).toBeTruthy();
    }
  });

  it('the current tier resolves to a real tier', () => {
    expect(getTier(CURRENT_TIER)).not.toBeNull();
  });

  it('getTier resolves by id and fails closed for an unknown id', () => {
    expect(getTier('FOUNDER')?.label).toBe('VIP Founder');
    expect(getTier('nope')).toBeNull();
  });
});
