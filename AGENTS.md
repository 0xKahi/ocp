# AGENTS.md

Agentic coding guide for the OCP (OpenCode Profiles) CLI project.

## Project Overview

TypeScript CLI tool built with Bun runtime for managing opencode profiles. Uses Commander.js for CLI structure and Zod for validation.

## Build, Lint, and Type Check Commands

**Development:**
```bash
bun run dev          # Run src/index.ts directly
bun run start        # Run compiled dist/index.js
```

**Build:**
```bash
bun run build        # Build for production (minified, target: bun)
```

**Linting & Formatting (Biome):**
```bash
bun run lint         # Check linting and formatting
bun run lint:fix     # Auto-fix issues (--write)
bun run biome        # Direct biome check
```

**Type Checking:**
```bash
bun run type-check   # Run tsc --noEmit
```

**Release:**
```bash
bun run changeset    # Create a changeset
bun run version      # Version bump via changeset
bun run release      # Publish via changeset
```

**Note:** No test runner is currently configured in this project.

## Code Style Guidelines

### Formatting (Biome Config)
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

### Import Patterns
- **Node built-ins:** Use `node:` protocol (e.g., `import { existsSync } from 'node:fs'`)
- **Order:** External packages first, then internal relative imports
- **Type imports:** Use `import type { Foo } from './foo'` syntax
- **Internal paths:** Use relative imports with `../` for parent directories

### Naming Conventions
- **Files:** kebab-case (e.g., `path.util.ts`, `command-template.ts`)
- **Classes:** PascalCase (e.g., `PathUtil`, `CommandTemplate`)
  - Command classes follow `*CommandTemplate` pattern
- **Methods/Functions:** camelCase (e.g., `expandPath`, `findFile`)
- **Types/Interfaces:** PascalCase (e.g., `FileSearchResult`, `AddProfileOptions`)
- **Constants:** UPPER_SNAKE_CASE for true constants (e.g., `SHELL_VAR_REGEX`)

### Error Handling
- Use `try/catch` in async action handlers
- Log errors with `logger.error()` before `process.exit(1)`
- Type error as `any` in catch blocks when accessing `.message`
- Validate user input early with explicit error messages

### Code Patterns
- **CLI commands:** Extend `CommandTemplate` class, implement `setup()`, `setOptions()`, `setAction()`
- **Static utilities:** Use static methods in utility classes (e.g., `PathUtil`)
- **Async/await:** Preferred over raw promises
- **Schema validation:** Use Zod for config and input validation
- **Logging:** Use the `logger` utility (kleur-based) instead of raw console
- **Process exit:** Use `process.exit(1)` for error conditions in CLI commands

### Documentation
- JSDoc comments for public utility methods explaining purpose and parameters
- Keep comments concise and focused on "why" not "what"

## Project Structure

```
src/
├── index.ts              # CLI entry point
├── commands/
│   ├── init.ts           # Initialize OCP config
│   ├── profile/          # Profile subcommands
│   │   ├── index.ts      # Profile command group
│   │   ├── add.ts        # Add profile
│   │   ├── remove.ts     # Remove profile
│   │   └── list.ts       # List profiles
│   ├── run.ts            # Run opencode with profile
│   └── update.ts         # Update OCP
├── schemas/
│   ├── command-ex.ts     # Extended Commander class
│   ├── command-template.ts  # Base command template
│   └── config.schema.ts  # Zod schemas
└── utils/
    ├── path.util.ts      # Path resolution utilities
    ├── profile-loader.ts # Profile CRUD operations
    ├── logger.ts         # Logging utility
    ├── highlighter.ts    # Output styling
    ├── spinner.ts        # Loading indicators
    └── atomic.ts         # Atomic file operations
```

## Key Dependencies

- **@clack/prompts:** Interactive CLI prompts
- **commander:** CLI framework
- **kleur:** Terminal colors
- **ora:** Loading spinners
- **zod:** Schema validation
- **@biomejs/biome:** Linting and formatting
- **@changesets/cli:** Version management
