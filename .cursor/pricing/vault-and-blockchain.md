# User Vault & Blockchain

Every Clara user has a vault — this is WHY Clara knows them. The vault IS the brain.

## Vault Tiers

| Tier | Vault Type | Details |
|------|-----------|---------|
| All customers | **Cloud vault** | S3-backed, AES-256 encrypted, auto-synced |
| Premium customers | **Device + Cloud** | Local vault on phone/computer + cloud, bidirectional sync |
| Blockchain-enabled | **Device + Cloud + Chain** | Proof of ownership on-chain. Nobody reads it — not even us. |

## What's in the Vault

| Data | Purpose |
|------|---------|
| Agent identity | Who Clara is for this user (name, voice, personality) |
| Conversation memory | What Clara remembers about the user |
| Preferences | How the user likes to work (communication style, schedule) |
| Business context | What the user's business does, their clients, their industry |
| Relationships | Who the user has introduced Clara to, interaction history |
| Tool configs | Which integrations are active (calendar, email, Stripe) |
| Custom prompts | Any specialized instructions the user has given Clara |

## Sync Architecture

```
DEVICE (phone/laptop)          CLOUD (S3)
┌──────────────────┐     ┌──────────────────┐
│ Local vault       │     │ Cloud vault       │
│ (SQLite/JSON)     │ ←→  │ (S3 + DynamoDB)   │
│ Fast, offline     │     │ Backup, cross-     │
│ capable           │     │ device sync        │
└──────────────────┘     └──────────────────┘
         │                        │
         └────── Blockchain ──────┘
                (proof of ownership)
```

- **New device:** Install Clara → authenticate → vault syncs from cloud → agent knows you immediately
- **Offline:** Vault works locally. Syncs when back online.
- **Lost device:** Vault safe in cloud. Re-sync to new device.
- **Delete account:** Vault deleted from cloud. Local vault remains on device (user's property).

## Blockchain Integration

- Every vault has an on-chain proof of ownership
- Cryptographic proof that this vault belongs to this user
- Nobody — not even Quik Nation — can read another user's vault
- If Clara is ever acquired, vaults travel with users (portable)
- Same blockchain infrastructure as Clara Voice Tones (shared rails)

## Vault and Clara's Brain

The vault IS Clara's brain for that user. The LLM model (Haiku, Sonnet, Opus) is the thinking. The vault is the knowing.

- Change your thinking tier → Clara thinks differently, but still knows you
- Change your voice tier → Clara sounds different, but still knows you
- Delete your vault → Clara forgets everything. Fresh start.
