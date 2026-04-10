---
name: caching-standard
description: Implement multi-level caching with Redis and in-memory LRU patterns. Use when adding caching layers, implementing Redis, or optimizing API performance. Triggers on requests for caching setup, Redis configuration, cache invalidation, or performance caching.
---

# Caching Standard Skill

Enterprise-grade multi-level caching patterns extracted from DreamiHairCare production implementation. Provides Redis + in-memory LRU caching with intelligent invalidation strategies.

## Skill Metadata

```yaml
name: caching-standard
version: 1.0.0
category: performance
dependencies:
  - ioredis
  - lru-cache
triggers:
  - implementing cache
  - redis setup
  - cache invalidation
  - performance optimization
  - reducing database load
```

## Architecture Overview

### Multi-Level Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
├─────────────────────────────────────────────────────────┤
│  L1 Cache (Memory)     │  L2 Cache (Redis)              │
│  ├── LRU eviction      │  ├── Distributed               │
│  ├── ~1ms access       │  ├── ~5ms access               │
│  ├── Per-instance      │  ├── Shared across instances   │
│  └── 1000 items max    │  └── Configurable TTL          │
├─────────────────────────────────────────────────────────┤
│                    Database Layer                        │
└─────────────────────────────────────────────────────────┘
```

## Core Implementation

### CacheService Class

```typescript
// backend/src/services/CacheService.ts
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  ttl?: number;           // Time to live in seconds
  namespace?: string;     // Cache key namespace
  tags?: string[];        // Tags for bulk invalidation
  refreshOnAccess?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

export class CacheService {
  private redis: Redis | null;
  private memoryCache: LRUCache<string, string>;
  private stats: CacheStats = { hits: 0, misses: 0, size: 0 };
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor(redisUrl?: string) {
    // L1: In-memory LRU cache
    this.memoryCache = new LRUCache<string, string>({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes default
      updateAgeOnGet: true,
    });

    // L2: Redis cache (optional)
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
      });

      this.redis.on('error', (err) => {
        console.error('[CacheService] Redis error:', err);
      });
    } else {
      this.redis = null;
    }
  }

  // Build namespaced cache key
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  // Serialize value for storage
  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  // Deserialize stored value
  private deserialize<T>(value: string): T {
    return JSON.parse(value);
  }

  /**
   * Get value from cache (L1 first, then L2)
   * CRITICAL: Multi-level lookup with backfill
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const cacheKey = this.buildKey(key, options.namespace);

    // Try L1 (memory) first
    const memoryValue = this.memoryCache.get(cacheKey);
    if (memoryValue !== undefined) {
      this.stats.hits++;
      return this.deserialize<T>(memoryValue);
    }

    // Try L2 (Redis) if available
    if (this.redis) {
      try {
        const redisValue = await this.redis.get(cacheKey);
        if (redisValue !== null) {
          this.stats.hits++;
          // Backfill L1 cache
          this.memoryCache.set(cacheKey, redisValue);
          return this.deserialize<T>(redisValue);
        }
      } catch (error) {
        console.error('[CacheService] Redis get error:', error);
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache (both L1 and L2)
   * CRITICAL: Always write to both levels
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const cacheKey = this.buildKey(key, options.namespace);
    const serialized = this.serialize(value);
    const ttl = options.ttl || 300; // 5 minutes default

    // Write to L1 (memory)
    this.memoryCache.set(cacheKey, serialized, { ttl: ttl * 1000 });

    // Write to L2 (Redis) if available
    if (this.redis) {
      try {
        await this.redis.setex(cacheKey, ttl, serialized);
      } catch (error) {
        console.error('[CacheService] Redis set error:', error);
      }
    }

    // Track tags for bulk invalidation
    if (options.tags?.length) {
      for (const tag of options.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(cacheKey);
      }
    }

    this.stats.size++;
  }

  /**
   * Get or set pattern (cache-aside)
   * CRITICAL: Most commonly used pattern
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetcher();

    // Cache the result
    await this.set(key, value, options);

    return value;
  }

  /**
   * Delete from cache (both levels)
   */
  async delete(key: string, namespace?: string): Promise<void> {
    const cacheKey = this.buildKey(key, namespace);

    // Delete from L1
    this.memoryCache.delete(cacheKey);

    // Delete from L2
    if (this.redis) {
      try {
        await this.redis.del(cacheKey);
      } catch (error) {
        console.error('[CacheService] Redis delete error:', error);
      }
    }
  }

  /**
   * Invalidate by tags (bulk invalidation)
   * CRITICAL: Use for related data invalidation
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0;

    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        for (const key of keys) {
          await this.delete(key);
          invalidated++;
        }
        this.tagIndex.delete(tag);
      }
    }

    return invalidated;
  }

  /**
   * Invalidate by pattern (wildcard)
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    let invalidated = 0;

    if (this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          invalidated = keys.length;
        }
      } catch (error) {
        console.error('[CacheService] Redis pattern delete error:', error);
      }
    }

    // Also clear matching from memory cache
    const memoryKeys = [...this.memoryCache.keys()];
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryKeys) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.redis) {
      await this.redis.flushdb();
    }
    this.tagIndex.clear();
    this.stats = { hits: 0, misses: 0, size: 0 };
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Singleton instance
let cacheInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService(process.env.REDIS_URL);
  }
  return cacheInstance;
}
```

## Caching Patterns

### 1. Cache-Aside Pattern (RECOMMENDED)

```typescript
// Most common pattern - check cache, fetch if miss, cache result
async function getUserProfile(userId: string): Promise<UserProfile> {
  const cache = getCacheService();

  return cache.getOrSet(
    `user:profile:${userId}`,
    async () => {
      // Fetch from database on cache miss
      return await UserRepository.findById(userId);
    },
    {
      ttl: 300,                    // 5 minutes
      namespace: 'users',
      tags: [`user:${userId}`],   // For targeted invalidation
    }
  );
}
```

### 2. Write-Through Pattern

```typescript
// Update cache when writing to database
async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const cache = getCacheService();

  // Update database
  const updated = await UserRepository.update(userId, updates);

  // Update cache immediately
  await cache.set(`user:profile:${userId}`, updated, {
    ttl: 300,
    namespace: 'users',
    tags: [`user:${userId}`],
  });

  return updated;
}
```

### 3. Write-Behind (Background Refresh)

```typescript
// Refresh cache in background before expiration
async function getProductCatalog(): Promise<Product[]> {
  const cache = getCacheService();
  const cacheKey = 'products:catalog';

  const cached = await cache.get<Product[]>(cacheKey);

  if (cached) {
    // Check if needs background refresh (80% of TTL)
    const ttlRemaining = await cache.getTTL(cacheKey);
    if (ttlRemaining < 60) { // Less than 1 minute remaining
      // Refresh in background (don't await)
      refreshProductCatalog().catch(console.error);
    }
    return cached;
  }

  // Cache miss - fetch and cache
  return refreshProductCatalog();
}

async function refreshProductCatalog(): Promise<Product[]> {
  const cache = getCacheService();
  const products = await ProductRepository.findAll();

  await cache.set('products:catalog', products, {
    ttl: 300,
    namespace: 'products',
    tags: ['products:all'],
  });

  return products;
}
```

### 4. Cache Stampede Prevention

```typescript
import { Mutex } from 'async-mutex';

const locks = new Map<string, Mutex>();

async function getWithLock<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cache = getCacheService();

  // Try cache first (no lock needed for reads)
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Get or create lock for this key
  if (!locks.has(key)) {
    locks.set(key, new Mutex());
  }
  const mutex = locks.get(key)!;

  // Acquire lock
  const release = await mutex.acquire();

  try {
    // Double-check cache (another request might have populated it)
    const recheck = await cache.get<T>(key);
    if (recheck !== null) {
      return recheck;
    }

    // Fetch and cache
    const value = await fetcher();
    await cache.set(key, value, { ttl });

    return value;
  } finally {
    release();
  }
}
```

## Cache Invalidation Strategies

### 1. Tag-Based Invalidation (RECOMMENDED)

```typescript
// When user is updated, invalidate all related caches
async function onUserUpdated(userId: string): Promise<void> {
  const cache = getCacheService();

  // Invalidate all caches tagged with this user
  await cache.invalidateByTags([
    `user:${userId}`,
    `user:${userId}:orders`,
    `user:${userId}:cart`,
  ]);
}

// When tagging cache entries
await cache.set(`order:${orderId}`, order, {
  tags: [
    `user:${order.userId}`,
    `user:${order.userId}:orders`,
    'orders:all',
  ],
});
```

### 2. TTL-Based Expiration

```typescript
// Different TTLs for different data types
const TTL_CONFIG = {
  // Rarely changes
  STATIC_CONTENT: 86400,      // 24 hours
  PRODUCT_CATALOG: 3600,       // 1 hour

  // Changes occasionally
  USER_PROFILE: 300,           // 5 minutes
  BUSINESS_SETTINGS: 600,      // 10 minutes

  // Changes frequently
  CART: 60,                    // 1 minute
  SESSION: 300,                // 5 minutes

  // Real-time (don't cache)
  INVENTORY: 0,
  PAYMENT_STATUS: 0,
};
```

### 3. Event-Driven Invalidation

```typescript
// Subscribe to database change events
import { EventEmitter } from 'events';

const cacheEvents = new EventEmitter();

// Listen for model changes
User.afterUpdate(async (user) => {
  cacheEvents.emit('user:updated', user.id);
});

Order.afterCreate(async (order) => {
  cacheEvents.emit('order:created', order);
});

// Handle invalidation
cacheEvents.on('user:updated', async (userId: string) => {
  const cache = getCacheService();
  await cache.invalidateByTags([`user:${userId}`]);
});

cacheEvents.on('order:created', async (order: Order) => {
  const cache = getCacheService();
  await cache.invalidateByTags([
    `user:${order.userId}:orders`,
    'orders:recent',
  ]);
});
```

## GraphQL Integration

### DataLoader with Caching

```typescript
import DataLoader from 'dataloader';

function createCachedUserLoader(): DataLoader<string, User> {
  const cache = getCacheService();

  return new DataLoader<string, User>(
    async (ids) => {
      const users: (User | null)[] = [];
      const uncachedIds: string[] = [];
      const uncachedIndices: number[] = [];

      // Check cache for each ID
      for (let i = 0; i < ids.length; i++) {
        const cached = await cache.get<User>(`user:${ids[i]}`);
        if (cached) {
          users[i] = cached;
        } else {
          uncachedIds.push(ids[i]);
          uncachedIndices.push(i);
        }
      }

      // Batch fetch uncached users
      if (uncachedIds.length > 0) {
        const fetchedUsers = await User.findAll({
          where: { id: { [Op.in]: uncachedIds } },
        });

        const userMap = new Map(fetchedUsers.map(u => [u.id, u]));

        // Fill in results and cache
        for (let i = 0; i < uncachedIds.length; i++) {
          const user = userMap.get(uncachedIds[i]) || null;
          users[uncachedIndices[i]] = user;

          if (user) {
            await cache.set(`user:${user.id}`, user, {
              ttl: 300,
              tags: [`user:${user.id}`],
            });
          }
        }
      }

      return users;
    },
    { cache: false } // Disable DataLoader's internal cache, use our cache
  );
}
```

### Resolver-Level Caching

```typescript
const resolvers = {
  Query: {
    products: async (_, { category }, context) => {
      const cache = getCacheService();
      const cacheKey = `products:category:${category || 'all'}`;

      return cache.getOrSet(
        cacheKey,
        async () => {
          return Product.findAll({
            where: category ? { category } : {},
            order: [['created_at', 'DESC']],
          });
        },
        {
          ttl: 300,
          tags: ['products:all', `products:category:${category}`],
        }
      );
    },
  },
};
```

## Redis Configuration

### Environment Setup

```bash
# backend/.env.local
REDIS_URL=redis://localhost:6379

# backend/.env.develop
REDIS_URL=redis://redis-cache.internal:6379

# backend/.env.production
REDIS_URL=redis://redis-cluster.internal:6379
```

### Redis Cluster Configuration

```typescript
// For production with Redis Cluster
import { Cluster } from 'ioredis';

const redis = new Cluster([
  { host: 'redis-1.internal', port: 6379 },
  { host: 'redis-2.internal', port: 6379 },
  { host: 'redis-3.internal', port: 6379 },
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
  },
  scaleReads: 'slave',
});
```

## Memoization Decorator

```typescript
// Decorator for automatic method caching
function Cacheable(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = getCacheService();
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      return cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

// Usage
class ProductService {
  @Cacheable({ ttl: 300, tags: ['products'] })
  async getProductById(id: string): Promise<Product> {
    return ProductRepository.findById(id);
  }

  @Cacheable({ ttl: 60, tags: ['products:featured'] })
  async getFeaturedProducts(): Promise<Product[]> {
    return ProductRepository.findFeatured();
  }
}
```

## Monitoring and Metrics

### Cache Metrics Endpoint

```typescript
// backend/src/routes/health.ts
router.get('/cache/stats', async (req, res) => {
  const cache = getCacheService();
  const stats = cache.getStats();

  res.json({
    hits: stats.hits,
    misses: stats.misses,
    size: stats.size,
    hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
    memory: process.memoryUsage().heapUsed,
  });
});
```

### Alerting Thresholds

```typescript
// Alert if cache hit rate drops
const CACHE_HIT_RATE_THRESHOLD = 0.8; // 80%

setInterval(async () => {
  const cache = getCacheService();
  const stats = cache.getStats();

  if (stats.hitRate < CACHE_HIT_RATE_THRESHOLD) {
    console.warn('[CacheService] Low cache hit rate:', stats.hitRate);
    // Send alert to monitoring system
  }
}, 60000); // Check every minute
```

## Testing

### Unit Tests

```typescript
describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService(); // No Redis for unit tests
  });

  afterEach(async () => {
    await cache.clear();
  });

  test('should cache and retrieve values', async () => {
    await cache.set('test-key', { foo: 'bar' }, { ttl: 60 });
    const result = await cache.get('test-key');
    expect(result).toEqual({ foo: 'bar' });
  });

  test('should use getOrSet pattern', async () => {
    const fetcher = jest.fn().mockResolvedValue('fetched-value');

    // First call - fetches
    const result1 = await cache.getOrSet('key', fetcher, { ttl: 60 });
    expect(result1).toBe('fetched-value');
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call - uses cache
    const result2 = await cache.getOrSet('key', fetcher, { ttl: 60 });
    expect(result2).toBe('fetched-value');
    expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
  });

  test('should invalidate by tags', async () => {
    await cache.set('user:1', { id: '1' }, { tags: ['users'] });
    await cache.set('user:2', { id: '2' }, { tags: ['users'] });
    await cache.set('product:1', { id: '1' }, { tags: ['products'] });

    await cache.invalidateByTags(['users']);

    expect(await cache.get('user:1')).toBeNull();
    expect(await cache.get('user:2')).toBeNull();
    expect(await cache.get('product:1')).not.toBeNull();
  });
});
```

## Related Skills

- **performance-optimization-standard** - Frontend performance patterns
- **database-query-optimization-standard** - Query optimization with DataLoader
- **graphql-backend-standard** - GraphQL resolver caching

## Related Commands

- `/implement-caching` - Set up caching infrastructure
- `/implement-performance-optimization` - Full performance optimization
