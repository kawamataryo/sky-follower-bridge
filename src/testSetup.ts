import { vi } from "vitest";

vi.stubGlobal("chrome", {
  i18n: {
    getMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
    },
  },
});
