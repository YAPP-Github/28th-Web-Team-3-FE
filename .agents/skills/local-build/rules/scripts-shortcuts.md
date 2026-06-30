# scripts-shortcuts

**섹션:** 스크립트 선택
**영향도:** CRITICAL

## 규칙

단일 앱을 대상으로 할 때는 `pnpm --filter <app> <script>` 대신 항상 루트 단축
스크립트를 사용한다.

## 이유

`pnpm --filter`는 오류가 나기 쉽고(filter 이름이 `package.json`의 `name`과
정확히 일치해야 함) 장황하다. 루트 단축 스크립트는 팀이 합의한 표준 진입점이다.

## 올바른 예

```bash
pnpm web      # Next.js dev
pnpm native   # Expo dev-client
pnpm ios      # iOS 시뮬레이터
pnpm android  # Android 에뮬레이터
```

## 잘못된 예

```bash
pnpm --filter web dev
pnpm --filter native start
pnpm --filter native ios
pnpm --filter native android
```
