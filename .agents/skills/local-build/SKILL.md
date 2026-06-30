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

### Expo Prebuild (HIGH)
- `prebuild-when` — Run prebuild before first `ios`/`android` when native folder is missing (always runs `--clean` internally)

### Port Management (HIGH)
- `port-conflicts` — Kill stale process on :3000/:8081 before retrying dev server
