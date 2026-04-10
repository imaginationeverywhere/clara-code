# setup-voice-agent — Configure Vapi Voice Agent for a Heru

Set up an AI voice agent powered by Vapi for appointment booking, customer service, or information access. Supports in-app VoIP (WebRTC) for mobile members and dedicated phone numbers for corporate clients.

**Agent:** `vapi-voice-agent`

## Usage

```bash
/setup-voice-agent                          # Interactive setup wizard
/setup-voice-agent --heru fmo               # Configure for specific Heru
/setup-voice-agent --mode voip              # In-app VoIP only (mobile members)
/setup-voice-agent --mode phone             # Phone number only (corporate)
/setup-voice-agent --mode hybrid            # Both VoIP + phone number
/setup-voice-agent --dry-run                # Preview configuration without creating
```

## Arguments

- `--heru <name>` — Target Heru project (fmo, quikcarry, site962, etc.)
- `--mode <voip|phone|hybrid>` — Access model (default: voip)
- `--membership-fee <amount>` — Monthly fee for voice access (default: $1.00)
- `--dry-run` — Preview what would be created

## What It Does

### Phase 1: Vapi MCP Setup
1. Install Vapi MCP server if not present
2. Validate VAPI_API_KEY in environment
3. Install Vapi skills for Claude Code

### Phase 2: Assistant Creation
1. Generate business-specific system prompt based on Heru type
2. Create Vapi assistant with appropriate voice model
3. Configure first message, transfer number, end-of-call settings

### Phase 3: Tool Configuration
1. Create `check_membership` tool (Clerk + Stripe verification)
2. Create `check_availability` tool (business calendar query)
3. Create `book_appointment` tool (database write)
4. Create `send_confirmation` tool (Twilio SMS + push notification)
5. Create `log_call` tool (admin dashboard webhook)

### Phase 4: Access Configuration
- **VoIP mode:** Generate Vapi Web SDK integration code for React Native
- **Phone mode:** Provision Vapi phone number, configure IVR
- **Hybrid mode:** Both of the above

### Phase 5: Subscription Integration
1. Add `voice_booking` line item to Stripe subscription product
2. Update membership UI to show voice booking feature
3. Add "Book by Phone" button to mobile app (gated by subscription)

### Phase 6: Admin Dashboard
1. Add voice agent call logs to admin panel
2. End-of-call webhook integration
3. Call recording access for staff

## Per-Heru Templates

### FMO (Grooming)
```
"You are the FMO Grooming booking assistant. You help members book grooming
appointments. You have access to the FMO calendar and can check availability,
book appointments, and send confirmations. Always greet the member by name."
```

### QuikCarry (Ride Booking)
```
"You are the QuikCarry ride booking assistant. You help corporate clients
book rides for their guests and groups. You can check driver availability,
schedule pickups, and provide ride confirmations with driver details."
```

## Output

Creates in the target Heru project:
- `backend/src/features/voice-agent/` — Voice agent feature module
- `mobile/src/features/voice-booking/` — Mobile VoIP integration
- `.env` updates with Vapi credentials
- Stripe subscription product update
- Admin dashboard voice logs component

## Prerequisites

- Vapi account (https://vapi.ai)
- VAPI_API_KEY in environment
- Clerk authentication configured
- Stripe subscriptions configured
- Twilio for SMS confirmations (optional)

## Related

- **Agent:** `vapi-voice-agent`
- **Skill:** `voice-booking`
- **Vapi MCP:** `github.com/VapiAI/mcp-server`
