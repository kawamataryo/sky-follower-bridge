import type { Preview } from "@storybook/react";
import "../src/style.content.css";
import messages from "../locales/en/messages.json";

const getMessage = (key: string, placeholders: string[]) => {
  return messages[key].message
};

window.chrome = {
  i18n: {
    getMessage: getMessage,
  } as typeof chrome.i18n,
} as typeof chrome;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  tags: ["autodocs"],
};

export default preview;
