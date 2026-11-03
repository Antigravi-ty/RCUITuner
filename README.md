# RCUITuner

Interactive UI workbench, flat state-matrix auditor, and cross-device parameter tuner for [RCUIModule](https://github.com/Antigravi-ty/RCUIModule).

## Architecture

- `src/ui-core`: Git submodule pointing to `https://github.com/Antigravi-ty/RCUIModule.git` (`config` <- `tokens` <- `stores` <- `primitives` <- `layout` <- `compounds` <- `navigation` <- (`hud` | `charts` | `viewport` | `loading`) <- (`panels` | `recipes`)).
- `src/showcase`: Host workbench navigation, interactive sandboxes, and multi-state visual audit pages.

## Development

```bash
git submodule update --init --recursive
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```
