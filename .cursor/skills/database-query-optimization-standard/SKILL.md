---
name: database-query-optimization-standard
description: Implement database query optimization with DataLoader N+1 prevention, intelligent indexing, and Sequelize performance tuning. Use when fixing slow queries, implementing DataLoader, or optimizing database performance. Triggers on requests for N+1 fixes, query optimization, database performance, or DataLoader setup.
---

# Database Query Optimization Standard Skill

Enterprise-grade database query optimization patterns extracted from DreamiHairCare production implementation. Focuses on N+1 prevention with DataLoader, intelligent indexing, query analysis, and Sequelize optimization.

## Skill Metadata

```yaml
name: database-query-optimization-standard
version: 1.0.0
category: performance
dependencies:
  - dataloader
  - sequelize
  - pg
triggers:
  - N+1 query problem
  - slow database queries
  - DataLoader setup
  - query optimization
  - database performance
  - index optimization
```

## N+1 Query Prevention (CRITICAL)

### The N+1 Problem

```typescript
// ❌ WRONG: N+1 queries - 1 query for orders + N queries for users
const orders = await Order.findAll();
for (const order of orders) {
  order.user = await User.findByPk(order.userId);  // N additional queries!
}

// ✅ CORRECT: 2 queries total with DataLoader
const orders = await Order.findAll();
const users = await userLoader.loadMany(orders.map(o => o.userId));
```

### DataLoader Pattern (MANDATORY)

```typescript
// backend/src/graphql/loaders/index.ts
import DataLoader from 'dataloader';
import { Op } from 'sequelize';
import { User, Product, Order, Category } from '@/models';

/**
 * CRITICAL: All field resolvers MUST use DataLoader
 * Direct database queries in resolvers cause N+1 problems
 */

// User DataLoader
export function createUserLoader(): DataLoader<string, User | null> {
  return new DataLoader<string, User | null>(
    async (ids: readonly string[]) => {
      const users = await User.findAll({
        where: { id: { [Op.in]: ids as string[] } },
      });

      // Map results to preserve order
      const userMap = new Map(users.map((user) => [user.id, user]));
      return ids.map((id) => userMap.get(id) || null);
    },
    {
      cache: true,           // Enable per-request caching
      maxBatchSize: 100,     // Limit batch size
    }
  );
}

// Product DataLoader
export function createProductLoader(): DataLoader<string, Product | null> {
  return new DataLoader<string, Product | null>(async (ids) => {
    const products = await Product.findAll({
      where: { id: { [Op.in]: ids as string[] } },
      include: [{ model: Category, as: 'category' }],
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => productMap.get(id) || null);
  });
}

// Products by Category DataLoader
export function createProductsByCategoryLoader(): DataLoader<string, Product[]> {
  return new DataLoader<string, Product[]>(async (categoryIds) => {
    const products = await Product.findAll({
      where: { category_id: { [Op.in]: categoryIds as string[] } },
      order: [['name', 'ASC']],
    });

    // Group products by category
    const productsByCategory = new Map<string, Product[]>();
    for (const product of products) {
      const categoryProducts = productsByCategory.get(product.category_id) || [];
      categoryProducts.push(product);
      productsByCategory.set(product.category_id, categoryProducts);
    }

    return categoryIds.map((id) => productsByCategory.get(id) || []);
  });
}

// Orders by User DataLoader
export function createOrdersByUserLoader(): DataLoader<string, Order[]> {
  return new DataLoader<string, Order[]>(async (userIds) => {
    const orders = await Order.findAll({
      where: { user_id: { [Op.in]: userIds as string[] } },
      order: [['created_at', 'DESC']],
    });

    const ordersByUser = new Map<string, Order[]>();
    for (const order of orders) {
      const userOrders = ordersByUser.get(order.user_id) || [];
      userOrders.push(order);
      ordersByUser.set(order.user_id, userOrders);
    }

    return userIds.map((id) => ordersByUser.get(id) || []);
  });
}
```

### Context-Based Loaders

```typescript
// backend/src/graphql/context.ts
import {
  createUserLoader,
  createProductLoader,
  createProductsByCategoryLoader,
  createOrdersByUserLoader,
} from './loaders';

export interface GraphQLContext {
  auth: {
    userId: string | null;
    tenantId: string;
    roles: string[];
  };
  loaders: {
    users: DataLoader<string, User | null>;
    products: DataLoader<string, Product | null>;
    productsByCategory: DataLoader<string, Product[]>;
    ordersByUser: DataLoader<string, Order[]>;
  };
}

export function createContext({ req }): GraphQLContext {
  return {
    auth: extractAuth(req),
    loaders: {
      users: createUserLoader(),
      products: createProductLoader(),
      productsByCategory: createProductsByCategoryLoader(),
      ordersByUser: createOrdersByUserLoader(),
    },
  };
}
```

### Using DataLoaders in Resolvers

```typescript
// backend/src/graphql/resolvers/Order.ts
export const OrderResolvers = {
  Order: {
    // ✅ CORRECT: Use DataLoader for related data
    user: async (parent: Order, _args: unknown, context: GraphQLContext) => {
      return context.loaders.users.load(parent.user_id);
    },

    // ✅ CORRECT: Use DataLoader for nested relations
    items: async (parent: Order, _args: unknown, context: GraphQLContext) => {
      return context.loaders.orderItemsByOrder.load(parent.id);
    },
  },

  Query: {
    orders: async (_parent, args, context: GraphQLContext) => {
      // Validate authentication
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      // CRITICAL: Filter by tenant_id
      return Order.findAll({
        where: {
          tenant_id: context.auth.tenantId,
          ...(args.status && { status: args.status }),
        },
        order: [['created_at', 'DESC']],
        limit: args.limit || 50,
      });
    },
  },
};
```

## Query Complexity Limits

### Prevent Resource Exhaustion

```typescript
// backend/src/graphql/complexity.ts
import { createComplexityRule, simpleEstimator, fieldExtensionsEstimator } from 'graphql-query-complexity';

export const complexityRule = createComplexityRule({
  maximumComplexity: 1000,

  estimators: [
    // Use field extensions if defined in schema
    fieldExtensionsEstimator(),

    // Default estimation
    simpleEstimator({
      defaultComplexity: 1,
    }),
  ],

  onComplete: (complexity: number) => {
    console.log('Query Complexity:', complexity);
  },
});

// Apply to Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [complexityRule],
});
```

### Field-Level Complexity

```graphql
# schema.graphql
type Query {
  # Simple query - low complexity
  user(id: ID!): User @complexity(value: 1)

  # List query - moderate complexity
  products(limit: Int = 20): [Product!]! @complexity(value: 5, multipliers: ["limit"])

  # Complex nested query - high complexity
  orders(
    limit: Int = 50
    includeItems: Boolean = true
  ): [Order!]! @complexity(value: 10, multipliers: ["limit"])
}

type Order {
  id: ID!
  user: User @complexity(value: 2)
  items: [OrderItem!]! @complexity(value: 5)
}
```

## Pagination Patterns

### Relay-Style Cursor Pagination (RECOMMENDED)

```typescript
// backend/src/graphql/resolvers/Product.ts
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';

interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export const ProductResolvers = {
  Query: {
    products: async (_parent, args: PaginationArgs, context: GraphQLContext) => {
      const limit = args.first || args.last || 20;
      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      // Get total count efficiently
      const totalCount = await Product.count({
        where: { tenant_id: context.auth.tenantId },
      });

      // Fetch page of data
      const products = await Product.findAll({
        where: { tenant_id: context.auth.tenantId },
        limit: limit + 1, // Fetch one extra to determine hasNextPage
        offset,
        order: [['created_at', 'DESC']],
      });

      // Build connection
      return connectionFromArraySlice(
        products.slice(0, limit),
        args,
        {
          sliceStart: offset,
          arrayLength: totalCount,
        }
      );
    },
  },
};
```

### GraphQL Schema for Pagination

```graphql
type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ProductEdge {
  cursor: String!
  node: Product!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  products(
    first: Int
    after: String
    last: Int
    before: String
    filter: ProductFilter
  ): ProductConnection!
}
```

### Offset Pagination (Simple Cases)

```typescript
// For simple offset-based pagination
async function getProductsWithPagination(
  page: number = 1,
  pageSize: number = 20,
  tenantId: string
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  const { count, rows: products } = await Product.findAndCountAll({
    where: { tenant_id: tenantId },
    limit: pageSize,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    products,
    total: count,
    totalPages: Math.ceil(count / pageSize),
  };
}
```

## Sequelize Query Optimization

### 1. Select Only Required Fields

```typescript
// ✅ CORRECT: Select specific attributes
const users = await User.findAll({
  attributes: ['id', 'email', 'name'],  // Only needed fields
  where: { status: 'active' },
});

// ❌ WRONG: Select all columns
const users = await User.findAll({
  where: { status: 'active' },
});  // Fetches all columns including large ones
```

### 2. Efficient Includes

```typescript
// ✅ CORRECT: Specify included attributes
const orders = await Order.findAll({
  where: { user_id: userId },
  include: [
    {
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email'],  // Only needed user fields
    },
    {
      model: OrderItem,
      as: 'items',
      attributes: ['id', 'product_id', 'quantity', 'price'],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_url'],  // Only needed product fields
        },
      ],
    },
  ],
});

// ❌ WRONG: Include everything
const orders = await Order.findAll({
  where: { user_id: userId },
  include: { all: true, nested: true },  // Fetches everything!
});
```

### 3. Batch Operations

```typescript
// ✅ CORRECT: Bulk create
await OrderItem.bulkCreate(items, {
  updateOnDuplicate: ['quantity', 'updated_at'],  // Upsert
});

// ✅ CORRECT: Bulk update
await Product.update(
  { status: 'active' },
  {
    where: { category_id: categoryId },
  }
);

// ❌ WRONG: Individual creates in loop
for (const item of items) {
  await OrderItem.create(item);  // N queries!
}
```

### 4. Raw Queries for Complex Operations

```typescript
// For complex aggregations, use raw queries
const salesByCategory = await sequelize.query(
  `
  SELECT
    c.name as category_name,
    COUNT(DISTINCT o.id) as order_count,
    SUM(oi.quantity * oi.price) as total_revenue
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  WHERE o.tenant_id = :tenantId
    AND o.created_at >= :startDate
    AND o.status = 'completed'
  GROUP BY c.id, c.name
  ORDER BY total_revenue DESC
  `,
  {
    replacements: { tenantId, startDate },
    type: QueryTypes.SELECT,
  }
);
```

## Index Optimization

### Essential Indexes

```typescript
// backend/migrations/YYYYMMDD-add-performance-indexes.js
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Primary lookup indexes
      await queryInterface.addIndex('users', ['email'], {
        name: 'idx_users_email',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('users', ['tenant_id'], {
        name: 'idx_users_tenant_id',
        transaction,
      });

      // Composite indexes for common queries
      await queryInterface.addIndex('orders', ['tenant_id', 'user_id'], {
        name: 'idx_orders_tenant_user',
        transaction,
      });

      await queryInterface.addIndex('orders', ['tenant_id', 'status', 'created_at'], {
        name: 'idx_orders_tenant_status_date',
        transaction,
      });

      await queryInterface.addIndex('products', ['tenant_id', 'category_id', 'status'], {
        name: 'idx_products_tenant_category_status',
        transaction,
      });

      // Full-text search index
      await queryInterface.sequelize.query(
        `CREATE INDEX idx_products_search ON products
         USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')))`,
        { transaction }
      );

      // Partial index for active records
      await queryInterface.sequelize.query(
        `CREATE INDEX idx_products_active ON products (tenant_id, category_id)
         WHERE status = 'active'`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'idx_users_email');
    await queryInterface.removeIndex('users', 'idx_users_tenant_id');
    await queryInterface.removeIndex('orders', 'idx_orders_tenant_user');
    await queryInterface.removeIndex('orders', 'idx_orders_tenant_status_date');
    await queryInterface.removeIndex('products', 'idx_products_tenant_category_status');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_products_search');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_products_active');
  },
};
```

### Index Design Guidelines

```sql
-- 1. Index columns used in WHERE clauses
CREATE INDEX idx_orders_status ON orders(status);

-- 2. Index columns used in JOIN conditions
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 3. Composite indexes for multi-column filters (order matters!)
-- Query: WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX idx_orders_tenant_status_date ON orders(tenant_id, status, created_at DESC);

-- 4. Partial indexes for filtered queries
-- Query: WHERE status = 'active' (most common)
CREATE INDEX idx_products_active ON products(tenant_id, category_id)
WHERE status = 'active';

-- 5. Covering indexes to avoid table lookups
CREATE INDEX idx_users_lookup ON users(email) INCLUDE (id, name, role);
```

## Query Analysis

### EXPLAIN ANALYZE

```typescript
// Analyze query performance
async function analyzeQuery(query: string, params: any[]): Promise<void> {
  const result = await sequelize.query(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`,
    {
      replacements: params,
      type: QueryTypes.SELECT,
    }
  );

  const plan = result[0][0]['QUERY PLAN'];
  console.log('Query Plan:', JSON.stringify(plan, null, 2));

  // Check for sequential scans on large tables
  const planText = JSON.stringify(plan);
  if (planText.includes('Seq Scan') && plan[0]['Plan']['Actual Rows'] > 1000) {
    console.warn('WARNING: Sequential scan detected on large result set');
  }
}
```

### Slow Query Logging

```typescript
// backend/src/config/sequelize.ts
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: (sql, timing) => {
    if (typeof timing === 'number' && timing > 100) {
      console.warn(`[SLOW QUERY] ${timing}ms: ${sql}`);
    }
  },
  benchmark: true,  // Enable timing
});
```

### Query Statistics Monitoring

```typescript
// backend/src/middleware/queryStats.ts
interface QueryStats {
  query: string;
  duration: number;
  timestamp: Date;
}

const queryLog: QueryStats[] = [];

export function logQuery(sql: string, duration: number): void {
  queryLog.push({
    query: sql,
    duration,
    timestamp: new Date(),
  });

  // Keep last 1000 queries
  if (queryLog.length > 1000) {
    queryLog.shift();
  }
}

export function getSlowQueries(thresholdMs: number = 100): QueryStats[] {
  return queryLog
    .filter((q) => q.duration > thresholdMs)
    .sort((a, b) => b.duration - a.duration);
}

export function getQueryStats(): {
  total: number;
  avgDuration: number;
  slowCount: number;
} {
  if (queryLog.length === 0) {
    return { total: 0, avgDuration: 0, slowCount: 0 };
  }

  const total = queryLog.length;
  const avgDuration = queryLog.reduce((sum, q) => sum + q.duration, 0) / total;
  const slowCount = queryLog.filter((q) => q.duration > 100).length;

  return { total, avgDuration, slowCount };
}
```

## Connection Pooling

### Pool Configuration

```typescript
// backend/src/config/database.ts
const poolConfig = {
  local: {
    max: 5,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
  develop: {
    max: 10,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  production: {
    max: 20,
    min: 10,
    acquire: 30000,
    idle: 10000,
  },
};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  pool: poolConfig[process.env.NODE_ENV || 'local'],
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
});
```

### Pool Monitoring

```typescript
// Monitor pool health
const pool = sequelize.connectionManager.pool;

setInterval(() => {
  const stats = {
    size: pool.size,
    available: pool.available,
    pending: pool.pending,
    borrowed: pool.borrowed,
  };

  if (stats.pending > 5) {
    console.warn('[DB Pool] High pending connections:', stats);
  }

  if (stats.available === 0 && stats.pending > 0) {
    console.error('[DB Pool] Pool exhausted!', stats);
  }
}, 30000);
```

## Performance Checklist

### Query Optimization Checklist

- [ ] All GraphQL field resolvers use DataLoader
- [ ] No N+1 queries in resolver chains
- [ ] Query complexity limits configured
- [ ] Pagination implemented for list queries
- [ ] Only required fields selected (no SELECT *)
- [ ] Includes specify required attributes
- [ ] Bulk operations used for multi-record changes
- [ ] Indexes exist for WHERE and JOIN columns
- [ ] Composite indexes match query patterns
- [ ] Slow query logging enabled
- [ ] Connection pool sized appropriately
- [ ] Query performance monitored

### Index Checklist

- [ ] Primary key indexes (automatic)
- [ ] Foreign key columns indexed
- [ ] tenant_id indexed on all multi-tenant tables
- [ ] Common filter columns indexed
- [ ] Composite indexes for multi-column queries
- [ ] Partial indexes for status-filtered queries
- [ ] Full-text search indexes where needed
- [ ] No redundant/unused indexes

## Related Skills

- **caching-standard** - Cache query results
- **performance-optimization-standard** - Frontend optimization
- **sequelize-orm-optimizer** - Sequelize patterns

## Related Commands

- `/implement-caching` - Set up caching layer
- `/implement-performance-optimization` - Full optimization
