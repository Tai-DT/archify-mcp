import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { analyzeProject } from './tools/analyze-project.js';
import { recommendStack, recommendDualStack, formatDualStack } from './tools/recommend-stack.js';
import { suggestFeatures, formatFeatureSuggestions } from './tools/suggest-features.js';
import { compareTechnologies } from './tools/compare-tech.js';
import { designArchitecture } from './tools/design-architecture.js';
import { estimateProject, formatEstimation } from './tools/estimate-project.js';
import { generateRoadmap, formatRoadmap } from './tools/generate-roadmap.js';
import { estimateInfrastructure, formatInfraEstimation } from './tools/estimate-infrastructure.js';
import { designDatabase, formatDatabaseDesign } from './tools/design-database.js';
import { auditSecurity, formatSecurityAudit } from './tools/audit-security.js';
import { planMigration, formatMigrationPlan } from './tools/migrate-stack.js';
import { generateBoilerplate, formatBoilerplate } from './tools/generate-boilerplate.js';
import { runFullAnalysis } from './tools/full-analysis.js';
import { designApi, formatApiDesign } from './tools/design-api.js';
import { planTesting, formatTestingStrategy } from './tools/plan-testing.js';
import { analyzeScalability, formatScalabilityPlan } from './tools/analyze-scalability.js';
import { assessTeam, formatTeamAssessment } from './tools/assess-team.js';
import { planDevOps, formatDevOpsStrategy } from './tools/plan-devops.js';
import { mapIntegrations, formatIntegrationMap } from './tools/map-integrations.js';
import { generateUISpec, formatUISpec } from './tools/generate-ui-spec.js';
import { createPerformanceBudget, formatPerformanceBudget } from './tools/create-performance-budget.js';
import { planMonetization, formatMonetizationPlan } from './tools/plan-monetization.js';
import { technologies } from './knowledge/technologies.js';
import { analyzeEnvironment } from './knowledge/scoring.js';
import { makeDecision, formatDecisionResult, type Criterion, type Alternative, type Constraint } from './engine/decision-engine.js';
import { analyzeStackCompatibility, formatCompatibility, findBestCompatible } from './engine/compatibility-graph.js';
import { monteCarloSimulation, formatMonteCarloResult, type Distribution } from './engine/optimizer.js';
import type { ProjectType, ProjectScale, BudgetRange, EnvironmentContext, DeploymentEnv, TargetDevice, NetworkCondition } from './types/index.js';

// Reusable Zod schemas
const deploymentEnvEnum = z.enum(['cloud_managed', 'cloud_iaas', 'edge', 'on_premise', 'hybrid', 'serverless', 'vps', 'shared_hosting']);
const targetDeviceEnum = z.enum(['high_end_desktop', 'standard_desktop', 'low_end_desktop', 'high_end_mobile', 'mid_range_mobile', 'low_end_mobile', 'tablet', 'smart_tv', 'iot_device', 'wearable', 'kiosk']);
const networkEnum = z.enum(['fiber', 'broadband', 'mobile_4g', 'mobile_3g', 'offline_first', 'intermittent', 'satellite']);
const projectTypeEnum = z.enum(['ecommerce', 'saas', 'social_network', 'marketplace', 'content_platform', 'fintech', 'healthtech', 'edtech', 'iot', 'ai_ml', 'gaming', 'enterprise', 'mobile_app', 'api_service', 'devtool', 'other']);
const scaleEnum = z.enum(['mvp', 'startup', 'growth', 'enterprise']);

function buildEnvContext(params: {
  deployment_env?: string; target_devices?: string[]; network_condition?: string;
  max_response_time_ms?: number; concurrent_users?: number; max_bundle_size_kb?: number;
  cold_start_tolerance_ms?: number; availability_sla?: number;
  max_server_ram_gb?: number; max_server_cpu_cores?: number; max_monthly_cost_usd?: number;
  compliance?: string[];
}): EnvironmentContext | undefined {
  if (!params.deployment_env) return undefined;
  return {
    deploymentEnv: params.deployment_env as DeploymentEnv,
    targetDevices: (params.target_devices || ['standard_desktop', 'mid_range_mobile']) as TargetDevice[],
    networkCondition: (params.network_condition || 'broadband') as NetworkCondition,
    performance: {
      maxResponseTimeMs: params.max_response_time_ms,
      concurrentUsers: params.concurrent_users,
      maxBundleSizeKb: params.max_bundle_size_kb,
      coldStartToleranceMs: params.cold_start_tolerance_ms,
      availabilitySla: params.availability_sla,
    },
    infrastructure: {
      maxServerRamGb: params.max_server_ram_gb,
      maxServerCpuCores: params.max_server_cpu_cores,
      maxMonthlyCostUsd: params.max_monthly_cost_usd,
      complianceReqs: params.compliance,
    },
  };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'archify',
    version: '1.0.0',
  });

  // ============================================================
  // TOOL 1: Analyze Project
  // ============================================================
  server.tool(
    'analyze_project',
    'Deep analysis of a project idea including market insights, risks, MVP scope, technical requirements, AND environment/device/performance analysis. Supports Vietnamese.',
    {
      name: z.string().describe('Project name'),
      description: z.string().describe('Detailed project description. Can be in English or Vietnamese.'),
      target_audience: z.string().optional().describe('Target audience description'),
      project_type: projectTypeEnum.optional().describe('Project type. Auto-detected if not provided.'),
      scale: scaleEnum.optional().describe('Project scale'),
      budget: z.enum(['bootstrap', 'seed', 'series_a', 'enterprise']).optional().describe('Budget range'),
      team_size: z.number().optional().describe('Number of developers'),
      timeline: z.string().optional().describe('Expected timeline'),
      // Environment context
      deployment_env: deploymentEnvEnum.optional().describe('Deployment environment: cloud_managed, edge, vps, serverless, on_premise, shared_hosting, etc.'),
      target_devices: z.array(targetDeviceEnum).optional().describe('Target devices: low_end_mobile, standard_desktop, iot_device, tablet, etc.'),
      network_condition: networkEnum.optional().describe('Network: fiber, broadband, mobile_4g, mobile_3g, offline_first, intermittent'),
      max_response_time_ms: z.number().optional().describe('Max acceptable response time in ms'),
      concurrent_users: z.number().optional().describe('Expected concurrent users'),
      max_server_ram_gb: z.number().optional().describe('Max server RAM in GB'),
      max_monthly_cost_usd: z.number().optional().describe('Max monthly infrastructure budget in USD'),
    },
    async (params) => {
      const env = buildEnvContext(params);
      const analysis = analyzeProject({
        name: params.name,
        description: params.description,
        targetAudience: params.target_audience,
        projectType: params.project_type as ProjectType,
        scale: params.scale as ProjectScale,
        budget: params.budget as BudgetRange,
        teamSize: params.team_size,
        timeline: params.timeline,
        environment: env,
      });

      const output = [
        `# 🔍 Project Analysis: ${analysis.summary}\n`,
        `**Type**: ${analysis.projectType} | **Scale**: ${analysis.scale}\n`,
        `## 👥 Target Audience`,
        `- **Primary**: ${analysis.targetAudience.primary}`,
        `- **Secondary**: ${analysis.targetAudience.secondary}`,
        `- **Demographics**: ${analysis.targetAudience.demographics.join(', ')}`,
        `- **Pain Points**: ${analysis.targetAudience.painPoints.join(', ')}\n`,
        `## 📊 Market Insights`,
        ...analysis.marketInsights.map(m => `- **[${m.impact.toUpperCase()}]** ${m.category}: ${m.insight}`),
        `\n## ⚠️ Risks`,
        ...analysis.risks.map(r => `- **[${r.severity.toUpperCase()}] ${r.category}**: ${r.description}\n  - 💡 Mitigation: ${r.mitigation}`),
        `\n## 🔧 Technical Requirements`,
        ...analysis.technicalRequirements.map(r => `- **[${r.priority}] ${r.category}**: ${r.requirement}`),
        `\n## 🎯 MVP Scope`,
        `- **Estimated**: ~${analysis.mvpScope.estimatedWeeks} weeks`,
        `- **Core Features**: ${analysis.mvpScope.coreFeatures.join(', ')}`,
        `- **Deferred**: ${analysis.mvpScope.deferredFeatures.join(', ')}`,
      ];

      // Add environment analysis if provided
      if (env) {
        const envAnalysis = analyzeEnvironment(env);
        output.push(`\n## 🖥️ Environment & Device Analysis`);
        output.push(`\n### Deployment`);
        output.push(envAnalysis.deploymentRecommendation);
        if (envAnalysis.deviceOptimizations.length > 0) {
          output.push(`\n### Device Optimizations`);
          envAnalysis.deviceOptimizations.forEach(o => output.push(o));
        }
        output.push(`\n### Network Strategy`);
        output.push(envAnalysis.networkStrategy);
        if (envAnalysis.performanceTargets.length > 0) {
          output.push(`\n### Performance Targets`);
          envAnalysis.performanceTargets.forEach(t => output.push(t));
        }
        if (envAnalysis.infraWarnings.length > 0) {
          output.push(`\n### ⚠️ Infrastructure Warnings`);
          envAnalysis.infraWarnings.forEach(w => output.push(w));
        }
      }

      return { content: [{ type: 'text' as const, text: output.join('\n') }] };
    }
  );

  // ============================================================
  // TOOL 2: Recommend Tech Stack
  // ============================================================
  server.tool(
    'recommend_stack',
    'Recommend the best technology stack considering deployment environment, target devices, network conditions, and infrastructure constraints. Scores 40+ technologies across 8 criteria + environment fit.',
    {
      project_type: projectTypeEnum.describe('Type of project'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Key features/keywords of the project (e.g., ["chat", "AI assistant", "video call", "mobile app"]). Used to auto-detect required tech categories.'),
      preferences: z.array(z.string()).optional().describe('Technology preferences (e.g., ["React", "PostgreSQL"])'),
      existing_stack: z.array(z.string()).optional().describe('Currently used technologies'),
      // Environment context
      deployment_env: deploymentEnvEnum.optional().describe('Where to deploy: cloud_managed, edge, vps, serverless, on_premise, shared_hosting'),
      target_devices: z.array(targetDeviceEnum).optional().describe('Target devices: low_end_mobile, iot_device, standard_desktop, etc.'),
      network_condition: networkEnum.optional().describe('Network: fiber, mobile_3g, offline_first, intermittent, etc.'),
      max_response_time_ms: z.number().optional().describe('Max response time in ms (e.g., 200 for real-time)'),
      concurrent_users: z.number().optional().describe('Expected concurrent users'),
      max_bundle_size_kb: z.number().optional().describe('Max frontend bundle size in KB'),
      cold_start_tolerance_ms: z.number().optional().describe('Acceptable cold start time for serverless in ms'),
      max_server_ram_gb: z.number().optional().describe('Max server RAM in GB (e.g., 1 for small VPS)'),
      max_server_cpu_cores: z.number().optional().describe('Max CPU cores available'),
      max_monthly_cost_usd: z.number().optional().describe('Monthly infrastructure budget cap in USD'),
      compliance: z.array(z.string()).optional().describe('Compliance requirements: GDPR, HIPAA, PCI-DSS, SOC2'),
    },
    async (params) => {
      const env = buildEnvContext(params);
      const stack = recommendStack(
        params.project_type as ProjectType,
        params.scale as ProjectScale,
        params.preferences || [],
        params.existing_stack || [],
        env,
        params.features || []
      );

      const lines: string[] = ['# 🛠️ Recommended Tech Stack\n'];

      // Show environment context if provided
      if (env) {
        const envAnalysis = analyzeEnvironment(env);
        lines.push('## 🌍 Environment Context\n');
        lines.push(`- **Deployment**: ${env.deploymentEnv.replace(/_/g, ' ')}`);
        lines.push(`- **Target Devices**: ${env.targetDevices.map(d => d.replace(/_/g, ' ')).join(', ')}`);
        lines.push(`- **Network**: ${env.networkCondition.replace(/_/g, ' ')}`);
        if (envAnalysis.infraWarnings.length > 0) {
          lines.push('');
          envAnalysis.infraWarnings.forEach(w => lines.push(w));
        }
        lines.push('\n---\n');
      }

      const renderRec = (label: string, rec?: any) => {
        if (!rec) return;
        lines.push(`## ${label}: **${rec.technology.name}** (Score: ${rec.score.toFixed(4)})`);
        lines.push(rec.reasoning);
        if (rec.alternatives.length > 0) {
          lines.push('\n**Alternatives:**');
          rec.alternatives.forEach((a: any) => lines.push(`- ${a.tech.name} — ${a.reason}`));
        }
        if (rec.rejections && rec.rejections.length > 0) {
          lines.push('\n**❌ Tại sao không chọn:**');
          rec.rejections.forEach((r: any) => {
            lines.push(`- **${r.tech}**:`);
            r.reasons.forEach((reason: string) => lines.push(`  - ${reason}`));
          });
        }
        lines.push('');
      };

      renderRec('📱 Frontend', stack.frontend);
      renderRec('🎨 UI Library', stack.frontendUI);
      renderRec('⚙️ Backend', stack.backend);
      renderRec('🗄️ Database', stack.database);
      renderRec('⚡ Cache', stack.cache);
      renderRec('🔐 Authentication', stack.auth);
      renderRec('☁️ Cloud/Hosting', stack.cloud);
      renderRec('🔄 CI/CD', stack.cicd);
      renderRec('📊 Monitoring', stack.monitoring);
      renderRec('💬 Real-time', stack.realtime);
      renderRec('💳 Payment', stack.payment);
      renderRec('📱 Mobile', stack.mobile);
      renderRec('📦 Storage', stack.storage);
      renderRec('📨 Messaging', stack.messaging);

      if (stack.additionalTools && stack.additionalTools.length > 0) {
        lines.push('## 🔧 Additional Tools');
        stack.additionalTools.forEach((t: any) => lines.push(`- **${t.technology.name}** (${t.score.toFixed(1)}) — ${t.technology.description}`));
      }

      lines.push(`\n---\n${stack.reasoning}`);
      lines.push(`\n### 🏗️ Architecture Notes\n${stack.architectureNotes}`);

      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    }
  );

  // ============================================================
  // TOOL 3: Suggest Features
  // ============================================================
  server.tool(
    'suggest_features',
    'Suggest features for a project organized by priority (Must-Have, Should-Have, Could-Have, Innovative). Includes complexity estimates and tech requirements.',
    {
      project_type: z.enum(['ecommerce', 'saas', 'social_network', 'marketplace', 'content_platform', 'fintech', 'healthtech', 'edtech', 'iot', 'ai_ml', 'gaming', 'enterprise', 'mobile_app', 'api_service', 'devtool', 'other']).describe('Type of project'),
      existing_features: z.array(z.string()).optional().describe('Features already implemented (will be excluded from suggestions)'),
    },
    async ({ project_type, existing_features }) => {
      const suggestion = suggestFeatures(project_type as ProjectType, existing_features || []);
      const formatted = formatFeatureSuggestions(suggestion);
      return { content: [{ type: 'text' as const, text: formatted }] };
    }
  );

  // ============================================================
  // TOOL 4: Compare Technologies
  // ============================================================
  server.tool(
    'compare_tech',
    'Compare 2 or more technologies side-by-side across 8 scoring criteria. Generates a ranking table with winner.',
    {
      technologies: z.array(z.string()).min(2).describe('Technology names to compare (e.g., ["React", "Vue", "Svelte"])'),
      criteria: z.array(z.string()).optional().describe('Specific criteria to compare on (default: all 8)'),
    },
    async ({ technologies: techNames, criteria }) => {
      const comparison = compareTechnologies(techNames, criteria || undefined);
      const output = `${comparison.summary}\n\n## 📊 Comparison Table\n\n${comparison.table}`;
      return { content: [{ type: 'text' as const, text: output }] };
    }
  );

  // ============================================================
  // TOOL 5: Design Architecture
  // ============================================================
  server.tool(
    'design_architecture',
    'Design system architecture with Mermaid diagrams, component breakdown, deployment strategy, and scaling plan.',
    {
      project_type: z.enum(['ecommerce', 'saas', 'social_network', 'marketplace', 'content_platform', 'fintech', 'healthtech', 'edtech', 'iot', 'ai_ml', 'gaming', 'enterprise', 'mobile_app', 'api_service', 'devtool', 'other']).describe('Project type'),
      scale: z.enum(['mvp', 'startup', 'growth', 'enterprise']).describe('Project scale'),
      team_size: z.number().optional().describe('Team size (default: 3)'),
      requires_realtime: z.boolean().optional().describe('Does the project need real-time features?'),
      requires_multi_platform: z.boolean().optional().describe('Does the project need web + mobile + API?'),
    },
    async ({ project_type, scale, team_size, requires_realtime, requires_multi_platform }) => {
      const stack = recommendStack(project_type as ProjectType, scale as ProjectScale);
      const arch = designArchitecture(
        project_type as ProjectType,
        scale as ProjectScale,
        stack,
        team_size || 3,
        requires_realtime || false,
        requires_multi_platform || false
      );

      const lines = [
        `# 🏛️ Architecture Design\n`,
        `## Pattern: **${arch.pattern}**\n`,
        arch.reasoning,
        `\n## System Diagram\n\`\`\`mermaid\n${arch.diagram}\n\`\`\`\n`,
        `## Components\n`,
        ...arch.components.map(c => `### ${c.name} (${c.technology})\n- **Type**: ${c.type}\n- **Responsibilities**: ${c.responsibilities.join(', ')}\n- **Communicates with**: ${c.communicatesWith.join(', ')}\n`),
        `## Data Flow\n\`\`\`mermaid\n${arch.dataFlow}\n\`\`\`\n`,
        `## 🚀 Deployment Strategy\n- **Type**: ${arch.deploymentStrategy.type}\n- ${arch.deploymentStrategy.description}\n- **Infrastructure**: ${arch.deploymentStrategy.infrastructure.join(', ')}\n- **Est. Monthly Cost**: ${arch.deploymentStrategy.estimatedMonthlyCost}\n`,
        `## 📈 Scaling Strategy\n${arch.scalingStrategy.description}\n- Horizontal: ${arch.scalingStrategy.horizontal ? '✅' : '❌'}\n- Auto-scale: ${arch.scalingStrategy.autoScale ? '✅' : '❌'}\n- Load Balancing: ${arch.scalingStrategy.loadBalancing}\n- Caching: ${arch.scalingStrategy.caching.join(', ')}`,
      ];

      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    }
  );

  // ============================================================
  // TOOL 6: Estimate Project
  // ============================================================
  server.tool(
    'estimate_project',
    'Estimate project timeline, team composition, and costs based on features and scale.',
    {
      project_type: z.enum(['ecommerce', 'saas', 'social_network', 'marketplace', 'content_platform', 'fintech', 'healthtech', 'edtech', 'iot', 'ai_ml', 'gaming', 'enterprise', 'mobile_app', 'api_service', 'devtool', 'other']).describe('Project type'),
      scale: z.enum(['mvp', 'startup', 'growth', 'enterprise']).describe('Project scale'),
      team_size: z.number().optional().describe('Number of developers (default: 2)'),
    },
    async ({ project_type, scale, team_size }) => {
      const features = suggestFeatures(project_type as ProjectType);
      const estimation = estimateProject(features, scale as ProjectScale, team_size || 2);
      const formatted = formatEstimation(estimation);
      return { content: [{ type: 'text' as const, text: formatted }] };
    }
  );

  // ============================================================
  // TOOL 7: Generate Roadmap
  // ============================================================
  server.tool(
    'generate_roadmap',
    'Generate a development roadmap with Gantt chart, milestones, and critical path.',
    {
      project_name: z.string().describe('Name of the project'),
      project_type: z.enum(['ecommerce', 'saas', 'social_network', 'marketplace', 'content_platform', 'fintech', 'healthtech', 'edtech', 'iot', 'ai_ml', 'gaming', 'enterprise', 'mobile_app', 'api_service', 'devtool', 'other']).describe('Project type'),
      scale: z.enum(['mvp', 'startup', 'growth', 'enterprise']).describe('Project scale'),
      team_size: z.number().optional().describe('Team size (default: 2)'),
    },
    async ({ project_name, project_type, scale, team_size }) => {
      const features = suggestFeatures(project_type as ProjectType);
      const estimation = estimateProject(features, scale as ProjectScale, team_size || 2);
      const roadmap = generateRoadmap(estimation, scale as ProjectScale, project_name);
      const formatted = formatRoadmap(roadmap, project_name);
      return { content: [{ type: 'text' as const, text: formatted }] };
    }
  );

  // ============================================================
  // TOOL 8: Estimate Infrastructure Cost
  // ============================================================
  server.tool(
    'estimate_infrastructure',
    'Estimate monthly infrastructure costs with scaling projections and provider comparisons. Checks free tiers and budget caps.',
    {
      stack_components: z.array(z.string()).describe('Technology/provider names in the stack (e.g., ["Vercel", "Supabase", "Stripe"])'),
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      concurrent_users: z.number().optional().describe('Expected concurrent users (default: 100)'),
      monthly_budget_usd: z.number().optional().describe('Monthly budget cap in USD'),
    },
    async ({ stack_components, project_type, scale, concurrent_users, monthly_budget_usd }) => {
      const result = estimateInfrastructure(stack_components, project_type as ProjectType, scale as ProjectScale, concurrent_users || 100, monthly_budget_usd);
      return { content: [{ type: 'text' as const, text: formatInfraEstimation(result) }] };
    }
  );

  // ============================================================
  // TOOL 9: Design Database
  // ============================================================
  server.tool(
    'design_database',
    'Design database schema with ER diagrams, table definitions, indexes, and recommendations. Templates for e-commerce, SaaS, and more.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      features: z.array(z.string()).optional().describe('Features to include in schema'),
    },
    async ({ project_type, features }) => {
      const schema = designDatabase(project_type as ProjectType, features || []);
      return { content: [{ type: 'text' as const, text: formatDatabaseDesign(schema) }] };
    }
  );

  // ============================================================
  // TOOL 10: Security Audit
  // ============================================================
  server.tool(
    'audit_security',
    'Audit security of a tech stack against OWASP Top 10. Includes compliance checks (GDPR, HIPAA, PCI-DSS), scoring, and actionable checklist.',
    {
      stack_tech_ids: z.array(z.string()).describe('Technology IDs in the stack (e.g., ["react", "express", "postgresql"])'),
      project_type: projectTypeEnum.describe('Project type'),
      has_auth: z.boolean().optional().describe('Does the app have authentication? (default: true)'),
      has_payment: z.boolean().optional().describe('Does the app process payments?'),
    },
    async ({ stack_tech_ids, project_type, has_auth, has_payment }) => {
      const audit = auditSecurity(stack_tech_ids, project_type as ProjectType, has_auth !== false, has_payment || false);
      return { content: [{ type: 'text' as const, text: formatSecurityAudit(audit) }] };
    }
  );

  // ============================================================
  // TOOL 11: Migration Advisor
  // ============================================================
  server.tool(
    'migrate_stack',
    'Plan a technology migration: compare old vs new stack, risk assessment, phased migration steps with rollback plans, and GO/NO-GO recommendation.',
    {
      current_stack: z.array(z.string()).describe('Current technology IDs (e.g., ["express", "mongodb"])'),
      target_stack: z.array(z.string()).describe('Target technology IDs (e.g., ["nestjs", "postgresql"])'),
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      team_size: z.number().optional().describe('Team size (default: 3)'),
    },
    async ({ current_stack, target_stack, project_type, scale, team_size }) => {
      const plan = planMigration(current_stack, target_stack, project_type as ProjectType, scale as ProjectScale, team_size || 3);
      return { content: [{ type: 'text' as const, text: formatMigrationPlan(plan) }] };
    }
  );

  // ============================================================
  // TOOL 12: Generate Boilerplate
  // ============================================================
  server.tool(
    'generate_boilerplate',
    'Generate config files (.env, docker-compose, Dockerfile, CI/CD, .gitignore) based on the recommended tech stack.',
    {
      project_name: z.string().describe('Project name'),
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      include_docker: z.boolean().optional().describe('Include Docker files (default: true)'),
      include_cicd: z.boolean().optional().describe('Include CI/CD workflow (default: true)'),
    },
    async ({ project_name, project_type, scale, include_docker, include_cicd }) => {
      const stack = recommendStack(project_type as ProjectType, scale as ProjectScale);
      const result = generateBoilerplate(stack, project_name, include_docker !== false, include_cicd !== false);
      return { content: [{ type: 'text' as const, text: formatBoilerplate(result) }] };
    }
  );
  // ============================================================
  // TOOL 13: Recommend Dual Stack (Module vs Standard)
  // ============================================================
  server.tool(
    'recommend_dual_stack',
    'Recommend TWO stacks side-by-side: Module (SaaS/SDK plug-in, nhanh) vs Standard (self-build, full control). Includes comparison table, advantages, cost/time differences, and hybrid recommendation.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Key features/keywords (e.g., ["chat", "AI", "mobile", "video call"]). Auto-detects required tech categories.'),
      deployment_env: deploymentEnvEnum.optional().describe('Deployment environment'),
      target_devices: z.array(targetDeviceEnum).optional().describe('Target devices'),
      network_condition: networkEnum.optional().describe('Network condition'),
      max_response_time_ms: z.number().optional().describe('Max response time in ms'),
      concurrent_users: z.number().optional().describe('Expected concurrent users'),
      max_server_ram_gb: z.number().optional().describe('Max server RAM in GB'),
      max_monthly_cost_usd: z.number().optional().describe('Monthly budget cap in USD'),
    },
    async (params) => {
      const env = buildEnvContext(params);
      const dual = recommendDualStack(
        params.project_type as ProjectType,
        params.scale as ProjectScale,
        [], [],
        env,
        params.features || []
      );
      return { content: [{ type: 'text' as const, text: formatDualStack(dual) }] };
    }
  );

  // ============================================================
  // TOOL 14: Full Analysis Pipeline (Quy trình khép kín)
  // ============================================================
  server.tool(
    'full_analysis',
    'COMPLETE closed-loop analysis pipeline. Runs ALL tools in sequence: Project Analysis → Features → Stack → Architecture → Database → Security → Cost → Estimation → Roadmap → Boilerplate. Produces a comprehensive report with GO/NO-GO verdict.',
    {
      name: z.string().describe('Project name'),
      description: z.string().describe('Detailed project description'),
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      budget: z.enum(['bootstrap', 'seed', 'series_a', 'enterprise']).optional().describe('Budget range'),
      team_size: z.number().optional().describe('Team size (default: 3)'),
      features: z.array(z.string()).optional().describe('Feature keywords (e.g., ["chat", "AI", "mobile"]). Auto-detected from description if not provided.'),
      // Environment
      deployment_env: deploymentEnvEnum.optional().describe('Deployment environment'),
      target_devices: z.array(targetDeviceEnum).optional().describe('Target devices'),
      network_condition: networkEnum.optional().describe('Network condition'),
      max_response_time_ms: z.number().optional().describe('Max response time in ms'),
      concurrent_users: z.number().optional().describe('Expected concurrent users'),
      max_server_ram_gb: z.number().optional().describe('Max server RAM in GB'),
      max_monthly_cost_usd: z.number().optional().describe('Monthly budget cap in USD'),
    },
    async (params) => {
      const env = buildEnvContext(params);
      const result = runFullAnalysis(
        params.name,
        params.description,
        params.project_type as ProjectType,
        params.scale as ProjectScale,
        params.budget as BudgetRange,
        params.team_size || 3,
        env,
        params.features || []
      );
      return { content: [{ type: 'text' as const, text: result.report }] };
    }
  );

  // ============================================================
  // TOOL 15: Design API
  // ============================================================
  server.tool(
    'design_api',
    'Design REST API endpoints based on project type and features. Generates endpoint tables, auth requirements, webhooks, rate limiting, and recommendations.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      features: z.array(z.string()).optional().describe('Feature keywords (e.g., ["chat", "AI", "file upload", "task management"])'),
    },
    async (params) => {
      const api = designApi(params.project_type as ProjectType, params.features || []);
      return { content: [{ type: 'text' as const, text: formatApiDesign(api) }] };
    }
  );

  // ============================================================
  // TOOL 16: Testing Strategy
  // ============================================================
  server.tool(
    'plan_testing',
    'Create comprehensive testing strategy: test pyramid, tool recommendations, coverage targets, performance testing plan, CI integration, and setup checklist.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Feature keywords for specialized test scenarios'),
    },
    async (params) => {
      const strategy = planTesting(params.project_type as ProjectType, params.scale as ProjectScale, undefined, params.features || []);
      return { content: [{ type: 'text' as const, text: formatTestingStrategy(strategy) }] };
    }
  );

  // ============================================================
  // TOOL 17: Scalability Analysis
  // ============================================================
  server.tool(
    'analyze_scalability',
    'Plan scaling from MVP to 1M users. Includes 4 growth stages, bottleneck predictions (DB, API, WebSocket, AI), caching strategy by layer, and database scaling phases.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Current scale'),
      features: z.array(z.string()).optional().describe('Feature keywords for bottleneck prediction'),
    },
    async (params) => {
      const plan = analyzeScalability(params.project_type as ProjectType, params.scale as ProjectScale, undefined, params.features || []);
      return { content: [{ type: 'text' as const, text: formatScalabilityPlan(plan) }] };
    }
  );

  // ============================================================
  // TOOL 18: Team Assessment
  // ============================================================
  server.tool(
    'assess_team',
    'Assess required team: roles, skills, hiring plan, salary ranges (VN/US), organization structure, and skill gap analysis.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      current_team_size: z.number().optional().describe('Current team size (default: 1)'),
      features: z.array(z.string()).optional().describe('Feature keywords to detect specialized roles'),
    },
    async (params) => {
      const assessment = assessTeam(params.project_type as ProjectType, params.scale as ProjectScale, undefined, params.features || [], params.current_team_size || 1);
      return { content: [{ type: 'text' as const, text: formatTeamAssessment(assessment) }] };
    }
  );

  // ============================================================
  // TOOL 19: DevOps Strategy
  // ============================================================
  server.tool(
    'plan_devops',
    'Plan DevOps strategy: CI/CD pipeline (GitHub Actions), monitoring (Sentry/Grafana), alerting rules, disaster recovery (RTO/RPO/backup), environment setup, and secret management.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Feature keywords for specialized monitoring'),
    },
    async (params) => {
      const strategy = planDevOps(params.project_type as ProjectType, params.scale as ProjectScale, undefined, params.features || []);
      return { content: [{ type: 'text' as const, text: formatDevOpsStrategy(strategy) }] };
    }
  );

  // ============================================================
  // TOOL 20: Integration Map
  // ============================================================
  server.tool(
    'map_integrations',
    'Map all third-party services needed: costs, free tiers, API keys, alternatives, vendor lock-in. Feature-aware: adds AI, chat, video, analytics services.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Feature keywords to detect required services'),
    },
    async (params) => {
      const map = mapIntegrations(params.project_type as ProjectType, params.scale as ProjectScale, params.features || []);
      return { content: [{ type: 'text' as const, text: formatIntegrationMap(map) }] };
    }
  );

  // ============================================================
  // TOOL 21: UI/UX Specification
  // ============================================================
  server.tool(
    'generate_ui_spec',
    'Generate UI/UX specification: design system (colors, typography, spacing), component inventory with variants/states, page layouts, responsive strategy, accessibility checklist (WCAG AA).',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Feature keywords for specialized components (chat, AI, kanban, video)'),
    },
    async (params) => {
      const spec = generateUISpec(params.project_type as ProjectType, params.scale as ProjectScale, params.features || []);
      return { content: [{ type: 'text' as const, text: formatUISpec(spec) }] };
    }
  );

  // ============================================================
  // TOOL 22: Performance Budget
  // ============================================================
  server.tool(
    'create_performance_budget',
    'Set performance budget: Core Web Vitals targets, bundle size limits, Lighthouse scores, network/server budgets, and optimization strategies.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Feature keywords for specialized performance targets'),
    },
    async (params) => {
      const budget = createPerformanceBudget(params.project_type as ProjectType, params.scale as ProjectScale, params.features || []);
      return { content: [{ type: 'text' as const, text: formatPerformanceBudget(budget) }] };
    }
  );

  // ============================================================
  // TOOL 23: Monetization Strategy
  // ============================================================
  server.tool(
    'plan_monetization',
    'Plan monetization: revenue model, pricing tiers, break-even analysis, business KPIs (MRR, CAC, LTV, churn), and pricing recommendations.',
    {
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      features: z.array(z.string()).optional().describe('Feature keywords for specialized pricing'),
      estimated_monthly_cost: z.number().optional().describe('Estimated monthly infrastructure cost in USD'),
    },
    async (params) => {
      const plan = planMonetization(params.project_type as ProjectType, params.scale as ProjectScale, params.features || [], params.estimated_monthly_cost || 200);
      return { content: [{ type: 'text' as const, text: formatMonetizationPlan(plan) }] };
    }
  );

  // ============================================================
  // TOOL 24: Smart Recommend (TOPSIS + AHP + CSP)
  // ============================================================
  server.tool(
    'smart_recommend',
    'Advanced tech recommendation using TOPSIS ranking + AHP weighting + Constraint Satisfaction. Returns ranked alternatives with confidence score, sensitivity analysis, and breakdown.',
    {
      category: z.string().describe('Technology category to recommend for (e.g., frontend_framework, database_relational, cache, auth, cloud)'),
      project_type: projectTypeEnum.describe('Project type'),
      scale: scaleEnum.describe('Project scale'),
      priorities: z.record(z.number()).optional().describe('Custom priority weights: { performance: 1-5, scalability: 1-5, costEfficiency: 1-5, ... }'),
      min_scores: z.record(z.number()).optional().describe('Hard constraints: minimum scores required, e.g. { security: 7, performance: 6 }'),
      features: z.array(z.string()).optional().describe('Feature keywords for context-aware filtering'),
    },
    async (params) => {
      // Build criteria with AHP weights
      const defaultPriorities: Record<string, number> = {
        performance: 3, scalability: 3, developerExperience: 3,
        ecosystem: 2, security: 3, costEfficiency: 3,
        documentation: 2, communitySupport: 2,
      };
      const priorities = { ...defaultPriorities, ...(params.priorities || {}) };

      // Scale-based adjustments
      if (params.scale === 'mvp') { priorities.costEfficiency += 2; priorities.developerExperience += 1; }
      if (params.scale === 'enterprise') { priorities.scalability += 2; priorities.security += 2; }

      const totalPriority = Object.values(priorities).reduce((s, v) => s + v, 0);
      const criteria: Criterion[] = Object.entries(priorities).map(([id, p]) => ({
        id, name: id.replace(/([A-Z])/g, ' $1').trim(), weight: p / totalPriority, direction: 'maximize' as const,
      }));

      // Build alternatives from technologies
      const categoryTechs = technologies.filter(t => t.category === params.category);
      const alternatives: Alternative[] = categoryTechs.map(t => ({
        id: t.id, name: t.name,
        scores: t.scores as unknown as Record<string, number>,
        metadata: { pricing: t.pricing, maturity: t.maturity, learningCurve: t.learningCurve },
      }));

      // Build constraints from min_scores
      const constraints: Constraint[] = [];
      if (params.min_scores) {
        for (const [key, minVal] of Object.entries(params.min_scores)) {
          constraints.push({ criterionId: key, operator: 'gte', value: minVal, label: `${key} >= ${minVal}` });
        }
      }

      const result = makeDecision(alternatives, criteria, constraints);
      return { content: [{ type: 'text' as const, text: formatDecisionResult(result) }] };
    }
  );

  // ============================================================
  // TOOL 25: Analyze Stack Compatibility
  // ============================================================
  server.tool(
    'analyze_compatibility',
    'Analyze compatibility between technologies using graph-based synergy/conflict detection. Shows +3 (perfect synergy) to -3 (incompatible) scores for each tech pair.',
    {
      tech_ids: z.array(z.string()).describe('Technology IDs to analyze compatibility for, e.g. ["nextjs", "prisma", "postgresql", "clerk", "vercel"]'),
    },
    async (params) => {
      const result = analyzeStackCompatibility(params.tech_ids);
      return { content: [{ type: 'text' as const, text: formatCompatibility(result) }] };
    }
  );

  // ============================================================
  // TOOL 26: Monte Carlo Cost Simulation
  // ============================================================
  server.tool(
    'simulate_cost',
    'Monte Carlo simulation for cost/timeline estimation under uncertainty. Uses PERT/triangular distributions. Returns P10 (optimistic), P50 (likely), P90 (pessimistic) with histogram.',
    {
      items: z.array(z.object({
        name: z.string().describe('Cost item name'),
        min: z.number().describe('Minimum (best case)'),
        likely: z.number().describe('Most likely value'),
        max: z.number().describe('Maximum (worst case)'),
        distribution: z.enum(['pert', 'triangular', 'normal', 'uniform']).optional().describe('Distribution type (default: pert)'),
      })).describe('Cost/timeline items with uncertainty ranges'),
      iterations: z.number().optional().describe('Number of simulation iterations (default: 10000)'),
      unit: z.string().optional().describe('Unit for display (default: $)'),
    },
    async (params) => {
      const distributions: Distribution[] = params.items.map(item => ({
        type: (item.distribution || 'pert') as Distribution['type'],
        min: item.min,
        most_likely: item.likely,
        max: item.max,
      }));

      const result = monteCarloSimulation(distributions, params.iterations || 10000);
      const unit = params.unit || '$';

      let output = formatMonteCarloResult(result, unit);
      output += '\n\n### Input Items\n';
      output += '| Item | Min | Likely | Max | Distribution |\n';
      output += '|------|-----|--------|-----|-------------|\n';
      params.items.forEach(item => {
        output += `| ${item.name} | ${unit}${item.min} | ${unit}${item.likely} | ${unit}${item.max} | ${item.distribution || 'pert'} |\n`;
      });

      return { content: [{ type: 'text' as const, text: output }] };
    }
  );

  // ============================================================
  // RESOURCE: Technology Catalog
  // ============================================================
  server.resource(
    'tech-catalog',
    'archify://tech-catalog',
    async (uri) => {
      const catalog = technologies.map(t =>
        `**${t.name}** (${t.category}) — ${t.description} | Scores: perf=${t.scores.performance} scale=${t.scores.scalability} dx=${t.scores.developerExperience} | ${t.maturity}`
      ).join('\n');

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/plain',
          text: `# Archify Technology Catalog (${technologies.length} technologies)\n\n${catalog}`,
        }]
      };
    }
  );

  return server;
}
