import type { ProjectType, FeatureSuggestion, Feature } from '../types/index.js';
import { featureTemplates } from '../knowledge/features-db.js';

const innovativeFeatures: Partial<Record<ProjectType, Feature[]>> = {
  ecommerce: [
    { name: 'AI Shopping Assistant', description: 'Conversational AI that helps users find products based on natural language queries', priority: 'could_have', complexity: 'high', estimatedDays: 8, techRequirements: ['ai', 'llm'], dependencies: ['Product Catalog'], category: 'ai' },
    { name: 'AR Product Preview', description: 'Augmented reality to visualize products in real environment', priority: 'could_have', complexity: 'very_high', estimatedDays: 15, techRequirements: ['ar-sdk', 'webgl'], dependencies: ['Product Catalog'], category: 'innovation' },
    { name: 'Social Shopping', description: 'Share carts, collaborative wishlists, social proof', priority: 'could_have', complexity: 'medium', estimatedDays: 5, techRequirements: ['realtime', 'social'], dependencies: [], category: 'social' },
  ],
  saas: [
    { name: 'AI Copilot', description: 'Natural language interface to perform actions and get insights', priority: 'could_have', complexity: 'very_high', estimatedDays: 15, techRequirements: ['ai', 'llm'], dependencies: ['Dashboard & Analytics'], category: 'ai' },
    { name: 'Custom Automations', description: 'User-defined automation workflows (like Zapier built-in)', priority: 'could_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['workflow-engine'], dependencies: [], category: 'automation' },
    { name: 'White-label Support', description: 'Allow enterprise clients to brand the product as their own', priority: 'could_have', complexity: 'high', estimatedDays: 8, techRequirements: ['theming', 'multi-tenant'], dependencies: [], category: 'enterprise' },
  ],
  social_network: [
    { name: 'AI Content Suggestions', description: 'AI-powered content creation assistance and suggestions', priority: 'could_have', complexity: 'high', estimatedDays: 8, techRequirements: ['ai'], dependencies: ['Content Creation'], category: 'ai' },
    { name: 'Stories / Reels', description: 'Ephemeral content with short-form video support', priority: 'could_have', complexity: 'very_high', estimatedDays: 12, techRequirements: ['video', 'storage'], dependencies: ['Content Creation'], category: 'content' },
  ],
  marketplace: [
    { name: 'AI Matching', description: 'Intelligent matching between buyers and sellers based on preferences', priority: 'could_have', complexity: 'high', estimatedDays: 8, techRequirements: ['ai', 'algorithm'], dependencies: [], category: 'ai' },
    { name: 'Dynamic Pricing', description: 'AI-driven pricing suggestions based on demand and competition', priority: 'could_have', complexity: 'high', estimatedDays: 7, techRequirements: ['ai', 'analytics'], dependencies: [], category: 'pricing' },
  ],
};

export function suggestFeatures(
  projectType: ProjectType,
  existingFeatures: string[] = []
): FeatureSuggestion {
  const templates = featureTemplates[projectType] || featureTemplates.other;
  const allFeatures = templates.flatMap(g => g.features);
  const innovative = innovativeFeatures[projectType] || [];

  // Filter out existing features (case-insensitive match)
  const existingLower = existingFeatures.map(f => f.toLowerCase());
  const filterExisting = (features: Feature[]) =>
    features.filter(f => !existingLower.includes(f.name.toLowerCase()));

  const mustHave = filterExisting(allFeatures.filter(f => f.priority === 'must_have'));
  const shouldHave = filterExisting(allFeatures.filter(f => f.priority === 'should_have'));
  const couldHave = filterExisting(allFeatures.filter(f => f.priority === 'could_have'));

  return {
    mustHave,
    shouldHave,
    couldHave,
    innovative: filterExisting(innovative),
  };
}

export function formatFeatureSuggestions(suggestion: FeatureSuggestion): string {
  const sections: string[] = ['# 💡 Feature Suggestions\n'];

  const formatFeature = (f: Feature) =>
    `- **${f.name}** — ${f.description}\n  - Complexity: \`${f.complexity}\` | Est: \`${f.estimatedDays} days\` | Requires: ${f.techRequirements.join(', ')}`;

  if (suggestion.mustHave.length > 0) {
    sections.push('## 🔴 Must-Have (Core features)\n');
    sections.push(suggestion.mustHave.map(formatFeature).join('\n'));
  }
  if (suggestion.shouldHave.length > 0) {
    sections.push('\n## 🟡 Should-Have (Important but not critical)\n');
    sections.push(suggestion.shouldHave.map(formatFeature).join('\n'));
  }
  if (suggestion.couldHave.length > 0) {
    sections.push('\n## 🟢 Could-Have (Nice additions)\n');
    sections.push(suggestion.couldHave.map(formatFeature).join('\n'));
  }
  if (suggestion.innovative.length > 0) {
    sections.push('\n## 🚀 Innovative / Differentiators\n');
    sections.push(suggestion.innovative.map(formatFeature).join('\n'));
  }

  const totalDays = [...suggestion.mustHave, ...suggestion.shouldHave].reduce((s, f) => s + f.estimatedDays, 0);
  sections.push(`\n---\n📊 **Estimated total (Must + Should)**: ~${totalDays} development days (~${Math.ceil(totalDays / 5)} weeks for 1 developer)`);

  return sections.join('\n');
}
