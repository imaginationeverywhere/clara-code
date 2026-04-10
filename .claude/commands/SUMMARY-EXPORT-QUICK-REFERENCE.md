# Summary Export System - Quick Reference

## Enhanced Commands

### 1. `/update-todos`
**New Options:**
- `--export-summary` - Generate and export summary for current todo

**Automatic Features:**
- Generates summaries on status changes
- Exports to `todo-summaries/[status]/[todo]-summary-YYYYMMDD-HHMMSS.md`
- Updates relationships.json
- Recommends `/compact` or `/clear` based on relationships

### 2. `/process-todos`
**New Features:**
- Loads existing summaries for context
- Tracks decisions and artifacts during work
- Generates summary before switching todos
- Automatically manages context with `/compact` or `/clear`

**New Option:**
- `--with-summary` - Force summary generation after each todo

### 3. `/create-plan-todo`
**New Features:**
- Scans for related existing work
- Loads context from previous summaries
- Includes references to related todos
- Updates relationships.json automatically

## Directory Structure
```
todo-summaries/
├── not-started/     # Summaries for new todos
├── in-progress/     # Summaries for active todos
├── completed/       # Summaries for finished todos
└── metadata/
    └── relationships.json  # Todo relationships
```

## Context Management Rules

### Use `/compact` when:
- Next todo shares prefix (e.g., both start with "clerk-")
- Todos are explicitly related in relationships.json
- Working on different phases of same feature
- Need to preserve test data or credentials

### Use `/clear` when:
- Switching to unrelated feature
- Current todo is 90%+ complete
- Starting fresh problem domain
- No shared context needed

## Summary Contents
1. **Summary Information** - Metadata and relationships
2. **Work Completed** - Tasks finished with percentages
3. **Key Decisions Made** - Architecture and implementation choices
4. **Challenges Encountered** - Problems and solutions
5. **Next Steps** - What to do next
6. **Context for Future Sessions** - Critical information to preserve
7. **Artifacts Created/Modified** - Files touched
8. **Performance Notes** - Time tracking
9. **Relationships Discovered** - New connections found

## Workflow Example
```bash
1. Work on todo A
2. Complete some tasks
3. System generates summary automatically
4. Check next todo B
5. If related: System uses /compact
6. If unrelated: System uses /clear
7. Continue with appropriate context
```

## Benefits
- **Reduced Tokens**: Summaries replace full conversation history
- **Better Continuity**: No lost context between sessions
- **Knowledge Base**: Searchable development history
- **Team Collaboration**: Shared understanding of decisions
- **Faster Development**: Reuse patterns and decisions

## Tips
- Let the system manage context automatically
- Review summaries for accuracy
- Update relationships.json when needed
- Use summaries for documentation
- Reference summaries in PRs