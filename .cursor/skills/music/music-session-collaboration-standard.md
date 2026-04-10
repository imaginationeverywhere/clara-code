# Music Session Collaboration Standard

Real-time collaboration for music sessions following Slack-like architecture patterns.

## Target Project
- **QuikSession** - Multi-tenant music industry platform

## Architecture Pattern

```
Workspace (Record Label/Studio)
└── Session (Channel - Album/Song/Deal)
    └── Participants (Artists, Producers, Writers, Publishers, A&R, Managers, Lawyers)
```

## Core Components

### 1. Workspace Management
```typescript
interface Workspace {
  id: string;
  name: string;                    // "Def Jam Records", "Atlantic Studios"
  type: 'label' | 'studio' | 'publishing' | 'management';
  ownerId: string;
  settings: WorkspaceSettings;
  branding: WorkspaceBranding;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceSettings {
  defaultSessionVisibility: 'private' | 'workspace' | 'public';
  requireApprovalToJoin: boolean;
  allowGuestParticipants: boolean;
  retentionPolicyDays: number;
}
```

### 2. Session (Channel) Management
```typescript
interface Session {
  id: string;
  workspaceId: string;
  name: string;                    // "Drake - New Album 2025"
  type: 'recording' | 'writing' | 'mixing' | 'mastering' | 'deal' | 'general';
  status: 'active' | 'archived' | 'completed';
  visibility: 'private' | 'workspace';
  participants: SessionParticipant[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionParticipant {
  userId: string;
  role: ParticipantRole;
  permissions: ParticipantPermissions;
  joinedAt: Date;
  invitedBy: string;
}

type ParticipantRole =
  | 'artist'
  | 'producer'
  | 'writer'
  | 'publisher'
  | 'a_and_r'
  | 'manager'
  | 'lawyer'
  | 'engineer'
  | 'label_rep'
  | 'guest';
```

### 3. Real-Time Messaging
```typescript
interface SessionMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'system' | 'mention';
  attachments: MessageAttachment[];
  mentions: string[];              // User IDs mentioned
  threadId?: string;               // For threaded replies
  reactions: MessageReaction[];
  createdAt: Date;
  editedAt?: Date;
}

interface MessageAttachment {
  id: string;
  type: 'audio' | 'document' | 'image' | 'contract';
  url: string;
  name: string;
  size: number;
  metadata: AttachmentMetadata;
}
```

### 4. File Sharing for Music Assets
```typescript
interface MusicAsset {
  id: string;
  sessionId: string;
  type: 'stem' | 'mix' | 'master' | 'demo' | 'reference' | 'contract';
  name: string;
  version: number;
  uploadedBy: string;
  url: string;
  metadata: {
    duration?: number;
    sampleRate?: number;
    bitDepth?: number;
    format?: string;
    bpm?: number;
    key?: string;
  };
  accessControl: AssetAccessControl;
  createdAt: Date;
}

interface AssetAccessControl {
  canDownload: ParticipantRole[];
  canStream: ParticipantRole[];
  canComment: ParticipantRole[];
  watermarkOnDownload: boolean;
}
```

## Implementation Patterns

### WebSocket Connection Management
```typescript
// Session WebSocket handler
export class SessionWebSocketService {
  private connections: Map<string, WebSocket[]> = new Map();

  async joinSession(sessionId: string, userId: string, ws: WebSocket) {
    // Verify user has access to session
    const hasAccess = await this.verifySessionAccess(sessionId, userId);
    if (!hasAccess) throw new UnauthorizedError();

    // Add to connection pool
    const sessionConnections = this.connections.get(sessionId) || [];
    sessionConnections.push(ws);
    this.connections.set(sessionId, sessionConnections);

    // Broadcast join event
    this.broadcastToSession(sessionId, {
      type: 'participant_joined',
      userId,
      timestamp: new Date()
    });
  }

  broadcastToSession(sessionId: string, message: any) {
    const connections = this.connections.get(sessionId) || [];
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
```

### Notification System
```typescript
interface SessionNotification {
  id: string;
  userId: string;
  sessionId: string;
  type: 'message' | 'mention' | 'file_upload' | 'contract_ready' | 'deadline';
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// @mention detection and notification
function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]); // User ID
  }
  return mentions;
}
```

## Database Schema (PostgreSQL)

```sql
-- Workspaces (Labels/Studios)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (Channels)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  visibility VARCHAR(50) DEFAULT 'private',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Participants
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Messages
CREATE TABLE session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text',
  thread_id UUID REFERENCES session_messages(id),
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_sessions_workspace ON sessions(workspace_id);
CREATE INDEX idx_messages_session ON session_messages(session_id);
CREATE INDEX idx_messages_created ON session_messages(created_at DESC);
CREATE INDEX idx_participants_user ON session_participants(user_id);
```

## Integration Points

### Clerk Authentication
- Multi-tenant workspace membership
- Role-based access per session
- OAuth for industry partners

### Twilio (Optional)
- SMS notifications for urgent messages
- Voice conferencing integration

### AWS S3
- Audio file storage with versioning
- Signed URLs for secure access
- Lifecycle policies for archival

## Testing Requirements

- Unit tests for permission logic
- Integration tests for WebSocket messaging
- E2E tests for session workflow
- Load testing for concurrent users

## Related Skills
- `music-contracts-standard` - Contract management
- `music-royalty-standard` - Royalty tracking
- `music-copyright-standard` - Copyright management
