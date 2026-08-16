'use client';

// TEC VIP — Premium Experience home (C-128), read-only V1.
// The reward layer of Legend (evidence) → Elite (recognition) → VIP (experience).
// Cross-cutting: VIP grants ELIGIBILITY; the owning apps enforce the value (P5).
// App shell: Home / Tiers / Subscribe / Settings bottom nav.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { TIERS, CONCIERGE, SOURCE_META, type Tier, type VipTier } from '@/lib/vip/membership';
import { useTranslation } from '@/lib/i18n';
import VipPro from './components/VipPro';
import { InviteCard } from '@/components/referral/InviteCard';
import { BottomNav, type VipTab } from './components/BottomNav';
import { SettingsView } from './components/SettingsView';

export default function VipHome() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<VipTab>('home');

  // The tier ladder is VIP's own definitional catalog (shown always). Membership is
  // the caller's OWN data (C-135 §4): currentTier stays null until the live BFF
  // returns it — never a fabricated "STANDARD" for a signed-out visitor.
  const [tiers, setTiers] = useState<Tier[]>(TIERS);
  const [currentTier, setCurrentTier] = useState<VipTier | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/bff/vip/membership', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        if (Array.isArray(d.tiers)) setTiers(d.tiers);
        if (d.source === 'live' && d.currentTier) setCurrentTier(d.currentTier);
      })
      .catch(() => { /* keep the definitional catalog; membership stays unknown */ });
    return () => { alive = false; };
  }, []);

  const current = tiers.find((tr) => tr.id === currentTier) ?? null;

  const headerTitle =
    tab === 'tiers' ? t.vip.nav.tiers
    : tab === 'subscribe' ? t.vip.nav.subscribe
    : tab === 'settings' ? t.vip.nav.settings
    : t.vip.brand;

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 22px calc(96px + env(safe-area-inset-bottom))' }}>
        <header style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 34 }}>👑</div>
          <h1 style={{ color: TEC_COLORS.gold, margin: '4px 0 2px', fontSize: 26 }}>{headerTitle}</h1>
          {tab === 'home' && <p style={{ opacity: 0.7, margin: 0, fontSize: 14 }}>{t.vip.tagline}</p>}
        </header>

        {tab === 'home' && (
          <>
            {/* Chain */}
            <div style={{ marginTop: 20, padding: '12px 16px', background: TEC_COLORS.surface, borderRadius: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
              {['Legend · Evidence', 'Elite · Recognition', 'VIP · Experience'].map((sname, i, a) => (
                <span key={sname} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: i === 2 ? TEC_COLORS.gold : '#9ca3af' }}>{sname}</span>
                  {i < a.length - 1 && <span style={{ opacity: 0.4 }}>→</span>}
                </span>
              ))}
            </div>

            {current && (
              <div style={{ marginTop: 16, fontSize: 13, opacity: 0.75 }}>
                {t.vip.currentTier} <span style={{ color: TEC_COLORS.gold, fontWeight: 700 }}>{current.label}</span>
              </div>
            )}

            {/* Concierge */}
            <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 28, marginBottom: 8 }}>{CONCIERGE.label}</h2>
            <div style={{ padding: 16, background: TEC_COLORS.surface, borderRadius: 12, fontSize: 13, opacity: 0.85 }}>{CONCIERGE.summary}</div>

            <p style={{ opacity: 0.55, fontSize: 12, marginTop: 20, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
              <strong>Benefits, not shortcuts.</strong> VIP unlocks premium experiences across
              TEC — like reduced fees, priority access, and exclusive perks. Each perk is
              honored by the app that provides it. Earned tiers (like VIP Elite) come from
              real recognition — they can never be bought.
            </p>
          </>
        )}

        {tab === 'tiers' && (
          <>
            <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 16, marginBottom: 12 }}>{t.vip.membershipTiers}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {tiers.map((tr) => {
                const sm = SOURCE_META[tr.source];
                const isCurrent = tr.id === currentTier;
                return (
                  <Link key={tr.id} href={`/tier/${tr.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: 16, background: TEC_COLORS.surface, borderRadius: 12, border: `1px solid ${isCurrent ? TEC_COLORS.gold + '66' : '#ffffff10'}`, height: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#e7e7ea', fontWeight: 700 }}>{tr.label}</span>
                        <span style={{ color: TEC_COLORS.gold, fontWeight: 800, fontSize: 14 }}>π {tr.price}<span style={{ opacity: 0.6, fontSize: 11, fontWeight: 500 }}>/mo</span></span>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: sm.tone, border: `1px solid ${sm.tone}55`, borderRadius: 20, padding: '2px 8px' }}>{sm.label}</span>
                        {isCurrent && <span style={{ fontSize: 11, color: TEC_COLORS.gold, marginLeft: 6 }}>· current</span>}
                      </div>
                      <div style={{ opacity: 0.65, fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>{tr.summary}</div>
                      {tr.requires && <div style={{ opacity: 0.5, fontSize: 11, marginTop: 10 }}>Requires: {tr.requires}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {tab === 'subscribe' && (
          <>
            <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 16, marginBottom: 12 }}>{t.vip.subscribeHeading}</h2>
            {/* VIP Standard subscription — real Pi U2A payment */}
            <VipPro />
            {/* Invite & earn — the referral growth loop (C-133), platform-owned */}
            <InviteCard />
          </>
        )}

        {tab === 'settings' && <SettingsView />}
      </div>

      <BottomNav active={tab} onSelect={setTab} />
    </main>
  );
}
