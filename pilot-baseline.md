# Pilot Baseline Sheet — measure before go-live

The RFP's success targets are relative ("booking conversion +15–30%"), so a
pilot proves nothing without a measured *before*. Fill this in during the
merchant-diagnosis step (RFP Section 14, step 1), from 30 days of history —
chat exports, booking book, POS, and Google Business — **before** Rook goes
live. The same metrics are then read from Rook's Insights view at day 30 and
day 90.

Merchant: ____________________  Vertical: ____________________
Baseline window: ____ to ____   Filled in by: ____________ Date: ______

## 1. Response & conversion (from chat export + booking records)

| Metric | How to measure | Baseline | Day 30 | Day 90 | RFP target |
|---|---|---|---|---|---|
| First-response time (median) | Timestamp delta on last 50 inquiries | | | | Seconds (7.2) |
| Inquiries per week | Count all channels, 4-week avg | | | | Trackable + growing |
| Missed / never-answered inquiries | Inquiries with no merchant reply | | | | −50% (12, MVP) |
| Inquiry → booking rate | Booked ÷ total inquiries | | | | +15–30% (12, Ph 2) |
| Booking → show rate | Showed ÷ booked | | | | Improve via reminders |
| Average order value | Revenue ÷ orders | | | | Upsell lift (7.3) |

## 2. Retention (from POS / booking history)

| Metric | How to measure | Baseline | Day 30 | Day 90 | RFP target |
|---|---|---|---|---|---|
| Repeat-purchase rate | Customers with 2+ visits in 90d | | | | Higher LTV (15) |
| Median repeat cycle | Days between visits, returning customers | | | | Drives reminder cadence |
| Dormant share | No visit in 2× median cycle | | | | Win-back revenue (7.5) |
| Membership/package renewal | Renewed ÷ expiring | | | | (7.5) |

## 3. Brand & reputation (from Google Business + socials)

| Metric | How to measure | Baseline | Day 30 | Day 90 | RFP target |
|---|---|---|---|---|---|
| Google rating / review count | Profile snapshot | | | | Volume up (7.7) |
| Reviews per month | Last 3 months avg | | | | Invitation flow lift |
| Posts per week (all socials) | Last 4 weeks | | | | Consistent cadence (7.6) |
| Social → inquiry count | Ask merchant; usually unknown | | | | Becomes measurable |

## 4. Effort & cost (owner interview)

| Metric | How to measure | Baseline | Day 30 | Day 90 |
|---|---|---|---|---|
| Staff hours/week on repetitive replies | Owner + staff estimate | | | |
| Hours/week on marketing & posting | Owner estimate | | | |
| Ad spend & known CPA | Ad account | | | |
| Rook cost (subscription + messages + model) | n/a | — | | |

## Rules for a fair pilot

1. Snapshot everything above **before** connecting WhatsApp — day-0 backfill
   is not credible.
2. Don't run new paid campaigns during the first 30 days unless the baseline
   window had comparable spend; otherwise attribute separately (Rook tags
   every lead's source).
3. Seasonality: note holidays/promotions inside either window (the RFP's
   demand-forecast module needs these anyway).
4. Agree the success thresholds with the owner in writing before go-live —
   suggested MVP bar (RFP 12): ≥60% of standard inquiries auto-handled,
   un-followed-up leads −50%, and the owner opens the daily brief ≥5 days/wk.
