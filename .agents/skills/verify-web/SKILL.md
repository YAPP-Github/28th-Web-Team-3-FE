---
name: verify-web
description: apps/web 화면을 모바일 뷰포트(375×812)로 띄워 동작을 확인하고 스크린샷을 남긴다. UI·레이아웃·애니메이션·인터랙션을 고친 뒤 "화면 확인해줘", "검증해줘", "스크린샷 보여줘", "실제로 되는지 봐줘" 등의 요청이나 웹 UI 수정을 완료라고 말하기 직전에 사용. 단위 테스트만 돌리는 요청에는 쓰지 않는다.
argument-hint: '[화면 경로 예) /goal]'
---

웹 화면은 Playwright + `page.route` 목으로 확인한다. 일반 브라우저로 dev 서버를 열면 토큰을 줄
네이티브 셸이 없어 API가 전부 401이라, 데이터가 필요한 화면은 빈 껍데기만 보인다.

## 절차

1. **기존 spec을 찾는다.** `apps/web/e2e/`에 대상 화면을 다루는 spec이 있으면 거기에 검증을 더한다.
   없으면 같은 폴더에 `<화면>.spec.ts`를 만든다. `goal.spec.ts`가 기본 형태다:
   - `import { expect, test } from "./fixtures";`
   - `test.use({ viewport: { width: 375, height: 812 } });`
   - 화면이 부르는 API를 전부 `page.route("**/api/...", ...)`로 응답한다. 응답 모양은 `@repo/schema`를 따른다.
2. **고친 동작을 단언한다.** 눈으로만 보지 말고 바뀐 값을 assertion으로 남긴다(위치는 `boundingBox()`,
   스타일은 `toHaveCSS`, 문구는 `getByText`·`getByRole`).
3. **스크린샷을 찍는다.** `await page.screenshot({ path: "test-results/<이름>.png" })` — `apps/web`에서
   실행되므로 파일은 `apps/web/test-results/<이름>.png`에 생기고, gitignore 대상이다. 찍은 이미지를
   직접 열어 보고 사용자에게 보여준다. 확인용으로만 넣은 스크린샷 줄은 커밋 전에 지운다.
4. **그 spec만 돌린다.**

   ```bash
   pnpm --filter web exec playwright test e2e/<이름>.spec.ts
   ```

   새로 만든 spec은 커밋하면 `pr-create`의 e2e 게이트와 pre-push 타입 검사에 계속 포함된다.
   확인용으로만 만든 것이면 지우고, 남길 거면 시간·애니메이션 타이밍에 기대지 않게 만든다.

5. 결과를 보고할 때 통과한 단언, 스크린샷, **확인하지 못한 것**(아래 함정의 네이티브 전용 분기 등)을 같이 적는다.

## 함정

- **목을 빠뜨리면 테스트가 실패한다.** `e2e/fixtures.ts`가 목 처리되지 않은 `/api/**` 요청을 막고
  테스트 끝에 실패시킨다. 거의 모든 화면이 먼저 `**/api/auth/me`를 부른다.
- **웹 서버는 프로덕션 빌드다**(`pnpm build && pnpm start --port 3100`). 첫 실행은 빌드 때문에 몇 분 걸린다.
  로컬에서는 3100번에 떠 있는 서버를 재사용하므로, 코드를 고친 뒤에도 **이전 빌드가 응답할 수 있다.**
  고친 내용이 안 보이면 `lsof -ti:3100 | xargs kill` 후 다시 돌린다.
- **기본 뷰포트는 데스크톱이다**(`Desktop Chrome`). `test.use`로 375×812를 지정하지 않으면 모바일 레이아웃을 검증하지 못한다.
- **네이티브 브리지는 없다.** Playwright 안에서는 `isNativeApp()`이 false라 외부 링크 위임, 키보드
  높이 같은 네이티브 전용 분기는 타지 않는다. 그 부분은 검증하지 못했다고 보고한다.
- **애니메이션 도중에 찍힐 수 있다.** 끝 상태를 보려면 `await page.emulateMedia({ reducedMotion: "reduce" })`로
  `motion-reduce:` 경로를 타게 하거나, 애니메이션이 끝날 때까지 기다린 뒤 찍는다. 애니메이션 자체를
  확인할 때는 시작 시점과 끝 시점을 각각 찍는다.
