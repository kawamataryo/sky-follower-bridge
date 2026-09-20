# Build Instructions

## Requirements

- **OS**: macOS, Linux, or Windows
- **Node.js**: v22 or later
- **npm**: v10 or later

## Build Steps

1. Install dependencies:

```bash
npm ci
```

2. Build the Firefox extension:

```bash
npm run build:firefox
```

3. Package the Firefox extension:

```bash
npm run package:firefox
```

The unpacked extension is in `build/firefox-mv3-prod/`.
`npm run package:firefox` creates `build/firefox-mv3-prod.zip`.

The source archive includes the lockfile and build configuration. No environment
variables, service credentials, or account login are needed to build. Use Node.js 22
and npm 10 to match CI. Dependency installation requires internet access.

CI also extracts this source archive into a clean directory and runs `npm ci` and
`npm run build:firefox` there to verify that reviewers can rebuild it.
