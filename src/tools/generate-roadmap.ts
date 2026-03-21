import type { Roadmap, RoadmapPhase, Milestone, ProjectEstimation, ProjectScale } from '../types/index.js';

export function generateRoadmap(
  estimation: ProjectEstimation,
  scale: ProjectScale,
  projectName: string
): Roadmap {
  const phases: RoadmapPhase[] = estimation.phases.map((phase, i) => ({
    name: phase.name,
    duration: `${phase.weeks} weeks`,
    goals: phase.deliverables,
    features: phase.tasks,
    deliverables: phase.deliverables,
    teamFocus: estimation.teamComposition.map(t => t.role),
    risks: i === 0 ? ['Setup delays', 'Tech choice revision'] :
           i === 1 ? ['Scope creep', 'Technical complexity'] :
           ['Integration issues', 'Performance bottlenecks'],
  }));

  const milestones: Milestone[] = [];
  let weekCounter = 0;

  for (const phase of estimation.phases) {
    weekCounter += phase.weeks;
    milestones.push({
      name: phase.name.replace(/^[^\s]+\s/, '').replace(/^Phase \d+: /, ''),
      targetDate: `Week ${weekCounter}`,
      criteria: phase.deliverables,
      phase: phase.name,
    });
  }

  // Add launch milestone
  milestones.push({
    name: '🎉 Product Launch',
    targetDate: `Week ${weekCounter}`,
    criteria: ['All features deployed', 'Monitoring active', 'Documentation complete', 'Launch checklist done'],
    phase: 'Launch',
  });

  const criticalPath = estimation.phases
    .flatMap(p => p.tasks)
    .filter((_, i) => i < 5);

  return {
    phases,
    milestones,
    totalDuration: `${estimation.totalWeeks} weeks (~${Math.ceil(estimation.totalWeeks / 4)} months)`,
    criticalPath,
  };
}

export function formatRoadmap(roadmap: Roadmap, projectName: string): string {
  const lines: string[] = [`# 🗺️ Development Roadmap: ${projectName}\n`];

  lines.push(`**Total Duration**: ${roadmap.totalDuration}\n`);

  // Gantt chart in Mermaid
  lines.push('```mermaid');
  lines.push('gantt');
  lines.push(`    title ${projectName} Development Roadmap`);
  lines.push('    dateFormat  YYYY-MM-DD');
  lines.push('    axisFormat %b %d');

  let currentDate = new Date();
  for (const phase of roadmap.phases) {
    const cleanName = phase.name.replace(/[^\w\s]/g, '').trim();
    const weeks = parseInt(phase.duration) || 2;
    const startStr = currentDate.toISOString().split('T')[0];
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + weeks * 7);
    const endStr = endDate.toISOString().split('T')[0];

    lines.push(`    section ${cleanName}`);
    for (const feature of phase.features.slice(0, 4)) {
      const safeName = feature.replace(/[^\w\s]/g, '').trim();
      lines.push(`    ${safeName} :${startStr}, ${endStr}`);
    }
    currentDate = endDate;
  }
  lines.push('```\n');

  // Phase details
  for (const phase of roadmap.phases) {
    lines.push(`## ${phase.name}`);
    lines.push(`**Duration**: ${phase.duration}\n`);

    lines.push('**Goals:**');
    phase.goals.forEach(g => lines.push(`- ✅ ${g}`));

    lines.push('\n**Features:**');
    phase.features.forEach(f => lines.push(`- 🔧 ${f}`));

    lines.push('\n**Risks:**');
    phase.risks.forEach(r => lines.push(`- ⚠️ ${r}`));
    lines.push('');
  }

  // Milestones
  lines.push('## 🏁 Milestones\n');
  lines.push('| Milestone | Target | Criteria |');
  lines.push('|-----------|--------|----------|');
  for (const m of roadmap.milestones) {
    lines.push(`| ${m.name} | ${m.targetDate} | ${m.criteria.slice(0, 2).join(', ')} |`);
  }

  // Critical path
  lines.push('\n## ⛓️ Critical Path\n');
  lines.push(roadmap.criticalPath.map((t, i) => `${i + 1}. ${t}`).join('\n'));

  return lines.join('\n');
}
