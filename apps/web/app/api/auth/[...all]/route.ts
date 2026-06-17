import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Better Auth mounts all its endpoints under /api/auth/* via this catch-all.
export const { GET, POST } = toNextJsHandler(auth);
