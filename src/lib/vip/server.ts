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
  currentTier: VipTier | null;   // the caller's OWN membership — null unless live
  tiers:       Tier[];
  source:      'live' | 'catalog';
}

// The tier CATALOG (definitional — VIP owns the tier ladder, like Nexus templates /
// FundX charters) + the caller's OWN current tier. Real data end-to-end (C-135 §4):
// the tier ladder is legitimate product content, but membership is the user's own
// data — with no session / an unreachable backend, currentTier is null (never a
// fabricated "STANDARD"). `owner` is derived from the session by the BFF (P6).
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
    } catch { /* fall through to the definitional catalog (membership unknown) */ }
  }
  return { currentTier: null, tiers: TIERS, source: 'catalog' };
}

export interface ResolvedTier { tier: Tier | null; source: 'live' | 'catalog'; }

// One tier by id from the definitional catalog — live backend first, local catalog
// otherwise (tier definitions are VIP's own product content, not user data). A live
// catalog that omits the id is authoritative (tier: null, source: 'live').
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
    } catch { /* fall through to the definitional catalog */ }
  }
  return { tier: getTier(id), source: 'catalog' };
}
