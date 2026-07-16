# Rook — from demo to client-ready

The current build is a **demo**: one self-contained HTML file, no backend, no
live LLM. Every AI reply, WhatsApp thread, review, booking, finance figure and
the document "upload" runs on canned, deterministic data frozen at
Fri 10 Jul 2026, 08:05 SGT. That is exactly what a demo should be — but nothing
in it is real yet.

"Client-ready" is not one thing. It splits into three tiers, and the effort,
cost and dependencies jump sharply between them.

---

## The three tiers

| Tier | What it is | Who can use it | Backend? | Needs client's accounts? | Rough effort |
|---|---|---|---|---|---|
| **T1 — Sales demo** | This clickable console, hardened so it never breaks in front of a client and can be lightly personalised (their name, their logo, a few of their real prices). | A salesperson, live or leave-behind. | No | No | Days |
| **T2 — Pilot** | A real product **one merchant** actually runs for 4–8 weeks: real doc upload → knowledge base, a real AI answering real WhatsApp messages with human-in-the-loop approval, real bookings and reviews. | One paying/design-partner merchant. | Yes | **Yes** | ~8–12 weeks, small team |
| **T3 — Production SaaS** | Multi-tenant, self-serve onboarding, billing, SLAs, on-call, many merchants. | Any merchant who signs up. | Yes, hardened | Yes | Quarters |

Most "make it client-ready" conversations mean **T1 now, T2 next**. T3 is a
company, not a task. Below is what each tier actually requires.

---

## T1 — a bulletproof sales demo (no backend)

Fully deliverable in this repo. The goal: a client can click every path
without hitting a dead end, and a salesperson can make it feel like *their*
shop in 30 seconds.

- **Persistence** — language, colour palette, uploaded file list, and in-demo
  actions survive a refresh (localStorage), with a visible **Reset demo**.
- **Personalisation** — edit the merchant name / tagline / a handful of prices
  live so a prospect sees their own business, not "Glow Theory Studio".
- **No dead ends** — every button either does something or shows an honest
  "simulated" state; empty states everywhere; mobile layout checked.
- **A "type your own question" moment** — let a prospect type into the inbox
  and get a grounded, on-brand *scripted* answer (clearly labelled simulated),
  because prospects *will* try to type.
- **Trust / PDPA one-pager** in the product so buyers see the compliance story.
- **Export / print** a one-page "what Rook did this week" for the leave-behind.
- **A 60-second intro overlay** on first open: "what am I looking at."

None of this needs the client. It's the highest-ROI work right now and it is
what I'll iterate on by default unless you point me at T2.

## T2 — a real pilot for one merchant (the first real build)

This is where "demo" becomes "product." Target architecture:

```
  Merchant (web PWA)        Customer (WhatsApp / IG DM)
        │                            │
        ▼                            ▼
   ┌──────────────────────────────────────────┐
   │                API / BFF                  │   auth, rate-limit, audit
   └──────────────────────────────────────────┘
      │        │          │            │
      ▼        ▼          ▼            ▼
   Brain     Agent    Integrations  Scheduler
   (RAG)   (LLM loop)  (adapters)   (jobs/follow-ups)
      │        │          │            │
      ▼        ▼          ▼            ▼
   ┌──────────────────────────────────────────┐
   │  Postgres · vector store · object storage │
   └──────────────────────────────────────────┘
                      │
                      ▼
   WhatsApp Business API (via BSP) · Google Business Profile
   · Meta Graph (IG/FB) · payments (Stripe/PayNow)
```

### Simulated → real: the gap, feature by feature

| Feature (demo) | What "real" needs | Hard dependency |
|---|---|---|
| Document "upload" | Object storage + ingestion: parse PDF/Word/images (OCR), chunk, embed into a vector store; a retrieval layer the AI cites from. | — (buildable now) |
| Business Brain / grounding | RAG over the merchant's docs; owner-approval gate before sensitive items go live; citation tracking. Demo already models the *UX*; needs the engine. | — |
| AI answering inquiries | An LLM agent loop with tools (look up price, check calendar, create task), guardrails, and the human-in-loop approval the demo already shows. | LLM provider |
| WhatsApp inbox | WhatsApp Business Platform via a BSP (Meta doesn't sell direct to SMBs); phone-number provisioning, message templates, 24-hour window rules. | **Client's WABA + BSP approval (weeks)** |
| Reviews (Google/Meta) | Google Business Profile API + Meta Graph API for read + reply. | **Client grants access; API approval** |
| Bookings / calendar | Real calendar (Google Calendar / a booking DB), deposits via payments. | Client's calendar + payment account |
| Finance / materials / staff | These are back-office modules; real versions need data entry or POS/accounting integrations. Lowest priority for a growth pilot. | Optional |
| Marketing publish | Real posting via Meta Graph / scheduling; poster generation via an image model. | Client's Meta pages |

### Singapore-specific must-haves

- **PDPA** — consent capture and proof before outbound messaging (the demo
  models consent/DNC in *Trust*; the pilot must enforce it), purpose
  limitation, access/correction requests, a breach-notification process, and a
  data-processing agreement with the merchant. Decide **data residency** (keep
  customer PII in-region; be explicit about which LLM/vendor sees what).
- **WhatsApp** — onboard through a BSP (e.g. 360dialog / Twilio / Meta Cloud
  API partner); template approval and the 24-hour customer-care window shape
  the whole messaging design.
- **Payments** — PayNow/QR is table stakes locally; add alongside cards.

### AI trust & safety (partly modelled already)

Grounding + citations, human approval for sensitive replies, DNC/consent
enforcement, prompt-injection defences on customer text, and an **eval set**
(a bank of real inquiries with graded expected behaviour) so we can prove
answer quality before and during the pilot. The demo's *Trust* and *Brain*
pages are the UX for this; the pilot supplies the enforcement.

### Security & ops

Multi-tenant auth and per-merchant data isolation, secrets management, the
audit log (already modelled) made real and immutable, backups, and basic
monitoring/alerting. Even a one-merchant pilot needs auth and an audit trail.

---

## Phased plan

1. **T1 hardening (now, days).** Persistence, personalisation, no dead ends,
   trust page, intro, export. Ship each iteration. *No client dependency.*
2. **T2 foundations (weeks 1–3).** Repo scaffold: API, Postgres schema, auth,
   object storage, doc-ingestion → embeddings → retrieval, and a **real**
   Brain that answers from uploaded docs with citations. Integration adapters
   defined as interfaces with mock implementations so the app runs end-to-end
   before any external approval lands.
3. **T2 first real channel (weeks 3–6).** Wire one BSP for WhatsApp behind the
   adapter; owner-approval inbox on real messages. Start the merchant's WABA +
   review-API access in parallel (these have lead times — begin day one).
4. **T2 pilot (weeks 6–12).** One merchant live, measured against
   `pilot-baseline.md`. Tighten from real usage.
5. **T3** only after a pilot proves value: multi-tenant hardening, billing,
   self-serve onboarding, SLAs.

## What I can build in this repo vs what needs you

- **Now, no dependency:** all of T1; and T2's doc-ingestion/RAG Brain, auth,
  schema, and adapter *interfaces* with runnable mocks.
- **Needs the client:** their WhatsApp Business number + BSP approval, Google/
  Meta access grants, calendar and payment accounts, a signed DPA, and the
  data-residency/LLM-vendor decision. **Start the WhatsApp + review-API
  approvals on day one — they gate the pilot and take weeks.**

---

## The one decision that changes what I build next

- **Point me at T1** and I keep iterating the demo to a high finish (default).
- **Point me at T2** and I start scaffolding the real backend + RAG Brain in
  this repo, adapters mocked, and we line up the client dependencies above.

Either way I'll work in verifiable iterations and ship each one.
