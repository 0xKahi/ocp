# AGENTS.md

Agentic coding guide for the OCP (OpenCode Profiles) CLI project.

## Project Overview

TypeScript CLI tool built with **Bun runtime** for managing opencode profiles. Uses Commander.js for CLI structure and Zod for validation. Published to npm as `opencode-profiles`.

## Build, Lint, and Type Check Commands

**Prerequisites:**
- Bun >= 1.3.12 (verified in `engines.bun`)

**Development:**
```bash
bun run dev          # Run src/index.ts directly (bun run src/index.ts)
bun run start        # Run compiled dist/index.js
```

**Build:**
```bash
bun run build        # Build for production (minified, target: bun)
```

**Linting & Formatting (Biome):**
```bash
bun run lint         # Check linting and formatting
bun run lint:fix     # Auto-fix issues (--write, includes import organization)
bun run biome        # Direct biome check
```

**Type Checking:**
```bash
bun run type-check   # Run tsc --noEmit (separate from build)
```

**Release (Changesets):**
```bash
bun run changeset    # Create a changeset for versioning
bun run version      # Bump versions via changeset
bun run release      # Publish to npm via changeset
```

**Note:** No test runner configured. CI runs `type-check` and `lint` only.

## Code Style Guidelines

### Formatting (Biome Config)
- **Runtime:** Bun (not Node.js)
- **Indent:** 2 spaces (not tabs)
- **Line width:** 150 characters
- **Line endings:** LF (`\n`)
- **Quotes:** Single quotes (`'`)
- **Arrow functions:** Parentheses omitted when possible (`asNeeded`)
- **Organize imports:** Enabled (auto-sort on save/fix)

### TypeScript Configuration
- **Target:** ESNext with Bun runtime
- **Module:** Preserve with Bundler resolution
- **Strict mode:** Enabled
- **Key strict flags:** `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
- **Unused checks:** Disabled (`noUnusedLocals: false`, `noUnusedParameters: false`)
- **Import assertions:** `verbatimModuleSyntax: true` (use `import type` for types)

### Import Patterns
- **Node built-ins:** Always use `node:` protocol (e.g., `import { existsSync } from 'node:fs'`)
- **Order:** External packages first, then internal relative imports
- **Type imports:** Use `import type { Foo } from './foo'` syntax (required by `verbatimModuleSyntax`)
- **Internal paths:** Use relative imports with `../` for parent directories

### Naming Conventions
- **Files:** kebab-case (e.g., `path.util.ts`, `command-template.ts`, `global-help-config.const.ts`)
- **Classes:** PascalCase (e.g., `PathUtil`, `CommandTemplate`, `AddProfileCommandTemplate`)
- **Methods/Functions:** camelCase (e.g., `expandPath`, `findFile`)
- **Types/Interfaces:** PascalCase (e.g., `FileSearchResult`, `AddProfileOptions`)
- **Constants:** UPPER_SNAKE_CASE for true constants (e.g., `SHELL_VAR_REGEX`, `CURRENT_VERSION`)

## CLI Command Patterns

### Command Template Pattern
All CLI commands extend `CommandTemplate` and implement three methods:

```typescript
export class MyCommandTemplate extends CommandTemplate {
  override readonly name = 'my-command';
  override readonly description = 'What this command does';
  override readonly alias = 'mc'; // Optional

  override setArguments(cmd: CommandEx): void {
    cmd.argument('<required>', 'Description');
    cmd.argument('[optional]', 'Description');
  }

  override setOptions(cmd: CommandEx): void {
    cmd.option('--flag', 'Description');
    cmd.option('--value <val>', 'Description');
  }

  override async execute(arg: string, options: MyOptions): Promise<void> {
    // Command logic here
  }
}
```

### Subcommand Groups
Parent commands (like `profile`) return subcommands via `subCommands()`:

```typescript
override subCommands(): CommandTemplate[] {
  return [
    new AddProfileCommandTemplate(),
    new RemoveProfileCommandTemplate(),
    new ListProfileCommandTemplate()
  ];
}
```

### Error Handling in Commands
- Wrap async operations in `try/catch`
- Use `this.handleError(error)` from `CommandTemplate` for consistent error handling
- Or use `logger.error()` followed by `process.exit(1)`
- Type errors as `unknown` and check `error instanceof Error`

Example:
```typescript
try {
  await someAsyncOperation();
} catch (error: unknown) {
  this.handleError(error); // Exits with code 1 after logging
}
```

### Interactive Prompts
Use `@clack/prompts` for interactive input:

```typescript
import { text, isCancel, cancel } from '@clack/prompts';

const result = await text({
  message: 'Enter value',
  validate: value => {
    if (!value) return 'Value is required';
    return undefined;
  },
});

if (isCancel(result)) {
  cancel('Operation cancelled.');
  process.exit(0);
}
```

## Code Patterns

### Schema Validation
- Use Zod for all config and input validation
- Define schemas in `src/schemas/` directory
- Export both the schema and inferred type when needed

### Logging
- **Always** use the `logger` utility (kleur-based) instead of raw `console`
- Available methods: `info`, `success`, `warn`, `error`, `debug`, `message`, `break`
- Use `highlighter` utility for styled output (profiles, paths, commands)

### Static Utilities
- Use static methods in utility classes (e.g., `PathUtil.expandPath()`)
- Place utility classes in `src/utils/`

### Configuration
- Global config stored at `~/.config/opencode/ocp.jsonc` (JSON with comments)
- Use `PathUtil` for config path resolution
- Supports shell variable expansion: `$HOME`, `$USER`, `~`

## Project Structure

```
src/
├── index.ts              # CLI entry point (Commander setup)
├── meta.ts               # Version from package.json
├── commands/
│   ├── init.ts           # Initialize OCP config
│   ├── profile/          # Profile subcommands
│   │   ├── index.ts      # Profile command group
│   │   ├── add.ts        # Add profile
│   │   ├── remove.ts     # Remove profile
│   │   └── list.ts       # List profiles
│   ├── run.ts            # Run opencode with profile
│   └── upgrade.ts        # Self-update OCP
├── schemas/
│   ├── command-ex.ts     # Extended Commander class
│   ├── command-template.ts  # Base command template
│   └── config.schema.ts  # Zod schemas
├── constants/
│   └── global-help-config.const.ts  # Help configuration
└── utils/
    ├── path.util.ts      # Path resolution utilities
    ├── profile-loader.ts # Profile CRUD operations
    ├── config-loader.util.ts  # Config file operations
    ├── logger.ts         # Logging utility
    ├── highlighter.ts    # Output styling
    ├── prompt.util.ts    # Prompt helpers
    ├── spinner.ts        # Loading indicators
    └── atomic.ts         # Atomic file operations
```

## Key Dependencies

- **@clack/prompts:** Interactive CLI prompts
- **commander:** CLI framework
- **kleur:** Terminal colors
- **zod:** Schema validation
- **@biomejs/biome:** Linting and formatting
- **@changesets/cli:** Version management

## CI / Release Workflow

**CI (`.github/workflows/ci.yml`):**
- Runs on push/PR to `main`
- Steps: `bun install` → `bun run type-check` → `bun run lint`

**Release (`.github/workflows/release.yml`):**
- Triggers on push to `main`
- Uses `changesets/action@v1` to create PR or publish
- Requires `NPM_TOKEN` and `GITHUB_TOKEN`
- Runs `bun run build` before publishing
