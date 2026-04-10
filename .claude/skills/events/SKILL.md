---
name: events
description: Implement event management and ticketing systems including event creation, ticket sales, attendee management, and venue coordination. Use when building event platforms, ticketing apps, conference management systems, or entertainment booking applications. Triggers on requests for event ticketing, venue booking, attendee check-in, or event scheduling.
---

# Events & Ticketing Skills

## Overview

Production-ready patterns for event management and ticketing:
- **Event creation** with scheduling and venue management
- **Ticket sales** with pricing tiers and promotions
- **Attendee management** with check-in and badges
- **Venue coordination** with capacity and layout planning

## Available Skills

### event-management-standard.md
Complete event lifecycle with:
- Event creation and publishing
- Date, time, and venue selection
- Speaker and performer management
- Agenda and schedule builder
- Event marketing and promotion

### event-ticketing-standard.md
Ticket sales system with:
- Multiple ticket tiers (VIP, general, early bird)
- Promo codes and discounts
- Group tickets and packages
- Refund and transfer policies
- QR code ticket generation

### event-attendee-standard.md
Attendee management with:
- Registration and check-in
- Badge printing and scanning
- Session tracking
- Networking features
- Post-event surveys

### event-venue-standard.md
Venue coordination with:
- Venue search and booking
- Capacity management
- Seating chart builder
- Vendor coordination
- Equipment and AV setup

## Implementation Workflow

1. **Define event types** - Conferences, concerts, workshops, etc.
2. **Configure ticket tiers** - Pricing, limits, and availability
3. **Set up check-in** - QR scanning with mobile app
4. **Enable payments** - Stripe for ticket purchases
5. **Build analytics** - Attendance, sales, and engagement metrics

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Mobile:** React Native for check-in apps
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe for ticket sales
- **Email:** SendGrid for confirmations
- **QR:** QR code generation and scanning
