# Playlister Web

A Userscript Version of Playlister

## Prerequisites

- [NVM](https://github.com/nvm-sh/nvm)
- Or [ASDF](https://asdf-vm.com) with `legacy_version_file = yes`

## Build

```bash
> nvm use # or: asdf install
> npm install
> npm run package:userscript
```

## Usage

After building, copy `dist/userscript/playlister.user.js` into a userscript [manager](https://www.tampermonkey.net/).
