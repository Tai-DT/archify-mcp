/**
 * Tool 19: DevOps Strategy
 * CI/CD, monitoring, alerting, disaster recovery, backup
 */

import type { ProjectType, ProjectScale, StackRecommendation } from '../types/index.js';

export interface DevOpsStrategy {
  cicd: CICDPlan;
  monitoring: MonitoringPlan;
  alerting: AlertingPlan;
  disasterRecovery: DRPlan;
  environments: EnvironmentSetup[];
  secretManagement: string;
  recommendations: string[];
}

interface CICDPlan {
  platform: string;
  stages: { name: string; actions: string[]; trigger: string; duration: string }[];
  branchStrategy: string;
  deploymentStrategy: string;
}

interface MonitoringPlan {
  tools: { name: string; purpose: string; free: boolean }[];
  metrics: { name: string; threshold: string; category: string }[];
  dashboards: string[];
}

interface AlertingPlan {
  channels: string[];
  rules: { condition: string; severity: string; action: string }[];
  escalationPolicy: string;
}

interface DRPlan {
  rto: string; // Recovery Time Objective
  rpo: string; // Recovery Point Objective
  backupStrategy: BackupStrategy;
  failoverType: string;
  runbook: string[];
}

interface BackupStrategy {
  database: string;
  files: string;
  config: string;
  frequency: string;
  retention: string;
  testSchedule: string;
}

interface EnvironmentSetup {
  name: string;
  purpose: string;
  infrastructure: string;
  url: string;
}

export function planDevOps(
  projectType: ProjectType,
  scale: ProjectScale,
  stack?: StackRecommendation,
  features: string[] = []
): DevOpsStrategy {
  const featureText = features.join(' ').toLowerCase();
  const isCloud = stack?.cloud?.technology.name || 'Cloudflare';

  // CI/CD
  const cicd: CICDPlan = {
    platform: 'GitHub Actions',
    stages: [
      {
        name: '🔍 Lint & Type Check',
        actions: ['ESLint', 'TypeScript compiler', 'Prettier check'],
        trigger: 'On every push & PR',
        duration: '< 1 min',
      },
      {
        name: '🧪 Test',
        actions: ['Unit tests (Vitest)', 'Integration tests', 'Coverage report'],
        trigger: 'On every push & PR',
        duration: '< 3 min',
      },
      {
        name: '🏗️ Build',
        actions: ['Build app', 'Build Docker image', 'Security scan (Trivy)'],
        trigger: 'On push to main/release',
        duration: '< 5 min',
      },
      {
        name: '🚀 Deploy Staging',
        actions: ['Deploy to staging', 'Run E2E smoke tests', 'Notify Slack'],
        trigger: 'On push to main',
        duration: '< 3 min',
      },
      {
        name: '🎯 Deploy Production',
        actions: ['Blue-green deploy', 'Health check', 'Rollback if failed'],
        trigger: 'Manual approval / tag release',
        duration: '< 5 min',
      },
    ],
    branchStrategy: scale === 'mvp'
      ? '**Trunk-based**: Push trực tiếp lên main, feature flags cho features mới'
      : '**GitHub Flow**: Feature branch → PR → Review → Merge to main → Auto deploy staging',
    deploymentStrategy: scale === 'mvp'
      ? '**Rolling deploy**: Deploy trực tiếp, rollback nếu lỗi'
      : scale === 'startup'
      ? '**Blue-Green**: 2 environments, switch traffic sau khi verify'
      : '**Canary**: Deploy 5% traffic trước, monitor 15 phút, rồi 100%',
  };

  // Monitoring
  const monitoring: MonitoringPlan = {
    tools: [
      { name: 'Sentry', purpose: 'Error tracking + performance monitoring', free: true },
      { name: 'Uptime Robot / BetterStack', purpose: 'Uptime monitoring + status page', free: true },
      { name: 'Grafana Cloud', purpose: 'Metrics dashboards + visualization', free: true },
    ],
    metrics: [
      { name: 'Response Time (p95)', threshold: '< 500ms', category: 'Performance' },
      { name: 'Error Rate', threshold: '< 1%', category: 'Reliability' },
      { name: 'Uptime', threshold: '> 99.9%', category: 'Availability' },
      { name: 'CPU Usage', threshold: '< 80%', category: 'Infrastructure' },
      { name: 'Memory Usage', threshold: '< 85%', category: 'Infrastructure' },
      { name: 'DB Connection Pool', threshold: '< 90% utilized', category: 'Database' },
      { name: 'Disk Usage', threshold: '< 80%', category: 'Infrastructure' },
      { name: 'Request/sec', threshold: 'Baseline ±30%', category: 'Traffic' },
    ],
    dashboards: [
      '📊 Overview: uptime, error rate, response time, active users',
      '🔧 Infrastructure: CPU, memory, disk, network',
      '🗄️ Database: query time, connections, slow queries',
      '💰 Business: signups, revenue, churn (if SaaS)',
    ],
  };

  if (featureText.includes('chat') || featureText.includes('realtime')) {
    monitoring.metrics.push({ name: 'WebSocket Connections', threshold: '< 80% capacity', category: 'Realtime' });
    monitoring.metrics.push({ name: 'Message Delivery Time', threshold: '< 200ms', category: 'Realtime' });
  }

  if (featureText.includes('ai')) {
    monitoring.metrics.push({ name: 'AI Response Time', threshold: '< 5s (first token)', category: 'AI' });
    monitoring.metrics.push({ name: 'AI Cost/Request', threshold: '< $0.05', category: 'AI' });
  }

  if (scale !== 'mvp') {
    monitoring.tools.push({ name: 'Prometheus', purpose: 'Metrics collection + alerting', free: true });
  }

  // Alerting
  const alerting: AlertingPlan = {
    channels: ['Slack #alerts', 'Email (on-call)', ...(scale !== 'mvp' ? ['PagerDuty / OpsGenie'] : [])],
    rules: [
      { condition: 'Service down > 1 min', severity: '🔴 Critical', action: 'Page on-call + auto restart attempt' },
      { condition: 'Error rate > 5% for 5 min', severity: '🔴 Critical', action: 'Page on-call + pause deploys' },
      { condition: 'Response time p95 > 2s for 10 min', severity: '🟠 Warning', action: 'Slack alert + investigate' },
      { condition: 'CPU > 90% for 15 min', severity: '🟠 Warning', action: 'Slack alert + auto-scale if enabled' },
      { condition: 'Disk > 85%', severity: '🟡 Info', action: 'Slack alert + plan cleanup' },
      { condition: 'SSL cert expiring < 7 days', severity: '🟠 Warning', action: 'Auto-renew or notify' },
      { condition: 'Daily backup failed', severity: '🔴 Critical', action: 'Page on-call immediately' },
    ],
    escalationPolicy: scale === 'mvp'
      ? 'Founder receives all alerts via Slack + email'
      : 'L1: Slack bot → L2: On-call dev (15 min) → L3: Tech Lead (30 min) → L4: CTO (1 hour)',
  };

  // Disaster Recovery
  const disasterRecovery: DRPlan = {
    rto: scale === 'mvp' ? '4 hours' : scale === 'startup' ? '1 hour' : '15 minutes',
    rpo: scale === 'mvp' ? '24 hours' : scale === 'startup' ? '1 hour' : '5 minutes',
    backupStrategy: {
      database: 'Automated daily snapshots + WAL archiving for point-in-time recovery',
      files: 'S3 cross-region replication (nếu critical) hoặc daily sync',
      config: 'Git-tracked (Infrastructure as Code) — Terraform/Pulumi',
      frequency: scale === 'mvp' ? 'Daily' : 'Every 6 hours (DB), Daily (files)',
      retention: '30 days (daily) + 12 months (monthly)',
      testSchedule: scale === 'mvp' ? 'Quarterly' : 'Monthly restore test',
    },
    failoverType: scale === 'mvp'
      ? 'Manual failover — redeploy from latest backup'
      : scale === 'startup'
      ? 'Semi-automatic — health check triggers standby activation'
      : 'Automatic failover — multi-AZ with auto-healing',
    runbook: [
      '1. Detect: Monitoring alert triggers',
      '2. Assess: Determine scope (partial vs full outage)',
      '3. Communicate: Update status page, notify team',
      '4. Mitigate: Rollback last deploy OR switch to backup',
      '5. Restore: Apply latest backup if data loss',
      '6. Verify: Run smoke tests on restored system',
      '7. Post-mortem: Write incident report within 24h',
    ],
  };

  // Environments
  const environments: EnvironmentSetup[] = [
    {
      name: 'Local Development',
      purpose: 'Developer machines — Docker Compose for all services',
      infrastructure: 'Docker Compose: app + DB + Redis + MinIO',
      url: 'http://localhost:3000',
    },
    {
      name: 'Staging',
      purpose: 'Pre-production testing — mirrors production',
      infrastructure: 'Same as production, smaller scale',
      url: 'https://staging.myapp.com',
    },
    {
      name: 'Production',
      purpose: 'Live environment — user-facing',
      infrastructure: `${isCloud} with auto-scaling`,
      url: 'https://myapp.com',
    },
  ];

  if (scale === 'growth' || scale === 'enterprise') {
    environments.splice(1, 0, {
      name: 'Preview',
      purpose: 'Per-PR preview deployments for review',
      infrastructure: 'Auto-created per PR (Vercel/Cloudflare previews)',
      url: 'https://pr-123.preview.myapp.com',
    });
  }

  const recommendations = [
    '🔐 **Secrets**: dùng environment variables, KHÔNG commit vào git. Dùng Doppler/Infisical/AWS Secrets Manager',
    '📦 **Docker**: containerize mọi thứ — consistent across all environments',
    '🔄 **Rollback < 5 phút**: luôn giữ previous version sẵn sàng deploy',
    '📋 **Infrastructure as Code**: Terraform/Pulumi cho reproducible infrastructure',
    '🧪 **Test in staging trước production**: không bao giờ deploy untested code',
    '📝 **Runbook cho mỗi service**: step-by-step xử lý sự cố',
    '🔍 **Structured logging**: JSON logs + request ID cho tracing',
    '🏷️ **Semantic versioning**: v1.2.3 cho releases, auto-changelog',
  ];

  return {
    cicd,
    monitoring,
    alerting,
    disasterRecovery,
    environments,
    secretManagement: 'Environment variables + Doppler/Infisical for secrets management. Never commit .env to git.',
    recommendations,
  };
}

export function formatDevOpsStrategy(strategy: DevOpsStrategy): string {
  const lines = ['# 🚀 DevOps Strategy\n'];

  // CI/CD
  lines.push('## 🔄 CI/CD Pipeline\n');
  lines.push(`**Platform**: ${strategy.cicd.platform}`);
  lines.push(`**Branch Strategy**: ${strategy.cicd.branchStrategy}`);
  lines.push(`**Deployment**: ${strategy.cicd.deploymentStrategy}\n`);

  lines.push('### Pipeline Stages\n');
  for (const stage of strategy.cicd.stages) {
    lines.push(`#### ${stage.name}`);
    lines.push(`Trigger: ${stage.trigger} | Duration: ${stage.duration}`);
    stage.actions.forEach(a => lines.push(`- ${a}`));
    lines.push('');
  }

  // Environments
  lines.push('## 🌍 Environments\n');
  lines.push('| Environment | Purpose | URL |');
  lines.push('|-------------|---------|-----|');
  strategy.environments.forEach(e =>
    lines.push(`| **${e.name}** | ${e.purpose} | \`${e.url}\` |`)
  );

  // Monitoring
  lines.push('\n## 📊 Monitoring\n');
  lines.push('### Tools\n');
  strategy.monitoring.tools.forEach(t =>
    lines.push(`- **${t.name}**: ${t.purpose} ${t.free ? '(free tier)' : '(paid)'}`)
  );

  lines.push('\n### Key Metrics\n');
  lines.push('| Metric | Threshold | Category |');
  lines.push('|--------|-----------|----------|');
  strategy.monitoring.metrics.forEach(m =>
    lines.push(`| ${m.name} | ${m.threshold} | ${m.category} |`)
  );

  lines.push('\n### Dashboards\n');
  strategy.monitoring.dashboards.forEach(d => lines.push(`- ${d}`));

  // Alerting
  lines.push('\n## 🚨 Alerting\n');
  lines.push(`**Channels**: ${strategy.alerting.channels.join(', ')}`);
  lines.push(`**Escalation**: ${strategy.alerting.escalationPolicy}\n`);
  lines.push('| Condition | Severity | Action |');
  lines.push('|-----------|----------|--------|');
  strategy.alerting.rules.forEach(r =>
    lines.push(`| ${r.condition} | ${r.severity} | ${r.action} |`)
  );

  // Disaster Recovery
  lines.push('\n## 🛡️ Disaster Recovery\n');
  lines.push(`- **RTO** (Recovery Time): ${strategy.disasterRecovery.rto}`);
  lines.push(`- **RPO** (Recovery Point): ${strategy.disasterRecovery.rpo}`);
  lines.push(`- **Failover**: ${strategy.disasterRecovery.failoverType}\n`);

  lines.push('### Backup Strategy\n');
  const bs = strategy.disasterRecovery.backupStrategy;
  lines.push(`- **Database**: ${bs.database}`);
  lines.push(`- **Files**: ${bs.files}`);
  lines.push(`- **Config**: ${bs.config}`);
  lines.push(`- **Frequency**: ${bs.frequency}`);
  lines.push(`- **Retention**: ${bs.retention}`);
  lines.push(`- **Test**: ${bs.testSchedule}`);

  lines.push('\n### Incident Runbook\n');
  strategy.disasterRecovery.runbook.forEach(r => lines.push(r));

  // Secrets
  lines.push(`\n## 🔐 Secret Management\n\n${strategy.secretManagement}`);

  // Recommendations
  lines.push('\n## 💡 Recommendations\n');
  strategy.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
