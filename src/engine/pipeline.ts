/**
 * Pipeline Node System — DAG-based processing pipeline
 *
 * Mỗi bước phân tích là 1 Node. Nodes kết nối thành DAG (Directed Acyclic Graph).
 * Data flows: Node A → Node B → Node C
 * Nodes có typed inputs/outputs, error handling, timing.
 *
 * Key concepts:
 * - Node: đơn vị xử lý nhỏ nhất
 * - Pipeline: chuỗi nodes có thứ tự
 * - Context: shared state giữa các nodes
 * - Result: typed output từ mỗi node
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface PipelineContext {
  // Shared state across all nodes
  projectName: string;
  description: string;
  projectType: string;
  scale: string;
  budget?: string;
  teamSize: number;
  features: string[];
  environment?: Record<string, any>;

  // Accumulated results from previous nodes
  results: Map<string, NodeResult>;

  // Timing
  startTime: number;
  nodeTimings: { nodeId: string; durationMs: number }[];

  // Errors
  errors: { nodeId: string; error: string }[];
  warnings: string[];
}

export interface NodeResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  data: any;
  durationMs: number;
  summary: string; // one-line summary for pipeline report
}

export type NodeExecutor = (ctx: PipelineContext) => Promise<NodeResult> | NodeResult;

export interface PipelineNode {
  id: string;
  name: string;
  description: string;
  phase: string;
  dependsOn: string[]; // node IDs that must run before this
  executor: NodeExecutor;
  optional: boolean; // if true, pipeline continues even if this node fails
}

export interface PipelineConfig {
  nodes: PipelineNode[];
  stopOnError: boolean;
  parallel: boolean; // run independent nodes in parallel (same phase)
}

export interface PipelineResult {
  success: boolean;
  totalDurationMs: number;
  nodesRun: number;
  nodesSkipped: number;
  nodesFailed: number;
  results: NodeResult[];
  context: PipelineContext;
  report: string;
}

// ═══════════════════════════════════════════
// PIPELINE EXECUTOR
// ═══════════════════════════════════════════

/**
 * Execute a pipeline of nodes in topological order
 * Respects dependencies, handles errors, measures timing
 */
export async function executePipeline(
  config: PipelineConfig,
  initialContext: Partial<PipelineContext>
): Promise<PipelineResult> {
  const ctx: PipelineContext = {
    projectName: initialContext.projectName || 'Unknown',
    description: initialContext.description || '',
    projectType: initialContext.projectType || 'saas',
    scale: initialContext.scale || 'startup',
    budget: initialContext.budget,
    teamSize: initialContext.teamSize || 3,
    features: initialContext.features || [],
    environment: initialContext.environment,
    results: new Map(),
    startTime: Date.now(),
    nodeTimings: [],
    errors: [],
    warnings: [],
  };

  const executionOrder = topologicalSort(config.nodes);
  const results: NodeResult[] = [];
  let nodesSkipped = 0;
  let nodesFailed = 0;

  for (const node of executionOrder) {
    // Check dependencies
    const unmetDeps = node.dependsOn.filter(
      depId => !ctx.results.has(depId) || ctx.results.get(depId)!.status === 'error'
    );

    if (unmetDeps.length > 0 && !node.optional) {
      const skipResult: NodeResult = {
        nodeId: node.id,
        status: 'skipped',
        data: null,
        durationMs: 0,
        summary: `Skipped: unmet dependencies [${unmetDeps.join(', ')}]`,
      };
      ctx.results.set(node.id, skipResult);
      results.push(skipResult);
      nodesSkipped++;
      continue;
    }

    // Execute node
    const startTime = Date.now();
    try {
      const result = await node.executor(ctx);
      result.durationMs = Date.now() - startTime;
      ctx.results.set(node.id, result);
      ctx.nodeTimings.push({ nodeId: node.id, durationMs: result.durationMs });
      results.push(result);

      if (result.status === 'error') {
        nodesFailed++;
        ctx.errors.push({ nodeId: node.id, error: result.summary });
        if (config.stopOnError && !node.optional) break;
      }
    } catch (err) {
      const errorResult: NodeResult = {
        nodeId: node.id,
        status: 'error',
        data: null,
        durationMs: Date.now() - startTime,
        summary: `Error: ${err instanceof Error ? err.message : String(err)}`,
      };
      ctx.results.set(node.id, errorResult);
      ctx.nodeTimings.push({ nodeId: node.id, durationMs: errorResult.durationMs });
      results.push(errorResult);
      nodesFailed++;
      ctx.errors.push({ nodeId: node.id, error: errorResult.summary });

      if (config.stopOnError && !node.optional) break;
    }
  }

  const totalDurationMs = Date.now() - ctx.startTime;

  // Generate report
  const report = generatePipelineReport(results, ctx, totalDurationMs);

  return {
    success: nodesFailed === 0,
    totalDurationMs,
    nodesRun: results.filter(r => r.status !== 'skipped').length,
    nodesSkipped,
    nodesFailed,
    results,
    context: ctx,
    report,
  };
}

// ═══════════════════════════════════════════
// TOPOLOGICAL SORT
// ═══════════════════════════════════════════

/**
 * Kahn's algorithm for topological sorting
 * Ensures nodes run in dependency-respecting order
 */
function topologicalSort(nodes: PipelineNode[]): PipelineNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  // Initialize
  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, new Set());
  }

  // Build graph
  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (adjacency.has(dep)) {
        adjacency.get(dep)!.add(node.id);
        inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
      }
    }
  }

  // BFS — start with nodes that have no dependencies
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: PipelineNode[] = [];
  while (queue.length > 0) {
    // Sort by phase for consistent ordering within same dependency level
    queue.sort((a, b) => {
      const phaseA = nodeMap.get(a)?.phase || '';
      const phaseB = nodeMap.get(b)?.phase || '';
      return phaseA.localeCompare(phaseB);
    });

    const current = queue.shift()!;
    const node = nodeMap.get(current);
    if (node) sorted.push(node);

    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // Check for cycles
  if (sorted.length !== nodes.length) {
    throw new Error('Pipeline has circular dependencies!');
  }

  return sorted;
}

// ═══════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════

function generatePipelineReport(
  results: NodeResult[],
  ctx: PipelineContext,
  totalDurationMs: number
): string {
  const lines: string[] = [];
  lines.push(`# 🔄 Pipeline Execution Report\n`);
  lines.push(`**Project**: ${ctx.projectName} | **Type**: ${ctx.projectType} | **Scale**: ${ctx.scale}`);
  lines.push(`**Duration**: ${totalDurationMs}ms | **Nodes**: ${results.length}\n`);

  // Summary
  const success = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  lines.push(`| Status | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| ✅ Success | ${success} |`);
  lines.push(`| ❌ Failed | ${failed} |`);
  lines.push(`| ⏭️ Skipped | ${skipped} |`);

  // Node details
  lines.push('\n## 📊 Node Results\n');
  lines.push('| Node | Status | Duration | Summary |');
  lines.push('|------|--------|----------|---------|');

  for (const r of results) {
    const statusEmoji = r.status === 'success' ? '✅' : r.status === 'error' ? '❌' : '⏭️';
    const duration = r.durationMs > 0 ? `${r.durationMs}ms` : '-';
    lines.push(`| ${r.nodeId} | ${statusEmoji} | ${duration} | ${r.summary.slice(0, 80)} |`);
  }

  // Errors
  if (ctx.errors.length > 0) {
    lines.push('\n## ⚠️ Errors\n');
    ctx.errors.forEach(e => lines.push(`- **${e.nodeId}**: ${e.error}`));
  }

  // Performance
  const slowNodes = ctx.nodeTimings
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 3);
  if (slowNodes.length > 0) {
    lines.push('\n## ⏱️ Slowest Nodes\n');
    slowNodes.forEach(n => lines.push(`- ${n.nodeId}: ${n.durationMs}ms`));
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════
// HELPER: Create simple node
// ═══════════════════════════════════════════

export function createNode(
  id: string,
  name: string,
  phase: string,
  dependsOn: string[],
  executor: NodeExecutor,
  optional: boolean = false
): PipelineNode {
  return {
    id,
    name,
    description: name,
    phase,
    dependsOn,
    executor,
    optional,
  };
}
