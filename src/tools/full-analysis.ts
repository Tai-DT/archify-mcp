/**
 * Full Analysis Pipeline — Quy trình phân tích khép kín toàn diện
 *
 * Chạy toàn bộ 23 tools theo thứ tự logic:
 *
 *  1. Analyze Project → hiểu bài toán
 *  2. Suggest Features → xác định scope
 *  3. Recommend Stack (env-aware) → chọn công nghệ tốt nhất
 *  4. Design Architecture → thiết kế hệ thống
 *  5. Design Database → thiết kế DB
 *  6. Design API → thiết kế API endpoints
 *  7. Generate UI Spec → UI/UX specification
 *  8. Audit Security → đánh giá bảo mật
 *  9. Plan Testing → chiến lược test
 * 10. Performance Budget → ngân sách hiệu năng
 * 11. Estimate Infrastructure → tính chi phí
 * 12. Analyze Scalability → kế hoạch scaling
 * 13. Map Integrations → bản đồ dịch vụ 3rd party
 * 14. Assess Team → đánh giá team
 * 15. Estimate Project → ước lượng effort
 * 16. Plan Monetization → chiến lược kinh doanh
 * 17. Generate Roadmap → tạo roadmap
 * 18. Generate Boilerplate → tạo config
 * 19. Plan DevOps → chiến lược DevOps
 *
 * → Output: BÁO CÁO TỔNG HỢP 23 PHẦN + VERDICT GO/NO-GO
 */

import type { ProjectType, ProjectScale, BudgetRange, EnvironmentContext } from '../types/index.js';
import { analyzeProject } from './analyze-project.js';
import { recommendStack } from './recommend-stack.js';
import { suggestFeatures, formatFeatureSuggestions } from './suggest-features.js';
import { designArchitecture } from './design-architecture.js';
import { designDatabase, formatDatabaseDesign } from './design-database.js';
import { auditSecurity, formatSecurityAudit } from './audit-security.js';
import { estimateInfrastructure, formatInfraEstimation } from './estimate-infrastructure.js';
import { estimateProject, formatEstimation } from './estimate-project.js';
import { generateRoadmap, formatRoadmap } from './generate-roadmap.js';
import { generateBoilerplate, formatBoilerplate } from './generate-boilerplate.js';
import { designApi, formatApiDesign } from './design-api.js';
import { planTesting, formatTestingStrategy } from './plan-testing.js';
import { analyzeScalability, formatScalabilityPlan } from './analyze-scalability.js';
import { assessTeam, formatTeamAssessment } from './assess-team.js';
import { planDevOps, formatDevOpsStrategy } from './plan-devops.js';
import { mapIntegrations, formatIntegrationMap } from './map-integrations.js';
import { generateUISpec, formatUISpec } from './generate-ui-spec.js';
import { createPerformanceBudget, formatPerformanceBudget } from './create-performance-budget.js';
import { planMonetization, formatMonetizationPlan } from './plan-monetization.js';
import { analyzeEnvironment } from '../knowledge/scoring.js';

export function runFullAnalysis(
  name: string,
  description: string,
  projectType: ProjectType,
  scale: ProjectScale,
  budget?: BudgetRange,
  teamSize: number = 3,
  env?: EnvironmentContext,
  features: string[] = []
): { projectName: string; report: string; verdict: any } {

  // Auto-detect features from description
  const detectedFeatures = extractKeywords(description);
  const effectiveFeatures = [...new Set([...features, ...detectedFeatures])];

  const sections: string[] = [];
  sections.push(`# 📋 BÁO CÁO PHÂN TÍCH TOÀN DIỆN: ${name.toUpperCase()}\n`);
  sections.push(`> Generated: ${new Date().toISOString().slice(0, 10)}`);
  sections.push(`> Type: ${projectType} | Scale: ${scale} | Budget: ${budget || 'auto'} | Team: ${teamSize}\n`);

  if (effectiveFeatures.length > 0) {
    sections.push(`> 🔑 Features detected: ${effectiveFeatures.join(', ')}\n`);
  }

  // ═══════════════════════════════════════════
  // PHASE 1: UNDERSTANDING
  // ═══════════════════════════════════════════
  sections.push('---\n# 🔍 PHASE 1: UNDERSTANDING (Hiểu bài toán)\n');

  // ─── STEP 1: Project Analysis ───
  sections.push('## 1️⃣ Phân tích dự án\n');
  const analysis = analyzeProject({ name, description, projectType, scale, budget, teamSize });
  sections.push(`**Summary**: ${analysis.summary}`);
  sections.push(`**MVP scope**: ~${analysis.mvpScope.estimatedWeeks} weeks`);
  sections.push(`**Core features**: ${analysis.mvpScope.coreFeatures.length} | **Deferred**: ${analysis.mvpScope.deferredFeatures.length}`);
  sections.push(`\n**Technical requirements**:`);
  analysis.technicalRequirements.filter(r => r.priority === 'must_have').slice(0, 4).forEach(r =>
    sections.push(`- [${r.priority}] ${r.category}: ${r.requirement}`)
  );
  sections.push(`\n**Risks**:`);
  analysis.risks.filter(r => r.severity === 'critical' || r.severity === 'high').slice(0, 3).forEach(r =>
    sections.push(`- [${r.severity.toUpperCase()}] ${r.description} → ${r.mitigation}`)
  );


  // ─── STEP 2: Features ───
  sections.push('\n---\n## 2️⃣ Tính năng đề xuất\n');
  const featureSuggestion = suggestFeatures(projectType);
  sections.push(`- **Must-have**: ${featureSuggestion.mustHave.length} features`);
  sections.push(`- **Should-have**: ${featureSuggestion.shouldHave.length} features`);
  sections.push(`- **Could-have**: ${featureSuggestion.couldHave.length} features`);
  sections.push(`- **Innovative**: ${featureSuggestion.innovative.length} features`);
  sections.push('\n**Core features (must-have)**:');
  featureSuggestion.mustHave.slice(0, 8).forEach(f =>
    sections.push(`- ${f.name} — ${f.description} (${f.complexity}, ~${f.estimatedDays}d)`)
  );

  // ═══════════════════════════════════════════
  // PHASE 2: TECHNOLOGY
  // ═══════════════════════════════════════════
  sections.push('\n---\n# ⚡ PHASE 2: TECHNOLOGY (Chọn công nghệ)\n');

  // ─── STEP 3: Tech Stack ───
  sections.push('## 3️⃣ Tech Stack đề xuất\n');
  const stack = recommendStack(projectType, scale, [], [], env, effectiveFeatures);
  const stackSummary: string[] = [];
  if (stack.frontend) stackSummary.push(`**Frontend**: ${stack.frontend.technology.name} (${stack.frontend.score.toFixed(1)})`);
  if (stack.backend) stackSummary.push(`**Backend**: ${stack.backend.technology.name} (${stack.backend.score.toFixed(1)})`);
  if (stack.database) stackSummary.push(`**Database**: ${stack.database.technology.name} (${stack.database.score.toFixed(1)})`);
  if (stack.cache) stackSummary.push(`**Cache**: ${stack.cache.technology.name}`);
  if (stack.auth) stackSummary.push(`**Auth**: ${stack.auth.technology.name}`);
  if (stack.cloud) stackSummary.push(`**Cloud**: ${stack.cloud.technology.name}`);
  if (stack.payment) stackSummary.push(`**Payment**: ${stack.payment.technology.name}`);
  if (stack.mobile) stackSummary.push(`**Mobile**: ${stack.mobile.technology.name}`);
  if (stack.realtime) stackSummary.push(`**Realtime**: ${stack.realtime.technology.name}`);
  if (stack.storage) stackSummary.push(`**Storage**: ${stack.storage.technology.name}`);
  stackSummary.forEach(s => sections.push(`- ${s}`));
  sections.push(`\n${stack.architectureNotes}`);

  // ═══════════════════════════════════════════
  // PHASE 3: DESIGN
  // ═══════════════════════════════════════════
  sections.push('\n---\n# 🎨 PHASE 3: DESIGN (Thiết kế)\n');

  // ─── STEP 4: Architecture ───
  sections.push('## 4️⃣ Kiến trúc hệ thống\n');
  const arch = designArchitecture(
    projectType, scale, stack, teamSize,
    !!stack.realtime, !!stack.mobile
  );
  sections.push(`**Pattern**: ${arch.pattern}`);
  sections.push(arch.reasoning);
  sections.push(`\n\`\`\`mermaid\n${arch.diagram}\n\`\`\`\n`);
  sections.push(`**Deployment**: ${arch.deploymentStrategy.type} — ${arch.deploymentStrategy.description}`);

  // ─── STEP 5: Database ───
  sections.push('\n---\n## 5️⃣ Database Schema\n');
  const db = designDatabase(projectType);
  sections.push(`**Tables**: ${db.tables.length} | **Type**: ${db.databaseType}\n`);
  db.tables.forEach(t => sections.push(`- **${t.name}**: ${t.description} (${t.columns.length} columns)`));
  sections.push('');
  db.recommendations.slice(0, 4).forEach(r => sections.push(r));

  // ─── STEP 6: API Design ───
  sections.push('\n---\n## 6️⃣ API Design\n');
  const api = designApi(projectType, effectiveFeatures);
  sections.push(`**Style**: ${api.style} | **Version**: ${api.version} | **Auth**: ${api.authScheme}`);
  sections.push(`**Endpoints**: ${api.endpoints.length} | **Rate limit**: ${api.rateLimiting.authenticated} req/min (auth)\n`);

  // Group endpoints
  const apiGroups = new Map<string, typeof api.endpoints>();
  for (const ep of api.endpoints) {
    const resource = ep.path.split('/')[1] || 'other';
    if (!apiGroups.has(resource)) apiGroups.set(resource, []);
    apiGroups.get(resource)!.push(ep);
  }
  for (const [resource, endpoints] of apiGroups) {
    sections.push(`**/${resource}**: ${endpoints.map(e => `\`${e.method} ${e.path}\``).join(', ')}`);
  }

  api.recommendations.slice(0, 3).forEach(r => sections.push(`- ${r}`));

  // ─── STEP 7: UI/UX Spec ───
  sections.push('\n---\n## 7️⃣ UI/UX Specification\n');
  const uiSpec = generateUISpec(projectType, scale, effectiveFeatures);
  sections.push(`**Design System**: ${uiSpec.designSystem.typography.font}`);
  sections.push(`**Component Library**: ${uiSpec.designSystem.componentLibrary.name}`);
  sections.push(`**Icons**: ${uiSpec.designSystem.iconLibrary}`);
  sections.push(`**Components**: ${uiSpec.components.length} | **Pages**: ${uiSpec.pages.length}\n`);
  sections.push(`**Colors**: Primary: ${uiSpec.designSystem.colors.primary.split('—')[1]?.trim() || uiSpec.designSystem.colors.primary}`);
  sections.push(`**Responsive**: ${uiSpec.responsive.approach}\n`);
  sections.push('**Pages**:');
  uiSpec.pages.forEach(p => sections.push(`- \`${p.route}\` ${p.name} (${p.components.length} components)`));

  // ═══════════════════════════════════════════
  // PHASE 4: QUALITY
  // ═══════════════════════════════════════════
  sections.push('\n---\n# ✅ PHASE 4: QUALITY (Chất lượng)\n');

  // ─── STEP 8: Security ───
  sections.push('## 8️⃣ Đánh giá bảo mật\n');
  const stackIds = [
    stack.frontend?.technology.id, stack.backend?.technology.id,
    stack.database?.technology.id, stack.auth?.technology.id,
    stack.cache?.technology.id,
  ].filter(Boolean) as string[];
  const hasPayment = !!stack.payment;
  const security = auditSecurity(stackIds, projectType, !!stack.auth, hasPayment);
  const gradeEmoji: Record<string, string> = { A: '🟢', B: '🔵', C: '🟡', D: '🟠', F: '🔴' };
  sections.push(`**Score**: ${gradeEmoji[security.grade]} ${security.overallScore}/100 (Grade ${security.grade})`);
  sections.push(`**Critical issues**: ${security.findings.filter(f => f.severity === 'critical').length} | **High**: ${security.findings.filter(f => f.severity === 'high').length}`);
  security.recommendations.slice(0, 3).forEach(r => sections.push(`- ${r}`));

  // ─── STEP 9: Testing ───
  sections.push('\n---\n## 9️⃣ Chiến lược Testing\n');
  const testing = planTesting(projectType, scale, stack, effectiveFeatures);
  sections.push(`**Approach**: ${testing.approach}`);
  sections.push(`**Coverage targets**: Unit ${testing.coverageTargets.unit}% | Integration ${testing.coverageTargets.integration}% | E2E ${testing.coverageTargets.e2e}%`);
  sections.push(`**Setup time**: ~${testing.estimatedSetupDays} days\n`);
  sections.push('**Tools**:');
  testing.tools.slice(0, 5).forEach(t => sections.push(`- **${t.name}** (${t.category}): ${t.purpose}`));

  // ─── STEP 10: Performance Budget ───
  sections.push('\n---\n## 🔟 Performance Budget\n');
  const perfBudget = createPerformanceBudget(projectType, scale, effectiveFeatures);
  sections.push('**Core Web Vitals targets**:');
  sections.push(`- LCP: ${perfBudget.coreWebVitals.lcp.target}`);
  sections.push(`- INP: ${perfBudget.coreWebVitals.inp.target}`);
  sections.push(`- CLS: ${perfBudget.coreWebVitals.cls.target}`);
  const lt = perfBudget.lighthouseTargets;
  sections.push(`\n**Lighthouse**: Performance ${lt.performance} | A11y ${lt.accessibility} | SEO ${lt.seo}`);
  sections.push(`**Bundle**: JS ${perfBudget.bundleBudget.totalJs} | CSS ${perfBudget.bundleBudget.totalCss}`);
  sections.push(`**Server p95**: ${perfBudget.serverBudget.responseTimeP95}`);

  // ═══════════════════════════════════════════
  // PHASE 5: PLANNING
  // ═══════════════════════════════════════════
  sections.push('\n---\n# 📊 PHASE 5: PLANNING (Lập kế hoạch)\n');

  // ─── STEP 11: Infrastructure Cost ───
  sections.push('## 1️⃣1️⃣ Chi phí hạ tầng\n');
  const stackNames = [
    stack.cloud?.technology.name,
    stack.database?.technology.name,
    stack.cache?.technology.name,
    stack.auth?.technology.name,
    stack.monitoring?.technology.name,
    stack.payment?.technology.name,
  ].filter(Boolean) as string[];
  const infraEst = estimateInfrastructure(
    stackNames, projectType, scale,
    env?.performance?.concurrentUsers || 100,
    env?.infrastructure?.maxMonthlyCostUsd
  );
  sections.push(`**Monthly**: $${infraEst.totalMonthly.toFixed(2)} | **Yearly**: $${infraEst.totalYearly.toFixed(2)}`);
  if (infraEst.freeTierSavings > 0) sections.push(`**Free tier savings**: ~$${infraEst.freeTierSavings}/mo`);
  sections.push('\n| Users | Est. Cost |');
  sections.push('|-------|-----------|');
  infraEst.scalingProjection.forEach(s => sections.push(`| ${s.users} | ${s.monthlyCost} |`));

  // ─── STEP 12: Scalability ───
  sections.push('\n---\n## 1️⃣2️⃣ Kế hoạch Scalability\n');
  const scalability = analyzeScalability(projectType, scale, stack, effectiveFeatures);
  sections.push(`**Current stage**: ${scalability.currentStage.name} (${scalability.currentStage.userRange})`);
  sections.push(`**RPS capacity**: ${scalability.currentStage.rps}\n`);
  sections.push('**Bottleneck predictions**:');
  scalability.bottleneckPredictions.slice(0, 4).forEach(b =>
    sections.push(`- [${b.priority.toUpperCase()}] **${b.component}** @ ${b.triggerPoint}: ${b.solution.slice(0, 80)}...`)
  );
  sections.push(`\n**DB scaling**: ${scalability.databaseScaling.phase1.slice(0, 60)}...`);

  // ─── STEP 13: Integration Map ───
  sections.push('\n---\n## 1️⃣3️⃣ Integration Map\n');
  const integrations = mapIntegrations(projectType, scale, effectiveFeatures, stack);
  sections.push(`**Services**: ${integrations.services.length} | **API Keys**: ${integrations.apiKeysNeeded}`);
  sections.push(`**Free tier cost**: ${integrations.totalMonthlyCost.free}`);
  sections.push(`**Paid cost**: ${integrations.totalMonthlyCost.paid}\n`);
  integrations.services.forEach(s =>
    sections.push(`- **${s.name}** (${s.category}): ${s.freeTier} | Lock-in: ${s.vendorLockIn}`)
  );

  // ─── STEP 14: Team ───
  sections.push('\n---\n## 1️⃣4️⃣ Team Assessment\n');
  const teamAssessment = assessTeam(projectType, scale, stack, effectiveFeatures, teamSize);
  sections.push(`**Team size**: min ${teamAssessment.teamSize.minimum} → recommended **${teamAssessment.teamSize.recommended}** → optimal ${teamAssessment.teamSize.optimal}`);
  sections.push(`**Organization**: ${teamAssessment.orgStructure.split('**')[1] || 'Flat'}\n`);
  sections.push('**Roles**:');
  teamAssessment.roles.filter(r => r.priority !== 'nice-to-have').forEach(r =>
    sections.push(`- **${r.title}** x${r.count} (${r.priority}): ${r.skills.slice(0, 3).join(', ')}`)
  );
  if (teamAssessment.skillGaps.length > 0) {
    sections.push('\n**Skill gaps**:');
    teamAssessment.skillGaps.slice(0, 3).forEach(g =>
      sections.push(`- [${g.importance}] **${g.skill}**: ${g.solution.slice(0, 70)}...`)
    );
  }

  // ─── STEP 15: Estimation ───
  sections.push('\n---\n## 1️⃣5️⃣ Ước lượng dự án\n');
  const estimation = estimateProject(featureSuggestion, scale, teamSize);
  sections.push(`**Total**: ~${estimation.totalWeeks} tuần (${estimation.totalDays} ngày)`);
  sections.push(`**Complexity**: ${estimation.complexityScore}/10 | **Risk factor**: x${estimation.riskFactor}`);
  sections.push(`**Development cost**: ${estimation.costEstimate.development}`);
  sections.push(`**Monthly running**: ${estimation.costEstimate.monthlyRunning}`);
  sections.push('\n**Phases**:');
  estimation.phases.forEach(p =>
    sections.push(`- ${p.name}: ${p.weeks} tuần — ${p.deliverables.join(', ')}`)
  );

  // ═══════════════════════════════════════════
  // PHASE 6: BUSINESS
  // ═══════════════════════════════════════════
  sections.push('\n---\n# 💰 PHASE 6: BUSINESS (Kinh doanh)\n');

  // ─── STEP 16: Monetization ───
  sections.push('## 1️⃣6️⃣ Monetization Strategy\n');
  const monetization = planMonetization(projectType, scale, effectiveFeatures, infraEst.totalMonthly);
  sections.push(`**Revenue model**: ${monetization.revenueModel.primary.model}`);
  sections.push(`**Benchmarks**: ${monetization.revenueModel.primary.examples.join(', ')}\n`);
  sections.push('**Pricing tiers**:');
  monetization.pricingStrategy.tiers.forEach(t =>
    sections.push(`- ${t.name}: ${t.price} → ${t.target} (conv: ${t.conversionRate})`)
  );
  sections.push(`\n**Break-even**: **${monetization.breakEven.breakEvenUsers} paying users** ($${monetization.breakEven.totalFixedMonthly}/mo fixed cost)`);
  sections.push(`**Time to break-even**: ${monetization.breakEven.timeToBreakEven}`);

  // ═══════════════════════════════════════════
  // PHASE 7: EXECUTION
  // ═══════════════════════════════════════════
  sections.push('\n---\n# 🚀 PHASE 7: EXECUTION (Triển khai)\n');

  // ─── STEP 17: Roadmap ───
  sections.push('## 1️⃣7️⃣ Roadmap\n');
  const roadmap = generateRoadmap(estimation, scale, name);
  sections.push(`**Duration**: ${roadmap.totalDuration}`);
  sections.push('\n**Milestones**:');
  roadmap.milestones.forEach(m =>
    sections.push(`- 🏁 ${m.name} — ${m.targetDate}: ${m.criteria.join(', ')}`)
  );
  sections.push(`\n**Critical path**: ${roadmap.criticalPath.join(' → ')}`);

  // ─── STEP 18: Boilerplate ───
  sections.push('\n---\n## 1️⃣8️⃣ Config Files\n');
  const boilerplate = generateBoilerplate(stack, name);
  sections.push(`Generated ${boilerplate.files.length} files: ${boilerplate.files.map(f => f.path).join(', ')}`);

  // ─── STEP 19: DevOps ───
  sections.push('\n---\n## 1️⃣9️⃣ DevOps Strategy\n');
  const devops = planDevOps(projectType, scale, stack, effectiveFeatures);
  sections.push(`**CI/CD**: ${devops.cicd.platform} | **Branch**: ${devops.cicd.branchStrategy.split('**')[1] || 'Trunk-based'}`);
  sections.push(`**Deploy**: ${devops.cicd.deploymentStrategy.split('**')[1] || 'Rolling'}`);
  sections.push(`**DR**: RTO ${devops.disasterRecovery.rto} | RPO ${devops.disasterRecovery.rpo}\n`);
  sections.push('**Monitoring**:');
  devops.monitoring.tools.forEach(t => sections.push(`- ${t.name}: ${t.purpose}`));
  sections.push('\n**Key alert rules**:');
  devops.alerting.rules.slice(0, 3).forEach(r =>
    sections.push(`- ${r.severity} ${r.condition} → ${r.action}`)
  );

  // ═══════════════════════════════════════════
  // VERDICT
  // ═══════════════════════════════════════════
  sections.push('\n---\n# ⚖️ VERDICT — ĐÁNH GIÁ TỔNG HỢP\n');

  // Calculate overall score
  const stackScore = (stack.frontend?.score || 0) + (stack.backend?.score || 0) + (stack.database?.score || 0);
  const avgStackScore = stackScore / 3;
  const securityWeight = security.overallScore / 100;
  const costFeasibility = infraEst.totalMonthly < 100 ? 1.0 : infraEst.totalMonthly < 500 ? 0.8 : 0.6;
  const teamFeasibility = teamSize >= teamAssessment.teamSize.minimum ? 1.0 : 0.6;
  const scalabilityScore = scalability.bottleneckPredictions.filter(b => b.priority === 'critical').length <= 2 ? 0.9 : 0.7;

  const overallScore = Math.min(100, Math.round(
    (avgStackScore / 10 * 25) +   // Tech fit: 25%
    (securityWeight * 20) +        // Security: 20%
    (costFeasibility * 20) +       // Cost: 20%
    (teamFeasibility * 15) +       // Team: 15%
    (scalabilityScore * 10) +      // Scalability: 10%
    (perfBudget.lighthouseTargets.performance >= 85 ? 10 : 5) // Performance: 10%
  ));

  const grade = overallScore >= 80 ? 'A' : overallScore >= 65 ? 'B' : overallScore >= 50 ? 'C' : overallScore >= 35 ? 'D' : 'F';
  const goNoGo = overallScore >= 70 ? 'GO' : overallScore >= 45 ? 'CONDITIONAL' : 'NO-GO';

  const goEmoji: Record<string, string> = { GO: '✅', CONDITIONAL: '🟡', 'NO-GO': '🔴' };
  sections.push(`## ${goEmoji[goNoGo]} Verdict: **${goNoGo}** (Score: ${overallScore}/100, Grade ${grade})\n`);

  // Scorecard
  sections.push('### 📊 Scorecard\n');
  sections.push('| Dimension | Score | Weight |');
  sections.push('|-----------|-------|--------|');
  sections.push(`| Tech Stack | ${avgStackScore.toFixed(1)}/10 | 25% |`);
  sections.push(`| Security | ${security.overallScore}/100 | 20% |`);
  sections.push(`| Cost Feasibility | ${(costFeasibility * 100).toFixed(0)}% | 20% |`);
  sections.push(`| Team Readiness | ${(teamFeasibility * 100).toFixed(0)}% | 15% |`);
  sections.push(`| Scalability | ${(scalabilityScore * 100).toFixed(0)}% | 10% |`);
  sections.push(`| Performance | ${perfBudget.lighthouseTargets.performance >= 85 ? '100' : '50'}% | 10% |`);

  // Key decisions
  const keyDecisions: string[] = [];
  keyDecisions.push(`**Stack**: ${stack.frontend?.technology.name || '?'} + ${stack.backend?.technology.name || '?'} + ${stack.database?.technology.name || '?'}`);
  keyDecisions.push(`**Architecture**: ${arch.pattern}`);
  keyDecisions.push(`**Timeline**: ~${estimation.totalWeeks} tuần | **Team**: ${teamSize} (cần ${teamAssessment.teamSize.recommended})`);
  keyDecisions.push(`**Monthly cost**: Infrastructure $${infraEst.totalMonthly.toFixed(0)} + Services $${integrations.totalMonthlyCost.paid.split('/')[0].replace('$', '') || '?'}`);
  keyDecisions.push(`**Break-even**: ${monetization.breakEven.breakEvenUsers} paying users (${monetization.breakEven.timeToBreakEven})`);
  keyDecisions.push(`**Security**: Grade ${security.grade} | **DB**: ${db.tables.length} tables | **API**: ${api.endpoints.length} endpoints`);

  sections.push('\n### 🎯 Key Decisions');
  keyDecisions.forEach(d => sections.push(`- ${d}`));

  // Top risks
  const topRisks = analysis.risks
    .filter(r => r.severity === 'critical' || r.severity === 'high')
    .slice(0, 5)
    .map(r => `[${r.severity.toUpperCase()}] ${r.description}`);

  if (topRisks.length > 0) {
    sections.push('\n### ⚠️ Top Risks');
    topRisks.forEach(r => sections.push(`- ${r}`));
  }

  // Next steps
  sections.push('\n### 📋 Next Steps');
  sections.push('1. Review và điều chỉnh tech stack nếu cần');
  sections.push('2. Setup project từ boilerplate configs');
  sections.push('3. Sign up cho tất cả third-party services (API keys)');
  sections.push('4. Bắt đầu Phase 1 roadmap: foundation + core features');
  sections.push(`5. Hiring nếu cần (hiện ${teamSize}, khuyến nghị ${teamAssessment.teamSize.recommended})`);

  // Summary
  const summary = goNoGo === 'GO'
    ? `Dự án **${name}** khả thi cao. Stack ${stack.frontend?.technology.name}/${stack.backend?.technology.name}/${stack.database?.technology.name} phù hợp cho ${projectType} ở quy mô ${scale}. Timeline ~${estimation.totalWeeks} tuần, cần ${teamAssessment.teamSize.recommended} developers, chi phí ~$${infraEst.totalMonthly.toFixed(0)}/tháng. Break-even tại ${monetization.breakEven.breakEvenUsers} users.`
    : goNoGo === 'CONDITIONAL'
    ? `Dự án **${name}** khả thi CÓ ĐIỀU KIỆN. Cần giải quyết: ${topRisks.slice(0, 2).join('; ')}. Xem xét team size (hiện ${teamSize}, cần ${teamAssessment.teamSize.recommended}) và budget.`
    : `Dự án **${name}** KHÔNG khuyến khích ở thời điểm hiện tại. Cần tái đánh giá scope, budget, hoặc team.`;

  sections.push(`\n### 📝 Summary\n${summary}`);

  return {
    projectName: name,
    report: sections.join('\n'),
    verdict: { score: overallScore, grade, goNoGo, summary, keyDecisions, topRisks },
  };
}

// Extract keywords from project description for category detection
function extractKeywords(description: string): string[] {
  const keywords: string[] = [];
  const text = description.toLowerCase();
  const detectors: Record<string, string[]> = {
    'chat': ['chat', 'tin nhắn', 'messaging', 'nhắn tin', 'trò chuyện'],
    'realtime': ['real-time', 'realtime', 'live', 'trực tiếp', 'đồng bộ'],
    'AI': ['ai', 'trí tuệ nhân tạo', 'machine learning', 'chatbot', 'gpt', 'llm', 'học máy'],
    'mobile': ['mobile', 'ứng dụng di động', 'app', 'ios', 'android', 'điện thoại'],
    'video': ['video', 'gọi video', 'video call', 'meeting', 'họp trực tuyến', 'livestream'],
    'notification': ['notification', 'thông báo', 'nhắc nhở', 'push', 'cảnh báo'],
    'file': ['file', 'upload', 'tải lên', 'đính kèm', 'attachment', 'lưu trữ file'],
    'search': ['search', 'tìm kiếm', 'lọc', 'filter', 'elasticsearch'],
    'payment': ['payment', 'thanh toán', 'billing', 'subscription', 'trả phí', 'giao dịch'],
    'auth': ['auth', 'đăng nhập', 'login', 'sso', 'xác thực', 'phân quyền'],
    'analytics': ['analytics', 'thống kê', 'báo cáo', 'dashboard', 'biểu đồ', 'report'],
    'monitoring': ['monitoring', 'giám sát', 'logging', 'log'],
    'task': ['task', 'công việc', 'kanban', 'quản lý dự án', 'project management'],
    'learning': ['learning', 'khóa học', 'course', 'quiz', 'bài học', 'giáo dục', 'e-learning', 'học tập'],
    'storage': ['storage', 'lưu trữ', 's3', 'bucket', 'hình ảnh', 'media'],
  };

  for (const [keyword, patterns] of Object.entries(detectors)) {
    if (patterns.some(p => text.includes(p))) {
      keywords.push(keyword);
    }
  }

  return keywords;
}
