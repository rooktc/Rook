/* Rook demo — owner console app. No dependencies; all data from data.js. */
(() => {
  const DEMOS = window.DEMOS;
  const INDUSTRIES = [
    { id: 'beauty', label: 'Beauty studio' },
    { id: 'pets', label: 'Mobile pet groomer' },
  ];
  let D = DEMOS.beauty;
  const NOW = new Date(D.merchant.now);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const state = {
    industry: 'beauty',
    view: 'today',
    convId: 'v-priya',
    mobilePane: 'list',
    custFilter: 'All',
    custChannel: null,
    custId: null,
    aiPaused: {},
    done: {},          // approval ids that were actioned
    campaign: {},      // campaign id -> new status
    reviewPosted: {},
    kbApproved: {},
    phoneView: null,        // null | 'conv' | 'brief'
    tour: 0,                // 0 = off, 1-based step otherwise
    simConvo: null,
    simRunning: false,
    simToken: 0,
    setupStep: 0,
    setupPlaying: false,
    setupToken: 0,
  };

  // ---------- formatting ----------
  // All clock times shown in the merchant's timezone (SGT), whoever views the demo.
  const fmtClock = (iso) => new Date(iso)
    .toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Singapore' })
    .toUpperCase();
  const fmtRel = (iso) => {
    if (!iso) return '—';
    const ms = NOW - new Date(iso);
    const h = ms / 36e5;
    if (h < -0.01) {
      const dAhead = Math.round(-h / 24);
      return dAhead <= 1 ? 'tomorrow' : `in ${dAhead}d`;
    }
    if (h < 1) return `${Math.max(1, Math.round(ms / 6e4))}m ago`;
    if (h < 22) return `${Math.round(h)}h ago`;
    const days = Math.round(h / 24);
    if (days <= 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.round(days / 7)}w ago`;
    return `${Math.round(days / 30)}mo ago`;
  };
  const money = (n) => '$' + Number(n).toLocaleString('en-SG');

  // ---------- icons ----------
  const IC = {
    today: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="3.2"/><path d="M8 1.2v1.8M8 13v1.8M1.2 8H3M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3"/></svg>',
    inbox: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 3.5h12v7H8.5L5.5 13v-2.5H2z" stroke-linejoin="round"/></svg>',
    customers: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5.5" cy="5.5" r="2.3"/><path d="M1.5 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="11.5" cy="5" r="1.8"/><path d="M10.8 9.3c2 .2 3.7 1.9 3.7 4.2"/></svg>',
    marketing: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6.5v3l8 3v-9zM10 5.5c2 .5 3 1.4 3 2.5s-1 2-3 2.5M4 9.8V13" stroke-linejoin="round"/></svg>',
    reputation: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" stroke-linejoin="round"/></svg>',
    brain: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3c-1-1.2-3-1.5-4.5-.5S2 5.5 2.5 7c-1 .8-1 2.5 0 3.5S5 12 6 11.3M8 3c1-1.2 3-1.5 4.5-.5S14 5.5 13.5 7c1 .8 1 2.5 0 3.5S11 12 10 11.3M8 3v10.5"/></svg>',
    insights: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 13.5h12M3.5 13V9M7 13V5.5M10.5 13V7.5M14 13V3.5"/></svg>',
    setup: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4.5h8M12.5 4.5H14M2 11.5h3M7.5 11.5H14"/><circle cx="10.5" cy="4.5" r="1.7"/><circle cx="5.5" cy="11.5" r="1.7"/></svg>',
    social: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="3.5" r="1.8"/><circle cx="4" cy="8" r="1.8"/><circle cx="12" cy="12.5" r="1.8"/><path d="M5.7 7.2l4.6-2.6M5.7 8.8l4.6 2.6"/></svg>',
    trust: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 1.8l5 2v3.7c0 3.2-2.1 5.6-5 6.7-2.9-1.1-5-3.5-5-6.7V3.8z" stroke-linejoin="round"/><path d="M5.8 7.8l1.6 1.6 2.8-3"/></svg>',
  };
  const NAV = [
    ['today', 'Today'], ['inbox', 'Inbox'], ['customers', 'Customers'],
    ['marketing', 'Marketing'], ['social', 'Social'], ['reputation', 'Reputation'],
    ['brain', 'Brain'], ['insights', 'Insights'], ['trust', 'Trust'], ['setup', 'Setup'],
  ];
  const TITLES = {
    today: 'Today', inbox: 'Inbox — all channels', customers: 'Customers & tasks',
    marketing: 'Marketing automation', social: 'Social & brand', reputation: 'Reputation & experience',
    brain: 'Business brain', insights: 'Business insight', trust: 'Trust, permissions & audit',
    setup: 'Setup — day one',
  };

  // ---------- shared bits ----------
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }
  const statusChip = (c) => {
    if (state.aiPaused[c.id]) return '<span class="tagchip human">Staff (you)</span>';
    if (c.aiStatus === 'ai') return '<span class="tagchip ai">AI handling</span>';
    if (c.aiStatus === 'human') return '<span class="tagchip human">With staff</span>';
    return '<span class="tagchip esc">Needs you</span>';
  };
  const chIcon = { WhatsApp: 'WA', Instagram: 'IG', Google: 'G', 'QR code': 'QR', Referral: 'REF' };

  // ---------- Today ----------
  function vToday() {
    const pending = D.approvals.filter((a) => !state.done[a.id]);
    return `
      <div class="card brief">
        <h3>${esc(D.brief.headline)}</h3>
        <p>${esc(D.brief.body)}</p>
        <div style="margin-top:10px"><button class="btn sm" data-brief-phone>📱 See it as your 7 AM WhatsApp</button></div>
      </div>
      ${state.phoneView === 'brief' ? briefPhone() : ''}
      <h2 class="sec">${esc(D.activityLabel)}</h2>
      <div class="stat-row">
        ${D.aiActivity.map((a) => `<div class="stat"><b>${a.n}</b><span>${esc(a.label)}</span></div>`).join('')}
      </div>
      <h2 class="sec">Today's opportunities</h2>
      ${D.opportunities.map((o) => `
        <div class="opp ${o.kind}">
          <span class="stripe"></span>
          <div><div class="who">${esc(o.who)}</div><div class="why">${esc(o.why)}</div></div>
          <div class="val">${esc(o.value)}</div>
          ${o.convId ? `<button class="btn sm go" data-open-conv="${o.convId}">Open</button>` : ''}
        </div>`).join('')}
      <h2 class="sec">Waiting for your approval (${pending.length})</h2>
      ${pending.length === 0 ? '<div class="card"><p style="margin:0;color:var(--muted)">All clear — nothing needs your sign-off.</p></div>' : pending.map((a) => `
        <div class="appr">
          <span class="k">${esc(a.type)}</span>
          <div class="t"><b>${esc(a.title)}</b><span>${esc(a.detail)}</span></div>
          <div class="act">
            <button class="btn sm pri" data-approve="${a.id}">Approve</button>
            <button class="btn sm" data-hold="${a.id}">Hold</button>
          </div>
        </div>`).join('')}`;
  }

  // ---------- Inbox ----------
  function convoList() {
    const list = [];
    if (state.simConvo) list.push(state.simConvo);
    list.push(...D.conversations);
    return list;
  }
  function getConv(id) { return convoList().find((c) => c.id === id); }

  function vInbox() {
    const conv = getConv(state.convId) || convoList()[0];
    const listHtml = convoList().map((c) => `
      <button class="convo ${c.id === conv.id ? 'on' : ''}" data-conv="${c.id}">
        <span class="r1"><b>${esc(c.name)}</b><time>${fmtRel(c.time)}</time></span>
        <span class="pv">${esc(c.preview)}</span>
        <span class="r2">
          <span class="tagchip">${chIcon[c.channel] || c.channel}</span>
          ${statusChip(c)}
          ${c.score != null ? `<span class="tagchip">Score ${c.score}</span>` : ''}
        </span>
      </button>`).join('');

    const msgs = conv.messages.map(msgHtml).join('');
    const paused = state.aiPaused[conv.id];
    const listHide = state.mobilePane === 'thread' ? 'hidden-m' : '';
    const threadHide = state.mobilePane === 'list' ? 'hidden-m' : '';

    return `
      <div class="inbox">
        <div class="list-pane ${listHide}">
          <button class="btn pri" style="width:100%;margin-bottom:10px" data-simulate ${state.simRunning ? 'disabled' : ''}>
            ${state.simConvo ? '↻ Replay' : '▶ Simulate'} a live inquiry
          </button>
          <div class="convo-list">${listHtml}</div>
        </div>
        <div class="card thread thread-pane ${threadHide}">
          <div class="thread-head">
            <button class="btn sm only-m" data-back style="display:none">←</button>
            <div><b>${esc(conv.name)}</b><div class="sub">${esc(conv.channel)} · ${esc(conv.customerLine || conv.intent || '')}</div></div>
            <div class="spacer"></div>
            ${statusChip(conv)}
            <button class="btn sm" data-phone>📱 Customer view</button>
            <button class="btn sm" data-takeover="${conv.id}">${paused ? 'Hand back to AI' : 'Take over'}</button>
          </div>
          <div class="msgs" id="msgs">${msgs}</div>
        </div>
        <div class="ctx ${threadHide}">
          ${conv.score != null ? `<div class="card"><h4>Lead score</h4><span class="score-pill">${conv.score}</span><span style="color:var(--muted)"> / 100 · ${esc(conv.intent)}</span></div>` : ''}
          ${conv.fields ? `<div class="card"><h4>Extracted by AI</h4><dl class="kv">${Object.entries(conv.fields).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>` : ''}
          ${conv.handoff ? `<div class="card handoff"><h4>Why the AI stopped</h4><p>${esc(conv.handoff)}</p></div>` : ''}
          ${conv.nextAction ? `<div class="card nextact"><h4>Suggested next step</h4><p>${esc(conv.nextAction)}</p></div>` : ''}
        </div>
      </div>
      ${state.phoneView === 'conv' ? phoneOverlay(conv) : ''}`;
  }
  const WAVE = [5, 9, 13, 8, 11, 6, 12, 9, 14, 7, 10, 5, 8, 12, 6, 9]
    .map((h) => `<i style="height:${h}px"></i>`).join('');
  function msgHtml(m) {
    if (m.from === 'sys') return `<div class="msg sys">${esc(m.text)}</div>`;
    if (m.from === 'typing') return '<div class="typing" aria-label="AI is typing"><i></i><i></i><i></i></div>';
    const who = m.from === 'cust' ? 'cust' : m.from;
    const label = m.from === 'cust' ? '' : m.from === 'ai' ? 'Rook AI · ' : 'Staff · ';
    if (m.voice) return `<div class="msg ${who}">
      <span class="vn" aria-label="Voice message, ${esc(m.duration)}">▶<span class="vn-wave">${WAVE}</span>${esc(m.duration)}</span>
      <div class="vn-tx">“${esc(m.text)}”</div>
      <span class="vn-note">Transcribed by Rook</span>
      <span class="meta">${label}${m.time ? fmtClock(m.time) : ''}</span></div>`;
    return `<div class="msg ${who}">${esc(m.text)}
      ${m.cite ? `<br><span class="cite">📎 ${esc(m.cite)}</span>` : ''}
      <span class="meta">${label}${m.time ? fmtClock(m.time) : ''}</span></div>`;
  }

  // What the customer's phone shows: no system notes, no scores, no citations.
  function phoneOverlay(conv, opts = {}) {
    const bubbles = conv.messages.filter((m) => m.from !== 'sys' && m.from !== 'typing').map((m) => {
      const body = m.voice
        ? `<span class="vn">▶<span class="vn-wave">${WAVE}</span>${esc(m.duration)}</span>`
        : esc(m.text);
      return `<div class="ph-msg ${m.from === 'cust' ? 'mine' : 'theirs'}">${body}
        <span class="ph-time">${m.time ? fmtClock(m.time) : ''}</span></div>`;
    }).join('');
    return `
      <div class="phone-ovl" data-close-phone>
        <div class="phone" role="dialog" aria-label="${esc(opts.aria || 'Customer view')}">
          <div class="ph-note">${esc(opts.note || `What ${conv.name} sees — scores, notes and citations stay in your console.`)}</div>
          <div class="ph-head"><span class="ph-avatar">${esc((opts.header || D.merchant.name)[0])}</span>
            <div><b>${esc(opts.header || D.merchant.name)}</b><span>online</span></div>
            <button class="btn sm" data-close-phone-btn>Close</button>
          </div>
          <div class="ph-msgs">${bubbles}</div>
          <div class="ph-input">Message…</div>
        </div>
      </div>`;
  }
  function briefPhone() {
    const opps = D.opportunities.slice(0, 3).map((o, i) => `${i + 1}. ${o.who} — ${o.why}`).join('\n');
    return phoneOverlay({
      name: 'Rook',
      messages: [{
        from: 'ai', time: D.merchant.now,
        text: `☀️ ${D.brief.headline}\n\n${D.brief.body}\n\nTop 3 right now:\n${opps}\n\nOpen your console to approve or take over → rook.app/today`,
      }],
    }, {
      header: 'Rook — Daily brief',
      note: 'The owner gets this brief on WhatsApp every morning — no dashboard required.',
      aria: 'Daily brief as WhatsApp message',
    });
  }

  // ---------- simulation ----------
  function runSimulation() {
    if (state.simRunning) return;
    state.simRunning = true;
    const token = ++state.simToken;
    const sim = D.simulation;
    state.simConvo = {
      id: 'v-sim', name: sim.name, channel: sim.channel, customerLine: sim.customerLine,
      preview: 'Live — playing now…', time: D.merchant.now, unread: true,
      aiStatus: 'ai', score: 58, intent: 'Booking inquiry',
      fields: sim.fields, handoff: null, nextAction: sim.nextAction,
      messages: [],
    };
    state.convId = 'v-sim';
    state.mobilePane = 'thread';
    render();
    let i = 0;
    const step = () => {
      if (token !== state.simToken) return; // industry switched or replay — abandon
      const s = sim.steps[i];
      if (!s) {
        state.simRunning = false;
        state.simConvo.preview = sim.donePreview;
        state.simConvo.score = sim.doneScore;
        render();
        toast(sim.doneToast);
        return;
      }
      i++;
      if (s.from === 'typing') {
        state.simConvo.messages.push({ from: 'typing' });
        render();
        setTimeout(() => {
          if (token !== state.simToken) return;
          state.simConvo.messages = state.simConvo.messages.filter((m) => m.from !== 'typing');
          step();
        }, 1100);
        return;
      }
      setTimeout(() => {
        if (token !== state.simToken) return;
        state.simConvo.messages.push({ from: s.from, text: s.text, cite: s.cite, time: D.merchant.now });
        render();
        step();
      }, s.delay);
    };
    step();
  }

  // ---------- Customers ----------
  const LIFECYCLES = ['All', 'New lead', 'Evaluating', 'Converted', 'Active', 'VIP', 'Dormant', 'Churn risk'];
  const lcClass = (lc) => ({ 'Churn risk': 'churn', 'New lead': 'lead' }[lc] || lc);
  function taskCentre() {
    return `
      <h2 class="sec">Task centre — what the AI queued for the team</h2>
      <div class="card" style="padding:8px 16px">
        ${D.tasks.map((t) => `
          <div class="task-row ${t.status}">
            <span class="task-dot"></span>
            <span class="task-title">${esc(t.title)}</span>
            <span class="tagchip">${esc(t.source)}</span>
            <span class="task-meta">${esc(t.who)} · ${esc(t.due)}</span>
          </div>`).join('')}
      </div>`;
  }

  function vCustomers() {
    if (state.custId) return vCustomerDetail(D.customers.find((c) => c.id === state.custId));
    const chFiltered = state.custChannel ? D.customers.filter((c) => c.channel === state.custChannel) : D.customers;
    const rows = chFiltered
      .filter((c) => state.custFilter === 'All' || c.lifecycle === state.custFilter)
      .sort((a, b) => b.ltv - a.ltv);
    return `
      ${taskCentre()}
      <h2 class="sec">Customer base</h2>
      ${state.custChannel ? `<div style="margin-bottom:10px"><button class="fbtn on" data-clear-channel>Source: ${esc(state.custChannel)} · ${chFiltered.length} ✕</button></div>` : ''}
      <div class="filters">${LIFECYCLES.map((f) => {
        const n = f === 'All' ? chFiltered.length : chFiltered.filter((c) => c.lifecycle === f).length;
        return `<button class="fbtn ${state.custFilter === f ? 'on' : ''}" data-filter="${f}">${f} · ${n}</button>`;
      }).join('')}</div>
      <div class="card tbl-wrap" style="padding:6px 10px">
      <table class="tbl">
        <thead><tr><th>Customer</th><th>Stage</th><th>Tags</th><th>Source</th><th class="num">Visits</th><th class="num">Lifetime value</th><th>Last visit</th><th>Next due</th></tr></thead>
        <tbody>
        ${rows.map((c) => `
          <tr class="rowbtn" data-cust="${c.id}">
            <td><b>${esc(c.name)}</b><br><span style="color:var(--muted);font-size:12px">${esc(c.phone)} · ${c.lang}</span></td>
            <td><span class="lc ${lcClass(c.lifecycle)}">${esc(c.lifecycle)}</span></td>
            <td>${c.tags.map((t) => `<span class="tagchip">${esc(t)}</span>`).join(' ')}</td>
            <td>${esc(c.channel)}</td>
            <td class="num">${c.visits}</td>
            <td class="num">${c.ltv ? money(c.ltv) : '—'}</td>
            <td>${fmtRel(c.lastVisit)}</td>
            <td>${c.nextDue ? fmtRel(c.nextDue) : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;
  }
  function vCustomerDetail(c) {
    const timeline = (D.timelines && D.timelines[c.id]) || [
      { time: c.lastVisit || daysAgoIso(30), kind: 'visit', text: `${esc(c.pref)} — most recent visit` },
      { time: daysAgoIso(45), kind: 'ai', text: 'Cycle reminder sent · customer rebooked same day' },
      { time: daysAgoIso(70), kind: 'campaign', text: 'Received June win-back campaign' },
    ];
    return `
      <button class="btn sm" data-back-cust>← All customers</button>
      <div class="grid c2 cust-detail" style="margin-top:12px">
        <div class="card">
          <h4 style="margin:0 0 2px;font-size:16px">${esc(c.name)} <span class="lc ${lcClass(c.lifecycle)}">${esc(c.lifecycle)}</span></h4>
          <div style="color:var(--muted);font-size:12.5px;margin-bottom:12px">${esc(c.phone)} · prefers ${c.lang === 'ZH' ? '中文' : 'English'} · via ${esc(c.channel)}</div>
          <dl class="kv">
            <dt>Lifetime value</dt><dd>${c.ltv ? money(c.ltv) : '—'}</dd>
            <dt>Visits</dt><dd>${c.visits}</dd>
            <dt>Usual service</dt><dd>${esc(c.pref)}</dd>
            <dt>Last visit</dt><dd>${fmtRel(c.lastVisit)}</dd>
            <dt>Next due</dt><dd>${c.nextDue ? fmtRel(c.nextDue) : '—'}</dd>
            <dt>Marketing consent</dt><dd>${c.consent ? 'Yes — WhatsApp OK' : 'No — service messages only'}</dd>
            <dt>Tags</dt><dd>${c.tags.map((t) => `<span class="tagchip">${esc(t)}</span>`).join(' ')}</dd>
          </dl>
        </div>
        <div class="card">
          <h4 style="margin:0 0 6px">Timeline</h4>
          <ul class="timeline">
            ${timeline.map((t) => `<li><time>${fmtRel(t.time)} · ${esc(t.kind)}</time>${t.text}</li>`).join('')}
          </ul>
        </div>
      </div>`;
  }
  const daysAgoIso = (d) => new Date(NOW - d * 864e5).toISOString();

  // ---------- Marketing ----------
  function vMarketing() {
    const st = (c) => state.campaign[c.id] || c.status;
    const active = D.campaigns.filter((c) => st(c) !== 'completed');
    const past = D.campaigns.filter((c) => st(c) === 'completed');
    return `
      <h2 class="sec">Needs a decision / upcoming</h2>
      ${active.map((c) => campHtml(c, st(c))).join('')}
      <h2 class="sec">Recently completed</h2>
      ${past.map((c) => campHtml(c, 'completed')).join('')}
      ${referralSection()}`;
  }
  function referralSection() {
    const r = D.referrals;
    return `
      <h2 class="sec">Referrals — the lifecycle's last stage</h2>
      <div class="grid c2" style="align-items:start">
        <div class="card">
          <div class="est" style="margin-top:0">
            ${r.stats.map((s) => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}
          </div>
          <p style="font-size:12.5px;color:var(--ink-2);margin:12px 0 8px;max-width:64ch">${esc(r.rule)}</p>
          <span class="tagchip" style="font-variant-numeric:tabular-nums">🔗 ${esc(r.link)} — unique per customer, so every referral is attributed</span>
        </div>
        <div class="card tbl-wrap" style="padding:6px 10px">
          <table class="tbl">
            <thead><tr><th>Top referrers</th><th class="num">Referred</th><th class="num">Booked</th><th class="num">Revenue</th><th>Note</th></tr></thead>
            <tbody>${r.top.map((t) => `<tr><td><b>${esc(t.name)}</b></td><td class="num">${t.referred}</td><td class="num">${t.booked}</td><td class="num">${t.revenue ? money(t.revenue) : '—'}</td><td style="color:var(--ink-2)">${esc(t.note)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  }
  function campHtml(c, status) {
    const est = c.estimate ? `
      <div class="est">
        <div><b>${c.estimate.reach}</b><span>reach (consented)</span></div>
        <div><b>${c.estimate.bookings}</b><span>est. bookings</span></div>
        <div><b>${c.estimate.revenue}</b><span>est. revenue</span></div>
        <div><b>${c.estimate.cost}</b><span>send cost</span></div>
      </div>` : '';
    const res = c.results ? `
      <div class="est">
        <div><b>${c.results.sent}</b><span>sent</span></div>
        <div><b>${c.results.replies}</b><span>replies</span></div>
        <div><b>${c.results.bookings}</b><span>bookings</span></div>
        <div><b>${money(c.results.revenue)}</b><span>revenue</span></div>
        <div><b>${c.results.roi}</b><span>ROI</span></div>
        <div><b>${c.results.unsubs}</b><span>unsubscribes</span></div>
      </div>` : '';
    return `
      <div class="camp">
        <div class="head"><b>${esc(c.name)}</b><span class="status ${status}">${status}</span></div>
        <dl class="row">
          <dt>Trigger</dt><dd>${esc(c.trigger)}</dd>
          <dt>Audience</dt><dd>${esc(c.audience)}</dd>
          <dt>Schedule</dt><dd>${esc(c.schedule)} · ${esc(c.channel)}</dd>
        </dl>
        <div class="copy">“${esc(c.copy)}”</div>
        ${est}${res}
        ${status === 'pending' ? `
          <div class="actions">
            <button class="btn pri" data-approve-camp="${c.id}">Approve &amp; schedule</button>
            <button class="btn">Edit audience</button>
            <button class="btn">Skip this week</button>
          </div>` : ''}
      </div>`;
  }

  // ---------- Reputation ----------
  function vReputation() {
    const cx = D.cxSummary;
    return `
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat"><b>${cx.rating} ★</b><span>Google rating · ${cx.count} reviews</span></div>
        <div class="stat"><b>${cx.invited30d}</b><span>review invites sent (30d)</span></div>
        <div class="stat"><b>${cx.received30d}</b><span>new reviews (30d)</span></div>
        <div class="stat"><b>${cx.openTickets}</b><span>open recovery ticket${cx.openTickets === 1 ? '' : 's'}</span></div>
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div>
          <h2 class="sec">Latest reviews</h2>
          ${D.reviews.map(revHtml).join('')}
        </div>
        <div>
          <h2 class="sec">What customers talk about (30 days)</h2>
          <div class="card">
            ${cx.themes.map((t) => `
              <div class="theme-row ${t.tone === 'warn' ? 'warn' : t.tone === 'bad' ? 'bad' : ''}">
                <span style="min-width:180px">${esc(t.theme)}</span>
                <span class="bar" style="width:${t.n * 16}px"></span>
                <span class="n">${t.n}</span>
              </div>`).join('')}
            <p style="font-size:12px;color:var(--muted);margin:10px 0 0">${esc(cx.note)}</p>
          </div>
        </div>
      </div>`;
  }
  function revHtml(r) {
    const posted = r.replyStatus === 'posted' || state.reviewPosted[r.id];
    return `
      <div class="rev ${r.rating <= 3 ? 'neg' : ''}">
        <div class="head"><b>${esc(r.name)}</b>
          <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          <span style="color:var(--muted);font-size:12px">${esc(r.source)} · ${fmtRel(r.time)}</span>
        </div>
        <p class="txt">${esc(r.text)}</p>
        ${r.linked ? `<p style="font-size:12px;color:var(--serious);margin:0 0 8px">⚠ ${esc(r.linked)}</p>` : ''}
        <div class="reply"><span class="lbl">${posted ? 'Reply posted' : 'AI-drafted reply — awaiting your approval'}</span>${esc(r.reply)}</div>
        ${posted ? '' : `<div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn sm pri" data-post-reply="${r.id}">Approve &amp; post</button>
          <button class="btn sm">Edit</button>
        </div>`}
      </div>`;
  }

  // ---------- Social & Brand ----------
  const stChip = (s) => ({
    scheduled: '<span class="tagchip ai">Scheduled</span>',
    linked: '<span class="tagchip st-linked">Linked to campaign</span>',
    held: '<span class="tagchip human">Held — needs approval</span>',
    idea: '<span class="tagchip">Idea</span>',
  }[s] || '');
  const klassChip = (k) => {
    const tone = { Complaint: 'human', Spam: '', Partnership: 'st-linked', FAQ: '', 'Price inquiry': 'ai', 'High intent': 'ai' }[k] ?? '';
    return `<span class="tagchip ${tone}">${esc(k)}</span>`;
  };
  function vSocial() {
    const s = D.social;
    return `
      <div class="grid c2" style="align-items:start">
        <div>
          <h2 class="sec">This week's content — drafted by the AI</h2>
          <div class="card" style="padding:8px 16px">
            ${s.calendar.map((c) => `
              <div class="cal-row">
                <span class="cal-day">${esc(c.day)}<em>${esc(c.time)}</em></span>
                <div class="cal-body"><b>${esc(c.title)}</b>
                  <span>${esc(c.channel)}${c.note ? ' · ' + esc(c.note) : ''}</span></div>
                ${stChip(c.status)}
              </div>`).join('')}
          </div>
          <h2 class="sec">Assets worth shooting next</h2>
          <div class="card">
            <ul class="strategy" style="margin:0;padding-left:18px">${s.assets.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          </div>
        </div>
        <div>
          <h2 class="sec">What content actually drives — not likes</h2>
          ${s.posts.map((p) => `
            <div class="card" style="margin-bottom:10px">
              <b>${esc(p.title)}</b> <span style="color:var(--muted);font-size:12px">· ${esc(p.when)}</span>
              <div class="est" style="margin-top:8px">
                <div><b>${esc(p.reach)}</b><span>reach</span></div>
                <div><b>${p.saves}</b><span>saves</span></div>
                <div><b>${p.inquiries}</b><span>inquiries</span></div>
                <div><b>${p.bookings}</b><span>bookings</span></div>
                <div><b>${money(p.revenue)}</b><span>revenue</span></div>
              </div>
              ${p.flag ? `<p style="margin:8px 0 0;font-size:12.5px;color:var(--accent-soft-ink)">★ ${esc(p.flag)}</p>` : ''}
            </div>`).join('')}
          <h2 class="sec">Comments & DMs — classified live</h2>
          <div class="card" style="padding:8px 16px">
            ${s.interactions.map((i) => `
              <div class="int-row">
                <div><b>${esc(i.who)}</b> <span style="color:var(--muted);font-size:11.5px">${esc(i.channel)} · ${esc(i.when)}</span>
                  <div class="int-text">“${esc(i.text)}”</div>
                  <div class="int-out">→ ${esc(i.outcome)}</div></div>
                ${klassChip(i.klass)}
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  // ---------- Trust, permissions & audit ----------
  const auditTag = (t) => ({
    ai: '<span class="tagchip ai">AI action</span>',
    check: '<span class="tagchip st-good">Compliance check</span>',
    handoff: '<span class="tagchip human">Hand-off</span>',
    denied: '<span class="tagchip esc">Denied</span>',
    change: '<span class="tagchip st-linked">Change held</span>',
    data: '<span class="tagchip">Data request</span>',
  }[t] || '');
  function vTrust() {
    const tr = D.trust;
    return `
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        ${tr.stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span><div class="kpi-delta" style="color:var(--muted)">${esc(s.sub)}</div></div>`).join('')}
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div>
          <h2 class="sec">Audit trail — every action, attributable</h2>
          <div class="card" style="padding:8px 16px">
            ${tr.audit.map((a) => `
              <div class="audit-row">
                <span class="audit-t">${esc(a.t)}</span>
                <span class="audit-text">${esc(a.text)}</span>
                ${auditTag(a.tag)}
              </div>`).join('')}
          </div>
        </div>
        <div>
          <h2 class="sec">Outreach rules — enforced before every send</h2>
          <div class="card">
            <ul class="strategy" style="margin:0;padding-left:18px">${tr.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          </div>
          <h2 class="sec">Who can do what</h2>
          <div class="card tbl-wrap" style="padding:6px 10px">
            <table class="tbl">
              <thead><tr><th>Person</th><th>Role</th><th>Permissions</th></tr></thead>
              <tbody>${tr.roles.map((r) => `<tr><td><b>${esc(r.who)}</b></td><td>${esc(r.role)}</td><td style="color:var(--ink-2)">${esc(r.can)}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <h2 class="sec">Why this exists</h2>
          <div class="card">
            <p style="margin:0;font-size:13px;color:var(--ink-2);max-width:60ch">Singapore's PDPA and DNC rules apply to every marketing send. Rook records consent with source and time, checks it before each message, and keeps this audit trail so any reply, send or data access can be explained after the fact — including the ones it refused.</p>
          </div>
        </div>
      </div>`;
  }

  // ---------- Brain ----------
  function vBrain() {
    return `
      <div class="grid c2" style="align-items:start">
        <div>
          <h2 class="sec">Knowledge the AI can use</h2>
          ${D.knowledge.map((k) => `
            <div class="kb">
              <div class="head">
                <b>${esc(k.title)}</b>
                <span class="cat">${esc(k.category)}</span>
                ${k.sensitive ? '<span class="lock">🔒 owner-gated</span>' : ''}
                <span class="cites">cited ${k.cites30d}× / 30d</span>
              </div>
              <p>${esc(k.excerpt)}</p>
              <div class="meta">${esc(state.kbApproved[k.id] && k.approvedVersion ? k.approvedVersion : k.version)} · updated ${fmtRel(k.updated)} by ${esc(k.owner)}</div>
            </div>`).join('')}
        </div>
        <div>
          <h2 class="sec">Knowledge gaps the AI found</h2>
          ${D.knowledgeGaps.map((g) => `
            <div class="kb gap">
              <b>“${esc(g.q)}”</b>
              <p>Asked ${g.asked}× · last ${fmtRel(g.last)} — ${esc(g.note)}</p>
              <div style="margin-top:8px"><button class="btn sm" data-toast="Draft answer created — review it under FAQ">Draft an answer</button></div>
            </div>`).join('')}
          <h2 class="sec">How grounding works</h2>
          <div class="card">
            <p style="margin:0;font-size:13px;color:var(--ink-2);max-width:60ch">Every price, policy or promise the AI sends cites a knowledge item (the 📎 chips in the Inbox). If no reliable item exists, the AI says so and hands the thread to staff — it never guesses. Sensitive items (prices, refunds, safety) only go live after owner approval.</p>
          </div>
        </div>
      </div>`;
  }

  // ---------- Setup (onboarding walkthrough) ----------
  // setupStep milestones: 0 idle · 1-3 files upload · 4 building · 5-10 items
  //                       · 11 review note · 12 test Q · 13 typing · 14 answer · 15 live
  const SETUP_LAST = 15;
  function vSetup() {
    const ob = D.onboarding;
    const s = state.setupStep;
    const fileRows = ob.files.map((f, i) => s >= i + 1
      ? `<div class="ob-file done"><span class="ob-check">✓</span><div><b>${esc(f.name)}</b><span>${esc(f.desc)}</span></div></div>`
      : `<div class="ob-file"><span class="ob-check"></span><div><b>${esc(f.name)}</b><span>${esc(f.desc)}</span></div></div>`).join('');
    const itemRows = ob.extracted.map((it, i) => s >= i + 5
      ? `<div class="ob-item"><span class="ob-check">✓</span><span>${esc(it.title)}</span><span class="ob-cat">${esc(it.cat)}</span></div>` : '').join('');
    const chat = s >= 12 ? `
      <div class="msgs" style="padding:10px 2px 2px">
        <div class="msg cust">${esc(ob.testQ)}</div>
        ${s === 13 ? '<div class="typing"><i></i><i></i><i></i></div>' : ''}
        ${s >= 14 ? `<div class="msg ai">${esc(ob.testA)}<br><span class="cite">📎 ${esc(ob.testCite)}</span></div>` : ''}
      </div>` : '';
    return `
      <div class="card brief">
        <h3>From files to a working AI in four steps</h3>
        <p>${esc(ob.intro)}</p>
        <div style="margin-top:12px">
          <button class="btn pri" data-setup-play ${state.setupPlaying ? 'disabled' : ''}>${s > 0 && !state.setupPlaying ? '↻ Replay onboarding' : state.setupPlaying ? 'Playing…' : '▶ Play onboarding'}</button>
        </div>
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div class="card ob-stage ${s >= 1 ? 'on' : ''}">
          <div class="ob-num">1</div><h3>Upload what you already have</h3>
          <p class="ob-sub">No forms, no data entry — photos and files are enough.</p>
          ${fileRows}
        </div>
        <div class="card ob-stage ${s >= 4 ? 'on' : ''}">
          <div class="ob-num">2</div><h3>The Business Brain builds itself</h3>
          <p class="ob-sub">${s === 4 ? 'Reading your files…' : s > 4 ? 'Extracted and organised:' : 'Waits for step 1.'}</p>
          ${itemRows}
        </div>
        <div class="card ob-stage ${s >= 11 ? 'on' : ''}">
          <div class="ob-num">3</div><h3>You approve the sensitive parts</h3>
          <p class="ob-sub">${s >= 11 ? esc(ob.review) : 'Waits for step 2.'}</p>
          ${chat}
        </div>
        <div class="card ob-stage ${s >= 15 ? 'on' : ''}">
          <div class="ob-num">4</div><h3>Go live on WhatsApp</h3>
          <p class="ob-sub">${s >= 15 ? esc(ob.live) : 'Waits for step 3.'}</p>
          ${s >= 15 ? '<div style="margin-top:10px"><span class="tagchip ai">● Live — answering as of now</span></div>' : ''}
        </div>
      </div>`;
  }
  function runSetup() {
    if (state.setupPlaying) return;
    state.setupPlaying = true;
    state.setupStep = 0;
    const token = ++state.setupToken;
    render();
    const delays = { 4: 1100, 12: 900, 13: 1200, 15: 800 };
    const tick = () => {
      if (token !== state.setupToken) return;
      if (state.setupStep >= SETUP_LAST) {
        state.setupPlaying = false;
        render();
        toast('Onboarding done — the AI is live and every answer is grounded');
        return;
      }
      state.setupStep++;
      render();
      setTimeout(tick, delays[state.setupStep] || 480);
    };
    setTimeout(tick, 400);
  }

  // ---------- Insights (charts) ----------
  // Accessible fallback for every chart (CVD / screen readers / print).
  function dataTable(headers, rows) {
    return `<details class="dtable"><summary>View as table</summary>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div></details>`;
  }
  function vInsights() {
    return `
      <div class="stat-row" style="grid-template-columns:repeat(3,1fr)">
        ${D.kpis.map((k) => `<div class="stat"><b>${esc(k.value)}</b><span>${esc(k.label)}</span><div class="kpi-delta">${esc(k.delta)}</div></div>`).join('')}
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div class="card chart-card">
          <h3>Leads &amp; bookings — last 30 days</h3>
          <div class="sub">Daily counts across all channels</div>
          ${lineChart()}
          ${dataTable(['Date', 'Leads', 'Bookings'], D.metrics.map((m) => [m.date, m.leads, m.bookings]))}
        </div>
        <div class="card chart-card">
          <h3>Sales funnel — last 30 days</h3>
          <div class="sub">From first contact to repeat booking</div>
          ${funnelChart()}
          ${dataTable(['Stage', 'Count', '% of previous'], D.funnel.map((f, i) => [f.stage, f.n, i ? Math.round((f.n / D.funnel[i - 1].n) * 100) + '%' : '—']))}
        </div>
        <div class="card chart-card">
          <h3>Leads by channel — last 30 days</h3>
          <div class="sub">Full bar = leads · dark segment = became bookings · click a bar to see those customers</div>
          ${channelChart()}
          ${dataTable(['Channel', 'Leads', 'Booked', 'Rate'], D.channels.map((c) => [c.name, c.leads, c.booked, Math.round((c.booked / c.leads) * 100) + '%']))}
        </div>
        <div class="card chart-card">
          <h3>Next 7 days — booking forecast</h3>
          <div class="sub">Band = ±20% confidence · basis: 30-day history, campaigns, weather outlook</div>
          ${forecastChart()}
          ${dataTable(['Day', 'Low', 'Expected', 'High'], D.forecast.map((f) => [f.day, f.lo, f.mid, f.hi]))}
        </div>
        <div class="card chart-card">
          <h3>Top services by revenue — last 30 days</h3>
          <div class="sub">Bookings shown at right</div>
          ${servicesChart()}
          ${dataTable(['Service', 'Bookings', 'Revenue'], D.topServices.map((s) => [s.name, s.bookings, money(s.revenue)]))}
        </div>
        <div class="card chart-card">
          <h3>${esc(D.teamCompare.title)}</h3>
          <div class="sub">The RFP's store-comparison insight, at single-merchant scale</div>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr>${D.teamCompare.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${D.teamCompare.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? 'num' : ''}">${i === 0 ? '<b>' + esc(c) + '</b>' : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table></div>
          <p style="font-size:12.5px;color:var(--ink-2);margin:10px 0 0;max-width:60ch">${esc(D.teamCompare.note)}</p>
        </div>
        <div class="card strategy">
          <h3 style="margin:0 0 8px;font-size:13.5px">${esc(D.strategy.title)}</h3>
          <ul style="margin:0;padding-left:18px">${D.strategy.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        </div>
      </div>`;
  }

  function lineChart() {
    const W = 460, H = 190, L = 26, R = 8, T = 26, B = 22;
    const data = D.metrics;
    const maxY = Math.max(...data.map((d) => d.leads)) + 1;
    const x = (i) => L + (i / (data.length - 1)) * (W - L - R);
    const y = (v) => T + (1 - v / maxY) * (H - T - B);
    const path = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join('');
    const grid = [0, Math.round(maxY / 2), maxY].map((v) => `
      <line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>
      <text x="${L - 5}" y="${y(v) + 3.5}" text-anchor="end">${v}</text>`).join('');
    const last = data[data.length - 1];
    const ticks = [0, 9, 19, 29].map((i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${data[i].date.slice(5).replace('-', '/')}</text>`).join('');
    return `
      <svg class="viz" viewBox="0 0 ${W} ${H}" id="linechart">
        ${grid}
        <line class="axis" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>
        ${ticks}
        <path d="${path('leads')}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>
        <path d="${path('bookings')}" fill="none" stroke="#1baf7a" stroke-width="2"/>
        <circle cx="${x(data.length - 1)}" cy="${y(last.leads)}" r="3.5" fill="var(--chart-1)"/>
        <circle cx="${x(data.length - 1)}" cy="${y(last.bookings)}" r="3.5" fill="#1baf7a"/>
        <text class="val" x="${x(data.length - 1) - 8}" y="${y(last.leads) - 8}" text-anchor="end" fill="var(--chart-1)">Leads</text>
        <text class="val" x="${x(data.length - 1) - 8}" y="${y(last.bookings) + 14}" text-anchor="end" fill="#1baf7a">Bookings</text>
        <line id="xhair" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--chart-axis)" stroke-width="1" style="display:none"/>
        <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" id="linehit"/>
      </svg>
      <div style="display:flex;gap:14px;font-size:11.5px;color:var(--muted)">
        <span><span class="dot" style="background:var(--chart-1)"></span> Leads</span>
        <span><span class="dot" style="background:#1baf7a"></span> Bookings</span>
      </div>`;
  }

  function funnelChart() {
    const W = 460, rowH = 30, gap = 6, L = 78, R = 46;
    const max = D.funnel[0].n;
    const colors = ['var(--funnel-1)', 'var(--funnel-2)', 'var(--funnel-3)', 'var(--funnel-4)', 'var(--funnel-5)'];
    const H = D.funnel.length * (rowH + gap) + 4;
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">
      ${D.funnel.map((f, i) => {
        const w = Math.max(6, (f.n / max) * (W - L - R));
        const yy = i * (rowH + gap);
        const conv = i > 0 ? Math.round((f.n / D.funnel[i - 1].n) * 100) + '%' : '';
        return `
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${f.stage}</text>
          <rect x="${L}" y="${yy}" width="${w}" height="${rowH - 8}" rx="4" fill="${colors[i]}" data-tip="${f.stage}: ${f.n}${conv ? ' · ' + conv + ' of previous' : ''}"/>
          <text class="val" x="${L + w + 7}" y="${yy + rowH / 2 - 1}">${f.n}</text>
          ${conv ? `<text x="${L + w + 7}" y="${yy + rowH / 2 + 11}" font-size="9.5">${conv} →</text>` : ''}`;
      }).join('')}
    </svg>`;
  }

  const DRILL_MAP = { 'QR / walk-in': 'QR code', 'Vet-clinic QR': 'QR code' };
  function channelChart() {
    const W = 460, rowH = 30, gap = 6, L = 88, R = 92;
    const max = Math.max(...D.channels.map((c) => c.leads));
    const H = D.channels.length * (rowH + gap) + 4;
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">
      ${D.channels.map((c, i) => {
        const yy = i * (rowH + gap);
        const wAll = (c.leads / max) * (W - L - R);
        const wBook = (c.booked / max) * (W - L - R);
        const rate = Math.round((c.booked / c.leads) * 100);
        const drill = DRILL_MAP[c.name] || c.name;
        return `
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${c.name}</text>
          <rect class="drillable" x="${L}" y="${yy}" width="${wAll}" height="${rowH - 8}" rx="4" fill="var(--funnel-1)" data-drill="${drill}" data-tip="${c.name}: ${c.leads} leads — click to see these customers"/>
          <rect class="drillable" x="${L}" y="${yy}" width="${wBook}" height="${rowH - 8}" rx="4" fill="var(--funnel-4)" data-drill="${drill}" data-tip="${c.name}: ${c.booked} booked (${rate}%) — click to see these customers"/>
          <text class="val" x="${L + wAll + 7}" y="${yy + rowH / 2 + 3.5}">${c.booked}/${c.leads} · ${rate}%</text>`;
      }).join('')}
    </svg>`;
  }

  function forecastChart() {
    const W = 460, H = 170, L = 26, R = 10, T = 14, B = 24;
    const data = D.forecast;
    const maxY = Math.max(...data.map((d) => d.hi)) + 1;
    const midY = Math.round(maxY / 2);
    const x = (i) => L + (i / (data.length - 1)) * (W - L - R);
    const y = (v) => T + (1 - v / maxY) * (H - T - B);
    const band = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.hi).toFixed(1)}`).join('') +
      data.slice().reverse().map((d, i) => `L${x(data.length - 1 - i).toFixed(1)},${y(d.lo).toFixed(1)}`).join('') + 'Z';
    const mid = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.mid).toFixed(1)}`).join('');
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">
      ${[0, midY, maxY].map((v) => `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 5}" y="${y(v) + 3.5}" text-anchor="end">${v}</text>`).join('')}
      <path d="${band}" fill="var(--chart-1)" opacity="0.16"/>
      <path d="${mid}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>
      ${data.map((d, i) => `
        <circle cx="${x(i)}" cy="${y(d.mid)}" r="3.2" fill="var(--chart-1)" data-tip="${d.day}: ${d.mid} bookings (${d.lo}–${d.hi})"/>
        <text x="${x(i)}" y="${H - 7}" text-anchor="middle">${d.day.split(' ')[0]}</text>`).join('')}
      <text class="val" x="${x(0) + 4}" y="${T + 2}">${esc(D.forecastNote)}</text>
    </svg>`;
  }

  function servicesChart() {
    const W = 460, rowH = 30, gap = 6, L = 118, R = 116;
    const max = Math.max(...D.topServices.map((s) => s.revenue));
    const H = D.topServices.length * (rowH + gap) + 4;
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">
      ${D.topServices.map((s, i) => {
        const yy = i * (rowH + gap);
        const w = (s.revenue / max) * (W - L - R);
        return `
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${s.name}</text>
          <rect x="${L}" y="${yy}" width="${w}" height="${rowH - 8}" rx="4" fill="var(--chart-1)" data-tip="${s.name}: ${money(s.revenue)} from ${s.bookings} bookings"/>
          <text class="val" x="${L + w + 7}" y="${yy + rowH / 2 + 3.5}">${money(s.revenue)} · ${s.bookings} bkgs</text>`;
      }).join('')}
    </svg>`;
  }

  // ---------- guided tour ----------
  const TOUR = [
    { view: 'today', title: 'Start your day here', text: 'The morning brief says what needs you — everything else is already handled. Below it: what the AI did overnight, ranked opportunities, and one-tap approvals. Try approving one.' },
    { view: 'inbox', title: 'The AI sells while you sleep', text: 'Open the top conversation — an overnight lead, qualified and quoted. The 📎 chips show exactly which knowledge item each answer came from. It never guesses a price.' },
    { view: 'inbox', title: 'It knows when to stop', text: 'Find the complaint thread: the AI paused itself instantly and drafted a recovery plan for a human. Also try ▶ Simulate a live inquiry and 📱 Customer view.' },
    { view: 'customers', title: 'Chats become an asset', text: 'Every conversation builds profiles, tags, lifecycle stages and lifetime value — and the task centre queues the human work with owners and due times.' },
    { view: 'marketing', title: 'Campaigns run themselves', text: 'Triggered by service cycles, birthdays, weather and capacity gaps — every send passes consent checks and waits for your approval. ROI is tracked per campaign, including the referral engine below.' },
    { view: 'social', title: 'Social feeds the funnel', text: 'A drafted content calendar (posts hold for consent and campaign approval), comments and DMs classified into leads vs complaints, and performance measured in bookings — not likes.' },
    { view: 'trust', title: 'Governance you can prove', text: 'Consent coverage, DNC checks before every send, role permissions, and an audit trail that even records what Rook refused to do.' },
    { view: 'insights', title: 'Data becomes strategy', text: 'Funnel, channel attribution (click a bar to see those customers), a 7-day forecast, unit economics, and a strategy card that says what to do this week — with its basis shown.' },
    { view: 'setup', title: 'Day one takes 20 minutes', text: 'Press play: files in, Business Brain built, sensitive items approved, live on WhatsApp. Then switch the industry at the top — same platform, different configuration.' },
  ];
  function tourCard() {
    const s = TOUR[state.tour - 1];
    return `
      <div class="tour" role="dialog" aria-label="Product tour">
        <div class="tour-step">${state.tour} / ${TOUR.length}</div>
        <b>${esc(s.title)}</b>
        <p>${esc(s.text)}</p>
        <div class="tour-actions">
          <button class="btn sm" data-tour-end>End tour</button>
          <span class="spacer"></span>
          ${state.tour > 1 ? '<button class="btn sm" data-tour-back>← Back</button>' : ''}
          <button class="btn sm pri" data-tour-next>${state.tour === TOUR.length ? 'Done' : 'Next →'}</button>
        </div>
      </div>`;
  }

  // ---------- chrome ----------
  function renderSide() {
    const unread = D.conversations.filter((c) => c.unread).length;
    $('#side').innerHTML = `
      <div class="logo"><span class="mark" aria-hidden="true">♜</span><b>Rook</b><span>AI growth team</span></div>
      ${NAV.map(([id, label]) => `
        <button class="nav-btn ${state.view === id ? 'on' : ''}" data-nav="${id}">
          ${IC[id]}${label}
          ${id === 'inbox' && unread ? `<span class="bdg">${unread}</span>` : ''}
        </button>`).join('')}
      <div class="side-foot"><b>${esc(D.merchant.name)}</b><br>${esc(D.merchant.address)}<br>${esc(D.merchant.hours)}</div>`;
    $('#tabbar').innerHTML = NAV.map(([id, label]) => `
      <button class="${state.view === id ? 'on' : ''}" data-nav="${id}">${IC[id]}${label}</button>`).join('');
  }
  function renderTop() {
    $('#topbar').innerHTML = `
      <h1>${TITLES[state.view]}</h1>
      <span class="sub">${esc(D.merchant.name)} · ${esc(D.merchant.tagline)}</span>
      <div class="spacer"></div>
      <div class="top-right">
        <div class="seg" role="group" aria-label="Demo industry">
          ${INDUSTRIES.map((ind) => `<button class="${state.industry === ind.id ? 'on' : ''}" data-industry="${ind.id}">${ind.label}</button>`).join('')}
        </div>
        <button class="btn sm" data-tour-start>${state.tour ? '● Tour running' : '▶ Tour'}</button>
        <span class="chip time">${esc(D.merchant.nowLabel)}</span>
        <span class="chip sim">Simulated data</span>
      </div>`;
  }

  let lastView = null;
  function render() {
    renderSide();
    renderTop();
    const views = { today: vToday, inbox: vInbox, customers: vCustomers, marketing: vMarketing, social: vSocial, reputation: vReputation, brain: vBrain, insights: vInsights, trust: vTrust, setup: vSetup };
    const el = $('#view');
    el.innerHTML = views[state.view]();
    // animate only on navigation, not on in-view state changes (approve, sim ticks…)
    el.classList.remove('enter');
    if (lastView !== state.view) {
      void el.offsetWidth; // restart the animation
      el.classList.add('enter');
    }
    lastView = state.view;
    const back = $('#view [data-back]');
    if (back && window.innerWidth <= 760) back.style.display = 'inline-block';
    const msgs = $('#msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    const oldTour = $('.tour');
    if (oldTour) oldTour.remove();
    if (state.tour) document.body.insertAdjacentHTML('beforeend', tourCard());
    bindHover();
  }

  function switchIndustry(id) {
    if (state.industry === id) return;
    state.industry = id;
    D = DEMOS[id];
    state.simToken++;           // cancel any running simulation
    state.setupToken++;         // cancel any running onboarding playback
    state.simConvo = null;
    state.simRunning = false;
    state.setupStep = 0;
    state.setupPlaying = false;
    state.convId = D.conversations[0].id;
    state.custId = null;
    state.custFilter = 'All';
    state.mobilePane = 'list';
    state.phoneView = null;
    render();
    toast(`Switched template — same platform, configured for a ${id === 'pets' ? 'mobile pet groomer' : 'beauty studio'}`);
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const closePhone = e.target.closest('[data-close-phone-btn]') ||
      (e.target.classList && e.target.classList.contains('phone-ovl') ? e.target : null);
    if (closePhone) { state.phoneView = null; render(); return; }
    const t = e.target.closest('[data-nav],[data-conv],[data-open-conv],[data-takeover],[data-simulate],[data-approve],[data-hold],[data-approve-camp],[data-post-reply],[data-filter],[data-cust],[data-back-cust],[data-back],[data-toast],[data-industry],[data-phone],[data-setup-play],[data-brief-phone],[data-tour-start],[data-tour-next],[data-tour-back],[data-tour-end],[data-drill],[data-clear-channel]');
    if (!t) return;
    if (t.dataset.industry) switchIndustry(t.dataset.industry);
    else if (t.dataset.tourStart !== undefined) { state.tour = 1; state.view = TOUR[0].view; render(); window.scrollTo(0, 0); }
    else if (t.dataset.tourNext !== undefined) {
      if (state.tour >= TOUR.length) { state.tour = 0; render(); toast('Tour done — explore freely, or switch the industry up top'); }
      else { state.tour++; state.view = TOUR[state.tour - 1].view; render(); window.scrollTo(0, 0); }
    }
    else if (t.dataset.tourBack !== undefined) { state.tour = Math.max(1, state.tour - 1); state.view = TOUR[state.tour - 1].view; render(); window.scrollTo(0, 0); }
    else if (t.dataset.tourEnd !== undefined) { state.tour = 0; render(); }
    else if (t.dataset.briefPhone !== undefined) { state.phoneView = 'brief'; render(); }
    else if (t.dataset.nav) { state.view = t.dataset.nav; state.custId = null; state.custChannel = null; state.mobilePane = 'list'; state.phoneView = null; render(); window.scrollTo(0, 0); }
    else if (t.dataset.drill) { state.view = 'customers'; state.custId = null; state.custFilter = 'All'; state.custChannel = t.dataset.drill; render(); window.scrollTo(0, 0); }
    else if (t.dataset.clearChannel !== undefined) { state.custChannel = null; render(); }
    else if (t.dataset.conv) { state.convId = t.dataset.conv; state.mobilePane = 'thread'; render(); }
    else if (t.dataset.openConv) { state.view = 'inbox'; state.convId = t.dataset.openConv; state.mobilePane = 'thread'; render(); window.scrollTo(0, 0); }
    else if (t.dataset.back !== undefined && t.dataset.back === '') { state.mobilePane = 'list'; render(); }
    else if (t.dataset.phone !== undefined && t.dataset.phone === '') { state.phoneView = 'conv'; render(); }
    else if (t.dataset.setupPlay !== undefined) runSetup();
    else if (t.dataset.takeover) {
      const id = t.dataset.takeover;
      const c = getConv(id);
      state.aiPaused[id] = !state.aiPaused[id];
      c.messages.push({ from: 'sys', text: state.aiPaused[id] ? 'You took over — AI paused on this thread. It will keep logging and suggest replies.' : 'Handed back to AI — it has the full context of your messages.' });
      toast(state.aiPaused[id] ? 'AI paused — the thread is yours' : 'AI resumed on this thread');
      render();
    }
    else if (t.dataset.simulate !== undefined) runSimulation();
    else if (t.dataset.approve) {
      const a = D.approvals.find((x) => x.id === t.dataset.approve);
      state.done[a.id] = true;
      if (a.action.campaign) state.campaign[a.action.campaign] = 'scheduled';
      if (a.action.review) state.reviewPosted[a.action.review] = true;
      if (a.action.knowledge) state.kbApproved[a.action.knowledge] = true;
      toast(a.toast);
      render();
    }
    else if (t.dataset.hold) { state.done[t.dataset.hold] = true; toast('Held — moved to your review list for later'); render(); }
    else if (t.dataset.approveCamp) {
      const cid = t.dataset.approveCamp;
      state.campaign[cid] = 'scheduled';
      const a = D.approvals.find((x) => x.action.campaign === cid);
      if (a) state.done[a.id] = true;
      toast('Campaign approved and scheduled');
      render();
    }
    else if (t.dataset.postReply) {
      const rid = t.dataset.postReply;
      state.reviewPosted[rid] = true;
      const a = D.approvals.find((x) => x.action.review === rid);
      if (a) state.done[a.id] = true;
      toast('Reply posted to Google');
      render();
    }
    else if (t.dataset.filter) { state.custFilter = t.dataset.filter; render(); }
    else if (t.dataset.cust) { state.custId = t.dataset.cust; render(); window.scrollTo(0, 0); }
    else if (t.dataset.backCust !== undefined) { state.custId = null; render(); }
    else if (t.dataset.toast) toast(t.dataset.toast);
  });

  // ---------- chart hover ----------
  const tip = $('#tooltip');
  function bindHover() {
    document.querySelectorAll('[data-tip]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        tip.textContent = el.dataset.tip;
        tip.style.display = 'block';
        tip.style.left = e.clientX + 'px';
        tip.style.top = e.clientY + 'px';
      });
      el.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    });
    const hit = $('#linehit');
    if (hit) {
      const svg = $('#linechart');
      const xh = svg.querySelector('#xhair');
      const data = D.metrics;
      const L = 26, R = 8, W = 460;
      hit.addEventListener('mousemove', (e) => {
        const r = svg.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * W;
        const i = Math.max(0, Math.min(data.length - 1, Math.round(((px - L) / (W - L - R)) * (data.length - 1))));
        const xx = L + (i / (data.length - 1)) * (W - L - R);
        xh.setAttribute('x1', xx); xh.setAttribute('x2', xx);
        xh.style.display = 'block';
        const d = data[i];
        tip.textContent = `${d.date.slice(5).replace('-', '/')} — ${d.leads} leads · ${d.bookings} bookings`;
        tip.style.display = 'block';
        tip.style.left = e.clientX + 'px';
        tip.style.top = e.clientY + 'px';
      });
      hit.addEventListener('mouseleave', () => { xh.style.display = 'none'; tip.style.display = 'none'; });
    }
  }

  render();
})();
