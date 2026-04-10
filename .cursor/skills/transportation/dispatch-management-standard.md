# Dispatch Management Standard

Fleet dispatch and coordination system for transportation platforms.

## Target Projects
- **Quik Carry** - Transportation and delivery platform ecosystem

## Core Components

### 1. Dispatch Center

```typescript
interface DispatchCenter {
  id: string;
  tenantId: string;
  name: string;
  region: string;
  timezone: string;

  // Coverage
  serviceAreas: ServiceZone[];
  operatingHours: OperatingHours[];

  // Fleet
  totalDrivers: number;
  onlineDrivers: number;
  busyDrivers: number;
  availableDrivers: number;

  // Real-time metrics
  metrics: DispatchMetrics;

  // Alerts
  activeAlerts: DispatchAlert[];

  status: 'operational' | 'limited' | 'offline';
}

interface ServiceZone {
  id: string;
  name: string;
  type: 'primary' | 'extended' | 'surge';
  polygon: GeoPolygon;
  priority: number;
  vehicleTypes: VehicleType[];
  baseMultiplier: number;
}

interface DispatchMetrics {
  timestamp: Date;
  requestsPerHour: number;
  averageWaitTime: number;        // seconds
  averageETA: number;             // seconds
  matchRate: number;              // percentage
  cancellationRate: number;
  surgeActive: boolean;
  surgeMultiplier: number;
  supplyDemandRatio: number;
}

interface DispatchAlert {
  id: string;
  type: 'low_supply' | 'high_demand' | 'incident' | 'weather' | 'event';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  zone?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}
```

### 2. Dispatch Queue

```typescript
interface DispatchQueue {
  id: string;
  zoneId: string;
  vehicleType: VehicleType;

  // Queue
  pendingRequests: QueuedRequest[];
  assignedRequests: QueuedRequest[];

  // Stats
  averageWaitTime: number;
  oldestRequest: Date;
  queueDepth: number;

  // Priority handling
  priorityMode: 'fifo' | 'priority' | 'optimized';
}

interface QueuedRequest {
  requestId: string;
  riderId: string;
  pickup: Location;
  dropoff: Location;
  vehicleType: VehicleType;
  priority: number;
  queuedAt: Date;
  estimatedMatchTime?: Date;
  assignedDriverId?: string;
  status: 'queued' | 'matching' | 'assigned' | 'expired';
}

export class DispatchQueueService {
  /**
   * Add request to dispatch queue
   */
  async enqueue(request: RideRequest): Promise<QueuedRequest> {
    const zone = await this.determineZone(request.pickup);
    const queueKey = this.getQueueKey(zone.id, request.vehicleType);

    const queuedRequest: QueuedRequest = {
      requestId: request.id,
      riderId: request.riderId,
      pickup: request.pickup,
      dropoff: request.dropoff,
      vehicleType: request.vehicleType,
      priority: this.calculatePriority(request),
      queuedAt: new Date(),
      status: 'queued'
    };

    // Add to priority queue (Redis sorted set)
    await this.redis.zadd(
      queueKey,
      queuedRequest.priority,
      JSON.stringify(queuedRequest)
    );

    // Trigger dispatch attempt
    await this.triggerDispatch(zone.id, request.vehicleType);

    return queuedRequest;
  }

  /**
   * Calculate request priority
   */
  private calculatePriority(request: RideRequest): number {
    let priority = Date.now(); // Base: timestamp (FIFO)

    // Scheduled rides get higher priority as pickup time approaches
    if (request.isScheduled && request.scheduledTime) {
      const minutesUntil = (request.scheduledTime.getTime() - Date.now()) / 60000;
      if (minutesUntil < 30) {
        priority -= 1000000; // High priority
      }
    }

    // Premium vehicle types
    if (['premium', 'luxury'].includes(request.vehicleType)) {
      priority -= 500000;
    }

    // Repeat customers (loyalty bonus)
    if (request.riderTotalRides > 100) {
      priority -= 100000;
    }

    return priority;
  }

  /**
   * Process dispatch queue
   */
  async processQueue(zoneId: string, vehicleType: VehicleType): Promise<void> {
    const queueKey = this.getQueueKey(zoneId, vehicleType);

    while (true) {
      // Get highest priority request
      const items = await this.redis.zrange(queueKey, 0, 0);
      if (items.length === 0) break;

      const request = JSON.parse(items[0]) as QueuedRequest;

      // Check if request is still valid
      const rideRequest = await this.rideService.getRequest(request.requestId);
      if (!rideRequest || rideRequest.status !== 'pending') {
        await this.redis.zrem(queueKey, items[0]);
        continue;
      }

      // Find available driver
      const driver = await this.findBestDriver(request, zoneId);

      if (driver) {
        // Remove from queue
        await this.redis.zrem(queueKey, items[0]);

        // Assign to driver
        await this.assignToDriver(request, driver);
      } else {
        // No drivers available, keep in queue
        break;
      }
    }
  }
}
```

### 3. Driver Assignment Algorithm

```typescript
export class DriverAssignmentService {
  /**
   * Find best driver for request
   */
  async findBestDriver(
    request: QueuedRequest,
    zoneId: string
  ): Promise<Driver | null> {
    // Get available drivers in zone
    const availableDrivers = await this.getAvailableDriversInZone(
      zoneId,
      request.vehicleType
    );

    if (availableDrivers.length === 0) return null;

    // Calculate scores for each driver
    const scoredDrivers = await Promise.all(
      availableDrivers.map(async driver => ({
        driver,
        score: await this.calculateAssignmentScore(driver, request)
      }))
    );

    // Sort by score (highest first)
    scoredDrivers.sort((a, b) => b.score - a.score);

    // Return best match
    return scoredDrivers[0]?.driver || null;
  }

  /**
   * Calculate assignment score
   */
  private async calculateAssignmentScore(
    driver: Driver,
    request: QueuedRequest
  ): Promise<number> {
    let score = 0;
    const weights = {
      distance: 0.35,
      eta: 0.25,
      rating: 0.15,
      acceptance: 0.10,
      idleTime: 0.10,
      heading: 0.05
    };

    // 1. Distance score (closer = better)
    const distance = this.calculateDistance(
      driver.currentLocation!,
      request.pickup
    );
    const maxDistance = 10; // km
    score += weights.distance * (1 - Math.min(distance / maxDistance, 1)) * 100;

    // 2. ETA score (faster = better)
    const eta = await this.calculateETA(driver.currentLocation!, request.pickup);
    const maxETA = 15; // minutes
    score += weights.eta * (1 - Math.min(eta / maxETA, 1)) * 100;

    // 3. Rating score
    score += weights.rating * (driver.rating / 5) * 100;

    // 4. Acceptance rate score
    score += weights.acceptance * driver.acceptanceRate * 100;

    // 5. Idle time score (longer idle = higher priority)
    const idleMinutes = await this.getDriverIdleTime(driver.id);
    const maxIdleMinutes = 30;
    score += weights.idleTime * Math.min(idleMinutes / maxIdleMinutes, 1) * 100;

    // 6. Heading score (driver heading towards pickup = better)
    if (driver.currentLocation?.heading) {
      const headingToPickup = this.calculateBearing(
        driver.currentLocation,
        request.pickup
      );
      const headingDiff = Math.abs(driver.currentLocation.heading - headingToPickup);
      const normalizedHeading = headingDiff > 180 ? 360 - headingDiff : headingDiff;
      score += weights.heading * (1 - normalizedHeading / 180) * 100;
    }

    return score;
  }

  /**
   * Batch assignment for high-demand periods
   */
  async batchAssign(
    requests: QueuedRequest[],
    drivers: Driver[]
  ): Promise<Assignment[]> {
    // Build cost matrix
    const costMatrix: number[][] = [];

    for (const request of requests) {
      const row: number[] = [];
      for (const driver of drivers) {
        if (this.canDriverAccept(driver, request)) {
          const score = await this.calculateAssignmentScore(driver, request);
          row.push(100 - score); // Convert to cost (lower = better)
        } else {
          row.push(Infinity);
        }
      }
      costMatrix.push(row);
    }

    // Solve using Hungarian algorithm for optimal assignment
    const assignments = this.hungarianAlgorithm(costMatrix);

    // Create assignment records
    return assignments
      .filter(a => a.cost !== Infinity)
      .map(a => ({
        requestId: requests[a.requestIndex].requestId,
        driverId: drivers[a.driverIndex].id,
        score: 100 - a.cost
      }));
  }
}
```

### 4. Dispatch Dashboard

```typescript
interface DispatchDashboard {
  // Real-time overview
  overview: {
    totalActiveRides: number;
    pendingRequests: number;
    onlineDrivers: number;
    availableDrivers: number;
    averageWaitTime: number;
    matchRate: number;
  };

  // Zone breakdown
  zones: ZoneStatus[];

  // Heat map data
  demandHeatmap: HeatmapPoint[];
  supplyHeatmap: HeatmapPoint[];

  // Recent activity
  recentRequests: RecentRequest[];
  recentCompletions: RecentCompletion[];

  // Alerts
  activeAlerts: DispatchAlert[];

  // Performance
  hourlyMetrics: HourlyMetric[];
}

interface ZoneStatus {
  zoneId: string;
  zoneName: string;
  demandLevel: 'low' | 'normal' | 'high' | 'surge';
  supplyLevel: 'shortage' | 'low' | 'adequate' | 'surplus';
  activeRides: number;
  pendingRequests: number;
  availableDrivers: number;
  averageETA: number;
  surgeMultiplier: number;
}

export class DispatchDashboardService {
  /**
   * Get real-time dashboard data
   */
  async getDashboard(dispatchCenterId: string): Promise<DispatchDashboard> {
    const center = await this.getDispatchCenter(dispatchCenterId);

    const [
      overview,
      zones,
      demandHeatmap,
      supplyHeatmap,
      recentRequests,
      recentCompletions,
      hourlyMetrics
    ] = await Promise.all([
      this.getOverview(center),
      this.getZoneStatuses(center.serviceAreas),
      this.getDemandHeatmap(center.serviceAreas),
      this.getSupplyHeatmap(center.serviceAreas),
      this.getRecentRequests(dispatchCenterId, 20),
      this.getRecentCompletions(dispatchCenterId, 20),
      this.getHourlyMetrics(dispatchCenterId, 24)
    ]);

    return {
      overview,
      zones,
      demandHeatmap,
      supplyHeatmap,
      recentRequests,
      recentCompletions,
      activeAlerts: center.activeAlerts,
      hourlyMetrics
    };
  }

  /**
   * Get demand heatmap
   */
  private async getDemandHeatmap(zones: ServiceZone[]): Promise<HeatmapPoint[]> {
    const points: HeatmapPoint[] = [];

    // Get recent requests by location
    const recentRequests = await this.rideService.getRecentRequests(
      zones.map(z => z.id),
      30 // last 30 minutes
    );

    // Aggregate by grid cell
    const gridSize = 0.01; // ~1km grid
    const grid = new Map<string, number>();

    for (const request of recentRequests) {
      const cellKey = this.getGridCell(request.pickup, gridSize);
      grid.set(cellKey, (grid.get(cellKey) || 0) + 1);
    }

    // Convert to heatmap points
    for (const [cellKey, count] of grid) {
      const [lat, lng] = cellKey.split(',').map(Number);
      points.push({
        latitude: lat,
        longitude: lng,
        weight: count
      });
    }

    return points;
  }

  /**
   * Stream dashboard updates via WebSocket
   */
  async streamDashboard(
    dispatchCenterId: string,
    ws: WebSocket
  ): Promise<void> {
    const interval = setInterval(async () => {
      const dashboard = await this.getDashboard(dispatchCenterId);
      ws.send(JSON.stringify({
        type: 'dashboard_update',
        data: dashboard,
        timestamp: new Date()
      }));
    }, 5000); // Update every 5 seconds

    ws.on('close', () => clearInterval(interval));
  }
}
```

### 5. Manual Dispatch

```typescript
export class ManualDispatchService {
  /**
   * Manually assign driver to request
   */
  async manualAssign(
    requestId: string,
    driverId: string,
    dispatcherId: string,
    reason: string
  ): Promise<void> {
    const request = await this.rideService.getRequest(requestId);
    const driver = await this.driverService.getDriver(driverId);

    // Validate
    if (!this.canDriverAccept(driver, request)) {
      throw new Error('Driver cannot accept this request');
    }

    // Override automatic matching
    await this.rideService.assignDriver(requestId, driverId);

    // Log manual assignment
    await this.auditService.log({
      type: 'manual_dispatch',
      requestId,
      driverId,
      dispatcherId,
      reason,
      timestamp: new Date()
    });

    // Notify driver
    await this.notificationService.notifyDriverAssignment(driverId, request);
  }

  /**
   * Reassign ride to different driver
   */
  async reassign(
    rideId: string,
    newDriverId: string,
    dispatcherId: string,
    reason: string
  ): Promise<void> {
    const ride = await this.rideService.getRide(rideId);
    const oldDriverId = ride.matchedDriverId;

    // Release current driver
    if (oldDriverId) {
      await this.driverService.releaseDriver(oldDriverId);
      await this.notificationService.notifyDriverReleased(oldDriverId, reason);
    }

    // Assign new driver
    await this.rideService.assignDriver(ride.id, newDriverId);

    // Log reassignment
    await this.auditService.log({
      type: 'ride_reassignment',
      rideId,
      oldDriverId,
      newDriverId,
      dispatcherId,
      reason,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast request to multiple drivers
   */
  async broadcast(
    requestId: string,
    driverIds: string[],
    dispatcherId: string
  ): Promise<void> {
    const request = await this.rideService.getRequest(requestId);

    // Send to all drivers simultaneously
    await Promise.all(
      driverIds.map(driverId =>
        this.notificationService.sendRideOffer(driverId, request)
      )
    );

    // First to accept wins
    // (handled by offer acceptance logic)

    await this.auditService.log({
      type: 'broadcast_dispatch',
      requestId,
      driverIds,
      dispatcherId,
      timestamp: new Date()
    });
  }
}
```

## Database Schema

```sql
-- Dispatch Centers
CREATE TABLE dispatch_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  operating_hours JSONB,
  status VARCHAR(50) DEFAULT 'operational',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Zones
CREATE TABLE service_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_center_id UUID NOT NULL REFERENCES dispatch_centers(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  polygon GEOMETRY(Polygon, 4326) NOT NULL,
  priority INTEGER DEFAULT 1,
  vehicle_types TEXT[],
  base_multiplier DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatch Audit Log
CREATE TABLE dispatch_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_center_id UUID REFERENCES dispatch_centers(id),
  type VARCHAR(50) NOT NULL,
  request_id UUID,
  ride_id UUID,
  driver_id UUID,
  dispatcher_id UUID,
  old_driver_id UUID,
  new_driver_id UUID,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatch Metrics (time-series)
CREATE TABLE dispatch_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_center_id UUID NOT NULL REFERENCES dispatch_centers(id),
  zone_id UUID REFERENCES service_zones(id),
  timestamp TIMESTAMPTZ NOT NULL,
  requests_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  cancellations_count INTEGER DEFAULT 0,
  average_wait_time INTEGER,
  average_eta INTEGER,
  match_rate DECIMAL(5,4),
  surge_multiplier DECIMAL(3,2),
  online_drivers INTEGER,
  available_drivers INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_zones_polygon ON service_zones USING gist(polygon);
CREATE INDEX idx_metrics_timestamp ON dispatch_metrics(timestamp DESC);
CREATE INDEX idx_metrics_center ON dispatch_metrics(dispatch_center_id, timestamp);
CREATE INDEX idx_audit_timestamp ON dispatch_audit_log(created_at DESC);
```

## Related Skills
- `ride-sharing-standard` - Core ride functionality
- `enterprise-transportation-b2b-standard` - B2B partnerships
- `event-surge-management-standard` - Event handling
