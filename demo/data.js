/* Rook demo — simulated data, two industry templates:
     beauty — Glow Theory Studio (in-store beauty, Tanjong Pagar)
     pets   — Whisker & Wag (mobile pet grooming, on-site/dispatch)
   Deterministic: fixed "now" + seeded PRNG. No network, no real customer data. */
window.DEMOS = (() => {
  const NOW = new Date('2026-07-10T08:05:00+08:00'); // Friday morning SGT
  const MS_H = 3600e3, MS_D = 24 * MS_H;
  const at = (ms) => new Date(ms).toISOString();
  const hoursAgo = (h) => at(NOW - h * MS_H);
  const daysAgo = (d, hh = 14, mm = 0) => {
    const dt = new Date(NOW - d * MS_D);
    dt.setHours(hh, mm, 0, 0);
    return dt.toISOString();
  };
  const daysAhead = (d) => at(+NOW + d * MS_D);

  // seeded PRNG (mulberry32)
  const makeRng = (seed) => {
    let s = seed;
    return () => {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const firstNames = ['Wei Ting', 'Hui Min', 'Xin Yi', 'Jia Hui', 'Kai Xin', 'Shu Fen', 'Mei Qi', 'Yan Ling', 'Siti Aisyah', 'Nur Alia', 'Fatimah', 'Zulaikha', 'Priyanka', 'Lakshmi', 'Anjali', 'Kavitha', 'Chloe', 'Vanessa', 'Rachel', 'Samantha', 'Fiona', 'Gwen', 'Elaine', 'Denise', 'Ryan', 'Marcus', 'Daniel', 'Jun Wei'];
  const lastNames = ['Tan', 'Lim', 'Lee', 'Ng', 'Wong', 'Goh', 'Chua', 'Teo', 'Ho', 'Low', 'Binte Ismail', 'Binte Yusof', 'Nair', 'Pillai', 'Menon', 'Chen', 'Koh', 'Ang', 'Sim', 'Yeo'];
  const lifecyclePool = ['Active', 'Active', 'Active', 'Active', 'Converted', 'Evaluating', 'Dormant', 'Dormant', 'VIP', 'New lead', 'Churn risk'];
  const channelPool = ['WhatsApp', 'WhatsApp', 'WhatsApp', 'Instagram', 'Instagram', 'Google', 'QR code', 'Referral'];

  // generated tail of a customer base
  function makeTail(heroes, total, seed, services, tagFn) {
    const rng = makeRng(seed);
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const ri = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
    const customers = [...heroes];
    const used = new Set(heroes.map((c) => c.name));
    while (customers.length < total) {
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      if (used.has(name)) continue;
      used.add(name);
      const lifecycle = pick(lifecyclePool);
      const visits = lifecycle === 'New lead' ? 0 : lifecycle === 'VIP' ? ri(12, 30) : lifecycle === 'Dormant' ? ri(2, 9) : ri(1, 11);
      const svc = pick(services);
      customers.push({
        id: `${heroes[0].id.slice(0, heroes[0].id.indexOf('-') + 1)}g${customers.length}`,
        name,
        phone: `+65 ${ri(8, 9)}${ri(100, 999)} ${ri(1000, 9999)}`,
        lang: rng() < 0.28 ? 'ZH' : 'EN',
        channel: pick(channelPool),
        lifecycle,
        tags: tagFn(pick, rng),
        ltv: visits === 0 ? 0 : visits * ri(58, 148),
        visits,
        lastVisit: visits === 0 ? null : daysAgo(lifecycle === 'Dormant' ? ri(50, 120) : ri(2, 28)),
        nextDue: lifecycle === 'Dormant' || lifecycle === 'New lead' ? null : daysAhead(ri(1, 24)),
        consent: rng() < 0.82,
        pref: svc.name,
      });
    }
    return customers;
  }

  // 30-day daily leads/bookings with a weekly rhythm; NOW is a Friday (dow 5)
  function makeMetrics(wkBySun, base, seed) {
    const rng = makeRng(seed);
    const ri = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(NOW - i * MS_D);
      const dow = (5 - (i % 7) + 7) % 7; // viewer-TZ-independent
      const wk = wkBySun[dow];
      const leads = wk === 0 ? ri(0, 2) : Math.round(base * wk + rng() * 3);
      const bookings = wk === 0 ? 0 : Math.max(0, Math.round(leads * (0.42 + rng() * 0.18)));
      out.push({ date: d.toISOString().slice(0, 10), leads, bookings });
    }
    return out;
  }

  /* ================================================================
     BEAUTY — Glow Theory Studio
     ================================================================ */
  const beauty = (() => {
    const merchant = {
      product: 'Rook',
      name: 'Glow Theory Studio',
      tagline: 'Nails · Lashes · Facials',
      address: '27 Duxton Road, Tanjong Pagar',
      owner: 'Rachel Tan',
      hours: 'Tue–Sun 10:30–20:30, closed Mon',
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
    const beautyTags = ['Prefers weekends', 'Sensitive skin', 'Regular 3-week cycle', 'Responds to promos', 'Quiet hours only', 'Brings a friend', 'Prefers Joanne', 'Prefers Ms Lee', 'Cash payer', 'PayNow'];
    const customers = makeTail(heroCustomers, 55, 20260710, services.slice(0, 9),
      (pick, rng) => rng() < 0.6 ? [pick(beautyTags)] : [pick(beautyTags), pick(beautyTags)]);

    const conversations = [
      {
        id: 'v-priya', customerId: 'c-priya', name: 'Priya Nair', channel: 'WhatsApp',
        preview: 'Bridal party of 5 — lashes + nails, 22 Aug', time: hoursAgo(6.85), unread: true,
        aiStatus: 'escalated', score: 92, intent: 'Group booking',
        fields: { Service: 'Volume lash ×5, gel mani ×5', 'Date needed': 'Sat 22 Aug, before 1 PM', 'Party size': '5 pax', Budget: '“around $1k”', Language: 'English', Urgency: 'High — wedding' },
        handoff: 'Group booking over 4 pax requires staff confirmation of stylist availability (Rules Centre R-07).',
        nextAction: 'Confirm 2 stylists for 22 Aug morning, then send group quote $1,017 (bridal bundle −10%).',
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

    conversations.splice(5, 0, {
      id: 'v-lydia', customerId: null, name: 'Lydia Chew', channel: 'WhatsApp',
      preview: '🎤 Voice note (0:19) → rescheduled to Sat 10:30 AM', time: hoursAgo(12.4), unread: false,
      aiStatus: 'ai', score: 58, intent: 'Voice note · reschedule',
      fields: { Service: 'Classic Gel Manicure', 'Original slot': 'Sat 11 Jul, 3:00 PM', 'New slot': 'Sat 11 Jul, 10:30 AM', Language: 'English (Singlish)', Source: 'Voice note, auto-transcribed' },
      handoff: null,
      nextAction: 'None — reschedule confirmed within cancellation rules. Reminder updated automatically.',
      messages: [
        { from: 'cust', time: hoursAgo(12.45), voice: true, duration: '0:19', text: 'Hi ah, I booked gel mani for tomorrow 3pm one, but my boss just called meeting lah. Can I change to Saturday morning instead? So sorry!! ' },
        { from: 'ai', time: hoursAgo(12.44), text: 'No worries at all, Lydia! I’ve moved your Classic Gel Manicure from Sat 3:00 PM — wait, tomorrow 3 PM — to Saturday 10:30 AM with the same stylist. No fee since it’s more than 24h ahead. See you Saturday! 💅', cite: 'Cancellation policy · >24h free' },
        { from: 'cust', time: hoursAgo(12.4), text: 'lifesaver!! thank youuu' },
        { from: 'sys', time: hoursAgo(12.4), text: 'Voice note transcribed (EN/Singlish) → intent: reschedule → booking moved, reminder updated.' },
      ],
    });

    const simulation = {
      name: 'Hannah Teo', channel: 'WhatsApp', customerLine: 'New number · +65 9611 2087',
      doneToast: 'Lead → booking in 41 seconds, fully automated',
      donePreview: 'Booked · Sun 12 PM Brow Lamination', doneScore: 74,
      fields: { Service: 'Brow Lamination', 'Date needed': 'Sun 12 Jul, 12:00 PM', Budget: '$88', Language: 'English', Urgency: 'Normal' },
      nextAction: 'None — booked automatically. Reminder scheduled Sat 6 PM.',
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
      { id: 'ap-campaign', type: 'Campaign', title: 'Rainy-week off-peak facials', detail: 'Send to 84 consented customers · est. 6–9 bookings ($780–$1,170)', action: { campaign: 'mk-rain' }, toast: 'Campaign approved — sending Sat 10:00 AM to 84 customers' },
      { id: 'ap-review', type: 'Review reply', title: 'Reply to Dana L. (2★ Google review)', detail: 'Apology + invitation to re-do drafted; posting is held for your approval', action: { review: 'rv-dana' }, toast: 'Reply posted to Google' },
      { id: 'ap-price', type: 'Knowledge', title: 'Price list v13 (lash fill $68 → $72)', detail: 'Uploaded by Joanne yesterday — goes live only after owner review', action: { knowledge: 'kb-price' }, toast: 'Price list v13 is live — AI will quote new prices immediately' },
      { id: 'ap-merge', type: 'Identity', title: 'Merge @jasmineeats → Jasmine Koh', detail: 'Same phone on IG profile and CRM record — confirm to merge', action: {}, toast: 'Profiles merged — history from both channels kept' },
    ];

    const brief = {
      headline: 'Good morning, Rachel — 3 decisions need you; the rest is handled.',
      body: 'Overnight the AI answered 9 inquiries (one at 1:14 AM became your biggest lead this week — Priya’s bridal party, ~$1,017). Tuesday afternoons are still 40% empty next week, so a rainy-week facial campaign is drafted and waiting for your approval. One VIP complaint needs a personal call before noon — script is ready.',
    };
    const activityLabel = 'While you slept — since 8:30 PM yesterday';

    const timelines = {
      'c-jasmine': [
        { time: daysAgo(11, 18, 0), kind: 'visit', text: 'BIAB manicure with Joanne — $88 · left 5★ review' },
        { time: daysAgo(11, 19, 30), kind: 'ai', text: 'Review invite sent · review received 40 min later' },
        { time: daysAgo(32, 13, 0), kind: 'visit', text: 'BIAB manicure — $88' },
        { time: daysAgo(41, 10, 0), kind: 'campaign', text: 'Clicked “Bring a friend” campaign · friend booked (referral credited)' },
        { time: daysAgo(53, 15, 0), kind: 'visit', text: 'Gel manicure — $68 · noted: sensitive cuticles, use gentler remover' },
      ],
    };

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

    const reviews = [
      { id: 'rv-dana', name: 'Dana L.', rating: 2, time: hoursAgo(13.4), source: 'Google', text: 'Gel extensions chipped within 3 days. Staff are lovely but for the price I expected the set to last. Disappointed this time.', replyStatus: 'pending', reply: 'Dana, thank you for telling us — this isn’t the standard we hold ourselves to, and I’m sorry. I’ve reached out personally: we’d love to re-do the set with our senior stylist at no charge. — Rachel, owner', linked: 'Recovery ticket RT-114 · same customer as open complaint' },
      { id: 'rv-1', name: 'Jasmine K.', rating: 5, time: daysAgo(11, 19, 40), source: 'Google', text: 'Joanne did my BIAB perfectly again. Booking over WhatsApp took literally 30 seconds.', replyStatus: 'posted', reply: 'Thank you Jasmine! Joanne will be so happy to hear this 💛' },
      { id: 'rv-2', name: 'Wei Ting T.', rating: 5, time: daysAgo(4, 12, 15), source: 'Google', text: 'Replied to my message at 11pm and got me a slot the next morning. The facial was amazing too.', replyStatus: 'posted', reply: 'That’s exactly what we’re here for — day or night! See you at your next glow-up ✨' },
      { id: 'rv-3', name: 'Farhana M.', rating: 4, time: daysAgo(7, 17, 0), source: 'Google', text: 'Great lashes, cosy studio. Parking around Duxton is a pain though.', replyStatus: 'posted', reply: 'Thank you Farhana! Tip for next time: Tanjong Pagar Plaza carpark is 4 min away and much easier 🚗' },
      { id: 'rv-4', name: 'Anjali P.', rating: 5, time: daysAgo(15, 14, 0), source: 'Google', text: 'The birthday brow treat was such a nice surprise. Feels like they actually remember you.', replyStatus: 'posted', reply: 'Happy birthday again, Anjali! 🎂' },
    ];
    const cxSummary = {
      rating: 4.8, count: 187, invited30d: 41, received30d: 17, openTickets: 1,
      themes: [
        { theme: 'Fast replies / easy booking', n: 9, tone: 'good' },
        { theme: 'Lash quality', n: 6, tone: 'good' },
        { theme: 'Parking difficulty', n: 3, tone: 'warn' },
        { theme: 'Gel durability', n: 2, tone: 'bad' },
      ],
      note: 'Themes are extracted from review text and post-service surveys. “Gel durability” created recovery ticket RT-114 and a staff-training suggestion.',
    };

    const knowledge = [
      { id: 'kb-price', title: 'Price list', category: 'Services & pricing', version: 'v12 live · v13 pending approval', approvedVersion: 'v13 live', updated: daysAgo(1, 17, 20), owner: 'Joanne', sensitive: true, cites30d: 214, excerpt: 'All service prices, durations, add-ons. v13 changes: Lash Fill $68 → $72. Sensitive — owner approval required before AI can quote new prices.' },
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

    const onboarding = {
      intro: 'This is what a new merchant does on day one. Total time: about 20 minutes — the Business Brain is built from files you already have.',
      files: [
        { name: 'glow-theory-pricelist.jpg', desc: 'Photo of the studio price list' },
        { name: 'salon-policies.docx', desc: 'Cancellation, lateness & refund policies' },
        { name: 'whatsapp-chat-export.txt', desc: '3 months of real customer Q&A' },
      ],
      extracted: [
        { title: '10 services with prices & durations', cat: 'Services & pricing' },
        { title: 'Cancellation & lateness policy', cat: 'Rules centre' },
        { title: 'First-visit discount rule', cat: 'Rules centre' },
        { title: '23 FAQs found in past chats', cat: 'FAQ' },
        { title: 'Brand voice profile (EN + 中文)', cat: 'Brand' },
        { title: '4 questions it could not answer — sent to you', cat: 'Gap list' },
      ],
      review: 'Prices, refund rules and safety items are marked sensitive — the AI can’t use them until you tap Approve on each. Everything else goes live now.',
      testQ: 'Do you have anything gentle for sensitive skin?',
      testA: 'Yes! Our Hydrating Signature Facial ($148, 60 min) is the gentlest option — no acids or peels, and we always patch-test first. Would you like to try it? First visit is 15% off 😊',
      testCite: 'Price list v1 · imported 2 minutes ago',
      live: 'Connect your WhatsApp number and the AI starts answering — with staff able to take over any conversation, and every price it quotes traceable to what you uploaded.',
    };

    const metrics = makeMetrics([0.9, 0, 0.75, 0.8, 0.95, 1.15, 1.45], 4.2, 20260711);
    const funnel = [
      { stage: 'Leads', n: 128 }, { stage: 'Qualified', n: 96 }, { stage: 'Booked', n: 61 },
      { stage: 'Showed', n: 54 }, { stage: 'Rebooked', n: 23 },
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
      { day: 'Sat 11', lo: 9, mid: 11, hi: 13 }, { day: 'Sun 12', lo: 8, mid: 10, hi: 12 },
      { day: 'Mon 13', lo: 0, mid: 0, hi: 0 }, { day: 'Tue 14', lo: 3, mid: 4, hi: 6 },
      { day: 'Wed 15', lo: 4, mid: 5, hi: 7 }, { day: 'Thu 16', lo: 4, mid: 6, hi: 8 },
      { day: 'Fri 17', lo: 6, mid: 8, hi: 10 },
    ];
    const forecastNote = 'Sat is your peak — 2 stylists booked out by noon';
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
      { label: 'First response', value: '28 sec', delta: 'was 3.5 h before Rook' },
      { label: 'Inquiries handled by AI', value: '72%', delta: '28% handed to staff' },
      { label: 'Lead → booking', value: '48%', delta: '+11 pts vs May' },
      { label: 'Un-followed-up leads', value: '2', delta: 'was ~15/wk before' },
      { label: 'Repeat-purchase rate', value: '61%', delta: '+7 pts vs May' },
      { label: 'Campaign revenue (30d)', value: '$2,728', delta: '$153 message cost' },
      { label: 'Cost per AI-handled conversation', value: '$0.11', delta: 'model + WhatsApp fees' },
      { label: 'Cost per AI-won booking', value: '$1.92', delta: 'vs ~$14 typical paid-ads CPA' },
      { label: 'Staff time saved (est.)', value: '9.5 h/wk', delta: 'repetitive replies + follow-ups' },
    ];

    const social = {
      calendar: [
        { day: 'Fri 10', time: '6:00 PM', channel: 'Instagram Reel', title: 'Lash transformation: before/after (client consent on file)', status: 'scheduled' },
        { day: 'Sat 11', time: '11:00 AM', channel: 'IG carousel', title: 'BIAB at week 3 — durability close-ups', status: 'scheduled' },
        { day: 'Sun 12', time: '10:00 AM', channel: 'Google post', title: 'Sunday slots + the Duxton parking tip', status: 'scheduled' },
        { day: 'Mon 13', time: '12:00 PM', channel: 'IG story', title: 'Studio closed — repost of top review (automated)', status: 'scheduled' },
        { day: 'Tue 14', time: '10:00 AM', channel: 'IG story + Google', title: 'Rainy-week facial promo', status: 'linked', note: 'Publishes only if the campaign is approved' },
        { day: 'Wed 15', time: '—', channel: 'IG Reel', title: 'Client feature: bridal trial morning', status: 'held', note: 'Held — client consent not yet on file' },
        { day: 'Thu 16', time: '—', channel: 'IG story', title: 'Behind the scenes: tool sterilisation routine', status: 'idea', note: 'Needs a 30s clip — see asset list' },
      ],
      posts: [
        { title: 'Volume lash close-up reel', when: '28 Jun', reach: '12,400', saves: 214, inquiries: 9, bookings: 4, revenue: 572, flag: null },
        { title: '“Is BIAB worth it?” Q&A story', when: '5 Jul', reach: '940', saves: 22, inquiries: 5, bookings: 3, revenue: 264, flag: 'Small reach, high conversion — AI suggests making this a monthly format' },
        { title: 'Nail art of the month carousel', when: '2 Jul', reach: '3,100', saves: 89, inquiries: 3, bookings: 1, revenue: 88, flag: null },
      ],
      interactions: [
        { when: '23m ago', who: '@mel.bakes', channel: 'IG comment', text: 'how much for a volume set?', klass: 'Price inquiry', outcome: 'Lead created · replied + invited to WhatsApp' },
        { when: '2h ago', who: '@gwen_ho', channel: 'IG DM', text: 'GORGEOUS 😍 my wedding is in Sept, do you do trials?', klass: 'High intent', outcome: 'Lead created · routed to bridal script' },
        { when: '5h ago', who: '@cst_87', channel: 'IG comment', text: 'waited 20 min past my slot last week :(', klass: 'Complaint', outcome: 'Routed to Reputation · human review' },
        { when: '9h ago', who: '@lifestyle.lena', channel: 'IG DM', text: 'Hi! Open to a collab? 20k followers', klass: 'Partnership', outcome: 'Human review queue' },
        { when: 'yesterday', who: '3 accounts', channel: 'IG comments', text: '(crypto spam links)', klass: 'Spam', outcome: 'Auto-hidden' },
      ],
      assets: [
        'Natural-light close-up of volume lash application — your top-converting theme (2 of your top 3 posts)',
        '30-second BIAB removal clip — answers the FAQ asked 21× this month',
        'Ask Grace Fu for a membership testimonial (VIP, 26 visits, consent on file)',
      ],
    };

    const trust = {
      stats: [
        { value: '45/55', label: 'marketing consent coverage', sub: 'others get service messages only' },
        { value: '312', label: 'consent + DNC checks (30d)', sub: '100% pass before any send' },
        { value: '2', label: 'unsubscribes (30d)', sub: 'both processed in under 1 h' },
        { value: '1', label: 'data request (30d)', sub: 'export completed in 6 h' },
      ],
      rules: [
        'Quiet hours: no marketing 9 PM–9 AM (service replies stay 24/7)',
        'Frequency cap: max 2 marketing messages per customer per 14 days',
        'Auto-excluded: open complaints, no consent, unsubscribed, contacted <14 days',
        'Language rule: ZH-preference customers receive ZH templates',
        'Bulk sends, discounts and public replies require owner/manager approval',
      ],
      roles: [
        { who: 'Rachel Tan', role: 'Owner', can: 'Everything — refunds, exports, permissions' },
        { who: 'Joanne', role: 'Manager', can: 'Approve knowledge & replies · no data exports' },
        { who: 'Front desk (2)', role: 'Staff', can: 'Inbox, tasks, bookings · no bulk sends' },
        { who: 'SocialBoost Co', role: 'Agency', can: 'Social drafts only · no customer data' },
      ],
      audit: [
        { t: '7:41 AM', text: 'AI replied to Marcus Wee — price quoted from Price list v12', tag: 'ai' },
        { t: '7:12 AM', text: 'Campaign pre-check: 84 recipients passed consent + DNC + frequency caps', tag: 'check' },
        { t: '1:14 AM', text: 'AI escalated Priya Nair — group-booking rule R-07', tag: 'handoff' },
        { t: 'Yst 9:03 PM', text: 'Joanne uploaded Price list v13 — held for owner approval', tag: 'change' },
        { t: 'Yst 7:22 PM', text: 'AI paused itself — complaint with refund intent (Dana Lim)', tag: 'handoff' },
        { t: 'Yst 7:23 PM', text: 'Marketing suppressed for Dana Lim until ticket RT-114 closes', tag: 'check' },
        { t: 'Yst 4:05 PM', text: 'Front desk attempted a customer export — denied (staff role)', tag: 'denied' },
        { t: 'Tue 11:30 AM', text: 'Data export completed for Grace Fu (PDPA access request)', tag: 'data' },
      ],
    };

    const tasks = [
      { title: 'Call Dana Lim — recovery ticket RT-114, script drafted', who: 'Rachel', due: 'Today 12:00 PM', status: 'today', source: 'Reputation Agent' },
      { title: 'Confirm 2 stylists for 22 Aug bridal party, then release the group quote', who: 'Rachel', due: 'Today 10:00 AM', status: 'today', source: 'Sales Agent' },
      { title: 'Review Price list v13 (lash fill $68 → $72)', who: 'Rachel', due: 'Today', status: 'today', source: 'Business Brain' },
      { title: 'Call the 2 unpaid deposits if still unpaid at 6 PM (auto-reminders sent)', who: 'Front desk', due: 'Today 6:00 PM', status: 'today', source: 'Follow-up Agent' },
      { title: 'Prep Grace Fu birthday visit — free brow-shape voucher', who: 'Front desk', due: 'Mon 13 Jul', status: 'scheduled', source: 'CRM Agent' },
      { title: 'Draft answer: “Do you do bridal home visits?” (asked 4×)', who: 'Joanne', due: 'This week', status: 'scheduled', source: 'Business Brain' },
      { title: 'Send aftercare notes to yesterday’s 6 lash clients', who: 'AI', due: 'Done 7:45 AM', status: 'done', source: 'Follow-up Agent' },
    ];

    return {
      merchant, services, customers, conversations, simulation, opportunities,
      aiActivity, activityLabel, approvals, brief, timelines, campaigns, reviews,
      cxSummary, knowledge, knowledgeGaps, onboarding, metrics, funnel, channels,
      topServices, forecast, forecastNote, strategy, kpis, social, trust, tasks,
    };
  })();

  /* ================================================================
     PETS — Whisker & Wag Mobile Grooming (on-site / dispatch model)
     ================================================================ */
  const pets = (() => {
    const merchant = {
      product: 'Rook',
      name: 'Whisker & Wag',
      tagline: 'Mobile pet grooming · island-wide',
      address: '2 vans, dispatched from Kaki Bukit',
      owner: 'Daniel Chua',
      hours: 'Daily 9:00–19:00',
      now: NOW.toISOString(),
      nowLabel: 'Fri 10 Jul 2026 · 8:05 AM',
    };

    const services = [
      { id: 'groom-s', name: 'Full Groom — Small Dog (<10kg)', price: 78, mins: 90, cycle: '6–8 weeks' },
      { id: 'groom-m', name: 'Full Groom — Medium Dog (10–25kg)', price: 98, mins: 120, cycle: '6–8 weeks' },
      { id: 'groom-l', name: 'Full Groom — Large Dog (>25kg)', price: 128, mins: 150, cycle: '6–8 weeks' },
      { id: 'groom-cat', name: 'Cat Full Groom', price: 110, mins: 90, cycle: '8–10 weeks' },
      { id: 'deshed', name: 'De-shedding Treatment (add-on)', price: 45, mins: 30, cycle: 'with groom' },
      { id: 'puppy', name: 'Puppy Intro Groom (<6 months)', price: 58, mins: 60, cycle: 'once' },
      { id: 'bath', name: 'Bath & Tidy', price: 58, mins: 60, cycle: '3–4 weeks' },
      { id: 'nails', name: 'Nail Trim & Ear Clean', price: 25, mins: 20, cycle: '4 weeks' },
      { id: 'teeth', name: 'Teeth Cleaning (add-on)', price: 30, mins: 15, cycle: 'with groom' },
    ];

    const heroCustomers = [
      { id: 'cp-sarah', name: 'Sarah Goh', phone: '+65 9330 6172', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Converted', tags: ['Biscuit · Golden Retriever', 'Momo · Corgi', 'Punggol', 'Deposit unpaid 8h'], ltv: 0, visits: 0, lastVisit: null, nextDue: daysAhead(1), consent: true, pref: 'Full Groom ×2 (multi-pet)' },
      { id: 'cp-mdmlim', name: '林太太 Mdm Lim', phone: '+65 8455 9082', lang: 'ZH', channel: 'WhatsApp', lifecycle: 'Evaluating', tags: ['Mimi · Persian cat', 'Anxious pet', 'Bishan'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref: 'Cat Full Groom' },
      { id: 'cp-husky', name: '@huskydad_sg', phone: '—', lang: 'EN', channel: 'Instagram', lifecycle: 'New lead', tags: ['Husky', 'De-shedding', 'Social lead'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref: 'De-shedding Treatment' },
      { id: 'cp-ravi', name: 'Ravi Kumar', phone: '+65 9218 4405', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Churn risk', tags: ['Toby · Shih Tzu', 'Complaint open', 'Regular'], ltv: 936, visits: 12, lastVisit: daysAgo(4, 11, 0), nextDue: null, consent: true, pref: 'Full Groom — Small Dog' },
      { id: 'cp-elaine', name: 'Elaine Sng', phone: '+65 8873 2214', lang: 'EN', channel: 'WhatsApp', lifecycle: 'Active', tags: ['Muffin · Toy Poodle', 'Recovered by follow-up'], ltv: 624, visits: 8, lastVisit: daysAgo(58), nextDue: daysAhead(4), consent: true, pref: 'Full Groom — Small Dog' },
      { id: 'cp-melissa', name: 'Melissa Chng', phone: '+65 9744 8850', lang: 'EN', channel: 'Instagram', lifecycle: 'Active', tags: ['Latte · Maltipoo', 'Merge suggested: @latte.maltipoo'], ltv: 702, visits: 9, lastVisit: daysAgo(13), nextDue: daysAhead(29), consent: true, pref: 'Full Groom — Small Dog' },
      { id: 'cp-imran', name: 'Imran Hakim', phone: '+65 9066 3319', lang: 'EN', channel: 'Referral', lifecycle: 'VIP', tags: ['Rocky + Bella · 2 GSDs', 'East side', 'Quarterly de-shed'], ltv: 2848, visits: 16, lastVisit: daysAgo(18), nextDue: daysAhead(24), consent: true, pref: 'Full Groom — Large Dog' },
      { id: 'cp-joyce', name: 'Joyce Foo', phone: '+65 8291 5567', lang: 'ZH', channel: 'Google', lifecycle: 'Dormant', tags: ['Bobo · Pomeranian', 'Lapsed 11 weeks'], ltv: 1092, visits: 14, lastVisit: daysAgo(77), nextDue: daysAgo(21), consent: true, pref: 'Full Groom — Small Dog' },
    ];
    const petNames = ['Toby', 'Milo', 'Luna', 'Coco', 'Bailey', 'Mochi', 'Snowy', 'Teddy', 'Ginger', 'Oreo', 'Bruno', 'Daisy'];
    const breeds = ['Shih Tzu', 'Toy Poodle', 'Maltipoo', 'Corgi', 'Golden Retriever', 'French Bulldog', 'Pomeranian', 'Schnauzer', 'Singapore Special', 'British Shorthair', 'Ragdoll'];
    const areas = ['Punggol', 'Tampines', 'Bishan', 'Jurong East', 'Yishun', 'Bedok', 'Woodlands', 'Clementi', 'Hougang', 'Bukit Timah'];
    const customers = makeTail(heroCustomers, 52, 20260712, services.slice(0, 8),
      (pick, rng) => [`${pick(petNames)} · ${pick(breeds)}`, pick(areas)]);

    const conversations = [
      {
        id: 'vp-sarah', customerId: 'cp-sarah', name: 'Sarah Goh', channel: 'WhatsApp',
        preview: 'Booked Sat 10 AM — Biscuit + Momo, Punggol', time: hoursAgo(8.4), unread: true,
        aiStatus: 'ai', score: 88, intent: 'On-site booking',
        fields: { Pets: 'Biscuit (Golden Retriever, ~30kg) · Momo (Corgi, ~12kg)', Service: 'Full groom ×2', Address: 'Blk 268C Punggol Field, #— (lift lobby B)', 'Time window': 'Sat 11 Jul, 10 AM–12 PM', 'Van assigned': 'Van 2 (Sengkang loop)', Parking: 'MSCP level 1 confirmed' },
        handoff: null,
        nextAction: 'Deposit link unpaid for 8h — one automated reminder at 10 AM, then hold releases at 8 PM (Rules D-02).',
        messages: [
          { from: 'cust', time: hoursAgo(8.5), text: 'Hi! Do you groom on weekends? I have a golden retriever and a corgi, we’re in Punggol' },
          { from: 'ai', time: hoursAgo(8.49), text: 'Hi Sarah! Yes — weekends are our busiest but I can check the Punggol route for you 🐾 Quick questions: roughly how heavy is each pup, and when did they last have a full groom?' },
          { from: 'cust', time: hoursAgo(8.46), text: 'Biscuit is ~30kg, Momo maybe 12kg? Last groom was 2 months ago, Biscuit is shedding like crazy' },
          { from: 'ai', time: hoursAgo(8.45), text: 'Got it! That would be: Full Groom Large ($128) for Biscuit + Full Groom Medium ($98) for Momo = $226, and 10% off for multi-pet visits → $203.40. For the shedding I’d also suggest our de-shedding treatment (+$45) for Biscuit. Van 2 is in the Punggol–Sengkang loop this Saturday: I have a 10 AM–12 PM window. Shall I book it?', cite: 'Price list v8 · R-04 multi-pet 10%' },
          { from: 'cust', time: hoursAgo(8.42), text: 'yes please! with the deshed for Biscuit' },
          { from: 'ai', time: hoursAgo(8.4), text: 'Booked! Sat 11 Jul, 10 AM–12 PM at Punggol Field — Biscuit (full groom L + de-shed) & Momo (full groom M), $248.40 after multi-pet discount. I’ve sent a $20 deposit link to confirm the van slot; the groomer will call 15 min before arrival. 🚐', cite: 'D-02 deposits · SOP-03 van arrival' },
          { from: 'sys', time: hoursAgo(8.4), text: 'Booking held on Van 2 route · deposit link sent (unpaid) · vaccination proof on file? NO → request queued with reminder.' },
        ],
      },
      {
        id: 'vp-mdmlim', customerId: 'cp-mdmlim', name: '林太太 Mdm Lim', channel: 'WhatsApp',
        preview: '猫咪很紧张…可以打镇静剂吗？', time: hoursAgo(13.1), unread: true,
        aiStatus: 'escalated', score: 66, intent: 'Safety question',
        fields: { Pet: 'Mimi · Persian cat, 6 yrs', Service: 'Cat Full Groom', Concern: 'Very anxious, matting on belly', Address: 'Bishan (exact address pending)', Language: '中文', Urgency: 'Normal' },
        handoff: 'Customer asked about sedation — medical topic. AI must not advise (Safety S-02); senior groomer assessment call required before booking.',
        nextAction: 'Daniel or senior groomer to call Mdm Lim today: assess Mimi’s temperament, explain no-sedation policy, offer low-stress home-environment groom.',
        messages: [
          { from: 'cust', time: hoursAgo(13.2), text: '你好，我家的波斯猫毛打结了，但是它很紧张，别的地方都不敢碰它。你们可以打镇静剂吗？' },
          { from: 'ai', time: hoursAgo(13.19), text: '林太太您好！我们不提供镇静服务——这属于兽医的医疗范围，为了Mimi的安全我不能给这方面的建议。不过好消息是：我们是上门服务，猫咪在自己熟悉的家里通常会放松很多🐱 我已经安排我们的资深美容师今天给您回电，先了解Mimi的情况再决定怎么进行，好吗？', cite: 'Safety S-02 · no sedation, groomer assessment' },
          { from: 'cust', time: hoursAgo(13.1), text: '好的，麻烦了' },
          { from: 'sys', time: hoursAgo(13.1), text: 'Escalated — medical/sedation topic (S-02). Assessment call task created for senior groomer. No booking until assessment done.' },
        ],
      },
      {
        id: 'vp-husky', customerId: 'cp-husky', name: '@huskydad_sg', channel: 'Instagram',
        preview: 'bro how much to deshed a husky 💀', time: hoursAgo(10.2), unread: false,
        aiStatus: 'ai', score: 62, intent: 'Price inquiry',
        fields: { Pet: 'Husky (large, double coat)', Service: 'Full Groom L + De-shedding', Address: '—', 'Time window': '—', Language: 'English', Urgency: 'Browsing' },
        handoff: null,
        nextAction: 'If no reply by 6 PM, send one follow-up with before/after de-shed photos (max 1 nudge — IG policy).',
        messages: [
          { from: 'cust', time: hoursAgo(10.2), text: 'bro how much to deshed a husky 💀 the fur situation at home is out of control' },
          { from: 'ai', time: hoursAgo(10.19), text: 'Haha we know that situation well 😄 For a husky: Full Groom Large is $128 + de-shedding treatment $45 — and we come to you, so the fur stays in our van, not your sofa. First visit is 15% off → $147.05 total. Want me to check when a van is next in your area? Easiest on WhatsApp: wa.me/6581234567', cite: 'Price list v8 · R-01 first-visit 15%' },
          { from: 'sys', time: hoursAgo(10.19), text: 'Social lead created from IG DM · high-intent keyword “how much” · guided to WhatsApp.' },
        ],
      },
      {
        id: 'vp-ravi', customerId: 'cp-ravi', name: 'Ravi Kumar', channel: 'WhatsApp',
        preview: 'Toby’s nail was cut too short — he was bleeding', time: hoursAgo(16.9), unread: false,
        aiStatus: 'human', score: null, intent: 'Complaint · injury report',
        fields: { Pet: 'Toby · Shih Tzu', Issue: 'Nail cut too short at Tue visit, minor bleeding', 'Customer tier': 'Regular · 12 visits', Sentiment: 'Upset', Urgency: 'High' },
        handoff: 'Pet welfare complaint — AI paused itself immediately (Safety S-01: any injury report goes to a human). Recovery ticket RT-52 created; vet-bill offers are owner-only decisions.',
        nextAction: 'Daniel to call Ravi before 11 AM. Suggested remedy (within D-05): apologise, offer vet-visit reimbursement review + free next groom with senior groomer Mei.',
        messages: [
          { from: 'cust', time: hoursAgo(17), text: 'Hi. Not happy at all — after Tuesday’s groom Toby’s nail was cut too short and it was bleeding that evening. He wouldn’t let us touch his paw all night.' },
          { from: 'ai', time: hoursAgo(16.99), text: 'Ravi, I’m so sorry to read this — Toby’s wellbeing comes first, and this shouldn’t have happened. I’m escalating this directly to Daniel, our owner, who will call you this morning. If Toby is still limping or the paw looks swollen, please do see your vet and keep the receipt. 🙏' },
          { from: 'sys', time: hoursAgo(16.99), text: 'AI paused (pet injury report — S-01). Recovery ticket RT-52 → owner. Marketing suppressed. Groomer noted for retraining review.' },
        ],
      },
      {
        id: 'vp-elaine', customerId: 'cp-elaine', name: 'Elaine Sng', channel: 'WhatsApp',
        preview: 'Yes Tues morning works, thanks for the nudge 😅', time: hoursAgo(21.3), unread: false,
        aiStatus: 'ai', score: 73, intent: 'Cycle reminder → rebooked',
        fields: { Pet: 'Muffin · Toy Poodle', Service: 'Full Groom — Small Dog', 'Time window': 'Tue 14 Jul, 9:30–11 AM', 'Van assigned': 'Van 1 (Clementi loop)', Cycle: '8 weeks (2 overdue)' },
        handoff: null,
        nextAction: 'Reminder Mon 6 PM with groomer name + arrival window (automated).',
        messages: [
          { from: 'sys', time: daysAgo(1, 10, 0), text: 'Muffin is 2 weeks past the 8-week groom cycle — Follow-up Agent triggered win-back step 1.' },
          { from: 'ai', time: hoursAgo(22), text: 'Hi Elaine! Muffin must be getting fluffy by now 🐩 It’s been about 10 weeks since her last groom. Van 1 is in the Clementi area Tuesday morning — want me to reserve her usual full groom ($78)? Weekday slots are quieter for her too.' },
          { from: 'cust', time: hoursAgo(21.35), text: 'Yes Tues morning works, thanks for the nudge 😅 she’s basically a sheep now' },
          { from: 'ai', time: hoursAgo(21.3), text: 'Reserved! Tue 14 Jul, 9:30–11 AM window with Mei. See you (and the sheep) then! 🐑✂️' },
          { from: 'sys', time: hoursAgo(21.3), text: 'Conversion recovered by cycle reminder (customer was lapsing). Attributed: Follow-up Agent.' },
        ],
      },
    ];

    conversations.splice(4, 0, {
      id: 'vp-zul', customerId: null, name: 'Zulkifli Rahmat', channel: 'WhatsApp',
      preview: '🎤 Voice note (0:23) → aftercare answered + monitoring', time: hoursAgo(9.6), unread: false,
      aiStatus: 'ai', score: null, intent: 'Voice note · aftercare',
      fields: { Pet: 'Sunny · Golden Retriever', Topic: 'Scratching after Tuesday’s groom', Assessment: 'Normal post-groom itch window (24–48h)', 'Watch flag': 'Auto-follow-up tomorrow — escalate if persists', Source: 'Voice note, auto-transcribed' },
      handoff: null,
      nextAction: 'Automated check-in tomorrow 10 AM; if scratching persists → hand off + suggest vet (Safety S-01 threshold).',
      messages: [
        { from: 'cust', time: hoursAgo(9.65), voice: true, duration: '0:23', text: 'Eh hello, quick question — Sunny keeps scratching since the groom on Tuesday. Is that normal or should I be worried? He’s not bleeding or anything, just itchy.' },
        { from: 'ai', time: hoursAgo(9.6), text: 'Thanks for checking, Zul! Mild itchiness for 24–48h after a de-shed groom is common while the coat settles — no redness or bleeding is a good sign. Keep him off grass baths today and I’ll check in with you tomorrow. If it gets worse or you see red patches, please see your vet and let us know right away. 🐕', cite: 'SOP-07 · Post-groom aftercare' },
        { from: 'sys', time: hoursAgo(9.6), text: 'Voice note transcribed → aftercare answered from SOP · follow-up scheduled tomorrow 10 AM · S-01 escalation armed if symptoms persist.' },
      ],
    });

    const simulation = {
      name: 'Jon Lau', channel: 'WhatsApp', customerLine: 'New number · +65 8802 4416',
      doneToast: 'Lead → routed → booked in 38 seconds — postal code picked the van',
      donePreview: 'Booked · Sat 2–4 PM nail trim (Yishun)', doneScore: 70,
      fields: { Pet: 'Shih Tzu', Service: 'Nail Trim & Ear Clean', Address: 'Yishun (postal 760xxx)', 'Time window': 'Sat 11 Jul, 2–4 PM', 'Van assigned': 'Van 1 (north loop)' },
      nextAction: 'None — booked automatically. Groomer calls 15 min before arrival.',
      steps: [
        { from: 'cust', delay: 600, text: 'hi can u do a nail trim for my shih tzu this weekend?' },
        { from: 'typing', delay: 900 },
        { from: 'ai', delay: 0, text: 'Hi! Of course 🐾 Nail trim + ear clean is $25 (or free as part of a full groom). We come to you — could you share your postal code so I can check which van is in your area this weekend?', cite: 'Price list v8' },
        { from: 'cust', delay: 2100, text: '760124, yishun' },
        { from: 'typing', delay: 900 },
        { from: 'ai', delay: 0, text: 'You’re in luck — Van 1 does the north loop on Saturday and has a 2–4 PM window near Yishun Ave 4. Booked for your shih tzu at $25 ✅ The groomer will call 15 min before arriving. What’s the little one’s name?', cite: 'Route planner · SOP-03 van arrival' },
        { from: 'cust', delay: 1800, text: 'Pepper 😄 thanks!' },
        { from: 'typing', delay: 700 },
        { from: 'ai', delay: 0, text: 'See you Saturday, Pepper! 🐕 You’ll get a reminder Friday evening with the exact arrival window.' },
        { from: 'sys', delay: 400, text: 'Lead created → routed to Van 1 by postal code → booked in 38 seconds. Pet profile created (Pepper · Shih Tzu).' },
      ],
    };

    const opportunities = [
      { convId: 'vp-ravi', who: 'Ravi Kumar', why: 'Pet injury complaint (Toby, nail). Call before 11 AM — vet-bill decision is yours, script ready', kind: 'critical', value: 'LTV $936' },
      { convId: 'vp-mdmlim', who: 'Mdm Lim 林太太', why: 'Anxious Persian cat + sedation question — senior groomer assessment call needed today', kind: 'decision', value: '$110' },
      { convId: 'vp-sarah', who: 'Sarah Goh', why: 'Sat 10 AM double-groom held on Van 2 — $20 deposit unpaid for 8h, auto-releases 8 PM', kind: 'watch', value: '$248' },
      { convId: null, who: 'Saturday routes', why: 'Van 1 north loop 92% full, Van 2 Punggol loop 85% — 3 slots left across both. Waitlist is on', kind: 'watch', value: '3 slots' },
      { convId: null, who: '4 overdue regulars', why: 'Joyce (Bobo), + 3 more past their 8-week cycle — cycle reminders queued for 11 AM', kind: 'suggestion', value: '~$390' },
    ];

    const aiActivity = [
      { n: 7, label: 'inquiries answered overnight' },
      { n: 9, label: 'cycle reminders sent' },
      { n: 6, label: 'bookings routed to vans' },
      { n: 5, label: 'review invites sent' },
      { n: 3, label: 'tasks created for staff' },
    ];

    const approvals = [
      { id: 'ap-p-heat', type: 'Campaign', title: 'Heatwave coat-care special', detail: 'Send to 96 consented customers · est. 8–12 bookings ($860–$1,290)', action: { campaign: 'mk-p-heat' }, toast: 'Campaign approved — sending tomorrow 9:30 AM to 96 customers' },
      { id: 'ap-p-review', type: 'Review reply', title: 'Reply to Ravi K. (2★ Google review)', detail: 'Apology + remedy drafted; posting held for your approval', action: { review: 'rv-p-ravi' }, toast: 'Reply posted to Google' },
      { id: 'ap-p-price', type: 'Knowledge', title: 'Price list v9 (Large dog $128 → $138)', detail: 'Fuel + time costs on large breeds — goes live only after your review', action: { knowledge: 'kb-p-price' }, toast: 'Price list v9 is live — AI will quote new prices immediately' },
      { id: 'ap-p-merge', type: 'Identity', title: 'Merge @latte.maltipoo → Melissa Chng', detail: 'Same phone on IG profile and CRM record — confirm to merge', action: {}, toast: 'Profiles merged — history from both channels kept' },
    ];

    const brief = {
      headline: 'Good morning, Daniel — 2 calls to make; Saturday is nearly sold out.',
      body: 'Overnight the AI answered 7 inquiries and routed 6 bookings onto the vans. Saturday’s two routes are at 92% and 85% — the waitlist is on. Ravi reported Toby’s nail was cut too short (call before 11, remedy drafted), and Mdm Lim’s anxious Persian needs a senior groomer assessment call. NEA has a heat advisory next week: a coat-care campaign is drafted for your approval.',
    };
    const activityLabel = 'While you slept — since 7:00 PM yesterday';

    const timelines = {
      'cp-elaine': [
        { time: hoursAgo(21.3), kind: 'ai', text: 'Cycle reminder → rebooked Tue 14 Jul (Van 1, Clementi loop)' },
        { time: daysAgo(58, 10, 0), kind: 'visit', text: 'Full groom — Muffin · $78 · groomer Mei · note: sensitive around tail' },
        { time: daysAgo(58, 12, 0), kind: 'ai', text: 'Review invite sent · 5★ received' },
        { time: daysAgo(114, 10, 0), kind: 'visit', text: 'Full groom — Muffin · $78' },
      ],
    };

    const campaigns = [
      {
        id: 'mk-p-heat', name: 'Heatwave coat-care special', status: 'pending',
        trigger: 'External: NEA heat advisory Mon–Thu next week · de-shed capacity open on weekday routes',
        audience: '96 consented customers with double-coat or long-hair pets, no groom in 4+ weeks. Excludes: open complaints, unsubscribed, contacted <14 days ago.',
        channel: 'WhatsApp template', schedule: 'Sat 9:30 AM',
        copy: 'Heatwave incoming 🥵 Help {pet} beat it: 15% off de-shedding & summer trims on weekday slots next week. Reply YES and we’ll route a van to you.',
        estimate: { reach: 96, bookings: '8–12', revenue: '$860–$1,290', cost: '$10.60 (WhatsApp fees)' },
      },
      {
        id: 'mk-p-bday', name: 'Pet birthdays (July)', status: 'scheduled',
        trigger: 'Lifecycle: pet birthday within 7 days · runs monthly',
        audience: '5 pets with July birthdays on file',
        channel: 'WhatsApp template', schedule: 'Each pet, 3 days before birthday, 10 AM',
        copy: 'It’s almost {pet}’s birthday! 🎂 Our treat: a free teeth-clean or blueberry facial with any groom this month.',
        estimate: { reach: 5, bookings: '2–3', revenue: '$180–$280', cost: '$0.55' },
      },
      {
        id: 'mk-p-cycle', name: '8-week cycle reminders (rolling)', status: 'completed', ended: daysAgo(1),
        trigger: 'Lifecycle: 56 days since last groom (per pet)',
        audience: 'Rolling — 44 sends in June', channel: 'WhatsApp template', schedule: 'Automated, per pet',
        copy: '{pet} is due for a groom! {van} is in {area} on {day} — want your usual slot?',
        results: { sent: 44, replies: 31, bookings: 26, revenue: 2392, cost: 43, roi: '55×', unsubs: 0 },
      },
      {
        id: 'mk-p-winback', name: 'Dormant win-back (June)', status: 'completed', ended: daysAgo(14),
        trigger: 'Lifecycle: no groom in 12+ weeks, LTV > $200',
        audience: '51 dormant customers', channel: 'WhatsApp template', schedule: 'Sent 22 Jun, 10 AM',
        copy: '“{pet} misses us!” + 15% off next groom, valid 3 weeks.',
        results: { sent: 51, replies: 9, bookings: 6, revenue: 644, cost: 66, roi: '9.8×', unsubs: 2 },
      },
      {
        id: 'mk-p-weekday', name: 'Weekday morning routes (June)', status: 'completed', ended: daysAgo(21),
        trigger: 'Capacity: Tue–Thu 9–12 routes under 60% booked',
        audience: '38 flexible customers (retirees, WFH)', channel: 'WhatsApp template', schedule: 'Sent 15 Jun',
        copy: '10% off weekday-morning van slots — quieter for anxious pets too.',
        results: { sent: 38, replies: 8, bookings: 5, revenue: 470, cost: 33, roi: '14×', unsubs: 0 },
      },
    ];

    const reviews = [
      { id: 'rv-p-ravi', name: 'Ravi K.', rating: 2, time: hoursAgo(12.6), source: 'Google', text: 'Been using them a year but last groom Toby’s nail was cut too short and bled. Groomers are usually careful — this visit wasn’t.', replyStatus: 'pending', reply: 'Ravi, I’m truly sorry — Toby’s safety is the whole point of what we do, and we fell short. I’ve called you directly; the vet check is on us and Mei, our senior groomer, will handle Toby’s next visit personally. — Daniel, owner', linked: 'Recovery ticket RT-52 · same customer as open complaint' },
      { id: 'rv-p-1', name: 'Adeline W.', rating: 5, time: daysAgo(3, 16, 20), source: 'Google', text: 'They groomed our super anxious cat in our living room. No cage, no car ride, no drama. Life-changing honestly.', replyStatus: 'posted', reply: 'This is exactly why we go to you instead 🐱 Thank you Adeline!' },
      { id: 'rv-p-2', name: 'Imran H.', rating: 5, time: daysAgo(9, 13, 0), source: 'Google', text: 'Two GSDs de-shedded in one visit. The van is spotless and they text you when they’re 15 min away. Zero fuss.', replyStatus: 'posted', reply: 'Rocky and Bella were stars as always 💪 See you next quarter, Imran!' },
      { id: 'rv-p-3', name: 'Joyce F.', rating: 4, time: daysAgo(80, 11, 0), source: 'Google', text: 'Bobo looks great every time. Only wish there were more east-side slots on weekends.', replyStatus: 'posted', reply: 'Thank you Joyce! We hear you on east-side weekends — we’re adding a Bedok loop soon 🚐' },
      { id: 'rv-p-4', name: 'Wei Ting T.', rating: 5, time: daysAgo(6, 18, 30), source: 'Google', text: 'Booked over WhatsApp at 11pm, van came Saturday. The reminder when they were 15 mins away was a nice touch.', replyStatus: 'posted', reply: 'Night-owl bookings are our specialty 😄 Thank you!' },
    ];
    const cxSummary = {
      rating: 4.9, count: 214, invited30d: 38, received30d: 15, openTickets: 1,
      themes: [
        { theme: 'Convenience / no travel stress', n: 11, tone: 'good' },
        { theme: 'Gentle with anxious pets', n: 7, tone: 'good' },
        { theme: 'East-side weekend availability', n: 4, tone: 'warn' },
        { theme: 'Nail-trimming care', n: 2, tone: 'bad' },
      ],
      note: 'Themes are extracted from review text and post-visit surveys. “Nail-trimming care” created recovery ticket RT-52 and a groomer-retraining suggestion.',
    };

    const knowledge = [
      { id: 'kb-p-price', title: 'Price list (by size & coat)', category: 'Services & pricing', version: 'v8 live · v9 pending approval', approvedVersion: 'v9 live', updated: daysAgo(2, 9, 40), owner: 'Daniel', sensitive: true, cites30d: 189, excerpt: 'All grooming prices by pet size, coat type, add-ons. v9 change: Large dog $128 → $138. Sensitive — owner approval required before AI can quote new prices.' },
      { id: 'kb-p-zones', title: 'Service zones & van routing', category: 'Operations', version: 'v6', updated: daysAgo(7), owner: 'Daniel', sensitive: false, cites30d: 84, excerpt: 'Island-wide. Postal code → route loop mapping (Van 1 north/west, Van 2 north-east). $15 surcharge: Sentosa. AI checks route day before offering windows.' },
      { id: 'kb-p-s01', title: 'S-01 · Injury & welfare reports', category: 'Safety', version: 'v2', updated: daysAgo(30), owner: 'Daniel', sensitive: true, cites30d: 1, excerpt: 'ANY report of injury, bleeding, limping or distress: AI apologises, advises vet if symptoms persist, and hands off immediately. Vet-bill offers are owner-only.' },
      { id: 'kb-p-s02', title: 'S-02 · Sedation & medical topics', category: 'Safety', version: 'v3', updated: daysAgo(25), owner: 'Daniel', sensitive: true, cites30d: 4, excerpt: 'No sedation services, ever. Anxious/aggressive/senior pets require a groomer assessment call before booking. AI never gives medical advice.' },
      { id: 'kb-p-vax', title: 'Vaccination policy', category: 'Rules centre', version: 'v4', updated: daysAgo(19), owner: 'Daniel', sensitive: true, cites30d: 22, excerpt: 'First-time pets: proof of core vaccinations before the visit. AI requests a photo of the vax booklet after booking.' },
      { id: 'kb-p-r04', title: 'R-04 · Multi-pet discount', category: 'Rules centre', version: 'v2', updated: daysAgo(35), owner: 'Daniel', sensitive: true, cites30d: 12, excerpt: '10% off total for 2+ pets in one visit, same address. Not stackable with first-visit 15% (apply the better one).' },
      { id: 'kb-p-d02', title: 'D-02 · Deposits & holds', category: 'Rules centre', version: 'v3', updated: daysAgo(16), owner: 'Daniel', sensitive: true, cites30d: 31, excerpt: '$20 deposit confirms a van slot. Unpaid holds: 1 automated reminder, auto-release after 12h. Refundable up to 24h before.' },
      { id: 'kb-p-mat', title: 'Severe matting policy', category: 'SOP', version: 'v2', updated: daysAgo(28), owner: 'Mei (senior groomer)', sensitive: false, cites30d: 9, excerpt: 'Severe matting may require a shave-down — groomer decides on-site for the pet’s comfort. AI sets this expectation but never promises a specific outcome.' },
      { id: 'kb-p-sop03', title: 'SOP-03 · Van arrival protocol', category: 'SOP', version: 'v5', updated: daysAgo(11), owner: 'Daniel', sensitive: false, cites30d: 41, excerpt: 'Groomer calls 15 min before arrival. Needs: parking lot or loading bay access. Customer told: water/power NOT needed, van is self-contained.' },
      { id: 'kb-p-voice', title: 'Brand voice', category: 'Brand', version: 'v3', updated: daysAgo(50), owner: 'Daniel', sensitive: false, cites30d: 0, excerpt: 'Friendly, pet-name-first (“How’s Biscuit doing?”), light humour OK. EN + 中文. Never fear-based selling. Banned: “guaranteed calm”, “100% safe”.' },
    ];
    const knowledgeGaps = [
      { q: 'Do you groom rabbits?', asked: 3, last: daysAgo(1, 15, 0), note: 'No policy exists — AI declined to guess each time' },
      { q: 'Can the groomer give my dog his medication during the visit?', asked: 2, last: daysAgo(4, 10, 0), note: 'Safety-adjacent — needs an owner-approved policy, likely “no, but we can pause while you do”' },
      { q: 'Do you offer package pricing for monthly grooms?', asked: 2, last: daysAgo(6, 17, 0), note: 'No knowledge item exists — possible new revenue line' },
    ];

    const onboarding = {
      intro: 'This is what a new merchant does on day one. Total time: about 20 minutes — the Business Brain is built from files you already have.',
      files: [
        { name: 'whisker-wag-rates.pdf', desc: 'Rate card by pet size & coat' },
        { name: 'van-routes.xlsx', desc: 'Weekly route loops for both vans' },
        { name: 'whatsapp-chat-export.txt', desc: '3 months of real customer Q&A' },
      ],
      extracted: [
        { title: '9 services priced by size & coat', cat: 'Services & pricing' },
        { title: 'Route loops → postal-code zones', cat: 'Operations' },
        { title: 'Deposit & cancellation rules', cat: 'Rules centre' },
        { title: '19 FAQs found in past chats', cat: 'FAQ' },
        { title: 'Safety flags: sedation & injury topics', cat: 'Safety' },
        { title: '3 questions it could not answer — sent to you', cat: 'Gap list' },
      ],
      review: 'Prices, safety rules and deposits are marked sensitive — the AI can’t use them until you tap Approve on each. Everything else goes live now.',
      testQ: 'How much to groom a 20kg labradoodle? We’re in Tampines.',
      testA: 'A 20kg labradoodle is our Medium Full Groom — $98, about 2 hours, and we come to you 🚐 Van 2 covers Tampines on Wednesdays and Saturdays. First visit is 15% off → $83.30. Want me to check this Saturday?',
      testCite: 'Price list v1 · Route zones — imported 2 minutes ago',
      live: 'Connect your WhatsApp number and the AI starts answering — with staff able to take over any conversation, and every price it quotes traceable to what you uploaded.',
    };

    const metrics = makeMetrics([1.35, 0.7, 0.75, 0.8, 0.85, 1.0, 1.5], 4.6, 20260713);
    const funnel = [
      { stage: 'Leads', n: 141 }, { stage: 'Qualified', n: 104 }, { stage: 'Booked', n: 72 },
      { stage: 'Completed', n: 66 }, { stage: 'Rebooked', n: 31 },
    ];
    const channels = [
      { name: 'WhatsApp', leads: 61, booked: 34 },
      { name: 'Instagram', leads: 34, booked: 14 },
      { name: 'Google', leads: 29, booked: 13 },
      { name: 'Referral', leads: 12, booked: 8 },
      { name: 'Vet-clinic QR', leads: 5, booked: 3 },
    ];
    const topServices = [
      { name: 'Full Groom M', bookings: 24, revenue: 2352 },
      { name: 'Full Groom L', bookings: 15, revenue: 1920 },
      { name: 'Full Groom S', bookings: 18, revenue: 1404 },
      { name: 'Cat Groom', bookings: 9, revenue: 990 },
      { name: 'De-shed add-on', bookings: 21, revenue: 945 },
    ];
    const forecast = [
      { day: 'Sat 11', lo: 11, mid: 13, hi: 14 }, { day: 'Sun 12', lo: 10, mid: 12, hi: 14 },
      { day: 'Mon 13', lo: 4, mid: 6, hi: 8 }, { day: 'Tue 14', lo: 5, mid: 6, hi: 8 },
      { day: 'Wed 15', lo: 5, mid: 7, hi: 9 }, { day: 'Thu 16', lo: 5, mid: 7, hi: 9 },
      { day: 'Fri 17', lo: 7, mid: 9, hi: 11 },
    ];
    const forecastNote = 'Both vans near capacity Sat–Sun — heat advisory lifts weekday demand';
    const strategy = {
      title: 'This week: push heatwave de-shedding onto quiet weekday routes',
      points: [
        'Weekends are at 88%+ but Tue–Thu morning routes run at 58% — approve the heatwave coat-care campaign (est. $860–$1,290) to move flexible customers off-peak.',
        'Cycle reminders are your highest-ROI automation (55×) — 4 more pets pass their 8-week mark this week; reminders are queued for 11 AM.',
        'East-side weekend demand keeps exceeding supply (4 review mentions + waitlist). A Bedok loop on alternate Saturdays would absorb it — worth costing a 3rd van day.',
        'Basis: last 30 days of bookings, June campaign results, NEA heat advisory. Forecast confidence: ±20%.',
      ],
    };
    const kpis = [
      { label: 'First response', value: '31 sec', delta: 'was 4 h before Rook' },
      { label: 'Inquiries handled by AI', value: '69%', delta: '31% handed to staff' },
      { label: 'Lead → booking', value: '51%', delta: '+9 pts vs May' },
      { label: 'Un-followed-up leads', value: '3', delta: 'was ~12/wk before' },
      { label: 'Repeat / rebook rate', value: '68%', delta: '+6 pts vs May' },
      { label: 'Campaign revenue (30d)', value: '$3,506', delta: '$142 message cost' },
      { label: 'Cost per AI-handled conversation', value: '$0.12', delta: 'model + WhatsApp fees' },
      { label: 'Cost per AI-won booking', value: '$1.71', delta: 'vs ~$12 typical paid-ads CPA' },
      { label: 'Staff time saved (est.)', value: '8 h/wk', delta: 'phone tag + route planning' },
    ];

    const social = {
      calendar: [
        { day: 'Fri 10', time: '5:00 PM', channel: 'Instagram Reel', title: 'Husky de-shed timelapse pt 2 (pt 1 hit 48k)', status: 'scheduled' },
        { day: 'Sat 11', time: '10:00 AM', channel: 'IG story', title: 'Route day: Van 2 in Punggol — 1 slot left', status: 'scheduled', note: 'Capacity-aware — pulls live route data' },
        { day: 'Sun 12', time: '11:00 AM', channel: 'Google post', title: 'Weekend nail trims — we come to you', status: 'scheduled' },
        { day: 'Mon 13', time: '9:00 AM', channel: 'IG post + Google', title: 'Heatwave coat-care tips', status: 'linked', note: 'Publishes only if the campaign is approved' },
        { day: 'Wed 15', time: '—', channel: 'IG Reel', title: 'Client feature: Mimi the Persian’s home groom', status: 'held', note: 'Held — owner consent not yet on file' },
        { day: 'Thu 16', time: '—', channel: 'IG carousel', title: 'Matting 101: why we sometimes recommend a shave-down', status: 'idea', note: 'Sets expectations — ties to the matting policy' },
      ],
      posts: [
        { title: 'Husky de-shed timelapse', when: '30 Jun', reach: '48,200', saves: 1830, inquiries: 31, bookings: 9, revenue: 1247, flag: 'Outlier — AI suggests a boosted ad + follow-up reel while interest is hot' },
        { title: 'Anxious cat home groom (with consent)', when: '24 Jun', reach: '9,600', saves: 412, inquiries: 8, bookings: 4, revenue: 436, flag: null },
        { title: 'Van tour: inside the mobile salon', when: '3 Jul', reach: '5,400', saves: 158, inquiries: 6, bookings: 3, revenue: 301, flag: null },
      ],
      interactions: [
        { when: '41m ago', who: '@corgi.mum', channel: 'IG comment', text: 'how much for a corgi full groom?', klass: 'Price inquiry', outcome: 'Lead created · replied + invited to WhatsApp' },
        { when: '3h ago', who: '@jubeethefrenchie', channel: 'IG DM', text: 'do u cover Jurong?', klass: 'FAQ', outcome: 'Answered from route zones · no human needed' },
        { when: '6h ago', who: '@max_n_millie', channel: 'IG comment', text: 'my dog was so scared after your groom last month', klass: 'Complaint', outcome: 'Routed to Reputation · human review' },
        { when: '8h ago', who: 'Paws Haven Shelter', channel: 'IG DM', text: 'we’re a shelter — any discount for rescues?', klass: 'Partnership', outcome: 'Human queue · flagged as community-campaign idea' },
        { when: 'yesterday', who: '5 accounts', channel: 'IG comments', text: '(spam links)', klass: 'Spam', outcome: 'Auto-hidden' },
      ],
      assets: [
        'Before/after de-shed shots in daylight — your top-converting theme by far',
        '15-second clip of a groomer calming an anxious dog (get owner consent first)',
        'Ask Imran for a two-GSD testimonial (VIP, consent on file)',
      ],
    };

    const trust = {
      stats: [
        { value: '41/52', label: 'marketing consent coverage', sub: 'others get service messages only' },
        { value: '348', label: 'consent + DNC checks (30d)', sub: '100% pass before any send' },
        { value: '3', label: 'unsubscribes (30d)', sub: 'all processed in under 1 h' },
        { value: '0', label: 'data requests (30d)', sub: 'none this month' },
      ],
      rules: [
        'Quiet hours: no marketing 8 PM–9 AM (service replies stay 24/7)',
        'Frequency cap: max 2 marketing messages per customer per 14 days',
        'Auto-excluded: open complaints, no consent, unsubscribed, contacted <14 days',
        'Vaccination records stored as sensitive documents — staff view only, never in chat logs',
        'Bulk sends, discounts and public replies require owner/senior approval',
      ],
      roles: [
        { who: 'Daniel Chua', role: 'Owner', can: 'Everything — refunds, exports, permissions' },
        { who: 'Mei', role: 'Senior groomer', can: 'Approve SOPs & safety replies · no data exports' },
        { who: 'Groomers (3)', role: 'Staff', can: 'Route tasks, chat takeover · no bulk sends' },
        { who: 'PawSocial', role: 'Agency', can: 'Social drafts only · no customer data' },
      ],
      audit: [
        { t: '7:52 AM', text: 'AI routed Jon Lau to Van 1 by postal code — quoted from Price list v8', tag: 'ai' },
        { t: '7:30 AM', text: 'Campaign pre-check: 96 recipients passed consent + DNC + frequency caps', tag: 'check' },
        { t: 'Yst 7:05 PM', text: 'AI refused sedation advice — safety rule S-02, escalated to senior groomer', tag: 'handoff' },
        { t: 'Yst 3:10 PM', text: 'AI paused itself — pet injury report (Ravi Kumar), ticket RT-52', tag: 'handoff' },
        { t: 'Yst 3:11 PM', text: 'Marketing suppressed for Ravi Kumar until ticket RT-52 closes', tag: 'check' },
        { t: 'Yst 1:44 PM', text: 'Groomer requested the customer list — denied (staff role)', tag: 'denied' },
        { t: 'Wed 6:20 PM', text: 'Daniel uploaded Price list v9 — held for owner approval', tag: 'change' },
        { t: 'Tue 10:15 AM', text: 'Vaccination booklet photo filed for Sarah Goh (sensitive document)', tag: 'data' },
      ],
    };

    const tasks = [
      { title: 'Call Ravi Kumar — ticket RT-52, vet-bill decision is owner-only', who: 'Daniel', due: 'Today 11:00 AM', status: 'today', source: 'Reputation Agent' },
      { title: 'Assessment call: Mimi the Persian (anxious cat, sedation question)', who: 'Mei', due: 'Today', status: 'today', source: 'Safety rule S-02' },
      { title: 'Review Price list v9 (large dog $128 → $138)', who: 'Daniel', due: 'Today', status: 'today', source: 'Business Brain' },
      { title: 'Call Sarah Goh if deposit + vaccination proof still missing at 6 PM', who: 'Front office', due: 'Today 6:00 PM', status: 'today', source: 'Follow-up Agent' },
      { title: 'Cost a 3rd van day for a Bedok Saturday loop', who: 'Daniel', due: 'This week', status: 'scheduled', source: 'Insight Agent' },
      { title: 'Get consent from Mimi’s owner for the client-feature reel', who: 'PawSocial', due: 'This week', status: 'scheduled', source: 'Social Agent' },
      { title: 'Send groom-day reminders for Saturday routes (14 customers)', who: 'AI', due: 'Done 7:30 AM', status: 'done', source: 'Follow-up Agent' },
    ];

    return {
      merchant, services, customers, conversations, simulation, opportunities,
      aiActivity, activityLabel, approvals, brief, timelines, campaigns, reviews,
      cxSummary, knowledge, knowledgeGaps, onboarding, metrics, funnel, channels,
      topServices, forecast, forecastNote, strategy, kpis, social, trust, tasks,
    };
  })();

  return { beauty, pets };
})();
/* Back-compat alias (first industry) */
window.DEMO = window.DEMOS.beauty;
