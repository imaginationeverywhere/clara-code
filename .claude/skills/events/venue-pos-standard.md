# Venue POS Standard

Point-of-sale system for venues and events with inventory management, multiple payment methods, and sales reporting.

## Target Projects
- **Site962/QuikEvents** - Multi-tenant venue and event platform

## Core Components

### 1. POS Terminal

```typescript
interface POSTerminal {
  id: string;
  tenantId: string;
  venueId: string;
  name: string;                    // "Bar 1", "Merch Booth", "Main Entrance"
  type: 'stationary' | 'mobile' | 'self_service';
  status: 'online' | 'offline' | 'maintenance';

  // Hardware
  hardware: TerminalHardware;

  // Configuration
  config: TerminalConfig;

  // Current session
  currentSession?: POSSession;

  // Location
  location: {
    area: string;
    description: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

interface TerminalHardware {
  printerConnected: boolean;
  printerType?: 'receipt' | 'kitchen' | 'label';
  cashDrawerConnected: boolean;
  cardReaderType?: 'swipe' | 'chip' | 'tap' | 'all';
  scannerConnected: boolean;
}

interface TerminalConfig {
  allowCashPayments: boolean;
  allowCardPayments: boolean;
  allowTabs: boolean;
  requireManagerApproval: number;  // Amount threshold
  tipOptions: number[];            // [15, 18, 20, 25]
  defaultTaxRate: number;
  receiptFooter: string;
}
```

### 2. Product Catalog

```typescript
interface Product {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  type: 'physical' | 'service' | 'bundle';

  // Pricing
  price: number;
  currency: string;
  taxable: boolean;
  taxRate?: number;

  // Inventory
  trackInventory: boolean;
  currentStock: number;
  lowStockThreshold: number;
  allowOversell: boolean;

  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];

  // Modifiers
  modifierGroups?: ModifierGroup[];

  // Media
  imageUrl?: string;

  // Availability
  availableAt: string[];           // Terminal IDs or 'all'
  eventSpecific?: string[];        // Event IDs if event-specific

  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: Date;
}

interface ProductVariant {
  id: string;
  name: string;                    // "Small", "Medium", "Large"
  sku: string;
  price: number;
  stock: number;
}

interface ModifierGroup {
  id: string;
  name: string;                    // "Toppings", "Size", "Ice Level"
  required: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;
  price: number;                   // Additional price
  default: boolean;
}
```

### 3. Orders and Transactions

```typescript
interface POSOrder {
  id: string;
  terminalId: string;
  sessionId: string;
  orderNumber: string;             // Sequential for the day

  // Items
  items: OrderItem[];

  // Customer
  customerId?: string;
  customerName?: string;
  tabName?: string;                // For open tabs

  // Totals
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  total: number;

  // Payment
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  payments: Payment[];

  // Status
  status: 'open' | 'completed' | 'voided' | 'refunded';

  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  modifiers: AppliedModifier[];
  modifierTotal: number;
  discounts: AppliedDiscount[];
  discountAmount: number;
  taxAmount: number;
  total: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

interface Payment {
  id: string;
  orderId: string;
  method: 'cash' | 'card' | 'tab' | 'comp' | 'gift_card' | 'mobile';
  amount: number;
  tipAmount: number;
  reference?: string;              // Card transaction ID
  cardLast4?: string;
  cardBrand?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processedAt: Date;
  processedBy: string;
}
```

## POS Service Implementation

```typescript
export class POSService {
  /**
   * Create new order
   */
  async createOrder(
    terminalId: string,
    userId: string
  ): Promise<POSOrder> {
    const terminal = await this.getTerminal(terminalId);
    const session = await this.getCurrentSession(terminalId);

    if (!session) {
      throw new Error('No active POS session. Please start a session first.');
    }

    const orderNumber = await this.generateOrderNumber(terminal.venueId);

    const order: POSOrder = {
      id: generateId(),
      terminalId,
      sessionId: session.id,
      orderNumber,
      items: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      tipAmount: 0,
      total: 0,
      paymentStatus: 'unpaid',
      payments: [],
      status: 'open',
      createdAt: new Date(),
      createdBy: userId
    };

    await this.orderRepository.save(order);
    return order;
  }

  /**
   * Add item to order
   */
  async addItem(
    orderId: string,
    productId: string,
    quantity: number,
    variantId?: string,
    modifiers?: string[],
    notes?: string
  ): Promise<POSOrder> {
    const order = await this.getOrder(orderId);
    if (order.status !== 'open') {
      throw new Error('Cannot modify completed order');
    }

    const product = await this.productService.getProduct(productId);
    const variant = variantId
      ? product.variants?.find(v => v.id === variantId)
      : null;

    const unitPrice = variant?.price || product.price;

    // Calculate modifiers
    let modifierTotal = 0;
    const appliedModifiers: AppliedModifier[] = [];

    if (modifiers?.length && product.modifierGroups) {
      for (const modId of modifiers) {
        const modifier = this.findModifier(product.modifierGroups, modId);
        if (modifier) {
          modifierTotal += modifier.price;
          appliedModifiers.push({
            id: modifier.id,
            name: modifier.name,
            price: modifier.price
          });
        }
      }
    }

    // Calculate tax
    const itemSubtotal = (unitPrice + modifierTotal) * quantity;
    const taxRate = product.taxRate || 0;
    const taxAmount = product.taxable ? itemSubtotal * taxRate : 0;

    const item: OrderItem = {
      id: generateId(),
      productId,
      productName: product.name,
      variantId,
      variantName: variant?.name,
      quantity,
      unitPrice,
      modifiers: appliedModifiers,
      modifierTotal,
      discounts: [],
      discountAmount: 0,
      taxAmount,
      total: itemSubtotal + taxAmount,
      notes,
      status: 'pending'
    };

    order.items.push(item);

    // Update inventory if tracked
    if (product.trackInventory) {
      await this.inventoryService.reserveStock(productId, variantId, quantity);
    }

    // Recalculate totals
    this.recalculateTotals(order);

    await this.orderRepository.save(order);
    return order;
  }

  /**
   * Process payment
   */
  async processPayment(
    orderId: string,
    method: Payment['method'],
    amount: number,
    tipAmount: number = 0,
    paymentDetails?: any
  ): Promise<Payment> {
    const order = await this.getOrder(orderId);

    const remainingBalance = order.total - this.getTotalPaid(order);
    if (amount > remainingBalance + tipAmount) {
      throw new Error('Payment amount exceeds remaining balance');
    }

    let payment: Payment;

    switch (method) {
      case 'cash':
        payment = await this.processCashPayment(order, amount, tipAmount);
        break;

      case 'card':
        payment = await this.processCardPayment(order, amount, tipAmount, paymentDetails);
        break;

      case 'tab':
        payment = await this.processTabPayment(order, amount, paymentDetails.tabId);
        break;

      case 'gift_card':
        payment = await this.processGiftCardPayment(order, amount, paymentDetails.giftCardNumber);
        break;

      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    order.payments.push(payment);
    order.tipAmount += tipAmount;

    // Update payment status
    const totalPaid = this.getTotalPaid(order);
    if (totalPaid >= order.total) {
      order.paymentStatus = 'paid';
      order.status = 'completed';
      order.completedAt = new Date();

      // Commit inventory
      await this.commitInventory(order);
    } else if (totalPaid > 0) {
      order.paymentStatus = 'partial';
    }

    await this.orderRepository.save(order);
    return payment;
  }

  /**
   * Process card payment via Stripe Terminal
   */
  private async processCardPayment(
    order: POSOrder,
    amount: number,
    tipAmount: number,
    details: { readerId: string }
  ): Promise<Payment> {
    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round((amount + tipAmount) * 100),
      currency: 'usd',
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber
      }
    });

    // Process on terminal
    const terminalPayment = await this.stripe.terminal.readers.processPaymentIntent(
      details.readerId,
      { payment_intent: paymentIntent.id }
    );

    return {
      id: generateId(),
      orderId: order.id,
      method: 'card',
      amount,
      tipAmount,
      reference: paymentIntent.id,
      cardLast4: terminalPayment.payment_intent?.charges?.data[0]?.payment_method_details?.card_present?.last4,
      cardBrand: terminalPayment.payment_intent?.charges?.data[0]?.payment_method_details?.card_present?.brand,
      status: 'completed',
      processedAt: new Date(),
      processedBy: order.createdBy
    };
  }
}
```

## Inventory Management

```typescript
export class InventoryService {
  /**
   * Update stock levels
   */
  async updateStock(
    productId: string,
    variantId: string | null,
    adjustment: number,
    reason: string,
    userId: string
  ): Promise<InventoryLog> {
    const product = await this.productService.getProduct(productId);

    if (variantId) {
      const variant = product.variants?.find(v => v.id === variantId);
      if (variant) {
        variant.stock += adjustment;
      }
    } else {
      product.currentStock += adjustment;
    }

    // Check low stock alert
    if (product.currentStock <= product.lowStockThreshold) {
      await this.sendLowStockAlert(product);
    }

    // Log the change
    const log: InventoryLog = {
      id: generateId(),
      productId,
      variantId,
      previousQuantity: product.currentStock - adjustment,
      adjustment,
      newQuantity: product.currentStock,
      reason,
      userId,
      createdAt: new Date()
    };

    await this.inventoryLogRepository.save(log);
    await this.productService.updateProduct(product);

    return log;
  }

  /**
   * Perform stock count
   */
  async performStockCount(
    venueId: string,
    counts: StockCount[],
    userId: string
  ): Promise<StockCountResult> {
    const results: StockCountResult = {
      id: generateId(),
      venueId,
      countedAt: new Date(),
      countedBy: userId,
      items: [],
      totalVariance: 0,
      varianceValue: 0
    };

    for (const count of counts) {
      const product = await this.productService.getProduct(count.productId);
      const expectedQuantity = count.variantId
        ? product.variants?.find(v => v.id === count.variantId)?.stock || 0
        : product.currentStock;

      const variance = count.actualQuantity - expectedQuantity;

      results.items.push({
        productId: count.productId,
        productName: product.name,
        variantId: count.variantId,
        expectedQuantity,
        actualQuantity: count.actualQuantity,
        variance,
        varianceValue: variance * product.price
      });

      results.totalVariance += variance;
      results.varianceValue += variance * product.price;

      // Adjust inventory
      if (variance !== 0) {
        await this.updateStock(
          count.productId,
          count.variantId,
          variance,
          'Stock count adjustment',
          userId
        );
      }
    }

    await this.stockCountRepository.save(results);
    return results;
  }
}
```

## Session Management

```typescript
interface POSSession {
  id: string;
  terminalId: string;
  userId: string;
  userName: string;

  // Cash drawer
  openingCash: number;
  currentCash: number;
  expectedCash: number;

  // Totals
  totalSales: number;
  totalRefunds: number;
  totalTips: number;
  orderCount: number;

  // Payment breakdown
  cashSales: number;
  cardSales: number;
  otherSales: number;

  // Status
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
  closingNotes?: string;
}

export class POSSessionService {
  /**
   * Start new session
   */
  async startSession(
    terminalId: string,
    userId: string,
    openingCash: number
  ): Promise<POSSession> {
    // Check for existing open session
    const existingSession = await this.getOpenSession(terminalId);
    if (existingSession) {
      throw new Error('Terminal already has an open session');
    }

    const user = await this.userService.getUser(userId);

    const session: POSSession = {
      id: generateId(),
      terminalId,
      userId,
      userName: user.name,
      openingCash,
      currentCash: openingCash,
      expectedCash: openingCash,
      totalSales: 0,
      totalRefunds: 0,
      totalTips: 0,
      orderCount: 0,
      cashSales: 0,
      cardSales: 0,
      otherSales: 0,
      status: 'open',
      openedAt: new Date()
    };

    await this.sessionRepository.save(session);
    return session;
  }

  /**
   * Close session with reconciliation
   */
  async closeSession(
    sessionId: string,
    actualCash: number,
    notes?: string
  ): Promise<SessionCloseReport> {
    const session = await this.getSession(sessionId);

    if (session.status !== 'open') {
      throw new Error('Session is already closed');
    }

    const variance = actualCash - session.expectedCash;

    session.status = 'closed';
    session.closedAt = new Date();
    session.closingNotes = notes;

    await this.sessionRepository.save(session);

    // Generate close report
    return {
      session,
      expectedCash: session.expectedCash,
      actualCash,
      variance,
      varianceExplanation: variance !== 0 ? notes : undefined,
      orders: await this.getSessionOrders(sessionId),
      paymentBreakdown: {
        cash: session.cashSales,
        card: session.cardSales,
        other: session.otherSales
      }
    };
  }
}
```

## Database Schema

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category_id UUID REFERENCES product_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,4),
  track_inventory BOOLEAN DEFAULT true,
  current_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POS Orders
CREATE TABLE pos_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  session_id UUID NOT NULL REFERENCES pos_sessions(id),
  order_number VARCHAR(50) NOT NULL,
  customer_id UUID REFERENCES users(id),
  customer_name VARCHAR(255),
  tab_name VARCHAR(100),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  status VARCHAR(50) DEFAULT 'open',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  variant_id UUID,
  variant_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  modifiers JSONB DEFAULT '[]',
  modifier_total DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending'
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES pos_orders(id),
  method VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  reference VARCHAR(255),
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_session ON pos_orders(session_id);
CREATE INDEX idx_orders_status ON pos_orders(status);
CREATE INDEX idx_items_order ON order_items(order_id);
```

## Related Skills
- `event-ticketing-standard` - Event ticket sales
- `venue-contract-standard` - Venue agreements
- `stripe-connect-specialist` - Payment processing
