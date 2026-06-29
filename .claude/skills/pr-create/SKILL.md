---
name: pr-create
description: 코드 빌드·테스트 → AI 리뷰 → 푸시 → GitHub PR 생성까지 한번에 처리. "pr-create", "PR 만들어줘", "리뷰하고 PR", "배포 준비" 등의 요청에 사용. develop/main 브랜치로 머지하는 PR은 이 스킬로 생성할 것.
argument-hint: [브랜치] [리뷰어]
---

빌드·테스트(vitest → Playwright) → next16-rn AI 리뷰 → 푸시 → PR 생성을 한번에 처리합니다.
**셸 스크립트 없음** — 각 단계를 도구 호출로 실행합니다.

## 인자

- `$0`: PR을 올릴 **브랜치**(head). 생략 시 현재 브랜치 사용.
- `$1`: **리뷰어** 이름/핸들 (한글·영문). 없으면 사용자에게 물어볼 것.

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
   - 베이스 = `develop` (`.github/PULL_REQUEST_TEMPLATE.md` 기준). 원격에 없으면 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`로 폴백.

### Step 1: 브랜치 확정

1. `$0`이 주어졌으면 그대로, 없으면 현재 브랜치 사용.
2. `git fetch origin --prune`.
3. 대상 브랜치로 전환(`git switch <브랜치>`, 없으면 `git switch -c <브랜치>`).

### Step 2: 변경사항 확인 (더티 트리 게이트)

1. `git status --short`로 커밋 안 된 변경 확인 — **있으면 사용자에게 알리고 중단**(먼저 커밋/스태시).
2. 포함될 커밋 목록: `git log origin/<base>..HEAD --oneline`.
3. 변경 파일 표시 — **lockfile 제외**로 컨텍스트 경량 유지:

```bash
git diff --stat --merge-base origin/<base> HEAD -- ':!pnpm-lock.yaml' ':!package-lock.json' ':!yarn.lock'
```

4. 베이스보다 앞선 커밋이 없으면 중단 — PR할 게 없음.

### Step 3: 빌드 게이트

- `pnpm build` (turbo). 종료 코드 0 아니면 → **즉시 중단**, 실패한 turbo 태스크 출력 첨부.

### Step 4: 테스트 게이트

1. `pnpm --filter web test` (vitest run). 변경된 패키지가 있으면 `pnpm --filter @repo/api --filter @repo/schema test`도 실행.
   - 실패 → **즉시 중단**, 실패 테스트 첨부.
2. `pnpm --filter web test:e2e` (Playwright). 브라우저 없으면 먼저 `pnpm --filter web exec playwright install --with-deps`.
   - 실패 → **즉시 중단**, 실패 spec 첨부.
3. 둘 다 통과해야 다음 단계.

### Step 5: AI 리뷰 (3·4 모두 통과한 경우에만)

1. Task 도구로 **`next16-rn-reviewer`** 서브에이전트 디스패치. 프롬프트에 head 브랜치, 베이스,
   diff 범위(lockfile 제외) 전달:
   `git diff --merge-base origin/<base> HEAD -- ':!pnpm-lock.yaml' ':!package-lock.json' ':!yarn.lock'`
2. 리뷰 결과(판정 + 발견 사항) 사용자에게 표시.
3. 판정에 따라:
   - 🔴 **변경 요청** → 사용자에게 경고. 멈추고 먼저 고칠지, draft로 진행할지 질문. **말없이 진행 금지.**
   - 🟡 이하 → 결과 보여주고 계속 진행 여부 확인.

### Step 6: 푸시 (승인 게이트)

1. **사용자에게 푸시 승인을 명시적으로 받을 것.** 승인 전 푸시 금지.
2. 승인 후 `git push -u origin <브랜치>`.
3. 실패 시 원인 분석 후 보고.

### Step 7: 리뷰어 검색 (assignee 자동, 본인 제외)

1. `$1`(리뷰어 이름/핸들)을 실제 GitHub 로그인으로 매칭. 순서대로, 첫 매칭 채택:
   - **핸들 직접 확인**: `gh api users/$1 --jq '.login'` 성공하면 그대로 사용($1이 이미 GitHub username인 경우).
   - **협업자 login 매칭**: `gh api repos/<owner>/<repo>/collaborators --jq '.[].login' --paginate` → `$1`과 대소문자 무시 매칭.
   - **이름 전역 검색** — 한글 이름은 URL(`?q=`)에 넣지 말 것(인코딩 깨짐). **반드시 `-f`로 전달**:
     `gh api -X GET search/users -f q="$1 in:name" --jq '.items[].login'`
     (org 멤버가 팀 경유로 접근하면 `/collaborators`엔 안 떠도 이 검색에서 잡힘.)
   - 후보가 여럿이면 프로필로 확인: `gh api users/<login> --jq '.login+" | "+(.name//"")+" | "+(.company//"")'`.
2. 여러 명 매칭 → 프로필(name/company) 보여주고 사용자에게 선택하게 할 것.
3. 매칭 없음 → 사용자에게 정확한 GitHub username을 물을 것.
4. **assignee = `ME`(현재 로그인, Step 0).** 매칭된 리뷰어가 `ME`와 같으면 → 경고하고 리뷰어에서 **제외**(본인에게 리뷰 요청 불가).
5. 리뷰어 없는 PR은 생성하지 않을 것.

### Step 8: PR 생성 (승인 게이트)

1. `.github/PULL_REQUEST_TEMPLATE.md`를 읽어 **그 섹션 구조 그대로** 플레이스홀더만 채운다.
   템플릿에 없는 섹션은 본문에 추가하지 말 것. (현재 템플릿 = 요약·체크리스트·AI 리뷰·기타 4섹션)

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

<Step 5 서브에이전트(next16-rn-reviewer)의 판정 + 발견 사항 전체 붙여넣기>

## 💬 기타 코멘트

<후속 작업·리뷰어에게 남길 메모, 없으면 비움>
```

2. **PR 생성 전 사용자 승인을 받을 것.** 본문을 임시 파일에 쓰고 `--body-file`로 전달:

```bash
gh pr create \
  --base <base> \
  --head <브랜치> \
  --title "<요약에서 뽑은 간결한 제목>" \
  --assignee "@me" \
  --reviewer "<매칭된 리뷰어 login>" \
  --body-file <tmp> \
  [Step 5가 🔴이고 사용자가 draft 선택 시 --draft]
```

3. PR URL과 한 줄 요약 출력(빌드 ✅ / vitest ✅ / e2e ✅ / 판정 / assignee / 리뷰어).

## 주의사항

- gh 미설치/미인증 시 절대 진행하지 않고 안내 후 중단.
- 더티 트리(커밋 안 된 변경)면 중단.
- 빌드/테스트 게이트가 빨강이면 PR 생성 금지.
- **푸시·PR 생성 전 반드시 사용자 승인.**
- diff는 lockfile 제외(`:!pnpm-lock.yaml` `:!package-lock.json` `:!yarn.lock`).
- assignee는 본인(`@me`), 리뷰어 목록에서 본인 제외.
- pnpm 사용(npm/yarn 금지).
- PR 제목은 커밋 컨벤션 prefix(feat/fix/chore 등) 영어, subject는 한글/영문 모두 가능, 50자 이내.
- 리뷰어 없는 PR은 생성하지 않을 것.
