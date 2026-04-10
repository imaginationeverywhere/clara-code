# Social Feed Standard

## Overview
Social media feed system with algorithmic content ranking, infinite scroll, engagement tracking, and personalized recommendations. Supports TikTok-style For You Page and Instagram-style chronological feeds.

## Domain Context
- **Primary Projects**: Quik Social, Quik Music (artist feeds), Quik Events (event updates)
- **Related Domains**: Video (short-form), Music (artist content), Events (announcements)
- **Key Integration**: Stream Activity Feeds, Redis (caching), ML Recommendations

## Core Interfaces

### Posts & Content
```typescript
interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  type: PostType;
  content: PostContent;
  visibility: PostVisibility;
  engagement: EngagementMetrics;
  metadata: PostMetadata;
  tags: string[];
  mentions: string[];
  hashtags: string[];
  location?: PostLocation;
  scheduledAt?: Date;
  publishedAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
}

type PostType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'link'
  | 'poll'
  | 'story'
  | 'repost'
  | 'quote';

interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followedByViewer?: boolean;
}

interface PostContent {
  text?: string;
  media?: MediaItem[];
  link?: LinkPreview;
  poll?: PollContent;
  repostId?: string;          // Original post ID for reposts
  quotedPost?: Post;          // For quote posts
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;          // For video/audio
  altText?: string;
  blurhash?: string;          // Placeholder blur
}

interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

interface PollContent {
  question: string;
  options: PollOption[];
  endsAt: Date;
  multipleChoice: boolean;
  totalVotes: number;
  viewerVote?: string[];
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

type PostVisibility =
  | 'public'
  | 'followers'
  | 'mutual_followers'
  | 'mentioned'
  | 'private';

interface PostLocation {
  name: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

interface PostMetadata {
  source: 'web' | 'ios' | 'android' | 'api';
  clientVersion?: string;
  replyTo?: string;
  threadId?: string;
  sensitiveContent: boolean;
  spoilerText?: string;
}
```

### Engagement
```typescript
interface EngagementMetrics {
  likes: number;
  reposts: number;
  quotes: number;
  replies: number;
  views: number;
  shares: number;
  saves: number;
  viewerLiked: boolean;
  viewerReposted: boolean;
  viewerSaved: boolean;
}

interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

interface Repost {
  id: string;
  originalPostId: string;
  userId: string;
  comment?: string;         // For quote reposts
  createdAt: Date;
}

interface Share {
  id: string;
  postId: string;
  userId: string;
  destination: 'dm' | 'external' | 'story';
  recipientId?: string;
  platform?: string;        // For external shares
  createdAt: Date;
}

interface Save {
  id: string;
  postId: string;
  userId: string;
  collectionId?: string;
  createdAt: Date;
}

interface SaveCollection {
  id: string;
  userId: string;
  name: string;
  isPrivate: boolean;
  coverImage?: string;
  postCount: number;
  createdAt: Date;
}
```

### Feed & Timeline
```typescript
interface Feed {
  posts: Post[];
  cursor?: string;
  hasMore: boolean;
  feedType: FeedType;
  refreshToken?: string;
}

type FeedType =
  | 'home'                    // Following + recommendations
  | 'for_you'                 // Algorithmic recommendations
  | 'following'               // Chronological following
  | 'user'                    // Specific user's posts
  | 'hashtag'                 // Posts with hashtag
  | 'explore'                 // Trending/discovery
  | 'saved'                   // User's saved posts
  | 'liked';                  // User's liked posts

interface FeedRequest {
  type: FeedType;
  userId?: string;
  hashtag?: string;
  cursor?: string;
  limit: number;
  includeReplies: boolean;
  includeReposts: boolean;
}

interface FeedAlgorithmConfig {
  weights: {
    recency: number;
    engagement: number;
    relevance: number;
    authorAffinity: number;
    contentType: number;
    diversity: number;
  };
  decayHalfLife: number;      // Hours for time decay
  maxAge: number;             // Max post age in hours
  diversityWindow: number;    // Posts before same author can appear
}

interface ContentSignal {
  userId: string;
  postId: string;
  signal: SignalType;
  strength: number;
  timestamp: Date;
}

type SignalType =
  | 'view'
  | 'view_long'               // Extended view time
  | 'like'
  | 'comment'
  | 'share'
  | 'save'
  | 'profile_visit'
  | 'follow_after_view'
  | 'skip'
  | 'hide'
  | 'report';
```

### Trending & Discovery
```typescript
interface TrendingTopic {
  id: string;
  type: 'hashtag' | 'keyword' | 'event';
  name: string;
  displayName: string;
  postCount: number;
  category?: string;
  description?: string;
  trendingScore: number;
  peakTime: Date;
  region?: string;
}

interface ExploreSection {
  id: string;
  title: string;
  type: ExploreSectionType;
  posts: Post[];
  seeMoreLink?: string;
}

type ExploreSectionType =
  | 'trending'
  | 'for_you'
  | 'category'
  | 'local'
  | 'following_likes'
  | 'suggested_users';

interface SuggestedUser {
  user: PostAuthor;
  reason: SuggestionReason;
  mutualFollowers: number;
  mutualFollowersList?: PostAuthor[];
}

type SuggestionReason =
  | 'mutual_followers'
  | 'similar_interests'
  | 'popular_in_network'
  | 'new_to_platform'
  | 'similar_content';
```

## Service Implementation

### Feed Service
```typescript
import { StreamClient } from 'getstream';

export class SocialFeedService {
  private streamClient: StreamClient;
  private redis: Redis;

  constructor(streamApiKey: string, streamApiSecret: string, redis: Redis) {
    this.streamClient = new StreamClient(streamApiKey, streamApiSecret);
    this.redis = redis;
  }

  // Create post
  async createPost(
    authorId: string,
    type: PostType,
    content: PostContent,
    visibility: PostVisibility = 'public',
    options?: {
      scheduledAt?: Date;
      location?: PostLocation;
      sensitiveContent?: boolean;
      spoilerText?: string;
      replyTo?: string;
    }
  ): Promise<Post> {
    // Parse mentions and hashtags from text
    const mentions = this.extractMentions(content.text || '');
    const hashtags = this.extractHashtags(content.text || '');

    const post: Post = {
      id: crypto.randomUUID(),
      authorId,
      author: await this.getAuthor(authorId),
      type,
      content,
      visibility,
      engagement: {
        likes: 0,
        reposts: 0,
        quotes: 0,
        replies: 0,
        views: 0,
        shares: 0,
        saves: 0,
        viewerLiked: false,
        viewerReposted: false,
        viewerSaved: false,
      },
      metadata: {
        source: 'api',
        sensitiveContent: options?.sensitiveContent || false,
        spoilerText: options?.spoilerText,
        replyTo: options?.replyTo,
      },
      tags: [],
      mentions,
      hashtags,
      location: options?.location,
      scheduledAt: options?.scheduledAt,
      publishedAt: options?.scheduledAt || new Date(),
      createdAt: new Date(),
    };

    // Handle threading
    if (options?.replyTo) {
      const parentPost = await this.getPost(options.replyTo);
      post.metadata.threadId = parentPost.metadata.threadId || parentPost.id;
    }

    await this.savePost(post);

    // Add to author's feed
    if (!options?.scheduledAt) {
      await this.addToFeed(post);

      // Notify mentioned users
      for (const mention of mentions) {
        await this.notifyMention(mention, post);
      }

      // Update hashtag counts
      for (const hashtag of hashtags) {
        await this.incrementHashtagCount(hashtag);
      }
    }

    return post;
  }

  // Get feed
  async getFeed(
    viewerId: string,
    request: FeedRequest
  ): Promise<Feed> {
    let posts: Post[];

    switch (request.type) {
      case 'home':
        posts = await this.getHomeFeed(viewerId, request);
        break;
      case 'for_you':
        posts = await this.getForYouFeed(viewerId, request);
        break;
      case 'following':
        posts = await this.getFollowingFeed(viewerId, request);
        break;
      case 'user':
        posts = await this.getUserFeed(request.userId!, viewerId, request);
        break;
      case 'hashtag':
        posts = await this.getHashtagFeed(request.hashtag!, viewerId, request);
        break;
      case 'explore':
        posts = await this.getExploreFeed(viewerId, request);
        break;
      default:
        posts = [];
    }

    // Enrich with viewer context
    posts = await this.enrichWithViewerContext(posts, viewerId);

    // Record view signals
    await this.recordFeedViews(viewerId, posts);

    return {
      posts,
      cursor: posts.length > 0 ? posts[posts.length - 1].id : undefined,
      hasMore: posts.length === request.limit,
      feedType: request.type,
    };
  }

  // Home feed (mixed following + recommendations)
  private async getHomeFeed(
    viewerId: string,
    request: FeedRequest
  ): Promise<Post[]> {
    // Get following posts
    const followingPosts = await this.getFollowingFeed(viewerId, {
      ...request,
      limit: Math.ceil(request.limit * 0.7),
    });

    // Get recommended posts
    const recommendedPosts = await this.getForYouFeed(viewerId, {
      ...request,
      limit: Math.ceil(request.limit * 0.3),
    });

    // Interleave and dedupe
    const allPosts = this.interleavePosts(followingPosts, recommendedPosts);

    return allPosts.slice(0, request.limit);
  }

  // For You feed (algorithmic)
  private async getForYouFeed(
    viewerId: string,
    request: FeedRequest
  ): Promise<Post[]> {
    const config = await this.getAlgorithmConfig();

    // Get candidate posts
    const candidates = await this.getCandidatePosts(viewerId, request.limit * 3);

    // Score each post
    const scoredPosts = await Promise.all(
      candidates.map(async post => ({
        post,
        score: await this.calculatePostScore(post, viewerId, config),
      }))
    );

    // Sort by score
    scoredPosts.sort((a, b) => b.score - a.score);

    // Apply diversity
    const diversePosts = this.applyDiversity(
      scoredPosts.map(sp => sp.post),
      config.diversityWindow
    );

    return diversePosts.slice(0, request.limit);
  }

  // Calculate algorithmic score for a post
  private async calculatePostScore(
    post: Post,
    viewerId: string,
    config: FeedAlgorithmConfig
  ): Promise<number> {
    const now = Date.now();
    const postAge = (now - post.publishedAt.getTime()) / (1000 * 60 * 60); // hours

    // Time decay
    const recencyScore = Math.exp(-postAge / config.decayHalfLife);

    // Engagement score (normalized)
    const engagementScore = this.normalizeEngagement(post.engagement);

    // Author affinity (how much viewer engages with this author)
    const authorAffinity = await this.getAuthorAffinity(viewerId, post.authorId);

    // Content type preference
    const contentTypeScore = await this.getContentTypePreference(viewerId, post.type);

    // Relevance (based on interests and signals)
    const relevanceScore = await this.calculateRelevance(viewerId, post);

    // Combine scores
    const score =
      config.weights.recency * recencyScore +
      config.weights.engagement * engagementScore +
      config.weights.authorAffinity * authorAffinity +
      config.weights.contentType * contentTypeScore +
      config.weights.relevance * relevanceScore;

    return score;
  }

  // Following feed (chronological)
  private async getFollowingFeed(
    viewerId: string,
    request: FeedRequest
  ): Promise<Post[]> {
    const following = await this.getFollowing(viewerId);

    // Get posts from Stream
    const userFeed = this.streamClient.feed('timeline', viewerId);
    const activities = await userFeed.get({
      limit: request.limit,
      id_lt: request.cursor,
    });

    const posts = await Promise.all(
      activities.results.map(activity => this.activityToPost(activity))
    );

    // Filter based on request options
    return posts.filter(post => {
      if (!request.includeReplies && post.metadata.replyTo) return false;
      if (!request.includeReposts && post.type === 'repost') return false;
      return true;
    });
  }

  // Like post
  async likePost(postId: string, userId: string): Promise<EngagementMetrics> {
    const post = await this.getPost(postId);

    // Check if already liked
    const existingLike = await this.getLike(postId, userId);
    if (existingLike) {
      throw new Error('Already liked');
    }

    const like: Like = {
      id: crypto.randomUUID(),
      postId,
      userId,
      createdAt: new Date(),
    };

    await this.saveLike(like);

    // Update engagement count
    post.engagement.likes++;
    await this.updatePostEngagement(post);

    // Add to Stream for feed aggregation
    const reactionsFeed = this.streamClient.feed('user', userId);
    await reactionsFeed.addActivity({
      actor: userId,
      verb: 'like',
      object: postId,
      foreign_id: `like:${like.id}`,
      time: like.createdAt.toISOString(),
    });

    // Notify post author
    if (post.authorId !== userId) {
      await this.notifyLike(post.authorId, userId, post);
    }

    // Record signal
    await this.recordSignal(userId, postId, 'like', 1);

    return post.engagement;
  }

  // Unlike post
  async unlikePost(postId: string, userId: string): Promise<EngagementMetrics> {
    const like = await this.getLike(postId, userId);
    if (!like) {
      throw new Error('Not liked');
    }

    await this.deleteLike(like.id);

    const post = await this.getPost(postId);
    post.engagement.likes = Math.max(0, post.engagement.likes - 1);
    await this.updatePostEngagement(post);

    // Remove from Stream
    const reactionsFeed = this.streamClient.feed('user', userId);
    await reactionsFeed.removeActivity({ foreignId: `like:${like.id}` });

    return post.engagement;
  }

  // Repost
  async repostPost(
    postId: string,
    userId: string,
    comment?: string
  ): Promise<Post> {
    const originalPost = await this.getPost(postId);

    // Prevent self-repost
    if (originalPost.authorId === userId) {
      throw new Error('Cannot repost own post');
    }

    // Check if already reposted
    const existingRepost = await this.getUserRepost(postId, userId);
    if (existingRepost) {
      throw new Error('Already reposted');
    }

    const repostType = comment ? 'quote' : 'repost';

    const repost = await this.createPost(
      userId,
      repostType,
      {
        text: comment,
        repostId: postId,
        quotedPost: repostType === 'quote' ? originalPost : undefined,
      },
      'public'
    );

    // Update original post engagement
    if (repostType === 'quote') {
      originalPost.engagement.quotes++;
    } else {
      originalPost.engagement.reposts++;
    }
    await this.updatePostEngagement(originalPost);

    // Notify original author
    if (originalPost.authorId !== userId) {
      await this.notifyRepost(originalPost.authorId, userId, originalPost, repostType);
    }

    return repost;
  }

  // Reply to post
  async replyToPost(
    postId: string,
    authorId: string,
    content: PostContent
  ): Promise<Post> {
    const parentPost = await this.getPost(postId);

    const reply = await this.createPost(
      authorId,
      'text',
      content,
      parentPost.visibility,
      { replyTo: postId }
    );

    // Update parent engagement
    parentPost.engagement.replies++;
    await this.updatePostEngagement(parentPost);

    // Notify parent author
    if (parentPost.authorId !== authorId) {
      await this.notifyReply(parentPost.authorId, authorId, parentPost, reply);
    }

    return reply;
  }

  // Save post
  async savePost(postId: string, userId: string, collectionId?: string): Promise<Save> {
    const existingSave = await this.getSave(postId, userId);
    if (existingSave) {
      throw new Error('Already saved');
    }

    const save: Save = {
      id: crypto.randomUUID(),
      postId,
      userId,
      collectionId,
      createdAt: new Date(),
    };

    await this.persistSave(save);

    const post = await this.getPost(postId);
    post.engagement.saves++;
    await this.updatePostEngagement(post);

    // Record signal
    await this.recordSignal(userId, postId, 'save', 1.5);

    return save;
  }

  // Record view
  async recordView(
    postId: string,
    userId: string,
    duration: number
  ): Promise<void> {
    const post = await this.getPost(postId);

    // Update view count
    await this.incrementViewCount(postId);

    // Record signal based on view duration
    const signalType: SignalType = duration > 5000 ? 'view_long' : 'view';
    const strength = Math.min(duration / 10000, 1); // Max strength at 10 seconds

    await this.recordSignal(userId, postId, signalType, strength);
  }

  // Get trending topics
  async getTrendingTopics(
    region?: string,
    limit: number = 10
  ): Promise<TrendingTopic[]> {
    const cacheKey = `trending:${region || 'global'}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate trending
    const topics = await this.calculateTrendingTopics(region);

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(topics.slice(0, limit)));

    return topics.slice(0, limit);
  }

  // Vote on poll
  async votePoll(
    postId: string,
    userId: string,
    optionIds: string[]
  ): Promise<PollContent> {
    const post = await this.getPost(postId);

    if (post.type !== 'poll' || !post.content.poll) {
      throw new Error('Post is not a poll');
    }

    const poll = post.content.poll;

    if (new Date() > poll.endsAt) {
      throw new Error('Poll has ended');
    }

    if (!poll.multipleChoice && optionIds.length > 1) {
      throw new Error('Only one option allowed');
    }

    // Check if already voted
    if (poll.viewerVote) {
      throw new Error('Already voted');
    }

    // Record vote
    await this.savePollVote(postId, userId, optionIds);

    // Update counts
    for (const optionId of optionIds) {
      const option = poll.options.find(o => o.id === optionId);
      if (option) {
        option.votes++;
      }
    }
    poll.totalVotes++;

    // Recalculate percentages
    for (const option of poll.options) {
      option.percentage = Math.round((option.votes / poll.totalVotes) * 100);
    }

    poll.viewerVote = optionIds;

    await this.updatePostContent(post);

    return poll;
  }

  // Search posts
  async searchPosts(
    query: string,
    viewerId: string,
    options?: {
      type?: PostType;
      from?: string;
      since?: Date;
      until?: Date;
      hasMedia?: boolean;
      limit?: number;
      cursor?: string;
    }
  ): Promise<Feed> {
    // Implementation would use Elasticsearch or similar
    const posts = await this.searchPostsInIndex(query, options);

    return {
      posts: await this.enrichWithViewerContext(posts, viewerId),
      cursor: posts.length > 0 ? posts[posts.length - 1].id : undefined,
      hasMore: posts.length === (options?.limit || 20),
      feedType: 'explore',
    };
  }

  // Helper methods
  private extractMentions(text: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = text.matchAll(mentionRegex);
    return Array.from(matches, m => m[1]);
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = text.matchAll(hashtagRegex);
    return Array.from(matches, m => m[1].toLowerCase());
  }

  private interleavePosts(primary: Post[], secondary: Post[]): Post[] {
    const result: Post[] = [];
    const seenIds = new Set<string>();

    let i = 0, j = 0;
    let insertSecondary = false;

    while (i < primary.length || j < secondary.length) {
      if (insertSecondary && j < secondary.length) {
        if (!seenIds.has(secondary[j].id)) {
          result.push(secondary[j]);
          seenIds.add(secondary[j].id);
        }
        j++;
      } else if (i < primary.length) {
        if (!seenIds.has(primary[i].id)) {
          result.push(primary[i]);
          seenIds.add(primary[i].id);
        }
        i++;
      }

      // Insert recommendation every 3-4 posts
      if (i % 4 === 3) {
        insertSecondary = true;
      } else {
        insertSecondary = false;
      }
    }

    return result;
  }

  private applyDiversity(posts: Post[], window: number): Post[] {
    const result: Post[] = [];
    const recentAuthors: string[] = [];

    for (const post of posts) {
      if (!recentAuthors.includes(post.authorId)) {
        result.push(post);
        recentAuthors.push(post.authorId);
        if (recentAuthors.length > window) {
          recentAuthors.shift();
        }
      }
    }

    return result;
  }

  private normalizeEngagement(engagement: EngagementMetrics): number {
    // Weighted sum of engagement metrics
    const score =
      engagement.likes * 1 +
      engagement.reposts * 2 +
      engagement.quotes * 2.5 +
      engagement.replies * 3 +
      engagement.saves * 2 +
      engagement.shares * 1.5;

    // Logarithmic normalization
    return Math.log10(score + 1) / 5;
  }

  // Database methods (implementations needed)
  private async getPost(id: string): Promise<Post> {
    throw new Error('Not implemented');
  }

  private async savePost(post: Post): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getAuthor(userId: string): Promise<PostAuthor> {
    throw new Error('Not implemented');
  }

  private async addToFeed(post: Post): Promise<void> {
    throw new Error('Not implemented');
  }

  private async enrichWithViewerContext(posts: Post[], viewerId: string): Promise<Post[]> {
    throw new Error('Not implemented');
  }

  private async recordFeedViews(viewerId: string, posts: Post[]): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getFollowing(userId: string): Promise<string[]> {
    throw new Error('Not implemented');
  }

  private async activityToPost(activity: any): Promise<Post> {
    throw new Error('Not implemented');
  }

  private async getAlgorithmConfig(): Promise<FeedAlgorithmConfig> {
    throw new Error('Not implemented');
  }

  private async getCandidatePosts(viewerId: string, limit: number): Promise<Post[]> {
    throw new Error('Not implemented');
  }

  private async getAuthorAffinity(viewerId: string, authorId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  private async getContentTypePreference(viewerId: string, type: PostType): Promise<number> {
    throw new Error('Not implemented');
  }

  private async calculateRelevance(viewerId: string, post: Post): Promise<number> {
    throw new Error('Not implemented');
  }

  private async getLike(postId: string, userId: string): Promise<Like | null> {
    throw new Error('Not implemented');
  }

  private async saveLike(like: Like): Promise<void> {
    throw new Error('Not implemented');
  }

  private async deleteLike(likeId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async updatePostEngagement(post: Post): Promise<void> {
    throw new Error('Not implemented');
  }

  private async recordSignal(userId: string, postId: string, type: SignalType, strength: number): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getUserRepost(postId: string, userId: string): Promise<Post | null> {
    throw new Error('Not implemented');
  }

  private async getSave(postId: string, userId: string): Promise<Save | null> {
    throw new Error('Not implemented');
  }

  private async persistSave(save: Save): Promise<void> {
    throw new Error('Not implemented');
  }

  private async incrementViewCount(postId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async calculateTrendingTopics(region?: string): Promise<TrendingTopic[]> {
    throw new Error('Not implemented');
  }

  private async savePollVote(postId: string, userId: string, optionIds: string[]): Promise<void> {
    throw new Error('Not implemented');
  }

  private async updatePostContent(post: Post): Promise<void> {
    throw new Error('Not implemented');
  }

  private async searchPostsInIndex(query: string, options?: any): Promise<Post[]> {
    throw new Error('Not implemented');
  }

  private async notifyMention(username: string, post: Post): Promise<void> {
    throw new Error('Not implemented');
  }

  private async incrementHashtagCount(hashtag: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyLike(authorId: string, likerId: string, post: Post): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyRepost(authorId: string, reposterId: string, post: Post, type: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyReply(authorId: string, replierId: string, post: Post, reply: Post): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

## Database Schema

```sql
-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'public',
  tags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  location JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  reply_to UUID REFERENCES posts(id),
  thread_id UUID,
  repost_of UUID REFERENCES posts(id),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post engagement counts (denormalized for performance)
CREATE TABLE post_engagement (
  post_id UUID PRIMARY KEY REFERENCES posts(id),
  likes INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  quotes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Saves
CREATE TABLE post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  collection_id UUID REFERENCES save_collections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Save collections
CREATE TABLE save_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  is_private BOOLEAN DEFAULT false,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll votes
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  option_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Content signals (for recommendations)
CREATE TABLE content_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id),
  signal_type VARCHAR(30) NOT NULL,
  strength DECIMAL(3, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hashtag counts
CREATE TABLE hashtag_stats (
  hashtag VARCHAR(255) PRIMARY KEY,
  post_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending topics (cached)
CREATE TABLE trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  post_count INTEGER DEFAULT 0,
  category VARCHAR(100),
  trending_score DECIMAL(10, 4) NOT NULL,
  region VARCHAR(10),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_thread ON posts(thread_id);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_likes_post ON post_likes(post_id);
CREATE INDEX idx_likes_user ON post_likes(user_id);
CREATE INDEX idx_saves_user ON post_saves(user_id);
CREATE INDEX idx_signals_user ON content_signals(user_id);
CREATE INDEX idx_signals_post ON content_signals(post_id);
CREATE INDEX idx_signals_created ON content_signals(created_at DESC);
CREATE INDEX idx_trending_region ON trending_topics(region, trending_score DESC);
```

## API Endpoints

```typescript
// POST /api/posts
// Create post
{
  request: {
    type: PostType,
    content: PostContent,
    visibility?: PostVisibility,
    scheduledAt?: string,
    location?: PostLocation
  },
  response: Post
}

// GET /api/feed
// Get feed
{
  query: {
    type: FeedType,
    userId?: string,
    hashtag?: string,
    cursor?: string,
    limit?: number
  },
  response: Feed
}

// POST /api/posts/:id/like
// Like post
{
  response: EngagementMetrics
}

// DELETE /api/posts/:id/like
// Unlike post
{
  response: EngagementMetrics
}

// POST /api/posts/:id/repost
// Repost
{
  request: { comment?: string },
  response: Post
}

// POST /api/posts/:id/reply
// Reply to post
{
  request: { content: PostContent },
  response: Post
}

// POST /api/posts/:id/save
// Save post
{
  request: { collectionId?: string },
  response: Save
}

// POST /api/posts/:id/view
// Record view
{
  request: { duration: number },
  response: { success: boolean }
}

// GET /api/trending
// Get trending topics
{
  query: { region?: string, limit?: number },
  response: { topics: TrendingTopic[] }
}

// POST /api/posts/:id/poll/vote
// Vote on poll
{
  request: { optionIds: string[] },
  response: PollContent
}

// GET /api/search/posts
// Search posts
{
  query: {
    q: string,
    type?: PostType,
    since?: string,
    until?: string,
    hasMedia?: boolean
  },
  response: Feed
}
```

## Related Skills
- `social-stories-standard.md` - Ephemeral content
- `social-messaging-standard.md` - Direct messages
- `social-profiles-standard.md` - User profiles
- `short-video-standard.md` - Video post handling

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Social
