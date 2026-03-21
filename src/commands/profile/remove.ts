import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { highlighter } from '../../utils/highlighter';
import { logger } from '../../utils/logger';
import { ProfileLoader } from '../../utils/profile-loader';

export class RemoveProfileCommandTemplate extends CommandTemplate {
  override readonly name = 'remove';
  override readonly description = 'Remove a profile';
  override readonly alias = 'rm';

  override setArguments(cmd: CommandEx): void {
    cmd.argument('<name>', 'Profile name');
  }

  override setOptions(_cmd: CommandEx): void {}

  override async execute(name: string): Promise<void> {
    await ProfileLoader.removeProfile(name);
    logger.success('Profile', highlighter.profile(name), 'has been removed successfully.');
  }
}
