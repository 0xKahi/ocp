import { execSync } from 'node:child_process';
import ora from 'ora';
import type { CommandEx } from '../schemas/command-ex';
import { CommandTemplate } from '../schemas/command-template';
import { highlighter } from '../utils/highlighter';
import { logger } from '../utils/logger';

type PackageManager = 'bun' | 'npm' | 'pnpm' | 'yarn';

interface PackageManagerInfo {
  name: PackageManager;
  command: string;
  updateCommand: string;
}

const PACKAGE_MANAGERS: PackageManagerInfo[] = [
  {
    name: 'bun',
    command: 'bun',
    updateCommand: 'bun update -g opencode-profiles',
  },
  {
    name: 'npm',
    command: 'npm',
    updateCommand: 'npm update -g opencode-profiles',
  },
  {
    name: 'pnpm',
    command: 'pnpm',
    updateCommand: 'pnpm update -g opencode-profiles',
  },
  {
    name: 'yarn',
    command: 'yarn',
    updateCommand: 'yarn global upgrade opencode-profiles',
  },
];

export class UpdateCommandTemplate extends CommandTemplate {
  override readonly name = 'update';
  override readonly description = 'Update the OCP CLI to the latest version';

  override setOptions(cmd: CommandEx): void {
    cmd.option('-f, --force <manager>', 'Force specific package manager (bun|npm|pnpm|yarn)');
  }

  protected override handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Update failed: ${message}`);
    process.exit(1);
  }

  override async execute(options: { force?: string }): Promise<void> {
    if (options.force) {
      const validManagers = ['bun', 'npm', 'pnpm', 'yarn'];
      if (!validManagers.includes(options.force)) {
        logger.error(`Invalid package manager: ${highlighter.error(options.force)}`);
        logger.error(`Valid options: ${validManagers.join(', ')}`);
        process.exit(1);
      }
    }

    const spinner = ora('Detecting package manager...').start();
    const packageManager = await this.detectPackageManager(options.force as PackageManager | undefined);

    if (!packageManager) {
      spinner.fail('Could not detect package manager');
      logger.error('Unable to determine how OCP was installed.');
      logger.error('Please update manually using your package manager:');
      logger.info(`  ${highlighter.command('bun update -g opencode-profiles')}`);
      logger.info(`  ${highlighter.command('npm update -g opencode-profiles')}`);
      logger.info(`  ${highlighter.command('pnpm update -g opencode-profiles')}`);
      logger.info(`  ${highlighter.command('yarn global upgrade opencode-profiles')}`);
      process.exit(1);
    }

    spinner.succeed(`Detected package manager: ${highlighter.success(packageManager.name)}`);

    const verifySpinner = ora(`Verifying ${packageManager.name} availability...`).start();
    const isAvailable = await this.isCommandAvailable(packageManager.command);

    if (!isAvailable) {
      verifySpinner.fail(`${packageManager.name} is not available in PATH`);
      logger.error(`The detected package manager (${packageManager.name}) is not available.`);
      logger.error('Please ensure it is installed and in your PATH.');
      process.exit(1);
    }
    verifySpinner.succeed(`${packageManager.name} is available`);

    const { version: currentVersion } = await import('../../package.json');
    logger.info(`Current version: ${highlighter.path(currentVersion)}`);

    const updateSpinner = ora(`Updating OCP via ${packageManager.name}...`).start();

    try {
      execSync(packageManager.updateCommand, {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
      updateSpinner.succeed('Update completed successfully!');
    } catch (error) {
      updateSpinner.fail('Update command failed');
      throw error;
    }

    const { version: newVersion } = await import('../../package.json');

    if (newVersion !== currentVersion) {
      logger.success(`Updated from ${highlighter.path(currentVersion)} to ${highlighter.success(newVersion)}`);
    } else {
      logger.info('Already on the latest version');
    }

    logger.info('');
    logger.info(`Run ${highlighter.command('ocp --version')} to verify the update.`);
  }

  private async detectPackageManager(force?: PackageManager): Promise<PackageManagerInfo | null> {
    if (force) {
      return PACKAGE_MANAGERS.find(pm => pm.name === force) || null;
    }

    const userAgent = process.env.npm_config_user_agent || '';

    if (userAgent.includes('bun')) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'bun') || null;
    }
    if (userAgent.includes('yarn')) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'yarn') || null;
    }
    if (userAgent.includes('pnpm')) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'pnpm') || null;
    }
    if (userAgent.includes('npm')) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'npm') || null;
    }

    const execPath = process.execPath || '';
    if (execPath.includes('bun')) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'bun') || null;
    }

    if (process.argv[0]?.includes('bun')) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'bun') || null;
    }

    for (const pm of PACKAGE_MANAGERS) {
      const hasOCP = await this.checkGlobalInstallation(pm.name);
      if (hasOCP) {
        return pm;
      }
    }

    const bunAvailable = await this.isCommandAvailable('bun');
    if (bunAvailable) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'bun') || null;
    }

    const npmAvailable = await this.isCommandAvailable('npm');
    if (npmAvailable) {
      return PACKAGE_MANAGERS.find(pm => pm.name === 'npm') || null;
    }

    return null;
  }

  private async checkGlobalInstallation(manager: PackageManager): Promise<boolean> {
    try {
      let listCommand: string;

      switch (manager) {
        case 'bun':
          listCommand = 'bun pm ls -g';
          break;
        case 'npm':
          listCommand = 'npm list -g --depth=0';
          break;
        case 'pnpm':
          listCommand = 'pnpm list -g';
          break;
        case 'yarn':
          listCommand = 'yarn global list';
          break;
        default:
          return false;
      }

      const output = execSync(listCommand, { encoding: 'utf-8', stdio: 'pipe' });
      return output.includes('opencode-profiles') || output.includes('ocp');
    } catch {
      return false;
    }
  }

  private async isCommandAvailable(command: string): Promise<boolean> {
    try {
      execSync(`${command} --version`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}
