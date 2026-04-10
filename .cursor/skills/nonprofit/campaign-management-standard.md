# Campaign Management Standard

## Overview
Fundraising and awareness campaign management for nonprofits. Handles campaign creation, goal tracking, peer-to-peer fundraising, team management, donor communication, progress visualization, and impact reporting.

## Domain Context
- **Primary Projects**: Quik Giving, Nonprofit platforms
- **Related Domains**: Donations, Volunteers, Events
- **Key Integration**: Email marketing, Social media, Payment processing, Analytics

## Core Interfaces

```typescript
interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  goals: CampaignGoals;
  progress: CampaignProgress;
  timeline: CampaignTimeline;
  branding: CampaignBranding;
  pages: CampaignPage[];
  teams: FundraisingTeam[];
  participants: CampaignParticipant[];
  communications: CampaignCommunication[];
  integrations: CampaignIntegrations;
  settings: CampaignSettings;
  analytics: CampaignAnalytics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

type CampaignType =
  | 'annual_fund'
  | 'capital'
  | 'emergency'
  | 'peer_to_peer'
  | 'crowdfunding'
  | 'giving_day'
  | 'matching'
  | 'membership'
  | 'awareness'
  | 'advocacy';

type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'archived';

interface CampaignGoals {
  fundraisingGoal?: number;
  donorGoal?: number;
  participantGoal?: number;
  teamGoal?: number;
  impactGoal?: ImpactGoal;
  milestones: CampaignMilestone[];
}

interface ImpactGoal {
  metric: string;
  target: number;
  unit: string;
  description: string;
}

interface CampaignMilestone {
  id: string;
  name: string;
  type: 'amount' | 'donors' | 'participants' | 'custom';
  target: number;
  reward?: string;
  reached: boolean;
  reachedAt?: Date;
  announcement?: string;
}

interface CampaignProgress {
  amountRaised: number;
  donorCount: number;
  averageDonation: number;
  participantCount: number;
  teamCount: number;
  percentOfGoal: number;
  daysRemaining: number;
  dailyStats: DailyStat[];
  leaderboard: LeaderboardEntry[];
}

interface DailyStat {
  date: Date;
  amount: number;
  donors: number;
  newParticipants: number;
}

interface LeaderboardEntry {
  rank: number;
  type: 'individual' | 'team';
  id: string;
  name: string;
  avatar?: string;
  amountRaised: number;
  donorCount: number;
}

interface CampaignTimeline {
  launchDate: Date;
  endDate: Date;
  phases: CampaignPhase[];
  events: CampaignEvent[];
}

interface CampaignPhase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goal?: number;
  description?: string;
  activities: string[];
}

interface CampaignEvent {
  id: string;
  name: string;
  type: 'kickoff' | 'milestone' | 'deadline' | 'celebration' | 'update';
  date: Date;
  description?: string;
  virtualLink?: string;
  location?: string;
}

interface CampaignBranding {
  heroImage?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  video?: VideoInfo;
  story: string;
  tagline?: string;
  customCss?: string;
}

interface CampaignPage {
  id: string;
  type: 'main' | 'team' | 'participant' | 'thank_you' | 'landing';
  title: string;
  slug: string;
  url: string;
  content: PageContent;
  seo: SEOSettings;
  published: boolean;
}

interface PageContent {
  sections: ContentSection[];
  thermometerEnabled: boolean;
  leaderboardEnabled: boolean;
  recentDonorsEnabled: boolean;
  impactCounterEnabled: boolean;
}

interface ContentSection {
  id: string;
  type: 'hero' | 'story' | 'impact' | 'updates' | 'donors' | 'teams' | 'custom';
  content: Record<string, any>;
  order: number;
  visible: boolean;
}

interface FundraisingTeam {
  id: string;
  campaignId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  captain: ParticipantInfo;
  members: ParticipantInfo[];
  goal: number;
  amountRaised: number;
  donorCount: number;
  pageUrl: string;
  createdAt: Date;
}

interface CampaignParticipant {
  id: string;
  campaignId: string;
  userId?: string;
  type: 'fundraiser' | 'ambassador' | 'volunteer';
  contact: ParticipantContact;
  teamId?: string;
  personalGoal: number;
  amountRaised: number;
  donorCount: number;
  pageUrl: string;
  story?: string;
  image?: string;
  badges: string[];
  socialShares: number;
  emailsSent: number;
  status: 'invited' | 'registered' | 'active' | 'inactive';
  joinedAt: Date;
}

interface ParticipantContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CampaignCommunication {
  id: string;
  type: CommunicationType;
  name: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  audience: CommunicationAudience;
  content: CommunicationContent;
  scheduledFor?: Date;
  sentAt?: Date;
  stats?: CommunicationStats;
}

type CommunicationType =
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'social';

interface CommunicationAudience {
  type: 'all_donors' | 'participants' | 'team_captains' | 'custom' | 'segment';
  segmentId?: string;
  filters?: AudienceFilter[];
  estimatedCount: number;
}

interface CommunicationContent {
  subject?: string;
  preheader?: string;
  body: string;
  templateId?: string;
  personalization: PersonalizationField[];
  attachments?: string[];
  socialContent?: SocialContent;
}

interface CommunicationStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  donated: number;
  donationAmount: number;
}

interface CampaignIntegrations {
  socialMedia: SocialMediaIntegration[];
  email: EmailIntegration;
  analytics: AnalyticsIntegration;
  matching: MatchingIntegration;
}

interface SocialMediaIntegration {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  enabled: boolean;
  pageId?: string;
  defaultHashtags: string[];
  autoPost: boolean;
}

interface MatchingIntegration {
  enabled: boolean;
  matcherName?: string;
  matchRatio: number;
  maxMatch?: number;
  startDate?: Date;
  endDate?: Date;
  conditions?: string;
  matchedSoFar: number;
}

interface CampaignSettings {
  visibility: 'public' | 'unlisted' | 'private';
  allowAnonymousDonations: boolean;
  minimumDonation: number;
  suggestedAmounts: number[];
  coverFeeOption: boolean;
  defaultCoverFee: boolean;
  peerToPeerEnabled: boolean;
  teamCreationEnabled: boolean;
  publicLeaderboard: boolean;
  donorWallEnabled: boolean;
  commentsEnabled: boolean;
  socialSharingEnabled: boolean;
}

interface CampaignAnalytics {
  traffic: TrafficAnalytics;
  conversion: ConversionAnalytics;
  engagement: EngagementAnalytics;
  social: SocialAnalytics;
}

interface ConversionAnalytics {
  pageViews: number;
  donationStarts: number;
  donationCompletes: number;
  conversionRate: number;
  abandonmentRate: number;
  averageTimeToConvert: number;
}

interface SocialAnalytics {
  shares: number;
  impressions: number;
  engagement: number;
  referralDonations: number;
  referralAmount: number;
  topPlatform: string;
}
```

## Service Implementation

```typescript
class CampaignManagementService {
  // Campaign lifecycle
  async createCampaign(input: CreateCampaignInput): Promise<Campaign>;
  async updateCampaign(campaignId: string, updates: UpdateCampaignInput): Promise<Campaign>;
  async launchCampaign(campaignId: string): Promise<Campaign>;
  async pauseCampaign(campaignId: string, reason?: string): Promise<Campaign>;
  async completeCampaign(campaignId: string): Promise<Campaign>;
  async duplicateCampaign(campaignId: string, newName: string): Promise<Campaign>;

  // Goals and progress
  async updateGoals(campaignId: string, goals: CampaignGoals): Promise<Campaign>;
  async addMilestone(campaignId: string, milestone: CreateMilestoneInput): Promise<CampaignMilestone>;
  async checkMilestones(campaignId: string): Promise<CampaignMilestone[]>;
  async getProgress(campaignId: string): Promise<CampaignProgress>;
  async getLeaderboard(campaignId: string, type: 'individual' | 'team'): Promise<LeaderboardEntry[]>;

  // Pages
  async createPage(campaignId: string, page: CreatePageInput): Promise<CampaignPage>;
  async updatePage(pageId: string, updates: UpdatePageInput): Promise<CampaignPage>;
  async publishPage(pageId: string): Promise<CampaignPage>;
  async previewPage(pageId: string): Promise<string>;

  // Teams
  async createTeam(campaignId: string, team: CreateTeamInput): Promise<FundraisingTeam>;
  async joinTeam(teamId: string, participantId: string): Promise<FundraisingTeam>;
  async updateTeam(teamId: string, updates: UpdateTeamInput): Promise<FundraisingTeam>;
  async getTeamProgress(teamId: string): Promise<TeamProgress>;

  // Participants
  async inviteParticipant(campaignId: string, invite: ParticipantInvite): Promise<void>;
  async registerParticipant(campaignId: string, registration: ParticipantRegistration): Promise<CampaignParticipant>;
  async updateParticipant(participantId: string, updates: UpdateParticipantInput): Promise<CampaignParticipant>;
  async getParticipantPage(participantId: string): Promise<CampaignPage>;

  // Communications
  async createCommunication(campaignId: string, comm: CreateCommunicationInput): Promise<CampaignCommunication>;
  async scheduleCommunication(commId: string, sendAt: Date): Promise<CampaignCommunication>;
  async sendCommunication(commId: string): Promise<CommunicationStats>;
  async sendMilestoneAnnouncement(campaignId: string, milestoneId: string): Promise<void>;

  // Matching
  async configureMatching(campaignId: string, matching: MatchingConfig): Promise<MatchingIntegration>;
  async getMatchingProgress(campaignId: string): Promise<MatchingProgress>;

  // Social
  async generateSocialContent(campaignId: string, platform: string): Promise<SocialContent>;
  async postToSocial(campaignId: string, content: SocialPost): Promise<void>;
  async trackSocialShare(campaignId: string, share: SocialShareEvent): Promise<void>;

  // Analytics
  async getAnalytics(campaignId: string, dateRange?: DateRange): Promise<CampaignAnalytics>;
  async getCampaignReport(campaignId: string): Promise<CampaignReport>;
  async exportCampaignData(campaignId: string): Promise<ExportResult>;

  // Donor experience
  async getDonationPage(campaignId: string, participantId?: string): Promise<DonationPageData>;
  async trackPageView(campaignId: string, source?: string): Promise<void>;
  async getRecentDonors(campaignId: string, limit?: number): Promise<RecentDonor[]>;
  async getDonorWall(campaignId: string): Promise<DonorWallEntry[]>;
}
```

## Database Schema

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  fundraising_goal DECIMAL(12,2),
  donor_goal INTEGER,
  participant_goal INTEGER,
  team_goal INTEGER,
  amount_raised DECIMAL(12,2) DEFAULT 0,
  donor_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  team_count INTEGER DEFAULT 0,
  launch_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  hero_image TEXT,
  logo TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  video_url TEXT,
  story TEXT,
  tagline VARCHAR(255),
  visibility VARCHAR(20) DEFAULT 'public',
  p2p_enabled BOOLEAN DEFAULT false,
  team_creation_enabled BOOLEAN DEFAULT false,
  matching_enabled BOOLEAN DEFAULT false,
  matcher_name VARCHAR(255),
  match_ratio DECIMAL(5,2),
  max_match DECIMAL(12,2),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE TABLE campaign_milestones (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  name VARCHAR(255) NOT NULL,
  milestone_type VARCHAR(30) NOT NULL,
  target DECIMAL(12,2) NOT NULL,
  reward TEXT,
  reached BOOLEAN DEFAULT false,
  reached_at TIMESTAMPTZ,
  announcement TEXT,
  milestone_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_phases (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal DECIMAL(12,2),
  description TEXT,
  activities TEXT[],
  phase_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_pages (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  page_type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  content JSONB NOT NULL,
  seo JSONB,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fundraising_teams (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image TEXT,
  captain_id UUID,
  goal DECIMAL(12,2),
  amount_raised DECIMAL(12,2) DEFAULT 0,
  donor_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_participants (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  user_id UUID,
  participant_type VARCHAR(30) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  team_id UUID REFERENCES fundraising_teams(id),
  personal_goal DECIMAL(12,2),
  amount_raised DECIMAL(12,2) DEFAULT 0,
  donor_count INTEGER DEFAULT 0,
  story TEXT,
  image TEXT,
  badges TEXT[],
  social_shares INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_communications (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  comm_type VARCHAR(30) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  audience JSONB NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  template_id UUID,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_updates (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  posted_by UUID NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_donations (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  donation_id UUID NOT NULL,
  participant_id UUID REFERENCES campaign_participants(id),
  team_id UUID REFERENCES fundraising_teams(id),
  amount DECIMAL(10,2) NOT NULL,
  donor_name VARCHAR(255),
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_social_shares (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  participant_id UUID REFERENCES campaign_participants(id),
  platform VARCHAR(30) NOT NULL,
  share_url TEXT,
  clicks INTEGER DEFAULT 0,
  donations_attributed INTEGER DEFAULT 0,
  amount_attributed DECIMAL(10,2) DEFAULT 0,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_tenant_status ON campaigns(tenant_id, status);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_dates ON campaigns(launch_date, end_date);
CREATE INDEX idx_milestones_campaign ON campaign_milestones(campaign_id);
CREATE INDEX idx_teams_campaign ON fundraising_teams(campaign_id);
CREATE INDEX idx_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX idx_participants_team ON campaign_participants(team_id);
CREATE INDEX idx_communications_campaign ON campaign_communications(campaign_id);
CREATE INDEX idx_campaign_donations_campaign ON campaign_donations(campaign_id);
CREATE INDEX idx_campaign_donations_participant ON campaign_donations(participant_id);
```

## API Endpoints

```typescript
// GET /api/campaigns - List campaigns
// GET /api/campaigns/:id - Get campaign
// POST /api/campaigns - Create campaign
// PUT /api/campaigns/:id - Update campaign
// POST /api/campaigns/:id/launch - Launch campaign
// POST /api/campaigns/:id/pause - Pause campaign
// POST /api/campaigns/:id/complete - Complete campaign
// GET /api/campaigns/:id/progress - Get progress
// GET /api/campaigns/:id/leaderboard - Get leaderboard
// POST /api/campaigns/:id/milestones - Add milestone
// GET /api/campaigns/:id/pages - Get pages
// POST /api/campaigns/:id/pages - Create page
// PUT /api/pages/:id - Update page
// POST /api/pages/:id/publish - Publish page
// GET /api/campaigns/:id/teams - List teams
// POST /api/campaigns/:id/teams - Create team
// POST /api/teams/:id/join - Join team
// GET /api/campaigns/:id/participants - List participants
// POST /api/campaigns/:id/invite - Invite participant
// POST /api/campaigns/:id/register - Register participant
// POST /api/campaigns/:id/communications - Create communication
// POST /api/communications/:id/send - Send communication
// GET /api/campaigns/:id/analytics - Get analytics
// GET /api/campaigns/:id/donor-wall - Get donor wall
// POST /api/campaigns/:id/social-share - Track share
```

## Related Skills
- `donation-management-standard.md` - Donation processing
- `volunteer-management-standard.md` - Volunteer participants
- `event-ticketing-standard.md` - Campaign events

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Nonprofit
