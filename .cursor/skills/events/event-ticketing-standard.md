# Event Ticketing Standard

Comprehensive event ticketing system with PassKit integration, dynamic pricing, and capacity management.

## Target Projects
- **Site962/QuikEvents** - Multi-tenant venue and event platform

## Core Components

### 1. Event Management

```typescript
interface Event {
  id: string;
  tenantId: string;
  venueId: string;
  name: string;
  description: string;
  category: EventCategory;
  status: 'draft' | 'published' | 'on_sale' | 'sold_out' | 'cancelled' | 'completed';

  // Timing
  startDate: Date;
  endDate: Date;
  doorsOpen: Date;
  timezone: string;

  // Capacity
  totalCapacity: number;
  remainingCapacity: number;

  // Media
  coverImage: string;
  gallery: string[];
  videoUrl?: string;

  // Settings
  settings: EventSettings;
  ticketTypes: TicketType[];
  promoCodes: PromoCode[];

  // Analytics
  views: number;
  ticketsSold: number;
  revenue: number;

  createdAt: Date;
  updatedAt: Date;
}

interface EventSettings {
  allowWaitlist: boolean;
  waitlistCapacity: number;
  requireApproval: boolean;
  ageRestriction?: number;
  refundPolicy: RefundPolicy;
  transferPolicy: 'allowed' | 'approval_required' | 'not_allowed';
  resalePolicy: 'allowed' | 'face_value_only' | 'not_allowed';
}

type EventCategory =
  | 'concert'
  | 'festival'
  | 'sports'
  | 'theater'
  | 'comedy'
  | 'conference'
  | 'workshop'
  | 'party'
  | 'other';
```

### 2. Ticket Types

```typescript
interface TicketType {
  id: string;
  eventId: string;
  name: string;                    // "General Admission", "VIP", "Early Bird"
  description: string;
  type: 'general_admission' | 'reserved_seating' | 'table' | 'vip';

  // Pricing
  price: number;
  currency: string;
  fees: TicketFees;

  // Inventory
  totalQuantity: number;
  remainingQuantity: number;
  maxPerOrder: number;
  minPerOrder: number;

  // Availability
  saleStart: Date;
  saleEnd: Date;
  visibility: 'public' | 'hidden' | 'promo_only';

  // Perks
  perks: string[];
  accessAreas: string[];          // "Main Floor", "Backstage", "VIP Lounge"

  // Seating (for reserved)
  seatMapId?: string;
  sections?: string[];

  status: 'available' | 'sold_out' | 'not_on_sale' | 'hidden';
}

interface TicketFees {
  serviceFee: number;
  facilityFee: number;
  processingFee: number;
  taxRate: number;
  absorbFees: boolean;            // If true, fees included in displayed price
}
```

### 3. Ticket Instance

```typescript
interface Ticket {
  id: string;
  ticketTypeId: string;
  eventId: string;
  orderId: string;

  // Holder
  holderId: string;
  holderName: string;
  holderEmail: string;

  // Identification
  barcode: string;                // Unique scannable code
  qrCode: string;                 // QR code data
  serialNumber: string;

  // Seating (if reserved)
  section?: string;
  row?: string;
  seat?: string;

  // Status
  status: 'valid' | 'used' | 'cancelled' | 'transferred' | 'refunded';
  checkedInAt?: Date;
  checkedInBy?: string;

  // Transfer history
  transferHistory: TicketTransfer[];

  // PassKit
  passKitSerialNumber?: string;
  passKitUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface TicketTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  transferredAt: Date;
  reason?: string;
}
```

## Ticket Generation Service

```typescript
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export class TicketGenerationService {
  /**
   * Generate tickets for an order
   */
  async generateTickets(
    order: Order,
    ticketType: TicketType,
    quantity: number
  ): Promise<Ticket[]> {
    const tickets: Ticket[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticket = await this.createTicket(order, ticketType);
      tickets.push(ticket);
    }

    // Update inventory
    await this.updateInventory(ticketType.id, -quantity);

    return tickets;
  }

  private async createTicket(
    order: Order,
    ticketType: TicketType
  ): Promise<Ticket> {
    const barcode = this.generateBarcode();
    const serialNumber = this.generateSerialNumber(ticketType.eventId);

    const ticket: Ticket = {
      id: uuidv4(),
      ticketTypeId: ticketType.id,
      eventId: ticketType.eventId,
      orderId: order.id,
      holderId: order.userId,
      holderName: order.customerName,
      holderEmail: order.customerEmail,
      barcode,
      qrCode: this.generateQRData(barcode),
      serialNumber,
      status: 'valid',
      transferHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate PassKit pass
    if (this.passKitEnabled) {
      const pass = await this.passKitService.createTicketPass(ticket, ticketType);
      ticket.passKitSerialNumber = pass.serialNumber;
      ticket.passKitUrl = pass.downloadUrl;
    }

    await this.ticketRepository.save(ticket);
    return ticket;
  }

  /**
   * Generate unique barcode (13 digits)
   */
  private generateBarcode(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = crypto.randomBytes(4).toString('hex').slice(0, 7);
    return timestamp + random;
  }

  /**
   * Generate serial number
   */
  private generateSerialNumber(eventId: string): string {
    const prefix = eventId.slice(0, 4).toUpperCase();
    const sequence = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${sequence}`;
  }

  /**
   * Generate QR code data
   */
  private generateQRData(barcode: string): string {
    const payload = {
      type: 'ticket',
      barcode,
      timestamp: Date.now()
    };
    const signature = this.signPayload(JSON.stringify(payload));
    return JSON.stringify({ ...payload, signature });
  }
}
```

## Dynamic Pricing Engine

```typescript
interface PricingRule {
  id: string;
  ticketTypeId: string;
  type: 'time_based' | 'inventory_based' | 'demand_based';
  conditions: PricingCondition[];
  adjustment: PriceAdjustment;
  priority: number;
  active: boolean;
}

interface PricingCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'between';
  value: any;
}

interface PriceAdjustment {
  type: 'percentage' | 'fixed';
  value: number;
}

export class DynamicPricingService {
  /**
   * Calculate current price for ticket type
   */
  async calculatePrice(ticketType: TicketType): Promise<PriceCalculation> {
    const basePrice = ticketType.price;
    let adjustedPrice = basePrice;
    const appliedRules: PricingRule[] = [];

    // Get active pricing rules
    const rules = await this.getPricingRules(ticketType.id);

    for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
      if (await this.evaluateConditions(rule, ticketType)) {
        adjustedPrice = this.applyAdjustment(adjustedPrice, rule.adjustment);
        appliedRules.push(rule);
      }
    }

    // Calculate fees
    const fees = this.calculateFees(adjustedPrice, ticketType.fees);

    return {
      basePrice,
      adjustedPrice,
      fees,
      totalPrice: adjustedPrice + fees.total,
      appliedRules
    };
  }

  /**
   * Evaluate pricing conditions
   */
  private async evaluateConditions(
    rule: PricingRule,
    ticketType: TicketType
  ): Promise<boolean> {
    switch (rule.type) {
      case 'time_based':
        return this.evaluateTimeConditions(rule.conditions, ticketType);

      case 'inventory_based':
        const soldPercentage = 1 - (ticketType.remainingQuantity / ticketType.totalQuantity);
        return this.evaluateInventoryConditions(rule.conditions, soldPercentage);

      case 'demand_based':
        const demandScore = await this.getDemandScore(ticketType.eventId);
        return this.evaluateDemandConditions(rule.conditions, demandScore);

      default:
        return false;
    }
  }

  /**
   * Time-based pricing (early bird, last minute)
   */
  private evaluateTimeConditions(
    conditions: PricingCondition[],
    ticketType: TicketType
  ): boolean {
    const now = new Date();
    const eventDate = new Date(ticketType.saleEnd);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    for (const condition of conditions) {
      if (condition.field === 'days_until_event') {
        switch (condition.operator) {
          case 'gt': return daysUntilEvent > condition.value;
          case 'lt': return daysUntilEvent < condition.value;
          case 'between': return daysUntilEvent >= condition.value[0] && daysUntilEvent <= condition.value[1];
        }
      }
    }
    return false;
  }
}
```

## Capacity Management

```typescript
export class CapacityManagementService {
  /**
   * Check and reserve capacity
   */
  async reserveCapacity(
    ticketTypeId: string,
    quantity: number,
    sessionId: string
  ): Promise<CapacityReservation | null> {
    // Use Redis for atomic operations
    const lockKey = `capacity:${ticketTypeId}`;

    return await this.redis.transaction(async (tx) => {
      // Get current capacity
      const ticketType = await this.getTicketType(ticketTypeId);

      if (ticketType.remainingQuantity < quantity) {
        return null; // Not enough capacity
      }

      // Create temporary reservation (10 min expiry)
      const reservation: CapacityReservation = {
        id: generateId(),
        ticketTypeId,
        quantity,
        sessionId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        status: 'held'
      };

      await tx.set(`reservation:${reservation.id}`, JSON.stringify(reservation), 'EX', 600);

      // Decrement available capacity
      await tx.hincrby(lockKey, 'reserved', quantity);

      return reservation;
    });
  }

  /**
   * Release expired reservations
   */
  async releaseExpiredReservations(): Promise<number> {
    const expiredKeys = await this.redis.keys('reservation:*');
    let released = 0;

    for (const key of expiredKeys) {
      const reservation = JSON.parse(await this.redis.get(key) || '{}');

      if (reservation.expiresAt && new Date(reservation.expiresAt) < new Date()) {
        if (reservation.status === 'held') {
          // Release capacity back
          await this.releaseCapacity(reservation.ticketTypeId, reservation.quantity);
          await this.redis.del(key);
          released += reservation.quantity;
        }
      }
    }

    return released;
  }

  /**
   * Manage waitlist
   */
  async addToWaitlist(
    eventId: string,
    ticketTypeId: string,
    userId: string,
    quantity: number
  ): Promise<WaitlistEntry> {
    const position = await this.getWaitlistPosition(eventId, ticketTypeId);

    const entry: WaitlistEntry = {
      id: generateId(),
      eventId,
      ticketTypeId,
      userId,
      quantity,
      position,
      status: 'waiting',
      notifiedAt: null,
      expiresAt: null,
      createdAt: new Date()
    };

    await this.waitlistRepository.save(entry);
    return entry;
  }
}
```

## Database Schema

```sql
-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  venue_id UUID REFERENCES venues(id),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  doors_open TIMESTAMPTZ,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  total_capacity INTEGER NOT NULL,
  remaining_capacity INTEGER NOT NULL,
  cover_image VARCHAR(500),
  gallery TEXT[],
  settings JSONB DEFAULT '{}',
  views INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Types
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  fees JSONB DEFAULT '{}',
  total_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  max_per_order INTEGER DEFAULT 10,
  min_per_order INTEGER DEFAULT 1,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  visibility VARCHAR(50) DEFAULT 'public',
  perks TEXT[],
  access_areas TEXT[],
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  event_id UUID NOT NULL REFERENCES events(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  holder_id UUID REFERENCES users(id),
  holder_name VARCHAR(255) NOT NULL,
  holder_email VARCHAR(255) NOT NULL,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  qr_code TEXT,
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  section VARCHAR(50),
  row VARCHAR(20),
  seat VARCHAR(20),
  status VARCHAR(50) DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  passkit_serial VARCHAR(100),
  passkit_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_tickets_barcode ON tickets(barcode);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_holder ON tickets(holder_id);
```

## Related Skills
- `venue-pos-standard` - Point of sale integration
- `venue-contract-standard` - Venue booking contracts
- `passkit-integration` - Digital wallet tickets
