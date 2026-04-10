# boilerplate-auto-version

Automatically detect changes in the boilerplate, increment version appropriately, commit, and push.

## Usage
```
boilerplate-auto-version
```

## Aliases
- `bp-auto`
- `auto-version`
- `av`

## Description
This command uses the boilerplate-update-manager agent to automatically:

1. **Check git status** - Detect any uncommitted changes in the boilerplate
2. **Analyze changes** - Determine the appropriate version bump:
   - **Patch** (x.x.1) - Bug fixes, documentation updates, small changes
   - **Minor** (x.1.0) - New features, non-breaking enhancements
   - **Major** (1.0.0) - Breaking changes, major refactors
3. **Auto-increment version** - Update version numbers in all relevant files
4. **Stage all changes** - Add all modified files to git
5. **Generate commit message** - Create descriptive message based on changes
6. **Commit changes** - Commit with semantic versioning message
7. **Push to repository** - Push to origin
8. **Create git tag** - Optionally tag the release

## Examples
```bash
# After making changes to the boilerplate
boilerplate-auto-version

# Or use shortcuts
bp-auto
av
```

## Implementation
This command invokes the boilerplate-update-manager agent with instructions to:
- Detect and analyze all uncommitted changes
- Apply semantic versioning rules automatically
- Generate appropriate commit messages
- Handle the complete release workflow

## Requirements
- Git repository must be initialized
- Must have push access to the repository
- Changes must be saved but not committed