/* Rook demo — owner console app. No dependencies; all data from data.js. */
(() => {
  const DEMOS = window.DEMOS;
  const INDUSTRIES = [
    { id:'beauty', label:'Beauty studio' },
    { id:'pets', label:'Mobile pet groomer' },
  ];
  let D = DEMOS.beauty;
  const NOW = new Date(D.merchant.now);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  // ---------- i18n ----------
  const I18N = {
    en: {
      'nav.today':'Today','nav.inbox':'Inbox','nav.customers':'Customers','nav.marketing':'Marketing',
      'nav.social':'Social','nav.reputation':'Reputation','nav.brain':'Brain','nav.insights':'Insights',
      'nav.trust':'Trust','nav.setup':'Setup',
      'title.today':'Today','title.inbox':'Inbox — all channels','title.customers':'Customers & tasks',
      'title.marketing':'Marketing automation','title.social':'Social & brand','title.reputation':'Reputation & experience',
      'title.brain':'Business brain','title.insights':'Business insight','title.trust':'Trust, permissions & audit',
      'title.setup':'Setup — day one',
      'logo.tagline':'AI growth team',
      'industry.beauty':'Beauty studio','industry.pets':'Mobile pet groomer',
      'tour.button':'Tour','tour.running':'Tour running','sim.badge':'Simulated data',
      'aria.industryGroup':'Demo industry','aria.langGroup':'Language',
      'today.briefButton':'See it as your 7 AM WhatsApp','today.opportunities':"Today's opportunities",
      'today.open':'Open','today.waitingApproval':'Waiting for your approval ({n})',
      'today.allClear':'All clear — nothing needs your sign-off.','today.approve':'Approve','today.hold':'Hold',
      'inbox.simulateReplay':'Replay','inbox.simulateStart':'Simulate','inbox.simulateSuffix':'a live inquiry',
      'inbox.score':'Score {n}','inbox.customerView':'Customer view','inbox.handBack':'Hand back to AI',
      'inbox.takeOver':'Take over','inbox.leadScore':'Lead score','inbox.extracted':'Extracted by AI',
      'inbox.whyStopped':'Why the AI stopped','inbox.suggestedNext':'Suggested next step',
      'status.staffYou':'Staff (you)','status.aiHandling':'AI handling','status.withStaff':'With staff',
      'status.needsYou':'Needs you','status.pending':'pending','status.scheduled':'scheduled','status.completed':'completed',
      'msg.rookAI':'Rook AI','msg.staff':'Staff','msg.transcribed':'Transcribed by Rook','msg.source':'Source',
      'msg.aiTypingAria':'AI is typing','msg.voiceMessageAria':'Voice message, {duration}',
      'phone.customerViewAria':'Customer view','phone.close':'Close','phone.online':'online',
      'phone.messagePlaceholder':'Message…',
      'phone.defaultNoteTemplate':'What {name} sees — scores, notes and citations stay in your console.',
      'brief.phoneHeader':'Rook — Daily brief',
      'brief.phoneNote':'The owner gets this brief on WhatsApp every morning — no dashboard required.',
      'brief.phoneAria':'Daily brief as WhatsApp message','brief.topThree':'Top 3 right now:',
      'brief.openConsole':'Open your console to approve or take over → rook.app/today',
      'sim.livePlaying':'Live — playing now…',
      'customers.taskCentre':'Task centre — what the AI queued for the team','customers.base':'Customer base',
      'customers.sourceChip':'Source: {channel} · {n}','customers.tableCustomer':'Customer',
      'customers.tableStage':'Stage','customers.tableTags':'Tags','customers.tableSource':'Source',
      'customers.tableVisits':'Visits','customers.tableLtv':'Lifetime value','customers.tableLastVisit':'Last visit',
      'customers.tableNextDue':'Next due','customers.backAll':'← All customers','customers.prefers':'prefers',
      'customers.via':'via','customers.ltv':'Lifetime value','customers.visits':'Visits',
      'customers.usualService':'Usual service','customers.lastVisit':'Last visit','customers.nextDue':'Next due',
      'customers.consent':'Marketing consent','customers.consentYes':'Yes — WhatsApp OK',
      'customers.consentNo':'No — service messages only','customers.tags':'Tags','customers.timeline':'Timeline',
      'customers.timelineDefault1':'most recent visit',
      'customers.timelineDefault2':'Cycle reminder sent · customer rebooked same day',
      'customers.timelineDefault3':'Received June win-back campaign',
      'lc.all':'All','lc.newLead':'New lead','lc.evaluating':'Evaluating','lc.converted':'Converted',
      'lc.active':'Active','lc.vip':'VIP','lc.dormant':'Dormant','lc.churnRisk':'Churn risk',
      'channel.qr':'QR code','channel.qrWalkin':'QR / walk-in','channel.vetQr':'Vet-clinic QR','channel.referral':'Referral',
      'marketing.needsDecision':'Needs a decision / upcoming','marketing.recentlyCompleted':'Recently completed',
      'marketing.reach':'reach (consented)','marketing.estBookings':'est. bookings','marketing.estRevenue':'est. revenue',
      'marketing.sendCost':'send cost','marketing.sent':'sent','marketing.replies':'replies',
      'marketing.bookings':'bookings','marketing.revenue':'revenue','marketing.roi':'ROI',
      'marketing.unsubscribes':'unsubscribes','marketing.trigger':'Trigger','marketing.audience':'Audience',
      'marketing.schedule':'Schedule','marketing.approveSchedule':'Approve & schedule',
      'marketing.editAudience':'Edit audience','marketing.skipWeek':'Skip this week',
      'referral.heading':"Referrals — the lifecycle's last stage",
      'referral.linkNote':'— unique per customer, so every referral is attributed',
      'referral.topReferrers':'Top referrers','referral.referred':'Referred','referral.booked':'Booked',
      'referral.revenue':'Revenue','referral.note':'Note',
      'reputation.googleRating':'Google rating · {n} reviews','reputation.invites30':'review invites sent (30d)',
      'reputation.new30':'new reviews (30d)','reputation.openTickets':'open recovery ticket(s)',
      'reputation.latestReviews':'Latest reviews','reputation.whatCustomersTalk':'What customers talk about (30 days)',
      'reputation.linked':'Linked','reputation.replyPosted':'Reply posted',
      'reputation.replyDrafted':'AI-drafted reply — awaiting your approval','reputation.approvePost':'Approve & post',
      'reputation.edit':'Edit',
      'social.contentCalendar':"This week's content — drafted by the AI",'social.assets':'Assets worth shooting next',
      'social.whatDrives':'What content actually drives — not likes','social.reach':'reach','social.saves':'saves',
      'social.inquiries':'inquiries','social.bookings':'bookings','social.revenue':'revenue','social.insight':'Insight',
      'social.commentsDms':'Comments & DMs — classified live','social.scheduled':'Scheduled',
      'social.linkedToCampaign':'Linked to campaign','social.heldApproval':'Held — needs approval','social.idea':'Idea',
      'klass.complaint':'Complaint','klass.spam':'Spam','klass.partnership':'Partnership','klass.faq':'FAQ',
      'klass.priceInquiry':'Price inquiry','klass.highIntent':'High intent',
      'trust.auditTrail':'Audit trail — every action, attributable',
      'trust.outreachRules':'Outreach rules — enforced before every send','trust.whoCanDo':'Who can do what',
      'trust.person':'Person','trust.role':'Role','trust.permissions':'Permissions','trust.whyExists':'Why this exists',
      'trust.whyExistsBody':"Singapore's PDPA and DNC rules apply to every marketing send. Rook records consent with source and time, checks it before each message, and keeps this audit trail so any reply, send or data access can be explained after the fact — including the ones it refused.",
      'audit.ai':'AI action','audit.check':'Compliance check','audit.handoff':'Hand-off','audit.denied':'Denied',
      'audit.change':'Change held','audit.data':'Data request',
      'brain.knowledge':'Knowledge the AI can use','brain.ownerGated':'Owner-gated','brain.cited':'cited {n}× / 30d',
      'brain.updatedBy':'updated {rel} by {owner}','brain.gaps':'Knowledge gaps the AI found',
      'brain.askedLast':'Asked {n}× · last {rel} —','brain.draftAnswer':'Draft an answer',
      'brain.draftToast':'Draft answer created — review it under FAQ','brain.howGrounding':'How grounding works',
      'brain.groundingBody':'Every price, policy or promise the AI sends cites a knowledge item (the "Source" chips in the Inbox). If no reliable item exists, the AI says so and hands the thread to staff — it never guesses. Sensitive items (prices, refunds, safety) only go live after owner approval.',
      'setup.heading':'From files to a working AI in four steps','setup.replay':'Replay onboarding',
      'setup.playing':'Playing…','setup.play':'Play onboarding','setup.step1Title':'Upload what you already have',
      'setup.step1Sub':'No forms, no data entry — photos and files are enough.',
      'setup.step2Title':'The Business Brain builds itself','setup.step2Reading':'Reading your files…',
      'setup.step2Extracted':'Extracted and organised:','setup.waitsFor1':'Waits for step 1.',
      'setup.step3Title':'You approve the sensitive parts','setup.waitsFor2':'Waits for step 2.',
      'setup.step4Title':'Go live on WhatsApp','setup.waitsFor3':'Waits for step 3.',
      'setup.liveNow':'Live — answering as of now',
      'setup.doneToast':'Onboarding done — the AI is live and every answer is grounded',
      'insights.leadsBookingsTitle':'Leads & bookings — last 30 days',
      'insights.leadsBookingsSub':'Daily counts across all channels',
      'insights.funnelTitle':'Sales funnel — last 30 days','insights.funnelSub':'From first contact to repeat booking',
      'insights.channelTitle':'Leads by channel — last 30 days',
      'insights.channelSub':'Full bar = leads · dark segment = became bookings · click a bar to see those customers',
      'insights.forecastTitle':'Next 7 days — booking forecast',
      'insights.forecastSub':'Band = ±20% confidence · basis: 30-day history, campaigns, weather outlook',
      'insights.servicesTitle':'Top services by revenue — last 30 days','insights.servicesSub':'Bookings shown at right',
      'insights.viewTable':'View as table','insights.colDate':'Date','insights.colLeads':'Leads',
      'insights.colBookings':'Bookings','insights.colStage':'Stage','insights.colCount':'Count',
      'insights.colPctPrev':'% of previous','insights.colChannel':'Channel','insights.colBooked':'Booked',
      'insights.colRate':'Rate','insights.colDay':'Day','insights.colLow':'Low','insights.colExpected':'Expected',
      'insights.colHigh':'High','insights.colService':'Service','insights.colRevenue':'Revenue',
      'chart.leadsLegend':'Leads','chart.bookingsLegend':'Bookings',
      'chart.funnelTipSuffix':' · {pct} of previous',
      'chart.channelLeadsTip':'{name}: {n} leads — click to see these customers',
      'chart.channelBookedTip':'{name}: {n} booked ({rate}%) — click to see these customers',
      'chart.forecastTip':'{day}: {n} bookings ({lo}–{hi})',
      'chart.serviceTip':'{name}: {money} from {n} bookings','chart.serviceLabel':'{money} · {n} bkgs',
      'tour.aria':'Product tour','tour.endTour':'End tour','tour.back':'← Back','tour.next':'Next →','tour.done':'Done',
      'tour.doneToast':'Tour done — explore freely, or switch the industry up top',
      'tour.step1.title':'Start your day here',
      'tour.step1.text':'The morning brief says what needs you — everything else is already handled. Below it: what the AI did overnight, ranked opportunities, and one-tap approvals. Try approving one.',
      'tour.step2.title':'The AI sells while you sleep',
      'tour.step2.text':'Open the top conversation — an overnight lead, qualified and quoted. The "Source" chips show exactly which knowledge item each answer came from. It never guesses a price.',
      'tour.step3.title':'It knows when to stop',
      'tour.step3.text':'Find the complaint thread: the AI paused itself instantly and drafted a recovery plan for a human. Also try Simulate a live inquiry and Customer view.',
      'tour.step4.title':'Chats become an asset',
      'tour.step4.text':'Every conversation builds profiles, tags, lifecycle stages and lifetime value — and the task centre queues the human work with owners and due times.',
      'tour.step5.title':'Campaigns run themselves',
      'tour.step5.text':'Triggered by service cycles, birthdays, weather and capacity gaps — every send passes consent checks and waits for your approval. ROI is tracked per campaign, including the referral engine below.',
      'tour.step6.title':'Social feeds the funnel',
      'tour.step6.text':'A drafted content calendar (posts hold for consent and campaign approval), comments and DMs classified into leads vs complaints, and performance measured in bookings — not likes.',
      'tour.step7.title':'Governance you can prove',
      'tour.step7.text':'Consent coverage, DNC checks before every send, role permissions, and an audit trail that even records what Rook refused to do.',
      'tour.step8.title':'Data becomes strategy',
      'tour.step8.text':'Funnel, channel attribution (click a bar to see those customers), a 7-day forecast, unit economics, and a strategy card that says what to do this week — with its basis shown.',
      'tour.step9.title':'Day one takes 20 minutes',
      'tour.step9.text':'Press play: files in, Business Brain built, sensitive items approved, live on WhatsApp. Then switch the industry at the top — same platform, different configuration.',
      'toast.switchedTemplate':'Switched template — same platform, configured for a {industry}',
      'toast.takenOverSys':'You took over — AI paused on this thread. It will keep logging and suggest replies.',
      'toast.handedBackSys':'Handed back to AI — it has the full context of your messages.',
      'toast.aiPausedToast':'AI paused — the thread is yours','toast.aiResumedToast':'AI resumed on this thread',
      'toast.held':'Held — moved to your review list for later','toast.campaignApproved':'Campaign approved and scheduled',
      'toast.replyPostedGoogle':'Reply posted to Google',
      'rel.dash':'—','rel.tomorrow':'tomorrow','rel.inDays':'in {n}d','rel.minAgo':'{n}m ago','rel.hAgo':'{n}h ago',
      'rel.yesterday':'yesterday','rel.daysAgo':'{n}d ago','rel.weeksAgo':'{n}w ago','rel.monthsAgo':'{n}mo ago',
    },
  };
  I18N['zh-Hant'] = Object.assign({}, I18N.en, {
    'nav.today':'今天','nav.inbox':'收件匣','nav.customers':'客戶','nav.marketing':'行銷','nav.social':'社群',
    'nav.reputation':'口碑','nav.brain':'知識庫','nav.insights':'洞察','nav.trust':'信任','nav.setup':'設定',
    'title.today':'今天','title.inbox':'收件匣 — 全通路','title.customers':'客戶與任務',
    'title.marketing':'行銷自動化','title.social':'社群與品牌','title.reputation':'口碑與體驗',
    'title.brain':'業務知識庫','title.insights':'業務洞察','title.trust':'信任、權限與稽核',
    'title.setup':'設定 — 第一天','logo.tagline':'AI 增長團隊',
    'industry.beauty':'美容工作室','industry.pets':'到府寵物美容',
    'tour.button':'導覽','tour.running':'導覽進行中','sim.badge':'模擬數據',
    'aria.industryGroup':'示範行業','aria.langGroup':'語言',
    'today.briefButton':'查看您早上7點收到的WhatsApp訊息','today.opportunities':'今日商機',
    'today.open':'開啟','today.waitingApproval':'待您核准（{n}）',
    'today.allClear':'一切順利——暫無需要您確認的事項。','today.approve':'核准','today.hold':'暫緩',
    'inbox.simulateReplay':'重播','inbox.simulateStart':'模擬','inbox.simulateSuffix':'一次即時諮詢',
    'inbox.score':'評分 {n}','inbox.customerView':'客戶視角','inbox.handBack':'交還給AI',
    'inbox.takeOver':'接手處理','inbox.leadScore':'商機評分','inbox.extracted':'AI擷取的資訊',
    'inbox.whyStopped':'AI為何暫停','inbox.suggestedNext':'建議的下一步',
    'status.staffYou':'員工（您）','status.aiHandling':'AI處理中','status.withStaff':'員工處理中',
    'status.needsYou':'需要您處理','status.pending':'待處理','status.scheduled':'已排程','status.completed':'已完成',
    'msg.rookAI':'Rook AI','msg.staff':'員工','msg.transcribed':'由Rook轉錄','msg.source':'來源',
    'msg.aiTypingAria':'AI正在輸入','msg.voiceMessageAria':'語音訊息，{duration}',
    'phone.customerViewAria':'客戶視角','phone.close':'關閉','phone.online':'線上',
    'phone.messagePlaceholder':'輸入訊息…',
    'phone.defaultNoteTemplate':'{name}看到的畫面——評分、備註和引用來源只在您的後台顯示。',
    'brief.phoneHeader':'Rook——每日簡報',
    'brief.phoneNote':'店主每天早上都會在WhatsApp收到這份簡報——無需打開後台。',
    'brief.phoneAria':'以WhatsApp訊息形式呈現的每日簡報','brief.topThree':'目前最重要的3件事：',
    'brief.openConsole':'開啟後台即可核准或接手處理 → rook.app/today',
    'sim.livePlaying':'即時進行中…',
    'customers.taskCentre':'任務中心——AI為團隊排定的工作','customers.base':'客戶名單',
    'customers.sourceChip':'來源：{channel} · {n}','customers.tableCustomer':'客戶',
    'customers.tableStage':'階段','customers.tableTags':'標籤','customers.tableSource':'來源',
    'customers.tableVisits':'到訪次數','customers.tableLtv':'客戶終身價值','customers.tableLastVisit':'最近到訪',
    'customers.tableNextDue':'下次到期','customers.backAll':'← 所有客戶','customers.prefers':'偏好使用',
    'customers.via':'來自','customers.ltv':'終身價值','customers.visits':'到訪次數',
    'customers.usualService':'常用服務','customers.lastVisit':'最近到訪','customers.nextDue':'下次到期',
    'customers.consent':'行銷授權','customers.consentYes':'是——可傳送WhatsApp訊息',
    'customers.consentNo':'否——僅限服務性訊息','customers.tags':'標籤','customers.timeline':'時間軸',
    'customers.timelineDefault1':'最近一次到訪',
    'customers.timelineDefault2':'已傳送週期提醒 · 客戶當天重新預約',
    'customers.timelineDefault3':'收到6月的召回活動',
    'lc.all':'全部','lc.newLead':'新商機','lc.evaluating':'評估中','lc.converted':'已轉化',
    'lc.active':'活躍','lc.vip':'VIP','lc.dormant':'沉睡客戶','lc.churnRisk':'流失風險',
    'channel.qr':'QR碼','channel.qrWalkin':'QR碼/到店','channel.vetQr':'獸醫診所QR碼','channel.referral':'轉介',
    'marketing.needsDecision':'待決定/即將進行','marketing.recentlyCompleted':'近期已完成',
    'marketing.reach':'觸及人數（已授權）','marketing.estBookings':'預估預約數','marketing.estRevenue':'預估營收',
    'marketing.sendCost':'傳送成本','marketing.sent':'已傳送','marketing.replies':'回覆數',
    'marketing.bookings':'預約數','marketing.revenue':'營收','marketing.roi':'投資報酬率',
    'marketing.unsubscribes':'取消訂閱數','marketing.trigger':'觸發條件','marketing.audience':'目標客群',
    'marketing.schedule':'傳送時間','marketing.approveSchedule':'核准並排程',
    'marketing.editAudience':'編輯客群','marketing.skipWeek':'本週暫不傳送',
    'referral.heading':'轉介——生命週期的最後一環',
    'referral.linkNote':'——每位客戶專屬連結，確保每筆轉介都能被追蹤歸因',
    'referral.topReferrers':'最佳轉介客戶','referral.referred':'轉介人數','referral.booked':'已預約',
    'referral.revenue':'營收','referral.note':'備註',
    'reputation.googleRating':'Google評分 · {n}則評價','reputation.invites30':'已傳送評價邀請（30天）',
    'reputation.new30':'新增評價（30天）','reputation.openTickets':'待處理的補救案件',
    'reputation.latestReviews':'最新評價','reputation.whatCustomersTalk':'客戶都在談論什麼（30天）',
    'reputation.linked':'關聯案件','reputation.replyPosted':'回覆已發布',
    'reputation.replyDrafted':'AI已擬好回覆——等待您核准','reputation.approvePost':'核准並發布',
    'reputation.edit':'編輯',
    'social.contentCalendar':'本週內容——由AI擬定','social.assets':'值得拍攝的素材',
    'social.whatDrives':'真正帶來轉換的內容——而非按讚數','social.reach':'觸及','social.saves':'收藏',
    'social.inquiries':'諮詢數','social.bookings':'預約數','social.revenue':'營收','social.insight':'洞察',
    'social.commentsDms':'留言與私訊——即時分類','social.scheduled':'已排程',
    'social.linkedToCampaign':'已關聯行銷活動','social.heldApproval':'暫緩——待核准','social.idea':'構思中',
    'klass.complaint':'客訴','klass.spam':'垃圾訊息','klass.partnership':'合作邀約','klass.faq':'常見問題',
    'klass.priceInquiry':'價格諮詢','klass.highIntent':'高意向',
    'trust.auditTrail':'稽核紀錄——每項操作皆可追溯',
    'trust.outreachRules':'觸及規則——每次傳送前強制執行','trust.whoCanDo':'權限一覽',
    'trust.person':'人員','trust.role':'角色','trust.permissions':'權限','trust.whyExists':'為何需要這項功能',
    'trust.whyExistsBody':'新加坡的《個人資料保護法》（PDPA）及「拒絕來電」登記（DNC）適用於每一次行銷發送。Rook會記錄客戶授權的來源與時間，並在每次傳送訊息前進行核查，同時保留完整的稽核紀錄，讓任何回覆、傳送或資料存取都有據可查——包括AI拒絕執行的操作。',
    'audit.ai':'AI操作','audit.check':'合規檢查','audit.handoff':'轉交人工','audit.denied':'已拒絕',
    'audit.change':'變更待核准','audit.data':'數據請求',
    'brain.knowledge':'AI可使用的知識','brain.ownerGated':'需店主核准','brain.cited':'30天內引用{n}次',
    'brain.updatedBy':'由{owner}於{rel}更新','brain.gaps':'AI發現的知識缺口',
    'brain.askedLast':'已被問{n}次 · 最近一次於{rel} ——','brain.draftAnswer':'擬定答案',
    'brain.draftToast':'已產生擬定答案——請至常見問題中查看','brain.howGrounding':'溯源機制如何運作',
    'brain.groundingBody':'AI傳送的每一個價格、政策或承諾，都會引用一項知識條目（收件匣中的「來源」標籤）。如果沒有可靠的依據，AI會如實說明並轉交給員工處理——絕不臆測。敏感條目（價格、退款、安全事項）須經店主核准後才會生效。',
    'setup.heading':'從文件到可用的AI，只需四步','setup.replay':'重播導覽',
    'setup.playing':'播放中…','setup.play':'播放導覽','setup.step1Title':'上傳您現有的資料',
    'setup.step1Sub':'無需填表，無需人工輸入——照片和文件就夠了。',
    'setup.step2Title':'業務知識庫自動建立','setup.step2Reading':'正在讀取您的文件…',
    'setup.step2Extracted':'已擷取並整理：','setup.waitsFor1':'等待第1步完成。',
    'setup.step3Title':'由您核准敏感內容','setup.waitsFor2':'等待第2步完成。',
    'setup.step4Title':'在WhatsApp上線','setup.waitsFor3':'等待第3步完成。',
    'setup.liveNow':'已上線——即刻開始回覆',
    'setup.doneToast':'上線完成——AI已就緒，且每個回答都有據可查',
    'insights.leadsBookingsTitle':'商機與預約 — 近30天',
    'insights.leadsBookingsSub':'各通路每日數據',
    'insights.funnelTitle':'銷售漏斗 — 近30天','insights.funnelSub':'從首次接觸到重複預約',
    'insights.channelTitle':'各通路商機 — 近30天',
    'insights.channelSub':'整條為商機數 · 深色部分為已轉換預約 · 點擊柱狀圖查看對應客戶',
    'insights.forecastTitle':'未來7天 — 預約預測',
    'insights.forecastSub':'陰影區間為±20%信賴水準 · 依據：近30天數據、行銷活動與天氣展望',
    'insights.servicesTitle':'熱門服務營收 — 近30天','insights.servicesSub':'右側顯示預約數',
    'insights.viewTable':'檢視表格','insights.colDate':'日期','insights.colLeads':'商機',
    'insights.colBookings':'預約','insights.colStage':'階段','insights.colCount':'數量',
    'insights.colPctPrev':'佔上一階段比例','insights.colChannel':'通路','insights.colBooked':'已預約',
    'insights.colRate':'轉換率','insights.colDay':'日期','insights.colLow':'低值','insights.colExpected':'預期值',
    'insights.colHigh':'高值','insights.colService':'服務項目','insights.colRevenue':'營收',
    'chart.leadsLegend':'商機','chart.bookingsLegend':'預約',
    'chart.funnelTipSuffix':' · 為上一階段的{pct}',
    'chart.channelLeadsTip':'{name}：{n}個商機——點擊查看這些客戶',
    'chart.channelBookedTip':'{name}：{n}個已預約（{rate}%）——點擊查看這些客戶',
    'chart.forecastTip':'{day}：{n}個預約（{lo}–{hi}）',
    'chart.serviceTip':'{name}：{money}，來自{n}筆預約','chart.serviceLabel':'{money} · {n}筆預約',
    'tour.aria':'產品導覽','tour.endTour':'結束導覽','tour.back':'← 上一步','tour.next':'下一步 →','tour.done':'完成',
    'tour.doneToast':'導覽結束——請自由探索，或在頂部切換行業',
    'tour.step1.title':'從這裡開始新的一天',
    'tour.step1.text':'晨間簡報會告訴您今天需要處理什麼——其餘的都已由AI處理好。下方是AI昨晚做了什麼、按優先順序排列的商機，以及一鍵核准功能。試著核准一項看看。',
    'tour.step2.title':'AI在您休息時持續銷售',
    'tour.step2.text':'開啟最上面的對話——一個隔夜的商機，已完成資格確認與報價。「來源」標籤清楚顯示每個回答引用了哪個知識條目。AI絕不會憑空猜測價格。',
    'tour.step3.title':'它知道何時該停下',
    'tour.step3.text':'找到那則客訴對話：AI立即自行暫停，並為員工擬定了一份補救方案。也可以試試「模擬一次即時諮詢」和「客戶視角」功能。',
    'tour.step4.title':'對話沉澱為資產',
    'tour.step4.text':'每一次對話都會建立客戶檔案、標籤、生命週期階段與終身價值——任務中心則會為員工排定待辦事項，標明負責人與截止時間。',
    'tour.step5.title':'行銷活動自動運行',
    'tour.step5.text':'由服務週期、生日、天氣與產能缺口觸發——每次傳送都會先通過授權檢查，並等待您核准。每個行銷活動的投資報酬率都會被追蹤記錄，包括下方的轉介機制。',
    'tour.step6.title':'社群為銷售漏斗提供燃料',
    'tour.step6.text':'一份擬定的內容日曆（貼文需等待授權與行銷活動核准後才發布）、被分類為商機或客訴的留言與私訊，以及以預約數（而非按讚數）衡量的成效。',
    'tour.step7.title':'可驗證的合規治理',
    'tour.step7.text':'授權覆蓋率、每次傳送前的「拒絕來電」檢查、角色權限，以及一份連AI拒絕執行的操作都會記錄下來的稽核紀錄。',
    'tour.step8.title':'數據轉化為策略',
    'tour.step8.text':'銷售漏斗、通路歸因（點擊柱狀圖可查看對應客戶）、7天預測、單位經濟效益，以及一張說明本週該做什麼的策略卡片——並附上其依據。',
    'tour.step9.title':'第一天只需20分鐘',
    'tour.step9.text':'按下播放：上傳文件、自動建立業務知識庫、核准敏感內容、在WhatsApp上線。然後在頂部切換行業——同一個平台，不同的設定。',
    'toast.switchedTemplate':'已切換範本——同一平台，設定為{industry}',
    'toast.takenOverSys':'您已接手處理——AI在此對話中暫停，它會持續記錄並提供回覆建議。',
    'toast.handedBackSys':'已交還給AI——AI已掌握您訊息的完整脈絡。',
    'toast.aiPausedToast':'AI已暫停——這段對話現在由您處理','toast.aiResumedToast':'AI已恢復處理這段對話',
    'toast.held':'已暫緩——移入稍後處理清單','toast.campaignApproved':'行銷活動已核准並排程',
    'toast.replyPostedGoogle':'回覆已發布至Google',
    'rel.dash':'—','rel.tomorrow':'明天','rel.inDays':'{n}天後','rel.minAgo':'{n}分鐘前','rel.hAgo':'{n}小時前',
    'rel.yesterday':'昨天','rel.daysAgo':'{n}天前','rel.weeksAgo':'{n}週前','rel.monthsAgo':'{n}個月前',
  });
  I18N['zh-Hans'] = Object.assign({}, I18N.en, {
    'nav.today':'今天','nav.inbox':'收件箱','nav.customers':'客户','nav.marketing':'营销','nav.social':'社交',
    'nav.reputation':'口碑','nav.brain':'知识库','nav.insights':'洞察','nav.trust':'信任','nav.setup':'设置',
    'title.today':'今天','title.inbox':'收件箱 — 全渠道','title.customers':'客户与任务',
    'title.marketing':'营销自动化','title.social':'社交媒体与品牌','title.reputation':'口碑与体验',
    'title.brain':'业务知识库','title.insights':'业务洞察','title.trust':'信任、权限与审计',
    'title.setup':'设置 — 第一天','logo.tagline':'AI 增长团队',
    'industry.beauty':'美容工作室','industry.pets':'上门宠物美容',
    'tour.button':'导览','tour.running':'导览进行中','sim.badge':'模拟数据',
    'aria.industryGroup':'演示行业','aria.langGroup':'语言',
    'today.briefButton':'查看您早上7点收到的WhatsApp消息','today.opportunities':'今日商机',
    'today.open':'打开','today.waitingApproval':'待您确认（{n}）',
    'today.allClear':'一切顺利——暂无需要您确认的事项。','today.approve':'批准','today.hold':'暂缓',
    'inbox.simulateReplay':'重播','inbox.simulateStart':'模拟','inbox.simulateSuffix':'一次实时咨询',
    'inbox.score':'评分 {n}','inbox.customerView':'客户视角','inbox.handBack':'交还给AI',
    'inbox.takeOver':'接手处理','inbox.leadScore':'商机评分','inbox.extracted':'AI提取的信息',
    'inbox.whyStopped':'AI为何暂停','inbox.suggestedNext':'建议的下一步',
    'status.staffYou':'员工（您）','status.aiHandling':'AI处理中','status.withStaff':'员工处理中',
    'status.needsYou':'需要您处理','status.pending':'待处理','status.scheduled':'已排程','status.completed':'已完成',
    'msg.rookAI':'Rook AI','msg.staff':'员工','msg.transcribed':'由Rook转录','msg.source':'来源',
    'msg.aiTypingAria':'AI正在输入','msg.voiceMessageAria':'语音消息，{duration}',
    'phone.customerViewAria':'客户视角','phone.close':'关闭','phone.online':'在线',
    'phone.messagePlaceholder':'输入消息…',
    'phone.defaultNoteTemplate':'{name}看到的画面——评分、备注和引用来源只在您的后台显示。',
    'brief.phoneHeader':'Rook——每日简报',
    'brief.phoneNote':'店主每天早上都会在WhatsApp收到这份简报——无需打开后台。',
    'brief.phoneAria':'以WhatsApp消息形式呈现的每日简报','brief.topThree':'目前最重要的3件事：',
    'brief.openConsole':'打开后台即可批准或接手处理 → rook.app/today',
    'sim.livePlaying':'实时进行中…',
    'customers.taskCentre':'任务中心——AI为团队排定的工作','customers.base':'客户名单',
    'customers.sourceChip':'来源：{channel} · {n}','customers.tableCustomer':'客户',
    'customers.tableStage':'阶段','customers.tableTags':'标签','customers.tableSource':'来源',
    'customers.tableVisits':'到访次数','customers.tableLtv':'客户终身价值','customers.tableLastVisit':'最近到访',
    'customers.tableNextDue':'下次到期','customers.backAll':'← 所有客户','customers.prefers':'偏好使用',
    'customers.via':'来自','customers.ltv':'终身价值','customers.visits':'到访次数',
    'customers.usualService':'常用服务','customers.lastVisit':'最近到访','customers.nextDue':'下次到期',
    'customers.consent':'营销授权','customers.consentYes':'是——可发送WhatsApp消息',
    'customers.consentNo':'否——仅限服务性消息','customers.tags':'标签','customers.timeline':'时间轴',
    'customers.timelineDefault1':'最近一次到访',
    'customers.timelineDefault2':'已发送周期提醒 · 客户当天重新预约',
    'customers.timelineDefault3':'收到6月的召回活动',
    'lc.all':'全部','lc.newLead':'新商机','lc.evaluating':'评估中','lc.converted':'已转化',
    'lc.active':'活跃','lc.vip':'VIP','lc.dormant':'沉睡客户','lc.churnRisk':'流失风险',
    'channel.qr':'二维码','channel.qrWalkin':'二维码/到店','channel.vetQr':'兽医诊所二维码','channel.referral':'转介绍',
    'marketing.needsDecision':'待决定/即将进行','marketing.recentlyCompleted':'近期已完成',
    'marketing.reach':'触达人数（已授权）','marketing.estBookings':'预估预约数','marketing.estRevenue':'预估营收',
    'marketing.sendCost':'发送成本','marketing.sent':'已发送','marketing.replies':'回复数',
    'marketing.bookings':'预约数','marketing.revenue':'营收','marketing.roi':'投资回报率',
    'marketing.unsubscribes':'取消订阅数','marketing.trigger':'触发条件','marketing.audience':'目标客群',
    'marketing.schedule':'发送时间','marketing.approveSchedule':'批准并排程',
    'marketing.editAudience':'编辑客群','marketing.skipWeek':'本周暂不发送',
    'referral.heading':'转介绍——生命周期的最后一环',
    'referral.linkNote':'——每位客户专属链接，确保每笔转介都能被追踪归因',
    'referral.topReferrers':'最佳转介客户','referral.referred':'转介人数','referral.booked':'已预约',
    'referral.revenue':'营收','referral.note':'备注',
    'reputation.googleRating':'Google评分 · {n}则评价','reputation.invites30':'已发送评价邀请（30天）',
    'reputation.new30':'新增评价（30天）','reputation.openTickets':'待处理的补救案件',
    'reputation.latestReviews':'最新评价','reputation.whatCustomersTalk':'客户都在谈论什么（30天）',
    'reputation.linked':'关联案件','reputation.replyPosted':'回复已发布',
    'reputation.replyDrafted':'AI已草拟回复——等待您批准','reputation.approvePost':'批准并发布',
    'reputation.edit':'编辑',
    'social.contentCalendar':'本周内容——由AI草拟','social.assets':'值得拍摄的素材',
    'social.whatDrives':'真正带来转化的内容——而非点赞数','social.reach':'触达','social.saves':'收藏',
    'social.inquiries':'咨询数','social.bookings':'预约数','social.revenue':'营收','social.insight':'洞察',
    'social.commentsDms':'留言与私信——实时分类','social.scheduled':'已排程',
    'social.linkedToCampaign':'已关联营销活动','social.heldApproval':'暂缓——待批准','social.idea':'构思中',
    'klass.complaint':'投诉','klass.spam':'垃圾信息','klass.partnership':'合作邀约','klass.faq':'常见问题',
    'klass.priceInquiry':'价格咨询','klass.highIntent':'高意向',
    'trust.auditTrail':'审计日志——每项操作皆可追溯',
    'trust.outreachRules':'触达规则——每次发送前强制执行','trust.whoCanDo':'权限一览',
    'trust.person':'人员','trust.role':'角色','trust.permissions':'权限','trust.whyExists':'为何需要这个功能',
    'trust.whyExistsBody':'新加坡的《个人资料保护法》（PDPA）及"谢绝来电"登记（DNC）适用于每一次营销发送。Rook会记录客户授权的来源与时间，并在每次发送消息前进行核查，同时保留完整的审计日志，让任何回复、发送或数据访问都有据可查——包括AI拒绝执行的操作。',
    'audit.ai':'AI操作','audit.check':'合规检查','audit.handoff':'转交人工','audit.denied':'已拒绝',
    'audit.change':'变更待批准','audit.data':'数据请求',
    'brain.knowledge':'AI可使用的知识','brain.ownerGated':'需店主批准','brain.cited':'30天内引用{n}次',
    'brain.updatedBy':'由{owner}于{rel}更新','brain.gaps':'AI发现的知识缺口',
    'brain.askedLast':'已被问{n}次 · 最近一次于{rel} ——','brain.draftAnswer':'草拟答案',
    'brain.draftToast':'已生成草拟答案——请到常见问题中查看','brain.howGrounding':'溯源机制如何运作',
    'brain.groundingBody':'AI发送的每一个价格、政策或承诺，都会引用一项知识条目（收件箱中的"来源"标签）。如果没有可靠的依据，AI会如实说明并转交给员工处理——绝不臆测。敏感条目（价格、退款、安全事项）须经店主批准后才会生效。',
    'setup.heading':'从文件到可用的AI，只需四步','setup.replay':'重播导览',
    'setup.playing':'播放中…','setup.play':'播放导览','setup.step1Title':'上传您现有的资料',
    'setup.step1Sub':'无需填表，无需人工录入——照片和文件就够了。',
    'setup.step2Title':'业务知识库自动建立','setup.step2Reading':'正在读取您的文件…',
    'setup.step2Extracted':'已提取并整理：','setup.waitsFor1':'等待第1步完成。',
    'setup.step3Title':'由您批准敏感内容','setup.waitsFor2':'等待第2步完成。',
    'setup.step4Title':'在WhatsApp上线','setup.waitsFor3':'等待第3步完成。',
    'setup.liveNow':'已上线——即刻开始回复',
    'setup.doneToast':'上线完成——AI已就绪，且每个回答都有据可查',
    'insights.leadsBookingsTitle':'商机与预约 — 近30天',
    'insights.leadsBookingsSub':'各渠道每日数据',
    'insights.funnelTitle':'销售漏斗 — 近30天','insights.funnelSub':'从首次接触到重复预约',
    'insights.channelTitle':'各渠道商机 — 近30天',
    'insights.channelSub':'整条为商机数 · 深色部分为已转化预约 · 点击柱状图查看对应客户',
    'insights.forecastTitle':'未来7天 — 预约预测',
    'insights.forecastSub':'阴影区间为±20%置信度 · 依据：近30天数据、营销活动与天气展望',
    'insights.servicesTitle':'热门服务营收 — 近30天','insights.servicesSub':'右侧显示预约数',
    'insights.viewTable':'查看表格','insights.colDate':'日期','insights.colLeads':'商机',
    'insights.colBookings':'预约','insights.colStage':'阶段','insights.colCount':'数量',
    'insights.colPctPrev':'占上一阶段比例','insights.colChannel':'渠道','insights.colBooked':'已预约',
    'insights.colRate':'转化率','insights.colDay':'日期','insights.colLow':'低值','insights.colExpected':'预期值',
    'insights.colHigh':'高值','insights.colService':'服务项目','insights.colRevenue':'营收',
    'chart.leadsLegend':'商机','chart.bookingsLegend':'预约',
    'chart.funnelTipSuffix':' · 为上一阶段的{pct}',
    'chart.channelLeadsTip':'{name}：{n}个商机——点击查看这些客户',
    'chart.channelBookedTip':'{name}：{n}个已预约（{rate}%）——点击查看这些客户',
    'chart.forecastTip':'{day}：{n}个预约（{lo}–{hi}）',
    'chart.serviceTip':'{name}：{money}，来自{n}笔预约','chart.serviceLabel':'{money} · {n}笔预约',
    'tour.aria':'产品导览','tour.endTour':'结束导览','tour.back':'← 上一步','tour.next':'下一步 →','tour.done':'完成',
    'tour.doneToast':'导览结束——请自由探索，或在顶部切换行业',
    'tour.step1.title':'从这里开始新的一天',
    'tour.step1.text':'晨间简报会告诉您今天需要处理什么——其余的都已由AI处理好。下方是AI昨晚做了什么、按优先级排序的商机，以及一键批准功能。试着批准一项看看。',
    'tour.step2.title':'AI在您休息时持续销售',
    'tour.step2.text':'打开最上面的对话——一个隔夜的商机，已完成资格确认与报价。"来源"标签清楚显示每个回答引用了哪个知识条目。AI绝不会凭空猜测价格。',
    'tour.step3.title':'它知道何时该停下',
    'tour.step3.text':'找到那条投诉对话：AI立即自行暂停，并为员工草拟了一份补救方案。也可以试试"模拟一次实时咨询"和"客户视角"功能。',
    'tour.step4.title':'对话沉淀为资产',
    'tour.step4.text':'每一次对话都会建立客户档案、标签、生命周期阶段与终身价值——任务中心则会为员工排定待办事项，标明负责人与截止时间。',
    'tour.step5.title':'营销活动自动运行',
    'tour.step5.text':'由服务周期、生日、天气与产能缺口触发——每次发送都会先通过授权检查，并等待您批准。每个营销活动的投资回报率都会被追踪记录，包括下方的转介绍机制。',
    'tour.step6.title':'社交媒体为销售漏斗提供燃料',
    'tour.step6.text':'一份草拟的内容日历（贴文需等待授权与营销活动批准后才发布）、被分类为商机或投诉的留言与私信，以及以预约数（而非点赞数）衡量的成效。',
    'tour.step7.title':'可验证的合规治理',
    'tour.step7.text':'授权覆盖率、每次发送前的"谢绝来电"检查、角色权限，以及一份连AI拒绝执行的操作都会记录下来的审计日志。',
    'tour.step8.title':'数据转化为策略',
    'tour.step8.text':'销售漏斗、渠道归因（点击柱状图可查看对应客户）、7天预测、单位经济效益，以及一张说明本周该做什么的策略卡片——并附上其依据。',
    'tour.step9.title':'第一天只需20分钟',
    'tour.step9.text':'按下播放：上传文件、自动建立业务知识库、批准敏感内容、在WhatsApp上线。然后在顶部切换行业——同一个平台，不同的配置。',
    'toast.switchedTemplate':'已切换模板——同一平台，配置为{industry}',
    'toast.takenOverSys':'您已接手处理——AI在此对话中暂停，它会持续记录并提供回复建议。',
    'toast.handedBackSys':'已交还给AI——AI已掌握您消息的完整脉络。',
    'toast.aiPausedToast':'AI已暂停——这段对话现在由您处理','toast.aiResumedToast':'AI已恢复处理这段对话',
    'toast.held':'已暂缓——移入稍后处理清单','toast.campaignApproved':'营销活动已批准并排程',
    'toast.replyPostedGoogle':'回复已发布至Google',
    'rel.dash':'—','rel.tomorrow':'明天','rel.inDays':'{n}天后','rel.minAgo':'{n}分钟前','rel.hAgo':'{n}小时前',
    'rel.yesterday':'昨天','rel.daysAgo':'{n}天前','rel.weeksAgo':'{n}周前','rel.monthsAgo':'{n}个月前',
  });
  function t(key, vars) {
    const dict = I18N[state.lang] || I18N.en;
    let str = dict[key] ?? I18N.en[key] ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
    return str;
  }
  const LIFECYCLE_KEY = { All:'lc.all','New lead':'lc.newLead',Evaluating:'lc.evaluating',Converted:'lc.converted',
    Active:'lc.active',VIP:'lc.vip',Dormant:'lc.dormant','Churn risk':'lc.churnRisk' };
  const lcLabel = (v) => t(LIFECYCLE_KEY[v] || v);
  const CHANNEL_KEY = { 'QR code':'channel.qr','QR / walk-in':'channel.qrWalkin','Vet-clinic QR':'channel.vetQr','Referral':'channel.referral' };
  const chLabel = (v) => t(CHANNEL_KEY[v] || v);

  const state = {
    lang:'en',
    industry:'beauty',
    view:'today',
    convId:'v-priya',
    mobilePane:'list',
    custFilter:'All',
    custChannel: null,
    custId: null,
    aiPaused: {},
    done: {}, // approval ids that were actioned
    campaign: {}, // campaign id -> new status
    reviewPosted: {},
    kbApproved: {},
    phoneView: null, // null |'conv' |'brief'
    tour: 0, // 0 = off, 1-based step otherwise
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
.toLocaleTimeString(state.lang ==='en'?'en-SG':'zh-SG', { hour:'numeric', minute:'2-digit', hour12: true, timeZone:'Asia/Singapore' })
.toUpperCase();
  const fmtRel = (iso) => {
    if (!iso) return t('rel.dash');
    const ms = NOW - new Date(iso);
    const h = ms / 36e5;
    if (h < -0.01) {
      const dAhead = Math.round(-h / 24);
      return dAhead <= 1? t('rel.tomorrow'): t('rel.inDays', { n: dAhead });
    }
    if (h < 1) return t('rel.minAgo', { n: Math.max(1, Math.round(ms / 6e4)) });
    if (h < 22) return t('rel.hAgo', { n: Math.round(h) });
    const days = Math.round(h / 24);
    if (days <= 1) return t('rel.yesterday');
    if (days < 7) return t('rel.daysAgo', { n: days });
    if (days < 30) return t('rel.weeksAgo', { n: Math.round(days / 7) });
    return t('rel.monthsAgo', { n: Math.round(days / 30) });
  };
  const money = (n) =>'$' + Number(n).toLocaleString('en-SG');

  // ---------- icons ----------
  const IC = {
    today:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="3.2"/><path d="M8 1.2v1.8M8 13v1.8M1.2 8H3M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3"/></svg>',
    inbox:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 3.5h12v7H8.5L5.5 13v-2.5H2z" stroke-linejoin="round"/></svg>',
    customers:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="5.5" cy="5.5" r="2.3"/><path d="M1.5 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="11.5" cy="5" r="1.8"/><path d="M10.8 9.3c2 .2 3.7 1.9 3.7 4.2"/></svg>',
    marketing:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6.5v3l8 3v-9zM10 5.5c2 .5 3 1.4 3 2.5s-1 2-3 2.5M4 9.8V13" stroke-linejoin="round"/></svg>',
    reputation:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" stroke-linejoin="round"/></svg>',
    brain:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3c-1-1.2-3-1.5-4.5-.5S2 5.5 2.5 7c-1 .8-1 2.5 0 3.5S5 12 6 11.3M8 3c1-1.2 3-1.5 4.5-.5S14 5.5 13.5 7c1 .8 1 2.5 0 3.5S11 12 10 11.3M8 3v10.5"/></svg>',
    insights:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 13.5h12M3.5 13V9M7 13V5.5M10.5 13V7.5M14 13V3.5"/></svg>',
    setup:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4.5h8M12.5 4.5H14M2 11.5h3M7.5 11.5H14"/><circle cx="10.5" cy="4.5" r="1.7"/><circle cx="5.5" cy="11.5" r="1.7"/></svg>',
    social:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="3.5" r="1.8"/><circle cx="4" cy="8" r="1.8"/><circle cx="12" cy="12.5" r="1.8"/><path d="M5.7 7.2l4.6-2.6M5.7 8.8l4.6 2.6"/></svg>',
    trust:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 1.8l5 2v3.7c0 3.2-2.1 5.6-5 6.7-2.9-1.1-5-3.5-5-6.7V3.8z" stroke-linejoin="round"/><path d="M5.8 7.8l1.6 1.6 2.8-3"/></svg>',
  };
  const NAV_IDS = ['today','inbox','customers','marketing','social','reputation','brain','insights','trust','setup'];

  // ---------- shared bits ----------
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }
  const statusChip = (c) => {
    if (state.aiPaused[c.id]) return `<span class="tagchip human">${t('status.staffYou')}</span>`;
    if (c.aiStatus ==='ai') return `<span class="tagchip ai">${t('status.aiHandling')}</span>`;
    if (c.aiStatus ==='human') return `<span class="tagchip human">${t('status.withStaff')}</span>`;
    return `<span class="tagchip esc">${t('status.needsYou')}</span>`;
  };
  const chIcon = { WhatsApp:'WA', Instagram:'IG', Google:'G','QR code':'QR', Referral:'REF' };

  // ---------- Today ----------
  function vToday() {
    const pending = D.approvals.filter((a) =>!state.done[a.id]);
    return `
      <div class="card brief">
        <h3>${esc(D.brief.headline)}</h3>
        <p>${esc(D.brief.body)}</p>
        <div style="margin-top:10px"><button class="btn sm" data-brief-phone>${t('today.briefButton')}</button></div>
      </div>
      ${state.phoneView ==='brief'? briefPhone():''}
      <h2 class="sec">${esc(D.activityLabel)}</h2>
      <div class="stat-row">
        ${D.aiActivity.map((a) => `<div class="stat"><b>${a.n}</b><span>${esc(a.label)}</span></div>`).join('')}
      </div>
      <h2 class="sec">${t('today.opportunities')}</h2>
      ${D.opportunities.map((o) => `
        <div class="opp ${o.kind}">
          <span class="stripe"></span>
          <div><div class="who">${esc(o.who)}</div><div class="why">${esc(o.why)}</div></div>
          <div class="val">${esc(o.value)}</div>
          ${o.convId? `<button class="btn sm go" data-open-conv="${o.convId}">${t('today.open')}</button>`:''}
        </div>`).join('')}
      <h2 class="sec">${t('today.waitingApproval', { n: pending.length })}</h2>
      ${pending.length === 0? `<div class="card"><p style="margin:0;color:var(--muted)">${t('today.allClear')}</p></div>`: pending.map((a) => `
        <div class="appr">
          <span class="k">${esc(a.type)}</span>
          <div class="t"><b>${esc(a.title)}</b><span>${esc(a.detail)}</span></div>
          <div class="act">
            <button class="btn sm pri" data-approve="${a.id}">${t('today.approve')}</button>
            <button class="btn sm" data-hold="${a.id}">${t('today.hold')}</button>
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
      <button class="convo ${c.id === conv.id?'on':''}" data-conv="${c.id}">
        <span class="r1"><b>${esc(c.name)}</b><time>${fmtRel(c.time)}</time></span>
        <span class="pv">${esc(c.preview)}</span>
        <span class="r2">
          <span class="tagchip">${chIcon[c.channel] || c.channel}</span>
          ${statusChip(c)}
          ${c.score!= null? `<span class="tagchip">${t('inbox.score', { n: c.score })}</span>`:''}
        </span>
      </button>`).join('');

    const msgs = conv.messages.map(msgHtml).join('');
    const paused = state.aiPaused[conv.id];
    const listHide = state.mobilePane ==='thread'?'hidden-m':'';
    const threadHide = state.mobilePane ==='list'?'hidden-m':'';

    return `
      <div class="inbox">
        <div class="list-pane ${listHide}">
          <button class="btn pri" style="width:100%;margin-bottom:10px" data-simulate ${state.simRunning?'disabled':''}>
            ${state.simConvo? '↻ ' + t('inbox.simulateReplay'): '▶ ' + t('inbox.simulateStart')} ${t('inbox.simulateSuffix')}
          </button>
          <div class="convo-list">${listHtml}</div>
        </div>
        <div class="card thread thread-pane ${threadHide}">
          <div class="thread-head">
            <button class="btn sm only-m" data-back style="display:none">←</button>
            <div><b>${esc(conv.name)}</b><div class="sub">${chLabel(conv.channel)} · ${esc(conv.customerLine || conv.intent ||'')}</div></div>
            <div class="spacer"></div>
            ${statusChip(conv)}
            <button class="btn sm" data-phone>${t('inbox.customerView')}</button>
            <button class="btn sm" data-takeover="${conv.id}">${paused? t('inbox.handBack'): t('inbox.takeOver')}</button>
          </div>
          <div class="msgs" id="msgs">${msgs}</div>
        </div>
        <div class="ctx ${threadHide}">
          ${conv.score!= null? `<div class="card"><h4>${t('inbox.leadScore')}</h4><span class="score-pill">${conv.score}</span><span style="color:var(--muted)"> / 100 · ${esc(conv.intent)}</span></div>`:''}
          ${conv.fields? `<div class="card"><h4>${t('inbox.extracted')}</h4><dl class="kv">${Object.entries(conv.fields).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`:''}
          ${conv.handoff? `<div class="card handoff"><h4>${t('inbox.whyStopped')}</h4><p>${esc(conv.handoff)}</p></div>`:''}
          ${conv.nextAction? `<div class="card nextact"><h4>${t('inbox.suggestedNext')}</h4><p>${esc(conv.nextAction)}</p></div>`:''}
        </div>
      </div>
      ${state.phoneView ==='conv'? phoneOverlay(conv):''}`;
  }
  const WAVE = [5, 9, 13, 8, 11, 6, 12, 9, 14, 7, 10, 5, 8, 12, 6, 9]
.map((h) => `<i style="height:${h}px"></i>`).join('');
  function msgHtml(m) {
    if (m.from ==='sys') return `<div class="msg sys">${esc(m.text)}</div>`;
    if (m.from ==='typing') return `<div class="typing" aria-label="${t('msg.aiTypingAria')}"><i></i><i></i><i></i></div>`;
    const who = m.from ==='cust'?'cust': m.from;
    const label = m.from ==='cust'?'': m.from ==='ai'? t('msg.rookAI'): t('msg.staff');
    if (m.voice) return `<div class="msg ${who}">
      <span class="vn" aria-label="${t('msg.voiceMessageAria', { duration: m.duration })}">▶<span class="vn-wave">${WAVE}</span>${esc(m.duration)}</span>
      <div class="vn-tx">“${esc(m.text)}”</div>
      <span class="vn-note">${t('msg.transcribed')}</span>
      <span class="meta">${label}${label && m.time? ' · ':''}${m.time? fmtClock(m.time):''}</span></div>`;
    return `<div class="msg ${who}">${esc(m.text)}
      ${m.cite? `<br><span class="cite"><span class="cite-k">${t('msg.source')}</span>${esc(m.cite)}</span>`:''}
      <span class="meta">${label}${label && m.time? ' · ':''}${m.time? fmtClock(m.time):''}</span></div>`;
  }

  // What the customer's phone shows: no system notes, no scores, no citations.
  function phoneOverlay(conv, opts = {}) {
    const bubbles = conv.messages.filter((m) => m.from!=='sys' && m.from!=='typing').map((m) => {
      const body = m.voice
? `<span class="vn">▶<span class="vn-wave">${WAVE}</span>${esc(m.duration)}</span>`
: esc(m.text);
      return `<div class="ph-msg ${m.from ==='cust'?'mine':'theirs'}">${body}
        <span class="ph-time">${m.time? fmtClock(m.time):''}</span></div>`;
    }).join('');
    return `
      <div class="phone-ovl" data-close-phone>
        <div class="phone" role="dialog" aria-label="${esc(opts.aria || t('phone.customerViewAria'))}">
          <div class="ph-note">${esc(opts.note || t('phone.defaultNoteTemplate', { name: conv.name }))}</div>
          <div class="ph-head"><span class="ph-avatar">${esc((opts.header || D.merchant.name)[0])}</span>
            <div><b>${esc(opts.header || D.merchant.name)}</b><span>${t('phone.online')}</span></div>
            <button class="btn sm" data-close-phone-btn>${t('phone.close')}</button>
          </div>
          <div class="ph-msgs">${bubbles}</div>
          <div class="ph-input">${t('phone.messagePlaceholder')}</div>
        </div>
      </div>`;
  }
  function briefPhone() {
    const opps = D.opportunities.slice(0, 3).map((o, i) => `${i + 1}. ${o.who} — ${o.why}`).join('\n');
    return phoneOverlay({
      name:'Rook',
      messages: [{
        from:'ai', time: D.merchant.now,
        text: `${D.brief.headline}\n\n${D.brief.body}\n\n${t('brief.topThree')}\n${opps}\n\n${t('brief.openConsole')}`,
      }],
    }, {
      header: t('brief.phoneHeader'),
      note: t('brief.phoneNote'),
      aria: t('brief.phoneAria'),
    });
  }

  // ---------- simulation ----------
  function runSimulation() {
    if (state.simRunning) return;
    state.simRunning = true;
    const token = ++state.simToken;
    const sim = D.simulation;
    state.simConvo = {
      id:'v-sim', name: sim.name, channel: sim.channel, customerLine: sim.customerLine,
      preview: t('sim.livePlaying'), time: D.merchant.now, unread: true,
      aiStatus:'ai', score: 58, intent:'Booking inquiry',
      fields: sim.fields, handoff: null, nextAction: sim.nextAction,
      messages: [],
    };
    state.convId ='v-sim';
    state.mobilePane ='thread';
    render();
    let i = 0;
    const step = () => {
      if (token!== state.simToken) return; // industry switched or replay — abandon
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
      if (s.from ==='typing') {
        state.simConvo.messages.push({ from:'typing' });
        render();
        setTimeout(() => {
          if (token!== state.simToken) return;
          state.simConvo.messages = state.simConvo.messages.filter((m) => m.from!=='typing');
          step();
        }, 1100);
        return;
      }
      setTimeout(() => {
        if (token!== state.simToken) return;
        state.simConvo.messages.push({ from: s.from, text: s.text, cite: s.cite, time: D.merchant.now });
        render();
        step();
      }, s.delay);
    };
    step();
  }

  // ---------- Customers ----------
  const LIFECYCLES = ['All','New lead','Evaluating','Converted','Active','VIP','Dormant','Churn risk'];
  const lcClass = (lc) => ({'Churn risk':'churn','New lead':'lead' }[lc] || lc);
  function taskCentre() {
    return `
      <h2 class="sec">${t('customers.taskCentre')}</h2>
      <div class="card" style="padding:8px 16px">
        ${D.tasks.map((tk) => `
          <div class="task-row ${tk.status}">
            <span class="task-dot"></span>
            <span class="task-title">${esc(tk.title)}</span>
            <span class="tagchip">${esc(tk.source)}</span>
            <span class="task-meta">${esc(tk.who)} · ${esc(tk.due)}</span>
          </div>`).join('')}
      </div>`;
  }

  function vCustomers() {
    if (state.custId) return vCustomerDetail(D.customers.find((c) => c.id === state.custId));
    const chFiltered = state.custChannel? D.customers.filter((c) => c.channel === state.custChannel): D.customers;
    const rows = chFiltered
.filter((c) => state.custFilter ==='All' || c.lifecycle === state.custFilter)
.sort((a, b) => b.ltv - a.ltv);
    return `
      ${taskCentre()}
      <h2 class="sec">${t('customers.base')}</h2>
      ${state.custChannel? `<div style="margin-bottom:10px"><button class="fbtn on" data-clear-channel>${t('customers.sourceChip', { channel: chLabel(state.custChannel), n: chFiltered.length })} ✕</button></div>`:''}
      <div class="filters">${LIFECYCLES.map((f) => {
        const n = f ==='All'? chFiltered.length: chFiltered.filter((c) => c.lifecycle === f).length;
        return `<button class="fbtn ${state.custFilter === f?'on':''}" data-filter="${f}">${lcLabel(f)} · ${n}</button>`;
      }).join('')}</div>
      <div class="card tbl-wrap" style="padding:6px 10px">
      <table class="tbl">
        <thead><tr><th>${t('customers.tableCustomer')}</th><th>${t('customers.tableStage')}</th><th>${t('customers.tableTags')}</th><th>${t('customers.tableSource')}</th><th class="num">${t('customers.tableVisits')}</th><th class="num">${t('customers.tableLtv')}</th><th>${t('customers.tableLastVisit')}</th><th>${t('customers.tableNextDue')}</th></tr></thead>
        <tbody>
        ${rows.map((c) => `
          <tr class="rowbtn" data-cust="${c.id}">
            <td><b>${esc(c.name)}</b><br><span style="color:var(--muted);font-size:12px">${esc(c.phone)} · ${c.lang}</span></td>
            <td><span class="lc ${lcClass(c.lifecycle)}">${lcLabel(c.lifecycle)}</span></td>
            <td>${c.tags.map((tg) => `<span class="tagchip">${esc(tg)}</span>`).join('')}</td>
            <td>${chLabel(c.channel)}</td>
            <td class="num">${c.visits}</td>
            <td class="num">${c.ltv? money(c.ltv):'—'}</td>
            <td>${fmtRel(c.lastVisit)}</td>
            <td>${c.nextDue? fmtRel(c.nextDue):'—'}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`;
  }
  function vCustomerDetail(c) {
    const timeline = (D.timelines && D.timelines[c.id]) || [
      { time: c.lastVisit || daysAgoIso(30), kind:'visit', text: `${esc(c.pref)} — ${t('customers.timelineDefault1')}` },
      { time: daysAgoIso(45), kind:'ai', text: t('customers.timelineDefault2') },
      { time: daysAgoIso(70), kind:'campaign', text: t('customers.timelineDefault3') },
    ];
    return `
      <button class="btn sm" data-back-cust>${t('customers.backAll')}</button>
      <div class="grid c2 cust-detail" style="margin-top:12px">
        <div class="card">
          <h4 style="margin:0 0 2px;font-size:16px">${esc(c.name)} <span class="lc ${lcClass(c.lifecycle)}">${lcLabel(c.lifecycle)}</span></h4>
          <div style="color:var(--muted);font-size:12.5px;margin-bottom:12px">${esc(c.phone)} · ${t('customers.prefers')} ${c.lang ==='ZH'?'中文':'English'} · ${t('customers.via')} ${chLabel(c.channel)}</div>
          <dl class="kv">
            <dt>${t('customers.ltv')}</dt><dd>${c.ltv? money(c.ltv):'—'}</dd>
            <dt>${t('customers.visits')}</dt><dd>${c.visits}</dd>
            <dt>${t('customers.usualService')}</dt><dd>${esc(c.pref)}</dd>
            <dt>${t('customers.lastVisit')}</dt><dd>${fmtRel(c.lastVisit)}</dd>
            <dt>${t('customers.nextDue')}</dt><dd>${c.nextDue? fmtRel(c.nextDue):'—'}</dd>
            <dt>${t('customers.consent')}</dt><dd>${c.consent? t('customers.consentYes'): t('customers.consentNo')}</dd>
            <dt>${t('customers.tags')}</dt><dd>${c.tags.map((tg) => `<span class="tagchip">${esc(tg)}</span>`).join('')}</dd>
          </dl>
        </div>
        <div class="card">
          <h4 style="margin:0 0 6px">${t('customers.timeline')}</h4>
          <ul class="timeline">
            ${timeline.map((tl) => `<li><time>${fmtRel(tl.time)} · ${esc(tl.kind)}</time>${tl.text}</li>`).join('')}
          </ul>
        </div>
      </div>`;
  }
  const daysAgoIso = (d) => new Date(NOW - d * 864e5).toISOString();

  // ---------- Marketing ----------
  function vMarketing() {
    const st = (c) => state.campaign[c.id] || c.status;
    const active = D.campaigns.filter((c) => st(c)!=='completed');
    const past = D.campaigns.filter((c) => st(c) ==='completed');
    return `
      <h2 class="sec">${t('marketing.needsDecision')}</h2>
      ${active.map((c) => campHtml(c, st(c))).join('')}
      <h2 class="sec">${t('marketing.recentlyCompleted')}</h2>
      ${past.map((c) => campHtml(c,'completed')).join('')}
      ${referralSection()}`;
  }
  function referralSection() {
    const r = D.referrals;
    return `
      <h2 class="sec">${t('referral.heading')}</h2>
      <div class="grid c2" style="align-items:start">
        <div class="card">
          <div class="est" style="margin-top:0">
            ${r.stats.map((s) => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}
          </div>
          <p style="font-size:12.5px;color:var(--ink-2);margin:12px 0 8px;max-width:64ch">${esc(r.rule)}</p>
          <span class="tagchip" style="font-variant-numeric:tabular-nums">${esc(r.link)} ${t('referral.linkNote')}</span>
        </div>
        <div class="card tbl-wrap" style="padding:6px 10px">
          <table class="tbl">
            <thead><tr><th>${t('referral.topReferrers')}</th><th class="num">${t('referral.referred')}</th><th class="num">${t('referral.booked')}</th><th class="num">${t('referral.revenue')}</th><th>${t('referral.note')}</th></tr></thead>
            <tbody>${r.top.map((rf) => `<tr><td><b>${esc(rf.name)}</b></td><td class="num">${rf.referred}</td><td class="num">${rf.booked}</td><td class="num">${rf.revenue? money(rf.revenue):'—'}</td><td style="color:var(--ink-2)">${esc(rf.note)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  }
  const CAMP_STATUS_KEY = { pending:'status.pending', scheduled:'status.scheduled', completed:'status.completed' };
  function campHtml(c, status) {
    const est = c.estimate? `
      <div class="est">
        <div><b>${c.estimate.reach}</b><span>${t('marketing.reach')}</span></div>
        <div><b>${c.estimate.bookings}</b><span>${t('marketing.estBookings')}</span></div>
        <div><b>${c.estimate.revenue}</b><span>${t('marketing.estRevenue')}</span></div>
        <div><b>${c.estimate.cost}</b><span>${t('marketing.sendCost')}</span></div>
      </div>`:'';
    const res = c.results? `
      <div class="est">
        <div><b>${c.results.sent}</b><span>${t('marketing.sent')}</span></div>
        <div><b>${c.results.replies}</b><span>${t('marketing.replies')}</span></div>
        <div><b>${c.results.bookings}</b><span>${t('marketing.bookings')}</span></div>
        <div><b>${money(c.results.revenue)}</b><span>${t('marketing.revenue')}</span></div>
        <div><b>${c.results.roi}</b><span>${t('marketing.roi')}</span></div>
        <div><b>${c.results.unsubs}</b><span>${t('marketing.unsubscribes')}</span></div>
      </div>`:'';
    return `
      <div class="camp">
        <div class="head"><b>${esc(c.name)}</b><span class="status ${status}">${t(CAMP_STATUS_KEY[status] || status)}</span></div>
        <dl class="row">
          <dt>${t('marketing.trigger')}</dt><dd>${esc(c.trigger)}</dd>
          <dt>${t('marketing.audience')}</dt><dd>${esc(c.audience)}</dd>
          <dt>${t('marketing.schedule')}</dt><dd>${esc(c.schedule)} · ${esc(c.channel)}</dd>
        </dl>
        <div class="copy">“${esc(c.copy)}”</div>
        ${est}${res}
        ${status ==='pending'? `
          <div class="actions">
            <button class="btn pri" data-approve-camp="${c.id}">${t('marketing.approveSchedule')}</button>
            <button class="btn">${t('marketing.editAudience')}</button>
            <button class="btn">${t('marketing.skipWeek')}</button>
          </div>`:''}
      </div>`;
  }

  // ---------- Reputation ----------
  function vReputation() {
    const cx = D.cxSummary;
    return `
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat"><b>${cx.rating} ★</b><span>${t('reputation.googleRating', { n: cx.count })}</span></div>
        <div class="stat"><b>${cx.invited30d}</b><span>${t('reputation.invites30')}</span></div>
        <div class="stat"><b>${cx.received30d}</b><span>${t('reputation.new30')}</span></div>
        <div class="stat"><b>${cx.openTickets}</b><span>${t('reputation.openTickets')}</span></div>
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div>
          <h2 class="sec">${t('reputation.latestReviews')}</h2>
          ${D.reviews.map(revHtml).join('')}
        </div>
        <div>
          <h2 class="sec">${t('reputation.whatCustomersTalk')}</h2>
          <div class="card">
            ${cx.themes.map((th) => `
              <div class="theme-row ${th.tone ==='warn'?'warn': th.tone ==='bad'?'bad':''}">
                <span style="min-width:180px">${esc(th.theme)}</span>
                <span class="bar" style="width:${th.n * 16}px"></span>
                <span class="n">${th.n}</span>
              </div>`).join('')}
            <p style="font-size:12px;color:var(--muted);margin:10px 0 0">${esc(cx.note)}</p>
          </div>
        </div>
      </div>`;
  }
  function revHtml(r) {
    const posted = r.replyStatus ==='posted' || state.reviewPosted[r.id];
    return `
      <div class="rev ${r.rating <= 3?'neg':''}">
        <div class="head"><b>${esc(r.name)}</b>
          <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          <span style="color:var(--muted);font-size:12px">${esc(r.source)} · ${fmtRel(r.time)}</span>
        </div>
        <p class="txt">${esc(r.text)}</p>
        ${r.linked? `<p style="font-size:12px;color:var(--serious);margin:0 0 8px"><b>${t('reputation.linked')}</b> · ${esc(r.linked)}</p>`:''}
        <div class="reply"><span class="lbl">${posted? t('reputation.replyPosted'): t('reputation.replyDrafted')}</span>${esc(r.reply)}</div>
        ${posted?'': `<div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn sm pri" data-post-reply="${r.id}">${t('reputation.approvePost')}</button>
          <button class="btn sm">${t('reputation.edit')}</button>
        </div>`}
      </div>`;
  }

  // ---------- Social & Brand ----------
  const stChip = (s) => {
    const map = { scheduled:['ai','social.scheduled'], linked:['st-linked','social.linkedToCampaign'],
      held:['human','social.heldApproval'], idea:['','social.idea'] };
    const m = map[s];
    return m? `<span class="tagchip ${m[0]}">${t(m[1])}</span>`:'';
  };
  const KLASS_KEY = { Complaint:['human','klass.complaint'], Spam:['','klass.spam'], Partnership:['st-linked','klass.partnership'],
    FAQ:['','klass.faq'],'Price inquiry':['ai','klass.priceInquiry'],'High intent':['ai','klass.highIntent'] };
  const klassChip = (k) => {
    const m = KLASS_KEY[k];
    return m? `<span class="tagchip ${m[0]}">${t(m[1])}</span>`: `<span class="tagchip">${esc(k)}</span>`;
  };
  function vSocial() {
    const s = D.social;
    return `
      <div class="grid c2" style="align-items:start">
        <div>
          <h2 class="sec">${t('social.contentCalendar')}</h2>
          <div class="card" style="padding:8px 16px">
            ${s.calendar.map((c) => `
              <div class="cal-row">
                <span class="cal-day">${esc(c.day)}<em>${esc(c.time)}</em></span>
                <div class="cal-body"><b>${esc(c.title)}</b>
                  <span>${esc(c.channel)}${c.note?' ·' + esc(c.note):''}</span></div>
                ${stChip(c.status)}
              </div>`).join('')}
          </div>
          <h2 class="sec">${t('social.assets')}</h2>
          <div class="card">
            <ul class="strategy" style="margin:0;padding-left:18px">${s.assets.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
          </div>
        </div>
        <div>
          <h2 class="sec">${t('social.whatDrives')}</h2>
          ${s.posts.map((p) => `
            <div class="card" style="margin-bottom:10px">
              <b>${esc(p.title)}</b> <span style="color:var(--muted);font-size:12px">· ${esc(p.when)}</span>
              <div class="est" style="margin-top:8px">
                <div><b>${esc(p.reach)}</b><span>${t('social.reach')}</span></div>
                <div><b>${p.saves}</b><span>${t('social.saves')}</span></div>
                <div><b>${p.inquiries}</b><span>${t('social.inquiries')}</span></div>
                <div><b>${p.bookings}</b><span>${t('social.bookings')}</span></div>
                <div><b>${money(p.revenue)}</b><span>${t('social.revenue')}</span></div>
              </div>
              ${p.flag? `<p style="margin:8px 0 0;font-size:12.5px;color:var(--accent-soft-ink)"><b>${t('social.insight')}</b> · ${esc(p.flag)}</p>`:''}
            </div>`).join('')}
          <h2 class="sec">${t('social.commentsDms')}</h2>
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
  const AUDIT_KEY = { ai:['ai','audit.ai'], check:['st-good','audit.check'], handoff:['human','audit.handoff'],
    denied:['esc','audit.denied'], change:['st-linked','audit.change'], data:['','audit.data'] };
  const auditTag = (tag) => {
    const m = AUDIT_KEY[tag];
    return m? `<span class="tagchip ${m[0]}">${t(m[1])}</span>`:'';
  };
  function vTrust() {
    const tr = D.trust;
    return `
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        ${tr.stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span><div class="kpi-delta" style="color:var(--muted)">${esc(s.sub)}</div></div>`).join('')}
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div>
          <h2 class="sec">${t('trust.auditTrail')}</h2>
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
          <h2 class="sec">${t('trust.whoCanDo')}</h2>
          <div class="card tbl-wrap" style="padding:6px 10px">
            <table class="tbl">
              <thead><tr><th>${t('trust.person')}</th><th>${t('trust.role')}</th><th>${t('trust.permissions')}</th></tr></thead>
              <tbody>${tr.roles.map((r) => `<tr><td><b>${esc(r.who)}</b></td><td>${esc(r.role)}</td><td style="color:var(--ink-2)">${esc(r.can)}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <h2 class="sec">${t('trust.whyExists')}</h2>
          <div class="card">
            <p style="margin:0;font-size:13px;color:var(--ink-2);max-width:60ch">${t('trust.whyExistsBody')}</p>
          </div>
        </div>
      </div>`;
  }

  // ---------- Brain ----------
  function vBrain() {
    return `
      <div class="grid c2" style="align-items:start">
        <div>
          <h2 class="sec">${t('brain.knowledge')}</h2>
          ${D.knowledge.map((k) => `
            <div class="kb">
              <div class="head">
                <b>${esc(k.title)}</b>
                <span class="cat">${esc(k.category)}</span>
                ${k.sensitive? `<span class="lock">${t('brain.ownerGated')}</span>`:''}
                <span class="cites">${t('brain.cited', { n: k.cites30d })}</span>
              </div>
              <p>${esc(k.excerpt)}</p>
              <div class="meta">${esc(state.kbApproved[k.id] && k.approvedVersion? k.approvedVersion: k.version)} · ${t('brain.updatedBy', { rel: fmtRel(k.updated), owner: esc(k.owner) })}</div>
            </div>`).join('')}
        </div>
        <div>
          <h2 class="sec">${t('brain.gaps')}</h2>
          ${D.knowledgeGaps.map((g) => `
            <div class="kb gap">
              <b>“${esc(g.q)}”</b>
              <p>${t('brain.askedLast', { n: g.asked, rel: fmtRel(g.last) })} ${esc(g.note)}</p>
              <div style="margin-top:8px"><button class="btn sm" data-toast="${esc(t('brain.draftToast'))}">${t('brain.draftAnswer')}</button></div>
            </div>`).join('')}
          <h2 class="sec">${t('brain.howGrounding')}</h2>
          <div class="card">
            <p style="margin:0;font-size:13px;color:var(--ink-2);max-width:60ch">${t('brain.groundingBody')}</p>
          </div>
        </div>
      </div>`;
  }

  // ---------- Setup (onboarding walkthrough) ----------
  // setupStep milestones: 0 idle · 1-3 files upload · 4 building · 5-10 items
  // · 11 review note · 12 test Q · 13 typing · 14 answer · 15 live
  const SETUP_LAST = 15;
  function vSetup() {
    const ob = D.onboarding;
    const s = state.setupStep;
    const fileRows = ob.files.map((f, i) => s >= i + 1
? `<div class="ob-file done"><span class="ob-check">✓</span><div><b>${esc(f.name)}</b><span>${esc(f.desc)}</span></div></div>`
: `<div class="ob-file"><span class="ob-check"></span><div><b>${esc(f.name)}</b><span>${esc(f.desc)}</span></div></div>`).join('');
    const itemRows = ob.extracted.map((it, i) => s >= i + 5
? `<div class="ob-item"><span class="ob-check">✓</span><span>${esc(it.title)}</span><span class="ob-cat">${esc(it.cat)}</span></div>`:'').join('');
    const chat = s >= 12? `
      <div class="msgs" style="padding:10px 2px 2px">
        <div class="msg cust">${esc(ob.testQ)}</div>
        ${s === 13?'<div class="typing"><i></i><i></i><i></i></div>':''}
        ${s >= 14? `<div class="msg ai">${esc(ob.testA)}<br><span class="cite"><span class="cite-k">${t('msg.source')}</span>${esc(ob.testCite)}</span></div>`:''}
      </div>`:'';
    return `
      <div class="card brief">
        <h3>${t('setup.heading')}</h3>
        <p>${esc(ob.intro)}</p>
        <div style="margin-top:12px">
          <button class="btn pri" data-setup-play ${state.setupPlaying?'disabled':''}>${s > 0 &&!state.setupPlaying? '↻ ' + t('setup.replay'): state.setupPlaying? t('setup.playing'): '▶ ' + t('setup.play')}</button>
        </div>
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div class="card ob-stage ${s >= 1?'on':''}">
          <div class="ob-num">1</div><h3>${t('setup.step1Title')}</h3>
          <p class="ob-sub">${t('setup.step1Sub')}</p>
          ${fileRows}
        </div>
        <div class="card ob-stage ${s >= 4?'on':''}">
          <div class="ob-num">2</div><h3>${t('setup.step2Title')}</h3>
          <p class="ob-sub">${s === 4? t('setup.step2Reading'): s > 4? t('setup.step2Extracted'): t('setup.waitsFor1')}</p>
          ${itemRows}
        </div>
        <div class="card ob-stage ${s >= 11?'on':''}">
          <div class="ob-num">3</div><h3>${t('setup.step3Title')}</h3>
          <p class="ob-sub">${s >= 11? esc(ob.review): t('setup.waitsFor2')}</p>
          ${chat}
        </div>
        <div class="card ob-stage ${s >= 15?'on':''}">
          <div class="ob-num">4</div><h3>${t('setup.step4Title')}</h3>
          <p class="ob-sub">${s >= 15? esc(ob.live): t('setup.waitsFor3')}</p>
          ${s >= 15? `<div style="margin-top:10px"><span class="tagchip ai">● ${t('setup.liveNow')}</span></div>`:''}
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
      if (token!== state.setupToken) return;
      if (state.setupStep >= SETUP_LAST) {
        state.setupPlaying = false;
        render();
        toast(t('setup.doneToast'));
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
    return `<details class="dtable"><summary>${t('insights.viewTable')}</summary>
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
          <h3>${t('insights.leadsBookingsTitle')}</h3>
          <div class="sub">${t('insights.leadsBookingsSub')}</div>
          ${lineChart()}
          ${dataTable([t('insights.colDate'), t('insights.colLeads'), t('insights.colBookings')], D.metrics.map((m) => [m.date, m.leads, m.bookings]))}
        </div>
        <div class="card chart-card">
          <h3>${t('insights.funnelTitle')}</h3>
          <div class="sub">${t('insights.funnelSub')}</div>
          ${funnelChart()}
          ${dataTable([t('insights.colStage'), t('insights.colCount'), t('insights.colPctPrev')], D.funnel.map((f, i) => [f.stage, f.n, i? Math.round((f.n / D.funnel[i - 1].n) * 100) +'%':'—']))}
        </div>
        <div class="card chart-card">
          <h3>${t('insights.channelTitle')}</h3>
          <div class="sub">${t('insights.channelSub')}</div>
          ${channelChart()}
          ${dataTable([t('insights.colChannel'), t('insights.colLeads'), t('insights.colBooked'), t('insights.colRate')], D.channels.map((c) => [chLabel(c.name), c.leads, c.booked, Math.round((c.booked / c.leads) * 100) +'%']))}
        </div>
        <div class="card chart-card">
          <h3>${t('insights.forecastTitle')}</h3>
          <div class="sub">${t('insights.forecastSub')}</div>
          ${forecastChart()}
          ${dataTable([t('insights.colDay'), t('insights.colLow'), t('insights.colExpected'), t('insights.colHigh')], D.forecast.map((f) => [f.day, f.lo, f.mid, f.hi]))}
        </div>
        <div class="card chart-card">
          <h3>${t('insights.servicesTitle')}</h3>
          <div class="sub">${t('insights.servicesSub')}</div>
          ${servicesChart()}
          ${dataTable([t('insights.colService'), t('insights.colBookings'), t('insights.colRevenue')], D.topServices.map((s) => [s.name, s.bookings, money(s.revenue)]))}
        </div>
        <div class="card chart-card">
          <h3>${esc(D.teamCompare.title)}</h3>
          <div class="sub">The RFP's store-comparison insight, at single-merchant scale</div>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr>${D.teamCompare.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${D.teamCompare.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i?'num':''}">${i === 0?'<b>' + esc(c) +'</b>': esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
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
    const path = (key) => data.map((d, i) => `${i?'L':'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join('');
    const grid = [0, Math.round(maxY / 2), maxY].map((v) => `
      <line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>
      <text x="${L - 5}" y="${y(v) + 3.5}" text-anchor="end">${v}</text>`).join('');
    const last = data[data.length - 1];
    const ticks = [0, 9, 19, 29].map((i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${data[i].date.slice(5).replace('-','/')}</text>`).join('');
    return `
      <svg class="viz" viewBox="0 0 ${W} ${H}" id="linechart">
        ${grid}
        <line class="axis" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>
        ${ticks}
        <path d="${path('leads')}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>
        <path d="${path('bookings')}" fill="none" stroke="#1baf7a" stroke-width="2"/>
        <circle cx="${x(data.length - 1)}" cy="${y(last.leads)}" r="3.5" fill="var(--chart-1)"/>
        <circle cx="${x(data.length - 1)}" cy="${y(last.bookings)}" r="3.5" fill="#1baf7a"/>
        <text class="val" x="${x(data.length - 1) - 8}" y="${y(last.leads) - 8}" text-anchor="end" fill="var(--chart-1)">${t('chart.leadsLegend')}</text>
        <text class="val" x="${x(data.length - 1) - 8}" y="${y(last.bookings) + 14}" text-anchor="end" fill="#1baf7a">${t('chart.bookingsLegend')}</text>
        <line id="xhair" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--chart-axis)" stroke-width="1" style="display:none"/>
        <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" id="linehit"/>
      </svg>
      <div style="display:flex;gap:14px;font-size:11.5px;color:var(--muted)">
        <span><span class="dot" style="background:var(--chart-1)"></span> ${t('chart.leadsLegend')}</span>
        <span><span class="dot" style="background:#1baf7a"></span> ${t('chart.bookingsLegend')}</span>
      </div>`;
  }

  function funnelChart() {
    const W = 460, rowH = 30, gap = 6, L = 78, R = 46;
    const max = D.funnel[0].n;
    const colors = ['var(--funnel-1)','var(--funnel-2)','var(--funnel-3)','var(--funnel-4)','var(--funnel-5)'];
    const H = D.funnel.length * (rowH + gap) + 4;
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">
      ${D.funnel.map((f, i) => {
        const w = Math.max(6, (f.n / max) * (W - L - R));
        const yy = i * (rowH + gap);
        const conv = i > 0? Math.round((f.n / D.funnel[i - 1].n) * 100) +'%':'';
        return `
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${f.stage}</text>
          <rect x="${L}" y="${yy}" width="${w}" height="${rowH - 8}" rx="4" fill="${colors[i]}" data-tip="${f.stage}: ${f.n}${conv? t('chart.funnelTipSuffix', { pct: conv }):''}"/>
          <text class="val" x="${L + w + 7}" y="${yy + rowH / 2 - 1}">${f.n}</text>
          ${conv? `<text x="${L + w + 7}" y="${yy + rowH / 2 + 11}" font-size="9.5">${conv} →</text>`:''}`;
      }).join('')}
    </svg>`;
  }

  const DRILL_MAP = {'QR / walk-in':'QR code','Vet-clinic QR':'QR code' };
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
        const name = chLabel(c.name);
        return `
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${name}</text>
          <rect class="drillable" x="${L}" y="${yy}" width="${wAll}" height="${rowH - 8}" rx="4" fill="var(--funnel-1)" data-drill="${drill}" data-tip="${t('chart.channelLeadsTip', { name, n: c.leads })}"/>
          <rect class="drillable" x="${L}" y="${yy}" width="${wBook}" height="${rowH - 8}" rx="4" fill="var(--funnel-4)" data-drill="${drill}" data-tip="${t('chart.channelBookedTip', { name, n: c.booked, rate })}"/>
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
    const band = data.map((d, i) => `${i?'L':'M'}${x(i).toFixed(1)},${y(d.hi).toFixed(1)}`).join('') +
      data.slice().reverse().map((d, i) => `L${x(data.length - 1 - i).toFixed(1)},${y(d.lo).toFixed(1)}`).join('') +'Z';
    const mid = data.map((d, i) => `${i?'L':'M'}${x(i).toFixed(1)},${y(d.mid).toFixed(1)}`).join('');
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">
      ${[0, midY, maxY].map((v) => `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 5}" y="${y(v) + 3.5}" text-anchor="end">${v}</text>`).join('')}
      <path d="${band}" fill="var(--chart-1)" opacity="0.16"/>
      <path d="${mid}" fill="none" stroke="var(--chart-1)" stroke-width="2"/>
      ${data.map((d, i) => `
        <circle cx="${x(i)}" cy="${y(d.mid)}" r="3.2" fill="var(--chart-1)" data-tip="${t('chart.forecastTip', { day: d.day, n: d.mid, lo: d.lo, hi: d.hi })}"/>
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
    { view:'today', n: 1 }, { view:'inbox', n: 2 }, { view:'inbox', n: 3 }, { view:'customers', n: 4 },
    { view:'marketing', n: 5 }, { view:'social', n: 6 }, { view:'trust', n: 7 }, { view:'insights', n: 8 },
    { view:'setup', n: 9 },
  ];
  function tourCard() {
    const s = TOUR[state.tour - 1];
    return `
      <div class="tour" role="dialog" aria-label="${t('tour.aria')}">
        <div class="tour-step">${state.tour} / ${TOUR.length}</div>
        <b>${t('tour.step' + s.n + '.title')}</b>
        <p>${t('tour.step' + s.n + '.text')}</p>
        <div class="tour-actions">
          <button class="btn sm" data-tour-end>${t('tour.endTour')}</button>
          <span class="spacer"></span>
          ${state.tour > 1? `<button class="btn sm" data-tour-back>${t('tour.back')}</button>`:''}
          <button class="btn sm pri" data-tour-next>${state.tour === TOUR.length? t('tour.done'): t('tour.next')}</button>
        </div>
      </div>`;
  }

  // ---------- chrome ----------
  function renderSide() {
    const unread = D.conversations.filter((c) => c.unread).length;
    $('#side').innerHTML = `
      <div class="logo"><div class="logo-row"><span class="mark" aria-hidden="true">♜</span><b>Rook</b></div><span class="logo-tag">${t('logo.tagline')}</span></div>
      ${NAV_IDS.map((id) => `
        <button class="nav-btn ${state.view === id?'on':''}" data-nav="${id}">
          ${IC[id]}${t('nav.' + id)}
          ${id ==='inbox' && unread? `<span class="bdg">${unread}</span>`:''}
        </button>`).join('')}
      <div class="side-foot"><b>${esc(D.merchant.name)}</b><br>${esc(D.merchant.address)}<br>${esc(D.merchant.hours)}</div>`;
    $('#tabbar').innerHTML = NAV_IDS.map((id) => `
      <button class="${state.view === id?'on':''}" data-nav="${id}">${IC[id]}${t('nav.' + id)}</button>`).join('');
  }
  function renderTop() {
    $('#topbar').innerHTML = `
      <h1>${t('title.' + state.view)}</h1>
      <span class="sub">${esc(D.merchant.name)} · ${esc(D.merchant.tagline)}</span>
      <div class="spacer"></div>
      <div class="top-right">
        <div class="seg" role="group" aria-label="${t('aria.langGroup')}">
          <button class="${state.lang ==='en'?'on':''}" data-lang="en">EN</button>
          <button class="${state.lang ==='zh-Hant'?'on':''}" data-lang="zh-Hant">繁中</button>
          <button class="${state.lang ==='zh-Hans'?'on':''}" data-lang="zh-Hans">简中</button>
        </div>
        <div class="seg" role="group" aria-label="${t('aria.industryGroup')}">
          ${INDUSTRIES.map((ind) => `<button class="${state.industry === ind.id?'on':''}" data-industry="${ind.id}">${t('industry.' + ind.id)}</button>`).join('')}
        </div>
        <button class="btn sm" data-tour-start>${state.tour? '● ' + t('tour.running'): '▶ ' + t('tour.button')}</button>
        <span class="chip time">${esc(D.merchant.nowLabel)}</span>
        <span class="chip sim">${t('sim.badge')}</span>
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
    if (lastView!== state.view) {
      void el.offsetWidth; // restart the animation
      el.classList.add('enter');
    }
    lastView = state.view;
    const back = $('#view [data-back]');
    if (back && window.innerWidth <= 760) back.style.display ='inline-block';
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
    state.simToken++; // cancel any running simulation
    state.setupToken++; // cancel any running onboarding playback
    state.simConvo = null;
    state.simRunning = false;
    state.setupStep = 0;
    state.setupPlaying = false;
    state.convId = D.conversations[0].id;
    state.custId = null;
    state.custFilter ='All';
    state.mobilePane ='list';
    state.phoneView = null;
    render();
    toast(t('toast.switchedTemplate', { industry: t(id ==='pets'?'industry.pets':'industry.beauty') }));
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const closePhone = e.target.closest('[data-close-phone-btn]') ||
      (e.target.classList && e.target.classList.contains('phone-ovl')? e.target: null);
    if (closePhone) { state.phoneView = null; render(); return; }
    const el = e.target.closest('[data-nav],[data-conv],[data-open-conv],[data-takeover],[data-simulate],[data-approve],[data-hold],[data-approve-camp],[data-post-reply],[data-filter],[data-cust],[data-back-cust],[data-back],[data-toast],[data-industry],[data-lang],[data-phone],[data-setup-play],[data-brief-phone],[data-tour-start],[data-tour-next],[data-tour-back],[data-tour-end],[data-drill],[data-clear-channel]');
    if (!el) return;
    if (el.dataset.industry) switchIndustry(el.dataset.industry);
    else if (el.dataset.lang) { if (state.lang!== el.dataset.lang) { state.lang = el.dataset.lang; document.documentElement.lang = state.lang; render(); } }
    else if (el.dataset.tourStart!== undefined) { state.tour = 1; state.view = TOUR[0].view; render(); window.scrollTo(0, 0); }
    else if (el.dataset.tourNext!== undefined) {
      if (state.tour >= TOUR.length) { state.tour = 0; render(); toast(t('tour.doneToast')); }
      else { state.tour++; state.view = TOUR[state.tour - 1].view; render(); window.scrollTo(0, 0); }
    }
    else if (el.dataset.tourBack!== undefined) { state.tour = Math.max(1, state.tour - 1); state.view = TOUR[state.tour - 1].view; render(); window.scrollTo(0, 0); }
    else if (el.dataset.tourEnd!== undefined) { state.tour = 0; render(); }
    else if (el.dataset.briefPhone!== undefined) { state.phoneView ='brief'; render(); }
    else if (el.dataset.nav) { state.view = el.dataset.nav; state.custId = null; state.custChannel = null; state.mobilePane ='list'; state.phoneView = null; render(); window.scrollTo(0, 0); }
    else if (el.dataset.drill) { state.view ='customers'; state.custId = null; state.custFilter ='All'; state.custChannel = el.dataset.drill; render(); window.scrollTo(0, 0); }
    else if (el.dataset.clearChannel!== undefined) { state.custChannel = null; render(); }
    else if (el.dataset.conv) { state.convId = el.dataset.conv; state.mobilePane ='thread'; render(); }
    else if (el.dataset.openConv) { state.view ='inbox'; state.convId = el.dataset.openConv; state.mobilePane ='thread'; render(); window.scrollTo(0, 0); }
    else if (el.dataset.back!== undefined && el.dataset.back ==='') { state.mobilePane ='list'; render(); }
    else if (el.dataset.phone!== undefined && el.dataset.phone ==='') { state.phoneView ='conv'; render(); }
    else if (el.dataset.setupPlay!== undefined) runSetup();
    else if (el.dataset.takeover) {
      const id = el.dataset.takeover;
      const c = getConv(id);
      state.aiPaused[id] =!state.aiPaused[id];
      c.messages.push({ from:'sys', text: state.aiPaused[id]? t('toast.takenOverSys'): t('toast.handedBackSys') });
      toast(state.aiPaused[id]? t('toast.aiPausedToast'): t('toast.aiResumedToast'));
      render();
    }
    else if (el.dataset.simulate!== undefined) runSimulation();
    else if (el.dataset.approve) {
      const a = D.approvals.find((x) => x.id === el.dataset.approve);
      state.done[a.id] = true;
      if (a.action.campaign) state.campaign[a.action.campaign] ='scheduled';
      if (a.action.review) state.reviewPosted[a.action.review] = true;
      if (a.action.knowledge) state.kbApproved[a.action.knowledge] = true;
      toast(a.toast);
      render();
    }
    else if (el.dataset.hold) { state.done[el.dataset.hold] = true; toast(t('toast.held')); render(); }
    else if (el.dataset.approveCamp) {
      const cid = el.dataset.approveCamp;
      state.campaign[cid] ='scheduled';
      const a = D.approvals.find((x) => x.action.campaign === cid);
      if (a) state.done[a.id] = true;
      toast(t('toast.campaignApproved'));
      render();
    }
    else if (el.dataset.postReply) {
      const rid = el.dataset.postReply;
      state.reviewPosted[rid] = true;
      const a = D.approvals.find((x) => x.action.review === rid);
      if (a) state.done[a.id] = true;
      toast(t('toast.replyPostedGoogle'));
      render();
    }
    else if (el.dataset.filter) { state.custFilter = el.dataset.filter; render(); }
    else if (el.dataset.cust) { state.custId = el.dataset.cust; render(); window.scrollTo(0, 0); }
    else if (el.dataset.backCust!== undefined) { state.custId = null; render(); }
    else if (el.dataset.toast) toast(el.dataset.toast);
  });

  // ---------- chart hover ----------
  const tip = $('#tooltip');
  function bindHover() {
    document.querySelectorAll('[data-tip]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        tip.textContent = el.dataset.tip;
        tip.style.display ='block';
        tip.style.left = e.clientX +'px';
        tip.style.top = e.clientY +'px';
      });
      el.addEventListener('mouseleave', () => { tip.style.display ='none'; });
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
        xh.style.display ='block';
        const d = data[i];
        tip.textContent = `${d.date.slice(5).replace('-','/')} — ${d.leads} leads · ${d.bookings} bookings`;
        tip.style.display ='block';
        tip.style.left = e.clientX +'px';
        tip.style.top = e.clientY +'px';
      });
      hit.addEventListener('mouseleave', () => { xh.style.display ='none'; tip.style.display ='none'; });
    }
  }

  render();
})();
