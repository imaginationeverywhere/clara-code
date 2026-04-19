# Admin Panel Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --admin`

Covers: Admin dashboard architecture, RBAC enforcement, protected routes, data tables, and admin-only API endpoints.

---

## CRITICAL RULES

### 1. Admin role check on EVERY admin route — double-gated

```typescript
// ✅ Two layers: auth middleware + role check
// Layer 1: requireAuth verifies JWT (Clerk or API key)
// Layer 2: explicit role === "admin" check

router.get("/api/admin/users", requireAuth, async (req: ApiKeyRequest, res) => {
  // Layer 2: role check
  if (req.claraUser?.role !== "admin") {
    res.status(403).json({ error: "admin_required" });
    return;
  }

  const users = await User.findAll({ order: [["createdAt", "DESC"]], limit: 100 });
  res.json({ users });
});

// ✅ Frontend: wrap all admin pages with admin guard
// app/admin/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");
  if (sessionClaims?.metadata?.role !== "admin") redirect("/dashboard");

  return <>{children}</>;
}

// ❌ Only checking auth without checking role
router.get("/api/admin/users", requireAuth, async (req, res) => {
  // Missing role check — any authenticated user can access admin data
});
```

---

### 2. Admin role assignment — via Clerk metadata, never user-editable

```typescript
// ✅ Admin role set via Clerk backend API (server-only operation)
// NEVER expose a route that lets users set their own role

// Clerk webhook handler — set role when user meets criteria
case "user.created": {
  const user = event.data;
  const isAdmin = ADMIN_EMAIL_LIST.includes(user.email_addresses[0]?.email_address);
  if (isAdmin) {
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: { role: "admin" },
    });
  }
  break;
}

// ❌ NEVER allow users to request or self-assign admin
router.post("/api/admin/promote", requireAuth, async (req, res) => {
  // Don't build this endpoint
});
```

---

### 3. Admin API routes prefix — consistent and guarded

```typescript
// ✅ All admin routes under /api/admin/* — makes guarding easy
// Applied ONCE in Express:
router.use("/api/admin", requireAuth, requireAdmin);

// requireAdmin middleware
export function requireAdmin(req: ApiKeyRequest, res: Response, next: NextFunction) {
  if (req.claraUser?.role !== "admin") {
    res.status(403).json({ error: "admin_required" });
    return;
  }
  next();
}

// Then mount admin routes under the guarded router
adminRouter.get("/users", listUsersHandler);
adminRouter.delete("/users/:id", deleteUserHandler);
adminRouter.get("/orders", listOrdersHandler);
adminRouter.get("/metrics", metricsHandler);

// ❌ Admin routes scattered under /api/* without consistent prefix
// ❌ Checking admin role differently in each handler
```

---

### 4. Standard admin pages — required set

```typescript
// Every Heru admin panel MUST include at minimum:

// ✅ /admin — dashboard (key metrics: revenue, users, orders)
// ✅ /admin/users — user list, search, view, suspend/ban
// ✅ /admin/orders — order list, search, refund action
// ✅ /admin/settings — Heru configuration (feature flags, rate limits)

// Optional by Heru type:
// /admin/content — CMS content management
// /admin/products — product/service catalog management
// /admin/disputes — Stripe dispute queue
// /admin/analytics — GA4 embedded or link to GA4 console
```

---

### 5. Data tables — use server-side pagination, never load all records

```typescript
// ✅ Paginated admin data endpoint
router.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const page  = parseInt(String(req.query.page  ?? "1"), 10);
  const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10), 100); // cap at 100
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;

  const whereClause = search
    ? { [Op.or]: [
        { email: { [Op.iLike]: `%${search}%` } },
        { name:  { [Op.iLike]: `%${search}%` } },
      ]}
    : {};

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    attributes: { exclude: ["password"] }, // never return sensitive fields
  });

  res.json({ users: rows, total: count, page, totalPages: Math.ceil(count / limit) });
});

// ❌ Loading all users without pagination
const users = await User.findAll(); // could be millions of rows
```

---

### 6. Audit log — every destructive admin action must be logged

```typescript
// ✅ Log all admin actions to AuditLog table
async function logAdminAction(params: {
  adminUserId: string;
  action: string;          // e.g. "user.suspend", "order.refund", "settings.update"
  targetId?: string;       // ID of the affected resource
  targetType?: string;     // "user" | "order" | "product"
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await AuditLog.create({
    ...params,
    timestamp: new Date(),
  });
}

// ✅ Use in every destructive handler
router.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await User.update({ status: "suspended" }, { where: { id } });

  await logAdminAction({
    adminUserId: req.claraUser!.userId,
    action: "user.suspend",
    targetId: id,
    targetType: "user",
    ipAddress: req.ip,
  });

  res.json({ success: true });
});

// ❌ Destructive actions with no audit trail
```

---

### 7. Admin UI — ShadCN DataTable pattern

```typescript
// ✅ Use ShadCN DataTable with server-side pagination for all admin lists
// src/components/admin/UsersTable.tsx
"use client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./users-columns";

export function UsersTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => fetchAdminUsers({ page, limit: 50 }),
  });

  return (
    <DataTable
      columns={columns}
      data={data?.users ?? []}
      pageCount={data?.totalPages ?? 1}
      page={page}
      onPageChange={setPage}
      loading={isLoading}
    />
  );
}

// ❌ Client-side filtering of a full dataset loaded on mount
```

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/admin.md` documenting:
- Admin role assignment mechanism (Clerk metadata or DB role field)
- List of admin users (email addresses with access)
- Admin pages implemented and their URLs
- Audit log retention policy
- Any admin-specific rate limiting (admin endpoints should still have rate limits)
- Access control: is the admin panel public URL? (Recommend restricting by IP or separate subdomain: `admin.app.claracode.ai`)

If `docs/standards/admin.md` does not exist, create it.
