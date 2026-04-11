# @imaginationeverywhere/clara-cli

Command-line interface for Clara Code: voice greeting, Q&A against the Clara API, and local configuration.

## Installation

```bash
npm install -g @imaginationeverywhere/clara-cli
```

After installation, the `clara` binary is on your `PATH`.

## Commands

| Command | Description |
|--------|-------------|
| `clara --version` | Print the CLI version |
| `clara hello` | Play Clara's voice greeting from the API (stub) |
| `clara ask "<question>"` | Send a question to the Clara API and print the response (stub) |
| `clara config set api-key <key>` | Store the API key in `~/.clara/config.json` |
| `clara config get api-key` | Print the stored API key (or empty line if unset) |

## Quickstart

```bash
clara --version
clara config set api-key YOUR_API_KEY
clara ask "What is Clara Code?"
clara hello
```

Configuration is stored at `~/.clara/config.json`. The directory is created automatically when you run `clara config set`.

## Development

From the repository root:

```bash
cd packages/cli
npm install
npm run build
node dist/index.js --help
```

Use `npm run dev` for watch mode while editing TypeScript.
