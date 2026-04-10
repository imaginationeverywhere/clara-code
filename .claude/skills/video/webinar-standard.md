# Webinar Standard

## Overview
Large-scale webinar management standard for hosted events with multiple presenters, Q&A, polls, breakout rooms, and registration. Supports thousands of attendees with structured moderation.

## Domain Context
- **Primary Projects**: Quik Events (virtual events), Quik Business (corporate webinars)
- **Related Domains**: Events, Video Conferencing, Live Streaming
- **Key Integration**: Stream.io Video SDK, Registration Systems, Analytics

## Core Interfaces

### Webinar
```typescript
interface Webinar {
  id: string;
  title: string;
  description?: string;
  organizerId: string;
  organizerName: string;
  type: WebinarType;
  status: WebinarStatus;
  schedule: WebinarSchedule;
  presenters: WebinarPresenter[];
  moderators: WebinarModerator[];
  settings: WebinarSettings;
  registration: RegistrationConfig;
  engagement: EngagementConfig;
  branding: BrandingConfig;
  recording: WebinarRecordingConfig;
  analytics?: WebinarAnalytics;
  callId: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

type WebinarType =
  | 'single_session'      // One-time webinar
  | 'recurring'           // Regular series
  | 'on_demand'           // Pre-recorded available anytime
  | 'automated';          // Pre-recorded at scheduled time

type WebinarStatus =
  | 'draft'
  | 'scheduled'
  | 'registration_open'
  | 'registration_closed'
  | 'live'
  | 'completed'
  | 'cancelled';

interface WebinarSchedule {
  startTime: Date;
  endTime: Date;
  timezone: string;
  duration: number;            // minutes
  rehearsalTime?: Date;        // Pre-event practice
  greenRoomOpenTime?: Date;    // When presenters can join
  recurrence?: RecurrenceConfig;
}

interface RecurrenceConfig {
  pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
}

interface WebinarPresenter {
  id: string;
  userId: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  bio?: string;
  avatar?: string;
  role: 'host' | 'co_host' | 'presenter' | 'panelist';
  canShareScreen: boolean;
  canManageParticipants: boolean;
  joinLink: string;
  joinedAt?: Date;
}

interface WebinarModerator {
  id: string;
  userId: string;
  name: string;
  email: string;
  permissions: ModeratorPermissions;
}

interface ModeratorPermissions {
  manageQ_A: boolean;
  manageChat: boolean;
  managePolls: boolean;
  removeAttendees: boolean;
  muteAttendees: boolean;
  approveQuestions: boolean;
}
```

### Registration & Attendees
```typescript
interface RegistrationConfig {
  required: boolean;
  type: 'open' | 'approval_required' | 'invite_only';
  capacity?: number;
  waitlistEnabled: boolean;
  fields: RegistrationField[];
  confirmationEmail: EmailTemplate;
  reminderEmails: ReminderEmailConfig[];
  customQuestions: CustomQuestion[];
}

interface RegistrationField {
  name: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[];          // For select type
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface ReminderEmailConfig {
  enabled: boolean;
  sendBefore: number;          // hours before webinar
  template: EmailTemplate;
}

interface EmailTemplate {
  subject: string;
  body: string;
  variables: string[];         // Available merge variables
}

interface WebinarRegistration {
  id: string;
  webinarId: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  status: RegistrationStatus;
  customAnswers: Record<string, any>;
  joinLink: string;
  joinToken: string;
  registeredAt: Date;
  approvedAt?: Date;
  attendedAt?: Date;
  leftAt?: Date;
  watchDuration?: number;
  source?: string;             // UTM tracking
}

type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'cancelled'
  | 'attended'
  | 'no_show';

interface WebinarAttendee extends WebinarRegistration {
  sessionId: string;
  connectionState: 'connected' | 'reconnecting' | 'disconnected';
  raisedHand: boolean;
  questionsAsked: number;
  pollsAnswered: number;
  engagementScore: number;
  device: {
    type: 'mobile' | 'desktop' | 'tablet';
    browser: string;
    os: string;
  };
}
```

### Engagement Features
```typescript
interface EngagementConfig {
  chat: WebinarChatConfig;
  qAndA: QAndAConfig;
  polls: PollConfig;
  handRaise: HandRaiseConfig;
  reactions: ReactionsConfig;
  breakoutRooms: BreakoutConfig;
}

interface WebinarChatConfig {
  enabled: boolean;
  type: 'all' | 'panelists_only' | 'disabled';
  moderated: boolean;
  slowMode: boolean;
  slowModeInterval: number;
  allowPrivateChat: boolean;
}

interface QAndAConfig {
  enabled: boolean;
  anonymous: boolean;
  moderated: boolean;           // Questions require approval
  upvotingEnabled: boolean;
  maxQuestionsPerAttendee: number;
  notifyPresentersOnNew: boolean;
}

interface PollConfig {
  enabled: boolean;
  showResults: 'immediately' | 'after_close' | 'never';
  allowMultipleAnswers: boolean;
}

interface HandRaiseConfig {
  enabled: boolean;
  maxConcurrent: number;
  autoLowerAfterSeconds?: number;
}

interface ReactionsConfig {
  enabled: boolean;
  types: string[];             // emoji reactions available
  burstMode: boolean;          // Show burst of reactions
}

interface BreakoutConfig {
  enabled: boolean;
  maxRooms: number;
  autoAssign: boolean;
  allowSelfSelect: boolean;
  durationMinutes: number;
}

interface WebinarQuestion {
  id: string;
  webinarId: string;
  attendeeId: string;
  attendeeName: string;
  question: string;
  isAnonymous: boolean;
  status: QuestionStatus;
  upvotes: number;
  upvoterIds: string[];
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date;
  highlighted: boolean;
  createdAt: Date;
}

type QuestionStatus =
  | 'pending'
  | 'approved'
  | 'answered_live'
  | 'answered_text'
  | 'dismissed'
  | 'deferred';

interface WebinarPoll {
  id: string;
  webinarId: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'rating' | 'word_cloud';
  options: PollOption[];
  status: 'draft' | 'open' | 'closed';
  duration?: number;           // auto-close after seconds
  responses: PollResponse[];
  results?: PollResults;
  createdAt: Date;
  openedAt?: Date;
  closedAt?: Date;
}

interface PollOption {
  id: string;
  text: string;
  order: number;
}

interface PollResponse {
  attendeeId: string;
  optionIds: string[];
  submittedAt: Date;
}

interface PollResults {
  totalResponses: number;
  optionCounts: Record<string, number>;
  percentages: Record<string, number>;
}

interface BreakoutRoom {
  id: string;
  webinarId: string;
  name: string;
  topic?: string;
  capacity: number;
  attendees: string[];
  facilitator?: string;
  callId: string;
  status: 'waiting' | 'active' | 'closed';
  startedAt?: Date;
  endedAt?: Date;
}
```

### Branding & Customization
```typescript
interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily?: string;
  customCss?: string;
  waitingRoomConfig: WaitingRoomConfig;
  stageLayout: StageLayout;
}

interface WaitingRoomConfig {
  enabled: boolean;
  message: string;
  showCountdown: boolean;
  videoUrl?: string;           // Pre-webinar video
  imageUrl?: string;
  showAgenda: boolean;
  agenda?: AgendaItem[];
}

interface AgendaItem {
  time: string;
  title: string;
  presenter?: string;
}

type StageLayout =
  | 'speaker_focus'            // Main speaker large
  | 'gallery'                  // All presenters equal
  | 'presentation'             // Screen share focused
  | 'sidebar'                  // Presenters in sidebar
  | 'custom';
```

### Recording & Analytics
```typescript
interface WebinarRecordingConfig {
  autoRecord: boolean;
  layout: StageLayout;
  includeChat: boolean;
  includeQA: boolean;
  includePolls: boolean;
  makeAvailableAfter: 'immediately' | 'hours_24' | 'custom' | 'never';
  customAvailableAfter?: number;  // hours
  expiresAfterDays?: number;
}

interface WebinarAnalytics {
  registrations: {
    total: number;
    approved: number;
    waitlisted: number;
    cancelled: number;
  };
  attendance: {
    total: number;
    peakConcurrent: number;
    averageWatchTime: number;
    attendanceRate: number;     // attended / registered
  };
  engagement: {
    questionsAsked: number;
    questionsAnswered: number;
    pollResponses: number;
    chatMessages: number;
    handRaises: number;
    reactions: number;
    averageEngagementScore: number;
  };
  technical: {
    averageLatency: number;
    connectionIssues: number;
    qualityScore: number;
  };
  feedback?: {
    averageRating: number;
    npsScore: number;
    comments: string[];
  };
}
```

## Service Implementation

### Webinar Service
```typescript
import { StreamClient } from '@stream-io/video-client';

export class WebinarService {
  private client: StreamClient;

  constructor(apiKey: string, apiSecret: string) {
    this.client = new StreamClient(apiKey, { secret: apiSecret });
  }

  // Create webinar
  async createWebinar(
    organizerId: string,
    title: string,
    schedule: WebinarSchedule,
    settings?: Partial<WebinarSettings>,
    registration?: Partial<RegistrationConfig>
  ): Promise<Webinar> {
    const callId = crypto.randomUUID();

    // Create Stream call for webinar
    const call = this.client.video.call('livestream', callId);

    await call.create({
      data: {
        created_by_id: organizerId,
        starts_at: schedule.startTime.toISOString(),
        settings_override: {
          backstage: { enabled: true },
          broadcasting: { enabled: true },
        },
        custom: { title, type: 'webinar' },
      },
    });

    const webinar: Webinar = {
      id: crypto.randomUUID(),
      title,
      organizerId,
      organizerName: await this.getUserName(organizerId),
      type: 'single_session',
      status: 'draft',
      schedule,
      presenters: [],
      moderators: [],
      settings: this.getDefaultSettings(settings),
      registration: this.getDefaultRegistration(registration),
      engagement: this.getDefaultEngagement(),
      branding: this.getDefaultBranding(),
      recording: {
        autoRecord: true,
        layout: 'speaker_focus',
        includeChat: true,
        includeQA: true,
        includePolls: true,
        makeAvailableAfter: 'hours_24',
      },
      callId,
      metadata: {},
      createdAt: new Date(),
    };

    await this.saveWebinar(webinar);

    return webinar;
  }

  // Add presenter
  async addPresenter(
    webinarId: string,
    userId: string,
    role: WebinarPresenter['role'],
    bio?: string
  ): Promise<WebinarPresenter> {
    const webinar = await this.getWebinar(webinarId);
    const user = await this.getUser(userId);

    const joinToken = await this.generatePresenterToken(webinarId, userId);
    const joinLink = `${process.env.APP_URL}/webinar/${webinarId}/presenter?token=${joinToken}`;

    const presenter: WebinarPresenter = {
      id: crypto.randomUUID(),
      userId,
      name: user.name,
      email: user.email,
      title: user.title,
      company: user.company,
      bio,
      avatar: user.avatar,
      role,
      canShareScreen: role !== 'panelist',
      canManageParticipants: role === 'host' || role === 'co_host',
      joinLink,
    };

    webinar.presenters.push(presenter);
    await this.saveWebinar(webinar);

    // Add to Stream call
    const call = this.client.video.call('livestream', webinar.callId);
    await call.updateCallMembers({
      update_members: [{
        user_id: userId,
        role: this.mapPresenterRole(role),
      }],
    });

    // Send presenter invitation
    await this.sendPresenterInvitation(webinar, presenter);

    return presenter;
  }

  // Register attendee
  async registerAttendee(
    webinarId: string,
    registrationData: {
      email: string;
      name: string;
      company?: string;
      phone?: string;
      customAnswers?: Record<string, any>;
      source?: string;
    }
  ): Promise<WebinarRegistration> {
    const webinar = await this.getWebinar(webinarId);

    if (webinar.status === 'cancelled') {
      throw new Error('Webinar has been cancelled');
    }

    if (webinar.status === 'completed') {
      throw new Error('Webinar has already ended');
    }

    // Check capacity
    const registrations = await this.getRegistrations(webinarId);
    const approved = registrations.filter(r => r.status === 'approved').length;

    if (webinar.registration.capacity && approved >= webinar.registration.capacity) {
      if (webinar.registration.waitlistEnabled) {
        return this.addToWaitlist(webinar, registrationData);
      }
      throw new Error('Registration is at capacity');
    }

    // Validate required fields
    for (const field of webinar.registration.fields) {
      if (field.required && !registrationData[field.name as keyof typeof registrationData]) {
        throw new Error(`${field.label} is required`);
      }
    }

    // Generate unique join link
    const joinToken = await this.generateAttendeeToken(webinarId, registrationData.email);
    const joinLink = `${process.env.APP_URL}/webinar/${webinarId}/join?token=${joinToken}`;

    const registration: WebinarRegistration = {
      id: crypto.randomUUID(),
      webinarId,
      email: registrationData.email,
      name: registrationData.name,
      company: registrationData.company,
      phone: registrationData.phone,
      status: webinar.registration.type === 'open' ? 'approved' : 'pending',
      customAnswers: registrationData.customAnswers || {},
      joinLink,
      joinToken,
      registeredAt: new Date(),
      source: registrationData.source,
    };

    if (registration.status === 'approved') {
      registration.approvedAt = new Date();
    }

    await this.saveRegistration(registration);

    // Send confirmation email
    if (registration.status === 'approved') {
      await this.sendConfirmationEmail(webinar, registration);
      await this.scheduleReminderEmails(webinar, registration);
    } else {
      await this.sendPendingApprovalEmail(webinar, registration);
    }

    return registration;
  }

  // Approve registration
  async approveRegistration(
    webinarId: string,
    registrationId: string
  ): Promise<WebinarRegistration> {
    const registration = await this.getRegistration(registrationId);
    const webinar = await this.getWebinar(webinarId);

    if (registration.status !== 'pending') {
      throw new Error('Registration is not pending approval');
    }

    registration.status = 'approved';
    registration.approvedAt = new Date();
    await this.saveRegistration(registration);

    // Send approval email
    await this.sendConfirmationEmail(webinar, registration);
    await this.scheduleReminderEmails(webinar, registration);

    return registration;
  }

  // Start webinar
  async startWebinar(webinarId: string): Promise<Webinar> {
    const webinar = await this.getWebinar(webinarId);

    if (!['scheduled', 'registration_open', 'registration_closed'].includes(webinar.status)) {
      throw new Error('Webinar cannot be started');
    }

    const call = this.client.video.call('livestream', webinar.callId);
    await call.goLive();

    webinar.status = 'live';
    await this.saveWebinar(webinar);

    // Start recording if configured
    if (webinar.recording.autoRecord) {
      await call.startRecording();
    }

    // Notify registered attendees
    await this.notifyWebinarStarting(webinar);

    return webinar;
  }

  // End webinar
  async endWebinar(webinarId: string): Promise<Webinar> {
    const webinar = await this.getWebinar(webinarId);

    if (webinar.status !== 'live') {
      throw new Error('Webinar is not live');
    }

    const call = this.client.video.call('livestream', webinar.callId);

    // Stop recording
    await call.stopRecording().catch(() => {});

    // End call
    await call.endCall();

    webinar.status = 'completed';
    await this.saveWebinar(webinar);

    // Calculate analytics
    const analytics = await this.calculateAnalytics(webinar);
    webinar.analytics = analytics;
    await this.saveWebinar(webinar);

    // Send follow-up emails with recording link
    await this.sendFollowUpEmails(webinar);

    return webinar;
  }

  // Join as attendee
  async joinAsAttendee(
    webinarId: string,
    joinToken: string
  ): Promise<{
    webinar: Webinar;
    attendeeToken: string;
    playbackUrl: string;
  }> {
    const registration = await this.getRegistrationByToken(joinToken);

    if (!registration) {
      throw new Error('Invalid join link');
    }

    if (registration.status !== 'approved') {
      throw new Error('Registration not approved');
    }

    const webinar = await this.getWebinar(webinarId);

    // Generate Stream token
    const attendeeToken = await this.client.createToken(
      registration.email,
      undefined,
      undefined,
      [webinar.callId]
    );

    // Get playback URL
    const call = this.client.video.call('livestream', webinar.callId);
    const egress = await call.getCallEgress();

    // Update registration as attended
    if (!registration.attendedAt) {
      registration.attendedAt = new Date();
      registration.status = 'attended';
      await this.saveRegistration(registration);
    }

    return {
      webinar,
      attendeeToken,
      playbackUrl: egress.hls?.playlist_url || '',
    };
  }

  // Create Q&A question
  async askQuestion(
    webinarId: string,
    attendeeId: string,
    question: string,
    isAnonymous: boolean = false
  ): Promise<WebinarQuestion> {
    const webinar = await this.getWebinar(webinarId);

    if (!webinar.engagement.qAndA.enabled) {
      throw new Error('Q&A is not enabled');
    }

    // Check max questions
    const attendeeQuestions = await this.getAttendeeQuestions(webinarId, attendeeId);
    if (attendeeQuestions.length >= webinar.engagement.qAndA.maxQuestionsPerAttendee) {
      throw new Error('Maximum questions reached');
    }

    const registration = await this.getRegistration(attendeeId);

    const questionObj: WebinarQuestion = {
      id: crypto.randomUUID(),
      webinarId,
      attendeeId,
      attendeeName: isAnonymous ? 'Anonymous' : registration.name,
      question,
      isAnonymous,
      status: webinar.engagement.qAndA.moderated ? 'pending' : 'approved',
      upvotes: 0,
      upvoterIds: [],
      highlighted: false,
      createdAt: new Date(),
    };

    await this.saveQuestion(questionObj);

    // Notify presenters if configured
    if (webinar.engagement.qAndA.notifyPresentersOnNew && questionObj.status === 'approved') {
      await this.notifyPresentersNewQuestion(webinar, questionObj);
    }

    return questionObj;
  }

  // Upvote question
  async upvoteQuestion(
    questionId: string,
    attendeeId: string
  ): Promise<WebinarQuestion> {
    const question = await this.getQuestion(questionId);
    const webinar = await this.getWebinar(question.webinarId);

    if (!webinar.engagement.qAndA.upvotingEnabled) {
      throw new Error('Upvoting is not enabled');
    }

    if (question.upvoterIds.includes(attendeeId)) {
      // Remove upvote
      question.upvoterIds = question.upvoterIds.filter(id => id !== attendeeId);
      question.upvotes--;
    } else {
      // Add upvote
      question.upvoterIds.push(attendeeId);
      question.upvotes++;
    }

    await this.saveQuestion(question);

    return question;
  }

  // Answer question
  async answerQuestion(
    questionId: string,
    answeredBy: string,
    answer?: string,
    answeredLive: boolean = false
  ): Promise<WebinarQuestion> {
    const question = await this.getQuestion(questionId);

    question.status = answeredLive ? 'answered_live' : 'answered_text';
    question.answer = answer;
    question.answeredBy = answeredBy;
    question.answeredAt = new Date();

    await this.saveQuestion(question);

    return question;
  }

  // Create poll
  async createPoll(
    webinarId: string,
    question: string,
    type: WebinarPoll['type'],
    options: string[],
    duration?: number
  ): Promise<WebinarPoll> {
    const webinar = await this.getWebinar(webinarId);

    if (!webinar.engagement.polls.enabled) {
      throw new Error('Polls are not enabled');
    }

    const poll: WebinarPoll = {
      id: crypto.randomUUID(),
      webinarId,
      question,
      type,
      options: options.map((text, i) => ({
        id: crypto.randomUUID(),
        text,
        order: i,
      })),
      status: 'draft',
      duration,
      responses: [],
      createdAt: new Date(),
    };

    await this.savePoll(poll);

    return poll;
  }

  // Launch poll
  async launchPoll(pollId: string): Promise<WebinarPoll> {
    const poll = await this.getPoll(pollId);

    if (poll.status !== 'draft') {
      throw new Error('Poll has already been launched');
    }

    poll.status = 'open';
    poll.openedAt = new Date();

    await this.savePoll(poll);

    // Broadcast poll to attendees
    await this.broadcastPoll(poll);

    // Auto-close if duration set
    if (poll.duration) {
      setTimeout(async () => {
        await this.closePoll(poll.id);
      }, poll.duration * 1000);
    }

    return poll;
  }

  // Submit poll response
  async submitPollResponse(
    pollId: string,
    attendeeId: string,
    optionIds: string[]
  ): Promise<WebinarPoll> {
    const poll = await this.getPoll(pollId);
    const webinar = await this.getWebinar(poll.webinarId);

    if (poll.status !== 'open') {
      throw new Error('Poll is not open');
    }

    // Check if already responded
    if (poll.responses.some(r => r.attendeeId === attendeeId)) {
      throw new Error('Already submitted a response');
    }

    // Validate options
    if (!webinar.engagement.polls.allowMultipleAnswers && optionIds.length > 1) {
      throw new Error('Only one answer allowed');
    }

    poll.responses.push({
      attendeeId,
      optionIds,
      submittedAt: new Date(),
    });

    // Recalculate results
    poll.results = this.calculatePollResults(poll);

    await this.savePoll(poll);

    return poll;
  }

  // Close poll
  async closePoll(pollId: string): Promise<WebinarPoll> {
    const poll = await this.getPoll(pollId);

    if (poll.status !== 'open') {
      throw new Error('Poll is not open');
    }

    poll.status = 'closed';
    poll.closedAt = new Date();
    poll.results = this.calculatePollResults(poll);

    await this.savePoll(poll);

    // Broadcast results
    await this.broadcastPollResults(poll);

    return poll;
  }

  // Create breakout rooms
  async createBreakoutRooms(
    webinarId: string,
    rooms: { name: string; topic?: string; facilitator?: string }[]
  ): Promise<BreakoutRoom[]> {
    const webinar = await this.getWebinar(webinarId);

    if (!webinar.engagement.breakoutRooms.enabled) {
      throw new Error('Breakout rooms are not enabled');
    }

    if (rooms.length > webinar.engagement.breakoutRooms.maxRooms) {
      throw new Error(`Maximum ${webinar.engagement.breakoutRooms.maxRooms} rooms allowed`);
    }

    const breakoutRooms: BreakoutRoom[] = [];

    for (const room of rooms) {
      const roomCallId = `${webinar.callId}_breakout_${crypto.randomUUID().slice(0, 8)}`;

      // Create Stream call for breakout room
      const call = this.client.video.call('default', roomCallId);
      await call.create({
        data: {
          created_by_id: webinar.organizerId,
          custom: { webinarId, breakoutRoom: true },
        },
      });

      const breakoutRoom: BreakoutRoom = {
        id: crypto.randomUUID(),
        webinarId,
        name: room.name,
        topic: room.topic,
        capacity: Math.ceil(webinar.registration.capacity! / rooms.length),
        attendees: [],
        facilitator: room.facilitator,
        callId: roomCallId,
        status: 'waiting',
      };

      breakoutRooms.push(breakoutRoom);
    }

    await this.saveBreakoutRooms(breakoutRooms);

    return breakoutRooms;
  }

  // Assign attendees to breakout rooms
  async assignToBreakoutRoom(
    roomId: string,
    attendeeIds: string[]
  ): Promise<BreakoutRoom> {
    const room = await this.getBreakoutRoom(roomId);

    if (room.attendees.length + attendeeIds.length > room.capacity) {
      throw new Error('Room capacity exceeded');
    }

    room.attendees.push(...attendeeIds);
    await this.saveBreakoutRoom(room);

    // Notify attendees
    await this.notifyBreakoutAssignment(room, attendeeIds);

    return room;
  }

  // Start breakout sessions
  async startBreakoutSessions(webinarId: string): Promise<BreakoutRoom[]> {
    const rooms = await this.getBreakoutRooms(webinarId);
    const webinar = await this.getWebinar(webinarId);

    for (const room of rooms) {
      room.status = 'active';
      room.startedAt = new Date();
    }

    await this.saveBreakoutRooms(rooms);

    // Broadcast to all attendees
    await this.broadcastBreakoutStart(webinar, rooms);

    // Schedule auto-close
    setTimeout(async () => {
      await this.endBreakoutSessions(webinarId);
    }, webinar.engagement.breakoutRooms.durationMinutes * 60 * 1000);

    return rooms;
  }

  // End breakout sessions
  async endBreakoutSessions(webinarId: string): Promise<BreakoutRoom[]> {
    const rooms = await this.getBreakoutRooms(webinarId);

    for (const room of rooms) {
      room.status = 'closed';
      room.endedAt = new Date();

      // End Stream call
      const call = this.client.video.call('default', room.callId);
      await call.endCall().catch(() => {});
    }

    await this.saveBreakoutRooms(rooms);

    // Notify attendees to return
    await this.broadcastBreakoutEnd(webinarId);

    return rooms;
  }

  // Helper methods
  private calculatePollResults(poll: WebinarPoll): PollResults {
    const totalResponses = poll.responses.length;
    const optionCounts: Record<string, number> = {};
    const percentages: Record<string, number> = {};

    for (const option of poll.options) {
      optionCounts[option.id] = 0;
    }

    for (const response of poll.responses) {
      for (const optionId of response.optionIds) {
        optionCounts[optionId] = (optionCounts[optionId] || 0) + 1;
      }
    }

    for (const [optionId, count] of Object.entries(optionCounts)) {
      percentages[optionId] = totalResponses > 0
        ? Math.round((count / totalResponses) * 100)
        : 0;
    }

    return { totalResponses, optionCounts, percentages };
  }

  private mapPresenterRole(role: WebinarPresenter['role']): string {
    const roleMap: Record<string, string> = {
      host: 'admin',
      co_host: 'admin',
      presenter: 'user',
      panelist: 'user',
    };
    return roleMap[role] || 'user';
  }

  private getDefaultSettings(settings?: Partial<WebinarSettings>): WebinarSettings {
    return {
      maxAttendees: 1000,
      waitingRoom: true,
      muteOnEntry: true,
      ...settings,
    } as WebinarSettings;
  }

  private getDefaultRegistration(config?: Partial<RegistrationConfig>): RegistrationConfig {
    return {
      required: true,
      type: 'open',
      waitlistEnabled: true,
      fields: [
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'name', type: 'text', label: 'Full Name', required: true },
        { name: 'company', type: 'text', label: 'Company', required: false },
      ],
      confirmationEmail: {
        subject: 'Your registration is confirmed',
        body: 'Thank you for registering...',
        variables: ['name', 'webinar_title', 'join_link'],
      },
      reminderEmails: [
        { enabled: true, sendBefore: 24, template: { subject: '24 hours until...', body: '', variables: [] } },
        { enabled: true, sendBefore: 1, template: { subject: 'Starting in 1 hour...', body: '', variables: [] } },
      ],
      customQuestions: [],
      ...config,
    };
  }

  private getDefaultEngagement(): EngagementConfig {
    return {
      chat: {
        enabled: true,
        type: 'all',
        moderated: false,
        slowMode: false,
        slowModeInterval: 0,
        allowPrivateChat: false,
      },
      qAndA: {
        enabled: true,
        anonymous: true,
        moderated: true,
        upvotingEnabled: true,
        maxQuestionsPerAttendee: 5,
        notifyPresentersOnNew: true,
      },
      polls: {
        enabled: true,
        showResults: 'immediately',
        allowMultipleAnswers: false,
      },
      handRaise: {
        enabled: true,
        maxConcurrent: 5,
      },
      reactions: {
        enabled: true,
        types: ['👏', '❤️', '🎉', '😂', '😮', '👍'],
        burstMode: true,
      },
      breakoutRooms: {
        enabled: false,
        maxRooms: 10,
        autoAssign: false,
        allowSelfSelect: false,
        durationMinutes: 15,
      },
    };
  }

  private getDefaultBranding(): BrandingConfig {
    return {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      backgroundColor: '#ffffff',
      waitingRoomConfig: {
        enabled: true,
        message: 'The webinar will begin shortly',
        showCountdown: true,
        showAgenda: false,
      },
      stageLayout: 'speaker_focus',
    };
  }

  // Database methods (implementations needed)
  private async getWebinar(id: string): Promise<Webinar> {
    throw new Error('Not implemented');
  }

  private async saveWebinar(webinar: Webinar): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getUserName(userId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async getUser(userId: string): Promise<any> {
    throw new Error('Not implemented');
  }

  private async generatePresenterToken(webinarId: string, userId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async generateAttendeeToken(webinarId: string, email: string): Promise<string> {
    throw new Error('Not implemented');
  }

  private async sendPresenterInvitation(webinar: Webinar, presenter: WebinarPresenter): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getRegistrations(webinarId: string): Promise<WebinarRegistration[]> {
    throw new Error('Not implemented');
  }

  private async getRegistration(id: string): Promise<WebinarRegistration> {
    throw new Error('Not implemented');
  }

  private async getRegistrationByToken(token: string): Promise<WebinarRegistration | null> {
    throw new Error('Not implemented');
  }

  private async saveRegistration(registration: WebinarRegistration): Promise<void> {
    throw new Error('Not implemented');
  }

  private async addToWaitlist(webinar: Webinar, data: any): Promise<WebinarRegistration> {
    throw new Error('Not implemented');
  }

  private async sendConfirmationEmail(webinar: Webinar, registration: WebinarRegistration): Promise<void> {
    throw new Error('Not implemented');
  }

  private async sendPendingApprovalEmail(webinar: Webinar, registration: WebinarRegistration): Promise<void> {
    throw new Error('Not implemented');
  }

  private async scheduleReminderEmails(webinar: Webinar, registration: WebinarRegistration): Promise<void> {
    throw new Error('Not implemented');
  }

  private async notifyWebinarStarting(webinar: Webinar): Promise<void> {
    throw new Error('Not implemented');
  }

  private async calculateAnalytics(webinar: Webinar): Promise<WebinarAnalytics> {
    throw new Error('Not implemented');
  }

  private async sendFollowUpEmails(webinar: Webinar): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getAttendeeQuestions(webinarId: string, attendeeId: string): Promise<WebinarQuestion[]> {
    throw new Error('Not implemented');
  }

  private async saveQuestion(question: WebinarQuestion): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getQuestion(id: string): Promise<WebinarQuestion> {
    throw new Error('Not implemented');
  }

  private async notifyPresentersNewQuestion(webinar: Webinar, question: WebinarQuestion): Promise<void> {
    throw new Error('Not implemented');
  }

  private async savePoll(poll: WebinarPoll): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getPoll(id: string): Promise<WebinarPoll> {
    throw new Error('Not implemented');
  }

  private async broadcastPoll(poll: WebinarPoll): Promise<void> {
    throw new Error('Not implemented');
  }

  private async broadcastPollResults(poll: WebinarPoll): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveBreakoutRooms(rooms: BreakoutRoom[]): Promise<void> {
    throw new Error('Not implemented');
  }

  private async saveBreakoutRoom(room: BreakoutRoom): Promise<void> {
    throw new Error('Not implemented');
  }

  private async getBreakoutRooms(webinarId: string): Promise<BreakoutRoom[]> {
    throw new Error('Not implemented');
  }

  private async getBreakoutRoom(id: string): Promise<BreakoutRoom> {
    throw new Error('Not implemented');
  }

  private async notifyBreakoutAssignment(room: BreakoutRoom, attendeeIds: string[]): Promise<void> {
    throw new Error('Not implemented');
  }

  private async broadcastBreakoutStart(webinar: Webinar, rooms: BreakoutRoom[]): Promise<void> {
    throw new Error('Not implemented');
  }

  private async broadcastBreakoutEnd(webinarId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

interface WebinarSettings {
  maxAttendees: number;
  waitingRoom: boolean;
  muteOnEntry: boolean;
}
```

## Database Schema

```sql
-- Webinars
CREATE TABLE webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_call_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL REFERENCES users(id),
  organizer_name VARCHAR(255) NOT NULL,
  type VARCHAR(30) DEFAULT 'single_session',
  status VARCHAR(30) DEFAULT 'draft',
  schedule JSONB NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  registration_config JSONB NOT NULL DEFAULT '{}',
  engagement_config JSONB NOT NULL DEFAULT '{}',
  branding_config JSONB NOT NULL DEFAULT '{}',
  recording_config JSONB NOT NULL DEFAULT '{}',
  analytics JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webinar presenters
CREATE TABLE webinar_presenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL,
  can_share_screen BOOLEAN DEFAULT true,
  can_manage_participants BOOLEAN DEFAULT false,
  join_link TEXT NOT NULL,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webinar registrations
CREATE TABLE webinar_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  custom_answers JSONB DEFAULT '{}',
  join_link TEXT NOT NULL,
  join_token VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  watch_duration INTEGER,
  UNIQUE(webinar_id, email)
);

-- Q&A questions
CREATE TABLE webinar_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id),
  attendee_id UUID NOT NULL REFERENCES webinar_registrations(id),
  attendee_name VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  upvotes INTEGER DEFAULT 0,
  upvoter_ids UUID[] DEFAULT '{}',
  answer TEXT,
  answered_by VARCHAR(255),
  answered_at TIMESTAMPTZ,
  highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Polls
CREATE TABLE webinar_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id),
  question TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft',
  duration INTEGER,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Poll responses
CREATE TABLE webinar_poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES webinar_polls(id),
  attendee_id UUID NOT NULL REFERENCES webinar_registrations(id),
  option_ids UUID[] NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, attendee_id)
);

-- Breakout rooms
CREATE TABLE webinar_breakout_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id),
  stream_call_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  topic TEXT,
  capacity INTEGER DEFAULT 50,
  attendees UUID[] DEFAULT '{}',
  facilitator UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webinars_organizer ON webinars(organizer_id);
CREATE INDEX idx_webinars_status ON webinars(status);
CREATE INDEX idx_webinar_presenters_webinar ON webinar_presenters(webinar_id);
CREATE INDEX idx_webinar_registrations_webinar ON webinar_registrations(webinar_id);
CREATE INDEX idx_webinar_registrations_email ON webinar_registrations(email);
CREATE INDEX idx_webinar_registrations_token ON webinar_registrations(join_token);
CREATE INDEX idx_webinar_questions_webinar ON webinar_questions(webinar_id);
CREATE INDEX idx_webinar_questions_status ON webinar_questions(status);
CREATE INDEX idx_webinar_polls_webinar ON webinar_polls(webinar_id);
CREATE INDEX idx_webinar_breakout_webinar ON webinar_breakout_rooms(webinar_id);
```

## API Endpoints

```typescript
// POST /api/webinars
// Create webinar
{
  request: {
    title: string,
    description?: string,
    schedule: WebinarSchedule,
    settings?: Partial<WebinarSettings>,
    registration?: Partial<RegistrationConfig>
  },
  response: Webinar
}

// POST /api/webinars/:id/presenters
// Add presenter
{
  request: { userId: string, role: string, bio?: string },
  response: WebinarPresenter
}

// POST /api/webinars/:id/register
// Register attendee
{
  request: {
    email: string,
    name: string,
    company?: string,
    customAnswers?: Record<string, any>
  },
  response: WebinarRegistration
}

// POST /api/webinars/:id/registrations/:regId/approve
// Approve registration
{
  response: WebinarRegistration
}

// POST /api/webinars/:id/start
// Start webinar
{
  response: Webinar
}

// POST /api/webinars/:id/end
// End webinar
{
  response: Webinar
}

// POST /api/webinars/:id/join
// Join as attendee
{
  request: { token: string },
  response: { webinar: Webinar, attendeeToken: string, playbackUrl: string }
}

// POST /api/webinars/:id/questions
// Ask question
{
  request: { question: string, anonymous?: boolean },
  response: WebinarQuestion
}

// POST /api/webinars/:id/questions/:qId/upvote
// Upvote question
{
  response: WebinarQuestion
}

// POST /api/webinars/:id/polls
// Create poll
{
  request: { question: string, type: string, options: string[], duration?: number },
  response: WebinarPoll
}

// POST /api/webinars/:id/polls/:pollId/launch
// Launch poll
{
  response: WebinarPoll
}

// POST /api/webinars/:id/polls/:pollId/respond
// Submit poll response
{
  request: { optionIds: string[] },
  response: WebinarPoll
}

// POST /api/webinars/:id/breakout-rooms
// Create breakout rooms
{
  request: { rooms: { name: string, topic?: string }[] },
  response: BreakoutRoom[]
}

// POST /api/webinars/:id/breakout-rooms/start
// Start breakout sessions
{
  response: BreakoutRoom[]
}

// GET /api/webinars/:id/analytics
// Get analytics
{
  response: WebinarAnalytics
}
```

## Related Skills
- `video-conferencing-standard.md` - Interactive video for smaller meetings
- `live-streaming-standard.md` - Broadcast streaming
- `event-ticketing-standard.md` - Paid webinar ticketing

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Video
