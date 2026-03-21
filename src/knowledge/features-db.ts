import type { Feature, FeatureGroup, ProjectType } from '../types/index.js';

// Feature templates organized by project type
export const featureTemplates: Record<ProjectType, FeatureGroup[]> = {
  ecommerce: [
    {
      name: 'Core Shopping',
      features: [
        { name: 'Product Catalog', description: 'Browse and search products with categories, filters, and sorting', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['database', 'search'], dependencies: [], category: 'shopping' },
        { name: 'Shopping Cart', description: 'Add/remove items, quantity management, persistent cart', priority: 'must_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['state-management', 'sessions'], dependencies: ['Product Catalog'], category: 'shopping' },
        { name: 'Checkout Flow', description: 'Multi-step checkout with address, shipping, payment', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['payment', 'forms'], dependencies: ['Shopping Cart'], category: 'shopping' },
        { name: 'Product Search', description: 'Full-text search with autocomplete, typo tolerance', priority: 'must_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['search-engine'], dependencies: ['Product Catalog'], category: 'shopping' },
        { name: 'Wishlist', description: 'Save products for later with sharing capability', priority: 'should_have', complexity: 'low', estimatedDays: 2, techRequirements: ['auth'], dependencies: ['Product Catalog'], category: 'shopping' },
        { name: 'Product Reviews', description: 'User reviews with ratings, photos, and helpful votes', priority: 'should_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['auth', 'storage'], dependencies: ['Product Catalog'], category: 'engagement' },
      ]
    },
    {
      name: 'Payment & Orders',
      features: [
        { name: 'Payment Integration', description: 'Stripe/PayPal integration with multiple payment methods', priority: 'must_have', complexity: 'high', estimatedDays: 5, techRequirements: ['payment-gateway'], dependencies: ['Checkout Flow'], category: 'payment' },
        { name: 'Order Management', description: 'Order tracking, history, status updates, cancellation', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['database', 'email'], dependencies: ['Payment Integration'], category: 'orders' },
        { name: 'Inventory Management', description: 'Stock tracking, low stock alerts, auto-restocking', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['database', 'notifications'], dependencies: ['Product Catalog'], category: 'operations' },
        { name: 'Discount & Coupons', description: 'Promo codes, percentage/fixed discounts, auto-apply rules', priority: 'should_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['database'], dependencies: ['Checkout Flow'], category: 'marketing' },
      ]
    },
    {
      name: 'User & Admin',
      features: [
        { name: 'User Authentication', description: 'Sign up, login, social auth, password reset', priority: 'must_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['auth'], dependencies: [], category: 'auth' },
        { name: 'Admin Dashboard', description: 'Sales analytics, product management, order management', priority: 'must_have', complexity: 'high', estimatedDays: 10, techRequirements: ['charts', 'tables'], dependencies: ['Product Catalog', 'Order Management'], category: 'admin' },
        { name: 'Email Notifications', description: 'Order confirmations, shipping updates, marketing emails', priority: 'must_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['email-service'], dependencies: ['Order Management'], category: 'communications' },
        { name: 'AI Recommendations', description: 'Personalized product recommendations based on behavior', priority: 'could_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['ai', 'analytics'], dependencies: ['Product Catalog'], category: 'ai' },
      ]
    }
  ],

  saas: [
    {
      name: 'Authentication & Users',
      features: [
        { name: 'Multi-tenant Auth', description: 'User auth with organization/workspace support', priority: 'must_have', complexity: 'high', estimatedDays: 5, techRequirements: ['auth', 'multi-tenancy'], dependencies: [], category: 'auth' },
        { name: 'Role-based Access', description: 'RBAC with custom roles and permissions', priority: 'must_have', complexity: 'high', estimatedDays: 5, techRequirements: ['auth', 'database'], dependencies: ['Multi-tenant Auth'], category: 'auth' },
        { name: 'Team Management', description: 'Invite members, manage roles, team settings', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['email', 'auth'], dependencies: ['Role-based Access'], category: 'teams' },
        { name: 'SSO Integration', description: 'SAML/OIDC single sign-on for enterprise customers', priority: 'could_have', complexity: 'very_high', estimatedDays: 8, techRequirements: ['saml', 'oidc'], dependencies: ['Multi-tenant Auth'], category: 'enterprise' },
      ]
    },
    {
      name: 'Billing & Subscription',
      features: [
        { name: 'Subscription Plans', description: 'Tiered pricing with monthly/annual billing', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['payment', 'billing'], dependencies: ['Multi-tenant Auth'], category: 'billing' },
        { name: 'Usage-based Billing', description: 'Metered billing with usage tracking and limits', priority: 'should_have', complexity: 'high', estimatedDays: 5, techRequirements: ['payment', 'metrics'], dependencies: ['Subscription Plans'], category: 'billing' },
        { name: 'Self-serve Portal', description: 'Customers manage billing, invoices, plan changes', priority: 'should_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['payment'], dependencies: ['Subscription Plans'], category: 'billing' },
      ]
    },
    {
      name: 'Platform Features',
      features: [
        { name: 'Dashboard & Analytics', description: 'Key metrics dashboard with charts and reports', priority: 'must_have', complexity: 'high', estimatedDays: 8, techRequirements: ['charts', 'analytics'], dependencies: [], category: 'analytics' },
        { name: 'API & Webhooks', description: 'REST/GraphQL API with webhook integrations', priority: 'should_have', complexity: 'high', estimatedDays: 7, techRequirements: ['api', 'queue'], dependencies: [], category: 'integrations' },
        { name: 'Notification System', description: 'In-app, email, and push notifications', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['websocket', 'email', 'push'], dependencies: [], category: 'communications' },
        { name: 'Audit Log', description: 'Track all user actions for compliance and debugging', priority: 'should_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['database', 'logging'], dependencies: [], category: 'security' },
        { name: 'Data Export', description: 'Export data in CSV, JSON, PDF formats', priority: 'should_have', complexity: 'low', estimatedDays: 2, techRequirements: ['file-generation'], dependencies: [], category: 'data' },
      ]
    }
  ],

  social_network: [
    {
      name: 'Core Social',
      features: [
        { name: 'User Profiles', description: 'Rich profiles with bio, avatar, activity feed', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['auth', 'storage'], dependencies: [], category: 'users' },
        { name: 'News Feed', description: 'Algorithmic feed with posts, shares, and recommendations', priority: 'must_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['database', 'cache', 'algorithm'], dependencies: ['User Profiles'], category: 'feed' },
        { name: 'Real-time Chat', description: 'Direct messages and group chats with media support', priority: 'must_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['websocket', 'storage'], dependencies: ['User Profiles'], category: 'messaging' },
        { name: 'Follow/Friend System', description: 'Follow users, friend requests, mutual connections', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['database'], dependencies: ['User Profiles'], category: 'connections' },
        { name: 'Content Creation', description: 'Create posts with text, images, videos, polls', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['storage', 'media-processing'], dependencies: ['User Profiles'], category: 'content' },
        { name: 'Reactions & Comments', description: 'Like, react, comment, reply threads', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['database', 'realtime'], dependencies: ['Content Creation'], category: 'engagement' },
        { name: 'Content Moderation', description: 'AI-powered content moderation with reporting', priority: 'should_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['ai', 'queue'], dependencies: ['Content Creation'], category: 'safety' },
      ]
    }
  ],

  marketplace: [
    {
      name: 'Marketplace Core',
      features: [
        { name: 'Multi-vendor Management', description: 'Vendor registration, profiles, storefronts', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['auth', 'multi-tenancy'], dependencies: [], category: 'vendors' },
        { name: 'Listing Management', description: 'Create/edit listings with categories and pricing', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['database', 'storage'], dependencies: ['Multi-vendor Management'], category: 'listings' },
        { name: 'Search & Discovery', description: 'Advanced search, filters, map view, recommendations', priority: 'must_have', complexity: 'high', estimatedDays: 6, techRequirements: ['search', 'maps'], dependencies: ['Listing Management'], category: 'discovery' },
        { name: 'Booking System', description: 'Calendar-based booking with availability management', priority: 'must_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['calendar', 'database'], dependencies: ['Listing Management'], category: 'booking' },
        { name: 'Split Payments', description: 'Platform commission with vendor payouts (Stripe Connect)', priority: 'must_have', complexity: 'very_high', estimatedDays: 8, techRequirements: ['payment-connect'], dependencies: ['Booking System'], category: 'payment' },
        { name: 'Review System', description: 'Two-way reviews between buyers and sellers', priority: 'must_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['database'], dependencies: ['Booking System'], category: 'trust' },
        { name: 'Messaging System', description: 'In-app messaging between buyers and sellers', priority: 'should_have', complexity: 'high', estimatedDays: 5, techRequirements: ['websocket'], dependencies: ['Multi-vendor Management'], category: 'communication' },
      ]
    }
  ],

  // Simplified templates for other types
  content_platform: [{ name: 'Content Core', features: [
    { name: 'Content Editor', description: 'Rich text editor with media embeds', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['editor', 'storage'], dependencies: [], category: 'content' },
    { name: 'Content Discovery', description: 'Feed, categories, tags, recommendations', priority: 'must_have', complexity: 'high', estimatedDays: 6, techRequirements: ['search', 'algorithm'], dependencies: [], category: 'discovery' },
    { name: 'Monetization', description: 'Subscriptions, tips, paywalls', priority: 'should_have', complexity: 'high', estimatedDays: 7, techRequirements: ['payment'], dependencies: [], category: 'revenue' },
  ]}],

  fintech: [{ name: 'Fintech Core', features: [
    { name: 'KYC/AML Verification', description: 'Identity verification and compliance', priority: 'must_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['kyc-provider', 'compliance'], dependencies: [], category: 'compliance' },
    { name: 'Transaction Processing', description: 'Secure transaction handling with audit trail', priority: 'must_have', complexity: 'very_high', estimatedDays: 15, techRequirements: ['payment', 'encryption'], dependencies: [], category: 'transactions' },
    { name: 'Financial Dashboard', description: 'Account overview, balances, transaction history', priority: 'must_have', complexity: 'high', estimatedDays: 8, techRequirements: ['charts', 'realtime'], dependencies: [], category: 'dashboard' },
  ]}],

  healthtech: [{ name: 'Health Core', features: [
    { name: 'Patient Portal', description: 'Patient profiles, records, appointments', priority: 'must_have', complexity: 'high', estimatedDays: 8, techRequirements: ['hipaa', 'auth'], dependencies: [], category: 'patients' },
    { name: 'Telemedicine', description: 'Video consultations with scheduling', priority: 'must_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['webrtc', 'calendar'], dependencies: [], category: 'telehealth' },
    { name: 'EHR Integration', description: 'Electronic health records integration (HL7/FHIR)', priority: 'should_have', complexity: 'very_high', estimatedDays: 15, techRequirements: ['fhir', 'hl7'], dependencies: [], category: 'integration' },
  ]}],

  edtech: [{ name: 'EdTech Core', features: [
    { name: 'Course Management', description: 'Create and manage courses with modules', priority: 'must_have', complexity: 'high', estimatedDays: 8, techRequirements: ['database', 'storage'], dependencies: [], category: 'courses' },
    { name: 'Video Streaming', description: 'Video lessons with progress tracking', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['video-streaming', 'cdn'], dependencies: [], category: 'content' },
    { name: 'Quiz & Assessment', description: 'Interactive quizzes with auto-grading', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['database'], dependencies: [], category: 'assessment' },
    { name: 'Progress Tracking', description: 'Learning analytics and certificates', priority: 'should_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['analytics'], dependencies: [], category: 'gamification' },
  ]}],

  iot: [{ name: 'IoT Core', features: [
    { name: 'Device Management', description: 'Register, monitor, and control IoT devices', priority: 'must_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['mqtt', 'websocket'], dependencies: [], category: 'devices' },
    { name: 'Real-time Dashboard', description: 'Live sensor data visualization', priority: 'must_have', complexity: 'high', estimatedDays: 8, techRequirements: ['charts', 'realtime', 'timeseries-db'], dependencies: [], category: 'monitoring' },
    { name: 'Rule Engine', description: 'Automated actions based on sensor thresholds', priority: 'should_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['rules-engine', 'queue'], dependencies: [], category: 'automation' },
  ]}],

  ai_ml: [{ name: 'AI/ML Core', features: [
    { name: 'Model Playground', description: 'Interactive UI to test and compare AI models', priority: 'must_have', complexity: 'high', estimatedDays: 8, techRequirements: ['ai-api', 'streaming'], dependencies: [], category: 'ai' },
    { name: 'Prompt Management', description: 'Create, version, and share prompts', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['database'], dependencies: [], category: 'prompts' },
    { name: 'Usage & Cost Tracking', description: 'Track API usage, tokens, and costs', priority: 'should_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['analytics'], dependencies: [], category: 'billing' },
  ]}],

  gaming: [{ name: 'Gaming Core', features: [
    { name: 'Game Engine Integration', description: 'WebGL/Canvas-based game rendering', priority: 'must_have', complexity: 'very_high', estimatedDays: 15, techRequirements: ['webgl', 'canvas'], dependencies: [], category: 'engine' },
    { name: 'Leaderboards', description: 'Global and friend leaderboards with rankings', priority: 'should_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['cache', 'database'], dependencies: [], category: 'social' },
    { name: 'Matchmaking', description: 'Skill-based player matching for multiplayer', priority: 'should_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['websocket', 'algorithm'], dependencies: [], category: 'multiplayer' },
  ]}],

  enterprise: [{ name: 'Enterprise Core', features: [
    { name: 'SSO & Directory', description: 'SAML/OIDC SSO with LDAP/AD integration', priority: 'must_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['saml', 'ldap'], dependencies: [], category: 'auth' },
    { name: 'Audit & Compliance', description: 'Comprehensive audit logging with data retention', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['logging', 'encryption'], dependencies: [], category: 'compliance' },
    { name: 'Workflow Engine', description: 'Custom workflows with approval chains', priority: 'should_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['state-machine', 'queue'], dependencies: [], category: 'workflows' },
  ]}],

  mobile_app: [{ name: 'Mobile Core', features: [
    { name: 'Push Notifications', description: 'Rich push notifications with deep linking', priority: 'must_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['push-service'], dependencies: [], category: 'engagement' },
    { name: 'Offline Support', description: 'Offline-first with sync when back online', priority: 'should_have', complexity: 'very_high', estimatedDays: 8, techRequirements: ['local-db', 'sync'], dependencies: [], category: 'reliability' },
    { name: 'Biometric Auth', description: 'Face ID / Touch ID / fingerprint authentication', priority: 'should_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['biometric-api'], dependencies: [], category: 'security' },
  ]}],

  api_service: [{ name: 'API Core', features: [
    { name: 'API Gateway', description: 'Rate limiting, auth, versioning, documentation', priority: 'must_have', complexity: 'high', estimatedDays: 6, techRequirements: ['api-gateway'], dependencies: [], category: 'infrastructure' },
    { name: 'Developer Portal', description: 'API docs, sandbox, API key management', priority: 'must_have', complexity: 'high', estimatedDays: 7, techRequirements: ['docs'], dependencies: [], category: 'developer-experience' },
    { name: 'Webhooks', description: 'Event-driven webhooks with retry logic', priority: 'should_have', complexity: 'medium', estimatedDays: 4, techRequirements: ['queue'], dependencies: [], category: 'integrations' },
  ]}],

  devtool: [{ name: 'DevTool Core', features: [
    { name: 'CLI Tool', description: 'Command-line interface with interactive prompts', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['node-cli'], dependencies: [], category: 'cli' },
    { name: 'Plugin System', description: 'Extensible plugin architecture', priority: 'should_have', complexity: 'very_high', estimatedDays: 10, techRequirements: ['plugin-arch'], dependencies: [], category: 'extensibility' },
    { name: 'VS Code Extension', description: 'IDE integration with VS Code extension', priority: 'could_have', complexity: 'high', estimatedDays: 7, techRequirements: ['vscode-api'], dependencies: [], category: 'integration' },
  ]}],

  other: [{ name: 'General', features: [
    { name: 'User Authentication', description: 'Sign up, login, profile management', priority: 'must_have', complexity: 'medium', estimatedDays: 3, techRequirements: ['auth'], dependencies: [], category: 'auth' },
    { name: 'Dashboard', description: 'Overview dashboard with key metrics', priority: 'must_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['charts'], dependencies: [], category: 'dashboard' },
    { name: 'Admin Panel', description: 'Admin management interface', priority: 'should_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['tables', 'forms'], dependencies: [], category: 'admin' },
  ]}],
};
