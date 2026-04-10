---
name: fintech
description: Implement financial technology systems including payment processing, banking integrations, investment platforms, and compliance management. Use when building fintech apps, payment platforms, banking applications, or financial services. Triggers on requests for payment processing, bank connections, investment tracking, financial compliance, or money transfer features.
---

# Fintech & Financial Services Skills

## Overview

Production-ready patterns for financial technology systems:
- **Payment processing** with multiple payment methods
- **Banking integration** with Plaid and open banking
- **Investment platforms** with portfolio management
- **Compliance management** with KYC/AML requirements

## Available Skills

### fintech-payments-standard.md
Payment processing with:
- Multiple payment methods (cards, ACH, wire)
- Payment orchestration
- Fraud detection and prevention
- Refund and dispute handling
- PCI compliance patterns

### fintech-banking-standard.md
Banking integration with:
- Plaid account linking
- Balance and transaction syncing
- Account verification
- Direct deposit setup
- Open banking APIs

### fintech-investment-standard.md
Investment platform features with:
- Portfolio tracking and analytics
- Trade execution workflows
- Market data integration
- Performance reporting
- Tax lot management

### fintech-compliance-standard.md
Regulatory compliance with:
- KYC (Know Your Customer) workflows
- AML (Anti-Money Laundering) screening
- Identity verification (Persona, Jumio)
- Transaction monitoring
- Audit trail and reporting

## Implementation Workflow

1. **Define financial products** - Payments, banking, investing
2. **Choose compliance level** - Money transmitter, broker-dealer
3. **Integrate providers** - Stripe, Plaid, Alpaca, etc.
4. **Implement KYC** - Identity verification workflows
5. **Build audit systems** - Logging and compliance reporting

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe, Plaid, Dwolla
- **Trading:** Alpaca, Interactive Brokers
- **KYC:** Persona, Jumio, Onfido
- **Compliance:** ComplyAdvantage, Chainalysis
