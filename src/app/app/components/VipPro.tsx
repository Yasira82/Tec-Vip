'use client';

// VipPro — the real Pi U2A payment surface (the Pi Portal "Process a Transaction"
// gate). VIP Standard is a subscription (C-128 §Revenue: 50π/month). NOTE (P5):
// earned tiers (VIP Elite / Merchant / Founder…) are NOT sold here — they require
// Elite recognition / Zone verification elsewhere; this surface subscribes to the
// STANDARD tier only. Keeps the ADR-007 dual-mode guard.
import { useEffect, useState } from 'react';
import { TEC_COLORS } from '@yasser172/tec-ui';
import {
  isHubNavigation,
  redirectToHubPayment,
  createPaymentRecord,
  createU2APayment,
} from '@/lib/pi-payment';

/**
 * VIP STANDARD — the entry tier, and the only thing VIP sells (C-128).
 *
 * ── Why the id changed, and why it is not cosmetic ─────────────────────────────
 *
 * It was `vip-standard`. `tec-commerce-service` decides what a completed payment
 * bought by matching the item id against two patterns — `<slug>_pro_monthly` and
 * `<slug>_enterprise_monthly` — and `vip-standard` matches NEITHER. A hyphen where
 * the parser wants an underscore, and a word it has never heard of.
 *
 * So the consumer took the payment event, found no plan, and returned. Every VIP
 * Standard purchase completed on Pi, moved real π, and activated NOTHING. Not a
 * degraded entitlement — no subscription row at all.
 *
 * ── Why the price changed too ─────────────────────────────────────────────────
 *
 * 50π was the ENTERPRISE floor, and naming this `vip_enterprise_monthly` would have
 * made the id match at that price. But VIP STANDARD is the ENTRY tier of
 * STANDARD → PARTNER; calling the entry tier "enterprise" so a regex agrees is
 * fixing the parser by lying to it.
 *
 * As PRO it joins the fleet's actual entry tier — Life, Connection and Alert all
 * charge 5π for exactly this entitlement. Charging 50π for the same PRO row is ten
 * times the price of the identical thing, and C-128's premise (VIP grants
 * ELIGIBILITY; the owning apps enforce the value, P5) is not yet honoured by a
 * single owning app. There is nothing extra to charge for yet.
 *
 * Both halves are needed: the id alone at 50π would have cleared the PRO floor and
 * charged tenfold; the price alone would still have activated nothing.
 */
const VIP_STANDARD = { id: 'vip_pro_monthly', name: 'VIP Standard (monthly)', price: 5 };

export default function VipPro() {
  const [piReady, setPiReady] = useState(false);

  // Reflect the real subscription (activated by commerce-service when a Pro payment
  // completes). Pro ONLY while the period is live — no auto-renewal / no downgrade job.
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/bff/subscription', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json()).catch(() => ({}))
      .then((j: Record<string, unknown>) => {
        const d = (j?.data ?? j ?? {}) as Record<string, unknown>;
        const s = ((d?.subscription ?? d) ?? {}) as Record<string, unknown>;
        const end  = typeof s.current_period_end === 'string' ? new Date(s.current_period_end) : null;
        const live = s.isActive !== false && !(s.isExpired === true || (end !== null && end.getTime() < Date.now()));
        const plan = String(s.plan ?? '').toUpperCase();
        setIsSubscribed(live && (plan === 'PRO' || plan === 'ENTERPRISE'));
        // Renewal signal (Pi Pro is one-time, no auto-renewal) — commerce sends
        // daysRemaining; fall back to the period end. Drives a re-subscribe nudge.
        const days = typeof s.daysRemaining === 'number'
          ? s.daysRemaining
          : end ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000)) : null;
        setDaysRemaining(days);
      })
      .catch(() => {});
  }, []);

  const [status, setStatus]   = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as { __TEC_PI_READY?: boolean }).__TEC_PI_READY) setPiReady(true);
    const onReady = () => setPiReady(true);
    window.addEventListener('tec-pi-ready', onReady);
    return () => window.removeEventListener('tec-pi-ready', onReady);
  }, []);

  const handleSubscribe = async () => {
    const { id, name, price } = VIP_STANDARD;

    // ── ADR-007 guard — ALWAYS before touching window.Pi ──
    if (isHubNavigation() || !(window as { Pi?: unknown }).Pi || !piReady) {
      redirectToHubPayment({ amount: price, itemId: id, memo: name });   // Mode 1
      return;
    }

    // ── Mode 2: standalone Pi Browser payment ──
    setStatus('Creating payment…');
    const internalId = await createPaymentRecord(price, id, name);
    if (!internalId) { setStatus('Could not start payment.'); return; }

    setStatus('Awaiting Pi approval…');
    const result = await createU2APayment(price, name, { item_id: id }, internalId);
    setStatus(
      result.success ? `✅ Subscribed — txid ${result.txid}` :
      result.status === 'cancelled' ? 'Payment cancelled.' :
      `❌ ${result.message ?? 'Payment failed.'}`,
    );
  };

  if (isSubscribed) {
    return (
      <div style={{ background: TEC_COLORS.surface, border: `1px solid ${TEC_COLORS.gold}55`, borderRadius: 16, padding: 20, marginTop: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TEC_COLORS.gold }}>★ You’re on Pro</div>
        <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 6 }}>
          Your subscription is active. Thanks for supporting TEC.
        </div>
        {typeof daysRemaining === 'number' && (
          <div style={{ fontSize: 12, fontWeight: daysRemaining <= 7 ? 700 : 600, color: daysRemaining <= 7 ? TEC_COLORS.gold : TEC_COLORS.subtext, marginTop: 8 }}>
            {daysRemaining <= 7 ? '⏳ ' : ''}Expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}{daysRemaining <= 7 ? ' — re-subscribe to keep Pro (one-time monthly, no auto-renewal).' : '.'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: 20, background: TEC_COLORS.surface, borderRadius: 14,
      border: `1px solid ${TEC_COLORS.gold}33`, maxWidth: 440,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2 style={{ margin: 0, color: TEC_COLORS.gold, fontSize: 18 }}>VIP Standard</h2>
        {/* Rendered FROM the constant that is charged. It was the literal `π 50`
            while the charge moved to 5 — a screen and a payment disagreeing about
            the price is the one disagreement a buy surface must never have. */}
        <span style={{ color: TEC_COLORS.gold, fontWeight: 800 }}>π {VIP_STANDARD.price}<span style={{ opacity: 0.6, fontSize: 12, fontWeight: 500 }}>/mo</span></span>
      </div>
      <p style={{ opacity: 0.75, fontSize: 13, margin: '8px 0 6px' }}>
        Priority in every queue · advanced analytics · concierge. Any pioneer.
      </p>
      <p style={{ opacity: 0.55, fontSize: 11.5, margin: '0 0 14px' }}>
        Earned tiers (VIP Elite / Merchant / Founder) are unlocked by recognition or
        verification elsewhere — not sold here.
      </p>
      <button
        onClick={handleSubscribe}
        style={{
          background: `linear-gradient(135deg, ${TEC_COLORS.gold}, ${TEC_COLORS.goldDark})`,
          color: '#0a0800', border: 'none', borderRadius: 10,
          padding: '11px 20px', fontWeight: 700, cursor: 'pointer',
        }}>
        Subscribe with Pi
      </button>
      <p style={{ opacity: 0.5, fontSize: 11, marginTop: 10 }}>Pi SDK: {piReady ? 'ready' : 'loading…'}</p>
      {status && <p style={{ marginTop: 8, fontSize: 13 }}>{status}</p>}
    </div>
  );
}
