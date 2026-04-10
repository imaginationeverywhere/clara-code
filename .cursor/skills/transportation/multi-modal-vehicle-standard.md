# Multi-Modal Vehicle Standard

Supporting multiple vehicle types (cars, golf carts, luxury vehicles, shuttles) in transportation platforms.

## Target Projects
- **Quik Carry** - Transportation and delivery platform ecosystem

## Core Components

### 1. Vehicle Type Registry

```typescript
interface VehicleTypeDefinition {
  id: string;
  code: VehicleType;
  name: string;
  displayName: string;
  description: string;
  icon: string;

  // Characteristics
  characteristics: VehicleCharacteristics;

  // Pricing
  pricingConfig: VehiclePricingConfig;

  // Requirements
  driverRequirements: DriverRequirements;
  vehicleRequirements: VehicleRequirements;

  // Availability
  availableMarkets: string[];     // Market/city IDs
  availableEvents: string[];      // Event zone IDs (for event-specific vehicles)

  // Display
  displayOrder: number;
  featured: boolean;
  badge?: string;                 // "Popular", "Eco", "Premium"

  status: 'active' | 'inactive' | 'beta';
}

type VehicleType =
  // Standard vehicles
  | 'economy'
  | 'comfort'
  | 'xl'
  | 'premium'
  | 'luxury'
  | 'black'
  // Specialty vehicles
  | 'golf_cart'
  | 'pedicab'
  | 'motorcycle'
  // Shared/Group
  | 'pool'
  | 'shuttle'
  | 'van'
  | 'bus'
  // Accessibility
  | 'wheelchair_accessible'
  | 'assist';

interface VehicleCharacteristics {
  minCapacity: number;
  maxCapacity: number;
  luggageCapacity: 'none' | 'small' | 'medium' | 'large';
  maxSpeed: number;               // km/h
  range: number;                  // km (for electric/golf carts)
  terrain: ('road' | 'path' | 'trail')[];
  weatherRestrictions: string[];  // "rain", "snow"
  accessibilityFeatures: string[];
  amenities: string[];
}

interface VehiclePricingConfig {
  baseFare: number;
  perKm: number;
  perMinute: number;
  minimumFare: number;
  bookingFee: number;
  cancellationFee: number;
  waitTimeFee: number;            // Per minute after grace period

  // Modifiers
  surgeEnabled: boolean;
  maxSurge: number;
  peakHourMultiplier?: number;
  airportSurcharge?: number;

  // Special pricing
  hourlyRate?: number;            // For hourly bookings
  dailyRate?: number;             // For all-day bookings
}

interface DriverRequirements {
  minimumAge: number;
  licenseTypes: string[];
  minimumExperience: number;      // Years
  certifications?: string[];
  backgroundCheckLevel: 'basic' | 'standard' | 'enhanced';
  trainingRequired: string[];
}

interface VehicleRequirements {
  makes?: string[];               // Allowed makes
  models?: string[];              // Allowed models
  minYear: number;
  maxAge: number;                 // Years old
  minRating?: number;             // Vehicle condition
  colors?: string[];              // For luxury/black
  inspectionFrequency: number;    // Days
  insuranceMinimum: number;
  features: string[];             // Required features
}
```

### 2. Vehicle Type Service

```typescript
export class VehicleTypeService {
  private vehicleTypes: Map<VehicleType, VehicleTypeDefinition> = new Map();

  /**
   * Initialize vehicle type registry
   */
  async initialize(): Promise<void> {
    const types = await this.loadVehicleTypes();
    types.forEach(t => this.vehicleTypes.set(t.code, t));
  }

  /**
   * Get available vehicle types for location
   */
  async getAvailableTypes(
    location: Location,
    options?: {
      passengerCount?: number;
      luggageSize?: string;
      accessibility?: boolean;
      eventZoneId?: string;
    }
  ): Promise<VehicleTypeDefinition[]> {
    const market = await this.getMarket(location);
    let types = Array.from(this.vehicleTypes.values())
      .filter(t => t.status === 'active')
      .filter(t => t.availableMarkets.includes(market.id));

    // Filter by passenger count
    if (options?.passengerCount) {
      types = types.filter(t =>
        t.characteristics.maxCapacity >= options.passengerCount!
      );
    }

    // Filter by luggage
    if (options?.luggageSize) {
      types = types.filter(t =>
        this.luggageFits(t.characteristics.luggageCapacity, options.luggageSize!)
      );
    }

    // Filter by accessibility
    if (options?.accessibility) {
      types = types.filter(t =>
        t.characteristics.accessibilityFeatures.length > 0
      );
    }

    // Add event-specific vehicles if in event zone
    if (options?.eventZoneId) {
      const eventTypes = Array.from(this.vehicleTypes.values())
        .filter(t => t.availableEvents.includes(options.eventZoneId!));
      types = [...types, ...eventTypes];
    }

    // Check real-time availability
    const availableTypes = await this.checkRealTimeAvailability(types, location);

    return availableTypes.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Check if driver/vehicle meets requirements
   */
  async validateDriverVehicle(
    driver: Driver,
    vehicle: Vehicle,
    vehicleType: VehicleType
  ): Promise<ValidationResult> {
    const typeDefinition = this.vehicleTypes.get(vehicleType);
    if (!typeDefinition) {
      return { valid: false, errors: ['Invalid vehicle type'] };
    }

    const errors: string[] = [];

    // Check driver requirements
    const driverReqs = typeDefinition.driverRequirements;

    if (driver.age < driverReqs.minimumAge) {
      errors.push(`Driver must be at least ${driverReqs.minimumAge} years old`);
    }

    if (!driverReqs.licenseTypes.includes(driver.licenseType)) {
      errors.push(`License type ${driver.licenseType} not accepted`);
    }

    if (driver.yearsExperience < driverReqs.minimumExperience) {
      errors.push(`Minimum ${driverReqs.minimumExperience} years experience required`);
    }

    // Check vehicle requirements
    const vehicleReqs = typeDefinition.vehicleRequirements;

    if (vehicleReqs.makes && !vehicleReqs.makes.includes(vehicle.make)) {
      errors.push(`Vehicle make ${vehicle.make} not accepted`);
    }

    if (vehicle.year < vehicleReqs.minYear) {
      errors.push(`Vehicle must be ${vehicleReqs.minYear} or newer`);
    }

    const vehicleAge = new Date().getFullYear() - vehicle.year;
    if (vehicleAge > vehicleReqs.maxAge) {
      errors.push(`Vehicle cannot be older than ${vehicleReqs.maxAge} years`);
    }

    // Check required features
    for (const feature of vehicleReqs.features) {
      if (!vehicle.features.includes(feature)) {
        errors.push(`Vehicle must have: ${feature}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get vehicle type specific fare
   */
  async calculateTypeFare(
    vehicleType: VehicleType,
    route: Route,
    options?: {
      scheduledTime?: Date;
      promoCode?: string;
      eventZoneId?: string;
    }
  ): Promise<FareEstimate> {
    const typeDefinition = this.vehicleTypes.get(vehicleType);
    if (!typeDefinition) {
      throw new Error('Invalid vehicle type');
    }

    const pricing = typeDefinition.pricingConfig;
    const distanceKm = route.distanceMeters / 1000;
    const durationMinutes = route.durationSeconds / 60;

    // Base calculation
    let fare = pricing.baseFare;
    fare += distanceKm * pricing.perKm;
    fare += durationMinutes * pricing.perMinute;

    // Apply minimum
    fare = Math.max(fare, pricing.minimumFare);

    // Add fees
    fare += pricing.bookingFee;

    // Airport surcharge
    if (pricing.airportSurcharge && this.isAirportRoute(route)) {
      fare += pricing.airportSurcharge;
    }

    // Surge (if enabled)
    let surgeMultiplier = 1.0;
    if (pricing.surgeEnabled) {
      surgeMultiplier = await this.getSurgeMultiplier(
        route.origin,
        vehicleType,
        options?.eventZoneId
      );
      surgeMultiplier = Math.min(surgeMultiplier, pricing.maxSurge);
    }

    // Peak hour multiplier
    if (pricing.peakHourMultiplier && this.isPeakHour(options?.scheduledTime)) {
      surgeMultiplier = Math.max(surgeMultiplier, pricing.peakHourMultiplier);
    }

    const surgeAmount = fare * (surgeMultiplier - 1);
    const totalFare = fare + surgeAmount;

    return {
      vehicleType,
      baseFare: pricing.baseFare,
      distanceFare: distanceKm * pricing.perKm,
      timeFare: durationMinutes * pricing.perMinute,
      bookingFee: pricing.bookingFee,
      airportSurcharge: pricing.airportSurcharge || 0,
      surgeMultiplier,
      surgeAmount,
      totalFare,
      currency: 'USD',
      distanceKm,
      estimatedDurationMinutes: durationMinutes
    };
  }
}
```

### 3. Multi-Modal Matching

```typescript
export class MultiModalMatchingService {
  /**
   * Find best vehicle type for request
   */
  async recommendVehicleType(
    request: RideRequestInput
  ): Promise<VehicleTypeRecommendation[]> {
    const recommendations: VehicleTypeRecommendation[] = [];

    const availableTypes = await this.vehicleTypeService.getAvailableTypes(
      request.pickup,
      {
        passengerCount: request.passengerCount,
        luggageSize: request.luggageSize,
        accessibility: request.accessibilityRequired
      }
    );

    for (const type of availableTypes) {
      const fare = await this.vehicleTypeService.calculateTypeFare(
        type.code,
        await this.getRoute(request.pickup, request.dropoff)
      );

      const eta = await this.getETA(request.pickup, type.code);
      const availability = await this.getAvailabilityScore(request.pickup, type.code);

      recommendations.push({
        vehicleType: type,
        fare,
        eta,
        availabilityScore: availability,
        recommendation: this.getRecommendationScore(fare, eta, availability, request)
      });
    }

    // Sort by recommendation score
    return recommendations.sort((a, b) => b.recommendation - a.recommendation);
  }

  /**
   * Match driver considering vehicle type specialties
   */
  async matchDriverForType(
    request: RideRequest,
    vehicleType: VehicleType
  ): Promise<Driver | null> {
    const typeDefinition = await this.vehicleTypeService.getType(vehicleType);

    // Get drivers with appropriate vehicles
    const eligibleDrivers = await this.driverService.findDrivers({
      location: request.pickup,
      vehicleType,
      status: 'online',
      radius: this.getMatchingRadius(vehicleType)
    });

    // Special handling for different vehicle types
    switch (vehicleType) {
      case 'luxury':
      case 'black':
        // Prioritize higher-rated drivers with premium experience
        return this.matchPremiumDriver(eligibleDrivers, request);

      case 'golf_cart':
      case 'pedicab':
        // Match from event staging areas first
        return this.matchEventDriver(eligibleDrivers, request);

      case 'wheelchair_accessible':
        // Prioritize drivers with accessibility training
        return this.matchAccessibleDriver(eligibleDrivers, request);

      case 'pool':
        // Consider existing pool routes
        return this.matchPoolDriver(eligibleDrivers, request);

      default:
        return this.matchStandardDriver(eligibleDrivers, request);
    }
  }

  /**
   * Get matching radius based on vehicle type
   */
  private getMatchingRadius(vehicleType: VehicleType): number {
    const radiusMap: Record<VehicleType, number> = {
      economy: 5,
      comfort: 5,
      xl: 7,
      premium: 10,
      luxury: 15,
      black: 15,
      golf_cart: 2,               // Short range
      pedicab: 1,
      motorcycle: 5,
      pool: 8,
      shuttle: 10,
      van: 10,
      bus: 15,
      wheelchair_accessible: 10,
      assist: 10
    };

    return radiusMap[vehicleType] || 5;
  }
}
```

### 4. Vehicle Fleet Management

```typescript
interface FleetVehicle {
  id: string;
  tenantId: string;
  driverId?: string;              // If assigned

  // Vehicle info
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;

  // Ownership
  ownership: 'driver_owned' | 'fleet_owned' | 'leased' | 'temporary';

  // Status
  status: 'available' | 'assigned' | 'maintenance' | 'inactive';
  currentLocation?: Location;
  lastActivityAt?: Date;

  // Maintenance
  lastInspection: Date;
  nextInspectionDue: Date;
  mileage: number;
  maintenanceHistory: MaintenanceRecord[];

  // Features
  features: string[];
  accessories: string[];          // "Child seat", "WiFi"
  condition: 'excellent' | 'good' | 'fair' | 'poor';

  // Insurance
  insurance: {
    provider: string;
    policyNumber: string;
    coverage: number;
    expiresAt: Date;
  };

  // Performance
  totalRides: number;
  averageRating: number;
  fuelEfficiency?: number;

  createdAt: Date;
  updatedAt: Date;
}

export class FleetManagementService {
  /**
   * Get fleet overview by vehicle type
   */
  async getFleetOverview(): Promise<FleetOverview> {
    const vehicles = await this.vehicleRepository.findAll();

    const overview: FleetOverview = {
      totalVehicles: vehicles.length,
      byType: {},
      byStatus: {},
      maintenanceDue: [],
      inspectionsDue: [],
      utilizationRate: 0
    };

    // Group by type
    for (const vehicle of vehicles) {
      if (!overview.byType[vehicle.type]) {
        overview.byType[vehicle.type] = {
          total: 0,
          available: 0,
          assigned: 0,
          maintenance: 0
        };
      }
      overview.byType[vehicle.type].total++;
      overview.byType[vehicle.type][vehicle.status]++;
    }

    // Check maintenance due
    const now = new Date();
    overview.maintenanceDue = vehicles.filter(v =>
      v.mileage > this.getNextMaintenanceMileage(v)
    );

    // Check inspections due
    overview.inspectionsDue = vehicles.filter(v =>
      v.nextInspectionDue <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    );

    // Calculate utilization
    const assignedCount = vehicles.filter(v => v.status === 'assigned').length;
    overview.utilizationRate = assignedCount / vehicles.length;

    return overview;
  }

  /**
   * Assign vehicle to driver
   */
  async assignVehicle(
    vehicleId: string,
    driverId: string
  ): Promise<FleetVehicle> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    const driver = await this.driverService.getDriver(driverId);

    // Validate vehicle type requirements
    const validation = await this.vehicleTypeService.validateDriverVehicle(
      driver,
      vehicle,
      vehicle.type
    );

    if (!validation.valid) {
      throw new Error(`Cannot assign: ${validation.errors.join(', ')}`);
    }

    // Check vehicle availability
    if (vehicle.status !== 'available') {
      throw new Error('Vehicle is not available');
    }

    // Check driver doesn't have assigned vehicle
    if (driver.activeVehicleId) {
      throw new Error('Driver already has an assigned vehicle');
    }

    // Assign
    vehicle.driverId = driverId;
    vehicle.status = 'assigned';

    await this.vehicleRepository.save(vehicle);
    await this.driverService.updateActiveVehicle(driverId, vehicleId);

    return vehicle;
  }

  /**
   * Schedule maintenance
   */
  async scheduleMaintenance(
    vehicleId: string,
    maintenance: MaintenanceRequest
  ): Promise<MaintenanceRecord> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    // If vehicle is assigned, notify driver
    if (vehicle.driverId) {
      await this.notificationService.notifyDriverMaintenance(
        vehicle.driverId,
        maintenance
      );
    }

    const record: MaintenanceRecord = {
      id: generateId(),
      vehicleId,
      type: maintenance.type,
      description: maintenance.description,
      scheduledDate: maintenance.scheduledDate,
      estimatedDuration: maintenance.estimatedDuration,
      status: 'scheduled',
      createdAt: new Date()
    };

    vehicle.maintenanceHistory.push(record);

    // If maintenance is today, mark vehicle unavailable
    if (this.isToday(maintenance.scheduledDate)) {
      vehicle.status = 'maintenance';
    }

    await this.vehicleRepository.save(vehicle);
    return record;
  }
}
```

### 5. Vehicle Type Configuration

```typescript
// Standard vehicle type configurations
export const VEHICLE_TYPE_CONFIGS: VehicleTypeDefinition[] = [
  {
    id: 'vt_economy',
    code: 'economy',
    name: 'Economy',
    displayName: 'Economy',
    description: 'Affordable rides for everyday trips',
    icon: 'car-compact',
    characteristics: {
      minCapacity: 1,
      maxCapacity: 4,
      luggageCapacity: 'medium',
      maxSpeed: 120,
      range: 500,
      terrain: ['road'],
      weatherRestrictions: [],
      accessibilityFeatures: [],
      amenities: ['AC', 'USB Charger']
    },
    pricingConfig: {
      baseFare: 2.50,
      perKm: 1.20,
      perMinute: 0.20,
      minimumFare: 5.00,
      bookingFee: 1.50,
      cancellationFee: 5.00,
      waitTimeFee: 0.30,
      surgeEnabled: true,
      maxSurge: 3.0
    },
    driverRequirements: {
      minimumAge: 21,
      licenseTypes: ['standard', 'commercial'],
      minimumExperience: 1,
      backgroundCheckLevel: 'standard',
      trainingRequired: ['basic_safety']
    },
    vehicleRequirements: {
      minYear: 2015,
      maxAge: 10,
      inspectionFrequency: 365,
      insuranceMinimum: 100000,
      features: ['4_doors']
    },
    availableMarkets: ['*'],
    availableEvents: [],
    displayOrder: 1,
    featured: false,
    status: 'active'
  },

  {
    id: 'vt_golf_cart',
    code: 'golf_cart',
    name: 'Golf Cart',
    displayName: 'Golf Cart',
    description: 'Perfect for events and short distances',
    icon: 'golf-cart',
    characteristics: {
      minCapacity: 1,
      maxCapacity: 6,
      luggageCapacity: 'small',
      maxSpeed: 40,
      range: 50,
      terrain: ['road', 'path'],
      weatherRestrictions: ['heavy_rain', 'snow'],
      accessibilityFeatures: ['low_step'],
      amenities: ['Open Air']
    },
    pricingConfig: {
      baseFare: 3.00,
      perKm: 2.00,
      perMinute: 0.50,
      minimumFare: 8.00,
      bookingFee: 1.00,
      cancellationFee: 3.00,
      waitTimeFee: 0.25,
      surgeEnabled: true,
      maxSurge: 2.5
    },
    driverRequirements: {
      minimumAge: 18,
      licenseTypes: ['standard', 'golf_cart'],
      minimumExperience: 0,
      backgroundCheckLevel: 'basic',
      trainingRequired: ['golf_cart_safety', 'event_protocol']
    },
    vehicleRequirements: {
      minYear: 2018,
      maxAge: 7,
      inspectionFrequency: 180,
      insuranceMinimum: 50000,
      features: ['seat_belts', 'lights']
    },
    availableMarkets: [],
    availableEvents: ['*'],
    displayOrder: 10,
    featured: false,
    badge: 'Event',
    status: 'active'
  },

  {
    id: 'vt_luxury',
    code: 'luxury',
    name: 'Luxury',
    displayName: 'Luxury',
    description: 'Premium vehicles with professional chauffeurs',
    icon: 'car-luxury',
    characteristics: {
      minCapacity: 1,
      maxCapacity: 4,
      luggageCapacity: 'large',
      maxSpeed: 200,
      range: 600,
      terrain: ['road'],
      weatherRestrictions: [],
      accessibilityFeatures: [],
      amenities: ['AC', 'WiFi', 'Water', 'Leather Seats', 'Privacy Glass']
    },
    pricingConfig: {
      baseFare: 15.00,
      perKm: 4.50,
      perMinute: 0.80,
      minimumFare: 35.00,
      bookingFee: 5.00,
      cancellationFee: 25.00,
      waitTimeFee: 1.00,
      surgeEnabled: false,
      maxSurge: 1.5,
      hourlyRate: 75.00
    },
    driverRequirements: {
      minimumAge: 25,
      licenseTypes: ['commercial', 'chauffeur'],
      minimumExperience: 3,
      certifications: ['professional_driver', 'vip_service'],
      backgroundCheckLevel: 'enhanced',
      trainingRequired: ['luxury_service', 'vip_protocol', 'defensive_driving']
    },
    vehicleRequirements: {
      makes: ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Cadillac'],
      minYear: 2021,
      maxAge: 4,
      minRating: 4.5,
      colors: ['Black', 'White', 'Silver'],
      inspectionFrequency: 90,
      insuranceMinimum: 500000,
      features: ['leather_interior', 'premium_audio', 'climate_control']
    },
    availableMarkets: ['*'],
    availableEvents: [],
    displayOrder: 5,
    featured: true,
    badge: 'Premium',
    status: 'active'
  }
];
```

## Database Schema

```sql
-- Vehicle Types
CREATE TABLE vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  characteristics JSONB NOT NULL,
  pricing_config JSONB NOT NULL,
  driver_requirements JSONB NOT NULL,
  vehicle_requirements JSONB NOT NULL,
  available_markets TEXT[] DEFAULT '{}',
  available_events TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  badge VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet Vehicles
CREATE TABLE fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  driver_id UUID REFERENCES drivers(id),
  type VARCHAR(50) NOT NULL REFERENCES vehicle_types(code),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  vin VARCHAR(17),
  ownership VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  current_location POINT,
  last_activity_at TIMESTAMPTZ,
  last_inspection DATE,
  next_inspection_due DATE,
  mileage INTEGER DEFAULT 0,
  maintenance_history JSONB DEFAULT '[]',
  features TEXT[],
  accessories TEXT[],
  condition VARCHAR(50) DEFAULT 'good',
  insurance JSONB NOT NULL,
  total_rides INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Type Market Availability
CREATE TABLE vehicle_type_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  pricing_override JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_type_id, market_id)
);

-- Indexes
CREATE INDEX idx_fleet_type ON fleet_vehicles(type);
CREATE INDEX idx_fleet_status ON fleet_vehicles(status);
CREATE INDEX idx_fleet_driver ON fleet_vehicles(driver_id);
CREATE INDEX idx_fleet_location ON fleet_vehicles USING gist(current_location);
CREATE INDEX idx_vt_markets ON vehicle_type_markets(market_id);
```

## Related Skills
- `ride-sharing-standard` - Core ride functionality
- `dispatch-management-standard` - Dispatch operations
- `event-surge-management-standard` - Event handling
