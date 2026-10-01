---
name: local-build
description: >
  web-team-3-fe 모노레포의 로컬 빌드 문제 해결·환경 셋업 가이드.
  Metro·Next.js·Expo 빌드 에러, prebuild, 포트 충돌, 새 개발 환경 셋업, 로컬 빌드와 EAS 빌드 선택에 사용.
  단순히 앱을 띄우는 요청("실행해줘", "dev 서버")은 `run` 스킬을 쓴다.
license: MIT
metadata:
  author: 28th-web-team-3
  version: '1.0.0'
---

# 로컬 빌드 스킬

이 Turborepo 모노레포의 로컬 개발·빌드 워크플로에 대한 규칙과 가이드.
규칙 전문은 [AGENTS.md](./AGENTS.md)를 단일 소스로 한다.

## 적용 시점

다음 상황에서 이 가이드를 참고한다:

- 웹·네이티브 로컬 dev 서버 시작
- 시뮬레이터 / 에뮬레이터용 앱 빌드
- Metro·Next.js·Expo 빌드 에러 해결
- 새 개발 환경 셋업
- 로컬 빌드와 EAS 클라우드 빌드 중 선택

## 규칙 카테고리

규칙·예제·명령 전문은 [AGENTS.md](./AGENTS.md)의 해당 섹션에 있다.

| 우선순위 | 카테고리 | 영향도 |
|---|---|---|
| 1 | 스크립트 선택 | CRITICAL |
| 2 | Expo Prebuild | HIGH |
| 3 | 포트 관리 | HIGH |
| 4 | 에러 해결 | MEDIUM |
| 5 | 환경 | MEDIUM |
