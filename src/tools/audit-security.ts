import type { ProjectType } from '../types/index.js';
import { technologies, getTechById } from '../knowledge/technologies.js';
import { getApplicableRules, getApplicableCompliance } from '../knowledge/security-rules.js';

export interface SecurityAudit {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  findings: SecurityFinding[];
  complianceStatus: ComplianceStatus[];
  checklist: ChecklistItem[];
  recommendations: string[];
}

export interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedTech: string;
  mitigation: string;
  tools: string[];
  owaspRef?: string;
}

export interface ComplianceStatus {
  framework: string;
  applicable: boolean;
  requirements: { requirement: string; status: 'met' | 'partial' | 'not_met' | 'unknown' }[];
}

export interface ChecklistItem {
  category: string;
  item: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  implemented: 'yes' | 'no' | 'unknown';
}

export function auditSecurity(
  stackTechIds: string[],
  projectType: ProjectType,
  hasAuth: boolean = true,
  hasPayment: boolean = false
): SecurityAudit {
  const rules = getApplicableRules(stackTechIds);
  const compliance = getApplicableCompliance(projectType);

  // Generate findings from applicable rules
  const findings: SecurityFinding[] = rules.map(rule => ({
    severity: rule.severity,
    title: rule.title,
    description: rule.description,
    affectedTech: rule.checkFor.filter(t => stackTechIds.includes(t)).map(t => {
      const tech = getTechById(t);
      return tech?.name || t;
    }).join(', '),
    mitigation: rule.mitigation,
    tools: rule.tools,
    owaspRef: rule.owaspRef,
  }));

  // Compliance status
  const complianceStatus: ComplianceStatus[] = compliance.map(framework => ({
    framework: framework.name,
    applicable: true,
    requirements: framework.requirements.map(req => ({
      requirement: req,
      status: 'unknown' as const,
    })),
  }));

  // Security checklist
  const checklist: ChecklistItem[] = [
    { category: 'Authentication', item: 'Authentication mechanism implemented', priority: 'critical', implemented: hasAuth ? 'yes' : 'no' },
    { category: 'Authentication', item: 'Password hashing (bcrypt/argon2)', priority: 'critical', implemented: 'unknown' },
    { category: 'Authentication', item: 'Multi-factor authentication (MFA)', priority: 'high', implemented: 'unknown' },
    { category: 'Authentication', item: 'Session management (HttpOnly cookies)', priority: 'high', implemented: 'unknown' },
    { category: 'Authorization', item: 'Role-based access control (RBAC)', priority: 'high', implemented: 'unknown' },
    { category: 'Authorization', item: 'API endpoint authorization', priority: 'critical', implemented: 'unknown' },
    { category: 'Data', item: 'HTTPS enforcement', priority: 'critical', implemented: 'unknown' },
    { category: 'Data', item: 'Data encryption at rest', priority: 'high', implemented: 'unknown' },
    { category: 'Data', item: 'Input validation (Zod/Joi)', priority: 'high', implemented: 'unknown' },
    { category: 'Data', item: 'SQL injection prevention (ORM/parameterized)', priority: 'critical', implemented: 'unknown' },
    { category: 'Data', item: 'XSS prevention', priority: 'high', implemented: 'unknown' },
    { category: 'Infrastructure', item: 'Security headers (Helmet/CSP)', priority: 'medium', implemented: 'unknown' },
    { category: 'Infrastructure', item: 'Rate limiting', priority: 'high', implemented: 'unknown' },
    { category: 'Infrastructure', item: 'CORS configuration', priority: 'high', implemented: 'unknown' },
    { category: 'Infrastructure', item: 'Environment variables secured', priority: 'critical', implemented: 'unknown' },
    { category: 'Infrastructure', item: 'Dependency vulnerability scanning', priority: 'medium', implemented: 'unknown' },
    { category: 'Monitoring', item: 'Security event logging', priority: 'medium', implemented: 'unknown' },
    { category: 'Monitoring', item: 'Error tracking (no sensitive data leaked)', priority: 'high', implemented: 'unknown' },
    { category: 'Backup', item: 'Automated database backups', priority: 'high', implemented: 'unknown' },
    { category: 'Backup', item: 'Disaster recovery plan', priority: 'medium', implemented: 'unknown' },
  ];

  if (hasPayment) {
    checklist.push(
      { category: 'Payment', item: 'PCI-DSS compliant payment provider', priority: 'critical', implemented: 'unknown' },
      { category: 'Payment', item: 'Tokenization (never store card data)', priority: 'critical', implemented: 'unknown' },
      { category: 'Payment', item: 'Webhook signature verification', priority: 'high', implemented: 'unknown' },
    );
  }

  // Calculate overall score
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const medCount = findings.filter(f => f.severity === 'medium').length;

  // Higher score = more potential issues found (lower is better for the user, but we invert)
  const rawPenalty = criticalCount * 15 + highCount * 8 + medCount * 3;
  const overallScore = Math.max(0, Math.min(100, 100 - rawPenalty));

  const grade = overallScore >= 90 ? 'A' : overallScore >= 75 ? 'B' : overallScore >= 60 ? 'C' : overallScore >= 40 ? 'D' : 'F';

  // Recommendations
  const recommendations: string[] = [];
  if (criticalCount > 0) {
    recommendations.push(`🚨 ${criticalCount} critical issues found — address these BEFORE launch`);
  }
  if (!hasAuth) {
    recommendations.push('🔐 Implement authentication immediately — use Clerk or Auth0 for fastest setup');
  }
  if (stackTechIds.includes('express') && !stackTechIds.some(t => ['nestjs'].includes(t))) {
    recommendations.push('🛡️ Express has no built-in security — add Helmet.js, express-rate-limit, cors');
  }
  if (projectType === 'fintech' || projectType === 'healthtech') {
    recommendations.push('📋 Strongly consider SOC 2 certification — required by most enterprise clients');
  }
  recommendations.push('🔄 Set up automated dependency scanning: `npm audit`, Snyk, or GitHub Dependabot');
  recommendations.push('🧪 Conduct penetration testing before production launch');

  return { overallScore, grade, findings, complianceStatus, checklist, recommendations };
}

export function formatSecurityAudit(audit: SecurityAudit): string {
  const lines = ['# 🛡️ Security Audit Report\n'];

  const gradeEmoji = { A: '🟢', B: '🔵', C: '🟡', D: '🟠', F: '🔴' };
  lines.push(`## Overall Score: ${gradeEmoji[audit.grade]} ${audit.overallScore}/100 (Grade ${audit.grade})\n`);

  // Findings by severity
  const bySeverity = ['critical', 'high', 'medium', 'low'] as const;
  for (const sev of bySeverity) {
    const items = audit.findings.filter(f => f.severity === sev);
    if (items.length === 0) continue;
    const emoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };
    lines.push(`## ${emoji[sev]} ${sev.toUpperCase()} (${items.length})\n`);
    for (const f of items) {
      lines.push(`### ${f.title}`);
      lines.push(`- **Affected**: ${f.affectedTech}`);
      lines.push(`- **Description**: ${f.description}`);
      if (f.owaspRef) lines.push(`- **OWASP**: ${f.owaspRef}`);
      lines.push(`- **Fix**: ${f.mitigation}`);
      lines.push(`- **Tools**: ${f.tools.join(', ')}\n`);
    }
  }

  // Compliance
  if (audit.complianceStatus.length > 0) {
    lines.push('## 📋 Compliance Requirements\n');
    for (const cs of audit.complianceStatus) {
      lines.push(`### ${cs.framework}\n`);
      for (const req of cs.requirements) {
        const icon = req.status === 'met' ? '✅' : req.status === 'partial' ? '🟡' : req.status === 'not_met' ? '❌' : '❓';
        lines.push(`${icon} ${req.requirement}`);
      }
      lines.push('');
    }
  }

  // Checklist
  lines.push('## ✅ Security Checklist\n');
  const categories = [...new Set(audit.checklist.map(c => c.category))];
  for (const cat of categories) {
    lines.push(`### ${cat}`);
    const items = audit.checklist.filter(c => c.category === cat);
    for (const item of items) {
      const icon = item.implemented === 'yes' ? '✅' : item.implemented === 'no' ? '❌' : '❓';
      lines.push(`${icon} [${item.priority.toUpperCase()}] ${item.item}`);
    }
    lines.push('');
  }

  // Recommendations
  if (audit.recommendations.length > 0) {
    lines.push('## 💡 Recommendations\n');
    audit.recommendations.forEach(r => lines.push(r));
  }

  return lines.join('\n');
}
