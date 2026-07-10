# 디자인 시스템 규칙

토큰 값은 여기에 적지 않는다. 값의 단일 소스는 Figma
([Design System 페이지](https://www.figma.com/design/WNPFcxA9sEnAMrTVMRVfjm/?node-id=433-336))이고,
코드에는 파이프라인을 통해서만 들어온다.

> **잠정 연동 해제**: 아래 Tokens Studio 파이프라인은 당분간 build/storybook에서
> 자동 실행하지 않는다. 대신 Figma MCP로 `src/styles/globals.css`에 토큰을 직접
> 채워 넣는 방식으로 운영. `tokens.json`·`scripts/build-tokens.mjs`는 나중에 다시
> 쓸 수 있도록 남겨뒀고, `pnpm --filter @repo/ui tokens:build`로 수동 실행 가능.

## 파이프라인 (재연결 시)

```
Figma (Tokens Studio) → tokens.json → scripts/build-tokens.mjs → src/styles/tokens.generated.css
```

- `tokens.generated.css`는 빌드 산출물 — 커밋하지 않는다 (gitignore).
- 원시 팔레트(`--color-gray-*`, `--color-blue-*`)와 타이포 유틸(`text-*`)은 생성 파일이 제공.
- 시맨틱 토큰(`--color-primary` 등)은 `src/styles/globals.css`에서 수동 관리하며 원시 팔레트를 참조.

## 규칙

1. **raw 값 금지** — 컴포넌트·스토리에 hex, px 폰트값을 직접 쓰지 않는다. 토큰 클래스만 사용.
2. **시맨틱 우선** — `bg-primary`, `border-border`처럼 시맨틱 토큰을 먼저 쓰고,
   해당 용도의 시맨틱이 없을 때만 원시 팔레트(`bg-gray-50`)를 쓴다.
3. **타이포는 `text-*` 유틸만** — `text-body-b1-400` 식 생성 유틸 사용.
   `text-[15px]`, `leading-*` 임의 조합 금지.
4. **tokens.json은 디자이너 소유** — 값 수정은 Figma에서 하고 Tokens Studio로 push한다.
   코드에서 직접 고치지 않는다. 시맨틱 매핑 변경만 globals.css에서 한다.
5. **새 토큰이 필요하면** 디자이너에게 요청한다. 코드에 임시 하드코딩하지 않는다.
   (예외: Figma 변수엔 있지만 아직 push 안 된 토큰은 globals.css에 이전 예정 주석과 함께 임시 정의.)
6. **토큰 변경 PR은 Chromatic으로 검수** — Foundations 스토리와 컴포넌트 스냅샷 diff를
   디자이너가 확인하고 승인한다.

## 미확정 (건드리지 말 것)

- Secondary 팔레트 — Figma 가이드 라벨(Lime)과 스와치(주황) 불일치, 확정 대기.
- 다크모드 — 디자인 없음. `.dark` 테마 정의하지 않는다.
