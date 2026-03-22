import type { Technology, TechCategory, ProjectScale, ProjectType, EnvironmentContext, DeploymentEnv, TargetDevice, NetworkCondition } from '../types/index.js';
import { technologies } from './technologies.js';
import { getEnvFit } from './env-fit.js';

// Weight profiles for different project types
const projectWeights: Record<ProjectType, Record<keyof import('../types/index.js').TechScores, number>> = {
  ecommerce:        { performance: 0.15, scalability: 0.15, developerExperience: 0.10, ecosystem: 0.10, security: 0.15, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.15 },
  saas:             { performance: 0.10, scalability: 0.20, developerExperience: 0.15, ecosystem: 0.10, security: 0.15, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.10 },
  social_network:   { performance: 0.20, scalability: 0.20, developerExperience: 0.10, ecosystem: 0.10, security: 0.10, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.10 },
  marketplace:      { performance: 0.10, scalability: 0.15, developerExperience: 0.10, ecosystem: 0.15, security: 0.15, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.15 },
  content_platform: { performance: 0.10, scalability: 0.10, developerExperience: 0.15, ecosystem: 0.10, security: 0.10, costEfficiency: 0.15, documentation: 0.15, communitySupport: 0.15 },
  fintech:          { performance: 0.10, scalability: 0.15, developerExperience: 0.05, ecosystem: 0.10, security: 0.30, costEfficiency: 0.05, documentation: 0.10, communitySupport: 0.15 },
  healthtech:       { performance: 0.10, scalability: 0.10, developerExperience: 0.10, ecosystem: 0.10, security: 0.25, costEfficiency: 0.10, documentation: 0.15, communitySupport: 0.10 },
  edtech:           { performance: 0.10, scalability: 0.15, developerExperience: 0.15, ecosystem: 0.10, security: 0.10, costEfficiency: 0.15, documentation: 0.15, communitySupport: 0.10 },
  iot:              { performance: 0.20, scalability: 0.20, developerExperience: 0.10, ecosystem: 0.10, security: 0.15, costEfficiency: 0.10, documentation: 0.05, communitySupport: 0.10 },
  ai_ml:            { performance: 0.15, scalability: 0.15, developerExperience: 0.15, ecosystem: 0.15, security: 0.05, costEfficiency: 0.10, documentation: 0.15, communitySupport: 0.10 },
  gaming:           { performance: 0.25, scalability: 0.15, developerExperience: 0.10, ecosystem: 0.10, security: 0.05, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.15 },
  enterprise:       { performance: 0.10, scalability: 0.15, developerExperience: 0.05, ecosystem: 0.15, security: 0.20, costEfficiency: 0.05, documentation: 0.15, communitySupport: 0.15 },
  mobile_app:       { performance: 0.15, scalability: 0.10, developerExperience: 0.20, ecosystem: 0.15, security: 0.10, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.10 },
  api_service:      { performance: 0.20, scalability: 0.20, developerExperience: 0.10, ecosystem: 0.10, security: 0.15, costEfficiency: 0.10, documentation: 0.10, communitySupport: 0.05 },
  devtool:          { performance: 0.10, scalability: 0.05, developerExperience: 0.25, ecosystem: 0.15, security: 0.05, costEfficiency: 0.15, documentation: 0.15, communitySupport: 0.10 },
  other:            { performance: 0.12, scalability: 0.12, developerExperience: 0.15, ecosystem: 0.12, security: 0.12, costEfficiency: 0.12, documentation: 0.12, communitySupport: 0.13 },
};

// Scale modifiers
const scaleModifiers: Record<ProjectScale, Record<string, number>> = {
  mvp:        { scalability: 0.5, costEfficiency: 1.5, developerExperience: 1.3, performance: 0.8 },
  startup:    { scalability: 0.8, costEfficiency: 1.2, developerExperience: 1.2, performance: 1.0 },
  growth:     { scalability: 1.2, costEfficiency: 0.9, developerExperience: 1.0, performance: 1.1 },
  enterprise: { scalability: 1.5, costEfficiency: 0.7, developerExperience: 0.8, performance: 1.2 },
};

// ============================================================
// ENVIRONMENT-AWARE SCORING
// ============================================================

/**
 * Get deployment environment compatibility score for a tech (0-1 multiplier)
 */
function getEnvDeploymentScore(techId: string, deployEnv: DeploymentEnv): number {
  const fit = getEnvFit(techId);
  const envMap: Record<DeploymentEnv, number> = {
    cloud_managed:  fit.cloudManaged,
    cloud_iaas:     fit.cloudIaas,
    edge:           fit.edge,
    on_premise:     fit.onPremise,
    hybrid:         Math.round((fit.cloudManaged + fit.onPremise) / 2),
    serverless:     fit.serverless,
    vps:            fit.vps,
    shared_hosting: fit.sharedHosting,
  };
  return (envMap[deployEnv] || 5) / 10; // normalize to 0-1
}

/**
 * Get device compatibility score for frontend/mobile tech (0-1 multiplier)
 */
function getDeviceScore(techId: string, devices: TargetDevice[]): number {
  const fit = getEnvFit(techId);
  if (!fit.bundleSizeKb && !fit.lowEndDeviceScore) return 1.0; // not a client-side tech, no penalty
  if (!devices || devices.length === 0) return 1.0; // no device info, no penalty

  let score = 1.0;

  const hasLowEnd = devices.some(d => ['low_end_mobile', 'low_end_desktop', 'iot_device', 'wearable'].includes(d));
  const hasMidRange = devices.some(d => ['mid_range_mobile', 'standard_desktop', 'tablet', 'kiosk'].includes(d));

  if (hasLowEnd) {
    // Heavily penalize large bundles and poor low-end performance
    const lowEndScore = fit.lowEndDeviceScore || 5;
    const bundlePenalty = fit.bundleSizeKb ? Math.max(0, 1 - (fit.bundleSizeKb - 100) / 500) : 0.8;
    score = (lowEndScore / 10) * 0.6 + bundlePenalty * 0.4;
  } else if (hasMidRange) {
    const lowEndScore = fit.lowEndDeviceScore || 7;
    score = Math.min(1.0, lowEndScore / 8);
  }

  return Math.max(0.3, score); // never go below 0.3
}

/**
 * Get network condition compatibility score (0-1 multiplier)
 */
function getNetworkScore(techId: string, network: NetworkCondition): number {
  const fit = getEnvFit(techId);

  if (network === 'offline_first') {
    return fit.supportsOffline ? 1.0 : 0.4;
  }

  if (network === 'mobile_3g' || network === 'intermittent' || network === 'satellite') {
    // Prefer small bundles and offline support
    let score = 0.8;
    if (fit.bundleSizeKb && fit.bundleSizeKb > 200) score -= 0.2;
    if (fit.bundleSizeKb && fit.bundleSizeKb > 500) score -= 0.2;
    if (fit.supportsOffline) score += 0.1;
    return Math.max(0.3, Math.min(1.0, score));
  }

  return 1.0;
}

/**
 * Check infrastructure constraints and return penalty (0-1 multiplier)
 */
function getInfraScore(techId: string, env?: EnvironmentContext): number {
  if (!env?.infrastructure) return 1.0;
  const fit = getEnvFit(techId);
  const infra = env.infrastructure;
  let score = 1.0;

  // Check RAM constraint
  if (infra.maxServerRamGb && fit.minMemoryMb > 0) {
    const availableMb = infra.maxServerRamGb * 1024;
    if (fit.minMemoryMb > availableMb * 0.8) {
      score *= 0.3; // Takes too much of available RAM
    } else if (fit.minMemoryMb > availableMb * 0.5) {
      score *= 0.6;
    }
  }

  // Check CPU constraint
  if (infra.maxServerCpuCores && infra.maxServerCpuCores <= 1 && fit.cpuIntensity === 'high') {
    score *= 0.4;
  }

  // Check cold start tolerance (for serverless)
  if (env.performance?.coldStartToleranceMs && fit.coldStartMs) {
    if (fit.coldStartMs > env.performance.coldStartToleranceMs) {
      score *= 0.4;
    }
  }

  // Check bundle size constraint
  if (env.performance?.maxBundleSizeKb && fit.bundleSizeKb) {
    if (fit.bundleSizeKb > env.performance.maxBundleSizeKb) {
      score *= 0.3;
    }
  }

  return Math.max(0.2, score);
}

/**
 * Score technology with full environment context
 */
export function scoreTechnology(
  tech: Technology,
  projectType: ProjectType,
  scale: ProjectScale,
  env?: EnvironmentContext
): number {
  const weights = projectWeights[projectType] || projectWeights.other;
  const modifiers = scaleModifiers[scale] || scaleModifiers.startup;

  // Base score from project weights
  let baseScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const scoreKey = key as keyof typeof tech.scores;
    const modifier = (modifiers[key] as number) || 1.0;
    baseScore += tech.scores[scoreKey] * weight * modifier;
  }

  // If no environment context, return base score
  if (!env) {
    return Math.round(baseScore * 100) / 100;
  }

  // Environment multipliers
  const deployScore = getEnvDeploymentScore(tech.id, env.deploymentEnv);
  const deviceScore = getDeviceScore(tech.id, env.targetDevices);
  const networkScore = getNetworkScore(tech.id, env.networkCondition);
  const infraScore = getInfraScore(tech.id, env);

  // Weighted combination: base 60%, env 40%
  const envScore = (deployScore * 0.35 + deviceScore * 0.25 + networkScore * 0.20 + infraScore * 0.20);
  const finalScore = baseScore * 0.6 + (baseScore * envScore) * 0.4;

  return Math.round(finalScore * 100) / 100;
}

export function getTopTechnologies(
  category: TechCategory,
  projectType: ProjectType,
  scale: ProjectScale,
  limit = 3,
  env?: EnvironmentContext
): { tech: Technology; score: number; envNotes: string[] }[] {
  const categoryTechs = technologies.filter(t => t.category === category);

  return categoryTechs
    .map(tech => ({
      tech,
      score: scoreTechnology(tech, projectType, scale, env),
      envNotes: env ? generateEnvNotes(tech, env) : [],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate environment-specific notes for a technology
 */
function generateEnvNotes(tech: Technology, env: EnvironmentContext): string[] {
  const notes: string[] = [];
  const fit = getEnvFit(tech.id);

  // Deployment fit check
  const deployScore = getEnvDeploymentScore(tech.id, env.deploymentEnv);
  if (deployScore < 0.5) {
    notes.push(`⚠️ Low compatibility with ${env.deploymentEnv.replace('_', ' ')} deployment (${Math.round(deployScore * 10)}/10)`);
  } else if (deployScore >= 0.9) {
    notes.push(`✅ Excellent fit for ${env.deploymentEnv.replace('_', ' ')} deployment`);
  }

  // Device fit
  const hasLowEnd = env.targetDevices.some(d => d.includes('low_end'));
  if (hasLowEnd && fit.bundleSizeKb && fit.bundleSizeKb > 200) {
    notes.push(`⚠️ Bundle size ${fit.bundleSizeKb}KB may be large for low-end devices`);
  }
  if (hasLowEnd && fit.lowEndDeviceScore && fit.lowEndDeviceScore < 5) {
    notes.push(`⚠️ Performance on low-end devices: ${fit.lowEndDeviceScore}/10`);
  }

  // Resource warnings
  if (env.infrastructure?.maxServerRamGb) {
    const availMb = env.infrastructure.maxServerRamGb * 1024;
    if (fit.minMemoryMb > availMb * 0.5) {
      notes.push(`⚠️ Requires ${fit.minMemoryMb}MB RAM (${env.infrastructure.maxServerRamGb}GB available)`);
    }
  }

  // Cold start
  if (env.deploymentEnv === 'serverless' && fit.coldStartMs && fit.coldStartMs > 1000) {
    notes.push(`⚠️ Cold start ~${fit.coldStartMs}ms (may affect serverless performance)`);
  }

  // Network
  if (env.networkCondition === 'offline_first' && !fit.supportsOffline) {
    notes.push(`❌ Does not support offline mode`);
  }
  if (['mobile_3g', 'intermittent'].includes(env.networkCondition) && fit.bundleSizeKb && fit.bundleSizeKb > 300) {
    notes.push(`⚠️ Large bundle may be slow on ${env.networkCondition.replace('_', ' ')} network`);
  }

  // Positive notes
  if (fit.minMemoryMb <= 64 && fit.cpuIntensity === 'low') {
    notes.push(`💚 Very lightweight: ${fit.minMemoryMb}MB RAM, low CPU usage`);
  }
  if (fit.coldStartMs !== undefined && fit.coldStartMs < 100) {
    notes.push(`⚡ Near-instant startup: ${fit.coldStartMs}ms`);
  }

  return notes;
}

// Determine which tech categories are needed for a project type
export function getRequiredCategories(projectType: ProjectType, features: string[] = []): TechCategory[] {
  const base: TechCategory[] = ['frontend_framework', 'backend_framework', 'database_relational', 'cloud', 'ci_cd'];

  const extras: Partial<Record<ProjectType, TechCategory[]>> = {
    ecommerce: ['search', 'cache', 'payment', 'storage', 'monitoring', 'frontend_ui'],
    saas: ['auth', 'cache', 'payment', 'monitoring', 'frontend_ui'],
    social_network: ['cache', 'realtime', 'storage', 'database_nosql', 'search', 'message_queue'],
    marketplace: ['search', 'cache', 'payment', 'storage', 'realtime'],
    fintech: ['cache', 'monitoring', 'message_queue', 'auth'],
    healthtech: ['auth', 'storage', 'realtime', 'monitoring'],
    ai_ml: ['ai_ml', 'cache', 'database_vector'],
    iot: ['realtime', 'message_queue', 'cache', 'monitoring'],
    mobile_app: ['mobile', 'cache', 'auth', 'storage'],
    content_platform: ['search', 'cache', 'storage', 'frontend_ui'],
    gaming: ['realtime', 'cache', 'database_nosql'],
    enterprise: ['auth', 'cache', 'monitoring', 'message_queue', 'container'],
    api_service: ['cache', 'monitoring', 'api_gateway', 'auth'],
    edtech: ['storage', 'cache', 'realtime', 'payment'],
    devtool: ['testing', 'ci_cd', 'container'],
  };

  const result = new Set<TechCategory>([...base, ...(extras[projectType] || [])]);

  // Feature-based category injection
  // Detect keywords trong features/description để thêm categories phù hợp
  const featureText = features.join(' ').toLowerCase();
  const featureMap: Record<string, TechCategory[]> = {
    // Chat / Realtime
    'chat': ['realtime', 'message_queue'],
    'messaging': ['realtime', 'message_queue'],
    'real-time': ['realtime'],
    'realtime': ['realtime'],
    'websocket': ['realtime'],
    'notification': ['realtime', 'message_queue'],
    'live': ['realtime'],
    // AI / ML
    'ai': ['ai_ml'],
    'ml': ['ai_ml'],
    'chatbot': ['ai_ml', 'realtime'],
    'gpt': ['ai_ml'],
    'llm': ['ai_ml'],
    'machine learning': ['ai_ml'],
    'recommendation': ['ai_ml'],
    // Mobile
    'mobile': ['mobile'],
    'app': ['mobile'],
    'ios': ['mobile'],
    'android': ['mobile'],
    'react native': ['mobile'],
    'flutter': ['mobile'],
    // Search
    'search': ['search'],
    'filter': ['search'],
    'full-text': ['search'],
    // Payment
    'payment': ['payment'],
    'billing': ['payment'],
    'subscription': ['payment'],
    'checkout': ['payment'],
    // Storage
    'upload': ['storage'],
    'file': ['storage'],
    'image': ['storage'],
    'video': ['storage'],
    's3': ['storage'],
    // Auth
    'auth': ['auth'],
    'login': ['auth'],
    'sso': ['auth'],
    'oauth': ['auth'],
    // Monitoring
    'monitoring': ['monitoring'],
    'logging': ['monitoring'],
    'analytics': ['monitoring'],
  };

  for (const [keyword, categories] of Object.entries(featureMap)) {
    if (featureText.includes(keyword)) {
      categories.forEach(cat => result.add(cat));
    }
  }

  return [...result];
}

/**
 * Analyze environment context and return warnings/recommendations
 */
export function analyzeEnvironment(env: EnvironmentContext): {
  deploymentRecommendation: string;
  deviceOptimizations: string[];
  networkStrategy: string;
  performanceTargets: string[];
  infraWarnings: string[];
} {
  const deviceOpts: string[] = [];
  const perfTargets: string[] = [];
  const infraWarnings: string[] = [];

  // Deployment recommendation
  const deployRecs: Record<DeploymentEnv, string> = {
    cloud_managed: 'Sử dụng managed platform (Vercel, Railway, Render) — ít ops overhead, auto-scaling, preview deployments.',
    cloud_iaas: 'Sử dụng IaaS (EC2, GCE) — full control, cần DevOps experience, phù hợp workload phức tạp.',
    edge: 'Triển khai trên Edge (Cloudflare Workers, Deno Deploy) — latency cực thấp, giới hạn compute, chọn framework nhẹ.',
    on_premise: 'Triển khai On-premise — full control, cần quản lý hardware, bảo mật vật lý, phù hợp compliance cao.',
    hybrid: 'Hybrid deployment — core services on-premise, static/edge content trên cloud, cần VPN/interconnect.',
    serverless: 'Serverless (Lambda, Cloud Functions) — pay-per-use, cần chú ý cold start, chọn runtime nhẹ.',
    vps: 'VPS (DigitalOcean, Hetzner) — cost-effective, cần tự quản lý, giới hạn tài nguyên theo plan.',
    shared_hosting: 'Shared hosting — rẻ nhất, rất giới hạn (chỉ PHP/static), không phù hợp app phức tạp.',
  };

  // Device optimizations
  const hasLowEnd = env.targetDevices.some(d => d.includes('low_end'));
  const hasIot = env.targetDevices.includes('iot_device');
  const hasWearable = env.targetDevices.includes('wearable');
  const hasMobile = env.targetDevices.some(d => d.includes('mobile'));

  if (hasLowEnd) {
    deviceOpts.push('🔧 Code splitting & lazy loading bắt buộc — giảm initial bundle');
    deviceOpts.push('🔧 Ưu tiên framework nhẹ (Svelte, Preact) thay vì framework nặng (Angular)');
    deviceOpts.push('🔧 Tối ưu hình ảnh: WebP/AVIF, responsive images, lazy load');
    deviceOpts.push('🔧 Giảm JavaScript — dùng progressive enhancement');
  }
  if (hasIot || hasWearable) {
    deviceOpts.push('🔧 Tối ưu cho device yếu: tránh heavy rendering, dùng server-side computation');
    deviceOpts.push('🔧 Xem xét protocol nhẹ: MQTT thay HTTP, binary format thay JSON');
  }
  if (hasMobile) {
    deviceOpts.push('🔧 Mobile-first responsive design bắt buộc');
    deviceOpts.push('🔧 Touch-friendly UI: min tap target 44x44px');
    deviceOpts.push('🔧 Xem xét PWA hoặc native app cho trải nghiệm tốt hơn');
  }

  // Network strategy
  const networkStrategies: Record<NetworkCondition, string> = {
    fiber: 'High-speed connection — có thể load rich content, real-time features hoạt động tốt.',
    broadband: 'Broadband — standard optimization, CDN cho static assets.',
    mobile_4g: 'Mobile 4G — optimize bundle size < 200KB, dùng image compression, API response gzip.',
    mobile_3g: 'Mobile 3G — aggressive optimization: < 100KB initial bundle, lazy loading tất cả, skeleton UI, API pagination nhỏ.',
    offline_first: 'Offline-first — Service Worker bắt buộc, IndexedDB cho data, background sync, conflict resolution strategy.',
    intermittent: 'Mạng không ổn định — implement retry logic, queue offline actions, optimistic UI updates.',
    satellite: 'Satellite (high latency) — batch requests, giảm round-trips, prefetch data, local cache strategy.',
  };

  // Performance targets
  if (env.performance?.maxResponseTimeMs) {
    perfTargets.push(`🎯 Response time target: < ${env.performance.maxResponseTimeMs}ms`);
    if (env.performance.maxResponseTimeMs <= 200) {
      perfTargets.push('⚡ Ultra-low latency — cần edge deployment, in-memory cache, avoid cold starts');
    }
  }
  if (env.performance?.concurrentUsers) {
    perfTargets.push(`🎯 Concurrent users: ${env.performance.concurrentUsers.toLocaleString()}`);
    if (env.performance.concurrentUsers > 10000) {
      perfTargets.push('📈 High concurrency — cần horizontal scaling, connection pooling, load balancer');
    }
  }
  if (env.performance?.maxBundleSizeKb) {
    perfTargets.push(`🎯 Max bundle size: ${env.performance.maxBundleSizeKb}KB`);
  }
  if (env.performance?.availabilitySla) {
    perfTargets.push(`🎯 Availability SLA: ${env.performance.availabilitySla}%`);
    if (env.performance.availabilitySla >= 99.99) {
      perfTargets.push('🔒 Four 9s — cần multi-region, automated failover, health checks');
    }
  }

  // Infrastructure warnings
  if (env.infrastructure?.maxServerRamGb && env.infrastructure.maxServerRamGb <= 1) {
    infraWarnings.push('⚠️ RAM ≤ 1GB: tránh Elasticsearch, Kafka, Spring Boot — dùng lightweight alternatives');
  }
  if (env.infrastructure?.maxServerCpuCores && env.infrastructure.maxServerCpuCores <= 1) {
    infraWarnings.push('⚠️ Single-core CPU: tránh CPU-intensive frameworks, dùng async I/O (Node.js, Go)');
  }
  if (env.infrastructure?.maxMonthlyCostUsd && env.infrastructure.maxMonthlyCostUsd < 50) {
    infraWarnings.push('⚠️ Budget < $50/mo: dùng free tiers (Vercel, Cloudflare, Supabase, Neon)');
  }
  if (env.infrastructure?.complianceReqs?.length) {
    infraWarnings.push(`🔒 Compliance: ${env.infrastructure.complianceReqs.join(', ')} — cần audit logging, encryption, certified providers`);
  }
  if (!env.infrastructure?.hasGpuAccess && env.targetDevices.includes('iot_device')) {
    infraWarnings.push('⚠️ No GPU + IoT: nếu cần ML inference, dùng cloud API hoặc edge ML (TensorFlow Lite)');
  }

  return {
    deploymentRecommendation: deployRecs[env.deploymentEnv],
    deviceOptimizations: deviceOpts,
    networkStrategy: networkStrategies[env.networkCondition],
    performanceTargets: perfTargets,
    infraWarnings,
  };
}
