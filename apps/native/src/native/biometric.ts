import * as LocalAuthentication from "expo-local-authentication";

/** Biometric unlock (Face ID / fingerprint). Implemented. */
export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticate(reason = "잠금 해제"): Promise<boolean> {
  if (!(await isBiometricAvailable())) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: "취소",
    disableDeviceFallback: false,
  });
  return result.success;
}
