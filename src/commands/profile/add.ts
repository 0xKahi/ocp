import path from 'node:path';
import { cancel, isCancel, log, text } from '@clack/prompts';
import type { CommandStrategy } from '../../schemas/command-strategy';
import { highlighter } from '../../utils/highlighter';
import { ProfileLoader } from '../../utils/profile-loader';
import { pointFormNote, successOutro } from '../../utils/prompt.util';

type AddProfileOptions = {
  cwd?: boolean;
  path?: string;
};

export class AddProfileCommand implements CommandStrategy {
  readonly config = {
    name: 'add',
    description: 'Add a new profile',
    args: [{ name: '[name]', description: 'Profile name' }],
    options: [
      { flag: '--cwd', description: 'Use current working directory as profile path' },
      { flag: '--path <path>', description: 'Path to the profile directory' },
    ],
  };

  async execute(name: string | undefined, options: AddProfileOptions): Promise<void> {
    let profileName: string;

    if (name) {
      log.info(`profile name -> ${highlighter.profile(name)}`);
      profileName = name;
    } else {
      const pName = await text({
        message: 'Enter profile name',
        placeholder: 'e.g. default',
        validate: value => {
          if (!value || value.length <= 0) return 'must provide valid name';
          return undefined;
        },
      });

      if (isCancel(pName)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      profileName = pName;
    }

    if (!profileName) {
      cancel('Profile name is required.');
      process.exit(0);
    }

    if (options.cwd && options.path) {
      cancel('Cannot use both --cwd and --path options together.');
      process.exit(0);
    }

    let profilePath: string | undefined = undefined;

    if (options?.cwd) {
      profilePath = process.cwd();
      log.info('Using current working directory as path');
    }

    if (options?.path) {
      const pathOption = options.path;
      profilePath = path.resolve(pathOption);
    }

    if (!profilePath) {
      const pPath = await text({
        message: 'Enter dir path of profile',
        placeholder: 'e.g. ~/profile/dir',
        validate: value => {
          if (!value || value.length <= 0) return 'must provide valid path';
          return undefined;
        },
      });

      if (isCancel(pPath)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      profilePath = path.resolve(pPath);
    }

    if (!profilePath) {
      cancel('Profile path is required.');
      process.exit(0);
    } else {
      log.step('Validating profile');
      await ProfileLoader.addProfile({ name: profileName, path: profilePath });

      pointFormNote({
        title: 'Added Profile',
        values: [`name: ${highlighter.profile(profileName)}`, `path: ${highlighter.path(profilePath)}`],
      });
      successOutro();
    }
  }
}
