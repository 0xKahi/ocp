import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { logger } from '../../utils/logger';
import { ProfileLoader } from '../../utils/profile-loader';

export class RemoveProfileCommandTemplate extends CommandTemplate {
  name = 'remove';

  setup(cmd: CommandEx) {
    cmd.description('Remove a profile').argument('<name>', 'Profile name');
  }

  setOptions(cmd: CommandEx) {
    return cmd;
  }

  setAction(cmd: CommandEx) {
    cmd.action(async (name: string) => {
      try {
        await ProfileLoader.removeProfile(name);
        logger.success(`Profile "${name}" removed.`);
      } catch (error: any) {
        logger.error(error?.message || 'An error occurred while removing the profile');
        process.exit(1);
      }
    });
  }
}
