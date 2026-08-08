import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readSavedBenefits,
  toggleSavedBenefit,
  writeSavedBenefits,
} from "@/app/(tabs)/benefits/lib/saved-benefits";

describe("saved-benefits", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("저장한 뒤 다시 읽으면 같은 id가 나온다", () => {
    writeSavedBenefits(new Set(["k-pass", "isa"]));

    expect([...readSavedBenefits()].toSorted()).toEqual(["isa", "k-pass"]);
  });

  it("저장한 적이 없으면 빈 집합이다", () => {
    expect(readSavedBenefits().size).toBe(0);
  });

  // 저장 형식이 바뀌거나 다른 코드가 같은 키를 덮어써도 화면이 죽으면 안 된다.
  it("값이 손상됐으면 빈 집합으로 본다", () => {
    window.localStorage.setItem("akkimo.saved-benefits.v1", "{not json");

    expect(readSavedBenefits().size).toBe(0);
  });

  it("배열이 아닌 값도 빈 집합으로 본다", () => {
    window.localStorage.setItem("akkimo.saved-benefits.v1", '{"k-pass":true}');

    expect(readSavedBenefits().size).toBe(0);
  });

  it("문자열이 아닌 항목은 걸러낸다", () => {
    window.localStorage.setItem("akkimo.saved-benefits.v1", '["k-pass",42,null]');

    expect([...readSavedBenefits()]).toEqual(["k-pass"]);
  });

  // 프라이빗 모드나 용량 초과에서 던진다. 저장 실패로 화면이 멈추면 안 된다.
  it("저장소가 던져도 예외를 밖으로 내보내지 않는다", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeSavedBenefits(new Set(["k-pass"]))).not.toThrow();
  });

  it("토글은 원본을 건드리지 않고 넣고 뺀다", () => {
    const empty: ReadonlySet<string> = new Set();

    const added = toggleSavedBenefit(empty, "k-pass");
    const removed = toggleSavedBenefit(added, "k-pass");

    expect(empty.size).toBe(0);
    expect([...added]).toEqual(["k-pass"]);
    expect(removed.size).toBe(0);
  });
});
