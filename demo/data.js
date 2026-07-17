/* Rook demo — simulated data, configured for the client brand:
     lanxin — LANXIN House (women-only body-mind sanctuary, The Central SOHO 1)
   Sources: LANXIN brand deck (20pp), LANXIN Agent product plan (incl. the
   20 TEST customers), flora-visage.com audit dated 2026-07-16.
   Deterministic: fixed "now" + seeded PRNG. No network, no real customer data.
   All single-session rates are SIMULATED PLACEHOLDERS pending owner
   confirmation; membership prices and the zodiac-oil price are from the
   client's own materials. */
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

  // women-only clientele — female name pool (Singapore mix)
  const firstNames = ['Wei Ting','Hui Ling','Xin Yi','Jia Hui','Kai Xin','Mei Qi','Yan Ting','Siti Aisyah','Nur Alia','Zulaikha','Priyanka','Lakshmi','Kavitha','Chloe','Fiona','Gwen','Denise','Adeline','Celeste','Joyce','Pei Shan','Ying Xuan','Amanda','Rachael','Sophia','Grace','Eunice','Lydia'];
  const lastNames = ['Tan','Lim','Lee','Ng','Wong','Goh','Chua','Teo','Ho','Low','Binte Ismail','Binte Yusof','Nair','Pillai','Menon','Chen','Koh','Ang','Sim','Yeo'];
  const lifecyclePool = ['Active','Active','Active','Active','Converted','Evaluating','Dormant','Dormant','VIP','New lead','Churn risk'];
  const channelPool = ['WhatsApp','WhatsApp','WhatsApp','Instagram','Instagram','Web','Google','Referral'];

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
      const visits = lifecycle ==='New lead'? 0: lifecycle ==='VIP'? ri(8, 18): lifecycle ==='Dormant'? ri(2, 7): ri(1, 9);
      const svc = pick(services);
      customers.push({
        id: `${heroes[0].id.slice(0, heroes[0].id.indexOf('-') + 1)}g${customers.length}`,
        name,
        phone: `+65 0000 ${ri(1000, 9999)}`, // TEST-reserved format per client plan
        lang: rng() < 0.55?'ZH':'EN',
        channel: pick(channelPool),
        lifecycle,
        tags: tagFn(pick, rng),
        ltv: visits === 0? 0: visits * ri(120, 300),
        visits,
        lastVisit: visits === 0? null: daysAgo(lifecycle ==='Dormant'? ri(50, 120): ri(2, 28)),
        nextDue: lifecycle ==='Dormant' || lifecycle ==='New lead'? null: daysAhead(ri(1, 24)),
        consent: rng() < 0.72,
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
      const leads = wk === 0? ri(0, 2): Math.round(base * wk + rng() * 3);
      const bookings = wk === 0? 0: Math.max(0, Math.round(leads * (0.42 + rng() * 0.18)));
      out.push({ date: d.toISOString().slice(0, 10), leads, bookings });
    }
    return out;
  }

  /* ================================================================
     LANXIN — LANXIN House · Restore Your Energy. Rediscover Yourself.
     ================================================================ */
  const lanxin = (() => {
    const merchant = {
      product:'Rook',
      name:'LANXIN House',
      tagline:'Restore Your Energy. Rediscover Yourself.',
      address:'6 Eu Tong Sen St, #09-18 The Central SOHO 1',
      owner:'Rachel Fu',
      hours:'Daily 10:00–19:00, by appointment',
      now: NOW.toISOString(),
      nowLabel:'Fri 10 Jul 2026 · 8:05 AM',
    };

    // Rates for 归息/归衡/归元 and non-listed services are simulated
    // placeholders (client master table marks them 待确认). Membership and
    // zodiac-oil prices are the client's own published figures.
    const services = [
      { id:'rest', name:'归息 REST · Deep Sleep & Stress Recovery', price: 268, mins: 120, cycle:'3–4 weeks' },
      { id:'balance', name:'归衡 BALANCE · Women’s Balance Ritual', price: 288, mins: 120, cycle:'3–4 weeks' },
      { id:'renew', name:'归元 RENEW · Flagship Renewal Journey', price: 428, mins: 180, cycle:'6–8 weeks' },
      { id:'aroma', name:'Aromatherapy Session', price: 198, mins: 90, cycle:'2–3 weeks' },
      { id:'energy', name:'Energy Healing Session', price: 228, mins: 90, cycle:'3–4 weeks' },
      { id:'blend', name:'Private Oil Blending (1-on-1)', price: 138, mins: 60, cycle:'as needed' },
      { id:'zodiac', name:'Zodiac Lucky Oil (12 blends)', price: 29.9, mins: 15, cycle:'retail' },
      { id:'tea', name:'Song-Dynasty Tea Ceremony (per guest)', price: 88, mins: 90, cycle:'experience' },
      { id:'consult', name:'Private Wellness Consultation', price: 98, mins: 60, cycle:'first step' },
    ];

    // 20 TEST customers from the client's Agent plan + 6 scenario expansions.
    const heroCustomers = [
      { id:'cl-ava', name:'林雅雯 Ava Lin', phone:'+65 0000 1001', lang:'ZH', channel:'WhatsApp', lifecycle:'New lead', tags: ['Sleep & stress','Booked at 1:14 AM'], ltv: 0, visits: 0, lastVisit: null, nextDue: daysAhead(2), consent: true, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-michelle', name:'Michelle Tan', phone:'+65 0000 1002', lang:'EN', channel:'Web', lifecycle:'Evaluating', tags: ['Weekends only','Balance'], ltv: 288, visits: 1, lastVisit: daysAgo(20), nextDue: null, consent: true, pref:'归衡 BALANCE · Women’s Balance Ritual' },
      { id:'cl-serena', name:'陈思宁 Serena Chen', phone:'+65 0000 1003', lang:'ZH', channel:'WhatsApp', lifecycle:'Active', tags: ['Floral scent preference','Repeat blends'], ltv: 690, visits: 5, lastVisit: daysAgo(12), nextDue: daysAhead(16), consent: true, pref:'Private Oil Blending (1-on-1)' },
      { id:'cl-priya', name:'Priya Nair', phone:'+65 0000 1004', lang:'EN', channel:'Referral', lifecycle:'New lead', tags: ['Tea ceremony','Group of 3'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'Song-Dynasty Tea Ceremony (per guest)' },
      { id:'cl-huimin', name:'黄慧敏 Hui Min Wong', phone:'+65 0000 1005', lang:'ZH', channel:'WhatsApp', lifecycle:'Active', tags: ['Member · Bloom','REST regular','Prefers quiet comms'], ltv: 3520, visits: 8, lastVisit: daysAgo(6), nextDue: daysAhead(18), consent: true, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-rachell', name:'Rachel Lim', phone:'+65 0000 1006', lang:'EN', channel:'Instagram', lifecycle:'Evaluating', tags: ['Zodiac oil · Libra','Social lead'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: true, pref:'Zodiac Lucky Oil (12 blends)' },
      { id:'cl-nur', name:'Nur Aisyah', phone:'+65 0000 1007', lang:'EN', channel:'WhatsApp', lifecycle:'Active', tags: ['Scent sensitivity','Service messages only'], ltv: 594, visits: 3, lastVisit: daysAgo(16), nextDue: daysAhead(9), consent: false, pref:'Aromatherapy Session' },
      { id:'cl-jiayi', name:'李佳怡 Jiayi Li', phone:'+65 0000 1008', lang:'ZH', channel:'Web', lifecycle:'Dormant', tags: ['Weekday evenings','Lapsed 10 weeks'], ltv: 864, visits: 3, lastVisit: daysAgo(70), nextDue: daysAgo(28), consent: true, pref:'归衡 BALANCE · Women’s Balance Ritual' },
      { id:'cl-samantha', name:'Samantha Goh', phone:'+65 0000 1009', lang:'EN', channel:'WhatsApp', lifecycle:'Active', tags: ['Member · Flow','Monthly REST entitlement'], ltv: 4680, visits: 11, lastVisit: daysAgo(28), nextDue: daysAhead(1), consent: true, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-kexin', name:'王可心 Kexin Wang', phone:'+65 0000 1010', lang:'ZH', channel:'Referral', lifecycle:'New lead', tags: ['Wellness consultation'], ltv: 0, visits: 0, lastVisit: null, nextDue: daysAhead(0), consent: false, pref:'Private Wellness Consultation' },
      { id:'cl-chloe', name:'Chloe Koh', phone:'+65 0000 1011', lang:'EN', channel:'Web', lifecycle:'Active', tags: ['Birthday 18 Jul','RENEW'], ltv: 1284, visits: 3, lastVisit: daysAgo(34), nextDue: daysAhead(8), consent: true, pref:'归元 RENEW · Flagship Renewal Journey' },
      { id:'cl-meiling', name:'郑美玲 Meiling Tay', phone:'+65 0000 1012', lang:'ZH', channel:'WhatsApp', lifecycle:'Churn risk', tags: ['No visit 60 days','Was monthly regular'], ltv: 2140, visits: 9, lastVisit: daysAgo(60), nextDue: daysAgo(25), consent: true, pref:'归衡 BALANCE · Women’s Balance Ritual' },
      { id:'cl-fatimah', name:'Fatimah Rahman', phone:'+65 0000 1013', lang:'EN', channel:'WhatsApp', lifecycle:'Evaluating', tags: ['Combo request','Service messages only'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'Energy Healing Session' },
      { id:'cl-angel', name:'赵安琪 Angel Zhao', phone:'+65 0000 1014', lang:'ZH', channel:'Instagram', lifecycle:'New lead', tags: ['Tea ceremony ×2','Deposit unpaid'], ltv: 0, visits: 0, lastVisit: null, nextDue: daysAhead(1), consent: false, pref:'Song-Dynasty Tea Ceremony (per guest)' },
      { id:'cl-vanessa', name:'Vanessa Lee', phone:'+65 0000 1015', lang:'EN', channel:'Referral', lifecycle:'VIP', tags: ['Member · Radiance','Prefers Rachel','Quarterly RENEW'], ltv: 8140, visits: 14, lastVisit: daysAgo(11), nextDue: daysAhead(19), consent: true, pref:'归元 RENEW · Flagship Renewal Journey' },
      { id:'cl-xinyi', name:'刘欣怡 Xinyi Liu', phone:'+65 0000 1016', lang:'ZH', channel:'WhatsApp', lifecycle:'Active', tags: ['Zodiac oil · Pisces'], ltv: 178, visits: 3, lastVisit: daysAgo(22), nextDue: daysAhead(0), consent: true, pref:'Zodiac Lucky Oil (12 blends)' },
      { id:'cl-anjali', name:'Anjali Menon', phone:'+65 0000 1017', lang:'EN', channel:'Web', lifecycle:'New lead', tags: ['Safety hand-off','Service messages only'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-shufen', name:'吴淑芬 Shufen Ng', phone:'+65 0000 1018', lang:'ZH', channel:'WhatsApp', lifecycle:'Churn risk', tags: ['Complaint open','Marketing suppressed'], ltv: 1830, visits: 7, lastVisit: daysAgo(1, 16, 0), nextDue: null, consent: true, pref:'Aromatherapy Session' },
      { id:'cl-elaine', name:'Elaine Chua', phone:'+65 0000 1019', lang:'EN', channel:'WhatsApp', lifecycle:'Active', tags: ['Member · Bloom','Renewal due 24 Jul'], ltv: 2960, visits: 7, lastVisit: daysAgo(9), nextDue: daysAhead(14), consent: true, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-yanling', name:'周妍玲 Yanling Zhou', phone:'+65 0000 1020', lang:'ZH', channel:'Web', lifecycle:'Evaluating', tags: ['RENEW','Weekend mornings'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: true, pref:'归元 RENEW · Flagship Renewal Journey' },
      // —— scenario expansions (simulated, beyond the client's 20) ——
      { id:'cl-denise', name:'Denise Yeo (Meridian Legal)', phone:'+65 0000 1021', lang:'EN', channel:'Web', lifecycle:'New lead', tags: ['Corporate inquiry','Group of 8'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'Song-Dynasty Tea Ceremony (per guest)' },
      { id:'cl-sherry', name:'林晓彤 Sherry Lim', phone:'+65 0000 1022', lang:'ZH', channel:'WhatsApp', lifecycle:'New lead', tags: ['Gift inquiry — for her mother'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'归衡 BALANCE · Women’s Balance Ritual' },
      { id:'cl-gracet', name:'Grace Teo', phone:'+65 0000 1023', lang:'EN', channel:'Google', lifecycle:'Evaluating', tags: ['Partner gift question','Women-only policy'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-jasminec', name:'陈嘉敏 Jasmine Chan', phone:'+65 0000 1024', lang:'ZH', channel:'WhatsApp', lifecycle:'Evaluating', tags: ['Pregnancy — safety hand-off','Service messages only'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'归息 REST · Deep Sleep & Stress Recovery' },
      { id:'cl-kol', name:'@sgwellnessdiary', phone:'—', lang:'EN', channel:'Instagram', lifecycle:'New lead', tags: ['KOL / partnership','Human review'], ltv: 0, visits: 0, lastVisit: null, nextDue: null, consent: false, pref:'归元 RENEW · Flagship Renewal Journey' },
      { id:'cl-wendy', name:'许静雯 Wendy Koh', phone:'+65 0000 1026', lang:'ZH', channel:'Referral', lifecycle:'VIP', tags: ['Member · Radiance','Retreat 2026 registered'], ltv: 7420, visits: 12, lastVisit: daysAgo(15), nextDue: daysAhead(22), consent: true, pref:'归元 RENEW · Flagship Renewal Journey' },
    ];
    const lanxinTags = ['Prefers weekends','Weekday evenings','Scent: woody','Scent: floral','Quiet room preferred','Responds to salon invites','Tea ceremony fan','Zodiac oil buyer','Referred a friend','Considering membership'];
    const customers = makeTail(heroCustomers, 48, 20260710, services,
      (pick, rng) => rng() < 0.6? [pick(lanxinTags)]: [pick(lanxinTags), pick(lanxinTags)]);

    const conversations = [
      {
        id:'vl-ava', customerId:'cl-ava', name:'林雅雯 Ava Lin', channel:'WhatsApp',
        preview:'已预约：周日 11:00 AM 归息 REST', time: hoursAgo(6.85), unread: true,
        aiStatus:'ai', score: 84, intent:'Sleep & stress → booked',
        fields: { Service:'归息 REST (120 min)','Date needed':'Sun 12 Jul, 11:00 AM', Concern:'Sleep quality · work stress', Language:'中文', Urgency:'Normal' },
        handoff: null,
        nextAction:'Send arrival guide + scent-preference note before Sunday (automated).',
        messages: [
          { from:'cust', time: hoursAgo(6.9), text:'你好，这么晚打扰了。最近一直睡不好，凌晨会醒，白天上班完全没精神。朋友说你们有帮助睡眠的项目？' },
          { from:'ai', time: hoursAgo(6.89), text:'您好，谢谢您愿意告诉我这些，深夜发消息也没关系，我一直在的。听起来您最近确实很辛苦。我们的「归息 REST」正是为睡眠与压力恢复设计的：120分钟，包含呼吸引导、身体放松、深度芳疗和颂钵音疗。单次 $268，首次体验有会员礼遇。想了解更多吗？', cite:'Service guide v1 · 归息 REST' },
          { from:'cust', time: hoursAgo(6.87), text:'听起来不错。周末有位子吗？' },
          { from:'ai', time: hoursAgo(6.86), text:'这周日（7月12日）上午 11:00 或下午 3:30 都可以，做完刚好安安静静地过个下午。您方便哪个时段？' },
          { from:'cust', time: hoursAgo(6.855), text:'11点吧，谢谢' },
          { from:'ai', time: hoursAgo(6.85), text:'好的，已为您预约：周日 7月12日 11:00 AM，归息 REST（120分钟）。地址：The Central SOHO 1 #09-18（克拉码头地铁站G出口）。请提早10分钟到，我们备好迎宾茶等您。愿您今晚先好好休息。' },
          { from:'sys', time: hoursAgo(6.85), text:'Night inquiry (1:14 AM) answered and booked in 3 minutes. Customer profile created (ZH). Reminder scheduled Sat 6 PM.' },
        ],
      },
      {
        id:'vl-fatimah', customerId:'cl-fatimah', name:'Fatimah Rahman', channel:'WhatsApp',
        preview:'Combo request — single rates quoted, package price held for Rachel', time: hoursAgo(3.2), unread: true,
        aiStatus:'escalated', score: 76, intent:'Combo quote · pending owner',
        fields: { Service:'Energy Healing + 归息 REST (same afternoon)','Date needed':'Sat 18 Jul, afternoon', Budget:'“under $450 if combined”', Language:'English', Urgency:'Normal' },
        handoff:'Same-day combinations and package pricing are owner-confirmed only (R-02). Single rates quoted; combo request held with a task for Rachel.',
        nextAction:'Rachel to confirm the combo price and Saturday slot by 10 AM, then release the quote.',
        messages: [
          { from:'cust', time: hoursAgo(3.4), text:'Hi! I’m interested in the energy healing session, how much is it? And could I do it together with the REST one on the same afternoon? Hoping under $450 if combined' },
          { from:'ai', time: hoursAgo(3.38), text:'Hi Fatimah! Individually they’re: Energy Healing $228 (90 min) and 归息 REST $268 (120 min). Doing both in one afternoon is possible — but combined scheduling and any package pricing are confirmed personally by Rachel, our founder, so I won’t guess a bundle price. I’ve noted your Saturday preference and she’ll come back to you this morning with the exact quote.', cite:'Price list v1 · R-02 combinations' },
          { from:'cust', time: hoursAgo(3.3), text:'ok! saturday after 2pm works best for me' },
          { from:'ai', time: hoursAgo(3.2), text:'Noted — Saturday 18 Jul after 2 PM. Rachel will confirm the combined arrangement and price with you by 10 AM today. Thank you for your patience, Fatimah.' },
          { from:'sys', time: hoursAgo(3.2), text:'Escalated per R-02 (combination pricing). Task created for Rachel with requested date + budget. No bundle price improvised.' },
        ],
      },
      {
        id:'vl-anjali', customerId:'cl-anjali', name:'Anjali Menon', channel:'Web',
        preview:'Insomnia + medication question — handed to Rachel (safety)', time: hoursAgo(16.4), unread: false,
        aiStatus:'human', score: null, intent:'Health question · safety hand-off',
        fields: { Concern:'Chronic insomnia · on prescribed medication', Question:'“Will this fix my insomnia?”','Consent status':'Service messages only', Language:'English', Urgency:'Handled with care' },
        handoff:'Health condition + medication mentioned — AI declines assessment and outcome claims per Safety boundaries, suggests qualified professionals, and hands the thread to Rachel.',
        nextAction:'Rachel to reply personally today — warm, no medical claims, invite a no-obligation consultation.',
        messages: [
          { from:'cust', time: hoursAgo(16.5), text:'I’ve had chronic insomnia for two years and I’m on prescribed sleep medication. Will your REST treatment fix it?' },
          { from:'ai', time: hoursAgo(16.48), text:'Thank you for trusting us with this, Anjali — and I’m sorry it’s been such a long two years. I have to be honest with you: I can’t make any judgement about a medical condition or promise outcomes, and our sessions are relaxation and companionship, never a replacement for your doctor’s care. What I can do is pass your note to Rachel, our founder, who will reply personally — and if you’d like, a gentle first step is a private consultation where you can talk through what you need, with no obligation. Please do keep following your doctor’s guidance in the meantime.', cite:'Safety boundaries v2' },
          { from:'sys', time: hoursAgo(16.48), text:'Safety rule matched (medical condition + medication). AI paused for this thread; task created for Rachel. Marketing consent not requested — service messages only.' },
        ],
      },
      {
        id:'vl-rachell', customerId:'cl-rachell', name:'@rachel.reads', channel:'Instagram',
        preview:'zodiac oils!! do you have libra? 😍 → guided to WhatsApp', time: hoursAgo(10.8), unread: false,
        aiStatus:'ai', score: 58, intent:'Product inquiry · zodiac oil',
        fields: { Product:'Zodiac Lucky Oil · Libra', Price:'S$29.90 (published)','Pickup or delivery':'Pickup preferred', Language:'English', Urgency:'Browsing' },
        handoff: null,
        nextAction:'If no reply by 6 PM, send one gentle nudge with the July zodiac flat-lay (max 1 — IG policy).',
        messages: [
          { from:'cust', time: hoursAgo(10.8), text:'saw your zodiac oils reel!! do you have libra? how much?' },
          { from:'ai', time: hoursAgo(10.79), text:'Hi! Yes — the Libra blend is in the studio now, S$29.90 a bottle. Each of the 12 blends is a natural essential-oil mix made for its sign. You can pick it up at The Central (Clarke Quay), or add it to any session. Easiest is WhatsApp — tap here: wa.me/6587568987', cite:'Price list v1 · retail' },
          { from:'sys', time: hoursAgo(10.79), text:'Social lead created from IG DM · product intent · guided to WhatsApp.' },
        ],
      },
      {
        id:'vl-samantha', customerId:'cl-samantha', name:'Samantha Goh', channel:'WhatsApp',
        preview:'Flow entitlement confirmed — REST tomorrow 10:30 AM', time: hoursAgo(13.6), unread: false,
        aiStatus:'ai', score: 71, intent:'Member entitlement · booked',
        fields: { Service:'归息 REST — Flow monthly entitlement','Date needed':'Sat 11 Jul, 10:30 AM', Membership:'Flow · renews 2 Sep','Entitlement status':'July session unused', Language:'English', Urgency:'Normal' },
        handoff: null,
        nextAction:'Reminder tonight 6 PM; note her July entitlement as used after the visit (automated).',
        messages: [
          { from:'cust', time: hoursAgo(13.8), text:'Hi! Have I used my monthly REST this month? If not can I come Saturday morning?' },
          { from:'ai', time: hoursAgo(13.78), text:'Hi Samantha! Checking your Flow membership… your July REST session is still unused — it’s yours to enjoy. Saturday morning I have 10:30 AM open, which would have you floating out just after lunch. Shall I book it?', cite:'Membership terms v3 · Flow' },
          { from:'cust', time: hoursAgo(13.65), text:'yes please!' },
          { from:'ai', time: hoursAgo(13.6), text:'Done — Saturday 11 Jul, 10:30 AM, 归息 REST, covered by your Flow membership. The room will be ready and quiet. See you tomorrow, Samantha.' },
          { from:'sys', time: hoursAgo(13.6), text:'Entitlement booking created (no charge) · July usage will be marked after visit · reminder scheduled.' },
        ],
      },
      {
        id:'vl-shufen', customerId:'cl-shufen', name:'吴淑芬 Shufen Ng', channel:'WhatsApp',
        preview:'昨天做完有点头晕…香味太浓了', time: hoursAgo(15.9), unread: false,
        aiStatus:'human', score: null, intent:'Complaint · post-session discomfort',
        fields: { Service:'Aromatherapy Session (visit Thu 9 Jul)', Sentiment:'Negative — discomfort reported','Customer tier':'Regular · 7 visits', Language:'中文', Urgency:'High' },
        handoff:'Post-session discomfort reported — AI paused itself per safety + complaint policy. Recovery ticket RT-201 created; owner notified. No automated replies about symptoms.',
        nextAction:'Rachel to call Shufen before 11:30 AM — apologise, adjust scent intensity on file, offer a gentle make-up session. Marketing suppressed until RT-201 closes.',
        messages: [
          { from:'cust', time: hoursAgo(16), text:'想跟你们说一下，昨天做完精油护理回家有点头晕，那个香味对我来说真的太浓了。以前都没有这样。' },
          { from:'ai', time: hoursAgo(15.95), text:'淑芬您好，真的很抱歉让您有这样的感受——您的身体反应我们非常重视。我已经暂停自动回复，把情况完整转给澜昕老师，她今天上午会亲自致电您。为了安全，我不对身体状况作判断；若头晕持续或加重，请优先咨询医生。谢谢您第一时间告诉我们。' },
          { from:'sys', time: hoursAgo(15.95), text:'AI paused (discomfort + complaint). Recovery ticket RT-201 → owner. Scent-intensity preference flagged on profile. Marketing suppressed for this customer.' },
        ],
      },
      {
        id:'vl-angel', customerId:'cl-angel', name:'赵安琪 Angel Zhao', channel:'Instagram',
        preview:'宋代点茶，两个人，这周六下午 → 已预留', time: hoursAgo(9.1), unread: false,
        aiStatus:'ai', score: 66, intent:'Tea ceremony · pair booking',
        fields: { Service:'宋代点茶体验 ×2','Date needed':'Sat 11 Jul, 3:00 PM', Deposit:'$20 — unpaid (holds until 8 PM)', Language:'中文', Urgency:'Normal' },
        handoff: null,
        nextAction:'Deposit reminder queued for 6 PM (quiet-hours safe); slot auto-releases 8 PM if unpaid.',
        messages: [
          { from:'cust', time: hoursAgo(9.3), text:'你好！在小红书上看到你们的宋代点茶，好美。想和闺蜜两个人这周六下午来体验，可以吗？' },
          { from:'ai', time: hoursAgo(9.28), text:'您好！当然可以，谢谢您喜欢。点茶体验由澜昕老师亲自主持（她是非遗宋代点茶传承习修者），每位 $88，约90分钟，含茶点。这周六下午 3:00 有一个双人席位。需要 $20 订金保留位置，24小时前可全额退。要为您们保留吗？', cite:'Price list v1 · 宋代点茶' },
          { from:'cust', time: hoursAgo(9.15), text:'好呀！怎么付订金？' },
          { from:'ai', time: hoursAgo(9.1), text:'已为您保留：周六 7月11日 3:00 PM，宋代点茶体验 ×2。付款链接已发送（PayNow 或银行卡都可以），今晚 8 点前完成即可。期待周六与您和闺蜜在茶香里见面。' },
          { from:'sys', time: hoursAgo(9.1), text:'Pair booking held · deposit link sent · auto-release 8 PM if unpaid · profile created from IG (ZH).' },
        ],
      },
    ];

    const simulation = {
      name:'Hazel Ong', channel:'WhatsApp', customerLine:'New number · +65 0000 2087',
      doneToast:'Lead → booking in 47 seconds, fully automated',
      donePreview:'Booked · Sun 2 PM Aromatherapy Session', doneScore: 72,
      fields: { Service:'Aromatherapy Session','Date needed':'Sun 12 Jul, 2:00 PM', Concern:'Burnout · first visit', Language:'English', Urgency:'Normal' },
      nextAction:'None — booked automatically. Arrival guide scheduled Sat 6 PM.',
      steps: [
        { from:'cust', delay: 600, text:'hi, a colleague recommended you. i’ve been feeling really burnt out lately… do you do aromatherapy?' },
        { from:'typing', delay: 900 },
        { from:'ai', delay: 0, text:'Hi, and thank you for reaching out — burnout deserves gentle care. Yes: our Aromatherapy Session is 90 minutes, $198, with oils blended to how you’re feeling that day. This weekend I have Sat 5:00 PM or Sun 2:00 PM. Would either suit you?', cite:'Price list v1' },
        { from:'cust', delay: 2200, text:'sunday 2pm please. do i need to prepare anything?' },
        { from:'typing', delay: 900 },
        { from:'ai', delay: 0, text:'Booked — Sun 12 Jul, 2:00 PM. Nothing to prepare: wear something comfortable, avoid a heavy meal an hour before, and arrive 10 minutes early for welcome tea. The room will be quiet and yours. See you Sunday, Hazel.', cite:'First-journey guide v2' },
        { from:'sys', delay: 400, text:'Lead created → qualified → booked in 47 seconds. Customer profile created. Reminder scheduled Sat 6 PM.' },
      ],
    };

    const opportunities = [
      { convId:'vl-fatimah', who:'Fatimah Rahman', why:'Asked to combine Energy Healing + REST — single rates quoted, combo price needs your confirmation by 10 AM', kind:'decision', value:'$496' },
      { convId:'vl-shufen', who:'吴淑芬 Shufen Ng', why:'Post-session dizziness reported — call before 11:30 AM; recovery script ready, marketing suppressed', kind:'critical', value:'LTV $1,830' },
      { convId: null, who:'Denise Yeo (Meridian Legal)', why:'Corporate wellness afternoon for 8 — women-only policy fits; group >4 needs your quote', kind:'decision', value:'Quote pending' },
      { convId: null, who:'Elaine Chua', why:'Bloom membership renews in 14 days — renewal message drafted with July tea-salon invite', kind:'suggestion', value:'$1,380' },
      { convId: null, who:'郑美玲 Meiling Tay', why:'No visit in 60 days (was monthly) — BALANCE win-back drafted for your approval', kind:'watch', value:'LTV $2,140' },
    ];

    const aiActivity = [
      { n: 7, label:'inquiries answered overnight' },
      { n: 9, label:'follow-ups sent' },
      { n: 4, label:'bookings confirmed' },
      { n: 5, label:'review invites sent' },
      { n: 3, label:'tasks created for staff' },
    ];

    const approvals = [
      { id:'ap-campaign', type:'Campaign', title:'Rainy-season sleep ritual — REST off-peak', detail:'Send to 21 consented customers · est. 4–6 bookings ($1,072–$1,608)', action: { campaign:'mk-rain' }, toast:'Campaign approved — sending Sat 10:00 AM to 21 customers' },
      { id:'ap-review', type:'Review reply', title:'Reply to S. Ng (2★ Google review)', detail:'Personal apology + scent-adjustment promise drafted; posting is held for your approval', action: { review:'rv-shufen' }, toast:'Reply posted to Google' },
      { id:'ap-price', type:'Knowledge', title:'Price list v2 — single-session rates', detail:'归息/归衡/归元 session rates drafted (currently simulated placeholders) — go live only after your review', action: { knowledge:'kb-price' }, toast:'Price list v2 is live — the AI will quote confirmed rates immediately' },
      { id:'ap-merge', type:'Identity', title:'Merge @teawithangel → 赵安琪 Angel Zhao', detail:'Same phone on IG profile and booking record — confirm to merge', action: {}, toast:'Profiles merged — history from both channels kept' },
    ];

    const brief = {
      headline:'Good morning, Rachel — 3 decisions need you; the rest is handled.',
      body:'Overnight the AI answered 7 inquiries — one at 1:14 AM became a Sunday REST booking (Ava, who couldn’t sleep again). The renewal window opens today for 3 members ($4,140 if all renew), a rainy-season sleep campaign is drafted for your approval, and one scent-sensitivity complaint needs your personal call before 11:30 — the script is ready.',
    };
    const activityLabel ='While you slept — since 9:00 PM yesterday';

    const timelines = {
'cl-vanessa': [
        { time: daysAgo(11, 10, 0), kind:'visit', text:'归元 RENEW quarterly journey — custom blend “Vanessa No.4” archived' },
        { time: daysAgo(11, 13, 30), kind:'ai', text:'Post-journey note + home-ritual reminder sent · replied with a heart' },
        { time: daysAgo(24, 19, 0), kind:'campaign', text:'Attended June tea salon with a colleague — guest later booked REST (referral credited)' },
        { time: daysAgo(40, 11, 0), kind:'visit', text:'归息 REST — asked to keep lighting dimmer; preference saved' },
        { time: daysAgo(64, 10, 0), kind:'visit', text:'Radiance renewal — annual retreat 2026 registered' },
      ],
    };

    const campaigns = [
      {
        id:'mk-rain', name:'Rainy-season sleep ritual', status:'pending',
        trigger:'Demand: NEA monsoon outlook Mon–Wed · weekday 11 AM–3 PM slots 55% empty',
        audience:'21 consented customers with sleep/stress tags or REST history. Excludes: complaint holds, service-only consent, unsubscribed, contacted <14 days.',
        channel:'WhatsApp template', schedule:'Sat 10:00 AM',
        copy:'When the rain won’t stop and your mind won’t either — a 120-minute REST ritual to end the week gently. Weekday slots 11 AM–3 PM next week. Reply YES and we’ll hold one for you.',
        estimate: { reach: 21, bookings:'4–6', revenue:'$1,072–$1,608', cost:'$2.30 (WhatsApp fees)' },
      },
      {
        id:'mk-renew', name:'Membership renewals — July cohort', status:'scheduled',
        trigger:'Lifecycle: membership ends within 21 days · runs weekly',
        audience:'3 members (incl. Elaine Chua, Bloom ends 24 Jul)',
        channel:'WhatsApp template', schedule:'Each member, 14 days before expiry, 11 AM',
        copy:'Your quarter with us comes to a close soon, {name} — renew this week and July’s tea salon is our gift to you.',
        estimate: { reach: 3, bookings:'2–3 renewals', revenue:'$2,760–$4,140', cost:'$0.33' },
      },
      {
        id:'mk-winback', name:'Dormant win-back (June)', status:'completed', ended: daysAgo(13),
        trigger:'Lifecycle: no visit in 8+ weeks, LTV > $300',
        audience:'18 dormant customers', channel:'WhatsApp template', schedule:'Sent 23 Jun, 11 AM',
        copy:'“The room is still quiet, and the tea is still warm” + a gentle BALANCE invitation, valid 3 weeks.',
        results: { sent: 18, replies: 6, bookings: 4, revenue: 1112, cost: 22, roi:'50×', unsubs: 0 },
      },
      {
        id:'mk-salon', name:'June tea salon — members + guests', status:'completed', ended: daysAgo(17),
        trigger:'Monthly member salon (Flow and above may bring a guest)',
        audience:'12 members + guests', channel:'WhatsApp template', schedule:'Sent 15 Jun',
        copy:'One quiet hour, one bowl of Song-dynasty tea — June salon seats are open for members and a guest.',
        results: { sent: 21, replies: 15, bookings: 11, revenue: 968, cost: 18, roi:'54×', unsubs: 0 },
      },
      {
        id:'mk-zodiac', name:'Zodiac oil birthday notes (rolling)', status:'completed', ended: daysAgo(2),
        trigger:'Lifecycle: birthday month + zodiac-oil interest (individual)',
        audience:'Rolling — 26 sends in June', channel:'WhatsApp template', schedule:'Automated, per customer',
        copy:'A small gift idea for your month, {name} — your sign’s blend is on the shelf, and your birthday tea is on us.',
        results: { sent: 26, replies: 14, bookings: 9, revenue: 269, cost: 12, roi:'22×', unsubs: 0 },
      },
    ];

    const referrals = {
      rule:'$30 off for both sides after the friend’s first journey (R-08) — the AI shares the link after a 5★ review or when a customer mentions bringing a friend.',
      link:'rook.link/lanxin·A3K9',
      stats: [
        { value:'5', label:'referral leads (30d)' },
        { value:'3', label:'became bookings' },
        { value:'$824', label:'referred revenue' },
        { value:'$180', label:'credits issued' },
      ],
      top: [
        { name:'Vanessa Lee', referred: 3, booked: 2, revenue: 556, note:'Radiance member · brings colleagues to tea salons' },
        { name:'黄慧敏 Hui Min Wong', referred: 1, booked: 1, revenue: 268, note:'Referred her sister for REST' },
        { name:'Samantha Goh', referred: 1, booked: 0, revenue: 0, note:'Link shared this week' },
      ],
    };

    const reviews = [
      { id:'rv-shufen', name:'S. Ng', rating: 2, time: hoursAgo(14.2), source:'Google', text:'做完精油护理后有点头晕，香味对我来说太浓了。环境很安静很好，但这次体验不太舒服。', replyStatus:'pending', reply:'淑芬您好，非常抱歉这次让您不适——这不是我们想给您的感受。我已亲自与您联系；您的香氛浓度偏好已记录在案，下次到店我会提前为您调整，也想当面向您致歉。—— 澜昕 Rachel', linked:'Recovery ticket RT-201 · same customer as open complaint' },
      { id:'rv-1', name:'Hui Min W.', rating: 5, time: daysAgo(6, 20, 10), source:'Google', text:'第三次做归息了。做完当晚整个人都松下来，睡得特别沉。Rachel 老师很细心，连我上次说的灯光都记得。', replyStatus:'posted', reply:'慧敏，谢谢您的信任——能陪您慢下来，是我们最开心的事。下次见。' },
      { id:'rv-2', name:'Vanessa L.', rating: 5, time: daysAgo(9, 15, 0), source:'Facebook', text:'The RENEW journey is unlike anything else in Singapore — three unhurried hours, and the Song-dynasty tea ceremony at the end is my favourite part. Rachel remembers everything about you.', replyStatus:'posted', reply:'Thank you, Vanessa — the tea is always waiting for you.' },
      { id:'rv-3', name:'Michelle T.', rating: 4, time: daysAgo(13, 12, 0), source:'Google', text:'Loved the BALANCE session and the space is beautifully quiet. Only wish weekend slots were easier to get — book early!', replyStatus:'pending', reply:'Thank you, Michelle! Weekends do fill about a week ahead — tell us your preferred hour and we’ll hold it for you each cycle.' },
      { id:'rv-4', name:'Chloe K.', rating: 5, time: daysAgo(3, 18, 30), source:'Instagram', text:'The birthday herbal gift box was such a lovely touch. This place actually remembers you.', replyStatus:'pending', reply:'Happy birthday month, Chloe — your RENEW room will be ready.' },
    ];
    const cxSummary = {
      rating: 4.9, count: 96, invited30d: 18, received30d: 9, openTickets: 1,
      themes: [
        { theme:'Deep relaxation / sleep quality', n: 7, tone:'good' },
        { theme:'Rachel’s personal care', n: 6, tone:'good' },
        { theme:'Weekend availability', n: 3, tone:'warn' },
        { theme:'Scent intensity', n: 2, tone:'bad' },
      ],
      note:'Themes are extracted from review text and post-journey notes. “Scent intensity” created recovery ticket RT-201 and a pre-session scent-preference step.',
    };

    const knowledge = [
      { id:'kb-price', title:'Price list', category:'Services & pricing', version:'v1 live · v2 pending approval', approvedVersion:'v2 live', updated: daysAgo(1, 18, 0), owner:'Rachel Fu', sensitive: true, cites30d: 168, excerpt:'All journey and session rates, durations, add-ons. Single-session rates for 归息/归衡/归元 are simulated placeholders pending owner confirmation; membership and zodiac-oil prices are published. Sensitive — owner approval required before the AI quotes changes.' },
      { id:'kb-member', title:'Membership terms · Bloom / Flow / Radiance', category:'Membership', version:'v3', updated: daysAgo(18), owner:'Rachel Fu', sensitive: true, cites30d: 74, excerpt:'Bloom S$1,380/3mo · Flow S$1,999/3mo (adds one REST monthly, salon invites) · Radiance S$6,980/yr (adds quarterly RENEW, 1-on-1 consultant, annual retreat). Entitlement usage tracked per member.' },
      { id:'kb-r02', title:'R-02 · Combinations & package pricing', category:'Rules centre', version:'v1', updated: daysAgo(26), owner:'Rachel Fu', sensitive: true, cites30d: 5, excerpt:'The AI quotes single-session rates only. Same-day combinations, packages and bespoke quotes are owner-confirmed — the AI holds the request and creates a task, never improvises a bundle price.' },
      { id:'kb-r05', title:'R-05 · Groups & the women-only space', category:'Rules centre', version:'v2', updated: daysAgo(33), owner:'Rachel Fu', sensitive: true, cites30d: 8, excerpt:'LANXIN is a women-only sanctuary. Tea ceremony seats up to 4 guests; groups over 4 need owner confirmation. Partners may purchase gift journeys but do not join sessions.' },
      { id:'kb-safety', title:'Safety boundaries', category:'Safety', version:'v2', updated: daysAgo(21), owner:'Rachel Fu', sensitive: true, cites30d: 11, excerpt:'Pregnancy, medication, allergies, chronic conditions or crisis signals: the AI never assesses or promises outcomes, recommends qualified professionals where appropriate, and hands the thread to Rachel immediately.' },
      { id:'kb-quiet', title:'Quiet hours & message caps', category:'Rules centre', version:'v1', updated: daysAgo(30), owner:'Rachel Fu', sensitive: false, cites30d: 2, excerpt:'No marketing 9 PM–9 AM (service replies stay 24/7). Max 2 marketing messages per customer per 14 days. Service-only consent is honoured strictly.' },
      { id:'kb-voice', title:'Brand voice', category:'Brand', version:'v4', updated: daysAgo(38), owner:'Rachel Fu', sensitive: false, cites30d: 0, excerpt:'Warm, quiet, restrained — companionship, never selling. 中文为主，English mirrored. One gentle nudge max on follow-ups. Banned: “治愈/cure”, “排毒/detox”, “保证改善/guaranteed results”, “cheapest”.' },
      { id:'kb-arrival', title:'Arrival guide · The Central', category:'FAQ', version:'v3', updated: daysAgo(9), owner:'AI (approved by Rachel)', sensitive: false, cites30d: 39, excerpt:'6 Eu Tong Sen Street #09-18, The Central SOHO 1, S059817 (Clarke Quay MRT, exit G). Arrive 10 minutes early for welcome tea; phones to silent; daily 10:00–19:00 by appointment. WhatsApp +65 8756 8987.' },
      { id:'kb-fj', title:'First-journey guide', category:'FAQ', version:'v2', updated: daysAgo(12), owner:'AI (approved by Rachel)', sensitive: false, cites30d: 46, excerpt:'What to expect on a first visit: the five-step ritual — arrival tea → private consult → treatment → quiet reflection with tea → take-home blend (“recovery prescription”). Wear comfortable clothing; avoid heavy meals 1h before.' },
    ];
    const knowledgeGaps = [
      { q:'Can 归息 and 归元 be booked on the same day?', asked: 3, last: hoursAgo(3.3), note:'R-02 covers pricing but not same-day scheduling — needs an owner answer (Fatimah asked too)' },
      { q:'Do you sell gift cards?', asked: 3, last: daysAgo(1, 20, 0), note:'Gift journeys exist informally — no approved knowledge item yet (Sherry asked, for her mother)' },
      { q:'Can my husband join the tea ceremony?', asked: 2, last: daysAgo(2, 11, 0), note:'Women-only policy needs approved partner wording — R-05 covers sessions, not the salon' },
    ];

    const onboarding = {
      intro:'This is what LANXIN House’s day one looks like. Total time: about 20 minutes — the Business Brain is built from the brand deck, service bible and chat history you already have.',
      files: [
        { name:'LANXIN-brand-deck.pdf', desc:'20-page brand book — journeys, membership, voice' },
        { name:'LANXIN-service-bible.docx', desc:'The five-step service ritual & standards' },
        { name:'whatsapp-chat-export.txt', desc:'3 months of real customer Q&A' },
      ],
      extracted: [
        { title:'9 services & journeys with durations', cat:'Services & pricing' },
        { title:'Membership tiers & entitlements', cat:'Membership' },
        { title:'Safety & escalation boundaries', cat:'Safety' },
        { title:'18 FAQs found in past chats', cat:'FAQ' },
        { title:'Brand voice profile (中文 + EN)', cat:'Brand' },
        { title:'3 questions it could not answer — sent to you', cat:'Gap list' },
      ],
      review:'Rates, membership terms and safety boundaries are marked sensitive — the AI can’t use them until you tap Approve on each. Everything else goes live now.',
      testQ:'What happens in the RENEW journey?',
      testA:'RENEW is our 180-minute flagship: a deep one-on-one consult, a drawing-based reflection, an oil blended just for you, head-to-toe care, and a Song-dynasty tea ceremony to close. Radiance members enjoy one each quarter — and the exact rate goes live the moment you approve the rate card. Would a weekend morning suit you?',
      testCite:'Service guide v1 · imported 2 minutes ago',
      live:'Connect your WhatsApp number and the AI starts answering — with you able to take over any conversation, and every rate it quotes traceable to what you uploaded.',
    };

    const metrics = makeMetrics([1.3, 0.7, 0.75, 0.85, 0.9, 1.1, 1.45], 3.1, 20260714);
    const funnel = [
      { stage:'Leads', n: 86 }, { stage:'Qualified', n: 64 }, { stage:'Booked', n: 39 },
      { stage:'Showed', n: 35 }, { stage:'Rebooked', n: 19 },
    ];
    const channels = [
      { name:'WhatsApp', leads: 43, booked: 23 },
      { name:'Instagram', leads: 17, booked: 5 },
      { name:'Web', leads: 12, booked: 5 },
      { name:'Google', leads: 9, booked: 3 },
      { name:'Referral', leads: 5, booked: 3 },
    ];
    const topServices = [
      { name:'归息 REST', bookings: 14, revenue: 3752 },
      { name:'归衡 BALANCE', bookings: 9, revenue: 2592 },
      { name:'归元 RENEW', bookings: 6, revenue: 2568 },
      { name:'Aromatherapy Session', bookings: 11, revenue: 2178 },
      { name:'Tea Ceremony', bookings: 12, revenue: 1056 },
    ];
    const forecast = [
      { day:'Sat 11', lo: 5, mid: 6, hi: 7 }, { day:'Sun 12', lo: 5, mid: 6, hi: 7 },
      { day:'Mon 13', lo: 2, mid: 3, hi: 4 }, { day:'Tue 14', lo: 2, mid: 3, hi: 5 },
      { day:'Wed 15', lo: 3, mid: 4, hi: 5 }, { day:'Thu 16', lo: 3, mid: 4, hi: 6 },
      { day:'Fri 17', lo: 4, mid: 5, hi: 6 },
    ];
    const forecastNote ='Weekends book out about a week ahead — Radiance members hold priority windows';
    const strategy = {
      title:'This week: convert the renewal window and fill weekday late-mornings',
      points: [
'Three memberships renew within 14 days ($4,140) — renewal messages convert best with the July tea-salon invite attached; both are drafted and waiting.',
'Weekday 11 AM–3 PM is 55% empty while weekends book out — approve the rainy-season REST campaign (est. $1,072–$1,608) to shift demand into the quiet hours.',
'Instagram brings 20% of leads but converts at half the WhatsApp rate — zodiac-oil buyers who visit the studio convert to journeys at 3×; keep guiding DMs to WhatsApp.',
'Basis: last 30 days of bookings, June campaign results, NEA monsoon outlook. Forecast confidence: ±20%.',
      ],
    };
    const teamCompare = {
      title:'By practitioner — last 30 days',
      note:'Single-practitioner studio today — Rook is ready for more staff the day they’re hired (roster pending owner).',
      cols: ['Practitioner','Journeys','Revenue','Avg rating','Rebook rate'],
      rows: [
        ['Rachel Fu','52','$12,146','4.9 ★','58%'],
        ['Therapist (hiring)','—','—','—','—'],
      ],
    };
    const kpis = [
      { label:'First response', value:'31 sec', delta:'was 4+ h before Rook (night messages)' },
      { label:'Inquiries handled by AI', value:'68%', delta:'32% handed to Rachel' },
      { label:'Lead → booking', value:'45%', delta:'+9 pts vs May' },
      { label:'Un-followed-up leads', value:'1', delta:'was ~10/wk before' },
      { label:'Repeat-purchase rate', value:'63%', delta:'members drive it' },
      { label:'Campaign revenue (30d)', value:'$2,349', delta:'$52 message cost' },
      { label:'Cost per AI-handled conversation', value:'$0.12', delta:'model + WhatsApp fees' },
      { label:'Cost per AI-won booking', value:'$2.40', delta:'vs ~$18 typical paid-ads CPA' },
      { label:'Staff time saved (est.)', value:'7.5 h/wk', delta:'repetitive replies + follow-ups' },
    ];

    const social = {
      calendar: [
        { day:'Fri 10', time:'6:00 PM', channel:'Instagram Reel', title:'Rain on the window, tea on the table — REST ritual teaser', status:'scheduled' },
        { day:'Sat 11', time:'11:00 AM', channel:'IG carousel', title:'Inside the RENEW journey — five steps in five frames', status:'scheduled' },
        { day:'Sun 12', time:'10:00 AM', channel:'Google post', title:'Quiet Sunday slots + the Clarke Quay arrival tip', status:'scheduled' },
        { day:'Mon 13', time:'12:00 PM', channel:'IG story', title:'July tea salon — member recap (automated)', status:'scheduled' },
        { day:'Tue 14', time:'10:00 AM', channel:'IG story + Google', title:'Rainy-season sleep ritual promo', status:'linked', note:'Publishes only if the campaign is approved' },
        { day:'Wed 15', time:'—', channel:'IG Reel', title:'Client story: three months of calmer evenings', status:'held', note:'Held — client consent not yet on file' },
        { day:'Thu 16', time:'—', channel:'IG story', title:'Zodiac oils: July birthdays flat-lay', status:'idea', note:'Needs a product shot — see asset list' },
      ],
      posts: [
        { title:'Zodiac oil flat-lay reel', when:'30 Jun', reach:'9,800', saves: 176, inquiries: 7, bookings: 5, revenue: 149, flag: null },
        { title:'“What is 归息?” explainer story', when:'4 Jul', reach:'1,240', saves: 31, inquiries: 6, bookings: 3, revenue: 804, flag:'Small reach, high conversion — AI suggests a monthly explainer format' },
        { title:'Tea ceremony slow video', when:'1 Jul', reach:'4,300', saves: 122, inquiries: 4, bookings: 2, revenue: 176, flag: null },
      ],
      interactions: [
        { when:'18m ago', who:'@juliet.w', channel:'IG comment', text:'is the rest session good for insomnia?', klass:'Health-adjacent', outcome:'Safe reply (no medical claims) · invited to WhatsApp' },
        { when:'2h ago', who:'@sgwellnessdiary', channel:'IG DM', text:'love this space!! open to a collab? 28k followers', klass:'Partnership', outcome:'Human review queue' },
        { when:'6h ago', who:'@mktg.mel', channel:'IG comment', text:'how much is the tea ceremony?', klass:'Price inquiry', outcome:'Lead created · replied + invited to WhatsApp' },
        { when:'10h ago', who:'@quietmornings', channel:'IG DM', text:'do you take same-day bookings?', klass:'FAQ', outcome:'Answered from Arrival guide' },
        { when:'yesterday', who:'2 accounts', channel:'IG comments', text:'(supplement spam links)', klass:'Spam', outcome:'Auto-hidden' },
      ],
      assets: [
'Natural-light close-up of the tea ceremony — your top-saving content theme',
'30-second scent-blending clip — answers the FAQ asked 14× this month',
'Ask Vanessa Lee for a Radiance testimonial (VIP, consent on file)',
      ],
    };

    const trust = {
      stats: [
        { value:'31/48', label:'marketing consent coverage', sub:'4 service-only · the rest not asked yet' },
        { value:'214', label:'consent + DNC checks (30d)', sub:'100% pass before any send' },
        { value:'1', label:'unsubscribe (30d)', sub:'processed in under 1 h' },
        { value:'1', label:'data request (30d)', sub:'export completed in 4 h' },
      ],
      rules: [
'Quiet hours: no marketing 9 PM–9 AM (service replies stay 24/7)',
'Frequency cap: max 2 marketing messages per customer per 14 days',
'Auto-excluded: open complaints, service-only consent, unsubscribed, contacted <14 days',
'Language rule: ZH-preference customers receive ZH templates',
'Health-adjacent replies never go beyond approved wording — a person reviews anything sensitive',
      ],
      roles: [
        { who:'Rachel Fu', role:'Owner', can:'Everything — rates, refunds, exports, permissions' },
        { who:'Rook AI advisor', role:'AI assistant', can:'Replies from approved knowledge only · hands off safety topics · no bulk sends without approval' },
        { who:'Therapist (hiring)', role:'Staff (planned)', can:'Inbox, tasks, bookings once onboarded · no exports' },
      ],
      audit: [
        { t:'7:38 AM', text:'AI replied to @mktg.mel — tea-ceremony rate quoted from Price list v1', tag:'ai' },
        { t:'7:05 AM', text:'Campaign pre-check: 21 recipients passed consent + DNC + frequency caps', tag:'check' },
        { t:'1:14 AM', text:'AI booked Ava Lin — REST, Sunday 11 AM (night inquiry)', tag:'ai' },
        { t:'Yst 9:40 PM', text:'Follow-up to Michelle Tan held until 9:00 AM — quiet hours', tag:'check' },
        { t:'Yst 8:16 PM', text:'AI paused itself — post-session discomfort reported (吴淑芬)', tag:'handoff' },
        { t:'Yst 8:17 PM', text:'Marketing suppressed for 吴淑芬 until ticket RT-201 closes', tag:'check' },
        { t:'Yst 6:02 PM', text:'Price list v2 uploaded — held for owner approval', tag:'change' },
        { t:'Wed 11:20 AM', text:'Data export completed for Vanessa Lee (PDPA access request)', tag:'data' },
      ],
    };

    const tasks = [
      { title:'Call 吴淑芬 — recovery ticket RT-201, script drafted', who:'Rachel', due:'Today 11:30 AM', status:'today', source:'Reputation Agent' },
      { title:'Confirm combo quote for Fatimah (Energy Healing + REST, Sat PM)', who:'Rachel', due:'Today 10:00 AM', status:'today', source:'Sales Agent' },
      { title:'Review Price list v2 — single-session rates', who:'Rachel', due:'Today', status:'today', source:'Business Brain' },
      { title:'Quote the Meridian Legal corporate afternoon (8 guests)', who:'Rachel', due:'Today', status:'today', source:'Sales Agent' },
      { title:'Prep Chloe Koh birthday gift box — herbal blend + card', who:'Rachel', due:'Wed 15 Jul', status:'scheduled', source:'CRM Agent' },
      { title:'Draft answer: “Do you sell gift cards?” (asked 3×)', who:'Rachel', due:'This week', status:'scheduled', source:'Business Brain' },
      { title:'Send post-journey care notes to yesterday’s 4 guests', who:'AI', due:'Done 7:40 AM', status:'done', source:'Follow-up Agent' },
    ];

    return {
      merchant, services, customers, conversations, simulation, opportunities,
      aiActivity, activityLabel, approvals, brief, timelines, campaigns, reviews,
      cxSummary, knowledge, knowledgeGaps, onboarding, metrics, funnel, channels,
      topServices, forecast, forecastNote, strategy, kpis, social, trust, tasks,
      referrals, teamCompare,
    };
  })();

  const absAmt = (n) => n; // expense magnitude; rendered with a leading − in the UI
  Object.assign(lanxin, {
    advisor: {
      summary: 'Three memberships renew within 14 days — the drafted renewal message converts best with July’s tea-salon invite attached. Before that: call 吴淑芬 about yesterday’s session, confirm Fatimah’s combo quote, and the rainy-season REST campaign is ready for your approval.',
      metricLabel:'projected upside if you act', metricValue:'+$4,140',
    },
    todayBookings: 5, followUpCount: 9,
    finance: {
      monthRevenue: 10240, monthExpense: 6850, monthNet: 3390, margin:'33%',
      periods: {
        day: { cols:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], revenue:[680,540,590,720,860,1450,1210], expense:[380,320,340,380,420,560,480] },
        month: { cols:['Feb','Mar','Apr','May','Jun','Jul'], revenue:[21400,23800,26500,28200,31600,10240], expense:[11800,12300,12900,13400,14100,6850] },
        year: { cols:['H2 2025','H1 2026','Jul 2026'], revenue:[98000,151800,10240], expense:[52000,75900,6850] },
      },
      // July figures are month-to-date (10 days in); rent lands on the 1st,
      // which is why the MTD margin runs below the full-month trend.
      expenseBreakdown: [
        { cat:'Rent (The Central)', amount:5800 },
        { cat:'Oils, herbs & tea', amount:620 }, { cat:'Marketing', amount:110 },
        { cat:'Utilities & other', amount:320 },
      ],
      transactions: [
        { date: daysAgo(1,19,0), item:'Flow membership renewal', type:'in', amount:1999 },
        { date: daysAgo(1,17,0), item:'Essential-oil restock (Botanica SG)', type:'out', amount:absAmt(420) },
        { date: daysAgo(1,16,30), item:'宋代点茶体验 ×2', type:'in', amount:176 },
        { date: daysAgo(1,18,30), item:'Renewal campaign (WhatsApp fees)', type:'out', amount:absAmt(0.33) },
        { date: daysAgo(2,10,0), item:'Day takings — journeys + retail', type:'in', amount:892 },
        { date: daysAgo(3,17,0), item:'Utilities — The Central service fee', type:'out', amount:absAmt(310) },
      ],
    },
    materials: {
      inventory: [
        { name:'Lavender & sandalwood essential oils', stock:5, unit:'bottles', reorder:8, status:'low' },
        { name:'Carrier oils (jojoba, sweet almond)', stock:12, unit:'bottles', reorder:6, status:'ok' },
        { name:'Herbal compress packs (归衡)', stock:4, unit:'packs', reorder:6, status:'low' },
        { name:'Zodiac oils — Libra & Pisces blends', stock:2, unit:'bottles', reorder:6, status:'low' },
        { name:'Song-dynasty tea powder', stock:9, unit:'tins', reorder:4, status:'ok' },
        { name:'Towels, robes & linens', stock:150, unit:'pcs', reorder:60, status:'ok' },
      ],
      purchases: [
        { date: daysAgo(1,12,0), item:'Essential oils restock', qty:'18 bottles', cost:420, supplier:'Botanica SG', status:'ordered' },
        { date: daysAgo(5,12,0), item:'Zodiac oil bottling run', qty:'24 bottles', cost:310, supplier:'Atelier Scent', status:'delivered' },
        { date: daysAgo(10,12,0), item:'Herbal compress packs', qty:'12 packs', cost:190, supplier:'EastMed Herbs', status:'delivered' },
      ],
    },
    staff: {
      roster: [
        { name:'Rachel Fu', role:'Owner · principal aromatherapist', pay:5200, shiftsWeek:7, rating:'4.9 ★', records:52 },
      ],
      shifts: {
        days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        rows:[
          { name:'Rachel Fu', on:[1,1,1,1,1,1,1] },
          { name:'Therapist (hiring)', on:[0,0,0,0,0,0,0] },
        ],
      },
    },
    marketingSuggestions: [
      { text:'Handle 1 scent-sensitivity complaint first', count:1, tone:'bad', goto:{ view:'reputation' } },
      { text:'Follow up 9 to-do customers', count:9, goto:{ view:'inbox' } },
      { text:'Confirm 1 combo quote to close', count:1, goto:{ view:'inbox' } },
      { text:'Send an offer to 8 “evaluating” customers', count:8, goto:{ view:'customers', filter:'Evaluating' } },
      { text:'Win back 5 dormant customers', count:5, goto:{ view:'customers', filter:'Dormant' } },
    ],
    publishWizard: {
      goals:['More bookings','Fill weekday mornings','Promote memberships','Win back dormant','Boost reviews'],
      audiences:['All consented','Members','Dormant 8 weeks+','New leads','Zodiac-oil fans'],
      platforms:['Instagram','Facebook','Google','WhatsApp broadcast'],
      variants:[
'When the rain won’t stop and your mind won’t either — a 120-minute REST ritual to end the week gently. Weekday slots 11 AM–3 PM next week. Reply YES and we’ll hold one for you.',
'A quiet room, warm oil, and nowhere else to be. REST sessions open on weekday late-mornings this week — the calmest hours we have. Tap to book.',
'Rainy week, softer pace: book any weekday REST this week and your welcome tea comes with our July blend. Slots are few by design — reply to hold yours.',
      ],
      posters:[
        { title:'Rainy-night sleep ritual', tag:'Soft / calm', hue:210 },
        { title:'Membership — quiet luxe', tag:'Editorial / minimal', hue:160 },
        { title:'Zodiac oils flat-lay', tag:'Warm / gift', hue:35 },
      ],
    },
    bookings: [
      { time:'10:15 AM', customer:'Nur Alia Lim', service:'归元 RENEW', staff:'Rachel Fu', status:'confirmed' },
      { time:'1:30 PM', customer:'刘欣怡 Xinyi Liu', service:'Zodiac oil pickup · Pisces', staff:'Rachel Fu', status:'confirmed' },
      { time:'2:00 PM', customer:'Gwen Yeo', service:'归衡 BALANCE', staff:'Rachel Fu', status:'confirmed' },
      { time:'4:15 PM', customer:'王可心 Kexin Wang', service:'Private Wellness Consultation', staff:'Rachel Fu', status:'confirmed' },
      { time:'5:30 PM', customer:'Wei Ting Lee', service:'Aromatherapy Session', staff:'Rachel Fu', status:'deposit-unpaid' },
    ],
    followups: [
      { customer:'林雅雯 Ava Lin', reason:'Sunday REST booked at 1:14 AM — send arrival guide + scent-preference note', channel:'WhatsApp', due:'Today', convId:'vl-ava' },
      { customer:'Fatimah Rahman', reason:'Combo quote held for your confirmation — she asked for Saturday after 2 PM', channel:'WhatsApp', due:'Today 10:00 AM', convId:'vl-fatimah' },
      { customer:'吴淑芬 Shufen Ng', reason:'Recovery call before 11:30 AM — marketing stays suppressed until RT-201 closes', channel:'WhatsApp', due:'Today 11:30 AM', convId:'vl-shufen' },
      { customer:'Anjali Menon', reason:'Safety hand-off: insomnia + medication question — reply personally, no medical claims', channel:'Web', due:'Today', convId:'vl-anjali' },
      { customer:'赵安琪 Angel Zhao', reason:'Tea-ceremony deposit unpaid — gentle reminder at 6 PM, slot releases 8 PM', channel:'Instagram', due:'Today 6:00 PM', convId:'vl-angel' },
      { customer:'Elaine Chua', reason:'Bloom renews 24 Jul — renewal message drafted with July salon invite', channel:'WhatsApp', due:'Before 17 Jul', convId: null },
      { customer:'Denise Yeo (Meridian Legal)', reason:'Corporate afternoon ×8 — send quote after your pricing decision (group >4)', channel:'Web', due:'This week', convId: null },
      { customer:'郑美玲 Meiling Tay', reason:'60 days quiet (was monthly) — BALANCE win-back drafted for approval', channel:'WhatsApp', due:'Today', convId: null },
      { customer:'Grace Teo', reason:'Asked about partners at the tea ceremony — approved wording pending (R-05 gap)', channel:'Google', due:'This week', convId: null },
    ],
  });

  return { lanxin };
})();
/* Back-compat alias (single template) */
window.DEMO = window.DEMOS.lanxin;
