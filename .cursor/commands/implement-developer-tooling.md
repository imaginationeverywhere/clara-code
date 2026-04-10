# Implement Developer Tooling

Set up comprehensive developer experience tooling including ESLint, Prettier, Husky, lint-staged, VS Code configuration, debugging setup, and code generation scaffolding following DreamiHairCare's production-tested patterns.

## Command Usage

```
/implement-developer-tooling [options]
```

### Options
- `--full` - Complete developer tooling setup (default)
- `--lint` - ESLint + Prettier configuration only
- `--hooks` - Husky + lint-staged setup only
- `--vscode` - VS Code configuration only
- `--debug` - Debugging configuration only
- `--scaffold` - Code generation templates only
- `--audit` - Audit existing tooling setup

### Project Type Options
- `--monorepo` - Configure for monorepo (default)
- `--single` - Configure for single package

## Pre-Implementation Checklist

### Requirements
- [ ] Node.js 18+ installed
- [ ] pnpm 8+ installed (for monorepo)
- [ ] Git repository initialized
- [ ] TypeScript configured

### Dependencies

**Linting & Formatting:**
```bash
# Root dependencies
pnpm add -D eslint prettier husky lint-staged
pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D eslint-config-prettier eslint-plugin-import
pnpm add -D prettier-plugin-tailwindcss

# Frontend-specific
pnpm --filter frontend add -D eslint-config-next

# Optional: Commitlint
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

**Debugging:**
```bash
# Backend
pnpm --filter backend add -D ts-node tsconfig-paths

# Logging
pnpm --filter backend add winston winston-daily-rotate-file
pnpm --filter backend add -D @types/winston

# Error tracking (optional)
pnpm add @sentry/node @sentry/nextjs
```

## Implementation Phases

### Phase 1: ESLint Configuration

#### 1.1 Create Root ESLint Config
```javascript
// .eslintrc.js
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
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.next/', 'coverage/'],
};
```

#### 1.2 Frontend ESLint Extension
```javascript
// frontend/.eslintrc.js
module.exports = {
  extends: ['../.eslintrc.js', 'next/core-web-vitals'],
  rules: {
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'error',
  },
};
```

#### 1.3 Backend ESLint Extension
```javascript
// backend/.eslintrc.js
module.exports = {
  extends: ['../.eslintrc.js'],
  rules: {
    'no-console': 'off',
  },
};
```

### Phase 2: Prettier Configuration

#### 2.1 Create Prettier Config
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### 2.2 Create Prettier Ignore
```
# .prettierignore
node_modules/
dist/
build/
.next/
coverage/
*.min.js
*.min.css
pnpm-lock.yaml
```

### Phase 3: Husky + lint-staged

#### 3.1 Initialize Husky
```bash
# Install and setup
pnpm add -D husky lint-staged
pnpm exec husky install
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
pnpm exec husky add .husky/pre-commit "pnpm exec lint-staged"
```

#### 3.2 Configure lint-staged
```json
// package.json
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
    ]
  }
}
```

#### 3.3 Optional: Commitlint
```bash
# Create commit-msg hook
pnpm exec husky add .husky/commit-msg "pnpm exec commitlint --edit $1"
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'ci', 'build'],
    ],
    'subject-max-length': [2, 'always', 72],
  },
};
```

### Phase 4: VS Code Configuration

#### 4.1 Create VS Code Settings
```json
// .vscode/settings.json
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
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### 4.2 Create Extensions Recommendations
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "apollographql.vscode-apollo",
    "mikestead.dotenv",
    "editorconfig.editorconfig",
    "eamodio.gitlens"
  ]
}
```

### Phase 5: Debugging Configuration

#### 5.1 Create Launch Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend: Debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--require", "ts-node/register",
        "--require", "tsconfig-paths/register"
      ],
      "args": ["${workspaceFolder}/backend/src/index.ts"],
      "cwd": "${workspaceFolder}/backend",
      "envFile": "${workspaceFolder}/backend/.env.local",
      "sourceMaps": true,
      "console": "integratedTerminal"
    },
    {
      "name": "Frontend: Chrome",
      "type": "chrome",
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
      "runtimeArgs": ["jest", "${relativeFile}", "--runInBand"],
      "console": "integratedTerminal"
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Debug",
      "configurations": ["Backend: Debug", "Frontend: Chrome"]
    }
  ]
}
```

#### 5.2 Create Winston Logger
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}
```

### Phase 6: EditorConfig

```ini
# .editorconfig
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
```

### Phase 7: npm Scripts

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "build": "pnpm build:backend && pnpm build:frontend",
    "build:frontend": "pnpm --filter frontend build",
    "build:backend": "pnpm --filter backend build",
    "test": "pnpm --filter \"*\" test",
    "test:coverage": "pnpm --filter \"*\" test:coverage",
    "lint": "pnpm --filter \"*\" lint",
    "lint:fix": "pnpm --filter \"*\" lint:fix",
    "type-check": "pnpm --filter \"*\" type-check",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "pnpm --filter \"*\" clean && rm -rf node_modules",
    "prepare": "husky install"
  }
}
```

## Verification Checklist

### Linting
- [ ] ESLint configured with TypeScript support
- [ ] Prettier configured with Tailwind plugin
- [ ] Frontend-specific rules (Next.js)
- [ ] Backend-specific rules

### Git Hooks
- [ ] Husky initialized
- [ ] Pre-commit hook runs lint-staged
- [ ] lint-staged formats and lints staged files
- [ ] Commitlint validates commit messages (optional)

### VS Code
- [ ] Settings.json with format on save
- [ ] Extensions.json with recommendations
- [ ] launch.json with debug configurations

### Debugging
- [ ] Source maps enabled
- [ ] Winston logger configured
- [ ] VS Code debugger working
- [ ] Chrome debugger working

### Scripts
- [ ] Dev scripts for all workspaces
- [ ] Build scripts for all workspaces
- [ ] Test scripts with coverage
- [ ] Lint and format scripts

## Troubleshooting

### ESLint Not Working
```bash
# Check ESLint config
npx eslint --print-config src/index.ts

# Clear ESLint cache
rm -rf .eslintcache
npx eslint . --fix
```

### Prettier Conflicts
```bash
# Check Prettier config
npx prettier --check .

# Format all files
npx prettier --write .
```

### Husky Not Running
```bash
# Reinstall husky
rm -rf .husky
pnpm exec husky install
pnpm exec husky add .husky/pre-commit "pnpm exec lint-staged"
```

### VS Code Not Formatting
1. Check "editor.formatOnSave" is true
2. Check default formatter is set to Prettier
3. Restart VS Code
4. Check Output panel for errors

## Related Skills

- **developer-experience-standard** - Detailed tooling patterns
- **debugging-standard** - Advanced debugging configuration
- **code-generation-standard** - Scaffolding templates

## Related Commands

- `/implement-testing` - Set up testing framework
- `/implement-ci-cd` - Set up CI/CD pipelines
