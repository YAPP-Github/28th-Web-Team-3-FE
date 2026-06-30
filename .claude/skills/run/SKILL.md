---
name: run
description: >
  이 프로젝트의 웹·네이티브 앱을 로컬에서 실행하거나 빌드한다.
  "실행해줘", "앱 켜줘", "dev 서버", "ios 빌드", "android 빌드" 등의 요청에 사용.
argument-hint: [web|native|ios|android|build]
---

# 로컬 실행 스킬

`pnpm web / native / ios / android` 단축 스크립트를 활용해 앱을 실행합니다.

## 단축 스크립트 매핑

| 커맨드 | 원본 | 설명 |
|---|---|---|
| `pnpm web` | `pnpm --filter web dev` | Next.js dev 서버 (localhost:3000) |
| `pnpm native` | `pnpm --filter native start` | Expo dev-client (Metro 번들러) |
| `pnpm ios` | `pnpm --filter native ios` | iOS 시뮬레이터 빌드·실행 |
| `pnpm android` | `pnpm --filter native android` | Android 에뮬레이터 빌드·실행 |
| `pnpm dev` | `turbo run dev` | 웹·네이티브 동시 실행 |
| `pnpm build` | `turbo run build` | 전체 프로덕션 빌드 |

## 실행 규칙

### 앱 선택
- `$0`이 명시된 경우 해당 앱만 실행.
- 인자가 없으면 사용자에게 무엇을 실행할지 물어볼 것.
- "웹" → `pnpm web`, "앱/네이티브" → `pnpm native`, "아이폰/시뮬레이터" → `pnpm ios`, "안드로이드" → `pnpm android`.

### 사전 체크
1. `pnpm --version`으로 pnpm 11+ 확인.
2. iOS 실행 전 `xcode-select -p`로 Xcode Command Line Tools 확인.
3. Android 실행 전 `adb devices`로 에뮬레이터·디바이스 연결 확인.
4. `pnpm ios` / `pnpm android`는 `apps/native/android` / `apps/native/ios` 폴더가 있어야 함 — 없으면 `pnpm --filter native prebuild` 먼저 실행.

### 포트 충돌
- 웹: 3000번 포트 충돌 시 `lsof -ti:3000 | xargs kill` 후 재실행.
- Metro: 8081번 포트 충돌 시 `lsof -ti:8081 | xargs kill` 후 재실행.

### 빌드 오류 대응
- TypeScript 오류 → `pnpm typecheck` 실행 후 오류 목록 제시.
- 패키지 문제 → `pnpm install` 재실행.
- 네이티브 모듈 충돌 → `pnpm --filter native prebuild --clean` 후 재빌드.

## Expo dev-client 안내

`pnpm native`는 Expo Go가 아닌 **dev-client** 모드로 실행됩니다.
기기에 dev-client 앱이 없다면 먼저 `pnpm ios` 또는 `pnpm android`로 빌드해야 합니다.

## EAS 클라우드 빌드

로컬 빌드가 아닌 EAS 빌드는 `eas build` 명령을 사용합니다 (`apps/native/eas.json` 참고).
이 스킬은 **로컬 빌드 전용**입니다.
