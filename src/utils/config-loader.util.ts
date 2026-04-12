import z from 'zod';
import { ConfigOptionsSchema, ConfigSchema } from '../schemas/config.schema';
import { Atomic } from './atomic';
import { PathUtil } from './path.util';

export type OcpConfig = z.infer<typeof ConfigSchema>;
export type OcpConfigOptions = z.infer<typeof ConfigOptionsSchema>;

export async function loadOcpConfig(): Promise<OcpConfig> {
  const config = PathUtil.findOCPConfig();
  if (!config.exists) {
    throw new Error('OCP config file not found. Please run "ocp init" to initialize OCP.');
  }
  const raw = JSON.parse(await Bun.file(config.path).text());
  return ConfigSchema.parse(raw);
}

export async function updateOcpConfig(config: OcpConfig) {
  await Atomic.write({ filePath: PathUtil.globalOCPConfig, data: config });
}
