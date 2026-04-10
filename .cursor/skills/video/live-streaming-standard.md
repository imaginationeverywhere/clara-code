# Live Streaming Standard

## Overview
Broadcast streaming standard for one-to-many video distribution using HLS/RTMP protocols with Stream.io Video SDK. Supports live events, broadcasts, and real-time viewer engagement.

## Domain Context
- **Primary Projects**: Quik Events (virtual events), Quik Music (live performances), Quik Social (live streaming)
- **Related Domains**: Events, Music, Social
- **Key Integration**: Stream.io Video, HLS, RTMP, CDN

## Core Interfaces

### Livestream
```typescript
interface Livestream {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  status: LivestreamStatus;
  streamSettings: StreamSettings;
  ingestInfo?: IngestInfo;
  playbackInfo?: PlaybackInfo;
  viewerCount: number;
  peakViewerCount: number;
  duration?: number;
  recording?: RecordingConfig;
  chat: ChatConfig;
  monetization?: MonetizationConfig;
  scheduledStart?: Date;
  startedAt?: Date;
  endedAt?: Date;
  thumbnail?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

type LivestreamStatus =
  | 'created'         // Stream created but not started
  | 'scheduled'       // Scheduled for future
  | 'backstage'       // Host preparing, not visible
  | 'live'            // Currently broadcasting
  | 'paused'          // Temporarily paused
  | 'ended'           // Broadcast finished
  | 'failed';         // Technical failure

interface StreamSettings {
  quality: StreamQuality;
  latency: LatencyMode;
  dvr: boolean;                    // Allow viewers to rewind
  dvrWindowMinutes: number;
  maxViewers?: number;
  geoRestrictions?: GeoRestriction[];
  accessControl: AccessControl;
}

type StreamQuality = '720p' | '1080p' | '4k';

type LatencyMode =
  | 'ultra_low'       // ~1-2 seconds (WebRTC)
  | 'low'             // ~3-5 seconds (LL-HLS)
  | 'normal';         // ~10-15 seconds (HLS)

interface GeoRestriction {
  type: 'allow' | 'block';
  countries: string[];  // ISO country codes
}

interface AccessControl {
  type: 'public' | 'unlisted' | 'private' | 'paid';
  password?: string;
  allowedUserIds?: string[];
  ticketRequired?: boolean;
  ticketId?: string;
}
```

### Ingest & Playback
```typescript
interface IngestInfo {
  rtmpUrl: string;
  rtmpStreamKey: string;
  srtUrl?: string;
  webrtcUrl?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'streaming';
  bitrate?: number;
  fps?: number;
  resolution?: string;
  health: StreamHealth;
}

interface StreamHealth {
  status: 'good' | 'fair' | 'poor' | 'critical';
  issues: StreamIssue[];
  metrics: {
    bitrate: number;
    keyframeInterval: number;
    droppedFrames: number;
    networkLatency: number;
  };
}

interface StreamIssue {
  type: 'low_bitrate' | 'dropped_frames' | 'high_latency' | 'unstable_connection';
  severity: 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface PlaybackInfo {
  hlsUrl: string;
  dashUrl?: string;
  webrtcUrl?: string;
  thumbnailUrl?: string;
  qualities: PlaybackQuality[];
  currentQuality: PlaybackQuality;
}

interface PlaybackQuality {
  label: string;         // "1080p", "720p", etc.
  width: number;
  height: number;
  bitrate: number;
  codec: string;
}
```

### Viewer & Engagement
```typescript
interface LivestreamViewer {
  id: string;
  livestreamId: string;
  userId?: string;
  sessionId: string;
  displayName: string;
  avatar?: string;
  joinedAt: Date;
  leftAt?: Date;
  watchDuration: number;
  engagementScore: number;
  location?: {
    country: string;
    region: string;
  };
  device: {
    type: 'mobile' | 'desktop' | 'tv';
    platform: string;
    browser?: string;
  };
}

interface ViewerAnalytics {
  livestreamId: string;
  currentViewers: number;
  peakViewers: number;
  totalUniqueViewers: number;
  averageWatchTime: number;
  viewersByCountry: { country: string; count: number }[];
  viewersByDevice: { device: string; count: number }[];
  engagementMetrics: {
    chatMessages: number;
    reactions: number;
    shares: number;
  };
  timeline: ViewerTimelinePoint[];
}

interface ViewerTimelinePoint {
  timestamp: Date;
  viewers: number;
  chatActivity: number;
}

interface ChatConfig {
  enabled: boolean;
  slowMode: boolean;
  slowModeInterval: number;  // seconds between messages
  subscriberOnly: boolean;
  moderators: string[];
  bannedWords: string[];
  autoModeration: boolean;
}

interface ChatMessage {
  id: string;
  livestreamId: string;
  userId: string;
  displayName: string;
  avatar?: string;
  content: string;
  type: 'message' | 'system' | 'highlight' | 'donation';
  metadata?: Record<string, any>;
  createdAt: Date;
  deletedAt?: Date;
}
```

### Recording & VOD
```typescript
interface RecordingConfig {
  enabled: boolean;
  autoStart: boolean;
  layout: 'full' | 'host_only' | 'custom';
  quality: StreamQuality;
  createVod: boolean;
  vodVisibility: 'public' | 'unlisted' | 'private';
  retentionDays: number;
}

interface LivestreamRecording {
  id: string;
  livestreamId: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  duration: number;
  fileSize: number;
  url?: string;
  downloadUrl?: string;
  vodId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface VOD {
  id: string;
  livestreamId: string;
  title: string;
  description?: string;
  duration: number;
  playbackUrl: string;
  thumbnailUrl?: string;
  visibility: 'public' | 'unlisted' | 'private';
  viewCount: number;
  chapters?: VODChapter[];
  createdAt: Date;
}

interface VODChapter {
  title: string;
  startTime: number;
  endTime: number;
  thumbnail?: string;
}
```

### Monetization
```typescript
interface MonetizationConfig {
  enabled: boolean;
  type: 'free' | 'paid' | 'subscription' | 'ppv';
  price?: number;
  currency?: string;
  subscriptionTierId?: string;
  tipsEnabled: boolean;
  minTipAmount: number;
  superChatEnabled: boolean;
}

interface LivestreamDonation {
  id: string;
  livestreamId: string;
  viewerId: string;
  viewerName: string;
  amount: number;
  currency: string;
  message?: string;
  highlighted: boolean;
  readByHost: boolean;
  createdAt: Date;
}
```

## Service Implementation

### Livestream Service
```typescript
import { StreamClient, Call } from '@stream-io/video-client';

export class LivestreamService {
  private client: StreamClient;

  constructor(apiKey: string, apiSecret: string) {
    this.client = new StreamClient(apiKey, { secret: apiSecret });
  }

  // Create livestream
  async createLivestream(
    hostId: string,
    title: string,
    settings?: Partial<StreamSettings>,
    scheduledStart?: Date
  ): Promise<Livestream> {
    const callId = crypto.randomUUID();

    const call = this.client.video.call('livestream', callId);

    await call.create({
      data: {
        created_by_id: hostId,
        starts_at: scheduledStart?.toISOString(),
        custom: { title },
        settings_override: {
          broadcasting: {
            enabled: true,
            hls: { auto_on: true, quality_tracks: ['1080p', '720p', '480p'] },
          },
          backstage: { enabled: true },
        },
      },
    });

    const livestream: Livestream = {
      id: callId,
      title,
      hostId,
      status: scheduledStart ? 'scheduled' : 'created',
      streamSettings: {
        quality: '1080p',
        latency: 'low',
        dvr: true,
        dvrWindowMinutes: 30,
        accessControl: { type: 'public' },
        ...settings,
      },
      viewerCount: 0,
      peakViewerCount: 0,
      chat: {
        enabled: true,
        slowMode: false,
        slowModeInterval: 0,
        subscriberOnly: false,
        moderators: [],
        bannedWords: [],
        autoModeration: true,
      },
      scheduledStart,
      metadata: {},
      createdAt: new Date(),
    };

    await this.saveLivestream(livestream);

    return livestream;
  }

  // Get RTMP ingest info
  async getIngestInfo(livestreamId: string): Promise<IngestInfo> {
    const call = this.client.video.call('livestream', livestreamId);
    await call.get();

    const rtmpCredentials = await call.getCallIngress();

    return {
      rtmpUrl: rtmpCredentials.rtmp.address,
      rtmpStreamKey: rtmpCredentials.rtmp.stream_key,
      status: 'disconnected',
      health: {
        status: 'good',
        issues: [],
        metrics: {
          bitrate: 0,
          keyframeInterval: 0,
          droppedFrames: 0,
          networkLatency: 0,
        },
      },
    };
  }

  // Start backstage (host preparation)
  async startBackstage(livestreamId: string, hostId: string): Promise<Livestream> {
    const call = this.client.video.call('livestream', livestreamId);

    await call.join({ create: false });

    const livestream = await this.getLivestream(livestreamId);
    livestream.status = 'backstage';
    await this.saveLivestream(livestream);

    return livestream;
  }

  // Go live
  async goLive(livestreamId: string): Promise<Livestream> {
    const call = this.client.video.call('livestream', livestreamId);

    // Exit backstage to go live
    await call.goLive();

    const livestream = await this.getLivestream(livestreamId);
    livestream.status = 'live';
    livestream.startedAt = new Date();
    await this.saveLivestream(livestream);

    // Start recording if configured
    if (livestream.recording?.autoStart) {
      await this.startRecording(livestreamId);
    }

    // Emit live event for notifications
    await this.notifyGoLive(livestream);

    return livestream;
  }

  // Stop live (back to backstage)
  async stopLive(livestreamId: string): Promise<Livestream> {
    const call = this.client.video.call('livestream', livestreamId);

    await call.stopLive();

    const livestream = await this.getLivestream(livestreamId);
    livestream.status = 'backstage';
    await this.saveLivestream(livestream);

    return livestream;
  }

  // End livestream
  async endLivestream(livestreamId: string): Promise<Livestream> {
    const call = this.client.video.call('livestream', livestreamId);

    // Stop recording if active
    await this.stopRecording(livestreamId).catch(() => {});

    await call.endCall();

    const livestream = await this.getLivestream(livestreamId);
    livestream.status = 'ended';
    livestream.endedAt = new Date();
    if (livestream.startedAt) {
      livestream.duration = Math.floor(
        (livestream.endedAt.getTime() - livestream.startedAt.getTime()) / 1000
      );
    }
    await this.saveLivestream(livestream);

    // Create VOD if configured
    if (livestream.recording?.createVod) {
      await this.createVOD(livestream);
    }

    return livestream;
  }

  // Get playback info
  async getPlaybackInfo(livestreamId: string): Promise<PlaybackInfo> {
    const call = this.client.video.call('livestream', livestreamId);
    await call.get();

    const egress = await call.getCallEgress();

    return {
      hlsUrl: egress.hls?.playlist_url || '',
      qualities: [
        { label: '1080p', width: 1920, height: 1080, bitrate: 6000000, codec: 'h264' },
        { label: '720p', width: 1280, height: 720, bitrate: 3000000, codec: 'h264' },
        { label: '480p', width: 854, height: 480, bitrate: 1500000, codec: 'h264' },
      ],
      currentQuality: { label: 'auto', width: 0, height: 0, bitrate: 0, codec: 'h264' },
    };
  }

  // Join as viewer
  async joinAsViewer(
    livestreamId: string,
    userId?: string,
    displayName?: string
  ): Promise<{ playbackInfo: PlaybackInfo; viewerToken: string }> {
    const sessionId = crypto.randomUUID();
    const viewerUserId = userId || `anonymous_${sessionId}`;

    // Generate viewer token
    const token = await this.client.createToken(viewerUserId, undefined, undefined, [livestreamId]);

    // Record viewer join
    const viewer: LivestreamViewer = {
      id: crypto.randomUUID(),
      livestreamId,
      userId,
      sessionId,
      displayName: displayName || 'Anonymous',
      joinedAt: new Date(),
      watchDuration: 0,
      engagementScore: 0,
      device: {
        type: 'desktop',
        platform: 'web',
      },
    };

    await this.saveViewer(viewer);
    await this.incrementViewerCount(livestreamId);

    const playbackInfo = await this.getPlaybackInfo(livestreamId);

    return { playbackInfo, viewerToken: token };
  }

  // Leave as viewer
  async leaveAsViewer(livestreamId: string, sessionId: string): Promise<void> {
    const viewer = await this.getViewerBySession(livestreamId, sessionId);

    if (viewer) {
      viewer.leftAt = new Date();
      viewer.watchDuration = Math.floor(
        (viewer.leftAt.getTime() - viewer.joinedAt.getTime()) / 1000
      );
      await this.saveViewer(viewer);
    }

    await this.decrementViewerCount(livestreamId);
  }

  // Get viewer analytics
  async getViewerAnalytics(livestreamId: string): Promise<ViewerAnalytics> {
    const livestream = await this.getLivestream(livestreamId);
    const viewers = await this.getAllViewers(livestreamId);

    const uniqueViewers = new Set(viewers.map(v => v.userId || v.sessionId)).size;
    const totalWatchTime = viewers.reduce((sum, v) => sum + v.watchDuration, 0);
    const averageWatchTime = uniqueViewers > 0 ? totalWatchTime / uniqueViewers : 0;

    // Group by country
    const byCountry = new Map<string, number>();
    for (const viewer of viewers) {
      if (viewer.location?.country) {
        byCountry.set(
          viewer.location.country,
          (byCountry.get(viewer.location.country) || 0) + 1
        );
      }
    }

    // Group by device
    const byDevice = new Map<string, number>();
    for (const viewer of viewers) {
      byDevice.set(viewer.device.type, (byDevice.get(viewer.device.type) || 0) + 1);
    }

    return {
      livestreamId,
      currentViewers: livestream.viewerCount,
      peakViewers: livestream.peakViewerCount,
      totalUniqueViewers: uniqueViewers,
      averageWatchTime,
      viewersByCountry: Array.from(byCountry.entries()).map(([country, count]) => ({
        country,
        count,
      })),
      viewersByDevice: Array.from(byDevice.entries()).map(([device, count]) => ({
        device,
        count,
      })),
      engagementMetrics: {
        chatMessages: await this.getChatMessageCount(livestreamId),
        reactions: 0,
        shares: 0,
      },
      timeline: [],
    };
  }

  // Start recording
  async startRecording(livestreamId: string): Promise<LivestreamRecording> {
    const call = this.client.video.call('livestream', livestreamId);

    await call.startRecording();

    const recording: LivestreamRecording = {
      id: crypto.randomUUID(),
      livestreamId,
      status: 'recording',
      duration: 0,
      fileSize: 0,
      createdAt: new Date(),
    };

    await this.saveRecording(recording);

    return recording;
  }

  // Stop recording
  async stopRecording(livestreamId: string): Promise<LivestreamRecording> {
    const call = this.client.video.call('livestream', livestreamId);

    await call.stopRecording();

    const recording = await this.getActiveRecording(livestreamId);
    if (recording) {
      recording.status = 'processing';
      await this.saveRecording(recording);
    }

    return recording!;
  }

  // Send chat message
  async sendChatMessage(
    livestreamId: string,
    userId: string,
    displayName: string,
    content: string,
    type: ChatMessage['type'] = 'message'
  ): Promise<ChatMessage> {
    const livestream = await this.getLivestream(livestreamId);

    // Check chat settings
    if (!livestream.chat.enabled) {
      throw new Error('Chat is disabled');
    }

    // Check slow mode
    if (livestream.chat.slowMode) {
      const lastMessage = await this.getLastUserMessage(livestreamId, userId);
      if (lastMessage) {
        const timeSince = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
        if (timeSince < livestream.chat.slowModeInterval) {
          throw new Error(`Please wait ${Math.ceil(livestream.chat.slowModeInterval - timeSince)} seconds`);
        }
      }
    }

    // Check for banned words
    if (livestream.chat.bannedWords.length > 0) {
      const lowercaseContent = content.toLowerCase();
      for (const word of livestream.chat.bannedWords) {
        if (lowercaseContent.includes(word.toLowerCase())) {
          throw new Error('Message contains prohibited content');
        }
      }
    }

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      livestreamId,
      userId,
      displayName,
      content,
      type,
      createdAt: new Date(),
    };

    await this.saveChatMessage(message);

    // Broadcast to viewers
    await this.broadcastChatMessage(livestreamId, message);

    return message;
  }

  // Process donation
  async processDonation(
    livestreamId: string,
    viewerId: string,
    viewerName: string,
    amount: number,
    currency: string,
    message?: string
  ): Promise<LivestreamDonation> {
    const livestream = await this.getLivestream(livestreamId);

    if (!livestream.monetization?.tipsEnabled) {
      throw new Error('Tips are not enabled for this stream');
    }

    if (amount < (livestream.monetization.minTipAmount || 1)) {
      throw new Error('Donation amount below minimum');
    }

    const donation: LivestreamDonation = {
      id: crypto.randomUUID(),
      livestreamId,
      viewerId,
      viewerName,
      amount,
      currency,
      message,
      highlighted: amount >= 10, // Highlight larger donations
      readByHost: false,
      createdAt: new Date(),
    };

    await this.saveDonation(donation);

    // Show on stream
    await this.showDonationAlert(livestream, donation);

    // Process payment
    await this.processPayment(livestream.hostId, amount, currency, donation.id);

    return donation;
  }

  // Update chat settings
  async updateChatSettings(
    livestreamId: string,
    settings: Partial<ChatConfig>
  ): Promise<Livestream> {
    const livestream = await this.getLivestream(livestreamId);

    livestream.chat = { ...livestream.chat, ...settings };
    await this.saveLivestream(livestream);

    return livestream;
  }

  // Create VOD from recording
  private async createVOD(livestream: Livestream): Promise<VOD> {
    const recording = await this.getCompletedRecording(livestream.id);

    if (!recording) {
      throw new Error('No completed recording found');
    }

    const vod: VOD = {
      id: crypto.randomUUID(),
      livestreamId: livestream.id,
      title: livestream.title,
      description: livestream.description,
      duration: recording.duration,
      playbackUrl: recording.url || '',
      thumbnailUrl: livestream.thumbnail,
      visibility: livestream.recording?.vodVisibility || 'public',
      viewCount: 0,
      createdAt: new Date(),
    };

    await this.saveVOD(vod);
    recording.vodId = vod.id;
    await this.saveRecording(recording);

    return vod;
  }

  // Helper methods (implementations needed)
  private async getLivestream(id: string): Promise<Livestream> {
    throw new Error('Not implemented');
  }

  private async saveLivestream(livestream: Livestream): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveViewer(viewer: LivestreamViewer): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getViewerBySession(livestreamId: string, sessionId: string): Promise<LivestreamViewer | null> {
    throw new Error('Not implemented');
  }

  private async getAllViewers(livestreamId: string): Promise<LivestreamViewer[]> {
    throw new Error('Not implemented');
  }

  private async incrementViewerCount(livestreamId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async decrementViewerCount(livestreamId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveRecording(recording: LivestreamRecording): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getActiveRecording(livestreamId: string): Promise<LivestreamRecording | null> {
    throw new Error('Not implemented');
  }

  private async getCompletedRecording(livestreamId: string): Promise<LivestreamRecording | null> {
    throw new Error('Not implemented');
  }

  private async saveChatMessage(message: ChatMessage): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getLastUserMessage(livestreamId: string, userId: string): Promise<ChatMessage | null> {
    throw new Error('Not implemented');
  }

  private async getChatMessageCount(livestreamId: string): Promise<number> {
    throw new Error('Not implemented');
  }

  private async broadcastChatMessage(livestreamId: string, message: ChatMessage): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveDonation(donation: LivestreamDonation): Promise<void> {
    throw new Error('Not implemented');
  }

  private async showDonationAlert(livestream: Livestream, donation: LivestreamDonation): Promise<void> {
    throw new Error('Not implemented');
  }

  private async processPayment(hostId: string, amount: number, currency: string, donationId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveVOD(vod: VOD): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyGoLive(livestream: Livestream): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

## Database Schema

```sql
-- Livestreams
CREATE TABLE livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_call_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'created',
  stream_settings JSONB NOT NULL DEFAULT '{}',
  ingest_info JSONB,
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  duration INTEGER,
  recording_config JSONB,
  chat_config JSONB NOT NULL DEFAULT '{}',
  monetization_config JSONB,
  scheduled_start TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Livestream viewers
CREATE TABLE livestream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL,
  left_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  location JSONB,
  device JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Livestream recordings
CREATE TABLE livestream_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id),
  stream_recording_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'recording',
  layout VARCHAR(30),
  duration INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  url TEXT,
  download_url TEXT,
  vod_id UUID REFERENCES vods(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Chat messages
CREATE TABLE livestream_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id),
  user_id UUID NOT NULL REFERENCES users(id),
  display_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'message',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Donations
CREATE TABLE livestream_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID NOT NULL REFERENCES livestreams(id),
  viewer_id UUID NOT NULL REFERENCES users(id),
  viewer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  message TEXT,
  highlighted BOOLEAN DEFAULT false,
  read_by_host BOOLEAN DEFAULT false,
  payment_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VODs
CREATE TABLE vods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id UUID REFERENCES livestreams(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  playback_url TEXT NOT NULL,
  thumbnail_url TEXT,
  visibility VARCHAR(20) DEFAULT 'public',
  view_count INTEGER DEFAULT 0,
  chapters JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_livestreams_host ON livestreams(host_id);
CREATE INDEX idx_livestreams_status ON livestreams(status);
CREATE INDEX idx_livestreams_scheduled ON livestreams(scheduled_start);
CREATE INDEX idx_viewers_livestream ON livestream_viewers(livestream_id);
CREATE INDEX idx_viewers_session ON livestream_viewers(session_id);
CREATE INDEX idx_chat_livestream ON livestream_chat_messages(livestream_id);
CREATE INDEX idx_chat_created ON livestream_chat_messages(created_at DESC);
CREATE INDEX idx_donations_livestream ON livestream_donations(livestream_id);
CREATE INDEX idx_vods_livestream ON vods(livestream_id);
CREATE INDEX idx_vods_visibility ON vods(visibility);
```

## API Endpoints

```typescript
// POST /api/livestream
// Create livestream
{
  request: {
    title: string,
    description?: string,
    settings?: Partial<StreamSettings>,
    scheduledStart?: string
  },
  response: Livestream
}

// GET /api/livestream/:id/ingest
// Get RTMP ingest info
{
  response: IngestInfo
}

// POST /api/livestream/:id/backstage
// Start backstage
{
  response: Livestream
}

// POST /api/livestream/:id/live
// Go live
{
  response: Livestream
}

// POST /api/livestream/:id/end
// End livestream
{
  response: Livestream
}

// GET /api/livestream/:id/playback
// Get playback info (for viewers)
{
  response: PlaybackInfo
}

// POST /api/livestream/:id/join
// Join as viewer
{
  request: { displayName?: string },
  response: { playbackInfo: PlaybackInfo, viewerToken: string, sessionId: string }
}

// POST /api/livestream/:id/leave
// Leave as viewer
{
  request: { sessionId: string },
  response: { success: boolean }
}

// GET /api/livestream/:id/analytics
// Get viewer analytics
{
  response: ViewerAnalytics
}

// POST /api/livestream/:id/chat
// Send chat message
{
  request: { content: string },
  response: ChatMessage
}

// POST /api/livestream/:id/donate
// Process donation
{
  request: { amount: number, currency: string, message?: string },
  response: LivestreamDonation
}

// PUT /api/livestream/:id/chat/settings
// Update chat settings
{
  request: Partial<ChatConfig>,
  response: Livestream
}
```

## Related Skills
- `video-conferencing-standard.md` - Interactive video calls
- `webinar-standard.md` - Large-scale managed events
- `event-ticketing-standard.md` - Ticketed livestream events

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Video
