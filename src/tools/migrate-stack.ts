import type { ProjectType, ProjectScale } from '../types/index.js';
import { getTechById } from '../knowledge/technologies.js';
import { scoreTechnology } from '../knowledge/scoring.js';

export interface MigrationPlan {
  feasibility: 'easy' | 'moderate' | 'complex' | 'risky';
  riskLevel: number; // 1-10
  estimatedWeeks: number;
  currentStackAnalysis: StackAnalysis;
  targetStackAnalysis: StackAnalysis;
  comparison: { criterion: string; current: string; target: string; verdict: '✅ Better' | '⚠️ Similar' | '❌ Worse' }[];
  migrationSteps: MigrationStep[];
  risks: { risk: string; severity: 'high' | 'medium' | 'low'; mitigation: string }[];
  recommendation: string;
  summary: string;
}

interface StackAnalysis {
  techIds: string[];
  totalScore: number;
  strengths: string[];
  weaknesses: string[];
}

interface MigrationStep {
  phase: number;
  name: string;
  description: string;
  estimatedDays: number;
  dependencies: string[];
  rollbackPlan: string;
}

export function planMigration(
  currentStack: string[],
  targetStack: string[],
  projectType: ProjectType,
  scale: ProjectScale,
  teamSize: number = 3
): MigrationPlan {
  // Analyze both stacks
  const currentAnalysis = analyzeStack(currentStack, projectType, scale);
  const targetAnalysis = analyzeStack(targetStack, projectType, scale);

  // Compare
  const comparison = compareStacks(currentStack, targetStack, projectType, scale);

  // Generate migration steps
  const steps = generateMigrationSteps(currentStack, targetStack, scale);

  // Calculate risk
  const techChanges = currentStack.filter(c => !targetStack.includes(c)).length;
  const riskLevel = Math.min(10, techChanges * 2 + (scale === 'enterprise' ? 3 : scale === 'growth' ? 2 : 0));

  const feasibility: MigrationPlan['feasibility'] =
    riskLevel <= 3 ? 'easy' : riskLevel <= 5 ? 'moderate' : riskLevel <= 7 ? 'complex' : 'risky';

  const totalDays = steps.reduce((sum, s) => sum + s.estimatedDays, 0);
  const estimatedWeeks = Math.ceil(totalDays / (teamSize * 5)) + 1; // +1 buffer

  // Risks
  const risks = generateMigrationRisks(currentStack, targetStack, scale);

  // Recommendation
  const scoreDiff = targetAnalysis.totalScore - currentAnalysis.totalScore;
  let recommendation: string;
  if (scoreDiff > 2) {
    recommendation = `✅ **Nên migrate** — Stack mới tốt hơn đáng kể (+${scoreDiff.toFixed(1)} điểm). ROI sẽ tích cực sau ${estimatedWeeks} tuần.`;
  } else if (scoreDiff > 0) {
    recommendation = `🟡 **Cân nhắc** — Stack mới tốt hơn một chút (+${scoreDiff.toFixed(1)}). Chỉ migrate nếu có pain point cụ thể với stack hiện tại.`;
  } else {
    recommendation = `⚠️ **Không khuyến khích** — Stack mới không tốt hơn (${scoreDiff.toFixed(1)}). Rủi ro migration > lợi ích.`;
  }

  return {
    feasibility,
    riskLevel,
    estimatedWeeks,
    currentStackAnalysis: currentAnalysis,
    targetStackAnalysis: targetAnalysis,
    comparison,
    migrationSteps: steps,
    risks,
    recommendation,
    summary: `Migration từ [${currentStack.join(', ')}] → [${targetStack.join(', ')}]: ${feasibility} (${estimatedWeeks} tuần, risk ${riskLevel}/10)`,
  };
}

function analyzeStack(techIds: string[], projectType: ProjectType, scale: ProjectScale): StackAnalysis {
  let totalScore = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const id of techIds) {
    const tech = getTechById(id);
    if (!tech) continue;

    const score = scoreTechnology(tech, projectType, scale);
    totalScore += score;

    if (score > 7) strengths.push(`${tech.name}: ${tech.bestFor.slice(0, 2).join(', ')}`);
    if (score < 5) weaknesses.push(`${tech.name}: ${tech.notIdealFor.slice(0, 2).join(', ')}`);
  }

  return { techIds, totalScore: Math.round(totalScore * 100) / 100, strengths, weaknesses };
}

function compareStacks(
  current: string[],
  target: string[],
  projectType: ProjectType,
  scale: ProjectScale
): MigrationPlan['comparison'] {
  const criteria = ['performance', 'scalability', 'developerExperience', 'ecosystem', 'security', 'costEfficiency'] as const;

  return criteria.map(criterion => {
    const currentAvg = avgScore(current, criterion);
    const targetAvg = avgScore(target, criterion);
    const diff = targetAvg - currentAvg;

    return {
      criterion: criterion.replace(/([A-Z])/g, ' $1').trim(),
      current: `${currentAvg.toFixed(1)}/10`,
      target: `${targetAvg.toFixed(1)}/10`,
      verdict: diff > 0.5 ? '✅ Better' as const : diff < -0.5 ? '❌ Worse' as const : '⚠️ Similar' as const,
    };
  });
}

function avgScore(techIds: string[], criterion: string): number {
  let total = 0;
  let count = 0;
  for (const id of techIds) {
    const tech = getTechById(id);
    if (tech && (tech.scores as any)[criterion] !== undefined) {
      total += (tech.scores as any)[criterion];
      count++;
    }
  }
  return count > 0 ? total / count : 5;
}

function generateMigrationSteps(current: string[], target: string[], scale: ProjectScale): MigrationStep[] {
  const steps: MigrationStep[] = [];
  let phase = 1;

  // Phase 1: Setup & preparation
  steps.push({
    phase: phase++,
    name: 'Preparation & Planning',
    description: 'Setup target environment, install dependencies, create migration branches, write integration tests for current behavior.',
    estimatedDays: scale === 'enterprise' ? 5 : 3,
    dependencies: [],
    rollbackPlan: 'No changes to production yet — safe to abandon.',
  });

  // Phase 2: Database migration (if DB changes)
  const dbChanged = current.some(c => ['postgresql', 'mysql', 'mongodb'].includes(c)) &&
                    target.some(t => ['postgresql', 'mysql', 'mongodb'].includes(t)) &&
                    !current.some(c => target.includes(c) && ['postgresql', 'mysql', 'mongodb'].includes(c));
  if (dbChanged) {
    steps.push({
      phase: phase++,
      name: 'Database Migration',
      description: 'Export data, transform schema, import to new DB, verify data integrity.',
      estimatedDays: scale === 'enterprise' ? 10 : 5,
      dependencies: ['Preparation'],
      rollbackPlan: 'Keep old DB running in parallel. Revert connection strings if needed.',
    });
  }

  // Phase 3: Backend migration
  const backendChanged = !current.some(c => target.includes(c) &&
    ['nestjs', 'express', 'fastapi', 'django', 'go_gin', 'laravel', 'spring_boot', 'hono'].includes(c));
  if (backendChanged) {
    steps.push({
      phase: phase++,
      name: 'Backend Migration',
      description: 'Rewrite API endpoints in new framework. Maintain API contract (same request/response). Run both in parallel.',
      estimatedDays: scale === 'enterprise' ? 15 : 8,
      dependencies: dbChanged ? ['Database Migration'] : ['Preparation'],
      rollbackPlan: 'Blue-green deployment — route traffic back to old backend if issues arise.',
    });
  }

  // Phase 4: Frontend migration
  const frontendChanged = !current.some(c => target.includes(c) &&
    ['react', 'nextjs', 'vue', 'angular', 'svelte'].includes(c));
  if (frontendChanged) {
    steps.push({
      phase: phase++,
      name: 'Frontend Migration',
      description: 'Rebuild UI components in new framework. Use micro-frontend approach for gradual migration if large.',
      estimatedDays: scale === 'enterprise' ? 20 : 10,
      dependencies: backendChanged ? ['Backend Migration'] : ['Preparation'],
      rollbackPlan: 'Deploy under feature flag — rollback by disabling flag.',
    });
  }

  // Phase 5: Testing & QA
  steps.push({
    phase: phase++,
    name: 'Testing & Quality Assurance',
    description: 'Run full test suite, performance benchmarks, security scan, UAT with stakeholders.',
    estimatedDays: scale === 'enterprise' ? 10 : 5,
    dependencies: ['All previous phases'],
    rollbackPlan: 'Fix issues or revert to old stack.',
  });

  // Phase 6: Gradual rollout
  steps.push({
    phase: phase++,
    name: 'Gradual Rollout',
    description: 'Canary deployment (10% → 50% → 100%). Monitor errors, performance, user feedback.',
    estimatedDays: scale === 'enterprise' ? 7 : 3,
    dependencies: ['Testing'],
    rollbackPlan: 'Route traffic back to old stack immediately.',
  });

  // Phase 7: Cleanup
  steps.push({
    phase: phase++,
    name: 'Cleanup & Decommission',
    description: 'Remove old code, update docs, decommission old infrastructure, close migration branch.',
    estimatedDays: 2,
    dependencies: ['Gradual Rollout'],
    rollbackPlan: 'Keep old infra for 30 days as insurance.',
  });

  return steps;
}

function generateMigrationRisks(current: string[], target: string[], scale: ProjectScale) {
  const risks: { risk: string; severity: 'high' | 'medium' | 'low'; mitigation: string }[] = [];

  risks.push({
    risk: 'Data loss during migration',
    severity: 'high',
    mitigation: 'Full backup before migration. Run data validation checksums. Keep old DB for 30 days.',
  });

  risks.push({
    risk: 'Downtime during cutover',
    severity: scale === 'enterprise' ? 'high' : 'medium',
    mitigation: 'Blue-green deployment. Maintain both stacks during transition. Use feature flags.',
  });

  if (target.some(t => ['svelte', 'hono'].includes(t))) {
    risks.push({
      risk: 'Smaller talent pool for newer technologies',
      severity: 'medium',
      mitigation: 'Invest in team training. Document architecture decisions. Build internal knowledge base.',
    });
  }

  risks.push({
    risk: 'Feature regression',
    severity: 'high',
    mitigation: 'Write comprehensive E2E tests BEFORE migration. Maintain API contract. UAT testing.',
  });

  if (scale === 'enterprise' || scale === 'growth') {
    risks.push({
      risk: 'Performance degradation in new stack',
      severity: 'high',
      mitigation: 'Benchmark both stacks under load. Set performance budgets. Monitor during canary.',
    });
  }

  return risks;
}

export function formatMigrationPlan(plan: MigrationPlan): string {
  const lines = ['# 🔄 Migration Plan\n'];

  lines.push(`## Summary\n${plan.summary}\n`);
  lines.push(`- **Feasibility**: ${plan.feasibility.toUpperCase()}`);
  lines.push(`- **Risk Level**: ${plan.riskLevel}/10`);
  lines.push(`- **Estimated Duration**: ${plan.estimatedWeeks} weeks\n`);
  lines.push(`## 🎯 Recommendation\n${plan.recommendation}\n`);

  // Comparison
  lines.push('## 📊 Stack Comparison\n');
  lines.push('| Criterion | Current | Target | Verdict |');
  lines.push('|-----------|---------|--------|---------|');
  for (const c of plan.comparison) {
    lines.push(`| ${c.criterion} | ${c.current} | ${c.target} | ${c.verdict} |`);
  }

  lines.push(`\n- **Current total score**: ${plan.currentStackAnalysis.totalScore}`);
  lines.push(`- **Target total score**: ${plan.targetStackAnalysis.totalScore}`);

  // Migration steps
  lines.push('\n## 📋 Migration Steps\n');
  for (const step of plan.migrationSteps) {
    lines.push(`### Phase ${step.phase}: ${step.name} (~${step.estimatedDays} days)`);
    lines.push(step.description);
    if (step.dependencies.length > 0) lines.push(`- **Depends on**: ${step.dependencies.join(', ')}`);
    lines.push(`- **Rollback**: ${step.rollbackPlan}\n`);
  }

  // Risks
  lines.push('## ⚠️ Risks\n');
  for (const r of plan.risks) {
    const emoji = r.severity === 'high' ? '🔴' : r.severity === 'medium' ? '🟡' : '🔵';
    lines.push(`${emoji} **${r.risk}**`);
    lines.push(`  - Mitigation: ${r.mitigation}\n`);
  }

  return lines.join('\n');
}
