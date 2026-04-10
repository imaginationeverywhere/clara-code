# Implement E-Commerce Stack

Implement a complete, production-grade e-commerce system following DreamiHairCare's battle-tested patterns. This command orchestrates all 5 e-commerce skills for a full-stack implementation.

## Command Usage

```
/implement-ecommerce [options]
```

### Options
- `--full` - Complete e-commerce stack (default)
- `--products-only` - Product catalog only
- `--cart-only` - Shopping cart only (requires products)
- `--checkout-only` - Checkout flow only (requires cart + payments)
- `--orders-only` - Order management only (requires checkout)
- `--audit` - Audit existing implementation against standards

### Mode Options
- `--with-stripe` - Include Stripe Connect setup (default: true)
- `--guest-checkout` - Enable guest checkout (default: true)
- `--pre-orders` - Enable pre-order support (default: false)
- `--subscriptions` - Enable subscription products (default: false)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         E-COMMERCE STACK                         │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js 16)                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Product  │ │ Shopping │ │ Checkout │ │  Order   │           │
│  │ Catalog  │ │   Cart   │ │   Flow   │ │ History  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                   │
│  ┌────┴────────────┴────────────┴────────────┴────┐             │
│  │              Apollo Client (GraphQL)            │             │
│  └─────────────────────┬───────────────────────────┘             │
├────────────────────────┼────────────────────────────────────────┤
│  BACKEND (Express.js)  │                                        │
│  ┌─────────────────────┴───────────────────────────┐            │
│  │              Apollo Server (GraphQL)            │            │
│  └─────────────────────┬───────────────────────────┘            │
│       │            │            │            │                   │
│  ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐ ┌────┴─────┐           │
│  │ Product  │ │   Cart   │ │ Checkout │ │  Order   │           │
│  │Resolvers │ │Resolvers │ │Resolvers │ │Resolvers │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                   │
│  ┌────┴────────────┴────────────┴────────────┴────┐             │
│  │         Sequelize ORM + PostgreSQL             │             │
│  └─────────────────────┬───────────────────────────┘             │
├────────────────────────┼────────────────────────────────────────┤
│  INTEGRATIONS          │                                        │
│  ┌─────────┐ ┌─────────┴─┐ ┌─────────┐ ┌─────────┐             │
│  │ Stripe  │ │  Shippo   │ │  Clerk  │ │SendGrid │             │
│  │ Connect │ │ Shipping  │ │  Auth   │ │ Emails  │             │
│  └─────────┘ └───────────┘ └─────────┘ └─────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Database Models (All 5 Skills)

Create all required database models in order:

```bash
# Create migrations in sequence
1. products (product-catalog-standard)
2. product_variants (product-catalog-standard)
3. product_images (product-catalog-standard)
4. categories (product-catalog-standard)
5. carts (shopping-cart-standard)
6. orders (order-management-standard)
7. order_items (order-management-standard)
8. stripe_accounts (stripe-connect-standard)
```

#### Product Model (product-catalog-standard)

```typescript
// Key enums
enum ProductStatus { ACTIVE, INACTIVE, DRAFT, ARCHIVED }
enum AvailabilityStatus { AVAILABLE, PRE_ORDER, OUT_OF_STOCK, DISCONTINUED }

// Critical fields
- sku: unique product identifier
- slug: URL-safe identifier
- basePrice: DECIMAL(10,2)
- salePrice: DECIMAL(10,2) nullable
- availabilityStatus: controls purchasability
- stockQuantity: inventory tracking
- lowStockThreshold: alerts
- metadata: JSONB for flexible data
```

#### Cart Model (shopping-cart-standard)

```typescript
// Key enums
enum CartType { REGULAR, PRE_ORDER, MIXED }

// Critical fields
- sessionId: for guest carts (unique constraint)
- userId: nullable for guest support
- items: JSONB array of CartItem
- subtotal: DECIMAL(10,2)
- expiresAt: cart expiration
```

#### Order Model (order-management-standard)

```typescript
// Key enums
enum OrderStatus { PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED }
enum PaymentStatus { PENDING, PROCESSING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED }
enum OrderType { REGULAR, PRE_ORDER, MIXED }

// Critical fields
- orderNumber: auto-generated unique
- items: JSONB array
- subtotal, tax, shippingCost, platformFee, total
- shippingAddress, billingAddress: JSONB
- Status timestamps: shippedAt, deliveredAt, cancelledAt
```

### Phase 2: GraphQL Schema

```graphql
# Combined E-Commerce Schema

# ============ PRODUCTS ============
enum ProductStatus { ACTIVE INACTIVE DRAFT ARCHIVED }
enum AvailabilityStatus { AVAILABLE PRE_ORDER OUT_OF_STOCK DISCONTINUED }

type Product {
  id: ID!
  sku: String!
  slug: String!
  name: String!
  description: String
  basePrice: Float!
  salePrice: Float
  currentPrice: Float!
  onSale: Boolean!
  status: ProductStatus!
  availabilityStatus: AvailabilityStatus!
  stockQuantity: Int!
  images: [ProductImage!]!
  category: Category
  variants: [ProductVariant!]!
  createdAt: DateTime!
}

type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

# ============ CART ============
enum CartType { REGULAR PRE_ORDER MIXED }

type Cart {
  id: ID!
  sessionId: String
  userId: ID
  items: [CartItem!]!
  itemCount: Int!
  subtotal: Float!
  cartType: CartType!
  hasPreOrderItems: Boolean!
  expiresAt: DateTime
}

type CartItem {
  productId: ID!
  variantId: ID
  quantity: Int!
  price: Float!
  name: String!
  image: String
  sku: String!
  isPreOrder: Boolean!
}

# ============ CHECKOUT ============
type CheckoutSession {
  cart: Cart!
  shippingOptions: [ShippingOption!]!
  feeBreakdown: FeeBreakdown!
  requiresShipping: Boolean!
}

type FeeBreakdown {
  subtotal: Float!
  shipping: Float!
  tax: Float!
  platformFee: Float!
  total: Float!
}

# ============ ORDERS ============
enum OrderStatus { PENDING PROCESSING SHIPPED DELIVERED CANCELLED REFUNDED }
enum PaymentStatus { PENDING PROCESSING PAID FAILED REFUNDED PARTIALLY_REFUNDED }

type Order {
  id: ID!
  orderNumber: String!
  status: OrderStatus!
  paymentStatus: PaymentStatus!
  items: [OrderItem!]!
  subtotal: Float!
  tax: Float!
  shippingCost: Float!
  platformFee: Float!
  total: Float!
  shippingAddress: Address!
  trackingNumber: String
  trackingUrl: String
  createdAt: DateTime!
  shippedAt: DateTime
  deliveredAt: DateTime
}

# ============ QUERIES ============
type Query {
  # Products
  product(id: ID, slug: String, sku: String): Product
  products(
    status: ProductStatus
    category: ID
    search: String
    first: Int
    after: String
  ): ProductConnection!

  # Cart
  cart(sessionId: String): Cart
  myCart: Cart

  # Checkout
  checkoutSession(cartId: ID!): CheckoutSession!

  # Orders
  order(id: ID!): Order
  myOrders(first: Int, after: String): OrderConnection!
}

# ============ MUTATIONS ============
type Mutation {
  # Products (Admin)
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  updateProductStatus(id: ID!, status: ProductStatus!): Product!
  updateInventory(id: ID!, quantity: Int!): Product!

  # Cart
  addToCart(input: AddToCartInput!): Cart!
  updateCartItem(input: UpdateCartItemInput!): Cart!
  removeFromCart(productId: ID!, variantId: ID): Cart!
  clearCart: Cart!
  transferGuestCart(sessionId: String!): Cart!

  # Checkout
  validateCheckout(cartId: ID!, shippingAddress: AddressInput!): CheckoutValidation!
  createOrder(input: CreateOrderInput!): Order!

  # Orders (Admin)
  updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  addTrackingInfo(id: ID!, trackingNumber: String!, carrier: String!): Order!
  cancelOrder(id: ID!, reason: String): Order!
  processRefund(id: ID!, amount: Float, reason: String): Order!
}
```

### Phase 3: Service Layer Integration

```typescript
// backend/src/services/ECommerceService.ts
import ProductService from './ProductService';
import CartService from './CartService';
import CheckoutService from './CheckoutService';
import OrderService from './OrderService';
import StripeService from './StripeService';

export class ECommerceService {
  /**
   * Complete checkout flow - orchestrates all services
   */
  static async processCheckout(
    cartId: string,
    input: CreateOrderInput,
    context: GraphQLContext
  ): Promise<Order> {
    // 1. Validate cart
    const cart = await CartService.getCart(cartId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty or not found');
    }

    // 2. Validate inventory
    await ProductService.validateInventory(cart.items);

    // 3. Calculate fees
    const feeBreakdown = await CheckoutService.calculateFees(
      cart,
      input.shippingAddress
    );

    // 4. Get or create user (guest checkout support)
    const user = await this.resolveUser(input, context);

    // 5. Create payment intent
    const paymentIntent = await StripeService.createPaymentIntent(
      Math.round(feeBreakdown.total * 100),
      'usd',
      input.businessStripeAccountId,
      user.stripeCustomerId,
      { cartId, userId: user.id }
    );

    // 6. Create order
    const order = await OrderService.createOrder({
      userId: user.id,
      businessId: input.businessId,
      items: cart.items,
      ...feeBreakdown,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress || input.shippingAddress,
      stripePaymentIntentId: paymentIntent.id,
    });

    // 7. Reserve inventory
    await ProductService.reserveInventory(cart.items);

    // 8. Clear cart
    await CartService.clearCart(cartId);

    return order;
  }

  /**
   * Handle guest checkout - create user if needed
   */
  private static async resolveUser(
    input: CreateOrderInput,
    context: GraphQLContext
  ): Promise<User> {
    if (context.auth?.userId) {
      return User.findByPk(context.auth.userId);
    }

    if (!input.guestUser) {
      throw new Error('Guest information required for guest checkout');
    }

    // Check for existing user
    let user = await User.findOne({
      where: { email: input.guestUser.email }
    });

    if (!user) {
      user = await User.create({
        firstName: input.guestUser.firstName,
        lastName: input.guestUser.lastName,
        email: input.guestUser.email,
        phone: input.guestUser.phone,
        role: 'CUSTOMER',
        metadata: { source: 'guest_checkout' }
      });
    }

    return user;
  }
}
```

### Phase 4: Frontend Implementation

#### Product Listing Page

```typescript
// frontend/src/app/products/page.tsx
'use client';

import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';

export default function ProductsPage() {
  const {
    products,
    loading,
    hasMore,
    loadMore,
    filters,
    setFilters
  } = useProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-64 shrink-0">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
          />
        </aside>
        <main className="flex-1">
          <ProductGrid
            products={products}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </main>
      </div>
    </div>
  );
}
```

#### Shopping Cart Component

```typescript
// frontend/src/components/cart/ShoppingCart.tsx
'use client';

import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

export function ShoppingCart() {
  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  if (loading) return <CartSkeleton />;
  if (!cart || cart.items.length === 0) return <EmptyCart />;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {cart.items.map((item) => (
          <CartItem
            key={`${item.productId}-${item.variantId || ''}`}
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.productId, qty, item.variantId)}
            onRemove={() => removeItem(item.productId, item.variantId)}
          />
        ))}
      </div>
      <aside>
        <CartSummary
          subtotal={cart.subtotal}
          itemCount={cart.itemCount}
          hasPreOrderItems={cart.hasPreOrderItems}
        />
      </aside>
    </div>
  );
}
```

#### Checkout Flow

```typescript
// frontend/src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderReview } from '@/components/checkout/OrderReview';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const {
    cart,
    shippingAddress,
    setShippingAddress,
    feeBreakdown,
    createOrder,
    loading
  } = useCheckout();

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps currentStep={step} />

      <div className="mt-8">
        {step === 'shipping' && (
          <ShippingForm
            onSubmit={(address) => {
              setShippingAddress(address);
              setStep('payment');
            }}
          />
        )}

        {step === 'payment' && (
          <PaymentForm
            amount={feeBreakdown.total}
            onSuccess={() => setStep('review')}
            onBack={() => setStep('shipping')}
          />
        )}

        {step === 'review' && (
          <OrderReview
            cart={cart}
            shippingAddress={shippingAddress}
            feeBreakdown={feeBreakdown}
            onConfirm={createOrder}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
```

#### Order History

```typescript
// frontend/src/app/orders/page.tsx
'use client';

import { useMyOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderFilters } from '@/components/orders/OrderFilters';

export default function OrdersPage() {
  const { orders, loading, hasMore, loadMore } = useMyOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-3 bg-gray-100 rounded-lg"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}
```

### Phase 5: Admin Dashboard Integration

```typescript
// frontend/src/app/admin/orders/page.tsx
'use client';

import { useAdminOrders } from '@/hooks/admin/useOrders';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import { OrderStats } from '@/components/admin/orders/OrderStats';

export default function AdminOrdersPage() {
  const {
    orders,
    stats,
    filters,
    setFilters,
    updateStatus,
    addTracking
  } = useAdminOrders();

  return (
    <div className="space-y-6">
      <OrderStats stats={stats} />
      <OrderFilters filters={filters} onChange={setFilters} />
      <OrdersTable
        orders={orders}
        onUpdateStatus={updateStatus}
        onAddTracking={addTracking}
      />
    </div>
  );
}
```

## Environment Variables

```bash
# Backend (.env)
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Platform Config
PLATFORM_FEE_PERCENTAGE=0.07
PLATFORM_NAME=Quik Nation

# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

## Migration Sequence

Run migrations in this exact order:

```bash
# 1. Core product tables
npx sequelize-cli db:migrate --name create-categories
npx sequelize-cli db:migrate --name create-products
npx sequelize-cli db:migrate --name create-product-variants
npx sequelize-cli db:migrate --name create-product-images

# 2. Cart tables
npx sequelize-cli db:migrate --name create-carts

# 3. Order tables
npx sequelize-cli db:migrate --name create-orders
npx sequelize-cli db:migrate --name create-order-items

# 4. Stripe tables
npx sequelize-cli db:migrate --name create-stripe-accounts
```

## Verification Checklist

### Products
- [ ] Create product with variants
- [ ] Update inventory
- [ ] Search and filter products
- [ ] Product detail page loads

### Cart
- [ ] Add to cart (guest)
- [ ] Add to cart (authenticated)
- [ ] Update quantity
- [ ] Remove item
- [ ] Transfer guest cart on login
- [ ] Cart persists across sessions

### Checkout
- [ ] Guest checkout flow
- [ ] Authenticated checkout
- [ ] Address validation
- [ ] Fee calculation correct
- [ ] Payment processing
- [ ] Order creation

### Orders
- [ ] Order confirmation email
- [ ] Order history displays
- [ ] Status updates work
- [ ] Tracking info shows
- [ ] Admin can manage orders

### Payments
- [ ] Stripe Connect onboarding
- [ ] Platform fee deducted
- [ ] Webhook processing
- [ ] Refunds work

## Related Skills

- **product-catalog-standard** - Product management patterns
- **shopping-cart-standard** - Cart implementation details
- **checkout-flow-standard** - Checkout process patterns
- **order-management-standard** - Order lifecycle management
- **stripe-connect-standard** - Payment processing

## Security Requirements

- [ ] All mutations require authentication check
- [ ] Admin endpoints verify admin role
- [ ] Stripe webhooks verify signatures
- [ ] Guest checkout validates email format
- [ ] Inventory validation server-side
- [ ] Price calculations server-side only
- [ ] SQL injection prevention via ORM
- [ ] XSS prevention in product display
