// TEC VIP — tier detail (C-128), read-only, statically generated.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { TIERS, CONCIERGE, SOURCE_META } from '@/lib/vip/membership';
import { resolveTier } from '@/lib/vip/server';

// Pre-render the curated sample tiers; allow live-only catalog tiers to render on
// demand (the VIP read-surface is the catalog of record — C-128).
export function generateStaticParams() {
  return TIERS.map((t) => ({ id: t.id }));
}
export const dynamicParams = true;

export default async function TierDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Resolve from the live VIP catalog; fall back to the curated sample so the page
  // never 500s. A live catalog that omits the id is authoritative → notFound().
  const { tier: t } = await resolveTier(id);
  if (!t) notFound();

  const sm = SOURCE_META[t.source];

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', padding: '32px 22px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/app" style={{ color: TEC_COLORS.gold, fontSize: 13, textDecoration: 'none' }}>← Back</Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ color: TEC_COLORS.gold, margin: 0, fontSize: 24 }}>{t.label}</h1>
          <span style={{ color: TEC_COLORS.gold, fontWeight: 800, fontSize: 18 }}>π {t.price}<span style={{ opacity: 0.6, fontSize: 12, fontWeight: 500 }}>/mo</span></span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: sm.tone, border: `1px solid ${sm.tone}55`, borderRadius: 20, padding: '3px 10px' }}>{sm.label}</span>
          {t.requires && <span style={{ fontSize: 12, opacity: 0.7, border: '1px solid #ffffff22', borderRadius: 20, padding: '3px 10px' }}>Requires: {t.requires}</span>}
          <span style={{ fontSize: 12, opacity: 0.7, border: '1px solid #ffffff22', borderRadius: 20, padding: '3px 10px' }}>Concierge SLA {CONCIERGE.slaByTier[t.id]}</span>
        </div>

        <p style={{ marginTop: 16, lineHeight: 1.6, opacity: 0.9 }}>{t.summary}</p>

        {/* Benefits — each names the OWNING app that enforces it */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 15, marginTop: 24 }}>Benefits</h2>
        <div style={{ marginTop: 8 }}>
          {t.benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #ffffff10', fontSize: 13.5 }}>
              <span style={{ minWidth: 92, color: TEC_COLORS.gold, opacity: 0.9 }}>{b.app}</span>
              <span style={{ opacity: 0.85 }}>{b.label}</span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, opacity: 0.55, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
          These are <strong>eligibility shapes</strong>, not VIP-set policy (C-128 · P5). The owning app +
          System define + enforce the actual value. {t.source === 'ELITE_EARNED'
            ? 'This tier is unlocked by an Elite recognition (C-127) — earned, never bought.'
            : t.source === 'VERIFIED_ROLE'
            ? 'This tier requires a verified role checked live at delivery.'
            : 'This tier is subscription-based (any pioneer).'} Read-only sample.
        </p>
      </div>
    </main>
  );
}
