# port-conflicts

**섹션:** 포트 관리
**영향도:** HIGH

## 규칙

실패한 dev 서버를 재시도하기 전에, 포트를 바꾸지 말고 점유 중인 포트의
프로세스를 종료한다.

## 포트

| 앱 | 포트 | 종료 |
|---|---|---|
| Next.js | 3000 | `lsof -ti:3000 \| xargs kill` |
| Metro | 8081 | `lsof -ti:8081 \| xargs kill` |

## 이유

포트를 바꾸면(예: `PORT=3001`) 환경이 어긋나고, :3000 / :8081에 맞춰진 WebView
브릿지 URL이 깨진다. 항상 표준 포트를 복구한다.

## 올바른 순서

```bash
lsof -ti:3000 | xargs kill
pnpm web
```

## 잘못된 예

```bash
PORT=3001 pnpm web
```
