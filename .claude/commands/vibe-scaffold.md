# Vibe Scaffold - Quick Code Scaffolding

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** development

## Purpose

Quickly scaffold common code patterns from simple descriptions. Faster than full `/vibe-build` for standard patterns.

## Usage

```bash
/vibe-scaffold "User model with name, email, and role"

/vibe-scaffold "CRUD API for blog posts"

/vibe-scaffold "Form component for contact info"

/vibe-scaffold "Redux slice for shopping cart"
```

## What Gets Scaffolded

| Pattern | What's Created |
|---------|----------------|
| **Model** | Sequelize model, migration, types |
| **CRUD API** | GraphQL types, queries, mutations, resolvers |
| **Component** | React component with props, styling |
| **Form** | Form component with validation |
| **Page** | Next.js page with layout |
| **Hook** | Custom React hook |
| **Slice** | Redux slice with actions, reducers |
| **Service** | Backend service class |

## Quick Patterns

### Database Models

```bash
/vibe-scaffold "Product model with name, price, description, and categoryId"
```

Creates:
- `backend/src/models/Product.model.ts`
- `backend/migrations/YYYYMMDD-create-product.js`
- GraphQL type definition

### API Endpoints

```bash
/vibe-scaffold "CRUD for categories"
```

Creates:
- GraphQL types (Category, CategoryInput)
- Queries (categories, category)
- Mutations (createCategory, updateCategory, deleteCategory)
- Resolver implementations

### React Components

```bash
/vibe-scaffold "ProductCard component with image, title, price, and add to cart button"
```

Creates:
- `frontend/src/components/products/ProductCard.tsx`
- TypeScript interface for props
- Tailwind styling
- Event handlers

### Forms

```bash
/vibe-scaffold "Contact form with name, email, subject, and message"
```

Creates:
- Form component with react-hook-form
- Zod validation schema
- Styled inputs with shadcn/ui
- Submit handling
- Error display

### Pages

```bash
/vibe-scaffold "Product detail page"
```

Creates:
- `frontend/src/app/(store)/products/[id]/page.tsx`
- GraphQL query
- Loading state
- Error handling

### Redux Slices

```bash
/vibe-scaffold "Cart slice with items, addItem, removeItem, updateQuantity"
```

Creates:
- `frontend/src/lib/store/slices/cartSlice.ts`
- Initial state
- Reducers
- Selectors
- Redux Persist configuration

### Custom Hooks

```bash
/vibe-scaffold "useDebounce hook"
```

Creates:
- `frontend/src/hooks/useDebounce.ts`
- TypeScript types
- JSDoc documentation

### Services

```bash
/vibe-scaffold "EmailService for sending notifications"
```

Creates:
- `backend/src/services/EmailService.ts`
- Interface definition
- Method stubs
- Error handling

## Shorthand Patterns

```bash
# Even shorter syntax
/vibe-scaffold model:Review
/vibe-scaffold crud:Tags
/vibe-scaffold form:Shipping
/vibe-scaffold page:Checkout
/vibe-scaffold hook:LocalStorage
/vibe-scaffold slice:Filters
```

## Examples

### Full-Stack Pattern

```bash
/vibe-scaffold "Review system for products"
```

Creates everything:
- Review model + migration
- GraphQL types + resolvers
- ReviewForm component
- ReviewList component
- useProductReviews hook

### Quick Component

```bash
/vibe-scaffold "Avatar component that shows initials if no image"
```

Creates:
```typescript
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('');

  if (src) {
    return <img src={src} alt={name} className={sizeClasses[size]} />;
  }

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 flex items-center justify-center rounded-full`}>
      <span className="text-gray-600 font-medium">{initials}</span>
    </div>
  );
}
```

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview without creating |
| `--overwrite` | Replace existing files |
| `--no-tests` | Skip test file generation |
| `--minimal` | Bare minimum implementation |

## Comparison

| Command | Use When |
|---------|----------|
| `/vibe-scaffold` | Standard patterns, quick setup |
| `/vibe-build` | Custom features, complex logic |
| `/vibe` | General tasks, unclear scope |

## Related Commands

- `/vibe` - General vibe coding
- `/vibe-build` - Full feature building
- `/generate-docs` - Generate documentation
