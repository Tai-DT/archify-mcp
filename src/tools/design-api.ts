/**
 * Tool 15: Design API
 * Thiết kế API endpoints dựa trên project type và features
 */

import type { ProjectType } from '../types/index.js';

export interface ApiDesign {
  style: 'REST' | 'GraphQL' | 'gRPC' | 'hybrid';
  version: string;
  baseUrl: string;
  authScheme: string;
  endpoints: ApiEndpoint[];
  webhooks: Webhook[];
  rateLimiting: RateLimitConfig;
  recommendations: string[];
}

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  requestBody?: string;
  responseExample: string;
  rateLimit?: string;
}

interface Webhook {
  event: string;
  description: string;
  payload: string;
}

interface RateLimitConfig {
  defaultPerMinute: number;
  authenticated: number;
  unauthenticated: number;
  burstLimit: number;
}

const projectApiTemplates: Partial<Record<ProjectType, ApiEndpoint[]>> = {
  saas: [
    { method: 'POST', path: '/auth/register', description: 'Register new user', auth: false, requestBody: '{ email, password, name }', responseExample: '{ user, token }' },
    { method: 'POST', path: '/auth/login', description: 'Login', auth: false, requestBody: '{ email, password }', responseExample: '{ token, refreshToken }' },
    { method: 'POST', path: '/auth/refresh', description: 'Refresh token', auth: true, responseExample: '{ token }' },
    { method: 'GET', path: '/me', description: 'Get current user profile', auth: true, responseExample: '{ id, email, name, avatar, role }' },
    { method: 'PATCH', path: '/me', description: 'Update profile', auth: true, requestBody: '{ name?, avatar? }', responseExample: '{ user }' },
    { method: 'POST', path: '/organizations', description: 'Create organization/workspace', auth: true, requestBody: '{ name, slug }', responseExample: '{ org }' },
    { method: 'GET', path: '/organizations/:id', description: 'Get organization details', auth: true, responseExample: '{ org, members, plan }' },
    { method: 'POST', path: '/organizations/:id/invite', description: 'Invite member', auth: true, requestBody: '{ email, role }', responseExample: '{ invitation }' },
    { method: 'GET', path: '/organizations/:id/members', description: 'List members', auth: true, responseExample: '{ members[], total }' },
    { method: 'POST', path: '/billing/subscribe', description: 'Subscribe to plan', auth: true, requestBody: '{ planId, paymentMethodId }', responseExample: '{ subscription }' },
    { method: 'GET', path: '/billing/invoices', description: 'List invoices', auth: true, responseExample: '{ invoices[] }' },
    { method: 'GET', path: '/dashboard/stats', description: 'Dashboard statistics', auth: true, responseExample: '{ users, revenue, activeOrgs }' },
    { method: 'GET', path: '/notifications', description: 'List notifications', auth: true, responseExample: '{ notifications[], unread }' },
    { method: 'PATCH', path: '/notifications/:id/read', description: 'Mark notification read', auth: true, responseExample: '{ ok }' },
  ],
  ecommerce: [
    { method: 'GET', path: '/products', description: 'List products with filters', auth: false, responseExample: '{ products[], total, pagination }' },
    { method: 'GET', path: '/products/:id', description: 'Get product detail', auth: false, responseExample: '{ product, reviews, related }' },
    { method: 'GET', path: '/categories', description: 'List categories', auth: false, responseExample: '{ categories[] }' },
    { method: 'POST', path: '/cart/items', description: 'Add item to cart', auth: true, requestBody: '{ productId, quantity, variant }', responseExample: '{ cart }' },
    { method: 'PATCH', path: '/cart/items/:id', description: 'Update cart item', auth: true, requestBody: '{ quantity }', responseExample: '{ cart }' },
    { method: 'DELETE', path: '/cart/items/:id', description: 'Remove from cart', auth: true, responseExample: '{ cart }' },
    { method: 'POST', path: '/orders', description: 'Create order / checkout', auth: true, requestBody: '{ cartId, addressId, paymentMethodId }', responseExample: '{ order, paymentIntent }' },
    { method: 'GET', path: '/orders', description: 'List user orders', auth: true, responseExample: '{ orders[] }' },
    { method: 'GET', path: '/orders/:id', description: 'Order detail with tracking', auth: true, responseExample: '{ order, tracking, items }' },
    { method: 'POST', path: '/reviews', description: 'Submit review', auth: true, requestBody: '{ productId, rating, comment }', responseExample: '{ review }' },
    { method: 'GET', path: '/search', description: 'Full-text search products', auth: false, responseExample: '{ results[], facets, total }' },
  ],
  social_network: [
    { method: 'GET', path: '/feed', description: 'Get news feed', auth: true, responseExample: '{ posts[], nextCursor }' },
    { method: 'POST', path: '/posts', description: 'Create post', auth: true, requestBody: '{ content, media[], visibility }', responseExample: '{ post }' },
    { method: 'POST', path: '/posts/:id/like', description: 'Like/unlike post', auth: true, responseExample: '{ liked, likesCount }' },
    { method: 'POST', path: '/posts/:id/comments', description: 'Comment on post', auth: true, requestBody: '{ content }', responseExample: '{ comment }' },
    { method: 'GET', path: '/users/:id', description: 'Get user profile', auth: false, responseExample: '{ user, stats }' },
    { method: 'POST', path: '/users/:id/follow', description: 'Follow/unfollow user', auth: true, responseExample: '{ following }' },
    { method: 'GET', path: '/messages', description: 'List conversations', auth: true, responseExample: '{ conversations[] }' },
    { method: 'POST', path: '/messages/:conversationId', description: 'Send message', auth: true, requestBody: '{ content, type }', responseExample: '{ message }' },
    { method: 'GET', path: '/notifications', description: 'Get notifications', auth: true, responseExample: '{ notifications[] }' },
  ],
};

// Feature-specific endpoints
const featureEndpoints: Record<string, ApiEndpoint[]> = {
  chat: [
    { method: 'GET', path: '/conversations', description: 'List chat conversations', auth: true, responseExample: '{ conversations[], unread }' },
    { method: 'POST', path: '/conversations', description: 'Create conversation/channel', auth: true, requestBody: '{ name, type, members[] }', responseExample: '{ conversation }' },
    { method: 'GET', path: '/conversations/:id/messages', description: 'Get messages (paginated)', auth: true, responseExample: '{ messages[], hasMore, nextCursor }' },
    { method: 'POST', path: '/conversations/:id/messages', description: 'Send message', auth: true, requestBody: '{ content, type, attachments[] }', responseExample: '{ message }' },
    { method: 'POST', path: '/conversations/:id/messages/:mid/react', description: 'React to message', auth: true, requestBody: '{ emoji }', responseExample: '{ reaction }' },
    { method: 'POST', path: '/conversations/:id/typing', description: 'Send typing indicator', auth: true, responseExample: '{ ok }' },
    { method: 'GET', path: '/conversations/:id/members', description: 'List conversation members', auth: true, responseExample: '{ members[] }' },
  ],
  ai: [
    { method: 'POST', path: '/ai/chat', description: 'Chat with AI assistant', auth: true, requestBody: '{ message, context?, conversationId? }', responseExample: '{ reply, sources[] }', rateLimit: '30/min' },
    { method: 'POST', path: '/ai/summarize', description: 'Summarize content', auth: true, requestBody: '{ text, maxLength? }', responseExample: '{ summary }', rateLimit: '10/min' },
    { method: 'POST', path: '/ai/suggest', description: 'Get AI suggestions', auth: true, requestBody: '{ context, type }', responseExample: '{ suggestions[] }', rateLimit: '20/min' },
  ],
  file: [
    { method: 'POST', path: '/files/upload', description: 'Upload file (multipart)', auth: true, requestBody: 'multipart/form-data', responseExample: '{ file: { id, url, size, mime } }' },
    { method: 'GET', path: '/files/:id', description: 'Get file metadata', auth: true, responseExample: '{ file }' },
    { method: 'DELETE', path: '/files/:id', description: 'Delete file', auth: true, responseExample: '{ ok }' },
  ],
  task: [
    { method: 'GET', path: '/tasks', description: 'List tasks with filters', auth: true, responseExample: '{ tasks[], total }' },
    { method: 'POST', path: '/tasks', description: 'Create task', auth: true, requestBody: '{ title, description, assigneeId, dueDate, priority }', responseExample: '{ task }' },
    { method: 'PATCH', path: '/tasks/:id', description: 'Update task', auth: true, requestBody: '{ status?, assigneeId?, dueDate? }', responseExample: '{ task }' },
    { method: 'PATCH', path: '/tasks/:id/status', description: 'Change task status', auth: true, requestBody: '{ status }', responseExample: '{ task }' },
    { method: 'GET', path: '/tasks/:id/comments', description: 'Task comments', auth: true, responseExample: '{ comments[] }' },
  ],
  learning: [
    { method: 'GET', path: '/courses', description: 'List courses', auth: true, responseExample: '{ courses[], total }' },
    { method: 'GET', path: '/courses/:id', description: 'Course detail with lessons', auth: true, responseExample: '{ course, lessons[], progress }' },
    { method: 'POST', path: '/courses/:id/enroll', description: 'Enroll in course', auth: true, responseExample: '{ enrollment }' },
    { method: 'GET', path: '/courses/:id/lessons/:lid', description: 'Get lesson content', auth: true, responseExample: '{ lesson, content, quiz? }' },
    { method: 'POST', path: '/courses/:id/lessons/:lid/complete', description: 'Mark lesson complete', auth: true, responseExample: '{ progress }' },
    { method: 'POST', path: '/quizzes/:id/submit', description: 'Submit quiz answers', auth: true, requestBody: '{ answers[] }', responseExample: '{ score, correct, total }' },
  ],
  video: [
    { method: 'POST', path: '/meetings', description: 'Create meeting room', auth: true, requestBody: '{ title, scheduledAt?, participants[] }', responseExample: '{ meeting, joinUrl, token }' },
    { method: 'GET', path: '/meetings/:id/token', description: 'Get join token', auth: true, responseExample: '{ token, iceServers }' },
  ],
};

export function designApi(projectType: ProjectType, featureKeywords: string[] = []): ApiDesign {
  const endpoints: ApiEndpoint[] = [];

  // Base endpoints from project type
  const baseEndpoints = projectApiTemplates[projectType] || projectApiTemplates.saas!;
  endpoints.push(...baseEndpoints);

  // Feature-specific endpoints
  const featureText = featureKeywords.join(' ').toLowerCase();
  for (const [key, eps] of Object.entries(featureEndpoints)) {
    if (featureText.includes(key) || featureKeywords.some(f => f.toLowerCase().includes(key))) {
      endpoints.push(...eps);
    }
  }

  // Deduplicate by path+method
  const seen = new Set<string>();
  const uniqueEndpoints = endpoints.filter(e => {
    const key = `${e.method}:${e.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const recommendations: string[] = [
    '📋 Sử dụng cursor-based pagination thay vì offset cho performance tốt hơn',
    '🔐 Implement rate limiting riêng cho API auth vs public endpoints',
    '📊 Dùng ETag/If-None-Match cho caching GET requests',
    '🔄 Versioning: prefix /api/v1/ để dễ migrate sau này',
    '📝 Generate OpenAPI spec từ code — dùng Swagger hoặc Zod-to-OpenAPI',
  ];

  if (featureText.includes('chat') || featureText.includes('realtime')) {
    recommendations.push('⚡ WebSocket endpoint: ws://api/ws — dùng cho chat, notifications, typing indicators');
    recommendations.push('💡 Implement message queue (Redis Pub/Sub) cho horizontal scaling WebSocket');
  }
  if (featureText.includes('ai')) {
    recommendations.push('🤖 AI endpoints cần rate limit thấp hơn (10-30 req/min) và timeout dài hơn (30s)');
    recommendations.push('📡 Dùng Server-Sent Events (SSE) cho streaming AI responses');
  }
  if (featureText.includes('file') || featureText.includes('upload')) {
    recommendations.push('📁 File upload: pre-signed URL pattern — client upload trực tiếp lên S3, không qua server');
  }

  return {
    style: 'REST',
    version: 'v1',
    baseUrl: '/api/v1',
    authScheme: 'Bearer JWT (access + refresh token)',
    endpoints: uniqueEndpoints,
    webhooks: [
      { event: 'user.created', description: 'New user registered', payload: '{ user: { id, email, name } }' },
      { event: 'payment.completed', description: 'Payment successful', payload: '{ payment: { id, amount, status } }' },
      { event: 'subscription.changed', description: 'Plan changed', payload: '{ org, oldPlan, newPlan }' },
    ],
    rateLimiting: {
      defaultPerMinute: 60,
      authenticated: 120,
      unauthenticated: 30,
      burstLimit: 10,
    },
    recommendations,
  };
}

export function formatApiDesign(api: ApiDesign): string {
  const lines = ['# 📡 API Design\n'];
  lines.push(`- **Style**: ${api.style} | **Version**: ${api.version}`);
  lines.push(`- **Base URL**: \`${api.baseUrl}\``);
  lines.push(`- **Auth**: ${api.authScheme}`);
  lines.push(`- **Rate Limit**: ${api.rateLimiting.authenticated} req/min (auth), ${api.rateLimiting.unauthenticated} req/min (public)\n`);

  // Group endpoints by resource
  const groups = new Map<string, ApiEndpoint[]>();
  for (const ep of api.endpoints) {
    const resource = ep.path.split('/')[1] || 'other';
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource)!.push(ep);
  }

  for (const [resource, endpoints] of groups) {
    lines.push(`## 📂 /${resource}\n`);
    lines.push('| Method | Path | Description | Auth |');
    lines.push('|--------|------|-------------|------|');
    for (const ep of endpoints) {
      lines.push(`| \`${ep.method}\` | \`${ep.path}\` | ${ep.description} | ${ep.auth ? '🔐' : '🌐'} |`);
    }
    lines.push('');
  }

  if (api.webhooks.length > 0) {
    lines.push('## 🔔 Webhooks\n');
    api.webhooks.forEach(w => lines.push(`- **${w.event}**: ${w.description} → \`${w.payload}\``));
  }

  lines.push('\n## 💡 Recommendations\n');
  api.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
