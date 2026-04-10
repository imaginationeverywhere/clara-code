# Implement Notifications

Implement production-grade email and SMS notification system following DreamiHairCare's battle-tested patterns with SendGrid, Twilio, and multi-channel orchestration.

## Command Usage

```
/implement-notifications [options]
```

### Options
- `--full` - Complete notification stack (email + SMS) (default)
- `--email-only` - Email notifications only (SendGrid)
- `--sms-only` - SMS notifications only (Twilio)
- `--templates-only` - Database templates without service implementation
- `--audit` - Audit existing implementation against standards

### Feature Options
- `--with-campaigns` - Include marketing campaign support
- `--with-templates` - Include database-backed templates
- `--with-webhooks` - Include webhook handlers for tracking

## Pre-Implementation Checklist

### For Email (SendGrid)
- [ ] SendGrid account created at https://sendgrid.com
- [ ] API key generated with Mail Send permission
- [ ] Sender identity verified
- [ ] IP pools created (transactional + marketing)

### For SMS (Twilio)
- [ ] Twilio account created at https://twilio.com
- [ ] Phone number purchased
- [ ] API credentials (Account SID + Auth Token)
- [ ] Webhook URLs planned

### Environment Variables
```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@example.com
SENDGRID_FROM_NAME=Platform Name
SENDGRID_REPLY_TO_EMAIL=support@example.com
SENDGRID_TRANSACTIONAL_POOL=transactional-pool
SENDGRID_MARKETING_POOL=marketing-pool
SENDGRID_WEBHOOK_VERIFICATION_KEY=xxx...

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=MGxxx...

# AWS SES (Optional - for technical alerts)
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=alerts@example.com
```

## Implementation Phases

### Phase 1: Database Infrastructure

#### Email Templates Table
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- WELCOME, ORDER_CONFIRMATION, etc.
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  subject VARCHAR(500) NOT NULL,
  from_name VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  reply_to VARCHAR(255),
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  default_variables JSONB NOT NULL DEFAULT '{}',
  preview_text VARCHAR(255),
  styling JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  open_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  click_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_status ON email_templates(status);
```

#### SMS Messages Table
```sql
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone VARCHAR(20) NOT NULL,
  from_phone VARCHAR(20) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  type VARCHAR(20) NOT NULL DEFAULT 'TRANSACTIONAL',
  direction VARCHAR(10) NOT NULL DEFAULT 'OUTBOUND',
  provider VARCHAR(20) NOT NULL DEFAULT 'TWILIO',
  priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
  campaign_id UUID,
  template_id UUID,
  customer_id UUID,
  delivery_metrics JSONB NOT NULL DEFAULT '{}',
  response_data JSONB,
  personalization_data JSONB,
  compliance_data JSONB,
  scheduled_at TIMESTAMP,
  expires_at TIMESTAMP,
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sms_messages_to_phone ON sms_messages(to_phone);
CREATE INDEX idx_sms_messages_status ON sms_messages(status);
CREATE INDEX idx_sms_messages_customer_id ON sms_messages(customer_id);
```

### Phase 2: Service Layer

#### NotificationService (Orchestrator)

```typescript
// backend/src/services/NotificationService.ts
import { EmailService } from './EmailService';
import { SMSService } from './SMSService';
import { SlackNotificationService } from './SlackNotificationService';

interface NotificationResult {
  emailCount: number;
  smsCount: number;
  slackSent: boolean;
  errors: string[];
  details: {
    customerEmail: boolean;
    customerSMS: boolean;
    internalEmails: string[];
    internalSMS: string[];
    slack: boolean;
  };
}

export class NotificationService {
  /**
   * Send order notifications to customer + internal team
   */
  static async sendOrderNotifications(params: {
    order: any;
    customer: { name: string; email: string; phone: string };
    adminUser?: { name: string; email: string };
  }): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailCount: 0,
      smsCount: 0,
      slackSent: false,
      errors: [],
      details: {
        customerEmail: false,
        customerSMS: false,
        internalEmails: [],
        internalSMS: [],
        slack: false,
      },
    };

    console.log(`📢 Sending order notifications for ${params.order.orderNumber}`);

    // 1. Customer Email
    try {
      await EmailService.sendOrderConfirmation(
        params.customer.email,
        params.order.orderNumber,
        params.customer.name
      );
      result.emailCount++;
      result.details.customerEmail = true;
    } catch (error: any) {
      result.errors.push(`Customer email: ${error.message}`);
    }

    // 2. Customer SMS
    try {
      await SMSService.sendOrderConfirmationSMS(
        params.customer.phone,
        params.order.orderNumber,
        params.customer.name
      );
      result.smsCount++;
      result.details.customerSMS = true;
    } catch (error: any) {
      result.errors.push(`Customer SMS: ${error.message}`);
    }

    // 3. Internal team notifications
    const internalRecipients = [
      { email: process.env.ADMIN_EMAIL, name: 'Admin' },
      { email: process.env.SUPPORT_EMAIL, name: 'Support' },
    ].filter(r => r.email);

    for (const recipient of internalRecipients) {
      try {
        await EmailService.sendOrderConfirmation(
          recipient.email!,
          params.order.orderNumber,
          recipient.name
        );
        result.emailCount++;
        result.details.internalEmails.push(recipient.name);
      } catch (error: any) {
        result.errors.push(`Internal email (${recipient.name}): ${error.message}`);
      }
    }

    // 4. Slack notification
    try {
      await SlackNotificationService.sendOrderNotification({
        orderNumber: params.order.orderNumber,
        customerName: params.customer.name,
        total: params.order.total,
      });
      result.slackSent = true;
      result.details.slack = true;
    } catch (error: any) {
      result.errors.push(`Slack: ${error.message}`);
    }

    console.log(`📊 Notification Summary: ${result.emailCount} emails, ${result.smsCount} SMS, Slack: ${result.slackSent}`);
    return result;
  }

  /**
   * Send shipping notification
   */
  static async sendShippingNotifications(params: {
    order: any;
    customer: { name: string; email: string; phone: string };
    trackingNumber: string;
    carrier: string;
    trackingUrl?: string;
  }): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailCount: 0,
      smsCount: 0,
      slackSent: false,
      errors: [],
      details: {
        customerEmail: false,
        customerSMS: false,
        internalEmails: [],
        internalSMS: [],
        slack: false,
      },
    };

    // Email
    try {
      await EmailService.sendTrackingNotification({
        to: params.customer.email,
        customerName: params.customer.name,
        orderNumber: params.order.orderNumber,
        trackingNumber: params.trackingNumber,
        trackingUrl: params.trackingUrl,
        carrier: params.carrier,
      });
      result.emailCount++;
      result.details.customerEmail = true;
    } catch (error: any) {
      result.errors.push(`Shipping email: ${error.message}`);
    }

    // SMS
    try {
      await SMSService.sendOrderShippedSMS(
        params.customer.phone,
        params.order.orderNumber,
        params.trackingNumber,
        params.carrier,
        params.customer.name
      );
      result.smsCount++;
      result.details.customerSMS = true;
    } catch (error: any) {
      result.errors.push(`Shipping SMS: ${error.message}`);
    }

    return result;
  }
}

export default NotificationService;
```

### Phase 3: Integration with Order Flow

```typescript
// backend/src/graphql/resolvers/orderResolvers.ts
import { NotificationService } from '../../services/NotificationService';

export const orderResolvers = {
  Mutation: {
    createOrder: async (_, { input }, context) => {
      // ... order creation logic ...

      // Send notifications after order is created
      try {
        await NotificationService.sendOrderNotifications({
          order,
          customer: {
            name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            email: order.email,
            phone: order.phone,
          },
        });
      } catch (error) {
        console.error('Failed to send order notifications:', error);
        // Don't fail the order creation if notifications fail
      }

      return order;
    },

    updateOrderStatus: async (_, { id, status }, context) => {
      const order = await Order.findByPk(id);
      if (!order) throw new Error('Order not found');

      await order.update({ status });

      // Send shipping notification when status changes to SHIPPED
      if (status === 'SHIPPED' && order.trackingNumber) {
        try {
          await NotificationService.sendShippingNotifications({
            order,
            customer: {
              name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
              email: order.email,
              phone: order.phone,
            },
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            trackingUrl: order.trackingUrl,
          });
        } catch (error) {
          console.error('Failed to send shipping notifications:', error);
        }
      }

      return order;
    },
  },
};
```

### Phase 4: Webhook Handlers

#### SendGrid Webhook
```typescript
// backend/src/routes/webhooks.ts
import express from 'express';
import { handleSendGridWebhook } from '../webhooks/sendgridWebhook';
import { handleTwilioWebhook } from '../webhooks/twilioWebhook';

const router = express.Router();

// SendGrid events webhook
router.post('/sendgrid', express.json(), handleSendGridWebhook);

// Twilio status callback
router.post('/twilio/status', express.urlencoded({ extended: true }), handleTwilioWebhook);

export default router;
```

### Phase 5: GraphQL Schema

```graphql
# Notification Types
type NotificationResult {
  emailCount: Int!
  smsCount: Int!
  slackSent: Boolean!
  errors: [String!]!
}

# Email Types
enum EmailTemplateType {
  WELCOME
  ORDER_CONFIRMATION
  SHIPPING_NOTIFICATION
  PASSWORD_RESET
  PROMOTIONAL
  ABANDONED_CART
}

type EmailTemplate {
  id: ID!
  name: String!
  type: EmailTemplateType!
  status: String!
  subject: String!
  htmlContent: String!
  usageCount: Int!
  openRate: Float!
  clickRate: Float!
}

# SMS Types
enum SMSMessageStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
}

type SMSMessage {
  id: ID!
  toPhone: String!
  body: String!
  status: SMSMessageStatus!
  deliveredAt: DateTime
}

# Queries
extend type Query {
  emailTemplates(type: EmailTemplateType): [EmailTemplate!]!
  smsMessages(status: SMSMessageStatus, limit: Int): [SMSMessage!]!
  notificationStats: NotificationStats!
}

# Mutations
extend type Mutation {
  sendTestEmail(templateId: ID!, to: String!): Boolean!
  sendTestSMS(to: String!, message: String!): Boolean!
  resendOrderNotifications(orderId: ID!): NotificationResult!
}
```

## Verification Checklist

### Email
- [ ] SendGrid API key working
- [ ] Verified sender sending emails
- [ ] Transactional pool configured
- [ ] Marketing pool configured
- [ ] Webhook receiving events
- [ ] Open/click tracking working

### SMS
- [ ] Twilio credentials working
- [ ] Phone number sending messages
- [ ] Status callbacks working
- [ ] E.164 validation working
- [ ] Cost calculation accurate

### Integration
- [ ] Order confirmation sends email + SMS
- [ ] Shipping notification sends email + SMS
- [ ] Admin receives internal notifications
- [ ] Errors don't break order flow

## Related Skills

- **email-notifications-standard** - Detailed email patterns
- **sms-notifications-standard** - Detailed SMS patterns
- **order-management-standard** - Order notification triggers
- **realtime-updates-standard** - Real-time notification delivery
