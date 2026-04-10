---
name: social
description: Implement social networking features including user profiles, feeds, messaging, communities, and content sharing. Use when building social apps, community platforms, networking features, or user-generated content systems. Triggers on requests for user profiles, activity feeds, direct messaging, community features, or social engagement.
---

# Social Networking Skills

## Overview

Production-ready patterns for social networking features:
- **User profiles** with customization and portfolios
- **Activity feeds** with timeline and content algorithms
- **Messaging systems** with direct and group chat
- **Community features** with groups and forums

## Available Skills

### social-profile-standard.md
User profile system with:
- Profile customization
- Bio and media galleries
- Follow/friend relationships
- Privacy settings
- Profile verification

### social-feed-standard.md
Activity feed with:
- Chronological and algorithmic feeds
- Post creation and media upload
- Reactions and comments
- Share and repost functionality
- Content moderation

### social-messaging-standard.md
Messaging system with:
- Direct messages
- Group conversations
- Real-time chat
- Read receipts
- Message reactions

### social-community-standard.md
Community features with:
- Groups and communities
- Discussion forums
- Event coordination
- Member management
- Community guidelines

## Implementation Workflow

1. **Design social graph** - Follows, friends, connections
2. **Build feed system** - Timeline with content ranking
3. **Implement messaging** - Real-time chat infrastructure
4. **Create communities** - Group management and moderation
5. **Add engagement** - Reactions, comments, sharing

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Real-time:** Socket.io for messaging and notifications
- **Media:** AWS S3, CloudFront for content delivery
- **Search:** Elasticsearch for content discovery
- **Moderation:** Custom + third-party content moderation
