# Wallet & Upsell Model

Every Clara user has a Stripe-powered wallet for per-request upgrades.

## How It Works

1. User adds funds via debit/credit card (Stripe)
2. Agent detects when deeper thinking or premium voice would help
3. Agent quotes the price: "I can analyze this deeper for $2.00. Want me to?"
4. User approves → wallet debited → agent upgrades for that single request
5. Response delivered at the higher tier
6. Next request returns to their base tier

## Upsell Pricing

| Upgrade | Price to User | Our Cost | Margin |
|---------|--------------|----------|--------|
| Fast → Balanced (single request) | $0.50 | ~$0.05-0.10 | 90% |
| Fast → Deep (single request) | $2.00 | ~$0.15-0.30 | 85% |
| Balanced → Deep (single request) | $1.50 | ~$0.10-0.20 | 87% |
| Standard Voice → Premium Voice (single call) | $0.25 | ~$0.05 | 80% |

## Nudge-to-Upgrade Logic

When a user spends consistently on upsells, Clara nudges:

| Threshold | Nudge |
|-----------|-------|
| 10 upsells in a month | "You're using Balanced thinking a lot. Upgrade to save?" |
| $20 spent on upsells | "You've spent $20 on Deep thinking requests. Upgrading would save you money." |
| 90% voice minutes used | "You're almost out of voice minutes. Add more or upgrade?" |

## Wallet Top-Up Options

| Amount | Bonus | Purpose |
|--------|-------|---------|
| $5 | None | Light users, testing |
| $20 | None | Regular users |
| $50 | +$5 bonus (10%) | Power users |
| $100 | +$15 bonus (15%) | Heavy users |

## Stripe Integration

- `stripe.customers.createBalanceTransaction()` for wallet credits
- `stripe.customers.retrieveBalance()` for checking balance
- Webhook on low balance → notification to user
- Auto-top-up option: replenish $20 when balance drops below $5
