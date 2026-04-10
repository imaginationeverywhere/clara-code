# Social Networking Standard

## Overview
Social graph management for follow/follower relationships, friend suggestions, mutual connections, blocking, and network analytics. Powers the social connectivity across all Quik platforms.

## Domain Context
- **Primary Projects**: Quik Social, all Quik platforms with social features
- **Related Domains**: Social Feed, Profiles, Messaging
- **Key Integration**: Stream Activity Feeds, Graph Database (Neo4j optional), Redis

## Core Interfaces

```typescript
interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  status: FollowStatus;
  notificationsEnabled: boolean;
  createdAt: Date;
  approvedAt?: Date;
}

type FollowStatus = 'active' | 'pending' | 'blocked';

interface FollowRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  respondedAt?: Date;
}

interface UserConnection {
  user: ConnectionUser;
  relationship: RelationshipType;
  mutualFollowers: number;
  mutualFollowersList?: ConnectionUser[];
  followedAt?: Date;
}

interface ConnectionUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  bio?: string;
}

type RelationshipType =
  | 'following'
  | 'followed_by'
  | 'mutual'
  | 'blocked'
  | 'blocked_by'
  | 'none';

interface BlockedUser {
  userId: string;
  blockedUserId: string;
  reason?: string;
  blockedAt: Date;
}

interface MutedUser {
  userId: string;
  mutedUserId: string;
  mutePosts: boolean;
  muteStories: boolean;
  muteNotifications: boolean;
  mutedAt: Date;
}

interface SuggestedConnection {
  user: ConnectionUser;
  reason: SuggestionReason;
  score: number;
  mutualFollowers: ConnectionUser[];
  mutualCount: number;
}

type SuggestionReason =
  | 'mutual_followers'
  | 'contacts'
  | 'similar_interests'
  | 'location'
  | 'popular'
  | 'new_to_platform';

interface NetworkStats {
  userId: string;
  followers: number;
  following: number;
  mutualConnections: number;
  reach: number;
  networkGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface FollowersList {
  users: UserConnection[];
  total: number;
  cursor?: string;
  hasMore: boolean;
}
```

## Key Features
- Follow/unfollow with request approval for private accounts
- Mutual followers detection
- Block and mute functionality
- Friend suggestions based on:
  - Mutual connections
  - Contact sync
  - Similar interests
  - Location proximity
  - Platform popularity
- Follower/following lists with search
- Follow notifications with controls
- Network analytics and growth tracking
- Bulk follow import from contacts
- Follow recommendations feed

## Database Schema

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id),
  following_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  UNIQUE(follower_id, following_id)
);

CREATE TABLE follow_requests (
  id UUID PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(from_user_id, to_user_id)
);

CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  blocked_user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE mutes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  muted_user_id UUID NOT NULL REFERENCES users(id),
  mute_posts BOOLEAN DEFAULT true,
  mute_stories BOOLEAN DEFAULT true,
  mute_notifications BOOLEAN DEFAULT true,
  muted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, muted_user_id)
);

CREATE TABLE contact_syncs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  contact_hash VARCHAR(64) NOT NULL,
  matched_user_id UUID REFERENCES users(id),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_follows_follower ON follows(follower_id, status);
CREATE INDEX idx_follows_following ON follows(following_id, status);
CREATE INDEX idx_follow_requests_to ON follow_requests(to_user_id, status);
CREATE INDEX idx_blocks_user ON blocks(user_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_user_id);
CREATE INDEX idx_mutes_user ON mutes(user_id);

-- Materialized view for mutual followers (refresh periodically)
CREATE MATERIALIZED VIEW mutual_followers AS
SELECT
  f1.follower_id as user_a,
  f2.follower_id as user_b,
  COUNT(*) as mutual_count
FROM follows f1
JOIN follows f2 ON f1.following_id = f2.following_id
WHERE f1.follower_id < f2.follower_id
  AND f1.status = 'active'
  AND f2.status = 'active'
GROUP BY f1.follower_id, f2.follower_id;
```

## Service Methods

```typescript
class SocialNetworkingService {
  // Follow user
  async follow(followerId: string, followingId: string): Promise<FollowRelationship>;

  // Unfollow user
  async unfollow(followerId: string, followingId: string): Promise<void>;

  // Accept/decline follow request
  async respondToFollowRequest(requestId: string, accept: boolean): Promise<void>;

  // Get followers list
  async getFollowers(userId: string, cursor?: string, limit?: number): Promise<FollowersList>;

  // Get following list
  async getFollowing(userId: string, cursor?: string, limit?: number): Promise<FollowersList>;

  // Get mutual followers
  async getMutualFollowers(userIdA: string, userIdB: string): Promise<ConnectionUser[]>;

  // Get relationship between users
  async getRelationship(viewerId: string, targetId: string): Promise<RelationshipType>;

  // Block user
  async blockUser(userId: string, blockedId: string, reason?: string): Promise<void>;

  // Unblock user
  async unblockUser(userId: string, blockedId: string): Promise<void>;

  // Mute user
  async muteUser(userId: string, mutedId: string, options: MuteOptions): Promise<void>;

  // Get suggested connections
  async getSuggestedConnections(userId: string, limit?: number): Promise<SuggestedConnection[]>;

  // Sync contacts for suggestions
  async syncContacts(userId: string, contactHashes: string[]): Promise<ConnectionUser[]>;

  // Get network stats
  async getNetworkStats(userId: string): Promise<NetworkStats>;
}
```

## API Endpoints

```typescript
// POST /api/users/:id/follow - Follow user
// DELETE /api/users/:id/follow - Unfollow user
// GET /api/users/:id/followers - Get followers
// GET /api/users/:id/following - Get following
// GET /api/users/:id/mutual - Get mutual followers with viewer
// POST /api/follow-requests/:id/accept - Accept request
// POST /api/follow-requests/:id/decline - Decline request
// GET /api/follow-requests - Get pending requests
// POST /api/users/:id/block - Block user
// DELETE /api/users/:id/block - Unblock user
// POST /api/users/:id/mute - Mute user
// DELETE /api/users/:id/mute - Unmute user
// GET /api/suggestions/users - Get suggested connections
// POST /api/contacts/sync - Sync contacts
// GET /api/network/stats - Get network statistics
```

## Related Skills
- `social-profiles-standard.md` - User profiles
- `social-feed-standard.md` - Feed based on follows
- `social-messaging-standard.md` - DM permissions

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Social
