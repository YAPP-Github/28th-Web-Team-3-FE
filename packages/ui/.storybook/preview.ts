import type { Preview } from "@storybook/react";
// 스토리가 실제 디자인 토큰으로 렌더링되도록 공유 테마 토큰을 불러온다.
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
