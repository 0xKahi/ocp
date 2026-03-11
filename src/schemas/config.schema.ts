import z from 'zod';

const ProfileSchema = z.object({
  path: z.string(),
});

const ProfilePropSchema = z.record(z.string(), ProfileSchema);
export const ConfigOptionsSchema = z.object({
  randomPort: z.boolean().default(false),
});

export const ConfigSchema = z
  .object({
    profiles: ProfilePropSchema,
  })
  .merge(ConfigOptionsSchema);
