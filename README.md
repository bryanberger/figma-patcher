# Figma Patcher (PoC)

[![Build](https://github.com/bryanberger/figma-patcher/actions/workflows/build.yml/badge.svg)](https://github.com/bryanberger/figma-patcher/actions/workflows/build.yml)

## Disclaimer

This is an educational proof-of-concept patcher for Figma. This example allows one to expand the width of the Figma properties panel sidebar.
This application does not modify any Figma files, it uses the `Electron / Chromium` debugger to inject some javascript and styling into each Figma file/page.

![demo](.github/demo.gif?raw=true)

## How to Run

Ensure you run Figma.app in remote debug mode like so:

- Close Figma
- Open your Terminal
- Type in `open /Applications/Figma.app --args --remote-debugging-port=9222` assuming that is the location of your Figma.app

Figma will now open in `remote debugging mode`.

You can now run this application binary, using the terminal:

```
- chmod +x figma-patcher-macos
- ./figma-patcher-macos
```

> Note: This is an unsigned application, you will have to enable it to run in your system preferences on macOS, and allow it on Windows

## Download Prebuilt Binaries

- [Download for macOS](https://github.com/bryanberger/figma-patcher/releases/download/latest/figma-patcher-macos)
- [Download for Windows](https://github.com/bryanberger/figma-patcher/releases/download/latest/figma-patcher-win.exe)

## Development

Install dependencies and start.

You can add additional payloads by creating a new payload javascript file in `payloads/` it will get auto-loaded and included once per file/page. Make sure these are properly formatted JS files terminated with a semicolon. There is room to improve here with a proper plugin architecture, but this is a proof-of-concept, and good enough for now.

> Note: Prefix vendor/dependency packages with an underscore in the `/payloads` folder. This ensures they are available ahead of your payloads.

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
