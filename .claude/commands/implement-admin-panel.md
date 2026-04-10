# Implement Admin Panel

**COMMAND AUTHORITY**: This command implements production-ready admin panels using the `admin-panel-standard` skill with RBAC, dashboard components, and navigation patterns.

## Command Purpose

Implement a complete admin panel with:
- **Role-based navigation** - RBAC-filtered sidebar and routes
- **Dashboard components** - StatCards, QuickActions, ActivityFeeds
- **Admin pages** - User management, settings, data tables
- **Protected routes** - Clerk authentication middleware

## Prerequisites

Before running this command, ensure:
1. ✅ Clerk authentication is configured
2. ✅ ShadCN UI components are installed
3. ✅ Tailwind CSS is configured
4. ✅ `frontend/` workspace exists

## Usage

```bash
# Interactive mode - guided implementation
/implement-admin-panel

# Specific implementation
/implement-admin-panel --pages="dashboard,users,settings"

# Full admin panel
/implement-admin-panel --complete

# Add specific component
/implement-admin-panel --component="StatCard"
```

## Command Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--pages` | Comma-separated list of pages to implement | `dashboard` |
| `--complete` | Implement full admin panel with all pages | `false` |
| `--component` | Implement specific component only | - |
| `--sidebar` | Include/exclude sidebar | `true` |
| `--roles` | Roles to configure | All standard roles |

## Execution Steps

### Step 1: Verify Prerequisites

```bash
# Check for required dependencies
frontend/
├── src/
│   ├── components/
│   │   └── ui/          # ShadCN components must exist
│   ├── hooks/
│   │   └── useClerkRBAC.ts  # Will create if missing
│   └── app/
│       └── admin/       # Will create admin routes
├── tailwind.config.ts   # Must exist
└── package.json         # Must have required deps
```

### Step 2: Load Admin Panel Standard Skill

The `admin-panel-standard` skill provides:

**RBAC Hook**:
```typescript
const roleHierarchy = ['CUSTOMER', 'USER', 'CUSTOMER_SERVICE', 'STAFF', 'ADMIN', 'SITE_ADMIN', 'SITE_OWNER'];
type AccessLevel = 'FULL' | 'ADMIN' | 'STAFF' | 'LIMITED' | 'NONE';
```

**Core Components**:
- `AdminLayout.tsx` - Collapsible sidebar with RBAC navigation
- `StatCard.tsx` - Dashboard statistics display
- `QuickActionCard.tsx` - Quick action buttons
- `ActivityItem.tsx` - Activity feed items

### Step 3: Implement RBAC Hook

Create `src/hooks/useClerkRBAC.ts` if not exists:

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

const roleHierarchy = [
  'CUSTOMER',
  'USER',
  'CUSTOMER_SERVICE',
  'STAFF',
  'ADMIN',
  'SITE_ADMIN',
  'SITE_OWNER'
] as const;

type SystemRole = typeof roleHierarchy[number];
type AccessLevel = 'FULL' | 'ADMIN' | 'STAFF' | 'LIMITED' | 'NONE';

export function useClerkRBAC() {
  const { user, isLoaded } = useUser();

  const role = useMemo(() => {
    if (!isLoaded || !user) return 'CUSTOMER';
    return (user.publicMetadata?.role as SystemRole) || 'CUSTOMER';
  }, [user, isLoaded]);

  const roleIndex = roleHierarchy.indexOf(role);

  const hasMinRole = (minRole: SystemRole): boolean => {
    const minIndex = roleHierarchy.indexOf(minRole);
    return roleIndex >= minIndex;
  };

  const getAccessLevel = (): AccessLevel => {
    if (hasMinRole('SITE_OWNER')) return 'FULL';
    if (hasMinRole('ADMIN')) return 'ADMIN';
    if (hasMinRole('STAFF')) return 'STAFF';
    if (hasMinRole('USER')) return 'LIMITED';
    return 'NONE';
  };

  const canAccessAdmin = hasMinRole('STAFF');
  const canManageUsers = hasMinRole('ADMIN');
  const canManageSettings = hasMinRole('SITE_ADMIN');
  const canAccessFinance = hasMinRole('ADMIN');

  return {
    role,
    hasMinRole,
    getAccessLevel,
    canAccessAdmin,
    canManageUsers,
    canManageSettings,
    canAccessFinance,
    isLoaded,
  };
}
```

### Step 4: Create Admin Layout

Create `src/app/admin/layout.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerkRBAC } from '@/hooks/useClerkRBAC';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Package,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, minRole: 'STAFF' },
  { href: '/admin/users', label: 'Users', icon: Users, minRole: 'ADMIN' },
  { href: '/admin/customers', label: 'Customers', icon: Users, minRole: 'STAFF' },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, minRole: 'STAFF' },
  { href: '/admin/products', label: 'Products', icon: Package, minRole: 'STAFF' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, minRole: 'ADMIN' },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, minRole: 'ADMIN' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, minRole: 'SITE_ADMIN' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { hasMinRole, role, canAccessAdmin } = useClerkRBAC();

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(item => hasMinRole(item.minRole as any));

  if (!canAccessAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white border-r transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!collapsed && <span className="text-xl font-bold">Admin</span>}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn('transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile menu */}
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">{role}</span>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
```

### Step 5: Create Dashboard Page

Create `src/app/admin/page.tsx`:

```typescript
import { StatCard } from '@/components/admin/StatCard';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="2,847"
          change="+12.5%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Total Orders"
          value="1,234"
          change="+8.2%"
          trend="up"
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value="$48,234"
          change="+15.3%"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Growth"
          value="23%"
          change="+4.1%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard
              title="Add User"
              description="Create a new user account"
              href="/admin/users/new"
              icon={Users}
            />
            <QuickActionCard
              title="New Order"
              description="Create a manual order"
              href="/admin/orders/new"
              icon={ShoppingCart}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Create Dashboard Components

The command will create these components in `src/components/admin/`:
- `StatCard.tsx` - Statistics display card
- `QuickActionCard.tsx` - Quick action navigation
- `ActivityItem.tsx` - Activity feed items
- `ActivityFeed.tsx` - Activity feed container

### Step 7: Create Additional Admin Pages (Based on --pages parameter)

Available pages:
- `users` - User management with roles
- `customers` - Customer management
- `orders` - Order management
- `products` - Product management
- `analytics` - Analytics dashboard
- `payments` - Payment history
- `settings` - Site settings

## Admin Pages Catalog

The `admin-panel-standard` skill includes patterns for 73+ admin pages:

**User Management**: User list, user detail, role assignment, invite users, activity logs
**Customer Management**: Customer list, customer detail, order history, communication history
**Order Management**: Order list, order detail, fulfillment, refunds
**Product Management**: Product list, product detail, inventory, categories
**Finance**: Revenue dashboard, payment history, refunds, invoices
**Analytics**: Traffic, conversion, customer analytics, reports
**Settings**: General, appearance, notifications, integrations, API keys

## Output Structure

After running this command:

```
frontend/src/
├── app/
│   └── admin/
│       ├── layout.tsx           # Admin layout with sidebar
│       ├── page.tsx             # Dashboard
│       ├── users/
│       │   └── page.tsx         # User management
│       ├── customers/
│       │   └── page.tsx         # Customer management
│       ├── settings/
│       │   └── page.tsx         # Settings page
│       └── ...
├── components/
│   └── admin/
│       ├── StatCard.tsx
│       ├── QuickActionCard.tsx
│       ├── ActivityItem.tsx
│       └── ActivityFeed.tsx
└── hooks/
    └── useClerkRBAC.ts          # RBAC hook
```

## Success Criteria

- ✅ Admin layout renders with collapsible sidebar
- ✅ Navigation items filtered by user role
- ✅ Dashboard displays stats and quick actions
- ✅ All components are properly typed
- ✅ Mobile responsive design works
- ✅ RBAC restricts access appropriately

## Related Commands

- `/implement-clerk-standard` - Setup Clerk authentication first
- `/convert-design` - Convert admin mockups to components
- `/frontend-dev` - General frontend development

## Skill Reference

This command uses the `admin-panel-standard` skill located at:
`.claude/skills/admin-panel-standard/SKILL.md`

Templates available at:
`.claude/skills/admin-panel-standard/assets/templates/`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
