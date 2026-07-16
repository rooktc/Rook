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
      'trust.pdpa.title':'PDPA & data protection (Singapore)',
      'trust.pdpa.sub':'How Rook is built to meet Singapore’s Personal Data Protection Act. Shown for buyer due-diligence — each obligation maps to a control in the product.',
      'trust.pdpa.k1':'Consent','trust.pdpa.v1':'No customer is messaged for marketing without recorded consent; every send checks consent and the Do-Not-Call registry first.',
      'trust.pdpa.k2':'Purpose limitation','trust.pdpa.v2':'Customer data is used only to answer that customer and manage their bookings — never sold or repurposed.',
      'trust.pdpa.k3':'Notification','trust.pdpa.v3':'At first contact, customers are told what is collected and why, with a link to the merchant’s privacy notice.',
      'trust.pdpa.k4':'Access & correction','trust.pdpa.v4':'Owners can export or correct any individual’s data on request; the audit trail logs every data request.',
      'trust.pdpa.k5':'Protection','trust.pdpa.v5':'Encrypted in transit and at rest, with role-based access — staff see only what their role allows.',
      'trust.pdpa.k6':'Retention','trust.pdpa.v6':'Data is kept only as long as needed for the relationship, then purged on a configurable schedule.',
      'trust.pdpa.k7':'Data residency','trust.pdpa.v7':'Customer personal data is stored in-region; any sub-processor (messaging or AI provider) is disclosed and bound to comparable protection.',
      'trust.pdpa.k8':'Breach response','trust.pdpa.v8':'A breach-notification process alerts the PDPC and affected individuals within the required timeframe.',
      'trust.pdpa.note':'Demo copy for illustration — not legal advice. Final controls are confirmed with the merchant in the pilot data-processing agreement.',
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
      'setup.uploadHeading':'Upload your documents','setup.dzTitle':'Drag files here, or click to browse',
      'setup.dzHint':'Price lists, menus, FAQs, chat screenshots, policies — PDF, Word or images, up to 25 MB each',
      'setup.dzEmpty':'Nothing uploaded yet. Add your files, or start from a sample set.',
      'setup.buildKb':'Build knowledge base','setup.building':'Building…',
      'setup.filesReady':'{n} file(s) ready','setup.useSample':'Use sample files','setup.removeFile':'Remove file',
      'brain.addDocs':'Add documents','aria.paletteGroup':'Colour theme',
      'palette.azure':'Azure','palette.indigo':'Indigo','palette.sky':'Sky',
      'demo.reset':'Reset demo','demo.resetHint':'Clear saved language, colour, branding and uploaded files, and reload',
      'setup.brandHeading':'Make it their business','setup.brandName':'Business name','setup.brandTagline':'Tagline','setup.brandOwner':'Owner first name',
      'setup.brandSub':'Set the shop name, tagline and owner so a prospect sees their own brand across the whole console. Applies live; nothing leaves the browser.',
      'setup.brandApply':'Apply branding','setup.brandReset':'Reset to sample',
      'setup.brandToast':'Branding applied across the console','setup.brandResetToast':'Branding reset to the sample business',
      'intro.aria':'Welcome to Rook','intro.title':'A 24/7 AI growth team for your shop',
      'intro.body':'Rook answers customer messages, follows up on leads, handles reviews and runs campaigns — grounded in your own prices and policies, with you approving anything sensitive. This is the owner’s console.',
      'intro.b1t':'Switch industry.','intro.b1':'Top bar — the same console configured for a beauty studio or a mobile pet groomer.',
      'intro.b2t':'Switch language.','intro.b2':'English, Traditional or Simplified Chinese — interface and content both translate.',
      'intro.b3t':'Switch colour.','intro.b3':'Three blue themes via the dots in the top bar.',
      'intro.simNote':'Everything here is realistic but simulated demo data — no live messaging or real customers.',
      'intro.explore':'Explore on my own','intro.tour':'Take the 2-minute tour','intro.help':'About this demo',
      'ask.title':'Ask the assistant a question','ask.send':'Ask','ask.placeholder':'e.g. How much is a gel manicure?',
      'ask.sub':'Type anything a customer might ask. The AI answers only from this shop’s knowledge, cites its source, and hands off to staff instead of guessing when it doesn’t know.',
      'ask.escChip':'Handed to staff — the AI won’t guess',
      'ask.fallback':'I don’t have a confirmed answer for that in the shop’s knowledge, so I’ve passed it to the team — they’ll follow up with you personally.',
      'ask.b.price':'Our Classic Gel Manicure is $68, BIAB is $88, and Gel Extensions are $118. Your first visit gets 15% off (not stackable).',
      'ask.b.hours':'We’re open Tue–Sun, 10:30 AM–8:30 PM, and closed on Mondays.',
      'ask.b.book':'Happy to book you in — a $20 deposit holds the slot and comes off your final bill. What day works, and which service?',
      'ask.b.men':'Yes — we do men’s manicures and facials; around 1 in 5 of our manicure clients are men.',
      'ask.b.preg':'Lash and brow treatments are fine with a patch test, and we avoid certain facial acids during pregnancy. Please check with your doctor too — we can’t give medical assurances.',
      'ask.b.obj':'I understand. Our gel is a Japanese brand with free removal, and your first visit is 15% off — that often makes it better value than it first looks. Shall I hold a slot for you?',
      'ask.b.ex1':'How much is a gel manicure?','ask.b.ex2':'What time do you open on Sunday?','ask.b.ex3':'Do you do men’s facials?',
      'ask.p.price':'Grooming is priced by size and coat — a full groom runs about $78 for small dogs up to $138 for large dogs. Two or more pets at one address get 10% off.',
      'ask.p.vax':'For a first visit we’ll need proof of core vaccinations — just send a photo of the vaccination booklet after booking.',
      'ask.p.injury':'I’m so sorry to hear that. If there’s any bleeding, limping or distress, please watch closely and see a vet if it persists — I’m passing this to the owner right now to contact you.',
      'ask.p.sedation':'We never sedate, for the pet’s safety. Anxious, aggressive or senior pets need a quick groomer assessment call before we book.',
      'ask.p.zones':'We’re island-wide with two vans (north/west and north-east). Send your postal code and I’ll check the routing and offer a time window (Sentosa has a $15 surcharge).',
      'ask.p.deposit':'A $20 deposit confirms your van slot and is refundable up to 24 hours before. Unpaid holds auto-release after 12 hours.',
      'ask.p.ex1':'How much to groom a large dog?','ask.p.ex2':'Do you need vaccination records?','ask.p.ex3':'Which areas do you cover?',
      'print.export':'Export summary','print.title':'This week with Rook','print.subtitle':'AI Growth Team · weekly owner summary','print.foot':'Rook demo — simulated data. Generated',
      'insights.leadsBookingsTitle':'Leads & bookings — last 30 days',
      'insights.leadsBookingsSub':'Daily counts across all channels',
      'insights.funnelTitle':'Sales funnel — last 30 days','insights.funnelSub':'From first contact to repeat booking',
      'insights.channelTitle':'Leads by channel — last 30 days',
      'insights.channelSub':'Full bar = leads · dark segment = became bookings · click a bar to see those customers',
      'insights.forecastTitle':'Next 7 days — booking forecast',
      'insights.forecastSub':'Band = ±20% confidence · basis: 30-day history, campaigns, weather outlook',
      'insights.servicesTitle':'Top services by revenue — last 30 days','insights.servicesSub':'Bookings shown at right',
      'insights.viewTable':'View as table','insights.teamCompareSub':"The RFP's store-comparison insight, at single-merchant scale",'insights.colDate':'Date','insights.colLeads':'Leads',
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
      'nav.operations':'Operations','title.operations':'Operations — finance, materials, staff',
      'home.advisorTitle':'AI business advisor','home.viewInsights':'Full insights →',
      'home.kpiRevenue':'This month revenue','home.kpiBookings':"Today's bookings",
      'home.kpiFollowup':'To follow up','home.kpiRating':'Rating',
      'home.aiTasks':'AI operations tasks','home.taskTakeover':'Needs human takeover',
      'home.taskNegative':'Negative review to handle','home.openChat':'Open chat','home.openReview':'Open review',
      'ops.finance':'Finance','ops.materials':'Materials','ops.staff':'Staff',
      'ops.revenue':'Revenue','ops.expense':'Expense','ops.net':'Net profit','ops.margin':'Margin',
      'ops.periodDay':'Day','ops.periodMonth':'Month','ops.periodYear':'Year',
      'ops.revVsExp':'Revenue vs expense','ops.expenseBreakdown':'Expense breakdown — this month',
      'ops.recentTx':'Recent transactions','ops.txItem':'Item','ops.txAmount':'Amount',
      'ops.inventory':'Inventory','ops.purchases':'Purchase orders','ops.stock':'In stock',
      'ops.reorder':'Reorder at','ops.matStatus':'Status','ops.statusOk':'OK','ops.statusLow':'Low','ops.statusOut':'Out',
      'ops.reorderBtn':'Reorder','ops.reorderToast':'Purchase order drafted — sent to your supplier to confirm',
      'ops.poQty':'Qty','ops.poCost':'Cost','ops.poSupplier':'Supplier','ops.poStatus':'Status',
      'ops.poDelivered':'Delivered','ops.poOrdered':'Ordered','ops.poPending':'Pending',
      'ops.staffRole':'Role','ops.staffPay':'This-month pay','ops.staffShifts':'Shifts / wk',
      'ops.staffRating':'Avg rating','ops.staffRecords':'Work records','ops.roster':'Team',
      'ops.weeklyShifts':'This week’s shifts','ops.payrollTotal':'Total month payroll','ops.legendRev':'Revenue','ops.legendExp':'Expense',
      'cust.statTotal':'Total customers','cust.statActive':'Active','cust.statDormant':'Dormant','cust.statVip':'VIP',
      'cust.statLtv':'Total lifetime value','cust.statAvgLtv':'Avg per customer','cust.statVisits':'Total visits',
      'cust.bySource':'Customers by source',
      'mkt.wizardTitle':'AI content-publishing wizard','mkt.wizardSub':'Draft, edit and publish a post across platforms.',
      'mkt.goal':'Goal','mkt.audience':'Audience','mkt.content':'Content','mkt.platforms':'Publish to',
      'mkt.multiHint':'choose one or more','mkt.regenerate':'Regenerate','mkt.poster':'AI poster attached',
      'mkt.confirmPublish':'Confirm & publish','mkt.publishedTitle':'Published',
      'mkt.publishedBody':'Your post is live on {platforms} and queued to {audience}.','mkt.publishAnother':'Draft another',
      'mkt.needSelection':'Pick at least one goal, audience and platform first',
      'mkt.publishToast':'Published — post is live and the audience is queued',
      'mkt.suggestionsTitle':'AI marketing suggestions','mkt.suggestionsSub':'Tap any suggestion to jump to where you act on it.',
      'mkt.handle':'Handle','mkt.viewContent':'View published content','mkt.hideContent':'Hide',
      'mkt.publishedContent':'Published content','mkt.onPlatform':'Published on {platform}',
      'nav.back':'← Back to home',
      'title.bookings':'Today’s bookings','title.followup':'To follow up',
      'bk.count':'{n} bookings today','bk.time':'Time','bk.customer':'Customer','bk.service':'Service','bk.staff':'Staff','bk.status':'Status',
      'bk.confirmed':'Confirmed','bk.depositUnpaid':'Deposit unpaid','bk.viewInInbox':'Open chat',
      'fu.count':'{n} customers to follow up','fu.reason':'Why','fu.due':'When','fu.open':'Open chat','fu.act':'Act',
      'rep.overall':'Overall rating · {n} reviews','rep.byPlatform':'Reviews by platform','rep.replyAll':'Reply to all pending',
      'rep.replyAllToast':'AI replies posted to {n} pending reviews','rep.pending':'{n} pending',
      'cust.spendHistory':'Spend history','cust.shService':'Service','cust.shAmount':'Amount','cust.shTotal':'Total spent',
      'mkt.posterLabel':'Poster','mkt.posterHint':'· pick one','mkt.posterPreview':'AI poster',
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
    'trust.pdpa.title':'PDPA 與資料保護（新加坡）',
    'trust.pdpa.sub':'Rook 如何依據新加坡《個人資料保護法》而設計。供買方盡職調查之用——每項義務皆對應產品中的一項控制措施。',
    'trust.pdpa.k1':'徵得同意','trust.pdpa.v1':'未取得同意紀錄，不會向任何客戶發送行銷訊息；每次發送前皆先核查同意狀態與「拒絕來電」登記。',
    'trust.pdpa.k2':'目的限制','trust.pdpa.v2':'客戶資料僅用於回覆該客戶及管理其預約——絕不出售或另作他用。',
    'trust.pdpa.k3':'告知','trust.pdpa.v3':'首次接觸時即告知客戶所收集的資料與用途，並附上商家隱私權聲明連結。',
    'trust.pdpa.k4':'查閱與更正','trust.pdpa.v4':'店主可應要求匯出或更正任何個人的資料；稽核紀錄會記載每一次資料請求。',
    'trust.pdpa.k5':'保護','trust.pdpa.v5':'傳輸與儲存皆加密，並採角色權限控管——員工僅能看到其職務範圍內的資料。',
    'trust.pdpa.k6':'保留限制','trust.pdpa.v6':'資料僅在關係所需期間內保留，之後依可設定的排程清除。',
    'trust.pdpa.k7':'資料落地','trust.pdpa.v7':'客戶個人資料儲存於本地區；任何次要處理方（訊息或 AI 供應商）皆會揭露並受同等保護約束。',
    'trust.pdpa.k8':'外洩應變','trust.pdpa.v8':'外洩通報流程會在規定時限內通知 PDPC 及受影響的個人。',
    'trust.pdpa.note':'示範用說明文字——非法律意見。最終控制措施將於試行階段的資料處理協議中與商家確認。',
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
    'setup.uploadHeading':'上傳您的文件','setup.dzTitle':'將檔案拖曳到此，或點擊瀏覽',
    'setup.dzHint':'價目表、菜單、常見問題、對話截圖、政策——支援 PDF、Word 或圖片，單檔至多 25 MB',
    'setup.dzEmpty':'尚未上傳任何檔案。請新增您的檔案，或先從範例開始。',
    'setup.buildKb':'建立知識庫','setup.building':'建立中…',
    'setup.filesReady':'已就緒 {n} 個檔案','setup.useSample':'使用範例檔案','setup.removeFile':'移除檔案',
    'brain.addDocs':'新增文件','aria.paletteGroup':'配色主題',
    'palette.azure':'天藍','palette.indigo':'靛藍','palette.sky':'晴藍',
    'demo.reset':'重置示範','demo.resetHint':'清除已儲存的語言、配色、品牌與上傳檔案並重新載入',
    'setup.brandHeading':'換成客戶的品牌','setup.brandName':'店名','setup.brandTagline':'標語','setup.brandOwner':'店主名字',
    'setup.brandSub':'設定店名、標語與店主名稱，讓潛在客戶在整個主控台看到自己的品牌。即時套用，資料不會離開瀏覽器。',
    'setup.brandApply':'套用品牌','setup.brandReset':'還原為範例',
    'setup.brandToast':'品牌已套用至整個主控台','setup.brandResetToast':'品牌已還原為範例商家',
    'intro.aria':'歡迎使用 Rook','intro.title':'為您的店舖打造的 24/7 AI 成長團隊',
    'intro.body':'Rook 會回覆顧客訊息、跟進商機、處理評價並執行行銷活動——全部依據您自己的價格與政策，敏感事項則由您核准。這是店主的主控台。',
    'intro.b1t':'切換行業。','intro.b1':'頂部工具列——同一套主控台可配置為美容工作室或到府寵物美容。',
    'intro.b2t':'切換語言。','intro.b2':'英文、繁體或簡體中文——介面與內容皆會翻譯。',
    'intro.b3t':'切換配色。','intro.b3':'透過頂部工具列的圓點選擇三種藍色主題。',
    'intro.simNote':'此處所有內容皆為逼真但模擬的示範資料——沒有真實訊息或顧客。',
    'intro.explore':'我自己探索','intro.tour':'進行 2 分鐘導覽','intro.help':'關於此示範',
    'ask.title':'向助理提問','ask.send':'提問','ask.placeholder':'例如：光療指甲多少錢？',
    'ask.sub':'輸入任何顧客可能會問的問題。AI 只會根據本店的知識回答、標註來源，遇到不確定的問題會轉交員工而非臆測。',
    'ask.escChip':'已轉交員工——AI 不會臆測',
    'ask.fallback':'本店知識中沒有這個問題的確切答案，因此我已轉交團隊——他們會親自跟進您。',
    'ask.b.price':'經典光療指甲 $68、BIAB $88、光療延甲 $118。首次到訪可享 85 折（不可疊加）。',
    'ask.b.hours':'我們週二至週日 10:30–20:30 營業，週一公休。',
    'ask.b.book':'很樂意為您預約——$20 訂金即可保留時段，並會從最終帳單中扣抵。請問哪天方便、想做哪項服務？',
    'ask.b.men':'當然——我們提供男士美甲與臉部護理；約每 5 位美甲客人就有 1 位是男性。',
    'ask.b.preg':'睫毛與眉部服務在做過皮膚測試後可進行，孕期我們會避免某些臉部酸類。也請您先諮詢醫生——我們無法提供醫療保證。',
    'ask.b.obj':'我理解。我們使用日本品牌光療膠並提供免費卸甲，首次到訪還有 85 折——通常比表面看起來更划算。要我為您保留時段嗎？',
    'ask.b.ex1':'光療指甲多少錢？','ask.b.ex2':'週日幾點開門？','ask.b.ex3':'有做男士臉部護理嗎？',
    'ask.p.price':'美容依體型與毛況計價——完整美容小型犬約 $78，大型犬最高 $138。同一地址 2 隻以上寵物可享 9 折。',
    'ask.p.vax':'首次到訪需提供核心疫苗接種證明——預約後傳一張疫苗手冊照片即可。',
    'ask.p.injury':'非常抱歉聽到這個情況。若有出血、跛行或不適，請密切觀察，症狀持續請就醫——我現在就轉交店主與您聯繫。',
    'ask.p.sedation':'為了寵物安全，我們絕不使用鎮靜。焦慮、具攻擊性或高齡的寵物，預約前需先安排美容師評估通話。',
    'ask.p.zones':'我們服務全島，共兩台車（西北區與東北區）。請提供郵遞區號，我會查看路線並提供時段（聖淘沙加收 $15）。',
    'ask.p.deposit':'$20 訂金即可確認車位，出發前 24 小時可退。未付款的保留將於 12 小時後自動釋出。',
    'ask.p.ex1':'大型犬美容多少錢？','ask.p.ex2':'需要疫苗紀錄嗎？','ask.p.ex3':'你們服務哪些區域？',
    'print.export':'匯出摘要','print.title':'本週 Rook 摘要','print.subtitle':'AI 成長團隊 · 每週店主摘要','print.foot':'Rook 示範——模擬資料。產生於',
    'insights.leadsBookingsTitle':'商機與預約 — 近30天',
    'insights.leadsBookingsSub':'各通路每日數據',
    'insights.funnelTitle':'銷售漏斗 — 近30天','insights.funnelSub':'從首次接觸到重複預約',
    'insights.channelTitle':'各通路商機 — 近30天',
    'insights.channelSub':'整條為商機數 · 深色部分為已轉換預約 · 點擊柱狀圖查看對應客戶',
    'insights.forecastTitle':'未來7天 — 預約預測',
    'insights.forecastSub':'陰影區間為±20%信賴水準 · 依據：近30天數據、行銷活動與天氣展望',
    'insights.servicesTitle':'熱門服務營收 — 近30天','insights.servicesSub':'右側顯示預約數',
    'insights.viewTable':'檢視表格','insights.teamCompareSub':'RFP要求的門市比較洞察，在單店規模呈現','insights.colDate':'日期','insights.colLeads':'商機',
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
    'nav.operations':'經營','title.operations':'經營 — 財務、物料、員工',
    'home.advisorTitle':'AI 經營顧問','home.viewInsights':'完整洞察 →',
    'home.kpiRevenue':'本月營收','home.kpiBookings':'今日預約',
    'home.kpiFollowup':'待你跟進','home.kpiRating':'口碑評分',
    'home.aiTasks':'AI 經營任務卡','home.taskTakeover':'需人工接管',
    'home.taskNegative':'負評待處理','home.openChat':'開啟對話','home.openReview':'查看評價',
    'ops.finance':'財務','ops.materials':'物料','ops.staff':'員工',
    'ops.revenue':'營收','ops.expense':'支出','ops.net':'淨利','ops.margin':'利潤率',
    'ops.periodDay':'日','ops.periodMonth':'月','ops.periodYear':'年',
    'ops.revVsExp':'營收 vs 支出','ops.expenseBreakdown':'支出明細 — 本月',
    'ops.recentTx':'近期交易','ops.txItem':'項目','ops.txAmount':'金額',
    'ops.inventory':'庫存','ops.purchases':'採購訂單','ops.stock':'庫存量',
    'ops.reorder':'補貨點','ops.matStatus':'狀態','ops.statusOk':'充足','ops.statusLow':'偏低','ops.statusOut':'缺貨',
    'ops.reorderBtn':'一鍵補貨','ops.reorderToast':'採購單已擬妥——已發給供應商確認',
    'ops.poQty':'數量','ops.poCost':'金額','ops.poSupplier':'供應商','ops.poStatus':'狀態',
    'ops.poDelivered':'已到貨','ops.poOrdered':'已下單','ops.poPending':'待處理',
    'ops.staffRole':'職務','ops.staffPay':'本月薪資','ops.staffShifts':'每週班次',
    'ops.staffRating':'平均評分','ops.staffRecords':'工作紀錄','ops.roster':'團隊',
    'ops.weeklyShifts':'本週值班','ops.payrollTotal':'本月薪資總額','ops.legendRev':'營收','ops.legendExp':'支出',
    'cust.statTotal':'客戶總數','cust.statActive':'活躍','cust.statDormant':'沉睡','cust.statVip':'VIP',
    'cust.statLtv':'客戶終身價值總額','cust.statAvgLtv':'平均每位客戶','cust.statVisits':'到訪總次數',
    'cust.bySource':'各來源客戶數',
    'mkt.wizardTitle':'AI 內容發布向導','mkt.wizardSub':'一次擬定、編輯並跨平台發布貼文。',
    'mkt.goal':'目標','mkt.audience':'客群','mkt.content':'內容','mkt.platforms':'發布平台',
    'mkt.multiHint':'可多選','mkt.regenerate':'重新生成','mkt.poster':'已附 AI 海報',
    'mkt.confirmPublish':'確認發布','mkt.publishedTitle':'已發布',
    'mkt.publishedBody':'您的貼文已在 {platforms} 發布，並排定傳送給 {audience}。','mkt.publishAnother':'再擬一則',
    'mkt.needSelection':'請至少選擇一個目標、客群與平台',
    'mkt.publishToast':'已發布——貼文上線，客群已排入',
    'mkt.suggestionsTitle':'AI 營銷建議','mkt.suggestionsSub':'點任一建議即可跳到處理頁面。',
    'mkt.handle':'去處理','mkt.viewContent':'查看發布內容','mkt.hideContent':'收起',
    'mkt.publishedContent':'已發布內容','mkt.onPlatform':'發布於 {platform}',
    'nav.back':'← 返回今天',
    'title.bookings':'今日預約','title.followup':'待你跟進',
    'bk.count':'今日共 {n} 筆預約','bk.time':'時間','bk.customer':'客戶','bk.service':'服務項目','bk.staff':'服務人員','bk.status':'狀態',
    'bk.confirmed':'已確認','bk.depositUnpaid':'訂金未付','bk.viewInInbox':'開啟對話',
    'fu.count':'共 {n} 位客戶待跟進','fu.reason':'跟進原因','fu.due':'時間','fu.open':'開啟對話','fu.act':'去處理',
    'rep.overall':'綜合評分 · {n} 則評價','rep.byPlatform':'各平台評價','rep.replyAll':'一鍵回覆全部待處理',
    'rep.replyAllToast':'已為 {n} 則待處理評價發布 AI 回覆','rep.pending':'{n} 則待處理',
    'cust.spendHistory':'消費記錄','cust.shService':'服務項目','cust.shAmount':'金額','cust.shTotal':'累計消費',
    'mkt.posterLabel':'海報','mkt.posterHint':'· 擇一','mkt.posterPreview':'AI 海報',
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
    'trust.pdpa.title':'PDPA 与数据保护（新加坡）',
    'trust.pdpa.sub':'Rook 如何依据新加坡《个人资料保护法》而设计。供买方尽职调查之用——每项义务均对应产品中的一项控制措施。',
    'trust.pdpa.k1':'征得同意','trust.pdpa.v1':'未取得同意记录，不会向任何客户发送营销消息；每次发送前均先核查同意状态与"谢绝来电"登记。',
    'trust.pdpa.k2':'目的限制','trust.pdpa.v2':'客户数据仅用于回复该客户及管理其预约——绝不出售或另作他用。',
    'trust.pdpa.k3':'告知','trust.pdpa.v3':'首次接触时即告知客户所收集的数据与用途，并附上商家隐私声明链接。',
    'trust.pdpa.k4':'查阅与更正','trust.pdpa.v4':'店主可应要求导出或更正任何个人的数据；审计日志会记载每一次数据请求。',
    'trust.pdpa.k5':'保护','trust.pdpa.v5':'传输与存储均加密，并采用角色权限管控——员工仅能看到其职责范围内的数据。',
    'trust.pdpa.k6':'保留限制','trust.pdpa.v6':'数据仅在关系所需期间内保留，之后按可配置的计划清除。',
    'trust.pdpa.k7':'数据落地','trust.pdpa.v7':'客户个人数据存储于本地区；任何次级处理方（消息或 AI 供应商）均会披露并受同等保护约束。',
    'trust.pdpa.k8':'泄露应对','trust.pdpa.v8':'泄露通报流程会在规定时限内通知 PDPC 及受影响的个人。',
    'trust.pdpa.note':'示例说明文字——非法律意见。最终控制措施将于试点阶段的数据处理协议中与商家确认。',
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
    'setup.uploadHeading':'上传您的文件','setup.dzTitle':'将文件拖到此处，或点击浏览',
    'setup.dzHint':'价目表、菜单、常见问题、对话截图、政策——支持 PDF、Word 或图片，单个文件最大 25 MB',
    'setup.dzEmpty':'尚未上传任何文件。请添加您的文件，或先从示例开始。',
    'setup.buildKb':'构建知识库','setup.building':'构建中…',
    'setup.filesReady':'已就绪 {n} 个文件','setup.useSample':'使用示例文件','setup.removeFile':'移除文件',
    'brain.addDocs':'添加文件','aria.paletteGroup':'配色主题',
    'palette.azure':'天蓝','palette.indigo':'靛蓝','palette.sky':'晴蓝',
    'demo.reset':'重置演示','demo.resetHint':'清除已保存的语言、配色、品牌与上传文件并重新加载',
    'setup.brandHeading':'换成客户的品牌','setup.brandName':'店名','setup.brandTagline':'标语','setup.brandOwner':'店主名字',
    'setup.brandSub':'设置店名、标语与店主名称，让潜在客户在整个控制台看到自己的品牌。即时应用，数据不会离开浏览器。',
    'setup.brandApply':'应用品牌','setup.brandReset':'还原为示例',
    'setup.brandToast':'品牌已应用至整个控制台','setup.brandResetToast':'品牌已还原为示例商家',
    'intro.aria':'欢迎使用 Rook','intro.title':'为您的店铺打造的 24/7 AI 增长团队',
    'intro.body':'Rook 会回复顾客消息、跟进商机、处理评价并执行营销活动——全部依据您自己的价格与政策，敏感事项则由您批准。这是店主的控制台。',
    'intro.b1t':'切换行业。','intro.b1':'顶部工具栏——同一套控制台可配置为美容工作室或上门宠物美容。',
    'intro.b2t':'切换语言。','intro.b2':'英文、繁体或简体中文——界面与内容都会翻译。',
    'intro.b3t':'切换配色。','intro.b3':'通过顶部工具栏的圆点选择三种蓝色主题。',
    'intro.simNote':'此处所有内容均为逼真但模拟的演示数据——没有真实消息或顾客。',
    'intro.explore':'自行探索','intro.tour':'进行 2 分钟导览','intro.help':'关于此演示',
    'ask.title':'向助理提问','ask.send':'提问','ask.placeholder':'例如：光疗指甲多少钱？',
    'ask.sub':'输入任何顾客可能会问的问题。AI 只会根据本店的知识回答、标注来源，遇到不确定的问题会转交员工而非臆测。',
    'ask.escChip':'已转交员工——AI 不会臆测',
    'ask.fallback':'本店知识中没有这个问题的确切答案，因此我已转交团队——他们会亲自跟进您。',
    'ask.b.price':'经典光疗指甲 $68、BIAB $88、光疗延甲 $118。首次到访可享 85 折（不可叠加）。',
    'ask.b.hours':'我们周二至周日 10:30–20:30 营业，周一公休。',
    'ask.b.book':'很乐意为您预约——$20 订金即可保留时段，并会从最终账单中扣抵。请问哪天方便、想做哪项服务？',
    'ask.b.men':'当然——我们提供男士美甲与面部护理；约每 5 位美甲客人就有 1 位是男性。',
    'ask.b.preg':'睫毛与眉部服务在做过皮肤测试后可进行，孕期我们会避免某些面部酸类。也请您先咨询医生——我们无法提供医疗保证。',
    'ask.b.obj':'我理解。我们使用日本品牌光疗胶并提供免费卸甲，首次到访还有 85 折——通常比表面看起来更划算。要我为您保留时段吗？',
    'ask.b.ex1':'光疗指甲多少钱？','ask.b.ex2':'周日几点开门？','ask.b.ex3':'有做男士面部护理吗？',
    'ask.p.price':'美容按体型与毛况计价——完整美容小型犬约 $78，大型犬最高 $138。同一地址 2 只以上宠物可享 9 折。',
    'ask.p.vax':'首次到访需提供核心疫苗接种证明——预约后发一张疫苗手册照片即可。',
    'ask.p.injury':'非常抱歉听到这个情况。若有出血、跛行或不适，请密切观察，症状持续请就医——我现在就转交店主与您联系。',
    'ask.p.sedation':'为了宠物安全，我们绝不使用镇静。焦虑、具攻击性或高龄的宠物，预约前需先安排美容师评估通话。',
    'ask.p.zones':'我们服务全岛，共两台车（西北区与东北区）。请提供邮政编码，我会查看路线并提供时段（圣淘沙加收 $15）。',
    'ask.p.deposit':'$20 订金即可确认车位，出发前 24 小时可退。未付款的保留将于 12 小时后自动释出。',
    'ask.p.ex1':'大型犬美容多少钱？','ask.p.ex2':'需要疫苗记录吗？','ask.p.ex3':'你们服务哪些区域？',
    'print.export':'导出摘要','print.title':'本周 Rook 摘要','print.subtitle':'AI 增长团队 · 每周店主摘要','print.foot':'Rook 演示——模拟数据。生成于',
    'insights.leadsBookingsTitle':'商机与预约 — 近30天',
    'insights.leadsBookingsSub':'各渠道每日数据',
    'insights.funnelTitle':'销售漏斗 — 近30天','insights.funnelSub':'从首次接触到重复预约',
    'insights.channelTitle':'各渠道商机 — 近30天',
    'insights.channelSub':'整条为商机数 · 深色部分为已转化预约 · 点击柱状图查看对应客户',
    'insights.forecastTitle':'未来7天 — 预约预测',
    'insights.forecastSub':'阴影区间为±20%置信度 · 依据：近30天数据、营销活动与天气展望',
    'insights.servicesTitle':'热门服务营收 — 近30天','insights.servicesSub':'右侧显示预约数',
    'insights.viewTable':'查看表格','insights.teamCompareSub':'RFP要求的门店比较洞察，在单店规模呈现','insights.colDate':'日期','insights.colLeads':'商机',
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
    'nav.operations':'经营','title.operations':'经营 — 财务、物料、员工',
    'home.advisorTitle':'AI 经营顾问','home.viewInsights':'完整洞察 →',
    'home.kpiRevenue':'本月营收','home.kpiBookings':'今日预约',
    'home.kpiFollowup':'待你跟进','home.kpiRating':'口碑评分',
    'home.aiTasks':'AI 经营任务卡','home.taskTakeover':'需人工接管',
    'home.taskNegative':'负评待处理','home.openChat':'打开对话','home.openReview':'查看评价',
    'ops.finance':'财务','ops.materials':'物料','ops.staff':'员工',
    'ops.revenue':'营收','ops.expense':'支出','ops.net':'净利','ops.margin':'利润率',
    'ops.periodDay':'日','ops.periodMonth':'月','ops.periodYear':'年',
    'ops.revVsExp':'营收 vs 支出','ops.expenseBreakdown':'支出明细 — 本月',
    'ops.recentTx':'近期交易','ops.txItem':'项目','ops.txAmount':'金额',
    'ops.inventory':'库存','ops.purchases':'采购订单','ops.stock':'库存量',
    'ops.reorder':'补货点','ops.matStatus':'状态','ops.statusOk':'充足','ops.statusLow':'偏低','ops.statusOut':'缺货',
    'ops.reorderBtn':'一键补货','ops.reorderToast':'采购单已拟好——已发给供应商确认',
    'ops.poQty':'数量','ops.poCost':'金额','ops.poSupplier':'供应商','ops.poStatus':'状态',
    'ops.poDelivered':'已到货','ops.poOrdered':'已下单','ops.poPending':'待处理',
    'ops.staffRole':'职务','ops.staffPay':'本月薪资','ops.staffShifts':'每周班次',
    'ops.staffRating':'平均评分','ops.staffRecords':'工作记录','ops.roster':'团队',
    'ops.weeklyShifts':'本周值班','ops.payrollTotal':'本月薪资总额','ops.legendRev':'营收','ops.legendExp':'支出',
    'cust.statTotal':'客户总数','cust.statActive':'活跃','cust.statDormant':'沉睡','cust.statVip':'VIP',
    'cust.statLtv':'客户终身价值总额','cust.statAvgLtv':'平均每位客户','cust.statVisits':'到访总次数',
    'cust.bySource':'各来源客户数',
    'mkt.wizardTitle':'AI 内容发布向导','mkt.wizardSub':'一次拟定、编辑并跨平台发布贴文。',
    'mkt.goal':'目标','mkt.audience':'客群','mkt.content':'内容','mkt.platforms':'发布平台',
    'mkt.multiHint':'可多选','mkt.regenerate':'重新生成','mkt.poster':'已附 AI 海报',
    'mkt.confirmPublish':'确认发布','mkt.publishedTitle':'已发布',
    'mkt.publishedBody':'您的贴文已在 {platforms} 发布，并排定发送给 {audience}。','mkt.publishAnother':'再拟一则',
    'mkt.needSelection':'请至少选择一个目标、客群与平台',
    'mkt.publishToast':'已发布——贴文上线，客群已排入',
    'mkt.suggestionsTitle':'AI 营销建议','mkt.suggestionsSub':'点任一建议即可跳到处理页面。',
    'mkt.handle':'去处理','mkt.viewContent':'查看发布内容','mkt.hideContent':'收起',
    'mkt.publishedContent':'已发布内容','mkt.onPlatform':'发布于 {platform}',
    'nav.back':'← 返回今天',
    'title.bookings':'今日预约','title.followup':'待你跟进',
    'bk.count':'今日共 {n} 笔预约','bk.time':'时间','bk.customer':'客户','bk.service':'服务项目','bk.staff':'服务人员','bk.status':'状态',
    'bk.confirmed':'已确认','bk.depositUnpaid':'订金未付','bk.viewInInbox':'打开对话',
    'fu.count':'共 {n} 位客户待跟进','fu.reason':'跟进原因','fu.due':'时间','fu.open':'打开对话','fu.act':'去处理',
    'rep.overall':'综合评分 · {n} 则评价','rep.byPlatform':'各平台评价','rep.replyAll':'一键回复全部待处理',
    'rep.replyAllToast':'已为 {n} 则待处理评价发布 AI 回复','rep.pending':'{n} 则待处理',
    'cust.spendHistory':'消费记录','cust.shService':'服务项目','cust.shAmount':'金额','cust.shTotal':'累计消费',
    'mkt.posterLabel':'海报','mkt.posterHint':'· 择一','mkt.posterPreview':'AI 海报',
  });
  function t(key, vars) {
    const dict = I18N[state.lang] || I18N.en;
    let str = dict[key] ?? I18N.en[key] ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
    return str;
  }
  // Data-layer translation overlay: exact-string lookup into window.DATA_TRX
  // (from i18n-data.js), falling back to the authored English. Chat transcripts
  // are intentionally not translated — they are simulated customer messages.
  const td = (s) => {
    if (state.lang ==='en' || s == null) return s;
    const dict = window.DATA_TRX || {};
    const idx = state.lang ==='zh-Hant'? 0: 1;
    const hit = dict[s];
    if (hit) return hit[idx];
    // compound fallback: "Toby · Golden Retriever" translates part by part
    if (typeof s ==='string' && s.includes(' · ')) {
      return s.split(' · ').map((p) => { const h = dict[p]; return h? h[idx]: p; }).join(' · ');
    }
    return s;
  };
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
    uploads: [],            // documents the owner has added on the Setup view
    palette:'azure',        // colour theme: azure | indigo | sky
    brand: null,            // {name, tagline, ownerFirst} personalisation override
    intro: false,           // first-open welcome overlay showing
    introSeen: false,       // persisted: has the welcome been dismissed once
    askLog: [],             // "ask the assistant" tester transcript (per industry)
    opsTab:'finance',       // finance | materials | staff
    finPeriod:'month',      // day | month | year
    wiz: null,              // publish-wizard working state (lazy-init per industry)
    campOpen: {},           // expanded completed-campaign ids
  };
  const freshWiz = () => ({ goals: {}, audiences: {}, platforms: {}, variantIdx: 0, content: null, poster: 0, published: false });

  // ---------- preference persistence ----------
  // Only lightweight preferences persist across reloads; demo interaction
  // state (approvals, replies, sims) stays fresh each load. try/catch so a
  // blocked localStorage (private mode, file://) never breaks the app.
  const PREF_KEY ='rook.prefs.v1';
  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ lang: state.lang, palette: state.palette, uploads: state.uploads, brand: state.brand, introSeen: state.introSeen })); } catch (e) {}
  }
  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.lang && I18N[p.lang]) state.lang = p.lang;
      if (['azure','indigo','sky'].includes(p.palette)) state.palette = p.palette;
      if (Array.isArray(p.uploads)) state.uploads = p.uploads.filter((f) => f && typeof f.name ==='string');
      if (p.brand && typeof p.brand ==='object' && (p.brand.name || p.brand.tagline || p.brand.ownerFirst)) {
        state.brand = { name: p.brand.name ||'', tagline: p.brand.tagline ||'', ownerFirst: p.brand.ownerFirst ||'' };
      }
      if (p.introSeen) state.introSeen = true;
    } catch (e) {}
  }
  function resetDemo() {
    try { localStorage.removeItem(PREF_KEY); } catch (e) {}
    location.reload();
  }

  // ---------- personalisation (branding) ----------
  // A salesperson can make the console read as the prospect's own shop. Name
  // and tagline are branded at source; the owner's first name is scattered
  // through data strings, so it's substituted over rendered HTML.
  const bName = () => (state.brand && state.brand.name) || D.merchant.name;
  const bTag = () => (state.brand && state.brand.tagline) || td(D.merchant.tagline);
  const bOwnerFirst = () => (state.brand && state.brand.ownerFirst) || D.merchant.owner.split(' ')[0];
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function applyBrand(html) {
    const b = state.brand;
    if (!b) return html;
    let out = html;
    const sName = D.merchant.name;
    if (b.name && b.name!== sName) out = out.split(sName).join(esc(b.name));
    const sOwner = D.merchant.owner.split(' ')[0];
    if (b.ownerFirst && b.ownerFirst!== sOwner) out = out.replace(new RegExp('\\b' + reEsc(sOwner) + '\\b','g'), esc(b.ownerFirst));
    return out;
  }

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
    operations:'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 13.5h12" /><rect x="3" y="8" width="2.4" height="4"/><rect x="6.8" y="5" width="2.4" height="7"/><rect x="10.6" y="9.5" width="2.4" height="2.5"/></svg>',
  };
  const NAV_IDS = ['today','inbox','customers','marketing','social','reputation','brain','insights','operations','trust','setup'];

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
  function homeKpis() {
    const cx = D.cxSummary;
    const cards = [
      { label: t('home.kpiRevenue'), val: money(D.finance.monthRevenue), goto:'operations', optab:'finance' },
      { label: t('home.kpiBookings'), val: D.todayBookings, goto:'bookings' },
      { label: t('home.kpiFollowup'), val: D.followUpCount, goto:'followup' },
      { label: t('home.kpiRating'), val: cx.rating + ' ★', goto:'reputation' },
    ];
    return `<div class="kpi-row">${cards.map((k) => `
      <button class="kpi-card" data-goto="${k.goto}"${k.optab? ` data-goto-optab="${k.optab}"`:''}>
        <span class="kpi-label">${esc(k.label)}</span>
        <span class="kpi-val">${esc(k.val)}</span>
        <span class="kpi-go" aria-hidden="true">→</span>
      </button>`).join('')}</div>`;
  }
  function aiTaskCards() {
    const takeover = convoList().find((c) => c.aiStatus ==='escalated') || convoList().find((c) => c.aiStatus ==='human');
    const neg = D.reviews.find((r) => r.rating <= 2);
    return `
      <h2 class="sec">${t('home.aiTasks')}</h2>
      <div class="grid c2">
        ${takeover? `<button class="tcard" data-goto="inbox" data-goto-conv="${takeover.id}">
          <span class="tcard-k">${t('home.taskTakeover')}</span>
          <b>${esc(takeover.name)}</b>
          <span class="tcard-pv">${esc(td(takeover.preview))}</span>
          <span class="tcard-cta">${t('home.openChat')} →</span>
        </button>`:''}
        ${neg? `<button class="tcard neg" data-goto="reputation">
          <span class="tcard-k">${t('home.taskNegative')}</span>
          <b>${esc(neg.name)} <span class="stars" style="color:var(--crit)">${'★'.repeat(neg.rating)}${'☆'.repeat(5 - neg.rating)}</span></b>
          <span class="tcard-pv">${esc(neg.text)}</span>
          <span class="tcard-cta">${t('home.openReview')} →</span>
        </button>`:''}
      </div>`;
  }
  function printSheet() {
    const cx = D.cxSummary;
    const kpis = [
      [t('home.kpiRevenue'), money(D.finance.monthRevenue)],
      [t('home.kpiBookings'), D.todayBookings],
      [t('home.kpiFollowup'), D.followUpCount],
      [t('home.kpiRating'), cx.rating + ' ★'],
    ];
    return applyBrand(`
      <div class="ps-head">
        <div><div class="ps-mark"><span class="mark">♜</span> Rook</div><div class="ps-sub">${t('print.subtitle')}</div></div>
        <div class="ps-biz"><b>${esc(bName())}</b><span>${esc(bTag())}</span></div>
      </div>
      <h1 class="ps-title">${t('print.title')}</h1>
      <div class="ps-kpis">${kpis.map(([l, v]) => `<div class="ps-kpi"><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="ps-block"><div class="ps-h">${t('home.advisorTitle')}</div>
        <p class="ps-advisor">${esc(td(D.advisor.summary))}</p>
        <div class="ps-upside">${esc(D.advisor.metricValue)} · ${esc(td(D.advisor.metricLabel))}</div>
      </div>
      <div class="ps-block"><div class="ps-h">${esc(td(D.activityLabel))}</div>
        <div class="ps-acts">${D.aiActivity.map((a) => `<div class="ps-act"><b>${a.n}</b><span>${esc(td(a.label))}</span></div>`).join('')}</div>
      </div>
      <div class="ps-block"><div class="ps-h">${t('today.opportunities')}</div>
        <ul class="ps-opps">${D.opportunities.slice(0, 4).map((o) => `<li><b>${esc(td(o.who))}</b> — ${esc(td(o.why))} <span>${esc(td(o.value))}</span></li>`).join('')}</ul>
      </div>
      <div class="ps-foot">${t('print.foot')} ${esc(D.merchant.nowLabel)}</div>`);
  }
  function doPrint() {
    const prev = document.getElementById('printSheet');
    if (prev) prev.remove();
    const host = document.createElement('div');
    host.id ='printSheet'; host.className ='print-sheet';
    host.innerHTML = printSheet();
    document.body.appendChild(host);
    const cleanup = () => { const h = document.getElementById('printSheet'); if (h) h.remove(); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }
  function vToday() {
    const pending = D.approvals.filter((a) =>!state.done[a.id]);
    return `
      <div class="today-actions"><button class="btn sm" data-print>${t('print.export')}</button></div>
      <div class="card advisor">
        <div class="advisor-badge"><span class="advisor-dot"></span>${t('home.advisorTitle')}</div>
        <p class="advisor-summary">${esc(td(D.advisor.summary))}</p>
        <div class="advisor-foot">
          <span class="advisor-metric"><b>${esc(D.advisor.metricValue)}</b> <span>${esc(td(D.advisor.metricLabel))}</span></span>
          <button class="btn sm" data-goto="insights">${t('home.viewInsights')}</button>
        </div>
      </div>
      ${homeKpis()}
      ${aiTaskCards()}
      <div class="card brief">
        <h3>${esc(td(D.brief.headline))}</h3>
        <p>${esc(td(D.brief.body))}</p>
        <div style="margin-top:10px"><button class="btn sm" data-brief-phone>${t('today.briefButton')}</button></div>
      </div>
      ${state.phoneView ==='brief'? briefPhone():''}
      <h2 class="sec">${esc(td(D.activityLabel))}</h2>
      <div class="stat-row">
        ${D.aiActivity.map((a) => `<div class="stat"><b>${a.n}</b><span>${esc(td(a.label))}</span></div>`).join('')}
      </div>
      <h2 class="sec">${t('today.opportunities')}</h2>
      ${D.opportunities.map((o) => `
        <div class="opp ${o.kind}">
          <span class="stripe"></span>
          <div><div class="who">${esc(td(o.who))}</div><div class="why">${esc(td(o.why))}</div></div>
          <div class="val">${esc(td(o.value))}</div>
          ${o.convId? `<button class="btn sm go" data-open-conv="${o.convId}">${t('today.open')}</button>`:''}
        </div>`).join('')}
      <h2 class="sec">${t('today.waitingApproval', { n: pending.length })}</h2>
      ${pending.length === 0? `<div class="card"><p style="margin:0;color:var(--muted)">${t('today.allClear')}</p></div>`: pending.map((a) => `
        <div class="appr">
          <span class="k">${esc(td(a.type))}</span>
          <div class="t"><b>${esc(td(a.title))}</b><span>${esc(td(a.detail))}</span></div>
          <div class="act">
            <button class="btn sm pri" data-approve="${a.id}">${t('today.approve')}</button>
            <button class="btn sm" data-hold="${a.id}">${t('today.hold')}</button>
          </div>
        </div>`).join('')}`;
  }

  // ---------- Bookings page (今日預約) ----------
  const BK_STATUS = { confirmed:['bk.confirmed','st-good'], 'deposit-unpaid':['bk.depositUnpaid','human'] };
  function vBookings() {
    const bk = D.bookings;
    const cust = (name) => D.customers.find((c) => c.name === name || c.name.includes(name));
    return `
      <button class="btn sm" data-goto="today">${t('nav.back')}</button>
      <h2 class="sec" style="margin-top:12px">${t('bk.count', { n: bk.length })}</h2>
      <div class="card tbl-wrap" style="padding:6px 10px">
        <table class="tbl">
          <thead><tr><th>${t('bk.time')}</th><th>${t('bk.customer')}</th><th>${t('bk.service')}</th><th>${t('bk.staff')}</th><th>${t('bk.status')}</th><th></th></tr></thead>
          <tbody>${bk.map((b) => {
            const c = cust(b.customer);
            const conv = D.conversations.find((v) => v.name === b.customer || (v.name && v.name.includes(b.customer)));
            return `<tr>
              <td style="white-space:nowrap;font-variant-numeric:tabular-nums"><b>${esc(b.time)}</b></td>
              <td>${c? `<button class="linklike" data-cust="${c.id}">${esc(b.customer)}</button>`: esc(b.customer)}</td>
              <td>${esc(td(b.service))}</td>
              <td style="white-space:nowrap">${esc(td(b.staff))}</td>
              <td><span class="tagchip ${BK_STATUS[b.status][1]}">${t(BK_STATUS[b.status][0])}</span></td>
              <td>${conv? `<button class="btn sm" data-goto="inbox" data-goto-conv="${conv.id}">${t('bk.viewInInbox')}</button>`:''}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>`;
  }

  // ---------- Follow-up page (待你跟進) ----------
  function vFollowup() {
    const fu = D.followups;
    return `
      <button class="btn sm" data-goto="today">${t('nav.back')}</button>
      <h2 class="sec" style="margin-top:12px">${t('fu.count', { n: fu.length })}</h2>
      <div class="card" style="padding:4px 14px">
        ${fu.map((f) => `
          <div class="fu-row">
            <span class="fu-dot"></span>
            <div class="fu-body">
              <b>${esc(f.customer)}</b> <span class="tagchip">${chIcon[f.channel] || f.channel}</span>
              <div class="fu-reason">${esc(td(f.reason))}</div>
              <div class="fu-due">${esc(td(f.due))}</div>
            </div>
            ${f.convId
              ? `<button class="btn sm" data-goto="inbox" data-goto-conv="${f.convId}">${t('fu.open')}</button>`
              : `<button class="btn sm" data-toast="${esc(t('toast.held'))}">${t('fu.act')}</button>`}
          </div>`).join('')}
      </div>`;
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
        <span class="pv">${esc(td(c.preview))}</span>
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
            <div><b>${esc(conv.name)}</b><div class="sub">${chLabel(conv.channel)} · ${esc(td(conv.customerLine || conv.intent ||''))}</div></div>
            <div class="spacer"></div>
            ${statusChip(conv)}
            <button class="btn sm" data-phone>${t('inbox.customerView')}</button>
            <button class="btn sm" data-takeover="${conv.id}">${paused? t('inbox.handBack'): t('inbox.takeOver')}</button>
          </div>
          <div class="msgs" id="msgs">${msgs}</div>
        </div>
        <div class="ctx ${threadHide}">
          ${conv.score!= null? `<div class="card"><h4>${t('inbox.leadScore')}</h4><span class="score-pill">${conv.score}</span><span style="color:var(--muted)"> / 100 · ${esc(td(conv.intent))}</span></div>`:''}
          ${conv.fields? `<div class="card"><h4>${t('inbox.extracted')}</h4><dl class="kv">${Object.entries(conv.fields).map(([k, v]) => `<dt>${esc(td(k))}</dt><dd>${esc(td(v))}</dd>`).join('')}</dl></div>`:''}
          ${conv.handoff? `<div class="card handoff"><h4>${t('inbox.whyStopped')}</h4><p>${esc(td(conv.handoff))}</p></div>`:''}
          ${conv.nextAction? `<div class="card nextact"><h4>${t('inbox.suggestedNext')}</h4><p>${esc(td(conv.nextAction))}</p></div>`:''}
        </div>
      </div>
      ${state.phoneView ==='conv'? phoneOverlay(conv):''}`;
  }
  const WAVE = [5, 9, 13, 8, 11, 6, 12, 9, 14, 7, 10, 5, 8, 12, 6, 9]
.map((h) => `<i style="height:${h}px"></i>`).join('');
  function msgHtml(m) {
    if (m.from ==='sys') return `<div class="msg sys">${esc(td(m.text))}</div>`;
    if (m.from ==='typing') return `<div class="typing" aria-label="${t('msg.aiTypingAria')}"><i></i><i></i><i></i></div>`;
    const who = m.from ==='cust'?'cust': m.from;
    const label = m.from ==='cust'?'': m.from ==='ai'? t('msg.rookAI'): t('msg.staff');
    if (m.voice) return `<div class="msg ${who}">
      <span class="vn" aria-label="${t('msg.voiceMessageAria', { duration: m.duration })}">▶<span class="vn-wave">${WAVE}</span>${esc(m.duration)}</span>
      <div class="vn-tx">“${esc(m.text)}”</div>
      <span class="vn-note">${t('msg.transcribed')}</span>
      <span class="meta">${label}${label && m.time? ' · ':''}${m.time? fmtClock(m.time):''}</span></div>`;
    return `<div class="msg ${who}">${esc(m.text)}
      ${m.cite? `<br><span class="cite"><span class="cite-k">${t('msg.source')}</span>${esc(td(m.cite))}</span>`:''}
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
          <div class="ph-head"><span class="ph-avatar">${esc((opts.header || bName())[0])}</span>
            <div><b>${esc(opts.header || bName())}</b><span>${t('phone.online')}</span></div>
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
        toast(td(sim.doneToast));
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
            <span class="task-title">${esc(td(tk.title))}</span>
            <span class="tagchip">${esc(td(tk.source))}</span>
            <span class="task-meta">${esc(td(tk.who))} · ${esc(td(tk.due))}</span>
          </div>`).join('')}
      </div>`;
  }

  function custStats() {
    const cs = D.customers;
    const total = cs.length;
    const active = cs.filter((c) => c.lifecycle ==='Active' || c.lifecycle ==='VIP' || c.lifecycle ==='Converted').length;
    const dormant = cs.filter((c) => c.lifecycle ==='Dormant').length;
    const vip = cs.filter((c) => c.lifecycle ==='VIP').length;
    const totalLtv = cs.reduce((a, c) => a + (c.ltv || 0), 0);
    const totalVisits = cs.reduce((a, c) => a + (c.visits || 0), 0);
    const bySource = {};
    cs.forEach((c) => { bySource[c.channel] = (bySource[c.channel] || 0) + 1; });
    const srcMax = Math.max(...Object.values(bySource));
    return `
      <div class="stat-row s6">
        <div class="stat"><b>${total}</b><span>${t('cust.statTotal')}</span></div>
        <div class="stat"><b>${active}</b><span>${t('cust.statActive')}</span></div>
        <div class="stat"><b>${dormant}</b><span>${t('cust.statDormant')}</span></div>
        <div class="stat"><b>${vip}</b><span>${t('cust.statVip')}</span></div>
        <div class="stat"><b>${money(totalLtv)}</b><span>${t('cust.statLtv')}</span></div>
        <div class="stat"><b>${totalVisits}</b><span>${t('cust.statVisits')}</span></div>
      </div>
      <div class="card" style="margin-top:12px">
        <h4 style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:var(--muted)">${t('cust.bySource')}</h4>
        ${Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([src, n]) => `
          <div class="theme-row">
            <span style="min-width:130px">${esc(chLabel(src))}</span>
            <span class="bar" style="width:${Math.round((n / srcMax) * 150)}px"></span>
            <span class="n">${n}</span>
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
      <h2 class="sec">${t('nav.customers')}</h2>
      ${custStats()}
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
            <td>${c.tags.map((tg) => `<span class="tagchip">${esc(td(tg))}</span>`).join('')}</td>
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
      { time: c.lastVisit || daysAgoIso(30), kind:'visit', text: `${esc(td(c.pref))} — ${t('customers.timelineDefault1')}` },
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
            <dt>${t('customers.usualService')}</dt><dd>${esc(td(c.pref))}</dd>
            <dt>${t('customers.lastVisit')}</dt><dd>${fmtRel(c.lastVisit)}</dd>
            <dt>${t('customers.nextDue')}</dt><dd>${c.nextDue? fmtRel(c.nextDue):'—'}</dd>
            <dt>${t('customers.consent')}</dt><dd>${c.consent? t('customers.consentYes'): t('customers.consentNo')}</dd>
            <dt>${t('customers.tags')}</dt><dd>${c.tags.map((tg) => `<span class="tagchip">${esc(td(tg))}</span>`).join('')}</dd>
          </dl>
        </div>
        <div class="card">
          <h4 style="margin:0 0 6px">${t('customers.timeline')}</h4>
          <ul class="timeline">
            ${timeline.map((tl) => `<li><time>${fmtRel(tl.time)} · ${esc(td(tl.kind))}</time>${td(tl.text)}</li>`).join('')}
          </ul>
        </div>
      </div>
      ${(() => {
        const sh = spendHistory(c);
        if (!sh.rows.length) return '';
        return `<div class="card" style="margin-top:12px">
          <h4 style="margin:0 0 8px">${t('cust.spendHistory')} <span style="font-weight:400;color:var(--muted);font-size:12px">· ${t('cust.shTotal')} ${money(sh.total)}</span></h4>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>${t('insights.colDate')}</th><th>${t('cust.shService')}</th><th class="num">${t('cust.shAmount')}</th></tr></thead>
            <tbody>${sh.rows.map((r) => `<tr><td style="white-space:nowrap;color:var(--muted)">${fmtRel(r.date)}</td><td>${esc(td(r.service))}</td><td class="num">${money(r.amount)}</td></tr>`).join('')}</tbody>
          </table></div>
        </div>`;
      })()}`;
  }
  function spendHistory(c) {
    if (!c.visits) return { rows: [], total: 0 };
    const svc = (D.services || []).find((s) => s.name === c.pref || c.pref.includes(s.name) || s.name.includes(c.pref));
    const unit = svc? svc.price: (c.ltv && c.visits? Math.round(c.ltv / c.visits): 60);
    const n = Math.min(c.visits, 5);
    const last = c.lastVisit? new Date(c.lastVisit): new Date(NOW - 20 * 864e5);
    const vary = [0, -6, 8, -4, 12];
    const rows = [];
    for (let i = 0; i < n; i++) {
      rows.push({ date: new Date(+last - i * 24 * 864e5).toISOString(), service: c.pref, amount: Math.max(20, unit + vary[i % vary.length]) });
    }
    return { rows, total: c.ltv || rows.reduce((a, r) => a + r.amount, 0) };
  }
  const daysAgoIso = (d) => new Date(NOW - d * 864e5).toISOString();

  // ---------- Marketing ----------
  function vMarketing() {
    const st = (c) => state.campaign[c.id] || c.status;
    const active = D.campaigns.filter((c) => st(c)!=='completed');
    const past = D.campaigns.filter((c) => st(c) ==='completed');
    return `
      ${publishWizard()}
      ${suggestionsSection()}
      <h2 class="sec">${t('marketing.needsDecision')}</h2>
      ${active.map((c) => campHtml(c, st(c))).join('')}
      <h2 class="sec">${t('marketing.recentlyCompleted')}</h2>
      ${past.map((c) => campHtml(c,'completed')).join('')}
      ${referralSection()}`;
  }
  function publishWizard() {
    if (!state.wiz) state.wiz = freshWiz();
    const w = state.wiz, pw = D.publishWizard;
    const content = w.content!= null? w.content: pw.variants[w.variantIdx];
    if (w.published) {
      const plats = Object.keys(w.platforms).filter((k) => w.platforms[k]).map((k) => td(k)).join(', ');
      const auds = Object.keys(w.audiences).filter((k) => w.audiences[k]).map((k) => td(k)).join(', ');
      const chosen = pw.posters[w.poster] || pw.posters[0];
      return `<div class="card wizard done">
        <span class="wiz-done-ic">✓</span>
        <h3 style="margin:6px 0 4px">${t('mkt.publishedTitle')}</h3>
        <p style="margin:0 0 10px;color:var(--ink-2)">${t('mkt.publishedBody', { platforms: plats, audience: auds })}</p>
        <div class="wiz-final">
          <div class="poster-card sel" style="--ph:${chosen.hue}"><span class="poster-tag">${t('mkt.posterPreview')}</span><b>${esc(td(chosen.title))}</b></div>
          <div class="wiz-preview">“${esc(content)}”</div>
        </div>
        <div style="margin-top:12px"><button class="btn" data-wiz-reset>${t('mkt.publishAnother')}</button></div>
      </div>`;
    }
    const chips = (list, kind, sel) => list.map((o) => `<button class="wchip ${sel[o]?'on':''}" data-wiz-toggle="${kind}" data-wiz-val="${esc(o)}">${esc(td(o))}</button>`).join('');
    const posters = pw.posters.map((po, i) => `
      <button class="poster-card ${w.poster === i?'sel':''}" data-wiz-poster="${i}" style="--ph:${po.hue}">
        <span class="poster-tag">${t('mkt.posterPreview')}</span>
        <b>${esc(td(po.title))}</b><span class="poster-sub">${esc(td(po.tag))}</span>
        ${w.poster === i? '<span class="poster-check">✓</span>':''}
      </button>`).join('');
    return `<div class="card wizard">
      <h3 style="margin:0 0 2px">${t('mkt.wizardTitle')}</h3>
      <p class="wiz-sub">${t('mkt.wizardSub')}</p>
      <div class="wiz-field"><label>${t('mkt.goal')} <span>· ${t('mkt.multiHint')}</span></label><div class="wchips">${chips(pw.goals,'goals', w.goals)}</div></div>
      <div class="wiz-field"><label>${t('mkt.audience')} <span>· ${t('mkt.multiHint')}</span></label><div class="wchips">${chips(pw.audiences,'audiences', w.audiences)}</div></div>
      <div class="wiz-field"><label>${t('mkt.content')}</label>
        <textarea id="wizContent" class="wiz-textarea" rows="4">${esc(content)}</textarea>
        <div class="wiz-row"><button class="btn sm" data-wiz-regen>↻ ${t('mkt.regenerate')}</button></div>
      </div>
      <div class="wiz-field"><label>${t('mkt.posterLabel')} <span>${t('mkt.posterHint')}</span></label><div class="posters">${posters}</div></div>
      <div class="wiz-field"><label>${t('mkt.platforms')} <span>· ${t('mkt.multiHint')}</span></label><div class="wchips">${chips(pw.platforms,'platforms', w.platforms)}</div></div>
      <div class="wiz-actions"><button class="btn pri" data-wiz-publish>${t('mkt.confirmPublish')}</button></div>
    </div>`;
  }
  function suggestionsSection() {
    return `
      <h2 class="sec">${t('mkt.suggestionsTitle')}</h2>
      <p class="sec-sub">${t('mkt.suggestionsSub')}</p>
      <div class="card" style="padding:4px 14px">
        ${D.marketingSuggestions.map((s) => `
          <div class="sugg-row ${s.tone ==='bad'?'bad':''}">
            <span class="sugg-dot"></span>
            <span class="sugg-text">${esc(td(s.text))}</span>
            <button class="btn sm" data-goto="${s.goto.view}"${s.goto.filter? ` data-goto-filter="${s.goto.filter}"`:''}>${t('mkt.handle')} →</button>
          </div>`).join('')}
      </div>`;
  }
  function referralSection() {
    const r = D.referrals;
    return `
      <h2 class="sec">${t('referral.heading')}</h2>
      <div class="grid c2" style="align-items:start">
        <div class="card">
          <div class="est" style="margin-top:0">
            ${r.stats.map((s) => `<div><b>${esc(s.value)}</b><span>${esc(td(s.label))}</span></div>`).join('')}
          </div>
          <p style="font-size:12.5px;color:var(--ink-2);margin:12px 0 8px;max-width:64ch">${esc(td(r.rule))}</p>
          <span class="tagchip" style="font-variant-numeric:tabular-nums">${esc(r.link)} ${t('referral.linkNote')}</span>
        </div>
        <div class="card tbl-wrap" style="padding:6px 10px">
          <table class="tbl">
            <thead><tr><th>${t('referral.topReferrers')}</th><th class="num">${t('referral.referred')}</th><th class="num">${t('referral.booked')}</th><th class="num">${t('referral.revenue')}</th><th>${t('referral.note')}</th></tr></thead>
            <tbody>${r.top.map((rf) => `<tr><td><b>${esc(rf.name)}</b></td><td class="num">${rf.referred}</td><td class="num">${rf.booked}</td><td class="num">${rf.revenue? money(rf.revenue):'—'}</td><td style="color:var(--ink-2)">${esc(td(rf.note))}</td></tr>`).join('')}</tbody>
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
        <div class="head"><b>${esc(td(c.name))}</b><span class="status ${status}">${t(CAMP_STATUS_KEY[status] || status)}</span></div>
        <dl class="row">
          <dt>${t('marketing.trigger')}</dt><dd>${esc(td(c.trigger))}</dd>
          <dt>${t('marketing.audience')}</dt><dd>${esc(td(c.audience))}</dd>
          <dt>${t('marketing.schedule')}</dt><dd>${esc(td(c.schedule))} · ${esc(td(c.channel))}</dd>
        </dl>
        <div class="copy">“${esc(c.copy)}”</div>
        ${est}${res}
        ${status ==='pending'? `
          <div class="actions">
            <button class="btn pri" data-approve-camp="${c.id}">${t('marketing.approveSchedule')}</button>
            <button class="btn">${t('marketing.editAudience')}</button>
            <button class="btn">${t('marketing.skipWeek')}</button>
          </div>`:''}
        ${status ==='completed'? `
          <div style="margin-top:10px"><button class="btn sm" data-camp-toggle="${c.id}">${state.campOpen[c.id]? t('mkt.hideContent'): t('mkt.viewContent')} →</button></div>
          ${state.campOpen[c.id]? `<div class="camp-published">
            <div class="cp-head">${t('mkt.onPlatform', { platform: esc(td(c.channel)) })} · ${esc(td(c.schedule))}</div>
            <div class="cp-body">${esc(c.copy)}</div>
          </div>`:''}`:''}
      </div>`;
  }

  // ---------- Reputation ----------
  function vReputation() {
    const cx = D.cxSummary;
    const pendingReviews = D.reviews.filter((r) => r.replyStatus!=='posted' && !state.reviewPosted[r.id]);
    const byPlatform = {};
    D.reviews.forEach((r) => { byPlatform[r.source] = (byPlatform[r.source] || 0) + 1; });
    return `
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat"><b>${cx.rating} ★</b><span>${t('rep.overall', { n: cx.count })}</span></div>
        <div class="stat"><b>${cx.invited30d}</b><span>${t('reputation.invites30')}</span></div>
        <div class="stat"><b>${cx.received30d}</b><span>${t('reputation.new30')}</span></div>
        <div class="stat"><b>${cx.openTickets}</b><span>${t('reputation.openTickets')}</span></div>
      </div>
      <div class="card" style="margin-top:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <b style="font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:var(--muted)">${t('rep.byPlatform')}</b>
        ${Object.entries(byPlatform).map(([src, n]) => `<span class="plat-pill">${esc(src)} · ${n}</span>`).join('')}
        <div class="spacer" style="flex:1"></div>
        ${pendingReviews.length? `<button class="btn sm pri" data-reply-all>${t('rep.replyAll')} (${t('rep.pending', { n: pendingReviews.length })})</button>`:''}
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
                <span style="min-width:180px">${esc(td(th.theme))}</span>
                <span class="bar" style="width:${th.n * 16}px"></span>
                <span class="n">${th.n}</span>
              </div>`).join('')}
            <p style="font-size:12px;color:var(--muted);margin:10px 0 0">${esc(td(cx.note))}</p>
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
        ${r.linked? `<p style="font-size:12px;color:var(--serious);margin:0 0 8px"><b>${t('reputation.linked')}</b> · ${esc(td(r.linked))}</p>`:''}
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
                <span class="cal-day">${esc(td(c.day))}<em>${esc(c.time)}</em></span>
                <div class="cal-body"><b>${esc(td(c.title))}</b>
                  <span>${esc(td(c.channel))}${c.note?' · ' + esc(td(c.note)):''}</span></div>
                ${stChip(c.status)}
              </div>`).join('')}
          </div>
          <h2 class="sec">${t('social.assets')}</h2>
          <div class="card">
            <ul class="strategy" style="margin:0;padding-left:18px">${s.assets.map((a) => `<li>${esc(td(a))}</li>`).join('')}</ul>
          </div>
        </div>
        <div>
          <h2 class="sec">${t('social.whatDrives')}</h2>
          ${s.posts.map((p) => `
            <div class="card" style="margin-bottom:10px">
              <b>${esc(td(p.title))}</b> <span style="color:var(--muted);font-size:12px">· ${esc(p.when)}</span>
              <div class="est" style="margin-top:8px">
                <div><b>${esc(p.reach)}</b><span>${t('social.reach')}</span></div>
                <div><b>${p.saves}</b><span>${t('social.saves')}</span></div>
                <div><b>${p.inquiries}</b><span>${t('social.inquiries')}</span></div>
                <div><b>${p.bookings}</b><span>${t('social.bookings')}</span></div>
                <div><b>${money(p.revenue)}</b><span>${t('social.revenue')}</span></div>
              </div>
              ${p.flag? `<p style="margin:8px 0 0;font-size:12.5px;color:var(--accent-soft-ink)"><b>${t('social.insight')}</b> · ${esc(td(p.flag))}</p>`:''}
            </div>`).join('')}
          <h2 class="sec">${t('social.commentsDms')}</h2>
          <div class="card" style="padding:8px 16px">
            ${s.interactions.map((i) => `
              <div class="int-row">
                <div><b>${esc(i.who)}</b> <span style="color:var(--muted);font-size:11.5px">${esc(td(i.channel))} · ${esc(td(i.when))}</span>
                  <div class="int-text">“${esc(i.text)}”</div>
                  <div class="int-out">→ ${esc(td(i.outcome))}</div></div>
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
  const PDPA_ROWS = ['1','2','3','4','5','6','7','8'];
  function pdpaCard() {
    return `
      <div class="card pdpa-card">
        <h2 class="sec" style="margin-top:0">${t('trust.pdpa.title')}</h2>
        <p class="pdpa-sub">${t('trust.pdpa.sub')}</p>
        <div class="pdpa-grid">
          ${PDPA_ROWS.map((n) => `<div class="pdpa-row"><span class="pdpa-check">✓</span><div><b>${t('trust.pdpa.k' + n)}</b><span>${t('trust.pdpa.v' + n)}</span></div></div>`).join('')}
        </div>
        <div class="pdpa-note">${t('trust.pdpa.note')}</div>
      </div>`;
  }
  function vTrust() {
    const tr = D.trust;
    return `
      ${pdpaCard()}
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr);margin-top:14px">
        ${tr.stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(td(s.label))}</span><div class="kpi-delta" style="color:var(--muted)">${esc(td(s.sub))}</div></div>`).join('')}
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div>
          <h2 class="sec">${t('trust.auditTrail')}</h2>
          <div class="card" style="padding:8px 16px">
            ${tr.audit.map((a) => `
              <div class="audit-row">
                <span class="audit-t">${esc(td(a.t))}</span>
                <span class="audit-text">${esc(td(a.text))}</span>
                ${auditTag(a.tag)}
              </div>`).join('')}
          </div>
        </div>
        <div>
          <h2 class="sec">${t('trust.outreachRules')}</h2>
          <div class="card">
            <ul class="strategy" style="margin:0;padding-left:18px">${tr.rules.map((r) => `<li>${esc(td(r))}</li>`).join('')}</ul>
          </div>
          <h2 class="sec">${t('trust.whoCanDo')}</h2>
          <div class="card tbl-wrap" style="padding:6px 10px">
            <table class="tbl">
              <thead><tr><th>${t('trust.person')}</th><th>${t('trust.role')}</th><th>${t('trust.permissions')}</th></tr></thead>
              <tbody>${tr.roles.map((r) => `<tr><td><b>${esc(r.who)}</b></td><td>${esc(td(r.role))}</td><td style="color:var(--ink-2)">${esc(td(r.can))}</td></tr>`).join('')}</tbody>
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
  // "Ask the assistant" — keyword → grounded answer + citation, else escalate.
  // Demonstrates the grounding story interactively without a live LLM.
  const ASK = {
    beauty: [
      { kw: ['price','cost','how much','$','expensive','cheap','rate','charge'], aKey:'ask.b.price', kb:'kb-price' },
      { kw: ['hour','open','close','when','sunday','monday','today'], aKey:'ask.b.hours', kb:'kb-faq04' },
      { kw: ['book','appointment','appt','slot','available','reserve','deposit'], aKey:'ask.b.book', kb:'kb-r03' },
      { kw: ['men','man','male','guy','husband','boyfriend'], aKey:'ask.b.men', kb:'kb-faq04' },
      { kw: ['pregnan','expecting'], aKey:'ask.b.preg', kb:'kb-preg' },
      { kw: ['discount','worth','promo','cheaper','too much','value'], aKey:'ask.b.obj', kb:'kb-obj' },
    ],
    pets: [
      { kw: ['price','cost','how much','$','rate','large','small','size','charge'], aKey:'ask.p.price', kb:'kb-p-price' },
      { kw: ['vaccin','vax','jab','shot'], aKey:'ask.p.vax', kb:'kb-p-vax' },
      { kw: ['injur','bleed','hurt','limp','wound','cut','distress'], aKey:'ask.p.injury', kb:'kb-p-s01' },
      { kw: ['sedat','anxious','aggressive','senior','bite'], aKey:'ask.p.sedation', kb:'kb-p-s02' },
      { kw: ['area','zone','postal','where','come to','cover','location','sentosa'], aKey:'ask.p.zones', kb:'kb-p-zones' },
      { kw: ['deposit','hold','cancel','refund'], aKey:'ask.p.deposit', kb:'kb-p-d02' },
    ],
  };
  const kbTitle = (id) => { const k = D.knowledge.find((x) => x.id === id); return k? td(k.title):''; };
  function askAI(text) {
    const q = (text ||'').trim();
    if (!q) return;
    const low = q.toLowerCase();
    const hit = (ASK[state.industry] || []).find((e) => e.kw.some((k) => low.includes(k)));
    state.askLog.push(hit? { q, key: hit.aKey, kb: hit.kb }: { q, escalate: true });
    render();
  }
  function askSection() {
    const ex = state.industry ==='pets'? ['ask.p.ex1','ask.p.ex2','ask.p.ex3']: ['ask.b.ex1','ask.b.ex2','ask.b.ex3'];
    const log = state.askLog.map((it) => {
      const ai = it.escalate
? `<div class="msg ai">${t('ask.fallback')}<br><span class="cite esc"><span class="cite-k">●</span> ${t('ask.escChip')}</span></div>`
: `<div class="msg ai">${t(it.key)}<br><span class="cite"><span class="cite-k">${t('msg.source')}</span> ${esc(kbTitle(it.kb))}</span></div>`;
      return `<div class="msg cust">${esc(it.q)}</div>${ai}`;
    }).join('');
    return `
      <div class="card ask-card">
        <h3 class="up-head">${t('ask.title')}</h3>
        <p class="dz-hint" style="margin:0 0 12px;max-width:66ch">${t('ask.sub')}</p>
        <div class="ask-ex">${ex.map((k) => `<button class="chip-btn" data-ask-example="${esc(t(k))}">${t(k)}</button>`).join('')}</div>
        ${log? `<div class="msgs ask-log">${log}</div>`:''}
        <div class="ask-row">
          <input id="askInput" type="text" placeholder="${esc(t('ask.placeholder'))}" autocomplete="off" aria-label="${t('ask.title')}">
          <button class="btn pri" data-ask-send>${t('ask.send')}</button>
        </div>
      </div>`;
  }
  function vBrain() {
    return `
      ${askSection()}
      <div class="grid c2" style="align-items:start;margin-top:14px">
        <div>
          <div class="sec-row">
            <h2 class="sec" style="margin:0">${t('brain.knowledge')}</h2>
            <button class="btn sm" data-nav="setup">↥ ${t('brain.addDocs')}</button>
          </div>
          ${D.knowledge.map((k) => `
            <div class="kb">
              <div class="head">
                <b>${esc(td(k.title))}</b>
                <span class="cat">${esc(td(k.category))}</span>
                ${k.sensitive? `<span class="lock">${t('brain.ownerGated')}</span>`:''}
                <span class="cites">${t('brain.cited', { n: k.cites30d })}</span>
              </div>
              <p>${esc(td(k.excerpt))}</p>
              <div class="meta">${esc(td(state.kbApproved[k.id] && k.approvedVersion? k.approvedVersion: k.version))} · ${t('brain.updatedBy', { rel: fmtRel(k.updated), owner: esc(td(k.owner)) })}</div>
            </div>`).join('')}
        </div>
        <div>
          <h2 class="sec">${t('brain.gaps')}</h2>
          ${D.knowledgeGaps.map((g) => `
            <div class="kb gap">
              <b>“${esc(td(g.q))}”</b>
              <p>${t('brain.askedLast', { n: g.asked, rel: fmtRel(g.last) })} ${esc(td(g.note))}</p>
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
  const humanSize = (b) => b < 1024? b +' B': b < 1048576? Math.round(b / 1024) +' KB': (b / 1048576).toFixed(1) +' MB';
  function uploadCard() {
    const has = state.uploads.length > 0;
    const list = has? `<div class="up-list">
        ${state.uploads.map((f, i) => `<div class="up-row">
          <span class="up-doc">▤</span>
          <span class="up-name">${esc(f.name)}</span>
          <span class="up-size">${humanSize(f.size)}</span>
          <button class="up-x" data-upload-remove="${i}" aria-label="${t('setup.removeFile')}">✕</button>
        </div>`).join('')}
      </div>
      <div class="up-actions">
        <button class="btn pri" data-setup-play ${state.setupPlaying?'disabled':''}>${state.setupPlaying? t('setup.building'): t('setup.buildKb')}</button>
        <span class="up-count">${t('setup.filesReady', { n: state.uploads.length })}</span>
      </div>`
: `<p class="dz-empty">${t('setup.dzEmpty')}</p>
      <div class="up-actions"><button class="btn" data-upload-sample>${t('setup.useSample')}</button></div>`;
    return `
      <div class="card upload-card">
        <h3 class="up-head">${t('setup.uploadHeading')}</h3>
        <label class="dropzone" id="dropzone">
          <input type="file" id="uploadInput" multiple hidden>
          <span class="dz-icon">↥</span>
          <b>${t('setup.dzTitle')}</b>
          <span class="dz-hint">${t('setup.dzHint')}</span>
        </label>
        ${list}
      </div>`;
  }
  function brandCard() {
    return `
      <div class="card brand-card">
        <h3 class="up-head">${t('setup.brandHeading')}</h3>
        <p class="dz-hint" style="margin:0 0 12px;max-width:60ch">${t('setup.brandSub')}</p>
        <div class="brand-grid">
          <label>${t('setup.brandName')}<input id="brandName" type="text" value="${esc(bName())}" autocomplete="off"></label>
          <label>${t('setup.brandTagline')}<input id="brandTagline" type="text" value="${esc(bTag())}" autocomplete="off"></label>
          <label>${t('setup.brandOwner')}<input id="brandOwner" type="text" value="${esc(bOwnerFirst())}" autocomplete="off"></label>
        </div>
        <div class="up-actions">
          <button class="btn pri" data-brand-apply>${t('setup.brandApply')}</button>
          ${state.brand? `<button class="btn" data-brand-reset>${t('setup.brandReset')}</button>`:''}
        </div>
      </div>`;
  }
  function vSetup() {
    const ob = D.onboarding;
    const s = state.setupStep;
    const fileRows = ob.files.map((f, i) => s >= i + 1
? `<div class="ob-file done"><span class="ob-check">✓</span><div><b>${esc(f.name)}</b><span>${esc(td(f.desc))}</span></div></div>`
: `<div class="ob-file"><span class="ob-check"></span><div><b>${esc(f.name)}</b><span>${esc(td(f.desc))}</span></div></div>`).join('');
    const itemRows = ob.extracted.map((it, i) => s >= i + 5
? `<div class="ob-item"><span class="ob-check">✓</span><span>${esc(td(it.title))}</span><span class="ob-cat">${esc(td(it.cat))}</span></div>`:'').join('');
    const chat = s >= 12? `
      <div class="msgs" style="padding:10px 2px 2px">
        <div class="msg cust">${esc(ob.testQ)}</div>
        ${s === 13?'<div class="typing"><i></i><i></i><i></i></div>':''}
        ${s >= 14? `<div class="msg ai">${esc(ob.testA)}<br><span class="cite"><span class="cite-k">${t('msg.source')}</span>${esc(td(ob.testCite))}</span></div>`:''}
      </div>`:'';
    return `
      <div class="card brief">
        <h3>${t('setup.heading')}</h3>
        <p>${esc(td(ob.intro))}</p>
      </div>
      ${brandCard()}
      ${uploadCard()}
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
          <p class="ob-sub">${s >= 11? esc(td(ob.review)): t('setup.waitsFor2')}</p>
          ${chat}
        </div>
        <div class="card ob-stage ${s >= 15?'on':''}">
          <div class="ob-num">4</div><h3>${t('setup.step4Title')}</h3>
          <p class="ob-sub">${s >= 15? esc(td(ob.live)): t('setup.waitsFor3')}</p>
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
        ${D.kpis.map((k) => `<div class="stat"><b>${esc(k.value)}</b><span>${esc(td(k.label))}</span><div class="kpi-delta">${esc(td(k.delta))}</div></div>`).join('')}
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
          ${dataTable([t('insights.colStage'), t('insights.colCount'), t('insights.colPctPrev')], D.funnel.map((f, i) => [td(f.stage), f.n, i? Math.round((f.n / D.funnel[i - 1].n) * 100) +'%':'—']))}
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
          ${dataTable([t('insights.colDay'), t('insights.colLow'), t('insights.colExpected'), t('insights.colHigh')], D.forecast.map((f) => [td(f.day), f.lo, f.mid, f.hi]))}
        </div>
        <div class="card chart-card">
          <h3>${t('insights.servicesTitle')}</h3>
          <div class="sub">${t('insights.servicesSub')}</div>
          ${servicesChart()}
          ${dataTable([t('insights.colService'), t('insights.colBookings'), t('insights.colRevenue')], D.topServices.map((s) => [td(s.name), s.bookings, money(s.revenue)]))}
        </div>
        <div class="card chart-card">
          <h3>${esc(td(D.teamCompare.title))}</h3>
          <div class="sub">${t('insights.teamCompareSub')}</div>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr>${D.teamCompare.cols.map((c) => `<th>${esc(td(c))}</th>`).join('')}</tr></thead>
            <tbody>${D.teamCompare.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i?'num':''}">${i === 0?'<b>' + esc(td(c)) +'</b>': esc(td(c))}</td>`).join('')}</tr>`).join('')}</tbody>
          </table></div>
          <p style="font-size:12.5px;color:var(--ink-2);margin:10px 0 0;max-width:60ch">${esc(td(D.teamCompare.note))}</p>
        </div>
        <div class="card strategy">
          <h3 style="margin:0 0 8px;font-size:13.5px">${esc(td(D.strategy.title))}</h3>
          <ul style="margin:0;padding-left:18px">${D.strategy.points.map((p) => `<li>${esc(td(p))}</li>`).join('')}</ul>
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
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${td(f.stage)}</text>
          <rect x="${L}" y="${yy}" width="${w}" height="${rowH - 8}" rx="4" fill="${colors[i]}" data-tip="${td(f.stage)}: ${f.n}${conv? t('chart.funnelTipSuffix', { pct: conv }):''}"/>
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
        <circle cx="${x(i)}" cy="${y(d.mid)}" r="3.2" fill="var(--chart-1)" data-tip="${t('chart.forecastTip', { day: td(d.day), n: d.mid, lo: d.lo, hi: d.hi })}"/>
        <text x="${x(i)}" y="${H - 7}" text-anchor="middle">${td(d.day).split(' ')[0]}</text>`).join('')}
      <text class="val" x="${x(0) + 4}" y="${T + 2}">${esc(td(D.forecastNote))}</text>
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
          <text x="${L - 8}" y="${yy + rowH / 2 + 3.5}" text-anchor="end">${td(s.name)}</text>
          <rect x="${L}" y="${yy}" width="${w}" height="${rowH - 8}" rx="4" fill="var(--chart-1)" data-tip="${t('chart.serviceTip', { name: td(s.name), money: money(s.revenue), n: s.bookings })}"/>
          <text class="val" x="${L + w + 7}" y="${yy + rowH / 2 + 3.5}">${t('chart.serviceLabel', { money: money(s.revenue), n: s.bookings })}</text>`;
      }).join('')}
    </svg>`;
  }

  // ---------- Operations (finance / materials / staff) ----------
  const kMoney = (n) => Math.abs(n) >= 1000? '$' + (n / 1000).toFixed(n % 1000 === 0? 0: 1) + 'k': money(n);
  function finBars() {
    const p = D.finance.periods[state.finPeriod];
    const W = 460, H = 190, L = 40, R = 10, T = 14, B = 26;
    const n = p.cols.length;
    const max = Math.max(...p.revenue, ...p.expense) * 1.05;
    const gw = (W - L - R) / n;
    const bw = Math.min(18, gw / 3);
    const y = (v) => T + (1 - v / max) * (H - T - B);
    const grid = [0, max / 2, max].map((v) => `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end">${kMoney(Math.round(v))}</text>`).join('');
    const bars = p.cols.map((c, i) => {
      const cx = L + gw * i + gw / 2;
      const rev = p.revenue[i], exp = p.expense[i];
      return `
        <rect x="${cx - bw - 1}" y="${y(rev)}" width="${bw}" height="${y(0) - y(rev)}" rx="3" fill="var(--chart-1)" data-tip="${esc(c)} · ${t('ops.revenue')} ${money(rev)}"/>
        <rect x="${cx + 1}" y="${y(exp)}" width="${bw}" height="${y(0) - y(exp)}" rx="3" fill="var(--serious)" data-tip="${esc(c)} · ${t('ops.expense')} ${money(exp)}"/>
        <text x="${cx}" y="${H - 8}" text-anchor="middle">${esc(td(c))}</text>`;
    }).join('');
    return `<svg class="viz" viewBox="0 0 ${W} ${H}">${grid}<line class="axis" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>${bars}</svg>
      <div style="display:flex;gap:14px;font-size:11.5px;color:var(--muted);margin-top:2px">
        <span><span class="dot" style="background:var(--chart-1)"></span> ${t('ops.legendRev')}</span>
        <span><span class="dot" style="background:var(--serious)"></span> ${t('ops.legendExp')}</span>
      </div>`;
  }
  function opsFinance() {
    const f = D.finance;
    const maxExp = Math.max(...f.expenseBreakdown.map((e) => e.amount));
    return `
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat"><b>${money(f.monthRevenue)}</b><span>${t('ops.revenue')}</span></div>
        <div class="stat"><b>${money(f.monthExpense)}</b><span>${t('ops.expense')}</span></div>
        <div class="stat"><b>${money(f.monthNet)}</b><span>${t('ops.net')}</span></div>
        <div class="stat"><b>${esc(f.margin)}</b><span>${t('ops.margin')}</span></div>
      </div>
      <div class="grid c2" style="margin-top:14px;align-items:start">
        <div class="card chart-card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <h3 style="margin:0">${t('ops.revVsExp')}</h3>
            <div class="spacer"></div>
            <div class="seg sm">
              ${['day','month','year'].map((pp) => `<button class="${state.finPeriod === pp?'on':''}" data-fin-period="${pp}">${t('ops.period' + pp[0].toUpperCase() + pp.slice(1))}</button>`).join('')}
            </div>
          </div>
          ${finBars()}
        </div>
        <div class="card chart-card">
          <h3>${t('ops.expenseBreakdown')}</h3>
          <div style="margin-top:8px">
            ${f.expenseBreakdown.map((e) => `
              <div class="theme-row">
                <span style="min-width:150px">${esc(td(e.cat))}</span>
                <span class="bar" style="width:${Math.round((e.amount / maxExp) * 160)}px;background:var(--serious)"></span>
                <span class="n">${money(e.amount)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <h2 class="sec">${t('ops.recentTx')}</h2>
      <div class="card tbl-wrap" style="padding:6px 10px">
        <table class="tbl">
          <thead><tr><th>${t('insights.colDate')}</th><th>${t('ops.txItem')}</th><th class="num">${t('ops.txAmount')}</th></tr></thead>
          <tbody>${f.transactions.map((x) => `<tr>
            <td style="color:var(--muted);white-space:nowrap">${fmtRel(x.date)}</td>
            <td>${esc(td(x.item))}</td>
            <td class="num" style="color:${x.type ==='in'?'var(--good-text)':'var(--crit)'}">${x.type ==='in'?'+':'−'}${money(x.amount)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
  }
  const MAT_STATUS = { ok:['ops.statusOk','st-good'], low:['ops.statusLow','human'], out:['ops.statusOut','esc'] };
  function opsMaterials() {
    const m = D.materials;
    const poKey = { delivered:'ops.poDelivered', ordered:'ops.poOrdered', pending:'ops.poPending' };
    return `
      <h2 class="sec">${t('ops.inventory')}</h2>
      <div class="card tbl-wrap" style="padding:6px 10px">
        <table class="tbl">
          <thead><tr><th>${t('ops.txItem')}</th><th class="num">${t('ops.stock')}</th><th class="num">${t('ops.reorder')}</th><th>${t('ops.matStatus')}</th><th></th></tr></thead>
          <tbody>${m.inventory.map((it) => `<tr>
            <td><b>${esc(td(it.name))}</b></td>
            <td class="num">${it.stock} ${esc(td(it.unit))}</td>
            <td class="num">${it.reorder}</td>
            <td><span class="tagchip ${MAT_STATUS[it.status][1]}">${t(MAT_STATUS[it.status][0])}</span></td>
            <td>${it.status!=='ok'? `<button class="btn sm" data-reorder="${esc(it.name)}">${t('ops.reorderBtn')}</button>`:''}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <h2 class="sec">${t('ops.purchases')}</h2>
      <div class="card tbl-wrap" style="padding:6px 10px">
        <table class="tbl">
          <thead><tr><th>${t('ops.txItem')}</th><th>${t('ops.poQty')}</th><th class="num">${t('ops.poCost')}</th><th>${t('ops.poSupplier')}</th><th>${t('ops.poStatus')}</th></tr></thead>
          <tbody>${m.purchases.map((po) => `<tr>
            <td><b>${esc(td(po.item))}</b><br><span style="color:var(--muted);font-size:12px">${fmtRel(po.date)}</span></td>
            <td>${esc(td(po.qty))}</td>
            <td class="num">${money(po.cost)}</td>
            <td>${esc(td(po.supplier))}</td>
            <td><span class="tagchip ${po.status ==='delivered'?'st-good': po.status ==='ordered'?'ai':''}">${t(poKey[po.status])}</span></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
  }
  function opsStaff() {
    const s = D.staff;
    const payroll = s.roster.reduce((a, r) => a + r.pay, 0);
    return `
      <div class="stat-row" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat"><b>${s.roster.length}</b><span>${t('ops.roster')}</span></div>
        <div class="stat"><b>${money(payroll)}</b><span>${t('ops.payrollTotal')}</span></div>
        <div class="stat"><b>${s.roster.reduce((a, r) => a + r.records, 0)}</b><span>${t('ops.staffRecords')}</span></div>
      </div>
      <h2 class="sec">${t('ops.roster')}</h2>
      <div class="card tbl-wrap" style="padding:6px 10px">
        <table class="tbl">
          <thead><tr><th>${t('trust.person')}</th><th>${t('ops.staffRole')}</th><th class="num">${t('ops.staffPay')}</th><th class="num">${t('ops.staffShifts')}</th><th class="num">${t('ops.staffRating')}</th><th class="num">${t('ops.staffRecords')}</th></tr></thead>
          <tbody>${s.roster.map((r) => `<tr>
            <td><b>${esc(r.name)}</b></td><td>${esc(td(r.role))}</td>
            <td class="num">${money(r.pay)}</td><td class="num">${r.shiftsWeek}</td>
            <td class="num">${esc(r.rating)}</td><td class="num">${r.records}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <h2 class="sec">${t('ops.weeklyShifts')}</h2>
      <div class="card tbl-wrap" style="padding:10px 12px">
        <table class="tbl shifts">
          <thead><tr><th></th>${s.shifts.days.map((d) => `<th class="num">${esc(td(d))}</th>`).join('')}</tr></thead>
          <tbody>${s.shifts.rows.map((r) => `<tr><td><b>${esc(r.name)}</b></td>${r.on.map((o) => `<td class="num">${o? '<span class="shift-on">●</span>':'<span class="shift-off">·</span>'}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;
  }
  function vOperations() {
    const tabs = [['finance','ops.finance'],['materials','ops.materials'],['staff','ops.staff']];
    const body = state.opsTab ==='materials'? opsMaterials(): state.opsTab ==='staff'? opsStaff(): opsFinance();
    return `
      <div class="tabbtns">${tabs.map(([id, k]) => `<button class="tabbtn ${state.opsTab === id?'on':''}" data-ops-tab="${id}">${t(k)}</button>`).join('')}</div>
      ${body}`;
  }

  // ---------- guided tour ----------
  const TOUR = [
    { view:'today', n: 1 }, { view:'inbox', n: 2 }, { view:'inbox', n: 3 }, { view:'customers', n: 4 },
    { view:'marketing', n: 5 }, { view:'social', n: 6 }, { view:'trust', n: 7 }, { view:'insights', n: 8 },
    { view:'setup', n: 9 },
  ];
  function introCard() {
    return `
      <div class="intro-ovl" data-intro-backdrop>
        <div class="intro" role="dialog" aria-modal="true" aria-label="${t('intro.aria')}">
          <div class="intro-mark"><span class="mark" aria-hidden="true">♜</span><b>Rook</b><span class="intro-tag">${t('logo.tagline')}</span></div>
          <h2>${t('intro.title')}</h2>
          <p>${t('intro.body')}</p>
          <ul class="intro-list">
            <li><b>${t('intro.b1t')}</b> ${t('intro.b1')}</li>
            <li><b>${t('intro.b2t')}</b> ${t('intro.b2')}</li>
            <li><b>${t('intro.b3t')}</b> ${t('intro.b3')}</li>
          </ul>
          <div class="intro-note">${t('intro.simNote')}</div>
          <div class="intro-actions">
            <button class="btn" data-intro-dismiss>${t('intro.explore')}</button>
            <button class="btn pri" data-intro-tour>${t('intro.tour')}</button>
          </div>
        </div>
      </div>`;
  }
  function dismissIntro() { state.intro = false; state.introSeen = true; savePrefs(); render(); }
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
      <div class="side-foot"><b>${esc(bName())}</b><br>${esc(D.merchant.address)}<br>${esc(td(D.merchant.hours))}
        <br><button class="reset-link" data-reset title="${t('demo.resetHint')}">${t('demo.reset')}</button></div>`;
    $('#tabbar').innerHTML = NAV_IDS.map((id) => `
      <button class="${state.view === id?'on':''}" data-nav="${id}">${IC[id]}${t('nav.' + id)}</button>`).join('');
  }
  function renderTop() {
    $('#topbar').innerHTML = `
      <h1>${t('title.' + state.view)}</h1>
      <span class="sub">${esc(bName())} · ${esc(bTag())}</span>
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
        <div class="seg pal" role="group" aria-label="${t('aria.paletteGroup')}">
          ${['azure','indigo','sky'].map((p) => `<button class="pal-dot pal-${p} ${state.palette === p?'on':''}" data-palette="${p}" title="${t('palette.' + p)}" aria-label="${t('palette.' + p)}"><span></span></button>`).join('')}
        </div>
        <button class="btn sm icon-btn" data-intro-open title="${t('intro.help')}" aria-label="${t('intro.help')}">?</button>
        <button class="btn sm" data-tour-start>${state.tour? '● ' + t('tour.running'): '▶ ' + t('tour.button')}</button>
        <span class="chip time">${esc(D.merchant.nowLabel)}</span>
        <span class="chip sim">${t('sim.badge')}</span>
      </div>`;
  }

  let lastView = null;
  function render() {
    renderSide();
    renderTop();
    const views = { today: vToday, inbox: vInbox, bookings: vBookings, followup: vFollowup, customers: vCustomers, marketing: vMarketing, social: vSocial, reputation: vReputation, brain: vBrain, insights: vInsights, operations: vOperations, trust: vTrust, setup: vSetup };
    const el = $('#view');
    el.innerHTML = applyBrand(views[state.view]());
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
    const oldIntro = $('.intro-ovl');
    if (oldIntro) oldIntro.remove();
    if (state.intro) document.body.insertAdjacentHTML('beforeend', introCard());
    bindHover();
    bindUpload();
    bindAsk();
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
    state.custChannel = null;
    state.mobilePane ='list';
    state.phoneView = null;
    state.wiz = null;          // wizard copy variants are per-industry
    state.campOpen = {};
    state.opsTab ='finance';
    state.finPeriod ='month';
    state.askLog = [];
    render();
    toast(t('toast.switchedTemplate', { industry: t(id ==='pets'?'industry.pets':'industry.beauty') }));
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const closePhone = e.target.closest('[data-close-phone-btn]') ||
      (e.target.classList && e.target.classList.contains('phone-ovl')? e.target: null);
    if (closePhone) { state.phoneView = null; render(); return; }
    if (e.target.classList && e.target.classList.contains('intro-ovl')) { dismissIntro(); return; }
    const el = e.target.closest('[data-print],[data-ask-send],[data-ask-example],[data-intro-open],[data-intro-dismiss],[data-intro-tour],[data-nav],[data-conv],[data-open-conv],[data-takeover],[data-simulate],[data-approve],[data-hold],[data-approve-camp],[data-post-reply],[data-filter],[data-cust],[data-back-cust],[data-back],[data-toast],[data-industry],[data-lang],[data-phone],[data-setup-play],[data-brief-phone],[data-tour-start],[data-tour-next],[data-tour-back],[data-tour-end],[data-drill],[data-clear-channel],[data-goto],[data-ops-tab],[data-fin-period],[data-reorder],[data-wiz-toggle],[data-wiz-regen],[data-wiz-publish],[data-wiz-reset],[data-wiz-poster],[data-camp-toggle],[data-reply-all],[data-palette],[data-upload-remove],[data-upload-sample],[data-reset],[data-brand-apply],[data-brand-reset]');
    if (!el) return;
    // preserve any in-progress wizard edits before a re-render (except regenerate, which replaces)
    if ((el.dataset.wizToggle!== undefined || el.dataset.wizPublish!== undefined || el.dataset.wizPoster!== undefined) && state.wiz) {
      const ta = $('#wizContent'); if (ta) state.wiz.content = ta.value;
    }
    if (el.dataset.introOpen!== undefined) { state.intro = true; render(); }
    else if (el.dataset.introDismiss!== undefined) { dismissIntro(); }
    else if (el.dataset.introTour!== undefined) { state.intro = false; state.introSeen = true; savePrefs(); state.tour = 1; state.view = TOUR[0].view; render(); window.scrollTo(0, 0); }
    else if (el.dataset.palette) {
      if (state.palette!== el.dataset.palette) {
        state.palette = el.dataset.palette;
        document.documentElement.dataset.palette = state.palette;
        savePrefs();
        render();
      }
    }
    else if (el.dataset.brandApply!== undefined) {
      const gv = (id) => { const n = $('#' + id); return n? n.value.trim():''; };
      const name = gv('brandName'), tagline = gv('brandTagline'), ownerFirst = gv('brandOwner');
      if (!name && !tagline && !ownerFirst) { state.brand = null; }
      else { state.brand = { name, tagline, ownerFirst }; }
      savePrefs(); render(); toast(t('setup.brandToast'));
    }
    else if (el.dataset.brandReset!== undefined) { state.brand = null; savePrefs(); render(); toast(t('setup.brandResetToast')); }
    else if (el.dataset.askSend!== undefined) { const n = $('#askInput'); askAI(n? n.value:''); }
    else if (el.dataset.askExample!== undefined) { askAI(el.dataset.askExample); }
    else if (el.dataset.print!== undefined) { doPrint(); }
    else if (el.dataset.reset!== undefined) { resetDemo(); }
    else if (el.dataset.uploadRemove!== undefined) { state.uploads.splice(+el.dataset.uploadRemove, 1); savePrefs(); render(); }
    else if (el.dataset.uploadSample!== undefined) {
      state.uploads = D.onboarding.files.map((f, i) => ({ name: f.name, size: (i + 2) * 268 * 1024 + i * 7331 }));
      savePrefs();
      render();
    }
    else if (el.dataset.industry) switchIndustry(el.dataset.industry);
    else if (el.dataset.goto) {
      state.view = el.dataset.goto; state.custId = null; state.custChannel = null;
      state.custFilter = el.dataset.gotoFilter || 'All';
      state.mobilePane = el.dataset.gotoConv? 'thread':'list'; state.phoneView = null;
      if (el.dataset.gotoOptab) state.opsTab = el.dataset.gotoOptab;
      if (el.dataset.gotoConv) state.convId = el.dataset.gotoConv;
      render(); window.scrollTo(0, 0);
    }
    else if (el.dataset.opsTab) { state.opsTab = el.dataset.opsTab; render(); }
    else if (el.dataset.finPeriod) { state.finPeriod = el.dataset.finPeriod; render(); }
    else if (el.dataset.reorder!== undefined) { toast(t('ops.reorderToast')); }
    else if (el.dataset.wizToggle!== undefined) {
      const kind = el.dataset.wizToggle, val = el.dataset.wizVal;
      state.wiz[kind][val] =!state.wiz[kind][val];
      render();
    }
    else if (el.dataset.wizRegen!== undefined) {
      state.wiz.variantIdx = (state.wiz.variantIdx + 1) % D.publishWizard.variants.length;
      state.wiz.content = D.publishWizard.variants[state.wiz.variantIdx];
      render();
    }
    else if (el.dataset.wizPublish!== undefined) {
      const w = state.wiz;
      const has = (o) => Object.values(o).some(Boolean);
      if (!has(w.goals) || !has(w.audiences) || !has(w.platforms)) { toast(t('mkt.needSelection')); return; }
      w.published = true; toast(t('mkt.publishToast')); render();
    }
    else if (el.dataset.wizPoster!== undefined) { state.wiz.poster = +el.dataset.wizPoster; render(); }
    else if (el.dataset.wizReset!== undefined) { state.wiz = freshWiz(); render(); }
    else if (el.dataset.replyAll!== undefined) {
      const pend = D.reviews.filter((r) => r.replyStatus!=='posted' && !state.reviewPosted[r.id]);
      pend.forEach((r) => { state.reviewPosted[r.id] = true; });
      toast(t('rep.replyAllToast', { n: pend.length }));
      render();
    }
    else if (el.dataset.campToggle) { const id = el.dataset.campToggle; state.campOpen[id] =!state.campOpen[id]; render(); }
    else if (el.dataset.lang) { if (state.lang!== el.dataset.lang) { state.lang = el.dataset.lang; document.documentElement.lang = state.lang; savePrefs(); render(); } }
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
      toast(td(a.toast));
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

  // ---------- document upload ----------
  function addUploads(fileList) {
    if (!fileList || !fileList.length) return;
    for (const f of fileList) state.uploads.push({ name: f.name, size: f.size });
    savePrefs();
    render();
  }
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id ==='uploadInput') addUploads(e.target.files);
  });
  function bindUpload() {
    const dz = $('#dropzone');
    if (!dz) return;
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter','dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { stop(e); dz.classList.add('drag'); }));
    ['dragleave','dragend'].forEach((ev) => dz.addEventListener(ev, (e) => { stop(e); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', (e) => { stop(e); dz.classList.remove('drag'); addUploads(e.dataTransfer && e.dataTransfer.files); });
  }
  function bindAsk() {
    const inp = $('#askInput');
    if (!inp) return;
    inp.addEventListener('keydown', (e) => { if (e.key ==='Enter') { e.preventDefault(); askAI(inp.value); } });
    const log = $('.ask-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

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

  loadPrefs();
  if (!state.introSeen) state.intro = true;
  document.documentElement.dataset.palette = state.palette;
  document.documentElement.lang = state.lang;
  render();
})();
