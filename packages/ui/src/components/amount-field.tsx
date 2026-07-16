"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { cn } from "../lib/utils";

export interface AmountFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** 필드 라벨 (예: "월급"). */
  label: string;
  /** 값 뒤에 붙는 단위. */
  unit?: string;
}

/**
 * 금액 입력 필드 — 라벨 + 숫자 + 단위. 포커스되면 진한 보더.
 * 키패드는 OS 몫이라 inputMode="numeric"만 지정한다.
 * 제어(value)·비제어(defaultValue) 모두 지원 — 단위 색상은 값 유무를 따라간다.
 */
export function AmountField({
  label,
  unit = "만원",
  className,
  id,
  value,
  defaultValue,
  onChange,
  ...props
}: AmountFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    defaultValue !== undefined && defaultValue !== "",
  );
  const hasValue = value !== undefined ? value !== "" : uncontrolledHasValue;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex h-[74px] w-full flex-col justify-center gap-1 rounded-[12px] border-[1.5px] border-transparent bg-gray-50 px-3.5 py-3 transition-colors",
        "focus-within:border-gray-900",
        className,
      )}
    >
      <span className="text-caption-c1-500 text-gray-700">{label}</span>
      <span className="flex items-center justify-between gap-0.5">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            setUncontrolledHasValue(e.target.value !== "");
            onChange?.(e);
          }}
          className="w-full min-w-0 bg-transparent text-title-t1-700 text-gray-900 placeholder:text-gray-200 focus:outline-none"
          {...props}
        />
        <span
          className={cn("shrink-0 text-title-t1-700", hasValue ? "text-gray-500" : "text-gray-200")}
        >
          {unit}
        </span>
      </span>
    </label>
  );
}
