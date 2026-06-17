import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid login and normalizes email", () => {
    const result = loginSchema.parse({ email: "  USER@Example.com ", password: "supersecret" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects a short password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      name: "Kim",
      email: "a@b.com",
      password: "supersecret",
      confirmPassword: "different1",
    });
    expect(result.success).toBe(false);
  });
});
