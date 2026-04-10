---
name: rental
description: Implement rental and property management systems including vehicle rentals, property listings, equipment rentals, and reservation management. Use when building rental platforms, property management apps, equipment rental systems, or vacation rental applications. Triggers on requests for vehicle rentals, property listings, equipment booking, reservation management, or rental fleet operations.
---

# Rental & Property Management Skills

## Overview

Production-ready patterns for rental and property management:
- **Vehicle rentals** with fleet management and availability
- **Property listings** with search and booking
- **Equipment rentals** with inventory tracking
- **Reservation management** with calendar integration

## Available Skills

### rental-vehicle-standard.md
Vehicle rental system with:
- Fleet inventory management
- Availability and pricing rules
- Pickup and return workflows
- Damage inspection and reporting
- Insurance and add-ons

### rental-property-standard.md
Property rental platform with:
- Listing creation and management
- Search and filtering
- Booking calendar and availability
- Guest communication
- Reviews and ratings

### rental-equipment-standard.md
Equipment rental with:
- Inventory and asset tracking
- Rental duration and pricing
- Maintenance scheduling
- Delivery and pickup
- Damage assessment

### rental-reservation-standard.md
Reservation management with:
- Calendar availability sync
- Booking confirmation workflow
- Modification and cancellation
- Security deposits
- Automated reminders

## Implementation Workflow

1. **Define rental types** - Vehicles, properties, equipment
2. **Set up inventory** - Asset management and tracking
3. **Configure pricing** - Time-based, seasonal, dynamic
4. **Build booking flow** - Search → Select → Reserve → Pay
5. **Enable communication** - Automated messages and reminders

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe for deposits and payments
- **Calendar:** Google Calendar API integration
- **Maps:** Google Maps for location search
- **Media:** AWS S3 for property/vehicle photos
