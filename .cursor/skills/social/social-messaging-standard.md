# Social Messaging Standard

## Overview
Direct messaging system supporting 1:1 conversations, group chats, message reactions, read receipts, typing indicators, and media sharing with end-to-end encryption option.

## Domain Context
- **Primary Projects**: Quik Social, Quik Music (artist-fan messaging), Quik Events (attendee chat)
- **Related Domains**: Video (video calls), Social Feed, Stories
- **Key Integration**: Stream Chat, WebSocket, Push Notifications, E2E Encryption

## Core Interfaces

```typescript
interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'request';
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  muted: boolean;
  mutedUntil?: Date;
  pinned: boolean;
  archived: boolean;
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationParticipant {
  userId: string;
  displayName: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  lastReadAt?: Date;
  nickname?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: MessageSender;
  type: MessageType;
  content: MessageContent;
  replyTo?: Message;
  reactions: MessageReaction[];
  readBy: ReadReceipt[];
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  editedAt?: Date;
  deletedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice_note' | 'location' | 'contact' | 'story_reply' | 'post_share' | 'system';

interface MessageContent {
  text?: string;
  media?: MediaAttachment[];
  location?: LocationShare;
  contact?: ContactShare;
  storyId?: string;
  postId?: string;
  systemEvent?: SystemEvent;
}

interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

interface ReadReceipt {
  userId: string;
  readAt: Date;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

interface MessageRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  previewMessage: Message;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Date;
}
```

## Key Features
- Real-time messaging with WebSocket
- Message requests for non-followers
- Read receipts and typing indicators
- Reactions with emoji
- Reply threading
- Message editing and deletion
- Disappearing messages
- Voice notes
- Media sharing with preview
- Story and post sharing
- Group chat with admin controls
- Mute and archive options
- Push notification integration
- Optional E2E encryption

## Database Schema

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  encrypted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member',
  nickname VARCHAR(100),
  muted BOOLEAN DEFAULT false,
  muted_until TIMESTAMPTZ,
  pinned BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  content JSONB NOT NULL,
  reply_to_id UUID REFERENCES messages(id),
  status VARCHAR(20) DEFAULT 'sent',
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_reactions (
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),
  emoji VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(message_id, user_id, emoji)
);

CREATE TABLE message_read_receipts (
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(message_id, user_id)
);

CREATE TABLE message_requests (
  id UUID PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_message_requests_to ON message_requests(to_user_id, status);
```

## WebSocket Events

```typescript
interface MessageEvents {
  'message:new': Message;
  'message:updated': Message;
  'message:deleted': { messageId: string; conversationId: string };
  'message:reaction': { messageId: string; reaction: MessageReaction };
  'typing:start': TypingIndicator;
  'typing:stop': TypingIndicator;
  'read:update': { conversationId: string; userId: string; messageId: string };
  'conversation:updated': Conversation;
}
```

## Related Skills
- `social-feed-standard.md` - Post sharing in messages
- `social-stories-standard.md` - Story replies
- `video-conferencing-standard.md` - Video call from chat

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Social
