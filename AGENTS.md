# AGENTS.md

AI 코딩 도구가 불필요한 변경과 과설계를 피하도록 돕는 공통 작업 원칙이다. 아래 프로젝트 규칙과 함께 적용한다.
**우선순위**: 단순한 작업에는 필요한 만큼만 적용하되, 기본적으로 속도보다 정확성을 우선한다.
**단일 원본**: 공통 AI 작업 지침은 이 파일에서만 관리한다. CLAUDE.md는 이 파일을 불러온다.
**코드 컨벤션**: API 레이어·에러 처리·테스트 등 코드를 쓰는 규칙은 [`docs/code-conventions.md`](docs/code-conventions.md)에 있다. 코드를 고치기 전에 해당 항목을 확인한다.

## 작업 원칙

### 1. 구현 전에 맥락 확인

요구사항과 기존 코드를 먼저 확인한다. 가정으로 빈틈을 메우거나 모호함을 감추지 않는다.

- 해석이 여러 개이거나 결과에 영향을 주는 정보가 부족하면 가정을 밝히고 질문한다.
- 더 단순한 해법이 있으면 이유와 트레이드오프를 함께 제시한다.

### 2. 단순함 우선

현재 요구사항을 충족하는 최소 코드로 해결한다.

- 요청하지 않은 기능, 일회용 추상화, 막연한 확장성은 추가하지 않는다.
- 200줄로 작성한 코드를 50줄로 해결할 수 있다면 다시 쓴다.

자가 점검: "시니어 엔지니어가 이 변경을 과하다고 볼까?" 그렇다면 단순화한다.

### 3. 변경 범위 지키기

요청과 직접 관련된 코드만 바꾼다.

- 인접 코드나 주석, 포맷을 함께 정리하거나 정상 동작하는 코드를 리팩터링하지 않는다.
- 선호하는 방식이 달라도 기존 코드의 구조와 스타일을 따른다.
- 무관한 미사용 코드는 언급만 한다. 이번 변경으로 필요 없어진 import, 변수, 함수는 정리한다.

바뀐 모든 줄은 요청이나 그 변경에 필요한 정리로 설명할 수 있어야 한다.

### 4. 검증 가능한 목표로 작업

작업을 시작하기 전에 성공 기준을 정한다. 예를 들어 "버그 수정"은 "문제를 재현하는 테스트를 작성하고 통과시킨다"로 구체화한다. 여러 단계가 필요하면 짧은 계획을 남긴다.

```text
1. [단계] → 검증: [확인]
2. [단계] → 검증: [확인]
```

검증 결과가 성공 기준을 충족할 때까지 수정과 확인을 반복한다.

---

## 프로젝트: web-team-3-fe

pnpm과 Turborepo를 사용하는 모노레포다. Next.js 웹과 Expo 네이티브 앱이 WebView 브릿지를 공유한다.

### 구조

```text
apps/web      Next.js 16 (App Router)
apps/admin    Next.js 16 어드민 (웹 전용, dev 포트 3001)
apps/native   Expo 57 / React Native 0.86
packages/*    @repo/{api,bridge,schema,ui,config}
```

`apps/web`의 서버 상태 레이어는 `api/<도메인>.ts`(HTTP 호출)와
`lib/queries/<도메인>.ts`(TanStack Query `queryOptions`/`mutationOptions`)로 나눈다.
컴포넌트는 커스텀 query 훅을 만들지 않고 options를 가져와 `useQuery`/`useMutation`에 주입한다.

### 명령어 (루트에서)

```bash
pnpm dev         # turbo dev
pnpm build       # turbo build
pnpm lint        # turbo lint (Biome)
pnpm typecheck   # turbo typecheck (tsc --noEmit)
pnpm test        # turbo test (Vitest)
pnpm check       # biome check --write . (lint + format 자동 수정)
pnpm format      # biome format --write .
```

웹 E2E: `pnpm --filter web test:e2e` (Playwright). 네이티브: `pnpm --filter native ios|android`.

### 프로젝트 스킬

반복 워크플로는 `.agents/skills/`에 정리돼 있다. 직접 명령을 조합하기 전에 관련 스킬을 먼저 확인한다.

- 실행·빌드: `run`, `local-build`
- PR: `pr-create`(빌드·리뷰·PR 생성), `pr-comment-summary`(리뷰 댓글 요약)
- 구현 가이드: 웹은 `vercel-react-best-practices`·`web-design-guidelines`, 네이티브는 `vercel-react-native-skills`, 공용 컴포넌트 API는 `vercel-composition-patterns`

그 외 스킬은 `.agents/skills/`에서 확인한다.

### 스택 / 버전 (catalog = `pnpm-workspace.yaml` 단일 소스)

| 영역          | 패키지                                             | 버전                        |
| ------------- | -------------------------------------------------- | --------------------------- |
| 런타임        | Node                                               | >=24.18.0 (.nvmrc 핀)       |
| 패키지매니저  | pnpm                                               | 11.8.0                      |
| 빌드          | Turbo                                              | ^2.9.18                     |
| 언어          | TypeScript                                         | ^6.0.3                      |
| 린트/포맷     | Biome                                              | ^2.5.0                      |
| Git 훅        | lefthook                                           | ^2.1.9                      |
| 웹            | Next.js                                            | ^16.2.9                     |
| React         | react / react-dom                                  | 19.2.3 (RN 0.86 정합 exact 핀) |
| 폼            | react-hook-form                                    | ^7.80.0                     |
| 스키마        | zod                                                | ^4.4.3 (워크스페이스 1카피) |
| 데이터        | @tanstack/react-query                              | ^5.101.0                    |
| HTTP          | ky                                                 | ^2.0.2                      |
| 인증          | 비로그인 게스트 JWT — native 발급, bridge로 웹 전달, 쿠키 미사용 | —          |
| 상태          | zustand                                            | ^5.0.14                     |
| 스타일        | Tailwind                                           | ^4.3.1                      |
| 브릿지        | @webview-bridge/*                                  | ^1.7.9                      |
| 테스트        | Vitest / Playwright                                | ^4.1.9 / ^1.61.0            |
| API 모킹      | msw                                                | ^2.14.6                     |
| 모니터링      | @sentry/nextjs                                     | ^10.61.0                    |
| 컴포넌트 문서 | Storybook / Chromatic                              | ^10.4.6 / ^17.8.0           |
| 데드코드 탐지 | knip                                               | ^6.23.0                     |
| 네이티브      | Expo / React Native                                | ~57.0 / 0.86.0              |

### 규칙

- **버전은 catalog에서만**. 패키지엔 `catalog:`로 참조 — 개별 버전 박지 마라.
  - 예외: Expo SDK가 호환 버전을 관리하는 네이티브 패키지는 `pnpm expo install`로 설치하고 `apps/native`에 직접 핀한다. `expo`·`expo-*`, `react-native`, `react-native-webview`, `react-native-safe-area-context`, `expo-device` 등이 해당하며, `expo install`/`expo-doctor`의 SDK 정합성 검사를 위해 catalog로 빼지 않는다.
- **린트/포맷은 Biome 단일**. ESLint·Prettier 도입 금지.
- 커밋 전 lefthook 훅 통과 필수 (`pnpm prepare`로 설치).
- 워크스페이스 내부 의존성은 `workspace:*`.
- **인증은 비로그인 게스트 JWT — 쿠키/세션 사용 금지.** 로그인 없음. native가 UUID(expo-secure-store) 기반으로 access/refresh를 발급받고, refresh·UUID는 네이티브 밖으로 내보내지 않는다. 웹은 bridge(토큰 조회/재발급 메서드)로 access만 받아 메모리에서 사용하고 `Authorization: Bearer` 헤더로 API 호출. `credentials: "include"`·세션 쿠키(JSESSIONID) 코드 작성 금지.
  - 기기 UUID는 네이티브가 `expo-secure-store`에 영구 보관한다. 서버가 `hash(uuid)`로 게스트를 식별하므로 refresh token이 만료돼도 같은 UUID로 재발급하면 같은 계정으로 돌아온다.
  - **네이티브 셸 밖(일반 브라우저)은 지원하지 않는다.** UUID·refresh token이 SecureStore에만 있어 토큰을 얻을 수단이 없다. 이때는 헤더 없이 보내고 서버가 401로 판단하게 둔다. 브라우저용 우회 인증을 다시 만들지 마라.
- Next 16 / React 19 / Tailwind v4 최신 API 기준 — 학습 데이터의 구버전 패턴 주의.

### 디자인 토큰 (packages/ui)

현재 Tokens Studio 자동 연동은 꺼져 있다. Figma MCP로 확인한 토큰을 `packages/ui/src/styles/globals.css`에 직접 반영하며, 이 파일을 런타임 토큰의 단일 기준으로 사용한다.

- `packages/ui/tokens.json`과 `scripts/build-tokens.mjs`는 추후 Tokens Studio를 다시 연결할 때 사용할 파일이다. 현재 build와 Storybook에서는 자동 실행하지 않는다.
- 연동을 재개하면 `Tokens Studio → tokens.json → build-tokens.mjs → tokens.generated.css` 흐름으로 전환한다. 이때 수동 토큰과 생성 토큰이 중복되지 않도록 한쪽만 단일 기준으로 남긴다.
- `tokens.json`은 디자이너가 관리하므로 직접 수정하지 않는다. 자세한 운영 방식은 `packages/ui/DESIGN.md`를 따른다.
- Pretendard는 `packages/ui/src/fonts/`에서 `@font-face`로 불러온다.
