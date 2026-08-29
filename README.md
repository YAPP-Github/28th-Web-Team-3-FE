![프로젝트 배너](docs/images/readme/banner.webp)

# YAPP 28th Web Team 3

목표 금액을 정하고, 주간 절약 미션을 실천하며 저축을 이어가는 서비스의 프론트엔드 모노레포입니다.

## Features

- 목표 금액과 기간 설정, 월별 저축 현황 확인
- 소비 습관을 바탕으로 한 주간 절약 미션 생성·관리
- 청년 금융 혜택과 절약 팁 탐색·저장
- WebView 기반 네이티브 앱과 웹 간 브리지 연동
- 문의와 서비스 데이터를 위한 내부 어드민

## Tech stack

- Web: Next.js 16, React 19, Tailwind CSS 4
- Native: Expo 57, React Native 0.86, React Native WebView
- Data: TanStack Query, ky, Zod
- Tooling: pnpm, Turborepo, TypeScript, Biome, Vitest, Playwright

## Repository structure

```text
apps/
  web/       사용자 웹 애플리케이션
  native/    웹을 제공하는 Expo 기반 네이티브 셸
  admin/     내부 관리용 웹 애플리케이션
packages/
  api/       HTTP 클라이언트와 QueryClient
  bridge/    웹·네이티브 브리지 계약
  schema/    API 요청·응답 스키마
  ui/        공용 UI 컴포넌트와 디자인 토큰
  config/    공용 TypeScript·Biome 설정
```

## Getting started

Node.js `24.18.0`과 pnpm `11.8.0`이 필요합니다.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm web
```

웹 앱은 기본적으로 `http://localhost:3000`에서 실행됩니다. 로컬 백엔드는 `apps/web/.env.local`의 `BACKEND_API_URL`에서 설정합니다.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | 모든 워크스페이스 개발 서버 실행 |
| `pnpm web` | 웹 앱 개발 서버 실행 |
| `pnpm native` | Expo 개발 클라이언트 실행 |
| `pnpm ios` / `pnpm android` | iOS 또는 Android 앱 실행 |
| `pnpm build` | 워크스페이스 빌드 |
| `pnpm lint` | Biome 검사 |
| `pnpm typecheck` | TypeScript 검사 |
| `pnpm test` | Vitest 테스트 실행 |
| `pnpm --filter web test:e2e` | 웹 E2E 테스트 실행 |

## Development

코드 작성 규칙과 API 레이어 구조는 [코드 컨벤션](docs/code-conventions.md)에서 확인할 수 있습니다. 공용 UI의 디자인 토큰과 사용 방법은 [`packages/ui/DESIGN.md`](packages/ui/DESIGN.md)에 정리되어 있습니다.
