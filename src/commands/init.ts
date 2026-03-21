import ora from 'ora';
import { CommandTemplate } from '../schemas/command-template';
import { highlighter } from '../utils/highlighter';
import { logger } from '../utils/logger';
import { PathUtil } from '../utils/path.util';

export class InitCommandTemplate extends CommandTemplate {
  override readonly name = 'init';
  override readonly description = 'Initialize OCP';

  override async execute(): Promise<void> {
    const opencodeDir = PathUtil.findFile(PathUtil.globalOpencodeConfig);

    if (opencodeDir.exists === false) {
      logger.error(`Opencode global directory not found at: ${highlighter.path(opencodeDir.path)}`);
      logger.error('Please ensure opencode is properly installed and configured.');
      process.exit(1);
    }

    const ocpConfig = PathUtil.findOCPConfig();

    if (ocpConfig.exists) {
      logger.error('OCP has already been initialized.');
      logger.error(`Config file already exists at: ${highlighter.path(ocpConfig.path)}`);
      logger.error('To reconfigure, remove the existing config file and run init again.');
      process.exit(1);
    }

    const spinner = ora('Initializing OCP...').start();

    const defaultConfig = {
      profiles: {},
      randomPort: false,
    };

    await Bun.write(ocpConfig.path, JSON.stringify(defaultConfig, null, 2), { mode: 0o600 });
    spinner.succeed('OCP initialized successfully!');
    logger.info(`Config file created at: ${highlighter.path(ocpConfig.path)}`);
  }
}
