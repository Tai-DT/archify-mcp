/**
 * Optimizer — Pareto Optimization + Monte Carlo Simulation
 *
 * 1. Pareto Front: tìm giải pháp không bị dominated (tối ưu đa mục tiêu)
 * 2. Monte Carlo: mô phỏng ước lượng chi phí/timeline từ distributions
 * 3. Trade-off Analysis: phân tích đánh đổi giữa các tiêu chí
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface Objective {
  id: string;
  name: string;
  direction: 'minimize' | 'maximize';
}

export interface Solution {
  id: string;
  name: string;
  objectives: Record<string, number>; // objective_id → value
  metadata?: Record<string, any>;
}

export interface ParetoResult {
  paretoFront: Solution[];
  dominated: Solution[];
  tradeoffs: TradeOff[];
}

export interface TradeOff {
  fromSolution: string;
  toSolution: string;
  gains: { objective: string; improvement: number; direction: string }[];
  losses: { objective: string; sacrifice: number; direction: string }[];
}

export interface MonteCarloResult {
  mean: number;
  median: number;
  p10: number;  // 10th percentile (optimistic)
  p50: number;  // 50th percentile (likely)
  p90: number;  // 90th percentile (pessimistic)
  stdDev: number;
  histogram: { bucket: string; count: number; percentage: number }[];
  confidence: string;
}

export interface Distribution {
  type: 'triangular' | 'normal' | 'uniform' | 'pert';
  min: number;
  most_likely: number;
  max: number;
}

// ═══════════════════════════════════════════
// PARETO OPTIMIZATION
// ═══════════════════════════════════════════

/**
 * Find Pareto-optimal solutions (non-dominated front)
 *
 * Solution A dominates B if:
 * - A is at least as good as B in ALL objectives
 * - A is strictly better than B in at least ONE objective
 */
export function paretoFront(solutions: Solution[], objectives: Objective[]): ParetoResult {
  const front: Solution[] = [];
  const dominated: Solution[] = [];

  for (let i = 0; i < solutions.length; i++) {
    let isDominated = false;

    for (let j = 0; j < solutions.length; j++) {
      if (i === j) continue;

      if (dominates(solutions[j], solutions[i], objectives)) {
        isDominated = true;
        break;
      }
    }

    if (isDominated) {
      dominated.push(solutions[i]);
    } else {
      front.push(solutions[i]);
    }
  }

  // Calculate trade-offs between Pareto-optimal solutions
  const tradeoffs: TradeOff[] = [];
  for (let i = 0; i < front.length; i++) {
    for (let j = i + 1; j < front.length; j++) {
      const tradeoff = analyzeTradeOff(front[i], front[j], objectives);
      if (tradeoff) tradeoffs.push(tradeoff);
    }
  }

  return { paretoFront: front, dominated, tradeoffs };
}

function dominates(a: Solution, b: Solution, objectives: Objective[]): boolean {
  let atLeastAsGood = true;
  let strictlyBetter = false;

  for (const obj of objectives) {
    const va = a.objectives[obj.id] ?? 0;
    const vb = b.objectives[obj.id] ?? 0;

    if (obj.direction === 'maximize') {
      if (va < vb) { atLeastAsGood = false; break; }
      if (va > vb) strictlyBetter = true;
    } else {
      if (va > vb) { atLeastAsGood = false; break; }
      if (va < vb) strictlyBetter = true;
    }
  }

  return atLeastAsGood && strictlyBetter;
}

function analyzeTradeOff(a: Solution, b: Solution, objectives: Objective[]): TradeOff | null {
  const gains: TradeOff['gains'] = [];
  const losses: TradeOff['losses'] = [];

  for (const obj of objectives) {
    const va = a.objectives[obj.id] ?? 0;
    const vb = b.objectives[obj.id] ?? 0;
    const diff = va - vb;

    if (Math.abs(diff) < 0.01) continue;

    const isBetter = (obj.direction === 'maximize' && diff > 0) ||
                     (obj.direction === 'minimize' && diff < 0);

    if (isBetter) {
      gains.push({ objective: obj.name, improvement: Math.abs(diff), direction: obj.direction });
    } else {
      losses.push({ objective: obj.name, sacrifice: Math.abs(diff), direction: obj.direction });
    }
  }

  if (gains.length === 0 && losses.length === 0) return null;

  return { fromSolution: b.name, toSolution: a.name, gains, losses };
}

// ═══════════════════════════════════════════
// MONTE CARLO SIMULATION
// ═══════════════════════════════════════════

/**
 * Monte Carlo simulation for estimating uncertain values
 * Uses multiple distributions to model uncertainty in costs, timelines etc.
 *
 * @param distributions - Array of probability distributions to sum
 * @param iterations - Number of simulation runs (default 10000)
 */
export function monteCarloSimulation(
  distributions: Distribution[],
  iterations: number = 10000,
  label: string = 'value'
): MonteCarloResult {
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let total = 0;
    for (const dist of distributions) {
      total += sampleDistribution(dist);
    }
    samples.push(total);
  }

  // Sort for percentile calculation
  samples.sort((a, b) => a - b);

  const mean = samples.reduce((s, v) => s + v, 0) / iterations;
  const median = samples[Math.floor(iterations / 2)];
  const p10 = samples[Math.floor(iterations * 0.1)];
  const p50 = samples[Math.floor(iterations * 0.5)];
  const p90 = samples[Math.floor(iterations * 0.9)];

  // Standard deviation
  const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / iterations;
  const stdDev = Math.sqrt(variance);

  // Histogram (10 buckets)
  const min = samples[0];
  const max = samples[samples.length - 1];
  const bucketSize = (max - min) / 10 || 1;
  const buckets: number[] = new Array(10).fill(0);
  for (const s of samples) {
    const idx = Math.min(9, Math.floor((s - min) / bucketSize));
    buckets[idx]++;
  }

  const histogram = buckets.map((count, i) => ({
    bucket: `${(min + i * bucketSize).toFixed(0)}-${(min + (i + 1) * bucketSize).toFixed(0)}`,
    count,
    percentage: Math.round((count / iterations) * 100),
  }));

  // Confidence assessment
  const cv = mean > 0 ? stdDev / mean : 0; // coefficient of variation
  const confidence = cv < 0.1 ? 'High (CV < 10%)' : cv < 0.25 ? 'Medium (CV < 25%)' : 'Low (CV > 25%)';

  return { mean, median, p10, p50, p90, stdDev, histogram, confidence };
}

/**
 * Sample a single value from a distribution
 */
function sampleDistribution(dist: Distribution): number {
  switch (dist.type) {
    case 'triangular':
      return triangularSample(dist.min, dist.most_likely, dist.max);
    case 'pert':
      return pertSample(dist.min, dist.most_likely, dist.max);
    case 'uniform':
      return dist.min + Math.random() * (dist.max - dist.min);
    case 'normal': {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return dist.most_likely + z * ((dist.max - dist.min) / 6);
    }
    default:
      return dist.most_likely;
  }
}

/**
 * Triangular distribution sampling
 */
function triangularSample(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * PERT distribution sampling (weighted triangular, more emphasis on mode)
 * Mean = (min + 4*mode + max) / 6
 */
function pertSample(min: number, mode: number, max: number): number {
  // PERT uses Beta distribution approximation
  const lambda = 4;
  const mean = (min + lambda * mode + max) / (lambda + 2);
  const stdDev = (max - min) / (lambda + 2);

  // Approximate with Box-Muller (Beta would be better but more complex)
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const sample = mean + z * stdDev;

  // Clamp to [min, max]
  return Math.max(min, Math.min(max, sample));
}

// ═══════════════════════════════════════════
// FORMAT
// ═══════════════════════════════════════════

export function formatParetoResult(result: ParetoResult): string {
  const lines = ['# 🎯 Pareto Analysis\n'];
  lines.push(`**Optimal solutions**: ${result.paretoFront.length}`);
  lines.push(`**Dominated (eliminated)**: ${result.dominated.length}\n`);

  lines.push('## 🏆 Pareto Front (Non-dominated Solutions)\n');
  result.paretoFront.forEach(s => {
    const scores = Object.entries(s.objectives).map(([k, v]) => `${k}: ${v}`).join(' | ');
    lines.push(`- **${s.name}**: ${scores}`);
  });

  if (result.dominated.length > 0) {
    lines.push('\n## ❌ Dominated Solutions\n');
    result.dominated.forEach(s => lines.push(`- ~~${s.name}~~ (bị dominate bởi giải pháp tốt hơn)`));
  }

  if (result.tradeoffs.length > 0) {
    lines.push('\n## ⚖️ Trade-offs\n');
    result.tradeoffs.forEach(t => {
      lines.push(`\n**${t.fromSolution} → ${t.toSolution}**:`);
      t.gains.forEach(g => lines.push(`  - ✅ ${g.objective}: +${g.improvement.toFixed(1)}`));
      t.losses.forEach(l => lines.push(`  - ⚠️ ${l.objective}: -${l.sacrifice.toFixed(1)}`));
    });
  }

  return lines.join('\n');
}

export function formatMonteCarloResult(result: MonteCarloResult, unit: string = '$'): string {
  const lines = ['# 🎲 Monte Carlo Simulation\n'];
  lines.push(`**Confidence**: ${result.confidence}\n`);

  lines.push('| Percentile | Value |');
  lines.push('|------------|-------|');
  lines.push(`| P10 (optimistic) | ${unit}${result.p10.toFixed(0)} |`);
  lines.push(`| P50 (likely) | ${unit}${result.p50.toFixed(0)} |`);
  lines.push(`| P90 (pessimistic) | ${unit}${result.p90.toFixed(0)} |`);
  lines.push(`| Mean | ${unit}${result.mean.toFixed(0)} |`);
  lines.push(`| Std Dev | ${unit}${result.stdDev.toFixed(0)} |`);

  lines.push('\n### Distribution\n');
  lines.push('```');
  result.histogram.forEach(h => {
    const bar = '█'.repeat(Math.round(h.percentage / 2));
    lines.push(`${h.bucket.padStart(12)} | ${bar} ${h.percentage}%`);
  });
  lines.push('```');

  return lines.join('\n');
}
