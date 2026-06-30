# 섹션

모든 규칙 섹션의 순서, 영향도, 파일명 접두사를 정의한다.

---

## 1. 스크립트 선택 (scripts)

**영향도:** CRITICAL
**설명:** 각 상황에서 어떤 pnpm 명령을 쓸지. 단축 스크립트를 쓰면 --filter
오타를 피할 수 있고, 이 레포의 표준 진입점이다.

## 2. Expo Prebuild (prebuild)

**영향도:** HIGH
**설명:** 네이티브 빌드 전에 `expo prebuild`를 언제·어떻게 실행할지. 이 단계를
건너뛰는 것이 새 클론에서 네이티브 빌드가 실패하는 1순위 원인이다.

## 3. 포트 관리 (port)

**영향도:** HIGH
**설명:** dev 서버 명령을 재시도하기 전에 Next.js(:3000)와 Metro(:8081)의
포트 충돌을 감지·해소한다.

## 4. 에러 해결 (error)

**영향도:** MEDIUM
**설명:** 가장 흔한 로컬 빌드 실패의 분류 패턴: 모듈 누락, TypeScript 에러,
Metro 캐시 손상.

## 5. 환경 (env)

**영향도:** MEDIUM
**설명:** Node / pnpm 버전 확인과 플랫폼 도구 요구사항(iOS는 Xcode,
Android는 Android Studio).
