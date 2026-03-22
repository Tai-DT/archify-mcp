import type { Technology } from '../types/index.js';

export const technologies: Technology[] = [
  // ============ FRONTEND FRAMEWORKS ============
  {
    id: 'react', name: 'React', category: 'frontend_framework',
    description: 'Component-based UI library by Meta with massive ecosystem',
    scores: { performance: 8, scalability: 9, developerExperience: 9, ecosystem: 10, security: 8, costEfficiency: 10, documentation: 9, communitySupport: 10 },
    bestFor: ['SPA', 'complex UIs', 'large teams', 'mobile (React Native)'],
    notIdealFor: ['simple static sites', 'SEO-critical without SSR'],
    ecosystem: ['Next.js', 'Remix', 'React Native', 'Redux', 'TanStack Query'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['spa', 'ssr', 'mobile']
  },
  {
    id: 'nextjs', name: 'Next.js', category: 'frontend_framework',
    description: 'Full-stack React framework with SSR, SSG, and API routes',
    scores: { performance: 9, scalability: 9, developerExperience: 9, ecosystem: 9, security: 8, costEfficiency: 9, documentation: 9, communitySupport: 9 },
    bestFor: ['full-stack apps', 'SSR/SSG', 'SEO', 'e-commerce'],
    notIdealFor: ['simple SPAs', 'real-time heavy apps'],
    ecosystem: ['Vercel', 'React', 'Prisma', 'tRPC'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['fullstack', 'ssr', 'seo']
  },
  {
    id: 'vue', name: 'Vue.js', category: 'frontend_framework',
    description: 'Progressive framework with gentle learning curve',
    scores: { performance: 9, scalability: 8, developerExperience: 9, ecosystem: 8, security: 8, costEfficiency: 10, documentation: 9, communitySupport: 8 },
    bestFor: ['small-medium apps', 'rapid prototyping', 'junior teams'],
    notIdealFor: ['very large enterprise apps', 'mobile native'],
    ecosystem: ['Nuxt', 'Vuetify', 'Pinia', 'VueUse'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['spa', 'progressive']
  },
  {
    id: 'angular', name: 'Angular', category: 'frontend_framework',
    description: 'Enterprise-grade framework by Google with full tooling',
    scores: { performance: 8, scalability: 10, developerExperience: 7, ecosystem: 8, security: 9, costEfficiency: 8, documentation: 9, communitySupport: 8 },
    bestFor: ['enterprise apps', 'large teams', 'complex forms', 'TypeScript-first'],
    notIdealFor: ['small projects', 'rapid prototyping', 'startups'],
    ecosystem: ['Angular Material', 'NgRx', 'RxJS', 'Nx'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'steep', tags: ['enterprise', 'typescript']
  },
  {
    id: 'svelte', name: 'Svelte/SvelteKit', category: 'frontend_framework',
    description: 'Compile-time framework with minimal runtime overhead',
    scores: { performance: 10, scalability: 7, developerExperience: 9, ecosystem: 6, security: 8, costEfficiency: 10, documentation: 8, communitySupport: 6 },
    bestFor: ['performance-critical', 'small teams', 'interactive UIs'],
    notIdealFor: ['large enterprise', 'finding developers easily'],
    ecosystem: ['SvelteKit', 'Svelte Stores', 'Skeleton UI'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['performance', 'compiler']
  },

  // ============ FRONTEND UI ============
  {
    id: 'tailwindcss', name: 'Tailwind CSS', category: 'frontend_ui',
    description: 'Utility-first CSS framework for rapid UI development',
    scores: { performance: 9, scalability: 9, developerExperience: 9, ecosystem: 9, security: 10, costEfficiency: 10, documentation: 10, communitySupport: 9 },
    bestFor: ['rapid UI development', 'custom designs', 'consistent styling'],
    notIdealFor: ['designers who prefer traditional CSS'],
    ecosystem: ['Headless UI', 'DaisyUI', 'shadcn/ui'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['css', 'utility']
  },
  {
    id: 'shadcn', name: 'shadcn/ui', category: 'frontend_ui',
    description: 'Copy-paste accessible UI components built on Radix + Tailwind',
    scores: { performance: 9, scalability: 8, developerExperience: 10, ecosystem: 8, security: 9, costEfficiency: 10, documentation: 9, communitySupport: 8 },
    bestFor: ['React apps', 'accessible UIs', 'customizable components'],
    notIdealFor: ['non-React projects', 'quick prototypes needing pre-built theme'],
    ecosystem: ['Radix UI', 'Tailwind CSS', 'React'],
    pricing: 'free', maturity: 'growing', communitySize: 'large', learningCurve: 'easy', tags: ['components', 'accessible']
  },

  // ============ BACKEND FRAMEWORKS ============
  {
    id: 'nestjs', name: 'NestJS', category: 'backend_framework',
    description: 'Enterprise Node.js framework inspired by Angular with DI',
    scores: { performance: 8, scalability: 9, developerExperience: 9, ecosystem: 8, security: 9, costEfficiency: 9, documentation: 9, communitySupport: 8 },
    bestFor: ['enterprise APIs', 'microservices', 'TypeScript teams', 'complex backends'],
    notIdealFor: ['simple APIs', 'serverless-first', 'small projects'],
    ecosystem: ['TypeORM', 'Prisma', 'Passport', 'Bull'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['enterprise', 'typescript', 'di']
  },
  {
    id: 'express', name: 'Express.js', category: 'backend_framework',
    description: 'Minimal and flexible Node.js web framework',
    scores: { performance: 7, scalability: 7, developerExperience: 8, ecosystem: 10, security: 7, costEfficiency: 10, documentation: 8, communitySupport: 10 },
    bestFor: ['REST APIs', 'prototyping', 'small-medium apps'],
    notIdealFor: ['enterprise apps needing structure', 'high performance'],
    ecosystem: ['Passport', 'Multer', 'Helmet', 'Morgan'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['minimalist', 'flexible']
  },
  {
    id: 'fastapi', name: 'FastAPI', category: 'backend_framework',
    description: 'Modern Python framework with auto-generated docs and type hints',
    scores: { performance: 9, scalability: 8, developerExperience: 10, ecosystem: 7, security: 8, costEfficiency: 10, documentation: 10, communitySupport: 8 },
    bestFor: ['AI/ML APIs', 'data-heavy apps', 'auto-docs', 'Python teams'],
    notIdealFor: ['real-time apps', 'frontend-heavy full-stack'],
    ecosystem: ['Pydantic', 'SQLAlchemy', 'Celery', 'Uvicorn'],
    pricing: 'free', maturity: 'growing', communitySize: 'large', learningCurve: 'easy', tags: ['python', 'async', 'openapi']
  },
  {
    id: 'django', name: 'Django', category: 'backend_framework',
    description: 'Batteries-included Python framework for rapid development',
    scores: { performance: 7, scalability: 8, developerExperience: 8, ecosystem: 9, security: 9, costEfficiency: 10, documentation: 10, communitySupport: 9 },
    bestFor: ['content platforms', 'admin-heavy apps', 'rapid development'],
    notIdealFor: ['microservices', 'real-time', 'lightweight APIs'],
    ecosystem: ['Django REST', 'Celery', 'Django Channels', 'Wagtail'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['python', 'batteries-included']
  },
  {
    id: 'go_gin', name: 'Go (Gin)', category: 'backend_framework',
    description: 'High-performance HTTP framework for Go',
    scores: { performance: 10, scalability: 10, developerExperience: 7, ecosystem: 7, security: 9, costEfficiency: 10, documentation: 7, communitySupport: 7 },
    bestFor: ['high-performance APIs', 'microservices', 'concurrent workloads'],
    notIdealFor: ['rapid prototyping', 'small web apps', 'junior teams'],
    ecosystem: ['GORM', 'Viper', 'Swagger', 'Wire'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['performance', 'concurrency']
  },
  {
    id: 'laravel', name: 'Laravel', category: 'backend_framework',
    description: 'Elegant PHP framework with rich feature set',
    scores: { performance: 7, scalability: 7, developerExperience: 9, ecosystem: 9, security: 8, costEfficiency: 9, documentation: 10, communitySupport: 9 },
    bestFor: ['web apps', 'e-commerce', 'CMS', 'rapid development'],
    notIdealFor: ['high-performance APIs', 'microservices', 'AI/ML'],
    ecosystem: ['Livewire', 'Inertia', 'Forge', 'Vapor'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['php', 'fullstack']
  },
  {
    id: 'spring_boot', name: 'Spring Boot', category: 'backend_framework',
    description: 'Enterprise Java/Kotlin framework with comprehensive ecosystem',
    scores: { performance: 9, scalability: 10, developerExperience: 6, ecosystem: 9, security: 10, costEfficiency: 6, documentation: 9, communitySupport: 9 },
    bestFor: ['enterprise apps', 'fintech', 'large teams', 'microservices'],
    notIdealFor: ['small projects', 'startups', 'rapid prototyping'],
    ecosystem: ['Spring Cloud', 'Spring Security', 'Hibernate', 'Kafka'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'steep', tags: ['java', 'enterprise', 'kotlin']
  },
  {
    id: 'hono', name: 'Hono', category: 'backend_framework',
    description: 'Ultra-fast web framework for edge computing',
    scores: { performance: 10, scalability: 9, developerExperience: 9, ecosystem: 6, security: 8, costEfficiency: 10, documentation: 8, communitySupport: 6 },
    bestFor: ['edge functions', 'serverless', 'Cloudflare Workers', 'lightweight APIs'],
    notIdealFor: ['complex enterprise', 'large monoliths'],
    ecosystem: ['Cloudflare Workers', 'Deno', 'Bun'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['edge', 'serverless', 'fast']
  },

  // ============ DATABASES ============
  {
    id: 'postgresql', name: 'PostgreSQL', category: 'database_relational',
    description: 'Advanced open-source relational database with JSON support',
    scores: { performance: 9, scalability: 8, developerExperience: 8, ecosystem: 9, security: 9, costEfficiency: 10, documentation: 9, communitySupport: 9 },
    bestFor: ['most applications', 'complex queries', 'JSONB data', 'GIS'],
    notIdealFor: ['ultra-simple key-value', 'massive write-heavy workloads'],
    ecosystem: ['pgvector', 'PostGIS', 'Citus', 'TimescaleDB'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['sql', 'json', 'reliable']
  },
  {
    id: 'mysql', name: 'MySQL', category: 'database_relational',
    description: 'Popular relational database, great for web applications',
    scores: { performance: 8, scalability: 8, developerExperience: 8, ecosystem: 9, security: 8, costEfficiency: 10, documentation: 9, communitySupport: 9 },
    bestFor: ['web applications', 'read-heavy workloads', 'WordPress/PHP'],
    notIdealFor: ['complex queries', 'JSON-heavy', 'advanced features'],
    ecosystem: ['PlanetScale', 'Vitess', 'ProxySQL'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['sql', 'web']
  },
  {
    id: 'mongodb', name: 'MongoDB', category: 'database_nosql',
    description: 'Document database for flexible schema applications',
    scores: { performance: 8, scalability: 9, developerExperience: 8, ecosystem: 8, security: 7, costEfficiency: 7, documentation: 8, communitySupport: 8 },
    bestFor: ['flexible schemas', 'document storage', 'rapid prototyping', 'content management'],
    notIdealFor: ['complex relationships', 'transactions-heavy', 'strict consistency'],
    ecosystem: ['Mongoose', 'Atlas', 'Realm', 'Charts'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['nosql', 'document', 'flexible']
  },
  {
    id: 'redis', name: 'Redis', category: 'cache',
    description: 'In-memory data store for caching, sessions, and real-time',
    scores: { performance: 10, scalability: 9, developerExperience: 8, ecosystem: 9, security: 7, costEfficiency: 8, documentation: 8, communitySupport: 9 },
    bestFor: ['caching', 'sessions', 'real-time leaderboards', 'pub/sub', 'rate limiting'],
    notIdealFor: ['primary database', 'complex queries', 'large datasets'],
    ecosystem: ['Redis Stack', 'Redis Sentinel', 'Redis Cluster'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['cache', 'realtime', 'fast']
  },
  {
    id: 'supabase', name: 'Supabase', category: 'database_relational',
    description: 'Open-source Firebase alternative with PostgreSQL, Auth, Storage',
    scores: { performance: 8, scalability: 7, developerExperience: 10, ecosystem: 8, security: 8, costEfficiency: 9, documentation: 9, communitySupport: 8 },
    bestFor: ['rapid development', 'real-time apps', 'auth + DB combo', 'startups'],
    notIdealFor: ['complex enterprise', 'custom infrastructure'],
    ecosystem: ['PostgreSQL', 'PostgREST', 'GoTrue', 'Realtime'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'large', learningCurve: 'easy', tags: ['baas', 'realtime', 'auth']
  },
  {
    id: 'firebase', name: 'Firebase', category: 'database_nosql',
    description: 'Google BaaS with real-time DB, auth, hosting, and more',
    scores: { performance: 8, scalability: 9, developerExperience: 9, ecosystem: 9, security: 8, costEfficiency: 7, documentation: 9, communitySupport: 9 },
    bestFor: ['mobile apps', 'real-time', 'rapid prototyping', 'serverless'],
    notIdealFor: ['complex queries', 'cost-sensitive at scale', 'vendor-lock concerns'],
    ecosystem: ['Firestore', 'Cloud Functions', 'Auth', 'Analytics'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['baas', 'google', 'mobile']
  },
  {
    id: 'neon', name: 'Neon', category: 'database_relational',
    description: 'Serverless PostgreSQL with branching and autoscaling',
    scores: { performance: 8, scalability: 8, developerExperience: 10, ecosystem: 7, security: 8, costEfficiency: 9, documentation: 8, communitySupport: 6 },
    bestFor: ['serverless apps', 'dev/staging branches', 'Next.js apps'],
    notIdealFor: ['on-premise', 'legacy systems'],
    ecosystem: ['PostgreSQL', 'Prisma', 'Drizzle'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['serverless', 'postgresql', 'branching']
  },

  // ============ SEARCH ============
  {
    id: 'elasticsearch', name: 'Elasticsearch', category: 'search',
    description: 'Distributed search and analytics engine',
    scores: { performance: 9, scalability: 9, developerExperience: 7, ecosystem: 9, security: 8, costEfficiency: 6, documentation: 8, communitySupport: 8 },
    bestFor: ['full-text search', 'log analytics', 'large datasets'],
    notIdealFor: ['simple apps', 'tight budgets', 'primary database'],
    ecosystem: ['Kibana', 'Logstash', 'Beats'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'steep', tags: ['search', 'analytics']
  },
  {
    id: 'meilisearch', name: 'Meilisearch', category: 'search',
    description: 'Lightning-fast, typo-tolerant search engine',
    scores: { performance: 9, scalability: 7, developerExperience: 10, ecosystem: 6, security: 7, costEfficiency: 9, documentation: 9, communitySupport: 7 },
    bestFor: ['e-commerce search', 'instant search', 'small-medium datasets'],
    notIdealFor: ['massive datasets', 'complex analytics'],
    ecosystem: ['Meilisearch Cloud', 'SDKs'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['search', 'instant', 'typo-tolerant']
  },

  // ============ AUTH ============
  {
    id: 'clerk', name: 'Clerk', category: 'auth',
    description: 'Drop-in auth with beautiful pre-built components',
    scores: { performance: 9, scalability: 9, developerExperience: 10, ecosystem: 8, security: 9, costEfficiency: 7, documentation: 10, communitySupport: 8 },
    bestFor: ['SaaS apps', 'Next.js', 'rapid auth setup'],
    notIdealFor: ['budget-constrained', 'self-hosted', 'custom auth flows'],
    ecosystem: ['Next.js', 'React', 'Remix'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['auth', 'saas']
  },
  {
    id: 'auth0', name: 'Auth0', category: 'auth',
    description: 'Enterprise identity platform with extensive integrations',
    scores: { performance: 8, scalability: 10, developerExperience: 8, ecosystem: 9, security: 10, costEfficiency: 6, documentation: 9, communitySupport: 8 },
    bestFor: ['enterprise', 'SSO', 'multi-tenant', 'B2B'],
    notIdealFor: ['small projects', 'cost-sensitive', 'simple auth'],
    ecosystem: ['Universal Login', 'Actions', 'Organizations'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['enterprise', 'sso', 'identity']
  },

  // ============ CLOUD ============
  {
    id: 'vercel', name: 'Vercel', category: 'cloud',
    description: 'Frontend cloud platform optimized for Next.js',
    scores: { performance: 9, scalability: 9, developerExperience: 10, ecosystem: 8, security: 8, costEfficiency: 7, documentation: 9, communitySupport: 9 },
    bestFor: ['Next.js', 'Jamstack', 'frontend deployment', 'preview deployments'],
    notIdealFor: ['backend-heavy', 'long-running processes', 'cost at scale'],
    ecosystem: ['Next.js', 'Turborepo', 'Edge Functions'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['deployment', 'edge', 'frontend']
  },
  {
    id: 'aws', name: 'AWS', category: 'cloud',
    description: 'Most comprehensive cloud platform with 200+ services',
    scores: { performance: 10, scalability: 10, developerExperience: 6, ecosystem: 10, security: 10, costEfficiency: 7, documentation: 8, communitySupport: 10 },
    bestFor: ['enterprise', 'any scale', 'complex infrastructure', 'compliance'],
    notIdealFor: ['simple apps', 'beginners', 'cost-sensitive startups'],
    ecosystem: ['Lambda', 'EC2', 'S3', 'RDS', 'ECS', 'CloudFront'],
    pricing: 'paid', maturity: 'mature', communitySize: 'massive', learningCurve: 'steep', tags: ['cloud', 'enterprise', 'comprehensive']
  },
  {
    id: 'cloudflare', name: 'Cloudflare', category: 'cloud',
    description: 'Edge platform with Workers, Pages, R2, D1, and more',
    scores: { performance: 10, scalability: 10, developerExperience: 9, ecosystem: 8, security: 10, costEfficiency: 9, documentation: 8, communitySupport: 8 },
    bestFor: ['edge computing', 'global apps', 'cost-efficient', 'static sites'],
    notIdealFor: ['complex backends', 'long-running processes', 'heavy compute'],
    ecosystem: ['Workers', 'Pages', 'R2', 'D1', 'KV', 'Durable Objects'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['edge', 'cdn', 'security']
  },

  // ============ CI/CD ============
  {
    id: 'github_actions', name: 'GitHub Actions', category: 'ci_cd',
    description: 'CI/CD integrated directly into GitHub',
    scores: { performance: 8, scalability: 9, developerExperience: 9, ecosystem: 9, security: 8, costEfficiency: 8, documentation: 9, communitySupport: 9 },
    bestFor: ['GitHub repos', 'most projects', 'community actions'],
    notIdealFor: ['non-GitHub repos', 'complex pipelines', 'self-hosted preference'],
    ecosystem: ['GitHub Marketplace', 'Reusable Workflows'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['ci', 'github', 'automation']
  },

  // ============ AI/ML ============
  // (Main AI/ML section is below with more detailed entries)

  // ============ MOBILE ============
  {
    id: 'react_native', name: 'React Native', category: 'mobile',
    description: 'Cross-platform mobile with React, backed by Meta',
    scores: { performance: 7, scalability: 8, developerExperience: 8, ecosystem: 9, security: 7, costEfficiency: 9, documentation: 8, communitySupport: 9 },
    bestFor: ['cross-platform', 'React teams', 'code sharing with web'],
    notIdealFor: ['heavy animations', 'platform-specific UX', 'gaming'],
    ecosystem: ['Expo', 'React Navigation', 'Reanimated', 'NativeWind'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['mobile', 'cross-platform', 'react']
  },
  {
    id: 'flutter', name: 'Flutter', category: 'mobile',
    description: 'Google cross-platform framework with custom rendering',
    scores: { performance: 9, scalability: 8, developerExperience: 8, ecosystem: 8, security: 8, costEfficiency: 9, documentation: 9, communitySupport: 8 },
    bestFor: ['beautiful UIs', 'cross-platform (mobile+web+desktop)', 'custom designs'],
    notIdealFor: ['web-first teams', 'existing JS ecosystem', 'large app size concerns'],
    ecosystem: ['Dart', 'Firebase', 'Riverpod', 'GetX'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['mobile', 'cross-platform', 'dart']
  },

  // ============ REALTIME ============
  {
    id: 'socketio', name: 'Socket.IO', category: 'realtime',
    description: 'Real-time bidirectional event-based communication',
    scores: { performance: 7, scalability: 6, developerExperience: 9, ecosystem: 8, security: 6, costEfficiency: 10, documentation: 8, communitySupport: 8 },
    bestFor: ['chat apps', 'live updates', 'collaborative tools', 'gaming'],
    notIdealFor: ['simple SSE suffices', 'massive scale without infra'],
    ecosystem: ['Redis adapter', 'Admin UI'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['websocket', 'realtime', 'events']
  },

  // ============ MONITORING ============
  {
    id: 'sentry', name: 'Sentry', category: 'monitoring',
    description: 'Application monitoring and error tracking platform',
    scores: { performance: 9, scalability: 9, developerExperience: 9, ecosystem: 9, security: 8, costEfficiency: 7, documentation: 9, communitySupport: 8 },
    bestFor: ['error tracking', 'performance monitoring', 'most tech stacks'],
    notIdealFor: ['infrastructure monitoring', 'tight budgets'],
    ecosystem: ['SDKs for 100+ platforms', 'GitHub integration'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['monitoring', 'errors', 'performance']
  },

  // ============ PAYMENT ============
  {
    id: 'stripe', name: 'Stripe', category: 'payment',
    description: 'Developer-first payment processing platform',
    scores: { performance: 9, scalability: 10, developerExperience: 10, ecosystem: 10, security: 10, costEfficiency: 7, documentation: 10, communitySupport: 9 },
    bestFor: ['SaaS subscriptions', 'e-commerce', 'marketplace payments'],
    notIdealFor: ['countries with limited support', 'very low margins'],
    ecosystem: ['Stripe Elements', 'Billing', 'Connect', 'Checkout'],
    pricing: 'paid', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['payment', 'subscription', 'commerce']
  },

  // ============ TESTING ============
  // (Main Testing section is below with more detailed entries)

  // ============ MESSAGE QUEUE ============
  {
    id: 'rabbitmq', name: 'RabbitMQ', category: 'message_queue',
    description: 'Reliable message broker with multiple protocols',
    scores: { performance: 8, scalability: 8, developerExperience: 7, ecosystem: 8, security: 8, costEfficiency: 9, documentation: 8, communitySupport: 8 },
    bestFor: ['task queues', 'microservices communication', 'reliable messaging'],
    notIdealFor: ['event streaming', 'simple pub/sub'],
    ecosystem: ['AMQP', 'STOMP', 'MQTT'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['messaging', 'queue', 'reliable']
  },
  {
    id: 'kafka', name: 'Apache Kafka', category: 'message_queue',
    description: 'Distributed event streaming platform for high-throughput',
    scores: { performance: 10, scalability: 10, developerExperience: 5, ecosystem: 9, security: 8, costEfficiency: 6, documentation: 7, communitySupport: 8 },
    bestFor: ['event streaming', 'log aggregation', 'high-throughput', 'data pipelines'],
    notIdealFor: ['simple apps', 'small teams', 'low-latency messaging'],
    ecosystem: ['Kafka Streams', 'Connect', 'Schema Registry', 'Confluent'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'expert', tags: ['streaming', 'events', 'distributed']
  },

  // ============ ORM / DATA ============
  {
    id: 'prisma', name: 'Prisma', category: 'orm',
    description: 'Next-generation Node.js ORM with type-safe queries',
    scores: { performance: 8, scalability: 8, developerExperience: 10, ecosystem: 8, security: 8, costEfficiency: 10, documentation: 10, communitySupport: 8 },
    bestFor: ['TypeScript projects', 'type-safe DB access', 'migrations'],
    notIdealFor: ['complex raw SQL', 'edge computing (improving)', 'non-Node.js'],
    ecosystem: ['Prisma Studio', 'Prisma Accelerate', 'Prisma Pulse'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['orm', 'typescript', 'migrations']
  },
  {
    id: 'drizzle', name: 'Drizzle ORM', category: 'orm',
    description: 'Lightweight TypeScript ORM with SQL-like syntax',
    scores: { performance: 9, scalability: 8, developerExperience: 9, ecosystem: 7, security: 8, costEfficiency: 10, documentation: 8, communitySupport: 7 },
    bestFor: ['edge computing', 'serverless', 'SQL-first approach', 'lightweight'],
    notIdealFor: ['complex relationships', 'teams preferring abstraction'],
    ecosystem: ['Drizzle Kit', 'Drizzle Studio'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'moderate', tags: ['orm', 'typescript', 'lightweight']
  },

  // ============ CONTAINER ============
  {
    id: 'docker', name: 'Docker', category: 'container',
    description: 'Container platform for consistent development and deployment',
    scores: { performance: 9, scalability: 9, developerExperience: 8, ecosystem: 10, security: 8, costEfficiency: 9, documentation: 9, communitySupport: 10 },
    bestFor: ['consistent environments', 'microservices', 'CI/CD', 'deployment'],
    notIdealFor: ['simple static sites', 'serverless-only'],
    ecosystem: ['Docker Compose', 'Docker Hub', 'BuildKit'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['container', 'devops', 'deployment']
  },
  {
    id: 'kubernetes', name: 'Kubernetes', category: 'container',
    description: 'Container orchestration platform for production workloads',
    scores: { performance: 9, scalability: 10, developerExperience: 5, ecosystem: 10, security: 9, costEfficiency: 6, documentation: 8, communitySupport: 9 },
    bestFor: ['large-scale deployments', 'microservices', 'multi-cloud', 'enterprise'],
    notIdealFor: ['small teams', 'simple apps', 'cost-sensitive'],
    ecosystem: ['Helm', 'Istio', 'ArgoCD', 'Prometheus'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'expert', tags: ['orchestration', 'enterprise', 'cloud-native']
  },

  // ============ STORAGE ============
  {
    id: 'cloudflare_r2', name: 'Cloudflare R2', category: 'storage',
    description: 'S3-compatible object storage with zero egress fees',
    scores: { performance: 9, scalability: 10, developerExperience: 8, ecosystem: 7, security: 9, costEfficiency: 10, documentation: 8, communitySupport: 7 },
    bestFor: ['file storage', 'media hosting', 'cost-efficient', 'CDN integration'],
    notIdealFor: ['complex data processing', 'legacy S3 tooling dependence'],
    ecosystem: ['Workers', 'S3 API compatible'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['storage', 'cdn', 'zero-egress']
  },
  {
    id: 'aws_s3', name: 'AWS S3', category: 'storage',
    description: 'Industry-standard object storage with 99.999999999% durability',
    scores: { performance: 9, scalability: 10, developerExperience: 7, ecosystem: 10, security: 10, costEfficiency: 7, documentation: 9, communitySupport: 10 },
    bestFor: ['any storage needs', 'enterprise', 'data lakes', 'backups'],
    notIdealFor: ['cost-sensitive egress', 'simple file serving'],
    ecosystem: ['CloudFront', 'Lambda', 'Glacier', 'Transfer Family'],
    pricing: 'paid', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['storage', 'aws', 'durable']
  },

  // ============ AI/ML ============
  {
    id: 'openai', name: 'OpenAI API', category: 'ai_ml',
    description: 'GPT-4, embeddings, chat completion, image generation — market leader',
    scores: { performance: 9, scalability: 10, developerExperience: 9, ecosystem: 10, security: 8, costEfficiency: 6, documentation: 9, communitySupport: 10 },
    bestFor: ['chatbots', 'content generation', 'code assistance', 'summarization'],
    notIdealFor: ['on-device AI', 'cost-sensitive high-volume', 'privacy-critical'],
    ecosystem: ['LangChain', 'LlamaIndex', 'Vercel AI SDK'],
    pricing: 'paid', maturity: 'mature', communitySize: 'massive', learningCurve: 'easy', tags: ['llm', 'chatbot', 'embeddings']
  },
  {
    id: 'gemini', name: 'Google Gemini', category: 'ai_ml',
    description: 'Google multimodal AI with generous free tier and long context',
    scores: { performance: 9, scalability: 10, developerExperience: 8, ecosystem: 8, security: 9, costEfficiency: 9, documentation: 8, communitySupport: 8 },
    bestFor: ['multimodal (text+image+video)', 'long context', 'cost-efficient AI', 'Google ecosystem'],
    notIdealFor: ['ultra-low latency', 'specialized fine-tuning'],
    ecosystem: ['Genkit', 'Google AI SDK', 'Vertex AI'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'large', learningCurve: 'easy', tags: ['llm', 'multimodal', 'free-tier']
  },
  {
    id: 'langchain', name: 'LangChain', category: 'ai_ml',
    description: 'Framework for building LLM-powered applications with chains and agents',
    scores: { performance: 7, scalability: 8, developerExperience: 7, ecosystem: 9, security: 7, costEfficiency: 10, documentation: 7, communitySupport: 9 },
    bestFor: ['RAG applications', 'AI agents', 'multi-step LLM workflows', 'chatbots'],
    notIdealFor: ['simple API calls', 'production stability priority', 'minimal dependencies'],
    ecosystem: ['LangSmith', 'LangGraph', 'LangServe'],
    pricing: 'free', maturity: 'growing', communitySize: 'large', learningCurve: 'moderate', tags: ['llm', 'rag', 'agents']
  },
  {
    id: 'pinecone', name: 'Pinecone', category: 'ai_ml',
    description: 'Managed vector database for similarity search and RAG',
    scores: { performance: 9, scalability: 10, developerExperience: 9, ecosystem: 8, security: 9, costEfficiency: 6, documentation: 9, communitySupport: 7 },
    bestFor: ['RAG', 'semantic search', 'recommendation systems', 'anomaly detection'],
    notIdealFor: ['small datasets', 'budget-constrained', 'relational queries'],
    ecosystem: ['LangChain', 'LlamaIndex', 'OpenAI'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['vector-db', 'rag', 'embeddings']
  },
  {
    id: 'huggingface', name: 'Hugging Face', category: 'ai_ml',
    description: 'Open-source ML platform with 300K+ models and datasets',
    scores: { performance: 8, scalability: 7, developerExperience: 8, ecosystem: 10, security: 7, costEfficiency: 9, documentation: 8, communitySupport: 10 },
    bestFor: ['custom models', 'NLP tasks', 'open-source AI', 'fine-tuning'],
    notIdealFor: ['turnkey solutions', 'no-ML-knowledge teams'],
    ecosystem: ['Transformers', 'Inference API', 'Spaces'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['ml', 'open-source', 'nlp']
  },

  // ============ CMS ============
  {
    id: 'strapi', name: 'Strapi', category: 'cms',
    description: 'Open-source headless CMS with REST & GraphQL API',
    scores: { performance: 7, scalability: 7, developerExperience: 9, ecosystem: 7, security: 7, costEfficiency: 10, documentation: 8, communitySupport: 7 },
    bestFor: ['content-heavy sites', 'blog platforms', 'e-commerce content', 'multi-language'],
    notIdealFor: ['real-time apps', 'high-traffic without caching'],
    ecosystem: ['Plugins', 'REST/GraphQL', 'PostgreSQL/MySQL'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'easy', tags: ['headless', 'cms', 'api']
  },
  {
    id: 'payload', name: 'Payload CMS', category: 'cms',
    description: 'Next-gen TypeScript headless CMS with code-first approach',
    scores: { performance: 8, scalability: 8, developerExperience: 9, ecosystem: 6, security: 8, costEfficiency: 10, documentation: 8, communitySupport: 6 },
    bestFor: ['TypeScript projects', 'custom admin panels', 'e-commerce', 'content management'],
    notIdealFor: ['non-technical content editors', 'quick setup needs'],
    ecosystem: ['Next.js', 'MongoDB/PostgreSQL', 'S3'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'moderate', tags: ['headless', 'typescript', 'code-first']
  },
  {
    id: 'sanity', name: 'Sanity', category: 'cms',
    description: 'Structured content platform with real-time collaboration',
    scores: { performance: 8, scalability: 9, developerExperience: 8, ecosystem: 7, security: 9, costEfficiency: 7, documentation: 8, communitySupport: 7 },
    bestFor: ['structured content', 'custom publishing workflows', 'collaboration', 'GROQ queries'],
    notIdealFor: ['simple blogs', 'budget-critical projects'],
    ecosystem: ['GROQ', 'Sanity Studio', 'Next.js'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'medium', learningCurve: 'moderate', tags: ['cms', 'realtime', 'structured-content']
  },

  // ============ EMAIL ============
  {
    id: 'resend', name: 'Resend', category: 'email',
    description: 'Modern email API with React Email templates',
    scores: { performance: 9, scalability: 9, developerExperience: 10, ecosystem: 7, security: 9, costEfficiency: 9, documentation: 9, communitySupport: 7 },
    bestFor: ['transactional email', 'React-based templates', 'developer-first', 'startups'],
    notIdealFor: ['high-volume marketing', 'complex email workflows'],
    ecosystem: ['React Email', 'Node.js SDK'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['email', 'transactional', 'react']
  },
  {
    id: 'sendgrid', name: 'SendGrid', category: 'email',
    description: 'Twilio email platform for transactional and marketing emails',
    scores: { performance: 8, scalability: 10, developerExperience: 7, ecosystem: 9, security: 9, costEfficiency: 7, documentation: 8, communitySupport: 8 },
    bestFor: ['high-volume email', 'marketing campaigns', 'email analytics', 'enterprise'],
    notIdealFor: ['simple email needs', 'budget startups'],
    ecosystem: ['Twilio', 'Webhooks', 'Templates'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['email', 'marketing', 'transactional']
  },

  // ============ ANALYTICS ============
  {
    id: 'posthog', name: 'PostHog', category: 'analytics',
    description: 'Open-source product analytics with feature flags and session replay',
    scores: { performance: 8, scalability: 9, developerExperience: 9, ecosystem: 8, security: 9, costEfficiency: 9, documentation: 9, communitySupport: 8 },
    bestFor: ['product analytics', 'A/B testing', 'feature flags', 'session replay', 'self-hosted option'],
    notIdealFor: ['simple page view tracking', 'legacy integrations'],
    ecosystem: ['Feature Flags', 'Session Replay', 'A/B Testing', 'Surveys'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'large', learningCurve: 'easy', tags: ['analytics', 'open-source', 'product']
  },
  {
    id: 'mixpanel', name: 'Mixpanel', category: 'analytics',
    description: 'Event-based product analytics for user behavior tracking',
    scores: { performance: 9, scalability: 10, developerExperience: 8, ecosystem: 8, security: 9, costEfficiency: 7, documentation: 9, communitySupport: 8 },
    bestFor: ['event tracking', 'funnel analysis', 'cohort analysis', 'mobile analytics'],
    notIdealFor: ['simple traffic analytics', 'budget-critical'],
    ecosystem: ['SDKs', 'Data Pipelines', 'Warehouse connectors'],
    pricing: 'freemium', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['analytics', 'events', 'product']
  },
  {
    id: 'plausible', name: 'Plausible', category: 'analytics',
    description: 'Privacy-focused, lightweight web analytics — GDPR compliant',
    scores: { performance: 10, scalability: 8, developerExperience: 9, ecosystem: 5, security: 10, costEfficiency: 8, documentation: 8, communitySupport: 6 },
    bestFor: ['privacy-focused', 'GDPR compliance', 'simple analytics', 'no cookies'],
    notIdealFor: ['deep user behavior', 'funnel analysis', 'event-heavy tracking'],
    ecosystem: ['Self-hosted', 'API'],
    pricing: 'paid', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['analytics', 'privacy', 'gdpr']
  },

  // ============ TESTING ============
  {
    id: 'vitest', name: 'Vitest', category: 'testing',
    description: 'Blazing fast unit test framework, Vite-native, Jest-compatible',
    scores: { performance: 10, scalability: 8, developerExperience: 10, ecosystem: 8, security: 8, costEfficiency: 10, documentation: 9, communitySupport: 8 },
    bestFor: ['TypeScript projects', 'Vite-based projects', 'fast feedback loops', 'ESM-first'],
    notIdealFor: ['browser testing', 'E2E testing'],
    ecosystem: ['Vite', 'c8 coverage', 'Testing Library'],
    pricing: 'free', maturity: 'growing', communitySize: 'large', learningCurve: 'easy', tags: ['testing', 'unit', 'fast']
  },
  {
    id: 'playwright', name: 'Playwright', category: 'testing',
    description: 'Cross-browser E2E testing by Microsoft with auto-wait and codegen',
    scores: { performance: 9, scalability: 9, developerExperience: 9, ecosystem: 8, security: 8, costEfficiency: 10, documentation: 10, communitySupport: 9 },
    bestFor: ['E2E testing', 'cross-browser', 'visual regression', 'API testing', 'CI/CD'],
    notIdealFor: ['unit testing', 'mobile native testing'],
    ecosystem: ['Test Generator', 'Trace Viewer', 'VS Code Extension'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['testing', 'e2e', 'cross-browser']
  },

  // ============ DEVOPS/INFRA ============
  {
    id: 'terraform', name: 'Terraform', category: 'devops',
    description: 'Infrastructure as Code tool for multi-cloud provisioning',
    scores: { performance: 8, scalability: 10, developerExperience: 7, ecosystem: 10, security: 8, costEfficiency: 10, documentation: 9, communitySupport: 10 },
    bestFor: ['multi-cloud IaC', 'reproducible infrastructure', 'enterprise', 'compliance'],
    notIdealFor: ['small projects', 'serverless-only', 'quick prototypes'],
    ecosystem: ['Providers', 'Modules', 'Cloud', 'CDK for Terraform'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['iac', 'multi-cloud', 'devops']
  },
  {
    id: 'coolify', name: 'Coolify', category: 'cloud_platform',
    description: 'Open-source self-hosted PaaS — Heroku/Vercel alternative',
    scores: { performance: 8, scalability: 7, developerExperience: 8, ecosystem: 5, security: 7, costEfficiency: 10, documentation: 7, communitySupport: 6 },
    bestFor: ['self-hosted deployments', 'cost-saving', 'full control', 'Docker apps'],
    notIdealFor: ['enterprise scale', 'managed infrastructure needs', 'large teams'],
    ecosystem: ['Docker', 'Traefik', 'Git integration'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'moderate', tags: ['paas', 'self-hosted', 'open-source']
  },

  // ============ NOTIFICATION ============
  {
    id: 'novu', name: 'Novu', category: 'notification',
    description: 'Open-source notification infrastructure for all channels',
    scores: { performance: 8, scalability: 9, developerExperience: 9, ecosystem: 7, security: 8, costEfficiency: 9, documentation: 8, communitySupport: 7 },
    bestFor: ['multi-channel notifications', 'in-app + email + push + SMS', 'notification preferences'],
    notIdealFor: ['single-channel simple email', 'custom notification systems'],
    ecosystem: ['React components', 'Node.js SDK', 'Digest engine'],
    pricing: 'freemium', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['notification', 'multi-channel', 'open-source']
  },
  {
    id: 'fcm', name: 'Firebase Cloud Messaging', category: 'notification',
    description: 'Free push notification service by Google for web and mobile',
    scores: { performance: 9, scalability: 10, developerExperience: 7, ecosystem: 9, security: 8, costEfficiency: 10, documentation: 8, communitySupport: 9 },
    bestFor: ['push notifications', 'mobile apps', 'web push', 'topic-based messaging'],
    notIdealFor: ['complex notification workflows', 'non-Google ecosystems'],
    ecosystem: ['Firebase', 'Google Cloud', 'Android/iOS SDKs'],
    pricing: 'free', maturity: 'mature', communitySize: 'massive', learningCurve: 'moderate', tags: ['push', 'mobile', 'firebase']
  },

  // ============ API GATEWAY ============
  {
    id: 'trpc', name: 'tRPC', category: 'api_gateway',
    description: 'End-to-end typesafe APIs without schemas or code generation',
    scores: { performance: 9, scalability: 7, developerExperience: 10, ecosystem: 7, security: 8, costEfficiency: 10, documentation: 8, communitySupport: 7 },
    bestFor: ['TypeScript full-stack', 'Next.js', 'type-safe APIs', 'rapid development'],
    notIdealFor: ['multi-language teams', 'public APIs', 'non-TypeScript clients'],
    ecosystem: ['Next.js', 'React Query', 'Zod'],
    pricing: 'free', maturity: 'growing', communitySize: 'medium', learningCurve: 'easy', tags: ['typesafe', 'typescript', 'rpc']
  },
  {
    id: 'graphql', name: 'GraphQL', category: 'api_gateway',
    description: 'Query language for APIs with flexible data fetching',
    scores: { performance: 7, scalability: 8, developerExperience: 8, ecosystem: 9, security: 7, costEfficiency: 9, documentation: 9, communitySupport: 9 },
    bestFor: ['complex data relationships', 'mobile apps', 'microservices', 'developer portals'],
    notIdealFor: ['simple CRUD', 'file uploads', 'real-time heavy'],
    ecosystem: ['Apollo', 'Hasura', 'Relay', 'Pothos'],
    pricing: 'free', maturity: 'mature', communitySize: 'large', learningCurve: 'moderate', tags: ['api', 'query-language', 'flexible']
  },
];

// ============ DEPLOYMENT MODEL MAPPING ============
const deploymentModelMap: Record<string, 'module' | 'standard' | 'hybrid'> = {
  // Frontend
  react: 'standard', nextjs: 'standard', vue: 'standard', angular: 'standard', svelte: 'standard',
  // UI
  tailwind: 'standard', shadcn: 'standard', mui: 'standard', chakra: 'standard',
  // Backend
  express: 'standard', nestjs: 'standard', fastapi: 'standard', django: 'standard',
  go_gin: 'standard', laravel: 'standard', spring_boot: 'standard', hono: 'standard',
  // ORM
  prisma: 'standard', drizzle: 'standard',
  // Database
  postgresql: 'hybrid', mysql: 'hybrid', mongodb: 'hybrid',
  supabase: 'module', firebase: 'module', neon: 'module', planetscale: 'module',
  redis: 'hybrid', upstash: 'module',
  // Auth
  clerk: 'module', auth0: 'module', nextauth: 'standard',
  // Payment
  stripe: 'module', paypal: 'module',
  // Monitoring
  sentry: 'module', datadog: 'module', grafana: 'standard',
  // Cloud
  vercel: 'module', cloudflare: 'module', aws: 'hybrid', railway: 'module', fly_io: 'module',
  // CI/CD
  github_actions: 'module', gitlab_ci: 'module',
  // Search
  algolia: 'module', elasticsearch: 'standard', meilisearch: 'standard',
  // Queue
  rabbitmq: 'standard', kafka: 'standard', bullmq: 'standard',
  // Mobile
  react_native: 'standard', flutter: 'standard', expo: 'hybrid',
  // Realtime
  socket_io: 'standard', pusher: 'module',
  // API Gateway
  kong: 'standard', aws_api_gateway: 'module', trpc: 'standard', graphql: 'standard',
  // Storage
  cloudflare_r2: 'module', aws_s3: 'module',
  // Container
  docker: 'standard', kubernetes: 'standard',
  // AI/ML
  openai: 'module', gemini: 'module', langchain: 'standard', pinecone: 'module', huggingface: 'hybrid',
  // CMS
  strapi: 'standard', payload: 'standard', sanity: 'module',
  // Email
  resend: 'module', sendgrid: 'module',
  // Analytics
  posthog: 'hybrid', mixpanel: 'module', plausible: 'hybrid',
  // Testing
  vitest: 'standard', playwright: 'standard',
  // DevOps
  terraform: 'standard', coolify: 'standard',
  // Notification
  novu: 'hybrid', fcm: 'module',
};

// Auto-inject deploymentModel into all technologies
for (const tech of technologies) {
  (tech as any).deploymentModel = deploymentModelMap[tech.id] || 'standard';
}

export function getTechById(id: string): Technology | undefined {
  return technologies.find(t => t.id === id);
}

export function getTechByCategory(category: string): Technology[] {
  return technologies.filter(t => t.category === category);
}

export function getTechByCategoryAndModel(category: string, model: 'module' | 'standard' | 'hybrid'): Technology[] {
  return technologies.filter(t =>
    t.category === category &&
    (t.deploymentModel === model || t.deploymentModel === 'hybrid')
  );
}

export function searchTech(query: string): Technology[] {
  const q = query.toLowerCase();
  return technologies.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)) ||
    t.bestFor.some(bf => bf.toLowerCase().includes(q))
  );
}
