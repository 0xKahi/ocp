import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { highlighter } from '../../utils/highlighter';
import { logger } from '../../utils/logger';
import { ProfileLoader } from '../../utils/profile-loader';

export class ListProfileCommandTemplate extends CommandTemplate {
  override readonly name = 'list';
  override readonly description = 'List all profiles';
  override readonly alias = 'ls';

  override setOptions(_cmd: CommandEx): void {}

  override async execute(): Promise<void> {
    const profiles = await ProfileLoader.getAllProfilesWithValidity();

    if (profiles.length === 0) {
      logger.message('No profiles found.');
      return;
    }

    console.table(
      profiles.map(({ name, path, isValid }) => ({
        Name: highlighter.profile(name),
        Path: highlighter.path(path),
        Valid: isValid ? highlighter.success('✓') : highlighter.error('✗'),
      })),
    );
  }
}
