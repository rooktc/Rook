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

The demo ships **two industry templates** (switcher in the top bar) to prove
the RFP's horizontal-platform claim — same console, same modules, different
configuration:

- **Glow Theory Studio** — in-store beauty (nails/lashes/facials, Tanjong
  Pagar): group bookings, deposits, off-peak campaigns.
- **Whisker & Wag** — mobile pet grooming (on-site/dispatch): postal-code →
  van routing, time windows, pet-safety hand-offs (injury reports, sedation
  questions), vaccination rules.

Press **Tour** in the top bar for a guided 9-step walkthrough.

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
