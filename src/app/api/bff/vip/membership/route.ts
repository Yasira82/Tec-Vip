import { NextResponse } from 'next/server';
import { TIERS, CONCIERGE, CURRENT_TIER } from '@/lib/vip/membership';

// GET /api/bff/vip/membership — the premium experience surface (C-128), read-only.
// VIP is cross-cutting: it grants ELIGIBILITY; the owning apps + System enforce the
// actual value (P5). VIP owns no economic capability, cannot grant Elite recognition
// or modify Legend. This V1 serves a curated SAMPLE (source:'sample'); when live it
// reads the caller's OWN membership from vip-service (identity from the session
// cookie, never a param — P6), checking Elite/Zone status live for earned tiers.
export function GET() {
  return NextResponse.json(
    { source: 'sample', currentTier: CURRENT_TIER, tiers: TIERS, concierge: CONCIERGE },
    { headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}
