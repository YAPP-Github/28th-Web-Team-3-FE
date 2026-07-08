---
name: pr-comment-summary
description: GitHub PR의 리뷰 코멘트(인라인 코드 코멘트·리뷰 판정·PR 대화)를 모아 채팅에 요약. "PR 코멘트 요약해줘", "리뷰 코멘트 정리해줘", "코멘트 뭐라고 달렸어" 등의 요청에 사용.
argument-hint: [PR번호]
---

PR에 달린 리뷰 코멘트를 GraphQL로 한 번에 모아 채팅에 요약한다.
**셸 스크립트 없음** — 각 단계를 도구 호출로 실행한다.
**채팅 출력 전용** — 이 스킬은 PR에 아무것도 쓰지 않는다. 요약 결과를 PR 코멘트로도 남길지는 아직 결정하지 않은 사항 (하단 "향후 고려 사항" 참고).

## 인자

- `$0`: 대상 **PR 번호**. 생략 시 현재 브랜치에 연결된 PR을 자동 감지.

## 실행 절차

### Step 0: GitHub CLI 확인 (필수)

1. `which gh`로 설치 여부 확인.
2. 미설치 시 **즉시 중단**하고 안내:

```
⚠️ GitHub CLI(gh)가 설치되어 있지 않습니다. 설치 후 다시 시도해주세요.

[Mac]    brew install gh
[Windows] winget install GitHub.cli  또는  scoop install gh

[설치 후 인증]
  gh auth login
```

3. `gh auth status`로 인증 상태 확인. 미인증 시 `gh auth login` 안내 후 **즉시 중단**.

### Step 1: 대상 PR 결정

1. `$0`이 주어졌으면 그 번호 사용.
2. 없으면 현재 브랜치 기준으로 자동 감지: `gh pr view --json number -q .number`.
   - 실패(연결된 PR 없음) → 사용자에게 PR 번호를 물어볼 것. 추측하지 말 것.
3. 레포 컨텍스트 확보: `gh repo view --json owner,name -q '.owner.login + " " + .name'` → `OWNER`, `REPO`로 저장.

### Step 2: 코멘트 일괄 조회 (GraphQL 1회)

REST는 리뷰 스레드의 해결 여부(`isResolved`)를 제공하지 않으므로 GraphQL로 한 번에 조회한다:

```bash
gh api graphql -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      title
      url
      reviews(first: 50) {
        nodes { author { login } state body submittedAt }
      }
      reviewThreads(first: 100) {
        nodes {
          isResolved
          path
          line
          comments(first: 50) {
            nodes { author { login } body createdAt }
          }
        }
      }
      comments(first: 100) {
        nodes { author { login } body createdAt }
      }
    }
  }
}' -f owner="$OWNER" -f repo="$REPO" -F number="$PR_NUMBER"
```

- `reviews[].state`: `APPROVED` / `CHANGES_REQUESTED` / `COMMENTED` / `DISMISSED`.
- `reviewThreads[]`: 인라인 코드 코멘트 스레드. `isResolved`로 해결/미해결 구분, `path`/`line`으로 위치 표시.
- `comments[]`: 코드에 안 달린 PR 일반 대화 코멘트.
- 코멘트가 100개(스레드 100개·리뷰 50개)를 넘는 대형 PR이면 `pageInfo`/`after` 커서로 페이지네이션 — 실제로 잘려 보이면 그때 추가.

### Step 3: 요약 정리

수집한 JSON을 아래 구조로 정리해 사용자에게 보여준다. 원문 그대로 나열하지 말고, **저자별로 흩어진 지엽적 코멘트는 한두 문장으로 압축**하되 실행이 필요한 지적(버그·설계 이견)은 원문 뉘앙스를 살려 남길 것.

```
## PR #<번호> 코멘트 요약 — <제목>

### 리뷰 판정
- ✅ approve (@reviewer1)
- 🔴 request changes (@reviewer2): <body 핵심 한 줄>
- 💬 comment (@reviewer3)

### 미해결 인라인 코멘트 (N개)
**<path>**
- L<line> (@author): <요약>

(파일별로 그룹, 미해결 우선 표시)

### 해결된 인라인 코멘트 (N개)
<해결된 항목은 개수만 언급하고 목록은 생략. 사용자가 원하면 펼쳐서 보여줄 것>

### 일반 대화 코멘트
- @author: <요약>
```

- 리뷰 판정이 하나도 없으면 "### 리뷰 판정" 섹션 생략.
- 인라인/대화 코멘트가 없는 섹션도 생략.
- 코멘트가 전혀 없으면 "코멘트 없음"만 짧게 출력.

## 향후 고려 사항

- 요약을 채팅 출력에 그치지 않고 `gh pr comment`로 PR에도 남길지는 **아직 미결정**. 필요해지면 별도 논의 후 승인 게이트(`pr-create`의 Step 6/8과 동일한 패턴)를 추가할 것.

## 주의사항

- gh 미설치/미인증 시 절대 진행하지 않고 안내 후 중단.
- 브랜치에 연결된 PR을 찾지 못하면 번호를 추측하지 말고 사용자에게 물어볼 것.
- 이 스킬은 **읽기 전용** — PR에 코멘트를 달거나 리뷰 상태를 변경하지 않는다.
