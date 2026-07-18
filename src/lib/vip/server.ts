import {
  TIERS, getTier,
  type Tier, type VipTier, type TierSource, type Benefit,
} from './membership';

// Server-only VIP backend access (C-128). Calls the real VIP read-surface
// (identity-service) via the gateway with the inter-service key, and maps the
// backend rows to the frontend shape. Everything degrades to the curated sample so
// the page is never blank / never 500s. NEW-A: the gateway URL is server-only
// (API_GATEWAY_URL) — never shipped to the client.
const GW = process.env.API_GATEWAY_URL ?? '';

const gwHeaders = () => ({
  'Content-Type': 'application/json',
  'x-request-id': crypto.randomUUID(),
  ...(process.env.INTERNAL_SECRET && { 'x-internal-key': process.env.INTERNAL_SECRET }),
});

// backend (vip_tier_defs) → frontend Tier. Benefits name the OWNING app that
// enforces the value — VIP presents the eligibility, it sets no value (P5).
export function tierFromBackend(t: Record<string, unknown>): Tier {
  const benefits = Array.isArray(t.benefits) ? (t.benefits as Record<string, unknown>[]) : [];
  return {
    id:       String(t.tier ?? '') as VipTier,
    label:    String(t.label ?? ''),
    price:    Number(t.price ?? 0),
    source:   String(t.source ?? 'SUBSCRIPTION') as TierSource,
    requires: t.requires ? String(t.requires) : undefined,
    summary:  String(t.summary ?? ''),
    benefits: benefits.map((b): Benefit => ({ app: String(b.app ?? ''), label: String(b.label ?? '') })),
  };
}

export interface ResolvedMembership {
  currentTier: VipTier;
  tiers:       Tier[];
  source:      'live' | 'sample';
}

// The caller's OWN membership (current tier) + the tier catalog — live backend
// first, curated sample as fallback. `owner` is derived from the session by the BFF
// (never a client param, P6); when absent or unknown, the sample is served.
export async function resolveMembership(owner: string | null): Promise<ResolvedMembership> {
  if (GW && owner) {
    try {
      const res = await fetch(`${GW}/api/identity/vip/membership/${encodeURIComponent(owner)}`, {
        headers: gwHeaders(), cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const rows = data?.data?.tiers;
        const currentTier = data?.data?.currentTier as VipTier | undefined;
        if (Array.isArray(rows) && currentTier) {
          return { currentTier, tiers: rows.map((t) => tierFromBackend(t as Record<string, unknown>)), source: 'live' };
        }
      }
    } catch { /* fall through to the curated sample */ }
  }
  return { currentTier: 'STANDARD', tiers: TIERS, source: 'sample' };
}

export interface ResolvedTier { tier: Tier | null; source: 'live' | 'sample'; }

// One tier by id — live catalog first, sample fallback. A live catalog that omits
// the id is authoritative (tier: null, source: 'live').
export async function resolveTier(id: string): Promise<ResolvedTier> {
  if (GW) {
    try {
      const res = await fetch(`${GW}/api/identity/vip/tiers`, { headers: gwHeaders(), cache: 'no-store' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const rows = data?.data?.tiers;
        if (Array.isArray(rows)) {
          const found = rows.map((t) => tierFromBackend(t as Record<string, unknown>)).find((t) => t.id === id);
          return { tier: found ?? null, source: 'live' };
        }
      }
    } catch { /* fall through to the curated sample */ }
  }
  return { tier: getTier(id), source: 'sample' };
}
