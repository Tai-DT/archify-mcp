import type { StackRecommendation } from '../types/index.js';

export interface BoilerplateOutput {
  files: GeneratedFile[];
  summary: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  description: string;
}

export function generateBoilerplate(
  stack: StackRecommendation,
  projectName: string,
  hasDocker: boolean = true,
  hasCiCd: boolean = true
): BoilerplateOutput {
  const files: GeneratedFile[] = [];

  // .env.example
  const envVars: string[] = [
    '# Server',
    `APP_NAME=${projectName}`,
    'NODE_ENV=development',
    'PORT=3000',
    '',
  ];

  if (stack.database) {
    envVars.push('# Database');
    if (['PostgreSQL', 'Neon', 'Supabase'].some(n => stack.database!.technology.name.includes(n))) {
      envVars.push('DATABASE_URL=postgresql://user:password@localhost:5432/dbname');
    } else if (stack.database.technology.name.includes('MySQL')) {
      envVars.push('DATABASE_URL=mysql://user:password@localhost:3306/dbname');
    } else if (stack.database.technology.name.includes('MongoDB')) {
      envVars.push('MONGODB_URI=mongodb://localhost:27017/dbname');
    }
    envVars.push('');
  }

  if (stack.cache) {
    envVars.push('# Cache');
    envVars.push('REDIS_URL=redis://localhost:6379');
    envVars.push('');
  }

  if (stack.auth) {
    envVars.push('# Authentication');
    if (stack.auth.technology.name.includes('Clerk')) {
      envVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx');
      envVars.push('CLERK_SECRET_KEY=sk_test_xxx');
    } else if (stack.auth.technology.name.includes('Auth0')) {
      envVars.push('AUTH0_DOMAIN=your-tenant.auth0.com');
      envVars.push('AUTH0_CLIENT_ID=xxx');
      envVars.push('AUTH0_CLIENT_SECRET=xxx');
    } else {
      envVars.push('JWT_SECRET=your-secret-key-change-in-production');
      envVars.push('JWT_EXPIRES_IN=7d');
    }
    envVars.push('');
  }

  if (stack.payment) {
    envVars.push('# Payment');
    envVars.push('STRIPE_SECRET_KEY=sk_test_xxx');
    envVars.push('STRIPE_WEBHOOK_SECRET=whsec_xxx');
    envVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx');
    envVars.push('');
  }

  if (stack.cloud) {
    envVars.push('# Cloud/Storage');
    if (stack.cloud.technology.name.includes('AWS')) {
      envVars.push('AWS_ACCESS_KEY_ID=xxx');
      envVars.push('AWS_SECRET_ACCESS_KEY=xxx');
      envVars.push('AWS_REGION=us-east-1');
      envVars.push('AWS_S3_BUCKET=your-bucket');
    } else if (stack.cloud.technology.name.includes('Cloudflare')) {
      envVars.push('CLOUDFLARE_ACCOUNT_ID=xxx');
      envVars.push('CLOUDFLARE_API_TOKEN=xxx');
    }
    envVars.push('');
  }

  if (stack.monitoring) {
    envVars.push('# Monitoring');
    envVars.push('SENTRY_DSN=https://xxx@sentry.io/xxx');
    envVars.push('');
  }

  files.push({
    path: '.env.example',
    content: envVars.join('\n'),
    description: 'Environment variables template',
  });

  // Docker Compose
  if (hasDocker) {
    const services: string[] = ['version: "3.9"', '', 'services:'];

    // App service
    services.push(`  ${projectName.toLowerCase().replace(/\s+/g, '-')}:`);
    services.push('    build: .');
    services.push('    ports:');
    services.push('      - "3000:3000"');
    services.push('    env_file:');
    services.push('      - .env');
    const depends: string[] = [];

    // Database
    if (stack.database) {
      const dbName = stack.database.technology.name;
      if (dbName.includes('PostgreSQL') || dbName.includes('Neon') || dbName.includes('Supabase')) {
        depends.push('postgres');
        services.push('');
        services.push('  postgres:');
        services.push('    image: postgres:16-alpine');
        services.push('    environment:');
        services.push('      POSTGRES_USER: user');
        services.push('      POSTGRES_PASSWORD: password');
        services.push('      POSTGRES_DB: dbname');
        services.push('    ports:');
        services.push('      - "5432:5432"');
        services.push('    volumes:');
        services.push('      - postgres_data:/var/lib/postgresql/data');
      } else if (dbName.includes('MySQL')) {
        depends.push('mysql');
        services.push('');
        services.push('  mysql:');
        services.push('    image: mysql:8');
        services.push('    environment:');
        services.push('      MYSQL_ROOT_PASSWORD: password');
        services.push('      MYSQL_DATABASE: dbname');
        services.push('    ports:');
        services.push('      - "3306:3306"');
        services.push('    volumes:');
        services.push('      - mysql_data:/var/lib/mysql');
      } else if (dbName.includes('MongoDB')) {
        depends.push('mongo');
        services.push('');
        services.push('  mongo:');
        services.push('    image: mongo:7');
        services.push('    ports:');
        services.push('      - "27017:27017"');
        services.push('    volumes:');
        services.push('      - mongo_data:/data/db');
      }
    }

    // Redis
    if (stack.cache) {
      depends.push('redis');
      services.push('');
      services.push('  redis:');
      services.push('    image: redis:7-alpine');
      services.push('    ports:');
      services.push('      - "6379:6379"');
    }

    if (depends.length > 0) {
      // Insert depends_on after env_file
      const envFileIdx = services.indexOf('      - .env');
      services.splice(envFileIdx + 1, 0, '    depends_on:', ...depends.map(d => `      - ${d}`));
    }

    // Volumes
    services.push('');
    services.push('volumes:');
    if (stack.database?.technology.name.includes('PostgreSQL')) services.push('  postgres_data:');
    if (stack.database?.technology.name.includes('MySQL')) services.push('  mysql_data:');
    if (stack.database?.technology.name.includes('MongoDB')) services.push('  mongo_data:');

    files.push({
      path: 'docker-compose.yml',
      content: services.join('\n'),
      description: 'Docker Compose for local development',
    });

    // Dockerfile
    files.push({
      path: 'Dockerfile',
      content: [
        'FROM node:20-alpine AS builder',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci',
        'COPY . .',
        'RUN npm run build',
        '',
        'FROM node:20-alpine AS runner',
        'WORKDIR /app',
        'ENV NODE_ENV=production',
        'COPY --from=builder /app/dist ./dist',
        'COPY --from=builder /app/node_modules ./node_modules',
        'COPY --from=builder /app/package.json ./package.json',
        'EXPOSE 3000',
        'CMD ["node", "dist/index.js"]',
      ].join('\n'),
      description: 'Multi-stage Dockerfile for production',
    });
  }

  // GitHub Actions CI/CD
  if (hasCiCd) {
    const cicd = [
      'name: CI/CD Pipeline',
      '',
      'on:',
      '  push:',
      '    branches: [main]',
      '  pull_request:',
      '    branches: [main]',
      '',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - uses: actions/setup-node@v4',
      '        with:',
      '          node-version: 20',
      '          cache: npm',
      '      - run: npm ci',
      '      - run: npm run lint',
      '      - run: npm run type-check',
      '      - run: npm test',
      '',
      '  build:',
      '    needs: test',
      '    runs-on: ubuntu-latest',
      '    if: github.ref == \'refs/heads/main\'',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - uses: actions/setup-node@v4',
      '        with:',
      '          node-version: 20',
      '          cache: npm',
      '      - run: npm ci',
      '      - run: npm run build',
    ];

    if (hasDocker) {
      cicd.push(
        '',
        '  docker:',
        '    needs: build',
        '    runs-on: ubuntu-latest',
        '    if: github.ref == \'refs/heads/main\'',
        '    steps:',
        '      - uses: actions/checkout@v4',
        '      - uses: docker/setup-buildx-action@v3',
        '      - uses: docker/build-push-action@v5',
        '        with:',
        '          context: .',
        '          push: false',
        '          tags: ${{ github.repository }}:latest',
      );
    }

    files.push({
      path: '.github/workflows/ci.yml',
      content: cicd.join('\n'),
      description: 'GitHub Actions CI/CD pipeline',
    });
  }

  // .gitignore
  files.push({
    path: '.gitignore',
    content: [
      'node_modules/', 'dist/', '.next/', '.nuxt/', 'build/',
      '.env', '.env.local', '.env.*.local',
      '*.log', '.DS_Store', 'coverage/',
      '.turbo/', '.vercel/', '.output/',
    ].join('\n'),
    description: 'Git ignore rules',
  });

  const summary = `Generated ${files.length} config files for **${projectName}** using ${stack.frontend?.technology.name || 'N/A'} + ${stack.backend?.technology.name || 'N/A'} + ${stack.database?.technology.name || 'N/A'}`;

  return { files, summary };
}

export function formatBoilerplate(output: BoilerplateOutput): string {
  const lines = ['# 📦 Generated Boilerplate\n'];
  lines.push(`${output.summary}\n`);

  for (const file of output.files) {
    lines.push(`## 📄 \`${file.path}\``);
    lines.push(`> ${file.description}\n`);
    const ext = file.path.split('.').pop() || 'text';
    const lang = ext === 'yml' ? 'yaml' : ext === 'env' ? 'bash' : ext;
    lines.push(`\`\`\`${lang}`);
    lines.push(file.content);
    lines.push('```\n');
  }

  return lines.join('\n');
}
