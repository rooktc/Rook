# LANXIN House — applying the client's brand to the Rook demo

Scope per the client: **no product changes** — only the brain/database
(`demo/data.js` + `demo/i18n-data.js` + the template registry) is updated so
the console runs on LANXIN House's real data.

## 1. Source review

| Source | What it gives us | Limits |
|---|---|---|
| **Brand deck PDF** (20 pp, 《LANXIN House 品牌宣传》) | Positioning (东方禅意, women-only sanctuary), the three recovery journeys (归息 REST 120min · 归衡 BALANCE 120min · 归元 RENEW 180min flagship), five-step service method (到达/觉察/恢复/沉淀/延续), membership tiers **with confirmed prices** (Bloom S$1,380/3mo · Flow S$1,999/3mo · Radiance S$6,980/yr) and entitlements, address/phone, founder's letter, LANXIN Service Bible | No single-session prices; no staff list |
| **Agent plan DOCX** (LANXIN House Agent 产品开发计划) | Service master table (9 items), Rachel Fu profile (NAHA + IFA certified aromatherapist, 宋代点茶非遗传承, 200+ clients), **20 ready-made TEST customers** with language/source/lifecycle/preference/consent, brand-voice rules & forbidden words (治愈/排毒/保证改善…), safety & escalation rules, quiet hours 21:00–09:00, ≤2 marketing msgs/14 days, the hard rule: *unconfirmed price/duration/staff/health-fitness → "需要由澜昕老师确认" + human task, never inferred* | Prices for most services 待确认 by design |
| **flora-visage.com** | Per the DOCX's site audit (2026-07-16): Rachel Fu bio, 6 service categories, hours Mon–Sun 10:00–19:00 by appointment, bilingual service, WhatsApp +65 8756 8987, 12星座开运精油 **S$29.90/瓶** | Site is unreachable from this build environment (proxy 403) — relied on the client's own audit; re-verify before any live use |

**Fact boundaries** (the client's own principle, which we keep): confirmed =
address, phone, hours, membership prices/entitlements, zodiac-oil price,
Rachel Fu as the only staff member, journey names + durations. Everything
else (single-session prices, other staff, deposit/cancellation policy,
medically-reviewed safety boundaries) is **pending owner confirmation** and is
represented that way, not invented.

## 2. Evaluation — fit with the demo's data model

The DOCX was explicitly written against the Rook demo, so the mapping is
almost 1:1:

| Demo module | LANXIN data |
|---|---|
| Merchant | LANXIN House · "Restore Your Energy. Rediscover Yourself." · 6 Eu Tong Sen St #09-18 The Central SOHO 1 S059817 · Mon–Sun 10:00–19:00, by appointment · owner Rachel Fu (澜昕老师) |
| Services | The 9-item master table (3 journeys + aromatherapy conditioning, energy healing, private oil blending, zodiac oils S$29.90, Song-dynasty tea ceremony, private wellness consult) |
| Customers | The 20 TEST customers verbatim (names, ZH/EN, WhatsApp/Web/IG/Referral, lifecycle, preferences, consent incl. "service-messages-only" and one complaint-hold) |
| Inbox conversations | 6 scripted moments straight from their agent flows: a 1 AM sleep/stress lead (ZH) navigated to REST; a **price question answered with the escalation rule** (not a made-up price); a zodiac-oil buyer (EN); a health question → safety handoff; a Flow member using her monthly REST entitlement; the complaint-hold customer with marketing suppressed |
| Business Brain | Knowledge items per their knowledge-domain table: brand & voice (with forbidden words), services & pricing (sensitive, TBC fields visible), membership (sensitive), booking policy (draft — pending owner), safety boundaries (sensitive), arrival info, staff, FAQ; knowledge gaps = the real ones ("单次价格是多少?", couples/partners at a women-only space, gift cards) |
| Ask-the-assistant | LANXIN answer bank: hours/address/zodiac oil/membership answer normally; **price and health questions demonstrate the escalate-don't-guess rule**; tea ceremony |
| Approvals / Today | Price-list confirmation task for Rachel, review reply, renewal campaign, safety-wording knowledge item |
| Marketing | Flow-renewal (Elaine, 14 days out), 60-day dormant winback (Meiling), birthday-month (Chloe), zodiac-oil social push; publish-wizard copy variants in brand voice |
| Reputation | Reviews referencing REST/RENEW/tea ceremony incl. one low review (scent sensitivity) with an on-voice drafted reply |
| Insights | WhatsApp-led channel mix, funnel, forecast, services-by-revenue (membership-dominant) |
| Operations | Finance (membership-revenue-led, simulated), materials (essential oils, herbal compress packs, tea), staff (Rachel + unnamed "待配置" placeholder roles — **no fabricated employees**, per their doc) |
| Trust | Consent coverage split (marketing vs service-only), quiet hours 21:00–09:00, 2-per-14-days cap, complaint suppression, audit trail with an escalation event |
| Setup | Onboarding file list = their real artifacts: brand PDF, website pages, LANXIN Service Bible, WhatsApp export |

Everything above is data — the app code stays untouched except the
3-line template registry (`INDUSTRIES`) + one chrome i18n key per language,
which is how templates were always registered.

## 3. Decisions to confirm before executing

1. **Placement** — add LANXIN House as a third template and make it the
   *default on load* (Beauty/Pets stay switchable as platform proof), or
   build a LANXIN-only version? *Recommend: third template + default.*
2. **Unconfirmed prices** — (a) faithful: knowledge base and AI answers show
   "待确认 · 需澜昕老师确认" and demo the escalation rule; internal sim
   numbers (finance, spend history) use clearly-labelled simulated member
   rates; or (b) simple: pick placeholder prices everywhere. *Recommend (a) —
   it showcases the client's own hard rule, which is the product's best
   trust moment.*
3. **Default language** — open in 简体中文 for this client (EN/繁中 still
   one click away)? *Recommend yes.*
4. **Brand name** — console shows **LANXIN House** as the merchant, with the
   dual-brand note (website = Flora & Visage Sanctuary) recorded as a
   knowledge item pending owner confirmation? *Recommend yes.*

## 4. Execution plan (after confirmation)

1. Author the `lanxin` template in `demo/data.js` (all modules above,
   cross-linked: conversations ↔ customers ↔ approvals ↔ campaigns ↔ tasks).
2. Register the template + industry label keys; extend the Brain ask-bank.
3. Author complete 繁中/简中 data translations in `demo/i18n-data.js`
   (base strings in EN as the dictionary keys, per the existing i18n design).
4. Rebuild the single-file demo; headless-verify every view × 3 languages ×
   3 templates (no console errors, no untranslated artifacts, deep-links).
5. Ship: commit/push + send the refreshed `rook-demo.html`.

Test-data hygiene per their doc: the 20 customers keep TEST phone formats
(+65 0000 XXXX style) — nothing in the demo sends messages anyway, and the
whole console already carries the SIMULATED DATA badge.
