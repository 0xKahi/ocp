# opencode-profiles (`ocp`)

A CLI tool for managing and switching between multiple [opencode](https://opencode.ai) profiles. Each profile points to a directory containing its own `opencode.jsonc` config, letting you run opencode with different configurations without touching your global setup.

## Requirements

- [Bun](https://bun.sh) installed
- [opencode](https://opencode.ai) installed and configured (global config directory must exist)

## Installation

```bash
bun install -g opencode-profiles
```

## Usage

### `ocp init`

Initialize OCP. Creates the `ocp.jsonc` config file inside your opencode global config directory.

```bash
ocp init
```

### `ocp profile add <name>`

Add a new profile pointing to a directory that contains an `opencode.jsonc`.

```bash
# Use a specific path
ocp profile add work --path ~/projects/work

# Use the current directory
ocp profile add personal --cwd
```

### `ocp profile remove <name>`

Remove a profile by name.

```bash
ocp profile remove work
```

### `ocp profile list`

List all profiles. Shows whether each profile is valid (path exists and contains an `opencode.jsonc`).

```bash
ocp profile list

# Output:
# ┌─────────┬──────┬──────────────────────┬───────┐
# │ (index) │ Name │ Path                 │ Valid │
# ├─────────┼──────┼──────────────────────┼───────┤
# │ 0       │ work │ /home/user/work      │ ✓     │
# │ 1       │ old  │ /home/user/old       │ ✗     │
# └─────────┴──────┴──────────────────────┴───────┘
```

### `ocp run <profile> [opencode args]`

Launch opencode with the given profile. Any extra arguments are passed directly to the opencode CLI.

```bash
ocp run work
```

If the profile has `randomPort: true` in your `ocp.jsonc`, a random port is picked each time.
