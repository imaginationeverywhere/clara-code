# Tap-to-Pay Standard

## Overview
NFC payment processing standard for contactless payments, enabling devices (phones, terminals) to accept tap payments via Stripe Terminal and Apple Pay/Google Pay integration.

## Domain Context
- **Primary Projects**: Tap-to-Tip, Quik Barbershop, Quik Events
- **Related Domains**: Barbershop, Events, Delivery
- **Key Integration**: Stripe Terminal SDK, Apple Pay, Google Pay

## Core Interfaces

### NFC Payment Session
```typescript
interface NFCPaymentSession {
  id: string;
  merchantId: string;
  terminalId: string;
  status: 'initializing' | 'ready' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paymentMethod?: NFCPaymentMethod;
  cardBrand?: string;
  last4?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface NFCPaymentMethod {
  type: 'apple_pay' | 'google_pay' | 'contactless_card' | 'tap_to_pay';
  walletType?: 'apple' | 'google' | 'samsung';
  deviceId?: string;
}

interface TerminalDevice {
  id: string;
  merchantId: string;
  serialNumber: string;
  type: 'mobile' | 'countertop' | 'portable';
  model: string;
  status: 'online' | 'offline' | 'updating' | 'error';
  lastSeen: Date;
  batteryLevel?: number;
  firmwareVersion: string;
  location?: {
    latitude: number;
    longitude: number;
    label?: string;
  };
}
```

### Tap-to-Pay on iPhone
```typescript
interface TapToPayConfig {
  merchantId: string;
  appleBusinessId: string;
  locationId: string;
  enabled: boolean;
  supportedNetworks: ('visa' | 'mastercard' | 'amex' | 'discover')[];
  minimumAmount: number;
  maximumAmount: number;
}

interface TapToPayTransaction {
  id: string;
  sessionId: string;
  merchantId: string;
  amount: number;
  tipAmount?: number;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentIntentId: string;
  chargeId?: string;
  receiptUrl?: string;
  metadata: Record<string, string>;
  createdAt: Date;
}

type TransactionStatus =
  | 'pending'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';
```

## Service Implementation

### Tap-to-Pay Service
```typescript
import Stripe from 'stripe';

export class TapToPayService {
  private stripe: Stripe;
  private terminalConnectionTokens: Map<string, string> = new Map();

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  }

  // Initialize terminal reader for merchant
  async registerTerminal(
    merchantId: string,
    registrationCode: string,
    label: string
  ): Promise<TerminalDevice> {
    const reader = await this.stripe.terminal.readers.create({
      registration_code: registrationCode,
      label,
      location: await this.getOrCreateLocation(merchantId),
      metadata: { merchantId },
    });

    return this.mapReaderToDevice(reader, merchantId);
  }

  // Create connection token for client SDK
  async createConnectionToken(merchantId: string): Promise<string> {
    const token = await this.stripe.terminal.connectionTokens.create({
      location: await this.getOrCreateLocation(merchantId),
    });

    this.terminalConnectionTokens.set(merchantId, token.secret);
    return token.secret;
  }

  // Process tap payment
  async processPayment(
    terminalId: string,
    amount: number,
    tipAmount: number = 0,
    metadata: Record<string, string> = {}
  ): Promise<TapToPayTransaction> {
    const totalAmount = amount + tipAmount;

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
      metadata: {
        ...metadata,
        tipAmount: tipAmount.toString(),
        baseAmount: amount.toString(),
      },
    });

    // Process on terminal
    const processedIntent = await this.stripe.terminal.readers.processPaymentIntent(
      terminalId,
      { payment_intent: paymentIntent.id }
    );

    return {
      id: crypto.randomUUID(),
      sessionId: processedIntent.id,
      merchantId: metadata.merchantId || '',
      amount,
      tipAmount,
      totalAmount,
      currency: 'usd',
      status: this.mapPaymentIntentStatus(paymentIntent.status),
      paymentIntentId: paymentIntent.id,
      metadata,
      createdAt: new Date(),
    };
  }

  // Handle tip on tap-to-pay
  async collectTipOnReader(
    terminalId: string,
    paymentIntentId: string,
    tipOptions: { percentages?: number[]; amounts?: number[] }
  ): Promise<number> {
    // Stripe Terminal handles tip collection on device
    const result = await this.stripe.terminal.readers.setReaderDisplay(
      terminalId,
      {
        type: 'cart',
        cart: {
          line_items: [],
          tax: 0,
          total: 0,
          currency: 'usd',
        },
      }
    );

    // Tip amount returned from reader interaction
    return 0; // Placeholder - actual tip comes from reader callback
  }

  // Cancel active payment
  async cancelPayment(terminalId: string): Promise<void> {
    await this.stripe.terminal.readers.cancelAction(terminalId);
  }

  // Refund transaction
  async refundTransaction(
    chargeId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      charge: chargeId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  }

  // Get terminal status
  async getTerminalStatus(terminalId: string): Promise<TerminalDevice> {
    const reader = await this.stripe.terminal.readers.retrieve(terminalId);
    return this.mapReaderToDevice(reader, reader.metadata?.merchantId || '');
  }

  // List merchant terminals
  async listMerchantTerminals(merchantId: string): Promise<TerminalDevice[]> {
    const location = await this.getOrCreateLocation(merchantId);
    const readers = await this.stripe.terminal.readers.list({
      location,
      limit: 100,
    });

    return readers.data.map(reader => this.mapReaderToDevice(reader, merchantId));
  }

  private async getOrCreateLocation(merchantId: string): Promise<string> {
    const locations = await this.stripe.terminal.locations.list({
      limit: 1,
    });

    const existing = locations.data.find(
      loc => loc.metadata?.merchantId === merchantId
    );

    if (existing) return existing.id;

    const location = await this.stripe.terminal.locations.create({
      display_name: `Location for ${merchantId}`,
      address: {
        line1: 'TBD',
        city: 'TBD',
        state: 'CA',
        postal_code: '00000',
        country: 'US',
      },
      metadata: { merchantId },
    });

    return location.id;
  }

  private mapReaderToDevice(reader: Stripe.Terminal.Reader, merchantId: string): TerminalDevice {
    return {
      id: reader.id,
      merchantId,
      serialNumber: reader.serial_number || '',
      type: reader.device_type?.includes('mobile') ? 'mobile' : 'countertop',
      model: reader.device_type || 'unknown',
      status: reader.status === 'online' ? 'online' : 'offline',
      lastSeen: new Date(),
      firmwareVersion: reader.device_sw_version || '',
      location: reader.location ? {
        latitude: 0,
        longitude: 0,
        label: typeof reader.location === 'string' ? reader.location : reader.location.display_name,
      } : undefined,
    };
  }

  private mapPaymentIntentStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'requires_confirmation',
      'requires_action': 'processing',
      'processing': 'processing',
      'succeeded': 'succeeded',
      'canceled': 'cancelled',
    };
    return statusMap[status] || 'pending';
  }
}
```

### Mobile SDK Integration (React Native)
```typescript
// React Native Tap-to-Pay Hook
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';

export function useTapToPay(merchantId: string) {
  const {
    initialize,
    discoverReaders,
    connectReader,
    collectPaymentMethod,
    processPayment,
    cancelCollectPaymentMethod,
  } = useStripeTerminal();

  const [isInitialized, setIsInitialized] = useState(false);
  const [connectedReader, setConnectedReader] = useState<Reader | null>(null);

  // Initialize SDK
  const initializeTerminal = useCallback(async () => {
    const { error } = await initialize({
      logLevel: 'verbose',
    });

    if (!error) {
      setIsInitialized(true);
    }
    return { error };
  }, [initialize]);

  // Discover and connect to Tap-to-Pay on iPhone
  const connectTapToPay = useCallback(async () => {
    const { readers, error: discoverError } = await discoverReaders({
      discoveryMethod: 'localMobile', // Tap-to-Pay on iPhone
      simulated: __DEV__,
    });

    if (discoverError || !readers?.length) {
      return { error: discoverError || new Error('No readers found') };
    }

    const { reader, error: connectError } = await connectReader({
      reader: readers[0],
      locationId: await getLocationId(merchantId),
    });

    if (!connectError && reader) {
      setConnectedReader(reader);
    }

    return { reader, error: connectError };
  }, [merchantId, discoverReaders, connectReader]);

  // Collect payment
  const collectPayment = useCallback(async (
    amount: number,
    metadata?: Record<string, string>
  ) => {
    if (!connectedReader) {
      return { error: new Error('No reader connected') };
    }

    // Create payment intent on server
    const { paymentIntentClientSecret } = await createPaymentIntent({
      amount,
      merchantId,
      metadata,
    });

    // Collect payment method
    const { paymentIntent: collectedIntent, error: collectError } =
      await collectPaymentMethod({ paymentIntent: paymentIntentClientSecret });

    if (collectError) {
      return { error: collectError };
    }

    // Process payment
    const { paymentIntent, error: processError } = await processPayment({
      paymentIntent: collectedIntent!,
    });

    return { paymentIntent, error: processError };
  }, [connectedReader, merchantId, collectPaymentMethod, processPayment]);

  // Cancel current payment
  const cancelPayment = useCallback(async () => {
    return cancelCollectPaymentMethod();
  }, [cancelCollectPaymentMethod]);

  return {
    isInitialized,
    connectedReader,
    initializeTerminal,
    connectTapToPay,
    collectPayment,
    cancelPayment,
  };
}
```

## Database Schema

```sql
-- Terminal devices
CREATE TABLE terminal_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  stripe_reader_id VARCHAR(255) UNIQUE NOT NULL,
  serial_number VARCHAR(100),
  device_type VARCHAR(50) NOT NULL,
  model VARCHAR(100),
  label VARCHAR(255),
  status VARCHAR(20) DEFAULT 'offline',
  firmware_version VARCHAR(50),
  last_seen_at TIMESTAMPTZ,
  location_id UUID REFERENCES terminal_locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terminal locations
CREATE TABLE terminal_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  stripe_location_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_postal_code VARCHAR(20),
  address_country VARCHAR(2) DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tap-to-pay transactions
CREATE TABLE tap_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  terminal_id UUID REFERENCES terminal_devices(id),
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  stripe_charge_id VARCHAR(255),
  amount INTEGER NOT NULL, -- in cents
  tip_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_method_type VARCHAR(50),
  card_brand VARCHAR(20),
  card_last4 VARCHAR(4),
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount INTEGER
);

-- Indexes
CREATE INDEX idx_terminal_devices_merchant ON terminal_devices(merchant_id);
CREATE INDEX idx_terminal_devices_status ON terminal_devices(status);
CREATE INDEX idx_tap_transactions_merchant ON tap_transactions(merchant_id);
CREATE INDEX idx_tap_transactions_status ON tap_transactions(status);
CREATE INDEX idx_tap_transactions_created ON tap_transactions(created_at DESC);
CREATE INDEX idx_tap_transactions_payment_intent ON tap_transactions(stripe_payment_intent_id);
```

## API Endpoints

```typescript
// POST /api/terminal/connection-token
// Create connection token for SDK
{
  request: { merchantId: string },
  response: { secret: string, expiresAt: string }
}

// POST /api/terminal/register
// Register new terminal
{
  request: { merchantId: string, registrationCode: string, label: string },
  response: TerminalDevice
}

// POST /api/terminal/payment
// Process tap payment
{
  request: {
    terminalId: string,
    amount: number,
    tipAmount?: number,
    metadata?: Record<string, string>
  },
  response: TapToPayTransaction
}

// POST /api/terminal/:id/cancel
// Cancel active payment
{
  response: { success: boolean }
}

// GET /api/terminal/list
// List merchant terminals
{
  query: { merchantId: string },
  response: { terminals: TerminalDevice[] }
}

// POST /api/transaction/:id/refund
// Refund transaction
{
  request: { amount?: number, reason?: string },
  response: { refundId: string, status: string }
}
```

## Security Requirements

1. **PCI DSS Compliance**: All card data handled by Stripe SDK, never touches our servers
2. **Terminal Authentication**: Each terminal authenticated via Stripe
3. **Merchant Verification**: Validate merchant owns terminal before operations
4. **Transaction Limits**: Configurable min/max amounts per merchant
5. **Encryption**: All terminal communication encrypted end-to-end

## Related Skills
- `gig-worker-payments-standard.md` - Tip distribution after tap payment
- `consumer-wallet-standard.md` - Wallet funding via tap-to-pay
- `barbershop-pos-standard.md` - POS integration for barbershops

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Fintech
