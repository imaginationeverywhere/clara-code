# run-migrations

Run database migrations across all environments with intelligent duplicate prevention

## Usage

```bash
./scripts/run-migrations-all-environments.sh [OPTIONS]
```

Or use the shell alias (after setup):

```bash
run-migrations [OPTIONS]
```

## Options

- `--seed` - Also run seeders after migrations (prevents duplicates)
- `--check-only` - Only check migration status without applying changes
- `--env=ENV` - Run for specific environment only (local|develop|production)
- `--help` - Show help message

## Examples

### Run migrations for all environments
```bash
./scripts/run-migrations-all-environments.sh
```

### Run migrations and seed data (duplicate prevention enabled)
```bash
./scripts/run-migrations-all-environments.sh --seed
```

### Check migration status only
```bash
./scripts/run-migrations-all-environments.sh --check-only
```

### Run migrations for local environment only
```bash
./scripts/run-migrations-all-environments.sh --env=local
```

### Run migrations for develop environment with seeding
```bash
./scripts/run-migrations-all-environments.sh --env=develop --seed
```

## Features

### Intelligent Duplicate Prevention
- Checks if seeds have already been applied before running
- If seeds detected, skips to prevent duplicate data
- Shows which seeds were already applied
- Safe for multiple executions

### Multi-Environment Support
- Processes local, develop, and production automatically
- Or specify single environment with `--env=ENV`
- Automatically sets NODE_ENV for each environment

### Color-Coded Output
- Uses ANSI colors for clear status visualization
- Green (✓) for success
- Yellow (→, ⚠) for info/warnings
- Red (✗) for errors
- Blue for headers and sections

### Comprehensive Status Reports
- Shows migration status before and after
- Lists already-seeded files
- Provides troubleshooting guidance on failure
- Exit codes for CI/CD integration

## Requirements

- Bash shell (macOS/Linux)
- Node.js with npm or pnpm
- Backend Sequelize configuration (`src/config/sequelize.config.js`)
- Environment files (`.env.local`, `.env.develop`, `.env.production`)

## Setup as Shell Alias

To use as a simple command from anywhere:

### 1. Add to ~/.zshrc
```bash
echo 'alias run-migrations="bash ~/.local/bin/run-migrations-all-environments.sh"' >> ~/.zshrc
```

### 2. Copy script to ~/.local/bin
```bash
mkdir -p ~/.local/bin
cp scripts/run-migrations-all-environments.sh ~/.local/bin/
chmod +x ~/.local/bin/run-migrations-all-environments.sh
```

### 3. Reload shell
```bash
source ~/.zshrc
```

### 4. Use from anywhere
```bash
cd path/to/backend
run-migrations --seed
```

## Troubleshooting

### "Error: This script must be run from the backend root directory"
- Ensure you're in the backend directory that contains `package.json` and `src/config/sequelize.config.js`
- The script needs proper Sequelize configuration to work

### "Failed to apply migrations"
- Check that DATABASE_URL is set in your `.env` files
- Verify database connectivity
- Review migration files for syntax errors
- Check database credentials and permissions

### "No seeders found"
- This is normal if your project doesn't have seed files
- The script returns success without creating seeds

## How It Works

1. **Argument Parsing**: Processes command-line flags
2. **Validation**: Confirms we're in a valid backend directory
3. **Environment Detection**: Determines which environments to process
4. **Migration Execution**: Runs `sequelize-cli db:migrate` for each environment
5. **Seed Status Check**: Queries current seed status before applying
6. **Duplicate Prevention**: Skips seeds if already applied
7. **Status Reporting**: Shows comprehensive results with color-coded output

## Related Commands

- `npm run db:migrate` - Manual migration (single environment)
- `npm run db:seed` - Manual seeding (single environment)
- `npm run db:migrate:status` - Check migration status
- `npm run db:seed:status` - Check seed status

## Notes

- This script is idempotent for migrations (safe to run multiple times)
- Duplicate prevention prevents data duplication when seeding
- Environment variables are automatically configured based on environment
- The script exits with proper codes for CI/CD integration

## Location

**Boilerplate:** `/scripts/run-migrations-all-environments.sh`

**Usage:** Copy to your project's `scripts/` directory or use as symlink from boilerplate

---

For questions or issues, see troubleshooting section or check backend migration files.
