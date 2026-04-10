# Ride Sharing Standard

Core ride-sharing functionality for Uber/Lyft-like transportation platforms.

## Target Projects
- **Quik Carry** - Transportation and delivery platform ecosystem

## Core Components

### 1. Ride Request

```typescript
interface RideRequest {
  id: string;
  tenantId: string;
  riderId: string;

  // Locations
  pickup: Location;
  dropoff: Location;
  waypoints?: Location[];

  // Ride type
  vehicleType: VehicleType;
  rideType: 'standard' | 'shared' | 'scheduled' | 'hourly';

  // Scheduling
  isScheduled: boolean;
  scheduledTime?: Date;

  // Passengers
  passengerCount: number;
  specialRequests?: string[];

  // Pricing
  estimatedFare: FareEstimate;
  surgeMultiplier: number;

  // Status tracking
  status: RideRequestStatus;
  statusHistory: StatusChange[];

  // Matching
  matchedDriverId?: string;
  matchAttempts: number;
  declinedDrivers: string[];

  // Timing
  requestedAt: Date;
  acceptedAt?: Date;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Payment
  paymentMethodId: string;
  promoCode?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;           // Google/Mapbox place ID
  name?: string;              // "Home", "Work", venue name
  instructions?: string;      // "Meet at side entrance"
}

type VehicleType =
  | 'economy'
  | 'comfort'
  | 'premium'
  | 'suv'
  | 'xl'
  | 'golf_cart'
  | 'luxury'
  | 'wheelchair_accessible';

type RideRequestStatus =
  | 'pending'
  | 'matching'
  | 'accepted'
  | 'driver_en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_drivers';
```

### 2. Driver Management

```typescript
interface Driver {
  id: string;
  userId: string;
  tenantId: string;

  // Profile
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profilePhoto: string;

  // Documents
  driversLicense: DriverDocument;
  insurance: DriverDocument;
  vehicleRegistration: DriverDocument;
  backgroundCheck: BackgroundCheck;

  // Vehicle
  vehicles: Vehicle[];
  activeVehicleId?: string;

  // Status
  status: 'pending' | 'approved' | 'active' | 'inactive' | 'suspended';
  onlineStatus: 'offline' | 'online' | 'busy';

  // Location (when online)
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    updatedAt: Date;
  };

  // Stats
  rating: number;
  totalRides: number;
  acceptanceRate: number;
  cancellationRate: number;

  // Preferences
  preferences: DriverPreferences;

  // Earnings
  weeklyEarnings: number;
  lifetimeEarnings: number;

  createdAt: Date;
  updatedAt: Date;
}

interface Vehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  type: VehicleType;
  capacity: number;
  features: string[];         // "Child seat", "Wheelchair ramp"
  photos: string[];
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  inspectionDate?: Date;
}

interface DriverPreferences {
  vehicleTypes: VehicleType[];
  serviceAreas: string[];     // Zone IDs
  maxDistance: number;        // km from current location
  acceptSharedRides: boolean;
  acceptScheduledRides: boolean;
}
```

### 3. Fare Calculation

```typescript
interface FareEstimate {
  vehicleType: VehicleType;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeAmount: number;
  tolls: number;
  fees: {
    bookingFee: number;
    serviceFee: number;
    airportFee?: number;
  };
  discount: number;
  totalFare: number;
  currency: string;

  // Breakdown
  distanceKm: number;
  estimatedDurationMinutes: number;
  surgeMultiplier: number;

  // Range (for upfront pricing)
  minFare: number;
  maxFare: number;
}

export class FareCalculationService {
  private readonly baseFares: Map<VehicleType, BaseFare>;
  private readonly ratePerKm: Map<VehicleType, number>;
  private readonly ratePerMinute: Map<VehicleType, number>;

  /**
   * Calculate fare estimate
   */
  async calculateFare(
    pickup: Location,
    dropoff: Location,
    vehicleType: VehicleType,
    waypoints?: Location[]
  ): Promise<FareEstimate> {
    // Get route details
    const route = await this.routingService.getRoute(pickup, dropoff, waypoints);

    const baseFare = this.baseFares.get(vehicleType)!;
    const distanceKm = route.distanceMeters / 1000;
    const durationMinutes = route.durationSeconds / 60;

    // Calculate components
    const distanceFare = distanceKm * this.ratePerKm.get(vehicleType)!;
    const timeFare = durationMinutes * this.ratePerMinute.get(vehicleType)!;

    // Get surge multiplier
    const surgeMultiplier = await this.surgeService.getSurgeMultiplier(
      pickup,
      vehicleType
    );

    // Calculate tolls
    const tolls = await this.tollService.calculateTolls(route);

    // Calculate fees
    const bookingFee = 2.00;
    const serviceFee = (baseFare.base + distanceFare + timeFare) * 0.15;
    const airportFee = this.isAirportPickup(pickup) ? 5.00 : 0;

    // Calculate subtotal
    const subtotal = baseFare.base + distanceFare + timeFare;
    const surgeAmount = subtotal * (surgeMultiplier - 1);
    const total = subtotal + surgeAmount + tolls + bookingFee + serviceFee + airportFee;

    // Apply minimum fare
    const minimumFare = baseFare.minimum;
    const finalTotal = Math.max(total, minimumFare);

    return {
      vehicleType,
      baseFare: baseFare.base,
      distanceFare,
      timeFare,
      surgeAmount,
      tolls,
      fees: { bookingFee, serviceFee, airportFee },
      discount: 0,
      totalFare: finalTotal,
      currency: 'USD',
      distanceKm,
      estimatedDurationMinutes: durationMinutes,
      surgeMultiplier,
      minFare: finalTotal * 0.9,
      maxFare: finalTotal * 1.2
    };
  }

  /**
   * Calculate final fare after ride completion
   */
  async calculateFinalFare(ride: CompletedRide): Promise<FinalFare> {
    const actualDistanceKm = ride.actualRoute.distanceMeters / 1000;
    const actualDurationMinutes = ride.actualRoute.durationSeconds / 60;

    // Recalculate with actual values
    const baseFare = this.baseFares.get(ride.vehicleType)!;
    const distanceFare = actualDistanceKm * this.ratePerKm.get(ride.vehicleType)!;
    const timeFare = actualDurationMinutes * this.ratePerMinute.get(ride.vehicleType)!;

    // Use locked surge from request time
    const surgeMultiplier = ride.request.surgeMultiplier;
    const subtotal = baseFare.base + distanceFare + timeFare;
    const surgeAmount = subtotal * (surgeMultiplier - 1);

    // Tolls from actual route
    const tolls = await this.tollService.calculateTolls(ride.actualRoute);

    // Same fees
    const fees = ride.request.estimatedFare.fees;

    const total = subtotal + surgeAmount + tolls +
                  fees.bookingFee + fees.serviceFee + (fees.airportFee || 0);

    // Apply promo discount
    const discount = ride.request.promoCode
      ? await this.promoService.calculateDiscount(ride.request.promoCode, total)
      : 0;

    return {
      ...ride.request.estimatedFare,
      distanceFare,
      timeFare,
      surgeAmount,
      tolls,
      discount,
      totalFare: Math.max(total - discount, baseFare.minimum),
      actualDistanceKm,
      actualDurationMinutes
    };
  }
}
```

### 4. Driver Matching

```typescript
export class DriverMatchingService {
  private readonly maxMatchingRadius = 10; // km
  private readonly matchingTimeout = 15000; // 15 seconds per driver

  /**
   * Find and match driver for ride request
   */
  async matchDriver(request: RideRequest): Promise<Driver | null> {
    const maxAttempts = 10;
    let attempt = 0;

    while (attempt < maxAttempts) {
      // Find available drivers
      const availableDrivers = await this.findAvailableDrivers(
        request.pickup,
        request.vehicleType,
        request.declinedDrivers
      );

      if (availableDrivers.length === 0) {
        // No drivers available
        await this.updateRequestStatus(request.id, 'no_drivers');
        return null;
      }

      // Score and rank drivers
      const rankedDrivers = this.rankDrivers(availableDrivers, request);

      for (const driver of rankedDrivers) {
        // Send match offer to driver
        const accepted = await this.sendMatchOffer(driver.id, request);

        if (accepted) {
          // Update request with matched driver
          await this.updateRequestWithDriver(request.id, driver.id);
          return driver;
        } else {
          // Track declined
          request.declinedDrivers.push(driver.id);
          request.matchAttempts++;
        }
      }

      attempt++;
      await this.delay(1000); // Wait before retry
    }

    await this.updateRequestStatus(request.id, 'no_drivers');
    return null;
  }

  /**
   * Find available drivers within radius
   */
  private async findAvailableDrivers(
    pickup: Location,
    vehicleType: VehicleType,
    excludeDrivers: string[]
  ): Promise<Driver[]> {
    // Query drivers from Redis geo index
    const nearbyDrivers = await this.redis.georadius(
      'driver:locations',
      pickup.longitude,
      pickup.latitude,
      this.maxMatchingRadius,
      'km',
      'WITHDIST',
      'ASC'
    );

    const driverIds = nearbyDrivers
      .map((d: any) => d[0])
      .filter((id: string) => !excludeDrivers.includes(id));

    // Get driver details and filter
    const drivers = await this.driverRepository.findByIds(driverIds);

    return drivers.filter(d =>
      d.onlineStatus === 'online' &&
      d.status === 'active' &&
      this.driverCanAcceptRide(d, vehicleType)
    );
  }

  /**
   * Rank drivers by score
   */
  private rankDrivers(drivers: Driver[], request: RideRequest): Driver[] {
    return drivers
      .map(driver => ({
        driver,
        score: this.calculateDriverScore(driver, request)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.driver);
  }

  /**
   * Calculate driver score for matching
   */
  private calculateDriverScore(driver: Driver, request: RideRequest): number {
    let score = 0;

    // Distance (closer is better)
    const distance = this.calculateDistance(
      driver.currentLocation!,
      request.pickup
    );
    score += (this.maxMatchingRadius - distance) * 10;

    // Rating
    score += driver.rating * 20;

    // Acceptance rate
    score += driver.acceptanceRate * 10;

    // Activity bonus (drivers who've been waiting longer)
    // Implementation would track last ride time

    return score;
  }

  /**
   * Send match offer to driver via WebSocket
   */
  private async sendMatchOffer(
    driverId: string,
    request: RideRequest
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const offerId = generateId();

      // Send offer via WebSocket
      await this.websocketService.sendToDriver(driverId, {
        type: 'ride_offer',
        offerId,
        request: {
          id: request.id,
          pickup: request.pickup,
          dropoff: request.dropoff,
          estimatedFare: request.estimatedFare,
          passengerCount: request.passengerCount,
          scheduledTime: request.scheduledTime
        },
        expiresAt: Date.now() + this.matchingTimeout
      });

      // Wait for response
      const timeout = setTimeout(() => {
        this.pendingOffers.delete(offerId);
        resolve(false);
      }, this.matchingTimeout);

      // Store pending offer
      this.pendingOffers.set(offerId, {
        resolve: (accepted: boolean) => {
          clearTimeout(timeout);
          resolve(accepted);
        }
      });
    });
  }
}
```

### 5. Real-Time Tracking

```typescript
export class RealTimeTrackingService {
  /**
   * Update driver location
   */
  async updateDriverLocation(
    driverId: string,
    location: {
      latitude: number;
      longitude: number;
      heading: number;
      speed: number;
    }
  ): Promise<void> {
    // Update Redis geo index
    await this.redis.geoadd(
      'driver:locations',
      location.longitude,
      location.latitude,
      driverId
    );

    // Store detailed location
    await this.redis.hset(`driver:${driverId}:location`, {
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      heading: location.heading.toString(),
      speed: location.speed.toString(),
      updatedAt: Date.now().toString()
    });

    // If driver has active ride, broadcast to rider
    const activeRide = await this.getActiveRide(driverId);
    if (activeRide) {
      await this.broadcastLocationToRider(activeRide.riderId, {
        driverId,
        ...location,
        eta: await this.calculateETA(location, activeRide)
      });
    }
  }

  /**
   * Get driver location for rider
   */
  async getDriverLocation(rideId: string): Promise<DriverLocation | null> {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride?.matchedDriverId) return null;

    const location = await this.redis.hgetall(`driver:${ride.matchedDriverId}:location`);
    if (!location) return null;

    const driver = await this.driverRepository.findById(ride.matchedDriverId);

    return {
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      heading: parseFloat(location.heading),
      driver: {
        name: `${driver.firstName} ${driver.lastName.charAt(0)}.`,
        photo: driver.profilePhoto,
        rating: driver.rating,
        vehicle: driver.vehicles.find(v => v.id === driver.activeVehicleId)
      },
      eta: await this.calculateETA(
        { latitude: parseFloat(location.latitude), longitude: parseFloat(location.longitude) },
        ride
      )
    };
  }

  /**
   * Calculate ETA using routing service
   */
  private async calculateETA(
    currentLocation: { latitude: number; longitude: number },
    ride: RideRequest
  ): Promise<ETAInfo> {
    const destination = ride.status === 'driver_en_route' || ride.status === 'accepted'
      ? ride.pickup
      : ride.dropoff;

    const route = await this.routingService.getRoute(
      currentLocation,
      destination,
      { trafficModel: 'best_guess' }
    );

    return {
      minutes: Math.ceil(route.durationSeconds / 60),
      arrivalTime: new Date(Date.now() + route.durationSeconds * 1000)
    };
  }
}
```

## Database Schema

```sql
-- Ride Requests
CREATE TABLE ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  rider_id UUID NOT NULL REFERENCES users(id),
  pickup JSONB NOT NULL,
  dropoff JSONB NOT NULL,
  waypoints JSONB,
  vehicle_type VARCHAR(50) NOT NULL,
  ride_type VARCHAR(50) DEFAULT 'standard',
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMPTZ,
  passenger_count INTEGER DEFAULT 1,
  special_requests TEXT[],
  estimated_fare JSONB NOT NULL,
  surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
  status VARCHAR(50) DEFAULT 'pending',
  matched_driver_id UUID REFERENCES drivers(id),
  match_attempts INTEGER DEFAULT 0,
  declined_drivers UUID[] DEFAULT '{}',
  payment_method_id VARCHAR(100),
  promo_code VARCHAR(50),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  profile_photo VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  online_status VARCHAR(50) DEFAULT 'offline',
  current_location POINT,
  location_heading DECIMAL(5,2),
  location_updated_at TIMESTAMPTZ,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_rides INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,4) DEFAULT 1.0000,
  cancellation_rate DECIMAL(5,4) DEFAULT 0.0000,
  preferences JSONB DEFAULT '{}',
  weekly_earnings DECIMAL(10,2) DEFAULT 0,
  lifetime_earnings DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  vin VARCHAR(17),
  type VARCHAR(50) NOT NULL,
  capacity INTEGER DEFAULT 4,
  features TEXT[],
  photos TEXT[],
  status VARCHAR(50) DEFAULT 'pending',
  inspection_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completed Rides
CREATE TABLE completed_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES ride_requests(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  rider_id UUID NOT NULL REFERENCES users(id),
  actual_route JSONB NOT NULL,
  final_fare JSONB NOT NULL,
  payment_id VARCHAR(100),
  tip_amount DECIMAL(10,2) DEFAULT 0,
  driver_rating INTEGER,
  rider_rating INTEGER,
  driver_feedback TEXT,
  rider_feedback TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_requests_rider ON ride_requests(rider_id);
CREATE INDEX idx_requests_status ON ride_requests(status);
CREATE INDEX idx_requests_scheduled ON ride_requests(scheduled_time) WHERE is_scheduled = true;
CREATE INDEX idx_drivers_location ON drivers USING gist(current_location);
CREATE INDEX idx_drivers_online ON drivers(online_status) WHERE online_status = 'online';
CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
```

## API Endpoints

```typescript
// Rider endpoints
router.post('/rides/estimate', estimateFare);
router.post('/rides/request', requestRide);
router.get('/rides/:id', getRide);
router.get('/rides/:id/track', trackRide);
router.post('/rides/:id/cancel', cancelRide);
router.post('/rides/:id/rate', rateRide);

// Driver endpoints
router.post('/driver/go-online', goOnline);
router.post('/driver/go-offline', goOffline);
router.post('/driver/location', updateLocation);
router.post('/driver/offers/:offerId/accept', acceptOffer);
router.post('/driver/offers/:offerId/decline', declineOffer);
router.post('/driver/rides/:id/arrive', arriveAtPickup);
router.post('/driver/rides/:id/start', startRide);
router.post('/driver/rides/:id/complete', completeRide);
```

## Related Skills
- `dispatch-management-standard` - Fleet dispatch
- `enterprise-transportation-b2b-standard` - B2B partnerships
- `event-surge-management-standard` - Surge pricing
- `multi-modal-vehicle-standard` - Vehicle types
