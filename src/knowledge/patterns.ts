import type { ArchitecturePattern } from '../types/index.js';

export interface PatternInfo {
  id: ArchitecturePattern;
  name: string;
  description: string;
  bestFor: string[];
  notIdealFor: string[];
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  scalability: 'low' | 'medium' | 'high' | 'very_high';
  teamSize: string;
  diagram: string;
}

export const architecturePatterns: PatternInfo[] = [
  {
    id: 'monolith', name: 'Monolith', description: 'Single deployable unit containing all application logic',
    bestFor: ['MVPs', 'small teams (1-5)', 'simple domains', 'rapid prototyping'],
    notIdealFor: ['large teams', 'independent scaling', 'polyglot tech'],
    complexity: 'low', scalability: 'medium', teamSize: '1-5 developers',
    diagram: `graph TD
    Client[Client] --> LB[Load Balancer]
    LB --> App[Monolith Application]
    App --> DB[(Database)]
    App --> Cache[(Cache)]`
  },
  {
    id: 'modular_monolith', name: 'Modular Monolith', description: 'Monolith with well-defined module boundaries, ready for future extraction',
    bestFor: ['growing startups', 'teams 5-15', 'domain-driven design', 'future microservices'],
    notIdealFor: ['very simple apps', 'independent deployments needed now'],
    complexity: 'medium', scalability: 'high', teamSize: '5-15 developers',
    diagram: `graph TD
    Client[Client] --> API[API Gateway]
    API --> M1[Module: Users]
    API --> M2[Module: Orders]
    API --> M3[Module: Products]
    M1 --> DB[(Shared DB)]
    M2 --> DB
    M3 --> DB`
  },
  {
    id: 'microservices', name: 'Microservices', description: 'Independently deployable services with own data stores',
    bestFor: ['large teams (15+)', 'high scale', 'independent deployments', 'polyglot'],
    notIdealFor: ['small teams', 'simple domains', 'tight budgets'],
    complexity: 'very_high', scalability: 'very_high', teamSize: '15+ developers',
    diagram: `graph TD
    Client[Client] --> GW[API Gateway]
    GW --> S1[User Service]
    GW --> S2[Order Service]
    GW --> S3[Product Service]
    S1 --> DB1[(User DB)]
    S2 --> DB2[(Order DB)]
    S3 --> DB3[(Product DB)]
    S2 --> MQ[Message Queue]
    MQ --> S1`
  },
  {
    id: 'serverless', name: 'Serverless', description: 'Event-driven functions with managed infrastructure',
    bestFor: ['variable traffic', 'cost-sensitive', 'event-driven', 'small teams'],
    notIdealFor: ['long-running processes', 'stateful apps', 'low latency requirements'],
    complexity: 'medium', scalability: 'very_high', teamSize: '1-10 developers',
    diagram: `graph TD
    Client[Client] --> CDN[CDN/Edge]
    CDN --> FN[Cloud Functions]
    FN --> DB[(Managed DB)]
    FN --> Storage[(Object Storage)]
    Events[Events/Webhooks] --> Queue[Queue] --> FN`
  },
  {
    id: 'event_driven', name: 'Event-Driven', description: 'Components communicate through asynchronous events',
    bestFor: ['complex workflows', 'real-time systems', 'eventual consistency OK', 'audit trails'],
    notIdealFor: ['simple CRUD', 'immediate consistency needed', 'small projects'],
    complexity: 'high', scalability: 'very_high', teamSize: '10+ developers',
    diagram: `graph TD
    Producer[Event Producers] --> Bus[Event Bus / Kafka]
    Bus --> C1[Consumer 1]
    Bus --> C2[Consumer 2]
    Bus --> C3[Consumer 3]
    C1 --> DB1[(Read DB)]
    Bus --> Store[(Event Store)]`
  },
  {
    id: 'jamstack', name: 'JAMstack', description: 'Static-first with APIs and serverless functions',
    bestFor: ['content sites', 'marketing sites', 'blogs', 'e-commerce storefronts'],
    notIdealFor: ['real-time apps', 'complex server logic', 'dynamic content'],
    complexity: 'low', scalability: 'very_high', teamSize: '1-5 developers',
    diagram: `graph TD
    Client[Client] --> CDN[CDN / Edge]
    CDN --> Static[Static Assets]
    Client --> API[API / Functions]
    API --> CMS[Headless CMS]
    API --> DB[(Database)]`
  },
  {
    id: 'clean_architecture', name: 'Clean Architecture', description: 'Layered architecture with dependency inversion',
    bestFor: ['complex business logic', 'testability', 'long-lived projects', 'enterprise'],
    notIdealFor: ['simple CRUD', 'rapid prototyping', 'small projects'],
    complexity: 'high', scalability: 'high', teamSize: '5-20 developers',
    diagram: `graph TD
    UI[Presentation Layer] --> App[Application Layer]
    App --> Domain[Domain Layer]
    App --> Infra[Infrastructure Layer]
    Infra --> DB[(Database)]
    Infra --> External[External Services]`
  },
  {
    id: 'bff', name: 'Backend for Frontend', description: 'Dedicated backend for each frontend platform',
    bestFor: ['multiple clients (web+mobile+api)', 'different data needs per client'],
    notIdealFor: ['single client', 'simple APIs', 'small teams'],
    complexity: 'medium', scalability: 'high', teamSize: '5-15 developers',
    diagram: `graph TD
    Web[Web App] --> BFF1[Web BFF]
    Mobile[Mobile App] --> BFF2[Mobile BFF]
    BFF1 --> S1[Service 1]
    BFF1 --> S2[Service 2]
    BFF2 --> S1
    BFF2 --> S3[Service 3]`
  },
];

export function recommendPattern(
  teamSize: number,
  projectScale: string,
  requiresRealtime: boolean,
  requiresMultiPlatform: boolean
): PatternInfo[] {
  let recommended: PatternInfo[] = [];

  if (teamSize <= 3) {
    if (projectScale === 'mvp') recommended.push(...architecturePatterns.filter(p => p.id === 'monolith' || p.id === 'serverless' || p.id === 'jamstack'));
    else recommended.push(...architecturePatterns.filter(p => p.id === 'modular_monolith' || p.id === 'serverless'));
  } else if (teamSize <= 10) {
    recommended.push(...architecturePatterns.filter(p => p.id === 'modular_monolith' || p.id === 'clean_architecture'));
    if (requiresRealtime) recommended.push(...architecturePatterns.filter(p => p.id === 'event_driven'));
  } else {
    recommended.push(...architecturePatterns.filter(p => p.id === 'microservices' || p.id === 'event_driven'));
    if (requiresMultiPlatform) recommended.push(...architecturePatterns.filter(p => p.id === 'bff'));
  }

  if (recommended.length === 0) {
    recommended.push(...architecturePatterns.filter(p => p.id === 'modular_monolith'));
  }

  return recommended;
}
