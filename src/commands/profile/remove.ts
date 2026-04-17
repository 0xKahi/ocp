import { cancel, isCancel, log, select, spinner } from '@clack/prompts';
import type { CommandStrategy } from '../../schemas/command-strategy';
import { loadOcpConfig } from '../../utils/config-loader.util';
import { highlighter } from '../../utils/highlighter';
import { ProfileLoader } from '../../utils/profile-loader';
import { successOutro } from '../../utils/prompt.util';

export class RemoveProfileCommand implements CommandStrategy {
  readonly config = {
    name: 'remove',
    description: 'Remove a profile',
    alias: 'rm',
    args: [{ name: '[name]', description: 'Profile name' }],
  };

  async execute(name?: string): Promise<void> {
    let profileName: string;

    const spin = spinner();
    spin.start('Loading profiles');
    const config = await loadOcpConfig();
    spin.stop('Finding profiles');

    const profiles = ProfileLoader.parseProfilesFromConfig(config);

    if (profiles.length === 0) {
      cancel('No profiles found. Please add a profile first.');
      process.exit(0);
    }

    if (name) {
      log.info(`Attempting to remove profile "${highlighter.profile(name)}"`);
      profileName = name;
    } else {
      const selectedName = await select({
        message: 'Select a profile to remove',
        options: profiles.map(p => {
          return {
            value: p.name,
          };
        }),
      });

      if (isCancel(selectedName)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      profileName = selectedName;
    }

    if (!profileName) {
      cancel('Profile name is required.');
      process.exit(0);
    }

    if (!config.profiles[profileName]) {
      cancel(`Profile "${highlighter.profile(profileName)}" does not exist.`);
      process.exit(0);
    }

    log.info(`Removing profile: ${highlighter.profile(profileName)}`);
    await ProfileLoader.removeProfile(profileName);
    successOutro();
  }
}
