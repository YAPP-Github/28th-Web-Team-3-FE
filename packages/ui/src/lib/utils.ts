import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional + conflicting Tailwind classes. Standard shadcn helper. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
