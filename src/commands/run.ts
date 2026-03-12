import type { CommandEx } from '../schemas/command-ex';
import { CommandTemplate } from '../schemas/command-template';
import { highlighter } from '../utils/highlighter';
import { logger } from '../utils/logger';
import { ProfileLoader } from '../utils/profile-loader';

export class RunCommandTemplate extends CommandTemplate {
  name = 'run';

  setup(cmd: CommandEx) {
    cmd.alias('r').description('Run opencode with a profile').argument('<profile>', 'Profile name');
  }

  setOptions(cmd: CommandEx) {
    return cmd;
  }

  setAction(cmd: CommandEx) {
    cmd.allowUnknownOption(true);
    cmd.action(async (profileName: string, _options: unknown, command: CommandEx) => {
      try {
        const result = await ProfileLoader.getProfileAndOptions(profileName);
        if (!result) {
          throw new Error(`Profile "${highlighter.profile(profileName)}" not found.`);
        }

        if (!ProfileLoader.isProfileValid(result)) {
          throw new Error(`Profile "${profileName}" is invalid.`);
        }

        const { path: profilePath, opts } = result;
        const extraArgs = command.args.slice(1);

        if (opts.randomPort) {
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
      } catch (error: any) {
        logger.error(error?.message || 'An error occurred while running the profile');
        process.exit(1);
      }
    });
  }
}
