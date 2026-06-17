import type { Preview } from "@storybook/react";
// Load the shared theme tokens so stories render with real design tokens.
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
