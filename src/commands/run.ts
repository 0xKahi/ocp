import { box, cancel, isCancel, note, select, spinner, text } from '@clack/prompts';
import type { CommandEx } from '../schemas/command-ex';
import { CommandTemplate } from '../schemas/command-template';
import { loadOcpConfig } from '../utils/config-loader.util';
import { highlighter } from '../utils/highlighter';
import { type Profile, ProfileLoader } from '../utils/profile-loader';
import { successOutro } from '../utils/prompt.util';

type RunCommandOptions = {
  cmd?: string | boolean;
};

export class RunCommandTemplate extends CommandTemplate {
  override readonly name = 'run';
  override readonly description = 'Run opencode with a profile';
  override readonly alias = 'r';

  override setArguments(cmd: CommandEx): void {
    cmd.argument('[profile]', 'optional Profile name');
  }

  override setOptions(cmd: CommandEx): void {
    cmd.option('--cmd [VALUE]', 'Run forwarded arguments as an opencode subcommand');
  }

  override async execute(profileName: string | undefined, options: RunCommandOptions): Promise<void> {
    const spin = spinner();

    spin.start('Loading profiles');

    const config = await loadOcpConfig();
    const profiles = ProfileLoader.parseProfilesFromConfig(config);
    let selectedProfile: Profile | undefined = undefined;

    if (profiles.length === 0) {
      spin.stop('Found config');
      cancel('No profiles found. Please add a profile first.');
      process.exit(1);
    }

    if (profiles.filter(p => p.isValid).length === 0) {
      spin.stop('Found profiles');
      box(`${highlighter.green('ocp')} profile ls`, `${highlighter.component('hint:')} check profiles with`, {
        contentAlign: 'center',
        titleAlign: 'center',
        width: 'auto',
        rounded: true,
      });
      cancel('No valid profiles found. Please fix your profiles first.');
      process.exit(1);
    }

    if (profileName) {
      selectedProfile = profiles.find(p => p.name === profileName);
      if (!selectedProfile) {
        spin.error(`Profile "${highlighter.profile(profileName)}" does not exist`);
      } else {
        if (!selectedProfile.isValid) {
          spin.error(`Profile "${highlighter.profile(profileName)}" has invalid config`);
          note(highlighter.path(selectedProfile.path), 'profile path');
          selectedProfile = undefined;
        } else {
          spin.stop(`Found profile ${highlighter.profile(profileName)}`);
        }
      }
    } else {
      spin.stop('Found profiles');
    }

    if (!selectedProfile) {
      const selectedName = await select({
        message: 'Select a profile to run',
        options: profiles.map(p => {
          return {
            value: p.name,
            ...(!p.isValid ? { hint: 'Invalid config', disabled: true } : {}),
          };
        }),
      });

      if (isCancel(selectedName)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      selectedProfile = profiles.find(p => p.name === selectedName);
    }

    if (!selectedProfile) {
      cancel('No valid profile selected. Operation cancelled.');
      process.exit(0);
    }

    const extraArgs: string[] = [];
    if (options?.cmd === true) {
      const cmdArgs = await text({
        message: `Enter the command to be passed to ${highlighter.green('opencode')} ${highlighter.command('<command>')}`,
        placeholder: 'e.g. --port 3000',
        validate: value => {
          if (!value || value.length <= 0) return 'must provide valid argument';
          return undefined;
        },
      });

      if (isCancel(cmdArgs)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      extraArgs.push(...cmdArgs.split(' '));
    }

    if (typeof options?.cmd === 'string') {
      extraArgs.push(...options.cmd.split(' '));
    }

    if (options?.cmd === undefined && config.randomPort) {
      const port = Math.floor(Math.random() * 60905) + 4096;
      extraArgs.push('--port', String(port));
    }

    note([highlighter.green('opencode'), ...extraArgs].join(' '), `starting ${highlighter.profile(selectedProfile.name)} profile with..`);
    successOutro();

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
        env: { ...process.env, OPENCODE_CONFIG_DIR: selectedProfile.path },
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      const exitCode = await proc.exited;
      process.exit(exitCode);
    } finally {
      process.off('SIGINT', sigintHandler);
      process.off('SIGTERM', sigtermHandler);
    }
  }
}
