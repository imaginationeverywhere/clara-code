# Admin Pages Catalog

Complete list of standardized admin pages organized by functional domain.

## Overview Section
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Dashboard | `/admin` | ADMIN | Main dashboard with stats, quick actions, activity |

## User Management
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Users List | `/admin/users` | ADMIN | User listing with search, filters |
| User Details | `/admin/users/[id]` | ADMIN | Single user profile and actions |
| User Roles | `/admin/users/[id]/roles` | SITE_ADMIN | Manage user role assignments |
| Invitations | `/admin/users/invitations` | ADMIN | Pending user invitations |
| Sessions | `/admin/users/sessions` | SITE_ADMIN | Active session management |

## Order Management
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Orders List | `/admin/orders` | STAFF | All orders with status filters |
| Order Details | `/admin/orders/[id]` | STAFF | Single order with line items |
| Order Fulfillment | `/admin/orders/[id]/fulfill` | STAFF | Fulfillment workflow |
| Refunds | `/admin/orders/[id]/refunds` | ADMIN | Process refunds |
| Pending Orders | `/admin/orders?status=pending` | STAFF | Queue of pending orders |

## Product Management
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Products List | `/admin/products` | STAFF | Product catalog management |
| Product Details | `/admin/products/[id]` | STAFF | Single product editing |
| Add Product | `/admin/products/new` | ADMIN | Create new product |
| Categories | `/admin/products/categories` | ADMIN | Product categorization |
| Variants | `/admin/products/[id]/variants` | STAFF | Product variant management |
| Inventory | `/admin/inventory` | STAFF | Stock levels overview |
| Stock Alerts | `/admin/inventory/alerts` | ADMIN | Low stock notifications |

## Customer Management
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Customers List | `/admin/customers` | STAFF | Customer directory |
| Customer Details | `/admin/customers/[id]` | STAFF | Customer profile and history |
| Customer Orders | `/admin/customers/[id]/orders` | STAFF | Customer order history |
| Audiences | `/admin/customers/audiences` | ADMIN | Customer segmentation |
| Loyalty | `/admin/customers/loyalty` | ADMIN | Loyalty program management |

## Financial
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Revenue | `/admin/finance/revenue` | SITE_ADMIN | Revenue analytics |
| Transactions | `/admin/finance/transactions` | SITE_ADMIN | Transaction history |
| Payouts | `/admin/finance/payouts` | SITE_OWNER | Payout management |
| Stripe Dashboard | `/admin/finance/stripe` | SITE_OWNER | Stripe Connect overview |
| Tax Reports | `/admin/finance/tax` | SITE_ADMIN | Tax reporting |
| Invoices | `/admin/finance/invoices` | ADMIN | Invoice management |

## Communications
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Notifications | `/admin/communications/notifications` | ADMIN | Notification management |
| Email Templates | `/admin/communications/email-templates` | ADMIN | SendGrid template editing |
| SMS Campaigns | `/admin/communications/sms` | ADMIN | Twilio SMS campaigns |
| Push Notifications | `/admin/communications/push` | ADMIN | Mobile push notifications |
| Inbox | `/admin/communications/inbox` | STAFF | Customer message inbox |

## Booking/Scheduling
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Appointments | `/admin/appointments` | STAFF | Appointment calendar |
| Appointment Details | `/admin/appointments/[id]` | STAFF | Single appointment |
| Services | `/admin/services` | ADMIN | Service catalog |
| Staff Schedule | `/admin/schedule/staff` | ADMIN | Staff availability |
| Locations | `/admin/locations` | SITE_ADMIN | Location management |

## Content Management
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Pages | `/admin/content/pages` | ADMIN | Static page management |
| Blog Posts | `/admin/content/blog` | ADMIN | Blog post management |
| Media Library | `/admin/content/media` | STAFF | Image/file uploads |
| Banners | `/admin/content/banners` | ADMIN | Promotional banners |
| FAQ | `/admin/content/faq` | ADMIN | FAQ management |

## Marketing
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Coupons | `/admin/marketing/coupons` | ADMIN | Discount code management |
| Promotions | `/admin/marketing/promotions` | ADMIN | Promotional campaigns |
| Gift Cards | `/admin/marketing/gift-cards` | ADMIN | Gift card management |
| Referrals | `/admin/marketing/referrals` | ADMIN | Referral program |
| Analytics | `/admin/marketing/analytics` | ADMIN | Marketing analytics |

## Shipping
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Shipments | `/admin/shipping/shipments` | STAFF | Shipment tracking |
| Shipping Zones | `/admin/shipping/zones` | ADMIN | Zone configuration |
| Carriers | `/admin/shipping/carriers` | ADMIN | Carrier setup (Shippo) |
| Returns | `/admin/shipping/returns` | STAFF | Return processing |
| Labels | `/admin/shipping/labels` | STAFF | Label generation |

## Settings
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| General | `/admin/settings` | SITE_ADMIN | General site settings |
| Branding | `/admin/settings/branding` | SITE_ADMIN | Logo, colors, theme |
| Payments | `/admin/settings/payments` | SITE_OWNER | Payment configuration |
| Shipping Config | `/admin/settings/shipping` | SITE_ADMIN | Shipping settings |
| Notifications | `/admin/settings/notifications` | ADMIN | Notification preferences |
| Integrations | `/admin/settings/integrations` | SITE_OWNER | Third-party integrations |
| API Keys | `/admin/settings/api-keys` | SITE_OWNER | API key management |
| Webhooks | `/admin/settings/webhooks` | SITE_OWNER | Webhook configuration |

## Reports
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Sales Report | `/admin/reports/sales` | ADMIN | Sales analytics |
| Customer Report | `/admin/reports/customers` | ADMIN | Customer analytics |
| Product Report | `/admin/reports/products` | ADMIN | Product performance |
| Traffic Report | `/admin/reports/traffic` | ADMIN | GA4 traffic data |
| Export | `/admin/reports/export` | ADMIN | Data export tools |

## System
| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Audit Log | `/admin/system/audit` | SITE_OWNER | Activity audit trail |
| Health Check | `/admin/system/health` | SITE_ADMIN | System health status |
| Jobs Queue | `/admin/system/jobs` | SITE_ADMIN | Background job monitoring |
| Cache | `/admin/system/cache` | SITE_ADMIN | Cache management |
| Logs | `/admin/system/logs` | SITE_OWNER | Application logs |

## Total: 73 Pages

### By Role Requirement
- **STAFF**: 25 pages
- **ADMIN**: 35 pages
- **SITE_ADMIN**: 10 pages
- **SITE_OWNER**: 8 pages
