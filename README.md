# Rook — AI Growth Team

A 24/7 AI sales growth team for local service merchants. Repo for evaluating,
planning, and building the product described in the RFP — **demo-first**.

## What's here

| Path | Contents |
|---|---|
| `rfp-review.md` | Review of the source RFP (strengths, gaps, questions) |
| `PLAN.md` | Evaluation, demo scope, data design, and roadmap to MVP |
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

## What to look at

- **Today** — the owner's daily brief, overnight AI activity, and the approval
  queue (campaign, review reply, price change, identity merge).
- **Inbox** — six scripted conversations covering the product's key moments:
  a 1:14 AM bridal lead escalated per group-booking rules, a Chinese-language
  price objection resolved with a rule-based discount, an Instagram DM turned
  into a lead, a complaint where the AI stops and escalates, an FAQ answered
  with a knowledge citation, and a follow-up that recovered a booking.
- **Customer view** (📱 button in any conversation) — the same thread as the
  customer's WhatsApp sees it: scores, system notes and citations stay in the
  console.
- **Setup** — an animated day-one onboarding walkthrough: upload files → the
  Business Brain builds itself → owner approves sensitive items → go live.
- **Brain** — the grounding story: every quoted price/policy cites a knowledge
  item; sensitive items are owner-gated; unanswerable questions become a gap
  list.
- **Insights** — funnel, channel attribution, forecast, and a strategy card
  that ties back to the pending campaign.
