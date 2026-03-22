/**
 * Recommend Stack — TOPSIS-Driven, Unbiased Tech Selection
 *
 * KHÔNG hardcode bias cho bất kỳ tech nào.
 * Mỗi category dùng TOPSIS để xếp hạng, sau đó kiểm tra
 * compatibility giữa các lựa chọn bằng graph algorithm.
 *
 * Pipeline:
 * 1. Xác định categories cần thiết → từ projectType + features
 * 2. Mỗi category → TOPSIS ranking (weighted by context)
 * 3. Cross-validate → Compatibility Graph giữa top picks
 * 4. Optimize → nếu có conflict, thử swap để maximize tổng synergy
 * 5. Output → stack + reasoning + alternatives + compatibility score
 */

import type {
  ProjectType, ProjectScale, StackRecommendation, TechRecommendation,
  EnvironmentContext, TechCategory, Technology
} from '../types/index.js';
import { getRequiredCategories } from '../knowledge/scoring.js';
import { technologies } from '../knowledge/technologies.js';
import {
  makeDecision, topsisRank,
  type Criterion, type Alternative, type DecisionResult, type RankedAlternative
} from '../engine/decision-engine.js';
import {
  analyzeStackCompatibility, findBestCompatible,
  type CompatibilityResult
} from '../engine/compatibility-graph.js';

// ═══════════════════════════════════════════
// CONTEXT-AWARE WEIGHT PROFILES
// ═══════════════════════════════════════════

/**
 * Trọng số thay đổi theo projectType + scale
 * KHÔNG có bias cho bất kỳ technology cụ thể nào
 */
function buildCriteria(projectType: ProjectType, scale: ProjectScale, features: string[]): Criterion[] {
  // Base weights — balanced
  const w: Record<string, number> = {
    performance: 3,
    scalability: 3,
    developerExperience: 3,
    ecosystem: 3,
    security: 3,
    costEfficiency: 3,
    documentation: 2,
    communitySupport: 2,
  };

  // ── Scale modifiers ──
  switch (scale) {
    case 'mvp':
      w.developerExperience += 3; // nhanh ra sản phẩm
      w.costEfficiency += 2;     // tiết kiệm
      w.communitySupport += 1;   // dễ tìm help
      w.scalability -= 1;        // chưa quan trọng
      break;
    case 'startup':
      w.developerExperience += 2;
      w.ecosystem += 1;         // cần nhiều integrations
      w.scalability += 1;
      break;
    case 'growth':
      w.scalability += 3;
      w.performance += 2;
      w.security += 1;
      w.developerExperience -= 1;
      break;
    case 'enterprise':
      w.security += 4;
      w.scalability += 3;
      w.performance += 2;
      w.documentation += 1;
      w.costEfficiency -= 2;     // enterprise chi trả được
      w.developerExperience -= 2;
      break;
  }

  // ── Project type modifiers ──
  switch (projectType) {
    case 'fintech':
      w.security += 3;
      w.performance += 1;
      break;
    case 'healthtech':
      w.security += 3;
      break;
    case 'social_network':
      w.scalability += 2;
      w.performance += 2;
      break;
    case 'ecommerce':
      w.performance += 2;
      w.security += 1;
      break;
    case 'ai_ml':
      w.ecosystem += 2;       // cần AI libraries
      w.performance += 1;
      break;
    case 'edtech':
      w.developerExperience += 1;
      w.ecosystem += 1;
      break;
    case 'gaming':
      w.performance += 3;
      w.scalability += 1;
      break;
    case 'iot':
      w.performance += 2;
      w.costEfficiency += 2;
      break;
  }

  // ── Feature modifiers ──
  if (features.includes('realtime') || features.includes('chat')) {
    w.performance += 1;
  }
  if (features.includes('ai')) {
    w.ecosystem += 1;
  }
  if (features.includes('payment')) {
    w.security += 1;
  }

  // Normalize and build criteria
  const total = Object.values(w).reduce((s, v) => s + Math.max(1, v), 0);
  return Object.entries(w).map(([id, weight]) => ({
    id,
    name: id.replace(/([A-Z])/g, ' $1').trim(),
    weight: Math.max(1, weight) / total,
    direction: 'maximize' as const,
  }));
}

// ═══════════════════════════════════════════
// TOPSIS-DRIVEN RECOMMENDATION
// ═══════════════════════════════════════════

interface CategoryDecision {
  category: TechCategory;
  decision: DecisionResult;
  topPick: Alternative;
}

/**
 * Run TOPSIS for each required category
 */
function runCategoryDecisions(
  requiredCategories: TechCategory[],
  criteria: Criterion[],
): CategoryDecision[] {
  const decisions: CategoryDecision[] = [];

  for (const category of requiredCategories) {
    const categoryTechs = technologies.filter(t => t.category === category);
    if (categoryTechs.length === 0) continue;

    const alternatives: Alternative[] = categoryTechs.map(t => ({
      id: t.id,
      name: t.name,
      scores: t.scores as unknown as Record<string, number>,
      metadata: {
        pricing: t.pricing,
        maturity: t.maturity,
        learningCurve: t.learningCurve,
        deploymentModel: t.deploymentModel,
        bestFor: t.bestFor,
        ecosystem: t.ecosystem,
      },
    }));

    const decision = makeDecision(alternatives, criteria, [], false); // no sensitivity for speed

    if (decision.rankings.length > 0) {
      decisions.push({
        category,
        decision,
        topPick: decision.rankings[0].alternative,
      });
    }
  }

  return decisions;
}

/**
 * Compatibility-aware optimization:
 * If top picks have conflicts, try swapping to #2/#3 to maximize total synergy
 */
function optimizeForCompatibility(decisions: CategoryDecision[]): CategoryDecision[] {
  const topPickIds = decisions.map(d => d.topPick.id);
  const baseCompat = analyzeStackCompatibility(topPickIds);

  if (baseCompat.conflicts.length === 0) {
    return decisions; // no conflicts, keep original
  }

  // Try swapping conflicting techs with #2 picks
  let bestConfig = decisions.map(d => ({ ...d }));
  let bestScore = baseCompat.totalScore;

  for (const conflict of baseCompat.conflicts) {
    // Find which decision contains the conflicting tech
    for (let i = 0; i < decisions.length; i++) {
      const d = decisions[i];
      if (d.topPick.id === conflict.from || d.topPick.id === conflict.to) {
        // Try #2 pick
        if (d.decision.rankings.length >= 2) {
          const altPick = d.decision.rankings[1].alternative;
          const testIds = topPickIds.map((id, j) => j === i ? altPick.id : id);
          const testCompat = analyzeStackCompatibility(testIds);

          if (testCompat.totalScore > bestScore) {
            bestScore = testCompat.totalScore;
            bestConfig = decisions.map((dd, j) => j === i
              ? { ...dd, topPick: altPick }
              : { ...dd }
            );
          }
        }
      }
    }
  }

  return bestConfig;
}

// ═══════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════

const categoryLabels: Partial<Record<TechCategory, keyof StackRecommendation>> = {
  frontend_framework: 'frontend',
  frontend_ui: 'frontendUI',
  backend_framework: 'backend',
  database_relational: 'database',
  database_nosql: 'database',
  cache: 'cache',
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
  // 1. Build context-aware criteria (NO tech bias)
  const criteria = buildCriteria(projectType, scale, features);

  // 2. Determine required categories
  const requiredCategories = getRequiredCategories(projectType, features);

  // 3. Run TOPSIS for each category
  let decisions = runCategoryDecisions(requiredCategories, criteria);

  // 4. If user has preferences, boost matching techs (but don't force)
  if (preferences.length > 0 || existingStack.length > 0) {
    decisions = decisions.map(d => {
      const preferred = d.decision.rankings.find(r =>
        preferences.some(p => r.alternative.name.toLowerCase().includes(p.toLowerCase())) ||
        existingStack.some(e => r.alternative.id === e.toLowerCase())
      );
      // Only swap if preferred tech's score is within 20% of top
      if (preferred && preferred.rank !== 1) {
        const topScore = d.decision.rankings[0].score;
        const prefScore = preferred.score;
        if (prefScore >= topScore * 0.8) {
          return { ...d, topPick: preferred.alternative };
        }
      }
      return d;
    });
  }

  // 5. Optimize for compatibility (swap if conflicts exist)
  decisions = optimizeForCompatibility(decisions);

  // 6. Build StackRecommendation
  const stack: Partial<StackRecommendation> = {
    additionalTools: [],
  };

  for (const d of decisions) {
    const tech = technologies.find(t => t.id === d.topPick.id)!;
    const ranking = d.decision.rankings.find(r => r.alternative.id === d.topPick.id);
    const alts = d.decision.rankings
      .filter(r => r.alternative.id !== d.topPick.id)
      .slice(0, 2);

    // Build rejection reasons for NON-selected techs
    const rejectedRankings = d.decision.rankings
      .filter(r => r.alternative.id !== d.topPick.id);
    const rejections = buildRejections(rejectedRankings, ranking, criteria, d, projectType, scale);

    const rec: TechRecommendation = {
      technology: tech,
      score: ranking?.score ?? 0,
      reasoning: buildTopsisReasoning(tech, d, projectType, scale, criteria),
      alternatives: alts.map(a => ({
        tech: technologies.find(t => t.id === a.alternative.id)!,
        reason: `TOPSIS: ${a.normalizedScore}/100 — ${a.strengths.slice(0, 2).join(', ') || tech.bestFor[0]}`,
      })),
      rejections,
    };

    const stackKey = categoryLabels[d.category];
    if (stackKey && stackKey !== 'additionalTools') {
      if (!(stack as any)[stackKey]) {
        (stack as any)[stackKey] = rec;
      }
    } else {
      stack.additionalTools!.push(rec);
    }
  }

  // 7. Stack-level analysis
  const topPickIds = decisions.map(d => d.topPick.id);
  const compat = analyzeStackCompatibility(topPickIds);

  stack.reasoning = buildStackPhilosophy(stack as StackRecommendation, projectType, scale, compat, criteria);
  stack.architectureNotes = generateArchNotes(projectType, scale);

  return stack as StackRecommendation;
}

// ═══════════════════════════════════════════
// REASONING GENERATORS
// ═══════════════════════════════════════════

function buildTopsisReasoning(
  tech: Technology,
  decision: CategoryDecision,
  projectType: ProjectType,
  scale: ProjectScale,
  criteria: Criterion[]
): string {
  const ranking = decision.decision.rankings.find(r => r.alternative.id === tech.id);
  const lines: string[] = [];

  lines.push(`**${tech.name}** — chosen by TOPSIS algorithm (${decision.decision.method})`);

  if (ranking) {
    lines.push(`Score: ${ranking.normalizedScore}/100 | Confidence: ${decision.decision.confidence}%`);
    if (ranking.strengths.length > 0) {
      lines.push(`Strengths: ${ranking.strengths.join(', ')}`);
    }
    if (ranking.weaknesses.length > 0) {
      lines.push(`Watch out: ${ranking.weaknesses.join(', ')}`);
    }
  }

  // Show why this tech won — top 3 weighted criteria
  const topWeights = criteria
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(c => `${c.name} (${(c.weight * 100).toFixed(0)}%)`)
    .join(', ');
  lines.push(`Key factors for ${projectType}/${scale}: ${topWeights}`);

  return lines.join('\n');
}

/**
 * Build rejection reasons — tại sao KHÔNG chọn mỗi tech
 * Phân tích dựa trên:
 * 1. TOPSIS score gap vs winner
 * 2. Weaknesses trong context hiện tại
 * 3. Criteria nào bị điểm thấp (theo weight)
 * 4. Compatibility conflicts (nếu có)
 */
function buildRejections(
  rejectedRankings: RankedAlternative[],
  winnerRanking: RankedAlternative | undefined,
  criteria: Criterion[],
  decision: CategoryDecision,
  projectType: ProjectType,
  scale: ProjectScale
): { tech: string; reasons: string[] }[] {
  if (!winnerRanking || rejectedRankings.length === 0) return [];

  // Sort criteria by weight (highest first) for context
  const sortedCriteria = [...criteria].sort((a, b) => b.weight - a.weight);
  const topCriteriaIds = sortedCriteria.slice(0, 3).map(c => c.id);

  return rejectedRankings.map(rejected => {
    const reasons: string[] = [];
    const alt = rejected.alternative;
    const winnerAlt = winnerRanking.alternative;
    const scoreGap = winnerRanking.normalizedScore - rejected.normalizedScore;

    // 1. Overall TOPSIS score gap
    if (scoreGap > 50) {
      reasons.push(`TOPSIS score quá thấp: ${rejected.normalizedScore}/100 vs ${winnerRanking.normalizedScore}/100 (gap: ${scoreGap} điểm)`);
    } else if (scoreGap > 20) {
      reasons.push(`TOPSIS score thấp hơn đáng kể: ${rejected.normalizedScore}/100 vs ${winnerRanking.normalizedScore}/100`);
    } else if (scoreGap > 0) {
      reasons.push(`TOPSIS score sát nhưng thấp hơn: ${rejected.normalizedScore}/100 vs ${winnerRanking.normalizedScore}/100 (gap: ${scoreGap})`);
    }

    // 2. Specific criteria where this tech loses (focus on TOP weighted criteria)
    for (const criterionId of topCriteriaIds) {
      const c = criteria.find(cr => cr.id === criterionId)!;
      const rejectedScore = alt.scores[criterionId] ?? 0;
      const winnerScore = winnerAlt.scores[criterionId] ?? 0;
      const diff = winnerScore - rejectedScore;

      if (diff >= 2) {
        const weightPct = (c.weight * 100).toFixed(0);
        reasons.push(`${c.name} thấp: ${rejectedScore}/10 vs ${winnerAlt.name} ${winnerScore}/10 (tiêu chí này chiếm ${weightPct}% trọng số)`);
      }
    }

    // 3. Weaknesses from TOPSIS analysis
    if (rejected.weaknesses.length > 0) {
      const contextWeaknesses = rejected.weaknesses.filter((w: string) => {
        // Only include weaknesses relevant to current context
        const lw = w.toLowerCase();
        if (scale === 'enterprise' && (lw.includes('security') || lw.includes('scalability'))) return true;
        if (scale === 'mvp' && (lw.includes('developer') || lw.includes('cost'))) return true;
        if (projectType === 'fintech' && lw.includes('security')) return true;
        return true; // include all weaknesses
      });
      if (contextWeaknesses.length > 0 && reasons.length < 4) {
        reasons.push(`Điểm yếu: ${contextWeaknesses.slice(0, 2).join('; ')}`);
      }
    }

    // 4. Scale-specific mismatch
    if (scale === 'mvp') {
      const dx = alt.scores['developerExperience'] ?? 0;
      const cost = alt.scores['costEfficiency'] ?? 0;
      if (dx < 7) reasons.push(`Developer Experience chỉ ${dx}/10 — MVP cần DX cao để ship nhanh`);
      if (cost < 6) reasons.push(`Cost Efficiency ${cost}/10 — MVP ngân sách hạn chế`);
    }
    if (scale === 'enterprise') {
      const sec = alt.scores['security'] ?? 0;
      const scal = alt.scores['scalability'] ?? 0;
      if (sec < 8) reasons.push(`Security chỉ ${sec}/10 — enterprise cần ≥8`);
      if (scal < 8) reasons.push(`Scalability chỉ ${scal}/10 — enterprise cần ≥8`);
    }

    // 5. Learning curve concern
    const techData = technologies.find(t => t.id === alt.id);
    if (techData && techData.learningCurve === 'steep' && scale === 'mvp') {
      reasons.push(`Learning curve steep — MVP team cần tech dễ học, ship nhanh`);
    }

    // Deduplicate and limit
    const uniqueReasons = [...new Set(reasons)].slice(0, 5);

    return {
      tech: alt.name,
      reasons: uniqueReasons.length > 0 ? uniqueReasons : [`TOPSIS score thấp hơn: ${rejected.normalizedScore}/100`],
    };
  });
}

function buildStackPhilosophy(
  stack: StackRecommendation,
  projectType: ProjectType,
  scale: ProjectScale,
  compat: CompatibilityResult,
  criteria: Criterion[]
): string {
  const parts: string[] = [];
  parts.push(`## 🧠 Stack Selection (TOPSIS-driven, unbiased)\n`);

  // Show decision criteria weights
  parts.push('**Decision criteria** (auto-tuned for context):');
  const topCriteria = criteria
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
  topCriteria.forEach(c => {
    parts.push(`- ${c.name}: ${(c.weight * 100).toFixed(0)}%`);
  });

  parts.push('');

  // Compatibility summary
  const compatEmoji = compat.normalizedScore >= 70 ? '✅' : compat.normalizedScore >= 40 ? '🟡' : '🔴';
  parts.push(`**Stack compatibility**: ${compatEmoji} ${compat.normalizedScore}/100`);

  if (compat.synergies.length > 0) {
    parts.push(`Synergies: ${compat.synergies.map(s => `${s.from}↔${s.to}`).join(', ')}`);
  }
  if (compat.conflicts.length > 0) {
    parts.push(`⚠️ Conflicts: ${compat.conflicts.map(c => `${c.from}↔${c.to} (${c.reason})`).join(', ')}`);
  }

  parts.push('');

  // Stack summary
  if (stack.frontend) parts.push(`- **Frontend**: ${stack.frontend.technology.name} — ${stack.frontend.technology.description}`);
  if (stack.backend) parts.push(`- **Backend**: ${stack.backend.technology.name} — ${stack.backend.technology.description}`);
  if (stack.database) parts.push(`- **Database**: ${stack.database.technology.name} — ${stack.database.technology.description}`);
  if (stack.auth) parts.push(`- **Auth**: ${stack.auth.technology.name}`);
  if (stack.cloud) parts.push(`- **Cloud**: ${stack.cloud.technology.name}`);

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

// ═══════════════════════════════════════════
// DUAL STACK (preserved)
// ═══════════════════════════════════════════

import type { DualStackRecommendation, DualStackComparison } from '../types/index.js';
import { getTopTechnologies } from '../knowledge/scoring.js';

export function recommendDualStack(
  projectType: ProjectType,
  scale: ProjectScale,
  preferences: string[] = [],
  existingStack: string[] = [],
  env?: EnvironmentContext,
  features: string[] = []
): DualStackRecommendation {
  const criteria = buildCriteria(projectType, scale, features);
  const requiredCategories = getRequiredCategories(projectType, features);

  const moduleStack: Partial<StackRecommendation> = { additionalTools: [] };
  const standardStack: Partial<StackRecommendation> = { additionalTools: [] };

  for (const category of requiredCategories) {
    const categoryTechs = technologies.filter(t => t.category === category);
    if (categoryTechs.length === 0) continue;

    // TOPSIS for module techs
    const moduleTechs = categoryTechs.filter(t =>
      t.deploymentModel === 'module' || t.deploymentModel === 'hybrid'
    );
    const standardTechs = categoryTechs.filter(t =>
      t.deploymentModel === 'standard' || t.deploymentModel === 'hybrid'
    );

    const buildRec = (techs: Technology[], label: string): TechRecommendation | null => {
      if (techs.length === 0) return null;
      const alts: Alternative[] = techs.map(t => ({
        id: t.id, name: t.name,
        scores: t.scores as unknown as Record<string, number>,
      }));
      const result = makeDecision(alts, criteria, [], false);
      if (result.rankings.length === 0) return null;
      const top = result.rankings[0];
      const tech = techs.find(t => t.id === top.alternative.id)!;
      return {
        technology: tech,
        score: top.score,
        reasoning: `${label} **${tech.name}** — TOPSIS ${top.normalizedScore}/100. ${tech.bestFor.slice(0, 2).join(', ')}`,
        alternatives: result.rankings.slice(1, 3).map(r => ({
          tech: techs.find(t => t.id === r.alternative.id)!,
          reason: `TOPSIS: ${r.normalizedScore}/100`,
        })),
      };
    };

    const moduleRec = buildRec(moduleTechs, '🔌 Module:') || buildRec(categoryTechs, '🔌');
    const standardRec = buildRec(standardTechs, '🛠️ Standard:') || buildRec(categoryTechs, '🛠️');

    const stackKey = categoryLabels[category];
    if (stackKey && stackKey !== 'additionalTools') {
      if (moduleRec && !(moduleStack as any)[stackKey]) (moduleStack as any)[stackKey] = moduleRec;
      if (standardRec && !(standardStack as any)[stackKey]) (standardStack as any)[stackKey] = standardRec;
    } else {
      if (moduleRec) moduleStack.additionalTools!.push(moduleRec);
      if (standardRec) standardStack.additionalTools!.push(standardRec);
    }
  }

  moduleStack.reasoning = '🔌 **Module Stack** (TOPSIS-selected managed services)';
  moduleStack.architectureNotes = generateArchNotes(projectType, scale);
  standardStack.reasoning = '🛠️ **Standard Stack** (TOPSIS-selected self-build)';
  standardStack.architectureNotes = generateArchNotes(projectType, scale);

  const comparison = buildComparison(scale);

  return {
    module: moduleStack as StackRecommendation,
    standard: standardStack as StackRecommendation,
    comparison,
  };
}

function buildComparison(scale: ProjectScale): DualStackComparison {
  const moduleAdvantages = [
    '⚡ Triển khai nhanh hơn 2-3x — không cần build infrastructure từ đầu',
    '🔧 Ít DevOps — managed services tự động scale, backup, monitoring',
    '🔒 Bảo mật tốt hơn mặc định — dịch vụ chuyên nghiệp xử lý auth, encryption',
    '📈 Scale dễ — chỉ cần upgrade plan',
    '🧑‍💻 Team nhỏ cũng deploy được — 1-2 người quản lý cả hệ thống',
  ];
  const standardAdvantages = [
    '💰 Chi phí thấp hơn lâu dài — không phải trả SaaS fee khi scale',
    '🎛️ Full control — tùy chỉnh mọi thứ, không bị vendor lock-in',
    '📊 Data sovereignty — dữ liệu hoàn toàn nằm trên server của bạn',
    '🔄 Không phụ thuộc dịch vụ bên thứ 3',
    '🧩 Tích hợp sâu hơn — customize logic theo yêu cầu đặc thù',
  ];

  const costDiff = {
    module: scale === 'mvp' ? '$0-50/mo' : scale === 'startup' ? '$100-500/mo' : '$500-5000/mo',
    standard: scale === 'mvp' ? '$5-20/mo' : scale === 'startup' ? '$50-200/mo' : '$200-2000/mo',
  };
  const timeDiff = {
    module: scale === 'mvp' ? '1-2 tuần' : scale === 'startup' ? '3-6 tuần' : '8-16 tuần',
    standard: scale === 'mvp' ? '3-6 tuần' : scale === 'startup' ? '8-16 tuần' : '20-40 tuần',
  };

  let recommendation: 'module' | 'standard' | 'hybrid';
  let reasoning: string;

  if (scale === 'mvp' || scale === 'startup') {
    recommendation = 'hybrid';
    reasoning = '🎯 **Hybrid**: Module cho auth, payment, monitoring + Standard cho core logic.';
  } else if (scale === 'enterprise') {
    recommendation = 'standard';
    reasoning = '🏢 **Standard**: Enterprise cần full control, data sovereignty. Module chỉ cho non-core.';
  } else {
    recommendation = 'hybrid';
    reasoning = '📈 **Hybrid**: Dần migrate Module → Standard cho cost-heavy components.';
  }

  return { moduleAdvantages, standardAdvantages, costDifference: costDiff, timeDifference: timeDiff, recommendation, reasoning };
}

export function formatDualStack(dual: DualStackRecommendation): string {
  const lines: string[] = ['# 🔀 Dual Stack Recommendation (TOPSIS-driven)\n'];
  lines.push(`> So sánh **Module** (plug-in SaaS/SDK) vs **Standard** (tự build)\n`);

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
    lines.push(`| **${labels[cat] || cat}** | ${m ? `${m.technology.name} (${m.score.toFixed(4)})` : '—'} | ${s ? `${s.technology.name} (${s.score.toFixed(4)})` : '—'} |`);
  }

  lines.push(`| **Chi phí** | ${dual.comparison.costDifference.module} | ${dual.comparison.costDifference.standard} |`);
  lines.push(`| **Thời gian** | ${dual.comparison.timeDifference.module} | ${dual.comparison.timeDifference.standard} |`);

  lines.push('\n## 🔌 Ưu điểm Module\n');
  dual.comparison.moduleAdvantages.forEach(a => lines.push(a));
  lines.push('\n## 🛠️ Ưu điểm Standard\n');
  dual.comparison.standardAdvantages.forEach(a => lines.push(a));

  lines.push(`\n## 🎯 Đề xuất: **${dual.comparison.recommendation.toUpperCase()}**\n`);
  lines.push(dual.comparison.reasoning);

  return lines.join('\n');
}
