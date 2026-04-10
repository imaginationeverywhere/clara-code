---
name: transportation
description: Implement transportation and mobility systems including ride-hailing, fleet management, route optimization, and passenger booking. Use when building ride-share apps, shuttle services, transportation management, or mobility platforms. Triggers on requests for ride booking, driver dispatch, route planning, fleet tracking, or passenger management.
---

# Transportation & Mobility Skills

## Overview

Production-ready patterns for transportation systems:
- **Ride-hailing** with booking and dispatch
- **Fleet management** with vehicle tracking and maintenance
- **Route optimization** with multi-stop planning
- **Passenger booking** with reservations and scheduling

## Available Skills

### transportation-ridehail-standard.md
Ride-hailing system with:
- Ride request and matching
- Driver dispatch algorithms
- Fare calculation and surge pricing
- Real-time tracking
- Driver and passenger ratings

### transportation-fleet-standard.md
Fleet management with:
- Vehicle inventory and status
- Maintenance scheduling
- Fuel and expense tracking
- Driver assignment
- Utilization analytics

### transportation-routing-standard.md
Route optimization with:
- Multi-stop route planning
- Traffic-aware routing
- Time window constraints
- Load optimization
- Driver turn-by-turn navigation

### transportation-booking-standard.md
Passenger booking with:
- Scheduled rides and reservations
- Corporate accounts
- Group bookings
- Airport transfers
- Accessibility options

## Implementation Workflow

1. **Define service types** - On-demand, scheduled, corporate
2. **Set up driver network** - Onboarding and verification
3. **Configure dispatch** - Manual or algorithmic matching
4. **Build tracking** - Real-time GPS with ETA
5. **Enable payments** - Fare calculation and processing

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Mobile:** React Native for driver/passenger apps
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Maps:** Google Maps API, Mapbox
- **Real-time:** Socket.io for live tracking
- **Payments:** Stripe for ride payments
