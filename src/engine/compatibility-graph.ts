/**
 * Compatibility Graph — Đồ thị tương thích giữa các công nghệ
 *
 * Mỗi cạnh có trọng số thể hiện mức độ tương thích:
 * +3 = synergy tuyệt vời (designed to work together)
 * +2 = tương thích tốt
 * +1 = tương thích
 *  0 = trung tính
 * -1 = có vấn đề nhỏ
 * -2 = conflict, cần workaround
 * -3 = incompatible
 */

export interface CompatibilityEdge {
  from: string;
  to: string;
  score: number;  // -3 to +3
  reason: string;
}

export interface CompatibilityResult {
  totalScore: number;
  normalizedScore: number; // 0-100
  synergies: CompatibilityEdge[];
  conflicts: CompatibilityEdge[];
  neutral: CompatibilityEdge[];
  recommendations: string[];
}

// ═══════════════════════════════════════════
// COMPATIBILITY MATRIX (adjacency list)
// ═══════════════════════════════════════════

const compatibilityRules: CompatibilityEdge[] = [
  // ─── Next.js ecosystem ───
  { from: 'nextjs', to: 'react', score: 3, reason: 'Next.js is built on React — perfect integration' },
  { from: 'nextjs', to: 'vercel', score: 3, reason: 'Vercel created Next.js — zero-config deploy' },
  { from: 'nextjs', to: 'prisma', score: 3, reason: 'Prisma + Next.js API routes = perfect full-stack' },
  { from: 'nextjs', to: 'trpc', score: 3, reason: 'tRPC + Next.js = end-to-end type safety' },
  { from: 'nextjs', to: 'clerk', score: 2, reason: 'Clerk has dedicated Next.js SDK' },
  { from: 'nextjs', to: 'supabase', score: 2, reason: 'Supabase has Next.js helpers and SSR auth' },
  { from: 'nextjs', to: 'neon', score: 2, reason: 'Neon serverless driver works well with Next.js edge' },
  { from: 'nextjs', to: 'stripe', score: 2, reason: 'Stripe has Next.js examples and webhook handling' },
  { from: 'nextjs', to: 'tailwind', score: 2, reason: 'Tailwind included in create-next-app template' },
  { from: 'nextjs', to: 'shadcn', score: 3, reason: 'shadcn/ui designed for Next.js + Tailwind' },

  // ─── React ecosystem ───
  { from: 'react', to: 'react_native', score: 3, reason: 'Shared knowledge and component patterns' },
  { from: 'react', to: 'expo', score: 2, reason: 'Expo is React Native toolkit' },
  { from: 'react', to: 'resend', score: 2, reason: 'React Email templates for Resend' },

  // ─── Vue ecosystem ───
  { from: 'vue', to: 'nuxt', score: 3, reason: 'Nuxt is Vue full-stack framework' },

  // ─── Backend + ORM ───
  { from: 'nestjs', to: 'prisma', score: 2, reason: 'Prisma integrates well with NestJS dependency injection' },
  { from: 'nestjs', to: 'postgresql', score: 2, reason: 'PostgreSQL is default choice for NestJS + Prisma' },
  { from: 'express', to: 'prisma', score: 2, reason: 'Prisma Client works seamlessly with Express' },
  { from: 'hono', to: 'drizzle', score: 3, reason: 'Both are lightweight, edge-compatible' },
  { from: 'hono', to: 'cloudflare', score: 3, reason: 'Hono created for Cloudflare Workers' },
  { from: 'hono', to: 'neon', score: 2, reason: 'Both work on edge/serverless' },

  // ─── Database + BaaS ───
  { from: 'supabase', to: 'postgresql', score: 3, reason: 'Supabase IS PostgreSQL' },
  { from: 'neon', to: 'postgresql', score: 3, reason: 'Neon IS serverless PostgreSQL' },
  { from: 'prisma', to: 'postgresql', score: 3, reason: 'PostgreSQL is Prisma best-supported DB' },
  { from: 'drizzle', to: 'postgresql', score: 2, reason: 'Drizzle supports PostgreSQL natively' },
  { from: 'firebase', to: 'mongodb', score: -1, reason: 'Both are NoSQL — pick one, not both' },
  { from: 'supabase', to: 'firebase', score: -2, reason: 'Competing BaaS — don\'t mix' },

  // ─── Cache ───
  { from: 'redis', to: 'bullmq', score: 3, reason: 'BullMQ requires Redis as backend' },
  { from: 'upstash', to: 'bullmq', score: 2, reason: 'Upstash Redis compatible with BullMQ' },
  { from: 'upstash', to: 'vercel', score: 2, reason: 'Upstash serverless works with Vercel edge' },

  // ─── Auth ───
  { from: 'clerk', to: 'auth0', score: -2, reason: 'Don\'t use two auth providers' },
  { from: 'nextauth', to: 'clerk', score: -1, reason: 'Choose one auth solution' },
  { from: 'supabase', to: 'clerk', score: -1, reason: 'Supabase has built-in auth — conflict with Clerk' },

  // ─── Cloud ───
  { from: 'vercel', to: 'cloudflare', score: 0, reason: 'Can complement (Vercel app + CF CDN/R2)' },
  { from: 'railway', to: 'postgresql', score: 2, reason: 'Railway has managed PostgreSQL service' },
  { from: 'fly_io', to: 'docker', score: 2, reason: 'Fly.io deploys Docker containers' },
  { from: 'coolify', to: 'docker', score: 3, reason: 'Coolify manages Docker containers' },

  // ─── AI ───
  { from: 'openai', to: 'langchain', score: 2, reason: 'LangChain has OpenAI integration' },
  { from: 'openai', to: 'pinecone', score: 2, reason: 'OpenAI embeddings + Pinecone RAG is standard' },
  { from: 'gemini', to: 'firebase', score: 2, reason: 'Google ecosystem synergy' },
  { from: 'langchain', to: 'pinecone', score: 3, reason: 'LangChain + Pinecone = standard RAG stack' },

  // ─── Monitoring ───
  { from: 'sentry', to: 'nextjs', score: 2, reason: 'Sentry has dedicated Next.js SDK' },
  { from: 'posthog', to: 'nextjs', score: 2, reason: 'PostHog has Next.js integration guide' },
  { from: 'sentry', to: 'datadog', score: 1, reason: 'Can complement (errors + infra metrics)' },

  // ─── Mobile ───
  { from: 'expo', to: 'firebase', score: 2, reason: 'Firebase SDK works well with Expo' },
  { from: 'expo', to: 'fcm', score: 2, reason: 'Expo push notifications use FCM under the hood' },
  { from: 'flutter', to: 'firebase', score: 3, reason: 'Flutter + Firebase = Google-recommended stack' },
  { from: 'flutter', to: 'react', score: -1, reason: 'Different ecosystems — no code sharing' },

  // ─── Testing ───
  { from: 'vitest', to: 'nextjs', score: 2, reason: 'Vitest works well with Next.js projects' },
  { from: 'playwright', to: 'nextjs', score: 2, reason: 'Playwright is recommended E2E for Next.js' },

  // ─── Realtime ───
  { from: 'socket_io', to: 'express', score: 2, reason: 'Socket.IO integrates natively with Express' },
  { from: 'socket_io', to: 'nestjs', score: 2, reason: 'NestJS has built-in Socket.IO gateway' },
  { from: 'pusher', to: 'socket_io', score: -1, reason: 'Choose one realtime solution' },

  // ─── CI/CD ───
  { from: 'github_actions', to: 'vercel', score: 2, reason: 'Vercel auto-deploys from GitHub' },
  { from: 'github_actions', to: 'docker', score: 2, reason: 'GitHub Actions can build Docker images' },

  // ─── Storage ───
  { from: 'cloudflare_r2', to: 'cloudflare', score: 3, reason: 'R2 is part of Cloudflare ecosystem' },
  { from: 'aws_s3', to: 'aws', score: 3, reason: 'S3 is core AWS service' },

  // ─── Conflicts ───
  { from: 'angular', to: 'react', score: -2, reason: 'Don\'t mix Angular and React in same project' },
  { from: 'vue', to: 'react', score: -2, reason: 'Don\'t mix Vue and React in same project' },
  { from: 'django', to: 'nestjs', score: -2, reason: 'Don\'t use two backend frameworks' },
  { from: 'express', to: 'nestjs', score: -1, reason: 'NestJS already uses Express under the hood' },
  { from: 'mysql', to: 'postgresql', score: -1, reason: 'Choose one primary relational DB' },
];

// ═══════════════════════════════════════════
// GRAPH OPERATIONS
// ═══════════════════════════════════════════

/**
 * Analyze compatibility of a technology stack
 */
export function analyzeStackCompatibility(techIds: string[]): CompatibilityResult {
  const synergies: CompatibilityEdge[] = [];
  const conflicts: CompatibilityEdge[] = [];
  const neutral: CompatibilityEdge[] = [];
  let totalScore = 0;

  // Check all pairs
  for (let i = 0; i < techIds.length; i++) {
    for (let j = i + 1; j < techIds.length; j++) {
      const edge = findEdge(techIds[i], techIds[j]);
      if (edge) {
        totalScore += edge.score;
        if (edge.score > 0) synergies.push(edge);
        else if (edge.score < 0) conflicts.push(edge);
        else neutral.push(edge);
      }
    }
  }

  // Normalize: max possible = n*(n-1)/2 * 3
  const maxPairs = (techIds.length * (techIds.length - 1)) / 2;
  const maxScore = maxPairs * 3;
  const normalizedScore = maxScore > 0 ? Math.round(((totalScore + maxScore) / (2 * maxScore)) * 100) : 50;

  const recommendations: string[] = [];
  if (conflicts.length > 0) {
    recommendations.push('⚠️ Stack có conflict — nên xem xét lại:');
    conflicts.forEach(c => recommendations.push(`  - ${c.from} ↔ ${c.to}: ${c.reason}`));
  }
  if (synergies.length >= 3) {
    recommendations.push('✅ Stack có nhiều synergy — các công nghệ bổ trợ nhau tốt');
  }
  if (totalScore < 0) {
    recommendations.push('🔴 Tổng compatibility score âm — khuyến khích chọn stack khác');
  }

  return { totalScore, normalizedScore, synergies, conflicts, neutral, recommendations };
}

/**
 * Find best compatible technology for a given stack
 */
export function findBestCompatible(
  existingStack: string[],
  candidates: string[]
): { techId: string; compatibilityScore: number; edges: CompatibilityEdge[] }[] {
  const results = candidates.map(candidate => {
    let score = 0;
    const edges: CompatibilityEdge[] = [];

    for (const existing of existingStack) {
      const edge = findEdge(existing, candidate);
      if (edge) {
        score += edge.score;
        edges.push(edge);
      }
    }

    return { techId: candidate, compatibilityScore: score, edges };
  });

  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Get all technologies that have synergy with a given tech
 */
export function getSynergies(techId: string): CompatibilityEdge[] {
  return compatibilityRules.filter(e =>
    (e.from === techId || e.to === techId) && e.score > 0
  );
}

/**
 * Get all conflicts for a given tech
 */
export function getConflicts(techId: string): CompatibilityEdge[] {
  return compatibilityRules.filter(e =>
    (e.from === techId || e.to === techId) && e.score < 0
  );
}

// ═══════════════════════════════════════════
// INTERNAL
// ═══════════════════════════════════════════

function findEdge(a: string, b: string): CompatibilityEdge | undefined {
  return compatibilityRules.find(e =>
    (e.from === a && e.to === b) || (e.from === b && e.to === a)
  );
}

/**
 * Format compatibility result to markdown
 */
export function formatCompatibility(result: CompatibilityResult): string {
  const lines = ['# 🔗 Stack Compatibility Analysis\n'];
  const emoji = result.normalizedScore >= 70 ? '✅' : result.normalizedScore >= 40 ? '🟡' : '🔴';
  lines.push(`**Score**: ${emoji} ${result.normalizedScore}/100 (raw: ${result.totalScore})\n`);

  if (result.synergies.length > 0) {
    lines.push('## ✅ Synergies\n');
    result.synergies.forEach(s =>
      lines.push(`- **${s.from}** ↔ **${s.to}** (+${s.score}): ${s.reason}`)
    );
  }

  if (result.conflicts.length > 0) {
    lines.push('\n## ⚠️ Conflicts\n');
    result.conflicts.forEach(c =>
      lines.push(`- **${c.from}** ↔ **${c.to}** (${c.score}): ${c.reason}`)
    );
  }

  if (result.recommendations.length > 0) {
    lines.push('\n## 💡 Recommendations\n');
    result.recommendations.forEach(r => lines.push(r));
  }

  return lines.join('\n');
}
