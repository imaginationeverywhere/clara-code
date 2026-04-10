# Barbershop POS Standard

## Overview
Point of sale system for barbershops handling service payments, product sales, tips, split payments, and daily reconciliation. Supports cash, card, and digital wallet payments with integrated tipping.

## Domain Context
- **Primary Projects**: Quik Barbershop, DreamiHairCare, Tap-to-Tip
- **Related Domains**: Fintech (tap-to-pay, gig payments), Events (POS patterns)
- **Key Integration**: Stripe Terminal, Tap-to-Pay SDK, Gig Worker Payments

## Core Interfaces

### Transaction & Checkout
```typescript
interface POSTransaction {
  id: string;
  shopId: string;
  barberId: string;
  customerId?: string;
  appointmentId?: string;
  queueEntryId?: string;
  items: TransactionItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  discounts: AppliedDiscount[];
  discountTotal: number;
  total: number;
  payments: Payment[];
  status: TransactionStatus;
  receiptNumber: string;
  receiptUrl?: string;
  notes?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  voidedAt?: Date;
  voidReason?: string;
}

interface TransactionItem {
  id: string;
  type: 'service' | 'product' | 'addon' | 'fee';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxable: boolean;
  taxRate?: number;
  barberId?: string; // For service attribution
  commission?: number;
}

type TransactionStatus =
  | 'pending'
  | 'partial'
  | 'completed'
  | 'voided'
  | 'refunded';

interface AppliedDiscount {
  id: string;
  type: 'percentage' | 'fixed' | 'loyalty';
  code?: string;
  name: string;
  value: number; // percentage or fixed amount
  appliedAmount: number;
  itemIds?: string[]; // Specific items, or all if empty
}
```

### Payments & Tips
```typescript
interface Payment {
  id: string;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  tipAmount: number;
  status: PaymentStatus;
  reference?: string;
  stripePaymentIntentId?: string;
  cardBrand?: string;
  cardLast4?: string;
  processedAt: Date;
  metadata: Record<string, any>;
}

type PaymentMethod =
  | 'cash'
  | 'card_present'   // Stripe Terminal
  | 'tap_to_pay'     // Tap-to-Pay on iPhone
  | 'card_manual'    // Keyed entry
  | 'apple_pay'
  | 'google_pay'
  | 'gift_card'
  | 'loyalty_points';

type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded';

interface TipConfiguration {
  shopId: string;
  enabled: boolean;
  suggestedAmounts: number[]; // [15, 20, 25]
  suggestedType: 'percentage' | 'fixed';
  customAmountAllowed: boolean;
  minimumAmount?: number;
  maximumAmount?: number;
  defaultSelection?: number; // Index of default suggestion
  showAfterPayment: boolean; // Show tip screen after payment
  distributionMethod: TipDistributionMethod;
}

type TipDistributionMethod =
  | 'full_to_barber'     // 100% to service provider
  | 'pooled'             // Split among all staff
  | 'percentage_split';  // Configurable split

interface TipDistribution {
  transactionId: string;
  totalTip: number;
  recipients: {
    barberId: string;
    barberName: string;
    amount: number;
    percentage: number;
  }[];
  distributedAt: Date;
}
```

### Products & Inventory
```typescript
interface Product {
  id: string;
  shopId: string;
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  cost?: number;
  taxable: boolean;
  taxRate?: number;
  trackInventory: boolean;
  currentStock: number;
  lowStockThreshold: number;
  imageUrl?: string;
  isActive: boolean;
  barcode?: string;
  createdAt: Date;
}

type ProductCategory =
  | 'hair_care'
  | 'styling'
  | 'beard'
  | 'skincare'
  | 'accessories'
  | 'gift_card'
  | 'other';

interface InventoryAdjustment {
  id: string;
  productId: string;
  type: 'sale' | 'restock' | 'adjustment' | 'damaged' | 'return';
  quantity: number; // Positive for add, negative for remove
  previousStock: number;
  newStock: number;
  transactionId?: string;
  notes?: string;
  adjustedBy: string;
  createdAt: Date;
}
```

### Cash Management
```typescript
interface CashDrawer {
  id: string;
  shopId: string;
  terminalId?: string;
  status: 'closed' | 'open';
  openedAt?: Date;
  openedBy?: string;
  closedAt?: Date;
  closedBy?: string;
  openingBalance: number;
  currentBalance: number;
  expectedBalance: number;
  cashIn: number;
  cashOut: number;
  transactions: CashTransaction[];
}

interface CashTransaction {
  id: string;
  drawerId: string;
  type: 'open' | 'sale' | 'refund' | 'payout' | 'drop' | 'adjustment' | 'close';
  amount: number;
  balance: number;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

interface EndOfDayReport {
  shopId: string;
  date: Date;
  openingTime: Date;
  closingTime: Date;
  summary: {
    totalTransactions: number;
    grossSales: number;
    discounts: number;
    netSales: number;
    taxCollected: number;
    tipsCollected: number;
    refunds: number;
    voids: number;
  };
  salesByMethod: Record<PaymentMethod, number>;
  salesByBarber: {
    barberId: string;
    barberName: string;
    services: number;
    products: number;
    tips: number;
    total: number;
  }[];
  salesByCategory: Record<string, number>;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  cashReconciliation: {
    expectedCash: number;
    actualCash: number;
    variance: number;
  };
}
```

## Service Implementation

### POS Service
```typescript
import Stripe from 'stripe';

export class BarbershopPOSService {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  }

  // Start new transaction
  async createTransaction(
    shopId: string,
    barberId: string,
    appointmentId?: string,
    queueEntryId?: string,
    customerId?: string
  ): Promise<POSTransaction> {
    const items: TransactionItem[] = [];

    // If from appointment, pre-populate services
    if (appointmentId) {
      const appointment = await this.getAppointment(appointmentId);
      for (const service of appointment.services) {
        items.push({
          id: crypto.randomUUID(),
          type: 'service',
          itemId: service.serviceId,
          name: service.serviceName,
          quantity: 1,
          unitPrice: service.price,
          totalPrice: service.price,
          taxable: false, // Services typically not taxed
          barberId,
        });
      }
    }

    // If from queue, pre-populate services
    if (queueEntryId) {
      const entry = await this.getQueueEntry(queueEntryId);
      for (const service of entry.requestedServices) {
        items.push({
          id: crypto.randomUUID(),
          type: 'service',
          itemId: service.serviceId,
          name: service.serviceName,
          quantity: 1,
          unitPrice: service.price,
          totalPrice: service.price,
          taxable: false,
          barberId,
        });
      }
    }

    const transaction: POSTransaction = {
      id: crypto.randomUUID(),
      shopId,
      barberId,
      customerId,
      appointmentId,
      queueEntryId,
      items,
      subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
      taxAmount: 0,
      tipAmount: 0,
      discounts: [],
      discountTotal: 0,
      total: 0,
      payments: [],
      status: 'pending',
      receiptNumber: await this.generateReceiptNumber(shopId),
      metadata: {},
      createdAt: new Date(),
    };

    this.calculateTotals(transaction);
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Add item to transaction
  async addItem(
    transactionId: string,
    itemType: 'service' | 'product',
    itemId: string,
    quantity: number = 1,
    barberId?: string
  ): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.status !== 'pending') {
      throw new Error('Cannot modify completed transaction');
    }

    let item: TransactionItem;

    if (itemType === 'service') {
      const service = await this.getService(itemId);
      item = {
        id: crypto.randomUUID(),
        type: 'service',
        itemId: service.id,
        name: service.name,
        quantity,
        unitPrice: service.price,
        totalPrice: service.price * quantity,
        taxable: false,
        barberId: barberId || transaction.barberId,
      };
    } else {
      const product = await this.getProduct(itemId);
      item = {
        id: crypto.randomUUID(),
        type: 'product',
        itemId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        taxable: product.taxable,
        taxRate: product.taxRate,
      };
    }

    transaction.items.push(item);
    this.calculateTotals(transaction);
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Remove item from transaction
  async removeItem(transactionId: string, itemId: string): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.status !== 'pending') {
      throw new Error('Cannot modify completed transaction');
    }

    transaction.items = transaction.items.filter(item => item.id !== itemId);
    this.calculateTotals(transaction);
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Apply discount
  async applyDiscount(
    transactionId: string,
    discountType: 'percentage' | 'fixed' | 'loyalty',
    value: number,
    name: string,
    code?: string,
    itemIds?: string[]
  ): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.status !== 'pending') {
      throw new Error('Cannot modify completed transaction');
    }

    // Calculate discount amount
    let applicableAmount = transaction.subtotal;
    if (itemIds?.length) {
      applicableAmount = transaction.items
        .filter(item => itemIds.includes(item.id))
        .reduce((sum, item) => sum + item.totalPrice, 0);
    }

    const appliedAmount = discountType === 'percentage'
      ? applicableAmount * (value / 100)
      : Math.min(value, applicableAmount);

    const discount: AppliedDiscount = {
      id: crypto.randomUUID(),
      type: discountType,
      code,
      name,
      value,
      appliedAmount,
      itemIds,
    };

    transaction.discounts.push(discount);
    this.calculateTotals(transaction);
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Set tip amount
  async setTip(transactionId: string, tipAmount: number): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    if (!['pending', 'partial'].includes(transaction.status)) {
      throw new Error('Cannot modify completed transaction');
    }

    transaction.tipAmount = tipAmount;
    this.calculateTotals(transaction);
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Process cash payment
  async processCashPayment(
    transactionId: string,
    amount: number,
    tipAmount: number = 0
  ): Promise<{ transaction: POSTransaction; change: number }> {
    const transaction = await this.getTransaction(transactionId);
    const remaining = this.getRemainingBalance(transaction);
    const totalPayment = amount + tipAmount;

    // Update tip if provided
    if (tipAmount > 0) {
      transaction.tipAmount += tipAmount;
      this.calculateTotals(transaction);
    }

    const paymentAmount = Math.min(amount, remaining);
    const change = amount - paymentAmount;

    const payment: Payment = {
      id: crypto.randomUUID(),
      transactionId,
      method: 'cash',
      amount: paymentAmount,
      tipAmount,
      status: 'succeeded',
      processedAt: new Date(),
      metadata: {},
    };

    transaction.payments.push(payment);

    // Record cash transaction
    await this.recordCashTransaction(transaction.shopId, 'sale', paymentAmount + tipAmount);

    await this.updateTransactionStatus(transaction);
    await this.saveTransaction(transaction);

    return { transaction, change };
  }

  // Process card payment via Stripe Terminal
  async processCardPayment(
    transactionId: string,
    terminalId: string,
    amount?: number
  ): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);
    const paymentAmount = amount || this.getRemainingBalance(transaction);

    if (paymentAmount <= 0) {
      throw new Error('No remaining balance');
    }

    // Get tip configuration
    const tipConfig = await this.getTipConfiguration(transaction.shopId);

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100),
      currency: 'usd',
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
      metadata: {
        transactionId,
        shopId: transaction.shopId,
        barberId: transaction.barberId,
      },
    });

    // Process on terminal with tip collection
    const processResult = await this.stripe.terminal.readers.processPaymentIntent(
      terminalId,
      {
        payment_intent: paymentIntent.id,
      }
    );

    // Create payment record
    const payment: Payment = {
      id: crypto.randomUUID(),
      transactionId,
      method: 'card_present',
      amount: paymentAmount,
      tipAmount: 0, // Will be updated by webhook
      status: 'processing',
      stripePaymentIntentId: paymentIntent.id,
      processedAt: new Date(),
      metadata: {},
    };

    transaction.payments.push(payment);
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Process tap-to-pay payment
  async processTapToPayPayment(
    transactionId: string,
    paymentIntentId: string,
    tipAmount: number = 0
  ): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    // Update tip
    if (tipAmount > 0) {
      transaction.tipAmount += tipAmount;
      this.calculateTotals(transaction);
    }

    // Retrieve payment intent to get details
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    const payment: Payment = {
      id: crypto.randomUUID(),
      transactionId,
      method: 'tap_to_pay',
      amount: paymentIntent.amount / 100,
      tipAmount,
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'processing',
      stripePaymentIntentId: paymentIntentId,
      cardBrand: paymentIntent.payment_method_details?.card_present?.brand,
      cardLast4: paymentIntent.payment_method_details?.card_present?.last4,
      processedAt: new Date(),
      metadata: {},
    };

    transaction.payments.push(payment);
    await this.updateTransactionStatus(transaction);
    await this.saveTransaction(transaction);

    // Distribute tips if transaction complete
    if (transaction.status === 'completed') {
      await this.distributeTips(transaction);
    }

    return transaction;
  }

  // Process split payment
  async processSplitPayment(
    transactionId: string,
    splitType: 'equal' | 'custom',
    numberOfSplits?: number,
    customAmounts?: number[]
  ): Promise<{ transaction: POSTransaction; splits: { amount: number; paid: boolean }[] }> {
    const transaction = await this.getTransaction(transactionId);
    const total = transaction.total;
    let splits: { amount: number; paid: boolean }[];

    if (splitType === 'equal' && numberOfSplits) {
      const splitAmount = Math.ceil((total / numberOfSplits) * 100) / 100;
      splits = Array(numberOfSplits).fill(null).map((_, i) => ({
        amount: i === numberOfSplits - 1
          ? total - (splitAmount * (numberOfSplits - 1))
          : splitAmount,
        paid: false,
      }));
    } else if (splitType === 'custom' && customAmounts) {
      const customTotal = customAmounts.reduce((sum, a) => sum + a, 0);
      if (Math.abs(customTotal - total) > 0.01) {
        throw new Error('Custom split amounts must equal total');
      }
      splits = customAmounts.map(amount => ({ amount, paid: false }));
    } else {
      throw new Error('Invalid split configuration');
    }

    // Store split info in metadata
    transaction.metadata.splits = splits;
    await this.saveTransaction(transaction);

    return { transaction, splits };
  }

  // Void transaction
  async voidTransaction(transactionId: string, reason: string): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.status === 'voided') {
      throw new Error('Transaction already voided');
    }

    // Refund any card payments
    for (const payment of transaction.payments) {
      if (payment.status === 'succeeded' && payment.stripePaymentIntentId) {
        await this.stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
        });
        payment.status = 'refunded';
      }
    }

    // Reverse cash if applicable
    const cashPayments = transaction.payments.filter(p => p.method === 'cash');
    for (const payment of cashPayments) {
      await this.recordCashTransaction(
        transaction.shopId,
        'refund',
        -(payment.amount + payment.tipAmount)
      );
    }

    // Restore inventory
    for (const item of transaction.items) {
      if (item.type === 'product') {
        await this.adjustInventory(item.itemId, item.quantity, 'return', transactionId);
      }
    }

    transaction.status = 'voided';
    transaction.voidedAt = new Date();
    transaction.voidReason = reason;
    await this.saveTransaction(transaction);

    return transaction;
  }

  // Complete transaction and generate receipt
  async completeTransaction(transactionId: string): Promise<POSTransaction> {
    const transaction = await this.getTransaction(transactionId);

    if (transaction.status !== 'pending' && transaction.status !== 'partial') {
      throw new Error('Transaction cannot be completed');
    }

    const remaining = this.getRemainingBalance(transaction);
    if (remaining > 0.01) {
      throw new Error(`Remaining balance of $${remaining.toFixed(2)}`);
    }

    transaction.status = 'completed';
    transaction.completedAt = new Date();

    // Generate receipt
    transaction.receiptUrl = await this.generateReceipt(transaction);

    // Update inventory
    for (const item of transaction.items) {
      if (item.type === 'product') {
        await this.adjustInventory(item.itemId, -item.quantity, 'sale', transactionId);
      }
    }

    // Distribute tips
    await this.distributeTips(transaction);

    // Award loyalty points
    if (transaction.customerId) {
      await this.awardLoyaltyPoints(transaction);
    }

    await this.saveTransaction(transaction);

    return transaction;
  }

  // Distribute tips to barbers
  private async distributeTips(transaction: POSTransaction): Promise<TipDistribution> {
    if (transaction.tipAmount <= 0) {
      return null as any;
    }

    const tipConfig = await this.getTipConfiguration(transaction.shopId);
    const recipients: TipDistribution['recipients'] = [];

    switch (tipConfig.distributionMethod) {
      case 'full_to_barber':
        // All tip goes to primary barber
        const barber = await this.getBarber(transaction.barberId);
        recipients.push({
          barberId: transaction.barberId,
          barberName: barber.name,
          amount: transaction.tipAmount,
          percentage: 100,
        });
        break;

      case 'pooled':
        // Split equally among all working barbers
        const workingBarbers = await this.getWorkingBarbers(transaction.shopId);
        const splitAmount = transaction.tipAmount / workingBarbers.length;
        for (const b of workingBarbers) {
          recipients.push({
            barberId: b.id,
            barberName: b.name,
            amount: splitAmount,
            percentage: 100 / workingBarbers.length,
          });
        }
        break;

      case 'percentage_split':
        // Service barbers get proportional split
        const serviceBarbers = new Set(
          transaction.items
            .filter(i => i.type === 'service' && i.barberId)
            .map(i => i.barberId!)
        );
        const barberCount = serviceBarbers.size || 1;
        const perBarber = transaction.tipAmount / barberCount;
        for (const barberId of serviceBarbers) {
          const b = await this.getBarber(barberId);
          recipients.push({
            barberId,
            barberName: b.name,
            amount: perBarber,
            percentage: 100 / barberCount,
          });
        }
        break;
    }

    const distribution: TipDistribution = {
      transactionId: transaction.id,
      totalTip: transaction.tipAmount,
      recipients,
      distributedAt: new Date(),
    };

    // Send tips to gig worker payment system
    for (const recipient of recipients) {
      await this.recordBarberTip(recipient.barberId, recipient.amount, transaction.id);
    }

    await this.saveTipDistribution(distribution);

    return distribution;
  }

  // Calculate totals
  private calculateTotals(transaction: POSTransaction): void {
    // Subtotal
    transaction.subtotal = transaction.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // Discount total
    transaction.discountTotal = transaction.discounts.reduce(
      (sum, d) => sum + d.appliedAmount,
      0
    );

    // Tax (on taxable items after discount)
    const taxableSubtotal = transaction.items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const taxableAfterDiscount = Math.max(
      0,
      taxableSubtotal - transaction.discountTotal
    );

    // Get shop tax rate or use item-level rates
    const shopTaxRate = 0.0825; // 8.25% default
    transaction.taxAmount = transaction.items
      .filter(item => item.taxable)
      .reduce((sum, item) => {
        const itemAfterDiscount = item.totalPrice * (1 - transaction.discountTotal / transaction.subtotal);
        return sum + (itemAfterDiscount * (item.taxRate || shopTaxRate));
      }, 0);

    // Total
    transaction.total =
      transaction.subtotal -
      transaction.discountTotal +
      transaction.taxAmount +
      transaction.tipAmount;
  }

  private getRemainingBalance(transaction: POSTransaction): number {
    const paid = transaction.payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount + p.tipAmount, 0);
    return Math.max(0, transaction.total - paid);
  }

  private async updateTransactionStatus(transaction: POSTransaction): Promise<void> {
    const remaining = this.getRemainingBalance(transaction);
    if (remaining <= 0.01) {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
    } else if (transaction.payments.length > 0) {
      transaction.status = 'partial';
    }
  }

  // End of day report
  async generateEndOfDayReport(shopId: string, date: Date): Promise<EndOfDayReport> {
    const transactions = await this.getTransactionsForDate(shopId, date);

    const report: EndOfDayReport = {
      shopId,
      date,
      openingTime: new Date(),
      closingTime: new Date(),
      summary: {
        totalTransactions: 0,
        grossSales: 0,
        discounts: 0,
        netSales: 0,
        taxCollected: 0,
        tipsCollected: 0,
        refunds: 0,
        voids: 0,
      },
      salesByMethod: {} as Record<PaymentMethod, number>,
      salesByBarber: [],
      salesByCategory: {},
      topProducts: [],
      cashReconciliation: {
        expectedCash: 0,
        actualCash: 0,
        variance: 0,
      },
    };

    const barberSales = new Map<string, typeof report.salesByBarber[0]>();
    const productSales = new Map<string, { quantity: number; revenue: number; name: string }>();

    for (const tx of transactions) {
      if (tx.status === 'voided') {
        report.summary.voids++;
        continue;
      }

      if (tx.status === 'refunded') {
        report.summary.refunds += tx.total;
        continue;
      }

      report.summary.totalTransactions++;
      report.summary.grossSales += tx.subtotal;
      report.summary.discounts += tx.discountTotal;
      report.summary.taxCollected += tx.taxAmount;
      report.summary.tipsCollected += tx.tipAmount;

      // By payment method
      for (const payment of tx.payments) {
        report.salesByMethod[payment.method] =
          (report.salesByMethod[payment.method] || 0) + payment.amount;

        if (payment.method === 'cash') {
          report.cashReconciliation.expectedCash += payment.amount + payment.tipAmount;
        }
      }

      // By barber
      for (const item of tx.items) {
        const barberId = item.barberId || tx.barberId;
        let barberSale = barberSales.get(barberId);
        if (!barberSale) {
          const barber = await this.getBarber(barberId);
          barberSale = {
            barberId,
            barberName: barber.name,
            services: 0,
            products: 0,
            tips: 0,
            total: 0,
          };
          barberSales.set(barberId, barberSale);
        }

        if (item.type === 'service') {
          barberSale.services += item.totalPrice;
        } else {
          barberSale.products += item.totalPrice;
        }
        barberSale.total += item.totalPrice;
      }

      // Distribute tips to barber sales
      const tipDist = await this.getTipDistribution(tx.id);
      if (tipDist) {
        for (const recipient of tipDist.recipients) {
          const barberSale = barberSales.get(recipient.barberId);
          if (barberSale) {
            barberSale.tips += recipient.amount;
          }
        }
      }

      // Product sales tracking
      for (const item of tx.items.filter(i => i.type === 'product')) {
        const existing = productSales.get(item.itemId) || {
          quantity: 0,
          revenue: 0,
          name: item.name,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        productSales.set(item.itemId, existing);
      }
    }

    report.summary.netSales = report.summary.grossSales - report.summary.discounts;
    report.salesByBarber = Array.from(barberSales.values());
    report.topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return report;
  }

  // Helper methods (implementations needed)
  private async getTransaction(id: string): Promise<POSTransaction> {
    throw new Error('Not implemented');
  }

  private async saveTransaction(tx: POSTransaction): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getAppointment(id: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getQueueEntry(id: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getService(id: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getProduct(id: string): Promise<Product> {
    throw new Error('Not implemented');
  }

  private async getBarber(id: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getWorkingBarbers(shopId: string): Promise<any[]> {
    throw new Error('Not implemented');
  }

  private async getTipConfiguration(shopId: string): Promise<TipConfiguration> {
    throw new Error('Not implemented');
  }

  private async generateReceiptNumber(shopId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async generateReceipt(tx: POSTransaction): Promise<string> {
    throw new Error('Not implemented');
  }

  private async adjustInventory(
    productId: string,
    quantity: number,
    type: string,
    reference?: string
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  private async recordCashTransaction(
    shopId: string,
    type: string,
    amount: number
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  private async recordBarberTip(
    barberId: string,
    amount: number,
    transactionId: string
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveTipDistribution(distribution: TipDistribution): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getTipDistribution(transactionId: string): Promise<TipDistribution | null> {
    throw new Error('Not implemented');
  }

  private async awardLoyaltyPoints(tx: POSTransaction): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getTransactionsForDate(shopId: string, date: Date): Promise<POSTransaction[]> {
    throw new Error('Not implemented');
  }
}
```

## Database Schema

```sql
-- POS Transactions
CREATE TABLE pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  customer_id UUID REFERENCES customers(id),
  appointment_id UUID REFERENCES appointments(id),
  queue_entry_id UUID REFERENCES queue_entries(id),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tip_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  receipt_number VARCHAR(50) NOT NULL,
  receipt_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  void_reason TEXT
);

-- Transaction items
CREATE TABLE pos_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
  type VARCHAR(20) NOT NULL,
  item_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  taxable BOOLEAN DEFAULT false,
  tax_rate DECIMAL(5, 4),
  barber_id UUID REFERENCES barbers(id),
  commission DECIMAL(10, 2)
);

-- Transaction payments
CREATE TABLE pos_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
  method VARCHAR(30) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tip_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  card_brand VARCHAR(20),
  card_last4 VARCHAR(4),
  reference VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applied discounts
CREATE TABLE pos_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
  type VARCHAR(20) NOT NULL,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  applied_amount DECIMAL(10, 2) NOT NULL,
  item_ids UUID[]
);

-- Products
CREATE TABLE pos_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  sku VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5, 4),
  track_inventory BOOLEAN DEFAULT true,
  current_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  image_url TEXT,
  barcode VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory adjustments
CREATE TABLE pos_inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES pos_products(id),
  type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  transaction_id UUID REFERENCES pos_transactions(id),
  notes TEXT,
  adjusted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash drawer
CREATE TABLE pos_cash_drawers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  terminal_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'closed',
  opened_at TIMESTAMPTZ,
  opened_by UUID REFERENCES users(id),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES users(id),
  opening_balance DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  expected_balance DECIMAL(10, 2) DEFAULT 0,
  cash_in DECIMAL(10, 2) DEFAULT 0,
  cash_out DECIMAL(10, 2) DEFAULT 0
);

-- Cash transactions
CREATE TABLE pos_cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawer_id UUID NOT NULL REFERENCES pos_cash_drawers(id),
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tip distributions
CREATE TABLE pos_tip_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
  total_tip DECIMAL(10, 2) NOT NULL,
  distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tip recipients
CREATE TABLE pos_tip_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES pos_tip_distributions(id),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  amount DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL
);

-- Tip configuration
CREATE TABLE pos_tip_config (
  shop_id UUID PRIMARY KEY REFERENCES barbershops(id),
  enabled BOOLEAN DEFAULT true,
  suggested_amounts DECIMAL[] DEFAULT '{15, 20, 25}',
  suggested_type VARCHAR(20) DEFAULT 'percentage',
  custom_amount_allowed BOOLEAN DEFAULT true,
  minimum_amount DECIMAL(10, 2),
  maximum_amount DECIMAL(10, 2),
  default_selection INTEGER DEFAULT 1,
  show_after_payment BOOLEAN DEFAULT true,
  distribution_method VARCHAR(30) DEFAULT 'full_to_barber'
);

-- Indexes
CREATE INDEX idx_pos_transactions_shop ON pos_transactions(shop_id);
CREATE INDEX idx_pos_transactions_barber ON pos_transactions(barber_id);
CREATE INDEX idx_pos_transactions_customer ON pos_transactions(customer_id);
CREATE INDEX idx_pos_transactions_status ON pos_transactions(status);
CREATE INDEX idx_pos_transactions_created ON pos_transactions(created_at DESC);
CREATE INDEX idx_pos_payments_transaction ON pos_payments(transaction_id);
CREATE INDEX idx_pos_products_shop ON pos_products(shop_id);
CREATE INDEX idx_pos_products_sku ON pos_products(sku);
CREATE INDEX idx_pos_inventory_product ON pos_inventory_adjustments(product_id);
```

## API Endpoints

```typescript
// POST /api/pos/transactions
// Create transaction
{
  request: {
    shopId: string,
    barberId: string,
    appointmentId?: string,
    queueEntryId?: string,
    customerId?: string
  },
  response: POSTransaction
}

// POST /api/pos/transactions/:id/items
// Add item
{
  request: {
    type: 'service' | 'product',
    itemId: string,
    quantity?: number,
    barberId?: string
  },
  response: POSTransaction
}

// DELETE /api/pos/transactions/:id/items/:itemId
// Remove item
{
  response: POSTransaction
}

// POST /api/pos/transactions/:id/discount
// Apply discount
{
  request: {
    type: 'percentage' | 'fixed',
    value: number,
    name: string,
    code?: string
  },
  response: POSTransaction
}

// POST /api/pos/transactions/:id/tip
// Set tip
{
  request: { amount: number },
  response: POSTransaction
}

// POST /api/pos/transactions/:id/pay/cash
// Cash payment
{
  request: { amount: number, tipAmount?: number },
  response: { transaction: POSTransaction, change: number }
}

// POST /api/pos/transactions/:id/pay/card
// Card payment
{
  request: { terminalId: string, amount?: number },
  response: POSTransaction
}

// POST /api/pos/transactions/:id/complete
// Complete transaction
{
  response: POSTransaction
}

// POST /api/pos/transactions/:id/void
// Void transaction
{
  request: { reason: string },
  response: POSTransaction
}

// GET /api/pos/reports/end-of-day
// End of day report
{
  query: { date: string },
  response: EndOfDayReport
}
```

## Related Skills
- `tap-to-pay-standard.md` - Mobile payment processing
- `gig-worker-payments-standard.md` - Tip distribution to barbers
- `barbershop-loyalty-standard.md` - Loyalty point redemption

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Barbershop
