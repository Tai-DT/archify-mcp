import type { TechEnvironmentFit } from '../types/index.js';

/**
 * Environment fit data cho mỗi technology.
 * Separate file để dễ maintain mà không phải sửa từng tech entry.
 * Key = technology id, value = TechEnvironmentFit
 */
export const envFitData: Record<string, TechEnvironmentFit> = {
  // ============ FRONTEND FRAMEWORKS ============
  react: {
    cloudManaged: 10, cloudIaas: 9, edge: 8, onPremise: 8, serverless: 8, vps: 9, sharedHosting: 6,
    minMemoryMb: 512, cpuIntensity: 'medium', diskFootprintMb: 200,
    bundleSizeKb: 150, supportsOffline: true, lowEndDeviceScore: 6,
    coldStartMs: 0, startupTimeMs: 0,
  },
  nextjs: {
    cloudManaged: 10, cloudIaas: 9, edge: 9, onPremise: 7, serverless: 9, vps: 8, sharedHosting: 3,
    minMemoryMb: 512, cpuIntensity: 'medium', diskFootprintMb: 300,
    bundleSizeKb: 180, supportsOffline: true, lowEndDeviceScore: 6,
    coldStartMs: 800, startupTimeMs: 2000,
  },
  vue: {
    cloudManaged: 10, cloudIaas: 9, edge: 8, onPremise: 8, serverless: 8, vps: 9, sharedHosting: 7,
    minMemoryMb: 256, cpuIntensity: 'low', diskFootprintMb: 100,
    bundleSizeKb: 90, supportsOffline: true, lowEndDeviceScore: 8,
    coldStartMs: 0, startupTimeMs: 0,
  },
  angular: {
    cloudManaged: 9, cloudIaas: 9, edge: 5, onPremise: 9, serverless: 5, vps: 9, sharedHosting: 5,
    minMemoryMb: 512, cpuIntensity: 'medium', diskFootprintMb: 400,
    bundleSizeKb: 300, supportsOffline: true, lowEndDeviceScore: 4,
    coldStartMs: 0, startupTimeMs: 0,
  },
  svelte: {
    cloudManaged: 10, cloudIaas: 9, edge: 10, onPremise: 9, serverless: 10, vps: 10, sharedHosting: 8,
    minMemoryMb: 128, cpuIntensity: 'low', diskFootprintMb: 50,
    bundleSizeKb: 30, supportsOffline: true, lowEndDeviceScore: 10,
    coldStartMs: 0, startupTimeMs: 0,
  },

  // ============ FRONTEND UI ============
  tailwindcss: {
    cloudManaged: 10, cloudIaas: 10, edge: 10, onPremise: 10, serverless: 10, vps: 10, sharedHosting: 10,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 5,
    bundleSizeKb: 15, supportsOffline: true, lowEndDeviceScore: 10,
  },
  shadcn: {
    cloudManaged: 10, cloudIaas: 10, edge: 9, onPremise: 9, serverless: 9, vps: 10, sharedHosting: 8,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 20,
    bundleSizeKb: 50, supportsOffline: true, lowEndDeviceScore: 8,
  },

  // ============ BACKEND FRAMEWORKS ============
  nestjs: {
    cloudManaged: 9, cloudIaas: 10, edge: 3, onPremise: 10, serverless: 4, vps: 9, sharedHosting: 2,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 300,
    coldStartMs: 3000, startupTimeMs: 3000,
  },
  express: {
    cloudManaged: 9, cloudIaas: 10, edge: 5, onPremise: 10, serverless: 7, vps: 10, sharedHosting: 4,
    minMemoryMb: 64, cpuIntensity: 'low', diskFootprintMb: 50,
    coldStartMs: 500, startupTimeMs: 500,
  },
  fastapi: {
    cloudManaged: 8, cloudIaas: 10, edge: 3, onPremise: 10, serverless: 6, vps: 10, sharedHosting: 3,
    minMemoryMb: 128, cpuIntensity: 'medium', diskFootprintMb: 200,
    coldStartMs: 1500, startupTimeMs: 1000,
  },
  django: {
    cloudManaged: 7, cloudIaas: 10, edge: 2, onPremise: 10, serverless: 3, vps: 10, sharedHosting: 5,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 300,
    coldStartMs: 4000, startupTimeMs: 3000,
  },
  go_gin: {
    cloudManaged: 8, cloudIaas: 10, edge: 7, onPremise: 10, serverless: 8, vps: 10, sharedHosting: 3,
    minMemoryMb: 16, cpuIntensity: 'low', diskFootprintMb: 20,
    coldStartMs: 50, startupTimeMs: 50,
  },
  laravel: {
    cloudManaged: 7, cloudIaas: 9, edge: 2, onPremise: 10, serverless: 3, vps: 10, sharedHosting: 9,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 400,
    coldStartMs: 5000, startupTimeMs: 3000,
  },
  spring_boot: {
    cloudManaged: 7, cloudIaas: 10, edge: 2, onPremise: 10, serverless: 3, vps: 8, sharedHosting: 1,
    minMemoryMb: 512, cpuIntensity: 'high', diskFootprintMb: 500,
    coldStartMs: 8000, startupTimeMs: 5000,
  },
  hono: {
    cloudManaged: 10, cloudIaas: 8, edge: 10, onPremise: 7, serverless: 10, vps: 9, sharedHosting: 5,
    minMemoryMb: 8, cpuIntensity: 'low', diskFootprintMb: 5,
    coldStartMs: 5, startupTimeMs: 10,
  },

  // ============ DATABASES ============
  postgresql: {
    cloudManaged: 10, cloudIaas: 10, edge: 3, onPremise: 10, serverless: 7, vps: 9, sharedHosting: 6,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 200,
    startupTimeMs: 2000,
  },
  mysql: {
    cloudManaged: 10, cloudIaas: 10, edge: 2, onPremise: 10, serverless: 5, vps: 10, sharedHosting: 10,
    minMemoryMb: 128, cpuIntensity: 'medium', diskFootprintMb: 150,
    startupTimeMs: 1500,
  },
  mongodb: {
    cloudManaged: 10, cloudIaas: 10, edge: 3, onPremise: 9, serverless: 8, vps: 8, sharedHosting: 2,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 300,
    startupTimeMs: 2000,
  },
  redis: {
    cloudManaged: 10, cloudIaas: 10, edge: 5, onPremise: 10, serverless: 6, vps: 10, sharedHosting: 3,
    minMemoryMb: 32, cpuIntensity: 'low', diskFootprintMb: 10,
    startupTimeMs: 100,
  },
  supabase: {
    cloudManaged: 10, cloudIaas: 5, edge: 7, onPremise: 3, serverless: 9, vps: 4, sharedHosting: 2,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
    startupTimeMs: 0, // managed service
  },
  firebase: {
    cloudManaged: 10, cloudIaas: 3, edge: 6, onPremise: 1, serverless: 10, vps: 2, sharedHosting: 1,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
    startupTimeMs: 0,
  },
  neon: {
    cloudManaged: 10, cloudIaas: 4, edge: 8, onPremise: 1, serverless: 10, vps: 3, sharedHosting: 1,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
    startupTimeMs: 0,
  },

  // ============ SEARCH ============
  elasticsearch: {
    cloudManaged: 9, cloudIaas: 10, edge: 1, onPremise: 10, serverless: 3, vps: 6, sharedHosting: 1,
    minMemoryMb: 2048, cpuIntensity: 'high', diskFootprintMb: 1000,
    startupTimeMs: 10000,
  },
  meilisearch: {
    cloudManaged: 9, cloudIaas: 9, edge: 2, onPremise: 9, serverless: 3, vps: 8, sharedHosting: 1,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 100,
    startupTimeMs: 2000,
  },

  // ============ AUTH ============
  clerk: {
    cloudManaged: 10, cloudIaas: 8, edge: 9, onPremise: 2, serverless: 10, vps: 8, sharedHosting: 5,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  auth0: {
    cloudManaged: 10, cloudIaas: 9, edge: 7, onPremise: 4, serverless: 9, vps: 8, sharedHosting: 5,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },

  // ============ CLOUD ============
  vercel: {
    cloudManaged: 10, cloudIaas: 3, edge: 10, onPremise: 1, serverless: 10, vps: 1, sharedHosting: 1,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  aws: {
    cloudManaged: 10, cloudIaas: 10, edge: 8, onPremise: 3, serverless: 10, vps: 5, sharedHosting: 1,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  cloudflare: {
    cloudManaged: 10, cloudIaas: 4, edge: 10, onPremise: 2, serverless: 10, vps: 3, sharedHosting: 2,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },

  // ============ MOBILE ============
  react_native: {
    cloudManaged: 8, cloudIaas: 7, edge: 3, onPremise: 5, serverless: 5, vps: 6, sharedHosting: 2,
    minMemoryMb: 512, cpuIntensity: 'medium', diskFootprintMb: 300,
    bundleSizeKb: 8000, supportsOffline: true, lowEndDeviceScore: 5,
  },
  flutter: {
    cloudManaged: 7, cloudIaas: 6, edge: 2, onPremise: 5, serverless: 3, vps: 5, sharedHosting: 1,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 200,
    bundleSizeKb: 6000, supportsOffline: true, lowEndDeviceScore: 7,
  },

  // ============ OTHERS (defaults) ============
  github_actions: {
    cloudManaged: 10, cloudIaas: 8, edge: 5, onPremise: 6, serverless: 8, vps: 7, sharedHosting: 3,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  openai: {
    cloudManaged: 10, cloudIaas: 8, edge: 7, onPremise: 2, serverless: 10, vps: 7, sharedHosting: 5,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  gemini: {
    cloudManaged: 10, cloudIaas: 8, edge: 7, onPremise: 3, serverless: 10, vps: 7, sharedHosting: 5,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  socketio: {
    cloudManaged: 8, cloudIaas: 10, edge: 3, onPremise: 10, serverless: 2, vps: 10, sharedHosting: 2,
    minMemoryMb: 64, cpuIntensity: 'low', diskFootprintMb: 20,
    startupTimeMs: 200,
  },
  sentry: {
    cloudManaged: 10, cloudIaas: 9, edge: 8, onPremise: 7, serverless: 9, vps: 8, sharedHosting: 5,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  stripe: {
    cloudManaged: 10, cloudIaas: 10, edge: 8, onPremise: 6, serverless: 10, vps: 9, sharedHosting: 7,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  vitest: {
    cloudManaged: 10, cloudIaas: 10, edge: 5, onPremise: 10, serverless: 5, vps: 10, sharedHosting: 3,
    minMemoryMb: 128, cpuIntensity: 'medium', diskFootprintMb: 50,
  },
  playwright: {
    cloudManaged: 9, cloudIaas: 10, edge: 2, onPremise: 10, serverless: 2, vps: 8, sharedHosting: 1,
    minMemoryMb: 512, cpuIntensity: 'high', diskFootprintMb: 300,
  },
  rabbitmq: {
    cloudManaged: 9, cloudIaas: 10, edge: 1, onPremise: 10, serverless: 2, vps: 7, sharedHosting: 1,
    minMemoryMb: 128, cpuIntensity: 'low', diskFootprintMb: 100,
    startupTimeMs: 3000,
  },
  kafka: {
    cloudManaged: 8, cloudIaas: 10, edge: 1, onPremise: 10, serverless: 2, vps: 4, sharedHosting: 1,
    minMemoryMb: 1024, cpuIntensity: 'high', diskFootprintMb: 500,
    startupTimeMs: 8000,
  },
  prisma: {
    cloudManaged: 9, cloudIaas: 10, edge: 6, onPremise: 9, serverless: 7, vps: 9, sharedHosting: 4,
    minMemoryMb: 64, cpuIntensity: 'low', diskFootprintMb: 50,
    coldStartMs: 1000,
  },
  drizzle: {
    cloudManaged: 10, cloudIaas: 10, edge: 9, onPremise: 9, serverless: 10, vps: 10, sharedHosting: 5,
    minMemoryMb: 16, cpuIntensity: 'low', diskFootprintMb: 10,
    coldStartMs: 100,
  },
  docker: {
    cloudManaged: 9, cloudIaas: 10, edge: 3, onPremise: 10, serverless: 3, vps: 10, sharedHosting: 1,
    minMemoryMb: 256, cpuIntensity: 'medium', diskFootprintMb: 500,
  },
  kubernetes: {
    cloudManaged: 9, cloudIaas: 10, edge: 2, onPremise: 10, serverless: 1, vps: 3, sharedHosting: 1,
    minMemoryMb: 2048, cpuIntensity: 'high', diskFootprintMb: 2000,
  },
  cloudflare_r2: {
    cloudManaged: 10, cloudIaas: 5, edge: 10, onPremise: 1, serverless: 10, vps: 5, sharedHosting: 3,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
  aws_s3: {
    cloudManaged: 10, cloudIaas: 10, edge: 7, onPremise: 2, serverless: 10, vps: 6, sharedHosting: 3,
    minMemoryMb: 0, cpuIntensity: 'low', diskFootprintMb: 0,
  },
};

// Default envFit for technologies not in the map
export const defaultEnvFit: TechEnvironmentFit = {
  cloudManaged: 7, cloudIaas: 7, edge: 5, onPremise: 7, serverless: 5, vps: 7, sharedHosting: 4,
  minMemoryMb: 128, cpuIntensity: 'medium', diskFootprintMb: 100,
};

export function getEnvFit(techId: string): TechEnvironmentFit {
  return envFitData[techId] || defaultEnvFit;
}
