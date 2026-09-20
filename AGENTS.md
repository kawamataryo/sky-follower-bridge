# Agent guide

For browser-extension changes, read [Computer Use QA](docs/agents/computer-use-qa.md)
before live verification. It describes how to verify the build actually loaded
in Chrome, inspect Instagram scanning, and report evidence and limitations.

Run `npm test -- --run`, `npm run check:ci`, and `npm run build` for extension
changes. Preserve unrelated work in a shared checkout and stage only task files.
