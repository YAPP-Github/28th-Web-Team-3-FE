# 로컬 빌드 스킬

**버전 1.0.0**
28th-Web-Team-3
2026년 6월

> 이 문서는 web-team-3-fe 모노레포에서 로컬 개발·빌드 작업을 돕는 AI 에이전트를
> 위한 가이드다. 온보딩·디버깅·자동화 워크플로 전반에서 일관성을 유지하도록
> 규칙을 정리했다.

---

## 개요

web-team-3-fe 모노레포(Next.js 16 + Expo 56)의 로컬 개발·빌드 워크플로 가이드.
pnpm 단축 스크립트, Expo dev-client 셋업, 포트 관리, prebuild 흐름, 자주 나오는
에러 해결을 다룬다.

---

## 목차

1. [스크립트 선택](#1-스크립트-선택) — **CRITICAL**
2. [Expo Prebuild](#2-expo-prebuild) — **HIGH**
3. [포트 관리](#3-포트-관리) — **HIGH**
4. [에러 해결](#4-에러-해결) — **MEDIUM**
5. [환경 요구사항](#5-환경-요구사항) — **MEDIUM**

---

## 1. 스크립트 선택 — CRITICAL

### 1.1 루트 단축 스크립트 사용

**규칙:** 단일 앱을 실행할 때는 `pnpm --filter <app> <script>` 대신
`pnpm web`, `pnpm native`, `pnpm ios`, `pnpm android`를 쓴다.

**이유:** 루트 단축 스크립트는 인지 부담을 줄이고 filter 이름 오타를 막는다.
이 레포의 표준 진입점이다.

| 단축 | 동등 명령 | 용도 |
|---|---|---|
| `pnpm web` | `pnpm --filter web dev` | Next.js dev 서버 |
| `pnpm native` | `pnpm --filter native start` | Expo dev-client |
| `pnpm ios` | `pnpm --filter native ios` | iOS 시뮬레이터 빌드 |
| `pnpm android` | `pnpm --filter native android` | Android 에뮬레이터 빌드 |

**잘못된 예:**
```bash
pnpm --filter native ios
```

**올바른 예:**
```bash
pnpm ios
```

---

### 1.2 멀티 앱 개발은 Turbo로

**규칙:** 웹과 네이티브를 동시에 실행할 때는 `pnpm dev`(turbo)를 쓴다.
단축 스크립트를 터미널 두 개로 따로 띄우지 않는다.

**이유:** Turbo는 의존성 순서를 맞춰 작업을 병렬화하고 캐시를 공유한다.
터미널을 따로 띄우면 공유 패키지 빌드에서 레이스가 날 수 있다.

---

## 2. Expo Prebuild — HIGH

### 2.1 첫 네이티브 빌드 전 prebuild

**규칙:** `apps/native/ios` 또는 `apps/native/android` 폴더가 없으면, 첫
`pnpm ios` / `pnpm android` 전에 `pnpm --filter native prebuild`를 실행한다.

**이유:** Expo managed 워크플로는 네이티브 폴더를 레포에 포함하지 않는다.
`expo run:ios`는 이 폴더가 있어야 동작한다.

**확인:**
```bash
ls apps/native/ios apps/native/android
```

---

### 2.2 네이티브 모듈 변경 후 prebuild 재실행

**규칙:** 네이티브 코드를 포함하는 패키지(예: `expo-*`, `react-native-*`)를
추가·제거한 뒤에는 `pnpm --filter native prebuild`를 다시 실행한다.

**이유:** `prebuild` 스크립트는 내부적으로 항상 `expo prebuild --clean`을
실행하므로, 그냥 재실행만 하면 오래된 네이티브 폴더가 깨끗하게 재생성된다.
오래된 폴더는 Metro나 Xcode 출력만 봐서는 알기 어려운 링커 에러를 일으킨다.

---

## 3. 포트 관리 — HIGH

### 3.1 재시도 전 포트 충돌 해소

**규칙:** 실패한 start 명령을 다시 돌리기 전에, 해당 포트를 점유한 프로세스를
확인하고 종료한다.

| 앱 | 포트 | 종료 명령 |
|---|---|---|
| Next.js | 3000 | `lsof -ti:3000 \| xargs kill` |
| Metro | 8081 | `lsof -ti:8081 \| xargs kill` |

**이유:** 남아있는 dev 서버 프로세스가 "address already in use" 에러의 가장
흔한 원인이다. 포트를 비우지 않고 재시도하면 같은 에러가 반복된다.

---

## 4. 에러 해결 — MEDIUM

### 4.1 Module Not Found

**증상:** `Cannot find module '@repo/...'` 또는 유사한 워크스페이스 패키지 에러.

**해결:**
```bash
pnpm install
```
그 뒤 원래 명령을 다시 실행한다. 에러가 계속되면 `pnpm-workspace.yaml`에서
해당 패키지가 등록돼 있는지 확인한다.

---

### 4.2 빌드를 막는 TypeScript 에러

**증상:** 터미널에서 타입 에러로 빌드 실패.

**해결:**
```bash
pnpm typecheck
```
고치기 전에 에러 전체 목록을 먼저 확인한다. `// @ts-ignore`로 에러를 덮지 말고,
근본 타입 불일치를 해결한다.

---

### 4.3 Metro 캐시 손상

**증상:** 소스 코드는 멀쩡한데 시뮬레이터에서 예상치 못한 JS 에러 발생,
Metro 출력에 캐시 관련 경고.

**해결:**
```bash
pnpm --filter native start --clear
```

---

## 5. 환경 요구사항 — MEDIUM

### 5.1 Node·pnpm 버전

**규칙:** 빌드 실패를 디버깅하기 전에 런타임이 레포 요구사항에 맞는지 확인한다.

```bash
node --version   # >= 20 이어야 함
pnpm --version   # 11.x 이어야 함
```

**이유:** Node 20 미만은 crypto·ESM 해석에서 미묘한 실패를 일으키고, 이게
패키지 내부의 엉뚱한 에러처럼 보인다.

---

### 5.2 iOS 빌드 요구사항

**규칙:** `pnpm ios` 실행 전에 Xcode 도구가 있는지 확인한다.

```bash
xcode-select -p          # 경로가 출력돼야 함
xcrun simctl list        # 사용 가능한 시뮬레이터 목록
```

---

### 5.3 Android 빌드 요구사항

**규칙:** `pnpm android` 전에 `ANDROID_HOME`이 설정돼 있고 에뮬레이터가
실행 중인지 확인한다.

```bash
echo $ANDROID_HOME       # 비어 있지 않아야 함
adb devices              # 최소 1개 기기/에뮬레이터가 보여야 함
```
