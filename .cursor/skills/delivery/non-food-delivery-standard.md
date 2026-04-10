# Non-Food Delivery Standard

Amazon-like package and product delivery for merchants with route optimization and proof of delivery.

## Target Projects
- **Quik Delivers** - Food and non-food delivery platform
- **DreamiHaircare** - Local product delivery
- **Empress Eats** - Non-food product delivery

## Core Components

### 1. Merchant Integration

```typescript
interface Merchant {
  id: string;
  tenantId: string;

  // Business info
  businessName: string;
  businessType: MerchantType;
  description: string;

  // Location
  warehouseLocations: WarehouseLocation[];
  pickupInstructions?: string;

  // Integration
  integrationMethod: 'api' | 'webhook' | 'manual' | 'shopify' | 'woocommerce';
  apiCredentials?: {
    apiKey: string;
    webhookSecret: string;
  };
  ecommerceIntegration?: {
    platform: string;
    storeUrl: string;
    accessToken: string;
  };

  // Delivery settings
  deliverySettings: MerchantDeliverySettings;

  // Billing
  billingType: 'per_delivery' | 'subscription' | 'volume';
  rateCard: RateCard;

  // Contact
  primaryContact: ContactInfo;
  operationsContact?: ContactInfo;

  // Stats
  totalDeliveries: number;
  averageRating: number;

  status: 'pending' | 'active' | 'suspended';
  createdAt: Date;
}

type MerchantType =
  | 'retail'
  | 'ecommerce'
  | 'pharmacy'
  | 'grocery'
  | 'florist'
  | 'salon'               // DreamiHaircare
  | 'other';

interface MerchantDeliverySettings {
  sameDay: boolean;
  nextDay: boolean;
  scheduled: boolean;
  expressDelivery: boolean;
  expressTimeMinutes: number;
  deliveryRadius: number;
  serviceAreas: ServiceArea[];
  cutoffTimes: {
    sameDay: string;           // "14:00"
    nextDay: string;
  };
  packageLimits: {
    maxWeight: number;         // kg
    maxDimensions: Dimensions;
  };
  requiresSignature: boolean;
  allowContactless: boolean;
  photoProofRequired: boolean;
}

interface WarehouseLocation {
  id: string;
  name: string;
  address: Address;
  coordinates: { lat: number; lng: number };
  operatingHours: OperatingHours[];
  isDefault: boolean;
  pickupInstructions: string;
}
```

### 2. Package Management

```typescript
interface DeliveryPackage {
  id: string;
  merchantId: string;
  orderId?: string;               // Merchant's order ID
  trackingNumber: string;

  // Recipient
  recipient: {
    name: string;
    phone: string;
    email?: string;
  };

  // Addresses
  pickupLocation: WarehouseLocation;
  deliveryAddress: Address;
  deliveryInstructions?: string;

  // Package details
  packageDetails: PackageDetails;

  // Delivery type
  deliveryType: 'same_day' | 'next_day' | 'scheduled' | 'express';
  deliveryWindow?: {
    start: Date;
    end: Date;
  };
  scheduledDate?: Date;

  // Value
  declaredValue?: number;
  currency: string;
  codAmount?: number;             // Cash on delivery

  // Handling
  handlingInstructions: string[];
  fragile: boolean;
  requiresSignature: boolean;
  ageVerificationRequired: boolean;
  leaveAtDoor: boolean;

  // Insurance
  insured: boolean;
  insuranceValue?: number;

  // Pricing
  deliveryFee: number;
  insuranceFee: number;
  totalFee: number;

  // Status
  status: PackageStatus;
  statusHistory: PackageStatusChange[];

  // Assignment
  routeId?: string;
  driverId?: string;
  sequenceInRoute?: number;

  // Delivery attempt
  deliveryAttempts: DeliveryAttempt[];
  maxAttempts: number;

  // Proof of delivery
  proofOfDelivery?: ProofOfDelivery;

  createdAt: Date;
  updatedAt: Date;
}

interface PackageDetails {
  description: string;
  category: string;
  weight: number;                 // kg
  dimensions: Dimensions;
  quantity: number;
  sku?: string;
  barcode?: string;
}

type PackageStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_attempted'
  | 'returned'
  | 'cancelled';

interface DeliveryAttempt {
  id: string;
  attemptNumber: number;
  attemptedAt: Date;
  driverId: string;
  result: 'delivered' | 'failed';
  failureReason?: string;
  photo?: string;
  notes?: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface ProofOfDelivery {
  type: 'signature' | 'photo' | 'both';
  signature?: {
    imageUrl: string;
    signerName: string;
    signedAt: Date;
  };
  photos: {
    url: string;
    type: 'package' | 'location' | 'recipient';
    takenAt: Date;
  }[];
  deliveredAt: Date;
  deliveredTo: string;
  location: {
    lat: number;
    lng: number;
  };
  notes?: string;
}
```

### 3. Route Optimization

```typescript
interface DeliveryRoute {
  id: string;
  driverId: string;
  date: Date;

  // Stops
  stops: RouteStop[];
  totalStops: number;
  completedStops: number;

  // Metrics
  totalDistance: number;          // km
  estimatedDuration: number;      // minutes
  actualDuration?: number;

  // Status
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;

  // Optimization
  optimizationScore: number;
  reoptimizedCount: number;

  createdAt: Date;
}

interface RouteStop {
  id: string;
  type: 'pickup' | 'delivery';
  packageId: string;
  sequence: number;

  // Location
  location: Location;
  address: string;

  // Timing
  estimatedArrival: Date;
  actualArrival?: Date;
  timeWindow?: {
    start: Date;
    end: Date;
  };

  // Duration
  estimatedServiceTime: number;   // minutes
  actualServiceTime?: number;

  // Status
  status: 'pending' | 'arrived' | 'completed' | 'skipped' | 'failed';
  completedAt?: Date;
  failureReason?: string;

  // Navigation
  distanceFromPrevious: number;
  durationFromPrevious: number;
}

export class RouteOptimizationService {
  /**
   * Create optimized route from packages
   */
  async createOptimizedRoute(
    driverId: string,
    packages: DeliveryPackage[],
    date: Date
  ): Promise<DeliveryRoute> {
    // Group packages by pickup location
    const pickupGroups = this.groupByPickupLocation(packages);

    // Get driver start location
    const driverStart = await this.driverService.getHomeLocation(driverId);

    // Build all stops
    const stops: RouteStop[] = [];

    // Add pickup stops first
    for (const [locationId, pkgs] of pickupGroups) {
      const location = pkgs[0].pickupLocation;
      stops.push({
        id: generateId(),
        type: 'pickup',
        packageId: pkgs.map(p => p.id).join(','),
        sequence: 0,
        location: location.coordinates,
        address: location.address.formatted,
        estimatedArrival: new Date(),
        estimatedServiceTime: 5 + (pkgs.length * 2),
        status: 'pending',
        distanceFromPrevious: 0,
        durationFromPrevious: 0
      });
    }

    // Add delivery stops
    for (const pkg of packages) {
      stops.push({
        id: generateId(),
        type: 'delivery',
        packageId: pkg.id,
        sequence: 0,
        location: pkg.deliveryAddress.coordinates,
        address: pkg.deliveryAddress.formatted,
        estimatedArrival: new Date(),
        timeWindow: pkg.deliveryWindow,
        estimatedServiceTime: pkg.requiresSignature ? 5 : 3,
        status: 'pending',
        distanceFromPrevious: 0,
        durationFromPrevious: 0
      });
    }

    // Optimize route using TSP with time windows
    const optimizedStops = await this.optimizeStopOrder(
      driverStart,
      stops,
      {
        considerTimeWindows: true,
        considerTraffic: true,
        optimizeFor: 'time'         // or 'distance'
      }
    );

    // Calculate ETAs and distances
    const routeMetrics = await this.calculateRouteMetrics(driverStart, optimizedStops);

    const route: DeliveryRoute = {
      id: generateId(),
      driverId,
      date,
      stops: routeMetrics.stops,
      totalStops: optimizedStops.length,
      completedStops: 0,
      totalDistance: routeMetrics.totalDistance,
      estimatedDuration: routeMetrics.totalDuration,
      status: 'planned',
      optimizationScore: routeMetrics.score,
      reoptimizedCount: 0,
      createdAt: new Date()
    };

    await this.routeRepository.save(route);

    // Update packages with route assignment
    for (const stop of route.stops) {
      if (stop.type === 'delivery') {
        await this.packageService.assignToRoute(stop.packageId, route.id, stop.sequence);
      }
    }

    return route;
  }

  /**
   * Optimize stop order using OR-Tools or similar
   */
  private async optimizeStopOrder(
    start: Location,
    stops: RouteStop[],
    options: OptimizationOptions
  ): Promise<RouteStop[]> {
    // Build distance matrix
    const locations = [start, ...stops.map(s => s.location)];
    const distanceMatrix = await this.buildDistanceMatrix(locations);

    // Solve TSP with time windows
    const solution = await this.tspSolver.solve({
      distanceMatrix,
      timeWindows: options.considerTimeWindows
        ? stops.map(s => s.timeWindow)
        : undefined,
      serviceTime: stops.map(s => s.estimatedServiceTime)
    });

    // Reorder stops based on solution
    return solution.order.map((idx, seq) => ({
      ...stops[idx - 1],  // -1 because depot is index 0
      sequence: seq + 1
    }));
  }

  /**
   * Real-time route adjustment
   */
  async reoptimizeRoute(routeId: string): Promise<DeliveryRoute> {
    const route = await this.routeRepository.findById(routeId);

    // Get pending stops
    const pendingStops = route.stops.filter(s => s.status === 'pending');

    if (pendingStops.length < 2) {
      return route;  // No need to reoptimize
    }

    // Get current driver location
    const driverLocation = await this.driverService.getLocation(route.driverId);

    // Reoptimize remaining stops
    const reoptimizedStops = await this.optimizeStopOrder(
      driverLocation,
      pendingStops,
      { considerTimeWindows: true, considerTraffic: true, optimizeFor: 'time' }
    );

    // Update route
    route.stops = [
      ...route.stops.filter(s => s.status !== 'pending'),
      ...reoptimizedStops
    ];
    route.reoptimizedCount++;

    // Recalculate metrics
    const metrics = await this.calculateRouteMetrics(driverLocation, reoptimizedStops);
    route.estimatedDuration = metrics.totalDuration;

    await this.routeRepository.save(route);

    // Notify driver
    await this.notificationService.notifyRouteUpdate(route.driverId, route);

    return route;
  }
}
```

### 4. Delivery Execution

```typescript
export class DeliveryExecutionService {
  /**
   * Driver arrives at stop
   */
  async arriveAtStop(
    routeId: string,
    stopId: string,
    location: Location
  ): Promise<RouteStop> {
    const route = await this.routeRepository.findById(routeId);
    const stop = route.stops.find(s => s.id === stopId);

    if (!stop) throw new Error('Stop not found');

    // Verify driver is at location
    const distance = this.calculateDistance(location, stop.location);
    if (distance > 0.1) {  // 100 meters threshold
      throw new Error('Driver not at delivery location');
    }

    stop.status = 'arrived';
    stop.actualArrival = new Date();

    await this.routeRepository.save(route);

    // Notify recipient
    if (stop.type === 'delivery') {
      const pkg = await this.packageService.getPackage(stop.packageId);
      await this.notificationService.sendArrivalNotification(pkg);
    }

    return stop;
  }

  /**
   * Complete delivery with proof
   */
  async completeDelivery(
    packageId: string,
    proof: ProofOfDeliveryInput
  ): Promise<DeliveryPackage> {
    const pkg = await this.packageService.getPackage(packageId);

    // Validate proof requirements
    if (pkg.requiresSignature && !proof.signature) {
      throw new Error('Signature required');
    }

    if (pkg.ageVerificationRequired && !proof.ageVerified) {
      throw new Error('Age verification required');
    }

    // Store proof of delivery
    const proofOfDelivery: ProofOfDelivery = {
      type: proof.signature && proof.photos.length ? 'both'
        : proof.signature ? 'signature' : 'photo',
      signature: proof.signature ? {
        imageUrl: await this.uploadSignature(proof.signature),
        signerName: proof.signerName,
        signedAt: new Date()
      } : undefined,
      photos: await Promise.all(
        proof.photos.map(async p => ({
          url: await this.uploadPhoto(p.data),
          type: p.type,
          takenAt: new Date()
        }))
      ),
      deliveredAt: new Date(),
      deliveredTo: proof.deliveredTo,
      location: proof.location,
      notes: proof.notes
    };

    pkg.proofOfDelivery = proofOfDelivery;
    pkg.status = 'delivered';
    pkg.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      location: proof.location
    });

    await this.packageService.save(pkg);

    // Update route stop
    if (pkg.routeId) {
      await this.completeRouteStop(pkg.routeId, pkg.id);
    }

    // Notify merchant
    await this.notifyMerchant(pkg, 'delivered');

    // Notify recipient
    await this.notificationService.sendDeliveryConfirmation(pkg);

    return pkg;
  }

  /**
   * Record failed delivery attempt
   */
  async recordFailedAttempt(
    packageId: string,
    reason: string,
    details: FailedAttemptDetails
  ): Promise<DeliveryPackage> {
    const pkg = await this.packageService.getPackage(packageId);

    const attempt: DeliveryAttempt = {
      id: generateId(),
      attemptNumber: pkg.deliveryAttempts.length + 1,
      attemptedAt: new Date(),
      driverId: details.driverId,
      result: 'failed',
      failureReason: reason,
      photo: details.photo ? await this.uploadPhoto(details.photo) : undefined,
      notes: details.notes,
      location: details.location
    };

    pkg.deliveryAttempts.push(attempt);
    pkg.status = 'delivery_attempted';
    pkg.statusHistory.push({
      status: 'delivery_attempted',
      timestamp: new Date(),
      note: `Attempt ${attempt.attemptNumber} failed: ${reason}`
    });

    // Check if max attempts reached
    if (pkg.deliveryAttempts.length >= pkg.maxAttempts) {
      pkg.status = 'returned';
      await this.initiateReturn(pkg);
    } else {
      // Schedule reattempt
      await this.scheduleReattempt(pkg);
    }

    await this.packageService.save(pkg);

    // Notify recipient
    await this.notificationService.sendFailedDeliveryNotification(
      pkg,
      reason,
      attempt.attemptNumber < pkg.maxAttempts
    );

    // Notify merchant
    await this.notifyMerchant(pkg, 'attempt_failed', { attempt });

    return pkg;
  }
}
```

## Database Schema

```sql
-- Merchants
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  description TEXT,
  integration_method VARCHAR(50) NOT NULL,
  api_credentials JSONB,
  ecommerce_integration JSONB,
  delivery_settings JSONB NOT NULL,
  billing_type VARCHAR(50) DEFAULT 'per_delivery',
  rate_card JSONB,
  primary_contact JSONB NOT NULL,
  total_deliveries INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouse Locations
CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  name VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  coordinates POINT NOT NULL,
  operating_hours JSONB,
  is_default BOOLEAN DEFAULT false,
  pickup_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Packages
CREATE TABLE delivery_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  order_id VARCHAR(100),
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  recipient JSONB NOT NULL,
  pickup_location_id UUID REFERENCES warehouse_locations(id),
  delivery_address JSONB NOT NULL,
  delivery_instructions TEXT,
  package_details JSONB NOT NULL,
  delivery_type VARCHAR(50) NOT NULL,
  delivery_window JSONB,
  scheduled_date DATE,
  declared_value DECIMAL(10,2),
  cod_amount DECIMAL(10,2),
  handling_instructions TEXT[],
  fragile BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  age_verification_required BOOLEAN DEFAULT false,
  leave_at_door BOOLEAN DEFAULT false,
  insured BOOLEAN DEFAULT false,
  delivery_fee DECIMAL(10,2) NOT NULL,
  insurance_fee DECIMAL(10,2) DEFAULT 0,
  total_fee DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  status_history JSONB DEFAULT '[]',
  route_id UUID REFERENCES delivery_routes(id),
  driver_id UUID REFERENCES drivers(id),
  sequence_in_route INTEGER,
  delivery_attempts JSONB DEFAULT '[]',
  max_attempts INTEGER DEFAULT 3,
  proof_of_delivery JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Routes
CREATE TABLE delivery_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  date DATE NOT NULL,
  stops JSONB NOT NULL,
  total_stops INTEGER NOT NULL,
  completed_stops INTEGER DEFAULT 0,
  total_distance DECIMAL(10,2),
  estimated_duration INTEGER,
  actual_duration INTEGER,
  status VARCHAR(50) DEFAULT 'planned',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  optimization_score DECIMAL(5,2),
  reoptimized_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_packages_merchant ON delivery_packages(merchant_id);
CREATE INDEX idx_packages_tracking ON delivery_packages(tracking_number);
CREATE INDEX idx_packages_status ON delivery_packages(status);
CREATE INDEX idx_packages_route ON delivery_packages(route_id);
CREATE INDEX idx_routes_driver ON delivery_routes(driver_id);
CREATE INDEX idx_routes_date ON delivery_routes(date);
CREATE INDEX idx_routes_status ON delivery_routes(status);
```

## Related Skills
- `food-delivery-standard` - Food delivery patterns
- `delivery-driver-standard` - Driver management
- `shippo-shipping-integration` - Label generation
