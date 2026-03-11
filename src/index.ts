#!/usr/bin/env bun
const { version } = await import('../package.json');

import { InitCommandTemplate } from './commands/init';
import { ProfileCommandTemplate } from './commands/profile/index';
import { RunCommandTemplate } from './commands/run';
import { CommandEx } from './schemas/command-ex';

async function main() {
  const program = new CommandEx().name('ocp').description('Opencode Profile Manager').version(version);

  program.register(new InitCommandTemplate()).register(new ProfileCommandTemplate()).register(new RunCommandTemplate());

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
