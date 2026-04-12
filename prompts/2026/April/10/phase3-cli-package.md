# Phase 3 — Clara Code CLI Packaging
# Agent: carruthers-cli | Workspace: ~/projects/clara-code-cli-wt

Set up CLI distribution for Clara Code.

## Create packages/cli/ structure
- `packages/cli/package.json`
  - name: `@imaginationeverywhere/clara-cli`
  - bin: `{ "clara": "./dist/index.js" }`
  - scripts: build, dev, prepublish
- `packages/cli/src/index.ts` — entry point, commander.js setup
- `packages/cli/src/commands/hello.ts` — `clara hello` command (voice test)
- `packages/cli/src/commands/ask.ts` — `clara ask "question"` command
- `packages/cli/src/commands/config.ts` — `clara config set|get` command

## Commands to scaffold (stubs, no implementation yet)
- `clara hello` — plays Clara's voice greeting from the API
- `clara ask <question>` — sends question to Clara API, prints response
- `clara config set api-key <key>` — stores API key in ~/.clara/config.json
- `clara --version` — prints version

## npx support
Add to root package.json: `"create-clara-app": "packages/create-clara-app"`

## Homebrew formula scaffold
Create `distribution/homebrew/clara.rb` — basic formula structure (no actual tap yet)

## README
`packages/cli/README.md` — installation (`npm install -g @imaginationeverywhere/clara-cli`), commands, quickstart.

Create PR to `phase3-cli-qcs1` when done.
