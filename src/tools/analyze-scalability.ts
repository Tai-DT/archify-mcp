/**
 * Tool 17: Analyze Scalability
 * Kế hoạch scaling từ MVP → 1M users
 */

import type { ProjectType, ProjectScale, StackRecommendation } from '../types/index.js';

export interface ScalabilityPlan {
  currentStage: ScalingStage;
  stages: ScalingStage[];
  bottleneckPredictions: Bottleneck[];
  cachingStrategy: CachingStrategy;
  databaseScaling: DatabaseScalingPlan;
  recommendations: string[];
}

interface ScalingStage {
  name: string;
  userRange: string;
  rps: string; // requests per second
  architecture: string;
  infrastructure: string;
  estimatedCost: string;
  keyActions: string[];
}

interface Bottleneck {
  component: string;
  triggerPoint: string;
  symptom: string;
  solution: string;
  priority: 'critical' | 'high' | 'medium';
}

interface CachingStrategy {
  layers: { layer: string; what: string; ttl: string; tool: string }[];
  invalidationStrategy: string;
}

interface DatabaseScalingPlan {
  phase1: string;
  phase2: string;
  phase3: string;
  readReplicas: boolean;
  sharding: boolean;
  connectionPooling: string;
}

export function analyzeScalability(
  projectType: ProjectType,
  scale: ProjectScale,
  stack?: StackRecommendation,
  features: string[] = []
): ScalabilityPlan {
  const featureText = features.join(' ').toLowerCase();
  const hasChat = featureText.includes('chat') || featureText.includes('realtime');
  const hasAI = featureText.includes('ai') || featureText.includes('ml');
  const hasVideo = featureText.includes('video');

  const stages: ScalingStage[] = [
    {
      name: '🌱 Stage 1: MVP',
      userRange: '0 - 1,000 users',
      rps: '10-50 RPS',
      architecture: 'Single server (monolith)',
      infrastructure: '1x VPS hoặc managed platform (Vercel/Railway)',
      estimatedCost: '$0-50/mo',
      keyActions: [
        'Deploy single instance trên managed platform',
        'PostgreSQL managed (Supabase/Neon free tier)',
        'Redis cho session + cache (Upstash free tier)',
        'CDN cho static assets (Cloudflare free)',
        'Monitoring cơ bản (Sentry free tier)',
      ],
    },
    {
      name: '🌿 Stage 2: Product-Market Fit',
      userRange: '1,000 - 10,000 users',
      rps: '50-200 RPS',
      architecture: 'Single server + read replica + CDN',
      infrastructure: '2-3 instances, managed DB, Redis',
      estimatedCost: '$50-300/mo',
      keyActions: [
        'Thêm DB read replica cho queries nặng',
        'Implement connection pooling (PgBouncer)',
        'Cache layer: Redis cho hot data (user sessions, feed)',
        'Background jobs cho email, notifications (BullMQ)',
        'Image optimization + CDN cho media',
        'Setup APM/monitoring (Sentry Performance)',
      ],
    },
    {
      name: '🌳 Stage 3: Growth',
      userRange: '10,000 - 100,000 users',
      rps: '200-2,000 RPS',
      architecture: 'Horizontal scaling + load balancer + queue',
      infrastructure: 'Auto-scaling group, managed services',
      estimatedCost: '$300-2,000/mo',
      keyActions: [
        'Load balancer (ALB/Cloudflare LB)',
        'Auto-scaling: 2-5 app instances',
        'Message queue cho async processing (Redis/RabbitMQ)',
        'Database: sharding hoặc read replicas x3',
        'Full-text search: Elasticsearch/Meilisearch',
        'File storage: S3 + CloudFront CDN',
        'Structured logging + centralized monitoring',
      ],
    },
    {
      name: '🏔️ Stage 4: Scale',
      userRange: '100,000 - 1,000,000 users',
      rps: '2,000-20,000 RPS',
      architecture: 'Microservices / modular monolith + edge',
      infrastructure: 'K8s cluster, multi-region, dedicated DBs',
      estimatedCost: '$2,000-20,000/mo',
      keyActions: [
        'Extract high-traffic modules thành services riêng',
        'Database per service (nếu microservices)',
        'Multi-region deployment cho global users',
        'Edge caching + edge computing',
        'Dedicated queue cluster (Kafka/NATS)',
        'Database sharding strategy',
        'Implement circuit breakers + graceful degradation',
        'SRE team + on-call rotation',
      ],
    },
  ];

  // Bottleneck predictions
  const bottlenecks: Bottleneck[] = [
    {
      component: 'Database',
      triggerPoint: '~5,000 concurrent connections',
      symptom: 'Slow queries, connection timeouts, high CPU',
      solution: 'Connection pooling (PgBouncer) + read replicas + query optimization + indexing',
      priority: 'critical',
    },
    {
      component: 'API Server',
      triggerPoint: '~500 RPS per instance',
      symptom: 'Increased latency, 503 errors, memory spikes',
      solution: 'Horizontal scaling behind load balancer + rate limiting',
      priority: 'critical',
    },
    {
      component: 'File Storage',
      triggerPoint: '~100GB stored / 1000 uploads/day',
      symptom: 'Slow uploads, disk full, high bandwidth cost',
      solution: 'Direct-to-S3 upload (pre-signed URLs) + image optimization pipeline',
      priority: 'high',
    },
  ];

  if (hasChat) {
    bottlenecks.push({
      component: 'WebSocket Server',
      triggerPoint: '~10,000 concurrent connections',
      symptom: 'Memory spike, dropped connections, message delays',
      solution: 'Sticky sessions + Redis Pub/Sub for horizontal WS scaling + connection limit per server',
      priority: 'critical',
    });
  }

  if (hasAI) {
    bottlenecks.push({
      component: 'AI/LLM Inference',
      triggerPoint: '~100 concurrent AI requests',
      symptom: 'Response timeout (>30s), high cost, queue buildup',
      solution: 'Request queuing + caching similar queries + model fallback (GPT-4 → GPT-3.5) + streaming responses',
      priority: 'critical',
    });
  }

  if (hasVideo) {
    bottlenecks.push({
      component: 'Video/Media',
      triggerPoint: '~50 concurrent video calls',
      symptom: 'High bandwidth, poor quality, server overload',
      solution: 'Use SFU (Selective Forwarding Unit) like mediasoup, or SaaS: Daily.co, Agora',
      priority: 'high',
    });
  }

  // Caching strategy
  const cachingStrategy: CachingStrategy = {
    layers: [
      { layer: 'Browser', what: 'Static assets, API responses (GET)', ttl: '1h-1d', tool: 'Cache-Control headers' },
      { layer: 'CDN/Edge', what: 'Images, CSS, JS, public pages', ttl: '1d-7d', tool: 'Cloudflare/CloudFront' },
      { layer: 'Application', what: 'User sessions, computed data, feed', ttl: '5min-1h', tool: 'Redis' },
      { layer: 'Database', what: 'Query results, materialized views', ttl: '1min-15min', tool: 'Redis / DB query cache' },
    ],
    invalidationStrategy: 'Write-through cache: invalidate on write, TTL as fallback. Use cache tags for group invalidation.',
  };

  if (hasChat) {
    cachingStrategy.layers.push({ layer: 'Message', what: 'Recent messages, unread counts, presence', ttl: '30s-5min', tool: 'Redis Sorted Sets' });
  }

  // Database scaling
  const databaseScaling: DatabaseScalingPlan = {
    phase1: 'Single instance + connection pooling (PgBouncer) — handles up to 10K users',
    phase2: 'Read replicas (1-3) + write/read split — handles up to 100K users',
    phase3: 'Horizontal sharding by tenant/region + dedicated databases — handles 1M+ users',
    readReplicas: scale !== 'mvp',
    sharding: scale === 'enterprise',
    connectionPooling: 'PgBouncer: min 5, max 100 connections per pool',
  };

  const recommendations = [
    '📏 **Measure first, optimize later** — đừng optimize khi chưa có data nào',
    '📊 **Setup monitoring trước khi scale** — biết bottleneck ở đâu trước khi fix',
    '🚀 **Scale vertically trước** — upgrade server rẻ hơn và đơn giản hơn horizontal',
    '💾 **Cache everything cacheable** — cache là cách rẻ nhất để tăng performance',
    '📦 **CDN cho static content** — giảm 80% load cho server',
    '🔄 **Async mọi thứ có thể** — email, notification, report generation → queue',
    '📈 **Load test thường xuyên** — biết giới hạn hệ thống trước khi users biết',
  ];

  return {
    currentStage: stages[scale === 'mvp' ? 0 : scale === 'startup' ? 1 : scale === 'growth' ? 2 : 3],
    stages,
    bottleneckPredictions: bottlenecks,
    cachingStrategy,
    databaseScaling,
    recommendations,
  };
}

export function formatScalabilityPlan(plan: ScalabilityPlan): string {
  const lines = ['# 📈 Scalability Plan\n'];
  lines.push(`> Kế hoạch scaling từ MVP → 1M users\n`);

  // Current stage
  lines.push(`**Current stage**: ${plan.currentStage.name} (${plan.currentStage.userRange})\n`);

  // All stages
  for (const stage of plan.stages) {
    lines.push(`## ${stage.name}`);
    lines.push(`- **Users**: ${stage.userRange} | **RPS**: ${stage.rps}`);
    lines.push(`- **Architecture**: ${stage.architecture}`);
    lines.push(`- **Infrastructure**: ${stage.infrastructure}`);
    lines.push(`- **Est. cost**: ${stage.estimatedCost}\n`);
    lines.push('**Actions**:');
    stage.keyActions.forEach(a => lines.push(`- ${a}`));
    lines.push('');
  }

  // Bottlenecks
  lines.push('## ⚠️ Bottleneck Predictions\n');
  lines.push('| Component | Trigger Point | Solution | Priority |');
  lines.push('|-----------|--------------|----------|----------|');
  plan.bottleneckPredictions.forEach(b =>
    lines.push(`| **${b.component}** | ${b.triggerPoint} | ${b.solution.slice(0, 60)}... | ${b.priority} |`)
  );

  // Caching
  lines.push('\n## 💾 Caching Strategy\n');
  lines.push('| Layer | What to Cache | TTL | Tool |');
  lines.push('|-------|-------------|-----|------|');
  plan.cachingStrategy.layers.forEach(l =>
    lines.push(`| ${l.layer} | ${l.what} | ${l.ttl} | ${l.tool} |`)
  );
  lines.push(`\n**Invalidation**: ${plan.cachingStrategy.invalidationStrategy}`);

  // DB scaling
  lines.push('\n## 🗄️ Database Scaling\n');
  lines.push(`1. **Phase 1**: ${plan.databaseScaling.phase1}`);
  lines.push(`2. **Phase 2**: ${plan.databaseScaling.phase2}`);
  lines.push(`3. **Phase 3**: ${plan.databaseScaling.phase3}`);
  lines.push(`- Connection pooling: ${plan.databaseScaling.connectionPooling}`);

  // Recommendations
  lines.push('\n## 💡 Recommendations\n');
  plan.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
