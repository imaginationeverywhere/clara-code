# Implement Caching Infrastructure

Set up production-grade multi-level caching with Redis + in-memory LRU, intelligent invalidation strategies, and GraphQL integration following DreamiHairCare's battle-tested patterns.

## Command Usage

```
/implement-caching [options]
```

### Options
- `--full` - Complete caching system setup (default)
- `--redis-only` - Set up Redis connection only
- `--memory-only` - Set up in-memory caching only (no Redis)
- `--graphql` - Add GraphQL resolver caching
- `--audit` - Audit existing cache implementation

### Environment Options
- `--local` - Configure for local development
- `--develop` - Configure for development environment
- `--production` - Configure for production environment

## Pre-Implementation Checklist

### Requirements
- [ ] Node.js 18+ installed
- [ ] Redis server accessible (for L2 cache)
- [ ] Backend workspace configured
- [ ] Environment files created

### Dependencies
```bash
cd backend
npm install ioredis lru-cache dataloader
npm install -D @types/ioredis
```

## Implementation Phases

### Phase 1: CacheService Setup

#### 1.1 Create CacheService
```bash
mkdir -p backend/src/services
touch backend/src/services/CacheService.ts
```

See `caching-standard` skill for complete CacheService implementation.

#### 1.2 Key Features to Implement
- Multi-level caching (L1 memory + L2 Redis)
- Tag-based invalidation
- Cache-aside pattern
- Memoization decorator
- Cache statistics and monitoring

### Phase 2: Environment Configuration

#### 2.1 Create Environment Files
```bash
# backend/.env.local
REDIS_URL=redis://localhost:6379
CACHE_TTL_DEFAULT=300
CACHE_MEMORY_MAX=1000

# backend/.env.develop
REDIS_URL=redis://redis-cache.internal:6379
CACHE_TTL_DEFAULT=300
CACHE_MEMORY_MAX=5000

# backend/.env.production
REDIS_URL=redis://redis-cluster.internal:6379
CACHE_TTL_DEFAULT=600
CACHE_MEMORY_MAX=10000
```

#### 2.2 Add to .gitignore
```
.env.local
.env.develop
.env.production
```

### Phase 3: GraphQL Integration

#### 3.1 Create DataLoaders with Caching
```typescript
// backend/src/graphql/loaders/cachedLoaders.ts
import DataLoader from 'dataloader';
import { getCacheService } from '@/services/CacheService';

export function createCachedUserLoader() {
  const cache = getCacheService();

  return new DataLoader<string, User>(async (ids) => {
    const users: (User | null)[] = [];
    const uncachedIds: string[] = [];
    const uncachedIndices: number[] = [];

    // Check cache for each ID
    for (let i = 0; i < ids.length; i++) {
      const cached = await cache.get<User>(`user:${ids[i]}`);
      if (cached) {
        users[i] = cached;
      } else {
        uncachedIds.push(ids[i] as string);
        uncachedIndices.push(i);
      }
    }

    // Batch fetch uncached
    if (uncachedIds.length > 0) {
      const fetchedUsers = await User.findAll({
        where: { id: { [Op.in]: uncachedIds } },
      });

      const userMap = new Map(fetchedUsers.map(u => [u.id, u]));

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
  });
}
```

#### 3.2 Update GraphQL Context
```typescript
// backend/src/graphql/context.ts
import { getCacheService } from '@/services/CacheService';
import { createCachedUserLoader } from './loaders/cachedLoaders';

export function createContext({ req }) {
  return {
    auth: extractAuth(req),
    cache: getCacheService(),
    loaders: {
      users: createCachedUserLoader(),
      // Add more cached loaders
    },
  };
}
```

### Phase 4: Cache Invalidation Setup

#### 4.1 Event-Driven Invalidation
```typescript
// backend/src/services/CacheInvalidation.ts
import { getCacheService } from './CacheService';
import { EventEmitter } from 'events';

export const cacheEvents = new EventEmitter();

// Listen for model changes
User.afterUpdate(async (user) => {
  cacheEvents.emit('user:updated', user.id);
});

User.afterDestroy(async (user) => {
  cacheEvents.emit('user:deleted', user.id);
});

Order.afterCreate(async (order) => {
  cacheEvents.emit('order:created', order);
});

// Handle invalidation
cacheEvents.on('user:updated', async (userId: string) => {
  const cache = getCacheService();
  await cache.invalidateByTags([`user:${userId}`]);
});

cacheEvents.on('order:created', async (order) => {
  const cache = getCacheService();
  await cache.invalidateByTags([
    `user:${order.userId}:orders`,
    'orders:recent',
  ]);
});
```

### Phase 5: Monitoring Setup

#### 5.1 Cache Metrics Endpoint
```typescript
// backend/src/routes/health.ts
import { getCacheService } from '@/services/CacheService';

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

router.post('/cache/clear', async (req, res) => {
  // Admin only
  if (!req.auth?.roles?.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const cache = getCacheService();
  await cache.clear();

  res.json({ success: true, message: 'Cache cleared' });
});
```

### Phase 6: npm Scripts

#### 6.1 Add to package.json
```json
{
  "scripts": {
    "cache:stats": "curl http://localhost:4026/health/cache/stats",
    "cache:clear": "curl -X POST http://localhost:4026/health/cache/clear",
    "redis:cli": "redis-cli -u $REDIS_URL"
  }
}
```

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── CacheService.ts
│   │   └── CacheInvalidation.ts
│   ├── graphql/
│   │   ├── context.ts
│   │   └── loaders/
│   │       └── cachedLoaders.ts
│   └── routes/
│       └── health.ts
└── .env.local
└── .env.develop
└── .env.production
```

## Verification Checklist

### CacheService
- [ ] CacheService class created
- [ ] Multi-level caching (L1 + L2) working
- [ ] get/set/delete operations working
- [ ] getOrSet pattern working
- [ ] Tag-based invalidation working
- [ ] Cache statistics tracked

### Redis Connection
- [ ] Redis URL configured in environment
- [ ] Connection established on startup
- [ ] Reconnection on failure
- [ ] Graceful shutdown

### GraphQL Integration
- [ ] Cached DataLoaders created
- [ ] Context includes cache service
- [ ] Resolver caching working
- [ ] N+1 queries prevented

### Invalidation
- [ ] Event-driven invalidation set up
- [ ] Model hooks configured
- [ ] Tag-based bulk invalidation working
- [ ] TTL expiration working

### Monitoring
- [ ] Cache stats endpoint working
- [ ] Hit rate being tracked
- [ ] Slow cache warnings logged
- [ ] Admin cache clear endpoint working

## TTL Configuration Guide

| Data Type | Recommended TTL | Reason |
|-----------|----------------|--------|
| Static content | 86400 (24h) | Rarely changes |
| Product catalog | 3600 (1h) | Changes occasionally |
| User profile | 300 (5m) | User may update |
| Business settings | 600 (10m) | Admin updates |
| Cart data | 60 (1m) | Frequently changes |
| Session data | 300 (5m) | Active user |
| Inventory | 0 (no cache) | Real-time required |
| Payment status | 0 (no cache) | Real-time required |

## Troubleshooting

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Check connection string
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping
```

### Low Cache Hit Rate
- Review cache key design
- Check TTL settings
- Verify invalidation isn't too aggressive
- Monitor cache eviction

### Memory Issues
```bash
# Check Redis memory
redis-cli -u $REDIS_URL INFO memory

# Check Node.js memory
curl http://localhost:4026/health/cache/stats
```

## Related Skills

- **caching-standard** - Complete caching patterns
- **database-query-optimization-standard** - Query optimization
- **performance-optimization-standard** - Full performance optimization

## Related Commands

- `/implement-performance-optimization` - Full performance setup
- `/implement-migrations` - Database setup
