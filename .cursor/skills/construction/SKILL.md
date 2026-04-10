---
name: construction
description: Implement construction and contractor management systems including project tracking, bid management, job scheduling, and subcontractor coordination. Use when building construction company apps, contractor marketplaces, home improvement platforms, or trade services applications. Triggers on requests for construction projects, contractor bids, job site management, or trade scheduling.
---

# Construction & Contractor Skills

## Overview

Production-ready patterns for construction and contractor management:
- **Project tracking** with milestones and progress updates
- **Bid management** for quotes and proposals
- **Job scheduling** with crew and resource allocation
- **Subcontractor coordination** with communication tools

## Available Skills

### construction-project-standard.md
Complete project management with:
- Project lifecycle tracking
- Milestone and phase management
- Progress photo documentation
- Budget tracking and cost control
- Timeline and Gantt views

### construction-bid-standard.md
Bid and proposal management with:
- Quote request workflows
- Bid submission and comparison
- Cost estimation tools
- Material and labor pricing
- Bid approval workflows

### construction-scheduling-standard.md
Job scheduling and dispatch with:
- Crew assignment and availability
- Equipment allocation
- Route optimization
- Weather-aware scheduling
- Customer appointment windows

### construction-subcontractor-standard.md
Subcontractor coordination with:
- Contractor profiles and verification
- License and insurance tracking
- Payment terms and invoicing
- Communication channels
- Performance ratings

## Implementation Workflow

1. **Define project types** - Residential, commercial, renovation, etc.
2. **Set up user roles** - GC, subcontractor, homeowner, inspector
3. **Configure workflows** - Bid→Approve→Schedule→Complete
4. **Enable payments** - Milestone-based releases with Stripe
5. **Build mobile apps** - Field crew apps with React Native

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Mobile:** React Native for field crews
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe Connect for contractor payouts
- **Storage:** AWS S3 for project photos/documents
