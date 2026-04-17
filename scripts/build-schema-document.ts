import { z } from 'zod';
import { OcpConfigSchema } from '../src/schemas/config.schema';

export function createOcpConfigJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(OcpConfigSchema, {
    target: 'draft-7',
    unrepresentable: 'any',
  }) as Record<string, unknown>;

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://raw.githubusercontent.com/0xKahi/ocp/main/assets/ocp.schema.json',
    title: 'Opencode Profiles Configuration',
    description: 'Configuration schema for ocp (opencode-profiles) plugin',
    ...jsonSchema,
  };
}
