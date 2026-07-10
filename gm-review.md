# GM Review — Rook demo vs the RFP

Perspective: a general manager deciding whether this product is ready to put
in front of pilot merchants and investors, and what to build next. Reviewed
against the RFP's module spec (Section 7), dashboard spec (Section 9),
compliance requirements (Sections 7.10/11), and business model (Section 13).

## Verdict

The demo sells the core loop convincingly — capture → converse → convert →
retain — and it demonstrates the two hardest claims well: grounded AI (every
price cites a knowledge item) and honest hand-off boundaries (complaints and
safety topics stop the AI). The two-industry switcher proves the platform
claim. What it under-serves, as of iteration 2, are the modules a GM needs
for the *business* case rather than the *product* case: brand growth (7.6),
governance (7.10), staff operations (task center, 7.4), and unit economics
(Section 13).

## RFP coverage matrix (before iteration 3)

| RFP module | Demo coverage | Gap |
|---|---|---|
| 7.1 Multi-channel lead engine | Good — channels, scoring, dedup/merge, routing implied | Lead-pool queue views are implicit in Today, acceptable for demo |
| 7.2 AI reception & needs assessment | Strong — 11 scripted conversations, EN/ZH, extraction panel | — |
| 7.3 Sales conversion & booking | Strong — quotes, deposits, follow-up cadences, attribution | Real slot-awareness deferred to product Phase 1 (known) |
| 7.4 CRM & lifecycle | Good — 360° profiles, tags, lifecycle, timelines | **Task center missing** — the RFP calls CRM "an action system" |
| 7.5 Marketing automation | Strong — triggers, audiences, approval card, ROI reviews | — |
| 7.6 Social media & brand | **Missing entirely** | Content calendar, comment/DM classification, interaction→lead, content performance |
| 7.7 Reputation & CX | Strong — reviews, drafted replies, recovery tickets, themes | — |
| 7.8 Business brain & SOP | Strong — versioning, gating, gaps, citations | — |
| 7.9 Insight & forecast | Strong — brief, funnel, channels, forecast, strategy | — |
| 7.10 Trust, permissions & ops | **Thin** — approval queue and consent flags only | Audit trail, roles/permissions, outreach rules, compliance stats, data requests |
| 9 Owner dashboard | Strong, mobile-first | — |
| 12 MVP roadmap | Addressed in PLAN.md (re-scoped) | — |
| 13 Business model | Not the demo's job, but... | **No unit economics anywhere** — a GM's first question |

## GM-level observations beyond the matrix

1. **The compliance story is the sale-closer for Singapore.** PDPA/DNC appear
   in the RFP as a design constraint; in a pilot pitch they're a
   differentiator against grey-market WhatsApp blasters. The demo should make
   governance *visible*: audit trail, consent coverage, quiet hours, and a
   permission denial actually being enforced.
2. **The owner is not the only user.** Everything currently orients to the
   owner. The RFP's personas include front desk and managers; the task center
   is where their day lives. Without it, "AI creates tasks for staff" is an
   unverifiable claim in the stats row.
3. **Brand growth is half the RFP's pitch** ("increase brand exposure" is in
   the product's one-line definition) and social is the acquisition engine
   for both pilot verticals. Its absence makes the demo read as
   "conversations + CRM" rather than "growth team."
4. **Unit economics must be a surface, not a spreadsheet.** Showing cost per
   AI-handled conversation next to revenue per booking answers the pricing
   objection before it's raised, and it's honest: WhatsApp fees and model
   costs are real.
5. Acceptable omissions at this stage: multi-store/head-office views,
   agency white-label, POS integrations, ad-platform audiences (RFP Phases
   3–4); real LLM and real channels (product Phase 1, needs key/BSP
   decisions).

## Iteration 3 (delivered with this review)

1. **Social & Brand view (7.6)** — week content calendar with approval-gated
   drafts, comment/DM classification feed showing interaction→lead
   conversion, content performance measured in inquiries and bookings (not
   likes), and asset suggestions. Both industries; the pet template includes
   a viral-post beat with an "extend into campaign" recommendation, and a
   consent-pending client feature to reinforce the compliance thread.
2. **Trust & audit view (7.10)** — compliance stat row (consent coverage, DNC
   checks, unsubscribe handling, data requests), outreach rules, role
   permissions (owner/manager/staff/agency), and a live audit trail that
   includes a *denied* action (staff export blocked) — governance you can
   see.
3. **Task center (7.4)** — staff-facing queue inside Customers with owner,
   due time, source (which agent created it) and status; the "4 tasks
   created for staff" stat on Today now has a place it points to.
4. **Unit-economics KPIs (13)** — cost per AI-handled conversation and cost
   per AI-won booking added to Insights, benchmarked against a typical
   paid-ads CPA.

## What I would demand before a paid pilot (next iterations)

- Wire the live-inquiry simulation to a real grounded LLM call (needs an
  Anthropic API key decision) — turns the demo into evidence.
- A pilot-metrics baseline sheet per merchant (the RFP's targets are
  relative: +15–30% conversion needs a measured "before").
- WhatsApp BSP sandbox (360dialog or Twilio) with one real number, template
  approval lead time started now — it's the longest pole in Phase 1.
- Pricing hypothesis to test in pilot conversations: Starter at S$249–349/mo
  against the demo's visible ROI numbers.
