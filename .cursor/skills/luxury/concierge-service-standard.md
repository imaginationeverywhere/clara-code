# Concierge Service Standard

## Overview
Premium concierge service management for luxury hospitality, VIP experiences, and high-end service providers. Handles personalized service requests, preference management, reservation coordination, exclusive access, and white-glove customer experience.

## Domain Context
- **Primary Projects**: Quik Luxury, Premium membership platforms, VIP services
- **Related Domains**: Events, Transportation, Reservations
- **Key Integration**: Partner networks, Reservation systems, Communication platforms, CRM

## Core Interfaces

```typescript
interface ConciergeClient {
  id: string;
  tenantId: string;
  membershipTier: MembershipTier;
  contact: ClientContact;
  profile: ClientProfile;
  preferences: ClientPreferences;
  household: HouseholdMember[];
  paymentMethods: PaymentMethod[];
  specialDates: SpecialDate[];
  serviceHistory: ServiceSummary;
  dedicatedAgent?: AgentInfo;
  notes: ClientNote[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

type MembershipTier = 'silver' | 'gold' | 'platinum' | 'black' | 'invitation_only';

interface ClientContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  preferredContactMethod: 'phone' | 'email' | 'text' | 'whatsapp';
  preferredContactTimes?: TimePreference[];
  addresses: ClientAddress[];
  assistants?: AssistantContact[];
}

interface ClientProfile {
  title?: string;
  company?: string;
  position?: string;
  vipStatus: string;
  languages: string[];
  nationality?: string;
  passportCountry?: string;
  frequentTraveler: FrequentTravelerInfo[];
  bio?: string;
  photo?: string;
  socialProfiles?: SocialProfile[];
}

interface ClientPreferences {
  dining: DiningPreferences;
  travel: TravelPreferences;
  accommodation: AccommodationPreferences;
  entertainment: EntertainmentPreferences;
  lifestyle: LifestylePreferences;
  communication: CommunicationPreferences;
  gifting: GiftingPreferences;
}

interface DiningPreferences {
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteRestaurants: FavoriteVenue[];
  seatingPreferences: string[];
  winePreferences?: string[];
  mealTiming?: string;
}

interface TravelPreferences {
  airlinePreferences: AirlinePreference[];
  seatPreferences: string[];
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  mealPreferences?: string;
  loungeAccess: boolean;
  groundTransportPreferences: string[];
  carPreferences?: string[];
  passportNumbers: PassportInfo[];
  visaInfo: VisaInfo[];
  travelStyle: string[];
}

interface AccommodationPreferences {
  hotelBrands: string[];
  roomType: string[];
  bedType: string;
  floorPreference: 'high' | 'low' | 'no_preference';
  viewPreference?: string;
  amenityRequirements: string[];
  pillowType?: string;
  minibarPreferences?: string[];
  roomTemperature?: number;
}

interface EntertainmentPreferences {
  interests: string[];
  sports: SportPreference[];
  music: MusicPreference[];
  art: string[];
  theater: string[];
  nightlife: string[];
  exclusiveEvents: boolean;
}

interface ServiceRequest {
  id: string;
  tenantId: string;
  clientId: string;
  client: ConciergeClient;
  type: RequestType;
  category: ServiceCategory;
  status: RequestStatus;
  priority: 'standard' | 'high' | 'urgent' | 'immediate';
  title: string;
  description: string;
  requirements: RequestRequirement[];
  preferences: string[];
  budget?: BudgetInfo;
  timeline: RequestTimeline;
  location?: RequestLocation;
  participants?: RequestParticipant[];
  assignedTo: AgentInfo;
  collaborators: AgentInfo[];
  tasks: ServiceTask[];
  communications: RequestCommunication[];
  documents: RequestDocument[];
  expenses: RequestExpense[];
  fulfillment?: FulfillmentDetails;
  satisfaction?: SatisfactionRating;
  createdAt: Date;
  updatedAt: Date;
}

type RequestType =
  | 'reservation'
  | 'travel'
  | 'event_access'
  | 'personal_shopping'
  | 'gift_sourcing'
  | 'lifestyle'
  | 'emergency'
  | 'special_occasion'
  | 'custom';

type ServiceCategory =
  | 'dining'
  | 'accommodation'
  | 'transportation'
  | 'entertainment'
  | 'wellness'
  | 'shopping'
  | 'home_services'
  | 'business'
  | 'family'
  | 'pet'
  | 'other';

type RequestStatus =
  | 'submitted'
  | 'acknowledged'
  | 'researching'
  | 'options_presented'
  | 'confirmed'
  | 'in_progress'
  | 'fulfilled'
  | 'closed'
  | 'cancelled';

interface RequestRequirement {
  description: string;
  mandatory: boolean;
  fulfilled: boolean;
  notes?: string;
}

interface BudgetInfo {
  type: 'flexible' | 'fixed' | 'range';
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  currency: string;
  notes?: string;
}

interface RequestTimeline {
  requestedDate?: Date;
  requestedTime?: string;
  flexibility: 'exact' | 'flexible' | 'anytime';
  alternativeDates?: Date[];
  deadline?: Date;
  duration?: string;
}

interface ServiceTask {
  id: string;
  requestId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  sequence: number;
}

interface FulfillmentDetails {
  confirmationNumber?: string;
  vendorName?: string;
  vendorContact?: string;
  details: Record<string, any>;
  documents: string[];
  instructions?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

interface SatisfactionRating {
  overall: number;
  timeliness: number;
  quality: number;
  communication: number;
  feedback?: string;
  improvementAreas?: string[];
  submittedAt: Date;
}

interface Reservation {
  id: string;
  requestId?: string;
  clientId: string;
  type: ReservationType;
  status: ReservationStatus;
  venue: VenueInfo;
  dateTime: Date;
  duration?: number;
  partySize: number;
  guests: GuestInfo[];
  specialRequests: string[];
  confirmationNumber?: string;
  notes?: string;
  reminders: Reminder[];
  createdAt: Date;
}

type ReservationType =
  | 'restaurant'
  | 'hotel'
  | 'spa'
  | 'flight'
  | 'car'
  | 'yacht'
  | 'private_jet'
  | 'event'
  | 'experience'
  | 'other';

type ReservationStatus =
  | 'requested'
  | 'pending'
  | 'confirmed'
  | 'modified'
  | 'cancelled'
  | 'completed'
  | 'no_show';

interface VenueInfo {
  id?: string;
  name: string;
  type: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  partnerStatus: 'preferred' | 'partner' | 'standard';
  notes?: string;
}

interface PartnerNetwork {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  tier: 'preferred' | 'premium' | 'exclusive';
  contact: PartnerContact;
  services: PartnerService[];
  benefits: string[];
  commissionRate?: number;
  contractExpiry?: Date;
  rating: number;
  notes?: string;
}

interface PartnerService {
  name: string;
  description: string;
  availability: string;
  leadTime: string;
  priceRange?: string;
  exclusiveAccess: boolean;
}

interface ConciergeAgent {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  languages: string[];
  clientCount: number;
  rating: number;
  availability: AgentAvailability;
  activeRequests: number;
  completedRequests: number;
}
```

## Service Implementation

```typescript
class ConciergeService {
  // Client management
  async createClient(input: CreateClientInput): Promise<ConciergeClient>;
  async updateClient(clientId: string, updates: UpdateClientInput): Promise<ConciergeClient>;
  async updatePreferences(clientId: string, preferences: Partial<ClientPreferences>): Promise<ConciergeClient>;
  async assignAgent(clientId: string, agentId: string): Promise<ConciergeClient>;
  async getClientHistory(clientId: string): Promise<ServiceHistory>;
  async searchClients(query: ClientSearchQuery): Promise<ConciergeClient[]>;

  // Service requests
  async createRequest(input: CreateRequestInput): Promise<ServiceRequest>;
  async updateRequest(requestId: string, updates: UpdateRequestInput): Promise<ServiceRequest>;
  async assignRequest(requestId: string, agentId: string): Promise<ServiceRequest>;
  async updateRequestStatus(requestId: string, status: RequestStatus, notes?: string): Promise<ServiceRequest>;
  async addTask(requestId: string, task: CreateTaskInput): Promise<ServiceTask>;
  async completeTask(taskId: string, notes?: string): Promise<ServiceTask>;
  async presentOptions(requestId: string, options: ServiceOption[]): Promise<void>;
  async confirmOption(requestId: string, optionId: string): Promise<ServiceRequest>;
  async fulfillRequest(requestId: string, fulfillment: FulfillmentDetails): Promise<ServiceRequest>;
  async closeRequest(requestId: string, satisfaction?: SatisfactionRating): Promise<ServiceRequest>;

  // Reservations
  async createReservation(input: CreateReservationInput): Promise<Reservation>;
  async modifyReservation(reservationId: string, changes: ReservationChanges): Promise<Reservation>;
  async cancelReservation(reservationId: string, reason?: string): Promise<Reservation>;
  async confirmReservation(reservationId: string, confirmationNumber: string): Promise<Reservation>;
  async getUpcomingReservations(clientId: string): Promise<Reservation[]>;
  async sendReminder(reservationId: string): Promise<void>;

  // Partner network
  async searchPartners(criteria: PartnerSearchCriteria): Promise<PartnerNetwork[]>;
  async getPartnerAvailability(partnerId: string, date: Date): Promise<Availability>;
  async createPartnerBooking(partnerId: string, booking: BookingInput): Promise<Reservation>;

  // Communication
  async sendMessage(clientId: string, message: ClientMessage): Promise<void>;
  async sendItinerary(clientId: string, itinerary: Itinerary): Promise<void>;
  async sendConfirmation(reservationId: string): Promise<void>;
  async scheduleFollowUp(requestId: string, followUp: FollowUpInput): Promise<void>;

  // Insights and recommendations
  async getClientInsights(clientId: string): Promise<ClientInsights>;
  async generateRecommendations(clientId: string, category: string): Promise<Recommendation[]>;
  async predictPreferences(clientId: string, context: RequestContext): Promise<PredictedPreferences>;

  // Reporting
  async getAgentPerformance(agentId: string, dateRange: DateRange): Promise<AgentPerformance>;
  async getServiceMetrics(tenantId: string, dateRange: DateRange): Promise<ServiceMetrics>;
  async getClientSatisfaction(tenantId: string): Promise<SatisfactionReport>;
}
```

## Database Schema

```sql
CREATE TABLE concierge_clients (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  membership_tier VARCHAR(30) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  preferred_contact VARCHAR(20) DEFAULT 'phone',
  title VARCHAR(50),
  company VARCHAR(255),
  position VARCHAR(255),
  vip_status VARCHAR(50),
  languages TEXT[],
  nationality VARCHAR(100),
  addresses JSONB DEFAULT '[]',
  assistants JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  household JSONB DEFAULT '[]',
  special_dates JSONB DEFAULT '[]',
  photo_url TEXT,
  dedicated_agent_id UUID,
  tags TEXT[],
  total_requests INTEGER DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,
  satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_requests (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES concierge_clients(id),
  request_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'submitted',
  priority VARCHAR(20) DEFAULT 'standard',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '[]',
  preferences TEXT[],
  budget_type VARCHAR(20),
  budget_amount DECIMAL(10,2),
  budget_currency VARCHAR(3) DEFAULT 'USD',
  requested_date DATE,
  requested_time TIME,
  flexibility VARCHAR(20),
  deadline TIMESTAMPTZ,
  location JSONB,
  participants JSONB DEFAULT '[]',
  assigned_to UUID,
  collaborators UUID[],
  fulfillment JSONB,
  satisfaction JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_tasks (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES service_requests(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  sequence INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE request_communications (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES service_requests(id),
  direction VARCHAR(10) NOT NULL, -- inbound, outbound
  channel VARCHAR(20) NOT NULL,
  sender_id UUID,
  recipient_id UUID,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  attachments TEXT[],
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  request_id UUID REFERENCES service_requests(id),
  client_id UUID NOT NULL REFERENCES concierge_clients(id),
  reservation_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'requested',
  venue_name VARCHAR(255) NOT NULL,
  venue_type VARCHAR(50),
  venue_address JSONB,
  venue_phone VARCHAR(20),
  venue_contact VARCHAR(255),
  partner_id UUID,
  date_time TIMESTAMPTZ NOT NULL,
  duration INTEGER,
  party_size INTEGER,
  guests JSONB DEFAULT '[]',
  special_requests TEXT[],
  confirmation_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservation_reminders (
  id UUID PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES reservations(id),
  reminder_type VARCHAR(30) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE partner_network (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tier VARCHAR(30) DEFAULT 'standard',
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address JSONB,
  website TEXT,
  services JSONB DEFAULT '[]',
  benefits TEXT[],
  commission_rate DECIMAL(5,2),
  contract_expiry DATE,
  rating DECIMAL(3,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE concierge_agents (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  specializations TEXT[],
  languages TEXT[],
  is_active BOOLEAN DEFAULT true,
  client_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  availability JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_notes (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES concierge_clients(id),
  author_id UUID NOT NULL,
  note_type VARCHAR(30),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE request_expenses (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES service_requests(id),
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  vendor VARCHAR(255),
  receipt_url TEXT,
  billed BOOLEAN DEFAULT false,
  billed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_tenant ON concierge_clients(tenant_id);
CREATE INDEX idx_clients_tier ON concierge_clients(membership_tier);
CREATE INDEX idx_clients_agent ON concierge_clients(dedicated_agent_id);
CREATE INDEX idx_requests_tenant_status ON service_requests(tenant_id, status);
CREATE INDEX idx_requests_client ON service_requests(client_id);
CREATE INDEX idx_requests_assigned ON service_requests(assigned_to);
CREATE INDEX idx_tasks_request ON service_tasks(request_id);
CREATE INDEX idx_reservations_client ON reservations(client_id);
CREATE INDEX idx_reservations_date ON reservations(date_time);
CREATE INDEX idx_partners_tenant_category ON partner_network(tenant_id, category);
CREATE INDEX idx_agents_tenant ON concierge_agents(tenant_id);
```

## API Endpoints

```typescript
// GET /api/clients - List clients
// GET /api/clients/:id - Get client
// POST /api/clients - Create client
// PUT /api/clients/:id - Update client
// PUT /api/clients/:id/preferences - Update preferences
// POST /api/clients/:id/assign-agent - Assign agent
// GET /api/clients/:id/history - Get service history
// GET /api/requests - List requests
// GET /api/requests/:id - Get request
// POST /api/requests - Create request
// PUT /api/requests/:id - Update request
// PUT /api/requests/:id/status - Update status
// POST /api/requests/:id/tasks - Add task
// PUT /api/tasks/:id - Update task
// POST /api/requests/:id/options - Present options
// POST /api/requests/:id/confirm - Confirm option
// POST /api/requests/:id/fulfill - Fulfill request
// POST /api/requests/:id/close - Close request
// GET /api/reservations - List reservations
// POST /api/reservations - Create reservation
// PUT /api/reservations/:id - Modify reservation
// DELETE /api/reservations/:id - Cancel reservation
// POST /api/reservations/:id/confirm - Confirm reservation
// GET /api/partners - List partners
// GET /api/partners/:id/availability - Get availability
// POST /api/partners/:id/book - Create booking
// GET /api/clients/:id/insights - Get client insights
// GET /api/clients/:id/recommendations - Get recommendations
// GET /api/agents/:id/performance - Agent performance
// GET /api/reports/satisfaction - Satisfaction report
```

## Related Skills
- `event-ticketing-standard.md` - Event access
- `vehicle-rental-standard.md` - Luxury transportation
- `live-streaming-standard.md` - Virtual experiences

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Luxury
