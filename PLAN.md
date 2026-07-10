# Rook — AI Growth Team: Evaluation & Build Plan

Product plan for the RFP reviewed in `rfp-review.md` ("AI Growth Team for Local
Service Businesses", V1.0). Strategy: **demo first** — a clickable,
data-realistic product demo that sells the vision to pilot merchants and
investors before any platform integration work begins.

## 1. Evaluation summary (what we're building and why)

The RFP describes a nine-agent AI growth platform for Singapore local-service
merchants, entered through WhatsApp. Our review concluded the product thinking
is strong (lifecycle abstraction, grounded AI, hand-off boundaries, PDPA-aware)
but the MVP is over-scoped and the platform/economic risks are underexplored.

The cheapest way to de-risk all of that is a **demo that shows the owner
experience end-to-end with realistic data** — because:

- Pilot merchants buy the *owner experience* (daily brief, inbox, campaigns),
  not the architecture. A demo validates willingness-to-pay before we spend on
  WhatsApp Business Platform onboarding.
- Every hard conversation the RFP defers (what the AI may promise, when it
  hands off, what an approval card looks like) becomes concrete in a demo.
- The demo doubles as the design spec for the real MVP.

## 2. Demo scope (this build)

One simulated merchant — **Glow Theory Studio**, a nails/lash/facial studio in
Tanjong Pagar, Singapore — seen through the owner's console at a fixed moment
in time (Fri 10 Jul 2026, 8:05 AM SGT). Seven views, mapping directly to RFP
Section 7 modules:

| Demo view | RFP module(s) | What it demonstrates |
|---|---|---|
| Today | 7.9 daily brief, 9 dashboard | Opportunities queue, AI activity overnight, pending decisions |
| Inbox | 7.1 leads, 7.2 reception, 7.3 conversion | Scripted WhatsApp/IG conversations, needs extraction, lead scoring, human take-over, knowledge citations |
| Customers | 7.4 CRM | 360° profiles, lifecycle stages, tags, timeline, churn risk |
| Marketing | 7.5 automation | Campaign templates, approval card with reach/ROI estimate, past campaign results |
| Reputation | 7.7 | Review feed, AI-drafted replies, negative-sentiment recovery ticket |
| Brain | 7.8 | Versioned knowledge items, gap detection, approval-gated sensitive entries |
| Insights | 7.9 | Funnel, channel attribution, service popularity, 7-day forecast, strategy recommendation |

Interactive beats (scripted, no live LLM):

1. **Simulate a new inquiry** — a WhatsApp conversation plays out live in the
   inbox: AI greets, extracts needs, quotes from the knowledge base, proposes
   slots.
2. **Take over / hand back** — pause the AI on any conversation.
3. **Approve a campaign** — the pending "rainy-week off-peak facial" campaign
   moves to scheduled.
4. **Approve a review reply** — the drafted response to the one negative
   review.

Deliberately out of demo scope: real channel integrations, auth, multi-tenant,
payments, real LLM calls. The demo is honest about this — a "Simulated data"
badge is always visible.

## 3. Simulated data design

All data is deterministic and hand-shaped around story beats (in
`demo/data.js`), with a seeded generator filling the long tail:

- **Merchant**: services catalog with real SGD prices, durations, repeat
  cycles (gel nails ~3 wks, lash fills ~2–3 wks, facials ~5 wks).
- **~55 customers**: Singaporean name mix (Chinese, Malay, Indian, Western),
  +65 phones, EN/ZH language preference, lifecycle stages, consent flags, LTV.
- **6 fully scripted conversations** covering the RFP's key scenarios:
  overnight high-value bridal lead (group booking → human hand-off), Chinese-
  language price objection handled with an alternative, Instagram DM converted
  to a WhatsApp lead, complaint with refund intent (AI stops, escalates,
  recovery ticket), FAQ answer with knowledge citation, and an automated
  follow-up that recovered a booking.
- **Campaigns**: 3 completed with results/ROI, 1 pending owner approval
  (weather-triggered off-peak fill), 1 scheduled (birthday automation).
- **12 Google reviews** incl. one 2★ tied to the complaint storyline.
- **16 knowledge items** with versioning, owner-approval flags, and a gap list
  ("bridal home visits" asked 4× with no answer).
- **30 days of daily metrics** for trend charts; funnel and channel
  attribution consistent with the customer/lead counts.

## 4. Demo architecture

Static, dependency-free web app — `demo/` holds `index.html`, `styles.css`,
`data.js`, `app.js`; `scripts/build.mjs` inlines everything into
`dist/rook-demo.html` (single self-contained file, deployable anywhere, also
published as a Claude Artifact). Hash-based routing, hand-rolled SVG charts
following the validated dataviz palette, light/dark themes, mobile-first (RFP
Section 9 requires the owner console to work on a phone).

## 5. Path from demo to MVP (the real build)

Re-scoped from the RFP's 6–8 weeks to a credible plan:

| Phase | Weeks | Scope |
|---|---|---|
| 0. Demo (this) | done | Clickable owner console with simulated data |
| 1. Pilot alpha | 1–6 | WhatsApp via BSP (360dialog/Twilio), business brain + grounded replies (RAG over knowledge items), human hand-off, lead list, owner daily brief via WhatsApp. One pilot merchant. |
| 2. Pilot beta | 7–14 | CRM lifecycle + follow-up automation, consent/DNC checks, approval queue, basic dashboard (the demo UI wired to real data). 3–5 merchants. |
| 3. Growth | 15–26 | IG/FB + Google Business, marketing automation with ROI tracking, review management, multilingual (ZH first, then MS/TA). |
| 4. Scale | 27+ | Booking/POS integrations, forecasting, multi-store, agency/white-label. |

Key technical decisions to make at Phase 1 (not now): BSP vendor, LLM vendor
and grounding architecture, data residency (Singapore region), tenancy model.

## 6. Success criteria for the demo

- A pilot-candidate owner can navigate it unaided and articulate the value
  ("it answered the 1 AM bride and I just confirm").
- Every RFP Section 7 module is visible somewhere in the demo.
- Every AI action shown respects the RFP's hand-off boundaries (no invented
  prices, complaints escalate, approvals gate outreach).
