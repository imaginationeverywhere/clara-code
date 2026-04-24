# Distribution Pipeline — npm + Desktop Builds + GitHub Releases

**TARGET REPO:** imaginationeverywhere/clara-code
**Milestone:** `git tag v1.0.0` → CLI on npm + .dmg on GitHub Releases + website deploys

---

## Context

Three surfaces need to ship from a single tag push:
1. **CLI** (`packages/cli/`) → published to npm as `clara@<version>`
2. **Desktop IDE** (`desktop/`) → `.dmg` (macOS), `.AppImage` (Linux) built and attached to GitHub Release
3. **Website** (`frontend/`) → already deployed to Cloudflare Workers; confirm it stays wired

Package names after prompt 01:
- `packages/cli/package.json` → `"name": "clara"`

## Required Files

### 1. `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  # ─── CLI → npm ────────────────────────────────────────────────
  publish-cli:
    name: Publish CLI to npm
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --workspace=packages/cli

      - name: Build CLI
        run: npm run build --workspace=packages/cli

      - name: Publish to npm
        run: npm publish --workspace=packages/cli --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  # ─── Desktop → GitHub Release ─────────────────────────────────
  build-desktop-macos:
    name: Build Desktop (macOS)
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install frontend deps
        run: npm ci
        working-directory: desktop

      - name: Build Tauri app
        run: npm run tauri build
        working-directory: desktop
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload .dmg to GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: desktop/src-tauri/target/release/bundle/dmg/*.dmg
          generate_release_notes: true

  build-desktop-linux:
    name: Build Desktop (Linux)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install system deps
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev

      - name: Install frontend deps
        run: npm ci
        working-directory: desktop

      - name: Build Tauri app
        run: npm run tauri build
        working-directory: desktop

      - name: Upload .AppImage to GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: desktop/src-tauri/target/release/bundle/appimage/*.AppImage

  # ─── Website → Cloudflare Workers ─────────────────────────────
  deploy-website:
    name: Deploy Website
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install deps
        run: npm ci
        working-directory: frontend

      - name: Build
        run: npm run build
        working-directory: frontend

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: frontend
```

### 2. Required GitHub Secrets

Add these in the repo Settings → Secrets → Actions:

| Secret | Where to get it |
|--------|----------------|
| `NPM_TOKEN` | npmjs.com → Access Tokens → Generate New Token (Automation type) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Edit Cloudflare Workers template |

`GITHUB_TOKEN` is automatically provided by GitHub Actions — no setup needed.

### 3. `desktop/package.json` — verify tauri build script

Make sure `desktop/package.json` has:

```json
{
  "scripts": {
    "tauri": "tauri",
    "build": "vite build",
    "tauri build": "tauri build"
  }
}
```

The `@tauri-apps/cli` package should be in `devDependencies`. If missing:
```bash
cd desktop && npm install --save-dev @tauri-apps/cli
```

### 4. `desktop/src-tauri/tauri.conf.json` — verify bundle config

Ensure the bundle section produces the right artifacts:

```json
{
  "bundle": {
    "active": true,
    "targets": ["dmg", "appimage"],
    "identifier": "ai.claracode.app",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"]
  }
}
```

### 5. Local test before first tag

```bash
# Test CLI publish dry-run
cd packages/cli && npm publish --dry-run

# Test desktop build locally
cd desktop && npm run tauri build

# Confirm artifacts exist
ls desktop/src-tauri/target/release/bundle/dmg/
```

### 6. Ship the first release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then watch GitHub Actions → all three jobs green → check:
- `npm view clara version` shows `1.0.0`
- GitHub Release has `.dmg` and `.AppImage` attached
- `claracode.ai` reflects latest build

## Acceptance Criteria

- [ ] Tag push triggers all three jobs
- [ ] CLI publishes to npm as `clara@<version>` (verify: `npm view clara`)
- [ ] `.dmg` attached to GitHub Release
- [ ] `.AppImage` attached to GitHub Release
- [ ] Website deploys to Cloudflare Workers
- [ ] All three jobs pass green in GitHub Actions
