# Transaction Fees (Heru Commerce)

When Clara-powered Herus process transactions (FMO bookings, WCR sales, QCR rentals, Site 962 tickets).

These fees are SEPARATE from Clara subscription pricing. They apply to commerce within Heru apps.

## Fee Breakdown

| Fee | Amount | Paid By | Goes To |
|-----|--------|---------|---------|
| Product price | Set by vendor | Customer | Site Owner (100%) |
| Platform fee | 5-7% | Customer | Quik Nation (PLATFORM_OWNER) |
| Technology fee | $1.00-$1.50 flat | Customer | Quik Nation (covers email, SMS, digital passes) |
| Card processing | 2.9% + $0.30 | Customer | Stripe |
| Shipping (if applicable) | Varies | Customer | Carrier (via Shippo) |

## Key Rules

1. **Site owners keep 100% of their listed price.** No deductions from vendor payout.
2. **ALL fees passed to customer.** Transparent display at checkout.
3. **Three separate fee lines** — Platform, Technology, Processing. Never bundled.
4. **Stripe fees NEVER absorbed by vendor.** Customer pays processing.

## Checkout Display Example

```
Haircut                           $35.00
Platform fee (7%)                  $2.45
Technology fee                     $1.50
Processing fee (2.9% + $0.30)     $1.43
─────────────────────────────────────────
Total                             $40.38

Vendor receives: $35.00 (100%)
Quik Nation receives: $2.45 + $1.50 = $3.95
Stripe receives: $1.43
```

## Marketplace Example (WCR Vendors)

```
World Cup T-Shirt                 $25.00
Marketplace fee (15%)              $3.75
Technology fee                     $1.50
Processing fee (2.9% + $0.30)     $1.18
─────────────────────────────────────────
Total                             $31.43

Vendor receives: $25.00 - $3.75 = $21.25
WCR receives: $3.75
Quik Nation receives: platform fee (from WCR) + $1.50
Stripe receives: $1.18
```

## Proven Models

- **Empress Eats:** $1.50 tech fee (working in production)
- **Site 962:** Dynamic SMS fee + 20% markup (working in production)

## Implementation

- `PricingCalculator` module in Ausar Engine (shared across all Herus)
- Reference implementation: Empress Eats `frontend/components/Checkout.tsx`
- Deploy to ALL Herus via `/sync-herus`
