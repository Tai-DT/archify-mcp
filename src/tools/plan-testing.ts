/**
 * Tool 16: Testing Strategy
 * Chiến lược test dựa trên project type, scale, và stack
 */

import type { ProjectType, ProjectScale, StackRecommendation } from '../types/index.js';

export interface TestingStrategy {
  approach: string;
  coverageTargets: { unit: number; integration: number; e2e: number };
  tools: TestToolRec[];
  testPyramid: { unit: number; integration: number; e2e: number; manual: number };
  ciIntegration: string[];
  performanceTesting: PerformanceTestPlan;
  checklist: string[];
  estimatedSetupDays: number;
}

interface TestToolRec {
  name: string;
  purpose: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
  free: boolean;
}

interface PerformanceTestPlan {
  tool: string;
  scenarios: { name: string; target: string }[];
  frequency: string;
}

export function planTesting(
  projectType: ProjectType,
  scale: ProjectScale,
  stack?: StackRecommendation,
  features: string[] = []
): TestingStrategy {
  const isNode = !stack?.backend || ['Prisma', 'Express', 'NestJS', 'Hono'].some(n =>
    stack.backend?.technology.name.includes(n)
  );
  const hasReact = stack?.frontend?.technology.name.includes('React');
  const hasMobile = !!stack?.mobile;
  const featureText = features.join(' ').toLowerCase();

  // Tools
  const tools: TestToolRec[] = [];

  // Unit testing
  if (isNode) {
    tools.push({ name: 'Vitest', purpose: 'Unit + integration tests — nhanh, ESM native, tương thích Jest', category: 'unit', free: true });
  } else {
    tools.push({ name: 'Jest', purpose: 'Unit testing cho JavaScript/TypeScript', category: 'unit', free: true });
  }

  // Component testing
  if (hasReact) {
    tools.push({ name: 'React Testing Library', purpose: 'Component testing — test behavior, không implementation', category: 'integration', free: true });
  }

  // E2E
  tools.push({ name: 'Playwright', purpose: 'E2E testing — cross-browser, fast, auto-wait, codegen', category: 'e2e', free: true });
  if (hasMobile) {
    tools.push({ name: 'Detox', purpose: 'E2E testing cho React Native', category: 'e2e', free: true });
  }

  // API testing
  tools.push({ name: 'Supertest', purpose: 'HTTP API integration testing', category: 'integration', free: true });

  // Performance
  tools.push({ name: 'k6', purpose: 'Load testing — scriptable, CI-friendly', category: 'performance', free: true });

  // Security
  tools.push({ name: 'OWASP ZAP', purpose: 'Automated security scanning (DAST)', category: 'security', free: true });

  // Accessibility
  tools.push({ name: 'axe-core', purpose: 'Accessibility testing (WCAG compliance)', category: 'accessibility', free: true });

  // Coverage targets
  const coverageTargets = {
    unit: scale === 'enterprise' ? 80 : scale === 'growth' ? 70 : 60,
    integration: scale === 'enterprise' ? 60 : 40,
    e2e: scale === 'enterprise' ? 30 : 20,
  };

  // Test pyramid ratio
  const testPyramid = {
    unit: 70,
    integration: 20,
    e2e: 8,
    manual: 2,
  };

  // CI integration
  const ciIntegration = [
    '✅ Run unit tests on every PR (< 2 min)',
    '✅ Run integration tests on PR merge to main (< 5 min)',
    '✅ Run E2E tests nightly or before release',
    '✅ Block merge if coverage drops below target',
    '✅ Auto-generate test reports with coverage badge',
  ];

  // Performance testing
  const perfScenarios = [
    { name: 'Smoke test', target: '1 user, verify all endpoints respond < 500ms' },
    { name: 'Load test', target: `${scale === 'startup' ? 100 : 1000} concurrent users, p95 < 1s` },
    { name: 'Stress test', target: 'Ramp to 2x expected load, find breaking point' },
    { name: 'Spike test', target: 'Sudden 10x traffic burst, verify recovery < 30s' },
  ];

  if (featureText.includes('chat') || featureText.includes('realtime')) {
    perfScenarios.push({ name: 'WebSocket load', target: '1000 concurrent WS connections, message delivery < 100ms' });
  }
  if (featureText.includes('ai')) {
    perfScenarios.push({ name: 'AI response time', target: 'AI chat response streaming starts < 2s' });
  }

  const performanceTesting: PerformanceTestPlan = {
    tool: 'k6 (Grafana)',
    scenarios: perfScenarios,
    frequency: scale === 'enterprise' ? 'Weekly' : 'Before each release',
  };

  // Checklist
  const checklist = [
    '☐ Setup test framework (Vitest/Jest) + config',
    '☐ Configure coverage thresholds in CI',
    '☐ Write tests for authentication flow',
    '☐ Write tests for core business logic',
    '☐ Setup E2E tests for critical user flows',
    '☐ Add API integration tests with Supertest',
    '☐ Setup performance baseline with k6',
    '☐ Run security scan with OWASP ZAP',
    '☐ Add pre-commit hooks: lint + type-check + unit tests',
    '☐ Add test report to PR comments (coverage diff)',
  ];

  if (featureText.includes('payment')) {
    checklist.push('☐ Test payment flows with Stripe test mode');
  }
  if (featureText.includes('chat')) {
    checklist.push('☐ Test WebSocket connection handling + reconnection');
  }

  return {
    approach: scale === 'mvp' ? 'Pragmatic testing — focus on critical paths' :
              scale === 'startup' ? 'Balanced testing — unit + integration + E2E for core flows' :
              'Comprehensive testing — high coverage, automated, continuous',
    coverageTargets,
    tools,
    testPyramid,
    ciIntegration,
    performanceTesting,
    checklist,
    estimatedSetupDays: scale === 'mvp' ? 2 : scale === 'startup' ? 4 : 7,
  };
}

export function formatTestingStrategy(strategy: TestingStrategy): string {
  const lines = ['# 🧪 Testing Strategy\n'];
  lines.push(`**Approach**: ${strategy.approach}`);
  lines.push(`**Setup time**: ~${strategy.estimatedSetupDays} days\n`);

  lines.push('## 📊 Coverage Targets\n');
  lines.push(`- Unit: **${strategy.coverageTargets.unit}%**`);
  lines.push(`- Integration: **${strategy.coverageTargets.integration}%**`);
  lines.push(`- E2E: **${strategy.coverageTargets.e2e}%**\n`);

  lines.push('## 🔺 Test Pyramid\n');
  lines.push('```');
  lines.push(`    ╱  E2E ${strategy.testPyramid.e2e}%  ╲`);
  lines.push(`   ╱ Integration ${strategy.testPyramid.integration}% ╲`);
  lines.push(`  ╱   Unit Tests ${strategy.testPyramid.unit}%    ╲`);
  lines.push('```\n');

  lines.push('## 🛠️ Recommended Tools\n');
  lines.push('| Tool | Purpose | Category | Free |');
  lines.push('|------|---------|----------|------|');
  strategy.tools.forEach(t =>
    lines.push(`| **${t.name}** | ${t.purpose} | ${t.category} | ${t.free ? '✅' : '💰'} |`)
  );

  lines.push('\n## ⚡ Performance Testing\n');
  lines.push(`**Tool**: ${strategy.performanceTesting.tool} | **Frequency**: ${strategy.performanceTesting.frequency}\n`);
  strategy.performanceTesting.scenarios.forEach(s =>
    lines.push(`- **${s.name}**: ${s.target}`)
  );

  lines.push('\n## 🔄 CI Integration\n');
  strategy.ciIntegration.forEach(c => lines.push(c));

  lines.push('\n## ✅ Setup Checklist\n');
  strategy.checklist.forEach(c => lines.push(c));

  return lines.join('\n');
}
