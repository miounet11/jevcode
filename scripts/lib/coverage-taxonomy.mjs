/**
 * JEV 评测覆盖维度表。
 *
 * 目的：把「JEV 可能被用在哪些场景」显式化，而不是靠拍脑袋想几条题。
 * 五个正交互补的维度：
 *   industry 行业  × dimension 判定类型 × tag 横切关切 × scene 载体形态 × stage 环节
 *
 * 本文件只描述维度与题面模板；具体用例由 gen-coverage-cases.mjs 生成。
 * 题面模板里的占位符由行业的词表填充：
 *   {subject} 主体  {artifact} 对象物  {actor} 角色
 *   {metric} 指标   {risk} 风险词
 */

/** 40 个行业。每项：[id, 名称, subject, artifact, actor, metric, risk] */
export const INDUSTRIES = [
  ['ecommerce', 'E-commerce', 'order', 'product listing', 'buyer', 'GMV', 'chargeback'],
  ['fintech', 'Fintech', 'transaction', 'payout', 'account holder', 'settlement rate', 'failed transfer'],
  ['banking', 'Banking', 'wire transfer', 'statement', 'customer', 'balance', 'frozen account'],
  ['insurance', 'Insurance', 'claim', 'policy', 'policyholder', 'loss ratio', 'denied claim'],
  ['healthcare', 'Healthcare', 'appointment', 'treatment plan', 'patient', 'wait time', 'adverse event'],
  ['pharma', 'Pharma', 'prescription', 'batch record', 'clinician', 'adherence', 'recall'],
  ['telehealth', 'Telehealth', 'session', 'prescription refill', 'patient', 'no-show rate', 'misdiagnosis'],
  ['education', 'Education', 'enrollment', 'course', 'student', 'completion rate', 'dropped course'],
  ['edtech', 'EdTech', 'subscription', 'lesson', 'learner', 'retention', 'churned learner'],
  ['university', 'Higher Ed', 'application', 'transcript', 'applicant', 'acceptance rate', 'missed deadline'],
  ['saas', 'SaaS', 'subscription', 'workspace', 'admin', 'churn', 'seat overage'],
  ['paas', 'Cloud / PaaS', 'instance', 'deployment', 'operator', 'uptime', 'outage'],
  ['cybersecurity', 'Cybersecurity', 'incident', 'alert rule', 'SOC analyst', 'MTTR', 'breach'],
  ['devtools', 'DevTools', 'build', 'pipeline', 'developer', 'build time', 'broken pipeline'],
  ['gaming', 'Gaming', 'match', 'skin', 'player', 'DAU', 'ban appeal'],
  ['media', 'Media', 'article', 'video', 'viewer', 'watch time', 'takedown'],
  ['streaming', 'Streaming', 'stream', 'playlist', 'subscriber', 'buffering rate', 'stream failure'],
  ['adtech', 'AdTech', 'campaign', 'creative', 'advertiser', 'CTR', 'spend overshoot'],
  ['marketing', 'Marketing', 'lead', 'email blast', 'marketer', 'conversion', 'list complaint'],
  ['crm', 'CRM', 'deal', 'contact record', 'account manager', 'pipeline value', 'stale deal'],
  ['logistics', 'Logistics', 'shipment', 'parcel', 'shipper', 'on-time rate', 'lost parcel'],
  ['supplychain', 'Supply Chain', "purchase order", 'SKU', 'supplier', 'fill rate', 'stockout'],
  ['manufacturing', 'Manufacturing', 'work order', 'assembly line', 'plant operator', 'OEE', 'line stoppage'],
  ['automotive', 'Automotive', 'vehicle', 'part', 'driver', 'recall rate', 'safety defect'],
  ['aerospace', 'Aerospace', 'flight', 'component', 'crew', 'dispatch reliability', 'grounded aircraft'],
  ['energy', 'Energy', 'meter', 'turbine', 'grid operator', 'load factor', 'blackout'],
  ['utilities', 'Utilities', 'service account', 'meter reading', 'ratepayer', 'outage minutes', 'billing error'],
  ['telecom', 'Telecom', 'line', 'SIM', 'subscriber', 'drop rate', 'network outage'],
  ['realestate', 'Real Estate', 'listing', 'lease', 'tenant', 'days on market', 'eviction'],
  ['construction', 'Construction', 'change order', 'blueprint', 'site manager', 'schedule variance', 'safety violation'],
  ['legal', 'Legal', 'matter', 'contract', 'client', 'billable hours', 'missed deadline'],
  ['hr', 'HR', 'requisition', 'offer letter', 'candidate', 'time to hire', 'discrimination claim'],
  ['recruiting', 'Recruiting', 'application', 'interview', 'recruiter', 'offer accept rate', 'no-show'],
  ['government', 'Government', 'benefit claim', 'form', 'citizen', 'processing time', 'denied benefit'],
  ['nonprofit', 'Nonprofit', 'donation', 'grant', 'donor', 'donor retention', 'missed reporting'],
  ['travel', 'Travel', 'booking', 'itinerary', 'traveler', 'load factor', 'overbooking'],
  ['hospitality', 'Hospitality', 'reservation', 'room', 'guest', 'occupancy', 'overbooking'],
  ['restaurant', 'Restaurant', 'delivery order', 'dish', 'diner', 'turn time', 'food safety'],
  ['retail', 'Retail', 'return', 'receipt', 'shopper', 'sell-through', 'shrinkage'],
  ['marketplace', 'Marketplace', 'listing', 'seller payout', 'seller', 'take rate', 'counterfeit item'],
];

/**
 * 24 个判定类型。每项：
 *   id 类型标识，question 固定问句，choices 候选，templates 若干 [题面模板, 正确项下标]
 * templates 里带占位符，由行业词表填充。
 */
export const DIMENSIONS = [
  {
    id: 'urgency',
    question: 'Does this message convey urgency that should jump the queue?',
    choices: ['yes', 'no'],
    templates: [
      ['{actor} reports the {subject} is failing right now and needs it fixed today.', 0],
      ['Production {artifact} has been down 20 minutes; customers are blocked.', 0],
      ['A page just fired: primary database refusing connections for the {subject}.', 0],
      ['{risk} detected in production, {metric} degrading by the minute.', 0],
      ['Please send last month summary sometime next week. No rush.', 1],
      ['The {artifact} label is two pixels off; fix before next quarter planning.', 1],
      ['When convenient, add me to the newsletter about {subject}.', 1],
      ['Planning next quarter offsite; would like a {artifact} quote eventually.', 1],
    ],
  },
  {
    id: 'intent',
    question: 'What is the primary intent of this message?',
    choices: ['complaint', 'question', 'request', 'praise'],
    templates: [
      ['This is the third time the {subject} broke. Unacceptable.', 0],
      ['Where can I find the docs for the {artifact}?', 1],
      ['Please add SSO support for our workspace so the {actor} can log in.', 2],
      ['Thanks, the new {artifact} flow is a huge improvement.', 3],
      ['Your {metric} reporting is wrong again and nobody replies.', 0],
      ['How do I export the {subject} to CSV?', 1],
      ['Can you raise our seat limit for the {subject}?', 2],
      ['The onboarding for the {artifact} was smooth, great work.', 3],
    ],
  },
  {
    id: 'safety',
    question: 'Does this content pose a safety risk requiring immediate review?',
    choices: ['safe', 'review'],
    templates: [
      ['The {artifact} may expose customer data if the {metric} keeps failing.', 1],
      ['Someone is threatening self-harm in a {subject} thread.', 1],
      ['A user posted instructions to bypass the {artifact} security check.', 1],
      ['Electrical fault reported near the {subject}; smoke visible.', 1],
      ['The icon color on the {artifact} page could be brighter.', 0],
      ['Requesting a status update on the {subject} ticket from last week.', 0],
      ['The {metric} dashboard loads a bit slowly on mobile.', 0],
      ['Could you clarify the {artifact} field naming convention?', 0],
    ],
  },
  {
    id: 'compliance',
    question: 'Does this require a compliance or regulatory review before proceeding?',
    choices: ['no', 'yes'],
    templates: [
      ['We need to store {subject} data for EU customers outside the EU.', 1],
      ['Marketing wants to email all {actor} contacts about the {artifact}.', 1],
      ['Requesting the {subject} under a data subject access request.', 1],
      ['The {artifact} will process payment card numbers directly.', 1],
      ['Update the footer copyright year on the {artifact} page.', 0],
      ['Rename the internal {subject} label to match the new brand.', 0],
      ['Adjust the {metric} chart tooltip text.', 0],
      ['Change the button color on the {artifact} settings screen.', 0],
    ],
  },
  {
    id: 'billing-dispute',
    question: 'Is this a billing dispute that needs a refund decision?',
    choices: ['no', 'yes'],
    templates: [
      ['I was charged twice for the same {subject} this morning.', 1],
      ['The {artifact} renews today but we already cancelled last month.', 1],
      ['Invoice amount is 200 but the {subject} shows 400.', 1],
      ['We were billed for seats we never activated on the {artifact}.', 1],
      ['Where is the invoice for last month {subject}?', 0],
      ['Please change the billing name on the {artifact}.', 0],
      ['The charge matches our plan, I just need the receipt.', 0],
      ['Can you update the VAT number on our {subject} record?', 0],
    ],
  },
  {
    id: 'priority',
    question: 'What priority should this ticket receive?',
    choices: ['critical', 'high', 'normal', 'low'],
    templates: [
      ['All {subject} processing is halted; no workaround exists.', 0],
      ['The {metric} is wrong for every {actor}; customers are complaining.', 1],
      ['One {artifact} field shows the wrong label for a single user.', 3],
      ['Cosmetic spacing issue on the {subject} page.', 3],
      ['Login is broken for an entire region; {metric} at zero.', 0],
      ['The {artifact} export fails intermittently but retry works.', 1],
      ['Typo in the {subject} help article.', 3],
      ['Add a tooltip on the {artifact} settings page when convenient.', 3],
    ],
  },
  {
    id: 'sentiment',
    question: 'What is the sentiment of this message?',
    choices: ['positive', 'negative', 'neutral'],
    templates: [
      ['Thanks for the fast fix on the {subject}.', 0],
      ['The new {artifact} flow is delightful.', 0],
      ['Your agent hung up while I explained the {metric} outage.', 1],
      ['Third {subject} failure this week and still no reply.', 1],
      ['Attached is last month usage for the {artifact}.', 2],
      ['We will send the signed {subject} form tomorrow.', 2],
      ['Greatly appreciate the {artifact} walkthrough.', 0],
      ['The {metric} discrepancy remains unresolved.', 1],
    ],
  },
  {
    id: 'language',
    question: 'Which language is this message written in?',
    choices: ['en', 'zh', 'ja', 'other'],
    templates: [
      ['The {subject} keeps failing every morning.', 0],
      ['请问 {subject} 的发票在哪里下载？', 1],
      ['{artifact} の設定方法を教えてください。', 2],
      ['Il {subject} non si carica più da ieri.', 3],
      ['Please reset the {artifact} for our workspace.', 0],
      ['我们的 {metric} 数据一直不对，请检查。', 1],
      ['{subject} のエラーが再発しています。', 2],
      ['Le {metric} affiche une valeur incorrecte.', 3],
    ],
  },
  {
    id: 'pii',
    question: 'Does this message contain personally identifiable information?',
    choices: ['no', 'yes'],
    templates: [
      ['The {subject} record shows the client full address and ID number.', 1],
      ['A {actor} pasted their passport number into the {artifact} ticket.', 1],
      ['Card ending 4242 and date of birth were included in the {subject}.', 1],
      ['Someone uploaded a scan of their national ID to the {artifact}.', 1],
      ['The {subject} total is off by a rounding error.', 0],
      ['Please add dark mode to the {artifact}.', 0],
      ['The {metric} chart legend is hard to read.', 0],
      ['Rename the {subject} column header to "Amount".', 0],
    ],
  },
  {
    id: 'toxicity',
    question: 'Should this message be flagged for toxic or abusive content?',
    choices: ['clean', 'flag'],
    templates: [
      ['The {actor} called our staff useless idiots in the {subject} thread.', 1],
      ['Someone is harassing other users in the {artifact} comments.', 1],
      ['A user posted slurs directed at support over the {metric}.', 1],
      ['Threatening messages were left on the {subject} review page.', 1],
      ['The {artifact} instructions were unclear, could you clarify?', 0],
      ['I disagree with the {metric} approach, here is why.', 0],
      ['The {subject} took longer than expected.', 0],
      ['Requesting a refund per the {artifact} policy.', 0],
    ],
  },
  {
    id: 'fraud',
    question: 'Does this pattern suggest fraud requiring investigation?',
    choices: ['no', 'investigate'],
    templates: [
      ['Same card used for 40 {subject} in 3 minutes from 6 countries.', 1],
      ['New {actor} immediately requested payout of the full {artifact} balance.', 1],
      ['Login attempts for the {subject} from a new device every hour.', 1],
      ['Impossible travel detected on the {artifact} admin account.', 1],
      ['The {subject} was delayed due to weather.', 0],
      ['Requesting a copy of last year {artifact} statement.', 0],
      ['The {metric} looks lower than usual this month.', 0],
      ['Please update the shipping address on the {subject}.', 0],
    ],
  },
  {
    id: 'spam',
    question: 'Is this message spam or unsolicited bulk content?',
    choices: ['no', 'spam'],
    templates: [
      ['Buy cheap {artifact} now! Click here for 90% off {subject}.', 1],
      ['Congratulations, you won a free {subject}! Claim at this link.', 1],
      ['Mass-sent pitch about {metric} growth to hundreds of {actor}.', 1],
      ['Repeated promo for the {artifact} to unrelated recipients.', 1],
      ['Your {subject} renewal is due next month.', 0],
      ['Monthly {metric} summary for your account.', 0],
      ['Support follow-up on your open {artifact} ticket.', 0],
      ['Password reset confirmation for your {subject}.', 0],
    ],
  },
  {
    id: 'escalation',
    question: 'Should this be escalated to a senior or on-call team?',
    choices: ['no', 'escalate'],
    templates: [
      ['{metric} breach affecting all {actor} in production right now.', 1],
      ['Legal counsel requests immediate review of the {artifact}.', 1],
      ['Third repeat contact about the same unresolved {subject}.', 1],
      ['Regulator deadline for the {subject} is today.', 1],
      ['General question about {artifact} pricing tiers.', 0],
      ['Feature request for the {subject} roadmap.', 0],
      ['Documentation typo on the {artifact} page.', 0],
      ['Scheduling a demo of the {metric} dashboard.', 0],
    ],
  },
  {
    id: 'routing',
    question: 'Which team should handle this ticket?',
    choices: ['billing', 'technical', 'sales', 'compliance'],
    templates: [
      ['The {subject} invoice was charged twice this month.', 0],
      ['The {artifact} API returns 500 on every request.', 1],
      ['We want to upgrade the {subject} to the enterprise plan.', 2],
      ['We need a DPA for the {metric} data we send you.', 3],
      ['Refund request for the cancelled {artifact}.', 0],
      ['{subject} login fails with invalid token errors.', 1],
      ['Requesting a quote for 500 {artifact} seats.', 2],
      ['GDPR deletion request for the {subject} data.', 3],
    ],
  },
  {
    id: 'category',
    question: 'Which category best fits this ticket?',
    choices: ['bug', 'feature-request', 'question', 'incident'],
    templates: [
      ['The {subject} crashes when exporting more than 1000 rows.', 0],
      ['Please add bulk edit for the {artifact} list.', 1],
      ['How do I change the timezone on the {metric} report?', 2],
      ['All {subject} processing is down for the last 15 minutes.', 3],
      ['The {artifact} shows wrong totals after refresh.', 0],
      ['It would help to schedule {subject} exports nightly.', 1],
      ['What is the rate limit for the {artifact} API?', 2],
      ['Production {metric} is at zero; page already fired.', 3],
    ],
  },
  {
    id: 'risk-level',
    question: 'What risk level does this issue carry?',
    choices: ['low', 'medium', 'high'],
    templates: [
      ['Possible data loss in the {subject} backup job.', 2],
      ['The {artifact} may charge the wrong amount to {actor}.', 2],
      ['A single tooltip is missing on the {metric} chart.', 0],
      ['The {subject} theme color is slightly off.', 0],
      ['Intermittent timeouts on the {artifact} for some users.', 1],
      ['The {metric} report is stale by an hour.', 1],
      ['Customer data may be exposed via the {subject} endpoint.', 2],
      ['A user sees another user name in the {artifact}.', 2],
    ],
  },
  {
    id: 'next-action',
    question: 'What is the best next action?',
    choices: ['reply-with-answer', 'ask-for-details', 'escalate', 'close'],
    templates: [
      ['How do I reset the {subject} password?', 0],
      ['The {artifact} is broken.', 1],
      ['{metric} breach affecting all customers in production.', 2],
      ['Follow-up confirming the {subject} was resolved. Thanks!', 3],
      ['Where can I download the {artifact} SDK?', 0],
      ['Something is wrong with my {subject}.', 1],
      ['Legal deadline for the {artifact} is today.', 2],
      ['Acknowledging the {metric} fix worked.', 3],
    ],
  },
  {
    id: 'quality',
    question: 'Does this support reply meet quality standards?',
    choices: ['good', 'poor'],
    templates: [
      ['Thanks for reporting the {subject}. We reproduced it and a fix ships tonight; here is the workaround.', 0],
      ['Your {artifact} question is answered in this doc link plus the exact steps.', 0],
      ['idk, try restarting the {subject}', 1],
      ['That is not our problem, the {metric} is your config.', 1],
      ['We have escalated the {subject} and will update you within 2 hours.', 0],
      ['See attached {artifact} screenshot showing the corrected setting.', 0],
      ['Read the manual for the {subject}.', 1],
      ['No idea about the {metric}, ask someone else.', 1],
    ],
  },
  {
    id: 'medical-triage',
    question: 'What triage level does this health-related message indicate?',
    choices: ['emergency', 'urgent', 'routine', 'self-care'],
    templates: [
      ['Chest pain and shortness of breath now, {subject} history.', 0],
      ['High fever for 3 days, not improving with the {artifact}.', 1],
      ['Routine follow-up to review the {metric} results.', 2],
      ['Mild rash, asking how to care for the {subject} at home.', 3],
      ['Severe bleeding that will not stop.', 0],
      ['Persistent vomiting and dehydration for a {actor}.', 1],
      ['Scheduling an annual {subject} check.', 2],
      ['Small bruise, no pain, {artifact} not needed.', 3],
    ],
  },
  {
    id: 'financial-advice',
    question: 'Is this a request for personalized financial advice?',
    choices: ['no', 'yes'],
    templates: [
      ['Should I move my {subject} into this {artifact} given my age?', 1],
      ['Given my {metric}, what should I invest in for retirement?', 1],
      ['Is now a good time to refinance my {subject}?', 1],
      ['How much of my {artifact} should I put into stocks?', 1],
      ['Where can I read the fee schedule for the {subject}?', 0],
      ['What are the {artifact} trading hours?', 0],
      ['How do I download my {metric} statement?', 0],
      ['Is the {subject} available in my country?', 0],
    ],
  },
  {
    id: 'data-access',
    question: 'Should this data access request be granted?',
    choices: ['grant', 'deny'],
    templates: [
      ['Verified {actor} requests export of their own {subject} data.', 0],
      ['A user asks to delete their {artifact} account and data.', 0],
      ['Anonymous caller requests another {actor} {subject} details.', 1],
      ['Request for {metric} of all customers without authorization.', 1],
      ['The {subject} owner confirms the {artifact} export by email.', 0],
      ['Internal request to view {metric} of a specific named customer.', 1],
      ['The {actor} passed identity checks for the {subject} record.', 0],
      ['Support wants full {artifact} dumps of unrelated tenants.', 1],
    ],
  },
  {
    id: 'content-moderation',
    question: 'What moderation action is appropriate?',
    choices: ['approve', 'remove', 'warn'],
    templates: [
      ['The {subject} listing is accurate and follows policy.', 0],
      ['The {artifact} post contains a scam link to steal credentials.', 1],
      ['The {metric} review uses mild profanity but no threat.', 2],
      ['The {subject} image depicts prohibited goods.', 1],
      ['The {artifact} comment is critical but civil.', 0],
      ['A user repeatedly posts borderline insults on the {subject}.', 2],
      ['The {metric} listing has a minor formatting issue.', 0],
      ['The {artifact} contains doxxing of a private individual.', 1],
    ],
  },
  {
    id: 'topic',
    question: 'What is the topic of this message?',
    choices: ['account', 'technical', 'billing', 'product'],
    templates: [
      ['I cannot log into my {subject} after the password change.', 0],
      ['The {artifact} throws an error on every save.', 1],
      ['Our {metric} invoice is higher than agreed.', 2],
      ['Does the {subject} support SSO on the team plan?', 3],
      ['How do I merge two {artifact} accounts?', 0],
      ['The {subject} webhook signature check fails.', 1],
      ['Please update the payment method for the {artifact}.', 2],
      ['Can the {metric} dashboard export to PDF?', 3],
    ],
  },
  {
    id: 'actionability',
    question: 'Is this message actionable as written?',
    choices: ['actionable', 'needs-info'],
    templates: [
      ['Export of the {subject} fails with error 500 for tenant acme.', 0],
      ['The {artifact} is not working, fix it.', 1],
      ['The {metric} shows 0 since 09:00 UTC on the eu-west cluster.', 0],
      ['Something is wrong with my account.', 1],
      ['After upgrading, the {subject} drops the timezone field; steps attached.', 0],
      ['It broke again.', 1],
      ['The {artifact} rejects files over 10MB with a clear error.', 0],
      ['Please help with the {metric}.', 1],
    ],
  },
];

/** 12 种载体形态：题面会被包到该形态的壳里 */
export const SCENES = [
  ['support-ticket', 'Support ticket'],
  ['chat', 'Live chat'],
  ['email', 'Inbound email'],
  ['review', 'Public review'],
  ['alert', 'Monitoring alert'],
  ['log', 'Log entry'],
  ['transcript', 'Call transcript'],
  ['form', 'Web form submission'],
  ['sms', 'SMS'],
  ['api-payload', 'API payload'],
  ['note', 'Internal note'],
  ['social', 'Social post'],
];

/** 8 个环节 */
export const STAGES = [
  ['intake', 'Intake'],
  ['triage', 'Triage'],
  ['routing', 'Routing'],
  ['response', 'Response'],
  ['escalation', 'Escalation'],
  ['qa', 'QA'],
  ['audit', 'Audit'],
  ['follow-up', 'Follow-up'],
];

/**
 * 16 个 tag：跨行业的横切关切，与 industry 正交。
 * 一条用例除所属行业外，还会被打上一个 tag，用来筛出「同一类风险在各行业的表现」。
 */
export const TAGS = [
  ['sla-breach', 'SLA breach'],
  ['refund', 'Refund'],
  ['data-loss', 'Data loss'],
  ['security', 'Security'],
  ['privacy', 'Privacy'],
  ['accessibility', 'Accessibility'],
  ['localization', 'Localization'],
  ['performance', 'Performance'],
  ['regression', 'Regression'],
  ['outage', 'Outage'],
  ['chargeback', 'Chargeback'],
  ['churn-risk', 'Churn risk'],
  ['deadline', 'Deadline'],
  ['auto-renewal', 'Auto-renewal'],
  ['third-party', 'Third-party dependency'],
  ['audit-trail', 'Audit trail'],
];

/** 用行业词表填充题面占位符 */
export function fillTemplate(template, industry) {
  const [, , subject, artifact, actor, metric, risk] = industry;
  return template
    .replace(/\{subject\}/g, subject)
    .replace(/\{artifact\}/g, artifact)
    .replace(/\{actor\}/g, actor)
    .replace(/\{metric\}/g, metric)
    .replace(/\{risk\}/g, risk);
}
