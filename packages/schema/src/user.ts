import { z } from "zod";

/** Shape returned by the auth/session endpoints. Validate responses against this. */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean().default(false),
  image: z.string().url().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const sessionSchema = z.object({
  user: userSchema,
  session: z.object({
    id: z.string(),
    expiresAt: z.coerce.date(),
  }),
});

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
