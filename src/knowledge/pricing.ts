/**
 * Infrastructure pricing data for cost estimation.
 * Prices are approximate monthly USD as of 2024-2025.
 */

export interface PricingTier {
  name: string;
  monthlyCost: number;
  limits: string;
  features: string[];
}

export interface ProviderPricing {
  provider: string;
  category: string;
  freeTier?: PricingTier;
  tiers: PricingTier[];
  perUnitCost?: { unit: string; cost: number; description: string }[];
}

export const pricingData: ProviderPricing[] = [
  // ============ HOSTING / CLOUD ============
  {
    provider: 'Vercel', category: 'hosting',
    freeTier: { name: 'Hobby', monthlyCost: 0, limits: '100GB bandwidth, 100hrs build', features: ['Preview deploys', 'Edge functions', 'Analytics'] },
    tiers: [
      { name: 'Pro', monthlyCost: 20, limits: '1TB bandwidth, 400hrs build', features: ['Team features', 'Password protection', 'Advanced analytics'] },
      { name: 'Enterprise', monthlyCost: 500, limits: 'Custom', features: ['SLA', 'Dedicated support', 'SSO'] },
    ],
    perUnitCost: [
      { unit: 'Serverless function invocation (1M)', cost: 0.60, description: 'After free tier' },
      { unit: 'Bandwidth (GB)', cost: 0.15, description: 'After included' },
    ],
  },
  {
    provider: 'Cloudflare', category: 'hosting',
    freeTier: { name: 'Free', monthlyCost: 0, limits: 'Unlimited bandwidth, 100K Workers/day', features: ['CDN', 'DDoS', 'SSL', 'Workers'] },
    tiers: [
      { name: 'Pro', monthlyCost: 20, limits: 'WAF rules, image optimization', features: ['WAF', 'Image resize', 'Faster analytics'] },
      { name: 'Business', monthlyCost: 200, limits: 'Advanced DDoS, custom SSL', features: ['Custom SSL', 'SLA 100%'] },
    ],
    perUnitCost: [
      { unit: 'Workers (1M requests)', cost: 0.50, description: 'After 10M free' },
      { unit: 'R2 Storage (GB)', cost: 0.015, description: 'Zero egress' },
      { unit: 'D1 Database (1M rows read)', cost: 0.001, description: 'Serverless SQL' },
    ],
  },
  {
    provider: 'Railway', category: 'hosting',
    freeTier: { name: 'Trial', monthlyCost: 0, limits: '$5 credit, 500hrs', features: ['Deploy from Git', 'Auto-scaling'] },
    tiers: [
      { name: 'Hobby', monthlyCost: 5, limits: '$5 included usage', features: ['Custom domains', '8GB RAM max'] },
      { name: 'Pro', monthlyCost: 20, limits: '$20 included usage', features: ['Teams', 'Multi-region', '32GB RAM'] },
    ],
    perUnitCost: [
      { unit: 'vCPU (per hour)', cost: 0.000463, description: '$0.33/vCPU/month' },
      { unit: 'RAM (GB/hour)', cost: 0.000231, description: '$0.17/GB/month' },
    ],
  },
  {
    provider: 'DigitalOcean', category: 'hosting',
    tiers: [
      { name: 'Basic Droplet', monthlyCost: 4, limits: '512MB RAM, 1vCPU, 10GB SSD', features: ['Shared CPU'] },
      { name: 'Regular Droplet', monthlyCost: 6, limits: '1GB RAM, 1vCPU, 25GB SSD', features: ['Shared CPU'] },
      { name: 'Medium Droplet', monthlyCost: 12, limits: '2GB RAM, 1vCPU, 50GB SSD', features: ['Shared CPU'] },
      { name: 'Large Droplet', monthlyCost: 24, limits: '4GB RAM, 2vCPU, 80GB SSD', features: ['Dedicated CPU'] },
    ],
  },
  {
    provider: 'Hetzner', category: 'hosting',
    tiers: [
      { name: 'CX22', monthlyCost: 3.79, limits: '2GB RAM, 2vCPU, 40GB SSD', features: ['20TB traffic'] },
      { name: 'CX32', monthlyCost: 5.39, limits: '4GB RAM, 2vCPU, 80GB SSD', features: ['20TB traffic'] },
      { name: 'CX42', monthlyCost: 14.49, limits: '8GB RAM, 4vCPU, 160GB SSD', features: ['20TB traffic'] },
      { name: 'CX52', monthlyCost: 28.49, limits: '16GB RAM, 8vCPU, 320GB SSD', features: ['20TB traffic'] },
    ],
  },

  // ============ DATABASES ============
  {
    provider: 'Supabase', category: 'database',
    freeTier: { name: 'Free', monthlyCost: 0, limits: '500MB DB, 1GB storage, 50K auth users', features: ['Auth', 'Realtime', 'Edge functions'] },
    tiers: [
      { name: 'Pro', monthlyCost: 25, limits: '8GB DB, 100GB storage, unlimited auth', features: ['Daily backups', 'No project pause', '7-day log retention'] },
      { name: 'Team', monthlyCost: 599, limits: '50GB DB, 200GB storage', features: ['SOC2', 'HIPAA', 'Priority support'] },
    ],
  },
  {
    provider: 'Neon', category: 'database',
    freeTier: { name: 'Free', monthlyCost: 0, limits: '512MB storage, 1 project, 10 branches', features: ['Autoscaling', 'Branching'] },
    tiers: [
      { name: 'Launch', monthlyCost: 19, limits: '10GB storage, 10 projects, unlimited branches', features: ['Autoscaling to 4 CU'] },
      { name: 'Scale', monthlyCost: 69, limits: '50GB storage, 50 projects', features: ['Autoscaling to 8 CU', 'Read replicas'] },
    ],
  },
  {
    provider: 'PlanetScale', category: 'database',
    freeTier: { name: 'Hobby', monthlyCost: 0, limits: '5GB storage, 1B reads/mo, 10M writes/mo', features: ['1 branch', '1 connection'] },
    tiers: [
      { name: 'Scaler', monthlyCost: 29, limits: '10GB storage, unlimited', features: ['2 branches', 'Unlimited connections'] },
      { name: 'Scaler Pro', monthlyCost: 39, limits: '10GB storage, multi-region', features: ['Multiple regions'] },
    ],
  },
  {
    provider: 'MongoDB Atlas', category: 'database',
    freeTier: { name: 'M0 Free', monthlyCost: 0, limits: '512MB, shared cluster', features: ['Auto-scaling', 'Backups'] },
    tiers: [
      { name: 'M10 Shared', monthlyCost: 57, limits: '10GB, dedicated', features: ['Monitoring', 'Alerts'] },
      { name: 'M20 General', monthlyCost: 140, limits: '20GB, dedicated', features: ['Analytics', 'Full monitoring'] },
    ],
  },
  {
    provider: 'Upstash Redis', category: 'cache',
    freeTier: { name: 'Free', monthlyCost: 0, limits: '10K commands/day, 256MB', features: ['Serverless', 'Global'] },
    tiers: [
      { name: 'Pay as you go', monthlyCost: 0.2, limits: 'Per 100K commands', features: ['Unlimited storage'] },
      { name: 'Pro 2GB', monthlyCost: 70, limits: '2GB, 100K commands/sec', features: ['Dedicated', 'SLA'] },
    ],
  },

  // ============ AUTH ============
  {
    provider: 'Clerk', category: 'auth',
    freeTier: { name: 'Free', monthlyCost: 0, limits: '10K MAU', features: ['Pre-built UI', 'Social login'] },
    tiers: [
      { name: 'Pro', monthlyCost: 25, limits: '10K MAU included + $0.02/extra', features: ['Custom domains', 'Branding'] },
      { name: 'Enterprise', monthlyCost: 500, limits: 'Custom', features: ['SAML SSO', 'SLA', 'Dedicated'] },
    ],
  },
  {
    provider: 'Auth0', category: 'auth',
    freeTier: { name: 'Free', monthlyCost: 0, limits: '7.5K MAU', features: ['Social login', 'Universal login'] },
    tiers: [
      { name: 'Essential', monthlyCost: 35, limits: '1K MAU included', features: ['Custom domains', 'MFA'] },
      { name: 'Professional', monthlyCost: 240, limits: '1K MAU included', features: ['Organizations', 'Roles'] },
    ],
  },

  // ============ MONITORING ============
  {
    provider: 'Sentry', category: 'monitoring',
    freeTier: { name: 'Developer', monthlyCost: 0, limits: '5K errors/mo, 10K transactions/mo', features: ['Error tracking', 'Performance'] },
    tiers: [
      { name: 'Team', monthlyCost: 26, limits: '50K errors, 100K transactions', features: ['Full dashboard', 'Integrations'] },
      { name: 'Business', monthlyCost: 80, limits: '100K errors, 500K transactions', features: ['SSO', 'Priority support'] },
    ],
  },

  // ============ PAYMENT ============
  {
    provider: 'Stripe', category: 'payment',
    tiers: [
      { name: 'Standard', monthlyCost: 0, limits: 'Pay per transaction', features: ['Cards', 'Wallets', 'Subscriptions'] },
    ],
    perUnitCost: [
      { unit: 'Transaction', cost: 0, description: '2.9% + $0.30 per successful charge' },
      { unit: 'Stripe Tax', cost: 0.5, description: '0.5% per transaction' },
      { unit: 'Stripe Billing', cost: 0.5, description: '0.5% for recurring' },
    ],
  },

  // ============ STORAGE ============
  {
    provider: 'Cloudflare R2', category: 'storage',
    freeTier: { name: 'Free', monthlyCost: 0, limits: '10GB storage, 10M reads, 1M writes', features: ['Zero egress', 'S3 compatible'] },
    tiers: [
      { name: 'Pay as you go', monthlyCost: 0, limits: 'Unlimited', features: ['$0.015/GB storage', 'Zero egress'] },
    ],
  },
  {
    provider: 'AWS S3', category: 'storage',
    tiers: [
      { name: 'Standard', monthlyCost: 0, limits: 'Pay as you go', features: ['$0.023/GB', '$0.09/GB egress'] },
    ],
  },
];

/**
 * Estimate monthly cost for a given stack and scale
 */
export function estimateInfrastructureCost(
  stackComponents: string[],
  concurrentUsers: number,
  scale: string
): {
  breakdown: { service: string; provider: string; tier: string; monthlyCost: number; notes: string }[];
  totalMonthly: number;
  totalYearly: number;
  freeTierSavings: number;
  recommendations: string[];
} {
  const breakdown: { service: string; provider: string; tier: string; monthlyCost: number; notes: string }[] = [];
  let freeTierSavings = 0;
  const recommendations: string[] = [];

  // Map scale to estimated resource usage
  const usageMultiplier: Record<string, number> = {
    mvp: 0.3, startup: 1.0, growth: 3.0, enterprise: 10.0,
  };
  const multiplier = usageMultiplier[scale] || 1.0;

  // Determine best tier for each component
  for (const component of stackComponents) {
    const providers = pricingData.filter(p =>
      p.provider.toLowerCase().includes(component.toLowerCase()) ||
      component.toLowerCase().includes(p.provider.toLowerCase())
    );

    if (providers.length > 0) {
      const provider = providers[0];
      let selectedTier: PricingTier;
      let cost: number;

      if (provider.freeTier && multiplier <= 0.5) {
        selectedTier = provider.freeTier;
        cost = 0;
        freeTierSavings += provider.tiers[0]?.monthlyCost || 10;
      } else if (provider.tiers.length > 0) {
        const tierIndex = Math.min(Math.floor(multiplier / 2), provider.tiers.length - 1);
        selectedTier = provider.tiers[tierIndex];
        cost = selectedTier.monthlyCost;
      } else {
        continue;
      }

      breakdown.push({
        service: provider.category,
        provider: provider.provider,
        tier: selectedTier.name,
        monthlyCost: cost,
        notes: selectedTier.limits,
      });
    }
  }

  // Add default hosting if not included
  if (!breakdown.some(b => b.service === 'hosting')) {
    if (multiplier <= 0.5) {
      breakdown.push({ service: 'hosting', provider: 'Vercel', tier: 'Hobby (Free)', monthlyCost: 0, notes: '100GB bandwidth' });
    } else if (multiplier <= 1.0) {
      breakdown.push({ service: 'hosting', provider: 'Railway', tier: 'Hobby', monthlyCost: 5, notes: '$5 included usage' });
    } else {
      breakdown.push({ service: 'hosting', provider: 'DigitalOcean', tier: 'Regular', monthlyCost: 12 * multiplier, notes: `Scaled for ${concurrentUsers} users` });
    }
  }

  // Domain cost
  breakdown.push({ service: 'domain', provider: 'Cloudflare/Namecheap', tier: 'Annual', monthlyCost: 1, notes: '~$12/year' });

  const totalMonthly = breakdown.reduce((sum, b) => sum + b.monthlyCost, 0);

  // Recommendations
  if (totalMonthly > 100 && scale !== 'enterprise') {
    recommendations.push('💡 Xem xét dùng Hetzner/DigitalOcean thay managed services để giảm chi phí');
  }
  if (totalMonthly < 20) {
    recommendations.push('✅ Chi phí rất thấp — tận dụng tốt free tiers');
  }
  if (concurrentUsers > 1000 && !breakdown.some(b => b.service === 'cache')) {
    recommendations.push('💡 Thêm Redis cache (Upstash free tier) để tối ưu hiệu năng');
  }

  return {
    breakdown,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalMonthly * 12 * 100) / 100,
    freeTierSavings,
    recommendations,
  };
}
