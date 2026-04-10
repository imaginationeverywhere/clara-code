# Social Profiles Standard

## Overview
User profile system with customizable bios, profile/cover photos, verification badges, profile analytics, and account settings. Supports creator and business account types.

## Domain Context
- **Primary Projects**: Quik Social, Quik Music (artist profiles), all Quik platforms
- **Related Domains**: All social features, Authentication
- **Key Integration**: Clerk Auth, Image CDN, Verification Systems

## Core Interfaces

```typescript
interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar: string;
  coverPhoto?: string;
  website?: string;
  location?: string;
  birthDate?: Date;
  accountType: AccountType;
  verification: VerificationStatus;
  stats: ProfileStats;
  settings: ProfileSettings;
  links: ProfileLink[];
  badges: ProfileBadge[];
  pinnedPostId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type AccountType = 'personal' | 'creator' | 'business' | 'organization';

interface VerificationStatus {
  isVerified: boolean;
  verifiedAt?: Date;
  verificationType?: 'notable' | 'government' | 'business' | 'creator';
  verificationBadge?: string;
}

interface ProfileStats {
  followers: number;
  following: number;
  posts: number;
  likes: number;
  mediaCount: number;
}

interface ProfileSettings {
  isPrivate: boolean;
  showActivityStatus: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';
  allowMentions: 'everyone' | 'followers' | 'none';
  allowTagging: 'everyone' | 'followers' | 'none';
  sensitiveContentFilter: boolean;
  twoFactorEnabled: boolean;
}

interface ProfileLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
}

interface ProfileBadge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

type BadgeType = 'verification' | 'achievement' | 'membership' | 'event' | 'creator';

interface CreatorProfile extends UserProfile {
  category: string;
  subcategories: string[];
  contactEmail?: string;
  businessAddress?: string;
  monetization: MonetizationSettings;
  analytics: CreatorAnalytics;
}

interface MonetizationSettings {
  enabled: boolean;
  subscriptionsEnabled: boolean;
  tipsEnabled: boolean;
  exclusiveContentEnabled: boolean;
  stripeAccountId?: string;
}

interface CreatorAnalytics {
  impressions: number;
  reach: number;
  engagementRate: number;
  topPosts: string[];
  audienceDemographics: AudienceDemographics;
  growthRate: number;
}

interface AudienceDemographics {
  ageRanges: Record<string, number>;
  genders: Record<string, number>;
  topLocations: { location: string; percentage: number }[];
  topInterests: string[];
}

interface ProfileEdit {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar?: File;
  coverPhoto?: File;
  links?: ProfileLink[];
}

interface UsernameAvailability {
  username: string;
  available: boolean;
  suggestions?: string[];
}
```

## Key Features
- Customizable profile with bio, links, and media
- Profile and cover photo upload with cropping
- Username reservation and availability check
- Verification badge system
- Account type switching (personal → creator → business)
- Privacy settings granular control
- Profile analytics for creators
- Badge and achievement system
- Pinned post feature
- Link in bio with multiple URLs
- Two-factor authentication
- Account deactivation and deletion

## Database Schema

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  username VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_photo_url TEXT,
  website VARCHAR(255),
  location VARCHAR(100),
  birth_date DATE,
  account_type VARCHAR(20) DEFAULT 'personal',
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_type VARCHAR(20),
  is_private BOOLEAN DEFAULT false,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  pinned_post_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_links (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES user_profiles(id),
  title VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_badges (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES user_profiles(id),
  badge_type VARCHAR(30) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE creator_profiles (
  profile_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  category VARCHAR(100),
  subcategories TEXT[],
  contact_email VARCHAR(255),
  business_address TEXT,
  monetization_enabled BOOLEAN DEFAULT false,
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE username_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  old_username VARCHAR(30) NOT NULL,
  new_username VARCHAR(30) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blocked_usernames (
  username VARCHAR(30) PRIMARY KEY,
  reason VARCHAR(255),
  blocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON user_profiles(username);
CREATE INDEX idx_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_profile_links_profile ON profile_links(profile_id);
CREATE INDEX idx_profile_badges_profile ON profile_badges(profile_id);
```

## API Endpoints

```typescript
// GET /api/profiles/:username - Get profile by username
// GET /api/profiles/me - Get current user profile
// PUT /api/profiles/me - Update profile
// POST /api/profiles/me/avatar - Upload avatar
// POST /api/profiles/me/cover - Upload cover photo
// GET /api/profiles/username/check - Check username availability
// PUT /api/profiles/me/username - Change username
// GET /api/profiles/:id/analytics - Get creator analytics
// POST /api/profiles/me/verify - Request verification
// PUT /api/profiles/me/settings - Update settings
// DELETE /api/profiles/me - Delete account
```

## Related Skills
- `social-networking-standard.md` - Follow/follower relationships
- `social-feed-standard.md` - Profile posts feed
- `social-stories-standard.md` - Profile stories

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Social
