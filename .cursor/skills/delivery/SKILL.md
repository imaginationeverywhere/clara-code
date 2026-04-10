---
name: delivery
description: Implement delivery and logistics systems including food delivery, package delivery, driver management, and real-time tracking. Use when building delivery apps, courier services, food delivery platforms, or last-mile logistics applications. Triggers on requests for delivery tracking, driver dispatch, food ordering, courier management, or fleet operations.
---

# Delivery & Logistics Skills

## Overview

Production-ready patterns for delivery and logistics systems:
- **Food delivery** with restaurant integration and order tracking
- **Package delivery** with pickup and dropoff workflows
- **Driver management** with dispatch and routing
- **Real-time tracking** with GPS and ETA calculations

## Available Skills

### food-delivery-standard.md
Food delivery platform with:
- Restaurant menu management
- Order placement and customization
- Kitchen display systems (KDS)
- Driver assignment and routing
- Delivery tracking and ETA
- Customer ratings and reviews

### non-food-delivery-standard.md
Package and courier delivery with:
- Pickup request workflows
- Package dimension and weight
- Multi-stop route optimization
- Proof of delivery (photos/signatures)
- Return and exchange handling

### delivery-driver-standard.md
Driver management system with:
- Driver onboarding and verification
- Real-time location tracking
- Earnings and payout management
- Performance metrics and ratings
- Communication tools

## Implementation Workflow

1. **Choose delivery type** - Food, packages, or multi-purpose
2. **Set up the marketplace** - Connect merchants with drivers
3. **Configure dispatch** - Manual or auto-assignment algorithms
4. **Enable tracking** - Real-time GPS with socket connections
5. **Build mobile apps** - Customer, driver, and merchant apps

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Mobile:** React Native for driver/customer apps
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Real-time:** Socket.io for live tracking
- **Maps:** Google Maps API, Mapbox
- **Payments:** Stripe Connect for marketplace payouts
