---
name: order-management-standard
description: Implement order management with status tracking, shipping, payment reconciliation, and fulfillment. Use when building e-commerce order systems, fulfillment workflows, or order tracking. Triggers on requests for order management, order tracking, fulfillment, or e-commerce orders.
---

# Order Management Standard

Production-grade order management system with status tracking, shipping integration, payment reconciliation, notifications, and fulfillment workflows. Extracted from DreamiHairCare e-commerce platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ORDER MANAGEMENT SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      ORDER LIFECYCLE                              │ │
│  │                                                                   │ │
│  │  [PENDING] → [PROCESSING] → [SHIPPED] → [DELIVERED]              │ │
│  │      ↓           ↓             ↓            ↓                     │ │
│  │  [CANCELLED] [CANCELLED]   [RETURNED]   [REFUNDED]               │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐ │
│  │  Admin Panel    │    │  Customer View  │    │   Notifications     │ │
│  │  - Order list   │    │  - Order status │    │   - SMS/Email       │ │
│  │  - Status mgmt  │    │  - Tracking     │    │   - Slack alerts    │ │
│  │  - Shipping     │    │  - Order history│    │   - Webhooks        │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────────┘ │
│           │                      │                      │               │
│           └──────────────────────┼──────────────────────┘               │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    GraphQL API Layer      │                        │
│                    │   ━━━━━━━━━━━━━━━━━━━━    │                        │
│                    │                           │                        │
│                    │  Queries:                 │                        │
│                    │  • orders (paginated)     │                        │
│                    │  • order (single)         │                        │
│                    │  • ordersByStatus         │                        │
│                    │  • myOrders (customer)    │                        │
│                    │                           │                        │
│                    │  Mutations:               │                        │
│                    │  • updateOrderStatus      │                        │
│                    │  • updateOrderShipping    │                        │
│                    │  • addOrderTracking       │                        │
│                    │  • cancelOrder            │                        │
│                    │  • refundOrder            │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│         ┌────────────────────────┼────────────────────────┐             │
│         │                        │                        │             │
│  ┌──────┴──────┐    ┌────────────┴────────────┐    ┌──────┴──────┐     │
│  │   Order     │    │    Shipping Service     │    │   Payment   │     │
│  │   Model     │    │   (Shippo/Labels)       │    │   Service   │     │
│  └─────────────┘    └─────────────────────────┘    └─────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Critical Patterns

### 1. Order Status Enums (REQUIRED)

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',       // Order created, awaiting payment
  PROCESSING = 'PROCESSING', // Payment confirmed, preparing
  SHIPPED = 'SHIPPED',       // Shipped, has tracking
  DELIVERED = 'DELIVERED',   // Customer received
  CANCELLED = 'CANCELLED',   // Cancelled before shipping
  REFUNDED = 'REFUNDED',     // Refunded after delivery
}

export enum PaymentStatus {
  PENDING = 'PENDING',       // Awaiting payment
  PAID = 'PAID',             // Payment received
  COMPLETED = 'COMPLETED',   // Payment fully processed
  FAILED = 'FAILED',         // Payment failed
  REFUNDED = 'REFUNDED',     // Full/partial refund
}

export enum OrderType {
  REGULAR = 'REGULAR',       // Standard items
  PRE_ORDER = 'PRE_ORDER',   // All pre-order items
  MIXED = 'MIXED',           // Both regular and pre-order
}
```

### 2. Authentication Pattern (CRITICAL)

```typescript
// EVERY admin mutation MUST check auth
if (!context.auth?.userId) {
  throw new GraphQLError('Authentication required', {
    extensions: { code: 'UNAUTHENTICATED' }
  });
}
```

### 3. Status Update with Timestamps

```typescript
// CRITICAL: Update timestamps when status changes
async updateStatus(newStatus: OrderStatus): Promise<void> {
  const oldStatus = this.status;
  this.status = newStatus;

  switch (newStatus) {
    case OrderStatus.SHIPPED:
      this.shippedAt = new Date();
      break;
    case OrderStatus.DELIVERED:
      this.deliveredAt = new Date();
      break;
    case OrderStatus.CANCELLED:
      this.cancelledAt = new Date();
      break;
  }

  await this.save();

  // Send notifications
  await this.sendStatusUpdateNotifications(oldStatus, newStatus);
}
```

### 4. Order Number Generation

```typescript
// Unique order number: DHC-YYYYMMDD-XXXXX
@BeforeCreate
static async generateOrderNumber(instance: Order) {
  const date = new Date();
  const prefix = 'DHC'; // Site prefix
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  instance.orderNumber = `${prefix}-${dateStr}-${random}`;
}
```

## Database Model

### Sequelize Model (Complete)

```typescript
// backend/src/models/Order.ts
import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  BelongsTo, ForeignKey, BeforeCreate,
} from 'sequelize-typescript';
import { User } from './User';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  REGULAR = 'REGULAR',
  PRE_ORDER = 'PRE_ORDER',
  MIXED = 'MIXED',
}

export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

@Table({
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['orderNumber'], unique: true },
    { fields: ['customerId'] },
    { fields: ['status'] },
    { fields: ['paymentStatus'] },
    { fields: ['createdAt'] },
    { fields: ['orderType'] },
    { fields: ['shippingCarrier'] },
    { fields: ['tracking'] },
  ],
})
export class Order extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare orderNumber: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare customerId: string;

  @BelongsTo(() => User, { foreignKey: 'customerId', as: 'customer' })
  customer?: User;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  })
  declare status: OrderStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  declare paymentStatus: PaymentStatus;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare items: OrderItem[];

  @Column({ type: DataType.JSONB, allowNull: false })
  declare shippingAddress: Address;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare billingAddress: Address;

  // Financial fields
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } })
  declare subtotal: number;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: false, defaultValue: 0 })
  declare shipping: number;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: false, defaultValue: 0 })
  declare tax: number;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: false, defaultValue: 0 })
  declare discount: number;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: false, defaultValue: 0 })
  declare platformFee: number;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: false, defaultValue: 0 })
  declare stripeFee: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare total: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare paymentMethod: string;

  // Tracking and shipping
  @Column({ type: DataType.STRING, allowNull: true })
  declare tracking?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare trackingUrl?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare shippingCarrier?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare shippingService?: string;

  // Stripe/Shippo integration
  @Column({ type: DataType.STRING, allowNull: true })
  declare paymentIntentId?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare shippoShipmentId?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare shippoRateId?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare shippoLabelUrl?: string;

  // Order type and pre-order
  @Column({
    type: DataType.ENUM(...Object.values(OrderType)),
    allowNull: false,
    defaultValue: OrderType.REGULAR,
  })
  declare orderType: OrderType;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare preOrderItems?: OrderItem[];

  @Column({ type: DataType.DATE, allowNull: true })
  declare estimatedFulfillmentDate?: Date;

  // Flat rate shipping
  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true })
  declare flatRateCharged?: number;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true })
  declare actualShippingCost?: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare usedFlatRate: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare deliverySpeedSelected?: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare deliveryDeadline?: Date;

  // Timestamps
  @Column({ type: DataType.DATE, allowNull: true })
  declare shippedAt?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare deliveredAt?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare cancelledAt?: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes?: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare metadata?: Record<string, any>;

  // Virtual fields
  get itemCount(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  get isShippable(): boolean {
    return [OrderStatus.PENDING, OrderStatus.PROCESSING].includes(this.status);
  }

  get isCancellable(): boolean {
    return [OrderStatus.PENDING, OrderStatus.PROCESSING].includes(this.status);
  }

  get isRefundable(): boolean {
    return this.paymentStatus === PaymentStatus.PAID &&
           [OrderStatus.DELIVERED, OrderStatus.SHIPPED].includes(this.status);
  }

  get isPreOrder(): boolean {
    return this.orderType === OrderType.PRE_ORDER;
  }

  get shippingMargin(): number {
    if (!this.flatRateCharged || !this.actualShippingCost) return 0;
    return this.flatRateCharged - this.actualShippingCost;
  }

  get siteOwnerAmount(): number {
    return this.subtotal + this.shipping + this.tax - this.discount;
  }

  // Instance methods
  async updateStatus(newStatus: OrderStatus): Promise<void> {
    const oldStatus = this.status;
    this.status = newStatus;

    switch (newStatus) {
      case OrderStatus.SHIPPED:
        this.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        this.deliveredAt = new Date();
        break;
      case OrderStatus.CANCELLED:
        this.cancelledAt = new Date();
        break;
    }

    await this.save();
  }

  async addTracking(trackingNumber: string): Promise<void> {
    this.tracking = trackingNumber;
    if (this.status === OrderStatus.PROCESSING) {
      await this.updateStatus(OrderStatus.SHIPPED);
    }
    await this.save();
  }

  async updateShippingInfo(
    carrier: string,
    service: string,
    trackingNumber?: string,
    trackingUrl?: string
  ): Promise<void> {
    this.shippingCarrier = carrier;
    this.shippingService = service;
    if (trackingNumber) this.tracking = trackingNumber;
    if (trackingUrl) this.trackingUrl = trackingUrl;
    await this.save();
  }

  async updatePaymentStatus(newStatus: PaymentStatus): Promise<void> {
    this.paymentStatus = newStatus;
    await this.save();
  }

  // Hooks
  @BeforeCreate
  static async generateOrderNumber(instance: Order) {
    const date = new Date();
    const prefix = process.env.ORDER_PREFIX || 'ORD';
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    instance.orderNumber = `${prefix}-${dateStr}-${random}`;
  }

  // Static methods
  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.findOne({ where: { orderNumber } });
  }

  static async findByCustomer(customerId: string): Promise<Order[]> {
    return this.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.findAll({
      where: { status },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getPendingOrders(): Promise<Order[]> {
    return this.getOrdersByStatus(OrderStatus.PENDING);
  }

  static async getProcessingOrders(): Promise<Order[]> {
    return this.getOrdersByStatus(OrderStatus.PROCESSING);
  }
}
```

### Migration Script

```typescript
// backend/src/migrations/YYYYMMDDHHMMSS-create-orders-table.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create enum types
  await queryInterface.sequelize.query(`
    CREATE TYPE "order_status" AS ENUM (
      'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    );
  `);

  await queryInterface.sequelize.query(`
    CREATE TYPE "payment_status" AS ENUM (
      'PENDING', 'PAID', 'COMPLETED', 'FAILED', 'REFUNDED'
    );
  `);

  await queryInterface.sequelize.query(`
    CREATE TYPE "order_type" AS ENUM ('REGULAR', 'PRE_ORDER', 'MIXED');
  `);

  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'COMPLETED', 'FAILED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    billing_address: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shipping: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    platform_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stripe_fee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tracking: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tracking_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipping_carrier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipping_service: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippo_shipment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippo_rate_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippo_label_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order_type: {
      type: DataTypes.ENUM('REGULAR', 'PRE_ORDER', 'MIXED'),
      allowNull: false,
      defaultValue: 'REGULAR',
    },
    pre_order_items: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    estimated_fulfillment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    flat_rate_charged: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    actual_shipping_cost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    used_flat_rate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delivery_speed_selected: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    delivery_deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Create indexes
  await queryInterface.addIndex('orders', ['order_number'], { unique: true });
  await queryInterface.addIndex('orders', ['customer_id']);
  await queryInterface.addIndex('orders', ['status']);
  await queryInterface.addIndex('orders', ['payment_status']);
  await queryInterface.addIndex('orders', ['created_at']);
  await queryInterface.addIndex('orders', ['order_type']);
  await queryInterface.addIndex('orders', ['shipping_carrier']);
  await queryInterface.addIndex('orders', ['tracking']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('orders');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "order_status";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "payment_status";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "order_type";');
}
```

## GraphQL Schema

```graphql
# backend/src/graphql/schema/order.graphql

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  COMPLETED
  FAILED
  REFUNDED
}

enum OrderType {
  REGULAR
  PRE_ORDER
  MIXED
}

type Address {
  street: String!
  street2: String
  city: String!
  state: String!
  zipCode: String!
  country: String!
}

type OrderItem {
  id: ID!
  productId: String!
  productName: String!
  productSku: String
  quantity: Int!
  price: Float!
  subtotal: Float!
}

type Order {
  id: ID!
  orderNumber: String!
  customerId: String!
  customer: User
  status: OrderStatus!
  paymentStatus: PaymentStatus!
  items: [OrderItem!]!
  shippingAddress: Address!
  billingAddress: Address!
  subtotal: Float!
  shipping: Float!
  tax: Float!
  discount: Float!
  platformFee: Float!
  stripeFee: Float!
  total: Float!
  paymentMethod: String!
  paymentIntentId: String
  tracking: String
  trackingUrl: String
  shippingCarrier: String
  shippingService: String
  shippoLabelUrl: String
  orderType: OrderType!
  preOrderItems: [OrderItem!]
  estimatedFulfillmentDate: String
  flatRateCharged: Float
  actualShippingCost: Float
  usedFlatRate: Boolean!
  deliverySpeedSelected: String
  deliveryDeadline: String
  shippedAt: String
  deliveredAt: String
  cancelledAt: String
  notes: String
  createdAt: String!
  updatedAt: String!

  # Computed fields
  itemCount: Int!
  isShippable: Boolean!
  isCancellable: Boolean!
  isRefundable: Boolean!
  isPreOrder: Boolean!
  shippingMargin: Float
  siteOwnerAmount: Float!
}

type PaginatedOrders {
  nodes: [Order!]!
  pageInfo: PageInfo!
}

# Input types
input OrderFilterInput {
  status: OrderStatus
  paymentStatus: PaymentStatus
  orderType: OrderType
  search: String
  dateRange: DateRangeInput
  customerId: String
}

input DateRangeInput {
  start: String!
  end: String!
}

input UpdateOrderStatusInput {
  status: OrderStatus!
  notes: String
}

input UpdateOrderShippingInput {
  carrier: String!
  service: String!
  trackingNumber: String
  trackingUrl: String
}

# Queries
type Query {
  orders(
    filter: OrderFilterInput
    sort: SortInput
    page: Int
    limit: Int
  ): PaginatedOrders!

  order(id: ID!): Order

  orderByNumber(orderNumber: String!): Order

  myOrders(page: Int, limit: Int): PaginatedOrders!

  orderStats: OrderStats!

  pendingOrders: [Order!]!

  processingOrders: [Order!]!

  shippedOrders(
    filter: ShippedOrderFilterInput
    sort: SortInput
    page: Int
    limit: Int
  ): PaginatedOrders!
}

# Mutations
type Mutation {
  updateOrderStatus(id: ID!, input: UpdateOrderStatusInput!): Order!

  updateOrderShipping(id: ID!, input: UpdateOrderShippingInput!): Order!

  addOrderTracking(id: ID!, tracking: String!): Order!

  cancelOrder(id: ID!): Order!

  refundOrder(id: ID!, amount: Float, reason: String): Order!

  markOrderDelivered(id: ID!): Order!

  updateOrderNotes(id: ID!, notes: String!): Order!
}

type OrderStats {
  totalOrders: Int!
  pendingOrders: Int!
  processingOrders: Int!
  shippedOrders: Int!
  deliveredOrders: Int!
  cancelledOrders: Int!
  totalRevenue: Float!
  averageOrderValue: Float!
}
```

## GraphQL Resolvers

```typescript
// backend/src/graphql/resolvers/orderResolvers.ts
import { Order, OrderStatus, PaymentStatus, User } from '../../models';
import { Op } from 'sequelize';
import { GraphQLError } from 'graphql';

export const orderResolvers = {
  Query: {
    orders: async (
      _: any,
      { filter, sort, page = 1, limit = 10 }: any,
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const offset = (page - 1) * limit;
      const where: any = {};

      if (filter?.status) where.status = filter.status;
      if (filter?.paymentStatus) where.paymentStatus = filter.paymentStatus;
      if (filter?.orderType) where.orderType = filter.orderType;
      if (filter?.customerId) where.customerId = filter.customerId;

      if (filter?.search) {
        where[Op.or] = [
          { orderNumber: { [Op.iLike]: `%${filter.search}%` } },
          { '$customer.firstName$': { [Op.iLike]: `%${filter.search}%` } },
          { '$customer.lastName$': { [Op.iLike]: `%${filter.search}%` } },
          { '$customer.email$': { [Op.iLike]: `%${filter.search}%` } },
        ];
      }

      if (filter?.dateRange) {
        where.createdAt = {
          [Op.between]: [new Date(filter.dateRange.start), new Date(filter.dateRange.end)]
        };
      }

      const order = sort?.field
        ? [[sort.field, sort.direction || 'DESC']]
        : [['createdAt', 'DESC']];

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }],
        order,
        limit,
        offset,
      });

      return {
        nodes: rows,
        pageInfo: {
          page, limit, total: count,
          pages: Math.ceil(count / limit),
          hasNext: offset + limit < count,
          hasPrev: page > 1,
        }
      };
    },

    order: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      return await Order.findByPk(id, {
        include: [{ model: User, as: 'customer' }]
      });
    },

    orderByNumber: async (_: any, { orderNumber }: { orderNumber: string }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      return await Order.findByOrderNumber(orderNumber);
    },

    myOrders: async (_: any, { page = 1, limit = 10 }: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const user = await User.findOne({ where: { clerkId: context.auth.userId } });
      if (!user) throw new Error('User not found');

      const offset = (page - 1) * limit;

      const { count, rows } = await Order.findAndCountAll({
        where: { customerId: user.id },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        nodes: rows,
        pageInfo: {
          page, limit, total: count,
          pages: Math.ceil(count / limit),
          hasNext: offset + limit < count,
          hasPrev: page > 1,
        }
      };
    },

    orderStats: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const [total, pending, processing, shipped, delivered, cancelled] = await Promise.all([
        Order.count(),
        Order.count({ where: { status: OrderStatus.PENDING } }),
        Order.count({ where: { status: OrderStatus.PROCESSING } }),
        Order.count({ where: { status: OrderStatus.SHIPPED } }),
        Order.count({ where: { status: OrderStatus.DELIVERED } }),
        Order.count({ where: { status: OrderStatus.CANCELLED } }),
      ]);

      const orders = await Order.findAll({ attributes: ['total'] });
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const averageOrderValue = total > 0 ? totalRevenue / total : 0;

      return {
        totalOrders: total,
        pendingOrders: pending,
        processingOrders: processing,
        shippedOrders: shipped,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,
        totalRevenue,
        averageOrderValue,
      };
    },

    pendingOrders: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return await Order.getPendingOrders();
    },

    processingOrders: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return await Order.getProcessingOrders();
    },
  },

  Mutation: {
    updateOrderStatus: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'ORDER_NOT_FOUND' }
        });
      }

      await order.updateStatus(input.status);

      if (input.notes) {
        order.notes = input.notes;
        await order.save();
      }

      return order;
    },

    updateOrderShipping: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'ORDER_NOT_FOUND' }
        });
      }

      await order.updateShippingInfo(
        input.carrier,
        input.service,
        input.trackingNumber,
        input.trackingUrl
      );

      return order;
    },

    addOrderTracking: async (
      _: any,
      { id, tracking }: { id: string; tracking: string },
      context: any
    ) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findByPk(id);
      if (!order) throw new Error('Order not found');

      await order.addTracking(tracking);
      return order;
    },

    cancelOrder: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findByPk(id);
      if (!order) throw new Error('Order not found');

      if (!order.isCancellable) {
        throw new Error('Order cannot be cancelled in current status');
      }

      await order.updateStatus(OrderStatus.CANCELLED);
      return order;
    },

    markOrderDelivered: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findByPk(id);
      if (!order) throw new Error('Order not found');

      await order.updateStatus(OrderStatus.DELIVERED);
      return order;
    },
  },

  Order: {
    customer: async (parent: Order) => {
      if (parent.customer) return parent.customer;
      return await User.findByPk(parent.customerId);
    },
    itemCount: (parent: Order) => parent.itemCount,
    isShippable: (parent: Order) => parent.isShippable,
    isCancellable: (parent: Order) => parent.isCancellable,
    isRefundable: (parent: Order) => parent.isRefundable,
    isPreOrder: (parent: Order) => parent.isPreOrder,
    shippingMargin: (parent: Order) => parent.shippingMargin,
    siteOwnerAmount: (parent: Order) => parent.siteOwnerAmount,
  },
};
```

## Environment Variables

```bash
# Order Configuration
ORDER_PREFIX=ORD             # Prefix for order numbers

# Shipping Integration
SHIPPO_API_KEY=your_key      # For label generation
SHIPPO_WEBHOOK_SECRET=secret # Webhook verification

# Notifications
SLACK_WEBHOOK_URL=your_url   # Order notifications
TWILIO_ACCOUNT_SID=your_sid  # SMS notifications
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Quality Checklist

Before completing order management implementation, verify:

### Database
- [ ] Orders table created with all fields
- [ ] Indexes on orderNumber, customerId, status, paymentStatus
- [ ] Enum types for OrderStatus, PaymentStatus, OrderType
- [ ] Foreign key to users table

### Backend
- [ ] All GraphQL queries implemented
- [ ] All GraphQL mutations implemented
- [ ] Authentication on all admin endpoints
- [ ] Status transitions update timestamps
- [ ] Order number auto-generation
- [ ] Notification triggers on status change

### Frontend
- [ ] Order list with pagination and filtering
- [ ] Order detail page
- [ ] Status update interface
- [ ] Tracking information display
- [ ] Customer order history view

### Notifications
- [ ] Email on order confirmation
- [ ] SMS on shipped status
- [ ] Slack alerts for admin
- [ ] Email on delivery

## Related Skills

- **checkout-flow-standard** - Order creation
- **stripe-connect-standard** - Payment processing
- **shipping-integration** - Shippo/label generation

## Version History

- **1.0.0** - Initial release with DreamiHairCare patterns
