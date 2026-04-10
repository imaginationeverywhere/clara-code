# Construction Project Management Standard

## Overview
Project management for construction, renovation, and contracting jobs. Handles project phases, task scheduling, material tracking, permit management, subcontractor coordination, change orders, and progress documentation with photo evidence.

## Domain Context
- **Primary Projects**: Pink-Collar-Contractors, Quik Construction
- **Related Domains**: Contractor, Payments, Equipment Rental
- **Key Integration**: Project management tools, DocuSign, Permit APIs, Material suppliers

## Core Interfaces

```typescript
interface ConstructionProject {
  id: string;
  tenantId: string;
  clientId: string;
  client: ProjectClient;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  address: ProjectAddress;
  phases: ProjectPhase[];
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  team: ProjectTeam;
  permits: Permit[];
  documents: ProjectDocument[];
  photos: ProjectPhoto[];
  changeOrders: ChangeOrder[];
  communications: ProjectCommunication[];
  weatherImpacts: WeatherImpact[];
  createdAt: Date;
  updatedAt: Date;
}

type ProjectType =
  | 'new_construction'
  | 'renovation'
  | 'addition'
  | 'remodel'
  | 'repair'
  | 'commercial_buildout'
  | 'landscaping'
  | 'roofing'
  | 'plumbing'
  | 'electrical'
  | 'hvac';

type ProjectStatus =
  | 'lead'
  | 'estimate'
  | 'proposal_sent'
  | 'contract_signed'
  | 'permitting'
  | 'scheduled'
  | 'in_progress'
  | 'on_hold'
  | 'punch_list'
  | 'final_inspection'
  | 'completed'
  | 'warranty';

interface ProjectTimeline {
  estimatedStartDate: Date;
  actualStartDate?: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  workingDays: number;
  delayDays: number;
  delayReasons: DelayReason[];
}

interface DelayReason {
  reason: 'weather' | 'permits' | 'materials' | 'labor' | 'change_order' | 'client' | 'inspection';
  description: string;
  daysImpact: number;
  date: Date;
}

interface ProjectPhase {
  id: string;
  name: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  startDate?: Date;
  endDate?: Date;
  tasks: ProjectTask[];
  percentComplete: number;
  dependencies: string[];
}

interface ProjectTask {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  assignedTo: TaskAssignment[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  actualHours?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  materials: TaskMaterial[];
  notes: string[];
  checklist: ChecklistItem[];
}

interface TaskAssignment {
  type: 'employee' | 'subcontractor';
  id: string;
  name: string;
  role: string;
}

interface TaskMaterial {
  materialId: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'needed' | 'ordered' | 'delivered' | 'installed';
  cost: number;
}

interface ProjectBudget {
  estimatedTotal: number;
  contractAmount: number;
  currentSpent: number;
  categories: BudgetCategory[];
  contingency: number;
  contingencyUsed: number;
  profitMargin: number;
  invoiced: number;
  paid: number;
}

interface BudgetCategory {
  name: string;
  estimated: number;
  actual: number;
  variance: number;
  items: BudgetItem[];
}

interface BudgetItem {
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  invoiceId?: string;
  paidDate?: Date;
}

interface ProjectTeam {
  projectManager: TeamMember;
  siteSuper?: TeamMember;
  employees: TeamMember[];
  subcontractors: SubcontractorAssignment[];
}

interface SubcontractorAssignment {
  subcontractorId: string;
  company: string;
  contactName: string;
  trade: string;
  contractAmount: number;
  status: 'pending' | 'contracted' | 'working' | 'completed' | 'paid';
  insuranceVerified: boolean;
  licenseVerified: boolean;
}

interface Permit {
  id: string;
  type: PermitType;
  number?: string;
  status: PermitStatus;
  jurisdiction: string;
  appliedDate?: Date;
  approvedDate?: Date;
  expiresDate?: Date;
  inspections: PermitInspection[];
  fees: number;
  documents: string[];
}

type PermitType = 'building' | 'electrical' | 'plumbing' | 'mechanical' | 'demolition' | 'grading' | 'fire' | 'occupancy';
type PermitStatus = 'not_needed' | 'pending' | 'applied' | 'approved' | 'expired' | 'closed';

interface PermitInspection {
  id: string;
  type: string;
  scheduledDate?: Date;
  completedDate?: Date;
  result: 'pending' | 'passed' | 'failed' | 'partial';
  inspector?: string;
  notes?: string;
  corrections?: string[];
}

interface ChangeOrder {
  id: string;
  number: number;
  title: string;
  description: string;
  reason: 'client_request' | 'unforeseen_condition' | 'design_change' | 'code_requirement' | 'error_correction';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  requestedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  costImpact: number;
  timeImpact: number;
  lineItems: ChangeOrderItem[];
  documents: string[];
}

interface ChangeOrderItem {
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  laborHours?: number;
}

interface ProjectPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  phase?: string;
  task?: string;
  location?: string;
  tags: string[];
  takenBy: string;
  takenAt: Date;
  geoLocation?: GeoLocation;
}

interface DailyLog {
  id: string;
  projectId: string;
  date: Date;
  weather: WeatherConditions;
  crewOnSite: CrewMember[];
  subcontractorsOnSite: string[];
  workCompleted: string[];
  materialsDelivered: MaterialDelivery[];
  equipmentUsed: string[];
  safetyIncidents: SafetyIncident[];
  visitorLog: Visitor[];
  notes: string;
  createdBy: string;
}

interface WeatherConditions {
  temperature: number;
  conditions: string;
  precipitation: boolean;
  windSpeed?: number;
  workableDay: boolean;
}
```

## Service Implementation

```typescript
class ConstructionProjectService {
  // Project lifecycle
  async createProject(input: CreateProjectInput): Promise<ConstructionProject>;
  async updateProject(projectId: string, updates: UpdateProjectInput): Promise<ConstructionProject>;
  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<ConstructionProject>;
  async archiveProject(projectId: string): Promise<void>;

  // Phase and task management
  async addPhase(projectId: string, phase: CreatePhaseInput): Promise<ProjectPhase>;
  async updatePhaseStatus(phaseId: string, status: string): Promise<ProjectPhase>;
  async addTask(phaseId: string, task: CreateTaskInput): Promise<ProjectTask>;
  async assignTask(taskId: string, assignment: TaskAssignment): Promise<ProjectTask>;
  async completeTask(taskId: string, completionData: TaskCompletionInput): Promise<ProjectTask>;

  // Budget management
  async updateBudget(projectId: string, budget: BudgetUpdate): Promise<ProjectBudget>;
  async addExpense(projectId: string, expense: ExpenseInput): Promise<BudgetItem>;
  async getBudgetVarianceReport(projectId: string): Promise<VarianceReport>;

  // Permit management
  async addPermit(projectId: string, permit: CreatePermitInput): Promise<Permit>;
  async updatePermitStatus(permitId: string, status: PermitStatus): Promise<Permit>;
  async scheduleInspection(permitId: string, inspection: ScheduleInspectionInput): Promise<PermitInspection>;
  async recordInspectionResult(inspectionId: string, result: InspectionResult): Promise<PermitInspection>;

  // Change orders
  async createChangeOrder(projectId: string, changeOrder: CreateChangeOrderInput): Promise<ChangeOrder>;
  async approveChangeOrder(changeOrderId: string, approvalData: ApprovalInput): Promise<ChangeOrder>;
  async rejectChangeOrder(changeOrderId: string, reason: string): Promise<ChangeOrder>;

  // Team management
  async assignSubcontractor(projectId: string, assignment: SubcontractorAssignment): Promise<void>;
  async verifySubcontractorCredentials(subcontractorId: string): Promise<CredentialVerification>;

  // Documentation
  async addPhoto(projectId: string, photo: PhotoUploadInput): Promise<ProjectPhoto>;
  async createDailyLog(projectId: string, log: CreateDailyLogInput): Promise<DailyLog>;
  async generateProgressReport(projectId: string): Promise<ProgressReport>;

  // Timeline
  async updateTimeline(projectId: string, timeline: TimelineUpdate): Promise<ProjectTimeline>;
  async addDelay(projectId: string, delay: DelayReason): Promise<ProjectTimeline>;
  async getProjectSchedule(projectId: string): Promise<GanttChartData>;

  // Reporting
  async getProjectDashboard(projectId: string): Promise<ProjectDashboard>;
  async getPortfolioOverview(tenantId: string): Promise<PortfolioOverview>;
}
```

## Database Schema

```sql
CREATE TABLE construction_projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'lead',
  priority VARCHAR(20) DEFAULT 'medium',
  address JSONB NOT NULL,
  estimated_start_date DATE,
  actual_start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  working_days INTEGER,
  delay_days INTEGER DEFAULT 0,
  estimated_total DECIMAL(12,2),
  contract_amount DECIMAL(12,2),
  current_spent DECIMAL(12,2) DEFAULT 0,
  contingency DECIMAL(12,2),
  contingency_used DECIMAL(12,2) DEFAULT 0,
  invoiced DECIMAL(12,2) DEFAULT 0,
  paid DECIMAL(12,2) DEFAULT 0,
  project_manager_id UUID,
  site_supervisor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_phases (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  name VARCHAR(255) NOT NULL,
  phase_order INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'not_started',
  start_date DATE,
  end_date DATE,
  percent_complete INTEGER DEFAULT 0,
  dependencies UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_tasks (
  id UUID PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES project_phases(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  scheduled_date DATE,
  completed_date DATE,
  checklist JSONB DEFAULT '[]',
  notes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_assignments (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES project_tasks(id),
  assignee_type VARCHAR(20) NOT NULL, -- employee, subcontractor
  assignee_id UUID NOT NULL,
  role VARCHAR(100),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_permits (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  permit_type VARCHAR(50) NOT NULL,
  permit_number VARCHAR(100),
  status VARCHAR(30) DEFAULT 'pending',
  jurisdiction VARCHAR(255),
  applied_date DATE,
  approved_date DATE,
  expires_date DATE,
  fees DECIMAL(10,2),
  documents TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permit_inspections (
  id UUID PRIMARY KEY,
  permit_id UUID NOT NULL REFERENCES project_permits(id),
  inspection_type VARCHAR(100) NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  result VARCHAR(20) DEFAULT 'pending',
  inspector VARCHAR(255),
  notes TEXT,
  corrections JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE change_orders (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  order_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reason VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  requested_by UUID NOT NULL,
  requested_date DATE NOT NULL,
  approved_by UUID,
  approved_date DATE,
  cost_impact DECIMAL(10,2),
  time_impact INTEGER,
  line_items JSONB DEFAULT '[]',
  documents TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_budget_items (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  invoice_id UUID,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_photos (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  phase VARCHAR(100),
  task VARCHAR(255),
  location VARCHAR(255),
  tags TEXT[],
  taken_by UUID NOT NULL,
  taken_at TIMESTAMPTZ,
  geo_location POINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_logs (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  log_date DATE NOT NULL,
  weather JSONB,
  crew_on_site JSONB,
  subcontractors_on_site TEXT[],
  work_completed TEXT[],
  materials_delivered JSONB,
  equipment_used TEXT[],
  safety_incidents JSONB,
  visitor_log JSONB,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, log_date)
);

CREATE TABLE subcontractor_assignments (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id),
  subcontractor_id UUID NOT NULL,
  trade VARCHAR(100) NOT NULL,
  contract_amount DECIMAL(12,2),
  status VARCHAR(30) DEFAULT 'pending',
  insurance_verified BOOLEAN DEFAULT false,
  license_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_tenant_status ON construction_projects(tenant_id, status);
CREATE INDEX idx_projects_client ON construction_projects(client_id);
CREATE INDEX idx_phases_project ON project_phases(project_id);
CREATE INDEX idx_tasks_phase ON project_tasks(phase_id);
CREATE INDEX idx_tasks_status ON project_tasks(status);
CREATE INDEX idx_permits_project ON project_permits(project_id);
CREATE INDEX idx_change_orders_project ON change_orders(project_id);
CREATE INDEX idx_photos_project ON project_photos(project_id);
CREATE INDEX idx_daily_logs_project_date ON daily_logs(project_id, log_date);
```

## API Endpoints

```typescript
// GET /api/projects - List projects
// GET /api/projects/:id - Get project details
// POST /api/projects - Create project
// PUT /api/projects/:id - Update project
// PUT /api/projects/:id/status - Update project status
// GET /api/projects/:id/schedule - Get Gantt chart data
// POST /api/projects/:id/phases - Add phase
// PUT /api/phases/:id - Update phase
// POST /api/phases/:id/tasks - Add task
// PUT /api/tasks/:id - Update task
// POST /api/tasks/:id/complete - Complete task
// POST /api/projects/:id/permits - Add permit
// POST /api/permits/:id/inspections - Schedule inspection
// PUT /api/inspections/:id - Record inspection result
// POST /api/projects/:id/change-orders - Create change order
// PUT /api/change-orders/:id/approve - Approve change order
// POST /api/projects/:id/photos - Upload photo
// POST /api/projects/:id/daily-logs - Create daily log
// GET /api/projects/:id/reports/progress - Get progress report
// GET /api/projects/:id/reports/budget - Get budget report
```

## Related Skills
- `contractor-management-standard.md` - Subcontractor management
- `equipment-rental-standard.md` - Equipment for projects
- `gig-worker-payments-standard.md` - Contractor payments

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Construction
