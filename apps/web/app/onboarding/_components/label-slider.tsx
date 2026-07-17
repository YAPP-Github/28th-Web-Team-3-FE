"use client";

import { Slider } from "@repo/ui";

interface LabelSliderProps {
  helperText: string;
  label: string;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
}

export function LabelSlider({ helperText, label, max, value, onValueChange }: LabelSliderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-title-t1-700 text-gray-900">
          {label} {value}만원
        </p>
        <p className="text-caption-c1-500 text-gray-500">{helperText}</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between text-body-b2-500 text-gray-400">
          <span>0</span>
          <span>{max}만원</span>
        </div>
        <Slider
          max={max}
          min={0}
          step={10}
          thumbLabels={[label]}
          value={[value]}
          onValueChange={([nextValue]) => {
            if (nextValue !== undefined) {
              onValueChange(nextValue);
            }
          }}
        />
      </div>
    </div>
  );
}
