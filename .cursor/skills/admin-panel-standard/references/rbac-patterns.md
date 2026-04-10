# Advanced RBAC Patterns

## Permission Matrix

### Role Capabilities

| Capability | CUSTOMER | USER | CUSTOMER_SERVICE | STAFF | ADMIN | SITE_ADMIN | SITE_OWNER |
|------------|----------|------|------------------|-------|-------|------------|------------|
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View orders | Own | Own | All | All | All | All | All |
| Edit orders | ❌ | ❌ | Status | Full | Full | Full | Full |
| View users | ❌ | ❌ | Basic | Basic | Full | Full | Full |
| Edit users | ❌ | ❌ | ❌ | ❌ | Limited | Full | Full |
| Manage roles | ❌ | ❌ | ❌ | ❌ | ❌ | Limited | Full |
| View finances | ❌ | ❌ | ❌ | ❌ | Summary | Full | Full |
| Manage payments | ❌ | ❌ | ❌ | ❌ | ❌ | Limited | Full |
| Site settings | ❌ | ❌ | ❌ | ❌ | ❌ | View | Full |
| API keys | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Full |

## Custom Roles

In addition to the hierarchy roles, support custom roles for specific permissions:

```typescript
interface CustomRole {
  name: string;
  permissions: string[];
}

const customRoles: CustomRole[] = [
  {
    name: 'INVENTORY_MANAGER',
    permissions: ['inventory:read', 'inventory:write', 'products:read'],
  },
  {
    name: 'MARKETING_MANAGER',
    permissions: ['marketing:*', 'customers:read', 'analytics:read'],
  },
  {
    name: 'CONTENT_EDITOR',
    permissions: ['content:*', 'media:*'],
  },
];
```

## Permission Check Patterns

### 1. Role Hierarchy Check

```typescript
// Check if user has at least this role level
if (!hasRole('STAFF')) {
  return <AccessDenied />;
}
```

### 2. Specific Permission Check

```typescript
// Check for specific permission
const canEditInventory = hasPermission('inventory:write');
```

### 3. Resource-Level Check

```typescript
// Check ownership or elevated role
const canEditOrder = (order: Order) => {
  return order.userId === user.id || hasRole('STAFF');
};
```

### 4. Conditional Rendering

```typescript
// Show content based on access level
{accessLevel === 'FULL' && <FinancialDashboard />}
{accessLevel >= 'ADMIN' && <UserManagement />}
{accessLevel >= 'STAFF' && <OrderManagement />}
```

## UI Protection Patterns

### Route Protection (layout.tsx)

```typescript
// Entire admin section requires ADMIN
if (!hasAdminAccess) {
  redirect('/unauthorized');
}
```

### Page-Level Protection

```typescript
// Specific page requires SITE_ADMIN
export default function FinancePage() {
  const { hasRole } = useClerkRBAC();

  if (!hasRole('SITE_ADMIN')) {
    return <AccessDenied message="Financial access required" />;
  }

  return <FinanceDashboard />;
}
```

### Component-Level Protection

```typescript
// Button only visible to certain roles
{hasRole('ADMIN') && (
  <Button onClick={deleteUser}>Delete User</Button>
)}
```

### Field-Level Protection

```typescript
// Sensitive fields hidden from lower roles
<div>
  <p>Order Total: ${order.total}</p>
  {hasFinancialAccess && (
    <p>Profit Margin: ${order.profitMargin}</p>
  )}
</div>
```

## API Protection Integration

### GraphQL Context Check

```typescript
// Backend resolver protection
const resolvers = {
  Query: {
    users: async (_, __, context) => {
      if (!context.auth?.userId) throw new AuthenticationError();
      if (!hasRoleFromContext(context, 'ADMIN')) throw new ForbiddenError();
      return await User.findAll();
    },
  },
};
```

### REST Middleware

```typescript
// Express middleware for role checking
const requireRole = (role: UserRole) => async (req, res, next) => {
  const userRole = await getUserRoleFromClerk(req.auth.userId);
  if (!hasRoleLevel(userRole, role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.get('/api/admin/users', requireRole('ADMIN'), getUsersHandler);
```

## Role Assignment Flow

### Clerk Metadata Storage

```typescript
// Store role in Clerk publicMetadata
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    role: 'ADMIN',
    customRoles: ['INVENTORY_MANAGER'],
  },
});
```

### Role Upgrade Request

1. User requests role upgrade
2. SITE_ADMIN reviews request
3. SITE_ADMIN approves and updates Clerk metadata
4. User's frontend automatically reflects new permissions

## Multi-Tenant Considerations

In multi-tenant deployments:

```typescript
interface TenantRole {
  tenantId: string;
  role: UserRole;
  customRoles: string[];
}

// User can have different roles per tenant
const getUserRoleForTenant = (userId: string, tenantId: string): UserRole => {
  const tenantRoles = user.publicMetadata.tenantRoles as TenantRole[];
  const tenantRole = tenantRoles?.find(tr => tr.tenantId === tenantId);
  return tenantRole?.role || 'CUSTOMER';
};
```
