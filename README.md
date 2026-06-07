# Ragdoll Desktop Pet

Local-first Mac / Windows desktop companion for an adult ragdoll cat.

The first milestone is intentionally narrow: a transparent always-on-top desktop pet that can play spritesheet animations, be dragged, react to clicks, idle naturally, and express a weak rest nudge through motion instead of intrusive reminders.

## Locked First-Stage Stack

- Desktop shell: Electron
- Renderer: Vite + TypeScript + PixiJS
- Pet runtime: platform-independent TypeScript package
- Asset format: Petdex/OpenPets-style `pet.json` plus spritesheet assets

Electron is only the shell. Pet behavior must stay in `packages/pet-runtime` and must not import Electron.

## Project Layout

```text
apps/desktop                 Electron shell and renderer app
packages/pet-runtime         Pet state machine and behavior scheduler
packages/renderer            Reserved for a future extracted renderer package
packages/pet-assets          Default ragdoll pet asset package
packages/shared              Shared types
docs                         Agent framework, visual spec, QA checklist
```

## First Run

This workspace is configured for `pnpm`.

```bash
pnpm install
pnpm run dev
```

In this Codex workspace, a temporary pnpm CLI was used from `/private/tmp/pnpm-11.5.2/package/dist/pnpm.mjs` because the bundled Node runtime does not include a package manager.

## Stage 1 Scope

Allowed:

- Transparent borderless desktop window
- Always-on-top display
- Spritesheet animation playback
- Dragging the pet
- Click feedback
- Random idle behavior
- Weak rest nudge via animation
- Tray exit/settings entry

Forbidden:

- AI chat
- Cloud services
- Login/account systems
- Marketplace/store
- 3D models
- Video motion capture
- Auto pet generation
- Complex nurturing economy
