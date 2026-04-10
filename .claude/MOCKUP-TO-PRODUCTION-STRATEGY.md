# Mockup-to-Production Implementation Strategy

**PURPOSE**: Complete guide for `/bootstrap-project` command to convert mockup/MOCKUP.md into production-ready Next.js + GraphQL application following frontend/CLAUDE.md and backend/CLAUDE.md standards.

## Overview

This document describes how `/bootstrap-project` transforms a Magic Patterns mockup (React Router + basic components) into a **production-ready Next.js 16 + Express/GraphQL application** with:
- ✅ Next.js 16 App Router (NOT React Router)
- ✅ Server Components (default) + Client Components (when needed)
- ✅ Redux Persist for cart/admin
- ✅ Apollo Client for GraphQL
- ✅ Clerk authentication
- ✅ Complete GraphQL backend with all resolvers
- ✅ PostgreSQL database with all tables
- ✅ **WORKING FEATURES** (not scaffolding!)

---

## Phase 1: Mockup Parsing (mockup/MOCKUP.md)

### Input: Magic Patterns React App
```tsx
// mockup/MOCKUP.md contains:
- App.tsx with <Routes> and React Router
- 30+ component files
- Tailwind config
- Context providers (AuthContext, ContentContext)
```

### Output: Structured Data
```typescript
interface ParsedMockup {
  routes: {
    public: Route[];      // /, /menu, /login, /signup
    protected: Route[];   // /profile, /checkout, /catering-dashboard
    admin: Route[];       // /admin/*, 20+ admin pages
  };
  components: {
    [name: string]: {
      code: string;
      dependencies: string[];
      isClientComponent: boolean;
      hasState: boolean;
      hasEffects: boolean;
      usesAuth: boolean;
      usesGraphQL: boolean;
    };
  };
  designSystem: {
    colors: ColorPalette;
    fonts: FontConfig;
    spacing: SpacingConfig;
  };
  dataModels: {
    [modelName: string]: string[]; // Inferred fields
  };
}
```

---

## Phase 2: Next.js 16 App Router Conversion

### **CRITICAL**: Convert React Router → Next.js App Router

**Following frontend/CLAUDE.md standards:**

### 2.1 Route Structure Conversion

**React Router** (mockup):
```tsx
<Routes>
  <Route path="/" element={<><Navbar /><Hero /><MenuShowcase /></>} />
  <Route path="/menu" element={<><Navbar /><Menu /><Footer /></>} />
  <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></>} />
</Routes>
```

**Next.js App Router** (production):
```
frontend/src/app/
├── (marketing)/          # Public routes group
│   ├── layout.tsx        # Navbar + Footer layout
│   ├── page.tsx          # Homepage: Hero + MenuShowcase + Services
│   └── menu/
│       └── page.tsx      # Menu page
├── (auth)/               # Auth routes group
│   ├── login/
│   │   └── page.tsx      # Login (converted from mockup/Login.tsx)
│   ├── register/
│   │   └── page.tsx      # SignUp → register
│   └── forgot-password/
│       └── page.tsx
├── (dashboard)/          # Protected routes
│   ├── layout.tsx        # Auth guard via middleware
│   ├── profile/
│   │   └── page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── catering/
│   │   └── page.tsx      # CateringDashboard → catering
│   └── driver/
│       └── page.tsx
├── (admin)/              # Admin routes (20+ pages!)
│   ├── layout.tsx        # AdminRouteGuard + admin navigation
│   ├── page.tsx          # AdminDashboard
│   ├── users/
│   │   └── page.tsx      # UserManagement
│   ├── orders/
│   │   └── page.tsx      # OrderManagement
│   ├── meal-prep/
│   │   └── page.tsx
│   ├── catering/
│   │   └── page.tsx
│   ├── calendar/
│   │   └── page.tsx
│   ├── content/
│   │   └── page.tsx
│   ├── delivery/
│   │   └── page.tsx
│   ├── developer/
│   │   └── page.tsx      # TechnicalDocs
│   ├── transactions/
│   │   └── page.tsx
│   ├── stripe-dashboard/
│   │   └── page.tsx
│   ├── menu/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── seo/
│   │   └── page.tsx
│   ├── crm/
│   │   └── page.tsx
│   ├── roles/
│   │   └── page.tsx      # RolePermissions
│   ├── invoices/
│   │   └── page.tsx
│   ├── inventory/
│   │   └── page.tsx
│   ├── social-media/
│   │   └── page.tsx
│   ├── documents/
│   │   └── page.tsx
│   └── scope-of-work/
│       └── page.tsx
├── api/                  # API routes
│   └── webhooks/
│       ├── clerk/route.ts
│       └── stripe/route.ts
├── layout.tsx            # Root layout with providers
├── loading.tsx
├── error.tsx
└── not-found.tsx
```

### 2.2 Component Conversion Strategy

**For EACH component from mockup/MOCKUP.md:**

#### Server Component (Default):
```tsx
// mockup/MOCKUP.md: Hero.tsx
import React from 'react'
const Hero = () => {
  return (
    <section className="relative bg-[#2C2C2C] text-white">
      {/* ... static content ... */}
    </section>
  )
}

// ✅ Converted to: frontend/src/components/Hero.tsx
// NO 'use client' needed - it's static!
export default function Hero() {
  return (
    <section className="relative bg-[#2C2C2C] text-white">
      {/* ... same content ... */}
    </section>
  );
}
```

#### Client Component (When Has State):
```tsx
// mockup/MOCKUP.md: MenuShowcase.tsx (has useState)
const MenuShowcase = () => {
  const [activeCategory, setActiveCategory] = useState('caribbean')
  // ...
}

// ✅ Converted to: frontend/src/components/MenuShowcase.tsx
'use client' // REQUIRED because it uses useState

import { useState } from 'react';

export default function MenuShowcase() {
  const [activeCategory, setActiveCategory] = useState('caribbean');
  // ... rest of logic ...
}
```

#### Client Component with GraphQL:
```tsx
// mockup/MOCKUP.md: Menu.tsx (needs data from backend)
const menuItems = [/* hardcoded data */]

// ✅ Converted to: frontend/src/components/Menu.tsx
'use client'

import { useQuery } from '@apollo/client';
import { GET_MENU_ITEMS } from '@/graphql/queries/menu';

export default function Menu() {
  // Replace hardcoded data with GraphQL query
  const { data, loading } = useQuery(GET_MENU_ITEMS);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="grid grid-cols-3 gap-6">
      {data?.menuItems.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

#### Protected Page with Clerk:
```tsx
// mockup/MOCKUP.md: Profile.tsx wrapped in <ProtectedRoute>
<Route path="/profile" element={
  <ProtectedRoute>
    <Navbar /><Profile /><Footer />
  </ProtectedRoute>
} />

// ✅ Converted to: frontend/src/app/(dashboard)/profile/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Server Component - can fetch data directly
  const user = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query GetUser($id: ID!) { user(id: $id) { id name email } }`,
      variables: { id: userId }
    })
  }).then(r => r.json());

  return <ProfileContent user={user.data.user} />;
}
```

#### Admin Page with Role Check:
```tsx
// mockup/MOCKUP.md: AdminDashboard.tsx wrapped in <AdminProtectedRoute>
<Route path="/admin" element={
  <AdminProtectedRoute>
    <AdminDashboard />
  </AdminProtectedRoute>
} />

// ✅ Converted to: frontend/src/app/(admin)/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/login');
  }

  // Check role from Clerk metadata
  const role = user?.publicMetadata?.role as string;
  if (!['ADMIN', 'SITE_OWNER', 'SITE_ADMIN'].includes(role)) {
    redirect('/'); // Forbidden
  }

  // Fetch admin data
  const stats = await fetchAdminStats();

  return <AdminDashboardContent stats={stats} />;
}
```

---

## Phase 3: Backend GraphQL Schema Generation

### **CRITICAL**: Generate schema from mockup data requirements

**Following backend/CLAUDE.md standards:**

### 3.1 Database Models from Mockup

**Analyze mockup components to extract data models:**

```tsx
// From mockup/MOCKUP.md MenuShowcase.tsx:
const menuItems = [
  {
    id: 1,
    name: 'Coconut Chickpea Curry',
    description: 'Chickpeas and sweet potatoes...',
    category: 'caribbean',
    isAlkaline: true,
    image: 'https://...',
    halfPanPrice: 65,
    fullPanPrice: 120,
  },
  // ...
]

// ✅ Generate Sequelize Model:
// backend/src/models/MenuItem.ts
import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export class MenuItem extends Model {
  public id!: string; // UUID
  public name!: string;
  public description!: string;
  public category!: string;
  public isAlkaline!: boolean;
  public image!: string;
  public halfPanPrice!: number;
  public fullPanPrice!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MenuItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('caribbean', 'jamaican', 'haitian', 'soul', 'italian', 'asian'),
    allowNull: false,
  },
  isAlkaline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  halfPanPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fullPanPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'menu_items',
  timestamps: true,
});
```

### 3.2 GraphQL Schema from Models

```typescript
// backend/src/graphql/schema.graphql
type MenuItem {
  id: ID!
  name: String!
  description: String!
  category: MenuCategory!
  isAlkaline: Boolean!
  image: String!
  halfPanPrice: Float!
  fullPanPrice: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum MenuCategory {
  CARIBBEAN
  JAMAICAN
  HAITIAN
  SOUL
  ITALIAN
  ASIAN
}

type Query {
  # For MenuShowcase component
  menuItems(category: MenuCategory): [MenuItem!]!

  # For Menu page
  menuItem(id: ID!): MenuItem

  # For admin menu management
  allMenuItems(limit: Int, offset: Int): MenuItemsConnection!
}

type MenuItemsConnection {
  items: [MenuItem!]!
  totalCount: Int!
  hasMore: Boolean!
}

type Mutation {
  # For admin menu management
  createMenuItem(input: CreateMenuItemInput!): MenuItem!
  updateMenuItem(id: ID!, input: UpdateMenuItemInput!): MenuItem!
  deleteMenuItem(id: ID!): Boolean!
}

input CreateMenuItemInput {
  name: String!
  description: String!
  category: MenuCategory!
  isAlkaline: Boolean
  image: String!
  halfPanPrice: Float!
  fullPanPrice: Float!
}

input UpdateMenuItemInput {
  name: String
  description: String
  category: MenuCategory
  isAlkaline: Boolean
  image: String
  halfPanPrice: Float
  fullPanPrice: Float
}
```

### 3.3 Resolvers with Authentication (backend/CLAUDE.md pattern)

```typescript
// backend/src/graphql/resolvers/menuResolvers.ts
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { MenuItem } from '../../models/MenuItem';

export const menuResolvers = {
  Query: {
    // Public query - no auth required
    menuItems: async (_: any, { category }: { category?: string }) => {
      const where = category ? { category } : {};
      return await MenuItem.findAll({ where, order: [['name', 'ASC']] });
    },

    // Public query
    menuItem: async (_: any, { id }: { id: string }) => {
      return await MenuItem.findByPk(id);
    },

    // Admin-only query
    allMenuItems: async (
      _: any,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      context: any
    ) => {
      // ✅ MANDATORY: context.auth?.userId check
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      // Check admin role
      const user = await User.findByPk(context.auth.userId);
      if (!['ADMIN', 'SITE_OWNER', 'SITE_ADMIN'].includes(user.role)) {
        throw new ForbiddenError('Admin access required');
      }

      const { count, rows } = await MenuItem.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        items: rows,
        totalCount: count,
        hasMore: count > offset + limit,
      };
    },
  },

  Mutation: {
    createMenuItem: async (_: any, { input }: any, context: any) => {
      // ✅ MANDATORY: context.auth?.userId check
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      // Check admin role
      const user = await User.findByPk(context.auth.userId);
      if (!['ADMIN', 'SITE_OWNER'].includes(user.role)) {
        throw new ForbiddenError('Admin access required');
      }

      // Create menu item
      const menuItem = await MenuItem.create(input);
      return menuItem;
    },

    updateMenuItem: async (_: any, { id, input }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const user = await User.findByPk(context.auth.userId);
      if (!['ADMIN', 'SITE_OWNER'].includes(user.role)) {
        throw new ForbiddenError('Admin access required');
      }

      const menuItem = await MenuItem.findByPk(id);
      if (!menuItem) {
        throw new Error('Menu item not found');
      }

      await menuItem.update(input);
      return menuItem;
    },

    deleteMenuItem: async (_: any, { id }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const user = await User.findByPk(context.auth.userId);
      if (!['ADMIN', 'SITE_OWNER'].includes(user.role)) {
        throw new ForbiddenError('Admin access required');
      }

      const menuItem = await MenuItem.findByPk(id);
      if (!menuItem) {
        throw new Error('Menu item not found');
      }

      await menuItem.destroy();
      return true;
    },
  },
};
```

---

## Phase 4: Complete Application Build-Out

### 4.1 Frontend Component Implementation

**For EACH component from mockup/MOCKUP.md, create production version:**

#### Example: MenuShowcase Component

**Original mockup code** (React + useState):
```tsx
// mockup/MOCKUP.md
const MenuShowcase = () => {
  const [activeCategory, setActiveCategory] = useState('caribbean')
  const filteredItems = menuItems.filter(item => item.category === activeCategory)
  // ... render hardcoded menuItems
}
```

**Production version** (Next.js + GraphQL + Redux):
```tsx
// frontend/src/components/MenuShowcase.tsx
'use client'

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MENU_ITEMS } from '@/graphql/queries/menu';
import MenuCard from './MenuCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function MenuShowcase() {
  const [activeCategory, setActiveCategory] = useState('caribbean');

  // ✅ Replace hardcoded data with GraphQL query
  const { data, loading, error } = useQuery(GET_MENU_ITEMS, {
    variables: { category: activeCategory },
    fetchPolicy: 'cache-first', // OK for public menu data
  });

  if (loading) {
    return <MenuShowcaseSkeleton />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load menu items" />;
  }

  const menuCategories = [
    { id: 'caribbean', name: 'Caribbean Fusion' },
    { id: 'jamaican', name: 'Jamaican' },
    { id: 'haitian', name: 'Haitian' },
    { id: 'soul', name: 'Soul Food' },
    { id: 'italian', name: 'Italian' },
    { id: 'asian', name: 'Asian-Inspired' },
  ];

  return (
    <section id="menu" className="py-20 bg-[#FFF8DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-light tracking-supertight text-gray-900 mb-4">
            Cultural Menu Collections
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-light tracking-wide">
            Explore our plant-based interpretations of authentic cultural cuisines
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm md:text-base font-light tracking-wide transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'bg-[#C41E3A] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.menuItems.map((item: any) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/menu">
            <button className="bg-[#D4AF37] text-[#2C2C2C] px-8 py-3 rounded-md font-light tracking-wide hover:bg-yellow-600 transition duration-300">
              View Full Menu
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### 4.2 GraphQL Operations Creation

```typescript
// frontend/src/graphql/queries/menu.ts
import { gql } from '@apollo/client';

export const GET_MENU_ITEMS = gql`
  query GetMenuItems($category: MenuCategory) {
    menuItems(category: $category) {
      id
      name
      description
      category
      isAlkaline
      image
      halfPanPrice
      fullPanPrice
    }
  }
`;

export const GET_MENU_ITEM = gql`
  query GetMenuItem($id: ID!) {
    menuItem(id: $id) {
      id
      name
      description
      category
      isAlkaline
      image
      halfPanPrice
      fullPanPrice
      createdAt
      updatedAt
    }
  }
`;
```

```typescript
// frontend/src/graphql/mutations/menu.ts
import { gql } from '@apollo/client';

export const CREATE_MENU_ITEM = gql`
  mutation CreateMenuItem($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      id
      name
      description
      category
      isAlkaline
      image
      halfPanPrice
      fullPanPrice
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem($id: ID!, $input: UpdateMenuItemInput!) {
    updateMenuItem(id: $id, input: $input) {
      id
      name
      description
      category
      isAlkaline
      image
      halfPanPrice
      fullPanPrice
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem($id: ID!) {
    deleteMenuItem(id: $id)
  }
`;
```

### 4.3 Database Migrations

```typescript
// backend/src/migrations/20251027000001-create-menu-items.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('menu_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('caribbean', 'jamaican', 'haitian', 'soul', 'italian', 'asian'),
        allowNull: false,
      },
      is_alkaline: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      half_pan_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      full_pan_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('menu_items', ['category']);
    await queryInterface.addIndex('menu_items', ['is_alkaline']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('menu_items');
  },
};
```

### 4.4 Database Seeders (Sample Data from Mockup)

```typescript
// backend/src/seeders/20251027000001-menu-items.js
'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Use EXACT data from mockup/MOCKUP.md!
    await queryInterface.bulkInsert('menu_items', [
      {
        id: require('uuid').v4(),
        name: 'Coconut Chickpea Curry',
        description: 'Chickpeas and sweet potatoes in a rich coconut curry sauce',
        category: 'caribbean',
        is_alkaline: true,
        image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/ofkt8LprvjckD2Cjn7UbRB/pasted-image.jpg',
        half_pan_price: 65.00,
        full_pan_price: 120.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: require('uuid').v4(),
        name: 'Griot Fried Mushrooms',
        description: 'Oyster mushrooms marinated in épis seasoning and spiced battered then fried',
        category: 'haitian',
        is_alkaline: false,
        image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7...',
        half_pan_price: 70.00,
        full_pan_price: 130.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // ... ALL menu items from mockup
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('menu_items', null, {});
  },
};
```

---

## Phase 5: Complete Feature Implementation

### 5.1 Repeat for ALL Models from Mockup

**Process EVERY data structure in mockup:**

From mockup/MOCKUP.md CateringRequest form:
```typescript
// Extracted data structure:
cateringRequest = {
  id, clientId, clientName, clientEmail, clientPhone,
  eventDetails: { date, startTime, endTime, guestCount, type, location, ... },
  serviceDetails: { serviceStyle, cuisinePreferences, dietaryRestrictions, ... },
  status, dateSubmitted, quote
}

// ✅ Generate:
- Database model: CateringRequest
- GraphQL schema: CateringRequest type
- Queries: cateringRequests, cateringRequest(id)
- Mutations: createCateringRequest, updateCateringRequest, approveCateringRequest
- Frontend component: Uses real GraphQL instead of console.log()
```

### 5.2 Admin Pages Implementation

**For ALL 20+ admin pages from mockup:**

```tsx
// ✅ Each admin page:
1. Extract mockup component code
2. Convert to Next.js App Router page.tsx
3. Replace mock data with GraphQL queries
4. Add mutations for CRUD operations
5. Implement AdminRouteGuard (frontend/CLAUDE.md requirement)
6. Wire up Redux for admin state (frontend/CLAUDE.md MANDATORY)
7. Add proper TypeScript types
8. Implement loading/error states
```

**Example: UserManagement Admin Page**

```tsx
// frontend/src/app/(admin)/users/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import UserManagementClient from './UserManagementClient';

export default async function UserManagementPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect('/login');

  const role = user?.publicMetadata?.role as string;
  if (!['ADMIN', 'SITE_OWNER', 'SITE_ADMIN'].includes(role)) {
    redirect('/');
  }

  // Server Component - fetch initial data
  const users = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query GetAllUsers { users { id name email role createdAt } }`
    }),
    next: { revalidate: 60 } // Revalidate every 60 seconds
  }).then(r => r.json());

  return <UserManagementClient initialUsers={users.data.users} />;
}
```

```tsx
// frontend/src/app/(admin)/users/UserManagementClient.tsx
'use client'

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_ROLE, DELETE_USER } from '@/graphql/mutations/users';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [deleteUser] = useMutation(DELETE_USER);
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { data } = await updateUserRole({
        variables: { userId, role: newRole },
      });

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  // ... rest of admin UI implementation
}
```

---

## Phase 6: Complete All Features

### 6.1 Implementation Checklist

**For Empress Eats, implement ALL features from mockup:**

✅ **Public Pages** (5 pages):
- Homepage with Hero, MenuShowcase, Services, AboutChef, CallToAction
- Menu page with filtering
- Login page (Clerk)
- Signup page (Clerk)
- Forgot password page

✅ **Protected Pages** (4 pages):
- Profile page with user data
- Checkout page with Stripe
- Catering dashboard
- Driver dashboard

✅ **Admin Pages** (20+ pages):
- Admin dashboard with stats
- User management (CRUD)
- Order management (CRUD)
- Meal prep management
- Catering management
- Calendar management
- Content management
- Delivery management
- Technical docs
- Transactions
- Stripe dashboard
- Menu management
- Settings
- SEO management
- CRM
- Role permissions
- Invoices
- Inventory
- Social media marketing
- Document management
- Scope of work

✅ **All GraphQL Endpoints**:
- Users: queries + mutations
- Menu items: queries + mutations
- Orders: queries + mutations
- Catering requests: queries + mutations
- Calendar events: queries + mutations
- Content: queries + mutations
- Transactions: queries
- ... (35+ total endpoints!)

✅ **All Database Tables**:
- users, menu_items, orders, order_items, catering_requests,
- calendar_events, content_pages, deliveries, transactions,
- inventory_items, invoices, documents, ...

---

## Success Criteria

### After `/bootstrap-project` completes, client gets:

✅ **Working Frontend** (https://develop.empresseats.com):
- All 30+ pages from mockup FULLY FUNCTIONAL
- Design matches mockup exactly
- All interactions working
- Forms submit to real GraphQL backend
- Data loads from real database
- Authentication works (Clerk)
- Payments work (Stripe/Quik Dollars)

✅ **Working Backend** (https://api-dev.empresseats.com):
- GraphQL API with 35+ endpoints
- All queries return real data
- All mutations update database
- Authentication enforced (context.auth?.userId)
- Admin endpoints protected by role
- Webhooks working (Clerk, Stripe)
- Database fully seeded with sample data

✅ **Client Confidence**:
- Can click through entire app
- Can sign up, log in, browse, order
- Can see admin dashboard if admin
- Everything WORKS - not "coming soon"
- **PRODUCTION-READY FROM DAY 1!**

This is what makes Quik Nation UNSTOPPABLE - clients see their mockup as a REAL, WORKING APP within hours! 🚀
