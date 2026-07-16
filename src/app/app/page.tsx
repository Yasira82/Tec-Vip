'use client';

// TEC VIP — Premium Experience home (C-128), read-only V1.
// The reward layer of Legend (evidence) → Elite (recognition) → VIP (experience).
// Cross-cutting: VIP grants ELIGIBILITY; the owning apps enforce the value (P5).
import Link from 'next/link';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { TIERS, CONCIERGE, CURRENT_TIER, SOURCE_META, getTier } from '@/lib/vip/membership';
import VipPro from './components/VipPro';

export default function VipHome() {
  const current = getTier(CURRENT_TIER);
  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', padding: '32px 22px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <header style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 34 }}>👑</div>
          <h1 style={{ color: TEC_COLORS.gold, margin: '4px 0 2px', fontSize: 26 }}>TEC VIP</h1>
          <p style={{ opacity: 0.7, margin: 0, fontSize: 14 }}>
            Premium Experience Runtime — excellence deserves exceptional experience.
          </p>
        </header>

        {/* Chain */}
        <div style={{ marginTop: 20, padding: '12px 16px', background: TEC_COLORS.surface, borderRadius: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
          {['Legend · Evidence', 'Elite · Recognition', 'VIP · Experience'].map((s, i, a) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: i === 2 ? TEC_COLORS.gold : '#9ca3af' }}>{s}</span>
              {i < a.length - 1 && <span style={{ opacity: 0.4 }}>→</span>}
            </span>
          ))}
        </div>

        {current && (
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.75 }}>
            Your current tier: <span style={{ color: TEC_COLORS.gold, fontWeight: 700 }}>{current.label}</span>
          </div>
        )}

        {/* Tiers */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 28, marginBottom: 12 }}>Membership tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {TIERS.map((t) => {
            const sm = SOURCE_META[t.source];
            const isCurrent = t.id === CURRENT_TIER;
            return (
              <Link key={t.id} href={`/tier/${t.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: 16, background: TEC_COLORS.surface, borderRadius: 12, border: `1px solid ${isCurrent ? TEC_COLORS.gold + '66' : '#ffffff10'}`, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e7e7ea', fontWeight: 700 }}>{t.label}</span>
                    <span style={{ color: TEC_COLORS.gold, fontWeight: 800, fontSize: 14 }}>π {t.price}<span style={{ opacity: 0.6, fontSize: 11, fontWeight: 500 }}>/mo</span></span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: sm.tone, border: `1px solid ${sm.tone}55`, borderRadius: 20, padding: '2px 8px' }}>{sm.label}</span>
                    {isCurrent && <span style={{ fontSize: 11, color: TEC_COLORS.gold, marginLeft: 6 }}>· current</span>}
                  </div>
                  <div style={{ opacity: 0.65, fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>{t.summary}</div>
                  {t.requires && <div style={{ opacity: 0.5, fontSize: 11, marginTop: 10 }}>Requires: {t.requires}</div>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Concierge */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 28, marginBottom: 8 }}>{CONCIERGE.label}</h2>
        <div style={{ padding: 16, background: TEC_COLORS.surface, borderRadius: 12, fontSize: 13, opacity: 0.85 }}>{CONCIERGE.summary}</div>

        <p style={{ opacity: 0.55, fontSize: 12, marginTop: 20, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
          <strong>Eligibility, not authority (C-128 · P5).</strong> VIP owns no economic capability — it
          adds an experience layer on top of the owning apps. A benefit is an <em>eligibility</em>; the owning
          app (Commerce fees · Zone SLAs · FundX windows) + System define + enforce the value. VIP Elite
          requires an Elite recognition; VIP can never grant Elite or modify Legend. Read-only sample.
        </p>

        {/* VIP Standard subscription */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 32, marginBottom: 12 }}>Subscribe</h2>
        <VipPro />
      </div>
    </main>
  );
}
