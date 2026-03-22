/**
 * Decision Engine — Thuật toán ra quyết định đa tiêu chí
 *
 * Algorithms:
 * 1. AHP (Analytic Hierarchy Process) — tính trọng số từ pairwise comparison
 * 2. TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) — xếp hạng
 * 3. CSP (Constraint Satisfaction Problem) — lọc hard constraints
 * 4. Weighted Score — fallback simple scoring
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface Criterion {
  id: string;
  name: string;
  weight: number;        // 0-1, tổng = 1
  direction: 'maximize' | 'minimize'; // higher is better vs lower is better
}

export interface Alternative {
  id: string;
  name: string;
  scores: Record<string, number>; // criterion_id → score (0-10)
  metadata?: Record<string, any>;
}

export interface Constraint {
  criterionId: string;
  operator: 'gte' | 'lte' | 'eq' | 'in' | 'not_in';
  value: number | string | string[];
  label: string;
}

export interface DecisionResult {
  rankings: RankedAlternative[];
  method: string;
  criteria: Criterion[];
  eliminatedByConstraints: { alternative: string; constraint: string }[];
  sensitivityAnalysis?: SensitivityResult;
  confidence: number; // 0-100
}

export interface RankedAlternative {
  rank: number;
  alternative: Alternative;
  score: number;
  normalizedScore: number; // 0-100
  breakdown: Record<string, number>; // criterion_id → weighted contribution
  strengths: string[];
  weaknesses: string[];
}

export interface SensitivityResult {
  robustness: number; // 0-100 — how stable is the top choice
  criticalCriteria: { criterion: string; swingRange: number }[]; // which criteria can change the result
  alternativeGaps: { from: string; to: string; gap: number }[];
}

// ═══════════════════════════════════════════
// AHP - Analytic Hierarchy Process
// ═══════════════════════════════════════════

/**
 * Compute criterion weights using AHP Pairwise Comparison
 * Input: square matrix where [i][j] = importance of criterion i vs j
 * Values: 1 = equal, 3 = moderate, 5 = strong, 7 = very strong, 9 = extreme
 * [j][i] = 1/[i][j] (reciprocal)
 *
 * Output: normalized weight vector
 */
export function ahpWeights(comparisonMatrix: number[][], criteriaIds: string[]): Map<string, number> {
  const n = comparisonMatrix.length;
  if (n !== criteriaIds.length) throw new Error('Matrix size must match criteria count');

  // Step 1: Normalize columns
  const colSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += comparisonMatrix[i][j];
    }
  }

  const normalized: number[][] = [];
  for (let i = 0; i < n; i++) {
    normalized[i] = [];
    for (let j = 0; j < n; j++) {
      normalized[i][j] = comparisonMatrix[i][j] / colSums[j];
    }
  }

  // Step 2: Row averages = priority vector (weights)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weights[i] += normalized[i][j];
    }
    weights[i] /= n;
  }

  // Step 3: Consistency check (CI, CR)
  // λmax calculation
  let lambdaMax = 0;
  for (let j = 0; j < n; j++) {
    let colWeightedSum = 0;
    for (let i = 0; i < n; i++) {
      colWeightedSum += comparisonMatrix[i][j] * weights[i];
    }
    lambdaMax += colWeightedSum / weights[j];
  }
  lambdaMax /= n;

  const CI = (lambdaMax - n) / (n - 1);
  // Random Consistency Index (Saaty)
  const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
  const CR = n > 2 ? CI / (RI[n - 1] || 1.49) : 0;

  // If CR > 0.1, weights are inconsistent — still use but flag
  if (CR > 0.1) {
    console.warn(`AHP Consistency Ratio = ${CR.toFixed(3)} > 0.1. Judgments may be inconsistent.`);
  }

  const result = new Map<string, number>();
  criteriaIds.forEach((id, i) => result.set(id, weights[i]));
  return result;
}

/**
 * Generate AHP comparison matrix from preset priorities
 * Simplifies AHP by converting priority levels to consistent pairwise values
 */
export function generateAHPMatrix(priorities: Map<string, number>): number[][] {
  const keys = [...priorities.keys()];
  const n = keys.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const pi = priorities.get(keys[i])!;
        const pj = priorities.get(keys[j])!;
        // Convert priority difference to Saaty scale (1-9)
        const diff = pi - pj;
        if (diff > 0) {
          matrix[i][j] = Math.min(9, 1 + diff * 2);
        } else {
          matrix[i][j] = 1 / Math.min(9, 1 + Math.abs(diff) * 2);
        }
      }
    }
  }

  return matrix;
}

// ═══════════════════════════════════════════
// TOPSIS - Technique for Order Preference
// ═══════════════════════════════════════════

/**
 * TOPSIS algorithm: rank alternatives by distance to ideal solution
 *
 * Steps:
 * 1. Normalize decision matrix (vector normalization)
 * 2. Apply weights
 * 3. Find ideal (A+) and anti-ideal (A-) solutions
 * 4. Calculate distance to A+ and A-
 * 5. Calculate relative closeness: C = d-/(d+ + d-)
 * 6. Rank by C (higher = better)
 */
export function topsisRank(
  alternatives: Alternative[],
  criteria: Criterion[]
): RankedAlternative[] {
  if (alternatives.length === 0) return [];
  if (alternatives.length === 1) {
    return [{
      rank: 1,
      alternative: alternatives[0],
      score: 1,
      normalizedScore: 100,
      breakdown: {},
      strengths: [],
      weaknesses: [],
    }];
  }

  const n = alternatives.length;
  const m = criteria.length;

  // Step 1: Build and normalize decision matrix
  // rij = xij / sqrt(sum(xij^2))
  const rawMatrix: number[][] = alternatives.map(alt =>
    criteria.map(c => alt.scores[c.id] ?? 0)
  );

  const normalizedMatrix: number[][] = [];
  for (let j = 0; j < m; j++) {
    const colSquareSum = Math.sqrt(rawMatrix.reduce((sum, row) => sum + row[j] ** 2, 0)) || 1;
    for (let i = 0; i < n; i++) {
      if (!normalizedMatrix[i]) normalizedMatrix[i] = [];
      normalizedMatrix[i][j] = rawMatrix[i][j] / colSquareSum;
    }
  }

  // Step 2: Apply weights
  const weightedMatrix: number[][] = normalizedMatrix.map(row =>
    row.map((val, j) => val * criteria[j].weight)
  );

  // Step 3: Ideal (A+) and Anti-ideal (A-) solutions
  const idealPositive: number[] = [];
  const idealNegative: number[] = [];

  for (let j = 0; j < m; j++) {
    const col = weightedMatrix.map(row => row[j]);
    if (criteria[j].direction === 'maximize') {
      idealPositive[j] = Math.max(...col);
      idealNegative[j] = Math.min(...col);
    } else {
      idealPositive[j] = Math.min(...col);
      idealNegative[j] = Math.max(...col);
    }
  }

  // Step 4: Euclidean distance to ideal and anti-ideal
  const distPositive: number[] = [];
  const distNegative: number[] = [];

  for (let i = 0; i < n; i++) {
    let dp = 0, dn = 0;
    for (let j = 0; j < m; j++) {
      dp += (weightedMatrix[i][j] - idealPositive[j]) ** 2;
      dn += (weightedMatrix[i][j] - idealNegative[j]) ** 2;
    }
    distPositive[i] = Math.sqrt(dp);
    distNegative[i] = Math.sqrt(dn);
  }

  // Step 5: Relative closeness
  const closeness: number[] = distPositive.map((dp, i) => {
    const total = dp + distNegative[i];
    return total === 0 ? 0.5 : distNegative[i] / total;
  });

  // Step 6: Rank and build results
  const maxCloseness = Math.max(...closeness);
  const minCloseness = Math.min(...closeness);
  const range = maxCloseness - minCloseness || 1;

  const results: RankedAlternative[] = alternatives.map((alt, i) => {
    // Calculate breakdown: contribution of each criterion
    const breakdown: Record<string, number> = {};
    criteria.forEach((c, j) => {
      breakdown[c.id] = weightedMatrix[i][j];
    });

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    criteria.forEach((c, j) => {
      const val = rawMatrix[i][j];
      const max = Math.max(...rawMatrix.map(row => row[j]));
      const min = Math.min(...rawMatrix.map(row => row[j]));
      const relativePosition = max === min ? 0.5 : (val - min) / (max - min);

      if (c.direction === 'maximize') {
        if (relativePosition >= 0.8) strengths.push(`${c.name}: ${val}/10 (top)`);
        if (relativePosition <= 0.2) weaknesses.push(`${c.name}: ${val}/10 (weak)`);
      } else {
        if (relativePosition <= 0.2) strengths.push(`${c.name}: ${val} (excellent)`);
        if (relativePosition >= 0.8) weaknesses.push(`${c.name}: ${val} (concern)`);
      }
    });

    return {
      rank: 0, // set after sort
      alternative: alt,
      score: closeness[i],
      normalizedScore: Math.round(((closeness[i] - minCloseness) / range) * 100),
      breakdown,
      strengths,
      weaknesses,
    };
  });

  // Sort by closeness descending
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => r.rank = i + 1);

  return results;
}

// ═══════════════════════════════════════════
// CSP - Constraint Satisfaction
// ═══════════════════════════════════════════

/**
 * Filter alternatives that don't satisfy hard constraints
 */
export function applyConstraints(
  alternatives: Alternative[],
  constraints: Constraint[]
): { passed: Alternative[]; eliminated: { alternative: string; constraint: string }[] } {
  const eliminated: { alternative: string; constraint: string }[] = [];
  const passed: Alternative[] = [];

  for (const alt of alternatives) {
    let passes = true;

    for (const constraint of constraints) {
      const value = alt.scores[constraint.criterionId] ?? alt.metadata?.[constraint.criterionId];
      if (value === undefined) continue;

      let satisfied = true;
      switch (constraint.operator) {
        case 'gte': satisfied = Number(value) >= Number(constraint.value); break;
        case 'lte': satisfied = Number(value) <= Number(constraint.value); break;
        case 'eq': satisfied = value === constraint.value; break;
        case 'in':
          satisfied = Array.isArray(constraint.value) && constraint.value.includes(String(value));
          break;
        case 'not_in':
          satisfied = Array.isArray(constraint.value) && !constraint.value.includes(String(value));
          break;
      }

      if (!satisfied) {
        eliminated.push({ alternative: alt.name, constraint: constraint.label });
        passes = false;
        break;
      }
    }

    if (passes) passed.push(alt);
  }

  return { passed, eliminated };
}

// ═══════════════════════════════════════════
// SENSITIVITY ANALYSIS
// ═══════════════════════════════════════════

/**
 * Analyze how sensitive the ranking is to weight changes
 * Swing each weight ±20% and check if top rank changes
 */
export function sensitivityAnalysis(
  alternatives: Alternative[],
  criteria: Criterion[]
): SensitivityResult {
  const baseRanking = topsisRank(alternatives, criteria);
  if (baseRanking.length < 2) {
    return { robustness: 100, criticalCriteria: [], alternativeGaps: [] };
  }

  const topChoice = baseRanking[0].alternative.id;
  let topChangeCount = 0;
  const criticalCriteria: { criterion: string; swingRange: number }[] = [];

  for (let j = 0; j < criteria.length; j++) {
    let minSwing = 0;

    // Try swinging this criterion's weight from 0 to 1 in steps
    for (let swing = -0.3; swing <= 0.3; swing += 0.05) {
      const modifiedCriteria = criteria.map((c, i) => {
        if (i === j) {
          return { ...c, weight: Math.max(0.01, Math.min(0.99, c.weight + swing)) };
        }
        // Re-normalize other weights
        const remainingWeight = 1 - Math.max(0.01, Math.min(0.99, criteria[j].weight + swing));
        const otherTotal = criteria.reduce((s, cr, k) => k === j ? s : s + cr.weight, 0) || 1;
        return { ...c, weight: (c.weight / otherTotal) * remainingWeight };
      });

      const newRanking = topsisRank(alternatives, modifiedCriteria);
      if (newRanking.length > 0 && newRanking[0].alternative.id !== topChoice) {
        topChangeCount++;
        minSwing = Math.abs(swing);
        break;
      }
    }

    if (minSwing > 0) {
      criticalCriteria.push({ criterion: criteria[j].name, swingRange: minSwing });
    }
  }

  // Calculate gaps between consecutive ranks
  const alternativeGaps = baseRanking.slice(0, -1).map((r, i) => ({
    from: r.alternative.name,
    to: baseRanking[i + 1].alternative.name,
    gap: r.score - baseRanking[i + 1].score,
  }));

  // Robustness: 100 if no criteria swing changes top, 0 if all do
  const robustness = Math.round(((criteria.length - criticalCriteria.length) / criteria.length) * 100);

  return { robustness, criticalCriteria, alternativeGaps };
}

// ═══════════════════════════════════════════
// FULL DECISION PIPELINE
// ═══════════════════════════════════════════

/**
 * Run the complete decision pipeline:
 * 1. Apply hard constraints (CSP) → filter out infeasible
 * 2. Calculate weights (AHP) → proper multi-criteria weights
 * 3. Rank alternatives (TOPSIS) → optimal ranking
 * 4. Sensitivity analysis → confidence measure
 */
export function makeDecision(
  alternatives: Alternative[],
  criteria: Criterion[],
  constraints: Constraint[] = [],
  runSensitivity: boolean = true
): DecisionResult {
  // Step 1: CSP — filter by hard constraints
  const { passed, eliminated } = applyConstraints(alternatives, constraints);

  if (passed.length === 0) {
    return {
      rankings: [],
      method: 'TOPSIS + CSP + AHP',
      criteria,
      eliminatedByConstraints: eliminated,
      confidence: 0,
    };
  }

  // Step 2: TOPSIS ranking
  const rankings = topsisRank(passed, criteria);

  // Step 3: Sensitivity analysis (optional, can be slow)
  let sensitivityResult: SensitivityResult | undefined;
  if (runSensitivity && passed.length >= 2) {
    sensitivityResult = sensitivityAnalysis(passed, criteria);
  }

  // Confidence: based on gap between #1 and #2, and sensitivity robustness
  let confidence = 50;
  if (rankings.length >= 2) {
    const gap = rankings[0].score - rankings[1].score;
    const gapConfidence = Math.min(40, gap * 200); // larger gap = more confident
    const robustConfidence = sensitivityResult ? sensitivityResult.robustness * 0.3 : 15;
    confidence = Math.round(Math.min(100, 30 + gapConfidence + robustConfidence));
  } else if (rankings.length === 1) {
    confidence = 80; // only one option passed constraints
  }

  return {
    rankings,
    method: 'TOPSIS + CSP + AHP',
    criteria,
    eliminatedByConstraints: eliminated,
    sensitivityAnalysis: sensitivityResult,
    confidence,
  };
}

/**
 * Format decision result to markdown
 */
export function formatDecisionResult(result: DecisionResult): string {
  const lines = ['# 🧠 Decision Analysis\n'];
  lines.push(`**Method**: ${result.method} | **Confidence**: ${result.confidence}%\n`);

  if (result.eliminatedByConstraints.length > 0) {
    lines.push('## ❌ Eliminated by Constraints\n');
    result.eliminatedByConstraints.forEach(e =>
      lines.push(`- **${e.alternative}**: ${e.constraint}`)
    );
    lines.push('');
  }

  if (result.rankings.length === 0) {
    lines.push('> ⚠️ No alternatives satisfy all constraints. Consider relaxing requirements.\n');
    return lines.join('\n');
  }

  lines.push('## 🏆 Rankings\n');
  lines.push('| Rank | Technology | Score | Confidence |');
  lines.push('|------|-----------|-------|------------|');
  result.rankings.forEach(r => {
    const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`;
    lines.push(`| ${medal} | **${r.alternative.name}** | ${r.normalizedScore}/100 | ${r.score.toFixed(4)} |`);
  });

  // Top pick details
  const top = result.rankings[0];
  lines.push(`\n## 🥇 Best Choice: **${top.alternative.name}**\n`);
  if (top.strengths.length > 0) {
    lines.push('**Strengths**:');
    top.strengths.forEach(s => lines.push(`- ✅ ${s}`));
  }
  if (top.weaknesses.length > 0) {
    lines.push('\n**Weaknesses**:');
    top.weaknesses.forEach(w => lines.push(`- ⚠️ ${w}`));
  }

  // Breakdown
  lines.push('\n### Score Breakdown\n');
  lines.push('| Criterion | Weight | ' + result.rankings.slice(0, 4).map(r => r.alternative.name).join(' | ') + ' |');
  lines.push('|-----------|--------|' + result.rankings.slice(0, 4).map(() => '---').join('|') + '|');
  result.criteria.forEach(c => {
    const scores = result.rankings.slice(0, 4).map(r =>
      `${(r.alternative.scores[c.id] ?? 0).toFixed(1)}`
    ).join(' | ');
    lines.push(`| ${c.name} | ${(c.weight * 100).toFixed(0)}% | ${scores} |`);
  });

  // Sensitivity
  if (result.sensitivityAnalysis) {
    const sa = result.sensitivityAnalysis;
    lines.push(`\n## 📊 Sensitivity Analysis\n`);
    lines.push(`**Robustness**: ${sa.robustness}% — ${sa.robustness >= 70 ? '✅ Kết quả ổn định' : sa.robustness >= 40 ? '🟡 Có thể thay đổi' : '🔴 Nhạy cảm với trọng số'}\n`);

    if (sa.criticalCriteria.length > 0) {
      lines.push('**Critical criteria** (thay đổi trọng số có thể đảo kết quả):');
      sa.criticalCriteria.forEach(c =>
        lines.push(`- ⚠️ **${c.criterion}**: swing ±${(c.swingRange * 100).toFixed(0)}% → thay đổi top pick`)
      );
    }

    if (sa.alternativeGaps.length > 0) {
      lines.push('\n**Khoảng cách giữa các lựa chọn**:');
      sa.alternativeGaps.slice(0, 3).forEach(g =>
        lines.push(`- ${g.from} → ${g.to}: gap = ${g.gap.toFixed(4)} ${g.gap < 0.05 ? '(⚠️ rất sát)' : ''}`)
      );
    }
  }

  return lines.join('\n');
}
