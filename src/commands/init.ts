import { box, cancel, log, note, spinner } from '@clack/prompts';
import { CommandTemplate } from '../schemas/command-template';
import { highlighter } from '../utils/highlighter';
import { PathUtil } from '../utils/path.util';
import { successOutro } from '../utils/prompt.util';

export class InitCommandTemplate extends CommandTemplate {
  override readonly name = 'init';
  override readonly description = 'Initialize OCP';

  override async execute(): Promise<void> {
    const spin = spinner();
    spin.start('Finding opencode global directory');
    const opencodeDir = PathUtil.findFile(PathUtil.globalOpencodeConfig);

    if (opencodeDir.exists === false) {
      spin.error(`Opencode global directory not found at: ${highlighter.path(opencodeDir.path)}`);
      cancel('Initialization failed');
      process.exit(1);
    }
    spin.stop('Found opencode global directory');

    const ocpConfig = PathUtil.findOCPConfig();

    if (ocpConfig.exists) {
      log.error('OCP has already been initialized.');
      note(highlighter.path(ocpConfig.path), 'Configuration File Path');
      cancel('Already Initialized');
      process.exit(1);
    }

    const defaultConfig = {
      profiles: {},
      randomPort: false,
    };

    const spin2 = spinner();
    spin2.start('Creating config file');
    await Bun.write(ocpConfig.path, JSON.stringify(defaultConfig, null, 2), { mode: 0o600 });
    spin2.stop(`Config file was created at: ${highlighter.path(ocpConfig.path)}`);

    box(`${highlighter.green('ocp')} profile add`, 'Add Profiles With', {
      contentAlign: 'center',
      titleAlign: 'center',
      width: 'auto',
      rounded: true,
    });
    successOutro();
  }
}
