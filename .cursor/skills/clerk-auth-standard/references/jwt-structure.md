# Clerk JWT Token Structure

## Token Format

Clerk JWTs follow standard JWT format: `header.payload.signature`

## Payload Claims

```typescript
interface ClerkJWTPayload {
  // Standard JWT claims
  iss: string;          // Issuer (Clerk domain)
  sub: string;          // Subject (Clerk user ID)
  aud: string;          // Audience
  exp: number;          // Expiration timestamp
  iat: number;          // Issued at timestamp
  nbf: number;          // Not before timestamp

  // Clerk-specific claims
  azp: string;          // Authorized party (frontend app)
  sid: string;          // Session ID
  act?: {               // Actor (for impersonation)
    sub: string;
  };

  // Custom claims (configured in Clerk dashboard)
  // Example: public_metadata, organizations, etc.
}
```

## Decoding Example

```typescript
import jwt from 'jsonwebtoken';

const token = req.headers.authorization?.replace('Bearer ', '');
const decoded = jwt.decode(token) as ClerkJWTPayload;

// Get user ID
const userId = decoded.sub;

// Get session ID
const sessionId = decoded.sid;
```

## Verification

For production, verify against Clerk's JWKS:

```typescript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://clerk.your-domain.com/.well-known/jwks.json')
);

const { payload } = await jwtVerify(token, JWKS);
```

## Token Lifetime

- Default: 60 seconds
- Clerk SDK handles automatic refresh
- Backend should accept recently expired tokens (clock skew)

## Security Notes

1. **Never log full tokens** - only log decoded claims if needed
2. **Always verify in production** - decode-only is for development
3. **Check expiration** - reject expired tokens
4. **Validate issuer** - ensure token is from your Clerk instance
