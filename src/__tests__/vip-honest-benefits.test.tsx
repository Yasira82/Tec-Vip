/**
 * VIP must not sell, or present as active, benefits that no app gives.
 *
 * C-128: VIP grants eligibility; the OWNING app enforces the value. As of 16 Nov 2026 no
 * owning app honours a single VIP benefit (VipPro's own header says so) — yet the tier
 * pages listed "reduced fees", "priority support < 2hr" as plain facts, and VIP Standard
 * was on sale at 5π. A tester reading that, then paying, would get nothing VIP-specific.
 *
 * The rule pinned here: a benefit is "coming soon" unless it is marked live; a tier is on
 * sale only when it has a price AND at least one live benefit. When an owning app starts
 * honouring a benefit, marking it live puts VIP Standard back on sale — no other change.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TIERS, getTier, onSale, CONCIERGE, type Tier } from '@/lib/vip/membership';
import { tierFromBackend } from '@/lib/vip/server';

vi.mock('@/components/pro/CancelProButton', () => ({ CancelProButton: () => null }));
import VipPro from '@/app/app/components/VipPro';

describe('what VIP claims', () => {
  it('no benefit is presented as live while no owning app honours it', () => {
    for (const t of TIERS) for (const b of t.benefits) expect(b.live ?? false, `${t.id} · ${b.label}`).toBe(false);
    expect(CONCIERGE.live).toBe(false);
  });

  it('VIP Standard is not on sale with no live benefit', () => {
    expect(onSale(getTier('STANDARD')!)).toBe(false);
  });

  it('it goes on sale the day one of its benefits is honoured', () => {
    const t = getTier('STANDARD')!;
    const live: Tier = { ...t, benefits: t.benefits.map((b, i) => ({ ...b, live: i === 0 })) };
    expect(onSale(live)).toBe(true);
  });

  it('an earned tier is never on sale, live benefits or not', () => {
    const e = getTier('ELITE')!;
    expect(onSale({ ...e, benefits: e.benefits.map((b) => ({ ...b, live: true })) })).toBe(false);
  });

  it('the backend marks a benefit live only with an explicit true', () => {
    const t = tierFromBackend({ tier: 'STANDARD', source: 'SUBSCRIPTION', price: 5,
      benefits: [{ app: 'Hub', label: 'x' }, { app: 'Hub', label: 'y', live: 'yes' }, { app: 'Hub', label: 'z', live: true }] });
    expect(t.benefits.map((b) => b.live)).toEqual([false, false, true]);
  });
});

describe('the Subscribe tab', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ data: { subscription: { plan: 'FREE' } } }) }) as never;
  });

  it('offers no payment for VIP Standard while it is not on sale', async () => {
    render(<VipPro />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /subscribe with pi/i })).toBeNull();
    expect(screen.getByText(/not on sale yet/i)).toBeTruthy();
  });
});
