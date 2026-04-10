---
name: sms-notifications-standard
description: Implement SMS notifications with Twilio, campaign management, and compliance handling. Use when sending SMS, building notification systems, or managing SMS campaigns. Triggers on requests for SMS integration, Twilio setup, text notifications, or SMS campaigns.
---

# SMS Notifications Standard

Production-grade SMS notification system following DreamiHairCare's battle-tested patterns with Twilio, campaign management, and compliance handling.

## Overview

This skill defines the standard patterns for implementing transactional and marketing SMS notifications in Quik Nation AI Boilerplate projects.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMS NOTIFICATION SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SMS Triggers: Orders, Shipping, Marketing, Reminders     │  │
│  └──────────────────────────────────┬───────────────────────┘  │
│                                     │                           │
│  SERVICE LAYER                      ▼                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    SMSService                             │  │
│  │  ┌────────────────┐  ┌────────────────┐                  │  │
│  │  │ Personalization │  │ Cost Calculator │                  │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  PROVIDER LAYER                 ▼                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Twilio / AWS SNS Provider                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ Transactional│  │  Marketing  │  │   OTP/2FA   │      │  │
│  │  │  Messages   │  │  Campaigns  │  │  Messages   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  COMPLIANCE & TRACKING          ▼                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Webhooks: Delivery Status, Responses, Opt-Outs          │  │
│  │  Compliance: TCPA, GDPR, Opt-In/Opt-Out Management       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Critical Types

### SMS Enums and Types

```typescript
// backend/src/types/SMSTypes.ts

// SMS Message Status
export enum SMSMessageStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  INVALID = 'INVALID',
  UNDELIVERED = 'UNDELIVERED',
  BLOCKED = 'BLOCKED',
  RESPONDED = 'RESPONDED',
  OPTED_OUT = 'OPTED_OUT',
}

// SMS Message Type
export enum SMSMessageType {
  CAMPAIGN = 'CAMPAIGN',
  TRANSACTIONAL = 'TRANSACTIONAL',
  AUTOMATED = 'AUTOMATED',
  TEST = 'TEST',
}

// SMS Direction
export enum SMSDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

// SMS Provider
export enum SMSProvider {
  TWILIO = 'TWILIO',
  AWS_SNS = 'AWS_SNS',
  SENDGRID = 'SENDGRID',
  OTHER = 'OTHER',
}

// SMS Priority Level
export enum SMSPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// SMS Template Category
export enum SMSTemplateCategory {
  WELCOME = 'WELCOME',
  PROMOTIONAL = 'PROMOTIONAL',
  REMINDER = 'REMINDER',
  ABANDONED_CART = 'ABANDONED_CART',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  SHIPPING_UPDATE = 'SHIPPING_UPDATE',
  FEEDBACK_REQUEST = 'FEEDBACK_REQUEST',
  REACTIVATION = 'REACTIVATION',
  BIRTHDAY = 'BIRTHDAY',
  SEASONAL = 'SEASONAL',
  CUSTOM = 'CUSTOM',
}

// Status Transitions (State Machine)
export const SMS_STATUS_TRANSITIONS: Record<SMSMessageStatus, SMSMessageStatus[]> = {
  [SMSMessageStatus.PENDING]: [SMSMessageStatus.SENDING, SMSMessageStatus.FAILED],
  [SMSMessageStatus.SENDING]: [SMSMessageStatus.SENT, SMSMessageStatus.FAILED],
  [SMSMessageStatus.SENT]: [SMSMessageStatus.DELIVERED, SMSMessageStatus.UNDELIVERED, SMSMessageStatus.RESPONDED],
  [SMSMessageStatus.DELIVERED]: [SMSMessageStatus.RESPONDED, SMSMessageStatus.OPTED_OUT],
  [SMSMessageStatus.FAILED]: [],
  [SMSMessageStatus.INVALID]: [],
  [SMSMessageStatus.UNDELIVERED]: [],
  [SMSMessageStatus.BLOCKED]: [],
  [SMSMessageStatus.RESPONDED]: [SMSMessageStatus.OPTED_OUT],
  [SMSMessageStatus.OPTED_OUT]: [],
};
```

### Key Interfaces

```typescript
// Delivery Metrics
export interface SMSDeliveryMetrics {
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  respondedAt?: Date;
  optedOutAt?: Date;
  deliveryAttempts?: number;
  lastAttemptAt?: Date;
  providerMessageId?: string;
  providerStatus?: string;
  errorCode?: string;
  errorMessage?: string;
  deliveryDuration?: number; // milliseconds
  cost?: number; // cost in cents
  segments?: number;
}

// Personalization Data
export interface SMSPersonalizationData {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  customFields?: Record<string, any>;
  dynamicContent?: Record<string, string>;
  locale?: string;
  timezone?: string;
  preferredLanguage?: string;
}

// Compliance Data
export interface SMSComplianceData {
  consentGiven?: boolean;
  consentTimestamp?: Date;
  consentSource?: string;
  optInMethod?: 'single' | 'double';
  legalBasis?: string;
  gdprCompliant?: boolean;
  ccpaCompliant?: boolean;
  canSpamCompliant?: boolean;
  tcpaCompliant?: boolean;
  dataRetentionPeriod?: number; // days
  personalDataFields?: string[];
}

// Analytics Metrics
export interface SMSAnalyticsMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalResponded: number;
  totalOptedOut: number;
  deliveryRate: number;
  responseRate: number;
  optOutRate: number;
  averageCost: number;
  totalCost: number;
  averageSegments: number;
}
```

## Critical Patterns

### 1. Phone Number Validation (E.164 Format)

```typescript
// CRITICAL: Always validate and format phone numbers
export const isValidPhoneNumber = (phone: string): boolean => {
  // E.164 format: +[country code][subscriber number]
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If already has +, return as is (validate separately)
  if (cleaned.startsWith('+')) return cleaned;

  // US numbers: add +1
  if (cleaned.startsWith('1')) return `+${cleaned}`;

  // Default: assume US, add +1
  return `+1${cleaned}`;
};
```

### 2. SMS Segment Calculation

```typescript
// CRITICAL: Calculate segments for cost estimation
export const calculateSMSSegments = (body: string): number => {
  // GSM-7 encoding: 160 chars per segment
  // Unicode: 70 chars per segment
  const hasUnicode = /[^\x00-\x7F]/.test(body);
  const charsPerSegment = hasUnicode ? 70 : 160;
  return Math.ceil(body.length / charsPerSegment);
};

export const calculateSMSCost = (
  body: string,
  provider: SMSProvider = SMSProvider.TWILIO
): { segments: number; totalCost: number } => {
  const segments = calculateSMSSegments(body);
  const costPerSegment = provider === SMSProvider.TWILIO ? 0.0075 : 0.006;
  return {
    segments,
    totalCost: Number((segments * costPerSegment).toFixed(4)),
  };
};
```

### 3. Message Personalization

```typescript
// Personalize SMS content with variable substitution
export const personalizeSMSContent = (
  template: string,
  data: SMSPersonalizationData
): string => {
  let content = template;

  if (data.firstName) {
    content = content.replace(/\{\{firstName\}\}/g, data.firstName);
  }

  if (data.lastName) {
    content = content.replace(/\{\{lastName\}\}/g, data.lastName);
  }

  if (data.customFields) {
    Object.entries(data.customFields).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(placeholder, String(value));
    });
  }

  return content.trim();
};
```

## Database Models

### SMSMessage Model

```typescript
// backend/src/models/SMSMessage.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class SMSMessage extends Model {
  public id!: string;
  public toPhone!: string;
  public fromPhone!: string;
  public body!: string;
  public status!: SMSMessageStatus;
  public type!: SMSMessageType;
  public direction!: SMSDirection;
  public provider!: SMSProvider;
  public priority!: SMSPriority;
  public campaignId?: string;
  public templateId?: string;
  public recipientId?: string;
  public customerId?: string;
  public leadId?: string;
  public deliveryMetrics!: SMSDeliveryMetrics;
  public responseData?: SMSResponseData;
  public personalizationData?: SMSPersonalizationData;
  public campaignContext?: SMSCampaignContext;
  public analyticsData?: SMSAnalyticsData;
  public complianceData?: SMSComplianceData;
  public scheduledAt?: Date;
  public expiresAt?: Date;
  public tags!: string[];
  public metadata!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SMSMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    toPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isValidPhone(value: string) {
          if (!isValidPhoneNumber(value)) {
            throw new Error('Invalid phone number format (E.164 required)');
          }
        },
      },
    },
    fromPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1600], // Max concatenated SMS length
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SMSMessageStatus)),
      allowNull: false,
      defaultValue: SMSMessageStatus.PENDING,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(SMSMessageType)),
      allowNull: false,
      defaultValue: SMSMessageType.TRANSACTIONAL,
    },
    direction: {
      type: DataTypes.ENUM(...Object.values(SMSDirection)),
      allowNull: false,
      defaultValue: SMSDirection.OUTBOUND,
    },
    provider: {
      type: DataTypes.ENUM(...Object.values(SMSProvider)),
      allowNull: false,
      defaultValue: SMSProvider.TWILIO,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(SMSPriority)),
      allowNull: false,
      defaultValue: SMSPriority.NORMAL,
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    leadId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deliveryMetrics: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    responseData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    personalizationData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    campaignContext: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    analyticsData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    complianceData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'sms_messages',
    timestamps: true,
    indexes: [
      { fields: ['toPhone'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['campaignId'] },
      { fields: ['customerId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default SMSMessage;
```

### SMSTemplate Model

```typescript
// backend/src/models/SMSTemplate.ts
class SMSTemplate extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public category!: SMSTemplateCategory;
  public status!: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  public body!: string;
  public variables!: Array<{
    name: string;
    type: 'text' | 'number' | 'date';
    required: boolean;
    defaultValue?: string;
  }>;
  public defaultVariables!: Record<string, any>;
  public characterCount!: number;
  public segmentCount!: number;
  public estimatedCost!: number;
  public usageCount!: number;
  public deliveryRate!: number;
  public responseRate!: number;
  public optOutRate!: number;
  public createdBy!: string;
  public metadata!: Record<string, any>;
}

SMSTemplate.init(
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
    category: {
      type: DataTypes.ENUM(...Object.values(SMSTemplateCategory)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1600],
      },
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
    characterCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    segmentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    deliveryRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    responseRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    optOutRate: {
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
    tableName: 'sms_templates',
    timestamps: true,
    hooks: {
      beforeSave: (template: SMSTemplate) => {
        template.characterCount = template.body.length;
        template.segmentCount = calculateSMSSegments(template.body);
        template.estimatedCost = calculateSMSCost(template.body).totalCost;
      },
    },
  }
);
```

## SMS Service Implementation

```typescript
// backend/src/services/SMSService.ts
import twilio from 'twilio';
import SMSMessage, { SMSMessageStatus, SMSMessageType, SMSProvider } from '../models/SMSMessage';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class SMSService {
  private static readonly DEFAULT_FROM = process.env.TWILIO_PHONE_NUMBER!;

  /**
   * Send SMS message
   */
  static async sendSMS(params: {
    to: string;
    body: string;
    from?: string;
    type?: SMSMessageType;
    customerId?: string;
    metadata?: Record<string, any>;
  }): Promise<SMSMessage> {
    // Validate phone number
    const formattedPhone = formatPhoneNumber(params.to);
    if (!isValidPhoneNumber(formattedPhone)) {
      throw new Error('Invalid phone number format');
    }

    // Validate body
    if (!params.body || params.body.length > 1600) {
      throw new Error('SMS body must be between 1-1600 characters');
    }

    // Calculate cost
    const { segments, totalCost } = calculateSMSCost(params.body);

    // Create message record
    const message = await SMSMessage.create({
      toPhone: formattedPhone,
      fromPhone: params.from || this.DEFAULT_FROM,
      body: params.body,
      status: SMSMessageStatus.PENDING,
      type: params.type || SMSMessageType.TRANSACTIONAL,
      provider: SMSProvider.TWILIO,
      customerId: params.customerId,
      deliveryMetrics: {
        segments,
        cost: totalCost,
      },
      metadata: params.metadata || {},
    });

    try {
      // Send via Twilio
      const twilioMessage = await twilioClient.messages.create({
        to: formattedPhone,
        from: params.from || this.DEFAULT_FROM,
        body: params.body,
        statusCallback: `${process.env.API_URL}/webhooks/twilio/status`,
      });

      // Update with provider info
      await message.update({
        status: SMSMessageStatus.SENT,
        deliveryMetrics: {
          ...message.deliveryMetrics,
          sentAt: new Date(),
          providerMessageId: twilioMessage.sid,
          providerStatus: twilioMessage.status,
        },
      });

      console.log(`📱 SMS sent to ${formattedPhone}: ${twilioMessage.sid}`);
      return message;
    } catch (error: any) {
      // Handle failure
      await message.update({
        status: SMSMessageStatus.FAILED,
        deliveryMetrics: {
          ...message.deliveryMetrics,
          failedAt: new Date(),
          errorCode: error.code,
          errorMessage: error.message,
        },
      });

      console.error(`❌ SMS failed to ${formattedPhone}:`, error.message);
      throw error;
    }
  }

  /**
   * Send order confirmation SMS
   */
  static async sendOrderConfirmationSMS(
    phone: string,
    orderNumber: string,
    customerName?: string
  ): Promise<SMSMessage> {
    const greeting = customerName ? `Hi ${customerName}, ` : '';
    const body = `${greeting}Order Confirmation ${orderNumber}. Thank you for your order! We're processing it now.`;
    return this.sendSMS({ to: phone, body, type: SMSMessageType.TRANSACTIONAL });
  }

  /**
   * Send shipping notification SMS
   */
  static async sendOrderShippedSMS(
    phone: string,
    orderNumber: string,
    trackingNumber?: string,
    carrier?: string,
    customerName?: string
  ): Promise<SMSMessage> {
    const greeting = customerName ? `Hi ${customerName}, ` : '';
    const tracking = trackingNumber
      ? ` Tracking: ${trackingNumber}${carrier ? ` via ${carrier}` : ''}`
      : '';
    const body = `${greeting}Your order #${orderNumber} has shipped!${tracking}`;
    return this.sendSMS({ to: phone, body, type: SMSMessageType.TRANSACTIONAL });
  }

  /**
   * Send delivery confirmation SMS
   */
  static async sendOrderDeliveredSMS(
    phone: string,
    orderNumber: string,
    customerName?: string
  ): Promise<SMSMessage> {
    const greeting = customerName ? `Hi ${customerName}, ` : '';
    const body = `${greeting}Your order #${orderNumber} has been delivered! Enjoy your purchase!`;
    return this.sendSMS({ to: phone, body, type: SMSMessageType.TRANSACTIONAL });
  }

  /**
   * Send welcome SMS
   */
  static async sendWelcomeSMS(
    phone: string,
    customerName?: string
  ): Promise<SMSMessage> {
    const body = customerName
      ? `Welcome to our platform, ${customerName}! We're excited to have you.`
      : `Welcome to our platform! We're excited to have you.`;
    return this.sendSMS({ to: phone, body, type: SMSMessageType.AUTOMATED });
  }

  /**
   * Send appointment reminder SMS
   */
  static async sendAppointmentReminderSMS(
    phone: string,
    appointmentDate: string,
    appointmentTime: string,
    customerName?: string
  ): Promise<SMSMessage> {
    const greeting = customerName ? `Hi ${customerName}, ` : '';
    const body = `${greeting}Reminder: Your appointment is scheduled for ${appointmentDate} at ${appointmentTime}. We look forward to seeing you!`;
    return this.sendSMS({ to: phone, body, type: SMSMessageType.AUTOMATED });
  }

  /**
   * Get SMS info (segment count, cost)
   */
  static getSMSInfo(message: string): {
    provider: string;
    costPerMessage: number;
    segmentCount: number;
    characterCount: number;
    estimatedCost: number;
  } {
    const { segments, totalCost } = calculateSMSCost(message);
    return {
      provider: 'Twilio',
      costPerMessage: 0.0075,
      segmentCount: segments,
      characterCount: message.length,
      estimatedCost: totalCost,
    };
  }

  /**
   * Calculate delivery metrics
   */
  static calculateDeliveryMetrics(messages: SMSMessage[]): SMSAnalyticsMetrics {
    const totalSent = messages.filter(m => m.status !== SMSMessageStatus.PENDING).length;
    const totalDelivered = messages.filter(m => m.status === SMSMessageStatus.DELIVERED).length;
    const totalFailed = messages.filter(m =>
      [SMSMessageStatus.FAILED, SMSMessageStatus.UNDELIVERED].includes(m.status)
    ).length;
    const totalResponded = messages.filter(m => m.status === SMSMessageStatus.RESPONDED).length;
    const totalOptedOut = messages.filter(m => m.status === SMSMessageStatus.OPTED_OUT).length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const responseRate = totalDelivered > 0 ? (totalResponded / totalDelivered) * 100 : 0;
    const optOutRate = totalDelivered > 0 ? (totalOptedOut / totalDelivered) * 100 : 0;

    const totalCost = messages.reduce((sum, m) => sum + (m.deliveryMetrics?.cost || 0), 0);

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      totalResponded,
      totalOptedOut,
      deliveryRate: Number(deliveryRate.toFixed(2)),
      responseRate: Number(responseRate.toFixed(2)),
      optOutRate: Number(optOutRate.toFixed(2)),
      averageCost: totalSent > 0 ? Number((totalCost / totalSent).toFixed(4)) : 0,
      totalCost: Number(totalCost.toFixed(2)),
      averageSegments: 1,
    };
  }

  /**
   * Check valid status transition
   */
  static isValidStatusTransition(
    currentStatus: SMSMessageStatus,
    newStatus: SMSMessageStatus
  ): boolean {
    const allowedTransitions = SMS_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus) || currentStatus === newStatus;
  }

  /**
   * Test SMS configuration
   */
  static async testSMSConfiguration(testPhoneNumber: string): Promise<boolean> {
    try {
      await this.sendSMS({
        to: testPhoneNumber,
        body: 'Test SMS - Configuration successful!',
        type: SMSMessageType.TEST,
      });
      return true;
    } catch (error) {
      console.error('SMS configuration test failed:', error);
      return false;
    }
  }
}

export default SMSService;
```

## GraphQL Schema

```graphql
# backend/src/graphql/schema/sms.graphql
enum SMSMessageStatus {
  PENDING
  SENDING
  SENT
  DELIVERED
  FAILED
  INVALID
  UNDELIVERED
  BLOCKED
  RESPONDED
  OPTED_OUT
}

enum SMSMessageType {
  CAMPAIGN
  TRANSACTIONAL
  AUTOMATED
  TEST
}

enum SMSProvider {
  TWILIO
  AWS_SNS
  SENDGRID
  OTHER
}

enum SMSTemplateCategory {
  WELCOME
  PROMOTIONAL
  REMINDER
  ABANDONED_CART
  ORDER_CONFIRMATION
  SHIPPING_UPDATE
  FEEDBACK_REQUEST
  REACTIVATION
  BIRTHDAY
  SEASONAL
  CUSTOM
}

type SMSDeliveryMetrics {
  sentAt: DateTime
  deliveredAt: DateTime
  failedAt: DateTime
  deliveryAttempts: Int
  providerMessageId: String
  providerStatus: String
  errorCode: String
  errorMessage: String
  cost: Float
  segments: Int
}

type SMSMessage {
  id: ID!
  toPhone: String!
  fromPhone: String!
  body: String!
  status: SMSMessageStatus!
  type: SMSMessageType!
  provider: SMSProvider!
  campaignId: ID
  templateId: ID
  customerId: ID
  deliveryMetrics: SMSDeliveryMetrics
  scheduledAt: DateTime
  tags: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SMSTemplate {
  id: ID!
  name: String!
  description: String
  category: SMSTemplateCategory!
  status: String!
  body: String!
  characterCount: Int!
  segmentCount: Int!
  estimatedCost: Float!
  usageCount: Int!
  deliveryRate: Float!
  responseRate: Float!
  createdAt: DateTime!
}

type SMSInfo {
  provider: String!
  costPerMessage: Float!
  segmentCount: Int!
  characterCount: Int!
  estimatedCost: Float!
}

type SMSAnalytics {
  totalSent: Int!
  totalDelivered: Int!
  totalFailed: Int!
  totalResponded: Int!
  totalOptedOut: Int!
  deliveryRate: Float!
  responseRate: Float!
  optOutRate: Float!
  totalCost: Float!
}

input SendSMSInput {
  to: String!
  body: String!
  type: SMSMessageType
  customerId: ID
  scheduledAt: DateTime
}

type Query {
  smsMessage(id: ID!): SMSMessage
  smsMessages(status: SMSMessageStatus, type: SMSMessageType, limit: Int, offset: Int): [SMSMessage!]!
  smsTemplates(category: SMSTemplateCategory, status: String): [SMSTemplate!]!
  smsInfo(message: String!): SMSInfo!
  smsAnalytics(dateRange: DateRangeInput): SMSAnalytics!
}

type Mutation {
  sendSMS(input: SendSMSInput!): SMSMessage!
  sendOrderConfirmationSMS(phone: String!, orderNumber: String!, customerName: String): SMSMessage!
  sendOrderShippedSMS(phone: String!, orderNumber: String!, trackingNumber: String, carrier: String, customerName: String): SMSMessage!
  sendWelcomeSMS(phone: String!, customerName: String): SMSMessage!
  testSMSConfiguration(phone: String!): Boolean!
}
```

## Webhook Handlers

### Twilio Status Webhook

```typescript
// backend/src/webhooks/twilioWebhook.ts
import { Request, Response } from 'express';
import twilio from 'twilio';
import SMSMessage, { SMSMessageStatus } from '../models/SMSMessage';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function handleTwilioStatusWebhook(req: Request, res: Response) {
  // Validate Twilio signature
  const signature = req.headers['x-twilio-signature'] as string;
  const url = `${process.env.API_URL}/webhooks/twilio/status`;

  if (!twilioClient.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    req.body
  )) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;

  try {
    const message = await SMSMessage.findOne({
      where: { 'deliveryMetrics.providerMessageId': MessageSid },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Map Twilio status to our status
    const statusMap: Record<string, SMSMessageStatus> = {
      queued: SMSMessageStatus.SENDING,
      sent: SMSMessageStatus.SENT,
      delivered: SMSMessageStatus.DELIVERED,
      undelivered: SMSMessageStatus.UNDELIVERED,
      failed: SMSMessageStatus.FAILED,
    };

    const newStatus = statusMap[MessageStatus] || message.status;

    // Validate status transition
    if (SMSService.isValidStatusTransition(message.status, newStatus)) {
      await message.update({
        status: newStatus,
        deliveryMetrics: {
          ...message.deliveryMetrics,
          providerStatus: MessageStatus,
          deliveredAt: newStatus === SMSMessageStatus.DELIVERED ? new Date() : undefined,
          failedAt: newStatus === SMSMessageStatus.FAILED ? new Date() : undefined,
          errorCode: ErrorCode,
          errorMessage: ErrorMessage,
        },
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

## Environment Variables

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=MGxxx... # Optional for high-volume

# SMS Settings
SMS_DEFAULT_PROVIDER=TWILIO
SMS_COST_PER_SEGMENT=0.0075

# Webhook URL
API_URL=https://api.example.com
```

## Migration

```typescript
// backend/src/migrations/YYYYMMDDHHMMSS-create-sms-messages.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('sms_messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    to_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    from_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING', 'SENDING', 'SENT', 'DELIVERED', 'FAILED',
        'INVALID', 'UNDELIVERED', 'BLOCKED', 'RESPONDED', 'OPTED_OUT'
      ),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    type: {
      type: DataTypes.ENUM('CAMPAIGN', 'TRANSACTIONAL', 'AUTOMATED', 'TEST'),
      allowNull: false,
      defaultValue: 'TRANSACTIONAL',
    },
    direction: {
      type: DataTypes.ENUM('INBOUND', 'OUTBOUND'),
      allowNull: false,
      defaultValue: 'OUTBOUND',
    },
    provider: {
      type: DataTypes.ENUM('TWILIO', 'AWS_SNS', 'SENDGRID', 'OTHER'),
      allowNull: false,
      defaultValue: 'TWILIO',
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
      allowNull: false,
      defaultValue: 'NORMAL',
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    template_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    delivery_metrics: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    response_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    personalization_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    compliance_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
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

  await queryInterface.addIndex('sms_messages', ['to_phone']);
  await queryInterface.addIndex('sms_messages', ['status']);
  await queryInterface.addIndex('sms_messages', ['type']);
  await queryInterface.addIndex('sms_messages', ['customer_id']);
  await queryInterface.addIndex('sms_messages', ['created_at']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('sms_messages');
}
```

## Quality Checklist

### Setup
- [ ] Twilio account created
- [ ] Phone number purchased
- [ ] API credentials configured
- [ ] Webhook URL set in Twilio console
- [ ] Messaging service configured (for high volume)

### Implementation
- [ ] E.164 phone number validation
- [ ] Segment calculation working
- [ ] Cost estimation accurate
- [ ] Status transitions enforced
- [ ] Personalization working

### Compliance
- [ ] Opt-out handling implemented (STOP keyword)
- [ ] Consent tracking enabled
- [ ] TCPA compliance verified
- [ ] Message content validated

### Tracking
- [ ] Webhook handler receiving status updates
- [ ] Delivery metrics recorded
- [ ] Analytics dashboard working

## Related Skills

- **email-notifications-standard** - Email notification patterns
- **realtime-updates-standard** - Real-time notification patterns
- **order-management-standard** - Order notification triggers
