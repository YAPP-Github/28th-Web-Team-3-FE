# 프로젝트 AI 하네스

이 저장소의 기본 모델은 Codex **Astra 6**와 Claude **Opus 5**다.

| 실행 경로 | 모델 ID | 설정 원본 |
| --- | --- | --- |
| Codex CLI | `gpt-6-astra` | `.codex/config.toml` |
| Claude Code | `claude-opus-5` | `.claude/settings.json` |
| Claude PR 리뷰어 | `claude-opus-5` | `.agents/agents/next16-rn-reviewer.md` |

프로젝트에서 reasoning effort를 지정하지 않는다. 사용자가 모델이나 effort를 명시하면 그 선택을
우선한다. 프로젝트 설정은 새 실행의 기본값이며 이미 진행 중인 앱 대화의 모델을 바꾸지 않는다.
Codex 프로젝트 설정은 신뢰한 프로젝트에서 적용된다. CLI 인자, 앱의 모델 선택, 로컬 설정 등
더 높은 우선순위의 설정이 있으면 실행 시 실제 모델을 확인한다.

## 구현과 리뷰

### CLI 호환성 확인

앱과 별도로 설치된 Codex CLI는 지원 모델이 다를 수 있다. `codex --version`과
`codex debug models`로 실행 환경을 확인한다. `--bundled`는 해당 바이너리에 포함된
목록만 보여 주므로, 목록에 없다는 이유만으로 모델 ID가 잘못됐다고 판단하지 않는다.

2026-09-08 로컬 CLI `0.142.5`의 Astra 6 호출은 서버에서
`The 'gpt-6-astra' model requires a newer version of Codex.` 오류로 거부됐다.
이 오류가 나면 CLI를 업데이트하고 호출 가능 여부를 다시 확인한 뒤 구현·리뷰를 진행한다.
업데이트하거나 호출을 확인할 수 없으면 중단하고 사용자에게 알린다. 다른 모델로 조용히
대체하지 않는다. 앱에서 Astra 6를 쓸 수 있어도 별도 CLI의 호환성을 보장하지는 않는다.

### 교차 리뷰

- Astra 6가 구현한 변경은 Opus 5의 `next16-rn-reviewer`가 리뷰한다.
- Opus 5가 구현한 변경은 기존 PR 흐름에 따라 Claude 리뷰와 Astra 6 교차 리뷰를 수행한다.
- 현재 Codex에서 직접 구현했다면 별도 Codex 구현 위임 없이 Claude 리뷰 단계로 진행한다.
- 리뷰 프롬프트에는 작업 경로, 베이스, diff 범위, 한국어 출력, 읽기 전용 조건을 전달한다.
- 호출 도구가 모델 선택을 지원하지 않거나 지정 모델을 사용할 수 없으면 그 제한을 알린다.
  다른 모델로 실행한 결과를 Astra 6 또는 Opus 5 리뷰라고 기록하지 않는다.

새 CLI 세션에서 모델을 명시하려면 저장소 루트에서 실행한다.

```bash
codex --model gpt-6-astra
claude --model claude-opus-5
```

PR 생성 절차는 `.agents/skills/pr-create/SKILL.md`를 따른다. Claude의
`.claude/agents/next16-rn-reviewer.md`와 `.claude/skills/*`는 `.agents`의 원본을 가리키는
심볼릭 링크다. 링크 대상만 수정한다.

`Harness/`는 별도 Git submodule이다. 이 저장소 CLI의 모델 설정을 대신하지 않는다.

모델 ID 참고: [Claude Opus 5 문서](https://platform.claude.com/docs/en/models/opus-5/whats-new-opus-5).
Astra 6의 ID와 지원 effort는 설치된 Codex의 모델 목록에서 확인한다.
