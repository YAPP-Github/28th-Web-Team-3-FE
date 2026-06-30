# Local Build Skills

**Version 1.0.0**
28th-Web-Team-3
June 2026

> This document guides AI agents assisting with local development and build
> tasks in the web-team-3-fe monorepo. Rules are designed for consistency
> across onboarding, debugging, and automation workflows.

---

## Abstract

Local development and build workflow guide for the web-team-3-fe monorepo
(Next.js 16 + Expo 56). Covers pnpm shortcut scripts, Expo dev-client setup,
port management, prebuild flow, and common error resolution.

---

## Table of Contents

1. [Script Selection](#1-script-selection) — **CRITICAL**
2. [Expo Prebuild](#2-expo-prebuild) — **HIGH**
3. [Port Management](#3-port-management) — **HIGH**
4. [Error Resolution](#4-error-resolution) — **MEDIUM**
5. [Environment Requirements](#5-environment-requirements) — **MEDIUM**

---

## 1. Script Selection — CRITICAL

### 1.1 Use Root Shortcut Scripts

**Rule:** Use `pnpm web`, `pnpm native`, `pnpm ios`, `pnpm android` instead of
`pnpm --filter <app> <script>` when running a single app.

**Why:** Root-level shortcuts reduce cognitive overhead and prevent typos in
filter names. They are the canonical entry point in this repo.

| Shortcut | Equivalent | Purpose |
|---|---|---|
| `pnpm web` | `pnpm --filter web dev` | Next.js dev server |
| `pnpm native` | `pnpm --filter native start` | Expo dev-client |
| `pnpm ios` | `pnpm --filter native ios` | iOS simulator build |
| `pnpm android` | `pnpm --filter native android` | Android emulator build |

**Incorrect:**
```bash
pnpm --filter native ios
```

**Correct:**
```bash
pnpm ios
```

---

### 1.2 Use Turbo for Multi-App Dev

**Rule:** Use `pnpm dev` (turbo) when running web and native concurrently.
Do not open two terminals with separate shortcut scripts.

**Why:** Turbo parallelizes tasks with correct dependency ordering and shared
cache. Separate terminals can race on shared package builds.

---

## 2. Expo Prebuild — HIGH

### 2.1 Prebuild Before First Native Build

**Rule:** Run `pnpm --filter native prebuild` before the first `pnpm ios` or
`pnpm android` if `apps/native/ios` or `apps/native/android` folders are
absent.

**Why:** Expo managed workflow does not include native folders in the repo.
`expo run:ios` requires them to exist.

**Check:**
```bash
ls apps/native/ios apps/native/android
```

---

### 2.2 Prebuild Clean After Native Module Changes

**Rule:** Run `pnpm --filter native prebuild --clean` after adding or removing
any package that includes native code (e.g., `expo-*`, `react-native-*`).

**Why:** Stale native folders cause linker errors that are not obvious from
Metro or Xcode error messages.

---

## 3. Port Management — HIGH

### 3.1 Resolve Port Conflicts Before Retry

**Rule:** Before retrying a failed start command, check and kill any process
occupying the required port.

| App | Port | Kill command |
|---|---|---|
| Next.js | 3000 | `lsof -ti:3000 \| xargs kill` |
| Metro | 8081 | `lsof -ti:8081 \| xargs kill` |

**Why:** Stale dev server processes are the most common cause of
"address already in use" errors. Retrying without clearing the port loops.

---

## 4. Error Resolution — MEDIUM

### 4.1 Module Not Found

**Symptom:** `Cannot find module '@repo/...'` or similar workspace package.

**Resolution:**
```bash
pnpm install
```
Then retry the original command. If the error persists, check
`pnpm-workspace.yaml` to confirm the package is listed.

---

### 4.2 TypeScript Errors Blocking Build

**Symptom:** Build fails with type errors in terminal.

**Resolution:**
```bash
pnpm typecheck
```
Show the full list of errors before attempting fixes. Do not suppress errors
with `// @ts-ignore` — resolve the root type mismatch.

---

### 4.3 Metro Cache Corruption

**Symptom:** Unexpected JS errors in simulator despite correct source code;
cache-related warnings in Metro output.

**Resolution:**
```bash
pnpm --filter native start --clear
```

---

## 5. Environment Requirements — MEDIUM

### 5.1 Node and pnpm Versions

**Rule:** Confirm runtime matches the repo's requirements before debugging
build failures.

```bash
node --version   # must be >= 20
pnpm --version   # must be 11.x
```

**Why:** Node < 20 causes subtle crypto and ESM resolution failures that
surface as misleading errors inside packages.

---

### 5.2 iOS Build Requirements

**Rule:** Confirm Xcode tools are present before running `pnpm ios`.

```bash
xcode-select -p          # should print a path
xcrun simctl list        # lists available simulators
```

---

### 5.3 Android Build Requirements

**Rule:** Confirm `ANDROID_HOME` is set and an emulator is running before
`pnpm android`.

```bash
echo $ANDROID_HOME       # should be non-empty
adb devices              # at least one device/emulator listed
```
