import path from 'node:path';
import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { logger } from '../../utils/logger';
import { ProfileLoader } from '../../utils/profile-loader';
import { highlighter } from '../../utils/highlighter';

type AddProfileOptions = {
  cwd?: boolean;
  path?: string;
};

export class AddProfileCommandTemplate extends CommandTemplate {
  name = 'add';

  setup(cmd: CommandEx) {
    cmd.description('Add a new profile').argument('<name>', 'Profile name');
  }

  setOptions(cmd: CommandEx) {
    cmd.option('--cwd', 'Use current working directory as profile path').option('--path <path>', 'Path to the profile directory');
  }

  setAction(cmd: CommandEx) {
    cmd.action(async (name: string, options: AddProfileOptions) => {
      try {
        if (!options.cwd && !options.path) {
          throw new Error('Either --cwd or --path <path> must be provided.');
        }

        if (options.cwd && options.path) {
          throw new Error('--cwd and --path are mutually exclusive.');
        }

        const profilePath = options.cwd ? process.cwd() : path.resolve(options.path!);

        await ProfileLoader.addProfile({ name, path: profilePath });
        logger.success('Profile', highlighter.profile(name), 'added at ', highlighter.path(profilePath));
      } catch (error: any) {
        logger.error(error?.message || 'An error occurred while adding the profile');
        process.exit(1);
      }
    });
  }
}
