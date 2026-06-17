"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, loginSchema } from "@repo/schema";
import { Button, Input } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const { error } = await signIn.email({ email: values.email, password: values.password });
    if (error) {
      setServerError(error.message ?? "로그인에 실패했습니다.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="font-semibold text-2xl">로그인</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="space-y-1">
          <Input type="email" placeholder="이메일" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <Input
            type="password"
            placeholder="비밀번호"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p role="alert" className="text-destructive text-sm">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중…" : "로그인"}
        </Button>
      </form>
    </main>
  );
}
