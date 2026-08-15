// TEC VIP — Premium Experience Runtime (C-128) — read-only V1 data.
//
// VIP = System of Privilege (cross-cutting): it translates recognition + achievement
// into premium experiences ACROSS the ecosystem ("What exclusive benefits do I
// receive?"). It is the reward layer of Legend (evidence) → Elite (recognition) →
// VIP (experience).
//
// CONSTITUTIONAL RULES (C-128):
//  • VIP owns NO economic capability — it adds an experience layer ON TOP of the
//    owning apps. A benefit is an ELIGIBILITY; the owning app + System define and
//    enforce the actual value (P5). Numbers below are illustrative shapes.
//  • VIP_ELITE tier requires an Elite recognition (C-127). VIP cannot grant Elite
//    recognition, modify Legend records, or execute payments (payment-service).
//  • V1 already exists as Hub PRO/ENTERPRISE; this app is the read-only surface.

export type VipTier =
  | 'STANDARD' | 'ELITE' | 'MERCHANT' | 'INVESTOR' | 'FOUNDER' | 'PARTNER';

// How a tier is obtained (P5: earned tiers require verification elsewhere).
export type TierSource = 'SUBSCRIPTION' | 'ELITE_EARNED' | 'VERIFIED_ROLE';

export interface Benefit {
  app:   string;          // the OWNING app that enforces the benefit
  label: string;          // an eligibility shape — NOT a VIP-set policy
}

export interface Tier {
  id:          VipTier;
  label:       string;
  price:       number;          // π/month — the subscription surface only
  source:      TierSource;
  requires?:   string;          // what unlocks it (e.g. "Elite recognition")
  summary:     string;
  benefits:    Benefit[];
}

export const TIERS: Tier[] = [
  {
    id: 'STANDARD',
    label: 'VIP Standard',
    price: 50,
    source: 'SUBSCRIPTION',
    summary: 'Priority in every queue + advanced analytics for any pioneer.',
    benefits: [
      { app: 'Commerce', label: 'Reduced fees (defined + enforced by Commerce)' },
      { app: 'Hub',      label: 'Priority support (< 2hr)' },
      { app: 'Analytics', label: 'Advanced analytics dashboards' },
    ],
  },
  {
    id: 'ELITE',
    label: 'VIP Elite',
    price: 30,
    source: 'ELITE_EARNED',
    requires: 'Elite recognition — earned, not bought',
    summary: 'All Standard + exclusive access, unlocked by an Elite recognition.',
    benefits: [
      { app: 'Connection', label: 'Exclusive events + VIP lounge' },
      { app: 'FundX',      label: 'Early access to investment opportunities' },
      { app: 'Zone',       label: 'Priority verification processing' },
    ],
  },
  {
    id: 'MERCHANT',
    label: 'VIP Merchant',
    price: 100,
    source: 'VERIFIED_ROLE',
    requires: 'Zone-verified merchant',
    summary: 'For verified Commerce merchants — featured placement + priority.',
    benefits: [
      { app: 'Commerce', label: 'Featured placement + VIP store (fees set by Commerce)' },
      { app: 'Zone',     label: 'Priority merchant verification' },
    ],
  },
  {
    id: 'INVESTOR',
    label: 'VIP Investor',
    price: 200,
    source: 'VERIFIED_ROLE',
    requires: 'Verified FundX investor',
    summary: 'For verified FundX investors — early + exclusive access.',
    benefits: [
      { app: 'FundX', label: '48hr early access before public (windows set by FundX)' },
      { app: 'FundX', label: 'Exclusive high-value pools (governed by FundX)' },
    ],
  },
  {
    id: 'FOUNDER',
    label: 'VIP Founder',
    price: 500,
    source: 'VERIFIED_ROLE',
    requires: 'Verified NBF / Epic project founder',
    summary: 'For verified founders — incubator, dedicated manager, priority verification.',
    benefits: [
      { app: 'Epic',       label: 'Priority Zone verification + incubator access' },
      { app: 'Connection', label: 'Founder mastermind + dedicated account manager' },
    ],
  },
  {
    id: 'PARTNER',
    label: 'VIP Partner',
    price: 1000,
    source: 'VERIFIED_ROLE',
    requires: 'Institutional Pi partner',
    summary: 'Institutional partnership — full concierge + custom integration.',
    benefits: [
      { app: 'Titan',     label: 'Enterprise onboarding + custom integration' },
      { app: 'Analytics', label: 'B2B intelligence + API access' },
    ],
  },
];

// Concierge is a VIP-owned service (async assistant / priority support).
export const CONCIERGE = {
  label: 'Concierge',
  summary: 'Personal async assistant, priority support, and service coordination — SLA scales with tier.',
  slaByTier: { STANDARD: '< 2hr', ELITE: '< 2hr', MERCHANT: '< 1hr', INVESTOR: '< 1hr', FOUNDER: '< 30m', PARTNER: '< 30m' } as Record<VipTier, string>,
};

export const SOURCE_META: Record<TierSource, { label: string; tone: string }> = {
  SUBSCRIPTION:  { label: 'Subscription',    tone: '#3B82F6' },
  ELITE_EARNED:  { label: 'Elite-earned',    tone: '#FBBF24' },
  VERIFIED_ROLE: { label: 'Verified role',   tone: '#22C55E' },
};

// The current membership (when live: read from vip-service by session identity).
export const CURRENT_TIER: VipTier = 'STANDARD';

export function getTier(id: string): Tier | null {
  return TIERS.find((t) => t.id === id) ?? null;
}
