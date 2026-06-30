# port-conflicts

**Section:** Port Management
**Impact:** HIGH

## Rule

Before retrying a failed dev server, kill the process on the occupied port rather than changing the port.

## Ports

| App | Port | Kill |
|---|---|---|
| Next.js | 3000 | `lsof -ti:3000 \| xargs kill` |
| Metro | 8081 | `lsof -ti:8081 \| xargs kill` |

## Why

Changing ports (e.g., `PORT=3001`) creates environment drift and breaks WebView bridge URLs configured for :3000 / :8081. Always restore the canonical port.

## Correct sequence

```bash
lsof -ti:3000 | xargs kill
pnpm web
```

## Incorrect

```bash
PORT=3001 pnpm web
```
