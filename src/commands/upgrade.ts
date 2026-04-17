import { cancel, log, spinner } from '@clack/prompts';
import { CURRENT_VERSION } from '../meta';
import type { CommandStrategy } from '../schemas/command-strategy';
import { highlighter } from '../utils/highlighter';
import { successOutro } from '../utils/prompt.util';

function execText(cmd: string[]) {
  const proc = Bun.spawnSync(cmd, {
    stderr: 'pipe',
  });
  const out = proc.stdout.toString();
  return out;
}

type PackageManager = 'bun' | 'npm' | 'pnpm' | 'yarn';

export class UpgradeCommand implements CommandStrategy {
  readonly config = {
    name: 'upgrade',
    description: 'upgrade the OCP CLI to the latest version',
    args: [{ name: '[version]', description: 'Version to upgrade to (default: latest)' }],
  };

  async execute(version?: string): Promise<void> {
    log.step('Checking installation method');
    const method = this.installMethod();
    const currentVersion = CURRENT_VERSION;

    if (!method) {
      cancel('Could not detect installation method. Please upgrade manually.');
      process.exit(1);
    }

    log.info(`Detected method: ${highlighter.green(method)}`);

    const spin = spinner();
    const target = version ?? 'latest';

    spin.start(`Fetching ${target} version`);
    const res = await this.npmLatestVersion(target);

    if (!res) {
      spin.clear();
      cancel(`Invalid version: ${highlighter.green(target)}`);
      return;
    }

    if (res === currentVersion) {
      spin.error(`ocp upgrade skipped ${highlighter.green(res)} already installed`);
      successOutro();
      return;
    }

    spin.stop(`Valid version found: ${highlighter.green(res)}`);

    const spin2 = spinner();
    spin2.start('Upgrading packages');

    await this.upgradePackage(method, res);
    spin2.stop(`ocp ${highlighter.green(currentVersion)} -> ${highlighter.green(res)}`);
    successOutro();
  }

  private installMethod(): PackageManager | null {
    const exec = process.execPath.toLowerCase();

    const checks: Array<{ name: PackageManager; command: () => string }> = [
      { name: 'npm', command: () => execText(['npm', 'list', '-g', '--depth=0']) },
      { name: 'yarn', command: () => execText(['yarn', 'global', 'list']) },
      { name: 'pnpm', command: () => execText(['pnpm', 'list', '-g', '--depth=0']) },
      { name: 'bun', command: () => execText(['bun', 'pm', 'ls', '-g']) },
    ];

    checks.sort((a, b) => {
      const aMatches = exec.includes(a.name);
      const bMatches = exec.includes(b.name);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

    for (const check of checks) {
      const output = check.command();
      if (output.includes('opencode-profile')) {
        return check.name;
      }
    }
    return null;
  }

  private async npmLatestVersion(target: string): Promise<string | null> {
    const r = execText(['npm', 'config', 'get', 'registry']).trim();
    const reg = r ?? 'https://registry.npmjs.org';
    const registry = reg.endsWith('/') ? reg.slice(0, -1) : reg;
    const response = await fetch(`${registry}/opencode-profiles/${target}`);
    const data = (await response.json()) as { version?: string };
    return data.version ?? null;
  }

  private async upgradePackage(manager: PackageManager, version: string): Promise<void> {
    const commands: Record<PackageManager, string[]> = {
      bun: ['bun', 'update', '-g', `opencode-profiles@${version}`],
      npm: ['npm', 'update', '-g', `opencode-profiles@${version}`],
      pnpm: ['pnpm', 'update', '-g', `opencode-profiles@${version}`],
      yarn: ['yarn', 'global', 'add', `opencode-profiles@${version}`],
    };

    const proc = Bun.spawn(commands[manager]);
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      throw new Error(`Upgrade failed with exit code ${exitCode}`);
    }
  }
}
