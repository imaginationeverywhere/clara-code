# Barbershop Queue Standard

## Overview
Walk-in queue management system for barbershops supporting real-time wait time estimation, digital check-in, position tracking, and customer notifications. Enables hybrid model combining appointments and walk-ins.

## Domain Context
- **Primary Projects**: Quik Barbershop, DreamiHairCare
- **Related Domains**: Events (crowd management), Transportation (queue patterns)
- **Key Integration**: SMS (Twilio), Real-time (WebSocket), Display Systems

## Core Interfaces

### Queue Entry
```typescript
interface QueueEntry {
  id: string;
  shopId: string;
  customerId?: string; // Optional for walk-ins
  customerName: string;
  customerPhone: string;
  preferredBarberId?: string;
  requestedServices: QueuedService[];
  estimatedDuration: number;
  position: number;
  status: QueueStatus;
  priority: QueuePriority;
  estimatedWaitTime: number; // minutes
  estimatedServiceTime?: Date;
  checkedInAt: Date;
  calledAt?: Date;
  serviceStartedAt?: Date;
  completedAt?: Date;
  leftQueueAt?: Date;
  leftReason?: LeaveReason;
  notificationsSent: NotificationRecord[];
  source: 'walk_in' | 'kiosk' | 'app' | 'converted_appointment';
  createdAt: Date;
}

type QueueStatus =
  | 'waiting'      // In queue
  | 'called'       // Called to chair
  | 'in_service'   // Currently being served
  | 'completed'    // Service completed
  | 'left'         // Left queue before service
  | 'no_show';     // Didn't respond when called

type QueuePriority =
  | 'normal'       // Regular walk-in
  | 'returning'    // Returning customer
  | 'vip'          // VIP customer
  | 'priority';    // Paid priority

type LeaveReason =
  | 'wait_too_long'
  | 'changed_mind'
  | 'emergency'
  | 'rescheduled'
  | 'other';

interface QueuedService {
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
}

interface NotificationRecord {
  type: 'position_update' | 'almost_ready' | 'your_turn' | 'reminder';
  sentAt: Date;
  channel: 'sms' | 'push' | 'display';
  content: string;
}
```

### Queue State & Management
```typescript
interface QueueState {
  shopId: string;
  isOpen: boolean;
  currentQueue: QueueEntry[];
  averageWaitTime: number;
  averageServiceTime: number;
  totalWaiting: number;
  totalInService: number;
  barbersAvailable: BarberQueueStatus[];
  estimatedCloseTime?: Date;
  queueCapacity: number;
  queueAtCapacity: boolean;
  lastUpdated: Date;
}

interface BarberQueueStatus {
  barberId: string;
  barberName: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentCustomer?: {
    entryId: string;
    customerName: string;
    startedAt: Date;
    estimatedEndAt: Date;
  };
  queueCount: number;
  nextAvailableAt?: Date;
}

interface QueueSettings {
  shopId: string;
  enabled: boolean;
  maxQueueSize: number;
  maxWaitTime: number; // minutes - stop accepting after this
  allowBarberPreference: boolean;
  allowPriorityPurchase: boolean;
  priorityPrice: number;
  notifyAtPosition: number[]; // e.g., [3, 1]
  almostReadyThreshold: number; // minutes
  noShowTimeout: number; // minutes to wait after calling
  autoCloseTime?: string; // HH:mm - stop accepting walk-ins
  displayBoardEnabled: boolean;
  estimationAccuracy: 'conservative' | 'optimistic' | 'accurate';
}

interface WaitTimeEstimate {
  barberId?: string;
  barberName?: string;
  estimatedWait: number; // minutes
  position: number;
  confidence: 'high' | 'medium' | 'low';
  basedOn: 'historical' | 'current' | 'mixed';
}
```

### Display Board
```typescript
interface DisplayBoardData {
  shopId: string;
  shopName: string;
  currentTime: Date;
  queue: DisplayQueueEntry[];
  barbers: DisplayBarberInfo[];
  announcements: Announcement[];
  averageWaitTime: number;
  queueOpen: boolean;
}

interface DisplayQueueEntry {
  position: number;
  displayName: string; // First name or ticket number
  status: QueueStatus;
  barberName?: string;
  waitTime?: number;
}

interface DisplayBarberInfo {
  name: string;
  status: 'available' | 'busy' | 'break';
  currentCustomerInitials?: string;
  estimatedAvailable?: string; // "~15 min"
}

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'promo';
  expiresAt?: Date;
}
```

## Service Implementation

### Queue Management Service
```typescript
import { EventEmitter } from 'events';

export class QueueManagementService extends EventEmitter {

  // Add customer to queue
  async addToQueue(
    shopId: string,
    customerName: string,
    customerPhone: string,
    serviceIds: string[],
    preferredBarberId?: string,
    customerId?: string,
    priority: QueuePriority = 'normal'
  ): Promise<QueueEntry> {
    const settings = await this.getQueueSettings(shopId);
    const state = await this.getQueueState(shopId);

    // Validate queue is open
    if (!state.isOpen) {
      throw new Error('Queue is currently closed');
    }

    // Check capacity
    if (state.queueAtCapacity) {
      throw new Error('Queue is at capacity');
    }

    // Check max wait time
    if (state.averageWaitTime > settings.maxWaitTime) {
      throw new Error('Wait time exceeds maximum allowed');
    }

    // Get services
    const services = await this.getServices(serviceIds);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

    // Calculate position and wait time
    const position = await this.calculatePosition(shopId, preferredBarberId, priority);
    const estimate = await this.estimateWaitTime(shopId, position, preferredBarberId);

    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      shopId,
      customerId,
      customerName,
      customerPhone,
      preferredBarberId,
      requestedServices: services.map(s => ({
        serviceId: s.id,
        serviceName: s.name,
        duration: s.duration,
        price: s.price,
      })),
      estimatedDuration: totalDuration,
      position,
      status: 'waiting',
      priority,
      estimatedWaitTime: estimate.estimatedWait,
      estimatedServiceTime: new Date(Date.now() + estimate.estimatedWait * 60 * 1000),
      checkedInAt: new Date(),
      notificationsSent: [],
      source: 'walk_in',
      createdAt: new Date(),
    };

    await this.saveQueueEntry(entry);

    // Send confirmation
    await this.sendQueueConfirmation(entry);

    // Emit event for real-time updates
    this.emit('queue:entry_added', { shopId, entry });

    // Recalculate positions for other entries
    await this.recalculatePositions(shopId);

    return entry;
  }

  // Get current queue state
  async getQueueState(shopId: string): Promise<QueueState> {
    const settings = await this.getQueueSettings(shopId);
    const entries = await this.getActiveQueueEntries(shopId);
    const barberStatuses = await this.getBarberStatuses(shopId);

    const waiting = entries.filter(e => e.status === 'waiting');
    const inService = entries.filter(e => e.status === 'in_service');

    // Calculate average times from recent history
    const avgWait = await this.calculateAverageWaitTime(shopId);
    const avgService = await this.calculateAverageServiceTime(shopId);

    return {
      shopId,
      isOpen: settings.enabled && this.isWithinOperatingHours(shopId),
      currentQueue: entries,
      averageWaitTime: avgWait,
      averageServiceTime: avgService,
      totalWaiting: waiting.length,
      totalInService: inService.length,
      barbersAvailable: barberStatuses,
      queueCapacity: settings.maxQueueSize,
      queueAtCapacity: waiting.length >= settings.maxQueueSize,
      lastUpdated: new Date(),
    };
  }

  // Estimate wait time for new customer
  async estimateWaitTime(
    shopId: string,
    position: number,
    preferredBarberId?: string
  ): Promise<WaitTimeEstimate> {
    const settings = await this.getQueueSettings(shopId);
    const barberStatuses = await this.getBarberStatuses(shopId);

    // If barber preference specified
    if (preferredBarberId) {
      const barber = barberStatuses.find(b => b.barberId === preferredBarberId);
      if (!barber) {
        throw new Error('Barber not found');
      }

      const barberQueue = await this.getBarberQueueEntries(preferredBarberId);
      const waitTime = await this.calculateBarberWaitTime(barber, barberQueue);

      return {
        barberId: preferredBarberId,
        barberName: barber.barberName,
        estimatedWait: this.adjustEstimate(waitTime, settings.estimationAccuracy),
        position: barberQueue.length + 1,
        confidence: barberQueue.length < 3 ? 'high' : 'medium',
        basedOn: 'current',
      };
    }

    // General queue - estimate based on next available
    const availableBarbers = barberStatuses.filter(
      b => b.status === 'available' || b.status === 'busy'
    );

    if (availableBarbers.length === 0) {
      throw new Error('No barbers available');
    }

    // Find earliest available
    const waitTimes = await Promise.all(
      availableBarbers.map(async barber => {
        const barberQueue = await this.getBarberQueueEntries(barber.barberId);
        return this.calculateBarberWaitTime(barber, barberQueue);
      })
    );

    const minWait = Math.min(...waitTimes);

    return {
      estimatedWait: this.adjustEstimate(minWait, settings.estimationAccuracy),
      position,
      confidence: position < 5 ? 'high' : 'low',
      basedOn: 'current',
    };
  }

  // Call next customer
  async callNextCustomer(
    shopId: string,
    barberId: string
  ): Promise<QueueEntry | null> {
    // Get barber's queue or general queue
    const entries = await this.getCallableEntries(shopId, barberId);

    if (entries.length === 0) {
      return null;
    }

    // Get highest priority entry
    const entry = entries.sort((a, b) => {
      // Priority first
      const priorityOrder = { vip: 0, priority: 1, returning: 2, normal: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by position
      return a.position - b.position;
    })[0];

    entry.status = 'called';
    entry.calledAt = new Date();

    await this.saveQueueEntry(entry);

    // Send notification
    await this.sendCalledNotification(entry, barberId);

    // Set no-show timer
    const settings = await this.getQueueSettings(shopId);
    await this.scheduleNoShowCheck(entry.id, settings.noShowTimeout);

    this.emit('queue:customer_called', { shopId, entry, barberId });

    return entry;
  }

  // Customer responds to call
  async customerResponded(entryId: string): Promise<QueueEntry> {
    const entry = await this.getQueueEntry(entryId);

    if (entry.status !== 'called') {
      throw new Error('Customer was not called');
    }

    // Cancel no-show timer
    await this.cancelNoShowCheck(entryId);

    return entry;
  }

  // Start service
  async startService(entryId: string, barberId: string): Promise<QueueEntry> {
    const entry = await this.getQueueEntry(entryId);

    if (!['called', 'waiting'].includes(entry.status)) {
      throw new Error('Cannot start service for this entry');
    }

    entry.status = 'in_service';
    entry.serviceStartedAt = new Date();

    await this.saveQueueEntry(entry);

    // Update barber status
    await this.updateBarberStatus(barberId, 'busy', entry);

    this.emit('queue:service_started', { entry, barberId });

    // Recalculate wait times for others
    await this.recalculatePositions(entry.shopId);

    return entry;
  }

  // Complete service
  async completeService(entryId: string): Promise<QueueEntry> {
    const entry = await this.getQueueEntry(entryId);

    if (entry.status !== 'in_service') {
      throw new Error('Service not in progress');
    }

    entry.status = 'completed';
    entry.completedAt = new Date();

    await this.saveQueueEntry(entry);

    // Update barber status to available
    const barberId = await this.getBarberForEntry(entryId);
    await this.updateBarberStatus(barberId, 'available');

    this.emit('queue:service_completed', { entry });

    // Check for next customer
    await this.notifyNextCustomerAlmostReady(entry.shopId);

    return entry;
  }

  // Customer leaves queue
  async leaveQueue(entryId: string, reason: LeaveReason): Promise<QueueEntry> {
    const entry = await this.getQueueEntry(entryId);

    if (!['waiting', 'called'].includes(entry.status)) {
      throw new Error('Cannot leave queue at this stage');
    }

    entry.status = 'left';
    entry.leftQueueAt = new Date();
    entry.leftReason = reason;

    await this.saveQueueEntry(entry);

    this.emit('queue:customer_left', { entry, reason });

    // Recalculate positions
    await this.recalculatePositions(entry.shopId);

    return entry;
  }

  // Mark as no-show
  async markNoShow(entryId: string): Promise<QueueEntry> {
    const entry = await this.getQueueEntry(entryId);

    if (entry.status !== 'called') {
      throw new Error('Can only mark called customers as no-show');
    }

    entry.status = 'no_show';
    entry.leftQueueAt = new Date();

    await this.saveQueueEntry(entry);

    // Update customer history if registered
    if (entry.customerId) {
      await this.recordNoShow(entry.customerId);
    }

    this.emit('queue:no_show', { entry });

    // Call next customer
    const barberId = await this.getBarberForEntry(entryId);
    await this.callNextCustomer(entry.shopId, barberId);

    return entry;
  }

  // Update customer position notification
  async checkAndNotifyPositionUpdates(shopId: string): Promise<void> {
    const settings = await this.getQueueSettings(shopId);
    const entries = await this.getActiveQueueEntries(shopId);

    for (const entry of entries) {
      if (entry.status !== 'waiting') continue;

      // Check if position matches notification thresholds
      for (const threshold of settings.notifyAtPosition) {
        if (entry.position === threshold) {
          const alreadyNotified = entry.notificationsSent.some(
            n => n.type === 'position_update' && n.content.includes(`position ${threshold}`)
          );

          if (!alreadyNotified) {
            await this.sendPositionNotification(entry, threshold);
          }
        }
      }

      // Check almost ready threshold
      if (entry.estimatedWaitTime <= settings.almostReadyThreshold) {
        const alreadyNotified = entry.notificationsSent.some(
          n => n.type === 'almost_ready'
        );

        if (!alreadyNotified) {
          await this.sendAlmostReadyNotification(entry);
        }
      }
    }
  }

  // Get display board data
  async getDisplayBoardData(shopId: string): Promise<DisplayBoardData> {
    const state = await this.getQueueState(shopId);
    const shop = await this.getShop(shopId);
    const announcements = await this.getActiveAnnouncements(shopId);

    return {
      shopId,
      shopName: shop.name,
      currentTime: new Date(),
      queue: state.currentQueue
        .filter(e => ['waiting', 'called'].includes(e.status))
        .map((e, i) => ({
          position: e.position,
          displayName: e.customerName.split(' ')[0], // First name only
          status: e.status,
          barberName: e.preferredBarberId ?
            state.barbersAvailable.find(b => b.barberId === e.preferredBarberId)?.barberName :
            undefined,
          waitTime: e.estimatedWaitTime,
        })),
      barbers: state.barbersAvailable.map(b => ({
        name: b.barberName,
        status: b.status as 'available' | 'busy' | 'break',
        currentCustomerInitials: b.currentCustomer?.customerName
          .split(' ')
          .map(n => n[0])
          .join(''),
        estimatedAvailable: b.nextAvailableAt ?
          `~${Math.round((b.nextAvailableAt.getTime() - Date.now()) / 60000)} min` :
          undefined,
      })),
      announcements,
      averageWaitTime: state.averageWaitTime,
      queueOpen: state.isOpen,
    };
  }

  // Recalculate all positions
  private async recalculatePositions(shopId: string): Promise<void> {
    const entries = await this.getActiveQueueEntries(shopId);
    const waiting = entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime());

    // Group by preferred barber
    const generalQueue: QueueEntry[] = [];
    const barberQueues: Map<string, QueueEntry[]> = new Map();

    for (const entry of waiting) {
      if (entry.preferredBarberId) {
        const queue = barberQueues.get(entry.preferredBarberId) || [];
        queue.push(entry);
        barberQueues.set(entry.preferredBarberId, queue);
      } else {
        generalQueue.push(entry);
      }
    }

    // Update positions and wait times
    let position = 1;
    for (const entry of generalQueue) {
      entry.position = position++;
      entry.estimatedWaitTime = await this.calculateEntryWaitTime(entry);
      entry.estimatedServiceTime = new Date(
        Date.now() + entry.estimatedWaitTime * 60 * 1000
      );
      await this.saveQueueEntry(entry);
    }

    for (const [barberId, queue] of barberQueues) {
      let barberPosition = 1;
      for (const entry of queue) {
        entry.position = barberPosition++;
        entry.estimatedWaitTime = await this.calculateEntryWaitTime(entry);
        entry.estimatedServiceTime = new Date(
          Date.now() + entry.estimatedWaitTime * 60 * 1000
        );
        await this.saveQueueEntry(entry);
      }
    }

    this.emit('queue:positions_updated', { shopId });
  }

  private async calculateEntryWaitTime(entry: QueueEntry): Promise<number> {
    if (entry.preferredBarberId) {
      const barberStatus = await this.getBarberStatus(entry.preferredBarberId);
      const barberQueue = await this.getBarberQueueEntries(entry.preferredBarberId);
      return this.calculateBarberWaitTime(barberStatus, barberQueue);
    }

    // General queue - estimate based on all available barbers
    const barberStatuses = await this.getBarberStatuses(entry.shopId);
    const available = barberStatuses.filter(b => b.status !== 'offline');

    if (available.length === 0) return 999;

    // Simple estimation: queue position * avg service time / barbers
    const avgServiceTime = await this.calculateAverageServiceTime(entry.shopId);
    return Math.ceil((entry.position * avgServiceTime) / available.length);
  }

  private async calculateBarberWaitTime(
    barber: BarberQueueStatus,
    queue: QueueEntry[]
  ): Promise<number> {
    let waitTime = 0;

    // Add current customer remaining time
    if (barber.currentCustomer) {
      const elapsed = Date.now() - barber.currentCustomer.startedAt.getTime();
      const remaining = Math.max(
        0,
        barber.currentCustomer.estimatedEndAt.getTime() - Date.now()
      );
      waitTime += Math.ceil(remaining / 60000);
    }

    // Add queued customers duration
    for (const entry of queue) {
      if (entry.status === 'waiting') {
        waitTime += entry.estimatedDuration;
      }
    }

    return waitTime;
  }

  private adjustEstimate(
    baseEstimate: number,
    accuracy: 'conservative' | 'optimistic' | 'accurate'
  ): number {
    switch (accuracy) {
      case 'conservative':
        return Math.ceil(baseEstimate * 1.2);
      case 'optimistic':
        return Math.ceil(baseEstimate * 0.9);
      default:
        return baseEstimate;
    }
  }

  // Helper methods (implementations needed)
  private async getQueueSettings(shopId: string): Promise<QueueSettings> {
    throw new Error('Not implemented');
  }

  private async getActiveQueueEntries(shopId: string): Promise<QueueEntry[]> {
    throw new Error('Not implemented');
  }

  private async getBarberStatuses(shopId: string): Promise<BarberQueueStatus[]> {
    throw new Error('Not implemented');
  }

  private async getServices(ids: string[]): Promise<any[]> {
    throw new Error('Not implemented');
  }

  private async calculatePosition(
    shopId: string,
    preferredBarberId?: string,
    priority?: QueuePriority
  ): Promise<number> {
    throw new Error('Not implemented');
  }

  private async saveQueueEntry(entry: QueueEntry): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getQueueEntry(id: string): Promise<QueueEntry> {
    throw new Error('Not implemented');
  }

  private async getBarberQueueEntries(barberId: string): Promise<QueueEntry[]> {
    throw new Error('Not implemented');
  }

  private async getCallableEntries(shopId: string, barberId: string): Promise<QueueEntry[]> {
    throw new Error('Not implemented');
  }

  private async getBarberStatus(barberId: string): Promise<BarberQueueStatus> {
    throw new Error('Not implemented');
  }

  private async updateBarberStatus(
    barberId: string,
    status: string,
    currentEntry?: QueueEntry
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getBarberForEntry(entryId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async calculateAverageWaitTime(shopId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  private async calculateAverageServiceTime(shopId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  private isWithinOperatingHours(shopId: string): boolean {
    throw new Error('Not implemented');
  }

  private async getShop(shopId: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async getActiveAnnouncements(shopId: string): Promise<Announcement[]> {
    throw new Error('Not implemented');
  }

  // Notification methods
  private async sendQueueConfirmation(entry: QueueEntry): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendCalledNotification(entry: QueueEntry, barberId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendPositionNotification(entry: QueueEntry, position: number): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendAlmostReadyNotification(entry: QueueEntry): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyNextCustomerAlmostReady(shopId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async scheduleNoShowCheck(entryId: string, timeoutMinutes: number): Promise<void> {
    throw new Error('Not implemented');
  }

  private async cancelNoShowCheck(entryId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async recordNoShow(customerId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

## Database Schema

```sql
-- Queue entries
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  preferred_barber_id UUID REFERENCES barbers(id),
  estimated_duration INTEGER NOT NULL,
  position INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  priority VARCHAR(20) DEFAULT 'normal',
  estimated_wait_time INTEGER,
  estimated_service_time TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ NOT NULL,
  called_at TIMESTAMPTZ,
  service_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  left_queue_at TIMESTAMPTZ,
  left_reason VARCHAR(50),
  source VARCHAR(30) DEFAULT 'walk_in',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue entry services
CREATE TABLE queue_entry_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id),
  service_id UUID NOT NULL REFERENCES barber_services(id),
  service_name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Queue notifications
CREATE TABLE queue_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id),
  type VARCHAR(30) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue settings
CREATE TABLE queue_settings (
  shop_id UUID PRIMARY KEY REFERENCES barbershops(id),
  enabled BOOLEAN DEFAULT true,
  max_queue_size INTEGER DEFAULT 20,
  max_wait_time INTEGER DEFAULT 120,
  allow_barber_preference BOOLEAN DEFAULT true,
  allow_priority_purchase BOOLEAN DEFAULT false,
  priority_price DECIMAL(10, 2) DEFAULT 5.00,
  notify_at_positions INTEGER[] DEFAULT '{3, 1}',
  almost_ready_threshold INTEGER DEFAULT 10,
  no_show_timeout INTEGER DEFAULT 5,
  auto_close_time TIME,
  display_board_enabled BOOLEAN DEFAULT true,
  estimation_accuracy VARCHAR(20) DEFAULT 'accurate',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Display announcements
CREATE TABLE queue_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber queue assignments
CREATE TABLE barber_queue_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(queue_entry_id)
);

-- Indexes
CREATE INDEX idx_queue_entries_shop ON queue_entries(shop_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_queue_entries_position ON queue_entries(position);
CREATE INDEX idx_queue_entries_checked_in ON queue_entries(checked_in_at DESC);
CREATE INDEX idx_queue_entries_barber ON queue_entries(preferred_barber_id);
CREATE INDEX idx_queue_notifications_entry ON queue_notifications(queue_entry_id);
```

## WebSocket Events

```typescript
// Server -> Client events
interface QueueEvents {
  'queue:state_update': QueueState;
  'queue:entry_added': { entry: QueueEntry };
  'queue:entry_updated': { entry: QueueEntry };
  'queue:customer_called': { entry: QueueEntry; barberId: string };
  'queue:service_started': { entry: QueueEntry };
  'queue:service_completed': { entry: QueueEntry };
  'queue:positions_updated': { shopId: string };
  'queue:display_update': DisplayBoardData;
}

// Client -> Server events
interface ClientQueueEvents {
  'queue:subscribe': { shopId: string };
  'queue:unsubscribe': { shopId: string };
}
```

## API Endpoints

```typescript
// POST /api/queue/join
// Join queue
{
  request: {
    shopId: string,
    customerName: string,
    customerPhone: string,
    serviceIds: string[],
    preferredBarberId?: string,
    priority?: string
  },
  response: QueueEntry
}

// GET /api/queue/:shopId/state
// Get queue state
{
  response: QueueState
}

// GET /api/queue/:shopId/estimate
// Get wait time estimate
{
  query: { serviceIds: string[], barberId?: string },
  response: WaitTimeEstimate
}

// GET /api/queue/entry/:id
// Get queue entry
{
  response: QueueEntry
}

// PATCH /api/queue/entry/:id/status
// Update entry status (barber actions)
{
  request: { status: string, barberId?: string },
  response: QueueEntry
}

// DELETE /api/queue/entry/:id
// Leave queue
{
  query: { reason?: string },
  response: { success: boolean }
}

// GET /api/queue/:shopId/display
// Get display board data
{
  response: DisplayBoardData
}
```

## Related Skills
- `barbershop-booking-standard.md` - Appointment integration
- `barbershop-pos-standard.md` - Payment processing after queue service
- `barbershop-loyalty-standard.md` - Loyalty points from queue visits

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Barbershop
