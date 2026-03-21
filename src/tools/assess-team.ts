/**
 * Tool 18: Assess Team
 * Đánh giá team cần bao nhiêu người, skills gì, hiring plan
 */

import type { ProjectType, ProjectScale, StackRecommendation } from '../types/index.js';

export interface TeamAssessment {
  teamSize: TeamSizeRecommendation;
  roles: Role[];
  skillGaps: SkillGap[];
  hiringPlan: HiringPhase[];
  orgStructure: string;
  recommendations: string[];
}

interface TeamSizeRecommendation {
  minimum: number;
  recommended: number;
  optimal: number;
  reasoning: string;
}

interface Role {
  title: string;
  count: number;
  priority: 'critical' | 'important' | 'nice-to-have';
  skills: string[];
  salaryRange: string;
  canBeFreelance: boolean;
}

interface SkillGap {
  skill: string;
  importance: 'critical' | 'high' | 'medium';
  solution: string;
}

interface HiringPhase {
  phase: string;
  timeline: string;
  roles: string[];
  budget: string;
}

export function assessTeam(
  projectType: ProjectType,
  scale: ProjectScale,
  stack?: StackRecommendation,
  features: string[] = [],
  currentTeamSize: number = 1
): TeamAssessment {
  const featureText = features.join(' ').toLowerCase();
  const hasChat = featureText.includes('chat') || featureText.includes('realtime');
  const hasAI = featureText.includes('ai') || featureText.includes('ml');
  const hasMobile = featureText.includes('mobile') || !!stack?.mobile;
  const hasVideo = featureText.includes('video');

  // Team size recommendations by scale
  const sizeMap: Record<ProjectScale, { min: number; rec: number; opt: number }> = {
    mvp: { min: 1, rec: 2, opt: 3 },
    startup: { min: 3, rec: 5, opt: 8 },
    growth: { min: 5, rec: 10, opt: 15 },
    enterprise: { min: 10, rec: 20, opt: 40 },
  };
  const size = sizeMap[scale];

  // Roles
  const roles: Role[] = [];

  // Always needed
  roles.push({
    title: 'Full-stack Developer',
    count: scale === 'mvp' ? 1 : scale === 'startup' ? 2 : 3,
    priority: 'critical',
    skills: ['TypeScript', 'React/Next.js', 'Node.js', 'PostgreSQL', 'Git'],
    salaryRange: '$3,000-8,000/mo (VN) | $6,000-15,000/mo (US)',
    canBeFreelance: scale === 'mvp',
  });

  if (scale !== 'mvp') {
    roles.push({
      title: 'Backend Developer',
      count: scale === 'startup' ? 1 : 2,
      priority: 'critical',
      skills: ['Node.js/Go/Python', 'PostgreSQL', 'Redis', 'API design', 'Docker'],
      salaryRange: '$3,000-7,000/mo (VN) | $7,000-15,000/mo (US)',
      canBeFreelance: false,
    });

    roles.push({
      title: 'Frontend Developer',
      count: scale === 'startup' ? 1 : 2,
      priority: 'important',
      skills: ['React/Next.js', 'TypeScript', 'CSS/Tailwind', 'State management', 'Testing'],
      salaryRange: '$2,500-6,000/mo (VN) | $5,000-12,000/mo (US)',
      canBeFreelance: true,
    });
  }

  if (hasMobile) {
    roles.push({
      title: 'Mobile Developer',
      count: 1,
      priority: 'important',
      skills: ['React Native / Flutter', 'iOS/Android', 'Push Notifications', 'App Store deployment'],
      salaryRange: '$3,000-7,000/mo (VN) | $7,000-15,000/mo (US)',
      canBeFreelance: true,
    });
  }

  if (hasAI) {
    roles.push({
      title: 'AI/ML Engineer',
      count: 1,
      priority: 'important',
      skills: ['Python', 'LLM APIs (OpenAI, Gemini)', 'Prompt Engineering', 'RAG', 'Vector DB'],
      salaryRange: '$5,000-10,000/mo (VN) | $10,000-20,000/mo (US)',
      canBeFreelance: true,
    });
  }

  if (scale !== 'mvp') {
    roles.push({
      title: 'DevOps / SRE',
      count: scale === 'enterprise' ? 2 : 1,
      priority: scale === 'growth' || scale === 'enterprise' ? 'critical' : 'nice-to-have',
      skills: ['Docker', 'K8s', 'CI/CD', 'AWS/GCP', 'Monitoring', 'Linux'],
      salaryRange: '$4,000-8,000/mo (VN) | $8,000-18,000/mo (US)',
      canBeFreelance: true,
    });
  }

  if (scale === 'growth' || scale === 'enterprise') {
    roles.push({
      title: 'QA Engineer',
      count: 1,
      priority: 'important',
      skills: ['Playwright/Cypress', 'API testing', 'Performance testing', 'Test automation'],
      salaryRange: '$2,000-5,000/mo (VN) | $5,000-10,000/mo (US)',
      canBeFreelance: true,
    });

    roles.push({
      title: 'Product Manager',
      count: 1,
      priority: 'important',
      skills: ['Product strategy', 'Agile/Scrum', 'User research', 'Data analysis'],
      salaryRange: '$3,000-8,000/mo (VN) | $8,000-18,000/mo (US)',
      canBeFreelance: false,
    });
  }

  roles.push({
    title: 'UI/UX Designer',
    count: 1,
    priority: scale === 'mvp' ? 'nice-to-have' : 'important',
    skills: ['Figma', 'User research', 'Design system', 'Prototyping'],
    salaryRange: '$2,000-5,000/mo (VN) | $5,000-12,000/mo (US)',
    canBeFreelance: true,
  });

  // Skill gaps
  const skillGaps: SkillGap[] = [];
  if (hasChat) {
    skillGaps.push({ skill: 'WebSocket / Real-time systems', importance: 'critical', solution: 'Hire backend dev với kinh nghiệm Socket.IO/Redis Pub-Sub, hoặc dùng BaaS (Ably, Pusher)' });
  }
  if (hasAI) {
    skillGaps.push({ skill: 'AI/LLM Integration', importance: 'critical', solution: 'Hire AI engineer hoặc train existing dev về LLM APIs + prompt engineering (2-3 tuần)' });
  }
  if (hasVideo) {
    skillGaps.push({ skill: 'WebRTC / Video Streaming', importance: 'high', solution: 'Dùng SaaS (Daily.co, Agora, Twilio) thay vì tự build — giảm complexity 10x' });
  }
  if (hasMobile && currentTeamSize < 3) {
    skillGaps.push({ skill: 'Mobile Development', importance: 'high', solution: 'Hire mobile dev hoặc dùng React Native/Flutter với existing web devs (learning curve 2-4 tuần)' });
  }
  skillGaps.push({ skill: 'DevOps / CI/CD', importance: 'medium', solution: 'Dùng managed platforms (Vercel, Railway) giảm ops burden ban đầu. Hire DevOps khi đạt 10K users.' });

  // Hiring plan
  const hiringPlan: HiringPhase[] = [
    {
      phase: 'Phase 1: Foundation (Month 1-2)',
      timeline: '0-2 months',
      roles: ['Full-stack Developer (lead)', ...(hasMobile ? ['Mobile Developer'] : []), 'UI/UX Designer (freelance)'],
      budget: '$5,000-15,000/mo',
    },
    {
      phase: 'Phase 2: Growth (Month 3-6)',
      timeline: '3-6 months',
      roles: ['Backend Developer', ...(hasAI ? ['AI Engineer'] : []), 'QA Engineer (part-time)'],
      budget: '$10,000-30,000/mo',
    },
    {
      phase: 'Phase 3: Scale (Month 6-12)',
      timeline: '6-12 months',
      roles: ['DevOps/SRE', 'Frontend Developer', 'Product Manager'],
      budget: '$20,000-50,000/mo',
    },
  ];

  // Org structure
  const orgStructure = scale === 'mvp'
    ? '🏠 **Flat**: 1-3 người, mỗi người đảm nhận nhiều vai trò. Founder = PM + Dev.'
    : scale === 'startup'
    ? '🏢 **Small team**: Tech Lead + 2-3 Devs + Designer. Scrum sprints 2 tuần.'
    : scale === 'growth'
    ? '🏗️ **Feature teams**: 2-3 squads (Product, Growth, Platform), mỗi squad 3-5 người.'
    : '🏛️ **Department structure**: Engineering, Product, Design, QA, DevOps, Data. Tech leads per team.';

  const recommendations = [
    '🎯 **Hire T-shaped developers** — chuyên 1 lĩnh vực nhưng biết nhiều lĩnh vực khác',
    '💡 **MVP giai đoạn đầu**: dùng freelancer cho design, part-time cho QA',
    '📋 **Code review bắt buộc** — tối thiểu 1 approval trước khi merge',
    '🔄 **Pair programming** cho onboarding — rút ngắn thời gian ramp-up từ 4 tuần → 2 tuần',
    '📚 **Technical documentation** — wiki nội bộ, ADR (Architecture Decision Records)',
    `🧑‍💻 **Current team (${currentTeamSize}) vs recommended (${size.rec})**: ${currentTeamSize >= size.rec ? '✅ Đủ' : `⚠️ Cần thêm ${size.rec - currentTeamSize} người`}`,
  ];

  return {
    teamSize: {
      minimum: size.min,
      recommended: size.rec,
      optimal: size.opt,
      reasoning: `${projectType} ở quy mô ${scale} cần tối thiểu ${size.min} dev, khuyến nghị ${size.rec}, tối ưu ${size.opt} người.`,
    },
    roles,
    skillGaps,
    hiringPlan,
    orgStructure,
    recommendations,
  };
}

export function formatTeamAssessment(assessment: TeamAssessment): string {
  const lines = ['# 👥 Team Assessment\n'];

  // Team size
  lines.push('## 📊 Team Size\n');
  lines.push(`| | Minimum | Recommended | Optimal |`);
  lines.push(`|---|---------|-------------|---------|`);
  lines.push(`| **People** | ${assessment.teamSize.minimum} | **${assessment.teamSize.recommended}** | ${assessment.teamSize.optimal} |`);
  lines.push(`\n${assessment.teamSize.reasoning}\n`);

  // Org structure
  lines.push(`## 🏢 Organization\n\n${assessment.orgStructure}\n`);

  // Roles
  lines.push('## 🎭 Required Roles\n');
  lines.push('| Role | Count | Priority | Salary (VN) | Freelance? |');
  lines.push('|------|-------|----------|-------------|------------|');
  assessment.roles.forEach(r =>
    lines.push(`| **${r.title}** | ${r.count} | ${r.priority} | ${r.salaryRange.split('|')[0].trim()} | ${r.canBeFreelance ? '✅' : '❌'} |`)
  );

  lines.push('\n**Key skills per role**:');
  assessment.roles.filter(r => r.priority !== 'nice-to-have').forEach(r =>
    lines.push(`- **${r.title}**: ${r.skills.join(', ')}`)
  );

  // Skill gaps
  if (assessment.skillGaps.length > 0) {
    lines.push('\n## ⚠️ Skill Gaps\n');
    assessment.skillGaps.forEach(g =>
      lines.push(`- [${g.importance.toUpperCase()}] **${g.skill}**: ${g.solution}`)
    );
  }

  // Hiring plan
  lines.push('\n## 📅 Hiring Plan\n');
  assessment.hiringPlan.forEach(p => {
    lines.push(`### ${p.phase}`);
    lines.push(`Timeline: ${p.timeline} | Budget: ${p.budget}`);
    p.roles.forEach(r => lines.push(`- ${r}`));
    lines.push('');
  });

  // Recommendations
  lines.push('## 💡 Recommendations\n');
  assessment.recommendations.forEach(r => lines.push(`- ${r}`));

  return lines.join('\n');
}
