---
name: music
description: Implement music industry systems including artist management, royalty tracking, booking and touring, and fan engagement platforms. Use when building music apps, artist management systems, royalty tracking platforms, or entertainment booking applications. Triggers on requests for artist management, royalty splits, music distribution, concert booking, or fan engagement.
---

# Music & Entertainment Skills

## Overview

Production-ready patterns for music industry systems:
- **Artist management** with profiles and portfolio management
- **Royalty tracking** with splits, advances, and payments
- **Booking and touring** with venue coordination
- **Fan engagement** with exclusive content and communities

## Available Skills

### music-artist-standard.md
Artist management with:
- Artist profile and branding
- Discography and release management
- Team and collaborator roles
- Contract and agreement tracking
- Performance analytics

### music-royalty-standard.md
Royalty tracking system with:
- Split sheet management
- Streaming royalty calculations
- Publishing and sync royalties
- Advance recoupment tracking
- Payment distribution

### music-booking-standard.md
Booking and touring with:
- Venue and promoter database
- Booking request workflows
- Tour routing and scheduling
- Rider and technical requirements
- Settlement and accounting

### music-fan-standard.md
Fan engagement platform with:
- Fan membership tiers
- Exclusive content delivery
- Direct-to-fan messaging
- Merchandise pre-orders
- Virtual events and meet-greets

## Implementation Workflow

1. **Define artist types** - Solo, band, producer, label
2. **Set up royalty splits** - Configure splits and payment rules
3. **Build booking system** - Request → Confirm → Execute → Settle
4. **Enable fan features** - Membership, content, engagement
5. **Integrate payments** - Stripe for fan purchases and artist payouts

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe Connect for royalty splits
- **Media:** AWS S3, CloudFront for streaming
- **Email:** SendGrid for fan communications
- **Analytics:** Custom analytics for streaming data
