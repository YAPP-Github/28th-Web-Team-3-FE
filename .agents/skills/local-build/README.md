# local-build

Local development and build workflow rules for the **web-team-3-fe** monorepo.

Covers `pnpm` shortcut scripts, Expo prebuild flow, port management, and
common error resolution for Next.js 16 (apps/web) and Expo 56 (apps/native).

## Quickstart

| Goal | Command |
|---|---|
| Run Next.js dev | `pnpm web` |
| Run Expo dev-client | `pnpm native` |
| Build for iOS simulator | `pnpm ios` |
| Build for Android emulator | `pnpm android` |
| Run all apps (turbo) | `pnpm dev` |

See `AGENTS.md` for full rules with examples.
