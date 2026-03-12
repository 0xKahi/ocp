import path from 'node:path';
import z from 'zod';
import { ConfigOptionsSchema, ConfigSchema } from '../schemas/config.schema';
import { Atomic } from './atomic';
import { findFile, findOCPConfig, getGlobalOCPConfig } from './get-paths.util';

type Config = z.infer<typeof ConfigSchema>;
type Options = z.infer<typeof ConfigOptionsSchema>;

type Profile = {
  name: string;
  path: string;
};

export class ProfileLoader {
  static async getAllProfiles(): Promise<Profile[]> {
    const config = await this.loadConfig();
    return Object.entries(config.profiles).map(([name, profile]) => ({
      name,
      path: profile.path,
    }));
  }

  static async getAllProfilesWithValidity(): Promise<(Profile & { isValid: boolean })[]> {
    const profiles = await this.getAllProfiles();
    return profiles.map(profile => ({
      ...profile,
      isValid: this.isProfileValid(profile),
    }));
  }

  static async getProfileAndOptions(name: string): Promise<(Profile & { opts: Options }) | undefined> {
    const { profiles, ...rest } = await this.loadConfig();
    const profile = profiles[name];
    if (!profile) {
      return undefined;
    }
    return { name, path: profile.path, opts: rest };
  }

  static isProfileValid(profile: Profile): boolean {
    try {
      this.validateProfilePath(profile.path);
      return true;
    } catch {
      return false;
    }
  }

  static async addProfile(profile: Profile) {
    const config = await this.loadConfig();
    if (!!config.profiles[profile.name]) {
      throw new Error(`Profile with name "${profile.name}" already exists.`);
    }

    this.validateProfilePath(profile.path);

    config.profiles[profile.name] = { path: profile.path };

    await Atomic.write({ filePath: getGlobalOCPConfig(), data: config });
  }

  static async removeProfile(name: string) {
    const config = await this.loadConfig();
    if (!config.profiles[name]) {
      throw new Error(`Profile with name "${name}" does not exist.`);
    }

    delete config.profiles[name];
    await Atomic.write({ filePath: getGlobalOCPConfig(), data: config });
  }

  private static async loadConfig(): Promise<Config> {
    const config = findOCPConfig();
    if (!config.exists) {
      throw new Error('OCP config file not found. Please run "ocp init" to initialize OCP.');
    }
    const raw = JSON.parse(await Bun.file(config.path).text());
    return ConfigSchema.parse(raw);
  }

  private static validateProfilePath(profilePath: string) {
    if (findFile(profilePath).exists === false) {
      throw new Error(`Profile path does not exist: ${profilePath}`);
    }

    const opencodeConfig = findFile(path.join(profilePath, 'opencode.jsonc'));
    const opencodeConfig2 = findFile(path.join(profilePath, 'opencode.json'));

    if (!opencodeConfig.exists && !opencodeConfig2.exists) {
      throw new Error(`Profile path does not contain a valid opencode configuration file: ${profilePath}`);
    }
  }
}
