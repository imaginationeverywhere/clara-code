# Delivery Driver Standard

Driver app functionality for delivery platforms with earnings, route navigation, and document verification.

## Target Projects
- **Quik Delivers** - Food and non-food delivery platform
- **Quik Carry** - Transportation platform

## Core Components

### 1. Driver Profile

```typescript
interface DeliveryDriver {
  id: string;
  userId: string;
  tenantId: string;

  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto: string;

  // Documents
  documents: DriverDocuments;
  backgroundCheck: BackgroundCheck;

  // Vehicle
  vehicleInfo: VehicleInfo;

  // Status
  status: 'pending' | 'approved' | 'active' | 'inactive' | 'suspended';
  approvalStatus: ApprovalStatus;
  onlineStatus: 'offline' | 'online' | 'busy';
  currentOrderId?: string;

  // Location
  currentLocation?: {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    updatedAt: Date;
  };
  homeZip?: string;

  // Preferences
  preferences: DriverPreferences;

  // Capabilities
  capabilities: DriverCapabilities;

  // Stats
  stats: DriverStats;

  // Banking
  payoutInfo: PayoutInfo;

  createdAt: Date;
  updatedAt: Date;
}

interface DriverDocuments {
  driversLicense: {
    number: string;
    state: string;
    expiresAt: Date;
    frontImageUrl: string;
    backImageUrl: string;
    verified: boolean;
    verifiedAt?: Date;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    expiresAt: Date;
    documentUrl: string;
    verified: boolean;
  };
  vehicleRegistration?: {
    expiresAt: Date;
    documentUrl: string;
    verified: boolean;
  };
}

interface VehicleInfo {
  type: 'car' | 'motorcycle' | 'bicycle' | 'scooter' | 'van';
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  description: string;
}

interface DriverPreferences {
  maxDeliveryDistance: number;    // km
  deliveryTypes: ('food' | 'packages' | 'groceries')[];
  workSchedule?: {
    [day: string]: { start: string; end: string } | null;
  };
  preferredAreas: string[];       // Zone IDs
  notifications: {
    newOrders: boolean;
    earnings: boolean;
    promotions: boolean;
  };
}

interface DriverCapabilities {
  canDeliverFood: boolean;
  canDeliverPackages: boolean;
  canDeliverLargeItems: boolean;
  canDeliverAlcohol: boolean;
  canDeliverPrescription: boolean;
  hasInsulatedBag: boolean;
  maxPackageWeight: number;       // kg
}

interface DriverStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  rating: number;
  ratingCount: number;
  acceptanceRate: number;
  completionRate: number;
  onTimeRate: number;
  totalEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  averageDeliveryTime: number;    // minutes
}
```

### 2. Driver Onboarding

```typescript
interface OnboardingProgress {
  driverId: string;
  steps: OnboardingStep[];
  currentStep: string;
  completedSteps: string[];
  percentComplete: number;
  canGoOnline: boolean;
}

interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
  order: number;
}

export class DriverOnboardingService {
  private readonly steps: OnboardingStep[] = [
    { id: 'profile', name: 'Personal Information', required: true, order: 1 },
    { id: 'documents', name: 'Document Upload', required: true, order: 2 },
    { id: 'vehicle', name: 'Vehicle Information', required: true, order: 3 },
    { id: 'background', name: 'Background Check', required: true, order: 4 },
    { id: 'banking', name: 'Payment Setup', required: true, order: 5 },
    { id: 'training', name: 'Safety Training', required: true, order: 6 },
    { id: 'agreement', name: 'Contractor Agreement', required: true, order: 7 }
  ];

  /**
   * Get onboarding progress
   */
  async getProgress(driverId: string): Promise<OnboardingProgress> {
    const driver = await this.driverService.getDriver(driverId);

    const completedSteps: string[] = [];

    // Check each step
    if (this.isProfileComplete(driver)) completedSteps.push('profile');
    if (this.areDocumentsUploaded(driver)) completedSteps.push('documents');
    if (this.isVehicleComplete(driver)) completedSteps.push('vehicle');
    if (driver.backgroundCheck?.status === 'passed') completedSteps.push('background');
    if (driver.payoutInfo?.verified) completedSteps.push('banking');
    if (driver.trainingCompleted) completedSteps.push('training');
    if (driver.agreementSignedAt) completedSteps.push('agreement');

    const currentStep = this.steps.find(s =>
      !completedSteps.includes(s.id)
    )?.id || 'complete';

    return {
      driverId,
      steps: this.steps.map(s => ({
        ...s,
        status: completedSteps.includes(s.id) ? 'completed'
          : s.id === currentStep ? 'in_progress' : 'pending'
      })),
      currentStep,
      completedSteps,
      percentComplete: (completedSteps.length / this.steps.length) * 100,
      canGoOnline: completedSteps.length === this.steps.length
    };
  }

  /**
   * Submit documents for verification
   */
  async submitDocuments(
    driverId: string,
    documents: DocumentSubmission
  ): Promise<void> {
    const driver = await this.driverService.getDriver(driverId);

    // Upload and store documents
    if (documents.driversLicense) {
      driver.documents.driversLicense = {
        number: documents.driversLicense.number,
        state: documents.driversLicense.state,
        expiresAt: new Date(documents.driversLicense.expiresAt),
        frontImageUrl: await this.uploadDocument(documents.driversLicense.frontImage),
        backImageUrl: await this.uploadDocument(documents.driversLicense.backImage),
        verified: false
      };
    }

    await this.driverService.save(driver);

    // Initiate verification
    await this.verificationService.verifyLicense(driverId);
  }

  /**
   * Initiate background check
   */
  async initiateBackgroundCheck(driverId: string): Promise<BackgroundCheck> {
    const driver = await this.driverService.getDriver(driverId);

    // Call background check provider (e.g., Checkr)
    const check = await this.backgroundCheckProvider.initiate({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      ssn: driver.ssn,
      dob: driver.dateOfBirth,
      address: driver.address
    });

    driver.backgroundCheck = {
      provider: 'checkr',
      checkId: check.id,
      status: 'pending',
      initiatedAt: new Date()
    };

    await this.driverService.save(driver);

    return driver.backgroundCheck;
  }
}
```

### 3. Driver Earnings

```typescript
interface DriverEarnings {
  driverId: string;
  period: {
    start: Date;
    end: Date;
  };

  // Summary
  summary: {
    totalEarnings: number;
    basePay: number;
    tips: number;
    bonuses: number;
    adjustments: number;
    totalDeliveries: number;
    totalHours: number;
    perDeliveryAverage: number;
    perHourAverage: number;
  };

  // Breakdown
  deliveries: EarningsDelivery[];
  bonuses: EarningsBonus[];
  adjustments: EarningsAdjustment[];

  // Payouts
  pendingPayout: number;
  nextPayoutDate: Date;
  payoutHistory: Payout[];
}

interface EarningsDelivery {
  id: string;
  orderId: string;
  orderType: 'food' | 'package';
  merchantName: string;
  completedAt: Date;

  // Breakdown
  basePay: number;
  distancePay: number;
  timePay: number;
  surgePay: number;
  tip: number;
  total: number;

  // Details
  distance: number;
  duration: number;
  pickupAddress: string;
  deliveryAddress: string;
}

interface EarningsBonus {
  id: string;
  type: 'quest' | 'surge' | 'referral' | 'promotion' | 'guarantee';
  name: string;
  amount: number;
  earnedAt: Date;
  details: string;
}

export class DriverEarningsService {
  /**
   * Calculate earnings for delivery
   */
  async calculateDeliveryEarnings(
    delivery: CompletedDelivery
  ): Promise<EarningsDelivery> {
    const basePay = this.config.basePayPerDelivery;
    const distancePay = delivery.distance * this.config.payPerKm;
    const timePay = delivery.duration * this.config.payPerMinute;

    // Check for surge
    const surgePay = delivery.surgeMultiplier > 1
      ? (basePay + distancePay) * (delivery.surgeMultiplier - 1)
      : 0;

    // Get tip
    const tip = delivery.tipAmount || 0;

    return {
      id: generateId(),
      orderId: delivery.orderId,
      orderType: delivery.type,
      merchantName: delivery.merchantName,
      completedAt: delivery.completedAt,
      basePay,
      distancePay,
      timePay,
      surgePay,
      tip,
      total: basePay + distancePay + timePay + surgePay + tip,
      distance: delivery.distance,
      duration: delivery.duration,
      pickupAddress: delivery.pickupAddress,
      deliveryAddress: delivery.deliveryAddress
    };
  }

  /**
   * Get earnings summary
   */
  async getEarnings(
    driverId: string,
    period: 'today' | 'week' | 'month' | 'custom',
    customRange?: { start: Date; end: Date }
  ): Promise<DriverEarnings> {
    const range = this.getDateRange(period, customRange);

    // Get all deliveries in period
    const deliveries = await this.getDeliveriesInPeriod(driverId, range);
    const bonuses = await this.getBonusesInPeriod(driverId, range);
    const adjustments = await this.getAdjustmentsInPeriod(driverId, range);

    // Calculate totals
    const basePay = deliveries.reduce((sum, d) =>
      sum + d.basePay + d.distancePay + d.timePay + d.surgePay, 0);
    const tips = deliveries.reduce((sum, d) => sum + d.tip, 0);
    const bonusTotal = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const adjustmentTotal = adjustments.reduce((sum, a) => sum + a.amount, 0);

    const totalEarnings = basePay + tips + bonusTotal + adjustmentTotal;
    const totalHours = await this.getOnlineHours(driverId, range);

    return {
      driverId,
      period: range,
      summary: {
        totalEarnings,
        basePay,
        tips,
        bonuses: bonusTotal,
        adjustments: adjustmentTotal,
        totalDeliveries: deliveries.length,
        totalHours,
        perDeliveryAverage: deliveries.length > 0 ? totalEarnings / deliveries.length : 0,
        perHourAverage: totalHours > 0 ? totalEarnings / totalHours : 0
      },
      deliveries,
      bonuses,
      adjustments,
      pendingPayout: await this.getPendingPayout(driverId),
      nextPayoutDate: this.getNextPayoutDate(),
      payoutHistory: await this.getPayoutHistory(driverId)
    };
  }

  /**
   * Process instant payout
   */
  async requestInstantPayout(
    driverId: string,
    amount: number
  ): Promise<Payout> {
    const driver = await this.driverService.getDriver(driverId);
    const pendingAmount = await this.getPendingPayout(driverId);

    if (amount > pendingAmount) {
      throw new Error('Insufficient pending earnings');
    }

    // Check for instant payout eligibility
    if (!driver.payoutInfo.instantPayoutEnabled) {
      throw new Error('Instant payout not enabled');
    }

    // Calculate fee
    const fee = amount * this.config.instantPayoutFeePercent;
    const netAmount = amount - fee;

    // Process via Stripe
    const transfer = await this.stripeService.createInstantPayout(
      driver.payoutInfo.stripeAccountId,
      Math.round(netAmount * 100)
    );

    const payout: Payout = {
      id: generateId(),
      driverId,
      type: 'instant',
      amount: netAmount,
      fee,
      stripeTransferId: transfer.id,
      status: 'processing',
      requestedAt: new Date()
    };

    await this.payoutRepository.save(payout);

    return payout;
  }
}
```

### 4. Driver App Features

```typescript
export class DriverAppService {
  /**
   * Go online
   */
  async goOnline(driverId: string): Promise<void> {
    const driver = await this.driverService.getDriver(driverId);

    // Validate driver can go online
    if (driver.status !== 'active') {
      throw new Error('Account not active');
    }

    // Check documents are valid
    if (this.hasExpiredDocuments(driver)) {
      throw new Error('Documents expired. Please update.');
    }

    driver.onlineStatus = 'online';
    await this.driverService.save(driver);

    // Add to available drivers pool
    await this.availabilityService.addDriver(driverId, driver.currentLocation);

    // Start location tracking
    await this.trackingService.startTracking(driverId);
  }

  /**
   * Go offline
   */
  async goOffline(driverId: string): Promise<void> {
    const driver = await this.driverService.getDriver(driverId);

    // Check if driver has active order
    if (driver.currentOrderId) {
      throw new Error('Cannot go offline with active order');
    }

    driver.onlineStatus = 'offline';
    await this.driverService.save(driver);

    // Remove from available pool
    await this.availabilityService.removeDriver(driverId);

    // Stop location tracking
    await this.trackingService.stopTracking(driverId);
  }

  /**
   * Accept order
   */
  async acceptOrder(driverId: string, orderId: string): Promise<void> {
    const driver = await this.driverService.getDriver(driverId);
    const order = await this.orderService.getOrder(orderId);

    // Validate offer is still valid
    if (order.status !== 'ready_for_pickup') {
      throw new Error('Order no longer available');
    }

    // Assign driver
    order.driverId = driverId;
    order.driverAssignedAt = new Date();
    order.status = 'driver_assigned';

    driver.onlineStatus = 'busy';
    driver.currentOrderId = orderId;

    await Promise.all([
      this.orderService.save(order),
      this.driverService.save(driver)
    ]);

    // Send navigation to pickup
    await this.navigationService.startNavigation(driverId, order.pickupLocation);

    // Notify restaurant and customer
    await this.notificationService.sendDriverAssigned(order);
  }

  /**
   * Decline order
   */
  async declineOrder(
    driverId: string,
    orderId: string,
    reason: string
  ): Promise<void> {
    // Record decline
    await this.orderService.recordDecline(orderId, driverId, reason);

    // Update acceptance rate
    await this.updateAcceptanceRate(driverId);

    // Offer to next driver
    await this.matchingService.findNextDriver(orderId);
  }

  /**
   * Mark arrived at pickup
   */
  async arrivedAtPickup(driverId: string, orderId: string): Promise<void> {
    const order = await this.orderService.getOrder(orderId);

    // Verify location
    const driverLocation = await this.driverService.getLocation(driverId);
    const distance = this.calculateDistance(driverLocation, order.pickupLocation);

    if (distance > 0.1) {  // 100m threshold
      throw new Error('Not at pickup location');
    }

    order.status = 'driver_arrived_pickup';
    order.statusHistory.push({
      status: 'driver_arrived_pickup',
      timestamp: new Date()
    });

    await this.orderService.save(order);

    // Notify restaurant
    await this.notificationService.sendDriverArrivedPickup(order);
  }

  /**
   * Confirm pickup
   */
  async confirmPickup(driverId: string, orderId: string): Promise<void> {
    const order = await this.orderService.getOrder(orderId);

    order.status = 'picked_up';
    order.actualPickupTime = new Date();
    order.statusHistory.push({
      status: 'picked_up',
      timestamp: new Date()
    });

    await this.orderService.save(order);

    // Start navigation to delivery
    await this.navigationService.startNavigation(driverId, order.deliveryAddress);

    // Notify customer
    await this.notificationService.sendPickedUp(order);

    // Update order status to on_the_way
    order.status = 'on_the_way';
    await this.orderService.save(order);
  }

  /**
   * Report issue
   */
  async reportIssue(
    driverId: string,
    orderId: string,
    issue: IssueReport
  ): Promise<SupportTicket> {
    const ticket = await this.supportService.createTicket({
      type: 'driver_issue',
      driverId,
      orderId,
      category: issue.category,
      description: issue.description,
      photos: issue.photos,
      priority: this.determinePriority(issue)
    });

    // If critical, escalate immediately
    if (ticket.priority === 'critical') {
      await this.supportService.escalate(ticket.id);
    }

    return ticket;
  }
}
```

### 5. Navigation Integration

```typescript
export class DriverNavigationService {
  /**
   * Get route to destination
   */
  async getRoute(
    driverId: string,
    destination: Location,
    options?: { avoidTolls?: boolean; avoidHighways?: boolean }
  ): Promise<NavigationRoute> {
    const driverLocation = await this.driverService.getLocation(driverId);

    const route = await this.routingService.getRoute(
      driverLocation,
      destination,
      {
        mode: 'driving',
        avoidTolls: options?.avoidTolls,
        avoidHighways: options?.avoidHighways,
        trafficModel: 'best_guess'
      }
    );

    return {
      polyline: route.polyline,
      distance: route.distanceMeters,
      duration: route.durationSeconds,
      steps: route.steps.map(s => ({
        instruction: s.htmlInstructions,
        distance: s.distance,
        duration: s.duration,
        maneuver: s.maneuver,
        location: s.startLocation
      })),
      trafficDelays: route.trafficDelaySeconds,
      eta: new Date(Date.now() + route.durationSeconds * 1000)
    };
  }

  /**
   * Start turn-by-turn navigation
   */
  async startNavigation(
    driverId: string,
    destination: Location
  ): Promise<void> {
    const route = await this.getRoute(driverId, destination);

    // Store active navigation
    await this.redis.set(
      `driver:${driverId}:navigation`,
      JSON.stringify({
        destination,
        route,
        startedAt: new Date(),
        currentStepIndex: 0
      }),
      'EX',
      3600 // 1 hour expiry
    );

    // Send to driver app
    await this.websocketService.sendToDriver(driverId, {
      type: 'navigation_started',
      route
    });
  }

  /**
   * Update navigation progress
   */
  async updateProgress(
    driverId: string,
    location: Location
  ): Promise<NavigationUpdate> {
    const navigation = JSON.parse(
      await this.redis.get(`driver:${driverId}:navigation`) || '{}'
    );

    if (!navigation.route) {
      return { active: false };
    }

    // Check if approaching next step
    const currentStep = navigation.route.steps[navigation.currentStepIndex];
    const distanceToStep = this.calculateDistance(location, currentStep.location);

    let update: NavigationUpdate = {
      active: true,
      currentStep: currentStep,
      distanceToNextStep: distanceToStep,
      eta: navigation.route.eta
    };

    // If within 50m of step, advance to next
    if (distanceToStep < 0.05 && navigation.currentStepIndex < navigation.route.steps.length - 1) {
      navigation.currentStepIndex++;
      await this.redis.set(
        `driver:${driverId}:navigation`,
        JSON.stringify(navigation),
        'EX',
        3600
      );

      update.currentStep = navigation.route.steps[navigation.currentStepIndex];
      update.upcomingStep = navigation.route.steps[navigation.currentStepIndex + 1];
    }

    // Check if arrived
    const distanceToDestination = this.calculateDistance(location, navigation.destination);
    if (distanceToDestination < 0.05) {
      update.arrived = true;
      await this.redis.del(`driver:${driverId}:navigation`);
    }

    return update;
  }
}
```

## Database Schema

```sql
-- Delivery Drivers
CREATE TABLE delivery_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  profile_photo VARCHAR(500),
  documents JSONB NOT NULL DEFAULT '{}',
  background_check JSONB,
  vehicle_info JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  online_status VARCHAR(50) DEFAULT 'offline',
  current_location POINT,
  location_heading DECIMAL(5,2),
  location_updated_at TIMESTAMPTZ,
  current_order_id UUID,
  preferences JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  payout_info JSONB,
  training_completed BOOLEAN DEFAULT false,
  agreement_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Earnings
CREATE TABLE driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES delivery_drivers(id),
  type VARCHAR(50) NOT NULL,  -- delivery, bonus, adjustment
  order_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  details JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Payouts
CREATE TABLE driver_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES delivery_drivers(id),
  type VARCHAR(50) NOT NULL,  -- scheduled, instant
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  stripe_transfer_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Driver Sessions (online/offline tracking)
CREATE TABLE driver_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES delivery_drivers(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  deliveries_completed INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0
);

-- Indexes
CREATE INDEX idx_drivers_status ON delivery_drivers(status, online_status);
CREATE INDEX idx_drivers_location ON delivery_drivers USING gist(current_location);
CREATE INDEX idx_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX idx_earnings_period ON driver_earnings(period_start, period_end);
CREATE INDEX idx_payouts_driver ON driver_payouts(driver_id);
CREATE INDEX idx_sessions_driver ON driver_sessions(driver_id);
```

## Related Skills
- `food-delivery-standard` - Food delivery patterns
- `non-food-delivery-standard` - Package delivery
- `ride-sharing-standard` - Shared driver patterns
