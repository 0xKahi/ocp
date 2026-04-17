import z from 'zod';
import { OcpConfigSchema } from '../schemas/config.schema';
import { Atomic } from './atomic';
import { PathUtil } from './path.util';

export type OcpConfig = z.infer<typeof OcpConfigSchema>;

export async function loadOcpConfig(): Promise<OcpConfig> {
  const config = PathUtil.findOCPConfig();
  if (!config.exists) {
    throw new Error('OCP config file not found. Please run "ocp init" to initialize OCP.');
  }
  const raw = JSON.parse(await Bun.file(config.path).text());
  return OcpConfigSchema.parse(raw);
}

export async function updateOcpConfig(config: OcpConfig) {
  await Atomic.write({ filePath: PathUtil.globalOCPConfig, data: config });
}
