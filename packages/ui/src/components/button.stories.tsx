import type { Meta, StoryObj } from "@storybook/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "버튼" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DefaultDisabled: Story = { args: { disabled: true } };
/** 눌러서 시작한 작업을 기다리는 중 — 문구는 그대로 두고 눌린 크기만 유지한다. */
export const Pending: Story = { args: { pending: true, size: "cta", children: "다음" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };
/** 퍼널 하단 CTA — 풀너비 알약형 (앞으로가기 역할). */
export const FullCta: Story = {
  args: { size: "cta", children: "30초 성향 설문 시작" },
};

/** 온보딩 하단 이전 페이지 이동 — 플로팅 원형 버튼. */
export const OnboardingBack: Story = {
  args: {
    variant: "onboardingBack",
    size: "floating",
    children: <ChevronLeft className="size-6" />,
  },
};

/** 온보딩 하단 다음 페이지 이동 — 플로팅 원형 버튼. */
export const OnboardingNext: Story = {
  args: {
    variant: "onboardingNext",
    size: "floating",
    children: <ChevronRight className="size-6" />,
  },
};
