# Build Instructions

## Requirements

- **OS**: macOS, Linux, or Windows
- **Node.js**: v22 or later
- **npm**: v10 or later

## Build Steps

1. Install dependencies:

```bash
npm install
```

2. Build the Firefox extension:

```bash
npm run build:firefox
```

3. Package the Firefox extension:

```bash
npm run package:firefox
```

The packaged extension will be output to `build/firefox-mv3-prod/`.
