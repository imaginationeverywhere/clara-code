# Barbershop Booking Standard

## Overview
Appointment scheduling system for barbershops supporting individual barber availability, service duration management, recurring appointments, waitlists, and no-show tracking. Enables customers to book specific barbers or accept any available.

## Domain Context
- **Primary Projects**: Quik Barbershop, DreamiHairCare
- **Related Domains**: Events (venue booking patterns), Fintech (deposits)
- **Key Integration**: Google Calendar, Apple Calendar, SMS (Twilio)

## Core Interfaces

### Booking & Appointments
```typescript
interface Appointment {
  id: string;
  shopId: string;
  barberId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  services: BookedService[];
  status: AppointmentStatus;
  scheduledAt: Date;
  estimatedDuration: number; // minutes
  estimatedEndAt: Date;
  actualStartAt?: Date;
  actualEndAt?: Date;
  notes?: string;
  source: BookingSource;
  depositAmount?: number;
  depositPaid: boolean;
  confirmationSent: boolean;
  reminderSent: boolean;
  noShowMarked: boolean;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

type AppointmentStatus =
  | 'pending'       // Awaiting confirmation (if required)
  | 'confirmed'     // Confirmed by shop
  | 'checked_in'    // Customer arrived
  | 'in_progress'   // Service started
  | 'completed'     // Service finished
  | 'cancelled'     // Cancelled by customer or shop
  | 'no_show';      // Customer didn't arrive

type BookingSource =
  | 'online'        // Website/app booking
  | 'walk_in'       // Walk-in converted to appointment
  | 'phone'         // Phone booking
  | 'recurring'     // Auto-generated recurring
  | 'internal';     // Staff booking

interface BookedService {
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  barberId: string;
}

interface RecurringAppointment {
  id: string;
  customerId: string;
  shopId: string;
  barberId: string;
  services: string[];
  frequency: RecurringFrequency;
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  preferredTime: string; // HH:mm
  startDate: Date;
  endDate?: Date;
  lastGeneratedDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly';
```

### Barber Availability
```typescript
interface BarberAvailability {
  barberId: string;
  shopId: string;
  defaultSchedule: WeeklySchedule;
  overrides: ScheduleOverride[];
  breakTimes: BreakTime[];
  blockedDates: BlockedDate[];
  bookingBuffer: number; // minutes before/after
  maxAdvanceBooking: number; // days
  minAdvanceBooking: number; // hours
}

interface WeeklySchedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

interface DaySchedule {
  startTime: string; // HH:mm
  endTime: string;
  isWorking: boolean;
}

interface ScheduleOverride {
  date: Date;
  schedule: DaySchedule | null; // null = day off
  reason?: string;
}

interface BreakTime {
  id: string;
  type: 'lunch' | 'personal' | 'other';
  startTime: string;
  duration: number; // minutes
  daysOfWeek: number[]; // 0-6
}

interface BlockedDate {
  id: string;
  date: Date;
  reason: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  barberId: string;
  barberName: string;
  available: boolean;
  reason?: string; // if not available
}
```

### Services & Shop Configuration
```typescript
interface BarberService {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  category: ServiceCategory;
  isActive: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
  barberIds: string[]; // which barbers offer this
  addons?: ServiceAddon[];
  imageUrl?: string;
}

type ServiceCategory =
  | 'haircut'
  | 'beard'
  | 'shave'
  | 'color'
  | 'treatment'
  | 'combo'
  | 'other';

interface ServiceAddon {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ShopBookingSettings {
  shopId: string;
  requireConfirmation: boolean;
  allowWalkIns: boolean;
  allowOnlineBooking: boolean;
  requireDeposit: boolean;
  defaultDepositAmount: number;
  depositRefundPolicy: 'full' | 'partial' | 'none';
  cancellationWindow: number; // hours before appointment
  noShowPolicy: string;
  noShowFee: number;
  maxNoShowsBeforeBlock: number;
  confirmationLeadTime: number; // hours before to send confirmation
  reminderLeadTime: number; // hours before to send reminder
  slotInterval: number; // minutes (15, 30, 60)
  bufferBetweenAppointments: number; // minutes
}
```

### Waitlist
```typescript
interface WaitlistEntry {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  preferredBarberId?: string;
  services: string[];
  preferredDate: Date;
  preferredTimeRange: {
    start: string;
    end: string;
  };
  flexibility: 'exact' | 'flexible' | 'any_time';
  status: WaitlistStatus;
  notificationSent: boolean;
  convertedToAppointmentId?: string;
  expiresAt: Date;
  createdAt: Date;
}

type WaitlistStatus =
  | 'waiting'
  | 'slot_available'
  | 'converted'
  | 'expired'
  | 'cancelled';
```

## Service Implementation

### Barbershop Booking Service
```typescript
import { addMinutes, isBefore, isAfter, format, startOfDay, endOfDay } from 'date-fns';

export class BarbershopBookingService {

  // Get available time slots
  async getAvailableSlots(
    shopId: string,
    date: Date,
    serviceIds: string[],
    preferredBarberId?: string
  ): Promise<TimeSlot[]> {
    const services = await this.getServices(serviceIds);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const settings = await this.getShopSettings(shopId);

    // Get barbers who can do all services
    const eligibleBarbers = preferredBarberId
      ? [await this.getBarber(preferredBarberId)]
      : await this.getBarbersForServices(shopId, serviceIds);

    const slots: TimeSlot[] = [];

    for (const barber of eligibleBarbers) {
      const barberSlots = await this.getBarberSlots(
        barber.id,
        date,
        totalDuration,
        settings.slotInterval,
        settings.bufferBetweenAppointments
      );
      slots.push(...barberSlots);
    }

    // Sort by time, then by barber preference
    return slots.sort((a, b) => {
      const timeDiff = a.startTime.getTime() - b.startTime.getTime();
      if (timeDiff !== 0) return timeDiff;
      if (preferredBarberId) {
        if (a.barberId === preferredBarberId) return -1;
        if (b.barberId === preferredBarberId) return 1;
      }
      return 0;
    });
  }

  // Get barber's available slots for a date
  private async getBarberSlots(
    barberId: string,
    date: Date,
    duration: number,
    interval: number,
    buffer: number
  ): Promise<TimeSlot[]> {
    const availability = await this.getBarberAvailability(barberId);
    const dayOfWeek = date.getDay();
    const daySchedule = this.getDaySchedule(availability.defaultSchedule, dayOfWeek);

    if (!daySchedule?.isWorking) {
      return [];
    }

    // Check for override
    const override = availability.overrides.find(
      o => startOfDay(o.date).getTime() === startOfDay(date).getTime()
    );

    const schedule = override?.schedule || daySchedule;
    if (!schedule?.isWorking) return [];

    // Get existing appointments
    const appointments = await this.getBarberAppointments(
      barberId,
      startOfDay(date),
      endOfDay(date)
    );

    // Get break times for this day
    const breaks = availability.breakTimes.filter(
      b => b.daysOfWeek.includes(dayOfWeek)
    );

    // Generate slots
    const slots: TimeSlot[] = [];
    const barber = await this.getBarber(barberId);

    let currentTime = this.parseTime(date, schedule.startTime);
    const endTime = this.parseTime(date, schedule.endTime);

    while (addMinutes(currentTime, duration).getTime() <= endTime.getTime()) {
      const slotEnd = addMinutes(currentTime, duration);

      // Check if slot conflicts with appointments
      const appointmentConflict = appointments.some(apt =>
        this.timesOverlap(
          currentTime,
          slotEnd,
          apt.scheduledAt,
          apt.estimatedEndAt,
          buffer
        )
      );

      // Check if slot conflicts with breaks
      const breakConflict = breaks.some(brk => {
        const breakStart = this.parseTime(date, brk.startTime);
        const breakEnd = addMinutes(breakStart, brk.duration);
        return this.timesOverlap(currentTime, slotEnd, breakStart, breakEnd, 0);
      });

      const available = !appointmentConflict && !breakConflict;

      slots.push({
        startTime: currentTime,
        endTime: slotEnd,
        barberId,
        barberName: barber.name,
        available,
        reason: appointmentConflict ? 'booked' : breakConflict ? 'break' : undefined,
      });

      currentTime = addMinutes(currentTime, interval);
    }

    return slots.filter(s => s.available);
  }

  // Create appointment
  async createAppointment(
    shopId: string,
    customerId: string,
    barberId: string,
    serviceIds: string[],
    scheduledAt: Date,
    notes?: string
  ): Promise<Appointment> {
    // Validate slot is available
    const services = await this.getServices(serviceIds);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const settings = await this.getShopSettings(shopId);

    const isAvailable = await this.isSlotAvailable(
      barberId,
      scheduledAt,
      totalDuration,
      settings.bufferBetweenAppointments
    );

    if (!isAvailable) {
      throw new Error('Selected time slot is no longer available');
    }

    // Check customer eligibility (no-show policy)
    const customer = await this.getCustomer(customerId);
    if (customer.noShowCount >= settings.maxNoShowsBeforeBlock) {
      throw new Error('Account blocked due to no-show history');
    }

    // Calculate deposit if required
    let depositAmount = 0;
    const requiresDeposit = services.some(s => s.requiresDeposit) || settings.requireDeposit;
    if (requiresDeposit) {
      depositAmount = services.reduce(
        (sum, s) => sum + (s.depositAmount || settings.defaultDepositAmount),
        0
      );
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      shopId,
      barberId,
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      services: services.map(s => ({
        serviceId: s.id,
        serviceName: s.name,
        duration: s.duration,
        price: s.price,
        barberId,
      })),
      status: settings.requireConfirmation ? 'pending' : 'confirmed',
      scheduledAt,
      estimatedDuration: totalDuration,
      estimatedEndAt: addMinutes(scheduledAt, totalDuration),
      notes,
      source: 'online',
      depositAmount,
      depositPaid: false,
      confirmationSent: false,
      reminderSent: false,
      noShowMarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveAppointment(appointment);

    // Send confirmation
    await this.sendAppointmentConfirmation(appointment);

    // Schedule reminder
    await this.scheduleReminder(appointment, settings.reminderLeadTime);

    // Check waitlist for any slots that opened
    await this.checkWaitlist(shopId, appointment.scheduledAt);

    return appointment;
  }

  // Confirm appointment
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);

    if (appointment.status !== 'pending') {
      throw new Error('Appointment is not pending confirmation');
    }

    appointment.status = 'confirmed';
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);
    await this.sendAppointmentConfirmation(appointment);

    return appointment;
  }

  // Check in customer
  async checkInCustomer(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);

    if (!['confirmed', 'pending'].includes(appointment.status)) {
      throw new Error('Appointment cannot be checked in');
    }

    appointment.status = 'checked_in';
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);

    // Notify barber
    await this.notifyBarberOfCheckIn(appointment);

    return appointment;
  }

  // Start service
  async startService(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);

    if (appointment.status !== 'checked_in') {
      throw new Error('Customer must be checked in first');
    }

    appointment.status = 'in_progress';
    appointment.actualStartAt = new Date();
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);

    return appointment;
  }

  // Complete service
  async completeService(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);

    if (appointment.status !== 'in_progress') {
      throw new Error('Service must be in progress');
    }

    appointment.status = 'completed';
    appointment.actualEndAt = new Date();
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);

    // Update customer stats
    await this.updateCustomerStats(appointment.customerId, 'completed');

    return appointment;
  }

  // Cancel appointment
  async cancelAppointment(
    appointmentId: string,
    reason: string,
    cancelledBy: 'customer' | 'shop'
  ): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);
    const settings = await this.getShopSettings(appointment.shopId);

    if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
      throw new Error('Appointment cannot be cancelled');
    }

    // Check cancellation window
    const hoursUntilAppointment =
      (appointment.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    let refundDeposit = false;
    if (cancelledBy === 'customer' && appointment.depositPaid) {
      if (hoursUntilAppointment >= settings.cancellationWindow) {
        refundDeposit = settings.depositRefundPolicy !== 'none';
      } else {
        refundDeposit = settings.depositRefundPolicy === 'full';
      }
    } else if (cancelledBy === 'shop') {
      refundDeposit = true;
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);

    if (refundDeposit && appointment.depositAmount) {
      await this.processDepositRefund(appointment);
    }

    // Send cancellation notification
    await this.sendCancellationNotification(appointment, cancelledBy);

    // Check waitlist for opened slot
    await this.checkWaitlist(appointment.shopId, appointment.scheduledAt);

    return appointment;
  }

  // Mark no-show
  async markNoShow(appointmentId: string): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);
    const settings = await this.getShopSettings(appointment.shopId);

    if (appointment.status !== 'confirmed') {
      throw new Error('Only confirmed appointments can be marked as no-show');
    }

    appointment.status = 'no_show';
    appointment.noShowMarked = true;
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);

    // Update customer no-show count
    await this.updateCustomerStats(appointment.customerId, 'no_show');

    // Charge no-show fee if applicable
    if (settings.noShowFee > 0 && appointment.depositPaid) {
      await this.chargeNoShowFee(appointment, settings.noShowFee);
    }

    return appointment;
  }

  // Reschedule appointment
  async rescheduleAppointment(
    appointmentId: string,
    newScheduledAt: Date,
    newBarberId?: string
  ): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId);

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      throw new Error('Appointment cannot be rescheduled');
    }

    const barberId = newBarberId || appointment.barberId;
    const settings = await this.getShopSettings(appointment.shopId);

    // Validate new slot
    const isAvailable = await this.isSlotAvailable(
      barberId,
      newScheduledAt,
      appointment.estimatedDuration,
      settings.bufferBetweenAppointments
    );

    if (!isAvailable) {
      throw new Error('New time slot is not available');
    }

    const oldDate = appointment.scheduledAt;
    appointment.scheduledAt = newScheduledAt;
    appointment.estimatedEndAt = addMinutes(newScheduledAt, appointment.estimatedDuration);
    appointment.barberId = barberId;
    appointment.updatedAt = new Date();

    await this.saveAppointment(appointment);

    // Send reschedule notification
    await this.sendRescheduleNotification(appointment, oldDate);

    // Check waitlist for old slot
    await this.checkWaitlist(appointment.shopId, oldDate);

    return appointment;
  }

  // Create recurring appointment
  async createRecurringAppointment(
    customerId: string,
    shopId: string,
    barberId: string,
    serviceIds: string[],
    frequency: RecurringFrequency,
    preferredTime: string,
    startDate: Date,
    dayOfWeek?: number,
    dayOfMonth?: number,
    endDate?: Date
  ): Promise<RecurringAppointment> {
    const recurring: RecurringAppointment = {
      id: crypto.randomUUID(),
      customerId,
      shopId,
      barberId,
      services: serviceIds,
      frequency,
      dayOfWeek,
      dayOfMonth,
      preferredTime,
      startDate,
      endDate,
      isActive: true,
      createdAt: new Date(),
    };

    await this.saveRecurringAppointment(recurring);

    // Generate first appointment
    await this.generateNextRecurringAppointment(recurring);

    return recurring;
  }

  // Add to waitlist
  async addToWaitlist(
    shopId: string,
    customerId: string,
    serviceIds: string[],
    preferredDate: Date,
    timeRange: { start: string; end: string },
    flexibility: WaitlistEntry['flexibility'],
    preferredBarberId?: string
  ): Promise<WaitlistEntry> {
    const customer = await this.getCustomer(customerId);

    const entry: WaitlistEntry = {
      id: crypto.randomUUID(),
      shopId,
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      preferredBarberId,
      services: serviceIds,
      preferredDate,
      preferredTimeRange: timeRange,
      flexibility,
      status: 'waiting',
      notificationSent: false,
      expiresAt: new Date(preferredDate.getTime() + 24 * 60 * 60 * 1000), // expires day after
      createdAt: new Date(),
    };

    await this.saveWaitlistEntry(entry);

    // Check immediately if slot available
    await this.checkWaitlistEntryForSlot(entry);

    return entry;
  }

  // Check waitlist for available slots
  private async checkWaitlist(shopId: string, date: Date): Promise<void> {
    const entries = await this.getWaitlistEntriesForDate(shopId, date);

    for (const entry of entries) {
      if (entry.status === 'waiting') {
        await this.checkWaitlistEntryForSlot(entry);
      }
    }
  }

  private async checkWaitlistEntryForSlot(entry: WaitlistEntry): Promise<void> {
    const slots = await this.getAvailableSlots(
      entry.shopId,
      entry.preferredDate,
      entry.services,
      entry.preferredBarberId
    );

    const matchingSlots = slots.filter(slot => {
      const slotTime = format(slot.startTime, 'HH:mm');
      return slotTime >= entry.preferredTimeRange.start &&
             slotTime <= entry.preferredTimeRange.end;
    });

    if (matchingSlots.length > 0) {
      entry.status = 'slot_available';
      await this.saveWaitlistEntry(entry);
      await this.notifyWaitlistSlotAvailable(entry, matchingSlots[0]);
    }
  }

  // Helper methods
  private getDaySchedule(schedule: WeeklySchedule, dayOfWeek: number): DaySchedule | null {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return schedule[days[dayOfWeek] as keyof WeeklySchedule];
  }

  private parseTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private timesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
    buffer: number
  ): boolean {
    const bufferedStart2 = addMinutes(start2, -buffer);
    const bufferedEnd2 = addMinutes(end2, buffer);
    return start1 < bufferedEnd2 && end1 > bufferedStart2;
  }

  private async isSlotAvailable(
    barberId: string,
    startTime: Date,
    duration: number,
    buffer: number
  ): Promise<boolean> {
    const endTime = addMinutes(startTime, duration);
    const appointments = await this.getBarberAppointments(
      barberId,
      startOfDay(startTime),
      endOfDay(startTime)
    );

    return !appointments.some(apt =>
      this.timesOverlap(startTime, endTime, apt.scheduledAt, apt.estimatedEndAt, buffer)
    );
  }

  // Database and notification methods (implementations needed)
  private async saveAppointment(appointment: Appointment): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getAppointment(id: string): Promise<Appointment> {
    throw new Error('Not implemented');
  }

  private async getBarberAppointments(barberId: string, start: Date, end: Date): Promise<Appointment[]> {
    throw new Error('Not implemented');
  }

  private async getServices(ids: string[]): Promise<BarberService[]> {
    throw new Error('Not implemented');
  }

  private async getShopSettings(shopId: string): Promise<ShopBookingSettings> {
    throw new Error('Not implemented');
  }

  private async getBarber(barberId: string): Promise<{ id: string; name: string }> {
    throw new Error('Not implemented');
  }

  private async getBarberAvailability(barberId: string): Promise<BarberAvailability> {
    throw new Error('Not implemented');
  }

  private async getBarbersForServices(shopId: string, serviceIds: string[]): Promise<{ id: string; name: string }[]> {
    throw new Error('Not implemented');
  }

  private async getCustomer(customerId: string): Promise<{ name: string; phone: string; noShowCount: number }> {
    throw new Error('Not implemented');
  }

  private async updateCustomerStats(customerId: string, event: 'completed' | 'no_show'): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
    throw new Error('Not implemented');
  }

  private async scheduleReminder(appointment: Appointment, leadTime: number): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendCancellationNotification(appointment: Appointment, cancelledBy: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendRescheduleNotification(appointment: Appointment, oldDate: Date): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyBarberOfCheckIn(appointment: Appointment): Promise<void> {
    throw new Error('Not implemented');
  }

  private async processDepositRefund(appointment: Appointment): Promise<void> {
    throw new Error('Not implemented');
  }

  private async chargeNoShowFee(appointment: Appointment, fee: number): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveRecurringAppointment(recurring: RecurringAppointment): Promise<void> {
    throw new Error('Not implemented');
  }

  private async generateNextRecurringAppointment(recurring: RecurringAppointment): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveWaitlistEntry(entry: WaitlistEntry): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getWaitlistEntriesForDate(shopId: string, date: Date): Promise<WaitlistEntry[]> {
    throw new Error('Not implemented');
  }

  private async notifyWaitlistSlotAvailable(entry: WaitlistEntry, slot: TimeSlot): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

## Database Schema

```sql
-- Barbershops
CREATE TABLE barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barbers
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  avatar_url TEXT,
  specialty TEXT[],
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber services
CREATE TABLE barber_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  requires_deposit BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10, 2),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service-barber mapping
CREATE TABLE barber_service_offerings (
  barber_id UUID NOT NULL REFERENCES barbers(id),
  service_id UUID NOT NULL REFERENCES barber_services(id),
  custom_price DECIMAL(10, 2),
  custom_duration INTEGER,
  PRIMARY KEY (barber_id, service_id)
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER NOT NULL,
  estimated_end_at TIMESTAMPTZ NOT NULL,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  notes TEXT,
  source VARCHAR(20) DEFAULT 'online',
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_payment_intent_id VARCHAR(255),
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  no_show_marked BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment services
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  service_id UUID NOT NULL REFERENCES barber_services(id),
  service_name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Barber availability
CREATE TABLE barber_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id) UNIQUE,
  default_schedule JSONB NOT NULL,
  booking_buffer INTEGER DEFAULT 0,
  max_advance_booking INTEGER DEFAULT 30,
  min_advance_booking INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule overrides
CREATE TABLE schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  override_date DATE NOT NULL,
  schedule JSONB, -- null = day off
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, override_date)
);

-- Break times
CREATE TABLE barber_break_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  type VARCHAR(20) DEFAULT 'other',
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  days_of_week INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring appointments
CREATE TABLE recurring_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  barber_id UUID NOT NULL REFERENCES barbers(id),
  services UUID[] NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  day_of_week INTEGER,
  day_of_month INTEGER,
  preferred_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  last_generated_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist
CREATE TABLE appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES barbershops(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  preferred_barber_id UUID REFERENCES barbers(id),
  services UUID[] NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time_start TIME NOT NULL,
  preferred_time_end TIME NOT NULL,
  flexibility VARCHAR(20) DEFAULT 'exact',
  status VARCHAR(20) DEFAULT 'waiting',
  notification_sent BOOLEAN DEFAULT false,
  converted_appointment_id UUID REFERENCES appointments(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop booking settings
CREATE TABLE shop_booking_settings (
  shop_id UUID PRIMARY KEY REFERENCES barbershops(id),
  require_confirmation BOOLEAN DEFAULT false,
  allow_walk_ins BOOLEAN DEFAULT true,
  allow_online_booking BOOLEAN DEFAULT true,
  require_deposit BOOLEAN DEFAULT false,
  default_deposit_amount DECIMAL(10, 2) DEFAULT 0,
  deposit_refund_policy VARCHAR(20) DEFAULT 'full',
  cancellation_window INTEGER DEFAULT 24,
  no_show_policy TEXT,
  no_show_fee DECIMAL(10, 2) DEFAULT 0,
  max_no_shows_before_block INTEGER DEFAULT 3,
  confirmation_lead_time INTEGER DEFAULT 24,
  reminder_lead_time INTEGER DEFAULT 2,
  slot_interval INTEGER DEFAULT 30,
  buffer_between_appointments INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_appointments_shop ON appointments(shop_id);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_barbers_shop ON barbers(shop_id);
CREATE INDEX idx_schedule_overrides_barber ON schedule_overrides(barber_id);
CREATE INDEX idx_waitlist_shop_date ON appointment_waitlist(shop_id, preferred_date);
```

## API Endpoints

```typescript
// GET /api/appointments/slots
// Get available time slots
{
  query: {
    shopId: string,
    date: string,
    serviceIds: string[],
    barberId?: string
  },
  response: { slots: TimeSlot[] }
}

// POST /api/appointments
// Create appointment
{
  request: {
    shopId: string,
    barberId: string,
    serviceIds: string[],
    scheduledAt: string,
    notes?: string
  },
  response: Appointment
}

// PATCH /api/appointments/:id/status
// Update appointment status
{
  request: { status: AppointmentStatus, reason?: string },
  response: Appointment
}

// PUT /api/appointments/:id/reschedule
// Reschedule appointment
{
  request: { scheduledAt: string, barberId?: string },
  response: Appointment
}

// DELETE /api/appointments/:id
// Cancel appointment
{
  query: { reason?: string },
  response: { success: boolean }
}

// GET /api/barbers/:id/availability
// Get barber availability
{
  response: BarberAvailability
}

// PUT /api/barbers/:id/availability
// Update barber availability
{
  request: BarberAvailability,
  response: BarberAvailability
}

// POST /api/appointments/recurring
// Create recurring appointment
{
  request: {
    barberId: string,
    serviceIds: string[],
    frequency: string,
    preferredTime: string,
    startDate: string,
    dayOfWeek?: number
  },
  response: RecurringAppointment
}

// POST /api/waitlist
// Add to waitlist
{
  request: {
    shopId: string,
    serviceIds: string[],
    preferredDate: string,
    timeRange: { start: string, end: string },
    flexibility: string,
    barberId?: string
  },
  response: WaitlistEntry
}
```

## Related Skills
- `barbershop-queue-standard.md` - Walk-in queue management
- `barbershop-pos-standard.md` - Payment after service
- `barbershop-loyalty-standard.md` - Loyalty program integration

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Barbershop
