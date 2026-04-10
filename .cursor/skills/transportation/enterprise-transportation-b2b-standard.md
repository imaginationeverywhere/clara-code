# Enterprise Transportation B2B Standard

B2B transportation partnerships for corporate accounts (Marriott, hotels, corporate clients).

## Target Projects
- **Quik Carry** - Transportation and delivery platform ecosystem

## Core Components

### 1. Corporate Account

```typescript
interface CorporateAccount {
  id: string;
  tenantId: string;

  // Company info
  companyName: string;
  companyType: 'hotel' | 'corporate' | 'airline' | 'hospital' | 'university' | 'other';
  industry: string;
  taxId?: string;

  // Contact
  primaryContact: ContactInfo;
  billingContact: ContactInfo;
  operationsContacts: ContactInfo[];

  // Locations
  locations: CorporateLocation[];

  // Contract
  contract: CorporateContract;

  // Billing
  billingType: 'invoice' | 'prepaid' | 'credit_card';
  billingCycle: 'weekly' | 'biweekly' | 'monthly';
  paymentTerms: number;           // Net 30, Net 60, etc.
  creditLimit: number;
  currentBalance: number;

  // API access
  apiEnabled: boolean;
  apiKeys: APIKey[];

  // Settings
  settings: CorporateSettings;

  // Stats
  totalRides: number;
  totalSpend: number;
  averageMonthlySpend: number;

  status: 'pending' | 'active' | 'suspended' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

interface CorporateLocation {
  id: string;
  name: string;                   // "Marriott Downtown", "HQ Building A"
  address: Address;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'headquarters' | 'branch' | 'hotel' | 'airport' | 'other';
  timezone: string;
  operatingHours: OperatingHours[];
  defaultPickupInstructions?: string;
  isActive: boolean;
}

interface CorporateContract {
  id: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;

  // Pricing
  pricingModel: 'standard' | 'discounted' | 'fixed' | 'tiered';
  discountPercentage?: number;
  fixedRates?: FixedRate[];
  tieredPricing?: TieredPricing[];

  // SLA
  sla: ServiceLevelAgreement;

  // Terms
  minimumMonthlySpend?: number;
  volumeCommitment?: number;
  exclusivityClause: boolean;

  // Document
  documentUrl?: string;
  signedDate?: Date;

  status: 'draft' | 'pending' | 'active' | 'expired';
}

interface ServiceLevelAgreement {
  maxWaitTime: number;            // minutes
  maxETA: number;                 // minutes
  vehicleCondition: 'standard' | 'premium' | 'luxury';
  driverRatingMinimum: number;
  cancellationAllowance: number;  // percentage
  supportResponseTime: number;    // minutes
  dedicatedAccountManager: boolean;
  priorityDispatch: boolean;
}
```

### 2. Corporate Booking

```typescript
interface CorporateBooking {
  id: string;
  corporateAccountId: string;
  locationId: string;

  // Booker
  bookerId: string;
  bookerName: string;
  bookerEmail: string;
  departmentCode?: string;
  costCenter?: string;
  projectCode?: string;

  // Passenger
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  isGuest: boolean;               // Hotel guest vs employee

  // Ride details
  pickup: Location;
  dropoff: Location;
  vehicleType: VehicleType;
  passengerCount: number;

  // Scheduling
  scheduledTime: Date;
  flightNumber?: string;
  flightArrivalTime?: Date;

  // Special requests
  specialRequests: string[];
  meetAndGreet: boolean;
  signage?: string;               // Name on sign

  // Pricing
  estimatedFare: number;
  contractedRate?: number;
  finalFare?: number;

  // Status
  status: CorporateBookingStatus;
  rideRequestId?: string;

  // Tracking
  confirmationNumber: string;
  referenceNumber?: string;       // Client's reference

  // Notes
  internalNotes?: string;
  dispatchNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

type CorporateBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'dispatched'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';
```

### 3. Corporate API

```typescript
// OpenAPI specification for corporate partners
export const corporateAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'Quik Carry Corporate API',
    version: '1.0.0',
    description: 'API for corporate transportation partners'
  },
  paths: {
    '/v1/bookings': {
      post: {
        summary: 'Create booking',
        operationId: 'createBooking',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateBookingRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Booking created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' }
              }
            }
          }
        }
      }
    },
    '/v1/bookings/{bookingId}': {
      get: {
        summary: 'Get booking details',
        operationId: 'getBooking'
      },
      patch: {
        summary: 'Update booking',
        operationId: 'updateBooking'
      },
      delete: {
        summary: 'Cancel booking',
        operationId: 'cancelBooking'
      }
    },
    '/v1/bookings/{bookingId}/track': {
      get: {
        summary: 'Real-time tracking',
        operationId: 'trackBooking'
      }
    },
    '/v1/estimates': {
      post: {
        summary: 'Get fare estimate',
        operationId: 'getFareEstimate'
      }
    },
    '/v1/reports/usage': {
      get: {
        summary: 'Usage report',
        operationId: 'getUsageReport'
      }
    }
  }
};

export class CorporateAPIService {
  /**
   * Create booking via API
   */
  async createBooking(
    apiKey: string,
    request: CreateBookingRequest
  ): Promise<CorporateBooking> {
    // Validate API key
    const account = await this.validateAPIKey(apiKey);

    // Validate location
    const location = account.locations.find(l => l.id === request.locationId);
    if (!location) {
      throw new APIError('INVALID_LOCATION', 'Location not found');
    }

    // Apply contracted pricing
    const estimatedFare = await this.calculateCorporateFare(
      account,
      request.pickup,
      request.dropoff,
      request.vehicleType
    );

    // Create booking
    const booking: CorporateBooking = {
      id: generateId(),
      corporateAccountId: account.id,
      locationId: request.locationId,
      bookerId: request.bookerId,
      bookerName: request.bookerName,
      bookerEmail: request.bookerEmail,
      departmentCode: request.departmentCode,
      costCenter: request.costCenter,
      passengerName: request.passengerName,
      passengerPhone: request.passengerPhone,
      passengerEmail: request.passengerEmail,
      isGuest: request.isGuest || false,
      pickup: request.pickup,
      dropoff: request.dropoff,
      vehicleType: request.vehicleType,
      passengerCount: request.passengerCount || 1,
      scheduledTime: new Date(request.scheduledTime),
      flightNumber: request.flightNumber,
      specialRequests: request.specialRequests || [],
      meetAndGreet: request.meetAndGreet || false,
      signage: request.signage,
      estimatedFare,
      status: 'confirmed',
      confirmationNumber: this.generateConfirmationNumber(),
      referenceNumber: request.referenceNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.bookingRepository.save(booking);

    // Schedule dispatch
    await this.scheduleDispatch(booking);

    // Send confirmations
    await this.sendConfirmations(booking);

    return booking;
  }

  /**
   * Calculate corporate fare with contract pricing
   */
  async calculateCorporateFare(
    account: CorporateAccount,
    pickup: Location,
    dropoff: Location,
    vehicleType: VehicleType
  ): Promise<number> {
    const contract = account.contract;

    // Get standard fare
    const standardFare = await this.fareService.calculateFare(
      pickup,
      dropoff,
      vehicleType
    );

    switch (contract.pricingModel) {
      case 'standard':
        return standardFare.totalFare;

      case 'discounted':
        return standardFare.totalFare * (1 - (contract.discountPercentage! / 100));

      case 'fixed':
        const fixedRate = contract.fixedRates?.find(r =>
          r.vehicleType === vehicleType &&
          this.isWithinZone(pickup, r.pickupZone) &&
          this.isWithinZone(dropoff, r.dropoffZone)
        );
        return fixedRate?.rate || standardFare.totalFare;

      case 'tiered':
        const tier = this.determineSpendTier(account, contract.tieredPricing!);
        return standardFare.totalFare * (1 - (tier.discountPercentage / 100));

      default:
        return standardFare.totalFare;
    }
  }

  /**
   * Track booking in real-time
   */
  async trackBooking(
    apiKey: string,
    bookingId: string
  ): Promise<BookingTrackingInfo> {
    await this.validateAPIKey(apiKey);

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new APIError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    // Get ride tracking info
    if (!booking.rideRequestId) {
      return {
        bookingId: booking.id,
        status: booking.status,
        scheduledTime: booking.scheduledTime,
        driver: null,
        vehicle: null,
        eta: null,
        location: null
      };
    }

    const tracking = await this.trackingService.getTrackingInfo(booking.rideRequestId);

    return {
      bookingId: booking.id,
      status: booking.status,
      scheduledTime: booking.scheduledTime,
      driver: tracking.driver,
      vehicle: tracking.vehicle,
      eta: tracking.eta,
      location: tracking.location
    };
  }
}
```

### 4. Corporate Billing

```typescript
interface CorporateInvoice {
  id: string;
  corporateAccountId: string;
  invoiceNumber: string;

  // Period
  periodStart: Date;
  periodEnd: Date;

  // Line items
  lineItems: InvoiceLineItem[];

  // Totals
  subtotal: number;
  taxAmount: number;
  discounts: number;
  total: number;
  currency: string;

  // Payment
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  paidAmount: number;
  paidDate?: Date;
  paymentReference?: string;

  // Documents
  pdfUrl?: string;
  detailReportUrl?: string;

  createdAt: Date;
}

interface InvoiceLineItem {
  id: string;
  bookingId: string;
  date: Date;
  description: string;
  passenger: string;
  pickup: string;
  dropoff: string;
  vehicleType: string;
  distance: number;
  duration: number;
  baseAmount: number;
  discount: number;
  amount: number;
  costCenter?: string;
  departmentCode?: string;
  referenceNumber?: string;
}

export class CorporateBillingService {
  /**
   * Generate monthly invoice
   */
  async generateInvoice(
    accountId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<CorporateInvoice> {
    const account = await this.accountService.getAccount(accountId);

    // Get completed bookings for period
    const bookings = await this.bookingRepository.findByPeriod(
      accountId,
      periodStart,
      periodEnd,
      'completed'
    );

    // Generate line items
    const lineItems: InvoiceLineItem[] = bookings.map(booking => ({
      id: generateId(),
      bookingId: booking.id,
      date: booking.scheduledTime,
      description: `${booking.vehicleType} ride`,
      passenger: booking.passengerName,
      pickup: booking.pickup.address,
      dropoff: booking.dropoff.address,
      vehicleType: booking.vehicleType,
      distance: booking.actualDistance || 0,
      duration: booking.actualDuration || 0,
      baseAmount: booking.estimatedFare,
      discount: booking.estimatedFare - (booking.finalFare || booking.estimatedFare),
      amount: booking.finalFare || booking.estimatedFare,
      costCenter: booking.costCenter,
      departmentCode: booking.departmentCode,
      referenceNumber: booking.referenceNumber
    }));

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0; // B2B typically no tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Create invoice
    const invoice: CorporateInvoice = {
      id: generateId(),
      corporateAccountId: accountId,
      invoiceNumber: await this.generateInvoiceNumber(account),
      periodStart,
      periodEnd,
      lineItems,
      subtotal,
      taxAmount,
      discounts: lineItems.reduce((sum, item) => sum + item.discount, 0),
      total,
      currency: 'USD',
      dueDate: this.calculateDueDate(account.paymentTerms),
      status: 'draft',
      paidAmount: 0,
      createdAt: new Date()
    };

    // Generate PDF
    invoice.pdfUrl = await this.generateInvoicePDF(invoice, account);

    // Generate detailed report
    invoice.detailReportUrl = await this.generateDetailReport(invoice, bookings);

    await this.invoiceRepository.save(invoice);
    return invoice;
  }

  /**
   * Generate usage report
   */
  async generateUsageReport(
    accountId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' | 'department' | 'location'
  ): Promise<UsageReport> {
    const bookings = await this.bookingRepository.findByPeriod(
      accountId,
      startDate,
      endDate
    );

    const report: UsageReport = {
      accountId,
      period: { startDate, endDate },
      summary: {
        totalRides: bookings.length,
        completedRides: bookings.filter(b => b.status === 'completed').length,
        cancelledRides: bookings.filter(b => b.status === 'cancelled').length,
        noShowRides: bookings.filter(b => b.status === 'no_show').length,
        totalSpend: bookings.reduce((sum, b) => sum + (b.finalFare || 0), 0),
        averageFare: 0,
        totalDistance: 0,
        averageWaitTime: 0
      },
      breakdown: [],
      topRoutes: [],
      departmentUsage: [],
      locationUsage: []
    };

    // Calculate averages
    report.summary.averageFare = report.summary.totalSpend / report.summary.completedRides;

    // Group by specified dimension
    report.breakdown = this.groupBookings(bookings, groupBy);

    // Top routes
    report.topRoutes = this.analyzeTopRoutes(bookings);

    // Department usage
    report.departmentUsage = this.analyzeDepartmentUsage(bookings);

    // Location usage
    report.locationUsage = this.analyzeLocationUsage(bookings);

    return report;
  }
}
```

### 5. Hotel Integration (Marriott Example)

```typescript
interface HotelIntegration {
  hotelId: string;
  corporateAccountId: string;
  propertyCode: string;
  pmsIntegration?: {
    type: 'opera' | 'protel' | 'mews' | 'custom';
    endpoint: string;
    credentials: string;           // Encrypted
  };
  conciergePortalEnabled: boolean;
  guestBookingEnabled: boolean;
  automatedBookings: boolean;
}

export class HotelIntegrationService {
  /**
   * Sync with hotel PMS
   */
  async syncGuestArrivals(hotelId: string): Promise<void> {
    const integration = await this.getIntegration(hotelId);

    if (!integration.pmsIntegration) return;

    // Get arrivals from PMS
    const arrivals = await this.pmsService.getArrivals(
      integration.pmsIntegration,
      new Date()
    );

    for (const arrival of arrivals) {
      // Check if guest has transportation request
      if (arrival.transportationRequested) {
        await this.createGuestBooking(integration, arrival);
      }
    }
  }

  /**
   * Create booking for hotel guest
   */
  async createGuestBooking(
    integration: HotelIntegration,
    guestArrival: GuestArrival
  ): Promise<CorporateBooking> {
    const hotel = await this.locationService.getLocation(integration.hotelId);

    const booking = await this.corporateAPIService.createBooking(
      integration.corporateAccountId,
      {
        locationId: integration.hotelId,
        bookerName: 'Concierge',
        bookerEmail: hotel.conciergeEmail,
        passengerName: guestArrival.guestName,
        passengerPhone: guestArrival.guestPhone,
        isGuest: true,
        pickup: {
          address: guestArrival.pickupAddress || 'Airport',
          latitude: guestArrival.pickupLat,
          longitude: guestArrival.pickupLng
        },
        dropoff: {
          address: hotel.address.formatted,
          latitude: hotel.coordinates.lat,
          longitude: hotel.coordinates.lng
        },
        vehicleType: this.mapGuestClassToVehicle(guestArrival.roomClass),
        scheduledTime: guestArrival.arrivalTime,
        flightNumber: guestArrival.flightNumber,
        meetAndGreet: guestArrival.roomClass === 'suite',
        signage: guestArrival.guestName,
        referenceNumber: guestArrival.confirmationNumber
      }
    );

    // Update PMS with booking confirmation
    await this.pmsService.updateGuestTransportation(
      integration.pmsIntegration!,
      guestArrival.confirmationNumber,
      {
        transportationBooked: true,
        confirmationNumber: booking.confirmationNumber,
        vehicleType: booking.vehicleType,
        estimatedFare: booking.estimatedFare
      }
    );

    return booking;
  }

  /**
   * Concierge portal endpoints
   */
  async getConciergePortalData(hotelId: string): Promise<ConciergePortalData> {
    const integration = await this.getIntegration(hotelId);

    return {
      hotel: await this.locationService.getLocation(hotelId),
      todayBookings: await this.getTodayBookings(integration.corporateAccountId, hotelId),
      pendingArrivals: await this.getPendingArrivals(hotelId),
      availableVehicleTypes: await this.getAvailableVehicleTypes(hotelId),
      recentActivity: await this.getRecentActivity(hotelId, 20)
    };
  }
}
```

## Database Schema

```sql
-- Corporate Accounts
CREATE TABLE corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  company_name VARCHAR(255) NOT NULL,
  company_type VARCHAR(50),
  industry VARCHAR(100),
  tax_id VARCHAR(50),
  primary_contact JSONB NOT NULL,
  billing_contact JSONB,
  billing_type VARCHAR(50) DEFAULT 'invoice',
  billing_cycle VARCHAR(50) DEFAULT 'monthly',
  payment_terms INTEGER DEFAULT 30,
  credit_limit DECIMAL(12,2) DEFAULT 10000,
  current_balance DECIMAL(12,2) DEFAULT 0,
  api_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  total_rides INTEGER DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate Locations
CREATE TABLE corporate_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id),
  name VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  coordinates POINT,
  type VARCHAR(50),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  operating_hours JSONB,
  default_pickup_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate Contracts
CREATE TABLE corporate_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  pricing_model VARCHAR(50) NOT NULL,
  discount_percentage DECIMAL(5,2),
  fixed_rates JSONB,
  tiered_pricing JSONB,
  sla JSONB NOT NULL,
  minimum_monthly_spend DECIMAL(10,2),
  volume_commitment INTEGER,
  document_url VARCHAR(500),
  signed_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate Bookings
CREATE TABLE corporate_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id),
  location_id UUID REFERENCES corporate_locations(id),
  booker_id VARCHAR(100),
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255),
  department_code VARCHAR(50),
  cost_center VARCHAR(50),
  project_code VARCHAR(50),
  passenger_name VARCHAR(255) NOT NULL,
  passenger_phone VARCHAR(50) NOT NULL,
  passenger_email VARCHAR(255),
  is_guest BOOLEAN DEFAULT false,
  pickup JSONB NOT NULL,
  dropoff JSONB NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  passenger_count INTEGER DEFAULT 1,
  scheduled_time TIMESTAMPTZ NOT NULL,
  flight_number VARCHAR(20),
  special_requests TEXT[],
  meet_and_greet BOOLEAN DEFAULT false,
  signage VARCHAR(255),
  estimated_fare DECIMAL(10,2),
  contracted_rate DECIMAL(10,2),
  final_fare DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  ride_request_id UUID REFERENCES ride_requests(id),
  confirmation_number VARCHAR(20) UNIQUE NOT NULL,
  reference_number VARCHAR(100),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corporate Invoices
CREATE TABLE corporate_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  line_items JSONB NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discounts DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  paid_amount DECIMAL(12,2) DEFAULT 0,
  paid_date DATE,
  payment_reference VARCHAR(100),
  pdf_url VARCHAR(500),
  detail_report_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE corporate_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id),
  key_hash VARCHAR(64) NOT NULL,
  name VARCHAR(100),
  permissions TEXT[],
  rate_limit INTEGER DEFAULT 1000,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_corp_accounts_status ON corporate_accounts(status);
CREATE INDEX idx_corp_locations_account ON corporate_locations(corporate_account_id);
CREATE INDEX idx_corp_bookings_account ON corporate_bookings(corporate_account_id);
CREATE INDEX idx_corp_bookings_scheduled ON corporate_bookings(scheduled_time);
CREATE INDEX idx_corp_bookings_confirmation ON corporate_bookings(confirmation_number);
CREATE INDEX idx_corp_invoices_account ON corporate_invoices(corporate_account_id);
CREATE INDEX idx_corp_invoices_due ON corporate_invoices(due_date) WHERE status = 'sent';
```

## Related Skills
- `ride-sharing-standard` - Core ride functionality
- `dispatch-management-standard` - Dispatch operations
- `stripe-connect-specialist` - Payment processing
