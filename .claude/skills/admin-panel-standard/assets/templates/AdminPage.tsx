'use client';

import { useClerkRBAC, UserRole } from '@/hooks/useClerkRBAC';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

// TODO: Update these values for your page
const PAGE_CONFIG = {
  title: 'Page Title',
  description: 'Brief description of what this page manages.',
  requiredRole: 'STAFF' as UserRole,
  backLink: '/admin',
  backLabel: 'Dashboard',
  primaryActionLabel: 'Add New',
  primaryActionHref: '/admin/page/new',
};

export default function AdminPageTemplate() {
  const { hasRole, getUserAccessLevel, isLoaded } = useClerkRBAC();
  const accessLevel = getUserAccessLevel();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  // Access check
  if (!hasRole(PAGE_CONFIG.requiredRole)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You need {PAGE_CONFIG.requiredRole} access or higher to view this page.
        </p>
        <Link
          href={PAGE_CONFIG.backLink}
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to {PAGE_CONFIG.backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={PAGE_CONFIG.backLink}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {PAGE_CONFIG.backLabel}
      </Link>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{PAGE_CONFIG.title}</h1>
          <p className="text-gray-500 mt-1">{PAGE_CONFIG.description}</p>
        </div>
        {/* Primary action - conditionally show based on access */}
        {hasRole('ADMIN') && (
          <Link
            href={PAGE_CONFIG.primaryActionHref}
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {PAGE_CONFIG.primaryActionLabel}
          </Link>
        )}
      </div>

      {/* Filters / Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
          <div>Column 1</div>
          <div>Column 2</div>
          <div>Column 3</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body - Example rows */}
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="grid grid-cols-4 gap-4 px-6 py-4 border-b last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Item {item}</div>
            <div className="text-gray-600">Value</div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="text-right space-x-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Edit
              </button>
              {hasRole('ADMIN') && (
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {/* Uncomment when no data
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 mb-4">No items found</p>
          <Link
            href={PAGE_CONFIG.primaryActionHref}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first item
          </Link>
        </div>
        */}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing 1-5 of 25 results</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
