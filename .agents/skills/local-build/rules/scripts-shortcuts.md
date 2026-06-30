# scripts-shortcuts

**Section:** Script Selection
**Impact:** CRITICAL

## Rule

Always use the root-level shortcut scripts instead of `pnpm --filter <app> <script>` when targeting a single app.

## Why

`pnpm --filter` is error-prone (filter name must match `package.json` `name` exactly) and verbose. The root shortcuts are the canonical entry point agreed on by the team.

## Correct

```bash
pnpm web      # Next.js dev
pnpm native   # Expo dev-client
pnpm ios      # iOS simulator
pnpm android  # Android emulator
```

## Incorrect

```bash
pnpm --filter web dev
pnpm --filter native start
pnpm --filter native ios
pnpm --filter native android
```
