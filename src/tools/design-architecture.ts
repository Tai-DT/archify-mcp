import type { ProjectType, ProjectScale, ArchitectureDesign, ArchComponent, StackRecommendation } from '../types/index.js';
import { recommendPattern } from '../knowledge/patterns.js';

export function designArchitecture(
  projectType: ProjectType,
  scale: ProjectScale,
  stack: StackRecommendation,
  teamSize: number = 3,
  requiresRealtime: boolean = false,
  requiresMultiPlatform: boolean = false
): ArchitectureDesign {
  const patterns = recommendPattern(teamSize, scale, requiresRealtime, requiresMultiPlatform);
  const pattern = patterns[0];

  const components = generateComponents(stack, pattern.id);
  const diagram = generateDiagram(components, pattern.id, projectType);
  const dataFlow = generateDataFlow(projectType, components);

  return {
    pattern: pattern.id,
    reasoning: `**${pattern.name}** is recommended because:\n- Team size: ${teamSize} developers (${pattern.teamSize} recommended)\n- Scale: ${scale}\n- Complexity: ${pattern.complexity}\n- Scalability: ${pattern.scalability}\n\n${pattern.description}`,
    diagram,
    components,
    dataFlow,
    deploymentStrategy: {
      type: scale === 'enterprise' ? 'multi_region' : scale === 'growth' ? 'multi_region' : 'single_server',
      description: getDeploymentDescription(scale, stack),
      infrastructure: getInfrastructureList(stack),
      estimatedMonthlyCost: estimateMonthlyCost(scale),
    },
    scalingStrategy: {
      horizontal: scale !== 'mvp',
      vertical: true,
      autoScale: scale === 'growth' || scale === 'enterprise',
      caching: stack.cache ? [stack.cache.technology.name] : ['Browser cache'],
      loadBalancing: scale === 'mvp' ? 'CDN only' : 'Application Load Balancer',
      description: getScalingDescription(scale),
    },
  };
}

function generateComponents(stack: StackRecommendation, patternId: string): ArchComponent[] {
  const components: ArchComponent[] = [];

  if (stack.frontend) {
    components.push({
      name: 'Frontend Application',
      type: 'frontend',
      technology: stack.frontend.technology.name,
      responsibilities: ['User interface rendering', 'Client-side routing', 'State management', 'API communication'],
      communicatesWith: ['API Gateway / Backend'],
    });
  }
  if (stack.backend) {
    components.push({
      name: 'Backend API',
      type: 'backend',
      technology: stack.backend.technology.name,
      responsibilities: ['Business logic', 'Authentication/Authorization', 'Data validation', 'API endpoints'],
      communicatesWith: ['Database', 'Cache', 'External Services'],
    });
  }
  if (stack.database) {
    components.push({
      name: 'Primary Database',
      type: 'database',
      technology: stack.database.technology.name,
      responsibilities: ['Data persistence', 'Query processing', 'Data integrity'],
      communicatesWith: ['Backend API'],
    });
  }
  if (stack.cache) {
    components.push({
      name: 'Cache Layer',
      type: 'cache',
      technology: stack.cache.technology.name,
      responsibilities: ['Response caching', 'Session storage', 'Rate limiting'],
      communicatesWith: ['Backend API'],
    });
  }
  if (stack.realtime) {
    components.push({
      name: 'Real-time Service',
      type: 'realtime',
      technology: stack.realtime.technology.name,
      responsibilities: ['WebSocket connections', 'Live updates', 'Pub/Sub messaging'],
      communicatesWith: ['Frontend Application', 'Backend API'],
    });
  }

  return components;
}

function generateDiagram(components: ArchComponent[], pattern: string, projectType: string): string {
  const lines = ['graph TD'];

  lines.push('    Client[🌐 Client Browser/App]');

  if (components.find(c => c.type === 'frontend')) {
    const fe = components.find(c => c.type === 'frontend')!;
    lines.push(`    CDN[☁️ CDN / Edge]`);
    lines.push(`    FE[📱 ${fe.technology}]`);
    lines.push('    Client --> CDN --> FE');
  }

  if (components.find(c => c.type === 'backend')) {
    const be = components.find(c => c.type === 'backend')!;
    lines.push(`    API[⚙️ ${be.technology} API]`);
    lines.push('    FE --> API');
  }

  if (components.find(c => c.type === 'database')) {
    const db = components.find(c => c.type === 'database')!;
    lines.push(`    DB[(🗄️ ${db.technology})]`);
    lines.push('    API --> DB');
  }

  if (components.find(c => c.type === 'cache')) {
    const cache = components.find(c => c.type === 'cache')!;
    lines.push(`    Cache[(⚡ ${cache.technology})]`);
    lines.push('    API --> Cache');
  }

  if (components.find(c => c.type === 'realtime')) {
    const rt = components.find(c => c.type === 'realtime')!;
    lines.push(`    WS[🔌 ${rt.technology}]`);
    lines.push('    FE <--> WS');
    lines.push('    WS --> API');
  }

  return lines.join('\n');
}

function generateDataFlow(projectType: string, components: ArchComponent[]): string {
  return `sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant A as API Server
    participant D as Database
    participant Ca as Cache

    C->>F: Request Page
    F->>A: API Call (REST/GraphQL)
    A->>Ca: Check Cache
    alt Cache Hit
        Ca-->>A: Return Cached Data
    else Cache Miss
        A->>D: Query Database
        D-->>A: Return Data
        A->>Ca: Store in Cache
    end
    A-->>F: JSON Response
    F-->>C: Render UI`;
}

function getDeploymentDescription(scale: ProjectScale, stack: StackRecommendation): string {
  const cloudName = stack.cloud?.technology.name || 'Cloud Provider';
  const descriptions: Record<ProjectScale, string> = {
    mvp: `Deploy on ${cloudName} with managed services. Single region, auto-scaling disabled to minimize costs. Use preview deployments for staging.`,
    startup: `Deploy on ${cloudName} with auto-scaling enabled. Single region with CDN for global static assets. Implement blue-green deployments.`,
    growth: `Multi-region deployment on ${cloudName}. Database read replicas for performance. Implement canary deployments for safe releases.`,
    enterprise: `Multi-region active-active deployment. Dedicated infrastructure with VPC. SOC2/ISO27001 compliance. Disaster recovery with <1hr RTO.`,
  };
  return descriptions[scale];
}

function getInfrastructureList(stack: StackRecommendation): string[] {
  const infra: string[] = [];
  if (stack.cloud) infra.push(stack.cloud.technology.name);
  if (stack.cicd) infra.push(stack.cicd.technology.name);
  if (stack.monitoring) infra.push(stack.monitoring.technology.name);
  infra.push('SSL/TLS Certificates', 'DNS Management');
  return infra;
}

function estimateMonthlyCost(scale: ProjectScale): string {
  const costs: Record<ProjectScale, string> = {
    mvp: '$20-100/month (managed services, free tiers)',
    startup: '$100-500/month (small instances, managed DB)',
    growth: '$500-5,000/month (auto-scaling, multi-zone)',
    enterprise: '$5,000-50,000+/month (multi-region, compliance)',
  };
  return costs[scale];
}

function getScalingDescription(scale: ProjectScale): string {
  const desc: Record<ProjectScale, string> = {
    mvp: 'Vertical scaling only. Upgrade instance size as needed. CDN for static assets.',
    startup: 'Horizontal scaling with 2-3 instances. Database connection pooling. CDN for all static content.',
    growth: 'Auto-scaling groups with 3-10 instances. Database read replicas. Full CDN with edge caching.',
    enterprise: 'Global auto-scaling with min 5 instances per region. Database clustering. Multi-layer caching strategy.',
  };
  return desc[scale];
}
