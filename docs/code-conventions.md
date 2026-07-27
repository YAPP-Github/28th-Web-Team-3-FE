# 코드 컨벤션

`AGENTS.md`의 작업 원칙을 이 저장소 코드에 적용한 규칙이다. 원칙이 "어떻게 일할지"라면 여기는 "무엇을 어디에 어떤 모양으로 쓸지"를 정한다.

각 항목은 실제로 겪은 문제에서 나왔다. 이유를 함께 적었으니, 상황이 달라 규칙이 안 맞으면 이유부터 확인하고 판단하라.

## API 레이어

### 파일 구조

기능 하나당 네 겹으로 나눈다. 겹을 건너뛰지 마라.

```
packages/schema/src/<도메인>.ts   요청·응답 계약(zod). 앱과 무관하게 백엔드 계약만 담는다
apps/web/.../<기능>/api.ts        HTTP 호출. 요청 검증 → 전송 → 응답 검증
apps/web/.../<기능>/queries.ts    react-query 훅. queryKey·무효화 정책
컴포넌트                          훅만 쓴다. fetch·스키마를 직접 만지지 않는다
```

`api.ts`는 순수 함수만 둔다. 훅·상태·컴포넌트를 import하지 않는다.

파일명은 항상 `api.ts` / `queries.ts`다 — `<기능>-api.ts`처럼 접두사를 붙이지 말고, 한 디렉터리에 API 표면이 둘 이상이면 디렉터리를 나눈다(라우트로 잡히지 않게 `_이름/`).

### 경로는 리소스명만

`NEXT_PUBLIC_API_URL`에 `/api`가 포함된다. 경로에 다시 붙이면 `/api/api/goal`이 된다.

```ts
api.get("goal");        // O
api.get("api/goal");    // X — baseUrl과 중복
```

MSW 목은 와일드카드(`*/api/goal`)로 잡으므로 이 실수를 가려준다. 목이 통과한다고 실서버가 통과하는 건 아니다.

### 응답은 `parseJson`, 요청 body는 보내기 전에 검증

```ts
import { parseJson } from "@repo/api/json";

/** GET /api/goal — 목표 현황 조회. */
export function fetchGoalStatus(): Promise<GoalStatus> {
  return parseJson(api.get("goal"), goalStatusSchema);
}

/** PUT /api/goal/savings — 전송 전 계약 검증. */
export async function updateSavings(body: SavingRequest): Promise<void> {
  await api.put("goal/savings", { json: savingRequestSchema.parse(body) });
}
```

`schema.parse(await api.get(...).json())`처럼 직접 쓰지 마라. 안에서 밖으로 읽히고 `await` 위치가 매번 달라진다.

요청 body를 보내기 전에 검증하면 서버 왕복 없이 계약 위반을 잡는다. 그러려면 스키마의 허용 범위를 **서버 검증값과 같게** 맞춰야 한다(아래 참고).

> 예외: 토큰을 발급받는 경로는 ky 클라이언트를 쓸 수 없다(인증 헤더를 붙이는 클라이언트가 인증을 호출하는 순환). 네이티브의 `src/auth/guest-auth.ts`가 raw `fetch` + `schema.parse`를 쓰는 이유다.

### 허용 범위는 서버 검증값을 그대로 옮긴다

입력 상·하한을 프론트에서 임의로 정하지 마라. 서버가 400으로 되돌리는 값이 곧 계약이다. 스키마에 상수로 두고 화면·검증이 같은 값을 쓴다.

```ts
// packages/schema/src/goal.ts — 백엔드 검증과 동일하게 맞춘다(초과하면 400)
export const MIN_GOAL_PERIOD_MONTHS = 3;
export const MAX_GOAL_PERIOD_MONTHS = 36;
```

상한은 입력 단계에서 자르고, 하한은 제출 시 검사한다. 타이핑 도중 하한을 강제하면 `12`를 치려고 `1`을 눌렀을 때 값이 튄다.

### 조회는 클라이언트에서 한다 (RSC 금지)

access token의 원본은 네이티브(RN) 메모리이고, 웹은 bridge로 당겨 온다. bridge는 WebView 안에서만 열리는 클라이언트 채널이라 **서버 컴포넌트는 토큰을 얻을 수 없다**. 렌더가 일어나는 Vercel은 그 채널 밖이다.

그래서 인증이 필요한 조회는 전부 `"use client"` + react-query다. `lib/api.ts`가 `import "client-only"`로 서버 번들 유입을 빌드 타임에 막는다.

인증이 필요 없는 정적 데이터(정책 목록 등)는 서버 컴포넌트로 둬도 된다.

같은 이유로 **네이티브 셸 밖(일반 브라우저)은 지원 대상이 아니다.** 기기 UUID와 refresh token이 네이티브 SecureStore에만 있어 토큰을 얻을 방법이 없다. 브라우저에서 열면 헤더 없이 요청이 나가고 서버가 401을 준다. 데모·QA 때문에 브라우저용 우회 인증을 다시 만들지 마라 — 자격증명이 브라우저 저장소로 내려오는 순간 이 구조의 전제가 깨진다. 화면 확인이 필요하면 MSW나 Playwright 목을 쓴다.

## 에러 처리

### mutation에는 `onError`를 반드시 붙인다

없으면 실패가 조용히 사라진다. 사용자는 버튼을 눌렀는데 아무 반응이 없는 화면을 본다.

```ts
mutate(body, {
  onError: () => setSubmitError("저장하지 못했어요. 잠시 후 다시 시도해주세요."),
  onSuccess: () => onOpenChange(false),
});
```

### 서버 에러 문구를 그대로 노출하지 않는다

백엔드는 `{ code, message, name, errors[] }` 형태로 실패를 알려주지만, `errors`는 `"birthDate: must be a past date"` 같은 개발자용 영문 메시지다. 사용자에게는 한국어 문구를 보여주고, 원문은 분기·로깅에만 쓴다.

특정 상황을 구분해야 하면 `name`으로 판별한다.

```ts
if (error instanceof HTTPError && error.response.status === 404) {
  if (error.data?.name === "ONBOARDING_PROFILE_NOT_FOUND") return EMPTY_ONBOARDING_PROFILE;
}
```

ky는 `HTTPError`를 만들 때 body를 미리 파싱해 `error.data`에 넣는다. 이때 response body는 이미 소비된 상태라 `response.clone().json()`을 부르면 `Body has already been consumed`로 터진다. `error.data`를 써라.

### "잠시 후 다시 시도"는 재시도로 풀리는 실패에만 쓴다

입력이 잘못돼서 나는 400에 이 문구를 띄우면, 사용자는 같은 값으로 영원히 재시도한다. 원인을 알려주거나 아예 보내기 전에 막아라.

## 외부 링크

WebView 안에서는 `target="_blank"`와 `window.open`이 통하지 않는다. 네이티브에 위임한다.

```tsx
function handleClick(event: MouseEvent<HTMLAnchorElement>) {
  if (!isNativeApp()) return;
  event.preventDefault();
  // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
  bridge.openExternal(url).catch(() => {});
}
```

`href`는 그대로 둔다. 일반 브라우저에서 동작해야 하고, 링크로 읽혀야 접근성·미리보기가 산다.

## 테스트

### 단위 테스트는 훅을 목으로 갈아끼운다

vitest(jsdom)는 `msw/node`의 fetch를 가로채지 못한다. API 연동 자체는 브라우저 MSW나 e2e로 확인하고, 단위 테스트는 데이터를 주입해 렌더·인터랙션만 본다.

```ts
vi.mock("../queries", () => ({
  useGoalStatus: () => ({ data: MOCK_GOAL, isPending: false, isError: false }),
}));
```

### e2e는 프로덕션 빌드로 돈다

`page.route`로 API를 목으로 세운다. 이때 경로는 baseUrl이 반영된 **절대 URL**과 맞아야 한다 — `NEXT_PUBLIC_API_URL`이 비면 요청이 `/onboarding/profile`로 나가 `**/api/onboarding/profile` 목과 어긋난다.

### 검증 없이 "고쳤다"고 하지 않는다

typecheck·테스트·빌드를 돌린 출력으로 확인한다. 화면 동작이 걸린 변경은 실제로 띄워서 본다.

## 문구

- 사용자에게 보이는 문구는 한국어. 코드 식별자·API 이름은 영어 그대로.
- 화면마다 같은 상황에는 같은 문구를 쓴다. 같은 실패에 서로 다른 안내가 뜨면 사용자는 다른 문제로 읽는다.
- 주석은 "무엇"이 아니라 "왜"를 적는다. 코드를 읽으면 아는 걸 반복하지 마라.
