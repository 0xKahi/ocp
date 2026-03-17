import { existsSync } from 'node:fs';
import { homedir, userInfo } from 'node:os';
import path from 'node:path';

type FileSearchResult = {
  exists: boolean;
  path: string;
};

const SHELL_VAR_REGEX = /\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g;

export class PathUtil {
  /**
   * Expand shell-style variables in a path string.
   * Supports: `~`, `$HOME`, `$USER`, `$VAR`, `${VAR}`.
   */
  static expandPath(rawPath: string): string {
    let result = rawPath;

    result = result.replace(SHELL_VAR_REGEX, (_match, braced, bare) => {
      const name = braced ?? bare;
      if (name === 'HOME') return homedir();
      if (name === 'USER') return userInfo().username;
      return process.env[name] ?? _match;
    });

    if (result === '~' || result.startsWith('~/') || result.startsWith('~\\')) {
      result = path.join(homedir(), result.slice(1));
    }

    return result;
  }

  static findFile(filePath: string): FileSearchResult {
    if (existsSync(filePath)) {
      return { exists: true, path: filePath };
    }
    return { exists: false, path: filePath };
  }

  static findOCPConfig(): FileSearchResult {
    const configPath = this.globalOCPConfig;
    return this.findFile(configPath);
  }

  static get globalConfigDir(): string {
    const base = process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config');
    return base;
  }

  static get globalOpencodeConfig(): string {
    return path.join(this.globalConfigDir, 'opencode');
  }

  static get globalOCPConfig(): string {
    return path.join(this.globalOpencodeConfig, 'ocp.jsonc');
  }
}

export type { FileSearchResult };
