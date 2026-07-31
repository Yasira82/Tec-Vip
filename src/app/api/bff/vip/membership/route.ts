import { NextRequest, NextResponse } from 'next/server';
import { CONCIERGE } from '@/lib/vip/membership';
import { resolveMembership } from '@/lib/vip/server';

// GET /api/bff/vip/membership — the premium experience surface (C-128), read-only.
// VIP is cross-cutting: it grants ELIGIBILITY; the owning apps + System enforce the
// actual value (P5). VIP owns no economic capability, cannot grant Elite recognition
// or modify Legend. Identity is derived from the `tec_user` session cookie
// server-side — NEVER a query param or body (P6). The owner is passed to the backend
// (the VIP read-surface). The tier ladder is VIP's definitional catalog (shown
// always); membership (currentTier) is the user's OWN data → null with no session /
// unreachable backend, never a fabricated "STANDARD" (C-135 §4). Concierge is a
// VIP-owned static config.
function ownerFromSession(req: NextRequest): string | null {
  try {
    const raw = req.cookies.get('tec_user')?.value ?? '';
    if (!raw) return null;
    let u: Record<string, unknown>;
    try { u = JSON.parse(raw); } catch { u = JSON.parse(decodeURIComponent(raw)); }
    const owner = (u.piUsername ?? u.username) as string | undefined;
    return owner && owner.trim() ? owner : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const owner = ownerFromSession(req);
  const { currentTier, tiers, source } = await resolveMembership(owner);
  return NextResponse.json(
    { source, currentTier, tiers, concierge: CONCIERGE },
    { headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}
