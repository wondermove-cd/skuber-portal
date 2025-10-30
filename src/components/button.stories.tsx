import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpIcon, ChevronRight } from "lucide-react";
import { IconGitBranch } from "@tabler/icons-react";
import { withRouter } from "storybook-addon-remix-react-router";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fn } from "storybook/test";

export function ButtonDemo() {
  return <Button>Button</Button>;
}

export function ButtonLoading() {
  return (
    <Button size="sm" variant="outline" disabled>
      <Spinner />
      Submit
    </Button>
  );
}

export function ButtonRounded() {
  return (
    <div className="flex flex-col gap-8">
      <Button variant="outline" size="icon" className="rounded-full">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

/**
 * Displays a button or a component that looks like a button.
 */
const meta = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [withRouter],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
    onClick: fn(),
  },
  excludeStories: /.*Demo$|.*Loading$|ButtonRounded$/,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 기본 버튼 스타일입니다. 주요 액션이나 제출 버튼으로 사용하며,
 * 가장 눈에 띄는 시각적 강조를 제공합니다.
 */
export const Default: Story = {};

/**
 * 보조 액션에 사용하는 secondary variant입니다.
 * 주요 버튼보다 덜 강조되며, 취소나 뒤로가기 같은 부차적인 액션에 적합합니다.
 */
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

/**
 * 삭제나 파괴적인 액션에 사용하는 destructive variant입니다.
 * 빨간색 계열로 표시되어 사용자에게 신중한 결정을 유도합니다.
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

/**
 * 테두리만 있는 outline variant입니다.
 * 배경이 투명하여 가벼운 느낌을 주며, 보조 액션이나 필터 버튼에 적합합니다.
 */
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

/**
 * 테두리와 배경이 없는 ghost variant입니다.
 * 호버 시에만 배경이 나타나며, 네비게이션이나 드롭다운 메뉴에 사용됩니다.
 */
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

/**
 * 링크처럼 보이는 link variant입니다.
 * 밑줄이 있는 텍스트 스타일로, 인라인 텍스트 내에서 버튼 기능이 필요할 때 사용합니다.
 */
export const LinkVariant: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

/**
 * 아이콘만 표시하는 버튼입니다. size="icon"을 사용하여 정사각형 모양으로 만들며,
 * 툴바나 액션 아이콘 버튼에 적합합니다. 접근성을 위해 aria-label 추가를 권장합니다.
 */
export const Icon: Story = {
  render: () => (
    <Button variant="outline" size="icon">
      <ChevronRight className="h-4 w-4" />
    </Button>
  ),
};

/**
 * 텍스트와 아이콘을 함께 표시하는 버튼입니다.
 * 공식 문서 예제: @tabler/icons-react의 IconGitBranch를 사용합니다.
 */
export const WithIcon: Story = {
  render: () => (
    <Button variant="outline" size="sm">
      <IconGitBranch /> New Branch
    </Button>
  ),
};

/**
 * 로딩 상태를 표시하는 버튼입니다. disabled 상태와 함께 Spinner 컴포넌트를 사용하여
 * 비동기 작업이 진행 중임을 사용자에게 알립니다.
 */
export const LoadingSpinner: Story = {
  render: () => <ButtonLoading />,
};

/**
 * 둥근 모양의 아이콘 버튼입니다. rounded-full 클래스를 사용하여
 * 완전히 원형 모양의 버튼을 만들 수 있습니다.
 */
export const Rounded: Story = {
  render: () => <ButtonRounded />,
};
