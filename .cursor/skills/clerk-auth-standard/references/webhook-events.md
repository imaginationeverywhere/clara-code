# Clerk Webhook Events Reference

## User Events

| Event | Description | Key Data |
|-------|-------------|----------|
| `user.created` | New user registered | `id`, `email_addresses`, `first_name`, `last_name`, `public_metadata` |
| `user.updated` | User profile changed | `id`, all changed fields, `public_metadata` |
| `user.deleted` | User account deleted | `id`, `deleted` |

## Session Events

| Event | Description | Key Data |
|-------|-------------|----------|
| `session.created` | User signed in | `user_id`, `id`, `status` |
| `session.ended` | User signed out | `user_id`, `id` |
| `session.removed` | Session forcefully ended | `user_id`, `id` |
| `session.revoked` | Session revoked | `user_id`, `id` |

## Organization Events (Multi-tenant)

| Event | Description | Key Data |
|-------|-------------|----------|
| `organization.created` | New org created | `id`, `name`, `slug` |
| `organization.updated` | Org details changed | `id`, changed fields |
| `organization.deleted` | Org deleted | `id` |
| `organizationMembership.created` | User added to org | `organization`, `public_user_data`, `role` |
| `organizationMembership.updated` | Role changed | `organization`, `public_user_data`, `role` |
| `organizationMembership.deleted` | User removed from org | `organization`, `public_user_data` |

## Webhook Payload Structure

```typescript
interface WebhookPayload {
  data: {
    id: string;
    object: string;
    // Event-specific data
  };
  object: 'event';
  type: string; // e.g., 'user.created'
}
```

## Important Notes

1. **Always verify webhook signatures** using svix library
2. **Handle idempotency** - webhooks may be delivered multiple times
3. **Process quickly** - return 200 within 30 seconds, queue heavy work
4. **Log all events** for debugging and audit trails

## Role Sync Pattern

```typescript
// Always sync role from public_metadata
const role = evt.data.public_metadata?.role || 'USER';
```
