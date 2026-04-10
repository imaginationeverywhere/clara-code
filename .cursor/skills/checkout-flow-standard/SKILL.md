---
name: checkout-flow-standard
description: Implement e-commerce checkout with guest support, shipping rates, address validation, and payment processing. Use when building checkout pages, payment flows, or order creation. Triggers on requests for checkout flow, payment integration, shipping selection, or order completion.
---

# Checkout Flow Standard

Production-grade checkout flow implementation with guest checkout support, shipping rate selection, address validation, fee calculation, and order creation. Extracted from DreamiHairCare e-commerce platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT FLOW SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    MULTI-STEP CHECKOUT WIZARD                     │ │
│  │                                                                   │ │
│  │  [1. Cart Review] → [2. Shipping] → [3. Payment] → [4. Confirm]  │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    GraphQL API Layer      │                        │
│                    │   ━━━━━━━━━━━━━━━━━━━━    │                        │
│                    │                           │                        │
│                    │  Checkout:                │                        │
│                    │  • createOrder            │                        │
│                    │  • validateAddress        │                        │
│                    │  • getShippingRates       │                        │
│                    │  • createPaymentIntent    │                        │
│                    │                           │                        │
│                    │  Addresses:               │                        │
│                    │  • createAddress          │                        │
│                    │  • shippingAddresses      │                        │
│                    │                           │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│         ┌────────────────────────┼────────────────────────┐             │
│         │                        │                        │             │
│  ┌──────┴──────┐    ┌────────────┴────────────┐    ┌──────┴──────┐     │
│  │   Cart      │    │    Shipping Service     │    │   Stripe    │     │
│  │   Model     │    │   (Flat Rate / Shippo)  │    │   Connect   │     │
│  └─────────────┘    └─────────────────────────┘    └─────────────┘     │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    FEE CALCULATION ENGINE                         │ │
│  │                                                                   │ │
│  │  subtotal + shipping + tax - discount + platformFee + stripeFee   │ │
│  │                              ↓                                    │ │
│  │                          TOTAL                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Critical Patterns

### 1. Guest Checkout Support (CRITICAL)

```typescript
// ALLOW both authenticated users AND guest orders
const isGuestOrder = !context.auth?.userId && input.guestUser;

if (!context.auth?.userId && !isGuestOrder) {
  throw new GraphQLError('Authentication required or guest user info required', {
    extensions: { code: 'UNAUTHENTICATED' }
  });
}

// For guest orders, auto-create user account
let user = null;
if (!isGuestOrder) {
  // Authenticated user - find by Clerk ID
  user = await User.findOne({ where: { clerkId: context.auth.userId } });
} else {
  // Guest checkout - find or create user
  const { firstName, lastName, email, phone } = input.guestUser;

  user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      role: 'CUSTOMER',
      isEmailVerified: false,
      metadata: {
        source: 'guest_checkout',
        createdAt: new Date().toISOString()
      }
    });
  }
}
```

### 2. Fee Breakdown Calculation (CRITICAL)

```typescript
// PaymentSplitService for complete fee calculation
interface FeeBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  platformFee: number;    // 7% platform fee
  stripeFee: number;      // ~2.9% + 30¢
  total: number;          // Everything combined
  siteOwnerReceives: number;
}

const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%
const STRIPE_PERCENTAGE = 0.029;      // 2.9%
const STRIPE_FIXED = 30;               // 30 cents

function calculateFeeBreakdown(
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number
): FeeBreakdown {
  const baseAmount = subtotal + shipping + tax - discount;
  const platformFee = Math.round(baseAmount * PLATFORM_FEE_PERCENTAGE);
  const stripeFee = Math.round(baseAmount * STRIPE_PERCENTAGE) + STRIPE_FIXED;
  const total = baseAmount + platformFee + stripeFee;
  const siteOwnerReceives = baseAmount - platformFee;

  return {
    subtotal,
    shipping,
    tax,
    discount,
    platformFee,
    stripeFee,
    total,
    siteOwnerReceives
  };
}
```

### 3. Order Type Detection

```typescript
// Determine order type from cart
let orderType = OrderType.REGULAR;

if (cart.cartType === 'PRE_ORDER') {
  orderType = OrderType.PRE_ORDER;
} else if (cart.cartType === 'MIXED') {
  orderType = OrderType.MIXED;
}
```

### 4. Address Validation

```typescript
interface AddressValidation {
  isValid: boolean;
  normalizedAddress: any | null;
  messages: string[];
}

function validateAddressBasic(address: any): AddressValidation {
  const messages: string[] = [];
  let isValid = true;

  // Required fields
  if (!address.name || address.name.trim().length < 2) {
    messages.push('Name must be at least 2 characters long');
    isValid = false;
  }

  if (!address.street1 || address.street1.trim().length < 5) {
    messages.push('Street address must be at least 5 characters long');
    isValid = false;
  }

  if (!address.city || address.city.trim().length < 2) {
    messages.push('City must be at least 2 characters long');
    isValid = false;
  }

  if (!address.state || address.state.length !== 2) {
    messages.push('State must be a 2-letter state code (e.g., CA, NY, TX)');
    isValid = false;
  }

  if (!address.zip || !/^\d{5}(-\d{4})?$/.test(address.zip.trim())) {
    messages.push('ZIP code must be in format 12345 or 12345-6789');
    isValid = false;
  }

  // US state validation
  if (address.country === 'US') {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    if (!validStates.includes(address.state.toUpperCase())) {
      messages.push('Invalid US state code');
      isValid = false;
    }
  }

  return { isValid, normalizedAddress: null, messages };
}
```

## GraphQL Schema

```graphql
# backend/src/graphql/schema/checkout.graphql

# Input Types
input GuestUserInput {
  firstName: String!
  lastName: String!
  email: String!
  phone: String
}

input AddressInput {
  name: String!
  street1: String!
  street2: String
  city: String!
  state: String!
  zip: String!
  country: String!
  phone: String
  email: String
}

input CreateOrderInput {
  cartId: ID!
  shippingAddressId: ID!
  billingAddressId: ID
  shippingRateId: ID!
  paymentMethodId: String
  notes: String
  guestUser: GuestUserInput
  metadata: JSON
}

input ShippingRateInput {
  fromAddress: AddressInput!
  toAddress: AddressInput!
  parcels: [ParcelInput!]!
}

input ParcelInput {
  length: Float!
  width: Float!
  height: Float!
  weight: Float!
  distance_unit: String!
  mass_unit: String!
}

# Response Types
type AddressValidation {
  isValid: Boolean!
  normalizedAddress: Address
  messages: [String!]!
}

type ShippingOption {
  id: ID!
  carrier: String!
  service: String!
  amount: Float!
  currency: String!
  estimatedDays: Int
  deliveryPromise: String
  metadata: JSON
}

type FlatRateShippingResponse {
  options: [ShippingOption!]!
  baseRate: Float!
  hasBundle: Boolean!
}

type FeeBreakdown {
  subtotal: Float!
  shipping: Float!
  tax: Float!
  discount: Float!
  platformFee: Float!
  stripeFee: Float!
  total: Float!
  siteOwnerReceives: Float!
}

type CheckoutSummary {
  cart: Cart!
  shippingAddress: Address
  billingAddress: Address
  selectedShippingRate: ShippingOption
  feeBreakdown: FeeBreakdown!
  isGuestCheckout: Boolean!
  canProceed: Boolean!
  validationErrors: [String!]!
}

# Queries
type Query {
  # Get shipping rates for checkout
  shippingRates(input: ShippingRateInput!): [ShippingOption!]!

  # Get flat rate shipping options (simplified)
  getFlatRateShippingOptions(
    toAddress: AddressInput!
    hasBundle: Boolean!
    cartSubtotal: Float
  ): FlatRateShippingResponse!

  # Validate an address
  validateAddress(address: AddressInput!): AddressValidation!

  # Get checkout summary
  checkoutSummary(
    cartId: ID!
    shippingAddressId: ID
    shippingRateId: ID
  ): CheckoutSummary!
}

# Mutations
type Mutation {
  # Create order from cart
  createOrder(input: CreateOrderInput!): Order!

  # Create shipping address
  createShippingAddress(input: AddressInput!): Address!

  # Update shipping address
  updateShippingAddress(id: ID!, input: AddressInput!): Address!

  # Delete shipping address
  deleteShippingAddress(id: ID!): Boolean!

  # Apply discount code to cart
  applyDiscountCode(cartId: ID!, code: String!): Cart!

  # Remove discount from cart
  removeDiscount(cartId: ID!): Cart!
}
```

## GraphQL Resolvers

```typescript
// backend/src/graphql/resolvers/checkoutResolvers.ts
import { Cart, Order, User, ShippingAddress, ShippingRate } from '../../models';
import { PaymentSplitService } from '../../services/PaymentSplitService';
import { ShippoService } from '../../services/ShippoService';
import { FlatRateShippingService } from '../../services/FlatRateShippingService';
import { GraphQLError } from 'graphql';

export const checkoutResolvers = {
  Query: {
    shippingRates: async (_: any, { input }: { input: any }) => {
      const { fromAddress, toAddress, parcels } = input;

      // Transform parcels for Shippo
      const shipParcels = parcels.map((p: any) => ({
        length: p.length.toString(),
        width: p.width.toString(),
        height: p.height.toString(),
        weight: p.weight.toString(),
        distanceUnit: p.distance_unit,
        massUnit: p.mass_unit,
      }));

      const tempOrderId = `temp-${Date.now()}`;
      return await ShippoService.getShippingRates(
        tempOrderId, fromAddress, toAddress, shipParcels
      );
    },

    getFlatRateShippingOptions: async (
      _: any,
      { toAddress, hasBundle, cartSubtotal }: any
    ) => {
      const fromAddress = {
        name: process.env.BUSINESS_NAME,
        street1: process.env.BUSINESS_STREET,
        city: process.env.BUSINESS_CITY,
        state: process.env.BUSINESS_STATE,
        zip: process.env.BUSINESS_ZIP,
        country: process.env.BUSINESS_COUNTRY || 'US',
      };

      const parcels = [{
        length: '10', width: '8', height: '4', weight: '1',
        distanceUnit: 'in', massUnit: 'lb'
      }];

      const options = await ShippoService.getFlatRateOptions(
        fromAddress, toAddress, parcels, hasBundle, cartSubtotal
      );

      const baseRate = FlatRateShippingService.getFlatRate(hasBundle, cartSubtotal);

      return {
        options: options.map(opt => ({
          ...opt,
          deliveryPromise: FlatRateShippingService.getDeliveryPromise(opt.deliveryDays)
        })),
        baseRate,
        hasBundle
      };
    },

    validateAddress: async (_: any, { address }: { address: any }) => {
      return validateAddressBasic(address);
    },

    checkoutSummary: async (
      _: any,
      { cartId, shippingAddressId, shippingRateId }: any,
      context: any
    ) => {
      const cart = await Cart.findByPk(cartId);
      if (!cart) {
        throw new GraphQLError('Cart not found');
      }

      const validationErrors: string[] = [];
      let shippingAddress = null;
      let shippingRate = null;

      if (cart.isEmpty) {
        validationErrors.push('Cart is empty');
      }

      if (shippingAddressId) {
        shippingAddress = await ShippingAddress.findByPk(shippingAddressId);
        if (!shippingAddress) {
          validationErrors.push('Shipping address not found');
        }
      } else {
        validationErrors.push('Shipping address required');
      }

      if (shippingRateId) {
        shippingRate = await ShippingRate.findByPk(shippingRateId);
        if (!shippingRate) {
          validationErrors.push('Shipping rate not found');
        }
      } else {
        validationErrors.push('Shipping rate required');
      }

      const feeBreakdown = PaymentSplitService.calculateFeeBreakdown(
        cart.subtotal,
        shippingRate?.amount || 0,
        0, // tax
        cart.discountAmount
      );

      return {
        cart,
        shippingAddress,
        billingAddress: shippingAddress,
        selectedShippingRate: shippingRate,
        feeBreakdown,
        isGuestCheckout: !context.auth?.userId,
        canProceed: validationErrors.length === 0,
        validationErrors
      };
    },
  },

  Mutation: {
    createOrder: async (_: any, { input }: { input: any }, context: any) => {
      // Allow authenticated users AND guest orders
      const isGuestOrder = !context.auth?.userId && input.guestUser;

      if (!context.auth?.userId && !isGuestOrder) {
        throw new GraphQLError('Authentication or guest info required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Find or create user
      let user = null;
      if (!isGuestOrder) {
        user = await User.findOne({ where: { clerkId: context.auth.userId } });
        if (!user) throw new Error('User not found');
      } else {
        const { firstName, lastName, email, phone } = input.guestUser;
        user = await User.findOne({ where: { email } });

        if (!user) {
          user = await User.create({
            firstName, lastName, email, phone,
            role: 'CUSTOMER',
            isEmailVerified: false,
            metadata: { source: 'guest_checkout', createdAt: new Date().toISOString() }
          });
        }
      }

      const { cartId, shippingAddressId, billingAddressId, shippingRateId, paymentMethodId, notes } = input;

      // Validate cart
      const cart = await Cart.findByPk(cartId);
      if (!cart) throw new Error('Cart not found');
      if (cart.isEmpty) throw new Error('Cart is empty');

      // Get addresses
      const shippingAddress = await ShippingAddress.findByPk(shippingAddressId);
      if (!shippingAddress) throw new Error('Shipping address not found');

      let billingAddress = shippingAddress;
      if (billingAddressId && billingAddressId !== shippingAddressId) {
        const billAddr = await ShippingAddress.findByPk(billingAddressId);
        if (billAddr) billingAddress = billAddr;
      }

      // Get shipping rate
      const shippingRate = await ShippingRate.findByPk(shippingRateId);
      if (!shippingRate) throw new Error('Shipping rate not found');

      // Calculate fees
      const feeBreakdown = PaymentSplitService.calculateFeeBreakdown(
        cart.subtotal,
        Number(shippingRate.amount),
        0, // tax
        cart.discountAmount
      );

      // Determine order type
      let orderType = 'REGULAR';
      if (cart.cartType === 'PRE_ORDER') orderType = 'PRE_ORDER';
      else if (cart.cartType === 'MIXED') orderType = 'MIXED';

      // Detect flat rate
      const isFlatRate = shippingRate.carrier === 'Flat Rate' ||
                         (shippingRate.metadata as any)?.actualCarrier;

      let flatRateInfo = {};
      if (isFlatRate) {
        const hasBundle = cart.items.some((i: any) => i.bundleId);
        const match = shippingRate.service.match(/(\d+)-?[Dd]ay/);
        const deliveryDays = match ? parseInt(match[1]) : 7;
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + deliveryDays);

        flatRateInfo = {
          usedFlatRate: true,
          flatRateCharged: Number(shippingRate.amount),
          deliverySpeedSelected: `${deliveryDays}-day`,
          deliveryDeadline: deadline,
          metadata: {
            selectedFlatRateOptionId: shippingRate.id,
            hasBundle,
            ...(input.metadata || {})
          }
        };
      }

      // Create order
      const order = await Order.create({
        customerId: user.id,
        items: cart.items,
        orderType,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress: {
          street: shippingAddress.street1,
          street2: shippingAddress.street2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.postalCode,
          country: shippingAddress.country
        },
        billingAddress: {
          street: billingAddress.street1,
          street2: billingAddress.street2,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.postalCode,
          country: billingAddress.country
        },
        subtotal: feeBreakdown.subtotal,
        shipping: feeBreakdown.shipping,
        tax: feeBreakdown.tax,
        discount: feeBreakdown.discount,
        platformFee: feeBreakdown.platformFee,
        stripeFee: feeBreakdown.stripeFee,
        total: feeBreakdown.total,
        totalAmount: feeBreakdown.total,
        paymentMethod: paymentMethodId,
        notes,
        shippingCarrier: shippingRate.carrier,
        shippingService: shippingRate.service,
        shippoRateId: shippingRate.shippoRateId,
        ...flatRateInfo,
      });

      // Clear cart
      await cart.clearCart();

      return order;
    },

    createShippingAddress: async (_: any, { input }: { input: any }, context: any) => {
      // Validate address
      const validation = validateAddressBasic(input);
      if (!validation.isValid) {
        throw new GraphQLError(`Invalid address: ${validation.messages.join(', ')}`);
      }

      // Get user ID
      let userId = null;
      if (context.auth?.userId) {
        const user = await User.findOne({ where: { clerkId: context.auth.userId } });
        if (user) userId = user.id;
      }

      return await ShippingAddress.create({
        ...input,
        userId,
        postalCode: input.zip,
      });
    },
  },
};

// Address validation helper
function validateAddressBasic(address: any) {
  const messages: string[] = [];
  let isValid = true;

  if (!address.name || address.name.trim().length < 2) {
    messages.push('Name must be at least 2 characters');
    isValid = false;
  }
  if (!address.street1 || address.street1.trim().length < 5) {
    messages.push('Street address must be at least 5 characters');
    isValid = false;
  }
  if (!address.city || address.city.trim().length < 2) {
    messages.push('City must be at least 2 characters');
    isValid = false;
  }
  if (!address.state || address.state.length !== 2) {
    messages.push('State must be a 2-letter code');
    isValid = false;
  }
  if (!address.zip || !/^\d{5}(-\d{4})?$/.test(address.zip.trim())) {
    messages.push('ZIP must be 12345 or 12345-6789 format');
    isValid = false;
  }

  return { isValid, normalizedAddress: null, messages };
}
```

## Services

### PaymentSplitService

```typescript
// backend/src/services/PaymentSplitService.ts

const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%
const STRIPE_PERCENTAGE = 0.029;       // 2.9%
const STRIPE_FIXED_CENTS = 30;         // 30 cents

export interface FeeBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  platformFee: number;
  stripeFee: number;
  total: number;
  siteOwnerReceives: number;
}

export class PaymentSplitService {
  static calculateFeeBreakdown(
    subtotal: number,
    shipping: number,
    tax: number,
    discount: number
  ): FeeBreakdown {
    // Base amount (in cents for precision)
    const subtotalCents = Math.round(subtotal * 100);
    const shippingCents = Math.round(shipping * 100);
    const taxCents = Math.round(tax * 100);
    const discountCents = Math.round(discount * 100);

    const baseAmountCents = subtotalCents + shippingCents + taxCents - discountCents;

    // Platform fee (7%)
    const platformFeeCents = Math.round(baseAmountCents * PLATFORM_FEE_PERCENTAGE);

    // Stripe fee (2.9% + 30¢)
    const stripeFeeCents = Math.round(baseAmountCents * STRIPE_PERCENTAGE) + STRIPE_FIXED_CENTS;

    // Total
    const totalCents = baseAmountCents + platformFeeCents + stripeFeeCents;

    // Site owner receives
    const siteOwnerReceivesCents = baseAmountCents - platformFeeCents;

    return {
      subtotal: subtotalCents / 100,
      shipping: shippingCents / 100,
      tax: taxCents / 100,
      discount: discountCents / 100,
      platformFee: platformFeeCents / 100,
      stripeFee: stripeFeeCents / 100,
      total: totalCents / 100,
      siteOwnerReceives: siteOwnerReceivesCents / 100,
    };
  }

  static getStripePaymentIntentParams(
    feeBreakdown: FeeBreakdown,
    siteOwnerStripeAccountId: string
  ) {
    return {
      amount: Math.round(feeBreakdown.total * 100), // Stripe expects cents
      currency: 'usd',
      application_fee_amount: Math.round(feeBreakdown.platformFee * 100),
      transfer_data: {
        destination: siteOwnerStripeAccountId,
      },
    };
  }
}
```

### FlatRateShippingService

```typescript
// backend/src/services/FlatRateShippingService.ts

interface FlatRateOption {
  id: string;
  name: string;
  deliveryDays: number;
  price: number;
}

export class FlatRateShippingService {
  static readonly FLAT_RATES: FlatRateOption[] = [
    { id: 'flat-rate-7', name: 'Standard Shipping', deliveryDays: 7, price: 5.99 },
    { id: 'flat-rate-5', name: 'Express Shipping', deliveryDays: 5, price: 9.99 },
    { id: 'flat-rate-3', name: 'Priority Shipping', deliveryDays: 3, price: 14.99 },
  ];

  static readonly BUNDLE_RATES: FlatRateOption[] = [
    { id: 'flat-rate-bundle-7', name: 'Standard Bundle', deliveryDays: 7, price: 7.99 },
    { id: 'flat-rate-bundle-5', name: 'Express Bundle', deliveryDays: 5, price: 12.99 },
    { id: 'flat-rate-bundle-3', name: 'Priority Bundle', deliveryDays: 3, price: 17.99 },
  ];

  static readonly FREE_SHIPPING_THRESHOLD = 75.00;

  static getFlatRate(hasBundle: boolean, cartSubtotal?: number): number {
    // Free shipping over threshold
    if (cartSubtotal && cartSubtotal >= this.FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    const rates = hasBundle ? this.BUNDLE_RATES : this.FLAT_RATES;
    return rates[0].price; // Return base rate
  }

  static getDeliveryPromise(days: number): string {
    if (days <= 3) return `Arrives in ${days} business days`;
    if (days <= 5) return `Arrives in ${days} business days`;
    return `Arrives in ${days}-10 business days`;
  }

  static getOptions(hasBundle: boolean, cartSubtotal?: number): FlatRateOption[] {
    const baseRates = hasBundle ? this.BUNDLE_RATES : this.FLAT_RATES;

    // Apply free shipping if applicable
    if (cartSubtotal && cartSubtotal >= this.FREE_SHIPPING_THRESHOLD) {
      return baseRates.map(rate => ({
        ...rate,
        price: 0,
        name: `${rate.name} (FREE)`
      }));
    }

    return baseRates;
  }
}
```

## Frontend Integration

### Checkout Context

```typescript
// frontend/src/context/CheckoutContext.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CheckoutState {
  step: 'cart' | 'shipping' | 'payment' | 'confirmation';
  shippingAddressId: string | null;
  billingAddressId: string | null;
  shippingRateId: string | null;
  guestUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
}

interface CheckoutContextValue extends CheckoutState {
  setStep: (step: CheckoutState['step']) => void;
  setShippingAddress: (id: string) => void;
  setBillingAddress: (id: string | null) => void;
  setShippingRate: (id: string) => void;
  setGuestUser: (user: CheckoutState['guestUser']) => void;
  reset: () => void;
}

const initialState: CheckoutState = {
  step: 'cart',
  shippingAddressId: null,
  billingAddressId: null,
  shippingRateId: null,
  guestUser: null,
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  const setStep = useCallback((step: CheckoutState['step']) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setShippingAddress = useCallback((id: string) => {
    setState(prev => ({ ...prev, shippingAddressId: id }));
  }, []);

  const setBillingAddress = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, billingAddressId: id }));
  }, []);

  const setShippingRate = useCallback((id: string) => {
    setState(prev => ({ ...prev, shippingRateId: id }));
  }, []);

  const setGuestUser = useCallback((user: CheckoutState['guestUser']) => {
    setState(prev => ({ ...prev, guestUser: user }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <CheckoutContext.Provider value={{
      ...state, setStep, setShippingAddress, setBillingAddress,
      setShippingRate, setGuestUser, reset
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}
```

### Checkout Hook

```typescript
// frontend/src/hooks/useCheckoutMutations.ts
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      total
      createdAt
    }
  }
`;

const CREATE_SHIPPING_ADDRESS = gql`
  mutation CreateShippingAddress($input: AddressInput!) {
    createShippingAddress(input: $input) {
      id
      name
      street1
      city
      state
      zip
      country
    }
  }
`;

export function useCheckoutMutations() {
  const [createOrderMutation, { loading: creatingOrder }] = useMutation(CREATE_ORDER);
  const [createAddressMutation, { loading: creatingAddress }] = useMutation(CREATE_SHIPPING_ADDRESS);

  const createOrder = async (input: any) => {
    const { data } = await createOrderMutation({ variables: { input } });
    return data.createOrder;
  };

  const createAddress = async (input: any) => {
    const { data } = await createAddressMutation({ variables: { input } });
    return data.createShippingAddress;
  };

  return {
    createOrder,
    createAddress,
    loading: creatingOrder || creatingAddress,
  };
}
```

## Environment Variables

```bash
# Business Address (for shipping calculations)
BUSINESS_NAME="Your Store Name"
BUSINESS_STREET="123 Main St"
BUSINESS_CITY="Los Angeles"
BUSINESS_STATE="CA"
BUSINESS_ZIP="90001"
BUSINESS_COUNTRY="US"

# Shipping Service
SHIPPO_API_KEY=your_shippo_api_key
SHIPPO_WEBHOOK_SECRET=your_webhook_secret

# Free Shipping Threshold
FREE_SHIPPING_THRESHOLD=75.00

# Platform Fees
PLATFORM_FEE_PERCENTAGE=0.07
```

## Quality Checklist

Before completing checkout implementation, verify:

### Backend
- [ ] Guest checkout creates user account
- [ ] Address validation working
- [ ] Shipping rate calculation working
- [ ] Fee breakdown calculation accurate
- [ ] Order creation includes all fee fields
- [ ] Cart cleared after order creation
- [ ] Flat rate shipping support

### Frontend
- [ ] Multi-step checkout wizard
- [ ] Address form with validation
- [ ] Shipping rate selection
- [ ] Fee breakdown display
- [ ] Guest checkout form
- [ ] Payment integration
- [ ] Order confirmation page

### Integration
- [ ] Stripe payment intent creation
- [ ] Shipping label generation ready
- [ ] Email notifications configured
- [ ] SMS notifications configured

## Related Skills

- **shopping-cart-standard** - Cart management (checkout source)
- **stripe-connect-standard** - Payment processing
- **order-management-standard** - Order fulfillment

## Version History

- **1.0.0** - Initial release with DreamiHairCare patterns
