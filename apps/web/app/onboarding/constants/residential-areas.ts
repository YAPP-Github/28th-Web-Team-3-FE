import type { ResidentialArea } from "@repo/schema/onboarding-api";

export const RESIDENTIAL_AREA_OPTIONS = [
  { value: "SEOUL", label: "서울" },
  { value: "GYEONGGI", label: "경기" },
  { value: "INCHEON", label: "인천" },
  { value: "BUSAN", label: "부산" },
  { value: "DAEGU", label: "대구" },
  { value: "DAEJEON", label: "대전" },
  { value: "SEJONG", label: "세종" },
  { value: "ULSAN", label: "울산" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "JEONNAM", label: "전남" },
  { value: "JEONBUK", label: "전북" },
  { value: "GANGWON", label: "강원" },
  { value: "JEJU", label: "제주" },
] as const satisfies ReadonlyArray<{ value: ResidentialArea; label: string }>;

export function getResidentialAreaLabel(address: ResidentialArea) {
  return RESIDENTIAL_AREA_OPTIONS.find((option) => option.value === address)?.label ?? address;
}
