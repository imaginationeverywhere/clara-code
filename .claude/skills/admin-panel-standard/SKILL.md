---
name: admin-panel-standard
description: Implement production-grade admin panels with RBAC-filtered navigation, collapsible sidebars, dashboard widgets, and role-based content visibility. Use when creating admin dashboards, implementing role-based navigation, building dashboard components (StatCards, QuickActions, Activity feeds), or adding new admin pages to an existing admin panel. Triggers on requests for admin panel, dashboard, back-office, site management, or any admin-related UI implementation.
---

# Admin Panel Standard

## Overview

This skill provides production-tested patterns for implementing enterprise admin panels with:
- **RBAC-filtered navigation** - Menu items filtered by user role
- **Collapsible sidebar** - Responsive with local storage persistence
- **Dashboard widgets** - StatCards, QuickActionCards, ActivityItems
- **Access level guards** - Automatic content visibility by role

## Role Hierarchy

```typescript
const roleHierarchy = ['CUSTOMER', 'USER', 'CUSTOMER_SERVICE', 'STAFF', 'ADMIN', 'SITE_ADMIN', 'SITE_OWNER'];
type AccessLevel = 'FULL' | 'ADMIN' | 'STAFF' | 'LIMITED' | 'NONE';
```

**Role → Access Level Mapping:**
- `SITE_OWNER`, `SITE_ADMIN` → `FULL`
- `ADMIN` → `ADMIN`
- `STAFF`, `CUSTOMER_SERVICE` → `STAFF`
- `USER`, `CUSTOMER` → `LIMITED`

## Implementation Workflow

### 1. Setup RBAC Hook

Create `src/hooks/useClerkRBAC.ts`:

```typescript
'use client';

import { useUser } from '@clerk/nextjs';

export type UserRole = 'SITE_OWNER' | 'SITE_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER_SERVICE' | 'USER' | 'CUSTOMER';
export type AccessLevel = 'FULL' | 'ADMIN' | 'STAFF' | 'LIMITED' | 'NONE';

const roleHierarchy: UserRole[] = ['CUSTOMER', 'USER', 'CUSTOMER_SERVICE', 'STAFF', 'ADMIN', 'SITE_ADMIN', 'SITE_OWNER'];

function normalizeToSystemRole(role: string | undefined): UserRole {
  if (!role) return 'CUSTOMER';
  const upperRole = role.toUpperCase().replace(/-/g, '_');
  if (roleHierarchy.includes(upperRole as UserRole)) return upperRole as UserRole;
  return 'CUSTOMER';
}

export function useClerkRBAC() {
  const { user, isLoaded } = useUser();

  const userRole = normalizeToSystemRole(user?.publicMetadata?.role as string | undefined);
  const userCustomRoles = (user?.publicMetadata?.customRoles as string[]) || [];

  const getRoleLevel = (role: UserRole): number => roleHierarchy.indexOf(role);

  const hasRole = (requiredRole: UserRole): boolean => {
    return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const getUserAccessLevel = (): AccessLevel => {
    if (hasRole('SITE_ADMIN')) return 'FULL';
    if (hasRole('ADMIN')) return 'ADMIN';
    if (hasRole('STAFF')) return 'STAFF';
    if (hasRole('USER')) return 'LIMITED';
    return 'NONE';
  };

  return {
    user,
    isLoaded,
    userRole,
    userCustomRoles,
    hasRole,
    hasAnyRole,
    hasAdminAccess: hasRole('ADMIN'),
    hasFinancialAccess: hasRole('SITE_ADMIN'),
    getUserAccessLevel,
  };
}
```

### 2. Create Admin Layout

Create `src/app/admin/layout.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerkRBAC, UserRole } from '@/hooks/useClerkRBAC';
import {
  ChevronLeft, ChevronRight,
  LayoutDashboard, Users, ShoppingCart, Settings,
  // Add more icons as needed
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: UserRole;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  requiredRole?: UserRole;
}

const menuSections: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users, requiredRole: 'ADMIN' },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, requiredRole: 'STAFF' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Site Settings', href: '/admin/settings', icon: Settings, requiredRole: 'SITE_ADMIN' },
    ],
    requiredRole: 'ADMIN',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded, hasAdminAccess, hasRole, userRole } = useClerkRBAC();

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!hasAdminAccess) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const filterMenuSections = (sections: MenuSection[]): MenuSection[] => {
    return sections
      .filter(section => !section.requiredRole || hasRole(section.requiredRole))
      .map(section => ({
        ...section,
        items: section.items.filter(item => !item.requiredRole || hasRole(item.requiredRole)),
      }))
      .filter(section => section.items.length > 0);
  };

  const filteredSections = filterMenuSections(menuSections);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && <span className="font-semibold">Admin Panel</span>}
          <button onClick={toggleCollapsed} className="p-1 hover:bg-gray-100 rounded">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="mb-4">
              {!collapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
```

### 3. Create Dashboard Components

#### StatCard Component

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  growth?: number;
  period?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  valuePrefix?: string;
  href?: string;
}

const StatCard = ({ title, value, growth, period, icon: Icon, iconColor = 'bg-blue-100 text-blue-600', valuePrefix = '', href }: StatCardProps) => {
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        {growth !== undefined && (
          <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{valuePrefix}{value}</p>
      {period && <p className="text-xs text-gray-400 mt-1">{period}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
};
```

#### QuickActionCard Component

```typescript
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  href: string;
  count?: number;
}

const QuickActionCard = ({ title, description, icon: Icon, iconColor = 'bg-purple-100 text-purple-600', href, count }: QuickActionCardProps) => (
  <Link href={href} className="block bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-all hover:border-blue-200">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-lg ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {count !== undefined && (
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </Link>
);
```

#### ActivityItem Component

```typescript
interface ActivityItemProps {
  type: string;
  message: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

const ActivityItem = ({ type, message, time, icon: Icon, iconColor = 'bg-gray-100 text-gray-600' }: ActivityItemProps) => (
  <div className="flex items-start gap-3 py-3 border-b last:border-0">
    <div className={`p-2 rounded-lg ${iconColor}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);
```

### 4. Dashboard Page Structure

```typescript
'use client';

import { useClerkRBAC } from '@/hooks/useClerkRBAC';
import { DollarSign, Users, ShoppingCart, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { getUserAccessLevel, hasFinancialAccess } = useClerkRBAC();
  const accessLevel = getUserAccessLevel();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid - Always visible, content varies by access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value="1,234" growth={12} icon={ShoppingCart} iconColor="bg-blue-100 text-blue-600" />
        <StatCard title="Active Users" value="567" growth={8} icon={Users} iconColor="bg-green-100 text-green-600" />

        {/* Financial cards - only for FULL access */}
        {hasFinancialAccess && (
          <>
            <StatCard title="Revenue" value="$45,678" growth={15} valuePrefix="$" icon={DollarSign} iconColor="bg-yellow-100 text-yellow-600" />
            <StatCard title="Growth" value="23%" icon={TrendingUp} iconColor="bg-purple-100 text-purple-600" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Pending Orders"
            description="Review and process new orders"
            icon={Clock}
            href="/admin/orders?status=pending"
            count={12}
          />
          {accessLevel === 'FULL' && (
            <QuickActionCard
              title="Low Stock Alerts"
              description="Products needing attention"
              icon={AlertTriangle}
              iconColor="bg-red-100 text-red-600"
              href="/admin/inventory/alerts"
              count={5}
            />
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="divide-y">
          <ActivityItem type="order" message="New order #1234 received" time="5 minutes ago" icon={ShoppingCart} iconColor="bg-blue-100 text-blue-600" />
          <ActivityItem type="user" message="New user registration" time="12 minutes ago" icon={Users} iconColor="bg-green-100 text-green-600" />
        </div>
      </div>
    </div>
  );
}
```

## Adding New Admin Pages

### Pattern: Standard Admin Page

```typescript
'use client';

import { useClerkRBAC } from '@/hooks/useClerkRBAC';

export default function AdminPageName() {
  const { hasRole, getUserAccessLevel } = useClerkRBAC();

  // Optional: Add role check for page-level access
  if (!hasRole('STAFF')) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Title</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Primary Action
        </button>
      </div>

      {/* Page content */}
    </div>
  );
}
```

### Pattern: Adding Menu Item

Add to `menuSections` in layout:

```typescript
{
  title: 'New Section',
  items: [
    { label: 'New Page', href: '/admin/new-page', icon: NewIcon, requiredRole: 'STAFF' },
  ],
  requiredRole: 'STAFF', // Optional: hide entire section
},
```

## Resources

### references/
- `admin-pages-catalog.md` - Complete list of 73+ admin pages with categorization
- `rbac-patterns.md` - Advanced RBAC patterns and permission matrices

### assets/
- `templates/AdminLayout.tsx` - Copy-ready admin layout template
- `templates/AdminPage.tsx` - Copy-ready page template
- `components/StatCard.tsx` - Dashboard stat card component
- `components/QuickActionCard.tsx` - Quick action card component
- `components/ActivityItem.tsx` - Activity feed item component
