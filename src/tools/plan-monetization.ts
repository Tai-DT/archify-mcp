/**
 * Tool 23: Monetization Strategy
 * Revenue model, pricing strategy, break-even analysis
 */

import type { ProjectType, ProjectScale } from '../types/index.js';

export interface MonetizationPlan {
  revenueModel: RevenueModel;
  pricingStrategy: PricingStrategy;
  breakEven: BreakEvenAnalysis;
  metrics: BusinessMetrics;
  recommendations: string[];
}

interface RevenueModel {
  primary: { model: string; description: string; examples: string[] };
  secondary: { model: string; description: string }[];
  antiPatterns: string[];
}

interface PricingStrategy {
  tiers: PricingTier[];
  currency: string;
  billingCycle: string[];
  annualDiscount: string;
  freeTrialDays: number;
  tips: string[];
}

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  target: string;
  conversionRate: string;
}

interface BreakEvenAnalysis {
  fixedCosts: { item: string; monthly: string }[];
  variableCosts: { item: string; perUser: string }[];
  totalFixedMonthly: string;
  averageRevenuePerUser: string;
  breakEvenUsers: number;
  timeToBreakEven: string;
}

interface BusinessMetrics {
  kpis: { name: string; target: string; description: string }[];
  trackingTools: string[];
}

const revenueModels: Partial<Record<ProjectType, RevenueModel>> = {
  saas: {
    primary: { model: 'Subscription (SaaS)', description: 'Phí hàng tháng/năm cho truy cập platform', examples: ['Slack: $8.75/user/mo', 'Notion: $10/user/mo', 'Linear: $8/user/mo'] },
    secondary: [
      { model: 'Usage-based add-ons', description: 'Charge thêm cho AI tokens, storage, API calls vượt quota' },
      { model: 'Marketplace/Integrations', description: 'Revenue share từ third-party apps/integrations' },
    ],
    antiPatterns: ['❌ Quá nhiều tiers (>4) gây confusion', '❌ Free tier quá generous — không có incentive upgrade', '❌ Lock features quan trọng sau paywall quá sớm'],
  },
  ecommerce: {
    primary: { model: 'Transaction fee', description: 'Commission trên mỗi giao dịch', examples: ['Shopee: 2-5%', 'Amazon: 8-15%', 'Stripe: 2.9% + 30¢'] },
    secondary: [
      { model: 'Subscription for sellers', description: 'Phí hàng tháng cho shop/seller' },
      { model: 'Featured listings', description: 'Quảng cáo sản phẩm nổi bật' },
    ],
    antiPatterns: ['❌ Commission quá cao khiến seller rời đi', '❌ Không có loyalty program cho buyer'],
  },
  marketplace: {
    primary: { model: 'Commission + Service fee', description: 'Commission từ seller + service fee từ buyer', examples: ['Airbnb: 3% host + 14% guest', 'Uber: 25% driver', 'Fiverr: 20% seller + $2 buyer'] },
    secondary: [
      { model: 'Promoted listings', description: 'Seller trả phí để hiển thị cao hơn' },
      { model: 'Premium seller tools', description: 'Analytics, CRM cho power sellers' },
    ],
    antiPatterns: ['❌ Quá cao commission giai đoạn đầu — cần bootstrap liquidity trước'],
  },
  edtech: {
    primary: { model: 'Subscription + Course sales', description: 'Combo subscription truy cập + mua khóa học riêng', examples: ['Coursera: $49/mo (Plus)', 'Udemy: $10-200/course', 'Duolingo: $7/mo'] },
    secondary: [
      { model: 'Certification fees', description: 'Phí cấp chứng chỉ sau hoàn thành khóa học' },
      { model: 'Enterprise/B2B licensing', description: 'License platform cho doanh nghiệp training nhân viên' },
    ],
    antiPatterns: ['❌ Paywall mọi content — cần free content để attract users', '❌ Không có progress/gamification → low retention'],
  },
};

export function planMonetization(
  projectType: ProjectType,
  scale: ProjectScale,
  features: string[] = [],
  estimatedMonthlyCost: number = 200
): MonetizationPlan {
  const model = revenueModels[projectType] || revenueModels.saas!;
  const featureText = features.join(' ').toLowerCase();

  // Pricing tiers
  const tiers: PricingTier[] = [];

  if (projectType === 'saas' || projectType === 'edtech') {
    tiers.push(
      {
        name: '🆓 Free',
        price: '$0',
        features: ['Basic features', 'Limited usage', 'Community support', featureText.includes('ai') ? '10 AI requests/day' : ''].filter(Boolean),
        target: 'Individual users, trial',
        conversionRate: '100% (entry point)',
      },
      {
        name: '⭐ Pro',
        price: '$12-29/mo per user',
        features: ['All features', 'Priority support', 'Advanced analytics', featureText.includes('ai') ? 'Unlimited AI' : '', featureText.includes('chat') ? 'Unlimited chat history' : ''].filter(Boolean),
        target: 'Small teams, power users',
        conversionRate: '5-10% of free users',
      },
      {
        name: '🏢 Business',
        price: '$49-99/mo per user',
        features: ['Everything in Pro', 'SSO/SAML', 'Admin controls', 'API access', 'Custom integrations', 'SLA guarantee'],
        target: 'Growing companies (10-50 users)',
        conversionRate: '2-5% of free users',
      },
      {
        name: '🏛️ Enterprise',
        price: 'Custom (contact sales)',
        features: ['Everything in Business', 'Dedicated support', 'Custom contract', 'On-premise option', 'Data residency', 'Custom SLA'],
        target: 'Large organizations (50+ users)',
        conversionRate: '<1% but highest LTV',
      }
    );
  } else if (projectType === 'ecommerce' || projectType === 'marketplace') {
    tiers.push(
      { name: '🆓 Basic Seller', price: '$0 (commission only)', features: ['List products', 'Basic analytics', 'Standard support'], target: 'New sellers', conversionRate: '100%' },
      { name: '⭐ Pro Seller', price: '$29/mo', features: ['Lower commission rate', 'Featured listings', 'Advanced analytics', 'Priority support'], target: 'Active sellers', conversionRate: '10-20%' },
      { name: '🏪 Shop', price: '$99/mo', features: ['Custom storefront', 'Bulk tools', 'API access', 'Dedicated manager'], target: 'Power sellers', conversionRate: '5%' },
    );
  }

  // Break-even analysis
  const fixedCosts = [
    { item: 'Infrastructure (hosting, DB, CDN)', monthly: `$${estimatedMonthlyCost}` },
    { item: 'SaaS tools (Sentry, email, etc.)', monthly: '$50' },
    { item: 'Domain + SSL', monthly: '$5' },
  ];

  if (featureText.includes('ai')) {
    fixedCosts.push({ item: 'AI API costs (OpenAI/Gemini)', monthly: '$100-500' });
  }

  const totalFixed = estimatedMonthlyCost + 55 + (featureText.includes('ai') ? 200 : 0);
  const arpu = projectType === 'saas' ? 15 : projectType === 'ecommerce' ? 5 : 10;
  const breakEvenUsers = Math.ceil(totalFixed / arpu);

  const breakEven: BreakEvenAnalysis = {
    fixedCosts,
    variableCosts: [
      { item: 'Infrastructure per user', perUser: '$0.01-0.10' },
      { item: 'Email transactional', perUser: '$0.001' },
      { item: 'Payment processing', perUser: '2.9% + $0.30/tx' },
      ...(featureText.includes('ai') ? [{ item: 'AI cost per user', perUser: '$0.50-2.00' }] : []),
    ],
    totalFixedMonthly: `$${totalFixed}`,
    averageRevenuePerUser: `$${arpu}/mo (ARPU)`,
    breakEvenUsers,
    timeToBreakEven: scale === 'mvp' ? '6-12 tháng' : '3-6 tháng',
  };

  // Business metrics
  const metrics: BusinessMetrics = {
    kpis: [
      { name: 'MRR', target: `$${totalFixed * 3}/mo (3x costs)`, description: 'Monthly Recurring Revenue — doanh thu định kỳ' },
      { name: 'CAC', target: '< $50', description: 'Customer Acquisition Cost — chi phí có 1 khách hàng' },
      { name: 'LTV', target: '> 3x CAC', description: 'Lifetime Value — giá trị suốt vòng đời khách hàng' },
      { name: 'Churn Rate', target: '< 5%/mo', description: 'Tỷ lệ hủy subscription hàng tháng' },
      { name: 'Free→Paid', target: '5-10%', description: 'Tỷ lệ chuyển đổi từ free sang paid' },
      { name: 'NPS', target: '> 40', description: 'Net Promoter Score — mức độ giới thiệu' },
      { name: 'DAU/MAU', target: '> 40%', description: 'Daily/Monthly Active Users ratio (stickiness)' },
    ],
    trackingTools: [
      'PostHog / Mixpanel — Product analytics, funnels, cohorts',
      'Stripe Dashboard — Revenue, MRR, churn tracking',
      'Google Analytics — Traffic, acquisition channels',
      'Intercom / Crisp — Customer feedback, NPS surveys',
    ],
  };

  const recommendations = [
    '💰 **Start free, monetize later** — validate product-market fit trước khi charge',
    `🎯 **Break-even**: cần **${breakEvenUsers} paying users** để cover chi phí ($${totalFixed}/mo)`,
    '📈 **Pricing experiment** — A/B test pricing pages, track conversion rate',
    '💳 **Annual billing discount 20%** — tăng cash flow, giảm churn',
    '🎁 **Free trial 14 days** — không yêu cầu credit card để tăng signups',
    '📊 **Track unit economics** — biết CAC, LTV, churn trước khi scale spending',
    '🔄 **Pricing page là landing page quan trọng nhất** — invest vào design + copy',
    '💡 **Value-based pricing** — charge theo giá trị tạo ra, không theo cost',
  ];

  return { revenueModel: model, pricingStrategy: { tiers, currency: 'USD', billingCycle: ['Monthly', 'Annual'], annualDiscount: '20% off', freeTrialDays: 14, tips: [] }, breakEven, metrics, recommendations };
}

export function formatMonetizationPlan(plan: MonetizationPlan): string {
  const lines = ['# 💰 Monetization Strategy\n'];

  // Revenue Model
  lines.push('## 📊 Revenue Model\n');
  lines.push(`**Primary**: ${plan.revenueModel.primary.model}`);
  lines.push(plan.revenueModel.primary.description);
  lines.push(`\n**Benchmarks**: ${plan.revenueModel.primary.examples.join(', ')}\n`);

  if (plan.revenueModel.secondary.length > 0) {
    lines.push('**Secondary revenue**:');
    plan.revenueModel.secondary.forEach(s => lines.push(`- **${s.model}**: ${s.description}`));
  }

  lines.push('\n**Anti-patterns**:');
  plan.revenueModel.antiPatterns.forEach(a => lines.push(a));

  // Pricing
  lines.push('\n## 💳 Pricing Tiers\n');
  lines.push(`**Billing**: ${plan.pricingStrategy.billingCycle.join(' / ')} | **Annual discount**: ${plan.pricingStrategy.annualDiscount} | **Free trial**: ${plan.pricingStrategy.freeTrialDays} days\n`);

  for (const tier of plan.pricingStrategy.tiers) {
    lines.push(`### ${tier.name} — ${tier.price}`);
    lines.push(`Target: ${tier.target} | Conversion: ${tier.conversionRate}`);
    tier.features.forEach(f => lines.push(`- ✅ ${f}`));
    lines.push('');
  }

  // Break-even
  lines.push('## 📈 Break-even Analysis\n');
  lines.push('### Fixed Costs\n');
  lines.push('| Item | Monthly |');
  lines.push('|------|---------|');
  plan.breakEven.fixedCosts.forEach(c => lines.push(`| ${c.item} | ${c.monthly} |`));
  lines.push(`| **Total** | **${plan.breakEven.totalFixedMonthly}** |`);

  lines.push('\n### Variable Costs\n');
  plan.breakEven.variableCosts.forEach(c => lines.push(`- ${c.item}: ${c.perUser}/user`));

  lines.push(`\n**ARPU**: ${plan.breakEven.averageRevenuePerUser}`);
  lines.push(`**Break-even**: **${plan.breakEven.breakEvenUsers} paying users**`);
  lines.push(`**Time to break-even**: ${plan.breakEven.timeToBreakEven}`);

  // Metrics
  lines.push('\n## 📊 Key Metrics (KPIs)\n');
  lines.push('| Metric | Target | Description |');
  lines.push('|--------|--------|-------------|');
  plan.metrics.kpis.forEach(k => lines.push(`| **${k.name}** | ${k.target} | ${k.description} |`));

  lines.push('\n**Tracking tools**:');
  plan.metrics.trackingTools.forEach(t => lines.push(`- ${t}`));

  // Recommendations
  lines.push('\n## 💡 Recommendations\n');
  plan.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
