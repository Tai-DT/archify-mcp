import type { Technology, TechComparison, ComparisonCriteria } from '../types/index.js';
import { technologies, getTechById, searchTech } from '../knowledge/technologies.js';

const defaultCriteria = [
  'performance', 'scalability', 'developerExperience', 'ecosystem',
  'security', 'costEfficiency', 'documentation', 'communitySupport'
];

export function compareTechnologies(
  techNames: string[],
  criteria: string[] = defaultCriteria,
  weights?: Record<string, number>
): TechComparison {
  // Find technologies
  const techs: Technology[] = [];
  for (const name of techNames) {
    const found = getTechById(name.toLowerCase().replace(/[.\s]/g, '_')) || searchTech(name)[0];
    if (found) techs.push(found);
  }

  if (techs.length < 2) {
    return {
      technologies: techs,
      criteria: [],
      winner: { techId: techs[0]?.id || '', reason: 'Not enough technologies to compare' },
      summary: `⚠️ Could only find ${techs.length} technology(ies). Need at least 2 to compare. Found: ${techs.map(t => t.name).join(', ')}`,
      table: '',
    };
  }

  // Score each technology on each criterion
  const compCriteria: ComparisonCriteria[] = criteria.map(crit => {
    const weight = weights?.[crit] || 1;
    return {
      name: crit,
      weight,
      scores: techs.map(t => ({
        techId: t.id,
        score: (t.scores as any)[crit] || 0,
        note: getNoteForScore((t.scores as any)[crit] || 0),
      }))
    };
  });

  // Calculate totals
  const totals: Record<string, number> = {};
  for (const tech of techs) {
    totals[tech.id] = compCriteria.reduce((sum, c) => {
      const s = c.scores.find(s => s.techId === tech.id)?.score || 0;
      return sum + s * c.weight;
    }, 0);
  }

  // Determine winner
  const winnerId = Object.entries(totals).sort(([, a], [, b]) => b - a)[0][0];
  const winnerTech = techs.find(t => t.id === winnerId)!;

  // Generate comparison table
  const table = generateTable(techs, compCriteria, totals);

  return {
    technologies: techs,
    criteria: compCriteria,
    winner: { techId: winnerId, reason: `${winnerTech.name} has the highest weighted score (${totals[winnerId].toFixed(1)})` },
    summary: generateSummary(techs, totals, winnerTech),
    table,
  };
}

function getNoteForScore(score: number): string {
  if (score >= 9) return '🟢 Excellent';
  if (score >= 7) return '🟡 Good';
  if (score >= 5) return '🟠 Average';
  return '🔴 Below Average';
}

function generateTable(techs: Technology[], criteria: ComparisonCriteria[], totals: Record<string, number>): string {
  const header = `| Criteria | ${techs.map(t => `**${t.name}**`).join(' | ')} |`;
  const separator = `|---|${techs.map(() => '---').join('|')}|`;

  const rows = criteria.map(c => {
    const scores = techs.map(t => {
      const s = c.scores.find(s => s.techId === t.id);
      return s ? `${s.score}/10 ${s.note.split(' ')[0]}` : 'N/A';
    });
    return `| ${c.name} | ${scores.join(' | ')} |`;
  });

  const totalRow = `| **TOTAL** | ${techs.map(t => `**${totals[t.id].toFixed(1)}**`).join(' | ')} |`;

  // Extra info rows
  const extraRows = [
    `| Learning Curve | ${techs.map(t => t.learningCurve).join(' | ')} |`,
    `| Maturity | ${techs.map(t => t.maturity).join(' | ')} |`,
    `| Pricing | ${techs.map(t => t.pricing).join(' | ')} |`,
    `| Community | ${techs.map(t => t.communitySize).join(' | ')} |`,
  ];

  return [header, separator, ...rows, totalRow, '', ...extraRows].join('\n');
}

function generateSummary(techs: Technology[], totals: Record<string, number>, winner: Technology): string {
  const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);
  const ranking = sorted.map(([id, score], i) => {
    const tech = techs.find(t => t.id === id)!;
    return `${i + 1}. **${tech.name}** (${score.toFixed(1)}) — Best for: ${tech.bestFor.slice(0, 2).join(', ')}`;
  });

  return `## 🏆 Comparison Result\n\n**Winner: ${winner.name}**\n\n### Ranking:\n${ranking.join('\n')}\n\n### Key Differences:\n- **${winner.name}** excels at: ${winner.bestFor.slice(0, 3).join(', ')}\n- **${winner.name}** not ideal for: ${winner.notIdealFor.slice(0, 2).join(', ')}`;
}
