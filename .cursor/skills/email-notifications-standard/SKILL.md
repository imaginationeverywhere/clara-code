---
name: email-notifications-standard
description: Implement production-grade email notifications with AWS SES (v1/v2) only — templates, bulk sends, verified identities. Use when building transactional emails, marketing campaigns, or notification systems. Triggers on requests for email sending, SES setup, or templated mail.
---

# Email Notifications Standard

Production-grade email on the Auset platform uses **AWS SES only** (no third-party ESP in the boilerplate). Use `@aws-sdk/client-ses` / `@aws-sdk/client-sesv2` and verified identities (e.g. `info@quiknation.com`).

## Overview

This skill defines the standard patterns for implementing transactional and marketing email notifications in Quik Nation AI Boilerplate projects.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL NOTIFICATION SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Email Triggers: Orders, Auth, Marketing, Alerts          │  │
│  └──────────────────────────────────┬───────────────────────┘  │
│                                     │                           │
│  SERVICE LAYER                      ▼                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              EmailService / DualEmailService              │  │
│  │  ┌────────────────┐  ┌────────────────┐                  │  │
│  │  │ Template Engine │  │ Variable Sub   │                  │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  PROVIDER ROUTING               ▼                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Intelligent Provider Selection                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │  SendGrid   │  │   AWS SES   │  │  Fallback   │      │  │
│  │  │ (Customer)  │  │ (Technical) │  │   Queue     │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  DELIVERY & TRACKING            ▼                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Webhooks: Opens, Clicks, Bounces, Unsubscribes          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Critical Patterns

### 1. Email Type Classification

```typescript
// backend/src/types/EmailTypes.ts
export enum EmailType {
  // Transactional (SendGrid Transactional Pool)
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  SHIPPING_NOTIFICATION = 'SHIPPING_NOTIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',

  // Marketing (SendGrid Marketing Pool)
  WELCOME = 'WELCOME',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  NEWSLETTER = 'NEWSLETTER',
  PROMOTIONAL = 'PROMOTIONAL',
  ABANDONED_CART = 'ABANDONED_CART',

  // Technical (AWS SES)
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  DEPLOYMENT_NOTIFICATION = 'DEPLOYMENT_NOTIFICATION',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERFORMANCE_ALERT = 'PERFORMANCE_ALERT',
}

export enum EmailTemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}
```

### 2. IP Pool Separation (SendGrid)

```typescript
// CRITICAL: Separate transactional from marketing to protect deliverability
export class EmailService {
  // Dedicated IP Pool Configuration
  private static readonly TRANSACTIONAL_POOL = process.env.SENDGRID_TRANSACTIONAL_POOL || 'transactional-pool';
  private static readonly MARKETING_POOL = process.env.SENDGRID_MARKETING_POOL || 'marketing-pool';

  static async sendEmail(options: EmailOptions): Promise<void> {
    const msg: any = {
      to: options.to,
      from: { email: this.DEFAULT_FROM_EMAIL, name: this.DEFAULT_FROM_NAME },
      replyTo: this.DEFAULT_REPLY_TO,
      subject: options.subject,
      text: options.text,
      html: options.htmlContent,
    };

    // CRITICAL: Add IP pool based on email type
    if (options.ipPoolName) {
      msg.ipPoolName = options.ipPoolName;
    }

    await sgMail.send(msg);
  }

  // Order confirmation = Transactional Pool
  static async sendOrderConfirmation(to: string, orderNumber: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Order Confirmation - ${orderNumber}`,
      htmlContent: this.renderOrderConfirmation(orderNumber),
      ipPoolName: this.TRANSACTIONAL_POOL, // CRITICAL
    });
  }

  // Welcome email = Marketing Pool
  static async sendWelcomeEmail(to: string, firstName?: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Our Platform!',
      htmlContent: this.renderWelcome(firstName),
      ipPoolName: this.MARKETING_POOL, // CRITICAL
    });
  }
}
```

### 3. Dual Provider Routing (SendGrid + SES)

```typescript
// backend/src/services/DualEmailService.ts
export class DualEmailService {
  /**
   * CRITICAL: Route emails to appropriate provider
   * - Customer emails -> SendGrid (better deliverability, templates)
   * - Technical alerts -> AWS SES (cost-effective, no reputation concerns)
   */
  private static determineProvider(options: EmailOptions): 'ses' | 'sendgrid' {
    // Explicit provider override
    if (options.provider === 'ses') return 'ses';
    if (options.provider === 'sendgrid') return 'sendgrid';

    // Auto-routing based on recipient
    const recipient = Array.isArray(options.to) ? options.to[0] : options.to;

    // Technical emails -> SES
    if (recipient.includes('development@') ||
        recipient.includes('admin@') ||
        recipient.includes('alerts@')) {
      return 'ses';
    }

    // Customer emails -> SendGrid
    return 'sendgrid';
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    const provider = this.determineProvider(options);

    if (provider === 'ses') {
      await this.sendViaSES(options);
    } else {
      await this.sendViaSendGrid(options);
    }
  }
}
```

### 4. Verified Sender Enforcement

```typescript
// CRITICAL: Always enforce verified sender identity
static async sendEmail(options: EmailOptions): Promise<void> {
  // IMPORTANT: Ignore caller-provided 'from' to prevent spoofing
  const from = {
    email: this.DEFAULT_FROM_EMAIL,  // Must be verified in SendGrid
    name: this.DEFAULT_FROM_NAME
  };
  const replyTo = this.DEFAULT_REPLY_TO;

  const msg = {
    to: options.to,
    from,           // Always use verified sender
    replyTo,        // Allow custom reply-to
    subject: options.subject,
    html: options.htmlContent,
    text: options.text,
  };

  await sgMail.send(msg);
}
```

## Database Model

### EmailTemplate Model

```typescript
// backend/src/models/EmailTemplate.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export enum EmailTemplateType {
  WELCOME = 'WELCOME',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  NEWSLETTER = 'NEWSLETTER',
  PROMOTIONAL = 'PROMOTIONAL',
  ABANDONED_CART = 'ABANDONED_CART',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  SHIPPING_NOTIFICATION = 'SHIPPING_NOTIFICATION',
  FOLLOW_UP = 'FOLLOW_UP',
  THANK_YOU = 'THANK_YOU',
  SURVEY = 'SURVEY',
  CUSTOM = 'CUSTOM',
}

export enum EmailTemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

interface EmailTemplateVariable {
  name: string;
  type: 'text' | 'email' | 'url' | 'date' | 'number';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

class EmailTemplate extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public type!: EmailTemplateType;
  public status!: EmailTemplateStatus;
  public subject!: string;
  public fromName!: string;
  public fromEmail!: string;
  public replyTo?: string;
  public htmlContent!: string;
  public textContent!: string;
  public variables!: EmailTemplateVariable[];
  public defaultVariables!: Record<string, any>;
  public previewText?: string;
  public styling!: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    headerImage?: string;
    footerText?: string;
  };
  public isDefault!: boolean;
  public usageCount!: number;
  public openRate!: number;
  public clickRate!: number;
  public createdBy!: string;
  public metadata!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  renderContent(variables: Record<string, any> = {}): { html: string; text: string; subject: string } {
    const allVariables = { ...this.defaultVariables, ...variables };

    const replaceVariables = (content: string): string => {
      return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return allVariables[varName] !== undefined ? String(allVariables[varName]) : match;
      });
    };

    return {
      html: replaceVariables(this.htmlContent),
      text: replaceVariables(this.textContent),
      subject: replaceVariables(this.subject),
    };
  }

  validateVariables(variables: Record<string, any>): { valid: boolean; missing: string[]; errors: string[] } {
    const missing: string[] = [];
    const errors: string[] = [];

    this.variables.forEach(templateVar => {
      const value = variables[templateVar.name];

      if (templateVar.required && (value === undefined || value === null || value === '')) {
        missing.push(templateVar.name);
      }

      if (value !== undefined && value !== null) {
        switch (templateVar.type) {
          case 'email':
            if (typeof value === 'string' && !value.includes('@')) {
              errors.push(`${templateVar.name} must be a valid email address`);
            }
            break;
          case 'url':
            if (typeof value === 'string' && !value.startsWith('http')) {
              errors.push(`${templateVar.name} must be a valid URL`);
            }
            break;
        }
      }
    });

    return { valid: missing.length === 0 && errors.length === 0, missing, errors };
  }
}

EmailTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(EmailTemplateType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EmailTemplateStatus)),
      allowNull: false,
      defaultValue: EmailTemplateStatus.DRAFT,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    replyTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    textContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    defaultVariables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    previewText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    styling: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    openRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    clickRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'email_templates',
    timestamps: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['isDefault'] },
      { fields: ['createdBy'] },
    ],
  }
);

export default EmailTemplate;
```

### EmailMessage Model (Tracking)

```typescript
// backend/src/models/EmailMessage.ts
export enum EmailMessageStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}

class EmailMessage extends Model {
  public id!: string;
  public templateId?: string;
  public recipientEmail!: string;
  public recipientName?: string;
  public subject!: string;
  public status!: EmailMessageStatus;
  public provider!: 'sendgrid' | 'ses';
  public providerMessageId?: string;
  public sentAt?: Date;
  public deliveredAt?: Date;
  public openedAt?: Date;
  public clickedAt?: Date;
  public bouncedAt?: Date;
  public bounceType?: string;
  public bounceReason?: string;
  public unsubscribedAt?: Date;
  public metadata!: Record<string, any>;
}
```

## Email Service Implementation

### Core Email Service

```typescript
// backend/src/services/EmailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  text?: string;
  from?: string;
  ipPoolName?: string;
  attachments?: Array<{
    content: string; // base64
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

export class EmailService {
  private static readonly DEFAULT_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
  private static readonly DEFAULT_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Platform';
  private static readonly DEFAULT_REPLY_TO = process.env.SENDGRID_REPLY_TO_EMAIL || 'support@example.com';
  private static readonly TRANSACTIONAL_POOL = process.env.SENDGRID_TRANSACTIONAL_POOL || 'transactional-pool';
  private static readonly MARKETING_POOL = process.env.SENDGRID_MARKETING_POOL || 'marketing-pool';

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const from = { email: this.DEFAULT_FROM_EMAIL, name: this.DEFAULT_FROM_NAME };

      const msg: any = {
        to: options.to,
        from,
        replyTo: this.DEFAULT_REPLY_TO,
        subject: options.subject,
        text: options.text,
        html: options.htmlContent,
      };

      if (options.ipPoolName) {
        msg.ipPoolName = options.ipPoolName;
      }

      if (options.attachments?.length) {
        msg.attachments = options.attachments;
      }

      console.log('📤 EmailService: sending email', {
        to: Array.isArray(msg.to) ? msg.to[0] : msg.to,
        subject: msg.subject,
        ipPool: msg.ipPoolName || 'default',
      });

      await sgMail.send(msg);
      console.log('📧 Email sent successfully to:', options.to);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  // Transactional Emails
  static async sendOrderConfirmation(
    to: string,
    orderNumber: string,
    firstName?: string,
    hasPreOrders?: boolean
  ): Promise<void> {
    const preOrderMessage = hasPreOrders ? `
      <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #92400E; margin-top: 0;">Pre-Order Information</h4>
        <p style="color: #92400E; margin: 5px 0;">
          Your order contains pre-order items. You'll receive tracking info when items ship.
        </p>
      </div>
    ` : '';

    await this.sendEmail({
      to,
      subject: `Order Confirmation - ${orderNumber}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">Order Confirmation</h1>
          <p>${firstName ? `Hi ${firstName},` : 'Hello!'}</p>
          <p>Thank you for your order! We're processing your order now.</p>
          ${preOrderMessage}
          <div style="background: #F3E8FF; padding: 20px; border-radius: 8px;">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Status:</strong> Processing</p>
          </div>
        </div>
      `,
      text: `Order Confirmation - ${orderNumber}. Thank you for your order!`,
      ipPoolName: this.TRANSACTIONAL_POOL,
    });
  }

  static async sendTrackingNotification(options: {
    to: string;
    customerName: string;
    orderNumber: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
  }): Promise<void> {
    await this.sendEmail({
      to: options.to,
      subject: `Your order ${options.orderNumber} has shipped!`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">Your Order Has Shipped!</h1>
          <p>Hi ${options.customerName},</p>
          <p>Great news! Your order is on its way.</p>
          <div style="background: #F3E8FF; padding: 20px; border-radius: 8px;">
            <p><strong>Order Number:</strong> ${options.orderNumber}</p>
            ${options.trackingNumber ? `<p><strong>Tracking:</strong> ${options.trackingNumber}</p>` : ''}
            ${options.carrier ? `<p><strong>Carrier:</strong> ${options.carrier}</p>` : ''}
          </div>
          ${options.trackingUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${options.trackingUrl}" style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Track Your Package
              </a>
            </div>
          ` : ''}
        </div>
      `,
      ipPoolName: this.TRANSACTIONAL_POOL,
    });
  }

  static async sendPasswordResetEmail(options: {
    to: string;
    firstName: string;
    resetUrl: string;
    expiresInMinutes: number;
  }): Promise<void> {
    await this.sendEmail({
      to: options.to,
      subject: 'Reset Your Password',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">Reset Your Password</h1>
          <p>Hi ${options.firstName},</p>
          <p>We received a request to reset your password. Click below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${options.resetUrl}" style="background: #7C3AED; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
              Reset My Password
            </a>
          </div>
          <div style="background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; border-radius: 4px;">
            <p style="color: #92400E; margin: 0;">
              <strong>This link expires in ${options.expiresInMinutes} minutes</strong>
            </p>
          </div>
        </div>
      `,
      ipPoolName: this.TRANSACTIONAL_POOL,
    });
  }

  // Marketing Emails
  static async sendWelcomeEmail(to: string, firstName?: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Our Platform!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">Welcome!</h1>
          <p>${firstName ? `Hi ${firstName},` : 'Hello!'}</p>
          <p>Thank you for joining our community!</p>
          <div style="background: #F3E8FF; padding: 20px; border-radius: 8px;">
            <h3 style="color: #7C3AED;">What's Next?</h3>
            <ul>
              <li>Explore our products</li>
              <li>Complete your profile</li>
              <li>Start shopping</li>
            </ul>
          </div>
        </div>
      `,
      ipPoolName: this.MARKETING_POOL,
    });
  }

  static async sendProductLaunchNotification(
    to: string,
    productName: string,
    firstName?: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `New Product: ${productName} is Now Available!`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">${productName} is Now Available!</h1>
          <p>${firstName ? `Hi ${firstName},` : 'Hello!'}</p>
          <p>Great news! The product you've been waiting for is now available.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://example.com/products" style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Shop Now
            </a>
          </div>
        </div>
      `,
      ipPoolName: this.MARKETING_POOL,
    });
  }

  // Technical Alerts
  static async sendTechnicalAlert(
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const severityColors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };

    await this.sendEmail({
      to: 'development@example.com',
      subject: `${severity.toUpperCase()} Alert: ${title}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${severityColors[severity]}; color: white; padding: 15px; border-radius: 8px;">
            <h1 style="margin: 0;">Technical Alert</h1>
            <p style="margin: 5px 0;">Severity: ${severity.toUpperCase()}</p>
          </div>
          <h2 style="color: #374151; margin-top: 20px;">${title}</h2>
          <pre style="background: #F3F4F6; padding: 15px; border-radius: 6px; overflow-x: auto;">${message}</pre>
          <p style="color: #6B7280; font-size: 12px;">
            Timestamp: ${new Date().toISOString()}<br>
            Environment: ${process.env.NODE_ENV || 'development'}
          </p>
        </div>
      `,
      ipPoolName: this.TRANSACTIONAL_POOL,
    });
  }
}

export default EmailService;
```

## GraphQL Schema

```graphql
# backend/src/graphql/schema/email.graphql
enum EmailTemplateType {
  WELCOME
  PRODUCT_LAUNCH
  NEWSLETTER
  PROMOTIONAL
  ABANDONED_CART
  ORDER_CONFIRMATION
  SHIPPING_NOTIFICATION
  FOLLOW_UP
  THANK_YOU
  SURVEY
  CUSTOM
}

enum EmailTemplateStatus {
  DRAFT
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum EmailMessageStatus {
  PENDING
  QUEUED
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  FAILED
  UNSUBSCRIBED
}

type EmailTemplateVariable {
  name: String!
  type: String!
  required: Boolean!
  defaultValue: String
  description: String
}

type EmailTemplateStyling {
  primaryColor: String
  secondaryColor: String
  fontFamily: String
  headerImage: String
  footerText: String
}

type EmailTemplate {
  id: ID!
  name: String!
  description: String
  type: EmailTemplateType!
  status: EmailTemplateStatus!
  subject: String!
  fromName: String!
  fromEmail: String!
  replyTo: String
  htmlContent: String!
  textContent: String!
  variables: [EmailTemplateVariable!]!
  defaultVariables: JSON
  previewText: String
  styling: EmailTemplateStyling
  isDefault: Boolean!
  usageCount: Int!
  openRate: Float!
  clickRate: Float!
  createdBy: ID!
  creator: User
  createdAt: DateTime!
  updatedAt: DateTime!
}

type EmailMessage {
  id: ID!
  templateId: ID
  template: EmailTemplate
  recipientEmail: String!
  recipientName: String
  subject: String!
  status: EmailMessageStatus!
  provider: String!
  providerMessageId: String
  sentAt: DateTime
  deliveredAt: DateTime
  openedAt: DateTime
  clickedAt: DateTime
  bouncedAt: DateTime
  bounceType: String
  bounceReason: String
  metadata: JSON
  createdAt: DateTime!
}

type EmailStats {
  totalTemplates: Int!
  activeTemplates: Int!
  draftTemplates: Int!
  totalSent: Int!
  deliveryRate: Float!
  openRate: Float!
  clickRate: Float!
  bounceRate: Float!
}

input CreateEmailTemplateInput {
  name: String!
  description: String
  type: EmailTemplateType!
  subject: String!
  fromName: String
  fromEmail: String
  replyTo: String
  htmlContent: String!
  textContent: String!
  variables: [EmailTemplateVariableInput!]
  previewText: String
  styling: EmailTemplateStylingInput
  isDefault: Boolean
}

input UpdateEmailTemplateInput {
  name: String
  description: String
  subject: String
  htmlContent: String
  textContent: String
  variables: [EmailTemplateVariableInput!]
  previewText: String
  styling: EmailTemplateStylingInput
  status: EmailTemplateStatus
}

input EmailTemplateVariableInput {
  name: String!
  type: String!
  required: Boolean!
  defaultValue: String
  description: String
}

input EmailTemplateStylingInput {
  primaryColor: String
  secondaryColor: String
  fontFamily: String
  headerImage: String
  footerText: String
}

input SendEmailInput {
  templateId: ID
  to: String!
  subject: String
  htmlContent: String
  textContent: String
  variables: JSON
}

type Query {
  emailTemplate(id: ID!): EmailTemplate
  emailTemplates(type: EmailTemplateType, status: EmailTemplateStatus): [EmailTemplate!]!
  emailMessages(status: EmailMessageStatus, limit: Int, offset: Int): [EmailMessage!]!
  emailStats: EmailStats!
}

type Mutation {
  createEmailTemplate(input: CreateEmailTemplateInput!): EmailTemplate!
  updateEmailTemplate(id: ID!, input: UpdateEmailTemplateInput!): EmailTemplate!
  deleteEmailTemplate(id: ID!): Boolean!
  cloneEmailTemplate(id: ID!, name: String!): EmailTemplate!
  sendEmail(input: SendEmailInput!): EmailMessage!
  sendTestEmail(templateId: ID!, to: String!): Boolean!
}
```

## Webhook Handlers

### SendGrid Event Webhook

```typescript
// backend/src/webhooks/sendgridWebhook.ts
import { Request, Response } from 'express';
import EmailMessage, { EmailMessageStatus } from '../models/EmailMessage';

interface SendGridEvent {
  event: string;
  email: string;
  timestamp: number;
  sg_message_id: string;
  reason?: string;
  bounce_classification?: string;
}

export async function handleSendGridWebhook(req: Request, res: Response) {
  try {
    const events: SendGridEvent[] = req.body;

    for (const event of events) {
      const message = await EmailMessage.findOne({
        where: { providerMessageId: event.sg_message_id },
      });

      if (!message) continue;

      switch (event.event) {
        case 'delivered':
          await message.update({
            status: EmailMessageStatus.DELIVERED,
            deliveredAt: new Date(event.timestamp * 1000),
          });
          break;

        case 'open':
          await message.update({
            status: EmailMessageStatus.OPENED,
            openedAt: new Date(event.timestamp * 1000),
          });
          break;

        case 'click':
          await message.update({
            status: EmailMessageStatus.CLICKED,
            clickedAt: new Date(event.timestamp * 1000),
          });
          break;

        case 'bounce':
          await message.update({
            status: EmailMessageStatus.BOUNCED,
            bouncedAt: new Date(event.timestamp * 1000),
            bounceType: event.bounce_classification,
            bounceReason: event.reason,
          });
          break;

        case 'unsubscribe':
          await message.update({
            status: EmailMessageStatus.UNSUBSCRIBED,
            unsubscribedAt: new Date(event.timestamp * 1000),
          });
          break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

## Environment Variables

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@example.com
SENDGRID_FROM_NAME=Platform Name
SENDGRID_REPLY_TO_EMAIL=support@example.com
SENDGRID_TRANSACTIONAL_POOL=transactional-pool
SENDGRID_MARKETING_POOL=marketing-pool

# AWS SES Configuration (for technical emails)
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=alerts@example.com
AWS_SES_FROM_NAME=Platform Alerts
AWS_SES_VERIFIED_EMAIL=verified@example.com

# Webhook Configuration
SENDGRID_WEBHOOK_VERIFICATION_KEY=xxx...
```

## Migration

```typescript
// backend/src/migrations/YYYYMMDDHHMMSS-create-email-templates.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('email_templates', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'WELCOME', 'PRODUCT_LAUNCH', 'NEWSLETTER', 'PROMOTIONAL',
        'ABANDONED_CART', 'ORDER_CONFIRMATION', 'SHIPPING_NOTIFICATION',
        'FOLLOW_UP', 'THANK_YOU', 'SURVEY', 'CUSTOM'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reply_to: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    html_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    text_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    default_variables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    preview_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    styling: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    open_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    click_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('email_templates', ['type']);
  await queryInterface.addIndex('email_templates', ['status']);
  await queryInterface.addIndex('email_templates', ['is_default']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('email_templates');
}
```

## Quality Checklist

### Setup
- [ ] SendGrid API key configured
- [ ] From email verified in SendGrid
- [ ] IP pools created (transactional + marketing)
- [ ] Webhook URL configured in SendGrid
- [ ] AWS SES configured for technical alerts (optional)

### Implementation
- [ ] IP pool separation enforced
- [ ] Verified sender always used
- [ ] HTML + plain text versions for all emails
- [ ] Variable substitution working
- [ ] Template validation implemented

### Tracking
- [ ] Webhook handler receiving events
- [ ] Open/click tracking enabled
- [ ] Bounce handling implemented
- [ ] Unsubscribe processing working

### Security
- [ ] API keys in environment variables
- [ ] Webhook signature verification
- [ ] Rate limiting on send endpoints
- [ ] No PII in logs

## Related Skills

- **sms-notifications-standard** - SMS notification patterns
- **realtime-updates-standard** - Real-time notification patterns
- **order-management-standard** - Order notification triggers
