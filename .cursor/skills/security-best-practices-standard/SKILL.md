---
name: security-best-practices-standard
description: Implement security best practices with authentication, authorization, input validation, secure headers, and OWASP Top 10 protection. Use when securing APIs, implementing rate limiting, or hardening applications. Triggers on requests for security implementation, OWASP compliance, rate limiting, or secure headers.
---

# Security Best Practices Standard

Production-grade security patterns from DreamiHairCare implementation covering authentication, authorization, input validation, secure headers, rate limiting, and OWASP Top 10 protection.

## Skill Metadata

- **Name:** security-best-practices-standard
- **Version:** 1.0.0
- **Category:** Security
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** clerk-auth-standard, error-monitoring-standard

## When to Use This Skill

Use this skill when:
- Implementing authentication and authorization
- Setting up security headers
- Configuring rate limiting
- Validating and sanitizing input
- Protecting against OWASP Top 10
- Conducting security audits

## Core Patterns

### 1. Security Headers (Express)

```typescript
// backend/src/middleware/securityHeaders.ts
import helmet from 'helmet';
import { Express } from 'express';

export function setupSecurityHeaders(app: Express) {
  // Helmet for basic security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com", "wss:"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Stripe
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }));

  // Additional security headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Remove server header
    res.removeHeader('X-Powered-By');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    res.setHeader('Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    next();
  });
}
```

### 2. Rate Limiting

```typescript
// backend/src/middleware/rateLimiting.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

// Redis client for distributed rate limiting
const redis = new Redis(process.env.REDIS_URL);

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests, please try again later',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.auth?.userId || req.ip;
  },
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    error: 'Too many authentication attempts, please try again later',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// GraphQL specific limiter
export const graphqlLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many GraphQL requests',
    retryAfter: 60,
  },
  keyGenerator: (req) => {
    const operationName = req.body?.operationName || 'unknown';
    return `${req.auth?.userId || req.ip}:${operationName}`;
  },
});

// Webhook limiter (less strict, from trusted sources)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
```

### 3. Input Validation with Zod

```typescript
// backend/src/validation/schemas.ts
import { z } from 'zod';

// User registration schema
export const userRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),

  firstName: z.string()
    .min(1, 'First name required')
    .max(100, 'First name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in name')
    .transform(val => val.trim()),

  lastName: z.string()
    .min(1, 'Last name required')
    .max(100, 'Last name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in name')
    .transform(val => val.trim()),
});

// Address schema (prevents injection)
export const addressSchema = z.object({
  line1: z.string().min(1).max(200).trim(),
  line2: z.string().max(200).trim().optional(),
  city: z.string().min(1).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  postalCode: z.string()
    .regex(/^[A-Z0-9\s-]{3,10}$/i, 'Invalid postal code'),
  country: z.string().length(2).toUpperCase(),
});

// Payment amount schema
export const paymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999.99, 'Amount too large')
    .transform(val => Math.round(val * 100) / 100), // Round to cents

  currency: z.enum(['USD', 'EUR', 'GBP']),
});

// Search query schema (prevents injection)
export const searchSchema = z.object({
  query: z.string()
    .max(200)
    .transform(val => val.replace(/[<>'"&]/g, '')), // Strip dangerous chars

  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Validation middleware factory
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
}
```

### 4. SQL Injection Prevention

```typescript
// backend/src/repositories/UserRepository.ts
import { User } from '../models/User';
import { Op } from 'sequelize';

export class UserRepository {
  // SAFE: Using Sequelize ORM with parameterized queries
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  // SAFE: Using parameterized where clauses
  async searchUsers(query: string, limit: number): Promise<User[]> {
    return User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit,
      attributes: ['id', 'firstName', 'lastName', 'email'],
    });
  }

  // If raw queries needed, ALWAYS use parameterized queries
  async customQuery(userId: string): Promise<any> {
    // SAFE: Using replacements
    return User.sequelize?.query(
      'SELECT * FROM users WHERE id = :userId AND deleted_at IS NULL',
      {
        replacements: { userId },
        type: 'SELECT',
      }
    );
  }

  // NEVER do this:
  // async unsafeQuery(userId: string) {
  //   return User.sequelize?.query(`SELECT * FROM users WHERE id = '${userId}'`);
  // }
}
```

### 5. XSS Prevention

```typescript
// backend/src/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content (for rich text fields)
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

// Strip all HTML (for plain text fields)
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

// Escape for JSON output
export function escapeForJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// GraphQL resolver sanitization
export const resolvers = {
  Mutation: {
    createProduct: async (_, { input }, context) => {
      // Sanitize all string inputs
      const sanitizedInput = {
        ...input,
        name: stripHtml(input.name),
        description: sanitizeHtml(input.description), // Allow some HTML
        sku: stripHtml(input.sku),
      };

      return context.dataSources.products.create(sanitizedInput);
    },
  },
};
```

### 6. Authentication Middleware

```typescript
// backend/src/middleware/auth.ts
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request, Response, NextFunction } from 'express';

export interface AuthContext {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      req.auth = undefined;
      return next();
    }

    const token = authHeader.substring(7);

    // Verify with Clerk
    const session = await clerkClient.verifyToken(token);

    if (!session) {
      req.auth = undefined;
      return next();
    }

    // Get user details
    const user = await clerkClient.users.getUser(session.sub);

    req.auth = {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      role: (user.publicMetadata?.role as AuthContext['role']) || 'USER',
    };

    next();
  } catch (error) {
    req.auth = undefined;
    next();
  }
}

// Require authentication
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Require specific role
export function requireRole(...roles: AuthContext['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
```

### 7. CORS Configuration

```typescript
// backend/src/config/cors.ts
import cors from 'cors';

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  // Development origins
  ...(process.env.NODE_ENV === 'development' ? [
    'http://localhost:3000',
    'http://localhost:3001',
  ] : []),
].filter(Boolean);

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
};
```

### 8. Webhook Signature Verification

```typescript
// backend/src/middleware/webhookVerification.ts
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Stripe webhook verification
export function verifyStripeWebhook(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    try {
      // Stripe handles verification internally
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      req.body = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        secret
      );
      next();
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
  };
}

// Generic HMAC webhook verification
export function verifyHmacWebhook(secret: string, headerName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers[headerName.toLowerCase()];

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody || '')
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  };
}
```

### 9. Secrets Management

```typescript
// backend/src/config/secrets.ts
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({ region: process.env.AWS_REGION });

// Cache for secrets
const secretsCache = new Map<string, { value: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSecret(name: string): Promise<string> {
  // Check cache first
  const cached = secretsCache.get(name);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  // Fetch from Parameter Store
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  const response = await ssm.send(command);
  const value = response.Parameter?.Value;

  if (!value) {
    throw new Error(`Secret not found: ${name}`);
  }

  // Cache the value
  secretsCache.set(name, {
    value,
    expiry: Date.now() + CACHE_TTL,
  });

  return value;
}

// Load all required secrets at startup
export async function loadSecrets(): Promise<void> {
  const requiredSecrets = [
    '/app/production/DATABASE_URL',
    '/app/production/CLERK_SECRET_KEY',
    '/app/production/STRIPE_SECRET_KEY',
    '/app/production/STRIPE_WEBHOOK_SECRET',
  ];

  await Promise.all(
    requiredSecrets.map(async (name) => {
      const value = await getSecret(name);
      const envName = name.split('/').pop()!;
      process.env[envName] = value;
    })
  );
}
```

## Security Checklist

### Authentication & Authorization
- [ ] JWT tokens validated on every request
- [ ] Role-based access control implemented
- [ ] Session timeout configured
- [ ] Password requirements enforced
- [ ] MFA enabled for admin accounts

### Input Validation
- [ ] All inputs validated with Zod schemas
- [ ] HTML sanitized before storage
- [ ] SQL injection prevented (parameterized queries)
- [ ] File uploads validated and scanned

### Security Headers
- [ ] CSP configured
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] HSTS enabled in production

### Rate Limiting
- [ ] API rate limiting configured
- [ ] Authentication endpoints strictly limited
- [ ] GraphQL depth/complexity limits set
- [ ] File upload size limits enforced

### Secrets Management
- [ ] No secrets in code or git
- [ ] AWS Parameter Store for production
- [ ] Environment variables for non-sensitive config
- [ ] Secrets rotated regularly

### Monitoring
- [ ] Failed auth attempts logged
- [ ] Unusual activity alerts configured
- [ ] Security events sent to Sentry
- [ ] Audit logs maintained

## OWASP Top 10 Coverage

| Risk | Mitigation |
|------|------------|
| A01 Broken Access Control | RBAC, auth middleware |
| A02 Cryptographic Failures | HTTPS, bcrypt, secure tokens |
| A03 Injection | Zod validation, parameterized queries |
| A04 Insecure Design | Threat modeling, secure defaults |
| A05 Security Misconfiguration | Helmet, secure headers |
| A06 Vulnerable Components | npm audit, Dependabot |
| A07 Auth Failures | Clerk, rate limiting, MFA |
| A08 Integrity Failures | Webhook signatures, CSP |
| A09 Logging Failures | Sentry, structured logging |
| A10 SSRF | Input validation, allowlists |

## Related Commands

- `/implement-security-audit` - Run security audit
- `/implement-testing` - Security test scenarios

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial release from DreamiHairCare patterns |
