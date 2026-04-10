# Create Plan & Todo - Claude Code Custom Command

## Command Name
`create-plan-todo` or `create plan and todo for [feature]`

## Purpose
Generate comprehensive technical architecture plan and implementation todo documentation for any feature, following professional standards that work across all project types.

## Execution Instructions

When this command is invoked:

### 1. Gather Information
Ask the user for the following details (in a conversational manner):

1. **Feature Name** (required)
   - Example: "Plan Upload System", "Estimate Generation Engine", "Contract Management", "Project Timeline Tracking"

2. **Feature Description** (required)
   - Brief overview of what the feature does

3. **Complexity Level** (required)
   - Simple (1-3 days)
   - Medium (1-2 weeks)
   - Complex (2-4 weeks)
   - Enterprise (1-3 months)

4. **Risk Level** (required)
   - Low / Medium / High
   - Risk justification

5. **Problem Statement** (required)
   - What problem does this feature solve?

6. **Solution Approach** (required)
   - High-level approach to solving the problem

7. **Key Benefits** (3-5 benefits)
   - Business value and user benefits

8. **Current State Description**
   - How things work now (if applicable)

9. **Target Architecture Description**
   - Desired end state

10. **Technology Stack Details**
    - Languages, frameworks, tools involved

11. **Dependencies**
    - External systems, libraries, services

12. **Technical Requirements**
    - Specific technical needs

13. **Infrastructure Requirements**
    - Servers, databases, services needed

14. **Required Skills**
    - Team skills needed

15. **Training Needs**
    - Any training required

16. **High Risk Items**
    - Major risks to success

17. **Risk Mitigation Strategies**
    - How to handle the risks

18. **Technical Metrics**
    - How to measure technical success

19. **Business Metrics**
    - How to measure business success

20. **Monitoring Metrics**
    - What to monitor in production

21. **Security Considerations**
    - Security requirements and concerns

22. **Performance Criteria**
    - Performance requirements

23. **Prerequisites Checklist**
    - What needs to be in place before starting

### 2. Auto-Calculate Values

Based on complexity level, automatically set:

**Time Estimates:**
- Simple: "1-2 weeks (40-80 hours)"
- Medium: "2-4 weeks (80-160 hours)"
- Complex: "4-8 weeks (160-320 hours)"
- Enterprise: "8-12 weeks (320-480 hours)"

**Team Size:**
- Simple: "1-2 developers"
- Medium: "2-3 developers (1 Lead, 1-2 Developers)"
- Complex: "3-4 developers (1 Architect, 1 Lead, 2 Developers)"
- Enterprise: "4-6 developers (1 Architect, 1 Lead, 2-3 Developers, 1 QA)"

### 3. Generate File Names

Convert feature name to file-safe format:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Example: "Plan Upload System" → "plan-upload-system"

Create file paths:
- Plan: `docs/technical/[feature-slug]-architecture.md`
- Todo: `todo/[feature-slug]-implementation-todos.md`

### 4. Generate Files

Use the template in `create-plan-todo-template.md` and replace all placeholders:

- [FEATURE_NAME] → Feature Name
- [FEATURE_DESCRIPTION] → Feature Description
- [FEATURE_SLUG] → feature-slug
- [TIME_ESTIMATE] → Auto-calculated time estimate
- [TEAM_SIZE] → Auto-calculated team size
- [RISK_LEVEL] → Risk Level
- [RISK_JUSTIFICATION] → Risk justification
- [PROBLEM_STATEMENT] → Problem Statement
- [SOLUTION_APPROACH] → Solution Approach
- [KEY_BENEFITS] → Key Benefits
- [CURRENT_STATE] → Current State Description
- [TARGET_ARCHITECTURE] → Target Architecture Description
- [TECH_STACK] → Technology Stack Details
- [DEPENDENCIES] → Dependencies
- [TECHNICAL_REQUIREMENTS] → Technical Requirements
- [INFRASTRUCTURE_REQUIREMENTS] → Infrastructure Requirements
- [REQUIRED_SKILLS] → Required Skills
- [TRAINING_NEEDS] → Training Needs
- [HIGH_RISK_ITEMS] → High Risk Items
- [HIGH_RISK_MITIGATION] → Risk Mitigation Strategies
- [TECHNICAL_METRICS] → Technical Metrics
- [BUSINESS_METRICS] → Business Metrics
- [MONITORING_METRICS] → Monitoring Metrics
- [SECURITY_CONSIDERATIONS] → Security Considerations
- [PERFORMANCE_CRITERIA] → Performance Criteria
- [PREREQUISITES_CHECKLIST] → Format as checkbox list

### 5. Format Prerequisites Checklist

Convert the prerequisites into checkbox format:
```
- [ ] First prerequisite
- [ ] Second prerequisite
- [ ] Third prerequisite
```

### 6. Create Files

1. Check if directories exist, create if needed:
   - `docs/technical/`
   - `todo/`

2. Write the generated content to files

3. Provide success message with file locations

### 7. Next Steps Message

After creating files, provide this message:

```
✅ Successfully created plan and todo documentation!

📄 Technical Plan: docs/technical/[feature-slug]-architecture.md
📋 Implementation Todo: todo/[feature-slug]-implementation-todos.md

Next steps:
1. Review the generated files
2. Customize sections as needed for your specific feature
3. Remove any sections that don't apply
4. Add feature-specific details
5. Share with your team for review

The todo file can be used to track implementation progress by checking off completed tasks.
```

## Error Handling

- If directories don't exist, create them
- If files already exist, ask if user wants to overwrite
- If user cancels at any point, provide friendly message
- Handle file write errors gracefully

## Best Practices

1. Keep language professional but friendly
2. Provide examples when asking for input
3. Validate required fields
4. Use sensible defaults where possible
5. Make the process feel conversational, not like filling a form

## Command Aliases

Users can invoke this command with:
- "create plan and todo for [feature name]"
- "generate documentation for [feature name]"
- "create feature docs"
- "plan and todo"