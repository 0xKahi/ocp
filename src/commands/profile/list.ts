import { spinner } from '@clack/prompts';
import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { loadOcpConfig } from '../../utils/config-loader.util';
import { highlighter } from '../../utils/highlighter';
import { ProfileLoader } from '../../utils/profile-loader';
import { successOutro } from '../../utils/prompt.util';

export class ListProfileCommandTemplate extends CommandTemplate {
  override readonly name = 'list';
  override readonly description = 'List all profiles';
  override readonly alias = 'ls';

  override setOptions(_cmd: CommandEx): void {}

  override async execute(): Promise<void> {
    const spin = spinner();

    spin.start('Loading profiles');
    const config = await loadOcpConfig();
    const profiles = ProfileLoader.parseProfilesFromConfig(config);

    if (profiles.length === 0) {
      spin.cancel('No profiles found. Please add a profile first.');
      return;
    }

    spin.stop('Loaded profiles');
    console.table(
      profiles.map(({ name, path, isValid }) => ({
        Name: highlighter.profile(name),
        Path: highlighter.path(path),
        Valid: isValid ? highlighter.success('✓') : highlighter.error('✗'),
      })),
    );
    successOutro();
  }
}
