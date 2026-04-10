---
name: code-generation-standard
description: Implement code generation for scaffolding components, services, and features. Use when creating React components, Express services, GraphQL resolvers, or database models. Triggers on requests for code scaffolding, component generation, boilerplate creation, or feature templates.
---

# Code Generation Standard

Production-tested code generation patterns for scaffolding components, services, and features following Quik Nation AI Boilerplate conventions.

## Overview

This skill defines standards for:
- Component scaffolding (React, React Native)
- Service scaffolding (Express, GraphQL)
- Model and migration generation
- API endpoint scaffolding
- Test file generation
- Feature module scaffolding

## Component Scaffolding

### React Component Template

```typescript
// templates/component.tsx.template
import type { FC } from 'react';

import { cn } from '@/lib/utils';

export interface {{ComponentName}}Props {
  className?: string;
  children?: React.ReactNode;
}

export const {{ComponentName}}: FC<{{ComponentName}}Props> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};

{{ComponentName}}.displayName = '{{ComponentName}}';
```

### React Component with State Template

```typescript
// templates/component-with-state.tsx.template
'use client';

import { useState, useCallback, type FC } from 'react';

import { cn } from '@/lib/utils';

export interface {{ComponentName}}Props {
  className?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
}

export const {{ComponentName}}: FC<{{ComponentName}}Props> = ({
  className,
  initialValue = '',
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <div className={cn('', className)}>
      {/* Component content */}
    </div>
  );
};

{{ComponentName}}.displayName = '{{ComponentName}}';
```

### Page Component Template (Next.js App Router)

```typescript
// templates/page.tsx.template
import type { Metadata } from 'next';

import { {{ComponentName}} } from '@/components/{{componentPath}}';

export const metadata: Metadata = {
  title: '{{pageTitle}}',
  description: '{{pageDescription}}',
};

interface {{PageName}}Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function {{PageName}}({
  params,
  searchParams,
}: {{PageName}}Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <main className="container mx-auto px-4 py-8">
      <{{ComponentName}} />
    </main>
  );
}
```

### React Native Component Template

```typescript
// templates/rn-component.tsx.template
import React, { memo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

export interface {{ComponentName}}Props {
  style?: ViewStyle;
  testID?: string;
}

export const {{ComponentName}} = memo<{{ComponentName}}Props>(({
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text>{{ComponentName}}</Text>
    </View>
  );
});

{{ComponentName}}.displayName = '{{ComponentName}}';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Service Scaffolding

### Backend Service Template

```typescript
// templates/service.ts.template
import { logger } from '@/utils/logger';
import type { {{EntityName}} } from '@/types';

export interface {{ServiceName}}Config {
  // Service configuration options
}

export class {{ServiceName}} {
  private readonly config: {{ServiceName}}Config;

  constructor(config: {{ServiceName}}Config) {
    this.config = config;
  }

  async get{{EntityName}}ById(id: string): Promise<{{EntityName}} | null> {
    try {
      // Implementation
      logger.info(`Fetching {{entityName}} with id: ${id}`);
      throw new Error('Not implemented');
    } catch (error) {
      logger.error(`Error fetching {{entityName}}:`, error);
      throw error;
    }
  }

  async create{{EntityName}}(data: Omit<{{EntityName}}, 'id'>): Promise<{{EntityName}}> {
    try {
      logger.info('Creating new {{entityName}}');
      throw new Error('Not implemented');
    } catch (error) {
      logger.error('Error creating {{entityName}}:', error);
      throw error;
    }
  }

  async update{{EntityName}}(id: string, data: Partial<{{EntityName}}>): Promise<{{EntityName}}> {
    try {
      logger.info(`Updating {{entityName}} with id: ${id}`);
      throw new Error('Not implemented');
    } catch (error) {
      logger.error('Error updating {{entityName}}:', error);
      throw error;
    }
  }

  async delete{{EntityName}}(id: string): Promise<void> {
    try {
      logger.info(`Deleting {{entityName}} with id: ${id}`);
      throw new Error('Not implemented');
    } catch (error) {
      logger.error('Error deleting {{entityName}}:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const {{serviceName}} = new {{ServiceName}}({});
```

### Repository Pattern Template

```typescript
// templates/repository.ts.template
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { {{ModelName}} } from '@/models';
import type { {{EntityName}}, Create{{EntityName}}Input, Update{{EntityName}}Input } from '@/types';

export interface {{RepositoryName}}Interface {
  findById(id: string): Promise<{{EntityName}} | null>;
  findAll(options?: FindAllOptions): Promise<{{EntityName}}[]>;
  create(data: Create{{EntityName}}Input): Promise<{{EntityName}}>;
  update(id: string, data: Update{{EntityName}}Input): Promise<{{EntityName}}>;
  delete(id: string): Promise<boolean>;
}

interface FindAllOptions {
  limit?: number;
  offset?: number;
  where?: Record<string, unknown>;
  order?: [string, 'ASC' | 'DESC'][];
}

export class {{RepositoryName}} implements {{RepositoryName}}Interface {
  async findById(id: string): Promise<{{EntityName}} | null> {
    const record = await {{ModelName}}.findByPk(id);
    return record?.toJSON() as {{EntityName}} | null;
  }

  async findAll(options: FindAllOptions = {}): Promise<{{EntityName}}[]> {
    const { limit = 100, offset = 0, where = {}, order = [['createdAt', 'DESC']] } = options;

    const records = await {{ModelName}}.findAll({
      where,
      limit,
      offset,
      order,
    });

    return records.map(r => r.toJSON() as {{EntityName}});
  }

  async create(data: Create{{EntityName}}Input): Promise<{{EntityName}}> {
    const record = await {{ModelName}}.create({
      id: uuidv4(),
      ...data,
    });

    return record.toJSON() as {{EntityName}};
  }

  async update(id: string, data: Update{{EntityName}}Input): Promise<{{EntityName}}> {
    const record = await {{ModelName}}.findByPk(id);

    if (!record) {
      throw new Error('{{EntityName}} not found');
    }

    await record.update(data);
    return record.toJSON() as {{EntityName}};
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await {{ModelName}}.destroy({ where: { id } });
    return deleted > 0;
  }
}

export const {{repositoryName}} = new {{RepositoryName}}();
```

## GraphQL Scaffolding

### GraphQL Type Definition Template

```typescript
// templates/graphql-type.ts.template
import { gql } from 'graphql-tag';

export const {{typeName}}TypeDefs = gql`
  type {{TypeName}} {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    # Add fields here
  }

  input Create{{TypeName}}Input {
    # Add input fields here
  }

  input Update{{TypeName}}Input {
    # Add input fields here
  }

  extend type Query {
    {{queryName}}(id: ID!): {{TypeName}}
    {{queryNamePlural}}(limit: Int, offset: Int): [{{TypeName}}!]!
  }

  extend type Mutation {
    create{{TypeName}}(input: Create{{TypeName}}Input!): {{TypeName}}!
    update{{TypeName}}(id: ID!, input: Update{{TypeName}}Input!): {{TypeName}}!
    delete{{TypeName}}(id: ID!): Boolean!
  }
`;
```

### GraphQL Resolver Template

```typescript
// templates/graphql-resolver.ts.template
import { AuthenticationError, UserInputError } from 'apollo-server-express';

import { {{repositoryName}} } from '@/repositories/{{RepositoryName}}';
import type { Context, {{TypeName}}, Create{{TypeName}}Input, Update{{TypeName}}Input } from '@/types';

export const {{resolverName}}Resolvers = {
  Query: {
    {{queryName}}: async (
      _parent: unknown,
      { id }: { id: string },
      context: Context
    ): Promise<{{TypeName}} | null> => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      return {{repositoryName}}.findById(id);
    },

    {{queryNamePlural}}: async (
      _parent: unknown,
      { limit, offset }: { limit?: number; offset?: number },
      context: Context
    ): Promise<{{TypeName}}[]> => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      return {{repositoryName}}.findAll({ limit, offset });
    },
  },

  Mutation: {
    create{{TypeName}}: async (
      _parent: unknown,
      { input }: { input: Create{{TypeName}}Input },
      context: Context
    ): Promise<{{TypeName}}> => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      return {{repositoryName}}.create(input);
    },

    update{{TypeName}}: async (
      _parent: unknown,
      { id, input }: { id: string; input: Update{{TypeName}}Input },
      context: Context
    ): Promise<{{TypeName}}> => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const existing = await {{repositoryName}}.findById(id);
      if (!existing) {
        throw new UserInputError('{{TypeName}} not found');
      }

      return {{repositoryName}}.update(id, input);
    },

    delete{{TypeName}}: async (
      _parent: unknown,
      { id }: { id: string },
      context: Context
    ): Promise<boolean> => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      return {{repositoryName}}.delete(id);
    },
  },

  {{TypeName}}: {
    // Add field resolvers with DataLoader here
  },
};
```

## Database Scaffolding

### Sequelize Model Template

```typescript
// templates/model.ts.template
import { DataTypes, Model, type Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { sequelize } from '@/config/database';

export interface {{ModelName}}Attributes {
  id: string;
  // Add attributes here
  createdAt: Date;
  updatedAt: Date;
}

export interface {{ModelName}}CreationAttributes
  extends Optional<{{ModelName}}Attributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class {{ModelName}} extends Model<{{ModelName}}Attributes, {{ModelName}}CreationAttributes>
  implements {{ModelName}}Attributes {
  declare id: string;
  // Declare attributes here
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Define associations
  static associate(models: Record<string, typeof Model>): void {
    // {{ModelName}}.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

{{ModelName}}.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    // Define columns here
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: '{{ModelName}}',
    tableName: '{{table_name}}',
    underscored: true,
    timestamps: true,
  }
);
```

### Migration Template

```javascript
// templates/migration.js.template
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('{{table_name}}', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      // Add columns here
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('{{table_name}}', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('{{table_name}}');
  },
};
```

## Test Scaffolding

### Unit Test Template

```typescript
// templates/unit-test.ts.template
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { {{ClassName}} } from '@/{{path}}/{{ClassName}}';

describe('{{ClassName}}', () => {
  let instance: {{ClassName}};

  beforeEach(() => {
    vi.clearAllMocks();
    instance = new {{ClassName}}();
  });

  describe('{{methodName}}', () => {
    it('should return expected result when given valid input', async () => {
      // Arrange
      const input = {};

      // Act
      const result = await instance.{{methodName}}(input);

      // Assert
      expect(result).toBeDefined();
    });

    it('should throw error when given invalid input', async () => {
      // Arrange
      const invalidInput = {};

      // Act & Assert
      await expect(instance.{{methodName}}(invalidInput)).rejects.toThrow();
    });
  });
});
```

### Component Test Template

```typescript
// templates/component-test.tsx.template
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { {{ComponentName}} } from '@/components/{{ComponentName}}';

describe('{{ComponentName}}', () => {
  it('renders without crashing', () => {
    render(<{{ComponentName}} />);
    expect(screen.getByTestId('{{component-name}}')).toBeInTheDocument();
  });

  it('displays children content', () => {
    render(<{{ComponentName}}>Test Content</{{ComponentName}}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<{{ComponentName}} className="custom-class" />);
    expect(screen.getByTestId('{{component-name}}')).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<{{ComponentName}} onClick={onClick} />);

    fireEvent.click(screen.getByTestId('{{component-name}}'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Template (Playwright)

```typescript
// templates/e2e-test.ts.template
import { test, expect } from '@playwright/test';

test.describe('{{FeatureName}}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/{{route}}');
  });

  test('should display the main content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '{{heading}}' })).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: '{{buttonLabel}}' });

    // Act
    await button.click();

    // Assert
    await expect(page.getByText('{{expectedText}}')).toBeVisible();
  });

  test('should navigate correctly', async ({ page }) => {
    await page.getByRole('link', { name: '{{linkText}}' }).click();
    await expect(page).toHaveURL(/{{expectedUrlPattern}}/);
  });
});
```

## Redux Scaffolding

### Redux Slice Template

```typescript
// templates/redux-slice.ts.template
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import type { {{EntityName}} } from '@/types';

interface {{SliceName}}State {
  items: {{EntityName}}[];
  selectedId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: {{SliceName}}State = {
  items: [],
  selectedId: null,
  status: 'idle',
  error: null,
};

export const fetch{{EntityName}}s = createAsyncThunk(
  '{{sliceName}}/fetch{{EntityName}}s',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/{{apiEndpoint}}');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      return response.json() as Promise<{{EntityName}}[]>;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const {{sliceName}}Slice = createSlice({
  name: '{{sliceName}}',
  initialState,
  reducers: {
    setSelected: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch{{EntityName}}s.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetch{{EntityName}}s.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetch{{EntityName}}s.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setSelected, clearError, reset } = {{sliceName}}Slice.actions;

// Selectors
export const selectAll{{EntityName}}s = (state: RootState) => state.{{sliceName}}.items;
export const selectSelected{{EntityName}} = (state: RootState) => {
  const { items, selectedId } = state.{{sliceName}};
  return items.find(item => item.id === selectedId) ?? null;
};
export const select{{EntityName}}Status = (state: RootState) => state.{{sliceName}}.status;
export const select{{EntityName}}Error = (state: RootState) => state.{{sliceName}}.error;

export default {{sliceName}}Slice.reducer;
```

## Hook Scaffolding

### Custom Hook Template

```typescript
// templates/hook.ts.template
import { useState, useCallback, useEffect } from 'react';

export interface Use{{HookName}}Options {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export interface Use{{HookName}}Return {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
  isModified: boolean;
}

export function use{{HookName}}({
  initialValue = '',
  onChange,
}: Use{{HookName}}Options = {}): Use{{HookName}}Return {
  const [value, setValueInternal] = useState(initialValue);
  const [isModified, setIsModified] = useState(false);

  const setValue = useCallback((newValue: string) => {
    setValueInternal(newValue);
    setIsModified(true);
    onChange?.(newValue);
  }, [onChange]);

  const reset = useCallback(() => {
    setValueInternal(initialValue);
    setIsModified(false);
  }, [initialValue]);

  useEffect(() => {
    setValueInternal(initialValue);
    setIsModified(false);
  }, [initialValue]);

  return {
    value,
    setValue,
    reset,
    isModified,
  };
}
```

## Feature Module Scaffolding

### Feature Module Structure

```
src/features/{{featureName}}/
├── index.ts                    # Public exports
├── components/
│   ├── {{FeatureName}}List.tsx
│   ├── {{FeatureName}}Item.tsx
│   ├── {{FeatureName}}Form.tsx
│   └── index.ts
├── hooks/
│   ├── use{{FeatureName}}.ts
│   ├── use{{FeatureName}}Form.ts
│   └── index.ts
├── services/
│   ├── {{featureName}}Service.ts
│   └── index.ts
├── store/
│   ├── {{featureName}}Slice.ts
│   ├── selectors.ts
│   └── index.ts
├── types/
│   ├── {{featureName}}.types.ts
│   └── index.ts
└── __tests__/
    ├── {{FeatureName}}List.test.tsx
    ├── use{{FeatureName}}.test.ts
    └── {{featureName}}Service.test.ts
```

### Feature Index Export

```typescript
// templates/feature-index.ts.template
// Components
export { {{FeatureName}}List } from './components/{{FeatureName}}List';
export { {{FeatureName}}Item } from './components/{{FeatureName}}Item';
export { {{FeatureName}}Form } from './components/{{FeatureName}}Form';

// Hooks
export { use{{FeatureName}} } from './hooks/use{{FeatureName}}';
export { use{{FeatureName}}Form } from './hooks/use{{FeatureName}}Form';

// Store
export { default as {{featureName}}Reducer } from './store/{{featureName}}Slice';
export * from './store/{{featureName}}Slice';
export * from './store/selectors';

// Types
export type * from './types/{{featureName}}.types';
```

## CLI Generation Script

### generate.ts

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

interface TemplateVars {
  [key: string]: string;
}

function applyTemplate(template: string, vars: TemplateVars): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value),
    template
  );
}

async function generateFile(
  templatePath: string,
  outputPath: string,
  vars: TemplateVars
): Promise<void> {
  const template = await fs.readFile(templatePath, 'utf-8');
  const content = applyTemplate(template, vars);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content);
  console.log(`Generated: ${outputPath}`);
}

program
  .name('generate')
  .description('Generate code from templates')
  .version('1.0.0');

program
  .command('component <name>')
  .description('Generate a React component')
  .option('-p, --path <path>', 'Component path', 'components')
  .option('-s, --with-state', 'Include state management')
  .action(async (name: string, options) => {
    const template = options.withState ? 'component-with-state' : 'component';
    await generateFile(
      `templates/${template}.tsx.template`,
      `src/${options.path}/${name}.tsx`,
      { ComponentName: name }
    );
  });

program
  .command('service <name>')
  .description('Generate a backend service')
  .action(async (name: string) => {
    await generateFile(
      'templates/service.ts.template',
      `src/services/${name}Service.ts`,
      {
        ServiceName: `${name}Service`,
        serviceName: `${name.toLowerCase()}Service`,
        EntityName: name,
        entityName: name.toLowerCase(),
      }
    );
  });

program.parse();
```

## Verification Checklist

### Templates Available
- [ ] Component templates (React, React Native)
- [ ] Service templates
- [ ] Repository templates
- [ ] GraphQL type and resolver templates
- [ ] Model and migration templates
- [ ] Test templates (unit, component, e2e)
- [ ] Redux slice templates
- [ ] Hook templates
- [ ] Feature module structure

### Generation Quality
- [ ] TypeScript strict mode compatible
- [ ] Follows project naming conventions
- [ ] Includes proper imports
- [ ] Includes TypeScript types
- [ ] Includes test file stubs

## Related Skills

- **developer-experience-standard** - Developer tooling setup
- **debugging-standard** - Debugging configuration
- **testing-automation** - Testing patterns
