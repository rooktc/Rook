# RFP Review — "AI Growth Team for Local Service Businesses" (V1.0, July 6, 2026)

Source: Google Doc product proposal for a 24/7 AI sales growth team targeting
Singapore-based local service merchants (F&B, beauty, fitness, pet services,
repairs, education, etc.).

## What the document proposes

A multi-agent AI platform that consolidates lead capture, sales conversion,
CRM, marketing automation, social media, reputation management, and business
analytics into one system for small local-service merchants. Key elements:

- **Channels**: WhatsApp as the primary entry point, plus Instagram, Facebook,
  Google Business Profile, website/ad forms, QR codes, and POS/booking systems.
- **Agent team** (Section 6): nine specialized agents — Lead Discovery, Sales
  Conversion, Follow-up, CRM, Marketing Automation, Social & Brand, Reputation,
  Business Brain (knowledge base), and Insight & Forecast.
- **Architecture** (Section 5): four layers — touchpoints, agents, data assets,
  and business decisions.
- **Roadmap** (Section 12): MVP in 6–8 weeks (WhatsApp reception, business
  brain, CRM, follow-up, daily brief), then social/marketing (8–16 wks),
  POS/forecasting (16–28 wks), then agency/white-label scale.
- **Business model** (Section 13): Starter / Growth / Pro / Agency tiers priced
  on contacts, message volume, channels, stores, and usage.
- **Pilot** (Section 14): 3–5 merchants across different verticals.

## Strengths

1. **Horizontal abstraction is the right call.** Building around a shared
   customer lifecycle (Discovery → Inquiry → Booking → Service → Review →
   Repeat → Referral) with industry templates, rather than hard-coding one
   vertical, is the strongest architectural decision in the document.
2. **Human hand-off boundaries are unusually well specified.** Every module
   lists what the AI must NOT do (invent prices, promise outcomes, handle
   refunds/complaints/medical risk). This is rare in proposals at this stage
   and de-risks both product quality and liability.
3. **Grounded AI design.** All quotes, discounts, and policies must come from
   the "Business Brain" or a connected system, with citation trails and
   knowledge versioning. This is the correct pattern for preventing
   hallucinated commitments.
4. **Compliance is designed in, not bolted on.** PDPA, DNC registry, consent
   records, quiet hours, opt-outs, audit logs, and approval workflows appear
   throughout (Sections 7.10, 11), matched to the Singapore market.
5. **Realistic MVP framing.** Section 12 explicitly avoids full-channel
   coverage and forecasting at MVP, and Section 16's "do not" list (no scraped
   cold outreach, no fully automated sales, no owner-facing complexity) shows
   mature product judgment.
6. **Measurable success criteria** exist per phase (e.g., 60%+ auto-handled
   inquiries, 50% fewer un-followed-up leads at MVP).

## Gaps and concerns

1. **This is a product proposal, not a true RFP.** It has no budget, no vendor
   evaluation criteria, no submission requirements, no contract/SLA terms, and
   no decision timeline. If it's meant to solicit bids, those sections must be
   added; if it's an internal build plan, it needs a team/cost estimate.
2. **The MVP is still too big for 6–8 weeks.** "WhatsApp AI reception +
   business brain + CRM + sales funnel + automated follow-up + human hand-off
   + daily brief + compliance recording" is realistically 3–4 months for a
   small team, especially with WhatsApp Business Platform approval lead times.
   Recommend cutting MVP to: WhatsApp reception + business brain + hand-off +
   a minimal lead list, deferring funnel views and automated follow-up.
3. **Platform dependency risk is understated.** The entire product sits on
   Meta's WhatsApp/Instagram APIs and Google Business Profile:
   - WhatsApp's 24-hour customer-service window and template-message pricing
     directly constrain the follow-up and marketing modules; per-message
     template costs materially affect unit economics but no cost model exists.
   - Instagram/Facebook messaging automation requires Meta app review and has
     policy limits on promotional content.
   - Google Business Profile API access for reviews/posts has quota and
     eligibility constraints.
4. **No unit economics.** Pricing "dimensions" are listed but no price points,
   no LLM inference cost model, no WhatsApp conversation-fee pass-through, and
   no CAC/LTV assumptions. The "10–20 extra bookings pays for itself" claim
   (Section 13) can't be evaluated without a monthly price.
5. **Identity resolution is harder than presented.** Merging customers across
   WhatsApp ID, IG handle, phone, and email (Section 7.1) is a genuinely hard
   problem; the proposal correctly adds a confirmation queue but should scope
   this as best-effort at MVP (phone-number-first matching only).
6. **Success metrics lack baselines.** Targets like "booking conversion +15–30%"
   need per-pilot-merchant baseline measurement during the diagnosis step, or
   the pilot can't prove anything.
7. **No technical stack, hosting, or data-residency specification.** For PDPA
   and merchant trust, data location and retention defaults should be stated.
   No mention of model choice, latency targets ("sub-second responses" in 7.2
   is unrealistic for LLM round-trips — "seconds" elsewhere is more honest),
   or multi-tenant isolation design beyond a mention in the data model.
8. **Multilingual claims need scoping.** English/Chinese at launch is fine;
   Malay/Tamil "extendable" is fine — but code-switching (Singlish, mixed
   EN/ZH in one message) is the actual hard case in Singapore and worth a
   line in the test plan.

## Questions to raise with the author

1. Is this soliciting an external vendor/build partner, or an internal plan?
   (Determines what's missing: commercial terms vs. team/cost plan.)
2. What is the target monthly price for Starter, and what WhatsApp message
   volume does it assume? (Drives the entire margin model.)
3. Who owns WhatsApp Business Platform onboarding — the merchant's number or
   platform-provisioned numbers via a BSP (e.g., Twilio, 360dialog)?
4. Which booking/POS systems are the priority integrations for Phase 3
   (Singapore market: e.g., Shopify POS, StoreHub, Qmeno, Fresha, Tabley)?
5. What's the human staffing assumption during pilot — who answers the
   hand-offs at 2am if the pitch is "24/7"?

## Verdict

Strong, unusually well-thought-out product proposal — the lifecycle
abstraction, grounded-AI design, and hand-off boundaries are all correct.
Before acting on it: re-scope the MVP smaller, add a cost/pricing model
(especially WhatsApp fees and LLM inference), add vendor/commercial sections
if it's truly an RFP, and validate Meta platform constraints against the
follow-up and marketing designs early, since they can invalidate module
assumptions.
