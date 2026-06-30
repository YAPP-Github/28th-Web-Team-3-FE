---
name: local-build
description: >
  Local development and build workflow guide for the web-team-3-fe monorepo.
  Apply when running, building, or troubleshooting Next.js (apps/web) or
  Expo / React Native (apps/native) locally.
license: MIT
metadata:
  author: 28th-web-team-3
  version: '1.0.0'
---

# Local Build Skills

Rules and guidance for local development and build workflows in this Turborepo monorepo.

## When to Apply

Reference these guidelines when:

- Starting local dev servers for web or native
- Building apps for simulator / emulator
- Troubleshooting Metro, Next.js, or Expo build errors
- Setting up a fresh developer environment
- Deciding between local build and EAS cloud build

## Rule Categories

| Priority | Category | Impact | Prefix |
|---|---|---|---|
| 1 | Script Selection | CRITICAL | `scripts-` |
| 2 | Expo Prebuild | HIGH | `prebuild-` |
| 3 | Port Management | HIGH | `port-` |
| 4 | Error Resolution | MEDIUM | `error-` |
| 5 | Environment | MEDIUM | `env-` |

## Quick Reference

### Script Selection (CRITICAL)
- `scripts-shortcuts` — Use root-level shortcuts instead of long `--filter` flags
- `scripts-scope` — Single app → shortcut; all apps → `pnpm dev` (turbo)

### Expo Prebuild (HIGH)
- `prebuild-when` — Run prebuild before first `ios`/`android` when native folder is missing
- `prebuild-clean` — Use `--clean` flag after adding/removing native modules

### Port Management (HIGH)
- `port-web` — Next.js runs on :3000; kill with `lsof -ti:3000 | xargs kill`
- `port-metro` — Metro runs on :8081; kill with `lsof -ti:8081 | xargs kill`

### Error Resolution (MEDIUM)
- `error-modules` — Package errors → `pnpm install` then retry
- `error-types` — TypeScript errors → `pnpm typecheck` to see full list

### Environment (MEDIUM)
- `env-node` — Requires Node ≥ 20 and pnpm 11
- `env-ios` — Requires Xcode + Command Line Tools for iOS builds
- `env-android` — Requires Android Studio + `ANDROID_HOME` env var
