import type { CommandEx } from '../schemas/command-ex';
import { CommandTemplate } from '../schemas/command-template';
import { highlighter } from '../utils/highlighter';
import { logger } from '../utils/logger';
import { ProfileLoader } from '../utils/profile-loader';

type RunCommandOptions = {
  cmd?: boolean;
};

export class RunCommandTemplate extends CommandTemplate {
  override readonly name = 'run';
  override readonly description = 'Run opencode with a profile';
  override readonly alias = 'r';

  override setArguments(cmd: CommandEx): void {
    cmd.argument('<profile>', 'Profile name');
  }

  override setOptions(cmd: CommandEx): void {
    cmd.option('--cmd', 'Run forwarded arguments as an opencode subcommand');
  }

  override globalSettings(cmd: CommandEx): void {
    super.globalSettings(cmd);
    cmd.allowExcessArguments(true);
    cmd.allowUnknownOption(true);
  }

  override async execute(profileName: string, options: RunCommandOptions, command: CommandEx): Promise<void> {
    const result = await ProfileLoader.getProfileAndOptions(profileName);
    if (!result) {
      throw new Error(`Profile "${highlighter.profile(profileName)}" not found.`);
    }

    if (!ProfileLoader.isProfileValid(result)) {
      throw new Error(`Profile "${profileName}" is invalid.`);
    }

    const { path: profilePath, opts } = result;
    const extraArgs = command.args.slice(1);
    const isCommandMode = options.cmd === true;

    if (isCommandMode && extraArgs.length === 0) {
      throw new Error('Please provide an opencode command after --cmd.');
    }

    if (isCommandMode && extraArgs.some(arg => arg === '--port' || arg.startsWith('--port='))) {
      throw new Error('--port cannot be used together with --cmd.');
    }

    if (opts.randomPort && !isCommandMode) {
      const port = Math.floor(Math.random() * 60905) + 4096;
      extraArgs.push('--port', String(port));
    }

    logger.info('starting profile:', highlighter.profile(profileName));

    let proc: ReturnType<typeof Bun.spawn> | null = null;
    let preSpawnSignalExitCode: number | null = null;

    const sigintHandler = () => {
      if (proc) proc.kill('SIGINT');
      else preSpawnSignalExitCode = 130;
    };

    const sigtermHandler = () => {
      if (proc) proc.kill('SIGTERM');
      else preSpawnSignalExitCode = 143;
    };

    process.on('SIGINT', sigintHandler);
    process.on('SIGTERM', sigtermHandler);

    try {
      if (preSpawnSignalExitCode !== null) {
        process.exit(preSpawnSignalExitCode);
      }

      proc = Bun.spawn({
        cmd: ['opencode', ...extraArgs],
        env: { ...process.env, OPENCODE_CONFIG_DIR: profilePath },
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      const exitCode = await proc.exited;
      logger.info('closing profile:', highlighter.profile(profileName));
      process.exit(exitCode);
    } finally {
      process.off('SIGINT', sigintHandler);
      process.off('SIGTERM', sigtermHandler);
    }
  }
}
