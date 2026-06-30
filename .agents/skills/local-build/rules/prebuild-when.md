# prebuild-when

**Section:** Expo Prebuild
**Impact:** HIGH

## Rule

Check for `apps/native/ios` and `apps/native/android` before running `pnpm ios` or `pnpm android`. If either is missing, run prebuild first.

## Why

Native folders are gitignored (Expo managed workflow). A fresh clone will not have them. `expo run:ios` / `expo run:android` fails immediately without them.

## Check

```bash
ls apps/native/ios apps/native/android
```

## Resolution

```bash
pnpm --filter native prebuild
pnpm ios    # or pnpm android
```

## Note

After adding native modules (e.g., `expo install expo-camera`), just re-run prebuild — the `prebuild` script is already `expo prebuild --clean`, so a plain re-run regenerates native folders cleanly.

```bash
pnpm --filter native prebuild
```
