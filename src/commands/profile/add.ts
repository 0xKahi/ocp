import path from 'node:path';
import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { highlighter } from '../../utils/highlighter';
import { logger } from '../../utils/logger';
import { ProfileLoader } from '../../utils/profile-loader';

type AddProfileOptions = {
  cwd?: boolean;
  path?: string;
};

export class AddProfileCommandTemplate extends CommandTemplate {
  override readonly name = 'add';
  override readonly description = 'Add a new profile';

  override setArguments(cmd: CommandEx): void {
    cmd.argument('<name>', 'Profile name');
  }

  override setOptions(cmd: CommandEx): void {
    cmd.option('--cwd', 'Use current working directory as profile path').option('--path <path>', 'Path to the profile directory');
  }

  override async execute(name: string, options: AddProfileOptions): Promise<void> {
    if (!options.cwd && !options.path) {
      throw new Error('Either --cwd or --path <path> must be provided.');
    }

    if (options.cwd && options.path) {
      throw new Error('--cwd and --path are mutually exclusive.');
    }

    let profilePath: string;
    if (options.cwd) {
      profilePath = process.cwd();
    } else {
      const pathOption = options.path;
      if (!pathOption) {
        throw new Error('Path option is required when --cwd is not set.');
      }
      profilePath = path.resolve(pathOption);
    }

    await ProfileLoader.addProfile({ name, path: profilePath });
    logger.success('Profile', highlighter.profile(name), 'added at ', highlighter.path(profilePath));
  }
}
