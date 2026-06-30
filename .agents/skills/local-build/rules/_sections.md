# Sections

Defines all rule sections, their ordering, impact levels, and filename prefixes.

---

## 1. Script Selection (scripts)

**Impact:** CRITICAL
**Description:** Which pnpm command to use for each scenario. Using shortcuts
avoids --filter typos and is the canonical entry point for this repo.

## 2. Expo Prebuild (prebuild)

**Impact:** HIGH
**Description:** When and how to run `expo prebuild` before native builds.
Skipping this step is the #1 cause of native build failures on a fresh clone.

## 3. Port Management (port)

**Impact:** HIGH
**Description:** Detecting and resolving port conflicts for Next.js (:3000)
and Metro (:8081) before retrying dev server commands.

## 4. Error Resolution (error)

**Impact:** MEDIUM
**Description:** Triage patterns for the most common local build failures:
missing modules, TypeScript errors, and Metro cache corruption.

## 5. Environment (env)

**Impact:** MEDIUM
**Description:** Node / pnpm version checks and platform tool requirements
(Xcode for iOS, Android Studio for Android).
