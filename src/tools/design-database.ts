import type { ProjectType } from '../types/index.js';

export interface DatabaseSchema {
  tables: TableDesign[];
  relationships: Relationship[];
  indexes: IndexSuggestion[];
  erDiagram: string; // Mermaid ER diagram
  recommendations: string[];
  databaseType: 'relational' | 'document' | 'hybrid';
}

export interface TableDesign {
  name: string;
  description: string;
  columns: Column[];
  primaryKey: string;
  timestamps: boolean;
  softDelete: boolean;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  defaultValue?: string;
  description: string;
  foreignKey?: { table: string; column: string };
}

export interface Relationship {
  from: string;
  to: string;
  type: '1:1' | '1:N' | 'N:M';
  description: string;
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist' | 'unique' | 'composite';
  reason: string;
}

const schemaTemplates: Record<string, () => DatabaseSchema> = {
  ecommerce: () => ({
    databaseType: 'relational',
    tables: [
      {
        name: 'users', description: 'Customer and admin accounts',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'email', type: 'VARCHAR(255)', nullable: false, unique: true, description: 'Login email' },
          { name: 'password_hash', type: 'VARCHAR(255)', nullable: false, unique: false, description: 'Hashed password' },
          { name: 'full_name', type: 'VARCHAR(255)', nullable: false, unique: false, description: 'Display name' },
          { name: 'phone', type: 'VARCHAR(20)', nullable: true, unique: false, description: 'Phone number' },
          { name: 'role', type: "ENUM('customer','admin','staff')", nullable: false, unique: false, defaultValue: "'customer'", description: 'User role' },
          { name: 'avatar_url', type: 'TEXT', nullable: true, unique: false, description: 'Profile image' },
          { name: 'is_verified', type: 'BOOLEAN', nullable: false, unique: false, defaultValue: 'false', description: 'Email verified' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: true,
      },
      {
        name: 'products', description: 'Product catalog',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'name', type: 'VARCHAR(500)', nullable: false, unique: false, description: 'Product name' },
          { name: 'slug', type: 'VARCHAR(500)', nullable: false, unique: true, description: 'URL-friendly name' },
          { name: 'description', type: 'TEXT', nullable: true, unique: false, description: 'Product description' },
          { name: 'price', type: 'DECIMAL(12,2)', nullable: false, unique: false, description: 'Current price' },
          { name: 'compare_at_price', type: 'DECIMAL(12,2)', nullable: true, unique: false, description: 'Original price (for discounts)' },
          { name: 'sku', type: 'VARCHAR(100)', nullable: true, unique: true, description: 'Stock keeping unit' },
          { name: 'stock_quantity', type: 'INTEGER', nullable: false, unique: false, defaultValue: '0', description: 'Available stock' },
          { name: 'category_id', type: 'UUID', nullable: true, unique: false, description: 'Product category', foreignKey: { table: 'categories', column: 'id' } },
          { name: 'status', type: "ENUM('draft','active','archived')", nullable: false, unique: false, defaultValue: "'draft'", description: 'Product status' },
          { name: 'image_urls', type: 'JSONB', nullable: true, unique: false, description: 'Product images array' },
          { name: 'metadata', type: 'JSONB', nullable: true, unique: false, description: 'Custom attributes' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: true,
      },
      {
        name: 'categories', description: 'Product categories (hierarchical)',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, unique: false, description: 'Category name' },
          { name: 'slug', type: 'VARCHAR(255)', nullable: false, unique: true, description: 'URL slug' },
          { name: 'parent_id', type: 'UUID', nullable: true, unique: false, description: 'Parent category', foreignKey: { table: 'categories', column: 'id' } },
          { name: 'sort_order', type: 'INTEGER', nullable: false, unique: false, defaultValue: '0', description: 'Display order' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
      {
        name: 'orders', description: 'Customer orders',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'order_number', type: 'VARCHAR(50)', nullable: false, unique: true, description: 'Human-readable order number' },
          { name: 'user_id', type: 'UUID', nullable: false, unique: false, description: 'Customer', foreignKey: { table: 'users', column: 'id' } },
          { name: 'status', type: "ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded')", nullable: false, unique: false, defaultValue: "'pending'", description: 'Order status' },
          { name: 'subtotal', type: 'DECIMAL(12,2)', nullable: false, unique: false, description: 'Before tax/shipping' },
          { name: 'tax_amount', type: 'DECIMAL(12,2)', nullable: false, unique: false, defaultValue: '0', description: 'Tax' },
          { name: 'shipping_fee', type: 'DECIMAL(12,2)', nullable: false, unique: false, defaultValue: '0', description: 'Shipping cost' },
          { name: 'discount_amount', type: 'DECIMAL(12,2)', nullable: false, unique: false, defaultValue: '0', description: 'Discount applied' },
          { name: 'total', type: 'DECIMAL(12,2)', nullable: false, unique: false, description: 'Final total' },
          { name: 'shipping_address', type: 'JSONB', nullable: false, unique: false, description: 'Delivery address' },
          { name: 'payment_method', type: 'VARCHAR(50)', nullable: true, unique: false, description: 'Payment method used' },
          { name: 'payment_intent_id', type: 'VARCHAR(255)', nullable: true, unique: false, description: 'Stripe payment intent' },
          { name: 'notes', type: 'TEXT', nullable: true, unique: false, description: 'Customer notes' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
      {
        name: 'order_items', description: 'Items within an order',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'order_id', type: 'UUID', nullable: false, unique: false, description: 'Parent order', foreignKey: { table: 'orders', column: 'id' } },
          { name: 'product_id', type: 'UUID', nullable: false, unique: false, description: 'Product', foreignKey: { table: 'products', column: 'id' } },
          { name: 'quantity', type: 'INTEGER', nullable: false, unique: false, description: 'Quantity ordered' },
          { name: 'unit_price', type: 'DECIMAL(12,2)', nullable: false, unique: false, description: 'Price at time of order' },
          { name: 'total', type: 'DECIMAL(12,2)', nullable: false, unique: false, description: 'Line total' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
      {
        name: 'reviews', description: 'Product reviews and ratings',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'product_id', type: 'UUID', nullable: false, unique: false, description: 'Reviewed product', foreignKey: { table: 'products', column: 'id' } },
          { name: 'user_id', type: 'UUID', nullable: false, unique: false, description: 'Reviewer', foreignKey: { table: 'users', column: 'id' } },
          { name: 'rating', type: 'INTEGER', nullable: false, unique: false, description: 'Rating 1-5' },
          { name: 'title', type: 'VARCHAR(255)', nullable: true, unique: false, description: 'Review title' },
          { name: 'content', type: 'TEXT', nullable: true, unique: false, description: 'Review body' },
          { name: 'is_verified', type: 'BOOLEAN', nullable: false, unique: false, defaultValue: 'false', description: 'Verified purchase' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
    ],
    relationships: [
      { from: 'products', to: 'categories', type: 'N:M' as const, description: 'Products belong to categories' },
      { from: 'orders', to: 'users', type: '1:N' as const, description: 'User has many orders' },
      { from: 'order_items', to: 'orders', type: '1:N' as const, description: 'Order has many items' },
      { from: 'order_items', to: 'products', type: '1:N' as const, description: 'Product in many order items' },
      { from: 'reviews', to: 'products', type: '1:N' as const, description: 'Product has many reviews' },
      { from: 'reviews', to: 'users', type: '1:N' as const, description: 'User writes many reviews' },
      { from: 'categories', to: 'categories', type: '1:N' as const, description: 'Self-referencing parent/child' },
    ],
    indexes: [
      { table: 'products', columns: ['slug'], type: 'unique', reason: 'Fast product lookup by URL slug' },
      { table: 'products', columns: ['category_id', 'status'], type: 'composite', reason: 'Filter by category + status' },
      { table: 'products', columns: ['name'], type: 'gin', reason: 'Full-text search on product name' },
      { table: 'orders', columns: ['user_id', 'created_at'], type: 'composite', reason: 'User order history sorted by date' },
      { table: 'orders', columns: ['status'], type: 'btree', reason: 'Filter orders by status' },
      { table: 'order_items', columns: ['order_id'], type: 'btree', reason: 'Get all items for an order' },
      { table: 'reviews', columns: ['product_id', 'rating'], type: 'composite', reason: 'Product reviews with rating filter' },
    ],
    erDiagram: '',
    recommendations: [
      '💡 Dùng JSONB cho metadata/attributes để linh hoạt khi thêm custom fields',
      '💡 Implement soft delete cho users và products để giữ referential integrity',
      '💡 Dùng materialized view cho aggregate queries (avg rating, total sales)',
      '💡 Consider partitioning bảng orders theo tháng nếu > 1M records/năm',
    ],
  }),

  saas: () => ({
    databaseType: 'relational',
    tables: [
      {
        name: 'organizations', description: 'Tenant/workspace for multi-tenant SaaS',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, unique: false, description: 'Organization name' },
          { name: 'slug', type: 'VARCHAR(100)', nullable: false, unique: true, description: 'URL slug' },
          { name: 'plan', type: "ENUM('free','starter','pro','enterprise')", nullable: false, unique: false, defaultValue: "'free'", description: 'Subscription plan' },
          { name: 'stripe_customer_id', type: 'VARCHAR(255)', nullable: true, unique: true, description: 'Stripe customer' },
          { name: 'stripe_subscription_id', type: 'VARCHAR(255)', nullable: true, unique: true, description: 'Stripe subscription' },
          { name: 'settings', type: 'JSONB', nullable: true, unique: false, description: 'Org settings' },
          { name: 'trial_ends_at', type: 'TIMESTAMP', nullable: true, unique: false, description: 'Trial expiry' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: true,
      },
      {
        name: 'users', description: 'User accounts',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'email', type: 'VARCHAR(255)', nullable: false, unique: true, description: 'Login email' },
          { name: 'password_hash', type: 'VARCHAR(255)', nullable: true, unique: false, description: 'Hashed password (null if social login)' },
          { name: 'full_name', type: 'VARCHAR(255)', nullable: false, unique: false, description: 'Display name' },
          { name: 'avatar_url', type: 'TEXT', nullable: true, unique: false, description: 'Profile image' },
          { name: 'is_verified', type: 'BOOLEAN', nullable: false, unique: false, defaultValue: 'false', description: 'Email verified' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: true,
      },
      {
        name: 'memberships', description: 'User-Organization membership with roles',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'user_id', type: 'UUID', nullable: false, unique: false, description: 'User', foreignKey: { table: 'users', column: 'id' } },
          { name: 'org_id', type: 'UUID', nullable: false, unique: false, description: 'Organization', foreignKey: { table: 'organizations', column: 'id' } },
          { name: 'role', type: "ENUM('owner','admin','member','viewer')", nullable: false, unique: false, defaultValue: "'member'", description: 'Role in org' },
          { name: 'invited_by', type: 'UUID', nullable: true, unique: false, description: 'Who invited', foreignKey: { table: 'users', column: 'id' } },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
      {
        name: 'api_keys', description: 'API keys for programmatic access',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'org_id', type: 'UUID', nullable: false, unique: false, description: 'Organization', foreignKey: { table: 'organizations', column: 'id' } },
          { name: 'key_hash', type: 'VARCHAR(255)', nullable: false, unique: true, description: 'Hashed API key' },
          { name: 'name', type: 'VARCHAR(100)', nullable: false, unique: false, description: 'Key label' },
          { name: 'permissions', type: 'JSONB', nullable: true, unique: false, description: 'Allowed permissions' },
          { name: 'last_used_at', type: 'TIMESTAMP', nullable: true, unique: false, description: 'Last usage' },
          { name: 'expires_at', type: 'TIMESTAMP', nullable: true, unique: false, description: 'Expiry date' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
      {
        name: 'audit_logs', description: 'Audit trail for all important actions',
        columns: [
          { name: 'id', type: 'UUID', nullable: false, unique: true, description: 'Primary key' },
          { name: 'org_id', type: 'UUID', nullable: false, unique: false, description: 'Organization', foreignKey: { table: 'organizations', column: 'id' } },
          { name: 'user_id', type: 'UUID', nullable: true, unique: false, description: 'Actor', foreignKey: { table: 'users', column: 'id' } },
          { name: 'action', type: 'VARCHAR(100)', nullable: false, unique: false, description: 'Action type (create, update, delete)' },
          { name: 'resource_type', type: 'VARCHAR(100)', nullable: false, unique: false, description: 'What was affected' },
          { name: 'resource_id', type: 'VARCHAR(255)', nullable: true, unique: false, description: 'Affected resource ID' },
          { name: 'changes', type: 'JSONB', nullable: true, unique: false, description: 'What changed (before/after)' },
          { name: 'ip_address', type: 'INET', nullable: true, unique: false, description: 'Client IP' },
        ],
        primaryKey: 'id', timestamps: true, softDelete: false,
      },
    ],
    relationships: [
      { from: 'memberships', to: 'users', type: '1:N' as const, description: 'User has many memberships' },
      { from: 'memberships', to: 'organizations', type: '1:N' as const, description: 'Org has many members' },
      { from: 'api_keys', to: 'organizations', type: '1:N' as const, description: 'Org has many API keys' },
      { from: 'audit_logs', to: 'organizations', type: '1:N' as const, description: 'Org has many audit logs' },
    ],
    indexes: [
      { table: 'memberships', columns: ['user_id', 'org_id'], type: 'unique', reason: 'One membership per user per org' },
      { table: 'organizations', columns: ['slug'], type: 'unique', reason: 'Unique org URL' },
      { table: 'audit_logs', columns: ['org_id', 'created_at'], type: 'composite', reason: 'Audit log timeline per org' },
      { table: 'api_keys', columns: ['key_hash'], type: 'unique', reason: 'Fast API key lookup' },
    ],
    erDiagram: '',
    recommendations: [
      '💡 Multi-tenant: dùng org_id trên mọi bảng business data + RLS (Row Level Security)',
      '💡 Partition audit_logs theo tháng — bảng này grow rất nhanh',
      '💡 Cache org settings và membership trong Redis để giảm DB queries',
      '💡 Implement webhook_endpoints table nếu cần notify external systems',
    ],
  }),
};

// Generate schema for other project types by extending base patterns
function generateGenericSchema(projectType: ProjectType): DatabaseSchema {
  // Start with a common base and add project-specific tables
  const base = schemaTemplates['saas']!();

  const extras: Partial<Record<ProjectType, string[]>> = {
    social_network: ['Posts', 'Comments', 'Likes', 'Follows', 'Messages', 'Notifications'],
    marketplace: ['Listings', 'Sellers', 'Transactions', 'Disputes', 'Reviews'],
    content_platform: ['Articles', 'Tags', 'Comments', 'Media', 'Subscriptions'],
    fintech: ['Accounts', 'Transactions', 'KYC_documents', 'Beneficiaries', 'Audit_trail'],
    healthtech: ['Patients', 'Appointments', 'Medical_records', 'Prescriptions', 'Providers'],
    edtech: ['Courses', 'Lessons', 'Enrollments', 'Progress', 'Quizzes', 'Certificates'],
    gaming: ['Players', 'Game_sessions', 'Leaderboards', 'Achievements', 'Inventory'],
    iot: ['Devices', 'Sensor_data', 'Alerts', 'Device_groups', 'Firmware_versions'],
  };

  if (extras[projectType]) {
    base.recommendations.push(`📋 Bảng cần thêm cho ${projectType}: ${extras[projectType]!.join(', ')}`);
  }

  return base;
}

export function designDatabase(projectType: ProjectType, features: string[] = []): DatabaseSchema {
  const template = schemaTemplates[projectType];
  const schema = template ? template() : generateGenericSchema(projectType);

  // Generate Mermaid ER diagram
  schema.erDiagram = generateErDiagram(schema);

  return schema;
}

function generateErDiagram(schema: DatabaseSchema): string {
  const lines = ['erDiagram'];

  for (const table of schema.tables) {
    for (const col of table.columns) {
      if (col.foreignKey) {
        const relType = schema.relationships.find(
          r => (r.from === table.name && r.to === col.foreignKey!.table) ||
               (r.to === table.name && r.from === col.foreignKey!.table)
        );
        const rel = relType?.type === '1:1' ? '||--||' : relType?.type === 'N:M' ? '}o--o{' : '||--o{';
        lines.push(`    ${col.foreignKey.table} ${rel} ${table.name} : "${col.name}"`);
      }
    }
  }

  lines.push('');
  for (const table of schema.tables) {
    lines.push(`    ${table.name} {`);
    for (const col of table.columns.slice(0, 6)) {
      const typeShort = col.type.replace(/\(.*\)/g, '').replace(/'/g, '');
      lines.push(`        ${typeShort} ${col.name}${col.unique ? ' UK' : ''}${col.name === table.primaryKey ? ' PK' : ''}`);
    }
    if (table.columns.length > 6) lines.push(`        ___ "...+${table.columns.length - 6} more"`);
    lines.push('    }');
  }

  return lines.join('\n');
}

export function formatDatabaseDesign(schema: DatabaseSchema): string {
  const lines = ['# 🗄️ Database Schema Design\n'];

  lines.push(`**Database Type**: ${schema.databaseType}\n`);

  lines.push('## ER Diagram\n');
  lines.push('```mermaid');
  lines.push(schema.erDiagram);
  lines.push('```\n');

  lines.push('## Tables\n');
  for (const table of schema.tables) {
    lines.push(`### 📋 ${table.name}`);
    lines.push(`> ${table.description}\n`);
    lines.push('| Column | Type | Nullable | Unique | Description |');
    lines.push('|--------|------|----------|--------|-------------|');
    for (const col of table.columns) {
      const fk = col.foreignKey ? ` → ${col.foreignKey.table}` : '';
      lines.push(`| ${col.name} | ${col.type} | ${col.nullable ? '✅' : '❌'} | ${col.unique ? '✅' : '—'} | ${col.description}${fk} |`);
    }
    if (table.timestamps) lines.push('| created_at, updated_at | TIMESTAMP | ❌ | — | Auto-managed |');
    if (table.softDelete) lines.push('| deleted_at | TIMESTAMP | ✅ | — | Soft delete |');
    lines.push('');
  }

  lines.push('## 🔗 Relationships\n');
  for (const rel of schema.relationships) {
    lines.push(`- **${rel.from}** ←${rel.type}→ **${rel.to}**: ${rel.description}`);
  }

  lines.push('\n## 📇 Indexes\n');
  lines.push('| Table | Columns | Type | Reason |');
  lines.push('|-------|---------|------|--------|');
  for (const idx of schema.indexes) {
    lines.push(`| ${idx.table} | ${idx.columns.join(', ')} | ${idx.type} | ${idx.reason} |`);
  }

  if (schema.recommendations.length > 0) {
    lines.push('\n## 💡 Recommendations\n');
    schema.recommendations.forEach(r => lines.push(r));
  }

  return lines.join('\n');
}
