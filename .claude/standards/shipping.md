# Shipping Standard (Shippo)

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --shipping`

Covers: Shippo rate calculation, label generation, tracking, multi-carrier configuration, and webhook handling.

---

## CRITICAL RULES

### 1. Shippo API key from SSM — never hardcoded

```typescript
// ✅ API key from SSM (injected as environment variable)
const shippoApiKey = process.env.SHIPPO_API_KEY; // SSM: /[project]/SHIPPO_API_KEY

// ✅ Shippo client singleton
import Shippo from "shippo";

let _shippo: ReturnType<typeof Shippo> | null = null;

export function getShippo() {
  if (!_shippo) {
    const key = process.env.SHIPPO_API_KEY;
    if (!key) throw new Error("SHIPPO_API_KEY not configured");
    _shippo = new Shippo(key);
  }
  return _shippo;
}

// ❌ Hardcoded API key
const shippo = new Shippo("shippo_live_abc123hardcoded");
```

**SSM paths:**
```
/[project]/dev/SHIPPO_API_KEY       # test token: shippo_test_...
/[project]/prod/SHIPPO_API_KEY      # live token: shippo_live_...
```

---

### 2. Always get live rates — never hardcode shipping prices

```typescript
// ✅ Fetch live rates at checkout — show customer actual carrier rates
export async function getShippingRates(params: {
  fromAddress: ShippoAddress;
  toAddress: ShippoAddress;
  parcel: ShippoParcel;
}): Promise<ShippoRate[]> {
  const shipment = await getShippo().shipments.create({
    address_from: params.fromAddress,
    address_to: params.toAddress,
    parcels: [params.parcel],
    async: false,
  });

  // Filter to only available (non-error) rates
  return shipment.rates.filter(r => r.object_state === "VALID");
}

// ❌ Hardcoded shipping price
const shippingCost = 9.99; // ← stale, inaccurate, loses you money or overcharges customers
```

---

### 3. Validate addresses before creating labels

```typescript
// ✅ Validate address before label purchase — avoid failed deliveries
export async function validateAddress(address: ShippoAddress): Promise<{
  valid: boolean;
  suggestedAddress?: ShippoAddress;
  messages: string[];
}> {
  const result = await getShippo().addresses.create({
    ...address,
    validate: true,
  });

  return {
    valid: result.validation_results?.is_valid ?? false,
    suggestedAddress: result.validation_results?.is_valid ? result : undefined,
    messages: result.validation_results?.messages?.map(m => m.text) ?? [],
  };
}

// ❌ Creating a label without address validation — label prints, package gets lost
```

---

### 4. Label purchase — always use the selected rate ID

```typescript
// ✅ Create label from a specific rate the customer chose
export async function purchaseLabel(rateId: string): Promise<{
  labelUrl: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
}> {
  const transaction = await getShippo().transactions.create({
    rate: rateId,
    label_file_type: "PDF",
    async: false,
  });

  if (transaction.status !== "SUCCESS") {
    throw new Error(`Label purchase failed: ${transaction.messages?.map(m => m.text).join(", ")}`);
  }

  return {
    labelUrl: transaction.label_url,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    carrier: transaction.rate?.provider ?? "unknown",
  };
}

// Store label metadata with order
await Order.update(
  {
    shippoTransactionId: transaction.object_id,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url,
    shippingStatus: "label_created",
  },
  { where: { id: orderId } }
);
```

---

### 5. Tracking webhook — register and handle status updates

```typescript
// ✅ Shippo tracking webhook
router.post("/api/webhooks/shippo/tracking", express.json(), (req, res) => {
  // Validate webhook (Shippo sends X-Shippo-Signature header in production)
  const event = req.body;

  if (event.event === "track_updated") {
    const { tracking_number, tracking_status } = event.data;
    const status = tracking_status.status; // "TRANSIT" | "DELIVERED" | "RETURNED" | "FAILURE"
    const substatus = tracking_status.substatus;

    // Update order shipping status
    Order.update(
      { shippingStatus: status.toLowerCase(), lastTrackingEvent: substatus },
      { where: { trackingNumber: tracking_number } }
    );

    // Notify customer on key status changes
    if (status === "DELIVERED" || status === "FAILURE") {
      notifyCustomerOfShipment(tracking_number, status);
    }
  }

  res.status(200).json({ received: true });
});
```

**Webhook events to register in Shippo Dashboard:**
- `track_updated`

---

### 6. Standard parcel definition — store in config, not hardcoded inline

```typescript
// ✅ Define standard parcels in config (size/weight affects rates)
export const PARCEL_TEMPLATES = {
  small: {
    length: "6", width: "4", height: "2", distance_unit: "in",
    weight: "1", mass_unit: "lb",
  },
  medium: {
    length: "12", width: "9", height: "4", distance_unit: "in",
    weight: "3", mass_unit: "lb",
  },
  large: {
    length: "18", width: "14", height: "8", distance_unit: "in",
    weight: "10", mass_unit: "lb",
  },
} as const;

// ❌ Hardcoded dimensions inline on every rate request
const rates = await getShippo().shipments.create({
  parcels: [{ length: "6", width: "4", height: "2", ... }] // duplicated everywhere
});
```

---

### 7. Platform markup on shipping (if applicable)

```typescript
// ✅ Add platform markup to carrier rate (optional — set in config)
const SHIPPING_MARKUP_PERCENT = parseFloat(process.env.SHIPPING_MARKUP_PERCENT ?? "0");

const customerShippingCost = SHIPPING_MARKUP_PERCENT > 0
  ? Math.ceil(parseFloat(rate.amount) * (1 + SHIPPING_MARKUP_PERCENT / 100) * 100) / 100
  : parseFloat(rate.amount);

// SSM: /[project]/SHIPPING_MARKUP_PERCENT — e.g. "10" for 10% markup
// If not set (or "0"): pass carrier cost through at cost
```

---

### Heru-specific tech doc required

Each Heru using Shippo MUST have `docs/standards/shipping.md` documenting:
- Carriers enabled (USPS, UPS, FedEx, DHL, etc.)
- Standard parcel templates used
- Platform shipping markup (% or $0 pass-through)
- From-address (warehouse/fulfillment center location) stored in SSM
- Tracking webhook URL per environment
- Return label policy

If `docs/standards/shipping.md` does not exist, create it.
