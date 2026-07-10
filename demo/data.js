/* Rook demo — simulated data for Glow Theory Studio (Tanjong Pagar, Singapore).
   Deterministic: fixed "now" + seeded PRNG. No network, no real customer data. */
window.DEMO = (() => {
  const NOW = new Date('2026-07-10T08:05:00+08:00'); // Friday morning
  const MS_H = 3600e3, MS_D = 24 * MS_H;
  const at = (ms) => new Date(ms).toISOString();
  const hoursAgo = (h) => at(NOW - h * MS_H);
  const daysAgo = (d, hh = 14, mm = 0) => {
    const dt = new Date(NOW - d * MS_D);
    dt.setHours(hh, mm, 0, 0);
    return dt.toISOString();
  };
  const daysAhead = (d) => at(+NOW + d * MS_D);

  // ---- seeded PRNG (mulberry32) for the generated tail ----
  const rng = (() => {
    let s = 20260710;
    return () => {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const ri = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

  const merchant = {
    product: 'Rook',
    name: 'Glow Theory Studio',
    tagline: 'Nails · Lashes · Facials',
    address: '27 Duxton Road, Tanjong Pagar',
    owner: 'Rachel Tan',
    hours: 'Tue–Sun 10:30–20:30, closed Mon',
    languages: ['English', '中文'],
    now: NOW.toISOString(),
    nowLabel: 'Fri 10 Jul 2026 · 8:05 AM',
  };

  const services = [
    { id: 'gel-mani', name: 'Classic Gel Manicure', price: 68, mins: 75, cycle: '3 weeks' },
    { id: 'biab', name: 'BIAB Structured Manicure', price: 88, mins: 90, cycle: '3–4 weeks' },
    { id: 'gel-ext', name: 'Gel Extensions', price: 118, mins: 120, cycle: '3–4 weeks' },
    { id: 'lash-classic', name: 'Classic Lash Extensions', price: 128, mins: 90, cycle: '2–3 weeks (fill)' },
    { id: 'lash-volume', name: 'Volume Lash Extensions', price: 158, mins: 110, cycle: '2–3 weeks (fill)' },
    { id: 'lash-fill', name: 'Lash Fill', price: 68, mins: 60, cycle: '2–3 weeks' },
    { id: 'facial-sig', name: 'Hydrating Signature Facial', price: 148, mins: 60, cycle: '4–6 weeks' },
    { id: 'facial-deep', name: 'Deep Cleanse Facial', price: 128, mins: 60, cycle: '4–6 weeks' },
    { id: 'brow-lam', name: 'Brow Lamination', price: 88, mins: 45, cycle: '6–8 weeks' },
    { id: 'facial-5pk', name: 'Facial Package (5 sessions)', price: 628, mins: 60, cycle: 'membership' },
  ];

  // ---- hero customers (referenced by conversations & story beats) ----
  const heroCustomers = [
    { id: 'c-priya', name: 'Priya Nair', phone: '+65 9127 4482', lang: 'EN', channel: 'WhatsApp', lifecycle: 'New lead', tags: ['High intent', 'Bridal', 'Group booking'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref: 'Volume Lash + Gel Mani' },
    { id: 'c-meiling', name: '陈美玲 Chen Meiling', phone: '+65 8830 1276', lang: 'ZH', channel: 'WhatsApp', lifecycle: 'Converted', tags: ['Price-sensitive', 'First visit booked'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: true, pref: 'BIAB Manicure' },
    { id: 'c-siti', name: 'Siti Rahayu (@sitiblooms)', phone: '+65 9648 2210', lang: 'EN', channel: 'Instagram', lifecycle: 'Evaluating', tags: ['Social lead', 'Lashes'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref: 'Volume Lash' },
    { id: 'c-dana', name: 'Dana Lim', phone: '+65 9077 5531', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Churn risk', tags: ['Complaint open', 'VIP'], ltv: 1462, visits: 14, lastVisit: daysAgo(3, 18, 30), nextDue: null, consent: true, pref: 'Gel Extensions' },
    { id: 'c-marcus', name: 'Marcus Wee', phone: '+65 8211 9034', lang: 'EN', channel: 'Google', lifecycle: 'New lead', tags: ['FAQ', 'Men’s grooming'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref: 'Classic Gel Manicure' },
    { id: 'c-aisha', name: 'Aisha Binte Rahman', phone: '+65 9350 8817', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Converted', tags: ['Recovered by follow-up'], ltv: 148, visits: 1, lastVisit: null, nextDue: daysAhead(2), consent: true, pref: 'Signature Facial' },
    { id: 'c-farah', name: 'Farah Osman', phone: '+65 9683 2145', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Dormant', tags: ['VIP', 'Lapsed 9 weeks'], ltv: 2210, visits: 19, lastVisit: daysAgo(63), nextDue: daysAgo(21), consent: true, pref: 'Volume Lash + Facial' },
    { id: 'c-jasmine', name: 'Jasmine Koh', phone: '+65 9012 7754', lang: 'EN', channel: 'Instagram', lifecycle: 'Active', tags: ['Merge suggested: @jasmineeats'], ltv: 826, visits: 8, lastVisit: daysAgo(11), nextDue: daysAhead(10), consent: true, pref: 'BIAB Manicure' },
    { id: 'c-grace', name: 'Grace Fu Wenli', phone: '+65 8477 3392', lang: 'ZH', channel: 'Referral', lifecycle: 'VIP', tags: ['Birthday 14 Jul', 'Membership'], ltv: 3184, visits: 26, lastVisit: daysAgo(9), nextDue: daysAhead(12), consent: true, pref: 'Facial Package' },
    { id: 'c-nurul', name: 'Nurul Huda', phone: '+65 9922 0518', lang: 'EN', channel: 'QR code', lifecycle: 'Active', tags: ['Deposit unpaid'], ltv: 264, visits: 3, lastVisit: daysAgo(24), nextDue: daysAhead(1), consent: true, pref: 'Lash Fill' },
    { id: 'c-devi', name: 'Devi Chandran', phone: '+65 8164 7830', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Active', tags: ['Deposit unpaid'], ltv: 396, visits: 4, lastVisit: daysAgo(19), nextDue: daysAhead(3), consent: true, pref: 'Gel Extensions' },
    { id: 'c-liwei', name: 'Ong Li Wei', phone: '+65 9744 6120', lang: 'ZH', channel: 'Google', lifecycle: 'Active', tags: ['Prefers weekday AM'], ltv: 544, visits: 6, lastVisit: daysAgo(16), nextDue: daysAhead(5), consent: true, pref: 'Deep Cleanse Facial' },
  ];

  // ---- generated tail of the customer base ----
  const firstNames = ['Wei Ting', 'Hui Min', 'Xin Yi', 'Jia Hui', 'Kai Xin', 'Shu Fen', 'Mei Qi', 'Yan Ling', 'Siti Aisyah', 'Nur Alia', 'Fatimah', 'Zulaikha', 'Priyanka', 'Lakshmi', 'Anjali', 'Kavitha', 'Chloe', 'Vanessa', 'Rachel', 'Samantha', 'Fiona', 'Gwen', 'Elaine', 'Denise'];
  const lastNames = ['Tan', 'Lim', 'Lee', 'Ng', 'Wong', 'Goh', 'Chua', 'Teo', 'Ho', 'Low', 'Binte Ismail', 'Binte Yusof', 'Nair', 'Pillai', 'Menon', 'Chen', 'Koh', 'Ang', 'Sim', 'Yeo'];
  const lifecyclePool = ['Active', 'Active', 'Active', 'Active', 'Converted', 'Evaluating', 'Dormant', 'Dormant', 'VIP', 'New lead', 'Churn risk'];
  const channelPool = ['WhatsApp', 'WhatsApp', 'WhatsApp', 'Instagram', 'Instagram', 'Google', 'QR code', 'Referral'];
  const tagPool = ['Prefers weekends', 'Sensitive skin', 'Regular 3-week cycle', 'Responds to promos', 'Quiet hours only', 'Brings a friend', 'Prefers Joanne', 'Prefers Ms Lee', 'Cash payer', 'PayNow'];
  const customers = [...heroCustomers];
  const usedNames = new Set(heroCustomers.map((c) => c.name));
  while (customers.length < 55) {
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    const lifecycle = pick(lifecyclePool);
    const visits = lifecycle === 'New lead' ? 0 : lifecycle === 'VIP' ? ri(12, 30) : lifecycle === 'Dormant' ? ri(2, 9) : ri(1, 11);
    const svc = pick(services.slice(0, 9));
    customers.push({
      id: `c-${customers.length}`,
      name,
      phone: `+65 ${ri(8, 9)}${ri(100, 999)} ${ri(1000, 9999)}`,
      lang: rng() < 0.28 ? 'ZH' : 'EN',
      channel: pick(channelPool),
      lifecycle,
      tags: rng() < 0.6 ? [pick(tagPool)] : [pick(tagPool), pick(tagPool)],
      ltv: visits === 0 ? 0 : visits * ri(68, 158),
      visits,
      lastVisit: visits === 0 ? null : daysAgo(lifecycle === 'Dormant' ? ri(50, 120) : ri(2, 28)),
      nextDue: lifecycle === 'Dormant' || lifecycle === 'New lead' ? null : daysAhead(ri(1, 24)),
      consent: rng() < 0.82,
      pref: svc.name,
    });
  }

  // ---- scripted conversations (the demo's core) ----
  const conversations = [
    {
      id: 'v-priya', customerId: 'c-priya', name: 'Priya Nair', channel: 'WhatsApp',
      preview: 'Bridal party of 5 — lashes + nails, 22 Aug', time: hoursAgo(6.85), unread: true,
      aiStatus: 'escalated', score: 92, intent: 'Group booking',
      fields: { Service: 'Volume lash ×5, gel mani ×5', 'Date needed': 'Sat 22 Aug, before 1 PM', 'Party size': '5 pax', Budget: '“around $1k”', Language: 'English', Urgency: 'High — wedding' },
      handoff: 'Group booking over 4 pax requires staff confirmation of stylist availability (Rules Centre R-07).',
      nextAction: 'Confirm 2 stylists for 22 Aug morning, then send group quote $1,130 (bridal bundle −10%).',
      messages: [
        { from: 'cust', time: hoursAgo(6.85), text: 'Hi! Sorry for the late msg 😅 I’m getting married 22 Aug. Do you do lashes + nails for a bridal party? 5 of us incl me' },
        { from: 'ai', time: hoursAgo(6.84), text: 'Congratulations, Priya! 🎉 Yes we do — volume lashes and gel manicures are our most popular bridal combo. For 5 pax we’d book two stylists in parallel. May I ask what time you’d need everyone done by on the 22nd?' },
        { from: 'cust', time: hoursAgo(6.8), text: 'Photographer comes 1pm so ideally all done by then. What would it cost roughly?' },
        { from: 'ai', time: hoursAgo(6.79), text: 'Based on our current price list: volume lashes ($158) + gel manicure ($68) is $226/pax, so about $1,130 for 5 — and bridal groups of 4+ get 10% off, bringing it to ~$1,017. To be done by 1 PM we’d start at 9:00 AM with two stylists.', cite: 'Price list v12 · Rules Centre R-07' },
        { from: 'cust', time: hoursAgo(6.74), text: 'That works with our budget! Can we lock it in?' },
        { from: 'ai', time: hoursAgo(6.73), text: 'Wonderful! Because this is a group booking, I’ve flagged it for Rachel to confirm both stylists for that morning — she’ll confirm with you by 10 AM today. I’ve pencilled 22 Aug, 9 AM for 5 pax so the slot is held. 💐' },
        { from: 'sys', time: hoursAgo(6.73), text: 'Escalated to owner — group booking >4 pax (R-07). Slot held. Task created for Rachel.' },
      ],
    },
    {
      id: 'v-meiling', customerId: 'c-meiling', name: '陈美玲 Chen Meiling', channel: 'WhatsApp',
      preview: '已确认：周二 2:00 PM BIAB 美甲', time: hoursAgo(14.2), unread: false,
      aiStatus: 'ai', score: 78, intent: 'Price inquiry → booked',
      fields: { Service: 'BIAB Structured Manicure', 'Date needed': 'Tue 14 Jul, 2:00 PM', Budget: '≤ $80', Language: '中文', Urgency: 'Normal' },
      handoff: null,
      nextAction: 'Send Tue 10 AM reminder with parking directions (automated).',
      messages: [
        { from: 'cust', time: hoursAgo(14.6), text: '你好，请问光疗美甲多少钱？' },
        { from: 'ai', time: hoursAgo(14.59), text: '您好！我们的经典光疗美甲是 $68（约75分钟），BIAB 结构美甲是 $88（更耐用，约3–4周）。请问您比较想做哪一种呢？😊', cite: 'Price list v12' },
        { from: 'cust', time: hoursAgo(14.5), text: '有点贵哦，别家才50多' },
        { from: 'ai', time: hoursAgo(14.49), text: '理解您的想法！我们使用日本品牌胶，含修甲和基础护理，卸甲免费。另外首次到店的客人可享 15% 优惠——经典光疗只需 $57.80。要不要帮您预约试一次？', cite: 'Rules Centre R-03 · first-visit 15%' },
        { from: 'cust', time: hoursAgo(14.35), text: '那BIAB打折后多少？周二下午有位吗？' },
        { from: 'ai', time: hoursAgo(14.34), text: 'BIAB 首次优惠后是 $74.80。周二（7月14日）下午有 2:00 和 4:30 两个时段，您方便哪个？' },
        { from: 'cust', time: hoursAgo(14.25), text: '2点吧' },
        { from: 'ai', time: hoursAgo(14.2), text: '好的！已为您预约：周二 7月14日 2:00 PM，BIAB 结构美甲（首次优惠 $74.80）。地址：27 Duxton Road。期待见到您！🌸' },
        { from: 'sys', time: hoursAgo(14.2), text: 'Booking created · first-visit discount applied per R-03 · customer profile created (ZH).' },
      ],
    },
    {
      id: 'v-siti', customerId: 'c-siti', name: '@sitiblooms', channel: 'Instagram',
      preview: 'how much for volume lashes? 🥺', time: hoursAgo(11.3), unread: true,
      aiStatus: 'ai', score: 64, intent: 'Price inquiry',
      fields: { Service: 'Volume Lash Extensions', 'Date needed': '—', Budget: '—', Language: 'English', Urgency: 'Browsing' },
      handoff: null,
      nextAction: 'If no reply by 6 PM, send one gentle follow-up with this month’s lash portfolio (max 1 nudge — IG policy).',
      messages: [
        { from: 'cust', time: hoursAgo(11.3), text: 'hiii saw your reel 😍 how much for volume lashes? 🥺' },
        { from: 'ai', time: hoursAgo(11.29), text: 'Hi Siti! Thank you 🥰 Volume lash extensions are $158 (about 1h50m), and fills after are $68. First visit gets 15% off — $134.30. Want me to check slots for you? Easiest is on WhatsApp — tap here: wa.me/6588884321', cite: 'Price list v12' },
        { from: 'sys', time: hoursAgo(11.29), text: 'Social lead created from IG DM · high-intent keyword “how much” · guided to WhatsApp.' },
      ],
    },
    {
      id: 'v-dana', customerId: 'c-dana', name: 'Dana Lim', channel: 'WhatsApp',
      preview: 'Honestly quite disappointed… gel chipped in 3 days', time: hoursAgo(15.75), unread: false,
      aiStatus: 'human', score: null, intent: 'Complaint · refund risk',
      fields: { Service: 'Gel Extensions (visit Mon 7 Jul)', Sentiment: 'Negative — refund intent', 'Customer tier': 'VIP · 14 visits', Language: 'English', Urgency: 'High' },
      handoff: 'Complaint with refund intent — AI paused itself per hand-off policy. Recovery ticket RT-114 created; owner notified before customer posts a public review.',
      nextAction: 'Rachel to call Dana before noon; offer free re-do with senior stylist (drafted below). Do not send automated marketing until resolved.',
      messages: [
        { from: 'cust', time: hoursAgo(15.8), text: 'Hi. Honestly quite disappointed — the gel extensions from Monday chipped in 3 days. Two nails. For $118 I expect better. Can I get a refund?' },
        { from: 'ai', time: hoursAgo(15.79), text: 'Dana, I’m really sorry to hear that — that’s not the experience we want for you, especially after 14 visits with us. I’m passing this straight to Rachel, our owner, who will personally contact you this morning. Thank you for telling us first. 🙏' },
        { from: 'sys', time: hoursAgo(15.79), text: 'AI paused (complaint + refund intent). Recovery ticket RT-114 → owner. Suggested remedy: free re-do w/ senior stylist + $20 credit (within R-09 limits). Marketing suppressed for this customer.' },
      ],
    },
    {
      id: 'v-marcus', customerId: 'c-marcus', name: 'Marcus Wee', channel: 'Google',
      preview: 'Do you do men’s manicures? Open Sunday?', time: hoursAgo(20.1), unread: false,
      aiStatus: 'ai', score: 41, intent: 'FAQ',
      fields: { Service: 'Classic Gel Manicure', 'Date needed': 'Sunday (browsing)', Budget: '—', Language: 'English', Urgency: 'Low' },
      handoff: null,
      nextAction: 'None — answered from knowledge base. Auto-close if no reply in 48h.',
      messages: [
        { from: 'cust', time: hoursAgo(20.1), text: 'Do you do men’s manicures? And are you open Sunday?' },
        { from: 'ai', time: hoursAgo(20.09), text: 'Hi Marcus! Yes — about a fifth of our manicure clients are men; the Classic Gel Manicure ($68) includes cuticle care and buffing, polish optional. We’re open Sundays 10:30 AM–8:30 PM (closed Mondays). Want me to hold a Sunday slot?', cite: 'FAQ-04 · Opening hours' },
      ],
    },
    {
      id: 'v-aisha', customerId: 'c-aisha', name: 'Aisha Binte Rahman', channel: 'WhatsApp',
      preview: 'Ok let’s do Sunday 11am then!', time: hoursAgo(18.5), unread: false,
      aiStatus: 'ai', score: 71, intent: 'Follow-up recovered',
      fields: { Service: 'Hydrating Signature Facial', 'Date needed': 'Sun 12 Jul, 11:00 AM', Budget: '$148', Language: 'English', Urgency: 'Normal' },
      handoff: null,
      nextAction: 'Reminder + pre-facial skincare note scheduled for Sat 6 PM (automated).',
      messages: [
        { from: 'sys', time: daysAgo(2, 15, 10), text: 'Quote sent 2 days ago, no reply — Follow-up Agent triggered cadence step 1.' },
        { from: 'ai', time: hoursAgo(19.2), text: 'Hi Aisha! Just checking in on the Signature Facial you asked about 😊 Weekends fill fast — this Sunday I still have 11 AM or 4:30 PM. Off-peak weekday slots are also 10% quieter if you prefer. No rush either way!' },
        { from: 'cust', time: hoursAgo(18.55), text: 'Ok let’s do Sunday 11am then!' },
        { from: 'ai', time: hoursAgo(18.5), text: 'Booked! Sunday 12 Jul, 11:00 AM — Hydrating Signature Facial with Joanne. See you at 27 Duxton Road ✨' },
        { from: 'sys', time: hoursAgo(18.5), text: 'Conversion recovered by follow-up cadence (would otherwise have lapsed). Attributed: Follow-up Agent.' },
      ],
    },
  ];

  // ---- live-simulation script (played when user clicks "Simulate new inquiry") ----
  const simulation = {
    name: 'Hannah Teo', channel: 'WhatsApp', customerLine: 'New number · +65 9611 2087',
    steps: [
      { from: 'cust', delay: 600, text: 'hi do u have any slots for brow lamination this weekend?' },
      { from: 'typing', delay: 900 },
      { from: 'ai', delay: 0, text: 'Hi! 👋 Yes — brow lamination is $88 (about 45 min). This weekend I have Sat 3:30 PM and Sun 12:00 PM or 5:15 PM. Would any of those work?', cite: 'Price list v12' },
      { from: 'cust', delay: 2200, text: 'sun 12pm! do i need to prep anything' },
      { from: 'typing', delay: 900 },
      { from: 'ai', delay: 0, text: 'Booked — Sun 12 Jul, 12:00 PM ✅ No prep needed; just come with clean brows (no makeup on them if possible) and avoid retinol around the brow area for 48h before. See you Sunday, Hannah!', cite: 'SOP-11 · Brow aftercare' },
      { from: 'sys', delay: 400, text: 'Lead created → qualified → booked in 41 seconds. Customer profile created. Reminder scheduled Sat 6 PM.' },
    ],
  };

  // ---- Today view ----
  const opportunities = [
    { convId: 'v-priya', who: 'Priya Nair', why: 'Bridal party ×5 — $1,017 quote held, needs your stylist confirmation by 10 AM', kind: 'decision', value: '$1,017' },
    { convId: 'v-dana', who: 'Dana Lim', why: 'VIP complaint (chipped gel, refund intent). Call before noon — recovery script ready', kind: 'critical', value: 'LTV $1,462' },
    { convId: 'v-siti', who: '@sitiblooms', why: 'IG lead asked volume lash price 11h ago, no reply yet — 1 nudge queued for 6 PM', kind: 'watch', value: '$134' },
    { convId: null, who: 'Nurul Huda · Devi Chandran', why: '2 deposits unpaid for bookings tomorrow/Mon — reminders sent, will auto-release slots at 8 PM', kind: 'watch', value: '2 slots' },
    { convId: null, who: 'Farah Osman', why: 'VIP dormant 9 weeks (usual cycle 3). Suggested: personal win-back with lash-fill offer', kind: 'suggestion', value: 'LTV $2,210' },
  ];

  const aiActivity = [
    { n: 9, label: 'inquiries answered overnight' },
    { n: 12, label: 'follow-ups sent' },
    { n: 5, label: 'bookings confirmed' },
    { n: 6, label: 'review invites sent' },
    { n: 4, label: 'tasks created for staff' },
  ];

  const approvals = [
    { id: 'ap-campaign', type: 'Campaign', title: 'Rainy-week off-peak facials', detail: 'Send to 84 consented customers · est. 6–9 bookings ($780–$1,170)', ref: 'mk-rain' },
    { id: 'ap-review', type: 'Review reply', title: 'Reply to Dana L. (2★ Google review)', detail: 'Apology + invitation to re-do drafted; posting is held for your approval', ref: 'rv-dana' },
    { id: 'ap-price', type: 'Knowledge', title: 'Price list v13 (lash fill $68 → $72)', detail: 'Uploaded by Joanne yesterday — goes live only after owner review', ref: 'kb-price' },
    { id: 'ap-merge', type: 'Identity', title: 'Merge @jasmineeats → Jasmine Koh', detail: 'Same phone on IG profile and CRM record — confirm to merge', ref: null },
  ];

  const brief = {
    headline: 'Good morning, Rachel — 3 decisions need you; the rest is handled.',
    body: 'Overnight the AI answered 9 inquiries (one at 1:14 AM became your biggest lead this week — Priya’s bridal party, ~$1,017). Tuesday afternoons are still 40% empty next week, so a rainy-week facial campaign is drafted and waiting for your approval. One VIP complaint needs a personal call before noon — script is ready.',
  };

  // ---- CRM extras ----
  const timelineJasmine = [
    { time: daysAgo(11, 18, 0), kind: 'visit', text: 'BIAB manicure with Joanne — $88 · left 5★ review' },
    { time: daysAgo(11, 19, 30), kind: 'ai', text: 'Review invite sent · review received 40 min later' },
    { time: daysAgo(32, 13, 0), kind: 'visit', text: 'BIAB manicure — $88' },
    { time: daysAgo(41, 10, 0), kind: 'campaign', text: 'Clicked “Bring a friend” campaign · friend booked (referral credited)' },
    { time: daysAgo(53, 15, 0), kind: 'visit', text: 'Gel manicure — $68 · noted: sensitive cuticles, use gentler remover' },
  ];

  // ---- marketing ----
  const campaigns = [
    {
      id: 'mk-rain', name: 'Rainy-week off-peak facials', status: 'pending',
      trigger: 'Demand forecast: NEA forecasts monsoon surge Mon–Wed · Tue 2–6 PM only 60% booked',
      audience: '84 consented customers, facial buyers or facial-curious, no visit in 3+ weeks. Excludes: open complaints, unsubscribed, contacted <14 days ago.',
      channel: 'WhatsApp template', schedule: 'Sat 10:00 AM',
      copy: 'Rainy week ahead ☔ — perfect excuse for a facial. 20% off Signature & Deep Cleanse, Tue–Thu 2–6 PM next week only. Reply YES and we’ll sort your slot.',
      estimate: { reach: 84, bookings: '6–9', revenue: '$780–$1,170', cost: '$9.20 (WhatsApp fees)' },
    },
    {
      id: 'mk-bday', name: 'July birthdays', status: 'scheduled',
      trigger: 'Lifecycle: birthday within 7 days · runs monthly',
      audience: '6 customers with July birthdays (incl. Grace Fu, 14 Jul)',
      channel: 'WhatsApp template', schedule: 'Each customer, 3 days before birthday, 11 AM',
      copy: 'Happy almost-birthday, {name}! 🎂 Your treat from us: a complimentary brow shape with any service this month.',
      estimate: { reach: 6, bookings: '3–4', revenue: '$280–$420', cost: '$0.66' },
    },
    {
      id: 'mk-winback', name: 'Dormant win-back (June)', status: 'completed', ended: daysAgo(12),
      trigger: 'Lifecycle: no visit in 8+ weeks, LTV > $200',
      audience: '62 dormant customers', channel: 'WhatsApp template', schedule: 'Sent 24 Jun, 11 AM',
      copy: '“We miss you” + 15% off next visit, valid 3 weeks.',
      results: { sent: 62, replies: 11, bookings: 7, revenue: 924, cost: 75, roi: '12.3×', unsubs: 1 },
    },
    {
      id: 'mk-offpeak', name: 'Off-peak Tuesdays (June)', status: 'completed', ended: daysAgo(19),
      trigger: 'Capacity: Tue 2–6 PM under 65% booked',
      audience: '48 flexible-schedule customers', channel: 'WhatsApp template', schedule: 'Sent 17 Jun',
      copy: '10% off weekday-afternoon slots.',
      results: { sent: 48, replies: 9, bookings: 6, revenue: 512, cost: 41, roi: '12.5×', unsubs: 0 },
    },
    {
      id: 'mk-lashcare', name: 'Lash-fill cycle reminders (rolling)', status: 'completed', ended: daysAgo(2),
      trigger: 'Lifecycle: 17 days since last lash appointment (individual)',
      audience: 'Rolling — 31 sends in June', channel: 'WhatsApp template', schedule: 'Automated, per customer',
      copy: 'Time for your fill, {name}? Your usual slot with {stylist} is open {day}.',
      results: { sent: 31, replies: 22, bookings: 19, revenue: 1292, cost: 28, roi: '46×', unsubs: 0 },
    },
  ];

  // ---- reputation ----
  const reviews = [
    { id: 'rv-dana', name: 'Dana L.', rating: 2, time: hoursAgo(13.4), source: 'Google', text: 'Gel extensions chipped within 3 days. Staff are lovely but for the price I expected the set to last. Disappointed this time.', replyStatus: 'pending', reply: 'Dana, thank you for telling us — this isn’t the standard we hold ourselves to, and I’m sorry. I’ve reached out personally: we’d love to re-do the set with our senior stylist at no charge. — Rachel, owner', linked: 'Recovery ticket RT-114 · same customer as open complaint' },
    { id: 'rv-1', name: 'Jasmine K.', rating: 5, time: daysAgo(11, 19, 40), source: 'Google', text: 'Joanne did my BIAB perfectly again. Booking over WhatsApp took literally 30 seconds.', replyStatus: 'posted', reply: 'Thank you Jasmine! Joanne will be so happy to hear this 💛' },
    { id: 'rv-2', name: 'Wei Ting T.', rating: 5, time: daysAgo(4, 12, 15), source: 'Google', text: 'Replied to my message at 11pm and got me a slot the next morning. The facial was amazing too.', replyStatus: 'posted', reply: 'That’s exactly what we’re here for — day or night! See you at your next glow-up ✨' },
    { id: 'rv-3', name: 'Farhana M.', rating: 4, time: daysAgo(7, 17, 0), source: 'Google', text: 'Great lashes, cosy studio. Parking around Duxton is a pain though.', replyStatus: 'posted', reply: 'Thank you Farhana! Tip for next time: Tanjong Pagar Plaza carpark is 4 min away and much easier 🚗' },
    { id: 'rv-4', name: 'Anjali P.', rating: 5, time: daysAgo(15, 14, 0), source: 'Google', text: 'The birthday brow treat was such a nice surprise. Feels like they actually remember you.', replyStatus: 'posted', reply: 'Happy birthday again, Anjali! 🎂' },
  ];
  const cxSummary = {
    rating: 4.8, count: 187, invited30d: 41, received30d: 17,
    themes: [
      { theme: 'Fast replies / easy booking', n: 9, tone: 'good' },
      { theme: 'Lash quality', n: 6, tone: 'good' },
      { theme: 'Parking difficulty', n: 3, tone: 'warn' },
      { theme: 'Gel durability', n: 2, tone: 'bad' },
    ],
  };

  // ---- business brain ----
  const knowledge = [
    { id: 'kb-price', title: 'Price list', category: 'Services & pricing', version: 'v12 live · v13 pending approval', updated: daysAgo(1, 17, 20), owner: 'Joanne', sensitive: true, cites30d: 214, excerpt: 'All service prices, durations, add-ons. v13 changes: Lash Fill $68 → $72. Sensitive — owner approval required before AI can quote new prices.' },
    { id: 'kb-r03', title: 'R-03 · First-visit discount', category: 'Rules centre', version: 'v4', updated: daysAgo(22), owner: 'Rachel', sensitive: true, cites30d: 38, excerpt: '15% off first visit, any service, not stackable. AI may offer proactively on price objections.' },
    { id: 'kb-r07', title: 'R-07 · Group bookings', category: 'Rules centre', version: 'v2', updated: daysAgo(40), owner: 'Rachel', sensitive: true, cites30d: 3, excerpt: 'Groups of 4+ : AI may quote and hold a slot but staff must confirm stylist availability before final confirmation. Bridal 4+ gets 10% off.' },
    { id: 'kb-r09', title: 'R-09 · Service recovery limits', category: 'Rules centre', version: 'v3', updated: daysAgo(31), owner: 'Rachel', sensitive: true, cites30d: 2, excerpt: 'AI may suggest (never promise): free re-do within 7 days, credit up to $20. Refunds are owner-only decisions.' },
    { id: 'kb-faq04', title: 'FAQ-04 · Opening hours & men’s services', category: 'FAQ', version: 'v6', updated: daysAgo(8), owner: 'AI (approved by Rachel)', sensitive: false, cites30d: 57, excerpt: 'Tue–Sun 10:30–20:30, closed Mondays. Yes to men’s manicures/facials — mention ~20% of mani clients are men.' },
    { id: 'kb-sop11', title: 'SOP-11 · Brow lamination aftercare', category: 'SOP', version: 'v2', updated: daysAgo(19), owner: 'Joanne', sensitive: false, cites30d: 12, excerpt: 'Pre: no retinol near brows 48h. Post: keep dry 24h, no makeup on brows 24h.' },
    { id: 'kb-preg', title: 'Pregnancy-safe treatments', category: 'Safety', version: 'v3', updated: daysAgo(27), owner: 'Rachel', sensitive: true, cites30d: 6, excerpt: 'Lash/brow OK with patch test; avoid certain facial acids. AI must recommend checking with doctor — never give medical assurances (hands off if pressed).' },
    { id: 'kb-voice', title: 'Brand voice', category: 'Brand', version: 'v5', updated: daysAgo(45), owner: 'Rachel', sensitive: false, cites30d: 0, excerpt: 'Warm, unhurried, a little playful. EN: light emoji. ZH: 亲切、不过度促销. Never pushy; one nudge max on follow-ups. Banned: “cheapest”, “guaranteed results”.' },
    { id: 'kb-obj', title: 'Objection scripts · “too expensive”', category: 'Sales scripts', version: 'v4', updated: daysAgo(14), owner: 'AI (approved by Rachel)', sensitive: false, cites30d: 21, excerpt: 'Acknowledge → explain value (Japanese gel, free removal) → offer R-03 first-visit 15% → never discount beyond rules.' },
  ];
  const knowledgeGaps = [
    { q: 'Do you do bridal home visits?', asked: 4, last: hoursAgo(6.8), note: 'AI declined to guess; suggest adding a policy (Priya asked too)' },
    { q: 'Is lash glue safe for sensitive eyes / can I get a patch test?', asked: 3, last: daysAgo(2, 16, 0), note: 'Partially covered by Safety doc — needs an FAQ-level answer' },
    { q: 'Do you sell gift cards?', asked: 2, last: daysAgo(5, 12, 0), note: 'No knowledge item exists' },
  ];

  // ---- insights ----
  // 30-day daily leads/bookings with weekly rhythm (Sat/Sun peaks, Mon closed).
  const metrics = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(NOW - i * MS_D);
    const dow = (5 - (i % 7) + 7) % 7; // NOW is a Friday in SGT; keep the weekly rhythm viewer-TZ-independent
    const closed = dow === 1;
    const wk = [0.9, 0, 0.75, 0.8, 0.95, 1.15, 1.45][dow]; // Sun..Sat
    const leads = closed ? ri(0, 2) : Math.round(4.2 * wk + rng() * 3);
    const bookings = closed ? 0 : Math.max(0, Math.round(leads * (0.42 + rng() * 0.18)));
    metrics.push({ date: d.toISOString().slice(0, 10), leads, bookings });
  }
  const funnel = [
    { stage: 'Leads', n: 128 },
    { stage: 'Qualified', n: 96 },
    { stage: 'Booked', n: 61 },
    { stage: 'Showed', n: 54 },
    { stage: 'Rebooked', n: 23 },
  ];
  const channels = [
    { name: 'WhatsApp', leads: 59, booked: 31 },
    { name: 'Instagram', leads: 31, booked: 12 },
    { name: 'Google', leads: 22, booked: 9 },
    { name: 'QR / walk-in', leads: 10, booked: 6 },
    { name: 'Referral', leads: 6, booked: 3 },
  ];
  const topServices = [
    { name: 'BIAB Manicure', bookings: 21, revenue: 1848 },
    { name: 'Volume Lash', bookings: 14, revenue: 2212 },
    { name: 'Signature Facial', bookings: 12, revenue: 1776 },
    { name: 'Lash Fill', bookings: 19, revenue: 1292 },
    { name: 'Gel Extensions', bookings: 9, revenue: 1062 },
  ];
  const forecast = [
    { day: 'Sat 11', lo: 9, mid: 11, hi: 13 },
    { day: 'Sun 12', lo: 8, mid: 10, hi: 12 },
    { day: 'Mon 13', lo: 0, mid: 0, hi: 0 },
    { day: 'Tue 14', lo: 3, mid: 4, hi: 6 },
    { day: 'Wed 15', lo: 4, mid: 5, hi: 7 },
    { day: 'Thu 16', lo: 4, mid: 6, hi: 8 },
    { day: 'Fri 17', lo: 6, mid: 8, hi: 10 },
  ];
  const strategy = {
    title: 'This week: fill Tuesday–Wednesday afternoons before the monsoon surge',
    points: [
      'Tue/Wed 2–6 PM next week are 40% empty while weekend slots are nearly full — approve the rainy-week facial campaign (est. $780–$1,170) to shift demand.',
      'Lash-fill cycle reminders are your highest-ROI automation (46×) — 8 more customers hit their 17-day mark this week; keep it running.',
      'Instagram converts at 39% vs WhatsApp’s 53% — leads answered within 5 minutes book 2.1× more often. The 6 PM auto-nudge for @sitiblooms is queued.',
      'Basis: last 30 days of bookings, June campaign results, NEA 7-day outlook. Forecast confidence: ±20%.',
    ],
  };
  const kpis = [
    { label: 'First response', value: '28 sec', delta: 'was 3.5 h before Rook', dir: 'good' },
    { label: 'Inquiries handled by AI', value: '72%', delta: '28% handed to staff', dir: 'good' },
    { label: 'Lead → booking', value: '48%', delta: '+11 pts vs May', dir: 'good' },
    { label: 'Un-followed-up leads', value: '2', delta: 'was ~15/wk before', dir: 'good' },
    { label: 'Repeat-purchase rate', value: '61%', delta: '+7 pts vs May', dir: 'good' },
    { label: 'Campaign revenue (30d)', value: '$2,728', delta: '$153 message cost', dir: 'good' },
  ];

  return {
    merchant, services, customers, conversations, simulation, opportunities,
    aiActivity, approvals, brief, timelineJasmine, campaigns, reviews,
    cxSummary, knowledge, knowledgeGaps, metrics, funnel, channels,
    topServices, forecast, strategy, kpis,
  };
})();
