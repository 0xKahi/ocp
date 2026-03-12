#!/usr/bin/env bun
const { version } = await import('../package.json');

import { InitCommandTemplate } from './commands/init';
import { ProfileCommandTemplate } from './commands/profile/index';
import { RunCommandTemplate } from './commands/run';
import { UpdateCommandTemplate } from './commands/update';
import { CommandEx } from './schemas/command-ex';

async function main() {
  const program = new CommandEx().name('ocp').description('Opencode Profile Manager').version(version);

  program
    .register(new InitCommandTemplate())
    .register(new ProfileCommandTemplate())
    .register(new RunCommandTemplate())
    .register(new UpdateCommandTemplate());

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
