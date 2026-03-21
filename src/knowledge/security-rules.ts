/**
 * Security rules, checklists, and technology-specific security analysis.
 */

export interface SecurityRule {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  owaspRef?: string; // OWASP Top 10 reference
  checkFor: string[]; // tech IDs this applies to
  mitigation: string;
  tools: string[];
}

export interface ComplianceFramework {
  name: string;
  description: string;
  requirements: string[];
  applicableTo: string[]; // project types
}

// OWASP Top 10 (2021) mapped to tech-specific checks
export const securityRules: SecurityRule[] = [
  // A01: Broken Access Control
  {
    id: 'A01-1', category: 'Access Control', title: 'Missing authentication middleware',
    description: 'API endpoints accessible without authentication check',
    severity: 'critical', owaspRef: 'A01:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'hono', 'laravel'],
    mitigation: 'Implement authentication middleware on all protected routes. Use JWT or session-based auth.',
    tools: ['Passport.js', 'Clerk', 'Auth0', 'NextAuth'],
  },
  {
    id: 'A01-2', category: 'Access Control', title: 'Missing RBAC/authorization',
    description: 'No role-based access control for different user types',
    severity: 'high', owaspRef: 'A01:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'laravel'],
    mitigation: 'Implement RBAC with guards/decorators. Define roles and permissions matrix.',
    tools: ['CASL', 'NestJS Guards', 'Django Permissions', 'Casbin'],
  },
  {
    id: 'A01-3', category: 'Access Control', title: 'CORS misconfiguration',
    description: 'Overly permissive CORS allowing any origin',
    severity: 'high', owaspRef: 'A01:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'hono'],
    mitigation: 'Configure CORS to allow only trusted origins. Avoid wildcard (*) in production.',
    tools: ['cors middleware', 'Helmet.js'],
  },

  // A02: Cryptographic Failures
  {
    id: 'A02-1', category: 'Cryptography', title: 'Missing HTTPS enforcement',
    description: 'Application accessible over HTTP without redirect to HTTPS',
    severity: 'critical', owaspRef: 'A02:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'laravel', 'hono'],
    mitigation: 'Force HTTPS redirect. Use HSTS headers. Configure SSL certificate.',
    tools: ['Let\'s Encrypt', 'Cloudflare SSL', 'Helmet.js'],
  },
  {
    id: 'A02-2', category: 'Cryptography', title: 'Sensitive data in plain text',
    description: 'Passwords, tokens, or PII stored without encryption',
    severity: 'critical', owaspRef: 'A02:2021',
    checkFor: ['postgresql', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase'],
    mitigation: 'Hash passwords with bcrypt/argon2. Encrypt PII at rest. Use parameterized queries.',
    tools: ['bcrypt', 'argon2', 'node-forge', 'crypto module'],
  },

  // A03: Injection
  {
    id: 'A03-1', category: 'Injection', title: 'SQL Injection vulnerability',
    description: 'Raw SQL queries with user input concatenation',
    severity: 'critical', owaspRef: 'A03:2021',
    checkFor: ['postgresql', 'mysql', 'express', 'nestjs', 'fastapi', 'django', 'laravel'],
    mitigation: 'Use parameterized queries or ORM. Never concatenate user input into SQL.',
    tools: ['Prisma', 'Drizzle', 'TypeORM', 'SQLAlchemy', 'Eloquent'],
  },
  {
    id: 'A03-2', category: 'Injection', title: 'XSS vulnerability',
    description: 'User input rendered without sanitization in frontend',
    severity: 'high', owaspRef: 'A03:2021',
    checkFor: ['react', 'vue', 'angular', 'svelte', 'nextjs'],
    mitigation: 'Use framework\'s built-in XSS protection. Sanitize user HTML. Use CSP headers.',
    tools: ['DOMPurify', 'helmet-csp', 'sanitize-html'],
  },
  {
    id: 'A03-3', category: 'Injection', title: 'NoSQL Injection',
    description: 'Unvalidated input in MongoDB queries',
    severity: 'high', owaspRef: 'A03:2021',
    checkFor: ['mongodb', 'firebase'],
    mitigation: 'Validate and sanitize all query inputs. Use Mongoose schema validation.',
    tools: ['Mongoose', 'express-mongo-sanitize', 'Joi/Zod validation'],
  },

  // A04: Insecure Design (rate limiting, etc.)
  {
    id: 'A04-1', category: 'Design', title: 'Missing rate limiting',
    description: 'No rate limiting on API endpoints, vulnerable to brute force',
    severity: 'high', owaspRef: 'A04:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'hono', 'laravel'],
    mitigation: 'Implement rate limiting per IP/user. Use sliding window algorithm.',
    tools: ['express-rate-limit', '@nestjs/throttler', 'Redis-based limiter', 'Cloudflare WAF'],
  },
  {
    id: 'A04-2', category: 'Design', title: 'Missing input validation',
    description: 'API accepts arbitrary input without schema validation',
    severity: 'high', owaspRef: 'A04:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'go_gin', 'hono'],
    mitigation: 'Validate all input with schema validation (Zod, Joi, Pydantic, class-validator).',
    tools: ['Zod', 'Joi', 'class-validator', 'Pydantic'],
  },

  // A05: Security Misconfiguration
  {
    id: 'A05-1', category: 'Configuration', title: 'Exposed environment variables',
    description: 'Secrets committed to git or exposed in client-side code',
    severity: 'critical', owaspRef: 'A05:2021',
    checkFor: ['react', 'nextjs', 'vue', 'angular', 'svelte'],
    mitigation: 'Use .env files with .gitignore. Use NEXT_PUBLIC_ prefix only for public vars. Store secrets in vault.',
    tools: ['.gitignore', 'dotenv', 'Vault', 'Doppler'],
  },
  {
    id: 'A05-2', category: 'Configuration', title: 'Missing security headers',
    description: 'HTTP response lacks security headers (CSP, X-Frame, etc.)',
    severity: 'medium', owaspRef: 'A05:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'hono', 'nextjs'],
    mitigation: 'Add security headers: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.',
    tools: ['Helmet.js', 'django-csp', 'Next.js headers config'],
  },
  {
    id: 'A05-3', category: 'Configuration', title: 'Debug mode in production',
    description: 'Application running with debug/verbose mode enabled in production',
    severity: 'high', owaspRef: 'A05:2021',
    checkFor: ['django', 'laravel', 'express', 'nestjs', 'fastapi'],
    mitigation: 'Ensure DEBUG=false in production. Use environment-specific configs.',
    tools: ['dotenv', 'config management'],
  },

  // A07: Auth failures
  {
    id: 'A07-1', category: 'Authentication', title: 'Weak session management',
    description: 'Session tokens not properly secured (no HttpOnly, no Secure flag)',
    severity: 'high', owaspRef: 'A07:2021',
    checkFor: ['express', 'nestjs', 'django', 'laravel', 'fastapi'],
    mitigation: 'Set HttpOnly, Secure, SameSite flags. Use short expiry. Implement refresh tokens.',
    tools: ['express-session', 'cookie-session', 'JWT with refresh'],
  },

  // A09: Security Logging
  {
    id: 'A09-1', category: 'Logging', title: 'Insufficient security logging',
    description: 'No audit logs for auth events, access changes, or data modifications',
    severity: 'medium', owaspRef: 'A09:2021',
    checkFor: ['express', 'nestjs', 'fastapi', 'django', 'go_gin', 'laravel'],
    mitigation: 'Log auth events, failed attempts, data changes. Use structured logging.',
    tools: ['Winston', 'Pino', 'Morgan', 'Sentry', 'DataDog'],
  },

  // Frontend-specific
  {
    id: 'FE-1', category: 'Frontend', title: 'Sensitive data in localStorage',
    description: 'Storing tokens/secrets in localStorage (XSS accessible)',
    severity: 'medium',
    checkFor: ['react', 'vue', 'angular', 'svelte', 'nextjs'],
    mitigation: 'Store tokens in HttpOnly cookies, not localStorage. Use secure session management.',
    tools: ['next-auth', 'iron-session'],
  },

  // Database-specific
  {
    id: 'DB-1', category: 'Database', title: 'Missing database backups',
    description: 'No automated backup strategy for production database',
    severity: 'high',
    checkFor: ['postgresql', 'mysql', 'mongodb'],
    mitigation: 'Set up automated daily backups. Test restore procedures regularly.',
    tools: ['pg_dump', 'mongodump', 'managed backups (Supabase, Atlas)'],
  },
  {
    id: 'DB-2', category: 'Database', title: 'Overly permissive DB access',
    description: 'Application uses root/admin database credentials',
    severity: 'high',
    checkFor: ['postgresql', 'mysql', 'mongodb'],
    mitigation: 'Create application-specific DB user with minimum required permissions.',
    tools: ['PostgreSQL GRANT', 'MySQL privileges', 'MongoDB roles'],
  },
];

export const complianceFrameworks: ComplianceFramework[] = [
  {
    name: 'GDPR',
    description: 'EU General Data Protection Regulation',
    requirements: [
      'Data processing consent mechanism',
      'Right to data export (portability)',
      'Right to deletion (right to be forgotten)',
      'Data breach notification within 72 hours',
      'Privacy policy and cookie consent',
      'Data Processing Agreement (DPA) with providers',
      'Data encryption at rest and in transit',
      'Audit logging for data access',
    ],
    applicableTo: ['ecommerce', 'saas', 'social_network', 'marketplace', 'healthtech', 'fintech', 'enterprise'],
  },
  {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    requirements: [
      'PHI encryption at rest and in transit',
      'Access controls with unique user IDs',
      'Audit trails for PHI access',
      'Business Associate Agreements (BAA)',
      'Risk assessment and management plan',
      'Employee training on PHI handling',
      'Data backup and disaster recovery',
      'Physical safeguards for servers',
    ],
    applicableTo: ['healthtech'],
  },
  {
    name: 'PCI-DSS',
    description: 'Payment Card Industry Data Security Standard',
    requirements: [
      'Never store full card numbers (use tokenization)',
      'Use PCI-compliant payment provider (Stripe, PayPal)',
      'Encrypt cardholder data in transit',
      'Maintain secure network (firewall, WAF)',
      'Regular security testing and scanning',
      'Access control for payment data',
      'Monitor and log all access',
      'Security policy documentation',
    ],
    applicableTo: ['ecommerce', 'marketplace', 'fintech', 'saas'],
  },
  {
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    requirements: [
      'Security: Firewalls, access control, encryption',
      'Availability: SLA, disaster recovery, monitoring',
      'Processing Integrity: QA, error handling, validation',
      'Confidentiality: Data classification, encryption',
      'Privacy: Consent, data minimization, retention policy',
    ],
    applicableTo: ['saas', 'enterprise', 'fintech', 'healthtech'],
  },
];

export function getApplicableRules(techIds: string[]): SecurityRule[] {
  return securityRules.filter(rule =>
    rule.checkFor.some(tech => techIds.includes(tech))
  );
}

export function getApplicableCompliance(projectType: string): ComplianceFramework[] {
  return complianceFrameworks.filter(f => f.applicableTo.includes(projectType));
}
