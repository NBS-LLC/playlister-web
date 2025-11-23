# SpotAVibe Lite

A [Userscript](https://share.google/aimode/9SnOg0rhvgdQ2t5O2) that overlays basic DJ information (bpm, key, camelot notation, etc) on the Spotify web player.

## Prerequisites

- [ASDF](https://asdf-vm.com)

## Build

```bash
> asdf install
> npm install
> npm run package:userscript
```

## Usage

After building, install it locally:

```bash
> npm run serve:userscript
```

This will launch a local http server, host the userscript and open your default browser for installation.

Once installed the http server can be stopped (ctrl+c).
