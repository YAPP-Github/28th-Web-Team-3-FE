# 릴리즈 모드 (`develop -> main`)

[SKILL.md](../SKILL.md)에서 릴리즈 모드로 판정됐을 때 읽는다. 일반 흐름의 Step 0~8은 그대로 따르고, 아래는 릴리즈 모드에서만 달라지는 점이다.

`head=develop`, `base=main`인 PR은 릴리즈 모드다. 사용자가 "dev -> main", "develop -> main",
"main 배포 PR", "릴리즈 PR"처럼 요청하면 이 모드로 진행한다.

- 베이스는 `main`, 헤드는 `develop`으로 고정한다. 임의 릴리즈 브랜치를 만들지 않는다.
- PR 제목은 `release: vX.Y.Z` 형식으로 한다.
- `vX.Y.Z`는 현재 최신 tag를 확인한 뒤 사용자에게 제안한다. 자동 결정 기준은 다음 순서다:
  1. breaking change 또는 마이그레이션이 있으면 major
  2. `feat` 커밋이 있으면 minor
  3. 그 외 `fix`/`perf`/`chore`/`docs`/`ci` 등은 patch
- 최신 tag가 없으면 `v0.1.0`을 제안한다. 이미 `apps/native/app.config.ts`의 `version`처럼 앱 버전이
  더 크면 그 버전을 우선 제안한다.
- release note는 `git log origin/main..origin/develop --oneline`과 diff를 기준으로 한국어 bullet로
  작성하고, PR 본문 `## 💬 기타 코멘트`에 아래 형식으로 넣는다.
- merge 후 tag는 PR merge commit 또는 main의 merge 결과 커밋에 `vX.Y.Z`로 생성한다. PR 생성 단계에서는
  tag를 만들지 않고, PR 본문에 `Merge 후 tag: vX.Y.Z`를 명시한다.
- Expo/WebView 확인을 release note에 포함한다:
  - `apps/native/.env.production`에 `EXPO_PUBLIC_WEB_URL`이 Vercel production URL인지 확인
  - `apps/native/.env.production`에 `EXPO_PUBLIC_API_URL`이 `/api/`까지 포함하는지 확인
  - EAS production 환경에 반영할 명령: `cd apps/native && eas env:push production --path .env.production`

릴리즈 PR의 `## 💬 기타 코멘트` 형식:

```md
### Release Notes

- <사용자 영향이 있는 변경>
- <버그 수정 또는 내부 개선>

### Release Checklist

- [ ] Vercel production 배포 URL 확인: `<EXPO_PUBLIC_WEB_URL>`
- [ ] EAS production env 반영: `cd apps/native && eas env:push production --path .env.production`
- [ ] WebView production URL smoke test
- [ ] Merge 후 tag 생성: `vX.Y.Z`
```
