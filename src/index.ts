#!/usr/bin/env bun
const { version } = await import('../package.json');

import { InitCommandTemplate } from './commands/init';
import { ProfileCommandTemplate } from './commands/profile/index';
import { RunCommandTemplate } from './commands/run';
import { UpdateCommandTemplate } from './commands/update';
import { CommandEx } from './schemas/command-ex';
import { CommandTemplate } from './schemas/command-template';
import { logger } from './utils/logger';

class MainCommandTemplate extends CommandTemplate {
  override readonly name = 'ocp';
  override readonly description = 'Opencode Profile Manager';

  override globalSettings(cmd: CommandEx): void {
    super.globalSettings(cmd);
    cmd.version(version);
  }

  override subCommands(): CommandTemplate[] {
    return [new InitCommandTemplate(), new ProfileCommandTemplate(), new RunCommandTemplate(), new UpdateCommandTemplate()];
  }
}

async function main() {
  const program = new CommandEx();
  program.use(new MainCommandTemplate());
  await program.parseAsync(process.argv);
}

main().catch(err => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error(message);
  process.exit(1);
});
