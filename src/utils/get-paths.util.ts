import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

type FileSearchResult = {
  exists: boolean;
  path: string;
};

export function getGlobalConfigDir(): string {
  const base = process.env.XDG_CONFIG_HOME || path.join(homedir(), '.config');
  return base;
}

export function getGlobalOpencodeConfig(): string {
  return path.join(getGlobalConfigDir(), 'opencode');
}

export function getGlobalOCPConfig(): string {
  return path.join(getGlobalOpencodeConfig(), 'ocp.jsonc');
}

export function findFile(path: string): FileSearchResult {
  if (existsSync(path)) {
    return { exists: true, path };
  }
  return { exists: false, path };
}

export function findOCPConfig(): FileSearchResult {
  const configPath = getGlobalOCPConfig();
  return findFile(configPath);
}
