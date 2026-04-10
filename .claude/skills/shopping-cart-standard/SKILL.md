---
name: shopping-cart-standard
description: Implement shopping cart with session persistence, guest support, pre-orders, and cart expiration. Use when building e-commerce carts, cart management, or add-to-cart functionality. Triggers on requests for shopping cart, cart persistence, cart management, or e-commerce basket.
---

# Shopping Cart Standard

Production-grade shopping cart implementation with session-based persistence, guest/user support, pre-order handling, bundle support, and cart expiration. Extracted from DreamiHairCare e-commerce platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SHOPPING CART SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐ │
│  │   Guest User    │    │ Authenticated   │    │   Admin Dashboard   │ │
│  │  (session-id)   │    │   User (UUID)   │    │   (cart stats)      │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────────┘ │
│           │                      │                      │               │
│           └──────────────────────┼──────────────────────┘               │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    GraphQL API Layer      │                        │
│                    │   ━━━━━━━━━━━━━━━━━━━━    │                        │
│                    │  Queries:                 │                        │
│                    │  • cart (sessionId/user)  │                        │
│                    │  • cartStats (admin)      │                        │
│                    │                           │                        │
│                    │  Mutations:               │                        │
│                    │  • addToCart              │                        │
│                    │  • addBundleToCart        │                        │
│                    │  • updateCartItem         │                        │
│                    │  • removeFromCart         │                        │
│                    │  • clearCart              │                        │
│                    │  • transferCartToUser     │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    Cart Model (JSONB)     │                        │
│                    │   ━━━━━━━━━━━━━━━━━━━━    │                        │
│                    │  • Session-based storage  │                        │
│                    │  • Items as JSONB array   │                        │
│                    │  • Guest → User transfer  │                        │
│                    │  • Pre-order support      │                        │
│                    │  • Expiration handling    │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │  PostgreSQL (carts)       │                        │
│                    └───────────────────────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Critical Patterns

### 1. Session-Based Cart Identification

```typescript
// CRITICAL: Always use sessionId as primary cart identifier
// This allows guest users to have carts without authentication

// Query pattern - sessionId OR userId
let cart: Cart | null = null;

if (sessionId) {
  cart = await Cart.findBySessionId(sessionId);
} else if (context.auth?.userId) {
  cart = await Cart.findByUserId(context.auth.userId);
}
```

### 2. Cart Type Enum (REQUIRED)

```typescript
export enum CartType {
  REGULAR = 'REGULAR',       // Only regular items
  PRE_ORDER = 'PRE_ORDER',   // Only pre-order items
  MIXED = 'MIXED',           // Both regular and pre-order
}
```

### 3. CartItem Interface (JSONB Storage)

```typescript
// Items stored as JSONB array for flexibility
export interface CartItem {
  id: string;                        // Generated unique ID
  productId: string;                 // Reference to Product
  productName: string;               // Denormalized for performance
  productSku: string;                // For display and tracking
  quantity: number;                  // Item quantity
  price: number;                     // Price at time of adding
  isPreOrder: boolean;               // Pre-order indicator
  preOrderReleaseDate?: Date;        // Expected release date
  image?: string;                    // Product image URL
  availabilityStatus: AvailabilityStatus;
  subtotal: number;                  // price * quantity (computed)
  bundleId?: string;                 // Optional bundle reference
  bundleName?: string;               // Bundle name for display
}
```

### 4. Guest to User Cart Transfer

```typescript
// CRITICAL: Handle guest to user cart transfer on login
async transferCartToUser(
  _: any,
  { sessionId, userId }: { sessionId: string; userId: string },
  context: any
) {
  // Verify authentication
  if (!context.auth?.userId || context.auth.userId !== userId) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }

  const guestCart = await Cart.findBySessionId(sessionId);
  if (!guestCart) throw new Error('Cart not found');

  // Check for existing user cart
  const userCart = await Cart.findByUserId(userId);

  if (userCart) {
    // Merge guest cart items into user cart
    for (const item of guestCart.items) {
      await userCart.addItem(item);
    }
    await guestCart.destroy();
    return userCart;
  } else {
    // Transfer guest cart to user
    await guestCart.transferToUser(userId);
    return guestCart;
  }
}
```

### 5. Inventory Reservation Pattern

```typescript
// CRITICAL: Reserve inventory when adding to cart (non-preorder only)
if (product.availabilityStatus !== 'PRE_ORDER' && product.trackInventory) {
  await product.reserveQuantity(quantity);
}

// Release on remove/clear
if (product.trackInventory && product.availabilityStatus !== 'PRE_ORDER') {
  await product.releaseReservedQuantity(item.quantity);
}
```

## Database Model

### Sequelize Model (Complete)

```typescript
// backend/src/models/Cart.ts
import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, BelongsTo, ForeignKey,
  BeforeCreate, BeforeUpdate,
} from 'sequelize-typescript';
import { User } from './User';
import { AvailabilityStatus } from './Product';

export enum CartType {
  REGULAR = 'REGULAR',
  PRE_ORDER = 'PRE_ORDER',
  MIXED = 'MIXED',
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  isPreOrder: boolean;
  preOrderReleaseDate?: Date;
  image?: string;
  availabilityStatus: AvailabilityStatus;
  subtotal: number;
  bundleId?: string;
  bundleName?: string;
}

interface CartMetadata {
  discountCode?: string;
  discountAmount?: number;
  notes?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestFirstName?: string;
  guestLastName?: string;
}

@Table({
  tableName: 'carts',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['sessionId'] },
    { fields: ['expiresAt'] },
    { fields: ['cartType'] },
  ],
})
export class Cart extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare userId?: string;

  @BelongsTo(() => User)
  declare user?: User;

  @Column({ type: DataType.STRING, allowNull: false })
  declare sessionId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  declare items: CartItem[];

  @Column({
    type: DataType.ENUM(...Object.values(CartType)),
    allowNull: false,
    defaultValue: CartType.REGULAR,
  })
  declare cartType: CartType;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {},
  })
  declare metadata: CartMetadata;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Virtual getters
  get itemCount(): number {
    return (this.items || []).reduce((total, item) => total + item.quantity, 0);
  }

  get subtotal(): number {
    return (this.items || []).reduce((total, item) => total + item.subtotal, 0);
  }

  get regularItems(): CartItem[] {
    return (this.items || []).filter(item => !item.isPreOrder);
  }

  get preOrderItems(): CartItem[] {
    return (this.items || []).filter(item => item.isPreOrder);
  }

  get hasPreOrderItems(): boolean {
    return this.preOrderItems.length > 0;
  }

  get hasRegularItems(): boolean {
    return this.regularItems.length > 0;
  }

  get isEmpty(): boolean {
    return (this.items || []).length === 0;
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isGuest(): boolean {
    return !this.userId;
  }

  get discountAmount(): number {
    return this.metadata.discountAmount || 0;
  }

  get discountCode(): string | undefined {
    return this.metadata.discountCode;
  }

  // Instance methods
  async addItem(item: Omit<CartItem, 'id' | 'subtotal'>): Promise<void> {
    if (!this.items) this.items = [];

    const existingIndex = this.items.findIndex(
      existing => existing.productId === item.productId && !existing.bundleId
    );

    const subtotal = item.price * item.quantity;

    if (existingIndex >= 0) {
      // Update existing item
      this.items[existingIndex].quantity += item.quantity;
      this.items[existingIndex].subtotal =
        this.items[existingIndex].price * this.items[existingIndex].quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subtotal,
      };
      this.items.push(newItem);
    }

    // CRITICAL: Mark JSONB field as changed
    this.changed('items', true);

    await this.updateCartType();
    await this.save();
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<boolean> {
    if (!this.items) this.items = [];

    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
      this.items[itemIndex].subtotal = this.items[itemIndex].price * quantity;
    }

    this.changed('items', true);
    await this.updateCartType();
    await this.save();
    return true;
  }

  async removeItem(itemId: string): Promise<boolean> {
    if (!this.items) this.items = [];

    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.items.splice(itemIndex, 1);
    this.changed('items', true);

    await this.updateCartType();
    await this.save();
    return true;
  }

  async clearCart(): Promise<void> {
    this.items = [];
    this.cartType = CartType.REGULAR;
    this.changed('items', true);
    await this.save();
  }

  async applyDiscount(code: string, amount: number): Promise<void> {
    this.metadata = { ...this.metadata, discountCode: code, discountAmount: amount };
    await this.save();
  }

  async removeDiscount(): Promise<void> {
    this.metadata = { ...this.metadata, discountCode: undefined, discountAmount: undefined };
    await this.save();
  }

  async updateMetadata(metadata: Partial<CartMetadata>): Promise<void> {
    this.metadata = { ...this.metadata, ...metadata };
    await this.save();
  }

  async transferToUser(userId: string): Promise<void> {
    this.userId = userId;
    await this.save();
  }

  async extendExpiry(hours: number = 24): Promise<void> {
    this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    await this.save();
  }

  private async updateCartType(): Promise<void> {
    const hasPreOrder = this.hasPreOrderItems;
    const hasRegular = this.hasRegularItems;

    if (hasPreOrder && hasRegular) {
      this.cartType = CartType.MIXED;
    } else if (hasPreOrder) {
      this.cartType = CartType.PRE_ORDER;
    } else {
      this.cartType = CartType.REGULAR;
    }
  }

  // Hooks
  @BeforeCreate
  static async setDefaultExpiry(instance: Cart) {
    if (!instance.expiresAt) {
      // 7 days for logged-in users, 24 hours for guests
      const hours = instance.userId ? 24 * 7 : 24;
      instance.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    }
  }

  // Static methods
  static async findBySessionId(sessionId: string): Promise<Cart | null> {
    const cart = await this.findOne({ where: { sessionId } });
    if (cart && !cart.items) {
      cart.items = [];
      cart.changed('items', true);
      await cart.save();
    }
    return cart;
  }

  static async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.findOne({ where: { userId } });
    if (cart && !cart.items) {
      cart.items = [];
      cart.changed('items', true);
      await cart.save();
    }
    return cart;
  }

  static async cleanupExpiredCarts(): Promise<number> {
    const { Op } = require('sequelize');
    return await this.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } }
    });
  }

  static async getCartStats(): Promise<{
    totalCarts: number;
    activeCarts: number;
    expiredCarts: number;
    guestCarts: number;
    userCarts: number;
    averageItemCount: number;
  }> {
    const carts = await this.findAll();
    const now = new Date();

    const totalCarts = carts.length;
    const activeCarts = carts.filter(cart => cart.expiresAt > now).length;
    const guestCarts = carts.filter(cart => !cart.userId).length;
    const averageItemCount = totalCarts > 0
      ? carts.reduce((sum, cart) => sum + cart.itemCount, 0) / totalCarts
      : 0;

    return {
      totalCarts,
      activeCarts,
      expiredCarts: totalCarts - activeCarts,
      guestCarts,
      userCarts: totalCarts - guestCarts,
      averageItemCount,
    };
  }
}
```

### Migration Script

```typescript
// backend/src/migrations/YYYYMMDDHHMMSS-create-carts-table.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    CREATE TYPE "cart_type" AS ENUM ('REGULAR', 'PRE_ORDER', 'MIXED');
  `);

  await queryInterface.createTable('carts', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    cart_type: {
      type: DataTypes.ENUM('REGULAR', 'PRE_ORDER', 'MIXED'),
      allowNull: false,
      defaultValue: 'REGULAR',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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

  await queryInterface.addIndex('carts', ['user_id']);
  await queryInterface.addIndex('carts', ['session_id']);
  await queryInterface.addIndex('carts', ['expires_at']);
  await queryInterface.addIndex('carts', ['cart_type']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('carts');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "cart_type";');
}
```

## GraphQL Schema

```graphql
# backend/src/graphql/schema/cart.graphql

enum CartType {
  REGULAR
  PRE_ORDER
  MIXED
}

type CartItem {
  id: ID!
  productId: String!
  productName: String!
  productSku: String!
  quantity: Int!
  price: Float!
  isPreOrder: Boolean!
  preOrderReleaseDate: String
  image: String
  availabilityStatus: String!
  subtotal: Float!
  bundleId: String
  bundleName: String
  product: Product
}

type CartMetadata {
  discountCode: String
  discountAmount: Float
  notes: String
  shippingAddressId: String
  billingAddressId: String
  guestEmail: String
  guestPhone: String
  guestFirstName: String
  guestLastName: String
}

type Cart {
  id: ID!
  userId: String
  sessionId: String!
  items: [CartItem!]!
  cartType: CartType!
  expiresAt: String!
  metadata: CartMetadata
  createdAt: String!
  updatedAt: String!

  # Computed fields
  user: User
  itemCount: Int!
  subtotal: Float!
  regularItems: [CartItem!]!
  preOrderItems: [CartItem!]!
  hasPreOrderItems: Boolean!
  hasRegularItems: Boolean!
  isEmpty: Boolean!
  isExpired: Boolean!
  isGuest: Boolean!
  discountAmount: Float!
  discountCode: String
}

type CartStats {
  totalCarts: Int!
  activeCarts: Int!
  expiredCarts: Int!
  guestCarts: Int!
  userCarts: Int!
  averageItemCount: Float!
}

# Input types
input AddToCartInput {
  productId: String!
  quantity: Int!
  bundleId: String
}

input AddBundleToCartInput {
  bundleId: String!
  quantity: Int!
}

input UpdateCartItemInput {
  quantity: Int!
}

input UpdateCartMetadataInput {
  discountCode: String
  discountAmount: Float
  notes: String
  shippingAddressId: String
  billingAddressId: String
  guestEmail: String
  guestPhone: String
  guestFirstName: String
  guestLastName: String
}

# Queries
type Query {
  cart(sessionId: String): Cart
  cartStats: CartStats!
}

# Mutations
type Mutation {
  addToCart(input: AddToCartInput!, sessionId: String!): Cart!
  addBundleToCart(input: AddBundleToCartInput!, sessionId: String!): Cart!
  updateCartItem(itemId: ID!, input: UpdateCartItemInput!, sessionId: String!): Cart!
  removeFromCart(itemId: ID!, sessionId: String!): Cart!
  clearCart(sessionId: String!): Boolean!
  updateCartMetadata(input: UpdateCartMetadataInput!, sessionId: String!): Cart!
  transferCartToUser(sessionId: String!, userId: String!): Cart!
}
```

## GraphQL Resolvers

```typescript
// backend/src/graphql/resolvers/cartResolvers.ts
import { Cart, CartType, CartItem } from '../../models/Cart';
import { Product, User } from '../../models';
import { GraphQLError } from 'graphql';

export const cartResolvers = {
  Query: {
    cart: async (_: any, { sessionId }: { sessionId?: string }, context: any) => {
      let cart: Cart | null = null;

      if (sessionId) {
        cart = await Cart.findBySessionId(sessionId);
      } else if (context.auth?.userId) {
        cart = await Cart.findByUserId(context.auth.userId);
      }

      if (!cart) return null;

      // Auto-cleanup expired carts
      if (cart.isExpired) {
        await cart.destroy();
        return null;
      }

      return cart;
    },

    cartStats: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return await Cart.getCartStats();
    },
  },

  Mutation: {
    addToCart: async (
      _: any,
      { input, sessionId }: { input: { productId: string; quantity: number }; sessionId: string },
      context: any
    ) => {
      const { productId, quantity } = input;

      // Find or create cart
      let cart = await Cart.findBySessionId(sessionId);

      if (!cart) {
        // Look up user UUID if authenticated
        let userUUID = null;
        if (context.auth?.userId) {
          const user = await User.findOne({ where: { clerkId: context.auth.userId } });
          if (user) userUUID = user.id;
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        cart = await Cart.create({
          sessionId,
          userId: userUUID,
          items: [],
          cartType: CartType.REGULAR,
          expiresAt: expiresAt.toISOString(),
          metadata: {}
        });
      }

      // Find product
      const product = await Product.findByPk(productId);
      if (!product) {
        return cart; // Return cart without adding invalid product
      }

      // Check availability
      if (product.status !== 'ACTIVE' || product.availabilityStatus === 'OUT_OF_STOCK') {
        return cart;
      }

      // Check inventory (skip for pre-orders)
      if (product.availabilityStatus !== 'PRE_ORDER' &&
          product.trackInventory &&
          product.inventory < quantity) {
        return cart;
      }

      // Check if item already exists
      const existingItem = (cart.items || []).find(item =>
        item.productId === productId && !item.bundleId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (product.availabilityStatus !== 'PRE_ORDER' &&
            product.trackInventory &&
            product.inventory < newQuantity) {
          throw new Error('Not enough stock available');
        }
        await cart.updateItemQuantity(existingItem.id, newQuantity);
      } else {
        await cart.addItem({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity,
          price: product.price,
          isPreOrder: product.availabilityStatus === 'PRE_ORDER',
          preOrderReleaseDate: product.preOrderReleaseDate,
          image: product.images?.[0],
          availabilityStatus: product.availabilityStatus
        });
      }

      // Reserve inventory (non-preorder only)
      if (product.availabilityStatus !== 'PRE_ORDER' && product.trackInventory) {
        await product.reserveQuantity(quantity);
      }

      // Reload and return
      return await Cart.findBySessionId(sessionId);
    },

    updateCartItem: async (
      _: any,
      { itemId, input, sessionId }: { itemId: string; input: { quantity: number }; sessionId: string },
      context: any
    ) => {
      const { quantity } = input;

      const cart = await Cart.findBySessionId(sessionId);
      if (!cart) throw new Error('Cart not found');

      const item = cart.items.find(i => i.id === itemId);
      if (!item) throw new Error('Cart item not found');

      const product = await Product.findByPk(item.productId);
      if (!product) throw new Error('Product not found');

      const quantityDiff = quantity - item.quantity;

      // Handle inventory reservation
      if (quantityDiff > 0 && product.availabilityStatus !== 'PRE_ORDER' && product.trackInventory) {
        if (product.inventory < quantityDiff) {
          throw new Error('Not enough stock available');
        }
        await product.reserveQuantity(quantityDiff);
      } else if (quantityDiff < 0 && product.availabilityStatus !== 'PRE_ORDER' && product.trackInventory) {
        await product.releaseReservedQuantity(Math.abs(quantityDiff));
      }

      await cart.updateItemQuantity(itemId, quantity);
      return await Cart.findByPk(cart.id);
    },

    removeFromCart: async (
      _: any,
      { itemId, sessionId }: { itemId: string; sessionId: string },
      context: any
    ) => {
      const cart = await Cart.findBySessionId(sessionId);
      if (!cart) throw new Error('Cart not found');

      const item = cart.items.find(i => i.id === itemId);
      if (!item) throw new Error('Cart item not found');

      // Release inventory
      const product = await Product.findByPk(item.productId);
      if (product && product.trackInventory && product.availabilityStatus !== 'PRE_ORDER') {
        await product.releaseReservedQuantity(item.quantity);
      }

      await cart.removeItem(itemId);
      return await Cart.findByPk(cart.id);
    },

    clearCart: async (_: any, { sessionId }: { sessionId: string }) => {
      const cart = await Cart.findBySessionId(sessionId);
      if (!cart) return true;

      // Release all inventory
      for (const item of cart.items) {
        const product = await Product.findByPk(item.productId);
        if (product && product.trackInventory && product.availabilityStatus !== 'PRE_ORDER') {
          await product.releaseReservedQuantity(item.quantity);
        }
      }

      await cart.clearCart();
      return true;
    },

    updateCartMetadata: async (
      _: any,
      { input, sessionId }: { input: any; sessionId: string }
    ) => {
      const cart = await Cart.findBySessionId(sessionId);
      if (!cart) throw new Error('Cart not found');

      await cart.updateMetadata(input);
      return await Cart.findByPk(cart.id);
    },

    transferCartToUser: async (
      _: any,
      { sessionId, userId }: { sessionId: string; userId: string },
      context: any
    ) => {
      if (!context.auth?.userId || context.auth.userId !== userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const guestCart = await Cart.findBySessionId(sessionId);
      if (!guestCart) throw new Error('Cart not found');

      const userCart = await Cart.findByUserId(userId);

      if (userCart) {
        // Merge carts
        for (const item of guestCart.items) {
          await userCart.addItem(item);
        }
        await guestCart.destroy();
        return userCart;
      } else {
        await guestCart.transferToUser(userId);
        return guestCart;
      }
    },
  },

  Cart: {
    user: async (parent: Cart) => {
      if (!parent.userId) return null;
      return await User.findByPk(parent.userId);
    },
    regularItems: (parent: Cart) => (parent.items || []).filter(i => !i.isPreOrder),
    preOrderItems: (parent: Cart) => (parent.items || []).filter(i => i.isPreOrder),
    hasPreOrderItems: (parent: Cart) => (parent.items || []).some(i => i.isPreOrder),
    hasRegularItems: (parent: Cart) => (parent.items || []).some(i => !i.isPreOrder),
    isEmpty: (parent: Cart) => parent.itemCount === 0,
    isExpired: (parent: Cart) => parent.expiresAt && new Date(parent.expiresAt) < new Date(),
    isGuest: (parent: Cart) => !parent.userId,
    discountAmount: (parent: Cart) => parent.discountAmount || parent.metadata?.discountAmount || 0,
    discountCode: (parent: Cart) => parent.discountCode || parent.metadata?.discountCode || null,
  },

  CartItem: {
    product: async (parent: CartItem) => await Product.findByPk(parent.productId),
  },
};
```

## Frontend Integration

### Session ID Generation

```typescript
// frontend/src/lib/session.ts
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'cart_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ID_KEY);
  }
}
```

### Apollo Client Queries/Mutations

```typescript
// frontend/src/graphql/cart.ts
import { gql } from '@apollo/client';

export const CART_FRAGMENT = gql`
  fragment CartFields on Cart {
    id
    sessionId
    items {
      id
      productId
      productName
      productSku
      quantity
      price
      isPreOrder
      preOrderReleaseDate
      image
      availabilityStatus
      subtotal
      bundleId
      bundleName
    }
    cartType
    itemCount
    subtotal
    hasPreOrderItems
    hasRegularItems
    isEmpty
    isExpired
    isGuest
    discountAmount
    discountCode
    expiresAt
  }
`;

export const GET_CART = gql`
  ${CART_FRAGMENT}
  query GetCart($sessionId: String) {
    cart(sessionId: $sessionId) {
      ...CartFields
    }
  }
`;

export const ADD_TO_CART = gql`
  ${CART_FRAGMENT}
  mutation AddToCart($input: AddToCartInput!, $sessionId: String!) {
    addToCart(input: $input, sessionId: $sessionId) {
      ...CartFields
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  ${CART_FRAGMENT}
  mutation UpdateCartItem($itemId: ID!, $input: UpdateCartItemInput!, $sessionId: String!) {
    updateCartItem(itemId: $itemId, input: $input, sessionId: $sessionId) {
      ...CartFields
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  ${CART_FRAGMENT}
  mutation RemoveFromCart($itemId: ID!, $sessionId: String!) {
    removeFromCart(itemId: $itemId, sessionId: $sessionId) {
      ...CartFields
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($sessionId: String!) {
    clearCart(sessionId: $sessionId)
  }
`;

export const TRANSFER_CART = gql`
  ${CART_FRAGMENT}
  mutation TransferCartToUser($sessionId: String!, $userId: String!) {
    transferCartToUser(sessionId: $sessionId, userId: $userId) {
      ...CartFields
    }
  }
`;
```

### useCart Hook

```typescript
// frontend/src/hooks/useCart.ts
'use client';

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect } from 'react';
import { getSessionId } from '@/lib/session';
import {
  GET_CART, ADD_TO_CART, UPDATE_CART_ITEM,
  REMOVE_FROM_CART, CLEAR_CART, TRANSFER_CART
} from '@/graphql/cart';

export function useCart() {
  const { userId, isSignedIn } = useAuth();
  const client = useApolloClient();
  const sessionId = getSessionId();

  const { data, loading, error, refetch } = useQuery(GET_CART, {
    variables: { sessionId },
    skip: !sessionId,
  });

  const [addToCartMutation, { loading: adding }] = useMutation(ADD_TO_CART);
  const [updateItemMutation, { loading: updating }] = useMutation(UPDATE_CART_ITEM);
  const [removeItemMutation, { loading: removing }] = useMutation(REMOVE_FROM_CART);
  const [clearCartMutation, { loading: clearing }] = useMutation(CLEAR_CART);
  const [transferCartMutation] = useMutation(TRANSFER_CART);

  // Transfer cart when user signs in
  useEffect(() => {
    if (isSignedIn && userId && sessionId && data?.cart?.isGuest) {
      transferCartMutation({
        variables: { sessionId, userId },
        refetchQueries: [{ query: GET_CART, variables: { sessionId } }],
      });
    }
  }, [isSignedIn, userId, sessionId, data?.cart?.isGuest]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    return addToCartMutation({
      variables: { input: { productId, quantity }, sessionId },
    });
  }, [addToCartMutation, sessionId]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    return updateItemMutation({
      variables: { itemId, input: { quantity }, sessionId },
    });
  }, [updateItemMutation, sessionId]);

  const removeItem = useCallback(async (itemId: string) => {
    return removeItemMutation({
      variables: { itemId, sessionId },
    });
  }, [removeItemMutation, sessionId]);

  const clearCart = useCallback(async () => {
    return clearCartMutation({
      variables: { sessionId },
      refetchQueries: [{ query: GET_CART, variables: { sessionId } }],
    });
  }, [clearCartMutation, sessionId]);

  return {
    cart: data?.cart || null,
    loading,
    error,
    refetch,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isUpdating: adding || updating || removing || clearing,
  };
}
```

## Quality Checklist

Before completing cart implementation, verify:

### Database
- [ ] Carts table created with JSONB items column
- [ ] Indexes on userId, sessionId, expiresAt, cartType
- [ ] Enum type created for CartType
- [ ] Foreign key to users table (nullable)

### Backend
- [ ] All GraphQL queries implemented
- [ ] All GraphQL mutations implemented
- [ ] Session-based cart lookup working
- [ ] Guest to user cart transfer working
- [ ] Inventory reservation on add/update
- [ ] Inventory release on remove/clear
- [ ] Cart expiration handling

### Frontend
- [ ] Session ID generation and persistence
- [ ] Cart query with sessionId
- [ ] Add to cart with optimistic updates
- [ ] Update quantity functionality
- [ ] Remove item functionality
- [ ] Cart transfer on login
- [ ] Loading and error states

### Testing
- [ ] Unit tests for model methods
- [ ] Integration tests for resolvers
- [ ] E2E tests for cart operations
- [ ] Guest → User transfer tests

## Related Skills

- **product-catalog-standard** - Product data for cart items
- **checkout-flow-standard** - Checkout process (uses cart)
- **order-management-standard** - Order creation from cart

## Version History

- **1.0.0** - Initial release with DreamiHairCare patterns
