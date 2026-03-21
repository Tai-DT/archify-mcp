import type { ProjectType, ProjectScale } from '../types/index.js';
import { pricingData, estimateInfrastructureCost } from '../knowledge/pricing.js';

export interface InfraEstimation {
  breakdown: { service: string; provider: string; tier: string; monthlyCost: number; notes: string }[];
  totalMonthly: number;
  totalYearly: number;
  freeTierSavings: number;
  recommendations: string[];
  scalingProjection: { users: string; monthlyCost: string }[];
  comparisonTable: string;
}

export function estimateInfrastructure(
  stackComponents: string[],
  projectType: ProjectType,
  scale: ProjectScale,
  concurrentUsers: number = 100,
  monthlyBudget?: number
): InfraEstimation {
  const result = estimateInfrastructureCost(stackComponents, concurrentUsers, scale);

  // Scaling projection
  const userTiers = [100, 1000, 10000, 100000];
  const scalingProjection = userTiers.map(users => {
    const scaleFactor = users <= 100 ? 0.3 : users <= 1000 ? 1.0 : users <= 10000 ? 3.0 : 10.0;
    const estimated = result.totalMonthly * (scaleFactor + 0.7);
    return { users: users.toLocaleString(), monthlyCost: `$${Math.round(estimated)}` };
  });

  // Budget check
  if (monthlyBudget && result.totalMonthly > monthlyBudget) {
    result.recommendations.push(`⚠️ Chi phí ước tính ($${result.totalMonthly}) vượt ngân sách ($${monthlyBudget}). Xem xét dùng free tiers hoặc self-hosted.`);
  }

  // Build comparison table of hosting providers
  const hostingProviders = pricingData.filter(p => p.category === 'hosting');
  let comparisonTable = '| Provider | Plan | Cost/mo | Limits |\n|----------|------|---------|--------|\n';
  for (const p of hostingProviders) {
    if (p.freeTier) {
      comparisonTable += `| ${p.provider} | ${p.freeTier.name} | **FREE** | ${p.freeTier.limits} |\n`;
    }
    for (const tier of p.tiers.slice(0, 2)) {
      comparisonTable += `| ${p.provider} | ${tier.name} | $${tier.monthlyCost} | ${tier.limits} |\n`;
    }
  }

  return {
    ...result,
    scalingProjection,
    comparisonTable,
  };
}

export function formatInfraEstimation(est: InfraEstimation): string {
  const lines = ['# 💰 Infrastructure Cost Estimation\n'];

  lines.push('## Breakdown\n');
  lines.push('| Service | Provider | Tier | Monthly | Notes |');
  lines.push('|---------|----------|------|---------|-------|');
  for (const b of est.breakdown) {
    lines.push(`| ${b.service} | ${b.provider} | ${b.tier} | $${b.monthlyCost.toFixed(2)} | ${b.notes} |`);
  }

  lines.push(`\n### 📊 Total`);
  lines.push(`- **Monthly**: $${est.totalMonthly.toFixed(2)}`);
  lines.push(`- **Yearly**: $${est.totalYearly.toFixed(2)}`);
  if (est.freeTierSavings > 0) {
    lines.push(`- **Free tier savings**: ~$${est.freeTierSavings}/mo`);
  }

  lines.push('\n## 📈 Scaling Projection\n');
  lines.push('| Users | Est. Monthly Cost |');
  lines.push('|-------|------------------|');
  for (const s of est.scalingProjection) {
    lines.push(`| ${s.users} | ${s.monthlyCost} |`);
  }

  lines.push('\n## 🏢 Hosting Providers Comparison\n');
  lines.push(est.comparisonTable);

  if (est.recommendations.length > 0) {
    lines.push('\n## 💡 Recommendations\n');
    est.recommendations.forEach(r => lines.push(r));
  }

  return lines.join('\n');
}
