import type { ProjectEstimation, ProjectScale, FeatureSuggestion, EstimationPhase, TeamRole, CostEstimate } from '../types/index.js';

export function estimateProject(
  features: FeatureSuggestion,
  scale: ProjectScale,
  teamSize: number = 2
): ProjectEstimation {
  // Calculate total days
  const mustHaveDays = features.mustHave.reduce((sum, f) => sum + f.estimatedDays, 0);
  const shouldHaveDays = features.shouldHave.reduce((sum, f) => sum + f.estimatedDays, 0);
  const totalDevDays = mustHaveDays + shouldHaveDays;

  // Risk factor based on scale and complexity
  const avgComplexity = [...features.mustHave, ...features.shouldHave]
    .reduce((sum, f) => sum + complexityScore(f.complexity), 0) / Math.max([...features.mustHave, ...features.shouldHave].length, 1);

  const riskFactor = calcRiskFactor(scale, avgComplexity);
  const adjustedDays = Math.ceil(totalDevDays * riskFactor / teamSize);
  const totalWeeks = Math.ceil(adjustedDays / 5);

  // Generate phases
  const phases = generatePhases(features, totalWeeks, scale);
  const team = generateTeamComposition(scale, teamSize);
  const cost = estimateCost(scale, teamSize, totalWeeks);

  return {
    totalWeeks,
    totalDays: adjustedDays,
    phases,
    teamComposition: team,
    complexityScore: Math.round(avgComplexity * 10) / 10,
    riskFactor: Math.round(riskFactor * 100) / 100,
    costEstimate: cost,
  };
}

function complexityScore(c: string): number {
  const scores: Record<string, number> = { low: 2, medium: 5, high: 7, very_high: 9 };
  return scores[c] || 5;
}

function calcRiskFactor(scale: ProjectScale, avgComplexity: number): number {
  let factor = 1.0;
  if (scale === 'mvp') factor += 0.1;
  else if (scale === 'startup') factor += 0.2;
  else if (scale === 'growth') factor += 0.3;
  else factor += 0.5;

  if (avgComplexity > 7) factor += 0.2;
  else if (avgComplexity > 5) factor += 0.1;

  return Math.min(factor, 2.0);
}

function generatePhases(features: FeatureSuggestion, totalWeeks: number, scale: ProjectScale): EstimationPhase[] {
  const phases: EstimationPhase[] = [];

  // Phase 1: Foundation
  phases.push({
    name: '🏗️ Phase 1: Foundation & Setup',
    weeks: Math.max(1, Math.ceil(totalWeeks * 0.15)),
    tasks: ['Project setup & tooling', 'CI/CD pipeline', 'Database schema design', 'Auth system', 'Core UI components'],
    deliverables: ['Dev environment ready', 'CI/CD pipeline running', 'Auth flow working', 'Design system created'],
    dependencies: [],
  });

  // Phase 2: Core Features (must-have)
  const coreWeeks = Math.max(2, Math.ceil(totalWeeks * 0.45));
  phases.push({
    name: '🔧 Phase 2: Core Features',
    weeks: coreWeeks,
    tasks: features.mustHave.map(f => f.name),
    deliverables: ['All must-have features implemented', 'Basic test coverage', 'Internal demo ready'],
    dependencies: ['Phase 1'],
  });

  // Phase 3: Enhancement (should-have)
  if (features.shouldHave.length > 0) {
    phases.push({
      name: '✨ Phase 3: Enhancements',
      weeks: Math.max(1, Math.ceil(totalWeeks * 0.25)),
      tasks: features.shouldHave.map(f => f.name),
      deliverables: ['Should-have features completed', 'Improved UX', 'Extended test coverage'],
      dependencies: ['Phase 2'],
    });
  }

  // Phase 4: Polish & Launch
  phases.push({
    name: '🚀 Phase 4: Polish & Launch',
    weeks: Math.max(1, Math.ceil(totalWeeks * 0.15)),
    tasks: ['Performance optimization', 'Security hardening', 'Bug fixing', 'Documentation', 'Launch preparation'],
    deliverables: ['Production-ready build', 'Documentation complete', 'Monitoring configured', 'Launch checklist done'],
    dependencies: ['Phase 3'],
  });

  return phases;
}

function generateTeamComposition(scale: ProjectScale, teamSize: number): TeamRole[] {
  if (teamSize <= 2) {
    return [
      { role: 'Full-stack Developer', count: teamSize, seniorityLevel: 'senior', allocation: 100 },
    ];
  }

  const roles: TeamRole[] = [
    { role: 'Tech Lead / Architect', count: 1, seniorityLevel: 'lead', allocation: 80 },
    { role: 'Frontend Developer', count: Math.max(1, Math.floor(teamSize * 0.3)), seniorityLevel: 'mid', allocation: 100 },
    { role: 'Backend Developer', count: Math.max(1, Math.floor(teamSize * 0.3)), seniorityLevel: 'mid', allocation: 100 },
  ];

  if (scale === 'growth' || scale === 'enterprise') {
    roles.push({ role: 'DevOps Engineer', count: 1, seniorityLevel: 'senior', allocation: 50 });
    roles.push({ role: 'QA Engineer', count: 1, seniorityLevel: 'mid', allocation: 100 });
  }

  if (scale === 'enterprise') {
    roles.push({ role: 'Security Engineer', count: 1, seniorityLevel: 'senior', allocation: 30 });
  }

  return roles;
}

function estimateCost(scale: ProjectScale, teamSize: number, weeks: number): CostEstimate {
  // Rough cost estimates (USD)
  const hourlyRates: Record<ProjectScale, number> = { mvp: 40, startup: 60, growth: 80, enterprise: 120 };
  const rate = hourlyRates[scale];
  const devHours = weeks * 40 * teamSize;
  const devCost = devHours * rate;

  const infraMonthly: Record<ProjectScale, number> = { mvp: 50, startup: 200, growth: 2000, enterprise: 15000 };
  const thirdPartyMonthly: Record<ProjectScale, number> = { mvp: 0, startup: 100, growth: 500, enterprise: 2000 };

  return {
    development: `$${devCost.toLocaleString()}`,
    infrastructure: `$${infraMonthly[scale]}/month`,
    thirdPartyServices: `$${thirdPartyMonthly[scale]}/month`,
    total: `$${(devCost + infraMonthly[scale] * 3).toLocaleString()} (dev + 3 months infra)`,
    monthlyRunning: `$${(infraMonthly[scale] + thirdPartyMonthly[scale]).toLocaleString()}/month`,
  };
}

export function formatEstimation(est: ProjectEstimation): string {
  const lines: string[] = ['# 📊 Project Estimation\n'];

  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Duration | **${est.totalWeeks} weeks** (${est.totalDays} working days) |`);
  lines.push(`| Complexity Score | **${est.complexityScore}/10** |`);
  lines.push(`| Risk Factor | **${est.riskFactor}x** |`);
  lines.push(`| Development Cost | **${est.costEstimate.development}** |`);
  lines.push(`| Monthly Running | **${est.costEstimate.monthlyRunning}** |`);

  lines.push('\n## 📅 Phases\n');
  for (const phase of est.phases) {
    lines.push(`### ${phase.name} (${phase.weeks} weeks)`);
    lines.push(`**Tasks:** ${phase.tasks.join(', ')}`);
    lines.push(`**Deliverables:** ${phase.deliverables.join(', ')}\n`);
  }

  lines.push('## 👥 Team Composition\n');
  lines.push('| Role | Count | Level | Allocation |');
  lines.push('|------|-------|-------|-----------|');
  for (const role of est.teamComposition) {
    lines.push(`| ${role.role} | ${role.count} | ${role.seniorityLevel} | ${role.allocation}% |`);
  }

  lines.push(`\n## 💰 Cost Breakdown\n`);
  lines.push(`- **Development**: ${est.costEstimate.development}`);
  lines.push(`- **Infrastructure**: ${est.costEstimate.infrastructure}`);
  lines.push(`- **Third-party**: ${est.costEstimate.thirdPartyServices}`);
  lines.push(`- **Total (dev + 3mo infra)**: ${est.costEstimate.total}`);

  return lines.join('\n');
}
