# 디자인 시스템 규칙

토큰 값의 원본은 Figma
([Design System 페이지](https://www.figma.com/design/WNPFcxA9sEnAMrTVMRVfjm/?node-id=433-336))이고,
런타임 기준은 `src/styles/globals.css`다. 값·매핑·불일치 현황은
루트 [`DESIGN.md`](../../DESIGN.md)에서 확인한다. 이 문서는 토큰 운영 방식과 사용 규칙만 다룬다.

> **잠정 연동 해제**: 아래 Tokens Studio 파이프라인은 당분간 build/storybook에서
> 자동 실행하지 않는다. 대신 Figma MCP로 `src/styles/globals.css`에 토큰을 직접
> 채워 넣는 방식으로 운영. `tokens.json`·`scripts/build-tokens.mjs`는 나중에 다시
> 쓸 수 있도록 남겨뒀고, `pnpm --filter @repo/ui tokens:build`로 수동 실행 가능.

## 파이프라인 (재연결 시)

```
Figma (Tokens Studio) → tokens.json → scripts/build-tokens.mjs → src/styles/tokens.generated.css
```

- `tokens.generated.css`는 빌드 산출물 — 커밋하지 않는다 (gitignore).
- 원시 팔레트(`--color-gray-*`, `--color-blue-*`)와 타이포 유틸(`text-*`)은 재연결 전까지
  `src/styles/globals.css`에서 수동 관리.
- 시맨틱 토큰(`--color-primary` 등)도 `src/styles/globals.css`에서 수동 관리하며 원시 팔레트를 참조.

## 규칙

1. **raw 값 금지** — 컴포넌트·스토리에 hex, px 폰트값을 직접 쓰지 않는다. 토큰 클래스만 사용.
2. **시맨틱 우선** — `bg-primary`, `border-border`처럼 시맨틱 토큰을 먼저 쓰고,
   해당 용도의 시맨틱이 없을 때만 원시 팔레트(`bg-gray-50`)를 쓴다.
3. **타이포는 `text-*` 유틸만** — `text-body-b1-400` 식 생성 유틸 사용.
   `text-[15px]`, `leading-*` 임의 조합 금지.
4. **tokens.json은 디자이너 소유** — 값 수정은 Figma에서 한다. Tokens Studio 재연결 전까지
   Figma MCP로 확인한 값만 globals.css에 임시 반영한다.
5. **새 토큰이 필요하면** 디자이너에게 요청한다. 코드에 임시 하드코딩하지 않는다.
   (예외: Figma 변수엔 있지만 아직 push 안 된 토큰은 globals.css에 이전 예정 주석과 함께 임시 정의.)
6. **토큰 변경 PR은 Chromatic으로 검수** — Foundations 스토리와 컴포넌트 스냅샷 diff를
   디자이너가 확인하고 승인한다.

## 미확정 (건드리지 말 것)

- Secondary 팔레트 — Figma 가이드는 `Lime-600 #D2FF3E`로 정리됐지만 코드에는 `lime` 팔레트가 없다.
  현재 `secondary`는 보조 표면용 `gray-50`을 참조하므로, 브랜드 보조색과 표면 토큰의 이름·용도를 확정할 때까지 미반영.
- 다크모드 — 디자인 없음. `.dark` 테마 정의하지 않는다.
