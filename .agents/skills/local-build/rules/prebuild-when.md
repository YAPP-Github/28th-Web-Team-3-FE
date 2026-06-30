# prebuild-when

**섹션:** Expo Prebuild
**영향도:** HIGH

## 규칙

`pnpm ios` 또는 `pnpm android` 실행 전에 `apps/native/ios`와
`apps/native/android` 폴더가 있는지 확인한다. 둘 중 하나라도 없으면 prebuild를
먼저 실행한다.

## 이유

네이티브 폴더는 gitignore 대상이다(Expo managed 워크플로). 새로 클론하면 이
폴더가 없다. 폴더가 없으면 `expo run:ios` / `expo run:android`가 즉시 실패한다.

## 확인

```bash
ls apps/native/ios apps/native/android
```

## 해결

```bash
pnpm --filter native prebuild
pnpm ios    # 또는 pnpm android
```

## 참고

네이티브 모듈을 추가한 뒤(예: `expo install expo-camera`)에는 prebuild만 다시
실행하면 된다. `prebuild` 스크립트가 이미 `expo prebuild --clean`이라, 그냥
재실행하면 네이티브 폴더가 깨끗하게 재생성된다.

```bash
pnpm --filter native prebuild
```
