/**
 * Tool 20: Integration Map
 * Bản đồ tích hợp dịch vụ bên thứ 3: cost, API keys, alternatives
 */

import type { ProjectType, ProjectScale, StackRecommendation } from '../types/index.js';

export interface IntegrationMap {
  services: IntegrationService[];
  totalMonthlyCost: { free: string; paid: string };
  apiKeysNeeded: number;
  setupComplexity: 'simple' | 'moderate' | 'complex';
  recommendations: string[];
}

interface IntegrationService {
  name: string;
  category: string;
  purpose: string;
  freeTier: string;
  paidStartsAt: string;
  apiKeyRequired: boolean;
  setupTime: string;
  alternatives: { name: string; note: string }[];
  sdkLanguages: string[];
  vendorLockIn: 'low' | 'medium' | 'high';
}

const baseServices: IntegrationService[] = [
  {
    name: 'Stripe', category: 'Payment', purpose: 'Thanh toán, subscription, invoicing',
    freeTier: 'No monthly fee, 2.9% + 30¢ per transaction', paidStartsAt: 'Per transaction',
    apiKeyRequired: true, setupTime: '2-4 hours',
    alternatives: [{ name: 'LemonSqueezy', note: 'Simpler for SaaS, handles tax' }, { name: 'PayOS', note: 'Cho thị trường Việt Nam' }],
    sdkLanguages: ['Node.js', 'Python', 'Go', 'Ruby'], vendorLockIn: 'medium',
  },
  {
    name: 'SendGrid / Resend', category: 'Email', purpose: 'Transactional & marketing email',
    freeTier: '100 emails/day (SendGrid) | 3000/mo (Resend)', paidStartsAt: '$20/mo',
    apiKeyRequired: true, setupTime: '1-2 hours',
    alternatives: [{ name: 'AWS SES', note: '$0.10/1000 emails, cheapest' }, { name: 'Postmark', note: 'Best deliverability' }],
    sdkLanguages: ['Node.js', 'Python', 'Go'], vendorLockIn: 'low',
  },
  {
    name: 'Cloudflare', category: 'CDN/DNS', purpose: 'CDN, DNS, DDoS protection, edge computing',
    freeTier: 'Unlimited bandwidth, DNS, basic CDN', paidStartsAt: '$20/mo (Pro)',
    apiKeyRequired: true, setupTime: '30 min',
    alternatives: [{ name: 'AWS CloudFront', note: 'More features, complex setup' }, { name: 'Vercel Edge', note: 'Built-in if using Vercel' }],
    sdkLanguages: ['Workers API (JS)'], vendorLockIn: 'low',
  },
  {
    name: 'Sentry', category: 'Monitoring', purpose: 'Error tracking, performance monitoring',
    freeTier: '5K errors/mo, 10K transactions', paidStartsAt: '$26/mo',
    apiKeyRequired: true, setupTime: '30 min',
    alternatives: [{ name: 'LogRocket', note: 'Session replay + error tracking' }, { name: 'BetterStack', note: 'Logs + uptime + alerting' }],
    sdkLanguages: ['Node.js', 'React', 'Python', 'Go', 'Flutter'], vendorLockIn: 'low',
  },
  {
    name: 'Upstash', category: 'Cache/Queue', purpose: 'Serverless Redis + Kafka',
    freeTier: '10K commands/day', paidStartsAt: '$0.2/100K commands',
    apiKeyRequired: true, setupTime: '15 min',
    alternatives: [{ name: 'Redis Cloud', note: '30MB free, more features' }, { name: 'Self-hosted Redis', note: 'Free nhưng cần quản lý' }],
    sdkLanguages: ['Node.js', 'Python', 'Go'], vendorLockIn: 'low',
  },
];

const featureServices: Record<string, IntegrationService[]> = {
  auth: [{
    name: 'Clerk', category: 'Auth', purpose: 'Authentication, user management, SSO',
    freeTier: '10K MAU', paidStartsAt: '$25/mo',
    apiKeyRequired: true, setupTime: '1-2 hours',
    alternatives: [{ name: 'Auth0', note: '7K MAU free, enterprise features' }, { name: 'NextAuth/Lucia', note: 'Free, self-hosted, more work' }],
    sdkLanguages: ['Next.js', 'React', 'Node.js'], vendorLockIn: 'medium',
  }],
  ai: [
    {
      name: 'OpenAI API', category: 'AI/LLM', purpose: 'GPT-4, embeddings, chat completion',
      freeTier: '$5 credit (new accounts)', paidStartsAt: '$0.002/1K tokens (GPT-3.5)',
      apiKeyRequired: true, setupTime: '30 min',
      alternatives: [{ name: 'Google Gemini', note: 'Free tier generous, multimodal' }, { name: 'Anthropic Claude', note: 'Better for long context' }, { name: 'Groq', note: 'Fastest inference, free tier' }],
      sdkLanguages: ['Node.js', 'Python'], vendorLockIn: 'low',
    },
    {
      name: 'Pinecone / Qdrant', category: 'Vector DB', purpose: 'Vector search cho RAG, semantic search',
      freeTier: '100K vectors (Pinecone) | Self-hosted free (Qdrant)', paidStartsAt: '$70/mo',
      apiKeyRequired: true, setupTime: '1-2 hours',
      alternatives: [{ name: 'pgvector', note: 'Free, runs in PostgreSQL' }, { name: 'Weaviate', note: 'Open-source, full-featured' }],
      sdkLanguages: ['Node.js', 'Python'], vendorLockIn: 'medium',
    },
  ],
  chat: [{
    name: 'Pusher / Ably', category: 'Realtime', purpose: 'WebSocket as a service, presence, channels',
    freeTier: '200K messages/day (Pusher) | 6M messages/mo (Ably)', paidStartsAt: '$49/mo',
    apiKeyRequired: true, setupTime: '2-3 hours',
    alternatives: [{ name: 'Socket.IO', note: 'Free, self-hosted, more control' }, { name: 'Supabase Realtime', note: 'Free tier, PostgreSQL-based' }],
    sdkLanguages: ['Node.js', 'React', 'Flutter'], vendorLockIn: 'high',
  }],
  storage: [{
    name: 'AWS S3 / Cloudflare R2', category: 'File Storage', purpose: 'File storage, images, documents, backups',
    freeTier: '10GB (R2) | 5GB (S3 free tier 12 months)', paidStartsAt: '$0.015/GB (R2) | $0.023/GB (S3)',
    apiKeyRequired: true, setupTime: '1 hour',
    alternatives: [{ name: 'Supabase Storage', note: '1GB free, easy setup' }, { name: 'UploadThing', note: '2GB free, React components' }],
    sdkLanguages: ['Node.js', 'Python', 'Go'], vendorLockIn: 'low',
  }],
  notification: [{
    name: 'Firebase Cloud Messaging', category: 'Push Notification', purpose: 'Push notifications cho mobile + web',
    freeTier: 'Unlimited', paidStartsAt: 'Free (part of Firebase)',
    apiKeyRequired: true, setupTime: '2-3 hours',
    alternatives: [{ name: 'OneSignal', note: 'Free up to 10K subscribers' }, { name: 'Novu', note: 'Open-source notification infrastructure' }],
    sdkLanguages: ['Node.js', 'React Native', 'Flutter'], vendorLockIn: 'medium',
  }],
  video: [{
    name: 'Daily.co / Agora', category: 'Video Call', purpose: 'Video/audio calling, screen sharing',
    freeTier: '10K min/mo (Daily) | 10K min/mo (Agora)', paidStartsAt: '$0.004/min',
    apiKeyRequired: true, setupTime: '4-8 hours',
    alternatives: [{ name: 'Twilio Video', note: 'Enterprise-grade, pay-per-use' }, { name: 'LiveKit', note: 'Open-source, self-hosted' }],
    sdkLanguages: ['React', 'React Native', 'Flutter'], vendorLockIn: 'high',
  }],
  analytics: [{
    name: 'PostHog / Mixpanel', category: 'Analytics', purpose: 'Product analytics, funnel, A/B testing',
    freeTier: '1M events/mo (PostHog) | 20M events (Mixpanel)', paidStartsAt: '$0 (self-host PostHog)',
    apiKeyRequired: true, setupTime: '1-2 hours',
    alternatives: [{ name: 'Plausible', note: 'Privacy-focused, simple' }, { name: 'Google Analytics', note: 'Free, most popular' }],
    sdkLanguages: ['Node.js', 'React', 'React Native'], vendorLockIn: 'low',
  }],
  search: [{
    name: 'Meilisearch / Algolia', category: 'Search', purpose: 'Full-text search, instant search',
    freeTier: 'Self-hosted free (Meili) | 10K req/mo (Algolia)', paidStartsAt: '$0 (self-host) | $1/1K req',
    apiKeyRequired: true, setupTime: '2-3 hours',
    alternatives: [{ name: 'Elasticsearch', note: 'Most powerful, complex setup' }, { name: 'PostgreSQL FTS', note: 'Built-in, good enough for small scale' }],
    sdkLanguages: ['Node.js', 'Python', 'Go'], vendorLockIn: 'low',
  }],
};

export function mapIntegrations(
  projectType: ProjectType,
  scale: ProjectScale,
  features: string[] = [],
  stack?: StackRecommendation
): IntegrationMap {
  const services: IntegrationService[] = [...baseServices];
  const featureText = features.join(' ').toLowerCase();

  for (const [key, svcs] of Object.entries(featureServices)) {
    if (featureText.includes(key) || (key === 'auth' && (projectType === 'saas' || projectType === 'marketplace'))) {
      services.push(...svcs);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = services.filter(s => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });

  const apiKeysNeeded = unique.filter(s => s.apiKeyRequired).length;

  const recommendations = [
    `🔑 **${apiKeysNeeded} API keys** cần setup — tạo .env template sớm`,
    '📋 Tạo checklist signup cho tất cả services trước khi dev',
    '🔄 Luôn có **fallback plan** cho mỗi service (xem cột Alternatives)',
    '💰 **Bắt đầu với free tier** — chỉ upgrade khi cần',
    '🔒 Lưu API keys trong secret manager (Doppler/Infisical), KHÔNG trong code',
    '📊 Monitor usage của mỗi service để tránh bill shock',
  ];

  if (unique.some(s => s.vendorLockIn === 'high')) {
    recommendations.push('⚠️ Có services với **vendor lock-in cao** — xem xét alternatives self-hosted nếu cần');
  }

  return {
    services: unique,
    totalMonthlyCost: {
      free: `$0 (all free tiers) — handles ~${scale === 'mvp' ? '1K' : '5K'} users`,
      paid: scale === 'mvp' ? '$20-80/mo' : scale === 'startup' ? '$100-500/mo' : '$500-3000/mo',
    },
    apiKeysNeeded,
    setupComplexity: apiKeysNeeded <= 5 ? 'simple' : apiKeysNeeded <= 10 ? 'moderate' : 'complex',
    recommendations,
  };
}

export function formatIntegrationMap(map: IntegrationMap): string {
  const lines = ['# 🔌 Integration Map\n'];
  lines.push(`> Bản đồ dịch vụ bên thứ 3 cần kết nối\n`);
  lines.push(`- **Services**: ${map.services.length} | **API Keys**: ${map.apiKeysNeeded}`);
  lines.push(`- **Free tier cost**: ${map.totalMonthlyCost.free}`);
  lines.push(`- **Paid cost**: ${map.totalMonthlyCost.paid}`);
  lines.push(`- **Setup complexity**: ${map.setupComplexity}\n`);

  // Group by category
  const groups = new Map<string, IntegrationService[]>();
  for (const s of map.services) {
    if (!groups.has(s.category)) groups.set(s.category, []);
    groups.get(s.category)!.push(s);
  }

  for (const [category, svcs] of groups) {
    lines.push(`## ${category}\n`);
    for (const s of svcs) {
      lines.push(`### ${s.name}`);
      lines.push(`- **Purpose**: ${s.purpose}`);
      lines.push(`- **Free tier**: ${s.freeTier}`);
      lines.push(`- **Paid**: ${s.paidStartsAt}`);
      lines.push(`- **Setup**: ${s.setupTime} | **Lock-in**: ${s.vendorLockIn}`);
      lines.push(`- **SDKs**: ${s.sdkLanguages.join(', ')}`);
      if (s.alternatives.length > 0) {
        lines.push(`- **Alternatives**: ${s.alternatives.map(a => `${a.name} (${a.note})`).join(' | ')}`);
      }
      lines.push('');
    }
  }

  lines.push('## 💡 Recommendations\n');
  map.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
