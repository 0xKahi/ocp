#!/usr/bin/env bun
import { InitCommand } from './commands/init';
import { ProfileCommand } from './commands/profile/index';
import { RunCommand } from './commands/run';
import { UpgradeCommand } from './commands/upgrade';
import { CURRENT_VERSION } from './meta';
import { CommandEx } from './schemas/command-ex';
import type { CommandStrategy } from './schemas/command-strategy';
import { logger } from './utils/logger';

const mainCommand: CommandStrategy = {
  config: {
    name: 'ocp',
    description: 'Opencode Profile Manager',
    version: CURRENT_VERSION,
    subCommands: [new InitCommand(), new ProfileCommand(), new RunCommand(), new UpgradeCommand()],
  },
};

async function main() {
  const program = new CommandEx();
  program.use(mainCommand);
  await program.parseAsync(process.argv);
}

main().catch(err => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error(message);
  process.exit(1);
});
