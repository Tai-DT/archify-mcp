/**
 * Tool 22: Performance Budget
 * Core Web Vitals targets, bundle size limits, Lighthouse requirements
 */

import type { ProjectType, ProjectScale } from '../types/index.js';

export interface PerformanceBudget {
  coreWebVitals: CoreWebVitals;
  bundleBudget: BundleBudget;
  lighthouseTargets: LighthouseTargets;
  networkBudget: NetworkBudget;
  serverBudget: ServerBudget;
  monitoringTools: string[];
  recommendations: string[];
}

interface CoreWebVitals {
  lcp: { target: string; description: string };
  fid: { target: string; description: string };
  cls: { target: string; description: string };
  inp: { target: string; description: string };
  ttfb: { target: string; description: string };
}

interface BundleBudget {
  totalJs: string;
  totalCss: string;
  initialLoad: string;
  perRoute: string;
  images: string;
  fonts: string;
  strategies: string[];
}

interface LighthouseTargets {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface NetworkBudget {
  firstLoad: string;
  subsequentLoads: string;
  apiResponseP95: string;
  timeToInteractive: string;
  targets3G: { firstLoad: string; tti: string };
}

interface ServerBudget {
  responseTimeP50: string;
  responseTimeP95: string;
  responseTimeP99: string;
  errorRate: string;
  throughput: string;
}

export function createPerformanceBudget(
  projectType: ProjectType,
  scale: ProjectScale,
  features: string[] = []
): PerformanceBudget {
  const featureText = features.join(' ').toLowerCase();
  const hasChat = featureText.includes('chat');
  const hasVideo = featureText.includes('video');

  // Core Web Vitals (Google's thresholds)
  const coreWebVitals: CoreWebVitals = {
    lcp: { target: '≤ 2.5s (Good)', description: 'Largest Contentful Paint — thời gian render element lớn nhất. Optimize: lazy load images, preload critical resources, SSR/SSG.' },
    fid: { target: '≤ 100ms (Good)', description: 'First Input Delay — thời gian phản hồi interaction đầu tiên. Optimize: code splitting, defer non-critical JS.' },
    cls: { target: '≤ 0.1 (Good)', description: 'Cumulative Layout Shift — layout không nhảy. Optimize: set width/height cho images, reserve space cho ads/embeds.' },
    inp: { target: '≤ 200ms (Good)', description: 'Interaction to Next Paint — thời gian phản hồi mỗi interaction. Optimize: break long tasks, use requestIdleCallback.' },
    ttfb: { target: '≤ 800ms (Good)', description: 'Time to First Byte — CDN + server response speed. Optimize: edge caching, reduce server processing time.' },
  };

  // Bundle budget
  const isSSR = projectType === 'ecommerce' || projectType === 'content_platform';
  const bundleBudget: BundleBudget = {
    totalJs: isSSR ? '≤ 150KB gzipped' : '≤ 250KB gzipped',
    totalCss: '≤ 50KB gzipped',
    initialLoad: isSSR ? '≤ 100KB JS (initial)' : '≤ 170KB JS (initial)',
    perRoute: '≤ 50KB JS per route chunk',
    images: '≤ 200KB per image (WebP/AVIF), lazy load below fold',
    fonts: '≤ 100KB total, preload critical fonts, font-display: swap',
    strategies: [
      '📦 **Code splitting**: dynamic import() cho mỗi route',
      '🌳 **Tree shaking**: chỉ import những gì dùng (named imports)',
      '🗜️ **Compression**: Brotli > gzip (15-20% nhỏ hơn)',
      '📷 **Image optimization**: next/image hoặc sharp pipeline, WebP/AVIF format',
      '🔤 **Font subsetting**: chỉ load characters cần thiết',
      `📊 **Bundle analyzer**: \`npx next build && npx @next/bundle-analyzer\``,
      '⚡ **Prefetch**: prefetch routes khi hover link',
    ],
  };

  // Lighthouse targets
  const lighthouseTargets: LighthouseTargets = {
    performance: scale === 'mvp' ? 85 : 90,
    accessibility: 95,
    bestPractices: 95,
    seo: scale === 'mvp' ? 90 : 95,
  };

  // Network budget
  const networkBudget: NetworkBudget = {
    firstLoad: '≤ 1.5MB total (all resources)',
    subsequentLoads: '≤ 200KB (cached assets excluded)',
    apiResponseP95: hasChat ? '≤ 200ms' : '≤ 500ms',
    timeToInteractive: '≤ 3.5s on 4G',
    targets3G: {
      firstLoad: '≤ 5s to render meaningful content',
      tti: '≤ 8s time to interactive',
    },
  };

  // Server budget
  const serverBudget: ServerBudget = {
    responseTimeP50: '≤ 100ms',
    responseTimeP95: hasChat ? '≤ 200ms' : '≤ 500ms',
    responseTimeP99: '≤ 1000ms',
    errorRate: '≤ 0.1% (5xx errors)',
    throughput: scale === 'mvp' ? '≥ 100 RPS' : scale === 'startup' ? '≥ 500 RPS' : '≥ 2000 RPS',
  };

  const monitoringTools = [
    'Chrome DevTools — Performance tab, Lighthouse audit',
    'WebPageTest.org — Real device testing, filmstrip view',
    'web-vitals npm package — Real User Monitoring (RUM)',
    'Sentry Performance — Transaction monitoring in production',
    'bundlephobia.com — Check npm package sizes before installing',
    'Chrome UX Report (CrUX) — Real user web vitals data',
  ];

  const recommendations = [
    '📊 **Measure real users** — Lab data ≠ field data. Setup RUM với web-vitals package',
    '🚫 **Performance budget CI gate** — Fail build nếu bundle > budget',
    '📦 **Audit npm packages** — \`npx depcheck\` + \`npx bundlephobia\` trước khi add dependency',
    '🖼️ **Images là #1 bottleneck** — Responsive images, lazy load, WebP/AVIF, CDN',
    '⚡ **SSR/SSG cho landing pages** — Static pages = instant LCP',
    '🔄 **Stale-while-revalidate** — Cache API responses, show cached data immediately',
    '❌ **Tránh**: jQuery, Moment.js, Lodash full import — dùng native hoặc lightweight alternatives',
    '📱 **Test trên real device** — đặc biệt mid-range Android (Xiaomi, Samsung A series)',
  ];

  if (hasChat) {
    recommendations.push('💬 **Chat performance**: Message virtualization (react-window) cho long conversations');
  }
  if (hasVideo) {
    recommendations.push('🎬 **Video**: Adaptive bitrate streaming, lazy load video player component');
  }

  return { coreWebVitals, bundleBudget, lighthouseTargets, networkBudget, serverBudget, monitoringTools, recommendations };
}

export function formatPerformanceBudget(budget: PerformanceBudget): string {
  const lines = ['# ⚡ Performance Budget\n'];
  lines.push('> Ngân sách hiệu năng — tiêu chuẩn phải đạt trước khi release\n');

  // Core Web Vitals
  lines.push('## 🌐 Core Web Vitals (Google)\n');
  lines.push('| Metric | Target | Description |');
  lines.push('|--------|--------|-------------|');
  const cwv = budget.coreWebVitals;
  lines.push(`| **LCP** | ${cwv.lcp.target} | ${cwv.lcp.description.slice(0, 80)} |`);
  lines.push(`| **FID** | ${cwv.fid.target} | ${cwv.fid.description.slice(0, 80)} |`);
  lines.push(`| **CLS** | ${cwv.cls.target} | ${cwv.cls.description.slice(0, 80)} |`);
  lines.push(`| **INP** | ${cwv.inp.target} | ${cwv.inp.description.slice(0, 80)} |`);
  lines.push(`| **TTFB** | ${cwv.ttfb.target} | ${cwv.ttfb.description.slice(0, 80)} |`);

  // Lighthouse
  lines.push('\n## 🔦 Lighthouse Targets\n');
  const lt = budget.lighthouseTargets;
  lines.push(`- Performance: **${lt.performance}**/100`);
  lines.push(`- Accessibility: **${lt.accessibility}**/100`);
  lines.push(`- Best Practices: **${lt.bestPractices}**/100`);
  lines.push(`- SEO: **${lt.seo}**/100`);

  // Bundle
  lines.push('\n## 📦 Bundle Budget\n');
  const bb = budget.bundleBudget;
  lines.push(`- Total JS: **${bb.totalJs}**`);
  lines.push(`- Total CSS: **${bb.totalCss}**`);
  lines.push(`- Initial load JS: **${bb.initialLoad}**`);
  lines.push(`- Per-route chunk: **${bb.perRoute}**`);
  lines.push(`- Images: **${bb.images}**`);
  lines.push(`- Fonts: **${bb.fonts}**\n`);
  lines.push('### Optimization Strategies\n');
  bb.strategies.forEach(s => lines.push(`- ${s}`));

  // Network
  lines.push('\n## 🌍 Network Budget\n');
  const nb = budget.networkBudget;
  lines.push(`- First load: **${nb.firstLoad}**`);
  lines.push(`- API response (p95): **${nb.apiResponseP95}**`);
  lines.push(`- Time to Interactive: **${nb.timeToInteractive}**`);
  lines.push(`- 3G target: First paint **${nb.targets3G.firstLoad}**, TTI **${nb.targets3G.tti}**`);

  // Server
  lines.push('\n## 🖥️ Server Budget\n');
  const sb = budget.serverBudget;
  lines.push('| Metric | Target |');
  lines.push('|--------|--------|');
  lines.push(`| Response p50 | ${sb.responseTimeP50} |`);
  lines.push(`| Response p95 | ${sb.responseTimeP95} |`);
  lines.push(`| Response p99 | ${sb.responseTimeP99} |`);
  lines.push(`| Error rate | ${sb.errorRate} |`);
  lines.push(`| Throughput | ${sb.throughput} |`);

  // Tools
  lines.push('\n## 🛠️ Monitoring Tools\n');
  budget.monitoringTools.forEach(t => lines.push(`- ${t}`));

  // Recommendations
  lines.push('\n## 💡 Recommendations\n');
  budget.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
