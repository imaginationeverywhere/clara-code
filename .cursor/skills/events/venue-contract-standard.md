# Venue Contract Standard

Venue booking, contracts, and DocuSign integration for event spaces.

## Target Projects
- **Site962/QuikEvents** - Multi-tenant venue and event platform

## Core Components

### 1. Venue Management

```typescript
interface Venue {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: VenueType;

  // Location
  address: Address;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;

  // Capacity
  capacities: VenueCapacity[];
  defaultCapacity: number;

  // Amenities
  amenities: Amenity[];

  // Media
  coverImage: string;
  gallery: string[];
  floorPlan?: string;
  virtualTour?: string;

  // Policies
  policies: VenuePolicies;

  // Pricing
  pricingModel: PricingModel;
  baseRates: BaseRate[];

  // Availability
  operatingHours: OperatingHours[];
  blockedDates: BlockedDate[];

  // Contact
  contactInfo: ContactInfo;

  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

type VenueType =
  | 'concert_hall'
  | 'club'
  | 'theater'
  | 'arena'
  | 'outdoor'
  | 'ballroom'
  | 'conference_center'
  | 'restaurant'
  | 'rooftop'
  | 'warehouse';

interface VenueCapacity {
  configuration: string;           // "Theater", "Banquet", "Standing"
  capacity: number;
  description?: string;
}

interface VenuePolicies {
  cancellationPolicy: CancellationPolicy;
  depositRequired: boolean;
  depositPercentage: number;
  minimumBookingHours: number;
  advanceBookingDays: number;
  maxAdvanceBookingDays: number;
  noiseRestrictions?: string;
  cateringPolicy: 'in_house_only' | 'approved_vendors' | 'any';
  alcoholPolicy: 'included' | 'byob' | 'not_allowed' | 'licensed_only';
  insuranceRequired: boolean;
  insuranceMinimum?: number;
}
```

### 2. Booking Management

```typescript
interface VenueBooking {
  id: string;
  venueId: string;
  tenantId: string;
  eventId?: string;               // If linked to an event

  // Client
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  organizationName?: string;

  // Event details
  eventName: string;
  eventType: string;
  eventDescription?: string;
  expectedAttendance: number;

  // Timing
  eventDate: Date;
  startTime: Date;
  endTime: Date;
  setupTime?: Date;
  teardownTime?: Date;

  // Space
  configuration: string;
  rooms: BookedRoom[];

  // Pricing
  basePrice: number;
  additionalCharges: AdditionalCharge[];
  discounts: Discount[];
  subtotal: number;
  taxAmount: number;
  total: number;

  // Payments
  depositAmount: number;
  depositPaid: boolean;
  depositPaidDate?: Date;
  paymentSchedule: PaymentMilestone[];
  payments: BookingPayment[];

  // Contract
  contractId?: string;
  contractStatus: 'pending' | 'sent' | 'signed' | 'expired';
  contractSignedDate?: Date;

  // Status
  status: BookingStatus;
  statusHistory: StatusChange[];

  // Notes
  internalNotes?: string;
  clientNotes?: string;

  // Requirements
  requirements: BookingRequirement[];

  createdAt: Date;
  updatedAt: Date;
}

type BookingStatus =
  | 'inquiry'
  | 'pending_contract'
  | 'pending_deposit'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

interface BookedRoom {
  roomId: string;
  roomName: string;
  configuration: string;
  startTime: Date;
  endTime: Date;
  price: number;
}

interface AdditionalCharge {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'equipment' | 'staffing' | 'catering' | 'cleaning' | 'security' | 'other';
}

interface PaymentMilestone {
  id: string;
  description: string;           // "Deposit", "50% Payment", "Final Payment"
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
}
```

### 3. Contract Generation

```typescript
interface VenueContract {
  id: string;
  bookingId: string;
  venueId: string;
  templateId: string;

  // Parties
  venueParty: ContractParty;
  clientParty: ContractParty;

  // Terms
  terms: ContractTerms;

  // Document
  documentUrl?: string;
  documentVersion: number;

  // Signatures
  signatures: ContractSignature[];
  allPartiesSigned: boolean;

  // DocuSign
  docusignEnvelopeId?: string;
  docusignStatus?: string;

  // Status
  status: 'draft' | 'pending_signatures' | 'executed' | 'expired' | 'voided';

  createdAt: Date;
  executedAt?: Date;
  expiresAt?: Date;
}

interface ContractTerms {
  eventDetails: {
    name: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    expectedAttendance: number;
  };
  space: {
    rooms: string[];
    configuration: string;
  };
  pricing: {
    rentalFee: number;
    additionalCharges: AdditionalCharge[];
    taxRate: number;
    total: number;
  };
  payment: {
    depositAmount: number;
    depositDueDate: Date;
    balanceDueDate: Date;
    paymentMethods: string[];
  };
  cancellation: {
    policy: string;
    refundSchedule: RefundScheduleItem[];
  };
  insurance: {
    required: boolean;
    minimumCoverage: number;
    additionalInsuredRequired: boolean;
  };
  additionalTerms: string[];
  specialConditions?: string;
}

interface RefundScheduleItem {
  daysBeforeEvent: number;
  refundPercentage: number;
}
```

## Contract Generation Service

```typescript
import Handlebars from 'handlebars';

export class ContractGenerationService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerHelpers();
  }

  /**
   * Generate contract from booking
   */
  async generateContract(
    booking: VenueBooking,
    templateId: string
  ): Promise<VenueContract> {
    const venue = await this.venueService.getVenue(booking.venueId);
    const template = await this.getTemplate(templateId);
    const client = await this.userService.getUser(booking.clientId);

    // Prepare contract terms
    const terms: ContractTerms = {
      eventDetails: {
        name: booking.eventName,
        date: booking.eventDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        expectedAttendance: booking.expectedAttendance
      },
      space: {
        rooms: booking.rooms.map(r => r.roomName),
        configuration: booking.configuration
      },
      pricing: {
        rentalFee: booking.basePrice,
        additionalCharges: booking.additionalCharges,
        taxRate: venue.taxRate,
        total: booking.total
      },
      payment: {
        depositAmount: booking.depositAmount,
        depositDueDate: this.calculateDepositDueDate(booking),
        balanceDueDate: this.calculateBalanceDueDate(booking),
        paymentMethods: ['credit_card', 'bank_transfer', 'check']
      },
      cancellation: {
        policy: venue.policies.cancellationPolicy.description,
        refundSchedule: venue.policies.cancellationPolicy.schedule
      },
      insurance: {
        required: venue.policies.insuranceRequired,
        minimumCoverage: venue.policies.insuranceMinimum || 1000000,
        additionalInsuredRequired: true
      },
      additionalTerms: this.getStandardTerms(venue)
    };

    // Create contract record
    const contract: VenueContract = {
      id: generateId(),
      bookingId: booking.id,
      venueId: booking.venueId,
      templateId,
      venueParty: {
        name: venue.name,
        address: venue.address,
        contact: venue.contactInfo
      },
      clientParty: {
        name: booking.organizationName || booking.clientName,
        email: booking.clientEmail,
        phone: booking.clientPhone
      },
      terms,
      documentVersion: 1,
      signatures: [],
      allPartiesSigned: false,
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    // Generate PDF
    const pdfBuffer = await this.generatePDF(contract, template);
    contract.documentUrl = await this.uploadDocument(contract.id, pdfBuffer);

    await this.contractRepository.save(contract);
    return contract;
  }

  /**
   * Generate PDF from template
   */
  private async generatePDF(
    contract: VenueContract,
    template: ContractTemplate
  ): Promise<Buffer> {
    const compiledTemplate = this.compileTemplate(template.content);

    const html = compiledTemplate({
      contract,
      venue: contract.venueParty,
      client: contract.clientParty,
      terms: contract.terms,
      generatedDate: new Date().toLocaleDateString(),
      formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
      formatDate: (date: Date) => new Date(date).toLocaleDateString()
    });

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' }
    });
    await browser.close();

    return pdfBuffer;
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers() {
    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    });

    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    Handlebars.registerHelper('formatTime', (date: Date) => {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    });
  }
}
```

## DocuSign Integration

```typescript
import { ApiClient, EnvelopesApi, EnvelopeDefinition } from 'docusign-esign';

export class VenueDocuSignService {
  private envelopesApi: EnvelopesApi;

  /**
   * Send contract for signature
   */
  async sendForSignature(contract: VenueContract): Promise<string> {
    // Download contract PDF
    const pdfBuffer = await this.downloadDocument(contract.documentUrl!);

    const envelope: EnvelopeDefinition = {
      emailSubject: `Venue Contract for ${contract.terms.eventDetails.name} - Signature Required`,
      emailBlurb: `Please review and sign the venue rental agreement for your upcoming event at ${contract.venueParty.name}.`,
      documents: [{
        documentBase64: pdfBuffer.toString('base64'),
        name: `Venue Contract - ${contract.terms.eventDetails.name}.pdf`,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: [
          // Client signer
          {
            email: contract.clientParty.email,
            name: contract.clientParty.name,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: 'last',
                recipientId: '1',
                xPosition: '100',
                yPosition: '600'
              }],
              dateSignedTabs: [{
                documentId: '1',
                pageNumber: 'last',
                recipientId: '1',
                xPosition: '300',
                yPosition: '600'
              }],
              textTabs: [{
                documentId: '1',
                pageNumber: 'last',
                recipientId: '1',
                xPosition: '100',
                yPosition: '650',
                tabLabel: 'PrintedName',
                required: 'true'
              }]
            }
          },
          // Venue representative
          {
            email: contract.venueParty.contact.email,
            name: contract.venueParty.contact.name,
            recipientId: '2',
            routingOrder: '2',
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: 'last',
                recipientId: '2',
                xPosition: '100',
                yPosition: '700'
              }],
              dateSignedTabs: [{
                documentId: '1',
                pageNumber: 'last',
                recipientId: '2',
                xPosition: '300',
                yPosition: '700'
              }]
            }
          }
        ]
      },
      status: 'sent'
    };

    const result = await this.envelopesApi.createEnvelope(
      this.accountId,
      { envelopeDefinition: envelope }
    );

    // Update contract
    await this.contractRepository.update(contract.id, {
      docusignEnvelopeId: result.envelopeId,
      docusignStatus: 'sent',
      status: 'pending_signatures'
    });

    return result.envelopeId!;
  }

  /**
   * Handle DocuSign webhook
   */
  async handleWebhook(payload: DocuSignWebhookPayload): Promise<void> {
    const { envelopeId, status, recipientStatuses } = payload;

    const contract = await this.contractRepository.findByEnvelopeId(envelopeId);
    if (!contract) return;

    // Update signature status
    for (const recipient of recipientStatuses) {
      if (recipient.status === 'completed') {
        contract.signatures.push({
          recipientId: recipient.recipientId,
          name: recipient.recipientName,
          email: recipient.recipientEmail,
          signedAt: new Date(recipient.signedDateTime),
          ipAddress: recipient.clientIPAddress
        });
      }
    }

    // Check if all parties signed
    if (status === 'completed') {
      contract.status = 'executed';
      contract.executedAt = new Date();
      contract.allPartiesSigned = true;

      // Update booking status
      await this.bookingService.updateStatus(
        contract.bookingId,
        'pending_deposit'
      );

      // Send confirmation emails
      await this.notificationService.sendContractExecutedNotification(contract);
    }

    await this.contractRepository.save(contract);
  }

  /**
   * Download signed contract
   */
  async downloadSignedContract(contractId: string): Promise<Buffer> {
    const contract = await this.contractRepository.findById(contractId);

    if (!contract.docusignEnvelopeId || contract.status !== 'executed') {
      throw new Error('Contract not yet executed');
    }

    const document = await this.envelopesApi.getDocument(
      this.accountId,
      contract.docusignEnvelopeId,
      'combined' // All documents combined
    );

    return Buffer.from(document as any);
  }
}
```

## Availability Calendar

```typescript
export class VenueAvailabilityService {
  /**
   * Get availability for date range
   */
  async getAvailability(
    venueId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityCalendar> {
    const venue = await this.venueService.getVenue(venueId);

    // Get existing bookings
    const bookings = await this.bookingRepository.findByDateRange(
      venueId,
      startDate,
      endDate
    );

    // Get blocked dates
    const blockedDates = venue.blockedDates.filter(
      bd => bd.date >= startDate && bd.date <= endDate
    );

    // Build calendar
    const calendar: AvailabilityCalendar = {
      venueId,
      startDate,
      endDate,
      days: []
    };

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const operatingHours = venue.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      const dayAvailability: DayAvailability = {
        date: new Date(currentDate),
        isOperating: operatingHours?.isOpen || false,
        operatingHours: operatingHours,
        bookings: bookings.filter(b =>
          this.isSameDay(b.eventDate, currentDate)
        ).map(b => ({
          id: b.id,
          eventName: b.eventName,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status
        })),
        blockedReason: blockedDates.find(bd =>
          this.isSameDay(bd.date, currentDate)
        )?.reason,
        availableSlots: []
      };

      // Calculate available slots
      if (dayAvailability.isOperating && !dayAvailability.blockedReason) {
        dayAvailability.availableSlots = this.calculateAvailableSlots(
          dayAvailability,
          venue.policies.minimumBookingHours
        );
      }

      calendar.days.push(dayAvailability);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  }

  /**
   * Check if specific time slot is available
   */
  async checkSlotAvailability(
    venueId: string,
    date: Date,
    startTime: Date,
    endTime: Date,
    rooms?: string[]
  ): Promise<SlotAvailability> {
    // Check operating hours
    const venue = await this.venueService.getVenue(venueId);
    const dayOfWeek = date.getDay();
    const operatingHours = venue.operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);

    if (!operatingHours?.isOpen) {
      return { available: false, reason: 'Venue is closed on this day' };
    }

    // Check blocked dates
    const isBlocked = venue.blockedDates.some(bd =>
      this.isSameDay(bd.date, date)
    );
    if (isBlocked) {
      return { available: false, reason: 'Date is blocked' };
    }

    // Check existing bookings
    const conflictingBookings = await this.bookingRepository.findConflicting(
      venueId,
      date,
      startTime,
      endTime,
      rooms
    );

    if (conflictingBookings.length > 0) {
      return {
        available: false,
        reason: 'Time slot conflicts with existing booking',
        conflicts: conflictingBookings
      };
    }

    return { available: true };
  }
}
```

## Database Schema

```sql
-- Venues
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  address JSONB NOT NULL,
  coordinates POINT,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  default_capacity INTEGER,
  amenities JSONB DEFAULT '[]',
  policies JSONB NOT NULL,
  pricing_model JSONB,
  cover_image VARCHAR(500),
  gallery TEXT[],
  contact_info JSONB,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue Bookings
CREATE TABLE venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_id UUID REFERENCES events(id),
  client_id UUID NOT NULL REFERENCES users(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  organization_name VARCHAR(255),
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  event_description TEXT,
  expected_attendance INTEGER,
  event_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  setup_time TIMESTAMPTZ,
  teardown_time TIMESTAMPTZ,
  configuration VARCHAR(100),
  rooms JSONB DEFAULT '[]',
  base_price DECIMAL(12,2) NOT NULL,
  additional_charges JSONB DEFAULT '[]',
  discounts JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  contract_id UUID,
  contract_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'inquiry',
  internal_notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue Contracts
CREATE TABLE venue_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES venue_bookings(id),
  venue_id UUID NOT NULL REFERENCES venues(id),
  template_id UUID REFERENCES contract_templates(id),
  venue_party JSONB NOT NULL,
  client_party JSONB NOT NULL,
  terms JSONB NOT NULL,
  document_url VARCHAR(500),
  document_version INTEGER DEFAULT 1,
  signatures JSONB DEFAULT '[]',
  all_parties_signed BOOLEAN DEFAULT false,
  docusign_envelope_id VARCHAR(100),
  docusign_status VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_venues_tenant ON venues(tenant_id);
CREATE INDEX idx_bookings_venue ON venue_bookings(venue_id);
CREATE INDEX idx_bookings_date ON venue_bookings(event_date);
CREATE INDEX idx_bookings_status ON venue_bookings(status);
CREATE INDEX idx_contracts_booking ON venue_contracts(booking_id);
CREATE INDEX idx_contracts_envelope ON venue_contracts(docusign_envelope_id);
```

## Related Skills
- `event-ticketing-standard` - Event management
- `venue-pos-standard` - Point of sale
- `docusign-integration` - eSignature workflows
