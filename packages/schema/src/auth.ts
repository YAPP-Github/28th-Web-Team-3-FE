import { z } from "zod";

/**
 * Shared auth schemas. Used by react-hook-form on the client AND for validating
 * API responses, so web/native and client/server never drift.
 */

export const emailSchema = z.string().trim().toLowerCase().email("올바른 이메일을 입력하세요.");

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(128, "비밀번호가 너무 깁니다.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = loginSchema
  .extend({
    name: z.string().trim().min(1, "이름을 입력하세요.").max(64),
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
