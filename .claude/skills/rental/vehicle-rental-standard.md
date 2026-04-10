# Vehicle Rental Standard

## Overview
Vehicle rental management for cars, trucks, vans, and specialty vehicles. Handles fleet management, reservation scheduling, pricing with mileage tracking, insurance options, vehicle inspection workflows, and integration with telematics.

## Domain Context
- **Primary Projects**: Quik Car Rental, Quik Nation fleet services
- **Related Domains**: Transportation, Payments, Insurance
- **Key Integration**: Stripe (payments), Telematics (GPS/OBD), DocuSign (contracts), DMV APIs

## Core Interfaces

```typescript
interface Vehicle {
  id: string;
  tenantId: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: 'automatic' | 'manual';
  fuelType: FuelType;
  color: string;
  seats: number;
  doors: number;
  status: VehicleStatus;
  mileage: number;
  features: VehicleFeature[];
  images: string[];
  location: RentalLocation;
  pricing: VehiclePricing;
  insurance: VehicleInsurance;
  registration: VehicleRegistration;
  telematics?: TelematicsInfo;
  maintenanceStatus: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

type VehicleCategory =
  | 'economy'
  | 'compact'
  | 'midsize'
  | 'fullsize'
  | 'luxury'
  | 'suv'
  | 'minivan'
  | 'truck'
  | 'convertible'
  | 'electric';

type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plugin_hybrid';

type VehicleStatus =
  | 'available'
  | 'reserved'
  | 'rented'
  | 'maintenance'
  | 'cleaning'
  | 'in_transit'
  | 'retired';

interface VehicleFeature {
  name: string;
  icon: string;
  category: 'safety' | 'comfort' | 'technology' | 'performance';
}

interface VehiclePricing {
  dailyRate: number;
  weeklyRate: number;
  monthlyRate?: number;
  mileageAllowance: number;
  excessMileageRate: number;
  youngDriverFee?: number;
  additionalDriverFee: number;
  deposit: number;
  cleaningFee?: number;
}

interface VehicleInsurance {
  coverageType: 'basic' | 'standard' | 'premium' | 'full';
  dailyRate: number;
  deductible: number;
  coverageDetails: string[];
  provider: string;
  policyNumber?: string;
}

interface VehicleRental {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle: Vehicle;
  customerId: string;
  customer: RentalCustomer;
  drivers: RentalDriver[];
  status: RentalStatus;
  pickupInfo: PickupInfo;
  returnInfo: ReturnInfo;
  mileage: MileageTracking;
  pricing: RentalPricing;
  insurance: SelectedInsurance;
  addOns: RentalAddOn[];
  inspection: InspectionRecord;
  deposit: DepositInfo;
  contract?: RentalContract;
  createdAt: Date;
  updatedAt: Date;
}

type RentalStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_out'
  | 'active'
  | 'overdue'
  | 'checked_in'
  | 'completed'
  | 'cancelled';

interface RentalDriver {
  id: string;
  isPrimary: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: Date;
  licenseVerified: boolean;
}

interface PickupInfo {
  locationId: string;
  location: RentalLocation;
  scheduledDate: Date;
  actualDate?: Date;
  agentId?: string;
  fuelLevel: number;
  mileage: number;
}

interface ReturnInfo {
  locationId: string;
  location: RentalLocation;
  scheduledDate: Date;
  actualDate?: Date;
  agentId?: string;
  fuelLevel?: number;
  mileage?: number;
  differentLocationFee?: number;
}

interface MileageTracking {
  startMileage: number;
  currentMileage?: number;
  endMileage?: number;
  allowedMileage: number;
  excessMileage?: number;
  excessCharge?: number;
}

interface RentalPricing {
  baseRate: number;
  days: number;
  subtotal: number;
  insuranceCost: number;
  addOnsCost: number;
  taxes: number;
  fees: RentalFee[];
  discounts: DiscountInfo[];
  deposit: number;
  total: number;
  amountPaid: number;
  amountDue: number;
}

interface RentalFee {
  type: 'young_driver' | 'additional_driver' | 'different_location' | 'late_return' | 'fuel' | 'cleaning' | 'toll' | 'traffic_violation';
  description: string;
  amount: number;
}

interface RentalAddOn {
  id: string;
  type: AddOnType;
  name: string;
  dailyRate: number;
  quantity: number;
  totalCost: number;
}

type AddOnType = 'gps' | 'child_seat' | 'ski_rack' | 'bike_rack' | 'wifi_hotspot' | 'toll_pass' | 'roadside_assistance';

interface InspectionRecord {
  preRental: VehicleInspection;
  postRental?: VehicleInspection;
  damageDiscrepancies?: DamageDiscrepancy[];
}

interface VehicleInspection {
  id: string;
  inspectedBy: string;
  inspectedAt: Date;
  fuelLevel: number;
  mileage: number;
  exteriorCondition: ConditionCheck[];
  interiorCondition: ConditionCheck[];
  photos: InspectionPhoto[];
  notes?: string;
  customerSignature?: string;
}

interface ConditionCheck {
  area: string;
  condition: 'perfect' | 'good' | 'minor_damage' | 'major_damage';
  notes?: string;
  photoIds?: string[];
}

interface TelematicsInfo {
  deviceId: string;
  provider: string;
  lastLocation?: GeoLocation;
  lastUpdate?: Date;
  fuelLevel?: number;
  batteryLevel?: number;
  engineStatus: 'on' | 'off';
  speed?: number;
  alerts: TelematicsAlert[];
}

interface TelematicsAlert {
  type: 'speeding' | 'geofence_exit' | 'harsh_braking' | 'low_fuel' | 'maintenance_due';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  location?: GeoLocation;
}

interface RentalContract {
  id: string;
  rentalId: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  documentUrl: string;
  docusignEnvelopeId?: string;
  signedAt?: Date;
  terms: ContractTerms;
}

interface ContractTerms {
  authorizedUseArea: string[];
  prohibitedActivities: string[];
  insuranceTerms: string;
  liabilityTerms: string;
  fuelPolicy: 'same_to_same' | 'prepaid' | 'pay_on_return';
  lateReturnPolicy: string;
  cancellationPolicy: string;
}
```

## Service Implementation

```typescript
class VehicleRentalService {
  // Fleet management
  async addVehicle(vehicle: CreateVehicleInput): Promise<Vehicle>;
  async updateVehicle(vehicleId: string, updates: UpdateVehicleInput): Promise<Vehicle>;
  async updateVehicleStatus(vehicleId: string, status: VehicleStatus): Promise<Vehicle>;
  async getFleetByLocation(locationId: string): Promise<Vehicle[]>;
  async getFleetUtilization(dateRange: DateRange): Promise<UtilizationReport>;

  // Availability and search
  async searchAvailableVehicles(criteria: SearchCriteria): Promise<VehicleSearchResult[]>;
  async checkVehicleAvailability(vehicleId: string, dates: DateRange): Promise<AvailabilityResult>;
  async getVehicleCalendar(vehicleId: string, month: Date): Promise<CalendarDay[]>;

  // Reservations
  async createRental(input: CreateRentalInput): Promise<VehicleRental>;
  async modifyRental(rentalId: string, changes: ModifyRentalInput): Promise<VehicleRental>;
  async cancelRental(rentalId: string, reason: string): Promise<RefundResult>;
  async extendRental(rentalId: string, newEndDate: Date): Promise<VehicleRental>;

  // Checkout/Return
  async checkoutVehicle(rentalId: string, inspection: VehicleInspection): Promise<VehicleRental>;
  async checkinVehicle(rentalId: string, inspection: VehicleInspection): Promise<CheckinResult>;
  async processLateFees(rentalId: string): Promise<RentalFee[]>;

  // Driver verification
  async verifyDriver(driver: RentalDriver): Promise<DriverVerificationResult>;
  async addAdditionalDriver(rentalId: string, driver: RentalDriver): Promise<VehicleRental>;

  // Pricing
  async calculatePricing(input: PricingInput): Promise<RentalPricing>;
  async applyPromoCode(rentalId: string, code: string): Promise<RentalPricing>;

  // Insurance
  async getInsuranceOptions(vehicleId: string): Promise<VehicleInsurance[]>;
  async selectInsurance(rentalId: string, insuranceId: string): Promise<VehicleRental>;

  // Telematics
  async getVehicleLocation(vehicleId: string): Promise<GeoLocation>;
  async getVehicleTelemetry(vehicleId: string): Promise<TelematicsInfo>;
  async setGeofence(vehicleId: string, geofence: Geofence): Promise<void>;

  // Contracts
  async generateContract(rentalId: string): Promise<RentalContract>;
  async sendContractForSignature(contractId: string): Promise<void>;

  // Reporting
  async getRevenueReport(dateRange: DateRange): Promise<RevenueReport>;
  async getMaintenanceReport(): Promise<MaintenanceReport>;
}
```

## Database Schema

```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  vin VARCHAR(17) UNIQUE NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  category VARCHAR(30) NOT NULL,
  transmission VARCHAR(20) DEFAULT 'automatic',
  fuel_type VARCHAR(20) NOT NULL,
  color VARCHAR(30),
  seats INTEGER NOT NULL,
  doors INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'available',
  mileage INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  images TEXT[],
  location_id UUID NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  weekly_rate DECIMAL(10,2) NOT NULL,
  monthly_rate DECIMAL(10,2),
  mileage_allowance INTEGER DEFAULT 250,
  excess_mileage_rate DECIMAL(10,2) DEFAULT 0.25,
  deposit_amount DECIMAL(10,2) NOT NULL,
  telematics_device_id VARCHAR(100),
  registration_expiry DATE,
  insurance_expiry DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_locations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL, -- airport, city, hotel
  address JSONB NOT NULL,
  coordinates POINT,
  phone VARCHAR(20),
  email VARCHAR(255),
  hours JSONB,
  is_24_hour BOOLEAN DEFAULT false,
  accepts_after_hours BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_rentals (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  customer_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  pickup_location_id UUID NOT NULL REFERENCES rental_locations(id),
  pickup_scheduled TIMESTAMPTZ NOT NULL,
  pickup_actual TIMESTAMPTZ,
  return_location_id UUID NOT NULL REFERENCES rental_locations(id),
  return_scheduled TIMESTAMPTZ NOT NULL,
  return_actual TIMESTAMPTZ,
  start_mileage INTEGER,
  end_mileage INTEGER,
  allowed_mileage INTEGER,
  start_fuel_level INTEGER,
  end_fuel_level INTEGER,
  base_rate DECIMAL(10,2),
  rental_days INTEGER,
  subtotal DECIMAL(10,2),
  insurance_cost DECIMAL(10,2),
  addons_cost DECIMAL(10,2),
  fees JSONB DEFAULT '[]',
  taxes DECIMAL(10,2),
  discounts JSONB DEFAULT '[]',
  deposit_amount DECIMAL(10,2),
  deposit_status VARCHAR(30),
  total DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  insurance_type VARCHAR(30),
  contract_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_drivers (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES vehicle_rentals(id),
  is_primary BOOLEAN DEFAULT false,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  license_state VARCHAR(10),
  license_expiry DATE NOT NULL,
  license_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_addons (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES vehicle_rentals(id),
  addon_type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_inspections (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES vehicle_rentals(id),
  inspection_type VARCHAR(20) NOT NULL, -- pre_rental, post_rental
  inspected_by UUID NOT NULL,
  inspected_at TIMESTAMPTZ DEFAULT NOW(),
  fuel_level INTEGER,
  mileage INTEGER,
  exterior_condition JSONB NOT NULL,
  interior_condition JSONB NOT NULL,
  photos JSONB DEFAULT '[]',
  notes TEXT,
  customer_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_contracts (
  id UUID PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES vehicle_rentals(id),
  status VARCHAR(20) DEFAULT 'draft',
  document_url TEXT,
  docusign_envelope_id VARCHAR(100),
  signed_at TIMESTAMPTZ,
  terms JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telematics_events (
  id UUID PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20),
  message TEXT,
  location POINT,
  speed DECIMAL(5,2),
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_tenant_status ON vehicles(tenant_id, status);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_location ON vehicles(location_id);
CREATE INDEX idx_rentals_tenant_dates ON vehicle_rentals(tenant_id, pickup_scheduled, return_scheduled);
CREATE INDEX idx_rentals_vehicle ON vehicle_rentals(vehicle_id);
CREATE INDEX idx_rentals_status ON vehicle_rentals(status);
CREATE INDEX idx_drivers_rental ON rental_drivers(rental_id);
CREATE INDEX idx_inspections_rental ON vehicle_inspections(rental_id);
CREATE INDEX idx_telematics_vehicle ON telematics_events(vehicle_id, recorded_at);
```

## API Endpoints

```typescript
// GET /api/vehicles - Search available vehicles
// GET /api/vehicles/:id - Get vehicle details
// POST /api/vehicles - Add vehicle to fleet
// PUT /api/vehicles/:id - Update vehicle
// GET /api/vehicles/:id/calendar - Get vehicle availability calendar
// GET /api/vehicles/:id/location - Get current GPS location
// POST /api/rentals - Create rental reservation
// GET /api/rentals/:id - Get rental details
// PUT /api/rentals/:id - Modify rental
// POST /api/rentals/:id/checkout - Checkout vehicle
// POST /api/rentals/:id/checkin - Return vehicle
// POST /api/rentals/:id/extend - Extend rental
// POST /api/rentals/:id/drivers - Add additional driver
// POST /api/rentals/:id/contract - Generate contract
// GET /api/rentals/:id/contract - Get contract
// GET /api/locations - List rental locations
// GET /api/insurance-options - Get available insurance
// POST /api/drivers/verify - Verify driver license
```

## Related Skills
- `equipment-rental-standard.md` - General equipment rental
- `rideshare-driver-standard.md` - Driver management patterns
- `tap-to-pay-standard.md` - Payment processing

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Rental
