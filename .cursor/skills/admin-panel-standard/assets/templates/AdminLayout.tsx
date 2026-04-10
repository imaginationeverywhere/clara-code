'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerkRBAC, UserRole } from '@/hooks/useClerkRBAC';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  CreditCard,
  Truck,
  Tag,
  FileText,
  Bell,
  Shield,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: UserRole;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  requiredRole?: UserRole;
}

// TODO: Customize menu sections for your project
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
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, requiredRole: 'STAFF' },
      { label: 'Products', href: '/admin/products', icon: Package, requiredRole: 'STAFF' },
      { label: 'Customers', href: '/admin/customers', icon: Users, requiredRole: 'STAFF' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Appointments', href: '/admin/appointments', icon: Calendar, requiredRole: 'STAFF' },
      { label: 'Shipping', href: '/admin/shipping', icon: Truck, requiredRole: 'STAFF' },
      { label: 'Communications', href: '/admin/communications', icon: MessageSquare, requiredRole: 'ADMIN' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Promotions', href: '/admin/marketing/promotions', icon: Tag, requiredRole: 'ADMIN' },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, requiredRole: 'ADMIN' },
    ],
    requiredRole: 'ADMIN',
  },
  {
    title: 'Finance',
    items: [
      { label: 'Transactions', href: '/admin/finance/transactions', icon: CreditCard, requiredRole: 'SITE_ADMIN' },
      { label: 'Reports', href: '/admin/finance/reports', icon: FileText, requiredRole: 'SITE_ADMIN' },
    ],
    requiredRole: 'SITE_ADMIN',
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users, requiredRole: 'ADMIN' },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell, requiredRole: 'ADMIN' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, requiredRole: 'SITE_ADMIN' },
      { label: 'Security', href: '/admin/security', icon: Shield, requiredRole: 'SITE_OWNER' },
    ],
    requiredRole: 'ADMIN',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded, hasAdminAccess, hasRole, userRole, getUserAccessLevel } = useClerkRBAC();

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
          </p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Filter menu sections based on user role
  const filterMenuSections = (sections: MenuSection[]): MenuSection[] => {
    return sections
      .filter((section) => !section.requiredRole || hasRole(section.requiredRole))
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.requiredRole || hasRole(item.requiredRole)),
      }))
      .filter((section) => section.items.length > 0);
  };

  const filteredSections = filterMenuSections(menuSections);
  const accessLevel = getUserAccessLevel();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-bold text-xl text-gray-900">Admin</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {accessLevel}
              </span>
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              {!collapsed && (
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-colors relative ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        {!collapsed && user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{userRole}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <div className="p-6 min-h-screen">{children}</div>
      </main>
    </div>
  );
}
