# TEC VIP — Claude Code Instructions

> ⚡ **SESSION START:** اقرأ `knowledge-base/C-02___CURRENT_STATE_.md` + **app charter
> `knowledge-base/C-128___VIP_PREMIUM_EXPERIENCE_RUNTIME.md`** من `yasira82/tec-knowledge-base` (branch: `main`).

## What This App Is

**The Premium Experience Runtime** of the Pi economy (C-128) — the **System of
Privilege** (a cross-cutting layer). VIP answers one question:

```
"What exclusive benefits do I receive?"
```

VIP translates recognition + achievement into concrete premium experiences
**across the whole ecosystem**. It is the reward layer of the value chain
**Legend (evidence) → Elite (recognition) → VIP (experience)**.

Built from `tec-template-base` (Next.js 15 frontend).

**Current Phase: VIP V0/V1 — Premium Experience preview (read-only).** Identity /
domain / slug / legal + a themed home (**tiers** STANDARD→PARTNER · cross-app
**benefits** each naming its owning app · **concierge**) + a `/tier/[id]` detail
page + **VIP Standard** subscription (the Pi Portal "Process a Transaction" gate).
> **V1 already exists** as **Hub PRO/ENTERPRISE** — this app is the read-only
surface over it. A dedicated `vip-service` is V2. Not yet deployed.

---

## Pi App Identity

| Field | Value |
|-------|-------|
| **App** | TEC VIP |
| **Domain** | `https://vip.tecosystem.app` |
| **Pi App ID** | ⏳ TBD — register at Pi Developer Portal · then Vercel `NEXT_PUBLIC_PI_APP_ID` |
| **APP_SOURCE slug** | `vip` (payment-service resolves `PI_API_KEY_VIP`) |
| **PI_SANDBOX** | `false` (Mainnet) |

---

## VIP-Specific Rules (C-128)

### 🔴 Constitutional rule — VIP grants ELIGIBILITY, owning apps enforce VALUE (P5)
VIP **owns no economic capability** — it adds a premium experience layer **on top
of** the owning apps. A benefit (e.g. "reduced Commerce fees", "48hr FundX early
access") is an **eligibility**, NOT a VIP-set policy. The owning app + System
define and enforce the actual value:
- **Commerce** owns transaction fees · **Zone** owns verification SLAs · **FundX**
  owns access windows · **System** governs subscription gating.
- A VIP grant an owning app has not honored is inert — the downstream service is
  the authority.

### The chain (earned, not arbitrary)
- **VIP_ELITE** tier requires an **Elite recognition** (C-127) — earned, never bought.
- VIP **cannot** grant Elite recognition, modify Legend records, or execute payments.
- Earned/verified tiers (Elite / Merchant / Investor / Founder / Partner) are unlocked
  by recognition or verification **elsewhere** — the only thing sold here is the
  **STANDARD** subscription.

### The ownership boundary
VIP **OWNS**: membership tiers, benefit *grants* (eligibility), concierge, exclusive
access + events. VIP does **NOT OWN**:
- **Recognition** → Elite (C-127). **Reputation** → Legend (C-126). **Identity /
  verification** → Hub + Zone. **Economic execution** → payment-service.
- **Investment** → FundX. **Governance** → System. **Risk** → Insure.

### Isolation (P6)
A user sees their OWN membership — identity from the `tec_user` session cookie
server-side, **never** a query param or body. Earned tiers check Elite/Zone status
**live** at delivery. No session → fail closed.

**Reference of record:** `yasira82/tec-knowledge-base` —
`C-128___VIP_PREMIUM_EXPERIENCE_RUNTIME.md` (charter) + `C-12_Dual_Mode_Payment.md`
(payment anti-regression) + `C-123` (session/cookies).

---

## Stack

- Next.js 15 App Router + TypeScript strict · React 18
- `@yasser172/tec-ui` (design system) · `@yasser172/tec-auth` · `@yasser172/tec-sdk`
- Vitest (unit) + Playwright (e2e) · Deployment: Vercel

---

## Architecture Rules (non-negotiable)

### CSRF — middleware ONLY (P2 single source of truth)
CSRF is enforced in **`middleware.ts`** and **nowhere else**: a request is trusted
if the double-submit token matches **OR** it is first-party (Origin host === Host /
`*.tecosystem.app`).
- ❌ **NEVER** add a CSRF check inside a route handler (`csrfCookie !== csrfHeader`
  → 403). It 403's legit Mode-2 payments in Pi Browser (drops `sameSite=None`
  cookies). The CI `payment-policy` job fails the build if you do. (KB C-12 §11)
- ✅ A route may *forward* `x-csrf-token` to a downstream call; it must never *validate* it.

### ADR-007 — Dual-mode payment (Pi foreign session)
Every buy handler MUST guard before touching `window.Pi`:
```typescript
const isHubNavigation = () =>
  document.referrer.toLowerCase().includes('hub.tecosystem.app');
if (isHubNavigation() || !(window as any).Pi || !piReady) {
  redirectToHubPayment(...);   // Mode 1: Hub modal → /hub?pay=1&...
  return;
}
// Mode 2: standalone — createPaymentRecord() then createU2APayment() (src/lib/pi-payment.ts)
```
> VIP Standard (subscription) is the only buy flow — earned tiers are never sold.
> Approve under `PI_API_KEY_VIP` (never the default Hub key — the Analytics
> approve→502 lesson, C-12 §11).

### ADR-009 — Unified payment contract
`amount` is a **number**; gateway path is **`/api/payment/*`** (singular); the only
inter-service header is **`x-internal-key`** + `INTERNAL_SECRET`. Don't re-declare
payment Zod locally — shapes live in `@yasser172/tec-sdk`.

### Two-SDK boundary
```
Client components → src/lib-client/*  (browser state, Pi hooks)
API routes (BFF)  → @yasser172/tec-sdk via /api/bff/*  (server-only)
```

### Auth / cookies (LOCKED)
SSO via Hub cookies `tec_access_token`, `tec_csrf`, `tec_user`. Never localStorage.
Identity is derived from the `tec_user` cookie server-side — **never from the request body**.

---

## Setup status + Roadmap (C-128)

```
VIP V0/V1 — Premium Experience preview (customized from template):
  ✅ package.json name = tec-vip · APP_SOURCE = 'vip'
  ✅ sso-callback ALLOWED_AUDIENCES → vip.tecosystem.app + tec-vip.vercel.app
  ✅ privacy + terms → TEC VIP / vip.tecosystem.app
  ✅ NEW-A: no NEXT_PUBLIC_API_GATEWAY_URL / Railway host in the client bundle
  ✅ /app themed: tiers + cross-app benefits + concierge + VIP Standard (real Pi U2A)
  ✅ /tier/[id] detail (benefits per owning app + P5 note) + BFF /api/bff/vip/membership

Next (before live):
  □ Register Pi App ID (Pi Developer Portal) → Vercel NEXT_PUBLIC_PI_APP_ID +
    API_GATEWAY_URL · INTERNAL_SECRET · SSO_SECRET · PI_SANDBOX=false.
    (NEXT_PUBLIC_HUB_URL MUST be https://hub.tecosystem.app — the apex tecosystem.app
     is not the Hub → ERR_CONNECTION_CLOSED at login; redeploy after changing it.)
  □ payment-service: set PI_API_KEY_VIP on Railway (approve→502 otherwise, C-12 §11).
  □ Hub SSO: add vip.tecosystem.app + tec-vip.vercel.app to Hub /api/auth/sso
    ALLOWED_TARGETS + Hub domain registry.
  □ Deploy (Vercel) + runtime-verify login (C-123) + a real VIP Standard payment
    Mode 1 (Hub) AND Mode 2 (standalone).

VIP V2+ (post-Portal — C-128): dedicated vip-service (status/benefits/events/
  concierge endpoints); apps read VIP status live (never store it); Elite-tier check
  in real time; VIP events. Then V3 vip.pi external membership.
```

---

## What NOT To Do

- Do NOT set fees / SLAs / queue positions in VIP — those are the owning app's (P5)
- Do NOT sell earned tiers (Elite/Merchant/Founder) — only STANDARD is subscription
- Do NOT grant Elite recognition or modify Legend records from VIP
- Do NOT store VIP status inside consuming apps — it is checked live (C-128)
- Do NOT validate CSRF in a route handler — middleware only (CI blocks it)
- Do NOT send `amount` as a string, or use `/payments` / `x-service-secret`
- Do NOT skip the ADR-007 `isHubNavigation()` guard before `window.Pi`
- Do NOT store tokens in localStorage; do NOT derive identity from the body
- Do NOT add `NEXT_PUBLIC_*` for internal service URLs or `INTERNAL_SECRET`

---

## Commit Convention

```
feat(vip):  new experience feature   fix(payment): payment flow fix (test carefully)
fix(vip):   bug fix                   chore(scope):  build/config
```

---

## Skills

Available via plugin — invoke automatically when the situation matches:

| Situation | Skill |
|-----------|-------|
| Writing new feature or fixing a bug → use TDD | `/tdd` |
| Bug, regression, or unexpected behavior | `/diagnose` |
| Writing or modifying tests | `/test-guard` |
| Writing or modifying BFF routes, payment handlers, or API contracts | `/clean-code-guard` |
| Updating docs, CLAUDE.md, or knowledge-base entries | `/docs-guard` |
| Planning a new feature or architectural decision | `/grill-with-docs` |
| Breaking down a roadmap item into GitHub Issues | `/to-issues` |
| Session is getting long or context is filling up | `/handoff` |
| Adding pre-commit hooks to this repo | `/setup-pre-commit` |
