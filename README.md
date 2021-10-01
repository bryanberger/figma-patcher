# Figma Patcher (PoC)

[![Build](https://github.com/bryanberger/figma-patcher/actions/workflows/build.yml/badge.svg)](https://github.com/bryanberger/figma-patcher/actions/workflows/build.yml)
## Disclaimer

This is an educational proof-of-concept patcher for Figma. This example allows one to expand the width of the Figma properties panel sidebar (in this case to 350px).
This application does not modify any Figma files, it uses the `Electron / Chromium` debugger to inject some javascript and styling into each Figma file/page.

## How to run

Ensure you run Figma.app in remote debug mode like so:

- Close Figma
- Open your Terminal
- Type in `open /Applications/Figma.app --args --remote-debugging-port=9222` assuming that is the location of your Figma.app

Figma will now open in `remote debugging mode`.

You can now run this application binary, which will open in a terminal prompt, keep the window open and minimize it, you should be good to go now.

## Development

Install dependencies and start.

You can add additional payloads by creating a new payload javascript file in `payloads/` it will get auto-loaded and included once per file/page. Make sure these are properly formatted JS files terminated with a semicolon. There is room to improve here with a proper plugin architecture, but this is a proof-of-concept, and good enough for now.

```
npm install
npm start
```

## Build

```
npm install
npm run build
```

This should create 2 binaries, one for macOS and one for Windows 10.
