# Event Surge Management Standard

Managing high-demand events (World Cup, concerts, festivals) with surge pricing and temporary vehicle registration.

## Target Projects
- **Quik Carry** - Transportation and delivery platform ecosystem

## Core Components

### 1. Event Zone Configuration

```typescript
interface EventZone {
  id: string;
  tenantId: string;
  eventId?: string;               // If linked to specific event

  // Event details
  name: string;                   // "World Cup Stadium", "Coachella Festival"
  eventType: EventType;
  startDate: Date;
  endDate: Date;

  // Geographic bounds
  primaryZone: GeoPolygon;        // Main event area
  bufferZone: GeoPolygon;         // Extended service area
  stagingAreas: StagingArea[];    // Driver waiting areas
  pickupPoints: DesignatedPoint[];
  dropoffPoints: DesignatedPoint[];

  // Capacity planning
  expectedAttendance: number;
  peakHours: PeakHour[];
  transportationDemandForecast: DemandForecast[];

  // Vehicle allowances
  allowedVehicleTypes: VehicleType[];
  temporaryVehicles: TemporaryVehicleConfig;

  // Pricing
  surgePricing: EventSurgePricing;
  fixedRoutes?: FixedRoute[];

  // Operations
  operationsContact: ContactInfo;
  dispatchStrategy: 'standard' | 'staging' | 'queue' | 'dedicated';

  status: 'draft' | 'upcoming' | 'active' | 'completed';
  createdAt: Date;
}

type EventType =
  | 'concert'
  | 'festival'
  | 'sports_game'
  | 'conference'
  | 'marathon'
  | 'parade'
  | 'fireworks'
  | 'holiday'
  | 'other';

interface StagingArea {
  id: string;
  name: string;
  location: Location;
  capacity: number;               // Max drivers
  vehicleTypes: VehicleType[];
  currentOccupancy: number;
  queueOrder: string[];           // Driver IDs in order
}

interface DesignatedPoint {
  id: string;
  name: string;                   // "Gate A", "North Entrance"
  location: Location;
  type: 'pickup' | 'dropoff' | 'both';
  capacity: number;               // Vehicles at once
  instructions: string;
  accessibleRoute?: boolean;
}

interface PeakHour {
  dayOffset: number;              // 0 = event start day
  startHour: number;              // 0-23
  endHour: number;
  demandMultiplier: number;
  direction: 'inbound' | 'outbound' | 'both';
}
```

### 2. Event Surge Pricing

```typescript
interface EventSurgePricing {
  baseMultiplier: number;         // Minimum multiplier during event
  maxMultiplier: number;          // Cap on surge

  // Dynamic rules
  demandRules: DemandSurgeRule[];
  timeRules: TimeSurgeRule[];
  inventoryRules: InventorySurgeRule[];

  // Fixed pricing options
  fixedPricingEnabled: boolean;
  fixedRoutes: FixedPriceRoute[];

  // Notifications
  surgeNotificationThreshold: number;
  priceCapNotification: boolean;
}

interface DemandSurgeRule {
  id: string;
  condition: {
    metric: 'requests_per_minute' | 'queue_depth' | 'wait_time';
    operator: 'gt' | 'gte' | 'lt' | 'lte';
    value: number;
  };
  multiplierAdjustment: number;
  maxMultiplier?: number;
}

interface TimeSurgeRule {
  id: string;
  description: string;            // "Post-game exit surge"
  triggerType: 'relative' | 'absolute';
  relativeTo?: 'event_start' | 'event_end';
  offsetMinutes?: number;
  absoluteTime?: string;          // "HH:mm"
  durationMinutes: number;
  multiplier: number;
}

interface FixedPriceRoute {
  id: string;
  name: string;                   // "Stadium to Downtown"
  origin: GeoPolygon | Location;
  destination: GeoPolygon | Location;
  vehicleType: VehicleType;
  fixedPrice: number;
  validDuring: 'all' | 'peak_only' | 'off_peak_only';
}

export class EventSurgePricingService {
  /**
   * Calculate surge for event zone
   */
  async calculateEventSurge(
    eventZoneId: string,
    pickup: Location
  ): Promise<SurgeInfo> {
    const eventZone = await this.getEventZone(eventZoneId);

    if (!this.isWithinEventZone(pickup, eventZone)) {
      return { multiplier: 1.0, reason: null };
    }

    let multiplier = eventZone.surgePricing.baseMultiplier;
    const appliedRules: string[] = [];

    // Apply time-based rules
    for (const rule of eventZone.surgePricing.timeRules) {
      if (this.isTimeRuleActive(rule, eventZone)) {
        multiplier = Math.max(multiplier, rule.multiplier);
        appliedRules.push(rule.description);
      }
    }

    // Apply demand-based rules
    const currentMetrics = await this.getZoneMetrics(eventZoneId);
    for (const rule of eventZone.surgePricing.demandRules) {
      if (this.evaluateDemandRule(rule, currentMetrics)) {
        multiplier += rule.multiplierAdjustment;
        appliedRules.push(`High ${rule.condition.metric}`);
      }
    }

    // Apply inventory rules
    const supplyMetrics = await this.getSupplyMetrics(eventZoneId);
    for (const rule of eventZone.surgePricing.inventoryRules) {
      if (this.evaluateInventoryRule(rule, supplyMetrics)) {
        multiplier += rule.multiplierAdjustment;
        appliedRules.push('Low driver availability');
      }
    }

    // Apply cap
    multiplier = Math.min(multiplier, eventZone.surgePricing.maxMultiplier);

    return {
      multiplier,
      reason: appliedRules.length > 0 ? appliedRules.join(', ') : null,
      eventZone: eventZone.name,
      expiresAt: this.calculateSurgeExpiry(eventZone)
    };
  }

  /**
   * Check for fixed price route
   */
  async getFixedPriceRoute(
    eventZoneId: string,
    pickup: Location,
    dropoff: Location,
    vehicleType: VehicleType
  ): Promise<FixedPriceRoute | null> {
    const eventZone = await this.getEventZone(eventZoneId);

    if (!eventZone.surgePricing.fixedPricingEnabled) return null;

    for (const route of eventZone.surgePricing.fixedRoutes) {
      if (
        route.vehicleType === vehicleType &&
        this.matchesOrigin(pickup, route.origin) &&
        this.matchesDestination(dropoff, route.destination) &&
        this.isValidDuring(route, eventZone)
      ) {
        return route;
      }
    }

    return null;
  }
}
```

### 3. Temporary Vehicle Registration

```typescript
interface TemporaryVehicleConfig {
  enabled: boolean;
  allowedTypes: TemporaryVehicleType[];
  registrationPeriod: {
    start: Date;
    end: Date;
  };
  requirements: TemporaryVehicleRequirements;
  maxRegistrations: number;
  currentRegistrations: number;
}

type TemporaryVehicleType = 'golf_cart' | 'pedicab' | 'shuttle' | 'van';

interface TemporaryVehicleRequirements {
  insuranceRequired: boolean;
  minimumInsurance: number;
  backgroundCheckRequired: boolean;
  vehicleInspectionRequired: boolean;
  trainingRequired: boolean;
  trainingMaterials?: string;
}

interface TemporaryVehicleRegistration {
  id: string;
  eventZoneId: string;
  driverId: string;

  // Vehicle
  vehicleType: TemporaryVehicleType;
  vehicleDescription: string;
  vehicleCapacity: number;
  licensePlate?: string;
  vehiclePhotos: string[];

  // Documents
  insurance: {
    provider: string;
    policyNumber: string;
    coverage: number;
    expiresAt: Date;
    documentUrl: string;
  };
  backgroundCheck?: {
    provider: string;
    status: 'pending' | 'passed' | 'failed';
    completedAt?: Date;
  };
  vehicleInspection?: {
    inspectedBy: string;
    inspectedAt: Date;
    passed: boolean;
    notes?: string;
  };
  trainingCompleted?: {
    completedAt: Date;
    score?: number;
  };

  // Status
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'expired';
  validFrom: Date;
  validUntil: Date;

  // Activity
  totalRides: number;
  totalEarnings: number;

  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export class TemporaryVehicleService {
  /**
   * Register temporary vehicle for event
   */
  async registerTemporaryVehicle(
    eventZoneId: string,
    driverId: string,
    registration: TemporaryVehicleRegistration
  ): Promise<TemporaryVehicleRegistration> {
    const eventZone = await this.getEventZone(eventZoneId);

    // Validate config
    if (!eventZone.temporaryVehicles.enabled) {
      throw new Error('Temporary vehicles not enabled for this event');
    }

    if (!eventZone.temporaryVehicles.allowedTypes.includes(registration.vehicleType)) {
      throw new Error('Vehicle type not allowed for this event');
    }

    // Check capacity
    if (eventZone.temporaryVehicles.currentRegistrations >=
        eventZone.temporaryVehicles.maxRegistrations) {
      throw new Error('Maximum registrations reached');
    }

    // Validate requirements
    const requirements = eventZone.temporaryVehicles.requirements;

    if (requirements.insuranceRequired && !registration.insurance) {
      throw new Error('Insurance documentation required');
    }

    if (requirements.backgroundCheckRequired) {
      const bgCheck = await this.backgroundCheckService.getStatus(driverId);
      if (bgCheck.status !== 'passed') {
        throw new Error('Background check required');
      }
      registration.backgroundCheck = bgCheck;
    }

    // Set validity period
    registration.validFrom = eventZone.temporaryVehicles.registrationPeriod.start;
    registration.validUntil = eventZone.temporaryVehicles.registrationPeriod.end;
    registration.status = 'pending';

    await this.registrationRepository.save(registration);

    // Update zone count
    await this.updateRegistrationCount(eventZoneId, 1);

    return registration;
  }

  /**
   * Activate temporary vehicle
   */
  async activateTemporaryVehicle(
    registrationId: string,
    inspectorId: string,
    inspectionResult: VehicleInspection
  ): Promise<TemporaryVehicleRegistration> {
    const registration = await this.getRegistration(registrationId);

    if (registration.status !== 'pending') {
      throw new Error('Registration not in pending status');
    }

    // Record inspection
    registration.vehicleInspection = {
      inspectedBy: inspectorId,
      inspectedAt: new Date(),
      passed: inspectionResult.passed,
      notes: inspectionResult.notes
    };

    if (!inspectionResult.passed) {
      registration.status = 'suspended';
      await this.registrationRepository.save(registration);
      throw new Error(`Inspection failed: ${inspectionResult.notes}`);
    }

    // Activate
    registration.status = 'approved';
    registration.approvedAt = new Date();
    registration.approvedBy = inspectorId;

    await this.registrationRepository.save(registration);

    // Create temporary driver profile
    await this.driverService.createTemporaryProfile(registration);

    return registration;
  }
}
```

### 4. Queue Management

```typescript
interface EventQueue {
  id: string;
  eventZoneId: string;
  stagingAreaId: string;

  // Queue
  drivers: QueuedDriver[];
  maxSize: number;
  currentSize: number;

  // Rules
  priorityRules: QueuePriorityRule[];
  rotationPolicy: 'fifo' | 'rating' | 'hybrid';

  // Stats
  averageWaitTime: number;
  averageRidesPerDriver: number;

  status: 'active' | 'paused' | 'closed';
}

interface QueuedDriver {
  driverId: string;
  vehicleType: VehicleType;
  position: number;
  queuedAt: Date;
  estimatedWait: number;          // minutes
  ridesCompleted: number;         // During this event
  lastRideAt?: Date;
  priority: number;
}

interface QueuePriorityRule {
  type: 'temporary_vehicle' | 'high_rating' | 'veteran' | 'rotation';
  boost: number;                  // Priority boost
}

export class EventQueueService {
  /**
   * Add driver to staging queue
   */
  async joinQueue(
    eventZoneId: string,
    stagingAreaId: string,
    driverId: string
  ): Promise<QueuedDriver> {
    const queue = await this.getQueue(eventZoneId, stagingAreaId);

    if (queue.currentSize >= queue.maxSize) {
      throw new Error('Queue is full');
    }

    // Check if already in queue
    const existing = queue.drivers.find(d => d.driverId === driverId);
    if (existing) {
      throw new Error('Already in queue');
    }

    // Calculate priority
    const driver = await this.driverService.getDriver(driverId);
    const priority = await this.calculatePriority(driver, queue);

    const queuedDriver: QueuedDriver = {
      driverId,
      vehicleType: driver.activeVehicle.type,
      position: queue.currentSize + 1,
      queuedAt: new Date(),
      estimatedWait: await this.estimateWait(queue),
      ridesCompleted: await this.getEventRideCount(driverId, eventZoneId),
      priority
    };

    queue.drivers.push(queuedDriver);
    queue.currentSize++;

    // Re-sort by priority
    this.sortQueue(queue);

    await this.queueRepository.save(queue);

    // Notify driver of position
    await this.notifyQueuePosition(driverId, queuedDriver.position);

    return queuedDriver;
  }

  /**
   * Get next driver from queue
   */
  async getNextDriver(
    eventZoneId: string,
    vehicleType: VehicleType
  ): Promise<QueuedDriver | null> {
    const queues = await this.getActiveQueues(eventZoneId);

    for (const queue of queues) {
      const nextDriver = queue.drivers.find(d =>
        d.vehicleType === vehicleType
      );

      if (nextDriver) {
        // Remove from queue
        queue.drivers = queue.drivers.filter(d => d.driverId !== nextDriver.driverId);
        queue.currentSize--;

        // Update positions
        queue.drivers.forEach((d, i) => d.position = i + 1);

        await this.queueRepository.save(queue);

        return nextDriver;
      }
    }

    return null;
  }

  /**
   * Handle post-ride queue rotation
   */
  async handleRideCompletion(
    eventZoneId: string,
    driverId: string
  ): Promise<void> {
    const eventZone = await this.getEventZone(eventZoneId);

    // If within event zone, offer to rejoin queue
    const driverLocation = await this.driverService.getLocation(driverId);

    if (this.isWithinEventZone(driverLocation, eventZone)) {
      // Find nearest staging area
      const nearestStaging = await this.findNearestStagingArea(
        eventZone,
        driverLocation
      );

      if (nearestStaging && nearestStaging.currentOccupancy < nearestStaging.capacity) {
        await this.notificationService.offerQueueRejoin(driverId, nearestStaging);
      }
    }
  }
}
```

### 5. Event Operations Dashboard

```typescript
interface EventOperationsDashboard {
  eventZone: EventZone;

  // Real-time metrics
  realTimeMetrics: {
    activeRides: number;
    pendingRequests: number;
    driversOnline: number;
    driversInQueue: number;
    averageWaitTime: number;
    surgeMultiplier: number;
  };

  // Staging areas
  stagingAreas: StagingAreaStatus[];

  // Demand forecast
  demandForecast: {
    current: number;
    nextHour: number;
    peak: { time: Date; expected: number };
  };

  // Supply status
  supplyStatus: {
    adequate: boolean;
    shortage: number;           // How many more drivers needed
    byVehicleType: { type: VehicleType; count: number; needed: number }[];
  };

  // Alerts
  alerts: EventAlert[];

  // Performance
  performanceMetrics: {
    completedRides: number;
    cancelledRides: number;
    averageRating: number;
    averageFare: number;
    totalRevenue: number;
  };
}

export class EventOperationsService {
  /**
   * Get operations dashboard
   */
  async getDashboard(eventZoneId: string): Promise<EventOperationsDashboard> {
    const eventZone = await this.getEventZone(eventZoneId);

    const [
      realTimeMetrics,
      stagingAreas,
      demandForecast,
      supplyStatus,
      performanceMetrics
    ] = await Promise.all([
      this.getRealTimeMetrics(eventZoneId),
      this.getStagingAreaStatuses(eventZone.stagingAreas),
      this.getDemandForecast(eventZone),
      this.getSupplyStatus(eventZone),
      this.getPerformanceMetrics(eventZoneId)
    ]);

    // Generate alerts
    const alerts = await this.generateAlerts(eventZone, {
      realTimeMetrics,
      supplyStatus,
      demandForecast
    });

    return {
      eventZone,
      realTimeMetrics,
      stagingAreas,
      demandForecast,
      supplyStatus,
      alerts,
      performanceMetrics
    };
  }

  /**
   * Generate operational alerts
   */
  private async generateAlerts(
    eventZone: EventZone,
    data: any
  ): Promise<EventAlert[]> {
    const alerts: EventAlert[] = [];

    // High wait time alert
    if (data.realTimeMetrics.averageWaitTime > 15) {
      alerts.push({
        id: generateId(),
        type: 'high_wait_time',
        severity: data.realTimeMetrics.averageWaitTime > 25 ? 'critical' : 'warning',
        message: `Average wait time is ${data.realTimeMetrics.averageWaitTime} minutes`,
        recommendedAction: 'Consider increasing surge to attract more drivers',
        createdAt: new Date()
      });
    }

    // Driver shortage
    if (data.supplyStatus.shortage > 0) {
      alerts.push({
        id: generateId(),
        type: 'driver_shortage',
        severity: data.supplyStatus.shortage > 20 ? 'critical' : 'warning',
        message: `${data.supplyStatus.shortage} more drivers needed`,
        recommendedAction: 'Send driver notifications or enable temporary vehicles',
        createdAt: new Date()
      });
    }

    // Peak approaching
    const minutesToPeak = (data.demandForecast.peak.time.getTime() - Date.now()) / 60000;
    if (minutesToPeak > 0 && minutesToPeak < 60) {
      alerts.push({
        id: generateId(),
        type: 'peak_approaching',
        severity: 'info',
        message: `Peak demand expected in ${Math.round(minutesToPeak)} minutes`,
        recommendedAction: 'Ensure staging areas are adequately staffed',
        createdAt: new Date()
      });
    }

    return alerts;
  }
}
```

## Database Schema

```sql
-- Event Zones
CREATE TABLE event_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_id UUID,
  name VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  primary_zone GEOMETRY(Polygon, 4326) NOT NULL,
  buffer_zone GEOMETRY(Polygon, 4326),
  expected_attendance INTEGER,
  peak_hours JSONB DEFAULT '[]',
  allowed_vehicle_types TEXT[],
  temporary_vehicles JSONB DEFAULT '{}',
  surge_pricing JSONB NOT NULL,
  fixed_routes JSONB DEFAULT '[]',
  operations_contact JSONB,
  dispatch_strategy VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staging Areas
CREATE TABLE staging_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_zone_id UUID NOT NULL REFERENCES event_zones(id),
  name VARCHAR(255) NOT NULL,
  location POINT NOT NULL,
  capacity INTEGER NOT NULL,
  vehicle_types TEXT[],
  current_occupancy INTEGER DEFAULT 0,
  queue_order UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designated Points
CREATE TABLE designated_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_zone_id UUID NOT NULL REFERENCES event_zones(id),
  name VARCHAR(255) NOT NULL,
  location POINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INTEGER,
  instructions TEXT,
  accessible_route BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Temporary Vehicle Registrations
CREATE TABLE temporary_vehicle_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_zone_id UUID NOT NULL REFERENCES event_zones(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_description TEXT,
  vehicle_capacity INTEGER,
  license_plate VARCHAR(20),
  vehicle_photos TEXT[],
  insurance JSONB NOT NULL,
  background_check JSONB,
  vehicle_inspection JSONB,
  training_completed JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  total_rides INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID
);

-- Event Queues
CREATE TABLE event_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_zone_id UUID NOT NULL REFERENCES event_zones(id),
  staging_area_id UUID NOT NULL REFERENCES staging_areas(id),
  drivers JSONB DEFAULT '[]',
  max_size INTEGER DEFAULT 50,
  current_size INTEGER DEFAULT 0,
  priority_rules JSONB DEFAULT '[]',
  rotation_policy VARCHAR(50) DEFAULT 'fifo',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_zones_dates ON event_zones(start_date, end_date);
CREATE INDEX idx_event_zones_polygon ON event_zones USING gist(primary_zone);
CREATE INDEX idx_staging_location ON staging_areas USING gist(location);
CREATE INDEX idx_temp_registrations_event ON temporary_vehicle_registrations(event_zone_id);
CREATE INDEX idx_temp_registrations_driver ON temporary_vehicle_registrations(driver_id);
```

## Related Skills
- `ride-sharing-standard` - Core ride functionality
- `dispatch-management-standard` - Dispatch operations
- `multi-modal-vehicle-standard` - Vehicle types
