# Social Stories Standard

## Overview
Ephemeral content system for time-limited stories (24-hour lifespan) with viewer tracking, interactive elements (polls, questions, links), and highlights for permanent archival.

## Domain Context
- **Primary Projects**: Quik Social, Quik Music (artist stories), Quik Events (event stories)
- **Related Domains**: Video, Social Feed, Events
- **Key Integration**: CDN (media delivery), Redis (real-time), Stream Activity

## Core Interfaces

```typescript
interface Story {
  id: string;
  authorId: string;
  author: StoryAuthor;
  type: StoryType;
  media: StoryMedia;
  overlay?: StoryOverlay;
  interactive?: InteractiveElement;
  visibility: 'public' | 'followers' | 'close_friends';
  viewCount: number;
  replyCount: number;
  expiresAt: Date;
  isHighlighted: boolean;
  highlightId?: string;
  createdAt: Date;
}

type StoryType = 'image' | 'video' | 'text' | 'music' | 'live';

interface StoryMedia {
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  width: number;
  height: number;
  blurhash?: string;
}

interface StoryOverlay {
  text?: TextOverlay[];
  stickers?: Sticker[];
  mentions?: MentionTag[];
  location?: LocationTag;
  hashtags?: HashtagTag[];
  links?: LinkSticker[];
  music?: MusicOverlay;
}

interface InteractiveElement {
  type: 'poll' | 'question' | 'quiz' | 'slider' | 'countdown';
  data: PollData | QuestionData | QuizData | SliderData | CountdownData;
  responses: InteractiveResponse[];
}

interface StoryView {
  storyId: string;
  viewerId: string;
  viewerName: string;
  viewerAvatar: string;
  viewedAt: Date;
  duration: number;
  reacted?: string;
}

interface StoryHighlight {
  id: string;
  userId: string;
  title: string;
  coverImage: string;
  storyIds: string[];
  storyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StoryReel {
  userId: string;
  user: StoryAuthor;
  stories: Story[];
  hasUnviewed: boolean;
  lastStoryAt: Date;
}
```

## Key Features
- 24-hour expiration with countdown
- Interactive polls, questions, quizzes, sliders
- Music overlays with song attribution
- Mention and hashtag tagging
- Link stickers for external URLs
- Close friends list for private stories
- Highlights for permanent archival
- View tracking with viewer list
- Reply via DM integration

## Database Schema

```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  media JSONB NOT NULL,
  overlay JSONB,
  interactive JSONB,
  visibility VARCHAR(20) DEFAULT 'public',
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_highlighted BOOLEAN DEFAULT false,
  highlight_id UUID REFERENCES story_highlights(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE story_views (
  id UUID PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id),
  viewer_id UUID NOT NULL REFERENCES users(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER,
  reaction VARCHAR(50),
  UNIQUE(story_id, viewer_id)
);

CREATE TABLE story_highlights (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  cover_image TEXT,
  story_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE close_friends (
  user_id UUID NOT NULL REFERENCES users(id),
  friend_id UUID NOT NULL REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, friend_id)
);

CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_expires ON stories(expires_at);
CREATE INDEX idx_story_views_story ON story_views(story_id);
```

## Related Skills
- `social-feed-standard.md` - Main feed integration
- `social-messaging-standard.md` - Story reply via DM
- `short-video-standard.md` - Video story processing

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Social
