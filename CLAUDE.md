# CLAUDE.md

LLM 코딩 실수를 줄이기 위한 행동 가이드라인. 프로젝트별 지침과 병합해서 사용.
**트레이드오프**: 속도보다 신중함에 무게를 둔다. 사소한 작업은 판단껏.

## 행동 가이드라인

### 1. 코딩 전에 생각하라

가정하지 말 것. 혼란을 숨기지 말 것. 트레이드오프를 드러낼 것. 구현 전에:

- 가정을 명시하라. 불확실하면 질문하라.
- 해석이 여러 개면 모두 제시하라 — 혼자 고르지 마라.
- 더 단순한 방법이 있으면 말하라. 필요할 때 반박하라.
- 불명확하면 멈춰라. 무엇이 혼란스러운지 짚고 물어라.

### 2. 단순함 우선

문제를 푸는 최소 코드만. 추측성 코드 금지.

- 요청 범위를 넘는 기능 금지.
- 일회용 코드에 추상화 금지.
- 요청하지 않은 "유연성"·"설정 가능성" 금지.
- 불가능한 시나리오에 대한 에러 처리 금지.
- 200줄 짠 게 50줄로 가능하면 다시 써라.

자문: "시니어 엔지니어가 과하다고 할까?" 그렇다면 단순화.

### 3. 수술적 변경

꼭 필요한 것만 건드려라. 네가 만든 잔여물만 치워라. 기존 코드 수정 시:

- 인접 코드·주석·포맷을 "개선"하지 마라.
- 고장 안 난 걸 리팩터링하지 마라.
- 다르게 하고 싶어도 기존 스타일에 맞춰라.
- 무관한 죽은 코드를 발견하면 — 언급만 하고 지우지 마라.

변경이 고아를 만들 때:

- 네 변경이 미사용으로 만든 import·변수·함수는 제거하라.
- 요청 없이 기존 죽은 코드는 제거하지 마라.

기준: 바뀐 모든 줄은 사용자 요청으로 직접 추적돼야 한다.

### 4. 목표 주도 실행

성공 기준을 정의하라. 검증될 때까지 반복하라. 작업을 검증 가능한 목표로:

- "검증 추가" → "잘못된 입력 테스트 작성 후 통과시키기"
- "버그 수정" → "재현 테스트 작성 후 통과시키기"
- "X 리팩터링" → "전후로 테스트 통과 보장"

다단계 작업은 짧은 계획을 명시:

```
1. [단계] → 검증: [확인]
2. [단계] → 검증: [확인]
3. [단계] → 검증: [확인]
```

강한 성공 기준은 독립적 반복을 가능케 한다. 약한 기준("되게 해줘")은 계속 되묻게 만든다.

이 가이드라인이 효과 있는 신호: diff 속 불필요한 변경 감소, 과설계로 인한 재작성 감소, 실수 후가 아니라 구현 전에 질문이 나온다.

---

## 프로젝트: web-team-3-fe

pnpm + Turborepo 모노레포. Next.js 웹 + Expo 네이티브, WebView 브릿지 공유.

### 구조

```
apps/web      Next.js 16 (App Router)
apps/native   Expo 56 / React Native 0.85
packages/*    @repo/{api,auth,bridge,schema,ui,config}
```

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

### 스택 / 버전 (catalog = `pnpm-workspace.yaml` 단일 소스)

| 영역 | 패키지 | 버전 |
|---|---|---|
| 런타임 | Node | >=24.18.0 (.nvmrc 핀) |
| 패키지매니저 | pnpm | 11.8.0 |
| 빌드 | Turbo | ^2.9.18 |
| 언어 | TypeScript | ^6.0.3 |
| 린트/포맷 | Biome | ^2.5.0 |
| Git 훅 | lefthook | ^2.1.9 |
| 웹 | Next.js | ^16.2.9 |
| React | react / react-dom | ^19.2.7 |
| 폼 | react-hook-form | ^7.80.0 |
| 스키마 | zod | ^4.4.3 (워크스페이스 1카피) |
| 데이터 | @tanstack/react-query | ^5.101.0 |
| HTTP | ky | ^2.0.2 |
| 인증 | 백엔드(Spring) 세션 — 클라 측 auth 라이브러리 없음 | — |
| 상태 | zustand | ^5.0.14 |
| 스타일 | Tailwind | ^4.3.1 |
| 브릿지 | @webview-bridge/* | ^1.7.9 |
| 테스트 | Vitest / Playwright | ^4.1.9 / ^1.61.0 |
| 네이티브 | Expo / React Native | ~56.0 / 0.85.3 |

### 규칙

- **버전은 catalog에서만**. 패키지엔 `catalog:`로 참조 — 개별 버전 박지 마라.
  - 예외: Expo SDK가 버전을 관리하는 패키지(`expo`·`expo-*`, `react-native`, `react-native-webview`)는 `apps/native`에 직접 핀. `expo install`/`expo-doctor`가 SDK 정합성을 검사하므로 catalog로 빼지 않는다.
- **린트/포맷은 Biome 단일**. ESLint·Prettier 도입 금지.
- 커밋 전 lefthook 훅 통과 필수 (`pnpm prepare`로 설치).
- 워크스페이스 내부 의존성은 `workspace:*`.
- Next 16 / React 19 / Tailwind v4 최신 API 기준 — 학습 데이터의 구버전 패턴 주의.
