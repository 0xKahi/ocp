import z from 'zod';

const ProfileSchema = z.object({
  path: z.string(),
});
const ProfilePropSchema = z.record(z.string(), ProfileSchema);

const StartupOptionsSchema = z.object({
  randomPort: z.boolean().default(false).describe('assign a random port to the server on profile startup'),
});

export const OcpConfigSchema = z.object({
  $schema: z.string().optional(),
  startup: StartupOptionsSchema,
  profiles: ProfilePropSchema,
});
