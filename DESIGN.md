# DESIGN.md

디자인 시스템 참조 문서. 값의 원본은 Figma이고, 런타임 기준은 `packages/ui/src/styles/globals.css`다.
이 문서는 두 곳이 어긋나지 않는지 확인하는 대조표 역할을 한다.

- Figma: [Design System (Guide-Text / Guide-Color)](https://www.figma.com/design/WNPFcxA9sEnAMrTVMRVfjm/YAPP-28%EA%B8%B0-WEB-3%ED%8C%80?node-id=433-336&m=dev)
- 최종 대조: 2026-07-23
- 토큰 운영 방식과 사용 규칙은 [`packages/ui/DESIGN.md`](packages/ui/DESIGN.md)를 따른다.

---

## 타이포그래피

본문 폰트는 Pretendard 하나만 쓴다. `packages/ui/src/fonts/`에서 `@font-face`로 불러오고,
`--font-sans: "Pretendard", sans-serif`로 노출한다.

모든 스타일의 자간은 `-0.2px`다.

| 스타일 | 클래스 | 크기 | 행간 | 제공 weight |
| --- | --- | --- | --- | --- |
| Headline H1 | `text-headline-h1-{700,500}` | 28px | 38px | 700, 500 |
| Headline H2 | `text-headline-h2-{700,500,400}` | 24px | 34px | 700, 500, 400 |
| Title T1 | `text-title-t1-{700,500,400}` | 20px | 28px | 700, 500, 400 |
| Title T2 | `text-title-t2-{700,500,400}` | 18px | 26px | 700, 500, 400 |
| Body B1 | `text-body-b1-{700,500,400}` | 16px | 24px | 700, 500, 400 |
| Body B2 | `text-body-b2-{700,500,400}` | 14px | 21px | 700, 500, 400 |
| Caption C1 | `text-caption-c1-{700,500,400}` | 12px | 18px | 700, 500, 400 |

weight는 700(Bold) · 500(Medium) · 400(Regular)이다. H1에는 400이 없다.

---

## 색상

### Blue (Primary)

| 토큰 | 값 |
| --- | --- |
| `blue-50` | `#E5F6FE` |
| `blue-100` | `#C4ECFE` |
| `blue-200` | `#A1E1FF` |
| `blue-300` | `#70D2FF` |
| `blue-400` | `#3DC2FF` |
| `blue-500` | `#00AEFF` (Primary) |
| `blue-600` | `#008DCF` |
| `blue-700` | `#006796` |
| `blue-800` | `#004261` |
| `blue-900` | `#002130` |

### Grayscale

| 토큰 | 값 |
| --- | --- |
| `gray-0` | `#FFFFFF` |
| `gray-10` | `#F9FAFB` |
| `gray-50` | `#F0F3F8` |
| `gray-100` | `#DFE4EC` (아래 "알려진 불일치" 참고) |
| `gray-200` | `#C9CED4` |
| `gray-300` | `#B5B9C0` |
| `gray-400` | `#8F949C` |
| `gray-500` | `#747A83` |
| `gray-600` | `#585D64` |
| `gray-700` | `#494D54` |
| `gray-800` | `#3B3E43` |
| `gray-900` | `#232529` |

### Semantic / Dim

| 용도 | 토큰 | 값 |
| --- | --- | --- |
| 오류 | `error` | `#FF443B` |
| 오류 배경 | `error-light` | `#FFE5E4` |
| 경고 | `warning` | `#FFE14D` |
| 성공 | `success` | `#2DDD93` |
| 딤(밝음) | `dim-light` | `rgb(0 0 0 / 40%)` |
| 딤(어두움) | `dim-dark` | `rgb(0 0 0 / 60%)` |

---

## 시맨틱 토큰

컴포넌트는 원시 팔레트 대신 아래 시맨틱 토큰을 먼저 쓴다. 다른 색을 참조하는 토큰은
`@theme inline`에 정의해야 `bg-primary/90` 같은 투명도 조합이 올바로 동작한다.

| 토큰 | 참조 | 용도 |
| --- | --- | --- |
| `background` | `gray-0` | 기본 배경 |
| `foreground` | `gray-900` | 기본 텍스트 |
| `primary` | `blue-500` | 주 액션 |
| `primary-foreground` | `gray-0` | 주 액션 위 텍스트 |
| `secondary` | `gray-50` | 보조 표면 |
| `secondary-foreground` | `gray-900` | 보조 표면 위 텍스트 |
| `muted` | `gray-10` | 약한 표면 |
| `muted-foreground` | `gray-500` | 약한 텍스트 |
| `destructive` | `error` | 파괴적 액션 |
| `border` | `gray-100` | 경계선 |
| `input` | `gray-200` | 입력 경계선 |
| `ring` | `blue-500` | 포커스 링 |

---

## 알려진 불일치

Figma 가이드와 런타임 코드가 어긋난 항목이다. `gray-100`은 Figma 변수·스와치 값을 따르고,
Secondary는 용도와 이름이 확정될 때까지 코드에 반영하지 않는다.

| 항목 | Figma 가이드 | 런타임 코드 | 처리 |
| --- | --- | --- | --- |
| `gray-100` | `#D7DBE3` | `#DFE4EC` | Figma 변수·스와치를 따름. 디자이너 확인 필요 |
| Secondary | `Lime-600 #D2FF3E` | `lime` 팔레트 없음, `secondary`는 `gray-50` 참조 | 미반영. 아래 참고 |

**Secondary(Lime-600)**: Figma 가이드는 브랜드 보조색으로 `Lime-600 #D2FF3E`를 정의하지만,
코드에는 `lime` 팔레트가 없고 `--color-secondary`가 중립 회색(`gray-50`)을 가리킨다.
즉 "브랜드 보조색"과 "보조 표면"이 같은 이름을 쓰고 있어 의미가 겹친다.
브랜드 보조색을 실제로 쓰기로 하면 `lime-600` 원시 토큰을 추가하고,
표면용 시맨틱 이름(`surface` 등)과 분리할지 함께 정해야 한다. 확정 전까지 사용하지 않는다.
