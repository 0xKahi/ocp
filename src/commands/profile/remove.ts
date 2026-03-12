import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { highlighter } from '../../utils/highlighter';
import { logger } from '../../utils/logger';
import { ProfileLoader } from '../../utils/profile-loader';

export class RemoveProfileCommandTemplate extends CommandTemplate {
  name = 'remove';

  setup(cmd: CommandEx) {
    cmd.alias('rm').description('Remove a profile').argument('<name>', 'Profile name');
  }

  setOptions(cmd: CommandEx) {
    return cmd;
  }

  setAction(cmd: CommandEx) {
    cmd.action(async (name: string) => {
      try {
        await ProfileLoader.removeProfile(name);
        logger.success('Profile', highlighter.profile(name), 'has been removed successfully.');
      } catch (error: any) {
        logger.error(error?.message || 'An error occurred while removing the profile');
        process.exit(1);
      }
    });
  }
}
