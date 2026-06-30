# local-build

**web-team-3-fe** 모노레포의 로컬 개발·빌드 워크플로 규칙.

`pnpm` 단축 스크립트, Expo prebuild 흐름, 포트 관리, 그리고 Next.js 16(apps/web)·
Expo 56(apps/native)의 자주 나오는 에러 해결을 다룬다.

## 빠른 시작

| 목표 | 명령 |
|---|---|
| Next.js dev 실행 | `pnpm web` |
| Expo dev-client 실행 | `pnpm native` |
| iOS 시뮬레이터 빌드 | `pnpm ios` |
| Android 에뮬레이터 빌드 | `pnpm android` |
| 전체 앱 실행 (turbo) | `pnpm dev` |

예제가 포함된 전체 규칙은 `AGENTS.md` 참고.
