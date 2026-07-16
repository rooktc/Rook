# Feedback response — 生活类 Agent 产品 (lifestyle-services Agent)

Structured reading of the stakeholder feedback, each item mapped to a concrete
change in the demo. Original feedback is in Chinese; this maps it to the Rook
console.

## Headline read

The feedback pushes the product from a **growth/sales console** (what the RFP
scoped and what the demo has been) toward a **full daily-operations console**
for a shop owner. The biggest additions are back-office: finance, materials,
and staff (section 六) — none of which were in the original RFP. It also asks
for two cross-cutting qualities:

1. **Everything should be navigable** — summary numbers on the home page should
   jump to their detail pages; task cards and suggestions should jump to the
   place you act on them.
2. **The AI advisor should be front and centre**, and the marketing
   content-publishing flow should actually work end-to-end (the "confirm"
   button was reported broken).

## Item-by-item mapping

### 一、Home (首頁)
| Feedback | Change |
|---|---|
| 本月已完成營收 → revenue page (day/month/year detail) | Home gets a clickable **This-month revenue** KPI → new **Operations ▸ Finance** tab with day/month/year toggle |
| 今日預約 → bookings page | Clickable **Today's bookings** KPI → bookings list |
| 待你跟進 → follow-up page | Clickable **To follow up** KPI → Inbox (threads needing you) |
| 口碑評分 → reviews / aggregated-platform page | Clickable **Rating** KPI → Reputation |
| AI task card 需人工接管 → chat | Task card links to the Inbox thread |
| AI task card 負評待處理 → reviews | Task card links to Reputation |

### 三、Business insight (经营洞察)
| Feedback | Change |
|---|---|
| AI 经营顾问 placed at very top of home | **AI advisor hero card** is now the first thing on the home page, with a one-line recommendation and a CTA into full insights |

### 二、Customers (客户)
| Feedback | Change |
|---|---|
| Add a customer-statistics module (count, details, platform, spend history, visit count) | Customers view gets a **stats band**: total customers, by-source breakdown, total & average lifetime value, total visits, active vs dormant |

### 四、Marketing (行销)
| Feedback | Change |
|---|---|
| AI 行销活动向导: add a platform content-publishing module | New **content-publishing wizard** on the Marketing page |
| 目标 multi-select | Goal is a multi-select chip group |
| 客群 multi-select | Audience is a multi-select chip group |
| 内容: edit window + one-click regenerate | Editable content box + **Regenerate** cycles AI copy variants |
| 确认: pick copy/poster + platforms, confirm to publish (currently broken) | Platform multi-select + working **Confirm & publish** → success toast, moves to scheduled |

### 五、Marketing suggestions (營銷建議)
| Feedback | Change |
|---|---|
| Make each suggestion clickable → jump to the page to act | Each suggestion (handle 1 negative review, follow up N, close intent, offer to evaluating, win back dormant) is a button that deep-links to Reputation / Inbox / Customers / Marketing |
| Campaign performance: click history → view published content | Completed campaigns **expand** to show the copy, platform and results that were published |

### 六、Finance / Materials / Staff (财务/物料/员工)
| Feedback | Change |
|---|---|
| 营收、支出 | **Operations ▸ Finance**: revenue, expense, net, margin; day/month/year series; expense breakdown; recent transactions |
| 物料:采购、库存 | **Operations ▸ Materials**: inventory levels with low-stock flags; purchase orders |
| 员工:薪资、值班、绩效、工作记录 | **Operations ▸ Staff**: pay, weekly shift roster, performance, work-record counts |

## What I built this round

All of the above, in both industry templates (beauty studio + mobile pet
groomer) and all three languages (EN / 繁中 / 简中):

- **Home** — AI advisor hero at the top; a clickable KPI row (revenue,
  bookings, to-follow-up, rating) that deep-links; AI operations task cards
  that jump to the inbox thread or the review.
- **Operations** — a new left-nav section with Finance / Materials / Staff
  tabs.
- **Marketing** — the content-publishing wizard (multi-select goal, audience
  and platforms; editable copy with regenerate; a confirm-and-publish that
  works); an actionable suggestions list; expandable campaign history.
- **Customers** — the statistics band.

## Conformance pass — every literal requirement now met

A second, adversarial pass audited each item against the client's *literal*
wording and closed the five gaps where the first build only approximated it:

1. **今日預約 → a real bookings page** — the KPI now opens a dedicated
   "Today's bookings" page (time, customer, service, staff/van, status,
   deep-link into the chat), not the Inbox.
2. **待你跟進 → a real follow-up page** — a dedicated follow-up queue with the
   reason, channel, timing and a per-row action, not the customer list.
3. **口碑評分 → multi-platform aggregation + 一键回复** — Reputation now shows
   reviews across Google / Facebook / Instagram with a per-platform breakdown,
   and a working "Reply to all pending" (一键回复) in addition to individual
   replies.
4. **历史消费记录** — the customer detail now shows a per-customer spend
   history (date, service, amount) with a running total.
5. **点击选择文案海报内容** — the publish wizard now offers **selectable AI
   poster options** (not a static label); the chosen poster is carried into
   the published post alongside the copy and platforms.

### Still simulated (not computed engines)

Payroll math, inventory-reorder automation, shift scheduling, and real poster
*image* generation are shown as realistic simulated data / placeholders — the
same LLM/integration gate as the live-inquiry simulation. Every UI the client
asked for is present and interactive.
