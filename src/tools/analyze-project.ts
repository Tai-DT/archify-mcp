import type { ProjectInput, ProjectAnalysis, ProjectType, ProjectScale, Risk, TechnicalRequirement, MvpScope, AudienceAnalysis, MarketInsight, FeatureGroup } from '../types/index.js';
import { featureTemplates } from '../knowledge/features-db.js';

// Keywords for auto-detecting project type
const typeKeywords: Record<ProjectType, string[]> = {
  ecommerce: ['shop', 'store', 'product', 'cart', 'checkout', 'payment', 'sell', 'buy', 'commerce', 'retail', 'inventory', 'bán hàng', 'cửa hàng', 'giỏ hàng', 'thanh toán'],
  saas: ['saas', 'subscription', 'tenant', 'dashboard', 'analytics', 'workspace', 'team', 'plan', 'pricing', 'b2b', 'quản lý', 'doanh nghiệp'],
  social_network: ['social', 'friend', 'follow', 'feed', 'post', 'share', 'like', 'comment', 'community', 'mạng xã hội', 'bạn bè', 'chia sẻ'],
  marketplace: ['marketplace', 'vendor', 'seller', 'buyer', 'listing', 'booking', 'commission', 'sàn', 'đặt chỗ'],
  content_platform: ['blog', 'article', 'content', 'publish', 'cms', 'media', 'news', 'magazine', 'bài viết', 'nội dung'],
  fintech: ['finance', 'banking', 'payment', 'wallet', 'transfer', 'investment', 'trading', 'crypto', 'tài chính', 'ngân hàng'],
  healthtech: ['health', 'medical', 'patient', 'doctor', 'hospital', 'telemedicine', 'appointment', 'sức khỏe', 'bệnh viện'],
  edtech: ['education', 'course', 'learning', 'student', 'teacher', 'quiz', 'lesson', 'tutorial', 'giáo dục', 'khóa học', 'học sinh'],
  iot: ['iot', 'sensor', 'device', 'smart home', 'automation', 'monitoring', 'hardware', 'thiết bị', 'cảm biến'],
  ai_ml: ['ai', 'machine learning', 'model', 'chatbot', 'nlp', 'prediction', 'recommendation', 'trí tuệ nhân tạo'],
  gaming: ['game', 'player', 'score', 'level', 'multiplayer', 'leaderboard', 'trò chơi'],
  enterprise: ['enterprise', 'erp', 'crm', 'workflow', 'approval', 'compliance', 'audit'],
  mobile_app: ['mobile', 'app', 'ios', 'android', 'react native', 'flutter', 'ứng dụng di động'],
  api_service: ['api', 'service', 'endpoint', 'webhook', 'integration', 'developer'],
  devtool: ['developer tool', 'cli', 'sdk', 'plugin', 'extension', 'ide', 'công cụ lập trình'],
  other: [],
};

function detectProjectType(description: string): ProjectType {
  const desc = description.toLowerCase();
  let bestMatch: ProjectType = 'other';
  let bestScore = 0;

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    const score = keywords.filter(k => desc.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = type as ProjectType;
    }
  }
  return bestMatch;
}

function detectScale(input: ProjectInput): ProjectScale {
  if (input.scale) return input.scale;
  if (input.budget === 'bootstrap' || input.teamSize === 1) return 'mvp';
  if (input.budget === 'seed' || (input.teamSize && input.teamSize <= 5)) return 'startup';
  if (input.budget === 'series_a' || (input.teamSize && input.teamSize <= 20)) return 'growth';
  return 'enterprise';
}

function generateRisks(projectType: ProjectType, scale: ProjectScale): Risk[] {
  const risks: Risk[] = [];

  // Universal risks
  risks.push({
    category: 'technical', description: 'Technical debt from rushing MVP features',
    severity: scale === 'mvp' ? 'high' : 'medium',
    mitigation: 'Establish coding standards early, allocate 20% time for refactoring'
  });

  // Type-specific risks
  const typeRisks: Partial<Record<ProjectType, Risk[]>> = {
    ecommerce: [
      { category: 'security', description: 'Payment data breach risk (PCI compliance)', severity: 'critical', mitigation: 'Use PCI-compliant payment gateways (Stripe/PayPal), never store card data directly' },
      { category: 'market', description: 'High competition in established e-commerce space', severity: 'high', mitigation: 'Focus on niche market differentiation and unique user experience' },
    ],
    fintech: [
      { category: 'security', description: 'Financial regulatory compliance (KYC/AML)', severity: 'critical', mitigation: 'Partner with compliance-specialized providers, legal review from day 1' },
      { category: 'technical', description: 'Data consistency for financial transactions', severity: 'critical', mitigation: 'Use ACID-compliant database, implement idempotency patterns' },
    ],
    social_network: [
      { category: 'technical', description: 'Scaling feed algorithm for millions of users', severity: 'high', mitigation: 'Implement fan-out on write with caching layer' },
      { category: 'resource', description: 'Content moderation at scale', severity: 'high', mitigation: 'Combine AI moderation with human review pipeline' },
    ],
    saas: [
      { category: 'market', description: 'High churn rate without product-market fit', severity: 'high', mitigation: 'Regular user interviews, implement analytics early, focus on core value' },
      { category: 'technical', description: 'Multi-tenancy data isolation concerns', severity: 'high', mitigation: 'Row-level security or schema-per-tenant pattern' },
    ],
    marketplace: [
      { category: 'market', description: 'Chicken-and-egg problem (supply vs demand)', severity: 'critical', mitigation: 'Focus on one side first, consider single-player mode' },
    ],
    healthtech: [
      { category: 'security', description: 'HIPAA/health data compliance', severity: 'critical', mitigation: 'Use HIPAA-compliant infrastructure, encryption at rest and in transit' },
    ],
  };

  if (typeRisks[projectType]) risks.push(...typeRisks[projectType]!);

  // Scale-specific risks
  if (scale === 'mvp') {
    risks.push({ category: 'timeline', description: 'Feature creep extending MVP timeline', severity: 'high', mitigation: 'Strictly limit MVP scope to 3-5 core features' });
  }
  if (scale === 'enterprise') {
    risks.push({ category: 'resource', description: 'Coordination overhead with large team', severity: 'medium', mitigation: 'Clear domain boundaries, API contracts, dedicated platform team' });
  }

  return risks;
}

function generateTechRequirements(projectType: ProjectType): TechnicalRequirement[] {
  const reqs: TechnicalRequirement[] = [
    { category: 'Authentication', requirement: 'User registration and login system', priority: 'must_have', impliedTech: ['auth'] },
    { category: 'Database', requirement: 'Persistent data storage with backups', priority: 'must_have', impliedTech: ['database'] },
    { category: 'Deployment', requirement: 'CI/CD pipeline with staging environment', priority: 'should_have', impliedTech: ['ci_cd', 'cloud'] },
    { category: 'Monitoring', requirement: 'Error tracking and performance monitoring', priority: 'should_have', impliedTech: ['monitoring'] },
  ];

  const typeReqs: Partial<Record<ProjectType, TechnicalRequirement[]>> = {
    ecommerce: [
      { category: 'Payment', requirement: 'PCI-compliant payment processing', priority: 'must_have', impliedTech: ['payment-gateway'] },
      { category: 'Search', requirement: 'Fast product search with filtering', priority: 'must_have', impliedTech: ['search-engine'] },
    ],
    social_network: [
      { category: 'Real-time', requirement: 'WebSocket for live updates and chat', priority: 'must_have', impliedTech: ['websocket'] },
      { category: 'Media', requirement: 'Image/video upload and processing', priority: 'must_have', impliedTech: ['storage', 'cdn'] },
    ],
    fintech: [
      { category: 'Security', requirement: 'End-to-end encryption for sensitive data', priority: 'must_have', impliedTech: ['encryption'] },
      { category: 'Compliance', requirement: 'Comprehensive audit logging', priority: 'must_have', impliedTech: ['logging'] },
    ],
    saas: [
      { category: 'Multi-tenancy', requirement: 'Data isolation between organizations', priority: 'must_have', impliedTech: ['multi-tenant-db'] },
      { category: 'Billing', requirement: 'Subscription management with usage tracking', priority: 'must_have', impliedTech: ['payment', 'billing'] },
    ],
  };

  if (typeReqs[projectType]) reqs.push(...typeReqs[projectType]!);
  return reqs;
}

function generateMvpScope(projectType: ProjectType, features: FeatureGroup[]): MvpScope {
  const mustHaveFeatures = features.flatMap(g => g.features).filter(f => f.priority === 'must_have');
  const shouldHaveFeatures = features.flatMap(g => g.features).filter(f => f.priority === 'should_have');

  const estimatedDays = mustHaveFeatures.reduce((sum, f) => sum + f.estimatedDays, 0);
  const estimatedWeeks = Math.ceil(estimatedDays / 5);

  return {
    estimatedWeeks,
    coreFeatures: mustHaveFeatures.map(f => f.name),
    deferredFeatures: shouldHaveFeatures.map(f => f.name),
    criticalPath: mustHaveFeatures.filter(f => f.dependencies.length > 0).map(f => `${f.dependencies.join(' → ')} → ${f.name}`),
  };
}

export function analyzeProject(input: ProjectInput): ProjectAnalysis {
  const projectType = input.projectType || detectProjectType(input.description);
  const scale = detectScale(input);
  const features = featureTemplates[projectType] || featureTemplates.other;

  const audience: AudienceAnalysis = {
    primary: input.targetAudience || `Users seeking ${projectType.replace('_', ' ')} solutions`,
    secondary: 'Administrators and stakeholders managing the platform',
    demographics: getDefaultDemographics(projectType),
    painPoints: getDefaultPainPoints(projectType),
    expectedBehaviors: ['Mobile-first browsing', 'Quick onboarding expectation', 'Social sharing'],
  };

  const marketInsights: MarketInsight[] = getMarketInsights(projectType);

  return {
    summary: `**${input.name}** is a ${scale} ${projectType.replace('_', ' ')} project. ${input.description}`,
    projectType,
    scale,
    coreFeatures: features,
    targetAudience: audience,
    marketInsights,
    technicalRequirements: generateTechRequirements(projectType),
    risks: generateRisks(projectType, scale),
    mvpScope: generateMvpScope(projectType, features),
  };
}

function getDefaultDemographics(type: ProjectType): string[] {
  const demos: Partial<Record<ProjectType, string[]>> = {
    ecommerce: ['Online shoppers 18-55', 'Mobile-first users', 'Price-conscious consumers'],
    saas: ['Business professionals 25-50', 'Small-medium business owners', 'Team leaders'],
    social_network: ['Young adults 16-35', 'Content creators', 'Digital natives'],
    fintech: ['Adults 25-60', 'Tech-savvy income earners', 'Small business owners'],
    edtech: ['Students 15-30', 'Working professionals upskilling', 'Teachers and educators'],
  };
  return demos[type] || ['General users 18-45', 'Tech-aware audience', 'Early adopters'];
}

function getDefaultPainPoints(type: ProjectType): string[] {
  const pains: Partial<Record<ProjectType, string[]>> = {
    ecommerce: ['Difficult checkout processes', 'Poor search results', 'Lack of personalization'],
    saas: ['Complex onboarding', 'Feature overload', 'Pricing confusion', 'Poor integrations'],
    social_network: ['Content discovery friction', 'Privacy concerns', 'Information overload'],
    marketplace: ['Trust between parties', 'Discovery of quality providers', 'Payment security'],
  };
  return pains[type] || ['Fragmented existing solutions', 'Poor user experience', 'Lack of automation'];
}

function getMarketInsights(type: ProjectType): MarketInsight[] {
  const insights: Partial<Record<ProjectType, MarketInsight[]>> = {
    ecommerce: [
      { category: 'Trend', insight: 'AI-powered personalization increasing conversion rates by 20-30%', impact: 'high' },
      { category: 'Trend', insight: 'Social commerce and live shopping growing rapidly', impact: 'medium' },
      { category: 'Opportunity', insight: 'Mobile commerce accounts for 73% of total e-commerce sales', impact: 'high' },
    ],
    saas: [
      { category: 'Trend', insight: 'Product-led growth (PLG) becoming dominant acquisition strategy', impact: 'high' },
      { category: 'Trend', insight: 'AI copilots being integrated into every SaaS category', impact: 'high' },
      { category: 'Opportunity', insight: 'Vertical SaaS outperforming horizontal solutions in retention', impact: 'medium' },
    ],
    ai_ml: [
      { category: 'Trend', insight: 'LLM costs dropping 10x annually, enabling new use cases', impact: 'high' },
      { category: 'Trend', insight: 'Multi-modal AI models becoming standard', impact: 'high' },
      { category: 'Risk', insight: 'Fast-moving landscape may change best practices quickly', impact: 'medium' },
    ],
  };
  return insights[type] || [
    { category: 'General', insight: 'Digital-first solutions gaining adoption across all sectors', impact: 'medium' },
    { category: 'Trend', insight: 'AI integration becoming a differentiator across all product categories', impact: 'high' },
  ];
}
