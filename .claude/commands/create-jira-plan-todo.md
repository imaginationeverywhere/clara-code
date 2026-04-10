# Create Jira Plan & Todo - Enhanced Project Management Integration

Generate comprehensive technical architecture plans and implementation todos that are directly linked to your JIRA project stories and epics, creating seamless integration between development execution and project management visibility.

## Prerequisites
⚠️ **REQUIRED**: 
1. A `docs/PRD.md` file must exist (copy from `docs/PRD-TEMPLATE.md` if needed)
2. JIRA configuration must be set up using `sync-jira --connect`
3. The `.claude/commands/project-curl-commands.md` must have your authentication configured
4. For frontend epics/stories: A mockup template must be selected

## Overview

This enhanced command builds upon your existing create-plan-todo workflow by adding sophisticated Jira integration capabilities. It automatically populates project information from your PRD.md file and creates living documents that maintain bidirectional synchronization with your team's project management process. 

**PRD Integration**: All project-specific information is automatically extracted from `docs/PRD.md`:
- Project name and description
- Technology stack and frameworks
- Security and compliance requirements
- Team structure and stakeholders
- Performance targets and SLAs
- Frontend mockup template choice

**Mockup Template Integration**: For frontend development work, you must select a mockup template:
- **Default**: `retail` (e-commerce/Amazon-style)
- **Options**: `booking`, `property-rental`, `restaurant`, `custom`
- **Custom**: Place your own mockup files in `mockup/custom/`
- The selected template becomes the baseline for your Next.js frontend

**JIRA API Configuration**: All JIRA API calls use the commands defined in `.claude/commands/project-curl-commands.md` which contains:
- Your project authentication (Base64 encoded credentials)
- Your project configuration (domain, project key, board ID)
- Ready-to-use curl commands for all JIRA operations
- Proven API patterns for epic, story, and task management

## Command Usage

**Create Plan from Existing Jira Story:**
```bash
create-jira-plan-todo --story=[PROJECT_KEY]-101
# Fetches story details from Jira
# Pre-fills known requirements and acceptance criteria
# Creates technical plan linked to Jira story
# Generates implementation todos that sync progress back to Jira
# For frontend stories: Prompts for mockup template selection
```

**Create New Story with Technical Plan:**
```bash
create-jira-plan-todo --new-story --epic=[PROJECT_KEY]-100
# Creates new Jira story within specified epic
# Guides through technical requirements gathering
# Establishes bidirectional linking
# Sets up integrated workflow from the beginning
# For frontend epics: Requires mockup template selection
```

**Frontend Epic with Mockup Template:**
```bash
create-jira-plan-todo --new-epic --name="Frontend Setup" --mockup=retail
# Creates frontend epic with selected mockup as baseline
# Transforms mockup to Next.js 16 structure
# Integrates PRD content into template
# Available templates: retail, booking, property-rental, restaurant, custom
```

**Interactive Mode (Recommended):**
```bash
create-jira-plan-todo
# Presents your available epics and stories
# Guides you through selection or creation process
# For frontend work: Presents mockup template options
# Provides context from your [PROJECT_KEY] project board
# Creates properly linked and organized documentation
```

**Advanced Options:**
```bash
create-jira-plan-todo --story=[PROJECT_KEY]-101 --template=api-development
create-jira-plan-todo --epic=[PROJECT_KEY]-100 --analyze-dependencies
create-jira-plan-todo --story=[PROJECT_KEY]-101 --estimate-from-similar
create-jira-plan-todo --story=[PROJECT_KEY]-101 --mockup=custom
```

## Enhanced Planning Process

The integrated planning process seamlessly combines PRD context with JIRA project management. When you invoke this command, it:

1. **Verifies Prerequisites:**
   - Checks for `docs/PRD.md` existence
   - Validates JIRA configuration
   - Ensures authentication is set up
   - For frontend: Validates mockup template selection

2. **Extracts PRD Context:**
   - Project name and description
   - Technology stack specifications
   - Security and compliance requirements
   - Team structure and roles
   - Performance targets
   - Mockup template preference (if specified)

3. **Connects to JIRA:**
   - Fetches available epics and stories
   - Retrieves story details and acceptance criteria
   - Identifies related work and dependencies

4. **Mockup Template Selection (Frontend Only):**
   - Detects frontend epic/story creation
   - Presents available mockup templates
   - Validates custom mockup if selected
   - Prepares transformation to Next.js 16

5. **Applies Context Automatically:**
   - PRD information populates all templates
   - Technology choices guide architecture decisions
   - Security requirements inform implementation
   - Team structure determines task assignments
   - Mockup template provides UI/UX baseline

This eliminates manual entry of project information and ensures consistency across all documentation.

## Enhanced File Structure Creation

The command creates a sophisticated file structure that serves both development and project management needs while maintaining your familiar workflow patterns:

**Standardized File Structure (Following [PROJECT_KEY] Pattern):**
```
todo/not-started/[PROJECT_KEY]-100-epic-name/
├── epic-overview.md                         # Epic goals, timeline, stakeholder context
└── [PROJECT_KEY]-101-story-name/
    ├── story-plan.md                        # High-level technical architecture plan
    ├── [PROJECT_KEY]-102-subtask-name.md    # Individual Jira subtask file
    ├── [PROJECT_KEY]-103-subtask-name.md    # Individual Jira subtask file
    └── [PROJECT_KEY]-104-subtask-name.md    # Individual Jira subtask file
```

This standardized structure provides maximum efficiency with no duplication. Each file type serves a specific purpose:

**File Types and Purposes:**
- **epic-overview.md**: High-level epic context, business goals, timeline, stakeholder information
- **story-plan.md**: Technical architecture plan for the story (your familiar format)
- **Individual task files** ([PROJECT_KEY]-*.md): Detailed implementation for specific Jira subtasks

**Efficiency Benefits:**
- ✅ **No Duplication**: Eliminates redundant implementation-todos.md files
- ✅ **Direct Mapping**: Each task file = one Jira subtask
- ✅ **Standardized**: Follows proven [PROJECT_KEY] pattern
- ✅ **Granular Tracking**: Perfect visibility for scrum masters/PMs
- ✅ **Developer Focused**: Detailed implementation guidance where needed

## Mockup Template Transformation (Frontend Epics)

When creating frontend epics or stories, the command performs sophisticated mockup-to-Next.js transformation:

**Template Selection Process:**
1. **Automatic Detection**: Identifies frontend work from epic/story name
2. **Template Options**:
   - `retail` - E-commerce with product catalog, cart, checkout
   - `booking` - Service appointments with calendar integration
   - `property-rental` - Real estate listings and search
   - `restaurant` - Food service with menu and reservations
   - `custom` - Your own mockup in `mockup/custom/`

**Transformation Steps:**
1. **Structure Conversion**:
   - Vite+React 18 → Next.js 16 App Router
   - React components → Next.js RSC/Client components
   - React Router → Next.js file-based routing
   - Tailwind 3.x → Tailwind 4 with design tokens

2. **Technology Integration**:
   - Adds Clerk Auth to authentication flows
   - Integrates Apollo Client for GraphQL
   - Implements Redux Persist for state management
   - Applies shadcn/ui component patterns

3. **PRD Content Population**:
   - Replaces placeholder text with PRD project name
   - Updates branding with PRD color schemes
   - Populates user roles from PRD specifications
   - Applies business logic from PRD requirements

4. **Component Mapping**:
   - Maps mockup pages to Next.js app directory structure
   - Converts mockup components to reusable UI components
   - Transforms mockup layouts to Next.js layouts
   - Adapts mockup data to PRD-specified data models

## Intelligent Requirements Integration

The command performs intelligent analysis combining PRD requirements with JIRA story details:

**PRD-Driven Technical Requirements:** 
- Automatically applies technology stack from PRD
- Incorporates security requirements for all features
- Applies performance targets to implementation planning
- Uses compliance requirements to guide architecture
- Integrates mockup template as frontend baseline

**Business-to-Technical Translation:** 
- Analyzes JIRA acceptance criteria
- Suggests technical implementation based on PRD patterns
- Example: "user authentication" → applies PRD auth service choice
- Maps business features to mockup template components

**Dependency Detection:** 
- Cross-references PRD dependencies section
- Identifies JIRA story relationships
- Detects shared infrastructure from PRD architecture
- Prevents implementation conflicts
- Ensures mockup components align with backend APIs

**Automatic Context Application:**
- All templates pre-filled with PRD values
- No need to specify project name, tech stack, etc.
- Consistent terminology across all documentation
- Team roles and responsibilities auto-populated
- Mockup template adapted to project requirements

## Auto-Population from Multiple Sources

The command combines PRD context with JIRA information for comprehensive auto-population:

**From PRD.md:**
- Project name and description
- Technology stack (frontend, backend, database, etc.)
- Authentication service configuration
- Security and compliance requirements
- Performance targets and SLAs
- Team structure and contacts
- Frontend mockup template choice (`[MOCKUP_TEMPLATE_CHOICE]`)

**From JIRA:**
- Story description and acceptance criteria
- Epic context and relationships
- Priority and timeline information
- Assignee and team assignments
- Related stories and dependencies

**From Mockup Template:**
- Complete UI/UX component structure
- Page layouts and navigation patterns
- User flow implementations
- Design system foundations
- Interactive component behaviors

**From Todo Summaries:**
- Previous implementation patterns
- Reusable components and services
- Established architectural decisions
- Lessons learned from similar features

This multi-source approach eliminates redundant data entry and ensures consistency.

## Enhanced Template System

The command uses PRD-aware templates that automatically adapt to your project:

**PRD-Based Template Customization:**
- Technology stack sections match your PRD choices
- Security sections based on PRD compliance requirements
- Performance criteria from PRD targets
- Team assignments from PRD stakeholder list

**Smart Template Selection:** 
- Analyzes JIRA story type and PRD context
- Suggests appropriate template (API, UI, database, etc.)
- Pre-fills with relevant PRD information
- Includes project-specific requirements

**Dynamic Section Generation:** 
- Payment stories include PRD payment service config
- Auth stories reference PRD authentication service
- API stories use PRD API architecture choices
- All sections pre-populated with PRD context

**Consistency Enforcement:**
- Uses PRD terminology throughout
- Applies PRD naming conventions
- References PRD success criteria
- Maintains PRD technical standards

## Bidirectional Linking and Synchronization

The resulting technical plans and todo files maintain sophisticated bidirectional relationships with your Jira project:

**Live Status Synchronization:** As you complete tasks in your implementation todos, the corresponding Jira tasks automatically update their status. This provides real-time visibility to project managers without requiring separate status reporting.

**Progress Commentary:** The system can automatically post technical progress comments to Jira stories, providing stakeholders with insight into implementation progress without exposing unnecessary technical complexity.

**Attachment Synchronization:** Your technical architecture plans become attachments on the corresponding Jira stories, ensuring that stakeholders have access to technical context when needed while maintaining the primary technical documentation in your preferred file-based format.

## Integration with Existing Workflow

This enhanced command seamlessly integrates with your existing development workflow while adding project management capabilities:

**Backwards Compatibility:** The command can still be used without Jira integration for projects that don't require project management integration, maintaining compatibility with your existing workflow patterns.

**Automatic Detection:** The system automatically detects whether Jira integration is configured and adapts its behavior accordingly. When Jira integration is available, it provides enhanced capabilities, but it degrades gracefully when working in offline or non-integrated environments.

**Workflow Enhancement:** Your familiar planning process remains the same from a user perspective, but the resulting artifacts automatically include project management integration. This means you can adopt the enhanced capabilities without changing your established development practices.

## Command Implementation

## Complete Automated Workflow Implementation

When invoked, the command executes this complete automated workflow:

1. **Verify Prerequisites**:
   - Check for `docs/PRD.md` file
   - Validate JIRA configuration exists
   - Ensure authentication is configured

2. **Load Project Context**:
   - Extract all project information from PRD.md
   - Load any existing todo summaries
   - Check relationships.json for patterns

3. **JIRA Integration**:
   - Authenticate using project-curl-commands.md
   - Create Epic with PRD-informed description
   - Create Stories with PRD context included
   - Generate Subtasks for granular tracking

4. **Local File Generation**:
   - Create directory structure following [PROJECT_KEY] pattern
   - Generate epic-overview.md with PRD business context
   - Create story-plan.md files with PRD technical context
   - Generate individual task files with PRD requirements

5. **Bidirectional Sync Setup**:
   - Establish JIRA-to-local file mappings
   - Configure progress tracking
   - Set up auto-population of JIRA descriptions
   - Enable status synchronization

6. **Validation**:
   - Verify all PRD requirements are included
   - Ensure JIRA issues have rich descriptions
   - Confirm bidirectional links work
   - Validate file structure completeness

## Proven Complete Implementation Process

**Phase 1: Epic and Story Creation (Automated)**
```bash
# All curl commands use authentication from todo/jira-config/project-curl-commands.md

# Epic Creation (using PROJECT_KEY=[PROJECT_KEY], authenticated credentials)
curl -X POST \
  "https://quikinfluence-team.atlassian.net/rest/api/3/issue" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  --data '{"fields":{"project":{"key":"[PROJECT_KEY]"},"summary":"Epic Title","description":{"type":"doc","version":1,"content":[...]},"issuetype":{"name":"Epic"},"priority":{"name":"High"}}}'

# Story Creation (8 stories automatically - see project-curl-commands.md for authentication pattern)
# Uses same authentication and project configuration as defined in config file
```

**Phase 2: Local Structure Creation (Automated)**
```bash
# Create epic and story directories
mkdir -p todo/not-started/[PROJECT_KEY]-1-epic-name/{[PROJECT_KEY]-2-story1,[PROJECT_KEY]-3-story2,[PROJECT_KEY]-4-story3,[PROJECT_KEY]-5-story4,[PROJECT_KEY]-6-story5,[PROJECT_KEY]-7-story6,[PROJECT_KEY]-8-story7,[PROJECT_KEY]-9-story8}

# Create JIRA sync structure
mkdir -p todo/jira-sync/{epics,stories,tasks}
mkdir -p todo/jira-config

# Generate all local files
echo "Epic overview content" > todo/not-started/[PROJECT_KEY]-1-epic-name/epic-overview.md
for i in {2..9}; do
  echo "Story plan content" > todo/not-started/[PROJECT_KEY]-1-epic-name/[PROJECT_KEY]-$i-story/story-plan.md
done
```

**Phase 3: Subtask Creation (Fully Automated)**
```bash
# Create 3-5 subtasks per story (27 total subtasks)
for story_key in [PROJECT_KEY]-2 [PROJECT_KEY]-3 [PROJECT_KEY]-4 [PROJECT_KEY]-5 [PROJECT_KEY]-6 [PROJECT_KEY]-7 [PROJECT_KEY]-8 [PROJECT_KEY]-9; do
  for task_num in 1 2 3 4; do  # 4 tasks per story average
    curl -X POST -H "Authorization: Basic [BASE64_AUTH]" -H "Content-Type: application/json" \
      --data '{"fields":{"project":{"key":"[PROJECT_KEY]"},"summary":"Task Title","description":{"type":"doc","version":1,"content":[...]},"issuetype":{"name":"Sub-task"},"priority":{"name":"High"},"parent":{"key":"'$story_key'"}}}' \
      https://quikinfluence-team.atlassian.net/rest/api/3/issue
  done
done
```

**Phase 4: JIRA Configuration (Automated)**
```bash
# Create JIRA config files
cat > todo/jira-config/connection.json << EOF
{
  "jira_url": "https://quikinfluence-team.atlassian.net",
  "project_key": "[PROJECT_KEY]",
  "board_id": "[BOARD_ID]",
  "sync_strategy": "local_wins_implementation",
  "auto_sync_enabled": true
}
EOF

# Create field mappings and status mappings
# Generate sync history and integration files
```

## Successful Implementation Results

**[PROJECT_NAME] System Created:**
- ✅ **Epic [PROJECT_KEY]-10**: Epic created in JIRA
- ✅ **8 Stories ([PROJECT_KEY]-2 to [PROJECT_KEY]-9)**: All stories created and linked to epic
- ✅ **27 Subtasks ([PROJECT_KEY]-11 to [PROJECT_KEY]-38)**: Complete granular breakdown for PM visibility
- ✅ **Local Directory Structure**: Complete [PROJECT_NAME] pattern implementation
- ✅ **JIRA Configuration**: Full bidirectional sync setup
- ✅ **Business Requirements**: Integrated throughout all planning
- ✅ **Industry Focus**: Maintained in all documentation
- ✅ **Enterprise Scalability**: Ready for production deployment

**Verified Working Authentication:**
```bash
curl -H "Authorization: Basic [BASE64_AUTH]"
```

**Board URL**: https://quikinfluence-team.atlassian.net/jira/software/c/projects/[PROJECT_KEY]/boards/[BOARD_ID]

When invoked, I will execute this complete proven workflow automatically:

## Working Jira API Implementation

**Proven Authentication Pattern:**
```bash
curl -H "Authorization: Basic [BASE64_AUTH]"
```

**Key Implementation Details:**
- **Base URL**: `https://quikinfluence-team.atlassian.net/rest/api/3/`
- **Project Key**: `[PROJECT_KEY]`
- **Board URL**: `https://quikinfluence-team.atlassian.net/jira/software/c/projects/[PROJECT_KEY]/boards/[BOARD_ID]`
- **Epic Issue Type**: `Epic`
- **Story Issue Type**: `Story` 
- **Subtask Issue Type**: `Sub-task`
- **Parent Link Field**: `parent` (for subtasks linking to stories)
- **Priority Names**: Highest, High, Medium, Low, Lowest
- **Test Results**: Epic + Stories + Subtasks created successfully

**Working Epic Creation Pattern:**
```bash
curl -X POST \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  --data '{"fields":{"project":{"key":"[PROJECT_KEY]"},"summary":"Epic Title","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Epic description here"}]}]},"issuetype":{"name":"Epic"},"priority":{"name":"High"}}}' \
  https://quikinfluence-team.atlassian.net/rest/api/3/issue
```

**Working Story Creation Pattern:**
```bash
curl -X POST \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  --data '{"fields":{"project":{"key":"[PROJECT_KEY]"},"summary":"Story Title","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Story description here"}]}]},"issuetype":{"name":"Story"},"priority":{"name":"High"},"parent":{"key":"[PROJECT_KEY]-10"}}}' \
  https://quikinfluence-team.atlassian.net/rest/api/3/issue
```

**Working Subtask Creation Pattern:**
```bash
curl -X POST \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  --data '{"fields":{"project":{"key":"[PROJECT_KEY]"},"summary":"Subtask Title","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Subtask description here"}]}]},"issuetype":{"name":"Sub-task"},"priority":{"name":"High"},"parent":{"key":"[PROJECT_KEY]-2"}}}' \
  https://quikinfluence-team.atlassian.net/rest/api/3/issue
```

**Story Description Update Pattern:**
```bash
curl -X PUT -u "email:token" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "description": {
        "version": 1,
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [{"type": "text", "text": "Story description from story-plan.md"}]
          },
          {
            "type": "heading",
            "attrs": {"level": 3},
            "content": [{"type": "text", "text": "Business Context"}]
          }
        ]
      }
    }
  }' \
  "https://quikinfluence-team.atlassian.net/rest/api/3/issue/[PROJECT_KEY]-53"
```

**Atlassian Document Format Required:**
- Use structured JSON with `version`, `type`, `content` array
- Support `paragraph`, `bulletList`, `listItem` types
- Include `marks` for `strong`, `em` formatting
- This format is mandatory for descriptions (plain text fails)

## Automatic Subtask Creation for Stories

**Enhanced Workflow for Scrum Masters and Product Owners:**

The command now automatically creates Jira subtasks for each story, providing granular visibility into development progress for project stakeholders. This addresses the critical gap between high-level story tracking and detailed implementation work.

**Automatic Subtask Generation Process:**

1. **Analysis of Implementation Todos**: After creating the story implementation todos (e.g., `[PROJECT_KEY]-301-implementation-todos.md`), the command analyzes the task structure to identify logical subtasks
2. **Subtask Extraction**: Major phases and tasks from the implementation todos are converted into individual Jira subtasks
3. **Jira Subtask Creation**: Each subtask is created in Jira with proper parent linking and detailed descriptions
4. **Bidirectional Linking**: Local implementation todos reference the Jira subtask keys for progress tracking

**Subtask Creation Logic:**

For each story's implementation todos, the command identifies:
- **Phase-Level Subtasks**: Major implementation phases become individual subtasks
- **Critical Tasks**: High-priority tasks that warrant separate tracking
- **Cross-Team Dependencies**: Tasks requiring coordination with other teams
- **Deliverable Milestones**: Tasks that produce specific deliverables for stakeholders

**Example Subtask Structure for [PROJECT_KEY]-53 (Infrastructure & Security Setup):**

```
[PROJECT_KEY]-53: Infrastructure & Security Setup (Parent Story)
├── [PROJECT_KEY]-53-1: Infrastructure Creation and Configuration
├── [PROJECT_KEY]-53-2: Security Configuration  
├── [PROJECT_KEY]-53-3: Integration Configuration
├── [PROJECT_KEY]-53-4: Environment Setup
└── [PROJECT_KEY]-53-5: Testing and Validation
```

**Subtask Naming Convention:**
- **Format**: `{STORY-KEY}-{SEQUENCE}: {DESCRIPTIVE-TITLE}`
- **Example**: `[PROJECT_KEY]-53-1: Infrastructure Creation and Configuration`
- **Benefits**: Clear hierarchy, easy sorting, logical grouping

**Automated Subtask Creation Implementation:**

```bash
# Function to create subtasks for a story
create_story_subtasks() {
  local story_key="$1"
  local story_todos_file="$2"
  
  # Extract major tasks from implementation todos
  local subtasks=$(extract_subtasks_from_todos "$story_todos_file")
  
  # Create each subtask in Jira
  echo "$subtasks" | while IFS='|' read -r title description priority; do
    create_jira_subtask "$story_key" "$title" "$description" "$priority"
  done
}

# Create individual Jira subtask
create_jira_subtask() {
  local parent_key="$1"
  local title="$2" 
  local description="$3"
  local priority="${4:-3}"  # Default to Medium
  
  curl -X POST \
    -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"fields\": {
        \"project\": {\"key\": \"QAC\"},
        \"summary\": \"$title\",
        \"description\": $(convert_to_atlassian_format "$description"),
        \"issuetype\": {\"id\": \"10003\"},
        \"priority\": {\"id\": \"$priority\"},
        \"assignee\": {\"accountId\": \"712020:f5687b7d-1793-48a2-a3a4-5c26106caa2c\"},
        \"parent\": {\"key\": \"$parent_key\"}
      }
    }" \
    "https://quikinfluence-team.atlassian.net/rest/api/3/issue"
}
```

**Stakeholder Benefits:**

- **Scrum Masters**: Granular view of story progress with individual subtask completion tracking
- **Product Owners**: Clear visibility into which specific aspects of a story are complete vs. in-progress
- **Project Managers**: Detailed progress reporting without requiring technical knowledge of implementation details
- **Developers**: Jira subtasks that directly correspond to their actual implementation work

**Progress Tracking Integration:**

Each subtask in Jira corresponds to specific sections in the local implementation todos, enabling:
- **Automatic Status Updates**: As developers complete sections, corresponding Jira subtasks can be updated
- **Progress Reporting**: Project stakeholders see real-time progress on specific implementation aspects
- **Dependency Tracking**: Subtasks can indicate when specific dependencies are resolved
- **Milestone Communication**: Completion of subtasks triggers stakeholder notifications for important milestones

**Successful Implementation Example:**
The system successfully creates complete epics with stories:
- **[PROJECT_KEY]-20** (Epic): Platform Architecture 
- **[PROJECT_KEY]-21** (Story): Infrastructure Setup & Development
- **[PROJECT_KEY]-22** (Story): Authentication Service
- **[PROJECT_KEY]-23** (Story): Core Service Implementation
- **[PROJECT_KEY]-24** (Story): Business Logic Service
- **[PROJECT_KEY]-25** (Story): Integration Service
- **[PROJECT_KEY]-26** (Story): Deployment & Monitoring

All issues properly linked, assigned, prioritized, and formatted with rich descriptions.

**Implementation Notes:**
- Direct curl API approach proves reliable and fully functional
- Use curl implementation for all Jira automation
- Authentication via project configuration file
- Template variables replaced during sync-jira setup

## Complete Automated Workflow

When the enhanced command is executed, it now performs the complete workflow automatically:

**Phase 1: Epic and Story Creation**
1. Creates the epic in Jira with proper description and metadata
2. Creates all stories within the epic using T-shirt sizing
3. Links stories to the epic using customfield_10014

**Phase 2: Local Documentation Generation**
1. Creates the epic overview document with business context
2. Generates story plan documents for each story (high-level architecture)
3. Creates individual task files for each subtask within story directories

**Phase 2.5: Local Files to JIRA Population (Critical Integration)**

The system creates two critical files that populate JIRA with rich business and technical context:

### Epic Overview → JIRA Epic Description
**File**: `epic-overview.md` (e.g., `todo/not-started/[EPIC-KEY]-epic-name/epic-overview.md`)

**Purpose**: Provides comprehensive business context, stakeholder alignment, and technical architecture for the entire epic.

**JIRA Integration**: This file's content is automatically converted to Atlassian Document Format (ADF) and populates the JIRA epic description with:
- Business goals and objectives
- Epic story breakdown with links to individual stories
- Technical architecture overview
- Cultural competency requirements (if applicable)
- Success criteria and risk management
- Stakeholder alignment information
- Dependencies and integration points

**Why This Matters**: Scrum masters and product owners get complete epic context directly in JIRA without needing to understand technical file structures.

### Story Plan → JIRA Story Description  
**File**: `story-plan.md` (e.g., `todo/not-started/[EPIC-KEY]-epic-name/[STORY-KEY]-story-name/story-plan.md`)

**Purpose**: Provides detailed technical architecture, implementation approach, and business context for each individual story.

**JIRA Integration**: This file's content is automatically converted to ADF and populates each JIRA story description with:
- Business context and technical architecture
- Implementation approach with phases
- Detailed acceptance criteria
- Dependencies and risk assessment
- Success metrics and testing strategy
- Cultural competency considerations
- Integration points with other stories

**Why This Matters**: Product owners see exactly what technical work is being done, how it aligns with business goals, and what the definition of done looks like - all directly in JIRA.

### Automated Population Process
1. **Content Extraction**: System reads `epic-overview.md` and each `story-plan.md` file
2. **ADF Conversion**: Converts markdown to Atlassian Document Format with proper headings, lists, and links
3. **JIRA API Updates**: Uses project curl commands to update epic and story descriptions
4. **Link Preservation**: Maintains bidirectional links between local files and JIRA issues
5. **Rich Formatting**: Preserves formatting, code blocks, and structured information

**Example Implementation:**
```bash
# Update epic description from epic-overview.md
curl -X PUT \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[EPIC-KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  -d "$(convert_epic_overview_to_adf epic-overview.md)"

# Update story description from story-plan.md  
curl -X PUT \
  "https://[JIRA_DOMAIN]/rest/api/3/issue/[STORY-KEY]" \
  -H "Authorization: Basic [BASE64_AUTH]" \
  -H "Content-Type: application/json" \
  -d "$(convert_story_plan_to_adf story-plan.md)"
```

This ensures project stakeholders have complete visibility into both business goals and technical implementation directly within JIRA, while developers maintain their preferred file-based workflow.

**Phase 3: Automatic Subtask Creation**
1. Analyzes each story plan to identify major implementation phases
2. Extracts 3-5 major subtasks per story based on technical requirements
3. Creates Jira subtasks with proper parent linking
4. Creates corresponding local task files (e.g., [PROJECT_KEY]-59-task-implementation.md)
5. Establishes bidirectional linking between Jira subtasks and local task files

**Phase 4: Integration and Linking**
1. Establishes bidirectional references between local files and Jira issues
2. Sets up progress tracking mechanisms
3. Configures stakeholder visibility and notification preferences
4. Validates that all Jira stories have comprehensive descriptions populated from story plans

**Example Complete Workflow Output:**

**Jira Structure:**
```
[PROJECT_KEY]-52 (Epic): Document Management System - File Storage Integration
├── [PROJECT_KEY]-53 (Story): Infrastructure & Security Setup [Size: M]
│   ├── [PROJECT_KEY]-59: Infrastructure Creation and Configuration
│   ├── [PROJECT_KEY]-60: Security Configuration
│   └── [PROJECT_KEY]-61: Integration Configuration
├── [PROJECT_KEY]-54 (Story): Backend Service [Size: L]
│   ├── [PROJECT_KEY]-62: Server and API Endpoints
│   ├── [PROJECT_KEY]-63: File Upload and Validation Logic
│   └── [PROJECT_KEY]-64: Storage Integration and Error Handling
├── [PROJECT_KEY]-55 (Story): Database & API Integration [Size: M]
│   ├── [PROJECT_KEY]-65: Database Schema and Migrations
│   ├── [PROJECT_KEY]-66: API Schema Extensions
│   └── [PROJECT_KEY]-67: Implementation
├── [PROJECT_KEY]-56 (Story): Frontend Components [Size: L]
│   ├── [PROJECT_KEY]-68: Core Upload Components
│   ├── [PROJECT_KEY]-69: File Management Interface
│   └── [PROJECT_KEY]-70: Mobile Optimization
├── [PROJECT_KEY]-57 (Story): Business-Specific Features [Size: M]
│   ├── [PROJECT_KEY]-71: File Type Support
│   ├── [PROJECT_KEY]-72: Document Features
│   └── [PROJECT_KEY]-73: Compliance System
└── [PROJECT_KEY]-58 (Story): Testing & Deployment [Size: M]
    ├── [PROJECT_KEY]-74: Test Suite Development
    ├── [PROJECT_KEY]-75: Performance Testing
    └── [PROJECT_KEY]-76: Deployment Preparation
```

**Standardized Local File Structure (Following Proven Pattern):**
```
todo/not-started/[EPIC-KEY]-epic-name/
├── epic-overview.md                           # → POPULATES JIRA Epic Description
├── [STORY-KEY]-story-name/
│   ├── story-plan.md                         # → POPULATES JIRA Story Description  
│   ├── [SUBTASK-KEY]-subtask-name.md         # → Individual JIRA Subtask
│   ├── [SUBTASK-KEY]-subtask-name.md         # → Individual JIRA Subtask
│   └── [SUBTASK-KEY]-subtask-name.md         # → Individual JIRA Subtask
├── [PROJECT_KEY]-302-backend-file-service/
│   ├── story-plan.md
│   ├── [PROJECT_KEY]-62-server-api.md
│   ├── [PROJECT_KEY]-63-file-upload-validation.md
│   └── [PROJECT_KEY]-64-storage-integration.md
├── [PROJECT_KEY]-303-database-api/
│   ├── story-plan.md
│   ├── [PROJECT_KEY]-65-database-schema.md
│   ├── [PROJECT_KEY]-66-api-schema.md
│   └── [PROJECT_KEY]-67-implementation.md
├── [PROJECT_KEY]-304-frontend-components/
│   ├── story-plan.md
│   ├── [PROJECT_KEY]-68-core-upload-components.md
│   ├── [PROJECT_KEY]-69-file-management-interface.md
│   └── [PROJECT_KEY]-70-mobile-optimization.md
├── [PROJECT_KEY]-305-business-features/
│   ├── story-plan.md
│   ├── [PROJECT_KEY]-71-file-type-support.md
│   ├── [PROJECT_KEY]-72-document-features.md
│   └── [PROJECT_KEY]-73-compliance-system.md
└── [PROJECT_KEY]-306-testing-deployment/
    ├── story-plan.md
    ├── [PROJECT_KEY]-74-test-suite-development.md
    ├── [PROJECT_KEY]-75-performance-testing.md
    └── [PROJECT_KEY]-76-deployment-preparation.md
```

## Complete File-to-JIRA Integration System

### Why This Integration Matters

Traditional development creates a disconnect between technical work and project management visibility. This system solves that by creating **living documentation** that serves both developers and stakeholders through bidirectional synchronization.

### File Types and JIRA Population

#### 1. Epic Overview File → JIRA Epic Description
**File**: `epic-overview.md` (Required for every epic)
**Location**: `todo/not-started/[EPIC-KEY]-epic-name/epic-overview.md`

**Content Structure:**
- Business goals and objectives
- Epic story breakdown with timeline
- Technical architecture overview
- Success criteria and risk management
- Stakeholder alignment information
- Cultural competency requirements (if applicable)

**JIRA Integration:** 
- Automatically populates JIRA epic description with rich business context
- Converts markdown to Atlassian Document Format (ADF) 
- Provides scrum masters complete epic understanding
- Updates epic metadata (timeline, priority, story points)

**Why Critical:** Product owners and stakeholders get comprehensive epic context directly in JIRA without needing to understand developer file structures.

#### 2. Story Plan File → JIRA Story Description  
**File**: `story-plan.md` (Required for every story)
**Location**: `todo/not-started/[EPIC-KEY]-epic-name/[STORY-KEY]-story-name/story-plan.md`

**Content Structure:**
- Business context and technical architecture
- Implementation approach with detailed phases
- Comprehensive acceptance criteria
- Dependencies and risk assessment
- Success metrics and testing strategy
- Integration points with other stories

**JIRA Integration:**
- Populates JIRA story description with technical and business details
- Provides product owners visibility into implementation approach
- Maintains alignment between technical work and business requirements
- Enables informed sprint planning and story prioritization

**Why Critical:** Bridges the gap between technical implementation and business understanding - stakeholders see exactly what's being built and why.

#### 3. Subtask Files → JIRA Subtasks
**Files**: Individual subtask markdown files
**Location**: `todo/not-started/[EPIC-KEY]-epic-name/[STORY-KEY]-story-name/[SUBTASK-KEY]-subtask-name.md`

**Content Structure:**
- Detailed implementation steps
- Technical specifications and code examples
- Testing and validation procedures
- Dependencies and integration notes

**JIRA Integration:**
- Creates individual JIRA subtasks for granular tracking
- Provides scrum masters task-level progress visibility
- Enables accurate sprint planning and capacity management
- Maintains bidirectional sync for progress updates

### Integration Benefits

#### For Developers
- **Familiar Workflow**: Continue working in local files and git
- **Rich Documentation**: Comprehensive technical context preserved
- **Zero Overhead**: JIRA updates happen automatically
- **Context Preserved**: All technical details maintained locally

#### For Scrum Masters
- **Granular Visibility**: Task-level progress without developer interruption
- **Real-time Updates**: Progress reflects immediately in JIRA
- **Dependency Tracking**: Clear visibility into blocking issues
- **Accurate Planning**: Better estimates based on actual technical breakdown

#### For Product Owners
- **Business Alignment**: Technical work clearly tied to business goals
- **Progress Transparency**: Real-time visibility into development progress
- **Informed Decisions**: Technical context available for priority decisions
- **Stakeholder Communication**: Rich information for stakeholder updates

This complete automation ensures that scrum masters and product owners have immediate visibility into granular development progress while maintaining the developer-focused implementation todos that drive actual development work.

## Efficiency Improvements and Standardization

**What Changed for Maximum Efficiency:**
- ❌ **Removed**: Redundant `implementation-todos.md` files that duplicated individual task content
- ✅ **Standardized**: File structure now matches proven [PROJECT_KEY] pattern exactly
- ✅ **Streamlined**: Only essential files: epic-overview.md + story-plan.md + individual task files
- ✅ **Direct Mapping**: Each local file maps to exactly one Jira issue (epic, story, or subtask)

**Benefits of Standardized Structure:**
- **Scrum Masters**: Perfect granular visibility with individual Jira subtasks
- **Product Owners**: Clear story progress tracking without technical overwhelm  
- **Developers**: Focused task files with detailed implementation guidance
- **Project Management**: Consistent structure across all epics and stories

## Enhanced Planning Questions

Building on your familiar planning process, the command asks enhanced questions when Jira integration is available:

**Jira Context Questions:**
- Which epic does this story belong to? (populated from QAC project)
- Are there related stories that should influence this technical approach?
- What business priority level should guide technical trade-offs?

**Integration Questions:**
- Should this create new Jira tasks or map to existing ones?
- What level of technical detail should be visible to project stakeholders?
- Are there compliance or security considerations from the business requirements?

**Workflow Questions:**
- Should progress updates post automatically to the Jira story?
- What technical milestones should trigger stakeholder notifications?
- Are there dependencies on other teams that should be tracked in Jira?

This enhanced planning process ensures that your technical documentation serves both your development needs and your team's project management requirements, creating unprecedented alignment between technical execution and business visibility while maintaining your preferred development workflow patterns.

## PRD Requirement

⚠️ **IMPORTANT**: This command requires a `docs/PRD.md` file to function properly.

**Why PRD.md is Required:**
- Provides consistent project context across all features
- Eliminates repetitive data entry for every story
- Ensures technical choices align with project standards
- Maintains consistency in terminology and naming
- Auto-populates security and compliance requirements

**If PRD.md doesn't exist:**
1. Copy `docs/PRD-TEMPLATE.md` to `docs/PRD.md`
2. Fill in all [BRACKETED] placeholders with your project information
3. Save the file and run `sync-jira --connect` to configure JIRA
4. Then run this command to create JIRA-integrated plans

The PRD.md file serves as the single source of truth for project-wide information, making this command significantly more powerful and efficient than manual planning approaches.