/**
 * Tool 21: UI/UX Specification
 * Design system, components, responsive strategy, accessibility
 */

import type { ProjectType, ProjectScale } from '../types/index.js';

export interface UISpec {
  designSystem: DesignSystem;
  components: ComponentSpec[];
  pages: PageSpec[];
  responsive: ResponsiveStrategy;
  accessibility: AccessibilityChecklist;
  recommendations: string[];
}

interface DesignSystem {
  typography: { font: string; scale: string[] };
  colors: { primary: string; secondary: string; neutral: string; semantic: Record<string, string> };
  spacing: string;
  borderRadius: string;
  shadows: string;
  componentLibrary: { name: string; reason: string };
  iconLibrary: string;
}

interface ComponentSpec {
  name: string;
  category: string;
  priority: 'core' | 'important' | 'optional';
  variants: string[];
  states: string[];
}

interface PageSpec {
  name: string;
  route: string;
  layout: string;
  components: string[];
  responsive: string;
}

interface ResponsiveStrategy {
  approach: string;
  breakpoints: { name: string; minWidth: string; target: string }[];
  mobileFirst: boolean;
  touchTargetSize: string;
}

interface AccessibilityChecklist {
  level: 'A' | 'AA' | 'AAA';
  items: { check: string; status: 'required' | 'recommended' }[];
}

const projectPages: Partial<Record<ProjectType, PageSpec[]>> = {
  saas: [
    { name: 'Landing Page', route: '/', layout: 'marketing', components: ['Hero', 'Features', 'Pricing', 'Testimonials', 'CTA', 'Footer'], responsive: 'Stack sections vertically on mobile' },
    { name: 'Login/Register', route: '/auth', layout: 'centered', components: ['AuthForm', 'SocialLogin', 'ForgotPassword'], responsive: 'Full-width form on mobile' },
    { name: 'Dashboard', route: '/dashboard', layout: 'sidebar', components: ['Sidebar', 'StatsCards', 'Charts', 'RecentActivity', 'QuickActions'], responsive: 'Bottom nav on mobile, collapsible sidebar on tablet' },
    { name: 'Settings', route: '/settings', layout: 'sidebar', components: ['SettingsTabs', 'ProfileForm', 'BillingInfo', 'TeamManagement'], responsive: 'Full-width tabs on mobile' },
    { name: 'Billing', route: '/billing', layout: 'sidebar', components: ['PlanSelector', 'PaymentForm', 'InvoiceList', 'UsageChart'], responsive: 'Stack cards vertically' },
  ],
  ecommerce: [
    { name: 'Home', route: '/', layout: 'full', components: ['Hero', 'CategoryGrid', 'FeaturedProducts', 'Deals', 'Newsletter'], responsive: '2-col grid on mobile' },
    { name: 'Product Listing', route: '/products', layout: 'full', components: ['Filters', 'ProductGrid', 'Pagination', 'SortDropdown'], responsive: 'Filter drawer on mobile, 2-col grid' },
    { name: 'Product Detail', route: '/products/:id', layout: 'full', components: ['ImageGallery', 'ProductInfo', 'AddToCart', 'Reviews', 'Related'], responsive: 'Full-width images, sticky add-to-cart' },
    { name: 'Cart', route: '/cart', layout: 'full', components: ['CartItems', 'OrderSummary', 'CouponInput', 'CheckoutButton'], responsive: 'Stack layout on mobile' },
    { name: 'Checkout', route: '/checkout', layout: 'centered', components: ['AddressForm', 'PaymentForm', 'OrderReview'], responsive: 'Multi-step wizard on mobile' },
  ],
};

const featureComponents: Record<string, ComponentSpec[]> = {
  chat: [
    { name: 'ChatWindow', category: 'chat', priority: 'core', variants: ['full-page', 'sidebar', 'popup'], states: ['loading', 'empty', 'active', 'disconnected'] },
    { name: 'MessageBubble', category: 'chat', priority: 'core', variants: ['sent', 'received', 'system', 'with-attachment'], states: ['sending', 'sent', 'delivered', 'read', 'failed'] },
    { name: 'MessageInput', category: 'chat', priority: 'core', variants: ['basic', 'with-toolbar', 'with-emoji'], states: ['idle', 'typing', 'recording', 'disabled'] },
    { name: 'ConversationList', category: 'chat', priority: 'core', variants: ['compact', 'detailed'], states: ['loading', 'empty', 'filtered'] },
    { name: 'TypingIndicator', category: 'chat', priority: 'important', variants: ['dots', 'text'], states: ['visible', 'hidden'] },
    { name: 'OnlineStatusBadge', category: 'chat', priority: 'important', variants: ['dot', 'text'], states: ['online', 'offline', 'away', 'busy'] },
  ],
  ai: [
    { name: 'AIChat', category: 'ai', priority: 'core', variants: ['full-page', 'sidebar', 'modal'], states: ['idle', 'thinking', 'streaming', 'error'] },
    { name: 'AIResponseBubble', category: 'ai', priority: 'core', variants: ['text', 'markdown', 'code', 'with-sources'], states: ['streaming', 'complete', 'error'] },
    { name: 'SuggestedPrompts', category: 'ai', priority: 'important', variants: ['chips', 'cards', 'list'], states: ['visible', 'hidden'] },
  ],
  task: [
    { name: 'KanbanBoard', category: 'task', priority: 'core', variants: ['3-column', '5-column', 'custom'], states: ['loading', 'empty', 'dragging'] },
    { name: 'TaskCard', category: 'task', priority: 'core', variants: ['compact', 'detailed', 'mini'], states: ['idle', 'dragging', 'editing'] },
    { name: 'TaskDetailPanel', category: 'task', priority: 'core', variants: ['sidebar', 'modal', 'full-page'], states: ['viewing', 'editing', 'loading'] },
  ],
  video: [
    { name: 'VideoRoom', category: 'video', priority: 'core', variants: ['grid', 'spotlight', 'sidebar'], states: ['connecting', 'active', 'ended'] },
    { name: 'VideoControls', category: 'video', priority: 'core', variants: ['floating', 'bottom-bar'], states: ['muted', 'unmuted', 'screen-sharing'] },
  ],
};

export function generateUISpec(
  projectType: ProjectType,
  scale: ProjectScale,
  features: string[] = []
): UISpec {
  const featureText = features.join(' ').toLowerCase();

  // Design system
  const designSystem: DesignSystem = {
    typography: {
      font: "Inter (body) + JetBrains Mono (code)",
      scale: ['xs: 12px', 'sm: 14px', 'base: 16px', 'lg: 18px', 'xl: 20px', '2xl: 24px', '3xl: 30px', '4xl: 36px'],
    },
    colors: {
      primary: 'HSL(222, 47%, 51%) — #4361ee (Blue)',
      secondary: 'HSL(270, 50%, 60%) — #8b5cf6 (Purple)',
      neutral: 'HSL(220, 9%, scale) — Slate gray family',
      semantic: {
        success: 'HSL(142, 71%, 45%) — #22c55e (Green)',
        warning: 'HSL(38, 92%, 50%) — #f59e0b (Amber)',
        error: 'HSL(0, 84%, 60%) — #ef4444 (Red)',
        info: 'HSL(199, 89%, 48%) — #0ea5e9 (Sky)',
      },
    },
    spacing: '4px base unit (4, 8, 12, 16, 20, 24, 32, 48, 64)',
    borderRadius: 'sm: 4px, md: 8px, lg: 12px, xl: 16px, full: 9999px',
    shadows: 'sm: 0 1px 2px, md: 0 4px 6px, lg: 0 10px 15px, xl: 0 20px 25px',
    componentLibrary: scale === 'mvp'
      ? { name: 'shadcn/ui', reason: 'Copy-paste components, full customization, zero bundle overhead' }
      : { name: 'Radix UI + shadcn/ui', reason: 'Headless primitives + styled components, accessible by default' },
    iconLibrary: 'Lucide Icons (tree-shakable, consistent style, MIT license)',
  };

  // Base components
  const components: ComponentSpec[] = [
    { name: 'Button', category: 'base', priority: 'core', variants: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'icon'], states: ['default', 'hover', 'active', 'disabled', 'loading'] },
    { name: 'Input', category: 'form', priority: 'core', variants: ['text', 'email', 'password', 'search', 'textarea'], states: ['default', 'focus', 'error', 'disabled'] },
    { name: 'Select', category: 'form', priority: 'core', variants: ['single', 'multi', 'searchable', 'creatable'], states: ['default', 'open', 'loading', 'disabled'] },
    { name: 'Modal', category: 'overlay', priority: 'core', variants: ['sm', 'md', 'lg', 'full', 'sheet'], states: ['open', 'closing', 'closed'] },
    { name: 'Toast', category: 'feedback', priority: 'core', variants: ['success', 'error', 'warning', 'info'], states: ['entering', 'visible', 'exiting'] },
    { name: 'Avatar', category: 'data', priority: 'core', variants: ['image', 'initials', 'icon', 'group'], states: ['loading', 'loaded', 'error'] },
    { name: 'Badge', category: 'data', priority: 'core', variants: ['solid', 'outline', 'dot'], states: ['default'] },
    { name: 'Card', category: 'layout', priority: 'core', variants: ['default', 'interactive', 'compact', 'media'], states: ['default', 'hover', 'selected'] },
    { name: 'Sidebar', category: 'navigation', priority: 'core', variants: ['expanded', 'collapsed', 'mobile-drawer'], states: ['open', 'closed', 'transitioning'] },
    { name: 'DataTable', category: 'data', priority: 'important', variants: ['basic', 'sortable', 'filterable', 'selectable'], states: ['loading', 'empty', 'error', 'loaded'] },
    { name: 'Tabs', category: 'navigation', priority: 'core', variants: ['line', 'pill', 'segment'], states: ['default', 'disabled'] },
    { name: 'Dropdown', category: 'overlay', priority: 'core', variants: ['menu', 'action', 'context'], states: ['open', 'closed'] },
    { name: 'Skeleton', category: 'feedback', priority: 'important', variants: ['text', 'card', 'avatar', 'table'], states: ['loading'] },
    { name: 'EmptyState', category: 'feedback', priority: 'important', variants: ['no-data', 'no-results', 'error', 'onboarding'], states: ['default'] },
  ];

  // Add feature components
  for (const [key, comps] of Object.entries(featureComponents)) {
    if (featureText.includes(key)) {
      components.push(...comps);
    }
  }

  // Pages
  const pages = projectPages[projectType] || projectPages.saas!;

  if (featureText.includes('chat')) {
    pages.push({ name: 'Chat', route: '/chat', layout: 'full', components: ['ConversationList', 'ChatWindow', 'MessageInput'], responsive: 'Full-screen chat on mobile, list → detail navigation' });
  }
  if (featureText.includes('ai')) {
    pages.push({ name: 'AI Assistant', route: '/ai', layout: 'sidebar', components: ['AIChat', 'SuggestedPrompts', 'ChatHistory'], responsive: 'Full-screen chat on mobile' });
  }

  // Responsive
  const responsive: ResponsiveStrategy = {
    approach: 'Mobile-first responsive with CSS Container Queries for component-level responsiveness',
    breakpoints: [
      { name: 'sm', minWidth: '640px', target: 'Large phones (landscape)' },
      { name: 'md', minWidth: '768px', target: 'Tablets' },
      { name: 'lg', minWidth: '1024px', target: 'Laptops' },
      { name: 'xl', minWidth: '1280px', target: 'Desktops' },
      { name: '2xl', minWidth: '1536px', target: 'Large screens' },
    ],
    mobileFirst: true,
    touchTargetSize: '44x44px minimum (WCAG 2.5.5)',
  };

  // Accessibility
  const accessibility: AccessibilityChecklist = {
    level: 'AA',
    items: [
      { check: 'Color contrast ratio ≥ 4.5:1 (text) / 3:1 (large text)', status: 'required' },
      { check: 'All images have alt text', status: 'required' },
      { check: 'Keyboard navigation works for all interactive elements', status: 'required' },
      { check: 'Focus indicators visible on all focusable elements', status: 'required' },
      { check: 'Form fields have visible labels (not just placeholder)', status: 'required' },
      { check: 'Error messages are linked to form fields (aria-describedby)', status: 'required' },
      { check: 'Page has single h1, logical heading hierarchy', status: 'required' },
      { check: 'Skip to content link', status: 'required' },
      { check: 'Semantic HTML (nav, main, article, aside, footer)', status: 'required' },
      { check: 'Screen reader testing (VoiceOver/NVDA)', status: 'recommended' },
      { check: 'Reduced motion support (@media prefers-reduced-motion)', status: 'recommended' },
      { check: 'Dark mode with proper contrast', status: 'recommended' },
    ],
  };

  const recommendations: string[] = [
    '🎨 **Design tokens in CSS variables** — dễ theme, dark mode, white-label',
    '📱 **Mobile-first** — design cho mobile trước, enhance cho desktop',
    '🧩 **Component library**: shadcn/ui — copy-paste, customize hoàn toàn, không dependency lock',
    '🌙 **Dark mode từ đầu** — dùng CSS variables, switch với 1 class',
    '♿ **Accessibility là requirement, không phải nice-to-have** — test với axe-core',
    '🔤 **Typography**: Inter từ Google Fonts — clean, professional, nhiều weight',
    '📐 **Consistent spacing** — dùng 4px grid system (4, 8, 12, 16, 24, 32)',
    '🎭 **Loading states cho mọi component** — Skeleton, not spinners',
    '❌ **Error states rõ ràng** — không bao giờ cho user thấy blank page',
  ];

  return { designSystem, components, pages, responsive, accessibility, recommendations };
}

export function formatUISpec(spec: UISpec): string {
  const lines = ['# 🎨 UI/UX Specification\n'];

  // Design System
  lines.push('## 🎨 Design System\n');
  lines.push(`**Font**: ${spec.designSystem.typography.font}`);
  lines.push(`**Component Library**: ${spec.designSystem.componentLibrary.name} — ${spec.designSystem.componentLibrary.reason}`);
  lines.push(`**Icons**: ${spec.designSystem.iconLibrary}\n`);

  lines.push('### Colors\n');
  lines.push(`- **Primary**: ${spec.designSystem.colors.primary}`);
  lines.push(`- **Secondary**: ${spec.designSystem.colors.secondary}`);
  lines.push(`- **Neutral**: ${spec.designSystem.colors.neutral}`);
  Object.entries(spec.designSystem.colors.semantic).forEach(([k, v]) =>
    lines.push(`- **${k}**: ${v}`)
  );

  lines.push(`\n**Spacing**: ${spec.designSystem.spacing}`);
  lines.push(`**Border Radius**: ${spec.designSystem.borderRadius}`);
  lines.push(`**Shadows**: ${spec.designSystem.shadows}`);

  // Components
  lines.push('\n## 🧩 Components\n');
  lines.push('| Component | Category | Priority | Variants | States |');
  lines.push('|-----------|----------|----------|----------|--------|');
  spec.components.forEach(c =>
    lines.push(`| **${c.name}** | ${c.category} | ${c.priority} | ${c.variants.length} | ${c.states.length} |`)
  );

  // Pages
  lines.push('\n## 📄 Pages\n');
  for (const p of spec.pages) {
    lines.push(`### ${p.name} (\`${p.route}\`)`);
    lines.push(`Layout: ${p.layout} | Components: ${p.components.join(', ')}`);
    lines.push(`📱 Mobile: ${p.responsive}\n`);
  }

  // Responsive
  lines.push('## 📱 Responsive Strategy\n');
  lines.push(`**Approach**: ${spec.responsive.approach}`);
  lines.push(`**Touch target**: ${spec.responsive.touchTargetSize}\n`);
  lines.push('| Breakpoint | Min Width | Target |');
  lines.push('|------------|-----------|--------|');
  spec.responsive.breakpoints.forEach(b =>
    lines.push(`| ${b.name} | ${b.minWidth} | ${b.target} |`)
  );

  // Accessibility
  lines.push(`\n## ♿ Accessibility (WCAG ${spec.accessibility.level})\n`);
  spec.accessibility.items.forEach(i =>
    lines.push(`- ${i.status === 'required' ? '☐' : '○'} ${i.check}`)
  );

  // Recommendations
  lines.push('\n## 💡 Recommendations\n');
  spec.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
