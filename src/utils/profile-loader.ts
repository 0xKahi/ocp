import path from 'node:path';
import { loadOcpConfig, type OcpConfig, updateOcpConfig } from './config-loader.util';
import { PathUtil } from './path.util';

export type Profile = {
  name: string;
  path: string;
  isValid: boolean;
};

export class ProfileLoader {
  static parseProfilesFromConfig(config: OcpConfig): Profile[] {
    return Object.entries(config.profiles).map(([name, data]) => {
      const { valid } = this.validateProfilePath(data.path);
      return {
        name,
        path: PathUtil.expandPath(data.path),
        isValid: valid,
      };
    });
  }

  static async addProfile(profile: { name: string; path: string }) {
    const config = await loadOcpConfig();
    if (!!config.profiles[profile.name]) {
      throw new Error(`Profile with name "${profile.name}" already exists.`);
    }

    const { error } = this.validateProfilePath(profile.path);
    if (error) throw error;

    config.profiles[profile.name] = { path: profile.path };

    await updateOcpConfig(config);
  }

  static async removeProfile(name: string) {
    const config = await loadOcpConfig();
    if (!config.profiles[name]) {
      throw new Error(`Profile with name "${name}" does not exist.`);
    }

    delete config.profiles[name];
    await updateOcpConfig(config);
  }

  private static validateProfilePath(profilePath: string): { valid: boolean; error?: Error } {
    const resolved = PathUtil.expandPath(profilePath);

    if (PathUtil.findFile(resolved).exists === false) {
      return { valid: false, error: new Error(`Profile path does not exist: ${resolved}`) };
    }

    const opencodeConfig = PathUtil.findFile(path.join(resolved, 'opencode.jsonc'));
    const opencodeConfig2 = PathUtil.findFile(path.join(resolved, 'opencode.json'));

    if (!opencodeConfig.exists && !opencodeConfig2.exists) {
      return { valid: false, error: new Error(`Profile path does not contain a valid opencode configuration file: ${resolved}`) };
    }
    return { valid: true };
  }
}
