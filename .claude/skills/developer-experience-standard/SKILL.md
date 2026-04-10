---
name: developer-experience-standard
description: Implement developer experience tooling with monorepo setup, ESLint, Prettier, Husky hooks, and code quality automation. Use when setting up development environments, configuring linting, or improving DX. Triggers on requests for dev tooling, code quality setup, monorepo configuration, or pre-commit hooks.
---

# Developer Experience Standard

Production-tested developer experience patterns extracted from Quik Nation AI Boilerplate and DreamiHairCare projects.

## Overview

This skill defines standards for:
- Monorepo workspace configuration
- Code quality tooling (ESLint, Prettier)
- Pre-commit hooks (Husky, lint-staged)
- TypeScript configuration
- npm scripts organization
- Editor configuration

## Monorepo Workspace Configuration

### Root package.json Pattern

```json
{
  "name": "project-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend",
    "mobile",
    "shared/*",
    "infrastructure"
  ],
  "scripts": {
    "dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev:mobile": "pnpm --filter mobile dev",
    "build": "pnpm --filter backend build && pnpm --filter frontend build",
    "build:frontend": "pnpm --filter frontend build",
    "build:backend": "pnpm --filter backend build",
    "test": "pnpm --filter \"*\" test",
    "test:frontend": "pnpm --filter frontend test",
    "test:backend": "pnpm --filter backend test",
    "lint": "pnpm --filter \"*\" lint",
    "lint:fix": "pnpm --filter \"*\" lint:fix",
    "type-check": "pnpm --filter \"*\" type-check",
    "clean": "pnpm --filter \"*\" clean",
    "setup": "pnpm install && pnpm --filter \"*\" setup"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.2.2",
    "@types/node": "^20.8.0",
    "eslint": "^8.51.0",
    "prettier": "^3.0.3",
    "husky": "^8.0.3",
    "lint-staged": "^15.0.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.10.0"
}
```

### Workspace Structure

```
project/
├── frontend/              # Next.js 16 application
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── backend/               # Express.js/NestJS API
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── mobile/                # React Native application
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── shared/                # Shared packages
│   ├── types/             # TypeScript types
│   │   └── package.json
│   ├── utils/             # Shared utilities
│   │   └── package.json
│   └── config/            # Shared configuration
│       └── package.json
├── infrastructure/        # AWS CDK
│   ├── package.json
│   └── lib/
├── package.json           # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .npmrc
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'frontend'
  - 'backend'
  - 'mobile'
  - 'shared/*'
  - 'infrastructure'
```

### .npmrc Configuration

```ini
# Strict pnpm settings
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=true
link-workspace-packages=true
prefer-workspace-packages=true

# Performance
fetch-retries=3
fetch-timeout=60000

# Lockfile
lockfile=true
frozen-lockfile=true
```

## ESLint Configuration

### Root .eslintrc.js

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json', './*/tsconfig.json'],
      },
    },
  },
  rules: {
    // TypeScript strict rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-floating-promises': 'error',

    // Import organization
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',

    // General best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '*.config.js',
    '*.config.mjs',
  ],
};
```

### Frontend ESLint Extension

```javascript
// frontend/.eslintrc.js
module.exports = {
  extends: ['../.eslintrc.js', 'next/core-web-vitals'],
  rules: {
    // React-specific rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Next.js specific
    '@next/next/no-img-element': 'error',
    '@next/next/no-html-link-for-pages': 'error',
  },
};
```

### Backend ESLint Extension

```javascript
// backend/.eslintrc.js
module.exports = {
  extends: ['../.eslintrc.js'],
  rules: {
    // Backend-specific rules
    'no-console': 'off', // Allow console in backend for logging
    '@typescript-eslint/no-require-imports': 'warn',
  },
};
```

## Prettier Configuration

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "tabWidth": 2
      }
    }
  ]
}
```

### .prettierignore

```
node_modules/
dist/
build/
.next/
coverage/
*.min.js
*.min.css
pnpm-lock.yaml
package-lock.json
```

## Husky + lint-staged

### Setup Commands

```bash
# Install husky
pnpm add -D husky
pnpm exec husky install

# Add prepare script to package.json
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
pnpm exec husky add .husky/pre-commit "pnpm exec lint-staged"

# Create commit-msg hook (optional - for commitlint)
pnpm exec husky add .husky/commit-msg "pnpm exec commitlint --edit $1"
```

### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

### lint-staged Configuration

```json
{
  "lint-staged": {
    "**/*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "**/*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "**/*.{json,md,yaml,yml}": [
      "prettier --write"
    ],
    "**/*.css": [
      "prettier --write"
    ]
  }
}
```

## TypeScript Configuration

### tsconfig.base.json (Root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true
  },
  "exclude": ["node_modules", "dist", "build", ".next", "coverage"]
}
```

### Frontend tsconfig.json

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Backend tsconfig.json

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@/models/*": ["./models/*"],
      "@/services/*": ["./services/*"],
      "@/middleware/*": ["./middleware/*"],
      "@/utils/*": ["./utils/*"],
      "@/types/*": ["./types/*"],
      "@/graphql/*": ["./graphql/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  }
}
```

## npm Scripts Organization

### Recommended Script Categories

```json
{
  "scripts": {
    // Development
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev:mobile": "pnpm --filter mobile dev",

    // Building
    "build": "pnpm build:backend && pnpm build:frontend",
    "build:frontend": "pnpm --filter frontend build",
    "build:backend": "pnpm --filter backend build",

    // Testing
    "test": "pnpm --filter \"*\" test",
    "test:frontend": "pnpm --filter frontend test",
    "test:backend": "pnpm --filter backend test",
    "test:e2e": "pnpm --filter frontend test:e2e",
    "test:coverage": "pnpm --filter \"*\" test:coverage",

    // Code Quality
    "lint": "pnpm --filter \"*\" lint",
    "lint:fix": "pnpm --filter \"*\" lint:fix",
    "type-check": "pnpm --filter \"*\" type-check",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",

    // Database
    "db:migrate": "pnpm --filter backend db:migrate",
    "db:seed": "pnpm --filter backend db:seed",
    "db:reset": "pnpm --filter backend db:reset",

    // Deployment
    "deploy:frontend": "pnpm --filter frontend deploy",
    "deploy:backend": "pnpm --filter backend deploy",
    "deploy:all": "pnpm deploy:backend && pnpm deploy:frontend",

    // Maintenance
    "clean": "pnpm --filter \"*\" clean && rm -rf node_modules",
    "setup": "pnpm install && pnpm --filter \"*\" setup",
    "prepare": "husky install"
  }
}
```

## Editor Configuration

### .editorconfig

```ini
# EditorConfig helps maintain consistent coding styles
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

### VS Code Settings (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### VS Code Extensions (.vscode/extensions.json)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "apollographql.vscode-apollo",
    "mikestead.dotenv",
    "editorconfig.editorconfig",
    "github.copilot",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker"
  ]
}
```

## Commitlint Configuration (Optional)

### commitlint.config.js

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code refactoring
        'perf',     // Performance
        'test',     // Tests
        'chore',    // Maintenance
        'revert',   // Revert changes
        'ci',       // CI/CD changes
        'build',    // Build system
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};
```

## Verification Checklist

### Setup Complete
- [ ] pnpm workspaces configured
- [ ] ESLint with TypeScript rules
- [ ] Prettier with consistent formatting
- [ ] Husky pre-commit hooks
- [ ] lint-staged for staged files only
- [ ] TypeScript strict mode enabled
- [ ] VS Code settings configured
- [ ] EditorConfig present
- [ ] npm scripts organized

### Quality Gates
- [ ] Pre-commit: lint-staged runs
- [ ] Type errors block commit
- [ ] ESLint errors block commit
- [ ] Prettier formats all files

## Related Skills

- **debugging-standard** - Debugging configuration and patterns
- **code-generation-standard** - Code scaffolding patterns
- **testing-automation** - Testing strategy and coverage
