---
name: user-management-standard
description: Implement admin user/customer management interfaces with CRUD operations, role assignment, bulk operations, filtering, pagination, and export functionality. Use when building user listing pages, customer management dashboards, role assignment interfaces, or any admin data management views. Triggers on requests for user management, customer management, admin data tables, bulk operations, or user role assignment.
---

# User Management Standard

## Overview

Production-tested patterns for admin user/customer management with:
- **Data tables** with sorting, filtering, pagination
- **Role assignment** with Clerk integration
- **Bulk operations** for multi-select actions
- **Export functionality** with format options
- **Search and filters** with saved presets

## Page Structure Pattern

### Modular Architecture

```
src/app/admin/users/
├── page.tsx                    # Main page (orchestrator)
├── components/
│   ├── UserFilters.tsx        # Filter controls
│   ├── UserTable.tsx          # Data table with selection
│   ├── UserDashboardStats.tsx # Quick stats cards
│   ├── BulkOperations.tsx     # Multi-select action bar
│   └── ExportModal.tsx        # Export configuration
├── types/
│   └── UserPageTypes.ts       # Type definitions
└── utils/
    └── UserUtils.ts           # Filter/sort utilities
```

## Implementation

### 1. Main Page Component

```typescript
'use client';

import { useState, useMemo, useCallback } from 'react';
import { AdminRouteGuard } from '@/components/auth/AdminRouteGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Download } from 'lucide-react';
import Link from 'next/link';

// Components
import { UserFilters } from './components/UserFilters';
import { UserTable } from './components/UserTable';
import { UserDashboardStats } from './components/UserDashboardStats';
import { BulkOperations } from './components/BulkOperations';
import { ExportModal } from './components/ExportModal';

// Types and hooks
import { UserFilters as FilterType, TableState, DEFAULT_FILTERS, DEFAULT_TABLE_STATE } from './types/UserPageTypes';
import { useUsersQuery } from '@/hooks/useUsersQuery';

export default function UsersPage() {
  // State
  const [filters, setFilters] = useState<FilterType>(DEFAULT_FILTERS);
  const [tableState, setTableState] = useState<TableState>(DEFAULT_TABLE_STATE);
  const [showExportModal, setShowExportModal] = useState(false);

  // Data fetching
  const { users, loading, totalCount, refetch } = useUsersQuery({ filters });

  // Processed data
  const processedUsers = useMemo(() => {
    // Apply local sorting/filtering
    return users;
  }, [users, tableState.sortBy, tableState.sortOrder]);

  // Pagination
  const paginatedUsers = processedUsers.slice(
    (tableState.currentPage - 1) * tableState.pageSize,
    tableState.currentPage * tableState.pageSize
  );

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users and permissions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/admin/users/invite">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <UserDashboardStats />

        {/* Filters */}
        <UserFilters filters={filters} onFiltersChange={setFilters} />

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <UserTable
              users={paginatedUsers}
              loading={loading}
              selectedUsers={tableState.selectedUsers}
              onSelectionChange={(ids) => setTableState(s => ({ ...s, selectedUsers: ids }))}
              onSortChange={(field, order) => setTableState(s => ({ ...s, sortBy: field, sortOrder: order }))}
              onPageChange={(page) => setTableState(s => ({ ...s, currentPage: page }))}
              currentPage={tableState.currentPage}
              pageSize={tableState.pageSize}
              totalCount={totalCount}
            />
          </CardContent>
        </Card>

        {/* Bulk Operations */}
        {tableState.selectedUsers.length > 0 && (
          <BulkOperations
            selectedCount={tableState.selectedUsers.length}
            onDeselect={() => setTableState(s => ({ ...s, selectedUsers: [] }))}
            onRefresh={refetch}
          />
        )}

        {/* Export Modal */}
        <ExportModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          totalCount={totalCount}
        />
      </div>
    </AdminRouteGuard>
  );
}
```

### 2. Data Table Component

```typescript
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  selectedUsers: string[];
  onSelectionChange: (ids: string[]) => void;
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export function UserTable({
  users,
  loading,
  selectedUsers,
  onSelectionChange,
  onSortChange,
  sortBy,
  sortOrder,
  onPageChange,
  currentPage,
  pageSize,
  totalCount,
}: UserTableProps) {
  const allSelected = users.length > 0 && users.every(u => selectedUsers.includes(u.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(u => u.id));
    }
  };

  const toggleUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      onSelectionChange(selectedUsers.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedUsers, id]);
    }
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      className="flex items-center gap-1 font-medium"
      onClick={() => onSortChange(field, sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc')}
    >
      {label}
      {sortBy === field && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
    </button>
  );

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SITE_OWNER: 'bg-red-100 text-red-800',
      SITE_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      STAFF: 'bg-green-100 text-green-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 w-12">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </th>
            <th className="p-4 text-left"><SortHeader field="name" label="Name" /></th>
            <th className="p-4 text-left"><SortHeader field="email" label="Email" /></th>
            <th className="p-4 text-left"><SortHeader field="role" label="Role" /></th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left"><SortHeader field="createdAt" label="Joined" /></th>
            <th className="p-4 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => toggleUser(user.id)}
                />
              </td>
              <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
              <td className="p-4 text-gray-600">{user.email}</td>
              <td className="p-4">
                <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
              </td>
              <td className="p-4">
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </td>
              <td className="p-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Role</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <p className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage * pageSize >= totalCount}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Role Assignment Component

```typescript
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SYSTEM_ROLES = [
  { value: 'SITE_OWNER', label: 'Site Owner', access: 'Full Access', color: 'bg-red-100 text-red-800' },
  { value: 'SITE_ADMIN', label: 'Site Admin', access: 'Full Access', color: 'bg-purple-100 text-purple-800' },
  { value: 'ADMIN', label: 'Admin', access: 'Admin Access', color: 'bg-blue-100 text-blue-800' },
  { value: 'STAFF', label: 'Staff', access: 'Staff Access', color: 'bg-green-100 text-green-800' },
  { value: 'CUSTOMER_SERVICE', label: 'Customer Service', access: 'Service Access', color: 'bg-orange-100 text-orange-800' },
  { value: 'USER', label: 'User', access: 'No Admin Access', color: 'bg-gray-100 text-gray-800' },
];

interface RoleAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  user: { id: string; email: string; role: string };
  onRoleChange: (userId: string, role: string) => Promise<void>;
}

export function RoleAssignmentDialog({
  open,
  onClose,
  user,
  onRoleChange,
}: RoleAssignmentDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onRoleChange(user.id, selectedRole);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role to {user.email}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {SYSTEM_ROLES.map(role => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                selectedRole === role.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{role.label}</span>
                <Badge className={role.color}>{role.access}</Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Bulk Operations Component

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { X, Trash2, UserCheck, Mail, Download } from 'lucide-react';

interface BulkOperationsProps {
  selectedCount: number;
  onDeselect: () => void;
  onRefresh: () => void;
}

export function BulkOperations({ selectedCount, onDeselect, onRefresh }: BulkOperationsProps) {
  const handleBulkAction = async (action: string) => {
    // Implement bulk action logic
    console.log(`Executing ${action} on ${selectedCount} users`);
    onRefresh();
    onDeselect();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border p-4 flex items-center gap-4 z-50">
      <span className="text-sm font-medium">{selectedCount} selected</span>

      <div className="h-6 w-px bg-gray-200" />

      <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
        <UserCheck className="h-4 w-4 mr-2" />
        Activate
      </Button>

      <Button variant="outline" size="sm" onClick={() => handleBulkAction('email')}>
        <Mail className="h-4 w-4 mr-2" />
        Send Email
      </Button>

      <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      <div className="h-6 w-px bg-gray-200" />

      <Button variant="ghost" size="sm" onClick={onDeselect}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

## GraphQL Mutations

### Update User Role

```typescript
const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
      updatedAt
    }
  }
`;
```

### Bulk Operations

```typescript
const BULK_UPDATE_USERS = gql`
  mutation BulkUpdateUsers($userIds: [ID!]!, $action: String!, $data: JSON) {
    bulkUpdateUsers(userIds: $userIds, action: $action, data: $data) {
      success
      updatedCount
      errors
    }
  }
`;
```

## Resources

### references/
- `role-hierarchy.md` - Complete role hierarchy documentation
- `bulk-operations.md` - Supported bulk operations reference

### assets/
- `templates/UsersPage.tsx` - Full page template
- `templates/UserTable.tsx` - Data table component
- `templates/RoleAssignment.tsx` - Role assignment dialog
