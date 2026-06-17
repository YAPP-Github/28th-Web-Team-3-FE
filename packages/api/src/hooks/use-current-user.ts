import { sessionSchema, type User } from "@repo/schema";
import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

/**
 * Example data hook: fetches the current session and validates the response with
 * the shared Zod schema, so a server-side shape change surfaces as a typed error
 * rather than a silent runtime bug.
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const json = await api.get("api/auth/get-session").json();
      if (!json) return null;
      const parsed = sessionSchema.safeParse(json);
      return parsed.success ? parsed.data.user : null;
    },
  });
}
