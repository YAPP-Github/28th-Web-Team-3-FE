---
name: pr-create
description: 코드 빌드·테스트 → AI 리뷰 → 푸시 → GitHub PR 생성까지 한번에 처리. "pr-create", "PR 만들어줘", "리뷰하고 PR", "배포 준비" 등의 요청에 사용. develop/main 브랜치로 머지하는 PR은 이 스킬로 생성할 것. "코덱스한테 구현시키고 PR", "codex dev" 등 구현 자체를 Codex에 맡기는 요청도 이 스킬(개발 위임 모드)로 처리한다.
argument-hint: [브랜치] [리뷰어] [--codex-dev "<작업 설명>"]
---

빌드·테스트(vitest → Playwright) → next16-rn AI 리뷰 → 푸시 → PR 생성을 한번에 처리한다.
`develop -> main` PR은 릴리즈 모드로 처리한다.
**셸 스크립트 없음** — 각 단계를 도구 호출로 실행한다.

## 인자

- `$0`: PR을 올릴 **브랜치**(head). 생략 시 현재 브랜치 사용.
- `$1`: **리뷰어** 이름/핸들 (한글·영문). 없으면 팀원 자동 지정 규칙(Step 7 참고) 적용, 그래도 못 정하면 사용자에게 물어볼 것.

## 릴리즈 모드 (`develop -> main`)

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

## 개발 위임 모드 (Codex 구현 → Claude 리뷰)

기본 흐름은 Claude가 이미 만든 diff를 게이트·리뷰(Claude + Codex 교차)·PR로 이어간다. 이 모드는 그
반대다 — **Codex가 구현하고, Claude가 독립적으로 리뷰한다.** 구현 자체를 Codex에 맡기고 싶을 때 쓴다
("코덱스한테 시켜", "코덱스로 구현해줘", "opus 말고 codex로", `--codex-dev` 인자 등).

- 이 모드는 Step 1과 Step 2 사이(Step 1.5)에서만 동작한다. 브랜치를 먼저 확정해야 Codex의 변경이
  올바른 브랜치에 쌓인다.
- Step 5의 Codex 교차 리뷰는 이 모드에서 **생략**한다. Codex가 쓴 코드를 Codex가 다시 보는 건 정보가
  없다 — 이 모드의 존재 이유 자체가 Claude의 독립된 눈이다. `next16-rn-reviewer`만 디스패치한다.
- PR 본문의 `## 🤖 AI 리뷰` 제목을 `### Claude 리뷰 (Codex 구현)`으로 바꿔 구현·리뷰 주체를 명시한다.
- 그 외 Step 2~8(더티 트리 게이트부터 PR 생성까지)은 기본 흐름과 동일하다 — Codex가 만든 diff도
  똑같이 빌드·테스트 게이트를 통과해야 하고, 🔴 리뷰면 똑같이 멈춘다.

### Step 1.5: Codex에 구현 위임 (이 모드일 때만)

1. 현재 실행 주체가 Codex면 현재 에이전트가 직접 구현한다. 다른 실행기에서 Codex 위임 도구를
   제공하면 사용자가 준 작업 설명을 그대로 **`codex:codex-rescue`**에 전달한다.
   위임 시 **foreground로 실행할 것** — 이후 게이트가 Codex의 diff를 필요로 하므로 완료를 기다려야 한다.
2. `--write`는 codex-rescue 기본값이라 따로 지정하지 않는다. `--effort`·`--model`은 사용자가
   명시하지 않는 한 비워 코덱스 기본값을 쓴다.
3. Codex 작업이 끝나면 워킹트리에 diff가 생긴다. 그대로 Step 2(더티 트리 게이트)로 진행 — 그
   diff가 곧 Step 2가 확인할 "커밋 안 된 변경"이다.
4. Codex가 아무 변경도 만들지 않았거나(이미 만족하는 상태 등) 실패를 보고하면 사용자에게 그대로
   알리고 중단한다 — 빈 diff로 게이트를 통과시키지 않는다.

## 강제 사용 규칙

- `develop` 또는 `main`으로 머지하는 PR은 이 스킬로 생성할 것.
- 사용자가 직접 `git push` + PR 수동 생성을 요청해도 이 스킬 사용을 권장할 것.
- **빌드·테스트 게이트가 빨간색이면 절대 PR을 생성/수정하지 않을 것.**
- **푸시·PR 생성 전 반드시 사용자 승인을 받을 것.**

## 실행 절차

### Step 0: GitHub CLI 확인 (필수)

1. `which gh`로 설치 여부 확인.
2. 미설치 시 **즉시 중단**하고 아래 안내 표시:

```
⚠️ GitHub CLI(gh)가 설치되어 있지 않습니다. 설치 후 다시 시도해주세요.

[Mac]    brew install gh
[Windows] winget install GitHub.cli  또는  scoop install gh

[설치 후 인증]
  gh auth login
```

3. `gh auth status`로 인증 상태 확인.
4. 미인증 시 `gh auth login` 안내 후 **즉시 중단**.
5. 설치·인증이 완료되지 않으면 이후 단계로 **절대 진행하지 않을 것**.
6. 컨텍스트 확보:
   - 레포 = `gh repo view --json nameWithOwner -q .nameWithOwner`
   - 현재 로그인 = `gh api user -q .login` → `ME`로 저장 (assignee 및 리뷰어 제외용)
   - 베이스 = 일반 PR은 `develop` (`.github/PULL_REQUEST_TEMPLATE.md` 기준), 릴리즈 모드는 `main`.
     원격에 없으면 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`로 폴백.

### Step 1: 브랜치 확정

1. `$0`이 주어졌으면 그대로, 없으면 현재 브랜치 사용.
2. `git fetch origin --prune`.
3. 대상 브랜치로 전환(`git switch <브랜치>`, 없으면 `git switch -c <브랜치>`).
4. 릴리즈 모드면 head가 `develop`, base가 `main`인지 확인한다. 다르면 사용자에게 알리고 중단한다.
5. 개발 위임 모드(사용자가 구현을 Codex에 맡기라고 요청, `--codex-dev` 인자 등)면 Step 1.5로 간다.
   아니면 바로 Step 2.

### Step 2: 변경사항 확인 (더티 트리 게이트)

1. `git status --short`로 커밋 안 된 변경 확인 — **있으면 사용자에게 알리고 중단**(먼저 커밋/스태시).
   릴리즈 모드는 특히 `develop` 워킹트리가 깨끗해야 한다.
2. 포함될 커밋 목록: `git log origin/<base>..HEAD --oneline`.
3. 변경 파일 표시 — **lockfile 제외**로 컨텍스트 경량 유지:

```bash
git diff --stat --merge-base origin/<base> HEAD -- ':!pnpm-lock.yaml' ':!package-lock.json' ':!yarn.lock'
```

4. 베이스보다 앞선 커밋이 없으면 중단 — PR할 게 없음.
5. 릴리즈 모드면 최신 tag와 버전 후보를 확인한다:

```bash
git tag --sort=-v:refname | head -20
git log origin/main..origin/develop --oneline
```

   후보 버전을 사용자에게 보여주고 승인받는다. 승인 전 PR 제목에 버전을 확정하지 않는다.

### Step 2.5: 대형 PR 분할 판단

릴리즈 모드(`develop -> main`)는 이 단계를 건너뛴다. 릴리즈 PR은 단일 `develop -> main` PR로만
진행하며, 분할 브랜치 생성이나 cherry-pick을 하지 않는다.

1. 분할 후보 조건(하나라도 해당하면 분할 검토):
   - Step 2에서 확인한 변경 파일(lockfile 제외) 수가 **20개 초과**
   - `git log origin/<base>..HEAD --oneline`의 커밋들이 서로 다른 conventional scope에 **3개 이상** 걸침 (예: `feat(mission)`, `fix(onboarding)`, `chore(ui)` 혼재)
2. 해당하면 커밋을 scope 기준으로 그룹핑한 분할안을 만들어 사용자에게 제시하고 승인 여부를 물을 것(**말없이 진행 금지**):
   ```
   변경 규모가 큽니다(파일 N개, 커밋 M개, scope K개). PR을 나눠서 올릴까요?

   1. <scope A> — <해당 커밋 목록>
   2. <scope B> — <해당 커밋 목록>
   ...

   [분할해서 진행] / [그대로 1개 PR로 진행]
   ```
3. 사용자가 **분할**을 선택하면:
   - 그룹마다 `<base>`에서 새 브랜치를 만들고(브랜치명은 lefthook 규칙 `type(scope)/내용` 준수) 해당 그룹 커밋만 `git cherry-pick`으로 옮긴다. 원본 브랜치는 그대로 보존.
   - 그룹별로 **Step 3부터 Step 8까지 그룹당 한 번씩 순서대로** 반복 실행한다 — 한 그룹의 PR이 만들어진 뒤 다음 그룹으로 진행.
   - 뒤 그룹이 앞 그룹 커밋에 의존하면 뒤 그룹 PR의 `--base`를 앞 그룹의 head 브랜치로 지정하고, PR 본문(기타 코멘트)에 의존 관계를 명시한다.
4. 사용자가 **그대로 진행**을 선택하면 분할 없이 Step 3으로 진행.
5. 사용자가 "분할 판단 생략" 등으로 명시적으로 건너뛰라고 하면 이 Step 전체를 생략한다.

### Step 3: 빌드 게이트

- `pnpm build` (turbo). 종료 코드 0 아니면 → **즉시 중단**, 실패한 turbo 태스크 출력 첨부.

### Step 4: 테스트 게이트

1. `pnpm --filter web test` (vitest run). 변경된 패키지가 있으면 `pnpm --filter @repo/api --filter @repo/schema test`도 실행.
   - 실패 → **즉시 중단**, 실패 테스트 첨부.
2. `pnpm --filter web test:e2e` (Playwright). 브라우저 없으면 먼저 `pnpm --filter web exec playwright install --with-deps`.
   - 실패 → **즉시 중단**, 실패 spec 첨부.
3. 둘 다 통과해야 다음 단계.

### Step 5: AI 리뷰 (3·4 모두 통과한 경우에만)

**개발 위임 모드(Step 1.5를 거쳤으면)에서는 Codex 교차 리뷰를 생략하고 `next16-rn-reviewer`만
디스패치한다** — Codex가 쓴 코드를 Codex가 다시 리뷰하는 건 정보가 없다. 아래는 기본 흐름 기준이다.

1. 리뷰 두 개를 **병렬로** 디스패치(개발 위임 모드면 `next16-rn-reviewer` 하나만). diff 범위
   (lockfile 제외)는 공통:
   `git diff --merge-base origin/<base> HEAD -- ':!pnpm-lock.yaml' ':!package-lock.json' ':!yarn.lock'`
   - 사용 가능한 에이전트 도구로 **`next16-rn-reviewer`**를 실행한다. 해당 에이전트가 없지만 Claude CLI가
     있으면 `claude -p`에 같은 리뷰 프롬프트와 diff 범위를 전달한다. 둘 다 없으면 독립 리뷰를
     수행할 수 없다고 알리고 중단한다. 프롬프트에 head 브랜치, 베이스, diff 범위 전달.
     프롬프트 끝에 **언어 규칙**을 명시한다: "리뷰는 한국어로 작성하되 코드 식별자·경로·API 이름은
     모두 백틱(``)으로 감쌀 것. 영어 개념을 축자 번역한 어색한 번역투 금지." (서브에이전트는 독립
     세션이라 이 규칙을 상속받지 못하므로 매번 프롬프트에 넣어야 한다.)
   - **Codex 교차 리뷰** (개발 위임 모드가 아닐 때만) — openai-codex 플러그인이 설치된 경우에만. `/codex:review`가 쓰는
     리뷰 전용 companion script를 실행한다(리뷰만 수행, 코드 수정 구조적으로 불가):
     `node ~/.claude/plugins/cache/openai-codex/codex/*/scripts/codex-companion.mjs review --wait --base origin/<base>`
     (버전 디렉터리는 glob으로 해석 — 여러 개면 최신 버전 사용. `--wait` 필수: 게이트라서 동기 완료 필요.)
     **`--base origin/<base>`(Step 0에서 정한 베이스, 보통 `origin/develop`)를 반드시 넘길 것.**
     생략하면 companion script의 `detectDefaultBranch()`가 `origin/HEAD`(= `main`)를 잡고,
     fallback 후보도 `main`·`master`·`trunk`뿐이라 `develop`은 절대 선택되지 않는다. 그 결과
     이미 `develop`에 머지된 코드까지 diff에 들어와 이 PR과 무관한 지적이 나온다.
     (`codex-rescue` 서브에이전트는 쓰지 않는다 — 그건 조사/수정 위임용, 리뷰 게이트용 아님.)
     플러그인이나 Codex CLI가 없으면 생략하고 "Codex 교차 리뷰 생략됨"만 알림 — 실패로 취급하지 않는다.
2. 리뷰 결과(판정 + 발견 사항) 모두 사용자에게 표시. 두 리뷰가 실행됐으면 최종 판정은 더 나쁜 쪽 채택
   (Codex 출력엔 판정 이모지가 없으므로 blocking·치명 이슈가 있으면 🔴로 취급).
   **언어 정규화**: Codex는 영어로 출력하므로, 사용자에게 보여주거나 PR 본문(Step 8)에 붙이기 전에
   한국어로 옮긴다 — 발견 사항의 의미·심각도·파일/라인은 보존하고, 코드 식별자는 백틱으로 감싼다.
   최종적으로 두 리뷰 블록의 언어(한국어)·식별자 표기(백틱)가 일관되게 한다.
3. 판정에 따라:
   - 🔴 **변경 요청** (둘 중 하나라도) → 사용자에게 경고. 멈추고 먼저 고칠지, draft로 진행할지 질문. **말없이 진행 금지.**
   - 🟡 이하 → 결과 보여주고 계속 진행 여부 확인.

### Step 6: 푸시 (승인 게이트)

1. **사용자에게 푸시 승인을 명시적으로 받을 것.** 승인 전 푸시 금지.
2. 승인 후 `git push -u origin <브랜치>`.
3. 실패 시 원인 분석 후 보고.

### Step 7: 리뷰어 검색 (assignee 자동, 본인 제외)

**팀 고정 리뷰어**: 이 프로젝트 개발자는 `pbk95120`, `jongse7` 단 둘뿐이다(고정, 변동 없음).
`$1`이 없으면 GitHub API 검색이나 사용자 확인 없이 `ME`(현재 로그인, Step 0)가 아닌 나머지
한 명을 바로 리뷰어로 지정한다.

0. `$1`이 **없는** 경우: `ME`가 `pbk95120`이면 리뷰어 = `jongse7`, `ME`가 `jongse7`이면
   리뷰어 = `pbk95120`. 바로 4번으로.
1. `$1`이 **있는** 경우, 실제 GitHub 로그인으로 매칭. 순서대로, 첫 매칭 채택:
   - **핸들 직접 확인**: `gh api users/$1 --jq '.login'` 성공하면 그대로 사용($1이 이미 GitHub username인 경우).
   - **협업자 login 매칭**: `gh api repos/<owner>/<repo>/collaborators --jq '.[].login' --paginate` → `$1`과 대소문자 무시 매칭.
   - **이름 전역 검색** — 한글 이름은 URL(`?q=`)에 넣지 말 것(인코딩 깨짐). **반드시 `-f`로 전달**:
     `gh api -X GET search/users -f q="$1 in:name" --jq '.items[].login'`
     (org 멤버가 팀 경유로 접근하면 `/collaborators`엔 안 떠도 이 검색에서 잡힘.)
   - 후보가 여럿이면 프로필로 확인: `gh api users/<login> --jq '.login+" | "+(.name//"")+" | "+(.company//"")'`.
2. 여러 명 매칭 → 프로필(name/company) 보여주고 사용자에게 선택하게 할 것.
3. 매칭 없음 → 사용자에게 정확한 GitHub username을 물을 것.
4. **assignee = `ME`(현재 로그인, Step 0).** 정해진 리뷰어가 `ME`와 같으면 → 경고하고 리뷰어에서 **제외**(본인에게 리뷰 요청 불가), 0번 자동 지정이었다면 이 상황은 발생하지 않음(항상 반대쪽이 나옴).
5. 리뷰어 없는 PR은 생성하지 않을 것 — 단, 사용자가 "리뷰어 없이 생성해줘"처럼 이 규칙을 **명시적으로** 오버라이드하면 따를 것(그 경우에도 먼저 스킬 규칙임을 한 번 알리고 확인받을 것).

### Step 8: PR 생성 (승인 게이트)

1. `.github/PULL_REQUEST_TEMPLATE.md`를 읽어 **그 섹션 구조 그대로** 플레이스홀더만 채운다.
   템플릿에 없는 섹션은 본문에 추가하지 말 것. (현재 템플릿 = 요약·체크리스트·AI 리뷰·기타 4섹션)
   릴리즈 모드의 release note와 release checklist는 템플릿의 `## 💬 기타 코멘트` 안에 넣는다.

```
## 📝 작업 내용 요약

<diff 요약 2–5 bullet(무엇이 왜 바뀌었는지), 한국어>
- resolved #<브랜치명/커밋에서 찾은 이슈 번호, 없으면 이 줄 삭제>

## ✅ 체크리스트

- [x] `develop` 브랜치의 최신 코드를 `pull` 받았나요?
- [x] 빌드가 통과했나요?
- [x] vitest 테스트가 통과했나요?
- [x] Playwright e2e가 통과했나요?

## 🤖 AI 리뷰

<개발 위임 모드면 제목을 "### Claude 리뷰 (Codex 구현)"로 쓰고 next16-rn-reviewer 결과만 붙인다.
기본 흐름이고 Codex 교차 리뷰가 실행됐으면 "### Claude (next16-rn-reviewer)" / "### Codex 교차 리뷰"
소제목으로 각각 구분. 모두 한국어로, 코드 식별자·파일 경로는 백틱으로 감싼다 — Codex 영어 출력은
Step 5의 언어 정규화를 거친 한국어 버전을 붙인다(영어 원문 그대로 붙이지 말 것).>

## 💬 기타 코멘트

<후속 작업·리뷰어에게 남길 메모, 없으면 비움. 릴리즈 모드면 Release Notes/Release Checklist 포함>
```

2. **PR 생성 전 사용자 승인을 받을 것.** 본문을 임시 파일에 쓰고 `--body-file`로 전달:

```bash
gh pr create \
  --base <base> \
  --head <브랜치> \
  --title "<요약에서 뽑은 간결한 제목. 릴리즈 모드면 release: vX.Y.Z>" \
  --assignee "@me" \
  --reviewer "<매칭된 리뷰어 login>" \
  --body-file <tmp> \
  [Step 5가 🔴이고 사용자가 draft 선택 시 --draft]
```

3. PR URL과 한 줄 요약 출력(빌드 ✅ / vitest ✅ / e2e ✅ / 판정 / assignee / 리뷰어).

## 주의사항

- gh 미설치/미인증 시 절대 진행하지 않고 안내 후 중단.
- 더티 트리(커밋 안 된 변경)면 중단.
- 변경 규모가 크면(Step 2.5 기준) 분할 여부를 먼저 물을 것 — 말없이 진행 금지.
- 빌드/테스트 게이트가 빨강이면 PR 생성 금지.
- **푸시·PR 생성 전 반드시 사용자 승인.**
- diff는 lockfile 제외(`:!pnpm-lock.yaml` `:!package-lock.json` `:!yarn.lock`).
- assignee는 본인(`@me`), 리뷰어 목록에서 본인 제외.
- pnpm 사용(npm/yarn 금지).
- PR 제목은 커밋 컨벤션 prefix(feat/fix/chore 등) 영어, subject는 한글/영문 모두 가능, 50자 이내.
  릴리즈 모드는 예외적으로 `release: vX.Y.Z` 형식을 사용한다.
- 리뷰어 없는 PR은 생성하지 않을 것(사용자의 명시적 오버라이드가 있으면 예외, Step 7.5 참고).
