---
name: error-monitoring-standard
description: Implement error monitoring with Sentry for Next.js and Express, structured logging, and alerting. Use when setting up error tracking, configuring Sentry, or implementing logging. Triggers on requests for error monitoring, Sentry setup, logging configuration, or alerting systems.
---

# Error Monitoring Standard

Production-grade error monitoring patterns from DreamiHairCare implementation with Sentry integration for both frontend (Next.js) and backend (Express/Node.js), structured logging, and alerting configuration.

## Skill Metadata

- **Name:** error-monitoring-standard
- **Version:** 1.0.0
- **Category:** Observability
- **Source:** DreamiHairCare Production Implementation
- **Related Skills:** testing-strategy-standard, ci-cd-pipeline-standard

## When to Use This Skill

Use this skill when:
- Setting up Sentry for error tracking
- Implementing error boundaries in React
- Configuring structured logging
- Setting up performance monitoring
- Implementing alerting and notifications
- Creating error context and breadcrumbs

## Core Patterns

### 1. Backend Sentry Configuration

```typescript
// backend/src/config/sentry.ts
import * as Sentry from '@sentry/node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Sample rates - lower in production for cost management
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Component tagging
    initialScope: {
      tags: {
        component: 'backend',
        project: process.env.PROJECT_NAME || 'app',
      },
    },

    // Filter known/expected errors
    ignoreErrors: [
      'GraphQLError',
      'SequelizeConnectionError',
      'JsonWebTokenError',
      'TokenExpiredError',
    ],

    beforeSend(event, hint) {
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Event:', event);
      }

      // Filter GraphQL validation errors
      if (event.exception?.values?.[0]?.type === 'GraphQLError') {
        return null;
      }

      return event;
    },

    beforeSendTransaction(event) {
      // Skip health/metrics endpoints in production
      if (process.env.NODE_ENV === 'production' && event.transaction) {
        if (event.transaction.includes('/health') ||
            event.transaction.includes('/metrics')) {
          return null;
        }
      }
      return event;
    },
  });
}

// Helper: Capture error with context
export function captureErrorWithContext(
  error: Error,
  context: Record<string, any> = {}
) {
  Sentry.withScope((scope) => {
    // Add context data
    Object.entries(context).forEach(([key, value]) => {
      scope.setContext(key, value);
    });

    // Add user context
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    // Add request context
    if (context.request) {
      scope.setContext('request', {
        url: context.request.url,
        method: context.request.method,
        headers: context.request.headers,
      });
    }

    Sentry.captureException(error);
  });
}

// Helper: Add breadcrumbs
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

// Helper: Capture messages
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.captureMessage(message, level);
}

export { Sentry };
```

### 2. Express Sentry Middleware

```typescript
// backend/src/middleware/sentry.ts
import * as Sentry from '@sentry/node';
import { Express, Request, Response, NextFunction } from 'express';

export function setupSentryMiddleware(app: Express) {
  // Request handler - must be first middleware
  app.use(Sentry.Handlers.requestHandler());

  // Tracing handler - performance monitoring
  app.use(Sentry.Handlers.tracingHandler());
}

export function setupSentryErrorHandler(app: Express) {
  // Error handler - must be before any other error handlers
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 4xx and 5xx errors
      if (error.status && error.status >= 400) {
        return true;
      }
      return true;
    },
  }));

  // Custom error handler that runs after Sentry
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    // Don't expose error details in production
    const isDev = process.env.NODE_ENV === 'development';

    res.status(500).json({
      error: 'Internal Server Error',
      message: isDev ? err.message : 'An unexpected error occurred',
      ...(isDev && { stack: err.stack }),
    });
  });
}
```

### 3. Frontend Next.js 16 Instrumentation

```typescript
// frontend/src/instrumentation.ts
import * as Sentry from "@sentry/nextjs";

export async function register() {
  const baseConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
  };

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    Sentry.init({
      ...baseConfig,
      debug: false,
      initialScope: {
        tags: {
          component: 'frontend-server',
          project: process.env.NEXT_PUBLIC_PROJECT_NAME || 'app',
        },
      },
      beforeSend(event) {
        // Filter chunk load errors
        if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
          return null;
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    Sentry.init({
      ...baseConfig,
      debug: false,
      initialScope: {
        tags: {
          component: 'frontend-edge',
          project: process.env.NEXT_PUBLIC_PROJECT_NAME || 'app',
        },
      },
    });
  }
}

// Hook for capturing RSC errors
export async function onRequestError(
  err: unknown,
  request: { path: string }
) {
  Sentry.captureRequestError(err, {
    method: 'GET',
    headers: {},
    url: request.path,
  } as any, {} as any);
}
```

### 4. Frontend Client Instrumentation

```typescript
// frontend/src/instrumentation-client.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  initialScope: {
    tags: {
      component: 'frontend-client',
      project: process.env.NEXT_PUBLIC_PROJECT_NAME || 'app',
    },
  },

  beforeSend(event) {
    // Filter known client-side errors
    if (event.exception?.values?.[0]) {
      const error = event.exception.values[0];

      // Skip network errors
      if (error.type === 'TypeError' &&
          error.value?.includes('Failed to fetch')) {
        return null;
      }

      // Skip chunk load errors
      if (error.type === 'ChunkLoadError') {
        return null;
      }
    }

    return event;
  },
});
```

### 5. Global Error Boundary

```tsx
// frontend/src/app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-US" suppressHydrationWarning>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Something went wrong!
              </h2>
              <p className="text-gray-600 mb-6">
                We've been notified and are working to fix it.
              </p>
              <button
                onClick={reset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 6. Error Boundary Component

```tsx
// frontend/src/components/ErrorBoundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setContext('react', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7. Structured Logging

```typescript
// backend/src/utils/logger.ts
import * as Sentry from '@sentry/node';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  withContext(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...data,
    };

    // Console output
    const consoleMethod = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         level === 'debug' ? console.debug :
                         console.log;
    consoleMethod(JSON.stringify(logEntry));

    // Add Sentry breadcrumb
    Sentry.addBreadcrumb({
      message,
      category: this.context.operation || 'general',
      level: level === 'error' ? 'error' :
             level === 'warn' ? 'warning' : 'info',
      data: { ...this.context, ...data },
    });
  }

  debug(message: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: Record<string, any>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log('warn', message, data);

    // Report warnings to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message, 'warning');
    }
  }

  error(message: string, error?: Error, data?: Record<string, any>) {
    this.log('error', message, { ...data, error: error?.message });

    // Always report errors to Sentry
    if (error) {
      Sentry.withScope((scope) => {
        Object.entries({ ...this.context, ...data }).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        if (this.context.userId) {
          scope.setUser({ id: this.context.userId });
        }
        Sentry.captureException(error);
      });
    }
  }
}

export const logger = new Logger();
export { Logger };
```

### 8. GraphQL Error Handling

```typescript
// backend/src/graphql/plugins/sentryPlugin.ts
import * as Sentry from '@sentry/node';
import { ApolloServerPlugin } from '@apollo/server';

export const sentryPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(ctx) {
        // Skip validation errors
        if (ctx.errors?.every(e => e.extensions?.code === 'GRAPHQL_VALIDATION_FAILED')) {
          return;
        }

        for (const error of ctx.errors || []) {
          // Skip user errors
          if (error.extensions?.code === 'BAD_USER_INPUT' ||
              error.extensions?.code === 'UNAUTHENTICATED') {
            continue;
          }

          Sentry.withScope((scope) => {
            // Add operation context
            scope.setTag('graphql.operation', ctx.operationName || 'unknown');
            scope.setTag('graphql.type', ctx.operation?.operation || 'unknown');

            // Add variables (be careful with sensitive data)
            if (ctx.request?.variables) {
              const safeVariables = { ...ctx.request.variables };
              delete safeVariables.password;
              delete safeVariables.token;
              scope.setContext('graphql', {
                operationName: ctx.operationName,
                variables: safeVariables,
              });
            }

            // Add user context
            if (ctx.contextValue?.auth?.userId) {
              scope.setUser({ id: ctx.contextValue.auth.userId });
            }

            if (error.path) {
              scope.addBreadcrumb({
                category: 'graphql.path',
                message: error.path.join(' > '),
                level: 'debug',
              });
            }

            Sentry.captureException(error);
          });
        }
      },
    };
  },
};
```

## Environment Variables

```bash
# Sentry Configuration
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Sentry Auth Token (for source maps)
SENTRY_AUTH_TOKEN=sntrys_xxx

# Sentry Organization and Project
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## next.config.mjs Integration

```javascript
// frontend/next.config.mjs
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Your existing config
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true,
  hideSourceMaps: true,

  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
```

## Alerting Configuration

### Sentry Alert Rules

1. **Critical Errors** - Immediate notification
   - Filter: `error.type:Error AND NOT error.type:ChunkLoadError`
   - Threshold: 1 event in 1 minute
   - Action: Slack + Email

2. **Error Spike** - Warning
   - Filter: `is:unresolved`
   - Threshold: 50% increase vs last hour
   - Action: Slack

3. **Performance Degradation**
   - Metric: Transaction duration > 3s
   - Threshold: 10 transactions in 10 minutes
   - Action: Slack

## Implementation Checklist

### Backend
- [ ] Sentry SDK installed
- [ ] initSentry() called at startup
- [ ] Express middleware configured
- [ ] GraphQL plugin added
- [ ] Error context helpers used

### Frontend
- [ ] Sentry SDK installed
- [ ] instrumentation.ts created
- [ ] instrumentation-client.ts created
- [ ] global-error.tsx implemented
- [ ] ErrorBoundary components used

### Configuration
- [ ] Environment variables set
- [ ] Source maps configured
- [ ] Alert rules created
- [ ] Team notifications configured

## Related Commands

- `/implement-testing` - Testing with error scenarios
- `/implement-security-audit` - Security monitoring

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial release from DreamiHairCare patterns |
