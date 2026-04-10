# Equipment Rental Standard

## Overview
Equipment rental management for construction, party supplies, tools, and heavy machinery. Handles inventory tracking, availability scheduling, pricing tiers, damage assessment, and rental agreements with deposits.

## Domain Context
- **Primary Projects**: Quik Rentals, Pink-Collar-Contractors (equipment rental)
- **Related Domains**: Construction, Payments, Delivery
- **Key Integration**: Stripe (deposits/payments), DocuSign (agreements), IoT (tracking)

## Core Interfaces

```typescript
interface RentalItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string;
  sku: string;
  serialNumber?: string;
  status: ItemStatus;
  condition: ItemCondition;
  location: RentalLocation;
  pricing: RentalPricing;
  specifications: Record<string, string>;
  images: string[];
  documents: ItemDocument[];
  maintenanceSchedule?: MaintenanceSchedule;
  iotDeviceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ItemStatus = 'available' | 'rented' | 'reserved' | 'maintenance' | 'retired';

interface ItemCondition {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  lastInspection: Date;
  notes: string[];
  damageReports: DamageReport[];
}

interface RentalPricing {
  hourlyRate?: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate?: number;
  deposit: number;
  insuranceRequired: boolean;
  insuranceFee?: number;
  deliveryFee?: number;
  minimumRentalPeriod: number;
  minimumRentalUnit: 'hours' | 'days' | 'weeks';
}

interface RentalReservation {
  id: string;
  tenantId: string;
  customerId: string;
  customer: RentalCustomer;
  items: ReservationItem[];
  status: ReservationStatus;
  startDate: Date;
  endDate: Date;
  pickupMethod: 'pickup' | 'delivery';
  pickupLocation?: string;
  deliveryAddress?: Address;
  pricing: ReservationPricing;
  deposit: DepositInfo;
  agreement?: RentalAgreement;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'active'
  | 'returned'
  | 'completed'
  | 'cancelled';

interface ReservationItem {
  itemId: string;
  item: RentalItem;
  quantity: number;
  checkoutCondition?: ItemCondition;
  returnCondition?: ItemCondition;
  accessories: string[];
}

interface ReservationPricing {
  subtotal: number;
  deliveryFee: number;
  insuranceFee: number;
  taxes: number;
  discount?: DiscountInfo;
  total: number;
  depositAmount: number;
}

interface DepositInfo {
  amount: number;
  status: 'pending' | 'held' | 'partially_refunded' | 'refunded' | 'forfeited';
  stripePaymentIntentId?: string;
  heldAt?: Date;
  releasedAt?: Date;
  deductions?: DepositDeduction[];
}

interface DepositDeduction {
  reason: 'damage' | 'late_return' | 'missing_item' | 'cleaning';
  amount: number;
  description: string;
  evidence?: string[];
}

interface RentalAgreement {
  id: string;
  reservationId: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  documentUrl: string;
  docusignEnvelopeId?: string;
  signedAt?: Date;
  signerName: string;
  signerEmail: string;
  terms: AgreementTerms;
}

interface AgreementTerms {
  liabilityLimit: number;
  lateReturnPenalty: number;
  damagePolicy: string;
  cancellationPolicy: string;
  insuranceTerms?: string;
}

interface DamageReport {
  id: string;
  itemId: string;
  reservationId: string;
  reportedBy: string;
  type: 'pre_existing' | 'new_damage' | 'wear_and_tear';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  photos: string[];
  repairCost?: number;
  repairStatus?: 'pending' | 'scheduled' | 'completed';
  createdAt: Date;
}

interface MaintenanceSchedule {
  lastMaintenance: Date;
  nextMaintenance: Date;
  intervalDays: number;
  maintenanceTasks: string[];
  maintenanceHistory: MaintenanceRecord[];
}

interface AvailabilityQuery {
  itemIds?: string[];
  categoryId?: string;
  startDate: Date;
  endDate: Date;
  quantity?: number;
  location?: string;
}

interface AvailabilityResult {
  itemId: string;
  item: RentalItem;
  available: boolean;
  availableQuantity: number;
  conflictingReservations?: string[];
  nextAvailableDate?: Date;
}
```

## Service Implementation

```typescript
class EquipmentRentalService {
  // Inventory management
  async addItem(item: CreateItemInput): Promise<RentalItem>;
  async updateItem(itemId: string, updates: UpdateItemInput): Promise<RentalItem>;
  async retireItem(itemId: string, reason: string): Promise<void>;
  async getItemsByCategory(categoryId: string): Promise<RentalItem[]>;

  // Availability and scheduling
  async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult[]>;
  async getItemCalendar(itemId: string, month: Date): Promise<CalendarDay[]>;
  async findAlternatives(itemId: string, dates: DateRange): Promise<RentalItem[]>;

  // Reservations
  async createReservation(input: CreateReservationInput): Promise<RentalReservation>;
  async confirmReservation(reservationId: string): Promise<RentalReservation>;
  async modifyReservation(reservationId: string, changes: ModifyReservationInput): Promise<RentalReservation>;
  async cancelReservation(reservationId: string, reason: string): Promise<void>;

  // Checkout/Return process
  async checkoutItems(reservationId: string, conditionNotes: ConditionNote[]): Promise<void>;
  async returnItems(reservationId: string, returnData: ReturnInput): Promise<ReturnResult>;
  async assessDamage(itemId: string, damage: DamageAssessment): Promise<DamageReport>;

  // Deposits
  async holdDeposit(reservationId: string): Promise<DepositInfo>;
  async releaseDeposit(reservationId: string, deductions?: DepositDeduction[]): Promise<DepositInfo>;

  // Agreements
  async generateAgreement(reservationId: string): Promise<RentalAgreement>;
  async sendAgreementForSignature(agreementId: string): Promise<void>;

  // Pricing
  async calculatePricing(items: PricingInput[], dates: DateRange): Promise<ReservationPricing>;
  async applyDiscount(reservationId: string, discountCode: string): Promise<ReservationPricing>;

  // Maintenance
  async scheduleMaintenance(itemId: string, date: Date, tasks: string[]): Promise<void>;
  async completeMaintenance(itemId: string, record: MaintenanceRecord): Promise<void>;
  async getMaintenanceDue(daysAhead: number): Promise<RentalItem[]>;
}
```

## Database Schema

```sql
CREATE TABLE rental_categories (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES rental_categories(id),
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_items (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  category_id UUID REFERENCES rental_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(50),
  serial_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'available',
  condition_rating VARCHAR(20) DEFAULT 'good',
  last_inspection TIMESTAMPTZ,
  location_id UUID,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2) NOT NULL,
  weekly_rate DECIMAL(10,2) NOT NULL,
  monthly_rate DECIMAL(10,2),
  deposit_amount DECIMAL(10,2) NOT NULL,
  insurance_required BOOLEAN DEFAULT false,
  insurance_fee DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  min_rental_period INTEGER DEFAULT 1,
  min_rental_unit VARCHAR(20) DEFAULT 'days',
  specifications JSONB DEFAULT '{}',
  images TEXT[],
  iot_device_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_reservations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  pickup_method VARCHAR(20) NOT NULL,
  pickup_location_id UUID,
  delivery_address JSONB,
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  insurance_fee DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  deposit_status VARCHAR(30) DEFAULT 'pending',
  deposit_payment_intent_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservation_items (
  id UUID PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES rental_reservations(id),
  item_id UUID NOT NULL REFERENCES rental_items(id),
  quantity INTEGER DEFAULT 1,
  checkout_condition JSONB,
  return_condition JSONB,
  accessories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_agreements (
  id UUID PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES rental_reservations(id),
  status VARCHAR(20) DEFAULT 'draft',
  document_url TEXT,
  docusign_envelope_id VARCHAR(100),
  signed_at TIMESTAMPTZ,
  signer_name VARCHAR(255),
  signer_email VARCHAR(255),
  terms JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE damage_reports (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES rental_items(id),
  reservation_id UUID REFERENCES rental_reservations(id),
  reported_by UUID NOT NULL,
  damage_type VARCHAR(30) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[],
  repair_cost DECIMAL(10,2),
  repair_status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES rental_items(id),
  scheduled_date DATE,
  completed_date DATE,
  tasks_completed TEXT[],
  notes TEXT,
  cost DECIMAL(10,2),
  performed_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_tenant_status ON rental_items(tenant_id, status);
CREATE INDEX idx_items_category ON rental_items(category_id);
CREATE INDEX idx_reservations_tenant_dates ON rental_reservations(tenant_id, start_date, end_date);
CREATE INDEX idx_reservations_status ON rental_reservations(status);
CREATE INDEX idx_reservation_items_item ON reservation_items(item_id);
CREATE INDEX idx_damage_item ON damage_reports(item_id);
```

## API Endpoints

```typescript
// GET /api/rental/items - List available items
// GET /api/rental/items/:id - Get item details
// POST /api/rental/items - Add new item
// PUT /api/rental/items/:id - Update item
// GET /api/rental/availability - Check availability
// GET /api/rental/items/:id/calendar - Get item calendar
// POST /api/rental/reservations - Create reservation
// GET /api/rental/reservations/:id - Get reservation
// PUT /api/rental/reservations/:id - Modify reservation
// POST /api/rental/reservations/:id/confirm - Confirm reservation
// POST /api/rental/reservations/:id/checkout - Checkout items
// POST /api/rental/reservations/:id/return - Return items
// POST /api/rental/reservations/:id/agreement - Generate agreement
// POST /api/rental/damage-reports - Report damage
// GET /api/rental/maintenance/due - Get items needing maintenance
```

## Related Skills
- `vehicle-rental-standard.md` - Vehicle-specific rental
- `construction-project-standard.md` - Construction equipment needs
- `tap-to-pay-standard.md` - Payment processing

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Rental
