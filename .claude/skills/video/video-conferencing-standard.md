# Video Conferencing Standard

## Overview
Real-time video communication standard using Stream.io Video SDK for 1:1 calls, group meetings, screen sharing, and recording. Supports WebRTC-based peer-to-peer and SFU architectures.

## Domain Context
- **Primary Projects**: Quik Meet, Quik Music (studio sessions), Quik Events (virtual events)
- **Related Domains**: Music (collaboration), Events (virtual venues), Social (video chat)
- **Key Integration**: Stream.io Video SDK, WebRTC, Recording Services

## Core Interfaces

### Call & Participants
```typescript
interface VideoCall {
  id: string;
  type: CallType;
  createdBy: string;
  status: CallStatus;
  settings: CallSettings;
  participants: CallParticipant[];
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // seconds
  recording?: RecordingInfo;
  transcription?: TranscriptionInfo;
  metadata: Record<string, any>;
  createdAt: Date;
}

type CallType =
  | 'default'           // Standard video call
  | 'audio_room'        // Audio only
  | 'livestream'        // Broadcast mode
  | 'meeting'           // Scheduled meeting
  | 'interview';        // Interview mode with host controls

type CallStatus =
  | 'idle'
  | 'ringing'
  | 'joining'
  | 'reconnecting'
  | 'joined'
  | 'left'
  | 'ended';

interface CallParticipant {
  id: string;
  oderId: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  connectionState: ConnectionState;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareEnabled: boolean;
  speaking: boolean;
  dominantSpeaker: boolean;
  joinedAt: Date;
  leftAt?: Date;
  device?: DeviceInfo;
}

type ParticipantRole =
  | 'host'
  | 'co_host'
  | 'speaker'
  | 'viewer'
  | 'guest';

type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

interface DeviceInfo {
  audioInput?: string;
  audioOutput?: string;
  videoInput?: string;
  browser?: string;
  os?: string;
}
```

### Call Settings & Controls
```typescript
interface CallSettings {
  audio: AudioSettings;
  video: VideoSettings;
  permissions: PermissionSettings;
  recording: RecordingSettings;
  screenshare: ScreenShareSettings;
  limits: CallLimits;
}

interface AudioSettings {
  defaultMuted: boolean;
  noiseCancellation: boolean;
  echoCancellation: boolean;
  accessRequestEnabled: boolean;
  speakerLayout: 'grid' | 'spotlight' | 'sidebar';
}

interface VideoSettings {
  defaultEnabled: boolean;
  resolution: VideoResolution;
  frameRate: number;
  accessRequestEnabled: boolean;
  backgroundBlur: boolean;
  virtualBackgrounds: boolean;
}

type VideoResolution = '360p' | '720p' | '1080p' | '4k';

interface PermissionSettings {
  canPublish: boolean;
  canSubscribe: boolean;
  canScreenShare: boolean;
  canRecord: boolean;
  canMuteOthers: boolean;
  canRemoveParticipants: boolean;
  canEndCall: boolean;
}

interface RecordingSettings {
  mode: 'disabled' | 'manual' | 'auto';
  layout: RecordingLayout;
  audioOnly: boolean;
  cloudStorage: boolean;
  transcriptionEnabled: boolean;
}

type RecordingLayout =
  | 'speaker_view'
  | 'grid'
  | 'single_participant'
  | 'audio_only';

interface ScreenShareSettings {
  enabled: boolean;
  maxSharers: number;
  audioSharing: boolean;
  highQuality: boolean;
}

interface CallLimits {
  maxParticipants: number;
  maxDuration: number; // minutes
  maxRecordingDuration: number;
}
```

### Recording & Transcription
```typescript
interface RecordingInfo {
  id: string;
  callId: string;
  status: RecordingStatus;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  fileSize?: number;
  url?: string;
  downloadUrl?: string;
  expiresAt?: Date;
  layout: RecordingLayout;
  audioOnly: boolean;
}

type RecordingStatus =
  | 'starting'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'completed'
  | 'failed';

interface TranscriptionInfo {
  id: string;
  callId: string;
  status: 'processing' | 'completed' | 'failed';
  language: string;
  segments: TranscriptionSegment[];
  fullText?: string;
  downloadUrl?: string;
}

interface TranscriptionSegment {
  participantId: string;
  participantName: string;
  text: string;
  startTime: number; // seconds from recording start
  endTime: number;
  confidence: number;
}
```

### Scheduled Meetings
```typescript
interface ScheduledMeeting {
  id: string;
  title: string;
  description?: string;
  hostUserId: string;
  callId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  timezone: string;
  recurrence?: RecurrenceRule;
  invitees: MeetingInvitee[];
  joinInfo: JoinInfo;
  settings: CallSettings;
  reminders: ReminderConfig;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface MeetingInvitee {
  email: string;
  name?: string;
  role: ParticipantRole;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  notified: boolean;
}

interface JoinInfo {
  meetingUrl: string;
  meetingCode: string;
  dialInNumbers?: DialInNumber[];
  password?: string;
}

interface DialInNumber {
  country: string;
  number: string;
  pin: string;
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
}

interface ReminderConfig {
  email: boolean;
  push: boolean;
  reminderTimes: number[]; // minutes before
}
```

## Service Implementation

### Video Conferencing Service
```typescript
import { StreamClient, Call } from '@stream-io/video-client';

export class VideoConferencingService {
  private client: StreamClient;

  constructor(apiKey: string, apiSecret: string) {
    this.client = new StreamClient(apiKey, { secret: apiSecret });
  }

  // Create a new call
  async createCall(
    callType: CallType,
    creatorId: string,
    settings?: Partial<CallSettings>,
    metadata?: Record<string, any>
  ): Promise<VideoCall> {
    const callId = crypto.randomUUID();

    const call = this.client.video.call(callType, callId);

    await call.create({
      data: {
        created_by_id: creatorId,
        settings_override: this.mapToStreamSettings(settings),
        custom: metadata,
      },
    });

    return this.mapStreamCallToVideoCall(call, creatorId);
  }

  // Join an existing call
  async joinCall(
    callId: string,
    callType: CallType,
    userId: string,
    options?: {
      create?: boolean;
      ring?: boolean;
      notify?: boolean;
    }
  ): Promise<{ call: VideoCall; token: string }> {
    const call = this.client.video.call(callType, callId);

    await call.join({
      create: options?.create,
      ring: options?.ring,
      notify: options?.notify,
    });

    const token = await this.generateUserToken(userId, callId);

    return {
      call: this.mapStreamCallToVideoCall(call, userId),
      token,
    };
  }

  // Generate user token for client SDK
  async generateUserToken(
    userId: string,
    callId?: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + expiresIn;

    return this.client.createToken(userId, expiration, issuedAt, callId ? [callId] : undefined);
  }

  // Update call settings
  async updateCallSettings(
    callId: string,
    callType: CallType,
    settings: Partial<CallSettings>
  ): Promise<VideoCall> {
    const call = this.client.video.call(callType, callId);

    await call.update({
      settings_override: this.mapToStreamSettings(settings),
    });

    return this.mapStreamCallToVideoCall(call);
  }

  // Get call details
  async getCall(callId: string, callType: CallType): Promise<VideoCall> {
    const call = this.client.video.call(callType, callId);
    await call.get();
    return this.mapStreamCallToVideoCall(call);
  }

  // End call
  async endCall(callId: string, callType: CallType): Promise<void> {
    const call = this.client.video.call(callType, callId);
    await call.endCall();
  }

  // Mute participant
  async muteParticipant(
    callId: string,
    callType: CallType,
    userId: string,
    trackType: 'audio' | 'video' | 'screenshare'
  ): Promise<void> {
    const call = this.client.video.call(callType, callId);

    await call.muteUser(userId, trackType);
  }

  // Mute all participants
  async muteAll(
    callId: string,
    callType: CallType,
    trackType: 'audio' | 'video'
  ): Promise<void> {
    const call = this.client.video.call(callType, callId);

    await call.muteAllUsers(trackType);
  }

  // Remove participant
  async removeParticipant(
    callId: string,
    callType: CallType,
    userId: string
  ): Promise<void> {
    const call = this.client.video.call(callType, callId);

    await call.blockUser(userId);
  }

  // Update participant permissions
  async updateParticipantPermissions(
    callId: string,
    callType: CallType,
    userId: string,
    permissions: Partial<PermissionSettings>
  ): Promise<void> {
    const call = this.client.video.call(callType, callId);

    await call.updateUserPermissions({
      user_id: userId,
      grant_permissions: this.mapPermissionsToStream(permissions, true),
      revoke_permissions: this.mapPermissionsToStream(permissions, false),
    });
  }

  // Start recording
  async startRecording(
    callId: string,
    callType: CallType,
    layout?: RecordingLayout
  ): Promise<RecordingInfo> {
    const call = this.client.video.call(callType, callId);

    await call.startRecording({
      recording_external_storage: 'default',
    });

    return {
      id: crypto.randomUUID(),
      callId,
      status: 'starting',
      startedAt: new Date(),
      layout: layout || 'speaker_view',
      audioOnly: false,
    };
  }

  // Stop recording
  async stopRecording(callId: string, callType: CallType): Promise<RecordingInfo> {
    const call = this.client.video.call(callType, callId);

    await call.stopRecording();

    // Poll for recording to be processed
    const recordings = await this.getRecordings(callId, callType);
    return recordings[recordings.length - 1];
  }

  // Get recordings
  async getRecordings(callId: string, callType: CallType): Promise<RecordingInfo[]> {
    const call = this.client.video.call(callType, callId);

    const response = await call.listRecordings();

    return response.recordings.map(rec => ({
      id: rec.id,
      callId,
      status: rec.end_time ? 'completed' : 'recording',
      startedAt: new Date(rec.start_time),
      endedAt: rec.end_time ? new Date(rec.end_time) : undefined,
      url: rec.url,
      downloadUrl: rec.url,
      layout: 'speaker_view',
      audioOnly: false,
    }));
  }

  // Start transcription
  async startTranscription(
    callId: string,
    callType: CallType,
    language: string = 'en'
  ): Promise<void> {
    const call = this.client.video.call(callType, callId);

    await call.startTranscription();
  }

  // Stop transcription
  async stopTranscription(callId: string, callType: CallType): Promise<TranscriptionInfo> {
    const call = this.client.video.call(callType, callId);

    await call.stopTranscription();

    const transcriptions = await call.listTranscriptions();
    const latest = transcriptions.transcriptions[transcriptions.transcriptions.length - 1];

    return {
      id: latest.id,
      callId,
      status: 'completed',
      language: 'en',
      segments: [],
      downloadUrl: latest.url,
    };
  }

  // Schedule a meeting
  async scheduleMeeting(
    hostUserId: string,
    title: string,
    scheduledStart: Date,
    scheduledEnd: Date,
    invitees: MeetingInvitee[],
    settings?: Partial<CallSettings>,
    recurrence?: RecurrenceRule
  ): Promise<ScheduledMeeting> {
    const callId = crypto.randomUUID();
    const meetingCode = this.generateMeetingCode();

    // Create the call in advance
    const call = this.client.video.call('meeting', callId);

    await call.create({
      data: {
        created_by_id: hostUserId,
        starts_at: scheduledStart.toISOString(),
        settings_override: this.mapToStreamSettings(settings),
        custom: {
          title,
          scheduled_end: scheduledEnd.toISOString(),
          meeting_code: meetingCode,
        },
      },
      members: invitees.map(inv => ({
        user_id: inv.email, // Assuming email is user ID
        role: inv.role,
      })),
    });

    const meeting: ScheduledMeeting = {
      id: crypto.randomUUID(),
      title,
      hostUserId,
      callId,
      scheduledStart,
      scheduledEnd,
      timezone: 'UTC',
      recurrence,
      invitees,
      joinInfo: {
        meetingUrl: `${process.env.APP_URL}/meeting/${callId}`,
        meetingCode,
      },
      settings: settings as CallSettings,
      reminders: {
        email: true,
        push: true,
        reminderTimes: [15, 5], // 15 and 5 minutes before
      },
      status: 'scheduled',
      createdAt: new Date(),
    };

    await this.saveMeeting(meeting);

    // Send invitations
    await this.sendMeetingInvitations(meeting);

    // Schedule reminders
    await this.scheduleReminders(meeting);

    return meeting;
  }

  // Get meeting by code
  async getMeetingByCode(meetingCode: string): Promise<ScheduledMeeting | null> {
    return this.findMeetingByCode(meetingCode);
  }

  // Cancel meeting
  async cancelMeeting(meetingId: string): Promise<void> {
    const meeting = await this.getMeeting(meetingId);

    meeting.status = 'cancelled';
    await this.saveMeeting(meeting);

    // Cancel the Stream call
    const call = this.client.video.call('meeting', meeting.callId);
    await call.endCall();

    // Notify invitees
    await this.sendCancellationNotifications(meeting);
  }

  // Get call statistics
  async getCallStats(callId: string, callType: CallType): Promise<{
    duration: number;
    peakParticipants: number;
    averageParticipants: number;
    qualityMetrics: QualityMetrics;
  }> {
    const call = this.client.video.call(callType, callId);
    const stats = await call.getStats();

    return {
      duration: stats.call_duration_seconds || 0,
      peakParticipants: stats.max_participants || 0,
      averageParticipants: stats.average_participants || 0,
      qualityMetrics: {
        averageLatency: stats.average_latency_ms || 0,
        packetLoss: stats.packet_loss_percentage || 0,
        jitter: stats.jitter_ms || 0,
        resolution: stats.average_resolution || '720p',
        frameRate: stats.average_framerate || 30,
      },
    };
  }

  // Helper methods
  private mapToStreamSettings(settings?: Partial<CallSettings>): any {
    if (!settings) return undefined;

    return {
      audio: settings.audio ? {
        default_device: 'speaker',
        mic_default_on: !settings.audio.defaultMuted,
        noise_cancellation_mode: settings.audio.noiseCancellation ? 'auto-on' : 'off',
      } : undefined,
      video: settings.video ? {
        camera_default_on: settings.video.defaultEnabled,
        target_resolution: this.mapResolution(settings.video.resolution),
      } : undefined,
      screensharing: settings.screenshare ? {
        enabled: settings.screenshare.enabled,
      } : undefined,
      recording: settings.recording ? {
        mode: settings.recording.mode,
        audio_only: settings.recording.audioOnly,
      } : undefined,
      limits: settings.limits ? {
        max_participants: settings.limits.maxParticipants,
        max_duration_seconds: settings.limits.maxDuration * 60,
      } : undefined,
    };
  }

  private mapResolution(resolution?: VideoResolution): any {
    const resMap: Record<VideoResolution, any> = {
      '360p': { width: 640, height: 360 },
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 },
    };
    return resolution ? resMap[resolution] : resMap['720p'];
  }

  private mapPermissionsToStream(permissions: Partial<PermissionSettings>, grant: boolean): string[] {
    const permissionMap: Record<keyof PermissionSettings, string> = {
      canPublish: 'send-audio',
      canSubscribe: 'receive-audio',
      canScreenShare: 'screenshare',
      canRecord: 'start-recording',
      canMuteOthers: 'mute-users',
      canRemoveParticipants: 'block-users',
      canEndCall: 'end-call',
    };

    const result: string[] = [];
    for (const [key, value] of Object.entries(permissions)) {
      if ((grant && value) || (!grant && !value)) {
        result.push(permissionMap[key as keyof PermissionSettings]);
      }
    }
    return result;
  }

  private mapStreamCallToVideoCall(call: Call, creatorId?: string): VideoCall {
    const state = call.state;

    return {
      id: call.id,
      type: call.type as CallType,
      createdBy: creatorId || '',
      status: state.callingState as CallStatus,
      settings: {} as CallSettings,
      participants: state.participants.map(p => ({
        id: p.sessionId,
        userId: p.userId,
        name: p.name || p.userId,
        role: 'speaker' as ParticipantRole,
        connectionState: 'connected' as ConnectionState,
        videoEnabled: p.videoStream !== undefined,
        audioEnabled: p.audioStream !== undefined,
        screenShareEnabled: p.screenShareStream !== undefined,
        speaking: p.isSpeaking || false,
        dominantSpeaker: p.isDominantSpeaker || false,
        joinedAt: new Date(),
      })),
      createdAt: new Date(),
      metadata: state.custom || {},
    };
  }

  private generateMeetingCode(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 2) code += '-';
    }
    return code;
  }

  // Database methods (implementations needed)
  private async saveMeeting(meeting: ScheduledMeeting): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getMeeting(id: string): Promise<ScheduledMeeting> {
    throw new Error('Not implemented');
  }

  private async findMeetingByCode(code: string): Promise<ScheduledMeeting | null> {
    throw new Error('Not implemented');
  }

  private async sendMeetingInvitations(meeting: ScheduledMeeting): Promise<void> {
    throw new Error('Not implemented');
  }

  private async scheduleReminders(meeting: ScheduledMeeting): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendCancellationNotifications(meeting: ScheduledMeeting): Promise<void> {
    throw new Error('Not implemented');
  }
}

interface QualityMetrics {
  averageLatency: number;
  packetLoss: number;
  jitter: number;
  resolution: string;
  frameRate: number;
}
```

## Database Schema

```sql
-- Video calls
CREATE TABLE video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_call_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(30) NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'idle',
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- seconds
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call participants
CREATE TABLE video_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES video_calls(id),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id VARCHAR(255),
  role VARCHAR(20) DEFAULT 'speaker',
  joined_at TIMESTAMPTZ NOT NULL,
  left_at TIMESTAMPTZ,
  duration INTEGER,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled meetings
CREATE TABLE scheduled_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  host_user_id UUID NOT NULL REFERENCES users(id),
  call_id UUID REFERENCES video_calls(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  recurrence JSONB,
  meeting_url TEXT NOT NULL,
  meeting_code VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(50),
  settings JSONB DEFAULT '{}',
  reminders JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting invitees
CREATE TABLE meeting_invitees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES scheduled_meetings(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'speaker',
  status VARCHAR(20) DEFAULT 'pending',
  notified BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, email)
);

-- Call recordings
CREATE TABLE video_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES video_calls(id),
  stream_recording_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'recording',
  layout VARCHAR(30),
  audio_only BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  file_size BIGINT,
  url TEXT,
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcriptions
CREATE TABLE video_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES video_calls(id),
  recording_id UUID REFERENCES video_recordings(id),
  status VARCHAR(20) DEFAULT 'processing',
  language VARCHAR(10) DEFAULT 'en',
  full_text TEXT,
  segments JSONB DEFAULT '[]',
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_video_calls_created_by ON video_calls(created_by);
CREATE INDEX idx_video_calls_status ON video_calls(status);
CREATE INDEX idx_video_calls_created ON video_calls(created_at DESC);
CREATE INDEX idx_call_participants_call ON video_call_participants(call_id);
CREATE INDEX idx_call_participants_user ON video_call_participants(user_id);
CREATE INDEX idx_scheduled_meetings_host ON scheduled_meetings(host_user_id);
CREATE INDEX idx_scheduled_meetings_start ON scheduled_meetings(scheduled_start);
CREATE INDEX idx_scheduled_meetings_code ON scheduled_meetings(meeting_code);
CREATE INDEX idx_video_recordings_call ON video_recordings(call_id);
```

## API Endpoints

```typescript
// POST /api/video/calls
// Create call
{
  request: {
    type: CallType,
    settings?: Partial<CallSettings>,
    metadata?: Record<string, any>
  },
  response: { call: VideoCall, token: string }
}

// POST /api/video/calls/:id/join
// Join call
{
  response: { call: VideoCall, token: string }
}

// POST /api/video/calls/:id/end
// End call
{
  response: { success: boolean }
}

// GET /api/video/calls/:id
// Get call details
{
  response: VideoCall
}

// POST /api/video/calls/:id/participants/:userId/mute
// Mute participant
{
  request: { trackType: 'audio' | 'video' | 'screenshare' },
  response: { success: boolean }
}

// POST /api/video/calls/:id/recording/start
// Start recording
{
  request: { layout?: RecordingLayout },
  response: RecordingInfo
}

// POST /api/video/calls/:id/recording/stop
// Stop recording
{
  response: RecordingInfo
}

// GET /api/video/calls/:id/recordings
// Get recordings
{
  response: { recordings: RecordingInfo[] }
}

// POST /api/video/meetings
// Schedule meeting
{
  request: {
    title: string,
    scheduledStart: string,
    scheduledEnd: string,
    invitees: MeetingInvitee[],
    settings?: Partial<CallSettings>,
    recurrence?: RecurrenceRule
  },
  response: ScheduledMeeting
}

// GET /api/video/meetings/:code
// Get meeting by code
{
  response: ScheduledMeeting
}

// DELETE /api/video/meetings/:id
// Cancel meeting
{
  response: { success: boolean }
}

// GET /api/video/token
// Get client token
{
  query: { callId?: string },
  response: { token: string, userId: string }
}
```

## Related Skills
- `live-streaming-standard.md` - Broadcast streaming
- `webinar-standard.md` - Large-scale events
- `music-session-collaboration-standard.md` - Music collaboration video

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Video
