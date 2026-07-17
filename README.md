# Rook — AI Growth Team

A 24/7 AI sales growth team for local service merchants. Repo for evaluating,
planning, and building the product described in the RFP — **demo-first**.

## What's here

| Path | Contents |
|---|---|
| `rfp-review.md` | Review of the source RFP (strengths, gaps, questions) |
| `PLAN.md` | Evaluation, demo scope, data design, and roadmap to MVP |
| `gm-review.md` | GM-perspective evaluation: RFP coverage matrix + iteration priorities |
| `pilot-baseline.md` | Fill-in sheet to measure a merchant *before* go-live, so pilot results are provable |
| `feedback-response.md` | Stakeholder feedback (生活类 Agent) mapped item-by-item to the changes made |
| `production-readiness.md` | Demo → client-ready: the three tiers (sales demo / pilot / production), the simulated→real gap map, PDPA & WhatsApp/BSP dependencies, architecture, and a phased plan |
| `demo/` | The clickable owner-console demo (no build tools, no dependencies) |
| `scripts/build.mjs` | Bundles the demo into one self-contained HTML file |
| `dist/rook-demo.html` | The bundled demo — open it in any browser |

## Running the demo

```sh
node scripts/build.mjs   # writes dist/rook-demo.html
open dist/rook-demo.html # or just open demo/index.html directly
```

Everything in the demo is **simulated, deterministic data**, frozen at
Fri 10 Jul 2026, 8:05 AM SGT. There is no backend and no live LLM; the
"Simulate a live inquiry" and onboarding sequences are scripted.

The demo is configured for the client brand **LANXIN House** (women-only
body-mind sanctuary, The Central SOHO 1, Singapore) — built from the client's
own brand deck, Agent product plan (including its 20 TEST customers, expanded
with more scenarios), and the flora-visage.com site audit. See
`lanxin-onboarding-plan.md` for the source review and fact boundaries.
Journey pricing follows the client's published programme model (Bloom·归息
S$1,380/3mo · Flow·归衡 S$1,999/3mo · Radiance·归元 S$6,980/yr) plus the
published zodiac-oil price; ancillary session rates are clearly-flagged
simulated placeholders pending owner confirmation. The console opens in
简体中文 (EN / 繁中 one click away).

Press **Tour** in the top bar for a guided 9-step walkthrough.

**Demo / sales-readiness features (T1):**

- **Welcome overlay** on first open (reopen via the **?** in the top bar) —
  orients a cold viewer, then hands off to the tour or free exploration.
- **Colour theme** — white + blue, with three switchable accent palettes
  (Azure / Indigo / Sky) via the dots in the top bar; light and dark.
- **Personalisation** (Setup ▸ *Make it their business*) — set business name,
  tagline and owner and the whole console re-brands live, across both industry
  templates and all three languages.
- **Document upload** (Setup) — a real drag-and-drop zone that feeds the
  onboarding walkthrough; also reachable from **Brain ▸ Add documents**.
- **Ask the assistant** (Brain) — type any question and the AI answers only
  from the shop's knowledge with a **Source** citation, or hands off to staff
  instead of guessing. Demonstrates grounding interactively.
- **PDPA & data-protection card** (Trust) — Singapore PDPA obligations mapped
  to product controls, for buyer due-diligence.
- **Export summary** (Today) — a branded, print-ready one-page weekly summary
  via the browser's Save-as-PDF.
- **Persistence** — language, palette, branding and uploads survive a reload;
  **Reset demo** (sidebar) clears them. **Escape** closes overlays.
- Horizontal-overflow-clean on phone widths.

**Language switcher** (top bar) — English, Traditional Chinese, and Simplified
Chinese. Both the interface (navigation, buttons, headers, chart labels,
tooltips, toasts) and the console-facing data layer (daily brief,
opportunities, approvals, tasks, campaign details, knowledge base, audit
trail, strategy, KPIs, conversation annotations) are translated via
`demo/i18n-data.js`. The only content left as authored is what real customers
wrote: WhatsApp/IG transcripts, review text, and campaign message drafts —
plus names and prices. Untranslated strings fall back to English rather than
breaking.

## What to look at

- **Today** — the owner's daily brief, overnight AI activity, and the approval
  queue (campaign, review reply, price change, identity merge).
- **Inbox** — six scripted conversations covering the product's key moments:
  a 1:14 AM bridal lead escalated per group-booking rules, a Chinese-language
  price objection resolved with a rule-based discount, an Instagram DM turned
  into a lead, a complaint where the AI stops and escalates, an FAQ answered
  with a knowledge citation, and a follow-up that recovered a booking.
- **Customer view** (button in any conversation header) — the same thread as the
  customer's WhatsApp sees it: scores, system notes and citations stay in the
  console.
- **Setup** — an animated day-one onboarding walkthrough: upload files → the
  Business Brain builds itself → owner approves sensitive items → go live.
- **Brain** — the grounding story: every quoted price/policy cites a knowledge
  item; sensitive items are owner-gated; unanswerable questions become a gap
  list.
- **Social** (RFP 7.6) — AI-drafted content calendar with approval-gated and
  consent-held posts, comments/DMs classified into leads vs complaints vs
  spam, and content performance measured in inquiries and bookings.
- **Customers → Task centre** (RFP 7.4) — the queue of tasks the AI creates
  for staff, with owner, due time, and originating agent.
- **Trust** (RFP 7.10) — consent coverage, DNC checks, outreach rules, role
  permissions, and an audit trail that includes a denied staff action.
- **Insights** — funnel, channel attribution, forecast, a strategy card that
  ties back to the pending campaign, and unit economics (cost per AI-handled
  conversation / per AI-won booking).
- **Operations** (stakeholder feedback) — Finance (revenue/expense with
  day/month/year toggle, breakdown, transactions), Materials (inventory with
  low-stock flags + reorder, purchase orders), Staff (pay, weekly shift grid,
  performance, work records).
- **Home** now opens with an AI-advisor hero and a clickable KPI row
  (revenue → Operations, bookings → Inbox, follow-up → Customers, rating →
  Reputation), plus AI operations task cards that jump to the chat or review.
- **Marketing** now has a working content-publishing wizard (multi-select
  goal / audience / platform, editable copy with regenerate, confirm &
  publish), an actionable AI-suggestions list that deep-links to where you act,
  and expandable campaign history.
