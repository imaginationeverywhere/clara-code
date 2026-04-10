---
name: barbershop
description: Implement barbershop and salon booking systems including appointment scheduling, queue management, point-of-sale (POS), and customer loyalty programs. Use when building barber shops, hair salons, beauty parlors, or similar service-based booking applications. Triggers on requests for appointment booking, walk-in queues, salon POS, barber loyalty cards, or stylist scheduling.
---

# Barbershop & Salon Business Skills

## Overview

Production-ready patterns for barbershop and salon management systems:
- **Appointment booking** with stylist selection and service menus
- **Walk-in queue management** with real-time wait times
- **Point-of-sale systems** for retail and service payments
- **Loyalty programs** with visit tracking and rewards

## Available Skills

### barbershop-booking-standard.md
Complete appointment booking system with:
- Service catalog management
- Stylist availability and scheduling
- Calendar integration
- Automated reminders (SMS/Email)
- Booking confirmation workflow

### barbershop-queue-standard.md
Walk-in queue management with:
- Real-time position tracking
- Wait time estimation
- Customer check-in kiosk
- Queue prioritization
- Stylist assignment

### barbershop-pos-standard.md
Point-of-sale integration with:
- Service and product checkout
- Cash and card processing
- Receipt generation
- Tip handling
- Daily reconciliation

### barbershop-loyalty-standard.md
Customer loyalty programs with:
- Visit tracking and history
- Points/rewards systems
- Referral programs
- VIP tier management
- Birthday and special offers

## Implementation Workflow

1. **Choose your features** - Select which skills match your requirements
2. **Set up the database** - Follow schema patterns for appointments, customers, services
3. **Configure payments** - Integrate Stripe for POS functionality
4. **Enable notifications** - Set up Twilio for SMS reminders
5. **Build the UI** - Use ShadCN components for booking interfaces

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe Connect for multi-location support
- **Notifications:** Twilio SMS, SendGrid Email
- **Calendar:** Google Calendar API integration
