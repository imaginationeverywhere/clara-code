---
name: debugging-standard
description: Implement debugging patterns with VS Code configuration, source maps, and logging. Use when setting up debuggers, configuring source maps, or implementing logging systems. Triggers on requests for debugging setup, VS Code configuration, source maps, or log management.
---

# Debugging Standard

Production-tested debugging patterns for full-stack TypeScript applications following Quik Nation AI Boilerplate conventions.

## Overview

This skill defines standards for:
- VS Code debugging configuration
- Source maps configuration
- Logging and log management
- Error tracking and monitoring
- Browser DevTools integration
- React/React Native debugging
- GraphQL debugging
- Database query debugging

## VS Code Debugging Configuration

### launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend: Debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--require",
        "ts-node/register",
        "--require",
        "tsconfig-paths/register"
      ],
      "args": ["${workspaceFolder}/backend/src/index.ts"],
      "cwd": "${workspaceFolder}/backend",
      "envFile": "${workspaceFolder}/backend/.env.local",
      "sourceMaps": true,
      "smartStep": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Backend: Attach",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "localRoot": "${workspaceFolder}/backend",
      "remoteRoot": "/app"
    },
    {
      "name": "Frontend: Debug (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack://_N_E/*": "${webRoot}/*"
      }
    },
    {
      "name": "Frontend: Debug (Edge)",
      "type": "msedge",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend",
      "sourceMaps": true
    },
    {
      "name": "Jest: Current File",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": [
        "jest",
        "${relativeFile}",
        "--runInBand",
        "--no-coverage"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Jest: Debug All",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": [
        "jest",
        "--runInBand",
        "--no-coverage"
      ],
      "console": "integratedTerminal"
    },
    {
      "name": "Playwright: Debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": [
        "playwright",
        "test",
        "--debug"
      ],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal"
    },
    {
      "name": "Mobile: React Native Debugger",
      "type": "reactnative",
      "request": "attach",
      "cwd": "${workspaceFolder}/mobile",
      "sourceMaps": true
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Debug",
      "configurations": ["Backend: Debug", "Frontend: Debug (Chrome)"]
    }
  ]
}
```

### tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Backend: Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^(.*):(\\d+):(\\d+)\\s+-\\s+(.*)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "message": 4
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^\\[nodemon\\]",
          "endsPattern": "Server running"
        }
      }
    },
    {
      "label": "Frontend: Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "isBackground": true,
      "problemMatcher": "$tsc-watch"
    },
    {
      "label": "Type Check: All",
      "type": "shell",
      "command": "pnpm type-check",
      "problemMatcher": "$tsc"
    },
    {
      "label": "Lint: Fix All",
      "type": "shell",
      "command": "pnpm lint:fix",
      "problemMatcher": "$eslint-stylish"
    }
  ]
}
```

## Source Maps Configuration

### TypeScript (Backend)

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "declarationMap": true,
    "inlineSources": true
  }
}
```

### Next.js (Frontend)

```javascript
// frontend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: process.env.NODE_ENV !== 'production',
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};

export default nextConfig;
```

### React Native

```javascript
// mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Enable inline source maps for debugging
if (process.env.NODE_ENV !== 'production') {
  config.transformer.minifierConfig = {
    ...config.transformer.minifierConfig,
    sourceMap: {
      includeSources: true,
    },
  };
}

module.exports = config;
```

## Logging Configuration

### Winston Logger (Backend)

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${stack || message} ${metaStr}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'debug',
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: process.env.SERVICE_NAME || 'backend' },
  transports,
});

// Request context logging
export interface RequestLogMeta {
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  duration?: number;
}

export function logRequest(meta: RequestLogMeta): void {
  logger.info('Request', meta);
}

export function logError(error: Error, context?: Record<string, unknown>): void {
  logger.error('Error', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}
```

### Request Logging Middleware

```typescript
// backend/src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { logger, logRequest } from '@/utils/logger';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.startTime = Date.now();

  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logRequest({
      requestId: req.requestId,
      userId: (req as any).auth?.userId,
      method: req.method,
      path: req.path,
      duration,
    });

    if (duration > 1000) {
      logger.warn('Slow request', {
        requestId: req.requestId,
        duration,
        path: req.path,
      });
    }
  });

  next();
}
```

### Frontend Console Wrapper

```typescript
// frontend/src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (isDev) {
      console.debug(formatMessage('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    console.info(formatMessage('info', message, context));
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage('warn', message, context));
  },

  error(message: string, error?: Error, context?: LogContext): void {
    console.error(formatMessage('error', message, { ...context, stack: error?.stack }));

    // Send to error tracking service in production
    if (!isDev && typeof window !== 'undefined') {
      // Sentry.captureException(error);
    }
  },
};
```

## Error Tracking (Sentry)

### Backend Sentry Setup

```typescript
// backend/src/utils/sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(): void {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
    });
  }
}

export function captureError(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function setUser(userId: string, email?: string): void {
  Sentry.setUser({ id: userId, email });
}
```

### Frontend Sentry Setup

```typescript
// frontend/src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry(): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration(),
      ],
    });
  }
}

// Error boundary wrapper
export function captureComponentError(error: Error, componentStack: string): void {
  Sentry.captureException(error, {
    extra: { componentStack },
  });
}
```

## GraphQL Debugging

### Apollo Server Debugging

```typescript
// backend/src/graphql/plugins/loggingPlugin.ts
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';

import { logger } from '@/utils/logger';

export const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart({ request }): Promise<GraphQLRequestListener<any>> {
    const startTime = Date.now();

    logger.debug('GraphQL request started', {
      operationName: request.operationName,
      query: request.query?.substring(0, 200),
    });

    return {
      async willSendResponse({ response }) {
        const duration = Date.now() - startTime;

        logger.info('GraphQL request completed', {
          operationName: request.operationName,
          duration,
          errors: response.body.kind === 'single' ? response.body.singleResult.errors?.length : 0,
        });

        if (duration > 1000) {
          logger.warn('Slow GraphQL query', {
            operationName: request.operationName,
            duration,
            query: request.query,
          });
        }
      },

      async didEncounterErrors({ errors }) {
        for (const error of errors) {
          logger.error('GraphQL error', {
            message: error.message,
            path: error.path,
            locations: error.locations,
            extensions: error.extensions,
          });
        }
      },
    };
  },
};
```

### Apollo Client Debugging

```typescript
// frontend/src/lib/apollo.ts
import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Path: ${path}, Location: ${locations}`
      );

      // Log to error tracking
      if (process.env.NODE_ENV === 'production') {
        // Sentry.captureMessage(`GraphQL Error: ${message}`, {
        //   extra: { path, locations, extensions, operationName: operation.operationName },
        // });
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Logging link for development
const loggingLink = new ApolloLink((operation, forward) => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = Date.now();
    console.group(`GraphQL: ${operation.operationName}`);
    console.log('Variables:', operation.variables);

    return forward(operation).map((response) => {
      const duration = Date.now() - startTime;
      console.log('Response:', response);
      console.log(`Duration: ${duration}ms`);
      console.groupEnd();
      return response;
    });
  }

  return forward(operation);
});

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, loggingLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development',
});
```

## Database Query Debugging

### Sequelize Query Logging

```typescript
// backend/src/config/database.ts
import { Sequelize } from 'sequelize';

import { logger } from '@/utils/logger';

const logQuery = (query: string, timing?: number): void => {
  if (process.env.LOG_SQL === 'true') {
    logger.debug('SQL Query', { query: query.substring(0, 500), timing });
  }

  if (timing && timing > 500) {
    logger.warn('Slow SQL query', { query, timing });
  }
};

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? logQuery : false,
  benchmark: true,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Query timing middleware
sequelize.addHook('afterFind', (result, options) => {
  if (options.benchmark) {
    // timing available in options
  }
});
```

### Explain Analyze Utility

```typescript
// backend/src/utils/queryAnalyzer.ts
import { sequelize } from '@/config/database';
import { logger } from '@/utils/logger';

interface ExplainResult {
  'QUERY PLAN': string;
}

export async function explainQuery(sql: string): Promise<void> {
  try {
    const [results] = await sequelize.query<ExplainResult>(`EXPLAIN ANALYZE ${sql}`);

    logger.info('Query Explain', {
      plan: results.map(r => r['QUERY PLAN']).join('\n'),
    });
  } catch (error) {
    logger.error('Failed to explain query', error as Error);
  }
}

export async function checkSlowQueries(): Promise<void> {
  const [results] = await sequelize.query(`
    SELECT query, calls, mean_time, total_time
    FROM pg_stat_statements
    WHERE mean_time > 100
    ORDER BY total_time DESC
    LIMIT 10
  `);

  logger.info('Slow queries', { queries: results });
}
```

## React DevTools Integration

### Debug Component

```typescript
// frontend/src/components/debug/DevTools.tsx
'use client';

import { useEffect, useState } from 'react';

import { useAppSelector } from '@/store/hooks';

export function DevTools() {
  const [isVisible, setIsVisible] = useState(false);
  const state = useAppSelector(state => state);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-gray-900 p-4 text-white shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold">Redux State</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>
      <pre className="max-h-96 overflow-auto text-xs">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}
```

## Performance Profiling

### Node.js Profiling

```typescript
// backend/src/utils/profiler.ts
import v8 from 'v8';
import fs from 'fs';
import path from 'path';

export function writeHeapSnapshot(): string {
  const filename = path.join(process.cwd(), `heap-${Date.now()}.heapsnapshot`);
  v8.writeHeapSnapshot(filename);
  return filename;
}

export function getHeapStatistics(): v8.HeapInfo {
  return v8.getHeapStatistics();
}

export function logMemoryUsage(): void {
  const usage = process.memoryUsage();
  console.log('Memory Usage:', {
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
  });
}

// Memory leak detection
let lastHeapUsed = 0;
export function checkMemoryGrowth(): void {
  const { heapUsed } = process.memoryUsage();
  const growth = heapUsed - lastHeapUsed;

  if (growth > 50 * 1024 * 1024) { // 50MB growth
    console.warn('Large memory growth detected:', {
      growth: `${Math.round(growth / 1024 / 1024)}MB`,
      total: `${Math.round(heapUsed / 1024 / 1024)}MB`,
    });
  }

  lastHeapUsed = heapUsed;
}
```

## Debug Environment Variables

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
LOG_SQL=true
DEBUG=*
SENTRY_DSN=

# Apollo DevTools
APOLLO_KEY=

# Profiling
ENABLE_PROFILING=true
```

## Verification Checklist

### Debugging Setup
- [ ] VS Code launch.json configured
- [ ] Source maps enabled (TS, Next.js, React Native)
- [ ] Winston logger with rotation
- [ ] Request logging middleware
- [ ] Error tracking (Sentry) configured

### Quality Tools
- [ ] GraphQL logging plugin
- [ ] Apollo Client error link
- [ ] Database query logging
- [ ] Memory usage monitoring
- [ ] Performance profiling utilities

### Development Experience
- [ ] Debug keyboard shortcuts
- [ ] Redux DevTools integration
- [ ] Browser DevTools configuration
- [ ] Jest debugging support

## Related Skills

- **developer-experience-standard** - Developer tooling setup
- **code-generation-standard** - Code scaffolding
- **performance-optimization-standard** - Performance patterns
