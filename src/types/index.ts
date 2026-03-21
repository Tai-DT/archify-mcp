// ============================================================
// Archify MCP - Type Definitions
// ============================================================

// ---- Project Analysis Types ----

export type ProjectType =
  | 'ecommerce'
  | 'saas'
  | 'social_network'
  | 'marketplace'
  | 'content_platform'
  | 'fintech'
  | 'healthtech'
  | 'edtech'
  | 'iot'
  | 'ai_ml'
  | 'gaming'
  | 'enterprise'
  | 'mobile_app'
  | 'api_service'
  | 'devtool'
  | 'other';

export type ProjectScale = 'mvp' | 'startup' | 'growth' | 'enterprise';

export type BudgetRange = 'bootstrap' | 'seed' | 'series_a' | 'enterprise';

export type Priority = 'must_have' | 'should_have' | 'could_have' | 'wont_have';

// ---- Environment & Device Context ----

export type DeploymentEnv =
  | 'cloud_managed'       // Vercel, Netlify, Railway, Render
  | 'cloud_iaas'          // AWS EC2, GCP GCE, Azure VM
  | 'edge'                // Cloudflare Workers, Deno Deploy
  | 'on_premise'          // Self-hosted servers
  | 'hybrid'              // Mix of cloud + on-premise
  | 'serverless'          // AWS Lambda, Cloud Functions
  | 'vps'                 // DigitalOcean, Linode, Hetzner
  | 'shared_hosting';     // CPanel, shared servers

export type TargetDevice =
  | 'high_end_desktop'    // Modern dev machines, workstations
  | 'standard_desktop'    // Average office/home computers
  | 'low_end_desktop'     // Old PCs, Chromebooks
  | 'high_end_mobile'     // iPhone 15+, Galaxy S24+
  | 'mid_range_mobile'    // Average smartphones
  | 'low_end_mobile'      // Budget phones, emerging markets
  | 'tablet'
  | 'smart_tv'
  | 'iot_device'          // Raspberry Pi, ESP32, sensors
  | 'wearable'            // Smartwatches, bands
  | 'kiosk';              // POS terminals, info kiosks

export type NetworkCondition =
  | 'fiber'               // High-speed stable connection
  | 'broadband'           // Standard home/office
  | 'mobile_4g'           // Good mobile coverage
  | 'mobile_3g'           // Slow mobile, emerging markets
  | 'offline_first'       // Must work without internet
  | 'intermittent'        // Unstable connection (rural, IoT)
  | 'satellite';          // High latency (> 500ms)

export interface PerformanceRequirements {
  maxResponseTimeMs?: number;         // e.g., 200ms for real-time, 2000ms for content
  concurrentUsers?: number;           // Expected simultaneous users
  requestsPerSecond?: number;         // Target RPS
  availabilitySla?: number;           // e.g., 99.9, 99.99
  maxBundleSizeKb?: number;           // Frontend bundle size limit
  maxMemoryMb?: number;               // Server memory constraint
  coldStartToleranceMs?: number;      // Acceptable cold start (serverless)
}

export interface InfrastructureConstraints {
  maxServerRamGb?: number;            // e.g., 1GB for small VPS
  maxServerCpuCores?: number;         // e.g., 1 core for budget VPS
  maxStorageGb?: number;              // Available disk space
  maxMonthlyCostUsd?: number;         // Hard budget cap
  requiresDocker?: boolean;           // Can run containers?
  requiresSsl?: boolean;              // SSL/TLS needed?
  hasGpuAccess?: boolean;             // GPU available for AI/ML?
  region?: string;                    // Deployment region (e.g., 'asia-southeast1')
  complianceReqs?: string[];          // GDPR, HIPAA, PCI-DSS, SOC2
}

export interface EnvironmentContext {
  deploymentEnv: DeploymentEnv;
  targetDevices: TargetDevice[];
  networkCondition: NetworkCondition;
  performance?: PerformanceRequirements;
  infrastructure?: InfrastructureConstraints;
}

export interface ProjectInput {
  name: string;
  description: string;
  targetAudience?: string;
  projectType?: ProjectType;
  scale?: ProjectScale;
  budget?: BudgetRange;
  timeline?: string;
  teamSize?: number;
  existingStack?: string[];
  constraints?: string[];
  preferences?: string[];
  environment?: EnvironmentContext;
}

export interface ProjectAnalysis {
  summary: string;
  projectType: ProjectType;
  scale: ProjectScale;
  coreFeatures: FeatureGroup[];
  targetAudience: AudienceAnalysis;
  marketInsights: MarketInsight[];
  technicalRequirements: TechnicalRequirement[];
  risks: Risk[];
  mvpScope: MvpScope;
  environmentAnalysis?: EnvironmentAnalysis;
}

export interface EnvironmentAnalysis {
  deploymentRecommendation: string;
  deviceOptimizations: string[];
  networkStrategy: string;
  performanceTargets: string[];
  infraWarnings: string[];
}

export interface AudienceAnalysis {
  primary: string;
  secondary: string;
  demographics: string[];
  painPoints: string[];
  expectedBehaviors: string[];
}

export interface MarketInsight {
  category: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
}

export interface Risk {
  category: 'technical' | 'market' | 'resource' | 'timeline' | 'security';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface MvpScope {
  estimatedWeeks: number;
  coreFeatures: string[];
  deferredFeatures: string[];
  criticalPath: string[];
}

// ---- Technology Types ----

export type TechCategory =
  | 'frontend_framework'
  | 'frontend_ui'
  | 'backend_framework'
  | 'backend_runtime'
  | 'database_relational'
  | 'database_nosql'
  | 'database_graph'
  | 'database_vector'
  | 'cache'
  | 'search'
  | 'message_queue'
  | 'auth'
  | 'storage'
  | 'cdn'
  | 'cloud'
  | 'container'
  | 'ci_cd'
  | 'monitoring'
  | 'testing'
  | 'ai_ml'
  | 'mobile'
  | 'realtime'
  | 'api_gateway'
  | 'payment'
  | 'cms'
  | 'email'
  | 'analytics'
  | 'devops'
  | 'cloud_platform'
  | 'notification';

export type TechDeploymentModel = 'module' | 'standard' | 'hybrid';

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  description: string;
  website?: string;
  scores: TechScores;
  bestFor: string[];
  notIdealFor: string[];
  ecosystem: string[];
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
  maturity: 'emerging' | 'growing' | 'mature' | 'legacy';
  communitySize: 'small' | 'medium' | 'large' | 'massive';
  learningCurve: 'easy' | 'moderate' | 'steep' | 'expert';
  tags: string[];
  // Deployment model: module (SaaS/SDK/BaaS - plug & play) vs standard (library/framework - self-build)
  deploymentModel?: TechDeploymentModel;
  // Environment fit scores (added for deployment/device awareness)
  envFit?: TechEnvironmentFit;
}

export interface TechEnvironmentFit {
  // Deployment environment compatibility (1-10)
  cloudManaged: number;
  cloudIaas: number;
  edge: number;
  onPremise: number;
  serverless: number;
  vps: number;
  sharedHosting: number;
  // Resource footprint
  minMemoryMb: number;          // Minimum RAM needed to run
  cpuIntensity: 'low' | 'medium' | 'high';  // CPU usage profile
  diskFootprintMb: number;      // Install/build size
  // Client-side specifics (for frontend/mobile)
  bundleSizeKb?: number;        // Typical bundle size
  supportsOffline?: boolean;
  lowEndDeviceScore?: number;   // How well it runs on weak devices (1-10)
  // Cold start & latency
  coldStartMs?: number;         // Avg cold start time (serverless)
  startupTimeMs?: number;       // Time to boot (server)
}

export interface TechScores {
  performance: number;       // 1-10
  scalability: number;       // 1-10
  developerExperience: number; // 1-10
  ecosystem: number;         // 1-10
  security: number;          // 1-10
  costEfficiency: number;    // 1-10
  documentation: number;     // 1-10
  communitySupport: number;  // 1-10
}

export interface TechRecommendation {
  technology: Technology;
  score: number;
  reasoning: string;
  alternatives: { tech: Technology; reason: string }[];
}

export interface StackRecommendation {
  frontend?: TechRecommendation;
  frontendUI?: TechRecommendation;
  backend?: TechRecommendation;
  database?: TechRecommendation;
  cache?: TechRecommendation;
  search?: TechRecommendation;
  auth?: TechRecommendation;
  storage?: TechRecommendation;
  cloud?: TechRecommendation;
  cicd?: TechRecommendation;
  monitoring?: TechRecommendation;
  messaging?: TechRecommendation;
  mobile?: TechRecommendation;
  realtime?: TechRecommendation;
  payment?: TechRecommendation;
  additionalTools: TechRecommendation[];
  reasoning: string;
  architectureNotes: string;
}

// Dual Stack: Module (plug-in) vs Standard (self-build)
export interface DualStackRecommendation {
  module: StackRecommendation;    // SaaS/SDK/BaaS — plug & play, nhanh
  standard: StackRecommendation;  // Library/Framework — tự build, kiểm soát
  comparison: DualStackComparison;
}

export interface DualStackComparison {
  moduleAdvantages: string[];
  standardAdvantages: string[];
  costDifference: { module: string; standard: string };
  timeDifference: { module: string; standard: string };
  recommendation: 'module' | 'standard' | 'hybrid';
  reasoning: string;
}

// ---- Feature Types ----

export interface Feature {
  name: string;
  description: string;
  priority: Priority;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  estimatedDays: number;
  techRequirements: string[];
  dependencies: string[];
  category: string;
}

export interface FeatureGroup {
  name: string;
  features: Feature[];
}

export interface FeatureSuggestion {
  mustHave: Feature[];
  shouldHave: Feature[];
  couldHave: Feature[];
  innovative: Feature[];
}

// ---- Architecture Types ----

export type ArchitecturePattern =
  | 'monolith'
  | 'modular_monolith'
  | 'microservices'
  | 'serverless'
  | 'event_driven'
  | 'cqrs'
  | 'hexagonal'
  | 'clean_architecture'
  | 'micro_frontend'
  | 'jamstack'
  | 'bff';

export interface ArchitectureDesign {
  pattern: ArchitecturePattern;
  reasoning: string;
  diagram: string; // Mermaid diagram
  components: ArchComponent[];
  dataFlow: string; // Mermaid sequence diagram
  deploymentStrategy: DeploymentStrategy;
  scalingStrategy: ScalingStrategy;
}

export interface ArchComponent {
  name: string;
  type: string;
  technology: string;
  responsibilities: string[];
  communicatesWith: string[];
}

export interface DeploymentStrategy {
  type: 'single_server' | 'multi_region' | 'edge' | 'hybrid';
  description: string;
  infrastructure: string[];
  estimatedMonthlyCost: string;
}

export interface ScalingStrategy {
  horizontal: boolean;
  vertical: boolean;
  autoScale: boolean;
  caching: string[];
  loadBalancing: string;
  description: string;
}

// ---- Estimation Types ----

export interface ProjectEstimation {
  totalWeeks: number;
  totalDays: number;
  phases: EstimationPhase[];
  teamComposition: TeamRole[];
  complexityScore: number; // 1-10
  riskFactor: number; // multiplier 1.0-2.0
  costEstimate: CostEstimate;
}

export interface EstimationPhase {
  name: string;
  weeks: number;
  tasks: string[];
  deliverables: string[];
  dependencies: string[];
}

export interface TeamRole {
  role: string;
  count: number;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
  allocation: number; // percentage
}

export interface CostEstimate {
  development: string;
  infrastructure: string;
  thirdPartyServices: string;
  total: string;
  monthlyRunning: string;
}

// ---- Roadmap Types ----

export interface Roadmap {
  phases: RoadmapPhase[];
  milestones: Milestone[];
  totalDuration: string;
  criticalPath: string[];
}

export interface RoadmapPhase {
  name: string;
  duration: string;
  goals: string[];
  features: string[];
  deliverables: string[];
  teamFocus: string[];
  risks: string[];
}

export interface Milestone {
  name: string;
  targetDate: string;
  criteria: string[];
  phase: string;
}

// ---- Comparison Types ----

export interface TechComparison {
  technologies: Technology[];
  criteria: ComparisonCriteria[];
  winner: { techId: string; reason: string };
  summary: string;
  table: string; // Markdown table
}

export interface ComparisonCriteria {
  name: string;
  weight: number;
  scores: { techId: string; score: number; note: string }[];
}

// ---- Technical Requirements ----

export interface TechnicalRequirement {
  category: string;
  requirement: string;
  priority: Priority;
  impliedTech: string[];
}
