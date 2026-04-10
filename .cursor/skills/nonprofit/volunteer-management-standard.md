# Volunteer Management Standard

## Overview
Comprehensive volunteer management for nonprofit organizations. Handles volunteer recruitment, onboarding, scheduling, hour tracking, skill matching, recognition programs, and impact reporting.

## Domain Context
- **Primary Projects**: Quik Giving, Nonprofit platforms, Community organizations
- **Related Domains**: Events, Donations, CRM
- **Key Integration**: Calendar systems, Background check APIs, Communication platforms

## Core Interfaces

```typescript
interface Volunteer {
  id: string;
  tenantId: string;
  contact: VolunteerContact;
  status: VolunteerStatus;
  type: VolunteerType;
  profile: VolunteerProfile;
  availability: AvailabilityPreferences;
  skills: VolunteerSkill[];
  interests: string[];
  credentials: VolunteerCredentials;
  training: TrainingRecord[];
  assignments: VolunteerAssignment[];
  hours: HoursSummary;
  recognition: RecognitionHistory;
  emergency: EmergencyContact;
  notes: VolunteerNote[];
  createdAt: Date;
  updatedAt: Date;
}

type VolunteerStatus =
  | 'applicant'
  | 'pending_approval'
  | 'pending_training'
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'alumni';

type VolunteerType = 'individual' | 'corporate' | 'student' | 'court_ordered' | 'intern';

interface VolunteerContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
  preferredContact: 'email' | 'phone' | 'text';
  communicationOptIn: boolean;
}

interface VolunteerProfile {
  bio?: string;
  photo?: string;
  occupation?: string;
  employer?: string;
  education?: string;
  languages: string[];
  tShirtSize?: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  transportation: 'own_vehicle' | 'public_transit' | 'needs_assistance';
  howHeard?: string;
  whyVolunteer?: string;
}

interface AvailabilityPreferences {
  general: WeeklyAvailability;
  exceptions: AvailabilityException[];
  maxHoursPerWeek?: number;
  preferredShiftLength?: number;
  remoteAvailable: boolean;
  onsiteAvailable: boolean;
  travelWilling: boolean;
  travelRadius?: number;
}

interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

interface TimeSlot {
  start: string; // HH:mm
  end: string;
}

interface VolunteerSkill {
  skillId: string;
  name: string;
  category: SkillCategory;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
}

type SkillCategory =
  | 'administrative'
  | 'technical'
  | 'creative'
  | 'education'
  | 'healthcare'
  | 'legal'
  | 'construction'
  | 'food_service'
  | 'transportation'
  | 'language'
  | 'social_services';

interface VolunteerCredentials {
  backgroundCheckStatus: 'not_required' | 'pending' | 'passed' | 'failed' | 'expired';
  backgroundCheckDate?: Date;
  backgroundCheckExpiry?: Date;
  references: Reference[];
  referencesVerified: boolean;
  driversLicense?: boolean;
  vehicleInsurance?: boolean;
  professionalLicenses: ProfessionalLicense[];
}

interface TrainingRecord {
  id: string;
  trainingId: string;
  trainingName: string;
  type: 'orientation' | 'safety' | 'skill' | 'certification' | 'refresher';
  status: 'assigned' | 'in_progress' | 'completed' | 'expired';
  assignedDate: Date;
  completedDate?: Date;
  expiryDate?: Date;
  score?: number;
  certificateUrl?: string;
}

interface VolunteerOpportunity {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  type: OpportunityType;
  status: 'draft' | 'open' | 'filled' | 'closed' | 'cancelled';
  program?: string;
  location: OpportunityLocation;
  schedule: OpportunitySchedule;
  requirements: OpportunityRequirements;
  slots: OpportunitySlots;
  signups: VolunteerSignup[];
  waitlist: WaitlistEntry[];
  supervisorId?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

type OpportunityType =
  | 'one_time'
  | 'recurring'
  | 'ongoing'
  | 'event'
  | 'virtual'
  | 'on_call';

interface OpportunityLocation {
  type: 'onsite' | 'remote' | 'hybrid';
  address?: Address;
  virtualLink?: string;
  instructions?: string;
}

interface OpportunitySchedule {
  startDate: Date;
  endDate?: Date;
  recurrence?: RecurrencePattern;
  shifts: Shift[];
  timeCommitment: string;
  flexibility: 'fixed' | 'flexible' | 'self_scheduled';
}

interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  slotsAvailable: number;
  slotsFilled: number;
}

interface OpportunityRequirements {
  minAge?: number;
  maxAge?: number;
  skills?: string[];
  training?: string[];
  backgroundCheck: boolean;
  physicalRequirements?: string[];
  languages?: string[];
  other?: string[];
}

interface OpportunitySlots {
  total: number;
  filled: number;
  available: number;
  waitlistEnabled: boolean;
  waitlistCount: number;
}

interface VolunteerSignup {
  id: string;
  volunteerId: string;
  volunteer: VolunteerSummary;
  opportunityId: string;
  shiftIds: string[];
  status: SignupStatus;
  signedUpAt: Date;
  confirmedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  hoursLogged?: number;
  noShow: boolean;
  feedback?: string;
  supervisorNotes?: string;
}

type SignupStatus =
  | 'pending'
  | 'confirmed'
  | 'waitlisted'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

interface VolunteerHours {
  id: string;
  volunteerId: string;
  opportunityId?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  hours: number;
  type: 'scheduled' | 'additional' | 'training' | 'travel' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

interface HoursSummary {
  totalHours: number;
  thisYearHours: number;
  thisMonthHours: number;
  lastActivityDate?: Date;
  hoursByProgram: Record<string, number>;
  hoursByType: Record<string, number>;
  yearToDateGoal?: number;
  milestones: HoursMilestone[];
}

interface HoursMilestone {
  hours: number;
  name: string;
  reachedAt?: Date;
  recognized: boolean;
}

interface RecognitionHistory {
  totalPoints: number;
  currentLevel: RecognitionLevel;
  badges: Badge[];
  awards: Award[];
  certificates: Certificate[];
  anniversaries: Anniversary[];
}

interface RecognitionLevel {
  name: string;
  minHours: number;
  maxHours?: number;
  benefits: string[];
  badgeUrl?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: Date;
  category: string;
}

interface Award {
  id: string;
  name: string;
  description: string;
  awardedAt: Date;
  awardedBy: string;
  ceremony?: string;
}
```

## Service Implementation

```typescript
class VolunteerManagementService {
  // Volunteer lifecycle
  async createVolunteer(input: CreateVolunteerInput): Promise<Volunteer>;
  async updateVolunteer(volunteerId: string, updates: UpdateVolunteerInput): Promise<Volunteer>;
  async approveVolunteer(volunteerId: string): Promise<Volunteer>;
  async deactivateVolunteer(volunteerId: string, reason: string): Promise<Volunteer>;
  async reactivateVolunteer(volunteerId: string): Promise<Volunteer>;

  // Credentials and training
  async initiateBackgroundCheck(volunteerId: string): Promise<BackgroundCheckResult>;
  async assignTraining(volunteerId: string, trainingId: string): Promise<TrainingRecord>;
  async completeTraining(volunteerId: string, trainingId: string, result: TrainingResult): Promise<TrainingRecord>;
  async checkCredentialExpiry(daysAhead: number): Promise<ExpiringCredential[]>;

  // Opportunities
  async createOpportunity(input: CreateOpportunityInput): Promise<VolunteerOpportunity>;
  async updateOpportunity(opportunityId: string, updates: UpdateOpportunityInput): Promise<VolunteerOpportunity>;
  async publishOpportunity(opportunityId: string): Promise<VolunteerOpportunity>;
  async closeOpportunity(opportunityId: string): Promise<VolunteerOpportunity>;
  async addShift(opportunityId: string, shift: CreateShiftInput): Promise<Shift>;

  // Signups and scheduling
  async signUpVolunteer(volunteerId: string, opportunityId: string, shiftIds: string[]): Promise<VolunteerSignup>;
  async confirmSignup(signupId: string): Promise<VolunteerSignup>;
  async cancelSignup(signupId: string, reason?: string): Promise<void>;
  async checkInVolunteer(signupId: string): Promise<VolunteerSignup>;
  async checkOutVolunteer(signupId: string, hours?: number): Promise<VolunteerSignup>;
  async markNoShow(signupId: string): Promise<VolunteerSignup>;

  // Matching
  async matchVolunteersToOpportunity(opportunityId: string): Promise<VolunteerMatch[]>;
  async recommendOpportunities(volunteerId: string): Promise<VolunteerOpportunity[]>;
  async findAvailableVolunteers(criteria: VolunteerSearchCriteria): Promise<Volunteer[]>;

  // Hours tracking
  async logHours(volunteerId: string, hours: CreateHoursInput): Promise<VolunteerHours>;
  async approveHours(hoursId: string): Promise<VolunteerHours>;
  async rejectHours(hoursId: string, reason: string): Promise<VolunteerHours>;
  async getHoursSummary(volunteerId: string): Promise<HoursSummary>;
  async getPendingHoursApprovals(): Promise<VolunteerHours[]>;

  // Recognition
  async awardBadge(volunteerId: string, badgeId: string): Promise<Badge>;
  async createAward(volunteerId: string, award: CreateAwardInput): Promise<Award>;
  async generateCertificate(volunteerId: string, type: string): Promise<Certificate>;
  async checkMilestones(volunteerId: string): Promise<HoursMilestone[]>;
  async updateRecognitionLevel(volunteerId: string): Promise<RecognitionLevel>;

  // Communication
  async sendOpportunityInvitation(opportunityId: string, volunteerIds: string[]): Promise<void>;
  async sendReminders(opportunityId: string): Promise<void>;
  async sendThankYou(signupId: string): Promise<void>;
  async sendNewsletter(templateId: string, filters?: VolunteerFilters): Promise<void>;

  // Reporting
  async getVolunteerReport(dateRange: DateRange): Promise<VolunteerReport>;
  async getImpactReport(dateRange: DateRange): Promise<ImpactReport>;
  async getProgramReport(programId: string): Promise<ProgramReport>;
  async exportVolunteers(filters?: VolunteerFilters): Promise<ExportResult>;
}
```

## Database Schema

```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  preferred_contact VARCHAR(20) DEFAULT 'email',
  status VARCHAR(30) DEFAULT 'applicant',
  volunteer_type VARCHAR(30) DEFAULT 'individual',
  bio TEXT,
  photo_url TEXT,
  occupation VARCHAR(255),
  employer VARCHAR(255),
  languages TEXT[],
  t_shirt_size VARCHAR(10),
  transportation VARCHAR(30),
  background_check_status VARCHAR(30),
  background_check_date DATE,
  background_check_expiry DATE,
  references_verified BOOLEAN DEFAULT false,
  total_hours DECIMAL(10,2) DEFAULT 0,
  this_year_hours DECIMAL(10,2) DEFAULT 0,
  last_activity_date DATE,
  recognition_level VARCHAR(50),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_skills (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50) NOT NULL,
  proficiency VARCHAR(30) DEFAULT 'intermediate',
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_availability (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  day_of_week INTEGER NOT NULL, -- 0-6
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_training (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  training_id UUID NOT NULL,
  training_name VARCHAR(255) NOT NULL,
  training_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'assigned',
  assigned_date DATE NOT NULL,
  completed_date DATE,
  expiry_date DATE,
  score INTEGER,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_opportunities (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  program VARCHAR(100),
  location_type VARCHAR(20) NOT NULL,
  address JSONB,
  virtual_link TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  recurrence JSONB,
  time_commitment VARCHAR(100),
  flexibility VARCHAR(30) DEFAULT 'fixed',
  min_age INTEGER,
  required_skills TEXT[],
  required_training TEXT[],
  background_check_required BOOLEAN DEFAULT false,
  physical_requirements TEXT[],
  total_slots INTEGER NOT NULL,
  filled_slots INTEGER DEFAULT 0,
  waitlist_enabled BOOLEAN DEFAULT false,
  supervisor_id UUID,
  contact_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opportunity_shifts (
  id UUID PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES volunteer_opportunities(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slots_available INTEGER NOT NULL,
  slots_filled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_signups (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  opportunity_id UUID NOT NULL REFERENCES volunteer_opportunities(id),
  shift_ids UUID[],
  status VARCHAR(30) DEFAULT 'pending',
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  hours_logged DECIMAL(5,2),
  no_show BOOLEAN DEFAULT false,
  feedback TEXT,
  supervisor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_hours (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  opportunity_id UUID REFERENCES volunteer_opportunities(id),
  signup_id UUID REFERENCES volunteer_signups(id),
  hours_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours DECIMAL(5,2) NOT NULL,
  hours_type VARCHAR(30) DEFAULT 'scheduled',
  status VARCHAR(30) DEFAULT 'pending',
  description TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_badges (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_image_url TEXT,
  badge_category VARCHAR(50),
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE volunteer_awards (
  id UUID PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id),
  award_name VARCHAR(255) NOT NULL,
  description TEXT,
  awarded_at DATE NOT NULL,
  awarded_by UUID,
  ceremony VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_volunteers_tenant_status ON volunteers(tenant_id, status);
CREATE INDEX idx_volunteers_email ON volunteers(email);
CREATE INDEX idx_skills_volunteer ON volunteer_skills(volunteer_id);
CREATE INDEX idx_skills_category ON volunteer_skills(skill_category);
CREATE INDEX idx_opportunities_tenant_status ON volunteer_opportunities(tenant_id, status);
CREATE INDEX idx_opportunities_dates ON volunteer_opportunities(start_date, end_date);
CREATE INDEX idx_shifts_opportunity ON opportunity_shifts(opportunity_id);
CREATE INDEX idx_shifts_date ON opportunity_shifts(shift_date);
CREATE INDEX idx_signups_volunteer ON volunteer_signups(volunteer_id);
CREATE INDEX idx_signups_opportunity ON volunteer_signups(opportunity_id);
CREATE INDEX idx_hours_volunteer ON volunteer_hours(volunteer_id);
CREATE INDEX idx_hours_date ON volunteer_hours(hours_date);
CREATE INDEX idx_hours_status ON volunteer_hours(status);
```

## API Endpoints

```typescript
// GET /api/volunteers - List volunteers
// GET /api/volunteers/:id - Get volunteer
// POST /api/volunteers - Create volunteer
// PUT /api/volunteers/:id - Update volunteer
// POST /api/volunteers/:id/approve - Approve volunteer
// POST /api/volunteers/:id/deactivate - Deactivate volunteer
// POST /api/volunteers/:id/training - Assign training
// PUT /api/volunteers/:id/training/:trainingId - Complete training
// GET /api/opportunities - List opportunities
// GET /api/opportunities/:id - Get opportunity
// POST /api/opportunities - Create opportunity
// PUT /api/opportunities/:id - Update opportunity
// POST /api/opportunities/:id/publish - Publish opportunity
// POST /api/opportunities/:id/shifts - Add shift
// POST /api/signups - Sign up for opportunity
// PUT /api/signups/:id/confirm - Confirm signup
// POST /api/signups/:id/checkin - Check in
// POST /api/signups/:id/checkout - Check out
// POST /api/hours - Log hours
// PUT /api/hours/:id/approve - Approve hours
// GET /api/volunteers/:id/hours - Get volunteer hours
// POST /api/volunteers/:id/badges - Award badge
// GET /api/reports/volunteers - Volunteer report
// GET /api/reports/impact - Impact report
```

## Related Skills
- `donation-management-standard.md` - Donor-volunteer overlap
- `campaign-management-standard.md` - Campaign volunteers
- `event-ticketing-standard.md` - Event volunteers

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Nonprofit
