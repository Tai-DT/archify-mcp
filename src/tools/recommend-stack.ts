import type { ProjectType, ProjectScale, StackRecommendation, TechRecommendation, EnvironmentContext } from '../types/index.js';
import { getTopTechnologies, getRequiredCategories } from '../knowledge/scoring.js';
import type { TechCategory } from '../types/index.js';

const categoryLabels: Partial<Record<TechCategory, keyof StackRecommendation>> = {
  frontend_framework: 'frontend',
  frontend_ui: 'frontendUI',
  backend_framework: 'backend',
  database_relational: 'database',
  database_nosql: 'database',
  cache: 'cache',
  search: 'additionalTools' as any,
  auth: 'auth',
  storage: 'storage',
  cloud: 'cloud',
  ci_cd: 'cicd',
  monitoring: 'monitoring',
  message_queue: 'messaging',
  mobile: 'mobile',
  realtime: 'realtime',
  payment: 'payment',
};

export function recommendStack(
  projectType: ProjectType,
  scale: ProjectScale,
  preferences: string[] = [],
  existingStack: string[] = [],
  env?: EnvironmentContext,
  features: string[] = []
): StackRecommendation {
  const requiredCategories = getRequiredCategories(projectType, features);
  const stack: Partial<StackRecommendation> = {
    additionalTools: [],
  };

  for (const category of requiredCategories) {
    const topTechs = getTopTechnologies(category, projectType, scale, 3, env);
    if (topTechs.length === 0) continue;

    // Check if user has preference for this category
    const preferred = topTechs.find(t =>
      preferences.some(p => t.tech.name.toLowerCase().includes(p.toLowerCase())) ||
      existingStack.some(e => t.tech.id === e.toLowerCase())
    );

    const best = preferred || topTechs[0];
    const alternatives = topTechs.filter(t => t.tech.id !== best.tech.id);

    const envNotes = best.envNotes?.length ? `\n  - ${best.envNotes.join('\n  - ')}` : '';

    const rec: TechRecommendation = {
      technology: best.tech,
      score: best.score,
      reasoning: generateReasoning(best.tech, projectType, scale) + envNotes,
      alternatives: alternatives.map(a => ({
        tech: a.tech,
        reason: `Score: ${a.score.toFixed(1)} — Good for: ${a.tech.bestFor.slice(0, 2).join(', ')}` +
          (a.envNotes?.length ? ` | ${a.envNotes[0]}` : '')
      }))
    };

    const stackKey = categoryLabels[category];
    if (stackKey && stackKey !== 'additionalTools') {
      if (!(stack as any)[stackKey]) {
        (stack as any)[stackKey] = rec;
      }
    } else {
      stack.additionalTools!.push(rec);
    }
  }

  stack.reasoning = generateStackReasoning(stack as StackRecommendation, projectType, scale);
  stack.architectureNotes = generateArchNotes(projectType, scale);

  return stack as StackRecommendation;
}

function generateReasoning(tech: any, projectType: ProjectType, scale: ProjectScale): string {
  const scoreStr = Object.entries(tech.scores)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}/10`)
    .join(', ');

  return `**${tech.name}** is recommended for ${projectType.replace('_', ' ')} at ${scale} scale. ` +
    `Top scores: ${scoreStr}. ` +
    `Best for: ${tech.bestFor.slice(0, 3).join(', ')}. ` +
    `Maturity: ${tech.maturity}, Learning curve: ${tech.learningCurve}.`;
}

function generateStackReasoning(stack: StackRecommendation, projectType: ProjectType, scale: ProjectScale): string {
  const parts: string[] = [];
  parts.push(`## Stack Philosophy for ${projectType.replace('_', ' ')} (${scale})\n`);

  if (scale === 'mvp') {
    parts.push('🎯 **Priority: Speed to market** — This stack prioritizes developer experience and rapid development. Use managed services to minimize ops overhead.\n');
  } else if (scale === 'startup') {
    parts.push('🚀 **Priority: Balanced growth** — This stack balances developer velocity with scalability. Choose proven technologies with strong communities.\n');
  } else if (scale === 'growth') {
    parts.push('📈 **Priority: Scalability** — This stack emphasizes performance and scalability while maintaining developer productivity.\n');
  } else {
    parts.push('🏢 **Priority: Reliability & Security** — This stack prioritizes enterprise-grade security, compliance, and operational excellence.\n');
  }

  if (stack.frontend) parts.push(`- **Frontend**: ${stack.frontend.technology.name} — ${stack.frontend.technology.description}`);
  if (stack.backend) parts.push(`- **Backend**: ${stack.backend.technology.name} — ${stack.backend.technology.description}`);
  if (stack.database) parts.push(`- **Database**: ${stack.database.technology.name} — ${stack.database.technology.description}`);
  if (stack.cloud) parts.push(`- **Cloud**: ${stack.cloud.technology.name} — ${stack.cloud.technology.description}`);

  return parts.join('\n');
}

function generateArchNotes(projectType: ProjectType, scale: ProjectScale): string {
  const notes: Record<ProjectScale, string> = {
    mvp: '**Start as a monolith** — Deploy as a single service. Extract services only when you have clear scaling bottlenecks. Use managed services for infrastructure.',
    startup: '**Modular monolith** — Organize code into well-defined modules with clear boundaries. This makes future service extraction easy when needed.',
    growth: '**Consider modular monolith → microservices** — If your team is growing past 10 developers, start extracting high-traffic modules into separate services.',
    enterprise: '**Microservices with proper platform** — Invest in service mesh, observability, and CI/CD infrastructure. Each team owns their service end-to-end.',
  };
  return notes[scale];
}

// ============================================================
// Dual Stack: Module (plug-in) vs Standard (self-build)
// ============================================================

import type { DualStackRecommendation, DualStackComparison } from '../types/index.js';

export function recommendDualStack(
  projectType: ProjectType,
  scale: ProjectScale,
  preferences: string[] = [],
  existingStack: string[] = [],
  env?: EnvironmentContext,
  features: string[] = []
): DualStackRecommendation {
  const requiredCategories = getRequiredCategories(projectType, features);

  // Build module stack (prefer SaaS/SDK)
  const moduleStack: Partial<StackRecommendation> = { additionalTools: [] };
  // Build standard stack (prefer libraries/frameworks)
  const standardStack: Partial<StackRecommendation> = { additionalTools: [] };

  for (const category of requiredCategories) {
    const topTechs = getTopTechnologies(category, projectType, scale, 5, env);
    if (topTechs.length === 0) continue;

    // Split into module and standard
    const moduleTechs = topTechs.filter(t => t.tech.deploymentModel === 'module' || t.tech.deploymentModel === 'hybrid');
    const standardTechs = topTechs.filter(t => t.tech.deploymentModel === 'standard' || t.tech.deploymentModel === 'hybrid');

    // Pick best module option
    const bestModule = moduleTechs[0] || topTechs[0]; // fallback to best overall if no module
    const moduleAlts = moduleTechs.filter(t => t.tech.id !== bestModule.tech.id);

    // Pick best standard option
    const bestStandard = standardTechs[0] || topTechs[0];
    const standardAlts = standardTechs.filter(t => t.tech.id !== bestStandard.tech.id);

    const stackKey = categoryLabels[category];

    // Module rec
    const moduleRec: TechRecommendation = {
      technology: bestModule.tech,
      score: bestModule.score,
      reasoning: `🔌 **Module**: ${bestModule.tech.name} — plug & play, managed. ` + generateReasoning(bestModule.tech, projectType, scale),
      alternatives: moduleAlts.slice(0, 2).map(a => ({ tech: a.tech, reason: `Module: ${a.tech.name} (${a.score.toFixed(1)})` })),
    };

    // Standard rec
    const standardRec: TechRecommendation = {
      technology: bestStandard.tech,
      score: bestStandard.score,
      reasoning: `🛠️ **Standard**: ${bestStandard.tech.name} — self-build, full control. ` + generateReasoning(bestStandard.tech, projectType, scale),
      alternatives: standardAlts.slice(0, 2).map(a => ({ tech: a.tech, reason: `Standard: ${a.tech.name} (${a.score.toFixed(1)})` })),
    };

    if (stackKey && stackKey !== 'additionalTools') {
      if (!(moduleStack as any)[stackKey]) (moduleStack as any)[stackKey] = moduleRec;
      if (!(standardStack as any)[stackKey]) (standardStack as any)[stackKey] = standardRec;
    } else {
      moduleStack.additionalTools!.push(moduleRec);
      standardStack.additionalTools!.push(standardRec);
    }
  }

  moduleStack.reasoning = '🔌 **Module Stack**: Ưu tiên dịch vụ managed, SDK, BaaS. Nhanh triển khai, ít DevOps.\n' + generateStackReasoning(moduleStack as StackRecommendation, projectType, scale);
  moduleStack.architectureNotes = generateArchNotes(projectType, scale);

  standardStack.reasoning = '🛠️ **Standard Stack**: Ưu tiên library/framework tự build. Full control, giá thấp hơn lâu dài.\n' + generateStackReasoning(standardStack as StackRecommendation, projectType, scale);
  standardStack.architectureNotes = generateArchNotes(projectType, scale);

  // Comparison
  const comparison = buildComparison(moduleStack as StackRecommendation, standardStack as StackRecommendation, scale);

  return {
    module: moduleStack as StackRecommendation,
    standard: standardStack as StackRecommendation,
    comparison,
  };
}

function buildComparison(moduleStack: StackRecommendation, standardStack: StackRecommendation, scale: ProjectScale): DualStackComparison {
  const moduleAdvantages = [
    '⚡ Triển khai nhanh hơn 2-3x — không cần build infrastructure từ đầu',
    '🔧 Ít DevOps — managed services tự động scale, backup, monitoring',
    '🔒 Bảo mật tốt hơn mặc định — dịch vụ chuyên nghiệp xử lý auth, encryption',
    '📈 Scale dễ — chỉ cần upgrade plan, không cần optimize code',
    '🧑‍💻 Team nhỏ cũng deploy được — 1-2 người quản lý cả hệ thống',
  ];
  const standardAdvantages = [
    '💰 Chi phí thấp hơn lâu dài — không phải trả SaaS fee khi scale',
    '🎛️ Full control — tùy chỉnh mọi thứ, không bị vendor lock-in',
    '📊 Data sovereignty — dữ liệu hoàn toàn nằm trên server của bạn',
    '🔄 Không phụ thuộc dịch vụ bên thứ 3 — tự vận hành',
    '🧩 Tích hợp sâu hơn — customize logic theo yêu cầu đặc thù',
  ];

  const costDiff = {
    module: scale === 'mvp' ? '$0-50/mo (free tiers)' : scale === 'startup' ? '$100-500/mo' : '$500-5000/mo',
    standard: scale === 'mvp' ? '$5-20/mo (VPS)' : scale === 'startup' ? '$50-200/mo' : '$200-2000/mo',
  };

  const timeDiff = {
    module: scale === 'mvp' ? '1-2 tuần' : scale === 'startup' ? '3-6 tuần' : '8-16 tuần',
    standard: scale === 'mvp' ? '3-6 tuần' : scale === 'startup' ? '8-16 tuần' : '20-40 tuần',
  };

  // Recommendation logic
  let recommendation: 'module' | 'standard' | 'hybrid';
  let reasoning: string;

  if (scale === 'mvp' || scale === 'startup') {
    recommendation = 'hybrid';
    reasoning = '🎯 **Hybrid approach**: Dùng Module cho auth, payment, monitoring (speed-to-market) + Standard cho core business logic (control). Đây là cách tiếp cận tối ưu cho startup.';
  } else if (scale === 'enterprise') {
    recommendation = 'standard';
    reasoning = '🏢 **Standard**: Enterprise cần full control, data sovereignty, và custom integration. Module chỉ dùng cho non-core services.';
  } else {
    recommendation = 'hybrid';
    reasoning = '📈 **Hybrid**: Growth stage nên dần migrate từ Module → Standard cho các component có cost tăng nhanh, nhưng giữ Module cho những thứ không phải core (monitoring, CI/CD).';
  }

  return { moduleAdvantages, standardAdvantages, costDifference: costDiff, timeDifference: timeDiff, recommendation, reasoning };
}

export function formatDualStack(dual: DualStackRecommendation): string {
  const lines: string[] = ['# 🔀 Dual Stack Recommendation\n'];
  lines.push(`> So sánh **Module** (plug-in SaaS/SDK) vs **Standard** (tự build)\n`);

  // Side-by-side table
  lines.push('## 📊 So sánh nhanh\n');
  lines.push('| Khía cạnh | 🔌 Module | 🛠️ Standard |');
  lines.push('|-----------|----------|-------------|');

  const categories: (keyof StackRecommendation)[] = ['frontend', 'backend', 'database', 'auth', 'cache', 'cloud', 'monitoring', 'payment', 'realtime', 'mobile', 'storage'];
  const labels: Record<string, string> = {
    frontend: 'Frontend', backend: 'Backend', database: 'Database', auth: 'Auth',
    cache: 'Cache', cloud: 'Cloud', monitoring: 'Monitoring', payment: 'Payment',
    realtime: 'Realtime', mobile: 'Mobile', storage: 'Storage'
  };

  for (const cat of categories) {
    const m = (dual.module as any)[cat] as TechRecommendation | undefined;
    const s = (dual.standard as any)[cat] as TechRecommendation | undefined;
    if (!m && !s) continue;
    lines.push(`| **${labels[cat] || cat}** | ${m ? `${m.technology.name} (${m.score.toFixed(1)})` : '—'} | ${s ? `${s.technology.name} (${s.score.toFixed(1)})` : '—'} |`);
  }

  lines.push(`| **Chi phí** | ${dual.comparison.costDifference.module} | ${dual.comparison.costDifference.standard} |`);
  lines.push(`| **Thời gian** | ${dual.comparison.timeDifference.module} | ${dual.comparison.timeDifference.standard} |`);

  // Advantages
  lines.push('\n## 🔌 Ưu điểm Module (managed/SaaS)\n');
  dual.comparison.moduleAdvantages.forEach(a => lines.push(a));

  lines.push('\n## 🛠️ Ưu điểm Standard (self-build)\n');
  dual.comparison.standardAdvantages.forEach(a => lines.push(a));

  // Recommendation
  lines.push(`\n## 🎯 Đề xuất: **${dual.comparison.recommendation.toUpperCase()}**\n`);
  lines.push(dual.comparison.reasoning);

  // Detail for each stack
  lines.push('\n---\n## 🔌 Module Stack (chi tiết)\n');
  for (const cat of categories) {
    const rec = (dual.module as any)[cat] as TechRecommendation | undefined;
    if (!rec) continue;
    lines.push(`### ${labels[cat]}: **${rec.technology.name}** (${rec.score.toFixed(1)})`);
    lines.push(rec.reasoning);
    if (rec.alternatives.length > 0) {
      lines.push('Alternatives: ' + rec.alternatives.map(a => a.tech.name).join(', '));
    }
    lines.push('');
  }

  lines.push('---\n## 🛠️ Standard Stack (chi tiết)\n');
  for (const cat of categories) {
    const rec = (dual.standard as any)[cat] as TechRecommendation | undefined;
    if (!rec) continue;
    lines.push(`### ${labels[cat]}: **${rec.technology.name}** (${rec.score.toFixed(1)})`);
    lines.push(rec.reasoning);
    if (rec.alternatives.length > 0) {
      lines.push('Alternatives: ' + rec.alternatives.map(a => a.tech.name).join(', '));
    }
    lines.push('');
  }

  return lines.join('\n');
}
