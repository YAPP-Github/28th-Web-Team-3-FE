# AGENTS.md

프로젝트 규칙의 단일 원본. CLAUDE.md가 이 파일을 불러온다.
코드를 쓰는 규칙(API 레이어·에러 처리·테스트·문구)은 [`docs/code-conventions.md`](docs/code-conventions.md)에 있다 — 코드를 고치기 전에 확인한다.

## 작업 원칙

- 요청 범위만 바꾼다. 인접 코드·주석·포맷을 함께 정리하거나 동작하는 코드를 리팩터링하지 않는다. 바뀐 모든 줄은 요청으로 설명할 수 있어야 한다. 이번 변경으로 쓰이지 않게 된 import·변수는 정리하고, 무관한 미사용 코드는 언급만 한다.
- 요청하지 않은 기능, 일회용 추상화, 막연한 확장성은 만들지 않는다. 지금 요구사항을 푸는 최소 코드로 쓴다.
- 해석이 갈리거나 결과를 바꿀 정보가 없으면 가정을 밝히고 묻는다. 추측으로 메우지 않는다.
- 착수 전에 검증 방법을 정하고, 실제로 통과한 것을 확인한 뒤에만 완료라고 말한다.
- 선호가 달라도 기존 코드의 구조와 스타일을 따른다.

## 구조

```text
apps/web      Next.js 16 (App Router)
apps/admin    Next.js 16 어드민 (웹 전용, dev 포트 3001)
apps/native   Expo 57 / React Native 0.86 — 웹을 WebView로 띄우는 셸
packages/*    @repo/{api,bridge,schema,ui,config}
```

서버 상태 레이어는 `src/api/<도메인>.ts`(HTTP 호출)와 `lib/queries/<도메인>.ts`(TanStack Query
`queryOptions`/`mutationOptions`)로 나눈다. 컴포넌트는 커스텀 query 훅을 만들지 않고 options를
`useQuery`/`useMutation`에 주입한다. 상세 규약은 `docs/code-conventions.md`.

## 명령어 (루트에서)

```bash
pnpm dev | build | lint | typecheck | test   # turbo — lint=Biome, test=Vitest
pnpm check                                    # biome check --write . (lint+format 자동 수정)
```

웹 E2E: `pnpm --filter web test:e2e` (Playwright). 네이티브: `pnpm --filter native ios|android`.

## 프로젝트 스킬

반복 워크플로는 `.agents/skills/`에 있다. 명령을 직접 조합하기 전에 관련 스킬을 먼저 확인한다.

- 실행·빌드: `run`, `local-build`
- PR: `pr-create`(빌드·리뷰·PR 생성), `pr-comment-summary`(리뷰 댓글 요약)
- 구현 가이드: 웹은 `vercel-react-best-practices`·`web-design-guidelines`, 네이티브는
  `vercel-react-native-skills`, 공용 컴포넌트 API는 `vercel-composition-patterns`

## 규칙

- **버전은 `pnpm-workspace.yaml`의 catalog가 단일 소스.** 패키지에는 `catalog:`로만 참조한다.
  - `react`/`react-dom`은 **19.2.3 exact 핀** — RN 0.86 renderer 정합 때문이다. 범위(`^`)로 되돌리지 마라.
  - Node는 `.nvmrc`에 24.18.0 고정(`engines.node`는 `>=24.18.0`), pnpm은 11.8.0.
  - **메이저가 학습 데이터 기본값과 어긋나는 것** — TypeScript 6, Vitest 4, Biome 2, ky 2,
    **zod 4**(`z.iso.date()` 같은 v4 API를 쓴다. v3 패턴 금지). zod는 워크스페이스에 1카피만 둔다.
  - **예외**: Expo SDK가 호환 버전을 관리하는 네이티브 패키지(`expo`·`expo-*`, `react-native`,
    `react-native-webview`, `react-native-safe-area-context`, `expo-device` 등)는 `pnpm expo install`로
    설치해 `apps/native`에 직접 핀한다. `expo-doctor`의 SDK 정합성 검사 때문에 catalog로 빼지 않는다.
- **린트/포맷은 Biome 단독.** ESLint·Prettier 도입 금지.
- 워크스페이스 내부 의존성은 `workspace:*`. 커밋 전 lefthook 훅 통과 필수(`pnpm prepare`로 설치).
- Next 16 / React 19 / Tailwind v4 최신 API 기준 — 학습 데이터의 구버전 패턴에 주의한다.

### 인증: 비로그인 게스트 JWT (쿠키·세션 금지)

로그인이 없다. native가 기기 UUID(`expo-secure-store`)로 access/refresh를 발급받고,
**refresh와 UUID는 네이티브 밖으로 내보내지 않는다.** 웹은 bridge(토큰 조회/재발급 메서드)로
access만 받아 메모리에서 쓰고 `Authorization: Bearer` 헤더로 API를 호출한다.

- `credentials: "include"`·세션 쿠키(JSESSIONID) 코드를 쓰지 않는다.
- 서버가 `hash(uuid)`로 게스트를 식별한다 — refresh가 만료돼도 같은 UUID로 재발급하면 같은 계정으로 돌아온다.
- **네이티브 셸 밖(일반 브라우저)은 지원하지 않는다.** UUID·refresh가 SecureStore에만 있어 토큰을
  얻을 수단이 없다. 헤더 없이 보내고 서버가 401을 주게 둔다. 브라우저용 우회 인증을 다시 만들지 마라.

## 디자인 토큰 (packages/ui)

Tokens Studio 자동 연동은 **꺼져 있다.** Figma MCP로 확인한 토큰을
`packages/ui/src/styles/globals.css`에 직접 반영하며, 이 파일이 런타임 토큰의 단일 기준이다.

- `tokens.json`·`scripts/build-tokens.mjs`는 연동 재개용으로 남겨둔 파일이다. build·Storybook에서
  자동 실행하지 않는다. `tokens.json`은 디자이너가 관리하므로 직접 고치지 않는다(운영 방식은
  `packages/ui/DESIGN.md`).
- 연동을 재개하면 수동 토큰과 생성 토큰 중 한쪽만 단일 기준으로 남긴다.
- Pretendard는 `packages/ui/src/fonts/`에서 `@font-face`로 불러온다.
